import { useEffect, useRef, useState } from "react";
import { toArray, checkIsNumber, numberToWords, NumberFormat } from "../../../../Components/functions";
import { fetchLink } from "../../../../Components/fetchComponent";
import { useReactToPrint } from 'react-to-print';
import { Print } from "@mui/icons-material";
import { Button } from "@mui/material";
import smtQRcode from '../../../../assets/smtQRcode.jpg'
import { padding } from "@mui/system";

const cm = (n) => `${n}cm`;
const pct = (part, total) => `${((part / total) * 100).toFixed(4)}%`;

const InvoiceTemplate = ({ Do_Id, loadingOn, loadingOff }) => {
    const [data, setData] = useState({});
    const printRef = useRef(null);


    useEffect(() => {
        if (!checkIsNumber(Do_Id)) return;
        fetchLink({
            address: `sales/salesInvoice/printOuts/invoicePrint?Do_Id=${Do_Id}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setData(data?.data[0] || {})
            }
        }).catch(e => console.error(e));
    }, [Do_Id]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    const invLabel = 'opacity-0'
    const b = "";
    const pri = "";
    const bb = "";

    // const invLabel = ''
    // const b = " border ";
    // const pri = " border-primary ";
    // const bb = " border-bottom ";

    const tctr = " text-center ";
    const tright = " text-start ";
    const tleft = " text-end ";
    const fwBold = ' fw-bold '

    const fontSize = " 12px ";
    const hsnFont = ' 10px ';
    const pad = ' 5px ';

    const INVOICE_W = cm(17);
    const INVOICE_H = cm(11.6);

    const PAGE_PAD_X = cm(0.7);
    const PAGE_PAD_Y = cm(1);

    const header2 = { left: 9.5, right: 8.2 };
    const header2Total = header2.left + header2.right;

    const footerRow = { left: 14, right: 4.5 };
    const footerRowTotal = footerRow.left + footerRow.right;

    const bottomRow = { left: 12.3, right: 5.5 };
    const bottomRowTotal = bottomRow.left + bottomRow.right;

    const cols = [
        { key: "no", label: "No", cm: 0.6, cls: tctr },
        { key: "items", label: "Items", cm: 6.3, cls: tctr },
        { key: "hsn", label: "HSN", cm: 1.9, cls: tctr },
        { key: "gst", label: "GST", cm: 0.9, cls: tctr },
        { key: "bags", label: "Bags", cm: 1.3, cls: tctr },
        { key: "rate", label: "Rate", cm: 2.4, cls: tctr },
        { key: "qty", label: "Qty", cm: 1.8, cls: tctr },
        { key: "amount", label: "Amount", cm: 2.5, cls: tctr },
    ];
    const colsTotal = cols.reduce((s, c) => s + c.cm, 0);

    const broker = toArray(data?.staffDetails).find(st => st.empType === 'Broker');
    const transport = toArray(data?.staffDetails).find(st => st.empType === 'Transport');

    const products = toArray(data?.productDetails);
    const expenses = toArray(data?.expencessDetails);

    const visibleExpenses = expenses.filter(e => !e.expenseName?.includes('GST'));

    const totalAmount = products.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.expenseValue) || 0), 0);
    const netAmount = totalAmount + totalExpenses + (Number(data?.roundOffValue) || 0);

    const cellStyle = (width, last = false) => ({
        width: width,
        fontSize: fontSize,
        paddingRight: '10px'
        // boxSizing: 'border-box',
    });

    const groupHSNSummary = (productsList) => {
        const map = new Map();
        productsList.forEach((p) => {
            const hsn = p?.hsnCode || "";
            const amt = Number(p?.amount);
            map.set(hsn, (map.get(hsn) || 0) + (Number.isNaN(amt) ? 0 : amt));
        });
        return Array.from(map.entries()).map(([hsn, amount]) => ({ hsn, amount }));
    };

    const hsnSummary = groupHSNSummary(products);

    return (
        <div className="d-flex flex-column align-items-center justify-content-center">
            <Button onClick={handlePrint} startIcon={<Print />}>Print</Button>
            <div style={{ padding: `${PAGE_PAD_Y} ${PAGE_PAD_X}`, boxSizing: "border-box" }} ref={printRef}>
                <div
                    style={{
                        width: INVOICE_W,
                        height: INVOICE_H,
                        boxSizing: "border-box",
                    }}
                    className={b + pri}
                >
                    {/* header one - company details */}
                    <div
                        style={{ height: cm(1.8), padding: pad, boxSizing: "border-box" }}
                        className={b + bb + pri}
                    ></div>

                    {/* header two - party details (auto fills full width) */}
                    <div style={{ display: "flex", width: "100%" }}>
                        <div
                            style={{
                                width: pct(header2.left, header2Total),
                                height: cm(2.0),
                                padding: pad,
                                boxSizing: "border-box",
                                fontSize: fontSize,
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                            }}
                            className={b + bb + pri}
                        >
                            <div style={{ display: 'flex' }}>
                                <span style={{ width: '40px' }}><span className={invLabel}>To </span></span>
                                <div>
                                    <p style={{ fontSize: '10px', margin: 0 }}>{data.mailingName}</p>
                                    <p style={{ fontSize: '10px', margin: 0 }}>{data.mailingAddress}</p>
                                    <p style={{ fontSize: '10px', margin: 0 }}>{data.mailingCity}</p>
                                    <p style={{ fontSize: '10px', margin: 0 }}>{data.mailingNumber}</p>
                                    <p style={{ fontSize: '10px', margin: 0 }}>
                                        <span className={invLabel}>GSTIN : </span>{data.retailerGstNumber}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                width: pct(header2.right, header2Total),
                                height: cm(2.0),
                                padding: pad,
                                boxSizing: "border-box",
                                fontSize: fontSize,
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                            }}
                            className={b + bb + pri}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span className={invLabel}>Date : {data.createdOn ? new Date(data.createdOn).toLocaleDateString("en-GB") : ''}</span>
                                <span style={{ fontWeight: 'bold' }}>{data.voucherTypeGet}</span>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <span className={invLabel}>Bill No. : </span>
                                <span style={{ fontWeight: 'bold', marginLeft: '5px' }}>{data.voucherNumber}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <span className={invLabel}>Broker:</span>
                                    <span>{broker?.empName}</span>
                                </div>
                                <div>
                                    <span className={invLabel}>Transport:</span>
                                    <span>{transport?.empName}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* items table */}
                    <div style={{ width: "100%", display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <div style={{ display: "flex", width: "100%", boxSizing: 'border-box' }} className={pri}>
                            {cols.map((c, i) => (
                                <div
                                    key={c.key}
                                    className={tctr + pri}
                                    style={{
                                        width: pct(c.cm, colsTotal),
                                        fontWeight: 600,
                                        fontSize: fontSize,
                                        boxSizing: 'border-box',
                                        height: cm(0.4),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <span className={invLabel}>{c.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Body */}
                        <div style={{ width: "100%" }}>
                            {Array.from({ length: Math.max(8, 6 + visibleExpenses.length) }).map((_, index) => {
                                // Product Rows
                                if (index < 6) {
                                    const item = products[index] ? products[index] : {};
                                    return (
                                        <div key={index} style={{ display: 'flex', width: '100%', height: cm(0.4) }} className={pri}>
                                            <div className={fwBold + pri + tleft} style={cellStyle(pct(cols[0].cm, colsTotal))}>{item.itemName ? index + 1 : ''}</div>
                                            <div className={fwBold + pri + pad} style={cellStyle(pct(cols[1].cm, colsTotal))}>{item.itemName}</div>
                                            <div className={fwBold + pri + tleft} style={cellStyle(pct(cols[2].cm, colsTotal))}>{item.hsnCode}</div>
                                            <div className={fwBold + pri + tleft} style={cellStyle(pct(cols[3].cm, colsTotal))}>{item.gstPercentage}</div>
                                            <div className={fwBold + pri + tleft} style={cellStyle(pct(cols[4].cm, colsTotal))}>{item.billQuantity}</div>
                                            <div className={fwBold + pri + tleft} style={cellStyle(pct(cols[5].cm, colsTotal))}>{item.itemRate}</div>
                                            <div className={fwBold + pri + tleft} style={cellStyle(pct(cols[6].cm, colsTotal))}>{item.quantity}</div>
                                            <div className={fwBold + pri + tleft} style={cellStyle(pct(cols[7].cm, colsTotal))}>{item.amount}</div>
                                        </div>
                                    )
                                }

                                // Expense Rows
                                const expenseIndex = index - 6;
                                const expenseItem = visibleExpenses[expenseIndex] || {};

                                // Merged Width for Rate + Qty
                                const mergedWidth = cols[5].cm + cols[6].cm;

                                return (
                                    <div key={index} style={{ display: 'flex', width: '100%', height: cm(0.4) }} className={pri}>
                                        <div className={tctr + pri} style={cellStyle(pct(cols[0].cm, colsTotal))}></div>
                                        <div className={tctr + pri} style={cellStyle(pct(cols[1].cm, colsTotal))}></div>
                                        <div className={tctr + pri} style={cellStyle(pct(cols[2].cm, colsTotal))}></div>
                                        <div className={tctr + pri} style={cellStyle(pct(cols[3].cm, colsTotal))}></div>
                                        <div className={tctr + pri} style={cellStyle(pct(cols[4].cm, colsTotal))}></div>

                                        {/* Merged Cell */}
                                        <div
                                            className={pri + fwBold}
                                            style={{
                                                ...cellStyle(pct(mergedWidth, colsTotal)),
                                                paddingLeft: '5px'
                                            }}
                                        >
                                            {expenseItem.expenseName}
                                        </div>

                                        <div className={tctr + pri + fwBold} style={cellStyle(pct(cols[7].cm, colsTotal), true)}>{expenseItem.expenseValue}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* table footer row (auto fills full width) */}
                    <div style={{ display: "flex", width: "100%" }}>
                        <div
                            style={{
                                width: pct(footerRow.left, footerRowTotal),
                                height: cm(0.6),
                                padding: pad,
                                boxSizing: "border-box",
                                fontSize: fontSize
                            }}
                            className={b + pri}
                        ></div>
                        <div
                            style={{
                                width: pct(footerRow.right, footerRowTotal),
                                height: cm(0.6),
                                padding: pad,
                                boxSizing: "border-box",
                                fontSize: fontSize,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}
                            className={b + pri}
                        >
                            <span className={invLabel}>Rounded off: </span>
                            <span style={{ paddingRight: '10px' }}>{data.roundOffValue}</span>
                        </div>
                    </div>

                    {/* bottom section (kept your structure, but widths now always fill 19cm) */}
                    <div style={{ display: "flex", flexWrap: "wrap" }}>

                        <div
                            style={{
                                width: pct(bottomRow.left, bottomRowTotal),
                                height: cm(0.6),
                                boxSizing: "border-box",
                            }}
                            className={b + pri}
                        ></div>

                        <div
                            style={{
                                width: pct(bottomRow.right, bottomRowTotal),
                                height: cm(0.6),
                                padding: pad,
                                boxSizing: "border-box",
                                fontSize: fontSize,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                fontWeight: 'bold'
                            }}
                            className={b + pri}
                        >
                            <span className={invLabel}>Net</span>
                            <span>{netAmount.toFixed(2)}</span>
                        </div>

                        <div
                            style={{
                                width: pct(bottomRow.left, bottomRowTotal),
                                height: cm(3.0),
                                boxSizing: "border-box",
                                display: 'flex'
                            }}
                            className={b + pri}
                        >
                            <div style={{ fontSize: '12px', padding: pad }}>
                                {numberToWords(parseInt(netAmount))}
                                {hsnSummary.map((h, i) => (
                                    <div className="hsnRow" key={i}>
                                        <div className={"hsnCode"} style={{ fontSize: hsnFont }}>{h.hsn || ''}</div>
                                        <div className={"hsnAmt"} style={{ fontSize: hsnFont }}>{NumberFormat(h.amount)}</div>
                                    </div>
                                ))}
                            </div>
                            <div>
                                {/* <img src={smtQRcode} alt="QR" style={{ height: "100%", width: "130px" }} /> */}
                            </div>
                        </div>

                        <div
                            style={{
                                width: pct(bottomRow.right, bottomRowTotal),
                                height: cm(3.0),
                                padding: pad,
                                boxSizing: "border-box",
                                fontSize: "10px"
                            }}
                            className={b + pri}
                        >

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
