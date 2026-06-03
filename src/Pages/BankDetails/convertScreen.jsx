import React, { useState, useEffect, useCallback, useMemo,useRef } from 'react';
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
    FormControlLabel,
    Autocomplete,
    Switch
} from "@mui/material";
import {
    Save as SaveIcon,
    ArrowBack as ArrowBackIcon,
    ArrowOutward as ArrowOutwardIcon,
    Close as CloseIcon,
    Search as SearchIcon,
    PlaylistAddCheck as PlaylistAddCheckIcon
} from "@mui/icons-material";
import { fetchLink } from '../../Components/fetchComponent';
import { toast } from 'react-toastify';
import { NumberFormat } from "../../Components/functions";
import { useLocation, useNavigate } from "react-router-dom";

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

const contraStatus = [
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
    const [branchList, setBranchList] = useState([]);
    const [commonBranch, setCommonBranch] = useState('');

    // Common Account States
    const [applyCommonDebit, setApplyCommonDebit] = useState(false);
    const [commonDebitAccount, setCommonDebitAccount] = useState({ id: '', name: '' });
    const [applyCommonCredit, setApplyCommonCredit] = useState(false);
    const [commonCreditAccount, setCommonCreditAccount] = useState({ id: '', name: '' });

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

    // Extract transactionTypeFilter from navigation state ('C' = Credit, 'D' = Debit)
    const {
        transactions = [],
        transactionType = '',
        accountNo,
        selectedAccount,
        fromDate: initialFromDate,
        toDate: initialToDate,
        transactionTypeFilter = '',
        bankAccountDetails = {}
    } = state || {};

    // For contra: Credit radio ('C') → show Credit Ledger column; Debit radio ('D') → show Debit Ledger column
    const contraLedgerLabel = transactionTypeFilter === 'C' ? 'Credit Ledger *' : 'Debit Ledger *';
    const contraLedgerField = transactionTypeFilter === 'C' ? 'credit_ledger' : 'debit_ledger';
    const contraLedgerNameField = transactionTypeFilter === 'C' ? 'credit_ledger_name' : 'debit_ledger_name';

    const [commonConfig, setCommonConfig] = useState({
        voucherType: '',
        billType: '',
        transaction_type: '',
        status: '',
        remarks: '',
        receipt_date: '',
        payment_date: '',
        contra_date: ''
    });

    const [rowConfigs, setRowConfigs] = useState([]);

    const [referencesDialogOpen, setReferencesDialogOpen] = useState(false);
    const [currentRowId, setCurrentRowId] = useState(null);
    const [currentAccId, setCurrentAccId] = useState(null);
    const [pendingReferences, setPendingReferences] = useState([]);
    const [selectedReferences, setSelectedReferences] = useState([]);
    const [referencesLoading, setReferencesLoading] = useState(false);
    
    // Search/filter states for references dialog
   const [refSearchTerm, setRefSearchTerm] = useState("");
    const [filteredPendingReferences, setFilteredPendingReferences] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const debounceTimerRef = useRef(null);

    // Date range state for references popup
    const [refFromDate, setRefFromDate] = useState(() => {
        if (initialFromDate) {
            const d = new Date(initialFromDate);
            return d.toISOString().split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
    });

    const [refToDate, setRefToDate] = useState(() => {
        if (initialToDate) {
            const d = new Date(initialToDate);
            return d.toISOString().split('T')[0];
        }
        return new Date().toISOString().split('T')[0];
    });


 const filterReferences = useCallback((searchTerm, references) => {
        if (!searchTerm.trim() || !references.length) {
            return references;
        }
        
        const searchLower = searchTerm.toLowerCase().trim();
        
        // Use for loop instead of filter for better performance with large datasets
        const filtered = [];
        for (let i = 0; i < references.length; i++) {
            const ref = references[i];
            
            // Check multiple fields efficiently
            if (
                (ref.uniqueNumber && ref.uniqueNumber.toLowerCase().includes(searchLower)) ||
                (ref.voucherTypeGet && ref.voucherTypeGet.toLowerCase().includes(searchLower)) ||
                (ref.creditAccountGet && ref.creditAccountGet.toLowerCase().includes(searchLower)) ||
                (ref.debitAccountGet && ref.debitAccountGet.toLowerCase().includes(searchLower)) ||
                (ref.check_no && ref.check_no.toLowerCase().includes(searchLower)) ||
                (ref.bank_name && ref.bank_name.toLowerCase().includes(searchLower)) ||
                (ref.amount && ref.amount.toString().includes(searchLower))
            ) {
                filtered.push(ref);
            }
            
            // Optional: Limit results for better performance
            if (filtered.length >= 500) break;
        }
        
        return filtered;
    }, []);

   useEffect(() => {
        if (transactionType === 'contra' && pendingReferences.length > 0) {
            // Clear previous timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            
            // Show searching indicator
            setIsSearching(true);
            
            // Set new timer
            debounceTimerRef.current = setTimeout(() => {
                const filtered = filterReferences(refSearchTerm, pendingReferences);
                setFilteredPendingReferences(filtered);
                setIsSearching(false);
            }, 300); // 300ms debounce delay
        } else {
            setFilteredPendingReferences(pendingReferences);
            setIsSearching(false);
        }
        
        // Cleanup timer on unmount or when dependencies change
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [refSearchTerm, pendingReferences, transactionType, filterReferences]);


   const displayData = useMemo(() => {
        return filteredPendingReferences;
    }, [filteredPendingReferences]);



    // useEffect(() => {
    //     if (transactionType === 'contra' && pendingReferences.length > 0) {
    //         const searchLower = refSearchTerm.toLowerCase();
    //         const filtered = pendingReferences.filter(ref => {
    //             return (
    //                 (ref.uniqueNumber && ref.uniqueNumber.toLowerCase().includes(searchLower)) ||
    //                 (ref.voucherTypeGet && ref.voucherTypeGet.toLowerCase().includes(searchLower)) ||
    //                 (ref.creditAccountGet && ref.creditAccountGet.toLowerCase().includes(searchLower)) ||
    //                 (ref.debitAccountGet && ref.debitAccountGet.toLowerCase().includes(searchLower)) ||
    //                 (ref.check_no && ref.check_no.toLowerCase().includes(searchLower)) ||
    //                 (ref.bank_name && ref.bank_name.toLowerCase().includes(searchLower)) ||
    //                 (ref.amount && ref.amount.toString().includes(searchLower))
    //             );
    //         });
    //         setFilteredPendingReferences(filtered);
    //     } else {
    //         setFilteredPendingReferences(pendingReferences);
    //     }
    // }, [refSearchTerm, pendingReferences, transactionType]);

    useEffect(() => {
        if (transactions?.length > 0) {
            fetchBaseData();
            initializeRowConfigs();
        } else {
            toast.error('No transactions selected');
            navigate(-1);
        }
    }, [transactions, transactionType]);


const parseIndianAmount = (value) => {
    if (!value && value !== 0) return 0;
    
    let str = String(value).trim();
    
    
    str = str.replace(/\s*(CR|DR|Cr|Dr|cR|dR)\s*$/i, '');
    
    
    const numberMatch = str.match(/(\d+(?:[.,]\d+)*)/);
    
    if (!numberMatch) return 0;
    
    let numberStr = numberMatch[1];
    
  
    numberStr = numberStr.replace(/,/g, '');
    
  
    const num = parseFloat(numberStr);
    return isNaN(num) ? 0 : num;
};

 
const initializeRowConfigs = () => {
        let bankAccountObj = null;

        if (bankAccountDetails?.Acc_Id) {
            bankAccountObj = {
                Acc_Id: bankAccountDetails.Acc_Id,
                Account_name: bankAccountDetails.Account_name
            };
        } else if (selectedAccount?.Acc_Id) {
            bankAccountObj = {
                Acc_Id: selectedAccount.Acc_Id,
                Account_name: selectedAccount.Account_name
            };
        }

        const configs = transactions.map((txn, idx) => {
            const amount = parseIndianAmount(txn.Amount);

            let debit_ledger = '';
            let debit_ledger_name = '';
            let credit_ledger = '';
            let credit_ledger_name = '';

            if (transactionType === 'contra' && bankAccountObj) {
                if (transactionTypeFilter === 'C') {
                    debit_ledger = bankAccountObj.Acc_Id;
                    debit_ledger_name = bankAccountObj.Account_name;
                } else if (transactionTypeFilter === 'D') {
                    credit_ledger = bankAccountObj.Acc_Id;
                    credit_ledger_name = bankAccountObj.Account_name;
                }
            }

            return {
                id: idx,
                transaction: {
                    ...txn,
                    Id: txn.Id || txn.id
                },
                debit_ledger: debit_ledger,
                debit_ledger_name: debit_ledger_name,
                credit_ledger: credit_ledger,
                credit_ledger_name: credit_ledger_name,
                amount: amount,
                original_amount: amount,
                remarks: '',
                selectedInvoices: [],
                check_no: txn.ChequeNum || '',
                check_date: '',
                bank_name: bankAccountObj?.Account_name || ''
            };
        });
        setRowConfigs(configs);
    };

    useEffect(() => {
        if (baseData.accountsList.length > 0 && bankAccountDetails && bankAccountDetails.Acc_Id) {
            const bankAccountObj = baseData.accountsList.find(acc => 
                String(acc.Acc_Id) === String(bankAccountDetails.Acc_Id) ||
                acc.Account_name === bankAccountDetails.Account_name
            );
            
            if (bankAccountObj) {
                if (transactionType === 'contra') {
                    if (transactionTypeFilter === 'C') {
                        setCommonDebitAccount({
                            id: bankAccountObj.Acc_Id,
                            name: bankAccountObj.Account_name
                        });
                        setApplyCommonDebit(true);
                        
                        setTimeout(() => {
                            setRowConfigs(prevConfigs =>
                                prevConfigs.map(config => ({
                                    ...config,
                                    debit_ledger: bankAccountObj.Acc_Id,
                                    debit_ledger_name: bankAccountObj.Account_name
                                }))
                            );
                            toast.info(`Bank account "${bankAccountObj.Account_name}" auto-applied as Debit Ledger`);
                        }, 500);
                        
                    } else if (transactionTypeFilter === 'D') {
                        setCommonCreditAccount({
                            id: bankAccountObj.Acc_Id,
                            name: bankAccountObj.Account_name
                        });
                        setApplyCommonCredit(true);
                        
                        setTimeout(() => {
                            setRowConfigs(prevConfigs =>
                                prevConfigs.map(config => ({
                                    ...config,
                                    credit_ledger: bankAccountObj.Acc_Id,
                                    credit_ledger_name: bankAccountObj.Account_name
                                }))
                            );
                            toast.info(`Bank account "${bankAccountObj.Account_name}" auto-applied as Credit Ledger`);
                        }, 500);
                    }
                }
            }
        }
    }, [baseData.accountsList, bankAccountDetails, transactionType, transactionTypeFilter]);

    const fetchBaseData = async () => {
        setDataLoading(true);
        try {
            const promises = [
                fetchLink({ address: `payment/accounts` }),
                fetchLink({ address: `payment/accountGroup` }),
            ];

            if (transactionType === 'contra') {
                promises.push(fetchLink({ address: 'masters/voucher?module=CONTRA' }));
                promises.push(fetchLink({ address: 'masters/branch/dropDown' }));
            } else {
                promises.push(fetchLink({ address: 'masters/voucher' }));
            }

            const [accountsResponse, accountsGroupResponse, voucherRes, branchRes] = await Promise.all(promises);

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

            if (voucherRes?.success) {
                if (transactionType === 'contra') {
                    setVoucherTypes(voucherRes.data || []);
                } else if (transactionType === 'receipt') {
                    const filtered = (voucherRes.data || []).filter(v => v.Type === 'RECEIPT');
                    setVoucherTypes(filtered);
                } else if (transactionType === 'payment') {
                    const filtered = (voucherRes.data || []).filter(v => v.Type === 'PAYMENT');
                    setVoucherTypes(filtered);
                }
            }

            if (transactionType === 'contra' && branchRes?.success) {
                setBranchList(branchRes.data || []);
            }

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

    // Format date to DD/MM/YYYY
    const formatToDDMMYYYY = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Fetch pending references with date range
    const fetchPendingReferences = async (accId) => {
      
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        setReferencesLoading(true);
        try {
            let endpoint = '';

            if (transactionType === 'contra') {
                if (transactionTypeFilter === 'C') {
                    endpoint = `contra/receiptReference?Fromdate=${refFromDate}&Todate=${refToDate}&accId=${accId}`;
                } else if (transactionTypeFilter === 'D') {
                    endpoint = `contra/paymentReference?Fromdate=${refFromDate}&Todate=${refToDate}&accId=${accId}`;
                } else {
                    endpoint = `journal/accountPendingReference?Acc_Id=${accId}`;
                }
            } else if (transactionType === 'payment') {
                endpoint = `journal/accountPendingReference?Acc_Id=${accId}`;
            } else if (transactionType === 'receipt') {
                endpoint = `journal/accountPendingReference?Acc_Id=${accId}`;
            } 

            const response = await fetchLink({ address: endpoint });

            if (response.success) {
                let transformedData = response.data || [];
                
                if (transactionType === 'contra') {
                    transformedData = transformedData.map(ref => ({
                        ...ref,
                        dataSource: ref.dr_cr === 'Cr' ? 'Credit' : 'Debit',
                        againstAmount: ref.againstAmount || (ref.dr_cr === 'Cr' ? ref.credit_amount : ref.debit_amount) || 0
                    }));
                } else {
                    transformedData = transformedData.map(ref => ({
                        uniqueId: ref.uniqueId,
                        voucherNumber: ref.uniqueNumber,
                        BillRefNo: ref.BillRefNo || ref.uniqueNumber,
                        totalValue: parseFloat(ref.amount || ref.totalValue || 0),
                        date: ref.entryDate,
                        dataSource: ref.voucherTypeGet || 'Journal',
                        againstAmount: parseFloat(ref.againstAmount || ref.amount || 0),
                        amount: parseFloat(ref.amount || ref.totalValue || 0),
                        entryDate: ref.entryDate,
                        ...ref
                    }));
                }
                
                setPendingReferences(transformedData);
                setFilteredPendingReferences(transformedData);
                setRefSearchTerm("");
                
                if (response.data?.length === 0) {
                    toast.info('No pending references found for the selected date range');
                }
            } else {
                toast.error('Failed to fetch pending references');
                setPendingReferences([]);
                setFilteredPendingReferences([]);
            }
        } catch (error) {
            console.error('Error fetching pending references:', error);
            toast.error('Error fetching pending references');
            setPendingReferences([]);
            setFilteredPendingReferences([]);
        } finally {
            setReferencesLoading(false);
        }
    };

    const handleOpenReferencesDialog = (rowId, accId) => {
        setCurrentRowId(rowId);
        setCurrentAccId(accId);
        setSelectedReferences([]);
        setPendingReferences([]);
        setFilteredPendingReferences([]);
        setRefSearchTerm("");
        setReferencesDialogOpen(true);
        fetchPendingReferences(accId);
    };

    const handleSearchReferences = () => {
        if (currentAccId) {
            fetchPendingReferences(currentAccId);
        }
    };

    const handleCloseReferencesDialog = () => {
        setReferencesDialogOpen(false);
        setCurrentRowId(null);
        setCurrentAccId(null);
        setPendingReferences([]);
        setFilteredPendingReferences([]);
        setSelectedReferences([]);
        setRefSearchTerm("");
    };

    const handleToggleReference = (reference) => {
        setSelectedReferences(prevSelected => {
            let isSelected;
            if (transactionType === 'contra') {
                isSelected = prevSelected.some(ref => ref.uniqueId === reference.uniqueId);
            } else {
                isSelected = prevSelected.some(ref => ref.voucherNumber === reference.voucherNumber);
            }
            
            if (isSelected) {
                if (transactionType === 'contra') {
                    return prevSelected.filter(ref => ref.uniqueId !== reference.uniqueId);
                } else {
                    return prevSelected.filter(ref => ref.voucherNumber !== reference.voucherNumber);
                }
            } else {
                return [...prevSelected, reference];
            }
        });
    };

    const getReferenceAmount = (ref) => {
        if (transactionType === 'contra') {
            return parseFloat(ref.amount || 
                (ref.dr_cr === 'Cr' ? ref.credit_amount : ref.debit_amount) || 0);
        } else {
            return parseFloat(ref.totalValue || ref.againstAmount || ref.amount || 0);
        }
    };

    const handleApplyReferences = () => {
        if (selectedReferences.length > 0 && currentRowId !== null) {
            setRowConfigs(prevConfigs =>
                prevConfigs.map(config => {
                    if (config.id !== currentRowId) return config;
                    const existingInvoices = config.selectedInvoices || [];
                    const newInvoices = [...existingInvoices];
                    selectedReferences.forEach(ref => {
                        let exists;
                        if (transactionType === 'contra') {
                            exists = newInvoices.some(inv => inv.uniqueId === ref.uniqueId);
                        } else {
                            exists = newInvoices.some(inv => inv.voucherNumber === ref.voucherNumber);
                        }
                        if (!exists) {
                            const invoiceToAdd = transactionType === 'contra' 
                                ? ref 
                                : { ...ref, uniqueId: ref.voucherNumber, uniqueNumber: ref.voucherNumber };
                            newInvoices.push(invoiceToAdd);
                        }
                    });
          
                    const totalAmount = newInvoices.reduce((sum, inv) => sum + getReferenceAmount(inv), 0);
                    return { 
                        ...config, 
                        selectedInvoices: newInvoices,
                        amount: totalAmount
                    };
                })
            );
            toast.success(`Added ${selectedReferences.length} reference(s)`);
            handleCloseReferencesDialog();
        }
    };

    const handleRemoveReference = (rowId, referenceId, referenceAmount) => {
        setRowConfigs(prevConfigs =>
            prevConfigs.map(config => {
                if (config.id === rowId) {
                    const removedRef = config.selectedInvoices.find(inv => {
                        if (transactionType === 'contra') {
                            return inv.uniqueId === referenceId;
                        } else {
                            return inv.voucherNumber === referenceId || inv.uniqueId === referenceId;
                        }
                    });
                    const newAmount = config.amount - (removedRef ? getReferenceAmount(removedRef) : 0);
                    return {
                        ...config,
                        selectedInvoices: config.selectedInvoices.filter(inv => {
                            if (transactionType === 'contra') {
                                return inv.uniqueId !== referenceId;
                            } else {
                                return inv.voucherNumber !== referenceId && inv.uniqueId !== referenceId;
                            }
                        }),
                        amount: Math.max(0, newAmount)
                    };
                }
                return config;
            })
        );
        toast.info(`Removed reference`);
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

    const applyCommonDebitToAllRows = () => {
        if (!commonDebitAccount.id) {
            toast.warn('Please select a Debit account first');
            return;
        }
        setRowConfigs(prevConfigs =>
            prevConfigs.map(config => ({
                ...config,
                debit_ledger: commonDebitAccount.id,
                debit_ledger_name: commonDebitAccount.name
            }))
        );
        toast.success(`Applied "${commonDebitAccount.name}" as Debit account to all ${rowConfigs.length} rows`);
    };

    const applyCommonCreditToAllRows = () => {
        if (!commonCreditAccount.id) {
            toast.warn('Please select a Credit account first');
            return;
        }
        setRowConfigs(prevConfigs =>
            prevConfigs.map(config => ({
                ...config,
                credit_ledger: commonCreditAccount.id,
                credit_ledger_name: commonCreditAccount.name
            }))
        );
        toast.success(`Applied "${commonCreditAccount.name}" as Credit account to all ${rowConfigs.length} rows`);
    };

    const applyCommonContraToAllRows = () => {
        if (transactionTypeFilter === 'C') {
            applyCommonCreditToAllRows();
        } else {
            applyCommonDebitToAllRows();
        }
    };

    const validateSubmission = () => {
        if (!commonConfig.voucherType) {
            toast.warn('Please select Voucher Type');
            return false;
        }

        if (transactionType === 'contra' && !commonBranch) {
            toast.warn('Please select Branch');
            return false;
        }

        if (transactionType !== 'contra' && !commonConfig.billType) {
            toast.warn('Please select Bill Type');
            return false;
        }

        if (!commonConfig.transaction_type) {
            toast.warn('Please select Transaction Type');
            return false;
        }

        for (let i = 0; i < rowConfigs.length; i++) {
            const row = rowConfigs[i];

            if (transactionType === 'contra') {
                if (transactionTypeFilter === 'C' && !row.credit_ledger) {
                    toast.warn(`Please select Credit Ledger for row ${i + 1}`);
                    return false;
                }
                if (transactionTypeFilter === 'D' && !row.debit_ledger) {
                    toast.warn(`Please select Debit Ledger for row ${i + 1}`);
                    return false;
                }
            } else if (transactionType === 'payment') {
                if (!row.debit_ledger) {
                    toast.warn(`Please select Debit Ledger for row ${i + 1}`);
                    return false;
                }
            } else if (transactionType === 'receipt') {
                if (!row.credit_ledger) {
                    toast.warn(`Please select Credit Ledger for row ${i + 1}`);
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

            if (transactionType === 'contra') {
                for (const config of rowConfigs) {
                    const amount = parseFloat(config.amount) || 0;
                    const localData = localStorage.getItem("user");
                    const userId = localData ? JSON.parse(localData).UserId : "";

                    const billReferences = (config.selectedInvoices || []).map(inv => ({
                        dr_cr: transactionTypeFilter === 'C' ? 'Cr' : 'Dr',
                        bill_id: Number(inv.uniqueId),
                        bill_no: inv.uniqueNumber || "",
                        amount: getReferenceAmount(inv)
                    }));

                    let debitAccount, creditAccount, debitAccountName, creditAccountName;
                    let bankAccountObj = null;

                    if (bankAccountDetails?.Acc_Id) {
                        bankAccountObj = baseData.accountsList.find(acc =>
                            String(acc.Acc_Id) === String(bankAccountDetails.Acc_Id)
                        );
                        if (!bankAccountObj) {
                            bankAccountObj = {
                                Acc_Id: bankAccountDetails.Acc_Id,
                                Account_name: bankAccountDetails.Account_name
                            };
                        }
                    } else if (selectedAccount?.Acc_Id) {
                        bankAccountObj = baseData.accountsList.find(acc =>
                            String(acc.Acc_Id) === String(selectedAccount.Acc_Id)
                        );
                        if (!bankAccountObj) {
                            bankAccountObj = {
                                Acc_Id: selectedAccount.Acc_Id,
                                Account_name: selectedAccount.Account_name
                            };
                        }
                    }

                    const bankAccountId = bankAccountObj?.Acc_Id || accountNo;
                    const bankAccountName = bankAccountObj?.Account_name || "";

                    if (transactionTypeFilter === 'C') {
                        debitAccount = bankAccountId;
                        debitAccountName = bankAccountName;
                        creditAccount = config.credit_ledger;
                        creditAccountName = config.credit_ledger_name;
                    } else {
                        debitAccount = config.debit_ledger;
                        debitAccountName = config.debit_ledger_name;
                        creditAccount = bankAccountId;
                        creditAccountName = bankAccountName;
                    }

                    const bankDate = config.check_date || config.transaction.TranDate?.split('T')[0] || null;
                    const chequeDate = config.check_date || "";
                    const contraDate = commonConfig.contra_date || config.transaction.TranDate?.split('T')[0] || new Date().toISOString().split('T')[0];
                    const BankTransactionId = config.transaction.Id || config.transaction.id;

                    if (!BankTransactionId) {
                        throw new Error(`Bank Transaction ID missing for row ${config.id + 1}`);
                    }

                    const payload = {
                        VoucherType: parseInt(commonConfig.voucherType) || 0,
                        BranchId: commonBranch || "",
                        DebitAccount: parseInt(debitAccount) || 0,
                        DebitAccountName: debitAccountName || "",
                        CreditAccount: parseInt(creditAccount) || 0,
                        CreditAccountName: creditAccountName || "",
                        Amount: amount,
                        Narration: config.remarks || commonConfig.remarks || null,
                        BankName: config.bank_name || config.transaction.BankName || "",
                        ContraStatus: parseInt(commonConfig.status) || 1,
                        CreatedBy: userId,
                        Chequeno: config.check_no || config.transaction.ChequeNum || null,
                        TransactionType: commonConfig.transaction_type || "",
                        BankDate: bankDate,
                        ChequeDate: chequeDate,
                        ContraDate: contraDate,
                        bill_references: billReferences,
                        BankTransactionId: BankTransactionId
                    };

                    const response = await fetchLink({
                        address: `contra/masterBank`,
                        method: 'POST',
                        bodyData: payload,
                        headers: { 'Content-Type': 'application/json' }
                    });

                    if (!response.success) {
                        throw new Error(response.message || `Failed to process contra for row ${config.id + 1}`);
                    }
                }

                toast.success(`${rowConfigs.length} contra transaction(s) processed successfully`);
                navigate(-1);
            } else if (transactionType === 'receipt') {
                const transactionsWithLedgers = rowConfigs.map(config => {
                    const ledgerDetails = {
                        amount: config.amount,
                        original_amount: config.original_amount,
                        remarks: config.remarks,
                        check_no: config.check_no,
                        check_date: config.check_date,
                        bank_name: config.bank_name,
                        selectedInvoices: config.selectedInvoices || []
                    };

                    ledgerDetails.credit_ledger = config.credit_ledger;
                    ledgerDetails.credit_ledger_name = config.credit_ledger_name;
                    ledgerDetails.debit_ledger = '';
                    ledgerDetails.debit_ledger_name = '';

                    return {
                        ...config.transaction,
                        ledgerDetails: ledgerDetails
                    };
                });

                 const user = JSON.parse(localStorage.getItem("user"));
                 const userId = user?.UserId;

                const payload = {
                    accountNo,
                    Acc: selectedAccount,
                    fromDate: initialFromDate,
                    toDate: initialToDate,
                    transactionType,
                    receiptDetails: {
                        receipt_voucher_type_id: commonConfig.voucherType,
                        receipt_bill_type: commonConfig.billType,
                        transaction_type: commonConfig.transaction_type,
                        status: commonConfig.status,
                        receipt_date: commonConfig.receipt_date,
                        remarks: commonConfig.remarks
                    },
                    transactions: transactionsWithLedgers,
                    created_by:userId
                };

                const response = await fetchLink({
                    address: 'receipt/syncSelectedWithReceipt',
                    method: 'POST',
                    bodyData: payload,
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.success) {
                    toast.success(`${rowConfigs.length} receipt(s) processed successfully`);
                    navigate(-1);
                } else {
                    toast.error(response.message || `Failed to process receipts`);
                }
                
            } else if (transactionType === 'payment') {
                const transactionsWithLedgers = rowConfigs.map(config => {
                    const ledgerDetails = {
                        amount: config.amount,
                        original_amount: config.original_amount,
                        remarks: config.remarks,
                        check_no: config.check_no,
                        check_date: config.check_date,
                        bank_name: config.bank_name,
                        selectedInvoices: config.selectedInvoices || []
                    };

                    ledgerDetails.debit_ledger = config.debit_ledger;
                    ledgerDetails.debit_ledger_name = config.debit_ledger_name;
                    ledgerDetails.credit_ledger = '';
                    ledgerDetails.credit_ledger_name = '';

                    return {
                        ...config.transaction,
                        ledgerDetails: ledgerDetails
                    };
                });

                  const user = JSON.parse(localStorage.getItem("user"));
                 const userId = user?.UserId;


                const payload = {
                    accountNo,
                    Acc: selectedAccount,
                    fromDate: initialFromDate,
                    toDate: initialToDate,
                    transactionType,
                    paymentDetails: {
                        payment_voucher_type_id: commonConfig.voucherType,
                        pay_bill_type: commonConfig.billType,
                        transaction_type: commonConfig.transaction_type,
                        status: commonConfig.status,
                        payment_date: commonConfig.payment_date,
                        remarks: commonConfig.remarks
                    },
                    transactions: transactionsWithLedgers,
                    created_by:userId
                };

                const response = await fetchLink({
                    address: 'payment/syncSelectedWithPayment',
                    method: 'POST',
                    bodyData: payload,
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.success) {
                    toast.success(`${rowConfigs.length} payment(s) processed successfully`);
                    navigate(-1);
                } else {
                    toast.error(response.message || `Failed to process payments`);
                }
            }
        } catch (error) {
            console.error('Error submitting:', error);
            toast.error(error.message || 'Error processing transactions');
        } finally {
            setLoading(false);
            if (loadingOff) loadingOff();
        }
    };

    const getBillTypeOptions = () => {
        if (transactionType === 'payment') return paymentBillTypes;
        if (transactionType === 'receipt') return receiptBillTypes;
        return [];
    };

    const getStatusOptions = () => {
        if (transactionType === 'payment') return paymentStatus;
        if (transactionType === 'receipt') return receiptStatus;
        if (transactionType === 'contra') return contraStatus;
        return [];
    };

    const getVoucherTypeOptions = () => {
        if (transactionType === 'contra') {
            return voucherTypes.map(vt => ({
                Vocher_Type_Id: vt.Vocher_Type_Id,
                Voucher_Type: vt.Voucher_Type,
                value: vt.Vocher_Type_Id,
                label: vt.Voucher_Type
            }));
        }
        if (transactionType === 'payment' && paymentFilterData.voucherType.length > 0) {
            return paymentFilterData.voucherType;
        } else if (transactionType === 'receipt' && receiptFilterData.voucherType.length > 0) {
            return receiptFilterData.voucherType;
        }
        return voucherTypes;
    };


      
        
        const renderReferencesTable = () => {
              const displayData = filteredPendingReferences;
        if (transactionType === 'contra') {
            return (
                <TableContainer sx={{ maxHeight: '500px' }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell align="center" width="60px">Select</TableCell>
                                <TableCell width="120px">Vou Number</TableCell>
                                <TableCell width="100px">Vou Type</TableCell>
                                <TableCell align="center" width="100px">Entry Date</TableCell>
                                <TableCell width="180px">Party</TableCell>
                                <TableCell align="right" width="120px">Amount</TableCell>
                                <TableCell width="100px">Cheq.No</TableCell>
                                <TableCell align="center" width="100px">Cheq.Date</TableCell>
                                <TableCell width="150px">Bank</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} align="center">
                                        <Typography sx={{ py: 3, color: 'text.secondary' }}>
                                            {isSearching ? 'Searching...' : (refSearchTerm ? 'No matching records found' : 'No pending references found')}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayData.map((ref, idx) => {
                                    const isSelected = selectedReferences.some(sel => sel.uniqueId === ref.uniqueId);
                                    return (
                                        <TableRow
                                            key={ref.uniqueId || idx}
                                            hover
                                            sx={{
                                                backgroundColor: isSelected ? '#e3f2fd' : 'transparent',
                                                cursor: 'pointer',
                                                '&:hover': { backgroundColor: '#f5f5f5' }
                                            }}
                                            onClick={() => handleToggleReference(ref)}
                                        >
                                            <TableCell align="center" padding="checkbox">
                                                <Checkbox
                                                    checked={isSelected}
                                                    onChange={() => handleToggleReference(ref)}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap title={ref.uniqueNumber}>
                                                    {ref.uniqueNumber}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={ref.voucherTypeGet} 
                                                    size="small" 
                                                    color="primary" 
                                                    variant="outlined"
                                                    sx={{ fontSize: '11px' }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                {formatToDDMMYYYY(ref.entryDate)}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap title={ref.dr_cr === 'Cr' ? ref.creditAccountGet : ref.debitAccountGet}>
                                                    {ref.dr_cr === 'Cr' ? ref.creditAccountGet : ref.debitAccountGet}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="body2" fontWeight="bold">
                                                    ₹{NumberFormat(ref.amount || (ref.dr_cr === 'Cr' ? ref.credit_amount : ref.debit_amount))}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{ref.check_no || '-'}</TableCell>
                                            <TableCell align="center">
                                                {formatToDDMMYYYY(ref.check_date)}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" noWrap title={ref.bank_name}>
                                                    {ref.bank_name || '-'}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        } else {
            return (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell align="center" width="80px">Select</TableCell>
                                <TableCell>Voucher Number</TableCell>
                                <TableCell>Bill Ref No</TableCell>
                                <TableCell align="right">Total Value</TableCell>
                                <TableCell align="center">Date</TableCell>
                                <TableCell>Data Source</TableCell>
                                <TableCell align="right">Against Amount</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {displayData.map((ref, idx) => {
                                const isSelected = selectedReferences.some(sel => sel.voucherNumber === ref.voucherNumber);
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
                                        <TableCell>{ref.voucherNumber || ref.uniqueNumber}</TableCell>
                                        <TableCell>{ref.BillRefNo || ref.uniqueNumber}</TableCell>
                                        <TableCell align="right">
                                            ₹{NumberFormat(ref.totalValue || ref.amount || 0)}
                                        </TableCell>
                                        <TableCell align="center">
                                            {formatToDDMMYYYY(ref.eventDate || ref.entryDate)}
                                        </TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={ref.dataSource || ref.voucherTypeGet || 'Journal'} 
                                                size="small"
                                                color="primary"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            ₹{NumberFormat(ref.againstAmount || 0)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            );
        }
    };

    const renderTable = () => {
        const accountOptions = baseData.accountsList.map(account => ({
            id: String(account.Acc_Id),
            name: account.Account_name,
            ...account
        }));

        if (transactionType === 'contra') {
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
                                <th style={{ padding: '12px', textAlign: 'left' }}>{contraLedgerLabel}</th>
                                <th style={{ padding: '12px', textAlign: 'left' }}>Remarks</th>
                                <th style={{ padding: '12px', textAlign: 'center' }}>Ref</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rowConfigs.map((config, idx) => (
                                <tr key={config.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{idx + 1}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{formatToDDMMYYYY(config.transaction.TranDate)}</td>
                                    <td style={{ padding: '12px', textAlign: 'left' }}>{config.transaction.TranParticulars}</td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>{config.transaction.ChequeNum || '-'}</td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>{config.transaction.Amount}</td>
                                    <td style={{ padding: '12px', textAlign: 'left', minWidth: '250px' }}>
                                        <Autocomplete
                                            options={accountOptions}
                                            getOptionLabel={(option) => option.name || ''}
                                            value={accountOptions.find(opt => opt.id === config[contraLedgerField]) || null}
                                            onChange={(event, newValue) => {
                                                handleRowFieldChange(config.id, contraLedgerField, newValue?.id || '');
                                                handleRowFieldChange(config.id, contraLedgerNameField, newValue?.name || '');
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    placeholder="Search account..."
                                                    sx={{ '& .MuiInputBase-root': { fontSize: '12px' } }}
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.id === value?.id}
                                            noOptionsText="No accounts found"
                                            size="small"
                                            fullWidth
                                        />
                                        {config[contraLedgerNameField] && (
                                            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'success.main', fontSize: '10px' }}>
                                                ✓ {config[contraLedgerNameField]}
                                            </Typography>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'left' }}>
                                        <TextField
                                            value={config.remarks || ''}
                                            onChange={(e) => handleRowFieldChange(config.id, 'remarks', e.target.value)}
                                            size="small"
                                            fullWidth
                                            multiline
                                            rows={2}
                                            placeholder="Row-specific remarks"
                                        />
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            title="Add pending reference"
                                            onClick={() => {
                                                const accId = config[contraLedgerField];
                                                if (accId) {
                                                    handleOpenReferencesDialog(config.id, accId);
                                                } else {
                                                    toast.warn('Please select a ledger first');
                                                }
                                            }}
                                        >
                                            <ArrowOutwardIcon />
                                        </IconButton>
                                        {config.selectedInvoices && config.selectedInvoices.length > 0 && (
                                            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                                                {config.selectedInvoices.map((inv, idx) => (
                                                    <Chip
                                                        key={idx}
                                                        label={inv.uniqueNumber}
                                                        size="small"
                                                        variant="outlined"
                                                        color="primary"
                                                        onDelete={() => handleRemoveReference(config.id, inv.uniqueId, getReferenceAmount(inv))}
                                                        sx={{ fontSize: '10px', maxWidth: '120px', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                                                    />
                                                ))}
                                            </Box>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Paper>
            );
        }

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
                            <th style={{ padding: '12px', textAlign: 'center' }}>Ref</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rowConfigs.map((config, idx) => (
                            <tr key={config.id} style={{ borderBottom: '1px solid #ddd' }}>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{idx + 1}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{formatToDDMMYYYY(config.transaction.TranDate)}</td>
                                <td style={{ padding: '12px', textAlign: 'left' }}>{config.transaction.TranParticulars}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{config.transaction.ChequeNum || '-'}</td>
                                <td style={{ padding: '12px', textAlign: 'right' }}>{config.transaction.Amount}</td>
                                <td style={{ padding: '12px', textAlign: 'left', minWidth: '250px' }}>
                                    <Autocomplete
                                        options={accountOptions}
                                        getOptionLabel={(option) => option.name || ''}
                                        value={accountOptions.find(opt =>
                                            opt.id === (transactionType === 'payment' ? config.debit_ledger : config.credit_ledger)
                                        ) || null}
                                        onChange={(event, newValue) => {
                                            if (transactionType === 'payment') {
                                                handleRowFieldChange(config.id, 'debit_ledger', newValue?.id || '');
                                                handleRowFieldChange(config.id, 'debit_ledger_name', newValue?.name || '');
                                            } else {
                                                handleRowFieldChange(config.id, 'credit_ledger', newValue?.id || '');
                                                handleRowFieldChange(config.id, 'credit_ledger_name', newValue?.name || '');
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                size="small"
                                                placeholder="Search account..."
                                                sx={{ '& .MuiInputBase-root': { fontSize: '12px' } }}
                                            />
                                        )}
                                        isOptionEqualToValue={(option, value) => option.id === value?.id}
                                        noOptionsText="No accounts found"
                                        size="small"
                                        fullWidth
                                    />
                                    {(transactionType === 'payment' ? config.debit_ledger_name : config.credit_ledger_name) && (
                                        <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'success.main', fontSize: '10px' }}>
                                            ✓ {transactionType === 'payment' ? config.debit_ledger_name : config.credit_ledger_name}
                                        </Typography>
                                    )}
                                 </td>
                                <td style={{ padding: '12px', textAlign: 'left' }}>
                                    <TextField
                                        value={config.remarks || ''}
                                        onChange={(e) => handleRowFieldChange(config.id, 'remarks', e.target.value)}
                                        size="small"
                                        fullWidth
                                        multiline
                                        rows={2}
                                        placeholder="Row-specific remarks"
                                    />
                                 </td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
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
                                    >
                                        <ArrowOutwardIcon />
                                    </IconButton>
                                    {config.selectedInvoices && config.selectedInvoices.length > 0 && (
                                        <Box sx={{ 
                                            mt: 1, 
                                            display: 'flex', 
                                            flexWrap: 'wrap', 
                                            gap: 0.5, 
                                            justifyContent: 'center',
                                            maxWidth: '200px'
                                        }}>
                                            {config.selectedInvoices.slice(0, 3).map((inv, idx) => (
                                                <Chip
                                                    key={idx}
                                                    label={inv.voucherNumber || inv.uniqueNumber}
                                                    size="small"
                                                    variant="outlined"
                                                    color="primary"
                                                    onDelete={() => handleRemoveReference(config.id, inv.voucherNumber || inv.uniqueId, getReferenceAmount(inv))}
                                                    sx={{ fontSize: '9px', height: '20px' }}
                                                />
                                            ))}
                                            {config.selectedInvoices.length > 3 && (
                                                <Chip
                                                    label={`+${config.selectedInvoices.length - 3}`}
                                                    size="small"
                                                    variant="filled"
                                                    color="secondary"
                                                    sx={{ fontSize: '9px', height: '20px' }}
                                                />
                                            )}
                                        </Box>
                                    )}
                                 </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Paper>
        );
    };

    if (dataLoading) {
        return (
            <Card sx={{ p: 3, m: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading configuration data...</Typography>
            </Card>
        );
    }

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

    const isContraCredit = transactionType === 'contra' && transactionTypeFilter === 'C';
    const isContraDebit = transactionType === 'contra' && transactionTypeFilter === 'D';
    const commonContraAccount = isContraCredit ? commonCreditAccount : commonDebitAccount;
    const applyCommonContra = isContraCredit ? applyCommonCredit : applyCommonDebit;
    const setApplyCommonContra = isContraCredit ? setApplyCommonCredit : setApplyCommonDebit;
    const setCommonContraAccount = isContraCredit
        ? (val) => setCommonCreditAccount(val)
        : (val) => setCommonDebitAccount(val);

    return (
        <Card sx={{ p: 2, m: 2 }}>
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

            <Paper elevation={2} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
                <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                    Common Configuration (Applies to all rows)
                </Typography>
                <Grid container spacing={2}>
                    {transactionType === 'contra' && branchList.length > 0 && (
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Branch *</InputLabel>
                                <Select
                                    value={commonBranch}
                                    onChange={(e) => setCommonBranch(e.target.value)}
                                    label="Branch *"
                                >
                                    <MenuItem value="">Select Branch</MenuItem>
                                    {branchList.map((branch) => (
                                        <MenuItem key={branch.BranchId || branch.id} value={branch.BranchId || branch.id}>
                                            {branch.BranchName || branch.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}

                    {transactionType === 'contra' && (
                        <Grid item xs={12} md={2}>
                            <TextField
                                label="Contra Date"
                                type="date"
                                value={commonConfig.contra_date}
                                onChange={(e) => handleCommonConfigChange('contra_date', e.target.value)}
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    )}
                    
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

                    {transactionType !== 'contra' && (
                        <Grid item xs={12} md={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel>Bill Type *</InputLabel>
                                <Select
                                    value={commonConfig.billType}
                                    onChange={(e) => handleCommonConfigChange('billType', e.target.value)}
                                    label="Bill Type *"
                                >
                                    <MenuItem value="">Select</MenuItem>
                                    {getBillTypeOptions().map((bt) => (
                                        <MenuItem key={bt.value} value={bt.value}>{bt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}

                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={commonConfig.status}
                                onChange={(e) => handleCommonConfigChange('status', e.target.value)}
                                label="Status"
                            >
                                <MenuItem value="">Select</MenuItem>
                                {getStatusOptions().map((st) => (
                                    <MenuItem key={st.value} value={st.value}>{st.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Transaction Type *</InputLabel>
                            <Select
                                value={commonConfig.transaction_type}
                                onChange={(e) => handleCommonConfigChange('transaction_type', e.target.value)}
                                label="Transaction Type *"
                            >
                                {transactionTypes.map((tt) => (
                                    <MenuItem key={tt.value} value={tt.value}>{tt.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={transactionType === 'contra' ? 12 : 3}>
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

                {transactionType === 'contra' && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                            {isContraCredit ? 'Common Credit Account' : 'Common Debit Account'}
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={applyCommonContra}
                                            onChange={(e) => {
                                                setApplyCommonContra(e.target.checked);
                                                if (!e.target.checked) {
                                                    setCommonContraAccount({ id: '', name: '' });
                                                }
                                            }}
                                            color="primary"
                                        />
                                    }
                                    label={isContraCredit ? 'Use Common Credit' : 'Use Common Debit'}
                                />
                            </Grid>
                            {applyCommonContra && (
                                <>
                                    <Grid item xs={12} md={4}>
                                        <Autocomplete
                                            options={baseData.accountsList}
                                            getOptionLabel={(option) => option.Account_name || ''}
                                            value={baseData.accountsList.find(acc => acc.Acc_Id === commonContraAccount.id) || null}
                                            onChange={(event, newValue) => {
                                                setCommonContraAccount(
                                                    newValue
                                                        ? { id: newValue.Acc_Id, name: newValue.Account_name }
                                                        : { id: '', name: '' }
                                                );
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    label={isContraCredit ? 'Select Common Credit Account' : 'Select Common Debit Account'}
                                                    placeholder="Search account..."
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.Acc_Id === value?.id}
                                            noOptionsText="No accounts found"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<PlaylistAddCheckIcon />}
                                            onClick={applyCommonContraToAllRows}
                                            disabled={!commonContraAccount.id}
                                            sx={{ mr: 1 }}
                                        >
                                            Apply to All Rows
                                        </Button>
                                    </Grid>
                                    {commonContraAccount.name && (
                                        <Grid item xs={12} md={3}>
                                            <Chip
                                                label={`${isContraCredit ? 'Credit' : 'Debit'}: ${commonContraAccount.name}`}
                                                color="success"
                                                variant="outlined"
                                                onDelete={() => {
                                                    setCommonContraAccount({ id: '', name: '' });
                                                    setApplyCommonContra(false);
                                                }}
                                            />
                                        </Grid>
                                    )}
                                </>
                            )}
                        </Grid>
                    </Box>
                )}

                {transactionType === 'payment' && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                            Common Debit Account
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={applyCommonDebit}
                                            onChange={(e) => {
                                                setApplyCommonDebit(e.target.checked);
                                                if (!e.target.checked) {
                                                    setCommonDebitAccount({ id: '', name: '' });
                                                }
                                            }}
                                            color="primary"
                                        />
                                    }
                                    label="Use Common Debit"
                                />
                            </Grid>
                            {applyCommonDebit && (
                                <>
                                    <Grid item xs={12} md={4}>
                                        <Autocomplete
                                            options={baseData.accountsList}
                                            getOptionLabel={(option) => option.Account_name || ''}
                                            value={baseData.accountsList.find(acc => acc.Acc_Id === commonDebitAccount.id) || null}
                                            onChange={(event, newValue) => {
                                                setCommonDebitAccount(
                                                    newValue
                                                        ? { id: newValue.Acc_Id, name: newValue.Account_name }
                                                        : { id: '', name: '' }
                                                );
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    label="Select Common Debit Account"
                                                    placeholder="Search account..."
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.Acc_Id === value?.id}
                                            noOptionsText="No accounts found"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<PlaylistAddCheckIcon />}
                                            onClick={applyCommonDebitToAllRows}
                                            disabled={!commonDebitAccount.id}
                                        >
                                            Apply to All Rows
                                        </Button>
                                    </Grid>
                                    {commonDebitAccount.name && (
                                        <Grid item xs={12} md={3}>
                                            <Chip
                                                label={`Debit: ${commonDebitAccount.name}`}
                                                color="success"
                                                variant="outlined"
                                                onDelete={() => {
                                                    setCommonDebitAccount({ id: '', name: '' });
                                                    setApplyCommonDebit(false);
                                                }}
                                            />
                                        </Grid>
                                    )}
                                </>
                            )}
                        </Grid>
                    </Box>
                )}

                {transactionType === 'receipt' && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle2" fontWeight="bold" mb={2}>
                            Common Credit Account
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={applyCommonCredit}
                                            onChange={(e) => {
                                                setApplyCommonCredit(e.target.checked);
                                                if (!e.target.checked) {
                                                    setCommonCreditAccount({ id: '', name: '' });
                                                }
                                            }}
                                            color="primary"
                                        />
                                    }
                                    label="Use Common Credit"
                                />
                            </Grid>
                            {applyCommonCredit && (
                                <>
                                    <Grid item xs={12} md={4}>
                                        <Autocomplete
                                            options={baseData.accountsList}
                                            getOptionLabel={(option) => option.Account_name || ''}
                                            value={baseData.accountsList.find(acc => acc.Acc_Id === commonCreditAccount.id) || null}
                                            onChange={(event, newValue) => {
                                                setCommonCreditAccount(
                                                    newValue
                                                        ? { id: newValue.Acc_Id, name: newValue.Account_name }
                                                        : { id: '', name: '' }
                                                );
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    label="Select Common Credit Account"
                                                    placeholder="Search account..."
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.Acc_Id === value?.id}
                                            noOptionsText="No accounts found"
                                            fullWidth
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<PlaylistAddCheckIcon />}
                                            onClick={applyCommonCreditToAllRows}
                                            disabled={!commonCreditAccount.id}
                                        >
                                            Apply to All Rows
                                        </Button>
                                    </Grid>
                                    {commonCreditAccount.name && (
                                        <Grid item xs={12} md={3}>
                                            <Chip
                                                label={`Credit: ${commonCreditAccount.name}`}
                                                color="success"
                                                variant="outlined"
                                                onDelete={() => {
                                                    setCommonCreditAccount({ id: '', name: '' });
                                                    setApplyCommonCredit(false);
                                                }}
                                            />
                                        </Grid>
                                    )}
                                </>
                            )}
                        </Grid>
                    </Box>
                )}
            </Paper>

            {renderTable()}

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

               <Dialog
            open={referencesDialogOpen}
            onClose={handleCloseReferencesDialog}
            maxWidth="xl"
            fullWidth
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6">Pending References</Typography>
                
                </Box>
                <IconButton onClick={handleCloseReferencesDialog} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <Box sx={{ px: 3, pt: 2, pb: 1, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Filter by Date Range</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <input
                        type="date"
                        value={refFromDate}
                        onChange={e => setRefFromDate(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontFamily: 'inherit'
                        }}
                    />
                    <span>-</span>
                    <input
                        type="date"
                        value={refToDate}
                        onChange={e => setRefToDate(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            fontSize: '14px',
                            fontFamily: 'inherit'
                        }}
                    />
                    <IconButton
                        onClick={handleSearchReferences}
                        size="small"
                        disabled={referencesLoading}
                        sx={{
                            backgroundColor: '#1976d2',
                            color: '#fff',
                            '&:hover': { backgroundColor: '#1565c0' },
                            '&.Mui-disabled': { backgroundColor: '#ccc', color: '#fff' }
                        }}
                    >
                        <SearchIcon />
                    </IconButton>
                       {transactionType === 'contra' && pendingReferences.length > 0 && (
                    <Box>
                        <TextField
                            size="small"
                            fullWidth
                            placeholder={`Search by Voucher Number, Type, Party, Cheque No, Bank, or Amount...`}
                            value={refSearchTerm}
                            onChange={(e) => setRefSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: '20px' }} />,
                                endAdornment: (
                                    <>
                                        {isSearching && <CircularProgress size={20} sx={{ mr: 1 }} />}
                                        {refSearchTerm && !isSearching && (
                                            <IconButton size="small" onClick={() => setRefSearchTerm("")}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </>
                                )
                            }}
                            sx={{ backgroundColor: 'white' }}
                        />
                        {refSearchTerm && !isSearching && (
                            <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: 'text.secondary' }}>
                                Found {displayData.length} matching record(s) out of {pendingReferences.length}
                            </Typography>
                        )}
                    </Box>
                )}
                </Box>
                
                {/* Search Box - Only show for contra and when there are references */}
             
            </Box>

            {/* Rest of your Dialog JSX remains the same */}
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
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" color="textSecondary">
                        Selected Total:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                        ₹{NumberFormat(selectedReferences.reduce((sum, ref) => sum + getReferenceAmount(ref), 0))}
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="body2" color="textSecondary">
                        Total Value (All References):
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                        ₹{NumberFormat(pendingReferences.reduce((sum, ref) => sum + getReferenceAmount(ref), 0))}
                    </Typography>
                </Box>
            </Box>

            <DialogContent dividers>
                {referencesLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : pendingReferences.length > 0 ? (
                    renderReferencesTable()
                ) : (
                    <Typography color="textSecondary" align="center" sx={{ py: 3 }}>
                        No pending references found for the selected date range
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
        </Card>
    );
};

export default ConvertScreen;