import React, { useEffect, useState, useRef } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton } from '@mui/material';
import { Print, Close } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import { fetchLink } from '../../Components/fetchComponent';
import { toArray, numberToWords, isEqualNumber } from '../../Components/functions';

const formatCurrency = (val) => {
    const num = Number(val || 0);
    return num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDateStandard = (dateStr) => {
    if (!dateStr) return '';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = String(d.getDate()).padStart(2, '0');
        const month = months[d.getMonth()];
        const year = String(d.getFullYear()).slice(-2);
        return `${day}-${month}-${year}`;
    } catch (e) {
        return dateStr;
    }
};

const DebitNotePrintModal = ({ open, onClose, debitNote, loadingOn, loadingOff }) => {
    const printRef = useRef(null);
    const storage = JSON.parse(localStorage.getItem('user') || '{}');
    const [companyInfo, setCompanyInfo] = useState({});
    const [retailerInfo, setRetailerInfo] = useState({});
    const [fullDetails, setFullDetails] = useState(null);
    const [pageSize, setPageSize] = useState('A4');

    useEffect(() => {
        if (!storage?.Company_id) return;
        fetchLink({
            address: `masters/company?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data?.success && data?.data?.[0]) {
                setCompanyInfo(data.data[0]);
            }
        }).catch(e => console.error(e));
    }, [storage?.Company_id]);

    useEffect(() => {
        if (!open || !debitNote) return;

        if (debitNote.DB_Id) {
            if (loadingOn) loadingOn();
            fetchLink({
                address: `debitNote/editDetails?DB_Id=${debitNote.DB_Id}`
            }).then(data => {
                if (data?.success && data?.data) {
                    setFullDetails({
                        ...debitNote,
                        ...data.data,
                        Products_List: data.data.Products_List || debitNote.Products_List || debitNote.Product_Array || [],
                        Expence_Array: data.data.Expence_Array || debitNote.Expence_Array || [],
                    });
                } else {
                    setFullDetails(debitNote);
                }
            }).catch(e => {
                console.error(e);
                setFullDetails(debitNote);
            }).finally(() => {
                if (loadingOff) loadingOff();
            });
        } else {
            setFullDetails(debitNote);
        }
    }, [open, debitNote]);

    const activeData = fullDetails || debitNote || {};
    const retailerId = activeData.Retailer_Id || activeData.Retailer_ID;

    useEffect(() => {
        if (!retailerId) return;
        fetchLink({
            address: `masters/retailers/info?Retailer_Id=${retailerId}`
        }).then(data => {
            if (data?.success && data?.data?.[0]) {
                setRetailerInfo(data.data[0]);
            }
        }).catch(e => console.error(e));
    }, [retailerId]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `DebitNote_${activeData.DB_Inv_No || 'Print'}`,
        pageStyle: `
            @page {
                size: ${pageSize === 'A4' ? 'A4 portrait' : 'A5 portrait'};
                margin: 6mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .no-print {
                    display: none !important;
                }
            }
        `
    });

    const products = toArray(activeData.Products_List || activeData.Product_Array);
    const expenses = toArray(activeData.Expence_Array || activeData.invoiceExpences);

    const isIGST = isEqualNumber(activeData.IS_IGST, 1) || Number(activeData.IGST_Total || activeData.Igst_Total || 0) > 0;
    const gstInclusive = activeData.GST_Inclusive !== undefined && activeData.GST_Inclusive !== null ? Number(activeData.GST_Inclusive) : null;
    const isNotTaxableVal = gstInclusive === 2;


    const hsnTaxMap = {};
    let subtotalTaxable = 0;
    let calcCgstTotal = 0;
    let calcSgstTotal = 0;
    let calcIgstTotal = 0;

    products.forEach(prod => {
        const hsn = prod.HSN_Code || prod.Hsn_Code || prod.HSN || 'N/A';
        const qty = Number(prod.Bill_Qty ?? prod.Total_Qty ?? prod.Act_Qty ?? 0);
        const rate = Number(prod.Taxable_Rate || prod.Item_Rate || 0);
        const taxable = Number(prod.Taxable_Amount || prod.Amount || (qty * rate));

        const cgstAmo = Number(prod.Cgst_Amo || 0);
        const sgstAmo = Number(prod.Sgst_Amo || 0);
        const igstAmo = Number(prod.Igst_Amo || 0);

        const cgstPer = Number(prod.Cgst || (prod.Tax_Rate ? prod.Tax_Rate / 2 : 0));
        const sgstPer = Number(prod.Sgst || (prod.Tax_Rate ? prod.Tax_Rate / 2 : 0));
        const igstPer = Number(prod.Igst || prod.Tax_Rate || 0);

        subtotalTaxable += taxable;
        calcCgstTotal += cgstAmo;
        calcSgstTotal += sgstAmo;
        calcIgstTotal += igstAmo;

        if (!hsnTaxMap[hsn]) {
            hsnTaxMap[hsn] = {
                hsn,
                taxableValue: 0,
                cgstRate: cgstPer,
                cgstAmount: 0,
                sgstRate: sgstPer,
                sgstAmount: 0,
                igstRate: igstPer,
                igstAmount: 0,
                totalTax: 0
            };
        }
        hsnTaxMap[hsn].taxableValue += taxable;
        hsnTaxMap[hsn].cgstAmount += cgstAmo;
        hsnTaxMap[hsn].sgstAmount += sgstAmo;
        hsnTaxMap[hsn].igstAmount += igstAmo;
        hsnTaxMap[hsn].totalTax += isIGST ? igstAmo : (cgstAmo + sgstAmo);
    });

    const hsnTaxList = Object.values(hsnTaxMap);

    const cgstTotal = Number(activeData.CSGT_Total || activeData.Cgst_Total || calcCgstTotal);
    const sgstTotal = Number(activeData.SGST_Total || activeData.Sgst_Total || calcSgstTotal);
    const igstTotal = Number(activeData.IGST_Total || activeData.Igst_Total || calcIgstTotal);
    const roundOffVal = Number(activeData.Round_off || 0);

    const totalTaxVal = isIGST ? igstTotal : (cgstTotal + sgstTotal);
    const hasTax = totalTaxVal > 0 || products.some(p => Number(p.Cgst || p.Sgst || p.Igst || p.Tax_Rate || 0) > 0);
    const isTaxableBill = isNotTaxableVal ? false : (gstInclusive === 0 || gstInclusive === 1 || hasTax);

    const grandTotal = Number(activeData.Total_Invoice_value || (subtotalTaxable + (isTaxableBill ? totalTaxVal : 0) + roundOffVal));

    const totalShippedQty = products.reduce((sum, item) => sum + Number(item.Total_Qty || item.Bill_Qty || item.Act_Qty || 0), 0);
    const totalBilledQty = products.reduce((sum, item) => sum + Number(item.Bill_Qty || item.Total_Qty || 0), 0);

    const amountInWordsText = numberToWords(parseInt(grandTotal));
    const taxInWordsText = isTaxableBill && totalTaxVal > 0 ? numberToWords(parseInt(totalTaxVal)) : 'NIL';

    const documentTitleHeader = isTaxableBill ? (activeData.VoucherTypeGet || 'Tax Invoice') : 'Bill of Supply';
    const containerWidth = pageSize === 'A4' ? '190mm' : '140mm';
    const baseFontSize = pageSize === 'A4' ? '13px' : '11px';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Debit Note Print Preview ({documentTitleHeader})</span>
                <div>
                    <Button onClick={handlePrint} variant="contained" color="primary" startIcon={<Print />} sx={{ mr: 1 }}>
                        Print
                    </Button>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </div>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 2, backgroundColor: '#f5f5f5' }}>

                <div
                    ref={printRef}
                    style={{
                        width: containerWidth,
                        margin: '0 auto',
                        backgroundColor: '#fff',
                        padding: '6mm',
                        boxSizing: 'border-box',
                        fontFamily: 'Calibri, Arial, sans-serif',
                        fontSize: baseFontSize,
                        lineHeight: 1.25,
                        color: '#000',
                        border: '1px solid #ccc'
                    }}
                >

                    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '18px', marginBottom: '6px' }}>
                        {documentTitleHeader}
                    </div>


                    <div style={{ border: '1px solid #000' }}>

                        <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>

                            <div style={{ width: '55%', borderRight: '1px solid #000' }}>

                                <div style={{ padding: '4px 6px', borderBottom: '1px solid #000', minHeight: '85px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>
                                        {companyInfo.Company_Name}
                                    </div>
                                    <div>{companyInfo.Company_Address}</div>
                                    {companyInfo.Address2 && <div>{companyInfo.Address2}</div>}
                                    <div>GSTIN/UIN: <strong>{companyInfo.Gst_Number || companyInfo.VAT_TIN_Number}</strong></div>
                                    <div>State Name : {companyInfo.State}, Code : {companyInfo.StateCode}</div>
                                    <div>Contact : {companyInfo.Phone_Number || companyInfo.Mobile_No}</div>
                                </div>

                                {!isTaxableBill && (
                                    <div style={{ padding: '4px 6px', borderBottom: '1px solid #000', minHeight: '65px' }}>
                                        <div style={{ fontSize: '12px', color: '#333' }}>Consignee (Ship to)</div>
                                        <div style={{ fontWeight: 'bold' }}>
                                            {activeData.shippingName || retailerInfo.Retailer_Name || activeData.Retailer_Name}
                                        </div>
                                        <div>{activeData.shippingDeliveryAddress || retailerInfo.Reatailer_Address || ''}</div>
                                        <div>GSTIN/UIN : {activeData.shippingGstNumber || retailerInfo.Gstno}</div>
                                        <div>State Name : {activeData.shippingStateName || retailerInfo.StateGet}, Code : {retailerInfo.StateCode}</div>
                                    </div>
                                )}


                                <div style={{ padding: '4px 6px', minHeight: '65px' }}>
                                    <div style={{ fontSize: '12px', color: '#333' }}>Buyer (Bill to)</div>
                                    <div style={{ fontWeight: 'bold' }}>
                                        {retailerInfo.Retailer_Name || activeData.Retailer_Name}
                                    </div>
                                    <div>{retailerInfo.Reatailer_Address || ''}</div>
                                    {retailerInfo.Gstno && <div>GSTIN/UIN : {retailerInfo.Gstno}</div>}
                                    <div>State Name : {retailerInfo.StateGet || activeData.shippingStateName}, Code : {retailerInfo.StateCode}</div>
                                </div>
                            </div>


                            <div style={{ width: '45%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                                    <div style={{ width: '50%', borderRight: '1px solid #000', padding: '3px 5px', minHeight: '34px' }}>
                                        <div style={{ fontSize: '11px' }}>Debit Note No.</div>
                                        <div style={{ fontWeight: 'bold' }}>{activeData.DB_Inv_No || ''}</div>
                                    </div>
                                    <div style={{ width: '50%', padding: '3px 5px' }}>
                                        <div style={{ fontSize: '11px' }}>Dated</div>
                                        <div style={{ fontWeight: 'bold' }}>{formatDateStandard(activeData.DB_Date)}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                                    <div style={{ width: '50%', borderRight: '1px solid #000', padding: '3px 5px', minHeight: '34px' }}>
                                        <div style={{ fontSize: '11px' }}>Mode/Terms of Payment</div>
                                        <div>{activeData.Payment_Terms || activeData.Mode_Terms_of_Payment || ''}</div>
                                    </div>
                                    <div style={{ width: '50%', padding: '3px 5px' }}>
                                        <div style={{ fontSize: '11px' }}>&nbsp;</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                                    <div style={{ width: '50%', borderRight: '1px solid #000', padding: '3px 5px', minHeight: '34px' }}>
                                        <div style={{ fontSize: '11px' }}>Original Invoice No. & Date.</div>
                                        <div>{activeData.Ref_Inv_Number ? `${activeData.Ref_Inv_Number} ${activeData.Ref_Inv_Date ? 'dt. ' + formatDateStandard(activeData.Ref_Inv_Date) : ''}` : ''}</div>
                                    </div>
                                    <div style={{ width: '50%', padding: '3px 5px' }}>
                                        <div style={{ fontSize: '11px' }}>Other References</div>
                                        <div>{activeData.Reference_No || ''}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                                    <div style={{ width: '50%', borderRight: '1px solid #000', padding: '3px 5px', minHeight: '34px' }}>
                                        <div style={{ fontSize: '11px' }}>Buyer's Order No.</div>
                                        <div>{activeData.Buyer_Order_No || ''}</div>
                                    </div>
                                    <div style={{ width: '50%', padding: '3px 5px' }}>
                                        <div style={{ fontSize: '11px' }}>Dated</div>
                                        <div>{formatDateStandard(activeData.Buyer_Order_Date)}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                                    <div style={{ width: '50%', borderRight: '1px solid #000', padding: '3px 5px', minHeight: '34px' }}>
                                        <div style={{ fontSize: '11px' }}>Dispatch Doc No.</div>
                                        <div>{activeData.Dispatch_Doc_No || ''}</div>
                                    </div>
                                    <div style={{ width: '50%', padding: '3px 5px' }}>
                                        <div style={{ fontSize: '11px' }}>&nbsp;</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', borderBottom: '1px solid #000' }}>
                                    <div style={{ width: '50%', borderRight: '1px solid #000', padding: '3px 5px', minHeight: '34px' }}>
                                        <div style={{ fontSize: '11px' }}>Dispatched through</div>
                                        <div>{activeData.Dispatched_through || activeData.Transport_Name || ''}</div>
                                    </div>
                                    <div style={{ width: '50%', padding: '3px 5px' }}>
                                        <div style={{ fontSize: '11px' }}>Destination</div>
                                        <div>{activeData.Destination || ''}</div>
                                    </div>
                                </div>

                                <div style={{ padding: '3px 5px', flexGrow: 1 }}>
                                    <div style={{ fontSize: '11px' }}>Terms of Delivery</div>
                                    <div>{activeData.Terms_of_Delivery || ''}</div>
                                </div>
                            </div>
                        </div>


                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: baseFontSize }}>
                            <thead>
                                {isTaxableBill ? (
                                    <tr style={{ borderBottom: '1px solid #000' }}>
                                        <th style={{ borderRight: '1px solid #000', padding: '3px', width: '38px', textAlign: 'center' }}>SI No.</th>
                                        <th style={{ borderRight: '1px solid #000', padding: '3px', textAlign: 'left' }}>Description of Goods</th>
                                        <th style={{ borderRight: '1px solid #000', padding: '3px', width: '80px', textAlign: 'center' }}>HSN/SAC</th>
                                        <th style={{ borderRight: '1px solid #000', padding: '3px', width: '90px', textAlign: 'center' }}>Quantity</th>
                                        <th style={{ borderRight: '1px solid #000', padding: '3px', width: '70px', textAlign: 'right' }}>Rate</th>
                                        <th style={{ borderRight: '1px solid #000', padding: '3px', width: '45px', textAlign: 'center' }}>per</th>
                                        <th style={{ padding: '3px', width: '95px', textAlign: 'right' }}>Amount</th>
                                    </tr>
                                ) : (
                                    <>
                                        <tr style={{ borderBottom: '1px solid #000' }}>
                                            <th style={{ borderRight: '1px solid #000', padding: '3px', width: '38px', textAlign: 'center' }} rowSpan={2}>SI No.</th>
                                            <th style={{ borderRight: '1px solid #000', padding: '3px', textAlign: 'left' }} rowSpan={2}>Description of Goods</th>
                                            <th style={{ borderRight: '1px solid #000', padding: '3px', width: '80px', textAlign: 'center' }} rowSpan={2}>HSN/SAC</th>
                                            <th style={{ borderRight: '1px solid #000', padding: '3px', textAlign: 'center' }} colSpan={2}>Quantity</th>
                                            <th style={{ borderRight: '1px solid #000', padding: '3px', width: '70px', textAlign: 'right' }} rowSpan={2}>Rate</th>
                                            <th style={{ borderRight: '1px solid #000', padding: '3px', width: '45px', textAlign: 'center' }} rowSpan={2}>per</th>
                                            <th style={{ padding: '3px', width: '95px', textAlign: 'right' }} rowSpan={2}>Amount</th>
                                        </tr>
                                        <tr style={{ borderBottom: '1px solid #000' }}>
                                            <th style={{ borderRight: '1px solid #000', padding: '2px', width: '85px', textAlign: 'center' }}>Shipped</th>
                                            <th style={{ borderRight: '1px solid #000', padding: '2px', width: '85px', textAlign: 'center' }}>Billed</th>
                                        </tr>
                                    </>
                                )}
                            </thead>
                            <tbody>
                                {products.map((item, idx) => {
                                    const uom = item.UOM_Name || item.Unit_Name || item.Uom || 'Nos';
                                    const altQtyText = item.Alt_Bill_Qty ? ` (${item.Alt_Bill_Qty} G)` : (item.Alt_Act_Qty ? ` (${item.Alt_Act_Qty} G)` : '');
                                    const shippedQtyVal = `${item.Act_Qty ?? item.Total_Qty ?? item.Bill_Qty ?? 0} ${uom}${altQtyText}`;
                                    const billedQtyVal = `${item.Bill_Qty ?? item.Total_Qty ?? 0} ${uom}${altQtyText}`;
                                    const qtyVal = Number(item.Bill_Qty ?? item.Total_Qty ?? item.Act_Qty ?? 0);

                                    const rateWithoutTax = Number(item.Taxable_Rate || item.Item_Rate || 0);
                                    const itemAmount = Number(item.Taxable_Amount || item.Amount || (qtyVal * rateWithoutTax));

                                    return (
                                        <tr key={idx} style={{ verticalAlign: 'top', height: '24px' }}>
                                            <td style={{ borderRight: '1px solid #000', textAlign: 'center', padding: '3px 4px' }}>{idx + 1}</td>
                                            <td style={{ borderRight: '1px solid #000', padding: '3px 4px', fontWeight: 'bold' }}>
                                                {item.Item_Name || item.Product_Name || ''}
                                            </td>
                                            <td style={{ borderRight: '1px solid #000', textAlign: 'center', padding: '3px 4px' }}>
                                                {item.HSN_Code || item.Hsn_Code || item.HSN || ''}
                                            </td>
                                            {isTaxableBill ? (
                                                <td style={{ borderRight: '1px solid #000', textAlign: 'center', padding: '3px 4px', fontWeight: 'bold' }}>{qtyVal.toFixed(1)} {uom}</td>
                                            ) : (
                                                <>
                                                    <td style={{ borderRight: '1px solid #000', textAlign: 'center', padding: '3px 4px' }}>{shippedQtyVal}</td>
                                                    <td style={{ borderRight: '1px solid #000', textAlign: 'center', padding: '3px 4px' }}>{billedQtyVal}</td>
                                                </>
                                            )}
                                            <td style={{ borderRight: '1px solid #000', textAlign: 'right', padding: '3px 4px' }}>{formatCurrency(rateWithoutTax)}</td>
                                            <td style={{ borderRight: '1px solid #000', textAlign: 'center', padding: '3px 4px' }}>{uom}</td>
                                            <td style={{ textAlign: 'right', padding: '3px 4px', fontWeight: 'bold' }}>{formatCurrency(itemAmount)}</td>
                                        </tr>
                                    );
                                })}

                                {isTaxableBill ? (
                                    <>

                                        <tr style={{ verticalAlign: 'top' }}>
                                            <td style={{ borderRight: '1px solid #000' }}></td>
                                            <td style={{ borderRight: '1px solid #000' }}></td>
                                            <td style={{ borderRight: '1px solid #000' }}></td>
                                            <td style={{ borderRight: '1px solid #000' }}></td>
                                            <td style={{ borderRight: '1px solid #000' }}></td>
                                            <td style={{ borderRight: '1px solid #000' }}></td>
                                            <td style={{ textAlign: 'right', padding: '3px 4px', fontWeight: 'bold', borderTop: '1px solid #ccc' }}>
                                                {formatCurrency(subtotalTaxable)}
                                            </td>
                                        </tr>

                                        {!isIGST ? (
                                            <>
                                                {cgstTotal > 0 && (
                                                    <tr style={{ verticalAlign: 'top' }}>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'right', fontWeight: 'bold' }}>CGST</td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ textAlign: 'right', padding: '3px 4px', fontWeight: 'bold' }}>{formatCurrency(cgstTotal)}</td>
                                                    </tr>
                                                )}
                                                {sgstTotal > 0 && (
                                                    <tr style={{ verticalAlign: 'top' }}>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'right', fontWeight: 'bold' }}>SGST</td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ textAlign: 'right', padding: '3px 4px', fontWeight: 'bold' }}>{formatCurrency(sgstTotal)}</td>
                                                    </tr>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                {igstTotal > 0 && (
                                                    <tr style={{ verticalAlign: 'top' }}>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'right', fontWeight: 'bold' }}>IGST</td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ textAlign: 'right', padding: '3px 4px', fontWeight: 'bold' }}>{formatCurrency(igstTotal)}</td>
                                                    </tr>
                                                )}
                                            </>
                                        )}
                                    </>
                                ) : null}


                                {roundOffVal !== 0 && (
                                    <tr style={{ verticalAlign: 'top' }}>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: isTaxableBill ? 'right' : 'left' }}>
                                            {isTaxableBill ? (
                                                <strong>Round Off</strong>
                                            ) : (
                                                <><em>Less :</em> &nbsp; <strong>ROUND OFF</strong></>
                                            )}
                                        </td>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        {!isTaxableBill && <td style={{ borderRight: '1px solid #000' }}></td>}
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td style={{ textAlign: 'right', padding: '3px 4px', fontWeight: 'bold' }}>
                                            {roundOffVal < 0 ? `(-)${Math.abs(roundOffVal).toFixed(2)}` : roundOffVal.toFixed(2)}
                                        </td>
                                    </tr>
                                )}

                                {expenses.map((exp, eIdx) => (
                                    <tr key={`exp-${eIdx}`} style={{ verticalAlign: 'top' }}>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: isTaxableBill ? 'right' : 'left' }}>
                                            {exp.Expence_Name || exp.Account_Name || 'Expense'}
                                        </td>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        {!isTaxableBill && <td style={{ borderRight: '1px solid #000' }}></td>}
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                        <td style={{ textAlign: 'right', padding: '3px 4px' }}>
                                            {formatCurrency(exp.Expence_Amount || exp.Amount)}
                                        </td>
                                    </tr>
                                ))}


                                <tr style={{ height: '80px' }}>
                                    <td style={{ borderRight: '1px solid #000' }}></td>
                                    <td style={{ borderRight: '1px solid #000' }}></td>
                                    <td style={{ borderRight: '1px solid #000' }}></td>
                                    {!isTaxableBill && <td style={{ borderRight: '1px solid #000' }}></td>}
                                    <td style={{ borderRight: '1px solid #000' }}></td>
                                    <td style={{ borderRight: '1px solid #000' }}></td>
                                    <td style={{ borderRight: '1px solid #000' }}></td>
                                    <td></td>
                                </tr>
                            </tbody>

                            <tfoot>

                                <tr style={{ borderTop: '1px solid #000', borderBottom: '1px solid #000', fontWeight: 'bold' }}>
                                    <td style={{ borderRight: '1px solid #000' }}></td>
                                    <td style={{ borderRight: '1px solid #000', textAlign: 'right', padding: '4px 6px' }}>Total</td>
                                    <td style={{ borderRight: '1px solid #000' }}></td>
                                    {!isTaxableBill ? (
                                        <>
                                            <td style={{ borderRight: '1px solid #000', textAlign: 'center', padding: '4px' }}>
                                                {totalShippedQty.toFixed(1)} kg
                                            </td>
                                            <td style={{ borderRight: '1px solid #000', textAlign: 'center', padding: '4px' }}>
                                                {totalBilledQty.toFixed(1)} kg
                                            </td>
                                        </>
                                    ) : (
                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                    )}
                                    <td style={{ borderRight: '1px solid #000' }}></td>
                                    <td style={{ borderRight: '1px solid #000' }}></td>
                                    <td style={{ textAlign: 'right', padding: '4px 6px', fontSize: '15px' }}>
                                        ₹ {formatCurrency(grandTotal)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>


                        <div style={{ textAlign: 'right', fontSize: '11px', fontStyle: 'italic', padding: '2px 6px', borderBottom: '1px solid #000' }}>
                            E. & O.E
                        </div>

                        <div style={{ padding: '5px 6px', borderBottom: '1px solid #000' }}>
                            <div style={{ fontSize: '12px' }}>Amount Chargeable (in words)</div>
                            <div style={{ fontWeight: 'bold', fontSize: '13px' }}>
                                INR {amountInWordsText} Only
                            </div>
                        </div>


                        <div style={{ borderBottom: '1px solid #000' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                                <thead>
                                    {isTaxableBill ? (
                                        <>
                                            <tr style={{ borderBottom: '1px solid #000', backgroundColor: '#fafafa' }}>
                                                <th style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'center', verticalAlign: 'middle' }} rowSpan={2}>HSN/SAC</th>
                                                <th style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'right', verticalAlign: 'middle' }} rowSpan={2}>Taxable Value</th>
                                                {!isIGST ? (
                                                    <>
                                                        <th style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'center' }} colSpan={2}>CGST</th>
                                                        <th style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'center' }} colSpan={2}>SGST/UTGST</th>
                                                    </>
                                                ) : (
                                                    <th style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'center' }} colSpan={2}>IGST</th>
                                                )}
                                                <th style={{ padding: '3px 4px', textAlign: 'right', verticalAlign: 'middle' }} rowSpan={2}>Total Tax Amount</th>
                                            </tr>
                                            <tr style={{ borderBottom: '1px solid #000', backgroundColor: '#fafafa' }}>
                                                {!isIGST ? (
                                                    <>
                                                        <th style={{ borderRight: '1px solid #000', padding: '2px 4px', textAlign: 'center' }}>Rate</th>
                                                        <th style={{ borderRight: '1px solid #000', padding: '2px 4px', textAlign: 'right' }}>Amount</th>
                                                        <th style={{ borderRight: '1px solid #000', padding: '2px 4px', textAlign: 'center' }}>Rate</th>
                                                        <th style={{ borderRight: '1px solid #000', padding: '2px 4px', textAlign: 'right' }}>Amount</th>
                                                    </>
                                                ) : (
                                                    <>
                                                        <th style={{ borderRight: '1px solid #000', padding: '2px 4px', textAlign: 'center' }}>Rate</th>
                                                        <th style={{ borderRight: '1px solid #000', padding: '2px 4px', textAlign: 'right' }}>Amount</th>
                                                    </>
                                                )}
                                            </tr>
                                        </>
                                    ) : (
                                        <tr style={{ borderBottom: '1px solid #000', backgroundColor: '#fafafa' }}>
                                            <th style={{ borderRight: '1px solid #000', padding: '3px 6px', textAlign: 'left', width: '50%' }}>HSN/SAC</th>
                                            <th style={{ padding: '3px 6px', textAlign: 'right' }}>Taxable Value</th>
                                        </tr>
                                    )}
                                </thead>
                                <tbody>
                                    {hsnTaxList.map((o, i) => (
                                        <tr key={i}>
                                            <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: isTaxableBill ? 'center' : 'left' }}>{o.hsn}</td>
                                            <td style={{ borderRight: isTaxableBill ? '1px solid #000' : 'none', padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(o.taxableValue)}</td>
                                            {isTaxableBill && (
                                                <>
                                                    {!isIGST ? (
                                                        <>
                                                            <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'center' }}>{o.cgstRate.toFixed(2)}%</td>
                                                            <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(o.cgstAmount)}</td>
                                                            <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'center' }}>{o.sgstRate.toFixed(2)}%</td>
                                                            <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(o.sgstAmount)}</td>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'center' }}>{o.igstRate.toFixed(2)}%</td>
                                                            <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(o.igstAmount)}</td>
                                                        </>
                                                    )}
                                                    <td style={{ padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(o.totalTax)}</td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    <tr style={{ borderTop: '1px solid #000', fontWeight: 'bold', backgroundColor: '#f9f9f9' }}>
                                        <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: isTaxableBill ? 'center' : 'right' }}>Total</td>
                                        <td style={{ borderRight: isTaxableBill ? '1px solid #000' : 'none', padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(subtotalTaxable)}</td>
                                        {isTaxableBill && (
                                            <>
                                                {!isIGST ? (
                                                    <>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(cgstTotal)}</td>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(sgstTotal)}</td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td style={{ borderRight: '1px solid #000' }}></td>
                                                        <td style={{ borderRight: '1px solid #000', padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(igstTotal)}</td>
                                                    </>
                                                )}
                                                <td style={{ padding: '3px 4px', textAlign: 'right' }}>{formatCurrency(totalTaxVal)}</td>
                                            </>
                                        )}
                                    </tr>
                                </tbody>
                            </table>
                        </div>


                        <div style={{ padding: '5px 6px', borderBottom: '1px solid #000', fontSize: '12px' }}>
                            <span>Tax Amount (in words) : </span>
                            <strong style={{ textTransform: 'uppercase' }}>
                                {isTaxableBill && totalTaxVal > 0 ? `INR ${taxInWordsText} Only` : 'NIL'}
                            </strong>
                        </div>


                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ width: '45%', borderLeft: '1px solid #000', padding: '6px', textAlign: 'center', minHeight: '75px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ fontSize: '12px' }}>
                                    for <strong>{companyInfo.Company_Name || 'PUKAL FOODS PVT LTD'}</strong>
                                </div>
                                <div style={{ fontWeight: 'bold', fontSize: '12px', marginTop: '30px' }}>
                                    Authorised Signatory
                                </div>
                            </div>
                        </div>
                    </div>


                    <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '6px' }}>
                        This is a Computer Generated Document
                    </div>
                </div>
            </DialogContent>
            <DialogActions sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="form-check form-switch ms-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="debitNotePageSizeSwitch"
                        checked={pageSize === 'A4'}
                        onChange={() => setPageSize(prev => prev === 'A5' ? 'A4' : 'A5')}
                    />
                    <label className="form-check-label ms-1" htmlFor="debitNotePageSizeSwitch">
                        {pageSize} selected
                    </label>
                </div>
                <div>
                    <Button onClick={onClose} variant="outlined" color="secondary" sx={{ mr: 1 }}>Close</Button>
                    <Button onClick={handlePrint} variant="contained" color="primary" startIcon={<Print />}>Print</Button>
                </div>
            </DialogActions>
        </Dialog>
    );
};

export default DebitNotePrintModal;
