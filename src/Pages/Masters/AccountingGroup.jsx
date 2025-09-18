import { useState, useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    DialogContentText,
    MenuItem,
    Select,
    FormControl,
    TextField,
} from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit, Search } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    Group_Id: "",
    Group_Name: "",
    Alias_Name: "",
    Parent_AC_id: ""
};

function AccountingGroup() {
    const [reload, setReload] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editMode, setEditMode] = useState(false);
    const [accountList, setAccountList] = useState([]);
    const [filteredAccountList, setFilteredAccountList] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.UserId;

    useEffect(() => {
        const fetchAccountGroups = async () => {
            // setIsLoading(true);
            try {
                const data = await fetchLink({ address: `masters/accountGroup` });
                if (data.success) {
                    setAccountList(data.data);
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
        const fetchGroupDropdown = async () => {
            try {
                const data = await fetchLink({ address: `masters/accountGroup/dropdown` });
                if (data.success) setGroupList(data.data);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load group dropdown");
            }
        };

        fetchGroupDropdown();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredAccountList(accountList);
        } else {
            const filtered = accountList.filter(
                (account) =>
                (account.Group_Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    account.Alias_Name?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredAccountList(filtered);
        }
    }, [searchTerm, accountList]);


    const handleDelete = async () => {
        setIsSubmitting(true);
        const deletedItemId = inputValue.Group_Id;

        try {
            setAccountList(prev => prev.filter(item => item.Group_Id !== deletedItemId));
            setFilteredAccountList(prev => prev.filter(item => item.Group_Id !== deletedItemId));

            const data = await fetchLink({
                address: `masters/accountGroup`,
                method: "DELETE",
                bodyData: { Group_Id: deletedItemId },
            });

            if (data.success) {
                toast.success("Account group deleted successfully!");
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
        const { Group_Name, Alias_Name } = inputValue;
        if (!Group_Name || !Alias_Name) {
            toast.error("Please fill all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await fetchLink({
                address: `masters/accountGroup`,
                method: "POST",
                bodyData: {
                    ...inputValue,
                    Created_By: userId,
                },
            });

            if (data.success) {
                toast.success("Account group created successfully!");
                setIsCreateDialogOpen(false);
                setInputValue(initialState);
                setReload(prev => !prev);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to create account group");
        } finally {
            setIsSubmitting(false);
        }
    };

    const editRow = (row) => {
        console.log("row", row)
        setInputValue({
            Group_Id: row.Group_Id,
            Group_Name: row.Group_Name,
            Alias_Name: row.Alias_name,
            Parent_AC_id: row.Parent_AC_id
        });
        setEditMode(true);
    };

    const handleEdit = () => {
        const { Group_Id, Group_Name } = inputValue;
        if (!Group_Id || !Group_Name) {
            toast.error("All required fields must be filled.");
            return;
        }

        setIsSubmitting(true);
        fetchLink({
            address: `masters/accountGroup`,
            method: "PUT",
            bodyData: {
                ...inputValue,
                Alter_By: userId,
            },
        })
            .then((data) => {
                if (data.success) {
                    toast.success("Account group updated successfully!");
                    setEditMode(false);
                    setInputValue(initialState);
                    setReload(!reload);
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => {
                console.error(e);
                toast.error("Failed to update account group");
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
                    Account Group Master
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ width: "300px" }}>
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                placeholder="Search Group..."
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
                            Create Account Master
                        </Button>
                    </div>
                </div>


                <FilterableTable
                    dataArray={filteredAccountList}
                    EnableSerialNumber={true}
                    maxHeightOption
                    columns={[
                        createCol("Group_Name", "string", "Group"),
                        createCol("Alias_name", "string", "Alias Name"),
                        createCol("Parent_Group_Name", "string", "Parent AC"),
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
                                            setInputValue({ Group_Id: row.Group_Id, Group_Name: row.Group_Name });
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
                <DialogTitle>Create Account Group</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Group Name*</label>
                        <input
                            type="text"
                            value={inputValue.Group_Name}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, Group_Name: e.target.value })
                            }
                            className="cus-inpt"
                            placeholder="Enter Group Name"
                        />
                    </div>
                    <div className="p-2">
                        <label>Alias Name*</label>
                        <input
                            type="text"
                            placeholder="Alias Name"
                            value={inputValue.Alias_Name}
                            onChange={(e) =>
                                setInputValue({
                                    ...inputValue,
                                    Alias_Name: e.target.value,
                                })
                            }
                            className="cus-inpt"
                        />
                    </div>
                    <div className="p-2">
                        <label>Parent Account Group</label>
                        <FormControl fullWidth>
                            <Select
                                labelId="parent-group-select-label"
                                value={inputValue.Parent_AC_id}
                                onChange={(e) =>
                                    setInputValue({ ...inputValue, Parent_AC_id: e.target.value })
                                }
                                displayEmpty
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {groupList.map((group) => (
                                    <MenuItem key={group.value} value={group.value}>
                                        {group.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
                        disabled={isSubmitting || !inputValue.Group_Name}
                    >
                        {isSubmitting ? "Creating..." : "Create"}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editMode}
                onClose={handleCloseEditDialog}
            >
                <DialogTitle>Edit Account Group</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Group Name*</label>
                        <input
                            type="text"
                            value={inputValue.Group_Name}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, Group_Name: e.target.value })
                            }
                            className="cus-inpt"
                        />
                    </div>
                    <div className="p-2">
                        <label>Alias Name*</label>
                        <input
                            type="text"
                            value={inputValue.Alias_Name}
                            onChange={(e) =>
                                setInputValue({
                                    ...inputValue,
                                    Alias_Name: e.target.value,
                                })
                            }
                            className="cus-inpt"
                        />
                    </div>
                    <div className="p-2">
                        <label>Parent Account Group</label>
                        <FormControl fullWidth>
                            <Select
                                labelId="parent-group-edit-select-label"
                                value={inputValue.Parent_AC_id}
                                onChange={(e) =>
                                    setInputValue({ ...inputValue, Parent_AC_id: e.target.value })
                                }
                                displayEmpty
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                {groupList.map((group) => (
                                    <MenuItem key={group.value} value={group.value}>
                                        {group.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
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
                        disabled={isSubmitting || !inputValue.Group_Name}
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
                        <b  >{`Do you want to delete the ${inputValue.Group_Name} Group?`}</b>
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

export default AccountingGroup;