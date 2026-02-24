import React from 'react';
import { LocalDate, LocalTime, NumberFormat, numberToWords, Addition } from '../../../Components/functions';

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
        totalBags: totals.totalBags || calculatedTotals.bags,
        totalQty: totals.totalQty || NumberFormat(calculatedTotals.totalQty),
        totalAmount: totals.totalAmount || NumberFormat(calculatedTotals.totalAmount),
        amountInWords: totals.amountInWords || numberToWords(Math.round(calculatedTotals.totalAmount)) + " Only"
    };


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
                .delivery-challan-container .text-center {
                    text-align: center;
                }
                .delivery-challan-container .text-right {
                    text-align: right;
                }
                .delivery-challan-container .fw-bold {
                    font-weight: bold;
                }
                .delivery-challan-container .bg-light {
                    background-color: #f5f5f5;
                }
                .delivery-challan-container .title {
                    font-size: 24px;
                    font-weight: bold;
                    letter-spacing: 2px;
                }
                .delivery-challan-container .company-name {
                    font-size: 20px;
                    font-weight: bold;
                }
                .delivery-challan-container .copy-type {
                    border: 2px solid #000;
                    display: inline-block;
                    padding: 5px 20px;
                    font-weight: bold;
                }
                @media print {
                    .delivery-challan-container {
                        padding: 10px;
                    }
                }
            `}</style>

           <div className="text-center">DELIVERY CHALLAN</div>
            <table className="table table-bordered">
              
                <tbody>
              
      

         <table className="details-table" style={{ width: '100%', tableLayout: 'fixed' }}>
    <colgroup>
        <col style={{ width: '12.5%' }} />
        <col style={{ width: '12.5%' }} />
        <col style={{ width: '12.5%' }} />
        <col style={{ width: '12.5%' }} />
        <col style={{ width: '12.5%' }} />
        <col style={{ width: '12.5%' }} />
        <col style={{ width: '12.5%' }} />
        <col style={{ width: '12.5%' }} />
    </colgroup>
    <tbody>
     
        <tr>
            <td colSpan="6" className="text-center">
                <div className="company-name">{company.name || 'S.M TRADERS'}</div>
            </td>
            <td colSpan="2" className="text-center">
                <span>ORIGINAL / DUPLICATE</span>
            </td>
        </tr>

   
        <tr>
            <td colSpan="6" rowSpan="2">
                <div className="text-center">G.O: {company.address || '746-A, PULIYUR, SAYANAPURAM, SIVAGANGAI - 630611'}</div>
                <div className="text-center">GSTIN : {company.gst || '33AADFS4987M1ZL'}</div>
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
            <td className="header-cell" colSpan="4">Details of Recipient / Supplier / Consignee</td>
            <td className="header-cell" colSpan="4">Mode of Transport: {transport.mode || 'By Road'}</td>
        </tr>
        
        <tr>
            <td className="label">Name</td>
            <td colSpan="3">{recipient.name || ''}</td>
            <td className="label">Vehicle No</td>
            <td colSpan="3">{transport.vehicleNo || ''}</td>
        </tr>
        
        <tr>
            <td className="label">Address</td>
            <td colSpan="3">{recipient.address || ''}</td>
            <td className="label">Driver Name</td>
            <td colSpan="3">{transport.driverName || ''}</td>
        </tr>
        
        <tr>
            <td className="label">GSTIN</td>
            <td colSpan="3">{recipient.gstin || ''}</td>
            <td className="label">Date Supply</td>
            <td colSpan="3">{transport.date || ''}</td>
        </tr>
        
        <tr>
            <td className="label">State</td>
            <td colSpan="3">{recipient.state || ''}</td>
            <td className="label">Time of Suppl</td>
            <td colSpan="3">{transport.time || ''}</td>
        </tr>
        
        <tr>
            <td className="label"></td>
            <td colSpan="3"></td>
            <td className="label">Place of Supp</td>
            <td colSpan="3">{transport.place || ''}</td>
        </tr>
        
        <tr>
            <td className="label"></td>
            <td colSpan="3"></td>
            <td className="label">State Code</td>
            <td colSpan="3">{transport.stateCode || ''}</td>
        </tr>
    </tbody>
</table> </tbody>
            </table>


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
                  
                    {items.length > 0 && items.map((item, index) => (
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


            <table className="table table-bordered" style={{ border: '2px solid #000' }}>
                <tbody>
                       <td className="fw-bold" style={{ padding: '10px'}}>
                        Challan Total Value in Words:
                        <br/>
                            {displayTotals.amountInWords}
                        </td>
                    <td style={{ height: '60px' }}>
                            <div>For {company.name || 'S.M.Traders'}</div>
                            <br />
                            <div>Authorised Signatory</div>
                        </td>
                   
                </tbody>
            </table>

         
            <table className="table table-bordered" style={{ border: '2px solid #000', marginTop: '10px' }}>
                <tbody>
                    <tr>
                     
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