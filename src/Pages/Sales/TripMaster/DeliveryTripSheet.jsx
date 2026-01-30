// import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
// import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
// import { useNavigate, useLocation } from "react-router-dom";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { ISOString, isValidDate, LocalDate, LocalTime, NumberFormat, numberToWords, Subraction, timeDuration } from "../../../Components/functions";
// import { Download, Edit, FilterAlt, Search, Visibility } from "@mui/icons-material";
// import { fetchLink } from "../../../Components/fetchComponent";
// import { useReactToPrint } from 'react-to-print';
// import Select from 'react-select';
// import { customSelectStyles } from "../../../Components/tablecolumn";
// import { toast } from 'react-toastify'
// const useQuery = () => new URLSearchParams(useLocation().search);
// const defaultFilters = {
//     Fromdate: ISOString(),
//     Todate: ISOString(),
// };

// const TripSheets = ({ loadingOn, loadingOff }) => {

//     const nav = useNavigate();
//     const location = useLocation();
//     const query = useQuery();
//     const [tripData, setTripData] = useState([]);
//     const [filters, setFilters] = useState({
//         Fromdate: defaultFilters.Fromdate,
//         Todate: defaultFilters.Todate,
//         fetchFrom: defaultFilters.Fromdate,
//         fetchTo: defaultFilters.Todate,
//         filterDialog: false,
//         refresh: false,
//         printPreviewDialog: false,
//         shortPreviewDialog: false,
//         ItemPreviewDialog:false,
//         FromGodown: [],
//         ToGodown: [],
//         Staffs: [],
//         Items: []
//     });
//     const [selectedRow, setSelectedRow] = useState([]);
//     const [deleteDialog, setDeleteDialog] = useState(false);
//     const [selectedId, setSelectedId] = useState(null);
//     const [reload, setReload] = useState(false)
//     const printRef = useRef(null);
//     const itemPreviewPrintRef = useRef(null); 


//     useEffect(() => {
//         if (loadingOn) loadingOn();

//         fetchLink({
//             address: `delivery/deliveryTripSheet?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}`,
//         }).then(data => {
//             if (data.success) {

//                 setTripData(data.data);
//             }
//         }).finally(() => {
//             if (loadingOff) loadingOff();
//         }).catch(e => console.error(e))
//     }, [filters?.fetchFrom, filters?.fetchTo, reload]);

//     const handleDeleteConfirm = async () => {

//         fetchLink({
//             address: `delivery/tripDetails`,
//             method: "DELETE",
//             bodyData: { Trip_Id: selectedId },
//         }).then((data) => {
//             if (data.success) {
//                 setReload(!reload);
//                 setDeleteDialog(false);
//                 toast.success("Trip deleted successfully!");
//             } else {
//                 toast.error("Failed to delete area:");
//             }
//         }).catch(e => console.error(e));
//     };

//     useEffect(() => {
//         const queryFilters = {
//             Fromdate: query.get("Fromdate") && isValidDate(query.get("Fromdate"))
//                 ? query.get("Fromdate")
//                 : defaultFilters.Fromdate,
//             Todate: query.get("Todate") && isValidDate(query.get("Todate"))
//                 ? query.get("Todate")
//                 : defaultFilters.Todate,
//         };
//         setFilters(pre => ({ ...pre, fetchFrom: queryFilters.Fromdate, fetchTo: queryFilters.Todate }));
//     }, [location.search]);

//     const updateQueryString = (newFilters) => {
//         const params = new URLSearchParams(newFilters);
//         nav(`?${params.toString()}`, { replace: true });
//     };

//     const closeDialog = () => {
//         setFilters({
//             ...filters,
//             filterDialog: false,
//         });
//     }

//     const allProducts = (selectedRow?.Product_Array || []).flatMap(product => product.Products_List || []);

//     const TaxData = allProducts.reduce((data, item) => {
//         const HSNindex = data.findIndex(obj => obj.hsnCode === item.HSN_Code);

//         const {
//             HSN_Code,
//             Taxable_Amount = 0,
//             Igst_Amo = 0,
//             Cgst_Amo = 0,
//             Sgst_Amo = 0
//         } = item;

//         const Total_Tax = Igst_Amo + Cgst_Amo + Sgst_Amo;

//         if (HSNindex !== -1) {

//             data[HSNindex] = {
//                 ...data[HSNindex],
//                 taxableValue: data[HSNindex].taxableValue + Taxable_Amount,
//                 igst: data[HSNindex].igst + Igst_Amo,
//                 cgst: data[HSNindex].cgst + Cgst_Amo,
//                 sgst: data[HSNindex].sgst + Sgst_Amo,
//                 totalBeforeTax: data[HSNindex].totalBeforeTax + Taxable_Amount,
//                 totalTax: data[HSNindex].totalTax + Total_Tax
//             };
//         } else {
//             data.push({
//                 hsnCode: HSN_Code,
//                 taxableValue: Taxable_Amount,
//                 igst: Igst_Amo,
//                 cgst: Cgst_Amo,
//                 sgst: Sgst_Amo,
//                 totalBeforeTax: Taxable_Amount,
//                 totalTax: Total_Tax
//             });
//         }

//         return data;
//     }, []);

//    const handlePrint = useReactToPrint({
//     content: () => printRef.current,
//     onPrintError: (error) => {
//         console.error('Print error:', error);
//         toast.error('Failed to print document');
//     }
// });


//     const uniqueStaffs = useMemo(() => {
//         const allStaffs = tripData.flatMap((trip) =>
//             trip.Employees_Involved.map((staff) => staff.Emp_Name)
//         );
//         return [...new Set(allStaffs)].map((name) => ({
//             value: name,
//             label: name,
//         }));
//     }, [tripData]);

//     const filteredData = useMemo(() => {
//         return tripData.filter(trip => {
//             const hasFromGodownMatch = filters.FromGodown.length > 0
//                 ? trip.Product_Array.some(product =>
//                     filters.FromGodown.some(selected => selected.value === product.FromLocation)
//                 )
//                 : false;

//             const hasToGodownMatch = filters.ToGodown.length > 0
//                 ? trip.Product_Array.some(product =>
//                     filters.ToGodown.some(selected => selected.value === product.ToLocation)
//                 )
//                 : false;

//             const hasItemMatch = filters.Items.length > 0
//                 ? trip.Product_Array.some(product =>
//                     filters.Items.some(selected => selected.value === product.Product_Name)
//                 )
//                 : false;

//             const hasEmployeeMatch = filters.Staffs.length > 0
//                 ? trip.Employees_Involved.some(staff =>
//                     filters.Staffs.some(selected => selected.value === staff.Emp_Name)
//                 )
//                 : false;

//             return hasFromGodownMatch || hasToGodownMatch || hasItemMatch || hasEmployeeMatch;
//         });
//     }, [tripData, filters]);

//     const flattenProductsList = (productArray) => {
//         if (!Array.isArray(productArray)) return [];

//         return productArray.flatMap((product) =>
//             Array.isArray(product.Products_List)
//                 ? product.Products_List
//                     .map((item) => ({
//                         ...item,
//                         Reason: product.Reason || "Delivery",
//                     }))
//                     .filter(item => Object.keys(item).length > 1)
//                 : []
//         ).filter(row => row && Object.keys(row).length > 1);
//     };


//     const closeDeleteDialog = () => {
//         setDeleteDialog(false);
//         setSelectedId(null);
//     };

//     const openDeleteDialog = (id) => {
//         setSelectedId(id);
//         setDeleteDialog(true);
//     };
//     const handleItemPreviewPrint = useReactToPrint({
//     content: () => {
//         if (!itemPreviewPrintRef.current) {
//             toast.error('No content available to print');
//             return null;
//         }
//         return itemPreviewPrintRef.current;
//     },
//     onPrintError: (error) => {
//         console.error('Print error:', error);
//         toast.error('Failed to print document');
//     }
// });


//     return (
//         <>

//             <FilterableTable
//                 dataArray={(
//                     filters.FromGodown.length > 0 ||
//                     filters.ToGodown.length > 0 ||
//                     filters.Staffs.length > 0
//                 ) ? filteredData : tripData}
//                 title="Trip Sheets"
//                 maxHeightOption
//                 ExcelPrintOption
//                 ButtonArea={
//                     <>
//                         <Button
//                             variant="outlined"
//                             onClick={() => nav('/erp/sales/Tripsheet/Tripsheetcreation')}
//                         >Add</Button>
//                         <Tooltip title='Filters'>
//                             <IconButton
//                                 size="small"
//                                 onClick={() => setFilters({ ...filters, filterDialog: true })}
//                             ><FilterAlt /></IconButton>
//                         </Tooltip>
//                     </>
//                 }
//                 EnableSerialNumber

//                 initialPageCount={10}
//                 columns={[
//                     createCol('Trip_Date', 'date', 'Date'),
//                     createCol('Trip_No', 'string'),
//                     createCol('Challan_No', 'string', 'Challan'),
//                     createCol('Vehicle_No', 'string', 'Vehicle'),
//                     createCol('StartTime', 'time', 'Start Time'),
//                     createCol('EndTime', 'time', 'End Time'),
//                     {
//                         isVisible: 1,
//                         ColumnHeader: 'Time Taken',
//                         isCustomCell: true,
//                         Cell: ({ row }) => {
//                             const startTime = row?.StartTime ? new Date(row.StartTime) : '';
//                             const endTime = row.EndTime ? new Date(row.EndTime) : '';
//                             const timeTaken = (startTime && endTime) ? timeDuration(startTime, endTime) : '00:00';
//                             return (
//                                 <span className="cus-badge bg-light">{timeTaken}</span>
//                             )
//                         }
//                     },
//                     {
//                         isVisible: 1,
//                         ColumnHeader: 'Distance',
//                         isCustomCell: true,
//                         Cell: ({ row }) => NumberFormat(Subraction(row?.Trip_EN_KM, row?.Trip_ST_KM))
//                     },
//                     {
//                         isVisible: 1,
//                         ColumnHeader: 'Total Qty',
//                         isCustomCell: true,
//                         Cell: ({ row }) => {

//                             const totalQty = row?.Product_Array?.reduce((sum, product) => {

//                                 const productQty = product?.Products_List?.reduce((productSum, item) => {
//                                     return productSum + (item.Bill_Qty || 0);
//                                 }, 0);
//                                 return sum + productQty;
//                             }, 0);


//                             return <span>{totalQty}</span>;
//                         },
//                     },

//                     {
//                         isVisible: 1,
//                         ColumnHeader: 'Total Item',
//                         isCustomCell: true,
//                         Cell: ({ row }) => {

//                             const totalQty = row?.Product_Array?.reduce((sum, product) => {

//                                 const productQty = product?.Products_List?.reduce((productSum, item) => {
//                                     return productSum + 1;
//                                 }, 0);
//                                 return sum + productQty;
//                             }, 0);


//                             return <span>{totalQty}</span>;
//                         },
//                     },

//                     {
//                         isVisible: 1,
//                         ColumnHeader: 'Action',
//                         isCustomCell: true,
//                         Cell: ({ row }) => (
//                             <ButtonActions
//                                 buttonsData={[
//                                     {
//                                         name: 'Delete',
//                                         icon: <Visibility className="fa-14" />,
//                                         onclick: () => {
//                                             openDeleteDialog(true)

//                                             setSelectedId(row?.Trip_Id)
//                                         }
//                                     },
//                                     {
//                                         name: 'Edit',
//                                         icon: <Edit className="fa-14" />,

//                                         onclick: () => nav('/erp/sales/Tripsheet/Tripsheetcreation', {

//                                             state: {
//                                                 ...row,
//                                                 isEditable: false,

//                                             },
//                                         }),

//                                     },
//                                     {
//                                         name: 'Item Short Preview',
//                                         icon:<Visibility className="fa-14"/>,
//                                         onclick:()=>{
//                                             setFilters(pre=>({ ...pre,ItemPreviewDialog:true}));
//                                             setSelectedRow(row);
//                                         }
//                                     },
//                                     {
//                                         name: 'Short Preview',
//                                         icon: <Visibility className="fa-14" />,
//                                         onclick: () => {
//                                             setFilters(pre => ({ ...pre, shortPreviewDialog: true }));

//                                             setSelectedRow(row);
//                                         }
//                                     },
//                                     {
//                                         name: 'Preview',
//                                         icon: <Visibility className="fa-14" />,
//                                         onclick: () => {
//                                             setFilters(pre => ({ ...pre, printPreviewDialog: true }));
//                                             setSelectedRow(row);
//                                         }
//                                     },
//                                 ]}
//                             />
//                         )
//                     }
//                 ]}
//                 isExpendable={true}
//                 expandableComp={({ row }) => (
//                     <>
//                         {row?.Employees_Involved?.length > 0 && (
//                             <table className="fa-14">
//                                 <tbody>
//                                     <tr>
//                                         <th className="py-1 px-2 border text-muted" colSpan={3}>Involved Employees</th>
//                                     </tr>
//                                     <tr>
//                                         <th className="py-1 px-2 border text-muted">SNo</th>
//                                         <th className="py-1 px-2 border text-muted">Name</th>
//                                         <th className="py-1 px-2 border text-muted">Role</th>
//                                     </tr>
//                                     {row.Employees_Involved.map((o, i) => (
//                                         <tr key={i}>
//                                             <td className="py-1 px-2 border">{i + 1}</td>
//                                             <td className="py-1 px-2 border">{o?.Emp_Name}</td>
//                                             <td className="py-1 px-2 border">{o?.Cost_Category}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         )}



//                         <FilterableTable
//                             title="Items"
//                             EnableSerialNumber
//                             dataArray={
//                                 Array.isArray(row?.Product_Array)
//                                     ? flattenProductsList(row?.Product_Array).filter(row => Object.keys(row).length > 1)
//                                     : []
//                             }
//                             columns={[
//                                 {
//                                     isVisible: 1,
//                                     ColumnHeader: 'Reason',
//                                     isCustomCell: true,
//                                     Cell: ({ row }) => row.Reason ?? 'Delivery',
//                                 },
//                                 createCol('Product_Name', 'string', 'Product_Name'),
//                                 createCol('HSN_Code', 'string'),
//                                 createCol('Taxable_Rate', 'number', 'Taxable_Rate'),
//                                 createCol('Taxable_Amount', 'number', 'Tax_Before_Amount'),
//                                 {
//                                     isVisible: 1,
//                                     ColumnHeader: 'Tax',
//                                     isCustomCell: true,
//                                     Cell: ({ row }) => {
//                                         const cgstP = Number(row.Cgst_Amo) || 0;
//                                         const sgstP = Number(row.Sgst_Amo) || 0;
//                                         const taxValue = cgstP + sgstP;
//                                         return taxValue.toFixed(2);
//                                     },
//                                 },
//                                 createCol('Final_Amo', 'number', 'Final_Amo'),

//                                 {
//                                     isVisible: 1,
//                                     ColumnHeader: 'Round off',
//                                     isCustomCell: true,
//                                     Cell: ({ row }) => {
//                                         const total = Number(row.Total_Value) || 0;
//                                         const integerPart = Math.floor(total);
//                                         const decimalPart = total - integerPart;

//                                         let roundedTotal = integerPart;
//                                         let roundOffDiff = 0;

//                                         if (decimalPart >= 0.56 && decimalPart <= 0.99) {
//                                             roundedTotal = integerPart + 1;
//                                         } else if (decimalPart >= 0.05 && decimalPart <= 0.55) {
//                                             roundedTotal = integerPart;
//                                         } else if (decimalPart >= 0.00 && decimalPart <= 0.04) {
//                                             roundedTotal = integerPart;
//                                         }

//                                         roundOffDiff = (roundedTotal - total).toFixed(2);
//                                         return roundOffDiff > 0 ? `+${roundOffDiff}` : roundOffDiff;
//                                     },
//                                 },
//                                 createCol('Branch', 'string', 'From'),
//                                 createCol('Retailer_Name', 'string', 'To'),
//                             ]}
//                             disablePagination
//                             ExcelPrintOption
//                         />


//                     </>
//                 )}
//             />

//             <Dialog
//                 open={filters.filterDialog}
//                 onClose={closeDialog}
//                 fullWidth maxWidth='md'
//             >
//                 <DialogTitle>Filters</DialogTitle>
//                 <DialogContent>
//                     <div className="table-responsive pb-4">
//                         <table className="table">
//                             <tbody>

//                                 <tr>
//                                     <td style={{ verticalAlign: 'middle' }}>From</td>
//                                     <td>
//                                         <input
//                                             type="date"
//                                             value={filters.Fromdate}
//                                             onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
//                                             className="cus-inpt"
//                                         />
//                                     </td>
//                                     <td style={{ verticalAlign: 'middle' }}>To</td>
//                                     <td>
//                                         <input
//                                             type="date"
//                                             value={filters.Todate}
//                                             onChange={e => setFilters({ ...filters, Todate: e.target.value })}
//                                             className="cus-inpt"
//                                         />
//                                     </td>
//                                 </tr>

//                                 <tr>
//                                     <td style={{ verticalAlign: 'middle' }}>Staffs</td>
//                                     <td colSpan={3}>
//                                         <Select
//                                             value={filters.Staffs}
//                                             onChange={(selectedOptions) =>
//                                                 setFilters((prev) => ({ ...prev, Staffs: selectedOptions }))
//                                             }
//                                             menuPortalTarget={document.body}
//                                             options={uniqueStaffs}
//                                             isMulti
//                                             styles={customSelectStyles}
//                                             isSearchable={true}
//                                             placeholder={"Select Staff"}
//                                             maxMenuHeight={300}
//                                         />
//                                     </td>
//                                 </tr>

//                                 {/* <tr>
//                                     <td style={{ verticalAlign: 'middle' }}>Items</td>
//                                     <td colSpan={3}>
//                                         <Select
//                                             value={filters.Items}
//                                             onChange={(selectedOptions) =>
//                                                 setFilters((prev) => ({ ...prev, Items: selectedOptions }))
//                                             }
//                                             menuPortalTarget={document.body}
//                                             options={uniqueItems}
//                                             isMulti
//                                             styles={customSelectStyles}
//                                             isSearchable={true}
//                                             placeholder={"Select Items"}
//                                             maxMenuHeight={300}
//                                         />
//                                     </td>
//                                 </tr> */}


//                             </tbody>
//                         </table>
//                     </div>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={closeDialog}>close</Button>
//                     <Button
//                         onClick={() => {
//                             const updatedFilters = {
//                                 Fromdate: filters?.Fromdate,
//                                 Todate: filters?.Todate
//                             };
//                             updateQueryString(updatedFilters);
//                             closeDialog();
//                         }}
//                         startIcon={<Search />}
//                         variant="outlined"
//                     >Search</Button>
//                 </DialogActions>
//             </Dialog>

//             <Dialog
//                 open={filters.shortPreviewDialog}
//                 onClose={() => setFilters(pre => ({ ...pre, shortPreviewDialog: false }))}
//                 maxWidth="xl"
//                 fullWidth
//             >
//                 <DialogTitle>Print Preview</DialogTitle>
//                 <DialogContent ref={printRef}>
//                     {selectedRow?.Product_Array && (
//                         <React.Fragment>
//                             <table className="table table-bordered">
//                                 <thead>
//                                     <tr>
//                                         <th className="fa-12 bg-light">Retailer Name</th>
//                                         <th className="fa-12 bg-light">Do_Date</th>
//                                         <th className="fa-12 bg-light">Delivery_Person</th>
//                                         <th className="fa-12 bg-light">Amount</th>
//                                     </tr>
//                                 </thead>

//                                 <tbody>
//                                     {selectedRow.Product_Array.length > 0 ? (
//                                         <>
//                                             {selectedRow.Product_Array.map((group, idx) => {
//                                                 const totalAmount = group.Products_List.reduce(
//                                                     (sum, product) => sum + product.Final_Amo,
//                                                     0
//                                                 );


//                                                 const deliveryDetail = selectedRow.Trip_Details.find(
//                                                     (detail) => detail.Do_Id === group.Do_Id
//                                                 );

//                                                 return (
//                                                     <tr key={idx}>
//                                                         <td className="fw-bold">{group.Retailer_Name}</td>
//                                                         <td className="fw-bold text-end">{group.Product_Do_Date}</td>
//                                                         <td className="fw-bold text-end">{deliveryDetail?.Name || "N/A"}</td>
//                                                         <td className="fw-bold text-end">{NumberFormat(totalAmount)}</td>
//                                                     </tr>
//                                                 );
//                                             })}

//                                             <tr>
//                                                 <td className="fw-bold text-end" colSpan={3}>Total:</td>
//                                                 <td className="fw-bold text-end">
//                                                     {NumberFormat(
//                                                         selectedRow.Product_Array.reduce(
//                                                             (acc, group) => acc +
//                                                                 group.Products_List.reduce(
//                                                                     (sum, product) => sum + product.Final_Amo,
//                                                                     0
//                                                                 ),
//                                                             0
//                                                         )
//                                                     )}
//                                                 </td>
//                                             </tr>
//                                         </>
//                                     ) : (
//                                         <tr>
//                                             <td colSpan="5" className="text-center">No data available</td>
//                                         </tr>
//                                     )}
//                                 </tbody>
//                             </table>
//                         </React.Fragment>
//                     )}
//                 </DialogContent>
//                 <DialogActions>
//                     <Button
//                         onClick={() => setFilters(pre => ({ ...pre, shortPreviewDialog: false }))}
//                         variant="outlined"
//                     >
//                         Close
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             <Dialog
//                 open={filters.printPreviewDialog}
//                 onClose={() => setFilters(pre => ({ ...pre, printPreviewDialog: false }))}
//                 maxWidth="xl"
//                 fullWidth
//             >
//                 <DialogTitle>Print Preview</DialogTitle>
//                 <DialogContent ref={printRef}>
//                     {selectedRow?.Product_Array && (
//                         <React.Fragment>
//                             <table className="table table-bordered fa-13 m-0">
//                                 <tbody>
//                                     <tr>
//                                         <td colSpan={3}>DELIVERY CHALLAN</td>
//                                         <td colSpan={3}>GSTIN :33AAOCP0807F1ZN</td>
//                                         <td colSpan={2}>ORIGINAL / DUPLICATE</td>
//                                     </tr>
//                                     <tr>
//                                         <td colSpan={3} rowSpan={2}>
//                                             <span className="fa-14 fw-bold">PUKAL FOODS PRIVATE LIMITED</span> <br />
//                                             6A, First Floor, North, Viswanadha puram, Main road,<br />
//                                             Reserve Line, Viswanathapuram, Madurai, Tamil Nadu 625014
//                                         </td>
//                                         <td colSpan={3}>FSSAI No :</td>
//                                         <td>Challan No</td>
//                                         <td>{selectedRow?.Challan_No}</td>
//                                     </tr>
//                                     <tr>
//                                         <td colSpan={3}>Phone No: 9842131353, 9786131353</td>
//                                         <td>Date</td>
//                                         <td>{selectedRow.Trip_Date ? LocalDate(selectedRow.Trip_Date) : ''}</td>
//                                     </tr>
//                                     <tr>
//                                         <td colSpan={8} className="text-center">Reason for Transfer - Branch Transfer / Line Sales / Purchase Return / Job Work</td>
//                                     </tr>
//                                     <tr>
//                                         <td>Vehicle No</td>
//                                         <td>{selectedRow?.Vehicle_No}</td>
//                                         <td>Delivery Person </td>
//                                         <td>
//                                             {selectedRow?.Employees_Involved?.filter(staff => (
//                                                 staff?.Cost_Category === 'Delivery Man'
//                                             ))?.map(staff => staff?.Emp_Name).join(', ')}
//                                         </td>
//                                         <td>Start Time</td>
//                                         <td>{selectedRow?.StartTime ? LocalTime(new Date(selectedRow.StartTime)) : ''}</td>
//                                         <td>Start KM</td>
//                                         <td>{selectedRow?.Trip_ST_KM}</td>
//                                     </tr>
//                                     <tr>
//                                         <td>Trip No</td>
//                                         <td>{selectedRow?.Trip_No}</td>
//                                         <td>LoadMan</td>
//                                         <td>
//                                             {selectedRow?.Employees_Involved?.filter(staff => (
//                                                 staff?.Cost_Category === 'Load Man'
//                                             ))?.map(staff => staff?.Emp_Name).join(', ')}
//                                         </td>
//                                         <td>End Time</td>
//                                         <td>{selectedRow?.EndTime ? LocalTime(new Date(selectedRow.EndTime)) : ''}</td>
//                                         <td>End KM</td>
//                                         <td>{selectedRow?.Trip_EN_KM}</td>
//                                     </tr>
//                                 </tbody>
//                             </table>

//                             {/* items */}
//                             <table className="table table-bordered">
//                                 <thead>
//                                     <tr>
//                                         <th className="fa-12 bg-light">#</th>
//                                         <th className="fa-12 bg-light">Reason</th>
//                                         <th className="fa-12 bg-light">Party</th>
//                                         <th className="fa-12 bg-light">Address</th>
//                                         <th className="fa-12 bg-light">Item</th>
//                                         <th className="fa-12 bg-light">HSN</th>
//                                         <th className="fa-12 bg-light">Qty</th>
//                                         <th className="fa-12 bg-light">KGS</th>
//                                         <th className="fa-12 bg-light">Rate</th>
//                                         <th className="fa-12 bg-light">Amount</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>

//                                     {selectedRow?.Product_Array?.map((product, productIndex) => (
//                                         (product?.Products_List || []).map((item, index) => (
//                                             <tr key={`${productIndex}-${index}`}>
//                                                 <td className="fa-10">{index + 1}</td>
//                                                 <td className="fa-10">{item.Reason || "Delivery"}</td>
//                                                 <td className="fa-10">{item?.Retailer_Name}</td>
//                                                 <td className="fa-10">{item?.Retailer_Address}</td>
//                                                 <td className="fa-10">{item?.Product_Name}</td>
//                                                 <td className="fa-10">{item?.HSN_Code}</td>
//                                                 <td className="fa-10">{NumberFormat(item?.Bill_Qty)}</td>
//                                                 <td className="fa-10">{NumberFormat(item?.KGS || 0)}</td>
//                                                 <td className="fa-10">{NumberFormat(item?.Taxable_Rate)}</td>
//                                                 <td className="fa-10">{NumberFormat(item?.Taxable_Rate * item?.Bill_Qty)}</td>
//                                             </tr>
//                                         ))
//                                     ))}
//                                 </tbody>
//                             </table>

//                             <table className="table table-bordered">
//                                 <thead>
//                                     <tr>
//                                         <td className="bg-light fa-12 text-center">HSN / SAC</td>
//                                         <td className="bg-light fa-12 text-center">Taxable Value</td>
//                                         <td className="bg-light fa-12 text-center">IGST</td>
//                                         <td className="bg-light fa-12 text-center">CGST</td>
//                                         <td className="bg-light fa-12 text-center">SGST</td>
//                                         <td className="bg-light fa-12 text-center">Total Tax</td>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {/* Map through aggregated data */}

//                                     {TaxData.map((item, i) => (
//                                         <tr key={i}>
//                                             <td className="fa-10 text-end">{item.hsnCode}</td>
//                                             <td className="fa-10 text-end">{NumberFormat(item.totalBeforeTax)}</td>
//                                             <td className="fa-10 text-end">{NumberFormat(item.igst)}</td>
//                                             <td className="fa-10 text-end">{NumberFormat(item.cgst)}</td>
//                                             <td className="fa-10 text-end">{NumberFormat(item.sgst)}</td>
//                                             <td className="fa-10 text-end">{NumberFormat(item.totalTax)}</td>
//                                         </tr>
//                                     ))}

//                                     {/* Total Row */}
//                                     <tr>
//                                         <td className="border fa-10 text-end">Total</td>
//                                         <td className="border fa-10 text-end fw-bold">
//                                             {NumberFormat(TaxData.reduce((sum, item) => sum + item.totalBeforeTax, 0))}
//                                         </td>
//                                         <td className="border fa-10 text-end fw-bold">
//                                             {NumberFormat(TaxData.reduce((sum, item) => sum + item.igst, 0))}
//                                         </td>
//                                         <td className="border fa-10 text-end fw-bold">
//                                             {NumberFormat(TaxData.reduce((sum, item) => sum + item.cgst, 0))}
//                                         </td>
//                                         <td className="border fa-10 text-end fw-bold">
//                                             {NumberFormat(TaxData.reduce((sum, item) => sum + item.sgst, 0))}
//                                         </td>
//                                         <td className="border fa-10 text-end fw-bold">
//                                             {NumberFormat(TaxData.reduce((sum, item) => sum + item.totalTax, 0))}
//                                         </td>
//                                     </tr>

//                                 </tbody>
//                                 <td colSpan={6} className=' fa-13 fw-bold'>

//                                     Tax Amount (in words) : INR &nbsp;
//                                     {numberToWords(
//                                         parseInt(Object.values(selectedRow?.Product_Array).reduce(
//                                             (sum, item) => sum + Number(item.Total_Tax || 0), 0
//                                         ))
//                                     )} only.
//                                 </td>

//                             </table>

//                             <table className="table table-bordered fa-10">
//                                 <tbody>
//                                     <tr>
//                                         <td>Prepared By</td>
//                                         <td style={{ minWidth: 150 }}></td>
//                                         <td>Executed By</td>
//                                         <td style={{ minWidth: 150 }}></td>
//                                         <td>Verified By</td>
//                                         <td style={{ minWidth: 150 }}></td>
//                                     </tr>
//                                     <tr>
//                                         <td>Other Expenses</td>
//                                         <td>0</td>
//                                         <td>Round Off</td>
//                                         <td>0</td>
//                                         <td>Grand Total</td>
//                                         <td className="fa-15 fw-bold">
//                                             {/* Calculate Total Value (Taxable Value + Total Tax) */}
//                                             {NumberFormat(
//                                                 Object.values(TaxData).reduce(
//                                                     (acc, item) => acc + (item.taxableValue ?? 0) + (item.igst ?? 0) + (item.cgst ?? 0) + (item.sgst ?? 0), 0
//                                                 )
//                                             )}
//                                         </td>
//                                     </tr>
//                                 </tbody>

//                             </table>

//                             <td colSpan={6} className='col-12 fa-15 fw-bold'>
//                                 {numberToWords(
//                                     parseInt(Object.values(TaxData).reduce(
//                                         (acc, item) => acc + (item.taxableValue ?? 0) + (item.igst ?? 0) + (item.cgst ?? 0) + (item.sgst ?? 0), 0
//                                     ))
//                                 )} only.
//                             </td>
//                             <div className="col-12 text-center">
//                                 <p>This is a Computer Generated Invoice</p>
//                             </div>

//                         </React.Fragment>
//                     )}
//                 </DialogContent>
//                 <DialogActions>
//                     <Button
//                         onClick={() => setFilters(pre => ({ ...pre, printPreviewDialog: false }))}
//                         variant="outlined"
//                     >
//                         Close
//                     </Button>
//                     <Button
//                         startIcon={<Download />}
//                         variant="outlined"
//                         onClick={handlePrint}
//                     >
//                         Download
//                     </Button>
//                 </DialogActions>
//             </Dialog>

// <Dialog
//     open={filters?.ItemPreviewDialog}
//     onClose={() => setFilters(pre => ({ ...pre, ItemPreviewDialog: false }))}
//     maxWidth="md"
//     fullWidth
// >
//     <DialogTitle>Products Summary</DialogTitle>
//     <DialogContent>
//         {/* Only render printable content when dialog is open */}
//         {filters?.ItemPreviewDialog && (
//             <div ref={itemPreviewPrintRef}>
//                 <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
//                     <thead>
//                         <tr style={{ backgroundColor: '#f5f5f5' }}>
//                             <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Product Name</th>
//                             <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Total Quantity</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {(() => {
//                             const productMap = new Map();
                            
//                             selectedRow?.Product_Array?.forEach(delivery => {
//                                 delivery.Products_List?.forEach(product => {
//                                     const key = product.Item_Id;
//                                     if (productMap.has(key)) {
//                                         const existing = productMap.get(key);
//                                         productMap.set(key, {
//                                             ...existing,
//                                             totalQty: existing.totalQty + (product.Act_Qty || product.Bill_Qty || 0)
//                                         });
//                                     } else {
//                                         productMap.set(key, {
//                                             productName: product.Product_Name,
//                                             totalQty: product.Act_Qty || product.Bill_Qty || 0,
//                                             unit: product.Unit_Name,
//                                             itemId: product.Item_Id
//                                         });
//                                     }
//                                 });
//                             });

//                             const groupedProducts = Array.from(productMap.values());
                            
//                             return groupedProducts.map((product, index) => (
//                                 <tr key={index}>
//                                     <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.productName}</td>
//                                     <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>{product.totalQty}</td>
//                                 </tr>
//                             ));
//                         })()}
//                     </tbody>
//                 </table>

//                 {(!selectedRow?.Product_Array || selectedRow.Product_Array.length === 0) && (
//                     <p style={{ textAlign: 'center', padding: '20px' }}>
//                         No product data available
//                     </p>
//                 )}
//             </div>
//         )}
//     </DialogContent>
//     <DialogActions>
//         <Button onClick={() => setFilters(pre => ({ ...pre, ItemPreviewDialog: false }))} color="primary">
//             Close
//         </Button>
//         <Button
//             startIcon={<Download />}
//             variant="outlined"
//             onClick={handleItemPreviewPrint}
//             disabled={!selectedRow?.Product_Array || selectedRow.Product_Array.length === 0}
//         >
//             Download
//         </Button>
//     </DialogActions>
// </Dialog>
//             <Dialog open={deleteDialog} onClose={closeDeleteDialog} fullWidth maxWidth="sm">
//                 <DialogTitle>Confirm Delete</DialogTitle>
//                 <DialogContent>
//                     <p>Are you sure you want to delete this item?</p>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={closeDeleteDialog}>Cancel</Button>

//                     <Button onClick={handleDeleteConfirm} variant="contained" color="error">
//                         Delete
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             {/* <h6 className="m-0 text-end text-muted px-3">Total Invoice Amount ({tripData?.length}) : {Total_Invoice_value}</h6> */}
//         </>
//     )
// }


// export default TripSheets;












import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ISOString, isValidDate, LocalDate, LocalTime, NumberFormat, numberToWords, Subraction, timeDuration } from "../../../Components/functions";
import { Download, Edit, FilterAlt, Search, Visibility } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";
import { useReactToPrint } from 'react-to-print';
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from 'react-toastify'
import * as XLSX  from 'xlsx';
import { saveAs } from 'file-saver';

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const TripSheets = ({ loadingOn, loadingOff }) => {

    const nav = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const [tripData, setTripData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        filterDialog: false,
        refresh: false,
        printPreviewDialog: false,
        shortPreviewDialog: false,
        ItemPreviewDialog:false,
        FromGodown: [],
        ToGodown: [],
        Staffs: [],
        Items: []
    });
     const storage = JSON.parse(localStorage.getItem('user'));
    const [selectedRow, setSelectedRow] = useState([]);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [reload, setReload] = useState(false)
    const printRef = useRef(null);
    const [companyInfo, setCompanyInfo] = useState({});
    const itemPreviewPrintRef = useRef(null); 

   


    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `delivery/deliveryTripSheet?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}`,
        }).then(data => {
            if (data.success) {

                setTripData(data.data);
            }
        }).finally(() => {
            if (loadingOff) loadingOff();
        }).catch(e => console.error(e))
    }, [filters?.fetchFrom, filters?.fetchTo, reload]);

    const handleDeleteConfirm = async () => {

        fetchLink({
            address: `delivery/tripDetails`,
            method: "DELETE",
            bodyData: { Trip_Id: selectedId },
        }).then((data) => {
            if (data.success) {
                setReload(!reload);
                setDeleteDialog(false);
                toast.success("Trip deleted successfully!");
            } else {
                toast.error("Failed to delete area:");
            }
        }).catch(e => console.error(e));
    };

     useEffect(() => {
    
            fetchLink({
                address: `masters/company?Company_id=${storage?.Company_id}`
            }).then(data => {
                if (data.success) {
                    setCompanyInfo(data?.data[0] ? data?.data[0] : {})
                }
            }).catch(e => console.error(e))
    
        }, [storage?.Company_id])
    
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

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        nav(`?${params.toString()}`, { replace: true });
    };

    const closeDialog = () => {
        setFilters({
            ...filters,
            filterDialog: false,
        });
    }

    const allProducts = (selectedRow?.Product_Array || []).flatMap(product => product.Products_List || []);

    const TaxData = allProducts.reduce((data, item) => {
        const HSNindex = data.findIndex(obj => obj.hsnCode === item.HSN_Code);

        const {
            HSN_Code,
            Taxable_Amount = 0,
            Igst_Amo = 0,
            Cgst_Amo = 0,
            Sgst_Amo = 0
        } = item;

        const Total_Tax = Igst_Amo + Cgst_Amo + Sgst_Amo;

        if (HSNindex !== -1) {

            data[HSNindex] = {
                ...data[HSNindex],
                taxableValue: data[HSNindex].taxableValue + Taxable_Amount,
                igst: data[HSNindex].igst + Igst_Amo,
                cgst: data[HSNindex].cgst + Cgst_Amo,
                sgst: data[HSNindex].sgst + Sgst_Amo,
                totalBeforeTax: data[HSNindex].totalBeforeTax + Taxable_Amount,
                totalTax: data[HSNindex].totalTax + Total_Tax
            };
        } else {
            data.push({
                hsnCode: HSN_Code,
                taxableValue: Taxable_Amount,
                igst: Igst_Amo,
                cgst: Cgst_Amo,
                sgst: Sgst_Amo,
                totalBeforeTax: Taxable_Amount,
                totalTax: Total_Tax
            });
        }

        return data;
    }, []);

   const handlePrint = useReactToPrint({
    content: () => printRef.current,
    onPrintError: (error) => {
        console.error('Print error:', error);
        toast.error('Failed to print document');
    }
});


    const uniqueStaffs = useMemo(() => {
        const allStaffs = tripData.flatMap((trip) =>
            trip.Employees_Involved.map((staff) => staff.Emp_Name)
        );
        return [...new Set(allStaffs)].map((name) => ({
            value: name,
            label: name,
        }));
    }, [tripData]);

    const filteredData = useMemo(() => {
        return tripData.filter(trip => {
            const hasFromGodownMatch = filters.FromGodown.length > 0
                ? trip.Product_Array.some(product =>
                    filters.FromGodown.some(selected => selected.value === product.FromLocation)
                )
                : false;

            const hasToGodownMatch = filters.ToGodown.length > 0
                ? trip.Product_Array.some(product =>
                    filters.ToGodown.some(selected => selected.value === product.ToLocation)
                )
                : false;

            const hasItemMatch = filters.Items.length > 0
                ? trip.Product_Array.some(product =>
                    filters.Items.some(selected => selected.value === product.Product_Name)
                )
                : false;

            const hasEmployeeMatch = filters.Staffs.length > 0
                ? trip.Employees_Involved.some(staff =>
                    filters.Staffs.some(selected => selected.value === staff.Emp_Name)
                )
                : false;

            return hasFromGodownMatch || hasToGodownMatch || hasItemMatch || hasEmployeeMatch;
        });
    }, [tripData, filters]);

    const flattenProductsList = (productArray) => {
        if (!Array.isArray(productArray)) return [];

        return productArray.flatMap((product) =>
            Array.isArray(product.Products_List)
                ? product.Products_List
                    .map((item) => ({
                        ...item,
                        Reason: product.Reason || "Delivery",
                    }))
                    .filter(item => Object.keys(item).length > 1)
                : []
        ).filter(row => row && Object.keys(row).length > 1);
    };


    const closeDeleteDialog = () => {
        setDeleteDialog(false);
        setSelectedId(null);
    };

    const openDeleteDialog = (id) => {
        setSelectedId(id);
        setDeleteDialog(true);
    };
    const handleItemPreviewPrint = useReactToPrint({
    content: () => {
        if (!itemPreviewPrintRef.current) {
            toast.error('No content available to print');
            return null;
        }
        return itemPreviewPrintRef.current;
    },
    onPrintError: (error) => {
        console.error('Print error:', error);
        toast.error('Failed to print document');
    }
});



const packSummary = useMemo(() => {
    if (!selectedRow?.Product_Array) return {};

    const products = selectedRow.Product_Array.flatMap(
        product => product?.Products_List || []
    );


    const packMap = {};
    
    products.forEach(item => {
        const pack = item?.Pack;
        
        if (!pack) return;
        
    
        const billQty = Number(item?.Bill_Qty) || 0;
        const packSize = Number(pack) || 1; 
        
       
        const bags = packSize > 0 ? billQty / packSize : 0;
        
        if (bags > 0) {
            const packKey = `${pack}`;
            packMap[packKey] = (packMap[packKey] || 0) + bags;
        }
    });

    return packMap;
}, [selectedRow]);



// const exportToExcel = () => {
  
    
//     if (!selectedRow?.Product_Array || !Array.isArray(selectedRow.Product_Array)) {
//         toast.error('No trip data available to export');
//         return;
//     }

//     try {
     
//         const wb = XLSX.utils.book_new();
        
      
//         const mainData = [];
        
      
//         mainData.push(
//             ['DELIVERY CHALLAN', '', '', `GSTIN / UIN: ${companyInfo?.Gst_Number || companyInfo?.VAT_TIN_Number || 'Not Available'}`, '', '', 'ORIGINAL / DUPLICATE'],
//             ['Company Name:', companyInfo?.Company_Name || '', '', 'FSSAI No:', '', 'Challan No:', selectedRow?.Challan_No || ''],
//             ['Address:', companyInfo?.Company_Address || '', '', 'Phone No:', '9842131353, 9786131353', 'Date:', selectedRow.Trip_Date ? LocalDate(selectedRow.Trip_Date) : ''],
//             [],
//             ['Vehicle No:', selectedRow?.Vehicle_No || '', 'Delivery Person:', 
//              selectedRow?.Employees_Involved?.filter(staff => staff?.Cost_Category === 'Delivery Man')?.map(staff => staff?.Emp_Name).join(', ') || '', 
//              'Start Time:', selectedRow?.StartTime ? LocalTime(new Date(selectedRow.StartTime)) : '', 'Start KM:', selectedRow?.Trip_ST_KM || ''],
//             ['Trip No:', selectedRow?.Trip_No || '', 'LoadMan:', 
//              selectedRow?.Employees_Involved?.filter(staff => staff?.Cost_Category === 'Load Man')?.map(staff => staff?.Emp_Name).join(', ') || '', 
//              'End Time:', selectedRow?.EndTime ? LocalTime(new Date(selectedRow.EndTime)) : '', 'End KM:', selectedRow?.Trip_EN_KM || ''],
//             []
//         );

    
//         mainData.push(
//             ['S.No', 'Invoice No', 'Retailer Name', 'Location', 'Item Name', 'HSN Code', 'Quantity','Act_Qty' ,'Rate', 'Amount']
//         );


//         let allProducts = [];
//         let serialNo = 1;
        
    
//         selectedRow.Product_Array.forEach((delivery) => {
      
//             if (delivery.Products_List && Array.isArray(delivery.Products_List)) {
          
//                 delivery.Products_List.forEach((product) => {
            
//                     const quantity = product.Bill_Qty || product.Act_Qty || 0;
                    
       
//                     const rate = product.Taxable_Rate || product.Item_Rate || 0;
                    
                  
//                     const amount = (quantity * rate); 
                    
//                     allProducts.push({
//                         serialNo: serialNo++,
//                         invoiceNo: product.Do_Inv_No || "Delivery",
//                         retailerName: delivery.Retailer_Name || '',
//                         location: product.Party_Location || '',
//                         itemName: product.Product_Name || '',
//                         hsnCode: product.HSN_Code || '',
//                         Act_Qty: product.Bill_Qty / product.Pack || '',
//                         quantity: quantity,
//                         rate: rate , 
//                         amount: amount,
//                         pack: product.Pack || ''
//                     });
//                 });
//             }
//         });

       
//         if (allProducts.length > 0) {
//             allProducts.forEach(product => {
//                 mainData.push([
//                     product.serialNo,
//                     product.invoiceNo,
//                     product.retailerName,
//                     product.location,
//                     product.itemName,
//                     product.hsnCode,
//                     product.quantity,
//                     product.rate.toFixed(2),
//                     product.amount.toFixed(2)
//                 ]);
//             });
//         } else {
//             mainData.push(['No products found in this trip', '', '', '', '', '', '', '', '']);
//         }

    
//         const totalQty = allProducts.reduce((sum, product) => sum + (Number(product.quantity) || 0), 0);
//         const totalAmount = allProducts.reduce((sum, product) => sum + (Number(product.amount) || 0), 0);

        
//         mainData.push(
//             [], 
//             ['Total', '', '', '', '', '', totalQty, '', totalAmount.toFixed(2)],
//             [], // Empty row
//             // Tax Summary Header
//             ['HSN / SAC', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'Total Tax', '', '', '']
//         );

      
//         const taxSummary = {};
//         allProducts.forEach(product => {
//             const hsnCode = product.hsnCode;
//             if (!taxSummary[hsnCode]) {
//                 taxSummary[hsnCode] = {
//                     taxableValue: 0,
//                     igst: 0,
//                     cgst: 0,
//                     sgst: 0
//                 };
//             }
//             taxSummary[hsnCode].taxableValue += product.amount;
//         });

//         Object.keys(taxSummary).forEach(hsnCode => {
//             const taxData = taxSummary[hsnCode];
//             mainData.push([
//                 hsnCode || 'N/A',
//                 taxData.taxableValue.toFixed(2),
//                 taxData.igst.toFixed(2),
//                 taxData.cgst.toFixed(2),
//                 taxData.sgst.toFixed(2),
//                 (taxData.igst + taxData.cgst + taxData.sgst).toFixed(2),
//                 '', '', ''
//             ]);
//         });

//         const totalTaxable = Object.values(taxSummary).reduce((sum, item) => sum + item.taxableValue, 0);
//         const totalIGST = Object.values(taxSummary).reduce((sum, item) => sum + item.igst, 0);
//         const totalCGST = Object.values(taxSummary).reduce((sum, item) => sum + item.cgst, 0);
//         const totalSGST = Object.values(taxSummary).reduce((sum, item) => sum + item.sgst, 0);
//         const totalTax = totalIGST + totalCGST + totalSGST;

//         mainData.push(
//             ['Total', totalTaxable.toFixed(2), totalIGST.toFixed(2), totalCGST.toFixed(2), totalSGST.toFixed(2), totalTax.toFixed(2), '', '', ''],
//             [], // Empty row
//             // Pack Summary
//             ['Pack Details', 'Count', '', '', '', '', '', '', '']
//         );


//         const packSummary = {};
       
//         allProducts.forEach(product => {
//             if (product.pack) {
//                 const packKey = `${product.pack} KG`;
//                 packSummary[packKey] = (packSummary[packKey] || 0) + 1;
//             }
//         });

//         Object.entries(packSummary).forEach(([pack, count]) => {
//             mainData.push([pack, `Bags: ${count}`, '', '', '', '', '', '', '']);
//         });

//         if (Object.keys(packSummary).length === 0) {
//             mainData.push(['No pack information', '', '', '', '', '', '', '', '']);
//         }

//         const grandTotal = totalTaxable + totalTax;
//         mainData.push(
//             [], // Empty row
//             ['Prepared By', '', 'Executed By', '', 'Verified By', '', '', '', ''],
//             [], // Empty row
//             ['Other Expenses', '0.00', 'Round Off', '0.00', 'Grand Total', grandTotal.toFixed(2), '', '', ''],
//             [], // Empty row
//             ['Total Amount (in words):', `INR ${numberToWords(parseInt(grandTotal))} only.`, '', '', '', '', '', '', ''],
//             [], // Empty row
//             ['This is a Computer Generated Invoice', '', '', '', '', '', '', '', '']
//         );

//         const ws = XLSX.utils.aoa_to_sheet(mainData);
        
 
//         ws['!cols'] = [
//             { wch: 8 },  
//             { wch: 18 },  
//             { wch: 30 }, 
//             { wch: 15 }, 
//             { wch: 35 },  
//             { wch: 12 },  
//             { wch: 12 },  
//             { wch: 12 }, 
//             { wch: 15 }  
//         ];

   
//         const rowCount = mainData.length;
//         ws['!rows'] = [];
//         for (let i = 0; i < rowCount; i++) {
//             ws['!rows'][i] = { hpt: 20 }; 
//         }

//         XLSX.utils.book_append_sheet(wb, ws, 'Delivery Challan');

  
//         const simpleData = [];
        
       
//         simpleData.push(['DELIVERY CHALLAN']);
//         simpleData.push([`Company: ${companyInfo?.Company_Name || ''}`]);
//         simpleData.push([`Address: ${companyInfo?.Company_Address || ''}`]);
//         simpleData.push([`GSTIN/UIN: ${companyInfo?.Gst_Number || companyInfo?.VAT_TIN_Number || 'Not Available'}`]);
//         simpleData.push([`Challan No: ${selectedRow?.Challan_No || ''} | Date: ${selectedRow.Trip_Date ? LocalDate(selectedRow.Trip_Date) : ''}`]);
//         simpleData.push([`Vehicle No: ${selectedRow?.Vehicle_No || ''} | Trip No: ${selectedRow?.Trip_No || ''}`]);
//         simpleData.push([]);
        
   
//         simpleData.push(['S.No', 'Item Description', 'HSN', 'Qty', 'Rate', 'Amount']);
        
      
//         let sn = 1;
//         selectedRow.Product_Array.forEach((delivery) => {
//             if (delivery.Products_List && Array.isArray(delivery.Products_List)) {
//                 delivery.Products_List.forEach((product) => {
//                     const qty = product.Bill_Qty || product.Act_Qty || 0;
//                     const rate = (product.Taxable_Rate || product.Item_Rate || 0) / 100;
//                     const amount = qty * rate;
                    
//                     simpleData.push([
//                         sn++,
//                         `${product.Product_Name || ''}`,
//                         product.HSN_Code || '',
//                         qty,
//                         rate.toFixed(2),
//                         amount.toFixed(2)
//                     ]);
//                 });
//             }
//         });
        
      
//         simpleData.push([]);
//         const totalQtySimple = allProducts.reduce((sum, p) => sum + p.quantity, 0);
//         const totalAmountSimple = allProducts.reduce((sum, p) => sum + p.amount, 0);
//         simpleData.push(['', '', 'TOTAL:', totalQtySimple, '', totalAmountSimple.toFixed(2)]);
        
       
//         simpleData.push([]);
//         simpleData.push(['TAX SUMMARY']);
//         simpleData.push(['HSN', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'Total']);
        
//         Object.keys(taxSummary).forEach(hsn => {
//             const tax = taxSummary[hsn];
//             simpleData.push([
//                 hsn,
//                 tax.taxableValue.toFixed(2),
//                 tax.igst.toFixed(2),
//                 tax.cgst.toFixed(2),
//                 tax.sgst.toFixed(2),
//                 (tax.taxableValue + tax.igst + tax.cgst + tax.sgst).toFixed(2)
//             ]);
//         });
        
//         simpleData.push([]);
//         simpleData.push(['Grand Total:', grandTotal.toFixed(2)]);
//         simpleData.push(['In Words:', `INR ${numberToWords(parseInt(grandTotal))} only`]);
//         simpleData.push([]);
//         simpleData.push(['--- This is a Computer Generated Invoice ---']);
        
//         const wsSimple = XLSX.utils.aoa_to_sheet(simpleData);
        
      
//         wsSimple['!cols'] = [
//             { wch: 6 },   
//             { wch: 40 },  
//             { wch: 10 }, 
//             { wch: 10 }, 
//             { wch: 12 },  
//             { wch: 15 }   
//         ];
        
//         XLSX.utils.book_append_sheet(wb, wsSimple, 'Simple Format');

       
//         const excelBuffer = XLSX.write(wb, { 
//             bookType: 'xlsx', 
//             type: 'array',
//             bookSST: false,
//             cellStyles: true
//         });
//         const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
//         const fileName = `Delivery_Challan_${selectedRow?.Challan_No || selectedRow?.Trip_No || 'Trip'}_${LocalDate(new Date())}.xlsx`;
//         saveAs(data, fileName);
        
//         toast.success('Excel file downloaded successfully!');
        
//     } catch (error) {
       
//         toast.error('Failed to export to Excel: ' + error.message);
//     }
// };

const exportToExcel = () => {
    if (!selectedRow?.Product_Array || !Array.isArray(selectedRow.Product_Array)) {
        toast.error('No trip data available to export');
        return;
    }

    try {
        const wb = XLSX.utils.book_new();
        
        const mainData = [];
        
  
        mainData.push(
            ['DELIVERY CHALLAN', '', '', `GSTIN / UIN: ${companyInfo?.Gst_Number || companyInfo?.VAT_TIN_Number || 'Not Available'}`, '', '', 'ORIGINAL / DUPLICATE'],
            ['Company Name:', companyInfo?.Company_Name || '', '', 'FSSAI No:', '', 'Challan No:', selectedRow?.Challan_No || ''],
            ['Address:', companyInfo?.Company_Address || '', '', 'Phone No:', '9842131353, 9786131353', 'Date:', selectedRow.Trip_Date ? LocalDate(selectedRow.Trip_Date) : ''],
            [],
            ['Vehicle No:', selectedRow?.Vehicle_No || '', 'Delivery Person:', 
             selectedRow?.Employees_Involved?.filter(staff => staff?.Cost_Category === 'Delivery Man')?.map(staff => staff?.Emp_Name).join(', ') || '', 
             'Start Time:', selectedRow?.StartTime ? LocalTime(new Date(selectedRow.StartTime)) : '', 'Start KM:', selectedRow?.Trip_ST_KM || ''],
            ['Trip No:', selectedRow?.Trip_No || '', 'LoadMan:', 
             selectedRow?.Employees_Involved?.filter(staff => staff?.Cost_Category === 'Load Man')?.map(staff => staff?.Emp_Name).join(', ') || '', 
             'End Time:', selectedRow?.EndTime ? LocalTime(new Date(selectedRow.EndTime)) : '', 'End KM:', selectedRow?.Trip_EN_KM || ''],
            []
        );

     
        mainData.push(
            ['S.No', 'Invoice No', 'Retailer Name', 'Location', 'Item Name', 'HSN Code', 'Bill Qty (KG)', 'Act Qty (Bags)', 'Rate', 'Amount']
        );

        let allProducts = [];
        let serialNo = 1;
        
       
        selectedRow.Product_Array.forEach((delivery) => {
            if (delivery.Products_List && Array.isArray(delivery.Products_List)) {
                delivery.Products_List.forEach((product) => {
              
                    const billQty = product.Bill_Qty || 0;
                    const pack = product.Pack || 1;
                    
                
                    const actQty =billQty / pack;
                    
               
                    const rate = product.Taxable_Rate || product.Item_Rate || 0;
                    const amount = billQty * rate;
                    
                    allProducts.push({
                        serialNo: serialNo++,
                        invoiceNo: product.Do_Inv_No || "Delivery",
                        retailerName: product.Retailer_Name || '',
                        location: product.Party_Location || '',
                        itemName: product.Product_Name || '',
                        hsnCode: product.HSN_Code || '',
                        billQty: billQty, 
                        actQty: actQty,    
                        rate: rate,
                        amount: amount,
                        pack: pack,     
                        packSize: `${pack}`,
                        taxableRate: product.Taxable_Rate || product.Item_Rate || 0
                    });
                });
            }
        });


        if (allProducts.length > 0) {
            allProducts.forEach(product => {
                mainData.push([
                    product.serialNo,
                    product.invoiceNo,
                    product.retailerName,
                    product.location,
                    product.itemName,
                    product.hsnCode,
                    product.billQty,           
                    product.actQty.toFixed(2), 
                    product.rate.toFixed(2),
                    product.amount.toFixed(2)
                ]);
            });
        } else {
            mainData.push(['No products found in this trip', '', '', '', '', '', '', '', '', '']);
        }

      
        const totalBillQty = allProducts.reduce((sum, product) => sum + (Number(product.billQty) || 0), 0);
        const totalActQty = allProducts.reduce((sum, product) => sum + (Number(product.actQty) || 0), 0);
        const totalAmount = allProducts.reduce((sum, product) => sum + (Number(product.amount) || 0), 0);

        
        mainData.push(
            [], 
            ['Total', '', '', '', '', '', totalBillQty.toFixed(2), totalActQty.toFixed(2), '', totalAmount.toFixed(2)],
            [], 
         
            ['HSN / SAC', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'Total Tax', '', '', '', '']
        );

 
        const taxSummary = {};
        allProducts.forEach(product => {
            const hsnCode = product.hsnCode;
            if (!taxSummary[hsnCode]) {
                taxSummary[hsnCode] = {
                    taxableValue: 0,
                    igst: 0,
                    cgst: 0,
                    sgst: 0
                };
            }
            taxSummary[hsnCode].taxableValue += product.amount;
        });


        Object.keys(taxSummary).forEach(hsnCode => {
            const taxData = taxSummary[hsnCode];
            mainData.push([
                hsnCode || 'N/A',
                taxData.taxableValue.toFixed(2),
                taxData.igst.toFixed(2),
                taxData.cgst.toFixed(2),
                taxData.sgst.toFixed(2),
                (taxData.igst + taxData.cgst + taxData.sgst).toFixed(2),
                '', '', '', ''
            ]);
        });


        const totalTaxable = Object.values(taxSummary).reduce((sum, item) => sum + item.taxableValue, 0);
        const totalIGST = Object.values(taxSummary).reduce((sum, item) => sum + item.igst, 0);
        const totalCGST = Object.values(taxSummary).reduce((sum, item) => sum + item.cgst, 0);
        const totalSGST = Object.values(taxSummary).reduce((sum, item) => sum + item.sgst, 0);
        const totalTax = totalIGST + totalCGST + totalSGST;

        mainData.push(
            ['Total', totalTaxable.toFixed(2), totalIGST.toFixed(2), totalCGST.toFixed(2), totalSGST.toFixed(2), totalTax.toFixed(2), '', '', '', ''],
            [], 
          
            ['Pack Summary', 'Total Bags', '', '', '', '', '', '', '', '']
        );

       
        const packSummary = {};
        
        allProducts.forEach(product => {
            if (product.pack && product.pack > 0) {
                const packKey = `${product.pack} KG`;
                
                if (!packSummary[packKey]) {
                    packSummary[packKey] = {
                        totalBags: 0,
                        // totalWeight: 0
                    };
                }
                

                const numBags = Math.round(product.actQty); 
                const totalWeight = product.billQty; 
                
                packSummary[packKey].totalBags += numBags;
                // packSummary[packKey].totalWeight += totalWeight;
            }
        });

    
        let totalAllBags = 0;
        let totalAllWeight = 0;
        
        Object.entries(packSummary).forEach(([packSize, summary]) => {
            mainData.push([
                packSize,
                `${summary.totalBags} bags`,
                // `${summary.totalWeight.toFixed(2)} KG`,
                '', '', '', '', '', '', ''
            ]);
            
            totalAllBags += summary.totalBags;
            // totalAllWeight += summary.totalWeight;
        });

        if (Object.keys(packSummary).length === 0) {
            mainData.push(['No pack information', '', '', '', '', '', '', '', '', '']);
        } else {
    
            mainData.push([
                'TOTAL',
                `${totalAllBags} bags`,
                // `${totalAllWeight.toFixed(2)} KG`,
                '', '', '', '', '', '', ''
            ]);
        }

        const grandTotal = totalTaxable + totalTax;
        mainData.push(
            [], 
            ['Prepared By', '', 'Executed By', '', 'Verified By', '', '', '', '', ''],
            [], 
            ['Other Expenses', '0.00', 'Round Off', '0.00', 'Grand Total', grandTotal.toFixed(2), '', '', '', ''],
            [], 
            ['Total Amount (in words):', `INR ${numberToWords(parseInt(grandTotal))} only.`, '', '', '', '', '', '', '', ''],
            [], 
            ['This is a Computer Generated Invoice', '', '', '', '', '', '', '', '', '']
        );

        const ws = XLSX.utils.aoa_to_sheet(mainData);
        

        ws['!cols'] = [
            { wch: 8 }, 
            { wch: 18 },  
            { wch: 30 },  
            { wch: 15 },  
            { wch: 35 },  
            { wch: 12 },  
            { wch: 12 },  
            { wch: 12 },  
            { wch: 12 }, 
            { wch: 15 }   
        ];

  
        const rowCount = mainData.length;
        ws['!rows'] = [];
        for (let i = 0; i < rowCount; i++) {
            ws['!rows'][i] = { hpt: 20 };
        }

        XLSX.utils.book_append_sheet(wb, ws, 'Delivery Challan');

  
        const simpleData = [];
        
        simpleData.push(['DELIVERY CHALLAN']);
        simpleData.push([`Company: ${companyInfo?.Company_Name || ''}`]);
        simpleData.push([`Address: ${companyInfo?.Company_Address || ''}`]);
        simpleData.push([`GSTIN/UIN: ${companyInfo?.Gst_Number || companyInfo?.VAT_TIN_Number || 'Not Available'}`]);
        simpleData.push([`Challan No: ${selectedRow?.Challan_No || ''} | Date: ${selectedRow.Trip_Date ? LocalDate(selectedRow.Trip_Date) : ''}`]);
        simpleData.push([`Vehicle No: ${selectedRow?.Vehicle_No || ''} | Trip No: ${selectedRow?.Trip_No || ''}`]);
        simpleData.push([]);
        
      
        simpleData.push(['S.No', 'Item Description', 'HSN', 'Bill Qty (KG)', 'Act Qty (Bags)', 'Rate', 'Amount']);
     
        let sn = 1;
        selectedRow.Product_Array.forEach((delivery) => {
            if (delivery.Products_List && Array.isArray(delivery.Products_List)) {
                delivery.Products_List.forEach((product) => {
                    const billQty = product.Bill_Qty || 0;
                    const pack = product.Pack || 1;
                    const actQty = pack !== 0 ? (billQty / pack) : billQty;
                    const rate = (product.Taxable_Rate || product.Item_Rate || 0);
                    const amount = billQty * rate;
                    
                    simpleData.push([
                        sn++,
                        `${product.Product_Name || ''}`,
                        product.HSN_Code || '',
                        billQty,
                        actQty.toFixed(2),
                        rate.toFixed(2),
                        amount.toFixed(2)
                    ]);
                });
            }
        });
        
        
        simpleData.push([]);
        const totalBillQtySimple = allProducts.reduce((sum, p) => sum + p.billQty, 0);
        const totalActQtySimple = allProducts.reduce((sum, p) => sum + p.actQty, 0);
        const totalAmountSimple = allProducts.reduce((sum, p) => sum + p.amount, 0);
        simpleData.push(['', '', 'TOTAL:', totalBillQtySimple.toFixed(2), totalActQtySimple.toFixed(2), '', totalAmountSimple.toFixed(2)]);
        
    
        simpleData.push([]);
        simpleData.push(['TAX SUMMARY']);
        simpleData.push(['HSN', 'Taxable Value', 'IGST', 'CGST', 'SGST', 'Total']);
        
        Object.keys(taxSummary).forEach(hsn => {
            const tax = taxSummary[hsn];
            simpleData.push([
                hsn,
                tax.taxableValue.toFixed(2),
                tax.igst.toFixed(2),
                tax.cgst.toFixed(2),
                tax.sgst.toFixed(2),
                (tax.taxableValue + tax.igst + tax.cgst + tax.sgst).toFixed(2)
            ]);
        });
        
        
        simpleData.push([]);
        simpleData.push(['PACK SUMMARY']);
        simpleData.push(['Pack Size', 'Total Bags']);
        
        Object.entries(packSummary).forEach(([packSize, summary]) => {
            simpleData.push([
                packSize,
                summary.totalBags,
                // summary.totalWeight.toFixed(2)
            ]);
        });
        
        if (Object.keys(packSummary).length > 0) {
            simpleData.push([
                'TOTAL',
                totalAllBags,
                // totalAllWeight.toFixed(2)
            ]);
        }
        
        simpleData.push([]);
        simpleData.push(['Grand Total:', grandTotal.toFixed(2)]);
        simpleData.push(['In Words:', `INR ${numberToWords(parseInt(grandTotal))} only`]);
        simpleData.push([]);
        simpleData.push(['--- This is a Computer Generated Invoice ---']);
        
        const wsSimple = XLSX.utils.aoa_to_sheet(simpleData);
        
       
        wsSimple['!cols'] = [
            { wch: 6 },    
            { wch: 40 },   
            { wch: 10 },   
            { wch: 12 },   
            { wch: 12 }, 
            { wch: 12 },
            { wch: 15 }   
        ];
        
        XLSX.utils.book_append_sheet(wb, wsSimple, 'Simple Format');

        
        const excelBuffer = XLSX.write(wb, { 
            bookType: 'xlsx', 
            type: 'array',
            bookSST: false,
            cellStyles: true
        });
        const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        const fileName = `Delivery_Challan_${selectedRow?.Challan_No || selectedRow?.Trip_No || 'Trip'}_${LocalDate(new Date())}.xlsx`;
        saveAs(data, fileName);
        
        toast.success('Excel file downloaded successfully!');
        
    } catch (error) {
        toast.error('Failed to export to Excel: ' + error.message);
    }
};


    return (
        <>

            <FilterableTable
                dataArray={(
                    filters.FromGodown.length > 0 ||
                    filters.ToGodown.length > 0 ||
                    filters.Staffs.length > 0
                ) ? filteredData : tripData}
                title="Trip Sheets"
                maxHeightOption
                ExcelPrintOption
                ButtonArea={
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => nav('/erp/sales/Tripsheet/Tripsheetcreation')}
                        >Add</Button>
                        <Tooltip title='Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setFilters({ ...filters, filterDialog: true })}
                            ><FilterAlt /></IconButton>
                        </Tooltip>
                    </>
                }
                EnableSerialNumber

                initialPageCount={10}
                columns={[
                    createCol('Trip_Date', 'date', 'Date'),
                    createCol('Trip_No', 'string'),
                    createCol('Challan_No', 'string', 'Challan'),
      {
    isVisible: 1,
    ColumnHeader: 'Load Man',
    isCustomCell: true,
    Cell: ({ row }) => {
     
        const employeesInvolved = Array.isArray(row?.Employees_Involved) ? row.Employees_Involved : [];
        

        const loadMen = employeesInvolved.filter(emp => 
            emp?.Cost_Category === "Load Man" || 
            emp?.Cost_Category === "LoadMan" || 
            emp?.Cost_Center_Type_Id === 4
        );
        
     
        const uniqueNames = [...new Set(loadMen.map(emp => emp.Emp_Name?.trim()).filter(Boolean))];
        
       
        const loadManNames = uniqueNames.join(', ');
        
        return (
            <span className="cus-badge bg-light">{loadManNames || 'N/A'}</span>
        )
    }
},
                    createCol('Vehicle_No', 'string', 'Vehicle'),
                    createCol('StartTime', 'time', 'Start Time'),
                    createCol('EndTime', 'time', 'End Time'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Time Taken',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const startTime = row?.StartTime ? new Date(row.StartTime) : '';
                            const endTime = row.EndTime ? new Date(row.EndTime) : '';
                            const timeTaken = (startTime && endTime) ? timeDuration(startTime, endTime) : '00:00';
                            return (
                                <span className="cus-badge bg-light">{timeTaken}</span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Distance',
                        isCustomCell: true,
                        Cell: ({ row }) => NumberFormat(Subraction(row?.Trip_EN_KM, row?.Trip_ST_KM))
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Total Qty',
                        isCustomCell: true,
                        Cell: ({ row }) => {

                            const totalQty = row?.Product_Array?.reduce((sum, product) => {

                                const productQty = product?.Products_List?.reduce((productSum, item) => {
                                    return productSum + (item.Bill_Qty || 0);
                                }, 0);
                                return sum + productQty;
                            }, 0);


                            return <span>{totalQty}</span>;
                        },
                    },

                    {
                        isVisible: 1,
                        ColumnHeader: 'Total Item',
                        isCustomCell: true,
                        Cell: ({ row }) => {

                            const totalQty = row?.Product_Array?.reduce((sum, product) => {

                                const productQty = product?.Products_List?.reduce((productSum, item) => {
                                    return productSum + 1;
                                }, 0);
                                return sum + productQty;
                            }, 0);


                            return <span>{totalQty}</span>;
                        },
                    },

                    {
                        isVisible: 1,
                        ColumnHeader: 'Action',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <ButtonActions
                                buttonsData={[
                                    {
                                        name: 'Delete',
                                        icon: <Visibility className="fa-14" />,
                                        onclick: () => {
                                            openDeleteDialog(true)

                                            setSelectedId(row?.Trip_Id)
                                        }
                                    },
                                    // {
                                    //     name: 'Edit',
                                    //     icon: <Edit className="fa-14" />,

                                    //     onclick: () => nav('/erp/sales/Tripsheet/Tripsheetcreation', {

                                    //         state: {
                                    //             ...row,
                                    //             isEditable: false,
                                                

                                    //         },
                                    //     }),

                                    // },
                                    {
    name: 'Edit',
    icon: <Edit className="fa-14" />,
    onclick: () => {
       
        const editData = {
            Trip_Id: row.Trip_Id,
            Challan_No: row.Challan_No,
            Vehicle_No: row.Vehicle_No,
            Trip_No: row.Trip_No,
            TripStatus: row.TripStatus || "New",
            Trip_ST_KM: row.Trip_ST_KM || "0",
            Trip_EN_KM: row.Trip_EN_KM || "0",
            Trip_Tot_Kms: row.Trip_Tot_Kms || "0",
            Trip_Date: row.Trip_Date,
            StartTime: row.StartTime,
            EndTime: row.EndTime,
            Branch_Id: row.Branch_Id,
            TR_INV_ID: row.TR_INV_ID,
            BillType: row.BillType || "SALES",
            VoucherType: row.VoucherType || 0,
            DO_Date: row.DO_Date,
            
  
            Product_Array: row.Product_Array || row.Trip_Details?.map(item => ({
                Do_Id: item.Do_Id,
                Retailer_Name: item.Retailer_Name || "Unknown",
                Products_List: item.Products_List || [],
                All_Staff_Details: item.All_Staff_Details || []
            })) || [],
            
         
            Employees_Involved: row.Employees_Involved || [],
            
         
            Branch_Name: row.Branch_Name,
            AreaName: row.AreaName,
            isEditable: true 
        };
        
        nav('/erp/sales/Tripsheet/Tripsheetcreation', {
            state: editData
        });
    },
},
                                    {
                                        name: 'Item Short Preview',
                                        icon:<Visibility className="fa-14"/>,
                                        onclick:()=>{
                                            setFilters(pre=>({ ...pre,ItemPreviewDialog:true}));
                                            setSelectedRow(row);
                                        }
                                    },
                                    {
                                        name: 'Short Preview',
                                        icon: <Visibility className="fa-14" />,
                                        onclick: () => {
                                            setFilters(pre => ({ ...pre, shortPreviewDialog: true }));

                                            setSelectedRow(row);
                                        }
                                    },
                                    {
                                        name: 'Preview',
                                        icon: <Visibility className="fa-14" />,
                                        onclick: () => {
                                            setFilters(pre => ({ ...pre, printPreviewDialog: true }));
                                            setSelectedRow(row);
                                        }
                                    },
                                       {
                                        name: 'Download Excel',
                                        icon: <Download className="fa-14" />,
                                        onclick: () => {
                                            setSelectedRow(row);
                                            setTimeout(() => exportToExcel(), 100);
                                        }
                                    },
                                ]}
                            />
                        )
                    }
                ]}
                isExpendable={true}
                expandableComp={({ row }) => (
                    <>
                        {row?.Employees_Involved?.length > 0 && (
                            <table className="fa-14">
                                <tbody>
                                    <tr>
                                        <th className="py-1 px-2 border text-muted" colSpan={3}>Involved Employees</th>
                                    </tr>
                                    <tr>
                                        <th className="py-1 px-2 border text-muted">SNo</th>
                                        <th className="py-1 px-2 border text-muted">Name</th>
                                        <th className="py-1 px-2 border text-muted">Role</th>
                                    </tr>
                                    {row.Employees_Involved.map((o, i) => (
                                        <tr key={i}>
                                            <td className="py-1 px-2 border">{i + 1}</td>
                                            <td className="py-1 px-2 border">{o?.Emp_Name}</td>
                                            <td className="py-1 px-2 border">{o?.Cost_Category}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}


                        <FilterableTable
                            title="Items"
                            EnableSerialNumber
                            dataArray={
                                Array.isArray(row?.Product_Array)
                                    ? flattenProductsList(row?.Product_Array).filter(row => Object.keys(row).length > 1)
                                    : []
                            }
                            columns={[
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Do_Inv_No',
                                    isCustomCell: true,
                                    Cell: ({ row }) => row.Do_Inv_No ?? 'Delivery',
                                },
                                createCol('Product_Name', 'string', 'Product_Name'),
                                createCol('HSN_Code', 'string'),
                                createCol('Taxable_Rate', 'number', 'Taxable_Rate'),
                                createCol('Taxable_Amount', 'number', 'Tax_Before_Amount'),
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Tax',
                                    isCustomCell: true,
                                    Cell: ({ row }) => {
                                        const cgstP = Number(row.Cgst_Amo) || 0;
                                        const sgstP = Number(row.Sgst_Amo) || 0;
                                        const taxValue = cgstP + sgstP;
                                        return taxValue.toFixed(2);
                                    },
                                },
                                createCol('Final_Amo', 'number', 'Final_Amo'),

                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Round off',
                                    isCustomCell: true,
                                    Cell: ({ row }) => {
                                        const total = Number(row.Total_Value) || 0;
                                        const integerPart = Math.floor(total);
                                        const decimalPart = total - integerPart;

                                        let roundedTotal = integerPart;
                                        let roundOffDiff = 0;

                                        if (decimalPart >= 0.56 && decimalPart <= 0.99) {
                                            roundedTotal = integerPart + 1;
                                        } else if (decimalPart >= 0.05 && decimalPart <= 0.55) {
                                            roundedTotal = integerPart;
                                        } else if (decimalPart >= 0.00 && decimalPart <= 0.04) {
                                            roundedTotal = integerPart;
                                        }

                                        roundOffDiff = (roundedTotal - total).toFixed(2);
                                        return roundOffDiff > 0 ? `+${roundOffDiff}` : roundOffDiff;
                                    },
                                },
                                createCol('Branch', 'string', 'From'),
                                createCol('Retailer_Name', 'string', 'To'),
                            ]}
                            disablePagination
                            ExcelPrintOption
                        />


                    </>
                )}
            />

            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog}
                fullWidth maxWidth='md'
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
                                    <td style={{ verticalAlign: 'middle' }}>Staffs</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.Staffs}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, Staffs: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueStaffs}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Staff"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                {/* <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Items</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.Items}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, Items: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueItems}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Items"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr> */}


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

 <Dialog
    open={filters.shortPreviewDialog}
    onClose={() => setFilters(pre => ({ ...pre, shortPreviewDialog: false }))}
    maxWidth="xl"
    fullWidth
>
    <DialogTitle>Print Preview</DialogTitle>
    <DialogContent ref={printRef}>
        {selectedRow?.Product_Array && (
            <React.Fragment>
               <table className="table table-bordered">
  <thead>
    <tr>
      <th className="fa-12 bg-light">Retailer Name</th>
      <th className="fa-12 bg-light">Do_Date</th>
      <th className="fa-12 bg-light">Delivery Person</th>
      <th className="fa-12 bg-light text-end">Amount</th>
    </tr>
  </thead>

  <tbody>
    {selectedRow?.Product_Array?.length > 0 ? (
      <>
        {selectedRow.Product_Array.map((group, gIdx) => {
          const formatDate = (d) => (d ? d.split("T")[0] : "");

 
          const totalAmount =
            group.Products_List?.reduce(
              (sum, p) => sum + Number(p.Final_Amo || 0),
              0
            ) || 0;

          
          const firstProduct = group.Products_List?.[0] || {};

          return (
            <tr key={gIdx}>
              <td className="fw-bold">
                {firstProduct.Retailer_Name || "N/A"}
              </td>
              <td className="fw-bold text-end">
                {formatDate(group.Product_Do_Date)}
              </td>
              <td className="fw-bold text-end">
                {group.Retailer_Name ||
                  firstProduct.Delivery_Person ||
                  "N/A"}
              </td>
              <td className="fw-bold text-end">
                {NumberFormat(totalAmount)}
              </td>
            </tr>
          );
        })}


        <tr>
          <td colSpan={3} className="fw-bold text-end">
            Total :
          </td>
          <td className="fw-bold text-end">
            {NumberFormat(
              selectedRow.Product_Array.reduce((acc, group) => {
                const groupTotal =
                  group.Products_List?.reduce(
                    (sum, p) => sum + Number(p.Final_Amo || 0),
                    0
                  ) || 0;
                return acc + groupTotal;
              }, 0)
            )}
          </td>
        </tr>
      </>
    ) : (
      <tr>
        <td colSpan={4} className="text-center">
          No data available
        </td>
      </tr>
    )}
  </tbody>
</table>

            </React.Fragment>
        )}
    </DialogContent>
    <DialogActions>
        <Button
            onClick={() => setFilters(pre => ({ ...pre, shortPreviewDialog: false }))}
            variant="outlined"
        >
            Close
        </Button>
    </DialogActions>
</Dialog>
            <Dialog
                open={filters.printPreviewDialog}
                onClose={() => setFilters(pre => ({ ...pre, printPreviewDialog: false }))}
                maxWidth="xl"
                fullWidth
            >
                <DialogTitle>Print Preview</DialogTitle>
                <DialogContent ref={printRef}>
                    {selectedRow?.Product_Array && (
                        <React.Fragment>
                            <table className="table table-bordered fa-13 m-0">
                                <tbody>
                                    <tr>
                                        <td colSpan={3}>DELIVERY CHALLAN</td>
                                     <td colSpan={3} > <p className='m-0 fa-14'>
  {companyInfo?.Gst_Number || companyInfo?.VAT_TIN_Number ? (
    <>
      GSTIN / UIN: 
      {companyInfo?.Gst_Number ? ` ${companyInfo.Gst_Number}` : ''}
      {companyInfo?.Gst_Number && companyInfo?.VAT_TIN_Number ? ' || ' : ''}
      {companyInfo?.VAT_TIN_Number ? ` ${companyInfo.VAT_TIN_Number}` : ''}
    </>
  ) : (
    <>GSTIN / UIN: Not Available</>
  )}
</p></td>
                                        <td colSpan={2}>ORIGINAL / DUPLICATE</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3} rowSpan={2}>
                                            <span className="fa-14 fw-bold">{companyInfo?.Company_Name}</span> <br />
                                           {companyInfo?.Company_Address}<br />
                                           
                                        </td>
                                        <td colSpan={3}>FSSAI No :</td>
                                        <td>Challan No</td>
                                        <td>{selectedRow?.Challan_No}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={3}>Phone No: 9842131353, 9786131353</td>
                                        <td>Date</td>
                                        <td>{selectedRow.Trip_Date ? LocalDate(selectedRow.Trip_Date) : ''}</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={8} className="text-center">Reason for Transfer - Branch Transfer / Line Sales / Purchase Return / Job Work</td>
                                    </tr>
                                    <tr>
                                        <td>Vehicle No</td>
                                        <td>{selectedRow?.Vehicle_No}</td>
                                        <td>Delivery Person </td>
                                        <td>
                                            {selectedRow?.Employees_Involved?.filter(staff => (
                                                staff?.Cost_Category === 'Delivery Man'
                                            ))?.map(staff => staff?.Emp_Name).join(', ')}
                                        </td>
                                        <td>Start Time</td>
                                        <td>{selectedRow?.StartTime ? LocalTime(new Date(selectedRow.StartTime)) : ''}</td>
                                        <td>Start KM</td>
                                        <td>{selectedRow?.Trip_ST_KM}</td>
                                    </tr>
                                    <tr>
                                        <td>Trip No</td>
                                        <td>{selectedRow?.Trip_No}</td>
                                        <td>LoadMan</td>
                                        <td>
                                            {selectedRow?.Employees_Involved?.filter(staff => (
                                                staff?.Cost_Category === 'Load Man'
                                            ))?.map(staff => staff?.Emp_Name).join(', ')}
                                        </td>
                                        <td>End Time</td>
                                        <td>{selectedRow?.EndTime ? LocalTime(new Date(selectedRow.EndTime)) : ''}</td>
                                        <td>End KM</td>
                                        <td>{selectedRow?.Trip_EN_KM}</td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* items */}
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th className="fa-12 bg-light">#</th>
                                        {/* <th className="fa-12 bg-light">Reason</th> */}
                                        <th className="fa-12 bg-light">Invoice_No</th>
                                        <th className="fa-12 bg-light">Party</th>
                                        {/* <th className="fa-12 bg-light">Address</th> */}
                                           <th className="fa-12 bg-light">Transporter</th>
                                        <th className="fa-12 bg-light">Item</th>
                                        <th className="fa-12 bg-light">HSN</th>
                                        {/* <th className="fa-12 bg-light">Qty</th> */}
                                         <th className="fa-12 bg-light">Act_Qty</th>
                                                <th className="fa-12 bg-light">Bill_Qty</th>
                                        {/* <th className="fa-12 bg-light">KGS</th> */}
                                        <th className="fa-12 bg-light">Rate</th>
                                        <th className="fa-12 bg-light">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>

                                 {(selectedRow?.Product_Array || [])
  .flatMap(product => product?.Products_List || [])
  .map((item, index) => (
    <tr key={index}>
      <td className="fa-10">{index + 1}</td>

      <td className="fa-10">{item.Do_Inv_No || "Delivery"}</td>

      {/* <td className="fa-10">{item?.Retailer_Name}</td> */}
      <td className="fa-10">{item.Party_Mailing_Name},{item.Party_Location} </td>

      <td className="fa-10">
        {(item?.Delivery_Staff || [])
          .filter(staff => staff.Emp_Type_Name === "Transport")
          .map(staff => staff.Emp_Name)
          .join(", ")}
      </td>

      <td className="fa-10">{item?.Product_Name}</td>

      <td className="fa-10">{item?.HSN_Code}</td>

      <td className="fa-10">
        {NumberFormat(item?.Alt_Act_Qty || 0)}
      </td>

      <td className="fa-10">
        {NumberFormat(item?.Bill_Qty || 0)}
      </td>

      <td className="fa-10">
        {NumberFormat(item?.Item_Rate || 0)}
      </td>

      <td className="fa-10">
        {NumberFormat((item?.Taxable_Rate || 0) * (item?.Bill_Qty || 0))}
      </td>
    </tr>
  ))}


  
    <tr>
  <td
    colSpan={6}
    className="border fa-14 text-end fw-bold"
  >
    Total
  </td>
 <td className="border fa-14 fw-bold">
   {(() => {
                    const totalAltActQty = (selectedRow?.Product_Array || [])
                        .flatMap(product => product?.Products_List || [])
                        .reduce((sum, item) => sum + (item.Alt_Act_Qty || 0), 0);
                    return NumberFormat(totalAltActQty);
                })()}
  </td>

   <td className="border fa-14 fw-bold">
     {(() => {
                    const totalBillQty = (selectedRow?.Product_Array || [])
                        .flatMap(product => product?.Products_List || [])
                        .reduce((sum, item) => sum + (item.Bill_Qty || 0), 0);
                    return NumberFormat(totalBillQty);
                })()}
  </td>
   <td className="border fa-14 fw-bold">
  
  </td>
  <td className="border fa-14 fw-bold">
    {NumberFormat(
      TaxData.reduce(
        (sum, item) => sum + (item.totalBeforeTax || 0),
        0
      )
    )}
  </td>
</tr>


                                </tbody>
                            </table>

                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <td className="bg-light fa-12 text-center">HSN / SAC</td>
                                        <td className="bg-light fa-12 text-center">Taxable Value</td>
                                        <td className="bg-light fa-12 text-center">IGST</td>
                                        <td className="bg-light fa-12 text-center">CGST</td>
                                        <td className="bg-light fa-12 text-center">SGST</td>
                                        <td className="bg-light fa-12 text-center">Total Tax</td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Map through aggregated data */}

                                    {TaxData.map((item, i) => (
                                        <tr key={i}>
                                            <td className="fa-10 text-end">{item.hsnCode}</td>
                                            <td className="fa-10 text-end">{NumberFormat(item.totalBeforeTax)}</td>
                                            <td className="fa-10 text-end">{NumberFormat(item.igst)}</td>
                                            <td className="fa-10 text-end">{NumberFormat(item.cgst)}</td>
                                            <td className="fa-10 text-end">{NumberFormat(item.sgst)}</td>
                                            <td className="fa-10 text-end">{NumberFormat(item.totalTax)}</td>
                                        </tr>
                                    ))}

                                    {/* Total Row */}
                                    <tr>
                                        <td className="border fa-10 text-end">Total</td>
                                        <td className="border fa-10 text-end fw-bold">
                                            {NumberFormat(TaxData.reduce((sum, item) => sum + item.totalBeforeTax, 0))}
                                        </td>
                                        <td className="border fa-10 text-end fw-bold">
                                            {NumberFormat(TaxData.reduce((sum, item) => sum + item.igst, 0))}
                                        </td>
                                        <td className="border fa-10 text-end fw-bold">
                                            {NumberFormat(TaxData.reduce((sum, item) => sum + item.cgst, 0))}
                                        </td>
                                        <td className="border fa-10 text-end fw-bold">
                                            {NumberFormat(TaxData.reduce((sum, item) => sum + item.sgst, 0))}
                                        </td>
                                        <td className="border fa-10 text-end fw-bold">
                                            {NumberFormat(TaxData.reduce((sum, item) => sum + item.totalTax, 0))}
                                        </td>
                                    </tr>

                                </tbody>
                                <td colSpan={6} className=' fa-13 fw-bold'>

                                    Tax Amount (in words) : INR &nbsp;
                                    {numberToWords(
                                        parseInt(Object.values(selectedRow?.Product_Array).reduce(
                                            (sum, item) => sum + Number(item.Total_Tax || 0), 0
                                        ))
                                    )} only.
                                </td>

                            </table>

                            <table className="table table-bordered fa-10">
                                <tbody>
                                    <tr>
                                        <td>Prepared By</td>
                                        <td style={{ minWidth: 150 }}></td>
                                        <td>Executed By</td>
                                        <td style={{ minWidth: 150 }}></td>
                                        <td>Verified By</td>
                                        <td style={{ minWidth: 150 }}></td>
                                    </tr>
                                    <tr>
                                        <td>Other Expenses</td>
                                        <td>0</td>
                                        <td>Round Off</td>
                                        <td>0</td>
                                        <td>Grand Total</td>
                                        <td className="fa-15 fw-bold">
                                         
                                            {NumberFormat(
                                                Object.values(TaxData).reduce(
                                                    (acc, item) => acc + (item.taxableValue ?? 0) + (item.igst ?? 0) + (item.cgst ?? 0) + (item.sgst ?? 0), 0
                                                )
                                            )}
                                        </td>
                                    </tr>
                                </tbody>

                            </table>

               <table className="table table-bordered fa-10">
  <tbody>
    <tr className="fw-bold">
      <td>Pack Details</td>
      <td>Count</td>
    </tr>

    {Object.entries(packSummary).map(([pack, count], index) => (
      <tr key={index}>
        <td className="fw-bold">{pack} KG</td>
        <td>Bags : {count}</td>
      </tr>
    ))}
  </tbody>
</table>



                            <td colSpan={6} className='col-12 fa-15 fw-bold'>
                                {numberToWords(
                                    parseInt(Object.values(TaxData).reduce(
                                        (acc, item) => acc + (item.taxableValue ?? 0) + (item.igst ?? 0) + (item.cgst ?? 0) + (item.sgst ?? 0), 0
                                    ))
                                )} only.
                            </td>
                            <div className="col-12 text-center">
                                <p>This is a Computer Generated Invoice</p>
                            </div>

                        </React.Fragment>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setFilters(pre => ({ ...pre, printPreviewDialog: false }))}
                        variant="outlined"
                    >
                        Close
                    </Button>
                    <Button
                        startIcon={<Download />}
                        variant="outlined"
                        onClick={handlePrint}
                    >
                        Download
                    </Button>
                </DialogActions>
            </Dialog>

<Dialog
    open={filters?.ItemPreviewDialog}
    onClose={() => setFilters(pre => ({ ...pre, ItemPreviewDialog: false }))}
    maxWidth="md"
    fullWidth
>
    <DialogTitle>Products Summary</DialogTitle>
    <DialogContent>
        {/* Only render printable content when dialog is open */}
        {filters?.ItemPreviewDialog && (
            <div ref={itemPreviewPrintRef}>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #ddd' }}>Product Name</th>
                            <th style={{ padding: '12px', textAlign: 'right', border: '1px solid #ddd' }}>Total Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(() => {
                            const productMap = new Map();
                            
                            selectedRow?.Product_Array?.forEach(delivery => {
                                delivery.Products_List?.forEach(product => {
                                    const key = product.Item_Id;
                                    if (productMap.has(key)) {
                                        const existing = productMap.get(key);
                                        productMap.set(key, {
                                            ...existing,
                                            totalQty: existing.totalQty + (product.Act_Qty || product.Bill_Qty || 0)
                                        });
                                    } else {
                                        productMap.set(key, {
                                            productName: product.Product_Name,
                                            totalQty: product.Act_Qty || product.Bill_Qty || 0,
                                            unit: product.Unit_Name,
                                            itemId: product.Item_Id
                                        });
                                    }
                                });
                            });

                            const groupedProducts = Array.from(productMap.values());
                            
                            return groupedProducts.map((product, index) => (
                                <tr key={index}>
                                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{product.productName}</td>
                                    <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #ddd' }}>{product.totalQty}</td>
                                </tr>
                            ));
                        })()}
                    </tbody>
                </table>

                {(!selectedRow?.Product_Array || selectedRow.Product_Array.length === 0) && (
                    <p style={{ textAlign: 'center', padding: '20px' }}>
                        No product data available
                    </p>
                )}
            </div>
        )}
    </DialogContent>
    <DialogActions>
        <Button onClick={() => setFilters(pre => ({ ...pre, ItemPreviewDialog: false }))} color="primary">
            Close
        </Button>
        <Button
            startIcon={<Download />}
            variant="outlined"
            onClick={handleItemPreviewPrint}
            disabled={!selectedRow?.Product_Array || selectedRow.Product_Array.length === 0}
        >
            Download
        </Button>
    </DialogActions>
</Dialog>
            <Dialog open={deleteDialog} onClose={closeDeleteDialog} fullWidth maxWidth="sm">
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <p>Are you sure you want to delete this item?</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDeleteDialog}>Cancel</Button>

                    <Button onClick={handleDeleteConfirm} variant="contained" color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* <h6 className="m-0 text-end text-muted px-3">Total Invoice Amount ({tripData?.length}) : {Total_Invoice_value}</h6> */}
        </>
    )
}


export default TripSheets;