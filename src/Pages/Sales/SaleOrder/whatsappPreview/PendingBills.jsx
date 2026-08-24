import React, { useState, useEffect, useRef } from 'react';
import {
    Container, Paper, Typography, Box, CircularProgress,
    Alert, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Chip, Button, Tooltip
} from '@mui/material';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useMediaQuery, useTheme } from '@mui/material';

const CACHE = new Map();

const Pendingbills = ({
    row = null,
    fromDate: fromDateProp,
    toDate: toDateProp,
    companyInfo: companyInfoProp = null,
    onReady,   // called once data has loaded and the DOM is ready to screenshot
    onError,   // called if data fetch fails (props mode only)
}) => {
    const location = useLocation();
    const contentRef = useRef(null);
    const isPropsMode = Boolean(row);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statementData, setStatementData] = useState([]);
    const [decodedParams, setDecodedParams] = useState({});
    const [downloading, setDownloading] = useState(false);
    const [autoDownloadTriggered, setAutoDownloadTriggered] = useState(false);
    const [companyInfo, setCompanyInfo] = useState(companyInfoProp);
    const [accountName, setAccountName] = useState('');

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // preview=1 lives in the OUTER query string (alongside `data`, not inside
    // the base64-encoded blob) — set by the WhatsApp table's Preview popup
    // when it embeds this page in an iframe. Only relevant in URL mode.
    const isPreview = !isPropsMode && new URLSearchParams(location.search).get('preview') === '1';

    const calculatePendingDays = (eventDate) => {
        if (!eventDate) return 0;
        const eventDateObj = new Date(eventDate);
        const currentDate = new Date();
        eventDateObj.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        const diffTime = currentDate - eventDateObj;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const formatDateForPDF = (dateString) => {
        if (!dateString) return "-";
        const dateOnly = dateString.split('T')[0];
        const parts = dateOnly.split('-');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateOnly;
    };

    const transformData = (data) => {
        if (!Array.isArray(data)) return [];
        return data.map(item => {
            const voucherNumber = item.voucherNumber || item.VoucherNumber || item.Voucher_No || item.voucher_no || item.invoice_no || '-';
            const dateValue = item.eventDate || item.Ledger_Date || item.Date || item.TransDate || item.TransactionDate;
            const source = item.dataSource || item.Source || item.Source_Name || item.sourceName || item.Particulars || '-';
            const total = item.totalValue || item.TotalValue || item.Total || item.total || item.Debit_Amt || 0;
            const pending = item.BalanceAmount || item.balanceAmount || item.Pending || item.pending || item.Credit_Amt || 0;

            return {
                voucherNumber: voucherNumber,
                date: dateValue,
                formattedDate: formatDateForPDF(dateValue),
                source: source,
                pendingDays: calculatePendingDays(dateValue),
                pending: Number(pending) || 0,
                accountSide: item.accountSide || ""
            };
        });
    };

    const formatAmount = (amount) => {
        const num = Number(amount) || 0;
        if (num === 0) return "-";
        return `₹${num.toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}`;
    };

    // ---- Props-mode data loading: uses the row/dates/companyInfo handed
    // to us directly from the WhatsApp table (Whatsapp.jsx's hidden capture)
    // instead of decoding a URL. This is what makes the off-screen capture
    // show the correct customer's data instead of an empty/error state.
    const resolveApiBase = async () => {
        let compInfo = Array.isArray(companyInfoProp) ? companyInfoProp[0] : companyInfoProp;
        let base = compInfo?.Back_End_API ? compInfo.Back_End_API.replace(/\/+$/, '') : '';
        if (base) {
            setCompanyInfo(compInfo);
            return base;
        }

        const storage = JSON.parse(localStorage.getItem('user') || '{}');
        const companyIdLocal = compInfo?.Company_id || storage?.Company_id;
        if (!companyIdLocal) return '';

        const cacheKey = `ci_${companyIdLocal}`;
        let urlInfo = CACHE.get(cacheKey);
        if (!urlInfo) {
            const r = await fetch(`https://pukalfoods.erpsmt.in/api/masters/company/url?Company_id=${companyIdLocal}`);
            const d = await r.json();
            if (d.success && d.data) {
                urlInfo = d.data;
                CACHE.set(cacheKey, urlInfo);
            }
        }
        base = urlInfo?.Back_End_API ? urlInfo.Back_End_API.replace(/\/+$/, '') : '';
        setCompanyInfo(urlInfo);
        return base;
    };

    const fetchDataFromProps = async () => {
        try {
            setLoading(true);
            setError(null);

            const accId = row?.Acc_Id;
            const fromDate = fromDateProp || '';
            const toDate = toDateProp || '';
            setDecodedParams({ Acc_Id: accId, Fromdate: fromDate, Todate: toDate });

            if (!accId) throw new Error('Missing Acc_Id on the selected row.');

            const base = await resolveApiBase();
            if (!base) throw new Error('Could not determine API base URL');

            const pendingRefUrl = `${base}/journal/accountPendingReference?Acc_Id=${accId}&Fromdate=${fromDate}&Todate=${toDate}`;
            const resp = await fetch(pendingRefUrl);
            const result = await resp.json();
            const data = result?.data || result || [];
            setStatementData(Array.isArray(data) ? data : [data]);

            setAccountName(row.retailerNameGet || row.Retailer_Name || row.Party_Name || '');
        } catch (err) {
            console.error('Error fetching statement (props mode):', err);
            setError(err.message || 'Failed to load statement data');
            onError?.(err);
        } finally {
            setLoading(false);
        }
    };

    // ---- Existing URL-mode data loading, used by the standalone
    // print_app/pendingbills route (e.g. the Preview iframe) — unchanged.
    const fetchDataFromUrl = async () => {
        const query = new URLSearchParams(location.search);
        const encodedData = query.get('data');

        if (!encodedData) {
            setError('No data parameter provided in the URL.');
            setLoading(false);
            return;
        }

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

            if (!base) {
                throw new Error('Could not determine API base URL');
            }

            const pendingRefUrl = `${base}/journal/accountPendingReference?Acc_Id=${accId}&Fromdate=${fromDate}&Todate=${toDate}`;
            const accountMasterUrl = `${base}/masters/accountMaster`;

            const [pendingResp, accountResp] = await Promise.all([
                fetch(pendingRefUrl),
                fetch(accountMasterUrl),
            ]);

            const result = await pendingResp.json();
            const data = result?.data || result || [];
            setStatementData(Array.isArray(data) ? data : [data]);

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
            }

        } catch (err) {
            console.error('Error fetching statement:', err);
            setError(err.message || 'Failed to load statement data');
            toast.error('Failed to fetch statement data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isPropsMode) {
            fetchDataFromProps();
        } else {
            fetchDataFromUrl();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPropsMode, row, fromDateProp, toDateProp, location.search]);

    // Signal readiness to the caller once loading finishes successfully —
    // this is what Whatsapp.jsx's buildPendingBillsPdfBlob awaits before
    // screenshotting, instead of guessing a fixed delay.
    useEffect(() => {
        if (isPropsMode && !loading && !error) {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    onReady?.();
                });
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPropsMode, loading, error]);

    const transformedData = transformData(statementData);
    const drTotal = transformedData.reduce((sum, item) => {
        return item.accountSide === "Dr" ? sum + Number(item.pending || 0) : sum;
    }, 0);

    const crTotal = transformedData.reduce((sum, item) => {
        return item.accountSide === "Cr" ? sum + Number(item.pending || 0) : sum;
    }, 0);

    const finalTotal = drTotal - crTotal;

    const autoDownloadPDF = async () => {
        if (!contentRef.current || autoDownloadTriggered) return;
        setAutoDownloadTriggered(true);
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

    const generatePDF = async () => {
        const rowsPerPage = 20;
        const totalPages = Math.ceil(transformedData.length / rowsPerPage);

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        for (let page = 0; page < totalPages; page++) {
            if (page > 0) {
                pdf.addPage();
            }

            const startIdx = page * rowsPerPage;
            const endIdx = Math.min(startIdx + rowsPerPage, transformedData.length);
            const pageData = transformedData.slice(startIdx, endIdx);

            const pageDrTotal = pageData.reduce((sum, item) => {
                return item.accountSide === "Dr" ? sum + Number(item.pending || 0) : sum;
            }, 0);

            const pageCrTotal = pageData.reduce((sum, item) => {
                return item.accountSide === "Cr" ? sum + Number(item.pending || 0) : sum;
            }, 0);

            const pageFinalTotal = pageDrTotal - pageCrTotal;

            const wrapperDiv = document.createElement('div');
            wrapperDiv.style.backgroundColor = 'white';
            wrapperDiv.style.padding = '20px';
            wrapperDiv.style.width = '1200px';
            wrapperDiv.style.fontFamily = 'Arial, sans-serif';
            wrapperDiv.style.color = 'black';
            wrapperDiv.style.position = 'fixed';
            wrapperDiv.style.top = '-10000px';
            wrapperDiv.style.left = '-10000px';
            wrapperDiv.style.zIndex = '-1';

            const headerDiv = document.createElement('div');
            headerDiv.style.textAlign = 'center';
            headerDiv.style.marginBottom = '20px';
            headerDiv.style.padding = '10px';
            headerDiv.style.borderBottom = '2px solid #1976d2';
            headerDiv.innerHTML = `
            <h1 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold; color: #000000;">Account Pending Details</h1>
            ${accountName ? `<h2 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #000000;">${accountName}</h2>` : ''}
            <p style="margin: 5px 0; font-size: 12px; color: #000000;">Period: ${decodedParams.Fromdate} to ${decodedParams.Todate}</p>
        `;

            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.tableLayout = 'fixed';
            table.style.borderCollapse = 'collapse';
            table.style.fontSize = '10px';
            table.style.fontFamily = 'Arial, sans-serif';

            const colgroup = document.createElement('colgroup');
            const colWidths = ['4%', '8%', '5%', '5%', '5%', '5%'];
            colWidths.forEach((w) => {
                const col = document.createElement('col');
                col.style.width = w;
                colgroup.appendChild(col);
            });
            table.appendChild(colgroup);

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            headerRow.style.backgroundColor = '#1976d2';
            headerRow.style.borderBottom = '2px solid #000';

            const headers = ['#', 'Voucher Number', 'Date', 'Source', 'Pending Days', 'Pending (₹)'];
            headers.forEach((header, idx) => {
                const th = document.createElement('th');
                th.textContent = header;
                th.style.padding = '6px 4px';
                th.style.textAlign = (idx === 0 || idx === 1 || idx === 2 || idx === 3) ? 'left' : 'right';
                th.style.fontWeight = 'bold';
                th.style.border = '1px solid #ddd';
                th.style.color = '#fff';
                th.style.backgroundColor = '#1976d2';
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');

            pageData.forEach((row, idx) => {
                const tr = document.createElement('tr');
                tr.style.borderBottom = '1px solid #ddd';

                const td1 = document.createElement('td');
                td1.textContent = (startIdx + idx + 1).toString();
                td1.style.padding = '6px';
                td1.style.border = '1px solid #ddd';
                tr.appendChild(td1);

                const td2 = document.createElement('td');
                td2.textContent = row.voucherNumber;
                td2.style.padding = '6px';
                td2.style.border = '1px solid #ddd';
                tr.appendChild(td2);

                const td3 = document.createElement('td');
                td3.textContent = row.formattedDate;
                td3.style.padding = '6px';
                td3.style.border = '1px solid #ddd';
                tr.appendChild(td3);

                const td4 = document.createElement('td');
                td4.textContent = row.source;
                td4.style.padding = '6px';
                td4.style.border = '1px solid #ddd';
                tr.appendChild(td4);

                const td5 = document.createElement('td');
                td5.textContent = `${row.pendingDays} days`;
                td5.style.padding = '6px';
                td5.style.textAlign = 'right';
                td5.style.border = '1px solid #ddd';
                td5.style.color = row.pendingDays > 30 ? '#d32f2f' : row.pendingDays > 15 ? '#ed6c02' : '#2e7d32';
                td5.style.fontWeight = 'bold';
                tr.appendChild(td5);

                const td7 = document.createElement('td');
                td7.textContent = `${formatAmount(row.pending)} ${row.accountSide}`;
                td7.style.padding = '6px';
                td7.style.textAlign = 'right';
                td7.style.border = '1px solid #ddd';
                td7.style.fontWeight = 'bold';

                if (row.accountSide === "Cr") {
                    td7.style.color = "#2e7d32";
                    td7.style.backgroundColor = "#e8f5e9";
                } else {
                    td7.style.color = "#d32f2f";
                }

                tr.appendChild(td7);
                tbody.appendChild(tr);
            });

            const createTotalRow = (label, value, bgColor = '#f5f5f5') => {
                const tr = document.createElement('tr');
                tr.style.backgroundColor = bgColor;

                const tdLabel = document.createElement('td');
                tdLabel.colSpan = 5;
                tdLabel.textContent = label;
                tdLabel.style.padding = '6px';
                tdLabel.style.textAlign = 'right';
                tdLabel.style.fontWeight = 'bold';
                tdLabel.style.border = '1px solid #ddd';
                tr.appendChild(tdLabel);

                const tdValue = document.createElement('td');
                tdValue.textContent = formatAmount(value);
                tdValue.style.padding = '6px';
                tdValue.style.textAlign = 'right';
                tdValue.style.fontWeight = 'bold';
                tdValue.style.border = '1px solid #ddd';
                tr.appendChild(tdValue);

                return tr;
            };

            tbody.appendChild(createTotalRow('TOTAL', pageFinalTotal, '#e3f2fd'));
            table.appendChild(tbody);
            wrapperDiv.appendChild(headerDiv);
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
            } catch (err) {
                console.error('Error generating page:', err);
                throw err;
            } finally {
                if (wrapperDiv.parentNode) {
                    wrapperDiv.parentNode.removeChild(wrapperDiv);
                }
            }
        }

        pdf.save(`Pending_Bills_${decodedParams.Acc_Id}_${decodedParams.Fromdate}_to_${decodedParams.Todate}.pdf`);
        toast.success('PDF downloaded successfully!');
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

    if (loading) {
        return (
            <Container sx={{ textAlign: 'center', mt: 10 }}>
                <CircularProgress size={60} />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading Pending Bills...
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                    Decoding parameters and fetching data...
                </Typography>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4, maxWidth: 600 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                {!isPropsMode && (
                    <Button variant="contained" onClick={() => window.location.reload()}>
                        Retry
                    </Button>
                )}
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 2 }}>
            <Paper elevation={4} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                        Account Pending Reference
                    </Typography>
                    {accountName && (
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'center', color: '#333' }}>
                            {accountName}
                        </Typography>
                    )}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        <Chip label={`From: ${decodedParams.Fromdate}`} variant="outlined" size="small" />
                        <Chip label={`To: ${decodedParams.Todate}`} variant="outlined" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip label={`DR : ${formatAmount(drTotal)}`} color="success" variant="filled" size="small" />
                        <Chip label={`CR : ${formatAmount(crTotal)}`} color="warning" variant="filled" size="small" />
                        <Chip label={`Final : ${formatAmount(finalTotal)}`} color="error" variant="filled" size="small" />
                    </Box>
                </Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Total Records: {transformedData.length}
                </Typography>

                <div ref={contentRef} style={{ display: 'none' }} />

                <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'hidden' }}>
                    <Table
                        size="small"
                        sx={{
                            tableLayout: 'fixed',
                            width: '100%',
                            '& .MuiTableCell-root': {
                                fontSize: isMobile ? '0.6rem' : '0.875rem',
                                padding: isMobile ? '2px 2px' : '6px 16px',
                                whiteSpace: isMobile ? 'normal' : 'nowrap',
                                wordBreak: 'break-word',
                            },
                        }}
                    >
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                <TableCell sx={{ color: '#fff', fontWeight: 800 }}>Voucher</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 800 }}>Date</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 800 }}>Source</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 700 }} align="right">Pending (₹)</TableCell>
                                <TableCell sx={{ color: '#fff', fontWeight: 500 }} align="right">Pending Days</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transformedData.map((row, index) => (
                                <TableRow
                                    key={index}
                                    sx={{
                                        backgroundColor: row.accountSide === "Cr" ? "#e8f5e9" : "inherit",
                                    }}
                                >
                                    <TableCell>{row.voucherNumber}</TableCell>
                                    <TableCell>{formatDate(row.date)}</TableCell>
                                    <TableCell>{row.source}</TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{
                                            fontWeight: 700,
                                            color: row.accountSide === "Cr" ? "#2e7d32" : "#d32f2f",
                                        }}
                                    >
                                        {formatAmount(row.pending)} {row.accountSide}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            label={`${row.pendingDays} `}
                                            size="small"
                                            color={row.pendingDays > 30 ? "error" : row.pendingDays > 15 ? "warning" : "success"}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}

                            <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                                <TableCell colSpan={3} align="right">
                                    <strong> TOTAL</strong>
                                </TableCell>
                                <TableCell align="right">
                                    <strong>{formatAmount(finalTotal)}</strong>
                                </TableCell>
                                <TableCell />
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default Pendingbills;