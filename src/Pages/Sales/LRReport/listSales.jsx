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
import KatchathCopy from "./KatchathCopy/katchathCopy";
import InvoiceTemplate from "./SalesInvPrint/invTemplate";
import DeliverysSlipPrint from "./deliverySlipPrint"
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

const SalesInvoiceListLRReport = ({ loadingOn, loadingOff, AddRights, EditRights, PrintRights, pageID }) => {
    const [salesInvoices, setSalesInvoices] = useState([]);
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
    const tableContainerRef = useRef(null);

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

    const [printInvoice, setPrintInvoice] = useState({
        Do_Id: null,
        Do_Date: null,
        open: false
    });

    const [katchathCopyPrint, setKatchathCopyPrint] = useState({
        Do_Id: null,
        open: false,
    });

    const [deliverySlipPrint, setDeliverySlipPrint] = useState({
        Do_Id: null,
        Do_Date: null,
        open: false
    });

    const [whatsappDialog, setWhatsappDialog] = useState({
        open: false,
        order: null,
        loading: false,
        method: 'template',
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
            { Field_Name: "Do_Inv_No", Fied_Data: "string", ColumnHeader: "Invoice" },
            { Field_Name: "voucherTypeGet", Fied_Data: "string", ColumnHeader: "Voucher" },
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

    const fetchAllInvoices = async (refresh = false) => {
        try {
            if (!refresh) {
                setIsLoading(true);
            } else {
                setIsRefreshing(true);
            }

            setViewMode('normal');

            const data = await fetchLink({
                address: `sales/salesInvoice/lrReport?reqDate=${filters.reqDate}&staffStatus=${filters.staffStatus}`,
                loadingOn,
                loadingOff,
            });

            const invoices = toArray(data.data);

            const processedInvoices = invoices.map(invoice => {
                if (invoice.stockDetails && Array.isArray(invoice.stockDetails)) {
                    const processedStockDetails = invoice.stockDetails.map(item => ({
                        ...item,
                        Alt_Act_Qty: calculateAltActQty(item)
                    }));

                    return {
                        ...invoice,
                        stockDetails: processedStockDetails
                    };
                }
                return invoice;
            });

            setSalesInvoices(processedInvoices);
            setCostTypes(toArray(data?.others?.costTypes));
            setUniqueInvolvedCost(toArray(data?.others?.uniqeInvolvedStaffs));

            if (!hasInitialLoading) {
                setHasInitialLoading(true);
            }
        } catch (error) {
            console.error("Error fetching invoices:", error);
            toast.error("Failed to load invoices");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await DotPeWhatsAppService.fetchTemplates('APPROVED');

            if (response.status && response.data) {
                let templatesData = [];

                if (Array.isArray(response.data)) {
                    templatesData = response.data;
                } else if (response.data.data && Array.isArray(response.data.data)) {
                    templatesData = response.data.data;
                } else if (response.data.templates && Array.isArray(response.data.templates)) {
                    templatesData = response.data.templates;
                }

                if (templatesData.length > 0) {
                    setTemplates(templatesData);


                    templatesData.forEach(template => {
                        const name = template.templateName || template.name || '';

                        if (name.includes('template_text')) {
                            setSelectedTemplate(name);
                        }
                    });
                } else {
                    console.warn('No templates found');
                }
            } else {
                console.warn('Failed to fetch templates:', response.message);
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchPendingInvoices = async () => {
        try {
            setIsLoading(true);
            setViewMode('pending');

            const data = await fetchLink({
                address: `sales/salesInvoice/pendingDetails?reqDate=${filters.reqDate}`,
                loadingOn,
                loadingOff,
            });

            const invoices = toArray(data.data);

            const processedInvoices = invoices.map(invoice => {
                if (invoice.stockDetails && Array.isArray(invoice.stockDetails)) {
                    const processedStockDetails = invoice.stockDetails.map(item => ({
                        ...item,
                        Alt_Act_Qty: calculateAltActQty(item)
                    }));

                    return {
                        ...invoice,
                        stockDetails: processedStockDetails
                    };
                }
                return invoice;
            });

            setSalesInvoices(processedInvoices);

            if (data?.others?.costTypes) {
                setCostTypes(toArray(data?.others?.costTypes));
            }
            if (data?.others?.uniqeInvolvedStaffs) {
                setUniqueInvolvedCost(toArray(data?.others?.uniqeInvolvedStaffs));
            }
        } catch (error) {
            console.error("Error fetching pending invoices:", error);
            toast.error("Failed to load pending invoices");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleViewMode = async () => {
        if (viewMode === 'normal') {
            await fetchPendingInvoices();
        } else {
            await fetchAllInvoices(true);
        }
    };

    const fetchCostCenterData = async () => {
        try {
            const costCenterData = await fetchLink({
                address: "masters/erpCostCenter/dropDown"
            });
            setCostCenterData(toArray(costCenterData.data));
        } catch (error) {
            console.error("Error fetching cost center data:", error);
            toast.error("Failed to load cost center data");
        }
    };

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setIsLoading(true);
                await Promise.all([
                    fetchAllInvoices(),
                    fetchCostCenterData()
                ]);
            } catch (error) {
                console.error("Error fetching initial data:", error);
                toast.error("Failed to load initial data");
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []); // Empty dependency array for initial load only

    // Fetch normal invoices when trigger or staffStatus changes, but only in normal mode
    useEffect(() => {
        if (viewMode === 'normal') {
            fetchAllInvoices(true);
        }
    }, [filters.fetchTrigger, filters.staffStatus, viewMode]);

    // Fetch normal invoices when date changes, but only in normal mode
    useEffect(() => {
        if (viewMode === 'normal' && hasInitialLoading) {
            fetchAllInvoices(true);
        }
    }, [filters.reqDate, viewMode, hasInitialLoading]);

    // Fetch pending invoices when date changes, but only in pending mode
    useEffect(() => {
        if (viewMode === 'pending' && hasInitialLoading) {
            fetchPendingInvoices();
        }
    }, [filters.reqDate, viewMode, hasInitialLoading]);

    useEffect(() => {
        if (multiPrint.open) {
            const timer = setTimeout(() => {
                if (multiPrintRef.current) {
                    setPrintReady(true);
                }
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setPrintReady(false);
        }
    }, [multiPrint.open, multiPrint.doIds, multiPrint.docType]);

    const showSnackbar = (message, severity = "success") => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const closeWhatsAppDialog = () => {
        setWhatsappDialog({
            open: false,
            order: null,
            loading: false,
            method: 'template'
        });
        setSelectedTemplate("");
    };

    const getPDFUrlSimple = (order) => {
        const baseUrl = api;
        const formattedInvoiceNo = order.Do_Inv_No.replace(/_/g, '/');
        const encodedInvoiceNo = btoa(formattedInvoiceNo);

        return `${baseUrl}sales/downloadPdf?Do_Inv_No=${encodedInvoiceNo}`;
    };

    const generateInvoicePDF = async (order, companyId) => {
        try {
            const requestBody = {
                invoiceId: order.Do_Inv_No,
                companyId: companyId,
                invoiceData: {
                    Do_Inv_No: order.Do_Inv_No,
                    Total_Invoice_value: order.Total_Invoice_value || 0,
                    retailerNameGet: order.retailerNameGet || order.Retailer_Name || 'Customer',
                    Do_Date: order.Do_Date || order.So_Date,
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

            if (!companyId) {
                throw new Error('Company ID not found');
            }

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

                return {
                    pdfUrl: pdfUrl,
                    token: response.data.token,
                    fileName: response.data.fileName
                };
            } else {
                throw new Error(response.message || 'Failed to generate PDF');
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            setPdfGeneration({
                loading: false,
                pdfUrl: null,
                error: error.message
            });
            throw error;
        }
    };

    const handleWhatsAppClick = async (order) => {
        try {
            setWhatsappDialog({
                open: true,
                order: order,
                loading: true,
                method: 'pdf-link'
            });

            const pdfData = await generateAndStorePDF(order);
            const recipientPhone = await getRecipientPhone(order);

            if (!recipientPhone) {
                showSnackbar('Customer phone number not found', 'error');
                closeWhatsAppDialog();
                return;
            }

            setWhatsappDialog({
                open: true,
                order: {
                    ...order,
                    recipientPhone,
                    generatedPdfUrl: pdfData.pdfUrl,
                    pdfToken: pdfData.token,
                    pdfFileName: pdfData.fileName
                },
                loading: false,
                method: 'pdf-link'
            });
        } catch (error) {
            console.error('Error in handleWhatsAppClick:', error);
            showSnackbar(`Failed to prepare PDF: ${error.message}`, 'error');
            closeWhatsAppDialog();
        }
    };

    const sendWhatsAppMessage = async () => {
        const { order, method } = whatsappDialog;
        setWhatsappDialog(prev => ({ ...prev, loading: true }));
        try {
            const pdfUrl = getPDFUrlSimple(order);
            const mainOrder = order.ConvertedInvoice?.[0] || order;
            const invoiceNo = order.Do_Inv_No || 'N/A';
            const customerName = order.retailerNameGet || order.Retailer_Name || 'Customer';
            const formattedDate = new Date(mainOrder.Do_Date || order.Do_Date).toLocaleDateString('en-GB');
            const totalAmount = (mainOrder.Total_Invoice_value || order.Total_Invoice_value || 0).toFixed(2);

            try {
                const testResponse = await fetch(pdfUrl, { method: 'HEAD' });
            } catch (testError) {
                console.warn('PDF URL test warning:', testError.message);
            }
            //  const data=downloadInvoicePDF(invoiceNo);

            const payload = {
                template: {
                    name: "template_text",
                    language: "en"
                },
                source: "crm",
                // wabaNumber: "919944888054",
                wabaNumber: Dot_Pe_Number,
                recipients: [`91${order.recipientPhone}`],
                clientRefId: `invoice_${invoiceNo.replace(/\//g, '_')}_${Date.now()}`,
                params: {
                    // header: `http://192.168.1.39:9001/uploads/invoices/1/${invoiceNo}.pdf`, 
                    body: [
                        `${customerName}`,
                        `${invoiceNo}`,
                        `${formattedDate}`,
                        `${totalAmount}`,
                        'SM TRADERS',
                        `${pdfUrl}`
                    ]
                }
            };

            const response = await DotPeWhatsAppService.sendTemplateMessage(payload);

            if (response?.status) {
                showSnackbar('WhatsApp message sent successfully!', 'success');
                closeWhatsAppDialog();
            } else {
                console.error('WhatsApp API error:', response);
                throw new Error(response?.message || 'Failed to send message');
            }

        } catch (error) {
            console.error('Error sending WhatsApp:', error);
            showSnackbar(`Failed to send message: ${error.message}`, 'error');
            setWhatsappDialog(prev => ({ ...prev, loading: false }));
        }
    };

    const renderWhatsAppDialogContent = () => {
        const { order, method } = whatsappDialog;

        return (
            <Box>
                <Box mb={2}>
                    <Typography variant="subtitle2" color="textSecondary">
                        Order: <strong>{order?.Do_Inv_No}</strong>
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                        Customer: <strong>{order?.retailerNameGet}</strong>
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                        Phone: <strong>{order?.Party_Mobile_1 || order?.recipientPhone}</strong>
                    </Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                        Amount: <strong>₹{NumberFormat(order?.Total_Invoice_value)}</strong>
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* PDF Generation Status */}
                {pdfGeneration.loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                        {/* <CircularProgress size={20} /> */}
                        <Typography variant="body2">
                            Generating PDF document...
                        </Typography>
                    </Box>
                )}

                {pdfGeneration.error && (
                    <Alert severity="error" sx={{ my: 2 }}>
                        <Typography variant="body2">
                            Failed to generate PDF: {pdfGeneration.error}
                        </Typography>
                        <Button
                            size="small"
                            onClick={() => generateAndStorePDF(order)}
                            sx={{ mt: 1 }}
                        >
                            Retry PDF Generation
                        </Button>
                    </Alert>
                )}

                {pdfGeneration.pdfUrl && !pdfGeneration.loading && (
                    <Alert severity="success" sx={{ my: 2 }}>
                        <Typography variant="body2" fontWeight="bold">
                            ✓ PDF generated successfully!
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" display="block">
                                File: {pdfGeneration.fileName}
                            </Typography>
                            <Typography variant="caption" display="block">
                                Secure URL generated with token
                            </Typography>


                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => downloadInvoicePDF(
                                    order.Do_Inv_No,
                                    pdfGeneration.fileName
                                )}
                                sx={{ mt: 1 }}
                                startIcon={<Print fontSize="small" />}
                            >
                                Test Download PDF
                            </Button>
                        </Box>
                    </Alert>
                )}

                <Box mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                        Choose sending method:
                    </Typography>
                    <RadioGroup
                        value={method}
                        onChange={(e) => setWhatsappDialog(prev => ({ ...prev, method: e.target.value }))}
                    >
                        <FormControlLabel
                            value="pdf-link"
                            control={<Radio size="small" />}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <span>Send PDF Download Link</span>
                                    {/* {pdfGeneration.pdfUrl && (
                                    // <CheckCircle fontSize="small" color="success" />
                                )} */}
                                </Box>
                            }
                            disabled={!pdfGeneration.pdfUrl && !pdfGeneration.loading}
                        />

                        <FormControlLabel
                            value="pdf-template"
                            control={<Radio size="small" />}
                            label="Send with PDF Template"
                        />

                        <FormControlLabel
                            value="other-template"
                            control={<Radio size="small" />}
                            label="Send with Text Template"
                        />
                    </RadioGroup>
                </Box>

                {method === 'pdf-template' && (
                    <Box>
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Select PDF Template</InputLabel>
                            <MuiSelect
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                                label="Select PDF Template"
                            >
                                <MenuItem value=""><em>Select a PDF template</em></MenuItem>
                                {pdfTemplates.length > 0 ? (
                                    pdfTemplates.map((template) => {
                                        const templateName = template.templateName || template.name;
                                        const eventId = template.eventId || template.id;
                                        return (
                                            <MenuItem key={eventId} value={templateName}>
                                                {templateName} ({template.language || 'en'})
                                                {template.templateStatus && ` - ${template.templateStatus}`}
                                            </MenuItem>
                                        );
                                    })
                                ) : (
                                    <MenuItem disabled>No PDF templates available</MenuItem>
                                )}
                            </MuiSelect>
                        </FormControl>
                    </Box>
                )}

                {method === 'other-template' && (
                    <Box>
                        <FormControl fullWidth variant="outlined" size="small">
                            <InputLabel>Select Text Template</InputLabel>
                            <MuiSelect
                                value={selectedTemplate}
                                onChange={(e) => setSelectedTemplate(e.target.value)}
                                label="Select Text Template"
                            >
                                <MenuItem value=""><em>Select a text template</em></MenuItem>
                                {otherTemplates.length > 0 ? (
                                    otherTemplates.map((template) => {
                                        const templateName = template.templateName || template.name;
                                        const eventId = template.eventId || template.id;
                                        return (
                                            <MenuItem key={eventId} value={templateName}>
                                                {templateName} ({template.language || 'en'})
                                            </MenuItem>
                                        );
                                    })
                                ) : (
                                    <MenuItem disabled>No text templates available</MenuItem>
                                )}
                            </MuiSelect>
                        </FormControl>
                    </Box>
                )}

                {(selectedTemplate && method.includes('template')) && (
                    <Box mt={3} p={2} border={1} borderColor="divider" borderRadius={1}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                            Preview:
                        </Typography>
                        <Typography variant="body2">
                            <strong>Template:</strong> {selectedTemplate}<br />
                            <strong>Invoice:</strong> {order?.Do_Inv_No}<br />
                            <strong>Customer:</strong> {order?.retailerNameGet}<br />
                            <strong>Amount:</strong> ₹{NumberFormat(order?.Total_Invoice_value)}
                            {pdfGeneration.pdfUrl && (
                                <>
                                    <br />
                                    <strong>PDF URL:</strong> Will be included in message
                                </>
                            )}
                        </Typography>
                    </Box>
                )}

                {method === 'pdf-link' && pdfGeneration.pdfUrl && (
                    <Box mt={3} p={2} border={1} borderColor="divider" borderRadius={1}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                            PDF Link Preview:
                        </Typography>
                        <Typography variant="body2">
                            The customer will receive a WhatsApp message with a secure link to download the PDF invoice.
                            <br /><br />
                            <strong>Invoice PDF Details:</strong>
                            <br />• File: {pdfGeneration.fileName}
                            <br />• Secure encrypted link
                            <br />• Valid for 7 days
                            <br />• Professional invoice format
                        </Typography>
                    </Box>
                )}
            </Box>
        );
    };

    const getRecipientPhone = async (order) => {
        try {
            const response = await fetchLink({
                address: `masters/getlolDetails`
            });

            if (response && response.success && response.data) {
                const retailerData = response.data.find(item =>
                    Number(item.Ret_Id) === Number(order?.Retailer_Id)
                );

                return retailerData?.Party_Mobile_1 || order.Customer_Phone;
            }
            return order.Customer_Phone;
        } catch (error) {
            console.error('Error fetching recipient phone:', error);
            return order.Customer_Phone;
        }
    };

    const selectedTotals = useMemo(() => {
        const selectedIds = multipleCostCenterUpdateValues.Do_Id;

        if (!selectedIds.length) {
            return { billQty: 0, altActQty: 0 };
        }

        let billQty = 0;
        let altActQty = 0;

        salesInvoices
            .filter(inv => selectedIds.includes(toNumber(inv.Do_Id)))
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

    // const fetchSalesInvoices = () => setFilters((pre) => ({ ...pre, fetchTrigger: pre.fetchTrigger + 1 }));

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

    const onClosePrintDialog = () => setPrintInvoice((prev) => ({ Do_Id: null, Do_Date: null, open: false }));

    const onCloseKatchathDialog = () => setKatchathCopyPrint((prev) => ({ Do_Id: null, open: false }));

    const onCloseDeliverySlipDialog = () => setDeliverySlipPrint((prev) => ({ Do_Id: null, Do_Date: null, open: false }));

    const onChangeEmployee = (invoice, selectedOptions, costType) => {
        setFilters((prev) => {
            const updatedInvolvedStaffs = toArray(prev.selectedInvoice?.involvedStaffs)
                .filter((emp) => !isEqualNumber(emp.Emp_Type_Id, costType.Cost_Category_Id))
                .concat(selectedOptions);

            return {
                ...prev,
                selectedInvoice: {
                    ...invoice,
                    involvedStaffs: updatedInvolvedStaffs,
                },
            };
        });
    };

    const fetchSalesInvoices = () => {
        if (viewMode === 'pending') {
            fetchPendingInvoices();
        } else {
            setFilters((pre) => ({ ...pre, fetchTrigger: pre.fetchTrigger + 1 }));
        }
    };

    const getPdfDownloadUrl = (invoiceId, token) => {
        const baseUrl = api;
        const cleanInvoiceNo = invoiceId.replace(/\//g, '_');
        const pdfParam = `${cleanInvoiceNo}`;
        const url = `${baseUrl}sales/downloadPdf?Do_Inv_No=${pdfParam}`;

        return url;
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

            const day = String(istDate.getUTCDate()).padStart(2, '0');
            const month = String(istDate.getUTCMonth() + 1).padStart(2, '0');
            const year = istDate.getUTCFullYear();
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
            const selectedInvoices = salesInvoices.filter(inv =>
                selectedIds.includes(toNumber(inv.Do_Id))
            );
            const excelData = [];
            selectedInvoices.forEach((invoice, index) => {
                const mainRow = {
                    'S.No': index + 1,
                    'Invoice No': invoice.Do_Inv_No || '',
                    'Created': convertToISTShort(invoice.createdOn),
                    'Voucher Type': invoice.voucherTypeGet || '',
                    'Customer': invoice.retailerNameGet || '',
                    'Bill Qty': invoice.stockDetails ?
                        invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0) : 0,
                    'Alt Act Qty': invoice.stockDetails ?
                        invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Alt_Act_Qty) || 0), 0) : 0,
                    'Narration': invoice.Narration || '',
                    'Total Amount': invoice.Total_Invoice_value || 0,
                    'Delivery Status': invoice.Delivery_Status || '',
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
            XLSX.utils.book_append_sheet(wb, ws, "Invoices");
            const fileName = `Invoices_${viewMode}_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);

            toast.success(`Downloaded ${selectedIds.length} invoices as Excel`);
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
            toast.warning("Please select at least one invoice to download");
            return;
        }
        setDownloadLoading(true);
        handleDownloadClose();
        try {
            const selectedInvoices = salesInvoices.filter(inv =>
                selectedIds.includes(toNumber(inv.Do_Id))
            );
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });
            const tableData = [];
            selectedInvoices.forEach((invoice, index) => {
                const row = [
                    index + 1, // S.No
                    invoice.Do_Inv_No || 'N/A',
                    invoice.Do_Date ? invoice.Do_Date.split('T')[0] : '',
                    invoice.createdOn || '',
                    invoice.voucherTypeGet || '',
                    invoice.retailerNameGet || '',
                    invoice.Retailer_GSTIN || '',
                    `₹${NumberFormat(invoice.Total_Invoice_value || 0)}`,
                    invoice.stockDetails ?
                        invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Bill_Qty) || 0), 0) : 0,
                    invoice.stockDetails ?
                        invoice.stockDetails.reduce((sum, item) => sum + (Number(item.Alt_Act_Qty) || 0), 0) : 0,
                    invoice.Narration || '',
                    invoice.Delivery_Status || '',
                ];
                // Add cost type columns
                costTypes
                    .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
                    .forEach(costType => {
                        const names = getCostTypeEmployees(invoice, costType.Cost_Category_Id).join(", ");
                        row.push(names || '-');
                    });

                tableData.push(row);
            });

            // Define table columns
            const tableColumns = [
                "S.No",
                "Invoice No",
                "Invoice Date",
                "Created On",
                "Voucher Type",
                "Customer",
                "Customer GST",
                "Total Amount",
                "Bill Qty",
                "Alt Act Qty",
                "Narration",
                "Delivery Status",
                ...costTypes
                    .filter((costType) => uniqueInvolvedCost.includes(toNumber(costType.Cost_Category_Id)))
                    .map(costType => costType.Cost_Category)
            ];

            // Add title
            doc.setFontSize(16);
            doc.setTextColor(40, 40, 40);
            doc.text(`Invoices Report - ${viewMode === 'pending' ? 'Pending' : 'Sales'}`, 14, 15);

            // Add generation date and summary
            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 280, 10, { align: 'right' });
            doc.text(`Total Invoices: ${selectedIds.length}`, 14, 22);
            doc.text(`Date Range: ${filters.reqDate}`, 14, 27);

            // Generate the table
            doc.autoTable({
                startY: 32,
                head: [tableColumns],
                body: tableData,
                theme: 'grid',
                styles: {
                    fontSize: 7,
                    cellPadding: 2,
                    overflow: 'linebreak',
                    cellWidth: 'wrap'
                },
                headStyles: {
                    fillColor: [66, 66, 66],
                    textColor: 255,
                    fontStyle: 'bold',
                    halign: 'center'
                },
                columnStyles: {
                    0: { cellWidth: 10 }, // S.No
                    1: { cellWidth: 25 }, // Invoice No
                    2: { cellWidth: 20 }, // Invoice Date
                    3: { cellWidth: 20 }, // Created On
                    4: { cellWidth: 15 }, // Voucher Type
                    5: { cellWidth: 30 }, // Customer
                    6: { cellWidth: 25 }, // Customer GST
                    7: { cellWidth: 20, halign: 'right' }, // Total Amount
                    8: { cellWidth: 15, halign: 'right' }, // Bill Qty
                    9: { cellWidth: 15, halign: 'right' }, // Alt Act Qty
                    10: { cellWidth: 25 }, // Narration
                    11: { cellWidth: 15 }, // Delivery Status
                },
                margin: { left: 10, right: 10 },
                didDrawPage: (data) => {
                    // Add page number at the bottom
                    doc.setFontSize(8);
                    doc.setTextColor(150, 150, 150);
                    doc.text(
                        `Page ${data.pageNumber} of ${doc.internal.getNumberOfPages()}`,
                        data.settings.margin.left,
                        doc.internal.pageSize.height - 10
                    );
                }
            });

            // Save PDF
            const fileName = `Invoices_${viewMode}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(fileName);

            toast.success(`Downloaded ${selectedIds.length} invoices as PDF`);
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error(`Failed to download PDF: ${error.message}`);
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleDownloadClose = () => {
        setDownloadAnchorEl(null);
    };

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
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data.message);
                    onCloseAssignDialog();
                    if (viewMode === 'pending') {
                        fetchPendingInvoices();
                    } else {
                        fetchSalesInvoices();
                    }
                } else {
                    toast.error(data.message);
                }
            })
            .catch((e2) => console.log(e2));
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
                if (viewMode === 'pending') {
                    fetchPendingInvoices();
                } else {
                    fetchSalesInvoices();
                }
            } else {
                toast.error(data.message);
            }
        }).catch((e) => console.log(e));
    };

    useEffect(() => {
        applyFilters();
    }, [columnFilters, salesInvoices, filterColumns]);

    const handleFilterChange = (column, value) => {
        setColumnFilters((prevFilters) => ({
            ...prevFilters,
            [column]: value,
        }));
    };

    const applyFilters = () => {
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
    };

    const handleMultiPrint = useReactToPrint({
        content: () => multiPrintRef.current,
        documentTitle: "Multiple Documents",
        pageStyle: currentPrintType === 'delivery_slip' ? `
        @page {
            margin: 0.7cm 0 0 0;
            size: auto;
        }
        html, body {
            margin: 0;
            padding: 0;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        @media print {
            body > * {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            .no-print {
                display: none !important;
            }
        }
    ` : currentPrintType === 'sales_invoice' ? `
        @page {
            size: A5 landscape;
            margin: 0;
        }
        html, body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        @media print {
            body > * {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            .no-print {
                display: none !important;
            }
        }
    ` : currentPrintType === 'katchath' ? `
        @page {
            margin: 0.6cm;
            size: auto;
        }
        html, body {
            margin: 0;
            padding: 0;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        @media print {
            body > * {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            .no-print {
                display: none !important;
            }
        }
    ` : `
        @page {
            margin: 0.6cm;
            size: auto;
        }
        html, body {
            margin: 0;
            padding: 0;
        }
        body {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        @media print {
            body > * {
                margin-left: 0 !important;
                margin-right: 0 !important;
            }
            .no-print {
                display: none !important;
            }
        }
    `,
    });

    const renderFilter = (column) => {
        const { Field_Name, Fied_Data, ColumnHeader } = column;

        if (Fied_Data === "number") {
            return (
                <div className="d-flex justify-content-between px-2">
                    <input
                        placeholder="Min"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.min ?? ""}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: "range",
                                ...columnFilters[Field_Name],
                                min: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                        }
                    />
                    <input
                        placeholder="Max"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.max ?? ""}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: "range",
                                ...columnFilters[Field_Name],
                                max: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                        }
                    />
                </div>
            );
        }

        if (Fied_Data === "date") {
            return (
                <div className="d-flex justify-content-between px-2">
                    <input
                        placeholder="Start Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.value?.start ?? ""}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: "date",
                                value: { ...columnFilters[Field_Name]?.value, start: e.target.value || undefined },
                            })
                        }
                    />
                    <input
                        placeholder="End Date"
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={columnFilters[Field_Name]?.value?.end ?? ""}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: "date",
                                value: { ...columnFilters[Field_Name]?.value, end: e.target.value || undefined },
                            })
                        }
                    />
                </div>
            );
        }

        if (Fied_Data === "string") {
            const rawValues =
                typeof column.getFilterValues === "function"
                    ? salesInvoices.flatMap((item) => column.getFilterValues(item) || [])
                    : salesInvoices.map((item) => item[Field_Name]);

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
                if (viewMode === 'pending') {
                    fetchPendingInvoices();
                } else {
                    fetchSalesInvoices();
                }
            } else {
                toast.error(data.message);
            }
        }).catch((e) => console.log(e));
    };

    useEffect(() => {
        if (selectAllCheckBox) {
            const allDoIds = filteredData.map(item => toNumber(item.Do_Id));
            setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: allDoIds }));
            setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: allDoIds }));
        } else {
            setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: [] }));
            setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: [] }));
        }
    }, [selectAllCheckBox, filteredData]);

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

    if (isLoading && !hasInitialLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div className="text-muted">
                        Loading {viewMode === 'pending' ? 'Pending' : 'Sales'} Invoices...
                    </div>
                </Box>
            </div>
        );
    }

    // Add this near your other functions
    const refreshData = () => {
        if (viewMode === 'pending') {
            fetchPendingInvoices();
        } else {
            fetchAllInvoices(true);
        }
    };

    return (
        <>
            <FilterableTable
                title={viewMode === 'pending' ? "Pending Invoices" : "Sales Invoice"}
                columns={[
                    {
                        Field_Name: "Select",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(toNumber(row.Do_Id));
                            return (
                                <Checkbox
                                    onFocus={(e) => {
                                        e.target.blur();
                                    }}
                                    checked={isSelected}
                                    onChange={() => {
                                        if (isSelected) {
                                            setMultipleCostCenterUpdateValues((prev) => ({
                                                ...prev,
                                                Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.Do_Id)),
                                            }));
                                            setMultipleStaffRemoveValues((prev) => ({
                                                ...prev,
                                                Do_Id: prev.Do_Id.filter((item) => !isEqualNumber(item, row.Do_Id)),
                                            }));
                                        } else {
                                            setMultipleCostCenterUpdateValues((prev) => ({
                                                ...prev,
                                                Do_Id: [...prev.Do_Id, toNumber(row.Do_Id)],
                                            }));
                                            setMultipleStaffRemoveValues((prev) => ({
                                                ...prev,
                                                Do_Id: [...prev.Do_Id, toNumber(row.Do_Id)],
                                            }));
                                        }
                                    }}
                                />
                            );
                        },
                    },
                    createCol("Do_Inv_No", "string", "Invoice"),
                    {
                        Field_Name: "",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            return row?.createdOn ? LocalDateWithTime(row?.createdOn) : "";
                        },
                    },
                    createCol("voucherTypeGet", "string", "Voucher"),
                    createCol("retailerNameGet", "string", "Customer"),
                    {
                        Field_Name: "BillQty",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            if (row.stockDetails && row.stockDetails.length > 0) {
                                return row.stockDetails.reduce((sum, item) =>
                                    sum + (Number(item.Bill_Qty) || 0), 0
                                );
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
                            RoundNumber(toArray(row.stockDetails).reduce(
                                (s, i) => s + toNumber(i.Alt_Act_Qty),
                                0
                            ))
                    },
                    createCol("Narration", "string", "Narration"),
                    ...costTypeColumns,
                    createCol("Delivery_Status", "string", "Delivery_Status"),
                    {
                        Field_Name: "Action",
                        isVisible: 1,
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            return (
                                <ButtonActions
                                    buttonsData={[
                                        {
                                            name: "Add Employee",
                                            onclick: () => setFilters((prev) => ({ ...prev, assignDialog: true, selectedInvoice: row })),
                                            icon: <PersonAdd fontSize="small" color="primary" />,
                                            disabled: !AddRights && !EditRights,
                                        },
                                        {
                                            name: "Print Invoice",
                                            onclick: () => {
                                                setPrintInvoice({ Do_Id: row.Do_Id, Do_Date: row.Do_Date, open: true })
                                            },
                                            icon: <Print fontSize="small" color="primary" />,
                                            disabled: !PrintRights,
                                        },
                                        {
                                            name: "Delivery Slip",
                                            onclick: () => {
                                                setDeliverySlipPrint({ Do_Id: row.Do_Id, Do_Date: row.Do_Date, open: true })
                                            },
                                            icon: <Print fontSize="small" color="primary" />,
                                            disabled: !PrintRights,
                                        },
                                        {
                                            name: "Katchath Copy",
                                            onclick: () => {
                                                setKatchathCopyPrint({ Do_Id: row.Do_Id, open: true })
                                            },
                                            icon: <Print fontSize="small" color="primary" />,
                                            disabled: !PrintRights,
                                        },
                                        {
                                            name: "Send WhatsApp",
                                            onclick: () => {

                                                handleWhatsAppClick(row);
                                            },
                                            icon: <WhatsAppIcon fontSize="small" color="success" />,
                                            disabled: false,
                                        }
                                    ]}
                                />
                            )
                        }
                    },
                ]}
                dataArray={filteredData}
                EnableSerialNumber
                ButtonArea={
                    <>
                        <Tooltip title="Select All">
                            <Checkbox
                                checked={selectAllCheckBox}
                                onChange={e => setSelectAllCheckBox(e.target.checked)}
                            />
                        </Tooltip>

                        <button
                            type="button"
                            className={`btn btn-sm ${viewMode === 'pending' ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={toggleViewMode}
                            disabled={isRefreshing}
                            style={{
                                marginRight: '8px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <HourglassEmpty fontSize="small" style={{ marginRight: '4px' }} />
                            {viewMode === 'pending' ? "New Invoices" : "Pending Invoice"}
                        </button>

                        <IconButton
                            size="small"
                            onClick={() => setFilters((prev) => ({ ...prev, multipleStaffUpdateDialog: true }))}
                            disabled={!multipleCostCenterUpdateValues.Do_Id.length}
                        >
                            <PersonAdd fontSize="small" />
                        </IconButton>

                        <IconButton
                            size="small"
                            onClick={() => setFilters((prev) => ({ ...prev, multipleStaffRemoveDialog: true }))}
                            disabled={!multipleStaffRemoveValues.Do_Id.length}
                        >
                            <PersonRemoveIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                            size="small"
                            onClick={() => setFilters((prev) => ({ ...prev, filterDialog: true }))}
                            disabled={isRefreshing}
                        >
                            <FilterAlt />
                        </IconButton>

                        <IconButton
                            size="small"
                            onClick={() => {
                                refreshData(); // Use the refresh function
                            }}
                            disabled={isRefreshing}
                        >
                            <Search />
                        </IconButton>
                        {viewMode === 'pending' && (
                            <>

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
                                            <ListItemIcon>
                                                <TableChart fontSize="small" color="success" />
                                            </ListItemIcon>
                                            <ListItemText>Download as Excel</ListItemText>
                                        </MenuItem>
                                        <MenuItem onClick={downloadSelectedAsPDF} disabled={downloadLoading}>
                                            <ListItemIcon>
                                                <PictureAsPdf fontSize="small" color="error" />
                                            </ListItemIcon>
                                            <ListItemText>Download as PDF</ListItemText>
                                        </MenuItem>
                                    </Menu>
                                </div>
                            </>
                        )}

                        {/* Date picker - visible in both modes */}
                        <input
                            type="date"
                            className="cus-inpt w-auto"
                            value={filters.reqDate}
                            onChange={(e) => setFilters((prev) => ({ ...prev, reqDate: e.target.value }))}
                            disabled={isRefreshing}
                        />

                        <IconButton
                            size="small"
                            disabled={
                                !filters.docType || !multipleCostCenterUpdateValues.Do_Id.length
                            }
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

                        <select
                            className="cus-inpt w-auto rounded-5 border-0"
                            disabled={!multipleCostCenterUpdateValues.Do_Id.length}
                            value={filters.docType}
                            onChange={(e) => {
                                const selectedIndex = e.target.selectedIndex;
                                const selectedText = e.target.options[selectedIndex].text;
                                setFilters((prev) => ({
                                    ...prev,
                                    docType: e.target.value,
                                    docTypeLabel: selectedText,
                                }));
                            }}
                        >
                            <option value="">SELECT TYPE</option>
                            <option value="sales_invoice">SALES INVOICE</option>
                            <option value="katchath">KATCHATH</option>
                            <option value="delivery_slip">DELIVERY SLIP</option>
                        </select>

                        {viewMode === 'normal' && (<select
                            className="cus-inpt w-auto rounded-5 border-0"
                            value={filters.staffStatus}
                            onChange={(e) => {
                                setFilters((prev) => ({
                                    ...prev,
                                    staffStatus: Number(e.target.value)
                                }));
                            }}
                        >
                            <option value="1">ALL INVOICES</option>
                            <option value="0">INCOMPLETED INVOICES</option>
                        </select>)}

                        {viewMode === 'pending' && (
                            <span className="ms-2 fw-bold text-primary">
                                Viewing Pending Invoices ({salesInvoices.length} found)
                            </span>
                        )}

                        {multipleCostCenterUpdateValues.Do_Id.length > 0 && (
                            <div className="d-flex gap-4 mb-0 p-0">
                                <div>
                                    <strong>Total Bill Qty:</strong>{" "}
                                    {selectedTotals.billQty}
                                </div>
                                <div>
                                    <strong>Total Alt Act Qty:</strong>{" "}
                                    {selectedTotals.altActQty}
                                </div>
                            </div>
                        )}
                    </>
                }
            />

            {/* Assign dialog */}
            <Dialog open={filters.assignDialog} onClose={onCloseAssignDialog} maxWidth="lg" fullWidth>
                <DialogTitle>
                    Assign Cost Centers: <span className="text-primary">{filters.selectedInvoice?.Do_Inv_No}</span>
                </DialogTitle>
                <form onSubmit={postAssignCostCenters}>
                    <DialogContent>
                        <div className="row">
                            {costTypes
                                .filter(
                                    (costType) =>
                                        !["Broker", "Transport"].some((keyword) => String(costType?.Cost_Category).includes(keyword))
                                )
                                .map((costType, index) => {
                                    const invoiceEmployee = toArray(filters.selectedInvoice?.involvedStaffs);
                                    const empCostType = invoiceEmployee
                                        .filter((emp) => isEqualNumber(emp.Emp_Type_Id, costType.Cost_Category_Id))
                                        .map((emp) => ({ value: emp.Emp_Id, label: emp.Emp_Name }));

                                    return (
                                        <div className="col-lg-4 col-md-6 p-2" key={index}>
                                            <label>{costType.Cost_Category}</label>
                                            <Select
                                                value={empCostType}
                                                isMulti
                                                styles={customSelectStyles}
                                                options={costCenterData}
                                                onChange={(e) => {
                                                    const values = e.map((option) => ({
                                                        Do_Id: filters?.selectedInvoice?.Do_Id,
                                                        Emp_Id: option.value,
                                                        Emp_Name: option.label,
                                                        Emp_Type_Id: costType.Cost_Category_Id,
                                                        Involved_Emp_Type: costType.Cost_Category,
                                                    }));
                                                    onChangeEmployee(filters.selectedInvoice, values, costType);
                                                }}
                                                placeholder={`Select ${costType.Cost_Category}`}
                                                filterOption={reactSelectFilterLogic}
                                                menuPortalTarget={document.body}
                                            />
                                        </div>
                                    );
                                })}

                            <div className="col-lg-4 col-md-6 p-2 d-flex align-items-end">
                                <input
                                    className="form-check-input shadow-none pointer mx-2"
                                    style={{ padding: "0.7em" }}
                                    type="checkbox"
                                    id="removeFromList"
                                    checked={isEqualNumber(filters.selectedInvoice?.staffInvolvedStatus, 1)}
                                    onChange={() => {
                                        setFilters((pre) => ({
                                            ...pre,
                                            selectedInvoice: {
                                                ...pre.selectedInvoice,
                                                staffInvolvedStatus: isEqualNumber(pre.selectedInvoice?.staffInvolvedStatus, 1) ? 0 : 1,
                                            },
                                        }));
                                    }}
                                />
                                <label htmlFor="removeFromList" className="fw-bold">
                                    Remove invoice from this page
                                </label>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onCloseAssignDialog} variant="outlined">
                            Close
                        </Button>
                        <Button variant="contained" type="submit">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Filter dialog */}
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
                    <Button onClick={onCloseFilterDialog} variant="outlined">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Multiple update dialog */}
            <Dialog
                open={filters.multipleStaffUpdateDialog}
                onClose={onCloseMultipleUpdateCostCategoryDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Update Cost Category</DialogTitle>
                <DialogContent>
                    <div className="py-2">
                        <label>Cost Category</label>
                        <Select
                            value={multipleCostCenterUpdateValues.CostCategory}
                            styles={customSelectStyles}
                            options={costTypes
                                .filter(
                                    (costType) =>
                                        !["Broker", "Transport"].some((keyword) => String(costType?.Cost_Category).includes(keyword))
                                )
                                .map((costType) => ({
                                    value: costType.Cost_Category_Id,
                                    label: costType.Cost_Category,
                                }))}
                            onChange={(e) => setMultipleCostCenterUpdateValues((prev) => ({ ...prev, CostCategory: e }))}
                            placeholder="Select Cost Category"
                            filterOption={reactSelectFilterLogic}
                            menuPortalTarget={document.body}
                        />
                    </div>

                    <div className="py-2">
                        <label>Staff</label>
                        <Select
                            value={multipleCostCenterUpdateValues.involvedStaffs}
                            isMulti
                            styles={customSelectStyles}
                            options={costCenterData}
                            onChange={(e) => setMultipleCostCenterUpdateValues((prev) => ({ ...prev, involvedStaffs: e }))}
                            placeholder="Select Staff"
                            filterOption={reactSelectFilterLogic}
                            menuPortalTarget={document.body}
                            closeMenuOnSelect={false}
                        />
                    </div>

                    <div className="py-2">
                        <label>Delivery Status</label>
                        <select
                            className="cus-inpt p-1"
                            onChange={e => setMultipleCostCenterUpdateValues(pre => ({ ...pre, deliveryStatus: e.target.value }))}
                            value={multipleCostCenterUpdateValues.deliveryStatus}
                        >
                            <option value={5}>Pending</option>
                            <option value={7}>Delivered</option>
                            <option value={6}>Return</option>
                             <option value={4}>Canceled</option>
                        </select>
                    </div>

                    <div className="py-2">
                        <input
                            className="form-check-input shadow-none pointer mx-2"
                            style={{ padding: "0.7em" }}
                            type="checkbox"
                            id="removeFromList"
                            checked={isEqualNumber(multipleCostCenterUpdateValues.staffInvolvedStatus, 1)}
                            onChange={() => {
                                setMultipleCostCenterUpdateValues((pre) => ({
                                    ...pre,
                                    staffInvolvedStatus: isEqualNumber(pre.staffInvolvedStatus, 1) ? 0 : 1,
                                }));
                            }}
                        />
                        <label htmlFor="removeFromList" className="fw-bold">
                            Remove invoice from this page
                        </label>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseMultipleUpdateCostCategoryDialog} variant="outlined">
                        Close
                    </Button>
                    <Button variant="contained" onClick={postMultipleCostCenterUpdate} disabled={!saveMultipleInvoiceValidation}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* bill print dialog */}
            <Dialog
                open={printInvoice.open}
                onClose={onClosePrintDialog}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Bill Print Preview</DialogTitle>
                <DialogContent>
                    <InvoiceTemplate
                        Do_Id={printInvoice.Do_Id}
                        Do_Date={printInvoice.Do_Date}
                        loadingOn={loadingOn}
                        loadingOff={loadingOff}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={onClosePrintDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* katchathCopyPrint */}
            <Dialog
                open={katchathCopyPrint.open}
                onClose={onCloseKatchathDialog}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Bill Print Preview</DialogTitle>
                <DialogContent>
                    <KatchathCopy
                        Do_Id={katchathCopyPrint.Do_Id}
                        loadingOn={loadingOn}
                        loadingOff={loadingOff}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={onCloseKatchathDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* delivery slip dialog */}
            <Dialog
                open={deliverySlipPrint.open}
                onClose={onCloseDeliverySlipDialog}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle>Delivery Slip Preview</DialogTitle>
                <DialogContent>
                    <DeliverysSlipPrint
                        Do_Id={deliverySlipPrint.Do_Id}
                        loadingOn={loadingOn}
                        loadingOff={loadingOff}
                    />
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" onClick={onCloseDeliverySlipDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Multiple Staff Remove Dialog */}
            <Dialog
                open={filters.multipleStaffRemoveDialog}
                onClose={onCloseMultipleStaffRemoveDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Remove Staff from Cost Category</DialogTitle>
                <DialogContent>
                    <div className="py-2">
                        <label>Cost Category to Remove</label>
                        <Select
                            value={multipleStaffRemoveValues.CostCategory}
                            styles={customSelectStyles}
                            options={costTypes
                                .filter(
                                    (costType) =>
                                        !["Broker", "Transport"].some((keyword) => String(costType?.Cost_Category).includes(keyword))
                                )
                                .map((costType) => ({
                                    value: costType.Cost_Category_Id,
                                    label: costType.Cost_Category,
                                }))}
                            onChange={(e) => setMultipleStaffRemoveValues((prev) => ({ ...prev, CostCategory: e }))}
                            placeholder="Select Cost Category to Remove"
                            filterOption={reactSelectFilterLogic}
                            menuPortalTarget={document.body}
                        />
                    </div>

                    <div className="py-2">
                        <label>Delivery Status</label>
                        <select
                            className="cus-inpt p-1"
                            onChange={e => setMultipleStaffRemoveValues(pre => ({ ...pre, deliveryStatus: e.target.value }))}
                            value={multipleStaffRemoveValues.deliveryStatus}
                        >
                            <option value={5}>Pending</option>
                            <option value={7}>Delivered</option>
                            <option value={6}>Return</option>
                            <option value={4}>Canceled</option>
                        </select>
                    </div>

                    <div className="py-2">
                        <input
                            className="form-check-input shadow-none pointer mx-2"
                            style={{ padding: "0.7em" }}
                            type="checkbox"
                            id="removeFromListRemove"
                            checked={isEqualNumber(multipleStaffRemoveValues.staffInvolvedStatus, 1)}
                            onChange={() => {
                                setMultipleStaffRemoveValues((pre) => ({
                                    ...pre,
                                    staffInvolvedStatus: isEqualNumber(pre.staffInvolvedStatus, 1) ? 0 : 1,
                                }));
                            }}
                        />
                        <label htmlFor="removeFromListRemove" className="fw-bold">
                            Remove invoice from this page
                        </label>
                    </div>

                    <div className="py-2 text-muted">
                        <small>
                            This will remove all staff members of the selected Cost Category from {multipleStaffRemoveValues.Do_Id.length} selected invoices.
                        </small>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCloseMultipleStaffRemoveDialog} variant="outlined">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={postMultipleStaffRemove}
                        disabled={!removeMultipleInvoiceValidation}
                    >
                        Remove Staff
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Multiple print dialog */}
            <Dialog
                open={multiPrint.open}
                onClose={() => setMultiPrint({ open: false, doIds: [], docType: "" })}
                maxWidth="lg"
                fullWidth
            >
                <DialogContent dividers>
                    <div ref={multiPrintRef}>
                        {multiPrint.docType === "sales_invoice" && (
                            <InvoiceTemplate
                                Do_Ids={multiPrint.doIds}
                                loadingOn={loadingOn}
                                loadingOff={loadingOff}
                                isCombinedPrint={true}
                            />
                        )}

                        {multiPrint.docType === "katchath" && (
                            <KatchathCopy
                                Do_Ids={multiPrint.doIds}
                                loadingOn={loadingOn}
                                loadingOff={loadingOff}
                                isCombinedPrint={true}
                            />
                        )}

                        {multiPrint.docType === "delivery_slip" && (
                            <DeliverysSlipPrint
                                Do_Ids={multiPrint.doIds}
                                loadingOn={loadingOn}
                                loadingOff={loadingOff}
                                isCombinedPrint={true}
                            />
                        )}
                    </div>
                </DialogContent>

                <DialogActions className="no-print">
                    <Button
                        variant="contained"
                        onClick={() => { handleMultiPrint() }}
                        startIcon={<Print />}
                    >
                        Print All
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={() =>
                            setMultiPrint({ open: false, doIds: [], docType: "" })
                        }
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={whatsappDialog.open}
                onClose={closeWhatsAppDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Send WhatsApp Message</DialogTitle>
                <DialogContent>
                    {renderWhatsAppDialogContent()}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={closeWhatsAppDialog}
                        disabled={whatsappDialog.loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={sendWhatsAppMessage}
                        variant="contained"
                        color="success"
                        startIcon={<WhatsAppIcon />}
                        disabled={
                            whatsappDialog.loading ||
                            (whatsappDialog.method === 'template' && !selectedTemplate)
                        }
                    >
                        {whatsappDialog.loading ? 'Sending...' : 'Send WhatsApp'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default SalesInvoiceListLRReport;