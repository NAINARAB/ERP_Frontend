import React, { useState, useEffect } from "react";
import { Button, Dialog, Tooltip, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { isEqualNumber, ISOString, isValidDate } from "../../Components/functions";
import InvoiceBillTemplate from "../Sales/SalesReportComponent/newInvoiceTemplate";
import { Add, Edit, FilterAlt, Search, Visibility } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { useNavigate, useLocation } from 'react-router-dom';

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const PurchaseOrderList = ({ loadingOn, loadingOff }) => {
    const [purchaseOrder, setPurchaseOrder] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [voucher, setVoucher] = useState([]);
    const [viewOrder, setViewOrder] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const stateDetails = location.state;

    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        Retailer: { value: '', label: 'Select Retailer' },
        VoucherType: { value: '', label: 'Select Voucher' },
        Cancel_status: 0,
    });

    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
    });

    useEffect(() => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `purchase/purchaseOrder?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}&Retailer_Id=${filters?.Retailer?.value}&Cancel_status=${filters?.Cancel_status}&VoucherType=${filters?.VoucherType?.value}`
        }).then(data => {
            if (data.success) {
                setPurchaseOrder(data?.data)
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff()
        })

    }, [
        filters?.fetchFrom, filters?.fetchTo,
        filters?.Retailer?.value,
        filters?.Cancel_status,
        filters?.VoucherType
    ])

    useEffect(() => {

        fetchLink({
            address: `masters/retailers/dropDown`
        }).then(data => {
            if (data.success) {
                setRetailers(data.data);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/voucher`
        }).then(data => {
            if (data.success) {
                setVoucher(data.data);
            }
        }).catch(e => console.error(e))

    }, [])

    useEffect(() => {
        const queryFilters = {
            Fromdate: query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                ? query.get("Fromdate")
                : defaultFilters.Fromdate,
            Todate: query.get("Todate") && isValidDate(query.get("Todate"))
                ? query.get("Todate")
                : defaultFilters.Todate,
        };
        setFilters(pre => ({ ...pre, fetchFrom: queryFilters.Fromdate, fetchTo: queryFilters.Todate }));
    }, [location.search]);

    useEffect(() => {
        const Fromdate = (stateDetails?.Fromdate && isValidDate(stateDetails?.Fromdate)) ? ISOString(stateDetails?.Fromdate) : null;
        const Todate = (stateDetails?.Todate && isValidDate(stateDetails?.Todate)) ? ISOString(stateDetails?.Todate) : null;
        if (Fromdate && Todate) {
            updateQueryString({ Fromdate, Todate });
        }
    }, [stateDetails])

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const navigateToPageWithState = ({ page = '', stateToTransfer = {} }) => {
        navigate(page, { state: stateToTransfer });
    }

    const purchaseOrderColumn = [
        {
            Field_Name: 'Po_Inv_No',
            ColumnHeader: 'Order ID',
            Fied_Data: 'string',
            isVisible: 1,
        },
        {
            Field_Name: 'Po_Entry_Date',
            ColumnHeader: 'Date',
            Fied_Data: 'date',
            isVisible: 1,
            align: 'center',
        },
        {
            Field_Name: 'Retailer_Name',
            ColumnHeader: 'Party',
            Fied_Data: 'string',
            isVisible: 1,
        },
        createCol('VoucherTypeGet', 'string', 'Voucher'),
        {
            Field_Name: 'Total_Before_Tax',
            ColumnHeader: 'Before Tax',
            Fied_Data: 'number',
            isVisible: 1,
            align: 'center',
        },
        {
            Field_Name: 'Total_Tax',
            ColumnHeader: 'Tax',
            Fied_Data: 'number',
            isVisible: 1,
            align: 'center',
        },
        {
            Field_Name: 'Total_Invoice_value',
            ColumnHeader: 'Invoice Value',
            Fied_Data: 'number',
            isVisible: 1,
            align: 'center',
        },
        // {
        //     ColumnHeader: 'Status',
        //     isVisible: 1,
        //     align: 'center',
        //     isCustomCell: true,
        //     Cell: ({ row }) => {
        //         const convert = convertedStatus.find(status => status.id === Number(row?.isConverted));
        //         return (
        //             <span className={'py-0 fw-bold px-2 rounded-4 fa-12 ' + convert?.color ?? 'bg-secondary text-white'}>
        //                 {convert?.label ?? 'Undefined'}
        //             </span>
        //         )
        //     },
        // },
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
        });
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

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Retailer</td>
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
                                            placeholder={"Retailer Name"}
                                        />
                                    </td>
                                </tr>

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
                                        />
                                    </td>
                                </tr>

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
                                    <td style={{ verticalAlign: 'middle' }}>Canceled Order</td>
                                    <td>
                                        <select
                                            type="date"
                                            value={filters.Cancel_status}
                                            onChange={e => setFilters({ ...filters, Cancel_status: Number(e.target.value) })}
                                            className="cus-inpt"
                                        >
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
                            const updatedFilters = {
                                Fromdate: filters?.Fromdate,
                                Todate: filters?.Todate
                            };
                            updateQueryString(updatedFilters);
                            closeDialog();
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>

        </>
    )
}

export default PurchaseOrderList;