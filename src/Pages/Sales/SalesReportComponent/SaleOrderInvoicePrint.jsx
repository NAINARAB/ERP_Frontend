import React, { useEffect, useRef, useState } from 'react';
import {
    Dialog, DialogContent, DialogTitle, DialogActions,
    Button, CircularProgress, Alert, Chip
} from '@mui/material';
import { Close, Print } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import {
    isEqualNumber, isGraterNumber, LocalDate, NumberFormat,
    numberToWords, Multiplication, Subraction, Addition, RoundNumber
} from '../../../Components/functions';
import { fetchLink } from '../../../Components/fetchComponent';

const taxCalc = (method = 1, amount = 0, percentage = 0) => {
    switch (method) {
        case 0: return RoundNumber(amount * (percentage / 100));
        case 1: return RoundNumber(amount - (amount * (100 / (100 + percentage))));
        case 2: return 0;
        default: return 0;
    }
};

const InvoicePage = ({ invoiceDetails, products, companyInfo, retailerInfo, copyIndex, totalCopies }) => {
    const isExclusiveBill = isEqualNumber(invoiceDetails.GST_Inclusive, 0);
    const isInclusive = isEqualNumber(invoiceDetails.GST_Inclusive, 1);
    const isNotTaxable = isEqualNumber(invoiceDetails.GST_Inclusive, 2);
    const IS_IGST = isEqualNumber(invoiceDetails.IS_IGST, 1);

    const includedProducts = products.filter(p => isGraterNumber(p?.Bill_Qty, 0));

    const totalValueBeforeTax = products.reduce((acc, item) => {
        const itemRate = RoundNumber(item?.Item_Rate);
        const billQty = parseInt(item?.Bill_Qty) || 0;

        if (isNotTaxable) {
            acc.TotalValue += Multiplication(billQty, itemRate);
            return acc;
        }

        const gstPct = IS_IGST ? item?.Igst : Addition(item?.Sgst, item?.Cgst);

        if (isInclusive) {
            const tax = taxCalc(1, itemRate, gstPct);
            acc.TotalTax += Multiplication(billQty, tax);
            acc.TotalValue += Multiplication(billQty, Subraction(itemRate, tax));
        }
        if (isExclusiveBill) {
            const tax = taxCalc(0, itemRate, gstPct);
            acc.TotalTax += Multiplication(billQty, tax);
            acc.TotalValue += Multiplication(billQty, itemRate);
        }
        return acc;
    }, { TotalValue: 0, TotalTax: 0 });

    const TaxData = products.reduce((data, item) => {
        const idx = data.findIndex(o => o.hsnCode == item.HSN_Code);
        const { Taxable_Amount, Cgst_Amo, Sgst_Amo, Igst_Amo, HSN_Code, Cgst, Sgst, Igst } = item;
        if (idx !== -1) {
            data[idx] = {
                ...data[idx],
                taxableValue: data[idx].taxableValue + Taxable_Amount,
                cgst: Addition(data[idx].cgst, Cgst_Amo),
                sgst: Addition(data[idx].sgst, Sgst_Amo),
                igst: Addition(data[idx].igst, Igst_Amo),
                totalTax: data[idx].totalTax + Number(IS_IGST ? Igst_Amo : Addition(Cgst_Amo, Sgst_Amo)),
            };
            return data;
        }
        return [...data, {
            hsnCode: HSN_Code, taxableValue: Taxable_Amount,
            cgst: Cgst_Amo, cgstPercentage: Cgst,
            sgst: Sgst_Amo, sgstPercentage: Sgst,
            igst: Igst_Amo, igstPercentage: Igst,
            totalTax: IS_IGST ? Number(Igst_Amo) : Addition(Cgst_Amo, Sgst_Amo),
        }];
    }, []);

    const extraDetails = [
        { labelOne: 'Invoice No', dataOne: invoiceDetails?.Do_Inv_No, labelTwo: 'Dated', dataTwo: LocalDate(invoiceDetails?.Do_Date) },
        { labelOne: 'Delivery Note', dataOne: '', labelTwo: 'Mode/Terms of Payment', dataTwo: '' },
        { labelOne: 'Reference No. & Date', dataOne: '', labelTwo: 'Other References', dataTwo: '' },
        { labelOne: "Buyer's Order No", dataOne: '', labelTwo: 'Dated', dataTwo: '' },
        { labelOne: 'Dispatch Doc No', dataOne: '', labelTwo: 'Delivery Note Date', dataTwo: '' },
        { labelOne: 'Dispatched through', dataOne: '', labelTwo: 'Destination', dataTwo: '' },
        { labelOne: 'Bill of Lading/LR-RR No', dataOne: '', labelTwo: 'Motor Vehicle No', dataTwo: '' },
    ];

    return (
        <div style={{ pageBreakAfter: 'always', padding: '8px' }}>
            {/* {totalCopies > 1 && (
                <div style={{ textAlign: 'right', fontSize: '11px', color: '#666', marginBottom: '4px' }}>
                    Copy {copyIndex + 1} of {totalCopies}
                </div>
            )} */}

            <h3 className='text-center mb-2'>Tax Invoice</h3>

            {/* Header: Company & Buyer */}
            <div className="row">
                <div className="col-6 p-0 border border-bottom-0 border-end-0">
                    <div className="border-bottom p-2">
                        <p className='m-0 fa-17'>{companyInfo?.Company_Name}</p>
                        <p className='m-0 fa-14'>Address: {companyInfo?.Company_Address}</p>
                        <p className='m-0 fa-14'>City: {companyInfo?.Region} - {companyInfo?.Pincode}</p>
                        <p className='m-0 fa-14'>
                            {companyInfo?.Gst_Number || companyInfo?.VAT_TIN_Number ? (
                                <>
                                    GSTIN / UIN:
                                    {companyInfo?.Gst_Number ? ` ${companyInfo.Gst_Number}` : ''}
                                    {companyInfo?.Gst_Number && companyInfo?.VAT_TIN_Number ? ' || ' : ''}
                                    {companyInfo?.VAT_TIN_Number ? ` ${companyInfo.VAT_TIN_Number}` : ''}
                                </>
                            ) : <>GSTIN / UIN: Not Available</>}
                        </p>
                        <p className='m-0 fa-14'>State: {companyInfo?.State}</p>
                    </div>
                    <div className="p-2">
                        <p className='m-0 fa-12'>Buyer (Bill to)</p>
                        <p className='m-0 fa-15'>{retailerInfo?.Retailer_Name || invoiceDetails?.Retailer_Name}</p>
                        <p className='m-0 fa-14'>{retailerInfo?.Mobile_No} - {retailerInfo?.Reatailer_Address}</p>
                        <p className='m-0 fa-14'>{retailerInfo?.Reatailer_City} - {retailerInfo?.PinCode}</p>
                        <p className='m-0 fa-14'>GSTIN / UIN: {retailerInfo?.Gstno}</p>
                        <p className='m-0 fa-14'>State Name: {retailerInfo?.StateGet}</p>
                    </div>
                </div>
                <div className="col-6 p-0 border border-bottom-0">
                    <table className="table m-0">
                        <tbody>
                            {extraDetails.map((d, i) => (
                                <tr key={i}>
                                    <td className="border-end fa-12 p-0 px-1">
                                        <p className="m-0">{d.labelOne}</p>
                                        <p className="m-0">&emsp;{d.dataOne}</p>
                                    </td>
                                    <td className='fa-12 p-0 px-1'>
                                        <p className="m-0">{d.labelTwo}</p>
                                        <p className="m-0">&emsp;{d.dataTwo}</p>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={2} className='border-0 fa-12 p-0'>
                                    <p className="m-0">Terms of Delivery</p>
                                    <br /><br />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Products table */}
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
                                    <p className='m-0'>
                                        {isEqualNumber(invoiceDetails.GST_Inclusive, 1) && '(Incl. of Tax)'}
                                        {isEqualNumber(invoiceDetails.GST_Inclusive, 2) && '(Tax not applicable)'}
                                        {isEqualNumber(invoiceDetails.GST_Inclusive, 0) && '(Excl. of Tax)'}
                                    </p>
                                </td>
                                <td className='border bg-light fa-14 text-end'>Amount</td>
                            </tr>
                        </thead>
                        <tbody>
                            {includedProducts.map((o, i) => {
                                const pct = (IS_IGST ? o?.Igst_P : (o?.Cgst + o?.Sgst)) ?? 0;
                                const qty = Number(o?.Bill_Qty || 0);
                                const rate = Number(o?.Item_Rate || 0);
                                const itemTax = taxCalc(invoiceDetails.GST_Inclusive, rate, pct);
                                return (
                                    <tr key={i}>
                                        <td className='border fa-13'>{i + 1}</td>
                                        <td className='border fa-13'>{o?.Product_Name || o?.Item_Name}</td>
                                        <td className='border fa-13'>{o?.HSN_Code}</td>
                                        <td className='border fa-13 text-end'>
                                            {NumberFormat(qty)}{o?.UOM && ' (' + o.UOM + ') '}
                                        </td>
                                        <td className='border fa-13 text-end'>
                                            {NumberFormat(isEqualNumber(invoiceDetails.GST_Inclusive, 1) ? (rate - itemTax) : rate)}
                                        </td>
                                        <td className='border fa-13 text-end'>
                                            {NumberFormat(isEqualNumber(invoiceDetails.GST_Inclusive, 1) ? rate : (rate + itemTax))}
                                        </td>
                                        <td className='border fa-13 text-end'>{NumberFormat(o?.Taxable_Amount)}</td>
                                    </tr>
                                );
                            })}

                            <tr>
                                <td className="border p-2" rowSpan={IS_IGST ? 4 : 5} colSpan={4}>
                                    <p className='m-0'>Amount Chargeable (in words):</p>
                                    <p className='m-0'>&emsp; INR {numberToWords(parseInt(invoiceDetails?.Total_Invoice_value))} Only.</p>
                                </td>
                                <td className="border p-2 fa-14" colSpan={2}>Total Taxable Amount</td>
                                <td className="border p-2 text-end fa-14">{NumberFormat(totalValueBeforeTax.TotalValue)}</td>
                            </tr>

                            {!IS_IGST ? (
                                <>
                                    <tr>
                                        <td className="border p-2 fa-14" colSpan={2}>CGST</td>
                                        <td className="border p-2 text-end fa-14">{NumberFormat(invoiceDetails?.CSGT_Total)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border p-2 fa-14" colSpan={2}>SGST</td>
                                        <td className="border p-2 fa-14 text-end">{NumberFormat(invoiceDetails?.SGST_Total)}</td>
                                    </tr>
                                </>
                            ) : (
                                <tr>
                                    <td className="border p-2 fa-14" colSpan={2}>IGST</td>
                                    <td className="border p-2 fa-14 text-end">{NumberFormat(invoiceDetails?.IGST_Total)}</td>
                                </tr>
                            )}

                            <tr>
                                <td className="border p-2 fa-14" colSpan={2}>Round Off</td>
                                <td className="border p-2 fa-14 text-end">{NumberFormat(invoiceDetails?.Round_off)}</td>
                            </tr>
                            <tr>
                                <td className="border p-2 fa-14" colSpan={2}>Total</td>
                                <td className="border p-2 fa-14 text-end fw-bold">{NumberFormat(invoiceDetails?.Total_Invoice_value)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tax summary table */}
            <table className="table">
                <thead>
                    <tr>
                        <td className="border bg-light fa-14 text-center" rowSpan={2} style={{ verticalAlign: 'middle' }}>HSN / SAC</td>
                        <td className="border bg-light fa-14 text-center" rowSpan={2} style={{ verticalAlign: 'middle' }}>Taxable Value</td>
                        {isEqualNumber(invoiceDetails.IS_IGST, 1) ? (
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
                        {isEqualNumber(invoiceDetails.IS_IGST, 1) ? (
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
                            {invoiceDetails.IS_IGST ? (
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
                        {invoiceDetails.IS_IGST ? (
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
                        <td
                            colSpan={isEqualNumber(invoiceDetails.IS_IGST, 1) ? 5 : 7}
                            className='border fa-13 fw-bold'
                        >
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


const SaleOrderInvoicePrint = ({
    open,
    onClose,
    // single-order mode
    convertedInvoices,
    invoiceCopyCount,
    // bulk mode
    selectedOrders,
}) => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const printRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [companyInfo, setCompanyInfo] = useState({});
    // invoiceGroups: [{ invoice: <invoice_record>, copyCount: N }]
    const [invoiceGroups, setInvoiceGroups] = useState([]);

    // Derive whether we are in bulk mode
    const isBulkMode = Array.isArray(selectedOrders) && selectedOrders.length > 0;

    // Total bill count for summary display
    const totalBills = invoiceGroups.reduce((sum, g) => sum + g.copyCount, 0);

    // Company info 
    useEffect(() => {
        if (!open) return;
        fetchLink({ address: `masters/company?Company_id=${storage?.Company_id}` })
            .then(data => { if (data.success) setCompanyInfo(data?.data[0] ?? {}); })
            .catch(e => console.error(e));
    }, [open]);

    useEffect(() => {
        if (!open) { setInvoiceGroups([]); setError(''); return; }

        let doIdToCopyCount = {};

        if (isBulkMode) {
            for (const order of selectedOrders) {
                const copyCount = Math.max(1, parseInt(order.invoiceCopyCount) || 1);
                for (const inv of (order.ConvertedInvoice ?? [])) {
                    if (inv?.invId) {
                        doIdToCopyCount[inv.invId] = copyCount;
                    }
                }
            }
        } else if (Array.isArray(convertedInvoices) && convertedInvoices.length > 0) {
            const copyCount = Math.max(1, parseInt(invoiceCopyCount) || 1);
            for (const inv of convertedInvoices) {
                if (inv?.invId) doIdToCopyCount[inv.invId] = copyCount;
            }
        }

        const allDoIds = Object.keys(doIdToCopyCount);
        if (allDoIds.length === 0) {
            setError('No converted invoices found for the selected order(s).');
            setInvoiceGroups([]);
            return;
        }

        const fetchAll = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetchLink({
                    address: `sales/salesInvoice/bulkByIds?Do_Ids=${allDoIds.join(',')}`
                });

                if (!res.success || !res.data?.length) {
                    setError('No invoice data returned from server.');
                    setInvoiceGroups([]);
                    return;
                }

                // Build invoiceGroups preserving order
                const groups = res.data.map(invoice => ({
                    invoice,
                    copyCount: doIdToCopyCount[invoice.Do_Id] ?? 1,
                }));
                setInvoiceGroups(groups);

            } catch (e) {
                console.error(e);
                setError('Failed to fetch invoice data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, [open, selectedOrders, convertedInvoices, invoiceCopyCount]);

    const handlePrint = useReactToPrint({ content: () => printRef.current });

    const handleClose = () => {
        setInvoiceGroups([]);
        setError('');
        onClose?.();
    };

    // Summary chip for the dialog title
    const summaryText = (() => {
        if (loading || invoiceGroups.length === 0) return null;
        if (isBulkMode) {
            return `${invoiceGroups.length} invoice(s) · ${totalBills} bill(s) total`;
        }
        const copyCount = Math.max(1, parseInt(invoiceCopyCount) || 1);
        return copyCount > 1 ? `${copyCount} copies` : null;
    })();

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                Invoice Print Preview
                {summaryText && (
                    <Chip
                        label={summaryText}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ fontWeight: 'normal', fontSize: '12px' }}
                    />
                )}
            </DialogTitle>

            <DialogContent>
                {loading && (
                    <div className="d-flex justify-content-center align-items-center py-5">
                        <CircularProgress />
                        <span className="ms-3 text-muted">Fetching invoice data...</span>
                    </div>
                )}

                {!loading && error && (
                    <Alert severity="warning" className="my-3">{error}</Alert>
                )}

                {!loading && !error && invoiceGroups.length === 0 && (
                    <Alert severity="info" className="my-3">
                        No invoices found for the selected order(s).
                    </Alert>
                )}

                {!loading && invoiceGroups.length > 0 && (
                    <div ref={printRef}>
                        {invoiceGroups.map(({ invoice, copyCount }, groupIdx) => {
                            const products = invoice.Products_List ?? [];
                            return Array.from({ length: copyCount }).map((_, copyIdx) => (
                                <InvoicePage
                                    key={`g${groupIdx}-c${copyIdx}`}
                                    invoiceDetails={invoice}
                                    products={products}
                                    companyInfo={companyInfo}
                                    retailerInfo={invoice}
                                    copyIndex={copyIdx}
                                    totalCopies={copyCount}
                                />
                            ));
                        })}
                    </div>
                )}
            </DialogContent>

            <DialogActions>
                <Button startIcon={<Close />} variant='outlined' color='error' onClick={handleClose}>
                    Close
                </Button>
                {!loading && invoiceGroups.length > 0 && (
                    <Button
                        startIcon={<Print />}
                        variant='contained'
                        onClick={handlePrint}
                    >
                        Print{totalBills > 1 ? ` (${totalBills} Bills)` : ''}
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default SaleOrderInvoicePrint;
