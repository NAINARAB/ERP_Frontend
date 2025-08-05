import { useEffect, useMemo } from "react";
import { useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { isEqualNumber, filterableText, groupData, Addition, toNumber, Division, ISOString, stringCompare, toArray } from '../../../Components/functions'
import FilterableTable, { createCol } from '../../../Components/filterableTable2';
import { Autocomplete, Checkbox, Dialog, DialogContent, DialogActions, Button, IconButton, TextField, Tooltip } from "@mui/material";
import { CheckBox, CheckBoxOutlineBlank, FilterAlt, FilterAltOff, Search } from "@mui/icons-material";
import TableWrapper from "../../../Components/tableComp/TableWrapper";
import { batchListingColumns } from "./variable";

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const BatchListing = ({ loadingOn, loadingOff }) => {
    const [dataArray, setDataArray] = useState([]);
    const [dateFilter, setDateFilter] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        FilterFromDate: ISOString(),
        FilterTodate: ISOString(),
        dateBased: 'no',
        filterDialog: false,
    });
    const [filters, setFilters] = useState({});
    const [groupBy, setGroupBy] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [filterDialog, setFilterDialog] = useState(false);

    useEffect(() => {

        fetchLink({
            address: `inventory/batchMaster/stockBalance?
            Fromdate=${dateFilter.Fromdate}&
            Todate=${dateFilter.Todate}&
            dateBased=${dateFilter.dateBased}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) setDataArray(data.data);
            else setDataArray([]);
        }).catch(e => console.error(e))

    }, [dateFilter.Fromdate, dateFilter.Todate, dateFilter.dateBased]);

    const propsColumns = batchListingColumns.map((col, colInd) => ({
        isVisible: colInd < 10 ? 1 : 0,
        Field_Name: col?.Field_Name,
        Fied_Data: col?.Fied_Data,
        ColumnHeader: col.ColumnHeader,
        OrderBy: colInd + 1
    }));

    const DisplayColumn = useMemo(() => {
        return propsColumns.filter(
            col => (isEqualNumber(col?.Defult_Display, 1) || isEqualNumber(col?.isVisible, 1))
        )
    }, [propsColumns])

    const showData = useMemo(() => {
        const filter = Object.keys(filters).length > 0, grouping = groupBy ? true : false;

        const filtered = filter ? filteredData : dataArray;
        const groupFiltered = grouping ? groupData(filtered, groupBy) : [];

        const aggKeys = DisplayColumn.filter(fil => (
            filterableText(fil.Fied_Data) === "number"
        )).map(col => col.Field_Name);

        const groupAggregations = groupFiltered.map(grp => {
            const sumKeys = ['Total_Qty', 'pendingQuantity', 'consumedQuantity', 'totalQuantity'];

            return {
                ...grp,
                ...Object.fromEntries(
                    aggKeys.map(key => [
                        key,
                        sumKeys.includes(key)
                            ? grp?.groupedData?.reduce(
                                (acc, colmn) => Addition(acc, toNumber(colmn[key]) || 0),
                                0
                            )
                            : Division(
                                grp?.groupedData?.reduce(
                                    (acc, colmn) => Addition(acc, toNumber(colmn[key]) || 0),
                                    0
                                ),
                                grp.groupedData.length
                            )
                    ])
                )
            }
        });

        return grouping ? groupAggregations : filtered
    }, [filters, dataArray, filteredData, groupBy, DisplayColumn])

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
        for (const column of propsColumns) {
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

    const closeDialog = () => {
        setFilterDialog(false);
    }


    return (
        <>

            <FilterableTable
                title="Batch Listing"
                EnableSerialNumber
                ButtonArea={
                    <>
                        <Tooltip title='Clear Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setFilters({})}
                            >
                                <FilterAltOff />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Filters">
                            <IconButton
                                onClick={() => setFilterDialog(true)}
                                size="small"
                            // className="d-md-none d-inline"
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                        <select
                            className="cus-inpt p-2 w-auto m-1"
                            value={groupBy}
                            onChange={e => setGroupBy(e.target.value)}
                        >
                            <option value="">Group By</option>
                            {DisplayColumn.filter(fil => (
                                filterableText(fil.Fied_Data) === "string"
                                && fil?.Field_Name !== 'Ledger_Name'
                            )).map((col, colInd) => (
                                <option value={col?.Field_Name} key={colInd}>{col?.Field_Name?.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                    </>
                }
                maxHeightOption
                ExcelPrintOption
                dataArray={showData}
                columns={
                    //     [
                    //     createCol('trans_date', 'date', 'Date'),
                    //     createCol('batch', 'string', 'Batch'),
                    //     createCol('productNameGet', 'string', 'Product'),
                    //     createCol('godownName', 'string', 'Godown'),
                    //     createCol('stockDays', 'number', 'Stock Days'),
                    //     createCol('pendingQuantity', 'number', 'Available Qty'),
                    //     createCol('consumedQuantity', 'number', 'Consumed Qty'),
                    //     createCol('totalQuantity', 'number', 'Max Qty'),
                    //     // createCol('createdByGet', 'string', 'Created By'),
                    //     // createCol('trans_date', 'date', 'Date'),
                    // ]
                    groupBy
                        ? DisplayColumn.filter(fil =>
                            showData.length > 0 && Object.keys(showData[0]).includes(fil.Field_Name)
                        ).map(col => ({
                            ...col,
                            ColumnHeader: col.Field_Name === groupBy ? groupBy : col.ColumnHeader
                        }))
                        : DisplayColumn
                }
                enableFilters
                isExpendable={groupBy ? true : false}
                expandableComp={({ row }) => (
                    <FilterableTable
                        EnableSerialNumber
                        headerFontSizePx={12}
                        bodyFontSizePx={12}
                        dataArray={toArray(row?.groupedData)}
                        columns={DisplayColumn.filter(
                            (clm) => !stringCompare(clm.Field_Name, groupBy) 
                        )}
                    />
                )}
            />

            <Dialog
                open={filterDialog}
                onClose={closeDialog}
                maxWidth='sm' fullWidth
            >
                <DialogContent>
                    <h5 className="d-flex justify-content-between px-2">
                        <span>Filters</span>
                        <span>
                            <Tooltip title='Clear Filters'>
                                <IconButton
                                    size="small"
                                    onClick={() => setFilters({})}
                                >
                                    <FilterAltOff />
                                </IconButton>
                            </Tooltip>

                            <Button
                                onClick={() => {
                                    closeDialog();
                                    setDateFilter(pre => ({
                                        ...pre,
                                        Fromdate: dateFilter?.FilterFromDate,
                                        Todate: dateFilter.FilterTodate,
                                        dateBased: 'yes',
                                    }));
                                }}
                                startIcon={<Search />}
                                variant="outlined"
                            >Search</Button>
                        </span>
                    </h5>

                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={dateFilter.FilterFromDate}
                                            onChange={e => setDateFilter({ ...dateFilter, FilterFromDate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={dateFilter.FilterTodate}
                                            onChange={e => setDateFilter({ ...dateFilter, FilterTodate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>
                                        <input
                                            className="form-check-input shadow-none pointer mx-2"
                                            style={{ padding: '0.7em' }}
                                            type="checkbox"
                                            id="applyDateFilterCheckBox"
                                            checked={stringCompare(dateFilter.dateBased, 'yes')}
                                            onChange={() => setDateFilter(pre => ({
                                                ...pre,
                                                dateBased: stringCompare(pre.dateBased, 'yes') ? 'no' : 'yes',
                                            }))}
                                        />
                                        <label htmlFor="applyDateFilterCheckBox" className="fw-bold">Apply Date Filters</label>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>

                    <div className="border rounded-3 " >
                        {DisplayColumn.map((column, ke) => (
                            <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
                                {renderFilter(column)}
                            </div>
                        ))}
                        <br />
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>close</Button>
                </DialogActions>
            </Dialog>

        </>
    )
}

export default BatchListing