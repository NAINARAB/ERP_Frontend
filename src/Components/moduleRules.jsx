import { fetchLink } from './fetchComponent';
import { useState, useEffect } from 'react';
import { allERPModules } from './tablecolumn';
import FilterableTable, { createCol } from './filterableTable2';
import { Button } from '@mui/material';

const ModuleRuleComponent = ({ loadingOn, loadingOff }) => {
    const [moduleName, setModuleName] = useState(allERPModules[0]);
    const [rules, setRules] = useState([]);
    const [modifiedRules, setModifiedRules] = useState({});

    useEffect(() => {
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

    const handleSave = () => {
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

    return (
        <div className="p-4">
            {/* <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Rule Name</th>
                            <th className="py-3 px-4 border-b text-left text-gray-700 font-semibold">Description</th>
                            <th className="py-3 px-4 border-b text-center text-gray-700 font-semibold">Get</th>
                            <th className="py-3 px-4 border-b text-center text-gray-700 font-semibold">Create</th>
                            <th className="py-3 px-4 border-b text-center text-gray-700 font-semibold">Update</th>
                            <th className="py-3 px-4 border-b text-center text-gray-700 font-semibold">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rules?.length > 0 ? (
                            rules.map((rule) => (
                                <tr key={rule.ruleId} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-2 px-4 border-b text-gray-800">{rule.ruleName}</td>
                                    <td className="py-2 px-4 border-b text-gray-600 text-sm">{rule.discription}</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 cursor-pointer accent-blue-600"
                                            checked={rule.getOption === 1}
                                            onChange={(e) => handleCheckboxChange(rule.ruleId, 'getOption', e.target.checked)}
                                        />
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 cursor-pointer accent-blue-600"
                                            checked={rule.createOption === 1}
                                            onChange={(e) => handleCheckboxChange(rule.ruleId, 'createOption', e.target.checked)}
                                        />
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 cursor-pointer accent-blue-600"
                                            checked={rule.updateOption === 1}
                                            onChange={(e) => handleCheckboxChange(rule.ruleId, 'updateOption', e.target.checked)}
                                        />
                                    </td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 cursor-pointer accent-blue-600"
                                            checked={rule.deleteOption === 1}
                                            onChange={(e) => handleCheckboxChange(rule.ruleId, 'deleteOption', e.target.checked)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-4 text-center text-gray-500">No rules found for this module</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div> */}

            <FilterableTable
                title='Module Configuration'
                dataArray={rules}
                columns={[
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
                            onClick={handleSave}
                            disabled={Object.keys(modifiedRules).length === 0}
                            className='w-auto'
                        >
                            Save Changes
                        </Button>
                    </>
                }
            />
        </div>
    );
}

export default ModuleRuleComponent;