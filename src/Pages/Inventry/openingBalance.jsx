import React, { useState, useRef, useEffect } from 'react';
import {
  Card, Paper, IconButton, Button, TextField, FormControl, 
  InputLabel, Select, MenuItem, Grid, Box, Tab, Tabs, 
  CircularProgress, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, TablePagination,
  InputAdornment, Tooltip, Checkbox, RadioGroup, Radio, FormControlLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, Chip,
  Divider, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ErrorIcon from '@mui/icons-material/Error';
import UploadIcon from '@mui/icons-material/Upload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import * as XLSX from 'xlsx';
import { fetchLink } from '../../Components/fetchComponent';
import { toast } from 'react-toastify';

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

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "#fff",
  "&:hover": {
    backgroundColor: "#f5f5f5",
  },
}));

const OpeningBalance = () => {
  const [activeTab, setActiveTab] = useState(0); // 0: Ledger, 1: Stock
  
  // Helper function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Ledger State
  const [ledgerDate, setLedgerDate] = useState(getCurrentDate());
  const [ledgerData, setLedgerData] = useState([]);
  const [ledgerFileName, setLedgerFileName] = useState('');
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState('');
  const [ledgerSuccess, setLedgerSuccess] = useState('');
  const [ledgerPreviewOpen, setLedgerPreviewOpen] = useState(false);
  const [ledgerPage, setLedgerPage] = useState(0);
  const [ledgerRowsPerPage, setLedgerRowsPerPage] = useState(10);
  const ledgerFileInputRef = useRef(null);
  
  // Stock State
  const [stockDate, setStockDate] = useState(getCurrentDate());
  const [stockData, setStockData] = useState([]);
  const [stockFileName, setStockFileName] = useState('');
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState('');
  const [stockSuccess, setStockSuccess] = useState('');
  const [stockPreviewOpen, setStockPreviewOpen] = useState(false);
  const [stockPage, setStockPage] = useState(0);
  const [stockRowsPerPage, setStockRowsPerPage] = useState(10);
  const stockFileInputRef = useRef(null);
  
  // New states for fetching existing data
  const [existingStockData, setExistingStockData] = useState(null);
  const [existingLedgerData, setExistingLedgerData] = useState(null);
  const [fetchingData, setFetchingData] = useState(false);
  const [showStockUploadPopup, setShowStockUploadPopup] = useState(false);
  const [showLedgerUploadPopup, setShowLedgerUploadPopup] = useState(false);
  const [uploadPopupDate, setUploadPopupDate] = useState(getCurrentDate());
  const [tempStockFile, setTempStockFile] = useState(null);
  const [tempLedgerFile, setTempLedgerFile] = useState(null);
  const [tempStockData, setTempStockData] = useState([]);
  const [tempLedgerData, setTempLedgerData] = useState([]);
  
  // Last OB Date States
  const [lastObDateLoading, setLastObDateLoading] = useState(false);
  const [lastObDateData, setLastObDateData] = useState(null);
  const [lastObDateDialogOpen, setLastObDateDialogOpen] = useState(false);
  const [previewDetails, setPreviewDetails] = useState([]);
  const [selectedObType, setSelectedObType] = useState(null);

  // Fetch existing data when date changes
  useEffect(() => {
    if (activeTab === 0 && ledgerDate) {
      fetchExistingLedgerData();
    } else if (activeTab === 1 && stockDate) {
      fetchExistingStockData();
    }
  }, [ledgerDate, stockDate, activeTab]);

  // Fetch Last OB Date
  const fetchLastObDate = async (type) => {
    setLastObDateLoading(true);
    setSelectedObType(type);
    try {
      const response = await fetchLink({
        address: `inventory/getLastObDate?type=${type}`,
        method: 'GET'
      });
      
      if (response.success && response.data) {
        setLastObDateData(response.data);
        // Extract preview details from the response
        const details = response.data.preview_details || [];
        setPreviewDetails(details);
        setLastObDateDialogOpen(true);
      } else {
        toast.warning(response.message || `No ${type} opening balance found`);
        setLastObDateData(null);
        setPreviewDetails([]);
      }
    } catch (error) {
      console.error('Error fetching last OB date:', error);
      toast.error('Failed to fetch last opening balance date');
    } finally {
      setLastObDateLoading(false);
    }
  };

  const handleSelectObDate = (selectedDate) => {
    const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
    
    if (selectedObType === 'ledger') {
      setLedgerDate(formattedDate);
    } else if (selectedObType === 'stock') {
      setStockDate(formattedDate);
    }
    
    // Close the dialog
    setLastObDateDialogOpen(false);
    setPreviewDetails([]);
    setLastObDateData(null);
  };

  const fetchExistingStockData = async () => {
    if (!stockDate) return;
    
    setFetchingData(true);
    try {
      const formattedDate = stockDate.split('T')[0];
      
      const response = await fetchLink({
        address: `inventory/getStockOpeningDetails?OB_date=${formattedDate}`,
        method: 'GET'
      });
      
      if (response.success && response.data) {
        setExistingStockData(response.data);
        const details = getStockDetailsFromResponse(response.data);
        
        if (details.length > 0) {
          toast.success(`Found ${details.length} stock records for ${formattedDate}`);
        } else {
          toast.warning(`No stock records found for ${formattedDate}`);
          setExistingStockData(null);
        }
      } else {
        setExistingStockData(null);
        toast.warning(`No data available for ${formattedDate}`);
      }
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setExistingStockData(null);
      toast.error('Failed to fetch stock data. Please try again.');
    } finally {
      setFetchingData(false);
    }
  };

  const fetchExistingLedgerData = async () => {
    if (!ledgerDate) return;
    
    setFetchingData(true);
    try {
      const formattedDate = ledgerDate.split('T')[0];
      
      const response = await fetchLink({
        address: `inventory/getStockOpeningDetails?OB_date=${formattedDate}`,
        method: 'GET'
      });
      
      if (response.success && response.data) {
        setExistingLedgerData(response.data);
        const details = getLedgerDetailsFromResponse(response.data);
        
        if (details.length > 0) {
          toast.success(`Found ${details.length} ledger records for ${formattedDate}`);
        } else {
          toast.warning(`No ledger records found for ${formattedDate}`);
          setExistingLedgerData(null);
        }
      } else {
        setExistingLedgerData(null);
        toast.warning(`No data available for ${formattedDate}`);
      }
    } catch (error) {
      console.error('Error fetching ledger data:', error);
      setExistingLedgerData(null);
      toast.error('Failed to fetch ledger data. Please try again.');
    } finally {
      setFetchingData(false);
    }
  };

  // Helper functions to extract data from response
  const getLedgerDetailsFromResponse = (data) => {
    return data?.data?.ledger_opening?.details || 
           data?.ledger_opening?.details || 
           [];
  };

  const getLedgerSummaryFromResponse = (data) => {
    return data?.data?.ledger_opening?.summary || 
           data?.ledger_opening?.summary || 
           {};
  };

  const getStockDetailsFromResponse = (data) => {
    return data?.data?.stock_opening?.details || 
           data?.stock_opening?.details || 
           [];
  };

  const getStockSummaryFromResponse = (data) => {
    return data?.data?.stock_opening?.summary || 
           data?.stock_opening?.summary || 
           {};
  };

  // Common Functions
  const excelSerialDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    const year = date_info.getFullYear();
    const month = String(date_info.getMonth() + 1).padStart(2, '0');
    const day = String(date_info.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateValue) => {
    if (!dateValue) return null;
    
    if (dateValue instanceof Date && !isNaN(dateValue.getTime())) {
      const year = dateValue.getFullYear();
      const month = String(dateValue.getMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    if (typeof dateValue === 'number' && dateValue > 30000) {
      return excelSerialDateToJSDate(dateValue);
    }
    
    if (typeof dateValue === 'string') {
      const str = dateValue.trim();
      if (!str || str.toLowerCase().includes('day') || str === '#N/A' || str === '#VALUE!') {
        return null;
      }
      
      let parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      
      const dateMatch = str.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
      if (dateMatch) {
        let [, day, month, year] = dateMatch;
        year = year.length === 2 ? `20${year}` : year;
        parsed = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        if (!isNaN(parsed.getTime())) {
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
      
      parsed = new Date(str);
      if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    return null;
  };

  const isValidDate = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
  };

  // Ledger Specific Functions
  const mapLedgerColumnNames = (row) => {
    const mappedRow = {};
    
    const columnMappings = {
      ledger_name: ['ledger_name', 'ledgername', 'ledger name', 'ledger', 'account_name', 'accountname', 'account name'],
      bill_no: ['bill_no', 'billno', 'bill number', 'bill_number', 'invoice_no', 'invoiceno', 'invoice number', 'inv_no'],
      bill_date: ['bill_date', 'billdate', 'bill date', 'invoice_date', 'invoicedate', 'invoice date', 'date'],
    
      amount: ['amount', 'total', 'total_amount', 'totalamount', 'invoice_amount'],
      dr_amount: ['dr_amount', 'dramount', 'dr amount', 'debit_amount', 'debitamount', 'debit'],
      cr_amount: ['cr_amount', 'cramount', 'cr amount', 'credit_amount', 'creditamount', 'credit']
    };
    
    for (const [targetField, possibleNames] of Object.entries(columnMappings)) {
      for (const possibleName of possibleNames) {
        if (row[possibleName] !== undefined) {
          mappedRow[targetField] = row[possibleName];
          break;
        }
      }
      if (mappedRow[targetField] === undefined && row[targetField] !== undefined) {
        mappedRow[targetField] = row[targetField];
      }
    }
    
    return mappedRow;
  };

  const validateLedgerRow = (row, index) => {
    const errors = [];
    
    if (!row.ledger_name?.trim()) {
      errors.push(`Row ${index + 1}: Missing ledger name`);
    }
    
    const billDate = parseDate(row.bill_date);
    if (!billDate || !isValidDate(billDate)) {
      errors.push(`Row ${index + 1}: Invalid bill date`);
    }
    
    const dueDate = parseDate(row.due_date);
    if (dueDate && !isValidDate(dueDate)) {
      errors.push(`Row ${index + 1}: Invalid due date`);
    }
    
    if (isNaN(parseFloat(row.amount || 0))) {
      errors.push(`Row ${index + 1}: Invalid amount`);
    }
    if (isNaN(parseFloat(row.dr_amount || 0))) {
      errors.push(`Row ${index + 1}: Invalid dr_amount`);
    }
    if (isNaN(parseFloat(row.cr_amount || 0))) {
      errors.push(`Row ${index + 1}: Invalid cr_amount`);
    }
    
    return errors;
  };

  const parseLedgerExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { 
            type: 'array', 
            cellDates: true,
            dateNF: 'yyyy-mm-dd',
            raw: false 
          });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          let jsonData = XLSX.utils.sheet_to_json(firstSheet, { raw: false });
          
          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }
          
          jsonData = jsonData.map(row => mapLedgerColumnNames(row));
          
          jsonData = jsonData.map(row => ({
            ...row,
            bill_date: parseDate(row.bill_date),
            due_date: parseDate(row.due_date)
          }));
          
          const validData = [];
          
          jsonData.forEach((row, idx) => {
            const hasValidBillDate = row.bill_date !== null && row.bill_date !== undefined && isValidDate(row.bill_date);
            
            if (hasValidBillDate) {
              validData.push(row);
            }
          });
          
          const validationErrors = [];
          validData.forEach((row, index) => {
            const errors = validateLedgerRow(row, index);
            validationErrors.push(...errors);
          });
          
          if (validationErrors.length > 0) {
            const errorMessage = validationErrors.slice(0, 10).join('\n');
            const moreErrors = validationErrors.length > 10 ? `\n... and ${validationErrors.length - 10} more` : '';
            reject(new Error(errorMessage + moreErrors));
          } else {
            resolve(validData);
          }
        } catch (err) {
          console.error('Parse error:', err);
          reject(new Error('Failed to parse Excel'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const downloadLedgerTemplate = () => {
    const template = [
      { ledger_name: 'Example Ledger', bill_date: '2024-01-01', due_date: '2024-01-31', bill_no: 'INV-001', amount: 1000, dr_amount: 1000, cr_amount: 0, bill_company: 'Company A' },
      { ledger_name: 'Another Ledger', bill_date: '2024-01-15', due_date: '2024-02-14', bill_no: 'INV-002', amount: 500, dr_amount: 0, cr_amount: 500, bill_company: 'Company B' }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ledger Opening Template');
    ws['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 20 }];
    XLSX.writeFile(wb, 'ledger_opening_template.xlsx');
    toast.success('Ledger template downloaded!');
  };

  const handleLedgerFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setTempLedgerFile(file);
    
    try {
      const data = await parseLedgerExcelFile(file);
      setTempLedgerData(data);
      toast.success(`Loaded ${data.length} valid records!`);
    } catch (err) {
      console.error('File parsing error:', err);
      toast.error('Failed to parse file');
      setTempLedgerFile(null);
      setTempLedgerData([]);
    }
  };

  const handleLedgerUploadConfirm = async () => {
    if (!uploadPopupDate) {
      toast.error('Please select an opening date');
      return;
    }
    if (tempLedgerData.length === 0) {
      toast.error('Please upload valid data');
      return;
    }
    
    setLedgerLoading(true);
    
    try {
      const payload = {
        ob_date: uploadPopupDate,
        ledger_data: tempLedgerData.map(row => ({
          ledger_name: String(row.ledger_name ?? '').trim() || '',
          bill_no: String(row.bill_no ?? '').trim() || '',
          bill_date: row.bill_date || null,
          due_date: row.due_date || null,
          amount: parseFloat(row.amount) || 0,
          dr_amount: parseFloat(row.dr_amount) || 0,
          cr_amount: parseFloat(row.cr_amount) || 0,
          bill_company: String(row.bill_company ?? '') || null
        }))
      };
      
      const response = await fetchLink({
        address: `inventory/uploadLedgerOpening`,
        method: 'POST',
        bodyData: payload,
      });
      
      if (response.statusCode === 200 || response.success) {
        toast.success(`${tempLedgerData.length} records uploaded!`);
        setShowLedgerUploadPopup(false);
        setLedgerDate(uploadPopupDate);
        setTempLedgerData([]);
        setTempLedgerFile(null);
        setUploadPopupDate(getCurrentDate());
        await fetchExistingLedgerData();
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      toast.error('Upload failed: ' + (err.message || err));
    } finally {
      setLedgerLoading(false);
    }
  };

  // Stock Specific Functions
  const mapStockColumnNames = (row) => {
    const mappedRow = {};
    
    const columnMappings = {
      st_item_name: ['st_item_name', 'st item name', 'item_name', 'itemname', 'item name', 'product_name', 'productname', 'product name', 'product', 'item'],
      goodown_name: ['goodown_name', 'goodown name', 'godown_name', 'godown name', 'warehouse', 'location', 'store', 'godown'],
      batch_no: ['batch_no', 'batchno', 'batch number', 'batch', 'lot_no', 'lot number'],
      st_qty: ['st_qty', 'st qty', 'quantity', 'qty', 'stock_quantity', 'stockquantity', 'stock qty'],
      st_alt_qty: ['st_alt_qty', 'st alt qty', 'alt_qty', 'alternate_quantity', 'alt quantity', 'secondary_qty', 'alt qty'],
      rate: ['rate', 'price', 'unit_price', 'unitprice', 'cost', 'unit_rate', 'rate_per_unit'],
      amount: ['amount', 'total', 'total_amount', 'totalamount', 'value', 'total_value']
    };
    
    for (const [targetField, possibleNames] of Object.entries(columnMappings)) {
      for (const possibleName of possibleNames) {
        if (row[possibleName] !== undefined) {
          mappedRow[targetField] = row[possibleName];
          break;
        }
      }
      if (mappedRow[targetField] === undefined && row[targetField] !== undefined) {
        mappedRow[targetField] = row[targetField];
      }
    }
    
    // Calculate amount if not provided
    if ((!mappedRow.amount || mappedRow.amount === 0) && mappedRow.st_qty && mappedRow.rate) {
      mappedRow.amount = parseFloat(mappedRow.st_qty) * parseFloat(mappedRow.rate);
    }
    
    return mappedRow;
  };

  const parseStockExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { 
            type: 'array', 
            raw: false 
          });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          let jsonData = XLSX.utils.sheet_to_json(firstSheet, { raw: false });
          
          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }
          
          jsonData = jsonData.map(row => mapStockColumnNames(row));
          
          const validData = [];
          const invalidRows = [];
          
          jsonData.forEach((row, idx) => {
            // Validate required fields
            if (!row.st_item_name?.trim()) {
              invalidRows.push(`Row ${idx + 2}: Missing item name`);
              return;
            }
            
            if (!row.goodown_name?.trim()) {
              invalidRows.push(`Row ${idx + 2}: Missing godown name`);
              return;
            }
            
            // Ensure numeric values are valid
            row.st_qty = parseFloat(row.st_qty) || 0;
            row.st_alt_qty = parseFloat(row.st_alt_qty) || 0;
            row.rate = parseFloat(row.rate) || 0;
            row.amount = parseFloat(row.amount) || (row.st_qty * row.rate);
            
            // Set default batch_no if empty
            if (!row.batch_no?.trim()) {
              row.batch_no = 'Primary Batch';
            }
            
            validData.push(row);
          });
          
          if (invalidRows.length > 0) {
            const errorMessage = invalidRows.slice(0, 10).join('\n');
            const moreErrors = invalidRows.length > 10 ? `\n... and ${invalidRows.length - 10} more` : '';
            reject(new Error(errorMessage + moreErrors));
          } else if (validData.length === 0) {
            reject(new Error('No valid records found in the file'));
          } else {
            resolve(validData);
          }
        } catch (err) {
          console.error('Parse error:', err);
          reject(new Error('Failed to parse Excel'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const downloadStockTemplate = () => {
    const template = [
      { 
        st_item_name: '10-Pallangi Thattai 1kg', 
        goodown_name: 'Smt Mill', 
        batch_no: 'FE4-22', 
        st_qty: 8.90, 
        st_alt_qty: 8.90, 
        rate: 79.50, 
        amount: 707.55 
      },
      { 
        st_item_name: 'Sample Product', 
        goodown_name: 'Main Godown', 
        batch_no: 'BATCH001', 
        st_qty: 10.00, 
        st_alt_qty: 10.00, 
        rate: 100.00, 
        amount: 1000.00 
      }
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Opening Template');
    ws['!cols'] = [
      { wch: 25 },  // st_item_name
      { wch: 20 },  // goodown_name
      { wch: 15 },  // batch_no
      { wch: 12 },  // st_qty
      { wch: 12 },  // st_alt_qty
      { wch: 12 },  // rate
      { wch: 15 }   // amount
    ];
    XLSX.writeFile(wb, 'stock_opening_template.xlsx');
    toast.success('Stock template downloaded!');
  };

  const handleStockFileSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setTempStockFile(file);
    
    try {
      const data = await parseStockExcelFile(file);
      setTempStockData(data);
      toast.success(`Loaded ${data.length} valid stock records!`);
    } catch (err) {
      console.error('File parsing error:', err);
      toast.error('Failed to parse stock file');
      setTempStockFile(null);
      setTempStockData([]);
    }
  };

  const handleStockUploadConfirm = async () => {
    if (!uploadPopupDate) {
      toast.error('Please select an opening date');
      return;
    }
    if (tempStockData.length === 0) {
      toast.error('Please upload valid stock data');
      return;
    }
    
    setStockLoading(true);
    
    try {
      const payload = {
        ob_date: uploadPopupDate,
        st_item_name: tempStockData.map(row => String(row.st_item_name ?? '').trim()),
        goodown_name: tempStockData.map(row => String(row.goodown_name ?? '').trim()),
        batch_no: tempStockData.map(row => String(row.batch_no ?? 'Primary Batch').trim()),
        st_qty: tempStockData.map(row => parseFloat(row.st_qty) || 0),
        st_alt_qty: tempStockData.map(row => parseFloat(row.st_alt_qty) || 0),
        rate: tempStockData.map(row => parseFloat(row.rate) || 0),
        amount: tempStockData.map(row => parseFloat(row.amount) || 0)
      };
      
      const response = await fetchLink({
        address: `inventory/uploadStockOpening`,
        method: 'POST',
        bodyData: payload,
      });
      
      if (response.statusCode === 200 || response.success) {
        toast.success(`${tempStockData.length} stock records uploaded!`);
        setShowStockUploadPopup(false);
        setStockDate(uploadPopupDate);
        setTempStockData([]);
        setTempStockFile(null);
        setUploadPopupDate(getCurrentDate());
        await fetchExistingStockData();
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Upload Error:', err);
      toast.error('Upload failed: ' + (err.message || err));
    } finally {
      setStockLoading(false);
    }
  };

  const handleLedgerPreview = () => {
    const details = getLedgerDetailsFromResponse(existingLedgerData);
    if (details.length > 0) {
      setLedgerData(details);
      setLedgerPreviewOpen(true);
    } else {
      toast.info('No data to preview');
    }
  };

  const handleStockPreview = () => {
    const details = getStockDetailsFromResponse(existingStockData);
    if (details.length > 0) {
      setStockData(details);
      setStockPreviewOpen(true);
    } else {
      toast.info('No data to preview');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getPageSizeOptions = () => [5, 10, 15, 30, 50, 100];

  const ledgerColumns = [
    { accessor: "ledger_name", header: "Ledger Name", align: "left" },
    { accessor: "bill_no", header: "Bill No", align: "left", render: (row) => row.bill_no || '-' },
    { accessor: "bill_date", header: "Bill Date", align: "center", render: (row) => row.bill_date ? new Date(row.bill_date).toLocaleDateString() : '-' },
    { accessor: "due_date", header: "Due Date", align: "center", render: (row) => row.due_date ? new Date(row.due_date).toLocaleDateString() : '-' },
    { accessor: "amount", header: "Amount", align: "right", render: (row) => (parseFloat(row.amount) || 0).toFixed(2) },
    { accessor: "dr_amount", header: "DR Amount", align: "right", render: (row) => (parseFloat(row.dr_amount) || 0).toFixed(2) },
    { accessor: "cr_amount", header: "CR Amount", align: "right", render: (row) => (parseFloat(row.cr_amount) || 0).toFixed(2) },
    { accessor: "Bill_Company", header: "Bill Company", align: "left", render: (row) => row.Bill_Company || '-' }
  ];

  const stockColumns = [
    { accessor: "Product_Name", header: "Item Name", align: "left" },
    { accessor: "Godown_Name", header: "Godown Name", align: "left" },
    { accessor: "batch_no", header: "Batch No", align: "left" },
    { accessor: "st_qty", header: "Quantity", align: "right", render: (row) => (parseFloat(row.st_qty) || 0).toFixed(2) },
    { accessor: "st_alt_qty", header: "Alt Quantity", align: "right", render: (row) => (parseFloat(row.st_alt_qty) || 0).toFixed(2) },
    { accessor: "rate", header: "Rate", align: "right", render: (row) => (parseFloat(row.rate) || 0).toFixed(2) },
    { accessor: "amount", header: "Amount", align: "right", render: (row) => (parseFloat(row.amount) || 0).toFixed(2) },
  ];

  const renderLedgerTableHeader = () => (
    <TableHead>
      <TableRow>
        <StyledTableCell align="center" sx={{ width: "60px" }}>S.No</StyledTableCell>
        {ledgerColumns.map((col) => (
          <StyledTableCell key={col.accessor} align={col.align || "center"}>
            {col.header}
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderStockTableHeader = () => (
    <TableHead>
      <TableRow>
        <StyledTableCell align="center" sx={{ width: "60px" }}>S.No</StyledTableCell>
        {stockColumns.map((col) => (
          <StyledTableCell key={col.accessor} align={col.align || "center"}>
            {col.header}
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  // Get data from response with proper nested structure handling
  const ledgerDetails = getLedgerDetailsFromResponse(existingLedgerData);
  const stockDetails = getStockDetailsFromResponse(existingStockData);
  const ledgerSummary = getLedgerSummaryFromResponse(existingLedgerData);
  const stockSummary = getStockSummaryFromResponse(existingStockData);

  // Prepare paginated data
  const paginatedLedgerData = ledgerDetails.slice(
    ledgerPage * ledgerRowsPerPage,
    ledgerPage * ledgerRowsPerPage + ledgerRowsPerPage
  );

  const paginatedStockData = stockDetails.slice(
    stockPage * stockRowsPerPage,
    stockPage * stockRowsPerPage + stockRowsPerPage
  );

  return (
    <Card component={Paper} sx={{ p: 2, m: 2 }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab 
            label={`LEDGER OPENING ${ledgerDetails.length > 0 ? `(${ledgerDetails.length})` : ''}`} 
            icon={<UploadIcon />} 
            iconPosition="start"
          />
          <Tab 
            label={`STOCK OPENING ${stockDetails.length > 0 ? `(${stockDetails.length})` : ''}`} 
            icon={<UploadIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Ledger Tab */}
      {activeTab === 0 && (
        <Box>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label fw-bold" style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                      Opening Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={ledgerDate}
                      onChange={(e) => setLedgerDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '0.875rem' }}
                    />
                  </div>
                  <Tooltip title="Get Last Ledger Opening Balance Date">
                    <IconButton 
                      color="primary" 
                      onClick={() => fetchLastObDate('ledger')}
                      disabled={lastObDateLoading}
                      sx={{ bgcolor: '#f0f0f0', '&:hover': { bgcolor: '#e0e0e0' }, marginTop: '20px' }}
                    >
                      {lastObDateLoading ? <CircularProgress size={24} /> : <HistoryIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setUploadPopupDate(ledgerDate);
                      setShowLedgerUploadPopup(true);
                    }}
                    disabled={!ledgerDate || fetchingData}
                    startIcon={<UploadIcon />}
                  >
                    Upload New/Update
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={downloadLedgerTemplate}
                    startIcon={<DownloadIcon />}
                  >
                    Download Template
                  </Button>
                  
                  {ledgerDetails.length > 0 && (
                    <>
                      <Button
                        variant="outlined"
                        color="info"
                        onClick={handleLedgerPreview}
                        startIcon={<VisibilityIcon />}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={fetchExistingLedgerData}
                        startIcon={<RefreshIcon />}
                      >
                        Refresh
                      </Button>
                    </>
                  )}
                </Box>
              
              </Grid>
              
                <Grid item xs={12} md={2}>
                {fetchingData && <CircularProgress size={24} />}
                {existingLedgerData && !fetchingData && (
                  <Chip 
                    label={`${ledgerDetails.length} records found`} 
                    color="primary" 
                    size="small"
                  />
                )}
              </Grid>
            </Grid>
          </Box>

          {existingLedgerData && ledgerDetails.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Ledger Opening Balance Summary</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                        <Typography variant="caption" color="textSecondary">Total Records</Typography>
                        <Typography variant="h5">{ledgerSummary.total_records || 0}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                        <Typography variant="caption" color="textSecondary">Total Amount</Typography>
                        <Typography variant="h5">₹{(ledgerSummary.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                        <Typography variant="caption" color="textSecondary">Total DR Amount</Typography>
                        <Typography variant="h5">₹{(ledgerSummary.total_dr_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fce4ec' }}>
                        <Typography variant="caption" color="textSecondary">Total CR Amount</Typography>
                        <Typography variant="h5">₹{(ledgerSummary.total_cr_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}

          {ledgerError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setLedgerError('')}>
              <div style={{ whiteSpace: 'pre-line' }}>{ledgerError}</div>
            </Alert>
          )}
          
          {ledgerSuccess && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setLedgerSuccess('')}>
              {ledgerSuccess}
            </Alert>
          )}

          <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", overflowX: "auto", mt: 2 }}>
            <TableContainer>
              <Table stickyHeader>
                {renderLedgerTableHeader()}
                <TableBody>
                  {!existingLedgerData ? (
                    <TableRow>
                      <StyledTableCell colSpan={ledgerColumns.length + 1} align="center">
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <UploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                          <Typography color="textSecondary">
                            Select a date to view existing opening balance
                          </Typography>
                        </Box>
                      </StyledTableCell>
                    </TableRow>
                  ) : ledgerDetails.length === 0 ? (
                    <TableRow>
                      <StyledTableCell colSpan={ledgerColumns.length + 1} align="center">
                        <Typography color="error">No records found for the selected date</Typography>
                      </StyledTableCell>
                    </TableRow>
                  ) : (
                    paginatedLedgerData.map((row, idx) => (
                      <StyledTableRow key={idx}>
                        <StyledTableCell align="center">
                          {ledgerPage * ledgerRowsPerPage + idx + 1}
                        </StyledTableCell>
                        {ledgerColumns.map((col) => (
                          <StyledTableCell key={col.accessor} align={col.align || "center"}>
                            {col.render ? col.render(row) : (row[col.accessor] || '-')}
                          </StyledTableCell>
                        ))}
                      </StyledTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {ledgerDetails.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, p: 2, backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
                <TablePagination
                  component="div"
                  count={ledgerDetails.length}
                  rowsPerPage={ledgerRowsPerPage}
                  page={ledgerPage}
                  onPageChange={(e, newPage) => setLedgerPage(newPage)}
                  rowsPerPageOptions={[]}
                />
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Rows per page</InputLabel>
                  <Select
                    value={ledgerRowsPerPage}
                    onChange={(e) => {
                      setLedgerRowsPerPage(parseInt(e.target.value, 10));
                      setLedgerPage(0);
                    }}
                    label="Rows per page"
                  >
                    {getPageSizeOptions().map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* Stock Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label className="form-label fw-bold" style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                      Opening Date
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      value={stockDate}
                      onChange={(e) => setStockDate(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '0.875rem' }}
                    />
                  </div>
                  <Tooltip title="Get Last Stock Opening Balance Date">
                    <IconButton 
                      color="success" 
                      onClick={() => fetchLastObDate('stock')}
                      disabled={lastObDateLoading}
                      sx={{ bgcolor: '#f0f0f0', '&:hover': { bgcolor: '#e0e0e0' }, marginTop: '20px' }}
                    >
                      {lastObDateLoading ? <CircularProgress size={24} /> : <HistoryIcon />}
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      setUploadPopupDate(stockDate);
                      setShowStockUploadPopup(true);
                    }}
                    disabled={!stockDate || fetchingData}
                    startIcon={<UploadIcon />}
                  >
                    Upload New/Update
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={downloadStockTemplate}
                    startIcon={<DownloadIcon />}
                  >
                    Download Template
                  </Button>
                  
                  {stockDetails.length > 0 && (
                    <>
                      <Button
                        variant="outlined"
                        color="info"
                        onClick={handleStockPreview}
                        startIcon={<VisibilityIcon />}
                      >
                        Preview
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={fetchExistingStockData}
                        startIcon={<RefreshIcon />}
                      >
                        Refresh
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>
              
              <Grid item xs={12} md={2}>
                {fetchingData && <CircularProgress size={24} />}
                {existingStockData && !fetchingData && (
                  <Chip 
                    label={`${stockDetails.length} records found`} 
                    color="success" 
                    size="small"
                  />
                )}
              </Grid>
            </Grid>
          </Box>

          {existingStockData && stockDetails.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Stock Opening Balance Summary</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
                        <Typography variant="caption" color="textSecondary">Total Records</Typography>
                        <Typography variant="h5">{stockSummary.total_records || 0}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
                        <Typography variant="caption" color="textSecondary">Total Quantity</Typography>
                        <Typography variant="h5">{(stockSummary.total_quantity || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
                        <Typography variant="caption" color="textSecondary">Total Amount</Typography>
                        <Typography variant="h5">₹{(stockSummary.total_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}

          {stockError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setStockError('')}>
              <div style={{ whiteSpace: 'pre-line' }}>{stockError}</div>
            </Alert>
          )}
          
          {stockSuccess && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setStockSuccess('')}>
              {stockSuccess}
            </Alert>
          )}

          <Paper elevation={0} sx={{ border: "1px solid #e0e0e0", overflowX: "auto", mt: 2 }}>
            <TableContainer>
              <Table stickyHeader>
                {renderStockTableHeader()}
                <TableBody>
                  {!existingStockData ? (
                    <TableRow>
                      <StyledTableCell colSpan={stockColumns.length + 1} align="center">
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                          <UploadIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                          <Typography color="textSecondary">
                            Select a date to view existing opening balance
                          </Typography>
                        </Box>
                      </StyledTableCell>
                    </TableRow>
                  ) : stockDetails.length === 0 ? (
                    <TableRow>
                      <StyledTableCell colSpan={stockColumns.length + 1} align="center">
                        <Typography color="error">No records found for the selected date</Typography>
                      </StyledTableCell>
                    </TableRow>
                  ) : (
                    paginatedStockData.map((row, idx) => (
                      <StyledTableRow key={idx}>
                        <StyledTableCell align="center">
                          {stockPage * stockRowsPerPage + idx + 1}
                        </StyledTableCell>
                        {stockColumns.map((col) => (
                          <StyledTableCell key={col.accessor} align={col.align || "center"}>
                            {col.render ? col.render(row) : (row[col.accessor] || '-')}
                          </StyledTableCell>
                        ))}
                      </StyledTableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {stockDetails.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, p: 2, backgroundColor: '#f5f5f5', borderTop: '1px solid #e0e0e0' }}>
                <TablePagination
                  component="div"
                  count={stockDetails.length}
                  rowsPerPage={stockRowsPerPage}
                  page={stockPage}
                  onPageChange={(e, newPage) => setStockPage(newPage)}
                  rowsPerPageOptions={[]}
                />
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Rows per page</InputLabel>
                  <Select
                    value={stockRowsPerPage}
                    onChange={(e) => {
                      setStockRowsPerPage(parseInt(e.target.value, 10));
                      setStockPage(0);
                    }}
                    label="Rows per page"
                  >
                    {getPageSizeOptions().map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Paper>
        </Box>
      )}

      {/* Last OB Date Preview Dialog */}
      <Dialog open={lastObDateDialogOpen} onClose={() => setLastObDateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedObType === 'ledger' ? 'Last Ledger Opening Balance Dates' : 'Last Stock Opening Balance Dates'}
          <IconButton onClick={() => setLastObDateDialogOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {previewDetails && previewDetails.length > 0 ? (
            <Box>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell align="center">S.No</TableCell>
                      <TableCell align="center">Opening Balance Date</TableCell>
                      <TableCell align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {previewDetails.map((item, index) => {
                      const dateStr = item.ob_date ? new Date(item.ob_date).toLocaleDateString('en-IN') : 'N/A';
                      return (
                        <TableRow key={index} hover>
                          <TableCell align="center">{index + 1}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 500 }}>
                            {dateStr}
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              onClick={() => handleSelectObDate(item.ob_date)}
                              sx={{ textTransform: 'none' }}
                            >
                              Select
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography color="textSecondary">
                No previous opening balance dates found
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLastObDateDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Ledger Upload Popup Dialog */}
      <Dialog open={showLedgerUploadPopup} onClose={() => setShowLedgerUploadPopup(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload Ledger Opening Balance
          <IconButton onClick={() => setShowLedgerUploadPopup(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <div>
                <label className="form-label fw-bold" style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  Opening Date *
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={uploadPopupDate}
                  onChange={(e) => setUploadPopupDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '0.875rem' }}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <Divider>Upload Excel File</Divider>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<UploadIcon />}
              >
                Select Excel File
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={handleLedgerFileSelect}
                />
              </Button>
              {tempLedgerFile && (
                <Chip 
                  label={tempLedgerFile.name} 
                  color="success" 
                  size="small"
                  sx={{ mt: 1 }}
                  onDelete={() => {
                    setTempLedgerFile(null);
                    setTempLedgerData([]);
                  }}
                />
              )}
            </Grid>
            {tempLedgerData.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Loaded {tempLedgerData.length} records. Click Upload to confirm.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLedgerUploadPopup(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleLedgerUploadConfirm}
            disabled={!uploadPopupDate || tempLedgerData.length === 0 || ledgerLoading}
            startIcon={ledgerLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {ledgerLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Upload Popup Dialog */}
      <Dialog open={showStockUploadPopup} onClose={() => setShowStockUploadPopup(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Upload Stock Opening Balance
          <IconButton onClick={() => setShowStockUploadPopup(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <div>
                <label className="form-label fw-bold" style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem', fontWeight: 'bold' }}>
                  Opening Date *
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={uploadPopupDate}
                  onChange={(e) => setUploadPopupDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '0.875rem' }}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <Divider>Upload Excel File</Divider>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<UploadIcon />}
              >
                Select Excel File
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={handleStockFileSelect}
                />
              </Button>
              {tempStockFile && (
                <Chip 
                  label={tempStockFile.name} 
                  color="success" 
                  size="small"
                  sx={{ mt: 1 }}
                  onDelete={() => {
                    setTempStockFile(null);
                    setTempStockData([]);
                  }}
                />
              )}
            </Grid>
            {tempStockData.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="info">
                  Loaded {tempStockData.length} records. Click Upload to confirm.
                </Alert>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStockUploadPopup(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="success"
            onClick={handleStockUploadConfirm}
            disabled={!uploadPopupDate || tempStockData.length === 0 || stockLoading}
            startIcon={stockLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {stockLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Ledger Preview Dialog */}
      <Dialog open={ledgerPreviewOpen} onClose={() => setLedgerPreviewOpen(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          Ledger Data Preview
          <IconButton onClick={() => setLedgerPreviewOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  {ledgerColumns.map(col => (
                    <TableCell key={col.accessor} align={col.align || "center"}>{col.header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {ledgerDetails.slice(0, 100).map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    {ledgerColumns.map(col => (
                      <TableCell key={col.accessor} align={col.align || "center"}>
                        {col.render ? col.render(row) : (row[col.accessor] || '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {ledgerDetails.length > 100 && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Showing first 100 of {ledgerDetails.length} records
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLedgerPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Stock Preview Dialog */}
      <Dialog open={stockPreviewOpen} onClose={() => setStockPreviewOpen(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          Stock Data Preview
          <IconButton onClick={() => setStockPreviewOpen(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>S.No</TableCell>
                  {stockColumns.map(col => (
                    <TableCell key={col.accessor} align={col.align || "center"}>{col.header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {stockDetails.slice(0, 100).map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{idx + 1}</TableCell>
                    {stockColumns.map(col => (
                      <TableCell key={col.accessor} align={col.align || "center"}>
                        {col.render ? col.render(row) : (row[col.accessor] || '-')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {stockDetails.length > 100 && (
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Showing first 100 of {stockDetails.length} records
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default OpeningBalance;