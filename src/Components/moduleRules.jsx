import { fetchLink } from './fetchComponent';
import { useState, useEffect } from 'react';
import { allERPModules } from './tablecolumn';
import FilterableTable, { createCol } from './filterableTable2';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';

const ModuleRuleComponent = ({ loadingOn, loadingOff }) => {
    const [moduleName, setModuleName] = useState(allERPModules[0]);
    const [rules, setRules] = useState([]);
    const [modifiedRules, setModifiedRules] = useState({});

    const [openDialog, setOpenDialog] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        moduleCode: '',
        moduleName: '',
        ruleNumber: '',
        ruleCode: '',
        ruleName: '',
        discription: ''
    });

    const fetchRules = () => {
        if (moduleName) {
            setModifiedRules({});
            fetchLink({
                address: `authorization/moduleRules?moduleName=${moduleName.name}`,
                loadingOn, loadingOff
            }).then(response => {
                if (response.success) {
                    setRules(response.data);
                }
            }).catch(console.error)
        }
    };

    useEffect(() => {
        fetchRules();
    }, [moduleName]);

    const handleCheckboxChange = (ruleId, field, checked) => {
        const newValue = checked ? 1 : 0;

        const updatedRules = rules.map(rule => {
            if (rule.ruleId === ruleId) {
                return { ...rule, [field]: newValue };
            }
            return rule;
        });
        setRules(updatedRules);

        setModifiedRules(prev => {
            const currentModified = prev[ruleId] || updatedRules.find(r => r.ruleId === ruleId);
            return {
                ...prev,
                [ruleId]: { ...currentModified, [field]: newValue }
            };
        });
    };

    const handleSaveAccess = () => {
        const rulesToSave = Object.values(modifiedRules);
        if (rulesToSave.length === 0) return;

        fetchLink({
            address: `authorization/moduleRules/access`,
            method: 'POST',
            bodyData: { rulesAccess: rulesToSave },
            loadingOn, loadingOff
        }).then(response => {
            if (response.success) {
                setModifiedRules({});
            }
        }).catch(console.error);
    };

    const handleOpenDialog = (rule = null) => {
        if (rule) {
            setIsEditMode(true);
            setFormData({
                id: rule.id || rule.ruleId,
                moduleCode: rule.moduleCode || '',
                moduleName: rule.moduleName || '',
                ruleNumber: rule.ruleNumber || '',
                ruleCode: rule.ruleCode || '',
                ruleName: rule.ruleName || '',
                discription: rule.discription || ''
            });
            setOpenDialog(true);
        } else {
            setIsEditMode(false);
            setFormData({
                id: '',
                moduleCode: moduleName.moduleCode,
                moduleName: moduleName.name,
                ruleNumber: '',
                ruleCode: '',
                ruleName: '',
                discription: ''
            });
            setOpenDialog(true);
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        let updatedData = { ...formData, [name]: value };

        if (name === 'moduleName') {
            const selectedModule = allERPModules.find(m => m.name === value);
            if (selectedModule) {
                updatedData.moduleCode = selectedModule.moduleCode;
                // ruleCode is generated entirely by the backend now
            }
        }

        setFormData(updatedData);
    };

    const handleSaveRule = () => {
        const localData = JSON.parse(localStorage.getItem('user'));
        const createdBy = localData?.UserId || 1;

        const bodyData = { ...formData };
        if (!isEditMode) {
            bodyData.createdBy = createdBy;
        }

        fetchLink({
            address: `authorization/moduleRules`,
            method: isEditMode ? 'PUT' : 'POST',
            bodyData,
            loadingOn, loadingOff
        }).then(response => {
            if (response.success) {
                handleCloseDialog();
                fetchRules();
            }
        }).catch(console.error);
    };

    return (
        <div className="p-4">
            <FilterableTable
                title='Module Configuration'
                dataArray={rules}
                columns={[
                    {
                        isVisible: 1,
                        isCustomCell: true,
                        align: 'center',
                        headerAlign: 'center',
                        ColumnHeader: 'Action',
                        Cell: ({ row }) => (
                            <Button size="small" onClick={() => handleOpenDialog(row)}>Edit</Button>
                        )
                    },
                    createCol('ruleCode', 'string', 'Rule Code'),
                    createCol('ruleName', 'string', 'Name'),
                    createCol('discription', 'string', 'Description'),
                    {
                        isVisible: 1,
                        isCustomCell: true,
                        align: 'center',
                        headerAlign: 'center',
                        ColumnHeader: 'Get',
                        Cell: ({ row }) => {
                            const handleGetClick = () => {
                                handleCheckboxChange(row.ruleId, 'getOption', !row.getOption);
                            }
                            return (
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 cursor-pointer accent-blue-600"
                                    checked={row.getOption}
                                    onChange={handleGetClick}
                                />
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        isCustomCell: true,
                        align: 'center',
                        headerAlign: 'center',
                        ColumnHeader: 'Create',
                        Cell: ({ row }) => {
                            const handleCreateClick = () => {
                                handleCheckboxChange(row.ruleId, 'createOption', !row.createOption);
                            }
                            return (
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 cursor-pointer accent-blue-600"
                                    checked={row.createOption}
                                    onChange={handleCreateClick}
                                />
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        isCustomCell: true,
                        align: 'center',
                        headerAlign: 'center',
                        ColumnHeader: 'Update',
                        Cell: ({ row }) => {
                            const handleUpdateClick = () => {
                                handleCheckboxChange(row.ruleId, 'updateOption', !row.updateOption);
                            }
                            return (
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 cursor-pointer accent-blue-600"
                                    checked={row.updateOption}
                                    onChange={handleUpdateClick}
                                />
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        isCustomCell: true,
                        ColumnHeader: 'Delete',
                        Cell: ({ row }) => {
                            const handleDeleteClick = () => {
                                handleCheckboxChange(row.ruleId, 'deleteOption', !row.deleteOption);
                            }
                            return (
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 cursor-pointer accent-blue-600"
                                    checked={row.deleteOption}
                                    onChange={handleDeleteClick}
                                />
                            )
                        }
                    }
                ]}
                EnableSerialNumber
                bodyFontSizePx={12}
                CellSize='small'
                ButtonArea={
                    <>
                        <select
                            value={moduleName.name}
                            onChange={(e) => {
                                setModuleName(allERPModules.find(module => module.name === e.target.value))
                            }}
                            className='cus-inpt p-2 border rounded w-auto'
                        >
                            {allERPModules.map((module, index) => <option key={index} value={module.name}>{module.name}</option>)}
                        </select>

                        <Button
                            onClick={() => handleOpenDialog()}
                            className='w-auto'
                            variant="outlined"
                        >
                            + Create Rule
                        </Button>
                        <Button
                            onClick={handleSaveAccess}
                            disabled={Object.keys(modifiedRules).length === 0}
                            className='w-auto'
                            variant="contained"
                        >
                            Save Access
                        </Button>
                    </>
                }
            />

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{isEditMode ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
                <DialogContent dividers className="flex flex-col gap-4">
                    <TextField
                        select
                        label="Module Name"
                        name="moduleName"
                        value={formData.moduleName}
                        onChange={handleFormChange}
                        fullWidth
                        size="small"
                        margin="dense"
                        disabled={isEditMode}
                    >
                        {allERPModules.map(m => (
                            <MenuItem key={m.name} value={m.name}>{m.alias} ({m.name})</MenuItem>
                        ))}
                    </TextField>
                    {isEditMode && (
                        <>
                            <TextField
                                label="Rule Number"
                                name="ruleNumber"
                                type="number"
                                value={formData.ruleNumber}
                                onChange={handleFormChange}
                                fullWidth
                                size="small"
                                margin="dense"
                                disabled
                            />
                            <TextField
                                label="Rule Code"
                                name="ruleCode"
                                value={formData.ruleCode}
                                onChange={handleFormChange}
                                fullWidth
                                size="small"
                                margin="dense"
                                disabled
                            />
                        </>
                    )}
                    <TextField
                        label="Rule Name"
                        name="ruleName"
                        value={formData.ruleName}
                        onChange={handleFormChange}
                        fullWidth
                        size="small"
                        margin="dense"
                    />
                    <TextField
                        label="Description"
                        name="discription"
                        value={formData.discription}
                        onChange={handleFormChange}
                        fullWidth
                        size="small"
                        margin="dense"
                        multiline
                        rows={3}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveRule} variant="contained">Save</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ModuleRuleComponent;