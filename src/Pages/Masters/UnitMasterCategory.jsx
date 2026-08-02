import React, { useState, useEffect, Fragment } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    CategoryId: "",
    CategoryName: "",
    Description: "",
    IsSystem: 0,
    IsActive: 1
};

function UnitMasterCategory() {
    const [categoryData, setCategoryData] = useState([]);
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);

    useEffect(() => {
        fetchLink({
            address: `masters/unitCategory`
        }).then((data) => {
            if (data.success) {
                setCategoryData(data.data);
            }
        }).catch(e => console.error(e));
    }, [reload]);

    const handleDelete = () => {
        fetchLink({
            address: `masters/unitCategory`,
            method: "DELETE",
            bodyData: { CategoryId: inputValue.CategoryId },
        }).then((data) => {
            if (data.success) {
                setReload(!reload);
                setOpen(false);
                toast.success(data.message || "Category deleted successfully!");
            } else {
                toast.error(data.message || "Failed to delete category");
            }
        }).catch(e => console.error(e));
    };

    const handleCreate = () => {
        if (!inputValue.CategoryName) {
            toast.error("Category Name is required");
            return;
        }

        fetchLink({
            address: `masters/unitCategory`,
            method: "POST",
            bodyData: {
                CategoryName: inputValue.CategoryName,
                Description: inputValue.Description,
                IsSystem: inputValue.IsSystem,
                IsActive: inputValue.IsActive
            },
        }).then((data) => {
            if (data.success) {
                setIsCreateDialogOpen(false);
                setReload(!reload);
                toast.success(data.message);
                setInputValue(initialState);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    const editRow = (row) => {
        setEditUser(true);
        setInputValue({
            CategoryId: row.CategoryId,
            CategoryName: row.CategoryName,
            Description: row.Description || "",
            IsSystem: row.IsSystem ? 1 : 0,
            IsActive: row.IsActive ? 1 : 0
        });
    };

    const editFun = () => {
        if (!inputValue.CategoryName) {
            toast.error("Category Name is required");
            return;
        }

        fetchLink({
            address: `masters/unitCategory`,
            method: "PUT",
            bodyData: {
                CategoryId: inputValue.CategoryId,
                CategoryName: inputValue.CategoryName,
                Description: inputValue.Description,
                IsSystem: inputValue.IsSystem,
                IsActive: inputValue.IsActive
            },
        }).then((data) => {
            if (data.success) {
                toast.success(data.message);
                setReload(!reload);
                setEditUser(false);
                setInputValue(initialState);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    return (
        <Fragment>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    UNIT MASTER CATEGORY
                    <div className="text-end">
                        <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={() => {
                                setInputValue(initialState);
                                setIsCreateDialogOpen(true);
                            }}
                        >
                            Create Category
                        </Button>
                    </div>
                </div>

                <FilterableTable
                    dataArray={categoryData}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    maxHeightOption
                    columns={[
                        createCol('CategoryId', 'string', 'ID'),
                        createCol('CategoryName', 'string', 'Category Name'),
                        createCol('Description', 'string', 'Description'),
                        {
                            Field_Name: "IsSystem",
                            ColumnHeader: "System?",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => <span>{row.IsSystem ? "Yes" : "No"}</span>
                        },
                        {
                            Field_Name: "IsActive",
                            ColumnHeader: "Active?",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => <span>{row.IsActive ? "Yes" : "No"}</span>
                        },
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
                                                setInputValue({ CategoryId: row.CategoryId });
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
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="create-dialog-title">Create Unit Category</DialogTitle>
                <DialogContent>
                    <div className="row p-2">
                        <div className="col-md-12 mb-3">
                            <label>Category Name</label>
                            <input
                                type="text"
                                onChange={(e) => setInputValue({ ...inputValue, CategoryName: e.target.value })}
                                value={inputValue.CategoryName}
                                className="cus-inpt"
                            />
                        </div>
                        <div className="col-md-12 mb-3">
                            <label>Description</label>
                            <textarea
                                onChange={(e) => setInputValue({ ...inputValue, Description: e.target.value })}
                                value={inputValue.Description}
                                className="cus-inpt"
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="col-md-6 mb-3 d-flex align-items-center">
                            <input
                                type="checkbox"
                                checked={inputValue.IsSystem === 1}
                                onChange={(e) => setInputValue({ ...inputValue, IsSystem: e.target.checked ? 1 : 0 })}
                                id="isSystemCheck"
                                className="me-2"
                            />
                            <label htmlFor="isSystemCheck">Is System Category</label>
                        </div>
                        <div className="col-md-6 mb-3 d-flex align-items-center">
                            <input
                                type="checkbox"
                                checked={inputValue.IsActive === 1}
                                onChange={(e) => setInputValue({ ...inputValue, IsActive: e.target.checked ? 1 : 0 })}
                                id="isActiveCheck"
                                className="me-2"
                            />
                            <label htmlFor="isActiveCheck">Is Active</label>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setIsCreateDialogOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleCreate} color="success" variant="contained">CREATE</MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editUser}
                onClose={() => setEditUser(false)}
                aria-labelledby="edit-dialog-title"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="edit-dialog-title">Update Unit Category</DialogTitle>
                <DialogContent>
                    <div className="row p-2">
                        <div className="col-md-12 mb-3">
                            <label>Category Name</label>
                            <input
                                type="text"
                                onChange={(e) => setInputValue({ ...inputValue, CategoryName: e.target.value })}
                                value={inputValue.CategoryName}
                                className="cus-inpt"
                            />
                        </div>
                        <div className="col-md-12 mb-3">
                            <label>Description</label>
                            <textarea
                                onChange={(e) => setInputValue({ ...inputValue, Description: e.target.value })}
                                value={inputValue.Description}
                                className="cus-inpt"
                                rows="3"
                            ></textarea>
                        </div>
                        <div className="col-md-6 mb-3 d-flex align-items-center">
                            <input
                                type="checkbox"
                                checked={inputValue.IsSystem === 1}
                                onChange={(e) => setInputValue({ ...inputValue, IsSystem: e.target.checked ? 1 : 0 })}
                                id="editIsSystemCheck"
                                className="me-2"
                            />
                            <label htmlFor="editIsSystemCheck">Is System Category</label>
                        </div>
                        <div className="col-md-6 mb-3 d-flex align-items-center">
                            <input
                                type="checkbox"
                                checked={inputValue.IsActive === 1}
                                onChange={(e) => setInputValue({ ...inputValue, IsActive: e.target.checked ? 1 : 0 })}
                                id="editIsActiveCheck"
                                className="me-2"
                            />
                            <label htmlFor="editIsActiveCheck">Is Active</label>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setEditUser(false)}>Cancel</MuiButton>
                    <MuiButton onClick={editFun} color="success" variant="contained">Update</MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
            >
                <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
                <DialogContent>
                    <b>Do you want to delete this Category?</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleDelete} autoFocus color="error" variant="contained">Delete</MuiButton>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default UnitMasterCategory;
