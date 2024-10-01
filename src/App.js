import "./App.css";
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage/LoginPage";
import CircularProgress from "@mui/material/CircularProgress";
import MainComponent from "./Pages/MainComponent/newMainComponent";
import { ContextDataProvider } from "./Components/context/contextProvider";
import { fetchLink } from "./Components/fetchComponent";
import { Suspense } from 'react';
import InvalidPageComp from "./Components/invalidCredential";
import LoadingScreen from './Components/loading/3dloading'

import RoutingArray from "./appRoutings"


const App = () => {
    const [login, setLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [appLoading, setAppLoading] = useState(false);
    const parseData = JSON.parse(localStorage.getItem("user"));
    const queryParams = new URLSearchParams(window.location.search);
    const Auth = queryParams.get('Auth') || parseData?.Autheticate_Id;

    const clearQueryParameters = () => {
        const newUrl = window.location.pathname;
        window.history.pushState({}, document.title, newUrl);
        setLoading(false);
    };

    useEffect(() => {
        if (Auth) {
            setLoading(true);
            fetchLink({
                address: `authorization/userAuth?Auth=${Auth}`,
                headers: {
                    Authorization: Auth,
                }
            }).then(data => {
                if (data.success) {
                    const { Autheticate_Id, BranchId, BranchName, Company_id, Name, UserId, UserName, UserType, UserTypeId, session } = data.data[0]
                    const user = {
                        Autheticate_Id, BranchId, BranchName, Company_id, Name, UserId, UserName, UserType, UserTypeId
                    }
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('session', JSON.stringify(session[0]));
                    setLogin(true);
                }
            }).catch(e => console.error(e)).finally(clearQueryParameters)
        }
    }, [Auth]);

    const setLoginTrue = () => {
        setLogin(true);
    };

    const logout = () => {
        localStorage.clear();
        setLogin(false);
        window.location = '/'
    }

    const loadingOn = () => setAppLoading(true)
    const loadingOff = () => setAppLoading(false)

    return (
        <>
            <BrowserRouter>
                {loading ? (
                    <LoadingScreen />
                ) : !login ? (
                    <>
                        <Routes>
                            <Route exact path="*" element={<LoginPage setLoginTrue={setLoginTrue} />} />
                        </Routes>
                    </>
                ) : (
                    <ContextDataProvider>
                        <MainComponent logout={logout}>
                            <React.Fragment>
                                <Suspense fallback={<div className="overlay"><CircularProgress className="spinner" /></div>}>
                                    <Routes>
                                        {RoutingArray.map((o, i) => (
                                            <Route
                                                path={o.path}
                                                key={i}
                                                element={
                                                    React.isValidElement(o.component) ? (
                                                        React.cloneElement(o.component, { loadingOn, loadingOff })
                                                    ) : <></>
                                                }
                                            />
                                        ))}
                                        <Route path="/invalid-credentials" element={<InvalidPageComp />} />
                                        <Route path="*" element={<InvalidPageComp message={'404 Page Not Found'} />} />
                                    </Routes>
                                </Suspense>
                                {appLoading && (
                                    <div className="overlay">
                                        <CircularProgress className="spinner" />
                                    </div>
                                )}
                            </React.Fragment>
                        </MainComponent>
                    </ContextDataProvider>
                )}
            </BrowserRouter>
        </>
    );
}

export default App;
