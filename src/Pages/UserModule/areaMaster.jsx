import React, { useState, useEffect, Fragment } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
const initialState = {
    Area_Id: "",
    Area_Name: "",
    District_Id: "",
    District_Name: ""
};

function AreaMaster() {
    const [UserTypeData, setUserTypeData] = useState([]);
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);

    const [areaName, setAreaName] = useState("");
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");

    useEffect(() => {
        fetchLink({
            address: `masters/areas`
        }).then((data) => {
            if (data.success) {
                setUserTypeData(data.data);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/district`
        }).then((data) => {
            if (data.success) {
                setDistricts(data.data);
            }
        }).catch(e => console.error(e));
    }, [reload]);

    const handleDelete = () => {

        fetchLink({
            address: `masters/areas`,
            method: "DELETE",
            bodyData: { Area_Id: inputValue.Area_Id },
        }).then((data) => {
            if (data.success) {
                setReload(!reload);
                setOpen(false);
                toast.success("Area deleted successfully!");
            } else {
                toast.error("Failed to delete area:", data.message);
            }
        }).catch(e => console.error(e));
    };

    const handleCreate = () => {
        if (!selectedDistrict || !areaName) {
            toast.error("Please fill all fields");
            return;
        }

        fetchLink({
            address: `masters/areas`,
            method: "POST",
            bodyData: {
                Area_Name: areaName,
                District_Id: selectedDistrict
            },
        }).then((data) => {
            if (data.success) {
                setIsCreateDialogOpen(false);
                setReload(!reload);
                toast.success(data.message);
                setAreaName("");
                setSelectedDistrict("");
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    const editRow = (user) => {
        setEditUser(true);
        setInputValue({
            Area_Id: user.Area_Id,
            Area_Name: user.Area_Name,
            District_Id: user.District_Id, // This is important for updating the dropdown
        });
        setSelectedDistrict(user.District_Id); // Set the dropdown value to the selected district ID
    };


    const editFun = (Area_Id, Area_Name, District_Id) => {
        fetchLink({
            address: `masters/areas`,
            method: "PUT",
            bodyData: { Area_Id, Area_Name, District_Id },
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
                            Create Area
                        </Button>
                    </div>
                </div>



                <FilterableTable
                    dataArray={UserTypeData}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    maxHeightOption
                    columns={[

                        createCol('Area_Name', 'string', 'Area_Name'),
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
                                                setInputValue({ Area_Id: row.Area_Id });
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
                <DialogTitle id="create-dialog-title">Area Creation</DialogTitle>
                <DialogContent>
                    <div>
                        <div className="p-2">
                            <label>Area Name</label>
                            <input
                                type="text"
                                onChange={(event) => setAreaName(event.target.value)}
                                placeholder="Ex: BB Kulam"
                                value={areaName}
                                className="cus-inpt"
                            />
                        </div>
                        <div className="p-2">
                            <label>District Name</label>
                            <select
                                value={selectedDistrict}
                                onChange={(event) => setSelectedDistrict(event.target.value)}
                                className="cus-inpt"
                            >
                                <option value="">Select District</option>
                                {districts.map((district) => (
                                    <option key={district.District_Id} value={district.District_Id}>
                                        {district.District_Name}
                                    </option>
                                ))}
                            </select>
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
                <DialogTitle id="create-dialog-title">Area</DialogTitle>
                <DialogContent>
                    <div className="p-2">
                        <label>Area </label>
                        <input
                            type="text"
                            onChange={(event) =>
                                setInputValue({
                                    ...inputValue,
                                    Area_Name: event.target.value,
                                })
                            }
                            placeholder={inputValue.Area_Name}
                            value={inputValue.Area_Name}
                            className="cus-inpt"
                        />
                    </div>
                    <div className="p-2">
                        <label>District Name</label>
                        <select
                            value={selectedDistrict}
                            onChange={(event) => setSelectedDistrict(event.target.value)}
                            className="cus-inpt"
                        >
                            <option value="">Select District</option>
                            {districts.map((district) => (
                                <option key={district.District_Id} value={district.District_Id}>
                                    {district.District_Name}
                                </option>
                            ))}
                        </select>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setEditUser(false)}>Cancel</MuiButton>
                    <MuiButton onClick={() => editFun(inputValue.Area_Id, inputValue.Area_Name, inputValue.District_Id)} color="success">
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
                    <b>Do you want to delete the Area?</b>
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

export default AreaMaster;

