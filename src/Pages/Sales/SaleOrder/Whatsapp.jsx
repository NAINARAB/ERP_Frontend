// import { useState, useEffect, useMemo, useRef } from "react";
// import { checkIsNumber, isEqualNumber, ISOString, toArray, toNumber, RoundNumber, NumberFormat, LocalDateWithTime } from "../../../Components/functions";
// import { fetchLink } from "../../../Components/fetchComponent";
// import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
// import {
//     Autocomplete,
//     Button,
//     Checkbox,
//     Select as MuiSelect,
//     MenuItem,
//     Dialog,
//     DialogActions,
//     DialogContent,
//     DialogTitle,
//     IconButton,
//     Typography,
//     TextField,
//     Tooltip,
//     Box,
//     Divider,
//     Snackbar,
//     Alert,
//     Radio,
//     RadioGroup,
//     InputLabel,
//     FormControl,
//     FormControlLabel,
//     Menu,
//     ListItemIcon,
//     ListItemText,
//     CircularProgress,
//     Tab,
//     Tabs,
// } from "@mui/material";
// import Select from "react-select";
// import { customSelectStyles } from "../../../Components/tablecolumn";
// import { reactSelectFilterLogic } from "../../../Components/functions";
// import {
//     CheckBox,
//     CheckBoxOutlineBlank,
//     FilterAlt,
//     PersonAdd,
//     Print,
//     Search,
//     HourglassEmpty,
//     Download,
//     PictureAsPdf,
//     TableChart,
//     ArrowDropDown
// } from "@mui/icons-material";
// import { toast } from "react-toastify";
// import { useReactToPrint } from "react-to-print";
// import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
// import WhatsAppIcon from '@mui/icons-material/WhatsApp';
// import { DotPeWhatsAppService } from "../../../Components/dotpeWhatsappService";
// import { Dot_Pe_Number } from "../../../encryptionKey";
// import api from "../../../API";
// import jsPDF from 'jspdf';
// import 'jspdf-autotable';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';

// const icon = <CheckBoxOutlineBlank fontSize="small" />;
// const checkedIcon = <CheckBox fontSize="small" />;

// const multipleStaffUpdateInitialValues = {
//     CostCategory: { label: "", value: "" },
//     Do_Id: [],
//     involvedStaffs: [],
//     staffInvolvedStatus: 0,
//     deliveryStatus: 5,
// };

// const multipleStaffRemoveInitialValues = {
//     CostCategory: { label: "", value: "" },
//     Do_Id: [],
//     involvedStaffs: [],
//     staffInvolvedStatus: 0,
//     deliveryStatus: 5,
// };

// const normalize = (v) => String(v ?? "").toLowerCase().trim();

// const uniqueCaseInsensitive = (values) => {
//     const map = new Map();
//     for (const v of values) {
//         const s = String(v ?? "").trim();
//         if (!s) continue;
//         const key = s.toLowerCase();
//         if (!map.has(key)) map.set(key, s);
//     }
//     return Array.from(map.values());
// };

// const getCostTypeEmployees = (invoiceOrRow, costTypeId) => {
//     const invoiceEmployee = toArray(invoiceOrRow?.involvedStaffs);
//     return invoiceEmployee
//         .filter((emp) => isEqualNumber(emp.Emp_Type_Id, costTypeId))
//         .map((emp) => String(emp.Emp_Name ?? "").trim())
//         .filter(Boolean);
// };

// const generateUniqueClientRefId = (prefix, invoiceNo) => {
//     const cleanInvoiceNo = String(invoiceNo || 'unknown')
//         .replace(/[^a-zA-Z0-9]/g, '_')
//         .slice(-8);
    
//     const timestamp = Date.now().toString().slice(-8);
//     const randomString = Math.random().toString(36).substring(2, 6);
    
//     return `${prefix}_${cleanInvoiceNo}_${timestamp}_${randomString}`;
// };

// const Whatsapp = ({ loadingOn, loadingOff, AddRights, EditRights, PrintRights, pageID }) => {
//     // State declarations
//     const [salesInvoices, setSalesInvoices] = useState([]);
//     const [allInvoices, setAllInvoices] = useState([]);
//     const [allSalesInvoices, setAllSalesInvoices] = useState([]);
//     const [allSalesOrders, setAllSalesOrders] = useState([]);
//     const [allReceipts, setAllReceipts] = useState([]);
//     const [priceListRetailers, setPriceListRetailers] = useState([]);
//     const [filteredPriceListRetailers, setFilteredPriceListRetailers] = useState([]);
//     const [costCenterData, setCostCenterData] = useState([]);
//     const [costTypes, setCostTypes] = useState([]);
//     const [uniqueInvolvedCost, setUniqueInvolvedCost] = useState([]);
//     const [viewMode, setViewMode] = useState('normal');
//     const [isLoading, setIsLoading] = useState(true);
//     const [isRefreshing, setIsRefreshing] = useState(false);
//     const [hasInitialLoading, setHasInitialLoading] = useState(false);
//     const [currentPrintType, setCurrentPrintType] = useState('');
//     const [selectAllCheckBox, setSelectAllCheckBox] = useState(false);
//     const [downloadLoading, setDownloadLoading] = useState(false);
//     const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);
//     const [phoneMap, setPhoneMap] = useState(new Map());
//     const [isPhoneMapLoaded, setIsPhoneMapLoaded] = useState(false);
//     const [initialDataLoaded, setInitialDataLoaded] = useState(false);
//     const [activeTab, setActiveTab] = useState('sale_invoice');
//     const tableContainerRef = useRef(null);
//     const [sendingStates, setSendingStates] = useState({});
//     const [receiptFilters, setReceiptFilters] = useState({
//         Fromdate: ISOString(),
//         Todate: ISOString(),
//         voucher: '',
//         debit: '',
//         credit: '',
//         createdBy: '',
//         status: '',
//         receipt_type: ''
//     });

//     const storage = JSON.parse(localStorage.getItem("user"));
//     const [pdfGeneration, setPdfGeneration] = useState({
//         loading: false,
//         pdfUrl: null, token: null,
//         fileName: null,
//         error: null
//     });

//     const [multipleCostCenterUpdateValues, setMultipleCostCenterUpdateValues] = useState(
//         multipleStaffUpdateInitialValues
//     );

//     const [multipleStaffRemoveValues, setMultipleStaffRemoveValues] = useState(
//         multipleStaffRemoveInitialValues
//     );

//     const handleDownloadClick = (event) => {
//         setDownloadAnchorEl(event.currentTarget);
//     };

//     const [printReady, setPrintReady] = useState(false);
//     const [columnFilters, setColumnFilters] = useState({});
//     const [filteredData, setFilteredData] = useState([]);

//     const [deliverySlipPrint, setDeliverySlipPrint] = useState({
//         Do_Id: null,
//         Do_Date: null,
//         open: false
//     });

//     const [whatsappDialog, setWhatsappDialog] = useState({
//         open: false,
//         order: null,
//         loading: false,
//         method: 'direct',
//     });

//     const [templates, setTemplates] = useState([]);
//     const [selectedTemplate, setSelectedTemplate] = useState("");
//     const [snackbar, setSnackbar] = useState({
//         open: false,
//         message: "",
//         severity: "success",
//     });

//     const [filters, setFilters] = useState({
//         reqDate: ISOString(),
//         assignDialog: false,
//         filterDialog: false,
//         selectedInvoice: null,
//         multipleStaffUpdateDialog: false,
//         multipleStaffRemoveDialog: false,
//         fetchTrigger: 0,
//         docType: "",
//         staffStatus: 0,
//     });

//     const [multiPrint, setMultiPrint] = useState({
//         open: false,
//         doIds: [],
//         docType: ""
//     });

//     const multiPrintRef = useRef(null);

//     const pdfTemplates = useMemo(() => {
//         return (templates || []).filter(t => {
//             const templateName = t.templateName || t.name || '';
//             return templateName.toLowerCase().includes('pdf') ||
//                 templateName.toLowerCase().includes('invoice');
//         });
//     }, [templates]);

//     const otherTemplates = useMemo(() => {
//         return (templates || []).filter(t => {
//             const templateName = t.templateName || t.name || '';
//             return !(templateName.toLowerCase().includes('pdf') ||
//                 templateName.toLowerCase().includes('invoice'));
//         });
//     }, [templates]);

//     const columns = useMemo(
//         () => [
//             { Field_Name: "DocumentNumber", Fied_Data: "string", ColumnHeader: "Document No" },
//             { Field_Name: "voucherTypeGet", Fied_Data: "string", ColumnHeader: "Type" },
//             { Field_Name: "retailerNameGet", Fied_Data: "string", ColumnHeader: "Customer" },
//         ],
//         []
//     );

//     const calculateAltActQty = (item) => {
//         if (item.Alt_Act_Qty !== undefined && item.Alt_Act_Qty !== null) {
//             return Number(item.Alt_Act_Qty) || 0;
//         }
//         const billQty = Number(item.Bill_Qty) || 0;
//         const conversionFactor = Number(item.PackValue) || 1;
//         const possibleAltFields = ['AltQty', 'Alt_Act_Qty', 'Alt_Qty', 'Alternate_Qty', 'Actual_Qty'];
//         for (const field of possibleAltFields) {
//             if (item[field] !== undefined && item[field] !== null) {
//                 return Number(item[field]) || 0;
//             }
//         }
//         return billQty * conversionFactor;
//     };

//     const fetchPhoneMap = async () => {
//         try {
//             const response = await fetchLink({ address: `masters/getlolDetails` });
//             if (response && response.success && response.data) {
//                 const map = new Map();
//                 response.data.forEach(item => {
//                     if (item.A1) map.set(Number(item.Ret_Id), item.A1);
//                 });
//                 setPhoneMap(map);
//                 setIsPhoneMapLoaded(true);
//                 return map;
//             }
//             return new Map();
//         } catch (error) {
//             console.error("Error fetching phone numbers:", error);
//             setIsPhoneMapLoaded(true);
//             return new Map();
//         }
//     };

//     const fetchReceipts = async () => {
//         try {
//             setIsLoading(true);
//             const params = new URLSearchParams({
//                 Fromdate: receiptFilters.Fromdate,
//                 Todate: receiptFilters.Todate,
//                 voucher: receiptFilters.voucher,
//                 debit: receiptFilters.debit,
//                 credit: receiptFilters.credit,
//                 createdBy: receiptFilters.createdBy,
//                 status: receiptFilters.status,
//                 receipt_type: receiptFilters.receipt_type
//             });
            
//             const response = await fetchLink({
//                 address: `receipt/receiptMasterwithLol?${params.toString()}`,
//                 loadingOn,
//                 loadingOff,
//             });
            
//             if (response && response.success && response.data) {
//                 const processedReceipts = toArray(response.data).map(receipt => ({
//                     ...receipt,
//                     DocumentType: 'Receipt',
//                     DocumentId: receipt.Receipt_Id || receipt.Id,
//                     DocumentNumber: receipt.Receipt_No || receipt.Voucher_No,
//                     DocumentDate: receipt.Receipt_Date || receipt.Created_Date,
//                     voucherTypeGet: 'Receipt',
//                     retailerNameGet: receipt.Customer_Name || receipt.Retailer_Name,
//                     Retailer_Id: receipt.Retailer_Id,
//                     Total_Invoice_value: receipt.Amount || receipt.Receipt_Amount || 0,
//                     createdOn: receipt.Created_Date || receipt.Receipt_Date,
//                     Narration: receipt.Narration || receipt.Remarks,
//                     Status: receipt.Status || 'Completed',
//                     Payment_Mode: receipt.Payment_Mode || receipt.Payment_Type,
//                     Bank_Name: receipt.Bank_Name,
//                     Cheque_No: receipt.Cheque_No,
//                     A1_Phone: phoneMap.get(Number(receipt.Retailer_Id)) || receipt.Phone_No || 'Not Available',
//                     stockDetails: receipt.stockDetails || [],
//                     involvedStaffs: receipt.involvedStaffs || [],
//                     staffInvolvedStatus: receipt.staffInvolvedStatus || 0
//                 }));
//                 setAllReceipts(processedReceipts);
//                 if (activeTab === 'receipt_list') {
//                     setFilteredData(processedReceipts);
//                 }
//             } else {
//                 setAllReceipts([]);
//                 if (activeTab === 'receipt_list') {
//                     setFilteredData([]);
//                 }
//                 toast.info("No receipts found for the selected criteria");
//             }
//         } catch (error) {
//             console.error("Error fetching receipts:", error);
//             toast.error("Failed to load receipts data");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const fetchRetailersWithLOL = async () => {
//         try {
//             setIsLoading(true);
//             const response = await fetchLink({
//                 address: "masters/retailerswithlol",
//                 loadingOn,
//                 loadingOff,
//             });
            
//             if (response && response.success && response.data) {
//                 const processedRetailers = toArray(response.data).map(retailer => ({
//                     ...retailer,
//                     DocumentType: 'PriceList',
//                     DocumentId: retailer.Ret_Id,
//                     DocumentNumber: `PL_${retailer.Ret_Id}`,
//                     retailerNameGet: retailer.Retailer_Name,
//                     A1_Phone: phoneMap.get(Number(retailer.Ret_Id)) || retailer.A1 || 'Not Available',
//                     Retailer_Id: retailer.Ret_Id,
//                     Customer_Phone: retailer.A1 || 'Not Available'
//                 }));
//                 setPriceListRetailers(processedRetailers);
//                 setFilteredPriceListRetailers(processedRetailers);
//             } else {
//                 toast.error("Failed to load price list data");
//             }
//         } catch (error) {
//             console.error("Error fetching retailers with LOL:", error);
//             toast.error("Failed to load price list data");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const fetchAllInvoices = async (refresh = false) => {
//         try {
//             if (!refresh) setIsLoading(true);
//             else setIsRefreshing(true);
//             setViewMode('normal');
            
//             const [salesInvoiceResponse, salesOrderResponse] = await Promise.all([
//                 fetchLink({
//                     address: `sales/salesInvoice/lrReportWhatsapp?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`,
//                     loadingOn,
//                     loadingOff,
//                 }),
//                 fetchLink({
//                     address: `sales/salesOrder/lrReportWhatsapp?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`,
//                     loadingOn,
//                     loadingOff,
//                 })
//             ]);
            
//             const salesInvoicesData = toArray(salesInvoiceResponse?.data || []);
//             const processedSalesInvoices = salesInvoicesData.map(invoice => ({
//                 ...invoice,
//                 DocumentType: 'SalesInvoice',
//                 DocumentId: invoice.Do_Id,
//                 DocumentNumber: invoice.Do_Inv_No,
//                 DocumentDate: invoice.Do_Date,
//                 A1_Phone: phoneMap.get(Number(invoice.Retailer_Id)) || invoice.A1 || 'Not Available',
//                 ...(invoice.stockDetails && Array.isArray(invoice.stockDetails) ? {
//                     stockDetails: invoice.stockDetails.map(item => ({
//                         ...item,
//                         Alt_Act_Qty: calculateAltActQty(item)
//                     }))
//                 } : {})
//             }));
            
//             const salesOrdersData = toArray(salesOrderResponse?.data || []);
//             const processedSalesOrders = salesOrdersData.map(order => ({
//                 ...order,
//                 DocumentType: 'SalesOrder',
//                 DocumentId: order.So_Id || order.Id,
//                 DocumentNumber: order.So_Inv_No || order.Invoice_No,
//                 DocumentDate: order.So_Date || order.Invoice_Date,
//                 voucherTypeGet: order.voucherTypeGet || 'Sales Order',
//                 retailerNameGet: order.retailerNameGet,
//                 Retailer_Id: order.Retailer_Id,
//                 Total_Invoice_value: order.Total_Invoice_value,
//                 createdOn: order.createdOn,
//                 Narration: order.Narration,
//                 Delivery_Status: order.Conversion_Status || 'Not Converted',
//                 stockDetails: order.stockDetails || [],
//                 involvedStaffs: order.involvedStaffs || [],
//                 staffInvolvedStatus: order.staffInvolvedStatus || 0,
//                 Conversion_Status: order.Conversion_Status,
//                 Invoice_Type: order.Invoice_Type,
//                 A1_Phone: phoneMap.get(Number(order.Retailer_Id)) || order.A1 || 'Not Available'
//             }));
            
//             setAllSalesInvoices(processedSalesInvoices);
//             setAllSalesOrders(processedSalesOrders);
            
//             const allCombined = [...processedSalesInvoices, ...processedSalesOrders];
//             setAllInvoices(allCombined);
            
//             setCostTypes(toArray(salesInvoiceResponse?.others?.costTypes || salesOrderResponse?.others?.costTypes));
//             setUniqueInvolvedCost(toArray(salesInvoiceResponse?.others?.uniqeInvolvedStaffs || salesOrderResponse?.others?.uniqeInvolvedStaffs));
            
//             if (activeTab === 'sale_invoice') {
//                 setSalesInvoices(processedSalesInvoices);
//                 setFilteredData(processedSalesInvoices);
//             } else if (activeTab === 'sale_order') {
//                 setSalesInvoices(processedSalesOrders);
//                 setFilteredData(processedSalesOrders);
//             } else if (activeTab !== 'receipt_list') {
//                 setSalesInvoices(processedSalesInvoices);
//                 setFilteredData(processedSalesInvoices);
//             }
            
//             if (!hasInitialLoading) setHasInitialLoading(true);
//         } catch (error) {
//             console.error("Error fetching data:", error);
//             toast.error("Failed to load data");
//         } finally {
//             if (!refresh) setIsLoading(false);
//             setIsRefreshing(false);
//         }
//     };

//     const fetchPendingInvoices = async () => {
//         try {
//             setIsLoading(true);
//             setViewMode('pending');
            
//             const [salesInvoiceResponse, salesOrderResponse] = await Promise.all([
//                 fetchLink({
//                     address: `sales/salesInvoice/pendingDetails?reqDate=${filters.reqDate}`,
//                     loadingOn,
//                     loadingOff,
//                 }),
//                 fetchLink({
//                     address: `sales/salesOrder/pendingDetails?reqDate=${filters.reqDate}`,
//                     loadingOn,
//                     loadingOff,
//                 })
//             ]);
            
//             const salesInvoicesData = toArray(salesInvoiceResponse?.data || []);
//             const processedSalesInvoices = salesInvoicesData.map(invoice => ({
//                 ...invoice,
//                 DocumentType: 'SalesInvoice',
//                 DocumentId: invoice.Do_Id,
//                 DocumentNumber: invoice.Do_Inv_No,
//                 DocumentDate: invoice.Do_Date,
//                 A1_Phone: phoneMap.get(Number(invoice.Retailer_Id)) || invoice.A1 || 'Not Available',
//                 ...(invoice.stockDetails && Array.isArray(invoice.stockDetails) ? {
//                     stockDetails: invoice.stockDetails.map(item => ({
//                         ...item,
//                         Alt_Act_Qty: calculateAltActQty(item)
//                     }))
//                 } : {})
//             }));
            
//             const salesOrdersData = toArray(salesOrderResponse?.data || []);
//             const processedSalesOrders = salesOrdersData.map(order => ({
//                 ...order,
//                 DocumentType: 'SalesOrder',
//                 DocumentId: order.So_Id || order.Id,
//                 DocumentNumber: order.So_Inv_No || order.Invoice_No,
//                 DocumentDate: order.So_Date || order.Invoice_Date,
//                 voucherTypeGet: order.voucherTypeGet || 'Sales Order',
//                 retailerNameGet: order.retailerNameGet,
//                 Retailer_Id: order.Retailer_Id,
//                 Total_Invoice_value: order.Total_Invoice_value,
//                 createdOn: order.createdOn,
//                 Narration: order.Narration,
//                 Delivery_Status: order.Conversion_Status || 'Pending',
//                 stockDetails: order.stockDetails || [],
//                 involvedStaffs: order.involvedStaffs || [],
//                 staffInvolvedStatus: order.staffInvolvedStatus || 0,
//                 Conversion_Status: order.Conversion_Status,
//                 Invoice_Type: order.Invoice_Type,
//                 A1_Phone: phoneMap.get(Number(order.Retailer_Id)) || order.A1 || 'Not Available'
//             }));
            
//             setAllSalesInvoices(processedSalesInvoices);
//             setAllSalesOrders(processedSalesOrders);
            
//             if (activeTab === 'sale_invoice') {
//                 setSalesInvoices(processedSalesInvoices);
//                 setFilteredData(processedSalesInvoices);
//             } else if (activeTab === 'sale_order') {
//                 setSalesInvoices(processedSalesOrders);
//                 setFilteredData(processedSalesOrders);
//             } else if (activeTab !== 'receipt_list') {
//                 setSalesInvoices(processedSalesInvoices);
//                 setFilteredData(processedSalesInvoices);
//             }
            
//             if (salesInvoiceResponse?.others?.costTypes) {
//                 setCostTypes(toArray(salesInvoiceResponse?.others?.costTypes));
//             }
//             if (salesInvoiceResponse?.others?.uniqeInvolvedStaffs) {
//                 setUniqueInvolvedCost(toArray(salesInvoiceResponse?.others?.uniqeInvolvedStaffs));
//             }
//         } catch (error) {
//             console.error("Error fetching pending data:", error);
//             toast.error("Failed to load pending data");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const fetchTemplates = async () => {
//         try {
//             const response = await DotPeWhatsAppService.fetchTemplates('APPROVED');
//             if (response.status && response.data) {
//                 let templatesData = [];
//                 if (Array.isArray(response.data)) templatesData = response.data;
//                 else if (response.data.data && Array.isArray(response.data.data)) templatesData = response.data.data;
//                 else if (response.data.templates && Array.isArray(response.data.templates)) templatesData = response.data.templates;
//                 if (templatesData.length > 0) {
//                     setTemplates(templatesData);
//                     templatesData.forEach(template => {
//                         const name = template.templateName || template.name || '';
//                         if (name.includes('sales_invoice_order')) setSelectedTemplate(name);
//                     });
//                 }
//             }
//         } catch (error) {
//             console.error('Failed to fetch templates:', error);
//         }
//     };

//     const fetchCostCenterData = async () => {
//         try {
//             const costCenterData = await fetchLink({ address: "masters/erpCostCenter/dropDown" });
//             setCostCenterData(toArray(costCenterData.data));
//         } catch (error) {
//             console.error("Error fetching cost center data:", error);
//             toast.error("Failed to load cost center data");
//         }
//     };

//     useEffect(() => {
//         const initializeData = async () => {
//             try {
//                 setIsLoading(true);
//                 await fetchPhoneMap();
//                 await fetchAllInvoices();
//                 await fetchCostCenterData();
//                 setInitialDataLoaded(true);
//             } catch (error) {
//                 console.error("Error fetching initial data:", error);
//                 toast.error("Failed to load initial data");
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         initializeData();
//         fetchTemplates();
//     }, []);

//     useEffect(() => {
//         if (isPhoneMapLoaded && (allSalesInvoices.length > 0 || allSalesOrders.length > 0) && !initialDataLoaded) {
//             const processedSalesInvoices = allSalesInvoices.map(invoice => ({
//                 ...invoice,
//                 A1_Phone: phoneMap.get(Number(invoice.Retailer_Id)) || invoice.A1 || 'Not Available',
//                 ...(invoice.stockDetails && Array.isArray(invoice.stockDetails) ? {
//                     stockDetails: invoice.stockDetails.map(item => ({
//                         ...item,
//                         Alt_Act_Qty: calculateAltActQty(item)
//                     }))
//                 } : {})
//             }));
            
//             const processedSalesOrders = allSalesOrders.map(order => ({
//                 ...order,
//                 A1_Phone: phoneMap.get(Number(order.Retailer_Id)) || order.A1 || 'Not Available',
//                 ...(order.stockDetails && Array.isArray(order.stockDetails) ? {
//                     stockDetails: order.stockDetails.map(item => ({
//                         ...item,
//                         Alt_Act_Qty: calculateAltActQty(item)
//                     }))
//                 } : {})
//             }));
            
//             setAllSalesInvoices(processedSalesInvoices);
//             setAllSalesOrders(processedSalesOrders);
    
//             if (activeTab === 'sale_invoice') {
//                 setSalesInvoices(processedSalesInvoices);
//                 setFilteredData(processedSalesInvoices);
//             } else if (activeTab === 'sale_order') {
//                 setSalesInvoices(processedSalesOrders);
//                 setFilteredData(processedSalesOrders);
//             }
//         }
//     }, [isPhoneMapLoaded, allSalesInvoices, allSalesOrders, initialDataLoaded, activeTab]);

//     useEffect(() => {
//         if (isPhoneMapLoaded && priceListRetailers.length > 0) {
//             const updatedRetailers = priceListRetailers.map(retailer => ({
//                 ...retailer,
//                 A1_Phone: phoneMap.get(Number(retailer.Ret_Id)) || retailer.A1 || 'Not Available'
//             }));
//             setPriceListRetailers(updatedRetailers);
//             setFilteredPriceListRetailers(updatedRetailers);
//         }
//     }, [isPhoneMapLoaded]);

//     useEffect(() => {
//         if (initialDataLoaded) {
//             if (viewMode === 'normal') fetchAllInvoices(true);
//             else if (viewMode === 'pending') fetchPendingInvoices();
//         }
//     }, [filters.fetchTrigger, filters.staffStatus, filters.reqDate, viewMode, initialDataLoaded]);

//     useEffect(() => {
//         if (multiPrint.open) {
//             const timer = setTimeout(() => {
//                 if (multiPrintRef.current) setPrintReady(true);
//             }, 300);
//             return () => clearTimeout(timer);
//         } else {
//             setPrintReady(false);
//         }
//     }, [multiPrint.open, multiPrint.doIds, multiPrint.docType]);

//     const showSnackbar = (message, severity = "success") => {
//         setSnackbar({ open: true, message, severity });
//     };

//     const closeWhatsAppDialog = () => {
//         setWhatsappDialog({ open: false, order: null, loading: false, method: 'direct' });
//         setSelectedTemplate("");
//     };

//     const getPDFUrlSimple = (order) => {
//         const baseUrl = api;
//         const formattedInvoiceNo = order.DocumentNumber ? order.DocumentNumber.replace(/_/g, '/') : '';
//         const encodedInvoiceNo = btoa(formattedInvoiceNo);
//         const companyid = btoa(storage?.Company_id);
//         return `https://printapp.erpsmt.in/sales/downloadPdf?Do_Inv_No=${encodedInvoiceNo}&Company_id=${companyid}`;
//     };

//     const generateInvoicePDF = async (order, companyId) => {
//         try {
//             const requestBody = {
//                 invoiceId: order.DocumentNumber,
//                 companyId: companyId,
//                 invoiceData: {
//                     Do_Inv_No: order.DocumentNumber,
//                     Total_Invoice_value: order.Total_Invoice_value || 0,
//                     retailerNameGet: order.retailerNameGet || order.Retailer_Name || 'Customer',
//                     Do_Date: order.Do_Date || order.DocumentDate,
//                     So_No: order.So_No || order.Do_No || 'N/A',
//                     Retailer_Name: order.Retailer_Name || order.retailerNameGet,
//                     Retailer_Address: order.Retailer_Address || 'Address not available',
//                     Retailer_GSTIN: order.Retailer_GSTIN || 'Not Available',
//                     CSGT_Total: order.CSGT_Total || 0,
//                     SGST_Total: order.SGST_Total || 0,
//                     IGST_Total: order.IGST_Total || 0,
//                     Round_off: order.Round_off || 0,
//                     CSGT_Percentage: order.CSGT_Percentage || 0,
//                     SGST_Percentage: order.SGST_Percentage || 0,
//                     IGST_Percentage: order.IGST_Percentage || 0,
//                     stockDetails: order.stockDetails || order.ProductList || []
//                 }
//             };
//             const response = await fetchLink({
//                 address: "sales/generatePdf",
//                 method: "POST",
//                 bodyData: requestBody,
//                 loadingOn,
//                 loadingOff,
//             });
//             return response;
//         } catch (error) {
//             console.error('Error generating PDF:', error);
//             throw error;
//         }
//     };

//     const generateAndStorePDF = async (order) => {
//         try {
//             setPdfGeneration({ loading: true, pdfUrl: null, error: null });
//             const storage = JSON.parse(localStorage.getItem("user"));
//             const companyId = storage?.Company_id;
//             if (!companyId) throw new Error('Company ID not found');
//             const response = await generateInvoicePDF(order, companyId);
//             if (response.success && response.data) {
//                 const pdfUrl = response.data.pdfUrl;
//                 setPdfGeneration({
//                     loading: false,
//                     pdfUrl: pdfUrl,
//                     token: response.data.token,
//                     fileName: response.data.fileName,
//                     error: null
//                 });
//                 return { pdfUrl: pdfUrl, token: response.data.token, fileName: response.data.fileName };
//             } else {
//                 throw new Error(response.message || 'Failed to generate PDF');
//             }
//         } catch (error) {
//             console.error('Error generating PDF:', error);
//             setPdfGeneration({ loading: false, pdfUrl: null, error: error.message });
//             throw error;
//         }
//     };

//     const sendSaleInvoiceWhatsApp = async (row) => {
//         const invoiceId = row.DocumentId;
//         setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
        
//         try {
//             const retailerId = Number(row?.Retailer_Id);
//             let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
            
//             if (!recipientPhone) {
//                 toast.error('Customer phone number not found');
//                 return false;
//             }

//             recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
//             if (recipientPhone.startsWith('0')) {
//                 recipientPhone = recipientPhone.substring(1);
//             }
//             if (!recipientPhone.startsWith('91')) {
//                 recipientPhone = `91${recipientPhone}`;
//             }

//             const pdfUrl = getPDFUrlSimple(row);
//             const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
//             const invoiceNo = row.DocumentNumber || 'N/A';
//             const formattedDate = new Date(row.Do_Date || row.DocumentDate || row.createdOn).toLocaleDateString('en-GB');
//             const totalAmount = Number(row.Total_Invoice_value || 0).toFixed(2);
//             const companyName = storage?.Company_id == 1 ? "SM TRADERS" : "MOBITE";
            
//             const uniqueClientRefId = generateUniqueClientRefId('inv', invoiceNo);
            
//             const payload = {
//                 template: {
//                     name: "sales_invoice_order",
//                     language: "en"
//                 },
//                 source: "crm",
//                 wabaNumber: Dot_Pe_Number,
//                 recipients: [recipientPhone],
//                 clientRefId: uniqueClientRefId,
//                 params: {
//                     body: [
//                         customerName,
//                         invoiceNo,
//                         formattedDate,
//                         totalAmount,
//                         companyName,
//                         pdfUrl
//                     ]
//                 }
//             };
            
//             const response = await DotPeWhatsAppService.sendTemplateMessage(payload);
//             if (response?.status) {
//                 toast.success('Sale invoice sent successfully via WhatsApp!');
//                 return true;
//             } else {
//                 throw new Error(response?.message || 'Failed to send message');
//             }
//         } catch (error) {
//             console.error('Error sending WhatsApp:', error);
//             toast.error(`Failed to send message: ${error.message}`);
//             return false;
//         } finally {
//             setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
//         }
//     };

//     const sendPriceListWhatsApp = async (row) => {
//         const retailerId = row.DocumentId;
//         setSendingStates(prev => ({ ...prev, [retailerId]: true }));
        
//         try {
//             let recipientPhone = phoneMap.get(Number(row.Retailer_Id)) || row?.A1 || row?.Customer_Phone;
            
//             if (!recipientPhone) {
//                 toast.error('Customer phone number not found');
//                 return false;
//             }

//             recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
//             if (recipientPhone.startsWith('0')) {
//                 recipientPhone = recipientPhone.substring(1);
//             }
//             if (!recipientPhone.startsWith('91')) {
//                 recipientPhone = `91${recipientPhone}`;
//             }

//             const companyId = storage?.Company_id;
//             const encodedCompanyId = btoa(companyId);
//             const priceListLink = `https://printapp.erpsmt.in/rateMaster?Company_id=${encodedCompanyId}`;
            
//             const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
            
//             const uniqueClientRefId = generateUniqueClientRefId('plist', `retailer_${row.Ret_Id}`);
            
//             const payload = {
//                 template: {
//                     name: "price_list",
//                     language: "en"
//                 },
//                 source: "crm",
//                 wabaNumber: Dot_Pe_Number,
//                 recipients: [recipientPhone],
//                 clientRefId: uniqueClientRefId,
//                 params: {
//                     body: [
//                         customerName, 
//                         priceListLink  
//                     ]
//                 }
//             };
            
//             const response = await DotPeWhatsAppService.sendTemplateMessage(payload);
//             if (response?.status) {
//                 toast.success('Price list sent successfully via WhatsApp!');
//                 return true;
//             } else {
//                 throw new Error(response?.message || 'Failed to send message');
//             }
//         } catch (error) {
//             console.error('Error sending price list:', error);
//             toast.error(`Failed to send price list: ${error.message}`);
//             return false;
//         } finally {
//             setSendingStates(prev => ({ ...prev, [retailerId]: false }));
//         }
//     };

//     const sendSaleOrderWhatsApp = async (row) => {
//         const invoiceId = row.DocumentId;
//         setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
        
//         try {
//             const retailerId = Number(row?.Retailer_Id);
//             let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
            
//             if (!recipientPhone) {
//                 toast.error('Customer phone number not found');
//                 return false;
//             }

//             recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
//             if (recipientPhone.startsWith('0')) {
//                 recipientPhone = recipientPhone.substring(1);
//             }
//             if (!recipientPhone.startsWith('91')) {
//                 recipientPhone = `91${recipientPhone}`;
//             }

//             const pdfUrl = 'https://order.erpsmt.in/';
//             const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
//             const invoiceNo = row.DocumentNumber || 'N/A';
//             const formattedDate = new Date(row.So_Date || row.DocumentDate || row.createdOn).toLocaleDateString('en-GB');
//             const totalAmount = Number(row.Total_Invoice_value || 0).toFixed(2);
//             const companyName = storage?.Company_id == 1 ? "SM TRADERS" : "MOBITE";
            
//             const uniqueClientRefId = generateUniqueClientRefId('sord', invoiceNo);
            
//             const payload = {
//                 template: {
//                     name: "sale_order",
//                     language: "en"
//                 },
//                 source: "crm",
//                 wabaNumber: Dot_Pe_Number,
//                 recipients: [recipientPhone],
//                 clientRefId: uniqueClientRefId,
//                 params: {
//                     body: [
//                         customerName,
//                         invoiceNo,
//                         formattedDate,
//                         totalAmount,
//                         companyName,
//                         pdfUrl
//                     ]
//                 }
//             };
            
//             const response = await DotPeWhatsAppService.sendTemplateMessage(payload);
//             if (response?.status) {
//                 toast.success('Sale order sent successfully via WhatsApp!');
//                 return true;
//             } else {
//                 throw new Error(response?.message || 'Failed to send message');
//             }
//         } catch (error) {
//             console.error('Error sending sale order:', error);
//             toast.error(`Failed to send sale order: ${error.message}`);
//             return false;
//         } finally {
//             setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
//         }
//     };

//     const sendReceiptWhatsApp = async (row) => {
//         const receiptId = row.DocumentId;
//         setSendingStates(prev => ({ ...prev, [receiptId]: true }));
        
//         try {
//             const retailerId = Number(row?.Retailer_Id);
//             let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
            
//             if (!recipientPhone) {
//                 toast.error('Customer phone number not found');
//                 return false;
//             }

//             recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
//             if (recipientPhone.startsWith('0')) {
//                 recipientPhone = recipientPhone.substring(1);
//             }
//             if (!recipientPhone.startsWith('91')) {
//                 recipientPhone = `91${recipientPhone}`;
//             }

//             const customerName = row.retailerNameGet || row.Customer_Name || 'Customer';
//             const receiptNo = row.DocumentNumber || 'N/A';
//             const receiptDate = new Date(row.DocumentDate || row.Receipt_Date).toLocaleDateString('en-GB');
//             const amount = Number(row.Total_Invoice_value || 0).toFixed(2);
//             const companyName = storage?.Company_id == 1 ? "SM TRADERS" : "MOBITE";
//             const paymentMode = row.Payment_Mode || 'Cash';
            
//             const receiptLink = `https://erpsmt.in/receipts/${receiptNo}`;
            
//             const uniqueClientRefId = generateUniqueClientRefId('receipt', receiptNo);
            
//             const payload = {
//                 template: {
//                     name: "payment_receipt",
//                     language: "en"
//                 },
//                 source: "crm",
//                 wabaNumber: Dot_Pe_Number,
//                 recipients: [recipientPhone],
//                 clientRefId: uniqueClientRefId,
//                 params: {
//                     body: [
//                         customerName,
//                         receiptNo,
//                         receiptDate,
//                         amount,
//                         paymentMode,
//                         companyName,
//                         receiptLink
//                     ]
//                 }
//             };
            
//             const response = await DotPeWhatsAppService.sendTemplateMessage(payload);
//             if (response?.status) {
//                 toast.success('Payment receipt sent successfully via WhatsApp!');
//                 return true;
//             } else {
//                 throw new Error(response?.message || 'Failed to send message');
//             }
//         } catch (error) {
//             console.error('Error sending receipt:', error);
//             toast.error(`Failed to send receipt: ${error.message}`);
//             return false;
//         } finally {
//             setSendingStates(prev => ({ ...prev, [receiptId]: false }));
//         }
//     };
    
//     const ActionCell = ({ row, isPriceListTab = false, isSaleOrderTab = false, isReceiptTab = false }) => {
//         const hasPhone = !!(phoneMap.get(Number(row.Retailer_Id)) || row?.A1 || row?.Customer_Phone);
//         const isLoading = sendingStates[row.DocumentId];
        
//         let tooltipText = "Send Invoice via WhatsApp";
//         if (isPriceListTab) tooltipText = "Send Price List via WhatsApp";
//         if (isSaleOrderTab) tooltipText = "Send Sale Order via WhatsApp";
//         if (isReceiptTab) tooltipText = "Send Receipt via WhatsApp";
        
//         const handleClick = async () => {
//             if (isSaleOrderTab) {
//                 await sendSaleOrderWhatsApp(row);
//             } else if (isPriceListTab) {
//                 await sendPriceListWhatsApp(row);
//             } else if (isReceiptTab) {
//                 await sendReceiptWhatsApp(row);
//             } else {
//                 await sendSaleInvoiceWhatsApp(row);
//             }
//         };
        
//         return (
//             <Box sx={{ display: 'flex', gap: 0.5 }}>
//                 <Tooltip title={hasPhone ? tooltipText : "No phone number available"}>
//                     <span>
//                         <IconButton
//                             size="small"
//                             onClick={handleClick}
//                             disabled={!hasPhone || isLoading}
//                             color={hasPhone ? "success" : "default"}
//                         >
//                             {isLoading ? <CircularProgress size={20} /> : <WhatsAppIcon fontSize="small" />}
//                         </IconButton>
//                     </span>
//                 </Tooltip>
//             </Box>
//         );
//     };

//     const PriceListActionCell = ({ row }) => {
//         const hasPhone = !!(phoneMap.get(Number(row.Retailer_Id)) || row?.A1 || row?.Customer_Phone);
//         const isLoading = sendingStates[row.DocumentId];
        
//         const handleClick = async () => {
//             await sendPriceListWhatsApp(row);
//         };
        
//         return (
//             <Box sx={{ display: 'flex', gap: 0.5 }}>
//                 <Tooltip title={hasPhone ? "Send Price List via WhatsApp" : "No phone number available"}>
//                     <span>
//                         <IconButton
//                             size="small"
//                             onClick={handleClick}
//                             disabled={!hasPhone || isLoading}
//                             color={hasPhone ? "success" : "default"}
//                         >
//                             {isLoading ? <CircularProgress size={20} /> : <WhatsAppIcon fontSize="small" />}
//                         </IconButton>
//                     </span>
//                 </Tooltip>
//             </Box>
//         );
//     };

//     const selectedTotals = useMemo(() => {
//         const selectedIds = multipleCostCenterUpdateValues.Do_Id;
//         if (!selectedIds.length) return { billQty: 0, altActQty: 0 };
//         let billQty = 0;
//         let altActQty = 0;
//         salesInvoices
//             .filter(inv => selectedIds.includes(toNumber(inv.DocumentId)))
//             .forEach(inv => {
//                 if (Array.isArray(inv.stockDetails)) {
//                     inv.stockDetails.forEach(item => {
//                         billQty += Number(item.Bill_Qty) || 0;
//                         altActQty += Number(item.Alt_Act_Qty) || 0;
//                     });
//                 }
//             });
//         return { billQty, altActQty };
//     }, [multipleCostCenterUpdateValues.Do_Id, salesInvoices]);

//     useEffect(() => {
//         fetchLink({ address: "masters/erpCostCenter/dropDown" })
//             .then((data) => setCostCenterData(toArray(data.data)))
//             .catch(console.error);
//     }, []);

//     const costTypeColumns = useMemo(() => {
//         const columns = costTypes
//             .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
//             .map((costType) => {
//                 const field = `costType_${toNumber(costType.Cost_Category_Id)}`;
//                 return {
//                     costType: costType.Cost_Category,
//                     field: field,
//                     columnConfig: {
//                         Field_Name: field,
//                         Fied_Data: "string",
//                         isVisible: 1,
//                         ColumnHeader: costType.Cost_Category,
//                         isCustomCell: true,
//                         getFilterValues: (row) => getCostTypeEmployees(row, costType.Cost_Category_Id),
//                         Cell: ({ row }) => {
//                             const names = getCostTypeEmployees(row, costType.Cost_Category_Id).join(", ");
//                             return <span>{names || "-"}</span>;
//                         },
//                     }
//                 };
//             });
//         return columns.sort((a, b) => {
//             const aName = a.costType.toLowerCase();
//             const bName = b.costType.toLowerCase();
//             if (aName.includes('broker')) return -1;
//             if (bName.includes('broker')) return 1;
//             if (aName.includes('transport')) return -1;
//             if (bName.includes('transport')) return 1;
//             return a.costType.localeCompare(b.costType);
//         }).map(c => c.columnConfig);
//     }, [costTypes, uniqueInvolvedCost]);

//     const filterColumns = useMemo(() => [...columns, ...costTypeColumns], [columns, costTypeColumns]);

//     const onCloseAssignDialog = () =>
//         setFilters((prev) => ({ ...prev, assignDialog: false, selectedInvoice: null }));

//     const onCloseFilterDialog = () => setFilters((prev) => ({ ...prev, filterDialog: false }));

//     const onCloseMultipleUpdateCostCategoryDialog = () => {
//         setMultipleCostCenterUpdateValues(multipleStaffUpdateInitialValues);
//         setFilters((prev) => ({ ...prev, multipleStaffUpdateDialog: false }));
//     };

//     const onCloseMultipleStaffRemoveDialog = () => {
//         setMultipleStaffRemoveValues(multipleStaffRemoveInitialValues);
//         setFilters((prev) => ({ ...prev, multipleStaffRemoveDialog: false }));
//     };

//     const onChangeEmployee = (invoice, selectedOptions, costType) => {
//         setFilters((prev) => {
//             const updatedInvolvedStaffs = toArray(prev.selectedInvoice?.involvedStaffs)
//                 .filter((emp) => !isEqualNumber(emp.Emp_Type_Id, costType.Cost_Category_Id))
//                 .concat(selectedOptions);
//             return { ...prev, selectedInvoice: { ...invoice, involvedStaffs: updatedInvolvedStaffs } };
//         });
//     };

//     const fetchSalesInvoices = () => {
//         if (viewMode === 'pending') fetchPendingInvoices();
//         else setFilters((pre) => ({ ...pre, fetchTrigger: pre.fetchTrigger + 1 }));
//     };

//     const getPdfDownloadUrl = (invoiceId, token) => {
//         const baseUrl = api;
//         const cleanInvoiceNo = invoiceId.replace(/\//g, '_');
//         return `${baseUrl}sales/downloadPdf?Do_Inv_No=${cleanInvoiceNo}`;
//     };

//     const downloadInvoicePDF = async (invoiceId, fileName = null) => {
//         try {
//             const downloadUrl = getPdfDownloadUrl(invoiceId);
//             const a = document.createElement('a');
//             a.href = downloadUrl;
//             a.download = fileName || `${invoiceId}.pdf`;
//             document.body.appendChild(a);
//             a.click();
//             document.body.removeChild(a);
//             return true;
//         } catch (error) {
//             console.error('Error downloading PDF:', error);
//             throw error;
//         }
//     };

//     const convertToISTShort = (isoString) => {
//         if (!isoString) return '';
//         try {
//             const date = new Date(isoString);
//             const istOffset = 5.5 * 60 * 60 * 1000;
//             const istDate = new Date(date.getTime() + istOffset);
//             const hours = String(istDate.getUTCHours()).padStart(2, '0');
//             const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
//             return `${hours}:${minutes}`;
//         } catch (error) {
//             return isoString;
//         }
//     };

//     const downloadSelectedAsExcel = () => {
//         const selectedIds = multipleCostCenterUpdateValues.Do_Id;
//         if (selectedIds.length === 0) {
//             toast.warning("Please select at least one invoice to download");
//             return;
//         }
//         setDownloadLoading(true);
//         handleDownloadClose();
//         try {
//             const selectedInvoices = salesInvoices.filter(inv => selectedIds.includes(toNumber(inv.DocumentId)));
//             const excelData = [];
//             selectedInvoices.forEach((invoice, index) => {
//                 const mainRow = {
//                     'S.No': index + 1,
//                     'Document No': invoice.DocumentNumber || '',
//                     'Type': invoice.DocumentType || (invoice.voucherTypeGet || ''),
//                     'Created': convertToISTShort(invoice.createdOn),
//                     'Voucher Type': invoice.voucherTypeGet || '',
//                     'Customer': invoice.retailerNameGet || '',
//                     'Phone Number': invoice.A1_Phone || phoneMap.get(Number(invoice.Retailer_Id)) || invoice.A1 || 'Not Available',
//                     'Bill Qty': invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0) : 0,
//                     'Alt Act Qty': invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Alt_Act_Qty) || 0), 0) : 0,
//                     'Narration': invoice.Narration || '',
//                     'Total Amount': invoice.Total_Invoice_value || 0,
//                     'Status': invoice.Delivery_Status || invoice.Conversion_Status || '',
//                 };
//                 costTypes
//                     .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
//                     .forEach(costType => {
//                         const names = getCostTypeEmployees(invoice, costType.Cost_Category_Id).join(", ");
//                         mainRow[costType.Cost_Category] = names || '-';
//                     });
//                 excelData.push(mainRow);
//             });
//             const wb = XLSX.utils.book_new();
//             const ws = XLSX.utils.json_to_sheet(excelData);
//             const colWidths = [];
//             const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
//             for (let C = range.s.c; C <= range.e.c; ++C) {
//                 let maxWidth = 10;
//                 for (let R = range.s.r; R <= range.e.r; ++R) {
//                     const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
//                     if (cell && cell.v) {
//                         const width = String(cell.v).length + 2;
//                         if (width > maxWidth) maxWidth = width;
//                     }
//                 }
//                 colWidths[C] = { wch: Math.min(maxWidth, 50) };
//             }
//             ws['!cols'] = colWidths;
//             XLSX.utils.book_append_sheet(wb, ws, "Data");
//             const fileName = `Data_${viewMode}_${new Date().toISOString().split('T')[0]}.xlsx`;
//             XLSX.writeFile(wb, fileName);
//             toast.success(`Downloaded ${selectedIds.length} items as Excel`);
//         } catch (error) {
//             console.error('Error downloading Excel:', error);
//             toast.error(`Failed to download Excel: ${error.message}`);
//         } finally {
//             setDownloadLoading(false);
//         }
//     };

//     const downloadSelectedAsPDF = () => {
//         const selectedIds = multipleCostCenterUpdateValues.Do_Id;
//         if (selectedIds.length === 0) {
//             toast.warning("Please select at least one item to download");
//             return;
//         }
//         setDownloadLoading(true);
//         handleDownloadClose();
//         try {
//             const selectedInvoices = salesInvoices.filter(inv => selectedIds.includes(toNumber(inv.DocumentId)));
//             const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
//             const tableData = [];
//             selectedInvoices.forEach((invoice, index) => {
//                 const row = [
//                     index + 1,
//                     invoice.DocumentNumber || 'N/A',
//                     invoice.DocumentType || '',
//                     invoice.DocumentDate ? invoice.DocumentDate.split('T')[0] : '',
//                     invoice.createdOn || '',
//                     invoice.voucherTypeGet || '',
//                     invoice.retailerNameGet || '',
//                     invoice.Retailer_GSTIN || '',
//                     `₹${NumberFormat(invoice.Total_Invoice_value || 0)}`,
//                     invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0) : 0,
//                     invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Alt_Act_Qty) || 0), 0) : 0,
//                     invoice.Narration || '',
//                     invoice.Delivery_Status || invoice.Conversion_Status || '',
//                     invoice.A1_Phone || phoneMap.get(Number(invoice.Retailer_Id)) || invoice.A1 || 'No Phone'
//                 ];
//                 costTypes
//                     .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
//                     .forEach(costType => {
//                         const names = getCostTypeEmployees(invoice, costType.Cost_Category_Id).join(", ");
//                         row.push(names || '-');
//                     });
//                 tableData.push(row);
//             });
//             const tableColumns = [
//                 "S.No", "Document No", "Type", "Document Date", "Created On", "Voucher Type",
//                 "Customer", "Customer GST", "Total Amount", "Bill Qty", "Alt Act Qty",
//                 "Narration", "Status", "Phone Number",
//                 ...costTypes
//                     .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
//                     .map(costType => costType.Cost_Category)
//             ];
//             doc.setFontSize(16);
//             doc.setTextColor(40, 40, 40);
//             doc.text(`Report - ${viewMode === 'pending' ? 'Pending' : 'All'}`, 14, 15);
//             doc.setFontSize(8);
//             doc.setTextColor(100, 100, 100);
//             doc.text(`Generated on: ${new Date().toLocaleString()}`, 280, 10, { align: 'right' });
//             doc.text(`Total Items: ${selectedIds.length}`, 14, 22);
//             doc.text(`Date: ${filters.reqDate}`, 14, 27);
//             doc.autoTable({
//                 startY: 37,
//                 head: [tableColumns],
//                 body: tableData,
//                 theme: 'grid',
//                 styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak', cellWidth: 'wrap' },
//                 headStyles: { fillColor: [66, 66, 66], textColor: 255, fontStyle: 'bold', halign: 'center' },
//                 margin: { left: 10, right: 10 },
//                 didDrawPage: (data) => {
//                     doc.setFontSize(8);
//                     doc.setTextColor(150, 150, 150);
//                     doc.text(
//                         `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
//                         data.settings.margin.left,
//                         doc.internal.pageSize.height - 10
//                     );
//                 }
//             });
//             const fileName = `Report_${viewMode}_${new Date().toISOString().split('T')[0]}.pdf`;
//             doc.save(fileName);
//             toast.success(`Downloaded ${selectedIds.length} items as PDF`);
//         } catch (error) {
//             console.error('Error downloading PDF:', error);
//             toast.error(`Failed to download PDF: ${error.message}`);
//         } finally {
//             setDownloadLoading(false);
//         }
//     };

//     const handleDownloadClose = () => setDownloadAnchorEl(null);

//     const postAssignCostCenters = async (e) => {
//         e.preventDefault();
//         fetchLink({
//             address: "sales/salesInvoice/lrReport",
//             method: "POST",
//             bodyData: {
//                 Do_Id: filters.selectedInvoice?.Do_Id,
//                 involvedStaffs: filters.selectedInvoice?.involvedStaffs,
//                 staffInvolvedStatus: toNumber(filters.selectedInvoice?.staffInvolvedStatus),
//             },
//             loadingOn,
//             loadingOff,
//         }).then((data) => {
//             if (data.success) {
//                 toast.success(data.message);
//                 onCloseAssignDialog();
//                 if (viewMode === 'pending') fetchPendingInvoices();
//                 else fetchSalesInvoices();
//             } else {
//                 toast.error(data.message);
//             }
//         }).catch((e2) => console.log(e2));
//     };

//     const postMultipleCostCenterUpdate = async () => {
//         fetchLink({
//             address: "sales/salesInvoice/lrReport/multiple",
//             method: "POST",
//             bodyData: {
//                 CostCategory: toNumber(multipleCostCenterUpdateValues.CostCategory.value),
//                 Do_Id: multipleCostCenterUpdateValues.Do_Id,
//                 involvedStaffs: multipleCostCenterUpdateValues.involvedStaffs.map((option) => toNumber(option.value)),
//                 staffInvolvedStatus: toNumber(multipleCostCenterUpdateValues.staffInvolvedStatus),
//                 deliveryStatus: toNumber(multipleCostCenterUpdateValues.deliveryStatus),
//             },
//             loadingOn,
//             loadingOff,
//         }).then((data) => {
//             if (data.success) {
//                 toast.success(data.message);
//                 onCloseMultipleUpdateCostCategoryDialog();
//                 if (viewMode === 'pending') fetchPendingInvoices();
//                 else fetchSalesInvoices();
//             } else {
//                 toast.error(data.message);
//             }
//         }).catch((e) => console.log(e));
//     };

//     const applyFilters = () => {
//         if (activeTab === 'price_list') {
//             let filtered = [...priceListRetailers];
//             for (const column of filterColumns) {
//                 const key = column.Field_Name;
//                 const filterVal = columnFilters[key];
//                 if (!filterVal) continue;
//                 if (filterVal.type === "range") {
//                     const { min, max } = filterVal;
//                     filtered = filtered.filter((item) => {
//                         const value = item[key];
//                         return (min === undefined || value >= min) && (max === undefined || value <= max);
//                     });
//                     continue;
//                 }
//                 if (filterVal.type === "date") {
//                     const { start, end } = filterVal.value || {};
//                     filtered = filtered.filter((item) => {
//                         const dateValue = new Date(item[key]);
//                         return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
//                     });
//                     continue;
//                 }
//                 if (Array.isArray(filterVal)) {
//                     const selected = filterVal.map(normalize).filter(Boolean);
//                     if (!selected.length) continue;
//                     if (typeof column.getFilterValues === "function") {
//                         filtered = filtered.filter((item) => {
//                             const rowVals = (column.getFilterValues(item) || []).map(normalize).filter(Boolean);
//                             return selected.some((v) => rowVals.includes(v));
//                         });
//                     } else {
//                         filtered = filtered.filter((item) => selected.includes(normalize(item[key])));
//                     }
//                 }
//             }
//             setFilteredPriceListRetailers(filtered);
//         } else if (activeTab === 'receipt_list') {
//             let filtered = [...allReceipts];
//             for (const column of filterColumns) {
//                 const key = column.Field_Name;
//                 const filterVal = columnFilters[key];
//                 if (!filterVal) continue;
//                 if (filterVal.type === "range") {
//                     const { min, max } = filterVal;
//                     filtered = filtered.filter((item) => {
//                         const value = item[key];
//                         return (min === undefined || value >= min) && (max === undefined || value <= max);
//                     });
//                     continue;
//                 }
//                 if (filterVal.type === "date") {
//                     const { start, end } = filterVal.value || {};
//                     filtered = filtered.filter((item) => {
//                         const dateValue = new Date(item[key]);
//                         return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
//                     });
//                     continue;
//                 }
//                 if (Array.isArray(filterVal)) {
//                     const selected = filterVal.map(normalize).filter(Boolean);
//                     if (!selected.length) continue;
//                     if (typeof column.getFilterValues === "function") {
//                         filtered = filtered.filter((item) => {
//                             const rowVals = (column.getFilterValues(item) || []).map(normalize).filter(Boolean);
//                             return selected.some((v) => rowVals.includes(v));
//                         });
//                     } else {
//                         filtered = filtered.filter((item) => selected.includes(normalize(item[key])));
//                     }
//                 }
//             }
//             setFilteredData(filtered);
//         } else {
//             let filtered = [...salesInvoices];
//             for (const column of filterColumns) {
//                 const key = column.Field_Name;
//                 const filterVal = columnFilters[key];
//                 if (!filterVal) continue;
//                 if (filterVal.type === "range") {
//                     const { min, max } = filterVal;
//                     filtered = filtered.filter((item) => {
//                         const value = item[key];
//                         return (min === undefined || value >= min) && (max === undefined || value <= max);
//                     });
//                     continue;
//                 }
//                 if (filterVal.type === "date") {
//                     const { start, end } = filterVal.value || {};
//                     filtered = filtered.filter((item) => {
//                         const dateValue = new Date(item[key]);
//                         return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
//                     });
//                     continue;
//                 }
//                 if (Array.isArray(filterVal)) {
//                     const selected = filterVal.map(normalize).filter(Boolean);
//                     if (!selected.length) continue;
//                     if (typeof column.getFilterValues === "function") {
//                         filtered = filtered.filter((item) => {
//                             const rowVals = (column.getFilterValues(item) || []).map(normalize).filter(Boolean);
//                             return selected.some((v) => rowVals.includes(v));
//                         });
//                     } else {
//                         filtered = filtered.filter((item) => selected.includes(normalize(item[key])));
//                     }
//                 }
//             }
//             setFilteredData(filtered);
//         }
//     };

//     useEffect(() => {
//         applyFilters();
//     }, [columnFilters, salesInvoices, priceListRetailers, allReceipts, filterColumns, activeTab]);

//     const handleFilterChange = (column, value) => {
//         setColumnFilters((prevFilters) => ({ ...prevFilters, [column]: value }));
//     };

//     const handleMultiPrint = useReactToPrint({
//         content: () => multiPrintRef.current,
//         documentTitle: "Multiple Documents",
//         pageStyle: currentPrintType === 'delivery_slip' ? `
//             @page { margin: 0.7cm 0 0 0; size: auto; }
//             html, body { margin: 0; padding: 0; }
//             body { display: flex; flex-direction: column; align-items: center; }
//             @media print { body > * { margin-left: 0 !important; margin-right: 0 !important; } .no-print { display: none !important; } }
//         ` : currentPrintType === 'sales_invoice' ? `
//             @page { size: A5 landscape; margin: 0; }
//             html, body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//             body { display: flex; flex-direction: column; align-items: center; }
//             @media print { body > * { margin-left: 0 !important; margin-right: 0 !important; } .no-print { display: none !important; } }
//         ` : `
//             @page { margin: 0.6cm; size: auto; }
//             html, body { margin: 0; padding: 0; }
//             body { display: flex; flex-direction: column; align-items: center; }
//             @media print { body > * { margin-left: 0 !important; margin-right: 0 !important; } .no-print { display: none !important; } }
//         `,
//     });

//     const renderFilter = (column) => {
//         const { Field_Name, Fied_Data, ColumnHeader } = column;
//         if (Fied_Data === "number") {
//             return (
//                 <div className="d-flex justify-content-between px-2">
//                     <input
//                         placeholder="Min" type="number" className="bg-light border-0 m-1 p-1 w-50"
//                         value={columnFilters[Field_Name]?.min ?? ""}
//                         onChange={(e) => handleFilterChange(Field_Name, { type: "range", ...columnFilters[Field_Name], min: e.target.value ? parseFloat(e.target.value) : undefined })}
//                     />
//                     <input
//                         placeholder="Max" type="number" className="bg-light border-0 m-1 p-1 w-50"
//                         value={columnFilters[Field_Name]?.max ?? ""}
//                         onChange={(e) => handleFilterChange(Field_Name, { type: "range", ...columnFilters[Field_Name], max: e.target.value ? parseFloat(e.target.value) : undefined })}
//                     />
//                 </div>
//             );
//         }
//         if (Fied_Data === "date") {
//             return (
//                 <div className="d-flex justify-content-between px-2">
//                     <input
//                         placeholder="Start Date" type="date" className="bg-light border-0 m-1 p-1 w-50"
//                         value={columnFilters[Field_Name]?.value?.start ?? ""}
//                         onChange={(e) => handleFilterChange(Field_Name, { type: "date", value: { ...columnFilters[Field_Name]?.value, start: e.target.value || undefined } })}
//                     />
//                     <input
//                         placeholder="End Date" type="date" className="bg-light border-0 m-1 p-1 w-50"
//                         value={columnFilters[Field_Name]?.value?.end ?? ""}
//                         onChange={(e) => handleFilterChange(Field_Name, { type: "date", value: { ...columnFilters[Field_Name]?.value, end: e.target.value || undefined } })}
//                     />
//                 </div>
//             );
//         }
//         if (Fied_Data === "string") {
//             let rawValues;
//             if (activeTab === 'price_list') {
//                 rawValues = priceListRetailers.map((item) => item[Field_Name]);
//             } else if (activeTab === 'receipt_list') {
//                 rawValues = allReceipts.map((item) => item[Field_Name]);
//             } else {
//                 rawValues = typeof column.getFilterValues === "function"
//                     ? salesInvoices.flatMap((item) => column.getFilterValues(item) || [])
//                     : salesInvoices.map((item) => item[Field_Name]);
//             }
//             const distinctValues = uniqueCaseInsensitive(rawValues);
//             return (
//                 <Autocomplete
//                     multiple
//                     id={`${Field_Name}-filter`}
//                     options={distinctValues}
//                     disableCloseOnSelect
//                     getOptionLabel={(option) => option}
//                     value={columnFilters[Field_Name] || []}
//                     onChange={(event, newValue) => handleFilterChange(Field_Name, newValue)}
//                     renderOption={(props, option, { selected }) => (
//                         <li {...props}>
//                             <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
//                             {option}
//                         </li>
//                     )}
//                     isOptionEqualToValue={(opt, val) => opt === val}
//                     renderInput={(params) => (
//                         <TextField
//                             {...params}
//                             label={ColumnHeader || Field_Name}
//                             placeholder={`Select ${(ColumnHeader || Field_Name).replace(/_/g, " ")}`}
//                         />
//                     )}
//                 />
//             );
//         }
//         return null;
//     };

//     const postMultipleStaffRemove = async () => {
//         if (!multipleStaffRemoveValues.CostCategory.value || multipleStaffRemoveValues.Do_Id.length === 0) {
//             toast.error("Please select a Cost Category and at least one invoice");
//             return;
//         }
//         fetchLink({
//             address: "sales/salesInvoice/lrReport/multipleDelete",
//             method: "POST",
//             bodyData: {
//                 CostCategory: toNumber(multipleStaffRemoveValues.CostCategory.value),
//                 Do_Id: multipleStaffRemoveValues.Do_Id,
//                 staffInvolvedStatus: toNumber(multipleStaffRemoveValues.staffInvolvedStatus),
//                 deliveryStatus: toNumber(multipleStaffRemoveValues.deliveryStatus),
//             },
//             loadingOn,
//             loadingOff,
//         }).then((data) => {
//             if (data.success) {
//                 toast.success(data.message);
//                 onCloseMultipleStaffRemoveDialog();
//                 if (viewMode === 'pending') fetchPendingInvoices();
//                 else fetchSalesInvoices();
//             } else {
//                 toast.error(data.message);
//             }
//         }).catch((e) => console.log(e));
//     };

//     useEffect(() => {
//         if (selectAllCheckBox) {
//             if (activeTab === 'price_list') {
//                 const allIds = filteredPriceListRetailers.map(item => toNumber(item.DocumentId));
//                 setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: allIds }));
//                 setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: allIds }));
//             } else if (activeTab === 'receipt_list') {
//                 const allIds = filteredData.map(item => toNumber(item.DocumentId));
//                 setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: allIds }));
//                 setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: allIds }));
//             } else {
//                 const allDoIds = filteredData.map(item => toNumber(item.DocumentId));
//                 setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: allDoIds }));
//                 setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: allDoIds }));
//             }
//         } else {
//             setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: [] }));
//             setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: [] }));
//         }
//     }, [selectAllCheckBox, filteredData, filteredPriceListRetailers, activeTab]);

//     const saveMultipleInvoiceValidation = useMemo(() => {
//         const validDoId = multipleCostCenterUpdateValues.Do_Id.length > 0;
//         const validCostCenterId = multipleCostCenterUpdateValues.involvedStaffs.length > 0;
//         const validCostCategory =
//             checkIsNumber(multipleCostCenterUpdateValues.CostCategory.value) &&
//             !isEqualNumber(multipleCostCenterUpdateValues.CostCategory.value, 0);
//         if (!validDoId) return false;
//         if (validCostCenterId && !validCostCategory) return false;
//         if (!validCostCenterId && validCostCategory) return false;
//         return true;
//     }, [multipleCostCenterUpdateValues]);

//     const removeMultipleInvoiceValidation = useMemo(() => {
//         const validDoId = multipleStaffRemoveValues.Do_Id.length > 0;
//         const validCostCategory =
//             checkIsNumber(multipleStaffRemoveValues.CostCategory.value) &&
//             !isEqualNumber(multipleStaffRemoveValues.CostCategory.value, 0);
//         return validDoId && validCostCategory;
//     }, [multipleStaffRemoveValues]);

//     const stats = useMemo(() => ({
//         totalInvoices: allInvoices.length,
//         totalSalesInvoices: allSalesInvoices.length,
//         totalSalesOrders: allSalesOrders.length,
//         totalReceipts: allReceipts.length,
//         filteredInvoices: salesInvoices.length,
//         customersWithPhone: phoneMap.size,
//         totalPriceListRetailers: priceListRetailers.length
//     }), [allInvoices.length, allSalesInvoices.length, allSalesOrders.length, allReceipts.length, salesInvoices.length, phoneMap.size, priceListRetailers.length]);

//     const refreshData = () => {
//         if (activeTab === 'price_list') {
//             fetchRetailersWithLOL();
//         } else if (activeTab === 'receipt_list') {
//             fetchReceipts();
//         } else if (viewMode === 'pending') {
//             fetchPendingInvoices();
//         } else {
//             fetchAllInvoices(true);
//         }
//     };

//     const handleTabChange = (newVal) => {
//         setActiveTab(newVal);
//         setSelectAllCheckBox(false);
//         setMultipleCostCenterUpdateValues(multipleStaffUpdateInitialValues);
//         setMultipleStaffRemoveValues(multipleStaffRemoveInitialValues);
//         setColumnFilters({});
        
//         if (newVal === 'price_list') {
//             if (priceListRetailers.length === 0) {
//                 fetchRetailersWithLOL();
//             } else {
//                 setFilteredPriceListRetailers(priceListRetailers);
//             }
//         } else if (newVal === 'sale_invoice') {
//             setSalesInvoices(allSalesInvoices);
//             setFilteredData(allSalesInvoices);
//         } else if (newVal === 'sale_order') {
//             setSalesInvoices(allSalesOrders);
//             setFilteredData(allSalesOrders);
//         } else if (newVal === 'receipt_list') {
//             if (allReceipts.length === 0) {
//                 fetchReceipts();
//             } else {
//                 setFilteredData(allReceipts);
//             }
//         }
//     };

//     // Base columns that are common
//     const baseColumns = [
//         {
//             Field_Name: "Select",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: ({ row }) => {
//                 const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(toNumber(row.DocumentId));
//                 return (
//                     <Checkbox
//                         onFocus={(e) => e.target.blur()}
//                         checked={isSelected}
//                         onChange={() => {
//                             if (isSelected) {
//                                 setMultipleCostCenterUpdateValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.DocumentId)),
//                                 }));
//                                 setMultipleStaffRemoveValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.DocumentId)),
//                                 }));
//                             } else {
//                                 setMultipleCostCenterUpdateValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)],
//                                 }));
//                                 setMultipleStaffRemoveValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)],
//                                 }));
//                             }
//                         }}
//                     />
//                 );
//             },
//         },
//         {
//             Field_Name: "DocumentNumber",
//             Fied_Data: "string",
//             ColumnHeader: "Document No",
//             isVisible: 1,
//             isCustomCell: false,
//         },
//         {
//             Field_Name: "DocumentType",
//             Fied_Data: "string",
//             ColumnHeader: "Type",
//             isVisible: 1,
//         },
//         {
//             Field_Name: "Created",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: ({ row }) => row?.createdOn ? LocalDateWithTime(row?.createdOn) : "",
//         },
//         createCol("voucherTypeGet", "string", "Voucher"),
//         createCol("retailerNameGet", "string", "Customer"),
//         {
//             Field_Name: "PhoneNumber",
//             ColumnHeader: "Phone",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: ({ row }) => {
//                 const phone = row.A1_Phone || phoneMap.get(Number(row.Retailer_Id)) || row.A1 || 'Not Available';
//                 return <span>{phone}</span>;
//             },
//         },
//         {
//             Field_Name: "BillQty",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: ({ row }) => {
//                 if (row.stockDetails && row.stockDetails.length > 0) {
//                     return row.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0);
//                 }
//                 return 0;
//             },
//         },
//         {
//             Field_Name: "AltActQty",
//             ColumnHeader: "Alt Act Qty",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: ({ row }) =>
//                 RoundNumber(toArray(row.stockDetails).reduce((s, i) => s + toNumber(i.Alt_Act_Qty), 0)),
//         },
//         createCol("Narration", "string", "Narration"),
//         {
//             Field_Name: "Status",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: ({ row }) => row.Delivery_Status || row.Conversion_Status || row.Status || '-',
//         },
//     ];

//     // Price List specific columns
//     const priceListColumns = [
//         {
//             Field_Name: "Select",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: ({ row }) => {
//                 const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(toNumber(row.DocumentId));
//                 return (
//                     <Checkbox
//                         onFocus={(e) => e.target.blur()}
//                         checked={isSelected}
//                         onChange={() => {
//                             if (isSelected) {
//                                 setMultipleCostCenterUpdateValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.DocumentId)),
//                                 }));
//                                 setMultipleStaffRemoveValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.DocumentId)),
//                                 }));
//                             } else {
//                                 setMultipleCostCenterUpdateValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)],
//                                 }));
//                                 setMultipleStaffRemoveValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)],
//                                 }));
//                             }
//                         }}
//                     />
//                 );
//             },
//         },
//         {
//             Field_Name: "Retailer_Name",
//             Fied_Data: "string",
//             ColumnHeader: "Customer Name",
//             isVisible: 1,
//         },
//         {
//             Field_Name: "Ret_Code",
//             Fied_Data: "string",
//             ColumnHeader: "Customer Code",
//             isVisible: 1,
//         },
//         {
//             Field_Name: "PhoneNumber",
//             ColumnHeader: "Phone",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: ({ row }) => {
//                 const phone = row.A1 || 'Not Available';
//                 return <span>{phone}</span>;
//             },
//         },
//         {
//             Field_Name: "City",
//             Fied_Data: "string",
//             ColumnHeader: "City",
//             isVisible: 1,
//         },
//         {
//             Field_Name: "Location",
//             Fied_Data: "string",
//             ColumnHeader: "Location",
//             isVisible: 1,
//         },
//         {
//             Field_Name: "Action",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: PriceListActionCell
//         }
//     ];

//     // Receipt specific columns
//     const receiptColumns = [
//         {
//             Field_Name: "Select",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: ({ row }) => {
//                 const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(toNumber(row.DocumentId));
//                 return (
//                     <Checkbox
//                         onFocus={(e) => e.target.blur()}
//                         checked={isSelected}
//                         onChange={() => {
//                             if (isSelected) {
//                                 setMultipleCostCenterUpdateValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.DocumentId)),
//                                 }));
//                                 setMultipleStaffRemoveValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.DocumentId)),
//                                 }));
//                             } else {
//                                 setMultipleCostCenterUpdateValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)],
//                                 }));
//                                 setMultipleStaffRemoveValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)],
//                                 }));
//                             }
//                         }}
//                     />
//                 );
//             },
//         },
//         {
//             Field_Name: "receipt_invoice_no",
//             Fied_Data: "string",
//             ColumnHeader: "Receipt No",
//             isVisible: 1,
//             isCustomCell: false,
//         },
//         {
//             Field_Name: "receipt_date",
//             Fied_Data: "date",
//             ColumnHeader: "Receipt Date",
//             isVisible: 1,
//             isCustomCell: false,
//         },
//            {
//             Field_Name: "DebitAccountGet",
//             Fied_Data: "string",
//             ColumnHeader: "Debit Account",
//             isVisible: 1,
//             isCustomCell: false,
//         },
//            {
//             Field_Name: "CreditAccountGet",
//             Fied_Data: "string",
//             ColumnHeader: "Credit Account",
//             isVisible: 1,
//             isCustomCell: false,
//         },
    
//         {
//             Field_Name: "PhoneNumber",
//             ColumnHeader: "Phone",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: ({ row }) => {
//                 const phone = row.A1_Phone || phoneMap.get(Number(row.Retailer_Id)) || row.A1 || 'Not Available';
//                 return <span>{phone}</span>;
//             },
//         },
//         {
//             Field_Name: "Total_Invoice_value",
//             Fied_Data: "number",
//             ColumnHeader: "Amount",
//             isVisible: 1,
//             isCustomCell: false,
//             Cell: ({ row }) => `₹${NumberFormat(row.Total_Invoice_value || 0)}`,
//         },
//         {
//             Field_Name: "Payment_Mode",
//             Fied_Data: "string",
//             ColumnHeader: "Payment Mode",
//             isVisible: 1,
//             isCustomCell: false,
//         },
//         {
//             Field_Name: "Bank_Name",
//             Fied_Data: "string",
//             ColumnHeader: "Bank",
//             isVisible: 1,
//             isCustomCell: false,
//         },
//         {
//             Field_Name: "Cheque_No",
//             Fied_Data: "string",
//             ColumnHeader: "Cheque/Ref No",
//             isVisible: 1,
//             isCustomCell: false,
//         },
//         {
//             Field_Name: "Status",
//             Fied_Data: "string",
//             ColumnHeader: "Status",
//             isVisible: 1,
//             isCustomCell: false,
//         },
//         createCol("Narration", "string", "Narration"),
//         {
//             Field_Name: "Action",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: (props) => <ActionCell {...props} isReceiptTab={true} />
//         }
//     ];

//     const saleInvoiceColumns = [
//         ...baseColumns,
//         {
//             Field_Name: "Action",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: (props) => <ActionCell {...props} isPriceListTab={false} />
//         }
//     ];

//     const saleOrderColumns = [
//         ...baseColumns,
//         {
//             Field_Name: "Action",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: (props) => <ActionCell {...props} isPriceListTab={false} isSaleOrderTab={true} />
//         }
//     ];

//     // Receipt Filter Bar Component
//     const ReceiptFilterBar = () => {
//         return (
//             <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
//                 <Typography variant="subtitle2" gutterBottom>Receipt Filters</Typography>
//                 <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
//                     <TextField
//                         label="From Date"
//                         type="date"
//                         size="small"
//                         value={receiptFilters.Fromdate}
//                         onChange={(e) => setReceiptFilters(prev => ({ ...prev, Fromdate: e.target.value }))}
//                         InputLabelProps={{ shrink: true }}
//                     />
//                     <TextField
//                         label="To Date"
//                         type="date"
//                         size="small"
//                         value={receiptFilters.Todate}
//                         onChange={(e) => setReceiptFilters(prev => ({ ...prev, Todate: e.target.value }))}
//                         InputLabelProps={{ shrink: true }}
//                     />
//                     <TextField
//                         label="Voucher No"
//                         size="small"
//                         value={receiptFilters.voucher}
//                         onChange={(e) => setReceiptFilters(prev => ({ ...prev, voucher: e.target.value }))}
//                     />
//                     <FormControl size="small" sx={{ minWidth: 120 }}>
//                         <InputLabel>Payment Mode</InputLabel>
//                         <MuiSelect
//                             value={receiptFilters.receipt_type}
//                             onChange={(e) => setReceiptFilters(prev => ({ ...prev, receipt_type: e.target.value }))}
//                             label="Payment Mode"
//                         >
//                             <MenuItem value="">All</MenuItem>
//                             <MenuItem value="cash">Cash</MenuItem>
//                             <MenuItem value="bank">Bank</MenuItem>
//                             <MenuItem value="cheque">Cheque</MenuItem>
//                             <MenuItem value="online">Online</MenuItem>
//                         </MuiSelect>
//                     </FormControl>
//                     <FormControl size="small" sx={{ minWidth: 120 }}>
//                         <InputLabel>Status</InputLabel>
//                         <MuiSelect
//                             value={receiptFilters.status}
//                             onChange={(e) => setReceiptFilters(prev => ({ ...prev, status: e.target.value }))}
//                             label="Status"
//                         >
//                             <MenuItem value="">All</MenuItem>
//                             <MenuItem value="completed">Completed</MenuItem>
//                             <MenuItem value="pending">Pending</MenuItem>
//                             <MenuItem value="cancelled">Cancelled</MenuItem>
//                         </MuiSelect>
//                     </FormControl>
//                     <Button 
//                         variant="contained" 
//                         size="small"
//                         onClick={fetchReceipts}
//                         startIcon={<Search />}
//                     >
//                         Search
//                     </Button>
//                     <Button 
//                         variant="outlined" 
//                         size="small"
//                         onClick={() => {
//                             setReceiptFilters({
//                                 Fromdate: ISOString(),
//                                 Todate: ISOString(),
//                                 voucher: '',
//                                 debit: '',
//                                 credit: '',
//                                 createdBy: '',
//                                 status: '',
//                                 receipt_type: ''
//                             });
//                             setTimeout(fetchReceipts, 100);
//                         }}
//                     >
//                         Reset
//                     </Button>
//                 </Box>
//             </Box>
//         );
//     };

//     const sharedButtonArea = (
//         <>
//             <Tooltip title="Select All">
//                 <Checkbox
//                     checked={selectAllCheckBox}
//                     onChange={e => setSelectAllCheckBox(e.target.checked)}
//                     disabled={activeTab === 'price_list' ? filteredPriceListRetailers.length === 0 : activeTab === 'receipt_list' ? filteredData.length === 0 : filteredData.length === 0}
//                 />
//             </Tooltip>

//             <IconButton
//                 size="small"
//                 onClick={() => setFilters((prev) => ({ ...prev, filterDialog: true }))}
//                 disabled={isRefreshing}
//             >
//                 <FilterAlt />
//             </IconButton>

//             <IconButton size="small" onClick={refreshData} disabled={isRefreshing}>
//                 <Search />
//             </IconButton>

//             {viewMode === 'pending' && activeTab !== 'price_list' && activeTab !== 'receipt_list' && (
//                 <div>
//                     <Button
//                         variant="contained"
//                         size="small"
//                         startIcon={<Download />}
//                         endIcon={<ArrowDropDown />}
//                         onClick={handleDownloadClick}
//                         disabled={!multipleCostCenterUpdateValues.Do_Id.length || downloadLoading}
//                         sx={{ ml: 1, textTransform: 'none' }}
//                     >
//                         {downloadLoading ? 'Downloading...' : 'Download'}
//                     </Button>
//                     <Menu
//                         anchorEl={downloadAnchorEl}
//                         open={Boolean(downloadAnchorEl)}
//                         onClose={handleDownloadClose}
//                     >
//                         <MenuItem onClick={downloadSelectedAsExcel} disabled={downloadLoading}>
//                             <ListItemIcon><TableChart fontSize="small" color="success" /></ListItemIcon>
//                             <ListItemText>Download as Excel</ListItemText>
//                         </MenuItem>
//                         <MenuItem onClick={downloadSelectedAsPDF} disabled={downloadLoading}>
//                             <ListItemIcon><PictureAsPdf fontSize="small" color="error" /></ListItemIcon>
//                             <ListItemText>Download as PDF</ListItemText>
//                         </MenuItem>
//                     </Menu>
//                 </div>
//             )}

//             {activeTab !== 'price_list' && activeTab !== 'receipt_list' && (
//                 <input
//                     type="date"
//                     className="cus-inpt w-auto"
//                     value={filters.reqDate}
//                     onChange={(e) => setFilters((prev) => ({ ...prev, reqDate: e.target.value }))}
//                     disabled={isRefreshing || activeTab === 'price_list'}
//                 />
//             )}

//             {activeTab !== 'price_list' && activeTab !== 'receipt_list' && (
//                 <IconButton
//                     size="small"
//                     disabled={!filters.docType || !multipleCostCenterUpdateValues.Do_Id.length}
//                     onClick={() => {
//                         setCurrentPrintType(filters.docType);
//                         setMultiPrint({
//                             open: true,
//                             doIds: multipleCostCenterUpdateValues.Do_Id,
//                             docType: filters.docType
//                         });
//                     }}
//                 >
//                     <Print />
//                 </IconButton>
//             )}
//         </>
//     );

//     const sharedDialogs = (
//         <>
//             <Dialog open={filters.filterDialog} onClose={onCloseFilterDialog} maxWidth="sm" fullWidth>
//                 <DialogTitle>Filter Options</DialogTitle>
//                 <DialogContent>
//                     <div className="row">
//                         {filterColumns.map((column, index) => (
//                             <div className="col-12 p-2" key={index}>
//                                 {renderFilter(column)}
//                             </div>
//                         ))}
//                     </div>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={onCloseFilterDialog} variant="outlined">Close</Button>
//                 </DialogActions>
//             </Dialog>

//             <Snackbar
//                 open={snackbar.open}
//                 autoHideDuration={6000}
//                 onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
//             >
//                 <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
//                     {snackbar.message}
//                 </Alert>
//             </Snackbar>
//         </>
//     );

//     return (
//         <>
//             <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
//                 <Tabs
//                     value={activeTab}
//                     onChange={(_, newVal) => handleTabChange(newVal)}
//                     textColor="primary"
//                     indicatorColor="primary"
//                 >
//                     <Tab label="Sale Invoice" value="sale_invoice" />
//                     <Tab label="Price List" value="price_list" />
//                     <Tab label="Sale Order" value="sale_order" />
//                     <Tab label="Receipt List" value="receipt_list" />
//                 </Tabs>
//             </Box>

//             {activeTab === 'sale_invoice' && (
//                 <FilterableTable
//                     title={viewMode === 'pending' ? "Pending Sale Invoices" : "Sale Invoices"}
//                     columns={saleInvoiceColumns}
//                     dataArray={filteredData}
//                     EnableSerialNumber
//                     ButtonArea={sharedButtonArea}
//                 />
//             )}

//             {activeTab === 'price_list' && (
//                 <FilterableTable
//                     title="Price List - Retailers"
//                     columns={priceListColumns}
//                     dataArray={filteredPriceListRetailers}
//                     EnableSerialNumber
//                     ButtonArea={sharedButtonArea}
//                 />
//             )}

//             {activeTab === 'sale_order' && (
//                 <FilterableTable
//                     title={viewMode === 'pending' ? "Pending Sale Orders" : "Sale Orders"}
//                     columns={saleOrderColumns}
//                     dataArray={filteredData}
//                     EnableSerialNumber
//                     ButtonArea={sharedButtonArea}
//                 />
//             )}

//             {activeTab === 'receipt_list' && (
//                 <>
//                     <ReceiptFilterBar />
//                     <FilterableTable
//                         title="Receipt List"
//                         columns={receiptColumns}
//                         dataArray={filteredData}
//                         EnableSerialNumber
//                         ButtonArea={sharedButtonArea}
//                     />
//                 </>
//             )}
            
//             {sharedDialogs}
//         </>
//     );
// };

// export default Whatsapp;




// // import { useState, useEffect, useMemo, useRef } from "react";
// // import { checkIsNumber, isEqualNumber, ISOString, toArray, toNumber, RoundNumber, NumberFormat, LocalDateWithTime } from "../../../Components/functions";
// // import { fetchLink } from "../../../Components/fetchComponent";
// // import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
// // import {
// //     Autocomplete,
// //     Button,
// //     Checkbox,
// //     Select as MuiSelect,
// //     MenuItem,
// //     Dialog,
// //     DialogActions,
// //     DialogContent,
// //     DialogTitle,
// //     IconButton,
// //     Typography,
// //     TextField,
// //     Tooltip,
// //     Box,
// //     Divider,
// //     Snackbar,
// //     Alert,
// //     Radio,
// //     RadioGroup,
// //     InputLabel,
// //     FormControl,
// //     FormControlLabel,
// //     Menu,
// //     ListItemIcon,
// //     ListItemText,
// //     CircularProgress,
// //     Tab,
// //     Tabs,
// // } from "@mui/material";
// // import Select from "react-select";
// // import { customSelectStyles } from "../../../Components/tablecolumn";
// // import { reactSelectFilterLogic } from "../../../Components/functions";
// // import {
// //     CheckBox,
// //     CheckBoxOutlineBlank,
// //     FilterAlt,
// //     PersonAdd,
// //     Print,
// //     Search,
// //     HourglassEmpty,
// //     Download,
// //     PictureAsPdf,
// //     TableChart,
// //     ArrowDropDown
// // } from "@mui/icons-material";
// // import { toast } from "react-toastify";
// // import { useReactToPrint } from "react-to-print";
// // import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
// // import WhatsAppIcon from '@mui/icons-material/WhatsApp';
// // import { DotPeWhatsAppService } from "../../../Components/dotpeWhatsappService";
// // import { Dot_Pe_Number } from "../../../encryptionKey";
// // import api from "../../../API";
// // import jsPDF from 'jspdf';
// // import 'jspdf-autotable';
// // import * as XLSX from 'xlsx';
// // import { saveAs } from 'file-saver';


// // const ASKEVA_CONFIG = {
// //     token: "ab232386697556df6e520afa18b48c46437849656eaf7a610c1d6150937aa2d11c2d4b3051674dfe37c020228da69c8fcda367a40a7e6a727ae020bcd7e27094",
// //     apiEndpoint: "https://backend.askeva.io/v1/message/send-message",
// //     templateName: "sale" 
// // };

// // const icon = <CheckBoxOutlineBlank fontSize="small" />;
// // const checkedIcon = <CheckBox fontSize="small" />;

// // const multipleStaffUpdateInitialValues = {
// //     CostCategory: { label: "", value: "" },
// //     Do_Id: [],
// //     involvedStaffs: [],
// //     staffInvolvedStatus: 0,
// //     deliveryStatus: 5,
// // };

// // const multipleStaffRemoveInitialValues = {
// //     CostCategory: { label: "", value: "" },
// //     Do_Id: [],
// //     involvedStaffs: [],
// //     staffInvolvedStatus: 0,
// //     deliveryStatus: 5,
// // };

// // const normalize = (v) => String(v ?? "").toLowerCase().trim();

// // const uniqueCaseInsensitive = (values) => {
// //     const map = new Map();
// //     for (const v of values) {
// //         const s = String(v ?? "").trim();
// //         if (!s) continue;
// //         const key = s.toLowerCase();
// //         if (!map.has(key)) map.set(key, s);
// //     }
// //     return Array.from(map.values());
// // };

// // const getCostTypeEmployees = (invoiceOrRow, costTypeId) => {
// //     const invoiceEmployee = toArray(invoiceOrRow?.involvedStaffs);
// //     return invoiceEmployee
// //         .filter((emp) => isEqualNumber(emp.Emp_Type_Id, costTypeId))
// //         .map((emp) => String(emp.Emp_Name ?? "").trim())
// //         .filter(Boolean);
// // };

// // const Whatsapp = ({ loadingOn, loadingOff, AddRights, EditRights, PrintRights, pageID }) => {
// //     const [salesInvoices, setSalesInvoices] = useState([]);
// //     const [allInvoices, setAllInvoices] = useState([]);
// //     const [costCenterData, setCostCenterData] = useState([]);
// //     const [costTypes, setCostTypes] = useState([]);
// //     const [uniqueInvolvedCost, setUniqueInvolvedCost] = useState([]);
// //     const [viewMode, setViewMode] = useState('normal');
// //     const [isLoading, setIsLoading] = useState(true);
// //     const [isRefreshing, setIsRefreshing] = useState(false);
// //     const [hasInitialLoading, setHasInitialLoading] = useState(false);
// //     const [currentPrintType, setCurrentPrintType] = useState('');
// //     const [selectAllCheckBox, setSelectAllCheckBox] = useState(false);
// //     const [downloadLoading, setDownloadLoading] = useState(false);
// //     const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);
// //     const [phoneMap, setPhoneMap] = useState(new Map());
// //     const [isPhoneMapLoaded, setIsPhoneMapLoaded] = useState(false);
// //     const [initialDataLoaded, setInitialDataLoaded] = useState(false);
// //     const [activeTab, setActiveTab] = useState('sale_invoice');
// //     const tableContainerRef = useRef(null);

// //     const storage = JSON.parse(localStorage.getItem("user"));
// //     const [pdfGeneration, setPdfGeneration] = useState({
// //         loading: false,
// //         pdfUrl: null, token: null,
// //         fileName: null,
// //         error: null
// //     });

// //     const [multipleCostCenterUpdateValues, setMultipleCostCenterUpdateValues] = useState(
// //         multipleStaffUpdateInitialValues
// //     );

// //     const [multipleStaffRemoveValues, setMultipleStaffRemoveValues] = useState(
// //         multipleStaffRemoveInitialValues
// //     );

// //     const [sendingStates, setSendingStates] = useState({});

// //     const handleDownloadClick = (event) => {
// //         setDownloadAnchorEl(event.currentTarget);
// //     };

// //     const [printReady, setPrintReady] = useState(false);
// //     const [columnFilters, setColumnFilters] = useState({});
// //     const [filteredData, setFilteredData] = useState([]);

// //     const [deliverySlipPrint, setDeliverySlipPrint] = useState({
// //         Do_Id: null,
// //         Do_Date: null,
// //         open: false
// //     });

// //     const [whatsappDialog, setWhatsappDialog] = useState({
// //         open: false,
// //         order: null,
// //         loading: false,
// //         method: 'template',
// //     });

// //     const [templates, setTemplates] = useState([]);
// //     const [selectedTemplate, setSelectedTemplate] = useState("");
// //     const [snackbar, setSnackbar] = useState({
// //         open: false,
// //         message: "",
// //         severity: "success",
// //     });

// //     const [filters, setFilters] = useState({
// //         reqDate: ISOString(),
// //         assignDialog: false,
// //         filterDialog: false,
// //         selectedInvoice: null,
// //         multipleStaffUpdateDialog: false,
// //         multipleStaffRemoveDialog: false,
// //         fetchTrigger: 0,
// //         docType: "",
// //         staffStatus: 0,
// //     });

// //     const [multiPrint, setMultiPrint] = useState({
// //         open: false,
// //         doIds: [],
// //         docType: ""
// //     });

// //     const multiPrintRef = useRef(null);

// //     const pdfTemplates = useMemo(() => {
// //         return (templates || []).filter(t => {
// //             const templateName = t.templateName || t.name || '';
// //             return templateName.toLowerCase().includes('pdf') ||
// //                 templateName.toLowerCase().includes('invoice');
// //         });
// //     }, [templates]);

// //     const otherTemplates = useMemo(() => {
// //         return (templates || []).filter(t => {
// //             const templateName = t.templateName || t.name || '';
// //             return !(templateName.toLowerCase().includes('pdf') ||
// //                 templateName.toLowerCase().includes('invoice'));
// //         });
// //     }, [templates]);

// //     const columns = useMemo(
// //         () => [
// //             { Field_Name: "Do_Inv_No", Fied_Data: "string", ColumnHeader: "Invoice" },
// //             { Field_Name: "voucherTypeGet", Fied_Data: "string", ColumnHeader: "Voucher" },
// //             { Field_Name: "retailerNameGet", Fied_Data: "string", ColumnHeader: "Customer" },
// //         ],
// //         []
// //     );

// //     const calculateAltActQty = (item) => {
// //         if (item.Alt_Act_Qty !== undefined && item.Alt_Act_Qty !== null) {
// //             return Number(item.Alt_Act_Qty) || 0;
// //         }
// //         const billQty = Number(item.Bill_Qty) || 0;
// //         const conversionFactor = Number(item.PackValue) || 1;
// //         const possibleAltFields = ['AltQty', 'Alt_Act_Qty', 'Alt_Qty', 'Alternate_Qty', 'Actual_Qty'];
// //         for (const field of possibleAltFields) {
// //             if (item[field] !== undefined && item[field] !== null) {
// //                 return Number(item[field]) || 0;
// //             }
// //         }
// //         return billQty * conversionFactor;
// //     };

// //     const fetchPhoneMap = async () => {
// //         try {
// //             const response = await fetchLink({ address: `masters/getlolDetails` });
// //             if (response && response.success && response.data) {
// //                 const map = new Map();
// //                 response.data.forEach(item => {
// //                     if (item.A1) map.set(Number(item.Ret_Id), item.A1);
// //                 });
// //                 setPhoneMap(map);
// //                 setIsPhoneMapLoaded(true);
// //                 return map;
// //             }
// //             return new Map();
// //         } catch (error) {
// //             console.error("Error fetching phone numbers:", error);
// //             setIsPhoneMapLoaded(true);
// //             return new Map();
// //         }
// //     };

// //     const filterInvoicesByPhone = (invoices, phoneMapData) => {
// //         if (!phoneMapData || phoneMapData.size === 0) return invoices;
// //         return invoices.filter(invoice => phoneMapData.has(Number(invoice.Retailer_Id)));
// //     };

// //     const fetchAllInvoices = async (refresh = false) => {
// //         try {
// //             if (!refresh) setIsLoading(true);
// //             else setIsRefreshing(true);
// //             setViewMode('normal');
// //             const data = await fetchLink({
// //                 address: `sales/salesInvoice/lrReportWhatsapp?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`,
// //                 loadingOn,
// //                 loadingOff,
// //             });
// //             const invoices = toArray(data.data);
// //             setAllInvoices(invoices);
// //             const processedInvoices = invoices.map(invoice => {
// //                 if (invoice.stockDetails && Array.isArray(invoice.stockDetails)) {
// //                     const processedStockDetails = invoice.stockDetails.map(item => ({
// //                         ...item,
// //                         Alt_Act_Qty: calculateAltActQty(item)
// //                     }));
// //                     return { ...invoice, stockDetails: processedStockDetails };
// //                 }
// //                 return invoice;
// //             });
// //             if (isPhoneMapLoaded) {
// //                 setSalesInvoices(filterInvoicesByPhone(processedInvoices, phoneMap));
// //             } else {
// //                 setAllInvoices(processedInvoices);
// //             }
// //             setCostTypes(toArray(data?.others?.costTypes));
// //             setUniqueInvolvedCost(toArray(data?.others?.uniqeInvolvedStaffs));
// //             if (!hasInitialLoading) setHasInitialLoading(true);
// //         } catch (error) {
// //             console.error("Error fetching invoices:", error);
// //             toast.error("Failed to load invoices");
// //         } finally {
// //             if (!refresh) setIsLoading(false);
// //             setIsRefreshing(false);
// //         }
// //     };

// //     const fetchPendingInvoices = async () => {
// //         try {
// //             setIsLoading(true);
// //             setViewMode('pending');
// //             const data = await fetchLink({
// //                 address: `sales/salesInvoice/pendingDetails?reqDate=${filters.reqDate}`,
// //                 loadingOn,
// //                 loadingOff,
// //             });
// //             const invoices = toArray(data.data);
// //             setAllInvoices(invoices);
// //             const processedInvoices = invoices.map(invoice => {
// //                 if (invoice.stockDetails && Array.isArray(invoice.stockDetails)) {
// //                     const processedStockDetails = invoice.stockDetails.map(item => ({
// //                         ...item,
// //                         Alt_Act_Qty: calculateAltActQty(item)
// //                     }));
// //                     return { ...invoice, stockDetails: processedStockDetails };
// //                 }
// //                 return invoice;
// //             });
// //             if (isPhoneMapLoaded) {
// //                 setSalesInvoices(filterInvoicesByPhone(processedInvoices, phoneMap));
// //             } else {
// //                 setAllInvoices(processedInvoices);
// //             }
// //             if (data?.others?.costTypes) setCostTypes(toArray(data?.others?.costTypes));
// //             if (data?.others?.uniqeInvolvedStaffs) setUniqueInvolvedCost(toArray(data?.others?.uniqeInvolvedStaffs));
// //         } catch (error) {
// //             console.error("Error fetching pending invoices:", error);
// //             toast.error("Failed to load pending invoices");
// //         } finally {
// //             setIsLoading(false);
// //         }
// //     };

// //     const fetchTemplates = async () => {
// //         try {
// //             const response = await DotPeWhatsAppService.fetchTemplates('APPROVED');
// //             if (response.status && response.data) {
// //                 let templatesData = [];
// //                 if (Array.isArray(response.data)) templatesData = response.data;
// //                 else if (response.data.data && Array.isArray(response.data.data)) templatesData = response.data.data;
// //                 else if (response.data.templates && Array.isArray(response.data.templates)) templatesData = response.data.templates;
// //                 if (templatesData.length > 0) {
// //                     setTemplates(templatesData);
// //                     templatesData.forEach(template => {
// //                         const name = template.templateName || template.name || '';
// //                         if (name.includes('sales_invoice_order')) setSelectedTemplate(name);
// //                     });
// //                 }
// //             }
// //         } catch (error) {
// //             console.error('Failed to fetch templates:', error);
// //         }
// //     };

// //     const fetchCostCenterData = async () => {
// //         try {
// //             const costCenterData = await fetchLink({ address: "masters/erpCostCenter/dropDown" });
// //             setCostCenterData(toArray(costCenterData.data));
// //         } catch (error) {
// //             console.error("Error fetching cost center data:", error);
// //             toast.error("Failed to load cost center data");
// //         }
// //     };

// // // Test function to try with different parameter counts
// // const testAskevaParameterCount = async () => {
// //     const testCounts = [1, 2, 3, 4, 5];
    
// //     for (const count of testCounts) {
// //         const params = [];
// //         for (let i = 1; i <= count; i++) {
// //             params.push({ type: "text", text: `Test ${i}` });
// //         }
        
// //         const payload = {
// //             to: "918667834261",
// //             type: "template",
// //             template: {
// //                 language: { policy: "deterministic", code: "en" },
// //                 name: "saleorders_copy",
// //                 components: [{ type: "body", parameters: params }]
// //             }
// //         };
        
      
        
// //         const response = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${ASKEVA_CONFIG.token}`, {
// //             method: 'POST',
// //             headers: { 'Content-Type': 'application/json' },
// //             body: JSON.stringify(payload)
// //         });
        
// //         const data = await response.json();
        
        
// //         if (response.ok) {
         
// //             break;
// //         }
// //     }
// // };

// //  const getPDFUrlForInvoice = (order) => {
// //     try {
// //         const formattedInvoiceNo = order.Do_Inv_No.replace(/_/g, '/');
// //         const encodedInvoiceNo = btoa(formattedInvoiceNo);
// //         const companyId = storage?.Company_id;
// //         return `https://printapp.erpsmt.in/sales/downloadPdf?Do_Inv_No=${encodedInvoiceNo}&Company_id=${companyId}`;
// //     } catch (error) {
// //         console.error('Error generating PDF URL:', error);
// //         return order.Do_Inv_No;
// //     }
// // };


// // const fetchAskevaTemplates = async () => {
// //     try {
// //         const response = await fetch(`https://backend.askeva.io/v1/templates?token=${ASKEVA_CONFIG.token}`, {
// //             method: 'GET',
// //             headers: {
// //                 'Content-Type': 'application/json'
// //             }
// //         });
// //         const data = await response.json();
        
// //         return data;
// //     } catch (error) {
// //         console.error('Error fetching templates:', error);
// //     }
// // };


// // useEffect(() => {
// //     fetchAskevaTemplates();
// // }, []);


// // const sendPriceListWhatsAppNoHeader = async (row) => {
// //     const invoiceId = row.Do_Id;
// //     setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
    
// //     try {
// //         const retailerId = Number(row?.Retailer_Id);
// //         let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
        
// //         if (!recipientPhone) {
// //             toast.error('Customer phone number not found');
// //             return false;
// //         }

// //         recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
// //         if (recipientPhone.startsWith('0')) {
// //             recipientPhone = recipientPhone.substring(1);
// //         }
// //         if (!recipientPhone.startsWith('91')) {
// //             recipientPhone = `91${recipientPhone}`;
// //         }

// //         const pdfUrl = getPDFUrlForInvoice(row);
// //         const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
// //         const invoiceNo = row.Do_Inv_No || 'N/A';
// //         const invoiceDate = new Date(row.Do_Date || row.createdOn).toLocaleDateString('en-GB');
// //         const totalAmount = Number(row.Total_Invoice_value || 0).toFixed(2);
        
      
// //         const payload = {
// //             to: recipientPhone,
// //             type: "template",
// //             template: {
// //                 name: ASKEVA_CONFIG.templateName,
// //                 language: {
// //                     code: "en"
// //                 },
// //                 components: [
// //                     {
// //                         type: "body",
// //                         parameters: [
// //                             {
// //                                 type: "text",
// //                                 text: customerName
// //                             },
// //                             {
// //                                 type: "text",
// //                                 text: invoiceNo
// //                             },
// //                             {
// //                                 type: "text",
// //                                 text: invoiceDate
// //                             },
// //                             {
// //                                 type: "text",
// //                                 text: totalAmount
// //                             },
// //                             {
// //                                 type: "text",
// //                                 text: pdfUrl
// //                             }
// //                         ]
// //                     }
// //                 ]
// //             }
// //         };
        
      
        
// //         const response = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${ASKEVA_CONFIG.token}`, {
// //             method: 'POST',
// //             headers: {
// //                 'Content-Type': 'application/json',
// //             },
// //             body: JSON.stringify(payload)
// //         });
        
// //         const data = await response.json();
       
        
// //         if (response.ok) {
// //             toast.success('Price list sent successfully via WhatsApp!');
// //             return true;
// //         } else {
// //             throw new Error(data.message || data.error || 'Failed to send');
// //         }
// //     } catch (error) {
// //         console.error('Error:', error);
// //         toast.error(`Failed: ${error.message}`);
// //         return false;
// //     } finally {
// //         setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
// //     }
// // };



// // const sendPriceListWhatsApp = async (row) => {
// //     const invoiceId = row.Do_Id;
// //     setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
    
// //     try {
// //         const retailerId = Number(row?.Retailer_Id);
// //         let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
        
// //         if (!recipientPhone) {
// //             toast.error('Customer phone number not found');
// //             return false;
// //         }

// //         recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
// //         if (recipientPhone.startsWith('0')) {
// //             recipientPhone = recipientPhone.substring(1);
// //         }
// //         if (!recipientPhone.startsWith('91')) {
// //             recipientPhone = `91${recipientPhone}`;
// //         }

// //         const pdfUrl = getPDFUrlForInvoice(row);
        
// //         // Format the data according to template attributes
// //         const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
// //         const invoiceNo = row.Do_Inv_No || 'N/A';
// //         const invoiceDate = new Date(row.Do_Date || row.createdOn).toLocaleDateString('en-GB');
// //         const totalAmount = Number(row.Total_Invoice_value || 0).toFixed(2);
        
// //         // First, let's check what template parameters are expected
// //         // You might need to adjust the number of parameters based on your template
// //         // The error suggests you need to match the exact number of parameters your template expects
        
// //         const payload = {
// //             to: recipientPhone,
// //             type: "template",
// //             template: {
// //                 name: ASKEVA_CONFIG.templateName,
// //                 language: {
// //                     code: "en"
// //                 },
// //                 components: [
// //                     {
// //                         type: "body",
// //                         parameters: [
// //                             {
// //                                 type: "text",
// //                                 text: customerName  // Parameter 1
// //                             },
// //                             {
// //                                 type: "text",
// //                                 text: invoiceNo     // Parameter 2
// //                             },
// //                             {
// //                                 type: "text",
// //                                 text: invoiceDate   // Parameter 3
// //                             },
// //                             {
// //                                 type: "text",
// //                                 text: totalAmount   // Parameter 4
// //                             },
// //                             {
// //                                 type: "text",
// //                                 text: pdfUrl        // Parameter 5
// //                             }
// //                         ]
// //                     }
// //                 ]
// //             }
// //         };
        
      
        
// //         const response = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${ASKEVA_CONFIG.token}`, {
// //             // method: 'POST',
// //             headers: {
// //                 'Content-Type': 'application/json',
// //             },
// //             body: JSON.stringify(payload)
// //         });
        
// //         const data = await response.json();
      
        
// //         if (response.ok) {
// //             toast.success('Price list sent successfully via WhatsApp!');
// //             return true;
// //         } else {
// //             // Handle parameter mismatch error
// //             if (data.code === 132000) {
// //                 toast.error(`Template parameter mismatch: Expected ${data.error_data?.expected_params || '?'} parameters, but sent 5`);
// //                 console.error('Template error details:', data.error_data);
// //             } else {
// //                 toast.error(`Failed: ${data.message || 'Unknown error'}`);
// //             }
// //             return false;
// //         }
// //     } catch (error) {
// //         console.error('Error sending price list:', error);
// //         toast.error(`Failed to send price list: ${error.message}`);
// //         return false;
// //     } finally {
// //         setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
// //     }
// // };


// // const sendSaleOrderWhatsApp = async (row, isSaleOrderTab) => {
// //     const invoiceId = row.Do_Id;
// //     setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
    
// //     try {
// //         const retailerId = Number(row?.Retailer_Id);
// //         let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
        
// //         if (!recipientPhone) {
// //             toast.error('Customer phone number not found');
// //             return false;
// //         }

// //         recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
// //         if (recipientPhone.startsWith('0')) {
// //             recipientPhone = recipientPhone.substring(1);
// //         }
// //         if (!recipientPhone.startsWith('91')) {
// //             recipientPhone = `91${recipientPhone}`;
// //         }

// //         const pdfUrl = getPDFUrlForInvoice(row);
// //         const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
// //         const invoiceNo = row.Do_Inv_No || 'N/A';
// //         const invoiceDate = new Date(row.Do_Date || row.createdOn).toLocaleDateString('en-GB');
// //         const totalAmount = Number(row.Total_Invoice_value || 0).toFixed(2);
        
   
// //         // const templateName = "sale_order";

// //         const templateName="sale_order_thanks";
        
// //         const payload = {
// //             to: recipientPhone,
// //             type: "template",
// //             template: {
// //                 name: templateName,
// //                 language: {
// //                     code: "ta"
// //                 },
// //                 components: [
// //                     {
// //                         type: "body",
// //                         parameters: [
// //                             { type: "text", text: customerName },
// //                             { type: "text", text: invoiceNo },
// //                             { type: "text", text: invoiceDate },
// //                             { type: "text", text: totalAmount },
// //                             { type: "text", text: pdfUrl }
// //                         ]
// //                     }
// //                 ]
// //             }
// //         };
        
// //         const response = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${ASKEVA_CONFIG.token}`, {
// //             method: 'POST',
// //             headers: { 'Content-Type': 'application/json' },
// //             body: JSON.stringify(payload)
// //         });
        
// //         const data = await response.json();
        
// //         if (response.ok) {
// //             toast.success('Sale Order sent successfully via WhatsApp!');
// //             return true;
// //         } else {
// //             toast.error(`Failed: ${data.message || 'Unknown error'}`);
// //             return false;
// //         }
// //     } catch (error) {
// //         console.error('Error sending sale order:', error);
// //         toast.error(`Failed to send sale order: ${error.message}`);
// //         return false;
// //     } finally {
// //         setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
// //     }
// // };


// // const sendPriceListWhatsAppAlt = async (row) => {
// //     const invoiceId = row.Do_Id;
// //     setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
    
// //     try {
// //         const retailerId = Number(row?.Retailer_Id);
// //         let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
        
// //         if (!recipientPhone) {
// //             toast.error('Customer phone number not found');
// //             return false;
// //         }

// //         recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
// //         if (recipientPhone.startsWith('0')) {
// //             recipientPhone = recipientPhone.substring(1);
// //         }
// //         if (!recipientPhone.startsWith('91')) {
// //             recipientPhone = `91${recipientPhone}`;
// //         }

// //         const pdfUrl = getPDFUrlForInvoice(row);
// //         const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
// //         const invoiceNo = row.Do_Inv_No || 'N/A';
// //         const invoiceDate = new Date(row.Do_Date || row.createdOn).toLocaleDateString('en-GB');
// //         const totalAmount = Number(row.Total_Invoice_value || 0).toFixed(2);
        
// //         // Alternative format - parameters as simple array
// //         const payload = {
// //             to: recipientPhone,
// //             type: "template",
// //             template: {
// //                 name: ASKEVA_CONFIG.templateName,
// //                 language: {
// //                     code: "en"
// //                 },
// //                 components: [
// //                     {
// //                         type: "body",
// //                         parameters: [
// //                             customerName,
// //                             invoiceNo,
// //                             invoiceDate,
// //                             totalAmount,
// //                             pdfUrl
// //                         ]
// //                     }
// //                 ]
// //             }
// //         };
        

        
// //         const response = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${ASKEVA_CONFIG.token}`, {
// //             method: 'POST',
// //             headers: {
// //                 'Content-Type': 'application/json',
// //             },
// //             body: JSON.stringify(payload)
// //         });
        
// //         const data = await response.json();
   
        
// //         if (response.ok) {
// //             toast.success('Price list sent successfully!');
// //             return true;
// //         } else {
// //             throw new Error(data.message || 'Failed to send');
// //         }
// //     } catch (error) {
// //         console.error('Error:', error);
// //         toast.error(`Failed: ${error.message}`);
// //         return false;
// //     } finally {
// //         setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
// //     }
// // };

// //     const sendSaleInvoiceWhatsApp = async (row) => {
// //         const invoiceId = row.Do_Id;
// //         setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
        
// //         try {
// //             const retailerId = Number(row?.Retailer_Id);
// //             const recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
            
// //             if (!recipientPhone) {
// //                 toast.error('Customer phone number not found');
// //                 return false;
// //             }

// //             await generateAndStorePDF(row);
// //             const pdfUrl = getPDFUrlSimple(row);
// //             const invoiceNo = row.Do_Inv_No || 'N/A';
// //             const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
// //             const formattedDate = new Date(row.Do_Date || row.createdOn).toLocaleDateString('en-GB');
// //             const totalAmount = (row.Total_Invoice_value || 0).toFixed(2);
// //             const CompanyName = storage?.Company_id == 1 ? "SM TRADERS" : "MOBITE";
            
// //             const payload = {
// //                 template: { name: "sales_invoice_order", language: "en" },
// //                 source: "crm",
// //                 wabaNumber: Dot_Pe_Number,
// //                 recipients: [`91${recipientPhone}`],
// //                 clientRefId: `invoice_${invoiceNo.replace(/\//g, '_')}_${Date.now()}`,
// //                 params: {
// //                     body: [customerName, invoiceNo, formattedDate, totalAmount, CompanyName, pdfUrl]
// //                 }
// //             };
            
// //             const response = await DotPeWhatsAppService.sendTemplateMessage(payload);
// //             if (response?.status) {
// //                 toast.success('Sale invoice sent successfully via WhatsApp!');
// //                 return true;
// //             } else {
// //                 throw new Error(response?.message || 'Failed to send message');
// //             }
// //         } catch (error) {
// //             console.error('Error sending WhatsApp:', error);
// //             toast.error(`Failed to send message: ${error.message}`);
// //             return false;
// //         } finally {
// //             setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
// //         }
// //     };

// //     // Generic WhatsApp handler
// //     const handleWhatsAppClick = async (row, isPriceListTab = false) => {
// //         if (isPriceListTab) {
// //             await sendPriceListWhatsApp(row);
// //         } else {
// //             await sendSaleInvoiceWhatsApp(row);
// //         }
// //     };

// //     useEffect(() => {
// //         const initializeData = async () => {
// //             try {
// //                 setIsLoading(true);
// //                 const map = await fetchPhoneMap();
// //                 await fetchAllInvoices();
// //                 await fetchCostCenterData();
// //                 setInitialDataLoaded(true);
// //             } catch (error) {
// //                 console.error("Error fetching initial data:", error);
// //                 toast.error("Failed to load initial data");
// //             } finally {
// //                 setIsLoading(false);
// //             }
// //         };
// //         initializeData();
// //         fetchTemplates();
// //     }, []);

// //     useEffect(() => {
// //         if (isPhoneMapLoaded && allInvoices.length > 0 && !initialDataLoaded) {
// //             const processedInvoices = allInvoices.map(invoice => {
// //                 if (invoice.stockDetails && Array.isArray(invoice.stockDetails)) {
// //                     const processedStockDetails = invoice.stockDetails.map(item => ({
// //                         ...item,
// //                         Alt_Act_Qty: calculateAltActQty(item)
// //                     }));
// //                     return { ...invoice, stockDetails: processedStockDetails };
// //                 }
// //                 return invoice;
// //             });
// //             setSalesInvoices(filterInvoicesByPhone(processedInvoices, phoneMap));
// //         }
// //     }, [isPhoneMapLoaded, allInvoices, initialDataLoaded]);

// //     useEffect(() => {
// //         if (initialDataLoaded) {
// //             if (viewMode === 'normal') fetchAllInvoices(true);
// //             else if (viewMode === 'pending') fetchPendingInvoices();
// //         }
// //     }, [filters.fetchTrigger, filters.staffStatus, filters.reqDate, viewMode, initialDataLoaded]);

// //     useEffect(() => {
// //         if (multiPrint.open) {
// //             const timer = setTimeout(() => {
// //                 if (multiPrintRef.current) setPrintReady(true);
// //             }, 300);
// //             return () => clearTimeout(timer);
// //         } else {
// //             setPrintReady(false);
// //         }
// //     }, [multiPrint.open, multiPrint.doIds, multiPrint.docType]);

// //     const showSnackbar = (message, severity = "success") => {
// //         setSnackbar({ open: true, message, severity });
// //     };

// //     const closeWhatsAppDialog = () => {
// //         setWhatsappDialog({ open: false, order: null, loading: false, method: 'template' });
// //         setSelectedTemplate("");
// //     };

// //     const getPDFUrlSimple = (order) => {
// //         const baseUrl = api;
// //         const formattedInvoiceNo = order.Do_Inv_No.replace(/_/g, '/');
// //         const encodedInvoiceNo = btoa(formattedInvoiceNo);
// //         const companyid = btoa(storage?.Company_id);
// //         return `https://printapp.erpsmt.in/sales/downloadPdf?Do_Inv_No=${encodedInvoiceNo}&Company_id=${companyid}`;
// //     };

// //     const generateInvoicePDF = async (order, companyId) => {
// //         try {
// //             const requestBody = {
// //                 invoiceId: order.Do_Inv_No,
// //                 companyId: companyId,
// //                 invoiceData: {
// //                     Do_Inv_No: order.Do_Inv_No,
// //                     Total_Invoice_value: order.Total_Invoice_value || 0,
// //                     retailerNameGet: order.retailerNameGet || order.Retailer_Name || 'Customer',
// //                     Do_Date: order.Do_Date || order.So_Date,
// //                     So_No: order.So_No || order.Do_No || 'N/A',
// //                     Retailer_Name: order.Retailer_Name || order.retailerNameGet,
// //                     Retailer_Address: order.Retailer_Address || 'Address not available',
// //                     Retailer_GSTIN: order.Retailer_GSTIN || 'Not Available',
// //                     CSGT_Total: order.CSGT_Total || 0,
// //                     SGST_Total: order.SGST_Total || 0,
// //                     IGST_Total: order.IGST_Total || 0,
// //                     Round_off: order.Round_off || 0,
// //                     CSGT_Percentage: order.CSGT_Percentage || 0,
// //                     SGST_Percentage: order.SGST_Percentage || 0,
// //                     IGST_Percentage: order.IGST_Percentage || 0,
// //                     stockDetails: order.stockDetails || order.ProductList || []
// //                 }
// //             };
// //             const response = await fetchLink({
// //                 address: "sales/generatePdf",
// //                 method: "POST",
// //                 bodyData: requestBody,
// //                 loadingOn,
// //                 loadingOff,
// //             });
// //             return response;
// //         } catch (error) {
// //             console.error('Error generating PDF:', error);
// //             throw error;
// //         }
// //     };

// //     const generateAndStorePDF = async (order) => {
// //         try {
// //             setPdfGeneration({ loading: true, pdfUrl: null, error: null });
// //             const storage = JSON.parse(localStorage.getItem("user"));
// //             const companyId = storage?.Company_id;
// //             if (!companyId) throw new Error('Company ID not found');
// //             const response = await generateInvoicePDF(order, companyId);
// //             if (response.success && response.data) {
// //                 const pdfUrl = response.data.pdfUrl;
// //                 setPdfGeneration({
// //                     loading: false,
// //                     pdfUrl: pdfUrl,
// //                     token: response.data.token,
// //                     fileName: response.data.fileName,
// //                     error: null
// //                 });
// //                 return { pdfUrl: pdfUrl, token: response.data.token, fileName: response.data.fileName };
// //             } else {
// //                 throw new Error(response.message || 'Failed to generate PDF');
// //             }
// //         } catch (error) {
// //             console.error('Error generating PDF:', error);
// //             setPdfGeneration({ loading: false, pdfUrl: null, error: error.message });
// //             throw error;
// //         }
// //     };

// //     const renderWhatsAppDialogContent = () => {
// //         const { order, method } = whatsappDialog;
// //         return (
// //             <Box>
// //                 <Box mb={2}>
// //                     <Typography variant="subtitle2" color="textSecondary">
// //                         Order: <strong>{order?.Do_Inv_No}</strong>
// //                     </Typography>
// //                     <Typography variant="subtitle2" color="textSecondary">
// //                         Customer: <strong>{order?.retailerNameGet}</strong>
// //                     </Typography>
// //                     <Typography variant="subtitle2" color="textSecondary">
// //                         Phone: <strong>{order?.recipientPhone || order?.A1 || '-'}</strong>
// //                     </Typography>
// //                     <Typography variant="subtitle2" color="textSecondary">
// //                         Amount: <strong>₹{NumberFormat(order?.Total_Invoice_value)}</strong>
// //                     </Typography>
// //                 </Box>
// //                 <Divider sx={{ my: 2 }} />
// //                 {pdfGeneration.loading && (
// //                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
// //                         <CircularProgress size={20} />
// //                         <Typography variant="body2">Generating PDF document...</Typography>
// //                     </Box>
// //                 )}
// //                 {pdfGeneration.error && (
// //                     <Alert severity="error" sx={{ my: 2 }}>
// //                         <Typography variant="body2">Failed to generate PDF: {pdfGeneration.error}</Typography>
// //                         <Button size="small" onClick={() => generateAndStorePDF(order)} sx={{ mt: 1 }}>
// //                             Retry PDF Generation
// //                         </Button>
// //                     </Alert>
// //                 )}
// //                 {pdfGeneration.pdfUrl && !pdfGeneration.loading && (
// //                     <Alert severity="success" sx={{ my: 2 }}>
// //                         <Typography variant="body2" fontWeight="bold">✓ PDF generated successfully!</Typography>
// //                         <Box sx={{ mt: 1 }}>
// //                             <Typography variant="caption" display="block">File: {pdfGeneration.fileName}</Typography>
// //                             <Typography variant="caption" display="block">Secure URL generated with token</Typography>
// //                             <Button
// //                                 size="small"
// //                                 variant="outlined"
// //                                 onClick={() => downloadInvoicePDF(order.Do_Inv_No, pdfGeneration.fileName)}
// //                                 sx={{ mt: 1 }}
// //                                 startIcon={<Print fontSize="small" />}
// //                             >
// //                                 Test Download PDF
// //                             </Button>
// //                         </Box>
// //                     </Alert>
// //                 )}
// //                 <Box mb={2}>
// //                     <Typography variant="subtitle1" fontWeight="bold" mb={1}>Choose sending method:</Typography>
// //                     <RadioGroup
// //                         value={method}
// //                         onChange={(e) => setWhatsappDialog(prev => ({ ...prev, method: e.target.value }))}
// //                     >
// //                         <FormControlLabel
// //                             value="pdf-link"
// //                             control={<Radio size="small" />}
// //                             label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><span>Send PDF Download Link</span></Box>}
// //                             disabled={!pdfGeneration.pdfUrl && !pdfGeneration.loading}
// //                         />
// //                         <FormControlLabel value="pdf-template" control={<Radio size="small" />} label="Send with PDF Template" />
// //                         <FormControlLabel value="other-template" control={<Radio size="small" />} label="Send with Text Template" />
// //                     </RadioGroup>
// //                 </Box>
// //                 {method === 'pdf-template' && (
// //                     <Box>
// //                         <FormControl fullWidth variant="outlined" size="small">
// //                             <InputLabel>Select PDF Template</InputLabel>
// //                             <MuiSelect value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} label="Select PDF Template">
// //                                 <MenuItem value=""><em>Select a PDF template</em></MenuItem>
// //                                 {pdfTemplates.length > 0 ? pdfTemplates.map((template) => {
// //                                     const templateName = template.templateName || template.name;
// //                                     const eventId = template.eventId || template.id;
// //                                     return (
// //                                         <MenuItem key={eventId} value={templateName}>
// //                                             {templateName} ({template.language || 'en'})
// //                                             {template.templateStatus && ` - ${template.templateStatus}`}
// //                                         </MenuItem>
// //                                     );
// //                                 }) : <MenuItem disabled>No PDF templates available</MenuItem>}
// //                             </MuiSelect>
// //                         </FormControl>
// //                     </Box>
// //                 )}
// //                 {method === 'other-template' && (
// //                     <Box>
// //                         <FormControl fullWidth variant="outlined" size="small">
// //                             <InputLabel>Select Text Template</InputLabel>
// //                             <MuiSelect value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} label="Select Text Template">
// //                                 <MenuItem value=""><em>Select a text template</em></MenuItem>
// //                                 {otherTemplates.length > 0 ? otherTemplates.map((template) => {
// //                                     const templateName = template.templateName || template.name;
// //                                     const eventId = template.eventId || template.id;
// //                                     return (
// //                                         <MenuItem key={eventId} value={templateName}>
// //                                             {templateName} ({template.language || 'en'})
// //                                         </MenuItem>
// //                                     );
// //                                 }) : <MenuItem disabled>No text templates available</MenuItem>}
// //                             </MuiSelect>
// //                         </FormControl>
// //                     </Box>
// //                 )}
// //                 {(selectedTemplate && method.includes('template')) && (
// //                     <Box mt={3} p={2} border={1} borderColor="divider" borderRadius={1}>
// //                         <Typography variant="subtitle2" fontWeight="bold" mb={1}>Preview:</Typography>
// //                         <Typography variant="body2">
// //                             <strong>Template:</strong> {selectedTemplate}<br />
// //                             <strong>Invoice:</strong> {order?.Do_Inv_No}<br />
// //                             <strong>Customer:</strong> {order?.retailerNameGet}<br />
// //                             <strong>Amount:</strong> ₹{NumberFormat(order?.Total_Invoice_value)}
// //                             {pdfGeneration.pdfUrl && (<><br /><strong>PDF URL:</strong> Will be included in message</>)}
// //                         </Typography>
// //                     </Box>
// //                 )}
// //                 {method === 'pdf-link' && pdfGeneration.pdfUrl && (
// //                     <Box mt={3} p={2} border={1} borderColor="divider" borderRadius={1}>
// //                         <Typography variant="subtitle2" fontWeight="bold" mb={1}>PDF Link Preview:</Typography>
// //                         <Typography variant="body2">
// //                             The customer will receive a WhatsApp message with a secure link to download the PDF invoice.
// //                             <br /><br />
// //                             <strong>Invoice PDF Details:</strong>
// //                             <br />• File: {pdfGeneration.fileName}
// //                             <br />• Secure encrypted link
// //                             <br />• Valid for 7 days
// //                             <br />• Professional invoice format
// //                         </Typography>
// //                     </Box>
// //                 )}
// //             </Box>
// //         );
// //     };

// //     const selectedTotals = useMemo(() => {
// //         const selectedIds = multipleCostCenterUpdateValues.Do_Id;
// //         if (!selectedIds.length) return { billQty: 0, altActQty: 0 };
// //         let billQty = 0;
// //         let altActQty = 0;
// //         salesInvoices
// //             .filter(inv => selectedIds.includes(toNumber(inv.Do_Id)))
// //             .forEach(inv => {
// //                 if (Array.isArray(inv.stockDetails)) {
// //                     inv.stockDetails.forEach(item => {
// //                         billQty += Number(item.Bill_Qty) || 0;
// //                         altActQty += Number(item.Alt_Act_Qty) || 0;
// //                     });
// //                 }
// //             });
// //         return { billQty, altActQty };
// //     }, [multipleCostCenterUpdateValues.Do_Id, salesInvoices]);

// //     useEffect(() => {
// //         fetchLink({ address: "masters/erpCostCenter/dropDown" })
// //             .then((data) => setCostCenterData(toArray(data.data)))
// //             .catch(console.error);
// //     }, []);

// //     const costTypeColumns = useMemo(() => {
// //         const columns = costTypes
// //             .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
// //             .map((costType) => {
// //                 const field = `costType_${toNumber(costType.Cost_Category_Id)}`;
// //                 return {
// //                     costType: costType.Cost_Category,
// //                     field: field,
// //                     columnConfig: {
// //                         Field_Name: field,
// //                         Fied_Data: "string",
// //                         isVisible: 1,
// //                         ColumnHeader: costType.Cost_Category,
// //                         isCustomCell: true,
// //                         getFilterValues: (row) => getCostTypeEmployees(row, costType.Cost_Category_Id),
// //                         Cell: ({ row }) => {
// //                             const names = getCostTypeEmployees(row, costType.Cost_Category_Id).join(", ");
// //                             return <span>{names || "-"}</span>;
// //                         },
// //                     }
// //                 };
// //             });
// //         return columns.sort((a, b) => {
// //             const aName = a.costType.toLowerCase();
// //             const bName = b.costType.toLowerCase();
// //             if (aName.includes('broker')) return -1;
// //             if (bName.includes('broker')) return 1;
// //             if (aName.includes('transport')) return -1;
// //             if (bName.includes('transport')) return 1;
// //             return a.costType.localeCompare(b.costType);
// //         }).map(c => c.columnConfig);
// //     }, [costTypes, uniqueInvolvedCost]);

// //     const filterColumns = useMemo(() => [...columns, ...costTypeColumns], [columns, costTypeColumns]);

// //     const onCloseAssignDialog = () =>
// //         setFilters((prev) => ({ ...prev, assignDialog: false, selectedInvoice: null }));

// //     const onCloseFilterDialog = () => setFilters((prev) => ({ ...prev, filterDialog: false }));

// //     const onCloseMultipleUpdateCostCategoryDialog = () => {
// //         setMultipleCostCenterUpdateValues(multipleStaffUpdateInitialValues);
// //         setFilters((prev) => ({ ...prev, multipleStaffUpdateDialog: false }));
// //     };

// //     const onCloseMultipleStaffRemoveDialog = () => {
// //         setMultipleStaffRemoveValues(multipleStaffRemoveInitialValues);
// //         setFilters((prev) => ({ ...prev, multipleStaffRemoveDialog: false }));
// //     };

// //     const onChangeEmployee = (invoice, selectedOptions, costType) => {
// //         setFilters((prev) => {
// //             const updatedInvolvedStaffs = toArray(prev.selectedInvoice?.involvedStaffs)
// //                 .filter((emp) => !isEqualNumber(emp.Emp_Type_Id, costType.Cost_Category_Id))
// //                 .concat(selectedOptions);
// //             return { ...prev, selectedInvoice: { ...invoice, involvedStaffs: updatedInvolvedStaffs } };
// //         });
// //     };

// //     const fetchSalesInvoices = () => {
// //         if (viewMode === 'pending') fetchPendingInvoices();
// //         else setFilters((pre) => ({ ...pre, fetchTrigger: pre.fetchTrigger + 1 }));
// //     };

// //     const getPdfDownloadUrl = (invoiceId, token) => {
// //         const baseUrl = api;
// //         const cleanInvoiceNo = invoiceId.replace(/\//g, '_');
// //         return `${baseUrl}sales/downloadPdf?Do_Inv_No=${cleanInvoiceNo}`;
// //     };

// //     const downloadInvoicePDF = async (invoiceId, fileName = null) => {
// //         try {
// //             const downloadUrl = getPdfDownloadUrl(invoiceId);
// //             const a = document.createElement('a');
// //             a.href = downloadUrl;
// //             a.download = fileName || `${invoiceId}.pdf`;
// //             document.body.appendChild(a);
// //             a.click();
// //             document.body.removeChild(a);
// //             return true;
// //         } catch (error) {
// //             console.error('Error downloading PDF:', error);
// //             throw error;
// //         }
// //     };

// //     const convertToISTShort = (isoString) => {
// //         if (!isoString) return '';
// //         try {
// //             const date = new Date(isoString);
// //             const istOffset = 5.5 * 60 * 60 * 1000;
// //             const istDate = new Date(date.getTime() + istOffset);
// //             const hours = String(istDate.getUTCHours()).padStart(2, '0');
// //             const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
// //             return `${hours}:${minutes}`;
// //         } catch (error) {
// //             return isoString;
// //         }
// //     };

// //     const downloadSelectedAsExcel = () => {
// //         const selectedIds = multipleCostCenterUpdateValues.Do_Id;
// //         if (selectedIds.length === 0) {
// //             toast.warning("Please select at least one invoice to download");
// //             return;
// //         }
// //         setDownloadLoading(true);
// //         handleDownloadClose();
// //         try {
// //             const selectedInvoices = salesInvoices.filter(inv => selectedIds.includes(toNumber(inv.Do_Id)));
// //             const excelData = [];
// //             selectedInvoices.forEach((invoice, index) => {
// //                 const mainRow = {
// //                     'S.No': index + 1,
// //                     'Invoice No': invoice.Do_Inv_No || '',
// //                     'Created': convertToISTShort(invoice.createdOn),
// //                     'Voucher Type': invoice.voucherTypeGet || '',
// //                     'Customer': invoice.retailerNameGet || '',
// //                     'Bill Qty': invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0) : 0,
// //                     'Alt Act Qty': invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Alt_Act_Qty) || 0), 0) : 0,
// //                     'Narration': invoice.Narration || '',
// //                     'Total Amount': invoice.Total_Invoice_value || 0,
// //                     'Delivery Status': invoice.Delivery_Status || '',
// //                     'Phone Number': phoneMap.get(Number(invoice.Retailer_Id)) || 'Not Available'
// //                 };
// //                 costTypes
// //                     .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
// //                     .forEach(costType => {
// //                         const names = getCostTypeEmployees(invoice, costType.Cost_Category_Id).join(", ");
// //                         mainRow[costType.Cost_Category] = names || '-';
// //                     });
// //                 excelData.push(mainRow);
// //             });
// //             const wb = XLSX.utils.book_new();
// //             const ws = XLSX.utils.json_to_sheet(excelData);
// //             const colWidths = [];
// //             const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
// //             for (let C = range.s.c; C <= range.e.c; ++C) {
// //                 let maxWidth = 10;
// //                 for (let R = range.s.r; R <= range.e.r; ++R) {
// //                     const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
// //                     if (cell && cell.v) {
// //                         const width = String(cell.v).length + 2;
// //                         if (width > maxWidth) maxWidth = width;
// //                     }
// //                 }
// //                 colWidths[C] = { wch: Math.min(maxWidth, 50) };
// //             }
// //             ws['!cols'] = colWidths;
// //             XLSX.utils.book_append_sheet(wb, ws, "Invoices");
// //             const fileName = `Invoices_${viewMode}_${new Date().toISOString().split('T')[0]}.xlsx`;
// //             XLSX.writeFile(wb, fileName);
// //             toast.success(`Downloaded ${selectedIds.length} invoices as Excel`);
// //         } catch (error) {
// //             console.error('Error downloading Excel:', error);
// //             toast.error(`Failed to download Excel: ${error.message}`);
// //         } finally {
// //             setDownloadLoading(false);
// //         }
// //     };

// //     const downloadSelectedAsPDF = () => {
// //         const selectedIds = multipleCostCenterUpdateValues.Do_Id;
// //         if (selectedIds.length === 0) {
// //             toast.warning("Please select at least one invoice to download");
// //             return;
// //         }
// //         setDownloadLoading(true);
// //         handleDownloadClose();
// //         try {
// //             const selectedInvoices = salesInvoices.filter(inv => selectedIds.includes(toNumber(inv.Do_Id)));
// //             const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
// //             const tableData = [];
// //             selectedInvoices.forEach((invoice, index) => {
// //                 const row = [
// //                     index + 1,
// //                     invoice.Do_Inv_No || 'N/A',
// //                     invoice.Do_Date ? invoice.Do_Date.split('T')[0] : '',
// //                     invoice.createdOn || '',
// //                     invoice.voucherTypeGet || '',
// //                     invoice.retailerNameGet || '',
// //                     invoice.Retailer_GSTIN || '',
// //                     `₹${NumberFormat(invoice.Total_Invoice_value || 0)}`,
// //                     invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0) : 0,
// //                     invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Alt_Act_Qty) || 0), 0) : 0,
// //                     invoice.Narration || '',
// //                     invoice.Delivery_Status || '',
// //                     phoneMap.get(Number(invoice.Retailer_Id)) || 'No Phone'
// //                 ];
// //                 costTypes
// //                     .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
// //                     .forEach(costType => {
// //                         const names = getCostTypeEmployees(invoice, costType.Cost_Category_Id).join(", ");
// //                         row.push(names || '-');
// //                     });
// //                 tableData.push(row);
// //             });
// //             const tableColumns = [
// //                 "S.No", "Invoice No", "Invoice Date", "Created On", "Voucher Type",
// //                 "Customer", "Customer GST", "Total Amount", "Bill Qty", "Alt Act Qty",
// //                 "Narration", "Delivery Status", "Phone Number",
// //                 ...costTypes
// //                     .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
// //                     .map(costType => costType.Cost_Category)
// //             ];
// //             doc.setFontSize(16);
// //             doc.setTextColor(40, 40, 40);
// //             doc.text(`Invoices Report - ${viewMode === 'pending' ? 'Pending' : 'Sales'}`, 14, 15);
// //             doc.setFontSize(8);
// //             doc.setTextColor(100, 100, 100);
// //             doc.text(`Generated on: ${new Date().toLocaleString()}`, 280, 10, { align: 'right' });
// //             doc.text(`Total Invoices: ${selectedIds.length}`, 14, 22);
// //             doc.text(`Date Range: ${filters.reqDate}`, 14, 27);
// //             doc.text(`Filtered: Only showing customers with phone numbers`, 14, 32);
// //             doc.autoTable({
// //                 startY: 37,
// //                 head: [tableColumns],
// //                 body: tableData,
// //                 theme: 'grid',
// //                 styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak', cellWidth: 'wrap' },
// //                 headStyles: { fillColor: [66, 66, 66], textColor: 255, fontStyle: 'bold', halign: 'center' },
// //                 columnStyles: {
// //                     0: { cellWidth: 10 }, 1: { cellWidth: 25 }, 2: { cellWidth: 20 },
// //                     3: { cellWidth: 20 }, 4: { cellWidth: 15 }, 5: { cellWidth: 30 },
// //                     6: { cellWidth: 25 }, 7: { cellWidth: 20, halign: 'right' },
// //                     8: { cellWidth: 15, halign: 'right' }, 9: { cellWidth: 15, halign: 'right' },
// //                     10: { cellWidth: 25 }, 11: { cellWidth: 15 }, 12: { cellWidth: 20 },
// //                 },
// //                 margin: { left: 10, right: 10 },
// //                 didDrawPage: (data) => {
// //                     doc.setFontSize(8);
// //                     doc.setTextColor(150, 150, 150);
// //                     doc.text(
// //                         `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
// //                         data.settings.margin.left,
// //                         doc.internal.pageSize.height - 10
// //                     );
// //                 }
// //             });
// //             const fileName = `Invoices_${viewMode}_${new Date().toISOString().split('T')[0]}.pdf`;
// //             doc.save(fileName);
// //             toast.success(`Downloaded ${selectedIds.length} invoices as PDF`);
// //         } catch (error) {
// //             console.error('Error downloading PDF:', error);
// //             toast.error(`Failed to download PDF: ${error.message}`);
// //         } finally {
// //             setDownloadLoading(false);
// //         }
// //     };

// //     const handleDownloadClose = () => setDownloadAnchorEl(null);

// //     const postAssignCostCenters = async (e) => {
// //         e.preventDefault();
// //         fetchLink({
// //             address: "sales/salesInvoice/lrReport",
// //             method: "POST",
// //             bodyData: {
// //                 Do_Id: filters.selectedInvoice?.Do_Id,
// //                 involvedStaffs: filters.selectedInvoice?.involvedStaffs,
// //                 staffInvolvedStatus: toNumber(filters.selectedInvoice?.staffInvolvedStatus),
// //             },
// //             loadingOn,
// //             loadingOff,
// //         }).then((data) => {
// //             if (data.success) {
// //                 toast.success(data.message);
// //                 onCloseAssignDialog();
// //                 if (viewMode === 'pending') fetchPendingInvoices();
// //                 else fetchSalesInvoices();
// //             } else {
// //                 toast.error(data.message);
// //             }
// //         }).catch((e2) => console.log(e2));
// //     };

// //     const postMultipleCostCenterUpdate = async () => {
// //         fetchLink({
// //             address: "sales/salesInvoice/lrReport/multiple",
// //             method: "POST",
// //             bodyData: {
// //                 CostCategory: toNumber(multipleCostCenterUpdateValues.CostCategory.value),
// //                 Do_Id: multipleCostCenterUpdateValues.Do_Id,
// //                 involvedStaffs: multipleCostCenterUpdateValues.involvedStaffs.map((option) => toNumber(option.value)),
// //                 staffInvolvedStatus: toNumber(multipleCostCenterUpdateValues.staffInvolvedStatus),
// //                 deliveryStatus: toNumber(multipleCostCenterUpdateValues.deliveryStatus),
// //             },
// //             loadingOn,
// //             loadingOff,
// //         }).then((data) => {
// //             if (data.success) {
// //                 toast.success(data.message);
// //                 onCloseMultipleUpdateCostCategoryDialog();
// //                 if (viewMode === 'pending') fetchPendingInvoices();
// //                 else fetchSalesInvoices();
// //             } else {
// //                 toast.error(data.message);
// //             }
// //         }).catch((e) => console.log(e));
// //     };

// //     useEffect(() => {
// //         applyFilters();
// //     }, [columnFilters, salesInvoices, filterColumns]);

// //     const handleFilterChange = (column, value) => {
// //         setColumnFilters((prevFilters) => ({ ...prevFilters, [column]: value }));
// //     };

// //     const applyFilters = () => {
// //         let filtered = [...salesInvoices];
// //         for (const column of filterColumns) {
// //             const key = column.Field_Name;
// //             const filterVal = columnFilters[key];
// //             if (!filterVal) continue;
// //             if (filterVal.type === "range") {
// //                 const { min, max } = filterVal;
// //                 filtered = filtered.filter((item) => {
// //                     const value = item[key];
// //                     return (min === undefined || value >= min) && (max === undefined || value <= max);
// //                 });
// //                 continue;
// //             }
// //             if (filterVal.type === "date") {
// //                 const { start, end } = filterVal.value || {};
// //                 filtered = filtered.filter((item) => {
// //                     const dateValue = new Date(item[key]);
// //                     return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
// //                 });
// //                 continue;
// //             }
// //             if (Array.isArray(filterVal)) {
// //                 const selected = filterVal.map(normalize).filter(Boolean);
// //                 if (!selected.length) continue;
// //                 if (typeof column.getFilterValues === "function") {
// //                     filtered = filtered.filter((item) => {
// //                         const rowVals = (column.getFilterValues(item) || []).map(normalize).filter(Boolean);
// //                         return selected.some((v) => rowVals.includes(v));
// //                     });
// //                 } else {
// //                     filtered = filtered.filter((item) => selected.includes(normalize(item[key])));
// //                 }
// //             }
// //         }
// //         setFilteredData(filtered);
// //     };

// //     const handleMultiPrint = useReactToPrint({
// //         content: () => multiPrintRef.current,
// //         documentTitle: "Multiple Documents",
// //         pageStyle: currentPrintType === 'delivery_slip' ? `
// //             @page { margin: 0.7cm 0 0 0; size: auto; }
// //             html, body { margin: 0; padding: 0; }
// //             body { display: flex; flex-direction: column; align-items: center; }
// //             @media print { body > * { margin-left: 0 !important; margin-right: 0 !important; } .no-print { display: none !important; } }
// //         ` : currentPrintType === 'sales_invoice' ? `
// //             @page { size: A5 landscape; margin: 0; }
// //             html, body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
// //             body { display: flex; flex-direction: column; align-items: center; }
// //             @media print { body > * { margin-left: 0 !important; margin-right: 0 !important; } .no-print { display: none !important; } }
// //         ` : `
// //             @page { margin: 0.6cm; size: auto; }
// //             html, body { margin: 0; padding: 0; }
// //             body { display: flex; flex-direction: column; align-items: center; }
// //             @media print { body > * { margin-left: 0 !important; margin-right: 0 !important; } .no-print { display: none !important; } }
// //         `,
// //     });

// //     const renderFilter = (column) => {
// //         const { Field_Name, Fied_Data, ColumnHeader } = column;
// //         if (Fied_Data === "number") {
// //             return (
// //                 <div className="d-flex justify-content-between px-2">
// //                     <input
// //                         placeholder="Min" type="number" className="bg-light border-0 m-1 p-1 w-50"
// //                         value={columnFilters[Field_Name]?.min ?? ""}
// //                         onChange={(e) => handleFilterChange(Field_Name, { type: "range", ...columnFilters[Field_Name], min: e.target.value ? parseFloat(e.target.value) : undefined })}
// //                     />
// //                     <input
// //                         placeholder="Max" type="number" className="bg-light border-0 m-1 p-1 w-50"
// //                         value={columnFilters[Field_Name]?.max ?? ""}
// //                         onChange={(e) => handleFilterChange(Field_Name, { type: "range", ...columnFilters[Field_Name], max: e.target.value ? parseFloat(e.target.value) : undefined })}
// //                     />
// //                 </div>
// //             );
// //         }
// //         if (Fied_Data === "date") {
// //             return (
// //                 <div className="d-flex justify-content-between px-2">
// //                     <input
// //                         placeholder="Start Date" type="date" className="bg-light border-0 m-1 p-1 w-50"
// //                         value={columnFilters[Field_Name]?.value?.start ?? ""}
// //                         onChange={(e) => handleFilterChange(Field_Name, { type: "date", value: { ...columnFilters[Field_Name]?.value, start: e.target.value || undefined } })}
// //                     />
// //                     <input
// //                         placeholder="End Date" type="date" className="bg-light border-0 m-1 p-1 w-50"
// //                         value={columnFilters[Field_Name]?.value?.end ?? ""}
// //                         onChange={(e) => handleFilterChange(Field_Name, { type: "date", value: { ...columnFilters[Field_Name]?.value, end: e.target.value || undefined } })}
// //                     />
// //                 </div>
// //             );
// //         }
// //         if (Fied_Data === "string") {
// //             const rawValues =
// //                 typeof column.getFilterValues === "function"
// //                     ? salesInvoices.flatMap((item) => column.getFilterValues(item) || [])
// //                     : salesInvoices.map((item) => item[Field_Name]);
// //             const distinctValues = uniqueCaseInsensitive(rawValues);
// //             return (
// //                 <Autocomplete
// //                     multiple
// //                     id={`${Field_Name}-filter`}
// //                     options={distinctValues}
// //                     disableCloseOnSelect
// //                     getOptionLabel={(option) => option}
// //                     value={columnFilters[Field_Name] || []}
// //                     onChange={(event, newValue) => handleFilterChange(Field_Name, newValue)}
// //                     renderOption={(props, option, { selected }) => (
// //                         <li {...props}>
// //                             <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
// //                             {option}
// //                         </li>
// //                     )}
// //                     isOptionEqualToValue={(opt, val) => opt === val}
// //                     renderInput={(params) => (
// //                         <TextField
// //                             {...params}
// //                             label={ColumnHeader || Field_Name}
// //                             placeholder={`Select ${(ColumnHeader || Field_Name).replace(/_/g, " ")}`}
// //                         />
// //                     )}
// //                 />
// //             );
// //         }
// //         return null;
// //     };

// //     const postMultipleStaffRemove = async () => {
// //         if (!multipleStaffRemoveValues.CostCategory.value || multipleStaffRemoveValues.Do_Id.length === 0) {
// //             toast.error("Please select a Cost Category and at least one invoice");
// //             return;
// //         }
// //         fetchLink({
// //             address: "sales/salesInvoice/lrReport/multipleDelete",
// //             method: "POST",
// //             bodyData: {
// //                 CostCategory: toNumber(multipleStaffRemoveValues.CostCategory.value),
// //                 Do_Id: multipleStaffRemoveValues.Do_Id,
// //                 staffInvolvedStatus: toNumber(multipleStaffRemoveValues.staffInvolvedStatus),
// //                 deliveryStatus: toNumber(multipleStaffRemoveValues.deliveryStatus),
// //             },
// //             loadingOn,
// //             loadingOff,
// //         }).then((data) => {
// //             if (data.success) {
// //                 toast.success(data.message);
// //                 onCloseMultipleStaffRemoveDialog();
// //                 if (viewMode === 'pending') fetchPendingInvoices();
// //                 else fetchSalesInvoices();
// //             } else {
// //                 toast.error(data.message);
// //             }
// //         }).catch((e) => console.log(e));
// //     };

// //     useEffect(() => {
// //         if (selectAllCheckBox) {
// //             const allDoIds = filteredData.map(item => toNumber(item.Do_Id));
// //             setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: allDoIds }));
// //             setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: allDoIds }));
// //         } else {
// //             setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: [] }));
// //             setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: [] }));
// //         }
// //     }, [selectAllCheckBox, filteredData]);

// //     const saveMultipleInvoiceValidation = useMemo(() => {
// //         const validDoId = multipleCostCenterUpdateValues.Do_Id.length > 0;
// //         const validCostCenterId = multipleCostCenterUpdateValues.involvedStaffs.length > 0;
// //         const validCostCategory =
// //             checkIsNumber(multipleCostCenterUpdateValues.CostCategory.value) &&
// //             !isEqualNumber(multipleCostCenterUpdateValues.CostCategory.value, 0);
// //         if (!validDoId) return false;
// //         if (validCostCenterId && !validCostCategory) return false;
// //         if (!validCostCenterId && validCostCategory) return false;
// //         return true;
// //     }, [multipleCostCenterUpdateValues]);

// //     const removeMultipleInvoiceValidation = useMemo(() => {
// //         const validDoId = multipleStaffRemoveValues.Do_Id.length > 0;
// //         const validCostCategory =
// //             checkIsNumber(multipleStaffRemoveValues.CostCategory.value) &&
// //             !isEqualNumber(multipleStaffRemoveValues.CostCategory.value, 0);
// //         return validDoId && validCostCategory;
// //     }, [multipleStaffRemoveValues]);

// //     const stats = useMemo(() => ({
// //         totalInvoices: allInvoices.length,
// //         filteredInvoices: salesInvoices.length,
// //         customersWithPhone: phoneMap.size
// //     }), [allInvoices.length, salesInvoices.length, phoneMap.size]);

// //     const refreshData = () => {
// //         if (viewMode === 'pending') fetchPendingInvoices();
// //         else fetchAllInvoices(true);
// //     };

  
// // const ActionCell = ({ row, isPriceListTab = false, isSaleOrderTab = false }) => {
// //     const hasPhone = phoneMap.has(Number(row.Retailer_Id));
// //     const isLoading = sendingStates[row.Do_Id];
    
// //     let tooltipText = "Send Invoice via WhatsApp";
// //     if (isPriceListTab) tooltipText = "Send Price List via WhatsApp";
// //     if (isSaleOrderTab) tooltipText = "Send Sale Order via WhatsApp";
    
// //     const handleClick = async () => {
// //         if (isSaleOrderTab) {
// //             await sendSaleOrderWhatsApp(row, true);
// //         } else if (isPriceListTab) {
// //             await sendPriceListWhatsApp(row);
// //         } else {
// //             await sendSaleInvoiceWhatsApp(row);
// //         }
// //     };
    
// //     return (
// //         <Box sx={{ display: 'flex', gap: 0.5 }}>
// //             <Tooltip title={hasPhone ? tooltipText : "No phone number available"}>
// //                 <span>
// //                     <IconButton
// //                         size="small"
// //                         onClick={handleClick}
// //                         disabled={!hasPhone || isLoading}
// //                         color={hasPhone ? "success" : "default"}
// //                     >
// //                         {isLoading ? <CircularProgress size={20} /> : <WhatsAppIcon fontSize="small" />}
// //                     </IconButton>
// //                 </span>
// //             </Tooltip>
// //         </Box>
// //     );
// // };

   
// //     const baseColumns = [
// //         {
// //             Field_Name: "Select",
// //             isVisible: 1,
// //             isCustomCell: true,
// //             Cell: ({ row }) => {
// //                 const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(toNumber(row.Do_Id));
// //                 return (
// //                     <Checkbox
// //                         onFocus={(e) => e.target.blur()}
// //                         checked={isSelected}
// //                         onChange={() => {
// //                             if (isSelected) {
// //                                 setMultipleCostCenterUpdateValues((prev) => ({
// //                                     ...prev,
// //                                     Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.Do_Id)),
// //                                 }));
// //                                 setMultipleStaffRemoveValues((prev) => ({
// //                                     ...prev,
// //                                     Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.Do_Id)),
// //                                 }));
// //                             } else {
// //                                 setMultipleCostCenterUpdateValues((prev) => ({
// //                                     ...prev,
// //                                     Do_Id: [...prev.Do_Id, toNumber(row.Do_Id)],
// //                                 }));
// //                                 setMultipleStaffRemoveValues((prev) => ({
// //                                     ...prev,
// //                                     Do_Id: [...prev.Do_Id, toNumber(row.Do_Id)],
// //                                 }));
// //                             }
// //                         }}
// //                     />
// //                 );
// //             },
// //         },
// //         createCol("Do_Inv_No", "string", "Invoice"),
// //         {
// //             Field_Name: "Created",
// //             isVisible: 1,
// //             isCustomCell: true,
// //             Cell: ({ row }) => row?.createdOn ? LocalDateWithTime(row?.createdOn) : "",
// //         },
// //         createCol("voucherTypeGet", "string", "Voucher"),
// //         createCol("retailerNameGet", "string", "Customer"),
// //         {
// //             Field_Name: "PhoneNumber",
// //             ColumnHeader: "Phone",
// //             isVisible: 1,
// //             isCustomCell: true,
// //             Cell: ({ row }) => {
// //                 const phone = phoneMap.get(Number(row.Retailer_Id));
// //                 return (
// //                     <span style={{ color: phone ? 'green' : 'red' }}>
// //                         {phone || 'No Phone'}
// //                     </span>
// //                 );
// //             },
// //         },
// //         {
// //             Field_Name: "BillQty",
// //             isVisible: 1,
// //             isCustomCell: true,
// //             Cell: ({ row }) => {
// //                 if (row.stockDetails && row.stockDetails.length > 0) {
// //                     return row.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0);
// //                 }
// //                 return 0;
// //             },
// //         },
// //         {
// //             Field_Name: "AltActQty",
// //             ColumnHeader: "Alt Act Qty",
// //             isVisible: 1,
// //             isCustomCell: true,
// //             Cell: ({ row }) =>
// //                 RoundNumber(toArray(row.stockDetails).reduce((s, i) => s + toNumber(i.Alt_Act_Qty), 0)),
// //         },
// //         createCol("Narration", "string", "Narration"),
// //         createCol("Delivery_Status", "string", "Delivery_Status"),
// //     ];

 
// //     const saleInvoiceColumns = [
// //         ...baseColumns,
// //         {
// //             Field_Name: "Action",
// //             isVisible: 1,
// //             isCustomCell: true,
// //             Cell: (props) => <ActionCell {...props} isPriceListTab={false} />
// //         }
// //     ];


// //     const priceListColumns = [
// //         ...baseColumns,
// //         {
// //             Field_Name: "Action",
// //             isVisible: 1,
// //             isCustomCell: true,
// //             Cell: (props) => <ActionCell {...props} isPriceListTab={true} />
// //         }
// //     ];

   
// // const saleOrderColumns = [
// //     ...baseColumns,
// //     {
// //         Field_Name: "Action",
// //         isVisible: 1,
// //         isCustomCell: true,
// //         Cell: (props) => <ActionCell {...props} isPriceListTab={false} isSaleOrderTab={true} />
// //     }
// // ];


// //     const sharedButtonArea = (
// //         <>
// //             <Tooltip title="Select All">
// //                 <Checkbox
// //                     checked={selectAllCheckBox}
// //                     onChange={e => setSelectAllCheckBox(e.target.checked)}
// //                     disabled={filteredData.length === 0}
// //                 />
// //             </Tooltip>

// //             <IconButton
// //                 size="small"
// //                 onClick={() => setFilters((prev) => ({ ...prev, filterDialog: true }))}
// //                 disabled={isRefreshing}
// //             >
// //                 <FilterAlt />
// //             </IconButton>

// //             <IconButton size="small" onClick={refreshData} disabled={isRefreshing}>
// //                 <Search />
// //             </IconButton>

// //             {viewMode === 'pending' && (
// //                 <div>
// //                     <Button
// //                         variant="contained"
// //                         size="small"
// //                         startIcon={<Download />}
// //                         endIcon={<ArrowDropDown />}
// //                         onClick={handleDownloadClick}
// //                         disabled={!multipleCostCenterUpdateValues.Do_Id.length || downloadLoading}
// //                         sx={{ ml: 1, textTransform: 'none' }}
// //                     >
// //                         {downloadLoading ? 'Downloading...' : 'Download'}
// //                     </Button>
// //                     <Menu
// //                         anchorEl={downloadAnchorEl}
// //                         open={Boolean(downloadAnchorEl)}
// //                         onClose={handleDownloadClose}
// //                     >
// //                         <MenuItem onClick={downloadSelectedAsExcel} disabled={downloadLoading}>
// //                             <ListItemIcon><TableChart fontSize="small" color="success" /></ListItemIcon>
// //                             <ListItemText>Download as Excel</ListItemText>
// //                         </MenuItem>
// //                         <MenuItem onClick={downloadSelectedAsPDF} disabled={downloadLoading}>
// //                             <ListItemIcon><PictureAsPdf fontSize="small" color="error" /></ListItemIcon>
// //                             <ListItemText>Download as PDF</ListItemText>
// //                         </MenuItem>
// //                     </Menu>
// //                 </div>
// //             )}

// //             <input
// //                 type="date"
// //                 className="cus-inpt w-auto"
// //                 value={filters.reqDate}
// //                 onChange={(e) => setFilters((prev) => ({ ...prev, reqDate: e.target.value }))}
// //                 disabled={isRefreshing}
// //             />

// //             <IconButton
// //                 size="small"
// //                 disabled={!filters.docType || !multipleCostCenterUpdateValues.Do_Id.length}
// //                 onClick={() => {
// //                     setCurrentPrintType(filters.docType);
// //                     setMultiPrint({
// //                         open: true,
// //                         doIds: multipleCostCenterUpdateValues.Do_Id,
// //                         docType: filters.docType
// //                     });
// //                 }}
// //             >
// //                 <Print />
// //             </IconButton>
// //         </>
// //     );

// //     // Shared dialogs
// //     const sharedDialogs = (
// //         <>
// //             {/* Filter Dialog */}
// //             <Dialog open={filters.filterDialog} onClose={onCloseFilterDialog} maxWidth="sm" fullWidth>
// //                 <DialogTitle>Filter Options</DialogTitle>
// //                 <DialogContent>
// //                     <div className="row">
// //                         {filterColumns.map((column, index) => (
// //                             <div className="col-12 p-2" key={index}>
// //                                 {renderFilter(column)}
// //                             </div>
// //                         ))}
// //                     </div>
// //                 </DialogContent>
// //                 <DialogActions>
// //                     <Button onClick={onCloseFilterDialog} variant="outlined">Close</Button>
// //                 </DialogActions>
// //             </Dialog>

// //             {/* WhatsApp Dialog */}
// //             <Dialog open={whatsappDialog.open} onClose={closeWhatsAppDialog} maxWidth="sm" fullWidth>
// //                 <DialogTitle>Send WhatsApp Message</DialogTitle>
// //                 <DialogContent>{renderWhatsAppDialogContent()}</DialogContent>
// //                 <DialogActions>
// //                     <Button onClick={closeWhatsAppDialog} disabled={whatsappDialog.loading}>Cancel</Button>
// //                     <Button
// //                         variant="contained"
// //                         color="success"
// //                         startIcon={<WhatsAppIcon />}
// //                         disabled={
// //                             whatsappDialog.loading ||
// //                             (whatsappDialog.method === 'template' && !selectedTemplate) ||
// //                             !whatsappDialog.order?.recipientPhone
// //                         }
// //                     >
// //                         {whatsappDialog.loading ? 'Sending...' : 'Send WhatsApp'}
// //                     </Button>
// //                 </DialogActions>
// //             </Dialog>

// //             {/* Snackbar */}
// //             <Snackbar
// //                 open={snackbar.open}
// //                 autoHideDuration={6000}
// //                 onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
// //             >
// //                 <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
// //                     {snackbar.message}
// //                 </Alert>
// //             </Snackbar>
// //         </>
// //     );

// //     // Render
// //     return (
// //         <>
// //             {/* Tab Header */}
// //             <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
// //                 <Tabs
// //                     value={activeTab}
// //                     onChange={(_, newVal) => {
// //                         setActiveTab(newVal);
     
// //                         setSelectAllCheckBox(false);
// //                         setMultipleCostCenterUpdateValues(multipleStaffUpdateInitialValues);
// //                         setMultipleStaffRemoveValues(multipleStaffRemoveInitialValues);
// //                     }}
// //                     textColor="primary"
// //                     indicatorColor="primary"
// //                 >
// //                     <Tab label="Sale Invoice" value="sale_invoice" />
// //                     <Tab label="Price List" value="price_list" />
// //                     <Tab label="Sale Order" value="sale_order" />
// //                 </Tabs>
// //             </Box>

// //             {activeTab === 'sale_invoice' && (
// //                 <FilterableTable
// //                     title={viewMode === 'pending' ? "Pending Invoices (with Phone Numbers)" : "Sales Invoice (with Phone Numbers)"}
// //                     columns={saleInvoiceColumns}
// //                     dataArray={filteredData}
// //                     EnableSerialNumber
// //                     ButtonArea={sharedButtonArea}
// //                 />
// //             )}

      
// //             {activeTab === 'price_list' && (
// //                 <FilterableTable
// //                     title={viewMode === 'pending' ? "Pending Price List (with Phone Numbers)" : "Price List (with Phone Numbers)"}
// //                     columns={priceListColumns}
// //                     dataArray={filteredData}
// //                     EnableSerialNumber
// //                     ButtonArea={sharedButtonArea}
// //                 />
// //             )}


// //         {activeTab === 'sale_order' && (
// //                <FilterableTable
// //                    title={viewMode === 'pending' ? "Pending Sale Orders (with Phone Numbers)" : "Sale Orders (with Phone Numbers)"}
// //                    columns={saleOrderColumns}
// //                    dataArray={filteredData}
// //                    EnableSerialNumber
// //                    ButtonArea={sharedButtonArea}
// //                />
// //            )}
// //             {sharedDialogs}
// //         </>
// //     );
// // };

// // export default Whatsapp;


import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
    checkIsNumber, isEqualNumber, ISOString, toArray, toNumber,
    RoundNumber, NumberFormat, LocalDateWithTime
} from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import {
    Autocomplete, Button, Checkbox, Select as MuiSelect, MenuItem,
    Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
    Typography, TextField, Tooltip, Box, Divider, Snackbar, Alert,
    InputLabel, FormControl, CircularProgress, Tab, Tabs, Switch,
    FormControlLabel, Chip, Paper, Stack, RadioGroup, Radio, Menu,
    ListItemIcon, ListItemText, LinearProgress,
} from "@mui/material";
import {
    CheckBox, CheckBoxOutlineBlank, FilterAlt, Print, Search,
    Download, PictureAsPdf, TableChart, ArrowDropDown, Settings,
    Language, Send, SendAndArchive,
} from "@mui/icons-material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { DotPeWhatsAppService } from "../../../Components/dotpeWhatsappService";
import { Dot_Pe_Number } from "../../../encryptionKey";
import api from "../../../API";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import CheckIcon from '@mui/icons-material/Check';

import { REACT_APP_ASKEVA_TOKEN, REACT_APP_ASKEVA_API_ENDPOINT } from '../../../encryptionKey';

// const ASKEVA_CONFIG = {
//     token: "ab232386697556df6e520afa18b48c46437849656eaf7a610c1d6150937aa2d11c2d4b3051674dfe37c020228da69c8fcda367a40a7e6a727ae020bcd7e27094",
//     apiEndpoint: "https://backend.askeva.io/v1/message/send-message",
// };


const ASKEVA_CONFIG = {
    token: REACT_APP_ASKEVA_TOKEN,
    apiEndpoint: REACT_APP_ASKEVA_API_ENDPOINT,
};

const TAB_TO_WHATSAPP_TYPE = {
    sale_invoice: "Sales_Invoice",
    price_list:   "Price_List",
    sale_order:   "Sales",
    receipt_list: "Receipt_List",
};

const TEMPLATE_MAP = {
    sale_invoice: {
        dotpe: { english: "sales_invoice_en", tamil: "sales_invoice_order" },
        askeva: { english: "sales_invoice_en", tamil: "sales_invoice_thanks" },
    },
    price_list: {
        dotpe: { english: "price_list_en", tamil: "price_list" },
        askeva: { english: "price_list_en", tamil: "price_list_thanks" },
    },
    sale_order: {
        dotpe: { english: "sale_order_new_en", tamil: "sale_order" },
        askeva: { english: "sale_order_new_en", tamil: "sale_order_thankss" },
    },
    receipt_list: {
        dotpe: { english: "payment_receipt", tamil: "payment_receipt" },
        askeva: { english: "receipt_list_en", tamil: "receipt_list_thanks" },
    },
};

const LANG_CODE_MAP = { english: "en", tamil: "ta" };

const icon        = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const STAFF_INIT = {
    CostCategory: { label: "", value: "" },
    Do_Id: [],
    involvedStaffs: [],
    staffInvolvedStatus: 0,
    deliveryStatus: 5,
};

const normalize = (v) => String(v ?? "").toLowerCase().trim();

const uniqueCaseInsensitive = (values) => {
    const map = new Map();
    for (const v of values) {
        if (v === undefined || v === null || v === "") continue;
        if (typeof v === "object") continue;
        
        const s = String(v).trim();
        if (!s || s === "[object Object]") continue;
        
        const key = s.toLowerCase();
        if (!map.has(key)) map.set(key, s);
    }
    return Array.from(map.values());
};

const getCostTypeEmployees = (row, costTypeId) =>
    toArray(row?.involvedStaffs)
        .filter((e) => isEqualNumber(e.Emp_Type_Id, costTypeId))
        .map((e) => String(e.Emp_Name ?? "").trim())
        .filter(Boolean);

const generateUniqueClientRefId = (prefix, invoiceNo) => {
    const clean = String(invoiceNo || "unknown").replace(/[^a-zA-Z0-9]/g, "_").slice(-8);
    return `${prefix}_${clean}_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substring(2, 6)}`;
};

const normalizePhone = (raw) => {
    let p = String(raw).replace(/[^0-9]/g, "");
    if (p.startsWith("0")) p = p.substring(1);
    if (!p.startsWith("91")) p = `91${p}`;
    return p;
};

const getRowKey = (row, tab) => {
    const id = row?.DocumentId ?? row?.Ret_Id ?? row?.Receipt_Id ?? row?.So_Id ?? row?.Do_Id;
    return `${tab}_${id}`;
};

const sendViaAskeva = async ({ phone, templateName, language = "en", bodyParams }) => {
    const payload = {
        to: phone,
        type: "template",
        template: {
            name: templateName,
            language: { code: language },
            components: [{
                type: "body",
                parameters: bodyParams.map((text) => ({ type: "text", text: String(text) })),
            }],
        },
    };
    const resp = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${ASKEVA_CONFIG.token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.message || data.error || "Askeva send failed");
    return data;
};

const sendViaDotPe = async ({ phone, templateName, language = "en", bodyParams, clientRefId }) => {
    const payload = {
        template: { name: templateName, language },
        source: "crm",
        wabaNumber: Dot_Pe_Number,
        recipients: [phone],
        clientRefId,
        params: { body: bodyParams.map(String) },
    };
    const resp = await DotPeWhatsAppService.sendTemplateMessage(payload);
    if (!resp?.status) throw new Error(resp?.message || "DotPe send failed");
    return resp;
};

const BulkSendProgressDialog = ({ open, total, sent, failed, onClose, mode }) => {
    const progress = total > 0 ? Math.round(((sent + failed) / total) * 100) : 0;
    const done     = sent + failed >= total && total > 0;

    return (
        <Dialog open={open} maxWidth="xs" fullWidth disableEscapeKeyDown={!done}>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WhatsAppIcon color="success" />
                Bulk WhatsApp Send
                <Chip
                    label={mode === "parallel" ? "Simultaneous" : "Sequential"}
                    size="small"
                    color={mode === "parallel" ? "primary" : "info"}
                    sx={{ ml: "auto", fontSize: 10 }}
                />
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        color={done ? (failed > 0 ? "warning" : "success") : "primary"}
                        sx={{ height: 8, borderRadius: 4, mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary" textAlign="center">
                        {progress}% — {sent + failed} / {total} processed
                    </Typography>
                </Box>
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Box textAlign="center">
                        <Typography variant="h5" color="success.main" fontWeight="bold">{sent}</Typography>
                        <Typography variant="caption" color="text.secondary">Sent</Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h5" color="error.main" fontWeight="bold">{failed}</Typography>
                        <Typography variant="caption" color="text.secondary">Failed</Typography>
                    </Box>
                    <Box textAlign="center">
                        <Typography variant="h5" color="text.secondary" fontWeight="bold">{total - sent - failed}</Typography>
                        <Typography variant="caption" color="text.secondary">Remaining</Typography>
                    </Box>
                </Stack>
                {done && (
                    <Box mt={2} p={1.5} bgcolor={failed > 0 ? "warning.50" : "success.50"} borderRadius={1} textAlign="center">
                        <Typography variant="body2" color={failed > 0 ? "warning.dark" : "success.dark"} fontWeight="bold">
                            {failed > 0
                                ? `⚠️ Completed with ${failed} failure${failed > 1 ? "s" : ""}`
                                : `✅ All ${sent} messages sent successfully!`}
                        </Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={!done} variant={done ? "contained" : "outlined"}>
                    {done ? "Close" : "Sending…"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ─── WhatsApp Settings Dialog ───────────────────────────────────────────────
const WhatsappSettingsDialog = ({ open, onClose, activeTab, onSettingsSaved }) => {
    const [loading,           setLoading]           = useState(false);
    const [whatsappServices,  setWhatsappServices]  = useState([]);
    const [whatsappLanguages, setWhatsappLanguages] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [selectedLangId,    setSelectedLangId]    = useState("");
    const [serviceSelections, setServiceSelections] = useState({});
    const [currentServiceId,  setCurrentServiceId]  = useState(null);
    const [currentMethodId,   setCurrentMethodId]   = useState(null);

    useEffect(() => {
        if (open && activeTab) {
            fetchCurrentSettings();
            fetchWhatsappServices();
            fetchWhatsappLanguages();
        }
    }, [open, activeTab]);

    const fetchCurrentSettings = async () => {
        try {
            const typesResp = await fetchLink({ address: "masters/whatsappTypes" });
            const types     = toArray(typesResp?.data);
            const typeRec   = types.find(
                (t) => t.WhatsappType?.toLowerCase() === TAB_TO_WHATSAPP_TYPE[activeTab]?.toLowerCase()
            );
            if (!typeRec) return;
            const response = await fetchLink({ address: `masters/whatsappMethod?WhatsappType_Id=${typeRec.Id}` });
            const methods  = toArray(response?.message || response?.data);
            const active   = methods.find((m) => toNumber(m.Status) === 1);
            if (active) {
                setCurrentMethodId(active.Id);
                setCurrentServiceId(String(active.Service_Id));
                setSelectedServiceId(String(active.Service_Id));
                setSelectedLangId(String(active.lang_Id || ""));
                setServiceSelections({ [active.Service_Id]: { langId: active.lang_Id, langName: active.language } });
            }
        } catch (e) { console.error("Error fetching current settings:", e); }
    };

    const fetchWhatsappServices  = async () => {
        try {
            const r = await fetchLink({ address: "masters/whatsappServices" });
            setWhatsappServices(toArray(r.message || r.data));
        } catch (e) { console.error(e); }
    };

    const fetchWhatsappLanguages = async () => {
        try {
            const r = await fetchLink({ address: "masters/whatsappLanguages" });
            setWhatsappLanguages(toArray(r.message || r.data));
        } catch (e) { console.error(e); }
    };

    const handleSave = async () => {
        if (!selectedServiceId) { toast.error("Please select a WhatsApp service"); return; }
        if (!selectedLangId)    { toast.error("Please select a language"); return; }
        setLoading(true);
        try {
            const typesResp = await fetchLink({ address: "masters/whatsappTypes" });
            const types     = toArray(typesResp?.data);
            const typeRec   = types.find(
                (t) => t.WhatsappType?.toLowerCase() === TAB_TO_WHATSAPP_TYPE[activeTab]?.toLowerCase()
            );
            if (!typeRec) { toast.error("WhatsApp type not found"); return; }

            const body = {
                Service_Id:      parseInt(selectedServiceId),
                Status:          1,
                WhatsappType_Id: typeRec.Id,
                lang_Id:         parseInt(selectedLangId),
            };
            const response = await fetchLink({
                address: "masters/whatsappMethod",
                method:  currentMethodId ? "PUT" : "POST",
                bodyData: currentMethodId ? { ...body, Id: currentMethodId } : body,
            });
            if (response?.success) {
                toast.success(`WhatsApp settings ${currentMethodId ? "updated" : "saved"}!`);
                onSettingsSaved();
                onClose();
            } else {
                toast.error(response?.message || "Failed to save settings");
            }
        } catch (e) {
            toast.error("Failed to save settings");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>WhatsApp Settings — {activeTab?.replace("_", " ").toUpperCase()}</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
                ) : (
                    <Box sx={{ pt: 1 }}>
                        <Box mb={3} p={1.5} bgcolor="action.hover" borderRadius={1}>
                            <Typography variant="body2" color="text.secondary">Currently Active:</Typography>
                            <Box mt={1} display="flex" gap={1} flexWrap="wrap">
                                {currentServiceId ? (
                                    <>
                                        <Chip icon={<WhatsAppIcon />} label={whatsappServices.find((s) => String(s.Id) === currentServiceId)?.WhatsappService || "Unknown"} color="success" />
                                        {serviceSelections[currentServiceId]?.langName && (
                                            <Chip icon={<Language />} label={serviceSelections[currentServiceId].langName} color="info" />
                                        )}
                                    </>
                                ) : (
                                    <Chip label="No configuration set" color="warning" />
                                )}
                            </Box>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle1" fontWeight="bold" mb={2}>1. Select WhatsApp Service</Typography>
                        <RadioGroup
                            value={selectedServiceId}
                            onChange={(e) => {
                                setSelectedServiceId(e.target.value);
                                const ex = serviceSelections[e.target.value];
                                setSelectedLangId(ex?.langId ? String(ex.langId) : "");
                            }}
                        >
                            <Stack direction="row" spacing={2} flexWrap="wrap">
                                {whatsappServices.map((service) => {
                                    const svcId    = String(service.Id);
                                    const isActive = currentServiceId === svcId;
                                    const saved    = serviceSelections[svcId]?.langName;
                                    return (
                                        <Paper
                                            key={service.Id} variant="outlined"
                                            sx={{
                                                p: 1.5, minWidth: 160, cursor: "pointer",
                                                borderColor: selectedServiceId === svcId ? "primary.main" : "divider",
                                                bgcolor:     selectedServiceId === svcId ? "primary.50"   : "background.paper",
                                            }}
                                            onClick={() => {
                                                setSelectedServiceId(svcId);
                                                const ex = serviceSelections[svcId];
                                                setSelectedLangId(ex?.langId ? String(ex.langId) : "");
                                            }}
                                        >
                                            <FormControlLabel
                                                value={svcId} control={<Radio size="small" />}
                                                label={
                                                    <Box>
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Typography variant="body2" fontWeight="bold">{service.WhatsappService}</Typography>
                                                            {isActive && <Chip label="ACTIVE" size="small" color="success" sx={{ height: 18, fontSize: 9 }} />}
                                                        </Box>
                                                        {saved && !isActive && (
                                                            <Chip label={`Saved: ${saved}`} size="small" variant="outlined" sx={{ mt: 0.5, height: 18, fontSize: 9 }} />
                                                        )}
                                                    </Box>
                                                }
                                                sx={{ m: 0 }}
                                            />
                                        </Paper>
                                    );
                                })}
                            </Stack>
                        </RadioGroup>
                        {selectedServiceId && whatsappLanguages.length > 0 && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" fontWeight="bold" mb={1.5}>2. Select Language</Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {whatsappLanguages.map((lang) => {
                                        const langId     = String(lang.Id);
                                        const isSelected = selectedLangId === langId;
                                        return (
                                            <Chip
                                                key={lang.Id}
                                                label={lang.Language || lang.language}
                                                onClick={() => setSelectedLangId(langId)}
                                                color={isSelected ? "primary" : "default"}
                                                variant={isSelected ? "filled" : "outlined"}
                                                icon={isSelected ? <CheckIcon /> : <Language />}
                                                sx={{ cursor: "pointer", "&:hover": { bgcolor: isSelected ? "primary.dark" : "action.hover" } }}
                                            />
                                        );
                                    })}
                                </Stack>
                                {selectedLangId && serviceSelections[selectedServiceId]?.langId === selectedLangId && (
                                    <Chip label="Active" size="small" color="success" variant="outlined" sx={{ mt: 1 }} />
                                )}
                            </>
                        )}
                        {whatsappLanguages.length === 0 && (
                            <Box mt={2} p={2} bgcolor="warning.50" borderRadius={1}>
                                <Typography color="warning.main" variant="body2">
                                    ⚠️ No languages configured.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={!selectedServiceId || !selectedLangId || loading}>
                    {loading ? "Saving…" : currentMethodId ? "Update Settings" : "Save Settings"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
const Whatsapp = ({ loadingOn, loadingOff, AddRights, EditRights, PrintRights, pageID }) => {
    const storage = JSON.parse(localStorage.getItem("user") || "{}");

    const [salesInvoices,             setSalesInvoices]             = useState([]);
    const [allSalesInvoices,           setAllSalesInvoices]           = useState([]);
    const [allSalesOrders,             setAllSalesOrders]             = useState([]);
    const [allReceipts,                setAllReceipts]                = useState([]);
    const [priceListRetailers,         setPriceListRetailers]         = useState([]);
    const [filteredPriceListRetailers, setFilteredPriceListRetailers] = useState([]);
    const [costCenterData,             setCostCenterData]             = useState([]);
    const [costTypes,                  setCostTypes]                  = useState([]);
    const [uniqueInvolvedCost,         setUniqueInvolvedCost]         = useState([]);
    const [phoneMap,                   setPhoneMap]                   = useState(new Map());

    const [viewMode,          setViewMode]          = useState("normal");
    const [isLoading,         setIsLoading]         = useState(true);
    const [isRefreshing,      setIsRefreshing]      = useState(false);
    const [hasInitialLoading, setHasInitialLoading] = useState(false);
    const [isPhoneMapLoaded,  setIsPhoneMapLoaded]  = useState(false);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    const [activeTab,         setActiveTab]         = useState("sale_invoice");

    const [sendingStates,     setSendingStates]     = useState({});
    const [selectAllCheckBox, setSelectAllCheckBox] = useState(false);
    const [downloadLoading,   setDownloadLoading]   = useState(false);
    const [downloadAnchorEl,  setDownloadAnchorEl]  = useState(null);
    const [currentPrintType,  setCurrentPrintType]  = useState("");
    const [printReady,        setPrintReady]        = useState(false);
    const [columnFilters,     setColumnFilters]     = useState({});
    const [filteredData,      setFilteredData]      = useState([]);

    const [tabMethodSettings, setTabMethodSettings] = useState({});
    const [settingsDialog,    setSettingsDialog]    = useState(false);
    const [allMethods,        setAllMethods]        = useState([]);

    const [bulkMenuAnchor,   setBulkMenuAnchor]   = useState(null);
    const [bulkProgress,     setBulkProgress]     = useState({ open: false, total: 0, sent: 0, failed: 0, mode: "parallel" });
    const bulkAbortRef = useRef(false);

    const [priceListSearch, setPriceListSearch] = useState("");

    const [filters, setFilters] = useState({
        reqDate: ISOString(),
        assignDialog: false,
        filterDialog: false,
        selectedInvoice: null,
        multipleStaffUpdateDialog: false,
        multipleStaffRemoveDialog: false,
        fetchTrigger: 0,
        docType: "",
        staffStatus: 0,
    });

    const [multipleCostCenterUpdateValues, setMultipleCostCenterUpdateValues] = useState(STAFF_INIT);
    const [multipleStaffRemoveValues,      setMultipleStaffRemoveValues]      = useState(STAFF_INIT);

    const [receiptFilters, setReceiptFilters] = useState({
        Fromdate: ISOString(), Todate: ISOString(),
        voucher: "", debit: "", credit: "", createdBy: "", status: "", receipt_type: "",
    });

    const [snackbar,      setSnackbar]      = useState({ open: false, message: "", severity: "success" });
    const [pdfGeneration, setPdfGeneration] = useState({ loading: false, pdfUrl: null, error: null });
    const [multiPrint,    setMultiPrint]    = useState({ open: false, doIds: [], docType: "" });
    const multiPrintRef = useRef(null);
    const [companyInfo, setCompanyInfo] = useState([]);

    useEffect(() => {
        const companyId = storage?.Company_id;
        if (companyId) {
            fetchLink({ address: `masters/company?Company_id=${companyId}` })
                .then((r) => { if (r?.success && r?.data[0]) setCompanyInfo(r.data); })
                .catch(console.error);
        }
    }, []);

    // Price list search filter
    useEffect(() => {
        if (activeTab === "price_list" && priceListRetailers.length > 0) {
            const searchTerm = priceListSearch.toLowerCase().trim();
            if (!searchTerm) {
                setFilteredPriceListRetailers(priceListRetailers);
            } else {
                const filtered = priceListRetailers.filter(retailer => 
                    retailer.Retailer_Name?.toLowerCase().includes(searchTerm) ||
                    retailer.Ret_Code?.toLowerCase().includes(searchTerm) ||
                    retailer.City?.toLowerCase().includes(searchTerm) ||
                    retailer.Location?.toLowerCase().includes(searchTerm) ||
                    retailer.A1?.includes(searchTerm)
                );
                setFilteredPriceListRetailers(filtered);
            }
        }
    }, [priceListSearch, priceListRetailers, activeTab]);

    const fetchAllTabSettings = useCallback(async () => {
        try {
            const [typesResp, servicesResp] = await Promise.all([
                fetchLink({ address: "masters/whatsappTypes" }),
                fetchLink({ address: "masters/whatsappServices" }),
            ]);
            const types    = toArray(typesResp?.data);
            const services = toArray(servicesResp?.message);
            setAllMethods(services);
            const settings = {};
            await Promise.all(
                Object.entries(TAB_TO_WHATSAPP_TYPE).map(async ([tab, typeName]) => {
                    const typeRec = types.find((t) => t.WhatsappType?.toLowerCase() === typeName.toLowerCase());
                    if (!typeRec) return;
                    const methodsResp = await fetchLink({ address: `masters/whatsappMethod?WhatsappType_Id=${typeRec.Id}` });
                    const methods     = toArray(methodsResp?.message);
                    const active      = methods.find((m) => toNumber(m.Status) === 1);
                    if (active) {
                        settings[tab] = {
                            serviceId:   toNumber(active.Service_Id),
                            serviceName: active.WhatsappService,
                            langId:      active.lang_Id  ? toNumber(active.lang_Id)            : null,
                            langName:    active.language ? active.language.toLowerCase()        : "english",
                        };
                    } else {
                        const def = services.find((s) => s.WhatsappService?.toLowerCase() === "dotpe") || services[0];
                        settings[tab] = {
                            serviceId:   def ? toNumber(def.Id) : null,
                            serviceName: def?.WhatsappService || "Dotpe",
                            langId:      null,
                            langName:    "english",
                        };
                    }
                })
            );
            setTabMethodSettings(settings);
        } catch (e) { console.error("Error fetching tab settings:", e); }
    }, []);

    const resolveTemplate = useCallback((tab, serviceName, langName) => {
        const svcKey  = (serviceName || "dotpe").toLowerCase();
        const langKey = (langName    || "english").toLowerCase();
        return (
            TEMPLATE_MAP[tab]?.[svcKey]?.[langKey] ||
            TEMPLATE_MAP[tab]?.[svcKey]?.["english"] ||
            TEMPLATE_MAP[tab]?.["dotpe"]?.["english"] ||
            "sales_invoice_order"
        );
    }, []);

    const sendWhatsAppMessage = useCallback(
        async ({ tab, phone, bodyParams, clientRefId }) => {
            const { serviceName = "Dotpe", langName = "en" } = tabMethodSettings[tab] || {};
            const svcKey   = serviceName.toLowerCase();
            const langKey  = langName.toLowerCase();
            const langCode = LANG_CODE_MAP[langKey] || "en";
            const templateName = resolveTemplate(tab, svcKey, langKey);
            if (svcKey === "askeva") return sendViaAskeva({ phone, templateName, language: langCode, bodyParams });
            return sendViaDotPe({ phone, templateName, language: langCode, bodyParams, clientRefId });
        },
        [tabMethodSettings, resolveTemplate]
    );

    const calculateAltActQty = (item) => {
        if (item.Alt_Act_Qty != null) return Number(item.Alt_Act_Qty) || 0;
        for (const f of ["AltQty", "Alt_Qty", "Alternate_Qty", "Actual_Qty"]) {
            if (item[f] != null) return Number(item[f]) || 0;
        }
        return (Number(item.Bill_Qty) || 0) * (Number(item.PackValue) || 1);
    };

    const fetchPhoneMap = async () => {
        try {
            const response = await fetchLink({ address: "masters/getlolDetails" });
            if (response?.success && response.data) {
                const map = new Map();
                response.data.forEach((item) => { if (item.A1) map.set(Number(item.Ret_Id), item.A1); });
                setPhoneMap(map);
                setIsPhoneMapLoaded(true);
                return map;
            }
            return new Map();
        } catch (e) { console.error(e); setIsPhoneMapLoaded(true); return new Map(); }
    };

    const getPDFUrlSimple = (order) => {
        const formattedInvoiceNo = (order.DocumentNumber || "").replace(/_/g, "/");
        return `https://printapp.erpsmt.in/sales/downloadPdf?Do_Inv_No=${btoa(formattedInvoiceNo)}&Company_id=${btoa(storage?.Company_id)}`;
    };

    const processInvoice = (invoice, phoneMapRef) => ({
        ...invoice,
        DocumentType:   "SalesInvoice",
        DocumentId:     invoice.Do_Id,
        DocumentNumber: invoice.Do_Inv_No,
        DocumentDate:   invoice.Do_Date,
        A1_Phone: (phoneMapRef || phoneMap).get(Number(invoice.Retailer_Id)) || invoice.A1 || "Not Available",
        ...(Array.isArray(invoice.stockDetails)
            ? { stockDetails: invoice.stockDetails.map((i) => ({ ...i, Alt_Act_Qty: calculateAltActQty(i) })) }
            : {}),
    });

    const processOrder = (order, phoneMapRef) => ({
        ...order,
        DocumentType:    "SalesOrder",
        DocumentId:      order.So_Id || order.Id,
        DocumentNumber:  order.So_Inv_No || order.Invoice_No,
        DocumentDate:    order.So_Date   || order.Invoice_Date,
        voucherTypeGet:  order.voucherTypeGet || "Sales Order",
        Delivery_Status: order.Conversion_Status || "Not Converted",
        A1_Phone: (phoneMapRef || phoneMap).get(Number(order.Retailer_Id)) || order.A1 || "Not Available",
    });

    const fetchAllInvoices = async (refresh = false) => {
        try {
            if (!refresh) setIsLoading(true); else setIsRefreshing(true);
            setViewMode("normal");
            const [siResp, soResp] = await Promise.all([
                fetchLink({ address: `sales/salesInvoice/lrReportWhatsapp?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`, loadingOn, loadingOff }),
                fetchLink({ address: `sales/salesOrder/lrReportWhatsapp?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`, loadingOn, loadingOff }),
            ]);
            const si = toArray(siResp?.data).map((x) => processInvoice(x, phoneMap));
            const so = toArray(soResp?.data).map((x) => processOrder(x, phoneMap));
            setAllSalesInvoices(si); setAllSalesOrders(so);
            setCostTypes(toArray(siResp?.others?.costTypes || soResp?.others?.costTypes));
            setUniqueInvolvedCost(toArray(siResp?.others?.uniqeInvolvedStaffs || soResp?.others?.uniqeInvolvedStaffs));
            if (activeTab === "sale_invoice")       { setSalesInvoices(si); setFilteredData(si); }
            else if (activeTab === "sale_order")    { setSalesInvoices(so); setFilteredData(so); }
            else if (activeTab !== "receipt_list" && activeTab !== "price_list") { setSalesInvoices(si); setFilteredData(si); }
            if (!hasInitialLoading) setHasInitialLoading(true);
        } catch (e) { console.error(e); toast.error("Failed to load data"); }
        finally { if (!refresh) setIsLoading(false); setIsRefreshing(false); }
    };

    const fetchPendingInvoices = async () => {
        try {
            setIsLoading(true); setViewMode("pending");
            const [siResp, soResp] = await Promise.all([
                fetchLink({ address: `sales/salesInvoice/pendingDetails?reqDate=${filters.reqDate}`, loadingOn, loadingOff }),
                fetchLink({ address: `sales/salesOrder/pendingDetails?reqDate=${filters.reqDate}`,   loadingOn, loadingOff }),
            ]);
            const si = toArray(siResp?.data).map((x) => processInvoice(x, phoneMap));
            const so = toArray(soResp?.data).map((x) => processOrder(x, phoneMap));
            setAllSalesInvoices(si); setAllSalesOrders(so);
            if (activeTab === "sale_invoice")    { setSalesInvoices(si); setFilteredData(si); }
            else if (activeTab === "sale_order") { setSalesInvoices(so); setFilteredData(so); }
            if (siResp?.others?.costTypes)          setCostTypes(toArray(siResp.others.costTypes));
            if (siResp?.others?.uniqeInvolvedStaffs) setUniqueInvolvedCost(toArray(siResp.others.uniqeInvolvedStaffs));
        } catch (e) { console.error(e); toast.error("Failed to load pending data"); }
        finally { setIsLoading(false); }
    };

    const fetchReceipts = async () => {
        try {
            setIsLoading(true);
            const params   = new URLSearchParams(receiptFilters);
            const response = await fetchLink({ address: `receipt/receiptMasterwithLol?${params}`, loadingOn, loadingOff });
            if (response?.success && response.data) {
                const recs = toArray(response.data).map((r) => ({
                    ...r,
                    DocumentType:        "Receipt",
                    DocumentId:          r.Receipt_Id || r.Id,
                    DocumentNumber:      r.Receipt_No  || r.receipt_invoice_no,
                    DocumentDate:        r.receipt_date || r.Created_Date,
                    voucherTypeGet:      r.Voucher_Type,
                    transaction_type:    r.transaction_type,
                    retailerNameGet:     r.Customer_Name || r.Retailer_Name,
                    Total_Invoice_value: r.credit_amount || r.debit_amount || 0,
                    createdOn:           r.Created_Date  || r.Receipt_Date,
                    A1_Phone:            phoneMap.get(Number(r.Retailer_Id)) || r.Phone_No || "Not Available",
                }));
                setAllReceipts(recs);
                if (activeTab === "receipt_list") setFilteredData(recs);
            } else {
                setAllReceipts([]);
                if (activeTab === "receipt_list") setFilteredData([]);
                toast.info("No receipts found");
            }
        } catch (e) { toast.error("Failed to load receipts"); }
        finally { setIsLoading(false); }
    };

    const fetchRetailersWithLOL = async () => {
        try {
            setIsLoading(true);
            const response = await fetchLink({ address: "masters/retailerswithlol", loadingOn, loadingOff });
            if (response?.success && response.data) {
                const retailers = toArray(response.data).map((r) => ({
                    ...r,
                    DocumentType:    "PriceList",
                    DocumentId:      r.Ret_Id,
                    DocumentNumber:  `PL_${r.Ret_Id}`,
                    retailerNameGet: r.Retailer_Name,
                    A1_Phone:        phoneMap.get(Number(r.Ret_Id)) || r.A1 || "Not Available",
                    Retailer_Id:     r.Ret_Id,
                }));
                setPriceListRetailers(retailers);
                setFilteredPriceListRetailers(retailers);
            }
        } catch (e) { toast.error("Failed to load price list data"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        const init = async () => {
            setIsLoading(true);
            await fetchPhoneMap();
            await fetchAllInvoices();
            await fetchLink({ address: "masters/erpCostCenter/dropDown" })
                .then((d) => setCostCenterData(toArray(d.data))).catch(console.error);
            await fetchAllTabSettings();
            setInitialDataLoaded(true);
            setIsLoading(false);
        };
        init();
    }, []);

    useEffect(() => {
        if (initialDataLoaded) {
            if (viewMode === "normal") fetchAllInvoices(true);
            else fetchPendingInvoices();
        }
    }, [filters.fetchTrigger, filters.staffStatus, filters.reqDate, viewMode, initialDataLoaded]);

    useEffect(() => {
        if (multiPrint.open) {
            const t = setTimeout(() => { if (multiPrintRef.current) setPrintReady(true); }, 300);
            return () => clearTimeout(t);
        } else setPrintReady(false);
    }, [multiPrint.open]);

    const buildSaleInvoiceParams = (row) => {
        const pdfUrl       = getPDFUrlSimple(row);
        const companyname  = companyInfo[0]?.Company_Name;
        const customerName = row.retailerNameGet || "";
        const invoiceNo    = row.DocumentNumber  || "-";
        const date         = new Date(row.Do_Date || row.DocumentDate || row.createdOn).toLocaleDateString("en-GB");
        const amount       = Number(row.Total_Invoice_value || 0).toFixed(2);
        return { bodyParams: [companyname, customerName, invoiceNo, date, amount, pdfUrl], clientRefId: generateUniqueClientRefId("inv", invoiceNo) };
    };

    const buildPriceListParams = (row) => {
        const encodedCompanyId = btoa(storage?.Company_id);
        const priceListLink    = `https://printapp.erpsmt.in/rateMaster?Company_id=${encodedCompanyId}`;
        const customerName     = row.retailerNameGet || row.Retailer_Name || "Customer";
        const companyname      = companyInfo[0]?.Company_Name;
        return { bodyParams: [companyname, customerName, priceListLink], clientRefId: generateUniqueClientRefId("plist", `retailer_${row.Ret_Id}`) };
    };

    const buildSaleOrderParams = (row) => {
        const pdfUrl       = "https://order.erpsmt.in/";
        const customerName = row.retailerNameGet || "Customer";
        const invoiceNo    = row.DocumentNumber  || "N/A";
        const date         = new Date(row.So_Date || row.DocumentDate || row.createdOn).toLocaleDateString("en-GB");
        const amount       = Number(row.Total_Invoice_value || 0).toFixed(2);
        const companyname  = companyInfo[0]?.Company_Name;
        return { bodyParams: [companyname, customerName, invoiceNo, date, amount, pdfUrl], clientRefId: generateUniqueClientRefId("sord", invoiceNo) };
    };

    const buildReceiptParams = (row) => {
        const customerName = row.retailerNameGet;
        const receiptNo    = row.DocumentNumber || "N/A";
        const date         = new Date(row.receipt_date || row.DocumentDate).toLocaleDateString("en-GB");
        const amount       = Number(row.Total_Invoice_value || 0).toFixed(2);
        const companyname  = companyInfo[0]?.Company_Name;
        const paymentMode  = row.voucherTypeGet;
        return { bodyParams: [companyname, customerName, receiptNo, date, amount, paymentMode], clientRefId: generateUniqueClientRefId("receipt", receiptNo) };
    };

    const getTabAndParams = (row, tab) => {
        if (tab === "price_list")   return { tab, ...buildPriceListParams(row) };
        if (tab === "sale_order")   return { tab, ...buildSaleOrderParams(row) };
        if (tab === "receipt_list") return { tab, ...buildReceiptParams(row) };
        return { tab: "sale_invoice", ...buildSaleInvoiceParams(row) };
    };

    const sendSingleRow = async (row, tab) => {
        const rowKey = getRowKey(row, tab);
        setSendingStates((p) => ({ ...p, [rowKey]: true }));
        try {
            let phone = phoneMap.get(Number(row.Retailer_Id)) || row.A1 || row.Customer_Phone;
            if (!phone) { toast.error("Phone not found"); return false; }
            phone = normalizePhone(phone);
            const { tab: resolvedTab, bodyParams, clientRefId } = getTabAndParams(row, tab);
            await sendWhatsAppMessage({ tab: resolvedTab, phone, bodyParams, clientRefId });
            toast.success("Sent via WhatsApp!");
            return true;
        } catch (e) {
            toast.error(`Failed: ${e.message}`);
            return false;
        } finally {
            setSendingStates((p) => ({ ...p, [rowKey]: false }));
        }
    };

    const getSelectedRows = useCallback(() => {
        const ids    = multipleCostCenterUpdateValues.Do_Id;
        const source = activeTab === "price_list"
            ? filteredPriceListRetailers
            : activeTab === "receipt_list"
            ? filteredData
            : filteredData;
        return source.filter((row) => ids.includes(toNumber(row.DocumentId)));
    }, [multipleCostCenterUpdateValues.Do_Id, activeTab, filteredPriceListRetailers, filteredData]);

    const handleBulkSend = async (mode) => {
        setBulkMenuAnchor(null);
        const rows = getSelectedRows();
        if (!rows.length) { toast.warning("Select at least one row"); return; }

        bulkAbortRef.current = false;
        setBulkProgress({ open: true, total: rows.length, sent: 0, failed: 0, mode });

        const increment = (success) =>
            setBulkProgress((p) => ({
                ...p,
                sent:   success ? p.sent   + 1 : p.sent,
                failed: success ? p.failed     : p.failed + 1,
            }));

        const sendRow = async (row) => {
            try {
                let phone = phoneMap.get(Number(row.Retailer_Id)) || row.A1 || row.Customer_Phone;
                if (!phone) { increment(false); return; }
                phone = normalizePhone(phone);
                const { tab, bodyParams, clientRefId } = getTabAndParams(row, activeTab);
                await sendWhatsAppMessage({ tab, phone, bodyParams, clientRefId });
                increment(true);
            } catch {
                increment(false);
            }
        };

        if (mode === "parallel") {
            await Promise.allSettled(rows.map(sendRow));
        } else {
            for (const row of rows) {
                if (bulkAbortRef.current) break;
                await sendRow(row);
                await new Promise((r) => setTimeout(r, 800));
            }
        }
    };

    const ActionCell = ({ row, tab = "sale_invoice" }) => {
        const hasPhone = !!(phoneMap.get(Number(row.Retailer_Id)) || row?.A1 || row?.Customer_Phone);
        const rowKey   = getRowKey(row, tab);
        const busy     = !!sendingStates[rowKey];
        const { serviceName = "Dotpe", langName = "english" } = tabMethodSettings[tab] || {};

        const tooltipText = hasPhone
            ? `Send via WhatsApp (${serviceName} · ${langName})`
            : "No phone number available";

        return (
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <Tooltip title={tooltipText}>
                    <span>
                        <IconButton
                            size="small"
                            onClick={() => sendSingleRow(row, tab)}
                            disabled={!hasPhone || busy}
                            color={hasPhone ? "success" : "default"}
                        >
                            {busy ? <CircularProgress size={20} /> : <WhatsAppIcon fontSize="small" />}
                        </IconButton>
                    </span>
                </Tooltip>
                {hasPhone && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                        <Chip label={serviceName} size="small" sx={{ height: 14, fontSize: 9, opacity: 0.7 }} />
                        <Chip label={langName}    size="small" sx={{ height: 14, fontSize: 9, opacity: 0.6 }} color="info" variant="outlined" />
                    </Box>
                )}
            </Box>
        );
    };

    const filterColumns = useMemo(
        () => [
            { Field_Name: "DocumentNumber", Fied_Data: "string", ColumnHeader: "Document No" },
            { Field_Name: "voucherTypeGet",  Fied_Data: "string", ColumnHeader: "Type" },
            { Field_Name: "retailerNameGet", Fied_Data: "string", ColumnHeader: "Customer" },
            ...costTypes
                .filter((ct) => uniqueInvolvedCost.includes(toNumber(ct.Cost_Category_Id)))
                .map((ct) => ({
                    Field_Name:   `costType_${ct.Cost_Category_Id}`,
                    Fied_Data:    "string",
                    ColumnHeader: ct.Cost_Category,
                    isVisible: 1,
                    isCustomCell: true,
                    getFilterValues: (row) => getCostTypeEmployees(row, ct.Cost_Category_Id),
                    Cell: ({ row }) => <span>{getCostTypeEmployees(row, ct.Cost_Category_Id).join(", ") || "-"}</span>,
                })),
        ],
        [costTypes, uniqueInvolvedCost]
    );

    const selectCell = (row) => {
        const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(toNumber(row.DocumentId));
        const toggle = () => {
            const fn = (prev) => isSelected
                ? { ...prev, Do_Id: prev.Do_Id.filter((x) => !isEqualNumber(x, row.DocumentId)) }
                : { ...prev, Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)] };
            setMultipleCostCenterUpdateValues(fn);
            setMultipleStaffRemoveValues(fn);
        };
        return <Checkbox onFocus={(e) => e.target.blur()} checked={isSelected} onChange={toggle} />;
    };

    const baseColumns = [
        { Field_Name: "Select", isVisible: 1, isCustomCell: true, Cell: ({ row }) => selectCell(row) },
        { Field_Name: "DocumentNumber", Fied_Data: "string", ColumnHeader: "Document No", isVisible: 1 },
        { Field_Name: "DocumentType",   Fied_Data: "string", ColumnHeader: "Type",        isVisible: 1 },
        { Field_Name: "Created", isVisible: 1, isCustomCell: true, Cell: ({ row }) => row?.createdOn ? LocalDateWithTime(row.createdOn) : "" },
        createCol("voucherTypeGet",  "string", "Voucher"),
        createCol("retailerNameGet", "string", "Customer"),
        {
            Field_Name: "PhoneNumber", ColumnHeader: "Phone", isVisible: 1, isCustomCell: true,
            Cell: ({ row }) => <span>{row.A1_Phone || phoneMap.get(Number(row.Retailer_Id)) || row.A1 || "Not Available"}</span>,
        },
        {
            Field_Name: "BillQty", isVisible: 1, isCustomCell: true,
            Cell: ({ row }) => toArray(row.stockDetails).reduce((s, i) => s + (Number(i.Bill_Qty) || 0), 0),
        },
        {
            Field_Name: "AltActQty", ColumnHeader: "Alt Act Qty", isVisible: 1, isCustomCell: true,
            Cell: ({ row }) => RoundNumber(toArray(row.stockDetails).reduce((s, i) => s + toNumber(i.Alt_Act_Qty), 0)),
        },
        createCol("Narration", "string", "Narration"),
        {
            Field_Name: "Status", isVisible: 1, isCustomCell: true,
            Cell: ({ row }) => row.Delivery_Status || row.Conversion_Status || row.Status || "-",
        },
    ];

    const saleInvoiceColumns = [...baseColumns, { Field_Name: "Action", isVisible: 1, isCustomCell: true, Cell: (p) => <ActionCell {...p} tab="sale_invoice" /> }];
    const saleOrderColumns   = [...baseColumns, { Field_Name: "Action", isVisible: 1, isCustomCell: true, Cell: (p) => <ActionCell {...p} tab="sale_order" /> }];

    const priceListColumns = [
        { Field_Name: "Select",        isVisible: 1, isCustomCell: true, Cell: ({ row }) => selectCell(row) },
        { Field_Name: "Retailer_Name", Fied_Data: "string", ColumnHeader: "Customer Name", isVisible: 1 },
        { Field_Name: "Ret_Code",      Fied_Data: "string", ColumnHeader: "Customer Code", isVisible: 1 },
        { Field_Name: "PhoneNumber",   ColumnHeader: "Phone", isVisible: 1, isCustomCell: true, Cell: ({ row }) => <span>{row.A1 || "Not Available"}</span> },
        { Field_Name: "City",          Fied_Data: "string", ColumnHeader: "City",     isVisible: 1 },
        { Field_Name: "Location",      Fied_Data: "string", ColumnHeader: "Location", isVisible: 1 },
        { Field_Name: "Action",        isVisible: 1, isCustomCell: true, Cell: (p) => <ActionCell {...p} tab="price_list" /> },
    ];

    const receiptColumns = [
        { Field_Name: "Select",             isVisible: 1, isCustomCell: true, Cell: ({ row }) => selectCell(row) },
        { Field_Name: "receipt_invoice_no", Fied_Data: "string", ColumnHeader: "Receipt No",   isVisible: 1 },
        { Field_Name: "receipt_date",       Fied_Data: "date",   ColumnHeader: "Receipt Date", isVisible: 1 },
        { Field_Name: "DebitAccountGet",    Fied_Data: "string", ColumnHeader: "Debit Acct",   isVisible: 1 },
        { Field_Name: "CreditAccountGet",   Fied_Data: "string", ColumnHeader: "Credit Acct",  isVisible: 1 },
        { Field_Name: "PhoneNumber",        ColumnHeader: "Phone", isVisible: 1, isCustomCell: true, Cell: ({ row }) => <span>{row.A1_Phone || "Not Available"}</span> },
        { Field_Name: "Total_Invoice_value", Fied_Data: "number", ColumnHeader: "Amount", isVisible: 1, isCustomCell: true, Cell: ({ row }) => `₹${NumberFormat(row.debit_amount || row.credit_amount || 0)}` },
        { Field_Name: "transaction_type",   Fied_Data: "string", ColumnHeader: "Payment Mode", isVisible: 1 },
        { Field_Name: "bank_name",          Fied_Data: "string", ColumnHeader: "Bank",         isVisible: 1 },
        { Field_Name: "check_no",           Fied_Data: "string", ColumnHeader: "Cheque/Ref",   isVisible: 1 },
        { Field_Name: "Status",             Fied_Data: "string", ColumnHeader: "Status",        isVisible: 1 },
        createCol("Narration", "string", "Narration"),
        { Field_Name: "Action", isVisible: 1, isCustomCell: true, Cell: (p) => <ActionCell {...p} tab="receipt_list" /> },
    ];

    const applyFilters = useCallback(() => {
        let src;
        if (activeTab === "price_list")        src = priceListRetailers;
        else if (activeTab === "receipt_list") src = allReceipts;
        else                                   src = salesInvoices;

        let filtered = [...src];
        for (const col of filterColumns) {
            const fv = columnFilters[col.Field_Name];
            if (!fv) continue;
            if (fv.type === "range") {
                const { min, max } = fv;
                filtered = filtered.filter((item) => {
                    const v = item[col.Field_Name];
                    return (min === undefined || v >= min) && (max === undefined || v <= max);
                });
            } else if (fv.type === "date") {
                const { start, end } = fv.value || {};
                filtered = filtered.filter((item) => {
                    const d = new Date(item[col.Field_Name]);
                    return (!start || d >= new Date(start)) && (!end || d <= new Date(end));
                });
            } else if (Array.isArray(fv)) {
                const sel = fv.map(normalize).filter(Boolean);
                if (!sel.length) continue;
                if (typeof col.getFilterValues === "function") {
                    filtered = filtered.filter((item) =>
                        sel.some((v) => (col.getFilterValues(item) || []).map(normalize).includes(v))
                    );
                } else {
                    filtered = filtered.filter((item) => sel.includes(normalize(item[col.Field_Name])));
                }
            }
        }
        if (activeTab === "price_list") setFilteredPriceListRetailers(filtered);
        else setFilteredData(filtered);
    }, [columnFilters, salesInvoices, priceListRetailers, allReceipts, filterColumns, activeTab]);

    useEffect(() => { applyFilters(); }, [applyFilters]);

    useEffect(() => {
        const ids = selectAllCheckBox
            ? (activeTab === "price_list" ? filteredPriceListRetailers : filteredData).map((i) => toNumber(i.DocumentId))
            : [];
        setMultipleCostCenterUpdateValues((p) => ({ ...p, Do_Id: ids }));
        setMultipleStaffRemoveValues((p) => ({ ...p, Do_Id: ids }));
    }, [selectAllCheckBox, filteredData, filteredPriceListRetailers, activeTab]);

    const handleTabChange = (newVal) => {
        setActiveTab(newVal);
        setSelectAllCheckBox(false);
        setMultipleCostCenterUpdateValues(STAFF_INIT);
        setMultipleStaffRemoveValues(STAFF_INIT);
        setColumnFilters({});
        setPriceListSearch("");
        
        if (newVal === "price_list")         { priceListRetailers.length === 0 ? fetchRetailersWithLOL() : setFilteredPriceListRetailers(priceListRetailers); }
        else if (newVal === "sale_invoice")  { setSalesInvoices(allSalesInvoices); setFilteredData(allSalesInvoices); }
        else if (newVal === "sale_order")    { setSalesInvoices(allSalesOrders);   setFilteredData(allSalesOrders); }
        else if (newVal === "receipt_list")  { allReceipts.length === 0 ? fetchReceipts() : setFilteredData(allReceipts); }
    };

    const convertToISTShort = (iso) => {
        if (!iso) return "";
        const d   = new Date(iso);
        const ist = new Date(d.getTime() + 5.5 * 3600000);
        return `${String(ist.getUTCHours()).padStart(2, "0")}:${String(ist.getUTCMinutes()).padStart(2, "0")}`;
    };

    const downloadSelectedAsExcel = () => {
        const ids = multipleCostCenterUpdateValues.Do_Id;
        if (!ids.length) { toast.warning("Select at least one item"); return; }
        setDownloadLoading(true); setDownloadAnchorEl(null);
        try {
            const rows = salesInvoices.filter((inv) => ids.includes(toNumber(inv.DocumentId))).map((inv, i) => ({
                "S.No": i + 1, "Document No": inv.DocumentNumber || "", Type: inv.DocumentType || "",
                Created: convertToISTShort(inv.createdOn), Customer: inv.retailerNameGet || "",
                Phone: inv.A1_Phone || "Not Available",
                "Bill Qty":    toArray(inv.stockDetails).reduce((s, x) => s + (Number(x.Bill_Qty)    || 0), 0),
                "Alt Act Qty": toArray(inv.stockDetails).reduce((s, x) => s + (Number(x.Alt_Act_Qty) || 0), 0),
                Amount: inv.Total_Invoice_value || 0, Status: inv.Delivery_Status || inv.Conversion_Status || "",
            }));
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Data");
            XLSX.writeFile(wb, `Data_${viewMode}_${new Date().toISOString().split("T")[0]}.xlsx`);
            toast.success(`Downloaded ${ids.length} items as Excel`);
        } catch (e) { toast.error(`Excel download failed: ${e.message}`); }
        finally { setDownloadLoading(false); }
    };

    const downloadSelectedAsPDF = () => {
        const ids = multipleCostCenterUpdateValues.Do_Id;
        if (!ids.length) { toast.warning("Select at least one item"); return; }
        setDownloadLoading(true); setDownloadAnchorEl(null);
        try {
            const doc       = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
            const selected  = salesInvoices.filter((inv) => ids.includes(toNumber(inv.DocumentId)));
            const tableData = selected.map((inv, i) => [
                i + 1, inv.DocumentNumber || "N/A", inv.DocumentType || "",
                (inv.DocumentDate || "").split("T")[0], inv.voucherTypeGet || "",
                inv.retailerNameGet || "", `₹${NumberFormat(inv.Total_Invoice_value || 0)}`,
                toArray(inv.stockDetails).reduce((s, x) => s + (Number(x.Bill_Qty)    || 0), 0),
                toArray(inv.stockDetails).reduce((s, x) => s + (Number(x.Alt_Act_Qty) || 0), 0),
                inv.Delivery_Status || inv.Conversion_Status || "", inv.A1_Phone || "No Phone",
            ]);
            doc.setFontSize(14); doc.text(`Report — ${viewMode === "pending" ? "Pending" : "All"}`, 14, 14);
            doc.setFontSize(8);  doc.text(`Generated: ${new Date().toLocaleString()}`, 280, 10, { align: "right" });
            doc.autoTable({
                startY: 22,
                head: [["#", "Doc No", "Type", "Date", "Voucher", "Customer", "Amount", "Bill Qty", "Alt Qty", "Status", "Phone"]],
                body: tableData, theme: "grid",
                styles: { fontSize: 7, cellPadding: 1.5 },
                headStyles: { fillColor: [66, 66, 66], textColor: 255, fontStyle: "bold" },
                margin: { left: 8, right: 8 },
            });
            doc.save(`Report_${viewMode}_${new Date().toISOString().split("T")[0]}.pdf`);
            toast.success(`Downloaded ${ids.length} items as PDF`);
        } catch (e) { toast.error(`PDF download failed: ${e.message}`); }
        finally { setDownloadLoading(false); }
    };

    const handleMultiPrint = useReactToPrint({
        content: () => multiPrintRef.current,
        documentTitle: "Multiple Documents",
        pageStyle: `@page { margin: 0.6cm; size: auto; }`,
    });

    const refreshData = () => {
        if (activeTab === "price_list")        fetchRetailersWithLOL();
        else if (activeTab === "receipt_list") fetchReceipts();
        else if (viewMode === "pending")       fetchPendingInvoices();
        else fetchAllInvoices(true);
    };

    const renderFilter = (col) => {
        const { Field_Name, Fied_Data, ColumnHeader } = col;
        if (Fied_Data === "number") return (
            <Box sx={{ display: "flex", gap: 1 }}>
                <TextField size="small" type="number" label="Min" value={columnFilters[Field_Name]?.min ?? ""}
                    onChange={(e) => setColumnFilters((p) => ({ ...p, [Field_Name]: { type: "range", ...p[Field_Name], min: e.target.value ? parseFloat(e.target.value) : undefined } }))} />
                <TextField size="small" type="number" label="Max" value={columnFilters[Field_Name]?.max ?? ""}
                    onChange={(e) => setColumnFilters((p) => ({ ...p, [Field_Name]: { type: "range", ...p[Field_Name], max: e.target.value ? parseFloat(e.target.value) : undefined } }))} />
            </Box>
        );
        if (Fied_Data === "date") return (
            <Box sx={{ display: "flex", gap: 1 }}>
                <TextField size="small" type="date" label="From" InputLabelProps={{ shrink: true }}
                    value={columnFilters[Field_Name]?.value?.start ?? ""}
                    onChange={(e) => setColumnFilters((p) => ({ ...p, [Field_Name]: { type: "date", value: { ...p[Field_Name]?.value, start: e.target.value || undefined } } }))} />
                <TextField size="small" type="date" label="To" InputLabelProps={{ shrink: true }}
                    value={columnFilters[Field_Name]?.value?.end ?? ""}
                    onChange={(e) => setColumnFilters((p) => ({ ...p, [Field_Name]: { type: "date", value: { ...p[Field_Name]?.value, end: e.target.value || undefined } } }))} />
            </Box>
        );
        
        let src;
        if (activeTab === "price_list") {
            src = priceListRetailers;
        } else if (activeTab === "receipt_list") {
            src = allReceipts;
        } else {
            src = salesInvoices;
        }
        
        let filterValues;
        if (typeof col.getFilterValues === "function") {
            filterValues = src.flatMap((i) => col.getFilterValues(i) || []);
        } else {
            filterValues = src.map((i) => {
                const val = i[Field_Name];
                if (val === undefined || val === null) return "";
                if (typeof val === "object") return String(val) || "";
                return String(val);
            });
        }
        
        const validOptions = filterValues.filter(v => v && v !== "" && v !== "[object Object]");
        
        return (
            <Autocomplete
                multiple size="small" options={uniqueCaseInsensitive(validOptions)}
                disableCloseOnSelect getOptionLabel={(o) => o}
                value={columnFilters[Field_Name] || []}
                onChange={(_, v) => setColumnFilters((p) => ({ ...p, [Field_Name]: v }))}
                isOptionEqualToValue={(a, b) => a === b}
                renderOption={(props, option, { selected }) => (
                    <li {...props}><Checkbox icon={icon} checkedIcon={checkedIcon} checked={selected} sx={{ mr: 1 }} />{option}</li>
                )}
                renderInput={(params) => <TextField {...params} label={ColumnHeader || Field_Name} />}
            />
        );
    };

    const CurrentMethodBadge = () => {
        const { serviceName, langName } = tabMethodSettings[activeTab] || {};
        if (!serviceName) return null;
        return (
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                <Chip
                    icon={<WhatsAppIcon sx={{ fontSize: 14 }} />}
                    label={serviceName}
                    size="small"
                    color={serviceName.toLowerCase() === "askeva" ? "secondary" : "primary"}
                    sx={{ height: 22, fontSize: 10 }}
                />
                {langName && (
                    <Chip
                        icon={<Language sx={{ fontSize: 13 }} />}
                        label={langName}
                        size="small" color="info" variant="outlined"
                        sx={{ height: 22, fontSize: 10 }}
                    />
                )}
            </Box>
        );
    };

    const selectedCount = multipleCostCenterUpdateValues.Do_Id.length;

    const BulkWhatsAppButton = () => {
        if (!selectedCount) return null;
        return (
            <>
                <Tooltip title={`Send WhatsApp to ${selectedCount} selected`}>
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<WhatsAppIcon />}
                        endIcon={<ArrowDropDown />}
                        onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                        sx={{ textTransform: "none", bgcolor: "#25D366", "&:hover": { bgcolor: "#1ebe5c" } }}
                    >
                        Send ({selectedCount})
                    </Button>
                </Tooltip>

                <Menu
                    anchorEl={bulkMenuAnchor}
                    open={Boolean(bulkMenuAnchor)}
                    onClose={() => setBulkMenuAnchor(null)}
                >
                    <MenuItem onClick={() => handleBulkSend("parallel")}>
                        <ListItemIcon>
                            <SendAndArchive fontSize="small" color="success" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Send Simultaneously"
                            secondary={`Fire all ${selectedCount} messages at once`}
                        />
                    </MenuItem>

                    <MenuItem onClick={() => handleBulkSend("sequential")}>
                        <ListItemIcon>
                            <Send fontSize="small" color="info" />
                        </ListItemIcon>
                        <ListItemText
                            primary="Send One by One"
                            secondary="Sequential with progress tracking"
                        />
                    </MenuItem>
                </Menu>
            </>
        );
    };

const sharedButtonArea = (
    <>
        <CurrentMethodBadge />

        <Tooltip title="WhatsApp Settings for this tab">
            <IconButton size="small" onClick={() => setSettingsDialog(true)}>
                <Settings fontSize="small" />
            </IconButton>
        </Tooltip>

        {/* For price list tab - show search input alongside other buttons */}
        {activeTab === "price_list" && (
            <TextField
                size="small"
                placeholder="Search by Name, Code, City, Location or Phone..."
                value={priceListSearch}
                onChange={(e) => setPriceListSearch(e.target.value)}
                sx={{ minWidth: 300, ml: 1 }}
                InputProps={{
                    startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'action.active' }} />,
                }}
            />
        )}

        <Tooltip title="Select All">
            <Checkbox
                checked={selectAllCheckBox}
                onChange={(e) => setSelectAllCheckBox(e.target.checked)}
                disabled={
                    activeTab === "price_list"
                        ? filteredPriceListRetailers.length === 0
                        : filteredData.length === 0
                }
            />
        </Tooltip>

        <BulkWhatsAppButton />

        {activeTab !== "price_list" && (
            <IconButton size="small" onClick={() => setFilters((p) => ({ ...p, filterDialog: true }))} disabled={isRefreshing}>
                <FilterAlt />
            </IconButton>
        )}

        <IconButton size="small" onClick={refreshData} disabled={isRefreshing}>
            <Search />
        </IconButton>

        {viewMode === "pending" && activeTab !== "price_list" && activeTab !== "receipt_list" && (
            <>
                <Button
                    variant="contained" size="small"
                    startIcon={<Download />} endIcon={<ArrowDropDown />}
                    onClick={(e) => setDownloadAnchorEl(e.currentTarget)}
                    disabled={!multipleCostCenterUpdateValues.Do_Id.length || downloadLoading}
                    sx={{ ml: 1, textTransform: "none" }}
                >
                    {downloadLoading ? "Downloading…" : "Download"}
                </Button>
                <Menu anchorEl={downloadAnchorEl} open={Boolean(downloadAnchorEl)} onClose={() => setDownloadAnchorEl(null)}>
                    <MenuItem onClick={downloadSelectedAsExcel}>
                        <ListItemIcon><TableChart fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText>Download as Excel</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={downloadSelectedAsPDF}>
                        <ListItemIcon><PictureAsPdf fontSize="small" color="error" /></ListItemIcon>
                        <ListItemText>Download as PDF</ListItemText>
                    </MenuItem>
                </Menu>
            </>
        )}

        {activeTab !== "price_list" && activeTab !== "receipt_list" && (
            <input
                type="date" className="cus-inpt w-auto"
                value={filters.reqDate}
                onChange={(e) => setFilters((p) => ({ ...p, reqDate: e.target.value }))}
                disabled={isRefreshing}
            />
        )}

        {activeTab !== "price_list" && activeTab !== "receipt_list" && (
            <IconButton
                size="small"
                disabled={!filters.docType || !multipleCostCenterUpdateValues.Do_Id.length}
                onClick={() => { setCurrentPrintType(filters.docType); setMultiPrint({ open: true, doIds: multipleCostCenterUpdateValues.Do_Id, docType: filters.docType }); }}
            >
                <Print />
            </IconButton>
        )}
    </>
);

    const ReceiptFilterBar = () => (
        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Receipt Filters</Typography>
            <Stack direction="row" gap={2} flexWrap="wrap" alignItems="center">
                <TextField label="From Date" type="date" size="small" value={receiptFilters.Fromdate} InputLabelProps={{ shrink: true }}
                    onChange={(e) => setReceiptFilters((p) => ({ ...p, Fromdate: e.target.value }))} />
                <TextField label="To Date" type="date" size="small" value={receiptFilters.Todate} InputLabelProps={{ shrink: true }}
                    onChange={(e) => setReceiptFilters((p) => ({ ...p, Todate: e.target.value }))} />
                <TextField label="Voucher No" type="string" size="xl" value={receiptFilters.voucher}
                    onChange={(e) => setReceiptFilters((p) => ({ ...p, voucher: e.target.value }))} />
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>Payment Mode</InputLabel>
                    <MuiSelect value={receiptFilters.receipt_type} label="Payment Mode"
                        onChange={(e) => setReceiptFilters((p) => ({ ...p, receipt_type: e.target.value }))}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                        <MenuItem value="bank">Bank</MenuItem>
                        <MenuItem value="cheque">Cheque</MenuItem>
                        <MenuItem value="online">Online</MenuItem>
                    </MuiSelect>
                </FormControl>
                <Button variant="contained" size="small" startIcon={<Search />} onClick={fetchReceipts}>Search</Button>
                <Button variant="outlined" size="small" onClick={() => {
                    setReceiptFilters({ Fromdate: ISOString(), Todate: ISOString(), voucher: "", debit: "", credit: "", createdBy: "", status: "", receipt_type: "" });
                    setTimeout(fetchReceipts, 100);
                }}>Reset</Button>
            </Stack>
        </Box>
    );

    const sharedDialogs = (
        <>
            <Dialog open={filters.filterDialog} onClose={() => setFilters((p) => ({ ...p, filterDialog: false }))} maxWidth="sm" fullWidth>
                <DialogTitle>Filter Options</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {filterColumns.map((col, i) => <Box key={i}>{renderFilter(col)}</Box>)}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilters((p) => ({ ...p, filterDialog: false }))} variant="outlined">Close</Button>
                </DialogActions>
            </Dialog>

            <WhatsappSettingsDialog
                open={settingsDialog}
                onClose={() => setSettingsDialog(false)}
                activeTab={activeTab}
                onSettingsSaved={() => fetchAllTabSettings()}
            />

            <BulkSendProgressDialog
                open={bulkProgress.open}
                total={bulkProgress.total}
                sent={bulkProgress.sent}
                failed={bulkProgress.failed}
                mode={bulkProgress.mode}
                onClose={() => {
                    bulkAbortRef.current = true;
                    setBulkProgress((p) => ({ ...p, open: false }));
                }}
            />

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
            </Snackbar>
        </>
    );

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs value={activeTab} onChange={(_, v) => handleTabChange(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Sale Invoice" value="sale_invoice" />
                    <Tab label="Price List"   value="price_list" />
                    <Tab label="Sale Order"   value="sale_order" />
                    <Tab label="Receipt List" value="receipt_list" />
                </Tabs>
            </Box>

            {activeTab === "sale_invoice" && (
                <FilterableTable
                    title={viewMode === "pending" ? "Pending Sale Invoices" : "Sale Invoices"}
                    columns={saleInvoiceColumns} dataArray={filteredData}
                    EnableSerialNumber ButtonArea={sharedButtonArea}
                />
            )}

            {activeTab === "price_list" && (
                <FilterableTable
                    title="Price List — Retailers"
                    columns={priceListColumns} dataArray={filteredPriceListRetailers}
                    EnableSerialNumber ButtonArea={sharedButtonArea}
                />
            )}

            {activeTab === "sale_order" && (
                <FilterableTable
                    title={viewMode === "pending" ? "Pending Sale Orders" : "Sale Orders"}
                    columns={saleOrderColumns} dataArray={filteredData}
                    EnableSerialNumber ButtonArea={sharedButtonArea}
                />
            )}

            {activeTab === "receipt_list" && (
                <>
                    <ReceiptFilterBar />
                    <FilterableTable
                        title="Receipt List"
                        columns={receiptColumns} dataArray={filteredData}
                        EnableSerialNumber ButtonArea={sharedButtonArea}
                    />
                </>
            )}

            {sharedDialogs}
        </>
    );
};

export default Whatsapp;




// import { useState, useEffect, useMemo, useRef, useCallback } from "react";
// import {
//     checkIsNumber, isEqualNumber, ISOString, toArray, toNumber,
//     RoundNumber, NumberFormat, LocalDateWithTime
// } from "../../../Components/functions";
// import { fetchLink } from "../../../Components/fetchComponent";
// import FilterableTable, { createCol } from "../../../Components/filterableTable2";
// import {
//     Autocomplete, Button, Checkbox, Select as MuiSelect, MenuItem,
//     Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
//     Typography, TextField, Tooltip, Box, Divider, Snackbar, Alert,
//     InputLabel, FormControl, CircularProgress, Tab, Tabs, Switch,
//     FormControlLabel, Chip, Paper, Stack, RadioGroup, Radio, Menu,
//     ListItemIcon, ListItemText,
// } from "@mui/material";
// import {
//     CheckBox, CheckBoxOutlineBlank, FilterAlt, Print, Search,
//     Download, PictureAsPdf, TableChart, ArrowDropDown, Settings,
//     Language,
// } from "@mui/icons-material";
// import WhatsAppIcon from "@mui/icons-material/WhatsApp";
// import { toast } from "react-toastify";
// import { useReactToPrint } from "react-to-print";
// import { DotPeWhatsAppService } from "../../../Components/dotpeWhatsappService";
// import { Dot_Pe_Number } from "../../../encryptionKey";
// import api from "../../../API";
// import jsPDF from "jspdf";
// import "jspdf-autotable";
// import * as XLSX from "xlsx";
// import CheckIcon from '@mui/icons-material/Check';

// const ASKEVA_CONFIG = {
//     token: "ab232386697556df6e520afa18b48c46437849656eaf7a610c1d6150937aa2d11c2d4b3051674dfe37c020228da69c8fcda367a40a7e6a727ae020bcd7e27094",
//     apiEndpoint: "https://backend.askeva.io/v1/message/send-message",
// };

// const TAB_TO_WHATSAPP_TYPE = {
//     sale_invoice: "Sales_Invoice",
//     price_list:   "Price_List",
//     sale_order:   "Sales",
//     receipt_list: "Receipt_List",
// };


// const TEMPLATE_MAP = {
//     sale_invoice: {
//         dotpe: {
//             english: "sales_invoice_en",
//             tamil:   "sales_invoice_order", 
//         },
//         askeva: {
//             english: "sales_invoice_en",
//             tamil:   "sales_invoice_thanks",
//         },
//     },
//     price_list: {
//         dotpe: {
//             english: "price_list_en",
//             tamil:   "price_list",
//         },
//         askeva: {
//             english: "price_list_en",
//             tamil:   "price_list_thanks",
//         },
//     },
//     sale_order: {
//         dotpe: {
//             english: "sale_order_new_en",
//             tamil:   "sale_order",
//         },
//         askeva: {
//             english: "sale_order_new_en",
//             tamil:   "sale_order_thankss",
//         },
//     },
//     receipt_list: {
//         dotpe: {
//             english: "payment_receipt",
//             tamil:   "payment_receipt",
//         },
//         askeva: {
//             english: "receipt_list_en",
//             tamil:   "receipt_list_thanks",
//         },
//     },
// };


// const LANG_CODE_MAP = {
//     english: "en",
//     tamil:   "ta",
// };

// const icon        = <CheckBoxOutlineBlank fontSize="small" />;
// const checkedIcon = <CheckBox fontSize="small" />;

// const STAFF_INIT = {
//     CostCategory: { label: "", value: "" },
//     Do_Id: [],
//     involvedStaffs: [],
//     staffInvolvedStatus: 0,
//     deliveryStatus: 5,
// };

// const normalize = (v) => String(v ?? "").toLowerCase().trim();

// const uniqueCaseInsensitive = (values) => {
//     const map = new Map();
//     for (const v of values) {
//         const s = String(v ?? "").trim();
//         if (!s) continue;
//         const key = s.toLowerCase();
//         if (!map.has(key)) map.set(key, s);
//     }
//     return Array.from(map.values());
// };

// const getCostTypeEmployees = (row, costTypeId) =>
//     toArray(row?.involvedStaffs)
//         .filter((e) => isEqualNumber(e.Emp_Type_Id, costTypeId))
//         .map((e) => String(e.Emp_Name ?? "").trim())
//         .filter(Boolean);

// const generateUniqueClientRefId = (prefix, invoiceNo) => {
//     const clean = String(invoiceNo || "unknown").replace(/[^a-zA-Z0-9]/g, "_").slice(-8);
//     return `${prefix}_${clean}_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substring(2, 6)}`;
// };

// const normalizePhone = (raw) => {
//     let p = String(raw).replace(/[^0-9]/g, "");
//     if (p.startsWith("0")) p = p.substring(1);
//     if (!p.startsWith("91")) p = `91${p}`;
//     return p;
// };

// const sendViaAskeva = async ({ phone, templateName, language = "en", bodyParams }) => {
//     const payload = {
//         to: phone,
//         type: "template",
//         template: {
//             name: templateName,
//             language: { code: language },
//             components: [
//                 {
//                     type: "body",
//                     parameters: bodyParams.map((text) => ({ type: "text", text: String(text) })),
//                 },
//             ],
//         },
//     };
//     const resp = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${ASKEVA_CONFIG.token}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//     });
//     const data = await resp.json();
//     if (!resp.ok) throw new Error(data.message || data.error || "Askeva send failed");
//     return data;
// };

// const sendViaDotPe = async ({ phone, templateName, language = "en", bodyParams, clientRefId }) => {
//     const payload = {
//         template: { name: templateName, language },
//         source: "crm",
//         wabaNumber: Dot_Pe_Number,
//         recipients: [phone],
//         clientRefId,
//         params: { body: bodyParams.map(String) },
//     };
//     const resp = await DotPeWhatsAppService.sendTemplateMessage(payload);
//     if (!resp?.status) throw new Error(resp?.message || "DotPe send failed");
//     return resp;
// };


// const WhatsappSettingsDialog = ({ open, onClose, activeTab, onSettingsSaved }) => {
//     const [loading, setLoading] = useState(false);
//     const [whatsappServices, setWhatsappServices] = useState([]);
//     const [whatsappLanguages, setWhatsappLanguages] = useState([]);
//     const [selectedServiceId, setSelectedServiceId] = useState("");
//     const [selectedLangId, setSelectedLangId] = useState("");
//     const [serviceSelections, setServiceSelections] = useState({});
//     const [currentServiceId, setCurrentServiceId] = useState(null);
//     const [currentMethodId, setCurrentMethodId] = useState(null);

//     useEffect(() => {
//         if (open && activeTab) {
//             fetchCurrentSettings();
//             fetchWhatsappServices();
//             fetchWhatsappLanguages();
//         }
//     }, [open, activeTab]);

//     const fetchCurrentSettings = async () => {
//         try {
//             const typesResp = await fetchLink({ address: "masters/whatsappTypes" });
//             const types = toArray(typesResp?.data);
//             const typeRec = types.find(
//                 (t) => t.WhatsappType?.toLowerCase() === TAB_TO_WHATSAPP_TYPE[activeTab]?.toLowerCase()
//             );
            
//             if (!typeRec) return;

//             const response = await fetchLink({
//                 address: `masters/whatsappMethod?WhatsappType_Id=${typeRec.Id}`
//             });
            
//             const methods = toArray(response?.message || response?.data);
//             const activeMethod = methods.find(m => toNumber(m.Status) === 1);
            
//             if (activeMethod) {
//                 setCurrentMethodId(activeMethod.Id);
//                 setCurrentServiceId(String(activeMethod.Service_Id));
//                 setSelectedServiceId(String(activeMethod.Service_Id));
//                 setSelectedLangId(String(activeMethod.lang_Id || ""));
                
//                 setServiceSelections({
//                     [activeMethod.Service_Id]: {
//                         langId: activeMethod.lang_Id,
//                         langName: activeMethod.language
//                     }
//                 });
//             }
//         } catch (error) {
//             console.error("Error fetching current settings:", error);
//         }
//     };

//     const fetchWhatsappServices = async () => {
//         try {
//             const response = await fetchLink({ address: "masters/whatsappServices" });
//             if (response?.success || response?.message) {
//                 const services = toArray(response.message || response.data);
//                 setWhatsappServices(services);
//             }
//         } catch (error) {
//             console.error("Error fetching services:", error);
//         }
//     };

//     const fetchWhatsappLanguages = async () => {
//         try {
//             const response = await fetchLink({ address: "masters/whatsappLanguages" });
//             if (response?.success || response?.data) {
//                 const languages = toArray(response.message || response.message);
//                 setWhatsappLanguages(languages);
//             }
//         } catch (error) {
//             console.error("Error fetching languages:", error);
//         }
//     };

//     const handleSave = async () => {
//         if (!selectedServiceId) {
//             toast.error("Please select a WhatsApp service");
//             return;
//         }

//         if (!selectedLangId) {
//             toast.error("Please select a language");
//             return;
//         }

//         setLoading(true);
//         try {
//             const typesResp = await fetchLink({ address: "masters/whatsappTypes" });
//             const types = toArray(typesResp?.data);
//             const typeRec = types.find(
//                 (t) => t.WhatsappType?.toLowerCase() === TAB_TO_WHATSAPP_TYPE[activeTab]?.toLowerCase()
//             );
            
//             if (!typeRec) {
//                 toast.error("WhatsApp type not found for this tab");
//                 return;
//             }

//             let response;
            
//             if (currentMethodId) {
     
//                 response = await fetchLink({
//                     address: `masters/whatsappMethod`, 
//                     method: "PUT",
//                     bodyData: {
//                         Id: currentMethodId,
//                         Service_Id: parseInt(selectedServiceId),
//                         Status: 1,
//                         WhatsappType_Id: typeRec.Id,
//                         lang_Id: parseInt(selectedLangId)
//                     }
//                 });
//             } else {
//                 // CREATE
//                 response = await fetchLink({
//                     address: "masters/whatsappMethod",
//                     method: "POST",
//                     bodyData: {
//                         Service_Id: parseInt(selectedServiceId),
//                         WhatsappType_Id: typeRec.Id,
//                         lang_Id: parseInt(selectedLangId),
//                         Status: 1
//                     }
//                 });
//             }

//             if (response?.success) {
//                 toast.success(`WhatsApp settings ${currentMethodId ? 'updated' : 'saved'} successfully!`);
//                 onSettingsSaved();
//                 onClose();
//             } else {
//                 toast.error(response?.message || `Failed to ${currentMethodId ? 'update' : 'save'} settings`);
//             }
//         } catch (error) {
//             console.error("Error saving settings:", error);
//             toast.error("Failed to save settings");
//         } finally {
//             setLoading(false);
//         }
//     };

//     const selectedServiceObj = whatsappServices.find(s => String(s.Id) === selectedServiceId);

//     return (
//         <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
//             <DialogTitle>
//                 WhatsApp Settings - {activeTab?.replace("_", " ").toUpperCase()}
//             </DialogTitle>
            
//             <DialogContent>
//                 {loading ? (
//                     <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
//                         <CircularProgress />
//                     </Box>
//                 ) : (
//                     <Box sx={{ pt: 1 }}>
   
//                         <Box mb={3} p={1.5} bgcolor="action.hover" borderRadius={1}>
//                             <Typography variant="body2" color="text.secondary">Currently Active:</Typography>
//                             <Box mt={1} display="flex" gap={1} flexWrap="wrap">
//                                 {currentServiceId ? (
//                                     <>
//                                         <Chip
//                                             icon={<WhatsAppIcon />}
//                                             label={whatsappServices.find(s => String(s.Id) === currentServiceId)?.WhatsappService || "Unknown"}
//                                             color="success"
//                                         />
//                                         {serviceSelections[currentServiceId]?.langName && (
//                                             <Chip
//                                                 icon={<Language />}
//                                                 label={serviceSelections[currentServiceId].langName}
//                                                 color="info"
//                                             />
//                                         )}
//                                     </>
//                                 ) : (
//                                     <Chip label="No configuration set" color="warning" />
//                                 )}
//                             </Box>
//                         </Box>

//                         <Divider sx={{ mb: 2 }} />

                       
//                         <Typography variant="subtitle1" fontWeight="bold" mb={2}>
//                             1. Select WhatsApp Service
//                         </Typography>
                        
//                         <RadioGroup
//                             value={selectedServiceId}
//                             onChange={(e) => {
//                                 setSelectedServiceId(e.target.value);
//                                 const existing = serviceSelections[e.target.value];
//                                 if (existing?.langId) {
//                                     setSelectedLangId(existing.langId);
//                                 } else {
//                                     setSelectedLangId("");
//                                 }
//                             }}
//                         >
//                             <Stack direction="row" spacing={2} flexWrap="wrap">
//                                 {whatsappServices.map((service) => {
//                                     const svcId = String(service.Id);
//                                     const isActive = currentServiceId === svcId;
//                                     const savedLang = serviceSelections[svcId]?.langName;
                                    
//                                     return (
//                                         <Paper
//                                             key={service.Id}
//                                             variant="outlined"
//                                             sx={{
//                                                 p: 1.5,
//                                                 minWidth: 160,
//                                                 cursor: "pointer",
//                                                 borderColor: selectedServiceId === svcId ? "primary.main" : "divider",
//                                                 bgcolor: selectedServiceId === svcId ? "primary.50" : "background.paper",
//                                             }}
//                                             onClick={() => {
//                                                 setSelectedServiceId(svcId);
//                                                 const existing = serviceSelections[svcId];
//                                                 if (existing?.langId) {
//                                                     setSelectedLangId(existing.langId);
//                                                 } else {
//                                                     setSelectedLangId("");
//                                                 }
//                                             }}
//                                         >
//                                             <FormControlLabel
//                                                 value={svcId}
//                                                 control={<Radio size="small" />}
//                                                 label={
//                                                     <Box>
//                                                         <Box display="flex" alignItems="center" gap={1}>
//                                                             <Typography variant="body2" fontWeight="bold">
//                                                                 {service.WhatsappService}
//                                                             </Typography>
//                                                             {isActive && (
//                                                                 <Chip label="ACTIVE" size="small" color="success" sx={{ height: 18, fontSize: 9 }} />
//                                                             )}
//                                                         </Box>
//                                                         {savedLang && !isActive && (
//                                                             <Chip 
//                                                                 label={`Saved: ${savedLang}`} 
//                                                                 size="small" 
//                                                                 variant="outlined"
//                                                                 sx={{ mt: 0.5, height: 18, fontSize: 9 }}
//                                                             />
//                                                         )}
//                                                     </Box>
//                                                 }
//                                                 sx={{ m: 0 }}
//                                             />
//                                         </Paper>
//                                     );
//                                 })}
//                             </Stack>
//                         </RadioGroup>

                    
//                         {selectedServiceId && whatsappLanguages.length > 0 && (
//                             <>
//                                 <Divider sx={{ my: 2 }} />
//                                 <Typography variant="subtitle1" fontWeight="bold" mb={1.5}>
//                                     2. Select Language
//                                 </Typography>
//                                 <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
//                                     {whatsappLanguages.map((lang) => {
//                                         const langId = String(lang.Id);
//                                         const isSelected = selectedLangId === langId;
                                        
//                                         return (
//                                             <Chip
//                                                 key={lang.Id}
//                                                 label={lang.Language || lang.language}
//                                                 onClick={() => setSelectedLangId(langId)}
//                                                 color={isSelected ? "primary" : "default"}
//                                                 variant={isSelected ? "filled" : "outlined"}
//                                                 icon={isSelected ? <CheckIcon /> : <Language />}
//                                                 sx={{ 
//                                                     cursor: "pointer",
//                                                     '&:hover': {
//                                                         bgcolor: isSelected ? "primary.dark" : "action.hover"
//                                                     }
//                                                 }}
//                                             />
//                                         );
//                                     })}
//                                 </Stack>
                                
//                                 {selectedLangId && serviceSelections[selectedServiceId]?.langId === selectedLangId && (
//                                     <Chip 
//                                         label="Active" 
//                                         size="small" 
//                                         color="success" 
//                                         variant="outlined"
//                                         sx={{ mt: 1 }}
//                                     />
//                                 )}
//                             </>
//                         )}

//                         {whatsappLanguages.length === 0 && (
//                             <Box mt={2} p={2} bgcolor="warning.50" borderRadius={1}>
//                                 <Typography color="warning.main" variant="body2">
//                                     ⚠️ No languages configured. Please add languages (English, Tamil) to the whatsappLanguages table.
//                                 </Typography>
//                             </Box>
//                         )}

//                         {whatsappServices.length === 0 && (
//                             <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
//                                 No WhatsApp services configured. Please add services in admin settings.
//                             </Typography>
//                         )}
//                     </Box>
//                 )}
//             </DialogContent>
            
//             <DialogActions>
//                 <Button onClick={onClose}>Cancel</Button>
//                 <Button 
//                     onClick={handleSave} 
//                     variant="contained" 
//                     disabled={!selectedServiceId || !selectedLangId || loading}
//                 >
//                     {loading ? "Saving..." : (currentMethodId ? "Update Settings" : "Save Settings")}
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     );
// };

// const Whatsapp = ({ loadingOn, loadingOff, AddRights, EditRights, PrintRights, pageID }) => {
//     const storage = JSON.parse(localStorage.getItem("user") || "{}");

//     const [salesInvoices,              setSalesInvoices]              = useState([]);
//     const [allSalesInvoices,            setAllSalesInvoices]            = useState([]);
//     const [allSalesOrders,              setAllSalesOrders]              = useState([]);
//     const [allReceipts,                 setAllReceipts]                 = useState([]);
//     const [priceListRetailers,          setPriceListRetailers]          = useState([]);
//     const [filteredPriceListRetailers,  setFilteredPriceListRetailers]  = useState([]);
//     const [costCenterData,              setCostCenterData]              = useState([]);
//     const [costTypes,                   setCostTypes]                   = useState([]);
//     const [uniqueInvolvedCost,          setUniqueInvolvedCost]          = useState([]);
//     const [phoneMap,                    setPhoneMap]                    = useState(new Map());

//     const [viewMode,          setViewMode]          = useState("normal");
//     const [isLoading,         setIsLoading]         = useState(true);
//     const [isRefreshing,      setIsRefreshing]      = useState(false);
//     const [hasInitialLoading, setHasInitialLoading] = useState(false);
//     const [isPhoneMapLoaded,  setIsPhoneMapLoaded]  = useState(false);
//     const [initialDataLoaded, setInitialDataLoaded] = useState(false);
//     const [activeTab,         setActiveTab]         = useState("sale_invoice");
//     const [sendingStates,     setSendingStates]     = useState({});
//     const [selectAllCheckBox, setSelectAllCheckBox] = useState(false);
//     const [downloadLoading,   setDownloadLoading]   = useState(false);
//     const [downloadAnchorEl,  setDownloadAnchorEl]  = useState(null);
//     const [currentPrintType,  setCurrentPrintType]  = useState("");
//     const [printReady,        setPrintReady]        = useState(false);
//     const [columnFilters,     setColumnFilters]     = useState({});
//     const [filteredData,      setFilteredData]      = useState([]);

//     const [tabMethodSettings, setTabMethodSettings] = useState({});
//     const [settingsDialog,    setSettingsDialog]    = useState(false);
//     const [allMethods,        setAllMethods]        = useState([]);

//     const [filters, setFilters] = useState({
//         reqDate: ISOString(),
//         assignDialog: false,
//         filterDialog: false,
//         selectedInvoice: null,
//         multipleStaffUpdateDialog: false,
//         multipleStaffRemoveDialog: false,
//         fetchTrigger: 0,
//         docType: "",
//         staffStatus: 0,
//     });

//     const [multipleCostCenterUpdateValues, setMultipleCostCenterUpdateValues] = useState(STAFF_INIT);
//     const [multipleStaffRemoveValues,      setMultipleStaffRemoveValues]      = useState(STAFF_INIT);

//     const [receiptFilters, setReceiptFilters] = useState({
//         Fromdate: ISOString(), Todate: ISOString(),
//         voucher: "", debit: "", credit: "", createdBy: "", status: "", receipt_type: "",
//     });

//     const [snackbar,       setSnackbar]       = useState({ open: false, message: "", severity: "success" });
//     const [pdfGeneration,  setPdfGeneration]  = useState({ loading: false, pdfUrl: null, error: null });
//     const [multiPrint,     setMultiPrint]     = useState({ open: false, doIds: [], docType: "" });
//     const multiPrintRef = useRef(null);
//     const [companyInfo,setCompanyInfo] = useState([]);


//     useEffect(()=>{

//          const companyId = storage?.Company_id;
//           if(companyId){
//             fetchLink({ address: `masters/company?Company_id=${companyId}` })
//             .then(response => {
//                 if(response?.success && response?.data[0]){
//                     setCompanyInfo(response.data);
//                 }

//             })
//             .catch(error => {
//                 console.error("Error fetching company info:", error);
//             });
//             }
//     },[])

//     const fetchAllTabSettings = useCallback(async () => {
//         try {
//             const [typesResp, servicesResp] = await Promise.all([
//                 fetchLink({ address: "masters/whatsappTypes" }),
//                 fetchLink({ address: "masters/whatsappServices" }),
                
//             ]);
//             const types    = toArray(typesResp?.data);
//             const services = toArray(servicesResp?.message);
//             setAllMethods(services);

//             const settings = {};

//             await Promise.all(
//                 Object.entries(TAB_TO_WHATSAPP_TYPE).map(async ([tab, typeName]) => {
//                     const typeRec = types.find(
//                         (t) => t.WhatsappType?.toLowerCase() === typeName.toLowerCase()
//                     );
//                     if (!typeRec) return;

//                     const methodsResp = await fetchLink({
//                         address: `masters/whatsappMethod?WhatsappType_Id=${typeRec.Id}`,
//                     });
//                     const methods = toArray(methodsResp?.message);

//                     const activeMethod = methods.find((m) => toNumber(m.Status) === 1);
//                      console.log("active method",activeMethod)
//                     if (activeMethod) {
//                         settings[tab] = {
//                             serviceId:   toNumber(activeMethod.Service_Id),
//                             serviceName: activeMethod.WhatsappService,
//                             langId:      activeMethod.lang_Id   ? toNumber(activeMethod.lang_Id)  : null,
//                             langName:    activeMethod.language  ? activeMethod.language.toLowerCase() : "english",
//                         };
//                     } else {
//                         // fallback: prefer Dotpe, English
//                         const defaultService = services.find(
//                             (s) => s.WhatsappService?.toLowerCase() === "dotpe"
//                         ) || services[0];
//                         settings[tab] = {
//                             serviceId:   defaultService ? toNumber(defaultService.Id) : null,
//                             serviceName: defaultService?.WhatsappService || "Dotpe",
//                             langId:      null,
//                             langName:    "english",
//                         };
//                     }
//                 })
//             );

//             setTabMethodSettings(settings);
//         } catch (e) {
//             console.error("Error fetching tab settings:", e);
//         }
//     }, []);

//     const resolveTemplate = useCallback((tab, serviceName, langName) => {
//         const svcKey  = (serviceName || "dotpe").toLowerCase();
//         const langKey = (langName    || "english").toLowerCase();
//         return (
//             TEMPLATE_MAP[tab]?.[svcKey]?.[langKey] ||
//             TEMPLATE_MAP[tab]?.[svcKey]?.["english"] ||
//             TEMPLATE_MAP[tab]?.["dotpe"]?.["english"] ||
//             "sales_invoice_order"
//         );
//     }, []);

   
//     const sendWhatsAppMessage = useCallback(
//         async ({ tab, phone, bodyParams, clientRefId }) => {
//             const { serviceName = "Dotpe", langName = "en" } = tabMethodSettings[tab] || {};
//             const svcKey  = serviceName.toLowerCase();
//             const langKey = langName.toLowerCase();
//             const langCode = LANG_CODE_MAP[langKey] || "en";

//             const templateName = resolveTemplate(tab, svcKey, langKey);

//             if (svcKey === "askeva") {
//                 return sendViaAskeva({ phone, templateName, language: langCode, bodyParams });
//             }
//             return sendViaDotPe({ phone, templateName, language: langCode, bodyParams, clientRefId });
//         },
//         [tabMethodSettings, resolveTemplate]
//     );

   
//     const calculateAltActQty = (item) => {
//         if (item.Alt_Act_Qty != null) return Number(item.Alt_Act_Qty) || 0;
//         const billQty = Number(item.Bill_Qty) || 0;
//         for (const f of ["AltQty", "Alt_Qty", "Alternate_Qty", "Actual_Qty"]) {
//             if (item[f] != null) return Number(item[f]) || 0;
//         }
//         return billQty * (Number(item.PackValue) || 1);
//     };

//     const fetchPhoneMap = async () => {
//         try {
//             const response = await fetchLink({ address: "masters/getlolDetails" });
//             if (response?.success && response.data) {
//                 const map = new Map();
//                 response.data.forEach((item) => {
//                     if (item.A1) map.set(Number(item.Ret_Id), item.A1);
//                 });
//                 setPhoneMap(map);
//                 setIsPhoneMapLoaded(true);
//                 return map;
//             }
//             return new Map();
//         } catch (e) {
//             console.error("Error fetching phone map:", e);
//             setIsPhoneMapLoaded(true);
//             return new Map();
//         }
//     };

//     const getPDFUrlSimple = (order) => {
//         const formattedInvoiceNo = (order.DocumentNumber || "").replace(/_/g, "/");
//         const encodedInvoiceNo   = btoa(formattedInvoiceNo);
//         const companyid          = btoa(storage?.Company_id);
//         return `https://printapp.erpsmt.in/sales/downloadPdf?Do_Inv_No=${encodedInvoiceNo}&Company_id=${companyid}`;
//     };

//     const processInvoice = (invoice, phoneMapRef) => ({
//         ...invoice,
//         DocumentType:   "SalesInvoice",
//         DocumentId:     invoice.Do_Id,
//         DocumentNumber: invoice.Do_Inv_No,
//         DocumentDate:   invoice.Do_Date,
//         A1_Phone: (phoneMapRef || phoneMap).get(Number(invoice.Retailer_Id)) || invoice.A1 || "Not Available",
//         ...(Array.isArray(invoice.stockDetails)
//             ? { stockDetails: invoice.stockDetails.map((i) => ({ ...i, Alt_Act_Qty: calculateAltActQty(i) })) }
//             : {}),
//     });

//     const processOrder = (order, phoneMapRef) => ({
//         ...order,
//         DocumentType:    "SalesOrder",
//         DocumentId:      order.So_Id || order.Id,
//         DocumentNumber:  order.So_Inv_No || order.Invoice_No,
//         DocumentDate:    order.So_Date || order.Invoice_Date,
//         voucherTypeGet:  order.voucherTypeGet || "Sales Order",
//         Delivery_Status: order.Conversion_Status || "Not Converted",
//         A1_Phone: (phoneMapRef || phoneMap).get(Number(order.Retailer_Id)) || order.A1 || "Not Available",
//     });


//     const fetchAllInvoices = async (refresh = false) => {
//         try {
//             if (!refresh) setIsLoading(true);
//             else setIsRefreshing(true);
//             setViewMode("normal");

//             const [siResp, soResp] = await Promise.all([
//                 fetchLink({ address: `sales/salesInvoice/lrReportWhatsapp?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`, loadingOn, loadingOff }),
//                 fetchLink({ address: `sales/salesOrder/lrReportWhatsapp?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`, loadingOn, loadingOff }),
//             ]);

//             const si = toArray(siResp?.data).map((x) => processInvoice(x, phoneMap));
//             const so = toArray(soResp?.data).map((x) => processOrder(x, phoneMap));

//             setAllSalesInvoices(si);
//             setAllSalesOrders(so);
//             setCostTypes(toArray(siResp?.others?.costTypes || soResp?.others?.costTypes));
//             setUniqueInvolvedCost(toArray(siResp?.others?.uniqeInvolvedStaffs || soResp?.others?.uniqeInvolvedStaffs));

//             if (activeTab === "sale_invoice")  { setSalesInvoices(si); setFilteredData(si); }
//             else if (activeTab === "sale_order") { setSalesInvoices(so); setFilteredData(so); }
//             else if (activeTab !== "receipt_list" && activeTab !== "price_list") { setSalesInvoices(si); setFilteredData(si); }

//             if (!hasInitialLoading) setHasInitialLoading(true);
//         } catch (e) {
//             console.error(e);
//             toast.error("Failed to load data");
//         } finally {
//             if (!refresh) setIsLoading(false);
//             setIsRefreshing(false);
//         }
//     };

//     const fetchPendingInvoices = async () => {
//         try {
//             setIsLoading(true);
//             setViewMode("pending");
//             const [siResp, soResp] = await Promise.all([
//                 fetchLink({ address: `sales/salesInvoice/pendingDetails?reqDate=${filters.reqDate}`, loadingOn, loadingOff }),
//                 fetchLink({ address: `sales/salesOrder/pendingDetails?reqDate=${filters.reqDate}`, loadingOn, loadingOff }),
//             ]);
//             const si = toArray(siResp?.data).map((x) => processInvoice(x, phoneMap));
//             const so = toArray(soResp?.data).map((x) => processOrder(x, phoneMap));
//             setAllSalesInvoices(si);
//             setAllSalesOrders(so);
//             if (activeTab === "sale_invoice")  { setSalesInvoices(si); setFilteredData(si); }
//             else if (activeTab === "sale_order") { setSalesInvoices(so); setFilteredData(so); }
//             if (siResp?.others?.costTypes)          setCostTypes(toArray(siResp.others.costTypes));
//             if (siResp?.others?.uniqeInvolvedStaffs) setUniqueInvolvedCost(toArray(siResp.others.uniqeInvolvedStaffs));
//         } catch (e) {
//             console.error(e);
//             toast.error("Failed to load pending data");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const fetchReceipts = async () => {
//         try {
//             setIsLoading(true);
//             const params = new URLSearchParams(receiptFilters);
//             const response = await fetchLink({ address: `receipt/receiptMasterwithLol?${params}`, loadingOn, loadingOff });
//             if (response?.success && response.data) {
//                 const recs = toArray(response.data).map((r) => ({
//                     ...r,
//                     DocumentType:        "Receipt",
//                     DocumentId:          r.Receipt_Id || r.Id,
//                     DocumentNumber:      r.Receipt_No || r.receipt_invoice_no,
//                     DocumentDate:        r.receipt_date || r.Created_Date,
//                     voucherTypeGet:      r.Voucher_Type,
//                     transaction_type: r.transaction_type,
//                     retailerNameGet:     r.Customer_Name || r.Retailer_Name,
//                     Total_Invoice_value: r.credit_amount || r.debit_amount || 0,
//                     createdOn:           r.Created_Date || r.Receipt_Date,
//                     A1_Phone:            phoneMap.get(Number(r.Retailer_Id)) || r.Phone_No || "Not Available",
//                 }));
//                 setAllReceipts(recs);
//                 if (activeTab === "receipt_list") setFilteredData(recs);
//             } else {
//                 setAllReceipts([]);
//                 if (activeTab === "receipt_list") setFilteredData([]);
//                 toast.info("No receipts found");
//             }
//         } catch (e) {
//             toast.error("Failed to load receipts");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const fetchRetailersWithLOL = async () => {
//         try {
//             setIsLoading(true);
//             const response = await fetchLink({ address: "masters/retailerswithlol", loadingOn, loadingOff });
//             if (response?.success && response.data) {
//                 const retailers = toArray(response.data).map((r) => ({
//                     ...r,
//                     DocumentType:   "PriceList",
//                     DocumentId:     r.Ret_Id,
//                     DocumentNumber: `PL_${r.Ret_Id}`,
//                     retailerNameGet:r.Retailer_Name,
//                     A1_Phone:       phoneMap.get(Number(r.Ret_Id)) || r.A1 || "Not Available",
//                     Retailer_Id:    r.Ret_Id,
//                 }));
//                 setPriceListRetailers(retailers);
//                 setFilteredPriceListRetailers(retailers);
//             }
//         } catch (e) {
//             toast.error("Failed to load price list data");
//         } finally {
//             setIsLoading(false);
//         }
//     };

   
//     useEffect(() => {
//         const init = async () => {
//             setIsLoading(true);
//             await fetchPhoneMap();
//             await fetchAllInvoices();
//             await fetchLink({ address: "masters/erpCostCenter/dropDown" })
//                 .then((d) => setCostCenterData(toArray(d.data)))
//                 .catch(console.error);
//             await fetchAllTabSettings();
//             setInitialDataLoaded(true);
//             setIsLoading(false);
//         };
//         init();
//     }, []);

//     useEffect(() => {
//         if (initialDataLoaded) {
//             if (viewMode === "normal") fetchAllInvoices(true);
//             else fetchPendingInvoices();
//         }
//     }, [filters.fetchTrigger, filters.staffStatus, filters.reqDate, viewMode, initialDataLoaded]);

//     useEffect(() => {
//         if (multiPrint.open) {
//             const t = setTimeout(() => { if (multiPrintRef.current) setPrintReady(true); }, 300);
//             return () => clearTimeout(t);
//         } else setPrintReady(false);
//     }, [multiPrint.open]);

   
//     const sendSaleInvoiceWhatsApp = async (row) => {
//         const id = row.DocumentId;
//         setSendingStates((p) => ({ ...p, [id]: true }));
//         try {
//             let phone = phoneMap.get(Number(row.Retailer_Id)) || row.A1 || row.Customer_Phone;
//             if (!phone) { toast.error("Phone not found"); return false; }
//             phone = normalizePhone(phone);

//             const pdfUrl       = getPDFUrlSimple(row);
//             const companyname  = companyInfo[0]?.Company_Name;
//             const customerName = row.retailerNameGet || "";
//             const invoiceNo    = row.DocumentNumber  || "-";
//             const date         = new Date(row.Do_Date || row.DocumentDate || row.createdOn).toLocaleDateString("en-GB");
//             const amount       = Number(row.Total_Invoice_value || 0).toFixed(2);
//             const company      = storage?.Company_id == 1 ? "SM TRADERS" : "MOBITE";

//             await sendWhatsAppMessage({
//                 tab: "sale_invoice",
//                 phone,
//                 bodyParams:  [companyname,customerName, invoiceNo, date, amount, pdfUrl],
//                 clientRefId: generateUniqueClientRefId("inv", invoiceNo),
//             });
//             toast.success("Sale invoice sent via WhatsApp!");
//             return true;
//         } catch (e) {
//             toast.error(`Failed: ${e.message}`);
//             return false;
//         } finally {
//             setSendingStates((p) => ({ ...p, [id]: false }));
//         }
//     };

//     const sendPriceListWhatsApp = async (row) => {
//         const id = row.DocumentId;
//         setSendingStates((p) => ({ ...p, [id]: true }));
//         try {
//             let phone = phoneMap.get(Number(row.Retailer_Id)) || row.A1 || row.Customer_Phone;
//             if (!phone) { toast.error("Phone not found"); return false; }
//             phone = normalizePhone(phone);

//             const encodedCompanyId = btoa(storage?.Company_id);
//             const priceListLink    = `https://printapp.erpsmt.in/rateMaster?Company_id=${encodedCompanyId}`;
//             const customerName     = row.retailerNameGet || row.Retailer_Name || "Customer";
//             const companyname= companyInfo[0]?.Company_Name;
//             await sendWhatsAppMessage({
//                 tab: "price_list",
//                 phone,
//                 bodyParams:  [companyname,customerName, priceListLink],
//                 clientRefId: generateUniqueClientRefId("plist", `retailer_${row.Ret_Id}`),
//             });
//             toast.success("Price list sent via WhatsApp!");
//             return true;
//         } catch (e) {
//             toast.error(`Failed: ${e.message}`);
//             return false;
//         } finally {
//             setSendingStates((p) => ({ ...p, [id]: false }));
//         }
//     };

//     const sendSaleOrderWhatsApp = async (row) => {
//         const id = row.DocumentId;
//         setSendingStates((p) => ({ ...p, [id]: true }));
//         try {
//             let phone = phoneMap.get(Number(row.Retailer_Id)) || row.A1 || row.Customer_Phone;
//             if (!phone) { toast.error("Phone not found"); return false; }
//             phone = normalizePhone(phone);

//             const pdfUrl       = "https://order.erpsmt.in/";
//             const customerName = row.retailerNameGet || "Customer";
//             const invoiceNo    = row.DocumentNumber  || "N/A";
//             const date         = new Date(row.So_Date || row.DocumentDate || row.createdOn).toLocaleDateString("en-GB");
//             const amount       = Number(row.Total_Invoice_value || 0).toFixed(2);
//             const companyname  = companyInfo[0]?.Company_Name;

//             await sendWhatsAppMessage({
//                 tab: "sale_order",
//                 phone,
//                 bodyParams:  [companyname,customerName, invoiceNo, date, amount, pdfUrl],
//                 clientRefId: generateUniqueClientRefId("sord", invoiceNo),
//             });
//             toast.success("Sale order sent via WhatsApp!");
//             return true;
//         } catch (e) {
//             toast.error(`Failed: ${e.message}`);
//             return false;
//         } finally {
//             setSendingStates((p) => ({ ...p, [id]: false }));
//         }
//     };

//     const sendReceiptWhatsApp = async (row) => {
//         const id = row.DocumentId;
//         setSendingStates((p) => ({ ...p, [id]: true }));
//         try {
//             let phone = phoneMap.get(Number(row.Retailer_Id)) || row.A1 || row.Customer_Phone;
//             if (!phone) { toast.error("Phone not found"); return false; }
//             phone = normalizePhone(phone);

//             const customerName = row.retailerNameGet;
//             const receiptNo    = row.DocumentNumber  || "N/A";
//             const date         = new Date(row.credit_amount || row.debit_amount).toLocaleDateString("en-GB");
//             const amount       = Number(row.Total_Invoice_value || 0).toFixed(2);
//             const companyname  = companyInfo[0]?.Company_Name;
//             const paymentMode  = row.voucherTypeGet;
//             const link         = `https://erpsmt.in`;

//             await sendWhatsAppMessage({
//                 tab: "receipt_list",
//                 phone,
//                 bodyParams:  [companyname,customerName, receiptNo, date, amount, paymentMode],
//                 clientRefId: generateUniqueClientRefId("receipt", receiptNo),
//             });
//             toast.success("Receipt sent via WhatsApp!");
//             return true;
//         } catch (e) {
//             toast.error(`Failed: ${e.message}`);
//             return false;
//         } finally {
//             setSendingStates((p) => ({ ...p, [id]: false }));
//         }
//     };


//     const ActionCell = ({ row, tab = "sale_invoice" }) => {
//         const hasPhone = !!(phoneMap.get(Number(row.Retailer_Id)) || row?.A1 || row?.Customer_Phone);
//         const busy = !!sendingStates[row.DocumentId];
//         const { serviceName = "Dotpe", langName = "english" } = tabMethodSettings[tab] || {};

//         const handleSend = async () => {
//             if (tab === "sale_order")    await sendSaleOrderWhatsApp(row);
//             else if (tab === "price_list")  await sendPriceListWhatsApp(row);
//             else if (tab === "receipt_list") await sendReceiptWhatsApp(row);
//             else await sendSaleInvoiceWhatsApp(row);
//         };

//         const tooltipText = hasPhone
//             ? `Send via WhatsApp (${serviceName} · ${langName})`
//             : "No phone number available";

//         return (
//             <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
//                 <Tooltip title={tooltipText}>
//                     <span>
//                         <IconButton
//                             size="small"
//                             onClick={handleSend}
//                             disabled={!hasPhone || busy}
//                             color={hasPhone ? "success" : "default"}
//                         >
//                             {busy ? <CircularProgress size={20} /> : <WhatsAppIcon fontSize="small" />}
//                         </IconButton>
//                     </span>
//                 </Tooltip>
//                 {hasPhone && (
//                     <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
//                         <Chip label={serviceName} size="small" sx={{ height: 14, fontSize: 9, opacity: 0.7 }} />
//                         <Chip label={langName}    size="small" sx={{ height: 14, fontSize: 9, opacity: 0.6 }} color="info" variant="outlined" />
//                     </Box>
//                 )}
//             </Box>
//         );
//     };

  
//     const filterColumns = useMemo(
//         () => [
//             { Field_Name: "DocumentNumber", Fied_Data: "string", ColumnHeader: "Document No" },
//             { Field_Name: "voucherTypeGet",  Fied_Data: "string", ColumnHeader: "Type" },
//             { Field_Name: "retailerNameGet", Fied_Data: "string", ColumnHeader: "Customer" },
//             ...costTypes
//                 .filter((ct) => uniqueInvolvedCost.includes(toNumber(ct.Cost_Category_Id)))
//                 .map((ct) => ({
//                     Field_Name:  `costType_${ct.Cost_Category_Id}`,
//                     Fied_Data:   "string",
//                     ColumnHeader: ct.Cost_Category,
//                     isVisible: 1,
//                     isCustomCell: true,
//                     getFilterValues: (row) => getCostTypeEmployees(row, ct.Cost_Category_Id),
//                     Cell: ({ row }) => <span>{getCostTypeEmployees(row, ct.Cost_Category_Id).join(", ") || "-"}</span>,
//                 })),
//         ],
//         [costTypes, uniqueInvolvedCost]
//     );

//     const selectCell = (row) => {
//         const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(toNumber(row.DocumentId));
//         const toggle = () => {
//             const fn = (prev) => isSelected
//                 ? { ...prev, Do_Id: prev.Do_Id.filter((x) => !isEqualNumber(x, row.DocumentId)) }
//                 : { ...prev, Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)] };
//             setMultipleCostCenterUpdateValues(fn);
//             setMultipleStaffRemoveValues(fn);
//         };
//         return <Checkbox onFocus={(e) => e.target.blur()} checked={isSelected} onChange={toggle} />;
//     };

  
//     const baseColumns = [
//         { Field_Name: "Select", isVisible: 1, isCustomCell: true, Cell: ({ row }) => selectCell(row) },
//         { Field_Name: "DocumentNumber", Fied_Data: "string", ColumnHeader: "Document No", isVisible: 1 },
//         { Field_Name: "DocumentType",   Fied_Data: "string", ColumnHeader: "Type",        isVisible: 1 },
//         { Field_Name: "Created", isVisible: 1, isCustomCell: true, Cell: ({ row }) => row?.createdOn ? LocalDateWithTime(row.createdOn) : "" },
//         createCol("voucherTypeGet",  "string", "Voucher"),
//         createCol("retailerNameGet", "string", "Customer"),
//         {
//             Field_Name: "PhoneNumber", ColumnHeader: "Phone", isVisible: 1, isCustomCell: true,
//             Cell: ({ row }) => <span>{row.A1_Phone || phoneMap.get(Number(row.Retailer_Id)) || row.A1 || "Not Available"}</span>,
//         },
//         {
//             Field_Name: "BillQty", isVisible: 1, isCustomCell: true,
//             Cell: ({ row }) => toArray(row.stockDetails).reduce((s, i) => s + (Number(i.Bill_Qty) || 0), 0),
//         },
//         {
//             Field_Name: "AltActQty", ColumnHeader: "Alt Act Qty", isVisible: 1, isCustomCell: true,
//             Cell: ({ row }) => RoundNumber(toArray(row.stockDetails).reduce((s, i) => s + toNumber(i.Alt_Act_Qty), 0)),
//         },
//         createCol("Narration", "string", "Narration"),
//         {
//             Field_Name: "Status", isVisible: 1, isCustomCell: true,
//             Cell: ({ row }) => row.Delivery_Status || row.Conversion_Status || row.Status || "-",
//         },
//     ];

//     const saleInvoiceColumns = [...baseColumns, { Field_Name: "Action", isVisible: 1, isCustomCell: true, Cell: (p) => <ActionCell {...p} tab="sale_invoice" /> }];
//     const saleOrderColumns   = [...baseColumns, { Field_Name: "Action", isVisible: 1, isCustomCell: true, Cell: (p) => <ActionCell {...p} tab="sale_order" /> }];

//     const priceListColumns = [
//         { Field_Name: "Select",         isVisible: 1, isCustomCell: true, Cell: ({ row }) => selectCell(row) },
//         { Field_Name: "Retailer_Name",  Fied_Data: "string", ColumnHeader: "Customer Name", isVisible: 1 },
//         { Field_Name: "Ret_Code",       Fied_Data: "string", ColumnHeader: "Customer Code", isVisible: 1 },
//         { Field_Name: "PhoneNumber",    ColumnHeader: "Phone", isVisible: 1, isCustomCell: true, Cell: ({ row }) => <span>{row.A1 || "Not Available"}</span> },
//         { Field_Name: "City",           Fied_Data: "string", ColumnHeader: "City",     isVisible: 1 },
//         { Field_Name: "Location",       Fied_Data: "string", ColumnHeader: "Location", isVisible: 1 },
//         { Field_Name: "Action",         isVisible: 1, isCustomCell: true, Cell: (p) => <ActionCell {...p} tab="price_list" /> },
//     ];

//     const receiptColumns = [
//         { Field_Name: "Select",              isVisible: 1, isCustomCell: true, Cell: ({ row }) => selectCell(row) },
//         { Field_Name: "receipt_invoice_no",  Fied_Data: "string", ColumnHeader: "Receipt No",   isVisible: 1 },
//         { Field_Name: "receipt_date",        Fied_Data: "date",   ColumnHeader: "Receipt Date", isVisible: 1 },
//         { Field_Name: "DebitAccountGet",     Fied_Data: "string", ColumnHeader: "Debit Acct",   isVisible: 1 },
//         { Field_Name: "CreditAccountGet",    Fied_Data: "string", ColumnHeader: "Credit Acct",  isVisible: 1 },
//         { Field_Name: "PhoneNumber",         ColumnHeader: "Phone", isVisible: 1, isCustomCell: true, Cell: ({ row }) => <span>{row.A1_Phone || "Not Available"}</span> },
//         { 
//     Field_Name: "Total_Invoice_value", 
//     Fied_Data: "number", 
//     ColumnHeader: "Amount", 
//     isVisible: 1, 
//     isCustomCell: true,
//     Cell: ({ row }) => `₹${NumberFormat(row.debit_amount || row.credit_amount || 0)}` 
// },
//         { Field_Name: "transaction_type",        Fied_Data: "string", ColumnHeader: "Payment Mode", isVisible: 1 },
//         { Field_Name: "bank_name",           Fied_Data: "string", ColumnHeader: "Bank",         isVisible: 1 },
//         { Field_Name: "check_no",           Fied_Data: "string", ColumnHeader: "Cheque/Ref",   isVisible: 1 },
//         { Field_Name: "Status",              Fied_Data: "string", ColumnHeader: "Status",        isVisible: 1 },
//         createCol("Narration", "string", "Narration"),
//         { Field_Name: "Action", isVisible: 1, isCustomCell: true, Cell: (p) => <ActionCell {...p} tab="receipt_list" /> },
//     ];

  
//     const applyFilters = useCallback(() => {
//         let src;
//         if (activeTab === "price_list")        src = priceListRetailers;
//         else if (activeTab === "receipt_list") src = allReceipts;
//         else                                   src = salesInvoices;

//         let filtered = [...src];
//         for (const col of filterColumns) {
//             const fv = columnFilters[col.Field_Name];
//             if (!fv) continue;
//             if (fv.type === "range") {
//                 const { min, max } = fv;
//                 filtered = filtered.filter((item) => {
//                     const v = item[col.Field_Name];
//                     return (min === undefined || v >= min) && (max === undefined || v <= max);
//                 });
//             } else if (fv.type === "date") {
//                 const { start, end } = fv.value || {};
//                 filtered = filtered.filter((item) => {
//                     const d = new Date(item[col.Field_Name]);
//                     return (!start || d >= new Date(start)) && (!end || d <= new Date(end));
//                 });
//             } else if (Array.isArray(fv)) {
//                 const sel = fv.map(normalize).filter(Boolean);
//                 if (!sel.length) continue;
//                 if (typeof col.getFilterValues === "function") {
//                     filtered = filtered.filter((item) =>
//                         sel.some((v) => (col.getFilterValues(item) || []).map(normalize).includes(v))
//                     );
//                 } else {
//                     filtered = filtered.filter((item) => sel.includes(normalize(item[col.Field_Name])));
//                 }
//             }
//         }

//         if (activeTab === "price_list") setFilteredPriceListRetailers(filtered);
//         else setFilteredData(filtered);
//     }, [columnFilters, salesInvoices, priceListRetailers, allReceipts, filterColumns, activeTab]);

//     useEffect(() => { applyFilters(); }, [applyFilters]);

//     useEffect(() => {
//         const ids = selectAllCheckBox
//             ? (activeTab === "price_list" ? filteredPriceListRetailers : filteredData).map((i) => toNumber(i.DocumentId))
//             : [];
//         setMultipleCostCenterUpdateValues((p) => ({ ...p, Do_Id: ids }));
//         setMultipleStaffRemoveValues((p) => ({ ...p, Do_Id: ids }));
//     }, [selectAllCheckBox, filteredData, filteredPriceListRetailers, activeTab]);

//     const handleTabChange = (newVal) => {
//         setActiveTab(newVal);
//         setSelectAllCheckBox(false);
//         setMultipleCostCenterUpdateValues(STAFF_INIT);
//         setMultipleStaffRemoveValues(STAFF_INIT);
//         setColumnFilters({});
//         if (newVal === "price_list") {
//             priceListRetailers.length === 0 ? fetchRetailersWithLOL() : setFilteredPriceListRetailers(priceListRetailers);
//         } else if (newVal === "sale_invoice") { setSalesInvoices(allSalesInvoices); setFilteredData(allSalesInvoices); }
//         else if (newVal === "sale_order")   { setSalesInvoices(allSalesOrders);    setFilteredData(allSalesOrders); }
//         else if (newVal === "receipt_list") { allReceipts.length === 0 ? fetchReceipts() : setFilteredData(allReceipts); }
//     };

  
//     const convertToISTShort = (iso) => {
//         if (!iso) return "";
//         const d   = new Date(iso);
//         const ist = new Date(d.getTime() + 5.5 * 3600000);
//         return `${String(ist.getUTCHours()).padStart(2, "0")}:${String(ist.getUTCMinutes()).padStart(2, "0")}`;
//     };

//     const downloadSelectedAsExcel = () => {
//         const ids = multipleCostCenterUpdateValues.Do_Id;
//         if (!ids.length) { toast.warning("Select at least one item"); return; }
//         setDownloadLoading(true);
//         setDownloadAnchorEl(null);
//         try {
//             const rows = salesInvoices
//                 .filter((inv) => ids.includes(toNumber(inv.DocumentId)))
//                 .map((inv, i) => ({
//                     "S.No":       i + 1,
//                     "Document No":inv.DocumentNumber || "",
//                     Type:         inv.DocumentType   || "",
//                     Created:      convertToISTShort(inv.createdOn),
//                     Customer:     inv.retailerNameGet || "",
//                     Phone:        inv.A1_Phone || "Not Available",
//                     "Bill Qty":   toArray(inv.stockDetails).reduce((s, x) => s + (Number(x.Bill_Qty)    || 0), 0),
//                     "Alt Act Qty":toArray(inv.stockDetails).reduce((s, x) => s + (Number(x.Alt_Act_Qty) || 0), 0),
//                     Amount:       inv.Total_Invoice_value || 0,
//                     Status:       inv.Delivery_Status || inv.Conversion_Status || "",
//                 }));
//             const wb = XLSX.utils.book_new();
//             const ws = XLSX.utils.json_to_sheet(rows);
//             XLSX.utils.book_append_sheet(wb, ws, "Data");
//             XLSX.writeFile(wb, `Data_${viewMode}_${new Date().toISOString().split("T")[0]}.xlsx`);
//             toast.success(`Downloaded ${ids.length} items as Excel`);
//         } catch (e) {
//             toast.error(`Excel download failed: ${e.message}`);
//         } finally {
//             setDownloadLoading(false);
//         }
//     };

//     const downloadSelectedAsPDF = () => {
//         const ids = multipleCostCenterUpdateValues.Do_Id;
//         if (!ids.length) { toast.warning("Select at least one item"); return; }
//         setDownloadLoading(true);
//         setDownloadAnchorEl(null);
//         try {
//             const doc      = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
//             const selected = salesInvoices.filter((inv) => ids.includes(toNumber(inv.DocumentId)));
//             const tableData = selected.map((inv, i) => [
//                 i + 1, inv.DocumentNumber || "N/A", inv.DocumentType || "",
//                 (inv.DocumentDate || "").split("T")[0], inv.voucherTypeGet || "",
//                 inv.retailerNameGet || "", `₹${NumberFormat(inv.Total_Invoice_value || 0)}`,
//                 toArray(inv.stockDetails).reduce((s, x) => s + (Number(x.Bill_Qty)    || 0), 0),
//                 toArray(inv.stockDetails).reduce((s, x) => s + (Number(x.Alt_Act_Qty) || 0), 0),
//                 inv.Delivery_Status || inv.Conversion_Status || "",
//                 inv.A1_Phone || "No Phone",
//             ]);
//             doc.setFontSize(14);
//             doc.text(`Report — ${viewMode === "pending" ? "Pending" : "All"}`, 14, 14);
//             doc.setFontSize(8);
//             doc.text(`Generated: ${new Date().toLocaleString()}`, 280, 10, { align: "right" });
//             doc.autoTable({
//                 startY: 22,
//                 head: [["#", "Doc No", "Type", "Date", "Voucher", "Customer", "Amount", "Bill Qty", "Alt Qty", "Status", "Phone"]],
//                 body: tableData,
//                 theme: "grid",
//                 styles: { fontSize: 7, cellPadding: 1.5 },
//                 headStyles: { fillColor: [66, 66, 66], textColor: 255, fontStyle: "bold" },
//                 margin: { left: 8, right: 8 },
//             });
//             doc.save(`Report_${viewMode}_${new Date().toISOString().split("T")[0]}.pdf`);
//             toast.success(`Downloaded ${ids.length} items as PDF`);
//         } catch (e) {
//             toast.error(`PDF download failed: ${e.message}`);
//         } finally {
//             setDownloadLoading(false);
//         }
//     };

//     const handleMultiPrint = useReactToPrint({
//         content: () => multiPrintRef.current,
//         documentTitle: "Multiple Documents",
//         pageStyle: `@page { margin: 0.6cm; size: auto; }`,
//     });

//     const refreshData = () => {
//         if (activeTab === "price_list")        fetchRetailersWithLOL();
//         else if (activeTab === "receipt_list") fetchReceipts();
//         else if (viewMode === "pending")       fetchPendingInvoices();
//         else fetchAllInvoices(true);
//     };

   
//     const renderFilter = (col) => {
//         const { Field_Name, Fied_Data, ColumnHeader } = col;
//         if (Fied_Data === "number") return (
//             <Box sx={{ display: "flex", gap: 1 }}>
//                 <TextField size="small" type="number" label="Min" value={columnFilters[Field_Name]?.min ?? ""}
//                     onChange={(e) => setColumnFilters((p) => ({ ...p, [Field_Name]: { type: "range", ...p[Field_Name], min: e.target.value ? parseFloat(e.target.value) : undefined } }))} />
//                 <TextField size="small" type="number" label="Max" value={columnFilters[Field_Name]?.max ?? ""}
//                     onChange={(e) => setColumnFilters((p) => ({ ...p, [Field_Name]: { type: "range", ...p[Field_Name], max: e.target.value ? parseFloat(e.target.value) : undefined } }))} />
//             </Box>
//         );
//         if (Fied_Data === "date") return (
//             <Box sx={{ display: "flex", gap: 1 }}>
//                 <TextField size="small" type="date" label="From" InputLabelProps={{ shrink: true }}
//                     value={columnFilters[Field_Name]?.value?.start ?? ""}
//                     onChange={(e) => setColumnFilters((p) => ({ ...p, [Field_Name]: { type: "date", value: { ...p[Field_Name]?.value, start: e.target.value || undefined } } }))} />
//                 <TextField size="small" type="date" label="To" InputLabelProps={{ shrink: true }}
//                     value={columnFilters[Field_Name]?.value?.end ?? ""}
//                     onChange={(e) => setColumnFilters((p) => ({ ...p, [Field_Name]: { type: "date", value: { ...p[Field_Name]?.value, end: e.target.value || undefined } } }))} />
//             </Box>
//         );
//         const src = activeTab === "price_list"   ? priceListRetailers
//             : activeTab === "receipt_list"       ? allReceipts
//             : typeof col.getFilterValues === "function"
//             ? salesInvoices.flatMap((i) => col.getFilterValues(i) || [])
//             : salesInvoices.map((i) => i[Field_Name]);
//         return (
//             <Autocomplete
//                 multiple size="small" options={uniqueCaseInsensitive(src)}
//                 disableCloseOnSelect getOptionLabel={(o) => o}
//                 value={columnFilters[Field_Name] || []}
//                 onChange={(_, v) => setColumnFilters((p) => ({ ...p, [Field_Name]: v }))}
//                 isOptionEqualToValue={(a, b) => a === b}
//                 renderOption={(props, option, { selected }) => (
//                     <li {...props}><Checkbox icon={icon} checkedIcon={checkedIcon} checked={selected} sx={{ mr: 1 }} />{option}</li>
//                 )}
//                 renderInput={(params) => <TextField {...params} label={ColumnHeader || Field_Name} />}
//             />
//         );
//     };


//     const CurrentMethodBadge = () => {
//         const { serviceName, langName } = tabMethodSettings[activeTab] || {};
//         if (!serviceName) return null;
//         return (
//             <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
//                 <Chip
//                     icon={<WhatsAppIcon sx={{ fontSize: 14 }} />}
//                     label={serviceName}
//                     size="small"
//                     color={serviceName.toLowerCase() === "askeva" ? "secondary" : "primary"}
//                     sx={{ height: 22, fontSize: 10 }}
//                 />
//                 {langName && (
//                     <Chip
//                         icon={<Language sx={{ fontSize: 13 }} />}
//                         label={langName}
//                         size="small"
//                         color="info"
//                         variant="outlined"
//                         sx={{ height: 22, fontSize: 10 }}
//                     />
//                 )}
//             </Box>
//         );
//     };

  
//     const sharedButtonArea = (
//         <>
//             <CurrentMethodBadge />

//             <Tooltip title="WhatsApp Settings for this tab">
//                 <IconButton size="small" onClick={() => setSettingsDialog(true)}>
//                     <Settings fontSize="small" />
//                 </IconButton>
//             </Tooltip>

//             <Tooltip title="Select All">
//                 <Checkbox
//                     checked={selectAllCheckBox}
//                     onChange={(e) => setSelectAllCheckBox(e.target.checked)}
//                     disabled={
//                         activeTab === "price_list"
//                             ? filteredPriceListRetailers.length === 0
//                             : filteredData.length === 0
//                     }
//                 />
//             </Tooltip>

//             <IconButton size="small" onClick={() => setFilters((p) => ({ ...p, filterDialog: true }))} disabled={isRefreshing}>
//                 <FilterAlt />
//             </IconButton>

//             <IconButton size="small" onClick={refreshData} disabled={isRefreshing}>
//                 <Search />
//             </IconButton>

//             {viewMode === "pending" && activeTab !== "price_list" && activeTab !== "receipt_list" && (
//                 <>
//                     <Button
//                         variant="contained" size="small"
//                         startIcon={<Download />} endIcon={<ArrowDropDown />}
//                         onClick={(e) => setDownloadAnchorEl(e.currentTarget)}
//                         disabled={!multipleCostCenterUpdateValues.Do_Id.length || downloadLoading}
//                         sx={{ ml: 1, textTransform: "none" }}
//                     >
//                         {downloadLoading ? "Downloading…" : "Download"}
//                     </Button>
//                     <Menu anchorEl={downloadAnchorEl} open={Boolean(downloadAnchorEl)} onClose={() => setDownloadAnchorEl(null)}>
//                         <MenuItem onClick={downloadSelectedAsExcel}>
//                             <ListItemIcon><TableChart fontSize="small" color="success" /></ListItemIcon>
//                             <ListItemText>Download as Excel</ListItemText>
//                         </MenuItem>
//                         <MenuItem onClick={downloadSelectedAsPDF}>
//                             <ListItemIcon><PictureAsPdf fontSize="small" color="error" /></ListItemIcon>
//                             <ListItemText>Download as PDF</ListItemText>
//                         </MenuItem>
//                     </Menu>
//                 </>
//             )}

//             {activeTab !== "price_list" && activeTab !== "receipt_list" && (
//                 <input
//                     type="date" className="cus-inpt w-auto"
//                     value={filters.reqDate}
//                     onChange={(e) => setFilters((p) => ({ ...p, reqDate: e.target.value }))}
//                     disabled={isRefreshing}
//                 />
//             )}

//             {activeTab !== "price_list" && activeTab !== "receipt_list" && (
//                 <IconButton
//                     size="small"
//                     disabled={!filters.docType || !multipleCostCenterUpdateValues.Do_Id.length}
//                     onClick={() => { setCurrentPrintType(filters.docType); setMultiPrint({ open: true, doIds: multipleCostCenterUpdateValues.Do_Id, docType: filters.docType }); }}
//                 >
//                     <Print />
//                 </IconButton>
//             )}
//         </>
//     );

   
//     const ReceiptFilterBar = () => (
//         <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, mb: 2 }}>
//             <Typography variant="subtitle2" gutterBottom>Receipt Filters</Typography>
//             <Stack direction="row" gap={2} flexWrap="wrap" alignItems="center">
//                 <TextField label="From Date" type="date" size="small" value={receiptFilters.Fromdate} InputLabelProps={{ shrink: true }}
//                     onChange={(e) => setReceiptFilters((p) => ({ ...p, Fromdate: e.target.value }))} />
//                 <TextField label="To Date" type="date" size="small" value={receiptFilters.Todate} InputLabelProps={{ shrink: true }}
//                     onChange={(e) => setReceiptFilters((p) => ({ ...p, Todate: e.target.value }))} />
//                 <TextField label="Voucher No" size="small" value={receiptFilters.voucher}
//                     onChange={(e) => setReceiptFilters((p) => ({ ...p, voucher: e.target.value }))} />
//                 <FormControl size="small" sx={{ minWidth: 130 }}>
//                     <InputLabel>Payment Mode</InputLabel>
//                     <MuiSelect value={receiptFilters.receipt_type} label="Payment Mode"
//                         onChange={(e) => setReceiptFilters((p) => ({ ...p, receipt_type: e.target.value }))}>
//                         <MenuItem value="">All</MenuItem>
//                         <MenuItem value="cash">Cash</MenuItem>
//                         <MenuItem value="bank">Bank</MenuItem>
//                         <MenuItem value="cheque">Cheque</MenuItem>
//                         <MenuItem value="online">Online</MenuItem>
//                     </MuiSelect>
//                 </FormControl>
//                 <Button variant="contained" size="small" startIcon={<Search />} onClick={fetchReceipts}>Search</Button>
//                 <Button variant="outlined" size="small" onClick={() => {
//                     setReceiptFilters({ Fromdate: ISOString(), Todate: ISOString(), voucher: "", debit: "", credit: "", createdBy: "", status: "", receipt_type: "" });
//                     setTimeout(fetchReceipts, 100);
//                 }}>Reset</Button>
//             </Stack>
//         </Box>
//     );

 
//     const sharedDialogs = (
//         <>
//             <Dialog open={filters.filterDialog} onClose={() => setFilters((p) => ({ ...p, filterDialog: false }))} maxWidth="sm" fullWidth>
//                 <DialogTitle>Filter Options</DialogTitle>
//                 <DialogContent>
//                     <Stack spacing={2} sx={{ pt: 1 }}>
//                         {filterColumns.map((col, i) => <Box key={i}>{renderFilter(col)}</Box>)}
//                     </Stack>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => setFilters((p) => ({ ...p, filterDialog: false }))} variant="outlined">Close</Button>
//                 </DialogActions>
//             </Dialog>

//             <WhatsappSettingsDialog
//                 open={settingsDialog}
//                 onClose={() => setSettingsDialog(false)}
//                 activeTab={activeTab}
//                 onSettingsSaved={() => fetchAllTabSettings()}
//             />

//             <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
//                 <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
//             </Snackbar>
//         </>
//     );

   
//     return (
//         <>
//             <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
//                 <Tabs value={activeTab} onChange={(_, v) => handleTabChange(v)} textColor="primary" indicatorColor="primary">
//                     <Tab label="Sale Invoice" value="sale_invoice" />
//                     <Tab label="Price List"   value="price_list" />
//                     <Tab label="Sale Order"   value="sale_order" />
//                     <Tab label="Receipt List" value="receipt_list" />
//                 </Tabs>
//             </Box>

//             {activeTab === "sale_invoice" && (
//                 <FilterableTable
//                     title={viewMode === "pending" ? "Pending Sale Invoices" : "Sale Invoices"}
//                     columns={saleInvoiceColumns} dataArray={filteredData}
//                     EnableSerialNumber ButtonArea={sharedButtonArea}
//                 />
//             )}

//             {activeTab === "price_list" && (
//                 <FilterableTable
//                     title="Price List — Retailers"
//                     columns={priceListColumns} dataArray={filteredPriceListRetailers}
//                     EnableSerialNumber ButtonArea={sharedButtonArea}
//                 />
//             )}

//             {activeTab === "sale_order" && (
//                 <FilterableTable
//                     title={viewMode === "pending" ? "Pending Sale Orders" : "Sale Orders"}
//                     columns={saleOrderColumns} dataArray={filteredData}
//                     EnableSerialNumber ButtonArea={sharedButtonArea}
//                 />
//             )}

//             {activeTab === "receipt_list" && (
//                 <>
//                     <ReceiptFilterBar />
//                     <FilterableTable
//                         title="Receipt List"
//                         columns={receiptColumns} dataArray={filteredData}
//                         EnableSerialNumber ButtonArea={sharedButtonArea}
//                     />
//                 </>
//             )}

//             {sharedDialogs}
//         </>
//     );
// };

// export default Whatsapp;