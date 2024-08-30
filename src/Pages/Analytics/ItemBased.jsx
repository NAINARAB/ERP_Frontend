import React, { useState, useEffect } from "react";
import { Autocomplete, Button, Card, CardContent, Checkbox, Dialog, DialogActions, DialogContent, IconButton, TextField, Tooltip } from "@mui/material";
import { firstDayOfMonth, isEqualNumber, ISOString } from "../../Components/functions";
import api from "../../API";
import MaterialTableComponent from "../../Components/materialTableComponent";
import { FilterAltOff, CheckBoxOutlineBlank, CheckBox, FilterAlt, } from "@mui/icons-material";

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;


const ItemBasedReport = () => {
    const [repData, setRepData] = useState([]);
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState([])
    const initialFilterState = {
        company: 2,
        Fromdate: firstDayOfMonth(),
        Todate: ISOString(),
        filterDialog: false,
        hidecolumn: {
            invoice_no: false,
            Group_ST: false,
            Brand: false,
            Bag: false
        }
    };
    const [cusFilter, setCusFilter] = useState(initialFilterState);

    useEffect(() => {
        fetch(`${api}TallyReports/productBased?Company_Id=${cusFilter?.company}&Fromdate=${cusFilter?.Fromdate}&Todate=${cusFilter?.Todate}`, {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                'Db': cusFilter?.company
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setRepData(data.data)
                }
            })
            .catch(e => console.error(e))
    }, [cusFilter]);

    useEffect(() => {
        applyFilters();
    }, [filters]);

    const columns = [
        {
            isVisible: 1,
            Field_Name: 'invoice_no',
            Fied_Data: 'string',
            Filter: false
        },
        {
            isVisible: 1,
            Field_Name: 'Stock_Item',
            Fied_Data: 'string',
        },
        {
            isVisible: 1,
            Field_Name: 'Quantity',
            Fied_Data: 'string',
            Filter: true
        },
        {
            isVisible: 1,
            Field_Name: 'Item_Rate',
            Fied_Data: 'number',
            Filter: true
        },
        {
            isVisible: 1,
            Field_Name: 'amount',
            Fied_Data: 'number',
            Filter: true
        },
        {
            isVisible: 1,
            Field_Name: 'Ledger_Name',
            Fied_Data: 'string',
            Filter: true
        },
        {
            isVisible: 1,
            Field_Name: 'Stock_Group',
            Fied_Data: 'string',
            Filter: true
        },
        {
            isVisible: 1,
            Field_Name: 'Group_ST',
            Fied_Data: 'string',
            Filter: true
        },
        {
            isVisible: 1,
            Field_Name: 'Brand',
            Fied_Data: 'string',
            Filter: true
        },
        {
            isVisible: 1,
            Field_Name: 'Bag',
            Fied_Data: 'string',
            Filter: true
        },
        {
            isVisible: 1,
            Field_Name: 'Item_Name_Modified',
            Fied_Data: 'string',
            Filter: true
        },
        {
            isVisible: 1,
            Field_Name: 'Date',
            Fied_Data: 'date',
            Filter: true
        },
    ];

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
                    // id={`${Field_Name}-filter`}
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

                <div className="p-3 border-bottom fa-16 fw-bold">
                    <span className="text-uppercase">Item Based Sales</span>
                </div>

                <CardContent>

                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <span>
                            <input
                                type="date"
                                value={cusFilter.Fromdate}
                                onChange={e => setCusFilter(pre => ({ ...pre, Fromdate: e.target.value }))}
                                className="cus-inpt w-auto"
                            />
                            -
                            <input
                                type="date"
                                value={cusFilter.Todate}
                                onChange={e => setCusFilter(pre => ({ ...pre, Todate: e.target.value }))}
                                className="cus-inpt w-auto"
                            />
                        </span>
                        <span>
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

                </CardContent>
                
                <div className="row">

                    <div className="col-xxl-10 col-lg-9 col-md-8">
                        <MaterialTableComponent
                            dataArray={(Object.keys(filters).length > 0) ? filteredData : repData}
                            columns={columns}
                            columnVisiblity={cusFilter.hidecolumn}
                            columnGroupings={['Stock_Group', 'Item_Name_Modified', 'Stock_Item']}
                        />
                    </div>

                    <div className="col-xxl-2 col-lg-3 col-md-4 d-none d-md-block p-2">
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
                        <div className="border rounded-3 " style={{ maxHeight: '64vh', overflow: 'auto' }}>
                            {columns.map((column, ke) => (isEqualNumber(column?.isVisible, 1) && column.Filter) && (
                                <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                    <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
                                    {renderFilter(column)}
                                </div>
                            ))}
                            <br />
                        </div>
                    </div>

                </div>

            </Card>

            <Dialog
                open={cusFilter?.filterDialog}
                onClose={() => setCusFilter(pre => ({ ...pre, filterDialog: false }))}
                fullWidth
                maxWidth='sm'
            >
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
                        {columns.map((column, ke) => (isEqualNumber(column?.isVisible, 1) && column.Filter) && (
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
    );
};

export default ItemBasedReport;
