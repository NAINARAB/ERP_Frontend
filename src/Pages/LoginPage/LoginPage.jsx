import React, { useState } from "react";
import api from "../../API";
import logo from "../../assets/logo.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./LoginPage.css";
import CircularProgress from "@mui/material/CircularProgress";

function LoginPage({setLoginTrue}) {
  const [login, setLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");


  const doLogin = (e) => {
    e.preventDefault()
    console.log('e: ',e )
    if (user && pass) {
      fetch(`${api}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user, password: pass }),
      })
        .then((res) => res.json())
        .then((data) => {
          if(data.success) {
            const user = data.user;
            const session = data.sessionInfo;
            
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("session", JSON.stringify(session));
            
            setLoginTrue()
          } else {
            toast.error(data.message);
          }
          console.log('data: ',data);
        });
    } else {
      toast.error("data.message");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="main">
        <div className="cntr">
          <div>
            <h2 style={{ textAlign: "center" }}>👋 Welcome Back</h2>
            <p style={{ textAlign: "center" }}>
              Sign in to your account to continue
            </p>
            <div className="logform">
              <br />
              <div style={{ fontSize: "23px" }}>
                <h2 className="hedundr">Sig</h2>n In
              </div>

              <br />
              <br />
                User ID
                <input
                  type="text"
                  className="loginpt"
                  value={user}
                  onChange={(e) => {
                    setUser(e.target.value);
                  }}
                  required
                  autoFocus="ture"
                />
                Password
                <input
                  type="password"
                  className="loginpt"
                  value={pass}
                  onChange={(e) => {
                    setPass(e.target.value);
                  }}
                  required
                />
                <br />
                <button className="logsbmt" type="submit" onClick={doLogin}>
                  {loading && (
                    <div className="overlay">
                      <CircularProgress className="spinner" />
                    </div>
                  )}
                  Sign In
                </button>
              
              <br />
              <p className="para">
                By Signing in you agree to the Terms of Service and Privacy
                Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginPage;
