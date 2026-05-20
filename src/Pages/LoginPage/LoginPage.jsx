import React, { useState } from "react";
import "./LoginPage.css";
import CircularProgress from "@mui/material/CircularProgress";
import { encryptPasswordFun } from '../../Components/functions';
import { fetchLink } from "../../Components/fetchComponent";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

function LoginPage({ setLoginTrue }) {
    const [userID, setUserID] = useState('');
    const [password, setpassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getLogin = async () => {
        const APP_Type=2;
        setIsLoading(true);
        const passHash = encryptPasswordFun(password);

        fetchLink({
            address: `authorization/login`,
            method: 'POST',
            bodyData: { username: userID, password: passHash ,APP_Type:APP_Type}
        }).then((data) => {
            if (data.success) {
                const user = data.user;
                const session = data.sessionInfo;

                localStorage.setItem("user", JSON.stringify(user));
                localStorage.setItem("session", JSON.stringify(session));
                localStorage.setItem('loginAt', new Date());

                setLoginTrue()
            } else {
                toast.error(data.message);
            }
        })
            .catch((e) => { console.log(e) })
            .finally(() => setIsLoading(false))

    };

    const dologin = (e) => {
        e.preventDefault();
        getLogin();
    }

    return (
        <div>
            <ToastContainer />
            <div className='main'>
                <div className='cntr'>
                    <div>
                        <h2 style={{ textAlign: 'center' }}>👋 Welcome Back</h2>
                        <p style={{ textAlign: 'center' }}>Sign in to your account to continue</p>
                        <div className='logform'><br />
                            <div style={{ fontSize: '23px' }}><h2 className='hedundr'>Sig</h2>n In</div>

                            <br /><br />
                            <form onSubmit={dologin}>
                                User ID
                                <input type='text' className='loginpt' value={userID} onChange={(e) => { setUserID(e.target.value) }} required autoFocus='ture' />
                                Password
                                <input type='password' className='loginpt' value={password} onChange={(e) => { setpassword(e.target.value) }} required /><br />
                                <button className='logsbmt' type='submit'>
                                    {isLoading && (
                                        <div className="overlay">
                                            <CircularProgress className="spinner" />
                                        </div>
                                    )}
                                    Sign In
                                </button>
                            </form><br />
                            <p className='para'>By Signing in you agree to the Terms of Service and Privacy Policy</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;