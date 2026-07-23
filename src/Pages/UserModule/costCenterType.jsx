import React, { useState, useEffect, Fragment } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button, Table } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";

const initialState = {
    Cost_Category_Id: "",
    Cost_Category: "",
    Alias_Name: "",
    Order_By: "",
    IS_Active: 1,
};

function CostCenterType() {
    const [UserTypeData, setUserTypeData] = useState([]);
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [createValue, setCreateValue] = useState({
        Cost_Category: "",
        Alias_Name: "",
        Order_By: "",
        IS_Active: 1,
    });
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);

    useEffect(() => {
        fetchLink({
            address: `dataEntry/costCenter/category`
        }).then((data) => {
            if (data.success) {
                setUserTypeData(data.data);
            }
        }).catch(e => console.error(e))
    }, [reload]);

    const handleDelete = () => {
      
        fetchLink({
            address: `dataEntry/costCategory`,
            method: "DELETE",
            bodyData: { Cost_Category_Id: inputValue.Cost_Category_Id },
        }).then((data) => {
            if (data.success) {
                setReload(!reload);
                setOpen(false);
                toast.success("Cost_Category deleted successfully!");
            } else {
                toast.error("Failed to delete chip:", data.message);
            }
        }).catch(e => console.error(e));
    };

    const handleCreate = () => {
        fetchLink({
            address: `dataEntry/costCategory`,
            method: "POST",
            bodyData: createValue,
        }).then((data) => {
            if (data.success) {
                setIsCreateDialogOpen(false);
                setCreateValue({
                    Cost_Category: "",
                    Alias_Name: "",
                    Order_By: "",
                    IS_Active: 1,
                });
                setReload(!reload);
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e))
    };

    const editRow = (user) => {

        setEditUser(true);
        setInputValue({
            Cost_Category_Id: user.Cost_Category_Id,
            Cost_Category: user.Cost_Category,
            Alias_Name: user.Alias_Name || "",
            Order_By: user.Order_By || "",
            IS_Active: user.IS_Active ?? 1,
        });
    };

    const editFun = () => {
        fetchLink({
            address: `dataEntry/costCategory`,
            method: "PUT",
            bodyData: inputValue,
        }).then((data) => {
            if (data.success) {
                toast.success(data.message);
                setReload(!reload);
                setEditUser(false);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e))
    };

    return (
        <Fragment>
            {/* <ToastContainer /> */}
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                Cost_Category
                    <div className="text-end">
                        <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={() => setIsCreateDialogOpen(true)}
                        >
                            Create Cost_Category
                        </Button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <Table className="">
                            <thead>
                                <tr>
                                    <th className="fa-14">Cost_Category_Id</th>
                                    <th className="fa-14">Cost_Category</th>
                                    <th className="fa-14">Alias Name</th>
                                    <th className="fa-14">Order By</th>
                                    <th className="fa-14">Status</th>
                                    <th className="fa-14">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {UserTypeData.map((obj, index) => (
                                    <tr key={index}>
                                        <td className="fa-14">{obj.Cost_Category_Id}</td>
                                        <td className="fa-14">{obj.Cost_Category}</td>
                                        <td className="fa-14">{obj.Alias_Name}</td>
                                        <td className="fa-14">{obj.Order_By}</td>
                                        <td className="fa-14">{obj.IS_Active === 1 ? 'Active' : 'Inactive'}</td>
                                        <td className="fa-12" style={{ minWidth: "80px" }}>
                                            <IconButton
                                                onClick={() => {
                                                    editRow(obj);
                                                }}
                                                // disabled={Number(obj.Id) <= 6}
                                                size="small"
                                            >
                                                <Edit className="fa-in" />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    setOpen(true);
                                                    setInputValue({ Cost_Category_Id: obj.Cost_Category_Id });
                                                }}
                                            
                                                size="small"
                                                color='error'
                                            >
                                                <Delete className="fa-in " />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>

            <Dialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                aria-labelledby="create-dialog-title"
                aria-describedby="create-dialog-description"
            >
                <DialogTitle id="create-dialog-title">Cost_Category Creation</DialogTitle>
                <DialogContent>
                    <div className="p-2 d-flex flex-column gap-2">
                        <div>
                            <label>Cost_Category Name</label>
                            <input
                                type="text"
                                onChange={(event) => setCreateValue({ ...createValue, Cost_Category: event.target.value })}
                                placeholder="Ex: Admin"
                                value={createValue.Cost_Category}
                                className="cus-inpt"
                            />
                        </div>
                        <div>
                            <label>Alias Name</label>
                            <input
                                type="text"
                                onChange={(event) => setCreateValue({ ...createValue, Alias_Name: event.target.value })}
                                placeholder="Alias Name"
                                value={createValue.Alias_Name}
                                className="cus-inpt"
                            />
                        </div>
                        <div>
                            <label>Order By</label>
                            <input
                                type="number"
                                onChange={(event) => setCreateValue({ ...createValue, Order_By: event.target.value })}
                                placeholder="Order By"
                                value={createValue.Order_By}
                                className="cus-inpt"
                            />
                        </div>
                        <div>
                            <label>Status</label>
                            <select
                                className="cus-inpt"
                                value={createValue.IS_Active}
                                onChange={(event) => setCreateValue({ ...createValue, IS_Active: Number(event.target.value) })}
                            >
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                            </select>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                    </MuiButton>
                    <MuiButton onClick={() => handleCreate()} color="success">
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
                <DialogTitle id="create-dialog-title">Cost_Category</DialogTitle>
                <DialogContent>
                    <div className="p-2 d-flex flex-column gap-2">
                        <div>
                            <label>Cost_Category </label>
                            <input
                                type="text"
                                onChange={(event) =>
                                    setInputValue({
                                        ...inputValue,
                                        Cost_Category: event.target.value,
                                    })
                                }
                                placeholder="Cost Category"
                                value={inputValue.Cost_Category}
                                className="cus-inpt"
                            />
                        </div>
                        <div>
                            <label>Alias Name</label>
                            <input
                                type="text"
                                onChange={(event) =>
                                    setInputValue({
                                        ...inputValue,
                                        Alias_Name: event.target.value,
                                    })
                                }
                                placeholder="Alias Name"
                                value={inputValue.Alias_Name}
                                className="cus-inpt"
                            />
                        </div>
                        <div>
                            <label>Order By</label>
                            <input
                                type="number"
                                onChange={(event) =>
                                    setInputValue({
                                        ...inputValue,
                                        Order_By: event.target.value,
                                    })
                                }
                                placeholder="Order By"
                                value={inputValue.Order_By}
                                className="cus-inpt"
                            />
                        </div>
                        <div>
                            <label>Status</label>
                            <select
                                className="cus-inpt"
                                value={inputValue.IS_Active}
                                onChange={(event) => setInputValue({ ...inputValue, IS_Active: Number(event.target.value) })}
                            >
                                <option value={1}>Active</option>
                                <option value={0}>Inactive</option>
                            </select>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setEditUser(false)}>Cancel</MuiButton>
                    <MuiButton onClick={() => editFun()} color="success">
                        Update
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={open}
                onClose={() => {
                    setOpen(false);
                }}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
                <DialogContent>
                    <b>Do you want to delete the Cost_Category?</b>
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

export default CostCenterType;
