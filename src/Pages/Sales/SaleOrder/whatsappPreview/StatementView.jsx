import React, { useState, useEffect, useRef } from 'react';
import {
  Container, Paper, Typography, Box, CircularProgress,
  Alert, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Button, Tooltip,
  useMediaQuery, useTheme
} from '@mui/material';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CACHE = new Map();


async function renderElementToPdf(element, { filename, margin = 0.5, orientation = 'landscape', quality = 0.98 }) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    letterRendering: true,
    backgroundColor: '#ffffff',
  });

  const imgData = canvas.toDataURL('image/jpeg', quality);
  const pdf = new jsPDF({ unit: 'in', format: 'a4', orientation });

  const pageWidth    = pdf.internal.pageSize.getWidth();
  const pageHeight   = pdf.internal.pageSize.getHeight();
  const contentWidth  = pageWidth - margin * 2;
  const contentHeight = pageHeight - margin * 2;

  const imgWidth  = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let pageIndex  = 0;

  pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight);
  heightLeft -= contentHeight;

  while (heightLeft > 0) {
    pageIndex += 1;
    const position = margin - pageIndex * contentHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
    heightLeft -= contentHeight;
  }

  pdf.save(filename);
}

const StatementView = () => {
  const location = useLocation();
  const printRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statementData, setStatementData] = useState([]);
  const [decodedParams, setDecodedParams] = useState({});
  const [downloading, setDownloading] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [accountName, setAccountName] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


  const isPreview = new URLSearchParams(location.search).get('preview') === '1';

  // WhatsApp browser detection
  useEffect(() => {
    if (isPreview) return;
    const ua = navigator.userAgent || '';
    const isWhatsApp = /WhatsApp/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);

    if (isWhatsApp) {
      const currentUrl = window.location.href;
      if (isAndroid) {
        window.location.href = `intent://${currentUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;end`;
      } else if (isIOS) {
        document.body.innerHTML = `
          <div style="text-align:center; padding:40px; font-family:Arial;">
            <h2>Open in Browser</h2>
              <p>Tap the 3 dots (⋯) at the top right</p>
              <p>Then tap <strong>"Open in Safari"</strong></p>
              <br/>
              <a href="${currentUrl}" style="background:#1976d2; color:#fff; padding:14px 28px; border-radius:8px; text-decoration:none; font-size:16px;">
                Open Statement
              </a>
            </div>
          `;
      }
    }
  }, [isPreview]);

  // Fetch statement data
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const encodedData = queryParams.get('data');

    if (!encodedData) {
      setError('No data parameter provided in the URL.');
      setLoading(false);
      return;
    }

  const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);

    const decoded = atob(encodedData);
    const params = new URLSearchParams(decoded);

    const accId = params.get('Acc_Id') || '';
    const fromDate = params.get('fromDate') || params.get('Fromdate') || params.get('FromDate') || '';
    const toDate = params.get('toDate') || params.get('Todate') || params.get('ToDate') || '';
    const companyIdFromParams = params.get('Company_id') || '';

    setDecodedParams({ Acc_Id: accId, Fromdate: fromDate, Todate: toDate });
    setCompanyId(companyIdFromParams);

    if (!accId) {
      throw new Error('Missing Acc_Id in decoded parameters.');
    }

    let compInfo = CACHE.get(`ci_${companyIdFromParams}`);
    if (!compInfo && companyIdFromParams) {
      const r = await fetch(`https://pukalfoods.erpsmt.in/api/masters/company/url?Company_id=${companyIdFromParams}`);
      const d = await r.json();
      if (d.success && d.data) {
        compInfo = d.data;
        CACHE.set(`ci_${companyIdFromParams}`, compInfo);
        setCompanyInfo(compInfo);
      }
    }

    const base = compInfo?.Back_End_API ? compInfo.Back_End_API.replace(/\/+$/, '') : '';

    const isOutstanding = decoded.includes('fromDate') && !decoded.includes('Fromdate');

    let apiUrl;
    if (isOutstanding) {
      apiUrl = `${base}/payment/transactions?Acc_Id=${accId}&fromDate=${fromDate}&toDate=${toDate}`;
    } else {
      apiUrl = `${base}/journal/accountPendingReference?Acc_Id=${accId}&Fromdate=${fromDate}&Todate=${toDate}`;
    }

    const accountMasterUrl = `${base}/masters/accountMaster`;

    const [statementResp, accountResp] = await Promise.all([
      fetch(apiUrl),
      fetch(accountMasterUrl),
    ]);

    const result = await statementResp.json();

    const data = result?.data || result || [];
    const dataArray = Array.isArray(data) ? data : [data];

    const transformedData = dataArray.map(item => ({
      invoice_no: item.invoice_no || "-",
      Ledger_Date: formatDateForDisplay(item.Ledger_Date),
      Particulars: item.Particulars || "-",
      Debit_Amt: item.Debit_Amt || 0,
      Credit_Amt: item.Credit_Amt || 0,
      raw_Debit_Amt: item.Debit_Amt || 0,
      raw_Credit_Amt: item.Credit_Amt || 0
    }));

    setStatementData(transformedData);

    // Resolve account name by matching Acc_Id
    try {
      const accountResult = await accountResp.json();
      const accountList = accountResult?.data || accountResult || [];
      const accountArray = Array.isArray(accountList) ? accountList : [accountList];

      const matchedAccount = accountArray.find(
        (a) => String(a.Acc_Id ?? a.Account_Id ?? a.Id) === String(accId)
      );

      const resolvedName =
        matchedAccount?.Account_Name ||
        matchedAccount?.Account_name ||
        matchedAccount?.Ledger_Name ||
        matchedAccount?.Retailer_Name ||
        matchedAccount?.Party_Name ||
        '';

      setAccountName(resolvedName);
    } catch (accErr) {
      console.error('Error fetching account master:', accErr);
      // Non-fatal — page still works without the account name
    }

  } catch (err) {
    console.error('Error fetching statement:', err);
    setError(err.message || 'Failed to load statement data');
    toast.error('Failed to fetch statement data');
  } finally {
    setLoading(false);
  }
};


    fetchData();
  }, [location.search]);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    const dateOnly = dateString.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateOnly;
  };

  const formatAmount = (amount) => {
    const num = Number(amount) || 0;
    if (num === 0) return "-";
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const calculateTotals = () => {
    const totalDebit = statementData.reduce((sum, row) => sum + (row.raw_Debit_Amt || 0), 0);
    const totalCredit = statementData.reduce((sum, row) => sum + (row.raw_Credit_Amt || 0), 0);
    const balance = totalDebit - totalCredit;
    return { totalDebit, totalCredit, balance };
  };

//   const downloadPDF = async () => {
//     if (!printRef.current || downloading) return;
//     setDownloading(true);
//     try {
//       await renderElementToPdf(printRef.current, {
//         filename: `TransactionStatement_${decodedParams.Fromdate}_to_${decodedParams.Todate}.pdf`,
//         margin: 0.5,
//         orientation: 'landscape',
//         quality: 0.98,
//       });
//       toast.success('PDF downloaded successfully!');
//     } catch (err) {
//       console.error('PDF Error:', err);
//       toast.error('Failed to generate PDF. Please try again.');
//     } finally {
//       setDownloading(false);
//     }
//   };

  
//   useEffect(() => {
//     if (isPreview) return;
//     if (!loading && !error && statementData.length > 0 && !pdfGenerated && printRef.current) {
//       setPdfGenerated(true);
//       const timer = setTimeout(() => {
//         downloadPDF();
//       }, 1500);
//       return () => clearTimeout(timer);
//     }
//   }, [loading, error, statementData, pdfGenerated, isPreview]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{
          width: 40, height: 40, border: '4px solid #eee',
          borderTop: '4px solid #1976d2', borderRadius: '50%',
          animation: 'spin 0.8s linear infinite', margin: '0 auto'
        }} />
        <p style={{ marginTop: 16, color: '#555' }}>Loading Transaction Statement...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
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

  const { totalDebit, totalCredit, balance } = calculateTotals();
  const balanceType = balance > 0 ? 'DR' : balance < 0 ? 'CR' : '';

  return (
    <Container maxWidth="lg" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 2 }, mb: 2 }}>

        {/* ── Header ── */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1.5, sm: 0 },
          mb: 2
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
            Transaction Statement
          </Typography>
          {accountName && (
  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
    {accountName}
  </Typography>
)}
          
{/* 
          {!isPreview && (
            <Tooltip title="Download PDF">
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                endIcon={<PictureAsPdfIcon />}
                onClick={downloadPDF}
                disabled={statementData.length === 0 || downloading}
                sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
              >
                {downloading ? 'Downloading...' : 'Download PDF'}
              </Button>
            </Tooltip>
          )} */}
        </Box>

        {/* ── Chips ── */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip label={`From: ${decodedParams.Fromdate}`} variant="outlined" size="small" />
            <Chip label={`To: ${decodedParams.Todate}`} variant="outlined" size="small" />
          </Box>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Total Records: {statementData.length}
        </Typography>

      
        {/* Off-screen (not display:none) so html2canvas can actually lay out
            and capture this content — display:none elements have no render
            box at all and would produce a blank canvas/PDF. */}
        <div style={{ position: 'fixed', top: '-10000px', left: '-10000px', zIndex: -1 }}>
          <div ref={printRef} style={{
            padding: '20px',
            backgroundColor: '#fff',
            fontSize: 11,
            lineHeight: '1.4',
            fontFamily: 'Arial, sans-serif',
            width: '1100px',
            boxSizing: 'border-box',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: '0 0 5px 0', fontSize: 16, fontWeight: 'bold' }}>
                {companyInfo?.Company_Name || 'Transaction'} - Statement
              </h2>
              <p style={{ margin: '5px 0', fontSize: 12 }}>
                Period: {decodedParams.Fromdate} to {decodedParams.Todate}
              </p>
            </div>

            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: 20,
              border: '1px solid #000',
              fontSize: 10,
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #000' }}>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold', width: '5%' }}>#</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold', width: '13%', whiteSpace: 'nowrap' }}>Date</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold', width: '15%' }}>Invoice No</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold', width: '40%' }}>Particulars</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold', width: '13%', whiteSpace: 'nowrap' }}>Debit (Dr)</th>
                  <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold', width: '13%', whiteSpace: 'nowrap' }}>Credit (Cr)</th>
                </tr>
              </thead>
              <tbody>
                {statementData.map((row, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ border: '1px solid #ddd', padding: '6px' }}>{index + 1}</td>
                    <td style={{ border: '1px solid #ddd', padding: '6px', whiteSpace: 'nowrap' }}>{row.Ledger_Date}</td>
                    <td style={{ border: '1px solid #ddd', padding: '6px', wordBreak: 'break-word' }}>{row.invoice_no}</td>
                    <td style={{ border: '1px solid #ddd', padding: '6px', wordBreak: 'break-word' }}>{row.Particulars}</td>
                    <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {formatAmount(row.raw_Debit_Amt)}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {formatAmount(row.raw_Credit_Amt)}
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#f9f9f9', borderTop: '2px solid #000' }}>
                  <td colSpan={4} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>TOTAL</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatAmount(totalDebit)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatAmount(totalCredit)}</td>
                </tr>
                <tr style={{ backgroundColor: '#e8f4f8' }}>
                  <td colSpan={4} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>NET BALANCE ({balanceType})</td>
                  <td colSpan={2} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatAmount(Math.abs(balance))}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: '#888' }}>
              This is a Computer Generated Statement
            </div>
          </div>
        </div>

        {/* ── Visible Web Table — fits screen width, no horizontal scroll ── */}
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'hidden' }}>
          <Table
            size="small"
            sx={{
              tableLayout: 'fixed',
              width: '100%',
              '& .MuiTableCell-root': {
                fontSize: isMobile ? '0.62rem' : '0.875rem',
                padding: isMobile ? '4px 3px' : '6px 16px',
                whiteSpace: isMobile ? 'normal' : 'nowrap',
                wordBreak: 'break-word',
              },
            }}
          >
            <TableHead>
              <TableRow sx={{ backgroundColor: '#1976d2' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 700, width: isMobile ? '12%' : '10%' }}>Date</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700, width: isMobile ? '18%' : '13%' }}>Invoice No</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 700, width: isMobile ? '13%' : '13%' }}>Particulars</TableCell>
                <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, width: isMobile ? '13%' : '18%' }}>Debit (Dr)</TableCell>
                <TableCell align="right" sx={{ color: '#fff', fontWeight: 700, width: isMobile ? '13%' : '19%' }}>Credit (Cr)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {statementData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.Ledger_Date}</TableCell>
                  <TableCell>{row.invoice_no}</TableCell>
                  <TableCell>{row.Particulars}</TableCell>
                  <TableCell align="right">{formatAmount(row.raw_Debit_Amt)}</TableCell>
                  <TableCell align="right">{formatAmount(row.raw_Credit_Amt)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                <TableCell colSpan={2} align="right" sx={{ fontWeight: 700 }}>TOTAL:</TableCell>
                <TableCell />
                <TableCell align="right" sx={{ fontWeight: 700 }}>{formatAmount(totalDebit)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>{formatAmount(totalCredit)}</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: '#e8f4f8' }}>
                <TableCell colSpan={3} align="right" sx={{ fontWeight: 700 }}>NET BALANCE ({balanceType}):</TableCell>
                <TableCell colSpan={2} align="right" sx={{ fontWeight: 700 }}>{formatAmount(Math.abs(balance))}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

      </Paper>
    </Container>
  );
};

export default StatementView;