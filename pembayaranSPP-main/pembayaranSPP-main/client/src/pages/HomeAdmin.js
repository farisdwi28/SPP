import React, { useState, useEffect } from "react";
import "../styles/style.css";
import { Redirect, useHistory, Link } from "react-router-dom";
import axios from "axios";

export default function Home() {
    const [tableName, setTableName] = useState("kelas");
    const [dbData, setDbData] = useState([{}]);
    const [message, setMessage] = useState("");
    const [crudElement, setCrudElement] = useState("");
    const [update, setUpdate] = useState(false);
    const [tableData, setTableData] = useState({});
    const [referenceData, setReferenceData] = useState([]);
    const [formData, setFormData] = useState({});
    const [editData, setEditData] = useState({});
    const [display, setDisplay] = useState(0);
    const [curDisplay, setCurDisplay] = useState(["none", "box"])

	
	useEffect(fetchTableData, [tableName], []);

    function fetchTableData() {
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
        if(localStorage.level == "admin"){
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
                <h1>an error has occured</h1>
            }
        }

        return form;
    }

    let history = useHistory();


    //fetch data for CRUD
    function fetchData() {
        if (
            !localStorage.getItem("token") &&
            (localStorage.getItem("level") != "petugas" ||
                localStorage.getItem("level") != "admin")
        ) {
            history.push("/loginadmin");
        }
        const token = localStorage.getItem("token");
        setFormData({})
        axios({
            method: "get",
            url: "http://localhost:3001/api/crud/" + tableName,
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                setMessage("");
                setDbData(response.data);
            })
            .catch((error) => {
                setMessage(error.message);
                if ((error.response && error.response.status == 401)) {
                    localStorage.clear();
                    history.push("/loginadmin");
                }
                

            });
    }

    function updateData() {
        makeNull()
        setCrudElement(crudTable);
    }

    //lakukan request ke backend setiap kali tablename diganti atau dipaksa update oleh variabel update
    useEffect(fetchData, [tableName, update], []);

    //update isi table setiap kali ada perubahan di state dbData
    useEffect(updateData, [dbData], []);

    //fungsi menghapus data
    function Drop(fieldname, id) {
        const confirmed = window.confirm(
            `Apakah anda yakin ingin menghapus data dengan ${fieldname} : ${id} ?`
        );

        var data_to_send = {
            where_id: id,
        };

        if (confirmed) {
            const token = localStorage.getItem("token");
            axios({
                method: "delete",
                data: data_to_send,
                url: "http://localhost:3001/api/crud/" + tableName,
                headers: { Authorization: `Bearer ${token}` },
            })
                .then(() => {
                    setUpdate(!update);
                })
                .catch((error) => {
                    if(error.response){
                        console.log(error.response)
                        setMessage(error.response.data);
                    }
                });
        }
    }

    //render the crud table element
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
                    <a
                        className="btn btn-sm btn-danger btn-padding"
                        onClick={(ev) =>
                            Drop(
                                Object.keys(object)[0],
                                object[Object.keys(object)[0]]
                            )
                        }
                    >
                        {" "}
                        Delete{" "}
                    </a>
                </tr>
            ));
        } catch (e) {
            return <h3 className="text-danger padding">Database kosong</h3>;
        }

        return (
            <div className="crudTable">
                <table className="table">
                    <thead>
                        <tr>
                            {crudTableHead}
                            <th colspan="2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>{crudTableData}</tbody>
                </table>
            </div>
        );
    }

    
    return (
        <>
        <div>
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
                <div onChange={(ev) => setTableName(ev.target.value)}>
                    <label class="radio-inline">
                        <input
                            type="radio"
                            name="inlineRadioOptions"
                            defaultChecked={tableName == "kelas"}
                            value="kelas"
                        />{" "}
                        Kelas
                    </label>
                    <label class="radio-inline">
                        <input
                            type="radio"
                            name="inlineRadioOptions"
                            defaultChecked={tableName == "pembayaran"}
                            value="pembayaran"
                        />{" "}
                        Pembayaran
                    </label>
                    <label class="radio-inline">
                        <input
                            type="radio"
                            name="inlineRadioOptions"
                            defaultChecked={tableName == "petugas"}
                            value="petugas"
                        />{" "}
                        Petugas
                    </label>
                    <label class="radio-inline">
                        <input
                            type="radio"
                            name="inlineRadioOptions"
                            defaultChecked={tableName == "siswa"}
                            value="siswa"
                        />{" "}
                        Siswa
                    </label>
                    <label class="radio-inline">
                        <input
                            type="radio"
                            name="inlineRadioOptions"
                            defaultChecked={tableName == "spp"}
                            value="spp"
                        />{" "}
                        SPP
                    </label>
                </div>
                {crudElement}
                <p className="text-danger">{message}</p>
                <br/>
                {form()}
            </div>
            
        </div>
        </>
    );
}
