import React, { useState, useEffect } from "react";
import {
    TableContainer,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    Button,
} from "@mui/material";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchLink } from "../../Components/fetchComponent";
import { customSelectStyles } from "../../Components/tablecolumn";

const UserBasedBranch = (props) => {
    const [users, setUsers] = useState([]);
    const [branches, setBranches] = useState([]); // saved state from DB
    const [tempBranches, setTempBranches] = useState([]); // local edits before Save
    const [currentUser, setCurrentUser] = useState(null);
    const [saving, setSaving] = useState(false);

    // Get company_id from local storage
    const localData = JSON.parse(localStorage.getItem("user") || "{}");
    const companyId = localData?.Company_id;

    // Fetch all users for dropdown
    useEffect(() => {
        if (!companyId) return;
        fetchLink({
            address: `masters/users?Company_id=${companyId}`,
        })
            .then((data) => {
                if (data.success) setUsers(data.data);
                else toast.error("Failed to load users");
            })
            .catch((e) => console.error(e));
    }, [companyId]);

    // Fetch branches for selected user
    useEffect(() => {
        if (currentUser) {
            fetchLink({
                address: `authorization/userBranches?UserId=${currentUser.value}`,
            })
                .then((data) => {
                    if (data.success) {
                        setBranches(data.data);
                        setTempBranches(data.data); // clone for local changes
                    } else toast.error("Failed to load branches");
                })
                .catch((e) => console.error(e));
        }
    }, [currentUser]);

    // Handle checkbox toggle (only update tempBranches)
    const handleTempChange = (branchId, checked) => {
        setTempBranches((prev) =>
            prev.map((b) =>
                b.id === branchId ? { ...b, HasAccess: checked ? 1 : 0 } : b
            )
        );
    };

    // Save button → send changes to DB
    const handleSave = () => {
        if (!currentUser) {
            toast.error("Please select a user first");
            return;
        }

        setSaving(true);
        props.loadingOn && props.loadingOn();

        fetchLink({
            address: `authorization/userBranches/saveAll`,
            method: "POST",
            bodyData: {
                UserId: currentUser.value,
                Branches: tempBranches.map((b) => ({
                    BranchId: b.id,
                    HasAccess: b.HasAccess,
                })),
            },
            headers: { "Content-Type": "application/json" },
        })
            .then((data) => {
                if (data.success) {
                    toast.success("Branch access updated successfully");
                    setBranches([...tempBranches]);
                } else {
                    toast.error(data.message || "Failed to update branch access");
                    setTempBranches([...branches]);
                }
            })
            .catch((e) => {
                console.error(e);
                toast.error("Error while saving branch access");
                setTempBranches([...branches]);
            })
            .finally(() => {
                setSaving(false);
                props.loadingOff && props.loadingOff();
            });
    };

    return (
        <>
            <div className="row">
                <div className="col-sm-4 pt-1">
                    <Select
                        value={currentUser}
                        onChange={(e) => setCurrentUser(e)}
                        options={users.map((u) => ({ value: u.UserId, label: u.Name }))}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder="Select User"
                    />
                </div>
            </div>

            <br />
            <h6
                style={{
                    marginBottom: "0.5em",
                    borderBottom: "2px solid blue",
                    width: "fit-content",
                }}
            >
                Branch Access Control
            </h6>

            {tempBranches.length > 0 && (
                <>
                    <TableContainer component={Paper} sx={{ maxHeight: 650 }}>
                        <Table stickyHeader aria-label="branch-access-table">
                            <TableHead>
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            backgroundColor: "rgb(15, 11, 42)",
                                            color: "white",
                                        }}
                                    >
                                        ID
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            backgroundColor: "rgb(15, 11, 42)",
                                            color: "white",
                                        }}
                                    >
                                        Branch Name
                                    </TableCell>
                                    <TableCell
                                        sx={{
                                            backgroundColor: "rgb(15, 11, 42)",
                                            color: "white",
                                        }}
                                    >
                                        Action
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tempBranches.map((branch) => (
                                    <TableRow hover key={branch.id}>
                                        <TableCell>{branch.id}</TableCell>
                                        <TableCell>{branch.BranchName}</TableCell>
                                        <TableCell>
                                            <Checkbox
                                                sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                                                checked={branch.HasAccess === 1}
                                                onChange={(e) =>
                                                    handleTempChange(
                                                        branch.id,
                                                        e.target.checked
                                                    )
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Save button */}
                    <div style={{ marginTop: "1em", textAlign: "right" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </>
            )}
        </>
    );
};

export default UserBasedBranch;
