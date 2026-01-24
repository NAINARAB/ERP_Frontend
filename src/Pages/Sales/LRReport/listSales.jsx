import { useState, useEffect, useMemo, useRef } from "react";
import { checkIsNumber, isEqualNumber, ISOString, LocalDate, toArray, toNumber, RoundNumber } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
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
import { customSelectStyles } from "../../../Components/tablecolumn";
import { reactSelectFilterLogic } from "../../../Components/functions";
import { CheckBox, CheckBoxOutlineBlank, FilterAlt, PersonAdd, Print, Search } from "@mui/icons-material";
import { toast } from "react-toastify";
import KatchathCopy from "./KatchathCopy/katchathCopy";
import InvoiceTemplate from "./SalesInvPrint/invTemplate";
import DeliverysSlipPrint from "./deliverySlipPrint"
import { useReactToPrint } from "react-to-print";

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const multipleStaffUpdateInitialValues = {
    CostCategory: { label: "", value: "" },
    Do_Id: [],
    involvedStaffs: [],
    staffInvolvedStatus: 0,
    deliveryStatus: 5,
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

const getCostTypeEmployees = (invoiceOrRow, costTypeId) => {
    const invoiceEmployee = toArray(invoiceOrRow?.involvedStaffs);
    return invoiceEmployee
        .filter((emp) => isEqualNumber(emp.Emp_Type_Id, costTypeId))
        .map((emp) => String(emp.Emp_Name ?? "").trim())
        .filter(Boolean);
};

const SalesInvoiceListLRReport = ({ loadingOn, loadingOff, AddRights, EditRights, PrintRights, pageID }) => {
    const [salesInvoices, setSalesInvoices] = useState([]);
    const [costCenterData, setCostCenterData] = useState([]);
    const [costTypes, setCostTypes] = useState([]);
    const [uniqueInvolvedCost, setUniqueInvolvedCost] = useState([]);
    const [currentPrintType, setCurrentPrintType] = useState('');
    const [selectAllCheckBox, setSelectAllCheckBox] = useState(false);

    const [multipleCostCenterUpdateValues, setMultipleCostCenterUpdateValues] = useState(
        multipleStaffUpdateInitialValues
    );

    const [printReady, setPrintReady] = useState(false);
    const [columnFilters, setColumnFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);

    const [printInvoice, setPrintInvoice] = useState({
        Do_Id: null,
        Do_Date: null,
        open: false
    })

    const [katchathCopyPrint, setKatchathCopyPrint] = useState({
        Do_Id: null,
        open: false,
    })

    const [deliverySlipPrint, setDeliverySlipPrint] = useState({
        Do_Id: null,
        Do_Date: null,
        open: false
    })

    const [filters, setFilters] = useState({
        reqDate: ISOString(),
        // reqDate: "2025-12-24",
        assignDialog: false,
        filterDialog: false,
        selectedInvoice: null,
        multipleStaffUpdateDialog: false,
        fetchTrigger: 0,
        docType: "",
        staffStatus: 0,
    });

    const [multiPrint, setMultiPrint] = useState({
        open: false,
        doIds: [],
        docType: ""
    });

    const multiPrintRef = useRef(null);

    const columns = useMemo(
        () => [
            { Field_Name: "Do_Inv_No", Fied_Data: "string", ColumnHeader: "Invoice" },
            { Field_Name: "voucherTypeGet", Fied_Data: "string", ColumnHeader: "Voucher" },
            { Field_Name: "retailerNameGet", Fied_Data: "string", ColumnHeader: "Customer" },
        ],
        []
    );

    const calculateAltActQty = (item) => {

        if (item.Alt_Act_Qty !== undefined && item.Alt_Act_Qty !== null) {
            return Number(item.Alt_Act_Qty) || 0;
        }


        const billQty = Number(item.Bill_Qty) || 0;
        const conversionFactor = Number(item.PackValue) || 1;

        const possibleAltFields = ['AltQty', 'Alt_Act_Qty', 'Alt_Qty', 'Alternate_Qty', 'Actual_Qty'];

        for (const field of possibleAltFields) {
            if (item[field] !== undefined && item[field] !== null) {
                return Number(item[field]) || 0;
            }
        }


        return billQty * conversionFactor;
    };

    useEffect(() => {
        if (multiPrint.open) {

            const timer = setTimeout(() => {
                if (multiPrintRef.current) {
                    setPrintReady(true);
                }
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setPrintReady(false);
        }
    }, [multiPrint.open, multiPrint.doIds, multiPrint.docType]);

    const selectedTotals = useMemo(() => {
        const selectedIds = multipleCostCenterUpdateValues.Do_Id;

        if (!selectedIds.length) {
            return { billQty: 0, altActQty: 0 };
        }

        let billQty = 0;
        let altActQty = 0;

        salesInvoices
            .filter(inv => selectedIds.includes(toNumber(inv.Do_Id)))
            .forEach(inv => {
                if (Array.isArray(inv.stockDetails)) {
                    inv.stockDetails.forEach(item => {
                        billQty += Number(item.Bill_Qty) || 0;
                        altActQty += Number(item.Alt_Act_Qty) || 0;
                    });
                }
            });

        return { billQty, altActQty };
    }, [multipleCostCenterUpdateValues.Do_Id, salesInvoices]);

    useEffect(() => {
        fetchLink({
            address: `sales/salesInvoice/lrReport?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`,
            loadingOn,
            loadingOff,
        })
            .then((data) => {
                const invoices = toArray(data.data);

                // Process each invoice to ensure Alt_Act_Qty is available
                const processedInvoices = invoices.map(invoice => {
                    if (invoice.stockDetails && Array.isArray(invoice.stockDetails)) {
                        const processedStockDetails = invoice.stockDetails.map(item => ({
                            ...item,

                            Alt_Act_Qty: calculateAltActQty(item)
                        }));

                        return {
                            ...invoice,
                            stockDetails: processedStockDetails
                        };
                    }
                    return invoice;
                });
                setSalesInvoices(toArray(data.data));
                setCostTypes(toArray(data?.others?.costTypes));
                setUniqueInvolvedCost(toArray(data?.others?.uniqeInvolvedStaffs));
            })
            .catch(console.error);
    }, [filters.fetchTrigger, filters.staffStatus]);

    useEffect(() => {
        fetchLink({ address: "masters/erpCostCenter/dropDown" })
            .then((data) => setCostCenterData(toArray(data.data)))
            .catch(console.error);
    }, []);

    const costTypeColumns = useMemo(() => {
        return costTypes
            .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
            // .filter(
            //     (costType) =>
            //         !["Broker", "Transport"].some((keyword) => String(costType?.Cost_Category).includes(keyword))
            // )
            .map((costType) => {
                const field = `costType_${toNumber(costType.Cost_Category_Id)}`;

                return {
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
                };
            });
    }, [costTypes, uniqueInvolvedCost]);

    const filterColumns = useMemo(() => [...columns, ...costTypeColumns], [columns, costTypeColumns]);

    const fetchSalesInvoices = () => setFilters((pre) => ({ ...pre, fetchTrigger: pre.fetchTrigger + 1 }));

    const onCloseAssignDialog = () =>
        setFilters((prev) => ({ ...prev, assignDialog: false, selectedInvoice: null }));

    const onCloseFilterDialog = () => setFilters((prev) => ({ ...prev, filterDialog: false }));

    const onCloseMultipleUpdateCostCategoryDialog = () => {
        setMultipleCostCenterUpdateValues(multipleStaffUpdateInitialValues);
        setFilters((prev) => ({ ...prev, multipleStaffUpdateDialog: false }));
    };

    const onClosePrintDialog = () => setPrintInvoice((prev) => ({ Do_Id: null, Do_Date: null, open: false }));

    const onCloseKatchathDialog = () => setKatchathCopyPrint((prev) => ({ Do_Id: null, open: false }));
    const onCloseDeliverySlipDialog = () => setDeliverySlipPrint((prev) => ({ Do_Id: null, Do_Date: null, open: false }))
    const onChangeEmployee = (invoice, selectedOptions, costType) => {
        setFilters((prev) => {
            const updatedInvolvedStaffs = toArray(prev.selectedInvoice?.involvedStaffs)
                .filter((emp) => !isEqualNumber(emp.Emp_Type_Id, costType.Cost_Category_Id))
                .concat(selectedOptions);

            return {
                ...prev,
                selectedInvoice: {
                    ...invoice,
                    involvedStaffs: updatedInvolvedStaffs,
                },
            };
        });
    };

    const postAssignCostCenters = async (e) => {
        e.preventDefault();
        fetchLink({
            address: "sales/salesInvoice/lrReport",
            method: "POST",
            bodyData: {
                Do_Id: filters.selectedInvoice?.Do_Id,
                involvedStaffs: filters.selectedInvoice?.involvedStaffs,
                staffInvolvedStatus: toNumber(filters.selectedInvoice?.staffInvolvedStatus),
            },
            loadingOn,
            loadingOff,
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data.message);
                    onCloseAssignDialog();
                    fetchSalesInvoices();
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e2) => console.log(e2));
    };

    const postMultipleCostCenterUpdate = async () => {
        fetchLink({
            address: "sales/salesInvoice/lrReport/multiple",
            method: "POST",
            bodyData: {
                CostCategory: toNumber(multipleCostCenterUpdateValues.CostCategory.value),
                Do_Id: multipleCostCenterUpdateValues.Do_Id,
                involvedStaffs: multipleCostCenterUpdateValues.involvedStaffs.map((option) => toNumber(option.value)),
                staffInvolvedStatus: toNumber(multipleCostCenterUpdateValues.staffInvolvedStatus),
                deliveryStatus: toNumber(multipleCostCenterUpdateValues.deliveryStatus),
            },
            loadingOn,
            loadingOff,
        }).then((data) => {
            if (data.success) {
                toast.success(data.message);
                onCloseMultipleUpdateCostCategoryDialog();
                fetchSalesInvoices();
            } else {
                toast.error(data.message);
            }
        }).catch((e) => console.log(e));
    };

    useEffect(() => {
        applyFilters();
    }, [columnFilters, salesInvoices, filterColumns]);

    const handleFilterChange = (column, value) => {
        setColumnFilters((prevFilters) => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const applyFilters = () => {
        let filtered = [...salesInvoices];

        for (const column of filterColumns) {
            const key = column.Field_Name;
            const filterVal = columnFilters[key];
            if (!filterVal) continue;

            // number range
            if (filterVal.type === "range") {
                const { min, max } = filterVal;
                filtered = filtered.filter((item) => {
                    const value = item[key];
                    return (min === undefined || value >= min) && (max === undefined || value <= max);
                });
                continue;
            }

            // date
            if (filterVal.type === "date") {
                const { start, end } = filterVal.value || {};
                filtered = filtered.filter((item) => {
                    const dateValue = new Date(item[key]);
                    return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
                });
                continue;
            }

            // string multi-select
            if (Array.isArray(filterVal)) {
                const selected = filterVal.map(normalize).filter(Boolean);
                if (!selected.length) continue;

                if (typeof column.getFilterValues === "function") {
                    // computed columns (costType_*)
                    filtered = filtered.filter((item) => {
                        const rowVals = (column.getFilterValues(item) || []).map(normalize).filter(Boolean);
                        return selected.some((v) => rowVals.includes(v));
                    });
                } else {
                    // normal row field
                    filtered = filtered.filter((item) => selected.includes(normalize(item[key])));
                }
            }
        }

        setFilteredData(filtered);
    };

    const handleMultiPrint = useReactToPrint({
        content: () => multiPrintRef.current,
        documentTitle: "Multiple Documents",
        pageStyle: currentPrintType === 'delivery_slip' ? `
        @page {
            margin: 0.7cm 0 0 0;
            size: auto;
        }
        html, body {
            margin: 0;
            padding: 0;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        @media print {
            body > * {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            .no-print {
                display: none !important;
            }
        }
    ` : currentPrintType === 'sales_invoice' ? `
        @page {
            size: A5 landscape;
            margin: 0;
        }
        html, body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        @media print {
            body > * {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            .no-print {
                display: none !important;
            }
        }
    ` : currentPrintType === 'katchath' ? `
        @page {
            margin: 0.6cm;
            size: auto;
        }
        html, body {
            margin: 0;
            padding: 0;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        @media print {
            body > * {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            .no-print {
                display: none !important;
            }
        }
    ` : `
        @page {
            margin: 0.6cm;
            size: auto;
        }
        html, body {
            margin: 0;
            padding: 0;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        @media print {
            body > * {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            .no-print {
                display: none !important;
            }
        }
    `,
    });

    const renderFilter = (column) => {
        const { Field_Name, Fied_Data, ColumnHeader } = column;

        if (Fied_Data === "number") {
            return (
                <div className="d-flex justify-content-between px-2">
                    <input
                        placeholder="Min"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.min ?? ""}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: "range",
                                ...columnFilters[Field_Name],
                                min: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                        }
                    />
                    <input
                        placeholder="Max"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.max ?? ""}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: "range",
                                ...columnFilters[Field_Name],
                                max: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                        }
                    />
                </div>
            );
        }

        if (Fied_Data === "date") {
            return (
                <div className="d-flex justify-content-between px-2">
                    <input
                        placeholder="Start Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.value?.start ?? ""}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: "date",
                                value: { ...columnFilters[Field_Name]?.value, start: e.target.value || undefined },
                            })
                        }
                    />
                    <input
                        placeholder="End Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.value?.end ?? ""}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: "date",
                                value: { ...columnFilters[Field_Name]?.value, end: e.target.value || undefined },
                            })
                        }
                    />
                </div>
            );
        }

        if (Fied_Data === "string") {
            const rawValues =
                typeof column.getFilterValues === "function"
                    ? salesInvoices.flatMap((item) => column.getFilterValues(item) || [])
                    : salesInvoices.map((item) => item[Field_Name]);

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
            const allDoIds = filteredData.map(item => toNumber(item.Do_Id));
            setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: allDoIds }));
        } else {
            setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: [] }));
        }
    }, [selectAllCheckBox, filteredData])

    const saveMultipleInvoiceValidation = useMemo(() => {
        const validDoId = multipleCostCenterUpdateValues.Do_Id.length > 0;
        const validCostCenterId = multipleCostCenterUpdateValues.involvedStaffs.length > 0;
        const validCostCategory =
            checkIsNumber(multipleCostCenterUpdateValues.CostCategory.value) &&
            !isEqualNumber(multipleCostCenterUpdateValues.CostCategory.value, 0);

        if (!validDoId) return false;
        if (validCostCenterId && !validCostCategory) return false;
        if (!validCostCenterId && validCostCategory) return false;
        return true;
    }, [multipleCostCenterUpdateValues]);

    return (
        <>
            <FilterableTable
                title={"Sales Invoice"}
                columns={[
                    {
                        Field_Name: "Select",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(toNumber(row.Do_Id));
                            return (
                                <Checkbox
                                    checked={isSelected}
                                    onChange={() => {
                                        if (isSelected) {
                                            setMultipleCostCenterUpdateValues((prev) => ({
                                                ...prev,
                                                Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.Do_Id)),
                                            }));
                                        } else {
                                            setMultipleCostCenterUpdateValues((prev) => ({
                                                ...prev,
                                                Do_Id: [...prev.Do_Id, toNumber(row.Do_Id)],
                                            }));
                                        }
                                    }}
                                />
                            );
                        },

                    },
                    createCol("Do_Inv_No", "string", "Invoice"),
                    createCol("createdOn", "time", "Created"),
                    createCol("voucherTypeGet", "string", "Voucher"),
                    createCol("retailerNameGet", "string", "Customer"),
                    {
                        Field_Name: "BillQty",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            if (row.stockDetails && row.stockDetails.length > 0) {
                                return row.stockDetails.reduce((sum, item) =>
                                    sum + (Number(item.Bill_Qty) || 0), 0
                                );
                            }
                            return 0;
                        },
                    },
                    {
                        Field_Name: "AltActQty",
                        ColumnHeader: "Alt Act Qty",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) =>
                            RoundNumber(toArray(row.stockDetails).reduce(
                                (s, i) => s + toNumber(i.Alt_Act_Qty),
                                0
                            ))
                    },
                    createCol("Narration", "string", "Narration"),
                    ...costTypeColumns,
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
                                            onclick: () => setFilters((prev) => ({ ...prev, assignDialog: true, selectedInvoice: row })),
                                            icon: <PersonAdd fontSize="small" color="primary" />,
                                            disabled: !AddRights && !EditRights,
                                        },
                                        {
                                            name: "Print Invoice",
                                            onclick: () => {
                                                setPrintInvoice({ Do_Id: row.Do_Id, Do_Date: row.Do_Date, open: true })
                                            },
                                            icon: <Print fontSize="small" color="primary" />,
                                            disabled: !PrintRights,
                                        },
                                        {
                                            name: "Delivery Slip",
                                            onclick: () => {

                                                setDeliverySlipPrint({ Do_Id: row.Do_Id, Do_Date: row.Do_Date, open: true })
                                            },
                                            icon: <Print fontSize="small" color="primary" />,
                                            disabled: !PrintRights,
                                        },
                                        {
                                            name: "Katchath Copy",
                                            onclick: () => {
                                                setKatchathCopyPrint({ Do_Id: row.Do_Id, open: true })
                                            },
                                            icon: <Print fontSize="small" color="primary" />,
                                            disabled: !PrintRights,
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
                            onClick={() => setFilters((prev) => ({ ...prev, multipleStaffUpdateDialog: true }))}
                            disabled={!multipleCostCenterUpdateValues.Do_Id.length}
                        >
                            <PersonAdd fontSize="small" />
                        </IconButton>

                        <IconButton size="small" onClick={() => setFilters((prev) => ({ ...prev, filterDialog: true }))}>
                            <FilterAlt />
                        </IconButton>

                        <IconButton size="small" onClick={fetchSalesInvoices}>
                            <Search />
                        </IconButton>

                        <input
                            type="date"
                            className="cus-inpt w-auto"
                            value={filters.reqDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, reqDate: e.target.value }))}
                        />

                        <IconButton
                            size="small"
                            disabled={
                                !filters.docType || !multipleCostCenterUpdateValues.Do_Id.length
                            }

                            onClick={() => {
                                setCurrentPrintType(filters.docType);
                                setMultiPrint({
                                    open: true,
                                    doIds: multipleCostCenterUpdateValues.Do_Id,
                                    docType: filters.docType
                                });
                            }}
                        >
                            <Print />
                        </IconButton>

                        <select
                            className="cus-inpt w-auto rounded-5 border-0"
                            disabled={!multipleCostCenterUpdateValues.Do_Id.length}
                            value={filters.docType}
                            onChange={(e) => {
                                const selectedIndex = e.target.selectedIndex;
                                const selectedText = e.target.options[selectedIndex].text;

                                setFilters((prev) => ({
                                    ...prev,
                                    docType: e.target.value,
                                    docTypeLabel: selectedText,
                                }));
                            }}
                        >
                            <option value="">SELECT TYPE</option>
                            <option value="sales_invoice">SALES INVOICE</option>
                            <option value="katchath">KATCHATH</option>
                            <option value="delivery_slip">DELIVERY SLIP</option>
                        </select>

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
                            <option value="1">ALL INVOICES</option>
                            <option value="0">INCOMPLETED INVOICES</option>
                        </select>

                        {multipleCostCenterUpdateValues.Do_Id.length > 0 && (
                            <div className="d-flex gap-4 mb-0 p-0">

                                <div>
                                    <strong>Total Bill Qty:</strong>{" "}
                                    {selectedTotals.billQty}
                                </div>
                                <div>
                                    <strong>Total Alt Act Qty:</strong>{" "}
                                    {selectedTotals.altActQty}
                                </div>
                            </div>
                        )}
                    </>
                }
            />

            {/* Assign dialog */}
            <Dialog open={filters.assignDialog} onClose={onCloseAssignDialog} maxWidth="lg" fullWidth>
                <DialogTitle>
                    Assign Cost Centers: <span className="text-primary">{filters.selectedInvoice?.Do_Inv_No}</span>
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
                                    const invoiceEmployee = toArray(filters.selectedInvoice?.involvedStaffs);
                                    const empCostType = invoiceEmployee
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
                                                        Do_Id: filters?.selectedInvoice?.Do_Id,
                                                        Emp_Id: option.value,
                                                        Emp_Name: option.label,
                                                        Emp_Type_Id: costType.Cost_Category_Id,
                                                        Involved_Emp_Type: costType.Cost_Category,
                                                    }));
                                                    onChangeEmployee(filters.selectedInvoice, values, costType);
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
                                    checked={isEqualNumber(filters.selectedInvoice?.staffInvolvedStatus, 1)}
                                    onChange={() => {
                                        setFilters((pre) => ({
                                            ...pre,
                                            selectedInvoice: {
                                                ...pre.selectedInvoice,
                                                staffInvolvedStatus: isEqualNumber(pre.selectedInvoice?.staffInvolvedStatus, 1) ? 0 : 1,
                                            },
                                        }));
                                    }}
                                />
                                <label htmlFor="removeFromList" className="fw-bold">
                                    Remove invoice from this page
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
                        <label>Delivery Status</label>
                        <select
                            className="cus-inpt p-1"
                            onChange={e => setMultipleCostCenterUpdateValues(pre => ({ ...pre, deliveryStatus: e.target.value }))}
                            value={multipleCostCenterUpdateValues.deliveryStatus}
                        >
                            <option value={5}>Pending</option>
                            <option value={7}>Delivered</option>
                            <option value={6}>Return</option>
                        </select>
                    </div>

                    <div className="py-2">
                        <input
                            className="form-check-input shadow-none pointer mx-2"
                            style={{ padding: "0.7em" }}
                            type="checkbox"
                            id="removeFromList"
                            checked={isEqualNumber(multipleCostCenterUpdateValues.staffInvolvedStatus, 1)}
                            onChange={() => {
                                setMultipleCostCenterUpdateValues((pre) => ({
                                    ...pre,
                                    staffInvolvedStatus: isEqualNumber(pre.staffInvolvedStatus, 1) ? 0 : 1,
                                }));
                            }}
                        />
                        <label htmlFor="removeFromList" className="fw-bold">
                            Remove invoice from this page
                        </label>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseMultipleUpdateCostCategoryDialog} variant="outlined">
                        Close
                    </Button>
                    <Button variant="contained" onClick={postMultipleCostCenterUpdate} disabled={!saveMultipleInvoiceValidation}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* bill print dialog */}
            <Dialog
                open={printInvoice.open}
                onClose={onClosePrintDialog}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Bill Print Preview</DialogTitle>
                <DialogContent>
                    <InvoiceTemplate
                        Do_Id={printInvoice.Do_Id}
                        Do_Date={printInvoice.Do_Date}
                        loadingOn={loadingOn}
                        loadingOff={loadingOff}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={onClosePrintDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* katchathCopyPrint */}
            <Dialog
                open={katchathCopyPrint.open}
                onClose={onCloseKatchathDialog}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Bill Print Preview</DialogTitle>
                <DialogContent>
                    <KatchathCopy
                        Do_Id={katchathCopyPrint.Do_Id}
                        loadingOn={loadingOn}
                        loadingOff={loadingOff}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={onCloseKatchathDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* delivery slip dialog */}
            <Dialog
                open={deliverySlipPrint.open}
                onClose={onCloseDeliverySlipDialog}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Delivery Slip Preview</DialogTitle>
                <DialogContent>
                    <DeliverysSlipPrint
                        Do_Id={deliverySlipPrint.Do_Id}
                        loadingOn={loadingOn}
                        loadingOff={loadingOff}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={onCloseDeliverySlipDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* multiple print dialog */}
            {/* <Dialog
                open={multiPrint.open}
                onClose={() => setMultiPrint({ open: false, doIds: [], docType: "" })}
                maxWidth="lg"
                fullWidth
            >
                {/* <DialogTitle>Multiple Print Preview</DialogTitle> */}

            {/* <DialogContent>
                    {multiPrint.doIds.map((id) => {
                        if (multiPrint.docType === "sales_invoice") {
                            return (
                                <InvoiceTemplate
                                    key={id}
                                    Do_Id={id}
                                    loadingOn={loadingOn}
                                    loadingOff={loadingOff}
                                />
                            );
                        }

                        if (multiPrint.docType === "katchath") {
                            return (
                                <KatchathCopy
                                    key={id}
                                    Do_Id={id}
                                    loadingOn={loadingOn}
                                    loadingOff={loadingOff}
                                />
                            );
                        }

                        if (multiPrint.docType === "delivery_slip") {
                            return (
                                <DeliverysSlipPrint
                                    key={id}
                                    Do_Id={id}
                                    loadingOn={loadingOn}
                                    loadingOff={loadingOff}
                                />
                            );
                        }

                        return null;
                    })}
                </DialogContent>

                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={() =>
                            setMultiPrint({ open: false, doIds: [], docType: "" })
                        }
                    >
                        Close
                    </Button>
                </DialogActions> */}
            {/* </Dialog> */}

            <Dialog
                open={multiPrint.open}
                onClose={() => setMultiPrint({ open: false, doIds: [], docType: "" })}
                maxWidth="lg"
                fullWidth
            >
                <DialogContent dividers>
                    <div ref={multiPrintRef}>

                        {multiPrint.docType === "sales_invoice" && (
                            <InvoiceTemplate
                                Do_Ids={multiPrint.doIds}
                                loadingOn={loadingOn}
                                loadingOff={loadingOff}
                                isCombinedPrint={true}
                            />
                        )}

                        {multiPrint.docType === "katchath" && (
                            <KatchathCopy
                                Do_Ids={multiPrint.doIds}
                                loadingOn={loadingOn}
                                loadingOff={loadingOff}
                                isCombinedPrint={true}
                            />
                        )}

                        {multiPrint.docType === "delivery_slip" && (
                            <DeliverysSlipPrint
                                Do_Ids={multiPrint.doIds}
                                loadingOn={loadingOn}
                                loadingOff={loadingOff}
                                isCombinedPrint={true}
                            />
                        )}

                    </div>
                </DialogContent>

                <DialogActions className="no-print">
                    <Button
                        variant="contained"
                        onClick={() => { handleMultiPrint() }}
                        startIcon={<Print />}
                    >
                        Print All
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() =>
                            setMultiPrint({ open: false, doIds: [], docType: "" })
                        }
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

        </>
    );
};

export default SalesInvoiceListLRReport;
