import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage/LoginPage";
import api from "./API";
import CircularProgress from "@mui/material/CircularProgress";
import MainComponent from "./Pages/MainComponent/MainComponent";
import CompanyInfo from "./Pages/Masters/CompanyInfo"
import Users from "./Pages/Masters/Users";

function App() {
  const [login, setLogin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem("user")) {
      const user = JSON.parse(localStorage.getItem("user"));
      setLoading(true);
      if (user.Autheticate_Id) {
        fetch(`${api}authentication?AuthId=${user.Autheticate_Id}`)
          .then((response) => response.json())
          .then((auth) => {
            setLoading(false);
            setLogin(auth?.isValidUser);
          })
          .catch((e) => {
            console.error(e);
            setLoading(false);
          });
      }
    } else {
      setLoading(false);
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
          <MainComponent>
            <Routes>
              <Route path="/CompanyInfo" element={<CompanyInfo />}></Route>
              <Route path="/users" element={<Users />}></Route>
            </Routes>
          </MainComponent>
        )}
      </BrowserRouter>
    </>
  );
}

export default App;
