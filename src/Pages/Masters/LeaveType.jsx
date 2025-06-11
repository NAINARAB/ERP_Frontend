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
    LeaveType: ""
};

function LeaveType() {
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [createLeaveType, setCreateLeaveType] = useState("");

    useEffect(() => {
        fetchLink({ address: `masters/leaveType` })
            .then((data) => {
                if (data.success) setLeaveTypes(data.data);
            })
            .catch((e) => console.error(e));
    }, [reload]);

    const handleDelete = () => {
        fetchLink({
            address: `masters/leaveType`,
            method: "DELETE",
            bodyData: { Id: inputValue.Id }
        })
            .then((data) => {
                if (data.success) {
                    setReload(!reload);
                    setOpen(false);
                    toast.success("Leave Type deleted successfully!");
                } else {
                    toast.error("Failed to delete Leave Type: " + data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const handleCreate = () => {
        if (!createLeaveType.trim()) {
            toast.error("Please enter a Leave Type");
            return;
        }
        fetchLink({
            address: `masters/leaveType`,
            method: "POST",
            bodyData: { LeaveType: createLeaveType.trim() }
        })
            .then((data) => {
                if (data.success) {
                    setIsCreateDialogOpen(false);
                    setReload(!reload);
                    toast.success(data.message);
                    setCreateLeaveType("");
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const editRow = (row) => {
        setInputValue({
            Id: row.Id,
            LeaveType: row.LeaveType
        });
        setEditUser(true);
    };

    const handleEdit = () => {
        const { Id, LeaveType } = inputValue;
        if (!LeaveType) {
            toast.error("Leave Type cannot be empty");
            return;
        }

        fetchLink({
            address: `masters/leaveType`,
            method: "PUT",
            bodyData: { Id, LeaveType: LeaveType }
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    setEditUser(false);
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
                    Leave Type
                    <div className="text-end">
                        <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            Create LeaveType
                        </Button>
                    </div>
                </div>


                <FilterableTable
                    dataArray={leaveTypes}
                    EnableSerialNumber={true}
                    maxHeightOption
                    columns={[
                        createCol("LeaveType", "string", "Leave Type"),
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
                <DialogTitle>Leave Type Creation</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Leave Type Name</label>
                        <input
                            type="text"
                            value={createLeaveType}
                            onChange={(e) => setCreateLeaveType(e.target.value)}
                            className="cus-inpt"
                            placeholder="Enter Leave Type"
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
                onClose={() => setEditUser(false)}
            >
                <DialogTitle>Edit Leave Type</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Leave Type</label>
                        <input
                            type="text"
                            value={inputValue.LeaveType}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, LeaveType: e.target.value })
                            }
                            className="cus-inpt"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setEditUser(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleEdit} color="success">Update</MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <b>Do you want to delete this Leave Type?</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleDelete} color="error" autoFocus>Delete</MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default LeaveType;