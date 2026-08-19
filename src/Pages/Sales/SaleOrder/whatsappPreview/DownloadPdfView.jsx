import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import axios from 'axios'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'


const fmt = (n) => Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const LD  = (d) => d ? new Date(d).toLocaleDateString('en-GB') : '-'

const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten',
  'Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen']
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety']

function n2w(n) {
  if (!n || n === 0) return 'Zero'
  const h = (x) => {
    let r = ''
    if (x >= 100) { r += ones[Math.floor(x / 100)] + ' Hundred '; x %= 100 }
    if (x >= 20)  { r += tens[Math.floor(x / 10)]  + ' '; x %= 10 }
    if (x > 0)    r += ones[x] + ' '
    return r
  }
  let r = '', x = Math.abs(Math.round(n))
  const cr = Math.floor(x / 10000000); x %= 10000000
  const la = Math.floor(x / 100000);   x %= 100000
  const th = Math.floor(x / 1000);     x %= 1000
  if (cr) r += h(cr) + 'Crore '
  if (la) r += h(la) + 'Lakh '
  if (th) r += h(th) + 'Thousand '
  if (x)  r += h(x)
  return r.trim()
}

const taxCalc = (method = 0, amount = 0, pct = 0) => {
  if (method === 0) return amount * (pct / 100)
  if (method === 1) return amount - amount * (100 / (100 + pct))
  return 0
}


const CACHE = {
  get: (k) => {
    try {
      const x = JSON.parse(sessionStorage.getItem(k))
      return x ? x.v : null
    } catch { return null }
  },
  set: (k, v) => {
    try { sessionStorage.setItem(k, JSON.stringify({ v })) } catch {}
  }
}

// Renders a DOM element to a (possibly multi-page) PDF using html2canvas +
// jsPDF directly, replacing html2pdf.js. Paginates automatically when the
// captured content is taller than one page, matching html2pdf.js's default
// auto-pagination behavior.
async function renderElementToPdf(element, { filename, margin = 0.3, orientation = 'portrait', quality = 0.98 }) {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    letterRendering: true,
    backgroundColor: '#ffffff',
  })

  const imgData = canvas.toDataURL('image/jpeg', quality)
  const pdf = new jsPDF({ unit: 'in', format: 'a4', orientation })

  const pageWidth    = pdf.internal.pageSize.getWidth()
  const pageHeight   = pdf.internal.pageSize.getHeight()
  const contentWidth  = pageWidth - margin * 2
  const contentHeight = pageHeight - margin * 2

  const imgWidth  = contentWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let pageIndex  = 0

  pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight)
  heightLeft -= contentHeight

  while (heightLeft > 0) {
    pageIndex += 1
    const position = margin - pageIndex * contentHeight
    pdf.addPage()
    pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight)
    heightLeft -= contentHeight
  }

  pdf.save(filename)
}

export default function DownloadPdfView() {

  const [sp]      = useSearchParams()

  // preview=1 means this page is embedded in an iframe (e.g. the WhatsApp
  // table's Preview popup) rather than opened directly by the customer.
  // In that case we must NOT auto-trigger a PDF download — the page just
  // renders the invoice for the staff member to look at before sending.
  const isPreview = sp.get('preview') === '1'

  useEffect(() => {
    if (isPreview) return // never redirect / show the WhatsApp-app banner in preview mode
    const ua = navigator.userAgent || '';
    const isWhatsApp = /WhatsApp/i.test(ua);
    const isAndroid  = /Android/i.test(ua);
    const isIOS      = /iPhone|iPad|iPod/i.test(ua);

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
            <a href="${currentUrl}" style="
              background:#1976d2; color:#fff; padding:14px 28px;
              border-radius:8px; text-decoration:none; font-size:16px;
            ">Open Invoice</a>
          </div>
        `;
      }
    }
  }, [isPreview]);

  const rawInvNo  = sp.get('Do_Inv_No')  ?? ''
  const companyId = sp.get('Company_id') ?? ''

  const Company = (() => { try { return atob(companyId) } catch { return companyId } })()
  const doInvNo = (() => { try { return atob(rawInvNo).replace(/_/g, '/').trim() } catch { return rawInvNo } })()

  const [companyInfo,        setCompanyInfo]        = useState(null)
  const [companyInfoDetails, setCompanyInfoDetails] = useState(null)
  const [invoice,            setInvoice]            = useState(null)
  const [retailersDetails,   setRetailersDetails]   = useState(null)
  const [loading,            setLoading]            = useState(true)
  const [error,              setError]              = useState('')
  const [downloading,        setDownloading]        = useState(false)

  const printRef = useRef(null)

  const downloadPDF = async () => {
    if (!printRef.current || downloading) return;
    
    setDownloading(true);
    
    try {
      await renderElementToPdf(printRef.current, {
        filename: `Invoice-${invoice?.Do_Inv_No || 'Invoice'}.pdf`,
        margin: 0.3,
        orientation: 'portrait',
        quality: 0.98,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(false);
    }
  }



  useEffect(() => {
    if (!Company || !rawInvNo) {
      setError(!Company ? 'Missing Company_id' : 'Missing Do_Inv_No')
      setLoading(false)
      return
    }

    ;(async () => {
      try {
   
        let compInfo = CACHE.get(`ci_${Company}`)
        if (!compInfo) {
          const r = await fetch(
            `https://pukalfoods.erpsmt.in/api/masters/company/url?Company_id=${Company}`
          )
          const d = await r.json()
          if (!d.success || !d.data) throw new Error('Company info not found')
          compInfo = d.data
          CACHE.set(`ci_${Company}`, compInfo)
        }

        const base = (compInfo.Back_End_API ?? '').replace(/\/+$/, '')


        const [invoiceRes, companyRes] = await Promise.all([
          axios.get(`${base}/sales/getInvoiceDetails`, {
            params:  { Do_Inv_No: doInvNo },
            headers: { Accept: 'application/json' },
          }),
          axios.get(`${base}/masters/company`, {
            headers: { Accept: 'application/json' },
          }),
        ])

        const inv = Array.isArray(invoiceRes?.data?.data)
          ? invoiceRes.data.data[0]
          : (invoiceRes?.data?.data ?? invoiceRes?.data)
        if (!inv) throw new Error('Invoice not found in response')

        const retailerId = inv.Retailer_Id || inv.Retailers_Id


        let retailerDetails = null
        try {
          const rRes = await axios.get(`${base}/masters/retailers/info`, {
            params:  { Retailer_Id: retailerId },
            headers: { Accept: 'application/json' },
          })
           
          const rData = rRes?.data.data ?? rRes?.data.data
          retailerDetails = Array.isArray(rData)
            ? rData.find(r => r.Retailer_Id == retailerId || r.Retailers_Id == retailerId)
            : rData

        } catch {
          const rRes = await axios.get(`${base}/masters/retailers/info`, {
            headers: { Accept: 'application/json' },
          })
     
          const rData = rRes?.data.data ?? rRes?.data.data
          retailerDetails = Array.isArray(rData)
            ? rData.find(r => r.Retailer_Id == retailerId || r.Retailers_Id == retailerId)
            : rData
        }

        setCompanyInfo(compInfo)
        setCompanyInfoDetails(companyRes?.data?.data?.[0] ?? null)
        setRetailersDetails(retailerDetails)
        setInvoice(inv)

      } catch (e) {
        setError(e?.response?.data?.message ?? e.message ?? 'Failed to load data')
      } finally {
        setLoading(false)
      }
    })()
  }, [Company, rawInvNo, doInvNo])


  if (loading) return (
    <div style={S.center}>
      <div style={S.spinner} />
      <p style={{ marginTop: 16, color: '#555' }}>Loading invoice…</p>
    </div>
  )

  if (error || !invoice) return (
    <div style={S.center}>
      <div style={S.errBox}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <p style={{ fontWeight: 700, margin: '8px 0 4px' }}>{error || 'Invoice not found'}</p>
        <p style={{ fontSize: 11, color: '#888' }}>Invoice: {doInvNo} | Company: {companyId}</p>
      </div>
    </div>
  )


  const inv      = invoice
  const products = (inv.Products_List ?? []).filter(p => Number(p.Bill_Qty) > 0)
  const expenses = inv.Expence_Array ?? []
  const staffs   = inv.Staffs_Array  ?? []

  const broker      = staffs.find(s => s.Involved_Emp_Type === 'Broker')    ?? null
  const transporter = staffs.find(s => s.Involved_Emp_Type === 'Transport') ?? null

  const isIGST  = Number(inv.IS_IGST) === 1
  const gstMode = Number(inv.GST_Inclusive)

  const safeProducts = products.map(p => {
    const pct      = isIGST ? (p.Igst || 0) : ((p.Cgst || 0) + (p.Sgst || 0))
    const rate     = Number(p.Item_Rate || 0)
    const itemTax  = taxCalc(gstMode, rate, pct)
    const rateIncl = gstMode === 0 ? rate + itemTax : rate
    const rateExcl = gstMode === 1 ? rate - itemTax : rate
    return {
      ...p,
      Unit_Name:          p.Unit_Name || p.UOM || 'KG',
      Rate_Inclusive_Tax: rateIncl,
      Taxable_Rate:       rateExcl,
    }
  })

  const totalQty     = safeProducts.reduce((s, p) => s + Number(p.Bill_Qty       || 0), 0)
  const totalTaxable = safeProducts.reduce((s, p) => s + Number(p.Taxable_Amount || 0), 0)
  const totalCGST    = safeProducts.reduce((s, p) => s + Number(p.Cgst_Amo       || 0), 0)
  const totalSGST    = safeProducts.reduce((s, p) => s + Number(p.Sgst_Amo       || 0), 0)
  const totalIGST    = safeProducts.reduce((s, p) => s + Number(p.Igst_Amo       || 0), 0)
  const totalTax     = totalCGST + totalSGST + totalIGST
  const invoiceTotal = Number(inv.Total_Invoice_value || 0)
const totalBags = safeProducts.reduce((s, p) => s + Number(p.Bag || 0), 0)

  const hsnMap = new Map()
  safeProducts.forEach(p => {
    const key = p.HSN_Code || 'N/A'
    if (!hsnMap.has(key)) hsnMap.set(key, {
      taxable: 0, cgstRate: p.Cgst || 0, sgstRate: p.Sgst || 0, igstRate: p.Igst || 0,
      cgstAmt: 0, sgstAmt: 0, igstAmt: 0,
    })
    const r = hsnMap.get(key)
    r.taxable += Number(p.Taxable_Amount || 0)
    r.cgstAmt += Number(p.Cgst_Amo      || 0)
    r.sgstAmt += Number(p.Sgst_Amo      || 0)
    r.igstAmt += Number(p.Igst_Amo      || 0)
  })

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  // ✅ Single border styles - no double borders
  const thBase = {
     padding: isMobile ? '2px 3px' : '10px 10px',
    backgroundColor: '#f0f0f0',
    fontWeight: 'bold',
    fontSize: isMobile ? '8px' : '9px',
    whiteSpace: 'nowrap',
    border: '1px solid #000',
    borderCollapse: 'collapse',
    textAlign: 'center',
  }
  const tdBase = {
    padding: isMobile ? '2px 2px' : '10px 10px',
     fontSize: isMobile ? '8px' : '9px',
    border: '1px solid #000',
    borderCollapse: 'collapse',
  }

  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      maxWidth: '1100px',
      margin: '20px auto',
      fontFamily: 'Arial, sans-serif',
    }}>

      {/* Button visible on desktop, hidden on mobile, and hidden in preview mode
          (the Preview popup that embeds this page has its own Send button) */}
      {!isPreview && (
        <div className="no-print" style={{
          textAlign: 'right',
          marginBottom: 10,
          position: 'sticky',
          top: 10,
          zIndex: 100,
        }}>
          {/* <button 
            onClick={downloadPDF} 
            disabled={downloading}
            style={{
              ...S.printBtn,
              width:   isMobile ? '100%' : 'auto',
              padding: isMobile ? '12px 16px' : '8px 16px',
              fontSize: isMobile ? '14px' : 'inherit',
              opacity: downloading ? 0.7 : 1,
              cursor: downloading ? 'wait' : 'pointer',
              display: isMobile ? 'none' : 'block',
            }}
          >
            {downloading ? 'Downloading...' : 'Download Invoice PDF'}
          </button> */}
        </div>
      )}

      {/* PDF Content */}
      <div ref={printRef} style={{
        padding: '5px',
        backgroundColor: '#fff',
        fontSize: '9px',
        lineHeight: '1.2',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>

        <h2 style={{ textAlign: 'center', margin: '0 0 8px', fontSize: '14px' }}>
          {companyInfoDetails?.Company_id === 1 ? 'TAX INVOICE' : 'SALES INVOICE'}
        </h2>

        <div style={{ border: '1px solid #000', marginBottom: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>

            <div style={{
              width: '50%',
              borderRight: '1px solid #000',
              padding: '6px',
            }}>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 3 }}>
                  {companyInfoDetails?.Company_Name || inv.Branch_Name}
                </div>
                <div style={{ wordBreak: 'break-word', fontSize: '8px' }}>{companyInfoDetails?.Company_Address}</div>
                <div style={{ fontSize: '8px' }}>GSTIN/UIN: {companyInfo?.Gst_Number || companyInfoDetails?.Gst_Number || '-'}</div>
                <div style={{ fontSize: '8px' }}>Region: {companyInfoDetails?.Region}, State: {companyInfoDetails?.State}</div>
                <div style={{ fontSize: '8px' }}>Contact: {companyInfoDetails?.Telephone_Number}</div>
              </div>

              <div style={{ borderBottom: '1px solid #000', borderTop: '1px solid #000', paddingBottom: 6, marginBottom: 6, wordBreak: 'break-word', fontSize: '8px' }}>
                <strong>Consignee (Ship to)</strong><br />
                {inv.shippingName || inv.Retailer_Name}<br />
                {inv.shippingDeliveryAddress}<br />
                Phone No: {inv.shippingPhoneNumber}<br />
                GSTIN/UIN: {inv.shippingGstNumber || '-'}<br />
                State Name: {inv.shippingStateName}
              </div>

              <div style={{ wordBreak: 'break-word', fontSize: '8px' }}>
                <strong>Buyer (Bill to)</strong><br />
                {retailersDetails?.retailerTamilName}<br />
                {retailersDetails?.Reatailer_Address}<br />
                Phone No: {retailersDetails?.Mobile_No}<br />
                GSTIN/UIN: {retailersDetails?.Gstno || '-'}<br />
                State Name: {inv.shippingStateName}
              </div>
            </div>

            <div style={{ width: '50%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
                <tbody>
                  {[
                    ['Invoice No.',        inv.Do_Inv_No,               'Dated',              LD(inv.Do_Date)],
                    ['Delivery Note',      '-',                          'Mode/Terms Payment', '-'],
                    ['Reference No.',      inv.Ref_Inv_Number || '-',    'Other References',   broker?.Emp_Name || '-'],
                    ["Buyer's Order No.",  '-',                          'Dated',              '-'],
                    ['Dispatch Doc No.',   '-',                          'Delivery Note Date', '-'],
                    ['Dispatched through', transporter?.Emp_Name || '-', 'Destination',        inv.shippingCityName || '-'],
                    ['LR-RR No.',          '-',                          'Motor Vehicle No.',  '-'],
                  ].map(([l1, v1, l2, v2], i) => (
                    <tr key={i} >
                      <td style={{ ...tdBase, borderRight: '1px solid #000', color: '#555', whiteSpace: 'nowrap', padding: '2px 4px' }}>
                        <strong>{l1}</strong><br />
                        <div style={{ fontWeight: 'bold', fontSize: '9px' }}>{v1}</div>
                      </td>
                      <td style={{ ...tdBase, borderRight: '1px solid #000', color: '#555', whiteSpace: 'nowrap', padding: '2px 4px' }}>
                        <strong>{l2}</strong><br />
                        <div style={{ fontWeight: 'bold', fontSize: '9px' }}>{v2}</div>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={4} style={{ ...tdBase,borderRight: '1px solid #000'}} ><strong>Terms of Delivery:</strong> -</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>


       <div style={{ marginBottom: 8, overflowX: isMobile ? 'visible' : 'auto' }}>
  <table style={{ 
    width: '100%', 
    borderCollapse: 'collapse', 
    tableLayout: 'fixed',
    minWidth: isMobile ? '0' : '700px', 
    fontSize: isMobile ? '6.5px' : '8px',
  }}>
    <thead>
      <tr>
        <th style={{ ...thBase, width: '25px' }}>Sl</th>
        <th style={{ ...thBase, width: '100px', wordBreak: 'break-word' }}>Description of Goods</th>
        <th style={{ ...thBase, width: '45px' }}>HSN/SAC</th>
        <th style={{ ...thBase, width: '35px' }}>Qty</th>
        <th style={{ ...thBase, width: '30px' }}>Bags</th> {/* Added Bags column */}
        <th style={{ ...thBase, width: '45px' }}>Rate (Incl)</th>
        <th style={{ ...thBase, width: '45px' }}>Rate (Excl)</th>
        <th style={{ ...thBase, width: '42px' }}>Amount</th>
      </tr>
    </thead>
    <tbody>
      {safeProducts.length > 0 ? safeProducts.map((p, i) => (
        <tr key={i}>
          <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>{i + 1}</td>
          <td style={{ ...tdBase, wordBreak: 'break-word', padding: '2px 4px' }}>
            {p.Short_Name && p.Short_Name !== '0' && p.Short_Name.trim()
              ? p.Short_Name : p.Product_Name}
          </td>
          <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>{p.HSN_Code || '-'}</td>
          <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>{p.Bill_Qty}</td>
          <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>{p.Bag || 0}</td>
          <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(p.Rate_Inclusive_Tax)}</td>
          <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(p.Taxable_Rate)}</td>
          <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(p.Taxable_Amount)}</td>
        </tr>
      )) : (
        <tr>
          <td colSpan={9} style={{ ...tdBase, textAlign: 'center', padding: '4px' }}>No products found</td>
        </tr>
      )}

      {expenses.map((exp, i) => {
        const val = Number(exp.Expence_Value || 0)
        return (
          <tr key={`exp-${i}`}>
            <td style={{ ...tdBase, padding: '2px 4px' }} />
            <td style={{ ...tdBase, fontStyle: 'italic', wordBreak: 'break-word', padding: '2px 4px' }}>{exp.Expence_Name}</td>
            <td style={{ ...tdBase, padding: '2px 4px' }} />
            <td style={{ ...tdBase, padding: '2px 4px' }} />
            <td style={{ ...tdBase, padding: '2px 4px' }} />
            <td style={{ ...tdBase, padding: '2px 4px' }} />
            <td style={{ ...tdBase, padding: '2px 4px' }} />
            <td style={{ ...tdBase, textAlign: 'right', color: val < 0 ? 'red' : 'black', padding: '2px 4px' }}>
              {fmt(val)}
            </td>
          </tr>
        )
      })}

      {/* TOTAL ROW */}
      <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
        <td style={{ ...tdBase, padding: '2px 4px', textAlign: 'right' }} colSpan={3}>Total</td>
        <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>{totalQty}</td>
        <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>{totalBags}</td>
        <td style={{ ...tdBase, padding: '2px 4px' }}></td>
        <td style={{ ...tdBase, padding: '2px 4px' }}></td>
        <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(invoiceTotal)}</td>
      </tr>
    </tbody>
  </table>
</div>
      

          <div style={{ marginBottom: 8, wordBreak: 'break-word', fontSize: '8px' }}>
            <strong>Amount Chargeable (in words) E. &amp; O.E</strong><br />
            <strong>INR {n2w(Math.round(invoiceTotal))} Only</strong>
          </div>

          {/* TAX TABLE - Single line borders */}
         <div style={{ marginBottom: 10, overflowX: isMobile ? 'visible' : 'auto' }}>
  <table style={{ 
    width: '100%', 
    borderCollapse: 'collapse', 
    tableLayout: isMobile ? 'fixed' : 'auto',
    minWidth: isMobile ? '0' : '550px', 
    fontSize: isMobile ? '6.5px' : '8px',
    border: '1px solid #000',
  }}>
              <thead>
                <tr>
                  <th style={{ ...thBase, width: '60px' }} rowSpan={2}>HSN/SAC</th>
                  <th style={{ ...thBase, width: '70px' }} rowSpan={2}>Taxable Value</th>
                  <th style={{ ...thBase, width: '50px' }} colSpan={2}>{isIGST ? 'IGST' : 'CGST'}</th>
                  {!isIGST && <th style={{ ...thBase, width: '50px' }} colSpan={2}>SGST</th>}
                  <th style={{ ...thBase, width: '70px' }}>Total Tax</th>
                </tr>
                <tr>
                  <th style={{ ...thBase, width: '30px' }}>Rate</th>
                  <th style={{ ...thBase, width: '50px' }}>Amount</th>
                  {!isIGST && <>
                    <th style={{ ...thBase, width: '30px' }}>Rate</th>
                    <th style={{ ...thBase, width: '50px' }}>Amount</th>
                  </>}
                  <th style={{ ...thBase, width: '70px' }} />
                </tr>
              </thead>
              <tbody>
                {Array.from(hsnMap.entries()).length > 0
                  ? Array.from(hsnMap.entries()).map(([hsn, rec], i) => (
                    <tr key={i}>
                      <td style={{ ...tdBase, padding: '2px 4px' }}>{hsn}</td>
                      <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(rec.taxable)}</td>
                      <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>
                        {isIGST ? rec.igstRate + '%' : rec.cgstRate + '%'}
                      </td>
                      <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>
                        {isIGST ? fmt(rec.igstAmt) : fmt(rec.cgstAmt)}
                      </td>
                      {!isIGST && <>
                        <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>{rec.sgstRate}%</td>
                        <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(rec.sgstAmt)}</td>
                      </>}
                      <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>
                        {fmt(rec.cgstAmt + rec.sgstAmt + rec.igstAmt)}
                      </td>
                    </tr>
                  ))
                  : <tr>
                      <td colSpan={isIGST ? 5 : 7} style={{ ...tdBase, textAlign: 'center', padding: '4px' }}>
                        No tax data found
                      </td>
                    </tr>
                }
                <tr style={{  backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                  <td style={{ ...tdBase, padding: '2px 4px' }}>Total</td>
                  <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(totalTaxable)}</td>
                  <td style={{ ...tdBase, padding: '2px 4px' }} />
                  <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>
                    {isIGST ? fmt(totalIGST) : fmt(totalCGST)}
                  </td>
                  {!isIGST && <>
                    <td style={{ ...tdBase, padding: '2px 4px' }} />
                    <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(totalSGST)}</td>
                  </>}
                  <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(totalTax)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
            gap: '0',
            fontSize: '8px',
          }}>
            <div style={{ width: '50%', wordBreak: 'break-word' }}>
              <strong>Tax Amount (in words):</strong><br />
              INR {n2w(Math.round(totalTax))} Only
            </div>
            <div style={{
              width: '50%',
              textAlign: 'right',
              wordBreak: 'break-word',
            }}>
              <strong>Company's Bank Details</strong><br />
              Bank Name: {companyInfoDetails?.Bank_Name || '-'}<br />
              A/c No.: {companyInfoDetails?.Account_Number || '-'}<br />
              Branch &amp; IFSC Code: {companyInfoDetails?.Bank_Branch_Name} {companyInfoDetails?.IFC_Code || '-'}
            </div>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            border: '1px solid #000',
            padding: '10px',
            marginTop: 10,
            gap: '0',
            fontSize: '8px',
          }}>
            <div style={{ width: '60%', wordBreak: 'break-word' }}>
              <strong>Declaration</strong>
              <p style={{ fontStyle: 'italic', marginTop: 3, marginBottom: 0, fontSize: '8px' }}>
                We declare that this invoice shows the actual price of the goods described
                and that all particulars are true and correct.
              </p>
            </div>
            <div style={{ textAlign: 'right', width: '40%' }}>
              <div>for {companyInfoDetails?.Company_Name || inv.Branch_Name}</div>
              <div style={{ marginTop: 30, fontSize: '8px' }}>Authorised Signatory</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 8, padding: 4, fontSize: '7px' }}>
            This is a Computer Generated Invoice
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media print { .no-print { display: none !important; } }
        @media (max-width: 768px) { 
          body { -webkit-text-size-adjust: 100%; }
        }
      `}</style>
    </div>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────
const S = {
  center: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '80vh', padding: '20px', textAlign: 'center',
  },
  spinner: {
    width: 40, height: 40, border: '4px solid #eee',
    borderTop: '4px solid #1a237e', borderRadius: '50%',
    animation: 'spin .8s linear infinite',
  },
  errBox: {
    textAlign: 'center', padding: 28, background: '#fff3f3',
    border: '1px solid #ffcdd2', borderRadius: 8, maxWidth: 400, width: '90%',
  },
  printBtn: {
    background: '#1976d2', color: '#fff', border: 'none',
    cursor: 'pointer', fontWeight: 'bold', borderRadius: 4,
  },
}