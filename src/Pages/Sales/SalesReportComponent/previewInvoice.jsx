import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Button, DialogActions } from '@mui/material';
import { Close, Download } from '@mui/icons-material';
import { isEqualNumber, isGraterNumber, LocalDate, NumberFormat, numberToWords, Multiplication, Subraction, Addition, RoundNumber } from '../../../Components/functions';
import { useReactToPrint } from 'react-to-print';
import { fetchLink } from '../../../Components/fetchComponent';


const taxCalc = (method = 1, amount = 0, percentage = 0) => {
    switch (method) {
        case 0:
            return RoundNumber(amount * (percentage / 100));
        case 1:
            return RoundNumber(amount - (amount * (100 / (100 + percentage))));
        case 2:
            return 0;
        default:
            return 0;
    }
}

const InvoiceBillTemplate = ({ orderDetails, orderProducts, download, actionOpen, clearDetails, children, TitleText }) => {



    const [pageSize, setPageSize] = useState('A5');


    // const a4Styles = {
    //     width: '210mm',
    //     minHeight: '297mm',
    //     padding: '10mm',
    //     backgroundColor: '#fff',
    //     fontSize: '7px',
    //     boxSizing: 'border-box',
    //     boxShadow: '0 0 5mm rgba(0,0,0,0.1)',
    //     fontFamily: 'Arial, sans-serif',
    //     lineHeight: 1.2,
    //     overflow: 'visible',
    //     display: 'flex',
    //     flexDirection: 'column',
    //     flexGrow: 1,
    //     paddingTop: '1px',
    //     margin: '0 auto',
    //     '@media print': {
    //         width: '210mm',
    //         height: '297mm',
    //         margin: 0,
    //         padding: '8mm',
    //         boxShadow: 'none',
    //         overflow: 'hidden',
    //         pageBreakAfter: 'avoid',
    //         pageBreakInside: 'avoid'
    //     }
    // };

    // const a5Styles = {
    //     width: '210mm',
    //     minHeight: '148.5mm',
    //     padding: '6mm',
    //     backgroundColor: '#fff',
    //     fontSize: '5px',
    //     boxSizing: 'border-box',
    //     boxShadow: '0 0 5mm rgba(0,0,0,0.1)',
    //     fontFamily: 'Arial, sans-serif',
    //     lineHeight: 1.0,
    //     display: 'flex',
    //     flexDirection: 'column',

    //     flexGrow: 1,
    //     margin: '0 auto',
    //     '@media print': {
    //         width: '148mm',
    //         height: '210mm',
    //         margin: 0,
    //         padding: '5mm',
    //         boxShadow: 'none',
    //         overflow: 'hidden',
    //         pageBreakAfter: 'avoid',
    //         pageBreakInside: 'avoid'
    //     }
    // };



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



    const storage = JSON.parse(localStorage.getItem('user'));
    const [open, setOpen] = useState(false);
    const [retailerInfo, setRetailerInfo] = useState({});
    const [companyInfo, setCompanyInfo] = useState({});
    const printRef = useRef(null);

    const isExclusiveBill = isEqualNumber(orderDetails.GST_Inclusive, 0);
    const isInclusive = isEqualNumber(orderDetails.GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(orderDetails.GST_Inclusive, 2);
    const IS_IGST = isEqualNumber(orderDetails.IS_IGST, 1);

    useEffect(() => {

        fetchLink({
            address: `masters/company?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setCompanyInfo(data?.data[0] ? data?.data[0] : {})
            }
        }).catch(e => console.error(e))

    }, [storage?.Company_id])

    useEffect(() => {
        if (actionOpen) {
            setOpen(true);
        }
    }, [actionOpen])

    useEffect(() => {
        if (orderDetails?.Retailer_Id) {
            fetchLink({
                address: `masters/retailers/info?Retailer_Id=${orderDetails?.Retailer_Id}`
            }).then(data => {
                if (data.success) {
                    setRetailerInfo(data?.data[0] ? data?.data[0] : {})
                }
            }).catch(e => console.error(e))
        }
    }, [orderDetails?.Retailer_Id])

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        if (clearDetails) {
            clearDetails();
        }
    };

    const includedProducts = orderProducts.filter(orderProduct => isGraterNumber(orderProduct?.Bill_Qty, 0));

    const totalValueBeforeTax = orderProducts.reduce((acc, item) => {
        const itemRate = RoundNumber(item?.Item_Rate);
        const billQty = parseInt(item?.Bill_Qty) || 0;

        if (isNotTaxableBill) {
            acc.TotalValue += Multiplication(billQty, itemRate);
            return acc;
        }

        const gstPercentage = IS_IGST ? item?.Igst : Addition(item?.Sgst, item?.Cgst);

        if (isInclusive) {
            const itemTax = taxCalc(1, itemRate, gstPercentage);
            const basePrice = Subraction(itemRate, itemTax);
            acc.TotalTax += Multiplication(billQty, itemTax);
            acc.TotalValue += Multiplication(billQty, basePrice);
        }
        if (isExclusiveBill) {
            const itemTax = taxCalc(0, itemRate, gstPercentage);
            acc.TotalTax += Multiplication(billQty, itemTax);
            acc.TotalValue += Multiplication(billQty, itemRate);
        }

        return acc;
    }, {
        TotalValue: 0,
        TotalTax: 0
    });

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        pageStyle: `
    @page {
      size: ${pageSize === 'A4' ? 'A4' : 'A5'};
      margin-top: 10px;
      margin-right: 0;
      margin-bottom: 0;
      margin-left: 0;
      
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
         margin-top: 10px;
      }

      .MuiDialog-root,
      .MuiDialog-container,
      .MuiPaper-root,
      .MuiDialogTitle-root {
        display: none !important;
      }

    .pagebreak {
        clear: both;
        page-break-after: always;
    }

      .print-content {
        padding-top: 0;
         margin-top: 10px;
      }
    }
  `
    });


    const extraDetails = [
        {
            labelOne: 'Invoice No',
            dataOne: orderDetails?.Do_Inv_No,
            labelTwo: 'Dated',
            dataTwo: LocalDate(orderDetails?.Do_Date),
        },
        {
            labelOne: 'Delivery Note',
            dataOne: '',
            labelTwo: 'Mode/Terms of Payment',
            dataTwo: '',
        },
        {
            labelOne: 'Reference No. & Date',
            dataOne: '',
            labelTwo: 'Other References',
            dataTwo: '',
        },
        {
            labelOne: 'Buyer\'s Order No',
            dataOne: '',
            labelTwo: 'Dated',
            dataTwo: '',
        },
        {
            labelOne: 'Dispatch Doc No',
            dataOne: '',
            labelTwo: 'Delivery Note Date',
            dataTwo: '',
        },
        {
            labelOne: 'Dispatched through',
            dataOne: '',
            labelTwo: 'Destination',
            dataTwo: '',
        },
        {
            labelOne: 'Bill of Lading/LR-RR No',
            dataOne: '',
            labelTwo: 'Motor Vehicle No',
            dataTwo: '',
        },
    ]

    const TaxData = orderProducts?.reduce((data, item) => {
        const HSNindex = data.findIndex(obj => obj.hsnCode == item.HSN_Code);

        const {
            Taxable_Amount, Cgst_Amo, Sgst_Amo, Igst_Amo, HSN_Code,
            Cgst, Sgst, Igst,
        } = item;

        if (HSNindex !== -1) {
            const prev = data[HSNindex];
            const newValue = {
                ...prev,
                taxableValue: prev.taxableValue + Taxable_Amount,
                cgst: Addition(prev.cgst, Cgst_Amo),
                sgst: Addition(prev.sgst, Sgst_Amo),
                igst: Addition(prev.igst, Igst_Amo),
                totalTax: prev.totalTax + Number(orderDetails.IS_IGST ? Igst_Amo : Addition(Cgst_Amo, Sgst_Amo)),
            };

            data[HSNindex] = newValue;
            return data;
        }

        const newEntry = {
            hsnCode: HSN_Code,
            taxableValue: Taxable_Amount,
            cgst: Cgst_Amo,
            cgstPercentage: Cgst,
            sgst: Sgst_Amo,
            sgstPercentage: Sgst,
            igst: Igst_Amo,
            igstPercentage: Igst,
            totalTax: orderDetails.IS_IGST ? Number(Igst_Amo) : Addition(Cgst_Amo, Sgst_Amo),
        };

        return [...data, newEntry];
    }, []);

    const getInlineStyles = () => (pageSize === 'A4' ? a4Styles : a5Styles);

    const handleToggle = () => {
        setPageSize((prev) => (prev === 'A5' ? 'A4' : 'A5'));
    };
    return (
        <>
            <span onClick={handleOpen}>{children}</span>
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
                }}>
                    Order Preview
                </DialogTitle>

                <DialogContent
                    ref={printRef}
                    sx={{
                        padding: 0,
                        margin: 0,
                        overflow: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        '@media print': {
                            overflow: 'visible',
                            display: 'block',
                            height: 'auto',
                            marginTop: '2px'
                        }
                    }}
                >
                    <div
                        style={getInlineStyles()}
                        className="print-container"
                    >
                        <h3 className='text-center mb-2'>{TitleText ?? 'Invoice Details'}</h3>

                        {/* General Info */}
                     <div className="row">
                            <div className="col-6 p-0 border border-bottom-0 border-end-0">
                                <div className="border-bottom p-2">
                                    <p className='m-0 fa-17'>{companyInfo?.Company_Name}</p>
                                    <p className='m-0 fa-14'>Address: {companyInfo?.Company_Address}</p>
                                    <p className='m-0 fa-14'>City: {companyInfo?.Region} - {companyInfo?.Pincode}</p>
                                    {/* <p className='m-0 fa-14'>GSTIN / UIN: {companyInfo?.Gst_Number}</p> */}
                                    <p className='m-0 fa-14'>
  {companyInfo?.Gst_Number || companyInfo?.VAT_TIN_Number ? (
    <>
      GSTIN / UIN: 
      {companyInfo?.Gst_Number ? ` ${companyInfo.Gst_Number}` : ''}
      {companyInfo?.Gst_Number && companyInfo?.VAT_TIN_Number ? ' || ' : ''}
      {companyInfo?.VAT_TIN_Number ? ` ${companyInfo.VAT_TIN_Number}` : ''}
    </>
  ) : (
    <>GSTIN / UIN: Not Available</>
  )}
</p>
                                    <p className='m-0 fa-14'>State: {companyInfo?.State}</p>
                                    <p className='m-0 fa-14'>Code: </p>
                                </div>
                                <div className="p-2">
                                    <p className='m-0 fa-12'>Buyer (Bill to)</p>
                                    <p className='m-0 fa-15'>{retailerInfo?.Retailer_Name}</p>
                                    <p className='m-0 fa-14'>{retailerInfo?.Mobile_No + ' - ' + retailerInfo?.Reatailer_Address}</p>
                                    <p className='m-0 fa-14'>{retailerInfo?.Reatailer_City} - {retailerInfo?.PinCode}</p>
                                    <p className='m-0 fa-14'>GSTIN / UIN: {retailerInfo?.Gstno}</p>
                                    <p className='m-0 fa-14'>State Name: {retailerInfo?.StateGet}</p>
                                    <p className='m-0 fa-14'>Code: </p>
                                </div>
                            </div>
                            <div className="col-6 p-0 border border-bottom-0">
                                <table className="table m-0">
                                    <tbody>
                                        {extraDetails.map((detail, index) => (
                                            <tr key={index}>
                                                <td className="border-end fa-12 p-0 px-1">
                                                    <p className="m-0">{detail.labelOne}</p>
                                                    <p className="m-0">&emsp;{detail.dataOne}</p>
                                                </td>
                                                <td className='fa-12 p-0 px-1'>
                                                    <p className="m-0">{detail.labelTwo}</p>
                                                    <p className="m-0">&emsp;{detail.dataTwo}</p>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td colSpan={2} className='border-0 fa-12 p-0'>
                                                <p className="m-0">Terms of Delivery</p>
                                                <p className="m-0"></p>
                                                <br />
                                                <br />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Product Info */}
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
                                                <p className='m-2 '>Rate</p>
                                                <p className='m-0 '>
                                                    {isEqualNumber(orderDetails.GST_Inclusive, 1) && '(Incl. of Tax)'}
                                                    {isEqualNumber(orderDetails.GST_Inclusive, 2) && '(Tax not applicable)'}
                                                    {isEqualNumber(orderDetails.GST_Inclusive, 0) && '(Excl. of Tax)'}
                                                </p>
                                            </td>
                                            <td className='border bg-light fa-14 text-end'>Amount</td>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {(() => {
                                            const chunkSize = 15;
                                            const productChunks = [];
                                            for (let i = 0; i < includedProducts.length; i += chunkSize) {
                                                productChunks.push(includedProducts.slice(i, i + chunkSize));
                                            }

                                            return productChunks.map((chunk, chunkIndex) => (
                                                <React.Fragment key={chunkIndex}>
                                                    {chunk.map((o, i) => {
                                                        const globalIndex = chunkIndex * chunkSize + i;
                                                        const percentage = (IS_IGST ? o?.Igst_P : o?.Cgst + o?.Sgst) ?? 0;
                                                        const quantity = Number(o?.Bill_Qty || 0);
                                                        const Item_Rate = Number(o?.Item_Rate || 0);
                                                        const itemTax = taxCalc(orderDetails.GST_Inclusive, Item_Rate, percentage);

                                                        return (
                                                            <tr key={globalIndex}>
                                                                <td className='border fa-13'>{globalIndex + 1}</td>
                                                                <td className='border fa-13'>{o?.Product_Name}</td>
                                                                <td className='border fa-13'>{o?.HSN_Code}</td>
                                                                <td className='border fa-13 text-end'>
                                                                    {NumberFormat(quantity)}
                                                                    {o?.UOM && ' (' + o?.UOM + ') '}
                                                                </td>
                                                                <td className='border fa-13 text-end'>
                                                                    {NumberFormat(isEqualNumber(
                                                                        orderDetails.GST_Inclusive, 1
                                                                    ) ? (Item_Rate - itemTax) : Item_Rate)}
                                                                </td>
                                                                <td className='border fa-13 text-end'>
                                                                    {NumberFormat(isEqualNumber(
                                                                        orderDetails.GST_Inclusive, 1
                                                                    ) ? Item_Rate : (Item_Rate + itemTax))}
                                                                </td>
                                                                <td className='border fa-13 text-end'>
                                                                    {NumberFormat(o?.Taxable_Amount)}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}

                                                    {/* Summary section only after last chunk */}
                                                    {chunkIndex === productChunks.length - 1 && (
                                                        <>
                                                            <tr>
                                                                <td
                                                                    className="border p-2"
                                                                    rowSpan={IS_IGST ? 4 : 5}
                                                                    colSpan={4}
                                                                >
                                                                    <p className='m-0 mx-2 p-2 fa-13 fw-bold'>Amount Chargeable (in words):</p>
                                                                    <p className='m-0 fa-13 fw-bold'>&emsp; INR {numberToWords(parseInt(orderDetails?.Total_Invoice_value))} Only.</p>
                                                                </td>
                                                                <td className="border p-2 fa-14" colSpan={2}>Total Taxable Amount</td>
                                                                <td className="border p-2 text-end fa-14">
                                                                    {NumberFormat(totalValueBeforeTax.TotalValue)}
                                                                </td>
                                                            </tr>

                                                            {!IS_IGST ? (
                                                                <>
                                                                    <tr>
                                                                        <td className="border p-2 fa-14" colSpan={2}>CGST</td>
                                                                        <td className="border p-2 text-end fa-14">
                                                                            {NumberFormat(orderDetails?.CSGT_Total)}
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td className="border p-2 fa-14" colSpan={2}>SGST</td>
                                                                        <td className="border p-2 fa-14 text-end">
                                                                            {NumberFormat(orderDetails?.SGST_Total)}
                                                                        </td>
                                                                    </tr>
                                                                </>
                                                            ) : (
                                                                <tr>
                                                                    <td className="border p-2 fa-14" colSpan={2}>IGST</td>
                                                                    <td className="border p-2 fa-14 text-end">
                                                                        {NumberFormat(orderDetails.IGST_Total)}
                                                                    </td>
                                                                </tr>
                                                            )}

                                                            <tr>
                                                                <td className="border p-2 fa-14" colSpan={2}>Round Off</td>
                                                                <td className="border p-2 fa-14 text-end">
                                                                    {NumberFormat(orderDetails?.Round_off)}
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td className="border p-2 fa-14" colSpan={2}>Total</td>
                                                                <td className="border p-2 fa-14 text-end fw-bold">
                                                                    {NumberFormat(orderDetails?.Total_Invoice_value)}
                                                                </td>
                                                            </tr>
                                                        </>
                                                    )}

                                                    {/* Page break after each chunk except last */}
                                                    {chunkIndex < productChunks.length - 1 && (
                                                        <tr style={{
                                                            pageBreakAfter: 'always',
                                                            height: '0',
                                                            visibility: 'hidden',
                                                            border: 'none'
                                                        }}>
                                                            <td colSpan="7" style={{ border: 'none' }}></td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ));
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Tax Table */}
                        <table className="table">
                            <thead>
                                <tr>
                                    <td className="border bg-light fa-14 text-center" rowSpan={2} style={{ verticalAlign: 'middle' }}>HSN / SAC</td>
                                    <td className="border bg-light fa-14 text-center" rowSpan={2} style={{ verticalAlign: 'middle' }}>Taxable Value</td>
                                    {isEqualNumber(orderDetails.IS_IGST, 1) ? (
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
                                    {isEqualNumber(orderDetails.IS_IGST, 1) ? (
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
                                        {orderDetails.IS_IGST ? (
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
                                        <td className="border fa-13 text-end">
                                            {NumberFormat(o?.totalTax)}
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td className="border fa-13 text-end">Total</td>
                                    <td className="border fa-13 text-end fw-bold">
                                        {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.taxableValue), 0))}
                                    </td>
                                    {orderDetails.IS_IGST ? (
                                        <>
                                            <td className="border fa-13 text-end"></td>
                                            <td className="border fa-13 text-end fw-bold">
                                                {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.igst), 0))}
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="border fa-13 text-end"></td>
                                            <td className="border fa-13 text-end fw-bold">
                                                {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.cgst), 0))}
                                            </td>
                                            <td className="border fa-13 text-end"></td>
                                            <td className="border fa-13 text-end fw-bold">
                                                {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.sgst), 0))}
                                            </td>
                                        </>
                                    )}
                                    <td className="border fa-13 text-end fw-bold">
                                        {NumberFormat(TaxData.reduce((sum, item) => sum += Number(item.totalTax), 0))}
                                    </td>
                                </tr>
                                <tr>
                                    <td
                                        colSpan={isEqualNumber(orderDetails.IS_IGST, 1) ? 5 : 7}
                                        className='border fa-13 fw-bold'
                                    >
                                        Tax Amount (in words) : INR &nbsp;
                                        {numberToWords(
                                            parseInt(
                                                TaxData.reduce((sum, item) => sum += Number(item.totalTax), 0)
                                            )
                                        )} only.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="col-12 text-center">
                            <p>This is a Computer Generated Invoice</p>
                        </div>
                    </div>
                </DialogContent>

                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2 }}>
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="pageSizeSwitch"
                            checked={pageSize === 'A4'}
                            onChange={handleToggle}
                        />
                        <label className="form-check-label" htmlFor="pageSizeSwitch">
                            {pageSize} selected
                        </label>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Button
                            startIcon={<Close />}
                            variant="outlined"
                            color="error"
                            onClick={handleClose}
                        >
                            Close
                        </Button>

                        {download && (
                            <Button
                                startIcon={<Download />}
                                variant="outlined"
                                onClick={handlePrint}
                            >
                                Download
                            </Button>
                        )}
                    </div>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default InvoiceBillTemplate;