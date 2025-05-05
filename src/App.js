import "./App.css";
import React, { useState, useEffect, useContext, useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./Pages/LoginPage/LoginPage";
import CircularProgress from "@mui/material/CircularProgress";
import MainComponent from "./Pages/MainComponent/newMainComponent";
import { ContextDataProvider, MyContext } from "./Components/context/contextProvider";
import { fetchLink } from "./Components/fetchComponent";
import { Suspense } from 'react';
import InvalidPageComp from "./Components/invalidCredential";
import LoadingScreen from './Components/loading/3dloading';
import RoutingArray from "./appRoutings";
import { isEqualNumber } from "./Components/functions";

const AppContent = () => { 
    const [login, setLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [appLoading, setAppLoading] = useState(false);

    const { contextObj } = useContext(MyContext); 

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
                address: `authorization/userAuth`,
                headers: {
                    Authorization: Auth,
                }
            }).then(data => {
                if (data.success) {
                    const { Autheticate_Id, BranchId, BranchName, Company_id, Name, UserId, UserName, UserType, UserTypeId, session } = data.data[0];
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

    const setLoginTrue = () => setLogin(true);
    const logout = () => {
        localStorage.clear();
        setLogin(false);
        window.location = '/';
    }

    const loadingOn = () => setAppLoading(true);
    const loadingOff = () => setAppLoading(false);

    const PageRights = useMemo(() => {
        const { Read_Rights, Edit_Rights, Delete_Rights, Add_Rights, Print_Rights } = contextObj;
        return {
            ReadRights: isEqualNumber(Read_Rights, 1), 
            EditRights: isEqualNumber(Edit_Rights, 1), 
            DeleteRights: isEqualNumber(Delete_Rights, 1), 
            AddRights: isEqualNumber(Add_Rights, 1), 
            PrintRights: isEqualNumber(Print_Rights, 1),
            loadingOn, 
            loadingOff
        }
    }, [contextObj]) 

    return (
        <BrowserRouter>
            {loading ? (
                <LoadingScreen />
            ) : !login ? (
                <Routes>
                    <Route path="*" element={<LoginPage setLoginTrue={setLoginTrue} />} />
                </Routes>
            ) : (
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
                                                React.cloneElement(o.component, { ...PageRights })
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
            )}
        </BrowserRouter>
    );
}

const App = () => {
    return (
        <ContextDataProvider>
            <AppContent />
        </ContextDataProvider>
    )
}

export default App;
