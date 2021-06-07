import React, { useState, useEffect } from "react";
import "../styles/style.css";
import { Redirect, useHistory, Link } from "react-router-dom";
import axios from "axios";

export default function History() {
    const [dbData, setData] = useState({});
    const [message, setMessage] = useState("");
    const [nisn,setNisn] = useState("")

    let history = useHistory();

    function initialize() {
        if (!localStorage.getItem("token") || !localStorage.getItem("nisn")) {
            localStorage.clear();
            history.push("/loginsiswa");
        }
        const token = localStorage.getItem("token");
        const nisn = localStorage.getItem("nisn");
        setNisn(nisn)
        axios({
            method: "get",
            url: "http://localhost:3001/api/siswa/history/" + nisn,
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
                            NISN : {nisn}
                        </a>
                    </div>
                    <div
                        className="collapse navbar-collapse"
                        id="bs-example-navbar-collapse-1"
                    >
                        <ul className="nav navbar-nav">
                            <li className="">
                                <Link to="/history">History</Link>
                            </li>
                            <li>
                                <a href="#">Link</a>
                            </li>
                            <li className="dropdown">
                                <a
                                    href="#"
                                    className="dropdown-toggle"
                                    data-toggle="dropdown"
                                    role="button"
                                    aria-haspopup="true"
                                    aria-expanded="false"
                                >
                                    Dropdown <span className="caret" />
                                </a>
                                <ul className="dropdown-menu">
                                    <li>
                                        <a href="#">Action</a>
                                    </li>
                                    <li>
                                        <a href="#">Another action</a>
                                    </li>
                                    <li>
                                        <a href="#">Something else here</a>
                                    </li>
                                    <li role="separator" className="divider" />
                                    <li>
                                        <a href="#">Separated link</a>
                                    </li>
                                    <li role="separator" className="divider" />
                                    <li>
                                        <a href="#">One more separated link</a>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                        <form className="navbar-form navbar-left">
                            <div className="form-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search"
                                />
                            </div>
                            <button type="submit" className="btn btn-default">
                                Submit
                            </button>
                        </form>
                        <ul className="nav navbar-nav navbar-right">
                            <li>
                                <Link to="/loginsiswa">Logout</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="container-fluid">
                {crudTable()}
                {message}
            </div>
        </>
    );
}
