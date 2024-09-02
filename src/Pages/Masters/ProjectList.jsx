import React, { useState, useEffect, Fragment, useContext } from "react";
import { Table, Button } from "react-bootstrap";
import { IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button as MuiButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MyContext } from "../../Components/context/contextProvider";
import InvalidPageComp from "../../Components/invalidCredential";
import { fetchLink } from "../../Components/fetchComponent";
import { ISOString } from '../../Components/functions'


const ProjectList = () => {
    const [projectData, setProjectData] = useState([]);
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);
    const initialState = {
        Project_Id: '',
        Project_Name: '',
        Project_Desc: '',
        Project_Head: '',
        Est_Start_Dt: ISOString(),
        Est_End_Dt: ISOString(),
        Project_Status: '',
        Entry_By: parseData?.UserId,
        Company_id: parseData?.Company_id
    };
    const [inputValue, setInputValue] = useState(initialState);
    const [screen, setScreen] = useState(false)
    const [isEdit, setIsEdit] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [proStatus, setProStatus] = useState([]);
    const [projectHead, setProjectHead] = useState([]);
    const [reload, setReload] = useState(false);
    const { contextObj } = useContext(MyContext)

    useEffect(() => {
        fetchLink({
            address: `taskManagement/project?Company_id=${parseData?.Company_id}`
        }).then((data) => {
            if (data.success) {
                setProjectData(data.data);
            }
        });
    }, [reload, parseData?.Company_id]);

    useEffect(() => {
        fetchLink({
            address: `taskManagement/statusList`
        }).then(data => {
            if (data.success) {
                setProStatus(data.data)
            }
        })
    }, [])

    useEffect(() => {
        fetchLink({
            address: `masters/users/employee/dropDown?Company_id=${parseData?.Company_id}`
        }).then(data => {
            setProjectHead(data.success ? data.data : [])
        }).catch(e => console.error('Fetch Error:', e));
    }, [parseData?.Company_id])

    const input = [
        {
            label: 'Project Name',
            elem: 'input',
            type: 'text',
            event: (e) => setInputValue({ ...inputValue, Project_Name: e.target.value }),
            required: true,
            value: inputValue?.Project_Name,
        },
        {
            label: "Project Head",
            elem: "select",
            options: [...projectHead.map(obj => ({ value: obj?.UserId, label: obj?.Name }))],
            event: (e) => setInputValue({ ...inputValue, Project_Head: e.target.value }),
            required: true,
            value: inputValue?.Project_Head,
        },
        {
            label: 'Estimated Start Date',
            elem: 'input',
            type: 'date',
            event: (e) => setInputValue({ ...inputValue, Est_Start_Dt: e.target.value }),
            required: true,
            value: inputValue?.Est_Start_Dt,
        },
        {
            label: 'Estimated End Date',
            elem: 'input',
            type: 'date',
            event: (e) => setInputValue({ ...inputValue, Est_End_Dt: e.target.value }),
            required: true,
            value: inputValue?.Est_End_Dt,
        },
        {
            label: 'Project Status',
            elem: 'select',
            options: [...proStatus?.map(obj => ({ value: obj.Status_Id, label: obj.Status }))],
            event: (e) => setInputValue({ ...inputValue, Project_Status: e.target.value }),
            required: true,
            value: inputValue?.Project_Status,
        },
        {
            label: 'Description',
            elem: 'textarea',
            type: 'text',
            event: (e) => setInputValue({ ...inputValue, Project_Desc: e.target.value }),
            required: true,
            value: inputValue?.Project_Desc,
        },
    ]

    const switchScreen = () => {
        setInputValue(initialState)
        setScreen(!screen); setIsEdit(false)
    }

    const setEditRow = (row) => {
        switchScreen(true); 
        setInputValue({
            ...row, 
            Est_Start_Dt: row.Est_Start_Dt ? ISOString(row.Est_Start_Dt) : '',
            Est_End_Dt: row.Est_End_Dt ? ISOString(row.Est_End_Dt) : ''
        }); 
        setIsEdit(true)
    }

    const setDeleteRow = (row) => {
        setDeleteDialog(!deleteDialog); setInputValue(row);
    }

    const createFun = () => {
        fetchLink({
            address: `taskManagement/project`,
            method: 'POST',
            bodyData: inputValue,
        }).then(data => {
            if (data.success) {
                switchScreen(false);
                setReload(!reload)
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error('Fetch Error:', e));
    }

    const editFun = () => {
        fetchLink({
            address: `taskManagement/project`,
            method: 'PUT',
            bodyData: inputValue,
        }).then(data => {
            if (data.success) {
                switchScreen(false);
                setReload(!reload)
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error('Fetch Error:', e));
    }

    const deleteFun = () => {
        fetchLink({
            address: `taskManagement/project`,
            method: 'DELETE',
            bodyData: { Project_Id: inputValue?.Project_Id },
        }).then(data => {
            if (data.success) {
                setReload(!reload);
                toast.success(data.message); setInputValue(initialState); setDeleteDialog(false);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error('Fetch Error:', e));
    }


    return Number(contextObj?.Read_Rights) === 1 ? (
        <Fragment>
            {!screen ? (
                <div className="card">
                    <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                        Projects
                        {Number(contextObj?.Add_Rights) === 1 && (
                            <div className="text-end">
                                <Button onClick={() => switchScreen(false)} className="rounded-5 px-3 py-1 fa-13 shadow">{!screen ? 'Create Project' : 'Back'}</Button>
                            </div>
                        )}
                    </div>
                    <div className="card-body">
                        <div className="table-responsive">
                            <Table>
                                <thead>
                                    <tr>
                                        <th className="fa-14">S.No</th>
                                        <th className="fa-14">Project</th>
                                        <th className="fa-14">Description</th>
                                        <th className="fa-14">Head</th>
                                        <th className="fa-14">Start At</th>
                                        <th className="fa-14">End At</th>
                                        {(Number(contextObj?.Edit_Rights) === 1 || Number(contextObj?.Delete_Rights) === 1) && <th className="fa-14">Action</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {projectData.map((obj, index) => (
                                        <tr key={index}>
                                            <td className="fa-12">{index + 1}</td>
                                            <td className="fa-12">{obj?.Project_Name}</td>
                                            <td className="fa-12">{obj?.Project_Desc ? obj?.Project_Desc : ' - '}</td>
                                            <td className="fa-12">{obj?.Project_Head_Name}</td>
                                            <td className="fa-12">
                                                {new Date(obj?.Est_Start_Dt).toLocaleDateString("en-IN")}
                                            </td>
                                            <td style={{ fontSize: "12px" }}>
                                                {new Date(obj?.Est_End_Dt).toLocaleDateString("en-IN")}
                                            </td>
                                            {(Number(contextObj?.Edit_Rights) === 1 || Number(contextObj?.Delete_Rights) === 1) && <td>
                                                {Number(contextObj?.Edit_Rights) === 1 && (
                                                    <IconButton onClick={() => { setEditRow(obj) }} size='small'><Edit className="fa-in" /></IconButton>
                                                )}
                                                {Number(contextObj?.Delete_Rights) === 1 && (
                                                    <IconButton onClick={() => { setDeleteRow(obj) }} size='small'><Delete className="fa-in del-red" /></IconButton>
                                                )}
                                            </td>}
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                        {isEdit ? "Edit Projects" : 'Create Project'}
                        <div className="text-end">
                            <Button onClick={() => switchScreen(false)} className="rounded-5 px-3 py-1 fa-13 shadow">{'Back'}</Button>
                        </div>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {input.map((field, index) => (
                                <div key={index} className="col-lg-4 col-md-6 p-2 px-3">
                                    <label>{field.label}</label>
                                    {field.elem === 'input' ? (
                                        <input
                                            type={field.type || 'text'}
                                            className={'cus-inpt'}
                                            onChange={field.event}
                                            onInput={field.oninput}
                                            disabled={field.disabled}
                                            value={field.value}

                                        />
                                    ) : field.elem === 'select' ? (
                                        <select
                                            className={'cus-inpt'}
                                            onChange={field.event}
                                            value={field.value}>
                                            <option value={''}>select</option>
                                            {field.options.map((option, optionIndex) => (
                                                <option key={optionIndex} value={option.value} disabled={option.disabled} defaultValue={option.selected}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.elem === 'textarea' ? (
                                        <textarea
                                            className={'cus-inpt'}
                                            onChange={field.event}
                                            rows={4} value={field.value}>
                                        </textarea>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="card-footer d-flex justify-content-end bg-white">
                        <Button onClick={() => { switchScreen(false) }} className="rounded-5 px-4 mx-1 btn-light bg-white">{'Cancel'}</Button>
                        <Button onClick={isEdit ? editFun : createFun} className="rounded-5 px-4 shadow mx-1">{isEdit ? 'Update' : 'Create Project'}</Button>
                    </div>
                </div>
            )}

            <Dialog
                open={deleteDialog}
                onClose={setDeleteRow}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirmation"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <b  >{`Do you want to delete the ${inputValue?.Project_Name && inputValue?.Project_Name} Branch?`}</b>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={setDeleteRow}>Cancel</MuiButton>
                    <MuiButton onClick={deleteFun} autoFocus sx={{ color: 'red' }}>
                        Delete
                    </MuiButton>
                </DialogActions>
            </Dialog>

        </Fragment>
    ) : <InvalidPageComp />
}

export default ProjectList;
