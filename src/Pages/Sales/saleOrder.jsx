import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, Dialog, Tooltip, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import '../common.css'
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { getPreviousDate, ISOString, isValidObject } from "../../Components/functions";
import InvoiceBillTemplate from "./SalesReportComponent/newInvoiceTemplate";
import { Add, Edit, FilterAlt, Visibility } from "@mui/icons-material";
import { convertedStatus } from "./convertedStatus";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable from "../../Components/filterableTable2";
import NewSaleOrderCreation from "./SalesReportComponent/newSaleOrderCreation";


const SaleOrderList = ({ loadingOn, loadingOff }) => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [saleOrders, setSaleOrders] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [salesPerson, setSalePerson] = useState([]);
    const [users, setUsers] = useState([]);
    const [screen, setScreen] = useState(true);
    const [orderInfo, setOrderInfo] = useState({});
    const [viewOrder, setViewOrder] = useState({});
    const [reload, setReload] = useState(false)

    const [filters, setFilters] = useState({
        Fromdate: getPreviousDate(7),
        Todate: ISOString(),
        Retailer_Id: '',
        RetailerGet: 'ALL',
        Created_by: '',
        CreatedByGet: 'ALL',
        Sales_Person_Id: '',
        SalsePersonGet: 'ALL',
        Cancel_status: 0
    });

    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
    });

    useEffect(() => {
        fetchLink({
            address: `sales/saleOrder?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}&Retailer_Id=${filters?.Retailer_Id}&Sales_Person_Id=${filters?.Sales_Person_Id}&Created_by=${filters?.Created_by}&Cancel_status=${filters?.Cancel_status}`
        }).then(data => {
            if (data.success) {
                setSaleOrders(data?.data)
            }
        }).catch(e => console.error(e))

    }, [
        filters.Fromdate,
        filters?.Todate,
        filters?.Retailer_Id,
        filters?.Sales_Person_Id,
        filters?.Created_by,
        filters?.Cancel_status,
        reload
    ])

    useEffect(() => {

        fetchLink({
            address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setRetailers(data.data);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setSalePerson(data.data)
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

    const saleOrderColumn = [
        {
            Field_Name: 'So_Id',
            ColumnHeader: 'Order ID',
            Fied_Data: 'string',
            isVisible: 1,
        },
        {
            Field_Name: 'Retailer_Name',
            ColumnHeader: 'Customer',
            Fied_Data: 'string',
            isVisible: 1,
        },
        {
            Field_Name: 'So_Date',
            ColumnHeader: 'Date',
            Fied_Data: 'date',
            isVisible: 1,
            align: 'center',
        },
        // {
        //     Field_Name: 'Products',
        //     ColumnHeader: 'Products / Quantity',
        //     isVisible: 1,
        //     align: 'center',
        //     isCustomCell: true,
        //     Cell: ({ row }) => (
        //         <>
        //             <span>{row?.Products_List?.length ?? 0}</span> /&nbsp;
        //             <span>{row?.Products_List?.reduce((sum, item) => sum += item?.Bill_Qty ?? 0, 0) ?? 0}</span>
        //         </>
        //     )
        // },
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
        {
            ColumnHeader: 'Status',
            isVisible: 1,
            align: 'center',
            isCustomCell: true,
            Cell: ({ row }) => {
                const convert = convertedStatus.find(status => status.id === Number(row?.isConverted));
                return (
                    <span className={'py-0 fw-bold px-2 rounded-4 fa-12 ' + convert?.color ?? 'bg-secondary text-white'}>
                        {convert?.label ?? 'Undefined'}
                    </span>
                )
            },
        },
        // {
        //     Field_Name: 'Sales_Person_Name',
        //     ColumnHeader: 'Sales Person',
        //     Fied_Data: 'string',
        //     isVisible: 1,
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
                                    switchScreen();
                                    console.log(row);
                                    setOrderInfo({ ...row, isEdit: true });
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
                            <td className="border p-2">{row.Sales_Person_Name}</td>
                            <td className="border p-2 bg-light">Round off</td>
                            <td className="border p-2">{row.Round_off}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Invoice Type</td>
                            <td className="border p-2">
                                {row.GST_Inclusive == 1 && 'Inclusive'}
                                {row.GST_Inclusive == 0 && 'Exclusive'}
                            </td>
                            <td className="border p-2 bg-light">Tax Type</td>
                            <td className="border p-2">
                                {row.IS_IGST == 1 && 'IGST'}
                                {row.IS_IGST == 0 && 'GST'}
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

    const switchScreen = () => {
        setScreen(!screen)
        setOrderInfo({});
    }

    const closeDialog = () => {
        setDialog({
            ...dialog,
            filters: false,
            orderDetails: false,
        });
        setOrderInfo({});
    }

    return (
        <>
            <Card>
                <div className="p-3 py-2 d-flex align-items-center justify-content-between">
                    <h6 className="fa-18 m-0 p-0">{
                        screen
                            ? 'Sale Orders'
                            : isValidObject(orderInfo)
                                ? 'Modify Sale Order'
                                : 'Sale Order Creation'}
                    </h6>
                    <span>
                        {screen && (
                            <Tooltip title='Filters'>
                                <IconButton
                                    size="small"
                                    onClick={() => setDialog({ ...dialog, filters: true })}
                                >
                                    <FilterAlt />
                                </IconButton>
                            </Tooltip>
                        )}
                        {screen && (
                            <Button
                                variant='outlined'
                                startIcon={<Add />}
                                onClick={switchScreen}
                            >
                                {'New'}
                            </Button>
                        )}
                    </span>
                </div>

                <CardContent className="p-0 ">
                    {screen ? (
                        <FilterableTable
                            dataArray={saleOrders}
                            columns={saleOrderColumn}
                            // EnableSerialNumber={true}
                            isExpendable={true}
                            tableMaxHeight={550}
                            expandableComp={ExpendableComponent}
                        />
                    ) : (
                        <NewSaleOrderCreation
                            editValues={orderInfo}
                            loadingOn={loadingOn}
                            loadingOff={loadingOff}
                            reload={() => {
                                setReload(pre => !pre);
                                setScreen(pre => !pre)
                            }}
                            switchScreen={switchScreen}
                        />
                    )}
                </CardContent>
            </Card>


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

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Salse Person</td>
                                    <td>
                                        <Select
                                            value={{ value: filters?.Sales_Person_Id, label: filters?.SalsePersonGet }}
                                            onChange={(e) => setFilters({ ...filters, Sales_Person_Id: e.value, SalsePersonGet: e.label })}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...salesPerson.map(obj => ({ value: obj?.UserId, label: obj?.Name }))
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Sales Person Name"}
                                        />
                                    </td>
                                </tr>

                                <tr>
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
                </DialogActions>
            </Dialog>

        </>
    )
}

export default SaleOrderList;