import { useEffect, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import {
    Addition, checkIsNumber, filterableText,
    groupData, isEqualNumber, stringCompare, toArray, toNumber,
} from "../../../Components/functions";
import FilterableTable from "../../../Components/filterableTable2";
import {
    Autocomplete, Button, Card, Checkbox, Dialog,
    DialogActions, DialogContent, DialogTitle, IconButton, 
    Paper, Switch, TextField, Tooltip,
} from "@mui/material";
import {
    CheckBox, CheckBoxOutlineBlank, FilterAlt, FilterAltOff, Settings,
} from "@mui/icons-material";
import { useMemo } from "react";

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
}) => {

    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({});
    const [groupBy, setGroupBy] = useState(defaultGrouping);
    const [filteredData, setFilteredData] = useState([]);
    const [dialog, setDialog] = useState(false);
    const [filterDialog, setFilterDialog] = useState(false);
    const [columnSettings, setColumnSettings] = useState([]);

    const propsColumns = storageStockColumns.map((col, colInd) => ({
        isVisible: colInd < 11 ? 1 : 0,
        Field_Name: col?.Column_Name,
        Fied_Data: col?.Data_Type,
        OrderBy: colInd + 1,
        isEnabled: true,
    }));

    const [columns, setColumns] = useState(propsColumns);
    const parseData = JSON.parse(localStorage.getItem("user"));
    const companyId = parseData?.Company_id;

    useEffect(() => {
        loadingOn();

        const fetchReportData = fetchLink({
            address: `reports/storageStock/${api}?Fromdate=${Fromdate}&Todate=${Todate}`,
        }).then((data) => {
            if (data.success) {
                setReportData(toArray(data.data));
            }
        });

        const fetchColumnSettings = fetchLink({
            address: `masters/displayLosColumn?company_id=${companyId}`,
        }).then((data) => {
            if (data.success) {
                const settings = toArray(data.data);
                setColumnSettings(settings);

                setColumns((prevColumns) =>
                    prevColumns.map((col, index) => {
                        const setting = settings.find(
                            (s) =>
                                s.Column_Name?.toLowerCase() ===
                                col.Field_Name?.toLowerCase() ||
                                s.ColumnName?.toLowerCase() === col.Field_Name?.toLowerCase()
                        );
                        const status = Number(setting?.status);

                        const isFirstFive = index < 5;

                        return {
                            ...col,
                            isEnabled: isFirstFive ? true : setting ? status === 1 : true,
                            isVisible: isFirstFive ? 1 : setting ? (status === 1 ? 1 : 0) : 0,
                        };
                    })
                );
            }
        });

        Promise.all([fetchReportData, fetchColumnSettings])
            .catch((error) => console.error("Fetch error:", error))
            .finally(() => loadingOff());
    }, [Fromdate, Todate, companyId, api, loadingOn, loadingOff]);

    const sortedColumns = useMemo(() => {
        return [...columns].sort((a, b) =>
            a?.OrderBy && b?.OrderBy
                ? a?.OrderBy - b?.OrderBy
                : b?.OrderBy - a?.OrderBy
        );
    }, [columns]);

    const DisplayColumn = useMemo(() => {
        return sortedColumns.filter(
            (col) =>
                (isEqualNumber(col?.Defult_Display, 1) ||
                    isEqualNumber(col?.isVisible, 1)) &&
                col.isEnabled === true
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
        setColumns(propsColumns);
    };

    return (
        <>
            <FilterableTable
                title="Item Wise"
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
                                <span>Group-By: </span>
                                <select
                                    className="cus-inpt p-2 w-auto m-1"
                                    value={groupBy}
                                    onChange={(e) => setGroupBy(e.target.value)}
                                >
                                    <option value="">select group</option>
                                    {DisplayColumn.filter(
                                        (fil) =>
                                            filterableText(fil.Fied_Data) === "string" &&
                                            fil?.Field_Name !== "Ledger_Name" &&
                                            fil.isEnabled
                                    ).map((col, colInd) => (
                                        <option value={col?.Field_Name} key={colInd}>
                                            {getDisplayName(col?.Field_Name)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </>
                }
                ExcelPrintOption
                dataArray={showData}
                columns={
                    groupBy
                        ? DisplayColumn.filter(
                            (fil) =>
                                showData.length > 0 &&
                                Object.keys(showData[0]).includes(fil.Field_Name) &&
                                fil.isEnabled
                        ).map((col) => ({
                            ...col,
                            ColumnHeader: getDisplayName(col.Field_Name),
                        }))
                        : DisplayColumn.filter((col) => col.isEnabled).map((col) => ({
                            ...col,
                            ColumnHeader: getDisplayName(col.Field_Name),
                        }))
                }
                isExpendable={groupBy ? true : false}
                expandableComp={({ row }) => (
                    <FilterableTable
                        EnableSerialNumber
                        headerFontSizePx={12}
                        bodyFontSizePx={12}
                        dataArray={toArray(row?.groupedData)}
                        columns={DisplayColumn.filter(
                            (clm) => !stringCompare(clm.Field_Name, groupBy) && clm.isEnabled
                        ).map((col) => ({
                            ...col,
                            ColumnHeader: getDisplayName(col.Field_Name),
                        }))}
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
                <DialogActions>
                    <Button onClick={resetColumns} variant="outlined">
                        Reset
                    </Button>
                    <Button onClick={() => setDialog(false)} color="error">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ItemWiseStockReport;