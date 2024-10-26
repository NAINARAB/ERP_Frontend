import React, { useContext, useEffect, useState } from 'react';
import { Card, CardContent, Tab, Switch, Button, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { ArrowBackIosNewOutlined, KeyboardArrowLeft, RemoveRedEyeOutlined, Save } from '@mui/icons-material'
import { TabPanel, TabList, TabContext } from '@mui/lab';
import { Box } from '@mui/system';
import { isEqualNumber, isValidObject, Subraction } from '../../Components/functions';
import { toast } from 'react-toastify'
import { useLocation, useNavigate } from 'react-router-dom';
import { MyContext } from '../../Components/context/contextProvider';
import { fetchLink } from '../../Components/fetchComponent';


const ReportTemplateCreation = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const nav = useNavigate();
    const { contextObj } = useContext(MyContext);
    const locationState = useLocation().state;
    const initialValue = {
        Report_Type_Id: '',
        reportName: '',
        tables: [],
        tableJoins: [],
        currentTab: 'tbl_Q_Pay_Summarry',
        previewDialog: false,
        createdBy: storage.UserId
    };
    const [inputValues, setInputValues] = useState(initialValue);
    const [reportTables, setReportTables] = useState([]);
    const tablesSelected = inputValues?.tables?.reduce((sum, obj) => sum += Boolean(Number(obj?.isChecked)) ? 1 : 0, 0)
    const columnsSelected = inputValues?.tables?.reduce((sum, item) => (
        sum += Boolean(Number(item?.isChecked)) ? item?.columns?.reduce((colSum, colItem) => (
            colSum += isEqualNumber(colItem?.isVisible, 1) ? 1 : 0
        ), 0) : 0
    ), 0)

    const displaySelectedState = (
        <span className="p-2 mt-3 border rounded-3 d-inline-block w-auto">
            <table>
                <tbody>
                    <tr>
                        <td className=' border-end'>Tables Selected</td>
                        <td className='px-2 blue-text'>{tablesSelected}</td>
                    </tr>
                    <tr>
                        <td className=' border-end'>Columns Selected&emsp;&emsp;</td>
                        <td className='px-2 blue-text'>{columnsSelected}</td>
                    </tr>
                </tbody>
            </table>
        </span>
    )

    useEffect(() => {
        const stateValue = locationState?.ReportState;
        if (isValidObject(stateValue)) {
            setInputValues(pre => ({
                ...pre,
                Report_Type_Id: stateValue?.Report_Type_Id ?? '',
                reportName: stateValue?.reportName ?? '',
                tables: [...stateValue?.tables] ?? [],
                createdBy: stateValue?.createdBy ?? storage?.UserId
            }))
        }
    }, [])

    useEffect(() => {
        fetchLink({
            address: `reports/tablesAndColumns`
        }).then(data => {
            if (data?.success) {
                setReportTables(data?.data);
            }
        }).catch(e => console.log(e))   
    }, []);

    const handleTableCheck = (tableName, checked, aliasName) => {
        setInputValues(prev => {
            const updatedTables = [...prev.tables];
            const tableIndex = updatedTables.findIndex(table => table.Table_Name === tableName);

            const arraywithDefaultColumn = [];
            const repTableIndex = reportTables?.findIndex(table => table.Table_Name === tableName);
            const defaultColumnIndex = reportTables[repTableIndex]?.Columns?.findIndex(column => isEqualNumber(column?.IS_Default, 1));
            const defaultColumn = defaultColumnIndex !== -1 ? reportTables[repTableIndex]?.Columns[defaultColumnIndex] : {};

            if (defaultColumnIndex !== -1) {
                defaultColumn.Order_By = '';
                defaultColumn.isVisible = true;
            }

            arraywithDefaultColumn.push(defaultColumn)


            if (tableIndex !== -1) {
                updatedTables[tableIndex].isChecked = checked;
                if (!checked) {
                    updatedTables[tableIndex].columns = [];
                } else {
                    updatedTables[tableIndex].columns = arraywithDefaultColumn;
                }
            } else {
                updatedTables.push({
                    Table_Id: reportTables?.find(table => table?.Table_Name === tableName)?.Table_Id || '',
                    Table_Name: tableName,
                    AliasName: aliasName,
                    isChecked: checked,
                    columns: arraywithDefaultColumn,
                });
            }
            return { ...prev, tables: updatedTables.filter(table => Boolean(Number(table?.isChecked))) };

        });
    };

    const handleColumnCheck = (tableName, columnDetails, checked) => {
        setInputValues(prev => {
            const updatedTables = [...prev.tables];
            const tableIndex = updatedTables.findIndex(table => table.Table_Name === tableName);

            if (tableIndex !== -1) {
                const columns = updatedTables[tableIndex].columns || [];
                const columnNameIndex = columns?.findIndex(obj => obj?.Column_Name === columnDetails?.Column_Name);

                if (columnNameIndex !== -1) {
                    columns[columnNameIndex].isVisible = checked ? 1 : 0;
                } else {
                    columns.push({
                        ...columnDetails,
                        Order_By: '',
                        isVisible: checked ? 1 : 0
                    });
                }
                updatedTables[tableIndex].columns = columns?.filter(fil => isEqualNumber(fil?.isVisible, 1));
            }

            return { ...prev, tables: updatedTables };
        });
    };

    const handleOrderByChange = (tableName, columnDetails, value) => {
        setInputValues(prev => {
            const updatedTables = [...prev.tables];
            const tableIndex = updatedTables.findIndex(table => table.Table_Name === tableName);

            if (tableIndex !== -1) {
                const columns = updatedTables[tableIndex].columns || [];
                const columnNameIndex = columns?.findIndex(col => col?.Column_Name === columnDetails?.Column_Name);

                if (columnNameIndex !== -1) {
                    columns[columnNameIndex].Order_By = value;
                } else {
                    columns.push({
                        ...columnDetails,
                        Order_By: value,
                        isVisible: true
                    });
                }
                updatedTables[tableIndex].columns = columns;
            }

            return { ...prev, tables: updatedTables };
        });
    };

    const openPreviewDialog = () => {
        const selectedTables = inputValues.tables?.reduce((tot, table) => (
            tot += Boolean(table?.isChecked) ? 1 : 0
        ), 0)
        setInputValues(pre => ({
            ...pre,
            previewDialog: true,
            tableJoins: (selectedTables > 1) ? (
                Array.from({ length: Subraction(selectedTables, 1) }).map((_, i) => ({
                    Join_First_Table_Id: '',
                    Join_First_Table_Column: '',
                    Join_Second_Table_Id: '',
                    Join_Second_Table_Column: '',
                }))
            ) : []
        }))
    }

    const onChangeJoining = (value, index, key) => {
        setInputValues(pre => {
            const updatedJoins = [...pre.tableJoins];
            const obj = { ...updatedJoins[index] };
            obj[key] = value;

            if (key === 'Join_First_Table_Id') {
                obj.Join_First_Table_Column = '';
            }
            if (key === 'Join_Second_Table_Id') {
                obj.Join_Second_Table_Column = '';
            }

            // const repTableIndex = reportTables?.findIndex(table => isEqualNumber(table?.Table_Id, value));
            // const defaultColumnIndex = reportTables[repTableIndex]?.Columns?.findIndex(column => isEqualNumber(column?.IS_Default, 1));
            // const defaultColumn = defaultColumnIndex !== -1 ? reportTables[repTableIndex]?.Columns[defaultColumnIndex] : {};

            // obj[colKey] = defaultColumn?.Column_Name || '';
            if (obj?.Join_First_Table_Id === obj?.Join_Second_Table_Id) {
                obj.Join_Second_Table_Id = ''
            }
            updatedJoins[index] = obj;

            return {
                ...pre,
                tableJoins: [...updatedJoins]
            }
        })
    }

    const saveTemplate = () => {
        const validateSet = new Set();
        inputValues.tableJoins?.forEach(item => {
            validateSet.add(item.Join_First_Table_Id);
            validateSet.add(item.Join_Second_Table_Id);
        })
        if (validateSet.size !== (inputValues.tableJoins.length + 1) && inputValues.tables.length > 1) {
            return toast.error('Invalid table joins')
        }

        setInputValues(pre => ({ ...pre, previewDialog: false }))
        fetchLink({
            address: `reports/template`,
            method: inputValues?.Report_Type_Id ? 'PUT' : 'POST',
            bodyData: inputValues
        }).then(data => {
            if (data?.success) {
                setInputValues(initialValue);
                nav(-1)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        }).catch(e => console.log(e))
    }


    return isEqualNumber(contextObj?.Add_Rights, 1) && (
        <>
            <Card>

                <div className="p-2 border-bottom fa-16 fw-bold d-flex justify-content-between align-items-center">
                    <span className="text-primary text-uppercase ps-3">{inputValues?.Report_Type_Id ? 'Modify Report Template' : 'Report Templates Creation'}</span>
                    <Button variant='outlined' onClick={() => nav(-1)} startIcon={<KeyboardArrowLeft />}>Back</Button>
                </div>

                <CardContent>

                    <div>
                        <label className='w-100'>Report Name</label>
                        <input
                            type="text"
                            className='cus-inpt w-auto'
                            value={inputValues.reportName}
                            onChange={e => setInputValues({ ...inputValues, reportName: e.target.value })}
                        />
                    </div>

                    {displaySelectedState}

                    <Box className='d-flex flex-wrap mt-3' >

                        <TabContext value={inputValues.currentTab}>
                            <TabList
                                indicatorColor='transparent'
                                onChange={(e, newTab) => setInputValues({ ...inputValues, currentTab: newTab })}
                                variant="scrollable"
                                scrollButtons="auto"
                                orientation="vertical"
                                allowScrollButtonsMobile
                                sx={{ maxHeight: '400px' }}
                            >
                                {reportTables.map((table, index) => (
                                    <Tab
                                        key={index}
                                        sx={inputValues.currentTab === table?.Table_Name ? { backgroundColor: '#c6d7eb' } : {}}
                                        className={Boolean(inputValues.tables.find(t => t.Table_Name === table?.Table_Name)?.isChecked) ? 'text-success fw-bold' : 'text-primary'}
                                        label={table?.AliasName}
                                        value={table?.Table_Name}
                                    />
                                ))}
                            </TabList>

                            {reportTables.map((table, index) => (
                                <TabPanel value={table?.Table_Name} className='flex-grow-1 p-3 border rounded-2' key={index}>

                                    <div className='d-flex align-items-center mb-4 border-bottom'>
                                        <Switch
                                            checked={Boolean(inputValues.tables.find(t => t.Table_Name === table?.Table_Name)?.isChecked)}
                                            onChange={e => handleTableCheck(table?.Table_Name, e.target.checked, table?.AliasName)}
                                        />
                                        <h6 className='fa-13 mb-0 fw-bold '>{table?.AliasName} TABLE</h6>
                                    </div>

                                    <div className='cus-grid'>
                                        {table?.Columns?.map((colObj, colIndex) => (
                                            <div key={colIndex}>
                                                <Card className={`p-2 d-flex justify-content-between align-items-center flex-wrap ${colIndex % 2 === 0 ? 'bg-light' : ''}`}>

                                                    <div className='d-flex justify-content-between align-items-center flex-wrap'>
                                                        <Switch
                                                            checked={
                                                                Boolean(colObj?.IS_Default) ||
                                                                Boolean(
                                                                    (inputValues.tables.find(t =>
                                                                        t.Table_Name === table?.Table_Name
                                                                    ))?.columns?.find(c => c.Column_Name === colObj?.Column_Name)?.isVisible
                                                                )
                                                            }
                                                            disabled={Boolean(colObj?.IS_Default)}
                                                            onChange={e => handleColumnCheck(table?.Table_Name, colObj, e.target.checked)}
                                                        />
                                                        <h6 className='fa-12 m-0 fw-bold'>{colObj?.Column_Name}</h6>
                                                    </div>

                                                    <input
                                                        type='number'
                                                        className={`p-1 border cus-inpt ${colIndex % 2 !== 0 ? 'bg-light' : ''}`}
                                                        style={{ width: '80px' }}
                                                        placeholder='Order'
                                                        value={inputValues.tables.find(t =>
                                                            t.Table_Name === table?.Table_Name
                                                        )?.columns?.find(c => c.Column_Name === colObj?.Column_Name)?.Order_By || ''}
                                                        onChange={e => handleOrderByChange(table?.Table_Name, colObj, e.target.value)}
                                                    />
                                                </Card>
                                            </div>
                                        ))}
                                    </div>

                                </TabPanel>
                            ))}
                        </TabContext>
                    </Box>
                </CardContent>
                <hr className='mt-2 mb-0' />
                <div className="p-3 d-flex justify-content-end">
                    <Tooltip title={columnsSelected <= 4 && 'Select Minimum 5 Columns'}>
                        <span>
                            <Button
                                variant='outlined'
                                startIcon={<RemoveRedEyeOutlined />}
                                disabled={!inputValues?.reportName || tablesSelected === 0 || columnsSelected <= 4}
                                onClick={
                                    columnsSelected > 50
                                        ? () => toast.warn('Maximum 50 Column limit exceeded')
                                        : () => openPreviewDialog()
                                }
                            >
                                Preview
                            </Button>
                        </span>
                    </Tooltip>
                </div>
            </Card>

            <Dialog
                open={inputValues?.previewDialog}
                onClose={() => setInputValues(pre => ({ ...pre, previewDialog: false }))}
                fullScreen
            >
                <DialogTitle>Define Table Joins</DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();
                    saveTemplate();
                }}>
                    <DialogContent>
                        {displaySelectedState}
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {inputValues?.tables?.map((table, tabIndex) => (
                                            <React.Fragment key={tabIndex}>
                                                <th className="border fa-14 text-center">{table?.AliasName} ( {table?.columns?.length} )</th>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        {inputValues?.tables?.map((table, tabIndex) => (
                                            <React.Fragment key={tabIndex}>
                                                <td className="border fa-13 text-center">
                                                    {table?.columns?.map((col, colInd) => (
                                                        <p key={colInd}>{col?.Column_Name}</p>
                                                    ))}
                                                </td>
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {inputValues?.tables?.length > 1 && (
                            <div className="p-2 cus-grid">

                                {inputValues?.tableJoins?.map((inputs, inputIndex) => {
                                    return (
                                        <div className=' p-2' key={inputIndex}>
                                            <h5 className='border-bottom pb-2 text-center'>JOIN - {inputIndex + 1}</h5>
                                            <div className="p-2 mt-3 border rounded-3 ">
                                                <table className='w-100' >
                                                    <tbody>
                                                        <tr>
                                                            <td className='fa-13 blue-text'>Table - 1</td>
                                                            <td className='fa-13 '>
                                                                <select
                                                                    value={inputs?.Join_First_Table_Id}
                                                                    className='cus-inpt '
                                                                    onChange={e => onChangeJoining(e.target.value, inputIndex, 'Join_First_Table_Id')}
                                                                    required
                                                                >
                                                                    <option value="">Select</option>
                                                                    {inputValues?.tables?.map((table, tableInd) => (
                                                                        <option
                                                                            key={tableInd}
                                                                            value={table?.Table_Id}
                                                                            disabled={
                                                                                inputValues?.tableJoins?.find(fil =>
                                                                                    isEqualNumber(fil.Join_First_Table_Id, table?.Table_Id)
                                                                                )
                                                                            }
                                                                        >
                                                                            {table?.AliasName}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className='fa-13 blue-text'>Table - 2</td>
                                                            <td className='fa-13 '>
                                                                <select
                                                                    value={inputs?.Join_Second_Table_Id}
                                                                    className='cus-inpt '
                                                                    onChange={e => onChangeJoining(e.target.value, inputIndex, 'Join_Second_Table_Id')}
                                                                    required
                                                                >
                                                                    <option value="">Select</option>
                                                                    {inputValues?.tables?.map((table, tableInd) => (
                                                                        <option
                                                                            key={tableInd}
                                                                            value={table?.Table_Id}
                                                                            disabled={
                                                                                isEqualNumber(inputs?.Join_First_Table_Id, table?.Table_Id)
                                                                            }
                                                                        >
                                                                            {table?.AliasName}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className='fa-13 blue-text'>Table - 1 Key</td>
                                                            <td className='fa-13 '>
                                                                <select
                                                                    value={inputs?.Join_First_Table_Column}
                                                                    className='cus-inpt '
                                                                    onChange={e => onChangeJoining(e.target.value, inputIndex, 'Join_First_Table_Column')}
                                                                    required
                                                                >
                                                                    <option value="">Select</option>
                                                                    {inputs?.Join_First_Table_Id && (
                                                                        [...inputValues?.tables]?.find(table => (
                                                                            isEqualNumber(table?.Table_Id, inputs?.Join_First_Table_Id)
                                                                        ))?.columns?.map((joinKeys, joinInd) => isEqualNumber(joinKeys?.IS_Join_Key, 1) && (
                                                                            <option key={joinInd} value={joinKeys?.Column_Name}>{joinKeys?.Column_Name}</option>
                                                                        ))
                                                                    )}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td className='fa-13 blue-text'>Table - 2 Key</td>
                                                            <td className='fa-13 '>
                                                                <select
                                                                    value={inputs?.Join_Second_Table_Column}
                                                                    className='cus-inpt '
                                                                    onChange={e => onChangeJoining(e.target.value, inputIndex, 'Join_Second_Table_Column')}
                                                                    required
                                                                >
                                                                    <option value="">Select</option>
                                                                    {inputs?.Join_Second_Table_Id && (
                                                                        [...inputValues?.tables]?.find(table => (
                                                                            isEqualNumber(table?.Table_Id, inputs?.Join_Second_Table_Id)
                                                                        ))?.columns?.map((joinKeys, joinInd) => isEqualNumber(joinKeys?.IS_Join_Key, 1) && (
                                                                            <option key={joinInd} value={joinKeys?.Column_Name}>{joinKeys?.Column_Name}</option>
                                                                        ))
                                                                    )}
                                                                </select>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => setInputValues(pre => ({ ...pre, previewDialog: false }))}
                            type='button'
                            startIcon={<ArrowBackIosNewOutlined />}
                        >
                            Back
                        </Button>
                        <Button
                            type='submit'
                            startIcon={<Save />}
                        >
                            Submit
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
};

export default ReportTemplateCreation;
