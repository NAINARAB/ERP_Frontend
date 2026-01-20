import { useEffect, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import {
    Addition,
    checkIsNumber,
    filterableText,
    groupData,
    isEqualNumber,
    stringCompare,
    toArray,
    toNumber,
} from "../../../Components/functions";
import FilterableTable from "../../../Components/filterableTable2";
import {
    Autocomplete,
    Button,
    Card,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Switch,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,

    Tooltip,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";
import {
    CheckBox,
    CheckBoxOutlineBlank,
    FilterAlt,
    FilterAltOff,
    Settings,
} from "@mui/icons-material";
import { useMemo } from "react";
import { toast } from "react-toastify";
import { Close } from "@mui/icons-material";

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const ItemWiseStockReport = ({
    loadingOn,
    loadingOff,
    Fromdate,
    Todate,
    api = "itemWise",
    defaultGrouping = "",
    storageStockColumns = [],
    groupingOption = true,
    reportName = "",
    url = "",
}) => {
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({});
    const [groupBy, setGroupBy] = useState(defaultGrouping);
    const [filteredData, setFilteredData] = useState([]);
    const [dialog, setDialog] = useState(false);
    const [filterDialog, setFilterDialog] = useState(false);
    const [columnSettings, setColumnSettings] = useState([]);
    const [reportVisiblity, setReportVisiblity] = useState([]);
    const [expenseReportDialog, setExpenseReportDialog] = useState(false);
    const [expenseReportData, setExpenseReportData] = useState([]);
    const [selectedProductInfo, setSelectedProductInfo] = useState({});


    const propsColumns = storageStockColumns.map((col, colInd) => {
        const columnState =
            reportVisiblity.find((repState) =>
                stringCompare(repState.columnName, col?.Column_Name)
            ) || {};

        return {
            isVisible: 1,
            Field_Name: col?.Column_Name,
            Fied_Data: col?.Data_Type,
            OrderBy: columnState?.orderNum || colInd + 1,
            isEnabled: true,
        };
    });

    const [columns, setColumns] = useState(propsColumns);
    const parseData = JSON.parse(localStorage.getItem("user"));
    const companyId = parseData?.Company_id;

    useEffect(() => {
        const parseData = JSON.parse(localStorage.getItem("user"));
        const companyId = parseData?.Company_id;

        fetchLink({
            address: `reports/reportState/columnVisiblity?reportName=${reportName}&reportUrl=${url}`,
        })
            .then((data) => {
                if (data.success) {
                    setReportVisiblity(toArray(data.data));
                } else setReportVisiblity([]);
            })
            .catch((e) => console.error(e));

        fetchLink({
            address: `masters/displayLosColumn?company_id=${companyId}`,
        })
            .then((data) => {
                if (data.success) {
                    const settings = toArray(data.data);

                    setColumnSettings(settings);
                }
            })
            .catch((e) => console.error(e));
    }, [reportName, url]);

    useEffect(() => {
        loadingOn();

        Promise.all([
            fetchLink({
                address: `reports/storageStock/${api}?Fromdate=${Fromdate}&Todate=${Todate}`,
            }),
            fetchLink({
                address: `reports/reportState/columnVisiblity?reportName=${reportName}&reportUrl=${url}`,
            }),
            fetchLink({
                address: `masters/displayLosColumn?company_id=${companyId}`,
            }),
        ])
            .then(([reportData, visibilityData, columnData]) => {
                if (reportData.success) {
                    setReportData(toArray(reportData.data));
                }

                const visibilitySettings = visibilityData.success
                    ? toArray(visibilityData.data)
                    : [];
                setReportVisiblity(visibilitySettings);

                const columnSettings = columnData.success
                    ? toArray(columnData.data)
                    : [];
                setColumnSettings(columnSettings);


                const initialColumns = storageStockColumns.map((col, colInd) => {

                    const visibilitySetting = visibilitySettings.find((v) =>
                        stringCompare(v.columnName, col?.Column_Name)
                    );


                    const columnSetting = columnSettings.find((cs) =>
                        stringCompare(cs.Column_Name, col?.Column_Name)
                    );

                    return {
                        Field_Name: col?.Column_Name,
                        Fied_Data: col?.Data_Type,
                        OrderBy: visibilitySetting?.orderNum || colInd + 1,
                        isEnabled: true,
                        isVisible: visibilitySetting ? 1 : 0,
                        Alias_Name: columnSetting?.Alias_Name || col?.Alias_Name,
                    };
                });

                setColumns(initialColumns);
            })
            .catch((error) => console.error("Fetch error:", error))
            .finally(() => loadingOff());
    }, [
        Fromdate,
        Todate,
        companyId,
        api,
        reportName,
        url,
        loadingOn,
        loadingOff,
    ]);

    const sortedColumns = useMemo(() => {
        return [...columns].sort((a, b) => a?.OrderBy - b?.OrderBy);
    }, [columns]);

    const DisplayColumn = useMemo(() => {
        return sortedColumns.filter(
            (col) => isEqualNumber(col.isVisible, 1) && col.isEnabled
        );
    }, [sortedColumns]);

    const showData = useMemo(() => {
        const filter = Object.keys(filters).length > 0;
        const grouping = groupBy ? true : false;

        const filtered = filter ? filteredData : reportData;
        const groupFiltered = grouping ? groupData(filtered, groupBy) : [];

        const aggKeys = DisplayColumn.filter(
            (fil) => filterableText(fil.Fied_Data) === "number"
        ).map((col) => col.Field_Name);

        const groupAggregations = groupFiltered.map((grp) => {
            return {
                ...grp,
                ...Object.fromEntries(
                    aggKeys.map((key) => [
                        key,
                        grp?.groupedData?.reduce(
                            (acc, colmn) => Addition(acc, toNumber(colmn[key]) || 0),
                            0
                        ),
                    ])
                ),
            };
        });

        return grouping ? groupAggregations : filtered;
    }, [filters, reportData, filteredData, groupBy, DisplayColumn]);

    const getDisplayName = (columnName) => {
        if (!columnName) return "";

        const columnSetting = columnSettings.find(
            (cs) =>
                cs.Column_Name?.toLowerCase() === columnName?.toLowerCase() ||
                cs.ColumnName?.toLowerCase() === columnName?.toLowerCase()
        );

        if (columnSetting?.Alias_Name) {
            return columnSetting.Alias_Name;
        }

        const storageColumn = storageStockColumns.find(
            (col) => col.Column_Name?.toLowerCase() === columnName?.toLowerCase()
        );

        if (storageColumn?.Alias_Name) {
            return storageColumn.Alias_Name;
        }

        return columnName?.replace(/_/g, " ");
    };

    useEffect(() => {
        applyFilters();
    }, [filters]);

    const handleFilterChange = (column, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const applyFilters = () => {
        let filtered = [...reportData];
        for (const column of sortedColumns) {
            if (filters[column.Field_Name]) {
                if (filters[column.Field_Name].type === "range") {
                    const { min, max } = filters[column.Field_Name];
                    filtered = filtered.filter((item) => {
                        const value = item[column.Field_Name];
                        return (
                            (min === undefined || value >= min) &&
                            (max === undefined || value <= max)
                        );
                    });
                } else if (filters[column.Field_Name].type === "date") {
                    const { start, end } = filters[column.Field_Name].value;
                    filtered = filtered.filter((item) => {
                        const dateValue = new Date(item[column.Field_Name]);
                        return (
                            (start === undefined || dateValue >= new Date(start)) &&
                            (end === undefined || dateValue <= new Date(end))
                        );
                    });
                } else if (Array.isArray(filters[column.Field_Name])) {
                    filtered =
                        filters[column.Field_Name]?.length > 0
                            ? filtered.filter((item) =>
                                filters[column.Field_Name].includes(
                                    item[column.Field_Name]?.toLowerCase().trim()
                                )
                            )
                            : filtered;
                }
            }
        }
        setFilteredData(filtered);
    };

    const handleViewExpenseReport = (row) => {
        let productId = null;
        let godownId = null;
        let productName = "";
        let godownName = "";

        console.log("row", row);

        if (row.groupedData && row.groupedData.length > 0) {

            productId = row.groupedData[0]?.Product_Id;
            godownId = row.groupedData[0]?.Godown_Id;
            productName = row.groupedData[0]?.stock_item_name || "";
            godownName = row.groupedData[0]?.Godown_Name || row[groupBy] || "";
        } else {

            productId = row.Product_Id;
            godownId = row.Godown_Id;
            productName = row.stock_item_name || "";
            godownName = row.Godown_Name || "";
        }

        if (!productId) {
            toast.error("Product ID is not available for this item");
            return;
        }


        const isGodownWise = api === "godownWise";

        loadingOn();


        let apiEndpoint = "";
        let params = `?Fromdate=${Fromdate}&Todate=${Todate}&Product_Id=${productId}`;

        if (isGodownWise && godownId) {

            params += `&Godown_Id=${godownId}`;
            apiEndpoint = `reports/godownexpenseReport`;
        } else {

            apiEndpoint = `reports/itemexpenseReport`;
        }

        fetchLink({
            address: `${apiEndpoint}${params}`,
        })
            .then((data) => {
                if (data.success) {
                    setExpenseReportData(toArray(data.data));
                    setSelectedProductInfo({
                        productId,
                        productName,
                        godownId,
                        godownName,
                        fromDate: Fromdate,
                        toDate: Todate,
                        reportType: isGodownWise ? "godownWise" : "itemWise"
                    });
                    setExpenseReportDialog(true);
                } else {
                    toast.error(data.message || "Failed to fetch expense report");
                }
            })
            .catch((error) => {
                console.error("Error fetching expense report:", error);
                toast.error("Error fetching expense report");
            })
            .finally(() => loadingOff());
    };
    const renderFilter = (column) => {
        const { Field_Name, Fied_Data } = column;
        if (Fied_Data === "number") {
            return (
                <div className="d-flex justify-content-between px-2">
                    <input
                        placeholder="Min"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Field_Name]?.min ?? ""}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: "range",
                                ...filters[Field_Name],
                                min: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                        }
                    />
                    <input
                        placeholder="Max"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Field_Name]?.max ?? ""}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: "range",
                                ...filters[Field_Name],
                                max: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                        }
                    />
                </div>
            );
        } else if (Fied_Data === "date") {
            return (
                <div className="d-flex justify-content-between px-2">
                    <input
                        placeholder="Start Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Field_Name]?.value?.start ?? ""}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: "date",
                                value: {
                                    ...filters[Field_Name]?.value,
                                    start: e.target.value || undefined,
                                },
                            })
                        }
                    />
                    <input
                        placeholder="End Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Field_Name]?.value?.end ?? ""}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: "date",
                                value: {
                                    ...filters[Field_Name]?.value,
                                    end: e.target.value || undefined,
                                },
                            })
                        }
                    />
                </div>
            );
        } else if (Fied_Data === "string") {
            const distinctValues = [
                ...new Set(
                    reportData.map((item) => item[Field_Name]?.toLowerCase()?.trim())
                ),
            ];
            return (
                <Autocomplete
                    multiple
                    id={`${Field_Name}-filter`}
                    options={distinctValues}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option}
                    value={filters[Field_Name] || []}
                    onChange={(event, newValue) =>
                        handleFilterChange(Field_Name, newValue)
                    }
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
                            label={getDisplayName(Field_Name)}
                            placeholder={`Select ${getDisplayName(Field_Name)}`}
                        />
                    )}
                />
            );
        }
    };

    const closeDialog = () => {
        setDialog(false);
        setFilterDialog(false);
    };

    const resetColumns = () => {

        const resetCols = propsColumns.map((col) => {
            const visibilitySetting = reportVisiblity.find((v) =>
                stringCompare(v.columnName, col.Field_Name)
            );

            return {
                ...col,
                isVisible: visibilitySetting ? 1 : 0,
                OrderBy: visibilitySetting?.orderNum || col.OrderBy,
            };
        });

        setColumns(resetCols);
    };

    const saveColumnState = () => {

        const visibleColumns = columns.filter((col) =>
            isEqualNumber(col.isVisible, 1)
        );

        fetchLink({
            address: `reports/reportState/columnVisiblity`,
            method: "POST",
            bodyData: {
                visibleColumns: visibleColumns.map((col) => ({
                    ColumnName: col.Field_Name,
                    ColumnOrder: col.OrderBy,
                })),
                reportName,
                reportUrl: url,
            },
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data.message);

                    setReportVisiblity(
                        visibleColumns.map((col) => ({
                            columnName: col.Field_Name,
                            orderNum: col.OrderBy,
                        }))
                    );
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.error(e));
    };


    const actionColumn = {
        Field_Name: "__action__",
        ColumnHeader: "Action",
        isVisible: 1,
        isEnabled: true,
        isCustomCell: true,
        align: "center",
        Cell: ({ row }) => (
            <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                    e.stopPropagation();
                    handleViewExpenseReport(row);
                }}
            >
                View
            </Button>
        )
    };


    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const calculateTotals = () => {
        const totals = {
            inQty: 0,
            outQty: 0,
            amount: 0,
        };

        expenseReportData.forEach(item => {
            totals.inQty += Number(item.In_Qty) || 0;
            totals.outQty += Number(item.Out_Qty) || 0;
            totals.amount += Number(item.Amount) || 0;
        });

        return totals;
    };

    const totals = calculateTotals();


    const godownActionColumn = {
        Field_Name: "__godown_action__",
        ColumnHeader: "Action",
        isVisible: 1,
        isEnabled: true,
        isCustomCell: true,
        align: "center",
        Cell: ({ row }) => (
            <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                    e.stopPropagation();
                    handleViewExpenseReport(row);
                }}
            >
                View
            </Button>
        )
    };


    const formatINR = (value, fraction = 2) =>
        new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: fraction,
            maximumFractionDigits: fraction,
        }).format(Number(value || 0));


    return (
        <>
            <FilterableTable
                title={api === "godownWise" ? "Godown Wise" : "Item Wise"}
                EnableSerialNumber
                headerFontSizePx={12}
                bodyFontSizePx={12}
                maxHeightOption
                ButtonArea={
                    <>
                        <Tooltip title="Column Visibility">
                            <IconButton size="small" onClick={() => setDialog(true)}>
                                <Settings />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Clear Filters">
                            <IconButton size="small" onClick={() => setFilters({})}>
                                <FilterAltOff />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Filters">
                            <IconButton onClick={() => setFilterDialog(true)} size="small">
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>

                        {groupingOption && (
                            <div className="d-flex align-items-center flex-wrap">
                                <span>Group-By:</span>
                                <select
                                    className="cus-inpt p-2 w-auto m-1"
                                    value={groupBy}
                                    onChange={(e) => setGroupBy(e.target.value)}
                                >
                                    <option value="">select group</option>
                                    {DisplayColumn.filter(
                                        (fil) =>
                                            filterableText(fil.Fied_Data) === "string" &&
                                            fil.Field_Name !== "Ledger_Name" &&
                                            fil.isEnabled
                                    ).map((col, colInd) => (
                                        <option key={colInd} value={col.Field_Name}>
                                            {getDisplayName(col.Field_Name)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </>
                }
                ExcelPrintOption
                dataArray={showData}
                columns={[
                    ...(groupBy
                        ? DisplayColumn.filter(
                            (fil) =>
                                showData.length > 0 &&
                                Object.keys(showData[0]).includes(fil.Field_Name) &&
                                fil.isEnabled
                        )
                        : DisplayColumn.filter((col) => col.isEnabled)
                    ).map((col) => ({
                        ...col,
                        ColumnHeader: getDisplayName(col.Field_Name),
                    })),
                    ...(api === "itemWise" ? [actionColumn] : [])

                ]}
                isExpendable={Boolean(groupBy)}

                expandableComp={({ row }) => (
                    <FilterableTable
                        EnableSerialNumber
                        headerFontSizePx={12}
                        bodyFontSizePx={12}
                        dataArray={toArray(row?.groupedData)}
                        columns={[
                            ...DisplayColumn.filter(
                                (clm) =>
                                    !stringCompare(clm.Field_Name, groupBy) &&
                                    clm.isEnabled
                            ).map((col) => ({
                                ...col,
                                ColumnHeader: getDisplayName(col.Field_Name),
                            })),


                            ...(api === "godownWise" ? [godownActionColumn] : [])
                        ]}
                    />
                )}
            />

            <Dialog open={filterDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
                <DialogContent>
                    <h5 className="d-flex justify-content-between px-2">
                        <span>Filters</span>
                        <span>
                            <Tooltip title="Column Visibility">
                                <IconButton size="small" onClick={() => setDialog(true)}>
                                    <Settings />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Clear Filters">
                                <IconButton size="small" onClick={() => setFilters({})}>
                                    <FilterAltOff />
                                </IconButton>
                            </Tooltip>
                        </span>
                    </h5>

                    <div className="border rounded-3">
                        {DisplayColumn.filter((col) => col.isEnabled).map((column, ke) => (
                            <div key={ke} className="py-3 px-3 hov-bg border-bottom">
                                <label className="mt-2 mb-1">
                                    {getDisplayName(column?.Field_Name)}
                                </label>
                                {renderFilter(column)}
                            </div>
                        ))}
                        <br />
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="error">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialog}
                onClose={() => setDialog(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Column Settings</DialogTitle>
                <DialogContent>
                    <div className="row">
                        {columns.map((o, i) => (
                            <div className="col-lg-4 col-md-6 p-2" key={i}>
                                <Card
                                    component={Paper}
                                    className={`p-2 d-flex justify-content-between align-items-center flex-wrap ${i % 2 !== 0 ? "bg-light" : ""
                                        } ${!o.isEnabled ? "opacity-50" : ""}`}
                                >
                                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                                        <Switch
                                            checked={Boolean(o?.isVisible) && o.isEnabled}
                                            onChange={(e) =>
                                                o.isEnabled &&
                                                setColumns((prevColumns) =>
                                                    prevColumns.map((oo) =>
                                                        oo.Field_Name === o?.Field_Name
                                                            ? { ...oo, isVisible: e.target.checked ? 1 : 0 }
                                                            : oo
                                                    )
                                                )
                                            }
                                        // disabled={!o.isEnabled}
                                        />
                                        <h6 className="fa-13 mb-0 fw-bold">
                                            {getDisplayName(o.Field_Name)}
                                            {!o.isEnabled && (
                                                <span className="text-muted small"></span>
                                            )}
                                        </h6>
                                    </div>
                                    <input
                                        type="number"
                                        value={checkIsNumber(o?.OrderBy) ? o?.OrderBy : ""}
                                        onChange={(e) =>
                                            o.isEnabled &&
                                            setColumns((prevColumns) =>
                                                prevColumns.map((oo) =>
                                                    oo.Field_Name === o?.Field_Name
                                                        ? { ...oo, OrderBy: e.target.value }
                                                        : oo
                                                )
                                            )
                                        }
                                        disabled={!o.isEnabled}
                                        className="mt-2 p-1 border-0 cus-inpt"
                                        style={{ width: "80px" }}
                                        placeholder="Order"
                                    />
                                </Card>
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions className="d-flex justify-content-between align-items-center flex-wrap">
                    <Button onClick={saveColumnState} variant="outlined">
                        Save State
                    </Button>
                    <span>
                        <Button onClick={resetColumns} variant="outlined">
                            Reset
                        </Button>
                        <Button onClick={() => setDialog(false)} color="error">
                            Close
                        </Button>
                    </span>
                </DialogActions>
            </Dialog>



            <Dialog
                open={expenseReportDialog}
                onClose={() => setExpenseReportDialog(false)}
                maxWidth="lg"
                fullWidth
                maxHeight="90vh"
            >
                <DialogTitle>
                    <div className="d-flex justify-content-between align-items-center">
                        <Typography variant="h6">
                            {selectedProductInfo.productName}
                        </Typography>
                        <IconButton onClick={() => setExpenseReportDialog(false)}>
                            <Close />
                        </IconButton>
                    </div>
                    <Typography variant="body2" color="textSecondary">

                        Period: {formatDate(selectedProductInfo.fromDate)} to {formatDate(selectedProductInfo.toDate)}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    {expenseReportData.length === 0 ? (
                        <Typography align="center" color="textSecondary">
                            No expense data found for this product
                        </Typography>
                    ) : (
                        <>
                            <TableContainer component={Paper} style={{ maxHeight: 500 }}>
                                <Table stickyHeader size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Invoice No</strong></TableCell>
                                            <TableCell><strong>Date</strong></TableCell>
                                            <TableCell><strong>Particulars</strong></TableCell>
                                            <TableCell><strong>Month/Year</strong></TableCell>
                                            <TableCell align="right"><strong>In Qty</strong></TableCell>
                                            <TableCell align="right"><strong>Out Qty</strong></TableCell>
                                            <TableCell align="right"><strong>Rate</strong></TableCell>
                                            <TableCell align="right"><strong>Amount</strong></TableCell>
                                            <TableCell><strong>Retailer</strong></TableCell>
                                            <TableCell><strong>Voucher</strong></TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {expenseReportData.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{item.invoice_no || ""}</TableCell>
                                                <TableCell>{formatDate(item.Ledger_Date)}</TableCell>
                                                <TableCell>{item.Particulars || ""}</TableCell>
                                                <TableCell>{item.Month_Year || ""}</TableCell>

                                                <TableCell align="right">
                                                    {formatINR(item.In_Qty)}
                                                </TableCell>

                                                <TableCell align="right">
                                                    {formatINR(item.Out_Qty)}
                                                </TableCell>

                                                <TableCell align="right">
                                                    {formatINR(item.Rate)}
                                                </TableCell>

                                                <TableCell align="right">
                                                    {formatINR(item.Amount)}
                                                </TableCell>

                                                <TableCell>{item.Retailer_Name || "-"}</TableCell>
                                                <TableCell>{item.voucher_name || "-"}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>


                            <div className="mt-4 p-3 border rounded bg-light">
                                <Typography variant="h6" gutterBottom>
                                    Summary
                                </Typography>

                                <div className="row">
                                    <div className="col-md-4">
                                        <Typography>
                                            <strong>Total In Quantity:</strong>{" "}
                                            {formatINR(totals.inQty)}
                                        </Typography>
                                    </div>

                                    <div className="col-md-4">
                                        <Typography>
                                            <strong>Total Out Quantity:</strong>{" "}
                                            {formatINR(totals.outQty)}
                                        </Typography>
                                    </div>

                                    <div className="col-md-4">
                                        <Typography>
                                            <strong>Total Amount:</strong>{" "}
                                            ₹{formatINR(totals.amount)}
                                        </Typography>
                                    </div>
                                </div>

                                <div className="mt-2">
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>Net Quantity:</strong>{" "}
                                        {formatINR(totals.inQty - totals.outQty)}
                                    </Typography>
                                </div>
                            </div>

                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setExpenseReportDialog(false)}
                        color="primary"
                        variant="contained"
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>



        </>
    );
};

export default ItemWiseStockReport;
