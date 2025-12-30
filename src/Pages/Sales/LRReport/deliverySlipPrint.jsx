// // import { useEffect, useRef, useState } from "react";
// // import { fetchLink } from "../../../Components/fetchComponent";
// // import { useReactToPrint } from 'react-to-print';
// // import { checkIsNumber, LocalDateWithTime, toArray } from "../../../Components/functions";
// // import { Print } from "@mui/icons-material";
// // import { Button } from "@mui/material";

// // const findStaffName = (arr, involvedType) => {
// //     if (!Array.isArray(arr)) return "";
// //     const row = arr.find(
// //         (x) => String(x?.empType || "").toLowerCase() === String(involvedType).toLowerCase()
// //     );
// //     return row?.empName || "";
// // };

// // const DeliverySlipprint = ({ Do_Id, loadingOn, loadingOff }) => {
// //     const [data, setData] = useState({});
// //     const printRef = useRef(null);
   

// //     useEffect(() => {
// //         if (!checkIsNumber(Do_Id)) return;
// //         fetchLink({
// //             address: `sales/salesInvoice/printOuts/katchath?Do_Id=${Do_Id}`,
// //             loadingOn, loadingOff
// //         }).then(data => {
// //             if (data.success) {
// //                 setData(data?.data[0] || {})
// //             }
// //         }).catch(e => console.error(e));
// //     }, [Do_Id]);

// //     const handlePrint = useReactToPrint({
// //         content: () => printRef.current,
// //     });

// //     return (
// //         <div className="d-flex flex-column align-items-center justify-content-center">
// //             <Button onClick={handlePrint} startIcon={<Print />}>Print</Button>
// //             <div
// //                 style={{ height: '10.5cm', width: '16cm' }}
// //                 ref={printRef}
// //                 className="border py-2 px-4"
// //             >
// //                 <div className="row">

// //                     <div className="col-5 p-2">
// //                         <h5 className="m-0">{data.voucherTypeGet}</h5>
// //                         <p className="m-0">{data.createdByGet}</p>
// //                         <p className="m-0">{LocalDateWithTime(data.createdOn)}</p>
// //                         <br />
// //                         <p className="m-0">{data.mailingName ? `${data.mailingName},` : " "}</p>
// //                         {/* <p className="m-0">{data.mailingAddress ? `${data.mailingAddress},` : " "}</p> */}
// //                         {/* <p className="m-0">{data.mailingCity ? `${data.mailingCity},` : " "}</p> */}
// //                         {/* <p className="m-0">{data.mailingNumber ? data.mailingNumber : " "}</p> */}
// //                     </div>

// //                     <div className="col-7 p-2">
// //                         <div className="table-responsive">
// //                             <table className="table table-borderless">
// //                                 <tbody>
// //                                     {toArray(data.productDetails).map((item, index) => (
// //                                         <tr key={index}>
// //                                             <td>{item.itemName}</td>
// //                                             <td>{item.quantity}</td>
// //                                         </tr>
// //                                     ))}
// //                                     <tr>
// //                                         <td className="border">Total</td>
// //                                         <td className="border">{toArray(data.productDetails).reduce((acc, item) => acc + item.quantity, 0)}</td>
// //                                     </tr>
// //                                 </tbody>
// //                             </table>
// //                         </div>
// //                     </div>

// //                 </div>

// //                 <br />

// //                 <div>
// //                     <p className="m-0">Lorry: {findStaffName(data.staffDetails, "Transport")}</p>
// //                     <p className="m-0">LoadMan: {findStaffName(data.staffDetails, "Load Man")}</p>
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // };

// // export default DeliverySlipprint;










// import { useEffect, useRef, useState } from "react";
// import { fetchLink } from "../../../Components/fetchComponent";
// import { useReactToPrint } from "react-to-print";
// import { checkIsNumber, LocalDateWithTime, toArray } from "../../../Components/functions";
// import { Button } from "@mui/material";
// import { Print } from "@mui/icons-material";

// const DeliverySlipprint = ({ Do_Id, loadingOn, loadingOff }) => {
//     const [data, setData] = useState({});
//     const printRef = useRef(null);

//     useEffect(() => {
//         if (!checkIsNumber(Do_Id)) return;

//         fetchLink({
//             address: `sales/salesInvoice/printOuts/deliverySlip?Do_Id=${Do_Id}`,
//             loadingOn,
//             loadingOff
//         }).then(res => {
//             if (res.success) setData(res.data[0] || {});
//         });
//     }, [Do_Id]);

//     const handlePrint = useReactToPrint({
//         content: () => printRef.current
//     });

//     const totalWeight = toArray(data.productDetails).reduce(
//         (sum, item) => sum + Number(item.Bill_Qty || 0),
//         0
//     );

//     const totalQty = toArray(data.productDetails).reduce(
//         (sum, item) => sum + Number(item.Alt_Act_Qty || 0),
//         0
//     );

//     return (
//         <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
//             <Button onClick={handlePrint} startIcon={<Print />}>
//                 Print
//             </Button>

//             <div
//                 ref={printRef}
//                 style={{
//                     width: "10.2cm",
//                     height: "14.5cm",
//                     position: "relative",
//                     fontSize: "12px",
//                     padding: "0.3cm",
//                     boxSizing: "border-box",
//                     border: "1px solid #000",
//                     overflow: "hidden"
//                 }}
//             >
//                 {/* TOP HEADER */}
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: "0.5cm",
//                         left: "0.3cm",
//                         right: "0.3cm",
//                         display: "flex",
//                         overflow: "hidden"
//                     }}
//                 >
//                     {/* LEFT */}
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                         <p
//                             style={{
//                                 margin: 0,
//                                 fontWeight: "bold",
//                                 whiteSpace: "nowrap",
//                                 overflow: "hidden",
//                                 textOverflow: "ellipsis"
//                             }}
//                         >
//                             {data.voucherTypeGet} - {data.Do_Inv_No}
//                         </p>

//                         <p
//                             style={{
//                                 margin: 0,
//                                 whiteSpace: "nowrap",
//                                 overflow: "hidden",
//                                 textOverflow: "ellipsis"
//                             }}
//                         >
//                             {data.createdByGet}
//                         </p>
//                     </div>

//                     {/* RIGHT (CREATED ON – FIXED) */}
//                     <div
//                         style={{
//                             width: "3cm",
//                             textAlign: "right",
//                             whiteSpace: "nowrap",
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                             fontSize: "10px",
//                             flexShrink: 0
//                         }}
//                     >
//                         {data.createdOn ? LocalDateWithTime(data.createdOn) : ""}
//                     </div>
//                 </div>

//                 {/* CUSTOMER HEADER */}
//                 <div
//                     style={{
//                         position: "absolute",
//                         top: "5.3cm",
//                         left: "2cm",
//                         right: "0.3cm",
//                         display: "flex",
//                         overflow: "hidden"
//                     }}
//                 >
//                     <div style={{ flex: 1, minWidth: 0, fontWeight: "bold" }}>
//                         <p
//                             style={{
//                                 margin: 0,
//                             }}
//                         >
//                             {data.mailingName ? `${data.mailingName},` : ""}
//                         </p>

//                         <p
//                             style={{
//                                 margin: 0,
//                             }}
//                         >
//                             {data.mailingAddress ? `${data.mailingAddress},` : ""}
//                         </p>
//                     </div>
//                 </div>

              
//                 <div
//                     style={{
//                         position: "absolute",
//                         right: "1.4cm",
//                         top: "4.5cm",
//                         width: "2.2cm",
//                         textAlign: "right",
//                         // whiteSpace: "nowrap",
//                         // overflow: "hidden",
//                         // textOverflow: "ellipsis",
//                         padding: "2px 4px",
//                         fontSize: "0.9em",
//                         fontWeight: "bold"
//                     }}
//                 >
//                     {data.createdOn
//                         ? new Date(data.createdOn).toLocaleDateString("en-GB")
//                         : ""}
//                 </div>

//                 <div
//                     style={{
//                         position: "absolute",
//                         top: "7.3cm",
//                         left: "0.3cm",
//                         right: "0.3cm",
//                         bottom: "4.3cm", 
//                         // overflow: "auto"
//                     }}
//                 >
//                     {toArray(data.productDetails).map((item, index) => (
//                         <div
//                             key={index}
//                             style={{
//                                 display: "flex",
//                                 marginBottom: "0.2cm"
//                             }}
//                         >
//                             <div style={{ width: "2.5cm", textAlign: "center" }}>{item.Product_Rate}</div>

//                             <div
//                                 style={{
//                                     width: "5.5cm",
//                                 }}
//                             >
//                                 {item.Short_Name}
//                             </div>

//                             <div style={{ width: "1.6cm", textAlign: "center" }}>
//                                 {item.Bill_Qty}
//                             </div>

//                             <div style={{ width: "2cm", textAlign: "center" }}>
//                                 {item.Alt_Act_Qty}
//                             </div>
//                         </div>
//                     ))}
//                 </div>

           
//                 <div
//                     style={{
//                         position: "absolute",
//                         bottom: "2cm",
//                         left: "0.3cm",
//                         right: "0.3cm",
//                         fontWeight: "bold",
//                         paddingTop: "0.1cm",
//                         // borderTop: "1px solid #000",
//                         display: "flex"
//                     }}
//                 >
//                     <div style={{ width: "4cm" }}></div> 
//                     <div style={{ width: "4.5cm" }}>TOTAL</div>
//                     <div style={{ width: "1.6cm", textAlign: "center" }}>
//                         {totalWeight}
//                     </div>
//                     <div style={{ width: "2cm", textAlign: "center" }}>
//                         {totalQty}
//                     </div>
//                 </div>

               
//                <div
//     style={{
//         position: "absolute",
//         bottom: "1.2cm", 
//         left: "2cm", 
//         right: "0.3cm",
//         fontWeight: "bold",
//         whiteSpace: "nowrap",
//         overflow: "hidden",
//         textOverflow: "ellipsis"
//     }}
// >
//      {
//         toArray(data.staffDetails)
//             .filter(c => c?.empTypeId === 3)
//             .map(c => c?.empName)
//             .join(", ")
//     }
// </div>
//             </div>
//         </div>
//     );
// };

// export default DeliverySlipprint;







import { useEffect, useRef, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { useReactToPrint } from "react-to-print";
import { checkIsNumber, LocalDateWithTime, toArray } from "../../../Components/functions";
import { Button } from "@mui/material";
import { Print } from "@mui/icons-material";

const DeliverySlipprint = ({ Do_Id, Do_Ids = [], loadingOn, loadingOff, isCombinedPrint = false }) => {

    const [data, setData] = useState([]);
    const printRef = useRef(null);

    const isMultiple = Array.isArray(Do_Ids) && Do_Ids.length > 0;
    const idsToFetch = isMultiple ? Do_Ids : (Do_Id ? [Do_Id] : []);

    useEffect(() => {
        if (idsToFetch.length === 0) return;
        
        loadingOn?.();
        
        const fetchAllData = async () => {
            try {
                const promises = idsToFetch.map(id => 
                    fetchLink({
                        address: `sales/salesInvoice/printOuts/deliverySlip?Do_Id=${id}`,
                        loadingOn: () => {},
                        loadingOff: () => {},
                    })
                );
                
                const results = await Promise.all(promises);
                const allData = results
                    .filter(result => result.success && result.data?.[0])
                    .map(result => result.data[0]);
                
                setData(allData);
            } catch (error) {
                console.error('Error fetching delivery slip data:', error);
            } finally {
                loadingOff?.();
            }
        };

        fetchAllData();
    }, [JSON.stringify(idsToFetch)]);

const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
        @page {
            size: 10.2cm 14.5cm;
            margin: 0;
        }

        @media print {
            html, body {
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                height: 100% !important;
            }

            body * {
                visibility: hidden;
            }

            #delivery-slip-print-content, 
            #delivery-slip-print-content * {
                visibility: visible;
            }

            #delivery-slip-print-content {
                margin: 0 !important;
                padding: 0 !important;
                width: 10.2cm !important;
                height: auto !important;
            }

            .delivery-page {
                width: 10.2cm !important;
                height: 14.5cm !important;
                margin: 0 !important;
                padding: 0.25cm !important;
                page-break-inside: avoid !important;
                page-break-after: always !important;
                overflow: hidden;
            }
          

            .delivery-page:last-child {
                page-break-after: auto !important;
            }

            /* Remove default browser headers/footers */
            @page :first {
                margin: 0 !important;
            }
        }
    `,
    documentTitle: `Delivery Slip${data.length > 1 ? ` (${data.length} docs)` : ''}`,
});



    // Combined print mode (for multiple documents)
    if (isCombinedPrint) {
        return (
            <div id="delivery-slip-print-content" ref={printRef} style={{ position: 'relative' }}>
                {data.map((invoice, index) => {
                    const totalWeight = toArray(invoice.productDetails).reduce(
                        (sum, item) => sum + Number(item.Bill_Qty || 0),
                        0
                    );
                    
                    const totalQty = toArray(invoice.productDetails).reduce(
                        (sum, item) => sum + Number(item.Alt_Act_Qty || 0),
                        0
                    );

                    return (
                        <div key={invoice.Do_Id || index} style={{ 
                            pageBreakInside: 'avoid',
                            marginBottom: index < data.length - 1 ? '20px' : '0'
                        }}>
                            <div
                                style={{
                                    width: "10.2cm",
                                    height: "14.5cm",
                                    position: "relative",
                                    fontSize: "11px",
                                    // padding: "0.25cm",
                                    // boxSizing: "border-box",
                                  
                                    // margin: '0 auto'
                                }}
                            >
                      
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "0.0cm",
                                        left: "0.25cm",
                                        right: "0.25cm",
                                        display: "flex",
                                        overflow: "hidden"
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ top: "0", margin: 0, fontSize: "11px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                                            {invoice.voucherTypeGet} - {invoice.Do_Inv_No}
                                        </p>
                                        <p style={{ margin: "0.1cm 0 0 0", fontSize: "13px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {invoice.createdByGet}
                                        </p>
                                    </div>
                                    <div style={{ width: "3cm", textAlign: "right", whiteSpace: "nowrap", fontWeight: "bold", fontSize: "12px", flexShrink: 0 }}>
                                        {invoice.createdOn ? LocalDateWithTime(invoice.createdOn) : ""}
                                    </div>
                                </div>

                            
                                <div
                                    style={{
                                        position: "absolute",
                                        right: "0.25cm",
                                        top: "3.4cm",
                                        right: "1.7cm",
                                        width: "2.2cm",
                                        textAlign: "right",
                                        padding: "2px 4px",
                                        fontSize: "14px",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {invoice.createdOn ? new Date(invoice.createdOn).toLocaleDateString("en-GB") : ""}
                                </div>

                               
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "4.2cm",
                                        left: "2cm",
                                        right: "0.25cm",
                                        overflow: "hidden"
                                    }}
                                >
                                    <div style={{ fontWeight: "bold", fontSize: "15px" }}>
                                        <p style={{ margin: "0 0 0.1cm 0", lineHeight: "1.2" }}>
                                            {invoice.mailingName ? `${invoice.mailingName},` : ""}
                                        </p>
                                        <p style={{ margin: 0, lineHeight: "1", fontSize: "10px" }}>
                                            {invoice.mailingAddress ? `${invoice.mailingAddress},` : ""}
                                        </p>
                                    </div>
                                </div>

                      
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "6.5cm",
                                        left: "0.25cm",
                                        right: "0.25cm",
                                        bottom: "3.8cm",
                                        overflow: "auto"
                                    }}
                                >
                                    {toArray(invoice.productDetails).map((item, idx) => (
                                        <div key={idx} style={{ display: "flex", marginBottom: "0.02cm", fontSize: "12px", fontWeight: "bold", lineHeight: "1.1" }}>
                                            <div style={{ width: "2.2cm", textAlign: "center" }}>{item.Item_Rate}</div>
                                            <div style={{ width: "4.5cm", paddingLeft: "0.05cm" }}>{item.Short_Name}</div>
                                            <div style={{ width: "1.5cm", textAlign: "center" }}>{item.Bill_Qty}</div>
                                            <div style={{ width: "1.8cm", textAlign: "center" }}>{item.Alt_Act_Qty}</div>
                                        </div>
                                    ))}
                                </div>

                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: "4.0cm",
                                        left: "0.25cm",
                                        right: "0.25cm",
                                        fontWeight: "bold",
                                        paddingTop: "0.1cm",
                                        display: "flex",
                                        fontSize: "11px"
                                    }}
                                >
                                    <div style={{ width: "2.2cm" }}></div>
                                    <div style={{ width: "4.5cm" }}>TOTAL</div>
                                    <div style={{ width: "1.5cm", textAlign: "center" }}>{totalWeight}</div>
                                    <div style={{ width: "1.8cm", textAlign: "center" }}>{totalQty}</div>
                                </div>

                               
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: "2.7cm",
                                        left: "2.4cm",
                                        right: "0.25cm",
                                        fontWeight: "bold",
                                        fontSize: "12px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}
                                >
                                    {toArray(invoice.staffDetails)
                                        .filter(c => c?.empTypeId === 3)
                                        .map(c => c?.empName)
                                        .join(", ")}
                                </div>
                            </div>
                            
                           
                            {index < data.length - 1 && (
                                <div style={{ 
                                    pageBreakAfter: 'always',
                                    breakAfter: 'page',
                                    height: '0',
                                    visibility: 'hidden'
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

   
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div className="print-button-area" style={{ marginBottom: '20px' }}>
                <Button onClick={handlePrint} startIcon={<Print />}>
                    Print Delivery Slip {data.length > 1 ? `(${data.length})` : ''}
                </Button>
            </div>
            
            <div id="delivery-slip-print-content" ref={printRef} style={{ position: 'relative' }}>
                {data.map((invoice, index) => {
                    const totalWeight = toArray(invoice.productDetails).reduce(
                        (sum, item) => sum + Number(item.Bill_Qty || 0),
                        0
                    );
                    
                    const totalQty = toArray(invoice.productDetails).reduce(
                        (sum, item) => sum + Number(item.Alt_Act_Qty || 0),
                        0
                    );

                    return (
                        <div key={invoice.Do_Id || index} style={{ 
                            marginBottom: index < data.length - 1 ? '40px' : '0'
                        }}>
                            <div
                                style={{
                                    width: "10.2cm",
                                    height: "14.5cm",
                                    position: "relative",
                                    fontSize: "11px",
                                    padding: "0.25cm",
                                    boxSizing: "border-box",
                                    overflow: "hidden",
                                    margin: '0 auto'
                                }}
                            >
                                {/* Header */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "0.0cm",
                                        left: "0.25cm",
                                        right: "0.25cm",
                                        display: "flex",
                                        overflow: "hidden"
                                    }}
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ top: "0", margin: 0, fontSize: "11px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                                            {invoice.voucherTypeGet} - {invoice.Do_Inv_No}
                                        </p>
                                        <p style={{ margin: "0.1cm 0 0 0", fontSize: "13px", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {invoice.createdByGet}
                                        </p>
                                    </div>
                                    <div style={{ width: "3cm", textAlign: "right", whiteSpace: "nowrap", fontWeight: "bold", fontSize: "12px", flexShrink: 0 }}>
                                        {invoice.createdOn ? LocalDateWithTime(invoice.createdOn) : ""}
                                    </div>
                                </div>

                                {/* Date */}
                                <div
                                    style={{
                                        position: "absolute",
                                        right: "0.25cm",
                                        top: "3.4cm",
                                        right: "1.7cm",
                                        width: "2.2cm",
                                        textAlign: "right",
                                        padding: "2px 4px",
                                        fontSize: "14px",
                                        fontWeight: "bold"
                                    }}
                                >
                                    {invoice.createdOn ? new Date(invoice.createdOn).toLocaleDateString("en-GB") : ""}
                                </div>

                                {/* Customer Details */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "4.2cm",
                                        left: "2cm",
                                        right: "0.25cm",
                                        overflow: "hidden"
                                    }}
                                >
                                    <div style={{ fontWeight: "bold", fontSize: "15px" }}>
                                        <p style={{ margin: "0 0 0.1cm 0", lineHeight: "1.2" }}>
                                            {invoice.mailingName ? `${invoice.mailingName},` : ""}
                                        </p>
                                        <p style={{ margin: 0, lineHeight: "1", fontSize: "10px" }}>
                                            {invoice.mailingAddress ? `${invoice.mailingAddress},` : ""}
                                        </p>
                                    </div>
                                </div>

                                {/* Product Details */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "6.5cm",
                                        left: "0.25cm",
                                        right: "0.25cm",
                                        bottom: "3.8cm",
                                        overflow: "auto"
                                    }}
                                >
                                    {toArray(invoice.productDetails).map((item, idx) => (
                                        <div key={idx} style={{ display: "flex", marginBottom: "0.02cm", fontSize: "12px", fontWeight: "bold", lineHeight: "1.1" }}>
                                            <div style={{ width: "2.2cm", textAlign: "center" }}>{item.Item_Rate}</div>
                                            <div style={{ width: "4.5cm", paddingLeft: "0.05cm" }}>{item.Short_Name}</div>
                                            <div style={{ width: "1.5cm", textAlign: "center" }}>{item.Bill_Qty}</div>
                                            <div style={{ width: "1.8cm", textAlign: "center" }}>{item.Alt_Act_Qty}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Totals */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: "4.0cm",
                                        left: "0.25cm",
                                        right: "0.25cm",
                                        fontWeight: "bold",
                                        paddingTop: "0.1cm",
                                        display: "flex",
                                        fontSize: "11px"
                                    }}
                                >
                                    <div style={{ width: "2.2cm" }}></div>
                                    <div style={{ width: "4.5cm" }}>TOTAL</div>
                                    <div style={{ width: "1.5cm", textAlign: "center" }}>{totalWeight}</div>
                                    <div style={{ width: "1.8cm", textAlign: "center" }}>{totalQty}</div>
                                </div>

                                {/* Staff Details */}
                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: "2.7cm",
                                        left: "2.4cm",
                                        right: "0.25cm",
                                        fontWeight: "bold",
                                        fontSize: "12px",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis"
                                    }}
                                >
                                    {toArray(invoice.staffDetails)
                                        .filter(c => c?.empTypeId === 3)
                                        .map(c => c?.empName)
                                        .join(", ")}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DeliverySlipprint;