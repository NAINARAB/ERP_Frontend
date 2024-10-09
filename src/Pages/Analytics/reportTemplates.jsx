import React, { useContext, useEffect, useState } from 'react';
import {
    Button, Card, CardContent, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tab, Tabs, Box, Typography,
    ListItemIcon, ListItemText, MenuItem, MenuList, Popover, TableContainer, Table, TableBody, TableCell, TableHead, TableRow, Paper
} from '@mui/material';
import { ArrowBackIosNewOutlined, Edit, ExpandLess, ExpandMore, Visibility, List, Delete, FilterAlt, Launch, Close } from '@mui/icons-material';
import { isEqualNumber, UTCDateWithTime } from '../../Components/functions';
import { MyContext } from '../../Components/context/contextProvider';
import { useNavigate } from 'react-router-dom'
import DynamicMuiTable from '../../Components/dynamicMuiTable';
import { toast } from 'react-toastify';
import { fetchLink } from '../../Components/fetchComponent';
import FilterableTable from '../../Components/filterableTable2'



const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box p={3}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
};

const ReportTemplates = () => {
    const storage = JSON.parse(localStorage.getItem('user'))
    const [templates, setTemplates] = useState([]);
    const variableState = {
        search: '',
        openFilterDialog: false,
        filterTablesAndColumns: {},
        deleteConfirmationDialog: false,
        preFilterDialog: false,
    }
    const [localVariable, setLocalVariable] = useState(variableState);
    const { contextObj } = useContext(MyContext);
    const [filters, setFilters] = useState({})
    const nav = useNavigate();
    const [reload, setReload] = useState(false)
    const [selectedTab, setSelectedTab] = useState(0);

    const handleTabChange = (event, newValue) => {
        setSelectedTab(newValue);
    };

    useEffect(() => {
        fetchLink({
            address: `reports/template`,
        }).then(data => {
            if (data?.success) {
                setTemplates(data?.data);
            }
        }).catch(e => console.log(e))
    }, [reload])

    const handleFilterChange = (column, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const renderFilter = (column) => {
        const { Column_Name, Column_Data_Type } = column;
        if (Column_Data_Type === 'number') {
            return (
                <div className='d-flex justify-content-between'>
                    <input
                        placeholder="Min"
                        type="number"
                        className="cus-inpt me-1"
                        value={filters[Column_Name]?.min ?? ''}
                        onChange={(e) => handleFilterChange(Column_Name, {
                            type: 'range',
                            ...filters[Column_Name],
                            min: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                    />
                    <input
                        placeholder="Max"
                        type="number"
                        className="cus-inpt ms-1"
                        value={filters[Column_Name]?.max ?? ''}
                        onChange={(e) => handleFilterChange(Column_Name, {
                            type: 'range',
                            ...filters[Column_Name],
                            max: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                    />
                </div>
            );
        } else if (Column_Data_Type === 'date') {
            return (
                <div className='d-flex justify-content-between flex-wrap'>
                    <input
                        placeholder="Start Date"
                        type="date"
                        className="cus-inpt w-auto flex-grow-1 me-1 my-1"
                        value={filters[Column_Name]?.value?.start ?? ''}
                        onChange={(e) => handleFilterChange(Column_Name, {
                            type: 'date',
                            value: { ...filters[Column_Name]?.value, start: e.target.value || undefined }
                        })}
                    />
                    <input
                        placeholder="End Date"
                        type="date"
                        className="cus-inpt w-auto flex-grow-1 ms-1 my-1"
                        value={filters[Column_Name]?.value?.end ?? ''}
                        onChange={(e) => handleFilterChange(Column_Name, {
                            type: 'date',
                            value: { ...filters[Column_Name]?.value, end: e.target.value || undefined }
                        })}
                    />
                </div>
            );
        } else if (Column_Data_Type === 'string') {
            return (
                <input
                    type="text"
                    placeholder='Search...'
                    className='cus-inpt'
                    value={filters[Column_Name]?.value ?? ''}
                    onChange={e => handleFilterChange(Column_Name, {
                        type: 'textCompare',
                        value: String(e.target.value).toLowerCase() || ''
                    })}
                />
            )
        }
    };

    const Actions = ({ o }) => {
        const [anchorEl, setAnchorEl] = useState(null);

        const dataToForward = {
            Report_Type_Id: o?.Report_Type_Id,
            reportName: o?.Report_Name,
            tables: o?.tablesList?.map(table => ({
                Table_Id: table?.Table_Id,
                Table_Name: table?.Table_Name,
                AliasName: table?.AliasName,
                Table_Accronym: table?.Table_Accronym,
                isChecked: true,
                columns: table?.columnsList?.map(column => ({
                    Column_Data_Type: column?.Column_Data_Type,
                    Column_Name: column?.Column_Name,
                    IS_Default: column?.IS_Default,
                    IS_Join_Key: column?.IS_Join_Key,
                    Order_By: column?.Order_By,
                    Table_Id: column?.Table_Id,
                    isVisible: true
                }))
            }))
        }

        const popOverOpen = Boolean(anchorEl);
        const id = popOverOpen ? o?.Report_Name : undefined;

        const handleClick = (event) => {
            setAnchorEl(event.currentTarget);
        };

        const handleClose = () => {
            setAnchorEl(null);
        };

        return (
            <>
                <IconButton aria-describedby={id} onClick={handleClick}>
                    <List />
                </IconButton>

                <Popover
                    id={id}
                    open={popOverOpen}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                >
                    <MenuList>

                        <MenuItem
                            onClick={!storage?.Company_id
                                ? () => toast.warn('Select Company!')
                                : () => {
                                    setLocalVariable(pre => ({
                                        ...pre,
                                        filterTablesAndColumns: dataToForward,
                                        openFilterDialog: true,
                                    }));
                                    setSelectedTab(0);
                                    setFilters({})
                                }
                            }
                        // disabled={!storage?.Company_id}
                        >
                            <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
                            <ListItemText>OPEN</ListItemText>
                        </MenuItem>

                        <MenuItem
                            onClick={
                                !storage?.Company_id
                                    ? () => toast.warn('Select Company!')
                                    : () => {
                                        setLocalVariable(pre => ({
                                            ...pre,
                                            filterTablesAndColumns: dataToForward,
                                            preFilterDialog: true,
                                        }));
                                        setFilters({});
                                        setSelectedTab(0);
                                    }
                            }
                        >
                            <ListItemIcon><FilterAlt fontSize="small" /></ListItemIcon>
                            <ListItemText>FILTERS</ListItemText>
                        </MenuItem>

                        <MenuItem
                            onClick={() => nav('create', { state: { ReportState: dataToForward } })}
                        >
                            <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                            <ListItemText>EDIT</ListItemText>
                        </MenuItem>

                        <MenuItem
                            onClick={() => setLocalVariable(pre => ({ ...pre, deleteConfirmationDialog: true, filterTablesAndColumns: dataToForward }))}
                        >
                            <ListItemIcon><Delete fontSize="small" color='error' /></ListItemIcon>
                            <ListItemText>DELETE</ListItemText>
                        </MenuItem>

                    </MenuList>
                </Popover>
            </>
        )
    }

    const RowComp = ({ o }) => {
        return (
            <>
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                {['SNo', 'Table', 'Column', 'Data-Type', 'Order'].map(o => (
                                    <th className="border fa-14 text-center" key={o} style={{ backgroundColor: '#EDF0F7' }}>{o}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {o?.tablesList?.map((table, tableInd) => (
                                <React.Fragment key={tableInd}>
                                    {table?.columnsList?.map((column, columnInd) => (
                                        <tr key={columnInd}>
                                            {columnInd === 0 && (
                                                <>
                                                    <td className="border fa-13 text-center vctr" rowSpan={table?.columnsList?.length}>{tableInd + 1}</td>
                                                    <td className="border fa-13 text-center blue-text vctr" rowSpan={table?.columnsList?.length}>
                                                        {table?.AliasName}
                                                    </td>
                                                </>
                                            )}
                                            <td
                                                className={`
                                                                border fa-13 vctr
                                                                ${Boolean(Number(column?.IS_Default)) ? ' blue-text ' : ''}
                                                                ${Boolean(Number(column?.IS_Join_Key)) ? ' fw-bold ' : ''}
                                                                `}
                                            >
                                                {column?.Column_Name}
                                            </td>
                                            <td className="border fa-13 vctr">{column?.Column_Data_Type}</td>
                                            <td className="border fa-13 vctr">{column?.Order_By}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </>
        )
    }

    const closeDialog = () => {
        setLocalVariable(pre => ({ ...pre, openFilterDialog: false, filterTablesAndColumns: {} }))
    }

    const closeDeleteConfirmationDialog = () => {
        setLocalVariable(pre => ({ ...pre, deleteConfirmationDialog: false, filterTablesAndColumns: {} }))
    }

    const closeFilterDialog = () => {
        setLocalVariable(pre => ({ ...pre, preFilterDialog: false }));
        setFilters({})
    }

    const deleteTemplate = () => {
        setLocalVariable(pre => ({ ...pre, deleteConfirmationDialog: false }))
        fetchLink({
            address: `reports/template`,
            method: 'DELETE',
            bodyData: {
                Report_Type_Id: localVariable?.filterTablesAndColumns?.Report_Type_Id
            }
        }).then(data => {
            if (data?.success) {
                toast.success(data.message)
                setReload(pre => !pre)
            } else {
                toast.error(data.message)
            }
        }).catch(e => console.log(e))
            .finally(() => setLocalVariable(pre => ({ ...pre, filterTablesAndColumns: {} })))
    }

    return (
        <>

            <Card>

                <div className="p-2 border-bottom fa-16 fw-bold d-flex justify-content-between align-items-center">
                    <span className="text-primary text-uppercase ps-3">Report Templates</span>
                    {isEqualNumber(contextObj?.Add_Rights, 1) && (
                        <Button variant='outlined' onClick={() => nav('create')}>Add Report</Button>
                    )}
                </div>

                <div className="d-flex justify-content-end p-3">
                    <input
                        type="search"
                        className='cus-inpt w-auto'
                        placeholder='Search Report Name'
                        value={localVariable?.search ?? ''}
                        onChange={e => setLocalVariable(pre => ({ ...pre, search: String(e.target.value).toLowerCase() }))}
                    />
                </div>

                <CardContent className='p-0'>
                    <FilterableTable
                        dataArray={
                            !localVariable?.search ? templates : (
                                [...templates].filter(fil =>
                                    String(fil?.Report_Name).toLowerCase().includes(localVariable.search)
                                )
                            )
                        }
                        columns={[
                            { Field_Name: 'Report_Name', ColumnHeader: 'Report Name', Fied_Data: 'string', isVisible: 1 },
                            { ColumnHeader: 'Tables', isVisible: 1, isCustomCell: true, Cell: ({ row }) => row?.tablesList?.length },
                            { ColumnHeader: 'Columns', isVisible: 1, isCustomCell: true, Cell: ({ row }) => row?.tablesList?.reduce((sum, item) => sum += Number(item?.columnsList?.length), 0) },
                            { Field_Name: 'CreatedByGet', ColumnHeader: 'Created By', Fied_Data: 'string', isVisible: 1, },
                            { ColumnHeader: 'Columns', isVisible: 1, isCustomCell: true, Cell: ({ row }) => row?.CreatedAt ? UTCDateWithTime(row?.CreatedAt) : ' - ' },
                            { ColumnHeader: 'Action', isVisible: 1, isCustomCell: true, Cell: ({ row }) => <Actions o={row} /> },
                        ]}
                        EnableSerialNumber
                        isExpendable={true}
                        expandableComp={({ row }) => <RowComp o={row} />}
                        tableMaxHeight={650}
                    />
                </CardContent>
            </Card>

            <Dialog
                open={localVariable?.openFilterDialog}
                onClose={closeDialog}
                fullScreen
            >
                <DialogTitle className='d-flex justify-content-between align-items-center fa-16'>
                    <span>
                        Report - <span className="blue-text">{localVariable?.filterTablesAndColumns?.reportName}</span>
                    </span>
                    <span>
                        <IconButton onClick={closeDialog} color='error' className=' shadow-lg'>
                            <Close />
                        </IconButton>
                    </span>
                </DialogTitle>
                <DialogContent>
                    {(localVariable?.filterTablesAndColumns?.Report_Type_Id && storage?.Company_id) && (
                        <DynamicMuiTable reportId={localVariable?.filterTablesAndColumns?.Report_Type_Id} company={storage?.Company_id} queryFilters={filters} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeDialog}
                        startIcon={<ArrowBackIosNewOutlined />}
                    >
                        Back
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={localVariable?.deleteConfirmationDialog}
                onClose={closeDeleteConfirmationDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    Do you want to delete the Template <span className='blue-text'>{localVariable?.filterTablesAndColumns?.reportName}</span> permanently
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeDeleteConfirmationDialog}
                    >
                        cancel
                    </Button>
                    <Button
                        onClick={deleteTemplate}
                        startIcon={<Delete />}
                        variant='outlined'
                        color='error'
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={localVariable?.preFilterDialog}
                onClose={closeFilterDialog}
                fullWidth maxWidth='md'
            >
                <DialogTitle className='d-flex justify-content-between'>
                    <span>
                        Filters For <span className="blue-text">{localVariable?.filterTablesAndColumns?.reportName}</span> - Report
                    </span>
                    <span>
                        <IconButton onClick={closeFilterDialog} color='error' className='shadow-lg '>
                            <Close />
                        </IconButton>
                    </span>
                </DialogTitle>
                <DialogContent>
                    <Tabs value={selectedTab} onChange={handleTabChange}>
                        {localVariable?.filterTablesAndColumns?.tables?.map((table, i) => (
                            <Tab label={table?.AliasName} key={i} />
                        ))}
                    </Tabs>
                    {localVariable?.filterTablesAndColumns?.tables?.map((table, i) => (
                        <TabPanel value={selectedTab} index={i} key={i}>
                            <div className="row">
                                {table?.columns?.map((column, ii) => (
                                    !Boolean(Number(column?.IS_Default)) &&
                                    !Boolean(Number(column?.IS_Join_Key)) &&
                                    (
                                        <div className="p-2 col-md-6 " key={ii}>
                                            <label className='mb-2 fw-bold text-muted'>{column?.Column_Name}</label>
                                            {renderFilter(column)}
                                        </div>
                                    )
                                ))}
                            </div>
                        </TabPanel>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeFilterDialog}
                    >
                        cancel
                    </Button>
                    <Button
                        onClick={() => setLocalVariable(pre => ({ ...pre, openFilterDialog: true, preFilterDialog: false }))}
                        startIcon={<Launch />}
                        variant='contained'
                    >
                        Open report
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ReportTemplates