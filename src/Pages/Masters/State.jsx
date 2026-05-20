import React, { useState, useEffect, Fragment, useCallback } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit, Search } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    State_Id: "",
    State_Name: ""
};

function State() {
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);
    const [state, setState] = useState([]);
    const [filteredState, setFilteredState] = useState([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editState, setEditState] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchStates = useCallback(async () => {
        try {
            const data = await fetchLink({
                address: `masters/state`
            });
            if (data.success) {
                setState(data.data);
                setFilteredState(data.data);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch states");
        }
    }, []);

    useEffect(() => {
        fetchStates();
    }, [fetchStates, reload]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredState(state);
        } else {
            const filtered = state.filter(item =>
                item.State_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.State_Id.toString().includes(searchTerm)
            );
            setFilteredState(filtered);
        }
    }, [searchTerm, state]);

    const handleDelete = async () => {
        try {
            const data = await fetchLink({
                address: `masters/state`,
                method: "DELETE",
                bodyData: { State_Id: inputValue.State_Id },
            });
            if (data.success) {
                setReload(prev => !prev);
                setOpen(false);
                toast.success("State deleted successfully!");
            } else {
                toast.error("Failed to delete state: " + data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error deleting state");
        }
    };

    const handleCreate = async () => {
        try {
            const data = await fetchLink({
                address: `masters/state`,
                method: "POST",
                bodyData: {
                    State_Name: inputValue.State_Name
                },
            });
            if (data.success) {
                setIsCreateDialogOpen(false);
                setReload(prev => !prev);
                toast.success('State Added Succesfully');
                setInputValue(initialState);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error creating state");
        }
    };

    const editRow = (user) => {
        setEditState(true);
        setInputValue({
            State_Id: user.State_Id,
            State_Name: user.State_Name,
        });
    };

    const editFun = async (State_Id, State_Name) => {
        try {
            const data = await fetchLink({
                address: `masters/state`,
                method: "PUT",
                bodyData: { State_Id, State_Name },
            });
            if (data.success) {
                toast.success('State Updated Succesfully');
                setReload(prev => !prev);
                setEditState(false);
                setInputValue(initialState);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error updating state");
        }
    };

    return (
        <Fragment>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    STATE MASTER
                    <div className="d-flex align-items-center">
                        <div className="d-flex justify-content-end">
                            <div className="p-2" style={{ width: "300px" }}>
                                <div className="d-flex align-items-center gap-2">
                                    <Search />
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Search state..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        InputProps={{
                                            style: { height: "40px" },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <Button
                            className="rounded-1 btn-primary"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            Create State
                        </Button>
                    </div>
                </div>

                <FilterableTable
                    dataArray={filteredState}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    maxHeightOption
                    columns={[
                        // createCol('State_Id', 'string', 'State ID'),
                        createCol('State_Name', 'string', 'State Name'),
                        {
                            Field_Name: "Actions",
                            ColumnHeader: "Actions",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => {
                                return (
                                    <td className="fa-12" style={{ minWidth: "80px" }}>
                                        <IconButton
                                            onClick={() => editRow(row)}
                                            size="small"
                                        >
                                            <Edit className="fa-in" />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => {
                                                setOpen(true);
                                                setInputValue({ State_Id: row.State_Id });
                                            }}
                                            size="small"
                                            color='error'
                                        >
                                            <Delete className="fa-in " />
                                        </IconButton>
                                    </td>
                                );
                            },
                        },
                    ]}
                />
            </div>

            {/* Create Dialog */}
            <Dialog
                open={isCreateDialogOpen}
                onClose={() => {
                    setIsCreateDialogOpen(false);
                    setInputValue(initialState);
                }}
                aria-labelledby="create-dialog-title"
            >
                <DialogTitle id="create-dialog-title">CREATE STATE</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>STATE NAME</label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    State_Name: event.target.value,
                                })
                            }
                            placeholder="Enter state name"
                            value={inputValue.State_Name}
                            className="cus-inpt"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => {
                        setIsCreateDialogOpen(false);
                        setInputValue(initialState);
                    }}>
                        Cancel
                    </MuiButton>
                    <MuiButton onClick={handleCreate} color="success">
                        CREATE
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={editState}
                onClose={() => {
                    setEditState(false);
                    setInputValue(initialState);
                }}
                aria-labelledby="edit-dialog-title"
            >
                <DialogTitle id="edit-dialog-title">EDIT STATE</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>STATE NAME</label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    State_Name: event.target.value,
                                })
                            }
                            placeholder="Enter state name"
                            value={inputValue.State_Name}
                            className="cus-inpt"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => {
                        setEditState(false);
                        setInputValue(initialState);
                    }}>Cancel</MuiButton>
                    <MuiButton onClick={() => editFun(inputValue.State_Id, inputValue.State_Name)} color="success">
                        Update
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
            >
                <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
                <DialogContent>
                    <b>Do you want to delete this state?</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleDelete} autoFocus color="error">
                        Delete
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default State;