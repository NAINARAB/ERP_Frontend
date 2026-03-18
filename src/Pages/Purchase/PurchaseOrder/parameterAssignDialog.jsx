import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton } from '@mui/material';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { fetchLink } from '../../../Components/fetchComponent';
import { customSelectStyles } from '../../../Components/tablecolumn';
import { isEqualNumber } from '../../../Components/functions';

const ParameterAssignDialog = ({ open, onClose, itemData, moduleParameters, onSave }) => {
    const [selectedParameters, setSelectedParameters] = useState([]);
    const [parameterValues, setParameterValues] = useState({});

    useEffect(() => {
        if (open && itemData) {
            const initialSelected = [];
            const initialValues = {};

            if (itemData.ParameterDetails && itemData.ParameterDetails.length > 0) {
                itemData.ParameterDetails.forEach(param => {
                    const matchedModuleParam = moduleParameters.find(mp => isEqualNumber(mp.numID, param.ParameterId));
                    if (matchedModuleParam) {
                        initialSelected.push({
                            value: matchedModuleParam.numID,
                            label: matchedModuleParam.parameterName,
                            dataType: matchedModuleParam.dataType
                        });
                        initialValues[matchedModuleParam.numID] = {
                            val1: param.ParameterValueOne || '',
                            val2: param.ParameterValueTwo || ''
                        };
                    }
                });
            }

            setSelectedParameters(initialSelected);
            setParameterValues(initialValues);
        } else {
            setSelectedParameters([]);
            setParameterValues({});
        }
    }, [open, itemData, moduleParameters]);

    const handleParameterChange = (selectedOptions) => {
        const options = selectedOptions || [];
        setSelectedParameters(options);
        
        setParameterValues(prev => {
            const currentIds = options.map(opt => Number(opt.value));
            const newValues = { ...prev };
            
            Object.keys(newValues).forEach(key => {
                if (!currentIds.includes(Number(key))) {
                    delete newValues[key];
                }
            });
            
            return newValues;
        });
    };

    const handleValueChange = (paramId, field, value) => {
        setParameterValues(prev => ({
            ...prev,
            [paramId]: {
                ...(prev[paramId] || { val1: '', val2: '' }),
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        if (!itemData || !itemData.OrderId || !itemData.ItemId) {
            toast.error("Invalid Item Data");
            return;
        }

        const formattedParameters = selectedParameters.map(param => ({
            ParameterId: param.value,
            ParameterValueOne: parameterValues[param.value]?.val1 || '',
            ParameterValueTwo: parameterValues[param.value]?.val2 || ''
        }));

        fetchLink({
            address: 'dataEntry/purchaseOrderEntry/parameters',
            method: 'POST',
            bodyData: {
                OrderId: itemData.OrderId,
                ItemId: itemData.ItemId,
                parameters: formattedParameters
            }
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                onSave();
                onClose();
            } else {
                toast.error(data.message);
            }
        }).catch(err => {
            console.error(err);
            toast.error("An error occurred while saving parameters.");
        });
    };

    const renderInputFields = (param) => {
        const value = parameterValues[param.value] || { val1: '', val2: '' };

        switch (param.dataType) {
            case 'text':
                return (
                    <div className="mt-2">
                        <textarea
                            className="cus-inpt w-100 p-2"
                            rows={3}
                            maxLength={250}
                            placeholder={`Enter ${param.label} Text`}
                            value={value.val1}
                            onChange={(e) => handleValueChange(param.value, 'val1', e.target.value)}
                        />
                    </div>
                );
            case 'number':
                return (
                    <div className="d-flex gap-3 mt-2">
                        <div className="flex-grow-1">
                            <label className="fa-12 text-muted">Minimum</label>
                            <input
                                type="number"
                                className="cus-inpt w-100 p-2"
                                placeholder="Min value"
                                value={value.val1}
                                onChange={(e) => handleValueChange(param.value, 'val1', e.target.value)}
                            />
                        </div>
                        <div className="flex-grow-1">
                            <label className="fa-12 text-muted">Maximum</label>
                            <input
                                type="number"
                                className="cus-inpt w-100 p-2"
                                placeholder="Max value"
                                value={value.val2}
                                onChange={(e) => handleValueChange(param.value, 'val2', e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 'date':
                return (
                    <div className="d-flex gap-3 mt-2">
                        <div className="flex-grow-1">
                            <label className="fa-12 text-muted">Start Date</label>
                            <input
                                type="date"
                                className="cus-inpt w-100 p-2"
                                value={value.val1}
                                onChange={(e) => handleValueChange(param.value, 'val1', e.target.value)}
                            />
                        </div>
                        <div className="flex-grow-1">
                            <label className="fa-12 text-muted">End Date</label>
                            <input
                                type="date"
                                className="cus-inpt w-100 p-2"
                                value={value.val2}
                                onChange={(e) => handleValueChange(param.value, 'val2', e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 'datetime':
                return (
                    <div className="d-flex gap-3 mt-2">
                        <div className="flex-grow-1">
                            <label className="fa-12 text-muted">Start Datetime</label>
                            <input
                                type="datetime-local"
                                className="cus-inpt w-100 p-2"
                                value={value.val1}
                                onChange={(e) => handleValueChange(param.value, 'val1', e.target.value)}
                            />
                        </div>
                        <div className="flex-grow-1">
                            <label className="fa-12 text-muted">End Datetime</label>
                            <input
                                type="datetime-local"
                                className="cus-inpt w-100 p-2"
                                value={value.val2}
                                onChange={(e) => handleValueChange(param.value, 'val2', e.target.value)}
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Assign Item Parameters</DialogTitle>
            <DialogContent>
                <div className="mb-3 mt-2">
                    <label className="fw-bold mb-1">Select Parameters</label>
                    <Select
                        isMulti
                        options={moduleParameters.map(mp => ({
                            value: mp.numID,
                            label: mp.parameterName,
                            dataType: mp.dataType
                        }))}
                        value={selectedParameters}
                        onChange={handleParameterChange}
                        placeholder="Search and select parameters..."
                        className="basic-multi-select"
                        classNamePrefix="select"
                        styles={customSelectStyles}
                        menuPortalTarget={document.body}
                        closeMenuOnSelect={false}
                    />
                </div>

                {selectedParameters.length > 0 && (
                    <div className="mt-4">
                        <h6 className="fw-bold border-bottom pb-2">Parameter Values</h6>
                        <div className="d-flex flex-column gap-3 mt-3">
                            {selectedParameters.map(param => (
                                <div key={param.value} className="bg-light p-3 rounded border">
                                    <h6 className="mb-2 text-primary">{param.label}</h6>
                                    {renderInputFields(param)}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <MuiButton onClick={onClose} variant="outlined">Cancel</MuiButton>
                <MuiButton onClick={handleSave} variant="contained" color="primary">Save Parameters</MuiButton>
            </DialogActions>
        </Dialog>
    );
};

export default ParameterAssignDialog;
