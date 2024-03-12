import { useEffect, useState, useContext } from "react";
import api from "../../API";
import { People, Message, Launch, Edit, Delete, GroupAdd, Article } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, MenuItem, Tooltip } from '@mui/material';
import { MyContext } from "../../Components/context/contextProvider";
import InvalidPageComp from "../../Components/invalidCredential";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Dropdown from 'react-bootstrap/Dropdown';

import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useNavigate } from 'react-router-dom';


const topicInitialValue = {
    Description: '',
    Id: "",
    Topic: ""
}

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

const Discussions = () => {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const [myDiscussions, setMyDiscussions] = useState([]);
    const [createDialog, setCreateDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [teamDialog, setTeamDialog] = useState(false);
    const [inputValue, setInputValue] = useState(topicInitialValue);
    const [currentTeam, setCurerntTeam] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const { contextObj } = useContext(MyContext);
    const [reload, setReload] = useState(false);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();


    useEffect(() => {
        fetch(`${api}discussionTopic?UserId=${parseData?.UserId}&UserTypeId=${parseData?.UserTypeId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const temp = [];
                    data.data.map(o => {
                        o?.InvolvedUsers?.map(obj => {
                            if (Number(obj?.UserId) === Number(parseData?.UserId)) {
                                temp.push(o)
                            }
                        })
                    })
                    setMyDiscussions((Number(parseData.UserTypeId) === 0 || Number(parseData.UserTypeId) === 1) ? data?.data : temp)
                }
            })
    }, [reload])

    useEffect(() => {
        fetch(`${api}userName?AllUser=${true}&BranchId=${parseData?.BranchId}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUsers(data.data)
                }
            }).catch(e => console.error(e))
    }, [])

    const closeCreateDialog = () => {
        setCreateDialog(false);
        setInputValue(topicInitialValue);
        setIsEdit(false)
    }

    const closeDeleteDialog = () => {
        setDeleteDialog(false);
        setInputValue(topicInitialValue);
    }

    const closeTeamDialog = () => {
        setTeamDialog(false);
        setCurerntTeam({})
    }

    const setUpdate = (row) => {
        setIsEdit(true);
        setInputValue(row);
        setCreateDialog(true);
    }

    const setDelete = (row) => {
        setDeleteDialog(true);
        setInputValue(row);
    }

    const setTeamData = (row) => {
        setCurerntTeam(row);
        setTeamDialog(true);
    }

    const postTopic = async () => {
        if (Number(contextObj?.Add_Rights) === 1) {
            const result = await fetch(`${api}discussionTopic`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputValue)
            })
            if (result.ok) {
                const data = await result.json();
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    closeCreateDialog();
                } else {
                    toast.error(data.message);
                }
            } else {
                toast.error('Server Error');
            }
        }
    }

    const putTopic = async () => {
        if (inputValue?.Id && Number(contextObj?.Edit_Rights) === 1) {
            const result = await fetch(`${api}discussionTopic`, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputValue)
            })
            if (result.ok) {
                const data = await result.json();
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    closeCreateDialog();
                } else {
                    toast.error(data.message);
                }
            } else {
                toast.error('Server Error');
            }
        }
    }

    const deleteTopic = async () => {
        if (inputValue?.Id && Number(contextObj?.Delete_Rights) === 1) {
            const result = await fetch(`${api}discussionTopic`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(inputValue)
            })
            if (result.ok) {
                const data = await result.json();
                if (data.success) {
                    toast.success(data.message);
                    closeDeleteDialog();
                    setReload(!reload);
                } else {
                    toast.error(data.message);
                }
            } else {
                toast.error('Server Error');
            }
        }
    }

    const postTeamMembers = async () => {
        if (Number(contextObj?.Add_Rights) === 1) {
            const result = await fetch(`${api}modifyTeam`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ Teams: currentTeam?.InvolvedUsers, Topic_Id: currentTeam?.Id })
            })
            if (result.ok) {
                const data = await result.json();
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    closeTeamDialog();
                } else {
                    toast.error(data.message);
                }
            } else {
                toast.error('Server Error');
            }
        }
    }

    return Number(contextObj.Read_Rights) === 1 ? (
        <>
            <ToastContainer />
            <div className="cus-card">
                <div className="p-3">
                    <div className="d-flex mb-4 ">
                        <p className="fw-bold fa-18 px-2 flex-grow-1">Topics</p>
                        <button className="btn btn-primary rounded-5 px-3 fa-13 shadow" onClick={() => setCreateDialog(true)}>
                            Create Topic
                        </button>
                    </div>
                    {myDiscussions.length > 0 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <td className="d-none"></td>
                                    <td className="d-none"></td>
                                    <td className="d-none"></td>
                                    <td className="d-none"></td>
                                    <td className="d-none"></td>
                                </tr>
                            </thead>
                            <tbody>
                                {myDiscussions.map((o, i) => (
                                    <tr key={i}>
                                        <td className="fa-14 border-0" >
                                            <div className="d-flex align-items-start justify-content-center flex-column">
                                                <p
                                                    className={`mb-0 fw-bold fa-14 under-blue ${Number(o?.Project_Id) === 0 ? 'text-primary' : 'text-secondary'}`}>
                                                    {o?.Topic}
                                                </p>
                                                <p className="mb-0 py-2 text-muted">
                                                    {o?.Description}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="fa-14 text-center border-0" >
                                            <Tooltip title="Team Size">
                                                <People className="fa-18 text-primary mx-1" /> {o?.InvolvedUsersCount}
                                            </Tooltip>
                                        </td>
                                        <td className="fa-14 text-center border-0" >
                                            <Tooltip title="Messages Count">
                                                <Message className="fa-18 text-primary mx-1" /> {o?.TotalMessages}
                                            </Tooltip>
                                        </td>
                                        <td className="fa-14 border-0">
                                            {/* <CalendarMonth className="fa-16 text-primary me-1" />
                                            <div className="badge bg-light text-muted rounded-4 px-3">
                                                {" " + new Date(o?.CreatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                            </div> */}
                                            <Tooltip title="Documents Shared">
                                                <Article className="fa-18 text-primary me-1" /> {" " + o?.DocumentsShared}
                                            </Tooltip>
                                        </td>
                                        <td className="fa-14 border-0">
                                            <Dropdown>
                                                <Dropdown.Toggle
                                                    variant="success"
                                                    id="actions"
                                                    className="rounded-5 bg-transparent text-dark border-0 btn"
                                                >
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    {Number(contextObj.Edit_Rights) === 1 && (
                                                        <MenuItem onClick={() => setTeamData(o)}>
                                                            <GroupAdd className="fa-in text-primary me-2" /> Manage Team
                                                        </MenuItem>
                                                    )}
                                                    {(Number(contextObj.Edit_Rights) === 1 && Number(o?.Project_Id) === 0) && (
                                                        <MenuItem onClick={() => setUpdate(o)}>
                                                            <Edit className="fa-in me-2" /> Edit
                                                        </MenuItem>
                                                    )}
                                                    {(Number(contextObj.Delete_Rights) === 1 && Number(o?.Project_Id) === 0) && (
                                                        <MenuItem onClick={() => setDelete(o)}>
                                                            <Delete className="fa-in me-2 text-danger" /> Delete
                                                        </ MenuItem>
                                                    )}
                                                    <MenuItem onClick={() => navigate('chats', { state: o })}>
                                                        <Launch className="fa-in me-2 text-primary" />
                                                        Open Chats
                                                    </MenuItem>

                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <h5 className="text-center mb-5">
                            {
                                (Number(parseData.UserTypeId) === 0 || Number(parseData.UserTypeId) === 1)
                                    ? 'No Topics Available'
                                    : 'You are not involved in any discussion'
                            }
                        </h5>
                    )}
                </div>
            </div>

            <Dialog
                open={createDialog}
                onClose={closeCreateDialog}>
                <DialogTitle>{!isEdit ? 'Create Discussion Topic' : 'Modify Topic'}</DialogTitle>
                <DialogContent>
                    <table className="table">
                        <tbody>
                            <tr>
                                <td className="border-0">Topic</td>
                                <td className="border-0">
                                    <input
                                        className="cus-inpt"
                                        onChange={e => setInputValue({ ...inputValue, Topic: e.target.value })}
                                        value={inputValue.Topic} maxLength={100} placeholder="ex: Morning Activiey" autoFocus
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-0">Describtion</td>
                                <td className="border-0">
                                    <textarea
                                        className="cus-inpt"
                                        value={inputValue.Description}
                                        rows={5} maxLength={300} placeholder="maximum 300 character"
                                        onChange={e => setInputValue({ ...inputValue, Description: e.target.value })} />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeCreateDialog}>Close</Button>
                    <Button
                        onClick={isEdit
                            ? putTopic
                            : postTopic}>
                        {isEdit ? "Update" : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialog}
                onClose={closeDeleteDialog}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>Do you want to delete the <span className="text-primary fw-bold">{inputValue?.Topic}</span> Topic?</DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog}>Close</Button>
                    <Button
                        onClick={deleteTopic} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>


            <Dialog
                open={teamDialog}
                onClose={closeTeamDialog} >
                <DialogTitle>Manage Team</DialogTitle>
                <DialogContent style={{ minWidth: '350px', minHeight: '50px' }}>
                    <Autocomplete
                        multiple
                        id="checkboxes-tags-demo"
                        options={users}
                        disableCloseOnSelect
                        getOptionLabel={(option) => option?.Name}
                        value={currentTeam?.InvolvedUsers || []}
                        onChange={(f, e) => setCurerntTeam({ ...currentTeam, InvolvedUsers: e })}
                        renderOption={(props, option, { selected }) => (
                            <li {...props}>
                                <Checkbox
                                    icon={icon}
                                    checkedIcon={checkedIcon}
                                    style={{ marginRight: 8 }}
                                    checked={selected}
                                />
                                {option?.Name}
                            </li>
                        )}
                        style={{ width: 300 }} className="p-4"
                        isOptionEqualToValue={(opt, val) => opt?.UserId === val?.UserId}
                        renderInput={(params) => (
                            <TextField {...params} label="Users" placeholder="Select Team Members" />
                        )}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeTeamDialog}>Close</Button>
                    <Button
                        color="success"
                        onClick={postTeamMembers}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    ) : <InvalidPageComp />;
}

export default Discussions;