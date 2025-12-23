import React, { useState, useEffect, Fragment } from "react";
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    Voucher_Type_Id: "",
    Voucher_Type: "",
    Voucher_Code: "",
    Branch_Id: "",
    Branch_Name: "",
    Type: "",
    Voucher_Group_Id: "",
    Group_Name: "",
};

function VoucherMaster() {
    const [voucherData, setVoucherData] = useState([]);
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);

    const [voucherType, setVoucherType] = useState("");
    const [districts, setDistricts] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [types, setTypes] = useState("");
    const [voucherCode, setVoucherCode] = useState("");
    const [voucherGroup, setVoucherGroup] = useState([]);
    const [selectedVoucherGroup, setSelectedVoucherGroup] = useState("");
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?.UserId;

    useEffect(() => {
        fetchLink({
            address: `masters/voucher?showDeleted=1`,
        })
            .then((data) => {
                if (data.success) {
                    setVoucherData(data.data);
                }
            })
            .catch((e) => console.error(e));

        fetchLink({
            address: `masters/branch/dropDown`,
        })
            .then((data) => {
                if (data.success) {
                    setDistricts(data.data);
                }
            })
            .catch((e) => console.error(e));

        fetchLink({
            address: `masters/voucherGroup`,
        })
            .then((data) => {
                if (data.success) {
                    setVoucherGroup(data.data);
                }
            })
            .catch((e) => console.error(e));
    }, [reload]);

    const handleDelete = () => {
        fetchLink({
            address: `masters/voucher`,
            method: "DELETE",
            bodyData: {
                Vocher_Type_Id: inputValue.Voucher_Type_Id, // Changed to match backend
            },
        })
            .then((data) => {
                if (data.success) {
                    setReload(!reload);
                    setOpen(false);
                    toast.success("Voucher Type deleted successfully!");
                } else {
                    toast.error("Failed to delete voucher: " + data.message);
                }
            })
            .catch((e) => {
                console.error(e);
                toast.error("Error deleting voucher");
            });
    };
    
    const handleCreate = () => {
        if (
            !selectedBranch ||
            !voucherType ||
            !types ||
            !voucherCode ||
            !selectedVoucherGroup
        ) {
            toast.error("Please fill all fields");
            return;
        }
        fetchLink({
            address: `masters/voucher`,
            method: "POST",
            bodyData: {
                Voucher_Type: voucherType,
                Branch_Id: Number(selectedBranch),
                Type: types,
                Voucher_Code: voucherCode,
                Voucher_Group_Id: Number(selectedVoucherGroup),
                Created_By: userId,
            },
        })
            .then((data) => {
                if (data.success) {
                    setIsCreateDialogOpen(false);
                    setReload(!reload);
                    toast.success(data.message);
                    setVoucherType("");
                    setSelectedBranch("");
                    setTypes("");
                    setVoucherCode("");
                    setSelectedVoucherGroup("");
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    const editRow = (user) => {
        setEditUser(true);
        setInputValue({
            Voucher_Type_Id: user.Vocher_Type_Id,
            Voucher_Type: user.Voucher_Type,
            Branch_Id: user.Branch_Id,
            Voucher_Code: user.Voucher_Code,
            Type: user.Type,
            Voucher_Group_Id: user.Voucher_Group_Id,
        });
        setSelectedBranch(user.Branch_Id);
        setSelectedVoucherGroup(user.Voucher_Group_Id);
    };

    const editFun = () => {
        fetchLink({
            address: `masters/voucher`,
            method: "PUT",
            bodyData: {
                Vocher_Type_Id: inputValue.Voucher_Type_Id,
                Voucher_Type: inputValue.Voucher_Type,
                Branch_Id: inputValue.Branch_Id,
                Voucher_Code: inputValue.Voucher_Code,
                Type: inputValue.Type,
                Voucher_Group_Id: inputValue.Voucher_Group_Id,
                Alter_By: userId,
            },
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    setEditUser(false);
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.error(e));
    };

    return (
        <Fragment>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    Voucher Master
                    <div className="text-end">
                        <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            Create Voucher
                        </Button>
                    </div>
                </div>

                <FilterableTable
                    dataArray={voucherData}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    maxHeightOption
                    columns={[
                        createCol("Voucher_Type", "string", "Voucher Type"),
                        createCol("Type", "string", "Type"),
                        createCol("BranchName", "string", "Branch Name"),
                        createCol("Voucher_Code", "string", "Voucher Code"),
                        createCol("Group_Name", "string", "Voucher Group"),
                        {
                            ColumnHeader: "Actions",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => {
                                return (
                                    <td className="fa-12" style={{ minWidth: "80px" }}>
                                        <IconButton onClick={() => editRow(row)} size="small">
                                            <Edit className="fa-in" />
                                        </IconButton>
                                        <IconButton
                                            onClick={() => {
                                                setOpen(true);
                                                setInputValue({ Voucher_Type_Id: row.Vocher_Type_Id });
                                            }}
                                            size="small"
                                            color="error"
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
                aria-describedby="create-dialog-description"
            >
                <DialogTitle id="create-dialog-title">Voucher Creation</DialogTitle>
                <DialogContent>
                    <div>
                        <div className="p-2">
                            <label>Voucher Name</label>
                            <input
                                type="text"
                                onChange={(event) => setVoucherType(event.target.value)}
                                placeholder=""
                                value={voucherType}
                                className="cus-inpt"
                            />
                        </div>

                        <div className="p-2">
                            <label>Branch</label>
                            <select
                                value={selectedBranch}
                                onChange={(event) => setSelectedBranch(event.target.value)}
                                className="cus-inpt"
                            >
                                <option value="">Select Branch</option>
                                {districts.map((district) => (
                                    <option key={district.BranchId} value={district.BranchId}>
                                        {district.BranchName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="p-2">
                            <label>Voucher Group</label>
                            <select
                                value={selectedVoucherGroup}
                                onChange={(event) =>
                                    setSelectedVoucherGroup(event.target.value)
                                }
                                className="cus-inpt"
                            >
                                <option value="">Select Voucher Group</option>
                                {voucherGroup.map((vou) => (
                                    <option
                                        key={vou.Voucher_Group_Id}
                                        value={vou.Voucher_Group_Id}
                                    >
                                        {vou.Group_Name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="p-2">
                            <label>Voucher Code</label>
                            <input
                                type="text"
                                onChange={(event) => setVoucherCode(event.target.value)}
                                placeholder=""
                                value={voucherCode}
                                className="cus-inpt"
                            />
                        </div>

                        <div className="p-2">
                            <label>Type</label>
                            <input
                                type="text"
                                onChange={(event) => setTypes(event.target.value)}
                                placeholder=""
                                value={types}
                                className="cus-inpt"
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                    </MuiButton>
                    <MuiButton onClick={handleCreate} color="success">
                        CREATE
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editUser}
                onClose={() => setEditUser(false)}
                aria-labelledby="create-dialog-title"
                aria-describedby="create-dialog-description"
            >
                <DialogTitle id="create-dialog-title">Edit Voucher</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Voucher Type</label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    Voucher_Type: event.target.value,
                                })
                            }
                            placeholder={inputValue.Voucher_Type}
                            value={inputValue.Voucher_Type}
                            className="cus-inpt"
                        />
                    </div>

                    <div className="p-2">
                        <label>Branch</label>
                        <select
                            value={selectedBranch}
                            onChange={(event) => {
                                setSelectedBranch(event.target.value);
                                setInputValue({
                                    ...inputValue,
                                    Branch_Id: event.target.value,
                                });
                            }}
                            className="cus-inpt"
                        >
                            <option value="">Select Branch</option>
                            {districts.map((district) => (
                                <option key={district.BranchId} value={district.BranchId}>
                                    {district.BranchName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="p-2">
                        <label>Voucher Group</label>
                        <select
                            value={selectedVoucherGroup}
                            onChange={(event) => {
                                setSelectedVoucherGroup(event.target.value);
                                setInputValue({
                                    ...inputValue,
                                    Voucher_Group_Id: event.target.value,
                                });
                            }}
                            className="cus-inpt"
                        >
                            <option value="">Select Voucher Group</option>
                            {voucherGroup.map((vou) => (
                                <option key={vou.Voucher_Group_Id} value={vou.Voucher_Group_Id}>
                                    {vou.Group_Name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="p-2">
                        <label>Voucher Code</label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    Voucher_Code: event.target.value,
                                })
                            }
                            placeholder={inputValue.Voucher_Code}
                            value={inputValue.Voucher_Code}
                            className="cus-inpt"
                        />
                    </div>

                    <div className="p-2">
                        <label>Type</label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    Type: event.target.value,
                                })
                            }
                            placeholder={inputValue.Type}
                            value={inputValue.Type}
                            className="cus-inpt"
                        />
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setEditUser(false)}>Cancel</MuiButton>
                    <MuiButton onClick={editFun} color="success">
                        Update
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
                <DialogContent>
                    <b>Do you want to delete the Voucher?</b>
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

export default VoucherMaster;