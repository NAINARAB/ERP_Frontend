import React, { useState, useEffect } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { getPreviousDate, groupData, calcTotal, ISOString, isEqualNumber } from "../../Components/functions";
import FilterableTable from '../../Components/filterableTable2'
import { Card, CardContent, Autocomplete, TextField, Checkbox, Tooltip, IconButton, Button, Dialog, DialogContent, DialogActions, Tab, Box } from "@mui/material";
import { TabPanel, TabList, TabContext } from '@mui/lab';
import { CheckBox, CheckBoxOutlineBlank, FilterAlt, FilterAltOff } from "@mui/icons-material";

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;


const LiveStockReport = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [apiFilters, setAPIFilters] = useState({
        Fromdata: getPreviousDate(7),
        Todate: ISOString(),
        view: 'Grouped'
    });
    const [filters, setFilters] = useState({});
    const [dialog, setDialog] = useState(false);
    const [filteredData, setFilteredData] = useState(reportData);

    const columns = [
        { Field_Name: "Stock_Group", Fied_Data: "string", isVisible: 1 },
        { Field_Name: "Grade_Item_Group", Fied_Data: "string", isVisible: 1 },
        { Field_Name: "Group_Name", Fied_Data: "string", isVisible: 1 },
        { Field_Name: "stock_item_name", Fied_Data: "string", isVisible: 1 },
        { Field_Name: "godown_name", Fied_Data: "string", isVisible: 1 },
        ...(apiFilters.view === 'List' ? [
            { Field_Name: "Act_Bags", Fied_Data: "number", ColumnHeader: 'Bags', isVisible: 1 },
            { Field_Name: "Bal_Act_Qty", Fied_Data: "number", ColumnHeader: 'Balance Quantity', isVisible: 1 }
        ] : [])
    ];

    useEffect(() => {
        applyFilters();
    }, [filters]);

    useEffect(() => setFilters({}), [apiFilters.view])

    const handleFilterChange = (column, value) => {
        setFilters(prevFilters => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const applyFilters = () => {
        let filtered = [...reportData];
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
            const distinctValues = [...new Set(reportData.map(item => item[Field_Name]?.toLowerCase()?.trim()))];
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

    useEffect(() => {
        if (loadingOn) {
            loadingOn();
        }
        fetchLink({
            address: `reports/liveStockReport?Fromdata=${apiFilters.Fromdata}&Todate=${apiFilters.Todate}`
        }).then(data => {
            if (data.success) {
                setReportData(data.data);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) {
                loadingOff();
            }
        })
    }, [apiFilters.Fromdata, apiFilters.Todate])

    useEffect(() => {
        const runLoading = async () => {
            try {
                const dataToUse = (Object.keys(filters).length > 0) ? filteredData : reportData;

                if (loadingOn) {
                    await loadingOn();
                }

                const grouped_Stock_Group = groupData(dataToUse, 'Stock_Group');
                const aggregatedStockGroup = grouped_Stock_Group?.sort((a, b) => String(a.Stock_Group).localeCompare(b.Stock_Group ?? '')).map(stockGroup => ({
                    ...stockGroup,
                    BagsTotal: calcTotal(stockGroup.groupedData, 'Act_Bags'),
                    BalQtyTotal: calcTotal(stockGroup.groupedData, 'Bal_Act_Qty'),
                }));

                const Grade_Item_Group = aggregatedStockGroup?.map(stockGroup => ({
                    ...stockGroup,
                    groupedData: groupData(stockGroup?.groupedData, 'Grade_Item_Group')
                }));
                const aggregatedGradeItemGroup = Grade_Item_Group.map(stockGroup => ({
                    ...stockGroup,
                    groupedData: stockGroup.groupedData?.map(gradeItemGroup => ({
                        ...gradeItemGroup,
                        BagsTotal: calcTotal(gradeItemGroup.groupedData, 'Act_Bags'),
                        BalQtyTotal: calcTotal(gradeItemGroup.groupedData, 'Bal_Act_Qty'),
                    }))
                }));

                const GroupName = aggregatedGradeItemGroup.map(stockGroup => ({
                    ...stockGroup,
                    groupedData: stockGroup.groupedData?.map(gradeItemGroup => ({
                        ...gradeItemGroup,
                        groupedData: groupData(gradeItemGroup?.groupedData, 'Group_Name')
                    }))
                }));
                const aggregatedGroupName = GroupName.map(stockGroup => ({
                    ...stockGroup,
                    groupedData: stockGroup.groupedData?.map(gradeItemGroup => ({
                        ...gradeItemGroup,
                        groupedData: gradeItemGroup?.groupedData?.map(grouopName => ({
                            ...grouopName,
                            BagsTotal: calcTotal(grouopName.groupedData, 'Act_Bags'),
                            BalQtyTotal: calcTotal(grouopName.groupedData, 'Bal_Act_Qty'),
                        }))
                    }))
                }));

                // setGroupedData(aggregatedGroupName);
                setTimeout(() => setGroupedData(aggregatedGroupName), 500);
            } catch (e) {
                console.error(e)
            } finally {
                if (loadingOff) {
                    setTimeout(() => loadingOff(), 500);
                }
            }
        }

        runLoading();
    }, [reportData, filters, filteredData])

    const columnCells = (mainKey) => [
        {
            Field_Name: mainKey,
            isVisible: 1,
            Fied_Data: 'string',
        },
        {
            Field_Name: 'BagsTotal',
            ColumnHeader: 'Bags',
            isVisible: 1,
            Fied_Data: 'number',
        },
        {
            Field_Name: 'BalQtyTotal',
            ColumnHeader: 'Balance Quantity',
            isVisible: 1,
            Fied_Data: 'number',
        },
    ]

    return (
        <>
            <Card>

                <div className="p-1 d-flex justify-content-between align-items-center flex-wrap border-bottom">
                    <h5 className="ps-2 pt-2">Live Stock Report</h5>
                    <span>
                        <input
                            type="date"
                            value={apiFilters.Fromdata}
                            className="cus-inpt w-auto p-1"
                            onChange={e => setAPIFilters(pre => ({ ...pre, Fromdata: e.target.value }))}
                        /> - TO -
                        <input
                            type="date"
                            value={apiFilters.Todate}
                            className="cus-inpt w-auto p-1"
                            onChange={e => setAPIFilters(pre => ({ ...pre, Todate: e.target.value }))}
                        />
                        <Tooltip title="Filters">
                            <IconButton
                                onClick={() => setDialog(true)}
                                size="small"
                                className="d-md-none d-inline"
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                    </span>
                </div>

                <CardContent>
                    <div className="row">

                        <div className="col-xxl-10 col-lg-9 col-md-8">

                            <TabContext value={apiFilters.view}>
                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                    <TabList
                                        indicatorColor='transparant'
                                        onChange={(e, n) => setAPIFilters(pre => ({ ...pre, view: n }))}
                                        variant="scrollable"
                                        scrollButtons="auto"
                                        allowScrollButtonsMobile
                                    >
                                        <Tab sx={apiFilters.view === 'Grouped' ? { backgroundColor: '#c6d7eb' } : {}} label="Grouped" value='Grouped' />
                                        <Tab sx={apiFilters.view === 'List' ? { backgroundColor: '#c6d7eb' } : {}} label="List" value='List' />
                                    </TabList>
                                </Box>

                                <TabPanel value={'Grouped'} sx={{ px: 0, py: 2 }} >
                                    <FilterableTable
                                        dataArray={groupedData}
                                        title="Stock Group"
                                        columns={columnCells('Stock_Group')}
                                        isExpendable={true}
                                        EnableSerialNumber
                                        expandableComp={({ row }) => (
                                            <FilterableTable
                                                dataArray={row.groupedData}
                                                title="Grade Item Group"
                                                columns={columnCells('Grade_Item_Group')}
                                                isExpendable={true}
                                                EnableSerialNumber
                                                expandableComp={({ row }) => (
                                                    <FilterableTable
                                                        dataArray={row.groupedData}
                                                        title="Group Name"
                                                        columns={columnCells('Group_Name')}
                                                        isExpendable={true}
                                                        EnableSerialNumber
                                                        expandableComp={({ row }) => (
                                                            <FilterableTable
                                                                dataArray={row.groupedData}
                                                                title="Stock Item Name"
                                                                columns={[
                                                                    {
                                                                        Field_Name: 'stock_item_name',
                                                                        ColumnHeader: 'Stock Item Name',
                                                                        Fied_Data: 'string',
                                                                        isVisible: 1,
                                                                    },
                                                                    {
                                                                        Field_Name: 'Bags',
                                                                        Fied_Data: 'number',
                                                                        isVisible: 1,
                                                                    },
                                                                    {
                                                                        Field_Name: 'Bal_Act_Qty',
                                                                        ColumnHeader: 'Balance Quantity',
                                                                        Fied_Data: 'number',
                                                                        isVisible: 1,
                                                                    },
                                                                    {
                                                                        Field_Name: 'godown_name',
                                                                        ColumnHeader: 'Godown',
                                                                        Fied_Data: 'string',
                                                                        isVisible: 1,
                                                                    },
                                                                ]}
                                                                EnableSerialNumber
                                                                tableMaxHeight={2000}
                                                                disablePagination={true}
                                                            />
                                                        )}
                                                        tableMaxHeight={3000}
                                                        disablePagination={true}

                                                    />
                                                )}
                                                tableMaxHeight={4000}
                                                disablePagination={true}
                                            />
                                        )}
                                        tableMaxHeight={5000}
                                        disablePagination={true}
                                    />
                                </TabPanel>

                                <TabPanel value={'List'} sx={{ px: 0, py: 2 }} >
                                    <FilterableTable
                                        dataArray={(Object.keys(filters).length > 0) ? filteredData : reportData}
                                        columns={columns}
                                    />
                                </TabPanel>
                            </TabContext>

                        </div>

                        <div className="col-xxl-2 col-lg-3 col-md-4 d-none d-md-block">
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
                                </span>
                            </h5>
                            <div className="border rounded-3 ">
                                {columns.map((column, ke) => (
                                    <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                        <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
                                        {renderFilter(column)}
                                    </div>
                                ))}
                                <br />
                            </div>
                        </div>

                    </div>

                </CardContent>

            </Card>

            <Dialog
                open={dialog}
                onClose={() => setDialog(false)}
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
                        </span>
                    </h5>
                    <div className="border rounded-3 " >
                        {columns.map((column, ke) => (
                            <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
                                {renderFilter(column)}
                            </div>
                        ))}
                        <br />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(false)} color='error'>close</Button>
                </DialogActions>
            </Dialog>

        </>
    )
}

export default LiveStockReport;