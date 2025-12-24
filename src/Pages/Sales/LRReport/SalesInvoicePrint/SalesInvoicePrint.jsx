import "./salesInvoicePrint.css";

const padRows = (items, total) => {
    const empties = Math.max(0, total - items.length);
    return [
        ...items,
        ...Array.from({ length: empties }).map((_, i) => ({
            _empty: true,
            id: `empty-${i}`,
        })),
    ];
};

export default function InvoiceCard({ invoice }) {
    const {
        to = "",
        date = "",
        billNo = "",
        broker = "",
        transport = "",
        items = [],
        roundedOff = "",
        net = "",
        qrSrc = "",
        footerNote = "",
    } = invoice || {};

    const rows = padRows(items, 10); // adjust if you want more/less empty lines

    return (
        <div className="invoice-sheet shadow-sm">
            {/* Top blank band (≈2.1cm in image) */}
            <div className="invoice-top-blank" />

            {/* Header band */}
            <div className="invoice-header d-flex">
                {/* Left: To (≈9.5cm) */}
                <div className="invoice-cell invoice-to">
                    <div className="invoice-label">To</div>
                    <div className="invoice-value">{to}</div>
                </div>

                {/* Right: Date/Bill/Broker + Transport */}
                <div className="invoice-cell invoice-meta flex-grow-1">
                    <div className="row g-0">
                        <div className="col-7 pe-2">
                            <div className="invoice-meta-line">
                                <span className="invoice-label-inline">Date :</span>
                                <span className="invoice-value-inline">{date}</span>
                            </div>
                            <div className="invoice-meta-line">
                                <span className="invoice-label-inline">Bill No. :</span>
                                <span className="invoice-value-inline">{billNo}</span>
                            </div>
                            <div className="invoice-meta-line">
                                <span className="invoice-label-inline">Broker :</span>
                                <span className="invoice-value-inline">{broker}</span>
                            </div>
                        </div>

                        <div className="col-5 ps-2">
                            <div className="invoice-meta-line">
                                <span className="invoice-label-inline">Transport :</span>
                                <span className="invoice-value-inline">{transport}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items table */}
            <div className="invoice-items">
                <table className="table table-bordered mb-0 invoice-table">
                    <thead>
                        <tr className="invoice-th">
                            <th className="c-no">No.</th>
                            <th className="c-items">Items</th>
                            <th className="c-hsn">HSN</th>
                            <th className="c-gst">GST</th>
                            <th className="c-bags">Bags</th>
                            <th className="c-rate">Rate</th>
                            <th className="c-qty">Qty</th>
                            <th className="c-amt">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, idx) => (
                            <tr key={r.id || idx} className={r._empty ? "is-empty" : ""}>
                                <td className="c-no">{r._empty ? "" : r.no}</td>
                                <td className="c-items">{r._empty ? "" : r.item}</td>
                                <td className="c-hsn">{r._empty ? "" : r.hsn}</td>
                                <td className="c-gst">{r._empty ? "" : r.gst}</td>
                                <td className="c-bags">{r._empty ? "" : r.bags}</td>
                                <td className="c-rate text-end">{r._empty ? "" : r.rate}</td>
                                <td className="c-qty text-end">{r._empty ? "" : r.qty}</td>
                                <td className="c-amt text-end">{r._empty ? "" : r.amount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom area */}
            <div className="invoice-bottom d-flex">
                {/* Left big blank/notes area */}
                <div className="invoice-cell invoice-bottom-left flex-grow-1">
                    <div className="small text-muted">{footerNote}</div>
                </div>

                {/* Right totals */}
                <div className="invoice-bottom-right">
                    <div className="invoice-cell invoice-rounded">
                        <div className="d-flex justify-content-between">
                            <span className="fw-semibold">Rounded Off</span>
                            <span>{roundedOff}</span>
                        </div>
                    </div>

                    <div className="invoice-cell invoice-net d-flex">
                        <div className="invoice-qr">
                            {qrSrc ? (
                                <img src={qrSrc} alt="QR" className="invoice-qr-img" />
                            ) : (
                                <div className="invoice-qr-placeholder">QR</div>
                            )}
                        </div>

                        <div className="invoice-net-box flex-grow-1">
                            <div className="fw-semibold">Net</div>
                            <div className="invoice-net-value">{net}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
