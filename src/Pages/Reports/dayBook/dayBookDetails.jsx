import { useEffect, useMemo, useState } from "react";
import { getSessionUser, isEqualNumber, ISOString, isValidDate, isValidObject } from '../../../Components/functions';
import FilterableTable from '../../../Components/filterableTable2';
import { fetchLink } from "../../../Components/fetchComponent";
import { Autocomplete, Button, Card, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Tooltip } from "@mui/material";
import { CheckBox, CheckBoxOutlineBlank, FilterAlt, FilterAltOff, Search, ToggleOff, ToggleOn } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { dayBookColumn } from "./dayBookColumns";


const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const DayBookDetails = ({ loadingOn, loadingOff }) => {
    const location = useLocation();
    const stateDetails = location.state;
    const user = getSessionUser().user;
    const [dayBookDetails, setDayBookDetails] = useState([]);
    const [dynamicFilters, setDynamicFilters] = useState({});
    const [filteredData, setFilteredData] = useState([])

    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        ModuleName: 'PurchaseOrder',
        Voucher_Type: null,
        filterDialog: false,
        dynamicFilters: false,
        refresh: false,
        disablePagination: false,
        searchText: ''
    });

    useEffect(() => {
        if (filters?.ModuleName) {
            if (loadingOn) loadingOn();
            setDayBookDetails([]);
            fetchLink({
                address: `dashboard/dayBook/${String(filters?.ModuleName).toLowerCase()}?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`,
                headers: { Db: user?.Company_id }
            }).then(data => {
                if (data.success) {
                    setDayBookDetails(data.data);
                }
            }).catch(e => console.error(e)).finally(() => {
                if (loadingOff) loadingOff();
            })
        }
    }, [filters?.refresh])

    useEffect(() => {
        if (isValidObject(stateDetails)) {
            const Fromdate = isValidDate(stateDetails?.Fromdate) ? ISOString(stateDetails.Fromdate) : ISOString();
            const Todate = isValidDate(stateDetails?.Todate) ? ISOString(stateDetails.Todate) : ISOString();
            const ModuleName = stateDetails?.ModuleName ? stateDetails?.ModuleName : null;
            const Voucher_Type = stateDetails?.Voucher_Type ? stateDetails?.Voucher_Type : null;
            setFilters(pre => ({
                ...pre,
                Fromdate, Todate, ModuleName, Voucher_Type, refresh: !pre.refresh
            }))
        }
    }, [stateDetails])

    const FilteredVoucherData = useMemo(() => {
        return filters?.Voucher_Type ?
            dayBookDetails.filter(fil => String(fil.VoucherName).localeCompare(filters.Voucher_Type) === 0)
            : dayBookDetails
    }, [filters?.Voucher_Type, dayBookDetails.length]);

    const uniqueVoucherType = useMemo(() => {
        return [...new Set(dayBookDetails?.map(item => item?.VoucherName))].map(items => ({
            value: items,
            label: items,
        }));
    }, [dayBookDetails]);

    // const searchFilterList = useMemo(() => {
    //     return FilteredVoucherData.filter(fil =>
    //         filterableText(Object.values(fil).join(' ')).includes(filterableText(filters?.searchText))
    //     )
    // }, [FilteredVoucherData, filters?.searchText]);

    // dynamic filter

    useEffect(() => {
        applyFilters();
    }, [dynamicFilters]);

    const handleFilterChange = (column, value) => {
        setDynamicFilters(prevFilters => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const applyFilters = () => {
        let filtered = [...dayBookDetails];
        const columns = filters?.ModuleName ? dayBookColumn(filters.ModuleName) : []
        for (const column of columns) {
            if (dynamicFilters[column.Field_Name]) {
                if (dynamicFilters[column.Field_Name].type === 'range') {
                    const { min, max } = dynamicFilters[column.Field_Name];
                    filtered = filtered.filter(item => {
                        const value = item[column.Field_Name];
                        return (min === undefined || value >= min) && (max === undefined || value <= max);
                    });
                } else if (dynamicFilters[column.Field_Name].type === 'date') {
                    const { start, end } = dynamicFilters[column.Field_Name].value;
                    filtered = filtered.filter(item => {
                        const dateValue = new Date(item[column.Field_Name]);
                        return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
                    });
                } else if (Array.isArray(dynamicFilters[column.Field_Name])) {
                    filtered = dynamicFilters[column.Field_Name]?.length > 0 ? filtered.filter(item => dynamicFilters[column.Field_Name].includes(item[column.Field_Name].toLowerCase().trim())) : filtered
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
                        value={dynamicFilters[Field_Name]?.min ?? ''}
                        onChange={(e) => handleFilterChange(Field_Name, { type: 'range', ...dynamicFilters[Field_Name], min: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                    <input
                        placeholder="Max"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={dynamicFilters[Field_Name]?.max ?? ''}
                        onChange={(e) => handleFilterChange(Field_Name, { type: 'range', ...dynamicFilters[Field_Name], max: e.target.value ? parseFloat(e.target.value) : undefined })}
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
                        value={dynamicFilters[Field_Name]?.value?.start ?? ''}
                        onChange={(e) => handleFilterChange(Field_Name, { type: 'date', value: { ...dynamicFilters[Field_Name]?.value, start: e.target.value || undefined } })}
                    />
                    <input
                        placeholder="End Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={dynamicFilters[Field_Name]?.value?.end ?? ''}
                        onChange={(e) => handleFilterChange(Field_Name, { type: 'date', value: { ...dynamicFilters[Field_Name]?.value, end: e.target.value || undefined } })}
                    />
                </div>
            );
        } else if (Fied_Data === 'string') {
            const distinctValues = [...new Set(FilteredVoucherData.map(item => item[Field_Name]?.toLowerCase()?.trim()))];
            return (
                <Autocomplete
                    multiple
                    id={`${Field_Name}-filter`}
                    options={distinctValues}
                    disableCloseOnSelect
                    getOptionLabel={option => option}
                    value={dynamicFilters[Field_Name] || []}
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
            <div className="row flex-md-row-reverse">

                <div className="col-xxl-2 col-lg-3 col-md-4 d-none d-md-block">
                    <Card>
                        <div className="d-flex align-items-center py-1 px-2">
                            <h5 className="flex-grow-1 ">Filters</h5>
                            <Tooltip title='Clear Filters'>
                                <IconButton
                                    size="small"
                                    onClick={() => setDynamicFilters({})}
                                >
                                    <FilterAltOff />
                                </IconButton>
                            </Tooltip>
                        </div>
                        <div styl={{ maxHeight: '70vh', overflow: 'auto' }}>
                            {dayBookColumn(filters.ModuleName).map((column, ke) => (
                                isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1)
                            ) && (
                                    <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                        <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
                                        {renderFilter(column)}
                                    </div>
                                )
                            )}
                            <br />
                        </div>
                    </Card>
                </div>

                <div className="col-xxl-10 col-lg-9 col-md-8">
                    <FilterableTable
                        title={filters?.ModuleName + ' - ' + (filters?.Voucher_Type ? filters?.Voucher_Type : 'All Vouchers')}
                        dataArray={Object.keys(dynamicFilters).length > 0 ? filteredData : FilteredVoucherData}
                        columns={filters?.ModuleName ? dayBookColumn(filters.ModuleName) : []}
                        PDFPrintOption
                        ExcelPrintOption
                        EnableSerialNumber
                        maxHeightOption
                        disablePagination={filters.disablePagination}
                        MenuButtons={[
                            {
                                name: 'Pagination',
                                icon: filters.disablePagination
                                    ? <ToggleOff fontSize="small" />
                                    : <ToggleOn fontSize="small" color='primary' />,
                                onclick: () => setFilters(pre => ({ ...pre, disablePagination: !pre.disablePagination })),
                                // disabled: isEqualNumber(FilteredVoucherData?.length, 0)
                            },
                            {
                                name: 'Filters',
                                icon: <FilterAlt fontSize="small" color='primary' />,
                                onclick: () => setFilters(pre => ({ ...pre, filterDialog: true })),
                            }
                        ]}
                        ButtonArea={
                            <>
                                {/* <input
                                    type="search"
                                    className="cus-inpt w-auto p-1 fa-14"
                                    placeholder="Search.."
                                    value={filters?.searchText ?? ''}
                                    onChange={e => setFilters(pre => ({ ...pre, searchText: e.target.value }))}
                                /> */}
                                <Tooltip title="Dynamic Filters">
                                    <IconButton
                                        onClick={() => setFilters(pre => ({ ...pre, dynamicFilters: true }))}
                                        size="small"
                                        className="d-md-none d-inline"
                                    >
                                        <FilterAlt />
                                    </IconButton>
                                </Tooltip>
                            </>
                        }
                    />
                </div>
            </div>

            <Dialog
                open={filters.filterDialog}
                onClose={() => setFilters(pre => ({ ...pre, filterDialog: false }))}
                maxWidth='sm' fullWidth
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive">
                        <table className="table fa-14 table-borderless">
                            <tbody>
                                <tr>
                                    <td>From Date</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                                            className="cus-inpt p-1"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>To Date</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={e => setFilters({ ...filters, Todate: e.target.value })}
                                            className="cus-inpt p-1"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Module</td>
                                    <td>
                                        <select
                                            className="cus-inpt p-1"
                                            value={filters.ModuleName ? filters.ModuleName : ''}
                                            onChange={e => {
                                                setFilters(pre => ({
                                                    ...pre,
                                                    ModuleName: e.target.value,
                                                    refresh: !pre.refresh,
                                                    Voucher_Type: null,
                                                    filterDialog: false
                                                }));
                                                setDynamicFilters({});
                                            }}
                                        >
                                            {[
                                                'PurchaseOrder', 'PurchaseInvoice', 'SaleOrder', 'SalesInvoice',
                                                'StockJournal', 'Journal', 'Payment', 'Receipt', 'Contra'
                                            ].map((item, key) => (
                                                <option value={item} key={key}>{item}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Voucher</td>
                                    <td>
                                        <select
                                            className="cus-inpt p-1"
                                            value={filters?.Voucher_Type ? filters.Voucher_Type : ''}
                                            onChange={e => setFilters(pre => ({ ...pre, Voucher_Type: e.target.value, filterDialog: false }))}
                                        >
                                            <option value={''}>All Vouchers</option>
                                            {uniqueVoucherType.map((item, key) => (
                                                <option value={item.value} key={key}>{item.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        size="small"
                        onClick={() => setFilters(pre => ({ ...pre, filterDialog: false }))}
                    >Close</Button>
                    <Button
                        onClick={() => {
                            setFilters(pre => ({ ...pre, refresh: !pre.refresh, filterDialog: false }));
                        }}
                        variant="outlined" size="small"
                        startIcon={<Search />}
                    >Search</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={filters?.dynamicFilters}
                onClose={() => setFilters(pre => ({ ...pre, dynamicFilters: false }))}
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
                        {(filters?.ModuleName ? dayBookColumn(filters.ModuleName) : []).map((column, ke) => (isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1)) && (
                            <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
                                {renderFilter(column)}
                            </div>
                        ))}
                        <br />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilters(pre => ({ ...pre, dynamicFilters: false }))} color='error'>close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default DayBookDetails;