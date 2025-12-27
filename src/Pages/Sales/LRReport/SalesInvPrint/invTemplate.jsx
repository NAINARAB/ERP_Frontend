// import { useEffect, useRef, useState } from "react";
// import { toArray, checkIsNumber, numberToWords, NumberFormat } from "../../../../Components/functions";
// import { fetchLink } from "../../../../Components/fetchComponent";
// import { useReactToPrint } from "react-to-print";
// import { Button } from "@mui/material";
// import { Print } from "@mui/icons-material";
// import { useNavigate, useLocation } from "react-router-dom";

// // Import your A5 background image
// import a5BackgroundImage from './templatea5.jpeg';

// const InvoiceTemplate = ({ Do_Id, loadingOn, loadingOff }) => {
//   const [data, setData] = useState({});
//   const printRef = useRef(null);
//   const nav = useNavigate();
//   const location = useLocation();
//   const [companyInfo, setCompanyInfo] = useState({});
//   const storage = JSON.parse(localStorage.getItem('user'));
  
//   useEffect(() => {
//     if (!checkIsNumber(Do_Id)) return;
//     fetchLink({
//       address: `sales/salesInvoice/printOuts/invoicePrint?Do_Id=${Do_Id}`,
//       loadingOn,
//       loadingOff,
//     }).then((res) => {
//       if (res?.success) setData(res.data?.[0] || {});
//     });
//   }, [Do_Id]);

//   useEffect(() => {
//     fetchLink({
//       address: `masters/company?Company_id=${storage?.Company_id}`
//     }).then(data => {
//       if (data.success) {
//         setCompanyInfo(data?.data[0] ? data?.data[0] : {})
//       }
//     }).catch(e => console.error(e))
//   }, [storage?.Company_id])

//   const handlePrint = useReactToPrint({ content: () => printRef.current });

//   const products = toArray(data?.productDetails);
//   const expenses = toArray(data?.expencessDetails)
//     .filter(e => !e.expenseName?.includes("GST") && !e.expenseName?.toLowerCase().includes("round off"));
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
//     <div style={{ 
//       display: "flex", 
//       flexDirection: "column", 
//       alignItems: "center"
//     }}>
//       <style>
//         {`
//           @media print {
//             @page {
//               size: A5 landscape;
//               margin: 0mm;
//             }
//             body {
//               margin: 0;
//               -webkit-print-color-adjust: exact;
//             }
//             .print-container {
//               width: 21cm !important;
//               height: 14.8cm !important;
//               margin: 0 auto !important;
//               padding: 0 !important;
//               position: relative !important;
//             }
//             .no-print {
//               display: none !important;
//             }
            
//             /* Adjust print positioning */
//             .print-adjust {
//               position: relative !important;
//               left: 0.7cm !important; /* Adjust this for centering */
//             }
            
//             /* Center HSN summary for print */
//             .hsn-print {
//               position: relative !important;
//               left: 1.5cm !important;
//             }
//           }
          
//           /* Preview adjustments */
//           @media screen {
//             .preview-center {
//               margin-left: 1cm;
//             }
//           }
//         `}
//       </style>

//       <Button onClick={handlePrint} startIcon={<Print />} className="no-print" style={{ margin: "20px" }}>
//         Print Preview
//       </Button>

//       <div
//         ref={printRef}
//         style={{
//           width: "21cm",
//           height: "14.8cm",
//           position: "relative",
//           margin: "0 auto",
//           boxSizing: "border-box"
//         }}
//       >
//         {/* Background Image */}
//         <img 
//           src={a5BackgroundImage}
//           alt="A5 Invoice Layout"
//           style={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             zIndex: 0
//           }}
//         />

//         {/* Content Overlay */}
//         <div style={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           zIndex: 1,
//           boxSizing: "border-box"
//         }}>
//           {/* TOP HEADER SECTION */}
//           <div style={{
//             position: "absolute",
//             top: "0.5cm",
//             width: "100%"
//           }}>
//             {/* LEFT: Company Info */}
//             <div style={{
//               position: "absolute",
//               left: "0cm",
//               width: "9cm",
//               padding: "0px"
//             }}>
//               <div style={{
//                 position: "absolute",
//                 left: "3.5cm",
//                 fontWeight: "bold",
//                 top:"0.2cm",
//                 fontSize: "25px",
//                 width: "7cm",
//                 padding: "3px",
//                 color: "#000"
//               }}>
//                 {companyInfo?.Company_Name}
//               </div>
//             </div>

//             {/* CENTER: Address */}
//             <div style={{
//               position: "absolute",
//               left: "2.0cm",
//               fontSize: "15px",
//               width: "10cm",
//               marginTop: "1cm",
//               color: "#000"
//             }}>
//               {companyInfo?.Company_Address}
              
//               <div style={{
//                 position: "absolute",
//                 fontSize: "15px",
//                 width: "10cm",
//                 left: "0.0cm",
//                 marginTop: "0.0cm",
//                 padding: "1px",
//                 color: "#000"
//               }}>
//                 <p>G.O:746 Puliyur, Sayanapuram,Svga</p>
//               </div>
//             </div>
//           </div>

//           {/* CUSTOMER & INVOICE DETAILS SECTION */}
//           <div style={{
//             position: "absolute",
//             top: "2.8cm",
//             width: "100%"
//           }}>
//             {/* LEFT: Retailer Details */}
//             <div style={{
//               position: "absolute",
//               left: "2.4cm",
//               fontSize:"15px",
//               top: "0.0cm",
//               width: "9cm",
//               padding: "2.5px"
//             }}>
//               <div style={{ color: "#000" }}>{data.mailingName}</div>
//               <div style={{ color: "#000" }}>{data.mailingAddress}</div>
//               <div style={{ color: "#000" }}>{data.mailingNumber}</div>
//               <div style={{ color: "#000" }}>GSTIN: {data.retailerGstNumber}</div>
//             </div>

//             {/* RIGHT: Invoice Details */}
//             <div style={{
//               position: "absolute",
//               left: "12.5cm",
//               width: "7cm",
//               fontSize:"12px",
//               padding: "0px",
//               top: "0.3cm"
//             }}>
//               <div style={{ height: "0.7cm", display: "flex", justifyContent: "space-between" }}>
//                 <span style={{ position: "relative", bottom: "0cm", color: "#000" }}>
//                   {data.createdOn && new Date(data.createdOn).toLocaleDateString("en-GB")}
//                 </span>
//                 <b style={{ position: "relative", bottom: "0cm", color: "#000" }}>
//                   {data.voucherTypeGet}
//                 </b>
//               </div>

//               <div style={{ height: "0.7cm" }}>
//                 <b style={{ color: "#000" }}>{data.voucherNumber}</b>
//               </div>

//               <div style={{ height: "1cm", display: "flex", justifyContent: "space-between" }}>
//                 <span style={{ color: "#000" }}>{broker?.empName}</span>
//                 <span style={{ color: "#000" }}>{transport?.empName}</span>
//               </div>
//             </div>
//           </div>

//           {/* PRODUCTS TABLE AREA */}
//           <div style={{
//             position: "absolute",
//             top: "6cm",
//             left: "0",
//             width: "20cm"
//           }}>
//             {products.filter(p => p.itemName).map((p, i) => (
//               <div
//                 key={i}
//                 style={{
//                   display: "flex",
//                   height: "0.5cm",          
//                   lineHeight: "0.5cm",      
//                   alignItems: "left"
//                 }}
//               >
//                 {/* S.No */}
//                 <div
//                   style={{
//                     width: "1cm",
//                     textAlign: "right",
//                     marginLeft:"0.2cm",
//                     fontWeight: "bold",
//                     color: "#000"
//                   }}
//                 >
//                   {i + 1}
//                 </div>

//                 {/* Item Name */}
//                 <div
//                   style={{
//                     marginLeft: "0.4cm",
//                     width: "8.2cm",
//                     lineHeight: "normal",
//                     color: "#000",
//                     fontSize:"13px"
//                   }}
//                 >
//                   {p.itemName}
//                 </div>

//                 <div style={{ width: "2cm", color: "#000" }}>{p.hsnCode}</div>
//                 <div style={{ width: "1.5cm", color: "#000" }}>{p.gstPercentage}</div>
//                 <div style={{ width: "1.2cm", color: "#000" }}>{p.billQuantity}</div>
//                 <div style={{ width: "3cm", color: "#000" }}>{p.itemRate}</div>
//                 <div style={{ width: "1cm", color: "#000" }}>{p.quantity}</div>
//                 <div style={{ width: "3.5cm", textAlign: "right", color: "#000" }}>
//                   {NumberFormat(p.amount)}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* AMOUNT IN WORDS */}
//           <div
//             style={{
//               fontWeight: "bold",
//               position: "absolute",
//               top: "9.7cm",
//               left: "2cm",
//               color: "#000",
//               width: "15cm"
//             }}
//           >
//             {numberToWords(parseInt(netAmount))}
//           </div>

//           {/* EXPENSES SECTION */}
//           <div style={{ 
//             position: "absolute",
//             top: "8.5cm",
//             left: "4cm",
//             width: "15cm"
//           }}>
//             {expenses.map((e, i) => (
//               <div
//                 key={i}
//                 style={{
//                   display: "flex",
//                   height: "0.5cm",
//                   lineHeight: "0.5cm",
//                   alignItems: "center"
//                 }}
//               >
//                 <div style={{ width: "5.0cm" }}></div>
//                 <div style={{ width: "0.3cm" }}></div>
//                 <div style={{ width: "1.9cm" }}></div>
//                 <div style={{ width: "0.9cm" }}></div>
//                 <div style={{ width: "1.3cm" }}></div>

//                 <div
//                   style={{
//                     width: "4.2cm",
//                     marginLeft: "0cm",
//                     lineHeight: "normal",
//                     color: "#000"
//                   }}
//                 >
//                   {e.expenseName}
//                 </div>

//                 <div style={{ width: "0cm" }}></div>

//                 <div
//                   style={{
//                     width: "1.5cm",
//                     textAlign: "right",
//                     color: "#000"
//                   }}
//                 >
//                   {NumberFormat(e.expenseValue)}
//                 </div>
//               </div>
//             ))}

//             {/* ROUND OFF */}
//             {data?.roundOffValue ? (
//               <div style={{ display: "flex", height: "1cm", fontWeight: "bold" }}>
//                 <div style={{ width: "0cm" }}></div>
//                 <div style={{ width: "4.3cm" }}></div>
//                 <div style={{ width: "1.9cm" }}></div>
//                 <div style={{ width: "0.9cm" }}></div>
//                 <div style={{ width: "1.3cm" }}></div>
//                 <div style={{ width: "3.7cm" }}></div>
//                 <div style={{ width: "1.5cm" }}></div>
//                 <div style={{ width: "1.0cm", marginLeft: "1.1cm", color: "#000" }}>
//                   {NumberFormat(data.roundOffValue)}
//                 </div>
//               </div>
//             ) : null}

//             {/* NET AMOUNT */}
//             <div
//               style={{
//                 fontWeight: "bold",
//                 textAlign: "center",
//                 marginLeft: "8.5cm",
//                 marginTop: "0cm",
//                 color: "#000"
//               }}
//             >
//               {netAmount.toFixed(2)}
//             </div>
//           </div>

//           {/* HSN SUMMARY - Centered for print */}
//           <div style={{ 
//             position: "absolute",
//             top: "13cm",
//             left: "4cm", // Changed from -2.5cm to 4cm for centering
//             width: "10cm"
//           }}>
//             {hsnSummary.map((h, i) => (
//               <div
//                 key={i}
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   marginTop: "-1cm"
//                 }}
//               >
//                 <span style={{ color: "#000", fontWeight: "bold" }}>{h.hsn}</span>
//                 <span style={{ color: "#000", fontWeight: "bold" }}>
//                   {NumberFormat(h.amount)}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
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

// Import your A5 background image
// import a5BackgroundImage from './templatea5.jpeg';

import a5BackgroundImage from './plain.jpeg'

const InvoiceTemplate = ({ Do_Id, loadingOn, loadingOff }) => {
  const [data, setData] = useState({});
  const printRef = useRef(null);
  const nav = useNavigate();
  const location = useLocation();
  const [companyInfo, setCompanyInfo] = useState({});
  const storage = JSON.parse(localStorage.getItem('user'));
  
  useEffect(() => {
    if (!checkIsNumber(Do_Id)) return;
    fetchLink({
      address: `sales/salesInvoice/printOuts/invoicePrint?Do_Id=${Do_Id}`,
      loadingOn,
      loadingOff,
    }).then((res) => {
      if (res?.success) setData(res.data?.[0] || {});
    });
  }, [Do_Id]);

  useEffect(() => {
    fetchLink({
      address: `masters/company?Company_id=${storage?.Company_id}`
    }).then(data => {
      if (data.success) {
        setCompanyInfo(data?.data[0] ? data?.data[0] : {})
      }
    }).catch(e => console.error(e))
  }, [storage?.Company_id])

  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const products = toArray(data?.productDetails);
  const expenses = toArray(data?.expencessDetails)
    .filter(e => !e.expenseName?.includes("GST") && !e.expenseName?.toLowerCase().includes("round off"));
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
              margin: 0mm;
            }
            body {
              margin: 0;
              -webkit-print-color-adjust: exact;
            }
            .print-container {
              width: 21cm !important;
              height: 14.8cm !important;
              margin: 0 auto !important;
              padding: 0 !important;
              position: relative !important;
            }
            .no-print {
              display: none !important;
            }
            
            /* Adjust print positioning */
            .print-adjust {
              position: relative !important;
              left: 0.7cm !important; /* Adjust this for centering */
            }
            
            /* Center HSN summary for print */
            .hsn-print {
              position: relative !important;
              left: 1.5cm !important;
            }
          }
          
          /* Preview adjustments */
          @media screen {
            .preview-center {
              margin-left: 1cm;
            }
          }
        `}
      </style>

      <Button onClick={handlePrint} startIcon={<Print />} className="no-print" style={{ margin: "20px" }}>
        Print Preview
      </Button>

      <div
        ref={printRef}
        style={{
          width: "21cm",
          height: "14.8cm",
          position: "relative",
          margin: "0 auto",
          boxSizing: "border-box"
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
            top: "0.5cm",
            width: "100%"
          }}>
          
            <div style={{
              position: "absolute",
              left: "0cm",
              width: "9cm",
              padding: "0px"
            }}>
              <div style={{
                position: "absolute",
                left: "4.5cm",
                fontWeight: "bold",
                top:"0.2cm",
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
              left: "3.0cm",
              fontSize: "15px",
              width: "10cm",
              marginTop: "1cm",
              color: "#000"
            }}>
              {companyInfo?.Company_Address}
              
              <div style={{
                position: "absolute",
                fontSize: "15px",
                width: "10cm",
                left: "0.0cm",
                marginTop: "0.0cm",
                padding: "1px",
                color: "#000"
              }}>
                <p>G.O:746 Puliyur, Sayanapuram,Svga</p>
              </div>
            </div>
          </div>

       
          <div style={{
            position: "absolute",
            top: "3.3cm",
            width: "100%"
          }}>
            <p style={{
              position: "absolute",
              left: "1.0cm",
              fontSize:"13px",
              top: "0.0cm",
              width: "9cm",
              padding: "2.5px"}}>
                {/* To */}
                </p>
           
            <div style={{
              position: "absolute",
              left: "2.4cm",
              fontSize:"13px",
              top: "0.0cm",
              width: "9cm",
              padding: "2.5px"
            }}>
              
              <div style={{ color: "#000" }}>{data.mailingName}</div>
              <div style={{ color: "#000" }}>{data.mailingAddress}</div>
              <div style={{ color: "#000" }}>{data.mailingNumber}</div>
              <div style={{ color: "#000" }}>GSTIN: {data.retailerGstNumber}</div>
            </div>

   
       <div style={{
  position: "absolute",
  left: "12cm",
  width: "8cm",
  fontSize:"12px",
  padding: "0px",
  // top: "0.2cm"
}}>

  <div style={{ 
    height: "0.7cm", 
    display: "flex", 
    justifyContent: "space-between",
    alignItems: "center"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <span style={{ 
        fontWeight: "bold", 
        color: "#000"
      }}>
        {/* Date: */}
        </span>
      <span style={{ color: "#000",marginLeft:"30px" }}>
        {data.createdOn && new Date(data.createdOn).toLocaleDateString("en-GB")}
      </span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <span style={{ 
        fontWeight: "bold", 
        color: "#000",
        marginLeft:"50px",
      }}>
        {/* Bill Type: */}
      </span>
   <b style={{ 
  color: "#000",
  marginLeft: "50px"
}}>
  {data.voucherTypeGet}
</b>
    </div>
  </div>

  {/* Second Row: Bill No */}
  <div style={{ 
    height: "0.7cm",
    display: "flex",
    alignItems: "center",
    gap: "5px"
  }}>
    <span style={{ 
      fontWeight: "bold", 
      color: "#000"
    }}>
      {/* Bill No: */}
      </span>
    <b style={{ color: "#000",marginLeft:"50px" }}>{data.voucherNumber}</b>
  </div>

  {/* Third Row: Broker & Transport */}
  <div style={{ 
    height: "1cm", 
    display: "flex", 
    justifyContent: "space-between",
    alignItems: "center"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <span style={{ 
        fontWeight: "bold", 
        color: "#000"
      }}>
        {/* Broker: */}
        </span>
      <span style={{ color: "#000",marginLeft:"50px" }}>{broker?.empName || "-"}</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
      <span style={{ 
        fontWeight: "bold", 
        color: "#000"
      }}>
        {/* Transport: */}
        </span>
      <span style={{ color: "#000" }}>{transport?.empName || "-"}</span>
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
  fontSize: "10px"
}}>
  {/* COLUMN HEADERS */}
  <div
    style={{
      display: "flex",
      height: "0.5cm",
      lineHeight: "0.5cm",
      alignItems: "left",
      fontWeight: "bold",
    
      marginBottom: "0.3cm"
    }}
  >
    {/* S.No Header */}
    <div
      style={{
        width: "1cm",
        textAlign: "right",
        marginLeft: "0.4cm",
        // color: "#000"
      }}
    >
      {/* No */}
    </div>

    {/* Items Header */}
    <div
      style={{
        marginLeft: "0.2cm",
        width: "8.2cm",
        color: "#000"
      }}
    >
      {/* ITEMS */}
    </div>

    {/* HSN Header */}
    <div style={{ 
      width: "2cm", 
      color: "#000"
    }}>
      {/* HSN */}
    </div>
    
    {/* GST Header */}
    <div style={{ 
      width: "1.5cm",  
      color: "#000"
    }}>
      {/* GST */}
    </div>
    
    {/* BAGS Header */}
    <div style={{ 
      width: "1.2cm",
      color: "#000"
    }}>
      {/* BAGS */}
      </div>
    
    {/* Rate Header */}
    <div style={{ 
      width: "3cm", 
      color: "#000"
    }}>
      {/* Rate */}
      </div>
    
    {/* Qty Header */}
    <div style={{ 
      width: "1cm", 
      color: "#000"
    }}>
      {/* Qty */}
      </div>
    
    {/* Amount Header */}
    <div style={{ 
      width: "3.5cm", 
      textAlign: "right", 
      color: "#000"
    }}>
      {/* Amount */}
    </div>
  </div>

  {/* PRODUCTS LIST */}

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
    {/* S.No - Fixed position */}
    <div style={{ 
      width: "1cm", 
      textAlign: "right",
      marginLeft: "1.2cm",
      fontWeight: "bold",
      color: "#000",
      flexShrink: 0 // Prevents shrinking
    }}>
      {i + 1}
    </div>

    {/* Item Name - Fixed position */}
    <div style={{ 
      marginLeft: "0.5cm",
      width: "6.8cm",
      color: "#000",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      flexShrink: 0
    }}>
      {p.itemName}
    </div>

    {/* HSN Code - Fixed position */}
    <div style={{ 
      width: "1cm", 
      color: "#000",
      marginLeft: "0.5cm",
      textAlign: "center",
      flexShrink: 0
    }}>
      {p.hsnCode}
    </div>
    
    {/* GST Percentage - Fixed width won't affect HSN */}
    <div style={{ 
      width: "1cm",  
      color: "#000",
      textAlign: "right",
      flexShrink: 0,
      
    }}>
      {p.gstPercentage}
    </div>
    
    {/* Quantity */}
    <div style={{ 
      width: "5cm", 
      color: "#000",
      textAlign: "center"
    }}>{p.quantity}</div>
    
    {/* Item Rate */}
    <div style={{ 
      width: "4.5cm", 
      color: "#000",
      textAlign: "center"
    }}>{p.itemRate}</div>

    <div style={{ 
      width: "1.2cm",
      color: "#000",
      marginLeft: "2cm",
      textAlign: "left",
      marginRight:"0.5cm"
    }}>{p.billQuantity}</div>
    
   
    <div style={{ 
      width: "3.5cm", 
      textAlign: "right", 
      color: "#000",
      marginRight: "0.5cm"
    }}>
      {NumberFormat(p.amount)}
    </div>
  </div>
))}
  {/* {products.filter(p => p.itemName).map((p, i) => (
    <div
      key={i}
      style={{
        display: "flex",
        height: "0.5cm",          
        lineHeight: "0.5cm",      
        alignItems: "left",
      
      }}
    >
      {/* S.No */}
      {/* <div
        style={{
          width: "1cm",
          textAlign: "right",
          marginLeft: "0.2cm",
          fontWeight: "bold",
          marginLeft:"1cm",
          color: "#000"
        }}
      >
        {i + 1}
      </div>

      {/* Item Name */}
      {/* <div
    style={{
  marginLeft: "0.4cm",
  width: "15.2cm",
 color: "#000",
  marginBottom: "0.5cm"
}}
      >
        {p.itemName}
      </div> */}

      {/* <div style={{ 
        width: "1cm", 
        color: "#000",
        marginLeft:"1.5cm"
      }}>{p.hsnCode}</div> */}
      
      {/* <div style={{ 
        width: "1.5cm",  
        color: "#000",
      }}>{p.gstPercentage}</div>
          <div style={{ 
        width: "5cm", 
        color: "#000"
      }}>{p.quantity}</div>
     */}
      
      {/* <div style={{ 
        width: "4.5cm", 
        color: "#000"
      }}>{p.itemRate}</div>
       */}
    {/* <div style={{ 
        width: "1.2cm",
        color: "#000",
        marginLeft:"3cm"
      }}>{p.billQuantity}</div>
       */}
      {/* <div style={{ 
        width: "3.5cm", 
        textAlign: "right", 
        color: "#000"
      }}>
        {NumberFormat(p.amount)}
      </div>  */}
    {/* </div> */}
  {/* ))} */}
</div>

   
          <div
            style={{
              fontWeight: "bold",
              position: "absolute",
              top: "10.35cm",
              left: "2.3cm",
              color: "#000",
              width: "15cm"
            }}
          >
            {numberToWords(parseInt(netAmount))}
          </div>

 

          <div style={{ 
  position: "absolute",
  top: "9.6cm",
  left: "0cm",
  width: "20cm"
}}>
  {expenses.map((e, i) => (
    <div
      key={i}
      style={{
        display: "flex",
        height: "0.5cm",
        lineHeight: "0.5cm",
        alignItems: "center"
      }}
    >
      <div style={{ width: "5.0cm" }}></div>
      <div style={{ width: "0.3cm" }}></div>
      <div style={{ width: "1.9cm" }}></div>
      <div style={{ width: "0.9cm" }}></div>
      <div style={{ width: "1.3cm" }}></div>

      <div
        style={{
          width: "4.2cm",
          marginLeft: "4.5cm",
          lineHeight: "normal",
          color: "#000",
          fontSize:'10px'
        }}
      >
        {e.expenseName}
      </div>

      <div style={{ width: "0cm" }}></div>

      <div
        style={{
          width: "1.5cm",
          textAlign: "right",
          color: "#000",
          fontSize: '12px',
          marginRight: "auto"
        }}
      >
        {NumberFormat(e.expenseValue)}
      </div>
    </div>
  ))}

  
  {data?.roundOffValue ? (
    <div style={{ 
      display: "flex", 
      height: "1cm", 
      fontWeight: "bold",
      alignItems: "center"
    }}>
      <div style={{ width: "5.0cm" }}></div>
      <div style={{ width: "0.3cm" }}></div>
      <div style={{ width: "1.9cm" }}></div>
      <div style={{ width: "0.9cm" }}></div>
      <div style={{ width: "1.3cm" }}></div>

    
      <div
        style={{
          width: "4.2cm",
          marginLeft: "8.5cm",
          lineHeight: "normal",
          color: "#000",
          fontSize: '10px',
          fontWeight: "bold"
        }}
      >
  
      </div>

      <div style={{ width: "0cm" }}></div>

     
    <div
  style={{
    width: "1.5cm",
    textAlign: "right",
    color: "#000",
    fontSize: '12px',
    marginRight: "20px",
    marginTop: "9px" 
  }}
>
  {NumberFormat(data.roundOffValue)}
</div>
    </div>
  ) : null}



 <div
  style={{
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: "14cm",
    marginTop: "0.13cm",
    color: "#000",
    fontSize: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "140px"
  }}
>
  <span></span>
  <span>{netAmount.toFixed(2)}</span>
</div>
</div>

         
          <div style={{ 
            position: "absolute",
            top: "14.5cm",
            left: "2cm", 
            width: "10cm"
          }}>
            {hsnSummary.map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginLeft:"0cm",
                  marginTop: "-1cm"
                }}
              >
                <span style={{ color: "#000", fontWeight: "bold" }}>{h.hsn}</span>
                <span style={{ color: "#000", fontWeight: "bold" }}>
                  {NumberFormat(h.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;