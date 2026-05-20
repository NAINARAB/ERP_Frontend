import React, { useState, useEffect, Fragment, useCallback } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit, Search } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    Brand_Id: "",
    Brand_Name: "",

};

function Brand() {
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);
    const [brand, setBrand] = useState([]);
    const [filteredBrand, setFilteredBrand] = useState([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editBrand, setEditBrand] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.UserId;
    const company_Id = user?.Company_id

    const fetchBrand = useCallback(async () => {
        try {
            const data = await fetchLink({
                address: `masters/brand`
            });
            if (data.success) {
                setBrand(data.data);
                setFilteredBrand(data.data);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch states");
        }
    }, []);

    useEffect(() => {
        fetchBrand();
    }, [fetchBrand, reload]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredBrand(brand);
        } else {
            const filtered = brand.filter(item =>
                item.Brand_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.Brand_Id.toString().includes(searchTerm)
            );
            setFilteredBrand(filtered);
        }
    }, [searchTerm, Brand]);

    const handleDelete = async () => {
        try {
            const data = await fetchLink({
                address: `masters/brand`,
                method: "DELETE",
                bodyData: { Brand_Id: inputValue.Brand_Id },
            });
            if (data.success) {
                setReload(prev => !prev);
                setOpen(false);
                toast.success("Brand deleted successfully!");
            } else {
                toast.error("Failed to delete Brand: " + data.message);
            }
        } catch (e) {

            console.error(e);
            toast.error("Error deleting Brand");
        }
    };

    const handleCreate = async () => {
        try {


            const data = await fetchLink({
                address: `masters/brand`,
                method: "POST",
                bodyData: {
                    Brand_Name: inputValue.Brand_Name,
                    Created_By: Number(userId),
                    Company_Id: company_Id
                },
            });
            if (data.success) {
                setIsCreateDialogOpen(false);
                setReload(prev => !prev);
                toast.success('Data Added Succesfully');
                setInputValue(initialState);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error creating Brand");
        }
    };

    const editRow = (user) => {
        setEditBrand(true);
        setInputValue({
            Brand_Id: user.Brand_Id,
            Brand_Name: user.Brand_Name,
            Alter_By: userId
        });
    };

    const editFun = async (Brand_Id, Brand_Name) => {
        try {
            const data = await fetchLink({
                address: `masters/brand`,
                method: "PUT",
                bodyData: { Brand_Id, Brand_Name }
            });
            if (data.success) {
                toast.success(data.message);
                setReload(prev => !prev);
                setEditBrand(false);
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
                    BRAND MASTER
                    <div className="d-flex align-items-center">
                        <div className="d-flex justify-content-end">
                            <div className="p-2" style={{ width: "300px" }}>
                                <div className="d-flex align-items-center gap-2">
                                    <Search />
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Search Brand..."
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
                            Create Brand
                        </Button>
                    </div>
                </div>

                <FilterableTable
                    dataArray={filteredBrand}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    maxHeightOption
                    columns={[
                        createCol('Brand_Name', 'string', 'Brand Name'),
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
                                                setInputValue({ Brand_Id: row.Brand_Id });
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
                <DialogTitle id="create-dialog-title">CREATE BRAND</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>BRAND NAME</label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    Brand_Name: event.target.value,
                                })
                            }
                            placeholder="Enter brand name"
                            value={inputValue.Brand_Name}
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
                open={editBrand}
                onClose={() => {
                    setEditBrand(false);
                    setInputValue(initialState);
                }}
                aria-labelledby="edit-dialog-title"
            >
                <DialogTitle id="edit-dialog-title">EDIT BRAND</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>BRAND NAME</label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    Brand_Name: event.target.value,
                                })
                            }
                            placeholder="Enter state name"
                            value={inputValue.Brand_Name}
                            className="cus-inpt"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => {
                        setEditBrand(false);
                        setInputValue(initialState);
                    }}>Cancel</MuiButton>
                    <MuiButton onClick={() => editFun(inputValue.Brand_Id, inputValue.Brand_Name)} color="success">
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
                    <b>Do you want to delete this Brand?</b>
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

export default Brand;