import React, { useState, useEffect } from "react";
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
    District_Id: 0,
    District_Name: "",
    State_Id: 0,
    State_Name: ""
};

function DistrictMaster() {
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editMode, setEditMode] = useState(false);
    const [districtList, setDistrictList] = useState([]);
    const [filteredAccountList, setFilteredAccountList] = useState([]);
    const [dropDown, setDropDown] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchDistrict = async () => {
            try {
                const data = await fetchLink({ address: `masters/district` });
                if (data.success) {

                    setDistrictList(data.data);
                    setFilteredAccountList(data.data);
                }
            } catch (e) {
                console.error(e);
                toast.error("Failed to load districts");
            }
        };

        const fetchDropDown = async () => {
            try {
                const datafetch = await fetchLink({ address: `masters/state/dropDown` });
                if (datafetch.success) {
                    setDropDown(datafetch.data);
                }
            } catch (e) {
                console.log(e);
                toast.error("Failed to load State dropdown");
            }
        };

        fetchDistrict();
        fetchDropDown();
    }, [reload]);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredAccountList(districtList);
        } else {
            const filtered = districtList.filter((account) => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    String(account.District_Id).toLowerCase().includes(searchLower) ||
                    (account.District_Name && account.District_Name.toLowerCase().includes(searchLower)) ||
                    (account.State_Name && account.State_Name.toLowerCase().includes(searchLower))
                );
            });
            setFilteredAccountList(filtered);
        }
    }, [searchTerm, districtList]);
    const handleDelete = async () => {
        setIsSubmitting(true);
        const deletedItemId = inputValue.District_Id;

        try {
            setDistrictList(prev => prev.filter(item => item.District_Id !== deletedItemId));
            setFilteredAccountList(prev => prev.filter(item => item.District_Id !== deletedItemId));

            const data = await fetchLink({
                address: `masters/district`,
                method: "DELETE",
                bodyData: { District_Id: deletedItemId },
            });

            if (data.success) {
                toast.success("District deleted successfully!");
            } else {
                setReload(prev => !prev);
                toast.error(data.message || "Failed to delete district");
            }
        } catch (e) {
            console.error(e);
            setReload(prev => !prev);
            toast.error("Failed to delete district");
        } finally {
            setIsSubmitting(false);
            setOpen(false);
        }
    };

    const handleCreate = async () => {
        const { District_Name, State_Id } = inputValue;
        if (!District_Name || !State_Id) {
            toast.error("Please fill all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await fetchLink({
                address: `masters/district`,
                method: "POST",
                bodyData: {
                    ...inputValue
                },
            });

            if (data.success) {
                toast.success("District Created successfully!");
                setIsCreateDialogOpen(false);
                setInputValue(initialState);
                setReload(prev => !prev);
            } else {
                toast.error(data.message);
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to Create District");
        } finally {
            setIsSubmitting(false);
        }
    };

    const editRow = (row) => {
        setInputValue({
            District_Id: Number(row.District_Id),
            District_Name: row.District_Name,
            State_Id: Number(row.State_Id),
            State_Name: row.State_Name || ""
        });
        setEditMode(true);
    };
    const handleEdit = async () => {
        const { District_Id, District_Name, State_Id } = inputValue;

        // Convert to proper types
        const payload = {
            District_Id: Number(District_Id),
            District_Name: District_Name.trim(),
            State_Id: Number(State_Id),
            State_Name: inputValue.State_Name?.trim() || null
        };

        if (!payload.District_Id || !payload.District_Name || !payload.State_Id) {
            toast.error("All required fields must be properly filled.");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = await fetchLink({
                address: `masters/district`,
                method: "PUT",
                bodyData: payload
            });

            if (data.success) {
                toast.success("District updated successfully!");

                setDistrictList(prev => prev.map(item =>
                    item.District_Id === payload.District_Id ?
                        { ...item, ...payload } :
                        item
                ));
                setFilteredAccountList(prev => prev.map(item =>
                    item.District_Id === payload.District_Id ?
                        { ...item, ...payload } :
                        item
                ));
                setEditMode(false);
                setInputValue(initialState);
            } else {
                toast.error(data.message || "Update failed");
                setReload(prev => !prev); // Refresh data if update failed
            }
        } catch (e) {
            console.error("Update error:", e);
            toast.error(`Failed to update district: ${e.message}`);
            setReload(prev => !prev); // Refresh data on error
        } finally {
            setIsSubmitting(false);
        }
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

    const handleStateChange = (e) => {
        const selectedStateId = Number(e.target.value);
        if (isNaN(selectedStateId)) {
            toast.error("Invalid state selected");
            return;
        }
        const selectedState = dropDown.find(state => state.State_Id === selectedStateId);
        setInputValue({
            ...inputValue,
            State_Id: selectedStateId,
            State_Name: selectedState ? selectedState.State_Name : ""
        });
    };
    return (
        <>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    DISTRICT MASTER
                    <div className="d-flex align-items-center gap-3">
                        <div style={{ width: "300px" }}>
                            <TextField
                                fullWidth
                                size="small"
                                variant="outlined"
                                placeholder="Search District..."
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
                            Create District
                        </Button>
                    </div>
                </div>
                <FilterableTable
                    dataArray={filteredAccountList}
                    EnableSerialNumber={true}
                    maxHeightOption
                    columns={[
                        createCol("District_Name", "string", "District Name"),
                        createCol("State_Name", "string", "State"),
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
                                            setInputValue({
                                                District_Id: row.District_Id,
                                                District_Name: row.District_Name
                                            });
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

            <Dialog open={isCreateDialogOpen} onClose={handleCloseCreateDialog}>
                <DialogTitle>Create District</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <div className="mb-3">
                            <label htmlFor="stateSelect">State *</label>
                            <select
                                className="form-select form-select-sm"
                                id="editStateSelect"
                                value={inputValue.State_Id || ""}
                                onChange={(e) => {
                                    const selectedStateId = Number(e.target.value);
                                    const selectedState = dropDown.find(state => state.State_Id === selectedStateId);
                                    setInputValue({
                                        ...inputValue,
                                        State_Id: selectedStateId,
                                        State_Name: selectedState ? selectedState.State_Name : ""
                                    });
                                }}
                            >
                                <option value="">Select State</option>
                                {dropDown.map((state) => (
                                    <option key={state.State_Id} value={state.State_Id}>
                                        {state.State_Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="districtName" className="form-label">District Name *</label>
                            <input
                                type="text"
                                className="form-control form-control-mdf"
                                id="districtName"
                                value={inputValue.District_Name}
                                onChange={(e) => setInputValue({ ...inputValue, District_Name: e.target.value })}
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleCloseCreateDialog}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleCreate}
                        disabled={isSubmitting || !inputValue.District_Name || !inputValue.State_Id}
                    >
                        {isSubmitting ? "Creating..." : "Create"}
                    </button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editMode} onClose={handleCloseEditDialog}>
                <DialogTitle>Edit District</DialogTitle>
                <DialogContent>
                    <div className="p-3">
                        <div className="mb-3">
                            <label htmlFor="editStateSelect" className="form-label">State *</label>
                            <select
                                className="form-select form-select-sm"
                                id="editStateSelect"
                                value={inputValue.State_Id || ""}
                                onChange={handleStateChange}
                            >
                                <option value="">Select State</option>
                                {dropDown.map((state) => (
                                    <option key={state.State_Id} value={state.State_Id}>
                                        {state.State_Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="editDistrictName" className="form-label">District Name *</label>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                id="editDistrictName"
                                value={inputValue.District_Name}
                                onChange={(e) =>
                                    setInputValue({ ...inputValue, District_Name: e.target.value })
                                }
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <button
                        className="btn btn-secondary btn-sm me-2"
                        onClick={handleCloseEditDialog}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleEdit}
                        disabled={isSubmitting || !inputValue.District_Name || !inputValue.State_Id}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                Updating...
                            </>
                        ) : (
                            "Update"
                        )}
                    </button>
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
                        <b>{`Do you want to delete the ${inputValue.District_Name}?`}</b>
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

export default DistrictMaster;