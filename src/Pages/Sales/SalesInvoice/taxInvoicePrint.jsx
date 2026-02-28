import React, { useEffect, useState, useRef } from 'react';
import { isEqualNumber, isGraterNumber, LocalDate, NumberFormat, numberToWords, Multiplication, Subraction, Addition, RoundNumber } from '../../../Components/functions';
import { fetchLink } from '../../../Components/fetchComponent';
import { useReactToPrint } from "react-to-print";

const formatCurrency = (val) =>
  Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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


const TaxInvoiceFull = ({ invoice, products, orderDetails, orderProducts, isDialog = false }) => {
    const printRef = useRef();
    const storage = JSON.parse(localStorage.getItem('user') || '{}');

    const [retailerInfo, setRetailerInfo] = useState({});
    const [companyInfo, setCompanyInfo] = useState({});

    const useProcessedData = invoice?.orderDetails && invoice?.orderProducts;
    
    const [processedInvoice, setProcessedInvoice] = useState({});
    const [processedProducts, setProcessedProducts] = useState([]);

    const safeInvoice = useProcessedData ? processedInvoice : (invoice || {});
    const safeProducts = useProcessedData ? processedProducts : (Array.isArray(invoice?.Products_List) ? invoice?.Products_List : []);


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
    if (!invoice?.Retailer_Id) return;

    fetchLink({
        address: `masters/retailers/info?Retailer_Id=${invoice?.Retailer_Id}`
    })
    .then(data => {
        if (data?.success) {
            setRetailerInfo(data?.data?.[0] || {});
        }
    })
    .catch(e => console.error('Error fetching retailer:', e));

}, [invoice?.Retailer_Id]);


    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Invoice-${safeInvoice?.Do_Inv_No || safeInvoice?.So_Id || 'Invoice'}`,
        pageStyle: `
            @page {
                size: A4 portrait;
                margin: 10mm;
            }
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                .no-print {
                    display: none !important;
                }
                table {
                    page-break-inside: auto;
                }
                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
            }
        `
    });

 

    useEffect(() => {
        if (useProcessedData && orderDetails && orderProducts && Object.keys(retailerInfo).length > 0 && Object.keys(companyInfo).length > 0) {
            const IS_IGST = isEqualNumber(orderDetails?.IS_IGST, 1);

            const includedProducts = orderProducts.filter(op => isGraterNumber(op?.Bill_Qty, 0));
            
            const processedInv = {
                Company_Name: companyInfo?.Company_Name,
                Company_Address: companyInfo?.Company_Address,
                Company_GSTIN: companyInfo?.Gst_Number || companyInfo?.VAT_TIN_Number,
                Company_State: companyInfo?.State,
                Company_StateCode: companyInfo?.StateCode || '',
                Company_Phone: companyInfo?.Phone_Number,
                Consignee_Name: retailerInfo?.Retailer_Name,
                Consignee_Address: retailerInfo?.Reatailer_Address,
                Consignee_Pincode: retailerInfo?.PinCode,
                Consignee_Phone: retailerInfo?.Mobile_No,
                Consignee_GSTIN: retailerInfo?.Gstno,
                Consignee_State: retailerInfo?.StateGet,
                Consignee_StateCode: retailerInfo?.StateCode,

                Buyer_Name: retailerInfo?.Retailer_Name,
                Buyer_Address: retailerInfo?.Reatailer_Address,
                Buyer_Pincode: retailerInfo?.PinCode,
                Buyer_Phone: retailerInfo?.Mobile_No,
                Buyer_GSTIN: retailerInfo?.Gstno,
                Buyer_State: retailerInfo?.StateGet,
                Buyer_StateCode: retailerInfo?.StateCode,

     
                Do_Inv_No: orderDetails?.So_Id,
                Do_Date: LocalDate(orderDetails?.So_Date),
                Delivery_Note: orderDetails?.Delivery_Note || '',
                Vehicle_No: orderDetails?.Vehicle_No || '',
                Destination: orderDetails?.Destination || '',
                Terms_of_Delivery: orderDetails?.Terms_of_Delivery || '',

           
                Bank_Name: companyInfo?.Bank_Name,
                Bank_Account: companyInfo?.Bank_Account,
                IFSC_Code: companyInfo?.IFSC_Code,

         
                IS_IGST: orderDetails?.IS_IGST,
                GST_Inclusive: orderDetails?.GST_Inclusive,

              
                Total_Invoice_value: orderDetails?.Total_Invoice_value,
                Round_off: orderDetails?.Round_off,
                CSGT_Total: orderDetails?.CSGT_Total,
                SGST_Total: orderDetails?.SGST_Total,
                IGST_Total: orderDetails?.IGST_Total,
            };

    
            const processedProds = includedProducts.map((product) => {
                const percentage = (IS_IGST ? product?.Igst_P : (product?.Cgst + product?.Sgst)) ?? 0;
                const quantity = Number(product?.Bill_Qty || 0);
                const Item_Rate = Number(product?.Item_Rate || 0);
                const itemTax = taxCalc(orderDetails.GST_Inclusive, Item_Rate, percentage);

                let rateInclusiveTax = Item_Rate;
                if (isEqualNumber(orderDetails.GST_Inclusive, 0)) {
                    rateInclusiveTax = Item_Rate + itemTax;
                } else if (isEqualNumber(orderDetails.GST_Inclusive, 1)) {
                    rateInclusiveTax = Item_Rate;
                } else {
                    rateInclusiveTax = Item_Rate;
                }

                return {
                    Product_Name: product?.Product_Name,
                    HSN_Code: product?.HSN_Code,
                    Bill_Qty: quantity,
                    Unit: product?.Unit_Name || '',
                    Item_Rate: Item_Rate,
                    Taxable_Rate: isEqualNumber(orderDetails.GST_Inclusive, 1) ? (Item_Rate - itemTax) : Item_Rate,
                    Rate_Inclusive_Tax: rateInclusiveTax,
                    Taxable_Amount: product?.Taxable_Amount || 0,
                    Cgst: product?.Cgst || 0,
                    Sgst: product?.Sgst || 0,
                    Igst: product?.Igst || 0,
                    Cgst_Amo: product?.Cgst_Amo || 0,
                    Sgst_Amo: product?.Sgst_Amo || 0,
                    Igst_Amo: product?.Igst_Amo || 0,
                };
            });

            setProcessedInvoice(processedInv);
            setProcessedProducts(processedProds);
        }
    }, [useProcessedData, orderDetails, orderProducts, retailerInfo, companyInfo]);


        const expenseArray = safeInvoice?.Expence_Array || [];

    const totalExpense = expenseArray.reduce((sum, exp) => {
        const debit = Number(exp?.Expence_Value_DR || 0);
        const credit = Number(exp?.Expence_Value_CR || 0);
        return sum + (debit - credit);
    }, 0);


      const Staffs_Arrays = safeInvoice?.Staffs_Array || [];

    const broker = Staffs_Arrays.find(
  staff => staff?.Involved_Emp_Type == "Broker"
);

const transporter = Staffs_Arrays.find(
  staff => staff?.Involved_Emp_Type == "Transport"
);

    const totalQty = safeProducts.reduce((s, p) => s + (p.Bill_Qty || 0), 0);
    const totalTaxable = safeProducts.reduce((s, p) => s + (p.Taxable_Amount || 0), 0);
    const totalCGST = safeProducts.reduce((s, p) => s + (p.Cgst_Amo || 0), 0);
    const totalSGST = safeProducts.reduce((s, p) => s + (p.Sgst_Amo || 0), 0);
    const totalIGST = safeProducts.reduce((s, p) => s + (p.Igst_Amo || 0), 0);
    const totalTax = totalCGST + totalSGST + totalIGST;
    const invoiceTotal = totalTaxable + totalTax +totalExpense;
    const isIGST = safeInvoice?.IS_IGST === 1;


    const hsnMap = new Map();
    safeProducts.forEach((p) => {
        const hsn = p.HSN_Code || '';
        if (!hsnMap.has(hsn)) {
            hsnMap.set(hsn, {
                taxable: 0,
                cgstRate: p.Cgst || 0,
                sgstRate: p.Sgst || 0,
                igstRate: p.Igst || 0,
                cgstAmt: 0,
                sgstAmt: 0,
                igstAmt: 0,
            });
        }
        const rec = hsnMap.get(hsn);
        rec.taxable += p.Taxable_Amount || 0;
        rec.cgstAmt += p.Cgst_Amo || 0;
        rec.sgstAmt += p.Sgst_Amo || 0;
        rec.igstAmt += p.Igst_Amo || 0;
    });

   
    const borderStyle = {
        border: '1px solid #000',
    };

    const borderRight = {
        borderRight: '1px solid #000'
    };

    const borderBottom = {
        borderBottom: '1px solid #000'
    };

    const borderTop = {
        borderTop: '1px solid #000'
    };

    const borderLeft = {
        borderLeft: '1px solid #000'
    };

    if (useProcessedData && (!Object.keys(retailerInfo).length || !Object.keys(companyInfo).length || !processedInvoice.Company_Name)) {
        return <div style={{ padding: '20px', border: '2px solid #ccc' }}>Loading invoice data...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '1100px', margin: isDialog ? '0 auto' : '20px auto' }}>
            <div className="no-print" style={{ textAlign: 'right', margin: '10px' }}>
                <button
                    onClick={handlePrint}
                    style={{
                        padding: '8px 16px',
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    Print Invoice
                </button>
            </div>

           <div
  ref={printRef}
  style={{
    // border: '2px solid #000',
    padding: '10px',
    backgroundColor: '#fff',
    fontSize: '11px',
    lineHeight: '1.3'
  }}
>
                {companyInfo?.Company_id==4 ? (<h2 style={{ textAlign: "center", margin: 0 }}>
  TAX INVOICE
</h2>) : <h2 style={{ textAlign: "center", margin: 0 }}>
  Sales Invoice
</h2>} 
           
<div style={{ ...borderStyle, marginBottom: '15px' }}>


  <div style={{ display: 'flex' }}>

    <div style={{ width: '50%', ...borderRight, padding: '10px' }}>

    
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
          {companyInfo.Company_Name }
        </div>
        <div>{(companyInfo.Company_Address)}</div>
        <div>GSTIN/UIN: {companyInfo.VAT_TIN_Number }</div>
        <div>
          Region : {companyInfo.Region }, 
          State : {companyInfo.State }
        </div>
        <div>Contact : {companyInfo.Telephone_Number}</div>
      </div>

      
      <div style={{ ...borderBottom,...borderTop, paddingBottom: '10px', marginBottom: '8px' }}>
        <strong>Consignee (Ship to) </strong><br />
    {safeInvoice.shippingName ? safeInvoice.shippingName : retailerInfo.Retailer_Name}
<br />
{safeInvoice.shippingDeliveryAddress ? safeInvoice.shippingDeliveryAddress : retailerInfo.Reatailer_Address} <br/>
        Phone No: {safeInvoice.Mobile_No ? safeInvoice.Mobile_No :retailerInfo.Mobile_No} <br/>
        GSTIN/UIN : {safeInvoice.shippingGstNumber ? safeInvoice.shippingGstNumber : retailerInfo.Gstno}<br />

        State Name : {safeInvoice.shippingStateName ? safeInvoice.shippingStateName : retailerInfo.StateGet}
      </div>

      <div>
        <strong>Buyer (Bill to)</strong><br />
        {retailerInfo.Retailer_Name}<br />
        {retailerInfo.Reatailer_Address}<br />
        {/* Pincode:- {retailerInfo.Buyer_Pincode}<br /> */}
        Phone No: {retailerInfo.Mobile_No}<br />
        GSTIN/UIN : {retailerInfo.Gstno}<br />
        State Name : {retailerInfo.StateGet}
   
      </div>

    </div>


    <div style={{ width: '50%' }}>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>

          <tr>
            <td style={{ padding: '6px', ...borderRight, ...borderBottom }}>
              <strong>Invoice No.</strong><br />
              {safeInvoice.Do_Inv_No}
            </td>
            <td style={{ padding: '6px', ...borderBottom }}>
              <strong>Dated</strong><br />
              {safeInvoice.Do_Date?.split("T")[0]}
            </td>
          </tr>

          <tr>
            <td style={{ padding: '6px', ...borderRight, ...borderBottom }}>
              <strong>Delivery Note</strong><br />
              {safeInvoice.Delivery_Note}
            </td>
            <td style={{ padding: '6px', ...borderBottom }}>
              <strong>Mode/Terms of Payment</strong><br />
              {safeInvoice.Terms_of_Delivery }
            </td>
          </tr>

          <tr>
            <td style={{ padding: '6px', ...borderRight, ...borderBottom }}>
              <strong>Reference No & Date</strong><br />
              {safeInvoice.Reference_No}
            </td>
            <td style={{ padding: '6px', ...borderBottom }}>
              <strong>Other References</strong><br />
       
              {broker?.Emp_Name}
            </td>
          </tr>

          <tr>
            <td style={{ padding: '6px', ...borderRight, ...borderBottom }}>
              <strong>Buyer's Order No</strong><br />
              {safeInvoice.Buyer_Order_No}
            </td>
            <td style={{ padding: '6px', ...borderBottom }}>
              <strong>Dated</strong><br />
              {safeInvoice.Buyer_Order_Date}
            </td>
          </tr>

          <tr>
            <td style={{ padding: '6px', ...borderRight, ...borderBottom }}>
              <strong>Dispatch Doc No</strong><br />
              {safeInvoice.Dispatch_Doc_No}
            </td>
            <td style={{ padding: '6px', ...borderBottom }}>
              <strong>Delivery Note Date</strong><br />
              {safeInvoice.Delivery_Note_Date}
            </td>
          </tr>

          <tr>
            <td style={{ padding: '6px', ...borderRight, ...borderBottom }}>
              <strong>Dispatched through</strong><br />
              {transporter?.Emp_Name || '-'}
              {/* {JSON.stringify(transporter)} */}
            </td>
            <td style={{ padding: '6px', ...borderBottom }}>
              <strong>Destination</strong><br />
              {safeInvoice.Destination}
            </td>
          </tr>

          <tr>
            <td style={{ padding: '6px', ...borderRight,...borderBottom}}>
              <strong>Bill of Lading/LR-RR No.</strong><br />
              {safeInvoice.LR_No || '-'}
            </td>
            <td style={{ padding: '6px',...borderBottom }}>
              <strong>Motor Vehicle No.</strong><br />
              {safeInvoice.Vehicle_No }
            </td>
          </tr>
  <tr>
            <td style={{ padding: '6px' }}>
              <strong>Terms of Delivery</strong><br />
              {safeInvoice.LR_No }
            </td>
          </tr>
        </tbody>
      </table>

    </div>

  </div>
           <div style={{ ...borderStyle, marginBottom: '15px',  lineHeight: '1' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={borderBottom}>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }}>Sl</th>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }}>Description of Goods</th>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }}>HSN/SAC</th>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }}>Quantity</th>
                                  <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }}>Bags</th>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }}>Rate (Incl. Tax)</th>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }}>Rate (Excl. Tax)</th>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }}>Per</th>
                                <th style={{ padding: '8px', backgroundColor: '#f0f0f0' }}>􀄫Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {safeProducts.length > 0 ? (
                                safeProducts.map((p, idx) => (
                                    <tr key={idx} style={idx < safeProducts.length - 1 ? [] : {}}>
                                        <td style={{ padding: '8px', ...borderRight, textAlign: 'center' }}>{idx + 1}</td>
                                        <td style={{ padding: '8px', ...borderRight }}>{p.Short_Name ? p.Short_Name : p.Product_Name}</td>
                                        <td style={{ padding: '8px', ...borderRight, textAlign: 'center' }}>{p.HSN_Code}</td>
                                        <td style={{ padding: '8px', ...borderRight, textAlign: 'center' }}>{p.Bill_Qty} {p.Unit_Name || ''}</td>
                                        <td style={{ padding: '8px', ...borderRight, textAlign: 'center' }}>{p.Bag}</td>
                                        <td style={{ padding: '8px', ...borderRight, textAlign: 'center' }}>{formatCurrency(p.Rate_Inclusive_Tax || p.Item_Rate || 0)}</td>
                                        <td style={{ padding: '8px', ...borderRight, textAlign: 'center' }}>{formatCurrency(p.Taxable_Rate || 0)}</td>
                                        <td style={{ padding: '8px', ...borderRight, textAlign: 'center' }}>{p.Unit_Name || 'KG'}</td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(p.Taxable_Amount || 0)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td style={{ padding: '8px', textAlign: 'center' }} colSpan="8">No products found</td>
                                </tr>
                            )}
                            
                            {/* Tax rows */}
                            {!isIGST && totalCGST > 0 && (
                                <tr >
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}>CGST</td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(totalCGST)}</td>
                                </tr>
                            )}
                            {!isIGST && totalSGST > 0 && (
                                <tr >
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}>SGST</td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(totalSGST)}</td>
                                </tr>
                            )}
                            {isIGST && totalIGST > 0 && (
                                <tr >
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}>IGST</td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', ...borderRight }}></td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(totalIGST)}</td>
                                </tr>
                            )}

                                {expenseArray.length > 0 &&
                                expenseArray.map((exp, index) => {
                                    const debit = Number(exp?.Expence_Value_DR || 0);
                                    const credit = Number(exp?.Expence_Value_CR || 0);
                                    const netAmount = debit - credit;

                                    return (
                                        <tr key={`expense-${index}`}>
                                            <td style={{ padding: '8px', ...borderRight }}></td>
                                            <td style={{ padding: '8px', ...borderRight }}>{exp?.Expence_Name}</td>
                                            <td style={{ padding: '8px', ...borderRight }}></td>
                                            <td style={{ padding: '8px', ...borderRight }}></td>
                                            <td style={{ padding: '8px', ...borderRight }}></td>
                                            <td style={{ padding: '8px', ...borderRight }}></td>
                                            <td style={{ padding: '8px', ...borderRight }}></td>
                                             <td style={{ padding: '8px',...borderRight }}></td>
                                           <td
                                         style={{
                                           padding: '8px',
                                           textAlign: 'right',
                                           color: netAmount < 0 ? 'red' : 'black'
                                         }}
                                       >
                                         {formatCurrency(netAmount)}
                                       </td>
                                        </tr>
                                    );
                                })}
                            
                            <tr style={{ ...borderTop, backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                                <td style={{ padding: '8px', ...borderRight }} colSpan="3">Total</td>
                                <td style={{ padding: '8px', ...borderRight, textAlign: 'right' }}>{totalQty} KG</td>
                                <td style={{ padding: '8px', ...borderRight }}></td>
                                <td style={{ padding: '8px', ...borderRight }}></td>
                                 <td style={{ padding: '8px', ...borderRight }}></td>
                                <td style={{ padding: '8px', ...borderRight }}></td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(invoiceTotal)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                  <div style={{ marginBottom: '15px' }}>
                    <strong>Amount Chargeable (in words) E. & O.E</strong><br />
                    <strong>INR {numberToWords(Math.round(invoiceTotal))} Only</strong>
                </div>

                <div style={{ ...borderStyle, marginBottom: '15px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={borderBottom}>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }} rowSpan="2">HSN/SAC</th>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }} rowSpan="2">Taxable Value</th>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }} colSpan="2">CGST</th>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }} colSpan="2">{isIGST ? 'IGST' : 'SGST/UTGST'}</th>
                                <th style={{ padding: '8px', backgroundColor: '#f0f0f0' }}>Total Tax Amount</th>
                            </tr>
                            <tr style={borderBottom}>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }}>Rate</th>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }}>Amount</th>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }}>Rate</th>
                                <th style={{ padding: '8px', ...borderRight, backgroundColor: '#f0f0f0' }}>Amount</th>
                                <th style={{ padding: '8px', backgroundColor: '#f0f0f0' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from(hsnMap.entries()).length > 0 ? (
                                Array.from(hsnMap.entries()).map(([hsn, rec], idx) => (
                                    <tr key={idx} style={idx < Array.from(hsnMap.entries()).length - 1 ? borderBottom : {}}>
                                        <td style={{ padding: '8px', ...borderRight }}>{hsn}</td>
                                        <td style={{ padding: '8px', ...borderRight, textAlign: 'right' }}>{formatCurrency(rec.taxable)}</td>
                                        <td style={{ padding: '8px', ...borderRight, textAlign: 'center' }}>{!isIGST ? rec.cgstRate + '%' : '-'}</td>
                                        <td style={{ padding: '8px', ...borderRight, textAlign: 'right' }}>{!isIGST ? formatCurrency(rec.cgstAmt) : '-'}</td>
                                        <td style={{ padding: '8px', ...borderRight, textAlign: 'center' }}>{isIGST ? rec.igstRate + '%' : rec.sgstRate + '%'}</td>
                                        <td style={{ padding: '8px', ...borderRight, textAlign: 'right' }}>{isIGST ? formatCurrency(rec.igstAmt) : formatCurrency(rec.sgstAmt)}</td>
                                        <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(rec.cgstAmt + rec.sgstAmt + rec.igstAmt)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td style={{ padding: '8px', textAlign: 'center' }} colSpan="7">No tax data found</td>
                                </tr>
                            )}
                            
                            <tr style={{ ...borderTop, backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                                <td style={{ padding: '8px', ...borderRight }}>Total</td>
                                <td style={{ padding: '8px', ...borderRight, textAlign: 'right' }}>{formatCurrency(totalTaxable)}</td>
                                <td style={{ padding: '8px', ...borderRight }}></td>
                                <td style={{ padding: '8px', ...borderRight, textAlign: 'right' }}>{formatCurrency(totalCGST)}</td>
                                <td style={{ padding: '8px', ...borderRight }}></td>
                                <td style={{ padding: '8px', ...borderRight, textAlign: 'right' }}>{isIGST ? formatCurrency(totalIGST) : formatCurrency(totalSGST)}</td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>{formatCurrency(totalTax)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

           
</div>
   
       

              
              <div style={{  }}>
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>

    <div style={{ width: '50%' }}>
      <strong>Tax Amount (in words) :</strong><br />
      INR {numberToWords(Math.round(totalTax))} Only
    </div>

    <div style={{ width: '50%', textAlign: 'right' }}>
      <strong>Company's Bank Details</strong><br />
      Bank Name : {companyInfo.Bank_Name}<br />
      A/c No. : {companyInfo.Account_Number}<br />
      Branch & IFSC Code : {companyInfo.IFC_Code }
    </div>

  </div>
</div>

                <div style={{ display: 'flex', justifyContent: 'space-between',...borderStyle, padding: '15px' }}>
                    <div style={{ width: '60%' }}>
                        <strong>Declaration</strong>
                        <p style={{ fontStyle: 'italic', marginTop: '5px' }}>
                            We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div>for {safeInvoice.Company_Name}</div>
                        <div style={{ marginTop: '40px' }}>Authorised Signatory</div>
                    </div>
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '15px', padding: '8px' }}>
                    <p style={{ margin: '0' }}>This is a Computer Generated Invoice</p>
                </div>
            </div>
        </div>
    );
};

export default TaxInvoiceFull;

