import { useState, useEffect, useMemo } from "react";
import { Button, Dialog, Tooltip, IconButton, DialogTitle, DialogContent, DialogActions, Checkbox } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import {
    Addition, Division, getSessionFiltersByPageId, isEqualNumber, ISOString, isValidNumber, LocalDate, NumberFormat, reactSelectFilterLogic, setSessionFilters, toArray, toNumber,
} from "../../../Components/functions";
import InvoiceBillTemplate from "../SalesReportComponent/newInvoiceTemplate";
import SaleOrderInvoicePrint from "../SalesReportComponent/SaleOrderInvoicePrint";
import InvoicePrintPreview from "./invoicePrintPreview";
import { Add, Edit, FilterAlt, Print, ReceiptLong, Search, Visibility } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";
import AppTableComponent from "../../../Components/appTable/appTableComponent";
import { useNavigate } from "react-router-dom";
import { ButtonActions } from "../../../Components/MenuButton";
import AlterHistoryTable from "../../../Components/alterHistoryTable";
import BulkInvoiceConvertDialog from "./BulkInvoiceConvertDialog";

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
    SalesPerson: { value: "", label: "ALL" },
    VoucherType: { value: "", label: "ALL" },
    Cancel_status: '',
    OrderStatus: { value: "", label: "ALL" },
};

const SaleOrderList = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
    const [filterVersion, setFilterVersion] = useState(0);
    const storage = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const [saleOrders, setSaleOrders] = useState([]);
    const [baseData, setBaseData] = useState({
        retailers: [],
        salesPerson: [],
        users: [],
        voucher: [],
        products: [],
        godowns: [],
        stockItemLedgers: [],
    });
    const [viewOrder, setViewOrder] = useState({});
    const [selectedOrders, setSelectedOrders] = useState([]);

    const [filters, setFilters] = useState(defaultFilters);

    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
        bulkConvert: false,
        printInvoice: false,
    });
    const [printOrderRow, setPrintOrderRow] = useState(null);

    useEffect(() => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate,
            Todate,
            Retailer = defaultFilters.Retailer,
            CreatedBy = defaultFilters.CreatedBy,
            SalesPerson = defaultFilters.SalesPerson,
            VoucherType = defaultFilters.VoucherType,
            Cancel_status = defaultFilters.Cancel_status,
            OrderStatus = defaultFilters.OrderStatus,
        } = otherSessionFiler;

        setFilters((pre) => ({
            ...pre,
            Fromdate,
            Todate,
            Retailer,
            CreatedBy,
            SalesPerson,
            VoucherType,
            Cancel_status,
            OrderStatus,
        }));
    }, [filterVersion, pageID]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (loadingOn) loadingOn();
                const [
                    retailersRes,
                    salesPersonRes,
                    usersRes,
                    voucherRes,
                    productsRes,
                    godownRes,
                    ledgerRes
                ] = await Promise.all([
                    fetchLink({ address: `sales/saleOrder/retailers` }),
                    fetchLink({ address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}` }),
                    fetchLink({ address: `masters/user/dropDown?Company_id=${storage?.Company_id}` }),
                    fetchLink({ address: `masters/voucher` }),
                    fetchLink({ address: `masters/products` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                    fetchLink({ address: `purchase/stockItemLedgerName?type=SALES` })
                ]);

                setBaseData({
                    retailers: retailersRes.success ? retailersRes.data : [],
                    salesPerson: salesPersonRes.success ? salesPersonRes.data : [],
                    users: usersRes.success ? usersRes.data : [],
                    voucher: voucherRes.success ? voucherRes.data : [],
                    products: productsRes.success ? productsRes.data : [],
                    godowns: godownRes.success ? godownRes.data : [],
                    stockItemLedgers: ledgerRes.success ? ledgerRes.data : [],
                });
            } catch (e) {
                console.error("Error fetching data:", e);
            } finally {
                if (loadingOff) loadingOff();
            }
        };

        fetchData();
    }, []);

    const fetchSaleOrders = () => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate,
            Todate,
            Retailer = defaultFilters.Retailer,
            CreatedBy = defaultFilters.CreatedBy,
            SalesPerson = defaultFilters.SalesPerson,
            VoucherType = defaultFilters.VoucherType,
            Cancel_status = defaultFilters.Cancel_status,
            OrderStatus = defaultFilters.OrderStatus,
        } = otherSessionFiler;

        let queryParams = [
            `Fromdate=${Fromdate}`,
            `Todate=${Todate}`,
            `Cancel_status=${Cancel_status}`
        ];

        if (isValidNumber(Retailer.value)) queryParams.push(`Retailer_Id=${Retailer.value}`);
        if (isValidNumber(SalesPerson.value)) queryParams.push(`Sales_Person_Id=${SalesPerson.value}`);
        if (isValidNumber(CreatedBy.value)) queryParams.push(`Created_by=${CreatedBy.value}`);
        if (isValidNumber(VoucherType.value)) queryParams.push(`VoucherType=${VoucherType.value}`);

        if (OrderStatus?.value) {
            queryParams.push(`OrderStatus=${OrderStatus.value}`);
        }

        fetchLink({
            address: `sales/saleOrder?${queryParams.join('&')}`,
            loadingOn,
            loadingOff,
        }).then((data) => {
            if (data.success) {
                setSaleOrders(data?.data);
            }
        }).catch((e) => console.error(e));
    };

    useEffect(() => {
        fetchSaleOrders();
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
                                                                <span className="fw-bold">{prod.quantity} x ₹{prod.rate}</span>
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
                                                        <h6 className="text-muted fa-11 text-uppercase mb-1 fw-bold">Receipts</h6>
                                                        {toArray(inv.receiptInfo).length === 0 ? (
                                                            <span className="fa-12 text-muted">Unpaid</span>
                                                        ) : toArray(inv.receiptInfo).map((rec, i) => (
                                                            <div key={i} className="fa-12 d-flex justify-content-between">
                                                                <span className="text-truncate me-1">#{rec.receiptNumber}</span>
                                                                <span className="fw-bold text-success">₹{NumberFormat(rec.receiptAmount)}</span>
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

                <div className="mt-4">
                    <AlterHistoryTable alterationHistory={row.alterHistoryDetails} />
                </div>
            </div>
        );
    };

    const closeDialog = () => {
        setDialog({
            ...dialog,
            filters: false,
            orderDetails: false,
        });
    };

    const Total_Invoice_value = useMemo(
        () =>
            saleOrders.reduce(
                (acc, orders) => Addition(acc, orders?.Total_Invoice_value),
                0
            ),
        [saleOrders]
    );

    const convertToSalesInvoice = (saleOrder) => {
        const productsList = toArray(saleOrder?.Products_List);

        const invoiceProducts = productsList.map((item, index) => {
            const productMaster = baseData.products.find(
                p => isEqualNumber(p.Product_Id, item.Item_Id)
            ) || {};
            const pack = toNumber(productMaster?.PackGet) || 1;
            const billQty = toNumber(item.Bill_Qty);
            const altBillQty = Division(billQty, pack);

            return {
                S_No: index + 1,
                Item_Id: item.Item_Id,
                Item_Name: item.Product_Name || productMaster?.Product_Name || '',
                HSN_Code: item.HSN_Code || '',
                GoDown_Id: item.GoDown_Id || '',
                Bill_Qty: billQty,
                Alt_Bill_Qty: altBillQty,
                Act_Qty: billQty,
                Alt_Act_Qty: altBillQty,
                Free_Qty: toNumber(item.Free_Qty),
                Total_Qty: billQty,
                Item_Rate: toNumber(item.Item_Rate),
                Taxable_Rate: toNumber(item.Taxable_Rate),
                Amount: toNumber(item.Amount),
                Unit_Id: item.Unit_Id || '',
                Unit_Name: item.Unit_Name || productMaster?.Units || '',
                Taxble: item.Taxble,
                Taxable_Amount: toNumber(item.Taxable_Amount),
                Tax_Rate: toNumber(item.Tax_Rate),
                Cgst: toNumber(item.Cgst),
                Cgst_Amo: toNumber(item.Cgst_Amo),
                Sgst: toNumber(item.Sgst),
                Sgst_Amo: toNumber(item.Sgst_Amo),
                Igst: toNumber(item.Igst),
                Igst_Amo: toNumber(item.Igst_Amo),
                Final_Amo: toNumber(item.Final_Amo),
            };
        });

        const invoicePayload = {
            Do_Date: ISOString(),
            Retailer_Id: saleOrder.Retailer_Id,
            Retailer_Name: saleOrder.Retailer_Name,
            Branch_Id: saleOrder.Branch_Id,
            GST_Inclusive: saleOrder.GST_Inclusive,
            IS_IGST: saleOrder.IS_IGST,
            Narration: saleOrder.Narration || '',
            So_No: saleOrder.So_Id,
            Sales_Person_Id: saleOrder.Sales_Person_Id,
            Products_List: invoiceProducts,
            Staffs_Array: toArray(saleOrder?.Staff_Involved_List).map(staff => ({
                Emp_Id: staff.Involved_Emp_Id,
                Emp_Name: staff.EmpName,
                Emp_Type_Id: staff.Cost_Center_Type_Id
            })),
            Expence_Array: [],
        };

        navigate('/erp/sales/invoice/create', {
            state: invoicePayload,
        });
    };

    const selectableOrders = useMemo(() => {
        return saleOrders.filter(order => {
            if (toNumber(order?.Cancel_status) === 0) return false;
            const products = toArray(order?.Products_List);
            const canConvert = products.some(item => toNumber(item.convertedQuantity) < toNumber(item.Bill_Qty));
            const hasInvoices = toArray(order?.ConvertedInvoice).length > 0;
            return canConvert || hasInvoices;
        });
    }, [saleOrders]);

    const printableSelected = useMemo(
        () => selectedOrders.filter(o => toArray(o?.ConvertedInvoice).length > 0),
        [selectedOrders]
    );

    const convertibleSelected = useMemo(
        () => selectedOrders.filter(o => {
            const products = toArray(o?.Products_List);
            return toNumber(o?.Cancel_status) !== 0 && products.some(
                item => toNumber(item.convertedQuantity) < toNumber(item.Bill_Qty)
            );
        }),
        [selectedOrders]
    );

    return (
        <>
            <AppTableComponent
                title="Sale Orders"
                dataArray={saleOrders}
                EnableSerialNumber
                stateUrl='/erp/sales/saleOrder'
                stateGroup={'saleOrderListing'}
                columns={[
                    {
                        Field_Name: "Checkbox",
                        ColumnHeader: (
                            <Checkbox
                                size="small"
                                checked={selectableOrders.length > 0 && selectedOrders.length === selectableOrders.length}
                                indeterminate={selectedOrders.length > 0 && selectedOrders.length < selectableOrders.length}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedOrders(selectableOrders);
                                    } else {
                                        setSelectedOrders([]);
                                    }
                                }}
                            />
                        ),
                        isVisible: 1,
                        align: "center",
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const products = toArray(row?.Products_List);
                            const canConvert = toNumber(row?.Cancel_status) !== 0 && products.some(
                                item => toNumber(item.convertedQuantity) < toNumber(item.Bill_Qty)
                            );
                            const hasInvoices = toArray(row?.ConvertedInvoice).length > 0;
                            const canSelect = canConvert || hasInvoices;

                            return (
                                <Checkbox
                                    size="small"
                                    disabled={!canSelect}
                                    checked={selectedOrders.some(so => so.So_Id === row.So_Id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedOrders([...selectedOrders, row]);
                                        } else {
                                            setSelectedOrders(selectedOrders.filter(so => so.So_Id !== row.So_Id));
                                        }
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            );
                        }
                    },
                    createCol("So_Date", "date", "Date"),
                    createCol("So_Inv_No", "string", "ID"),
                    createCol("Retailer_Name", "string", "Customer"),
                    createCol("VoucherTypeGet", "string", "Voucher"),
                    createCol("Total_Invoice_value", "number", "Invoice Value"),
                    createCol("invoiceCopyCount", "number", "Bill copy"),
                    {
                        ColumnHeader: "Order Status",
                        isVisible: 1,
                        align: "center",
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const cancelStatus = Number(row?.Cancel_status);

                            let status = "";
                            let className = "bg-success text-white";

                            if (cancelStatus == 1) {
                                status = "New";
                                className = "bg-success text-white";
                            } else if (cancelStatus == 2) {
                                status = "Hold";
                                className = "bg-warning text-dark";
                            } else if (cancelStatus == 0) {
                                status = "Cancelled";
                                className = "bg-danger text-white";
                            }

                            return (
                                <span className={`py-0 fw-bold px-2 rounded-4 fa-12 ${className}`}>
                                    {status}
                                </span>
                            );
                        },
                    },
                    {
                        ColumnHeader: "Convert Status",
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
                        isVisible: 1,
                        align: "center",
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const convertedInvoice = toArray(row?.ConvertedInvoice);
                            const isAssigned = convertedInvoice.some(
                                inv => toArray(inv?.tripDetails).length > 0
                            );
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
                    createCol("Created_BY_Name", "string", "Created_By"),
                    {
                        Field_Name: "Action",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const products = toArray(row?.Products_List);
                            const canConvert = toNumber(row?.Cancel_status) !== 0 && products.some(
                                item => toNumber(item.convertedQuantity) < toNumber(item.Bill_Qty)
                            );

                            const hasInvoices = toArray(row?.ConvertedInvoice).length > 0;

                            return (
                                <ButtonActions
                                    buttonsData={[
                                        {
                                            name: "View Order",
                                            icon: <Visibility className="fa-16" />,
                                            onclick: () => {
                                                setViewOrder({
                                                    orderDetails: row,
                                                    orderProducts: row?.Products_List
                                                        ? row?.Products_List
                                                        : [],
                                                });
                                            }
                                        },
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
                                            name: "Convert to Invoice",
                                            icon: <ReceiptLong className="fa-16" />,
                                            disabled: !canConvert,
                                            onclick: () => convertToSalesInvoice(row),
                                        },
                                        {
                                            name: "Print Invoice",
                                            icon: <Print className="fa-16" />,
                                            disabled: !hasInvoices,
                                            onclick: () => {
                                                setPrintOrderRow(row);
                                                setDialog(prev => ({ ...prev, printInvoice: true }));
                                            },
                                        }
                                    ]}
                                />
                            )
                        },
                    },
                ]}
                ButtonArea={
                    <>
                        {/* <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
                            {toNumber(Total_Invoice_value) > 0 && (
                                <h6 className="m-0 text-end text-muted px-3">
                                    Total: {NumberFormat(Total_Invoice_value)}
                                </h6>
                            )}
                        </span> */}

                        <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<ReceiptLong />}
                            onClick={() => setDialog({ ...dialog, bulkConvert: true })}
                            disabled={convertibleSelected.length === 0}
                            style={{ marginLeft: '8px' }}
                        >
                            to invoice ({convertibleSelected.length})
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Print />}
                            onClick={() => setDialog(prev => ({ ...prev, printInvoice: true }))}
                            disabled={printableSelected.length === 0}
                            style={{ marginLeft: '8px' }}
                        >
                            Print ({printableSelected.length})
                        </Button>

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

            {Object.keys(viewOrder).length > 0 && (
                <InvoiceBillTemplate
                    orderDetails={viewOrder?.orderDetails}
                    orderProducts={viewOrder?.orderProducts}
                    download={true}
                    actionOpen={true}
                    clearDetails={() => setViewOrder({})}
                    TitleText={"Sale Order"}
                />
            )}

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
                                    <td style={{ verticalAlign: "middle" }}>Retailer</td>
                                    <td>
                                        <Select
                                            value={filters?.Retailer}
                                            onChange={(e) => setFilters({ ...filters, Retailer: e })}
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...baseData.retailers.map((obj) => ({
                                                    value: obj?.Retailer_Id,
                                                    label:
                                                        obj?.Retailer_Name +
                                                        "- ₹" +
                                                        NumberFormat(toNumber(obj?.TotalSales)) +
                                                        ` (${toNumber(obj?.OrderCount)})`,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Retailer Name"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Sales Person</td>
                                    <td>
                                        <Select
                                            value={filters?.SalesPerson}
                                            onChange={(e) =>
                                                setFilters((pre) => ({ ...pre, SalesPerson: e }))
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...baseData.salesPerson.map((obj) => ({
                                                    value: obj?.UserId,
                                                    label: obj?.Name,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Sales Person Name"}
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
                                            placeholder={"Sales Person Name"}
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
                                                    .filter((obj) => obj.Type === "SALES")
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
                                    <td style={{ verticalAlign: "middle" }}>Canceled Order</td>
                                    <td>
                                        <select
                                            value={filters.Cancel_status}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    Cancel_status: e.target.value,
                                                })
                                            }
                                            className="cus-inpt"
                                        >
                                            <option value="">All (Both Active & Cancelled)</option>
                                            <option value="1">Active Only</option>
                                            <option value="0">Cancelled Only</option>
                                        </select>
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
                                                { value: "pending", label: "Pending" },
                                                { value: "completed", label: "Completed" },
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={false}
                                            placeholder={"Order Status"}
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
                                SalesPerson: filters.SalesPerson,
                                VoucherType: filters.VoucherType,
                                Cancel_status: filters.Cancel_status,
                                OrderStatus: filters.OrderStatus,
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

            <BulkInvoiceConvertDialog
                open={dialog.bulkConvert}
                onClose={() => setDialog({ ...dialog, bulkConvert: false })}
                selectedOrders={convertibleSelected}
                voucherTypes={baseData.voucher.filter(v => v.Type === "SALE_INVOICE")}
                godowns={baseData.godowns}
                stockLedgers={baseData.stockItemLedgers}
                onSuccess={() => {
                    setSelectedOrders([]);
                    fetchSaleOrders();
                }}
                userInfo={storage}
            />

            {/* Single-row print */}
            <InvoicePrintPreview
                open={!!printOrderRow && dialog.printInvoice}
                onClose={() => {
                    setDialog(prev => ({ ...prev, printInvoice: false }));
                    setPrintOrderRow(null);
                }}
                doIds={toArray(printOrderRow?.ConvertedInvoice).map(inv => inv.invId)}
                copyCountMap={toArray(printOrderRow?.ConvertedInvoice).reduce((acc, inv) => {
                    acc[String(inv.invId)] = toNumber(printOrderRow?.invoiceCopyCount) || 1;
                    return acc;
                }, {})}
            />

            {/* Bulk print */}
            <InvoicePrintPreview
                open={!printOrderRow && dialog.printInvoice}
                onClose={() => setDialog(prev => ({ ...prev, printInvoice: false }))}
                selectedOrders={printableSelected}
            />
        </>
    );
};

export default SaleOrderList;