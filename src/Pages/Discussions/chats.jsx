import React, { Fragment, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../API';
import { useNavigate } from 'react-router-dom';
import { IconButton, MenuItem } from '@mui/material';
import { Send, ArrowBackIos, Replay } from '@mui/icons-material';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from 'react-bootstrap/Dropdown';

const ChatsDisplayer = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const location = useLocation();
    const locationData = location.state;
    const navigate = useNavigate();
    const [messageData, setMessageData] = useState([]);
    const chatBodyRef = useRef(null);
    const [messageInput, setMessageInput] = useState('');
    const [reload, setReload] = useState(false);
    console.log(locationData)


    useEffect(() => {
        if (!locationData) {
            return navigate('/discussions')
        }
        fetch(`${api}messages?Topic_Id=${locationData?.Id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const groupedData = data.data.reduce((acc, message) => {
                        const date = new Date(message.CreatedAt).toDateString();
                        if (!acc[date]) {
                            acc[date] = [];
                        }
                        acc[date].push(message);
                        return acc;
                    }, {});
                    setMessageData(groupedData);
                }
            })
    }, [reload])

    useEffect(() => {
        if (chatBodyRef.current) {
            const { scrollHeight, clientHeight } = chatBodyRef.current;
            chatBodyRef.current.scrollTop = scrollHeight - clientHeight;
        }
    }, [messageData]);

    const sendMessage = async () => {
        if (String(messageInput)) {
            const result = await fetch(`${api}messages`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    Topic_Id: locationData?.Id,
                    User_Id: parseData?.UserId,
                    Message: messageInput
                })
            })
            if (result.ok) {
                const data = await result.json();
                if (data.success) {
                    setReload(!reload);
                    setMessageInput('')
                } else {
                    toast.error(data.message);
                }
            } else {
                toast.error('Server Error');
            }
        }
    }

    return (
        <>
            <ToastContainer />
            <div className="chat-header d-flex">
                <p className='mb-0 fa-20 text-white text-uppercase flex-grow-1'>{locationData?.Topic}</p>
                <IconButton size='small' onClick={() => navigate('/discussions')}><ArrowBackIos /></IconButton>
                <IconButton size='small' onClick={() => setReload(!reload)}><Replay /></IconButton>
                <Dropdown>
                    <Dropdown.Toggle
                        variant="success"
                        id="actions"
                        className="rounded-5 bg-transparent text-muted fa-18 border-0 btn"
                    >
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <MenuItem>
                            Team
                        </MenuItem>
                        {locationData?.InvolvedUsers.map((o, i) => (
                            <MenuItem key={i} onClick={() => {}} className='fw-bold text-dark fa-13'>{o.Name}</MenuItem>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div className="chat-body" ref={chatBodyRef}>
                {Object.entries(messageData).map(([date, messages]) => (
                    <Fragment key={date}>
                        <div className="badge rounded-3 bg-light text-center text-dark mx-auto my-2">{date}</div>
                        {messages.map((message) => (
                            <div
                                key={message.Id}
                                className={`messages ${Number(message?.User_Id) === Number(parseData?.UserId) ? 'message-right' : 'message-left'}`}
                            >
                                <span className='fw-bold text-primary fa-12'>
                                    {Number(message?.User_Id) === Number(parseData?.UserId) ? "You" : message.Name}
                                </span>
                                <div className='fa-16'>{message.Message}</div>
                                <span className='fa-11 fw-bold'>
                                    {new Date(message.CreatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))}
                    </Fragment>
                ))}
            </div>
            <div className="chat-footer">
                <div className="input-icon-container">
                    <input
                        className='cus-inpt rounded-5 px-3'
                        placeholder="Type a message"
                        autoFocus
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                    />
                    <IconButton className="send-icon" onClick={messageInput !== '' ? sendMessage : () => toast.warn('Enter message')}>
                        <Send />
                    </IconButton>
                </div>
            </div>
        </>
    )
}

export default ChatsDisplayer;