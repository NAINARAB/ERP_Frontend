
import React, { useState, useEffect } from "react";
import {
  Card, Paper, IconButton, Button, TextField, FormControl, 
  InputLabel, Select, MenuItem, Grid, Box, Tab, Tabs, 
  CircularProgress, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination,
  InputAdornment, Tooltip, Checkbox, RadioGroup, Radio, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert
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
  Add as AddIcon
} from "@mui/icons-material";
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

const StyledTableRow = styled(TableRow)(({ receiptsynced, paymentsynced }) => ({
  backgroundColor: receiptsynced ? "#e3f2fd" : paymentsynced ? "#fff3e0" : "#fff",
  "&:hover": {
    backgroundColor: receiptsynced ? "#bbdefb" : paymentsynced ? "#ffe0b2" : "#f5f5f5",
  },
  "& td": {
    backgroundColor: receiptsynced ? "#e3f2fd" : paymentsynced ? "#fff3e0" : "transparent",
    borderRight: "1px solid #e0e0e0",
  },
  "& td:last-child": {
    borderRight: "none",
  },
  "&:hover td": {
    backgroundColor: receiptsynced ? "#bbdefb" : paymentsynced ? "#ffe0b2" : "#f5f5f5",
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

// Storage utility functions
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
  
  // State for tracking if selections were restored
  const [selectionsRestored, setSelectionsRestored] = useState(false);

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
    
    // Clear session storage when navigating
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
        // Clear session storage after sync
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

  // Effect to restore selections when component mounts
  useEffect(() => {
    if (filteredTransactions.length > 0 && !selectionsRestored) {
      const { selections, filter } = getSelectionsFromSession();
      
      if (Object.keys(selections).length > 0 && filter) {
        // Restore filter
        setTransactionTypeFilter(filter);
        
        // Restore selections
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

  // Save selections when they change
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
    return (row.receipt_id && !row.pay_id) || (row.pay_id && !row.receipt_id);
  };

  const handleDbRowSelect = (row) => {
    // Don't allow selection of synced rows
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
    const currentPageRows = paginatedDbData.filter(row => !isRowSynced(row)); // Only select non-synced rows
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
              <Box sx={{ display: 'flex', gap: 1 }}>
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

                {activeTab === 0 && selectedCount > 0 && showCheckboxes && (
                  <Button
                    variant="contained"
                    color={transactionTypeFilter === 'C' ? 'success' : 'warning'}
                    onClick={handleSyncSelectedClick}
                    startIcon={syncSelectedLoading ? <CircularProgress size={20} /> : (transactionTypeFilter === 'C' ? <ReceiptIcon /> : <PaymentIcon />)}
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
                      const isReceiptSynced = row.receipt_id && !row.pay_id;  
                      const isPaymentSynced = row.pay_id && !row.receipt_id;
                      const synced = isReceiptSynced || isPaymentSynced;
                    
                      return (
                        <StyledTableRow
                          key={idx}
                          receiptsynced={isReceiptSynced ? 1 : 0}  
                          paymentsynced={isPaymentSynced ? 1 : 0}
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
                              {/* Empty cell for synced rows - no checkbox */}
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
    </>
  );
};

export default Bank;