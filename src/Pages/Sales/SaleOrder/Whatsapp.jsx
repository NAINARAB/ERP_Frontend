import { useState, useEffect, useMemo, useRef } from "react";
import { checkIsNumber, isEqualNumber, ISOString, toArray, toNumber, RoundNumber, NumberFormat, LocalDateWithTime } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
import {
    Autocomplete,
    Button,
    Checkbox,
    Select as MuiSelect,
    MenuItem,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
    TextField,
    Tooltip,
    Box,
    Divider,
    Snackbar,
    Alert,
    Radio,
    RadioGroup,
    InputLabel,
    FormControl,
    FormControlLabel,
    Menu,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Tab,
    Tabs,
} from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { reactSelectFilterLogic } from "../../../Components/functions";
import {
    CheckBox,
    CheckBoxOutlineBlank,
    FilterAlt,
    PersonAdd,
    Print,
    Search,
    HourglassEmpty,
    Download,
    PictureAsPdf,
    TableChart,
    ArrowDropDown
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { DotPeWhatsAppService } from "../../../Components/dotpeWhatsappService";
import { Dot_Pe_Number } from "../../../encryptionKey";
import api from "../../../API";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const icon = <CheckBoxOutlineBlank fontSize="small" />;
const checkedIcon = <CheckBox fontSize="small" />;

const multipleStaffUpdateInitialValues = {
    CostCategory: { label: "", value: "" },
    Do_Id: [],
    involvedStaffs: [],
    staffInvolvedStatus: 0,
    deliveryStatus: 5,
};

const multipleStaffRemoveInitialValues = {
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
        const s = String(v ?? "").trim();
        if (!s) continue;
        const key = s.toLowerCase();
        if (!map.has(key)) map.set(key, s);
    }
    return Array.from(map.values());
};

const getCostTypeEmployees = (invoiceOrRow, costTypeId) => {
    const invoiceEmployee = toArray(invoiceOrRow?.involvedStaffs);
    return invoiceEmployee
        .filter((emp) => isEqualNumber(emp.Emp_Type_Id, costTypeId))
        .map((emp) => String(emp.Emp_Name ?? "").trim())
        .filter(Boolean);
};

const generateUniqueClientRefId = (prefix, invoiceNo) => {
    const cleanInvoiceNo = String(invoiceNo || 'unknown')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .slice(-8);
    
    const timestamp = Date.now().toString().slice(-8);
    const randomString = Math.random().toString(36).substring(2, 6);
    
    return `${prefix}_${cleanInvoiceNo}_${timestamp}_${randomString}`;
};

const Whatsapp = ({ loadingOn, loadingOff, AddRights, EditRights, PrintRights, pageID }) => {
    // State declarations
    const [salesInvoices, setSalesInvoices] = useState([]);
    const [allInvoices, setAllInvoices] = useState([]);
    const [allSalesInvoices, setAllSalesInvoices] = useState([]);
    const [allSalesOrders, setAllSalesOrders] = useState([]);
    const [allReceipts, setAllReceipts] = useState([]);
    const [priceListRetailers, setPriceListRetailers] = useState([]);
    const [filteredPriceListRetailers, setFilteredPriceListRetailers] = useState([]);
    const [costCenterData, setCostCenterData] = useState([]);
    const [costTypes, setCostTypes] = useState([]);
    const [uniqueInvolvedCost, setUniqueInvolvedCost] = useState([]);
    const [viewMode, setViewMode] = useState('normal');
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasInitialLoading, setHasInitialLoading] = useState(false);
    const [currentPrintType, setCurrentPrintType] = useState('');
    const [selectAllCheckBox, setSelectAllCheckBox] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);
    const [phoneMap, setPhoneMap] = useState(new Map());
    const [isPhoneMapLoaded, setIsPhoneMapLoaded] = useState(false);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState('sale_invoice');
    const tableContainerRef = useRef(null);
    const [sendingStates, setSendingStates] = useState({});
    const [receiptFilters, setReceiptFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        voucher: '',
        debit: '',
        credit: '',
        createdBy: '',
        status: '',
        receipt_type: ''
    });

    const storage = JSON.parse(localStorage.getItem("user"));
    const [pdfGeneration, setPdfGeneration] = useState({
        loading: false,
        pdfUrl: null, token: null,
        fileName: null,
        error: null
    });

    const [multipleCostCenterUpdateValues, setMultipleCostCenterUpdateValues] = useState(
        multipleStaffUpdateInitialValues
    );

    const [multipleStaffRemoveValues, setMultipleStaffRemoveValues] = useState(
        multipleStaffRemoveInitialValues
    );

    const handleDownloadClick = (event) => {
        setDownloadAnchorEl(event.currentTarget);
    };

    const [printReady, setPrintReady] = useState(false);
    const [columnFilters, setColumnFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);

    const [deliverySlipPrint, setDeliverySlipPrint] = useState({
        Do_Id: null,
        Do_Date: null,
        open: false
    });

    const [whatsappDialog, setWhatsappDialog] = useState({
        open: false,
        order: null,
        loading: false,
        method: 'direct',
    });

    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

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

    const [multiPrint, setMultiPrint] = useState({
        open: false,
        doIds: [],
        docType: ""
    });

    const multiPrintRef = useRef(null);

    const pdfTemplates = useMemo(() => {
        return (templates || []).filter(t => {
            const templateName = t.templateName || t.name || '';
            return templateName.toLowerCase().includes('pdf') ||
                templateName.toLowerCase().includes('invoice');
        });
    }, [templates]);

    const otherTemplates = useMemo(() => {
        return (templates || []).filter(t => {
            const templateName = t.templateName || t.name || '';
            return !(templateName.toLowerCase().includes('pdf') ||
                templateName.toLowerCase().includes('invoice'));
        });
    }, [templates]);

    const columns = useMemo(
        () => [
            { Field_Name: "DocumentNumber", Fied_Data: "string", ColumnHeader: "Document No" },
            { Field_Name: "voucherTypeGet", Fied_Data: "string", ColumnHeader: "Type" },
            { Field_Name: "retailerNameGet", Fied_Data: "string", ColumnHeader: "Customer" },
        ],
        []
    );

    const calculateAltActQty = (item) => {
        if (item.Alt_Act_Qty !== undefined && item.Alt_Act_Qty !== null) {
            return Number(item.Alt_Act_Qty) || 0;
        }
        const billQty = Number(item.Bill_Qty) || 0;
        const conversionFactor = Number(item.PackValue) || 1;
        const possibleAltFields = ['AltQty', 'Alt_Act_Qty', 'Alt_Qty', 'Alternate_Qty', 'Actual_Qty'];
        for (const field of possibleAltFields) {
            if (item[field] !== undefined && item[field] !== null) {
                return Number(item[field]) || 0;
            }
        }
        return billQty * conversionFactor;
    };

    const fetchPhoneMap = async () => {
        try {
            const response = await fetchLink({ address: `masters/getlolDetails` });
            if (response && response.success && response.data) {
                const map = new Map();
                response.data.forEach(item => {
                    if (item.A1) map.set(Number(item.Ret_Id), item.A1);
                });
                setPhoneMap(map);
                setIsPhoneMapLoaded(true);
                return map;
            }
            return new Map();
        } catch (error) {
            console.error("Error fetching phone numbers:", error);
            setIsPhoneMapLoaded(true);
            return new Map();
        }
    };

    const fetchReceipts = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams({
                Fromdate: receiptFilters.Fromdate,
                Todate: receiptFilters.Todate,
                voucher: receiptFilters.voucher,
                debit: receiptFilters.debit,
                credit: receiptFilters.credit,
                createdBy: receiptFilters.createdBy,
                status: receiptFilters.status,
                receipt_type: receiptFilters.receipt_type
            });
            
            const response = await fetchLink({
                address: `receipt/receiptMasterwithLol?${params.toString()}`,
                loadingOn,
                loadingOff,
            });
            
            if (response && response.success && response.data) {
                const processedReceipts = toArray(response.data).map(receipt => ({
                    ...receipt,
                    DocumentType: 'Receipt',
                    DocumentId: receipt.Receipt_Id || receipt.Id,
                    DocumentNumber: receipt.Receipt_No || receipt.Voucher_No,
                    DocumentDate: receipt.Receipt_Date || receipt.Created_Date,
                    voucherTypeGet: 'Receipt',
                    retailerNameGet: receipt.Customer_Name || receipt.Retailer_Name,
                    Retailer_Id: receipt.Retailer_Id,
                    Total_Invoice_value: receipt.Amount || receipt.Receipt_Amount || 0,
                    createdOn: receipt.Created_Date || receipt.Receipt_Date,
                    Narration: receipt.Narration || receipt.Remarks,
                    Status: receipt.Status || 'Completed',
                    Payment_Mode: receipt.Payment_Mode || receipt.Payment_Type,
                    Bank_Name: receipt.Bank_Name,
                    Cheque_No: receipt.Cheque_No,
                    A1_Phone: phoneMap.get(Number(receipt.Retailer_Id)) || receipt.Phone_No || 'Not Available',
                    stockDetails: receipt.stockDetails || [],
                    involvedStaffs: receipt.involvedStaffs || [],
                    staffInvolvedStatus: receipt.staffInvolvedStatus || 0
                }));
                setAllReceipts(processedReceipts);
                if (activeTab === 'receipt_list') {
                    setFilteredData(processedReceipts);
                }
            } else {
                setAllReceipts([]);
                if (activeTab === 'receipt_list') {
                    setFilteredData([]);
                }
                toast.info("No receipts found for the selected criteria");
            }
        } catch (error) {
            console.error("Error fetching receipts:", error);
            toast.error("Failed to load receipts data");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRetailersWithLOL = async () => {
        try {
            setIsLoading(true);
            const response = await fetchLink({
                address: "masters/retailerswithlol",
                loadingOn,
                loadingOff,
            });
            
            if (response && response.success && response.data) {
                const processedRetailers = toArray(response.data).map(retailer => ({
                    ...retailer,
                    DocumentType: 'PriceList',
                    DocumentId: retailer.Ret_Id,
                    DocumentNumber: `PL_${retailer.Ret_Id}`,
                    retailerNameGet: retailer.Retailer_Name,
                    A1_Phone: phoneMap.get(Number(retailer.Ret_Id)) || retailer.A1 || 'Not Available',
                    Retailer_Id: retailer.Ret_Id,
                    Customer_Phone: retailer.A1 || 'Not Available'
                }));
                setPriceListRetailers(processedRetailers);
                setFilteredPriceListRetailers(processedRetailers);
            } else {
                toast.error("Failed to load price list data");
            }
        } catch (error) {
            console.error("Error fetching retailers with LOL:", error);
            toast.error("Failed to load price list data");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAllInvoices = async (refresh = false) => {
        try {
            if (!refresh) setIsLoading(true);
            else setIsRefreshing(true);
            setViewMode('normal');
            
            const [salesInvoiceResponse, salesOrderResponse] = await Promise.all([
                fetchLink({
                    address: `sales/salesInvoice/lrReportWhatsapp?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`,
                    loadingOn,
                    loadingOff,
                }),
                fetchLink({
                    address: `sales/salesOrder/lrReportWhatsapp?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`,
                    loadingOn,
                    loadingOff,
                })
            ]);
            
            const salesInvoicesData = toArray(salesInvoiceResponse?.data || []);
            const processedSalesInvoices = salesInvoicesData.map(invoice => ({
                ...invoice,
                DocumentType: 'SalesInvoice',
                DocumentId: invoice.Do_Id,
                DocumentNumber: invoice.Do_Inv_No,
                DocumentDate: invoice.Do_Date,
                A1_Phone: phoneMap.get(Number(invoice.Retailer_Id)) || invoice.A1 || 'Not Available',
                ...(invoice.stockDetails && Array.isArray(invoice.stockDetails) ? {
                    stockDetails: invoice.stockDetails.map(item => ({
                        ...item,
                        Alt_Act_Qty: calculateAltActQty(item)
                    }))
                } : {})
            }));
            
            const salesOrdersData = toArray(salesOrderResponse?.data || []);
            const processedSalesOrders = salesOrdersData.map(order => ({
                ...order,
                DocumentType: 'SalesOrder',
                DocumentId: order.So_Id || order.Id,
                DocumentNumber: order.So_Inv_No || order.Invoice_No,
                DocumentDate: order.So_Date || order.Invoice_Date,
                voucherTypeGet: order.voucherTypeGet || 'Sales Order',
                retailerNameGet: order.retailerNameGet,
                Retailer_Id: order.Retailer_Id,
                Total_Invoice_value: order.Total_Invoice_value,
                createdOn: order.createdOn,
                Narration: order.Narration,
                Delivery_Status: order.Conversion_Status || 'Not Converted',
                stockDetails: order.stockDetails || [],
                involvedStaffs: order.involvedStaffs || [],
                staffInvolvedStatus: order.staffInvolvedStatus || 0,
                Conversion_Status: order.Conversion_Status,
                Invoice_Type: order.Invoice_Type,
                A1_Phone: phoneMap.get(Number(order.Retailer_Id)) || order.A1 || 'Not Available'
            }));
            
            setAllSalesInvoices(processedSalesInvoices);
            setAllSalesOrders(processedSalesOrders);
            
            const allCombined = [...processedSalesInvoices, ...processedSalesOrders];
            setAllInvoices(allCombined);
            
            setCostTypes(toArray(salesInvoiceResponse?.others?.costTypes || salesOrderResponse?.others?.costTypes));
            setUniqueInvolvedCost(toArray(salesInvoiceResponse?.others?.uniqeInvolvedStaffs || salesOrderResponse?.others?.uniqeInvolvedStaffs));
            
            if (activeTab === 'sale_invoice') {
                setSalesInvoices(processedSalesInvoices);
                setFilteredData(processedSalesInvoices);
            } else if (activeTab === 'sale_order') {
                setSalesInvoices(processedSalesOrders);
                setFilteredData(processedSalesOrders);
            } else if (activeTab !== 'receipt_list') {
                setSalesInvoices(processedSalesInvoices);
                setFilteredData(processedSalesInvoices);
            }
            
            if (!hasInitialLoading) setHasInitialLoading(true);
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load data");
        } finally {
            if (!refresh) setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchPendingInvoices = async () => {
        try {
            setIsLoading(true);
            setViewMode('pending');
            
            const [salesInvoiceResponse, salesOrderResponse] = await Promise.all([
                fetchLink({
                    address: `sales/salesInvoice/pendingDetails?reqDate=${filters.reqDate}`,
                    loadingOn,
                    loadingOff,
                }),
                fetchLink({
                    address: `sales/salesOrder/pendingDetails?reqDate=${filters.reqDate}`,
                    loadingOn,
                    loadingOff,
                })
            ]);
            
            const salesInvoicesData = toArray(salesInvoiceResponse?.data || []);
            const processedSalesInvoices = salesInvoicesData.map(invoice => ({
                ...invoice,
                DocumentType: 'SalesInvoice',
                DocumentId: invoice.Do_Id,
                DocumentNumber: invoice.Do_Inv_No,
                DocumentDate: invoice.Do_Date,
                A1_Phone: phoneMap.get(Number(invoice.Retailer_Id)) || invoice.A1 || 'Not Available',
                ...(invoice.stockDetails && Array.isArray(invoice.stockDetails) ? {
                    stockDetails: invoice.stockDetails.map(item => ({
                        ...item,
                        Alt_Act_Qty: calculateAltActQty(item)
                    }))
                } : {})
            }));
            
            const salesOrdersData = toArray(salesOrderResponse?.data || []);
            const processedSalesOrders = salesOrdersData.map(order => ({
                ...order,
                DocumentType: 'SalesOrder',
                DocumentId: order.So_Id || order.Id,
                DocumentNumber: order.So_Inv_No || order.Invoice_No,
                DocumentDate: order.So_Date || order.Invoice_Date,
                voucherTypeGet: order.voucherTypeGet || 'Sales Order',
                retailerNameGet: order.retailerNameGet,
                Retailer_Id: order.Retailer_Id,
                Total_Invoice_value: order.Total_Invoice_value,
                createdOn: order.createdOn,
                Narration: order.Narration,
                Delivery_Status: order.Conversion_Status || 'Pending',
                stockDetails: order.stockDetails || [],
                involvedStaffs: order.involvedStaffs || [],
                staffInvolvedStatus: order.staffInvolvedStatus || 0,
                Conversion_Status: order.Conversion_Status,
                Invoice_Type: order.Invoice_Type,
                A1_Phone: phoneMap.get(Number(order.Retailer_Id)) || order.A1 || 'Not Available'
            }));
            
            setAllSalesInvoices(processedSalesInvoices);
            setAllSalesOrders(processedSalesOrders);
            
            if (activeTab === 'sale_invoice') {
                setSalesInvoices(processedSalesInvoices);
                setFilteredData(processedSalesInvoices);
            } else if (activeTab === 'sale_order') {
                setSalesInvoices(processedSalesOrders);
                setFilteredData(processedSalesOrders);
            } else if (activeTab !== 'receipt_list') {
                setSalesInvoices(processedSalesInvoices);
                setFilteredData(processedSalesInvoices);
            }
            
            if (salesInvoiceResponse?.others?.costTypes) {
                setCostTypes(toArray(salesInvoiceResponse?.others?.costTypes));
            }
            if (salesInvoiceResponse?.others?.uniqeInvolvedStaffs) {
                setUniqueInvolvedCost(toArray(salesInvoiceResponse?.others?.uniqeInvolvedStaffs));
            }
        } catch (error) {
            console.error("Error fetching pending data:", error);
            toast.error("Failed to load pending data");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await DotPeWhatsAppService.fetchTemplates('APPROVED');
            if (response.status && response.data) {
                let templatesData = [];
                if (Array.isArray(response.data)) templatesData = response.data;
                else if (response.data.data && Array.isArray(response.data.data)) templatesData = response.data.data;
                else if (response.data.templates && Array.isArray(response.data.templates)) templatesData = response.data.templates;
                if (templatesData.length > 0) {
                    setTemplates(templatesData);
                    templatesData.forEach(template => {
                        const name = template.templateName || template.name || '';
                        if (name.includes('sales_invoice_order')) setSelectedTemplate(name);
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    const fetchCostCenterData = async () => {
        try {
            const costCenterData = await fetchLink({ address: "masters/erpCostCenter/dropDown" });
            setCostCenterData(toArray(costCenterData.data));
        } catch (error) {
            console.error("Error fetching cost center data:", error);
            toast.error("Failed to load cost center data");
        }
    };

    useEffect(() => {
        const initializeData = async () => {
            try {
                setIsLoading(true);
                await fetchPhoneMap();
                await fetchAllInvoices();
                await fetchCostCenterData();
                setInitialDataLoaded(true);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast.error("Failed to load initial data");
            } finally {
                setIsLoading(false);
            }
        };
        initializeData();
        fetchTemplates();
    }, []);

    useEffect(() => {
        if (isPhoneMapLoaded && (allSalesInvoices.length > 0 || allSalesOrders.length > 0) && !initialDataLoaded) {
            const processedSalesInvoices = allSalesInvoices.map(invoice => ({
                ...invoice,
                A1_Phone: phoneMap.get(Number(invoice.Retailer_Id)) || invoice.A1 || 'Not Available',
                ...(invoice.stockDetails && Array.isArray(invoice.stockDetails) ? {
                    stockDetails: invoice.stockDetails.map(item => ({
                        ...item,
                        Alt_Act_Qty: calculateAltActQty(item)
                    }))
                } : {})
            }));
            
            const processedSalesOrders = allSalesOrders.map(order => ({
                ...order,
                A1_Phone: phoneMap.get(Number(order.Retailer_Id)) || order.A1 || 'Not Available',
                ...(order.stockDetails && Array.isArray(order.stockDetails) ? {
                    stockDetails: order.stockDetails.map(item => ({
                        ...item,
                        Alt_Act_Qty: calculateAltActQty(item)
                    }))
                } : {})
            }));
            
            setAllSalesInvoices(processedSalesInvoices);
            setAllSalesOrders(processedSalesOrders);
    
            if (activeTab === 'sale_invoice') {
                setSalesInvoices(processedSalesInvoices);
                setFilteredData(processedSalesInvoices);
            } else if (activeTab === 'sale_order') {
                setSalesInvoices(processedSalesOrders);
                setFilteredData(processedSalesOrders);
            }
        }
    }, [isPhoneMapLoaded, allSalesInvoices, allSalesOrders, initialDataLoaded, activeTab]);

    useEffect(() => {
        if (isPhoneMapLoaded && priceListRetailers.length > 0) {
            const updatedRetailers = priceListRetailers.map(retailer => ({
                ...retailer,
                A1_Phone: phoneMap.get(Number(retailer.Ret_Id)) || retailer.A1 || 'Not Available'
            }));
            setPriceListRetailers(updatedRetailers);
            setFilteredPriceListRetailers(updatedRetailers);
        }
    }, [isPhoneMapLoaded]);

    useEffect(() => {
        if (initialDataLoaded) {
            if (viewMode === 'normal') fetchAllInvoices(true);
            else if (viewMode === 'pending') fetchPendingInvoices();
        }
    }, [filters.fetchTrigger, filters.staffStatus, filters.reqDate, viewMode, initialDataLoaded]);

    useEffect(() => {
        if (multiPrint.open) {
            const timer = setTimeout(() => {
                if (multiPrintRef.current) setPrintReady(true);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setPrintReady(false);
        }
    }, [multiPrint.open, multiPrint.doIds, multiPrint.docType]);

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const closeWhatsAppDialog = () => {
        setWhatsappDialog({ open: false, order: null, loading: false, method: 'direct' });
        setSelectedTemplate("");
    };

    const getPDFUrlSimple = (order) => {
        const baseUrl = api;
        const formattedInvoiceNo = order.DocumentNumber ? order.DocumentNumber.replace(/_/g, '/') : '';
        const encodedInvoiceNo = btoa(formattedInvoiceNo);
        const companyid = btoa(storage?.Company_id);
        return `https://printapp.erpsmt.in/sales/downloadPdf?Do_Inv_No=${encodedInvoiceNo}&Company_id=${companyid}`;
    };

    const generateInvoicePDF = async (order, companyId) => {
        try {
            const requestBody = {
                invoiceId: order.DocumentNumber,
                companyId: companyId,
                invoiceData: {
                    Do_Inv_No: order.DocumentNumber,
                    Total_Invoice_value: order.Total_Invoice_value || 0,
                    retailerNameGet: order.retailerNameGet || order.Retailer_Name || 'Customer',
                    Do_Date: order.Do_Date || order.DocumentDate,
                    So_No: order.So_No || order.Do_No || 'N/A',
                    Retailer_Name: order.Retailer_Name || order.retailerNameGet,
                    Retailer_Address: order.Retailer_Address || 'Address not available',
                    Retailer_GSTIN: order.Retailer_GSTIN || 'Not Available',
                    CSGT_Total: order.CSGT_Total || 0,
                    SGST_Total: order.SGST_Total || 0,
                    IGST_Total: order.IGST_Total || 0,
                    Round_off: order.Round_off || 0,
                    CSGT_Percentage: order.CSGT_Percentage || 0,
                    SGST_Percentage: order.SGST_Percentage || 0,
                    IGST_Percentage: order.IGST_Percentage || 0,
                    stockDetails: order.stockDetails || order.ProductList || []
                }
            };
            const response = await fetchLink({
                address: "sales/generatePdf",
                method: "POST",
                bodyData: requestBody,
                loadingOn,
                loadingOff,
            });
            return response;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    };

    const generateAndStorePDF = async (order) => {
        try {
            setPdfGeneration({ loading: true, pdfUrl: null, error: null });
            const storage = JSON.parse(localStorage.getItem("user"));
            const companyId = storage?.Company_id;
            if (!companyId) throw new Error('Company ID not found');
            const response = await generateInvoicePDF(order, companyId);
            if (response.success && response.data) {
                const pdfUrl = response.data.pdfUrl;
                setPdfGeneration({
                    loading: false,
                    pdfUrl: pdfUrl,
                    token: response.data.token,
                    fileName: response.data.fileName,
                    error: null
                });
                return { pdfUrl: pdfUrl, token: response.data.token, fileName: response.data.fileName };
            } else {
                throw new Error(response.message || 'Failed to generate PDF');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            setPdfGeneration({ loading: false, pdfUrl: null, error: error.message });
            throw error;
        }
    };

    const sendSaleInvoiceWhatsApp = async (row) => {
        const invoiceId = row.DocumentId;
        setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
        
        try {
            const retailerId = Number(row?.Retailer_Id);
            let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
            
            if (!recipientPhone) {
                toast.error('Customer phone number not found');
                return false;
            }

            recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
            if (recipientPhone.startsWith('0')) {
                recipientPhone = recipientPhone.substring(1);
            }
            if (!recipientPhone.startsWith('91')) {
                recipientPhone = `91${recipientPhone}`;
            }

            const pdfUrl = getPDFUrlSimple(row);
            const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
            const invoiceNo = row.DocumentNumber || 'N/A';
            const formattedDate = new Date(row.Do_Date || row.DocumentDate || row.createdOn).toLocaleDateString('en-GB');
            const totalAmount = Number(row.Total_Invoice_value || 0).toFixed(2);
            const companyName = storage?.Company_id == 1 ? "SM TRADERS" : "MOBITE";
            
            const uniqueClientRefId = generateUniqueClientRefId('inv', invoiceNo);
            
            const payload = {
                template: {
                    name: "sales_invoice_order",
                    language: "en"
                },
                source: "crm",
                wabaNumber: Dot_Pe_Number,
                recipients: [recipientPhone],
                clientRefId: uniqueClientRefId,
                params: {
                    body: [
                        customerName,
                        invoiceNo,
                        formattedDate,
                        totalAmount,
                        companyName,
                        pdfUrl
                    ]
                }
            };
            
            const response = await DotPeWhatsAppService.sendTemplateMessage(payload);
            if (response?.status) {
                toast.success('Sale invoice sent successfully via WhatsApp!');
                return true;
            } else {
                throw new Error(response?.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending WhatsApp:', error);
            toast.error(`Failed to send message: ${error.message}`);
            return false;
        } finally {
            setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
        }
    };

    const sendPriceListWhatsApp = async (row) => {
        const retailerId = row.DocumentId;
        setSendingStates(prev => ({ ...prev, [retailerId]: true }));
        
        try {
            let recipientPhone = phoneMap.get(Number(row.Retailer_Id)) || row?.A1 || row?.Customer_Phone;
            
            if (!recipientPhone) {
                toast.error('Customer phone number not found');
                return false;
            }

            recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
            if (recipientPhone.startsWith('0')) {
                recipientPhone = recipientPhone.substring(1);
            }
            if (!recipientPhone.startsWith('91')) {
                recipientPhone = `91${recipientPhone}`;
            }

            const companyId = storage?.Company_id;
            const encodedCompanyId = btoa(companyId);
            const priceListLink = `https://printapp.erpsmt.in/rateMaster?Company_id=${encodedCompanyId}`;
            
            const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
            
            const uniqueClientRefId = generateUniqueClientRefId('plist', `retailer_${row.Ret_Id}`);
            
            const payload = {
                template: {
                    name: "price_list",
                    language: "en"
                },
                source: "crm",
                wabaNumber: Dot_Pe_Number,
                recipients: [recipientPhone],
                clientRefId: uniqueClientRefId,
                params: {
                    body: [
                        customerName, 
                        priceListLink  
                    ]
                }
            };
            
            const response = await DotPeWhatsAppService.sendTemplateMessage(payload);
            if (response?.status) {
                toast.success('Price list sent successfully via WhatsApp!');
                return true;
            } else {
                throw new Error(response?.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending price list:', error);
            toast.error(`Failed to send price list: ${error.message}`);
            return false;
        } finally {
            setSendingStates(prev => ({ ...prev, [retailerId]: false }));
        }
    };

    const sendSaleOrderWhatsApp = async (row) => {
        const invoiceId = row.DocumentId;
        setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
        
        try {
            const retailerId = Number(row?.Retailer_Id);
            let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
            
            if (!recipientPhone) {
                toast.error('Customer phone number not found');
                return false;
            }

            recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
            if (recipientPhone.startsWith('0')) {
                recipientPhone = recipientPhone.substring(1);
            }
            if (!recipientPhone.startsWith('91')) {
                recipientPhone = `91${recipientPhone}`;
            }

            const pdfUrl = 'https://order.erpsmt.in/';
            const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
            const invoiceNo = row.DocumentNumber || 'N/A';
            const formattedDate = new Date(row.So_Date || row.DocumentDate || row.createdOn).toLocaleDateString('en-GB');
            const totalAmount = Number(row.Total_Invoice_value || 0).toFixed(2);
            const companyName = storage?.Company_id == 1 ? "SM TRADERS" : "MOBITE";
            
            const uniqueClientRefId = generateUniqueClientRefId('sord', invoiceNo);
            
            const payload = {
                template: {
                    name: "sale_order",
                    language: "en"
                },
                source: "crm",
                wabaNumber: Dot_Pe_Number,
                recipients: [recipientPhone],
                clientRefId: uniqueClientRefId,
                params: {
                    body: [
                        customerName,
                        invoiceNo,
                        formattedDate,
                        totalAmount,
                        companyName,
                        pdfUrl
                    ]
                }
            };
            
            const response = await DotPeWhatsAppService.sendTemplateMessage(payload);
            if (response?.status) {
                toast.success('Sale order sent successfully via WhatsApp!');
                return true;
            } else {
                throw new Error(response?.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending sale order:', error);
            toast.error(`Failed to send sale order: ${error.message}`);
            return false;
        } finally {
            setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
        }
    };

    const sendReceiptWhatsApp = async (row) => {
        const receiptId = row.DocumentId;
        setSendingStates(prev => ({ ...prev, [receiptId]: true }));
        
        try {
            const retailerId = Number(row?.Retailer_Id);
            let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
            
            if (!recipientPhone) {
                toast.error('Customer phone number not found');
                return false;
            }

            recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
            if (recipientPhone.startsWith('0')) {
                recipientPhone = recipientPhone.substring(1);
            }
            if (!recipientPhone.startsWith('91')) {
                recipientPhone = `91${recipientPhone}`;
            }

            const customerName = row.retailerNameGet || row.Customer_Name || 'Customer';
            const receiptNo = row.DocumentNumber || 'N/A';
            const receiptDate = new Date(row.DocumentDate || row.Receipt_Date).toLocaleDateString('en-GB');
            const amount = Number(row.Total_Invoice_value || 0).toFixed(2);
            const companyName = storage?.Company_id == 1 ? "SM TRADERS" : "MOBITE";
            const paymentMode = row.Payment_Mode || 'Cash';
            
            const receiptLink = `https://erpsmt.in/receipts/${receiptNo}`;
            
            const uniqueClientRefId = generateUniqueClientRefId('receipt', receiptNo);
            
            const payload = {
                template: {
                    name: "payment_receipt",
                    language: "en"
                },
                source: "crm",
                wabaNumber: Dot_Pe_Number,
                recipients: [recipientPhone],
                clientRefId: uniqueClientRefId,
                params: {
                    body: [
                        customerName,
                        receiptNo,
                        receiptDate,
                        amount,
                        paymentMode,
                        companyName,
                        receiptLink
                    ]
                }
            };
            
            const response = await DotPeWhatsAppService.sendTemplateMessage(payload);
            if (response?.status) {
                toast.success('Payment receipt sent successfully via WhatsApp!');
                return true;
            } else {
                throw new Error(response?.message || 'Failed to send message');
            }
        } catch (error) {
            console.error('Error sending receipt:', error);
            toast.error(`Failed to send receipt: ${error.message}`);
            return false;
        } finally {
            setSendingStates(prev => ({ ...prev, [receiptId]: false }));
        }
    };
    
    const ActionCell = ({ row, isPriceListTab = false, isSaleOrderTab = false, isReceiptTab = false }) => {
        const hasPhone = !!(phoneMap.get(Number(row.Retailer_Id)) || row?.A1 || row?.Customer_Phone);
        const isLoading = sendingStates[row.DocumentId];
        
        let tooltipText = "Send Invoice via WhatsApp";
        if (isPriceListTab) tooltipText = "Send Price List via WhatsApp";
        if (isSaleOrderTab) tooltipText = "Send Sale Order via WhatsApp";
        if (isReceiptTab) tooltipText = "Send Receipt via WhatsApp";
        
        const handleClick = async () => {
            if (isSaleOrderTab) {
                await sendSaleOrderWhatsApp(row);
            } else if (isPriceListTab) {
                await sendPriceListWhatsApp(row);
            } else if (isReceiptTab) {
                await sendReceiptWhatsApp(row);
            } else {
                await sendSaleInvoiceWhatsApp(row);
            }
        };
        
        return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title={hasPhone ? tooltipText : "No phone number available"}>
                    <span>
                        <IconButton
                            size="small"
                            onClick={handleClick}
                            disabled={!hasPhone || isLoading}
                            color={hasPhone ? "success" : "default"}
                        >
                            {isLoading ? <CircularProgress size={20} /> : <WhatsAppIcon fontSize="small" />}
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        );
    };

    const PriceListActionCell = ({ row }) => {
        const hasPhone = !!(phoneMap.get(Number(row.Retailer_Id)) || row?.A1 || row?.Customer_Phone);
        const isLoading = sendingStates[row.DocumentId];
        
        const handleClick = async () => {
            await sendPriceListWhatsApp(row);
        };
        
        return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title={hasPhone ? "Send Price List via WhatsApp" : "No phone number available"}>
                    <span>
                        <IconButton
                            size="small"
                            onClick={handleClick}
                            disabled={!hasPhone || isLoading}
                            color={hasPhone ? "success" : "default"}
                        >
                            {isLoading ? <CircularProgress size={20} /> : <WhatsAppIcon fontSize="small" />}
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
        );
    };

    const selectedTotals = useMemo(() => {
        const selectedIds = multipleCostCenterUpdateValues.Do_Id;
        if (!selectedIds.length) return { billQty: 0, altActQty: 0 };
        let billQty = 0;
        let altActQty = 0;
        salesInvoices
            .filter(inv => selectedIds.includes(toNumber(inv.DocumentId)))
            .forEach(inv => {
                if (Array.isArray(inv.stockDetails)) {
                    inv.stockDetails.forEach(item => {
                        billQty += Number(item.Bill_Qty) || 0;
                        altActQty += Number(item.Alt_Act_Qty) || 0;
                    });
                }
            });
        return { billQty, altActQty };
    }, [multipleCostCenterUpdateValues.Do_Id, salesInvoices]);

    useEffect(() => {
        fetchLink({ address: "masters/erpCostCenter/dropDown" })
            .then((data) => setCostCenterData(toArray(data.data)))
            .catch(console.error);
    }, []);

    const costTypeColumns = useMemo(() => {
        const columns = costTypes
            .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
            .map((costType) => {
                const field = `costType_${toNumber(costType.Cost_Category_Id)}`;
                return {
                    costType: costType.Cost_Category,
                    field: field,
                    columnConfig: {
                        Field_Name: field,
                        Fied_Data: "string",
                        isVisible: 1,
                        ColumnHeader: costType.Cost_Category,
                        isCustomCell: true,
                        getFilterValues: (row) => getCostTypeEmployees(row, costType.Cost_Category_Id),
                        Cell: ({ row }) => {
                            const names = getCostTypeEmployees(row, costType.Cost_Category_Id).join(", ");
                            return <span>{names || "-"}</span>;
                        },
                    }
                };
            });
        return columns.sort((a, b) => {
            const aName = a.costType.toLowerCase();
            const bName = b.costType.toLowerCase();
            if (aName.includes('broker')) return -1;
            if (bName.includes('broker')) return 1;
            if (aName.includes('transport')) return -1;
            if (bName.includes('transport')) return 1;
            return a.costType.localeCompare(b.costType);
        }).map(c => c.columnConfig);
    }, [costTypes, uniqueInvolvedCost]);

    const filterColumns = useMemo(() => [...columns, ...costTypeColumns], [columns, costTypeColumns]);

    const onCloseAssignDialog = () =>
        setFilters((prev) => ({ ...prev, assignDialog: false, selectedInvoice: null }));

    const onCloseFilterDialog = () => setFilters((prev) => ({ ...prev, filterDialog: false }));

    const onCloseMultipleUpdateCostCategoryDialog = () => {
        setMultipleCostCenterUpdateValues(multipleStaffUpdateInitialValues);
        setFilters((prev) => ({ ...prev, multipleStaffUpdateDialog: false }));
    };

    const onCloseMultipleStaffRemoveDialog = () => {
        setMultipleStaffRemoveValues(multipleStaffRemoveInitialValues);
        setFilters((prev) => ({ ...prev, multipleStaffRemoveDialog: false }));
    };

    const onChangeEmployee = (invoice, selectedOptions, costType) => {
        setFilters((prev) => {
            const updatedInvolvedStaffs = toArray(prev.selectedInvoice?.involvedStaffs)
                .filter((emp) => !isEqualNumber(emp.Emp_Type_Id, costType.Cost_Category_Id))
                .concat(selectedOptions);
            return { ...prev, selectedInvoice: { ...invoice, involvedStaffs: updatedInvolvedStaffs } };
        });
    };

    const fetchSalesInvoices = () => {
        if (viewMode === 'pending') fetchPendingInvoices();
        else setFilters((pre) => ({ ...pre, fetchTrigger: pre.fetchTrigger + 1 }));
    };

    const getPdfDownloadUrl = (invoiceId, token) => {
        const baseUrl = api;
        const cleanInvoiceNo = invoiceId.replace(/\//g, '_');
        return `${baseUrl}sales/downloadPdf?Do_Inv_No=${cleanInvoiceNo}`;
    };

    const downloadInvoicePDF = async (invoiceId, fileName = null) => {
        try {
            const downloadUrl = getPdfDownloadUrl(invoiceId);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = fileName || `${invoiceId}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return true;
        } catch (error) {
            console.error('Error downloading PDF:', error);
            throw error;
        }
    };

    const convertToISTShort = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istDate = new Date(date.getTime() + istOffset);
            const hours = String(istDate.getUTCHours()).padStart(2, '0');
            const minutes = String(istDate.getUTCMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch (error) {
            return isoString;
        }
    };

    const downloadSelectedAsExcel = () => {
        const selectedIds = multipleCostCenterUpdateValues.Do_Id;
        if (selectedIds.length === 0) {
            toast.warning("Please select at least one invoice to download");
            return;
        }
        setDownloadLoading(true);
        handleDownloadClose();
        try {
            const selectedInvoices = salesInvoices.filter(inv => selectedIds.includes(toNumber(inv.DocumentId)));
            const excelData = [];
            selectedInvoices.forEach((invoice, index) => {
                const mainRow = {
                    'S.No': index + 1,
                    'Document No': invoice.DocumentNumber || '',
                    'Type': invoice.DocumentType || (invoice.voucherTypeGet || ''),
                    'Created': convertToISTShort(invoice.createdOn),
                    'Voucher Type': invoice.voucherTypeGet || '',
                    'Customer': invoice.retailerNameGet || '',
                    'Phone Number': invoice.A1_Phone || phoneMap.get(Number(invoice.Retailer_Id)) || invoice.A1 || 'Not Available',
                    'Bill Qty': invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0) : 0,
                    'Alt Act Qty': invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Alt_Act_Qty) || 0), 0) : 0,
                    'Narration': invoice.Narration || '',
                    'Total Amount': invoice.Total_Invoice_value || 0,
                    'Status': invoice.Delivery_Status || invoice.Conversion_Status || '',
                };
                costTypes
                    .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
                    .forEach(costType => {
                        const names = getCostTypeEmployees(invoice, costType.Cost_Category_Id).join(", ");
                        mainRow[costType.Cost_Category] = names || '-';
                    });
                excelData.push(mainRow);
            });
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(excelData);
            const colWidths = [];
            const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
            for (let C = range.s.c; C <= range.e.c; ++C) {
                let maxWidth = 10;
                for (let R = range.s.r; R <= range.e.r; ++R) {
                    const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
                    if (cell && cell.v) {
                        const width = String(cell.v).length + 2;
                        if (width > maxWidth) maxWidth = width;
                    }
                }
                colWidths[C] = { wch: Math.min(maxWidth, 50) };
            }
            ws['!cols'] = colWidths;
            XLSX.utils.book_append_sheet(wb, ws, "Data");
            const fileName = `Data_${viewMode}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
            toast.success(`Downloaded ${selectedIds.length} items as Excel`);
        } catch (error) {
            console.error('Error downloading Excel:', error);
            toast.error(`Failed to download Excel: ${error.message}`);
        } finally {
            setDownloadLoading(false);
        }
    };

    const downloadSelectedAsPDF = () => {
        const selectedIds = multipleCostCenterUpdateValues.Do_Id;
        if (selectedIds.length === 0) {
            toast.warning("Please select at least one item to download");
            return;
        }
        setDownloadLoading(true);
        handleDownloadClose();
        try {
            const selectedInvoices = salesInvoices.filter(inv => selectedIds.includes(toNumber(inv.DocumentId)));
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            const tableData = [];
            selectedInvoices.forEach((invoice, index) => {
                const row = [
                    index + 1,
                    invoice.DocumentNumber || 'N/A',
                    invoice.DocumentType || '',
                    invoice.DocumentDate ? invoice.DocumentDate.split('T')[0] : '',
                    invoice.createdOn || '',
                    invoice.voucherTypeGet || '',
                    invoice.retailerNameGet || '',
                    invoice.Retailer_GSTIN || '',
                    `₹${NumberFormat(invoice.Total_Invoice_value || 0)}`,
                    invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0) : 0,
                    invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Alt_Act_Qty) || 0), 0) : 0,
                    invoice.Narration || '',
                    invoice.Delivery_Status || invoice.Conversion_Status || '',
                    invoice.A1_Phone || phoneMap.get(Number(invoice.Retailer_Id)) || invoice.A1 || 'No Phone'
                ];
                costTypes
                    .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
                    .forEach(costType => {
                        const names = getCostTypeEmployees(invoice, costType.Cost_Category_Id).join(", ");
                        row.push(names || '-');
                    });
                tableData.push(row);
            });
            const tableColumns = [
                "S.No", "Document No", "Type", "Document Date", "Created On", "Voucher Type",
                "Customer", "Customer GST", "Total Amount", "Bill Qty", "Alt Act Qty",
                "Narration", "Status", "Phone Number",
                ...costTypes
                    .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
                    .map(costType => costType.Cost_Category)
            ];
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.text(`Report - ${viewMode === 'pending' ? 'Pending' : 'All'}`, 14, 15);
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 280, 10, { align: 'right' });
            doc.text(`Total Items: ${selectedIds.length}`, 14, 22);
            doc.text(`Date: ${filters.reqDate}`, 14, 27);
            doc.autoTable({
                startY: 37,
                head: [tableColumns],
                body: tableData,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak', cellWidth: 'wrap' },
                headStyles: { fillColor: [66, 66, 66], textColor: 255, fontStyle: 'bold', halign: 'center' },
                margin: { left: 10, right: 10 },
                didDrawPage: (data) => {
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text(
                        `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
                        data.settings.margin.left,
                        doc.internal.pageSize.height - 10
                    );
                }
            });
            const fileName = `Report_${viewMode}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);
            toast.success(`Downloaded ${selectedIds.length} items as PDF`);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error(`Failed to download PDF: ${error.message}`);
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleDownloadClose = () => setDownloadAnchorEl(null);

    const postAssignCostCenters = async (e) => {
        e.preventDefault();
        fetchLink({
            address: "sales/salesInvoice/lrReport",
            method: "POST",
            bodyData: {
                Do_Id: filters.selectedInvoice?.Do_Id,
                involvedStaffs: filters.selectedInvoice?.involvedStaffs,
                staffInvolvedStatus: toNumber(filters.selectedInvoice?.staffInvolvedStatus),
            },
            loadingOn,
            loadingOff,
        }).then((data) => {
            if (data.success) {
                toast.success(data.message);
                onCloseAssignDialog();
                if (viewMode === 'pending') fetchPendingInvoices();
                else fetchSalesInvoices();
            } else {
                toast.error(data.message);
            }
        }).catch((e2) => console.log(e2));
    };

    const postMultipleCostCenterUpdate = async () => {
        fetchLink({
            address: "sales/salesInvoice/lrReport/multiple",
            method: "POST",
            bodyData: {
                CostCategory: toNumber(multipleCostCenterUpdateValues.CostCategory.value),
                Do_Id: multipleCostCenterUpdateValues.Do_Id,
                involvedStaffs: multipleCostCenterUpdateValues.involvedStaffs.map((option) => toNumber(option.value)),
                staffInvolvedStatus: toNumber(multipleCostCenterUpdateValues.staffInvolvedStatus),
                deliveryStatus: toNumber(multipleCostCenterUpdateValues.deliveryStatus),
            },
            loadingOn,
            loadingOff,
        }).then((data) => {
            if (data.success) {
                toast.success(data.message);
                onCloseMultipleUpdateCostCategoryDialog();
                if (viewMode === 'pending') fetchPendingInvoices();
                else fetchSalesInvoices();
            } else {
                toast.error(data.message);
            }
        }).catch((e) => console.log(e));
    };

    const applyFilters = () => {
        if (activeTab === 'price_list') {
            let filtered = [...priceListRetailers];
            for (const column of filterColumns) {
                const key = column.Field_Name;
                const filterVal = columnFilters[key];
                if (!filterVal) continue;
                if (filterVal.type === "range") {
                    const { min, max } = filterVal;
                    filtered = filtered.filter((item) => {
                        const value = item[key];
                        return (min === undefined || value >= min) && (max === undefined || value <= max);
                    });
                    continue;
                }
                if (filterVal.type === "date") {
                    const { start, end } = filterVal.value || {};
                    filtered = filtered.filter((item) => {
                        const dateValue = new Date(item[key]);
                        return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
                    });
                    continue;
                }
                if (Array.isArray(filterVal)) {
                    const selected = filterVal.map(normalize).filter(Boolean);
                    if (!selected.length) continue;
                    if (typeof column.getFilterValues === "function") {
                        filtered = filtered.filter((item) => {
                            const rowVals = (column.getFilterValues(item) || []).map(normalize).filter(Boolean);
                            return selected.some((v) => rowVals.includes(v));
                        });
                    } else {
                        filtered = filtered.filter((item) => selected.includes(normalize(item[key])));
                    }
                }
            }
            setFilteredPriceListRetailers(filtered);
        } else if (activeTab === 'receipt_list') {
            let filtered = [...allReceipts];
            for (const column of filterColumns) {
                const key = column.Field_Name;
                const filterVal = columnFilters[key];
                if (!filterVal) continue;
                if (filterVal.type === "range") {
                    const { min, max } = filterVal;
                    filtered = filtered.filter((item) => {
                        const value = item[key];
                        return (min === undefined || value >= min) && (max === undefined || value <= max);
                    });
                    continue;
                }
                if (filterVal.type === "date") {
                    const { start, end } = filterVal.value || {};
                    filtered = filtered.filter((item) => {
                        const dateValue = new Date(item[key]);
                        return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
                    });
                    continue;
                }
                if (Array.isArray(filterVal)) {
                    const selected = filterVal.map(normalize).filter(Boolean);
                    if (!selected.length) continue;
                    if (typeof column.getFilterValues === "function") {
                        filtered = filtered.filter((item) => {
                            const rowVals = (column.getFilterValues(item) || []).map(normalize).filter(Boolean);
                            return selected.some((v) => rowVals.includes(v));
                        });
                    } else {
                        filtered = filtered.filter((item) => selected.includes(normalize(item[key])));
                    }
                }
            }
            setFilteredData(filtered);
        } else {
            let filtered = [...salesInvoices];
            for (const column of filterColumns) {
                const key = column.Field_Name;
                const filterVal = columnFilters[key];
                if (!filterVal) continue;
                if (filterVal.type === "range") {
                    const { min, max } = filterVal;
                    filtered = filtered.filter((item) => {
                        const value = item[key];
                        return (min === undefined || value >= min) && (max === undefined || value <= max);
                    });
                    continue;
                }
                if (filterVal.type === "date") {
                    const { start, end } = filterVal.value || {};
                    filtered = filtered.filter((item) => {
                        const dateValue = new Date(item[key]);
                        return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
                    });
                    continue;
                }
                if (Array.isArray(filterVal)) {
                    const selected = filterVal.map(normalize).filter(Boolean);
                    if (!selected.length) continue;
                    if (typeof column.getFilterValues === "function") {
                        filtered = filtered.filter((item) => {
                            const rowVals = (column.getFilterValues(item) || []).map(normalize).filter(Boolean);
                            return selected.some((v) => rowVals.includes(v));
                        });
                    } else {
                        filtered = filtered.filter((item) => selected.includes(normalize(item[key])));
                    }
                }
            }
            setFilteredData(filtered);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [columnFilters, salesInvoices, priceListRetailers, allReceipts, filterColumns, activeTab]);

    const handleFilterChange = (column, value) => {
        setColumnFilters((prevFilters) => ({ ...prevFilters, [column]: value }));
    };

    const handleMultiPrint = useReactToPrint({
        content: () => multiPrintRef.current,
        documentTitle: "Multiple Documents",
        pageStyle: currentPrintType === 'delivery_slip' ? `
            @page { margin: 0.7cm 0 0 0; size: auto; }
            html, body { margin: 0; padding: 0; }
            body { display: flex; flex-direction: column; align-items: center; }
            @media print { body > * { margin-left: 0 !important; margin-right: 0 !important; } .no-print { display: none !important; } }
        ` : currentPrintType === 'sales_invoice' ? `
            @page { size: A5 landscape; margin: 0; }
            html, body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            body { display: flex; flex-direction: column; align-items: center; }
            @media print { body > * { margin-left: 0 !important; margin-right: 0 !important; } .no-print { display: none !important; } }
        ` : `
            @page { margin: 0.6cm; size: auto; }
            html, body { margin: 0; padding: 0; }
            body { display: flex; flex-direction: column; align-items: center; }
            @media print { body > * { margin-left: 0 !important; margin-right: 0 !important; } .no-print { display: none !important; } }
        `,
    });

    const renderFilter = (column) => {
        const { Field_Name, Fied_Data, ColumnHeader } = column;
        if (Fied_Data === "number") {
            return (
                <div className="d-flex justify-content-between px-2">
                    <input
                        placeholder="Min" type="number" className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.min ?? ""}
                        onChange={(e) => handleFilterChange(Field_Name, { type: "range", ...columnFilters[Field_Name], min: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                    <input
                        placeholder="Max" type="number" className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.max ?? ""}
                        onChange={(e) => handleFilterChange(Field_Name, { type: "range", ...columnFilters[Field_Name], max: e.target.value ? parseFloat(e.target.value) : undefined })}
                    />
                </div>
            );
        }
        if (Fied_Data === "date") {
            return (
                <div className="d-flex justify-content-between px-2">
                    <input
                        placeholder="Start Date" type="date" className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.value?.start ?? ""}
                        onChange={(e) => handleFilterChange(Field_Name, { type: "date", value: { ...columnFilters[Field_Name]?.value, start: e.target.value || undefined } })}
                    />
                    <input
                        placeholder="End Date" type="date" className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.value?.end ?? ""}
                        onChange={(e) => handleFilterChange(Field_Name, { type: "date", value: { ...columnFilters[Field_Name]?.value, end: e.target.value || undefined } })}
                    />
                </div>
            );
        }
        if (Fied_Data === "string") {
            let rawValues;
            if (activeTab === 'price_list') {
                rawValues = priceListRetailers.map((item) => item[Field_Name]);
            } else if (activeTab === 'receipt_list') {
                rawValues = allReceipts.map((item) => item[Field_Name]);
            } else {
                rawValues = typeof column.getFilterValues === "function"
                    ? salesInvoices.flatMap((item) => column.getFilterValues(item) || [])
                    : salesInvoices.map((item) => item[Field_Name]);
            }
            const distinctValues = uniqueCaseInsensitive(rawValues);
            return (
                <Autocomplete
                    multiple
                    id={`${Field_Name}-filter`}
                    options={distinctValues}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option}
                    value={columnFilters[Field_Name] || []}
                    onChange={(event, newValue) => handleFilterChange(Field_Name, newValue)}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox icon={icon} checkedIcon={checkedIcon} style={{ marginRight: 8 }} checked={selected} />
                            {option}
                        </li>
                    )}
                    isOptionEqualToValue={(opt, val) => opt === val}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={ColumnHeader || Field_Name}
                            placeholder={`Select ${(ColumnHeader || Field_Name).replace(/_/g, " ")}`}
                        />
                    )}
                />
            );
        }
        return null;
    };

    const postMultipleStaffRemove = async () => {
        if (!multipleStaffRemoveValues.CostCategory.value || multipleStaffRemoveValues.Do_Id.length === 0) {
            toast.error("Please select a Cost Category and at least one invoice");
            return;
        }
        fetchLink({
            address: "sales/salesInvoice/lrReport/multipleDelete",
            method: "POST",
            bodyData: {
                CostCategory: toNumber(multipleStaffRemoveValues.CostCategory.value),
                Do_Id: multipleStaffRemoveValues.Do_Id,
                staffInvolvedStatus: toNumber(multipleStaffRemoveValues.staffInvolvedStatus),
                deliveryStatus: toNumber(multipleStaffRemoveValues.deliveryStatus),
            },
            loadingOn,
            loadingOff,
        }).then((data) => {
            if (data.success) {
                toast.success(data.message);
                onCloseMultipleStaffRemoveDialog();
                if (viewMode === 'pending') fetchPendingInvoices();
                else fetchSalesInvoices();
            } else {
                toast.error(data.message);
            }
        }).catch((e) => console.log(e));
    };

    useEffect(() => {
        if (selectAllCheckBox) {
            if (activeTab === 'price_list') {
                const allIds = filteredPriceListRetailers.map(item => toNumber(item.DocumentId));
                setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: allIds }));
                setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: allIds }));
            } else if (activeTab === 'receipt_list') {
                const allIds = filteredData.map(item => toNumber(item.DocumentId));
                setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: allIds }));
                setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: allIds }));
            } else {
                const allDoIds = filteredData.map(item => toNumber(item.DocumentId));
                setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: allDoIds }));
                setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: allDoIds }));
            }
        } else {
            setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: [] }));
            setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: [] }));
        }
    }, [selectAllCheckBox, filteredData, filteredPriceListRetailers, activeTab]);

    const saveMultipleInvoiceValidation = useMemo(() => {
        const validDoId = multipleCostCenterUpdateValues.Do_Id.length > 0;
        const validCostCenterId = multipleCostCenterUpdateValues.involvedStaffs.length > 0;
        const validCostCategory =
            checkIsNumber(multipleCostCenterUpdateValues.CostCategory.value) &&
            !isEqualNumber(multipleCostCenterUpdateValues.CostCategory.value, 0);
        if (!validDoId) return false;
        if (validCostCenterId && !validCostCategory) return false;
        if (!validCostCenterId && validCostCategory) return false;
        return true;
    }, [multipleCostCenterUpdateValues]);

    const removeMultipleInvoiceValidation = useMemo(() => {
        const validDoId = multipleStaffRemoveValues.Do_Id.length > 0;
        const validCostCategory =
            checkIsNumber(multipleStaffRemoveValues.CostCategory.value) &&
            !isEqualNumber(multipleStaffRemoveValues.CostCategory.value, 0);
        return validDoId && validCostCategory;
    }, [multipleStaffRemoveValues]);

    const stats = useMemo(() => ({
        totalInvoices: allInvoices.length,
        totalSalesInvoices: allSalesInvoices.length,
        totalSalesOrders: allSalesOrders.length,
        totalReceipts: allReceipts.length,
        filteredInvoices: salesInvoices.length,
        customersWithPhone: phoneMap.size,
        totalPriceListRetailers: priceListRetailers.length
    }), [allInvoices.length, allSalesInvoices.length, allSalesOrders.length, allReceipts.length, salesInvoices.length, phoneMap.size, priceListRetailers.length]);

    const refreshData = () => {
        if (activeTab === 'price_list') {
            fetchRetailersWithLOL();
        } else if (activeTab === 'receipt_list') {
            fetchReceipts();
        } else if (viewMode === 'pending') {
            fetchPendingInvoices();
        } else {
            fetchAllInvoices(true);
        }
    };

    const handleTabChange = (newVal) => {
        setActiveTab(newVal);
        setSelectAllCheckBox(false);
        setMultipleCostCenterUpdateValues(multipleStaffUpdateInitialValues);
        setMultipleStaffRemoveValues(multipleStaffRemoveInitialValues);
        setColumnFilters({});
        
        if (newVal === 'price_list') {
            if (priceListRetailers.length === 0) {
                fetchRetailersWithLOL();
            } else {
                setFilteredPriceListRetailers(priceListRetailers);
            }
        } else if (newVal === 'sale_invoice') {
            setSalesInvoices(allSalesInvoices);
            setFilteredData(allSalesInvoices);
        } else if (newVal === 'sale_order') {
            setSalesInvoices(allSalesOrders);
            setFilteredData(allSalesOrders);
        } else if (newVal === 'receipt_list') {
            if (allReceipts.length === 0) {
                fetchReceipts();
            } else {
                setFilteredData(allReceipts);
            }
        }
    };

    // Base columns that are common
    const baseColumns = [
        {
            Field_Name: "Select",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => {
                const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(toNumber(row.DocumentId));
                return (
                    <Checkbox
                        onFocus={(e) => e.target.blur()}
                        checked={isSelected}
                        onChange={() => {
                            if (isSelected) {
                                setMultipleCostCenterUpdateValues((prev) => ({
                                    ...prev,
                                    Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.DocumentId)),
                                }));
                                setMultipleStaffRemoveValues((prev) => ({
                                    ...prev,
                                    Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.DocumentId)),
                                }));
                            } else {
                                setMultipleCostCenterUpdateValues((prev) => ({
                                    ...prev,
                                    Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)],
                                }));
                                setMultipleStaffRemoveValues((prev) => ({
                                    ...prev,
                                    Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)],
                                }));
                            }
                        }}
                    />
                );
            },
        },
        {
            Field_Name: "DocumentNumber",
            Fied_Data: "string",
            ColumnHeader: "Document No",
            isVisible: 1,
            isCustomCell: false,
        },
        {
            Field_Name: "DocumentType",
            Fied_Data: "string",
            ColumnHeader: "Type",
            isVisible: 1,
        },
        {
            Field_Name: "Created",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => row?.createdOn ? LocalDateWithTime(row?.createdOn) : "",
        },
        createCol("voucherTypeGet", "string", "Voucher"),
        createCol("retailerNameGet", "string", "Customer"),
        {
            Field_Name: "PhoneNumber",
            ColumnHeader: "Phone",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => {
                const phone = row.A1_Phone || phoneMap.get(Number(row.Retailer_Id)) || row.A1 || 'Not Available';
                return <span>{phone}</span>;
            },
        },
        {
            Field_Name: "BillQty",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => {
                if (row.stockDetails && row.stockDetails.length > 0) {
                    return row.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0);
                }
                return 0;
            },
        },
        {
            Field_Name: "AltActQty",
            ColumnHeader: "Alt Act Qty",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) =>
                RoundNumber(toArray(row.stockDetails).reduce((s, i) => s + toNumber(i.Alt_Act_Qty), 0)),
        },
        createCol("Narration", "string", "Narration"),
        {
            Field_Name: "Status",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => row.Delivery_Status || row.Conversion_Status || row.Status || '-',
        },
    ];

    // Price List specific columns
    const priceListColumns = [
        {
            Field_Name: "Select",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => {
                const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(toNumber(row.DocumentId));
                return (
                    <Checkbox
                        onFocus={(e) => e.target.blur()}
                        checked={isSelected}
                        onChange={() => {
                            if (isSelected) {
                                setMultipleCostCenterUpdateValues((prev) => ({
                                    ...prev,
                                    Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.DocumentId)),
                                }));
                                setMultipleStaffRemoveValues((prev) => ({
                                    ...prev,
                                    Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.DocumentId)),
                                }));
                            } else {
                                setMultipleCostCenterUpdateValues((prev) => ({
                                    ...prev,
                                    Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)],
                                }));
                                setMultipleStaffRemoveValues((prev) => ({
                                    ...prev,
                                    Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)],
                                }));
                            }
                        }}
                    />
                );
            },
        },
        {
            Field_Name: "Retailer_Name",
            Fied_Data: "string",
            ColumnHeader: "Customer Name",
            isVisible: 1,
        },
        {
            Field_Name: "Ret_Code",
            Fied_Data: "string",
            ColumnHeader: "Customer Code",
            isVisible: 1,
        },
        {
            Field_Name: "PhoneNumber",
            ColumnHeader: "Phone",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => {
                const phone = row.A1 || 'Not Available';
                return <span>{phone}</span>;
            },
        },
        {
            Field_Name: "City",
            Fied_Data: "string",
            ColumnHeader: "City",
            isVisible: 1,
        },
        {
            Field_Name: "Location",
            Fied_Data: "string",
            ColumnHeader: "Location",
            isVisible: 1,
        },
        {
            Field_Name: "Action",
            isVisible: 1,
            isCustomCell: true,
            Cell: PriceListActionCell
        }
    ];

    // Receipt specific columns
    const receiptColumns = [
        {
            Field_Name: "Select",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => {
                const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(toNumber(row.DocumentId));
                return (
                    <Checkbox
                        onFocus={(e) => e.target.blur()}
                        checked={isSelected}
                        onChange={() => {
                            if (isSelected) {
                                setMultipleCostCenterUpdateValues((prev) => ({
                                    ...prev,
                                    Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.DocumentId)),
                                }));
                                setMultipleStaffRemoveValues((prev) => ({
                                    ...prev,
                                    Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.DocumentId)),
                                }));
                            } else {
                                setMultipleCostCenterUpdateValues((prev) => ({
                                    ...prev,
                                    Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)],
                                }));
                                setMultipleStaffRemoveValues((prev) => ({
                                    ...prev,
                                    Do_Id: [...prev.Do_Id, toNumber(row.DocumentId)],
                                }));
                            }
                        }}
                    />
                );
            },
        },
        {
            Field_Name: "receipt_invoice_no",
            Fied_Data: "string",
            ColumnHeader: "Receipt No",
            isVisible: 1,
            isCustomCell: false,
        },
        {
            Field_Name: "receipt_date",
            Fied_Data: "date",
            ColumnHeader: "Receipt Date",
            isVisible: 1,
            isCustomCell: false,
        },
           {
            Field_Name: "DebitAccountGet",
            Fied_Data: "string",
            ColumnHeader: "Debit Account",
            isVisible: 1,
            isCustomCell: false,
        },
           {
            Field_Name: "CreditAccountGet",
            Fied_Data: "string",
            ColumnHeader: "Credit Account",
            isVisible: 1,
            isCustomCell: false,
        },
    
        {
            Field_Name: "PhoneNumber",
            ColumnHeader: "Phone",
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => {
                const phone = row.A1_Phone || phoneMap.get(Number(row.Retailer_Id)) || row.A1 || 'Not Available';
                return <span>{phone}</span>;
            },
        },
        {
            Field_Name: "Total_Invoice_value",
            Fied_Data: "number",
            ColumnHeader: "Amount",
            isVisible: 1,
            isCustomCell: false,
            Cell: ({ row }) => `₹${NumberFormat(row.Total_Invoice_value || 0)}`,
        },
        {
            Field_Name: "Payment_Mode",
            Fied_Data: "string",
            ColumnHeader: "Payment Mode",
            isVisible: 1,
            isCustomCell: false,
        },
        {
            Field_Name: "Bank_Name",
            Fied_Data: "string",
            ColumnHeader: "Bank",
            isVisible: 1,
            isCustomCell: false,
        },
        {
            Field_Name: "Cheque_No",
            Fied_Data: "string",
            ColumnHeader: "Cheque/Ref No",
            isVisible: 1,
            isCustomCell: false,
        },
        {
            Field_Name: "Status",
            Fied_Data: "string",
            ColumnHeader: "Status",
            isVisible: 1,
            isCustomCell: false,
        },
        createCol("Narration", "string", "Narration"),
        {
            Field_Name: "Action",
            isVisible: 1,
            isCustomCell: true,
            Cell: (props) => <ActionCell {...props} isReceiptTab={true} />
        }
    ];

    const saleInvoiceColumns = [
        ...baseColumns,
        {
            Field_Name: "Action",
            isVisible: 1,
            isCustomCell: true,
            Cell: (props) => <ActionCell {...props} isPriceListTab={false} />
        }
    ];

    const saleOrderColumns = [
        ...baseColumns,
        {
            Field_Name: "Action",
            isVisible: 1,
            isCustomCell: true,
            Cell: (props) => <ActionCell {...props} isPriceListTab={false} isSaleOrderTab={true} />
        }
    ];

    // Receipt Filter Bar Component
    const ReceiptFilterBar = () => {
        return (
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Receipt Filters</Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        label="From Date"
                        type="date"
                        size="small"
                        value={receiptFilters.Fromdate}
                        onChange={(e) => setReceiptFilters(prev => ({ ...prev, Fromdate: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="To Date"
                        type="date"
                        size="small"
                        value={receiptFilters.Todate}
                        onChange={(e) => setReceiptFilters(prev => ({ ...prev, Todate: e.target.value }))}
                        InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                        label="Voucher No"
                        size="small"
                        value={receiptFilters.voucher}
                        onChange={(e) => setReceiptFilters(prev => ({ ...prev, voucher: e.target.value }))}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Payment Mode</InputLabel>
                        <MuiSelect
                            value={receiptFilters.receipt_type}
                            onChange={(e) => setReceiptFilters(prev => ({ ...prev, receipt_type: e.target.value }))}
                            label="Payment Mode"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="cash">Cash</MenuItem>
                            <MenuItem value="bank">Bank</MenuItem>
                            <MenuItem value="cheque">Cheque</MenuItem>
                            <MenuItem value="online">Online</MenuItem>
                        </MuiSelect>
                    </FormControl>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <MuiSelect
                            value={receiptFilters.status}
                            onChange={(e) => setReceiptFilters(prev => ({ ...prev, status: e.target.value }))}
                            label="Status"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="completed">Completed</MenuItem>
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                        </MuiSelect>
                    </FormControl>
                    <Button 
                        variant="contained" 
                        size="small"
                        onClick={fetchReceipts}
                        startIcon={<Search />}
                    >
                        Search
                    </Button>
                    <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => {
                            setReceiptFilters({
                                Fromdate: ISOString(),
                                Todate: ISOString(),
                                voucher: '',
                                debit: '',
                                credit: '',
                                createdBy: '',
                                status: '',
                                receipt_type: ''
                            });
                            setTimeout(fetchReceipts, 100);
                        }}
                    >
                        Reset
                    </Button>
                </Box>
            </Box>
        );
    };

    const sharedButtonArea = (
        <>
            <Tooltip title="Select All">
                <Checkbox
                    checked={selectAllCheckBox}
                    onChange={e => setSelectAllCheckBox(e.target.checked)}
                    disabled={activeTab === 'price_list' ? filteredPriceListRetailers.length === 0 : activeTab === 'receipt_list' ? filteredData.length === 0 : filteredData.length === 0}
                />
            </Tooltip>

            <IconButton
                size="small"
                onClick={() => setFilters((prev) => ({ ...prev, filterDialog: true }))}
                disabled={isRefreshing}
            >
                <FilterAlt />
            </IconButton>

            <IconButton size="small" onClick={refreshData} disabled={isRefreshing}>
                <Search />
            </IconButton>

            {viewMode === 'pending' && activeTab !== 'price_list' && activeTab !== 'receipt_list' && (
                <div>
                    <Button
                        variant="contained"
                        size="small"
                        startIcon={<Download />}
                        endIcon={<ArrowDropDown />}
                        onClick={handleDownloadClick}
                        disabled={!multipleCostCenterUpdateValues.Do_Id.length || downloadLoading}
                        sx={{ ml: 1, textTransform: 'none' }}
                    >
                        {downloadLoading ? 'Downloading...' : 'Download'}
                    </Button>
                    <Menu
                        anchorEl={downloadAnchorEl}
                        open={Boolean(downloadAnchorEl)}
                        onClose={handleDownloadClose}
                    >
                        <MenuItem onClick={downloadSelectedAsExcel} disabled={downloadLoading}>
                            <ListItemIcon><TableChart fontSize="small" color="success" /></ListItemIcon>
                            <ListItemText>Download as Excel</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={downloadSelectedAsPDF} disabled={downloadLoading}>
                            <ListItemIcon><PictureAsPdf fontSize="small" color="error" /></ListItemIcon>
                            <ListItemText>Download as PDF</ListItemText>
                        </MenuItem>
                    </Menu>
                </div>
            )}

            {activeTab !== 'price_list' && activeTab !== 'receipt_list' && (
                <input
                    type="date"
                    className="cus-inpt w-auto"
                    value={filters.reqDate}
                    onChange={(e) => setFilters((prev) => ({ ...prev, reqDate: e.target.value }))}
                    disabled={isRefreshing || activeTab === 'price_list'}
                />
            )}

            {activeTab !== 'price_list' && activeTab !== 'receipt_list' && (
                <IconButton
                    size="small"
                    disabled={!filters.docType || !multipleCostCenterUpdateValues.Do_Id.length}
                    onClick={() => {
                        setCurrentPrintType(filters.docType);
                        setMultiPrint({
                            open: true,
                            doIds: multipleCostCenterUpdateValues.Do_Id,
                            docType: filters.docType
                        });
                    }}
                >
                    <Print />
                </IconButton>
            )}
        </>
    );

    const sharedDialogs = (
        <>
            <Dialog open={filters.filterDialog} onClose={onCloseFilterDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Filter Options</DialogTitle>
                <DialogContent>
                    <div className="row">
                        {filterColumns.map((column, index) => (
                            <div className="col-12 p-2" key={index}>
                                {renderFilter(column)}
                            </div>
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseFilterDialog} variant="outlined">Close</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, newVal) => handleTabChange(newVal)}
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="Sale Invoice" value="sale_invoice" />
                    <Tab label="Price List" value="price_list" />
                    <Tab label="Sale Order" value="sale_order" />
                    <Tab label="Receipt List" value="receipt_list" />
                </Tabs>
            </Box>

            {activeTab === 'sale_invoice' && (
                <FilterableTable
                    title={viewMode === 'pending' ? "Pending Sale Invoices" : "Sale Invoices"}
                    columns={saleInvoiceColumns}
                    dataArray={filteredData}
                    EnableSerialNumber
                    ButtonArea={sharedButtonArea}
                />
            )}

            {activeTab === 'price_list' && (
                <FilterableTable
                    title="Price List - Retailers"
                    columns={priceListColumns}
                    dataArray={filteredPriceListRetailers}
                    EnableSerialNumber
                    ButtonArea={sharedButtonArea}
                />
            )}

            {activeTab === 'sale_order' && (
                <FilterableTable
                    title={viewMode === 'pending' ? "Pending Sale Orders" : "Sale Orders"}
                    columns={saleOrderColumns}
                    dataArray={filteredData}
                    EnableSerialNumber
                    ButtonArea={sharedButtonArea}
                />
            )}

            {activeTab === 'receipt_list' && (
                <>
                    <ReceiptFilterBar />
                    <FilterableTable
                        title="Receipt List"
                        columns={receiptColumns}
                        dataArray={filteredData}
                        EnableSerialNumber
                        ButtonArea={sharedButtonArea}
                    />
                </>
            )}
            
            {sharedDialogs}
        </>
    );
};

export default Whatsapp;




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


// const ASKEVA_CONFIG = {
//     token: "ab232386697556df6e520afa18b48c46437849656eaf7a610c1d6150937aa2d11c2d4b3051674dfe37c020228da69c8fcda367a40a7e6a727ae020bcd7e27094",
//     apiEndpoint: "https://backend.askeva.io/v1/message/send-message",
//     templateName: "sale" 
// };

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

// const Whatsapp = ({ loadingOn, loadingOff, AddRights, EditRights, PrintRights, pageID }) => {
//     const [salesInvoices, setSalesInvoices] = useState([]);
//     const [allInvoices, setAllInvoices] = useState([]);
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

//     const [sendingStates, setSendingStates] = useState({});

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
//         method: 'template',
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
//             { Field_Name: "Do_Inv_No", Fied_Data: "string", ColumnHeader: "Invoice" },
//             { Field_Name: "voucherTypeGet", Fied_Data: "string", ColumnHeader: "Voucher" },
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

//     const filterInvoicesByPhone = (invoices, phoneMapData) => {
//         if (!phoneMapData || phoneMapData.size === 0) return invoices;
//         return invoices.filter(invoice => phoneMapData.has(Number(invoice.Retailer_Id)));
//     };

//     const fetchAllInvoices = async (refresh = false) => {
//         try {
//             if (!refresh) setIsLoading(true);
//             else setIsRefreshing(true);
//             setViewMode('normal');
//             const data = await fetchLink({
//                 address: `sales/salesInvoice/lrReportWhatsapp?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`,
//                 loadingOn,
//                 loadingOff,
//             });
//             const invoices = toArray(data.data);
//             setAllInvoices(invoices);
//             const processedInvoices = invoices.map(invoice => {
//                 if (invoice.stockDetails && Array.isArray(invoice.stockDetails)) {
//                     const processedStockDetails = invoice.stockDetails.map(item => ({
//                         ...item,
//                         Alt_Act_Qty: calculateAltActQty(item)
//                     }));
//                     return { ...invoice, stockDetails: processedStockDetails };
//                 }
//                 return invoice;
//             });
//             if (isPhoneMapLoaded) {
//                 setSalesInvoices(filterInvoicesByPhone(processedInvoices, phoneMap));
//             } else {
//                 setAllInvoices(processedInvoices);
//             }
//             setCostTypes(toArray(data?.others?.costTypes));
//             setUniqueInvolvedCost(toArray(data?.others?.uniqeInvolvedStaffs));
//             if (!hasInitialLoading) setHasInitialLoading(true);
//         } catch (error) {
//             console.error("Error fetching invoices:", error);
//             toast.error("Failed to load invoices");
//         } finally {
//             if (!refresh) setIsLoading(false);
//             setIsRefreshing(false);
//         }
//     };

//     const fetchPendingInvoices = async () => {
//         try {
//             setIsLoading(true);
//             setViewMode('pending');
//             const data = await fetchLink({
//                 address: `sales/salesInvoice/pendingDetails?reqDate=${filters.reqDate}`,
//                 loadingOn,
//                 loadingOff,
//             });
//             const invoices = toArray(data.data);
//             setAllInvoices(invoices);
//             const processedInvoices = invoices.map(invoice => {
//                 if (invoice.stockDetails && Array.isArray(invoice.stockDetails)) {
//                     const processedStockDetails = invoice.stockDetails.map(item => ({
//                         ...item,
//                         Alt_Act_Qty: calculateAltActQty(item)
//                     }));
//                     return { ...invoice, stockDetails: processedStockDetails };
//                 }
//                 return invoice;
//             });
//             if (isPhoneMapLoaded) {
//                 setSalesInvoices(filterInvoicesByPhone(processedInvoices, phoneMap));
//             } else {
//                 setAllInvoices(processedInvoices);
//             }
//             if (data?.others?.costTypes) setCostTypes(toArray(data?.others?.costTypes));
//             if (data?.others?.uniqeInvolvedStaffs) setUniqueInvolvedCost(toArray(data?.others?.uniqeInvolvedStaffs));
//         } catch (error) {
//             console.error("Error fetching pending invoices:", error);
//             toast.error("Failed to load pending invoices");
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

// // Test function to try with different parameter counts
// const testAskevaParameterCount = async () => {
//     const testCounts = [1, 2, 3, 4, 5];
    
//     for (const count of testCounts) {
//         const params = [];
//         for (let i = 1; i <= count; i++) {
//             params.push({ type: "text", text: `Test ${i}` });
//         }
        
//         const payload = {
//             to: "918667834261",
//             type: "template",
//             template: {
//                 language: { policy: "deterministic", code: "en" },
//                 name: "saleorders_copy",
//                 components: [{ type: "body", parameters: params }]
//             }
//         };
        
      
        
//         const response = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${ASKEVA_CONFIG.token}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload)
//         });
        
//         const data = await response.json();
        
        
//         if (response.ok) {
         
//             break;
//         }
//     }
// };

//  const getPDFUrlForInvoice = (order) => {
//     try {
//         const formattedInvoiceNo = order.Do_Inv_No.replace(/_/g, '/');
//         const encodedInvoiceNo = btoa(formattedInvoiceNo);
//         const companyId = storage?.Company_id;
//         return `https://printapp.erpsmt.in/sales/downloadPdf?Do_Inv_No=${encodedInvoiceNo}&Company_id=${companyId}`;
//     } catch (error) {
//         console.error('Error generating PDF URL:', error);
//         return order.Do_Inv_No;
//     }
// };


// const fetchAskevaTemplates = async () => {
//     try {
//         const response = await fetch(`https://backend.askeva.io/v1/templates?token=${ASKEVA_CONFIG.token}`, {
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//         const data = await response.json();
        
//         return data;
//     } catch (error) {
//         console.error('Error fetching templates:', error);
//     }
// };


// useEffect(() => {
//     fetchAskevaTemplates();
// }, []);


// const sendPriceListWhatsAppNoHeader = async (row) => {
//     const invoiceId = row.Do_Id;
//     setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
    
//     try {
//         const retailerId = Number(row?.Retailer_Id);
//         let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
        
//         if (!recipientPhone) {
//             toast.error('Customer phone number not found');
//             return false;
//         }

//         recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
//         if (recipientPhone.startsWith('0')) {
//             recipientPhone = recipientPhone.substring(1);
//         }
//         if (!recipientPhone.startsWith('91')) {
//             recipientPhone = `91${recipientPhone}`;
//         }

//         const pdfUrl = getPDFUrlForInvoice(row);
//         const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
//         const invoiceNo = row.Do_Inv_No || 'N/A';
//         const invoiceDate = new Date(row.Do_Date || row.createdOn).toLocaleDateString('en-GB');
//         const totalAmount = Number(row.Total_Invoice_value || 0).toFixed(2);
        
      
//         const payload = {
//             to: recipientPhone,
//             type: "template",
//             template: {
//                 name: ASKEVA_CONFIG.templateName,
//                 language: {
//                     code: "en"
//                 },
//                 components: [
//                     {
//                         type: "body",
//                         parameters: [
//                             {
//                                 type: "text",
//                                 text: customerName
//                             },
//                             {
//                                 type: "text",
//                                 text: invoiceNo
//                             },
//                             {
//                                 type: "text",
//                                 text: invoiceDate
//                             },
//                             {
//                                 type: "text",
//                                 text: totalAmount
//                             },
//                             {
//                                 type: "text",
//                                 text: pdfUrl
//                             }
//                         ]
//                     }
//                 ]
//             }
//         };
        
      
        
//         const response = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${ASKEVA_CONFIG.token}`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(payload)
//         });
        
//         const data = await response.json();
       
        
//         if (response.ok) {
//             toast.success('Price list sent successfully via WhatsApp!');
//             return true;
//         } else {
//             throw new Error(data.message || data.error || 'Failed to send');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         toast.error(`Failed: ${error.message}`);
//         return false;
//     } finally {
//         setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
//     }
// };



// const sendPriceListWhatsApp = async (row) => {
//     const invoiceId = row.Do_Id;
//     setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
    
//     try {
//         const retailerId = Number(row?.Retailer_Id);
//         let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
        
//         if (!recipientPhone) {
//             toast.error('Customer phone number not found');
//             return false;
//         }

//         recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
//         if (recipientPhone.startsWith('0')) {
//             recipientPhone = recipientPhone.substring(1);
//         }
//         if (!recipientPhone.startsWith('91')) {
//             recipientPhone = `91${recipientPhone}`;
//         }

//         const pdfUrl = getPDFUrlForInvoice(row);
        
//         // Format the data according to template attributes
//         const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
//         const invoiceNo = row.Do_Inv_No || 'N/A';
//         const invoiceDate = new Date(row.Do_Date || row.createdOn).toLocaleDateString('en-GB');
//         const totalAmount = Number(row.Total_Invoice_value || 0).toFixed(2);
        
//         // First, let's check what template parameters are expected
//         // You might need to adjust the number of parameters based on your template
//         // The error suggests you need to match the exact number of parameters your template expects
        
//         const payload = {
//             to: recipientPhone,
//             type: "template",
//             template: {
//                 name: ASKEVA_CONFIG.templateName,
//                 language: {
//                     code: "en"
//                 },
//                 components: [
//                     {
//                         type: "body",
//                         parameters: [
//                             {
//                                 type: "text",
//                                 text: customerName  // Parameter 1
//                             },
//                             {
//                                 type: "text",
//                                 text: invoiceNo     // Parameter 2
//                             },
//                             {
//                                 type: "text",
//                                 text: invoiceDate   // Parameter 3
//                             },
//                             {
//                                 type: "text",
//                                 text: totalAmount   // Parameter 4
//                             },
//                             {
//                                 type: "text",
//                                 text: pdfUrl        // Parameter 5
//                             }
//                         ]
//                     }
//                 ]
//             }
//         };
        
      
        
//         const response = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${ASKEVA_CONFIG.token}`, {
//             // method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(payload)
//         });
        
//         const data = await response.json();
      
        
//         if (response.ok) {
//             toast.success('Price list sent successfully via WhatsApp!');
//             return true;
//         } else {
//             // Handle parameter mismatch error
//             if (data.code === 132000) {
//                 toast.error(`Template parameter mismatch: Expected ${data.error_data?.expected_params || '?'} parameters, but sent 5`);
//                 console.error('Template error details:', data.error_data);
//             } else {
//                 toast.error(`Failed: ${data.message || 'Unknown error'}`);
//             }
//             return false;
//         }
//     } catch (error) {
//         console.error('Error sending price list:', error);
//         toast.error(`Failed to send price list: ${error.message}`);
//         return false;
//     } finally {
//         setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
//     }
// };


// const sendSaleOrderWhatsApp = async (row, isSaleOrderTab) => {
//     const invoiceId = row.Do_Id;
//     setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
    
//     try {
//         const retailerId = Number(row?.Retailer_Id);
//         let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
        
//         if (!recipientPhone) {
//             toast.error('Customer phone number not found');
//             return false;
//         }

//         recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
//         if (recipientPhone.startsWith('0')) {
//             recipientPhone = recipientPhone.substring(1);
//         }
//         if (!recipientPhone.startsWith('91')) {
//             recipientPhone = `91${recipientPhone}`;
//         }

//         const pdfUrl = getPDFUrlForInvoice(row);
//         const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
//         const invoiceNo = row.Do_Inv_No || 'N/A';
//         const invoiceDate = new Date(row.Do_Date || row.createdOn).toLocaleDateString('en-GB');
//         const totalAmount = Number(row.Total_Invoice_value || 0).toFixed(2);
        
   
//         // const templateName = "sale_order";

//         const templateName="sale_order_thanks";
        
//         const payload = {
//             to: recipientPhone,
//             type: "template",
//             template: {
//                 name: templateName,
//                 language: {
//                     code: "ta"
//                 },
//                 components: [
//                     {
//                         type: "body",
//                         parameters: [
//                             { type: "text", text: customerName },
//                             { type: "text", text: invoiceNo },
//                             { type: "text", text: invoiceDate },
//                             { type: "text", text: totalAmount },
//                             { type: "text", text: pdfUrl }
//                         ]
//                     }
//                 ]
//             }
//         };
        
//         const response = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${ASKEVA_CONFIG.token}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(payload)
//         });
        
//         const data = await response.json();
        
//         if (response.ok) {
//             toast.success('Sale Order sent successfully via WhatsApp!');
//             return true;
//         } else {
//             toast.error(`Failed: ${data.message || 'Unknown error'}`);
//             return false;
//         }
//     } catch (error) {
//         console.error('Error sending sale order:', error);
//         toast.error(`Failed to send sale order: ${error.message}`);
//         return false;
//     } finally {
//         setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
//     }
// };


// const sendPriceListWhatsAppAlt = async (row) => {
//     const invoiceId = row.Do_Id;
//     setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
    
//     try {
//         const retailerId = Number(row?.Retailer_Id);
//         let recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
        
//         if (!recipientPhone) {
//             toast.error('Customer phone number not found');
//             return false;
//         }

//         recipientPhone = String(recipientPhone).replace(/[^0-9]/g, '');
//         if (recipientPhone.startsWith('0')) {
//             recipientPhone = recipientPhone.substring(1);
//         }
//         if (!recipientPhone.startsWith('91')) {
//             recipientPhone = `91${recipientPhone}`;
//         }

//         const pdfUrl = getPDFUrlForInvoice(row);
//         const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
//         const invoiceNo = row.Do_Inv_No || 'N/A';
//         const invoiceDate = new Date(row.Do_Date || row.createdOn).toLocaleDateString('en-GB');
//         const totalAmount = Number(row.Total_Invoice_value || 0).toFixed(2);
        
//         // Alternative format - parameters as simple array
//         const payload = {
//             to: recipientPhone,
//             type: "template",
//             template: {
//                 name: ASKEVA_CONFIG.templateName,
//                 language: {
//                     code: "en"
//                 },
//                 components: [
//                     {
//                         type: "body",
//                         parameters: [
//                             customerName,
//                             invoiceNo,
//                             invoiceDate,
//                             totalAmount,
//                             pdfUrl
//                         ]
//                     }
//                 ]
//             }
//         };
        

        
//         const response = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${ASKEVA_CONFIG.token}`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify(payload)
//         });
        
//         const data = await response.json();
   
        
//         if (response.ok) {
//             toast.success('Price list sent successfully!');
//             return true;
//         } else {
//             throw new Error(data.message || 'Failed to send');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//         toast.error(`Failed: ${error.message}`);
//         return false;
//     } finally {
//         setSendingStates(prev => ({ ...prev, [invoiceId]: false }));
//     }
// };

//     const sendSaleInvoiceWhatsApp = async (row) => {
//         const invoiceId = row.Do_Id;
//         setSendingStates(prev => ({ ...prev, [invoiceId]: true }));
        
//         try {
//             const retailerId = Number(row?.Retailer_Id);
//             const recipientPhone = phoneMap.get(retailerId) || row?.A1 || row?.Customer_Phone;
            
//             if (!recipientPhone) {
//                 toast.error('Customer phone number not found');
//                 return false;
//             }

//             await generateAndStorePDF(row);
//             const pdfUrl = getPDFUrlSimple(row);
//             const invoiceNo = row.Do_Inv_No || 'N/A';
//             const customerName = row.retailerNameGet || row.Retailer_Name || 'Customer';
//             const formattedDate = new Date(row.Do_Date || row.createdOn).toLocaleDateString('en-GB');
//             const totalAmount = (row.Total_Invoice_value || 0).toFixed(2);
//             const CompanyName = storage?.Company_id == 1 ? "SM TRADERS" : "MOBITE";
            
//             const payload = {
//                 template: { name: "sales_invoice_order", language: "en" },
//                 source: "crm",
//                 wabaNumber: Dot_Pe_Number,
//                 recipients: [`91${recipientPhone}`],
//                 clientRefId: `invoice_${invoiceNo.replace(/\//g, '_')}_${Date.now()}`,
//                 params: {
//                     body: [customerName, invoiceNo, formattedDate, totalAmount, CompanyName, pdfUrl]
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

//     // Generic WhatsApp handler
//     const handleWhatsAppClick = async (row, isPriceListTab = false) => {
//         if (isPriceListTab) {
//             await sendPriceListWhatsApp(row);
//         } else {
//             await sendSaleInvoiceWhatsApp(row);
//         }
//     };

//     useEffect(() => {
//         const initializeData = async () => {
//             try {
//                 setIsLoading(true);
//                 const map = await fetchPhoneMap();
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
//         if (isPhoneMapLoaded && allInvoices.length > 0 && !initialDataLoaded) {
//             const processedInvoices = allInvoices.map(invoice => {
//                 if (invoice.stockDetails && Array.isArray(invoice.stockDetails)) {
//                     const processedStockDetails = invoice.stockDetails.map(item => ({
//                         ...item,
//                         Alt_Act_Qty: calculateAltActQty(item)
//                     }));
//                     return { ...invoice, stockDetails: processedStockDetails };
//                 }
//                 return invoice;
//             });
//             setSalesInvoices(filterInvoicesByPhone(processedInvoices, phoneMap));
//         }
//     }, [isPhoneMapLoaded, allInvoices, initialDataLoaded]);

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
//         setWhatsappDialog({ open: false, order: null, loading: false, method: 'template' });
//         setSelectedTemplate("");
//     };

//     const getPDFUrlSimple = (order) => {
//         const baseUrl = api;
//         const formattedInvoiceNo = order.Do_Inv_No.replace(/_/g, '/');
//         const encodedInvoiceNo = btoa(formattedInvoiceNo);
//         const companyid = btoa(storage?.Company_id);
//         return `https://printapp.erpsmt.in/sales/downloadPdf?Do_Inv_No=${encodedInvoiceNo}&Company_id=${companyid}`;
//     };

//     const generateInvoicePDF = async (order, companyId) => {
//         try {
//             const requestBody = {
//                 invoiceId: order.Do_Inv_No,
//                 companyId: companyId,
//                 invoiceData: {
//                     Do_Inv_No: order.Do_Inv_No,
//                     Total_Invoice_value: order.Total_Invoice_value || 0,
//                     retailerNameGet: order.retailerNameGet || order.Retailer_Name || 'Customer',
//                     Do_Date: order.Do_Date || order.So_Date,
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

//     const renderWhatsAppDialogContent = () => {
//         const { order, method } = whatsappDialog;
//         return (
//             <Box>
//                 <Box mb={2}>
//                     <Typography variant="subtitle2" color="textSecondary">
//                         Order: <strong>{order?.Do_Inv_No}</strong>
//                     </Typography>
//                     <Typography variant="subtitle2" color="textSecondary">
//                         Customer: <strong>{order?.retailerNameGet}</strong>
//                     </Typography>
//                     <Typography variant="subtitle2" color="textSecondary">
//                         Phone: <strong>{order?.recipientPhone || order?.A1 || '-'}</strong>
//                     </Typography>
//                     <Typography variant="subtitle2" color="textSecondary">
//                         Amount: <strong>₹{NumberFormat(order?.Total_Invoice_value)}</strong>
//                     </Typography>
//                 </Box>
//                 <Divider sx={{ my: 2 }} />
//                 {pdfGeneration.loading && (
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
//                         <CircularProgress size={20} />
//                         <Typography variant="body2">Generating PDF document...</Typography>
//                     </Box>
//                 )}
//                 {pdfGeneration.error && (
//                     <Alert severity="error" sx={{ my: 2 }}>
//                         <Typography variant="body2">Failed to generate PDF: {pdfGeneration.error}</Typography>
//                         <Button size="small" onClick={() => generateAndStorePDF(order)} sx={{ mt: 1 }}>
//                             Retry PDF Generation
//                         </Button>
//                     </Alert>
//                 )}
//                 {pdfGeneration.pdfUrl && !pdfGeneration.loading && (
//                     <Alert severity="success" sx={{ my: 2 }}>
//                         <Typography variant="body2" fontWeight="bold">✓ PDF generated successfully!</Typography>
//                         <Box sx={{ mt: 1 }}>
//                             <Typography variant="caption" display="block">File: {pdfGeneration.fileName}</Typography>
//                             <Typography variant="caption" display="block">Secure URL generated with token</Typography>
//                             <Button
//                                 size="small"
//                                 variant="outlined"
//                                 onClick={() => downloadInvoicePDF(order.Do_Inv_No, pdfGeneration.fileName)}
//                                 sx={{ mt: 1 }}
//                                 startIcon={<Print fontSize="small" />}
//                             >
//                                 Test Download PDF
//                             </Button>
//                         </Box>
//                     </Alert>
//                 )}
//                 <Box mb={2}>
//                     <Typography variant="subtitle1" fontWeight="bold" mb={1}>Choose sending method:</Typography>
//                     <RadioGroup
//                         value={method}
//                         onChange={(e) => setWhatsappDialog(prev => ({ ...prev, method: e.target.value }))}
//                     >
//                         <FormControlLabel
//                             value="pdf-link"
//                             control={<Radio size="small" />}
//                             label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><span>Send PDF Download Link</span></Box>}
//                             disabled={!pdfGeneration.pdfUrl && !pdfGeneration.loading}
//                         />
//                         <FormControlLabel value="pdf-template" control={<Radio size="small" />} label="Send with PDF Template" />
//                         <FormControlLabel value="other-template" control={<Radio size="small" />} label="Send with Text Template" />
//                     </RadioGroup>
//                 </Box>
//                 {method === 'pdf-template' && (
//                     <Box>
//                         <FormControl fullWidth variant="outlined" size="small">
//                             <InputLabel>Select PDF Template</InputLabel>
//                             <MuiSelect value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} label="Select PDF Template">
//                                 <MenuItem value=""><em>Select a PDF template</em></MenuItem>
//                                 {pdfTemplates.length > 0 ? pdfTemplates.map((template) => {
//                                     const templateName = template.templateName || template.name;
//                                     const eventId = template.eventId || template.id;
//                                     return (
//                                         <MenuItem key={eventId} value={templateName}>
//                                             {templateName} ({template.language || 'en'})
//                                             {template.templateStatus && ` - ${template.templateStatus}`}
//                                         </MenuItem>
//                                     );
//                                 }) : <MenuItem disabled>No PDF templates available</MenuItem>}
//                             </MuiSelect>
//                         </FormControl>
//                     </Box>
//                 )}
//                 {method === 'other-template' && (
//                     <Box>
//                         <FormControl fullWidth variant="outlined" size="small">
//                             <InputLabel>Select Text Template</InputLabel>
//                             <MuiSelect value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} label="Select Text Template">
//                                 <MenuItem value=""><em>Select a text template</em></MenuItem>
//                                 {otherTemplates.length > 0 ? otherTemplates.map((template) => {
//                                     const templateName = template.templateName || template.name;
//                                     const eventId = template.eventId || template.id;
//                                     return (
//                                         <MenuItem key={eventId} value={templateName}>
//                                             {templateName} ({template.language || 'en'})
//                                         </MenuItem>
//                                     );
//                                 }) : <MenuItem disabled>No text templates available</MenuItem>}
//                             </MuiSelect>
//                         </FormControl>
//                     </Box>
//                 )}
//                 {(selectedTemplate && method.includes('template')) && (
//                     <Box mt={3} p={2} border={1} borderColor="divider" borderRadius={1}>
//                         <Typography variant="subtitle2" fontWeight="bold" mb={1}>Preview:</Typography>
//                         <Typography variant="body2">
//                             <strong>Template:</strong> {selectedTemplate}<br />
//                             <strong>Invoice:</strong> {order?.Do_Inv_No}<br />
//                             <strong>Customer:</strong> {order?.retailerNameGet}<br />
//                             <strong>Amount:</strong> ₹{NumberFormat(order?.Total_Invoice_value)}
//                             {pdfGeneration.pdfUrl && (<><br /><strong>PDF URL:</strong> Will be included in message</>)}
//                         </Typography>
//                     </Box>
//                 )}
//                 {method === 'pdf-link' && pdfGeneration.pdfUrl && (
//                     <Box mt={3} p={2} border={1} borderColor="divider" borderRadius={1}>
//                         <Typography variant="subtitle2" fontWeight="bold" mb={1}>PDF Link Preview:</Typography>
//                         <Typography variant="body2">
//                             The customer will receive a WhatsApp message with a secure link to download the PDF invoice.
//                             <br /><br />
//                             <strong>Invoice PDF Details:</strong>
//                             <br />• File: {pdfGeneration.fileName}
//                             <br />• Secure encrypted link
//                             <br />• Valid for 7 days
//                             <br />• Professional invoice format
//                         </Typography>
//                     </Box>
//                 )}
//             </Box>
//         );
//     };

//     const selectedTotals = useMemo(() => {
//         const selectedIds = multipleCostCenterUpdateValues.Do_Id;
//         if (!selectedIds.length) return { billQty: 0, altActQty: 0 };
//         let billQty = 0;
//         let altActQty = 0;
//         salesInvoices
//             .filter(inv => selectedIds.includes(toNumber(inv.Do_Id)))
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
//             const selectedInvoices = salesInvoices.filter(inv => selectedIds.includes(toNumber(inv.Do_Id)));
//             const excelData = [];
//             selectedInvoices.forEach((invoice, index) => {
//                 const mainRow = {
//                     'S.No': index + 1,
//                     'Invoice No': invoice.Do_Inv_No || '',
//                     'Created': convertToISTShort(invoice.createdOn),
//                     'Voucher Type': invoice.voucherTypeGet || '',
//                     'Customer': invoice.retailerNameGet || '',
//                     'Bill Qty': invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0) : 0,
//                     'Alt Act Qty': invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Alt_Act_Qty) || 0), 0) : 0,
//                     'Narration': invoice.Narration || '',
//                     'Total Amount': invoice.Total_Invoice_value || 0,
//                     'Delivery Status': invoice.Delivery_Status || '',
//                     'Phone Number': phoneMap.get(Number(invoice.Retailer_Id)) || 'Not Available'
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
//             XLSX.utils.book_append_sheet(wb, ws, "Invoices");
//             const fileName = `Invoices_${viewMode}_${new Date().toISOString().split('T')[0]}.xlsx`;
//             XLSX.writeFile(wb, fileName);
//             toast.success(`Downloaded ${selectedIds.length} invoices as Excel`);
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
//             toast.warning("Please select at least one invoice to download");
//             return;
//         }
//         setDownloadLoading(true);
//         handleDownloadClose();
//         try {
//             const selectedInvoices = salesInvoices.filter(inv => selectedIds.includes(toNumber(inv.Do_Id)));
//             const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
//             const tableData = [];
//             selectedInvoices.forEach((invoice, index) => {
//                 const row = [
//                     index + 1,
//                     invoice.Do_Inv_No || 'N/A',
//                     invoice.Do_Date ? invoice.Do_Date.split('T')[0] : '',
//                     invoice.createdOn || '',
//                     invoice.voucherTypeGet || '',
//                     invoice.retailerNameGet || '',
//                     invoice.Retailer_GSTIN || '',
//                     `₹${NumberFormat(invoice.Total_Invoice_value || 0)}`,
//                     invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0) : 0,
//                     invoice.stockDetails ? invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Alt_Act_Qty) || 0), 0) : 0,
//                     invoice.Narration || '',
//                     invoice.Delivery_Status || '',
//                     phoneMap.get(Number(invoice.Retailer_Id)) || 'No Phone'
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
//                 "S.No", "Invoice No", "Invoice Date", "Created On", "Voucher Type",
//                 "Customer", "Customer GST", "Total Amount", "Bill Qty", "Alt Act Qty",
//                 "Narration", "Delivery Status", "Phone Number",
//                 ...costTypes
//                     .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
//                     .map(costType => costType.Cost_Category)
//             ];
//             doc.setFontSize(16);
//             doc.setTextColor(40, 40, 40);
//             doc.text(`Invoices Report - ${viewMode === 'pending' ? 'Pending' : 'Sales'}`, 14, 15);
//             doc.setFontSize(8);
//             doc.setTextColor(100, 100, 100);
//             doc.text(`Generated on: ${new Date().toLocaleString()}`, 280, 10, { align: 'right' });
//             doc.text(`Total Invoices: ${selectedIds.length}`, 14, 22);
//             doc.text(`Date Range: ${filters.reqDate}`, 14, 27);
//             doc.text(`Filtered: Only showing customers with phone numbers`, 14, 32);
//             doc.autoTable({
//                 startY: 37,
//                 head: [tableColumns],
//                 body: tableData,
//                 theme: 'grid',
//                 styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak', cellWidth: 'wrap' },
//                 headStyles: { fillColor: [66, 66, 66], textColor: 255, fontStyle: 'bold', halign: 'center' },
//                 columnStyles: {
//                     0: { cellWidth: 10 }, 1: { cellWidth: 25 }, 2: { cellWidth: 20 },
//                     3: { cellWidth: 20 }, 4: { cellWidth: 15 }, 5: { cellWidth: 30 },
//                     6: { cellWidth: 25 }, 7: { cellWidth: 20, halign: 'right' },
//                     8: { cellWidth: 15, halign: 'right' }, 9: { cellWidth: 15, halign: 'right' },
//                     10: { cellWidth: 25 }, 11: { cellWidth: 15 }, 12: { cellWidth: 20 },
//                 },
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
//             const fileName = `Invoices_${viewMode}_${new Date().toISOString().split('T')[0]}.pdf`;
//             doc.save(fileName);
//             toast.success(`Downloaded ${selectedIds.length} invoices as PDF`);
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

//     useEffect(() => {
//         applyFilters();
//     }, [columnFilters, salesInvoices, filterColumns]);

//     const handleFilterChange = (column, value) => {
//         setColumnFilters((prevFilters) => ({ ...prevFilters, [column]: value }));
//     };

//     const applyFilters = () => {
//         let filtered = [...salesInvoices];
//         for (const column of filterColumns) {
//             const key = column.Field_Name;
//             const filterVal = columnFilters[key];
//             if (!filterVal) continue;
//             if (filterVal.type === "range") {
//                 const { min, max } = filterVal;
//                 filtered = filtered.filter((item) => {
//                     const value = item[key];
//                     return (min === undefined || value >= min) && (max === undefined || value <= max);
//                 });
//                 continue;
//             }
//             if (filterVal.type === "date") {
//                 const { start, end } = filterVal.value || {};
//                 filtered = filtered.filter((item) => {
//                     const dateValue = new Date(item[key]);
//                     return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
//                 });
//                 continue;
//             }
//             if (Array.isArray(filterVal)) {
//                 const selected = filterVal.map(normalize).filter(Boolean);
//                 if (!selected.length) continue;
//                 if (typeof column.getFilterValues === "function") {
//                     filtered = filtered.filter((item) => {
//                         const rowVals = (column.getFilterValues(item) || []).map(normalize).filter(Boolean);
//                         return selected.some((v) => rowVals.includes(v));
//                     });
//                 } else {
//                     filtered = filtered.filter((item) => selected.includes(normalize(item[key])));
//                 }
//             }
//         }
//         setFilteredData(filtered);
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
//             const rawValues =
//                 typeof column.getFilterValues === "function"
//                     ? salesInvoices.flatMap((item) => column.getFilterValues(item) || [])
//                     : salesInvoices.map((item) => item[Field_Name]);
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
//             const allDoIds = filteredData.map(item => toNumber(item.Do_Id));
//             setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: allDoIds }));
//             setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: allDoIds }));
//         } else {
//             setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: [] }));
//             setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: [] }));
//         }
//     }, [selectAllCheckBox, filteredData]);

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
//         filteredInvoices: salesInvoices.length,
//         customersWithPhone: phoneMap.size
//     }), [allInvoices.length, salesInvoices.length, phoneMap.size]);

//     const refreshData = () => {
//         if (viewMode === 'pending') fetchPendingInvoices();
//         else fetchAllInvoices(true);
//     };

  
// const ActionCell = ({ row, isPriceListTab = false, isSaleOrderTab = false }) => {
//     const hasPhone = phoneMap.has(Number(row.Retailer_Id));
//     const isLoading = sendingStates[row.Do_Id];
    
//     let tooltipText = "Send Invoice via WhatsApp";
//     if (isPriceListTab) tooltipText = "Send Price List via WhatsApp";
//     if (isSaleOrderTab) tooltipText = "Send Sale Order via WhatsApp";
    
//     const handleClick = async () => {
//         if (isSaleOrderTab) {
//             await sendSaleOrderWhatsApp(row, true);
//         } else if (isPriceListTab) {
//             await sendPriceListWhatsApp(row);
//         } else {
//             await sendSaleInvoiceWhatsApp(row);
//         }
//     };
    
//     return (
//         <Box sx={{ display: 'flex', gap: 0.5 }}>
//             <Tooltip title={hasPhone ? tooltipText : "No phone number available"}>
//                 <span>
//                     <IconButton
//                         size="small"
//                         onClick={handleClick}
//                         disabled={!hasPhone || isLoading}
//                         color={hasPhone ? "success" : "default"}
//                     >
//                         {isLoading ? <CircularProgress size={20} /> : <WhatsAppIcon fontSize="small" />}
//                     </IconButton>
//                 </span>
//             </Tooltip>
//         </Box>
//     );
// };

   
//     const baseColumns = [
//         {
//             Field_Name: "Select",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: ({ row }) => {
//                 const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(toNumber(row.Do_Id));
//                 return (
//                     <Checkbox
//                         onFocus={(e) => e.target.blur()}
//                         checked={isSelected}
//                         onChange={() => {
//                             if (isSelected) {
//                                 setMultipleCostCenterUpdateValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.Do_Id)),
//                                 }));
//                                 setMultipleStaffRemoveValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.Do_Id)),
//                                 }));
//                             } else {
//                                 setMultipleCostCenterUpdateValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: [...prev.Do_Id, toNumber(row.Do_Id)],
//                                 }));
//                                 setMultipleStaffRemoveValues((prev) => ({
//                                     ...prev,
//                                     Do_Id: [...prev.Do_Id, toNumber(row.Do_Id)],
//                                 }));
//                             }
//                         }}
//                     />
//                 );
//             },
//         },
//         createCol("Do_Inv_No", "string", "Invoice"),
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
//                 const phone = phoneMap.get(Number(row.Retailer_Id));
//                 return (
//                     <span style={{ color: phone ? 'green' : 'red' }}>
//                         {phone || 'No Phone'}
//                     </span>
//                 );
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
//         createCol("Delivery_Status", "string", "Delivery_Status"),
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


//     const priceListColumns = [
//         ...baseColumns,
//         {
//             Field_Name: "Action",
//             isVisible: 1,
//             isCustomCell: true,
//             Cell: (props) => <ActionCell {...props} isPriceListTab={true} />
//         }
//     ];

   
// const saleOrderColumns = [
//     ...baseColumns,
//     {
//         Field_Name: "Action",
//         isVisible: 1,
//         isCustomCell: true,
//         Cell: (props) => <ActionCell {...props} isPriceListTab={false} isSaleOrderTab={true} />
//     }
// ];


//     const sharedButtonArea = (
//         <>
//             <Tooltip title="Select All">
//                 <Checkbox
//                     checked={selectAllCheckBox}
//                     onChange={e => setSelectAllCheckBox(e.target.checked)}
//                     disabled={filteredData.length === 0}
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

//             {viewMode === 'pending' && (
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

//             <input
//                 type="date"
//                 className="cus-inpt w-auto"
//                 value={filters.reqDate}
//                 onChange={(e) => setFilters((prev) => ({ ...prev, reqDate: e.target.value }))}
//                 disabled={isRefreshing}
//             />

//             <IconButton
//                 size="small"
//                 disabled={!filters.docType || !multipleCostCenterUpdateValues.Do_Id.length}
//                 onClick={() => {
//                     setCurrentPrintType(filters.docType);
//                     setMultiPrint({
//                         open: true,
//                         doIds: multipleCostCenterUpdateValues.Do_Id,
//                         docType: filters.docType
//                     });
//                 }}
//             >
//                 <Print />
//             </IconButton>
//         </>
//     );

//     // Shared dialogs
//     const sharedDialogs = (
//         <>
//             {/* Filter Dialog */}
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

//             {/* WhatsApp Dialog */}
//             <Dialog open={whatsappDialog.open} onClose={closeWhatsAppDialog} maxWidth="sm" fullWidth>
//                 <DialogTitle>Send WhatsApp Message</DialogTitle>
//                 <DialogContent>{renderWhatsAppDialogContent()}</DialogContent>
//                 <DialogActions>
//                     <Button onClick={closeWhatsAppDialog} disabled={whatsappDialog.loading}>Cancel</Button>
//                     <Button
//                         variant="contained"
//                         color="success"
//                         startIcon={<WhatsAppIcon />}
//                         disabled={
//                             whatsappDialog.loading ||
//                             (whatsappDialog.method === 'template' && !selectedTemplate) ||
//                             !whatsappDialog.order?.recipientPhone
//                         }
//                     >
//                         {whatsappDialog.loading ? 'Sending...' : 'Send WhatsApp'}
//                     </Button>
//                 </DialogActions>
//             </Dialog>

//             {/* Snackbar */}
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

//     // Render
//     return (
//         <>
//             {/* Tab Header */}
//             <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
//                 <Tabs
//                     value={activeTab}
//                     onChange={(_, newVal) => {
//                         setActiveTab(newVal);
     
//                         setSelectAllCheckBox(false);
//                         setMultipleCostCenterUpdateValues(multipleStaffUpdateInitialValues);
//                         setMultipleStaffRemoveValues(multipleStaffRemoveInitialValues);
//                     }}
//                     textColor="primary"
//                     indicatorColor="primary"
//                 >
//                     <Tab label="Sale Invoice" value="sale_invoice" />
//                     <Tab label="Price List" value="price_list" />
//                     <Tab label="Sale Order" value="sale_order" />
//                 </Tabs>
//             </Box>

//             {activeTab === 'sale_invoice' && (
//                 <FilterableTable
//                     title={viewMode === 'pending' ? "Pending Invoices (with Phone Numbers)" : "Sales Invoice (with Phone Numbers)"}
//                     columns={saleInvoiceColumns}
//                     dataArray={filteredData}
//                     EnableSerialNumber
//                     ButtonArea={sharedButtonArea}
//                 />
//             )}

      
//             {activeTab === 'price_list' && (
//                 <FilterableTable
//                     title={viewMode === 'pending' ? "Pending Price List (with Phone Numbers)" : "Price List (with Phone Numbers)"}
//                     columns={priceListColumns}
//                     dataArray={filteredData}
//                     EnableSerialNumber
//                     ButtonArea={sharedButtonArea}
//                 />
//             )}


//         {activeTab === 'sale_order' && (
//                <FilterableTable
//                    title={viewMode === 'pending' ? "Pending Sale Orders (with Phone Numbers)" : "Sale Orders (with Phone Numbers)"}
//                    columns={saleOrderColumns}
//                    dataArray={filteredData}
//                    EnableSerialNumber
//                    ButtonArea={sharedButtonArea}
//                />
//            )}
//             {sharedDialogs}
//         </>
//     );
// };

// export default Whatsapp;