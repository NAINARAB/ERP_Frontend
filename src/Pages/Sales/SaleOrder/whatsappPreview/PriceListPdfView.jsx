// import React, { useEffect, useState, useRef } from "react";
// import { fetchLink } from "../../../../Components/fetchComponent";

// const getTodayDate = () => {
//     const d = new Date();
//     return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
// };

// const formatDate = (dateStr) => {
//     if (!dateStr) return getTodayDate();
//     return dateStr.split("T")[0].split("-").reverse().join("-");
// };

// const WEIGHT_RE = /^(.*?)\s*(\d+\s*(?:KGS?|GMS?|G|LTR|L|ML))\s*$/i;

// const extractBaseName = (name = "") => {
//     const m = name.trim().match(WEIGHT_RE);
//     return m ? m[1].trim() : name.trim();
// };

// const extractWeight = (name = "") => {
//     const m = name.trim().match(WEIGHT_RE);
//     return m ? m[2].trim().toUpperCase() : null;
// };

// const mergeWeightVariants = (data) => {
//     const map = new Map();

//     data.forEach((item) => {
//         const modifiedName = (item.Item_Name_Modified || "").trim();
//         const shortName = (item.Short_Name || "").trim();
//         const productName = (item.Product_Name || "").trim();

//         const baseName = extractBaseName(modifiedName) || extractBaseName(productName);
//         const weight = extractWeight(productName);
//         const shortBase = extractBaseName(shortName) || shortName;
//         const rate = item.Max_Rate;
//         const brand = item.POS_Brand_Name || "Other";

//         const key = `${brand}__${baseName.toUpperCase()}__${rate}`;

//         if (map.has(key)) {
//             const existing = map.get(key);
//             const w = weight?.toUpperCase();
//             if (w && !existing._weights.includes(w)) {
//                 existing._weights.push(w);
//                 existing._displayName = `${existing._shortBase} ${existing._weights.join(" & ")}`;
//             }
//         } else {
//             const weights = weight ? [weight.toUpperCase()] : [];
//             map.set(key, {
//                 ...item,
//                 _weights: weights,
//                 _shortBase: shortBase,
//                 _displayName: weights.length ? `${shortBase} ${weights[0]}` : shortBase,
//             });
//         }
//     });

//     return Array.from(map.values());
// };

// const sortByLevels = (data) => {
//     return [...data].sort((a, b) => {
//         const brandLevelA = a.Brand_Level !== null && a.Brand_Level !== undefined ? Number(a.Brand_Level) : 999;
//         const brandLevelB = b.Brand_Level !== null && b.Brand_Level !== undefined ? Number(b.Brand_Level) : 999;
//         if (brandLevelA !== brandLevelB) return brandLevelA - brandLevelB;

//         const itemLevelA = a.Item_Level !== null && a.Item_Level !== undefined ? Number(a.Item_Level) : 999;
//         const itemLevelB = b.Item_Level !== null && b.Item_Level !== undefined ? Number(b.Item_Level) : 999;
//         if (itemLevelA !== itemLevelB) return itemLevelA - itemLevelB;

//         const brandNameA = (a.POS_Brand_Name || "").toLowerCase();
//         const brandNameB = (b.POS_Brand_Name || "").toLowerCase();
//         if (brandNameA !== brandNameB) return brandNameA.localeCompare(brandNameB);

//         const productNameA = (a.Short_Name || a.Product_Name || "").toLowerCase();
//         const productNameB = (b.Short_Name || b.Product_Name || "").toLowerCase();
//         return productNameA.localeCompare(productNameB);
//     });
// };

// const groupByBrand = (data) =>
//     data.reduce((acc, item) => {
//         const key = item.POS_Brand_Name || "Other";
//         if (!acc[key]) acc[key] = [];
//         acc[key].push(item);
//         return acc;
//     }, {});

// const numberFormat = (Max_Rate) => new Intl.NumberFormat("en-IN").format(Max_Rate);

// const convertTo12HourFormat = (dateTimeString) => {
//     if (!dateTimeString) return null;
//     const timePart = dateTimeString.split("T")[1];
//     if (!timePart) return null;
//     const [hours, minutes] = timePart.split(":");
//     const hour = parseInt(hours, 10);
//     const period = hour >= 12 ? "PM" : "AM";
//     const hour12 = hour % 12 || 12;
//     return `${hour12}:${minutes} ${period}`;
// };


// const PriceListPdfView = ({ row, companyInfo, onReady, onError }) => {
//     const [posData, setPosData] = useState([]);
//     const [timeFor, setTimeFor] = useState("");
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const firedRef = useRef(false);

//     useEffect(() => {
//         let cancelled = false;

//         const fetchRates = async () => {
//             try {
//                 const response = await fetchLink({
//                     address: "masters/rateDetails",
//                     loadingOn: () => {},
//                     loadingOff: () => {},
//                 });

//                 if (cancelled) return;

//                 const data =
//                     response?.data?.posActiveDetails ??
//                     (Array.isArray(response?.data) ? response.data : []);
//                 const latestRateTime = response?.data?.metadata?.latestRateTime;

//                 if (!Array.isArray(data) || data.length === 0) {
//                     throw new Error("No rate data found");
//                 }

//                 setTimeFor(convertTo12HourFormat(latestRateTime) || "");
//                 setPosData(data);
//             } catch (e) {
//                 if (cancelled) return;
//                 console.error("PriceListPdfView fetch error:", e);
//                 setError(e?.message || "Failed to load rate master data");
//             } finally {
//                 if (!cancelled) setLoading(false);
//             }
//         };

//         fetchRates();
//         return () => { cancelled = true; };
//     }, []);

//     useEffect(() => {
//         if (firedRef.current) return;

//         if (error) {
//             firedRef.current = true;
//             onError?.(new Error(error));
//             return;
//         }

//         if (!loading && posData.length > 0) {
//             firedRef.current = true;
            
//             const t = setTimeout(() => onReady?.(), 300);
//             return () => clearTimeout(t);
//         }
//     }, [loading, error, posData, onReady, onError]);

//     if (loading) {
//         return (
//             <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial, sans-serif" }}>
//                 Loading rate master…
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div style={{ padding: 40, textAlign: "center", fontFamily: "Arial, sans-serif", color: "#c0392b" }}>
//                 {error}
//             </div>
//         );
//     }

//     const activeData = posData.filter((i) => i.Is_Active_Decative === 1);
//     const mergedData = mergeWeightVariants(activeData);
//     const sortedData = sortByLevels(mergedData);
//     const activeGroups = groupByBrand(sortedData);
//     const rateDate = posData[0]?.Rate_Date ? formatDate(posData[0].Rate_Date) : getTodayDate();

//     const companyName = companyInfo?.[0]?.Company_Name || row?.retailerNameGet ? companyInfo?.[0]?.Company_Name : "Company";

//     // Responsive styles
//     const thStyle = {
//         padding: "clamp(4px, 0.8vw, 8px) clamp(3px, 0.6vw, 8px)",
//         backgroundColor: "#FFFF00",
//         fontWeight: "bold",
//         fontSize: "clamp(10px, 1.1vw, 14px)",
//         textAlign: "left",
//         border: "1px solid #000",
//         whiteSpace: "nowrap",
//     };

//     const tdStyle = {
//         border: "0.01px solid #000",
//         padding: "clamp(2px, 0.5vw, 4px) clamp(2px, 0.4vw, 6px)",
//         fontSize: "clamp(9px, 1vw, 13px)",
//         wordBreak: "break-word",
//     };

//     const brandStyle = {
//         backgroundColor: "#28a745",
//         color: "#FFFFFF",
//         fontWeight: "bold",
//         fontSize: "clamp(10px, 1.2vw, 14px)",
//         padding: "clamp(3px, 0.6vw, 6px) clamp(3px, 0.6vw, 8px)",
//         textAlign: "center",
//         border: "1px solid #000",
//     };

//     const renderGroup = (groups) => {
//         const entries = Object.entries(groups);
//         return entries.map(([brandName, products]) => {
//             const pairs = [];
//             const halfLength = Math.ceil(products.length / 2);

//             for (let i = 0; i < halfLength; i++) {
//                 const leftItem = products[i];
//                 const rightItem = products[i + halfLength] || null;
//                 pairs.push([leftItem, rightItem]);
//             }

//             return (
//                 <React.Fragment key={brandName}>
//                     <tr>
//                         <td colSpan={4} style={brandStyle}>{brandName}</td>
//                     </tr>
//                     {pairs.map(([left, right], i) => (
//                         <tr key={i}>
//                             <td style={tdStyle}>
//                                 {left?._weights?.length >= 2 ? left._displayName : (left?.Short_Name || "-")}
//                             </td>
//                             <td style={{ ...tdStyle, textAlign: "right", fontWeight: "500" }}>
//                                 {numberFormat(left?.Max_Rate ?? "-")}
//                             </td>
//                             <td style={tdStyle}>
//                                 {right ? (right?._weights?.length >= 2 ? right._displayName : (right?.Short_Name || "")) : ""}
//                             </td>
//                             <td style={{ ...tdStyle, textAlign: "right", fontWeight: "500" }}>
//                                 {right ? numberFormat(right?.Max_Rate ?? "-") : ""}
//                             </td>
//                         </tr>
//                     ))}
//                 </React.Fragment>
//             );
//         });
//     };

//     return (
//         <div
//             style={{
//                 padding: "clamp(10px, 2%, 25px)",
//                 backgroundColor: "#fff",
//                 fontSize: "clamp(9px, 1vw, 13px)",
//                 lineHeight: "1.4",
//                 width: "auto",
//                 minWidth: "280px",
//                 maxWidth: "100%",
//                 boxSizing: "border-box",
//                 fontFamily: "Arial, sans-serif",
//                 margin: "0 auto",
//                 overflowX: "auto",
//             }}
//         >
//             <div style={{ marginBottom: "clamp(8px, 1.5vh, 16px)" }}>
//                 <h2 style={{ 
//                     textAlign: "center", 
//                     margin: "0 0 clamp(2px, 0.5vh, 8px)", 
//                     fontSize: "clamp(12px, 1.8vw, 20px)", 
//                     fontWeight: "bold",
//                     wordBreak: "break-word",
//                 }}>
//                     {rateDate} {timeFor}, {companyName} - Price List
//                 </h2>
//             </div>

//             {mergedData.length > 0 ? (
//                 <div style={{ width: "100%", overflowX: "auto" }}>
//                     <table style={{ 
//                         width: "100%", 
//                         minWidth: "300px",
//                         borderCollapse: "collapse", 
//                         marginBottom: "clamp(10px, 2vh, 20px)", 
//                         border: "1px solid #000",
//                         tableLayout: "auto",
//                     }}>
//                         <thead>
//                             <tr>
//                                 <th style={{ 
//                                     ...thStyle, 
//                                     width: "auto",
//                                     minWidth: "80px",
//                                 }}>Product Name</th>
//                                 <th style={{ 
//                                     ...thStyle, 
//                                     textAlign: "right", 
//                                     width: "auto",
//                                     minWidth: "60px",
//                                 }}>Rate (₹)</th>
//                                 <th style={{ 
//                                     ...thStyle, 
//                                     width: "auto",
//                                     minWidth: "80px",
//                                 }}>Product Name</th>
//                                 <th style={{ 
//                                     ...thStyle, 
//                                     textAlign: "right", 
//                                     width: "auto",
//                                     minWidth: "60px",
//                                 }}>Rate (₹)</th>
//                             </tr>
//                         </thead>
//                         <tbody>{renderGroup(activeGroups)}</tbody>
//                     </table>
//                 </div>
//             ) : (
//                 <div style={{ textAlign: "center", padding: "clamp(20px, 5vh, 40px)", color: "#999" }}>
//                     No active products found
//                 </div>
//             )}

//             <div style={{ 
//                 textAlign: "center", 
//                 marginTop: "clamp(8px, 1.5vh, 15px)", 
//                 fontSize: "clamp(8px, 0.8vw, 11px)", 
//                 color: "#888",
//                 padding: "clamp(2px, 0.3vh, 5px)",
//             }}>
//                 This is a Computer Generated Rate Master
//             </div>
//         </div>
//     );
// };

// export default PriceListPdfView;


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

    // Responsive styles - INCREASED FONT SIZES (+20% + 2px)
    const thStyle = {
        padding: "clamp(4px, 0.8vw, 8px) clamp(3px, 0.6vw, 8px)",
        backgroundColor: "#FFFF00",
        fontWeight: "bold",
        fontSize: "clamp(16px, 1.2vw, 21px)",
        textAlign: "left",
        border: "1px solid #000",
        whiteSpace: "nowrap",
    };

    const tdStyle = {
        border: "0.01px solid #000",
        padding: "clamp(2px, 0.5vw, 4px) clamp(2px, 0.4vw, 6px)",
        fontSize: "clamp(16px, 1.14vw, 20px)",
        wordBreak: "break-word",
    };

    const brandStyle = {
        backgroundColor: "#28a745",
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: "clamp(16px, 1.26vw, 21px)",
        padding: "clamp(3px, 0.6vw, 6px) clamp(3px, 0.6vw, 8px)",
        textAlign: "center",
        border: "1px solid #000",
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
                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: "500" }}>
                                {numberFormat(left?.Max_Rate ?? "-")}
                            </td>
                            <td style={tdStyle}>
                                {right ? (right?._weights?.length >= 2 ? right._displayName : (right?.Short_Name || "")) : ""}
                            </td>
                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: "500" }}>
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
                padding: "clamp(10px, 2%, 25px)",
                backgroundColor: "#fff",
                fontSize: "clamp(15px, 1.08vw, 19px)",
                lineHeight: "1.4",
                width: "auto",
                minWidth: "280px",
                maxWidth: "100%",
                boxSizing: "border-box",
                fontFamily: "Arial, sans-serif",
                margin: "0 auto",
                overflowX: "auto",
            }}
        >
            <div style={{ marginBottom: "clamp(8px, 1.5vh, 16px)" }}>
                <h2 style={{ 
                    textAlign: "center", 
                    margin: "0 0 clamp(2px, 0.5vh, 8px)", 
                    fontSize: "clamp(19px, 1.8vw, 24px)", 
                    fontWeight: "bold",
                    wordBreak: "break-word",
                }}>
                    {rateDate} {timeFor}, {companyName} - Price List
                </h2>
            </div>

            {mergedData.length > 0 ? (
                <div style={{ width: "100%", overflowX: "auto" }}>
                    <table style={{ 
                        width: "100%", 
                        minWidth: "300px",
                        borderCollapse: "collapse", 
                        marginBottom: "clamp(10px, 2vh, 20px)", 
                        border: "1px solid #000",
                        tableLayout: "auto",
                    }}>
                        <thead>
                            <tr>
                                <th style={{ 
                                    ...thStyle, 
                                    width: "auto",
                                    minWidth: "80px",
                                }}>Product Name</th>
                                <th style={{ 
                                    ...thStyle, 
                                    textAlign: "right", 
                                    width: "auto",
                                    minWidth: "60px",
                                }}>Rate (₹)</th>
                                <th style={{ 
                                    ...thStyle, 
                                    width: "auto",
                                    minWidth: "80px",
                                }}>Product Name</th>
                                <th style={{ 
                                    ...thStyle, 
                                    textAlign: "right", 
                                    width: "auto",
                                    minWidth: "60px",
                                }}>Rate (₹)</th>
                            </tr>
                        </thead>
                        <tbody>{renderGroup(activeGroups)}</tbody>
                    </table>
                </div>
            ) : (
                <div style={{ textAlign: "center", padding: "clamp(20px, 5vh, 40px)", color: "#999" }}>
                    No active products found
                </div>
            )}

            <div style={{ 
                textAlign: "center", 
                marginTop: "clamp(8px, 1.5vh, 15px)", 
                fontSize: "clamp(14px, 0.84vw, 16px)", 
                color: "#888",
                padding: "clamp(2px, 0.3vh, 5px)",
            }}>
                This is a Computer Generated Rate Master
            </div>
        </div>
    );
};

export default PriceListPdfView;