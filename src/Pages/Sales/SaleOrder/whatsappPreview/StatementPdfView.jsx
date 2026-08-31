import { useEffect, useRef, useState } from 'react'
import { fetchLink } from '../../../../Components/fetchComponent' // adjust depth to match your tree

const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    const dateOnly = dateString.split('T')[0];
    const parts = dateOnly.split('-');
    if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateOnly;
};

const formatAmount = (amount) => {
    const num = Number(amount) || 0;
    if (num === 0) return "-";
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

/**
 * Off-screen capture template for a Transaction / Outstanding Statement —
 * mirrors the standalone StatementView page, but instead of driving its own
 * html2pdf auto-download, it fetches its data, renders, and signals
 * onReady() so the parent (Whatsapp.jsx) can html2canvas-capture it.
 * Same pattern as Pendingbills / SaleOrderTemplate / SaleInvoiceTemplate.
 *
 * Props:
 *  - row: the outstanding row from the WhatsApp table (needs Acc_Id, retailerNameGet/Retailer_Name)
 *  - fromDate, toDate: date range strings (YYYY-MM-DD)
 *  - companyInfo: array from masters/company
 *  - onReady(): called once the DOM has painted and is safe to capture
 *  - onError(err): called if fetching/rendering fails
 */
export default function StatementTemplate({ row, fromDate, toDate, companyInfo, onReady, onError }) {
    const [statementData, setStatementData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const readyFiredRef = useRef(false);

    const accId = row?.Acc_Id;
    const accountName = row?.retailerNameGet || row?.Retailer_Name || '';

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                if (!accId) throw new Error('Missing Acc_Id on row');
                if (!fromDate || !toDate) throw new Error('Missing date range');

                const response = await fetchLink({
                    address: `payment/transactions?Acc_Id=${accId}&fromDate=${fromDate}&toDate=${toDate}`,
                    loadingOn: () => {}, loadingOff: () => {},
                });

                const data = response?.data || response || [];
                const dataArray = Array.isArray(data) ? data : [data];

                const transformed = dataArray.map((item) => ({
                    invoice_no: item.invoice_no || "-",
                    Ledger_Date: formatDateForDisplay(item.Ledger_Date),
                    Particulars: item.Particulars || "-",
                    raw_Debit_Amt: item.Debit_Amt || 0,
                    raw_Credit_Amt: item.Credit_Amt || 0,
                }));

                if (cancelled) return;
                setStatementData(transformed);
            } catch (e) {
                if (cancelled) return;
                setError(e?.message || 'Failed to load statement');
                onError?.(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true };
    }, [accId, fromDate, toDate]);

    // Signal ready once loaded (or errored) and painted — matches the
    // onReady/onError contract used by the other capture templates.
    useEffect(() => {
        if (loading || readyFiredRef.current) return;
        if (error) return; // onError already fired above
        readyFiredRef.current = true;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setTimeout(() => onReady?.(), 150);
            });
        });
    }, [loading, error]);

    if (loading || error) return null; // nothing to capture yet

    const totalDebit = statementData.reduce((s, r) => s + (r.raw_Debit_Amt || 0), 0);
    const totalCredit = statementData.reduce((s, r) => s + (r.raw_Credit_Amt || 0), 0);
    const balance = totalDebit - totalCredit;
    const balanceType = balance > 0 ? 'DR' : balance < 0 ? 'CR' : '';

    const companyInfoDetails = companyInfo?.[0] || null;

    return (
        <div style={{
            padding: '20px',
            backgroundColor: '#fff',
            fontSize: 11,
            lineHeight: '1.4',
            fontFamily: 'Arial, sans-serif',
            width: '1000px',
            boxSizing: 'border-box',
        }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: 16, fontWeight: 'bold' }}>
                    {companyInfoDetails?.Company_Name || 'Transaction'} - Statement
                </h2>
                {accountName && (
                    <h3 style={{ margin: '0 0 5px 0', fontSize: 13, fontWeight: 600 }}>
                        {accountName}
                    </h3>
                )}
                <p style={{ margin: '5px 0', fontSize: 12 }}>
                    Period: {fromDate} to {toDate}
                </p>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, border: '1px solid #000', fontSize: 10 }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '1px solid #000' }}>
                        <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold', width: '5%' }}>#</th>
                        <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold', width: '13%', whiteSpace: 'nowrap' }}>Date</th>
                        <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold', width: '15%' }}>Invoice No</th>
                        <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', fontWeight: 'bold', width: '40%' }}>Particulars</th>
                        <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold', width: '13%', whiteSpace: 'nowrap' }}>Debit (Dr)</th>
                        <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold', width: '13%', whiteSpace: 'nowrap' }}>Credit (Cr)</th>
                    </tr>
                </thead>
                <tbody>
                    {statementData.length > 0 ? statementData.map((row, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                            <td style={{ border: '1px solid #ddd', padding: '6px' }}>{index + 1}</td>
                            <td style={{ border: '1px solid #ddd', padding: '6px', whiteSpace: 'nowrap' }}>{row.Ledger_Date}</td>
                            <td style={{ border: '1px solid #ddd', padding: '6px', wordBreak: 'break-word' }}>{row.invoice_no}</td>
                            <td style={{ border: '1px solid #ddd', padding: '6px', wordBreak: 'break-word' }}>{row.Particulars}</td>
                            <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right', whiteSpace: 'nowrap' }}>{formatAmount(row.raw_Debit_Amt)}</td>
                            <td style={{ border: '1px solid #ddd', padding: '6px', textAlign: 'right', whiteSpace: 'nowrap' }}>{formatAmount(row.raw_Credit_Amt)}</td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan={6} style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                                No transactions found for the selected period
                            </td>
                        </tr>
                    )}
                    <tr style={{ backgroundColor: '#f9f9f9', borderTop: '2px solid #000' }}>
                        <td colSpan={4} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>TOTAL</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatAmount(totalDebit)}</td>
                        <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatAmount(totalCredit)}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#e8f4f8' }}>
                        <td colSpan={4} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>NET BALANCE ({balanceType})</td>
                        <td colSpan={2} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatAmount(Math.abs(balance))}</td>
                    </tr>
                </tbody>
            </table>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: '#888' }}>
                This is a Computer Generated Statement
            </div>
        </div>
    );
}