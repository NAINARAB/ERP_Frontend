// import { useEffect, useState } from "react";
// import { fetchLink } from "../../../Components/fetchComponent";
// import {
//     Button,
//     Card,
//     CardContent,
//     Dialog,
//     DialogActions,
//     DialogContent,
//     DialogTitle,
//     IconButton,
// } from "@mui/material";
// import {
//     Addition,
//     checkIsNumber,
//     combineDateTime,
//     isEqualNumber,
//     ISOString,
//     isValidDate,
//     isValidObject,
//     Subraction,
// } from "../../../Components/functions";
// import Select from "react-select";
// import { customSelectStyles } from "../../../Components/tablecolumn";
// import { Close, Delete, Search } from "@mui/icons-material";
// import FilterableTable, {
//     createCol,
// } from "../../../Components/filterableTable2";
// import { tripMasterDetails, tripStaffsColumns } from "./tableColumns";
// import { toast } from "react-toastify";
// import { useLocation } from "react-router-dom";
// import Godown from "../../Masters/Godown";

// const TripSheetGodownSearch = ({ loadingOn, loadingOff }) => {
//     const location = useLocation();
//     const stateDetails = location.state;
//     const [deliveryPerson, setDeliveryPerson] = useState(null);
//     const storage = JSON.parse(localStorage.getItem("user"));
//     const [salesPerson, setSalePerson] = useState([]);
//     const [filters, setFilters] = useState({
//         Retailer_Id: "",
//         RetailerGet: "ALL",
//         Created_by: "",
//         CreatedByGet: "ALL",
//         Sales_Person_Id: "",
//         SalsePersonGet: "ALL",
//         Cancel_status: 0,
//         Route_Id: "",
//         RoutesGet: "ALL",
//         Area_Id: "",
//         AreaGet: "ALL",
//         Fromdate: ISOString(),
//         Todate: ISOString(),
//         VoucherType: [],
//         Broker:[],
//         Transporters:[],
//         Item:[],
//         Godown:"",
//         search: false,
//         addItemDialog: false,
//           Retailer: []     
//     });

//     const [transactionData, setTransactionData] = useState([]);
//     const [costCenter, setCostCenter] = useState([]);
//     const [costCenterCategory, setCostCenterCategory] = useState([]);
//     const [branch, setBranch] = useState([]);
//     const [tripSheetInfo, setTripSheetInfo] = useState(tripMasterDetails);
//     const [staffInvolvedList, setStaffInvolvedList] = useState([]);
//     const [selectedItems, setSelectedItems] = useState([]);
// const [voucher, setVoucher] = useState([]);

// const [broker, setBroker] = useState([]);
// const [transporters, setTransporters] = useState([]);
// const [items, setItems] = useState([]);
// const [godowns, setGodowns] = useState([]);
// const[retailers,setRetailers]=useState([])


//   useEffect(() => {
//   const fetchData = async () => {
//     try {
//       const [
//         branchResponse,
//         staffResponse,
//         staffCategory,
//         voucherResponse,
//         itemsRes,
//         godownRes,
//         retailerRes
//       ] = await Promise.all([
//         fetchLink({ address: `masters/branch/dropDown` }),
//         fetchLink({ address: `dataEntry/costCenter` }),
//         fetchLink({ address: `dataEntry/costCenter/category` }),
//         fetchLink({ address: `masters/voucher` }),
//         fetchLink({ address: `masters/products/dropDown` }),
//         fetchLink({ address: `masters/godown` }),
//         fetchLink({ address: `masters/retailers/dropDown` })
//       ]);

//       // Branches
//       const branchData = (branchResponse.success ? branchResponse.data : [])
//         .sort((a, b) => String(a?.BranchName).localeCompare(b?.BranchName));

//       // All Cost Centers
//       const staffData = (staffResponse.success ? staffResponse.data : [])
//         .sort((a, b) => String(a?.Cost_Center_Name).localeCompare(b?.Cost_Center_Name));

//       // Cost Center Categories
//       const staffCategoryData = (staffCategory.success ? staffCategory.data : [])
//         .sort((a, b) => String(a?.Cost_Category).localeCompare(b?.Cost_Category));

//       // Filter brokers and transporters
//       const brokers = staffData.filter(cc => cc.UserTypeGet === "Broker");
//       const transporters = staffData.filter(cc => cc.UserTypeGet === "Transport");

//       // Other masters
//       const voucherData = voucherResponse.success ? voucherResponse.data : [];
//       const itemData = itemsRes.success ? itemsRes.data : [];
//       const godownData = godownRes.success ? godownRes.data : [];
//       const retailData = retailerRes.success ? retailerRes.data : [];

//       // Update states
//       setVoucher(voucherData);
//       setBranch(branchData);
//       setCostCenter(staffData);
//       setCostCenterCategory(staffCategoryData);
//       setBroker(brokers);
//       setTransporters(transporters);
//       setGodowns(godownData);
//       setItems(itemData);
//       setRetailers(retailData);

//     } catch (e) {
//       console.error("Error fetching data:", e);
//     }
//   };

//   fetchData();
// }, []);

//  const voucherTypeOptions = [
//         { value: '', label: 'ALL' },
//         ...voucher
//             .filter(obj => obj.Type === 'SALES')
//             .map(obj => ({ 
//                 value: obj?.Vocher_Type_Id, 
//                 label: obj?.Voucher_Type 
//             }))
//     ];

//     const tripVoucherTypeOptions = voucher
//         .filter(obj => obj.Type === 'SALES')
//         .map(obj => ({ 
//             value: obj?.Voucher_Type, 
//             label: obj?.Voucher_Type 
//         }));

//     useEffect(() => {
//         fetchLink({
//             address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`,
//         })
//             .then((data) => {
//                 if (data.success) {
//                     setSalePerson(data.data);
//                 }
//             })
//             .catch((e) => console.error(e));
//     }, []);

//     useEffect(() => {
//         const extractHHMM = (timeString) => {
//             const date = new Date(timeString);
//             const hours = date.getHours();
//             const minutes = date.getMinutes();
//             return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes
//                 }`;
//         };

//         const productsArray = stateDetails?.Product_Array;
//         const employeesArray = stateDetails?.Employees_Involved;
//         if (
//             isValidObject(stateDetails) &&
//             Array.isArray(productsArray) &&
//             Array.isArray(employeesArray)
//         ) {
//             setTripSheetInfo((prev) => ({
//                 ...prev,
//                 ...Object.fromEntries(
//                     Object.entries(tripMasterDetails).map(([key, value]) => {
//                         if (key === "Trip_Date")
//                             return [
//                                 key,
//                                 stateDetails[key] ? ISOString(stateDetails[key]) : value,
//                             ];
//                         if (key === "Branch_Id") return [key, stateDetails[key] ?? value];
//                         if (key === "StartTime" || key === "EndTime")
//                             return [
//                                 key,
//                                 stateDetails[key] ? extractHHMM(stateDetails[key]) : value,
//                             ];

//                         return [key, stateDetails[key] ?? value];
//                     })
//                 ),
//                 Product_Array: productsArray,
//             }));

//             setSelectedItems(productsArray);
//             setStaffInvolvedList(
//                 employeesArray.map((staffData) =>
//                     Object.fromEntries(
//                         Object.entries(tripStaffsColumns).map(([key, value]) => {
//                             return [key, staffData[key] ?? value];
//                         })
//                     )
//                 )
//             );

//             const deliveryStaff = employeesArray.find(
//                 (staff) => Number(staff.Cost_Center_Type_Id) === 9
//             );
//             if (deliveryStaff) {
//                 setDeliveryPerson({
//                     UserId: deliveryStaff.Involved_Emp_Id,
//                     Name: deliveryStaff.Emp_Name,
//                 });
//             } else {
//                 setDeliveryPerson(null);
//             }
//         }
//     }, [stateDetails]);

//     // const searchTransaction = (e) => {
//     //     e.preventDefault();
//     //     const { Fromdate, Todate, Sales_Person_Id,Broker,Transporters,Godown,Item,Retailer_Id   } = filters;
//     //     console.log("filterts",filters)
//     //    const branchValue =filters?.Branch || '';
//     //    const VoucherValue=filters?.VoucherType || '';
//     //     if (Fromdate && Todate) {
//     //         if (loadingOn) loadingOn();
//     //         setTransactionData([]);
//     //         fetchLink({
//     //             address: `delivery/deliveryDetailsList?Fromdate=${Fromdate}&Todate=${Todate}&Sales_Person_Id=${Sales_Person_Id}&VoucherType=${VoucherValue}&Branch=${branchValue}
//     //             &Broker=${Broker}&Transporter=${Transporters}&Godown=${Godown}&Item=${Item}&Retailer=${Retailer_Id}`,
//     //         })
//     //             .then((data) => {
//     //                 if (data.success) setTransactionData(data.data);
//     //             })
//     //             .catch((e) => console.log(e))
//     //             .finally(() => {
//     //                 if (loadingOff) loadingOff();
//     //             });
//     //     }
//     // };



// const searchTransaction = (e) => {
//     e.preventDefault();
//     const { Fromdate, Todate, Sales_Person_Id, Broker, Transporters, Godown, Item, Retailer, VoucherType } = filters;
    
   
//     const voucherTypeString = Array.isArray(VoucherType) ? VoucherType.join(',') : VoucherType || '';
//     const brokerString = Array.isArray(Broker) ? Broker.join(',') : Broker || '';
//     const transporterString = Array.isArray(Transporters) ? Transporters.join(',') : Transporters || '';
//     const itemString = Array.isArray(Item) ? Item.join(',') : Item || '';
//     const retailerString = Array.isArray(Retailer) ? Retailer.join(',') : Retailer || '';
//     const branchValue = filters?.Branch || '';
    
//     if (Fromdate && Todate) {
//         if (loadingOn) loadingOn();
//         setTransactionData([]);
//         fetchLink({
//             address: `delivery/deliveryDetailsList?Fromdate=${Fromdate}&Todate=${Todate}&Sales_Person_Id=${Sales_Person_Id}&VoucherType=${voucherTypeString}&Branch=${branchValue}
//             &Broker=${brokerString}&Transporter=${transporterString}&Godown=${Godown}&Item=${itemString}&Retailer=${retailerString}`,
//         })
//             .then((data) => {
//                 if (data.success) setTransactionData(data.data);
//             })
//             .catch((e) => console.log(e))
//             .finally(() => {
//                 if (loadingOff) loadingOff();
//             });
//     }
// };

// const MultiSelect = ({ value, onChange, options, placeholder, isSearchable = true }) => {
//     return (
//         <Select
//             isMulti
//             value={value}
//             onChange={onChange}
//             options={options}
//             placeholder={placeholder}
//             styles={{
//                 ...customSelectStyles,
//                 menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//             }}
//             isSearchable={isSearchable}
//             menuPortalTarget={document.body}
//             menuPosition="fixed"
//             menuPlacement="auto"
//         />
//     );
// };


//     const resetForm = () => {
//         setSelectedItems([]);
//         setStaffInvolvedList([]);
//         setTripSheetInfo(tripMasterDetails);
//         setTransactionData([]);
//     };

//     const saveTripSheet = () => {
//         if (loadingOn) loadingOn();
//         fetchLink({
//             address: `delivery/deliveryOrderTrip`,
//             method: checkIsNumber(tripSheetInfo?.Trip_Id) ? "PUT" : "POST",
//             bodyData: {
//                 ...tripSheetInfo,
//                 StartTime:
//                     tripSheetInfo.StartTime && tripSheetInfo.Trip_Date
//                         ? combineDateTime(tripSheetInfo.Trip_Date, tripSheetInfo.StartTime)
//                         : "",
//                 EndTime:
//                     tripSheetInfo.EndTime && tripSheetInfo.Trip_Date
//                         ? combineDateTime(tripSheetInfo.Trip_Date, tripSheetInfo.EndTime)
//                         : "",
//                 Product_Array: selectedItems,
//                 Delivery_Person_Id: deliveryPerson?.UserId,
//                 EmployeesInvolved: staffInvolvedList.filter(
//                     (staff) =>
//                         checkIsNumber(staff.Involved_Emp_Id) &&
//                         checkIsNumber(staff.Cost_Center_Type_Id)
//                 ),
//             },
//         })
//             .then((data) => {
//                 if (data.success) {
//                     resetForm();
//                     toast.success(data.message);
//                 } else {
//                     toast.error(data.message);
//                 }
//             })
//             .catch((e) => console.log(e))
//             .finally(() => {
//                 if (loadingOff) loadingOff();
//             });
//     };

//     const ExpendableComponent = ({ row }) => {
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

//     const handleCostCenterChange = (e, index) => {
//         setStaffInvolvedList((prev) => {
//             const updatedList = prev.map((item, ind) => {
//                 if (isEqualNumber(ind, index)) {
//                     const updatedItem = { ...item, Cost_Center_Type_Id: e.target.value };
//                     if (Number(updatedItem.Cost_Center_Type_Id) === 9) {
//                         setDeliveryPerson({
//                             UserId: updatedItem.Involved_Emp_Id,
//                             Name: updatedItem.Emp_Name,
//                         });
//                     } else if (deliveryPerson?.UserId === updatedItem.Involved_Emp_Id) {
//                         setDeliveryPerson(null);
//                     }
//                     return updatedItem;
//                 }
//                 return item;
//             });

//             return updatedList;
//         });
//     };

//     const handleCheckboxChange = (row) => {
//         setSelectedItems((prevSelectedItems) => {
//             const isSelected = prevSelectedItems.some(
//                 (selectedRow) => selectedRow.Do_Id == row.Do_Id
//             );

//             if (isSelected) {
//                 return prevSelectedItems.filter(
//                     (selectedRow) => selectedRow.Do_Id != row.Do_Id
//                 );
//             } else {
//                 return [...prevSelectedItems, row];
//             }
//         });
//     };

//     return (
//         <>
//             <Card>
//                 <div className="d-flex flex-wrap align-items-center border-bottom p-2">
//                     <h5 className="flex-grow-1 m-0 ps-2">Trip Sheet Creation</h5>
//                     <Button
//                         variant="outlined"
//                         onClick={saveTripSheet}
//                         disabled={
//                             selectedItems.length === 0 ||
//                             !isValidDate(tripSheetInfo.Trip_Date)
//                         }
//                     >
//                         Save
//                     </Button>
//                 </div>

//                 <CardContent style={{ minHeight: 500 }}>
//                     <div className="row ">
//                         <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
//                             <div
//                                 className="border p-2"
//                                 style={{ minHeight: "30vh", height: "100%" }}
//                             >
//                                 <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
//                                     <h6 className="flex-grow-1 m-0">Staff Involved</h6>
//                                     <Button
//                                         variant="outlined"
//                                         color="primary"
//                                         type="button"
//                                         onClick={() =>
//                                             setStaffInvolvedList([
//                                                 ...staffInvolvedList,
//                                                 { ...tripStaffsColumns },
//                                             ])
//                                         }
//                                     >
//                                         Add
//                                     </Button>
//                                 </div>
//                                 <table className="table table-bordered">
//                                     <thead>
//                                         <tr>
//                                             <th className="fa-13">Sno</th>
//                                             <th className="fa-13">Staff Name</th>
//                                             <th className="fa-13">Category</th>
//                                         </tr>
//                                     </thead>
//                                   <tbody>
//                                         {staffInvolvedList.map((row, index) => (
//                                             <tr key={index}>
//                                                 <td className="fa-13 vctr text-center">{index + 1}</td>
//                                                 <td className="fa-13 w-100 p-0">
//                                                     <Select
//                                                         value={{
//                                                             value: row?.Involved_Emp_Id,
//                                                             label: row?.Emp_Name,
//                                                         }}
//                                                         onChange={(e) => {
//                                                             setStaffInvolvedList((prev) => {
//                                                                 const updatedList = prev.map((item, ind) => {
//                                                                     if (isEqualNumber(ind, index)) {
//                                                                         const staff = costCenter.find((c) =>
//                                                                             isEqualNumber(c.Cost_Center_Id, e.value)
//                                                                         );
//                                                                         const updatedItem = {
//                                                                             ...item,
//                                                                             Cost_Center_Type_Id:
//                                                                                 item.Cost_Center_Type_Id ||
//                                                                                 staff.User_Type ||
//                                                                                 0,
//                                                                             Involved_Emp_Id: e.value,
//                                                                             Emp_Name: staff.Cost_Center_Name ?? "",
//                                                                         };

//                                                                         if (
//                                                                             Number(
//                                                                                 updatedItem.Cost_Center_Type_Id
//                                                                             ) === 9
//                                                                         ) {
//                                                                             setDeliveryPerson({
//                                                                                 UserId: updatedItem.Involved_Emp_Id,
//                                                                                 Name: updatedItem.Emp_Name,
//                                                                             });
//                                                                         } else if (
//                                                                             deliveryPerson?.UserId ===
//                                                                             updatedItem.Involved_Emp_Id
//                                                                         ) {
//                                                                             setDeliveryPerson(null);
//                                                                         }

//                                                                         return updatedItem;
//                                                                     }
//                                                                     return item;
//                                                                 });

//                                                                 return updatedList;
//                                                             });
//                                                         }}
//                                                         options={costCenter
//                                                             .filter(
//                                                                 (fil) =>
//                                                                     staffInvolvedList.findIndex((st) =>
//                                                                         isEqualNumber(
//                                                                             st.Cost_Center_Type_Id,
//                                                                             fil.Cost_Center_Id
//                                                                         )
//                                                                     ) === -1
//                                                             )
//                                                             .map((st) => ({
//                                                                 value: st.Cost_Center_Id,
//                                                                 label: st.Cost_Center_Name,
//                                                             }))}
//                                                         styles={customSelectStyles}
//                                                         isSearchable
//                                                         placeholder="Select Staff"
//                                                     />
//                                                 </td>
//                                                 <td
//                                                     className="fa-13 vctr p-0"
//                                                     style={{ maxWidth: "130px", minWidth: "110px" }}
//                                                 >
//                                                     <select
//                                                         value={row?.Cost_Center_Type_Id}
//                                                         onChange={(e) => handleCostCenterChange(e, index)}
//                                                         className="cus-inpt p-2"
//                                                     >
//                                                         <option value="">Select</option>
//                                                         {costCenterCategory.map((st, sti) => (
//                                                             <option value={st?.Cost_Category_Id} key={sti}>
//                                                                 {st?.Cost_Category}
//                                                             </option>
//                                                         ))}
//                                                     </select>
//                                                 </td>
//                                                 <td className="fa-13 vctr text-center">
//                                                     <button
//                                                         className="btn btn-danger btn-sm"
//                                                         onClick={() => {
//                                                             setStaffInvolvedList((prev) => {
//                                                                 const updatedList = prev.filter(
//                                                                     (_, i) => i !== index
//                                                                 );

//                                                                 if (
//                                                                     deliveryPerson?.UserId === row.Involved_Emp_Id
//                                                                 ) {
//                                                                     setDeliveryPerson(null);
//                                                                 }

//                                                                 return updatedList;
//                                                             });
//                                                         }}
//                                                     >
//                                                         <Close />
//                                                     </button>
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>

//                         {/* Stock Journal Details */}
//                         <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
//                             <div
//                                 className="border p-2"
//                                 style={{ minHeight: "30vh", height: "100%" }}
//                             >
//                                 <div className="row">
//                                     <div className="col-xl-3 col-md-4 col-sm-6 p-2">
//                                         <label>
//                                             Branch <span style={{ color: "red" }}>*</span>
//                                         </label>
//                                         <select
//                                             value={tripSheetInfo.Branch_Id}
//                                             onChange={(e) =>
//                                                 setTripSheetInfo({
//                                                     ...tripSheetInfo,
//                                                     Branch_Id: e.target.value,
//                                                 })
//                                             }
//                                             placeholder={"Select Branch"}
//                                             className="cus-inpt mb-2 p-2"
//                                         >
//                                             <option value="" disabled>
//                                                 Select Branch
//                                             </option>
//                                             {branch.map((br, bi) => (
//                                                 <option key={bi} value={br.BranchId}>
//                                                     {br.BranchName}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div className="col-xl-3 col-md-4 col-sm-6 p-2">
//                                         <label>Trip_Date</label>
//                                         <input
//                                             value={tripSheetInfo.Trip_Date}
//                                             type="date"
//                                             onChange={(e) =>
//                                                 setTripSheetInfo({
//                                                     ...tripSheetInfo,
//                                                     Trip_Date: e.target.value,
//                                                 })
//                                             }
//                                             className="cus-inpt p-2 mb-2"
//                                         />
//                                     </div>
                                   
//                                     <div className="col-xl-3 col-md-4 col-sm-6 p-2">
//                                         <label>Vehicle No</label>
//                                         <input
//                                             value={tripSheetInfo.Vehicle_No}
//                                             onChange={(e) =>
//                                                 setTripSheetInfo({
//                                                     ...tripSheetInfo,
//                                                     Vehicle_No: e.target.value,
//                                                 })
//                                             }
//                                             className="cus-inpt p-2 mb-2"
//                                         />
//                                     </div>
//                                     <div className="col-xl-3 col-md-6 col-sm-12 p-2">
//                                         <label>
//                                             Delivery Person <span style={{ color: "red" }}>*</span>
//                                         </label>
//                                         <input
//                                             id="delivery-person"
//                                             name="deliveryPerson"
//                                             type="text"
//                                             value={deliveryPerson ? deliveryPerson.Name : ""}
//                                             readOnly
//                                             className="form-control"
//                                             placeholder="Delivery Person"
//                                         />
//                                     </div>
//                                     <div className="col-xl-3 col-md-4 col-sm-6 p-2">
//                                         <label>Trip No</label>
//                                         <input
//                                             value={tripSheetInfo.Trip_No}
//                                             onChange={(e) =>
//                                                 setTripSheetInfo({
//                                                     ...tripSheetInfo,
//                                                     Trip_No: e.target.value,
//                                                 })
//                                             }
//                                             className="cus-inpt p-2 mb-2"
//                                         />
//                                     </div>

//                                     <div className="col-xl-3 col-md-4 col-sm-6 p-2">
//                                         <label>Voucher Type</label>
//                                         <select
//                                             className="cus-inpt p-2 mb-2"
//                                             value={tripSheetInfo?.VoucherType ?? ""} 
//                                             onChange={(e) =>
//                                                 setTripSheetInfo({
//                                                     ...tripSheetInfo,
//                                                     VoucherType: e.target.value,
//                                                 })
//                                             }
//                                         >
//                                             <option value="">Select Voucher Type</option>
//                                             <option value="0">SALES</option>
//                                         </select>
//                                     </div>
//                                     <div className="col-xl-3 col-md-4 col-sm-6 p-2">
//                                         <label>Bill Type</label>
//                                         <select
//                                             className="cus-inpt p-2 mb-2"
//                                             value={tripSheetInfo?.BillType ?? ""}
//                                             onChange={(e) =>
//                                                 setTripSheetInfo({
//                                                     ...tripSheetInfo,
//                                                     BillType: e.target.value,
//                                                 })
//                                             }
//                                         >
//                                             <option value="">Select Bill Type</option>
//                                             <option value="SALES">SALES</option>
//                                         </select>
//                                     </div>
//                                     <div className="col-xl-3 col-md-4 col-sm-6 p-2">
//                                         <label>Trip Status</label>
//                                         <select
//                                             value={tripSheetInfo?.TripStatus || ""}
//                                             onChange={(e) =>
//                                                 setTripSheetInfo((pre) => ({
//                                                     ...pre,
//                                                     TripStatus: e.target.value,
//                                                 }))
//                                             }
//                                             className="cus-inpt p-2"
//                                         >
//                                             <option value="">Select</option>
//                                             <option value="New">New</option>
//                                             <option value="OnProcess">OnProcess</option>
//                                             <option value="Completed">Completed</option>
//                                             <option value="Canceled">Canceled</option>
//                                         </select>
//                                     </div>
//                                 </div>

//                                 <div className="table-responsive">
//                                     <table className="table table-bordered">
//                                         <thead>
//                                             <tr>
//                                                 <th colSpan={2} className="fa-13 text-center">
//                                                     Time
//                                                 </th>
//                                                 <th colSpan={2} className="fa-13 text-center">
//                                                     Distance
//                                                 </th>
//                                             </tr>
//                                             <tr>
//                                                 <th className="fa-13 text-center">Start </th>
//                                                 <th className="fa-13 text-center">End</th>
//                                                 <th className="fa-13 text-center">Start (Km)</th>
//                                                 <th className="fa-13 text-center">End (Km)</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             <tr>
//                                                 <td className="fa-13">
//                                                     <input
//                                                         type="time"
//                                                         onChange={(e) =>
//                                                             setTripSheetInfo((pre) => ({
//                                                                 ...pre,
//                                                                 StartTime: e.target.value,
//                                                             }))
//                                                         }
//                                                         value={tripSheetInfo?.StartTime}
//                                                         className="cus-inpt p-2"
//                                                     />
//                                                 </td>
//                                                 <td className="fa-13">
//                                                     <input
//                                                         type="time"
//                                                         onChange={(e) =>
//                                                             setTripSheetInfo((pre) => ({
//                                                                 ...pre,
//                                                                 EndTime: e.target.value,
//                                                             }))
//                                                         }
//                                                         value={tripSheetInfo?.EndTime}
//                                                         className="cus-inpt p-2"
//                                                     />
//                                                 </td>
//                                                 <td className="fa-13">
//                                                     <input
//                                                         type="number"
//                                                         onChange={(e) =>
//                                                             setTripSheetInfo((pre) => ({
//                                                                 ...pre,
//                                                                 Trip_ST_KM: e.target.value,
//                                                                 Trip_Tot_Kms: Subraction(
//                                                                     pre.Trip_EN_KM ?? 0,
//                                                                     e.target.value ?? 0
//                                                                 ),
//                                                             }))
//                                                         }
//                                                         value={tripSheetInfo?.Trip_ST_KM}
//                                                         min={0}
//                                                         className="cus-inpt p-2"
//                                                         placeholder="Kilometers"
//                                                     />
//                                                 </td>
//                                                 <td className="fa-13">
//                                                     <input
//                                                         type="number"
//                                                         onChange={(e) =>
//                                                             setTripSheetInfo((pre) => ({
//                                                                 ...pre,
//                                                                 Trip_EN_KM: e.target.value,
//                                                                 Trip_Tot_Kms: Subraction(
//                                                                     e.target.value ?? 0,
//                                                                     pre.Trip_ST_KM ?? 0
//                                                                 ),
//                                                             }))
//                                                         }
//                                                         value={tripSheetInfo?.Trip_EN_KM}
//                                                         min={Addition(tripSheetInfo?.Trip_ST_KM, 1)}
//                                                         className="cus-inpt p-2"
//                                                         placeholder="Kilometers"
//                                                     />
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                     {
//                         <div className="d-flex justify-content-end gap-3">
//                             <h6 className="m-0 text-muted">
//         Total Bill Qty: {selectedItems?.reduce((acc, item) => 
//             acc + (item?.Products_List?.reduce((sum, product) => 
//                 sum + (parseFloat(product?.Bill_Qty) || 0), 0) || 0), 0)
//         }
//     </h6>
//                             <h6 className="m-0 text-muted">Selected Sales Orders: {selectedItems.length}</h6> <span></span>
//                             <h6 className="m-0 text-muted">
//                                 Total Items: {selectedItems?.reduce((acc, item) => acc + (item.Products_List?.length || 0), 0)}
//                             </h6>
//                         </div>
//                     }
//                     <FilterableTable
//                         dataArray={selectedItems?.map((item) => item?.Products_List).flat()}
//                         expandableComp={ExpendableComponent}
//                         ButtonArea={
//                             <>
//                                 <Button
//                                     onClick={() =>
//                                         setFilters((prev) => ({ ...prev, addItemDialog: true }))
//                                     }
//                                 >
//                                     Add
//                                 </Button>
//                                 <Button onClick={() => setSelectedItems([])} className="me-2">
//                                     Clear
//                                 </Button>
//                             </>
//                         }
//                         EnableSerialNumber
//                         disablePagination
//                         // title={`Selected Items: ${selectedItems?.reduce((acc, item) => acc + item.Products_List.length, 0) ?? 0} QTY: ${selectedItems?.reduce((acc, item) => acc + item.Products_List.reduce((sum, product) => sum + (product.Total_Qty ?? 0), 0), 0) ?? 0}`}
//                         maxHeightOption
//                         columns={[
//                             createCol("Retailer_Name", "string", "Retailer_Name"),
//                             createCol("Product_Name", "string", "Product_Name"),
//                             // createCol('Sales_Order_Id', 'string', 'So_Id'),
//                             // createCol('So_Date', 'date', 'So_Date'),
//                             createCol("Taxable_Rate", "number", "Rate"),
//                             createCol("Bill_Qty", "number", "Bill_Qty"),
//                             createCol("Taxable_Amount", "string", "Before_Tax_Amount"),
//                             createCol("Amount", "number", "Total_Invoice_value"),
//                             {
//                                 isVisible: 1,
//                                 ColumnHeader: "#",
//                                 isCustomCell: true,
//                                 Cell: ({ row }) => (
//                                     <IconButton
//                                         variant="contained"
//                                         color="error"
//                                         size="small"
//                                         onClick={() => {
//                                             const filteredItems = selectedItems
//                                                 ?.map((item) => {
//                                                     return {
//                                                         ...item,
//                                                         Products_List: item.Products_List.filter(
//                                                             (o) =>
//                                                                 o[row.DO_St_Id ? "DO_St_Id" : "SO_St_Id"] !==
//                                                                 row[row.DO_St_Id ? "DO_St_Id" : "SO_St_Id"]
//                                                         ),
//                                                     };
//                                                 })
//                                                 .filter((item) => item.Products_List.length > 0);

//                                             setSelectedItems(filteredItems);
//                                         }}
//                                     >
//                                         <Delete className="fa-20" />
//                                     </IconButton>
//                                 ),
//                             },
//                         ]}
//                     />
//                 </CardContent>
//                 <div className="border-top p-2 text-end">
//                     <Button
//                         variant="outlined"
//                         onClick={saveTripSheet}
//                         disabled={
//                             selectedItems.length === 0 ||
//                             !isValidDate(tripSheetInfo.Trip_Date)
//                         }
//                     >
//                         Save
//                     </Button>
//                 </div>
//             </Card>

//             <Dialog
//                 open={filters.addItemDialog}
//                 onClose={() => setFilters((pre) => ({ ...pre, addItemDialog: false }))}
//                 maxWidth="lg"
//                 fullWidth
//                 fullScreen
//             >
//                 <form onSubmit={searchTransaction}>
//                     <DialogTitle className="d-flex align-items-center">
//                         <span className="flex-grow-1">Add Data</span>
//                         <Button
//                             variant="outlined"
//                             type="submit"
//                             className="me-2"
//                             startIcon={<Search />}
//                         >
//                             Search
//                         </Button>
//                         <IconButton
//                             size="small"
//                             color="error"
//                             onClick={() =>
//                                 setFilters((pre) => ({ ...pre, addItemDialog: false }))
//                             }
//                         >
//                             <Close />
//                         </IconButton>
//                     </DialogTitle>

//             <DialogContent>
//     <div className="table-responsive">
//         <table className="table table-bordered">
//             <tbody>
  
//                 <tr>
            
//                     <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">From Date</td>
//                     <td>
//                         <input
//                             type="date"
//                             value={filters.Fromdate}
//                             className="cus-inpt p-2"
//                             required
//                             max={filters.Todate}
//                             onChange={(e) =>
//                                 setFilters((pre) => ({
//                                     ...pre,
//                                     Fromdate: e.target.value,
//                                 }))
//                             }
//                             style={{ width: "100%" }}
//                         />
//                     </td>

             
//                     <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">To Date</td>
//                     <td>
//                         <input
//                             type="date"
//                             value={filters.Todate}
//                             className="cus-inpt p-2"
//                             min={filters.Fromdate}
//                             required
//                             onChange={(e) =>
//                                 setFilters((pre) => ({
//                                     ...pre,
//                                     Todate: e.target.value,
//                                 }))
//                             }
//                             style={{ width: "100%" }}
//                         />
//                     </td>

                   
//                     <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Sales Person</td>
//                     <td>
//                         <Select
//                             value={{ 
//                                 value: filters?.Sales_Person_Id, 
//                                 label: filters?.Sales_Person_Name || "ALL" 
//                             }}
//                             onChange={(e) => {
//                                 setFilters({
//                                     ...filters,
//                                     Sales_Person_Id: e.value,
//                                     Sales_Person_Name: e.label,
//                                 });
//                             }}
//                             options={[
//                                 { value: "", label: "ALL" },
//                                 ...salesPerson.map((obj) => ({
//                                     value: obj?.UserId,
//                                     label: obj?.Name,
//                                 })),
//                             ]}
//                             placeholder={"Select Sales Person"}
//                             styles={{
//                                 menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//                             }}
//                             isSearchable={true}
//                             menuPortalTarget={document.body}
//                             menuPosition="fixed"
//                             menuPlacement="auto"
//                         />
//                     </td>

                 
//                     <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Voucher Type</td>
//                     <td>
//                         <MultiSelect
//                             value={(filters.VoucherType || []).map(val => ({
//                                 value: val,
//                                 label: voucherTypeOptions.find(opt => opt.value === val)?.label || val
//                             }))}
//                             onChange={(selectedOptions) =>
//                                 setFilters({
//                                     ...filters,
//                                     VoucherType: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
//                                 })
//                             }
//                             options={voucherTypeOptions}
//                             placeholder={"Select Voucher Types"}
//                         />
//                     </td>
//                 </tr>
                
             
//                 <tr>
                  
//                     <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Branch</td>
//                     <td>
//                         <Select
//                             value={{ 
//                                 value: filters?.Branch, 
//                                 label: filters?.BranchName || "ALL" 
//                             }}
//                             onChange={(e) =>
//                                 setFilters({
//                                     ...filters,
//                                     Branch: e.value,
//                                     BranchName: e.label,
//                                 })
//                             }
//                             options={[
//                                 { value: "", label: "ALL" },
//                                 ...branch.map((option) => ({
//                                     value: option.BranchId,
//                                     label: option.BranchName,
//                                 })),
//                             ]}
//                             placeholder={"Select Branch"}
//                             styles={{
//                                 menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//                             }}
//                             isSearchable={true}
//                             menuPortalTarget={document.body}
//                             menuPosition="fixed"
//                             menuPlacement="auto"
//                         />
//                     </td>

               
//                     <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Broker</td>
//                     <td>
//                         <MultiSelect
//                             value={(filters.Broker || []).map(val => ({
//                                 value: val,
//                                 label: broker.find(b => b.Cost_Center_Id === val)?.Cost_Center_Name || val
//                             }))}
//                             onChange={(selectedOptions) =>
//                                 setFilters({
//                                     ...filters,
//                                     Broker: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
//                                 })
//                             }
//                             options={broker.map(option => ({
//                                 value: option.Cost_Center_Id,
//                                 label: option.Cost_Center_Name,
//                             }))}
//                             placeholder={"Select Brokers"}
//                         />
//                     </td>
      
             
//                     <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Transporter</td>
//                     <td>
//                         <MultiSelect
//                             value={(filters.Transporters || []).map(val => ({
//                                 value: val,
//                                 label: transporters.find(t => t.Cost_Center_Id === val)?.Cost_Center_Name || val
//                             }))}
//                             onChange={(selectedOptions) =>
//                                 setFilters({
//                                     ...filters,
//                                     Transporters: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
//                                 })
//                             }
//                             options={transporters.map(option => ({
//                                 value: option.Cost_Center_Id,
//                                 label: option.Cost_Center_Name,
//                             }))}
//                             placeholder={"Select Transporters"}
//                         />
//                     </td>

//                     {/* Godown */}
//                     <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Godown</td>
//                     <td>
//                         <Select
//                             value={{ 
//                                 value: filters?.Godown, 
//                                 label: filters?.GodownName || "ALL" 
//                             }}
//                             onChange={(e) =>
//                                 setFilters({
//                                     ...filters,
//                                     Godown: e.value,
//                                     GodownName: e.label,
//                                 })
//                             }
//                             options={[
//                                 { value: "", label: "ALL" },
//                                 ...godowns.map((option) => ({
//                                     value: option.Godown_Id,
//                                     label: option.Godown_Name,
//                                 })),
//                             ]}
//                             placeholder={"Select Godown"}
//                             styles={{
//                                 menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//                             }}
//                             isSearchable={true}
//                             menuPortalTarget={document.body}
//                             menuPosition="fixed"
//                             menuPlacement="auto"
//                         />
//                     </td>
//                 </tr>

             
//                 <tr>
              
//                     <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Retailers</td>
//                     <td colSpan="3">
//                         <MultiSelect
//                             value={(filters.Retailer || []).map(val => ({
//                                 value: val,
//                                 label: retailers.find(r => r.Retailer_Id === val)?.Retailer_Name || val
//                             }))}
//                             onChange={(selectedOptions) =>
//                                 setFilters({
//                                     ...filters,
//                                     Retailer: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
//                                 })
//                             }
//                             options={retailers.map(option => ({
//                                 value: option.Retailer_Id,
//                                 label: option.Retailer_Name,
//                             }))}
//                             placeholder={"Select Retailers"}
//                         />
//                     </td>

//                     {/* Products */}
//                     <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Products</td>
//                     <td colSpan="3">
//                         <MultiSelect
//                             value={(filters.Item || []).map(val => ({
//                                 value: val,
//                                 label: items.find(i => i.Product_Id === val)?.Product_Name || val
//                             }))}
//                             onChange={(selectedOptions) =>
//                                 setFilters({
//                                     ...filters,
//                                     Item: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
//                                 })
//                             }
//                             options={items.map(option => ({
//                                 value: option.Product_Id,
//                                 label: option.Product_Name,
//                             }))}
//                             placeholder={"Select Products"}
//                         />
//                     </td>
//                 </tr>
//             </tbody>
//         </table>
//     </div>

//     <div className="d-flex justify-content-between align-items-center">
//         {transactionData.length > 0 && (
//             <Button
//                 variant="outlined"
//                 onClick={() => {
//                     if (selectedItems.length === transactionData.length) {
//                         setSelectedItems([]);
//                     } else {
//                         setSelectedItems(transactionData);
//                     }
//                 }}
//             >
//                 {selectedItems.length === transactionData.length
//                     ? "Unselect All"
//                     : "Select All"}
//             </Button>
//         )}

//         {selectedItems.length >= 0 && (
//             <div className="d-flex justify-content-end gap-3">
//                 <h6 className="m-0 text-muted">Selected Sales Orders: {selectedItems.length}</h6>
//                 <h6 className="m-0 text-muted">
//                     Total Items: {selectedItems?.reduce((acc, item) => acc + (item.Products_List?.length || 0), 0)}
//                 </h6>
//             </div>
//         )}
//     </div>

//     <FilterableTable
//         dataArray={transactionData}
//         disablePagination
//         maxHeightOption
//         columns={[
//             {
//                 Field_Name: "checkbox",
//                 ColumnHeader: "",
//                 isVisible: 1,
//                 pointer: true,
//                 isCustomCell: true,
//                 Cell: ({ row }) => {
//                     return (
//                         <input
//                             type="checkbox"
//                             checked={selectedItems.some(
//                                 (selectedRow) => selectedRow.Do_Id === row.Do_Id
//                             )}
//                             onChange={() => handleCheckboxChange(row)}
//                             onFocus={(e) => {
//                                 e.target.blur();
//                             }}
//                             style={{
//                                 cursor: "pointer",
//                                 transform: "scale(1.5)",
//                                 width: "14px",
//                                 height: "20px",
//                             }}
//                         />
//                     );
//                 },
//             },
//             createCol("Retailer_Name", "string", "Retailer_Name"),
//             createCol("Branch_Name", "string", "Branch_Name"),
//             createCol("AreaName", "string", "AreaName"),
//             createCol("Do_Date", "date", "Do_Date"),
//             createCol("Total_Before_Tax", "string", "Total_Before_Tax"),
//             createCol("Total_Tax", "number", "Total_Tax"),
//             createCol("Total_Invoice_value", "number", "Total_Invoice_value"),
//         ]}
//     />
// </DialogContent>

//                     <DialogActions>
//                         <Button
//                             type="button"
//                             onClick={() =>
//                                 setFilters((pre) => ({ ...pre, addItemDialog: false }))
//                             }
//                         >
//                             close
//                         </Button>
//                     </DialogActions>
//                 </form>
//             </Dialog>
//         </>
//     );
// };

// export default TripSheetGodownSearch;






























import { useEffect, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
} from "@mui/material";
import {
    Addition,
    checkIsNumber,
    combineDateTime,
    isEqualNumber,
    ISOString,
    isValidDate,
    isValidObject,
    Subraction,
} from "../../../Components/functions";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Close, Delete, Search } from "@mui/icons-material";
import FilterableTable, {
    createCol,
} from "../../../Components/filterableTable2";
import { tripMasterDetails, tripStaffsColumns } from "./tableColumns";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import Godown from "../../Masters/Godown";

const TripSheetGodownSearch = ({ loadingOn, loadingOff }) => {
    const location = useLocation();
    const stateDetails = location.state;
    const [deliveryPerson, setDeliveryPerson] = useState(null);
    const storage = JSON.parse(localStorage.getItem("user"));
    const [salesPerson, setSalePerson] = useState([]);
    const [filters, setFilters] = useState({
        Retailer_Id: "",
        RetailerGet: "ALL",
        Created_by: "",
        CreatedByGet: "ALL",
        Sales_Person_Id: "",
        SalsePersonGet: "ALL",
        Cancel_status: 0,
        Route_Id: "",
        RoutesGet: "ALL",
        Area_Id: "",
        AreaGet: "ALL",
        Fromdate: ISOString(),
        Todate: ISOString(),
        VoucherType: [],
        Broker: [],
        Transporters: [],
        Loadman:[],
        Item: [],
        Godown: "",
        search: false,
        addItemDialog: false,
        Retailer: []
    });

    const [transactionData, setTransactionData] = useState([]);
    const [costCenter, setCostCenter] = useState([]);
    const [costCenterCategory, setCostCenterCategory] = useState([]);
    const [branch, setBranch] = useState([]);
    const [tripSheetInfo, setTripSheetInfo] = useState(tripMasterDetails);
    const [staffInvolvedList, setStaffInvolvedList] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [voucher, setVoucher] = useState([]);
    const [broker, setBroker] = useState([]);
    const [loadman,setLoadman]=useState([])
    const [transporters, setTransporters] = useState([]);
    const [items, setItems] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [isEditMode, setIsEditMode] = useState(false);
    const [initialized, setInitialized] = useState(false);
    


 const updateStaffInvolvedFromSelectedItems = (selectedItemsList) => {
    if (!selectedItemsList || selectedItemsList.length === 0) {
        // Only clear staff if not in edit mode
        if (!isEditMode) {
            setStaffInvolvedList([]);
            setDeliveryPerson(null);
        }
        return;
    }

    // Collect all staff from selected items
    const allStaff = [];
    selectedItemsList.forEach(item => {
        if (item.All_Staff_Details && Array.isArray(item.All_Staff_Details)) {
            item.All_Staff_Details.forEach(staff => {
                allStaff.push({
                    Emp_Id: staff.Emp_Id,
                    Staff_Name: staff.Staff_Name,
                    Cost_Category: staff.Cost_Category,
                    Cost_Category_Id: staff.Cost_Category_Id,
                    Emp_Type_Id: staff.Emp_Type_Id,
                    Do_Id: item.Do_Id
                });
            });
        }
    });

    const distinctStaff = Array.from(
        new Map(allStaff.map(staff => [staff.Emp_Id, staff])).values()
    );

    const staffInvolved = distinctStaff.map(staff => ({
        Involved_Emp_Id: staff.Emp_Id,
        Emp_Name: staff.Staff_Name,
        Cost_Center_Type_Id: staff.Cost_Category_Id || staff.Emp_Type_Id || 0,
        Staff_Type: staff.Cost_Category || "",
        ...Object.fromEntries(
            Object.entries(tripStaffsColumns).map(([key, value]) => {
                if (key === 'Involved_Emp_Id') return [key, staff.Emp_Id];
                if (key === 'Emp_Name') return [key, staff.Staff_Name];
                if (key === 'Cost_Center_Type_Id') return [key, staff.Cost_Category_Id || staff.Emp_Type_Id || 0];
                if (key === 'Staff_Type') return [key, staff.Cost_Category || ""];
                return [key, value];
            })
        )
    }));

    setStaffInvolvedList(staffInvolved);

    const deliveryStaff = distinctStaff.find(
        staff => Number(staff.Cost_Category_Id) === 9 || Number(staff.Emp_Type_Id) === 9
    );
    if (deliveryStaff) {
        setDeliveryPerson({
            UserId: deliveryStaff.Emp_Id,
            Name: deliveryStaff.Staff_Name,
        });
    } else if (!isEditMode) {
        // Only clear delivery person in add mode
        setDeliveryPerson(null);
    }
};


const handleSelectAllStaffFromResults = () => {
    if (transactionData.length === 0) return;

    // Collect all staff from all transaction data
    const allStaff = [];
    transactionData.forEach(item => {
        if (item.All_Staff_Details && Array.isArray(item.All_Staff_Details)) {
            item.All_Staff_Details.forEach(staff => {
                allStaff.push({
                    Emp_Id: staff.Emp_Id,
                    Staff_Name: staff.Staff_Name,
                    Cost_Category_Id: staff.Cost_Category_Id,
                    Emp_Type_Id: staff.Emp_Type_Id,
                    Cost_Category: staff.Cost_Category,
                    Do_Id: item.Do_Id
                });
            });
        }
    });

    const distinctStaff = Array.from(
        new Map(allStaff.map(staff => [staff.Emp_Id, staff])).values()
    );

    const staffInvolved = distinctStaff.map(staff => ({
        Involved_Emp_Id: staff.Emp_Id,
        Emp_Name: staff.Staff_Name,
        Cost_Center_Type_Id: staff.Cost_Category_Id || staff.Emp_Type_Id || 0,
        Do_Id: staff.Do_Id,
        ...Object.fromEntries(
            Object.entries(tripStaffsColumns).map(([key, value]) => {
                if (key === 'Involved_Emp_Id') return [key, staff.Emp_Id];
                if (key === 'Emp_Name') return [key, staff.Staff_Name];
                if (key === 'Cost_Center_Type_Id') return [key, staff.Cost_Category_Id || staff.Emp_Type_Id || 0];
                if (key === 'Staff_Type') return [key, staff.Cost_Category];
                return [key, value];
            })
        )
    }));

    if (isEditMode) {
        // In edit mode: Merge with existing staff
        // Create a map of existing staff by Emp_Id
        const existingStaffMap = new Map();
        staffInvolvedList.forEach(staff => {
            existingStaffMap.set(Number(staff.Involved_Emp_Id), staff);
        });
        
        // Merge staff
        const mergedStaff = [...staffInvolvedList];
        
        staffInvolved.forEach(newStaff => {
            const staffExists = staffInvolvedList.some(
                existing => Number(existing.Involved_Emp_Id) === Number(newStaff.Involved_Emp_Id)
            );
            
            if (!staffExists) {
                mergedStaff.push(newStaff);
            }
        });
        
        setStaffInvolvedList(mergedStaff);
    } else {
        // In add mode: Replace all staff
        setStaffInvolvedList(staffInvolved);
    }

    // Check for delivery persons
    const deliveryStaff = distinctStaff.find(
        staff => Number(staff.Cost_Category_Id) === 9 || Number(staff.Emp_Type_Id) === 9
    );
    if (deliveryStaff && !deliveryPerson) {
        // Only set if not already set
        setDeliveryPerson({
            UserId: deliveryStaff.Emp_Id,
            Name: deliveryStaff.Staff_Name,
        });
    }
};

// Update the clearAllStaff function
const clearAllStaff = () => {
    if (isEditMode) {
        // In edit mode: Only clear staff that came from selected items
        // Keep manually added staff (staff without Do_Id)
        const manuallyAddedStaff = staffInvolvedList.filter(staff => !staff.Do_Id);
        setStaffInvolvedList(manuallyAddedStaff);
        
        // Clear delivery person only if they came from an order
        if (deliveryPerson && deliveryPerson.Do_Id) {
            setDeliveryPerson(null);
        }
    } else {
        // In add mode: Clear everything
        setStaffInvolvedList([]);
        setDeliveryPerson(null);
    }
};

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    branchResponse,
                    staffResponse,
                    staffCategory,
                    voucherResponse,
                    itemsRes,
                    godownRes,
                    retailerRes,
                    
                ] = await Promise.all([
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `masters/voucher` }),
                    fetchLink({ address: `masters/products/dropDown` }),
                    fetchLink({ address: `masters/godown` }),
                    fetchLink({ address: `masters/retailers/dropDown` })
                ]);

                // Branches
                const branchData = (branchResponse.success ? branchResponse.data : [])
                    .sort((a, b) => String(a?.BranchName).localeCompare(b?.BranchName));

                // All Cost Centers
                const staffData = (staffResponse.success ? staffResponse.data : [])
                    .sort((a, b) => String(a?.Cost_Center_Name).localeCompare(b?.Cost_Center_Name));

                // Cost Center Categories
                const staffCategoryData = (staffCategory.success ? staffCategory.data : [])
                    .sort((a, b) => String(a?.Cost_Category).localeCompare(b?.Cost_Category));

                // Filter brokers and transporters
                const brokers = staffData.filter(cc => cc.UserTypeGet === "Broker");
                const transporters = staffData.filter(cc => cc.UserTypeGet === "Transport");
                const loadman=staffData.filter(cc=>cc.UserTypeGet==="Load Man")
                // Other masters
                const voucherData = voucherResponse.success ? voucherResponse.data : [];
                const itemData = itemsRes.success ? itemsRes.data : [];
                const godownData = godownRes.success ? godownRes.data : [];
                const retailData = retailerRes.success ? retailerRes.data : [];

                // Update states
                setVoucher(voucherData);
                setBranch(branchData);
                setCostCenter(staffData);
                setCostCenterCategory(staffCategoryData);
                setBroker(brokers);
                setTransporters(transporters);
                setGodowns(godownData);
                setItems(itemData);
                setRetailers(retailData);
                setLoadman(loadman)

            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();
    }, []);

    const voucherTypeOptions = [
        { value: '', label: 'ALL' },
        ...voucher
            .filter(obj => obj.Type === 'SALES')
            .map(obj => ({
                value: obj?.Vocher_Type_Id,
                label: obj?.Voucher_Type
            }))
    ];

    const tripVoucherTypeOptions = voucher
        .filter(obj => obj.Type === 'SALES')
        .map(obj => ({
            value: obj?.Voucher_Type,
            label: obj?.Voucher_Type
        }));

    useEffect(() => {
        fetchLink({
            address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`,
        })
            .then((data) => {
                if (data.success) {
                    setSalePerson(data.data);
                }
            })
            .catch((e) => console.error(e));
    }, []);
useEffect(() => {
    const extractHHMM = (timeString) => {
        const date = new Date(timeString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`;
    };

    const productsArray = stateDetails?.Product_Array;
    const employeesArray = stateDetails?.Employees_Involved;
    
    if (isValidObject(stateDetails)) {
      
        setIsEditMode(true);
        
        setTripSheetInfo((prev) => ({
            ...prev,
            ...Object.fromEntries(
                Object.entries(tripMasterDetails).map(([key, value]) => {
                    if (key === "Trip_Date")
                        return [
                            key,
                            stateDetails[key] ? ISOString(stateDetails[key]) : value,
                        ];
                    if (key === "Branch_Id") return [key, stateDetails[key] ?? value];
                    if (key === "StartTime" || key === "EndTime")
                        return [
                            key,
                            stateDetails[key] ? extractHHMM(stateDetails[key]) : value,
                        ];

                    return [key, stateDetails[key] ?? value];
                })
            ),
            Trip_Id: stateDetails.Trip_Id || "",
            Challan_No: stateDetails.Challan_No || "",
            Vehicle_No: stateDetails.Vehicle_No || "",
            Trip_No: stateDetails.Trip_No || "",
            TripStatus: stateDetails.TripStatus || "New",
            Trip_ST_KM: stateDetails.Trip_ST_KM || "0",
            Trip_EN_KM: stateDetails.Trip_EN_KM || "0",
            Trip_Tot_Kms: stateDetails.Trip_Tot_Kms || "0",
            TR_INV_ID: stateDetails.TR_INV_ID || "",
            BillType: stateDetails.BillType || "SALES",
            VoucherType: stateDetails.VoucherType || 0,
            DO_Date: stateDetails.DO_Date || "",
        }));

    
        if (Array.isArray(productsArray) && productsArray.length > 0) {
            setSelectedItems(productsArray);
        }
        
      
        if (Array.isArray(employeesArray) && employeesArray.length > 0) {
            setStaffInvolvedList(
                employeesArray.map((staffData) =>
                    Object.fromEntries(
                        Object.entries(tripStaffsColumns).map(([key, value]) => {
                            return [key, staffData[key] ?? value];
                        })
                    )
                )
            );

            const deliveryStaff = employeesArray.find(
                (staff) => Number(staff.Cost_Center_Type_Id) === 9
            );
            if (deliveryStaff) {
                setDeliveryPerson({
                    UserId: deliveryStaff.Involved_Emp_Id,
                    Name: deliveryStaff.Emp_Name,
                });
            } else {
                setDeliveryPerson(null);
            }
        }
        
        setInitialized(true);
    } else {
  
        setIsEditMode(false);
        setInitialized(true);
    }
}, [stateDetails]);







// useEffect(() => {

//     if (!initialized) return;
//     if (isEditMode) {
//         console.log("Edit mode - skipping auto staff update");
//         return;
//     }
    
//     console.log("Add mode - updating staff from selected items");
//     updateStaffInvolvedFromSelectedItems(selectedItems);
// }, [selectedItems, isEditMode, initialized]);

 

useEffect(() => {
    // Don't run until initialized
    if (!initialized) return;
    
 
    
    // Always update staff from selected items, but preserve existing in edit mode
    if (selectedItems.length === 0) {
        // If no items selected and not in edit mode, clear staff
        if (!isEditMode) {
            setStaffInvolvedList([]);
            setDeliveryPerson(null);
        }
        return;
    }

    // Collect all staff from selected items
    const allStaff = [];
    selectedItems.forEach(item => {
        if (item.All_Staff_Details && Array.isArray(item.All_Staff_Details)) {
            item.All_Staff_Details.forEach(staff => {
                allStaff.push({
                    Emp_Id: staff.Emp_Id,
                    Staff_Name: staff.Staff_Name,
                    Cost_Category: staff.Cost_Category,
                    Cost_Category_Id: staff.Cost_Category_Id,
                    Emp_Type_Id: staff.Emp_Type_Id,
                    Do_Id: item.Do_Id
                });
            });
        }
    });

    const distinctStaff = Array.from(
        new Map(allStaff.map(staff => [staff.Emp_Id, staff])).values()
    );

    const staffInvolved = distinctStaff.map(staff => ({
        Involved_Emp_Id: staff.Emp_Id,
        Emp_Name: staff.Staff_Name,
        Cost_Center_Type_Id: staff.Cost_Category_Id || staff.Emp_Type_Id || 0,
        Staff_Type: staff.Cost_Category || "",
        Do_Id: staff.Do_Id, // Store which order this staff came from
        ...Object.fromEntries(
            Object.entries(tripStaffsColumns).map(([key, value]) => {
                if (key === 'Involved_Emp_Id') return [key, staff.Emp_Id];
                if (key === 'Emp_Name') return [key, staff.Staff_Name];
                if (key === 'Cost_Center_Type_Id') return [key, staff.Cost_Category_Id || staff.Emp_Type_Id || 0];
                if (key === 'Staff_Type') return [key, staff.Cost_Category || ""];
                return [key, value];
            })
        )
    }));

    if (isEditMode) {
        // In edit mode: Merge existing staff with new staff from selected items
        // Keep manually added staff (staff without Do_Id) and update/merge with new staff
        
        // Create a map of existing staff by Emp_Id
        const existingStaffMap = new Map();
        staffInvolvedList.forEach(staff => {
            existingStaffMap.set(Number(staff.Involved_Emp_Id), staff);
        });
        
        // Create a map of new staff from selected items
        const newStaffMap = new Map();
        staffInvolved.forEach(staff => {
            newStaffMap.set(Number(staff.Involved_Emp_Id), staff);
        });
        
        // Merge: For staff that exists in both, keep the existing (to preserve any manual changes)
        // For staff that only exists in new staff, add them
        const mergedStaff = [];
        
        // First, add all existing staff (preserve manual changes)
        staffInvolvedList.forEach(existingStaff => {
            mergedStaff.push(existingStaff);
        });
        
        // Then add new staff that doesn't already exist
        staffInvolved.forEach(newStaff => {
            const staffExists = staffInvolvedList.some(
                existing => Number(existing.Involved_Emp_Id) === Number(newStaff.Involved_Emp_Id)
            );
            
            if (!staffExists) {
                mergedStaff.push(newStaff);
            }
        });
        
        setStaffInvolvedList(mergedStaff);
        
        // Update delivery person if not already set
        const deliveryStaff = distinctStaff.find(
            staff => Number(staff.Cost_Category_Id) === 9 || Number(staff.Emp_Type_Id) === 9
        );
        
        if (deliveryStaff && !deliveryPerson) {
            // Only set delivery person if not already set
            setDeliveryPerson({
                UserId: deliveryStaff.Emp_Id,
                Name: deliveryStaff.Staff_Name,
            });
        }
    } else {
        // In add mode: Replace all staff
        setStaffInvolvedList(staffInvolved);

        const deliveryStaff = distinctStaff.find(
            staff => Number(staff.Cost_Category_Id) === 9 || Number(staff.Emp_Type_Id) === 9
        );
        if (deliveryStaff) {
            setDeliveryPerson({
                UserId: deliveryStaff.Emp_Id,
                Name: deliveryStaff.Staff_Name,
            });
        } else {
            setDeliveryPerson(null);
        }
    }
}, [selectedItems, isEditMode, initialized]);


const searchTransaction = (e) => {
        e.preventDefault();
        const { Fromdate, Todate, Sales_Person_Id, Broker, Transporters, Loadman,Godown, Item, Retailer, VoucherType } = filters;

        const voucherTypeString = Array.isArray(VoucherType) ? VoucherType.join(',') : VoucherType || '';
        const brokerString = Array.isArray(Broker) ? Broker.join(',') : Broker || '';
        const transporterString = Array.isArray(Transporters) ? Transporters.join(',') : Transporters || '';
         const loadmanString = Array.isArray(Loadman) ? Loadman.join(',') : Loadman || '';
        const itemString = Array.isArray(Item) ? Item.join(',') : Item || '';
        const retailerString = Array.isArray(Retailer) ? Retailer.join(',') : Retailer || '';
        const branchValue = filters?.Branch || '';

        if (Fromdate && Todate) {
            if (loadingOn) loadingOn();
            setTransactionData([]);
            fetchLink({
                address: `delivery/deliveryDetailsList?Fromdate=${Fromdate}&Todate=${Todate}&Sales_Person_Id=${Sales_Person_Id}&VoucherType=${voucherTypeString}&Branch=${branchValue}
                &Broker=${brokerString}&Transporter=${transporterString}&Loadman=${loadmanString}&Godown=${Godown}&Item=${itemString}&Retailer=${retailerString}`,
            })
                .then((data) => {
                    if (data.success) setTransactionData(data.data);
                })
                .catch((e) => console.log(e))
                .finally(() => {
                    if (loadingOff) loadingOff();
                });
        }
    };

    const MultiSelect = ({ value, onChange, options, placeholder, isSearchable = true }) => {
        return (
            <Select
                isMulti
                value={value}
                onChange={onChange}
                options={options}
                placeholder={placeholder}
                styles={{
                    ...customSelectStyles,
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                isSearchable={isSearchable}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                menuPlacement="auto"
            />
        );
    };

    const resetForm = () => {
        setSelectedItems([]);
        setStaffInvolvedList([]);
        setTripSheetInfo(tripMasterDetails);
        setTransactionData([]);
        setDeliveryPerson(null);
    };

    const saveTripSheet = () => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `delivery/deliveryOrderTrip`,
            method: checkIsNumber(tripSheetInfo?.Trip_Id) ? "PUT" : "POST",
            bodyData: {
                ...tripSheetInfo,
                StartTime:
                    tripSheetInfo.StartTime && tripSheetInfo.Trip_Date
                        ? combineDateTime(tripSheetInfo.Trip_Date, tripSheetInfo.StartTime)
                        : "",
                EndTime:
                    tripSheetInfo.EndTime && tripSheetInfo.Trip_Date
                        ? combineDateTime(tripSheetInfo.Trip_Date, tripSheetInfo.EndTime)
                        : "",
                Product_Array: selectedItems,
                Delivery_Person_Id: deliveryPerson?.UserId,
                EmployeesInvolved: staffInvolvedList.filter(
                    (staff) =>
                        checkIsNumber(staff.Involved_Emp_Id) &&
                        checkIsNumber(staff.Cost_Center_Type_Id)
                ),
            },
        })
            .then((data) => {
                if (data.success) {
                    resetForm();
                    toast.success(data.message);
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e) => console.log(e))
            .finally(() => {
                if (loadingOff) loadingOff();
            });
    };

    const handleCheckboxChange = (row) => {
        setSelectedItems((prevSelectedItems) => {
            const isSelected = prevSelectedItems.some(
                (selectedRow) => selectedRow.Do_Id == row.Do_Id
            );

            let newSelectedItems;
            if (isSelected) {
         
                newSelectedItems = prevSelectedItems.filter(
                    (selectedRow) => selectedRow.Do_Id != row.Do_Id
                );
            } else {
            
                newSelectedItems = [...prevSelectedItems, row];
            }



            return newSelectedItems;
        });
    };

    const handleSelectAllOrders = () => {
        if (selectedItems.length === transactionData.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(transactionData);
        }
    };

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

    const handleCostCenterChange = (e, index) => {
        setStaffInvolvedList((prev) => {
            const updatedList = prev.map((item, ind) => {
                if (isEqualNumber(ind, index)) {
                    const updatedItem = { ...item, Cost_Center_Type_Id: e.target.value };
                    if (Number(updatedItem.Cost_Center_Type_Id) === 9) {
                        setDeliveryPerson({
                            UserId: updatedItem.Involved_Emp_Id,
                            Name: updatedItem.Emp_Name,
                        });
                    } else if (deliveryPerson?.UserId === updatedItem.Involved_Emp_Id) {
                        setDeliveryPerson(null);
                    }
                    return updatedItem;
                }
                return item;
            });

            return updatedList;
        });
    };

    // Calculate distinct staff count from selected items
    const getDistinctStaffCount = () => {
        const allStaff = selectedItems.flatMap(item =>
            item.All_Staff_Details?.map(staff => staff.Emp_Id) || []
        );
        return new Set(allStaff).size;
    };

    return (
        <>
            <Card>
                <div className="d-flex flex-wrap align-items-center border-bottom p-2">
                    <h5 className="flex-grow-1 m-0 ps-2">Trip Sheet Creation</h5>
                    <Button
                        variant="outlined"
                        onClick={saveTripSheet}
                        disabled={
                            selectedItems.length === 0 ||
                            !isValidDate(tripSheetInfo.Trip_Date)
                        }
                    >
                        Save
                    </Button>
                </div>

                <CardContent style={{ minHeight: 500 }}>
                    <div className="row ">
                        <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                            <div
                                className="border p-2"
                                style={{ minHeight: "30vh", height: "100%" }}
                            >
                                <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                                    <h6 className="flex-grow-1 m-0">
                                        Staff Involved
                                        {/* <span className="text-muted ms-2">
                                            ({getDistinctStaffCount()} staff from {selectedItems.length} orders)
                                        </span> */}
                                    </h6>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        className="me-2"
                                        onClick={clearAllStaff}
                                        disabled={staffInvolvedList.length === 0}
                                    >
                                        Clear All
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        type="button"
                                        onClick={() =>
                                            setStaffInvolvedList([
                                                ...staffInvolvedList,
                                                { ...tripStaffsColumns },
                                            ])
                                        }
                                    >
                                        Add Manually
                                    </Button>
                                </div>
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th className="fa-13">Sno</th>
                                            <th className="fa-13">Staff Name</th>
                                            <th className="fa-13">Category</th>
                                            <th className="fa-13">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {staffInvolvedList.map((row, index) => (
                                            <tr key={index}>
                                                <td className="fa-13 vctr text-center">{index + 1}</td>
                                                <td className="fa-13 w-100 p-0">
                                                    <Select
                                                        value={{
                                                            value: row?.Involved_Emp_Id,
                                                            label: row?.Emp_Name,
                                                        }}
                                                        onChange={(e) => {
                                                            setStaffInvolvedList((prev) => {
                                                                const updatedList = prev.map((item, ind) => {
                                                                    if (isEqualNumber(ind, index)) {
                                                                        const staff = costCenter.find((c) =>
                                                                            isEqualNumber(c.Cost_Center_Id, e.value)
                                                                        );
                                                                        const updatedItem = {
                                                                            ...item,
                                                                            Cost_Center_Type_Id:
                                                                                item.Cost_Center_Type_Id ||
                                                                                staff.User_Type ||
                                                                                0,
                                                                            Involved_Emp_Id: e.value,
                                                                            Emp_Name: staff.Cost_Center_Name ?? "",
                                                                        };

                                                                        if (
                                                                            Number(
                                                                                updatedItem.Cost_Center_Type_Id
                                                                            ) === 9
                                                                        ) {
                                                                            setDeliveryPerson({
                                                                                UserId: updatedItem.Involved_Emp_Id,
                                                                                Name: updatedItem.Emp_Name,
                                                                            });
                                                                        } else if (
                                                                            deliveryPerson?.UserId ===
                                                                            updatedItem.Involved_Emp_Id
                                                                        ) {
                                                                            setDeliveryPerson(null);
                                                                        }

                                                                        return updatedItem;
                                                                    }
                                                                    return item;
                                                                });

                                                                return updatedList;
                                                            });
                                                        }}
                                                        options={costCenter
                                                            .filter(
                                                                (fil) =>
                                                                    staffInvolvedList.findIndex((st) =>
                                                                        isEqualNumber(
                                                                            st.Involved_Emp_Id,
                                                                            fil.Cost_Center_Id
                                                                        )
                                                                    ) === -1
                                                            )
                                                            .map((st) => ({
                                                                value: st.Cost_Center_Id,
                                                                label: st.Cost_Center_Name,
                                                            }))}
                                                        styles={customSelectStyles}
                                                        isSearchable
                                                        placeholder="Select Staff"
                                                    />
                                                </td>
                                                <td
                                                    className="fa-13 vctr p-0"
                                                    style={{ maxWidth: "130px", minWidth: "110px" }}
                                                >
                                                    <select
                                                        value={row?.Cost_Center_Type_Id}
                                                        onChange={(e) => handleCostCenterChange(e, index)}
                                                        className="cus-inpt p-2"
                                                    >
                                                        <option value="">Select</option>
                                                        {costCenterCategory.map((st, sti) => (
                                                            <option value={st?.Cost_Category_Id} key={sti}>
                                                                {st?.Cost_Category}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="fa-13 vctr text-center">
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => {
                                                            setStaffInvolvedList((prev) => {
                                                                const updatedList = prev.filter(
                                                                    (_, i) => i !== index
                                                                );

                                                                if (
                                                                    deliveryPerson?.UserId === row.Involved_Emp_Id
                                                                ) {
                                                                    setDeliveryPerson(null);
                                                                }

                                                                return updatedList;
                                                            });
                                                        }}
                                                    >
                                                        <Close />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Stock Journal Details */}
                        <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                            <div
                                className="border p-2"
                                style={{ minHeight: "30vh", height: "100%" }}
                            >
                                <div className="row">
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label>
                                            Branch <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <select
                                            value={tripSheetInfo.Branch_Id}
                                            onChange={(e) =>
                                                setTripSheetInfo({
                                                    ...tripSheetInfo,
                                                    Branch_Id: e.target.value,
                                                })
                                            }
                                            placeholder={"Select Branch"}
                                            className="cus-inpt mb-2 p-2"
                                        >
                                            <option value="" disabled>
                                                Select Branch
                                            </option>
                                            {branch.map((br, bi) => (
                                                <option key={bi} value={br.BranchId}>
                                                    {br.BranchName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label>Trip_Date</label>
                                        <input
                                            value={tripSheetInfo.Trip_Date}
                                            type="date"
                                            onChange={(e) =>
                                                setTripSheetInfo({
                                                    ...tripSheetInfo,
                                                    Trip_Date: e.target.value,
                                                })
                                            }
                                            className="cus-inpt p-2 mb-2"
                                        />
                                    </div>

                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label>Vehicle No</label>
                                        <input
                                            value={tripSheetInfo.Vehicle_No}
                                            onChange={(e) =>
                                                setTripSheetInfo({
                                                    ...tripSheetInfo,
                                                    Vehicle_No: e.target.value,
                                                })
                                            }
                                            className="cus-inpt p-2 mb-2"
                                        />
                                    </div>
                                    <div className="col-xl-3 col-md-6 col-sm-12 p-2">
                                        <label>
                                            Delivery Person <span style={{ color: "red" }}>*</span>
                                        </label>
                                        <input
                                            id="delivery-person"
                                            name="deliveryPerson"
                                            type="text"
                                            value={deliveryPerson ? deliveryPerson.Name : ""}
                                            readOnly
                                            className="form-control"
                                            placeholder="Delivery Person"
                                        />
                                    </div>
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label>Trip No</label>
                                        <input
                                            value={tripSheetInfo.Trip_No}
                                            onChange={(e) =>
                                                setTripSheetInfo({
                                                    ...tripSheetInfo,
                                                    Trip_No: e.target.value,
                                                })
                                            }
                                            className="cus-inpt p-2 mb-2"
                                        />
                                    </div>

                                    {/* <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label>Voucher Type</label>
                                        <select
                                            className="cus-inpt p-2 mb-2"
                                            value={tripSheetInfo?.VoucherType ?? ""}
                                            onChange={(e) =>
                                                setTripSheetInfo({
                                                    ...tripSheetInfo,
                                                    VoucherType: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">Select Voucher Type</option>
                                            <option value="0">SALES</option>
                                        </select>
                                    </div> */}
                                    {/* <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label>Bill Type</label>
                                        <select
                                            className="cus-inpt p-2 mb-2"
                                            value={tripSheetInfo?.BillType ?? ""}
                                            onChange={(e) =>
                                                setTripSheetInfo({
                                                    ...tripSheetInfo,
                                                    BillType: e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">Select Bill Type</option>
                                            <option value="SALES">SALES</option>
                                        </select>
                                    </div> */}
                                    <div className="col-xl-3 col-md-4 col-sm-6 p-2">
                                        <label>Trip Status</label>
                                        <select
                                            value={tripSheetInfo?.TripStatus || ""}
                                            onChange={(e) =>
                                                setTripSheetInfo((pre) => ({
                                                    ...pre,
                                                    TripStatus: e.target.value,
                                                }))
                                            }
                                            className="cus-inpt p-2"
                                        >
                                            <option value="">Select</option>
                                            <option value="New">New</option>
                                            <option value="OnProcess">OnProcess</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Canceled">Canceled</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="table-responsive">
                                    <table className="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th colSpan={2} className="fa-13 text-center">
                                                    Time
                                                </th>
                                                <th colSpan={2} className="fa-13 text-center">
                                                    Distance
                                                </th>
                                            </tr>
                                            <tr>
                                                <th className="fa-13 text-center">Start </th>
                                                <th className="fa-13 text-center">End</th>
                                                <th className="fa-13 text-center">Start (Km)</th>
                                                <th className="fa-13 text-center">End (Km)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="fa-13">
                                                    <input
                                                        type="time"
                                                        onChange={(e) =>
                                                            setTripSheetInfo((pre) => ({
                                                                ...pre,
                                                                StartTime: e.target.value,
                                                            }))
                                                        }
                                                        value={tripSheetInfo?.StartTime}
                                                        className="cus-inpt p-2"
                                                    />
                                                </td>
                                                <td className="fa-13">
                                                    <input
                                                        type="time"
                                                        onChange={(e) =>
                                                            setTripSheetInfo((pre) => ({
                                                                ...pre,
                                                                EndTime: e.target.value,
                                                            }))
                                                        }
                                                        value={tripSheetInfo?.EndTime}
                                                        className="cus-inpt p-2"
                                                    />
                                                </td>
                                                <td className="fa-13">
                                                    <input
                                                        type="number"
                                                        onChange={(e) =>
                                                            setTripSheetInfo((pre) => ({
                                                                ...pre,
                                                                Trip_ST_KM: e.target.value,
                                                                Trip_Tot_Kms: Subraction(
                                                                    pre.Trip_EN_KM ?? 0,
                                                                    e.target.value ?? 0
                                                                ),
                                                            }))
                                                        }
                                                        value={tripSheetInfo?.Trip_ST_KM}
                                                        min={0}
                                                        className="cus-inpt p-2"
                                                        placeholder="Kilometers"
                                                    />
                                                </td>
                                                <td className="fa-13">
                                                    <input
                                                        type="number"
                                                        onChange={(e) =>
                                                            setTripSheetInfo((pre) => ({
                                                                ...pre,
                                                                Trip_EN_KM: e.target.value,
                                                                Trip_Tot_Kms: Subraction(
                                                                    e.target.value ?? 0,
                                                                    pre.Trip_ST_KM ?? 0
                                                                ),
                                                            }))
                                                        }
                                                        value={tripSheetInfo?.Trip_EN_KM}
                                                        min={Addition(tripSheetInfo?.Trip_ST_KM, 1)}
                                                        className="cus-inpt p-2"
                                                        placeholder="Kilometers"
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end gap-3">
                        <h6 className="m-0 text-muted">
                            Total Bill Qty: {selectedItems?.reduce((acc, item) =>
                                acc + (item?.Products_List?.reduce((sum, product) =>
                                    sum + (parseFloat(product?.Bill_Qty) || 0), 0) || 0), 0)
                            }
                        </h6>
                        <h6 className="m-0 text-muted">Selected Sales Orders: {selectedItems.length}</h6>
                        <h6 className="m-0 text-muted">
                            Total Items: {selectedItems?.reduce((acc, item) => acc + (item.Products_List?.length || 0), 0)}
                        </h6>
                    </div>
   
                    <FilterableTable
                        dataArray={selectedItems?.map((item) => item?.Products_List).flat()}
                        expandableComp={ExpendableComponent}
                        ButtonArea={
                            <>
                                <Button
                                    onClick={() =>
                                        setFilters((prev) => ({ ...prev, addItemDialog: true }))
                                    }
                                >
                                    Add
                                </Button>
                                <Button onClick={() => setSelectedItems([])} className="me-2">
                                    Clear
                                </Button>
                            </>
                        }
                        EnableSerialNumber
                        disablePagination
                        maxHeightOption
                        columns={[
                            createCol("Do_Inv_No", "string", "Do_Inv_No"),
                            createCol("Retailer_Name", "string", "Retailer_Name"),
                            createCol("Transporter_Name", "string", "Transporter"),
                            createCol("Product_Name", "string", "Product_Name"),
                            createCol("Taxable_Rate", "number", "Rate"),
          
                            createCol("Bill_Qty", "number", "Bill_Qty"),
                            createCol("Taxable_Amount", "string", "Before_Tax_Amount"),
                            createCol("Amount", "number", "Total_Invoice_value"),
                            {
                                isVisible: 1,
                                ColumnHeader: "#",
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    <IconButton
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => {
                                            const filteredItems = selectedItems
                                                ?.map((item) => {
                                                    return {
                                                        ...item,
                                                        Products_List: item.Products_List.filter(
                                                            (o) =>
                                                                o[row.DO_St_Id ? "DO_St_Id" : "SO_St_Id"] !==
                                                                row[row.DO_St_Id ? "DO_St_Id" : "SO_St_Id"]
                                                        ),
                                                    };
                                                })
                                                .filter((item) => item.Products_List.length > 0);

                                            setSelectedItems(filteredItems);
                                        }}
                                    >
                                        <Delete className="fa-20" />
                                    </IconButton>
                                ),
                            },
                        ]}
                    />
                </CardContent>
                <div className="border-top p-2 text-end">
                    <Button
                        variant="outlined"
                        onClick={saveTripSheet}
                        disabled={
                            selectedItems.length === 0 ||
                            !isValidDate(tripSheetInfo.Trip_Date)
                        }
                    >
                        Save
                    </Button>
                </div>
            </Card>

            <Dialog
                open={filters.addItemDialog}
                onClose={() => setFilters((pre) => ({ ...pre, addItemDialog: false }))}
                maxWidth="lg"
                fullWidth
                fullScreen
            >
                <form onSubmit={searchTransaction}>
                    <DialogTitle className="d-flex align-items-center">
                        <span className="flex-grow-1">Add Data</span>
                        <Button
                            variant="outlined"
                            type="submit"
                            className="me-2"
                            startIcon={<Search />}
                        >
                            Search
                        </Button>
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                                setFilters((pre) => ({ ...pre, addItemDialog: false }))
                            }
                        >
                            <Close />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent>
                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <tbody>
                                    <tr>
                                        <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">From Date</td>
                                        <td>
                                            <input
                                                type="date"
                                                value={filters.Fromdate}
                                                className="cus-inpt p-2"
                                                required
                                                max={filters.Todate}
                                                onChange={(e) =>
                                                    setFilters((pre) => ({
                                                        ...pre,
                                                        Fromdate: e.target.value,
                                                    }))
                                                }
                                                style={{ width: "100%" }}
                                            />
                                        </td>

                                        <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">To Date</td>
                                        <td>
                                            <input
                                                type="date"
                                                value={filters.Todate}
                                                className="cus-inpt p-2"
                                                min={filters.Fromdate}
                                                required
                                                onChange={(e) =>
                                                    setFilters((pre) => ({
                                                        ...pre,
                                                        Todate: e.target.value,
                                                    }))
                                                }
                                                style={{ width: "100%" }}
                                            />
                                        </td>

                                        <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Sales Person</td>
                                        <td>
                                            <Select
                                                value={{
                                                    value: filters?.Sales_Person_Id,
                                                    label: filters?.Sales_Person_Name || "ALL"
                                                }}
                                                onChange={(e) => {
                                                    setFilters({
                                                        ...filters,
                                                        Sales_Person_Id: e.value,
                                                        Sales_Person_Name: e.label,
                                                    });
                                                }}
                                                options={[
                                                    { value: "", label: "ALL" },
                                                    ...salesPerson.map((obj) => ({
                                                        value: obj?.UserId,
                                                        label: obj?.Name,
                                                    })),
                                                ]}
                                                placeholder={"Select Sales Person"}
                                                styles={{
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                isSearchable={true}
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                menuPlacement="auto"
                                            />
                                        </td>

                                        <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Voucher Type</td>
                                        <td>
                                            <MultiSelect
                                                value={(filters.VoucherType || []).map(val => ({
                                                    value: val,
                                                    label: voucherTypeOptions.find(opt => opt.value === val)?.label || val
                                                }))}
                                                onChange={(selectedOptions) =>
                                                    setFilters({
                                                        ...filters,
                                                        VoucherType: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
                                                    })
                                                }
                                                options={voucherTypeOptions}
                                                placeholder={"Select Voucher Types"}
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Branch</td>
                                        <td>
                                            <Select
                                                value={{
                                                    value: filters?.Branch,
                                                    label: filters?.BranchName || "ALL"
                                                }}
                                                onChange={(e) =>
                                                    setFilters({
                                                        ...filters,
                                                        Branch: e.value,
                                                        BranchName: e.label,
                                                    })
                                                }
                                                options={[
                                                    { value: "", label: "ALL" },
                                                    ...branch.map((option) => ({
                                                        value: option.BranchId,
                                                        label: option.BranchName,
                                                    })),
                                                ]}
                                                placeholder={"Select Branch"}
                                                styles={{
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                isSearchable={true}
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                menuPlacement="auto"
                                            />
                                        </td>

                                        <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Broker</td>
                                        <td>
                                            <MultiSelect
                                                value={(filters.Broker || []).map(val => ({
                                                    value: val,
                                                    label: broker.find(b => b.Cost_Center_Id === val)?.Cost_Center_Name || val
                                                }))}
                                                onChange={(selectedOptions) =>
                                                    setFilters({
                                                        ...filters,
                                                        Broker: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
                                                    })
                                                }
                                                options={broker.map(option => ({
                                                    value: option.Cost_Center_Id,
                                                    label: option.Cost_Center_Name,
                                                }))}
                                                placeholder={"Select Brokers"}
                                            />
                                        </td>

                                        <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Transporter</td>
                                        <td>
                                            <MultiSelect
                                                value={(filters.Transporters || []).map(val => ({
                                                    value: val,
                                                    label: transporters.find(t => t.Cost_Center_Id === val)?.Cost_Center_Name || val
                                                }))}
                                                onChange={(selectedOptions) =>
                                                    setFilters({
                                                        ...filters,
                                                        Transporters: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
                                                    })
                                                }
                                                options={transporters.map(option => ({
                                                    value: option.Cost_Center_Id,
                                                    label: option.Cost_Center_Name,
                                                }))}
                                                placeholder={"Select Transporters"}
                                            />
                                        </td>

                                        <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Godown</td>
                                        <td>
                                            <Select
                                                value={{
                                                    value: filters?.Godown,
                                                    label: filters?.GodownName || "ALL"
                                                }}
                                                onChange={(e) =>
                                                    setFilters({
                                                        ...filters,
                                                        Godown: e.value,
                                                        GodownName: e.label,
                                                    })
                                                }
                                                options={[
                                                    { value: "", label: "ALL" },
                                                    ...godowns.map((option) => ({
                                                        value: option.Godown_Id,
                                                        label: option.Godown_Name,
                                                    })),
                                                ]}
                                                placeholder={"Select Godown"}
                                                styles={{
                                                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                                }}
                                                isSearchable={true}
                                                menuPortalTarget={document.body}
                                                menuPosition="fixed"
                                                menuPlacement="auto"
                                            />
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Retailers</td>
                                        <td >
                                            <MultiSelect
                                                value={(filters.Retailer || []).map(val => ({
                                                    value: val,
                                                    label: retailers.find(r => r.Retailer_Id === val)?.Retailer_Name || val
                                                }))}
                                                onChange={(selectedOptions) =>
                                                    setFilters({
                                                        ...filters,
                                                        Retailer: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
                                                    })
                                                }
                                                options={retailers.map(option => ({
                                                    value: option.Retailer_Id,
                                                    label: option.Retailer_Name,
                                                }))}
                                                placeholder={"Select Retailers"}
                                            />
                                        </td>

                                        <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Products</td>
                                        <td >
                                            <MultiSelect
                                                value={(filters.Item || []).map(val => ({
                                                    value: val,
                                                    label: items.find(i => i.Product_Id === val)?.Product_Name || val
                                                }))}
                                                onChange={(selectedOptions) =>
                                                    setFilters({
                                                        ...filters,
                                                        Item: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
                                                    })
                                                }
                                                options={items.map(option => ({
                                                    value: option.Product_Id,
                                                    label: option.Product_Name,
                                                }))}
                                                placeholder={"Select Products"}
                                            />
                                        </td>
                                              <td style={{ verticalAlign: "middle" }} className="fa-13 fw-bold">Loadman</td>
                                        <td>
                                            <MultiSelect
                                                value={(filters.loadman || []).map(val => ({
                                                    value: val,
                                                    label: loadman.find(t => t.Cost_Center_Id === val)?.Cost_Center_Name || val
                                                }))}
                                                onChange={(selectedOptions) =>
                                                    setFilters({
                                                        ...filters,
                                                        loadman: selectedOptions ? selectedOptions.map(opt => opt.value) : [],
                                                    })
                                                }
                                                options={loadman.map(option => ({
                                                    value: option.Cost_Center_Id,
                                                    label: option.Cost_Center_Name,
                                                }))}
                                                placeholder={"Select Loadman"}
                                            />
                                        </td>

                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <Button
                                    variant="outlined"
                                    onClick={handleSelectAllOrders}
                                    disabled={transactionData.length === 0}
                                >
                                    {selectedItems.length === transactionData.length
                                        ? "Unselect All Orders"
                                        : "Select All Orders"}
                                </Button>

                                <Button
                                    variant="outlined"
                                    onClick={handleSelectAllStaffFromResults}
                                    disabled={transactionData.length === 0}
                                    className="ms-2"
                                >
                                    Add All Staff from Results
                                </Button>
                            </div>

                            <div className="d-flex justify-content-end gap-3">
                                <h6 className="m-0 text-muted">
                                    Orders: {selectedItems.length}/{transactionData.length}
                                </h6>
                                <h6 className="m-0 text-muted">
                                    Unique Staff: {getDistinctStaffCount()}
                                </h6>
                            </div>
                        </div>

                        <FilterableTable
                            dataArray={transactionData}
                            disablePagination
                            maxHeightOption
                            columns={[
                                {
                                    Field_Name: "checkbox",
                                    ColumnHeader: "",
                                    isVisible: 1,
                                    pointer: true,
                                    isCustomCell: true,
                                    Cell: ({ row }) => {
                                        return (
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.some(
                                                    (selectedRow) => selectedRow.Do_Id === row.Do_Id
                                                )}
                                                onChange={() => handleCheckboxChange(row)}
                                                onFocus={(e) => {
                                                    e.target.blur();
                                                }}
                                                style={{
                                                    cursor: "pointer",
                                                    transform: "scale(1.5)",
                                                    width: "14px",
                                                    height: "20px",
                                                }}
                                            />
                                        );
                                    },
                                },
                                 createCol("Do_Inv_No", "string", "Do_Inv_No"),
                                createCol("Retailer_Name", "string", "Retailer_Name"),
                                createCol("Branch_Name", "string", "Branch_Name"),
                                createCol("AreaName", "string", "AreaName"),
                                 createCol("Transporter_Name", "string", "Transporter_Name"),
                                createCol("Do_Date", "date", "Do_Date"),
                                createCol("Total_Before_Tax", "string", "Total_Before_Tax"),
                                createCol("Total_Tax", "number", "Total_Tax"),
                                createCol("Total_Invoice_value", "number", "Total_Invoice_value"),
                            ]}
                        />
                    </DialogContent>

                    <DialogActions>
                        <Button
                            type="button"
                            onClick={() =>
                                setFilters((pre) => ({ ...pre, addItemDialog: false }))
                            }
                        >
                            close
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
};

export default TripSheetGodownSearch;