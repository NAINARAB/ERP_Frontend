import { useState, useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    DialogContentText,
    TextField,
} from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit, Search } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    Godown_Id: "",
    Godown_Name: ""
};

function Godown() {
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editMode, setEditMode] = useState(false);
    const [godownList, setGodownList] = useState([]);
    const [filteredAccountList, setFilteredAccountList] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.UserId;

    useEffect(() => {
        const fetchAccountGroups = async () => {
            try {
                const data = await fetchLink({ address: `masters/godown` });
                if (data.success) {
                    setGodownList(data.data);
                    setFilteredAccountList(data.data);
                }
            } catch (e) {
                console.error(e);
                toast.error("Failed to load account groups");
            }
        };

        fetchAccountGroups();
    }, [reload]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredAccountList(godownList);
        } else {
            const filtered = godownList.filter(
                (account) =>
                (account.Godown_Id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    account.Godown_Name?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredAccountList(filtered);
        }
    }, [searchTerm, godownList]);


    const handleDelete = async () => {
        setIsSubmitting(true);
        const deletedItemId = inputValue.Godown_Id;

        try {
            setGodownList(prev => prev.filter(item => item.Godown_Id !== deletedItemId));
            setFilteredAccountList(prev => prev.filter(item => item.Godown_Id !== deletedItemId));

            const data = await fetchLink({
                address: `masters/godown`,
                method: "DELETE",
                bodyData: { Godown_Id: deletedItemId },
            });

            if (data.success) {
                toast.success("Godown deleted successfully!");
            } else {
                setReload(prev => !prev);
                toast.error(data.message || "Failed to delete account group");
            }
        } catch (e) {
            console.error(e);
            setReload(prev => !prev);
            toast.error("Failed to delete account group");
        } finally {
            setIsSubmitting(false);
            setOpen(false);
        }
    };

    const handleCreate = async () => {
        const { Godown_Name } = inputValue;
        if (!Godown_Name) {
            toast.error("Please fill all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await fetchLink({
                address: `masters/godown`,
                method: "POST",
                bodyData: {
                    ...inputValue,
                    Created_By: userId,
                },
            });

            if (data.success) {
                toast.success("Godown Created successfully!");
                setIsCreateDialogOpen(false);
                setInputValue(initialState);
                setReload(prev => !prev);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to Create Godown");
        } finally {
            setIsSubmitting(false);
        }
    };

    const editRow = (row) => {
        setInputValue({
            Godown_Id: row.Godown_Id,
            Godown_Name: row.Godown_Name
        });
        setEditMode(true);
    };

    const handleEdit = () => {
        const { Godown_Id, Godown_Name } = inputValue;
        if (!Godown_Id || !Godown_Name) {
            toast.error("All required fields must be filled.");
            return;
        }

        setIsSubmitting(true);
        fetchLink({
            address: `masters/godown`,
            method: "PUT",
            bodyData: {
                ...inputValue,
                Alter_By: userId,
            },
        })
            .then((data) => {
                if (data.success) {
                    toast.success("Godown updated successfully!");
                    setEditMode(false);
                    setInputValue(initialState);
                    setReload(!reload);
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => {
                toast.error("Failed to update Godown");
            })
            .finally(() => setIsSubmitting(false));
    };

    const handleCloseCreateDialog = () => {
        if (!isSubmitting) {
            setIsCreateDialogOpen(false);
            setInputValue(initialState);
        }
    };

    const handleCloseEditDialog = () => {
        if (!isSubmitting) {
            setEditMode(false);
            setInputValue(initialState);
        }
    };

    const handleCloseDeleteDialog = () => {
        if (!isSubmitting) {
            setOpen(false);
        }
    };

    return (
        <>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    GODOWN MASTER
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ width: "300px" }}>
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                placeholder="Search Godown..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />,
                                    style: { height: "40px" },
                                }}
                            />
                        </div>
                        <Button
                            variant="contained"
                            size="small"
                            className="rounded-1 btn-primary"
                            onClick={() => {
                                setIsCreateDialogOpen(true);
                                setInputValue(initialState);
                            }}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 500,
                                px: 2,
                                height: '40px'
                            }}
                        >
                            Create Godown
                        </Button>
                    </div>
                </div>


                <FilterableTable
                    dataArray={filteredAccountList}
                    EnableSerialNumber={true}
                    maxHeightOption
                    columns={[
                        // createCol("Godown_Id", "string", "Id"),
                        createCol("Godown_Name", "string", "Godown_Name"),
                        {
                            ColumnHeader: "Actions",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                <td style={{ minWidth: "80px" }}>
                                    <IconButton onClick={() => editRow(row)} size="small">
                                        <Edit />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {
                                            setOpen(true);
                                            setInputValue({ Godown_Id: row.Godown_Id, Godown_Name: row.Godown_Name });
                                        }}
                                        size="small"
                                        color="error"
                                    >
                                        <Delete />
                                    </IconButton>
                                </td>
                            ),
                        },
                    ]}
                />
            </div>

            <Dialog
                open={isCreateDialogOpen}
                onClose={handleCloseCreateDialog}
            >
                <DialogTitle>Create Godown</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Godown Name*</label>
                        <input
                            type="text"
                            value={inputValue.Godown_Name}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, Godown_Name: e.target.value })
                            }
                            className="cus-inpt"
                            placeholder="Enter Godown Name"
                        />
                    </div>


                </DialogContent>
                <DialogActions>
                    <MuiButton
                        onClick={handleCloseCreateDialog}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        onClick={handleCreate}
                        color="primary"
                        disabled={isSubmitting || !inputValue.Godown_Name}
                    >
                        {isSubmitting ? "Creating..." : "Create"}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editMode}
                onClose={handleCloseEditDialog}
            >
                <DialogTitle>Edit Godown</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Godown Name*</label>
                        <input
                            type="text"
                            value={inputValue.Godown_Name}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, Godown_Name: e.target.value })
                            }
                            className="cus-inpt"
                        />
                    </div>


                </DialogContent>
                <DialogActions>
                    <MuiButton
                        onClick={handleCloseEditDialog}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        onClick={handleEdit}
                        color="primary"
                        disabled={isSubmitting || !inputValue.Godown_Id}
                    >
                        {isSubmitting ? "Updating..." : "Update"}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={open}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Confirmation"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <b  >{`Do you want to delete the ${inputValue.Godown_Name}?`}</b>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={handleCloseDeleteDialog}>Cancel</MuiButton>
                    <MuiButton onClick={handleDelete} autoFocus sx={{ color: 'red' }}>
                        {isSubmitting ? "Deleting..." : "Delete"}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Godown;