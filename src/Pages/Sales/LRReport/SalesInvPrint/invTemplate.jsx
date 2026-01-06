// import { useEffect, useRef, useState } from "react";
// import { toArray, checkIsNumber, numberToWords, NumberFormat } from "../../../../Components/functions";
// import { fetchLink } from "../../../../Components/fetchComponent";
// import { useReactToPrint } from "react-to-print";
// import { Button } from "@mui/material";
// import { Print } from "@mui/icons-material";
// import { useNavigate, useLocation } from "react-router-dom";
// import a5BackgroundImage from './plain.jpeg';

// const InvoiceTemplate = ({ Do_Id, Do_Ids = [], loadingOn, loadingOff, isCombinedPrint = false }) => {
//   const [data, setData] = useState([]); 
//   const printRef = useRef(null);
//   const nav = useNavigate();
//   const location = useLocation();
//   const [companyInfo, setCompanyInfo] = useState({});
//   const storage = JSON.parse(localStorage.getItem('user'));
  

//   const isMultiple = Array.isArray(Do_Ids) && Do_Ids.length > 0;
//   const idsToFetch = isMultiple ? Do_Ids : (Do_Id ? [Do_Id] : []);
//   const [printReady, setPrintReady] = useState(false);

//   useEffect(() => {
//     if (idsToFetch.length === 0) return;
    
//     loadingOn?.();
    

//     fetchLink({
//       address: `masters/company?Company_id=${storage?.Company_id}`
//     }).then(data => {
//       if (data.success) {
//         setCompanyInfo(data?.data[0] ? data?.data[0] : {});
//       }
//     }).catch(e => console.error(e));
    
   
//     const fetchAllInvoices = async () => {
//       try {
//         const promises = idsToFetch.map(id => 
//           fetchLink({
//             address: `sales/salesInvoice/printOuts/invoicePrint?Do_Id=${id}`,
//             loadingOn: () => {},
//             loadingOff: () => {},
//           })
//         );
        
//         const results = await Promise.all(promises);
//         const allData = results
//           .filter(result => result?.success && result?.data?.[0])
//           .map(result => result.data[0]);
        
//         setData(allData);
//         setPrintReady(true);
//       } catch (error) {
//         console.error('Error fetching invoices:', error);
//       } finally {
//         loadingOff?.();
//       }
//     };

//     fetchAllInvoices();
//   }, [JSON.stringify(idsToFetch)]);

//   const handlePrint = useReactToPrint({ 
//     content: () => printRef.current,
//     onAfterPrint: () => console.log("Print completed")
//   });


//   if (!isCombinedPrint && data.length > 0) {
//     return (
//       <div style={{ 
//         display: "flex", 
//         flexDirection: "column", 
//         alignItems: "center"
//       }}>
//         <style>
//           {`
//             @media print {
//               @page {
//                 size: A5 landscape;
//                 margin: 0mm;
//               }
//               body {
//                 margin: 0;
//                 -webkit-print-color-adjust: exact;
//               }
//               .print-container {
//                 width: 21cm !important;
//                 height: 14.8cm !important;
//                 margin: 0 auto !important;
//                 padding: 0 !important;
//                 position: relative !important;
//               }
//               .no-print {
//                 display: none !important;
//               }
//             }
            
//             @media screen {
//               .preview-center {
//                 margin-left: 1cm;
//               }
//             }
//           `}
//         </style>

//         <Button onClick={handlePrint} startIcon={<Print />} className="no-print" style={{ margin: "20px" }}>
//           Print Preview {data.length > 1 ? `(${data.length} invoices)` : ''}
//         </Button>

//         <div ref={printRef}>
//           {data.map((invoice, index) => (
//             <div key={index} style={{ marginBottom: data.length > 1 ? '50px' : '0' }}>
//               <SingleInvoice 
//                 data={invoice} 
//                 companyInfo={companyInfo} 
//                 isPreview={true}
//               />
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   // Combined print mode (for dialog)
//   return (
//     <div ref={printRef}>
//       {data.map((invoice, index) => (
//         <div 
//           key={index} 
//           className="invoice-page"
//           style={{ 
//             pageBreakAfter: index < data.length - 1 ? 'always' : 'auto'
//           }}
//         >
//           <SingleInvoice 
//             data={invoice} 
//             companyInfo={companyInfo} 
//             isPreview={false}
//           />
//         </div>
//       ))}
//     </div>
//   );
// };

// // Single Invoice Component (your exact design)
// const SingleInvoice = ({ data, companyInfo, isPreview }) => {
//   const products = toArray(data?.productDetails);
//   const expenses = toArray(data?.expencessDetails)
//     .filter(e => !e.expenseName?.toLowerCase().includes("round off"));
//   const broker = toArray(data?.staffDetails).find(e => e.empType === "Broker");
//   const transport = toArray(data?.staffDetails).find(e => e.empType === "Transport");

//   const totalAmount = products.reduce((a, b) => a + Number(b.amount || 0), 0);
//   const totalExpenses = expenses.reduce((a, b) => a + Number(b.expenseValue || 0), 0);
//   const netAmount = totalAmount + totalExpenses + Number(data?.roundOffValue || 0);

//   const groupHSNSummary = (list) => {
//     const map = new Map();
//     list.forEach(p => {
//       const hsn = p?.hsnCode || "";
//       const amt = Number(p?.amount) || 0;
//       map.set(hsn, (map.get(hsn) || 0) + amt);
//     });
//     return Array.from(map.entries()).map(([hsn, amount]) => ({ hsn, amount }));
//   };
//   const hsnSummary = groupHSNSummary(products);

//   return (
//     <div
//       style={{
//         width: "21cm",
//         height: "14.8cm",
//         position: "relative",
//         margin: isPreview ? "0 auto" : "0",
//         boxSizing: "border-box"
//       }}
//     >
//       {/* Background Image */}
//       <img 
//         src={a5BackgroundImage}
//         alt="A5 Invoice Layout"
//         style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           zIndex: 0
//         }}
//       />

//       {/* Content Overlay */}
//       <div style={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         width: "100%",
//         height: "100%",
//         zIndex: 1,
//         boxSizing: "border-box"
//       }}>
//         <div style={{
//           position: "absolute",
//           top: "0.4cm",
//           width: "100%",
//           display: "flex"
//         }}>
//           {/* ================= LEFT SIDE ================= */}
//           <div style={{ position: "relative", width: "60%" }}>
//             <div style={{ position: "absolute", left: "0cm", width: "9cm", padding: "0px" }}>
//               <div style={{
//                 position: "absolute",
//                 left: "5.3cm",
//                 fontWeight: "bold",
//                 top: "0.2cm",
//                 fontSize: "25px",
//                 width: "7cm",
//                 padding: "3px",
//                 color: "#000"
//               }}>
//                 {companyInfo?.Company_Name}
//               </div>
//             </div>

//             <div style={{
//               position: "absolute",
//               left: "4.2cm",
//               fontSize: "15px",
//               width: "10cm",
//               marginTop: "1cm",
//               color: "#000"
//             }}>
//               <p>H.O: 153, Chitrakara Street, Madurai -01</p>

//               <div style={{
//                 position: "absolute",
//                 fontSize: "14px",
//                 width: "10cm",
//                 bottom: "0cm",
//                 left: "10px",
//                 top: "0.0cm",
//                 padding: "0px",
//                 color: "#000"
//               }}>
//                 <br/>
//                 <p>G.O:746 Puliyur, Sayanapuram, Svga</p>
//               </div>
              
//               <div style={{
//                 position: "absolute",
//                 fontSize: "14px",
//                 width: "10cm",
//                 bottom: "0cm",
//                 top: "15px",
//                 right: "20px",
//                 padding: "0px",
//                 color: "#000"
//               }}>
//                 <br/>
//                 <p>Bill of Supply- Disclaimer Affidavit Filed -Exempted</p>
//               </div>
//             </div>
//           </div>

//           {/* ================= RIGHT SIDE (STATIC DATA) ================= */}
//           <div style={{
//             position: "relative",
//             width: "40%",
//             fontSize: "13px",
//             color: "#000",
//             paddingRight: "1cm",
//             textAlign: "right",
//             top: "15px"
//           }}>
//             <div><strong>GSTIN :</strong> 33AADFS4987M1ZL</div>
//             <div><strong>Phone :</strong> 0452 - 4371625</div>
//             <div><strong></strong> 9786131353</div>
//             <div><strong>FSSAI No</strong> 12418012000176</div>
//           </div>
//         </div>

//         <div style={{
//           position: "absolute",
//           top: "2.7cm",
//           width: "100%"
//         }}>
//           <p style={{
//             position: "absolute",
//             left: "1.0cm",
//             fontSize: "13px",
//             top: "0.0cm",
//             width: "9cm",
//             padding: "2.5px"
//           }}>
//             {/* To */}
//           </p>

//           <div style={{
//             position: "absolute",
//             left: "3.25cm",
//             fontSize: "13px",
//             top: "0.3cm",
//             width: "9cm",
//             padding: "2.5px"
//           }}>
//             <div style={{ color: "#000" }}>{data.mailingName},{data.Party_Location}</div>
//             <div style={{ color: "#000" }}>{data.mailingAddress}</div>
//             <div style={{ color: "#000" }}>{data.mailingNumber}</div>
//             <div style={{ color: "#000" }}>GSTIN: {data.retailerGstNumber}</div>
//           </div>

//           <div style={{
//             position: "absolute",
//             left: "12cm",
//             width: "8cm",
//             fontSize: "12px",
//             padding: "0px",
//             top: "0.3cm"
//           }}>
//             <div style={{ 
//               height: "0.7cm", 
//               display: "flex", 
//               justifyContent: "space-between",
//               alignItems: "center"
//             }}>
//               <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//                 <span style={{ fontWeight: "bold", color: "#000" }}>
//                   {/* Date: */}
//                 </span>
//                 <span style={{ color: "#000", marginLeft: "30px" }}>
//                   {data.createdOn && new Date(data.createdOn).toLocaleDateString("en-GB")}
//                 </span>
//               </div>
//               <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//                 <span style={{ fontWeight: "bold", color: "#000", marginLeft: "50px" }}>
//                   {/* Bill Type: */}
//                 </span>
//                 <b style={{ color: "#000", marginLeft: "50px" }}>
//                   {data.voucherTypeGet}
//                 </b>
//               </div>
//             </div>

//             <div style={{ 
//               height: "0.7cm",
//               display: "flex",
//               alignItems: "center",
//               gap: "5px"
//             }}>
//               <span style={{ fontWeight: "bold", color: "#000" }}>
//                 {/* Bill No: */}
//               </span>
//               <b style={{ color: "#000", marginLeft: "50px" }}>{data.voucherNumber}</b>
//             </div>

//             <div style={{ 
//               height: "1cm", 
//               display: "flex", 
//               justifyContent: "space-between",
//               alignItems: "center"
//             }}>
//               <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//                 <span style={{ fontWeight: "bold", color: "#000" }}>
//                   {/* Broker: */}
//                 </span>
//                 <span style={{ color: "#000", marginLeft: "50px" }}>{broker?.empName || "-"}</span>
//               </div>
//               <div style={{ display: "flex" }}>
//                 <span style={{ fontWeight: "bold", color: "#000" }}>
//                   {/* Transport: */}
//                 </span>
//                 <span style={{ color: "#000", alignItems: "center", gap: "5px" }}>{transport?.empName || "-"}</span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* PRODUCTS TABLE AREA */}
//         <div style={{
//           position: "absolute",
//           top: "5.2cm",
//           left: "0",
//           width: "20cm",
//           fontSize: "12px"
//         }}>
//           {/* COLUMN HEADERS */}
//           <div style={{
//             display: "flex",
//             height: "0.5cm",
//             lineHeight: "0.5cm",
//             alignItems: "left",
//             fontWeight: "bold",
//             marginBottom: "0.3cm"
//           }}>
//             <div style={{ width: "1cm", textAlign: "right", marginLeft: "0.4cm" }}>
//               {/* No */}
//             </div>
//             <div style={{ marginLeft: "0.2cm", width: "8.2cm", color: "#000" }}>
//               {/* ITEMS */}
//             </div>
//             <div style={{ width: "2cm", color: "#000" }}>
//               {/* HSN */}
//             </div>
//             <div style={{ width: "1.5cm", color: "#000" }}>
//               {/* GST */}
//             </div>
//             <div style={{ width: "1.2cm", color: "#000" }}></div>
//             <div style={{ width: "3cm", color: "#000" }}></div>
//             <div style={{ width: "1cm", color: "#000" }}></div>
//             <div style={{ width: "3.5cm", textAlign: "right", color: "#000" }}></div>
//           </div>

//           {products.filter(p => p.itemName).map((p, i) => (
//             <div
//               key={i}
//               style={{
//                 display: "flex",
//                 height: "0.5cm",          
//                 lineHeight: "0.5cm",      
//                 alignItems: "center",
//               }}
//             >
//               <div style={{ 
//                 width: "1cm", 
//                 textAlign: "right",
//                 marginLeft: "1.7cm",
//                 fontWeight: "bold",
//                 color: "#000",
//                 flexShrink: 0 
//               }}>
//                 {i + 1}
//               </div>

//               <div style={{ 
//                 marginLeft: "0.5cm",
//                 width: "6.8cm",
//                 color: "#000",
//                 fontWeight: "bold",
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 flexShrink: 0
//               }}>
//                 {p.itemName}
//               </div>

//               <div style={{ 
//                 width: "1cm", 
//                 color: "#000",
//                 marginLeft: "0.1cm",
//                 textAlign: "center",
//                 fontWeight: "bold",
//                 flexShrink: 0
//               }}>
//                 {p.hsnCode}
//               </div>

//               <div style={{ 
//                 width: "1cm",  
//                 color: "#000",
//                 textAlign: "right",
//                 fontWeight: "bold",
//                 flexShrink: 0,
//                 marginRight: "0.15cm"
//               }}>
//                 {p.gstPercentage}
//               </div>

//               <div style={{ 
//                 width: "5cm", 
//                 color: "#000",
//                 textAlign: "center",
//                 fontWeight: "bold",
//               }}>{p.quantity}</div>

//               <div style={{ 
//                 width: "4.7cm", 
//                 color: "#000",
//                 textAlign: "center",
//                 fontWeight: "bold",
//                 marginRight: "0.5cm"
//               }}>{p.itemRate}</div>

//               <div style={{ 
//                 width: "1.2cm",
//                 color: "#000",
//                 fontWeight: "bold",
//                 marginLeft: "1cm",
//                 textAlign: "left",
//                 marginRight: "0.9cm"
//               }}>{p.billQuantity}</div>

//               <div style={{ 
//                 width: "5cm", 
//                 textAlign: "right", 
//                 fontWeight: "bold",
//                 color: "#000",
//               }}>
//                 {NumberFormat(p.amount)}
//               </div>
//             </div>
//           ))}
//         </div>

//         <p style={{
//           position: "absolute",
//           fontWeight: "bold",
//           top: "9.95cm",
//           left: "2.5cm"
//         }}>
//           TMB A/C NO: 002530350870041  IFSC : TMBL0000002
//         </p>

//         <div style={{
//           position: "absolute",
//           top: "10.6cm",
//           left: "2.5cm",
//           color: "#000",
//           width: "15cm"
//         }}>
//           <span>INR</span>   {numberToWords(parseInt(netAmount))}
//         </div>

//         <div style={{ 
//           position: "absolute",
//           top: "9.1cm",
//           left: "0cm",
//           width: "20cm"
//         }}>
//           {/* EXPENSES */}
//           {expenses.map((e, i) => (
//             <div
//               key={i}
//               style={{
//                 position: "absolute",
//                 top: `${i * 0.5}cm`,
//                 display: "flex",
//                 height: "0.5cm",
//                 lineHeight: "0.5cm",
//                 alignItems: "center",
//                 width: "100%"
//               }}
//             >
//               <div style={{ width: "5.0cm" }}></div>
//               <div style={{ width: "0.3cm" }}></div>
//               <div style={{ width: "1.9cm" }}></div>
//               <div style={{ width: "0.9cm" }}></div>
//               <div style={{ width: "1.3cm" }}></div>

//               <div style={{
//                 width: "4.2cm",
//                 marginLeft: "4.5cm",
//                 lineHeight: "normal",
//                 color: "#000",
//                 fontSize: '10px'
//               }}>
//                 {e.expenseName}
//               </div>

//               <div style={{ width: "0cm" }}></div>

//               <div style={{
//                 width: "1.5cm",
//                 textAlign: "right",
//                 color: "#000",
//                 fontSize: '12px',
//                 marginRight: "auto"
//               }}>
//                 {NumberFormat(e.expenseValue)}
//               </div>
//             </div>
//           ))}

//           {data?.roundOffValue ? (
//             <div style={{
//               position: "absolute",
//               top: "0.5cm", 
//               display: "flex", 
//               height: "0.5cm", 
//               fontWeight: "bold",
//               alignItems: "center",
//               width: "100%"
//             }}>
//               <div style={{ width: "5.0cm" }}></div>
//               <div style={{ width: "0.3cm" }}></div>
//               <div style={{ width: "1.9cm" }}></div>
//               <div style={{ width: "0.9cm" }}></div>
//               <div style={{ width: "1.3cm" }}></div>

//               <div style={{
//                 width: "4.2cm",
//                 marginLeft: "8.5cm",
//                 lineHeight: "normal",
//                 color: "#000",
//                 fontSize: '10px',
//                 fontWeight: "bold"
//               }}>
//                 {/* Empty or you can add "Round Off:" label here */}
//               </div>

//               <div style={{ width: "0cm" }}></div>

//               {/* Round Off Value - Fixed position */}
//               <div style={{
//                 position: "absolute",
//                 right: "0.5cm",
//                 textAlign: "right",
//                 color: "#000",
//                 fontSize: '12px',
//                 fontWeight: "bold",
//                 top: "0.45cm"
//               }}>
//                 {NumberFormat(data.roundOffValue)}
//               </div>
//             </div>
//           ) : null}

//           {/* NET AMOUNT */}
//           <div style={{
//             position: "absolute",
//             top: "1.6cm",
//             left: "14cm",
//             fontWeight: "bold",
//             textAlign: "center",
//             color: "#000",
//             fontSize: "18px",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//             gap: "140px"
//           }}>
//             <span></span>
//             {(Number(parseFloat(netAmount || 0)).toFixed(2))}
//           </div>
//         </div>

//      {/* HSN Summary */}
// <div style={{
//   position: "absolute",
//   top: "11.6cm",
//   fontSize: "11px",
//   left: "3cm",
//   width: "10cm"
// }}>
//   {hsnSummary.map((h, i) => (
//     <div
//       key={i}
//       style={{
//         display: "flex",
//         alignItems: "center",
//         width: "100%",
//         marginBottom: "0.1cm"
//       }}
//     >
//       <span style={{ 
//         color: "#000",
//         fontWeight: "bold",
//         width: "3cm",
//         textAlign: "left"
//       }}>
//         {h.hsn}
//       </span>
//       <span style={{ 
//         color: "#000",
//         fontWeight: "bold",
//         width: "3cm",
//         textAlign: "right",
//         // marginLeft: "auto"
//       }}>
//         {NumberFormat(h.amount)}
//       </span>
//     </div>
//   ))}
//   {/* Total Row */}
//   <div style={{
//     display: "flex",
//     alignItems: "center",
//     width: "100%",
//     marginTop: "0.1cm",

//     paddingTop: "0.1cm",
//     fontWeight: "bold"
//   }}>
//     <span style={{ 
//       color: "#000",
//       width: "3cm",
//       textAlign: "left"
//     }}>
     
//     </span>
//     <span style={{ 
//       color: "#000",
//       width: "3cm",
//       textAlign: "right",
//       // marginLeft: "auto"
//     }}>
//       {NumberFormat(
//         hsnSummary.reduce(
//           (sum, item) => sum + Number(item.amount || 0),
//           0
//         )
//       )}
//     </span>
//   </div>
// </div>
//       </div>
//     </div>
//   );
// };

// export default InvoiceTemplate;














import { useEffect, useRef, useState } from "react";
import { toArray, checkIsNumber, numberToWords, NumberFormat } from "../../../../Components/functions";
import { fetchLink } from "../../../../Components/fetchComponent";
import { useReactToPrint } from "react-to-print";
import { Button } from "@mui/material";
import { Print } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import a5BackgroundImage from './plain.jpeg';

const SAFE_LEFT_PADDING = "0.23cm"; 

const InvoiceTemplate = ({ Do_Id, Do_Ids = [], loadingOn, loadingOff, isCombinedPrint = false }) => {
  const [data, setData] = useState([]); 
  const printRef = useRef(null);
  const nav = useNavigate();
  const location = useLocation();
  const [companyInfo, setCompanyInfo] = useState({});
  const storage = JSON.parse(localStorage.getItem('user'));
  

  const isMultiple = Array.isArray(Do_Ids) && Do_Ids.length > 0;
  const idsToFetch = isMultiple ? Do_Ids : (Do_Id ? [Do_Id] : []);
  const [printReady, setPrintReady] = useState(false);

  useEffect(() => {
    if (idsToFetch.length === 0) return;
    
    loadingOn?.();
    

    fetchLink({
      address: `masters/company?Company_id=${storage?.Company_id}`
    }).then(data => {
      if (data.success) {
        setCompanyInfo(data?.data[0] ? data?.data[0] : {});
      }
    }).catch(e => console.error(e));
    
   
    const fetchAllInvoices = async () => {
      try {
        const promises = idsToFetch.map(id => 
          fetchLink({
            address: `sales/salesInvoice/printOuts/invoicePrint?Do_Id=${id}`,
            loadingOn: () => {},
            loadingOff: () => {},
          })
        );
        
        const results = await Promise.all(promises);
        const allData = results
          .filter(result => result?.success && result?.data?.[0])
          .map(result => result.data[0]);
        
        setData(allData);
        setPrintReady(true);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        loadingOff?.();
      }
    };

    fetchAllInvoices();
  }, [JSON.stringify(idsToFetch)]);

  const handlePrint = useReactToPrint({ 
    content: () => printRef.current,
    onAfterPrint: () => console.log("Print completed")
  });


  if (!isCombinedPrint && data.length > 0) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center"
      }}>
       
         <style>
{`
@media print {
  @page {
    size: A5 landscape;
    margin: 0;
  }

  body {
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .print-page {
    width: 21cm;
    height: 14.8cm;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .print-safe-area {
    margin-left: 0.3cm;  
  }

  .no-print {
    display: none !important;
  }
}
`}
</style>


        <Button onClick={handlePrint} startIcon={<Print />} className="no-print" style={{ margin: "20px" }}>
          Print Preview {data.length > 1 ? `(${data.length} invoices)` : ''}
        </Button>

        <div ref={printRef}>
          {data.map((invoice, index) => (
            <div key={index} style={{ marginBottom: data.length > 1 ? '50px' : '0' }}>
              <SingleInvoice 
                data={invoice} 
                companyInfo={companyInfo} 
                isPreview={true}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Combined print mode (for dialog)
  return (
    <div ref={printRef}>
      {data.map((invoice, index) => (
        <div 
          key={index} 
          className="invoice-page"
          style={{ 
            pageBreakAfter: index < data.length - 1 ? 'always' : 'auto'
          }}
        >
          <SingleInvoice 
            data={invoice} 
            companyInfo={companyInfo} 
            isPreview={false}
          />
        </div>
      ))}
    </div>
  );
};

// Single Invoice Component (your exact design)
const SingleInvoice = ({ data, companyInfo, isPreview }) => {
  const products = toArray(data?.productDetails);
  const expenses = toArray(data?.expencessDetails)
    .filter(e => !e.expenseName?.toLowerCase().includes("round off"));
  const broker = toArray(data?.staffDetails).find(e => e.empType === "Broker");
  const transport = toArray(data?.staffDetails).find(e => e.empType === "Transport");

  const totalAmount = products.reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalExpenses = expenses.reduce((a, b) => a + Number(b.expenseValue || 0), 0);
  const netAmount = totalAmount + totalExpenses + Number(data?.roundOffValue || 0);

  const groupHSNSummary = (list) => {
    const map = new Map();
    list.forEach(p => {
      const hsn = p?.hsnCode || "";
      const amt = Number(p?.amount) || 0;
      map.set(hsn, (map.get(hsn) || 0) + amt);
    });
    return Array.from(map.entries()).map(([hsn, amount]) => ({ hsn, amount }));
  };
  const hsnSummary = groupHSNSummary(products);

  return (
    <div
      style={{
        width: "21cm",
        height: "14.8cm",
        position: "relative",
        margin: isPreview ? "0" : "0",
        boxSizing: "border-box",
           paddingLeft: SAFE_LEFT_PADDING   // ✅ FIXED HERE
      }}
    >
      {/* Background Image */}
      <img 
        src={a5BackgroundImage}
        alt="A5 Invoice Layout"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0
        }}
      />

      {/* Content Overlay */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        boxSizing: "border-box"
      }}>
        <div style={{
          position: "absolute",
          top: "0.4cm",
          width: "100%",
          display: "flex"
        }}>
          {/* ================= LEFT SIDE ================= */}
          <div style={{ position: "relative", width: "60%" }}>
            <div style={{ position: "absolute", left: "0cm", width: "9cm", padding: "0px" }}>
              <div style={{
                position: "absolute",
                left: "5.3cm",
                fontWeight: "bold",
                top: "0.2cm",
                fontSize: "25px",
                width: "7cm",
                padding: "3px",
                color: "#000"
              }}>
                {companyInfo?.Company_Name}
              </div>
            </div>

            <div style={{
              position: "absolute",
              left: "4.2cm",
              fontSize: "15px",
              width: "10cm",
              marginTop: "1cm",
              color: "#000"
            }}>
              <p>H.O: 153, Chitrakara Street, Madurai -01</p>

              <div style={{
                position: "absolute",
                fontSize: "14px",
                width: "10cm",
                bottom: "0cm",
                left: "10px",
                top: "0.0cm",
                padding: "0px",
                color: "#000"
              }}>
                <br/>
                <p>G.O:746 Puliyur, Sayanapuram, Svga</p>
              </div>
              
              <div style={{
                position: "absolute",
                fontSize: "14px",
                width: "10cm",
                bottom: "0cm",
                top: "15px",
                right: "20px",
                padding: "0px",
                color: "#000"
              }}>
                <br/>
                <p>Bill of Supply- Disclaimer Affidavit Filed -Exempted</p>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDE (STATIC DATA) ================= */}
          <div style={{
            position: "relative",
            width: "40%",
            fontSize: "13px",
            color: "#000",
            paddingRight: "1cm",
            textAlign: "right",
            top: "15px"
          }}>
            <div><strong>GSTIN :</strong> 33AADFS4987M1ZL</div>
            <div><strong>Phone :</strong> 0452 - 4371625</div>
            <div><strong></strong> 9786131353</div>
            <div><strong>FSSAI No</strong> 12418012000176</div>
          </div>
        </div>

        <div style={{
          position: "absolute",
          top: "2.7cm",
          width: "100%"
        }}>
          <p style={{
            position: "absolute",
            left: "1.0cm",
            fontSize: "13px",
            top: "0.0cm",
            width: "9cm",
            padding: "2.5px"
          }}>
            {/* To */}
          </p>

          <div style={{
            position: "absolute",
            left: "3.25cm",
            fontSize: "13px",
            top: "0.3cm",
            width: "9cm",
            padding: "2.5px"
          }}>
            <div style={{ color: "#000" }}>{data.mailingName},{data.Party_Location}</div>
            <div style={{ color: "#000" }}>{data.mailingAddress}</div>
            <div style={{ color: "#000" }}>{data.mailingNumber}</div>
            <div style={{ color: "#000" }}>GSTIN: {data.retailerGstNumber}</div>
          </div>

          <div style={{
            position: "absolute",
            left: "12cm",
            width: "8cm",
            fontSize: "12px",
            padding: "0px",
            top: "0.3cm"
          }}>
            <div style={{ 
              height: "0.7cm", 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ fontWeight: "bold", color: "#000" }}>
                  {/* Date: */}
                </span>
                <span style={{ color: "#000", marginLeft: "30px" }}>
                  {data.createdOn && new Date(data.createdOn).toLocaleDateString("en-GB")}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ fontWeight: "bold", color: "#000", marginLeft: "50px" }}>
                  {/* Bill Type: */}
                </span>
                <b style={{ color: "#000", marginLeft: "50px" }}>
                  {data.voucherTypeGet}
                </b>
              </div>
            </div>

            <div style={{ 
              height: "0.7cm",
              display: "flex",
              alignItems: "center",
              gap: "5px"
            }}>
              <span style={{ fontWeight: "bold", color: "#000" }}>
                {/* Bill No: */}
              </span>
              <b style={{ color: "#000", marginLeft: "50px" }}>{data.voucherNumber}</b>
            </div>

            <div style={{ 
              height: "1cm", 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <span style={{ fontWeight: "bold", color: "#000" }}>
                  {/* Broker: */}
                </span>
                <span style={{ color: "#000", marginLeft: "50px" }}>{broker?.empName || "-"}</span>
              </div>
              <div style={{ display: "flex" }}>
                <span style={{ fontWeight: "bold", color: "#000" }}>
                  {/* Transport: */}
                </span>
                <span style={{ color: "#000", alignItems: "center", gap: "5px" }}>{transport?.empName || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTS TABLE AREA */}
        <div style={{
          position: "absolute",
          top: "5.2cm",
          left: "0",
          width: "20cm",
          fontSize: "12px"
        }}>
          {/* COLUMN HEADERS */}
          <div style={{
            display: "flex",
            height: "0.5cm",
            lineHeight: "0.5cm",
            alignItems: "left",
            fontWeight: "bold",
            marginBottom: "0.3cm"
          }}>
            <div style={{ width: "1cm", textAlign: "right", marginLeft: "0.4cm" }}>
              {/* No */}
            </div>
            <div style={{ marginLeft: "0.2cm", width: "8.2cm", color: "#000" }}>
              {/* ITEMS */}
            </div>
            <div style={{ width: "2cm", color: "#000" }}>
              {/* HSN */}
            </div>
            <div style={{ width: "1.5cm", color: "#000" }}>
              {/* GST */}
            </div>
            <div style={{ width: "1.2cm", color: "#000" }}></div>
            <div style={{ width: "3cm", color: "#000" }}></div>
            <div style={{ width: "1cm", color: "#000" }}></div>
            <div style={{ width: "3.5cm", textAlign: "right", color: "#000" }}></div>
          </div>

          {products.filter(p => p.itemName).map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                height: "0.5cm",          
                lineHeight: "0.5cm",      
                alignItems: "center",
              }}
            >
              <div style={{ 
                width: "1cm", 
                textAlign: "right",
                marginLeft: "1.7cm",
                fontWeight: "bold",
                color: "#000",
                flexShrink: 0 
              }}>
                {i + 1}
              </div>

              <div style={{ 
                marginLeft: "0.5cm",
                width: "6.8cm",
                color: "#000",
                fontWeight: "bold",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                flexShrink: 0
              }}>
                {p.itemName}
              </div>

              <div style={{ 
                width: "1cm", 
                color: "#000",
                marginLeft: "0.1cm",
                textAlign: "center",
                fontWeight: "bold",
                flexShrink: 0
              }}>
                {p.hsnCode}
              </div>

              <div style={{ 
                width: "1cm",  
                color: "#000",
                textAlign: "right",
                fontWeight: "bold",
                flexShrink: 0,
                marginRight: "0.15cm"
              }}>
                {p.gstPercentage}
              </div>

              <div style={{ 
                width: "5cm", 
                color: "#000",
                textAlign: "center",
                fontWeight: "bold",
              }}>{p.quantity}</div>

              <div style={{ 
                width: "4.7cm", 
                color: "#000",
                textAlign: "center",
                fontWeight: "bold",
                marginRight: "0.5cm"
              }}>{p.itemRate}</div>

              <div style={{ 
                width: "1.2cm",
                color: "#000",
                fontWeight: "bold",
                marginLeft: "1cm",
                textAlign: "left",
                marginRight: "0.9cm"
              }}>{p.billQuantity}</div>

              <div style={{ 
                width: "5cm", 
                textAlign: "right", 
                fontWeight: "bold",
                color: "#000",
              }}>
                {NumberFormat(p.amount)}
              </div>
            </div>
          ))}
        </div>

        <p style={{
          position: "absolute",
          fontWeight: "bold",
          top: "9.95cm",
          left: "2.5cm"
        }}>
          TMB A/C NO: 002530350870041  IFSC : TMBL0000002
        </p>

        <div style={{
          position: "absolute",
          top: "10.6cm",
          left: "2.5cm",
          color: "#000",
          width: "15cm"
        }}>
          <span>INR</span>   {numberToWords(parseInt(netAmount))}
        </div>

        <div style={{ 
          position: "absolute",
          top: "9.1cm",
          left: "0cm",
          width: "20cm"
        }}>
          {/* EXPENSES */}
          {expenses.map((e, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                top: `${i * 0.5}cm`,
                display: "flex",
                height: "0.5cm",
                lineHeight: "0.5cm",
                alignItems: "center",
                width: "100%"
              }}
            >
              <div style={{ width: "5.0cm" }}></div>
              <div style={{ width: "0.3cm" }}></div>
              <div style={{ width: "1.9cm" }}></div>
              <div style={{ width: "0.9cm" }}></div>
              <div style={{ width: "1.3cm" }}></div>

              <div style={{
                width: "4.2cm",
                marginLeft: "4.5cm",
                lineHeight: "normal",
                color: "#000",
                fontSize: '10px'
              }}>
                {e.expenseName}
              </div>

              <div style={{ width: "0cm" }}></div>

              <div style={{
                width: "1.5cm",
                textAlign: "right",
                color: "#000",
                fontSize: '12px',
                marginRight: "auto"
              }}>
                {NumberFormat(e.expenseValue)}
              </div>
            </div>
          ))}

          {data?.roundOffValue ? (
            <div style={{
              position: "absolute",
              top: "0.5cm", 
              display: "flex", 
              height: "0.5cm", 
              fontWeight: "bold",
              alignItems: "center",
              width: "100%"
            }}>
              <div style={{ width: "5.0cm" }}></div>
              <div style={{ width: "0.3cm" }}></div>
              <div style={{ width: "1.9cm" }}></div>
              <div style={{ width: "0.9cm" }}></div>
              <div style={{ width: "1.3cm" }}></div>

              <div style={{
                width: "4.2cm",
                marginLeft: "8.5cm",
                lineHeight: "normal",
                color: "#000",
                fontSize: '10px',
                fontWeight: "bold"
              }}>
                {/* Empty or you can add "Round Off:" label here */}
              </div>

              <div style={{ width: "0cm" }}></div>

              {/* Round Off Value - Fixed position */}
              <div style={{
                position: "absolute",
                right: "0.5cm",
                textAlign: "right",
                color: "#000",
                fontSize: '12px',
                fontWeight: "bold",
                top: "0.45cm"
              }}>
                {NumberFormat(data.roundOffValue)}
              </div>
            </div>
          ) : null}

          {/* NET AMOUNT */}
          <div style={{
            position: "absolute",
            top: "1.6cm",
            left: "14cm",
            fontWeight: "bold",
            textAlign: "center",
            color: "#000",
            fontSize: "18px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "140px"
          }}>
            <span></span>
            {(Number(parseFloat(netAmount || 0)).toFixed(2))}
          </div>
        </div>

     {/* HSN Summary */}
<div style={{
  position: "absolute",
  top: "11.6cm",
  fontSize: "11px",
  left: "3cm",
  width: "10cm"
}}>
  {hsnSummary.map((h, i) => (
    <div
      key={i}
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        marginBottom: "0.1cm"
      }}
    >
      <span style={{ 
        color: "#000",
        fontWeight: "bold",
        width: "3cm",
        textAlign: "left"
      }}>
        {h.hsn}
      </span>
      <span style={{ 
        color: "#000",
        fontWeight: "bold",
        width: "3cm",
        textAlign: "right",
        // marginLeft: "auto"
      }}>
        {NumberFormat(h.amount)}
      </span>
    </div>
  ))}
  {/* Total Row */}
  <div style={{
    display: "flex",
    alignItems: "center",
    width: "100%",
    marginTop: "0.1cm",

    paddingTop: "0.1cm",
    fontWeight: "bold"
  }}>
    <span style={{ 
      color: "#000",
      width: "3cm",
      textAlign: "left"
    }}>
     
    </span>
    <span style={{ 
      color: "#000",
      width: "3cm",
      textAlign: "right",
      // marginLeft: "auto"
    }}>
      {NumberFormat(
        hsnSummary.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        )
      )}
    </span>
  </div>
</div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;