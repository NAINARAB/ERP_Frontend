import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
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
    Acc_Id: "",
    Account_name: "",
    Account_Alias_Name: "",
    Group_Id: "",
};

function AccountMaster() {
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editMode, setEditMode] = useState(false);
    const [accountList, setAccountList] = useState([]);
    const [filteredAccountList, setFilteredAccountList] = useState([]);
    const [groupList, setGroupList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.UserId;

    useEffect(() => {
        fetchLink({ address: `masters/accountMaster` })
            .then((data) => {
                if (data.success) {
                    setAccountList(data.data);
                    setFilteredAccountList(data.data);
                }
            })
            .catch((e) => console.error(e));
    }, [reload]);

    useEffect(() => {
        fetchLink({ address: `masters/account/dropdown` })
            .then((data) => {
                if (data.success) setGroupList(data.data);
            })
            .catch((e) => console.error(e));
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredAccountList(accountList);
        } else {
            const filtered = accountList.filter(
                (account) =>
                    account.Account_name.toLowerCase().includes(
                        searchTerm.toLowerCase()
                    ) ||
                    account.Account_Alias_Name.toLowerCase().includes(
                        searchTerm.toLowerCase()
                    ) ||
                    account.Group_Name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredAccountList(filtered);
        }
    }, [searchTerm, accountList]);

    const handleDelete = () => {
        fetchLink({
            address: `masters/accountMaster`,
            method: "DELETE",
            bodyData: { Acc_Id: inputValue.Acc_Id },
        })
            .then((data) => {
                if (data.success) {
                    toast.success("Account deleted successfully!");
                    setReload(!reload);
                    setOpen(false);
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const handleCreate = () => {
        const { Account_name, Group_Id } = inputValue;
        if (!Account_name || !Group_Id) {
            toast.error("Please fill all required fields.");
            return;
        }

        fetchLink({
            address: `masters/accountMaster`,
            method: "POST",
            bodyData: {
                ...inputValue,
                Created_By: userId,
            },
        })
            .then((data) => {
                if (data.success) {
                    toast.success("Account Master created successfully!");
                    setIsCreateDialogOpen(false);
                    setInputValue(initialState);
                    setReload(!reload);
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const editRow = (row) => {
        setInputValue({
            Acc_Id: row.Acc_Id,
            Account_name: row.Account_name,
            Account_Alias_Name: row.Account_Alias_Name,
            Group_Id: row.Group_Id,
        });
        setEditMode(true);
    };

    const handleEdit = () => {
        const { Acc_Id, Account_name, Group_Id } = inputValue;
        if (!Acc_Id || !Account_name || !Group_Id) {
            toast.error("All required fields must be filled.");
            return;
        }

        fetchLink({
            address: `masters/accountMaster`,
            method: "PUT",
            bodyData: {
                ...inputValue,
                Alter_By: userId,
            },
        })
            .then((data) => {
                if (data.success) {
                    toast.success("Account updated successfully!");
                    setEditMode(false);
                    setInputValue(initialState);
                    setReload(!reload);
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
                    Account Master
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ width: "300px" }}>
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                placeholder="Search accounts..."
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
                        createCol("Account_name", "string", "Account Name"),
                        createCol("Account_Alias_Name", "string", "Alias Name"),
                        createCol("Group_Name", "string", "Group"),
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
                                            setInputValue({ Acc_Id: row.Acc_Id });
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
                onClose={() => setIsCreateDialogOpen(false)}
            >
                <DialogTitle>Account Master Creation</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Account Name*</label>
                        <input
                            type="text"
                            value={inputValue.Account_name}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, Account_name: e.target.value })
                            }
                            className="cus-inpt"
                            placeholder="Enter Account Name"
                        />
                    </div>
                    <div className="p-2">
                        <label>Account Alias Name</label>
                        <input
                            type="text"
                            placeholder="Alias Name"
                            value={inputValue.Account_Alias_Name}
                            onChange={(e) =>
                                setInputValue({
                                    ...inputValue,
                                    Account_Alias_Name: e.target.value,
                                })
                            }
                            className="cus-inpt"
                        />
                    </div>
                    <div className="p-2">
                        <label>Group Name*</label>
                        <Select
                            labelId="group-select-label"
                            value={inputValue.Group_Id}
                            label="Group"
                            onChange={(e) =>
                                setInputValue({ ...inputValue, Group_Id: e.target.value })
                            }
                            fullWidth
                        >
                            {groupList.map((group) => (
                                <MenuItem key={group.Value} value={group.Value}>
                                    {group.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                    </MuiButton>
                    <MuiButton onClick={handleCreate} color="success">
                        Create
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editMode} onClose={() => setEditMode(false)}>
                <DialogTitle>Edit Account</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Account Name*</label>
                        <input
                            type="text"
                            value={inputValue.Account_name}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, Account_name: e.target.value })
                            }
                            className="cus-inpt"
                        />
                    </div>
                    <div className="p-2">
                        <label>Alias Name</label>
                        <input
                            type="text"
                            value={inputValue.Account_Alias_Name}
                            onChange={(e) =>
                                setInputValue({
                                    ...inputValue,
                                    Account_Alias_Name: e.target.value,
                                })
                            }
                            className="cus-inpt"
                        />
                    </div>
                    <div className="p-2">
                        <label>Group Name*</label>
                        <FormControl fullWidth>
                            <Select
                                labelId="group-edit-select-label"
                                value={inputValue.Group_Id}
                                displayEmpty
                                onChange={(e) =>
                                    setInputValue({ ...inputValue, Group_Id: e.target.value })
                                }
                            >
                                <MenuItem disabled value="">
                                    Select Group
                                </MenuItem>
                                {groupList.map((group) => (
                                    <MenuItem key={group.Value} value={group.Value}>
                                        {group.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setEditMode(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleEdit} color="success">
                        Update
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <b>Do you want to delete this account?</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleDelete} color="error" autoFocus>
                        Delete
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AccountMaster;