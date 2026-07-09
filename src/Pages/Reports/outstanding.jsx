import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Chip,
    Button,
    Tooltip,
    ToggleButton,
    ToggleButtonGroup,
    IconButton,
    useMediaQuery,
    useTheme,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid
} from '@mui/material';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import DateRangeIcon from '@mui/icons-material/DateRange';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from "xlsx";
import dayjs from "dayjs";

// Import your fetch utility - adjust path as needed
import { fetchLink } from "../../Components/fetchComponent";

// Import NumberFormat utility if needed
const NumberFormat = (value) => {
    if (!value || value === 0) return "-";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// AccountTransactionsDialog Component
const AccountTransactionsDialog = ({ open, onClose, accountId, accountName, fromDate, toDate }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const contentRef = useRef(null);

    useEffect(() => {
        if (open && accountId) {
            fetchTransactionDetails();
        }
    }, [open, accountId, fromDate, toDate]);

    const fetchTransactionDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchLink({
                address: `payment/transactions?Acc_Id=${accountId}&fromDate=${fromDate}&toDate=${toDate}`,
                method: "GET",
            });
            
            if (data.success) {
                setTransactions(data.data || []);
            } else {
                setError(data.message || "Failed to fetch transactions");
            }
        } catch (err) {
            setError("Error fetching transaction details");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Group transactions by month-year
    const getGroupedTransactions = () => {
        if (!transactions.length) {
            return { groups: [], grandTotals: { debit: 0, credit: 0 } };
        }
        
        const groups = [];
        let currentMonth = null;
        let currentYear = null;
        let currentGroup = null;
        let monthTotals = { debit: 0, credit: 0 };
        let grandTotals = { debit: 0, credit: 0 };

        // Sort transactions by date
        const sortedTransactions = [...transactions].sort((a, b) => 
            new Date(a.Ledger_Date) - new Date(b.Ledger_Date)
        );

        sortedTransactions.forEach((txn, index) => {
            const date = new Date(txn.Ledger_Date);
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();
            
            // Check if we need to start a new month group
            if (currentMonth !== month || currentYear !== year) {
                // Add previous month totals if exists
                if (currentGroup) {
                    currentGroup.transactions.push({
                        isTotalRow: true,
                        debit: monthTotals.debit,
                        credit: monthTotals.credit,
                        balance: monthTotals.credit - monthTotals.debit,
                    });
                    
                    // Reset month totals
                    monthTotals = { debit: 0, credit: 0 };
                }
                
                // Start new group
                currentMonth = month;
                currentYear = year;
                currentGroup = {
                    monthYear: `${month} ${year}`,
                    transactions: [],
                    monthTotal: { debit: 0, credit: 0 }
                };
                groups.push(currentGroup);
            }
            
            // Add transaction to current group
            currentGroup.transactions.push({
                ...txn,
                isTransaction: true,
                formattedInvoice: `${txn.invoice_no}/${year}`,
                displayDate: date.toLocaleDateString('en-GB')
            });
            
            // Add to month totals
            const debit = parseFloat(txn.Debit_Amt || 0);
            const credit = parseFloat(txn.Credit_Amt || 0);
            monthTotals.debit += debit;
            monthTotals.credit += credit;
            grandTotals.debit += debit;
            grandTotals.credit += credit;
            
            // Update current group totals
            currentGroup.monthTotal.debit = monthTotals.debit;
            currentGroup.monthTotal.credit = monthTotals.credit;
            
            // If last transaction, add final month totals
            if (index === sortedTransactions.length - 1) {
                currentGroup.transactions.push({
                    isTotalRow: true,
                    debit: monthTotals.debit,
                    credit: monthTotals.credit,
                    balance: monthTotals.credit - monthTotals.debit,
                });
            }
        });

        return { groups, grandTotals };
    };

    const { groups, grandTotals } = getGroupedTransactions();
    const grandBalance = grandTotals.credit - grandTotals.debit;

    const generatePDF = () => {
        if (groups.length === 0) return;

        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        let yPos = 20;
        
        // Title
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text("Transaction Details", pageWidth / 2, yPos, { align: 'center' });
        yPos += 8;
        
        // Account Name
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text(`Account: ${accountName}`, 20, yPos);
        yPos += 6;
        
        // Date Range
        const fromDateStr = new Date(fromDate).toLocaleDateString();
        const toDateStr = new Date(toDate).toLocaleDateString();
        doc.text(`Period: ${fromDateStr} to ${toDateStr}`, 20, yPos);
        yPos += 15;
        
        // Add each month section
        groups.forEach((group, groupIndex) => {
            // Check if we need a new page
            if (yPos > pageHeight - 50) {
                doc.addPage();
                yPos = 20;
            }
            
            // Month Header
            doc.setFontSize(13);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(33, 150, 243);
            doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
            doc.text(group.monthYear, pageWidth / 2, yPos, { align: 'center' });
            doc.setTextColor(0, 0, 0);
            yPos += 12;
            
            // Prepare table data
            const tableData = group.transactions.map((txn) => {
                if (txn.isTotalRow) {
                    return [
                        { content: `${group.monthYear} Total`, colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                        NumberFormat(txn.debit),
                        NumberFormat(txn.credit),
                        `${NumberFormat(Math.abs(txn.balance))} ${txn.balance >= 0 ? 'CR' : 'DR'}`
                    ];
                }
                
                // Regular Transaction Row
                return [
                    txn.displayDate,
                    txn.formattedInvoice,
                    txn.Particulars || '',
                    NumberFormat(txn.Debit_Amt || 0),
                    NumberFormat(txn.Credit_Amt || 0),
                    txn.Ledger_Desc || ''
                ];
            });
            
            // Create table with simpler formatting
            doc.autoTable({
                head: [['Date', 'Invoice No', 'Particulars', 'Debit', 'Credit', 'Description']],
                body: tableData,
                startY: yPos,
                margin: { left: 15, right: 15 },
                theme: 'grid',
                headStyles: { 
                    fillColor: [66, 66, 66], 
                    textColor: [255, 255, 255], 
                    fontStyle: 'bold',
                    fontSize: 10
                },
                bodyStyles: { 
                    fontSize: 9,
                    cellPadding: 3
                },
                columnStyles: {
                    0: { cellWidth: 22 },
                    1: { cellWidth: 28 },
                    2: { cellWidth: 45 },
                    3: { cellWidth: 22, halign: 'right' },
                    4: { cellWidth: 22, halign: 'right' },
                    5: { cellWidth: 40 }
                },
                styles: {
                    overflow: 'linebreak',
                    cellWidth: 'wrap'
                },
                didDrawPage: function(data) {
                    yPos = data.cursor.y + 10;
                }
            });
            
            yPos = doc.lastAutoTable.finalY + 10;
        });
        
        // Add grand total section
        if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
        }
        
        // Grand Total Header
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(51, 51, 51);
        doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F');
        doc.text("GRAND TOTAL", pageWidth / 2, yPos, { align: 'center' });
        doc.setTextColor(0, 0, 0);
        yPos += 12;
        
        // Grand Total Table
        const grandTotalData = [
            [
                { content: '', colSpan: 3, styles: { fontStyle: 'bold', halign: 'right' } },
                NumberFormat(grandTotals.debit),
                NumberFormat(grandTotals.credit),
                `${NumberFormat(Math.abs(grandBalance))} ${grandBalance >= 0 ? 'CR' : 'DR'}`
            ]
        ];
        
        doc.autoTable({
            body: grandTotalData,
            startY: yPos,
            margin: { left: 15, right: 15 },
            theme: 'grid',
            bodyStyles: { 
                fontSize: 11, 
                fillColor: [51, 51, 51], 
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            columnStyles: {
                0: { cellWidth: 22 },
                1: { cellWidth: 28 },
                2: { cellWidth: 45 },
                3: { cellWidth: 22, halign: 'right' },
                4: { cellWidth: 22, halign: 'right' },
                5: { cellWidth: 40 }
            }
        });
        
        yPos = doc.lastAutoTable.finalY + 15;
        
        // Add summary section
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("SUMMARY", 20, yPos);
        yPos += 10;
        
        // Summary boxes
        const summaryWidth = 55;
        const summaryHeight = 20;
        const spacing = 5;
        
        // Total Debit
        doc.setDrawColor(221, 221, 221);
        doc.setFillColor(255, 255, 255);
        doc.rect(20, yPos, summaryWidth, summaryHeight, 'FD');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);
        doc.text("Total Debit", 20 + summaryWidth/2, yPos + 7, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 53, 69);
        doc.text(NumberFormat(grandTotals.debit), 20 + summaryWidth/2, yPos + 16, { align: 'center' });
        
        // Total Credit
        doc.setDrawColor(221, 221, 221);
        doc.setFillColor(255, 255, 255);
        doc.rect(20 + summaryWidth + spacing, yPos, summaryWidth, summaryHeight, 'FD');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);
        doc.text("Total Credit", 20 + summaryWidth + spacing + summaryWidth/2, yPos + 7, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 167, 69);
        doc.text(NumberFormat(grandTotals.credit), 20 + summaryWidth + spacing + summaryWidth/2, yPos + 16, { align: 'center' });
        
        // Net Balance
        doc.setDrawColor(221, 221, 221);
        doc.setFillColor(248, 249, 250);
        doc.rect(20 + (summaryWidth + spacing) * 2, yPos, summaryWidth, summaryHeight, 'FD');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(102, 102, 102);
        doc.text("Net Balance", 20 + (summaryWidth + spacing) * 2 + summaryWidth/2, yPos + 7, { align: 'center' });
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        if (grandBalance >= 0) {
            doc.setTextColor(40, 167, 69);
        } else {
            doc.setTextColor(220, 53, 69);
        }
        doc.text(`${NumberFormat(Math.abs(grandBalance))} ${grandBalance >= 0 ? 'CR' : 'DR'}`, 
                 20 + (summaryWidth + spacing) * 2 + summaryWidth/2, yPos + 16, { align: 'center' });
        
        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(128, 128, 128);
        const generatedDate = new Date().toLocaleString();
        doc.text(`Generated on: ${generatedDate}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`Account ID: ${accountId}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
        
        // Save the PDF
        const fileName = `Transaction_Details_${accountName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            scroll="paper"
        >
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" component="span">
                            Transaction Details - {accountName}
                        </Typography>
                        <Typography variant="body2" component="span" sx={{ ml: 2, color: 'text.secondary' }}>
                            (From: {new Date(fromDate).toLocaleDateString()} To: {new Date(toDate).toLocaleDateString()})
                        </Typography>
                    </Box>
                    <Tooltip title="Download PDF">
                        <IconButton 
                            onClick={generatePDF} 
                            disabled={loading || groups.length === 0}
                            color="primary"
                            sx={{ ml: 2 }}
                        >
                            <PictureAsPdfIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </DialogTitle>
            <DialogContent dividers ref={contentRef}>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box color="error.main" textAlign="center" py={4}>
                        {error}
                    </Box>
                ) : groups.length === 0 ? (
                    <Box textAlign="center" py={4} color="text.secondary">
                        No transactions found for this period
                    </Box>
                ) : (
                    <Box sx={{ mb: 3 }}>
                        {groups.map((group, groupIndex) => (
                            <Box key={groupIndex} sx={{ mb: 4 }}>
                                {/* Month Header */}
                                <Box 
                                    sx={{ 
                                        bgcolor: 'primary.main', 
                                        color: 'white',
                                        p: 1.5,
                                        borderRadius: '4px 4px 0 0',
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {group.monthYear}
                                </Box>
                                
                                {/* Transactions Table */}
                                <table className="table table-bordered table-hover w-100 mb-0" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr>
                                            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Date</th>
                                            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Invoice No</th>
                                            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Particulars</th>
                                            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Debit Amount</th>
                                            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Credit Amount</th>
                                            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Ledger Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {group.transactions.map((txn, txnIndex) => {
                                            if (txn.isTotalRow) {
                                                // Month Total Row
                                                return (
                                                    <tr key={`total-${groupIndex}-${txnIndex}`} style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                                                        <td colSpan="3" style={{ textAlign: 'right', paddingRight: '20px', border: '1px solid #ddd', padding: '8px' }}>
                                                            {group.monthYear} Total
                                                        </td>
                                                        <td style={{ color: '#dc3545', fontWeight: 'bold', border: '1px solid #ddd', padding: '8px' }}>
                                                            {NumberFormat(txn.debit)}
                                                        </td>
                                                        <td style={{ color: '#28a745', fontWeight: 'bold', border: '1px solid #ddd', padding: '8px' }}>
                                                            {NumberFormat(txn.credit)}
                                                        </td>
                                                        <td style={{ color: txn.balance >= 0 ? '#28a745' : '#dc3545', fontWeight: 'bold', border: '1px solid #ddd', padding: '8px' }}>
                                                            {NumberFormat(Math.abs(txn.balance))} {txn.balance >= 0 ? 'CR' : 'DR'}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                            
                                            // Regular Transaction Row
                                            return (
                                                <tr key={`${groupIndex}-${txnIndex}`}>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{txn.displayDate}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{txn.formattedInvoice}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{txn.Particulars}</td>
                                                    <td style={{ color: '#dc3545', border: '1px solid #ddd', padding: '8px' }}>{NumberFormat(txn.Debit_Amt || 0)}</td>
                                                    <td style={{ color: '#28a745', border: '1px solid #ddd', padding: '8px' }}>{NumberFormat(txn.Credit_Amt || 0)}</td>
                                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{txn.Ledger_Desc}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </Box>
                        ))}
                        
                        {/* Grand Total Section */}
                        <Box 
                            sx={{ 
                                mt: 3,
                                border: '2px solid #333',
                                borderRadius: '4px',
                                backgroundColor: '#e8f4fd'
                            }}
                        >
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <tbody>
                                    <tr style={{ backgroundColor: '#333', color: 'white' }}>
                                        <td colSpan="3" style={{ textAlign: 'right', paddingRight: '20px', fontWeight: 'bold', fontSize: '1.1rem', padding: '8px' }}>
                                            GRAND TOTAL
                                        </td>
                                        <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white', padding: '8px' }}>
                                            {NumberFormat(grandTotals.debit)}
                                        </td>
                                        <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white', padding: '8px' }}>
                                            {NumberFormat(grandTotals.credit)}
                                        </td>
                                        <td style={{ fontWeight: 'bold', fontSize: '1.1rem', color: grandBalance >= 0 ? '#28a745' : '#dc3545', padding: '8px' }}>
                                            {NumberFormat(Math.abs(grandBalance))} {grandBalance >= 0 ? 'CR' : 'DR'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </Box>
                        
                        {/* Summary Cards */}
                        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Box 
                                sx={{ 
                                    flex: 1,
                                    minWidth: '200px',
                                    p: 2,
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Debit</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc3545' }}>
                                    {NumberFormat(grandTotals.debit)}
                                </div>
                            </Box>
                            <Box 
                                sx={{ 
                                    flex: 1,
                                    minWidth: '200px',
                                    p: 2,
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: '#fff'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>Total Credit</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                                    {NumberFormat(grandTotals.credit)}
                                </div>
                            </Box>
                            <Box 
                                sx={{ 
                                    flex: 1,
                                    minWidth: '200px',
                                    p: 2,
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    backgroundColor: '#f8f9fa'
                                }}
                            >
                                <div style={{ fontSize: '0.9rem', color: '#666' }}>Net Balance</div>
                                <div style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: 'bold', 
                                    color: grandBalance >= 0 ? '#28a745' : '#dc3545' 
                                }}>
                                    {NumberFormat(Math.abs(grandBalance))} {grandBalance >= 0 ? 'CR' : 'DR'}
                                </div>
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
                {/* {groups.length > 0 && (
                    <Button 
                        onClick={generatePDF} 
                        variant="contained"
                        startIcon={<PictureAsPdfIcon />}
                        disabled={loading}
                        sx={{ backgroundColor: '#d32f2f', '&:hover': { backgroundColor: '#b71c1c' } }}
                    >
                        Download PDF
                    </Button>
                )} */}
                <Button 
                    onClick={fetchTransactionDetails} 
                    variant="outlined"
                    startIcon={<SearchIcon />}
                    disabled={loading}
                >
                    Refresh
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Main OutstandingReport Component
const OutstandingReport = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const contentRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [allData, setAllData] = useState({ Data1: [], Debtors: [], Creditors: [] });
    const [viewMode, setViewMode] = useState("Debtors");
    const [sortConfig, setSortConfig] = useState({
        key: null,
        order: "asc",
    });
    const [decodedParams, setDecodedParams] = useState({
        Fromdate: dayjs().format("YYYY-MM-DD"),
        Todate: dayjs().format("YYYY-MM-DD"),
    });
    const [downloading, setDownloading] = useState(false);
    const [companyInfo, setCompanyInfo] = useState(null);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const [tempFromDate, setTempFromDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [tempToDate, setTempToDate] = useState(dayjs().format("YYYY-MM-DD"));
    const [companyId, setCompanyId] = useState('');

    // Transaction Dialog State
    const [transactionDialog, setTransactionDialog] = useState({
        open: false,
        accountId: null,
        accountName: '',
        fromDate: '',
        toDate: ''
    });

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    // Format helpers
    const formatINR = (value) => {
        if (!value || value === 0) return "-";
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getTotal = (key) => {
        return filteredRows.reduce((sum, row) => sum + Number(row[key] || 0), 0);
    };

    // Parse OB_Amount to extract numeric value and DR/CR
    const parseOBAmount = (obAmount) => {
        if (!obAmount) return { value: 0, type: '' };
        const str = String(obAmount).trim();
        const match = str.match(/^([\d.]+)\s*(DR|CR)?$/i);
        if (match) {
            return {
                value: parseFloat(match[1]) || 0,
                type: match[2] ? match[2].toUpperCase() : ''
            };
        }
        return { value: 0, type: '' };
    };

    // Transaction Dialog handlers
    const openTransactionDialog = (accountId, accountName) => {
        setTransactionDialog({
            open: true,
            accountId: accountId,
            accountName: accountName,
            fromDate: decodedParams.Fromdate,
            toDate: decodedParams.Todate
        });
    };

    const closeTransactionDialog = () => {
        setTransactionDialog({
            open: false,
            accountId: null,
            accountName: '',
            fromDate: '',
            toDate: ''
        });
    };

    // Filter rows based on view mode
    const filteredRows = useMemo(() => {
        let dataToShow = [];

        // Check if Data1 is an array or object
        const data1Array = Array.isArray(allData.Data1) ? allData.Data1 :
                          Object.values(allData.Data1 || {});

        if (viewMode === "Debtors") {
            // Get Debtors Acc_Id list - check if Debtors is array or object
            const debtorsArray = Array.isArray(allData.Debtors) ? allData.Debtors :
                                 Object.values(allData.Debtors || {});
            const debtorIds = new Set(debtorsArray.map(d => d.Acc_Id));
            // Filter Data1 where Acc_Id exists in Debtors
            dataToShow = data1Array.filter(row => debtorIds.has(row.Acc_Id));
        } else {
            // Get Creditors Acc_Id list - check if Creditors is array or object
            const creditorsArray = Array.isArray(allData.Creditors) ? allData.Creditors :
                                   Object.values(allData.Creditors || {});
            const creditorIds = new Set(creditorsArray.map(c => c.Acc_Id));
            // Filter Data1 where Acc_Id exists in Creditors
            dataToShow = data1Array.filter(row => creditorIds.has(row.Acc_Id));
        }

        // Apply sorting
        if (sortConfig.key) {
            dataToShow = [...dataToShow].sort((a, b) => {
                let aVal = a[sortConfig.key];
                let bVal = b[sortConfig.key];

                // Handle OB_Amount specially - extract numeric value
                if (sortConfig.key === 'OB_Amount') {
                    aVal = parseOBAmount(aVal).value;
                    bVal = parseOBAmount(bVal).value;
                }

                if (typeof aVal === "number" && typeof bVal === "number") {
                    return sortConfig.order === "asc" ? aVal - bVal : bVal - aVal;
                }

                const aStr = String(aVal || '').toLowerCase();
                const bStr = String(bVal || '').toLowerCase();
                return sortConfig.order === "asc"
                    ? aStr.localeCompare(bStr)
                    : bStr.localeCompare(aStr);
            });
        }

        return dataToShow;
    }, [allData, viewMode, sortConfig]);

    // Paginated slice of filteredRows - only this gets rendered in the table
    const paginatedRows = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredRows.slice(start, start + rowsPerPage);
    }, [filteredRows, page, rowsPerPage]);

    // Reset to first page whenever the underlying data set changes
    useEffect(() => {
        setPage(0);
    }, [viewMode, sortConfig]);

    // Fetch data using direct API call
    const fetchAllAccounts = async (fromDate, toDate) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetchLink({
                address: `reports/externalAPI/debtorsCreditors?fromDate=${fromDate}&toDate=${toDate}`,
                method: "GET",
            });

            if (response.success) {
                const data = response.data || { Data1: [], Debtors: [], Creditors: [] };

                // Handle both array and object formats
                const normalizedData = {
                    Data1: Array.isArray(data.Data1) ? data.Data1 : Object.values(data.Data1 || {}),
                    Debtors: Array.isArray(data.Debtors) ? data.Debtors : Object.values(data.Debtors || {}),
                    Creditors: Array.isArray(data.Creditors) ? data.Creditors : Object.values(data.Creditors || {})
                };

                setAllData(normalizedData);
                return normalizedData;
            } else {
                throw new Error(response.message || 'Failed to fetch data');
            }
        } catch (err) {
            console.error('Error fetching report:', err);
            setError(err.message || 'Failed to load report data');
            toast.error('Failed to fetch report data');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Fetch data with date range
    const fetchDataWithDateRange = async (fromDate, toDate) => {
        try {
            setDecodedParams({ Fromdate: fromDate, Todate: toDate });
            await fetchAllAccounts(fromDate, toDate);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    // Handle date change
    const handleDateChange = async () => {
        if (tempFromDate && tempToDate) {
            if (tempFromDate > tempToDate) {
                toast.error('From date cannot be after To date');
                return;
            }
            setDatePickerOpen(false);
            
            // Update URL with new dates
            const params = new URLSearchParams(location.search);
            params.set('fromDate', tempFromDate);
            params.set('toDate', tempToDate);
            params.set('Company_id', companyId);
            navigate(`?${params.toString()}`);
            
            await fetchDataWithDateRange(tempFromDate, tempToDate);
        }
    };

    // Fetch data on component mount and URL changes
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const fromDate = params.get('fromDate') || params.get('Fromdate') || dayjs().format("YYYY-MM-DD");
        const toDate = params.get('toDate') || params.get('Todate') || dayjs().format("YYYY-MM-DD");
        const compId = params.get('Company_id') || '';
        
        setCompanyId(compId);
        setTempFromDate(fromDate);
        setTempToDate(toDate);
        
        const fetchData = async () => {
            try {
                setDecodedParams({ Fromdate: fromDate, Todate: toDate });

                // Fetch company info if available
                if (compId) {
                    try {
                        const response = await fetch(`https://pukalfoods.erpsmt.in/api/masters/company/url?Company_id=${compId}`);
                        const data = await response.json();
                        if (data.success && data.data) {
                            setCompanyInfo(data.data);
                        }
                    } catch (err) {
                        console.error('Error fetching company info:', err);
                    }
                }

                // Fetch the report data
                await fetchAllAccounts(fromDate, toDate);

            } catch (err) {
                console.error('Error in fetchData:', err);
            }
        };

        fetchData();
    }, [location.search]);

    // Generate PDF - only called when user clicks download button
    const generatePDF = async () => {
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const wrapperDiv = document.createElement('div');
        wrapperDiv.style.backgroundColor = 'white';
        wrapperDiv.style.padding = '20px';
        wrapperDiv.style.width = '1200px';
        wrapperDiv.style.fontFamily = 'Arial, sans-serif';
        wrapperDiv.style.color = 'black';

        // Header
        const headerDiv = document.createElement('div');
        headerDiv.style.textAlign = 'center';
        headerDiv.style.marginBottom = '20px';
        headerDiv.style.padding = '10px';
        headerDiv.style.borderBottom = '2px solid #1976d2';
        headerDiv.innerHTML = `
            <h1 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #1976d2;">
                ${viewMode} Outstanding Report
            </h1>
            <p style="margin: 5px 0; font-size: 12px;">
                Period: ${decodedParams.Fromdate} to ${decodedParams.Todate}
            </p>
            <p style="margin: 5px 0; font-size: 12px;">
                Total Records: ${filteredRows.length}
            </p>
        `;
        wrapperDiv.appendChild(headerDiv);

        // Table
        const table = document.createElement('table');
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.fontSize = '10px';
        table.style.fontFamily = 'Arial, sans-serif';

        // Column widths
        const colgroup = document.createElement('colgroup');
        const colWidths = ['5%', '15%', '18%', '12%', '12%', '12%', '14%', '12%'];
        colWidths.forEach((w) => {
            const col = document.createElement('col');
            col.style.width = w;
            colgroup.appendChild(col);
        });
        table.appendChild(colgroup);

        // Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.style.backgroundColor = '#1976d2';

        const headers = ['#', 'Group', 'Retailer', 'Opening Balance', 'Debit', 'Credit', 'Balance', 'Actions'];
        headers.forEach((header) => {
            const th = document.createElement('th');
            th.textContent = header;
            th.style.padding = '6px 4px';
            th.style.textAlign = 'left';
            th.style.fontWeight = 'bold';
            th.style.border = '1px solid #ddd';
            th.style.color = '#fff';
            th.style.backgroundColor = '#1976d2';
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Body
        const tbody = document.createElement('tbody');
        filteredRows.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid #ddd';

            const obInfo = parseOBAmount(row.OB_Amount);
            const isDR = obInfo.type === 'DR';
            const isCR = obInfo.type === 'CR';
            const balanceColor = isDR ? '#d32f2f' : isCR ? '#2e7d32' : 'inherit';

            const fields = [
                (idx + 1).toString(),
                row.Group_Name || '-',
                row.Retailer_Name || '-',
                formatINR(obInfo.value),
                formatINR(row.Debit_Amt || 0),
                formatINR(row.Credit_Amt || 0),
                `${formatINR(row.Bal_Amount || 0)} ${isDR ? 'DR' : isCR ? 'CR' : ''}`,
                'View'
            ];

            fields.forEach((field, fieldIdx) => {
                const td = document.createElement('td');
                td.textContent = field;
                td.style.padding = '6px';
                td.style.border = '1px solid #ddd';
                if (fieldIdx === 6) {
                    td.style.color = balanceColor;
                    td.style.fontWeight = 'bold';
                }
                if (field === 'View') {
                    td.style.textAlign = 'center';
                }
                tr.appendChild(td);
            });

            tbody.appendChild(tr);
        });

        // Total row
        const totalRow = document.createElement('tr');
        totalRow.style.backgroundColor = '#f5f5f5';
        totalRow.style.fontWeight = 'bold';

        const totalLabel = document.createElement('td');
        totalLabel.textContent = 'TOTAL';
        totalLabel.colSpan = 3;
        totalLabel.style.padding = '6px';
        totalLabel.style.border = '1px solid #ddd';
        totalRow.appendChild(totalLabel);

        const totals = ['OB_Amount', 'Debit_Amt', 'Credit_Amt', 'Bal_Amount'];
        totals.forEach((key) => {
            const td = document.createElement('td');
            td.textContent = formatINR(getTotal(key));
            td.style.padding = '6px';
            td.style.border = '1px solid #ddd';
            totalRow.appendChild(td);
        });

        const emptyTd = document.createElement('td');
        emptyTd.style.border = '1px solid #ddd';
        totalRow.appendChild(emptyTd);

        tbody.appendChild(totalRow);
        table.appendChild(tbody);
        wrapperDiv.appendChild(table);

        document.body.appendChild(wrapperDiv);

        try {
            const canvas = await html2canvas(wrapperDiv, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 280;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            document.body.removeChild(wrapperDiv);

            pdf.save(`Outstanding_${viewMode}_${decodedParams.Fromdate}_to_${decodedParams.Todate}.pdf`);
            toast.success('PDF downloaded successfully!');
        } catch (err) {
            document.body.removeChild(wrapperDiv);
            throw err;
        }
    };

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key: key,
            order: prev.key === key && prev.order === "asc" ? "desc" : "asc",
        }));
    };

    const downloadAsPDF = async () => {
        if (!contentRef.current) {
            toast.error('Content reference not found');
            return;
        }
        setDownloading(true);
        try {
            await generatePDF();
        } catch (err) {
            console.error('Error generating PDF:', err);
            toast.error('Failed to generate PDF');
        } finally {
            setDownloading(false);
        }
    };

    // Excel Export - always exports the FULL filteredRows dataset, not just the current page
    const exportToExcel = () => {
        try {
            const exportData = filteredRows.map((row, idx) => {
                const obInfo = parseOBAmount(row.OB_Amount);
                return {
                    '#': idx + 1,
                    'Group': row.Group_Name || '-',
                    'Retailer': row.Retailer_Name || '-',
                    'Opening Balance': obInfo.value,
                    'Debit': row.Debit_Amt || 0,
                    'Credit': row.Credit_Amt || 0,
                    'Balance': row.Bal_Amount || 0,
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, `${viewMode} Report`);
            XLSX.writeFile(workbook, `Outstanding_${viewMode}_${dayjs().format("DDMMYYYY")}.xlsx`);
            toast.success('Excel downloaded successfully!');
        } catch (err) {
            console.error('Error exporting Excel:', err);
            toast.error('Failed to export Excel');
        }
    };

    // Get count for display
    const getCount = (type) => {
        const data = type === 'Debtors' ? allData.Debtors : allData.Creditors;
        return Array.isArray(data) ? data.length : Object.keys(data || {}).length;
    };

    // Pagination handlers
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) {
        return (
            <Container sx={{ textAlign: 'center', mt: 10 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading Outstanding Report...
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Fetching data for {viewMode}...
                </Typography>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4, maxWidth: 600 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="contained" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </Container>
        );
    }

    // Show message if no data
    if (filteredRows.length === 0 && !loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 2 }}>
                <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        No {viewMode} found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        No records available for the selected period.
                    </Typography>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 2 }}>
            <Paper elevation={4} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        Outstanding Report
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <ToggleButtonGroup
                            exclusive
                            size="small"
                            value={viewMode}
                            onChange={(_, val) => val && setViewMode(val)}
                            sx={{ height: 32 }}
                        >
                            <ToggleButton value="Debtors" sx={{ textTransform: 'none' }}>
                                Debtors ({getCount('Debtors')})
                            </ToggleButton>
                            <ToggleButton value="Creditors" sx={{ textTransform: 'none' }}>
                                Creditors ({getCount('Creditors')})
                            </ToggleButton>
                        </ToggleButtonGroup>

                        <Tooltip title="Change Date Range">
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<DateRangeIcon />}
                                onClick={() => setDatePickerOpen(true)}
                                sx={{ textTransform: 'none' }}
                            >
                                {decodedParams.Fromdate} to {decodedParams.Todate}
                            </Button>
                        </Tooltip>

                        {/* <Tooltip title="Download PDF">
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<DownloadIcon />}
                                endIcon={<PictureAsPdfIcon />}
                                onClick={downloadAsPDF}
                                disabled={filteredRows.length === 0 || downloading}
                                sx={{ textTransform: 'none' }}
                            >
                                {downloading ? 'Downloading...' : 'PDF'}
                            </Button>
                        </Tooltip> */}

                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={exportToExcel}
                            disabled={filteredRows.length === 0}
                            sx={{ textTransform: 'none' }}
                        >
                            Excel
                        </Button>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2, gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                            label={`From: ${decodedParams.Fromdate}`}
                            variant="outlined"
                            size="small"
                        />
                        <Chip
                            label={`To: ${decodedParams.Todate}`}
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                            label={`Total Records: ${filteredRows.length}`}
                            color="info"
                            variant="filled"
                            size="small"
                        />
                        <Chip
                            label={`Total Balance: ${formatINR(getTotal('Bal_Amount'))}`}
                            color="secondary"
                            variant="filled"
                            size="small"
                        />
                    </Box>
                </Box>

                <div ref={contentRef} style={{ display: 'none' }} />

                <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                    <Table
                        size="small"
                        sx={{
                            tableLayout: 'fixed',
                            width: '100%',
                            '& .MuiTableCell-root': {
                                fontSize: isMobile ? '0.6rem' : '0.875rem',
                                padding: isMobile ? '4px 2px' : '6px 16px',
                                whiteSpace: isMobile ? 'normal' : 'nowrap',
                                wordBreak: 'break-word',
                            },
                        }}
                    >
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                <TableCell sx={{ color: '#fff', fontWeight: 700, width: '10%' }}>#</TableCell>
                                <TableCell
                                    sx={{ color: '#fff', fontWeight: 700, width: '40%', cursor: 'pointer' }}
                                    onClick={() => handleSort('Retailer_Name')}
                                >
                                    Retailer {sortConfig.key === 'Retailer_Name' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                                </TableCell>
                                <TableCell
                                    sx={{ color: '#fff', fontWeight: 700, width: '10%', cursor: 'pointer' }}
                                    onClick={() => handleSort('OB_Amount')}
                                >
                                    Opening {sortConfig.key === 'OB_Amount' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                                </TableCell>
                                <TableCell
                                    sx={{ color: '#fff', fontWeight: 700, width: '10%', cursor: 'pointer' }}
                                    onClick={() => handleSort('Debit_Amt')}
                                >
                                    Debit {sortConfig.key === 'Debit_Amt' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                                </TableCell>
                                <TableCell
                                    sx={{ color: '#fff', fontWeight: 700, width: '10%', cursor: 'pointer' }}
                                    onClick={() => handleSort('Credit_Amt')}
                                >
                                    Credit {sortConfig.key === 'Credit_Amt' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                                </TableCell>
                                <TableCell
                                    sx={{ color: '#fff', fontWeight: 700, width: '10%', cursor: 'pointer' }}
                                    onClick={() => handleSort('Bal_Amount')}
                                >
                                    Balance {sortConfig.key === 'Bal_Amount' && (sortConfig.order === 'asc' ? '↑' : '↓')}
                                </TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700, width: '10%' }}>
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedRows.map((row, index) => {
                                const obInfo = parseOBAmount(row.OB_Amount);
                                const isDR = obInfo.type === 'DR';
                                const isCR = obInfo.type === 'CR';
                                const balanceColor = isDR ? '#d32f2f' : isCR ? '#2e7d32' : 'inherit';

                                return (
                                    <TableRow key={row.Acc_Id || index} hover>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{row.Retailer_Name || '-'}</TableCell>
                                        <TableCell>{formatINR(obInfo.value)}</TableCell>
                                        <TableCell>{formatINR(row.Debit_Amt || 0)}</TableCell>
                                        <TableCell>{formatINR(row.Credit_Amt || 0)}</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: balanceColor }}>
                                            {formatINR(row.Bal_Amount || 0)}
                                            {isDR ? ' DR' : isCR ? ' CR' : ''}
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="View Transaction Details">
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<VisibilityIcon />}
                                                    onClick={() => openTransactionDialog(row.Acc_Id, row.Retailer_Name)}
                                                    sx={{ minWidth: 'auto', padding: '2px 8px' }}
                                                >
                                                    View
                                                </Button>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {/* Total Row - always reflects the FULL filtered dataset, not just the current page */}
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell colSpan={2} align="right"><strong>TOTAL</strong></TableCell>
                                <TableCell><strong>{formatINR(getTotal('OB_Amount'))}</strong></TableCell>
                                <TableCell><strong>{formatINR(getTotal('Debit_Amt'))}</strong></TableCell>
                                <TableCell><strong>{formatINR(getTotal('Credit_Amt'))}</strong></TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                    <strong>{formatINR(getTotal('Bal_Amount'))}</strong>
                                </TableCell>
                                <TableCell></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component="div"
                    count={filteredRows.length}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </Paper>

            {/* Date Range Picker Dialog */}
            <Dialog open={datePickerOpen} onClose={() => setDatePickerOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    <Typography variant="h6" fontWeight={600}>
                        Change Date Range
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="From Date"
                                type="date"
                                value={tempFromDate}
                                onChange={(e) => setTempFromDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="To Date"
                                type="date"
                                value={tempToDate}
                                onChange={(e) => setTempToDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setDatePickerOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDateChange} 
                        variant="contained" 
                        color="primary"
                        disabled={!tempFromDate || !tempToDate || tempFromDate > tempToDate}
                    >
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Account Transactions Dialog */}
            <AccountTransactionsDialog
                open={transactionDialog.open}
                onClose={closeTransactionDialog}
                accountId={transactionDialog.accountId}
                accountName={transactionDialog.accountName}
                fromDate={transactionDialog.fromDate}
                toDate={transactionDialog.toDate}
            />
        </Container>
    );
};

export default OutstandingReport;