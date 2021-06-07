import React, { useState } from "react";
import "../styles/style.css";
import { Redirect, useHistory } from "react-router-dom";
import axios from "axios";

export default function LoginSiswa() {
    let history = useHistory();

    const [NISN, setNISN] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    //make a request to the API
    function loginHandler() {
        axios({
            method: "post",
            url: "http://localhost:3001/api/login",
            data: {
                level: "siswa",
                username: NISN,
                password: password,
            },
        }).then((response) => {
            if (response.data.token) {
                setMessage("");
                localStorage.setItem("nisn", response.data.nisn)
                localStorage.setItem("token", response.data.token)
                localStorage.setItem("level", response.data.level)
                history.push("/history");
            } else {
                setMessage(response.data.message);
            }
        });
    }

    return (
        <div>
            <div className="login-grid">
                <form className="login-form">
                    <h3>Login</h3>
                    <br />
                    <div className="form-group">
                        <label htmlFor="NISN">NISN</label>
                        <input
                            type="text"
                            className="form-control"
                            id="NISN"
                            placeholder="Enter NISN"
                            value={NISN}
                            onChange={(ev) => setNISN(ev.target.value)}
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
