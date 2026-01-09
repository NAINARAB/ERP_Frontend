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

// CORRECTED: Use consistent camelCase for all fields
const initialState = {
    Acc_Id: "",
    Account_name: "",
    Account_Alias_Name: "",
    Group_Id: "",
    creditLimit: '',  // camelCase
    creditDays: '',   // camelCase
    percentageValue: ''  // camelCase
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
        fetchLink({ address: `masters/accountGroup/dropdown` })
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

    // CORRECTED: Properly map API response fields to inputValue
    const editRow = (row) => {
        setInputValue({
            Acc_Id: row.Acc_Id,
            Account_name: row.Account_name,
            Account_Alias_Name: row.Account_Alias_Name,
            Group_Id: row.Group_Id,
            creditLimit: row.creditLimit || row.CreditLimit || "",  // Handle both cases
            creditDays: row.creditDays || row.CreditDays || "",    // Handle both cases
            percentageValue: row.percentageValue || row.PercentageValue || ""  // Handle both cases
        });
        setEditMode(true);
    };

    // CORRECTED: Use proper field names
    const handleEdit = () => {
        const { Acc_Id, Account_name, Group_Id, creditLimit, creditDays, percentageValue } = inputValue;
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
                        createCol("creditLimit", "number", "Credit Limit"),
                        createCol("creditDays", "number", "Credit Days"),
                        createCol("percentageValue", "number", "Percentage Value"),
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

            {/* Create Dialog */}
            <Dialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                maxWidth="sm"
                fullWidth
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
                            className="cus-inpt w-100"
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
                            className="cus-inpt w-100"
                        />
                    </div>
                    <div className="p-2">
                        <label>Group Name*</label>
                        <Select
                            value={inputValue.Group_Id}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, Group_Id: e.target.value })
                            }
                            fullWidth
                            displayEmpty
                        >
                            <MenuItem value="">Select Group</MenuItem>
                            {groupList.map((group) => (
                                <MenuItem key={group.value} value={group.value}>
                                    {group.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </div>
                    <div className="p-2">
                        <label>Credit Limit</label>
                        <input
                            type="number"
                            value={inputValue.creditLimit}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, creditLimit: e.target.value })
                            }
                            className="cus-inpt w-100"
                            placeholder="Enter Credit Limit"
                        />
                    </div>
                    <div className="p-2">
                        <label>Credit Days</label>
                        <input
                            type="number"
                            value={inputValue.creditDays}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, creditDays: e.target.value })
                            }
                            className="cus-inpt w-100"
                            placeholder="Enter Credit Days"
                        />
                    </div>
                    <div className="p-2">
                        <label>Percentage Value</label>
                        <input
                            type="number"
                            value={inputValue.percentageValue}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, percentageValue: e.target.value })
                            }
                            className="cus-inpt w-100"
                            placeholder="Enter Percentage Value"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                    </MuiButton>
                    <MuiButton onClick={handleCreate} color="success" variant="contained">
                        Create
                    </MuiButton>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog 
                open={editMode} 
                onClose={() => {
                    setEditMode(false);
                    setInputValue(initialState);
                }}
                maxWidth="sm"
                fullWidth
            >
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
                            className="cus-inpt w-100"
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
                            className="cus-inpt w-100"
                        />
                    </div>
                    <div className="p-2">
                        <label>Group Name*</label>
                        <FormControl fullWidth>
                            <Select
                                value={inputValue.Group_Id}
                                onChange={(e) =>
                                    setInputValue({ ...inputValue, Group_Id: e.target.value })
                                }
                                displayEmpty
                            >
                                <MenuItem value="">Select Group</MenuItem>
                                {groupList.map((group) => (
                                    <MenuItem key={group.value} value={group.value}>
                                        {group.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="p-2">
                        <label>Credit Limit</label>
                        <input
                            type="number"
                            value={inputValue.creditLimit}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, creditLimit: e.target.value })
                            }
                            className="cus-inpt w-100"
                        />
                    </div>
                    <div className="p-2">
                        <label>Credit Days</label>
                        <input
                            type="number"
                            value={inputValue.creditDays}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, creditDays: e.target.value })
                            }
                            className="cus-inpt w-100"
                        />
                    </div>
                    <div className="p-2">
                        <label>Percentage Value</label>
                        <input
                            type="number"
                            value={inputValue.percentageValue}
                            onChange={(e) =>
                                setInputValue({ ...inputValue, percentageValue: e.target.value })
                            }
                            className="cus-inpt w-100"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => {
                        setEditMode(false);
                        setInputValue(initialState);
                    }}>
                        Cancel
                    </MuiButton>
                    <MuiButton onClick={handleEdit} color="success" variant="contained">
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
                    <MuiButton onClick={handleDelete} color="error" variant="contained">
                        Delete
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default AccountMaster;