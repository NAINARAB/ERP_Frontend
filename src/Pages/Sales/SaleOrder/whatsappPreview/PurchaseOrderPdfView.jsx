import React, { useEffect, useRef, useState } from 'react';
import { fetchLink } from '../../../../Components/fetchComponent';
import {
    LocalDate, NumberFormat, numberToWords,
    Addition
} from '../../../../Components/functions';

// ─── Page size styles ────────────────────────────────────────────────────────
const a4Styles = {
    width: '100%',
    maxWidth: '1000px',
    padding: '10px',
    backgroundColor: '#fff',
    fontSize: '12px',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.3,
    display: 'flex',
    flexDirection: 'column',
    margin: '0 auto',
};

const buildTaxData = (products = [], isIGST) => products.reduce((data, item) => {
    const idx = data.findIndex(o => o.hsnCode === item.hsnCode);
    const cgstAmt = Number(item.cgstAmount || 0);
    const sgstAmt = Number(item.sgstAmount || 0);
    const igstAmt = Number(item.igstAmount || 0);
    const taxable = Number(item.itemRateWithoutTax || item.Item_Rate || 0) * Number(item.quantity || item.Bill_Qty || 0);
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
        hsnCode: item.hsnCode || item.HSN_Code || '-',
        taxableValue: taxable,
        cgst: cgstAmt, cgstPercentage: item.cgstPercentage || item.Cgst || 0,
        sgst: sgstAmt, sgstPercentage: item.sgstPercentage || item.Sgst || 0,
        igst: igstAmt, igstPercentage: item.igstPercentage || item.Igst || 0,
        totalTax,
    }];
}, []);

const PurchaseOrderPage = ({ invoice, company }) => {
    const {
        retailerName = '', retailerMobile = '', retailerAddress = '', retailerCity = '',
        retailerState = '', retailerGstNumber = '',
        poNumber = '', poDate = '', narration = '',
        poCGST = 0, poSGST = 0, poIGST = 0,
        poRoundOff = 0, poTaxableValue = 0, poValue = 0,
        productsDetails = [],
    } = invoice || {};

    const isIGST = Number(poIGST) > 0;
    const TaxData = buildTaxData(productsDetails, isIGST);

    const extraDetails = [
        { labelOne: 'Voucher No.', dataOne: poNumber, labelTwo: 'Dated', dataTwo: LocalDate(poDate) },
        { labelOne: 'Reference', dataOne: narration, labelTwo: '', dataTwo: '' },
    ];

    const chunkSize = 15;
    const productChunks = [];
    if (productsDetails.length === 0) {
        productChunks.push([]);
    } else {
        for (let i = 0; i < productsDetails.length; i += chunkSize) {
            productChunks.push(productsDetails.slice(i, i + chunkSize));
        }
    }

    return (
        <div style={a4Styles} className="print-container">
            <h5 className='text-center mb-2 fw-bold'>PURCHASE ORDER</h5>

            {/* ── General Info ── */}
            <div className="row m-0">
                <div className="col-6 p-0 border border-bottom-0 border-end-0">
                    {/* Invoice To (Company Details) */}
                    <div className="border-bottom p-2">
                        <p className='m-0 fa-12'>Invoice To</p>
                        <p className='mb-2 fa-17 fw-bold'>{company?.companyName || company?.Company_Name}</p>
                        <p className='m-0 fa-12'>{company?.companyAddress || company?.Company_Address}</p>
                        <p className='m-0 fa-12'>Phone No: {company?.compnayMobileNumber || company?.Telephone_Number || '-'}</p>
                        <p className='m-0 fa-12'>GSTIN / UIN: {company?.companyGstNumber || company?.Gst_Number || '-'}</p>
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
            <div className="row m-0">
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
                                                    {p.productName || p.Item_Name || p.Product_Name}
                                                </td>
                                                <td className='border fa-13'>{p.hsnCode || p.HSN_Code || '-'}</td>
                                                <td className='border fa-13 text-center'>{p.gstPercentage || p.Gst || 0}%</td>
                                                <td className='border fa-13 text-end fw-bold'>
                                                    {NumberFormat(p.quantity || p.Bill_Qty || 0)} <span className="fw-normal text-muted">{p.uom || p.Unit_Name || p.UOM || 'KG'}</span>
                                                </td>
                                                <td className='border fa-13 text-end'>{NumberFormat(p.itemRateWithoutTax || p.Item_Rate || 0)}</td>
                                                <td className='border fa-13 text-end'>{NumberFormat(p.itemAmount || p.Total_Amount || (Number(p.quantity || p.Bill_Qty || 0) * Number(p.itemRateWithoutTax || p.Item_Rate || 0)))}</td>
                                            </tr>
                                        );
                                    })}

                                    {/* Summary rows — only after the last chunk */}
                                    {chunkIndex === productChunks.length - 1 && (
                                        <>
                                            <tr>
                                                <td className="border p-2" rowSpan={isIGST ? 4 : 5} colSpan={5}>
                                                    <p className='m-0 mx-2 p-2 fa-13 text-muted'>Amount Chargeable (in words):</p>
                                                    <p className='m-0 fa-13 fw-bold'>&emsp; INR {numberToWords(parseInt(poValue || 0))} Only.</p>
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
                                                        <td className="border p-2 text-end fa-14">{NumberFormat(poSGST)}</td>
                                                    </tr>
                                                </>
                                            ) : (
                                                <tr>
                                                    <td className="border p-2 fa-14 text-end">IGST</td>
                                                    <td className="border p-2 text-end fa-14">{NumberFormat(poIGST)}</td>
                                                </tr>
                                            )}

                                            <tr>
                                                <td className="border p-2 fa-14 text-end">Round Off</td>
                                                <td className="border p-2 text-end fa-14">{NumberFormat(poRoundOff)}</td>
                                            </tr>
                                            <tr>
                                                <td className="border p-2 fa-14 text-end fw-bold">Total</td>
                                                <td className="border p-2 fa-14 text-end fw-bold">{NumberFormat(poValue)}</td>
                                            </tr>
                                        </>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Tax summary table ── */}
            <div className="row mt-2 m-0">
                <div className="col-12 p-0">
                    <table className="table m-0">
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

export default function PurchaseOrderTemplate({ row, companyInfo, onReady, onError }) {
    const [purchaseOrder, setPurchaseOrder] = useState(null);
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const readyFiredRef = useRef(false);

    const poId = row?.PO_Id || row?.Po_Id || row?.PO_ID || row?.Id || row?.DocumentId;
    const poNumber = row?.DocumentNumber || row?.Po_Inv_No || row?.PO_ID || row?.poNumber || '-';

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                if (!poId && !poNumber) throw new Error('Missing Purchase Order ID');

                let poData = null;
                let comp = null;

                if (poId) {
                    try {
                        const resp = await fetchLink({
                            address: `purchase/purchaseOrderPrint?PO_Id=${poId}`,
                            loadingOn: () => {},
                            loadingOff: () => {},
                        });
                        if (resp?.success && Array.isArray(resp.data) && resp.data.length > 0) {
                            poData = resp.data[0];
                            comp = resp?.others?.companydata?.[0] || null;
                        }
                    } catch {
                        // fallback
                    }
                }

                if (!poData && row) {
                    poData = {
                        retailerName: row?.retailerNameGet || row?.Retailer_Name || row?.PartyName || '-',
                        retailerMobile: row?.A1_Phone || row?.retailerMobile || row?.A1 || row?.Customer_Phone || '',
                        retailerAddress: row?.retailerAddress || row?.PartyAddress || row?.Address || '',
                        retailerCity: row?.retailerCity || row?.City || '',
                        retailerState: row?.retailerState || row?.State || '',
                        retailerGstNumber: row?.retailerGstNumber || row?.GST_No || row?.GSTIN || '',
                        poNumber: row?.DocumentNumber || row?.Po_Inv_No || '-',
                        poDate: row?.DocumentDate || row?.Po_Date || row?.createdOn,
                        narration: row?.narration || row?.Narration || row?.Remarks || '',
                        poCGST: row?.poCGST || 0,
                        poSGST: row?.poSGST || 0,
                        poIGST: row?.poIGST || 0,
                        poRoundOff: row?.poRoundOff || 0,
                        poTaxableValue: row?.poTaxableValue || row?.Taxable_Amount || 0,
                        poValue: row?.Total_Invoice_value || row?.poValue || 0,
                        productsDetails: Array.isArray(row?.productsDetails) ? row.productsDetails : (
                            Array.isArray(row?.Products_List) ? row.Products_List.map(p => ({
                                productName: p.Product_Name || p.Item_Name || '-',
                                hsnCode: p.HSN_Code || p.hsnCode || '-',
                                quantity: p.Bill_Qty || p.Quantity || 0,
                                uom: p.Unit_Name || p.UOM || 'KG',
                                itemRateWithoutTax: p.Item_Rate || p.Rate || 0,
                                itemAmount: p.Total_Amount || (Number(p.Bill_Qty || 0) * Number(p.Item_Rate || 0)),
                                gstPercentage: p.Gst || p.cgstPercentage ? (Number(p.cgstPercentage || 0) + Number(p.sgstPercentage || 0)) : (p.Igst || 0),
                                cgstPercentage: p.Cgst || 0,
                                cgstAmount: p.Cgst_Amo || 0,
                                sgstPercentage: p.Sgst || 0,
                                sgstAmount: p.Sgst_Amo || 0,
                                igstPercentage: p.Igst || 0,
                                igstAmount: p.Igst_Amo || 0,
                            })) : []
                        ),
                    };
                }

                if (cancelled) return;
                setPurchaseOrder(poData);
                setCompanyData(comp);
            } catch (e) {
                if (cancelled) return;
                setError(e?.message || 'Failed to load purchase order');
                onError?.(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [poId, poNumber, row]);

    useEffect(() => {
        if (loading || readyFiredRef.current) return;
        if (error) return;
        readyFiredRef.current = true;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => onReady?.(), 150);
            });
        });
    }, [loading, error, onReady]);

    if (loading || error || !purchaseOrder) return null;

    const company = companyData || companyInfo?.[0] || {};

    return (
        <div style={{ backgroundColor: '#fff', padding: '10px' }}>
            <PurchaseOrderPage
                invoice={purchaseOrder}
                company={company}
            />
        </div>
    );
}
