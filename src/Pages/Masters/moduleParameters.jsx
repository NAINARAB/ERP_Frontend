import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Button as MuiButton, MenuItem, Select, FormControl } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import { fetchLink } from "../../Components/fetchComponent";
import { additionalModules, erpModules } from "../../Components/tablecolumn";

const initialState = {
    paramID: "",
    parameterName: "",
    dataType: "text",
    moduleName: "COMMON",
    defaultValue: "",
};

const moduleNameOptions = ['COMMON', ...erpModules.map(m => m.name), ...additionalModules.map(m => m.name)].sort();

const dataTypeOptions = ['text', 'number', 'date', 'datetime'];

const ModuleParameters = () => {
    const [parameters, setParameters] = useState([]);
    const [open, setOpen] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [reload, setReload] = useState(false);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        fetchLink({
            address: `masters/moduleParameters`
        }).then((data) => {
            if (data.success) {
                setParameters(data.data);
            }
        }).catch(e => console.error(e))
    }, [reload]);

    const clearValue = () => {
        setInputValue(initialState);
        setEditMode(false);
        setDeleteDialog(false);
        setOpen(false);
    };

    const handleSave = () => {
        const userId = localStorage.getItem("UserId");

        if (!inputValue.parameterName) {
            toast.warn("Parameter Name is required");
            return;
        }

        const addObj = {
            ...inputValue,
            createdBy: userId ? parseInt(userId, 10) : 1
        };

        const editObj = {
            paramID: inputValue.paramID,
            parameterName: inputValue.parameterName,
            dataType: inputValue.dataType,
            moduleName: inputValue.moduleName,
            defaultValue: inputValue.defaultValue,
        };

        const bodyData = editMode ? editObj : addObj;
        const method = editMode ? "PUT" : "POST";

        fetchLink({
            address: `masters/moduleParameters`,
            method: method,
            headers: { "Content-Type": "application/json" },
            bodyData: bodyData,
        }).then((data) => {
            if (data.success) {
                toast.success(data?.message);
                setReload(!reload);
                clearValue();
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    const setDelete = (row) => {
        clearValue();
        setInputValue(row);
        setDeleteDialog(true);
    };

    const deleteFun = () => {
        fetchLink({
            address: `masters/moduleParameters`,
            method: "DELETE",
            bodyData: { paramID: inputValue.paramID },
        }).then((data) => {
            if (data.success) {
                toast.success(data?.message);
                setReload(!reload);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e)).finally(() => clearValue());
    };

    const editRow = (param) => {
        setInputValue(param);
        setEditMode(true);
        setOpen(true);
    };

    return (
        <>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    Module Parameters
                    <div className="text-end">
                        <Button
                            onClick={() => {
                                clearValue();
                                setOpen(true);
                            }}
                            className="rounded-5 px-3 py-1 fa-13 shadow"
                        >
                            Create Parameter
                        </Button>
                    </div>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <Table className="">
                            <thead>
                                <tr>
                                    <th className="fa-14">Num ID</th>
                                    <th className="fa-14">Parameter Name</th>
                                    <th className="fa-14">Data Type</th>
                                    <th className="fa-14">Module Name</th>
                                    <th className="fa-14">Default Value</th>
                                    <th className="fa-14">Created By</th>
                                    <th className="fa-14">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {parameters.map((o, i) => (
                                    <tr key={i}>
                                        <td className="fa-14">{o.numID}</td>
                                        <td className="fa-14">{o.parameterName}</td>
                                        <td className="fa-14">{o.dataType}</td>
                                        <td className="fa-14">{o.moduleName}</td>
                                        <td className="fa-14">{o.defaultValue}</td>
                                        <td className="fa-14">{o.createdByGet || o.createdBy}</td>
                                        <td className="fa-12" style={{ minWidth: "100px" }}>
                                            <IconButton onClick={() => editRow(o)} size="small">
                                                <Edit className="fa-in" />
                                            </IconButton>
                                            <IconButton onClick={() => setDelete(o)} size="small">
                                                <Delete className="fa-in del-red" />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}
                                {parameters.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center">No parameters found</td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>

            <Dialog
                open={open}
                onClose={() => clearValue()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id="alert-dialog-title">
                    {editMode ? "Edit Module Parameter" : "Create Module Parameter"}
                </DialogTitle>
                <DialogContent>
                    <div className="d-flex flex-column gap-3 p-2 mt-2">
                        <div>
                            <label className="mb-1">Parameter Name</label>
                            <input
                                type="text"
                                onChange={(e) =>
                                    setInputValue({
                                        ...inputValue,
                                        parameterName: e.target.value,
                                    })
                                }
                                placeholder="ex: Ordered Quality"
                                value={inputValue.parameterName}
                                className="cus-inpt b-0 shadow-sm"
                            />
                        </div>
                        
                        <div>
                            <label className="mb-1">Data Type</label>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={inputValue.dataType}
                                    onChange={(e) =>
                                        setInputValue({
                                            ...inputValue,
                                            dataType: e.target.value,
                                        })
                                    }
                                    className="bg-white"
                                >
                                    {dataTypeOptions.map((opt) => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        <div>
                            <label className="mb-1">Module Name</label>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={inputValue.moduleName}
                                    onChange={(e) =>
                                        setInputValue({
                                            ...inputValue,
                                            moduleName: e.target.value,
                                        })
                                    }
                                    className="bg-white"
                                >
                                    {moduleNameOptions.map((opt) => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                        
                        <div>
                            <label className="mb-1">Default Value</label>
                            <input
                                type="text"
                                onChange={(e) =>
                                    setInputValue({
                                        ...inputValue,
                                        defaultValue: e.target.value,
                                    })
                                }
                                placeholder="ex: 0"
                                value={inputValue.defaultValue}
                                className="cus-inpt b-0 shadow-sm"
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => clearValue()}>Cancel</MuiButton>
                    <MuiButton onClick={handleSave} autoFocus color="success" variant="contained" sx={{color: 'white'}}>
                        {editMode ? "UPDATE" : "CREATE"}
                    </MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteDialog}
                onClose={() => clearValue()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirmation"}</DialogTitle>
                <DialogContent>
                    <b>{`Do you want to delete the "${inputValue?.parameterName}" parameter?`}</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => clearValue()}>Cancel</MuiButton>
                    <MuiButton onClick={deleteFun} autoFocus color="error" variant="contained">
                        Delete
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ModuleParameters;
