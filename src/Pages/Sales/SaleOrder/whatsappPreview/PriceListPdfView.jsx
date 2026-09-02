import React, { useEffect, useState, useRef } from "react";
import { fetchLink } from "../../../../Components/fetchComponent";




const getTodayDate = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return getTodayDate();
    return dateStr.split("T")[0].split("-").reverse().join("-");
};

const WEIGHT_RE = /^(.*?)\s*(\d+\s*(?:KGS?|GMS?|G|LTR|L|ML))\s*$/i;

const extractBaseName = (name = "") => {
    const m = name.trim().match(WEIGHT_RE);
    return m ? m[1].trim() : name.trim();
};

const extractWeight = (name = "") => {
    const m = name.trim().match(WEIGHT_RE);
    return m ? m[2].trim().toUpperCase() : null;
};

const mergeWeightVariants = (data) => {
    const map = new Map();

    data.forEach((item) => {
        const modifiedName = (item.Item_Name_Modified || "").trim();
        const shortName = (item.Short_Name || "").trim();
        const productName = (item.Product_Name || "").trim();

        const baseName = extractBaseName(modifiedName) || extractBaseName(productName);
        const weight = extractWeight(productName);
        const shortBase = extractBaseName(shortName) || shortName;
        const rate = item.Max_Rate;
        const brand = item.POS_Brand_Name || "Other";

        const key = `${brand}__${baseName.toUpperCase()}__${rate}`;

        if (map.has(key)) {
            const existing = map.get(key);
            const w = weight?.toUpperCase();
            if (w && !existing._weights.includes(w)) {
                existing._weights.push(w);
                existing._displayName = `${existing._shortBase} ${existing._weights.join(" & ")}`;
            }
        } else {
            const weights = weight ? [weight.toUpperCase()] : [];
            map.set(key, {
                ...item,
                _weights: weights,
                _shortBase: shortBase,
                _displayName: weights.length ? `${shortBase} ${weights[0]}` : shortBase,
            });
        }
    });

    return Array.from(map.values());
};

const sortByLevels = (data) => {
    return [...data].sort((a, b) => {
        const brandLevelA = a.Brand_Level !== null && a.Brand_Level !== undefined ? Number(a.Brand_Level) : 999;
        const brandLevelB = b.Brand_Level !== null && b.Brand_Level !== undefined ? Number(b.Brand_Level) : 999;
        if (brandLevelA !== brandLevelB) return brandLevelA - brandLevelB;

        const itemLevelA = a.Item_Level !== null && a.Item_Level !== undefined ? Number(a.Item_Level) : 999;
        const itemLevelB = b.Item_Level !== null && b.Item_Level !== undefined ? Number(b.Item_Level) : 999;
        if (itemLevelA !== itemLevelB) return itemLevelA - itemLevelB;

        const brandNameA = (a.POS_Brand_Name || "").toLowerCase();
        const brandNameB = (b.POS_Brand_Name || "").toLowerCase();
        if (brandNameA !== brandNameB) return brandNameA.localeCompare(brandNameB);

        const productNameA = (a.Short_Name || a.Product_Name || "").toLowerCase();
        const productNameB = (b.Short_Name || b.Product_Name || "").toLowerCase();
        return productNameA.localeCompare(productNameB);
    });
};

const groupByBrand = (data) =>
    data.reduce((acc, item) => {
        const key = item.POS_Brand_Name || "Other";
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

const numberFormat = (Max_Rate) => new Intl.NumberFormat("en-IN").format(Max_Rate);

const convertTo12HourFormat = (dateTimeString) => {
    if (!dateTimeString) return null;
    const timePart = dateTimeString.split("T")[1];
    if (!timePart) return null;
    const [hours, minutes] = timePart.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
};

/**
 * PriceListPdfView — "common print format" template for the Rate Master /
 * Price List, matching the same shape as SaleOrderPdfView / SaleInvoicePdfView /
 * StatementPdfView: it is rendered off-screen by Whatsapp.jsx, fetches its own
 * data, and calls onReady() once painted so the parent can capture it with
 * html2canvas → jsPDF. It never fetches by Company_id from the URL and never
 * auto-downloads a PDF itself — that responsibility belongs to the parent.
 */
const PriceListPdfView = ({ row, companyInfo, onReady, onError }) => {
    const [posData, setPosData] = useState([]);
    const [timeFor, setTimeFor] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const firedRef = useRef(false);

    useEffect(() => {
        let cancelled = false;

        const fetchRates = async () => {
            try {
                const response = await fetchLink({
                    address: "masters/rateDetails",
                    loadingOn: () => {},
                    loadingOff: () => {},
                });

                if (cancelled) return;

                const data =
                    response?.data?.posActiveDetails ??
                    (Array.isArray(response?.data) ? response.data : []);
                const latestRateTime = response?.data?.metadata?.latestRateTime;

                if (!Array.isArray(data) || data.length === 0) {
                    throw new Error("No rate data found");
                }

                setTimeFor(convertTo12HourFormat(latestRateTime) || "");
                setPosData(data);
            } catch (e) {
                if (cancelled) return;
                console.error("PriceListPdfView fetch error:", e);
                setError(e?.message || "Failed to load rate master data");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchRates();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (firedRef.current) return;

        if (error) {
            firedRef.current = true;
            onError?.(new Error(error));
            return;
        }

        if (!loading && posData.length > 0) {
            firedRef.current = true;
            // small delay so layout/fonts settle before html2canvas captures it
            const t = setTimeout(() => onReady?.(), 300);
            return () => clearTimeout(t);
        }
    }, [loading, error, posData, onReady, onError]);

    if (loading) {
        return (
            <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
                Loading rate master…
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial, sans-serif", color: "#c0392b" }}>
                {error}
            </div>
        );
    }

    const activeData = posData.filter((i) => i.Is_Active_Decative === 1);
    const mergedData = mergeWeightVariants(activeData);
    const sortedData = sortByLevels(mergedData);
    const activeGroups = groupByBrand(sortedData);
    const rateDate = posData[0]?.Rate_Date ? formatDate(posData[0].Rate_Date) : getTodayDate();

    const companyName = companyInfo?.[0]?.Company_Name || row?.retailerNameGet ? companyInfo?.[0]?.Company_Name : "Company";

    const thStyle = {
        padding: "8px 8px",
        backgroundColor: "#FFFF00",
        fontWeight: "bold",
        fontSize: 10,
        textAlign: "left",
    };

    const tdStyle = {
        border: "0.01px solid #000",
        padding: "3px 3px",
        fontSize: 9,
    };

    const brandStyle = {
        backgroundColor: "#28a745",
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 10,
        padding: "3px 3px",
        textAlign: "center",
    };

    const renderGroup = (groups) => {
        const entries = Object.entries(groups);
        return entries.map(([brandName, products]) => {
            const pairs = [];
            const halfLength = Math.ceil(products.length / 2);

            for (let i = 0; i < halfLength; i++) {
                const leftItem = products[i];
                const rightItem = products[i + halfLength] || null;
                pairs.push([leftItem, rightItem]);
            }

            return (
                <React.Fragment key={brandName}>
                    <tr>
                        <td colSpan={4} style={brandStyle}>{brandName}</td>
                    </tr>
                    {pairs.map(([left, right], i) => (
                        <tr key={i}>
                            <td style={tdStyle}>
                                {left?._weights?.length >= 2 ? left._displayName : (left?.Short_Name || "-")}
                            </td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>
                                {numberFormat(left?.Max_Rate ?? "-")}
                            </td>
                            <td style={tdStyle}>
                                {right ? (right?._weights?.length >= 2 ? right._displayName : (right?.Short_Name || "-")) : ""}
                            </td>
                            <td style={{ ...tdStyle, textAlign: "right" }}>
                                {right ? numberFormat(right?.Max_Rate ?? "-") : ""}
                            </td>
                        </tr>
                    ))}
                </React.Fragment>
            );
        });
    };

    return (
        <div
            style={{
                padding: 20,
                backgroundColor: "#fff",
                fontSize: 11,
                lineHeight: "1.4",
                width: "100%",
                boxSizing: "border-box",
                fontFamily: "Arial, sans-serif",
            }}
        >
            <div style={{ marginBottom: 12 }}>
                <h2 style={{ textAlign: "center", margin: "0 0 4px", fontSize: 16, fontWeight: "bold" }}>
                    {rateDate} {timeFor}, {companyName} - Price List
                </h2>
            </div>

            {mergedData.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 20, border: "1px solid #000" }}>
                    <thead>
                        <tr>
                            <th style={{ ...thStyle, width: "35%" }}>Product Name</th>
                            <th style={{ ...thStyle, textAlign: "right", width: "15%" }}>Rate (₹)</th>
                            <th style={{ ...thStyle, width: "35%" }}>Product Name</th>
                            <th style={{ ...thStyle, textAlign: "right", width: "15%" }}>Rate (₹)</th>
                        </tr>
                    </thead>
                    <tbody>{renderGroup(activeGroups)}</tbody>
                </table>
            ) : (
                <div style={{ textAlign: "center", padding: 40, color: "#999" }}>No active products found</div>
            )}

            <div style={{ textAlign: "center", marginTop: 10, fontSize: 10, color: "#888" }}>
                This is a Computer Generated Rate Master
            </div>
        </div>
    );
};

export default PriceListPdfView;