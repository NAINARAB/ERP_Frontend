import { useState, useEffect } from "react";
import { Button, Dialog, Tooltip, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { getSessionFiltersByPageId, isEqualNumber, ISOString, reactSelectFilterLogic, setSessionFilters, toArray } from "../../Components/functions";
import InvoiceBillTemplate from "../Sales/SalesReportComponent/newInvoiceTemplate";
import { Add, Edit, FilterAlt, Search, Visibility } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
    Retailer: { value: '', label: 'ALL' },
    VoucherType: { value: '', label: 'ALL' },
    EmployeeType: { value: '', label: 'ALL' },
    Employee: { value: '', label: 'ALL' },
    filterItems: { value: '', label: 'ALL' },
    Cancel_status: '',
};

const PurchaseOrderList = ({ loadingOn, loadingOff, DeleteRights, pageID }) => {
    const sessionValue = sessionStorage.getItem('filterValues');
    const [purchaseOrder, setPurchaseOrder] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [voucher, setVoucher] = useState([]);
    const [viewOrder, setViewOrder] = useState({});
    const navigate = useNavigate();
    const location = useLocation();

    const [baseData, setBaseData] = useState({
        Employees: [],
        EmployeeTypes: [],
        products: [],
    })

    const [filters, setFilters] = useState({
        ...defaultFilters,
        reload: false
    });

    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
        cancelDialog: false,
        cancelPIN_Id: null,
        isCanceled: null,
    });

    useEffect(() => {

        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            Retailer = defaultFilters.Retailer,
            VoucherType = defaultFilters.VoucherType,
            EmployeeType = defaultFilters.EmployeeType,
            Employee = defaultFilters.Employee,
            Cancel_status = defaultFilters.Cancel_status,
            filterItems = defaultFilters.filterItems
        } = otherSessionFiler;

        setFilters(pre => ({
            ...pre,
            Fromdate: Fromdate,
            Todate: Todate,
            Retailer, VoucherType, EmployeeType,
            Employee, filterItems, Cancel_status
        }));

    }, [sessionValue, pageID]);

    useEffect(() => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            Retailer = defaultFilters.Retailer,
            VoucherType = defaultFilters.VoucherType,
            EmployeeType = defaultFilters.EmployeeType,
            Employee = defaultFilters.Employee,
            filterItems = defaultFilters.filterItems,
            Cancel_status = defaultFilters.Cancel_status
        } = otherSessionFiler;

        fetchLink({
            address: `purchase/purchaseOrder?
            Fromdate=${Fromdate}&
            Todate=${Todate}&
            Retailer_Id=${Retailer?.value || ''}&
            VoucherType=${VoucherType?.value || ''}&
            Cost_Center_Type_Id=${EmployeeType?.value || ''}&
            Involved_Emp_Id=${Employee?.value || ''}&
            filterItems=${filterItems?.value || ''}&
            Cancel_status=${Cancel_status}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setPurchaseOrder(data?.data)
            }
        }).catch(e => console.error(e));

    }, [sessionValue, pageID, location])

    useEffect(() => {

        fetchLink({
            address: `masters/retailers/dropDown`
        }).then(data => {
            if (data.success) {
                setRetailers(data.data);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/products/dropDown`
        }).then(data => {
            if (data.success) {
                const product = toArray(data.data).map(pro => ({
                    value: pro.Product_Id,
                    label: pro.Product_Name
                }));
                setBaseData(pre => ({ ...pre, products: product }));
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/voucher`
        }).then(data => {
            if (data.success) {
                setVoucher(data.data);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `purchase/purchaseOrder/involvedStaffs`
        }).then(data => {
            if (data.success) {
                setBaseData(pre => ({
                    ...pre,
                    Employees: toArray(data?.others?.Employees),
                    EmployeeTypes: toArray(data?.others?.EmployeeTypes)
                }));
            }
        }).catch(e => console.error(e))

    }, []);

    const navigateToPageWithState = ({ page = '', stateToTransfer = {} }) => {
        navigate(page, { state: stateToTransfer });
    }

    const purchaseOrderColumn = [
        createCol('Po_Inv_No', 'string', 'Order ID'),
        createCol('Po_Entry_Date', 'date', 'Date', 'center'),
        createCol('Retailer_Name', 'string', 'Party'),
        createCol('VoucherTypeGet', 'string', 'Voucher'),
        createCol('Total_Before_Tax', 'number', 'Before Tax', 'center'),
        createCol('Total_Tax', 'number', 'Tax', 'center'),
        createCol('Total_Invoice_value', 'number', 'Invoice Value', 'center'),
        {
            ColumnHeader: 'Canceled-?',
            isVisible: 1,
            align: 'center',
            isCustomCell: true,
            Cell: ({ row }) => {
                const isCanceled = isEqualNumber(row?.Cancel_status, 1);
                return (
                    <Button
                        className={'fw-bold fa-12 rounded-4 p-1 shadow-0 '}
                        color={isCanceled ? "error" : 'primary'}
                        variant={isCanceled ? "contained" : 'text'}
                        disabled={!DeleteRights}
                        onClick={() => setDialog(pre => ({
                            ...pre,
                            cancelPIN_Id: row.PIN_Id,
                            cancelDialog: true,
                            isCanceled: isCanceled
                        }))}
                    >
                        {isCanceled ? 'Yes' : 'No'}
                    </Button>
                )
            },
        },
        {
            Field_Name: 'Action',
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => {
                return (
                    <>
                        <Tooltip title='View Order'>
                            <IconButton
                                onClick={() => {
                                    setViewOrder({
                                        orderDetails: row,
                                        orderProducts: row?.Products_List ? row?.Products_List : [],
                                    })
                                }}
                                color='primary' size="small"
                            >
                                <Visibility className="fa-16" />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title='Edit'>
                            <IconButton
                                onClick={() => {
                                    navigateToPageWithState({
                                        page: 'create',
                                        stateToTransfer: {
                                            invoiceInfo: row,
                                            orderInfo: row?.Products_List,
                                            staffInfo: row?.Staff_List
                                        }
                                    })
                                }}
                                size="small"
                            >
                                <Edit className="fa-16" />
                            </IconButton>
                        </Tooltip>

                    </>
                )
            },
        },
    ];

    const ExpendableComponent = ({ row }) => {

        return (
            <>
                <table className="table">
                    <tbody>
                        <tr>
                            <td className="border p-2 bg-light">Branch</td>
                            <td className="border p-2">{row.Branch_Name}</td>
                            <td className="border p-2 bg-light">Sales Person</td>
                            <td className="border p-2">{row?.Sales_Person_Name}</td>
                            <td className="border p-2 bg-light">Round off</td>
                            <td className="border p-2">{row.Round_off}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Broker</td>
                            <td className="border p-2">
                                {row?.Staff_List?.filter(cost =>
                                    cost.Involved_Emp_Type === 'Broker'
                                ).map(staff => staff.Involved_Emp_Name)?.join(', ')}
                            </td>
                            <td className="border p-2 bg-light">Owners</td>
                            <td className="border p-2">
                                {row?.Staff_List?.filter(cost =>
                                    cost.Involved_Emp_Type === 'Owners'
                                ).map(staff => staff.Involved_Emp_Name)?.join(', ')}
                            </td>
                            <td className="border p-2 bg-light">Others</td>
                            <td className="border p-2">
                                <table className="table table-bordered m-0 fa-12">
                                    <tbody>
                                        {row?.Staff_List?.filter(cost =>
                                            !(cost.Involved_Emp_Type === 'Owners' ||
                                                cost.Involved_Emp_Type === 'Broker')
                                        ).map(staff => (
                                            <tr>
                                                <td>{staff?.Involved_Emp_Name}</td>
                                                <td>{staff?.Involved_Emp_Type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Invoice Type</td>
                            <td className="border p-2">
                                {isEqualNumber(row.GST_Inclusive, 1) && 'Inclusive'}
                                {isEqualNumber(row.GST_Inclusive, 0) && 'Exclusive'}
                                {isEqualNumber(row.GST_Inclusive, 2) && 'Not applicable'}
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
            </>
        )
    }

    const closeDialog = () => {
        setDialog({
            ...dialog,
            filters: false,
            orderDetails: false,
            cancelDialog: false,
            cancelPIN_Id: null
        });
    }

    const cancelPurchaseInvoice = () => {
        fetchLink({
            address: `purchase/purchaseOrder?PIN_Id=${dialog.cancelPIN_Id}`,
            method: 'DELETE',
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                setFilters(pre => ({ ...pre, reload: !pre.reload }));
                closeDialog();
            } else {
                toast.error(data.data)
            }
        }).catch(e => console.error(e))
    }

    return (
        <>
            <FilterableTable
                dataArray={purchaseOrder}
                columns={purchaseOrderColumn}
                title="Purchase Invoices"
                // EnableSerialNumber={true}
                isExpendable={true}
                tableMaxHeight={550}
                expandableComp={ExpendableComponent}
                ButtonArea={
                    <>
                        <Tooltip title='Filters'>
                            <IconButton
                                size="small"
                                className="ms-2"
                                onClick={() => setDialog({ ...dialog, filters: true })}
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant='outlined'
                            startIcon={<Add />}
                            onClick={() => navigateToPageWithState({ page: 'create' })}
                        >
                            {'Add'}
                        </Button>
                    </>
                }
            />

            {Object.keys(viewOrder).length > 0 && (
                <InvoiceBillTemplate
                    orderDetails={viewOrder?.orderDetails}
                    orderProducts={viewOrder?.orderProducts}
                    download={true}
                    actionOpen={true}
                    clearDetails={() => setViewOrder({})}
                    TitleText={'Purchase Order'}
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

                                {/* from date */}
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

                                {/* to date */}
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

                                {/* vendor */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Vendor</td>
                                    <td>
                                        <Select
                                            value={filters?.Retailer}
                                            onChange={(e) => setFilters({ ...filters, Retailer: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Vendor Name"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                {/* Employee Types */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Cost Center Type</td>
                                    <td>
                                        <Select
                                            value={filters?.EmployeeType}
                                            onChange={(e) => setFilters({ ...filters, EmployeeType: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...baseData.EmployeeTypes.map(
                                                    obj => ({ value: obj?.Emp_Type_Id, label: obj?.Emp_Type_Get })
                                                )
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Cost Center Type"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                {/* Employee */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Cost Center Name</td>
                                    <td>
                                        <Select
                                            value={filters?.Employee}
                                            onChange={(e) => setFilters({ ...filters, Employee: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...baseData.Employees.map(
                                                    obj => ({ value: obj?.Emp_Id, label: obj?.Emp_Name_Get })
                                                )
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Cost Center Type"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                {/* voucher */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Voucher</td>
                                    <td>
                                        <Select
                                            value={filters?.VoucherType}
                                            onChange={(e) => setFilters({ ...filters, VoucherType: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...voucher.filter(
                                                    obj => obj.Type === 'PURCHASE'
                                                ).map(obj => ({ value: obj?.Vocher_Type_Id, label: obj?.Voucher_Type }))
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Retailer Name"}
                                            filterOption={reactSelectFilterLogic}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Product Name</td>
                                    <td>
                                        <Select
                                            value={filters.filterItems}
                                            onChange={e => setFilters({ ...filters, filterItems: e })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...baseData.products
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Cost Center Type"}
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
                                            onChange={e => setFilters({ ...filters, Cancel_status: Number(e.target.value) })}
                                            className="cus-inpt"
                                        >
                                            <option value={''}>ALL</option>
                                            <option value={1}>Show</option>
                                            <option value={0}>Hide</option>
                                        </select>
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
                                VoucherType: filters.VoucherType,
                                EmployeeType: filters.EmployeeType,
                                Employee: filters.Employee,
                                filterItems: filters.filterItems,
                                Cancel_status: filters.Cancel_status,
                            });
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={dialog.cancelDialog}
                onClose={closeDialog} fullWidth maxWidth='sm'
            >
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    {dialog.isCanceled
                        ? 'This invoice has already been canceled. Do you want to restore it?'
                        : 'Are you sure you want to cancel this invoice? This action can be undone later.'}
                </DialogContent>

                <DialogActions>
                    <Button onClick={closeDialog}>Close</Button>
                    <Button onClick={cancelPurchaseInvoice} color="primary" variant="outlined">
                        {dialog.isCanceled ? 'Restore Invoice' : 'Cancel Invoice'}
                    </Button>
                </DialogActions>

            </Dialog>
        </>
    )
}

export default PurchaseOrderList;