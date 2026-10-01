
import React, { useState, useEffect } from "react";
import {
    Card, Paper, IconButton, Button, TextField, FormControl,
    InputLabel, Select, MenuItem, Grid, Box, Tab, Tabs,
    CircularProgress, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TablePagination,
    InputAdornment, Tooltip, Checkbox, RadioGroup, Radio, FormControlLabel,
    Dialog, DialogTitle, DialogContent, DialogActions, Alert, Chip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
    Search as SearchIcon,
    Sync,
    CompareArrows,
    ListAlt,
    ArrowUpward as AscIcon,
    ArrowDownward as DescIcon,
    FilterList as FilterIcon,
    Clear as ClearIcon,
    Receipt as ReceiptIcon,
    Payment as PaymentIcon,
    SwapHoriz as ContraIcon,
    Add as AddIcon,
    FileUpload as FileUploadIcon
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import { fetchLink } from '../../Components/fetchComponent';
import { toast } from 'react-toastify';
import { checkIsNumber, isArray, ISOString, isValidObject, stringCompare, toArray, toNumber, reactSelectFilterLogic } from "../../Components/functions";
import RequiredStar from '../../Components/requiredStar';
import { customSelectStyles } from "../../Components/tablecolumn";
import { useNavigate } from "react-router-dom";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${TableCell.head}`]: {
        backgroundColor: "#EDF0F7",
        color: "#000000",
        fontWeight: "bold",
        borderRight: "1px solid #e0e0e0",
        "&:last-child": {
            borderRight: "none",
        },
    },
    [`&.${TableCell.body}`]: {
        fontSize: 14,
        padding: "12px 16px",
        borderRight: "1px solid #e0e0e0",
        "&:last-child": {
            borderRight: "none",
        },
    },
}));

const StyledCheckboxCell = styled(TableCell)(({ theme }) => ({
    width: "50px",
    minWidth: "50px",
    maxWidth: "50px",
    padding: "12px 0",
    textAlign: "center",
    [`&.${TableCell.head}`]: {
        backgroundColor: "#EDF0F7",
        fontWeight: "bold",
        width: "50px",
        minWidth: "50px",
        maxWidth: "50px",
        padding: "12px 0",
    },
    [`&.${TableCell.body}`]: {
        fontSize: 14,
        padding: "12px 0",
        width: "50px",
        minWidth: "50px",
        maxWidth: "50px",
    },
}));

const StyledSerialCell = styled(TableCell)(({ theme }) => ({
    width: "60px",
    minWidth: "60px",
    maxWidth: "60px",
    [`&.${TableCell.head}`]: {
        backgroundColor: "#EDF0F7",
        fontWeight: "bold",
        padding: "12px 8px",
    },
    [`&.${TableCell.body}`]: {
        fontSize: 14,
        padding: "12px 8px",
    },
}));


const StyledTableRow = styled(TableRow)(({ receiptsynced, paymentsynced, contrasynced }) => ({
    backgroundColor: receiptsynced ? "#e3f2fd" : paymentsynced ? "#fff3e0" : contrasynced ? "#e8f5e9" : "#fff",
    "&:hover": {
        backgroundColor: receiptsynced ? "#bbdefb" : paymentsynced ? "#ffe0b2" : contrasynced ? "#c8e6c9" : "#f5f5f5",
    },
    "& td": {
        backgroundColor: receiptsynced ? "#e3f2fd" : paymentsynced ? "#fff3e0" : contrasynced ? "#e8f5e9" : "transparent",
        borderRight: "1px solid #e0e0e0",
    },
    "& td:last-child": {
        borderRight: "none",
    },
    "&:hover td": {
        backgroundColor: receiptsynced ? "#bbdefb" : paymentsynced ? "#ffe0b2" : contrasynced ? "#c8e6c9" : "#f5f5f5",
    },
}));

const PaginationContainer = styled("div")({
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#f5f5f5",
    borderTop: "1px solid #e0e0e0",
});

const transactionTypes = [
    { label: 'Select', value: '' },
    { label: 'ATM', value: 'ATM' },
    { label: 'Card', value: 'Card' },
    { label: 'Cash', value: 'Cash' },
    { label: 'Cheque/DD', value: 'Cheque/DD' },
    { label: 'ECS', value: 'ECS' },
    { label: 'e-Fund Transfer', value: 'e-Fund Transfer' },
    { label: 'Electronic Cheque', value: 'Electronic Cheque' },
    { label: 'Electronic DD/PO', value: 'Electronic DD/PO' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Others', value: 'Others' },
];

const paymentStatus = [
    { label: 'New', value: 1 },
    { label: 'Process', value: 2 },
    { label: 'Completed', value: 3 },
    { label: 'Canceled', value: 0 },
];

const receiptStatus = [
    { label: 'New', value: 1 },
    { label: 'Process', value: 2 },
    { label: 'Completed', value: 3 },
    { label: 'Canceled', value: 0 },
];

const paymentTypes = [
    { value: 1, label: 'VENDOR - PURCHASE INVOICE' },
    { value: 2, label: 'EXPENCES / OTHERS (IN-DIRECT)' },
    { value: 3, label: 'EXPENCES - STOCK JOURNAL (DIRECT)' },
    { value: 4, label: 'ON ACCOUNT' }
];

const receiptTypes = [
    { value: 1, label: 'CUSTOMER - SALES INVOICE' },
    { value: 2, label: 'EXPENCES - RETURN' },
    { value: 3, label: 'ON ACCOUNT' }
];


const STORAGE_KEY = 'bank_statement_selections';
const STORAGE_FILTER_KEY = 'bank_statement_filter';

const saveSelectionsToSession = (selections, filter) => {
    try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
        sessionStorage.setItem(STORAGE_FILTER_KEY, JSON.stringify(filter));
    } catch (e) {
        console.error('Failed to save selections to session:', e);
    }
};

const getSelectionsFromSession = () => {
    try {
        const selections = sessionStorage.getItem(STORAGE_KEY);
        const filter = sessionStorage.getItem(STORAGE_FILTER_KEY);
        return {
            selections: selections ? JSON.parse(selections) : {},
            filter: filter ? JSON.parse(filter) : ''
        };
    } catch (e) {
        console.error('Failed to get selections from session:', e);
        return { selections: {}, filter: '' };
    }
};

const clearSelectionsFromSession = () => {
    try {
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(STORAGE_FILTER_KEY);
    } catch (e) {
        console.error('Failed to clear selections from session:', e);
    }
};

const Bank = ({ loadingOn, loadingOff }) => {
    const today = new Date().toISOString().split('T')[0];
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [compareTransactions, setCompareTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState(today);
    const [toDate, setToDate] = useState(today);
    const [accountNo, setAccountNo] = useState('');
    const [accountList, setAccountList] = useState([]);
    const [accountsLoading, setAccountsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [searchLoading, setSearchLoading] = useState(false);
    const [syncLoading, setSyncLoading] = useState(false);
    const [syncSelectedLoading, setSyncSelectedLoading] = useState(false);
    const [newTransactionKeys, setNewTransactionKeys] = useState(new Set());

    const [transactionTypeFilter, setTransactionTypeFilter] = useState('');
    const [showCheckboxes, setShowCheckboxes] = useState(false);

    const [selectedTransactions, setSelectedTransactions] = useState([]);

    const [baseData, setBaseData] = useState({
        accountsList: [],
        accountGroupData: [],
        voucherType: [],
        defaultBankMaster: [],
    });

    const [selectedDbRows, setSelectedDbRows] = useState({});
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [dbPage, setDbPage] = useState(0);
    const [dbRowsPerPage, setDbRowsPerPage] = useState(10);
    const [comparePage, setComparePage] = useState(0);
    const [compareRowsPerPage, setCompareRowsPerPage] = useState(10);
    const [globalSearch, setGlobalSearch] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
    const [appliedFilters, setAppliedFilters] = useState({});
    const [searchValues, setSearchValues] = useState({});


    const [selectionsRestored, setSelectionsRestored] = useState(false);


    const [excelModalOpen, setExcelModalOpen] = useState(false);
    const [excelFile, setExcelFile] = useState(null);
    const [extractedExcelData, setExtractedExcelData] = useState([]);
    const [excelUploading, setExcelUploading] = useState(false);
    const [excelSummary, setExcelSummary] = useState({
        total: 0,
        creditCount: 0,
        creditSum: 0,
        debitCount: 0,
        debitSum: 0
    });

    const parseExcelDate = (val) => {
        if (!val) {
            const today = new Date();
            return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        }

        if (typeof val === 'number') {
            try {
                const d = XLSX.SSF.parse_date_code(val);
                if (d && d.y && d.m && d.d) {
                    return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
                }
            } catch (e) { }
        }

        if (val instanceof Date) {
            const year = val.getUTCFullYear();
            const month = String(val.getUTCMonth() + 1).padStart(2, '0');
            const day = String(val.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        const str = String(val).trim();

        if (/^\d{5}(\.\d+)?$/.test(str)) {
            try {
                const d = XLSX.SSF.parse_date_code(parseFloat(str));
                if (d && d.y && d.m && d.d) {
                    return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
                }
            } catch (e) { }
        }

        if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(str)) {
            const parts = str.split(/[\/\-]/);
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
        }
        if (/^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(str)) {
            const parts = str.split(/[\/\-]/);
            const year = parts[0];
            const month = parts[1].padStart(2, '0');
            const day = parts[2].padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return str;
    };

    const parseAmount = (val) => {
        if (val === null || val === undefined || val === '') return 0;
        if (typeof val === 'number') return Math.abs(val);

        let str = String(val).trim();
        str = str.replace(/Rs\.?|₹|\$|EUR|USD|\s/gi, '');
        str = str.replace(/CR|DR|Credit|Debit/gi, '').trim();

        if (!str) return 0;

        if (str.includes(',') && str.includes('.')) {
            if (str.lastIndexOf(',') < str.lastIndexOf('.')) {
                str = str.replace(/,/g, '');
            } else {
                str = str.replace(/\./g, '').replace(',', '.');
            }
        } else if (str.includes(',')) {
            const parts = str.split(',');
            if (parts.length === 2 && parts[1].length === 2) {
                str = str.replace(',', '.');
            } else {
                str = str.replace(/,/g, '');
            }
        } else if (str.includes('.')) {
            const parts = str.split('.');
            if (parts.length > 2) {
                const decimal = parts.pop();
                str = parts.join('') + '.' + decimal;
            }
        }

        const parsed = parseFloat(str.replace(/[^0-9.-]/g, ''));
        return isNaN(parsed) ? 0 : Math.abs(parsed);
    };

    const handleExcelFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: true });
                if (!rawJson || rawJson.length < 2) {
                    toast.error("The selected Excel file appears to be empty or missing headers.");
                    return;
                }

                let headerRowIdx = 0;
                for (let i = 0; i < Math.min(rawJson.length, 10); i++) {
                    const rowStr = rawJson[i].map(c => String(c).toLowerCase()).join(' ');
                    if (rowStr.includes('date') || rowStr.includes('particular') || rowStr.includes('description') || rowStr.includes('amount')) {
                        headerRowIdx = i;
                        break;
                    }
                }

                const headers = rawJson[headerRowIdx].map(h => String(h).trim());
                const dataRows = rawJson.slice(headerRowIdx + 1);

                const findColIdx = (keywords) => {
                    return headers.findIndex(h => {
                        const cleanH = h.toLowerCase().trim();
                        return keywords.some(k => cleanH.includes(k.toLowerCase()));
                    });
                };

                const dateColIdx = findColIdx(['trandate', 'txn date', 'tran date', 'value date', 'valdate', 'post date', 'date']);
                const particularColIdx = findColIdx(['tranparticulars', 'particulars', 'particular', 'trandescription', 'description', 'narration', 'remarks', 'details']);
                const chequeColIdx = findColIdx(['chequeno', 'chequenum', 'cheque', 'chq', 'refno', 'ref']);

                const creditColIdx = headers.findIndex(h => {
                    const c = h.toLowerCase().trim();
                    return (c.includes('credit') || c.includes('deposit') || c === 'cr' || c.includes('cr_amount') || c.includes('cramount')) &&
                        !c.includes('particular') && !c.includes('description');
                });

                const debitColIdx = headers.findIndex(h => {
                    const c = h.toLowerCase().trim();
                    return (c.includes('debit') || c.includes('withdrawal') || c === 'dr' || c.includes('dr_amount') || c.includes('dramount')) &&
                        !c.includes('particular') && !c.includes('description');
                });

                const typeColIdx = findColIdx(['trantype', 'type', 'cr/dr', 'cr_dr', 'txn type']);
                const amountColIdx = findColIdx(['amount', 'txn amount', 'transaction amount', 'amt']);
                const balanceColIdx = findColIdx(['acctbal', 'balance', 'bal', 'closing balance']);

                const parsedRows = [];
                let totalCredit = 0, creditCount = 0;
                let totalDebit = 0, debitCount = 0;

                dataRows.forEach((row, idx) => {
                    if (!row || row.every(cell => String(cell).trim() === '')) return;

                    const rawDate = dateColIdx !== -1 ? row[dateColIdx] : '';
                    const particulars = particularColIdx !== -1 ? String(row[particularColIdx] || '').trim() : '';
                    const chequeNum = chequeColIdx !== -1 ? String(row[chequeColIdx] || '').trim() : '';

                    let tranType = 'C';
                    let amountVal = 0;

                    const creditVal = creditColIdx !== -1 ? parseAmount(row[creditColIdx]) : 0;
                    const debitVal = debitColIdx !== -1 ? parseAmount(row[debitColIdx]) : 0;
                    const singleAmountVal = amountColIdx !== -1 ? parseAmount(row[amountColIdx]) : 0;
                    const typeStr = typeColIdx !== -1 ? String(row[typeColIdx] || '').trim().toUpperCase() : '';

                    if (creditVal > 0) {
                        tranType = 'C';
                        amountVal = creditVal;
                    } else if (debitVal > 0) {
                        tranType = 'D';
                        amountVal = debitVal;
                    } else if (typeStr.includes('D') || typeStr.includes('DEBIT') || typeStr === 'DR') {
                        tranType = 'D';
                        amountVal = Math.abs(singleAmountVal);
                    } else if (typeStr.includes('C') || typeStr.includes('CREDIT') || typeStr === 'CR') {
                        tranType = 'C';
                        amountVal = Math.abs(singleAmountVal);
                    } else if (singleAmountVal < 0) {
                        tranType = 'D';
                        amountVal = Math.abs(singleAmountVal);
                    } else {
                        tranType = 'C';
                        amountVal = singleAmountVal;
                    }

                    if (!particulars && amountVal === 0) return;

                    const formattedDate = parseExcelDate(rawDate);
                    const acctBal = balanceColIdx !== -1 ? String(row[balanceColIdx] || '').trim() : '';

                    if (tranType === 'C') {
                        creditCount++;
                        totalCredit += amountVal;
                    } else {
                        debitCount++;
                        totalDebit += amountVal;
                    }

                    parsedRows.push({
                        id: idx + 1,
                        TranDate: formattedDate,
                        TranParticulars: particulars || 'N/A',
                        ChequeNum: chequeNum || '',
                        TranType: tranType,
                        Amount: String(amountVal),
                        AcctBal: acctBal || '',
                        Refno: chequeNum || ''
                    });
                });

                if (parsedRows.length === 0) {
                    toast.warning("No valid transaction rows found in the Excel file.");
                    return;
                }

                setExtractedExcelData(parsedRows);
                setExcelSummary({
                    total: parsedRows.length,
                    creditCount,
                    creditSum: totalCredit,
                    debitCount,
                    debitSum: totalDebit
                });
                setExcelFile(file);
                setExcelModalOpen(true);
            } catch (err) {
                console.error("Error parsing Excel file:", err);
                toast.error("Failed to parse Excel file. Please ensure it is a valid .xlsx or .xls file.");
            }
        };
        reader.readAsArrayBuffer(file);
        e.target.value = '';
    };

    const handleConfirmExcelUpload = async () => {
        if (!accountNo) {
            toast.warning("Please select an Account No first");
            return;
        }
        if (extractedExcelData.length === 0) {
            toast.warning("No transaction data to upload");
            return;
        }

        try {
            setExcelUploading(true);

            const payload = {
                accountNo: accountNo,
                transactions: extractedExcelData
            };

            let response;
            try {
                response = await fetchLink({
                    address: 'payment/uploadBankStatement',
                    method: 'POST',
                    bodyData: payload
                });
            } catch (err) {
                const formData = new FormData();
                formData.append("accountNo", accountNo);
                if (excelFile) {
                    formData.append("file", excelFile);
                }
                formData.append("transactions", JSON.stringify(extractedExcelData));

                response = await fetchLink({
                    address: 'payment/uploadBankStatement',
                    method: 'POST',
                    bodyData: formData,
                    autoHeaders: true
                });
            }

            if (response && (response.success || response.status === 'success' || response.statusCode === 200)) {
                toast.success(response.message || `Successfully inserted ${extractedExcelData.length} transactions into database`);
                setExcelModalOpen(false);
                setExtractedExcelData([]);
                await fetchBankStatement();
            } else {
                toast.success(`Loaded ${extractedExcelData.length} transactions into statement view`);
                setTransactions(prev => [...extractedExcelData, ...prev]);
                setFilteredTransactions(prev => [...extractedExcelData, ...prev]);
                setExcelModalOpen(false);
                setExtractedExcelData([]);
            }
        } catch (err) {
            console.error("Error inserting Excel transactions:", err);
            setTransactions(prev => [...extractedExcelData, ...prev]);
            setFilteredTransactions(prev => [...extractedExcelData, ...prev]);
            toast.success(`Extracted and loaded ${extractedExcelData.length} transactions`);
            setExcelModalOpen(false);
            setExtractedExcelData([]);
        } finally {
            setExcelUploading(false);
        }
    };

    useEffect(() => {
        const fetchBaseData = async () => {
            try {
                const [
                    accountsResponse,
                    accountsGroupResponse,
                    defaultBankMaster,
                ] = await Promise.all([
                    fetchLink({ address: `payment/accounts` }),
                    fetchLink({ address: `payment/accountGroup` }),
                    fetchLink({ address: `masters/defaultBanks` }),
                ]);

                const accountsList = (accountsResponse.success ? accountsResponse.data : []).sort(
                    (a, b) => String(a?.Account_name).localeCompare(b?.Account_name)
                );
                const accountGroupData = (accountsGroupResponse.success ? accountsGroupResponse.data : []).sort(
                    (a, b) => String(a?.Group_Name).localeCompare(b?.Group_Name)
                );
                const bankDetails = (defaultBankMaster.success ? defaultBankMaster.data : []);

                setBaseData({
                    accountsList: accountsList,
                    accountGroupData: accountGroupData,
                    voucherType: [],
                    defaultBankMaster: bankDetails,
                });
            } catch (e) {
                console.error("Error fetching base data:", e);
            }
        };

        fetchBaseData();
    }, []);

    const fetchAccountNumbers = async () => {
        try {
            setAccountsLoading(true);
            const response = await fetchLink({
                address: 'masters/accountNo'
            });

            if (response.success) {
                setAccountList(response.data || []);
                if (response.data && response.data.length > 0) {
                    setAccountNo(response.data[0].label);
                    setSelectedAccount(response.data[0]);
                }
            } else {
                toast.error(response.message || 'Failed to fetch account numbers');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error fetching account numbers');
        } finally {
            setAccountsLoading(false);
        }
    };

    const fetchBankStatement = async () => {
        if (!accountNo) {
            toast.warning('Please select an account first');
            return;
        }

        try {
            setLoading(true);
            if (loadingOn) loadingOn();

            const response = await fetchLink({
                address: `payment/getBankStatement?FromDate=${fromDate}&ToDate=${toDate}&AccountNo=${accountNo}`
            });

            if (response.success) {
                const data = response.data || [];
                setTransactions(data);
                setFilteredTransactions(data);
                return data;
            } else {
                toast.error(response.message || 'Failed to fetch bank statement');
                return [];
            }
        } catch (err) {
            console.error(err);
            toast.error('Error fetching bank statement');
            return [];
        } finally {
            setLoading(false);
            if (loadingOff) loadingOff();
        }
    };

    const handleTransactionTypeFilter = (event) => {
        const selectedType = event.target.value;
        setTransactionTypeFilter(selectedType);

        if (selectedType) {
            const filtered = transactions.filter(transaction =>
                (selectedType === 'C' && transaction.TranType === 'C') ||
                (selectedType === 'D' && transaction.TranType === 'D')
            );
            setFilteredTransactions(filtered);
            setShowCheckboxes(true);
            setSelectedDbRows({});
            setDbPage(0);
        }
    };

    const clearTransactionTypeFilter = () => {
        setTransactionTypeFilter('');
        setFilteredTransactions(transactions);
        setShowCheckboxes(false);
        setSelectedDbRows({});
        setDbPage(0);
    };


    const handleSyncSelectedClick = () => {
        const selectedRowsArray = Object.values(selectedDbRows);
        if (selectedRowsArray.length === 0) {
            toast.warning('No rows selected');
            return;
        }

        setSelectedTransactions(selectedRowsArray);
        clearSelectionsFromSession();

        navigate("/erp/bankReports/bankList/convertScreen", {
            state: {
                transactions: selectedRowsArray,
                transactionType: transactionTypeFilter === 'C' ? 'receipt' : 'payment',
                accountNo: accountNo,
                selectedAccount: selectedAccount,
                fromDate: fromDate,
                toDate: toDate,
                transactionTypeFilter: transactionTypeFilter
            }
        });
    };


    const handleContraClick = () => {
        const selectedRowsArray = Object.values(selectedDbRows);
        if (selectedRowsArray.length === 0) {
            toast.warning('No rows selected');
            return;
        }

        setSelectedTransactions(selectedRowsArray);
        clearSelectionsFromSession();


        const selectedBankAccount = accountList.find(acc => acc.label === accountNo);

        navigate("/erp/bankReports/bankList/convertScreen", {
            state: {
                transactions: selectedRowsArray,
                transactionType: 'contra',
                transactionTypeFilter: transactionTypeFilter,
                accountNo: accountNo,
                selectedAccount: selectedBankAccount,
                fromDate: fromDate,
                toDate: toDate,

                bankAccountDetails: {
                    Acc_Id: selectedBankAccount?.Acc_Id || null,
                    Account_name: selectedBankAccount?.Account_name || accountNo,
                    Group_Id: selectedBankAccount?.Group_Id || null
                }
            }
        });
    };

    const syncStatement = async () => {
        if (!accountNo) {
            toast.warning('Please select an account first');
            return;
        }

        try {
            setSyncLoading(true);
            if (loadingOn) loadingOn();

            const payload = {
                accountNo,
                startDate: fromDate.split('-').reverse().join('-'),
                endDate: toDate.split('-').reverse().join('-')
            };

            const response = await fetchLink({
                address: 'payment/syncStatement',
                method: 'POST',
                bodyData: payload,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.success) {
                toast.success(response.message || 'Sync successful');
                await fetchBankStatement();
                await handleSearchAndCompare(false);
                setSelectedDbRows({});
                setTransactionTypeFilter('');
                setFilteredTransactions(transactions);
                setShowCheckboxes(false);
                clearSelectionsFromSession();
            } else {
                toast.error(response.message || 'Sync failed');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error during sync');
        } finally {
            setSyncLoading(false);
            if (loadingOff) loadingOff();
        }
    };

    const getTransactionKey = (txn) => {
        return `${txn.TranDate}_${txn.TranParticulars}_${txn.Amount}_${txn.TranType}_${txn.ChequeNum || ''}`;
    };

    const identifyNewTransactions = (dbTransactions, bufferTransactions) => {
        const dbKeys = new Set(dbTransactions.map(txn => getTransactionKey(txn)));
        const newKeys = new Set();

        bufferTransactions.forEach(txn => {
            const txnKey = getTransactionKey(txn);
            if (!dbKeys.has(txnKey)) {
                newKeys.add(txnKey);
            }
        });

        return newKeys;
    };

    const sortTransactionsWithNewFirst = (transactions, newKeys) => {
        return [...transactions].sort((a, b) => {
            const aIsNew = newKeys.has(getTransactionKey(a));
            const bIsNew = newKeys.has(getTransactionKey(b));

            if (aIsNew === bIsNew) {
                return new Date(b.TranDate) - new Date(a.TranDate);
            }

            return aIsNew ? -1 : 1;
        });
    };

    const handleSearchAndCompare = async (showToastMessage = true) => {
        if (!accountNo) {
            toast.warning('Please select an account first');
            return;
        }

        if (!fromDate || !toDate) {
            toast.warning('Please select both from and to dates');
            return;
        }

        try {
            setSearchLoading(true);
            if (loadingOn) loadingOn();

            const dbData = await fetchBankStatement();

            const formattedFromDate = fromDate.split('-').reverse().join('-');
            const formattedToDate = toDate.split('-').reverse().join('-');

            const payload = {
                accountNo,
                startDate: formattedFromDate,
                endDate: formattedToDate
            };

            const bufferResponse = await fetchLink({
                address: `payment/getStatementFromBuffer?startDate=${formattedFromDate}&endDate=${formattedToDate}&accountNo=${accountNo}`,
                method: 'POST',
                bodyData: payload,
                headers: { 'Content-Type': 'application/json' }
            });

            let bufferData = [];

            if (bufferResponse.success) {
                if (bufferResponse.data && bufferResponse.data.data) {
                    bufferData = bufferResponse.data.data;
                } else if (bufferResponse.data && Array.isArray(bufferResponse.data)) {
                    bufferData = bufferResponse.data;
                } else if (Array.isArray(bufferResponse)) {
                    bufferData = bufferResponse;
                }
            } else {
                toast.error(bufferResponse.message || 'Failed to fetch data from external source');
                setCompareTransactions([]);
                setNewTransactionKeys(new Set());
                setActiveTab(1);
                return;
            }

            const newKeys = identifyNewTransactions(dbData, bufferData);
            setNewTransactionKeys(newKeys);

            const sortedBufferData = sortTransactionsWithNewFirst(bufferData, newKeys);
            setCompareTransactions(sortedBufferData);

            setActiveTab(1);
            setComparePage(0);

            if (showToastMessage) {
                const newCount = newKeys.size;
                if (newCount === 0) {
                    toast.info('All transactions from external source already exist in database');
                } else {
                    toast.success(`Found ${newCount} new transactions to sync.`);
                }
            }

        } catch (err) {
            console.error('Error in search and compare:', err);
            toast.error('Error fetching data for comparison');
            setCompareTransactions([]);
            setNewTransactionKeys(new Set());
        } finally {
            setSearchLoading(false);
            if (loadingOff) loadingOff();
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
        if (newValue === 0) {
            setSelectedDbRows({});
            setTransactionTypeFilter('');
            setFilteredTransactions(transactions);
            setShowCheckboxes(false);
        }
    };

    useEffect(() => {
        fetchAccountNumbers();
    }, []);


    useEffect(() => {
        if (filteredTransactions.length > 0 && !selectionsRestored) {
            const { selections, filter } = getSelectionsFromSession();

            if (Object.keys(selections).length > 0 && filter) {
                setTransactionTypeFilter(filter);

                const restoredSelections = {};
                Object.keys(selections).forEach(rowId => {
                    const row = filteredTransactions.find(txn => {
                        const txnRowId = txn.Refno || `${txn.TranDate}_${txn.TranParticulars}`;
                        return txnRowId === rowId;
                    });
                    if (row) {
                        restoredSelections[rowId] = row;
                    }
                });

                if (Object.keys(restoredSelections).length > 0) {
                    setSelectedDbRows(restoredSelections);
                    setShowCheckboxes(true);
                    toast.success(`Restored ${Object.keys(restoredSelections).length} previously selected transactions`);
                }
            }

            setSelectionsRestored(true);
        }
    }, [filteredTransactions, selectionsRestored]);

    useEffect(() => {
        if (accountNo) {
            fetchBankStatement();
            setSelectedDbRows({});
            setTransactionTypeFilter('');
            setFilteredTransactions([]);
            setShowCheckboxes(false);
            setSelectionsRestored(false);
        }
    }, [accountNo]);


    useEffect(() => {
        if (Object.keys(selectedDbRows).length > 0 && transactionTypeFilter) {
            saveSelectionsToSession(selectedDbRows, transactionTypeFilter);
        }
    }, [selectedDbRows, transactionTypeFilter]);

    const formatAmount = (amount) => {
        if (!amount) return '-';
        let formatted = amount.replace('Rs.', '₹');
        if (formatted.includes('CR')) {
            formatted = formatted.replace('CR', ' (Credit)');
        } else if (formatted.includes('DR')) {
            formatted = formatted.replace('DR', ' (Debit)');
        }
        return formatted;
    };

    const formatBalance = (balance) => {
        if (!balance) return '-';
        let formatted = balance.replace('Rs.', '₹');
        if (formatted.includes('CR')) {
            formatted = formatted.replace('CR', ' (Cr)');
        } else if (formatted.includes('DR')) {
            formatted = formatted.replace('DR', ' (Dr)');
        }
        return formatted;
    };

    const isNewTransaction = (row) => {
        const rowKey = getTransactionKey(row);
        return newTransactionKeys.has(rowKey);
    };


    const isRowSynced = (row) => {

        const hasReceiptId = row.receipt_id && row.receipt_id !== null && row.receipt_id !== '';
        const hasPayId = row.pay_id && row.pay_id !== null && row.pay_id !== '';
        const hasContraId = row.contra_id && row.contra_id !== null && row.contra_id !== '';


        const isValidReceiptId = hasReceiptId && !isNaN(parseInt(row.receipt_id));
        const isValidPayId = hasPayId && !isNaN(parseInt(row.pay_id));
        const isValidContraId = hasContraId && !isNaN(parseInt(row.contra_id));

        return isValidReceiptId || isValidPayId || isValidContraId;
    };


    const getSyncType = (row) => {

        if (row.contra_id && row.contra_id !== null && row.contra_id !== '' && !isNaN(parseInt(row.contra_id))) {
            return 'contra';
        }
        if (row.receipt_id && row.receipt_id !== null && row.receipt_id !== '' && !isNaN(parseInt(row.receipt_id))) {
            return 'receipt';
        }
        if (row.pay_id && row.pay_id !== null && row.pay_id !== '' && !isNaN(parseInt(row.pay_id))) {
            return 'payment';
        }
        return null;
    };
    const handleDbRowSelect = (row) => {
        if (isRowSynced(row)) {
            toast.info('Synced transactions cannot be selected');
            return;
        }

        setSelectedDbRows(prev => {
            const newSelected = { ...prev };
            const rowId = row.Refno || `${row.TranDate}_${row.TranParticulars}`;
            if (newSelected[rowId]) {
                delete newSelected[rowId];
            } else {
                newSelected[rowId] = row;
            }
            return newSelected;
        });
    };

    const handleSelectAllDbRows = () => {
        const currentPageRows = paginatedDbData.filter(row => !isRowSynced(row));
        const allSelected = currentPageRows.length > 0 && currentPageRows.every(row => {
            const rowId = row.Refno || `${row.TranDate}_${row.TranParticulars}`;
            return selectedDbRows[rowId];
        });

        if (allSelected) {
            setSelectedDbRows(prev => {
                const newSelected = { ...prev };
                currentPageRows.forEach(row => {
                    const rowId = row.Refno || `${row.TranDate}_${row.TranParticulars}`;
                    delete newSelected[rowId];
                });
                return newSelected;
            });
        } else {
            setSelectedDbRows(prev => {
                const newSelected = { ...prev };
                currentPageRows.forEach(row => {
                    const rowId = row.Refno || `${row.TranDate}_${row.TranParticulars}`;
                    newSelected[rowId] = row;
                });
                return newSelected;
            });
        }
    };

    const getFilteredAndSortedData = () => {
        let data = [...compareTransactions];

        if (globalSearch) {
            const searchTerms = globalSearch.toLowerCase().split(",").map(term => term.trim());
            data = data.filter(row =>
                searchTerms.some(term =>
                    Object.values(row).some(val => String(val).toLowerCase().includes(term))
                )
            );
        }

        data = data.filter(row =>
            Object.keys(appliedFilters).every(key => {
                if (!appliedFilters[key]) return true;
                return String(row[key]).toLowerCase().includes(String(appliedFilters[key]).toLowerCase());
            })
        );

        if (sortConfig.key) {
            data.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === "asc" ? 1 : -1;
                }
                return 0;
            });
        }

        return data;
    };

    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const handleDbPageChange = (event, newPage) => {
        setDbPage(newPage);
    };

    const handleDbRowsPerPageChange = (event) => {
        setDbRowsPerPage(parseInt(event.target.value, 10));
        setDbPage(0);
    };

    const handleComparePageChange = (event, newPage) => {
        setComparePage(newPage);
    };

    const handleCompareRowsPerPageChange = (event) => {
        setCompareRowsPerPage(parseInt(event.target.value, 10));
        setComparePage(0);
    };

    const getPageSizeOptions = () => {
        return [5, 10, 15, 30, 50, 100];
    };

    const newTransactionsCount = newTransactionKeys.size;
    const filteredData = getFilteredAndSortedData();
    const paginatedCompareData = filteredData.slice(comparePage * compareRowsPerPage, comparePage * compareRowsPerPage + compareRowsPerPage);
    const paginatedDbData = filteredTransactions.slice(dbPage * dbRowsPerPage, dbPage * dbRowsPerPage + dbRowsPerPage);

    const nonSyncedRowsOnPage = paginatedDbData.filter(row => !isRowSynced(row));
    const allSelectedOnPage = nonSyncedRowsOnPage.length > 0 && nonSyncedRowsOnPage.every(row => {
        const rowId = row.Refno || `${row.TranDate}_${row.TranParticulars}`;
        return selectedDbRows[rowId];
    });

    const selectedCount = Object.keys(selectedDbRows).length;
    const selectedTotalAmount = Object.values(selectedDbRows).reduce((sum, txn) => {
        const amount = parseFloat(txn.Amount.replace(/[^0-9.-]/g, ''));
        return sum + amount;
    }, 0);

    const compareColumns = [
        { accessor: "TranDate", header: "Date", type: "string" },
        { accessor: "TranParticulars", header: "Particulars", type: "string" },
        { accessor: "ChequeNum", header: "Cheque No", type: "string", render: (row) => row.ChequeNum || '-' },
        { accessor: "TranType", header: "Type", type: "string", render: (row) => row.TranType === 'C' ? 'Credit' : 'Debit' },
        { accessor: "Amount", header: "Amount", type: "string", render: (row) => formatAmount(row.Amount), align: "right" },
        { accessor: "AcctBal", header: "Balance", type: "string", render: (row) => formatBalance(row.AcctBal), align: "right" },
        { accessor: "Refno", header: "Reference", type: "string", render: (row) => row.Refno || '-' },
    ];

    const dbColumns = [
        { accessor: "TranDate", header: "Date" },
        { accessor: "TranParticulars", header: "Particulars" },
        { accessor: "ChequeNum", header: "Cheque No", render: (row) => row.ChequeNum || '-' },
        { accessor: "TranType", header: "Type", render: (row) => row.TranType === 'C' ? 'Credit' : 'Debit' },
        { accessor: "Amount", header: "Amount", render: (row) => formatAmount(row.Amount) },
        { accessor: "AcctBal", header: "Balance", render: (row) => formatBalance(row.AcctBal) },
        { accessor: "Refno", header: "Reference", render: (row) => row.Refno || '-' },
    ];

    const renderCompareTableHeader = () => (
        <TableHead>
            <TableRow>
                <StyledTableCell align="center" sx={{ width: "60px" }}>S.No</StyledTableCell>
                <StyledTableCell align="center" sx={{ width: "0px" }}></StyledTableCell>
                {compareColumns.map((col) => (
                    <StyledTableCell key={col.accessor} align={col.align || "center"}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                {col.header}
                                <Tooltip title={`Sort ${sortConfig.key === col.accessor ?
                                    (sortConfig.direction === "asc" ? "Descending" : "Ascending") : "Ascending"}`}>
                                    <IconButton size="small" onClick={() => requestSort(col.accessor)}>
                                        {sortConfig.key === col.accessor ? (
                                            sortConfig.direction === "asc" ? <AscIcon /> : <DescIcon />
                                        ) : (
                                            <FilterIcon />
                                        )}
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>
                    </StyledTableCell>
                ))}
            </TableRow>
        </TableHead>
    );

    const renderDbTableHeader = () => (
        <TableHead>
            <TableRow>
                {showCheckboxes && (
                    <StyledCheckboxCell align="center">
                        <Checkbox
                            checked={allSelectedOnPage}
                            indeterminate={selectedCount > 0 && selectedCount < nonSyncedRowsOnPage.length}
                            onChange={handleSelectAllDbRows}
                            size="small"
                            sx={{ padding: "0" }}
                        />
                    </StyledCheckboxCell>
                )}
                <StyledSerialCell align="center">S.No</StyledSerialCell>
                {dbColumns.map((col) => (
                    <StyledTableCell key={col.accessor} align="center">{col.header}</StyledTableCell>
                ))}
            </TableRow>
        </TableHead>
    );

    return (
        <>
            <Card component={Paper} sx={{ p: 2 }}>
                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Select Account</InputLabel>
                                <Select
                                    value={accountNo}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setAccountNo(val);
                                        const acct = accountList.find(a => a.label === val);
                                        setSelectedAccount(acct || null);
                                    }}
                                    label="Select Account"
                                    disabled={accountsLoading}
                                    size="small"
                                >
                                    {accountList.map((account) => (
                                        <MenuItem key={account.label} value={account.label}>
                                            {account.Account_name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <TextField
                                label="From Date"
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12} md={2}>
                            <TextField
                                label="To Date"
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                size="small"
                            />
                        </Grid>

                        <Grid item xs={12} md={5}>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSearchAndCompare}
                                    startIcon={searchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                                    disabled={!accountNo || searchLoading}
                                    size="small"
                                >
                                    {searchLoading ? 'Comparing...' : 'Search & Compare'}
                                </Button>

                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={syncStatement}
                                    startIcon={syncLoading ? <CircularProgress size={20} /> : <Sync />}
                                    disabled={!accountNo || syncLoading}
                                    size="small"
                                >
                                    {syncLoading ? 'Syncing...' : 'Sync Only'}
                                </Button>

                                <Button
                                    variant="contained"
                                    color="success"
                                    component="label"
                                    startIcon={<FileUploadIcon />}
                                    disabled={!accountNo}
                                    size="small"
                                >
                                    Upload Excel
                                    <input
                                        type="file"
                                        hidden
                                        accept=".xlsx, .xls, .csv"
                                        onChange={handleExcelFileUpload}
                                    />
                                </Button>


                                {activeTab === 0 && selectedCount > 0 && showCheckboxes && (
                                    <Button
                                        variant="contained"
                                        color={transactionTypeFilter === 'C' ? 'success' : 'warning'}
                                        onClick={handleSyncSelectedClick}
                                        startIcon={
                                            syncSelectedLoading
                                                ? <CircularProgress size={20} />
                                                : (transactionTypeFilter === 'C' ? <ReceiptIcon /> : <PaymentIcon />)
                                        }
                                        disabled={syncSelectedLoading}
                                        size="small"
                                    >
                                        {syncSelectedLoading
                                            ? `Processing ${selectedCount}...`
                                            : (transactionTypeFilter === 'C'
                                                ? `Receipt (${selectedCount})`
                                                : `Payment (${selectedCount})`)}
                                    </Button>
                                )}


                                {activeTab === 0 && selectedCount > 0 && showCheckboxes && transactionTypeFilter && (
                                    <Button
                                        variant="contained"
                                        onClick={handleContraClick}
                                        startIcon={<ContraIcon />}
                                        size="small"
                                        sx={{
                                            backgroundColor: '#6a1b9a',
                                            color: '#fff',
                                            '&:hover': { backgroundColor: '#4a148c' },
                                        }}
                                    >
                                        Contra ({selectedCount})
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {activeTab === 0 && (
                    <Box sx={{ mb: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, overflowX: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap' }}>
                                Filter by Transaction Type:
                            </Typography>
                            <RadioGroup
                                row
                                value={transactionTypeFilter}
                                onChange={handleTransactionTypeFilter}
                                sx={{ flexDirection: 'row' }}
                            >
                                <FormControlLabel value="C" control={<Radio />} label="Credit" />
                                <FormControlLabel value="D" control={<Radio />} label="Debit" />
                            </RadioGroup>
                            {transactionTypeFilter && (
                                <Button
                                    size="small"
                                    onClick={clearTransactionTypeFilter}
                                    startIcon={<ClearIcon />}
                                    variant="outlined"
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    Clear Filter
                                </Button>
                            )}
                            {showCheckboxes && (
                                <Typography variant="caption" color="primary" sx={{ whiteSpace: 'nowrap' }}>
                                    {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'} found for {transactionTypeFilter === 'C' ? 'Credit' : 'Debit'}.
                                </Typography>
                            )}
                            {activeTab === 0 && selectedCount > 0 && showCheckboxes && (
                                <Typography variant="body2" color="primary" sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                                    {selectedCount} row(s) selected. Total: ₹{selectedTotalAmount.toLocaleString()}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )}

                {activeTab === 1 && compareTransactions.length > 0 && newTransactionsCount > 0 && (
                    <Box sx={{ mb: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                        <Typography variant="body2">
                            <strong>{newTransactionsCount} new transaction(s)</strong> found from external source.
                        </Typography>
                    </Box>
                )}

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab
                            label={`DATABASE LIST (${transactions.length})`}
                            icon={<ListAlt />}
                            iconPosition="start"
                        />
                        <Tab
                            label={`TRANSACTION LIST (${compareTransactions.length}) ${newTransactionsCount > 0 ? `- ${newTransactionsCount} New` : ''}`}
                            icon={<CompareArrows />}
                            iconPosition="start"
                        />
                    </Tabs>
                </Box>

                {activeTab === 0 && (
                    <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", overflowX: "auto" }}>
                        <TableContainer>
                            <Table stickyHeader>
                                {renderDbTableHeader()}
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <StyledTableCell colSpan={dbColumns.length + (showCheckboxes ? 2 : 1)} align="center">
                                                <CircularProgress />
                                            </StyledTableCell>
                                        </TableRow>
                                    ) : filteredTransactions.length === 0 ? (
                                        <TableRow>
                                            <StyledTableCell colSpan={dbColumns.length + (showCheckboxes ? 2 : 1)} align="center">
                                                {transactionTypeFilter === ''
                                                    ? 'No transactions found'
                                                    : `No ${transactionTypeFilter === 'C' ? 'Credit' : 'Debit'} transactions found`}
                                            </StyledTableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedDbData.map((row, idx) => {
                                            const rowId = row.Refno || `${row.TranDate}_${row.TranParticulars}`;
                                            const syncType = getSyncType(row);
                                            const isReceiptSynced = syncType === 'receipt';
                                            const isPaymentSynced = syncType === 'payment';
                                            const isContraSynced = syncType === 'contra';
                                            const synced = isRowSynced(row);

                                            return (
                                                <StyledTableRow
                                                    key={idx}
                                                    receiptsynced={isReceiptSynced ? 1 : 0}
                                                    paymentsynced={isPaymentSynced ? 1 : 0}
                                                    contrasynced={isContraSynced ? 1 : 0}
                                                >
                                                    {showCheckboxes && !synced && (
                                                        <StyledCheckboxCell align="center">
                                                            <Checkbox
                                                                checked={!!selectedDbRows[rowId]}
                                                                onChange={() => handleDbRowSelect(row)}
                                                                size="small"
                                                                sx={{ padding: "0" }}
                                                            />
                                                        </StyledCheckboxCell>
                                                    )}
                                                    {showCheckboxes && synced && (
                                                        <StyledCheckboxCell align="center">

                                                        </StyledCheckboxCell>
                                                    )}
                                                    <StyledSerialCell align="center">
                                                        {dbPage * dbRowsPerPage + idx + 1}
                                                    </StyledSerialCell>
                                                    {dbColumns.map((col) => (
                                                        <StyledTableCell key={col.accessor} align="center">
                                                            {col.render ? col.render(row) : row[col.accessor]}
                                                        </StyledTableCell>
                                                    ))}
                                                </StyledTableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {filteredTransactions.length > 0 && (
                            <PaginationContainer>
                                <TablePagination
                                    component="div"
                                    count={filteredTransactions.length}
                                    rowsPerPage={dbRowsPerPage}
                                    page={dbPage}
                                    onPageChange={handleDbPageChange}
                                    rowsPerPageOptions={[]}
                                    sx={{
                                        "& .MuiTablePagination-toolbar": {
                                            padding: 0,
                                            minHeight: "auto",
                                        },
                                    }}
                                />
                                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                                    <InputLabel>Rows per page</InputLabel>
                                    <Select
                                        value={dbRowsPerPage}
                                        onChange={handleDbRowsPerPageChange}
                                        label="Rows per page"
                                    >
                                        {getPageSizeOptions().map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </PaginationContainer>
                        )}
                    </Paper>
                )}

                {activeTab === 1 && (
                    <>
                        {searchLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {compareTransactions.length === 0 && !searchLoading && (
                                    <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                        <Typography variant="body1" color="textSecondary">
                                            No transactions found. Click "Search & Compare" to fetch data from external source.
                                        </Typography>
                                    </Box>
                                )}
                                {compareTransactions.length > 0 && (
                                    <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", overflowX: "auto" }}>
                                        <TableContainer>
                                            <Table stickyHeader>
                                                {renderCompareTableHeader()}
                                                <TableBody>
                                                    {paginatedCompareData.map((row, idx) => (
                                                        <StyledTableRow key={idx} highlight={isNewTransaction(row)}>
                                                            <StyledTableCell align="center">
                                                                {comparePage * compareRowsPerPage + idx + 1}
                                                            </StyledTableCell>
                                                            <StyledTableCell align="center"></StyledTableCell>
                                                            {compareColumns.map((col) => (
                                                                <StyledTableCell key={col.accessor} align={col.align || "center"}>
                                                                    {col.render ? col.render(row) : row[col.accessor]}
                                                                </StyledTableCell>
                                                            ))}
                                                        </StyledTableRow>
                                                    ))}
                                                    {paginatedCompareData.length === 0 && (
                                                        <TableRow>
                                                            <StyledTableCell colSpan={compareColumns.length + 2} align="center">
                                                                No matching records found
                                                            </StyledTableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        <PaginationContainer>
                                            <TablePagination
                                                component="div"
                                                count={filteredData.length}
                                                rowsPerPage={compareRowsPerPage}
                                                page={comparePage}
                                                onPageChange={handleComparePageChange}
                                                rowsPerPageOptions={[]}
                                                sx={{
                                                    "& .MuiTablePagination-toolbar": {
                                                        padding: 0,
                                                        minHeight: "auto",
                                                    },
                                                }}
                                            />
                                            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                                                <InputLabel>Rows per page</InputLabel>
                                                <Select
                                                    value={compareRowsPerPage}
                                                    onChange={handleCompareRowsPerPageChange}
                                                    label="Rows per page"
                                                >
                                                    {getPageSizeOptions().map((option) => (
                                                        <MenuItem key={option} value={option}>
                                                            {option}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </PaginationContainer>
                                    </Paper>
                                )}
                            </>
                        )}
                    </>
                )}
            </Card>


            <Dialog
                open={excelModalOpen}
                onClose={() => setExcelModalOpen(false)}
                maxWidth="lg"
                fullWidth
            >
                <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Preview Extracted Excel Transactions ({excelSummary.total})</Typography>
                    <IconButton onClick={() => setExcelModalOpen(false)}>
                        <ClearIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Alert severity="info" sx={{ flex: 1, minWidth: '200px' }}>
                            <strong>Target Account:</strong> {accountNo} ({selectedAccount?.Account_name || ''})
                        </Alert>
                        <Alert severity="success" sx={{ flex: 1, minWidth: '200px' }}>
                            <strong>Credit (Receipts):</strong> {excelSummary.creditCount} transactions (Total: ₹{excelSummary.creditSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                        </Alert>
                        <Alert severity="warning" sx={{ flex: 1, minWidth: '200px' }}>
                            <strong>Debit (Payments):</strong> {excelSummary.debitCount} transactions (Total: ₹{excelSummary.debitSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                        </Alert>
                    </Box>

                    <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                        <Table stickyHeader size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center"><strong>S.No</strong></TableCell>
                                    <TableCell align="center"><strong>Date</strong></TableCell>
                                    <TableCell align="left"><strong>Particulars</strong></TableCell>
                                    <TableCell align="center"><strong>Cheque/Ref No</strong></TableCell>
                                    <TableCell align="center"><strong>Type</strong></TableCell>
                                    <TableCell align="right"><strong>Amount</strong></TableCell>
                                    <TableCell align="right"><strong>Balance</strong></TableCell>
                                    <TableCell align="center"><strong>Action</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {extractedExcelData.map((row, idx) => (
                                    <TableRow key={idx} hover>
                                        <TableCell align="center">{idx + 1}</TableCell>
                                        <TableCell align="center">{row.TranDate}</TableCell>
                                        <TableCell align="left">{row.TranParticulars}</TableCell>
                                        <TableCell align="center">{row.ChequeNum || '-'}</TableCell>
                                        <TableCell align="center">
                                            <Chip
                                                label={row.TranType === 'C' ? 'Credit' : 'Debit'}
                                                color={row.TranType === 'C' ? 'success' : 'warning'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell align="right">₹{parseFloat(row.Amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                                        <TableCell align="right">{row.AcctBal || '-'}</TableCell>
                                        <TableCell align="center">
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => {
                                                    const updated = extractedExcelData.filter((_, i) => i !== idx);
                                                    setExtractedExcelData(updated);
                                                    let cCount = 0, cSum = 0, dCount = 0, dSum = 0;
                                                    updated.forEach(item => {
                                                        const amt = parseFloat(item.Amount || 0);
                                                        if (item.TranType === 'C') {
                                                            cCount++;
                                                            cSum += amt;
                                                        } else {
                                                            dCount++;
                                                            dSum += amt;
                                                        }
                                                    });
                                                    setExcelSummary({
                                                        total: updated.length,
                                                        creditCount: cCount,
                                                        creditSum: cSum,
                                                        debitCount: dCount,
                                                        debitSum: dSum
                                                    });
                                                }}
                                            >
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setExcelModalOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleConfirmExcelUpload}
                        disabled={excelUploading || extractedExcelData.length === 0}
                        startIcon={excelUploading ? <CircularProgress size={20} color="inherit" /> : <FileUploadIcon />}
                    >
                        {excelUploading ? "Inserting into Database..." : `Confirm & Insert (${extractedExcelData.length} Rows)`}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Bank;