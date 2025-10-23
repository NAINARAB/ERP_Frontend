import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { DaysBetweenCount, filterableText, ISOString, LocalDate, NumberFormat, stringCompare, Subraction, toArray, toNumber } from '../../../Components/functions';
import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, IconButton, Tooltip, TextField, Checkbox, Dialog, DialogContent, DialogTitle, DialogActions, Button, Box } from '@mui/material';
import { CheckBox, CheckBoxOutlineBlank, FilterAlt, FilterAltOff, FileDownload, SettingsOutlined, Search } from '@mui/icons-material';
import { mkConfig, generateCsv, download } from 'export-to-csv';
import { fetchLink } from '../../../Components/fetchComponent';
import * as XLSX from 'xlsx';

// Gets only the columns currently visible in the table, in the shown order
export function getVisibleColumns(table) {
    return table.getVisibleLeafColumns();
}

// Choose which rows to export: 'currentPage' (after pagination) or 'all' (before pagination)
export function getRows(table, scope) {
    const rm = scope === 'currentPage' ? table.getRowModel() : table.getPrePaginationRowModel();

    // If grouping is enabled, skip grouped/aggregated/placeholder rows to keep leaf rows only
    const rows = (rm.flatRows ?? rm.rows).filter(
        (r) => !(r.getIsGrouped?.() || r.getIsAggregated?.() || r.getIsPlaceholder?.())
    );
    return rows;
}

// Convert rows/columns to a 2D array (headers + data)
export function rowsToAoA(rows, columns) {
    const header = columns.map((col) => {
        const h = col.columnDef?.header ?? col.id ?? '';
        return typeof h === 'string' ? h : String(h);
    });

    const data = rows.map((row) =>
        columns.map((col) => {
            // Try visible cell value first (respects accessor & computed values)
            const cell = row.getVisibleCells?.().find((c) => c.column.id === col.id);
            if (cell && typeof cell.getValue === 'function') {
                return cell.getValue();
            }
            // Fallbacks
            if (typeof row.getValue === 'function') {
                return row.getValue(col.id);
            }
            const acc = col.columnDef?.accessorFn;
            return acc ? acc(row.original) : row.original?.[col.accessorKey] ?? '';
        })
    );

    return [header, ...data];
}

export function exportTableToXlsx(table, opts = {}) {
    const filename = (opts.filename ?? 'table_export') + '.xlsx';
    const scope = opts.scope ?? 'all';

    const columns = getVisibleColumns(table);
    const rows = getRows(table, scope);
    const aoa = rowsToAoA(rows, columns);

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Simple auto-width for columns
    const colWidths = aoa[0].map((_, ci) =>
        Math.max(...aoa.map((row) => String(row?.[ci] ?? '').length)) + 2
    );
    ws['!cols'] = colWidths.map((wch) => ({ wch }));

    XLSX.writeFile(wb, filename);
}

const formatString = (val, dataType) => {
    switch (dataType) {
        case 'number':
            return toNumber(val) > 0 ? NumberFormat(val) : 0;
        case 'date':
            return val ? LocalDate(val) : '';
        case 'string':
            return val;
        default:
            return ''
    }
}

const getFun = (dataType) => {
    switch (dataType) {
        case 'number':
            return {
                filterVariant: 'range',
                filterFn: 'between',
            }
        case 'date':
            return {
                filterVariant: 'text',
            };
        case 'string':
            // const distinctValues = [];
            // dataArray?.forEach(item => (item[key] && (distinctValues.findIndex(o => o?.value === item[key]?.toLocaleLowerCase()) === -1))
            //     ? distinctValues.push({ label: String(item[key]), value: String(item[key]).toLocaleLowerCase() })
            //     : null
            // )
            return {
                filterVariant: 'text',
            }

        default:
            return {}
    }
}

const reportColumn = [
    {
        Column_Name: 'Retailer',
        accessColumnName: 'Retailer_Name',
        Column_Data_Type: 'string',
        Order_By: 1,
    },
    {
        Column_Name: 'Product',
        accessColumnName: 'Item_Name',
        Column_Data_Type: 'string',
        Order_By: 2,
    },
    {
        Column_Name: 'Worth',
        accessColumnName: 'StockValueOfItem',
        Column_Data_Type: 'number',
        Order_By: 3,
    },
    {
        Column_Name: 'Update Date',
        accessColumnName: 'ST_Date',
        Column_Data_Type: 'date',
        Order_By: 4,
    },
    {
        Column_Name: 'Update Qty',
        accessColumnName: 'ST_Qty',
        Column_Data_Type: 'number',
        Order_By: 6,
    },
    {
        Column_Name: 'Entry Date',
        accessColumnName: 'Do_Date',
        Column_Data_Type: 'date',
        Order_By: 5,
    },
    {
        Column_Name: 'Entry Qty',
        accessColumnName: 'Bill_Qty',
        Column_Data_Type: 'number',
        Order_By: 7,
    },
    {
        Column_Name: 'Stock Days',
        accessColumnName: 'stockDays',
        Column_Data_Type: 'number',
        Order_By: 8,
    },
    {
        Column_Name: 'Sold Qty',
        accessColumnName: 'soldQuantity',
        Column_Data_Type: 'number',
        Order_By: 9,
    },
    {
        Column_Name: 'Closing By',
        accessColumnName: 'ClosingStockBy',
        Column_Data_Type: 'string',
        Order_By: 10,
    },
    // {
    //     Column_Name: 'Delivered By',
    //     accessColumnName: 'DeliveredBy',
    //     Column_Data_Type: 'string',
    //     Order_By: 9,
    //     isVisible: false
    // },
]

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const ClosingStockReportTwo = ({ loadingOn, loadingOff }) => {
    // const [dispColmn, setDispColmn] = useState([]);
    const [dataArray, setDataArray] = useState([]);
    const [columns, setColumns] = useState(reportColumn);
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState(dataArray);
    const filterCount = Object.keys(filters).length;
    const showData = (filterCount > 0) ? filteredData : dataArray;
    const [aggregationValues, setAggregationValues] = useState({});
    const [dialogs, setDialogs] = useState({
        filters: false,
        aggregations: false
    });
    const [apiFilters, setApiFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        search: false,
    })

    useEffect(() => {
        setDataArray([]);

        fetchLink({
            address: `
            reports/customerClosingStock/itemWithRetailer?
            Fromdate=${apiFilters.Fromdate}&
            Todate=${apiFilters.Todate}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data?.success) {
                const calcStockDays = toArray(data?.data).map(row => {
                    const Do_Date = row?.Do_Date ? ISOString(row?.Do_Date) : '';
                    const ST_Date = row?.ST_Date ? ISOString(row?.ST_Date) : ''; 

                    return {
                        ...row,
                        Do_Date, ST_Date,
                        stockDays: (Do_Date && ST_Date)
                            ? DaysBetweenCount(Do_Date, ST_Date)
                            : '',
                        soldQuantity: toNumber(Subraction(row?.Bill_Qty, row?.ST_Qty)),
                    }
                });
                setDataArray(calcStockDays)
            } else {
                setDataArray([]);
            }
        }).catch(e => console.log(e));

    }, [apiFilters.search])

    const dispColmn = useMemo(() => {
        const displayColumns = [...columns]
        // .sort((a, b) => (a.Order_By && b.Order_By) ? a.Order_By - b.Order_By : b.Order_By - a.Order_By)

        return displayColumns.map(column => ({
            header: column?.Column_Name?.replace(/_/g, ' '),
            accessorKey: column?.accessColumnName,
            sortable: true,
            size: stringCompare(column?.accessColumnName, 'Retailer_Name') || stringCompare(column?.accessColumnName, 'Item_Name') ? 190 : 110,
            // ...aggregations(column?.Column_Data_Type, column?.Column_Name),
            aggregationFn: aggregationValues[column?.Column_Name] ? aggregationValues[column?.Column_Name] : '',
            AggregatedCell: ({ cell }) => (
                <div className='blue-text float-end w-100'>
                    {cell.getValue() ? NumberFormat(cell.getValue()) : ''}
                </div>
            ),
            Cell: ({ cell }) => (
                <p className={`m-0 fa-11 w-100`}>
                    {formatString(cell.getValue(), column?.Column_Data_Type)}
                </p>
            ),
            ...getFun(column?.Column_Data_Type),
        }))

        // setDispColmn(muiColumns)
    }, [columns, aggregationValues])

    useEffect(() => {
        applyFilters();
    }, [filters]);

    const table = useMaterialReactTable({
        columns: dispColmn,
        data: showData || [],
        enableColumnResizing: true,
        enableGrouping: true,
        enableStickyHeader: true,
        enableStickyFooter: true,
        enableColumnOrdering: true,
        enableKeyboardShortcuts: false,
        enableColumnActions: false,
        enableColumnFilters: false,
        enableRowNumbers: false,
        enableGlobalFilter: false,
        initialState: {
            density: 'compact',
            pagination: { pageIndex: 0, pageSize: 100 },
        },
        muiToolbarAlertBannerChipProps: { color: 'primary' },
        muiTableContainerProps: { sx: { maxHeight: '68dvh', minHeight: '46vh' } },
        muiTableProps: {
            sx: {
                caption: {
                    captionSide: 'top',
                },
            },
        },
        muiTableHeadCellProps: {
            sx: {
                fontWeight: 'normal',
            },
            className: ' border'
        },
        muiTableBodyCellProps: {
            className: ' border-end'
        },
        renderTopToolbarCustomActions: ({ table }) => (
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    width: '100%',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: '8px',
                        padding: '8px',
                        flexWrap: 'wrap',
                    }}
                >
                    <div className='d-flex flex-column'>
                        <label>Fromdate</label>
                        <input
                            type='date'
                            value={apiFilters.Fromdate}
                            onChange={e => setApiFilters(pre => ({ ...pre, Fromdate: e.target.value }))}
                            className='cus-inpt w-auto p-2'
                        />
                    </div>
                    <div className='d-flex flex-column'>
                        <label>Todate</label>
                        <input
                            type='date'
                            value={apiFilters.Todate}
                            onChange={e => setApiFilters(pre => ({ ...pre, Todate: e.target.value }))}
                            className='cus-inpt w-auto p-2'
                        />
                    </div>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'start',
                        padding: '8px',
                        flexWrap: 'wrap',
                    }}
                >
                    <Tooltip title='Search'>
                        <IconButton
                            onClick={() => setApiFilters(pre => ({ ...pre, search: !pre.search }))}
                            size='small'
                        >
                            <Search color='primary' />
                        </IconButton>
                    </Tooltip>
                    {/* <Tooltip title='Excel Download'>
                        <span>
                            <IconButton
                                disabled={table.getPrePaginationRowModel().rows.length === 0}
                                onClick={() =>
                                    handleExportRows(table.getPrePaginationRowModel().rows)
                                }
                                size='small'
                            >
                                <FileDownload color='primary' />
                            </IconButton>
                        </span>
                    </Tooltip> */}
                    <Tooltip title="Excel Download (Current page only)">
                        <span>
                            <IconButton
                                size="small"
                                disabled={table.getRowModel().rows.length === 0}
                                onClick={() => exportTableToXlsx(table, { scope: 'currentPage', filename: 'my_data_page' })}
                            >
                                <FileDownload color="primary" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title='Aggregation'>
                        <IconButton
                            onClick={() => setDialogs(pre => ({ ...pre, aggregations: true }))}
                            size='small'
                        >
                            <SettingsOutlined color='primary' />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title='Filters'>
                        <IconButton
                            onClick={() => setDialogs(pre => ({ ...pre, filters: true }))}
                            size='small'
                        >
                            <FilterAlt color='primary' />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>
        ),
    })

    const memoizedTableConfig = useMemo(() => table, [table, aggregationValues, showData]);

    const handleFilterChange = (column, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const applyFilters = () => {
        let filtered = [...dataArray];
        for (const column of columns) {
            if (filters[column.accessColumnName]) {
                if (filters[column.accessColumnName].type === 'range') {
                    const { min, max } = filters[column.accessColumnName];
                    filtered = filtered.filter(item => {
                        const value = item[column.accessColumnName];
                        return (min === undefined || value >= min) && (max === undefined || value <= max);
                    });
                } else if (filters[column.accessColumnName].type === 'date') {
                    const { start, end } = filters[column.accessColumnName].value;
                    filtered = filtered.filter(item => {
                        const dateValue = new Date(item[column.accessColumnName]);
                        return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
                    });
                } else if (Array.isArray(filters[column.accessColumnName])) {
                    filtered = filters[column.accessColumnName]?.length > 0
                        ? filtered.filter(item =>
                            filters[column.accessColumnName].includes(
                                filterableText(item[column.accessColumnName])
                            )
                        ) : filtered
                }
            }
        }
        setFilteredData(filtered);
    };

    const renderFilter = (column) => {
        const { accessColumnName, Column_Name, Column_Data_Type } = column;
        if (Column_Data_Type === 'number') {
            return (
                <div className='d-flex justify-content-between px-2'>
                    <input
                        placeholder="Min"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[accessColumnName]?.min ?? ''}
                        onChange={(e) => handleFilterChange(accessColumnName, { type: 'range', ...filters[accessColumnName], min: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                    <input
                        placeholder="Max"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[accessColumnName]?.max ?? ''}
                        onChange={(e) => handleFilterChange(accessColumnName, { type: 'range', ...filters[accessColumnName], max: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                </div>
            );
        } else if (Column_Data_Type === 'date') {
            return (
                <div className='d-flex justify-content-between px-2'>
                    <input
                        placeholder="Start Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[accessColumnName]?.value?.start ?? ''}
                        onChange={(e) => handleFilterChange(accessColumnName, { type: 'date', value: { ...filters[accessColumnName]?.value, start: e.target.value || undefined } })}
                    />
                    <input
                        placeholder="End Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[accessColumnName]?.value?.end ?? ''}
                        onChange={(e) => handleFilterChange(accessColumnName, { type: 'date', value: { ...filters[accessColumnName]?.value, end: e.target.value || undefined } })}
                    />
                </div>
            );
        } else if (Column_Data_Type === 'string') {
            const distinctValues = [...new Set(dataArray.map(item => item[accessColumnName]?.toLowerCase()?.trim()))].sort();
            return (
                <Autocomplete
                    multiple
                    id={`${accessColumnName}-filter`}
                    options={distinctValues}
                    disableCloseOnSelect
                    getOptionLabel={option => option}
                    value={filters[accessColumnName] || []}
                    onChange={(event, newValue) => handleFilterChange(accessColumnName, newValue)}
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
                            label={Column_Name?.replace(/_/g, ' ')}
                            placeholder={`Select ${Column_Name?.replace(/_/g, ' ')}`}
                        />
                    )}
                />
            );
        }
    };

    return (
        <>
            <MaterialReactTable table={memoizedTableConfig} />

            <Dialog
                open={dialogs.filters}
                onClose={() => setDialogs(pre => ({ ...pre, filters: false }))}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>
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
                </DialogTitle>
                <DialogContent>

                    <div className="border rounded-3 " style={{ maxHeight: '70vh', overflow: 'auto' }}>
                        {columns.map((column, ke) => (
                            <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                <label className='mt-2 mb-1'>{column?.Column_Name?.replace(/_/g, ' ')}</label>
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
                open={dialogs.aggregations}
                onClose={() => setDialogs(pre => ({ ...pre, aggregations: false }))}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>Aggregations</DialogTitle>
                <DialogContent>
                    <div className="row" >
                        {[...columns].filter(column => (
                            column.Column_Data_Type === 'number'
                            // || column.Column_Data_Type === 'string'
                        )).map((o, i) => (
                            <div className="col-md-6 p-2" key={i}>
                                <label>{o?.Column_Name?.replace(/_/g, ' ')}</label>
                                <select
                                    className='cus-inpt'
                                    value={aggregationValues[o?.Column_Name] ?? ''}
                                    onChange={e => setAggregationValues(pre => ({ ...pre, [o.Column_Name]: e.target.value }))}
                                >
                                    {
                                        [
                                            { label: 'Select Aggregation', value: '' },
                                            // { label: 'count', value: 'count' },
                                            // { label: 'extent', value: 'extent' },
                                            // { label: 'max', value: 'max' },
                                            // { label: 'min', value: 'min' },
                                            { label: 'mean', value: 'mean' },
                                            // { label: 'median', value: 'median' },
                                            // { label: 'uniqueCount', value: 'uniqueCount' },
                                            { label: 'sum', value: 'sum' },
                                            // { label: 'unique', value: 'unique' },
                                        ].map((o, i) => (
                                            <option value={o.value} key={i}>{o.label}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDialogs(pre => ({ ...pre, aggregations: false }))}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}


export default ClosingStockReportTwo;