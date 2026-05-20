import React, { useState, useEffect, useMemo } from "react";
import {
    Card,
    Button,
    Dialog,
    Tooltip,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
} from "@mui/material";
// import '../common.css'
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import {

    isEqualNumber,

} from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable from "../../Components/filterableTable2";
import "react-toastify/dist/ReactToastify.css";
const DeliveryReports = ({

    onToggle,
    reload,
}) => {
    const storage = JSON.parse(localStorage.getItem("user"));
    const [saleOrders, setSaleOrders] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [salesPerson, setSalePerson] = useState([]);
    const [users, setUsers] = useState([]);
    const [statusCounts, setStatusCounts] = useState({
        all: 0,
        delivered: 0,
        pending: 0,
    });

    const initialFromDate = new Date();
    const initialToDate = new Date(initialFromDate);
    initialToDate.setDate(initialFromDate.getDate() + 1);

    const getFormattedDate = (date) => {
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - offset * 60 * 1000);
        return localDate.toISOString().split("T")[0];
    };



    const [deliveryPerson, setDeliveryPerson] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: getFormattedDate(initialFromDate),
        Todate: getFormattedDate(initialToDate),
        Retailer_Id: "",
        RetailerGet: "ALL",
        Created_by: "",
        CreatedByGet: "ALL",
        Delivery_Person_Id: "",
        Delivery_Person_Name: "ALL",
        Sales_Person_Id: "",
        Sales_Person_Name: "ALL",
        Cancel_status: 0,
    });
    const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("All");

    const [pageLoad, setPageLoad] = useState(false);

    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
    });

    useEffect(() => {
        fetchLink({
            address: `delivery/deliveryOrderListData?Fromdate=${filters?.Fromdate}&Retailer_Id=${filters?.Retailer_Id}&Sales_Person_Id=${filters?.Sales_Person_Id}&Delivery_Person_Id=${filters?.Delivery_Person_Id}&Created_by=${filters?.Created_by}&Cancel_status=${filters?.Cancel_status}`,
        })
            .then((data) => {
                if (data.success) {
                    setSaleOrders(data?.data);
                    const delivered = data.data.filter(row => row.Delivery_Status === 7).length;
                    const pending = data.data.filter(row => row.Delivery_Status === 1).length;
                    const all = data.data.length;
                    const previousDaySalesCount =
                        data.data.length > 0 ? data.data[0].PreviousDaySalesOrderCount || 0 : 0;



                    setStatusCounts({ all, delivered, pending, previousDaySalesCount });
                }
            })
            .catch((e) => console.error(e));
    }, [
        filters.Fromdate,
        filters?.Retailer_Id,
        filters?.Delivery_Person_Id,
        filters?.Created_by,
        filters?.Cancel_status,
        filters?.Sales_Person_Id,
        reload,
        pageLoad,
    ]);

    useEffect(() => {
        fetchLink({
            address: `dataEntry/costCenter`,
        })
            .then((data) => {
                if (data.success) {
                    setDeliveryPerson(data.data);
                }
            })
            .catch((e) => console.error(e));

        fetchLink({
            address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}`,
        })
            .then((data) => {
                if (data.success) {
                    setRetailers(data.data);
                }
            })
            .catch((e) => console.error(e));

        fetchLink({
            address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`,
        })
            .then((data) => {
                if (data.success) {
                    setSalePerson(data.data);
                }
            })
            .catch((e) => console.error(e));

        fetchLink({
            address: `masters/user/dropDown?Company_id=${storage?.Company_id}`,
        })
            .then((data) => {
                if (data.success) {
                    setUsers(data.data);
                }
            })
            .catch((e) => console.error(e));
    }, []);


    const saleOrderColumn = [
        {
            Field_Name: "Do_Id",
            ColumnHeader: "Delivery ID",
            Fied_Data: "string",
            isVisible: 1,
        },
        {
            Field_Name: "So_No",
            ColumnHeader: "Sale Order ID",
            Fied_Data: "string",
            isVisible: 1,
        },

        {
            Field_Name: "Do_Inv_No",
            ColumnHeader: "Do_Inv_No ",
            Fied_Data: "string",
            isVisible: 1,
            align: "center",
        },
        {
            Field_Name: "Retailer_Name",
            ColumnHeader: "Customer",
            Fied_Data: "string",
            isVisible: 1,
        },
        {
            Field_Name: "SalesDate",
            ColumnHeader: "Sale Order Date",
            Fied_Data: "date",
            isVisible: 1,
            align: "center",
        },
        {
            Field_Name: "Do_Date",
            ColumnHeader: "Delivery Date",
            Fied_Data: "date",
            isVisible: 1,
            align: "center",
        },

        {
            Field_Name: "Total_Before_Tax",
            ColumnHeader: "Before Tax",
            Fied_Data: "number",
            isVisible: 1,
            align: "center",
        },
        {
            Field_Name: "Total_Tax",
            ColumnHeader: "Tax",
            Fied_Data: "number",
            isVisible: 1,
            align: "center",
        },
        {
            Field_Name: "Total_Invoice_value",
            ColumnHeader: "Invoice Value",
            Fied_Data: "number",
            isVisible: 1,
            align: "center",
        },
        {
            Field_Name: "DeliveryStatusName",
            ColumnHeader: "Delivery Status ",
            Fied_Data: "string",
            isVisible: 1,
            align: "center",
        }
    ];

    const ExpendableComponent = ({ row }) => {
        return (
            <>
                <table className="table">
                    <tbody>
                        <tr>
                            <td className="border p-2 bg-light">Branch</td>
                            <td className="border p-2">{row.Branch_Name}</td>
                            <td className="border p-2 bg-light">Delivery Person</td>
                            <td className="border p-2">{row.Delivery_Person_Name}</td>
                            <td className="border p-2 bg-light">Round off</td>
                            <td className="border p-2">{row.Round_off}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Invoice Type</td>
                            <td className="border p-2">
                                {isEqualNumber(row.GST_Inclusive, 1) && "Inclusive"}
                                {isEqualNumber(row.GST_Inclusive, 0) && "Exclusive"}
                            </td>
                            <td className="border p-2 bg-light">Tax Type</td>
                            <td className="border p-2">
                                {isEqualNumber(row.IS_IGST, 1) && "IGST"}
                                {isEqualNumber(row.IS_IGST, 0) && "GST"}
                            </td>
                            <td className="border p-2 bg-light">Sales Person</td>
                            <td className="border p-2">{row.Sales_Person_Name}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Narration</td>
                            <td className="border p-2" colSpan={5}>
                                {row.Narration}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </>
        );
    };



    const closeDialog = () => {
        setDialog({
            ...dialog,
            filters: false,
            orderDetails: false,
        });

    };

    const filteredSalesData = useMemo(() => {
        if (deliveryStatusFilter === "Delivered") {
            return saleOrders.filter(row => row.Delivery_Status === 7);
        } else if (deliveryStatusFilter === "Pending") {
            return saleOrders.filter(row => row.Delivery_Status === 1);
        } else {
            return saleOrders;
        }
    }, [saleOrders, deliveryStatusFilter]);


    return (
        <>
            <Card>
                <div className="p-3 py-2 d-flex align-items-center justify-content-between">
                    <h6 className="fa-18 m-0 p-0">
                        Delivery Orders

                    </h6>
                    <input
                        type={'date'}
                        className='cus-inpt mt-3 w-auto ps-3 border rounded-5 me-1'
                        // min={firstDayOfMonth()}
                        value={filters.Fromdate}
                        onChange={e => setFilters(pre => ({ ...pre, Fromdate: e.target.value }))}
                    />

                    {/* <span>
                        {(
                            // <Tooltip title="Filters">
                                <IconButton
                                    size="small"
                                    onClick={() => setDialog({ ...dialog, filters: true })}
                                >
                                    <FilterAlt />
                                </IconButton>
                            // </Tooltip>
                        )}

                        
                    </span> */}
                </div>

                <div className="mx-2 flex flex-wrap items-center gap-2">
                    <Button className="fw-bold">
                        Sales Order: {statusCounts.previousDaySalesCount}
                    </Button>

                    <Button
                        className={`${deliveryStatusFilter === "All" ? "btn-primary" : "btn-outline-primary"
                            }`}
                        onClick={() => setDeliveryStatusFilter("All")}
                    >
                        All - {statusCounts.all}
                    </Button>

                    <Button
                        className={`${deliveryStatusFilter === "Delivered" ? "btn-success" : "btn-outline-success"
                            }`}
                        onClick={() => setDeliveryStatusFilter("Delivered")}
                    >
                        Delivered - {statusCounts.delivered}
                    </Button>

                    <Button
                        className={`${deliveryStatusFilter === "Pending" ? "btn-warning" : "btn-outline-warning"
                            }`}
                        onClick={() => setDeliveryStatusFilter("Pending")}
                    >
                        Pending - {statusCounts.pending}
                    </Button>
                </div>


                <FilterableTable
                    dataArray={filteredSalesData}
                    columns={saleOrderColumn}
                    isExpendable={true}
                    tableMaxHeight={550}
                    expandableComp={ExpendableComponent}
                />
            </Card>





            <Dialog
                open={dialog.filters}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Retailer</td>
                                    <td>
                                        <Select
                                            value={{
                                                value: filters?.Retailer_Id,
                                                label: filters?.RetailerGet,
                                            }}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    Retailer_Id: e.value,
                                                    RetailerGet: e.label,
                                                })
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...retailers.map((obj) => ({
                                                    value: obj?.Retailer_Id,
                                                    label: obj?.Retailer_Name,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Retailer Name"}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Delivery Person</td>
                                    <td>
                                        <Select
                                            value={{
                                                value: filters?.Delivery_Person_Id,
                                                label: filters?.Delivery_Person_Name,
                                            }}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    Delivery_Person_Id: e.value,
                                                    Delivery_Person_Name: e.label,
                                                })
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...deliveryPerson.map((obj) => ({
                                                    value: obj?.Cost_Center_Id,
                                                    label: obj?.Cost_Center_Name,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Delivery Person Name"}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Sales Person</td>
                                    <td>
                                        <Select
                                            value={{
                                                value: filters?.Sales_Person_Id,
                                                label: filters?.Sales_Person_Name,
                                            }}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    Sales_Person_Id: e.value,
                                                    Sales_Person_Name: e.label,
                                                })
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...salesPerson.map((obj) => ({
                                                    value: obj?.UserId,
                                                    label: obj?.Name,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Delivery Person Name"}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Created By</td>
                                    <td>
                                        <Select
                                            value={{
                                                value: filters?.Created_by,
                                                label: filters?.CreatedByGet,
                                            }}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    Created_by: e.value,
                                                    CreatedByGet: e.label,
                                                })
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...users.map((obj) => ({
                                                    value: obj?.UserId,
                                                    label: obj?.Name,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Delivery Person Name"}
                                        />
                                    </td>
                                </tr>

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


                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeliveryReports;