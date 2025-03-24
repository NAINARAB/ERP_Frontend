import React, { useState, useEffect, Fragment } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    POS_Brand_Id: "",
    POS_Brand_Name: ""
};

function PosMaster() {
    const [UserTypeData, setUserTypeData] = useState([]);
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);

    useEffect(() => {
        fetchLink({
            address: `masters/posbranch`
        }).then((data) => {
            if (data.success) {
                setUserTypeData(data.data);
            }
        }).catch(e => console.error(e));
    }, [reload]);

    const handleDelete = () => {
        fetchLink({
            address: `masters/posbranch`,
            method: "DELETE",
            bodyData: { POS_Brand_Id: inputValue.POS_Brand_Id },
        }).then((data) => {
            if (data.success) {
                setReload(!reload);
                setOpen(false);
                toast.success("POS_Brand deleted successfully!");
            } else {
                toast.error("Failed to delete area:", data.message);
            }
        }).catch(e => console.error(e));
    };

    const handleCreate = () => {
        fetchLink({
            address: `masters/posbranch`,
            method: "POST",
            bodyData: {
                POS_Brand_Name: inputValue.POS_Brand_Name
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
            POS_Brand_Id: user.POS_Brand_Id,
            POS_Brand_Name: user.POS_Brand_Name,
        });
    };

    const editFun = (POS_Brand_Id, POS_Brand_Name) => {
        fetchLink({
            address: `masters/posbranch`,
            method: "PUT",
            bodyData: { POS_Brand_Id, POS_Brand_Name },
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
                    POS MASTER
                    <div className="text-end">
                        <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            Create Pos Brand
                        </Button>
                    </div>
                </div>



                <FilterableTable
                    dataArray={UserTypeData}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    maxHeightOption
                    columns={[
                        createCol('POS_Brand_Id', 'string', 'POS_Brand_Id'),
                        createCol('POS_Brand_Name', 'string', 'POS_Brand_Name'),
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
                                                setInputValue({ POS_Brand_Id: row.POS_Brand_Id });
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
                <DialogTitle id="create-dialog-title">POS Brand</DialogTitle>
                <DialogContent>
                    <div>
                        <div className="p-2">
                            <label>Pos Name</label>
                            <input
                                type="text"
                                onChange={(event) =>
                                    setInputValue({
                                        ...inputValue,
                                        POS_Brand_Name: event.target.value,
                                    })
                                }
                                placeholder=""
                                value={inputValue.POS_Brand_Name}
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
                <DialogTitle id="create-dialog-title">POS Brand</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>POS_Brand_Name </label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    POS_Brand_Name: event.target.value,
                                })
                            }
                            placeholder={inputValue.POS_Brand_Name}
                            value={inputValue.POS_Brand_Name}
                            className="cus-inpt"
                        />
                    </div>

                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setEditUser(false)}>Cancel</MuiButton>
                    <MuiButton onClick={() => editFun(inputValue.POS_Brand_Id, inputValue.POS_Brand_Name)} color="success">
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
                    <b>Do you want to delete the POS_Brand?</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={() => handleDelete(inputValue.POS_Brand_Id)} autoFocus color="error">
                        Delete
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default PosMaster;