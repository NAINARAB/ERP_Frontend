import { Fragment, useEffect, useState } from "react";
import FilterableTable from "../../../Components/filterableTable2";
import { isEqualNumber, checkIsNumber } from '../../../Components/functions'
import { Autocomplete, Button, Card, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Switch, TextField, Tooltip } from "@mui/material";
import { CheckBoxOutlineBlank, CheckBox, FilterAltOff, Settings, Download } from '@mui/icons-material'
import { mkConfig, generateCsv, download } from 'export-to-csv';
import * as XLSX from 'xlsx';

const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
});
const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const columnsInitialValue = [
    { Field_Name: "Ledger_Name", Fied_Data: "string", isVisible: 1, isDefault: 1, OrderBy: 1 },
    { Field_Name: "Billed_Qty", Fied_Data: "number", isVisible: 1, isDefault: 0, OrderBy: 2 },
    { Field_Name: "M2_Avg", Fied_Data: "number", isVisible: 1, isDefault: 0, OrderBy: 3 },
    { Field_Name: "M3_Avg", Fied_Data: "number", isVisible: 1, isDefault: 0, OrderBy: 4 },
    { Field_Name: "M6_Avg", Fied_Data: "number", isVisible: 1, isDefault: 0, OrderBy: 5 },
    { Field_Name: "M9_Avg", Fied_Data: "number", isVisible: 0, isDefault: 0, OrderBy: 6 },
    { Field_Name: "M12_Avg", Fied_Data: "number", isVisible: 1, isDefault: 0, OrderBy: 7 },
    { Field_Name: "Q_Pay_Days", Fied_Data: "number", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "Freq_Days", Fied_Data: "number", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "Ledger_Alias", Fied_Data: "string", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "Actual_Party_Name_with_Brokers", Fied_Data: "string", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "Party_Name", Fied_Data: "string", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "Party_Location", Fied_Data: "string", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "Party_Nature", Fied_Data: "string", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "Party_Group", Fied_Data: "string", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "Ref_Brokers", Fied_Data: "string", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "Ref_Owners", Fied_Data: "string", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "Party_Mobile_1", Fied_Data: "string", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "Party_Mobile_2", Fied_Data: "string", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "Party_District", Fied_Data: "string", isVisible: 0, isDefault: 0, OrderBy: null },
    { Field_Name: "File_No", Fied_Data: "string", isVisible: 0, isDefault: 0, OrderBy: null }
]

const LedgerBasedSalesReport = ({ dataArray, filterDialog, closeDialog }) => {
    const [filters, setFilters] = useState({});
    const [showData, setShowData] = useState([]);
    const [filteredData, setFilteredData] = useState(showData);
    const [dialog, setDialog] = useState(false);
    const [columns, setColumns] = useState(columnsInitialValue);
    const DisplayColumn = [...columns].filter(
        col => (isEqualNumber(col?.Defult_Display, 1) || isEqualNumber(col?.isVisible, 1))
    ).map(col => col.Field_Name)

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
                    filtered = filters[column.Field_Name]?.length > 0 ? filtered.filter(item => filters[column.Field_Name].includes(item[column.Field_Name]?.toLowerCase().trim())) : filtered
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
            const distinctValues = [...new Set(dataArray.map(item => item[Field_Name]?.toLowerCase()?.trim()))];
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

    const ledgerAndTransactionExport = (excludeDetails, transactions) => {
        const wb = XLSX.utils.book_new();

        const excludeDetailsSheet = XLSX.utils.json_to_sheet(excludeDetails);
        XLSX.utils.book_append_sheet(wb, excludeDetailsSheet, 'Sheet1');

        const transactionsSheet = XLSX.utils.json_to_sheet(transactions);
        XLSX.utils.book_append_sheet(wb, transactionsSheet, 'Sheet2');

        XLSX.writeFile(wb, 'exported_data.xlsx');
    };

    const handleExportData = () => {
        const dataForDownload = showData.map(row => {
            const excludeDetails = Object.fromEntries(
                Object.entries(row).filter(([key]) => key !== 'LedgerSales' && DisplayColumn.find(colKey => colKey === key))
            );

            return excludeDetails
        })
        const csv = generateCsv(csvConfig)(dataForDownload);
        download(csvConfig)(csv);
    };

    useEffect(() => {
        const dataToUse = (Object.keys(filters).length > 0) ? filteredData : dataArray;
        setShowData(dataToUse);
    }, [filters, dataArray, filteredData])

    useEffect(() => {
        setColumns(pre => pre.sort((a, b) => (a?.OrderBy && b?.OrderBy) ? a?.OrderBy - b?.OrderBy : b?.OrderBy - a?.OrderBy))
    }, [columns])

    return (
        <Fragment>
            <Button
                variant="outlined"
                className="mb-2"
                onClick={handleExportData}
                startIcon={<Download />}
            >
                Download Ledger Data
            </Button>

            <div className="row">

                <div className="col-xxl-10 col-lg-9 col-md-8">
                    <FilterableTable
                        columns={[
                            {
                                Field_Name: "Excel_Export",
                                Fied_Data: "string",
                                isVisible: 1,
                                OrderBy: 1,
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    const excludeDetails = Object.fromEntries(
                                        Object.entries(row).filter(([key]) => key !== 'LedgerSales' && DisplayColumn.find(colKey => colKey === key))
                                    );
                                    return (
                                        <>
                                            <IconButton
                                                size="small"
                                                onClick={() => {
                                                    ledgerAndTransactionExport([excludeDetails], row.LedgerSales);
                                                }}
                                            >
                                                <Download />
                                            </IconButton>
                                        </>
                                    )
                                }
                            },
                            ...columns.map(col => (isEqualNumber(col.isVisible, 1)) && col),
                        ]}
                        dataArray={showData}
                        isExpendable={true}
                        expandableComp={({ row }) => {
                            return (
                                <FilterableTable
                                    initialPageCount={15}
                                    dataArray={Array.isArray(row.LedgerSales) ? row.LedgerSales : []}
                                    columns={[
                                        {
                                            Field_Name: 'Stock_Group',
                                            isVisible: 1,
                                            Fied_Data: 'string',
                                        },
                                        {
                                            Field_Name: 'bill_qty',
                                            isVisible: 1,
                                            Fied_Data: 'number',
                                        },
                                        {
                                            Field_Name: 'M2_AVG_Qty',
                                            isVisible: 1,
                                            Fied_Data: 'number',
                                        },
                                        {
                                            Field_Name: 'M3_AVG_Qty',
                                            isVisible: 1,
                                            Fied_Data: 'number',
                                        },
                                        {
                                            Field_Name: 'M6_AVG_Qty',
                                            isVisible: 1,
                                            Fied_Data: 'number',
                                        },
                                        {
                                            Field_Name: 'M9_AVG_Qty',
                                            isVisible: 1,
                                            Fied_Data: 'number',
                                        },
                                        {
                                            Field_Name: 'One_Year_AVG_Qty',
                                            isVisible: 1,
                                            Fied_Data: 'number',
                                        },
                                    ]}
                                />
                            )
                        }}
                        tableMaxHeight={540}
                    />
                </div>
                <div className="col-xxl-2 col-lg-3 col-md-4 d-none d-md-block">
                    <h5 className="d-flex justify-content-between px-2">
                        <span>Filters</span>
                        <span>
                            <Tooltip title='Column Visiblity'>
                                <IconButton
                                    size="small"
                                    onClick={() => setDialog(true)}
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
                    <div className="border rounded-3 " style={{ maxHeight: '58vh', overflow: 'auto' }}>
                        {columns.map((column, ke) => (
                            isEqualNumber(column.isVisible, 1)
                            // && column.Field_Name !== 'M3_Avg'
                            // && column.Field_Name !== 'M6_Avg'
                            // && column.Field_Name !== 'M12_Avg'
                            // && column.Field_Name !== 'Billed_Qty'
                        ) && (
                                <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                    <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
                                    {renderFilter(column)}
                                </div>
                            ))}
                        <br />
                    </div>
                </div>
            </div>

            <Dialog
                open={filterDialog}
                onClose={closeDialog}
                maxWidth='sm' fullWidth
            >
                <DialogContent>
                    <h5 className="d-flex justify-content-between px-2">
                        <span>Filters</span>
                        <span>
                            <Tooltip title='Column Visiblity'>
                                <IconButton
                                    size="small"
                                    onClick={() => setDialog(true)}
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
                    <div className="border rounded-3 " >
                        {columns.map((column, ke) => (
                            isEqualNumber(column.isVisible, 1)
                            // && column.Field_Name !== 'M3_Avg'
                            // && column.Field_Name !== 'M6_Avg'
                            // && column.Field_Name !== 'M12_Avg'
                            // && column.Field_Name !== 'Billed_Qty'
                        ) && (
                                <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                    <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
                                    {renderFilter(column)}
                                </div>
                            ))}
                        <br />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color='error'>close</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialog}
                onClose={() => setDialog(false)}
                maxWidth='lg' fullWidth
            >
                <DialogTitle>Column Settings</DialogTitle>
                <DialogContent>
                    <div className="row">
                        {columns.map((o, i) => (
                            <div className="col-lg-4 col-md-6 p-2" key={i}>
                                <Card
                                    component={Paper}
                                    className={`p-2 d-flex justify-content-between align-items-center flex-wrap ${i % 2 !== 0 ? 'bg-light' : ''}`}
                                >
                                    <div className='d-flex justify-content-between align-items-center flex-wrap'>
                                        <Switch
                                            checked={Boolean(o?.isDefault) || Boolean(o?.isVisible)}
                                            disabled={Boolean(o?.isDefault)}
                                            onChange={e =>
                                                setColumns(prevColumns =>
                                                    prevColumns.map(oo =>
                                                        oo.Field_Name === o?.Field_Name
                                                            ? { ...oo, isVisible: e.target.checked ? 1 : 0 }
                                                            : oo
                                                    )
                                                )}
                                        />

                                        <h6 className='fa-13 mb-0 fw-bold '>{o?.Field_Name}</h6>
                                    </div>
                                    <input
                                        type='number'
                                        value={checkIsNumber(o?.OrderBy) ? o?.OrderBy : ''}
                                        onChange={e =>
                                            setColumns(prevColumns =>
                                                prevColumns.map(oo =>
                                                    oo.Field_Name === o?.Field_Name
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
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setColumns(columnsInitialValue)} variant="outlined">Reset</Button>
                    <Button onClick={() => setDialog(false)} color='error'>close</Button>
                </DialogActions>
            </Dialog>
        </Fragment>
    )

}

export default LedgerBasedSalesReport;