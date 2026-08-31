import { useEffect, useRef, useState } from 'react'
import { fetchLink } from '../../../../Components/fetchComponent' // adjust depth to match your tree

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


export default function SaleInvoiceTemplate({ row, companyInfo, onReady, onError }) {
  const [invoice, setInvoice] = useState(null)
  const [retailersDetails, setRetailersDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const readyFiredRef = useRef(false)

  const doInvNo = String(row?.DocumentNumber || '').replace(/_/g, '/').trim()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        if (!doInvNo) throw new Error('Missing Do_Inv_No on row')

        const invResp = await fetchLink({
          address: `sales/getInvoiceDetails?Do_Inv_No=${encodeURIComponent(doInvNo)}`,
          loadingOn: () => {}, loadingOff: () => {},
        })
        const inv = Array.isArray(invResp?.data) ? invResp.data[0] : invResp?.data
        if (!inv) throw new Error('Invoice not found')

        const retailerId = inv.Retailer_Id || inv.Retailers_Id
        let retailerDetails = null
        if (retailerId) {
          try {
            const rResp = await fetchLink({
              address: `masters/retailers/info?Retailer_Id=${retailerId}`,
              loadingOn: () => {}, loadingOff: () => {},
            })
            const rData = rResp?.data
            retailerDetails = Array.isArray(rData)
              ? rData.find((r) => r.Retailer_Id == retailerId || r.Retailers_Id == retailerId)
              : rData
          } catch { /* non-fatal — template renders with blanks */ }
        }

        if (cancelled) return
        setInvoice(inv)
        setRetailersDetails(retailerDetails)
      } catch (e) {
        if (cancelled) return
        setError(e?.message || 'Failed to load invoice')
        onError?.(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [doInvNo])

  // Signal ready once loaded (or errored) and painted — matches Pendingbills'
  // onReady/onError contract so the parent's capture promise resolves/rejects.
  useEffect(() => {
    if (loading || readyFiredRef.current) return
    if (error) return // onError already fired above
    readyFiredRef.current = true
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(() => onReady?.(), 150)
      })
    })
  }, [loading, error])

  if (loading || error || !invoice) return null // nothing to capture yet

  const inv = invoice
  const products = (inv.Products_List ?? []).filter((p) => Number(p.Bill_Qty) > 0)
  const expenses = inv.Expence_Array ?? []
  const staffs   = inv.Staffs_Array  ?? []

  const broker      = staffs.find((s) => s.Involved_Emp_Type === 'Broker')    ?? null
  const transporter = staffs.find((s) => s.Involved_Emp_Type === 'Transport') ?? null

  const isIGST  = Number(inv.IS_IGST) === 1
  const gstMode = Number(inv.GST_Inclusive)

  const safeProducts = products.map((p) => {
    const pct      = isIGST ? (p.Igst || 0) : ((p.Cgst || 0) + (p.Sgst || 0))
    const rate     = Number(p.Item_Rate || 0)
    const itemTax  = taxCalc(gstMode, rate, pct)
    const rateIncl = gstMode === 0 ? rate + itemTax : rate
    const rateExcl = gstMode === 1 ? rate - itemTax : rate
    return {
      ...p,
      Unit_Name: p.Unit_Name || p.UOM || 'KG',
      Rate_Inclusive_Tax: rateIncl,
      Taxable_Rate: rateExcl,
    }
  })

  const totalQty     = safeProducts.reduce((s, p) => s + Number(p.Bill_Qty || 0), 0)
  const totalTaxable = safeProducts.reduce((s, p) => s + Number(p.Taxable_Amount || 0), 0)
  const totalCGST    = safeProducts.reduce((s, p) => s + Number(p.Cgst_Amo || 0), 0)
  const totalSGST    = safeProducts.reduce((s, p) => s + Number(p.Sgst_Amo || 0), 0)
  const totalIGST    = safeProducts.reduce((s, p) => s + Number(p.Igst_Amo || 0), 0)
  const totalTax     = totalCGST + totalSGST + totalIGST
  const invoiceTotal = Number(inv.Total_Invoice_value || 0)
  const totalBags    = safeProducts.reduce((s, p) => s + Number(p.Bag || 0), 0)

  const hsnMap = new Map()
  safeProducts.forEach((p) => {
    const key = p.HSN_Code || 'N/A'
    if (!hsnMap.has(key)) hsnMap.set(key, {
      taxable: 0, cgstRate: p.Cgst || 0, sgstRate: p.Sgst || 0, igstRate: p.Igst || 0,
      cgstAmt: 0, sgstAmt: 0, igstAmt: 0,
    })
    const r = hsnMap.get(key)
    r.taxable += Number(p.Taxable_Amount || 0)
    r.cgstAmt += Number(p.Cgst_Amo || 0)
    r.sgstAmt += Number(p.Sgst_Amo || 0)
    r.igstAmt += Number(p.Igst_Amo || 0)
  })

  const companyInfoDetails = companyInfo?.[0] || null

  const thBase = {
    padding: '10px 10px', backgroundColor: '#f0f0f0', fontWeight: 'bold',
    fontSize: '9px', whiteSpace: 'nowrap', border: '1px solid #000',
    borderCollapse: 'collapse', textAlign: 'center',
  }
  const tdBase = {
    padding: '10px 10px', fontSize: '9px', border: '1px solid #000', borderCollapse: 'collapse',
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#fff' }}>
      <div style={{ padding: '5px', backgroundColor: '#fff', fontSize: '9px', lineHeight: '1.2', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 8px', fontSize: '14px' }}>
          {companyInfoDetails?.Company_id === 1 ? 'TAX INVOICE' : 'SALES INVOICE'}
        </h2>

        <div style={{ border: '1px solid #000', marginBottom: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ width: '50%', borderRight: '1px solid #000', padding: '6px' }}>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: 3 }}>
                  {companyInfoDetails?.Company_Name || inv.Branch_Name}
                </div>
                <div style={{ wordBreak: 'break-word', fontSize: '8px' }}>{companyInfoDetails?.Company_Address}</div>
                <div style={{ fontSize: '8px' }}>GSTIN/UIN: {companyInfoDetails?.Gst_Number || '-'}</div>
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
                    ['Invoice No.', inv.Do_Inv_No, 'Dated', LD(inv.Do_Date)],
                    ['Delivery Note', '-', 'Mode/Terms Payment', '-'],
                    ['Reference No.', inv.Ref_Inv_Number || '-', 'Other References', broker?.Emp_Name || '-'],
                    ["Buyer's Order No.", '-', 'Dated', '-'],
                    ['Dispatch Doc No.', '-', 'Delivery Note Date', '-'],
                    ['Dispatched through', transporter?.Emp_Name || '-', 'Destination', inv.shippingCityName || '-'],
                    ['LR-RR No.', '-', 'Motor Vehicle No.', '-'],
                  ].map(([l1, v1, l2, v2], i) => (
                    <tr key={i}>
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
                    <td colSpan={4} style={{ ...tdBase, borderRight: '1px solid #000' }}><strong>Terms of Delivery:</strong> -</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ marginBottom: 8, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '700px', fontSize: '8px' }}>
              <thead>
                <tr>
                  <th style={{ ...thBase, width: '25px' }}>Sl</th>
                  <th style={{ ...thBase, width: '100px', wordBreak: 'break-word' }}>Description of Goods</th>
                  <th style={{ ...thBase, width: '45px' }}>HSN/SAC</th>
                  <th style={{ ...thBase, width: '35px' }}>Qty</th>
                  <th style={{ ...thBase, width: '30px' }}>Bags</th>
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
                      {p.Short_Name && p.Short_Name !== '0' && p.Short_Name.trim() ? p.Short_Name : p.Product_Name}
                    </td>
                    <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>{p.HSN_Code || '-'}</td>
                    <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>{p.Bill_Qty}</td>
                    <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>{p.Bag || 0}</td>
                    <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(p.Rate_Inclusive_Tax)}</td>
                    <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(p.Taxable_Rate)}</td>
                    <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(p.Taxable_Amount)}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={9} style={{ ...tdBase, textAlign: 'center', padding: '4px' }}>No products found</td></tr>
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
                      <td style={{ ...tdBase, textAlign: 'right', color: val < 0 ? 'red' : 'black', padding: '2px 4px' }}>{fmt(val)}</td>
                    </tr>
                  )
                })}

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

          <div style={{ marginBottom: 10, overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '550px', fontSize: '8px', border: '1px solid #000' }}>
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
                      <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>{isIGST ? rec.igstRate + '%' : rec.cgstRate + '%'}</td>
                      <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{isIGST ? fmt(rec.igstAmt) : fmt(rec.cgstAmt)}</td>
                      {!isIGST && <>
                        <td style={{ ...tdBase, textAlign: 'center', padding: '2px 4px' }}>{rec.sgstRate}%</td>
                        <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(rec.sgstAmt)}</td>
                      </>}
                      <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(rec.cgstAmt + rec.sgstAmt + rec.igstAmt)}</td>
                    </tr>
                  ))
                  : <tr><td colSpan={isIGST ? 5 : 7} style={{ ...tdBase, textAlign: 'center', padding: '4px' }}>No tax data found</td></tr>
                }
                <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                  <td style={{ ...tdBase, padding: '2px 4px' }}>Total</td>
                  <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(totalTaxable)}</td>
                  <td style={{ ...tdBase, padding: '2px 4px' }} />
                  <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{isIGST ? fmt(totalIGST) : fmt(totalCGST)}</td>
                  {!isIGST && <>
                    <td style={{ ...tdBase, padding: '2px 4px' }} />
                    <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(totalSGST)}</td>
                  </>}
                  <td style={{ ...tdBase, textAlign: 'right', padding: '2px 4px' }}>{fmt(totalTax)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, fontSize: '8px' }}>
            <div style={{ width: '50%', wordBreak: 'break-word' }}>
              <strong>Tax Amount (in words):</strong><br />
              INR {n2w(Math.round(totalTax))} Only
            </div>
            <div style={{ width: '50%', textAlign: 'right', wordBreak: 'break-word' }}>
              <strong>Company's Bank Details</strong><br />
              Bank Name: {companyInfoDetails?.Bank_Name || '-'}<br />
              A/c No.: {companyInfoDetails?.Account_Number || '-'}<br />
              Branch &amp; IFSC Code: {companyInfoDetails?.Bank_Branch_Name} {companyInfoDetails?.IFC_Code || '-'}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', border: '1px solid #000', padding: '10px', marginTop: 10, fontSize: '8px' }}>
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
    </div>
  )
}