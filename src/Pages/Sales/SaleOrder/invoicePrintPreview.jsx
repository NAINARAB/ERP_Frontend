import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogActions, Button, Chip } from '@mui/material';
import { Close, Print } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { fetchLink } from '../../../Components/fetchComponent';
import {
    LocalDate, NumberFormat, numberToWords,
    Addition, RoundNumber,
    isEqualNumber
} from '../../../Components/functions';

// ─── Page size styles (same as previewInvoice.jsx) ───────────────────────────
// Same dimensions as previewInvoice.jsx — 200mm width intentionally causes the browser
// to scale content down to fit physical paper (A5=148mm, A4=210mm)
const a4Styles = {
    width: '200mm',
    minHeight: '290mm',
    padding: '10mm',
    backgroundColor: '#fff',
    fontSize: '7px',
    boxSizing: 'border-box',
    boxShadow: '0 0 5mm rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.2,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    margin: '0 auto',
};

const a5Styles = {
    width: '200mm',
    minHeight: '146mm',
    padding: '8mm',
    backgroundColor: '#fff',
    fontSize: '5px',
    boxSizing: 'border-box',
    boxShadow: '0 0 5mm rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.0,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    margin: '0 auto',
};

const buildTaxData = (products, isIGST) => products.reduce((data, item) => {
    const idx = data.findIndex(o => o.hsnCode === item.hsnCode);
    const cgstAmt = Number(item.cgstAmount || 0);
    const sgstAmt = Number(item.sgstAmount || 0);
    const igstAmt = Number(item.igstAmount || 0);
    const taxable = Number(item.itemRateWithoutTax || 0) * Number(item.quantity || 0);
    const totalTax = isIGST ? igstAmt : Addition(cgstAmt, sgstAmt);

    if (idx !== -1) {
        const prev = data[idx];
        data[idx] = {
            ...prev,
            taxableValue: prev.taxableValue + taxable,
            cgst: Addition(prev.cgst, cgstAmt),
            sgst: Addition(prev.sgst, sgstAmt),
            igst: Addition(prev.igst, igstAmt),
            totalTax: prev.totalTax + totalTax,
        };
        return data;
    }
    return [...data, {
        hsnCode: item.hsnCode,
        taxableValue: taxable,
        cgst: cgstAmt, cgstPercentage: item.cgstPercentage,
        sgst: sgstAmt, sgstPercentage: item.sgstPercentage,
        igst: igstAmt, igstPercentage: item.igstPercentage,
        totalTax,
    }];
}, []);

const InvoicePage = ({ invoice, company, pageSize = 'A5', copyIndex, totalCopies }) => {
    const {
        retailerName, retailerMobile, retailerAddress, retailerCity,
        retailerState, retailerGstNumber,
        invoiceNumber, invoiceDate,
        invoiceCGST, invoiceSGST, invoiceIGST,
        invoiceRoundOff, invoiceTaxableValue, invoiceValue,
        orderNumber, orderDate,
        salesPersonName, salesPersonMobileNumber,
        deliveryPersonName, deliveryPersonMobileNumber,
        tripStaffInfo = [],
        productsDetails = [],
    } = invoice;

    const isIGST = Number(invoiceIGST) > 0;
    const TaxData = buildTaxData(productsDetails, isIGST);
    const vehicleNo = [...new Set(tripStaffInfo.map(s => s.vehicleNumber).filter(Boolean))].join(', ');

    const extraDetails = [
        { labelOne: 'Invoice No', dataOne: invoiceNumber, labelTwo: 'Dated', dataTwo: LocalDate(invoiceDate) },
        { labelOne: "Delivery By", dataOne: deliveryPersonName, labelTwo: 'Delivery Mobile', deliveryPersonMobileNumber },
        { labelOne: 'Order No', dataOne: orderNumber, labelTwo: 'Order Date', dataTwo: LocalDate(orderDate) },
        { labelOne: 'Sales Person', dataOne: salesPersonName, labelTwo: 'Mobile', dataTwo: salesPersonMobileNumber },
        {
            labelOne: 'Dispatched through',
            dataOne: tripStaffInfo.filter(
                fil => isEqualNumber(fil.costCatergoryId, 2)
            ).map(cost => cost.costCenterName),
            labelTwo: 'Vehicle No',
            dataTwo: vehicleNo
        }
    ];

    const pageStyle = pageSize === 'A4' ? a4Styles : a5Styles;

    // page-break-before: always ensures no two bill copies share a page
    const wrapperStyle = {
        ...pageStyle,
        pageBreakBefore: copyIndex > 0 ? 'always' : 'auto',
        breakBefore: copyIndex > 0 ? 'page' : 'auto',
        pageBreakAfter: 'always',
        breakAfter: 'page',
    };

    // chunk products into groups of 15 (same as previewInvoice.jsx)
    const chunkSize = 15;
    const productChunks = [];
    for (let i = 0; i < productsDetails.length; i += chunkSize) {
        productChunks.push(productsDetails.slice(i, i + chunkSize));
    }

    return (
        <div style={wrapperStyle} className="print-container">

            {/* Copy label (screen only) */}
            {/* {totalCopies > 1 && (
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#666', marginBottom: '2px' }}
                    className="d-print-none">
                    Copy {copyIndex + 1} of {totalCopies}
                </div>
            )} */}

            <h5 className='text-center mb-2'>TAX INVOICE</h5>

            {/* ── General Info ── */}
            <div className="row">
                <div className="col-6 p-0 border border-bottom-0 border-end-0">
                    {/* Company block */}
                    <div className="border-bottom p-2">
                        <p className='mb-2 fa-17'>{company?.companyName}</p>
                        <p className='m-0 fa-12'>Address: {company?.companyAddress}</p>
                        <p className='m-0 fa-12'>Phone No: {company?.compnayMobileNumber}</p>
                        <p className='m-0 fa-12'>GSTIN / UIN: {company?.companyGstNumber}</p>
                    </div>
                    {/* Buyer block */}
                    <div className="p-2">
                        <p className='m-0 fa-12'>Buyer (Bill to)</p>
                        <p className='mb-2 fa-17'>{retailerName}</p>
                        <p className='m-0 fa-14'>{retailerMobile}{retailerAddress ? ' - ' + retailerAddress : ''}</p>
                        <p className='m-0 fa-14'>{retailerCity}</p>
                        <p className='m-0 fa-14'>GSTIN / UIN: {retailerGstNumber}</p>
                        <p className='m-0 fa-14'>State Name: {retailerState}</p>
                    </div>
                </div>

                {/* Right: extra details table */}
                <div className="col-6 p-0 border border-bottom-0">
                    <table className="table m-0">
                        <tbody>
                            {extraDetails.map((detail, index) => (
                                <tr key={index}>
                                    <td className="border-end fa-14 px-1">
                                        <p className="m-0">{detail.labelOne}</p>
                                        <p className="m-0 text-end">{detail.dataOne || '-'}</p>
                                    </td>
                                    <td className='fa-14 px-1'>
                                        <p className="m-0">{detail.labelTwo}</p>
                                        <p className="m-0 text-end">{detail.dataTwo || '-'}</p>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={2} className='border-0 fa-14'>
                                    <p className="m-0">Invoice Value</p>
                                    <p className="m-0 text-end fa-18">{NumberFormat(invoiceValue)}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Products table ── */}
            <div className="row">
                <div className="col-12 p-0">
                    <table className="table m-0">
                        <thead>
                            <tr>
                                <td className='border bg-light fa-14'>Sno</td>
                                <td className='border bg-light fa-14'>Product</td>
                                <td className='border bg-light fa-14'>HSN/SAC</td>
                                <td className='border bg-light fa-14 text-end'>Quantity</td>
                                <td className='border bg-light fa-14 text-end'>Rate</td>
                                <td className='border bg-light fa-14 text-end'>
                                    <p className='m-2'>Rate</p>
                                    <p className='m-0'>(Incl. of Tax)</p>
                                </td>
                                <td className='border bg-light fa-14 text-end'>Amount</td>
                            </tr>
                        </thead>
                        <tbody>
                            {productChunks.map((chunk, chunkIndex) => (
                                <React.Fragment key={chunkIndex}>
                                    {chunk.map((p, i) => {
                                        const globalIdx = chunkIndex * chunkSize + i;
                                        return (
                                            <tr key={globalIdx}>
                                                <td className='border fa-13'>{globalIdx + 1}</td>
                                                <td className='border fa-13'>{p.productName}</td>
                                                <td className='border fa-13'>{p.hsnCode}</td>
                                                <td className='border fa-13 text-end'>{NumberFormat(p.quantity)}</td>
                                                <td className='border fa-13 text-end'>{NumberFormat(p.itemRateWithoutTax)}</td>
                                                <td className='border fa-13 text-end'>{NumberFormat(p.itemRateWithTax)}</td>
                                                <td className='border fa-13 text-end'>{NumberFormat(p.itemAmount)}</td>
                                            </tr>
                                        );
                                    })}

                                    {/* Summary rows — only after the last chunk */}
                                    {chunkIndex === productChunks.length - 1 && (
                                        <>
                                            <tr>
                                                <td className="border p-2" rowSpan={isIGST ? 4 : 5} colSpan={4}>
                                                    <p className='m-0 mx-2 p-2 fa-13 fw-bold'>Amount Chargeable (in words):</p>
                                                    <p className='m-0 fa-13 fw-bold'>&emsp; INR {numberToWords(parseInt(invoiceValue))} Only.</p>
                                                </td>
                                                <td className="border p-2 fa-14" colSpan={2}>Total Taxable Amount</td>
                                                <td className="border p-2 text-end fa-14">{NumberFormat(invoiceTaxableValue)}</td>
                                            </tr>

                                            {!isIGST ? (
                                                <>
                                                    <tr>
                                                        <td className="border p-2 fa-14" colSpan={2}>CGST</td>
                                                        <td className="border p-2 text-end fa-14">{NumberFormat(invoiceCGST)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border p-2 fa-14" colSpan={2}>SGST</td>
                                                        <td className="border p-2 fa-14 text-end">{NumberFormat(invoiceSGST)}</td>
                                                    </tr>
                                                </>
                                            ) : (
                                                <tr>
                                                    <td className="border p-2 fa-14" colSpan={2}>IGST</td>
                                                    <td className="border p-2 fa-14 text-end">{NumberFormat(invoiceIGST)}</td>
                                                </tr>
                                            )}

                                            <tr>
                                                <td className="border p-2 fa-14" colSpan={2}>Round Off</td>
                                                <td className="border p-2 fa-14 text-end">{NumberFormat(invoiceRoundOff)}</td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2 fa-14" colSpan={2}>Total</td>
                                                <td className="border p-2 fa-14 text-end fw-bold">{NumberFormat(invoiceValue)}</td>
                                            </tr>
                                        </>
                                    )}

                                    {/* Page break between product chunks (same invoice, multi-page) */}
                                    {chunkIndex < productChunks.length - 1 && (
                                        <tr style={{ pageBreakAfter: 'always', height: '0', visibility: 'hidden', border: 'none' }}>
                                            <td colSpan="7" style={{ border: 'none' }}></td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Tax summary table ── */}
            <table className="table">
                <thead>
                    <tr>
                        <td className="border bg-light fa-14 text-center" rowSpan={2} style={{ verticalAlign: 'middle' }}>HSN / SAC</td>
                        <td className="border bg-light fa-14 text-center" rowSpan={2} style={{ verticalAlign: 'middle' }}>Taxable Value</td>
                        {isIGST ? (
                            <td className="border bg-light fa-14 text-center" colSpan={2}>IGST Tax</td>
                        ) : (
                            <>
                                <td className="border bg-light fa-14 text-center" colSpan={2}>Central Tax</td>
                                <td className="border bg-light fa-14 text-center" colSpan={2}>State Tax</td>
                            </>
                        )}
                        <td className="border bg-light fa-14 text-center">Total</td>
                    </tr>
                    <tr>
                        {isIGST ? (
                            <>
                                <td className="border bg-light fa-14 text-center">Rate</td>
                                <td className="border bg-light fa-14 text-center">Amount</td>
                            </>
                        ) : (
                            <>
                                <td className="border bg-light fa-14 text-center">Rate</td>
                                <td className="border bg-light fa-14 text-center">Amount</td>
                                <td className="border bg-light fa-14 text-center">Rate</td>
                                <td className="border bg-light fa-14 text-center">Amount</td>
                            </>
                        )}
                        <td className="border bg-light fa-14 text-center">Tax Amount</td>
                    </tr>
                </thead>
                <tbody>
                    {TaxData.map((o, i) => (
                        <tr key={i}>
                            <td className="border fa-13 text-end">{o?.hsnCode}</td>
                            <td className="border fa-13 text-end">{NumberFormat(o?.taxableValue)}</td>
                            {isIGST ? (
                                <>
                                    <td className="border fa-13 text-end">{NumberFormat(o?.igstPercentage)}</td>
                                    <td className="border fa-13 text-end">{NumberFormat(o?.igst)}</td>
                                </>
                            ) : (
                                <>
                                    <td className="border fa-13 text-end">{NumberFormat(o?.cgstPercentage)}</td>
                                    <td className="border fa-13 text-end">{NumberFormat(o?.cgst)}</td>
                                    <td className="border fa-13 text-end">{NumberFormat(o?.sgstPercentage)}</td>
                                    <td className="border fa-13 text-end">{NumberFormat(o?.sgst)}</td>
                                </>
                            )}
                            <td className="border fa-13 text-end">{NumberFormat(o?.totalTax)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td className="border fa-13 text-end">Total</td>
                        <td className="border fa-13 text-end fw-bold">
                            {NumberFormat(TaxData.reduce((s, o) => s + Number(o.taxableValue), 0))}
                        </td>
                        {isIGST ? (
                            <>
                                <td className="border fa-13 text-end"></td>
                                <td className="border fa-13 text-end fw-bold">
                                    {NumberFormat(TaxData.reduce((s, o) => s + Number(o.igst), 0))}
                                </td>
                            </>
                        ) : (
                            <>
                                <td className="border fa-13 text-end"></td>
                                <td className="border fa-13 text-end fw-bold">
                                    {NumberFormat(TaxData.reduce((s, o) => s + Number(o.cgst), 0))}
                                </td>
                                <td className="border fa-13 text-end"></td>
                                <td className="border fa-13 text-end fw-bold">
                                    {NumberFormat(TaxData.reduce((s, o) => s + Number(o.sgst), 0))}
                                </td>
                            </>
                        )}
                        <td className="border fa-13 text-end fw-bold">
                            {NumberFormat(TaxData.reduce((s, o) => s + Number(o.totalTax), 0))}
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={isIGST ? 5 : 7} className='border fa-13 fw-bold'>
                            Tax Amount (in words) : INR&nbsp;
                            {numberToWords(parseInt(TaxData.reduce((s, o) => s + Number(o.totalTax), 0)))} only.
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="col-12 text-center">
                <p>This is a Computer Generated Invoice</p>
            </div>
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
/**
 * InvoicePrintPreview
 *
 * Props:
 *   open           – boolean (controls Dialog visibility)
 *   onClose        – function
 *   doIds          – number[] | string[]  — explicit list of Do_Id values
 *   copyCountMap   – { [Do_Id]: number }  — copy count per invoice id
 *   selectedOrders – sale-order row[]     — alternative: reads ConvertedInvoice + invoiceCopyCount
 */
const InvoicePrintPreview = ({ open, onClose, doIds = [], copyCountMap = {}, selectedOrders = [] }) => {
    const printRef = useRef(null);
    const [pageSize, setPageSize] = useState('A5');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [invoices, setInvoices] = useState([]);
    const [company, setCompany] = useState({});

    // Build Do_Id → copyCount map from selectedOrders if not explicitly provided
    const resolvedCopyMap = (() => {
        if (Object.keys(copyCountMap).length > 0) return copyCountMap;
        const map = {};
        for (const order of selectedOrders) {
            const n = Math.max(1, parseInt(order.invoiceCopyCount) || 1);
            for (const inv of (order.ConvertedInvoice ?? [])) {
                if (inv?.invId) map[String(inv.invId)] = n;
            }
        }
        return map;
    })();

    const getCopyCount = (invId) =>
        Math.max(1, resolvedCopyMap[String(invId)] ?? 1);

    const totalBills = invoices.reduce((s, inv) => s + getCopyCount(inv.invId), 0);

    // Fetch when dialog opens
    useEffect(() => {
        if (!open) { setInvoices([]); setError(''); return; }

        const ids = doIds.length > 0 ? doIds : Object.keys(resolvedCopyMap);
        if (ids.length === 0) { setError('No invoice IDs provided.'); return; }

        setLoading(true);
        setError('');

        fetchLink({ address: `sales/salesInvoice/bulkByIds?Do_Ids=${ids.join(',')}` })
            .then(({ data, success, others }) => {
                if (success && Array.isArray(data) && data.length > 0) {
                    setInvoices(data);
                    setCompany(others?.companydata?.[0] ?? {});
                } else {
                    setError('No invoice data found.');
                }
            })
            .catch(() => setError('Failed to fetch invoice data.'))
            .finally(() => setLoading(false));
    }, [open]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        pageStyle: `
            @page {
                size: ${pageSize === 'A4' ? 'A4 portrait' : 'A5 portrait'};
                margin: 5mm;
            }
            @media print {
                body { margin: 0; padding: 0; }
                .MuiDialog-root,
                .MuiDialog-container,
                .MuiPaper-root,
                .MuiDialogTitle-root { display: none !important; }
                .pagebreak { clear: both; page-break-after: always; }
                .d-print-none { display: none !important; }
                .print-container { box-shadow: none !important; }
            }
        `
    });

    const handleClose = () => {
        setInvoices([]);
        setError('');
        onClose?.();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="xl"
            sx={{
                '& .MuiDialog-container': {
                    alignItems: 'flex-start',
                    padding: '20px 0',
                    overflow: 'auto',
                },
                '& .MuiPaper-root': {
                    width: 'auto',
                    maxWidth: '95vw',
                    maxHeight: '95vh',
                    margin: 0,
                    overflow: 'visible',
                }
            }}
        >
            <DialogTitle sx={{
                textAlign: 'center',
                fontWeight: 'bold',
                width: '100%',
                position: 'sticky',
                marginTop: '2px',
                backgroundColor: 'white',
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1.5,
            }}>
                Invoice Print Preview
                {!loading && invoices.length > 0 && (
                    <Chip
                        label={`${invoices.length} invoice${invoices.length !== 1 ? 's' : ''} · ${totalBills} bill${totalBills !== 1 ? 's' : ''}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 'normal', fontSize: '12px' }}
                    />
                )}
            </DialogTitle>

            <DialogContent
                sx={{
                    padding: 0,
                    margin: 0,
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    '@media print': {
                        overflow: 'visible',
                        display: 'block',
                        height: 'auto',
                        marginTop: '2px',
                    }
                }}
            >
                {loading && (
                    <div className="d-flex align-items-center justify-content-center py-5 gap-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                        <span className="text-muted">Loading invoices…</span>
                    </div>
                )}

                {!loading && error && (
                    <div className="alert alert-warning m-3">{error}</div>
                )}

                {!loading && !error && invoices.length === 0 && (
                    <div className="alert alert-info m-3">No invoices to display.</div>
                )}

                {/* Printable area */}
                {!loading && invoices.length > 0 && (
                    <div ref={printRef} style={{ width: '100%' }}>
                        {invoices.map((invoice, invIdx) => {
                            const copies = getCopyCount(invoice.invId);
                            return Array.from({ length: copies }).map((_, copyIdx) => (
                                <InvoicePage
                                    key={`inv-${invIdx}-copy-${copyIdx}`}
                                    invoice={invoice}
                                    company={company}
                                    pageSize={pageSize}
                                    copyIndex={copyIdx}
                                    totalCopies={copies}
                                />
                            ));
                        })}
                    </div>
                )}
            </DialogContent>

            <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
                {/* A4/A5 toggle — same as previewInvoice.jsx */}
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="invoicePrintPageSizeSwitch"
                        checked={pageSize === 'A4'}
                        onChange={() => setPageSize(prev => prev === 'A5' ? 'A4' : 'A5')}
                    />
                    <label className="form-check-label" htmlFor="invoicePrintPageSizeSwitch">
                        {pageSize} selected
                    </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Button startIcon={<Close />} variant="outlined" color="error" onClick={handleClose}>
                        Close
                    </Button>
                    {!loading && invoices.length > 0 && (
                        <Button startIcon={<Print />} variant="contained" onClick={handlePrint}>
                            Print{totalBills > 1 ? ` (${totalBills} Bills)` : ''}
                        </Button>
                    )}
                </div>
            </DialogActions>
        </Dialog>
    );
};

export default InvoicePrintPreview;