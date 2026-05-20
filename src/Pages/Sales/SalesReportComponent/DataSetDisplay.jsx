import React from 'react';
import { checkIsNumber } from '../../../Components/functions';
import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, IconButton, Tooltip, TextField, Checkbox, Dialog, DialogContent, DialogTitle, DialogActions, Button, Paper, Box, Card, Switch } from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank, FilterAlt, FilterAltOff, FileDownload, Settings } from '@mui/icons-material';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import FilterableTable from '../../../Components/filterableTable2';

const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const DisplayArrayData = ({ 
    dataArray = [], 
    columns = [], 
    ExpandableComp, 
    enableFilters = false,
    ExportAllData = false,

}) => {
    const [dispColmn, setDispColmn] = useState([]);
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState(dataArray);
    const filterCount = Object.keys(filters).length;
    const showData = (filterCount > 0) ? filteredData : dataArray;
    const [dialogs, setDialogs] = useState({
        filters: false,
        columnSettings: false
    });

    useEffect(() => {
        const colWithDataTypes = columns.map((keys, index) => ({
            Field_Name: keys?.Column_Name,
            Fied_Data: keys?.Data_Type,
            isVisible: index <= 7 ? 1 : 0,
            align: 'center',
            OrderBy: index + 1
        }))
        setDispColmn(colWithDataTypes);
    }, [columns])

    const sortedColumns = useMemo(() => {
        return [...dispColmn].sort((a, b) => a.OrderBy - b.OrderBy);
    }, [dispColmn]);

    useEffect(() => {
        applyFilters();
    }, [filters]);

    const handleFilterChange = (column, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const applyFilters = () => {
        let filtered = [...dataArray];
        for (const column of dispColmn) {
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

            <Box
                sx={{
                    display: 'flex',
                    gap: '16px',
                    padding: '8px',
                    flexWrap: 'wrap',
                }}
            >
                <Button
                    onClick={() => setDialogs(pre => ({ ...pre, filters: true }))}
                    className={enableFilters ? "d-md-none d-inline" : 'd-none'}
                    startIcon={<FilterAlt />}
                >
                    Filters
                </Button>
            </Box>

            <div className="row ">

                <div className={enableFilters ? "col-xxl-10 col-lg-9 col-md-8" : ''}>
                    <div className="p-2">
                        <FilterableTable
                            dataArray={showData}
                            columns={sortedColumns}
                            isExpendable={ExpandableComp ? true : false}
                            expandableComp={ExpandableComp ? ExpandableComp : undefined}
                            tableMaxHeight={650}
                            ExcelPrintOption
                        />
                    </div>
                </div>

                {enableFilters && (
                    <div className="col-xxl-2 col-lg-3 col-md-4 d-none d-md-block">
                        <h5 className="d-flex justify-content-between px-2">
                            <span>Filters</span>
                            <span>
                                <Tooltip title='Column Visiblity'>
                                    <IconButton
                                        size="small"
                                        onClick={() => setDialogs(pre => ({ ...pre, columnSettings: true }))}
                                    >
                                        <Settings />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title='Clear Filters'>
                                    <IconButton
                                        size="small"
                                        onClick={() => setFilters({})}
                                    >
                                        <FilterAltOff />
                                    </IconButton>
                                </Tooltip>
                            </span>
                        </h5>
                        <div className="border rounded-3 " style={{ maxHeight: '70vh', overflow: 'auto' }}>
                            {dispColmn.map((column, ke) => (
                                <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                    <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
                                    {renderFilter(column)}
                                </div>
                            ))}
                            <br />
                        </div>
                    </div>
                )}

            </div>

            <Dialog
                open={dialogs.filters}
                onClose={() => setDialogs(pre => ({ ...pre, filters: false }))}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>
                    <span>
                        <h5 className="d-flex justify-content-between px-2">
                            <span>Filters</span>
                            <span>
                                <Tooltip title='Column Visiblity'>
                                    <IconButton
                                        size="small"
                                        onClick={() => setDialogs(pre => ({ ...pre, filters: false }))}
                                    >
                                        <Settings />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title='Clear Filters'>
                                    <IconButton
                                        size="small"
                                        onClick={() => setFilters({})}
                                    >
                                        <FilterAltOff />
                                    </IconButton>
                                </Tooltip>
                            </span>
                        </h5>
                    </span>
                </DialogTitle>
                <DialogContent>

                    <div className="border rounded-3 " style={{ maxHeight: '70vh', overflow: 'auto' }}>
                        {dispColmn.map((column, ke) => (
                            <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
                                {renderFilter(column)}
                            </div>
                        ))}
                        <br />
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDialogs(pre => ({ ...pre, filters: false }))}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialogs.columnSettings}
                onClose={() => setDialogs(pre => ({ ...pre, columnSettings: false }))}
                maxWidth='lg' fullWidth
            >
                <DialogTitle>Column Settings</DialogTitle>
                <DialogContent>
                    <div className="row">
                        {columns.map((o, i) => {

                            const displayedColumn = dispColmn.find(oo => oo.Field_Name === o?.Column_Name)

                            return (
                                <div className="col-lg-4 col-md-6 p-2" key={i}>
                                    <Card
                                        component={Paper}
                                        className={`p-2 d-flex justify-content-between align-items-center flex-wrap ${i % 2 !== 0 ? 'bg-light' : ''}`}
                                    >
                                        <div className='d-flex justify-content-between align-items-center flex-wrap'>
                                            <Switch
                                                checked={Boolean(displayedColumn?.isVisible)}
                                                onChange={e =>
                                                    setDispColmn(prevColumns =>
                                                        prevColumns.map(oo =>
                                                            oo.Field_Name === o?.Column_Name
                                                                ? { ...oo, isVisible: e.target.checked ? 1 : 0 }
                                                                : oo
                                                        )
                                                    )}
                                            />

                                            <h6 className='fa-13 mb-0 fw-bold '>{o?.Column_Name}</h6>
                                        </div>
                                        <input
                                            type='number'
                                            value={checkIsNumber(displayedColumn?.OrderBy) ? displayedColumn?.OrderBy : ''}
                                            onChange={e =>
                                                setDispColmn(prevColumns =>
                                                    prevColumns.map(oo =>
                                                        oo.Field_Name === displayedColumn?.Field_Name
                                                            ? { ...oo, OrderBy: e.target.value }
                                                            : oo
                                                    )
                                                )
                                            }
                                            label={'Order Value'}
                                            className='mt-2 p-1 border-0 cus-inpt'
                                            style={{ width: '80px' }}
                                            placeholder='Order'
                                        />
                                    </Card>
                                </div>
                            )
                        })}
                    </div>
                </DialogContent>
                <DialogActions>
                    {/* <Button onClick={() => setColumns(columnsInitialValue)} variant="outlined">Reset</Button> */}
                    <Button onClick={() => setDialogs(pre => ({ ...pre, columnSettings: false }))} color='error'>close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}


export default DisplayArrayData;