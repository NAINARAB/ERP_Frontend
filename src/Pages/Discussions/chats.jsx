import React, { Fragment, useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../API';
import { useNavigate } from 'react-router-dom';
import { IconButton, MenuItem, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { Send, ArrowBackIos, Replay, Attachment } from '@mui/icons-material';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from 'react-bootstrap/Dropdown';
import axios from 'axios';

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
    const [uploadDialog, setUploadDialog] = useState(false);
    const [uploadFile, setUploadFile] = useState('');
    const [uploadPercentage, setUploadPercentage] = useState(0);


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
            }).catch(e => console.error(e));
    }, [reload])

    useEffect(() => {
        if (chatBodyRef.current) {
            const { scrollHeight, clientHeight } = chatBodyRef.current;
            chatBodyRef.current.scrollTop = scrollHeight - clientHeight;
        }
    }, [messageData]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (messageInput.trim() === '') {
            toast.warn('Enter a message');
            setMessageInput('')
            return;
        }

        try {
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
            });

            if (result.ok) {
                const data = await result.json();
                if (data.success) {
                    setReload(!reload);
                    setMessageInput('');
                } else {
                    toast.error(data.message);
                }
            } else {
                toast.error('Server Error');
            }
        } catch (e) {
            console.error(e);
            toast.error('An error occurred');
        }
    };

    const closeFileUploadDialog = () => {
        setUploadDialog(false);
        setUploadFile('')
    }

    const uploadFileFun = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('files', uploadFile);

        try {
            axios.post(`${api}files?Project_Id=${locationData?.Id}&User_Id=${parseData?.UserId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: progressEvent => {
                    let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadPercentage(percentCompleted);
                },
            }).then((data) => {
                toast.success(data.data.message);
            }).catch(e => {
                toast.error('Failed to upload')
                console.error(e)
            }).finally(() => {
                closeFileUploadDialog();
                setUploadPercentage(0);
            })
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }

    return (
        <>
            <ToastContainer />
            <div className="chat-header d-flex">
                <p className='mb-0 fa-20 text-white text-uppercase flex-grow-1'>{locationData?.Topic}</p>
                <IconButton size='small' onClick={() => navigate('/discussions')}><ArrowBackIos className='fa-18' /></IconButton>
                <IconButton size='small' onClick={() => setReload(!reload)}><Replay className='fa-18' /></IconButton>
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
                            <MenuItem key={i} className='fw-bold text-dark fa-13'>{o.Name}</MenuItem>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>
            <div className="chat-body" ref={chatBodyRef}>
                {Object.entries(messageData).map(([date, messages]) => (
                    <Fragment key={date}>
                        <div className="badge rounded-3 bg-light text-center text-dark mx-auto my-2">
                            {new Date().toDateString() === date ? 'Today' : date}
                        </div>
                        {messages.map((message) => (
                            <div
                                key={message.Id}
                                className={`messages ${Number(message?.User_Id) === Number(parseData?.UserId) ? 'message-right' : 'message-left'}`}
                            >
                                <p className={'fw-bold mb-1 text-primary fa-12'}>
                                    {Number(message?.User_Id) === Number(parseData?.UserId) ? "You" : message.Name}
                                </p>
                                <div className='fa-16 mb-2'>{message.Message}</div>
                                <p className={`fa-11 mb-0 fw-bold ${Number(message?.User_Id) === Number(parseData?.UserId) && 'text-end'} `}>
                                    {new Date(message.CreatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        ))}
                    </Fragment>
                ))}
            </div>
            <form onSubmit={handleFormSubmit}>
                <div className="chat-footer">
                    <div className="input-icon-container">
                        <input
                            className='cus-inpt rounded-5 border-0 outline-none px-3'
                            placeholder="Type a message"
                            autoFocus required
                            value={messageInput}
                            onChange={e => setMessageInput(e.target.value)}
                            onInvalid={e => e.target.setCustomValidity('Type a message')}
                            onInput={e => e.target.setCustomValidity('')}
                        />
                        <Tooltip title="Upload Files">
                            <IconButton onClick={() => setUploadDialog(true)} type='button' >
                                <Attachment />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Send Message">
                            <IconButton type='submit'>
                                <Send />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </form>

            <Dialog
                open={uploadDialog}
                onClose={closeFileUploadDialog}
                fullWidth
                maxWidth="sm" >
                <DialogTitle>Share Files</DialogTitle>
                <form onSubmit={uploadFileFun}>
                    <DialogContent>
                        <input
                            type='file'
                            className='cus-inpt ' required
                            onChange={e => setUploadFile(e.target.files[0])} />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeFileUploadDialog} type='button'>close</Button>
                        <Button onClick={uploadFileFun} disabled={uploadPercentage !== 0} type='submit'>Upload</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}

export default ChatsDisplayer;