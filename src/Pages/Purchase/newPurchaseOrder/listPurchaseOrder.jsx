import { useState, useEffect } from "react";
import { Button, Dialog, Tooltip, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import {
    getSessionFiltersByPageId, ISOString,
    isValidNumber, LocalDate, NumberFormat, reactSelectFilterLogic,
    setSessionFilters, toArray, toNumber,
} from "../../../Components/functions";
import { Add, Edit, FilterAlt, Search, Print } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";
import AppTableComponent from "../../../Components/appTable/appTableComponent";
import { useNavigate } from "react-router-dom";
import { ButtonActions } from "../../../Components/MenuButton";
import PurchaseOrderPrintout from "./purchaseOrderPrintout";

const createCol = (field = '', type = 'string', ColumnHeader = '', align = 'left', verticalAlign = 'center', isVisible = 1) => ({
    isVisible: isVisible,
    Field_Name: field,
    Fied_Data: type,
    align,
    verticalAlign,
    ...(ColumnHeader && { ColumnHeader })
});

const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
    Retailer: { value: "", label: "ALL" },
    CreatedBy: { value: "", label: "ALL" },
    VoucherType: { value: "", label: "ALL" },
};

const ListPurchaseOrder = ({ loadingOn, loadingOff, AddRights, pageID }) => {
    const [filterVersion, setFilterVersion] = useState(0);
    const storage = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [baseData, setBaseData] = useState({
        retailers: [],
        users: [],
        voucher: [],
    });

    const [filters, setFilters] = useState(defaultFilters);

    const [dialog, setDialog] = useState({
        filters: false,
    });
    
    const [printPO, setPrintPO] = useState(null);

    useEffect(() => {
        const otherSessionFilter = getSessionFiltersByPageId(pageID);
        const {
            Fromdate,
            Todate,
            Retailer = defaultFilters.Retailer,
            CreatedBy = defaultFilters.CreatedBy,
            VoucherType = defaultFilters.VoucherType,
        } = otherSessionFilter;

        setFilters((pre) => ({
            ...pre,
            Fromdate,
            Todate,
            Retailer,
            CreatedBy,
            VoucherType,
        }));
    }, [filterVersion, pageID]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (loadingOn) loadingOn();
                const [
                    retailersRes,
                    usersRes,
                    voucherRes,
                ] = await Promise.all([
                    fetchLink({ address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}` }),
                    fetchLink({ address: `masters/user/dropDown?Company_id=${storage?.Company_id}` }),
                    fetchLink({ address: `masters/voucher` }),
                ]);

                setBaseData({
                    retailers: retailersRes.success ? retailersRes.data : [],
                    users: usersRes.success ? usersRes.data : [],
                    voucher: voucherRes.success ? voucherRes.data : [],
                });
            } catch (e) {
                console.error("Error fetching data:", e);
            } finally {
                if (loadingOff) loadingOff();
            }
        };

        fetchData();
    }, []);

    const fetchPurchaseOrders = () => {
        const otherSessionFilter = getSessionFiltersByPageId(pageID);
        const {
            Fromdate,
            Todate,
            Retailer = defaultFilters.Retailer,
            CreatedBy = defaultFilters.CreatedBy,
            VoucherType = defaultFilters.VoucherType,
        } = otherSessionFilter;

        let queryParams = [
            `Fromdate=${Fromdate}`,
            `Todate=${Todate}`,
        ];

        if (isValidNumber(Retailer.value)) queryParams.push(`Retailer_Id=${Retailer.value}`);
        if (isValidNumber(CreatedBy.value)) queryParams.push(`Created_by=${CreatedBy.value}`);
        if (isValidNumber(VoucherType.value)) queryParams.push(`VoucherType=${VoucherType.value}`);

        fetchLink({
            address: `purchase/purchaseOrderEntry?${queryParams.join('&')}`,
            loadingOn,
            loadingOff,
        }).then((data) => {
            if (data.success) {
                setPurchaseOrders(data?.data);
            } else {
                setPurchaseOrders([]);
            }
        }).catch((e) => console.error(e));
    };

    useEffect(() => {
        fetchPurchaseOrders();
    }, [filterVersion, pageID]);

    const ExpendableComponent = ({ row }) => {
        const orderProducts = toArray(row?.Products_List);
        const staffInvolved = toArray(row?.Staff_Involved_List);

        const renderParameterValue = (param) => {
            const type = String(param.parameterDataType).toLowerCase();
            const val1 = param.ParameterValueOne;
            const val2 = param.ParameterValueTwo;

            if (type === 'number') {
                if (val1 && val2 && val1 === val2) {
                    return val1;
                }
                return `Min: ${val1 || 0} - Max: ${val2 || 0}`;
            } else if (type === 'date') {
                if (val1 && val2 && val1 === val2) {
                    return LocalDate(val1);
                }
                return `Start: ${LocalDate(val1)} - End: ${LocalDate(val2)}`;
            } else {
                return val1 || 'N/A';
            }
        };

        return (
            <div className="p-4 bg-light border-top">
                {/* General Information Header */}
                <div className="card shadow-sm border-0 mb-3">
                    <div className="card-body py-2 px-3">
                        <div className="row g-3 text-dark fa-13">
                            <div className="col-md-3 col-sm-6">
                                <span className="text-muted d-block fa-11 uppercase fw-semibold">Vendor</span>
                                <span className="fw-bold text-primary">{row?.Retailer_Name || 'N/A'}</span>
                            </div>
                            <div className="col-md-2 col-sm-6">
                                <span className="text-muted d-block fa-11 uppercase fw-semibold">Branch</span>
                                <span className="fw-semibold">{row?.Branch_Name || 'N/A'}</span>
                            </div>
                            <div className="col-md-2 col-sm-6">
                                <span className="text-muted d-block fa-11 uppercase fw-semibold">Voucher Type</span>
                                <span className="fw-semibold text-uppercase">{row?.VoucherTypeGet || 'N/A'}</span>
                            </div>
                            <div className="col-md-2 col-sm-6">
                                <span className="text-muted d-block fa-11 uppercase fw-semibold">PO Date</span>
                                <span className="fw-semibold">{LocalDate(row?.Po_Date)}</span>
                            </div>
                            <div className="col-md-3 col-sm-6">
                                <span className="text-muted d-block fa-11 uppercase fw-semibold">GST Mode</span>
                                <span className="fw-semibold badge bg-white text-dark border px-2 py-1 rounded">
                                    {row?.GST_Inclusive === 1 ? 'Inclusive' : 'Exclusive'} | {row?.IS_IGST === 1 ? 'IGST' : 'CGST/SGST'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-3">
                    {/* Left Panel: Products Table */}
                    <div className="col-lg-9">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white border-bottom-0 pt-3 pb-0">
                                <h6 className="fw-bold text-primary mb-0">Order Products</h6>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover align-middle mb-0 fa-13">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '40px' }}>#</th>
                                                <th>Product Details</th>
                                                <th style={{ width: '100px' }}>HSN</th>
                                                <th className="text-end" style={{ width: '80px' }}>Qty</th>
                                                <th className="text-end" style={{ width: '100px' }}>Rate</th>
                                                <th className="text-end" style={{ width: '120px' }}>Taxable Amt</th>
                                                <th className="text-end" style={{ width: '80px' }}>Tax %</th>
                                                <th className="text-end" style={{ width: '150px' }}>Tax Amt</th>
                                                <th className="text-end" style={{ width: '120px' }}>Final Amt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderProducts.map((prod, i) => {
                                                const cgst = toNumber(prod.Cgst_Amo);
                                                const sgst = toNumber(prod.Sgst_Amo);
                                                const igst = toNumber(prod.Igst_Amo);
                                                const totalTax = cgst + sgst + igst;
                                                return (
                                                    <tr key={i}>
                                                        <td>{i + 1}</td>
                                                        <td>
                                                            <span className="fw-semibold text-dark d-block" title={prod.Product_Name}>
                                                                {prod.Product_Name || 'N/A'}
                                                            </span>
                                                            {(prod.BrandGet || prod.Unit_Name) && (
                                                                <span className="text-muted fa-11 d-block">
                                                                    {prod.BrandGet && `Brand: ${prod.BrandGet}`}
                                                                    {prod.BrandGet && prod.Unit_Name && ' | '}
                                                                    {prod.Unit_Name && `UOM: ${prod.Unit_Name}`}
                                                                </span>
                                                            )}
                                                            {toArray(prod.parameters).length > 0 && (
                                                                <div className="mt-1 d-flex flex-wrap gap-1 align-items-center">
                                                                    {prod.parameters.map((p, pIdx) => (
                                                                        <span key={pIdx} className="badge bg-light text-dark border px-2 py-0.5 rounded fa-11" style={{ fontSize: '11px', backgroundColor: '#f8f9fa', color: '#495057', border: '1px solid #dee2e6' }}>
                                                                            <span className="fw-bold text-secondary">{p.parameterNameGet || 'Parameter'}: </span>
                                                                            {renderParameterValue(p)}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>{prod.HSN_Code || '-'}</td>
                                                        <td className="text-end fw-bold">{toNumber(prod.Bill_Qty)}</td>
                                                        <td className="text-end">₹{NumberFormat(prod.Item_Rate)}</td>
                                                        <td className="text-end">₹{NumberFormat(prod.Taxable_Amount)}</td>
                                                        <td className="text-end">{toNumber(prod.Tax_Rate)}%</td>
                                                        <td className="text-end fa-11">
                                                            {totalTax > 0 ? (
                                                                row.IS_IGST === 1 ? (
                                                                    <span>₹{NumberFormat(totalTax)} <span className="text-muted">(IGST)</span></span>
                                                                ) : (
                                                                    <div className="lh-sm">
                                                                        <div>₹{NumberFormat(cgst)} <span className="text-muted">(CGST)</span></div>
                                                                        <div>₹{NumberFormat(sgst)} <span className="text-muted">(SGST)</span></div>
                                                                    </div>
                                                                )
                                                            ) : (
                                                                '₹0.00'
                                                            )}
                                                        </td>
                                                        <td className="text-end fw-bold text-primary">₹{NumberFormat(prod.Final_Amo)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Invoice Totals & Staff */}
                    <div className="col-lg-3 d-flex flex-column gap-3">
                        {/* Totals Card */}
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom-0 pt-3 pb-0">
                                <h6 className="fw-bold text-primary mb-0">Invoice Summary</h6>
                            </div>
                            <div className="card-body py-3 fa-13">
                                <div className="d-flex justify-content-between mb-2 pb-1 border-bottom">
                                    <span className="text-muted">Sub Total</span>
                                    <span className="fw-semibold">₹{NumberFormat(row?.Total_Before_Tax)}</span>
                                </div>
                                {row?.IS_IGST === 1 ? (
                                    <div className="d-flex justify-content-between mb-2 pb-1 border-bottom">
                                        <span className="text-muted">IGST Total</span>
                                        <span className="fw-semibold">₹{NumberFormat(row?.IGST_Total)}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="d-flex justify-content-between mb-2 pb-1 border-bottom">
                                            <span className="text-muted">CGST Total</span>
                                            <span className="fw-semibold">₹{NumberFormat(row?.CSGT_Total)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2 pb-1 border-bottom">
                                            <span className="text-muted">SGST Total</span>
                                            <span className="fw-semibold">₹{NumberFormat(row?.SGST_Total)}</span>
                                        </div>
                                    </>
                                )}
                                <div className="d-flex justify-content-between mb-2 pb-1 border-bottom">
                                    <span className="text-muted">Total Tax</span>
                                    <span className="fw-semibold">₹{NumberFormat(row?.Total_Tax)}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2 pb-1 border-bottom">
                                    <span className="text-muted">Round Off</span>
                                    <span className="fw-semibold">₹{NumberFormat(row?.Round_off)}</span>
                                </div>
                                <div className="d-flex justify-content-between pt-1">
                                    <span className="fw-bold text-primary">Invoice Value</span>
                                    <span className="fw-bold text-primary fa-15">₹{NumberFormat(row?.Total_Invoice_value)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Staff Involved Card */}
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom-0 pt-3 pb-0">
                                <h6 className="fw-bold text-primary mb-0">Staff Involved</h6>
                            </div>
                            <div className="card-body py-2">
                                {staffInvolved.length === 0 ? (
                                    <div className="text-muted fst-italic py-3 text-center fa-12">No staff assigned.</div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="table table-sm table-hover align-middle mb-0 fa-12">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Type</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {staffInvolved.map((staff, i) => (
                                                    <tr key={i}>
                                                        <td>{staff.EmpName || 'N/A'}</td>
                                                        <td>{staff.EmpType || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Narration Card */}
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white border-bottom-0 pt-3 pb-0">
                                <h6 className="fw-bold text-primary mb-0">Narration / Remarks</h6>
                            </div>
                            <div className="card-body py-2 fa-12">
                                <p className="mb-0 text-muted fst-italic">
                                    {row?.Narration || 'No narration provided.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const closeDialog = () => {
        setDialog({ ...dialog, filters: false });
    };

    return (
        <>
            <AppTableComponent
                title="Purchase Orders"
                dataArray={purchaseOrders}
                EnableSerialNumber
                columns={[
                    createCol("Po_Date", "date", "Date"),
                    createCol("Po_Inv_No", "string", "PO Number"),
                    createCol("Retailer_Name", "string", "Vendor"),
                    createCol("VoucherTypeGet", "string", "Voucher"),
                    createCol("Total_Invoice_value", "number", "Invoice Value"),
                    {
                        ColumnHeader: "Status",
                        isVisible: 1,
                        align: "center",
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const status = toNumber(row?.Po_Status);
                            let className = "bg-light text-dark";
                            if (status === 1) className = "bg-info text-white";
                            if (status === 2) className = "bg-warning text-white";
                            if (status === 3) className = "bg-success text-white";
                            if (status === 0) className = "bg-danger text-white";

                            return (
                                <span className={`py-0 fw-bold px-2 rounded-4 fa-12 ${className}`}>
                                    {row.statusGet}
                                </span>
                            );
                        },
                    },
                    createCol("Created_BY_Name", "string", "Created By"),
                    {
                        Field_Name: "Action",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            return (
                                <ButtonActions
                                    buttonsData={[
                                        {
                                            name: "Edit Order",
                                            icon: <Edit className="fa-16" />,
                                            onclick: () => {
                                                navigate("create", {
                                                    state: {
                                                        ...row,
                                                        isEdit: true,
                                                    },
                                                })
                                            }
                                        },
                                        {
                                            name: "Print Order",
                                            icon: <Print className="fa-16" />,
                                            onclick: () => setPrintPO(row?.PO_Id)
                                        },
                                    ]}
                                />
                            )
                        },
                    },
                ]}
                ButtonArea={
                    <>
                        {AddRights && (
                            <Button
                                variant="outlined"
                                startIcon={<Add />}
                                onClick={() => navigate("create")}
                            >
                                {"New"}
                            </Button>
                        )}

                        <Tooltip title="Filters">
                            <IconButton
                                size="small"
                                onClick={() => setDialog({ ...dialog, filters: true })}
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                    </>
                }
                isExpendable={true}
                tableMaxHeight={550}
                expandableComp={(props) => (
                    <ExpendableComponent {...props} />
                )}
            />

            <Dialog open={dialog.filters} onClose={closeDialog} fullWidth maxWidth="sm">
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={(e) =>
                                                setFilters({ ...filters, Fromdate: e.target.value })
                                            }
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={(e) =>
                                                setFilters({ ...filters, Todate: e.target.value })
                                            }
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Vendor</td>
                                    <td>
                                        <Select
                                            value={filters?.Retailer}
                                            onChange={(e) => setFilters({ ...filters, Retailer: e })}
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...baseData.retailers.map((obj) => ({
                                                    value: obj?.Retailer_Id,
                                                    label: obj?.Retailer_Name,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Vendor Name"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Created By</td>
                                    <td>
                                        <Select
                                            value={filters?.CreatedBy}
                                            onChange={(e) =>
                                                setFilters((pre) => ({ ...pre, CreatedBy: e }))
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...baseData.users.map((obj) => ({
                                                    value: obj?.UserId,
                                                    label: obj?.Name,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Created By"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Voucher</td>
                                    <td>
                                        <Select
                                            value={filters?.VoucherType}
                                            onChange={(e) => setFilters({ ...filters, VoucherType: e })}
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...baseData.voucher
                                                    .filter((obj) => obj.Type === "PURCHASE")
                                                    .map((obj) => ({
                                                        value: obj?.Vocher_Type_Id,
                                                        label: obj?.Voucher_Type,
                                                    })),
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Voucher Name"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>close</Button>
                    <Button
                        onClick={() => {
                            closeDialog();
                            setSessionFilters({
                                Fromdate: filters?.Fromdate,
                                Todate: filters.Todate,
                                pageID,
                                Retailer: filters.Retailer,
                                CreatedBy: filters.CreatedBy,
                                VoucherType: filters.VoucherType,
                            });
                            setFilterVersion(v => v + 1);
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >
                        Search
                    </Button>
                </DialogActions>
            </Dialog>

            <PurchaseOrderPrintout
                open={Boolean(printPO)}
                onClose={() => setPrintPO(null)}
                poId={printPO}
            />
        </>
    );
};

export default ListPurchaseOrder;
