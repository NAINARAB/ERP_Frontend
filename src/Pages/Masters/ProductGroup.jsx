import React, { useState, useEffect, Fragment } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit, Search } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

function ProductGroup() {
    const [proGroupData, setProGroupData] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [formData, setFormData] = useState({ Group_Name: "" });
    const [editingItem, setEditingItem] = useState(null);
    const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [reload, setReload] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.UserId;
    const Company_Id = user?.Company_id;
    useEffect(() => {
        fetchVoucherGroup();
    }, [reload]);

    const fetchVoucherGroup = async () => {
        try {
            const data = await fetchLink({ address: `masters/proGroup` });
            if (data.success) {
                setProGroupData(data.data);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch Product groups");
        }
    };

    const openDialog = (item = null) => {
        setEditingItem(item);
        setFormData(item ? { ...item } : { Pro_Group: "" });
        setShowDialog(true);
    };

    const closeDialog = () => {
        setShowDialog(false);
        setEditingItem(null);
        setFormData({ Pro_Group: "" });
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setConfirmDeleteDialog(true);
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        console.log("deleted", deleteId)
        try {
            const data = await fetchLink({
                address: `masters/proGroup`,
                method: "DELETE",
                bodyData: { Pro_Group_Id: deleteId },
            });

            if (data.success) {
                toast.success("Product Group deleted successfully");
                setReload(!reload);
            } else {
                toast.error(data.message || "Failed to delete Product group");
            }
        } catch (e) {
            console.error(e);
            toast.error("Error deleting Product group");
        } finally {
            setIsDeleting(false);
            setConfirmDeleteDialog(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.Pro_Group?.trim()) {
            toast.error("Group Name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const method = editingItem ? "PUT" : "POST";

            const data = await fetchLink({
                address: `masters/proGroup`,
                method,
                bodyData: editingItem
                    ? {
                        ...formData,
                        Pro_Group_Id: editingItem.Pro_Group_Id,
                        Company_Id: Company_Id,
                        Alter_By: userId,
                    }
                    : {
                        Pro_Group: formData.Pro_Group,
                        Company_Id: Company_Id,
                        Created_By: userId,
                    },
            });


            if (data.success) {
                toast.success(
                    `Product Group ${editingItem ? "updated" : "created"} successfully`
                );
                closeDialog();
                setReload(!reload);
            } else {
                toast.error(
                    data.message ||
                    `Failed to ${editingItem ? "update" : "create"} Product group`
                );
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred while saving");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredData = proGroupData.filter((item) =>
        item.Pro_Group.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        createCol("Pro_Group", "string", "Product Group"),
        {
            ColumnHeader: "Actions",
            align: "center",
            isVisible: true,
            isCustomCell: true,
            Cell: ({ row }) => (
                <Fragment>
                    <IconButton size="small" onClick={() => openDialog(row)}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={() => confirmDelete(row.Pro_Group_Id)}
                    >
                        <Delete fontSize="small" />
                    </IconButton>
                </Fragment>
            ),
        },
    ];

    return (
        <>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    Product Group
                    <div className="d-flex align-items-center">
                        <div className="d-flex justify-content-end">
                            <div className="p-2" style={{ width: "300px" }}>
                                <div className="d-flex align-items-center gap-2">
                                    <Search />
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Search Product group..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        size="small"
                                        InputProps={{
                                            style: { height: "40px" },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <Button
                            className="rounded-1 btn-primary ms-2"
                            onClick={() => openDialog()}
                        >
                            Create Product Group
                        </Button>
                    </div>
                </div>

                <FilterableTable
                    dataArray={filteredData}
                    columns={columns}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    maxHeightOption
                />
            </div>

            <Dialog open={showDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingItem ? "Edit Product Group" : "Create Product Group"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Group Name"
                        fullWidth
                        variant="outlined"
                        value={formData.Pro_Group || ""}
                        onChange={(e) =>
                            setFormData({ ...formData, Pro_Group: e.target.value })
                        }
                        InputProps={{
                            style: {
                                height: "56px",
                            },
                        }}
                        InputLabelProps={{
                            style: {
                                backgroundColor: "white",
                                padding: "0 4px",
                            },
                        }}
                    />
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={closeDialog} disabled={isSubmitting}>
                        Cancel
                    </MuiButton>
                    <MuiButton
                        onClick={handleSubmit}
                        color="primary"
                        variant="contained"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Processing..." : editingItem ? "Update" : "Save"}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={confirmDeleteDialog}
                onClose={() => !isDeleting && setConfirmDeleteDialog(false)}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this Product group?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <MuiButton
                        onClick={() => setConfirmDeleteDialog(false)}
                        disabled={isDeleting}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        onClick={handleDelete}
                        color="error"
                        variant="contained"
                        disabled={isDeleting}
                    >
                        {isDeleting ? "Deleting..." : "Delete"}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ProductGroup;
