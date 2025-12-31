import { useState, useEffect, useMemo } from "react";
import { checkIsNumber, isEqualNumber, ISOString, LocalDate, toArray, toNumber } from "../../../Components/functions";
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
    FormControl,
    MenuItem
} from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { reactSelectFilterLogic } from "../../../Components/functions";
import { CheckBox, CheckBoxOutlineBlank, FilterAlt, PersonAdd, Print, Search } from "@mui/icons-material";
import { toast } from "react-toastify";
import BillOfSupplyA5 from "./SalesInvoicePrint/A5printOut";
import KatchathCopy from "./KatchathCopy/katchathCopy";
import InvoiceCard from "./SalesInvoicePrint/SalesInvoicePrint";
import InvoiceTemplate from "./SalesInvPrint/invTemplate";
import DeliverysSlipPrint from "./deliverySlipPrint" 


const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const multipleStaffUpdateInitialValues = {
    CostCategory: { label: "", value: "" },
    Do_Id: [],
    involvedStaffs: [],
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

    const [multipleCostCenterUpdateValues, setMultipleCostCenterUpdateValues] = useState(
        multipleStaffUpdateInitialValues
    );

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

    
    const [deliverySlipPrint,setDeliverySlipPrint]=useState({
          Do_Id: null,
        Do_Date: null,
        open: false
    })

    const [filters, setFilters] = useState({
        // reqDate: ISOString(),
        reqDate: "2025-12-24",
        assignDialog: false,
        filterDialog: false,
        selectedInvoice: null,
        multipleStaffUpdateDialog: false,
        fetchTrigger: 0,
         docType: "",    
    });

    const [multiPrint, setMultiPrint] = useState({
  open: false,
  doIds: [],
  docType: ""
});



    const columns = useMemo(
        () => [
            { Field_Name: "Do_Inv_No", Fied_Data: "string", ColumnHeader: "Invoice" },
            { Field_Name: "voucherTypeGet", Fied_Data: "string", ColumnHeader: "Voucher" },
            { Field_Name: "retailerNameGet", Fied_Data: "string", ColumnHeader: "Customer" },
        ],
        []
    );

    useEffect(() => {
        fetchLink({
            address: `sales/salesInvoice/lrReport?reqDate=${filters.reqDate}`,
            loadingOn,
            loadingOff,
        })
            .then((data) => {
                setSalesInvoices(toArray(data.data));
                setCostTypes(toArray(data?.others?.costTypes));
                setUniqueInvolvedCost(toArray(data?.others?.uniqeInvolvedStaffs));
            })
            .catch(console.error);
    }, [filters.fetchTrigger, loadingOn, loadingOff]);

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
   const onCloseDeliverySlipDialog=()=>setDeliverySlipPrint((prev)=>({Do_Id:null,Do_Date:null,open:false}))    
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

    const saveMultipleInvoiceValidation = useMemo(() => {
        const validDoId = multipleCostCenterUpdateValues.Do_Id.length > 0;
        const validCostCenterId = multipleCostCenterUpdateValues.involvedStaffs.length > 0;
        const validCostCategory =
            checkIsNumber(multipleCostCenterUpdateValues.CostCategory.value) &&
            !isEqualNumber(multipleCostCenterUpdateValues.CostCategory.value, 0);

        return validDoId && validCostCenterId && validCostCategory;
    }, [multipleCostCenterUpdateValues]);

    return (
        <>
            <FilterableTable
                title={"Sales Invoice: " + LocalDate(filters.reqDate)}
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
{/* <FormControl size="small" sx={{ minWidth: 160 }}>
  <Select
    value={filters.docType}
    displayEmpty
    disabled={!multipleCostCenterUpdateValues.Do_Id.length}
    onChange={(e) =>
      setFilters((prev) => ({ ...prev, docType: e.target.value }))
    }
    MenuProps={{
      disablePortal: true,
      PaperProps: {
        sx: {
          zIndex: 9999,
        },
      },
    }}
  >
    <MenuItem value="">
      <em>Select Type</em>
    </MenuItem>
    <MenuItem value="sales_invoice">Sales Invoice</MenuItem>
    <MenuItem value="katchath">Katchath</MenuItem>
    <MenuItem value="delivery_slip">Delivery Slip</MenuItem>
  </Select>
</FormControl> */}



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

<Dialog
  open={multiPrint.open}
  onClose={() => setMultiPrint({ open: false, doIds: [], docType: "" })}
  maxWidth="lg"
  fullWidth
>
  {/* <DialogTitle>Multiple Print Preview</DialogTitle> */}

  <DialogContent>
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
  </DialogActions>
</Dialog>


<Dialog
  open={multiPrint.open}
  onClose={() => setMultiPrint({ open: false, doIds: [], docType: "" })}
  maxWidth="lg"
//   fullWidth
//   fullScreen={true} // Optional: make it fullscreen for better view
>
  {/* <DialogTitle> */}
    {/* Multiple Print Preview - {multiPrint.doIds.length} {filters.docTypeLabel || multiPrint.docType} */}
  {/* </DialogTitle> */}

  <DialogContent dividers>
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
  </DialogContent>

  <DialogActions className="no-print">
    <Button
      variant="contained"
      onClick={() => window.print()}
      startIcon={<Print />}
    >
      Print All
    </Button>
    <Button
      variant="outlined"
      onClick={() => setMultiPrint({ open: false, doIds: [], docType: "" })}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>

        </>
    );
};

export default SalesInvoiceListLRReport;
