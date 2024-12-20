import React, { useState, useEffect } from "react";
import { Button, Dialog, Tooltip, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { isEqualNumber, ISOString } from "../../Components/functions";
import InvoiceBillTemplate from "../Sales/SalesReportComponent/newInvoiceTemplate";
import { Add, Edit, FilterAlt, Visibility } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable from "../../Components/filterableTable2";
import { useNavigate } from 'react-router-dom';

const PurchaseOrderList = ({ loadingOn, loadingOff }) => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [purchaseOrder, setPurchaseOrder] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [users, setUsers] = useState([]);
    const [viewOrder, setViewOrder] = useState({});
    const nav = useNavigate();

    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        Retailer_Id: '',
        RetailerGet: 'ALL',
        Created_by: '',
        CreatedByGet: 'ALL',
        Cancel_status: 0
    });

    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
    });

    useEffect(() => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `purchase/purchaseOrder?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}&Retailer_Id=${filters?.Retailer_Id}&Created_by=${filters?.Created_by}&Cancel_status=${filters?.Cancel_status}`
        }).then(data => {
            if (data.success) {
                setPurchaseOrder(data?.data)
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff()
        })

    }, [
        filters.Fromdate,
        filters?.Todate,
        filters?.Retailer_Id,
        filters?.Created_by,
        filters?.Cancel_status,
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
            address: `masters/user/dropDown?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setUsers(data.data)
            }
        }).catch(e => console.error(e))

    }, [])

    const navigateToPageWithState = ({ page = '', stateToTransfer = {} }) => {
        nav(page, { state: stateToTransfer });
    }

    const purchaseOrderColumn = [
        {
            Field_Name: 'Po_Inv_No',
            ColumnHeader: 'Order ID',
            Fied_Data: 'string',
            isVisible: 1,
        },
        {
            Field_Name: 'Po_Inv_Date',
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
                                            orderInfo: row?.Products_List
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
                                            value={{ value: filters?.Retailer_Id, label: filters?.RetailerGet }}
                                            onChange={(e) => setFilters({ ...filters, Retailer_Id: e.value, RetailerGet: e.label })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Retailer Name"}
                                        />
                                    </td>
                                </tr>

                                {/* <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Created By</td>
                                    <td>
                                        <Select
                                            value={{ value: filters?.Created_by, label: filters?.CreatedByGet }}
                                            onChange={(e) => setFilters({ ...filters, Created_by: e.value, CreatedByGet: e.label })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...users.map(obj => ({ value: obj?.UserId, label: obj?.Name }))
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Sales Person Name"}
                                        />
                                    </td>
                                </tr> */}

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

                                {/* <tr>
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
                                </tr> */}

                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>close</Button>
                </DialogActions>
            </Dialog>

        </>
    )
}

export default PurchaseOrderList;