import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import api from "../../API";
import {
    IconButton,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button as MuiButton,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const initialState = {
    Base_Group_Id: "",
    Base_Group_Name: "",
};

const BaseGroup = () => {
    const [baseGropup, setBaseGroup] = useState([]);
    const [open, setOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [reload, setReload] = useState(false);

    useEffect(() => {
        fetch(`${api}baseGroup`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setBaseGroup(data.data);
                }
            });
    }, [reload]);

    const clearValue = () => {
        setInputValue(initialState);
        setDeleteDialog(false);
        setOpen(false);
    };

    const createFun = () => {
        fetch(`${api}baseGroup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inputValue),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    toast.success(data?.message);
                    setReload(!reload);
                } else {
                    toast.error(data.message);
                }
            })
            .finally(() => {
                clearValue();
            });
    };

    const setDelete = (row) => {
        clearValue();
        setInputValue(row);
        setDeleteDialog(true);
    };

    const deleteFun = () => {
        fetch(`${api}baseGroup`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(inputValue),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    toast.success(data?.message);
                    setReload(!reload);
                } else {
                    toast.error(data.message);
                }
            })
            .finally(() => {
                clearValue();
            });
    };

    const [editBase, setEditBase] = useState(false);
    const editRow = (group) => {
        setEditBase(true);
        setInputValue({
            Base_Group_Id: group.Base_Group_Id,
            Base_Group_Name: group.Base_Group_Name,
        });
    };

    const editFun = (baseGroupId, baseGroupName) => {
        console.log("baseGroupId", baseGroupId);
        console.log("baseGroupName", baseGroupName);
        const postObj = {
            Base_Group_Id: baseGroupId,
            Base_Group_Name: baseGroupName,
        };
        fetch(`${api}baseGroup`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(postObj),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    console.log("Server Response:", data);
                    toast.success(data.message);
                    setReload(!reload);
                    setEditBase(false);
                } else {
                    // console.error("Error:", data);
                    toast.error(data.message);
                }
            });
    };

    return (
        <>
            <ToastContainer />
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    Base Group
                    <div className="text-end">
                        <Button
                            onClick={() => {
                                clearValue();
                                setOpen(true);
                            }}
                            className="rounded-5 px-3 py-1 fa-13 shadow"
                        >
                            Create Base Group
                        </Button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <Table className="">
                            <thead>
                                <tr>
                                    <th className="fa-14">Id No</th>
                                    <th className="fa-14">Base Group Name</th>
                                    <th className="fa-14">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {baseGropup.map((o, i) => (
                                    <tr key={i}>
                                        <td className="fa-14">{o.Base_Group_Id}</td>
                                        <td className="fa-14">{o.Base_Group_Name}</td>
                                        <td className="fa-12" style={{ minWidth: "80px" }}>
                                            <IconButton
                                                onClick={() => {
                                                    editRow(o);
                                                }}
                                                size="small"
                                            >
                                                <Edit className="fa-in" />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    setDelete(o);
                                                }}
                                                size="small"
                                            >
                                                <Delete className="fa-in del-red" />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    {/* {baseGropup.map((o, i) => (
            <Chip
              label={o.Base_Group_Name}
              onClick={() => {
                editRow(o);
              }}
              onDelete={() => setDelete(o)}
              className="mx-1"
              key={i}
            />
          ))} */}
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
                            onChange={(e) =>
                                setInputValue({
                                    ...inputValue,
                                    Base_Group_Name: e.target.value,
                                })
                            }
                            placeholder="ex: PROJECT BASED"
                            value={inputValue.Base_Group_Name}
                            className="cus-inpt"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={createFun} autoFocus color="success">
                        CREATE
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editBase}
                onClose={() => setEditBase(false)}
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
                            onChange={(e) =>
                                setInputValue({
                                    ...inputValue,
                                    Base_Group_Name: e.target.value,
                                })
                            }
                            placeholder={inputValue.Base_Group_Name}
                            value={inputValue.Base_Group_Name}
                            className="cus-inpt"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setEditBase(false)}>Cancel</MuiButton>
                    <MuiButton
                        onClick={() =>
                            editFun(inputValue.Base_Group_Id, inputValue.Base_Group_Name)
                        }
                        autoFocus
                        color="success"
                    >
                        Update
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialog}
                onClose={() => {setDeleteDialog(false); setInputValue(initialState)}}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirmation"}</DialogTitle>
                <DialogContent>
                    <b>{`Do you want to delete the ${inputValue?.Base_Group_Name && inputValue?.Base_Group_Name
                        } Base Group?`}</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => {setDeleteDialog(false); setInputValue(initialState)}}>Cancel</MuiButton>
                    <MuiButton onClick={deleteFun} autoFocus color="error">
                        Delete
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default BaseGroup;
