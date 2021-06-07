import React, { useState, useEffect } from "react";
import "../styles/style.css";
import { Redirect, useHistory, Link } from "react-router-dom";
import axios from "axios";

export default function History() {
    const [dbData, setData] = useState({});
    const [message, setMessage] = useState("");
    const [tableData,setTableData] = useState({})
    const [referenceData, setReferenceData] = useState({})
    const [formData, setFormData] = useState({})
    const [update,setUpdate] = useState(true)
    const [tableName,setTableName] = useState("pembayaran")


    let history = useHistory();

    useEffect(fetchTableData, []);
    useEffect(makeNull, [tableData]);

    useEffect(initialize, [update], []);


    function fetchTableData() {
        const token = localStorage.getItem("token");
        axios({
            method: "get",
            url: "http://localhost:3001/api/petugas/crud/tableinfo/pembayaran",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                setReferenceData(response.data.reference_ids);
                delete response.data["reference_ids"];
                setTableData(response.data);
            })
            .catch((error) => {
                setMessage(error.message)
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
                url: "http://localhost:3001/api/petugas/crud/pembayaran" ,
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((response) => {
                    makeNull()
                    setMessage('')
                    setUpdate(!update)
                })
                .catch((error) => {
                    if(error.response){
                        setMessage(error.response.data)
                        console.log("error : ", error.response)
                    }
                });
            }
    }

    function makeNull() {
        Object.keys(tableData).map((key) => {
			if(tableData[key].references) {
                formData[key] = referenceData[tableData[key].references.model][0];
            }
			else formData[key] = "";
        });
        setFormData({ ...formData });
        console.log(formData)
    }

    function form() {
        var form = " ";
            try{
                form = (
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
                                            setFormData({ ...formData});
                                        }}
                                        value={formData[key]}
                                        className="form-control"
                                    ></input>
                                )}
                            </>
                        ))}
                        <br />
                        <button className="btn btn-primary" onClick={sendData}>
                            Insert
                        </button>
                    </div>
                );
            }catch(error){
               return(<h1>an error has occured</h1>)
            }

        return form;
    }

    function initialize() {
        if (!localStorage.getItem("token")) {
            localStorage.clear();
            history.push("/loginadmin");
        }
        const token = localStorage.getItem("token");
        axios({
            method: "get",
            url: "http://localhost:3001/api/petugas/history/history/history" ,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                setMessage(error.message);
            });
    }

    function crudTable() {
        //mencoba me render data table, jika tidak ada data apapun untuk di render, maka return "database kosong"
        try {
            var crudTableHead = Object.keys(dbData[0]).map((key) => (
                <th>{key}</th>
            ));

            var crudTableData = dbData.map((object) => (
                <tr>
                    {Object.keys(object).map((key) => (
                        <td>{object[key]}</td>
                    ))}
                </tr>
            ));
        } catch (e) {
            return <h3 className="text-danger padding">Database kosong</h3>;
        }

        return (
            <div className="crudTable">
                <table className="table">
                    <thead>
                        <tr>{crudTableHead}</tr>
                    </thead>
                    <tbody>{crudTableData}</tbody>
                </table>
            </div>
        );
    }

    useEffect(initialize, []);

    return (
        <>
            <nav className="navbar navbar-default">
                <div className="container-fluid">
                    <div className="navbar-header">
                        <button
                            type="button"
                            className="navbar-toggle collapsed"
                            data-toggle="collapse"
                            data-target="#bs-example-navbar-collapse-1"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Toggle navigation</span>
                            <span className="icon-bar" />
                            <span className="icon-bar" />
                            <span className="icon-bar" />
                        </button>
                        <a className="navbar-brand" href="#">
                            Home
                        </a>
                    </div>
                    <div
                        className="collapse navbar-collapse"
                        id="bs-example-navbar-collapse-1"
                    >
                        <ul className="nav navbar-nav navbar-right">
                            <li>
                                <Link to="/loginadmin">Logout</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="container-fluid">
                {crudTable()}
                {message}
                {form()}
            </div>
        </>
    );
}
