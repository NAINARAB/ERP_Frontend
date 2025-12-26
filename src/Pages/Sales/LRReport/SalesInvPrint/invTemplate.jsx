import { useEffect, useRef, useState } from "react";
import {
    toArray,
    checkIsNumber,
    numberToWords,
    NumberFormat,
} from "../../../../Components/functions";
import { fetchLink } from "../../../../Components/fetchComponent";
import { useReactToPrint } from "react-to-print";
import { CheckBox, CheckBoxOutlineBlank, Print, RemoveRedEye, VisibilityOff } from "@mui/icons-material";
import { Button } from "@mui/material";
import smtQRcode from "../../../../assets/smtQRcode.jpg";

const cm = (n) => `${n}cm`;
const pct = (part, total) => `${((part / total) * 100).toFixed(4)}%`;

// 🔧 print calibration (increase if output is smaller than your pre-printed box)
const PRINT_SCALE = 1.25;  // try 1.06 → 1.15
const PRINT_OFFSET_X = 0;  // cm (use if you need to shift left/right)
const PRINT_OFFSET_Y = 0;  // cm (use if you need to shift up/down)

const pageStyle = `
  @page { margin: 0; }
  @media print {
    html, body { margin: 0 !important; padding: 0 !important; }
    .invoicePrintScale { 
      zoom: ${PRINT_SCALE};              
    }
    @supports not (zoom: 1) {
      .invoicePrintScale {
        transform: scale(${PRINT_SCALE});
        transform-origin: top left;
      }
    }
  }
`;

const InvoiceTemplate = ({ Do_Id, loadingOn, loadingOff }) => {
    const [data, setData] = useState({});
    const printRef = useRef(null);
    const [invLabel, setInvLabel] = useState("opacity-0");
    const [b, setB] = useState("");
    const [pri, setPri] = useState("");
    const [bb, setBb] = useState("");
    const [designsView, setDesignsView] = useState(false);

    useEffect(() => {
        if (!checkIsNumber(Do_Id)) return;
        fetchLink({
            address: `sales/salesInvoice/printOuts/invoicePrint?Do_Id=${Do_Id}`,
            loadingOn,
            loadingOff,
        })
            .then((res) => {
                if (res.success) setData(res?.data?.[0] || {});
            })
            .catch((e) => console.error(e));
    }, [Do_Id]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        pageStyle,
    });

    const handleDesignsView = () => {
        setDesignsView(pre => {
            if (pre) {
                setB("");
                setPri("");
                setBb("");
                setInvLabel('opacity-0');
            } else {
                setB(" border ");
                setPri(" border-primary ");
                setBb(" border-bottom ");
                setInvLabel('')
            }
            return !pre;
        });
    };

    // const invLabel = "opacity-0";
    // const b = "";
    // const pri = "";
    // const bb = "";

    // const invLabel = ''
    // const b = " border ";
    // const pri = " border-primary ";
    // const bb = " border-bottom ";

    const tctr = " text-center ";
    const tright = " text-start ";
    const tleft = " text-end ";
    const fwBold = " fw-bold ";

    const fontSize = "12px";
    const hsnFont = "10px";

    // ✅ FINAL measured page size
    const INVOICE_W = cm(17.75);
    const INVOICE_H = cm(13.4);
    const PAGE_PAD_Y = cm(0.75);
    const PAGE_PAD_X = cm(0.6);

    // ✅ measured outer padding (paper margin around invoice)
    const PAGE_PAD = {
        top: 0.75,
        right: 0.6,
        bottom: 0.6,
        left: 0.6,
    };

    // ✅ measured block heights (these sum exactly to 13.4cm)
    const H_HEADER1 = 1.7; // top big blank
    const H_PARTY = 2.25; // To / Date block
    const H_TABLE_HEAD = 0.55; // green header strip
    const H_TABLE_BODY = 4.65; // items rows region
    const H_ROUND_ROW = 0.55; // rounded-off row
    const H_NET_ROW = 0.95; // net row
    const H_BOTTOM = 2.75; // bottom big boxes

    // ✅ measured widths
    const header2 = { left: 9.5, right: 8.2 };
    const header2Total = header2.left + header2.right;

    // ✅ measured bottom split
    const bottomRow = { left: 12.3, right: 5.45 };
    const bottomRowTotal = bottomRow.left + bottomRow.right;

    // ✅ measured column widths from your image
    const cols = [
        { key: "no", label: "No", cm: 0.65, cls: tctr },
        { key: "items", label: "Items", cm: 6.35, cls: tctr },
        { key: "hsn", label: "HSN", cm: 1.9, cls: tctr },
        { key: "gst", label: "GST", cm: 0.9, cls: tctr },
        { key: "bags", label: "Bags", cm: 1.25, cls: tctr },
        { key: "rate", label: "Rate", cm: 2.4, cls: tctr },
        { key: "qty", label: "Qty", cm: 1.475, cls: tctr },
        { key: "amount", label: "Amount", cm: 2.5, cls: tctr },
    ];
    const colsTotal = cols.reduce((s, c) => s + c.cm, 0);

    const broker = toArray(data?.staffDetails).find((st) => st.empType === "Broker");
    const transport = toArray(data?.staffDetails).find((st) => st.empType === "Transport");

    const products = toArray(data?.productDetails);
    const expenses = toArray(data?.expencessDetails);
    const visibleExpenses = expenses.filter((e) => !e.expenseName?.includes("GST"));

    const totalAmount = products.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.expenseValue) || 0), 0);
    const netAmount = totalAmount + totalExpenses + (Number(data?.roundOffValue) || 0);

    // ✅ body rows are forced to fit EXACTLY inside 4.65cm
    const totalRows = Math.max(8, 6 + visibleExpenses.length);
    const ROW_H = H_TABLE_BODY / totalRows;

    // ✅ padding in cm (so print stays consistent)
    const CELL_PAD_Y = 0.05;
    const CELL_PAD_X = 0.12;

    const cellStyle = (width) => ({
        width,
        fontSize,
        padding: `${cm(CELL_PAD_Y)} ${cm(CELL_PAD_X)}`,
        boxSizing: "border-box",
        overflow: "hidden",
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

    // Helper widths (pct)
    const w = (cmVal) => pct(cmVal, colsTotal);

    return (
        <div className="d-flex flex-column align-items-center justify-content-center">
            <Button onClick={handlePrint} startIcon={<Print />}>
                Print
            </Button>

            <Button onClick={handleDesignsView} startIcon={designsView ?<CheckBox /> : <CheckBoxOutlineBlank />}>
                Designs View
            </Button>

            {/* <div
                ref={printRef}
                style={{
                    padding: `${cm(PAGE_PAD.top)} ${cm(PAGE_PAD.right)} ${cm(PAGE_PAD.bottom)} ${cm(
                        PAGE_PAD.left
                    )}`,
                    boxSizing: "border-box",
                }}
            > */}
            <div
                ref={printRef}
                style={{ padding: `${PAGE_PAD_Y} ${PAGE_PAD_X}`, boxSizing: "border-box" }}
            >
                <div
                    className="invoicePrintScale"
                    style={{
                        position: "relative",
                        left: cm(PRINT_OFFSET_X),
                        top: cm(PRINT_OFFSET_Y),
                    }}
                >
                    <div
                        style={{
                            width: INVOICE_W,
                            height: INVOICE_H,
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                        }}
                        className={b + pri}
                    >
                        {/* header one - company details (measured 1.7cm) */}
                        <div style={{ height: cm(H_HEADER1), boxSizing: "border-box" }} className={b + bb + pri} />

                        {/* header two - party details (measured 2.25cm) */}
                        <div style={{ display: "flex", width: "100%", height: cm(H_PARTY) }}>
                            <div
                                style={{
                                    width: pct(header2.left, header2Total),
                                    height: "100%",
                                    boxSizing: "border-box",
                                    fontSize,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    padding: cm(0.15),
                                }}
                                className={b + bb + pri}
                            >
                                <div style={{ display: "flex" }}>
                                    <span style={{ width: "40px" }}>
                                        <span className={invLabel}>To </span>
                                    </span>
                                    <div>
                                        <p style={{ fontSize: "10px", margin: 0 }}>{data.mailingName}</p>
                                        <p style={{ fontSize: "10px", margin: 0 }}>{data.mailingAddress}</p>
                                        <p style={{ fontSize: "10px", margin: 0 }}>{data.mailingCity}</p>
                                        <p style={{ fontSize: "10px", margin: 0 }}>{data.mailingNumber}</p>
                                        <p style={{ fontSize: "10px", margin: 0 }}>
                                            <span className={invLabel}>GSTIN : </span>
                                            {data.retailerGstNumber}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div
                                style={{
                                    width: pct(header2.right, header2Total),
                                    height: "100%",
                                    boxSizing: "border-box",
                                    fontSize,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    padding: cm(0.15),
                                }}
                                className={b + bb + pri}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span className={invLabel}>
                                        Date :{" "}
                                        {data.createdOn ? new Date(data.createdOn).toLocaleDateString("en-GB") : ""}
                                    </span>
                                    <span style={{ fontWeight: "bold" }}>{data.voucherTypeGet}</span>
                                </div>

                                <div style={{ display: "flex" }}>
                                    <span className={invLabel}>Bill No. : </span>
                                    <span style={{ fontWeight: "bold", marginLeft: "5px" }}>{data.voucherNumber}</span>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between" }}>
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
                        <div style={{ width: "100%", display: "flex", flexDirection: "column" }}>
                            {/* Header (measured 0.55cm) */}
                            <div style={{ display: "flex", width: "100%" }} className={pri}>
                                {cols.map((c) => (
                                    <div
                                        key={c.key}
                                        className={tctr + pri}
                                        style={{
                                            width: w(c.cm),
                                            fontWeight: 600,
                                            fontSize,
                                            boxSizing: "border-box",
                                            height: cm(H_TABLE_HEAD),
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <span className={invLabel}>{c.label}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Body (measured 4.65cm total, rows auto-fit) */}
                            <div style={{ width: "100%", height: cm(H_TABLE_BODY), display: "flex", flexDirection: "column" }}>
                                {Array.from({ length: totalRows }).map((_, index) => {
                                    // Product Rows (first 6)
                                    if (index < 6) {
                                        const item = products[index] || {};
                                        return (
                                            <div
                                                key={index}
                                                style={{ display: "flex", width: "100%", height: cm(ROW_H) }}
                                                className={pri}
                                            >
                                                <div className={fwBold + pri + tleft} style={cellStyle(w(cols[0].cm))}>
                                                    {item.itemName ? index + 1 : ""}
                                                </div>
                                                <div className={fwBold + pri} style={cellStyle(w(cols[1].cm))}>
                                                    {item.itemName}
                                                </div>
                                                <div className={fwBold + pri + tleft} style={cellStyle(w(cols[2].cm))}>
                                                    {item.hsnCode}
                                                </div>
                                                <div className={fwBold + pri + tleft} style={cellStyle(w(cols[3].cm))}>
                                                    {item.gstPercentage}
                                                </div>
                                                <div className={fwBold + pri + tleft} style={cellStyle(w(cols[4].cm))}>
                                                    {item.billQuantity}
                                                </div>
                                                <div className={fwBold + pri + tleft} style={cellStyle(w(cols[5].cm))}>
                                                    {item.itemRate}
                                                </div>
                                                <div className={fwBold + pri + tleft} style={cellStyle(w(cols[6].cm))}>
                                                    {item.quantity}
                                                </div>
                                                <div className={fwBold + pri + tleft} style={cellStyle(w(cols[7].cm))}>
                                                    {item.amount}
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Expense Rows
                                    const expenseIndex = index - 6;
                                    const expenseItem = visibleExpenses[expenseIndex] || {};

                                    // merged cell width (Rate + Qty)
                                    const mergedWidth = cols[5].cm + cols[6].cm;

                                    return (
                                        <div
                                            key={index}
                                            style={{ display: "flex", width: "100%", height: cm(ROW_H) }}
                                            className={pri}
                                        >
                                            <div className={tctr + pri} style={cellStyle(w(cols[0].cm))} />
                                            <div className={tctr + pri} style={cellStyle(w(cols[1].cm))} />
                                            <div className={tctr + pri} style={cellStyle(w(cols[2].cm))} />
                                            <div className={tctr + pri} style={cellStyle(w(cols[3].cm))} />
                                            <div className={tctr + pri} style={cellStyle(w(cols[4].cm))} />

                                            <div className={pri + fwBold} style={cellStyle(w(mergedWidth))}>
                                                {expenseItem.expenseName}
                                            </div>

                                            <div className={tctr + pri + fwBold} style={cellStyle(w(cols[7].cm))}>
                                                {expenseItem.expenseValue}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Rounded Off row (measured 0.55cm) aligned to last columns */}
                        <div style={{ display: "flex", width: "100%", height: cm(H_ROUND_ROW) }} className={pri}>
                            <div className={pri} style={cellStyle(w(cols[0].cm))} />
                            <div className={pri} style={cellStyle(w(cols[1].cm))} />
                            <div className={pri} style={cellStyle(w(cols[2].cm))} />
                            <div className={pri} style={cellStyle(w(cols[3].cm))} />
                            <div className={pri} style={cellStyle(w(cols[4].cm))} />

                            <div className={pri} style={cellStyle(w(cols[5].cm + cols[6].cm))}>
                                <span className={invLabel}>Rounded Off</span>
                            </div>

                            <div className={pri + tleft} style={cellStyle(w(cols[7].cm))}>
                                {data.roundOffValue}
                            </div>
                        </div>

                        {/* Net row (measured 0.95cm) using your measured bottom split 12.3 / 5.45 */}
                        <div style={{ display: "flex", width: "100%" }}>
                            <div
                                style={{
                                    width: pct(bottomRow.left, bottomRowTotal),
                                    height: cm(H_NET_ROW),
                                    boxSizing: "border-box",
                                }}
                                className={b + pri}
                            />
                            <div
                                style={{
                                    width: pct(bottomRow.right, bottomRowTotal),
                                    height: cm(H_NET_ROW),
                                    padding: cm(0.15),
                                    boxSizing: "border-box",
                                    fontSize,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    fontWeight: "bold",
                                }}
                                className={b + pri}
                            >
                                <span className={invLabel}>Net</span>
                                <span>{netAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Bottom big boxes (measured 2.75cm) */}
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                            <div
                                style={{
                                    width: pct(bottomRow.left, bottomRowTotal),
                                    height: cm(H_BOTTOM),
                                    boxSizing: "border-box",
                                    display: "flex",
                                }}
                                className={b + pri}
                            >
                                <div style={{ fontSize: "12px", padding: cm(0.15) }}>
                                    {numberToWords(parseInt(netAmount))}
                                    {hsnSummary.map((h, i) => (
                                        <div className="hsnRow" key={i}>
                                            <div className="hsnCode" style={{ fontSize: hsnFont }}>
                                                {h.hsn || ""}
                                            </div>
                                            <div className="hsnAmt" style={{ fontSize: hsnFont }}>
                                                {NumberFormat(h.amount)}
                                            </div>
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
                                    height: cm(H_BOTTOM),
                                    padding: cm(0.15),
                                    boxSizing: "border-box",
                                    fontSize: "10px",
                                }}
                                className={b + pri}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceTemplate;
