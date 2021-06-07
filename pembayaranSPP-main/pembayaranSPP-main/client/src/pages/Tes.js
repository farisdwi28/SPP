import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Tes() {
    const [tableData, setTableData] = useState({});
    const [referenceData, setReferenceData] = useState([]);
	const [formData, setFormData] = useState({});
	const [message, setMessage] = useState("")
	const tableName = "pembayaran";
	
	useEffect(fetchData, []);

    function fetchData() {
        const token = localStorage.getItem("token");
        axios({
            method: "get",
            url: "http://localhost:3001/api/crud/msc/tableinfo/" + tableName,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                setReferenceData(response.data.reference_ids);
                delete response.data["reference_ids"];
                setTableData(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
	}
	
	function sendData() {
        if(Object.keys(formData).length != Object.keys(tableData).length){
            setMessage("data Incomplete")
            console.log(formData)
        }
        else{
            const token = localStorage.getItem("token");
            axios({
                method: "post",
                data: formData,
                url: "http://localhost:3001/api/crud/" + tableName,
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((response) => {
					makeNull()
                })
                .catch((error) => {
                    if(error.response){
                        setMessage(error.response.data)
                        console.log("error : ", error.response.data)
                    }
                });
            }
    }

    function makeNull() {
        Object.keys(tableData).map((key) => {
			if(tableData[key].references) formData[key] = referenceData[tableData[key].references.model][0]
			else formData[key] = " ";
        });
        setFormData({ ...formData });
    }

    function form() {
        var form = (
            <div className="form-group col-sm-5">
                {Object.keys(tableData).map((key) => (
                    <>
                        <label> {key}</label>
                        {tableData[key].references ? (
							<select
								onChange={(ev) => {
									formData[key] = ev.target.value;
									setFormData({ ...formData });
								}}
								value={formData[key]}
								className="form-control"
							>
								{referenceData[
									tableData[key].references.model
								].map((value) => (
									<option>{value}</option>
								))}
							</select>
                        ) : (
                            <input
                                type="text"
                                onChange={(ev) => {
                                    formData[key] = ev.target.value;
                                    setFormData({ ...formData });
                                }}
                                value={formData[key]}
                                className="form-control"
                            ></input>
                        )}
                    </>
                ))}
                <br />
                <button className="btn btn-primary" onClick={makeNull}>
                    Make Null
                </button>
            </div>
        );

        return form;
    }

    return form();
}
