import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import api from "../../API";
import { CheckBoxOutlineBlank, CheckBox, FilterAltOff, KeyboardArrowLeft } from '@mui/icons-material'
import { ISOString, getPreviousDate, isEqualNumber } from "../../Components/functions";
import FilterableTable from "../../Components/filterableTable";
import { Autocomplete, Button, Card, CardContent, Checkbox, IconButton, Paper, TextField, Tooltip } from "@mui/material";

import QPayColumnVisiblitySettings from "./QPayComps/settings";


const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;


const SalesTransaction = () => {
    const nav = useNavigate();
    const location = useLocation();
    const localState = location.state;
    const filterInitialValue = {
        company: 2,
        Fromdate: getPreviousDate(30),
        Todate: ISOString(),
        Ledger_Id: ''
    }
    const [repData, setRepData] = useState([]);
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [cusFilter, setCusFilter] = useState(filterInitialValue);
    const [reload, setReload] = useState(false)

    useEffect(() => {
        setCusFilter(pre => ({
            ...pre,
            company: localState?.company ? localState?.company : pre?.company,
            Ledger_Id: localState?.Ledger_Tally_Id ? localState?.Ledger_Tally_Id : pre?.Ledger_Tally_Id
        }))
    }, [localState?.company, localState?.Ledger_Tally_Id])

    useEffect(() => {
        if (cusFilter?.Ledger_Id) {
            setRepData([])
            fetch(`${api}TallyReports/qPay/salesTransaction?Company_Id=${cusFilter?.company}&Ledger_Id=${cusFilter?.Ledger_Id}&Fromdate=${cusFilter.Fromdate}&Todate=${cusFilter?.Todate}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setRepData(data.data)
                    }
                })
                .catch(e => console.error(e))
        }
    }, [localState, cusFilter?.company, cusFilter?.Ledger_Id, cusFilter?.Fromdate, cusFilter?.Todate, reload]);

    useEffect(() => {
        fetch(`${api}TallyReports/qpay/columnVisiblity?CompanyId=${cusFilter.company}&Report_Type_Id=${3}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    data?.data?.sort((a, b) => a?.Field_Name?.localeCompare(b?.Field_Name));
                    data?.data?.sort((a, b) => (a?.OrderBy && b?.OrderBy) ? a?.OrderBy - b?.OrderBy : b?.OrderBy - a?.OrderBy)
                    setColumns(data.data)
                }
            })
            .catch(e => console.error(e))
    }, [cusFilter.company, reload])

    useEffect(() => {
        applyFilters();
    }, [filters]);

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
        let filtered = [...repData];
        for (const column of columns) {
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
            const distinctValues = [...new Set(repData.map(item => item[Field_Name]?.toLowerCase()?.trim()))];
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
    // console.log(localState.preFilters)

    return (
        <>
            <Card component={Paper}>
                <div className="p-3 fa-18 fw-bold border-bottom d-flex justify-content-between align-items-center">
                    <span>Sales Transaction</span>
                    <span>
                        <QPayColumnVisiblitySettings CompanyId={cusFilter.company} columns={columns} refresh={reloadData} ReportId={3} />
                        <Button
                            startIcon={<KeyboardArrowLeft />}
                            variant="outlined"
                            onClick={() => {
                                nav(-1)
                            }}
                        >
                            Back
                        </Button>
                    </span>
                </div>
                <CardContent>
                    <div className="row flex-md-row-reverse">

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

                        <div className="col-xxl-10 col-lg-9 col-md-8">
                            <div className="d-flex flex-wrap align-items-center mb-3">
                                <input
                                    type="date"
                                    value={cusFilter.Fromdate}
                                    onChange={e => setCusFilter(pre => ({ ...pre, Fromdate: e.target.value }))}
                                    className="cus-inpt w-auto p-2 m-1"
                                />
                                -
                                <input
                                    type="date"
                                    value={cusFilter.Todate}
                                    onChange={e => setCusFilter(pre => ({ ...pre, Todate: e.target.value }))}
                                    className="cus-inpt w-auto p-2 m-1"
                                />
                            </div>
                            <FilterableTable columns={columns} dataArray={Object.keys(filters).length > 0 ? filteredData : repData} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default SalesTransaction