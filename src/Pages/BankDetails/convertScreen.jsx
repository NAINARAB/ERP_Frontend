

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Card,
    Paper,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Box,
    Typography,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    IconButton,
    Chip,
} from "@mui/material";
import { 
    Save as SaveIcon,
    Receipt as ReceiptIcon,
    Payment as PaymentIcon,
    ArrowBack as ArrowBackIcon,
    Description as DescriptionIcon,
    Close as CloseIcon
} from "@mui/icons-material";
import { fetchLink } from '../../Components/fetchComponent';
import { toast } from 'react-toastify';
import { NumberFormat } from "../../Components/functions";
import { useLocation, useNavigate } from "react-router-dom";

const createCol = (field = '', type = 'string', ColumnHeader = '', align = 'left', verticalAlign = 'center', isVisible = 1) => ({
    isVisible: isVisible,
    Field_Name: field,
    Fied_Data: type,
    align,
    verticalAlign,
    ...(ColumnHeader && { ColumnHeader })
});

const paymentBillTypes = [
    { value: 1, label: 'VENDOR - PURCHASE INVOICE' },
    { value: 2, label: 'EXPENCES / OTHERS (IN-DIRECT)' },
    { value: 3, label: 'EXPENCES - STOCK JOURNAL (DIRECT)' },
    { value: 4, label: 'ON ACCOUNT' }
];

const receiptBillTypes = [
    { value: 1, label: 'CUSTOMER - SALES INVOICE' },
    { value: 2, label: 'EXPENCES - RETURN' },
    { value: 3, label: 'ON ACCOUNT' }
];

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

const ConvertScreen = ({ loadingOn, loadingOff }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;
    
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [voucherTypes, setVoucherTypes] = useState([]);
    
    // Base data for accounts and groups
    const [baseData, setBaseData] = useState({
        accountsList: [],
        accountGroupData: [],
        voucherType: [],
        defaultBankMaster: [],
    });
    
    // Filter data states
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
    
    // Get data from navigation state
    const { transactions = [], transactionType = '', accountNo, selectedAccount, fromDate, toDate } = state || {};
    
    // Common configuration
    const [commonConfig, setCommonConfig] = useState({
        voucherType: '',
        billType: '',
        transaction_type: '',
        status: '',
        remarks: '',
        receipt_date: '', // Add this for receipt
        payment_date: ''  // Add this for payment
    });
    
    // Store row configurations in an array to maintain order
    const [rowConfigs, setRowConfigs] = useState([]);

    // Pending References Dialog State
    const [referencesDialogOpen, setReferencesDialogOpen] = useState(false);
    const [currentRowId, setCurrentRowId] = useState(null);
    const [pendingReferences, setPendingReferences] = useState([]);
    const [selectedReferences, setSelectedReferences] = useState([]); // Changed to array for multiple selections
    const [referencesLoading, setReferencesLoading] = useState(false);

    useEffect(() => {
        if (transactions?.length > 0) {
            fetchBaseData();
            initializeRowConfigs();
        } else {
            toast.error('No transactions selected');
            navigate(-1);
        }
    }, [transactions, transactionType]);

    const initializeRowConfigs = () => {
        const configs = transactions.map((txn, idx) => {
            const amount = parseFloat(txn.Amount?.replace(/[^0-9.-]/g, '')) || 0;
            return {
                id: idx, // Use index as stable identifier
                transaction: txn,
                debit_ledger: '',
                debit_ledger_name: '',
                credit_ledger: '',
                credit_ledger_name: '',
                amount: amount,
                original_amount: amount,
                remarks: '',
                selectedInvoices: [], // New field for storing invoice references as chips
                check_no: txn.ChequeNum || '',
                check_date: '',
                bank_name: txn.BankName || '',
                selectedDebitGroup: '',
                selectedDebitGroupLabel: '',
                selectedCreditGroup: '',
                selectedCreditGroupLabel: '',
                filteredDebitAccounts: [],
                filteredCreditAccounts: []
            };
        });
        setRowConfigs(configs);
    };

    const fetchBaseData = async () => {
        setDataLoading(true);
        try {
            const [
                accountsResponse,
                accountsGroupResponse,
                voucherRes
            ] = await Promise.all([
                fetchLink({ address: `payment/accounts` }),
                fetchLink({ address: `payment/accountGroup` }),
                fetchLink({ address: 'masters/voucher' })
            ]);

            const accountsList = (accountsResponse?.success ? accountsResponse.data : []).map(acc => ({
                ...acc,
                Acc_Id: String(acc.Acc_Id),
                Group_Id: String(acc.Group_Id)
            }));
            const accountGroupData = (accountsGroupResponse?.success ? accountsGroupResponse.data : []).map(group => ({
                ...group,
                Group_Id: String(group.Group_Id),
                Parent_AC_id: String(group.Parent_AC_id)
            }));

            setBaseData({
                accountsList: accountsList,
                accountGroupData: accountGroupData,
                voucherType: [],
                defaultBankMaster: [],
            });

            // Set voucher types
            if (voucherRes?.success) {
                const filtered = transactionType === 'receipt' 
                    ? voucherRes.data.filter(v => v.Type === 'RECEIPT')
                    : voucherRes.data.filter(v => v.Type === 'PAYMENT');
                setVoucherTypes(filtered);
            }

            // Fetch payment or receipt filter data based on transaction type
            if (transactionType === 'payment') {
                await fetchPaymentFilterData();
            } else if (transactionType === 'receipt') {
                await fetchReceiptFilterData();
            }

        } catch (error) {
            console.error('Error fetching options:', error);
            toast.error('Failed to fetch configuration options');
        } finally {
            setDataLoading(false);
        }
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

    // Fetch pending references for an account
    const fetchPendingReferences = async (accId) => {
        setReferencesLoading(true);
        try {
            const response = await fetchLink({
                address: `journal/accountPendingReference?Acc_Id=${accId}`
            });
            
            if (response.success) {
                setPendingReferences(response.data || []);
            } else {
                toast.error('Failed to fetch pending references');
                setPendingReferences([]);
            }
        } catch (error) {
            console.error('Error fetching pending references:', error);
            toast.error('Error fetching pending references');
            setPendingReferences([]);
        } finally {
            setReferencesLoading(false);
        }
    };

    // Open references dialog
    const handleOpenReferencesDialog = (rowId, accId) => {
        setCurrentRowId(rowId);
        setSelectedReferences([]); // Start with empty selection
        setReferencesDialogOpen(true);
        fetchPendingReferences(accId);
    };

    // Close references dialog
    const handleCloseReferencesDialog = () => {
        setReferencesDialogOpen(false);
        setCurrentRowId(null);
        setPendingReferences([]);
        setSelectedReferences([]);
    };

    // Handle multiple reference selection
    const handleToggleReference = (reference) => {
        setSelectedReferences(prevSelected => {
            const isSelected = prevSelected.some(ref => ref.voucherId === reference.voucherId);
            if (isSelected) {
                // Remove if already selected
                return prevSelected.filter(ref => ref.voucherId !== reference.voucherId);
            } else {
                // Add if not selected
                return [...prevSelected, reference];
            }
        });
    };

    // Apply selected references to chips
    const handleApplyReferences = () => {
        if (selectedReferences.length > 0 && currentRowId !== null) {
            const currentConfig = rowConfigs.find(config => config.id === currentRowId);
            const currentInvoices = currentConfig?.selectedInvoices || [];
            
            // Add only new references (avoid duplicates)
            const newInvoices = [...currentInvoices];
            selectedReferences.forEach(ref => {
                const exists = newInvoices.some(inv => inv.voucherId === ref.voucherId);
                if (!exists) {
                    newInvoices.push(ref);
                }
            });
            
            handleRowFieldChange(currentRowId, 'selectedInvoices', newInvoices);
            toast.success(`Added ${selectedReferences.length} reference(s)`);
            handleCloseReferencesDialog();
        }
    };

    // Remove invoice from chips
    const handleRemoveInvoice = (rowId, voucherId) => {
        setRowConfigs(prevConfigs =>
            prevConfigs.map(config => {
                if (config.id === rowId) {
                    return {
                        ...config,
                        selectedInvoices: config.selectedInvoices.filter(inv => inv.voucherId !== voucherId)
                    };
                }
                return config;
            })
        );
    };

    const handleCommonConfigChange = (field, value) => {
        setCommonConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleRowFieldChange = (rowId, field, value) => {
        setRowConfigs(prevConfigs => 
            prevConfigs.map(config => 
                config.id === rowId ? { ...config, [field]: value } : config
            )
        );
    };

    // Function to get all child group IDs
    const getAllChildGroupIds = (groupId, groupList, visited = new Set()) => {
        if (!groupId || visited.has(groupId)) return [];
        visited.add(groupId);
        let result = [String(groupId)];
        const children = groupList.filter(group => String(group.Parent_AC_id) === String(groupId));
        for (const child of children) {
            const childIds = getAllChildGroupIds(child.Group_Id, groupList, visited);
            result = result.concat(childIds);
        }
        return result;
    };

    // Function to filter accounts by group IDs
    const filterAccountsByGroupIds = useCallback((selectedGroupId, accountGroups, accountsList) => {
        if (!selectedGroupId || selectedGroupId === '') return accountsList;
        const validGroupIds = getAllChildGroupIds(selectedGroupId, accountGroups);
        const filtered = accountsList.filter(account => validGroupIds.includes(String(account.Group_Id)));
        return filtered;
    }, []);

    // Handle Debit Group selection for payment
    const handleDebitGroupSelect = (rowId, groupId, groupLabel) => {
        const filtered = filterAccountsByGroupIds(groupId, baseData.accountGroupData, baseData.accountsList);
        
        setRowConfigs(prevConfigs => 
            prevConfigs.map(config => {
                if (config.id === rowId) {
                    return {
                        ...config,
                        selectedDebitGroup: groupId,
                        selectedDebitGroupLabel: groupLabel,
                        filteredDebitAccounts: filtered,
                        debit_ledger: '', // Clear selected account
                        debit_ledger_name: ''
                    };
                }
                return config;
            })
        );
    };

    // Handle Credit Group selection for receipt
    const handleCreditGroupSelect = (rowId, groupId, groupLabel) => {
        const filtered = filterAccountsByGroupIds(groupId, baseData.accountGroupData, baseData.accountsList);
        
        setRowConfigs(prevConfigs => 
            prevConfigs.map(config => {
                if (config.id === rowId) {
                    return {
                        ...config,
                        selectedCreditGroup: groupId,
                        selectedCreditGroupLabel: groupLabel,
                        filteredCreditAccounts: filtered,
                        credit_ledger: '', // Clear selected account
                        credit_ledger_name: ''
                    };
                }
                return config;
            })
        );
    };

  const validateSubmission = () => {
    if (!commonConfig.voucherType) {
        toast.warn('Please select Voucher Type');
        return false;
    }
    if (!commonConfig.billType) {
        toast.warn('Please select Bill Type');
        return false;
    }
    if (!commonConfig.transaction_type) {
        toast.warn('Please select Transaction Type');
        return false;
    }

    for (let i = 0; i < rowConfigs.length; i++) {
        const row = rowConfigs[i];
        
        if (transactionType === 'payment') {
            if (!row.debit_ledger) {
                toast.warn(`Please select Debit Ledger for row ${i + 1}`);
             
                return false;
            }
            if (!row.debit_ledger_name) {
                toast.warn(`Debit Ledger name missing for row ${i + 1}`);
                return false;
            }
          
        } else if (transactionType === 'receipt') {
            if (!row.credit_ledger) {
                toast.warn(`Please select Credit Ledger for row ${i + 1}`);
               
                return false;
            }
            if (!row.credit_ledger_name) {
                toast.warn(`Credit Ledger name missing for row ${i + 1}`);
                return false;
            }
          
        }
        
        if (row.amount <= 0) {
            toast.warn(`Invalid amount for row ${i + 1}`);
            return false;
        }
    }
    return true;
};

const handleSubmit = async () => {
    if (!validateSubmission()) return;

    try {
        setLoading(true);
        if (loadingOn) loadingOn();

        const transactionsWithLedgers = rowConfigs.map(config => {
            const ledgerDetails = {
                amount: config.amount,
                original_amount: config.original_amount,
                remarks: config.remarks,
                check_no: config.check_no,
                check_date: config.check_date,
                bank_name: config.bank_name,
                selectedInvoices: config.selectedInvoices && config.selectedInvoices.length > 0 ? config.selectedInvoices : []
            };
            
            // Add payment-specific or receipt-specific fields
            if (transactionType === 'payment') {
                ledgerDetails.debit_ledger = config.debit_ledger;
                ledgerDetails.debit_ledger_name = config.debit_ledger_name;
                ledgerDetails.credit_ledger = '';
                ledgerDetails.credit_ledger_name = '';
            } else {
                ledgerDetails.credit_ledger = config.credit_ledger;
                ledgerDetails.credit_ledger_name = config.credit_ledger_name;
                ledgerDetails.debit_ledger = '';
                ledgerDetails.debit_ledger_name = '';
            }

            return {
                ...config.transaction,
                ledgerDetails: ledgerDetails
            };
        });

     

        let payload;
        
        if (transactionType === 'receipt') {
            payload = {
                accountNo,
                Acc: selectedAccount,
                fromDate,
                toDate,
                transactionType,
                receiptDetails: {
                    receipt_voucher_type_id: commonConfig.voucherType,
                    receipt_bill_type: commonConfig.billType,
                    transaction_type: commonConfig.transaction_type,
                    status: commonConfig.status,
                    receipt_date: commonConfig.receipt_date,
                    remarks: commonConfig.remarks
                },
                transactions: transactionsWithLedgers
            };
        } else {
            // For payment, ensure debit ledger details are properly included
            payload = {
                accountNo,
                Acc: selectedAccount,
                fromDate,
                toDate,
                transactionType,
                paymentDetails: {
                    payment_voucher_type_id: commonConfig.voucherType,
                    pay_bill_type: commonConfig.billType,
                    transaction_type: commonConfig.transaction_type,
                    status: commonConfig.status,
                    payment_date: commonConfig.payment_date,
                    remarks: commonConfig.remarks
                },
                transactions: transactionsWithLedgers.map(txn => ({
                    ...txn,
             
                    debit_ledger: txn.ledgerDetails.debit_ledger,
                    debit_ledger_name: txn.ledgerDetails.debit_ledger_name,
                  
                    credit_ledger: undefined,
                    credit_ledger_name: undefined
                }))
            };
        }

 

        const endpoint = transactionType === 'receipt' 
            ? 'receipt/syncSelectedWithReceipt'
            : 'payment/syncSelectedWithPayment';
       
        const response = await fetchLink({
            address: endpoint,
            method: 'POST',
            bodyData: payload,
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.success) {
            toast.success(`${rowConfigs.length} ${transactionType}(s) processed successfully`);
            navigate(-1);
        } else {
            toast.error(response.message || `Failed to process ${transactionType}s`);
        }
    } catch (error) {
        console.error('Error submitting:', error);
        toast.error('Error processing transactions');
    } finally {
        setLoading(false);
        if (loadingOff) loadingOff();
    }
};

    const getTotalAmount = () => {
        return rowConfigs.reduce((sum, row) => sum + (row.amount || 0), 0);
    };

    const getOriginalTotal = () => {
        return transactions.reduce((sum, txn) => {
            const amount = parseFloat(txn.Amount?.replace(/[^0-9.-]/g, '')) || 0;
            return sum + amount;
        }, 0);
    };

    const getBillTypeOptions = () => {
        if (transactionType === 'payment') {
            return paymentBillTypes;
        } else if (transactionType === 'receipt') {
            return receiptBillTypes;
        }
        return [];
    };


   const getStatusOptions=()=>{
   
    if(transactionType === 'payment'){
        return paymentStatus;
    }else if(transactionType ==='receipt'){
        return receiptStatus;
    }
    return [];
   }


    const getVoucherTypeOptions = () => {
        if (transactionType === 'payment' && paymentFilterData.voucherType.length > 0) {
            return paymentFilterData.voucherType;
        } else if (transactionType === 'receipt' && receiptFilterData.voucherType.length > 0) {
            return receiptFilterData.voucherType;
        }
        return voucherTypes;
    };

    // Show loading while data is being fetched
    if (dataLoading) {
        return (
            <Card sx={{ p: 3, m: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading configuration data...</Typography>
            </Card>
        );
    }

    // Render custom table
    const renderTable = () => {
        return (
            <Paper sx={{ width: '100%', overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                            <th style={{ padding: '12px', textAlign: 'center' }}>S.No</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Date</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Particulars</th>
                            <th style={{ padding: '12px', textAlign: 'center' }}>Cheque No</th>
                            <th style={{ padding: '12px', textAlign: 'right' }}>Original Amount</th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>
                                {transactionType === 'payment' ? 'Debit Ledger *' : 'Credit Ledger *'}
                            </th>
                            <th style={{ padding: '12px', textAlign: 'left' }}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rowConfigs.map((config, idx) => (
                            <tr key={config.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{idx + 1}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{config.transaction.TranDate}</td>
                                <td style={{ padding: '12px', textAlign: 'left' }}>{config.transaction.TranParticulars}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{config.transaction.ChequeNum}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>{config.transaction.Amount}</td>
                                <td style={{ padding: '12px', textAlign: 'left', minWidth: '200px', maxWidth: '220px' }}>
                                    {transactionType === 'payment' ? (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                            {/* Debit Group Selection */}
                                            {/* <Box>
                                                <Typography variant="caption" gutterBottom>
                                                    Debit Group
                                                </Typography>
                                                <Select
                                                    value={config.selectedDebitGroup || ''}
                                                    onChange={(e) => {
                                                        const groupId = e.target.value;
                                                        if (groupId) {
                                                            const group = baseData.accountGroupData.find(
                                                                g => String(g.Group_Id) === String(groupId)
                                                            );
                                                            if (group) {
                                                                handleDebitGroupSelect(config.id, groupId, group.Group_Name);
                                                            }
                                                        } else {
                                                            handleDebitGroupSelect(config.id, '', '');
                                                        }
                                                    }}
                                                    displayEmpty
                                                    size="small"
                                                    sx={{ width: '100%', fontSize: '12px' }}
                                                >
                                                    <MenuItem value="">All Groups</MenuItem>
                                                    {baseData.accountGroupData.map((group) => (
                                                        <MenuItem key={group.Group_Id} value={group.Group_Id}>
                                                            {group.Group_Name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </Box> */}
                                            
                                            {/* Debit Account Selection */}
                                            <Box>
                                                <Typography variant="caption" gutterBottom>
                                                    Debit Account <span style={{ color: 'red' }}>*</span>
                                                </Typography>
                                                <Select
                                                    value={config.debit_ledger || ''}
                                                    onChange={(e) => {
                                                        const accountId = e.target.value;
                                                        const accountList = config.selectedDebitGroup
                                                            ? config.filteredDebitAccounts
                                                            : baseData.accountsList;
                                                        const account = accountList.find(
                                                            a => String(a.Acc_Id) === String(accountId)
                                                        );
                                                        if (account) {
                                                          
                                                            handleRowFieldChange(config.id, 'debit_ledger', String(account.Acc_Id));
                                                            handleRowFieldChange(config.id, 'debit_ledger_name', account.Account_name || '');
                                                        }
                                                    }}
                                                    displayEmpty
                                                    size="small"
                                                    sx={{ width: '100%', fontSize: '12px' }}
                                                >
                                                    <MenuItem value="" disabled>Select Debit Account</MenuItem>
                                                    {(config.selectedDebitGroup
                                                        ? (config.filteredDebitAccounts || [])
                                                        : (baseData.accountsList || [])
                                                    ).map((account) => (
                                                        <MenuItem key={account.Acc_Id} value={String(account.Acc_Id)}>
                                                            {account.Account_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>

                                                {config.debit_ledger && config.debit_ledger_name && (
                                                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'success.main', fontSize: '10px' }}>
                                                        ✓ {config.debit_ledger_name}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                            {/* Credit Group Selection */}
                                            {/* <Box>
                                                <Typography variant="caption" gutterBottom>
                                                    Credit Group
                                                </Typography>
                                                <Select
                                                    value={config.selectedCreditGroup || ''}
                                                    onChange={(e) => {
                                                        const groupId = e.target.value;
                                                        if (groupId) {
                                                            const group = baseData.accountGroupData.find(
                                                                g => String(g.Group_Id) === String(groupId)
                                                            );
                                                            if (group) {
                                                                handleCreditGroupSelect(config.id, groupId, group.Group_Name);
                                                            }
                                                        } else {
                                                            handleCreditGroupSelect(config.id, '', '');
                                                        }
                                                    }}
                                                    displayEmpty
                                                    size="small"
                                                    sx={{ width: '100%', fontSize: '12px' }}
                                                >
                                                    <MenuItem value="">All Groups</MenuItem>
                                                    {baseData.accountGroupData.map((group) => (
                                                        <MenuItem key={group.Group_Id} value={group.Group_Id}>
                                                            {group.Group_Name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </Box> */}
                                            
                                            {/* Credit Account Selection */}
                                            <Box>
                                                <Typography variant="caption" gutterBottom>
                                                    Credit Account <span style={{ color: 'red' }}>*</span>
                                                </Typography>
                                                <Select
                                                    value={config.credit_ledger || ''}
                                                    onChange={(e) => {
                                                        const accountId = e.target.value;
                                                        const accountList = config.selectedCreditGroup
                                                            ? config.filteredCreditAccounts
                                                            : baseData.accountsList;
                                                        const account = accountList.find(
                                                            a => String(a.Acc_Id) === String(accountId)
                                                        );
                                                        if (account) {
                                                            handleRowFieldChange(config.id, 'credit_ledger', String(account.Acc_Id));
                                                            handleRowFieldChange(config.id, 'credit_ledger_name', account.Account_name || '');
                                                        }
                                                    }}
                                                    displayEmpty
                                                    size="small"
                                                    sx={{ width: '100%', fontSize: '12px' }}
                                                >
                                                    <MenuItem value="" disabled>Select Credit Account</MenuItem>
                                                    {(config.selectedCreditGroup
                                                        ? (config.filteredCreditAccounts || [])
                                                        : (baseData.accountsList || [])
                                                    ).map((account) => (
                                                        <MenuItem key={account.Acc_Id} value={String(account.Acc_Id)}>
                                                            {account.Account_name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                
                                                {config.credit_ledger_name && (
                                                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'success.main', fontSize: '10px' }}>
                                                        ✓ {config.credit_ledger_name}
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    )}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'left' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {/* Remarks TextField */}
                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                                            <TextField
                                                value={config.remarks || ''}
                                                onChange={(e) => handleRowFieldChange(config.id, 'remarks', e.target.value)}
                                                size="small"
                                                fullWidth
                                                multiline
                                                rows={2}
                                                placeholder="Row-specific remarks"
                                            />
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                title="Add pending reference"
                                                onClick={() => {
                                                    const accId = transactionType === 'payment' 
                                                        ? config.debit_ledger 
                                                        : config.credit_ledger;
                                                    if (accId) {
                                                        handleOpenReferencesDialog(config.id, accId);
                                                    } else {
                                                        toast.warn('Please select a ledger first');
                                                    }
                                                }}
                                                sx={{ mt: 0.5 }}
                                            >
                                                <DescriptionIcon />
                                            </IconButton>
                                        </Box>

                                        {/* Selected Invoices as Chips */}
                                        {config.selectedInvoices && config.selectedInvoices.length > 0 && (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                                {config.selectedInvoices.map((invoice) => (
                                                    <Chip
                                                        key={invoice.voucherId}
                                                        label={invoice.BillRefNo}
                                                        size="small"
                                                        onDelete={() => handleRemoveInvoice(config.id, invoice.voucherId)}
                                                        color="primary"
                                                        variant="outlined"
                                                        sx={{
                                                            fontWeight: 500,
                                                            backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                                            '&:hover': {
                                                                backgroundColor: 'rgba(25, 118, 210, 0.12)',
                                                            }
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </Box>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Paper>
        );
    };

    if (!transactions || transactions.length === 0) {
        return (
            <Card sx={{ p: 3, m: 2 }}>
                <Alert severity="warning">No transactions selected. Please go back and select transactions.</Alert>
                <Button onClick={() => navigate(-1)} sx={{ mt: 2 }} startIcon={<ArrowBackIcon />}>
                    Go Back
                </Button>
            </Card>
        );
    }

    return (
        <Card sx={{ p: 2, m: 2 }}>
            {/* Header */}
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    disabled={loading}
                >
                    Back to Bank Statement
                </Button>
                   <Typography variant="body2">
                            <strong>Total Transactions:</strong> {transactions.length}
                        </Typography>
            </Box>

            {/* Summary Section */}
            {/* <Paper elevation={1} sx={{ mb: 2, p: 2, bgcolor: '#e3f2fd' }}>
                <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                        <Typography variant="body2">
                            <strong>Total Transactions:</strong> {transactions.length}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Typography variant="body2">
                            <strong>Original Total:</strong> ₹{NumberFormat(getOriginalTotal())}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="primary">
                            <strong>Amount to Sync:</strong> ₹{NumberFormat(getTotalAmount())}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Typography variant="body2">
                            <strong>Account:</strong> {selectedAccount?.Account_name || accountNo}
                        </Typography>
                    </Grid>
                </Grid>
            </Paper> */}

            {/* Common Configuration Section */}
            <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                    Common Configuration (Applies to all rows)
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Voucher Type *</InputLabel>
                            <Select
                                value={commonConfig.voucherType}
                                onChange={(e) => handleCommonConfigChange('voucherType', e.target.value)}
                                label="Voucher Type *"
                            >
                                <MenuItem value="">Select</MenuItem>
                                {getVoucherTypeOptions().map((vt) => (
                                    <MenuItem key={vt.Vocher_Type_Id || vt.value} value={vt.Vocher_Type_Id || vt.value}>
                                        {vt.Voucher_Type || vt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Bill Type *</InputLabel>
                            <Select
                                value={commonConfig.billType}
                                onChange={(e) => handleCommonConfigChange('billType', e.target.value)}
                                label="Bill Type *"
                            >
                                <MenuItem value="">Select</MenuItem>
                                {getBillTypeOptions().map((bt) => (
                                    <MenuItem key={bt.value} value={bt.value}>
                                        {bt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
  <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status *</InputLabel>
                            <Select
                                value={commonConfig.status}
                                onChange={(e) => handleCommonConfigChange('status', e.target.value)}
                                label="Status"
                            >
                                <MenuItem value="">Select</MenuItem>
                                {getStatusOptions().map((bt) => (
                                    <MenuItem key={bt.value} value={bt.value}>
                                        {bt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    
                    
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Transaction Type *</InputLabel>
                            <Select
                                value={commonConfig.transaction_type}
                                onChange={(e) => handleCommonConfigChange('transaction_type', e.target.value)}
                                label="Transaction Type *"
                            >
                                {transactionTypes.map((tt) => (
                                    <MenuItem key={tt.value} value={tt.value}>
                                        {tt.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Common Remarks"
                            value={commonConfig.remarks}
                            onChange={(e) => handleCommonConfigChange('remarks', e.target.value)}
                            fullWidth
                            size="small"
                            multiline
                            rows={2}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Transactions Table - Using custom table instead of AppTableComponent */}
            {renderTable()}

            {/* Submit Button */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSubmit}
                    disabled={loading}
                    size="large"
                >
                    {loading ? 'Processing...' : `Sync ${transactions.length} ${transactionType}(s)`}
                </Button>
            </Box>


{/* Pending References Dialog */}
<Dialog 
    open={referencesDialogOpen} 
    onClose={handleCloseReferencesDialog}
    maxWidth="md"
    fullWidth
>
    <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
            <Typography variant="h6">Pending References</Typography>
            {selectedReferences.length > 0 && (
                <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 500 }}>
                    {selectedReferences.length} selected
                </Typography>
            )}
        </Box>
        <IconButton onClick={handleCloseReferencesDialog} size="small">
            <CloseIcon />
        </IconButton>
    </DialogTitle>
    
    {/* Total Sum Section */}
    <Box sx={{ 
        px: 3, 
        pt: 2, 
        pb: 1, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#fafafa'
    }}>
        <Box>
            <Typography variant="body2" color="textSecondary">
                Total Value (All References):
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                ₹{NumberFormat(pendingReferences.reduce((sum, ref) => sum + (parseFloat(ref.totalValue) || 0), 0))}
            </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="textSecondary">
                Selected Total:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                ₹{NumberFormat(selectedReferences.reduce((sum, ref) => sum + (parseFloat(ref.totalValue) || 0), 0))}
            </Typography>
        </Box>
    </Box>
    
    <DialogContent dividers>
        {referencesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        ) : pendingReferences.length > 0 ? (
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell align="center" width="80px">Select</TableCell>
                            <TableCell>Voucher Number</TableCell>
                            <TableCell>Bill Ref No</TableCell>
                            <TableCell align="right">Total Value</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell>Data Source</TableCell>
                            <TableCell align="right">Against Amount</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {pendingReferences.map((ref, idx) => {
                            const isSelected = selectedReferences.some(sel => sel.voucherId === ref.voucherId);
                            return (
                                <TableRow 
                                    key={idx}
                                    hover
                                    sx={{
                                        backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => handleToggleReference(ref)}
                                >
                                    <TableCell align="center">
                                        <Checkbox
                                            checked={isSelected}
                                            onChange={() => handleToggleReference(ref)}
                                        />
                                    </TableCell>
                                    <TableCell>{ref.voucherNumber}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2' }}>
                                            {ref.BillRefNo}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">{NumberFormat(ref.totalValue)}</TableCell>
                                    <TableCell>{new Date(ref.eventDate).toLocaleDateString('en-IN')}</TableCell>
                                    <TableCell>{ref.dataSource}</TableCell>
                                    <TableCell align="right">{NumberFormat(ref.againstAmount)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        ) : (
            <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
                No pending references found for this account
            </Typography>
        )}
    </DialogContent>
    <DialogActions>
        <Button onClick={handleCloseReferencesDialog}>Cancel</Button>
        <Button 
            onClick={handleApplyReferences}
            variant="contained"
            color="primary"
            disabled={selectedReferences.length === 0}
        >
            Apply Selected ({selectedReferences.length})
        </Button>
    </DialogActions>
</Dialog>
         
            {/* <Dialog 
                open={referencesDialogOpen} 
                onClose={handleCloseReferencesDialog}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6">Pending References</Typography>
                        {selectedReferences.length > 0 && (
                            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 500 }}>
                                {selectedReferences.length} selected
                            </Typography>
                        )}
                    </Box>
                    <IconButton onClick={handleCloseReferencesDialog} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {referencesLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                          <></>
                        </Box>
                    ) : pendingReferences.length > 0 ? (
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                        <TableCell align="center" width="80px">Select</TableCell>
                                        <TableCell>Voucher Number</TableCell>
                                        <TableCell>Bill Ref No</TableCell>
                                        <TableCell align="right">Total Value</TableCell>
                                        <TableCell>Date</TableCell>
                                        <TableCell>Data Source</TableCell>
                                        <TableCell align="right">Against Amount</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingReferences.map((ref, idx) => {
                                        const isSelected = selectedReferences.some(sel => sel.voucherId === ref.voucherId);
                                        return (
                                            <TableRow 
                                                key={idx}
                                                hover
                                                sx={{
                                                    backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => handleToggleReference(ref)}
                                            >
                                                <TableCell align="center">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={() => handleToggleReference(ref)}
                                                    />
                                                </TableCell>
                                                <TableCell>{ref.voucherNumber}</TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 500, color: '#1976d2' }}>
                                                        {ref.BillRefNo}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">{NumberFormat(ref.totalValue)}</TableCell>
                                                <TableCell>{new Date(ref.eventDate).toLocaleDateString('en-IN')}</TableCell>
                                                <TableCell>{ref.dataSource}</TableCell>
                                                <TableCell align="right">{NumberFormat(ref.againstAmount)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
                            No pending references found for this account
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseReferencesDialog}>Cancel</Button>
                    <Button 
                        onClick={handleApplyReferences}
                        variant="contained"
                        color="primary"
                        disabled={selectedReferences.length === 0}
                    >
                        Apply Selected ({selectedReferences.length})
                    </Button>
                </DialogActions>
            </Dialog> */}
        </Card>
    );
};

export default ConvertScreen;