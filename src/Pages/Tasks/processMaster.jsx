import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    Id: "",
    process: ""
};

function ProcessMaster() {
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);
    const [process, setProcess] = useState([]);
    const [createProcess, setCreateProcess] = useState("");

    useEffect(() => {
        fetchLink({ address: `masters/processMaster` })
            .then((data) => {
                if (data.success) setProcess(data.data);
            })
            .catch((e) => console.error(e));
    }, [reload]);

    const handleDelete = () => {
        fetchLink({
            address: `masters/processMaster`,
            method: "DELETE",
            bodyData: { Id: inputValue.Id }
        })
            .then((data) => {
                if (data.success) {
                    setReload(!reload);
                    setOpen(false);
                    toast.success("Process deleted successfully!");
                } else {
                    toast.error("Failed to delete Process: " + data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const handleCreate = () => {
        if (!createProcess.trim()) {
            toast.error("Please enter a Process");
            return;
        }
        fetchLink({
            address: `masters/processMaster`,
            method: "POST",
            bodyData: { Process_Name: createProcess.trim() }
        })
            .then((data) => {
                if (data.success) {
                    setIsCreateDialogOpen(false);
                    setReload(!reload);
                    toast.success(data.message);
                    setCreateProcess("");
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const editRow = (row) => {
        setInputValue({
            Id: row.Id,
            process: row.Process_Name
        });
        setEditUser(true);
    };

    const handleEdit = () => {
        const { Id, process } = inputValue;
        if (!process) {
            toast.error("Process cannot be empty");
            return;
        }

        fetchLink({
            address: `masters/processMaster`,
            method: "PUT",
            bodyData: { Id, Process_Name: process }
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    setEditUser(false);
                    setInputValue(initialState);
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    return (
        <>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    Process Master
                    <div className="text-end">
                        <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            Create Process
                        </Button>
                    </div>
                </div>

                <FilterableTable
                    dataArray={process}
                    EnableSerialNumber={true}
                    maxHeightOption
                    columns={[
                        createCol("Process_Name", "string", "Process Name"),
                        {
                            ColumnHeader: "Actions",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                <td className="fa-12" style={{ minWidth: "80px" }}>
                                    <IconButton onClick={() => editRow(row)} size="small">
                                        <Edit className="fa-in" />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {
                                            setOpen(true);
                                            setInputValue({ Id: row.Id });
                                        }}
                                        size="small"
                                        color="error"
                                    >
                                        <Delete className="fa-in" />
                                    </IconButton>
                                </td>
                            )
                        }
                    ]}
                />
            </div>

            <Dialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
            >
                <DialogTitle>Process Creation</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Process Name</label>
                        <input
                            type="text"
                            value={createProcess}
                            onChange={(e) => setCreateProcess(e.target.value)}
                            className="cus-inpt"
                            placeholder="Enter Process Name"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setIsCreateDialogOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleCreate} color="success">Create</MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editUser}
                onClose={() => {
                    setEditUser(false);
                    setInputValue(initialState);
                }}
            >
                <DialogTitle>Edit Process</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Process Name</label>
                        <input
                            type="text"
                            value={inputValue.process}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, process: e.target.value })
                            }
                            className="cus-inpt"
                            placeholder="Enter Process Name"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => {
                        setEditUser(false);
                        setInputValue(initialState);
                    }}>Cancel</MuiButton>
                    <MuiButton onClick={handleEdit} color="success">Update</MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <b>Do you want to delete this Process?</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleDelete} color="error" autoFocus>Delete</MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ProcessMaster;