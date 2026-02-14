import { useState, useEffect, useMemo } from "react";
import { Button, Dialog, Box, Tooltip, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Addition, getSessionFiltersByPageId, getSessionUser, isEqualNumber, ISOString, LocalDateWithTime, NumberFormat, reactSelectFilterLogic, setSessionFilters, toArray, toNumber } from "../../../Components/functions";
import InvoiceBillTemplate from "../SalesReportComponent/newInvoiceTemplate";
import { Add, Edit, FilterAlt, Search, Sync, Visibility } from "@mui/icons-material";
import { dbStatus } from "../convertedStatus";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify'
import InvoiceTemplate from "../LRReport/SalesInvPrint/invTemplate";
import { Close, Print } from "@mui/icons-material";
import { ButtonActions } from "../../../Components/filterableTable2";
import DeliverySlipprint from "../LRReport/deliverySlipPrint";
import { allowedUserTypesForPreviousDateSalesEdit } from "./variable";

const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
    Retailer: { value: '', label: 'ALL' },
    CreatedBy: { value: '', label: 'ALL' },
    SalesPerson: { value: '', label: 'ALL' },
    VoucherType: { value: '', label: 'ALL' },
    Cancel_status: ''
};

const SaleInvoiceList = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
    const sessionValue = sessionStorage.getItem('filterValues');
    const storage = getSessionUser().user;
    const navigate = useNavigate();
    const location = useLocation();
    const [salesInvoice, setSalesInvoice] = useState([]);
    const [filtersDropDown, setFiltersDropDown] = useState({
        voucherType: [],
        retailers: [],
        createdBy: []
    });
    const [viewOrder, setViewOrder] = useState({});
    const [reload, setReload] = useState(false);

    const [filters, setFilters] = useState({
        ...defaultFilters,
        reload: false
    });

    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
        printInvoice: false,
        deliverySlip: false
    });
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        fetchLink({
            address: `sales/salesInvoice/filterValues`
        }).then(data => {
            if (data.success) {
                setFiltersDropDown({
                    voucherType: toArray(data?.others?.voucherType),
                    retailers: toArray(data?.others?.retailers),
                    createdBy: toArray(data?.others?.createdBy),
                    salesPerson: toArray(data?.others?.salesPerson),
                });
            }
        }).catch(e => console.error(e));
    }, []);

    useEffect(() => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            Retailer = defaultFilters.Retailer,
            VoucherType = defaultFilters.VoucherType,
            CreatedBy = defaultFilters.CreatedBy,
            SalesPerson = defaultFilters.SalesPerson,
            Cancel_status = defaultFilters.Cancel_status,
        } = otherSessionFiler;

        setFilters(pre => ({
            ...pre,
            Fromdate: Fromdate || defaultFilters.Fromdate,
            Todate: Todate || defaultFilters.Todate,
            Retailer, VoucherType, CreatedBy, SalesPerson, Cancel_status
        }));

    }, [sessionValue, pageID]);

    useEffect(() => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate = defaultFilters.Fromdate,
            Todate = defaultFilters.Todate,
            Retailer = defaultFilters.Retailer,
            VoucherType = defaultFilters.VoucherType,
            CreatedBy = defaultFilters.CreatedBy,
            Cancel_status = defaultFilters.Cancel_status
        } = otherSessionFiler;

        fetchLink({
            address: `sales/salesInvoice?Fromdate=${Fromdate}&Todate=${Todate}&Retailer_Id=${Retailer?.value || ''}&Created_by=${CreatedBy?.value || ''}&VoucherType=${VoucherType?.value || ''}&Cancel_status=${Cancel_status}`,
            loadingOn,
            loadingOff
        }).then(data => {
            if (data.success) {
                setSalesInvoice(data?.data || []);
            } else {
                setSalesInvoice([]);
                toast.error(data.message || 'Failed to load sales invoices');
            }
        }).catch(e => {
            console.error(e);
            toast.error('Error fetching sales invoices');
            setSalesInvoice([]);
        });

    }, [sessionValue, pageID, reload, location]);

    const ExpendableComponent = ({ row }) => {
        return (
            <>
                <table className="table">
                    <tbody>
                        <tr>
                            <td className="border p-2 bg-light">Branch</td>
                            <td className="border p-2">{row.Branch_Name}</td>
                            <td className="border p-2 bg-light">Sales Person</td>
                            <td className="border p-2">{row.Sales_Person_Name}</td>
                            <td className="border p-2 bg-light">Round off</td>
                            <td className="border p-2">{row.Round_off}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Invoice Type</td>
                            <td className="border p-2">
                                {isEqualNumber(row.GST_Inclusive, 1) && 'Inclusive'}
                                {isEqualNumber(row.GST_Inclusive, 0) && 'Exclusive'}
                            </td>
                            <td className="border p-2 bg-light">Tax Type</td>
                            <td className="border p-2">
                                {isEqualNumber(row.IS_IGST, 1) && 'IGST'}
                                {isEqualNumber(row.IS_IGST, 0) && 'GST'}
                            </td>
                            <td className="border p-2 bg-light">Sales Person</td>
                            <td className="border p-2">{row.Sales_Person_Name}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Narration</td>
                            <td className="border p-2" colSpan={5}>{row.Narration}</td>
                        </tr>
                    </tbody>
                </table>

                <table className="table table-bordered">
                    <thead>
                        <tr>
                            {['S.No', 'Edited By', 'Edited On', 'Reason'].map((item, index) => (
                                <th key={index}>{item}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {toArray(row.alterationHistory).map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.alterByGet}</td>
                                <td>{LocalDateWithTime(item.alterAt)}</td>
                                <td>{item.reason}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        )
    }

    const closeDialog = () => {
        setDialog({
            ...dialog,
            filters: false,
            orderDetails: false,
        });
    }

    const syncTallyData = async () => {
        try {
            loadingOn?.();
            const data = await fetchLink({
                address: `sales/salesInvoice/tallySync`,
                loadingOn,
                loadingOff
            });
            toast.success(data.message);
            setReload(pre => !pre);
        } catch (e) {
            console.error(e);
            toast.error('Sync failed');
        } finally {
            loadingOff?.();
        }
    }

    const totalValues = useMemo(() => {
        return salesInvoice.filter(inv => !isEqualNumber(inv.Cancel_status, 0)).reduce((acc, item) => {
            const invoiceValue = Addition(acc.totalInvoiceValue, item.Total_Invoice_value)
            const totals = toArray(item.Products_List).reduce((tot, pro) => {
                return {
                    tonnageValue: Addition(tot.tonnageValue, pro?.Total_Qty),
                    bagsValue: Addition(tot.bagsValue, pro.Alt_Bill_Qty)
                }
            }, {
                tonnageValue: 0,
                bagsValue: 0
            })
            return {
                totalTonnage: Addition(acc.totalTonnage, totals.tonnageValue),
                totalBags: Addition(acc.totalBags, totals.bagsValue),
                totalInvoiceValue: invoiceValue
            }
        }, {
            totalTonnage: 0,
            totalBags: 0,
            totalInvoiceValue: 0
        });
    }, [salesInvoice])

    const canEditNow = (invoiceDate) => {
        const isAllowedUser = allowedUserTypesForPreviousDateSalesEdit.includes(toNumber(storage.UserTypeId));
        if (isAllowedUser) {
            return true;
        }
        const invoiceDateObj = new Date(invoiceDate);
        const today = new Date();
        const diffInDays = Math.floor((today - invoiceDateObj) / (1000 * 60 * 60 * 24));
        return diffInDays <= 3;
    }

    return (
        <>
            <FilterableTable
                title="Sales Invoice"
                dataArray={salesInvoice}
                EnableSerialNumber
                columns={[
                    createCol('Do_Date', 'date', 'Date'),
                    createCol('Do_Inv_No', 'string', 'ID'),
                    createCol('Retailer_Name', 'string', 'Customer'),
                    createCol('VoucherTypeGet', 'string', 'Voucher'),
                    // createCol('Total_Before_Tax', 'number', 'Before Tax'),
                    // createCol('Total_Tax', 'number', 'Tax'),
                    createCol('Total_Invoice_value', 'number', 'Invoice Value'),
                    createCol('Created_BY_Name', 'string', 'Created By'),
                    {
                        ColumnHeader: 'Status',
                        isVisible: 1,
                        align: 'center',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const convert = dbStatus.find(status => status.id === Number(row?.Cancel_status));
                            return (
                                <span className={'py-0 fw-bold px-2 rounded-4 fa-12 ' + convert?.color ?? 'bg-secondary text-white'}>
                                    {convert?.label ?? ''}
                                </span>
                            )
                        },
                    },
                    {
                        Field_Name: 'Action',
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            return (
                                <ButtonActions
                                    buttonsData={[
                                        {
                                            name: 'View Order',
                                            onclick: () => {
                                                setViewOrder({
                                                    orderDetails: row,
                                                    orderProducts: row?.Products_List ? row?.Products_List : [],
                                                })
                                            },
                                            icon: <Visibility fontSize="small" color="primary" />,
                                        },
                                        {
                                            name: 'Print Invoice',
                                            onclick: () => {
                                                setSelectedInvoice(row);
                                                setDialog(pre => ({ ...pre, printInvoice: true }));
                                            },
                                            icon: <Print fontSize="small" color="primary" />,
                                        },
                                        {
                                            name: 'Edit',
                                            onclick: () => {
                                                navigate('create', {
                                                    state: {
                                                        ...row,
                                                        Products_List: toArray(row?.Products_List).sort((a, b) => a.S_No - b.S_No),
                                                        isEdit: true,
                                                    },
                                                });
                                            },
                                            icon: <Edit fontSize="small" color="primary" />,
                                            disabled: !EditRights || !canEditNow(row.Do_Date),
                                        },
                                        {
                                            name: 'Delivery Slip',
                                            onclick: () => {
                                                setSelectedInvoice(row);
                                                setDialog(pre => ({ ...pre, deliverySlip: true }));
                                            },
                                            icon: <Print fontSize="small" color="primary" />,
                                        },
                                    ]}
                                />
                            )
                        },
                    }
                ]}
                ButtonArea={
                    <>
                        {AddRights && (
                            <Button
                                variant='outlined'
                                startIcon={<Add />}
                                onClick={() => navigate('create')}
                            >
                                NEW
                            </Button>
                        )}
                        {AddRights && (
                            <Tooltip title='Sync tally data'>
                                <Button
                                    className="mx-1"
                                    variant="outlined"
                                    onClick={syncTallyData}
                                    startIcon={<Sync color="primary" />}
                                >Sync Tally</Button>
                            </Tooltip>
                        )}
                        <Tooltip title='Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setDialog({ ...dialog, filters: true })}
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>

                        {salesInvoice.length > 0 && (
                            <>
                                <span> Qty: {NumberFormat(totalValues.totalTonnage)} </span>
                                <span> Bag: {NumberFormat(totalValues.totalBags)} &nbsp; </span>
                                <span> Worth: {NumberFormat(totalValues.totalInvoiceValue)} &nbsp; </span>
                            </>
                        )}
                    </>
                }
                isExpendable={true}
                tableMaxHeight={550}
                expandableComp={ExpendableComponent}
            />

            {Object.keys(viewOrder).length > 0 && (
                <InvoiceBillTemplate
                    orderDetails={viewOrder?.orderDetails}
                    orderProducts={viewOrder?.orderProducts}
                    download={true}
                    actionOpen={true}
                    clearDetails={() => setViewOrder({})}
                    TitleText={'Sale Order'}
                />
            )}

            <Dialog
                open={dialog.filters}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={e => setFilters({ ...filters, Todate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Retailer</td>
                                    <td>
                                        <Select
                                            value={filters?.Retailer}
                                            onChange={(e) => setFilters({ ...filters, Retailer: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filtersDropDown.retailers
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Retailer Name"}
                                            menuPortalTarget={document.body}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Voucher </td>
                                    <td>
                                        <Select
                                            value={filters?.VoucherType}
                                            onChange={(e) => setFilters({ ...filters, VoucherType: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filtersDropDown.voucherType
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
                                    <td style={{ verticalAlign: 'middle' }}>Canceled Order</td>
                                    <td>
                                        <select
                                            type="date"
                                            value={filters.Cancel_status}
                                            onChange={e => setFilters({ ...filters, Cancel_status: e.target.value })}
                                            className="cus-inpt"
                                        >
                                            <option value={''}>All</option>
                                            {dbStatus.map((sts, ind) => (
                                                <option value={sts.id} key={ind}>{sts.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Created By</td>
                                    <td>
                                        <Select
                                            value={filters?.CreatedBy}
                                            onChange={(e) => setFilters(pre => ({ ...pre, CreatedBy: e }))}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...filtersDropDown.createdBy
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Sales Person Name"}
                                            menuPortalTarget={document.body}
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
                                Cancel_status: filters.Cancel_status,
                            });
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialog.printInvoice}
                onClose={() => {
                    setDialog(pre => ({ ...pre, printInvoice: false }));
                    setSelectedInvoice(null);
                }}
                maxWidth="lg"
                fullWidth
                scroll="paper"
            >
                <DialogTitle>
                    Print Invoice #{selectedInvoice?.Do_Inv_No}
                    <IconButton
                        onClick={() => {
                            setDialog(pre => ({ ...pre, printInvoice: false }));
                            setSelectedInvoice(null);
                        }}
                        style={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedInvoice?.Do_Id && (
                        <InvoiceTemplate
                            Do_Id={selectedInvoice.Do_Id}
                            loadingOn={loadingOn}
                            loadingOff={loadingOff}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDialog(pre => ({ ...pre, printInvoice: false }));
                            setSelectedInvoice(null);
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialog.deliverySlip}
                onClose={() => {
                    setDialog(pre => ({ ...pre, deliverySlip: false }));
                    setSelectedInvoice(null);
                }}
                maxWidth="lg"
                fullWidth
                scroll="paper"
            >
                <DialogTitle>
                    Print Delivery Slip #{selectedInvoice?.Do_Inv_No}
                    <IconButton
                        onClick={() => {
                            setDialog(pre => ({ ...pre, deliverySlip: false }));
                            setSelectedInvoice(null);
                        }}
                        style={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {selectedInvoice?.Do_Id && (
                        <DeliverySlipprint
                            Do_Id={selectedInvoice.Do_Id}
                            loadingOn={loadingOn}
                            loadingOff={loadingOff}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDialog(pre => ({ ...pre, deliverySlip: false }));
                            setSelectedInvoice(null);
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default SaleInvoiceList;