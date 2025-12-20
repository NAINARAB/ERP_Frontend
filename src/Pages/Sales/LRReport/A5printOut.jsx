import { useEffect, useRef, useState } from "react";
import { ISOString, numberToWords } from "../../../Components/functions";
import "./printoutStyle.css";
import { fetchLink } from "../../../Components/fetchComponent";
import { useReactToPrint } from 'react-to-print';
import { Button } from "@mui/material";
import { Print } from "@mui/icons-material";
import smtQRcode from '../../../assets/smtQRcode.jpg'

const val = (v, fallback = "") => (v === null || v === undefined ? fallback : v);

const fmtMoney = (v) => {
    if (v === null || v === undefined || v === "") return "";
    if (typeof v === "string") return v;
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDateDDMMYYYY = (iso) => {
    if (!iso) return "";
    const data = new Date(iso);
    const dd = String(data.getDate()).padStart(2, "0");
    const mm = String(data.getMonth() + 1).padStart(2, "0");
    const yy = data.getFullYear();
    return `${dd}-${mm}-${yy}`;
};

const findStaffName = (arr, involvedType) => {
    if (!Array.isArray(arr)) return "";
    const row = arr.find(
        (x) => String(x?.Involved_Emp_Type || "").toLowerCase() === String(involvedType).toLowerCase()
    );
    return row?.Emp_Name || "";
};

const groupHSNSummary = (productsList) => {
    const map = new Map();
    (productsList || []).forEach((p) => {
        const hsn = p?.HSN_Code || "";
        const amt = Number(p?.Amount ?? p?.Final_Amo ?? 0);
        map.set(hsn, (map.get(hsn) || 0) + (Number.isNaN(amt) ? 0 : amt));
    });
    return Array.from(map.entries()).map(([hsn, amount]) => ({ hsn, amount }));
};

const BillOfSupplyA5 = ({ Do_Id, Do_Date, loadingOn, loadingOff }) => {
    const [data, setData] = useState({});
    const printRef = useRef(null);

    useEffect(() => {
        if (!Do_Id || !Do_Date) return;
        fetchLink({
            address: `sales/salesInvoice?
            Fromdate=${ISOString(Do_Date)}&
            Todate=${ISOString(Do_Date)}&
            Do_Id=${Do_Id}&
            Cancel_status=1`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setData(data?.data[0] || {})
            }
        }).catch(e => console.error(e));
    }, [Do_Id, Do_Date]);

    const companyOverride = data.company || {};
    const buyerOverride = data.buyer || {};

    const company = {
        name: companyOverride.name ?? data.Branch_Name ?? "S.M.TRADERS",
        hoLine: companyOverride.hoLine ?? "H.O : 153, Chitrakara Street, Madurai - 01",
        goLine: companyOverride.goLine ?? "G.O : 746, Puliyur, Sayanapuram, Svga",
        billTitle: companyOverride.billTitle ?? "Bill of Supply -Disclaimer Affidavit Filed-Exempted",
        gstin: companyOverride.gstin ?? "33AADES4987M1ZL",
        phone1: companyOverride.phone1 ?? "0452 - 4371625",
        phone2: companyOverride.phone2 ?? "9786131353",
        fssai: companyOverride.fssai ?? "12418012000176",
        logoSrc: companyOverride.logoSrc ?? "",
    };

    const buyer = {
        name: buyerOverride.name ?? data.Retailer_Name ?? "",
        address: buyerOverride.address ?? "",
        phone: buyerOverride.phone ?? "",
        gstin: buyerOverride.gstin ?? "",
    };

    const invoice = {
        date: fmtDateDDMMYYYY(data.Do_Date),
        salesTag: data.VoucherTypeGet ?? "",
        billNo: data.Do_Inv_No ?? "",
        copyTag: "(ORIGINAL FOR RECIPIENT)",
        broker: findStaffName(data.Staffs_Array, "Broker"),
        transport: findStaffName(data.Staffs_Array, "Transport"),
    };

    const items = Array.isArray(data.Products_List)
        ? data.Products_List.map((p, idx) => ({
            no: p?.S_No ?? idx + 1,
            name: p?.Product_Name ?? p?.Item_Name ?? "",
            subName: "",
            hsn: p?.HSN_Code ?? "",
            gst: p?.Tax_Rate ? `${p.Tax_Rate}%` : "",
            bags: val(p?.Alt_Act_Qty, ""),
            rate: p?.Item_Rate ?? p?.Taxable_Rate ?? "",
            qty: p?.Bill_Qty ?? p?.Act_Qty ?? "",
            amount: p?.Amount ?? p?.Final_Amo ?? "",
        }))
        : [];

    const chargesFromApi = Array.isArray(data.Expence_Array)
        ? data.Expence_Array.map((e) => ({
            label: e?.Expence_Name ?? "",
            amount: e?.Expence_Value ?? e?.Expence_Value_CR ?? "",
        }))
        : [];

    const charges = [
        ...chargesFromApi,
        { label: "Cash Discount @ 1%", amount: "" },
        { label: "Rounded Off", amount: data.Round_off ?? "" },
    ];

    const hsnSummary = groupHSNSummary(data.Products_List);

    const netAmount = data.Total_Invoice_value ?? 0;
    const amountInWords = numberToWords(netAmount);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    return (
        <div className="d-flex flex-column align-items-center justify-content-center">
            <Button onClick={handlePrint} startIcon={<Print />}>Print</Button>
            <div className="a5-page" style={{ width: "210mm" }} ref={printRef}>
                <div className="bill-box">
                    {/* TOP HEADER BLOCK */}
                    <div className="top-header">
                        <div >
                            <div className="companyCenter">
                                <div className="companyName">{val(data.Branch_Name, "S.M.TRADERS")}</div>
                                <div className="companyLines">
                                    <div>{val(company.hoLine, "H.O : 153, Chitrakara Street, Madurai - 01")}</div>
                                    <div>{val(company.goLine, "G.O : 746, Puliyur, Sayanapuram, Svga")}</div>
                                    <div className="billTitle">
                                        {val(company.billTitle, "Bill of Supply -Disclaimer Affidavit Filed-Exempted")}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="top-right">
                            <div className="kv">
                                <span className="k">GSTIN :</span>
                                <span className="v">{val(company.gstin, "33AADES4987M1ZL")}</span>
                            </div>
                            <div className="kv">
                                <span className="k">Phone :</span>
                                <span className="v">{val(company.phone1, "0452 - 4371625")}</span>
                            </div>
                            <div className="kv">
                                <span className="k"></span>
                                <span className="v">{val(company.phone2, "9786131353")}</span>
                            </div>
                            <div className="kv">
                                <span className="k">FSSAI No. :</span>
                                <span className="v">{val(company.fssai, "12418012000176")}</span>
                            </div>
                        </div>
                    </div>

                    {/* PARTY + INVOICE META */}
                    <div className="party-meta">
                        <div className="party-left">
                            <div className="toRow">
                                <span className="toLabel">To</span>
                            </div>
                            <div className="addressBlock">
                                <div className="buyerName">{val(buyer.name, "")}</div>
                                <div className="buyerAddr">{val(buyer.address, "")}</div>
                                <div className="buyerPhone">{val(buyer.phone, "")}</div>
                                <div className="buyerGstin">
                                    <span className="gstLabel">GSTIN :</span>{" "}
                                    <span className="gstValue">{val(buyer.gstin, "")}</span>
                                </div>
                            </div>
                        </div>

                        <div className="party-right">
                            <div className="metaRow metaTop">
                                <div className="metaKV">
                                    <span className="k">Date :</span>
                                    <span className="v">{val(invoice.date, "")}</span>
                                </div>
                                <div className="metaTag">{val(invoice.salesTag, "")}</div>
                            </div>

                            <div className="metaRow">
                                <div className="metaKV">
                                    <span className="k">Bill No. :</span>
                                    <span className="v billNo">{val(invoice.billNo, "")}</span>
                                </div>
                                <div className="metaItalic">{val(invoice.copyTag, "(ORIGINAL FOR RECIPIENT)")}</div>
                            </div>

                            <div className="metaRow">
                                <div className="metaKV">
                                    <span className="k">Broker :</span>
                                    <span className="v">{val(invoice.broker, "")}</span>
                                </div>
                                <div className="metaKV">
                                    <span className="k">Transport :</span>
                                    <span className="v">{val(invoice.transport, "")}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <table className="itemsTable">
                        <thead>
                            <tr>
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
                            {items.length === 0 ? (
                                <tr className="emptyRow">
                                    <td colSpan={8}> </td>
                                </tr>
                            ) : (
                                items.map((it, idx) => (
                                    <tr key={idx}>
                                        <td className="t-center">{val(it.no, idx + 1)}</td>
                                        <td className="t-left">
                                            <div className="itemName">{val(it.name, "")}</div>
                                            {it.subName ? <div className="itemSub">{it.subName}</div> : null}
                                        </td>
                                        <td className="t-center">{val(it.hsn, "")}</td>
                                        <td className="t-center">{val(it.gst, "")}</td>
                                        <td className="t-center">{val(it.bags, "")}</td>
                                        <td className="t-right">{fmtMoney(it.rate)}</td>
                                        <td className="t-center">{val(it.qty, "")}</td>
                                        <td className="t-right">{fmtMoney(it.amount)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* CHARGES AREA */}
                    <div className="postTable">
                        <div className="postLeft" />
                        <div className="postRight">
                            {charges.map((c, i) => (
                                <div className="chargeRow" key={i}>
                                    <div className="chargeLabel">{val(c.label, "")}</div>
                                    <div className="chargeAmt">{fmtMoney(c.amount)}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* BANK LINE */}
                    <div className="bankLine">
                        <div className="bankText">
                            {val(data.bankLine, "TMB A/C NO: 002530350870041 IFSC: TMBL0000002")}
                        </div>
                    </div>

                    {/* BOTTOM AREA */}
                    <div className="bottomArea">
                        {/* LEFT */}
                        <div className="bottomLeft">
                            <div className="inWords">{val(data.amountInWords, amountInWords)}</div>

                            <div className="hsnSummary">
                                {hsnSummary.map((h, i) => (
                                    <div className="hsnRow" key={i}>
                                        <div className="hsnCode">{val(h.hsn, "")}</div>
                                        <div className="hsnAmt">{fmtMoney(h.amount)}</div>
                                    </div>
                                ))}

                                {/* Optional subtotal row (use Total_Before_Tax from API) */}
                                {data.Total_Before_Tax !== undefined && data.Total_Before_Tax !== null ? (
                                    <div className="subTotalRow">
                                        <div className="subTotalLabel">{val(data.subTotalLabel, "")}</div>
                                        <div className="subTotalAmt">{fmtMoney(data.Total_Before_Tax)}</div>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* MIDDLE QR */}
                        <div className="bottomMid">
                            <div className="qrBox">
                                {data.qrCodeSrc ? (
                                    <img className="qrImg" src={data.qrCodeSrc} alt="QR" />
                                ) : (
                                    <div >
                                        {/* <div className="qrSquare" />
                                        <div className="qrSquare" />
                                        <div className="qrSquare" /> */}
                                        <img src={smtQRcode} alt="QR" style={{ height: "100%", width: "160px" }} />
                                    </div>
                                )}

                                {/* <div className="qrCaption">
                                    <div className="upiId">{val(data.upiId, "smtrad@tmb")}</div>
                                    <div className="qrCompany">{val(data.Branch_Name, "S.M.TRADERS")}</div>
                                </div> */}
                            </div>
                        </div>

                        {/* RIGHT NET + SIGN */}
                        <div className="bottomRight">
                            <div className="netBox">
                                <div className="netLabel">{val(data.netLabel, "Net")}</div>
                                <div className="netValue">{fmtMoney(netAmount)}</div>
                            </div>

                            <div className="signArea">
                                <div className="forText">{val(data.forLabel, `For ${val(data.Branch_Name, "S.M.TRADERS")}`)}</div>
                                {/* <div className="signBox">
                                    {data.signatureSrc ? (
                                        <img className="signImg" src={data.signatureSrc} alt="Signature" />
                                    ) : (
                                        <div className="signPlaceholder" />
                                    )}
                                </div> */}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default BillOfSupplyA5;
