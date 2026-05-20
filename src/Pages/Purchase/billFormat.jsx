import { numberToWords } from "../../Components/functions";
import { companyDetails } from "../../Components/tablecolumn";


const InvoiceBill = ({ companyInfo, invoieInfo, expencesInfo }) => {

    const getTotal = (arr, colmn) => {
        let count = 0;
        arr.forEach(obj => {
            count += Number(obj[colmn]);
        })
        return count
    }

    return (
        <>

            <div className="d-flex justify-content-between align-items-center ">

                <div className="d-flex">
                    <img src={companyDetails[companyInfo?.Company_Id]?.logo} className="invoiceLogo" alt="company_logo" />

                    <div className="">
                        <p className="mb-0 ">{companyInfo?.Company_Name}</p>
                        <p className="mb-0 text-muted">{companyInfo?.Company_address_1}</p>
                        <p className="mb-0 text-muted fa-14">{companyInfo?.Company_address_2}</p>
                        {companyInfo?.Company_address_3 && <p className="mb-0 text-muted fa-14">{companyInfo?.Company_address_3}</p>}
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table">
                        <tbody>
                            <tr>
                                <td className="p-1 border-0 fa-13">GSTIN</td>
                                <td className="p-1 border-0 fa-13 text-end">{companyInfo?.Company_GSTIN}</td>
                            </tr>
                            <tr>
                                <td className="p-1 border-0 fa-13">PHONE</td>
                                <td className="p-1 border-0 fa-13 text-end">{companyInfo?.Company_Mobile}</td>
                            </tr>
                            <tr>
                                <td className="p-1 border-0 fa-13">FSSAI</td>
                                <td className="p-1 border-0 fa-13 text-end">{companyInfo?.fssai_no}</td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="mb-0 fa-13 d-flex">
                        <span className="flex-grow-1 text-muted"> </span>
                        <span > </span>
                    </p>
                    <p className="mb-0 fa-13 d-flex">
                        <span className="flex-grow-1 text-muted"></span>
                        <span></span>
                    </p>
                    <p className="mb-0 fa-13 d-flex">
                        <span className="flex-grow-1 text-muted"></span>
                        <span></span>
                    </p>
                </div>

            </div>

            {/* to address */}
            <table className="table mb-0 border">
                <tbody>
                    <tr>
                        <td className="border">
                            <p className="fa-13 mb-0">To</p>
                            <p className="fa-13 mb-0 ps-3 fw-bold">{companyInfo?.Customer_name}</p>
                            <p className="fa-13 mb-0 ps-3">{companyInfo?.Customer_Mobile}</p>
                            <p className="fa-13 mb-0 ps-3">GSTIN: {companyInfo?.Customer_GSTIN}</p>
                        </td>
                        <td className="border">
                            <p className="mb-0 d-flex fa-13">
                                Date:
                                <span className="flex-grow-1 ps-2 text-primary">
                                    {companyInfo?.invoice_date
                                        ? new Date(companyInfo?.invoice_date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })
                                        : ''
                                    }
                                </span>
                                <span>{companyInfo?.Bill_Type}</span>
                            </p>
                            <p className="fa-13 mb-0">Bill No: {companyInfo?.invoice_no}</p>
                            <p className="fa-13 mb-0 d-flex">
                                <span className="flex-grow-1">Broker: {companyInfo?.Broker_Name}</span>
                                <span>Transpoter: {companyInfo?.Transporter}</span>
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* invoice items */}
            <div className="table-responsive">
                <table className="table mb-0">
                    <thead>
                        <tr>
                            <th className="fa-13 border">Sno</th>
                            <th className="fa-13 border">Items</th>
                            <th className="fa-13 border">HSN</th>
                            <th className="fa-13 border">GST</th>
                            <th className="fa-13 border">Qty</th>
                            <th className="fa-13 border">Rate</th>
                            <th className="fa-13 border">Bags</th>
                            <th className="fa-13 border">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoieInfo?.map((o, i) => (
                            <tr key={i}>
                                <td className="fa-13 border">{i + 1}</td>
                                <td className="fa-13 border">{o?.stock_item_name}</td>
                                <td className="fa-13 border">{o?.hsn_code}</td>
                                <td className="fa-13 border">{Number(o?.igst) ? o?.igst : Number(o?.cgst) + Number(o.sgst)}</td>
                                <td className="fa-13 border">{Number(o?.bill_qty).toLocaleString('en-IN')}</td>
                                <td className="fa-13 border">{(o?.amount / o?.bill_qty).toLocaleString('en-IN')}</td>
                                <td className="fa-13 border">{Number(o?.bags ? o?.bags : o?.bill_alt_qty).toLocaleString('en-IN')}</td>
                                <td className="fa-13 border">{Number(o?.amount).toLocaleString('en-IN')}</td>
                            </tr>
                        ))}
                        <tr>
                            <td className="fa-13 border" colSpan={4}>
                                <span className="fw-bold">BANK: </span>
                                {companyInfo?.bank_name}
                            </td>
                            <td className="fa-13 border">{getTotal(invoieInfo, 'bill_qty').toLocaleString('en-IN')}</td>
                            <td className="fa-13 border"></td>
                            <td className="fa-13 border">{getTotal(invoieInfo, 'bill_alt_qty').toLocaleString('en-IN')}</td>
                            <td className="fa-13 border">{getTotal(invoieInfo, 'amount').toLocaleString('en-IN')}</td>
                        </tr>
                        <tr>
                            <td className="fa-13 border fw-bold" colSpan={6}>{numberToWords(companyInfo?.total_invoice_value)} Only</td>
                            <td className="fa-13 border" colSpan={2}>
                                {expencesInfo.map((o, i) => (
                                    <p className="d-flex mb-0" key={i}>
                                        <span className="flex-grow-1">{o?.ledger_name}</span>
                                        <span>{Number(o?.amount_value_DR || o?.amount_value_CR).toLocaleString('en-IN')}</span>
                                    </p>
                                ))}
                                <p className="d-flex mb-0">
                                    <span className="flex-grow-1">Net:</span>
                                    <span className="fa-18">{Number(companyInfo?.total_invoice_value).toLocaleString('en-IN')}</span>
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* tax info */}
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th className="border fa-13 text-center" rowSpan={2} style={{ verticalAlign: 'middle' }}>HSN / SAC</th>
                            <th className="border fa-13 text-center" rowSpan={2} style={{ verticalAlign: 'middle' }}>Taxable Value</th>
                            <th className="border fa-13 text-center" colSpan={2}>Central Tax</th>
                            <th className="border fa-13 text-center" colSpan={2}>State Tax</th>
                            <th className="border fa-13 text-center">Total</th>
                        </tr>
                        <tr>
                            <th className="border fa-13 text-center">Rate</th>
                            <th className="border fa-13 text-center">Amount</th>
                            <th className="border fa-13 text-center">Rate</th>
                            <th className="border fa-13 text-center">Amount</th>
                            <th className="border fa-13 text-center">Tax Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoieInfo.map((o, i) => (
                            <tr key={i}>
                                <td className="border fa-13 text-end">{o?.hsn_code}</td>
                                <td className="border fa-13 text-end">{Number(o?.amount).toLocaleString('en-IN')}</td>
                                <td className="border fa-13 text-end">{o?.cgst}</td>
                                <td className="border fa-13 text-end">{(o?.cgst ? (o?.amount / 100) * o?.cgst : 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                <td className="border fa-13 text-end">{o?.sgst}</td>
                                <td className="border fa-13 text-end">{(o?.sgst ? (o?.amount / 100) * o?.sgst : 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                                <td className="border fa-13 text-end">
                                    {(Number((o?.cgst ? (o?.amount / 100) * o?.cgst : 0) + (o?.sgst ? (o?.amount / 100) * o?.sgst : 0))).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td className="border fa-13 text-end">Total</td>
                            <td className="border fa-13 text-end">{getTotal(invoieInfo, 'amount').toLocaleString('en-IN')}</td>
                            <td className="border fa-13 text-end"></td>
                            <td className="border fa-13 text-end">
                                {(() => {
                                    let total = 0;
                                    invoieInfo.forEach(o => {
                                        total += o?.cgst ? (o?.amount / 100) * o?.cgst : 0
                                    });
                                    return total.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                                })()}
                            </td>
                            <td className="border fa-13 text-end"></td>
                            <td className="border fa-13 text-end">
                                {(() => {
                                    let total = 0;
                                    invoieInfo.forEach(o => {
                                        total += o?.sgst ? (o?.amount / 100) * o?.sgst : 0
                                    });
                                    return total.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                                })()}
                            </td>
                            <td className="border fa-13 text-end">
                                {(() => {
                                    let totalCGST = 0;
                                    let totalSGST = 0;
                                    invoieInfo.forEach(o => {
                                        totalCGST += o?.cgst ? (o?.amount / 100) * o?.cgst : 0;
                                        totalSGST += o?.sgst ? (o?.amount / 100) * o?.sgst : 0;
                                    });
                                    const totalCombined = totalCGST + totalSGST;
                                    return totalCombined.toLocaleString('en-IN', { maximumFractionDigits: 2 });
                                })()}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default InvoiceBill;