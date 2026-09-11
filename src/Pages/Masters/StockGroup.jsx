import React, { useState, useEffect, Fragment, useCallback, useMemo } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, MenuItem } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Edit, Search } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

function StockGroup() {
    const localData = localStorage.getItem("user");
    const parseData = JSON.parse(localData);

    const initialState = {
        St_Group_Id: "",
        St_Group: "",
        Alias_Name: "",
        Parent_Id: 0,
        Entry_By: parseData?.UserId,
        Company_id: parseData?.Company_id
    };

    const [reload, setReload] = useState(false);
    const [stockGroups, setStockGroups] = useState([]);
    const [filteredStockGroups, setFilteredStockGroups] = useState([]);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editState, setEditState] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchStockGroups = useCallback(async () => {
        try {
            const data = await fetchLink({
                address: `masters/stockgroup`
            });
            if (data.success) {
                setStockGroups(data.data);
                setFilteredStockGroups(data.data);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to fetch stock groups");
        }
    }, [parseData?.Company_id]);

    useEffect(() => {
        fetchStockGroups();
    }, [fetchStockGroups, reload]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredStockGroups(stockGroups);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = stockGroups.filter(item =>
                item.St_Group?.toLowerCase().includes(term) ||
                item.Alias_Name?.toLowerCase().includes(term)
            );
            setFilteredStockGroups(filtered);
        }
    }, [searchTerm, stockGroups]);

    // St_Group_Id -> St_Group name, for the readable Parent Group column
    const groupNameById = useMemo(() => {
        const map = {};
        stockGroups.forEach(g => { map[g.St_Group_Id] = g.St_Group; });
        return map;
    }, [stockGroups]);

    const handleCreate = async () => {
        if (!inputValue.St_Group.trim()) {
            toast.error("Group name is required");
            return;
        }
        try {
            const data = await fetchLink({
                address: `masters/stockgroup`,
                method: "POST",
                bodyData: {
                    St_Group: inputValue.St_Group,
                    Alias_Name: inputValue.Alias_Name,
                    Parent_Id: inputValue.Parent_Id || 0,
                    Entry_By: parseData?.UserId,
                    Company_id: parseData?.Company_id
                },
            });
            if (data.success) {
                setIsCreateDialogOpen(false);
                setReload(prev => !prev);
                toast.success('Stock Group Added Successfully');
                setInputValue(initialState);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error creating stock group");
        }
    };

    const editRow = (row) => {
        setEditState(true);
        setInputValue({
            St_Group_Id: row.St_Group_Id,
            St_Group: row.St_Group,
            Alias_Name: row.Alias_Name || "",
            Parent_Id: row.Parent_Id || 0,
            Entry_By: parseData?.UserId,
            Company_id: parseData?.Company_id
        });
    };

    const editFun = async () => {
        if (!inputValue.St_Group.trim()) {
            toast.error("Group name is required");
            return;
        }
        try {
            const data = await fetchLink({
                address: `masters/stockgroup`,
                method: "PUT",
                bodyData: {
                    St_Group_Id: inputValue.St_Group_Id,
                    St_Group: inputValue.St_Group,
                    Alias_Name: inputValue.Alias_Name,
                    Parent_Id: inputValue.Parent_Id || 0,
                    Entry_By: parseData?.UserId,
                    Company_id: parseData?.Company_id
                },
            });
            if (data.success) {
                toast.success('Stock Group Updated Successfully');
                setReload(prev => !prev);
                setEditState(false);
                setInputValue(initialState);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error updating stock group");
        }
    };

    const renderParentSelect = () => (
        <TextField
            select
            fullWidth
            label="Parent Group"
            value={inputValue.Parent_Id || 0}
            onChange={(event) =>
                setInputValue({ ...inputValue, Parent_Id: event.target.value })
            }
            className="mt-2"
        >
            <MenuItem value={0}>No Parent (top level)</MenuItem>
            {stockGroups
                .filter(g => g.St_Group_Id !== inputValue.St_Group_Id)
                .map(g => (
                    <MenuItem key={g.St_Group_Id} value={g.St_Group_Id}>
                        {g.St_Group}
                    </MenuItem>
                ))}
        </TextField>
    );

    return (
        <Fragment>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    STOCK GROUP MASTER
                    <div className="d-flex align-items-center">
                        <div className="d-flex justify-content-end">
                            <div className="p-2" style={{ width: "300px" }}>
                                <div className="d-flex align-items-center gap-2">
                                    <Search />
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                        placeholder="Search stock group..."
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
                            Create Stock Group
                        </Button>
                    </div>
                </div>

                <FilterableTable
                    dataArray={filteredStockGroups}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    maxHeightOption
                    columns={[
                        createCol('St_Group', 'string', 'Group Name'),
                        createCol('Alias_Name', 'string', 'Alias'),
                        {
                            Field_Name: "Parent_Id",
                            ColumnHeader: "Parent Group",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                <td className="fa-12">
                                    {row.Parent_Id ? (groupNameById[row.Parent_Id] || row.Parent_Id) : '—'}
                                </td>
                            ),
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
                fullWidth maxWidth="xs"
            >
                <DialogTitle id="create-dialog-title">CREATE STOCK GROUP</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>GROUP NAME</label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    St_Group: event.target.value,
                                })
                            }
                            placeholder="Enter group name"
                            value={inputValue.St_Group}
                            className="cus-inpt"
                        />
                    </div>
                    <div className="p-2">
                        <label>ALIAS NAME</label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    Alias_Name: event.target.value,
                                })
                            }
                            placeholder="Enter alias name"
                            value={inputValue.Alias_Name}
                            className="cus-inpt"
                        />
                    </div>
                    <div className="p-2">
                        {renderParentSelect()}
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
                open={editState}
                onClose={() => {
                    setEditState(false);
                    setInputValue(initialState);
                }}
                aria-labelledby="edit-dialog-title"
                fullWidth maxWidth="xs"
            >
                <DialogTitle id="edit-dialog-title">EDIT STOCK GROUP</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>GROUP NAME</label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    St_Group: event.target.value,
                                })
                            }
                            placeholder="Enter group name"
                            value={inputValue.St_Group}
                            className="cus-inpt"
                        />
                    </div>
                    <div className="p-2">
                        <label>ALIAS NAME</label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    Alias_Name: event.target.value,
                                })
                            }
                            placeholder="Enter alias name"
                            value={inputValue.Alias_Name}
                            className="cus-inpt"
                        />
                    </div>
                    <div className="p-2">
                        {renderParentSelect()}
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => {
                        setEditState(false);
                        setInputValue(initialState);
                    }}>Cancel</MuiButton>
                    <MuiButton onClick={editFun} color="success">
                        Update
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default StockGroup;