import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SideBar from "./Components/SideBar/SideBar";
import LoginPage from "./Pages/LoginPage/LoginPage";
import Dashboard from "./Pages/Dashboard/Dashboard";
import api from "./API";
import CircularProgress from "@mui/material/CircularProgress";

function App() {
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (localStorage.getItem("user")) {
      const user = JSON.parse(localStorage.getItem("user"));
      setLoading(true)
      if (user.Autheticate_Id) {
        fetch(`${api}authentication?AuthId=${user.Autheticate_Id}`)
          .then((response) => response.json())
          .then((auth) => {
            setLoading(false)
            setLogin(auth?.isValidUser);
          });
      }
    } else {
      setLoading(false)
    }
  }, []);

  const setLoginTrue = () => {
    setLogin(true);
  };


  return (
    <>
      <BrowserRouter>
        {loading ? (
          <div className="overlay">
            <CircularProgress className="spinner" />
          </div>
        ) : !login ? (
          <>
            <Routes>
              <Route
                exact
                path="/"
                element={<LoginPage setLoginTrue={setLoginTrue} />}
              ></Route>
            </Routes>
          </>
        ) : (
          <>
            <Routes>
              <Route path="*" element={<Dashboard />}></Route>
              <Route path="/" element={<Dashboard />}></Route>
            </Routes>
          </>
        )}
      </BrowserRouter>
    </>
  );
}

export default App;
