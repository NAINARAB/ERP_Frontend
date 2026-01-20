// import { useState, useEffect, useMemo } from "react";
// import {
//     Button,
//     Dialog,
//     Tooltip,
//     IconButton,
//     DialogTitle,
//     DialogContent,
//     DialogActions,
// } from "@mui/material";
// import Select from "react-select";
// import { customSelectStyles } from "../../../Components/tablecolumn";
// import {
//     Addition,
//     getSessionFiltersByPageId,
//     ISOString,
//     NumberFormat,
//     reactSelectFilterLogic,
//     setSessionFilters,
//     toNumber,
// } from "../../../Components/functions";
// import InvoiceBillTemplate from "../SalesReportComponent/newInvoiceTemplate";
// import { Add, Edit, FilterAlt, Search, Visibility } from "@mui/icons-material";
// import { convertedStatus } from "../convertedStatus";
// import { fetchLink } from "../../../Components/fetchComponent";
// import FilterableTable, { createCol } from "../../../Components/filterableTable2";
// import { useNavigate } from "react-router-dom";
// import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
// import DirectSaleInvoiceFromPos from "../SalesInvoice/directSaleInvoiceFromPos";
// import { isGraterNumber, isEqualNumber } from "../../../Components/functions";

// const SaleOrderList = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
//     const sessionValue = sessionStorage.getItem("filterValues");
//     const defaultFilters = {
//         Fromdate: ISOString(),
//         Todate: ISOString(),
//         Retailer: { value: "", label: "ALL" },
//         CreatedBy: { value: "", label: "ALL" },
//         SalesPerson: { value: "", label: "ALL" },
//         VoucherType: { value: "", label: "ALL" },
//         Cancel_status: 0,
//         OrderStatus: { value: "", label: "ALL" },
//     };

//     const storage = JSON.parse(localStorage.getItem("user"));
//     const navigate = useNavigate();
//     const [saleOrders, setSaleOrders] = useState([]);
//     const [retailers, setRetailers] = useState([]);
//     const [salesPerson, setSalePerson] = useState([]);
//     const [users, setUsers] = useState([]);
//     const [voucher, setVoucher] = useState([]);
//     const [viewOrder, setViewOrder] = useState({});
//     const [loading, setLoading] = useState(false);

//     const [selectedOrder, setSelectedOrder] = useState(null);
//     const [modalOpen, setModalOpen] = useState(false);
//     const [filters, setFilters] = useState(defaultFilters);

//     const [dialog, setDialog] = useState({
//         filters: false,
//         orderDetails: false,
//     });

//     useEffect(() => {
//         const otherSessionFiler = getSessionFiltersByPageId(pageID);
//         const {
//             Fromdate,
//             Todate,
//             Retailer = defaultFilters.Retailer,
//             CreatedBy = defaultFilters.CreatedBy,
//             SalesPerson = defaultFilters.SalesPerson,
//             VoucherType = defaultFilters.VoucherType,
//             Cancel_status = defaultFilters.Cancel_status,
//             OrderStatus = defaultFilters.OrderStatus,
//         } = otherSessionFiler;

//         setFilters((pre) => ({
//             ...pre,
//             Fromdate,
//             Todate,
//             Retailer,
//             CreatedBy,
//             SalesPerson,
//             VoucherType,
//             Cancel_status,
//             OrderStatus,
//         }));
//     }, [sessionValue, pageID]);


//     //  const buildSaleOrderPayload = (data) => {

//     //     const extractWeightFromName = (name) => {
//     //       const match = name?.match(/(\d+)\s?kg/i);
//     //       return match ? parseInt(match[1]) : 1;
//     //     };

//     //     const validProducts = Array.isArray(data.ProductList)
//     //       ? data.ProductList.filter((p) => Number(p?.Bill_Qty) > 0).map((p) => {
//     //           const weight = extractWeightFromName(p?.Product_Name);
//     //           return {
//     //             ...p,
//     //             Pre_Id: data?.Pre_Id,
//     //             Bill_Qty: (Number(p?.Bill_Qty) || 0) * (Number(p?.PackValue) || 1),
//     //             Act_Qty: Number(p?.Total_Qty) || 0,
//     //             Total_Qty: Number(p?.Bill_Qty) || 0,
//     //           };
//     //         })
//     //       : [];

//     //     const transformStaffData = (orderData) => {
//     //       const staffs = [];
//     //       if (orderData.Broker_Id && orderData.Broker_Id !== 0) {
//     //         staffs.push({
//     //           Id: "",
//     //           So_Id: "",
//     //           Emp_Id: orderData.Broker_Id,
//     //           Emp_Type_Id: orderData.Broker_Type || 0,
//     //         });
//     //       }
//     //       if (orderData.Transporter_Id && orderData.Transporter_Id !== 0) {
//     //         staffs.push({
//     //           Id: "",
//     //           Do_Id: "",
//     //           Emp_Id: orderData.Transporter_Id,
//     //           Emp_Type_Id: orderData.TrasnportType || 0,
//     //         });
//     //       }
//     //       return staffs.filter((s) => s.Emp_Type_Id !== 0);
//     //     };

//     //     return {
//     //       ...data,
//     //       Product_Array: validProducts,
//     //       Retailer_Id: Number(data?.Retailer_Id) || 0, 
//     //       Retailer_Name: data?.Retailer_Name || "",
//     //       Staffs_Array: transformStaffData(data),
//     //     };
//     //   };


//     const buildSaleOrderPayload = (data) => {
//         const extractWeightFromName = (name) => {
//             const match = name?.match(/(\d+)\s?kg/i);
//             return match ? parseInt(match[1]) : 1;
//         };

//         // Only include products with Bill_Qty > 0
//         const validProducts = Array.isArray(data.ProductList)
//             ? data.ProductList
//                 .filter((p) => Number(p?.Bill_Qty) > 0) // Remove products with Bill_Qty 0
//                 .map((p) => {
//                     const weight = extractWeightFromName(p?.Product_Name);
//                     return {
//                         ...p,
//                         Pre_Id: data?.Pre_Id,
//                         Bill_Qty: (Number(p?.Bill_Qty) || 0) * (Number(p?.PackValue) || 1),
//                         Act_Qty: Number(p?.Total_Qty) || 0,
//                         Total_Qty: Number(p?.Bill_Qty) || 0,
//                     };
//                 })
//             : [];

//         const transformStaffData = (orderData) => {
//             const staffs = [];
//             if (orderData.Broker_Id && orderData.Broker_Id !== 0) {
//                 staffs.push({
//                     Id: "",
//                     So_Id: "",
//                     Emp_Id: orderData.Broker_Id,
//                     Emp_Type_Id: orderData.Broker_Type || 0,
//                 });
//             }
//             if (orderData.Transporter_Id && orderData.Transporter_Id !== 0) {
//                 staffs.push({
//                     Id: "",
//                     Do_Id: "",
//                     Emp_Id: orderData.Transporter_Id,
//                     Emp_Type_Id: orderData.TrasnportType || 0,
//                 });
//             }
//             return staffs.filter((s) => s.Emp_Type_Id !== 0);
//         };

//         return {
//             ...data,
//             Product_Array: validProducts, // Only products with Bill_Qty > 0
//             Retailer_Id: Number(data?.Retailer_Id) || 0,
//             Retailer_Name: data?.Retailer_Name || "",
//             Staffs_Array: transformStaffData(data),
//         };
//     };


//     const handleOpenModal = (row) => {
//         const payload = buildSaleOrderPayload(row);

//         const productChanges = (row?.ProductList || row?.Products_List || []).map(
//             (item) => {
//                 const orderedQty = Number(item.Bill_Qty) || 0;
//                 const totalQty = Number(item?.Total_Qty) || 0;

//                 const deliveredQty = (row?.ConvertedInvoice || [])
//                     .flatMap((inv) => inv?.InvoicedProducts || [])
//                     .filter((p) => p.Item_Id === item.Item_Id)
//                     .reduce((sum, p) => sum + (Number(p?.Bill_Qty) || 0), 0);

//                 const remainingQty = Math.max(orderedQty - deliveredQty, 0);

//                 return {
//                     ...item,
//                     Ordered_Qty: orderedQty,
//                     Delivered_Qty: deliveredQty,
//                     Act_Qty: totalQty,
//                     Bill_Qty: remainingQty,
//                     Amount: remainingQty * (Number(item.Item_Rate) || 0),
//                 };
//             }
//         );

//         const updatedRow = {
//             ...row,
//             Do_Date: row?.So_Date,
//             ProductList: productChanges,
//             Staffs_Array:
//                 row?.Staff_Involved_List?.map((item) => ({
//                     Staff_Id: item.Involved_Emp_Id,
//                     Cost_Cat_Id: item.Cost_Center_Type_Id,
//                     Cost_Cat_Name: item.Cost_Center_Type,
//                 })) || [],
//             Retailer_Id: Number(row?.Retailer_Id) || 0,
//             Retailer_Name: row?.Retailer_Name || "",
//         };



//         setSelectedOrder({
//             row: updatedRow,
//             payload,
//         });

//         setModalOpen(true);
//     };

//     const handleCloseModal = () => {
//         setModalOpen(false);
//         setSelectedOrder(null);
//     };
//     useEffect(() => {
//         fetchLink({
//             address: `sales/saleOrder/retailers`,
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

//         fetchLink({
//             address: `masters/voucher`,
//         })
//             .then((data) => {
//                 if (data.success) {
//                     setVoucher(data.data);
//                 }
//             })
//             .catch((e) => console.error(e));
//     }, []);

//     // useEffect(() => {
//     //   const otherSessionFiler = getSessionFiltersByPageId(pageID);
//     //   const {
//     //     Fromdate,
//     //     Todate,
//     //     Retailer = defaultFilters.Retailer,
//     //     CreatedBy = defaultFilters.CreatedBy,
//     //     SalesPerson = defaultFilters.SalesPerson,
//     //     VoucherType = defaultFilters.VoucherType,
//     //     Cancel_status = defaultFilters.Cancel_status,
//     //   } = otherSessionFiler;

//     //   fetchLink({
//     //     address: `sales/saleOrder?
//     //           Fromdate=${Fromdate}&
//     //           Todate=${Todate}&
//     //           Retailer_Id=${Retailer?.value}&
//     //           Sales_Person_Id=${SalesPerson?.value}&
//     //           Created_by=${CreatedBy?.value}&
//     //           VoucherType=${VoucherType?.value}&
//     //           Cancel_status=${Cancel_status}&
//     //           OrderStatus=${filters?.OrderStatus?.value || ""}`,
//     //     loadingOn,
//     //     loadingOff,
//     //   })
//     //     .then((data) => {
//     //       if (data.success) {
//     //         setSaleOrders(data?.data);
//     //       }
//     //     })
//     //     .catch((e) => console.error(e));
//     // }, [sessionValue, pageID]);


//     const fetchSaleOrders = () => {
//         const otherSessionFiler = getSessionFiltersByPageId(pageID);
//         const {
//             Fromdate,
//             Todate,
//             Retailer = defaultFilters.Retailer,
//             CreatedBy = defaultFilters.CreatedBy,
//             SalesPerson = defaultFilters.SalesPerson,
//             VoucherType = defaultFilters.VoucherType,
//             Cancel_status = defaultFilters.Cancel_status,
//         } = otherSessionFiler;

//         fetchLink({
//             address: `sales/saleOrder?
//       Fromdate=${Fromdate}&
//       Todate=${Todate}&
//       Retailer_Id=${Retailer?.value}&
//       Sales_Person_Id=${SalesPerson?.value}&
//       Created_by=${CreatedBy?.value}&
//       VoucherType=${VoucherType?.value}&
//       Cancel_status=${Cancel_status}&
//       OrderStatus=${filters?.OrderStatus?.value || ""}`,
//             loadingOn,
//             loadingOff,
//         })
//             .then((data) => {
//                 if (data.success) {
//                     setSaleOrders(data?.data);
//                 }
//             })
//             .catch((e) => console.error(e));
//     };

//     useEffect(() => {
//         fetchSaleOrders();
//     }, [sessionValue, pageID]);




//     const ExpendableComponent = ({ row, handleOpenModal }) => {
//         const getDeliveredQty = (product) => {
//             let deliveredQty = 0;

//             if (row.ConvertedInvoice?.length > 0) {
//                 row.ConvertedInvoice.forEach((invoice) => {
//                     if (invoice.InvoicedProducts?.length > 0) {
//                         invoice.InvoicedProducts.forEach((ip) => {
//                             if (Number(ip.Item_Id) === Number(product.Item_Id)) {
//                                 deliveredQty += Number(ip.Bill_Qty || 0);
//                             }
//                         });
//                     }
//                 });
//             }
//             return deliveredQty;
//         };

//         const hasPending = row.Products_List?.some((product) => {
//             const deliveredQty = getDeliveredQty(product);
//             return Number(product.Bill_Qty) - deliveredQty > 0;
//         });

//         return (
//             <>
//                 <table className="table">
//                     <tbody>
//                         <tr>
//                             <td className="border p-2 bg-light">Branch</td>
//                             <td className="border p-2">{row.Branch_Name}</td>
//                             <td className="border p-2 bg-light">Sales Person</td>
//                             <td className="border p-2">{row.Sales_Person_Name}</td>
//                             <td className="border p-2 bg-light">Round off</td>
//                             <td className="border p-2">{row.Round_off}</td>
//                         </tr>
//                         <tr>
//                             <td className="border p-2 bg-light">Invoice Type</td>
//                             <td className="border p-2">
//                                 {isEqualNumber(row.GST_Inclusive, 1) && 'Inclusive'}
//                                 {isEqualNumber(row.GST_Inclusive, 0) && 'Exclusive'}
//                             </td>
//                             <td className="border p-2 bg-light">Tax Type</td>
//                             <td className="border p-2">
//                                 {isEqualNumber(row.IS_IGST, 1) && 'IGST'}
//                                 {isEqualNumber(row.IS_IGST, 0) && 'GST'}
//                             </td>
//                             <td className="border p-2 bg-light">Sales Person</td>
//                             <td className="border p-2">{row.Sales_Person_Name}</td>
//                         </tr>
//                         <tr>
//                             <td className="border p-2 bg-light">Narration</td>
//                             <td className="border p-2" colSpan={5}>{row.Narration}</td>
//                         </tr>
//                     </tbody>
//                 </table>
//                 <table className="table table-bordered">
//                     <thead className="bg-light">

//                         <tr>
//                             <th className="p-2">Product</th>
//                             <th className="p-2">Ordered Qty</th>
//                             <th className="p-2">Delivered Qty</th>
//                             <th className="p-2">
//                                 Pending Qty
//                                 {hasPending && (
//                                     <IconButton size="small" onClick={() => handleOpenModal(row)}>
//                                         <ArrowOutwardIcon className="text-blue-600" />
//                                     </IconButton>
//                                 )}
//                             </th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {row.Products_List?.map((product, index) => {
//                             const deliveredQty = getDeliveredQty(product);
//                             const pendingQty = Number(product.Bill_Qty) - deliveredQty;

//                             return (
//                                 <tr key={index}>
//                                     <td className="p-2">{product.Product_Name}</td>
//                                     <td className="p-2">{product.Bill_Qty}</td>
//                                     <td className="p-2">{deliveredQty}</td>
//                                     <td
//                                         className={`p-2 font-bold ${pendingQty === 0 ? "text-green-600" : "text-red-600"
//                                             }`}
//                                     >
//                                         {pendingQty}
//                                     </td>
//                                 </tr>
//                             );
//                         })}
//                     </tbody>
//                 </table>
//             </>
//         );
//     };

//     const closeDialog = () => {
//         setDialog({
//             ...dialog,
//             filters: false,
//             orderDetails: false,
//         });
//     };

//     const Total_Invoice_value = useMemo(
//         () =>
//             saleOrders.reduce(
//                 (acc, orders) => Addition(acc, orders?.Total_Invoice_value),
//                 0
//             ),
//         [saleOrders]
//     );

//     return (
//         <>
//             <FilterableTable
//                 title="Sale Orders"
//                 dataArray={saleOrders}
//                 EnableSerialNumber
//                 columns={[
//                     createCol("So_Date", "date", "Date"),
//                     createCol("So_Inv_No", "string", "ID"),
//                     createCol("Retailer_Name", "string", "Customer"),
//                     createCol("VoucherTypeGet", "string", "Voucher"),
//                     createCol("Total_Before_Tax", "number", "Before Tax"),
//                     createCol("Total_Tax", "number", "Tax"),
//                     createCol("Total_Invoice_value", "number", "Invoice Value"),
//                     // {
//                     //   ColumnHeader: "Status",
//                     //   isVisible: 1,
//                     //   align: "center",
//                     //   isCustomCell: true,
//                     //   Cell: ({ row }) => {
//                     //     const convert = convertedStatus.find(
//                     //       (status) => status.id === Number(row?.isConverted)
//                     //     );
//                     //     return (
//                     //       <span
//                     //         className={
//                     //           "py-0 fw-bold px-2 rounded-4 fa-12 " +
//                     //           (convert?.color ?? "bg-secondary text-white")
//                     //         }
//                     //       >
//                     //         {convert?.label ?? "Undefined"}
//                     //       </span>
//                     //     );
//                     //   },
//                     // },
//                     {
//                         ColumnHeader: "Status",
//                         isVisible: 1,
//                         align: "center",
//                         isCustomCell: true,
//                         Cell: ({ row }) => {


//                             if (Number(row?.Cancel_status) === 3) {
//                                 return (
//                                     <span className="py-0 fw-bold px-2 rounded-4 fa-12 bg-danger text-white">
//                                         Cancelled
//                                     </span>
//                                 );
//                             }


//                             const orderedQty = row?.Products_List?.reduce(
//                                 (sum, p) => sum + (Number(p?.Bill_Qty) || 0),
//                                 0
//                             ) || 0;

//                             const deliveredQty = row?.ConvertedInvoice?.reduce((sum, d) => {
//                                 const items = d?.InvoicedProducts || [];
//                                 return (
//                                     sum +
//                                     items.reduce(
//                                         (sub, prod) => sub + (Number(prod?.Bill_Qty) || 0),
//                                         0
//                                     )
//                                 );
//                             }, 0) || 0;


//                             const pendingQty = orderedQty - deliveredQty;


//                             const isCompleted = pendingQty <= 0;

//                             const status = isCompleted ? "Completed" : "Pending";
//                             const statusColor = isCompleted
//                                 ? "bg-success text-white"
//                                 : "bg-warning text-dark";

//                             return (
//                                 <span
//                                     className={`py-0 fw-bold px-2 rounded-4 fa-12 ${statusColor}`}
//                                 >
//                                     {status}
//                                 </span>
//                             );
//                         },
//                     },

//                     //     {
//                     //     ColumnHeader: "Created_By",
//                     //     isVisible: 1,
//                     //     align: "center",
//                     //     isCustomCell: true,
//                     //     Cell: ({ row }) => {
//                     //        {row?.Created_BY_Name}

//                     //     },
//                     // },
//                     createCol("Created_BY_Name", "string", "Created_By"),
//                     {
//                         Field_Name: "Action",
//                         isVisible: 1,
//                         isCustomCell: true,
//                         Cell: ({ row }) => {
//                             return (
//                                 <>
//                                     <Tooltip title="View Order">
//                                         <IconButton
//                                             onClick={() => {
//                                                 setViewOrder({
//                                                     orderDetails: row,
//                                                     orderProducts: row?.Products_List
//                                                         ? row?.Products_List
//                                                         : [],
//                                                 });
//                                             }}
//                                             color="primary"
//                                             size="small"
//                                         >
//                                             <Visibility className="fa-16" />
//                                         </IconButton>
//                                     </Tooltip>

//                                     {EditRights && (
//                                         <Tooltip title="Edit">
//                                             <IconButton
//                                                 onClick={() =>
//                                                     navigate("create", {
//                                                         state: {
//                                                             ...row,
//                                                             isEdit: true,
//                                                         },
//                                                     })
//                                                 }
//                                                 size="small"
//                                             >
//                                                 <Edit className="fa-16" />
//                                             </IconButton>
//                                         </Tooltip>
//                                     )}
//                                 </>
//                             );
//                         },
//                     },
//                 ]}
//                 ButtonArea={
//                     <>
//                         {AddRights && (
//                             <Button
//                                 variant="outlined"
//                                 startIcon={<Add />}
//                                 onClick={() => navigate("create")}
//                             >
//                                 {"New"}
//                             </Button>
//                         )}
//                         <Tooltip title="Filters">
//                             <IconButton
//                                 size="small"
//                                 onClick={() => setDialog({ ...dialog, filters: true })}
//                             >
//                                 <FilterAlt />
//                             </IconButton>
//                         </Tooltip>
//                         <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
//                             {toNumber(Total_Invoice_value) > 0 && (
//                                 <h6 className="m-0 text-end text-muted px-3">
//                                     Total: {NumberFormat(Total_Invoice_value)}
//                                 </h6>
//                             )}
//                         </span>
//                     </>
//                 }
//                 isExpendable={true}
//                 tableMaxHeight={550}
//                 expandableComp={(props) => (
//                     <ExpendableComponent {...props} handleOpenModal={handleOpenModal} />
//                 )}
//             />

//             {Object.keys(viewOrder).length > 0 && (
//                 <InvoiceBillTemplate
//                     orderDetails={viewOrder?.orderDetails}
//                     orderProducts={viewOrder?.orderProducts}
//                     download={true}
//                     actionOpen={true}
//                     clearDetails={() => setViewOrder({})}
//                     TitleText={"Sale Order"}
//                 />
//             )}

//             <Dialog open={dialog.filters} onClose={closeDialog} fullWidth maxWidth="sm">
//                 <DialogTitle>Filters</DialogTitle>
//                 <DialogContent>
//                     <div className="table-responsive pb-4">
//                         <table className="table">
//                             <tbody>
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

//                                 <tr>
//                                     <td style={{ verticalAlign: "middle" }}>Retailer</td>
//                                     <td>
//                                         <Select
//                                             value={filters?.Retailer}
//                                             onChange={(e) => setFilters({ ...filters, Retailer: e })}
//                                             options={[
//                                                 { value: "", label: "ALL" },
//                                                 ...retailers.map((obj) => ({
//                                                     value: obj?.Retailer_Id,
//                                                     label:
//                                                         obj?.Retailer_Name +
//                                                         "- ₹" +
//                                                         NumberFormat(toNumber(obj?.TotalSales)) +
//                                                         ` (${toNumber(obj?.OrderCount)})`,
//                                                 })),
//                                             ]}
//                                             styles={customSelectStyles}
//                                             isSearchable={true}
//                                             placeholder={"Retailer Name"}
//                                             filterOption={reactSelectFilterLogic}
//                                         />
//                                     </td>
//                                 </tr>

//                                 <tr>
//                                     <td style={{ verticalAlign: "middle" }}>Salse Person</td>
//                                     <td>
//                                         <Select
//                                             value={filters?.SalesPerson}
//                                             onChange={(e) =>
//                                                 setFilters((pre) => ({ ...pre, SalesPerson: e }))
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
//                                             placeholder={"Sales Person Name"}
//                                             filterOption={reactSelectFilterLogic}
//                                         />
//                                     </td>
//                                 </tr>

//                                 <tr>
//                                     <td style={{ verticalAlign: "middle" }}>Created By</td>
//                                     <td>
//                                         <Select
//                                             value={filters?.CreatedBy}
//                                             onChange={(e) =>
//                                                 setFilters((pre) => ({ ...pre, CreatedBy: e }))
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
//                                             placeholder={"Sales Person Name"}
//                                             filterOption={reactSelectFilterLogic}
//                                         />
//                                     </td>
//                                 </tr>

//                                 <tr>
//                                     <td style={{ verticalAlign: "middle" }}>Voucher </td>
//                                     <td>
//                                         <Select
//                                             value={filters?.VoucherType}
//                                             onChange={(e) => setFilters({ ...filters, VoucherType: e })}
//                                             options={[
//                                                 { value: "", label: "ALL" },
//                                                 ...voucher
//                                                     .filter((obj) => obj.Type === "SALES")
//                                                     .map((obj) => ({
//                                                         value: obj?.Vocher_Type_Id,
//                                                         label: obj?.Voucher_Type,
//                                                     })),
//                                             ]}
//                                             styles={customSelectStyles}
//                                             menuPortalTarget={document.body}
//                                             isSearchable={true}
//                                             placeholder={"Voucher Name"}
//                                             filterOption={reactSelectFilterLogic}
//                                         />
//                                     </td>
//                                 </tr>

//                                 <tr>
//                                     <td style={{ verticalAlign: "middle" }}>Canceled Order</td>
//                                     <td>
//                                         <select
//                                             value={filters.Cancel_status}
//                                             onChange={(e) =>
//                                                 setFilters({
//                                                     ...filters,
//                                                     Cancel_status: Number(e.target.value),
//                                                 })
//                                             }
//                                             className="cus-inpt"
//                                         >
//                                             <option value={1}>Show</option>
//                                             <option value={0}>Hide</option>
//                                         </select>
//                                     </td>
//                                 </tr>

//                                 <tr>
//                                     <td style={{ verticalAlign: "middle" }}>Order Status</td>
//                                     <td>
//                                         <Select
//                                             value={filters?.OrderStatus}
//                                             onChange={(e) => setFilters({ ...filters, OrderStatus: e })}
//                                             options={[
//                                                 { value: "", label: "ALL" },
//                                                 { value: "pending", label: "Pending" },
//                                                 { value: "completed", label: "Completed" },
//                                             ]}
//                                             styles={customSelectStyles}
//                                             isSearchable={false}
//                                             placeholder={"Order Status"}
//                                             filterOption={reactSelectFilterLogic}
//                                         />
//                                     </td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={closeDialog}>close</Button>
//                     <Button
//                         onClick={() => {
//                             closeDialog();
//                             setSessionFilters({
//                                 Fromdate: filters?.Fromdate,
//                                 Todate: filters.Todate,
//                                 pageID,
//                                 Retailer: filters.Retailer,
//                                 CreatedBy: filters.CreatedBy,
//                                 SalesPerson: filters.SalesPerson,
//                                 VoucherType: filters.VoucherType,
//                                 Cancel_status: filters.Cancel_status,
//                                 OrderStatus: filters.OrderStatus,
//                             });
//                         }}
//                         startIcon={<Search />}
//                         variant="outlined"
//                     >
//                         Search
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             <DirectSaleInvoiceFromPos
//                 open={modalOpen}
//                 onClose={handleCloseModal}
//                 editValues={selectedOrder?.row}
//                 defaultValues={selectedOrder?.payload}
//                 loadingOn={loadingOn}
//                 loadingOff={loadingOff}
//                 transactionType="invoice"
//                 onSuccess={() => {
//                     fetchSaleOrders();
//                     handleCloseModal();
//                 }}
//             />
//         </>
//     );
// };

// export default SaleOrderList;





import { useState, useEffect, useMemo } from "react";
import {
    Button,
    Dialog,
    Tooltip,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import {
    Addition,
    getSessionFiltersByPageId,
    ISOString,
    NumberFormat,
    reactSelectFilterLogic,
    setSessionFilters,
    toNumber,
} from "../../../Components/functions";
import InvoiceBillTemplate from "../SalesReportComponent/newInvoiceTemplate";
import { Add, Edit, FilterAlt, Search, Visibility } from "@mui/icons-material";
import { convertedStatus } from "../convertedStatus";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { useNavigate } from "react-router-dom";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import DirectSaleInvoiceFromPos from "../SalesInvoice/directSaleInvoiceFromPos";
import { isGraterNumber, isEqualNumber } from "../../../Components/functions";

const SaleOrderList = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
    const sessionValue = sessionStorage.getItem("filterValues");
    const defaultFilters = {
        Fromdate: ISOString(),
        Todate: ISOString(),
        Retailer: { value: "", label: "ALL" },
        CreatedBy: { value: "", label: "ALL" },
        SalesPerson: { value: "", label: "ALL" },
        VoucherType: { value: "", label: "ALL" },
        Cancel_status: 0,
        OrderStatus: { value: "", label: "ALL" },
    };

    const storage = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const [saleOrders, setSaleOrders] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [salesPerson, setSalePerson] = useState([]);
    const [users, setUsers] = useState([]);
    const [voucher, setVoucher] = useState([]);
    const [viewOrder, setViewOrder] = useState({});
    const [loading, setLoading] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [filters, setFilters] = useState(defaultFilters);

    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
    });

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
    }, [sessionValue, pageID]);

    const buildSaleOrderPayload = (data) => {
        const extractWeightFromName = (name) => {
            const match = name?.match(/(\d+)\s?kg/i);
            return match ? parseInt(match[1]) : 1;
        };

        const validProducts = Array.isArray(data.ProductList)
            ? data.ProductList
                .filter((p) => Number(p?.Bill_Qty) > 0)
                .map((p) => {
                    const weight = extractWeightFromName(p?.Product_Name);
                    return {
                        ...p,
                        Pre_Id: data?.Pre_Id,
                        Bill_Qty: (Number(p?.Bill_Qty) || 0) * (Number(p?.PackValue) || 1),
                        Act_Qty: Number(p?.Act_Qty) || Number(p?.Total_Qty) || 0,
                        Total_Qty: Number(p?.Bill_Qty) || 0,
                    };
                })
            : [];

        const transformStaffData = (orderData) => {
            const staffs = [];
            if (orderData.Broker_Id && orderData.Broker_Id !== 0) {
                staffs.push({
                    Id: "",
                    So_Id: "",
                    Emp_Id: orderData.Broker_Id,
                    Emp_Type_Id: orderData.Broker_Type || 0,
                });
            }
            if (orderData.Transporter_Id && orderData.Transporter_Id !== 0) {
                staffs.push({
                    Id: "",
                    Do_Id: "",
                    Emp_Id: orderData.Transporter_Id,
                    Emp_Type_Id: orderData.TrasnportType || 0,
                });
            }
            return staffs.filter((s) => s.Emp_Type_Id !== 0);
        };

        return {
            ...data,
            Product_Array: validProducts,
            Retailer_Id: Number(data?.Retailer_Id) || 0,
            Retailer_Name: data?.Retailer_Name || "",
            Staffs_Array: transformStaffData(data),
        };
    };

    const handleOpenModal = (row) => {
        const payload = buildSaleOrderPayload(row);

        const productChanges = (row?.ProductList || row?.Products_List || []).map(
            (item) => {
                const orderedQty = Number(item.Bill_Qty) || 0;
                const totalQty = Number(item?.Total_Qty) || 0;

                const deliveredQty = (row?.ConvertedInvoice || [])
                    .flatMap((inv) => inv?.InvoicedProducts || [])
                    .filter((p) => p.Item_Id === item.Item_Id)
                    .reduce((sum, p) => sum + (Number(p?.Bill_Qty) || 0), 0);

                const remainingQty = Math.max(orderedQty - deliveredQty, 0);
                
                // Use Act_Qty if available, otherwise use remainingQty
                const finalQty = item.Act_Qty !== undefined ? item.Act_Qty : remainingQty;

                return {
                    ...item,
                    Ordered_Qty: orderedQty,
                    Delivered_Qty: deliveredQty,
                    Act_Qty: item.Act_Qty || totalQty,
                    Bill_Qty: finalQty, // Set as Act_Qty or remaining
                    Total_Qty: finalQty, // Set as Act_Qty or remaining
                    Amount: finalQty * (Number(item.Item_Rate) || 0),
                };
            }
        );

        const updatedRow = {
            ...row,
            Do_Date: row?.So_Date,
            ProductList: productChanges,
            Staffs_Array:
                row?.Staff_Involved_List?.map((item) => ({
                    Staff_Id: item.Involved_Emp_Id,
                    Cost_Cat_Id: item.Cost_Center_Type_Id,
                    Cost_Cat_Name: item.Cost_Center_Type,
                })) || [],
            Retailer_Id: Number(row?.Retailer_Id) || 0,
            Retailer_Name: row?.Retailer_Name || "",
        };

        setSelectedOrder({
            row: updatedRow,
            payload,
        });

        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedOrder(null);
    };

    useEffect(() => {
        fetchLink({
            address: `sales/saleOrder/retailers`,
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

        fetchLink({
            address: `masters/voucher`,
        })
            .then((data) => {
                if (data.success) {
                    setVoucher(data.data);
                }
            })
            .catch((e) => console.error(e));
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
    } = otherSessionFiler;

    // Build query parameters
    let queryParams = [
        `Fromdate=${Fromdate}`,
        `Todate=${Todate}`,
    ];

    // Add optional parameters
    if (Retailer?.value) queryParams.push(`Retailer_Id=${Retailer.value}`);
    if (SalesPerson?.value) queryParams.push(`Sales_Person_Id=${SalesPerson.value}`);
    if (CreatedBy?.value) queryParams.push(`Created_by=${CreatedBy.value}`);
    if (VoucherType?.value) queryParams.push(`VoucherType=${VoucherType.value}`);
    
    // Fix for Cancel_status - only include if not empty
    if (Cancel_status !== '' && Cancel_status !== undefined) {
        queryParams.push(`Cancel_status=${Cancel_status}`);
    }
    
    if (filters?.OrderStatus?.value) {
        queryParams.push(`OrderStatus=${filters.OrderStatus.value}`);
    }

    fetchLink({
        address: `sales/saleOrder?${queryParams.join('&')}`,
        loadingOn,
        loadingOff,
    })
        .then((data) => {
            if (data.success) {
                setSaleOrders(data?.data);
            }
        })
        .catch((e) => console.error(e));
};

    useEffect(() => {
        fetchSaleOrders();
    }, [sessionValue, pageID]);

    const transformStaffInvolvedListToStaffsArray = (staffInvolvedList = [], doId = "") => {
        return staffInvolvedList.map((staff, index) => ({
            Id: `temp_${Date.now()}_${index}`,
            Do_Id: doId,
            Emp_Id: staff.Involved_Emp_Id,
            Emp_Name: staff.EmpName,
            Emp_Type_Id: staff.Cost_Center_Type_Id,
            Involved_Emp_Type: staff.EmpType
        }));
    };

    const ExpendableComponent = ({ row }) => {
        const getDeliveredQty = (product) => {
            let deliveredQty = 0;

            if (!row?.ConvertedInvoice || !Array.isArray(row.ConvertedInvoice)) {
                return deliveredQty;
            }

            row.ConvertedInvoice.forEach((invoice) => {
                const invoiceProducts = invoice?.InvoicedProducts || invoice?.Products || invoice?.ProductList || [];

                invoiceProducts.forEach((ip) => {
                    if (Number(ip.Item_Id) === Number(product.Item_Id)) {
                        deliveredQty += Number(ip.Bill_Qty || ip.Quantity || ip.Qty || 0);
                    }
                    else if (ip.Product_Id && product.Product_Id && Number(ip.Product_Id) === Number(product.Product_Id)) {
                        deliveredQty += Number(ip.Bill_Qty || ip.Quantity || ip.Qty || 0);
                    }
                });
            });

            return deliveredQty;
        };

        const getOrderedQty = (product) => {
            return Number(product?.Bill_Qty || product?.Ordered_Qty || product?.Quantity || 0);
        };

        const getRemainingQty = (product) => {
            const ordered = getOrderedQty(product);
            const delivered = getDeliveredQty(product);
            const remaining = Math.max(ordered - delivered, 0);
            
            // Use Act_Qty if available, otherwise use calculated remaining
            return product.Act_Qty !== undefined ? product.Act_Qty : remaining;
        };

        const hasPending = row?.Products_List?.some((product) => {
            const remaining = getRemainingQty(product);
            return remaining > 0;
        });

        const debugProductCalculation = () => {
            console.group(`Debug Order: ${row.So_Inv_No || row.Do_Inv_No}`);
            console.log("Product details:", row.Products_List);

            row?.Products_List?.forEach((product, idx) => {
                const ordered = getOrderedQty(product);
                const delivered = getDeliveredQty(product);
                const remaining = getRemainingQty(product);

                console.log(`Product ${idx + 1}: ${product.Product_Name || product.Product_Short_Name}`);
                console.log(`  Item_Id: ${product.Item_Id}`);
                console.log(`  Ordered: ${ordered}`);
                console.log(`  Delivered: ${delivered}`);
                console.log(`  Act_Qty: ${product.Act_Qty || 'N/A'}`);
                console.log(`  Remaining: ${remaining}`);
            });
            console.groupEnd();
        };

        const handlePendingNavigation = () => {
            const isDeliveryOrder = row.Do_Inv_No && !row.So_Inv_No;
            
            const normalizedRow = {
                So_Id: isDeliveryOrder ? row.Do_Id : row.So_Id || "",
                So_Inv_No: isDeliveryOrder ? row.Do_Inv_No : row.So_Inv_No || "",
                So_Year: isDeliveryOrder ? row.Do_Year : row.So_Year || 0,
                So_Date: isDeliveryOrder ? row.Do_Date : row.So_Date || "",
                So_Branch_Inv_Id: isDeliveryOrder 
                    ? parseInt(row.Do_Inv_No?.match(/\d+/g)?.[0]) || 0
                    : row.So_Branch_Inv_Id || 0,
                So_No: row.So_No,
                
                Alter_Id: row.Alter_Id || "",
                Alterd_on: row.Created_on || "",
                Altered_by: row.Created_by || "",
                Branch_Id: row.Branch_Id || 0,
                Branch_Name: row.Branch_Name || "",
                CSGT_Total: row.CSGT_Total || 0,
                Cancel_status: row.Cancel_status || "0",
                ConvertedInvoice: row.ConvertedInvoice || [],
                Created_BY_Name: row.Created_BY_Name || "",
                Created_by: row.Created_by || "",
                Created_on: row.Created_on || "",
                GST_Inclusive: row.GST_Inclusive || 2,
                IGST_Total: row.IGST_Total || 0,
                IS_IGST: row.IS_IGST || 0,
                Narration: row.Narration || null,
                OrderStatus: "pending",
                Products_List: row.Products_List || [],
                Retailer_Id: row.Retailer_Id || 0,
                Retailer_Name: row.Retailer_Name || "",
                Round_off: row.Round_off || 0,
                SGST_Total: row.SGST_Total || 0,
                Sales_Person_Id: row.Sales_Person_Id || 0,
                Sales_Person_Name: row.Sales_Person_Name || "",
                Staff_Involved_List: row.Staff_Involved_List || [],
                Total_Before_Tax: row.Total_Before_Tax || 0,
                Total_Invoice_value: row.Total_Invoice_value || 0,
                Total_Tax: row.Total_Tax || 0,
                Trans_Type: row.Trans_Type || "INSERT",
                VoucherType: parseInt(row.Voucher_Type || row.VoucherType) || 0,
                VoucherTypeGet: row.VoucherTypeGet || "",
                Do_Id: row.Do_Id || "",
                Do_Inv_No: row.Do_Inv_No || "",
                ...row
            };

            const staffsArray = transformStaffInvolvedListToStaffsArray(
                normalizedRow.Staff_Involved_List || [],
                normalizedRow.Do_Id || normalizedRow.So_Id || ""
            );

            const getOrderedQtyInternal = (product) => {
                return Number(product?.Bill_Qty || 0);
            };

            const getDeliveredQtyInternal = (product) => {
                let deliveredQty = 0;
                if (normalizedRow.ConvertedInvoice?.length > 0) {
                    normalizedRow.ConvertedInvoice.forEach((invoice) => {
                        if (invoice.InvoicedProducts?.length > 0) {
                            invoice.InvoicedProducts.forEach((ip) => {
                                if (Number(ip.Item_Id) === Number(product.Item_Id)) {
                                    deliveredQty += Number(ip.Bill_Qty || 0);
                                }
                            });
                        }
                    });
                }
                return deliveredQty;
            };

            const getRemainingQtyInternal = (product) => {
                const ordered = getOrderedQtyInternal(product);
                const delivered = getDeliveredQtyInternal(product);
                const remaining = Math.max(ordered - delivered, 0);
                
                return product.Act_Qty !== undefined ? product.Act_Qty : remaining;
            };

            const pendingProducts = normalizedRow.Products_List
                ?.map((product) => {
                    const ordered = getOrderedQtyInternal(product);
                    const delivered = getDeliveredQtyInternal(product);
                    const remaining = getRemainingQtyInternal(product);

                    if (remaining > 0) {
                        const qtyToUse = product.Act_Qty !== undefined ? product.Act_Qty : remaining;
                        
                        return {
                            ...product,
                            Product_Name: product.Product_Name || product.Product_Short_Name || product.Item_Name || "Unknown Product",
                            Product_Short_Name: product.Product_Short_Name || product.Product_Name || "",
                            Item_Name: product.Item_Name || product.Product_Name || product.Product_Short_Name || "",
                            Ordered_Qty: ordered,
                            Delivered_Qty: delivered,
                            Bill_Qty: qtyToUse,
                            Total_Qty: qtyToUse,
                            Amount: qtyToUse * Number(product.Item_Rate || 0),
                            Act_Qty: product.Act_Qty || qtyToUse,
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            const stateData = {
                S_Id: normalizedRow.So_Id,
                So_Id: normalizedRow.So_Id,
                So_Inv_No: normalizedRow.So_Inv_No,
                So_Year: normalizedRow.So_Year,
                Pre_Id: null,
                Alter_Id: normalizedRow.Alter_Id,
                Alterd_on: normalizedRow.Created_on,
                Altered_by: normalizedRow.Created_by,
                Approve_Status: 0,
                Approved_By: null,
                Branch_Id: normalizedRow.Branch_Id,
                Branch_Name: normalizedRow.Branch_Name,
                CSGT_Total: normalizedRow.CSGT_Total,
                Cancel_status: normalizedRow.Cancel_status,
                ConvertedInvoice: normalizedRow.ConvertedInvoice,
                Created_BY_Name: normalizedRow.Created_BY_Name,
                Created_by: normalizedRow.Created_by,
                Created_on: normalizedRow.Created_on,
                GST_Inclusive: normalizedRow.GST_Inclusive,
                IGST_Total: normalizedRow.IGST_Total,
                IS_IGST: normalizedRow.IS_IGST,
                Narration: normalizedRow.Narration,
                OrderStatus: "pending",
                Products_List: pendingProducts,
                Retailer_Id: normalizedRow.Retailer_Id,
                Retailer_Name: normalizedRow.Retailer_Name,
                Round_off: normalizedRow.Round_off,
                SGST_Total: normalizedRow.SGST_Total,
                Sales_Person_Id: normalizedRow.Sales_Person_Id,
                Sales_Person_Name: normalizedRow.Sales_Person_Name,
                So_Branch_Inv_Id: normalizedRow.So_Branch_Inv_Id,
                So_Date: normalizedRow.So_Date,
                So_No:normalizedRow.So_Id,
                Staff_Involved_List: normalizedRow.Staff_Involved_List || [],
                Staffs_Array: staffsArray,
                Total_Before_Tax: normalizedRow.Total_Before_Tax,
                Total_Invoice_value: normalizedRow.Total_Invoice_value,
                Total_Tax: normalizedRow.Total_Tax,
                Trans_Type: normalizedRow.Trans_Type,
                VoucherType: normalizedRow.VoucherType,
                VoucherTypeGet: normalizedRow.VoucherTypeGet,
                isEdit: true,
                fromPending: true,
                isConverted: 0
            };

            navigate("/erp/sales/invoice/create", {
                state: stateData,
            });
        };

        return (
            <>
                <div className="text-end mb-2">
                    {/* <Button
                        size="small"
                        variant="outlined"
                        onClick={debugProductCalculation}
                        className="me-2"
                    >
                        Debug Calculations
                    </Button> */}
                </div>

                <table className="table">
                    <tbody>
                        <tr>
                            <td className="border p-2 bg-light">Order ID</td>
                            <td className="border p-2 fw-bold">{row.So_Inv_No || row.Do_Inv_No}</td>
                            <td className="border p-2 bg-light">Branch</td>
                            <td className="border p-2">{row.Branch_Name}</td>
                            <td className="border p-2 bg-light">Sales Person</td>
                            <td className="border p-2">{row.Sales_Person_Name}</td>
                        </tr>
                        <tr>
                            <td className="border p-2 bg-light">Total Ordered</td>
                            <td className="border p-2 fw-bold">
                                {row.Products_List?.reduce((sum, p) => sum + getOrderedQty(p), 0)}
                            </td>
                            <td className="border p-2 bg-light">Total Delivered</td>
                            <td className="border p-2 fw-bold">
                                {row.Products_List?.reduce((sum, p) => sum + getDeliveredQty(p), 0)}
                            </td>
                            <td className="border p-2 bg-light">Total Remaining</td>
                            <td className="border p-2 fw-bold">
                                {row.Products_List?.reduce((sum, p) => sum + getRemainingQty(p), 0)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table className="table table-bordered mt-3">
                    <thead className="bg-light">
                        <tr>
                            <th className="p-2">#</th>
                            <th className="p-2">Product</th>
                            <th className="p-2">Item ID</th>
                            <th className="p-2">Ordered Qty</th>
                            <th className="p-2">Delivered Qty</th>
                            <th className="p-2">
                                Remaining Qty
                                {hasPending && (
                                    <Tooltip title="Create Invoice for Remaining Quantity">
                                        <IconButton
                                            size="small"
                                            onClick={handlePendingNavigation}
                                            className="ms-2"
                                        >
                                            <ArrowOutwardIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </th>
                            <th className="p-2">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {row.Products_List?.map((product, index) => {
                            const orderedQty = getOrderedQty(product);
                            const deliveredQty = getDeliveredQty(product);
                            const remainingQty = getRemainingQty(product);
                            const isCompleted = remainingQty === 0;

                            return (
                                <tr key={index}>
                                    <td className="p-2">{index + 1}</td>
                                    <td className="p-2">{product.Product_Name || product.Product_Short_Name || product.Item_Name || "Unknown"}</td>
                                    <td className="p-2 text-muted">{product.Item_Id}</td>
                                    <td className="p-2">{orderedQty}</td>
                                    <td className="p-2">{deliveredQty}</td>
                                    <td className={`p-2 fw-bold ${remainingQty === 0 ? 'text-success' : 'text-danger'}`}>
                                        {remainingQty}
                                    </td>
                                    <td className="p-2">
                                        <span className={`badge ${isCompleted ? 'bg-success' : 'bg-warning'}`}>
                                            {isCompleted ? 'Completed' : 'Pending'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* {row.ConvertedInvoice && row.ConvertedInvoice.length > 0 && (
                    <div className="mt-3">
                        <h6 className="mb-2">Related Invoices:</h6>
                        <table className="table table-sm table-bordered">
                            <thead>
                                <tr>
                                    <th>Invoice No</th>
                                    <th>Date</th>
                                    <th>Total Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {row.ConvertedInvoice.map((invoice, idx) => (
                                    <tr key={idx}>
                                        <td>{invoice.Inv_No || invoice.Invoice_No}</td>
                                        <td>{invoice.Inv_Date || invoice.Date}</td>
                                        <td>
                                            {(invoice.InvoicedProducts || invoice.Products || []).reduce(
                                                (sum, p) => sum + Number(p.Bill_Qty || p.Quantity || 0),
                                                0
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )} */}
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

    const Total_Invoice_value = useMemo(
        () =>
            saleOrders.reduce(
                (acc, orders) => Addition(acc, orders?.Total_Invoice_value),
                0
            ),
        [saleOrders]
    );

    return (
        <>
            <FilterableTable
                title="Sale Orders"
                dataArray={saleOrders}
                EnableSerialNumber
                columns={[
                    createCol("So_Date", "date", "Date"),
                    createCol("So_Inv_No", "string", "ID"),
                    createCol("Retailer_Name", "string", "Customer"),
                    createCol("VoucherTypeGet", "string", "Voucher"),
                    createCol("Total_Before_Tax", "number", "Before Tax"),
                    createCol("Total_Tax", "number", "Tax"),
                    createCol("Total_Invoice_value", "number", "Invoice Value"),
            {
    ColumnHeader: "Order Status",
    isVisible: 1,
    align: "center",
    isCustomCell: true,
    Cell: ({ row }) => {
        const cancelStatus = Number(row?.Cancel_status);
        
        // Handle different Cancel_status values
        let status = "Active";
        let className = "bg-success text-white";
        
        if (cancelStatus == 1) {
            status = "New";
            className = "bg-danger text-white";
        } else if (cancelStatus == 2) {
            status = "Hold";
            className = "bg-warning text-dark";
        } else if (cancelStatus == 3) {
            status = "Cancelled";
            className = "bg-secondary text-white";
        }
        // Add more statuses as needed
        
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
                            if (Number(row?.Cancel_status) == 3) {
                                return (
                                    <span className="py-0 fw-bold px-2 rounded-4 fa-12 bg-danger text-white">
                                        Cancelled
                                    </span>
                                );
                            }

                            const totalOrdered = row?.Products_List?.reduce(
                                (sum, p) => sum + (Number(p?.Bill_Qty) || 0),
                                0
                            ) || 0;

                            const totalDelivered = row?.ConvertedInvoice?.reduce((sum, invoice) => {
                                return sum + (invoice?.InvoicedProducts?.reduce(
                                    (prodSum, prod) => prodSum + (Number(prod?.Bill_Qty) || 0),
                                    0
                                ) || 0);
                            }, 0) || 0;

                            const totalRemaining = totalOrdered - totalDelivered;
                            let status = "Pending";
                            let className = "bg-warning text-dark";

                            if (totalRemaining <= 0) {
                                status = "Completed";
                                className = "bg-success text-white";
                            }

                            if (totalOrdered === 0) {
                                status = "No Qty";
                                className = "bg-secondary text-white";
                            }

                            return (
                                <span className={`py-0 fw-bold px-2 rounded-4 fa-12 ${className}`}>
                                    {status}
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
                            return (
                                <>
                                    <Tooltip title="View Order">
                                        <IconButton
                                            onClick={() => {
                                                setViewOrder({
                                                    orderDetails: row,
                                                    orderProducts: row?.Products_List
                                                        ? row?.Products_List
                                                        : [],
                                                });
                                            }}
                                            color="primary"
                                            size="small"
                                        >
                                            <Visibility className="fa-16" />
                                        </IconButton>
                                    </Tooltip>

                                    {EditRights && (
                                        <Tooltip title="Edit">
                                            <IconButton
                                                onClick={() =>
                                                    navigate("create", {
                                                        state: {
                                                            ...row,
                                                            isEdit: true,
                                                        },
                                                    })
                                                }
                                                size="small"
                                            >
                                                <Edit className="fa-16" />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </>
                            );
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
                        <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
                            {toNumber(Total_Invoice_value) > 0 && (
                                <h6 className="m-0 text-end text-muted px-3">
                                    Total: {NumberFormat(Total_Invoice_value)}
                                </h6>
                            )}
                        </span>
                    </>
                }
                isExpendable={true}
                tableMaxHeight={550}
                expandableComp={(props) => (
                    <ExpendableComponent {...props} handleOpenModal={handleOpenModal} />
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
                                                ...retailers.map((obj) => ({
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
                                                ...salesPerson.map((obj) => ({
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
                                                ...users.map((obj) => ({
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
                                                ...voucher
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
                    Cancel_status: e.target.value, // Don't convert to number
                })
            }
            className="cus-inpt"
        >
            <option value="">All (Both Active & Cancelled)</option>
            <option value="0">Active Only</option>
            <option value="1">Cancelled Only</option>
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
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >
                        Search
                    </Button>
                </DialogActions>
            </Dialog>

            <DirectSaleInvoiceFromPos
                open={modalOpen}
                onClose={handleCloseModal}
                editValues={selectedOrder?.row}
                defaultValues={selectedOrder?.payload}
                loadingOn={loadingOn}
                loadingOff={loadingOff}
                transactionType="invoice"
                onSuccess={() => {
                    fetchSaleOrders();
                    handleCloseModal();
                }}
            />
        </>
    );
};

export default SaleOrderList;