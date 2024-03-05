import React, { useState, useEffect, useContext } from "react";
import { Table, Button } from "react-bootstrap";
import api from "../../API";
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button as MuiButton, Chip } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MyContext } from "../../Components/context/contextProvider";
import InvalidPageComp from "../../Components/invalidCredential";

const initialState = {
    Base_Group_Id: '',
    Base_Group_Name: '',
}

const BaseGroup = () => {
    const [baseGropup, setBaseGroup] = useState([])
    const [open, setOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false)
    const [inputValue, setInputValue] = useState(initialState)
    const [reload, setReload] = useState(false);
    const { contextObj } = useContext(MyContext);


    useEffect(() => {
        fetch(`${api}baseGroup`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setBaseGroup(data.data)
                }
            })
    }, [reload])


    const clearValue = () => {
        setInputValue(initialState);
        setDeleteDialog(false);
        setOpen(false)
    }


    const createFun = () => {
        fetch(`${api}baseGroup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(inputValue)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data?.message);
                    setReload(!reload);
                } else {
                    toast.error(data.message)
                }
            }).finally(() => {
                clearValue()
            })
    }

    const setDelete = (row) => {
        clearValue()
        setInputValue(row);
        setDeleteDialog(true);
    }

    const deleteFun = () => {
        fetch(`${api}baseGroup`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify(inputValue)
        }).then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data?.message);
                    setReload(!reload)
                } else {
                    toast.error(data.message)
                }
            }).finally(() => {
                clearValue()
            })
    }


    return Number(contextObj?.Read_Rights) === 1 ? (
        <>
            <ToastContainer />
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    Base Group
                    {Number(contextObj?.Add_Rights) === 1 && (
                        <div className="text-end">
                            <Button onClick={() => { clearValue(); setOpen(true) }} className="rounded-5 px-3 py-1 fa-13 shadow">Create Base Group</Button>
                        </div>
                    )}
                </div>
                <div className="card-body">
                    {baseGropup.map((o, i) => (
                        <Chip label={o.Base_Group_Name} onDelete={() => setDelete(o)} className="mx-1" key={i} />
                    ))}
                </div>
            </div>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Base Group Creation"}
                </DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Base Group Name</label>
                        <input
                            type="text"
                            onChange={(e) => setInputValue({ ...inputValue, Base_Group_Name: e.target.value })}
                            placeholder="ex: PROJECT BASED"
                            value={inputValue.Base_Group_Name}
                            className="cus-inpt" />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={createFun} autoFocus color='success'>
                        CREATE
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialog}
                onClose={() => setDeleteDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirmation"}
                </DialogTitle>
                <DialogContent>
                    <b>{`Do you want to delete the ${inputValue?.Base_Group_Name && inputValue?.Base_Group_Name} Base Group?`}</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setDeleteDialog(false)}>Cancel</MuiButton>
                    <MuiButton onClick={deleteFun} autoFocus color='error'>
                        Delete
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    ) : <InvalidPageComp />
}

export default BaseGroup;