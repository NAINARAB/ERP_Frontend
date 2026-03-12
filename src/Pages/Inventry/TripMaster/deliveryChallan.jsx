import React from 'react';
import { LocalDate, LocalTime, NumberFormat, numberToWords } from '../../../Components/functions';

const DeliveryChallan = ({ data }) => {
    const {
        challanNo = "",
        date = "",
        company = {},
        recipient = {},
        transport = {},
        items = [],
        totals = {}
    } = data;

    const calculatedTotals = {
        totalBags: items.reduce((sum, item) => sum + (Number(item.bags) || 0), 0),
        totalQty: items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0),
        totalAmount: items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
    };

    const displayTotals = {
        totalBags: totals.totalBags || calculatedTotals.totalBags,
        totalQty: totals.totalQty || NumberFormat(calculatedTotals.totalQty),
        totalAmount: totals.totalAmount || NumberFormat(calculatedTotals.totalAmount),
        amountInWords: totals.amountInWords || numberToWords(Math.round(calculatedTotals.totalAmount)) + " Only"
    };

   
    const companyInfo = company?.lastLocation;   
    const recipientInfo = recipient?.firstLocation; 

    const emptyRowsCount = Math.max(0, 15 - items.length);

    return (
        <div className="delivery-challan-container" style={{
            fontFamily: 'Arial, sans-serif',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#fff'
        }}>
            <style>{`
                .delivery-challan-container table {
                    border-collapse: collapse;
                    width: 100%;
                    margin-bottom: 10px;
                }
                .delivery-challan-container td, 
                .delivery-challan-container th {
                    border: 1px solid #000;
                    padding: 6px 8px;
                    font-size: 12px;
                }
                .delivery-challan-container .text-center { text-align: center; }
                .delivery-challan-container .text-right { text-align: right; }
                .delivery-challan-container .fw-bold { font-weight: bold; }
                .delivery-challan-container .bg-light { background-color: #f5f5f5; }
                .delivery-challan-container .title { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
                .delivery-challan-container .company-name { font-size: 20px; font-weight: bold; }
                .delivery-challan-container .copy-type {
                    border: 2px solid #000;
                    display: inline-block;
                    padding: 5px 20px;
                    font-weight: bold;
                }
                @media print {
                    .delivery-challan-container { padding: 10px; }
                }
            `}</style>

            <div className="text-center">DELIVERY CHALLAN</div>

            <table className="table table-bordered">
                <tbody>
                    <table style={{ width: '100%', tableLayout: 'fixed' }}>
                        <colgroup>
                            {[...Array(8)].map((_, i) => (
                                <col key={i} style={{ width: '12.5%' }} />
                            ))}
                        </colgroup>
                        <tbody>

                          
                            <tr>
                                <td colSpan="6" className="text-center">
                                    <div className="company-name">S.M TRADERS</div>
                                </td>
                                <td colSpan="2" className="text-center">
                                    <span>ORIGINAL / DUPLICATE</span>
                                </td>
                            </tr>

                   
                            <tr>
                                <td colSpan="6" rowSpan="2">
                                   
                                    <div className="text-center">
                                        {typeof companyInfo === 'string'
                                            ? companyInfo 
                                            : companyInfo?.fromAddress || ''}
                                    </div>
                                    <div className="text-center">
                                        GSTIN : {typeof companyInfo === 'string'
                                            ? ''
                                            : companyInfo?.fromGst_No || ''}
                                    </div>
                                    <div className="text-center">
                                        Phone : {typeof companyInfo === 'string'
                                            ? ''
                                            : companyInfo?.fromPhone_No || ''}
                                    </div>
                                </td>
                                <td>Challan No</td>
                                <td>{challanNo}</td>
                            </tr>

                            <tr>
                                <td>Date</td>
                                <td>{date}</td>
                            </tr>

                            
                            <tr>
                                <td colSpan="8" className="text-center">
                                    Reason for Transfer - Branch Transfer / Line Sales / Purchase Return / Job Work
                                </td>
                            </tr>

                            
                            <tr>
                                <td className="fw-bold" colSpan="4">Details of Recipient / Supplier / Consignee</td>
                                <td className="fw-bold" colSpan="4">Mode of Transport: {transport.mode || 'By Road'}</td>
                            </tr>

                          
                            <tr>
                                <td>Name</td>
                                <td colSpan="3">S.M TRADERS</td>
                                <td>Vehicle No</td>
                                <td colSpan="3">{transport.vehicleNo || ''}</td>
                            </tr>

                          
                            <tr>
                                <td>Address</td>
                                <td colSpan="3">
                                
                                    {typeof recipientInfo === 'string'
                                        ? recipientInfo  
                                        : recipientInfo?.toaddress || ''}
                                </td>
                                <td>Driver Name</td>
                                <td colSpan="3">{transport.driverName || ''}</td>
                            </tr>

                            
                            <tr>
                                <td>GSTIN</td>
                                <td colSpan="3">
                                  
                                    {typeof recipientInfo === 'string'
                                        ? ''
                                        : recipientInfo?.toGst_No || ''}
                                </td>
                                <td>Date Supply</td>
                                <td colSpan="3">{transport.date || ''}</td>
                            </tr>

                            {/* ── Recipient Phone | Time of Supply ── */}
                            <tr>
                                <td>Phone</td>
                                <td colSpan="3">
                                    {typeof recipientInfo === 'string'
                                        ? ''
                                        : recipientInfo?.toPhone_No || ''}
                                </td>
                                <td>Time of Supply</td>
                                <td colSpan="3">{transport.time || ''}</td>
                            </tr>

                            {/* ── Place of Supply ── */}
                            <tr>
                                <td></td>
                                <td colSpan="3"></td>
                                <td>Place of Supply</td>
                                <td colSpan="3">{transport.place || ''}</td>
                            </tr>

                            {/* ── State Code ── */}
                            <tr>
                                <td></td>
                                <td colSpan="3"></td>
                                <td>State Code</td>
                                <td colSpan="3">{transport.stateCode || ''}</td>
                            </tr>

                        </tbody>
                    </table>
                </tbody>
            </table>

            {/* ── Items Table ── */}
            <table className="table table-bordered" style={{ border: '2px solid #000' }}>
                <thead>
                    <tr className="bg-light">
                        <th className="text-center" style={{ width: '5%' }}>S.No</th>
                        <th className="text-center" style={{ width: '25%' }}>Description of Goods</th>
                        <th className="text-center" style={{ width: '8%' }}>HSN</th>
                        <th className="text-center" style={{ width: '8%' }}>Rate</th>
                        <th className="text-center" style={{ width: '8%' }}>Bag</th>
                        <th className="text-center" style={{ width: '8%' }}>Qty</th>
                        <th className="text-center" style={{ width: '10%' }}>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, index) => (
                        <tr key={index}>
                            <td className="text-center">{item.sno || index + 1}</td>
                            <td>{item.description || ''}</td>
                            <td className="text-center">{item.hsn || ''}</td>
                            <td className="text-right">{item.rate || 0}</td>
                            <td className="text-right">{NumberFormat(item.bags || 0)}</td>
                            <td className="text-right">{NumberFormat(item.qty || 0)}</td>
                            <td className="text-right">{NumberFormat(item.amount || 0)}</td>
                        </tr>
                    ))}
                    {[...Array(emptyRowsCount)].map((_, index) => (
                        <tr key={`empty-${index}`}>
                            <td className="text-center">{items.length + index + 1}</td>
                            <td></td><td></td><td></td><td></td><td></td>
                            <td className="text-right">0.00</td>
                        </tr>
                    ))}
                    <tr className="fw-bold">
                        <td colSpan="4" className="text-right">TOTAL</td>
                        <td className="text-right">{displayTotals.totalBags}</td>
                        <td className="text-right">{displayTotals.totalQty}</td>
                        <td className="text-right">{displayTotals.totalAmount}</td>
                    </tr>
                </tbody>
            </table>

            {/* ── Amount in Words + Signatory ── */}
            <table className="table table-bordered" style={{ border: '2px solid #000' }}>
                <tbody>
                    <tr>
                        <td className="fw-bold" style={{ padding: '10px' }}>
                            Challan Total Value in Words:
                            <br />
                            {displayTotals.amountInWords}
                        </td>
                        <td style={{ height: '60px' }}>
                            <div>For S.M.Traders</div>
                            <br />
                            <div>Authorised Signatory</div>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div className="text-center" style={{ marginTop: '10px', fontSize: '11px' }}>
                <p>This is a Computer Generated Invoice</p>
            </div>
        </div>
    );
};

export default DeliveryChallan;