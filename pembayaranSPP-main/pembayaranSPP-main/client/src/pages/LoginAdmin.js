import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import "../styles/style.css";
import axios from "axios";

export default function LoginAdmin() {
    let history = useHistory();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [level, setLevel] = useState("petugas");
    const [message, setMessage] = useState("");
    const [token, setToken] = useState(() => {
        localStorage.getItem("token");
    });

    //make a request to the API
    function loginHandler() {
        axios({
            method: "post",
            url: "http://localhost:3001/api/login",
            data: {
                level: level,
                username: username,
                password: password,
            },
        })
            .then((response) => {
                if (response.data.token) {
                    setMessage("");
                    localStorage.clear();
                    localStorage.setItem("token", response.data.token);
					localStorage.setItem("level", response.data.level);
                    window.location = "/home" + response.data.level;
                } else {
                    setMessage(response.data.message);
                }
            })
            .catch((err) => {
                setMessage(err.message);
            });
    }

    useEffect(() => {
        if (!localStorage.getItem("token")) {
            //do nothing
        } else {
            const confirmed = window.confirm(
                "Apakah anda yakin ingin logout dan mengakhiri sesi?"
            );
            if (!confirmed) {
                history.push("/homeadmin");
            } else {
                localStorage.clear();
            }
        }
    }, [token]);

    return (
        <div >
            <div className="login-grid">
                <form className="login-form">
                    <h3>Login</h3>
                    <br />
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="username"
                            className="form-control"
                            id="username"
                            placeholder="Enter username"
                            value={username}
                            onChange={(ev) => setUsername(ev.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Password"
                            value={password}
                            onChange={(ev) => setPassword(ev.target.value)}
                        />
                    </div>
                    <label htmlFor="priv-level">Pilih Level</label>
                    <div
                        onChange={(ev) => setLevel(ev.target.value)}
                        className="login-select-priv"
                        id="priv-level"
                    >
                        <div className="radio">
                            <label>
                                <input
                                    type="radio"
                                    name="optionsRadios"
                                    id="optionsRadios1"
                                    value="petugas"
                                    defaultChecked={true}
                                />
                                Petugas
                            </label>
                        </div>
                        <div className="radio">
                            <label>
                                <input
                                    type="radio"
                                    name="optionsRadios"
                                    id="optionsRadios2"
                                    value="admin"
                                />
                                Admin
                            </label>
                        </div>
                    </div>
                    <p className="text-danger">{message}</p>
                    <button
                        type="button"
                        className="btn btn-primary"
                        onClick={loginHandler}
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}
