import { useState, useEffect, useMemo, useRef } from "react";
import { checkIsNumber, isEqualNumber, ISOString, toArray, toNumber, RoundNumber, LocalDateWithTime } from "../../../../Components/functions";
import { fetchLink } from "../../../../Components/fetchComponent";
import FilterableTable, { ButtonActions, createCol } from "../../../../Components/filterableTable2";
import {
    Autocomplete,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Tooltip,
} from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../../Components/tablecolumn";
import { reactSelectFilterLogic } from "../../../../Components/functions";
import {
    CheckBox,
    CheckBoxOutlineBlank,
    FilterAlt,
    PersonAdd,
    Search,
    HourglassEmpty,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const multipleStaffUpdateInitialValues = {
    CostCategory: { label: "", value: "" },
    PR_Id: [],
    involvedStaffs: [],
    staffInvolvedStatus: 0,
    deliveryStatus: "New",
};

const multipleStaffRemoveInitialValues = {
    CostCategory: { label: "", value: "" },
    PR_Id: [],
    involvedStaffs: [],
    staffInvolvedStatus: 0,
    deliveryStatus: "New",
};

const normalize = (v) => String(v ?? "").toLowerCase().trim();

const uniqueCaseInsensitive = (values) => {
    const map = new Map();
    for (const v of values) {
        const s = String(v ?? "").trim();
        if (!s) continue;
        const key = s.toLowerCase();
        if (!map.has(key)) map.set(key, s);
    }
    return Array.from(map.values());
};

const getCostTypeEmployees = (processingOrRow, costTypeId) => {
    const processingEmployee = toArray(processingOrRow?.involvedStaffs);
    return processingEmployee
        .filter((emp) => isEqualNumber(emp.Emp_Type_Id, costTypeId))
        .map((emp) => String(emp.Emp_Name ?? "").trim())
        .filter(Boolean);
};

const ProcessingListLRReport = ({ loadingOn, loadingOff, AddRights, EditRights }) => {
    const [processingList, setProcessingList] = useState([]);
    const [costCenterData, setCostCenterData] = useState([]);
    const [costTypes, setCostTypes] = useState([]);
    const [uniqueInvolvedCost, setUniqueInvolvedCost] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasInitialLoading, setHasInitialLoading] = useState(false);
    const [selectAllCheckBox, setSelectAllCheckBox] = useState(false);

    const [multipleCostCenterUpdateValues, setMultipleCostCenterUpdateValues] = useState(
        multipleStaffUpdateInitialValues
    );

    const [multipleStaffRemoveValues, setMultipleStaffRemoveValues] = useState(
        multipleStaffRemoveInitialValues
    );

    const [columnFilters, setColumnFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);

    const [filters, setFilters] = useState({
        reqDate: ISOString(),
        assignDialog: false,
        filterDialog: false,
        selectedProcessing: null,
        multipleStaffUpdateDialog: false,
        multipleStaffRemoveDialog: false,
        fetchTrigger: 0,
        staffStatus: 0,
    });

    const columns = useMemo(
        () => [
            { Field_Name: "PR_Inv_Id", Fied_Data: "string", ColumnHeader: "Process ID" },
            { Field_Name: "voucherTypeGet", Fied_Data: "string", ColumnHeader: "Voucher" },
            { Field_Name: "godownNameGet", Fied_Data: "string", ColumnHeader: "Godown" },
        ],
        []
    );

    const fetchAllProcessing = async (refresh = false) => {
        try {
            if (!refresh) {
                setIsLoading(true);
            } else {
                setIsRefreshing(true);
            }

            const data = await fetchLink({
                address: `inventory/processingLRReport?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`,
                loadingOn,
                loadingOff,
            });

            if(data.success) {
                setProcessingList(toArray(data.data));
                setCostTypes(toArray(data?.others?.costTypes));
                setUniqueInvolvedCost(toArray(data?.others?.uniqeInvolvedStaffs));
            } else {
                setProcessingList([]);
            }

            if (!hasInitialLoading) {
                setHasInitialLoading(true);
            }
        } catch (error) {
            console.error("Error fetching processing records:", error);
            toast.error("Failed to load processing records");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchCostCenterData = async () => {
        try {
            const costCenterData = await fetchLink({
                address: "masters/erpCostCenter/dropDown"
            });
            setCostCenterData(toArray(costCenterData.data));
        } catch (error) {
            console.error("Error fetching cost center data:", error);
            toast.error("Failed to load cost center data");
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                await Promise.all([
                    fetchAllProcessing(),
                    fetchCostCenterData()
                ]);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast.error("Failed to load initial data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchAllProcessing(true);
    }, [filters.fetchTrigger, filters.staffStatus]);

    useEffect(() => {
        if (hasInitialLoading) {
            fetchAllProcessing(true);
        }
    }, [hasInitialLoading]);

    const costTypeColumns = useMemo(() => {
        const columns = costTypes
            .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
            .map((costType) => {
                const field = `costType_${toNumber(costType.Cost_Category_Id)}`;

                return {
                    costType: costType.Cost_Category,
                    field: field,
                    columnConfig: {
                        Field_Name: field,
                        Fied_Data: "string",
                        isVisible: 1,
                        ColumnHeader: costType.Cost_Category,
                        isCustomCell: true,
                        getFilterValues: (row) => getCostTypeEmployees(row, costType.Cost_Category_Id),
                        Cell: ({ row }) => {
                            const names = getCostTypeEmployees(row, costType.Cost_Category_Id).join(", ");
                            return <span>{names || "-"}</span>;
                        },
                    }
                };
            });

        return columns.sort((a, b) => {
            return a.costType.localeCompare(b.costType);
        }).map(c => c.columnConfig);
    }, [costTypes, uniqueInvolvedCost]);

    const filterColumns = useMemo(() => [...columns, ...costTypeColumns], [columns, costTypeColumns]);

    const onCloseAssignDialog = () =>
        setFilters((prev) => ({ 
            ...prev, 
            assignDialog: false, 
            selectedProcessing: null 
        }));

    const onCloseFilterDialog = () => setFilters((prev) => ({ ...prev, filterDialog: false }));

    const onCloseMultipleUpdateCostCategoryDialog = () => {
        setMultipleCostCenterUpdateValues(multipleStaffUpdateInitialValues);
        setFilters((prev) => ({ ...prev, multipleStaffUpdateDialog: false }));
    };

    const onCloseMultipleStaffRemoveDialog = () => {
        setMultipleStaffRemoveValues(multipleStaffRemoveInitialValues);
        setFilters((prev) => ({ ...prev, multipleStaffRemoveDialog: false }));
    };

    const onChangeEmployee = (processingRow, selectedOptions, costType) => {
        setFilters((prev) => {
            const updatedInvolvedStaffs = toArray(prev.selectedProcessing?.involvedStaffs)
                .filter((emp) => !isEqualNumber(emp.Emp_Type_Id, costType.Cost_Category_Id))
                .concat(selectedOptions);

            return {
                ...prev,
                selectedProcessing: {
                    ...processingRow,
                    involvedStaffs: updatedInvolvedStaffs,
                },
            };
        });
    };

    const refreshData = () => {
        fetchAllProcessing(true);
    };

    const postAssignCostCenters = async (e) => {
        e.preventDefault();
        fetchLink({
            address: "inventory/processingLRReport",
            method: "POST",
            bodyData: {
                PR_Id: filters.selectedProcessing?.PR_Id,
                involvedStaffs: filters.selectedProcessing?.involvedStaffs,
                staffInvolvedStatus: toNumber(filters.selectedProcessing?.staffInvolvedStatus),
            },
            loadingOn,
            loadingOff,
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data.message);
                    onCloseAssignDialog();
                    refreshData();
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e2) => console.log(e2));
    };

    const postMultipleCostCenterUpdate = async () => {
        fetchLink({
            address: "inventory/processingLRReport/multiple",
            method: "POST",
            bodyData: {
                CostCategory: toNumber(multipleCostCenterUpdateValues.CostCategory.value),
                PR_Id: multipleCostCenterUpdateValues.PR_Id,
                involvedStaffs: multipleCostCenterUpdateValues.involvedStaffs.map((option) => toNumber(option.value)),
                staffInvolvedStatus: toNumber(multipleCostCenterUpdateValues.staffInvolvedStatus),
                deliveryStatus: String(multipleCostCenterUpdateValues.deliveryStatus),
            },
            loadingOn,
            loadingOff,
        }).then((data) => {
            if (data.success) {
                toast.success(data.message);
                onCloseMultipleUpdateCostCategoryDialog();
                refreshData();
            } else {
                toast.error(data.message);
            }
        }).catch((e) => console.log(e));
    };

    const postMultipleStaffRemove = async () => {
        if (!multipleStaffRemoveValues.CostCategory.value || multipleStaffRemoveValues.PR_Id.length === 0) {
            toast.error("Please select a Cost Category and at least one processing record");
            return;
        }

        fetchLink({
            address: "inventory/processingLRReport/multipleDelete",
            method: "POST",
            bodyData: {
                CostCategory: toNumber(multipleStaffRemoveValues.CostCategory.value),
                PR_Id: multipleStaffRemoveValues.PR_Id,
                staffInvolvedStatus: toNumber(multipleStaffRemoveValues.staffInvolvedStatus),
                deliveryStatus: String(multipleStaffRemoveValues.deliveryStatus),
            },
            loadingOn,
            loadingOff,
        }).then((data) => {
            if (data.success) {
                toast.success(data.message);
                onCloseMultipleStaffRemoveDialog();
                refreshData();
            } else {
                toast.error(data.message);
            }
        }).catch((e) => console.log(e));
    };

    useEffect(() => {
        applyFilters();
    }, [columnFilters, processingList, filterColumns]);

    const handleFilterChange = (column, value) => {
        setColumnFilters((prevFilters) => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const applyFilters = () => {
        let filtered = [...processingList];

        for (const column of filterColumns) {
            const key = column.Field_Name;
            const filterVal = columnFilters[key];
            if (!filterVal) continue;

            if (filterVal.type === "range") {
                const { min, max } = filterVal;
                filtered = filtered.filter((item) => {
                    const value = item[key];
                    return (min === undefined || value >= min) && (max === undefined || value <= max);
                });
                continue;
            }

            if (filterVal.type === "date") {
                const { start, end } = filterVal.value || {};
                filtered = filtered.filter((item) => {
                    const dateValue = new Date(item[key]);
                    return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
                });
                continue;
            }

            if (Array.isArray(filterVal)) {
                const selected = filterVal.map(normalize).filter(Boolean);
                if (!selected.length) continue;

                if (typeof column.getFilterValues === "function") {
                    filtered = filtered.filter((item) => {
                        const rowVals = (column.getFilterValues(item) || []).map(normalize).filter(Boolean);
                        return selected.some((v) => rowVals.includes(v));
                    });
                } else {
                    filtered = filtered.filter((item) => selected.includes(normalize(item[key])));
                }
            }
        }

        setFilteredData(filtered);
    };

    const renderFilter = (column) => {
        const { Field_Name, Fied_Data, ColumnHeader } = column;

        if (Fied_Data === "string") {
            const rawValues =
                typeof column.getFilterValues === "function"
                    ? processingList.flatMap((item) => column.getFilterValues(item) || [])
                    : processingList.map((item) => item[Field_Name]);

            const distinctValues = uniqueCaseInsensitive(rawValues);

            return (
                <Autocomplete
                    multiple
                    id={`${Field_Name}-filter`}
                    options={distinctValues}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option}
                    value={columnFilters[Field_Name] || []}
                    onChange={(event, newValue) => handleFilterChange(Field_Name, newValue)}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                            {option}
                        </li>
                    )}
                    isOptionEqualToValue={(opt, val) => opt === val}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={ColumnHeader || Field_Name}
                            placeholder={`Select ${(ColumnHeader || Field_Name).replace(/_/g, " ")}`}
                        />
                    )}
                />
            );
        }

        return null;
    };

    useEffect(() => {
        if (selectAllCheckBox) {
            const allPRIds = filteredData.map(item => toNumber(item.PR_Id));
            setMultipleCostCenterUpdateValues(prev => ({ ...prev, PR_Id: allPRIds }));
            setMultipleStaffRemoveValues(prev => ({ ...prev, PR_Id: allPRIds }));
        } else {
            setMultipleCostCenterUpdateValues(prev => ({ ...prev, PR_Id: [] }));
            setMultipleStaffRemoveValues(prev => ({ ...prev, PR_Id: [] }));
        }
    }, [selectAllCheckBox, filteredData]);

    const saveMultipleProcessingValidation = useMemo(() => {
        const validPRId = multipleCostCenterUpdateValues.PR_Id.length > 0;
        const validCostCenterId = multipleCostCenterUpdateValues.involvedStaffs.length > 0;
        const validCostCategory =
            checkIsNumber(multipleCostCenterUpdateValues.CostCategory.value) &&
            !isEqualNumber(multipleCostCenterUpdateValues.CostCategory.value, 0);

        if (!validPRId) return false;
        if (validCostCenterId && !validCostCategory) return false;
        if (!validCostCenterId && validCostCategory) return false;
        return true;
    }, [multipleCostCenterUpdateValues]);

    const removeMultipleProcessingValidation = useMemo(() => {
        const validPRId = multipleStaffRemoveValues.PR_Id.length > 0;
        const validCostCategory =
            checkIsNumber(multipleStaffRemoveValues.CostCategory.value) &&
            !isEqualNumber(multipleStaffRemoveValues.CostCategory.value, 0);

        return validPRId && validCostCategory;
    }, [multipleStaffRemoveValues]);

    if (isLoading && !hasInitialLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="text-muted">
                    Loading Processing LR Report...
                </div>
            </div>
        );
    }

    return (
        <>
            <FilterableTable
                title="Processing LR Report"
                columns={[
                    {
                        Field_Name: "Select",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const isSelected = multipleCostCenterUpdateValues.PR_Id.includes(toNumber(row.PR_Id));
                            return (
                                <Checkbox
                                    onFocus={(e) => e.target.blur()}
                                    checked={isSelected}
                                    onChange={() => {
                                        if (isSelected) {
                                            setMultipleCostCenterUpdateValues((prev) => ({
                                                ...prev,
                                                PR_Id: prev.PR_Id.filter((item) => !isEqualNumber(item, row.PR_Id)),
                                            }));
                                            setMultipleStaffRemoveValues((prev) => ({
                                                ...prev,
                                                PR_Id: prev.PR_Id.filter((item) => !isEqualNumber(item, row.PR_Id)),
                                            }));
                                        } else {
                                            setMultipleCostCenterUpdateValues((prev) => ({
                                                ...prev,
                                                PR_Id: [...prev.PR_Id, toNumber(row.PR_Id)],
                                            }));
                                            setMultipleStaffRemoveValues((prev) => ({
                                                ...prev,
                                                PR_Id: [...prev.PR_Id, toNumber(row.PR_Id)],
                                            }));
                                        }
                                    }}
                                />
                            );
                        },
                    },
                    createCol("PR_Inv_Id", "string", "Process ID"),
                    {
                        Field_Name: "",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            return row?.createdOn ? LocalDateWithTime(row?.createdOn) : "";
                        },
                    },
                    createCol("voucherTypeGet", "string", "Voucher"),
                    createCol("godownNameGet", "string", "Godown"),
                    createCol("branchNameGet", "string", "Branch"),
                    createCol("Narration", "string", "Narration"),
                    ...costTypeColumns,
                    createCol("Created_BY_Name", "string", "Created By"),
                    createCol("PR_Status", "string", "Status"),
                    {
                        Field_Name: "Action",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            return (
                                <ButtonActions
                                    buttonsData={[
                                        {
                                            name: "Add Employee",
                                            onclick: () => {
                                                const selectedRow = {
                                                    ...row,
                                                    staffInvolvedStatus: row.staffInvolvedStatus === 1 ? 1 : 0 
                                                };
                                                setFilters((prev) => ({ 
                                                    ...prev, 
                                                    assignDialog: true, 
                                                    selectedProcessing: selectedRow 
                                                }));
                                            },
                                            icon: <PersonAdd fontSize="small" color="primary" />,
                                            disabled: !AddRights && !EditRights,
                                        }
                                    ]}
                                />
                            )
                        }
                    },
                ]}
                dataArray={filteredData}
                EnableSerialNumber
                ButtonArea={
                    <>
                        <Tooltip title="Select All">
                            <Checkbox
                                checked={selectAllCheckBox}
                                onChange={e => setSelectAllCheckBox(e.target.checked)}
                            />
                        </Tooltip>

                        <IconButton
                            size="small"
                            onClick={() => {
                                const selectedProcessingRows = processingList.filter(inv =>
                                    multipleCostCenterUpdateValues.PR_Id.includes(toNumber(inv.PR_Id))
                                );
                                
                                const allHaveStaffInvolved = selectedProcessingRows.length > 0 && 
                                    selectedProcessingRows.every(inv => isEqualNumber(inv.staffInvolvedStatus, 1));
                                
                                setMultipleCostCenterUpdateValues(prev => ({
                                    ...prev,
                                    staffInvolvedStatus: allHaveStaffInvolved ? 1 : 0
                                }));
                                
                                setFilters((prev) => ({ ...prev, multipleStaffUpdateDialog: true }));
                            }}
                            disabled={!multipleCostCenterUpdateValues.PR_Id.length}
                        >
                            <PersonAdd fontSize="small" />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => setFilters((prev) => ({ ...prev, multipleStaffRemoveDialog: true }))}
                            disabled={!multipleStaffRemoveValues.PR_Id.length}
                        >
                            <PersonRemoveIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                            size="small"
                            onClick={() => setFilters((prev) => ({ ...prev, filterDialog: true }))}
                            disabled={isRefreshing}
                        >
                            <FilterAlt />
                        </IconButton>

                        <IconButton
                            size="small"
                            onClick={() => {
                                refreshData(); 
                            }}
                            disabled={isRefreshing}
                        >
                            <Search />
                        </IconButton>

                        <input
                            type="date"
                            className="cus-inpt w-auto"
                            value={filters.reqDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, reqDate: e.target.value }))}
                            disabled={isRefreshing}
                        />

                        <select
                            className="cus-inpt w-auto rounded-5 border-0"
                            value={filters.staffStatus}
                            onChange={(e) => {
                                setFilters((prev) => ({
                                    ...prev,
                                    staffStatus: Number(e.target.value)
                                }));
                            }}
                        >
                            <option value="1">ALL PROCESSING</option>
                            <option value="0">INCOMPLETED PROCESSING</option>
                        </select>
                    </>
                }
            />

            {/* Assign dialog */}
            <Dialog open={filters.assignDialog} onClose={onCloseAssignDialog} maxWidth="lg" fullWidth>
                <DialogTitle>
                    Assign Cost Centers: <span className="text-primary">{filters.selectedProcessing?.PR_Inv_Id}</span>
                </DialogTitle>
                <form onSubmit={postAssignCostCenters}>
                    <DialogContent>
                        <div className="row">
                            {costTypes
                                .filter(
                                    (costType) =>
                                        !["Broker", "Transport"].some((keyword) => String(costType?.Cost_Category).includes(keyword))
                                )
                                .map((costType, index) => {
                                    const processingEmployee = toArray(filters.selectedProcessing?.involvedStaffs);
                                    const empCostType = processingEmployee
                                        .filter((emp) => isEqualNumber(emp.Emp_Type_Id, costType.Cost_Category_Id))
                                        .map((emp) => ({ value: emp.Emp_Id, label: emp.Emp_Name }));

                                    return (
                                        <div className="col-lg-4 col-md-6 p-2" key={index}>
                                            <label>{costType.Cost_Category}</label>
                                            <Select
                                                value={empCostType}
                                                isMulti
                                                styles={customSelectStyles}
                                                options={costCenterData}
                                                onChange={(e) => {
                                                    const values = e.map((option) => ({
                                                        PR_Id: filters?.selectedProcessing?.PR_Id,
                                                        Emp_Id: option.value,
                                                        Emp_Name: option.label,
                                                        Emp_Type_Id: costType.Cost_Category_Id,
                                                        Involved_Emp_Type: costType.Cost_Category,
                                                    }));
                                                    onChangeEmployee(filters.selectedProcessing, values, costType);
                                                }}
                                                placeholder={`Select ${costType.Cost_Category}`}
                                                filterOption={reactSelectFilterLogic}
                                                menuPortalTarget={document.body}
                                            />
                                        </div>
                                    );
                                })}

                            <div className="col-lg-4 col-md-6 p-2 d-flex align-items-end">
                                <input
                                    className="form-check-input shadow-none pointer mx-2"
                                    style={{ padding: "0.7em" }}
                                    type="checkbox"
                                    id="removeFromList"
                                    checked={filters.selectedProcessing?.staffInvolvedStatus === 1}
                                    onChange={(e) => {
                                        const newStatus = e.target.checked ? 1 : 0;
                                        setFilters((prev) => ({
                                            ...prev,
                                            selectedProcessing: {
                                                ...prev.selectedProcessing,
                                                staffInvolvedStatus: newStatus,
                                            },
                                        }));
                                    }}
                                />
                                <label htmlFor="removeFromList" className="fw-bold">
                                    Remove from this page
                                </label>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onCloseAssignDialog} variant="outlined">
                            Close
                        </Button>
                        <Button variant="contained" type="submit">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Filter dialog */}
            <Dialog open={filters.filterDialog} onClose={onCloseFilterDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Filter Options</DialogTitle>
                <DialogContent>
                    <div className="row">
                        {filterColumns.map((column, index) => (
                            <div className="col-12 p-2" key={index}>
                                {renderFilter(column)}
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseFilterDialog} variant="outlined">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Multiple update dialog */}
            <Dialog
                open={filters.multipleStaffUpdateDialog}
                onClose={onCloseMultipleUpdateCostCategoryDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Update Cost Category</DialogTitle>
                <DialogContent>
                    <div className="py-2">
                        <label>Cost Category</label>
                        <Select
                            value={multipleCostCenterUpdateValues.CostCategory}
                            styles={customSelectStyles}
                            options={costTypes
                                .filter(
                                    (costType) =>
                                        !["Broker", "Transport"].some((keyword) => String(costType?.Cost_Category).includes(keyword))
                                )
                                .map((costType) => ({
                                    value: costType.Cost_Category_Id,
                                    label: costType.Cost_Category,
                                }))}
                            onChange={(e) => setMultipleCostCenterUpdateValues((prev) => ({ ...prev, CostCategory: e }))}
                            placeholder="Select Cost Category"
                            filterOption={reactSelectFilterLogic}
                            menuPortalTarget={document.body}
                        />
                    </div>

                    <div className="py-2">
                        <label>Staff</label>
                        <Select
                            value={multipleCostCenterUpdateValues.involvedStaffs}
                            isMulti
                            styles={customSelectStyles}
                            options={costCenterData}
                            onChange={(e) => setMultipleCostCenterUpdateValues((prev) => ({ ...prev, involvedStaffs: e }))}
                            placeholder="Select Staff"
                            filterOption={reactSelectFilterLogic}
                            menuPortalTarget={document.body}
                            closeMenuOnSelect={false}
                        />
                    </div>

                    <div className="py-2">
                        <label>Status</label>
                        <select
                            className="cus-inpt p-1"
                            onChange={e => setMultipleCostCenterUpdateValues(pre => ({ ...pre, deliveryStatus: e.target.value }))}
                            value={multipleCostCenterUpdateValues.deliveryStatus}
                        >
                            <option value="New">New</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Canceled">Canceled</option>
                        </select>
                    </div>

                    <div className="py-2">
                        <input
                            className="form-check-input shadow-none pointer mx-2"
                            style={{ padding: "0.7em" }}
                            type="checkbox"
                            id="removeFromListUpdate"
                            checked={isEqualNumber(multipleCostCenterUpdateValues.staffInvolvedStatus, 1)}
                            onChange={() => {
                                setMultipleCostCenterUpdateValues((pre) => ({
                                    ...pre,
                                    staffInvolvedStatus: isEqualNumber(pre.staffInvolvedStatus, 1) ? 0 : 1,
                                }));
                            }}
                        />
                        <label htmlFor="removeFromListUpdate" className="fw-bold">
                            Remove from this page
                        </label>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseMultipleUpdateCostCategoryDialog} variant="outlined">
                        Close
                    </Button>
                    <Button variant="contained" onClick={postMultipleCostCenterUpdate} disabled={!saveMultipleProcessingValidation}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Multiple Staff Remove Dialog */}
            <Dialog
                open={filters.multipleStaffRemoveDialog}
                onClose={onCloseMultipleStaffRemoveDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Remove Staff from Cost Category</DialogTitle>
                <DialogContent>
                    <div className="py-2">
                        <label>Cost Category to Remove</label>
                        <Select
                            value={multipleStaffRemoveValues.CostCategory}
                            styles={customSelectStyles}
                            options={costTypes
                                .filter(
                                    (costType) =>
                                        !["Broker", "Transport"].some((keyword) => String(costType?.Cost_Category).includes(keyword))
                                )
                                .map((costType) => ({
                                    value: costType.Cost_Category_Id,
                                    label: costType.Cost_Category,
                                }))}
                            onChange={(e) => setMultipleStaffRemoveValues((prev) => ({ ...prev, CostCategory: e }))}
                            placeholder="Select Cost Category to Remove"
                            filterOption={reactSelectFilterLogic}
                            menuPortalTarget={document.body}
                        />
                    </div>

                    <div className="py-2">
                        <label>Status</label>
                        <select
                            className="cus-inpt p-1"
                            onChange={e => setMultipleStaffRemoveValues(pre => ({ ...pre, deliveryStatus: e.target.value }))}
                            value={multipleStaffRemoveValues.deliveryStatus}
                        >
                            <option value="New">New</option>
                            <option value="Processing">Processing</option>
                            <option value="Completed">Completed</option>
                            <option value="Canceled">Canceled</option>
                        </select>
                    </div>

                    <div className="py-2">
                        <input
                            className="form-check-input shadow-none pointer mx-2"
                            style={{ padding: "0.7em" }}
                            type="checkbox"
                            id="removeFromListRemove"
                            checked={isEqualNumber(multipleStaffRemoveValues.staffInvolvedStatus, 1)}
                            onChange={() => {
                                setMultipleStaffRemoveValues((pre) => ({
                                    ...pre,
                                    staffInvolvedStatus: isEqualNumber(pre.staffInvolvedStatus, 1) ? 0 : 1,
                                }));
                            }}
                        />
                        <label htmlFor="removeFromListRemove" className="fw-bold">
                            Remove from this page
                        </label>
                    </div>

                    <div className="py-2 text-muted">
                        <small>
                            This will remove all staff members of the selected Cost Category from {multipleStaffRemoveValues.PR_Id.length} selected records.
                        </small>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseMultipleStaffRemoveDialog} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={postMultipleStaffRemove}
                        disabled={!removeMultipleProcessingValidation}
                    >
                        Remove Staff
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ProcessingListLRReport;
