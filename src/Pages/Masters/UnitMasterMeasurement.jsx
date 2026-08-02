import React, { useState, useEffect, Fragment } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";
import { Delete, Edit } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const initialState = {
    UnitId: "",
    CategoryId: "",
    UnitName: "",
    UnitCode: "",
    BaseFactor: 1,
    BaseUnitId: "",
    AllowDecimal: 1,
    IsBaseUnit: 0,
    IsSystem: 0,
    IsActive: 1,
    DisplayOrder: 1
};

function UnitMasterMeasurement() {
    const [measurementData, setMeasurementData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [baseUnits, setBaseUnits] = useState([]);
    
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);

    useEffect(() => {
        fetchLink({
            address: `masters/unitMeasurement`
        }).then((data) => {
            if (data.success) {
                setMeasurementData(data.data);
            }
        }).catch(e => console.error(e));
        
        fetchLink({
            address: `masters/unitCategory/active`
        }).then((data) => {
            if (data.success) {
                setCategories(data.data);
            }
        }).catch(e => console.error(e));
    }, [reload]);

    // Fetch base units for the selected category when category changes
    useEffect(() => {
        if (inputValue.CategoryId) {
            fetchLink({
                address: `masters/unitMeasurement/active?CategoryId=${inputValue.CategoryId}`
            }).then((data) => {
                if (data.success) {
                    // Don't include the current unit being edited in its own base unit list to prevent circular references
                    const filteredUnits = inputValue.UnitId 
                        ? data.data.filter(u => u.UnitId !== inputValue.UnitId)
                        : data.data;
                    setBaseUnits(filteredUnits);
                } else {
                    setBaseUnits([]);
                }
            }).catch(e => {
                console.error(e);
                setBaseUnits([]);
            });
        } else {
            setBaseUnits([]);
        }
    }, [inputValue.CategoryId, inputValue.UnitId]);

    const handleDelete = () => {
        fetchLink({
            address: `masters/unitMeasurement`,
            method: "DELETE",
            bodyData: { UnitId: inputValue.UnitId },
        }).then((data) => {
            if (data.success) {
                setReload(!reload);
                setOpen(false);
                toast.success(data.message || "Measurement unit deleted successfully!");
            } else {
                toast.error(data.message || "Failed to delete measurement unit");
            }
        }).catch(e => console.error(e));
    };

    const handleCreate = () => {
        if (!inputValue.CategoryId || !inputValue.UnitName || !inputValue.UnitCode || inputValue.BaseFactor === "") {
            toast.error("Category, Unit Name, Unit Code and Base Factor are required");
            return;
        }

        fetchLink({
            address: `masters/unitMeasurement`,
            method: "POST",
            bodyData: {
                CategoryId: inputValue.CategoryId,
                UnitName: inputValue.UnitName,
                UnitCode: inputValue.UnitCode,
                BaseFactor: inputValue.BaseFactor,
                BaseUnitId: inputValue.BaseUnitId || null,
                AllowDecimal: inputValue.AllowDecimal,
                IsBaseUnit: inputValue.IsBaseUnit,
                IsSystem: inputValue.IsSystem,
                IsActive: inputValue.IsActive,
                DisplayOrder: inputValue.DisplayOrder || 1
            },
        }).then((data) => {
            if (data.success) {
                setIsCreateDialogOpen(false);
                setReload(!reload);
                toast.success(data.message);
                setInputValue(initialState);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    const editRow = (row) => {
        setEditUser(true);
        setInputValue({
            UnitId: row.UnitId,
            CategoryId: row.CategoryId,
            UnitName: row.UnitName,
            UnitCode: row.UnitCode,
            BaseFactor: row.BaseFactor,
            BaseUnitId: row.BaseUnitId || "",
            AllowDecimal: row.AllowDecimal ? 1 : 0,
            IsBaseUnit: row.IsBaseUnit ? 1 : 0,
            IsSystem: row.IsSystem ? 1 : 0,
            IsActive: row.IsActive ? 1 : 0,
            DisplayOrder: row.DisplayOrder || 1
        });
    };

    const editFun = () => {
        if (!inputValue.CategoryId || !inputValue.UnitName || !inputValue.UnitCode || inputValue.BaseFactor === "") {
            toast.error("Category, Unit Name, Unit Code and Base Factor are required");
            return;
        }

        fetchLink({
            address: `masters/unitMeasurement`,
            method: "PUT",
            bodyData: {
                UnitId: inputValue.UnitId,
                CategoryId: inputValue.CategoryId,
                UnitName: inputValue.UnitName,
                UnitCode: inputValue.UnitCode,
                BaseFactor: inputValue.BaseFactor,
                BaseUnitId: inputValue.BaseUnitId || null,
                AllowDecimal: inputValue.AllowDecimal,
                IsBaseUnit: inputValue.IsBaseUnit,
                IsSystem: inputValue.IsSystem,
                IsActive: inputValue.IsActive,
                DisplayOrder: inputValue.DisplayOrder || 1
            },
        }).then((data) => {
            if (data.success) {
                toast.success(data.message);
                setReload(!reload);
                setEditUser(false);
                setInputValue(initialState);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    return (
        <Fragment>
            <div className="card">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    UNIT MASTER MEASUREMENT
                    <div className="text-end">
                        <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={() => {
                                setInputValue(initialState);
                                setIsCreateDialogOpen(true);
                            }}
                        >
                            Create Unit
                        </Button>
                    </div>
                </div>

                <FilterableTable
                    dataArray={measurementData}
                    EnableSerialNumber={true}
                    isExpendable={true}
                    maxHeightOption
                    columns={[
                        createCol('CategoryName', 'string', 'Category'),
                        createCol('UnitName', 'string', 'Unit Name'),
                        createCol('UnitCode', 'string', 'Code'),
                        createCol('BaseFactor', 'string', 'Base Factor'),
                        createCol('BaseUnitName', 'string', 'Base Unit'),
                        {
                            Field_Name: "IsBaseUnit",
                            ColumnHeader: "Is Base?",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => <span>{row.IsBaseUnit ? "Yes" : "No"}</span>
                        },
                        {
                            Field_Name: "AllowDecimal",
                            ColumnHeader: "Decimals?",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => <span>{row.AllowDecimal ? "Yes" : "No"}</span>
                        },
                        {
                            Field_Name: "IsActive",
                            ColumnHeader: "Active?",
                            isVisible: 1,
                            isCustomCell: true,
                            Cell: ({ row }) => <span>{row.IsActive ? "Yes" : "No"}</span>
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
                                        <IconButton
                                            onClick={() => {
                                                setOpen(true);
                                                setInputValue({ UnitId: row.UnitId });
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
                maxWidth="md"
                fullWidth
            >
                <DialogTitle id="create-dialog-title">Create Measurement Unit</DialogTitle>
                <DialogContent>
                    <div className="row p-2">
                        <div className="col-md-6 mb-3">
                            <label>Category <span className="text-danger">*</span></label>
                            <select 
                                className="cus-inpt" 
                                value={inputValue.CategoryId}
                                onChange={(e) => setInputValue({ ...inputValue, CategoryId: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.CategoryId} value={cat.CategoryId}>{cat.CategoryName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>Unit Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                onChange={(e) => setInputValue({ ...inputValue, UnitName: e.target.value })}
                                value={inputValue.UnitName}
                                className="cus-inpt"
                            />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                            <label>Unit Code <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                onChange={(e) => setInputValue({ ...inputValue, UnitCode: e.target.value })}
                                value={inputValue.UnitCode}
                                className="cus-inpt"
                            />
                        </div>
                        <div className="col-md-6 mb-3 d-flex align-items-center pt-3">
                            <input
                                type="checkbox"
                                checked={inputValue.IsBaseUnit === 1}
                                onChange={(e) => setInputValue({ 
                                    ...inputValue, 
                                    IsBaseUnit: e.target.checked ? 1 : 0,
                                    // Reset BaseUnitId if it becomes a base unit itself
                                    BaseUnitId: e.target.checked ? "" : inputValue.BaseUnitId,
                                    BaseFactor: e.target.checked ? 1 : inputValue.BaseFactor
                                })}
                                id="isBaseUnitCheck"
                                className="me-2"
                            />
                            <label htmlFor="isBaseUnitCheck">Is Base Unit</label>
                        </div>

                        {!inputValue.IsBaseUnit && (
                            <>
                                <div className="col-md-6 mb-3">
                                    <label>Base Unit</label>
                                    <select 
                                        className="cus-inpt" 
                                        value={inputValue.BaseUnitId}
                                        onChange={(e) => setInputValue({ ...inputValue, BaseUnitId: e.target.value })}
                                        disabled={!inputValue.CategoryId}
                                    >
                                        <option value="">Select Base Unit</option>
                                        {baseUnits.map(unit => (
                                            <option key={unit.UnitId} value={unit.UnitId}>{unit.UnitName} ({unit.UnitCode})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label>Base Factor <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        step="any"
                                        onChange={(e) => setInputValue({ ...inputValue, BaseFactor: e.target.value })}
                                        value={inputValue.BaseFactor}
                                        className="cus-inpt"
                                    />
                                </div>
                            </>
                        )}
                        
                        <div className="col-md-6 mb-3">
                            <label>Display Order</label>
                            <input
                                type="number"
                                onChange={(e) => setInputValue({ ...inputValue, DisplayOrder: e.target.value })}
                                value={inputValue.DisplayOrder}
                                className="cus-inpt"
                            />
                        </div>

                        <div className="col-md-12 row mt-2">
                            <div className="col-md-4 mb-3 d-flex align-items-center">
                                <input
                                    type="checkbox"
                                    checked={inputValue.AllowDecimal === 1}
                                    onChange={(e) => setInputValue({ ...inputValue, AllowDecimal: e.target.checked ? 1 : 0 })}
                                    id="allowDecimalCheck"
                                    className="me-2"
                                />
                                <label htmlFor="allowDecimalCheck">Allow Decimal</label>
                            </div>
                            <div className="col-md-4 mb-3 d-flex align-items-center">
                                <input
                                    type="checkbox"
                                    checked={inputValue.IsSystem === 1}
                                    onChange={(e) => setInputValue({ ...inputValue, IsSystem: e.target.checked ? 1 : 0 })}
                                    id="isSystemCheck"
                                    className="me-2"
                                />
                                <label htmlFor="isSystemCheck">Is System Unit</label>
                            </div>
                            <div className="col-md-4 mb-3 d-flex align-items-center">
                                <input
                                    type="checkbox"
                                    checked={inputValue.IsActive === 1}
                                    onChange={(e) => setInputValue({ ...inputValue, IsActive: e.target.checked ? 1 : 0 })}
                                    id="isActiveCheck"
                                    className="me-2"
                                />
                                <label htmlFor="isActiveCheck">Is Active</label>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setIsCreateDialogOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleCreate} color="success" variant="contained">CREATE</MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={editUser}
                onClose={() => setEditUser(false)}
                aria-labelledby="edit-dialog-title"
                maxWidth="md"
                fullWidth
            >
                <DialogTitle id="edit-dialog-title">Update Measurement Unit</DialogTitle>
                <DialogContent>
                    <div className="row p-2">
                        <div className="col-md-6 mb-3">
                            <label>Category <span className="text-danger">*</span></label>
                            <select 
                                className="cus-inpt" 
                                value={inputValue.CategoryId}
                                onChange={(e) => setInputValue({ ...inputValue, CategoryId: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.CategoryId} value={cat.CategoryId}>{cat.CategoryName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>Unit Name <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                onChange={(e) => setInputValue({ ...inputValue, UnitName: e.target.value })}
                                value={inputValue.UnitName}
                                className="cus-inpt"
                            />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                            <label>Unit Code <span className="text-danger">*</span></label>
                            <input
                                type="text"
                                onChange={(e) => setInputValue({ ...inputValue, UnitCode: e.target.value })}
                                value={inputValue.UnitCode}
                                className="cus-inpt"
                            />
                        </div>
                        <div className="col-md-6 mb-3 d-flex align-items-center pt-3">
                            <input
                                type="checkbox"
                                checked={inputValue.IsBaseUnit === 1}
                                onChange={(e) => setInputValue({ 
                                    ...inputValue, 
                                    IsBaseUnit: e.target.checked ? 1 : 0,
                                    BaseUnitId: e.target.checked ? "" : inputValue.BaseUnitId,
                                    BaseFactor: e.target.checked ? 1 : inputValue.BaseFactor
                                })}
                                id="editIsBaseUnitCheck"
                                className="me-2"
                            />
                            <label htmlFor="editIsBaseUnitCheck">Is Base Unit</label>
                        </div>

                        {!inputValue.IsBaseUnit && (
                            <>
                                <div className="col-md-6 mb-3">
                                    <label>Base Unit</label>
                                    <select 
                                        className="cus-inpt" 
                                        value={inputValue.BaseUnitId || ""}
                                        onChange={(e) => setInputValue({ ...inputValue, BaseUnitId: e.target.value })}
                                        disabled={!inputValue.CategoryId}
                                    >
                                        <option value="">Select Base Unit</option>
                                        {baseUnits.map(unit => (
                                            <option key={unit.UnitId} value={unit.UnitId}>{unit.UnitName} ({unit.UnitCode})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label>Base Factor <span className="text-danger">*</span></label>
                                    <input
                                        type="number"
                                        step="any"
                                        onChange={(e) => setInputValue({ ...inputValue, BaseFactor: e.target.value })}
                                        value={inputValue.BaseFactor}
                                        className="cus-inpt"
                                    />
                                </div>
                            </>
                        )}
                        
                        <div className="col-md-6 mb-3">
                            <label>Display Order</label>
                            <input
                                type="number"
                                onChange={(e) => setInputValue({ ...inputValue, DisplayOrder: e.target.value })}
                                value={inputValue.DisplayOrder}
                                className="cus-inpt"
                            />
                        </div>

                        <div className="col-md-12 row mt-2">
                            <div className="col-md-4 mb-3 d-flex align-items-center">
                                <input
                                    type="checkbox"
                                    checked={inputValue.AllowDecimal === 1}
                                    onChange={(e) => setInputValue({ ...inputValue, AllowDecimal: e.target.checked ? 1 : 0 })}
                                    id="editAllowDecimalCheck"
                                    className="me-2"
                                />
                                <label htmlFor="editAllowDecimalCheck">Allow Decimal</label>
                            </div>
                            <div className="col-md-4 mb-3 d-flex align-items-center">
                                <input
                                    type="checkbox"
                                    checked={inputValue.IsSystem === 1}
                                    onChange={(e) => setInputValue({ ...inputValue, IsSystem: e.target.checked ? 1 : 0 })}
                                    id="editIsSystemCheck"
                                    className="me-2"
                                />
                                <label htmlFor="editIsSystemCheck">Is System Unit</label>
                            </div>
                            <div className="col-md-4 mb-3 d-flex align-items-center">
                                <input
                                    type="checkbox"
                                    checked={inputValue.IsActive === 1}
                                    onChange={(e) => setInputValue({ ...inputValue, IsActive: e.target.checked ? 1 : 0 })}
                                    id="editIsActiveCheck"
                                    className="me-2"
                                />
                                <label htmlFor="editIsActiveCheck">Is Active</label>
                            </div>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setEditUser(false)}>Cancel</MuiButton>
                    <MuiButton onClick={editFun} color="success" variant="contained">Update</MuiButton>
                </DialogActions>
            </Dialog>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
            >
                <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
                <DialogContent>
                    <b>Do you want to delete this Measurement Unit?</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleDelete} autoFocus color="error" variant="contained">Delete</MuiButton>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default UnitMasterMeasurement;
