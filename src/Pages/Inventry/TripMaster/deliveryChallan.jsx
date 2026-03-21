import React, { useEffect, useState } from 'react';
import { LocalDate, LocalTime, NumberFormat, numberToWords } from '../../../Components/functions';
import { fetchLink } from '../../../Components/fetchComponent';
import { companyDetails } from '../../../Components/tablecolumn';

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
    const localData = localStorage.getItem("user");
    let companyId = null;

    if (localData) {
        try {
            const parsedData = JSON.parse(localData);
            companyId = parsedData.Company_id;
        } catch (error) {
            console.error("Error parsing user data:", error);
        }
    }
    
    const [CompanyDetails, setCompanyDetails] = useState([]);

    useEffect(() => {
        if (companyId) {
            fetchLink({
                address: `masters/company/url?Company_id=${companyId}`,
            }).then(data => {
                if (data.success) {
                  
                    setCompanyDetails(data.data);
                }
            }).catch(e => console.error(e));
        }
    }, [companyId]);

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

            {/* Main Info Table - Fixed nested table issue */}
            <table className="table table-bordered" style={{ width: '100%', tableLayout: 'fixed' }}>
                <colgroup>
                    {[...Array(8)].map((_, i) => (
                        <col key={i} style={{ width: '12.5%' }} />
                    ))}
                </colgroup>
                <tbody>
                    {/* Row 1: Company Name & Copy Type */}
                    <tr>
                        <td colSpan="6" className="text-center">
                            <div className="company-name">{CompanyDetails?.Company_Name}</div>
                        </td>
                        <td colSpan="2" className="text-center">
                            <span>ORIGINAL / DUPLICATE</span>
                        </td>
                    </tr>

                    {/* Row 2: Company Address & Challan No */}
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
                        <td className="fw-bold">Challan No</td>
                        <td>{challanNo}</td>
                    </tr>

                    {/* Row 3: Date */}
                    <tr>
                        <td className="fw-bold">Date</td>
                        <td>{date}</td>
                    </tr>

                    {/* Row 4: Reason for Transfer */}
                    <tr>
                        <td colSpan="8" className="text-center">
                            Reason for Transfer - Branch Transfer / Line Sales / Purchase Return / Job Work
                        </td>
                    </tr>

                    {/* Row 5: Details of Recipient & Mode of Transport */}
                    <tr>
                        <td className="fw-bold" colSpan="4">Details of Recipient / Supplier / Consignee</td>
                        <td className="fw-bold" colSpan="4">Mode of Transport: {transport.mode || 'By Road'}</td>
                    </tr>

                    {/* Row 6: Name & Vehicle No */}
                    <tr>
                        <td className="fw-bold">Name</td>
                        <td colSpan="3">{CompanyDetails?.Company_Name}</td>
                        <td className="fw-bold">Vehicle No</td>
                        <td colSpan="3">{transport.vehicleNo || ''}</td>
                    </tr>

                    {/* Row 7: Address & Driver Name */}
                    <tr>
                        <td className="fw-bold">Address</td>
                        <td colSpan="3">
                            {typeof recipientInfo === 'string'
                                ? recipientInfo  
                                : recipientInfo?.toaddress || ''}
                        </td>
                        <td className="fw-bold">Driver Name</td>
                        <td colSpan="3">{transport.driverName || ''}</td>
                    </tr>

                    {/* Row 8: GSTIN & Date Supply */}
                    <tr>
                        <td className="fw-bold">GSTIN</td>
                        <td colSpan="3">
                            {typeof recipientInfo === 'string'
                                ? ''
                                : recipientInfo?.toGst_No || ''}
                        </td>
                        <td className="fw-bold">Date Supply</td>
                        <td colSpan="3">{transport.date || ''}</td>
                    </tr>

                    {/* Row 9: Phone & Time of Supply */}
                    <tr>
                        <td className="fw-bold">Phone</td>
                        <td colSpan="3">
                            {typeof recipientInfo === 'string'
                                ? ''
                                : recipientInfo?.toPhone_No || ''}
                        </td>
                        <td className="fw-bold">Time of Supply</td>
                        <td colSpan="3">{transport.time || ''}</td>
                    </tr>

                    {/* Row 10: Place of Supply */}
                    <tr>
                        <td className="fw-bold"></td>
                        <td colSpan="3"></td>
                        <td className="fw-bold">Place of Supply</td>
                        <td colSpan="3">{transport.place || ''}</td>
                    </tr>

                    {/* Row 11: State Code */}
                    <tr>
                        <td className="fw-bold"></td>
                        <td colSpan="3"></td>
                        <td className="fw-bold">State Code</td>
                        <td colSpan="3">{transport.stateCode || ''}</td>
                    </tr>
                </tbody>
            </table>

            {/* Items Table */}
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
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
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

            {/* Footer Table */}
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