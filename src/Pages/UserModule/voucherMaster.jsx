import React, { useState, useEffect, Fragment } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    Voucher_Type_Id: "",
    Voucher_Type: "",
    Branch_Id: "",
    Branch_Name: "",
    Type: ""
};

function VoucherMaster() {
    const [UserTypeData, setUserTypeData] = useState([]);
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);

    const [voucherType, setVouchertype] = useState("");
    const [districts, setDistricts] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState("");
    const [types, setTypes] = useState("");

    useEffect(() => {
        fetchLink({
            address: `masters/voucher`
        }).then((data) => {
            if (data.success) {
                setUserTypeData(data.data);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/branch/dropDown`
        }).then((data) => {
            if (data.success) {
                setDistricts(data.data);
            }
        }).catch(e => console.error(e));
    }, [reload]);

    const handleDelete = () => {
        fetchLink({
            address: `masters/voucher`,
            method: "DELETE",
            bodyData: { Vocher_Type_Id: inputValue.Voucher_Type_Id },
        }).then((data) => {
            if (data.success) {
                setReload(!reload);
                setOpen(false);
                toast.success("Voucher Type deleted successfully!");
            } else {
                toast.error("Failed to delete area:", data.message);
            }
        }).catch(e => console.error(e));
    };

    const handleCreate = () => {
        if (!selectedBranch || !voucherType || !types) {
            toast.error("Please fill all fields");
            return;
        }
        fetchLink({
            address: `masters/voucher`,
            method: "POST",
            bodyData: {
                Voucher_Type: voucherType,
                Branch_Id: Number(selectedBranch),
                Type: types
            },
        }).then((data) => {
            if (data.success) {
                setIsCreateDialogOpen(false);
                setReload(!reload);
                toast.success(data.message);
                setVouchertype("");

            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    const editRow = (user) => {
        setEditUser(true);
        setInputValue({
            Voucher_Type_Id: user.Vocher_Type_Id,
            Voucher_Type: user.Voucher_Type,
            Branch_Id: user.Branch_Id,
            Type: user.Type,
        });
        setSelectedBranch(user.Branch_Id);
    };

    const editFun = (Voucher_Type_Id, Voucher_Type, Branch_Id, Type) => {
        fetchLink({
            address: `masters/voucher`,
            method: "PUT",
            bodyData: { Voucher_Type_Id, Voucher_Type, Branch_Id, Type },
        }).then((data) => {
            if (data.success) {
                toast.success(data.message);
                setReload(!reload);
                setEditUser(false);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    return (
        <Fragment>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    Area
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
                    dataArray={UserTypeData}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    maxHeightOption
                    columns={[

                        createCol('Voucher_Type', 'string', 'Voucher_Type'),
                        createCol('Type', 'string', 'Type'),
                        createCol('BranchName', 'string', 'BranchName'),

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
                                                setInputValue({ Voucher_Type_Id: row.Vocher_Type_Id });
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
                                onChange={(event) => setVouchertype(event.target.value)}
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
                <DialogTitle id="create-dialog-title">voucherType</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>voucherType </label>
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
                        <label>Type </label>
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
                    <MuiButton onClick={() => editFun(inputValue.Voucher_Type_Id, inputValue.Voucher_Type, inputValue.Branch_Id, inputValue.Type)} color="success">
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
