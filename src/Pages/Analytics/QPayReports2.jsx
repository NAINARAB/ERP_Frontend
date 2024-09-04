import { useState, useEffect } from "react";
import { Card, FormControlLabel, Switch, Tab, Box, Checkbox, TextField, Autocomplete, IconButton, Dialog, DialogContent, DialogActions, Button, Tooltip } from "@mui/material";
import { CheckBoxOutlineBlank, CheckBox, FilterAlt, FilterAltOff } from '@mui/icons-material'
import { TabPanel, TabList, TabContext } from '@mui/lab';
import QPaySalesBasedComp from "./QPayComps/salesBased";
import QPayBasedComp from "./QPayComps/qPayBased";
import FilterableTable from "../../Components/filterableTable";
import QPayColumnVisiblitySettings from "./QPayComps/settings";
import { isEqualNumber, isObject, checkIsNumber } from "../../Components/functions";
import QPayGroupingList from './QPayComps/qpayGroupingList'
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import { GrTransaction } from "react-icons/gr";
import { fetchLink } from "../../Components/fetchComponent";


const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;


const QPayReports = () => {
    const nav = useNavigate();

    const tabList = ['LIST', 'Q-PAY BASED', 'SALES VALUE BASED'];
    const filterInitialValue = {
        zeros: false,
        company: 2,
        consolidate: 1,
        view: 'LIST',
        filterDialog: false,
        displayGrouping: false,
    }

    const [repData, setRepData] = useState([]);
    const [showData, setShowData] = useState([]);
    const [reload, setReload] = useState(false);

    const [cusFilter, setCusFilter] = useState(filterInitialValue);
    const [columns, setColumns] = useState([]);
    const [sortedColumns, setSortedColumns] = useState([])

    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState(showData);

    const [ledgerId, setLedgerId] = useState([]);

    useEffect(() => {
        setSortedColumns(columns?.sort((a, b) => (a?.OrderBy && b?.OrderBy) ? a?.OrderBy - b?.OrderBy : b?.OrderBy - a?.OrderBy))
    }, [columns])

    useEffect(() => {
        setRepData([])
        fetchLink({
            address: `reports/tallyReports/qPay?Company_Id=${cusFilter?.company}&Consolidate=${cusFilter?.consolidate}`
        }).then(data => {
            if (data.success) {
                setRepData(data.data)
            }
        }).catch(e => console.error(e))
    }, [cusFilter?.company, cusFilter?.consolidate, reload])

    useEffect(() => {
        const temp = [...repData];
        const zerosIncluded = !cusFilter.zeros ? temp.filter(o => o?.Q_Pay_Days) : temp;

        setShowData(zerosIncluded);
    }, [repData, cusFilter.zeros]);

    useEffect(() => {
        fetchLink({
            address: `reports/tallyReports/qpay/columnVisiblity?CompanyId=${cusFilter.company}&Report_Type_Id=${Boolean(cusFilter?.consolidate) ? 1 : 2}`
        }).then(data => {
            if (data.success) {
                data?.data?.sort((a, b) => a?.Field_Name?.localeCompare(b?.Field_Name));
                setColumns(data.data)
            }
        })
        .catch(e => console.error(e))   
    }, [cusFilter.company, cusFilter?.consolidate, reload])

    useEffect(() => {
        applyFilters();
    }, [filters]);

    useEffect(() => {
        const filterCount = Object.keys(filters).length;
        const dataArray = (filterCount > 0) ? filteredData : showData;

        const str = dataArray?.reduce((idStr, obj) => {
            return obj?.Ledger_Tally_Id ? [...idStr, obj?.Ledger_Tally_Id] : idStr
        }, [])
        setLedgerId(str)
    }, [filters, showData, filteredData])

    const openSalesTransaction = (obj) => {

        if (Array.isArray(obj) && obj?.length) {
            const Ledger_Tally_Id = obj?.reduce((idStr, item) => {
                if (item) {
                    return idStr ? `${idStr},${item}` : `${item}`;
                }
                return idStr;
            }, '');
            nav('SalesTransaction', {
                state: {
                    Ledger_Tally_Id: Ledger_Tally_Id,
                    isObj: false,
                    rowDetails: obj,
                    company: cusFilter.company,
                    preFilters: filters
                }
            })

        } else if (isObject(obj) && checkIsNumber(obj.Ledger_Tally_Id)) {

            nav('SalesTransaction', {
                state: {
                    Ledger_Tally_Id: obj.Ledger_Tally_Id,
                    isObj: true,
                    rowDetails: obj,
                    company: cusFilter.company,
                    preFilters: filters
                }
            })

        } else {
            toast.error('Ledger Id not available')
        }
    }

    const dispTab = (val) => {
        const filterCount = Object.keys(filters).length;
        const dataArray = (filterCount > 0) ? filteredData : showData;
        switch (val) {
            // case 'LIST': return <QPayListComp dataArray={filteredData} />
            case 'LIST': return <FilterableTable dataArray={dataArray} columns={sortedColumns} onClickFun={openSalesTransaction} />
            case 'Q-PAY BASED': return <QPayBasedComp dataArray={dataArray} columns={sortedColumns} filters={filters} />
            case 'SALES VALUE BASED': return <QPaySalesBasedComp dataArray={dataArray} />
            default: <></>
        }
    }

    const reloadData = () => {
        setReload(pre => !pre)
    }

    const handleFilterChange = (column, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const applyFilters = () => {
        let filtered = [...showData];
        for (const column of sortedColumns) {
            if (filters[column.Field_Name]) {
                if (filters[column.Field_Name].type === 'range') {
                    const { min, max } = filters[column.Field_Name];
                    filtered = filtered.filter(item => {
                        const value = item[column.Field_Name];
                        return (min === undefined || value >= min) && (max === undefined || value <= max);
                    });
                } else if (filters[column.Field_Name].type === 'date') {
                    const { start, end } = filters[column.Field_Name].value;
                    filtered = filtered.filter(item => {
                        const dateValue = new Date(item[column.Field_Name]);
                        return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
                    });
                } else if (Array.isArray(filters[column.Field_Name])) {
                    filtered = filters[column.Field_Name]?.length > 0 ? filtered.filter(item => filters[column.Field_Name].includes(item[column.Field_Name].toLowerCase().trim())) : filtered
                }
            }
        }
        setFilteredData(filtered);
    };

    const renderFilter = (column) => {
        const { Field_Name, Fied_Data } = column;
        if (Fied_Data === 'number') {
            return (
                <div className='d-flex justify-content-between px-2'>
                    <input
                        placeholder="Min"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Field_Name]?.min ?? ''}
                        onChange={(e) => handleFilterChange(Field_Name, { type: 'range', ...filters[Field_Name], min: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                    <input
                        placeholder="Max"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Field_Name]?.max ?? ''}
                        onChange={(e) => handleFilterChange(Field_Name, { type: 'range', ...filters[Field_Name], max: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                </div>
            );
        } else if (Fied_Data === 'date') {
            return (
                <div className='d-flex justify-content-between px-2'>
                    <input
                        placeholder="Start Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Field_Name]?.value?.start ?? ''}
                        onChange={(e) => handleFilterChange(Field_Name, { type: 'date', value: { ...filters[Field_Name]?.value, start: e.target.value || undefined } })}
                    />
                    <input
                        placeholder="End Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Field_Name]?.value?.end ?? ''}
                        onChange={(e) => handleFilterChange(Field_Name, { type: 'date', value: { ...filters[Field_Name]?.value, end: e.target.value || undefined } })}
                    />
                </div>
            );
        } else if (Fied_Data === 'string') {
            const distinctValues = [...new Set(showData.map(item => item[Field_Name]?.toLowerCase()?.trim()))];
            return (
                <Autocomplete
                    multiple
                    id={`${Field_Name}-filter`}
                    options={distinctValues}
                    disableCloseOnSelect
                    getOptionLabel={option => option}
                    value={filters[Field_Name] || []}
                    onChange={(event, newValue) => handleFilterChange(Field_Name, newValue)}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox
                                icon={icon}
                                checkedIcon={checkedIcon}
                                style={{ marginRight: 8 }}
                                checked={selected}
                            />
                            {option}
                        </li>
                    )}
                    isOptionEqualToValue={(opt, val) => opt === val}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={Field_Name}
                            placeholder={`Select ${Field_Name?.replace(/_/g, ' ')}`}
                        />
                    )}
                />
            );
        }
    };

    return (
        <>
            <Card>

                <div className="p-2 border-bottom fa-16 fw-bold">
                    <span className="text-uppercase ps-3">Q-Pay Report</span>
                </div>

                <div className="d-flex flex-wrap justify-content-between p-2">
                    <span>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!cusFilter.zeros}
                                    onChange={e => setCusFilter(pre => ({ ...pre, zeros: !(e.target.checked) }))}
                                />
                            }
                            label="Remove Zeros"
                            labelPlacement="start"
                            className=" fw-bold text-primary"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={cusFilter.consolidate === 1 ? true : false}
                                    onChange={e => setCusFilter(pre => ({ ...pre, consolidate: e.target.checked ? 1 : 0 }))}
                                />
                            }
                            label="Consolidate"
                            labelPlacement="start"
                            className=" fw-bold text-primary"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={cusFilter.displayGrouping}
                                    onChange={e => setCusFilter(pre => ({ ...pre, displayGrouping: e.target.checked }))}
                                />
                            }
                            label="Grouping"
                            labelPlacement="start"
                            className=" fw-bold text-primary"
                        />
                    </span>

                    <span>
                        <QPayColumnVisiblitySettings
                            CompanyId={cusFilter.company}
                            columns={sortedColumns}
                            refresh={reloadData}
                            ReportId={Boolean(cusFilter?.consolidate) ? 1 : 2}
                        />
                        <Tooltip title='Open Sales List'>
                            <IconButton
                                onClick={() => openSalesTransaction(ledgerId)}
                                size="small"
                            >
                                <GrTransaction />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Filters">
                            <IconButton
                                onClick={() => setCusFilter(pre => ({ ...pre, filterDialog: true }))}
                                size="small"
                                className="d-md-none d-inline"
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                    </span>
                </div>

                {cusFilter.displayGrouping ? <QPayGroupingList dataArray={showData} columns={sortedColumns} /> : (
                    <div className="row ">

                        <div className="col-xxl-10 col-lg-9 col-md-8">
                            <div className="p-2">
                                <TabContext value={cusFilter.view}>
                                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                        <TabList
                                            indicatorColor='transparant'
                                            onChange={(e, n) => setCusFilter(pre => ({ ...pre, view: n }))}
                                            variant="scrollable"
                                            scrollButtons="auto"
                                            allowScrollButtonsMobile
                                        >
                                            {tabList.map(o => (
                                                <Tab sx={cusFilter.view === o ? { backgroundColor: '#c6d7eb' } : {}} label={o} value={o} key={o} />
                                            ))}
                                        </TabList>
                                    </Box>
                                    {tabList.map(o => (
                                        <TabPanel value={o} sx={{ px: 0, py: 2 }} key={o}>
                                            {dispTab(cusFilter.view)}
                                        </TabPanel>
                                    ))}
                                </TabContext>
                            </div>
                        </div>

                        <div className="col-xxl-2 col-lg-3 col-md-4 d-none d-md-block">
                            <h5 className="d-flex justify-content-between px-2">
                                Filters
                                <Tooltip title='Clear Filters'>
                                    <IconButton
                                        size="small"
                                        onClick={() => setFilters({})}
                                    >
                                        <FilterAltOff />
                                    </IconButton>
                                </Tooltip>
                            </h5>
                            <div className="border rounded-3 " style={{ maxHeight: '70vh', overflow: 'auto' }}>
                                {columns.map((column, ke) => (isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1)) && (
                                    <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                        <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
                                        {renderFilter(column)}
                                    </div>
                                ))}
                                <br />
                            </div>
                        </div>

                    </div>
                )}

            </Card>

            <Dialog
                open={cusFilter?.filterDialog}
                onClose={() => setCusFilter(pre => ({ ...pre, filterDialog: false }))}
                fullWidth
                maxWidth='sm'
            >
                {/* <DialogTitle></DialogTitle> */}
                <DialogContent>
                    <h5 className="d-flex justify-content-between px-2">
                        Filters
                        <Tooltip title='Clear Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setFilters({})}
                            >
                                <FilterAltOff />
                            </IconButton>
                        </Tooltip>
                    </h5>
                    <div className="border rounded-3 " style={{ maxHeight: '70vh', overflow: 'auto' }}>
                        {columns.map((column, ke) => (isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1)) && (
                            <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
                                {renderFilter(column)}
                            </div>
                        ))}
                        <br />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCusFilter(pre => ({ ...pre, filterDialog: false }))} color='error'>close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default QPayReports