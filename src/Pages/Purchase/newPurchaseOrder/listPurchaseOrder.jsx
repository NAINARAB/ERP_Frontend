import { useState, useEffect, useMemo } from "react";
import { Button, Dialog, Tooltip, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import {
    getSessionFiltersByPageId, ISOString,
    isValidNumber, LocalDate, Multiplication, NumberFormat, reactSelectFilterLogic,
    setSessionFilters, toArray, toNumber, Addition, isEqualNumber, stringCompare
} from "../../../Components/functions";
import { Add, Edit, FilterAlt, Search, Print, Receipt } from "@mui/icons-material";
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
    Cancel_status: '',
    OrderStatus: { value: "", label: "ALL" },
    ConvertStatus: { value: "", label: "ALL" },
    TripStatus: { value: "", label: "ALL" },
    PaidStatus: { value: "", label: "ALL" },
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
            Cancel_status = defaultFilters.Cancel_status,
            OrderStatus = defaultFilters.OrderStatus,
            ConvertStatus = defaultFilters.ConvertStatus,
            TripStatus = defaultFilters.TripStatus,
            PaidStatus = defaultFilters.PaidStatus,
        } = otherSessionFilter;

        setFilters((pre) => ({
            ...pre,
            Fromdate,
            Todate,
            Retailer,
            CreatedBy,
            VoucherType,
            Cancel_status,
            OrderStatus,
            ConvertStatus,
            TripStatus,
            PaidStatus,
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
        const invoices = toArray(row?.ConvertedInvoice);
        const orderProducts = toArray(row?.Products_List);

        return (
            <div className="p-3 bg-light border-top">
                <div className="row g-3">
                    {/* Left Column: Original Order Products */}
                    <div className="col-lg-6">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white border-bottom-0 pt-3">
                                <h6 className="fw-bold text-primary mb-0">Original Order Products</h6>
                            </div>
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover align-middle mb-0 fa-13">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Product Name</th>
                                                <th className="text-end">Qty</th>
                                                <th className="text-end">Billed</th>
                                                <th className="text-end">Pending</th>
                                                <th className="text-end">Rate</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderProducts.map((prod, i) => {
                                                const ordered = toNumber(prod.Bill_Qty);
                                                const billed = toNumber(prod.convertedQuantity);
                                                const pending = ordered - billed;
                                                return (
                                                    <tr key={i}>
                                                        <td className="fw-semibold text-truncate" style={{ maxWidth: '180px' }} title={prod.Product_Name || prod.Item_Name}>
                                                            {prod.Product_Name || prod.Item_Name}
                                                        </td>
                                                        <td className="text-end fw-bold text-dark">{ordered}</td>
                                                        <td className="text-end fw-bold text-success">{billed}</td>
                                                        <td className={`text-end fw-bold ${pending > 0 ? 'text-warning' : 'text-muted'}`}>
                                                            {pending > 0 ? pending : 0}
                                                        </td>
                                                        <td className="text-end">₹{NumberFormat(prod.Item_Rate)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Invoices & Conversion Details */}
                    <div className="col-lg-6">
                        <div className="card shadow-sm border-0 h-100">
                            <div className="card-header bg-white border-bottom-0 pt-3">
                                <h6 className="fw-bold text-primary mb-0">Conversion Details</h6>
                            </div>
                            <div className="card-body">
                                {invoices.length === 0 ? (
                                    <div className="text-muted fst-italic py-4 text-center">No invoices generated yet.</div>
                                ) : (
                                    <div className="d-flex flex-column gap-3" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                                        {invoices.map((inv, index) => (
                                            <div key={index} className="card border shadow-none bg-white">
                                                <div className="card-header bg-light border-0 d-flex justify-content-between align-items-center py-2">
                                                    <div>
                                                        <span className="fw-bold text-dark me-2 fa-13">{inv.invNumber}</span>
                                                        <span className="badge bg-success fa-11">{inv.deliveryStatusGet || 'Delivered'}</span>
                                                    </div>
                                                    <div className="fw-bold text-success fa-13">
                                                        ₹{NumberFormat(inv.invValue)}
                                                    </div>
                                                </div>
                                                <div className="card-body p-2 row g-2">
                                                    {/* Invoice Products */}
                                                    <div className="col-12 border-bottom pb-2">
                                                        <h6 className="text-muted fa-11 text-uppercase mb-1 fw-bold">Invoice Products</h6>
                                                        {toArray(inv.invoicedProduct).map((prod, i) => (
                                                            <div key={i} className="d-flex justify-content-between fa-12 mb-1">
                                                                <span className="text-truncate me-2" style={{ maxWidth: '220px' }} title={prod.productNameGet}>{prod.productNameGet}</span>
                                                                <span className="fw-bold">{prod.quantity} x ₹{prod.itemRate}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Trip Details & Receipt Details Side-by-Side */}
                                                    <div className="col-6 border-end pt-1">
                                                        <h6 className="text-muted fa-11 text-uppercase mb-1 fw-bold">Trip Sheet</h6>
                                                        {toArray(inv.tripDetails).length === 0 ? (
                                                            <span className="fa-12 text-muted">No Trip Assigned</span>
                                                        ) : toArray(inv.tripDetails).map((trip, i) => (
                                                            <div key={i} className="fa-12">
                                                                <div className="fw-bold">Trip #{trip.tripNumber}</div>
                                                                <div className="text-muted">{LocalDate(trip.tripDate)}</div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="col-6 pt-1">
                                                        <h6 className="text-muted fa-11 text-uppercase mb-1 fw-bold">Payments</h6>
                                                        {toArray(inv.receiptInfo).length === 0 ? (
                                                            <span className="fa-12 text-muted">Unpaid</span>
                                                        ) : toArray(inv.receiptInfo).map((rec, i) => (
                                                            <div key={i} className="fa-12 d-flex justify-content-between">
                                                                <span className="text-truncate me-1">#{rec.receiptNumber}</span>
                                                                <span className="fw-bold text-success">₹{NumberFormat(rec.receiptAmount)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    
                                                    <div className="col-12 pt-1 border-top mt-2">
                                                        <h6 className="text-muted fa-11 text-uppercase mb-1 fw-bold">Debit Notes</h6>
                                                        {toArray(inv.creditNoteInfo).length === 0 ? (
                                                            <span className="fa-12 text-muted">None</span>
                                                        ) : toArray(inv.creditNoteInfo).map((cn, i) => (
                                                            <div key={i} className="fa-12 d-flex justify-content-between">
                                                                <span className="text-truncate me-1">#{cn.creditNoteNumber}</span>
                                                                <span className="fw-bold text-danger">₹{NumberFormat(cn.TotalValue)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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

    const filteredPurchaseOrders = useMemo(() => {
        return purchaseOrders.filter(row => {
            let isValid = true;

            if (filters.OrderStatus?.value) {
                const statusStr = row?.statusGet || '';
                if (statusStr !== filters.OrderStatus.value) isValid = false;
            }

            if (isValid && filters.ConvertStatus?.value) {
                const products = toArray(row?.Products_List);
                const totalBillQty = products.reduce((acc, item) => Addition(acc, item.Bill_Qty), 0);
                const totalConvertedQty = products.reduce((acc, item) => Addition(acc, item.convertedQuantity), 0);

                let status = "Pending";
                if (totalConvertedQty > 0) {
                    if (totalConvertedQty >= totalBillQty) {
                        status = "Converted";
                    } else {
                        status = "Partially";
                    }
                }
                if (status !== filters.ConvertStatus.value) isValid = false;
            }

            if (isValid && filters.TripStatus?.value) {
                const convertedInvoice = toArray(row?.ConvertedInvoice);
                const isAssigned = convertedInvoice.some(
                    inv => toArray(inv?.tripDetails).length > 0
                ) || toArray(row?.tripDetails).length > 0;
                let status = isAssigned ? 'Assigned' : 'Pending';
                if (status !== filters.TripStatus.value) isValid = false;
            }

            if (isValid && filters.PaidStatus?.value) {
                const convertedInvoice = toArray(row?.ConvertedInvoice);
                const paidAmount = convertedInvoice.reduce((sum, inv) => {
                    const receipts = toArray(inv?.receiptInfo);
                    const invPaid = receipts.reduce((invSum, r) => Addition(invSum, r?.receiptAmount), 0);
                    return Addition(sum, invPaid);
                }, 0);
                
                let status = "Unpaid";
                if (paidAmount > 0) {
                    if (paidAmount >= Number(row?.Total_Invoice_value)) {
                        status = "Fully Paid";
                    } else {
                        status = "Partially Paid";
                    }
                }
                if (status !== filters.PaidStatus.value) isValid = false;
            }

            return isValid;
        });
    }, [purchaseOrders, filters.OrderStatus, filters.ConvertStatus, filters.TripStatus, filters.PaidStatus]);

    return (
        <>
            <AppTableComponent
                title="Purchase Orders"
                dataArray={filteredPurchaseOrders}
                EnableSerialNumber
                columns={[
                    createCol("Po_Date", "date", "Date"),
                    createCol("Po_Inv_No", "string", "PO Number"),
                    createCol("Retailer_Name", "string", "Vendor"),
                    createCol("VoucherTypeGet", "string", "Voucher"),
                    createCol("Total_Invoice_value", "number", "Invoice Value"),
                    {
                        ColumnHeader: "Order Status",
                        Field_Name: 'OrderStatus',
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
                    {
                        ColumnHeader: "Convert Status",
                        Field_Name: 'invoiceStatus',
                        isVisible: 1,
                        align: "center",
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const products = toArray(row?.Products_List);
                            const totalBillQty = products.reduce((acc, item) => Addition(acc, item.Bill_Qty), 0);
                            const totalConvertedQty = products.reduce((acc, item) => Addition(acc, item.convertedQuantity), 0);

                            let status = "Pending";
                            let className = "bg-primary text-white";

                            if (totalConvertedQty > 0) {
                                if (totalConvertedQty >= totalBillQty) {
                                    status = "Converted";
                                    className = "bg-success text-white";
                                } else {
                                    status = "Partially";
                                    className = "bg-warning text-dark";
                                }
                            }

                            return (
                                <span className={`py-0 fw-bold px-2 rounded-4 fa-12 ${className}`}>
                                    {status}
                                </span>
                            );
                        },
                    },
                    {
                        ColumnHeader: "Trip Status",
                        Field_Name: 'tripStatus',
                        isVisible: 1,
                        align: "center",
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const convertedInvoice = toArray(row?.ConvertedInvoice);
                            const isAssigned = convertedInvoice.some(
                                inv => toArray(inv?.tripDetails).length > 0
                            ) || toArray(row?.tripDetails).length > 0;
                            return (
                                <span className={`py-0 fw-bold px-2 rounded-4 fa-12 ${isAssigned ? 'bg-success text-white' : 'bg-secondary text-white'}`}>
                                    {isAssigned ? 'Assigned' : 'Pending'}
                                </span>
                            );
                        },
                    },
                    {
                        ColumnHeader: "Paid Amount",
                        isVisible: 1,
                        align: "center",
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const convertedInvoice = toArray(row?.ConvertedInvoice);
                            const paidAmount = convertedInvoice.reduce((sum, inv) => {
                                const receipts = toArray(inv?.receiptInfo);
                                const invPaid = receipts.reduce((invSum, r) => Addition(invSum, r?.receiptAmount), 0);
                                return Addition(sum, invPaid);
                            }, 0);
                            return (
                                <span className="fw-bold text-success">
                                    ₹{paidAmount}
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
                                        {
                                            name: "Create Invoice",
                                            icon: <Receipt className="fa-16" />,
                                            onclick: () => {
                                                navigate('/erp/purchase/invoice/create', {
                                                    state: {
                                                        invoiceInfo: {
                                                            Branch_Id: row?.Branch_Id,
                                                            Po_Inv_Date: ISOString(),
                                                            Po_Entry_Date: ISOString(),
                                                            Retailer_Id: row?.Retailer_Id,
                                                            Retailer_Name: row?.Retailer_Name,
                                                            isFromPurchaseOrder: true
                                                        },
                                                        orderInfo: toArray(row?.Products_List).filter(
                                                            fil => toNumber(fil.pendingInvoiceWeight) > 0
                                                        ).map((item, iIndex) => ({
                                                            S_No: iIndex + 1,
                                                            OrderId: item?.PO_Id,
                                                            Location_Id: item?.Godown_Id,
                                                            Item_Id: item?.Item_Id,
                                                            Item_Name: item?.Product_Name || 'not found',
                                                            Product_Name: item?.Product_Name || 'not found',
                                                            Bill_Qty: item?.pendingInvoiceWeight,
                                                            Act_Qty: item?.Bill_Qty,
                                                            Bill_Alt_Qty: item?.Bill_Qty,
                                                            Unit_Id: item?.Unit_Id,
                                                            Unit_Name: item?.Unit_Name,
                                                            Item_Rate: item?.Item_Rate,
                                                            Amount: Multiplication(item?.Item_Rate, item?.pendingInvoiceWeight),
                                                            Free_Qty: 0,
                                                        })),
                                                        staffInfo: toArray(row?.Staff_Involved_List).map(staff => ({
                                                            Involved_Emp_Id: Number(staff.Emp_Id),
                                                            Involved_Emp_Name: staff.EmpName,
                                                            Cost_Center_Type_Id: Number(staff.Emp_Type_Id),
                                                        }))
                                                    }
                                                })
                                            },
                                            disabled: toArray(row?.Products_List).filter(
                                                fil => toNumber(fil.pendingInvoiceWeight) > 0
                                            ).length === 0
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
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Order Status</td>
                                    <td>
                                        <Select
                                            value={filters?.OrderStatus}
                                            onChange={(e) => setFilters({ ...filters, OrderStatus: e })}
                                            options={[
                                                { value: "", label: "ALL" },
                                                { value: "New", label: "New" },
                                                { value: "Processing", label: "Processing" },
                                                { value: "Completed", label: "Completed" },
                                                { value: "Cancelled", label: "Cancelled" },
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={false}
                                            placeholder={"Order Status"}
                                            filterOption={reactSelectFilterLogic}
                                            menuPortalTarget={document.body}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Convert Status</td>
                                    <td>
                                        <Select
                                            value={filters?.ConvertStatus}
                                            onChange={(e) => setFilters({ ...filters, ConvertStatus: e })}
                                            options={[
                                                { value: "", label: "ALL" },
                                                { value: "Pending", label: "Pending" },
                                                { value: "Partially", label: "Partially" },
                                                { value: "Converted", label: "Converted" },
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={false}
                                            placeholder={"Convert Status"}
                                            filterOption={reactSelectFilterLogic}
                                            menuPortalTarget={document.body}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Trip Status</td>
                                    <td>
                                        <Select
                                            value={filters?.TripStatus}
                                            onChange={(e) => setFilters({ ...filters, TripStatus: e })}
                                            options={[
                                                { value: "", label: "ALL" },
                                                { value: "Assigned", label: "Assigned" },
                                                { value: "Pending", label: "Pending" },
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={false}
                                            placeholder={"Trip Status"}
                                            filterOption={reactSelectFilterLogic}
                                            menuPortalTarget={document.body}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Paid Amount</td>
                                    <td>
                                        <Select
                                            value={filters?.PaidStatus}
                                            onChange={(e) => setFilters({ ...filters, PaidStatus: e })}
                                            options={[
                                                { value: "", label: "ALL" },
                                                { value: "Fully Paid", label: "Fully Paid" },
                                                { value: "Partially Paid", label: "Partially Paid" },
                                                { value: "Unpaid", label: "Unpaid" },
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={false}
                                            placeholder={"Paid Amount Status"}
                                            filterOption={reactSelectFilterLogic}
                                            menuPortalTarget={document.body}
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
                                Cancel_status: filters.Cancel_status,
                                OrderStatus: filters.OrderStatus,
                                ConvertStatus: filters.ConvertStatus,
                                TripStatus: filters.TripStatus,
                                PaidStatus: filters.PaidStatus,
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
