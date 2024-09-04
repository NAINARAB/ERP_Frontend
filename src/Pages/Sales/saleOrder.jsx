import React, { useState, useEffect } from "react";
import { Card, CardContent, Button, Dialog, Tooltip, IconButton, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import '../common.css'
import Select from "react-select";
import { customSelectStyles, customTableStyles } from "../../Components/tablecolumn";
// import { toast } from 'react-toastify';
import { getPreviousDate, ISOString, isValidObject, LocalDate, NumberFormat } from "../../Components/functions";
import InvoiceBillTemplate from "./invoiceTemplate";
import { AddShoppingCart, Edit, FilterAlt, KeyboardArrowLeft, Visibility } from "@mui/icons-material";
import SaleOrderCreation from "./saleOrderCreation";
import DataTable from "react-data-table-component";
import { convertedStatus } from "./convertedStatus";
import { fetchLink } from "../../Components/fetchComponent";

const SaleOrderList = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [saleOrders, setSaleOrders] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [salesPerson, setSalePerson] = useState([]);
    const [users, setUsers] = useState([]);
    const [screen, setScreen] = useState(true);
    const [orderInfo, setOrderInfo] = useState({});

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
            address: `sales/saleOrder?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}&Company_Id=${storage?.Company_id}&Retailer_Id=${filters?.Retailer_Id}&Sales_Person_Id=${filters?.Sales_Person_Id}&Created_by=${filters?.Created_by}&Cancel_status=${filters?.Cancel_status}`
        }).then(data => {
            if (data.success) {
                setSaleOrders(data?.data)
            }
        }).catch(e => console.error(e))
            
    }, [storage?.Company_id, filters])

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

    }, [storage?.Company_id])

    const saleOrderColumn = [
        {
            name: 'SNo',
            selector: (row, i) => i + 1,
            sortable: true,
            maxWidth: '10px'
        },
        {
            name: 'Date',
            selector: (row) => row?.So_Date ? LocalDate(row?.So_Date) : null,
            sortable: true,
            maxWidth: '10px'
        },
        {
            name: 'Ledger',
            selector: (row) => row?.Retailer_Name,
            sortable: true,
            minWidth: '200px'
        },
        {
            name: 'Order No',
            selector: (row) => row?.Sales_Order_No,
            sortable: true,
            minWidth: '100px',
            maxWidth: '150px',
        },
        {
            name: 'Products',
            selector: (row) => row?.Products_List?.length,
            sortable: true,
        },
        {
            name: 'Total',
            selector: (row) => row.Total_Invoice_value ? NumberFormat(row.Total_Invoice_value) : null,
            sortable: true,
        },
        {
            name: 'Status',
            cell: (row) => {
                const convert = convertedStatus[Number(row.isConverted)];
                return (
                    <span className={'py-0 fw-bold px-2 rounded-4 fa-12 ' + convert?.color}>{convert?.label}</span>
                )
            },
        },
        {
            name: 'Sales Person',
            selector: (row) => row.Sales_Person_Name,
            sortable: true,
        },
        {
            name: 'Action',
            cell: (row) => {
                return (
                    <>
                        <Tooltip title='View Order'>
                            <InvoiceBillTemplate orderDetails={row} orderProducts={row?.Products_List ? row?.Products_List : []} download={true}>
                                <IconButton color='primary' size="small" ><Visibility className="fa-16" /></IconButton>
                            </InvoiceBillTemplate>
                        </Tooltip>

                        <Tooltip title='View Order'>
                            <IconButton
                                onClick={() => {
                                    switchScreen();
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
                <div className="p-3 pb-2 d-flex align-items-center justify-content-between border-bottom">
                    <h6 className="fa-18">{screen ? 'Sale Orders' : isValidObject(orderInfo) ? 'Modify Sale Order' : 'Create Sale Order'}</h6>
                    <span>
                        {screen && (
                            <Tooltip title='Filters'>
                                <IconButton onClick={() => setDialog({ ...dialog, filters: true })}><FilterAlt /></IconButton>
                            </Tooltip>
                        )}
                        <Button
                            variant='outlined'
                            startIcon={!screen && <KeyboardArrowLeft />}
                            endIcon={screen && <AddShoppingCart />}
                            onClick={switchScreen}
                        >
                            {screen ? 'Create Sale Order' : 'Cancel'}
                        </Button>
                    </span>
                </div>

                {screen ? (
                    <CardContent>
                        <div className="rounded-4">
                            <DataTable
                                columns={saleOrderColumn}
                                data={saleOrders}
                                pagination
                                highlightOnHover={true}
                                fixedHeader={true}
                                fixedHeaderScrollHeight={'60vh'}
                                customStyles={customTableStyles}
                            />
                        </div>
                    </CardContent>
                ) : <SaleOrderCreation editValues={orderInfo} />}
            </Card>

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