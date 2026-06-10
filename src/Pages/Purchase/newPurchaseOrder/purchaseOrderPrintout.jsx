import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogActions, Button } from '@mui/material';
import { Close, Print } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { fetchLink } from '../../../Components/fetchComponent';
import {
    LocalDate, NumberFormat, numberToWords,
    Addition
} from '../../../Components/functions';

// ─── Page size styles ────────────────────────────────────────────────────────
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

const PurchaseOrderPage = ({ invoice, company, pageSize = 'A5' }) => {
    const {
        retailerName, retailerMobile, retailerAddress, retailerCity,
        retailerState, retailerGstNumber,
        poNumber, poDate, narration,
        poCGST, poSGST, poIGST,
        poRoundOff, poTaxableValue, poValue,
        productsDetails = [],
    } = invoice;

    const isIGST = Number(poIGST) > 0;
    const TaxData = buildTaxData(productsDetails, isIGST);

    const extraDetails = [
        { labelOne: 'Voucher No.', dataOne: poNumber, labelTwo: 'Dated', dataTwo: LocalDate(poDate) },
        { labelOne: 'Reference', dataOne: narration, labelTwo: '', dataTwo: '' },
    ];

    const pageStyle = pageSize === 'A4' ? a4Styles : a5Styles;

    const wrapperStyle = {
        ...pageStyle,
        pageBreakAfter: 'always',
        breakAfter: 'page',
    };

    const chunkSize = 15;
    const productChunks = [];
    for (let i = 0; i < productsDetails.length; i += chunkSize) {
        productChunks.push(productsDetails.slice(i, i + chunkSize));
    }

    return (
        <div style={wrapperStyle} className="print-container">

            <h5 className='text-center mb-2 fw-bold'>PURCHASE ORDER</h5>

            {/* ── General Info ── */}
            <div className="row">
                <div className="col-6 p-0 border border-bottom-0 border-end-0">
                    {/* Invoice To (Company Details) */}
                    <div className="border-bottom p-2">
                        <p className='m-0 fa-12'>Invoice To</p>
                        <p className='mb-2 fa-17 fw-bold'>{company?.companyName}</p>
                        <p className='m-0 fa-12'>{company?.companyAddress}</p>
                        <p className='m-0 fa-12'>Phone No: {company?.compnayMobileNumber}</p>
                        <p className='m-0 fa-12'>GSTIN / UIN: {company?.companyGstNumber}</p>
                    </div>
                    {/* Supplier (Retailer Details) */}
                    <div className="p-2">
                        <p className='m-0 fa-12'>Supplier (Bill from)</p>
                        <p className='mb-2 fa-17 fw-bold'>{retailerName}</p>
                        <p className='m-0 fa-14'>{retailerMobile}{retailerAddress ? ' - ' + retailerAddress : ''}</p>
                        <p className='m-0 fa-14'>{retailerCity}</p>
                        <p className='m-0 fa-14'>State Name: {retailerState}</p>
                        <p className='m-0 fa-14'>GSTIN / UIN: {retailerGstNumber}</p>
                    </div>
                </div>

                {/* Right: extra details table */}
                <div className="col-6 p-0 border border-bottom-0">
                    <table className="table m-0">
                        <tbody>
                            {extraDetails.map((detail, index) => (
                                <tr key={index}>
                                    <td className="border-end fa-14 px-1" style={{ width: '50%' }}>
                                        <p className="m-0 text-muted">{detail.labelOne}</p>
                                        <p className="m-0 fw-bold">{detail.dataOne || '-'}</p>
                                    </td>
                                    <td className='fa-14 px-1' style={{ width: '50%' }}>
                                        <p className="m-0 text-muted">{detail.labelTwo}</p>
                                        <p className="m-0 fw-bold">{detail.dataTwo || '-'}</p>
                                    </td>
                                </tr>
                            ))}
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
                                <td className='border bg-light fa-14 fw-bold'>Sl No</td>
                                <td className='border bg-light fa-14 fw-bold'>Description of Goods</td>
                                <td className='border bg-light fa-14 fw-bold'>HSN/SAC</td>
                                <td className='border bg-light fa-14 fw-bold text-center'>GST Rate</td>
                                <td className='border bg-light fa-14 fw-bold text-end'>Quantity</td>
                                <td className='border bg-light fa-14 fw-bold text-end'>Rate</td>
                                <td className='border bg-light fa-14 fw-bold text-end'>Amount</td>
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
                                                <td className='border fa-13 fw-bold'>
                                                    {p.productName}
                                                </td>
                                                <td className='border fa-13'>{p.hsnCode}</td>
                                                <td className='border fa-13 text-center'>{p.gstPercentage}%</td>
                                                <td className='border fa-13 text-end fw-bold'>
                                                    {NumberFormat(p.quantity)} <span className="fw-normal text-muted">{p.uom}</span>
                                                </td>
                                                <td className='border fa-13 text-end'>{NumberFormat(p.itemRateWithoutTax)}</td>
                                                <td className='border fa-13 text-end'>{NumberFormat(p.itemAmount)}</td>
                                            </tr>
                                        );
                                    })}

                                    {/* Summary rows — only after the last chunk */}
                                    {chunkIndex === productChunks.length - 1 && (
                                        <>
                                            <tr>
                                                <td className="border p-2" rowSpan={isIGST ? 4 : 5} colSpan={5}>
                                                    <p className='m-0 mx-2 p-2 fa-13 text-muted'>Amount Chargeable (in words):</p>
                                                    <p className='m-0 fa-13 fw-bold'>&emsp; INR {numberToWords(parseInt(poValue))} Only.</p>
                                                </td>
                                                <td className="border p-2 fa-14 text-end">Total Taxable Amount</td>
                                                <td className="border p-2 text-end fa-14">{NumberFormat(poTaxableValue)}</td>
                                            </tr>

                                            {!isIGST ? (
                                                <>
                                                    <tr>
                                                        <td className="border p-2 fa-14 text-end">CGST</td>
                                                        <td className="border p-2 text-end fa-14">{NumberFormat(poCGST)}</td>
                                                    </tr>
                                                    <tr>
                                                        <td className="border p-2 fa-14 text-end">SGST</td>
                                                        <td className="border p-2 fa-14 text-end">{NumberFormat(poSGST)}</td>
                                                    </tr>
                                                </>
                                            ) : (
                                                <tr>
                                                    <td className="border p-2 fa-14 text-end">IGST</td>
                                                    <td className="border p-2 fa-14 text-end">{NumberFormat(poIGST)}</td>
                                                </tr>
                                            )}

                                            <tr>
                                                <td className="border p-2 fa-14 text-end">Round Off</td>
                                                <td className="border p-2 fa-14 text-end">{NumberFormat(poRoundOff)}</td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2 fa-14 text-end fw-bold">Total</td>
                                                <td className="border p-2 fa-14 text-end fw-bold">{NumberFormat(poValue)}</td>
                                            </tr>
                                        </>
                                    )}

                                    {/* Page break between product chunks */}
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

            {/* ── Page Break ── */}
            <div style={{ pageBreakBefore: 'always' }}></div>

            {/* ── Tax summary table ── */}
            <div className="row mt-1">
                <div className="col-12 p-0">
                    <table className="table">
                        <thead>
                            <tr>
                                <td className="border bg-light fa-14 text-center fw-bold" rowSpan={2} style={{ verticalAlign: 'middle' }}>HSN / SAC</td>
                                <td className="border bg-light fa-14 text-center fw-bold" rowSpan={2} style={{ verticalAlign: 'middle' }}>Taxable Value</td>
                                {isIGST ? (
                                    <td className="border bg-light fa-14 text-center fw-bold" colSpan={2}>IGST Tax</td>
                                ) : (
                                    <>
                                        <td className="border bg-light fa-14 text-center fw-bold" colSpan={2}>Central Tax</td>
                                        <td className="border bg-light fa-14 text-center fw-bold" colSpan={2}>State Tax</td>
                                    </>
                                )}
                                <td className="border bg-light fa-14 text-center fw-bold">Total</td>
                            </tr>
                            <tr>
                                {isIGST ? (
                                    <>
                                        <td className="border bg-light fa-14 text-center fw-bold">Rate</td>
                                        <td className="border bg-light fa-14 text-center fw-bold">Amount</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="border bg-light fa-14 text-center fw-bold">Rate</td>
                                        <td className="border bg-light fa-14 text-center fw-bold">Amount</td>
                                        <td className="border bg-light fa-14 text-center fw-bold">Rate</td>
                                        <td className="border bg-light fa-14 text-center fw-bold">Amount</td>
                                    </>
                                )}
                                <td className="border bg-light fa-14 text-center fw-bold">Tax Amount</td>
                            </tr>
                        </thead>
                        <tbody>
                            {TaxData.map((o, i) => (
                                <tr key={i}>
                                    <td className="border fa-13 text-end">{o?.hsnCode}</td>
                                    <td className="border fa-13 text-end">{NumberFormat(o?.taxableValue)}</td>
                                    {isIGST ? (
                                        <>
                                            <td className="border fa-13 text-end">{NumberFormat(o?.igstPercentage)}%</td>
                                            <td className="border fa-13 text-end">{NumberFormat(o?.igst)}</td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="border fa-13 text-end">{NumberFormat(o?.cgstPercentage)}%</td>
                                            <td className="border fa-13 text-end">{NumberFormat(o?.cgst)}</td>
                                            <td className="border fa-13 text-end">{NumberFormat(o?.sgstPercentage)}%</td>
                                            <td className="border fa-13 text-end">{NumberFormat(o?.sgst)}</td>
                                        </>
                                    )}
                                    <td className="border fa-13 text-end">{NumberFormat(o?.totalTax)}</td>
                                </tr>
                            ))}
                            <tr>
                                <td className="border fa-13 text-end fw-bold">Total</td>
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
                </div>
            </div>

            <div className="col-12 text-center mt-3">
                <p className="text-muted fa-12">This is a Computer Generated Purchase Order</p>
            </div>
        </div>
    );
};

const PurchaseOrderPrintout = ({ open, onClose, poId }) => {
    const printRef = useRef(null);
    const [pageSize, setPageSize] = useState('A4');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [invoice, setInvoice] = useState(null);
    const [company, setCompany] = useState({});

    useEffect(() => {
        if (!open) { setInvoice(null); setError(''); return; }
        if (!poId) { setError('No Purchase Order ID provided.'); return; }

        setLoading(true);
        setError('');

        fetchLink({ address: `purchase/purchaseOrderPrint?PO_Id=${poId}` })
            .then(({ data, success, others }) => {
                if (success && Array.isArray(data) && data.length > 0) {
                    setInvoice(data[0]); // We only print one PO
                    setCompany(others?.companydata?.[0] ?? {});
                } else {
                    setError('No purchase order data found.');
                }
            })
            .catch(() => setError('Failed to fetch purchase order data.'))
            .finally(() => setLoading(false));
    }, [open, poId]);

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
        setInvoice(null);
        setError('');
        onClose?.();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="lg"
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
                Purchase Order Print Preview
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
                    backgroundColor: '#f8f9fa',
                    '@media print': {
                        overflow: 'visible',
                        display: 'block',
                        height: 'auto',
                        marginTop: '2px',
                        backgroundColor: '#fff',
                    }
                }}
            >
                {loading && (
                    <div className="d-flex align-items-center justify-content-center py-5 gap-3">
                        <div className="spinner-border spinner-border-sm text-primary" role="status" />
                        <span className="text-muted">Loading purchase order…</span>
                    </div>
                )}

                {!loading && error && (
                    <div className="alert alert-warning m-3">{error}</div>
                )}

                {/* Printable area */}
                {!loading && invoice && (
                    <div ref={printRef} style={{ width: '100%' }}>
                        <PurchaseOrderPage
                            invoice={invoice}
                            company={company}
                            pageSize={pageSize}
                        />
                    </div>
                )}
            </DialogContent>

            <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="purchaseOrderPrintPageSizeSwitch"
                        checked={pageSize === 'A4'}
                        onChange={() => setPageSize(prev => prev === 'A5' ? 'A4' : 'A5')}
                    />
                    <label className="form-check-label" htmlFor="purchaseOrderPrintPageSizeSwitch">
                        {pageSize} selected
                    </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Button startIcon={<Close />} variant="outlined" color="error" onClick={handleClose}>
                        Close
                    </Button>
                    {!loading && invoice && (
                        <Button startIcon={<Print />} variant="contained" onClick={handlePrint}>
                            Print
                        </Button>
                    )}
                </div>
            </DialogActions>
        </Dialog>
    );
};

export default PurchaseOrderPrintout;
