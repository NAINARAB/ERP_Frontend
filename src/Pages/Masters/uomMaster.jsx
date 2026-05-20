import React, { useState, useEffect, Fragment } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    Unit_Id: "",
    Units: ""
};

function UomMaster() {
    const [UserTypeData, setUserTypeData] = useState([]);
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);

    useEffect(() => {
        fetchLink({
            address: `masters/uom`
        }).then((data) => {
            if (data.success) {
                setUserTypeData(data.data);
            }
        }).catch(e => console.error(e));
    }, [reload]);

    const handleDelete = () => {
        fetchLink({
            address: `masters/uom`,
            method: "DELETE",
            bodyData: { Unit_Id: inputValue.Unit_Id },
        }).then((data) => {
            if (data.success) {
                setReload(!reload);
                setOpen(false);
                toast.success("Units deleted successfully!");
            } else {
                toast.error("Failed to delete area:", data.message);
            }
        }).catch(e => console.error(e));
    };

    const handleCreate = () => {
        fetchLink({
            address: `masters/uom`,
            method: "POST",
            bodyData: {
                Units: inputValue.Units
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
            Unit_Id: user.Unit_Id,
            Units: user.Units,
        });
    };

    const editFun = (Unit_Id, Units) => {
        fetchLink({
            address: `masters/uom`,
            method: "PUT",
            bodyData: { Unit_Id, Units },
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
                    UOM MASTER
                    <div className="text-end">
                        <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            Create UOM
                        </Button>
                    </div>
                </div>

           
                <FilterableTable
                    dataArray={UserTypeData}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    maxHeightOption
                    columns={[
                        createCol('Unit_Id', 'string', 'Unit_Id'),
                        createCol('Units', 'string', 'Units'),
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
                                                setInputValue({ Unit_Id: row.Unit_Id });
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
                <DialogTitle id="create-dialog-title">UOM </DialogTitle>
                <DialogContent>
                    <div>
                        <div className="p-2">
                            <label>Units</label>
                            <input
                                type="text"
                                onChange={(event) =>
                                    setInputValue({
                                        ...inputValue,
                                        Units: event.target.value,
                                    })
                                }
                                placeholder=""
                                value={inputValue.Units}
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
                <DialogTitle id="create-dialog-title">UOM</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>UOM </label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    Units: event.target.value,
                                })
                            }
                            placeholder={inputValue.Units}
                            value={inputValue.Units}
                            className="cus-inpt"
                        />
                    </div>

                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setEditUser(false)}>Cancel</MuiButton>
                    <MuiButton onClick={() => editFun(inputValue.Unit_Id, inputValue.Units)} color="success">
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
                    <b>Do you want to delete the UOM?</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={() => handleDelete(inputValue.Unit_Id)} autoFocus color="error">
                        Delete
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default UomMaster;