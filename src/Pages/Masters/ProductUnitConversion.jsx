import React, { useState, useEffect, Fragment } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Accordion, AccordionSummary, AccordionDetails, Typography } from "@mui/material";
import { Button as MuiButton } from "@mui/material/";
import { toast } from "react-toastify";
import { Button, Table } from "react-bootstrap";
import { Delete, Edit, ExpandMore } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";

const initialState = {
    ConversionId: "",
    ProductId: "",
    FromUnitId: "",
    ToUnitId: "",
    ConversionFactor: 1,
    IsDefault: 0,
    Remarks: ""
};

function ProductUnitConversion() {
    const [conversionData, setConversionData] = useState([]);
    const [products, setProducts] = useState([]);
    const [units, setUnits] = useState([]);
    
    const [reload, setReload] = useState(false);
    const [open, setOpen] = useState(false);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [inputValue, setInputValue] = useState(initialState);
    const [editUser, setEditUser] = useState(false);
    const [expandedProduct, setExpandedProduct] = useState(false);

    useEffect(() => {
        // Fetch existing conversions (grouped by product)
        fetchLink({
            address: `masters/productUnitConversion`
        }).then((data) => {
            if (data.success) {
                setConversionData(data.data);
            } else {
                setConversionData([]);
            }
        }).catch(e => console.error(e));
        
        // Fetch all products for dropdown
        fetchLink({
            address: `masters/products/dropDown`
        }).then((data) => {
            if (data.success) {
                setProducts(data.data);
            }
        }).catch(e => console.error(e));

        // Fetch all active units for dropdown
        fetchLink({
            address: `masters/unitMeasurement/active`
        }).then((data) => {
            if (data.success) {
                setUnits(data.data);
            }
        }).catch(e => console.error(e));
    }, [reload]);

    const handleDelete = () => {
        fetchLink({
            address: `masters/productUnitConversion`,
            method: "DELETE",
            bodyData: { ConversionId: inputValue.ConversionId },
        }).then((data) => {
            if (data.success) {
                setReload(!reload);
                setOpen(false);
                toast.success(data.message || "Mapping deleted successfully!");
            } else {
                toast.error(data.message || "Failed to delete mapping");
            }
        }).catch(e => console.error(e));
    };

    const handleCreate = () => {
        if (!inputValue.ProductId || !inputValue.FromUnitId || !inputValue.ToUnitId || inputValue.ConversionFactor === "") {
            toast.error("Product, From Unit, To Unit and Conversion Factor are required");
            return;
        }

        fetchLink({
            address: `masters/productUnitConversion`,
            method: "POST",
            bodyData: {
                ProductId: inputValue.ProductId,
                FromUnitId: inputValue.FromUnitId,
                ToUnitId: inputValue.ToUnitId,
                ConversionFactor: inputValue.ConversionFactor,
                IsDefault: inputValue.IsDefault,
                Remarks: inputValue.Remarks
            },
        }).then((data) => {
            if (data.success) {
                setIsCreateDialogOpen(false);
                setReload(!reload);
                toast.success(data.message);
                setInputValue(initialState);
                setExpandedProduct(inputValue.ProductId); // auto-expand the product we just added to
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    const editRow = (row, productId) => {
        setEditUser(true);
        setInputValue({
            ConversionId: row.ConversionId,
            ProductId: productId,
            FromUnitId: row.FromUnitId,
            ToUnitId: row.ToUnitId,
            ConversionFactor: row.ConversionFactor,
            IsDefault: row.IsDefault ? 1 : 0,
            Remarks: row.Remarks || ""
        });
    };

    const editFun = () => {
        if (!inputValue.ProductId || !inputValue.FromUnitId || !inputValue.ToUnitId || inputValue.ConversionFactor === "") {
            toast.error("Product, From Unit, To Unit and Conversion Factor are required");
            return;
        }

        fetchLink({
            address: `masters/productUnitConversion`,
            method: "PUT",
            bodyData: {
                ConversionId: inputValue.ConversionId,
                ProductId: inputValue.ProductId,
                FromUnitId: inputValue.FromUnitId,
                ToUnitId: inputValue.ToUnitId,
                ConversionFactor: inputValue.ConversionFactor,
                IsDefault: inputValue.IsDefault,
                Remarks: inputValue.Remarks
            },
        }).then((data) => {
            if (data.success) {
                toast.success(data.message);
                setReload(!reload);
                setEditUser(false);
                setInputValue(initialState);
                setExpandedProduct(inputValue.ProductId);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    const handleAccordionChange = (panel) => (event, isExpanded) => {
        setExpandedProduct(isExpanded ? panel : false);
    };

    return (
        <Fragment>
            <div className="card mb-3">
                <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
                    PRODUCT UNIT CONVERSIONS
                    <div className="text-end">
                        <Button
                            className="rounded-5 px-3 py-1 fa-13 btn-primary shadow"
                            onClick={() => {
                                setInputValue(initialState);
                                setIsCreateDialogOpen(true);
                            }}
                        >
                            Create Mapping
                        </Button>
                    </div>
                </div>
                
                <div className="card-body p-3">
                    {conversionData.length === 0 ? (
                        <div className="text-center p-4 text-muted">No mappings found. Create one to get started.</div>
                    ) : (
                        conversionData.map((group) => (
                            <Accordion 
                                key={group.Product_Id} 
                                expanded={expandedProduct === group.Product_Id}
                                onChange={handleAccordionChange(group.Product_Id)}
                                className="mb-2 shadow-sm border"
                            >
                                <AccordionSummary expandIcon={<ExpandMore />} className="bg-light">
                                    <Typography className="fw-bold">
                                        {group.Product_Name} <span className="badge bg-secondary ms-2">{group.GroupedConversionsArray?.length || 0} mapping(s)</span>
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails className="p-0">
                                    <Table hover responsive className="mb-0 fa-13">
                                        <thead className="table-light">
                                            <tr>
                                                <th>From Unit</th>
                                                <th>To Unit</th>
                                                <th>Conversion Factor</th>
                                                <th>Default</th>
                                                <th>Remarks</th>
                                                <th className="text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.GroupedConversionsArray?.map((conv) => (
                                                <tr key={conv.ConversionId}>
                                                    <td>{conv.FromUnitName} ({conv.FromUnitCode})</td>
                                                    <td>{conv.ToUnitName} ({conv.ToUnitCode})</td>
                                                    <td className="fw-bold">{conv.ConversionFactor}</td>
                                                    <td>
                                                        {conv.IsDefault ? (
                                                            <span className="badge bg-success">Yes</span>
                                                        ) : (
                                                            <span className="badge bg-light text-dark">No</span>
                                                        )}
                                                    </td>
                                                    <td>{conv.Remarks}</td>
                                                    <td className="text-center">
                                                        <IconButton onClick={() => editRow(conv, group.Product_Id)} size="small">
                                                            <Edit className="fa-in text-primary" />
                                                        </IconButton>
                                                        <IconButton 
                                                            onClick={() => {
                                                                setOpen(true);
                                                                setInputValue({ ConversionId: conv.ConversionId, ProductId: group.Product_Id });
                                                            }} 
                                                            size="small"
                                                        >
                                                            <Delete className="fa-in text-danger" />
                                                        </IconButton>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </div>
            </div>

            <Dialog
                open={isCreateDialogOpen}
                onClose={() => setIsCreateDialogOpen(false)}
                aria-labelledby="create-dialog-title"
                maxWidth="md"
                fullWidth
            >
                <DialogTitle id="create-dialog-title">Create Product Unit Mapping</DialogTitle>
                <DialogContent>
                    <div className="row p-2">
                        <div className="col-md-12 mb-3">
                            <label>Product <span className="text-danger">*</span></label>
                            <select 
                                className="cus-inpt" 
                                value={inputValue.ProductId}
                                onChange={(e) => setInputValue({ ...inputValue, ProductId: e.target.value })}
                            >
                                <option value="">Select Product</option>
                                {products.map(prod => (
                                    <option key={prod.Product_Id} value={prod.Product_Id}>
                                        {prod.Product_Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                            <label>From Unit <span className="text-danger">*</span></label>
                            <select 
                                className="cus-inpt" 
                                value={inputValue.FromUnitId}
                                onChange={(e) => setInputValue({ ...inputValue, FromUnitId: e.target.value })}
                            >
                                <option value="">Select From Unit</option>
                                {units.map(unit => (
                                    <option key={unit.UnitId} value={unit.UnitId}>{unit.UnitName} ({unit.UnitCode})</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label>To Unit <span className="text-danger">*</span></label>
                            <select 
                                className="cus-inpt" 
                                value={inputValue.ToUnitId}
                                onChange={(e) => setInputValue({ ...inputValue, ToUnitId: e.target.value })}
                            >
                                <option value="">Select To Unit</option>
                                {units.map(unit => (
                                    <option key={unit.UnitId} value={unit.UnitId}>{unit.UnitName} ({unit.UnitCode})</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label>Conversion Factor <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                step="any"
                                onChange={(e) => setInputValue({ ...inputValue, ConversionFactor: e.target.value })}
                                value={inputValue.ConversionFactor}
                                className="cus-inpt"
                            />
                            <small className="text-muted d-block mt-1">
                                Example: 1 [From Unit] = [Factor] [To Unit]
                            </small>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label>Remarks</label>
                            <input
                                type="text"
                                onChange={(e) => setInputValue({ ...inputValue, Remarks: e.target.value })}
                                value={inputValue.Remarks}
                                className="cus-inpt"
                            />
                        </div>

                        <div className="col-md-12 mb-3 d-flex align-items-center">
                            <input
                                type="checkbox"
                                checked={inputValue.IsDefault === 1}
                                onChange={(e) => setInputValue({ ...inputValue, IsDefault: e.target.checked ? 1 : 0 })}
                                id="isDefaultCheck"
                                className="me-2"
                            />
                            <label htmlFor="isDefaultCheck">Set as Default Conversion for this Product</label>
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
                <DialogTitle id="edit-dialog-title">Update Product Unit Mapping</DialogTitle>
                <DialogContent>
                    <div className="row p-2">
                        <div className="col-md-12 mb-3">
                            <label>Product <span className="text-danger">*</span></label>
                            <select 
                                className="cus-inpt" 
                                value={inputValue.ProductId}
                                onChange={(e) => setInputValue({ ...inputValue, ProductId: e.target.value })}
                                disabled
                            >
                                <option value="">Select Product</option>
                                {products.map(prod => (
                                    <option key={prod.Product_Id} value={prod.Product_Id}>
                                        {prod.Product_Name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                            <label>From Unit <span className="text-danger">*</span></label>
                            <select 
                                className="cus-inpt" 
                                value={inputValue.FromUnitId}
                                onChange={(e) => setInputValue({ ...inputValue, FromUnitId: e.target.value })}
                            >
                                <option value="">Select From Unit</option>
                                {units.map(unit => (
                                    <option key={unit.UnitId} value={unit.UnitId}>{unit.UnitName} ({unit.UnitCode})</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label>To Unit <span className="text-danger">*</span></label>
                            <select 
                                className="cus-inpt" 
                                value={inputValue.ToUnitId}
                                onChange={(e) => setInputValue({ ...inputValue, ToUnitId: e.target.value })}
                            >
                                <option value="">Select To Unit</option>
                                {units.map(unit => (
                                    <option key={unit.UnitId} value={unit.UnitId}>{unit.UnitName} ({unit.UnitCode})</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-6 mb-3">
                            <label>Conversion Factor <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                step="any"
                                onChange={(e) => setInputValue({ ...inputValue, ConversionFactor: e.target.value })}
                                value={inputValue.ConversionFactor}
                                className="cus-inpt"
                            />
                        </div>

                        <div className="col-md-6 mb-3">
                            <label>Remarks</label>
                            <input
                                type="text"
                                onChange={(e) => setInputValue({ ...inputValue, Remarks: e.target.value })}
                                value={inputValue.Remarks}
                                className="cus-inpt"
                            />
                        </div>

                        <div className="col-md-12 mb-3 d-flex align-items-center">
                            <input
                                type="checkbox"
                                checked={inputValue.IsDefault === 1}
                                onChange={(e) => setInputValue({ ...inputValue, IsDefault: e.target.checked ? 1 : 0 })}
                                id="editIsDefaultCheck"
                                className="me-2"
                            />
                            <label htmlFor="editIsDefaultCheck">Set as Default Conversion for this Product</label>
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
                    <b>Do you want to delete this Mapping?</b>
                </DialogContent>
                <DialogActions>
                    <MuiButton onClick={() => setOpen(false)}>Cancel</MuiButton>
                    <MuiButton onClick={handleDelete} autoFocus color="error" variant="contained">Delete</MuiButton>
                </DialogActions>
            </Dialog>
        </Fragment>
    );
}

export default ProductUnitConversion;
