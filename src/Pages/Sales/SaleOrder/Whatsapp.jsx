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
    ListItemIcon, ListItemText, LinearProgress, Table, TableHead,
    TableRow, TableCell, TableBody, TableContainer,
} from "@mui/material";
import {
    CheckBox, CheckBoxOutlineBlank, FilterAlt, Print, Search,
    Download, PictureAsPdf, TableChart, ArrowDropDown, Settings,
    Language, Send, SendAndArchive, Close as CloseIcon, Save as SaveIcon,
    Visibility, VisibilityOff, Tune as TuneIcon, Check as CheckIcon,
    WhatsApp as WhatsAppIcon
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { DotPeWhatsAppService } from "../../../Components/dotpeWhatsappService";
import { Dot_Pe_Number } from "../../../encryptionKey";
import api from "../../../API";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { REACT_APP_ASKEVA_TOKEN, REACT_APP_ASKEVA_API_ENDPOINT, print_app } from '../../../encryptionKey';

const ASKEVA_CONFIG = {
    // token: REACT_APP_ASKEVA_TOKEN,
    apiEndpoint: REACT_APP_ASKEVA_API_ENDPOINT,
};

const TAB_TO_WHATSAPP_TYPE = {
    sale_invoice: "Sales_Invoice",
    price_list: "Price_List",
    sale_order: "Sales",
    receipt_list: "Receipt_List",
    outstanding: "Outstanding",
    pending_bills: "Pending_Bills",
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
    outstanding: {
        dotpe: { english: "outstanding", tamil: "outstanding" },
        askeva: { english: "outstanding_en", tamil: "outstanding_thanks" },
    },
    pending_bills: {
        dotpe: { english: "pending_bills", tamil: "pending_bills" },
        askeva: { english: "pending_bills_en", tamil: "pending_bills_thanks" },
    },
};

const LANG_CODE_MAP = { english: "en", tamil: "ta" };

const icon = <CheckBoxOutlineBlank fontSize="small" />;
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

const isValidPhone = (phone) => {
    if (!phone) return false;
    const str = String(phone).trim();
    return str !== "" && 
           str !== "Not Available" && 
           str !== "null" && 
           str !== "undefined" &&
           str !== "NULL" &&
           str !== "NA" &&
           str !== "N/A" &&
           str !== "0" &&
           str !== "0000000000" &&
           str.length >= 10;
};

const getRowKey = (row, tab) => {
    const id = row?.DocumentId ?? row?.Ret_Id ?? row?.Receipt_Id ?? row?.So_Id ?? row?.Do_Id;
    return `${tab}_${id}`;
};

const sendViaAskeva = async ({ phone, templateName, language = "en", bodyParams,evatoken }) => {

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
    const resp = await fetch(`${ASKEVA_CONFIG.apiEndpoint}?token=${evatoken}`, {
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
    const done = sent + failed >= total && total > 0;

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

const WhatsappSettingsDialog = ({ open, onClose, activeTab, onSettingsSaved }) => {
    const [loading, setLoading] = useState(false);
    const [whatsappServices, setWhatsappServices] = useState([]);
    const [whatsappLanguages, setWhatsappLanguages] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState("");
    const [selectedLangId, setSelectedLangId] = useState("");
    const [serviceSelections, setServiceSelections] = useState({});
    const [currentServiceId, setCurrentServiceId] = useState(null);
    const [currentMethodId, setCurrentMethodId] = useState(null);

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
            const types = toArray(typesResp?.data);
            const typeRec = types.find(
                (t) => t.WhatsappType?.toLowerCase() === TAB_TO_WHATSAPP_TYPE[activeTab]?.toLowerCase()
            );
            if (!typeRec) return;
            const response = await fetchLink({ address: `masters/whatsappMethod?WhatsappType_Id=${typeRec.Id}` });
            const methods = toArray(response?.message || response?.data);
            const active = methods.find((m) => toNumber(m.Status) === 1);
            if (active) {
                setCurrentMethodId(active.Id);
                setCurrentServiceId(String(active.Service_Id));
                setSelectedServiceId(String(active.Service_Id));
                setSelectedLangId(String(active.lang_Id || ""));
                setServiceSelections({ [active.Service_Id]: { langId: active.lang_Id, langName: active.language } });
            }
        } catch (e) { console.error("Error fetching current settings:", e); }
    };

    const fetchWhatsappServices = async () => {
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
        if (!selectedLangId) { toast.error("Please select a language"); return; }
        setLoading(true);
        try {
            const typesResp = await fetchLink({ address: "masters/whatsappTypes" });
            const types = toArray(typesResp?.data);
            const typeRec = types.find(
                (t) => t.WhatsappType?.toLowerCase() === TAB_TO_WHATSAPP_TYPE[activeTab]?.toLowerCase()
            );
            if (!typeRec) { toast.error("WhatsApp type not found"); return; }

            const body = {
                Service_Id: parseInt(selectedServiceId),
                Status: 1,
                WhatsappType_Id: typeRec.Id,
                lang_Id: parseInt(selectedLangId),
            };
            const response = await fetchLink({
                address: "masters/whatsappMethod",
                method: currentMethodId ? "PUT" : "POST",
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
                                    const svcId = String(service.Id);
                                    const isActive = currentServiceId === svcId;
                                    const saved = serviceSelections[svcId]?.langName;
                                    return (
                                        <Paper
                                            key={service.Id} variant="outlined"
                                            sx={{
                                                p: 1.5, minWidth: 160, cursor: "pointer",
                                                borderColor: selectedServiceId === svcId ? "primary.main" : "divider",
                                                bgcolor: selectedServiceId === svcId ? "primary.50" : "background.paper",
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
                                        const langId = String(lang.Id);
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

const TransactionDetailsDialog = ({ open, onClose, row, tab, onSend, companyInfo, phoneMap, fromDate, toDate }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    const isOutstanding = tab === "outstanding";

    const apiEndpoint = isOutstanding
        ? `payment/transactions?Acc_Id=${row?.Acc_Id}&fromDate=${fromDate}&toDate=${toDate}`
        : `journal/accountPendingReference?Acc_Id=${row?.Acc_Id}&Fromdate=${fromDate}&Todate=${toDate}`;

    useEffect(() => {
        if (open && row?.Acc_Id && fromDate && toDate) {
            fetchTransactions();
        }
    }, [open, row, fromDate, toDate]);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const response = await fetchLink({
                address: apiEndpoint,
                loadingOn: () => { },
                loadingOff: () => { }
            });

            if (response?.success && response.data) {
                let data = toArray(response.data);
                if (!isOutstanding && data.length > 0 && data[0].voucherId) {
                    data = data.map(item => ({
                        invoice_no: item.voucherNumber,
                        Ledger_Date: item.eventDate,
                        Ledger_Desc: item.dataSource,
                        Particulars: item.dataSource,
                        Credit_Amt: item.accountSide === "Cr" ? item.totalValue : 0,
                        Debit_Amt: item.accountSide === "Dr" ? item.totalValue : 0,
                        BalanceAmount: item.BalanceAmount,
                        narration: item.narration,
                        BillRefNo: item.BillRefNo,
                        totalValue: item.totalValue
                    }));
                }
                setTransactions(data);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast.error("Failed to load transaction details");
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSendAll = async () => {
        setSending(true);
        try {
            let totalAmount = 0;
            if (tab === "pending_bills") {
                totalAmount = transactions.reduce((sum, t) => sum + (t.totalValue || t.Debit_Amt || 0), 0);
            } else {
                totalAmount = row?.Bal_Amount || 0;
                if (transactions.length > 0 && transactions[transactions.length - 1].BalanceAmount) {
                    totalAmount = transactions[transactions.length - 1].BalanceAmount;
                }
            }
            const transactionDetails = transactions.map((t, i) => {
                const date = t.Ledger_Date ? new Date(t.Ledger_Date).toLocaleDateString("en-GB") : "-";
                const amount = NumberFormat(t.totalValue || t.Debit_Amt || 0);
                const narration = t.narration || t.Ledger_Desc || "-";
                const balance = t.BalanceAmount ? NumberFormat(t.BalanceAmount) : "-";
                return `${i + 1}. ${date} - ${t.invoice_no || t.voucherNumber || "-"} - ₹${amount} - Bal: ₹${balance} - ${narration}`;
            }).join("\n");

            await onSend(row, tab, totalAmount, transactionDetails);
            onClose();
        } catch (error) {
            console.error("Error sending WhatsApp message:", error);
            toast.error("Failed to send WhatsApp message");
        } finally {
            setSending(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-GB");
    };

    const formatAmount = (amount) => `₹${NumberFormat(amount || 0)}`;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography variant="h6">
                        {isOutstanding ? "Outstanding Transactions" : "Pending Bills"} - {row?.retailerNameGet || row?.Retailer_Name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Period: {fromDate} to {toDate} | Total Balance: {formatAmount(row?.Bal_Amount || 0)}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small" disabled={sending}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : transactions.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <Typography color="text.secondary">No transactions found for the selected period</Typography>
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>S.No</TableCell>
                                    <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>Date</TableCell>
                                    <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>Invoice No</TableCell>
                                    <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>Particulars</TableCell>
                                    <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }} align="right">Debit (Dr)</TableCell>
                                    <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }} align="right">Credit (Cr)</TableCell>
                                    <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }} align="right">Balance</TableCell>
                                    <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>Narration</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {transactions.map((transaction, idx) => (
                                    <TableRow key={idx} hover>
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell>{formatDate(transaction.Ledger_Date)}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                                {transaction.invoice_no || transaction.voucherNumber || "-"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{transaction.Particulars || transaction.Ledger_Desc || "-"}</TableCell>
                                        <TableCell align="right" sx={{ color: "#d32f2f" }}>
                                            {transaction.Debit_Amt > 0 ? formatAmount(transaction.Debit_Amt) : "-"}
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: "#388e3c" }}>
                                            {transaction.Credit_Amt > 0 ? formatAmount(transaction.Credit_Amt) : "-"}
                                        </TableCell>
                                        <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                            {formatAmount(transaction.BalanceAmount || transaction.Debit_Amt - transaction.Credit_Amt || 0)}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={transaction.narration || transaction.Line_Naration}>
                                                {transaction.narration || transaction.Line_Naration || "-"}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={sending}>Close</Button>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<WhatsAppIcon />}
                    onClick={handleSendAll}
                    disabled={transactions.length === 0 || sending}
                >
                    {sending ? <CircularProgress size={24} /> : "Send via WhatsApp"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const WhatsAppColumnSettings = ({ open, onClose, companyId, onSave, activeTab }) => {
    const [columns, setColumns] = useState([]);
    const [selectedColumns, setSelectedColumns] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");

    useEffect(() => {
        if (open && companyId) {
            fetchColumns();
            loadSavedSettings();
        }
    }, [open, companyId, activeTab]);

    const fetchColumns = async () => {
        setLoading(true);
        try {
            const response = await fetchLink({
                address: `masters/columns/dropDown?company_id=${companyId}`,
                method: "GET",
                loadingOn: () => { },
                loadingOff: () => { }
            });
            if (response?.success && response.data) {
                setColumns(response.data);
            } else {
                toast.error("Failed to load columns");
            }
        } catch (error) {
            console.error("Error fetching columns:", error);
            toast.error("Error loading columns");
        } finally {
            setLoading(false);
        }
    };

    const loadSavedSettings = async () => {
        try {
            const whatsappType = TAB_TO_WHATSAPP_TYPE[activeTab];
            if (!whatsappType) return;
            const response = await fetchLink({
                address: `masters/whatsappFilter?WhatsappType=${whatsappType}&company_id=${companyId}`,
                method: "GET",
                loadingOn: () => { },
                loadingOff: () => { },
            });
            if (response?.success && response.data) {
                const savedColumns = new Set(response.data.map(item => item.Column_Name));
                setSelectedColumns(savedColumns);
            } else {
                setSelectedColumns(new Set());
            }
        } catch (error) {
            console.error("Error loading saved settings:", error);
        }
    };

    const handleColumnToggle = (columnName, isEnabled) => {
        const newSelectedColumns = new Set(selectedColumns);
        if (isEnabled) {
            newSelectedColumns.add(columnName);
        } else {
            newSelectedColumns.delete(columnName);
        }
        setSelectedColumns(newSelectedColumns);
    };

    const handleSelectAll = () => {
        const allColumnNames = columns.map(col => col.ColumnName);
        setSelectedColumns(new Set(allColumnNames));
    };

    const handleClearAll = () => {
        setSelectedColumns(new Set());
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const whatsappType = TAB_TO_WHATSAPP_TYPE[activeTab];
            if (!whatsappType) { toast.error("Invalid tab type"); return; }

            const typesResp = await fetchLink({ address: "masters/whatsappTypes" });
            const types = toArray(typesResp?.data);
            const typeRec = types.find(
                (t) => t.WhatsappType?.toLowerCase() === whatsappType?.toLowerCase()
            );
            if (!typeRec) { toast.error("WhatsApp type not found"); return; }

            const selectedColumnsArray = Array.from(selectedColumns);
            const response = await fetchLink({
                address: "masters/saveWhatsappColumnSettings",
                method: "POST",
                bodyData: {
                    company_id: companyId,
                    whatsapp_type_id: typeRec.Id,
                    whatsapp_type: whatsappType,
                    tab: activeTab,
                    enabled_columns: selectedColumnsArray,
                },
            });

            if (response?.success) {
                toast.success(`Saved ${selectedColumns.size} column settings`);
                if (onSave) onSave(selectedColumnsArray);
                onClose();
            } else {
                toast.error(response?.message || "Failed to save settings");
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    const filteredColumns = columns.filter(column => {
        const matchesSearch = searchTerm === "" ||
            column.ColumnName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            column.Alias_Name?.toLowerCase().includes(searchTerm.toLowerCase());
        let matchesType = true;
        if (filterType === "visible") matchesType = column.Is_Visible === 1;
        else if (filterType === "hidden") matchesType = column.Is_Visible === 0;
        return matchesSearch && matchesType;
    });

    const selectedCount = selectedColumns.size;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { minHeight: "70vh", maxHeight: "90vh", borderRadius: 2 } }}>
            <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="h6" fontWeight="bold">
                            <TuneIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                            WhatsApp Column Settings
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Configure which columns to display in WhatsApp messages for {activeTab?.replace("_", " ").toUpperCase()}
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 2 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                            <TextField
                                fullWidth size="small"
                                placeholder="Search columns by name or alias..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'action.active' }} />,
                                    endAdornment: searchTerm && (
                                        <IconButton size="small" onClick={() => setSearchTerm("")}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    )
                                }}
                            />
                        </Paper>
                        <Box sx={{ maxHeight: "calc(70vh - 280px)", overflowY: "auto" }}>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "grey.50" }}>
                                            <TableCell padding="checkbox" width="50">
                                                <Checkbox
                                                    indeterminate={selectedCount > 0 && selectedCount < columns.length}
                                                    checked={selectedCount === columns.length && columns.length > 0}
                                                    onChange={(e) => e.target.checked ? handleSelectAll() : handleClearAll()}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>Column Name</TableCell>
                                            <TableCell>Alias</TableCell>
                                            <TableCell align="center" width="80">Position</TableCell>
                                            <TableCell align="center" width="80">Status</TableCell>
                                            <TableCell align="center" width="80">Data Type</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredColumns.map((column, index) => (
                                            <TableRow
                                                key={column.Id || index} hover
                                                sx={{ bgcolor: selectedColumns.has(column.ColumnName) ? 'action.hover' : 'inherit', '&:hover': { bgcolor: 'action.selected' } }}
                                                onClick={() => handleColumnToggle(column.ColumnName, !selectedColumns.has(column.ColumnName))}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        checked={selectedColumns.has(column.ColumnName)}
                                                        onChange={(e) => { e.stopPropagation(); handleColumnToggle(column.ColumnName, e.target.checked); }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        size="small" color="primary"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={selectedColumns.has(column.ColumnName) ? "bold" : "normal"}>
                                                        {column.ColumnName}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color={selectedColumns.has(column.ColumnName) ? "text.primary" : "text.secondary"}>
                                                        {column.Alias_Name || column.ColumnName}
                                                    </Typography>
                                                    {column.Alias_Name && column.Alias_Name !== column.ColumnName && (
                                                        <Typography variant="caption" color="text.disabled">(Original: {column.ColumnName})</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip label={column.Position || index + 1} size="small" variant="outlined" sx={{ minWidth: 40 }} />
                                                </TableCell>
                                                <TableCell align="center">
                                                    {column.Is_Visible === 1 ? (
                                                        <Chip label="Visible" size="small" color="success" variant="outlined" icon={<Visibility sx={{ fontSize: 14 }} />} />
                                                    ) : (
                                                        <Chip label="Hidden" size="small" color="default" variant="outlined" icon={<VisibilityOff sx={{ fontSize: 14 }} />} />
                                                    )}
                                                </TableCell>
                                                <TableCell align="center">
                                                    <Chip label={column.Data_Type || "string"} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {filteredColumns.length === 0 && (
                                <Box textAlign="center" p={4}>
                                    <Typography color="text.secondary">
                                        {searchTerm ? `No columns found matching "${searchTerm}"` : "No columns available"}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
                <Button onClick={onClose} disabled={saving} variant="outlined">Cancel</Button>
                <Button onClick={handleSave} variant="contained" color="primary" disabled={loading || saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}>
                    {saving ? "Saving..." : `Save Settings (${selectedCount})`}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// const WhatsAppFilterBar = ({ activeTab, dataSource, columnFilters, setColumnFilters }) => {
//     const [enabledColumns, setEnabledColumns] = useState([]);
//     const [loadingColumns, setLoadingColumns] = useState(false);
//     const [lolColumns, setLolColumns] = useState([]);
//     const [draftFilters, setDraftFilters] = useState(columnFilters);
//     const storage = JSON.parse(localStorage.getItem("user") || "{}");
//     const companyId = storage?.Company_id;

//     useEffect(() => {
//         setDraftFilters(columnFilters);
//     }, [columnFilters]);

//     const hasDraftChanges = JSON.stringify(draftFilters) !== JSON.stringify(columnFilters);

//     const handleApplyFilters = () => {
//         setColumnFilters(draftFilters);
//     };

//     const handleResetDraft = () => {
//         setDraftFilters(columnFilters);
//     };

//     const handleClearAll = () => {
//         setDraftFilters({});
//         setColumnFilters({});
//     };

//     const getValueFromRow = (row, columnName) => {
//         if (!row) return null;
        
//         // Direct match with proper null check
//         if (row[columnName] !== undefined && row[columnName] !== null && row[columnName] !== "") {
//             return row[columnName];
//         }
        
//         // Case insensitive match
//         const lowerColName = columnName.toLowerCase();
//         for (const key in row) {
//             if (key.toLowerCase() === lowerColName) {
//                 const val = row[key];
//                 if (val !== undefined && val !== null && val !== "") {
//                     return val;
//                 }
//             }
//         }
        
//         // Special mappings for common fields with proper null checks
//         const mappings = {
//             'Customer_Phone': ['A1', 'A1_Phone', 'Phone', 'Mobile_No', 'PhoneNumber'],
//             'Alternate_Phone': ['A2', 'Alt_Phone', 'Alternate_Phone'],
//             'Landline_Phone': ['A3', 'Landline', 'Landline_Phone'],
//             'City': ['City', 'District', 'Location', 'City_Name'],
//             'Address': ['Address', 'Party_Address', 'Retailer_Address'],
//             'State': ['State', 'Region', 'State_Name'],
//             'GST_No': ['GST_No', 'GST', 'GSTIN'],
//             'PAN_No': ['PAN_No', 'PAN', 'Pan_Number'],
//             'Bank_Name': ['Bank_Name', 'Bank', 'BankName'],
//             'Owner_Name': ['Owner_Name', 'Owner', 'OwnerName'],
//             'Retailer_Name': ['retailerNameGet', 'Retailer_Name', 'Customer_Name', 'Party_Name', 'Ledger_Name'],
//             'Ret_Code': ['Ret_Code', 'retailerCode', 'Customer_Code', 'Ledger_Tally_Id'],
//             'Pincode': ['Pincode', 'Pin_Code', 'Zip'],
//             'Ledger_Tally_Id': ['Ret_Code', 'retailerCode', 'Customer_Code'],
//             'Ledger_Name': ['retailerNameGet', 'Retailer_Name', 'Customer_Name', 'Party_Name'],
//             'Ledger_Alias': ['Alias', 'Ledger_Alias', 'Customer_Alias']
//         };
        
//         if (mappings[columnName]) {
//             for (const field of mappings[columnName]) {
//                 const val = row[field];
//                 if (val !== undefined && val !== null && val !== "") {
//                     return val;
//                 }
//             }
//         }
        
//         return null;
//     };

//     const getUniqueValues = (columnName) => {
//         if (!dataSource || dataSource.length === 0) return [];
//         const values = new Set();
//         dataSource.forEach(row => {
//             let value = getValueFromRow(row, columnName);
//             if (value !== undefined && value !== null && value !== "") {
//                 if (typeof value === 'object') {
//                     if (value.label) value = value.label;
//                     else if (value.value) value = value.value;
//                     else return;
//                 }
//                 // Skip "Not Available" and similar placeholder values
//                 const strValue = String(value).trim();
//                 if (strValue && 
//                     strValue !== "Not Available" && 
//                     strValue !== "null" && 
//                     strValue !== "undefined" &&
//                     strValue !== "[object Object]" &&
//                     strValue !== "NULL" &&
//                     strValue !== "NA" &&
//                     strValue !== "N/A") {
//                     values.add(strValue);
//                 }
//             }
//         });
//         return Array.from(values).sort();
//     };

//     const formatColumnLabel = (columnName) => {
//         const labels = {
//             'Ledger_Tally_Id': 'Customer Code',
//             'Ledger_Name': 'Customer Name',
//             'Ledger_Alias': 'Customer Alias',
//             'Customer_Phone': 'Phone Number',
//             'Alternate_Phone': 'Alternate Phone',
//             'Landline_Phone': 'Landline Phone',
//             'City': 'City/Location',
//             'Address': 'Address',
//             'Pincode': 'Pincode',
//             'State': 'State',
//             'GST_No': 'GST Number',
//             'PAN_No': 'PAN Number',
//             'Bank_Name': 'Bank Name',
//             'Bank_Account_No': 'Bank Account',
//             'IFSC_Code': 'IFSC Code',
//             'Branch_Name': 'Branch Name',
//             'Owner_Name': 'Owner Name',
//             'LOL_Id': 'LOL ID',
//             'Ret_Id': 'Retailer ID'
//         };
//         return labels[columnName] || columnName.replace(/_/g, " ").replace(/([A-Z])/g, " $1").trim();
//     };

//     const isLOLColumn = (columnName) => {
//         return lolColumns.includes(columnName) || 
//                ['Customer_Phone', 'Alternate_Phone', 'Landline_Phone', 'City', 'Address', 
//                 'Pincode', 'State', 'GST_No', 'PAN_No', 'Bank_Name', 'Bank_Account_No', 
//                 'IFSC_Code', 'Branch_Name', 'Owner_Name', 'LOL_Id', 'Ret_Id'].includes(columnName);
//     };

//     useEffect(() => {
//         const loadEnabledColumns = async () => {
//             if (!activeTab) return;
//             setLoadingColumns(true);
//             try {
//                 const whatsappType = TAB_TO_WHATSAPP_TYPE[activeTab];
//                 if (!whatsappType) { setEnabledColumns([]); return; }
//                 const response = await fetchLink({
//                     address: `masters/whatsappFilter?WhatsappType=${whatsappType}&company_id=${companyId}`,
//                     method: "GET",
//                     loadingOn: () => { },
//                     loadingOff: () => { },
//                 });
//                 if (response?.success && response.message && response.message.length > 0) {
//                     const enabled = response.message.map(item => item.Column_Name);
//                     setEnabledColumns(enabled);
                    
//                     // Extract LOL columns dynamically from data
//                     if (dataSource && dataSource.length > 0) {
//                         const firstRow = dataSource[0];
//                         const lolCols = Object.keys(firstRow).filter(key => 
//                             key.startsWith('LOL_') || 
//                             ['A1', 'A2', 'A3', 'Customer_Phone', 'Alternate_Phone', 'Landline_Phone', 
//                              'City', 'Address', 'Pincode', 'State', 'GST_No', 'PAN_No', 
//                              'Bank_Name', 'Bank_Account_No', 'IFSC_Code', 'Branch_Name', 
//                              'Owner_Name', 'LOL_Id', 'Ret_Id'].includes(key)
//                         );
//                         setLolColumns(lolCols);
//                     }
//                 } else {
//                     setEnabledColumns([]);
//                 }
//             } catch (error) {
//                 console.error("Error loading enabled columns:", error);
//                 setEnabledColumns([]);
//             } finally {
//                 setLoadingColumns(false);
//             }
//         };
//         loadEnabledColumns();
//     }, [activeTab, companyId, dataSource]);

//     if (loadingColumns) {
//         return (
//             <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, mb: 2, border: "1px solid", borderColor: "divider" }}>
//                 <Typography variant="caption" color="text.secondary" display="block" mb={1.5} fontWeight={600}>
//                     <TuneIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
//                     Loading Filters...
//                 </Typography>
//                 <CircularProgress size={24} />
//             </Box>
//         );
//     }

//     // Combine enabled columns with LOL columns
//     const allColumns = [...enabledColumns, ...lolColumns];
//     const uniqueColumns = [...new Set(allColumns)];

//     if (!uniqueColumns || uniqueColumns.length === 0) return null;

//     const hasActiveFilters = Object.keys(columnFilters).length > 0;

//     return (
//         <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, mb: 2, border: "1px solid", borderColor: "divider" }}>
//             <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
//                 <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                     <FilterAlt fontSize="small" />
//                     Quick Filters ({uniqueColumns.length} columns)
//                 </Typography>
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//                     {hasActiveFilters && (
//                         <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />} onClick={handleClearAll}>
//                             Clear All Filters
//                         </Button>
//                     )}
//                     <Button size="small" variant="outlined" color="primary" onClick={handleResetDraft} disabled={!hasDraftChanges}>
//                         Reset
//                     </Button>
//                     <Button size="small" variant="contained" color="primary" onClick={handleApplyFilters} disabled={!hasDraftChanges} startIcon={<Search fontSize="small" />}>
//                         Search
//                     </Button>
//                 </Box>
//             </Box>
//             <Stack direction="row" gap={2} flexWrap="wrap">
//                 {uniqueColumns.map((columnName) => {
//                     const options = getUniqueValues(columnName);
//                     const currentFilter = draftFilters[columnName];
//                     const label = formatColumnLabel(columnName);
//                     const isLOL = isLOLColumn(columnName);
                    
//                     return (
//                         <Autocomplete
//                             key={columnName} 
//                             multiple 
//                             size="small" 
//                             options={options}
//                             disableCloseOnSelect 
//                             getOptionLabel={(o) => o}
//                             value={Array.isArray(currentFilter) ? currentFilter : []}
//                             onChange={(_, v) => setDraftFilters((prev) => ({ ...prev, [columnName]: v }))}
//                             renderOption={(props, option, { selected }) => (
//                                 <li {...props}>
//                                     <Checkbox icon={icon} checkedIcon={checkedIcon} checked={selected} sx={{ mr: 1 }} />
//                                     {option}
//                                 </li>
//                             )}
//                             renderInput={(params) => (
//                                 <TextField 
//                                     {...params} 
//                                     label={label}
//                                     placeholder={options.length === 0 ? "No data available" : "Select to filter"}
//                                     size="small" 
//                                     sx={{ minWidth: isLOL ? 260 : 220 }}
//                                     InputProps={{
//                                         ...params.InputProps,
//                                         endAdornment: (
//                                             <>
//                                                 {isLOL && options.length > 0 && (
//                                                     <Chip 
//                                                         label={`${options.length}`} 
//                                                         size="small" 
//                                                         color="info" 
//                                                         sx={{ mr: 1, height: 18, fontSize: 9 }} 
//                                                     />
//                                                 )}
//                                                 {params.InputProps.endAdornment}
//                                             </>
//                                         )
//                                     }}
//                                 />
//                             )}
//                             sx={{ minWidth: isLOL ? 260 : 220 }}
//                         />
//                     );
//                 })}
//             </Stack>
//         </Box>
//     );
// };



const WhatsAppFilterBar = ({ activeTab, dataSource, columnFilters, setColumnFilters }) => {
    const [enabledColumns, setEnabledColumns] = useState([]);
    const [loadingColumns, setLoadingColumns] = useState(false);
    const [draftFilters, setDraftFilters] = useState(columnFilters);
    const storage = JSON.parse(localStorage.getItem("user") || "{}");
    const companyId = storage?.Company_id;

    useEffect(() => {
        setDraftFilters(columnFilters);
    }, [columnFilters]);

    const hasDraftChanges = JSON.stringify(draftFilters) !== JSON.stringify(columnFilters);

    const handleApplyFilters = () => {
        setColumnFilters(draftFilters);
    };

    const handleResetDraft = () => {
        setDraftFilters(columnFilters);
    };

    const handleClearAll = () => {
        setDraftFilters({});
        setColumnFilters({});
    };

    // Clean column name to remove suffixes like " - LOL-[19]"
    const cleanColumnName = (name) => {
        if (!name) return name;
        // Remove " - LOL-[number]" suffix
        return name.replace(/\s*-\s*LOL-\[\d+\]\s*$/, '').trim();
    };

    const getValueFromRow = (row, columnName) => {
        if (!row) return null;
        
        // First check if the column exists directly with case-insensitive matching
        const lowerColName = columnName.toLowerCase();
        for (const key in row) {
            if (key.toLowerCase() === lowerColName) {
                const val = row[key];
                if (val !== undefined && val !== null && val !== "" && val !== " ") {
                    return val;
                }
            }
        }
        
        // Also check for the column with " - LOL-[number]" suffix
        for (const key in row) {
            const cleanKey = cleanColumnName(key);
            if (cleanKey.toLowerCase() === lowerColName) {
                const val = row[key];
                if (val !== undefined && val !== null && val !== "" && val !== " ") {
                    return val;
                }
            }
        }
        
        // Special mappings for common fields with proper null checks
        const mappings = {
            'Customer_Phone': ['A1', 'A1_Phone', 'Phone', 'Mobile_No', 'PhoneNumber', 'Party_Mobile_1', 'Customer_Phone'],
            'Alternate_Phone': ['A2', 'Alt_Phone', 'Alternate_Phone', 'Party_Mobile_2'],
            'Landline_Phone': ['A3', 'Landline', 'Landline_Phone'],
            'City': ['City', 'District', 'Location', 'City_Name', 'Party_Location', 'Party_District'],
            'Address': ['Address', 'Party_Address', 'Retailer_Address', 'Party_Mailing_Address'],
            'State': ['State', 'Region', 'State_Name'],
            'GST_No': ['GST_No', 'GST', 'GSTIN'],
            'PAN_No': ['PAN_No', 'PAN', 'Pan_Number'],
            'Bank_Name': ['Bank_Name', 'Bank', 'BankName'],
            'Owner_Name': ['Owner_Name', 'Owner', 'OwnerName'],
            'Retailer_Name': ['retailerNameGet', 'Retailer_Name', 'Customer_Name', 'Party_Name', 'Ledger_Name', 'Ledger_Alias', 'Party_Mailing_Name'],
            'Ret_Code': ['Ret_Code', 'retailerCode', 'Customer_Code', 'Ledger_Tally_Id', 'Alter_Tally_Id'],
            'Pincode': ['Pincode', 'Pin_Code', 'Zip'],
            'Ledger_Tally_Id': ['Ret_Code', 'retailerCode', 'Customer_Code', 'Ledger_Tally_Id', 'Alter_Tally_Id'],
            'Ledger_Name': ['retailerNameGet', 'Retailer_Name', 'Customer_Name', 'Party_Name', 'Ledger_Name', 'Party_Mailing_Name'],
            'Ledger_Alias': ['Alias', 'Ledger_Alias', 'Customer_Alias', 'Ledger_Name'],
            'A1': ['A1', 'Customer_Phone', 'Phone', 'Party_Mobile_1', 'Mobile_No'],
            'A2': ['A2', 'Alternate_Phone', 'Party_Mobile_2'],
            'A3': ['A3', 'Landline_Phone'],
            'A4': ['A4'],
            'A5': ['A5'],
            'Party_Location': ['Location', 'Party_Location', 'City'],
            'Party_District': ['District', 'Party_District'],
            'Party_Group': ['Party_Group', 'Group'],
            'Party_Nature': ['Party_Nature', 'Nature'],
            'Party_Mobile_1': ['A1', 'Party_Mobile_1', 'Mobile_No', 'Customer_Phone'],
            'Party_Mobile_2': ['A2', 'Party_Mobile_2', 'Alternate_Phone'],
            'Party_Name': ['Party_Name'],
            'Party_Mailing_Name': ['Party_Mailing_Name'],
            'Party_Mailing_Address': ['Party_Mailing_Address'],
            'Actual_Party_Name_with_Brokers': ['Actual_Party_Name_with_Brokers'],
            'Ref_Brokers': ['Ref_Brokers'],
            'Ref_Owners': ['Ref_Owners'],
            'File_No': ['File_No'],
            'Date_Added': ['Date_Added'],
            'Payment_Mode': ['Payment_Mode'],
            'PayGroup': ['Q_Pay_Group', 'PayGroup'],
            'PayDays': ['Q_Pay_Days', 'PayDays'],
            'Total_Invoice_value': ['Total_Invoice_value', 'credit_amount', 'debit_amount']
        };
        
        if (mappings[columnName]) {
            for (const field of mappings[columnName]) {
                // Check direct field
                let val = row[field];
                if (val !== undefined && val !== null && val !== "" && val !== " ") {
                    return val;
                }
                // Check field with suffix
                for (const key in row) {
                    const cleanKey = cleanColumnName(key);
                    if (cleanKey.toLowerCase() === field.toLowerCase()) {
                        val = row[key];
                        if (val !== undefined && val !== null && val !== "" && val !== " ") {
                            return val;
                        }
                    }
                }
            }
        }
        
        return null;
    };

    const getUniqueValues = (columnName) => {
        if (!dataSource || dataSource.length === 0) return [];
        const values = new Set();
        dataSource.forEach(row => {
            let value = getValueFromRow(row, columnName);
            if (value !== undefined && value !== null && value !== "") {
                if (typeof value === 'object') {
                    if (value.label) value = value.label;
                    else if (value.value) value = value.value;
                    else return;
                }
                // Skip "Not Available" and similar placeholder values
                const strValue = String(value).trim();
                if (strValue && 
                    strValue !== "Not Available" && 
                    strValue !== "null" && 
                    strValue !== "undefined" &&
                    strValue !== "[object Object]" &&
                    strValue !== "NULL" &&
                    strValue !== "NA" &&
                    strValue !== "N/A" &&
                    strValue !== "" &&
                    strValue !== " ") {
                    values.add(strValue);
                }
            }
        });
        return Array.from(values).sort();
    };

    const formatColumnLabel = (columnName) => {
        const labels = {
            'Ledger_Tally_Id': 'Customer Code',
            'Ledger_Name': 'Customer Name',
            'Ledger_Alias': 'Customer Alias',
            'Customer_Phone': 'Phone Number',
            'Alternate_Phone': 'Alternate Phone',
            'Landline_Phone': 'Landline Phone',
            'City': 'City/Location',
            'Address': 'Address',
            'Pincode': 'Pincode',
            'State': 'State',
            'GST_No': 'GST Number',
            'PAN_No': 'PAN Number',
            'Bank_Name': 'Bank Name',
            'Bank_Account_No': 'Bank Account',
            'IFSC_Code': 'IFSC Code',
            'Branch_Name': 'Branch Name',
            'Owner_Name': 'Owner Name',
            'LOL_Id': 'LOL ID',
            'Ret_Id': 'Retailer ID',
            'Party_Location': 'Location',
            'Party_District': 'District',
            'Party_Group': 'Party Group',
            'Party_Nature': 'Party Nature',
            'Party_Mobile_1': 'Mobile 1',
            'Party_Mobile_2': 'Mobile 2',
            'A1': 'Phone (A1)',
            'A2': 'Alternate (A2)',
            'A3': 'Landline (A3)',
            'A4': 'A4 Field',
            'A5': 'A5 Field',
            'Party_Name': 'Party Name',
            'Party_Mailing_Name': 'Mailing Name',
            'Party_Mailing_Address': 'Mailing Address',
            'Actual_Party_Name_with_Brokers': 'Actual Party Name',
            'Ref_Brokers': 'Reference Brokers',
            'Ref_Owners': 'Reference Owners',
            'File_No': 'File Number',
            'Date_Added': 'Date Added',
            'Payment_Mode': 'Payment Mode',
            'PayGroup': 'Pay Group',
            'PayDays': 'Pay Days',
            'Retailer_Name': 'Retailer Name',
            'Ret_Code': 'Retailer Code',
            'Total_Invoice_value': 'Amount'
        };
        return labels[columnName] || columnName.replace(/_/g, " ").replace(/([A-Z])/g, " $1").trim();
    };

    useEffect(() => {
        const loadEnabledColumns = async () => {
            if (!activeTab) return;
            setLoadingColumns(true);
            try {
                const whatsappType = TAB_TO_WHATSAPP_TYPE[activeTab];
                if (!whatsappType) { 
                    setEnabledColumns([]); 
                    setLoadingColumns(false);
                    return; 
                }
                
                const response = await fetchLink({
                    address: `masters/whatsappFilter?WhatsappType=${whatsappType}&company_id=${companyId}`,
                    method: "GET",
                    loadingOn: () => { },
                    loadingOff: () => { },
                });
                
                if (response?.success && response.message && response.message.length > 0) {
                   
                    const enabled = response.message.map(item => cleanColumnName(item.Column_Name));
           
                    setEnabledColumns([...new Set(enabled)]);
                } else {
                    setEnabledColumns([]);
                }
            } catch (error) {
                console.error("Error loading enabled columns:", error);
                setEnabledColumns([]);
            } finally {
                setLoadingColumns(false);
            }
        };
        loadEnabledColumns();
    }, [activeTab, companyId]);

    if (loadingColumns) {
        return (
            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, mb: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="caption" color="text.secondary" display="block" mb={1.5} fontWeight={600}>
                    <TuneIcon sx={{ fontSize: 12, mr: 0.5, verticalAlign: "middle" }} />
                    Loading Filters...
                </Typography>
                <CircularProgress size={24} />
            </Box>
        );
    }

    // Use only the enabled columns from the API
    const uniqueColumns = enabledColumns.filter(col => col && col.trim() !== '');

    if (!uniqueColumns || uniqueColumns.length === 0) {
        return (
            <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, mb: 2, border: "1px solid", borderColor: "divider" }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TuneIcon fontSize="small" />
                    No filters configured. Please configure WhatsApp columns in settings.
                </Typography>
            </Box>
        );
    }

    const hasActiveFilters = Object.keys(columnFilters).length > 0;

    return (
        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1, mb: 2, border: "1px solid", borderColor: "divider" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FilterAlt fontSize="small" />
                    WhatsApp Filters ({uniqueColumns.length} columns)
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {hasActiveFilters && (
                        <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />} onClick={handleClearAll}>
                            Clear All Filters
                        </Button>
                    )}
                    <Button size="small" variant="outlined" color="primary" onClick={handleResetDraft} disabled={!hasDraftChanges}>
                        Reset
                    </Button>
                    <Button size="small" variant="contained" color="primary" onClick={handleApplyFilters} disabled={!hasDraftChanges} startIcon={<Search fontSize="small" />}>
                        Apply Filters
                    </Button>
                </Box>
            </Box>
            <Stack direction="row" gap={2} flexWrap="wrap">
                {uniqueColumns.map((columnName) => {
                    const options = getUniqueValues(columnName);
                    const currentFilter = draftFilters[columnName];
                    const label = formatColumnLabel(columnName);
                    
                    return (
                        <Autocomplete
                            key={columnName} 
                            multiple 
                            size="small" 
                            options={options}
                            disableCloseOnSelect 
                            getOptionLabel={(o) => o}
                            value={Array.isArray(currentFilter) ? currentFilter : []}
                            onChange={(_, v) => setDraftFilters((prev) => ({ ...prev, [columnName]: v }))}
                            renderOption={(props, option, { selected }) => (
                                <li {...props}>
                                    <Checkbox icon={icon} checkedIcon={checkedIcon} checked={selected} sx={{ mr: 1 }} />
                                    {option}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label={label}
                                    placeholder={options.length === 0 ? "No data available" : "Select to filter"}
                                    size="small" 
                                    sx={{ minWidth: 260 }}
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {options.length > 0 && (
                                                    <Chip 
                                                        label={`${options.length}`} 
                                                        size="small" 
                                                        color="info" 
                                                        sx={{ mr: 1, height: 18, fontSize: 9 }} 
                                                    />
                                                )}
                                                {params.InputProps.endAdornment}
                                            </>
                                        )
                                    }}
                                />
                            )}
                            sx={{ minWidth: 260 }}
                        />
                    );
                })}
            </Stack>
        </Box>
    );
};
const Whatsapp = ({ loadingOn, loadingOff, AddRights, EditRights, PrintRights, pageID }) => {
    const storage = JSON.parse(localStorage.getItem("user") || "{}");
    const companyId = storage?.Company_id;
    const [salesInvoices, setSalesInvoices] = useState([]);
    const [allSalesInvoices, setAllSalesInvoices] = useState([]);
    const [allSalesOrders, setAllSalesOrders] = useState([]);
    const [allReceipts, setAllReceipts] = useState([]);
    const [priceListRetailers, setPriceListRetailers] = useState([]);
    const [filteredPriceListRetailers, setFilteredPriceListRetailers] = useState([]);
    const [costCenterData, setCostCenterData] = useState([]);
    const [costTypes, setCostTypes] = useState([]);
    const [uniqueInvolvedCost, setUniqueInvolvedCost] = useState([]);
    const [phoneMap, setPhoneMap] = useState(new Map());

    const [viewMode, setViewMode] = useState("normal");
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [hasInitialLoading, setHasInitialLoading] = useState(false);
    const [isPhoneMapLoaded, setIsPhoneMapLoaded] = useState(false);
    const [initialDataLoaded, setInitialDataLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState("sale_order");

    const [sendingStates, setSendingStates] = useState({});
    const [selectAllCheckBox, setSelectAllCheckBox] = useState(false);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);
    const [currentPrintType, setCurrentPrintType] = useState("");
    const [printReady, setPrintReady] = useState(false);
    const [columnFilters, setColumnFilters] = useState({});
    const [filteredData, setFilteredData] = useState([]);

    const [tabMethodSettings, setTabMethodSettings] = useState({});
    const [settingsDialog, setSettingsDialog] = useState(false);
    const [allMethods, setAllMethods] = useState([]);

    const [bulkMenuAnchor, setBulkMenuAnchor] = useState(null);
    const [bulkProgress, setBulkProgress] = useState({ open: false, total: 0, sent: 0, failed: 0, mode: "parallel" });

    const [transactionDialog, setTransactionDialog] = useState({ open: false, row: null, tab: "", fromDate: "", toDate: "" });
    const [columnSettingsOpen, setColumnSettingsOpen] = useState(false);
    const [whatsappColumns, setWhatsappColumns] = useState([]);

    const prevSelectAll = useRef(false);

    const [outstandingFromDate, setOutstandingFromDate] = useState(() => {
        const today = new Date();
        const oneMonthBefore = new Date(today);
        oneMonthBefore.setMonth(today.getMonth() - 1);
        return oneMonthBefore.toISOString().split('T')[0];
    });
    const [outstandingToDate, setOutstandingToDate] = useState(() => new Date().toISOString().split('T')[0]);

    const [pendingBillsFromDate, setPendingBillsFromDate] = useState(() => {
        const today = new Date();
        const oneMonthBefore = new Date(today);
        oneMonthBefore.setMonth(today.getMonth() - 1);
        return oneMonthBefore.toISOString().split('T')[0];
    });
    const [pendingBillsToDate, setPendingBillsToDate] = useState(() => new Date().toISOString().split('T')[0]);

    const [allPendingBills, setAllPendingBills] = useState([]);
    const [filteredPendingBills, setFilteredPendingBills] = useState([]);
    const [pendingBillsFilter, setPendingBillsFilter] = useState("DR");

    const [allOutstanding, setAllOutstanding] = useState([]);
    const [filteredOutstanding, setFilteredOutstanding] = useState([]);
    const [outstandingFilter, setOutstandingFilter] = useState("DR");
    const [outstandingSearch, setOutstandingSearch] = useState("");
    const [pendingBillsSearch, setPendingBillsSearch] = useState("");

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
    const [multipleStaffRemoveValues, setMultipleStaffRemoveValues] = useState(STAFF_INIT);

    const [receiptFilters, setReceiptFilters] = useState({
        Fromdate: ISOString(), Todate: ISOString(),
        voucher: "", debit: "", credit: "", createdBy: "", status: "", receipt_type: "",
    });

    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
    const [multiPrint, setMultiPrint] = useState({ open: false, doIds: [], docType: "" });
    const multiPrintRef = useRef(null);
    const [companyInfo, setCompanyInfo] = useState([]);
    const [evatoken, setEvatoken] = useState(""); 

    useEffect(() => {
        const companyIdLocal = storage?.Company_id;
        if (companyIdLocal) {
            fetchLink({ address: `masters/company?Company_id=${companyIdLocal}` })
                .then((r) => { if (r?.success && r?.data[0]) setCompanyInfo(r.data); })
                .catch(console.error);
        }
    }, []);


useEffect(() => {
  const companyIdLocal = storage?.Company_id;
  if (companyIdLocal) {
    fetchLink({ address: `masters/company/url?Company_id=${companyIdLocal}` })
      .then((r) => {
        if (r?.success && r?.data) {
          
          const token = r.data?.Whatsapp_key || r.data?.token || "";
        
          if (token) setEvatoken(token);
        }
      })
      .catch((e) => console.error("Token fetch error:", e));
  }
}, []);

    const handleColumnSettingsSave = async (selectedColumnsArray) => {
        setWhatsappColumns(selectedColumnsArray);
    };

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
            const types = toArray(typesResp?.data);
            const services = toArray(servicesResp?.message);
            setAllMethods(services);
            const settings = {};
            await Promise.all(
                Object.entries(TAB_TO_WHATSAPP_TYPE).map(async ([tab, typeName]) => {
                    const typeRec = types.find((t) => t.WhatsappType?.toLowerCase() === typeName.toLowerCase());
                    if (!typeRec) return;
                    const methodsResp = await fetchLink({ address: `masters/whatsappMethod?WhatsappType_Id=${typeRec.Id}` });
                    const methods = toArray(methodsResp?.message);
                    const active = methods.find((m) => toNumber(m.Status) === 1);
                    if (active) {
                        settings[tab] = {
                            serviceId: toNumber(active.Service_Id),
                            serviceName: active.WhatsappService,
                            langId: active.lang_Id ? toNumber(active.lang_Id) : null,
                            langName: active.language ? active.language.toLowerCase() : "english",
                        };
                    } else {
                        const def = services.find((s) => s.WhatsappService?.toLowerCase() === "dotpe") || services[0];
                        settings[tab] = {
                            serviceId: def ? toNumber(def.Id) : null,
                            serviceName: def?.WhatsappService || "Dotpe",
                            langId: null,
                            langName: "english",
                        };
                    }
                })
            );
            setTabMethodSettings(settings);
        } catch (e) { console.error("Error fetching tab settings:", e); }
    }, []);

    const resolveTemplate = useCallback((tab, serviceName, langName) => {
        const svcKey = (serviceName || "dotpe").toLowerCase();
        const langKey = (langName || "english").toLowerCase();
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
        const svcKey = serviceName.toLowerCase();
        const langKey = langName.toLowerCase();
        const langCode = LANG_CODE_MAP[langKey] || "en";
        const templateName = resolveTemplate(tab, svcKey, langKey);
        if (svcKey === "askeva") return sendViaAskeva({ 
            phone, templateName, language: langCode, bodyParams, 
            evatoken: String(evatoken) 
        });
        return sendViaDotPe({ phone, templateName, language: langCode, bodyParams, clientRefId });
    },
    [tabMethodSettings, resolveTemplate, evatoken] 
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
        return `${print_app}/sales/downloadPdf?Do_Inv_No=${btoa(formattedInvoiceNo)}&Company_id=${btoa(storage?.Company_id)}`;
    };

    const getPDfUrlSalesOrder = (order) => {
        const formattedSalesNo = (order.DocumentNumber || "").replace(/_/g, "/");
        return `${print_app}/salesOrder/downloadPdf?So_Inv_No=${btoa(formattedSalesNo)}&Company_id=${btoa(storage?.Company_id)}`;
    };

    const processInvoice = (invoice, phoneMapRef) => ({
        ...invoice,
        DocumentType: "SalesInvoice",
        DocumentId: invoice.Do_Id,
        DocumentNumber: invoice.Do_Inv_No,
        DocumentDate: invoice.Do_Date,
        A1_Phone: (phoneMapRef || phoneMap).get(Number(invoice.Retailer_Id)) || invoice.A1 || "Not Available",
        ...(Array.isArray(invoice.stockDetails)
            ? { stockDetails: invoice.stockDetails.map((i) => ({ ...i, Alt_Act_Qty: calculateAltActQty(i) })) }
            : {}),
    });

    const processOrder = (order, phoneMapRef) => ({
        ...order,
        DocumentType: "SalesOrder",
        DocumentId: order.So_Id || order.Id,
        DocumentNumber: order.So_Inv_No || order.Invoice_No,
        DocumentDate: order.So_Date || order.Invoice_Date,
        voucherTypeGet: order.voucherTypeGet || "Sales Order",
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
            setAllSalesInvoices(si);
            setAllSalesOrders(so);
            setCostTypes(toArray(siResp?.others?.costTypes || soResp?.others?.costTypes));
            setUniqueInvolvedCost(toArray(siResp?.others?.uniqeInvolvedStaffs || soResp?.others?.uniqeInvolvedStaffs));
            if (activeTab === "sale_invoice") { setSalesInvoices(si); setFilteredData(si); }
            else if (activeTab === "sale_order") { setSalesInvoices(so); setFilteredData(so); }
            else if (activeTab !== "receipt_list" && activeTab !== "price_list" && activeTab !== "outstanding") { setSalesInvoices(si); setFilteredData(si); }
            if (!hasInitialLoading) setHasInitialLoading(true);
        } catch (e) { console.error(e); toast.error("Failed to load data"); }
        finally { if (!refresh) setIsLoading(false); setIsRefreshing(false); }
    };

    const fetchPendingInvoices = async () => {
        try {
            setIsLoading(true); setViewMode("pending");
            const [siResp, soResp] = await Promise.all([
                fetchLink({ address: `sales/salesInvoice/pendingDetails?reqDate=${filters.reqDate}`, loadingOn, loadingOff }),
                fetchLink({ address: `sales/salesOrder/pendingDetails?reqDate=${filters.reqDate}`, loadingOn, loadingOff }),
            ]);
            const si = toArray(siResp?.data).map((x) => processInvoice(x, phoneMap));
            const so = toArray(soResp?.data).map((x) => processOrder(x, phoneMap));
            setAllSalesInvoices(si); setAllSalesOrders(so);
            if (activeTab === "sale_invoice") { setSalesInvoices(si); setFilteredData(si); }
            else if (activeTab === "sale_order") { setSalesInvoices(so); setFilteredData(so); }
            if (siResp?.others?.costTypes) setCostTypes(toArray(siResp.others.costTypes));
            if (siResp?.others?.uniqeInvolvedStaffs) setUniqueInvolvedCost(toArray(siResp.others.uniqeInvolvedStaffs));
        } catch (e) { console.error(e); toast.error("Failed to load pending data"); }
        finally { setIsLoading(false); }
    };

    const fetchReceipts = async () => {
        try {
            setIsLoading(true);
            const params = new URLSearchParams(receiptFilters);
            const response = await fetchLink({ address: `receipt/receiptMasterwithLol?${params}`, loadingOn, loadingOff });
            if (response?.success && response.data) {
                const recs = toArray(response.data).map((r) => ({
                    ...r,
                    DocumentType: "Receipt",
                    DocumentId: r.receipt_id || r.Receipt_Id || r.Id,
                    DocumentNumber: r.receipt_invoice_no || r.Receipt_No,
                    DocumentDate: r.receipt_date || r.created_on,
                    voucherTypeGet: r.Voucher_Type,
                    transaction_type: r.transaction_type,
                    retailerNameGet: r.Retailer_Name || r.Customer_Name,
                    Total_Invoice_value: r.credit_amount || r.debit_amount || 0,
                    createdOn: r.created_on || r.receipt_date,
                    Retailer_Id: r.Retailer_Id || r.Linked_Retailer_Id,
                    A1_Phone: phoneMap.get(Number(r.Retailer_Id || r.Linked_Retailer_Id)) || r.A1 || r.Customer_Phone || "Not Available",
                    Customer_Phone: r.A1 || r.Customer_Phone || "Not Available",
                    Alternate_Phone: r.A2 || r.Alternate_Phone || "",
                    Landline_Phone: r.A3 || r.Landline_Phone || "",
                    LOL_Id: r.LOL_Id || r.Id,
                    Ret_Id: r.Ret_Id || r.Retailer_Id,
                    Owner_Name: r.Owner_Name || "",
                    City: r.City || "",
                    Address: r.Address || "",
                    Pincode: r.Pincode || "",
                    State: r.State || "",
                    GST_No: r.GST_No || "",
                    PAN_No: r.PAN_No || "",
                    Bank_Name: r.Bank_Name || "",
                    Bank_Account_No: r.Bank_Account_No || "",
                    IFSC_Code: r.IFSC_Code || "",
                    Branch_Name: r.Branch_Name || "",
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
                    DocumentType: "PriceList",
                    DocumentId: r.Ret_Id,
                    DocumentNumber: `PL_${r.Ret_Id}`,
                    retailerNameGet: r.Retailer_Name,
                    A1_Phone: phoneMap.get(Number(r.Ret_Id)) || r.A1 || "Not Available",
                    Retailer_Id: r.Ret_Id,
                }));
                setPriceListRetailers(retailers);
                setFilteredPriceListRetailers(retailers);
            }
        } catch (e) { toast.error("Failed to load price list data"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        if (activeTab === "outstanding") {
            const filtered = outstandingFilter === "ALL"
                ? allOutstanding
                : allOutstanding.filter((r) => (r.CR_DR || "").toUpperCase() === outstandingFilter);
            setFilteredOutstanding(filtered);
            setFilteredData(filtered);
        }
    }, [outstandingFilter, allOutstanding, activeTab]);

    useEffect(() => {
        if (activeTab === "pending_bills") {
            const filtered = pendingBillsFilter === "ALL"
                ? allPendingBills
                : allPendingBills.filter((r) => (r.CR_DR || "").toUpperCase() === pendingBillsFilter);
            setFilteredPendingBills(filtered);
            setFilteredData(filtered);
        }
    }, [pendingBillsFilter, allPendingBills, activeTab]);

    const fetchDebtorsCreditors = async (tab, fromDate, toDate) => {
        try {
            setIsLoading(true);
            const response = await fetchLink({
                address: `reports/externalAPI/debtorsCreditors?Fromdate=${fromDate}&Todate=${toDate}`,
                loadingOn,
                loadingOff,
            });
            if (response?.success && response.data) {
                let records = toArray(response.data).map((r) => ({
                    ...r,
                    DocumentType: tab === "outstanding" ? "Outstanding" : "PendingBill",
                    DocumentId: r.Retailer_Id,
                    DocumentNumber: r.Acc_Id,
                    retailerNameGet: r.Retailer_Name,
                    A1_Phone: r["A1 - LOL-[19]"]?.trim() || phoneMap.get(Number(r.Retailer_Id)) || "Not Available",
                    Total_Invoice_value: r.Bal_Amount || 0,
                    Location: r["Party_Location - LOL-[5]"] || "",
                    District: r["Party_District - LOL-[12]"] || "",
                    PayDays: r.Q_Pay_Days ?? "",
                    PayGroup: r.Q_Pay_Group || "",
                    CR_DR: r.CR_DR || "",
                    OB_Amount: r.OB_Amount || 0,
                    Bal_Amount: r.Bal_Amount || 0,
                    Debit_Amt: r.Debit_Amt || 0,
                    Credit_Amt: r.Credit_Amt || 0,
                    Customer_Phone: r["A1 - LOL-[19]"]?.trim() || "Not Available",
                }));

                records = records.filter((r) => (r.CR_DR || "").toUpperCase() === "DR");
                records = records.filter((r) =>
                    (r.Debit_Amt !== 0 && r.Debit_Amt !== null && r.Debit_Amt !== undefined) ||
                    (r.Credit_Amt !== 0 && r.Credit_Amt !== null && r.Credit_Amt !== undefined) ||
                    (r.Bal_Amount !== 0 && r.Bal_Amount !== null && r.Bal_Amount !== undefined)
                );

                if (tab === "outstanding") {
                    setAllOutstanding(records);
                    setOutstandingSearch("");
                    setFilteredOutstanding(records);
                    if (activeTab === "outstanding") setFilteredData(records);
                } else {
                    setAllPendingBills(records);
                    setPendingBillsSearch("");
                    setFilteredPendingBills(records);
                    if (activeTab === "pending_bills") setFilteredData(records);
                }

                if (records.length === 0) toast.info("No debit records found with non-zero amounts");
            } else {
                if (tab === "outstanding") {
                    setAllOutstanding([]); setFilteredOutstanding([]);
                    if (activeTab === "outstanding") setFilteredData([]);
                } else {
                    setAllPendingBills([]); setFilteredPendingBills([]);
                    if (activeTab === "pending_bills") setFilteredData([]);
                }
                toast.info("No data found");
            }
        } catch (e) {
            toast.error(`Failed to load ${tab === "outstanding" ? "outstanding" : "pending bills"} data`);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchOutstanding = () => fetchDebtorsCreditors("outstanding", outstandingFromDate, outstandingToDate);
    const fetchPendingBills = () => fetchDebtorsCreditors("pending_bills", pendingBillsFromDate, pendingBillsToDate);

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

    const fetchBillCountForRetailer = async (accId, fromDate, toDate) => {
        try {
            const response = await fetchLink({
                address: `journal/accountPendingReference?Acc_Id=${accId}&Fromdate=${fromDate}&Todate=${toDate}`,
                loadingOn: () => { }, loadingOff: () => { }
            });
            if (response?.success && response.data) {
                const transactions = toArray(response.data);
                const uniqueBills = new Set();
                transactions.forEach(item => {
                    if (item.voucherNumber || item.invoice_no) uniqueBills.add(item.voucherNumber || item.invoice_no);
                });
                return uniqueBills.size || transactions.length;
            }
            return "0";
        } catch (error) {
            console.error("Error fetching bill count:", error);
            return "0";
        }
    };

    const buildSaleInvoiceParams = (row) => {
        const pdfUrl = getPDFUrlSimple(row);
        const companyname = companyInfo[0]?.Company_Name;
        const customerName = row.retailerNameGet || "";
        const invoiceNo = row.DocumentNumber || "-";
        const date = new Date(row.Do_Date || row.DocumentDate || row.createdOn).toLocaleDateString("en-GB");
        const amount = Number(row.Total_Invoice_value || 0).toFixed(2);
        return { bodyParams: [companyname, customerName, invoiceNo, date, amount, pdfUrl], clientRefId: generateUniqueClientRefId("inv", invoiceNo) };
    };

    const buildPriceListParams = (row) => {
        const encodedCompanyId = btoa(storage?.Company_id);
        const priceListLink = `${print_app}/rateMaster?Company_id=${encodedCompanyId}`;
        const customerName = row.retailerNameGet || row.Retailer_Name || "Customer";
        const companyname = companyInfo[0]?.Company_Name;
        return { bodyParams: [companyname, customerName, priceListLink], clientRefId: generateUniqueClientRefId("plist", `retailer_${row.Ret_Id}`) };
    };

    const buildSaleOrderParams = (row) => {
        const pdfUrl = getPDfUrlSalesOrder(row);
        const customerName = row.retailerNameGet || "Customer";
        const invoiceNo = row.DocumentNumber || "N/A";
        const date = new Date(row.So_Date || row.DocumentDate || row.createdOn).toLocaleDateString("en-GB");
        const amount = Number(row.Total_Invoice_value || 0).toFixed(2);
        const companyname = companyInfo[0]?.Company_Name;
        return { bodyParams: [companyname, customerName, invoiceNo, date, amount, pdfUrl], clientRefId: generateUniqueClientRefId("sord", invoiceNo) };
    };

    const buildReceiptParams = (row) => {
        const customerName = row.retailerNameGet;
        const receiptNo = row.DocumentNumber || "N/A";
        const date = new Date(row.receipt_date || row.DocumentDate).toLocaleDateString("en-GB");
        const amount = Number(row.Total_Invoice_value || 0).toFixed(2);
        const companyname = companyInfo[0]?.Company_Name;
        const paymentMode = row.transaction_type || "-";
        return { bodyParams: [companyname, customerName, receiptNo, date, amount, paymentMode], clientRefId: generateUniqueClientRefId("receipt", receiptNo) };
    };

    const buildOutstandingParams = (row) => {
        const outstandingQuery = `Acc_Id=${row.Acc_Id}&fromDate=${outstandingFromDate}&toDate=${outstandingToDate}&Company_id=${storage?.Company_id}`;
        const maskedOutstandingParams = btoa(outstandingQuery);
        const statementLink = `${print_app}/statement?data=${maskedOutstandingParams}`;
        const companyname = companyInfo[0]?.Company_Name;
        const customerName = row.retailerNameGet || row.Retailer_Name;
        const amount = NumberFormat(Math.abs(parseFloat(row.Bal_Amount) || 0));
        return { bodyParams: [companyname, customerName, `₹${amount}`, statementLink], clientRefId: generateUniqueClientRefId("outstanding", row.DocumentId) };
    };

    const buildPendingBillsParams = async (row) => {
        const pendingQuery = `Acc_Id=${row.Acc_Id}&Fromdate=${pendingBillsFromDate}&Todate=${pendingBillsToDate}&Company_id=${storage?.Company_id}`;
        const maskedPendingParams = btoa(pendingQuery);
        const pendingbillsLink = `${print_app}/pendingbills?data=${maskedPendingParams}`;
        const companyname = companyInfo[0]?.Company_Name;
        const customerName = row.retailerNameGet || row.Retailer_Name;
        const amount = NumberFormat(row.Bal_Amount || 0);
        let billCount = "0";
        try {
            const response = await fetchLink({
                address: `journal/accountPendingReference?Acc_Id=${row.Acc_Id}&Fromdate=${pendingBillsFromDate}&Todate=${pendingBillsToDate}`,
                loadingOn: () => { }, loadingOff: () => { }
            });
            if (response?.success && response.data) {
                const transactions = toArray(response.data);
                const uniqueBills = new Set();
                transactions.forEach(item => {
                    if (item.voucherNumber || item.invoice_no) uniqueBills.add(item.voucherNumber || item.invoice_no);
                });
                billCount = String(uniqueBills.size || transactions.length);
            }
        } catch (error) { billCount = "0"; }
        return { bodyParams: [companyname, customerName, billCount, `₹${amount}`, pendingbillsLink], clientRefId: generateUniqueClientRefId("pending_bills", row.DocumentId) };
    };

    const getTabAndParams = useCallback((row, tab) => {
        if (tab === "price_list") return { tab, ...buildPriceListParams(row) };
        if (tab === "sale_order") return { tab, ...buildSaleOrderParams(row) };
        if (tab === "receipt_list") return { tab, ...buildReceiptParams(row) };
        if (tab === "outstanding") return { tab, ...buildOutstandingParams(row) };
        if (tab === "pending_bills") return { tab, ...buildPendingBillsParams(row) };
        return { tab: "sale_invoice", ...buildSaleInvoiceParams(row) };
    }, [buildPriceListParams, buildSaleOrderParams, buildReceiptParams, buildSaleInvoiceParams, buildOutstandingParams, buildPendingBillsParams]);

    const sendOutstandingPendingMessage = async (row, tab, totalAmount, transactionDetails) => {
        const rowKey = getRowKey(row, tab);
        setSendingStates((p) => ({ ...p, [rowKey]: true }));
        try {
            let phone = phoneMap.get(Number(row.Retailer_Id)) || row.A1 || row.Customer_Phone;
            if (!phone || !isValidPhone(phone)) { 
                toast.error("Valid phone number not found"); 
                return false; 
            }
            phone = normalizePhone(phone);
            const companyname = companyInfo[0]?.Company_Name;
            const customerName = row.retailerNameGet || row.Retailer_Name;
            const amount = NumberFormat(totalAmount);
            let bodyParams, clientRefId;
            if (tab === "pending_bills") {
                const pendingQuery = `Acc_Id=${row.Acc_Id}&Fromdate=${pendingBillsFromDate}&Todate=${pendingBillsToDate}&Company_id=${storage?.Company_id}`;
                const pendingbillsLink = `${print_app}/pendingbills?data=${btoa(pendingQuery)}`;
                const billCount = transactionDetails ? transactionDetails.split('\n').filter(l => l.trim().length > 0).length : 0;
                bodyParams = [companyname, customerName, String(billCount), `₹${amount}`, pendingbillsLink];
                clientRefId = generateUniqueClientRefId("pending_bills", row.DocumentId);
            } else {
                const outstandingQuery = `Acc_Id=${row.Acc_Id}&fromDate=${outstandingFromDate}&toDate=${outstandingToDate}&Company_id=${storage?.Company_id}`;
                const statementLink = `${print_app}/statement?data=${btoa(outstandingQuery)}`;
                bodyParams = [companyname, customerName, `₹${amount}`, statementLink];
                clientRefId = generateUniqueClientRefId("outstanding", row.DocumentId);
            }
            await sendWhatsAppMessage({ tab, phone, bodyParams, clientRefId });
            toast.success("WhatsApp message sent successfully!");
            return true;
        } catch (e) {
            toast.error(`Failed: ${e.message}`);
            return false;
        } finally {
            setSendingStates((p) => ({ ...p, [rowKey]: false }));
        }
    };

    const sendSingleRow = async (row, tab) => {
        if (tab === "outstanding" || tab === "pending_bills") {
            setTransactionDialog({
                open: true, row, tab,
                fromDate: tab === "outstanding" ? outstandingFromDate : pendingBillsFromDate,
                toDate: tab === "outstanding" ? outstandingToDate : pendingBillsToDate,
            });
            return;
        }
        const rowKey = getRowKey(row, tab);
        setSendingStates((p) => ({ ...p, [rowKey]: true }));
        try {
            let phone = phoneMap.get(Number(row.Retailer_Id)) || row?.A1 || row?.Customer_Phone || row?.A1_Phone;
            
            if (!phone || !isValidPhone(phone)) {
                toast.error("Valid phone number not found for this customer");
                return false;
            }
            
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
        const ids = multipleCostCenterUpdateValues.Do_Id;
        let source;
        if (activeTab === "price_list") source = filteredPriceListRetailers;
        else if (activeTab === "receipt_list") source = filteredData;
        else if (activeTab === "outstanding") source = filteredOutstanding;
        else if (activeTab === "pending_bills") source = filteredPendingBills;
        else source = filteredData;
        return source.filter((row) => ids.includes(toNumber(row.DocumentId)));
    }, [multipleCostCenterUpdateValues.Do_Id, activeTab, filteredPriceListRetailers, filteredData, filteredOutstanding, filteredPendingBills]);

    const handleBulkSend = async (mode) => {
        setBulkMenuAnchor(null);
        const rows = getSelectedRows();
        if (!rows.length) { toast.warning("Select at least one row"); return; }
        bulkAbortRef.current = false;
        setBulkProgress({ open: true, total: rows.length, sent: 0, failed: 0, mode });

        const increment = (success) =>
            setBulkProgress((p) => ({
                ...p,
                sent: success ? p.sent + 1 : p.sent,
                failed: success ? p.failed : p.failed + 1,
            }));

        const sendRow = async (row) => {
            try {
                let phone = phoneMap.get(Number(row.Retailer_Id)) || row.A1 || row.Customer_Phone;
                if (!phone || !isValidPhone(phone)) { 
                    increment(false); 
                    return; 
                }
                phone = normalizePhone(phone);
                let tab, bodyParams, clientRefId;
                if (activeTab === "outstanding") {
                    const companyname = companyInfo[0]?.Company_Name;
                    const customerName = row.retailerNameGet || row.Retailer_Name;
                    const amount = NumberFormat(Math.abs(parseFloat(row.Bal_Amount) || 0));
                    const outstandingQuery = `Acc_Id=${row.Acc_Id}&fromDate=${outstandingFromDate}&toDate=${outstandingToDate}&Company_id=${storage?.Company_id}`;
                    const statementLink = `${print_app}/statement?data=${btoa(outstandingQuery)}`;
                    tab = "outstanding";
                    bodyParams = [companyname, customerName, `₹${amount}`, statementLink];
                    clientRefId = generateUniqueClientRefId("outstanding", row.DocumentId);
                } else if (activeTab === "pending_bills") {
                    const companyname = companyInfo[0]?.Company_Name;
                    const customerName = row.retailerNameGet || row.Retailer_Name;
                    const amount = NumberFormat(row.Bal_Amount || 0);
                    const pendingQuery = `Acc_Id=${row.Acc_Id}&Fromdate=${pendingBillsFromDate}&Todate=${pendingBillsToDate}&Company_id=${storage?.Company_id}`;
                    const pendingbillsLink = `${print_app}/pendingbills?data=${btoa(pendingQuery)}`;
                    const billCount = await fetchBillCountForRetailer(row.Acc_Id, pendingBillsFromDate, pendingBillsToDate);
                    tab = "pending_bills";
                    bodyParams = [companyname, customerName, String(billCount), `₹${amount}`, pendingbillsLink];
                    clientRefId = generateUniqueClientRefId("pending_bills", row.DocumentId);
                } else {
                    const params = getTabAndParams(row, activeTab);
                    tab = params.tab; bodyParams = params.bodyParams; clientRefId = params.clientRefId;
                }
                await sendWhatsAppMessage({ tab, phone, bodyParams, clientRefId });
                increment(true);
            } catch (error) {
                console.error("Bulk send error:", error);
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
        const phone = phoneMap.get(Number(row.Retailer_Id)) || row?.A1_Phone || row?.A1 || row?.Customer_Phone || row?.phone || row?.Mobile_No;
        const hasPhone = phone && isValidPhone(phone);
        
        const rowKey = getRowKey(row, tab);
        const busy = !!sendingStates[rowKey];
        const { serviceName = "Dotpe", langName = "english" } = tabMethodSettings[tab] || {};
        const tooltipText = hasPhone ? `Send via WhatsApp (${serviceName} · ${langName})` : "No valid phone number available";
        
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
                        <Chip label={langName} size="small" sx={{ height: 14, fontSize: 9, opacity: 0.6 }} color="info" variant="outlined" />
                    </Box>
                )}
            </Box>
        );
    };

    const filterColumns = useMemo(
        () => [
            { Field_Name: "DocumentNumber", Fied_Data: "string", ColumnHeader: "Document No" },
            { Field_Name: "voucherTypeGet", Fied_Data: "string", ColumnHeader: "Type" },
            { Field_Name: "retailerNameGet", Fied_Data: "string", ColumnHeader: "Customer" },
            ...costTypes
                .filter((ct) => uniqueInvolvedCost.includes(toNumber(ct.Cost_Category_Id)))
                .map((ct) => ({
                    Field_Name: `costType_${ct.Cost_Category_Id}`,
                    Fied_Data: "string",
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
        const docId = toNumber(row.DocumentId);
        const isSelected = multipleCostCenterUpdateValues.Do_Id.includes(docId);
        const toggle = () => {
            setMultipleCostCenterUpdateValues(prev => ({
                ...prev,
                Do_Id: prev.Do_Id.includes(docId)
                    ? prev.Do_Id.filter((x) => !isEqualNumber(x, docId))
                    : [...prev.Do_Id, docId],
            }));
            setMultipleStaffRemoveValues(prev => ({
                ...prev,
                Do_Id: prev.Do_Id.includes(docId)
                    ? prev.Do_Id.filter((x) => !isEqualNumber(x, docId))
                    : [...prev.Do_Id, docId],
            }));
        };
        return <Checkbox onFocus={(e) => e.target.blur()} checked={isSelected} onChange={toggle} />;
    };

    const baseColumns = [
        { Field_Name: "Select", isVisible: 1, isCustomCell: true, Cell: ({ row }) => selectCell(row) },
        { Field_Name: "DocumentNumber", Fied_Data: "string", ColumnHeader: "Document No", isVisible: 1 },
        { Field_Name: "DocumentType", Fied_Data: "string", ColumnHeader: "Type", isVisible: 1 },
        { Field_Name: "Created", isVisible: 1, isCustomCell: true, Cell: ({ row }) => row?.createdOn ? LocalDateWithTime(row.createdOn) : "" },
        createCol("voucherTypeGet", "string", "Voucher"),
        createCol("retailerNameGet", "string", "Customer"),
        {
            Field_Name: "PhoneNumber", ColumnHeader: "Phone", isVisible: 1, isCustomCell: true,
            Cell: ({ row }) => {
                const phone = row.A1_Phone || phoneMap.get(Number(row.Retailer_Id)) || row.A1 || "Not Available";
                const hasPhone = phone && isValidPhone(phone);
                return <span style={{ color: hasPhone ? 'inherit' : '#999' }}>
                    {hasPhone ? phone : "No Phone"}
                </span>;
            },
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
    const saleOrderColumns = [...baseColumns, { Field_Name: "Action", isVisible: 1, isCustomCell: true, Cell: (p) => <ActionCell {...p} tab="sale_order" /> }];

    const priceListColumns = [
        { Field_Name: "Select", isVisible: 1, isCustomCell: true, Cell: ({ row }) => selectCell(row) },
        { Field_Name: "Retailer_Name", Fied_Data: "string", ColumnHeader: "Customer Name", isVisible: 1 },
        { Field_Name: "Ret_Code", Fied_Data: "string", ColumnHeader: "Customer Code", isVisible: 1 },
        { 
            Field_Name: "PhoneNumber", ColumnHeader: "Phone", isVisible: 1, isCustomCell: true, 
            Cell: ({ row }) => {
                const phone = row.A1 || "Not Available";
                const hasPhone = phone && isValidPhone(phone);
                return <span style={{ color: hasPhone ? 'inherit' : '#999' }}>
                    {hasPhone ? phone : "No Phone"}
                </span>;
            } 
        },
        { Field_Name: "City", Fied_Data: "string", ColumnHeader: "City", isVisible: 1 },
        { Field_Name: "Location", Fied_Data: "string", ColumnHeader: "Location", isVisible: 1 },
        { Field_Name: "Action", isVisible: 1, isCustomCell: true, Cell: (p) => <ActionCell {...p} tab="price_list" /> },
    ];

    const receiptColumns = [
        { Field_Name: "Select", isVisible: 1, isCustomCell: true, Cell: ({ row }) => selectCell(row) },
        { Field_Name: "receipt_invoice_no", Fied_Data: "string", ColumnHeader: "Receipt No", isVisible: 1 },
        { Field_Name: "receipt_date", Fied_Data: "date", ColumnHeader: "Receipt Date", isVisible: 1 },
        { Field_Name: "DebitAccountGet", Fied_Data: "string", ColumnHeader: "Debit Acct", isVisible: 1 },
        { Field_Name: "CreditAccountGet", Fied_Data: "string", ColumnHeader: "Credit Acct", isVisible: 1 },
        { 
            Field_Name: "PhoneNumber", ColumnHeader: "Phone", isVisible: 1, isCustomCell: true, 
            Cell: ({ row }) => {
                const phone = row.A1_Phone || row.A1 || row.Customer_Phone || "Not Available";
                const hasPhone = phone && isValidPhone(phone);
                return <span style={{ color: hasPhone ? 'inherit' : '#999' }}>
                    {hasPhone ? phone : "No Phone"}
                </span>;
            } 
        },
        { Field_Name: "Total_Invoice_value", Fied_Data: "number", ColumnHeader: "Amount", isVisible: 1, isCustomCell: true, Cell: ({ row }) => `₹${NumberFormat(row.credit_amount || row.debit_amount || 0)}` },
        { Field_Name: "transaction_type", Fied_Data: "string", ColumnHeader: "Payment Mode", isVisible: 1 },
        { Field_Name: "bank_name", Fied_Data: "string", ColumnHeader: "Bank", isVisible: 1 },
        { Field_Name: "check_no", Fied_Data: "string", ColumnHeader: "Cheque/Ref", isVisible: 1 },
        { Field_Name: "Status", Fied_Data: "string", ColumnHeader: "Status", isVisible: 1 },
        createCol("Narration", "string", "Narration"),
        { Field_Name: "Action", isVisible: 1, isCustomCell: true, Cell: (p) => <ActionCell {...p} tab="receipt_list" /> },
    ];

    const debtorsCreditorsColumns = [
        { Field_Name: "Select", isVisible: 1, isCustomCell: true, Cell: ({ row }) => selectCell(row) },
        { Field_Name: "Retailer_Name", Fied_Data: "string", ColumnHeader: "Party Name", isVisible: 1 },
        { Field_Name: "Location", Fied_Data: "string", ColumnHeader: "Location", isVisible: 1 },
        { Field_Name: "District", Fied_Data: "string", ColumnHeader: "District", isVisible: 1 },
        { 
            Field_Name: "A1_Phone", ColumnHeader: "Phone", isVisible: 1, isCustomCell: true, 
            Cell: ({ row }) => {
                const phone = row.A1_Phone || row.A1 || row.Customer_Phone || "Not Available";
                const hasPhone = phone && isValidPhone(phone);
                return <span style={{ color: hasPhone ? 'inherit' : '#999' }}>
                    {hasPhone ? phone : "No Phone"}
                </span>;
            } 
        },
        { Field_Name: "OB_Amount", ColumnHeader: "Opening Balance", isVisible: 1, isCustomCell: true, Cell: ({ row }) => <span>{row.OB_Amount || "-"}</span> },
        {
            Field_Name: "Bal_Amount", ColumnHeader: "Balance", isVisible: 1, isCustomCell: true,
            Cell: ({ row }) => (
                <span style={{ color: row.CR_DR === "DR" ? "#d32f2f" : "#388e3c", fontWeight: 600 }}>
                    ₹{NumberFormat(row.Bal_Amount || 0)}&nbsp;{row.CR_DR}
                </span>
            ),
        },
        { Field_Name: "PayGroup", Fied_Data: "string", ColumnHeader: "Pay Group", isVisible: 1 },
        {
            Field_Name: "PayDays", ColumnHeader: "Pay Days", isVisible: 1, isCustomCell: true,
            Cell: ({ row }) => (
                <Chip label={`${row.PayDays} days`} size="small"
                    color={row.PayDays > 30 ? "error" : row.PayDays > 15 ? "warning" : "success"}
                    sx={{ fontSize: 11 }} />
            ),
        },
        {
            Field_Name: "Action", isVisible: 1, isCustomCell: true,
            Cell: (p) => <ActionCell {...p} tab={p.row.DocumentType === "Outstanding" ? "outstanding" : "pending_bills"} />,
        },
    ];

const applyFilters = useCallback(() => {
    let src;
    if (activeTab === "price_list") src = priceListRetailers;
    else if (activeTab === "receipt_list") src = allReceipts;
    else if (activeTab === "outstanding") src = allOutstanding;
    else if (activeTab === "pending_bills") src = allPendingBills;
    else src = salesInvoices;

    let filtered = [...src];
    
    for (const [colName, filterValues] of Object.entries(columnFilters)) {
        if (!filterValues || filterValues.length === 0) continue;
        
        filtered = filtered.filter((item) => {
            let itemValue = null;
            
            // Direct match
            if (item[colName] !== undefined && item[colName] !== null && item[colName] !== "") {
                itemValue = item[colName];
            } else {
                // Check case insensitive
                const lowerColName = colName.toLowerCase();
                for (const key in item) {
                    if (key.toLowerCase() === lowerColName) {
                        const val = item[key];
                        if (val !== undefined && val !== null && val !== "") {
                            itemValue = val;
                            break;
                        }
                    }
                }
            }
            
            // Special mappings for all data types including receipt list
            if (itemValue === null || itemValue === undefined || itemValue === "") {
                const mappings = {
                    // Receipt list specific mappings
                    'receipt_invoice_no': ['receipt_invoice_no', 'Receipt_No', 'DocumentNumber'],
                    'receipt_date': ['receipt_date', 'created_on', 'DocumentDate'],
                    'credit_amount': ['credit_amount', 'Credit_Amt', 'Total_Invoice_value'],
                    'debit_amount': ['debit_amount', 'Debit_Amt'],
                    'transaction_type': ['transaction_type', 'Payment_Mode'],
                    'bank_name': ['bank_name', 'Bank_Name'],
                    'check_no': ['check_no', 'Cheque_No'],
                    'Status': ['Status', 'status'],
                    'Narration': ['Narration', 'narration'],
                    'DebitAccountGet': ['DebitAccountGet', 'Debit_Account'],
                    'CreditAccountGet': ['CreditAccountGet', 'Credit_Account'],
                    'Total_Invoice_value': ['Total_Invoice_value', 'credit_amount', 'debit_amount'],
                    
                    // Common mappings
                    'Customer_Phone': ['A1', 'A1_Phone', 'Phone', 'Mobile_No', 'PhoneNumber', 'Party_Mobile_1', 'A1 - LOL-[19]'],
                    'Alternate_Phone': ['A2', 'Alt_Phone', 'Alternate_Phone', 'Party_Mobile_2', 'A2 - LOL-[20]'],
                    'Landline_Phone': ['A3', 'Landline', 'Landline_Phone', 'A3 - LOL-[21]'],
                    'City': ['City', 'District', 'Location', 'City_Name', 'Party_Location', 'Party_District', 'Party_Location - LOL-[5]'],
                    'Address': ['Address', 'Party_Address', 'Retailer_Address', 'Party_Mailing_Address', 'Party_Mailing_Address - LOL-[17]'],
                    'State': ['State', 'Region', 'State_Name'],
                    'GST_No': ['GST_No', 'GST', 'GSTIN', 'GST_No - LOL-[18]'],
                    'PAN_No': ['PAN_No', 'PAN', 'Pan_Number'],
                    'Bank_Name': ['Bank_Name', 'Bank', 'BankName'],
                    'Owner_Name': ['Owner_Name', 'Owner', 'OwnerName'],
                    'Retailer_Name': ['retailerNameGet', 'Retailer_Name', 'Customer_Name', 'Party_Name', 'Ledger_Name', 'Ledger_Alias', 'Party_Mailing_Name', 'Ledger_Name - LOL-[1]'],
                    'Ret_Code': ['Ret_Code', 'retailerCode', 'Customer_Code', 'Ledger_Tally_Id'],
                    'Pincode': ['Pincode', 'Pin_Code', 'Zip'],
                    'Party_Location': ['Location', 'Party_Location', 'City', 'Party_Location - LOL-[5]'],
                    'Party_District': ['District', 'Party_District', 'Party_District - LOL-[12]'],
                    'Party_Group': ['Party_Group', 'Group', 'Party_Group - LOL-[7]'],
                    'Party_Nature': ['Party_Nature', 'Nature', 'Party_Nature - LOL-[6]'],
                    'Party_Mobile_1': ['A1', 'Party_Mobile_1', 'Mobile_No', 'Customer_Phone', 'Party_Mobile_1 - LOL-[10]'],
                    'Party_Mobile_2': ['A2', 'Party_Mobile_2', 'Alternate_Phone', 'Party_Mobile_2 - LOL-[11]'],
                    'Ledger_Tally_Id': ['Ret_Code', 'retailerCode', 'Customer_Code', 'Ledger_Tally_Id', 'Alter_Tally_Id'],
                    'Ledger_Name': ['retailerNameGet', 'Retailer_Name', 'Customer_Name', 'Party_Name', 'Ledger_Name', 'Ledger_Name - LOL-[1]'],
                    'Ledger_Alias': ['Alias', 'Ledger_Alias', 'Customer_Alias', 'Ledger_Name', 'Ledger_Alias - LOL-[2]'],
                    'A1': ['A1', 'Customer_Phone', 'Phone', 'Party_Mobile_1', 'A1 - LOL-[19]'],
                    'A2': ['A2', 'Alternate_Phone', 'Party_Mobile_2', 'A2 - LOL-[20]'],
                    'A3': ['A3', 'Landline_Phone', 'A3 - LOL-[21]'],
                    'PayGroup': ['Q_Pay_Group', 'PayGroup'],
                    'PayDays': ['Q_Pay_Days', 'PayDays']
                };
                
                if (mappings[colName]) {
                    for (const field of mappings[colName]) {
                        const val = item[field];
                        if (val !== undefined && val !== null && val !== "" && val !== " ") {
                            itemValue = val;
                            break;
                        }
                    }
                }
            }
            
            if (itemValue === null || itemValue === undefined || itemValue === "") {
                return false;
            }
            
            const itemStr = String(itemValue).toLowerCase().trim();
            
            if (itemStr === "not available" || 
                itemStr === "null" || 
                itemStr === "undefined" ||
                itemStr === "[object object]" ||
                itemStr === "na" ||
                itemStr === "n/a" ||
                itemStr === "" ||
                itemStr === " ") {
                return false;
            }
            
            return filterValues.some(filterVal => {
                if (!filterVal) return false;
                const filterStr = String(filterVal).toLowerCase().trim();
                if (!filterStr) return false;
                
                if (colName.includes('Phone') || colName === 'Customer_Phone' || 
                    colName === 'Alternate_Phone' || colName === 'Landline_Phone' ||
                    colName === 'A1_Phone' || colName === 'A1' || colName === 'A2' || colName === 'A3' ||
                    colName === 'Party_Mobile_1' || colName === 'Party_Mobile_2') {
                    const itemNumeric = itemStr.replace(/[^0-9]/g, '');
                    const filterNumeric = filterStr.replace(/[^0-9]/g, '');
                    if (itemNumeric && filterNumeric) {
                        return itemNumeric.includes(filterNumeric) || filterNumeric.includes(itemNumeric);
                    }
                    return itemStr.includes(filterStr);
                }
                
                // For amount fields, do numeric comparison
                if (colName === 'credit_amount' || colName === 'debit_amount' || 
                    colName === 'Total_Invoice_value' || colName.includes('Amount')) {
                    const itemNum = parseFloat(itemStr);
                    const filterNum = parseFloat(filterStr);
                    if (!isNaN(itemNum) && !isNaN(filterNum)) {
                        return itemNum === filterNum;
                    }
                }
                
                return itemStr.includes(filterStr) || filterStr.includes(itemStr);
            });
        });
    }
    
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
        }
    }
    
    if (activeTab === "price_list") {
        setFilteredPriceListRetailers(filtered);
    } else if (activeTab === "outstanding") {
        setFilteredOutstanding(filtered);
        setFilteredData(filtered);
    } else if (activeTab === "pending_bills") {
        setFilteredPendingBills(filtered);
        setFilteredData(filtered);
    } else if (activeTab === "receipt_list") {
        // For receipt list, we need to update the data source
        // But the receipt data is in allReceipts, so we just set filteredData
        setFilteredData(filtered);
    } else {
        setFilteredData(filtered);
    }
}, [columnFilters, salesInvoices, priceListRetailers, allReceipts, allOutstanding, allPendingBills, filterColumns, activeTab]);
    useEffect(() => { applyFilters(); }, [applyFilters]);

    useEffect(() => {
        if (selectAllCheckBox === prevSelectAll.current) return;
        prevSelectAll.current = selectAllCheckBox;
        if (!selectAllCheckBox) return;

        let source;
        if (activeTab === "price_list") source = filteredPriceListRetailers;
        else if (activeTab === "outstanding") source = filteredOutstanding;
        else if (activeTab === "pending_bills") source = filteredPendingBills;
        else source = filteredData;

        const ids = source.map((i) => toNumber(i.DocumentId));
        setMultipleCostCenterUpdateValues((p) => ({ ...p, Do_Id: ids }));
        setMultipleStaffRemoveValues((p) => ({ ...p, Do_Id: ids }));
    }, [selectAllCheckBox]);

    useEffect(() => {
        if (multipleCostCenterUpdateValues.Do_Id.length > 0) {
            setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: [] }));
            setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: [] }));
            setSelectAllCheckBox(false);
            prevSelectAll.current = false;
        }
    }, [priceListSearch, outstandingSearch, pendingBillsSearch]);

    useEffect(() => {
        if ((activeTab === "outstanding" || activeTab === "pending_bills") &&
            multipleCostCenterUpdateValues.Do_Id.length > 0) {
            setMultipleCostCenterUpdateValues(prev => ({ ...prev, Do_Id: [] }));
            setMultipleStaffRemoveValues(prev => ({ ...prev, Do_Id: [] }));
            setSelectAllCheckBox(false);
            prevSelectAll.current = false;
        }
    }, [outstandingFromDate, outstandingToDate, pendingBillsFromDate, pendingBillsToDate]);

    const handleTabChange = (newVal) => {
        setActiveTab(newVal);
        setSelectAllCheckBox(false);
        prevSelectAll.current = false;
        setMultipleCostCenterUpdateValues(STAFF_INIT);
        setMultipleStaffRemoveValues(STAFF_INIT);
        setColumnFilters({});
        setPriceListSearch("");
        setOutstandingFilter("DR");
        setPendingBillsFilter("DR");
        setOutstandingSearch("");
        setPendingBillsSearch("");

        if (newVal === "price_list") {
            priceListRetailers.length === 0 ? fetchRetailersWithLOL() : setFilteredPriceListRetailers(priceListRetailers);
        } else if (newVal === "sale_invoice") {
            setSalesInvoices(allSalesInvoices); setFilteredData(allSalesInvoices);
        } else if (newVal === "sale_order") {
            setSalesInvoices(allSalesOrders); setFilteredData(allSalesOrders);
        } else if (newVal === "receipt_list") {
            allReceipts.length === 0 ? fetchReceipts() : setFilteredData(allReceipts);
        } else if (newVal === "outstanding") {
            if (allOutstanding.length === 0) { setAllOutstanding([]); setFilteredOutstanding([]); setFilteredData([]); }
            else setFilteredData(allOutstanding);
        } else if (newVal === "pending_bills") {
            if (allPendingBills.length === 0) { setAllPendingBills([]); setFilteredPendingBills([]); setFilteredData([]); }
            else setFilteredData(allPendingBills);
        }
    };

    const convertToISTShort = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
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
                "Bill Qty": toArray(inv.stockDetails).reduce((s, x) => s + (Number(x.Bill_Qty) || 0), 0),
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
            const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
            const selected = salesInvoices.filter((inv) => ids.includes(toNumber(inv.DocumentId)));
            const tableData = selected.map((inv, i) => [
                i + 1, inv.DocumentNumber || "N/A", inv.DocumentType || "",
                (inv.DocumentDate || "").split("T")[0], inv.voucherTypeGet || "",
                inv.retailerNameGet || "", `₹${NumberFormat(inv.Total_Invoice_value || 0)}`,
                toArray(inv.stockDetails).reduce((s, x) => s + (Number(x.Bill_Qty) || 0), 0),
                toArray(inv.stockDetails).reduce((s, x) => s + (Number(x.Alt_Act_Qty) || 0), 0),
                inv.Delivery_Status || inv.Conversion_Status || "", inv.A1_Phone || "No Phone",
            ]);
            doc.setFontSize(14); doc.text(`Report — ${viewMode === "pending" ? "Pending" : "All"}`, 14, 14);
            doc.setFontSize(8); doc.text(`Generated: ${new Date().toLocaleString()}`, 280, 10, { align: "right" });
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
        if (activeTab === "price_list") fetchRetailersWithLOL();
        else if (activeTab === "receipt_list") fetchReceipts();
        else if (activeTab === "outstanding") fetchOutstanding();
        else if (activeTab === "pending_bills") fetchPendingBills();
        else if (viewMode === "pending") fetchPendingInvoices();
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
        if (activeTab === "price_list") src = priceListRetailers;
        else if (activeTab === "receipt_list") src = allReceipts;
        else src = salesInvoices;

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
                <Chip icon={<WhatsAppIcon sx={{ fontSize: 14 }} />} label={serviceName} size="small"
                    color={serviceName.toLowerCase() === "askeva" ? "secondary" : "primary"}
                    sx={{ height: 22, fontSize: 10 }} />
                {langName && (
                    <Chip icon={<Language sx={{ fontSize: 13 }} />} label={langName} size="small"
                        color="info" variant="outlined" sx={{ height: 22, fontSize: 10 }} />
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
                    <Button variant="contained" color="success" size="small"
                        startIcon={<WhatsAppIcon />} endIcon={<ArrowDropDown />}
                        onClick={(e) => setBulkMenuAnchor(e.currentTarget)}
                        sx={{ textTransform: "none", bgcolor: "#25D366", "&:hover": { bgcolor: "#1ebe5c" } }}>
                        Send ({selectedCount})
                    </Button>
                </Tooltip>
                <Menu anchorEl={bulkMenuAnchor} open={Boolean(bulkMenuAnchor)} onClose={() => setBulkMenuAnchor(null)}>
                    <MenuItem onClick={() => handleBulkSend("parallel")}>
                        <ListItemIcon><SendAndArchive fontSize="small" color="success" /></ListItemIcon>
                        <ListItemText primary="Send Simultaneously" secondary={`Fire all ${selectedCount} messages at once`} />
                    </MenuItem>
                    <MenuItem onClick={() => handleBulkSend("sequential")}>
                        <ListItemIcon><Send fontSize="small" color="info" /></ListItemIcon>
                        <ListItemText primary="Send One by One" secondary="Sequential with progress tracking" />
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
            <Tooltip title="Configure WhatsApp Columns">
                <IconButton size="small" onClick={() => setColumnSettingsOpen(true)}
                    sx={{ color: 'primary.main', '&:hover': { bgcolor: 'primary.light', color: 'white' } }}>
                    <TuneIcon />
                </IconButton>
            </Tooltip>

            {activeTab === "price_list" && (
                <TextField size="small" placeholder="Search by Name, Code, City, Location or Phone..."
                    value={priceListSearch} onChange={(e) => setPriceListSearch(e.target.value)}
                    sx={{ minWidth: 300, ml: 1 }}
                    InputProps={{ startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
                />
            )}

            {(activeTab === "outstanding" || activeTab === "pending_bills") && (
                <TextField size="small" placeholder="Search by Party Name, Location, District, Phone..."
                    value={activeTab === "outstanding" ? outstandingSearch : pendingBillsSearch}
                    onChange={(e) => {
                        const searchTerm = e.target.value.toLowerCase().trim();
                        if (activeTab === "outstanding") {
                            setOutstandingSearch(e.target.value);
                            const filtered = !searchTerm ? allOutstanding : allOutstanding.filter(item =>
                                (item.Retailer_Name || "").toLowerCase().includes(searchTerm) ||
                                (item.Location || "").toLowerCase().includes(searchTerm) ||
                                (item.District || "").toLowerCase().includes(searchTerm) ||
                                (item.A1_Phone || "").includes(searchTerm)
                            );
                            setFilteredOutstanding(filtered); setFilteredData(filtered);
                        } else {
                            setPendingBillsSearch(e.target.value);
                            const filtered = !searchTerm ? allPendingBills : allPendingBills.filter(item =>
                                (item.Retailer_Name || "").toLowerCase().includes(searchTerm) ||
                                (item.Location || "").toLowerCase().includes(searchTerm) ||
                                (item.District || "").toLowerCase().includes(searchTerm) ||
                                (item.A1_Phone || "").includes(searchTerm)
                            );
                            setFilteredPendingBills(filtered); setFilteredData(filtered);
                        }
                    }}
                    sx={{ minWidth: 300, ml: 1 }}
                    InputProps={{ startAdornment: <Search fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
                />
            )}

            <Tooltip title="Select All">
                <Checkbox
                    checked={selectAllCheckBox}
                    onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectAllCheckBox(checked);
                        if (!checked) {
                            setMultipleCostCenterUpdateValues((p) => ({ ...p, Do_Id: [] }));
                            setMultipleStaffRemoveValues((p) => ({ ...p, Do_Id: [] }));
                            prevSelectAll.current = false;
                        }
                    }}
                    disabled={
                        activeTab === "price_list"
                            ? filteredPriceListRetailers.length === 0
                            : filteredData.length === 0
                    }
                />
            </Tooltip>

            <BulkWhatsAppButton />

            {activeTab !== "price_list" && activeTab !== "outstanding" && activeTab !== "pending_bills" && (
                <IconButton size="small" onClick={() => setFilters((p) => ({ ...p, filterDialog: true }))} disabled={isRefreshing}>
                    <FilterAlt />
                </IconButton>
            )}

            {viewMode === "pending" && activeTab !== "price_list" && activeTab !== "receipt_list" && activeTab !== "outstanding" && activeTab !== "pending_bills" && (
                <>
                    <Button variant="contained" size="small" startIcon={<Download />} endIcon={<ArrowDropDown />}
                        onClick={(e) => setDownloadAnchorEl(e.currentTarget)}
                        disabled={!multipleCostCenterUpdateValues.Do_Id.length || downloadLoading}
                        sx={{ ml: 1, textTransform: "none" }}>
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

            {activeTab !== "price_list" && activeTab !== "receipt_list" && activeTab !== "outstanding" && activeTab !== "pending_bills" && (
                <input type="date" className="cus-inpt w-auto"
                    value={filters.reqDate}
                    onChange={(e) => setFilters((p) => ({ ...p, reqDate: e.target.value }))}
                    disabled={isRefreshing}
                />
            )}

            {activeTab !== "price_list" && activeTab !== "receipt_list" && activeTab !== "outstanding" && activeTab !== "pending_bills" && (
                <IconButton size="small"
                    disabled={!filters.docType || !multipleCostCenterUpdateValues.Do_Id.length}
                    onClick={() => { setCurrentPrintType(filters.docType); setMultiPrint({ open: true, doIds: multipleCostCenterUpdateValues.Do_Id, docType: filters.docType }); }}>
                    <Print />
                </IconButton>
            )}
        </>
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

            <WhatsappSettingsDialog open={settingsDialog} onClose={() => setSettingsDialog(false)}
                activeTab={activeTab} onSettingsSaved={() => fetchAllTabSettings()} />

            <BulkSendProgressDialog open={bulkProgress.open} total={bulkProgress.total}
                sent={bulkProgress.sent} failed={bulkProgress.failed} mode={bulkProgress.mode}
                onClose={() => { bulkAbortRef.current = true; setBulkProgress((p) => ({ ...p, open: false })); }} />

            <TransactionDetailsDialog
                open={transactionDialog.open}
                onClose={() => setTransactionDialog({ open: false, row: null, tab: "", fromDate: "", toDate: "" })}
                row={transactionDialog.row} tab={transactionDialog.tab}
                fromDate={transactionDialog.fromDate} toDate={transactionDialog.toDate}
                onSend={sendOutstandingPendingMessage} companyInfo={companyInfo} phoneMap={phoneMap}
            />

            <WhatsAppColumnSettings open={columnSettingsOpen} onClose={() => setColumnSettingsOpen(false)}
                companyId={companyId} onSave={handleColumnSettingsSave} activeTab={activeTab} />

            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar((p) => ({ ...p, open: false }))}>{snackbar.message}</Alert>
            </Snackbar>
        </>
    );

    const activeDataSource = useMemo(() => {
        if (activeTab === "price_list") return filteredPriceListRetailers;
        if (activeTab === "outstanding") return filteredOutstanding;
        if (activeTab === "pending_bills") return filteredPendingBills;
        if (activeTab === "receipt_list") return allReceipts;
        return filteredData;
    }, [activeTab, filteredPriceListRetailers, filteredOutstanding, filteredPendingBills, allReceipts, filteredData]);

    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                <Tabs value={activeTab} onChange={(_, v) => handleTabChange(v)} textColor="primary" indicatorColor="primary">
                    <Tab label="Sale Order" value="sale_order" />
                    <Tab label="Sale Invoice" value="sale_invoice" />
                    <Tab label="Price List" value="price_list" />
                    <Tab label="Receipt List" value="receipt_list" />
                    <Tab label="Transaction" value="outstanding" />
                    <Tab label="Pending Bills" value="pending_bills" />
                </Tabs>
            </Box>

            {activeTab === "sale_order" && (
                <>
                    <WhatsAppFilterBar activeTab={activeTab} dataSource={activeDataSource} columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
                    <FilterableTable title={viewMode === "pending" ? "Pending Sale Orders" : "Sale Orders"}
                        columns={saleOrderColumns} dataArray={filteredData} EnableSerialNumber ButtonArea={sharedButtonArea} />
                </>
            )}

            {activeTab === "sale_invoice" && (
                <>
                    <WhatsAppFilterBar activeTab={activeTab} dataSource={activeDataSource} columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
                    <FilterableTable title={viewMode === "pending" ? "Pending Sale Invoices" : "Sale Invoices"}
                        columns={saleInvoiceColumns} dataArray={filteredData} EnableSerialNumber ButtonArea={sharedButtonArea} />
                </>
            )}

            {activeTab === "price_list" && (
                <>
                    <WhatsAppFilterBar activeTab={activeTab} dataSource={activeDataSource} columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
                    <FilterableTable title="Price List — Retailers"
                        columns={priceListColumns} dataArray={filteredPriceListRetailers} EnableSerialNumber ButtonArea={sharedButtonArea} />
                </>
            )}

            {activeTab === "receipt_list" && (
                <>
                    <WhatsAppFilterBar activeTab={activeTab} dataSource={activeDataSource} columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
                    <FilterableTable title="Receipt List" columns={receiptColumns} dataArray={filteredData} EnableSerialNumber
                        ButtonArea={
                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                <TextField label="From Date" type="date" size="small" value={receiptFilters.Fromdate}
                                    onChange={(e) => setReceiptFilters((p) => ({ ...p, Fromdate: e.target.value }))}
                                    InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }} />
                                <TextField label="To Date" type="date" size="small" value={receiptFilters.Todate}
                                    onChange={(e) => setReceiptFilters((p) => ({ ...p, Todate: e.target.value }))}
                                    InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }} />
                                <TextField label="Voucher No" size="small" value={receiptFilters.voucher}
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
                                <Divider orientation="vertical" flexItem />
                                {sharedButtonArea}
                            </Stack>
                        }
                    />
                </>
            )}

            {activeTab === "outstanding" && (
                <>
                    <WhatsAppFilterBar activeTab={activeTab} dataSource={activeDataSource} columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
                    <FilterableTable title="Transactions — Debit Parties" columns={debtorsCreditorsColumns}
                        dataArray={filteredOutstanding} EnableSerialNumber
                        ButtonArea={
                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                <TextField label="From Date" type="date" size="small" value={outstandingFromDate}
                                    onChange={(e) => setOutstandingFromDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }} />
                                <TextField label="To Date" type="date" size="small" value={outstandingToDate}
                                    onChange={(e) => setOutstandingToDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }} />
                                <Button variant="contained" size="small" startIcon={<Search />} onClick={fetchOutstanding}>Search</Button>
                                <Divider orientation="vertical" flexItem />
                                <Button variant={outstandingFilter === "DR" ? "contained" : "outlined"} color="error" size="small"
                                    onClick={() => setOutstandingFilter("DR")} sx={{ textTransform: "none", minWidth: 120 }}>
                                    Debit / DR ({allOutstanding.filter((r) => r.CR_DR === "DR").length})
                                </Button>
                                <Chip label={`DR Total: ₹${NumberFormat(allOutstanding.filter((r) => r.CR_DR === "DR").reduce((s, r) => s + (r.Bal_Amount || 0), 0))}`}
                                    color="error" variant="outlined" size="small" />
                                {sharedButtonArea}
                            </Stack>
                        }
                    />
                </>
            )}

            {activeTab === "pending_bills" && (
                <>
                    <WhatsAppFilterBar activeTab={activeTab} dataSource={activeDataSource} columnFilters={columnFilters} setColumnFilters={setColumnFilters} />
                    <FilterableTable title="Pending Bills — Debit Parties" columns={debtorsCreditorsColumns}
                        dataArray={filteredPendingBills} EnableSerialNumber
                        ButtonArea={
                            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                <TextField label="From Date" type="date" size="small" value={pendingBillsFromDate}
                                    onChange={(e) => setPendingBillsFromDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }} />
                                <TextField label="To Date" type="date" size="small" value={pendingBillsToDate}
                                    onChange={(e) => setPendingBillsToDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }} sx={{ minWidth: 160 }} />
                                <Button variant="contained" size="small" startIcon={<Search />} onClick={fetchPendingBills}>Search</Button>
                                <Divider orientation="vertical" flexItem />
                                <Button variant={pendingBillsFilter === "DR" ? "contained" : "outlined"} color="error" size="small"
                                    onClick={() => setPendingBillsFilter("DR")} sx={{ textTransform: "none", minWidth: 120 }}>
                                    Debit / DR ({allPendingBills.filter((r) => r.CR_DR === "DR").length})
                                </Button>
                                <Chip label={`DR Total: ₹${NumberFormat(allPendingBills.filter((r) => r.CR_DR === "DR").reduce((s, r) => s + (r.Bal_Amount || 0), 0))}`}
                                    color="error" variant="outlined" size="small" />
                                {sharedButtonArea}
                            </Stack>
                        }
                    />
                </>
            )}

            {sharedDialogs}
        </>
    );
};

export default Whatsapp;