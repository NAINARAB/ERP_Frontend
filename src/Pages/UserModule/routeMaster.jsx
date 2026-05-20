import React, { useState, useEffect, Fragment } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    Route_Id: "",
    Route_Name: ""
};

function RouteMaster() {
    const [UserTypeData, setUserTypeData] = useState([]);
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);

    useEffect(() => {
        fetchLink({
            address: `masters/routes`
        }).then((data) => {
            if (data.success) {
                setUserTypeData(data.data);
            }
        }).catch(e => console.error(e));
    }, [reload]);

    const handleDelete = () => {
        fetchLink({
            address: `masters/routes`,
            method: "DELETE",
            bodyData: { Route_Id: inputValue.Route_Id },
        }).then((data) => {
            if (data.success) {
                setReload(!reload);
                setOpen(false);
                toast.success("Route deleted successfully!");
            } else {
                toast.error("Failed to delete area:", data.message);
            }
        }).catch(e => console.error(e));
    };

    const handleCreate = () => {
        fetchLink({
            address: `masters/routes`,
            method: "POST",
            bodyData: {
                Route_Name: inputValue.Route_Name
            },
        }).then((data) => {
            if (data.success) {
                setIsCreateDialogOpen(false);
                setReload(!reload);
                toast.success(data.message);
                setInputValue([])
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    const editRow = (user) => {
        setEditUser(true);
        setInputValue({
            Route_Id: user.Route_Id,
            Route_Name: user.Route_Name,
        });
    };

    const editFun = (Route_Id, Route_Name) => {
        fetchLink({
            address: `masters/routes`,
            method: "PUT",
            bodyData: { Route_Id, Route_Name },
        }).then((data) => {
            if (data.success) {
                toast.success(data.message);
                setReload(!reload);
                setEditUser(false);
                setInputValue([])
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    return (
        <Fragment>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    Area
                    <div className="text-end">
                        <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            Create Route
                        </Button>
                    </div>
                </div>



                <FilterableTable
                    dataArray={UserTypeData}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    maxHeightOption
                    columns={[
                        createCol('Route_Name', 'string', 'Route_Name'),
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
                                                setInputValue({ Route_Id: row.Route_Id });
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

            <Dialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                aria-labelledby="create-dialog-title"
                aria-describedby="create-dialog-description"
            >
                <DialogTitle id="create-dialog-title">Route Creation</DialogTitle>
                <DialogContent>
                    <div>
                        <div className="p-2">
                            <label>Route Name</label>
                            <input
                                type="text"
                                onChange={(event) =>
                                    setInputValue({
                                        ...inputValue,
                                        Route_Name: event.target.value,
                                    })
                                }
                                placeholder="Ex: BB Kulam"
                                value={inputValue.Route_Name}
                                className="cus-inpt"
                            />
                        </div>

                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                    </MuiButton>
                    <MuiButton onClick={handleCreate} color="success">
                        CREATE
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editUser}
                onClose={() => setEditUser(false)}
                aria-labelledby="create-dialog-title"
                aria-describedby="create-dialog-description"
            >
                <DialogTitle id="create-dialog-title">Route</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Route_Name </label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    Route_Name: event.target.value,
                                })
                            }
                            placeholder={inputValue.Route_Name}
                            value={inputValue.Route_Name}
                            className="cus-inpt"
                        />
                    </div>

                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setEditUser(false)}>Cancel</MuiButton>
                    <MuiButton onClick={() => editFun(inputValue.Route_Id, inputValue.Route_Name)} color="success">
                        Update
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
                <DialogContent>
                    <b>Do you want to delete the Route?</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={() => handleDelete(inputValue.Route_Id)} autoFocus color="error">
                        Delete
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default RouteMaster;