import React, { useState, useEffect } from "react";
import {
  Card, Paper, IconButton, Button, TextField, FormControl, 
  InputLabel, Select, MenuItem, Grid, Box, Tab, Tabs, 
  CircularProgress, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination,
  InputAdornment, Tooltip, Checkbox, RadioGroup, Radio, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions
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
  Payment as PaymentIcon
} from "@mui/icons-material";
import { fetchLink } from '../../Components/fetchComponent';
import { toast } from 'react-toastify';
import { checkIsNumber, isArray, ISOString, isValidObject, stringCompare, toArray, toNumber, reactSelectFilterLogic } from "../../Components/functions";
import RequiredStar from '../../Components/requiredStar';
import { customSelectStyles } from "../../Components/tablecolumn";


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

const StyledTableRow = styled(TableRow)(({ highlight, receiptsynced, paymentsynced }) => ({
  backgroundColor: receiptsynced ? "#e3f2fd" : paymentsynced ? "#fff3e0" : highlight ? "#e8f5e9" : "#fff",
  "&:hover": {
    backgroundColor: receiptsynced ? "#bbdefb" : paymentsynced ? "#ffe0b2" : highlight ? "#c8e6c9" : "#f5f5f5",
  },
  "& td": {
    backgroundColor: receiptsynced ? "#e3f2fd" : paymentsynced ? "#fff3e0" : highlight ? "#e8f5e9" : "transparent",
    borderRight: "1px solid #e0e0e0",
  },
  "& td:last-child": {
    borderRight: "none",
  },
  "&:hover td": {
    backgroundColor: receiptsynced ? "#bbdefb" : paymentsynced ? "#ffe0b2" : highlight ? "#c8e6c9" : "#f5f5f5",
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
 {
        label: 'Select',
        value: ''
    },
    {
        label: 'ATM',
        value: 'ATM'
    },
    {
        label: 'Card',
        value: 'Card'
    },
    {
        label: 'Cash',
        value: 'Cash'
    },
    {
        label: 'Cheque/DD',
        value: 'Cheque/DD'
    },
    {
        label: 'ECS',
        value: 'ECS'
    },
    {
        label: 'e-Fund Transfer',
        value: 'e-Fund Transfer'
    },
    {
        label: 'Electronic Cheque',
        value: 'Electronic Cheque'
    },
    {
        label: 'Electronic DD/PO',
        value: 'Electronic DD/PO'
    },
    {
        label: 'UPI',
        value: 'UPI'
    },
    {
        label: 'Others',
        value: 'Others'
    },
];

 const paymentStatus = [
    {
        label: 'New',
        value: 1
    },
    {
        label: 'Process',
        value: 2
    },
    {
        label: 'Completed',
        value: 3
    },
    {
        label: 'Canceled',
        value: 0
    },
]


const receiptStatus = [
    {
        label: 'New',
        value: 1
    },
    {
        label: 'Process',
        value: 2
    },
    {
        label: 'Completed',
        value: 3
    },
    {
        label: 'Canceled',
        value: 0
    },
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

const Bank = ({ loadingOn, loadingOff }) => {
  const today = new Date().toISOString().split('T')[0];

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
  

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  
 
  const [baseData, setBaseData] = useState({
    accountsList: [],
    accountGroupData: [],
    voucherType: [],
    defaultBankMaster: [],
  });
  
 
  const [paymentFilterData, setPaymentFilterData] = useState({
    debit_accounts: [],
    credit_accounts: [],
    voucherType: [],
    created_by: [],
  });
  
 
  const [receiptFilterData, setReceiptFilterData] = useState({
    debit_accounts: [],
    credit_accounts: [],
    voucherType: [],
    created_by: [],
  });
  

  const [paymentForm, setPaymentForm] = useState({
    pay_id: '',
    payment_date: today,
    pay_bill_type: '',
    payment_voucher_type_id: '',
    status: '',
    Alter_Reason: '',
    debit_amount: '',
    transaction_type: '',
    remarks: '',
    check_no: '',
    check_date: '',
    bank_name: '',
    debit_ledger: '',
    debit_ledger_name: '',
    credit_ledger: '',
    credit_ledger_name: '',
  });
  
 
  const [receiptForm, setReceiptForm] = useState({
    receipt_id: '',
    receipt_date: today,
    receipt_bill_type: '',
    receipt_voucher_type_id: '',
    status: '',
    Alter_Reason: '',
    credit_amount: '',
    transaction_type: '',
    remarks: '',
    check_no: '',
    check_date: '',
    bank_name: '',
    debit_ledger: '',
    debit_ledger_name: '',
    credit_ledger: '',
    credit_ledger_name: '',
  });


  const [selectedDebitGroup, setSelectedDebitGroup] = useState({ value: '', label: '' });
  const [selectedCreditGroup, setSelectedCreditGroup] = useState({ value: '', label: '' });
  const [filteredDebitAccounts, setFilteredDebitAccounts] = useState([]);
  const [filteredCreditAccounts, setFilteredCreditAccounts] = useState([]);

  const [dbPage, setDbPage] = useState(0);
  const [dbRowsPerPage, setDbRowsPerPage] = useState(10);
  const [comparePage, setComparePage] = useState(0);
  const [compareRowsPerPage, setCompareRowsPerPage] = useState(10);
  
  const [searchValues, setSearchValues] = useState({});
  const [appliedFilters, setAppliedFilters] = useState({});
  const [globalSearch, setGlobalSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  
  const [selectedDbRows, setSelectedDbRows] = useState({});
  const [selectedAccount, setSelectedAccount] = useState(null);


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

 
  function getAllChildGroupIds(groupId, groupList, visited = new Set()) {
    if (visited.has(groupId)) return [];
    visited.add(groupId);
    let result = [groupId];
    const children = groupList.filter(group => group.Parent_AC_id === groupId);
    for (const child of children) {
      result = result.concat(getAllChildGroupIds(child.Group_Id, groupList, visited));
    }
    return result;
  }

  function filterAccountsByGroupIds(selectedGroupId, accountGroups, accountsList) {
    const validGroupIds = getAllChildGroupIds(selectedGroupId, accountGroups);
    return accountsList.filter(account => validGroupIds.includes(account.Group_Id));
  }

  const handleDebitGroupSelect = (groupId, groupValue) => {
    const filtered = filterAccountsByGroupIds(groupId, baseData.accountGroupData, baseData.accountsList);
    setSelectedDebitGroup({ value: groupId, label: groupValue });
    setFilteredDebitAccounts(filtered);
  };

  const handleCreditGroupSelect = (groupId, groupValue) => {
    const filtered = filterAccountsByGroupIds(groupId, baseData.accountGroupData, baseData.accountsList);
    setSelectedCreditGroup({ value: groupId, label: groupValue });
    setFilteredCreditAccounts(filtered);
  };
  
 
  const fetchPaymentFilterData = async () => {
    try {
      const response = await fetchLink({
        address: `payment/paymentMaster/filtersValues`
      });
      
      if (response.success) {
        setPaymentFilterData({
          debit_accounts: response.others?.debit_accounts || [],
          credit_accounts: response.others?.credit_accounts || [],
          voucherType: response.others?.voucherType || [],
          created_by: response.others?.created_by || [],
        });
      }
    } catch (err) {
      console.error("Error fetching payment filter data:", err);
    }
  };
  

  const fetchReceiptFilterData = async () => {
    try {
      const response = await fetchLink({
        address: `receipt/receiptMaster/filtersValues`
      });
      
      if (response.success) {
        setReceiptFilterData({
          debit_accounts: response.others?.debit_accounts || [],
          credit_accounts: response.others?.credit_accounts || [],
          voucherType: response.others?.voucherType || [],
          created_by: response.others?.created_by || [],
        });
      }
    } catch (err) {
      console.error("Error fetching receipt filter data:", err);
    }
  };
  
  const fetchAccountNumbers = async () => {
    try {
      setAccountsLoading(true);
      const response = await fetchLink({
        address: 'masters/accountNo'
      });

      if (response.success) {
        setAccountList(response.data || []);
        if (response.data && response.data.length > 0) {
          setAccountNo(response.data[0].value);
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

  const handleSyncSelectedClick = async () => {
    const selectedRowsArray = Object.values(selectedDbRows);
    if (selectedRowsArray.length === 0) {
      toast.warning('No rows selected');
      return;
    }
    
    setSelectedTransactions(selectedRowsArray);
    
    if (transactionTypeFilter === 'C') {
      setDialogType('receipt');
      await fetchReceiptFilterData();
      setOpenDialog(true);
      const totalAmount = selectedRowsArray.reduce((sum, txn) => sum + parseFloat(txn.Amount.replace(/[^0-9.-]/g, '')), 0);
      setReceiptForm({
        ...receiptForm,
        receipt_date: today,
        credit_amount: totalAmount.toString(),
        debit_ledger: '',
        debit_ledger_name: '',
        credit_ledger: '',
        credit_ledger_name: '',
      });
      // Reset ledger selections
      setSelectedDebitGroup({ value: '', label: '' });
      setSelectedCreditGroup({ value: '', label: '' });
      setFilteredDebitAccounts([]);
      setFilteredCreditAccounts([]);
    } else if (transactionTypeFilter === 'D') {
      setDialogType('payment');
      await fetchPaymentFilterData();
      setOpenDialog(true);
      const totalAmount = selectedRowsArray.reduce((sum, txn) => sum + parseFloat(txn.Amount.replace(/[^0-9.-]/g, '')), 0);
      setPaymentForm({
        ...paymentForm,
        payment_date: today,
        debit_amount: totalAmount.toString(),
        debit_ledger: '',
        debit_ledger_name: '',
        credit_ledger: '',
        credit_ledger_name: '',
      });
      // Reset ledger selections
      setSelectedDebitGroup({ value: '', label: '' });
      setSelectedCreditGroup({ value: '', label: '' });
      setFilteredDebitAccounts([]);
      setFilteredCreditAccounts([]);
    }
  };
  

  const handlePaymentSubmit = async () => {

    if (!paymentForm.payment_voucher_type_id) {
      toast.warn('Select Voucher Type!');
      return;
    }
    if (!paymentForm.pay_bill_type) {
      toast.warn('Select Bill Type!');
      return;
    }
    if (!paymentForm.transaction_type) {
      toast.warn('Select Transaction Type!');
      return;
    }
    if (!paymentForm.debit_ledger) {
      toast.warn('Select Debit Account!');
      return;
    }
    // if (!paymentForm.credit_ledger) {
    //   toast.warn('Select Credit Account!');
    //   return;
    // }
    if (paymentForm.debit_amount < 1 || !paymentForm.debit_amount) {
      toast.warn('Enter valid amount!');
      return;
    }

    try {
      setSyncSelectedLoading(true);
      if (loadingOn) loadingOn();
      
      const selectedTransactionsData = selectedTransactions.map(txn => ({
        Id:txn.Id,
        Refno: txn.Refno,
        TranDate: txn.TranDate,
        TranParticulars: txn.TranParticulars,
        ChequeNum: txn.ChequeNum || '',
        TranType: txn.TranType,
        Amount: txn.Amount,
        AcctBal: txn.AcctBal
      }));
      
      const payload = {
        accountNo,
        Acc: selectedAccount,
        transactions: selectedTransactionsData,
        paymentDetails: {
          pay_bill_type: paymentForm.pay_bill_type,
          payment_date: paymentForm.payment_date,
          payment_voucher_type_id: paymentForm.payment_voucher_type_id,
          debit_amount: paymentForm.debit_amount,
          transaction_type: paymentForm.transaction_type,
          remarks: paymentForm.remarks,
          check_no: paymentForm.check_no,
          check_date: paymentForm.check_date,
          bank_name: paymentForm.bank_name,
          status: paymentForm.status,
          debit_ledger: paymentForm.debit_ledger,
          debit_ledger_name: paymentForm.debit_ledger_name,
          credit_ledger: paymentForm.credit_ledger,
          credit_ledger_name: paymentForm.credit_ledger_name,
        },
        selectedCheckboxData: {
          Acc_id: selectedAccount?.Acc_Id,
          selectedCount: selectedTransactions.length,
          selectedTransactionIds: selectedTransactions.map(txn => txn.Refno || `${txn.TranDate}_${txn.TranParticulars}`),
          selectedTransactionKeys: selectedTransactions.map(txn => getTransactionKey(txn)),
          totalAmount: selectedTransactions.reduce((sum, txn) => sum + parseFloat(txn.Amount.replace(/[^0-9.-]/g, '')), 0),
          transactionType: 'debit',
          accountNo: accountNo,
          fromDate: fromDate,
          toDate: toDate
        }
      };
      
      const response = await fetchLink({
        address: 'payment/syncSelectedWithPayment',
        method: 'POST',
        bodyData: payload,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.success) {
        toast.success(`payment processed successfully`);
        await fetchBankStatement();
        setSelectedDbRows({});
        setTransactionTypeFilter('');
        setFilteredTransactions(transactions);
        setShowCheckboxes(false);
        setOpenDialog(false);
        
        setPaymentForm({
          pay_id: '',
          payment_date: today,
          pay_bill_type: '',
          payment_voucher_type_id: '',
          status: '1',
          Alter_Reason: '',
          debit_amount: '',
          transaction_type: '',
          remarks: '',
          check_no: '',
          check_date: '',
          bank_name: '',
          debit_ledger: '',
          debit_ledger_name: '',
          credit_ledger: '',
          credit_ledger_name: '',
        });
      } else {
        toast.error(response.message || 'Failed to process payments');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error processing payments');
    } finally {
      setSyncSelectedLoading(false);
      if (loadingOff) loadingOff();
    }
  };
  

  const handleReceiptSubmit = async () => {
    if (!receiptForm.receipt_voucher_type_id) {
      toast.warn('Select Voucher Type!');
      return;
    }
    if (!receiptForm.receipt_bill_type) {
      toast.warn('Select Bill Type!');
      return;
    }
    if (!receiptForm.transaction_type) {
      toast.warn('Select Transaction Type!');
      return;
    }
    // if (!receiptForm.debit_ledger) {
    //   toast.warn('Select Debit Account!');
    //   return;
    // }
    if (!receiptForm.credit_ledger) {
      toast.warn('Select Credit Account!');
      return;
    }

    try {
      setSyncSelectedLoading(true);
      if (loadingOn) loadingOn();
      
      const selectedTransactionsData = selectedTransactions.map(txn => ({
        Id:txn.Id,
        Refno: txn.Refno,
        TranDate: txn.TranDate,
        TranParticulars: txn.TranParticulars,
        ChequeNum: txn.ChequeNum || '',
        TranType: txn.TranType,
        Amount: txn.Amount,
        AcctBal: txn.AcctBal
      }));
      
      const payload = {
        accountNo,
        Acc: selectedAccount,
        transactions: selectedTransactionsData,
        receiptDetails: {
          receipt_bill_type: receiptForm.receipt_bill_type,
          receipt_date: receiptForm.receipt_date,
          receipt_voucher_type_id: receiptForm.receipt_voucher_type_id,
          credit_amount: receiptForm.credit_amount,
          transaction_type: receiptForm.transaction_type,
          remarks: receiptForm.remarks,
          check_no: receiptForm.check_no,
          check_date: receiptForm.check_date,
          bank_name: receiptForm.bank_name,
          status: receiptForm.status,
          debit_ledger: receiptForm.debit_ledger,
          debit_ledger_name: receiptForm.debit_ledger_name,
          credit_ledger: receiptForm.credit_ledger,
          credit_ledger_name: receiptForm.credit_ledger_name,
        },
        selectedCheckboxData: {
          selectedCount: selectedTransactions.length,
          Acc_id: selectedAccount?.Acc_Id,
          selectedTransactionIds: selectedTransactions.map(txn => txn.Refno || `${txn.TranDate}_${txn.TranParticulars}`),
          selectedTransactionKeys: selectedTransactions.map(txn => getTransactionKey(txn)),
          totalAmount: selectedTransactions.reduce((sum, txn) => sum + parseFloat(txn.Amount.replace(/[^0-9.-]/g, '')), 0),
          transactionType: 'credit',
          accountNo: accountNo,
          fromDate: fromDate,
          toDate: toDate
        }
      };

      const response = await fetchLink({
        address: 'receipt/syncSelectedWithReceipt',
        method: 'POST',
        bodyData: payload,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.success) {
        toast.success(`receipt(s) processed successfully`);
        await fetchBankStatement();
        setSelectedDbRows({});
        setTransactionTypeFilter('');
        setFilteredTransactions(transactions);
        setShowCheckboxes(false);
        setOpenDialog(false);
        
        setReceiptForm({
          receipt_id: '',
          receipt_date: today,
          receipt_bill_type: '',
          receipt_voucher_type_id: '',
          status: '1',
          Alter_Reason: '',
          credit_amount: '',
          transaction_type: '',
          remarks: '',
          check_no: '',
          check_date: '',
          bank_name: '',
          debit_ledger: '',
          debit_ledger_name: '',
          credit_ledger: '',
          credit_ledger_name: '',
        });
      } else {
        toast.error(response.message || 'Failed to process receipts');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error processing receipts');
    } finally {
      setSyncSelectedLoading(false);
      if (loadingOff) loadingOff();
    }
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDialogType('');
    setSelectedTransactions([]);
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
    if (accountNo) {
      fetchBankStatement();
      setSelectedDbRows({});
      setTransactionTypeFilter('');
      setFilteredTransactions([]);
      setShowCheckboxes(false);
    }
  }, [accountNo]);

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

  const handleDbRowSelect = (row) => {
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
    const currentPageRows = paginatedDbData;
    const allSelected = currentPageRows.every(row => {
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

  const handleSearchChange = (columnName, value) => {
    setSearchValues(prev => ({ ...prev, [columnName]: value }));
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
  
  const allSelectedOnPage = paginatedDbData.length > 0 && paginatedDbData.every(row => {
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
              indeterminate={selectedCount > 0 && selectedCount < paginatedDbData.length}
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
                  {selectedCount} row(s) selected.
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
                      const isPaymentSynced = row.pay_id    && !row.receipt_id; 
                    
                      return (
                        <StyledTableRow
                          key={idx}
                          receiptsynced={isReceiptSynced ? 1 : 0}  
                          paymentsynced={isPaymentSynced ? 1 : 0}
                        >
                          {showCheckboxes && (
                            <StyledCheckboxCell align="center">
                              <Checkbox
                                checked={!!selectedDbRows[rowId]}
                                onChange={() => handleDbRowSelect(row)}
                                size="small"
                                sx={{ padding: "0" }}
                              />
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

      {/* Payment Dialog for Debit Transactions */}
      <Dialog open={openDialog && dialogType === 'payment'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#ff9800', color: 'white' }}>
          <PaymentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Payment Details - Debit Transactions
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Paper sx={{ p: 2, mb: 3, bgcolor: '#fff3e0' }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Transactions: {selectedTransactions.length}
              </Typography>
           
            </Paper>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom>Date <span style={{ color: 'red' }}>*</span></Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom>Bill Type <span style={{ color: 'red' }}>*</span></Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={paymentForm.pay_bill_type}
                    onChange={(e) => setPaymentForm({ ...paymentForm, pay_bill_type: e.target.value })}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select</MenuItem>
                    {paymentTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom>Voucher <span style={{ color: 'red' }}>*</span></Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={paymentForm.payment_voucher_type_id}
                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_voucher_type_id: e.target.value })}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select</MenuItem>
                    {paymentFilterData.voucherType.map((voucher) => (
                      <MenuItem key={voucher.value} value={voucher.value}>
                        {voucher.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

             
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom>Transaction Type <span style={{ color: 'red' }}>*</span></Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={paymentForm.transaction_type}
                    onChange={(e) => setPaymentForm({ ...paymentForm, transaction_type: e.target.value })}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select</MenuItem>
                    {transactionTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

                <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" gutterBottom>Status <span style={{ color: 'red' }}>*</span></Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={paymentForm.status}
                    onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value })}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>Select</MenuItem>
                    {receiptStatus.map((type) => (
                      <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>



              {/* Ledger Section */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1, borderBottom: '1px solid #e0e0e0' }}>
                  Ledger Details
                </Typography>
              </Grid>

      
<Grid item xs={12} sm={6} md={4}>
  <Typography variant="body2" gutterBottom>Debit Group</Typography>
  <FormControl fullWidth size="small">
    <Select
      value={selectedDebitGroup?.value || ''}
      onChange={(e) => {
        const group = baseData.accountGroupData.find(g => g.Group_Id === e.target.value);
        const selected = group ? { value: group.Group_Id, label: group.Group_Name } : null;
        setSelectedDebitGroup(selected);
        setFilteredDebitAccounts(
          selected
            ? baseData.accountsList.filter(a => a.Group_Id === selected.value)
            : []
        );
    
        setPaymentForm(prev => ({ ...prev, debit_ledger: '', debit_ledger_name: '' }));
      }}
      displayEmpty
    >
      <MenuItem value="">All Groups</MenuItem>
      {(baseData.accountGroupData || []).map(group => (
        <MenuItem key={group.Group_Id} value={group.Group_Id}>
          {group.Group_Name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>


<Grid item xs={12} sm={6} md={8}>
  <Typography variant="body2" gutterBottom>
    Debit Account <span style={{ color: 'red' }}>*</span>
  </Typography>
  <FormControl fullWidth size="small">
    <Select
      value={paymentForm.debit_ledger || ''} 
      onChange={(e) => {
        const account = (selectedDebitGroup?.value
          ? filteredDebitAccounts
          : baseData.accountsList
        ).find(a => a.Acc_Id === e.target.value);
      
        setPaymentForm({
          ...paymentForm,
          debit_ledger:      e.target.value,
          debit_ledger_name: account?.Account_name || ''
        });
      }}
      displayEmpty
    >
      <MenuItem value="" disabled>Select Debit Account</MenuItem>
      {(selectedDebitGroup?.value
        ? filteredDebitAccounts
        : (baseData.accountsList || [])
      ).map(account => (
        <MenuItem key={account.Acc_Id} value={account.Acc_Id}>
          {account.Account_name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handlePaymentSubmit} variant="contained" color="warning" disabled={syncSelectedLoading}>
            {syncSelectedLoading ? <CircularProgress size={24} /> : 'Submit Payment'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDialog && dialogType === 'receipt'} onClose={handleCloseDialog} maxWidth="md" fullWidth>
  <DialogTitle sx={{ bgcolor: '#4caf50', color: 'white' }}>
    <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
    Receipt Details - Credit Transactions
  </DialogTitle>
  <DialogContent>
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#e8f5e9' }}>
        <Typography variant="subtitle2" gutterBottom>
          Selected Transactions: {selectedTransactions.length}
        </Typography>
      </Paper>

      <Grid container spacing={2}>

        {/* Date */}
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="body2" gutterBottom>Date <span style={{ color: 'red' }}>*</span></Typography>
          <TextField
            type="date"
            fullWidth
            size="small"
            value={receiptForm.receipt_date}
            onChange={(e) => setReceiptForm({ ...receiptForm, receipt_date: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* Bill Type */}
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="body2" gutterBottom>Bill Type <span style={{ color: 'red' }}>*</span></Typography>
          <FormControl fullWidth size="small">
            <Select
              value={receiptForm.receipt_bill_type}
              onChange={(e) => setReceiptForm({ ...receiptForm, receipt_bill_type: e.target.value })}
              displayEmpty
            >
              <MenuItem value="" disabled>Select</MenuItem>
              {receiptTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Voucher */}
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="body2" gutterBottom>Voucher <span style={{ color: 'red' }}>*</span></Typography>
          <FormControl fullWidth size="small">
            <Select
              value={receiptForm.receipt_voucher_type_id}
              onChange={(e) => setReceiptForm({ ...receiptForm, receipt_voucher_type_id: e.target.value })}
              displayEmpty
            >
              <MenuItem value="" disabled>Select</MenuItem>
              {receiptFilterData.voucherType.map((voucher) => (
                <MenuItem key={voucher.value} value={voucher.value}>
                  {voucher.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Transaction Type */}
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="body2" gutterBottom>Transaction Type <span style={{ color: 'red' }}>*</span></Typography>
          <FormControl fullWidth size="small">
            <Select
              value={receiptForm.transaction_type}
              onChange={(e) => setReceiptForm({ ...receiptForm, transaction_type: e.target.value })}
              displayEmpty
            >
              <MenuItem value="" disabled>Select</MenuItem>
              {transactionTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
    <Grid item xs={12} sm={6} md={4}>
          <Typography variant="body2" gutterBottom>Status <span style={{ color: 'red' }}>*</span></Typography>
          <FormControl fullWidth size="small">
            <Select
              value={receiptForm.status}
              onChange={(e) => setReceiptForm({ ...receiptForm, status: e.target.value })}
              displayEmpty
            >
              <MenuItem value="" disabled>Select</MenuItem>
              {receiptStatus.map((type) => (
                <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      
        <Grid item xs={12}>
          <h5 className="border-start border-primary border-3 p-2 m-0">Ledger Info</h5>
        </Grid>

      
        <Grid item xs={12} sm={6} md={4}>
          
        </Grid>

       
        <Grid item xs={12} sm={6} md={8}>
         
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="body2" gutterBottom>Credit Group</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={selectedCreditGroup?.value || ''}
              onChange={(e) => {
                const group = baseData.accountGroupData.find(g => g.Group_Id === e.target.value);
                const selected = group ? { value: group.Group_Id, label: group.Group_Name } : null;
                setSelectedCreditGroup(selected);
                setFilteredCreditAccounts(
                  selected
                    ? baseData.accountsList.filter(a => a.Group_Id === selected.value)
                    : []
                );
                
                setReceiptForm(prev => ({ ...prev, credit_ledger: '', credit_ledger_name: '' }));
              }}
              displayEmpty
            >
              <MenuItem value="">All Groups</MenuItem>
              {(baseData.accountGroupData || []).map(group => (
                <MenuItem key={group.Group_Id} value={group.Group_Id}>
                  {group.Group_Name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

    
        <Grid item xs={12} sm={6} md={8}>
          <Typography variant="body2" gutterBottom>
            Credit Account <span style={{ color: 'red' }}>*</span>
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={receiptForm.credit_ledger || ''}
              onChange={(e) => {
                const account = (selectedCreditGroup?.value
                  ? filteredCreditAccounts
                  : baseData.accountsList
                ).find(a => a.Acc_Id === e.target.value);
                setReceiptForm({
                  ...receiptForm,
                  credit_ledger:      e.target.value,
                  credit_ledger_name: account?.Account_name || ''
                });
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>Select Credit Account</MenuItem>
              {(selectedCreditGroup?.value
                ? filteredCreditAccounts
                : (baseData.accountsList || [])
              ).map(account => (
                <MenuItem key={account.Acc_Id} value={account.Acc_Id}>
                  {account.Account_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

      </Grid>
    </Box>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseDialog}>Cancel</Button>
    <Button
      onClick={handleReceiptSubmit}
      variant="contained"
      color="success"
      disabled={syncSelectedLoading}
    >
      {syncSelectedLoading ? <CircularProgress size={24} /> : 'Submit Receipt'}
    </Button>
  </DialogActions>
</Dialog>
    </>
  );
};

export default Bank;