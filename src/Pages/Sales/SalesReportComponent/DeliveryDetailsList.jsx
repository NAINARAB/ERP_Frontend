// import React, { useState, useEffect } from "react";
// import {
//     Card,
//     CardContent,
//     Button,
//     Dialog,
//     Tooltip,
//     IconButton,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
//     Switch,
// } from "@mui/material";
// // import '../common.css'
// import Select from "react-select";
// import { customSelectStyles } from "../../../Components/tablecolumn";
// import {
//     getPreviousDate,
//     isEqualNumber,
//     ISOString,
//     isValidObject,
// } from "../../../Components/functions";
// // import DeliveryInvoiceTemplate from "../SalesReportComponent/newInvoiceTemplate";
// import { Edit, FilterAlt, Delete, Visibility } from "@mui/icons-material";
// import { fetchLink } from "../../../Components/fetchComponent";
// import FilterableTable from "../../../Components/filterableTable2";
// // import SalesDelivery from "./SalesReportComponent/SalesDeliveryConvert"
// import { toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import NewDeliveryOrder from "./NewDeliveryOrder";
// import DeliveryInvoiceTemplate from "../SalesReportComponent/previewInvoice";
// const DeliveryDetailsList = ({
//     loadingOn,
//     loadingOff,
//     onToggle,
//     reload,
//     triggerReload,
// }) => {
//     const storage = JSON.parse(localStorage.getItem("user"));
//     const [saleOrders, setSaleOrders] = useState([]);
//     const [retailers, setRetailers] = useState([]);
//     const [salesPerson, setSalePerson] = useState([]);
//     const [users, setUsers] = useState([]);
//     const [screen, setScreen] = useState(true);
//     const [orderInfo, setOrderInfo] = useState({});
//     const [viewOrder, setViewOrder] = useState({});

//     const [deleteConfirm, setDeleteConfirm] = useState(false);
//     const [itemTodelete, setItemToDelete] = useState({});
//     const [isDeliveryDetailsVisible, setIsDeliveryDetailsVisible] =
//         useState(false);
//     const [deliveryPerson, setDeliveryPerson] = useState([]);
//     const [filters, setFilters] = useState({
//         Fromdate: getPreviousDate(7),
//         Todate: ISOString(),
//         Retailer_Id: "",
//         RetailerGet: "ALL",
//         Created_by: "",
//         CreatedByGet: "ALL",
//         Delivery_Person_Id: "",
//         Delivery_Person_Name: "ALL",
//         Sales_Person_Id: "",
//         Sales_Person_Name: "ALL",
//         Cancel_status: 0,
//     });

//     const [pageLoad, setPageLoad] = useState(false);

//     const [dialog, setDialog] = useState({
//         filters: false,
//         orderDetails: false,
//     });

//     useEffect(() => {
//         fetchLink({
//             address: `delivery/deliveryOrderList?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}&Retailer_Id=${filters?.Retailer_Id}&Sales_Person_Id=${filters?.Sales_Person_Id}&Delivery_Person_Id=${filters?.Delivery_Person_Id}&Created_by=${filters?.Created_by}&Cancel_status=${filters?.Cancel_status}`,
//         })
//             .then((data) => {
//                 if (data.success) {
//                     setSaleOrders(data?.data);
//                 }
//             })
//             .catch((e) => console.error(e));
//     }, [
//         filters.Fromdate,
//         filters?.Todate,
//         filters?.Retailer_Id,
//         filters?.Delivery_Person_Id,
//         filters?.Created_by,
//         filters?.Cancel_status,
//         filters?.Sales_Person_Id,
//         reload,
//         pageLoad,
//     ]);

//     useEffect(() => {
//         fetchLink({
//             address: `dataEntry/costCenter`,
//         })
//             .then((data) => {
//                 if (data.success) {
//                     setDeliveryPerson(data.data);
//                 }
//             })
//             .catch((e) => console.error(e));

//         fetchLink({
//             address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}`,
//         })
//             .then((data) => {
//                 if (data.success) {
//                     setRetailers(data.data);
//                 }
//             })
//             .catch((e) => console.error(e));

//         fetchLink({
//             address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`,
//         })
//             .then((data) => {
//                 if (data.success) {
//                     setSalePerson(data.data);
//                 }
//             })
//             .catch((e) => console.error(e));

//         fetchLink({
//             address: `masters/user/dropDown?Company_id=${storage?.Company_id}`,
//         })
//             .then((data) => {
//                 if (data.success) {
//                     setUsers(data.data);
//                 }
//             })
//             .catch((e) => console.error(e));
//     }, []);
//     const openDeleteDialog = (itemData) => {
//         setItemToDelete({
//             So_No: itemData.So_No,
//             Do_Id: itemData.Do_Id,
//         });
//         setDeleteConfirm(true);
//     };

//     const saleOrderColumn = [
//         {
//             Field_Name: "Do_Id",
//             ColumnHeader: "Delivery ID",
//             Fied_Data: "string",
//             isVisible: 1,
//         },
//         {
//             Field_Name: "So_No",
//             ColumnHeader: "Sale Order ID",
//             Fied_Data: "string",
//             isVisible: 1,
//         },

//         {
//             Field_Name: "Do_Inv_No",
//             ColumnHeader: "Do_Inv_No ",
//             Fied_Data: "string",
//             isVisible: 1,
//             align: "center",
//         },
//         {
//             Field_Name: "Retailer_Name",
//             ColumnHeader: "Customer",
//             Fied_Data: "string",
//             isVisible: 1,
//         },
//         {
//             Field_Name: "SalesDate",
//             ColumnHeader: "Sale Order Date",
//             Fied_Data: "date",
//             isVisible: 1,
//             align: "center",
//         },
//         {
//             Field_Name: "Do_Date",
//             ColumnHeader: "Delivery Date",
//             Fied_Data: "date",
//             isVisible: 1,
//             align: "center",
//         },

//         {
//             Field_Name: "Total_Before_Tax",
//             ColumnHeader: "Before Tax",
//             Fied_Data: "number",
//             isVisible: 1,
//             align: "center",
//         },
//         {
//             Field_Name: "Total_Tax",
//             ColumnHeader: "Tax",
//             Fied_Data: "number",
//             isVisible: 1,
//             align: "center",
//         },
//         {
//             Field_Name: "Total_Invoice_value",
//             ColumnHeader: "Invoice Value",
//             Fied_Data: "number",
//             isVisible: 1,
//             align: "center",
//         },
//         {
//             Field_Name: "DeliveryStatusName",
//             ColumnHeader: "Delivery Status ",
//             Fied_Data: "string",
//             isVisible: 1,
//             align: "center",
//         },

//         {
//             Field_Name: "Action",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: ({ row }) => {
//                 return (
//                     <>
//                         <Tooltip title="View Order">
//                             <IconButton
//                                 onClick={() => {
//                                     setViewOrder({
//                                         orderDetails: row,
//                                         orderProducts: row?.Products_List ? row?.Products_List : [],
//                                     });
//                                 }}
//                                 onFocus={(e) => {
//                                     e.target.blur();
//                                 }}
//                                 color="primary"
//                                 size="small"
//                             >
//                                 <Visibility className="fa-16" />
//                             </IconButton>
//                         </Tooltip>
//                         <Tooltip title="Edit">
//                             <IconButton
//                                 onClick={() => {
//                                     switchScreen();
//                                     setOrderInfo({ ...row, isEdit: true });
//                                 }}
//                                 size="small"
//                             >
//                                 <Edit className="fa-16" />
//                             </IconButton>
//                         </Tooltip>
//                         <Tooltip title="Delete">
//                             <IconButton onClick={() => openDeleteDialog(row)} size="small">
//                                 <Delete className="fa-16" />
//                             </IconButton>
//                         </Tooltip>
//                     </>
//                 );
//             },
//         },
//     ];

//     const ExpendableComponent = ({ row }) => {
//         return (
//             <>
//                 <table className="table">
//                     <tbody>
//                         <tr>
//                             <td className="border p-2 bg-light">Branch</td>
//                             <td className="border p-2">{row.Branch_Name}</td>
//                             <td className="border p-2 bg-light">Delivery Person</td>
//                             <td className="border p-2">{row.Delivery_Person_Name}</td>
//                             <td className="border p-2 bg-light">Round off</td>
//                             <td className="border p-2">{row.Round_off}</td>
//                         </tr>
//                         <tr>
//                             <td className="border p-2 bg-light">Invoice Type</td>
//                             <td className="border p-2">
//                                 {isEqualNumber(row.GST_Inclusive, 1) && "Inclusive"}
//                                 {isEqualNumber(row.GST_Inclusive, 0) && "Exclusive"}
//                             </td>
//                             <td className="border p-2 bg-light">Tax Type</td>
//                             <td className="border p-2">
//                                 {isEqualNumber(row.IS_IGST, 1) && "IGST"}
//                                 {isEqualNumber(row.IS_IGST, 0) && "GST"}
//                             </td>
//                             <td className="border p-2 bg-light">Sales Person</td>
//                             <td className="border p-2">{row.Sales_Person_Name}</td>
//                         </tr>
//                         <tr>
//                             <td className="border p-2 bg-light">Narration</td>
//                             <td className="border p-2" colSpan={5}>
//                                 {row.Narration}
//                             </td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </>
//         );
//     };

//     const switchScreen = () => {
//         setScreen(!screen);
//         setOrderInfo({});
//         setIsDeliveryDetailsVisible(!isDeliveryDetailsVisible);
//     };

//     const closeDialog = () => {
//         setDialog({
//             ...dialog,
//             filters: false,
//             orderDetails: false,
//         });
//         setOrderInfo({});
//         setDeleteConfirm(false);
//     };

//     const confirmData = async () => {
//         if (!itemTodelete) return;

//         try {
//             const data = await fetchLink({
//                 address: "delivery/deliveryOrder",
//                 method: "DELETE",
//                 bodyData: {
//                     Order_Id: itemTodelete.So_No,
//                     Do_Id: itemTodelete.Do_Id,
//                 },
//             });

//             if (data.success) {
//                 toast.success("Delivery Deleted successfully");

//                 triggerReload();
//                 setDeleteConfirm(false);

//                 setPageLoad((prev) => !prev);
//                 setIsDeliveryDetailsVisible(false);
//             } else {
//                 toast.error(data?.message || "Deletion failed");
//             }
//             // throw error
//         } catch (error) {
//             toast.error("An error occurred while deleting.", error);
//         } finally {
//             setDeleteConfirm(false);
//         }
//     };

//     return (
//         <>
//             <Card>
//                 <div className="p-3 py-2 d-flex align-items-center justify-content-between">
//                     <h6 className="fa-18 m-0 p-0">
//                         {screen
//                             ? "Delivery Orders"
//                             : isValidObject(orderInfo)
//                                 ? "Modify Delivery Order"
//                                 : ""}
//                     </h6>
//                     <span>
//                         {screen && (
//                             <Tooltip title="Filters">
//                                 <IconButton
//                                     size="small"
//                                     onClick={() => setDialog({ ...dialog, filters: true })}
//                                 >
//                                     <FilterAlt />
//                                 </IconButton>
//                             </Tooltip>
//                         )}

//                         {screen && (
//                             <Switch
//                                 checked={!screen}
//                                 onChange={onToggle}
//                                 label={"Delivery Details"}
//                                 inputProps={{ "aria-label": "controlled" }}
//                             />
//                         )}
//                     </span>
//                 </div>

//                 <CardContent className="p-0 ">
//                     {screen ? (
//                         <FilterableTable
//                             dataArray={saleOrders}
//                             columns={saleOrderColumn}
//                             // EnableSerialNumber={true}
//                             isExpendable={true}
//                             tableMaxHeight={550}
//                             expandableComp={ExpendableComponent}
//                         />
//                     ) : (
//                         <NewDeliveryOrder
//                             editValues={orderInfo}
//                             loadingOn={loadingOn}
//                             loadingOff={loadingOff}
//                             reload={() => {
//                                 setScreen((pre) => !pre);
//                             }}
//                             switchScreen={switchScreen}
//                         />
//                     )}
//                 </CardContent>
//             </Card>

//             {Object.keys(viewOrder).length > 0 && (
//                 <DeliveryInvoiceTemplate
//                     orderDetails={viewOrder?.orderDetails}
//                     orderProducts={viewOrder?.orderProducts}
//                     download={true}
//                     actionOpen={true}
//                     clearDetails={() => setViewOrder({})}
//                     TitleText={"Delivery Order"}
//                 />
//             )}

//             <Dialog open={deleteConfirm} fullWidth maxWidth="sm">
//                 <DialogTitle>Delete</DialogTitle>
//                 <DialogContent>
//                     <div>Are You Want to Delete Delivery Details</div>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={closeDialog}>close</Button>
//                     <Button onClick={confirmData}>Delete</Button>
//                 </DialogActions>
//             </Dialog>

//             <Dialog
//                 open={dialog.filters}
//                 onClose={closeDialog}
//                 fullWidth
//                 maxWidth="sm"
//             >
//                 <DialogTitle>Filters</DialogTitle>
//                 <DialogContent>
//                     <div className="table-responsive pb-4">
//                         <table className="table">
//                             <tbody>
//                                 <tr>
//                                     <td style={{ verticalAlign: "middle" }}>Retailer</td>
//                                     <td>
//                                         <Select
//                                             value={{
//                                                 value: filters?.Retailer_Id,
//                                                 label: filters?.RetailerGet,
//                                             }}
//                                             onChange={(e) =>
//                                                 setFilters({
//                                                     ...filters,
//                                                     Retailer_Id: e.value,
//                                                     RetailerGet: e.label,
//                                                 })
//                                             }
//                                             options={[
//                                                 { value: "", label: "ALL" },
//                                                 ...retailers.map((obj) => ({
//                                                     value: obj?.Retailer_Id,
//                                                     label: obj?.Retailer_Name,
//                                                 })),
//                                             ]}
//                                             styles={customSelectStyles}
//                                             isSearchable={true}
//                                             placeholder={"Retailer Name"}
//                                         />
//                                     </td>
//                                 </tr>

//                                 <tr>
//                                     <td style={{ verticalAlign: "middle" }}>Delivery Person</td>
//                                     <td>
//                                         <Select
//                                             value={{
//                                                 value: filters?.Delivery_Person_Id,
//                                                 label: filters?.Delivery_Person_Name,
//                                             }}
//                                             onChange={(e) =>
//                                                 setFilters({
//                                                     ...filters,
//                                                     Delivery_Person_Id: e.value,
//                                                     Delivery_Person_Name: e.label,
//                                                 })
//                                             }
//                                             options={[
//                                                 { value: "", label: "ALL" },
//                                                 ...deliveryPerson.map((obj) => ({
//                                                     value: obj?.User_Id,
//                                                     label: obj?.UserGet,
//                                                 })),
//                                             ]}
//                                             styles={customSelectStyles}
//                                             isSearchable={true}
//                                             placeholder={"Delivery Person Name"}
//                                         />
//                                     </td>
//                                 </tr>
//                                 {/* <tr>
//                                     <td style={{ verticalAlign: "middle" }}>Sales Person</td>
//                                     <td>
//                                         <Select
//                                             value={{
//                                                 value: filters?.Sales_Person_Id,
//                                                 label: filters?.Sales_Person_Name,
//                                             }}
//                                             onChange={(e) =>
//                                                 setFilters({
//                                                     ...filters,
//                                                     Sales_Person_Id: e.value,
//                                                     Sales_Person_Name: e.label,
//                                                 })
//                                             }
//                                             options={[
//                                                 { value: "", label: "ALL" },
//                                                 ...salesPerson.map((obj) => ({
//                                                     value: obj?.UserId,
//                                                     label: obj?.Name,
//                                                 })),
//                                             ]}
//                                             styles={customSelectStyles}
//                                             isSearchable={true}
//                                             placeholder={"Delivery Person Name"}
//                                         />
//                                     </td>
//                                 </tr> */}

//                                 <tr>
//                                     <td style={{ verticalAlign: "middle" }}>Sales Person</td>
//                                     <td>
//                                         <Select
//                                             value={{
//                                                 value: filters?.Sales_Person_Id,
//                                                 label: filters?.Sales_Person_Name,
//                                             }}
//                                             onChange={(e) =>
//                                                 setFilters({
//                                                     ...filters,
//                                                     Sales_Person_Id: e.value,
//                                                     Sales_Person_Name: e.label,
//                                                 })
//                                             }
//                                             options={[
//                                                 { value: "", label: "ALL" },
//                                                 ...salesPerson.map((obj) => ({
//                                                     value: obj?.UserId,
//                                                     label: obj?.Name,
//                                                 })),
//                                             ]}
//                                             styles={{
//                                                 ...customSelectStyles,
//                                                 menu: (provided) => ({
//                                                     ...provided,
//                                                     zIndex: 9999,
//                                                 }),
//                                             }}
//                                             isSearchable={true}
//                                             placeholder={"Sales Person Name"}
//                                             menuPortalTarget={document.body}
//                                             menuPosition="fixed"
//                                         />
//                                     </td>
//                                 </tr>

//                                 <tr>
//                                     <td style={{ verticalAlign: "middle" }}>Created By</td>
//                                     <td>
//                                         <Select
//                                             value={{
//                                                 value: filters?.Created_by,
//                                                 label: filters?.CreatedByGet,
//                                             }}
//                                             onChange={(e) =>
//                                                 setFilters({
//                                                     ...filters,
//                                                     Created_by: e.value,
//                                                     CreatedByGet: e.label,
//                                                 })
//                                             }
//                                             options={[
//                                                 { value: "", label: "ALL" },
//                                                 ...users.map((obj) => ({
//                                                     value: obj?.UserId,
//                                                     label: obj?.Name,
//                                                 })),
//                                             ]}
//                                             styles={customSelectStyles}
//                                             isSearchable={true}
//                                             placeholder={"Delivery Person Name"}
//                                         />
//                                     </td>
//                                 </tr>

//                                 <tr>
//                                     <td style={{ verticalAlign: "middle" }}>From</td>
//                                     <td>
//                                         <input
//                                             type="date"
//                                             value={filters.Fromdate}
//                                             onChange={(e) =>
//                                                 setFilters({ ...filters, Fromdate: e.target.value })
//                                             }
//                                             className="cus-inpt"
//                                         />
//                                     </td>
//                                 </tr>

//                                 <tr>
//                                     <td style={{ verticalAlign: "middle" }}>To</td>
//                                     <td>
//                                         <input
//                                             type="date"
//                                             value={filters.Todate}
//                                             onChange={(e) =>
//                                                 setFilters({ ...filters, Todate: e.target.value })
//                                             }
//                                             className="cus-inpt"
//                                         />
//                                     </td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={closeDialog}>close</Button>
//                 </DialogActions>
//             </Dialog>
//         </>
//     );
// };

// export default DeliveryDetailsList;












import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    Button,
    Dialog,
    Tooltip,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogActions,
    Switch,
} from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import {
    getPreviousDate,
    isEqualNumber,
    ISOString,
    isValidObject,
} from "../../../Components/functions";
import { Edit, FilterAlt, Delete, Visibility } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable from "../../../Components/filterableTable2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NewDeliveryOrder from "./NewDeliveryOrder";
import DeliveryInvoiceTemplate from "../SalesReportComponent/previewInvoice";

const DeliveryDetailsList = ({
    loadingOn,
    loadingOff,
    onToggle,
    reload,
    triggerReload,
}) => {
    const storage = JSON.parse(localStorage.getItem("user"));
    const [saleOrders, setSaleOrders] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [salesPerson, setSalePerson] = useState([]);
    const [users, setUsers] = useState([]);
    const [screen, setScreen] = useState(true);
    const [orderInfo, setOrderInfo] = useState({});
    const [viewOrder, setViewOrder] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [itemTodelete, setItemToDelete] = useState({});
    const [isDeliveryDetailsVisible, setIsDeliveryDetailsVisible] =
        useState(false);
    const [deliveryPerson, setDeliveryPerson] = useState([]);

    // filters state (applied filters)
    const [filters, setFilters] = useState({
        Fromdate: getPreviousDate(7),
        Todate: ISOString(),
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

    // temp filters (used in dialog before applying)
    const [tempFilters, setTempFilters] = useState(filters);

    const [pageLoad, setPageLoad] = useState(false);

    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
    });




    useEffect(() => {
    if (loadingOn) loadingOn();

    fetchLink({
        address: `delivery/deliveryOrderList?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}&Retailer_Id=${filters?.Retailer_Id}&Sales_Person_Id=${filters?.Sales_Person_Id}&Delivery_Person_Id=${filters?.Delivery_Person_Id}&Created_by=${filters?.Created_by}&Cancel_status=${filters?.Cancel_status}`,
    })
        .then((data) => {
            if (data.success) {
                setSaleOrders(data?.data);
            }
        })
        .catch((e) => {
            console.error("Error fetching delivery orders:", e);
        })
        .finally(() => {
            if (loadingOff) loadingOff();
        });
}, [filters, pageLoad]);

    // fetch dropdown data
    useEffect(() => {
        fetchLink({ address: `dataEntry/costCenter` })
            .then((data) => data.success && setDeliveryPerson(data.data))
            .catch((e) => console.error(e));

        fetchLink({ address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}` })
            .then((data) => data.success && setRetailers(data.data))
            .catch((e) => console.error(e));

        fetchLink({ address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}` })
            .then((data) => data.success && setSalePerson(data.data))
            .catch((e) => console.error(e));

        fetchLink({ address: `masters/user/dropDown?Company_id=${storage?.Company_id}` })
            .then((data) => data.success && setUsers(data.data))
            .catch((e) => console.error(e));
    }, []);

    const openDeleteDialog = (itemData) => {
        setItemToDelete({ So_No: itemData.So_No, Do_Id: itemData.Do_Id });
        setDeleteConfirm(true);
    };

    // const saleOrderColumn = [
    //     { Field_Name: "Do_Id", ColumnHeader: "Delivery ID", Fied_Data: "string", isVisible: 1 },
    //     { Field_Name: "So_No", ColumnHeader: "Sale Order ID", Fied_Data: "string", isVisible: 1 },
    //     { Field_Name: "Do_Inv_No", ColumnHeader: "Do_Inv_No", Fied_Data: "string", isVisible: 1, align: "center" },
    //     { Field_Name: "Retailer_Name", ColumnHeader: "Customer", Fied_Data: "string", isVisible: 1 },
    //     { Field_Name: "SalesDate", ColumnHeader: "Sale Order Date", Fied_Data: "date", isVisible: 1, align: "center" },
    //     { Field_Name: "Do_Date", ColumnHeader: "Delivery Date", Fied_Data: "date", isVisible: 1, align: "center" },
    //     { Field_Name: "Total_Before_Tax", ColumnHeader: "Before Tax", Fied_Data: "number", isVisible: 1, align: "center" },
    //     { Field_Name: "Total_Tax", ColumnHeader: "Tax", Fied_Data: "number", isVisible: 1, align: "center" },
    //     { Field_Name: "Total_Invoice_value", ColumnHeader: "Invoice Value", Fied_Data: "number", isVisible: 1, align: "center" },
    //     { Field_Name: "DeliveryStatusName", ColumnHeader: "Delivery Status", Fied_Data: "string", isVisible: 1, align: "center" },
    //     {
    //         Field_Name: "Action",
    //         isVisible: 1,
    //         isCustomCell: true,
    //         Cell: ({ row }) => (
    //             <>
    //                 <Tooltip title="View Order">
    //                     <IconButton
    //                         onClick={() => {
    //                             setViewOrder({
    //                                 orderDetails: row,
    //                                 orderProducts: row?.Products_List ? row?.Products_List : [],
    //                             });
    //                         }}
    //                         onFocus={(e) => e.target.blur()}
    //                         color="primary"
    //                         size="small"
    //                     >
    //                         <Visibility className="fa-16" />
    //                     </IconButton>
    //                 </Tooltip>
    //                 <Tooltip title="Edit">
    //                     <IconButton
    //                         onClick={() => {
    //                             switchScreen();
    //                             setOrderInfo({ ...row, isEdit: true });
    //                         }}
    //                         size="small"
    //                     >
    //                         <Edit className="fa-16" />
    //                     </IconButton>
    //                 </Tooltip>
    //                 <Tooltip title="Delete">
    //                     <IconButton onClick={() => openDeleteDialog(row)} size="small">
    //                         <Delete className="fa-16" />
    //                     </IconButton>
    //                 </Tooltip>
    //             </>
    //         ),
    //     },
    // ];

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
        },

        {
            Field_Name: "Action",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => {
                return (
                    <>
                        <Tooltip title="View Order">
                            <IconButton
                                onClick={() => {
                                    setViewOrder({
                                        orderDetails: row,
                                        orderProducts: row?.Products_List ? row?.Products_List : [],
                                    });
                                }}
                                onFocus={(e) => {
                                    e.target.blur();
                                }}
                                color="primary"
                                size="small"
                            >
                                <Visibility className="fa-16" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
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
                        <Tooltip title="Delete">
                            <IconButton onClick={() => openDeleteDialog(row)} size="small">
                                <Delete className="fa-16" />
                            </IconButton>
                        </Tooltip>
                    </>
                );
            },
        },
    ];
    const ExpendableComponent = ({ row }) => (
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
    );

    const switchScreen = () => {
        setScreen(!screen);
        setOrderInfo({});
        setIsDeliveryDetailsVisible(!isDeliveryDetailsVisible);
    };

    const closeDialog = () => {
        setDialog({ ...dialog, filters: false, orderDetails: false });
        setOrderInfo({});
        setDeleteConfirm(false);
    };

    const confirmData = async () => {
        if (!itemTodelete) return;
        try {
            const data = await fetchLink({
                address: "delivery/deliveryOrder",
                method: "DELETE",
                bodyData: {
                    Order_Id: itemTodelete.So_No,
                    Do_Id: itemTodelete.Do_Id,
                },
            });
            if (data.success) {
                toast.success("Delivery Deleted successfully");
                triggerReload();
                setDeleteConfirm(false);
                setPageLoad((prev) => !prev);
                setIsDeliveryDetailsVisible(false);
            } else {
                toast.error(data?.message || "Deletion failed");
            }
        } catch (error) {
            toast.error("An error occurred while deleting.", error);
        } finally {
            setDeleteConfirm(false);
        }
    };

    return (
        <>
            <Card>
                <div className="p-3 py-2 d-flex align-items-center justify-content-between">
                    <h6 className="fa-18 m-0 p-0">
                        {screen
                            ? "Delivery Orders"
                            : isValidObject(orderInfo)
                                ? "Modify Delivery Order"
                                : ""}
                    </h6>
                    <span>
                        {screen && (
                            <Tooltip title="Filters">
                                <IconButton
                                    size="small"
                                    onClick={() => setDialog({ ...dialog, filters: true })}
                                >
                                    <FilterAlt />
                                </IconButton>
                            </Tooltip>
                        )}
                        {screen && (
                            <Switch
                                checked={!screen}
                                onChange={onToggle}
                                label={"Delivery Details"}
                                inputProps={{ "aria-label": "controlled" }}
                            />
                        )}
                    </span>
                </div>

                <CardContent className="p-0 ">
                    {screen ? (
                        <FilterableTable
                            dataArray={saleOrders}
                            columns={saleOrderColumn}
                            isExpendable={true}
                            tableMaxHeight={550}
                            expandableComp={ExpendableComponent}
                        />
                    ) : (
                        <NewDeliveryOrder
                            editValues={orderInfo}
                            loadingOn={loadingOn}
                            loadingOff={loadingOff}
                            reload={() => {
                                setScreen((pre) => !pre);
                            }}
                            switchScreen={switchScreen}
                        />
                    )}
                </CardContent>
            </Card>

            {Object.keys(viewOrder).length > 0 && (
                <DeliveryInvoiceTemplate
                    orderDetails={viewOrder?.orderDetails}
                    orderProducts={viewOrder?.orderProducts}
                    download={true}
                    actionOpen={true}
                    clearDetails={() => setViewOrder({})}
                    TitleText={"Delivery Order"}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteConfirm} fullWidth maxWidth="sm">
                <DialogTitle>Delete</DialogTitle>
                <DialogContent>
                    <div>Are You Want to Delete Delivery Details</div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Close</Button>
                    <Button onClick={confirmData}>Delete</Button>
                </DialogActions>
            </Dialog>

            {/* Filters Dialog */}
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
                                                value: tempFilters?.Retailer_Id,
                                                label: tempFilters?.RetailerGet,
                                            }}
                                            onChange={(e) =>
                                                setTempFilters({
                                                    ...tempFilters,
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
                                                value: tempFilters?.Delivery_Person_Id,
                                                label: tempFilters?.Delivery_Person_Name,
                                            }}
                                            onChange={(e) =>
                                                setTempFilters({
                                                    ...tempFilters,
                                                    Delivery_Person_Id: e.value,
                                                    Delivery_Person_Name: e.label,
                                                })
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...deliveryPerson.map((obj) => ({
                                                    value: obj?.User_Id,
                                                    label: obj?.UserGet,
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
                                                value: tempFilters?.Sales_Person_Id,
                                                label: tempFilters?.Sales_Person_Name,
                                            }}
                                            onChange={(e) =>
                                                setTempFilters({
                                                    ...tempFilters,
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
                                            styles={{
                                                ...customSelectStyles,
                                                menu: (provided) => ({
                                                    ...provided,
                                                    zIndex: 9999,
                                                }),
                                            }}
                                            isSearchable={true}
                                            placeholder={"Sales Person Name"}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Created By</td>
                                    <td>
                                        <Select
                                            value={{
                                                value: tempFilters?.Created_by,
                                                label: tempFilters?.CreatedByGet,
                                            }}
                                            onChange={(e) =>
                                                setTempFilters({
                                                    ...tempFilters,
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
                                            placeholder={"Created By"}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={tempFilters.Fromdate}
                                            onChange={(e) =>
                                                setTempFilters({ ...tempFilters, Fromdate: e.target.value })
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
                                            value={tempFilters.Todate}
                                            onChange={(e) =>
                                                setTempFilters({ ...tempFilters, Todate: e.target.value })
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
                    <Button onClick={closeDialog}>Close</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setFilters(tempFilters);
                            setDialog({ ...dialog, filters: false });
                        }}
                    >
                        Search
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default DeliveryDetailsList;




