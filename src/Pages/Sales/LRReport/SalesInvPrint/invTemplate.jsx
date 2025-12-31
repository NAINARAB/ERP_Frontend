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
    
          {/* <div style={{
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
              left: "3.3cm",
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
            
          </div> */}
<div
  style={{
    position: "absolute",
    top: "0.4cm",
    width: "100%",
    display: "flex"
  }}
>
  {/* ================= LEFT SIDE ================= */}
  <div
    style={{
      position: "relative",
      width: "60%"
    }}
  >
    <div
      style={{
        position: "absolute",
        left: "0cm",
        width: "9cm",
        padding: "0px"
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "5.3cm",
          fontWeight: "bold",
          top: "0.2cm",
          fontSize: "25px",
          width: "7cm",
          padding: "3px",
          color: "#000"
        }}
      >
        {companyInfo?.Company_Name}
      </div>
    </div>

    <div
      style={{
        position: "absolute",
        left: "4.2cm",
        fontSize: "15px",
        width: "10cm",
        marginTop: "1cm",
        color: "#000"
      }}
    >
      {/* {companyInfo?.Company_Address}
       */}
       <p>H.O: 153, Chitrakara Street, Madurai -01</p>

      <div
        style={{
          position: "absolute",
          fontSize: "14px",
          width: "10cm",
          bottom: "0cm",
          left:"10px",
          top: "0.0cm",
          padding: "0px",
          color: "#000"
        }}
      >
        <br/>
        <p>G.O:746 Puliyur, Sayanapuram, Svga</p>
 
         {/* <p>G.O:746 Puliyur, Sayanapuram, Svga</p> */}
      </div>
       <div
        style={{
          position: "absolute",
          fontSize: "14px",
          width: "10cm",
          bottom: "0cm",
   
          top: "15px",
          right:"20px",
          padding: "0px",
          color: "#000"
        }}
      >
        <br/>
        <p>Bill of Supply- Disclaimer Affidavit Filed -Exempted</p>
 
         {/* <p>G.O:746 Puliyur, Sayanapuram, Svga</p> */}
      </div>
      
    </div>
  </div>

  {/* ================= RIGHT SIDE (STATIC DATA) ================= */}
  <div
    style={{
      position: "relative",
      width: "40%",
      fontSize: "13px",
      color: "#000",
      paddingRight: "1cm",
      textAlign: "right",
      top:"15px"
    }}
  >
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
              fontSize:"13px",
              top: "0.0cm",
              width: "9cm",
              padding: "2.5px"}}>
                {/* To */}
                </p>
           
            <div style={{
              position: "absolute",
              left: "3.25cm",
              fontSize:"13px",
              top: "0.3cm",
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
  top: "0.3cm"
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
    <div style={{ display: "flex",  }}>
      <span style={{ 
        fontWeight: "bold", 
        color: "#000"
      }}>
        {/* Transport: */}
        </span>
      <span style={{ color: "#000",alignItems: "center", gap: "5px" }}>{transport?.empName || "-"}</span>
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
    
  
    <div style={{ 
      width: "1.2cm",
      color: "#000"
    }}>
    
      </div>
    

    <div style={{ 
      width: "3cm", 
      color: "#000"
    }}>

      </div>
    
  
    <div style={{ 
      width: "1cm", 
      color: "#000"
    }}>
    
      </div>
    
   
    <div style={{ 
      width: "3.5cm", 
      textAlign: "right", 
      color: "#000"
    }}>

    </div>
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
      marginRight:"0.15cm"
      
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
      marginRight:"0.5cm"
    }}>{p.itemRate}</div>

    <div style={{ 
      width: "1.2cm",
      color: "#000",
      
       fontWeight: "bold",
      marginLeft: "1cm",
      textAlign: "left",
      marginRight:"0.9cm"
    }}>{p.billQuantity}</div>
    
   
    <div style={{ 
      width: "5cm", 
      textAlign: "right", 
      
       fontWeight: "bold",
      color: "#000",
      // marginRight: "0.9cm"
    }}>
      {NumberFormat(p.amount)}
    </div>
  </div>
))}
</div>
<p
  style={{
    position: "absolute",
     fontWeight: "bold",
    top: "9.95cm", // moved down
    left: "2.5cm"
  }}
>
  TMB A/C NO: 002530350870041  IFSC : TMBL0000002
</p>

   
          <div
            style={{
              // fontWeight: "bold",
              position: "absolute",
              top: "10.6cm",
              
              left: "2.5cm",
              color: "#000",
              width: "15cm"
            }}
          >
         <span>INR</span>   {numberToWords(parseInt(netAmount))}
          </div>

 
<div style={{ 
  position: "absolute",
  top: "9.1cm",
  left: "0cm",
  width: "20cm"
}}>
  {/* EXPENSES - positioned dynamically based on product count */}
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
    <div
      style={{
        position: "absolute",
        top: "0.5cm", 
        display: "flex", 
        height: "0.5cm", 
        fontWeight: "bold",
        alignItems: "center",
        width: "100%"
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
          marginLeft: "8.5cm",
          lineHeight: "normal",
          color: "#000",
          fontSize: '10px',
          fontWeight: "bold"
        }}
      >
        {/* Empty or you can add "Round Off:" label here */}
      </div>

      <div style={{ width: "0cm" }}></div>

      {/* Round Off Value - Fixed position */}
      <div
        style={{
          position: "absolute",
          right: "0.5cm",
          
          textAlign: "right",
          color: "#000",
          fontSize: '12px',
          fontWeight: "bold",
          top: "0.45cm"
        }}
      >
        {NumberFormat(data.roundOffValue)}
      </div>
    </div>
  ) : null}

  {/* NET AMOUNT - Fixed position regardless of expenses */}
  <div
    style={{
      position: "absolute",
      top: "1.6cm", // Fixed position after roundoff
      left: "14cm",
      fontWeight: "bold",
      textAlign: "center",
      color: "#000",
      fontSize: "18px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      gap: "140px"
    }}
  >
    <span></span>
    <span>{NumberFormat(netAmount)}</span>
    {/* <span>{netAmount}</span> */}
  </div>
</div>

         
          {/* <div style={{ 
            position: "absolute",
            top: "14.5cm",
            fontSize:"15px",
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
                <span style={{ color: "#000", }}>{h.hsn}</span>
                <span style={{ color: "#000",  }}>
                  {NumberFormat(h.amount)}
                </span>
              </div>
            ))}
          </div> */}



          {/* <div
  style={{
    position: "absolute",
    top: "11.7cm",
    fontSize: "11px",
    left: "3cm",
    // width: "10cm"
  }}
>
  {hsnSummary.map((h, i) => (
    <div
      key={i}
      style={{
        display: "flex",
        // justifyContent: "space-between",
        gap:'160px',
        marginTop: "0px"
      }}
    >
      <span style={{ color: "#000" }}>{h.hsn}</span>
      <span style={{ color: "#000" }}>
        {NumberFormat(h.amount)}
      </span>
    </div>
  ))}


  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginTop: "0px",
      // borderTop: "1px solid #000",
      paddingTop: "4px",
      fontWeight: "bold"
    }}
  >
    <span style={{ color: "#000" }}></span>
    <span style={{ color: "#000" }}>
      {NumberFormat(
        hsnSummary.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        )
      )}
    </span>
  </div>
</div> */}


<div
  style={{
    position: "absolute",
    top: "11.6cm",
    fontSize: "11px",
    left: "3cm",
    width: "10cm" // Fixed width container
  }}
>
  {hsnSummary.map((h, i) => (
    <div
      key={i}
      style={{
        display: "flex",
        // justifyContent: "space-between", // This will push items to edges
        alignItems: "left",
        width: "100%",
        marginBottom: "0.1cm"
      }}
    >
      <span style={{ 
        color: "#000",
        fontWeight: "bold",
        minWidth: "3cm" // Fixed width for HSN code
      }}>
        {h.hsn}
      </span>
      <span style={{ 
        color: "#000",
        fontWeight: "bold",
        textAlign: "left",
        minWidth: "3cm" // Fixed width for amount
      }}>
        {NumberFormat(h.amount)}
      </span>
    </div>
  ))}
 <div
    style={{
      display: "flex",
      justifyContent: "flex-start", // Aligns total to right side (same as amounts)
      width: "100%",
      marginTop: "0.0cm",
      fontWeight: "bold"
    }}
  >
    <span style={{ 
      color: "#000",
      width: "4cm", // Same width as amount column
      textAlign: "right" // Align to right like other amounts
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
    </div>
  );
};

export default InvoiceTemplate;


















// import { useEffect, useRef, useState } from "react";
// import { toArray, checkIsNumber, numberToWords, NumberFormat } from "../../../../Components/functions";
// import { fetchLink } from "../../../../Components/fetchComponent";
// import { useReactToPrint } from "react-to-print";
// import { Button } from "@mui/material";
// import { Print } from "@mui/icons-material";
// import { useNavigate, useLocation } from "react-router-dom";
// import a5BackgroundImage from './plain.jpeg';

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

//   // Calculate dynamic positions
//   const productCount = products.filter(p => p.itemName).length;
//   const productTableStart = 5.2; // cm from top where product table starts
//   const productRowHeight = 0.5; // cm per product row
//   const productTableHeight = productCount * productRowHeight;
  
//   // Fixed positions for totals (these will be calculated dynamically)
//   const expensesStart = productTableStart + productTableHeight + 0.5; // Start after products
//   const roundOffTop = expensesStart + (expenses.length * 0.5); // After expenses
//   const netAmountTop = roundOffTop + (data?.roundOffValue ? 0.5 : 0); // After roundoff
//   const amountInWordsTop = netAmountTop + 0.7; // After net amount
//   const hsnSummaryTop = 13.5; // Fixed at bottom (14.8cm - 1.3cm margin)

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
    
//           <div style={{
//             position: "absolute",
//             top: "0.5cm",
//             width: "100%"
//           }}>
          
//             <div style={{
//               position: "absolute",
//               left: "0cm",
//               width: "9cm",
//               padding: "0px"
//             }}>
//               <div style={{
//                 position: "absolute",
//                 left: "4.5cm",
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

//             <div style={{
//               position: "absolute",
//               left: "3.0cm",
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

//           <div style={{
//             position: "absolute",
//             top: "2.9cm",
//             width: "100%"
//           }}>
//             <p style={{
//               position: "absolute",
//               left: "1.0cm",
//               fontSize:"13px",
//               top: "0.0cm",
//               width: "9cm",
//               padding: "2.5px"}}>
//                 {/* To */}
//             </p>
           
//             <div style={{
//               position: "absolute",
//               left: "2.7cm",
//               fontSize:"13px",
//               top: "0.0cm",
//               width: "9cm",
//               padding: "2.5px"
//             }}>
//               <div style={{ color: "#000" }}>{data.mailingName}</div>
//               <div style={{ color: "#000" }}>{data.mailingAddress}</div>
//               <div style={{ color: "#000" }}>{data.mailingNumber}</div>
//               <div style={{ color: "#000" }}>GSTIN: {data.retailerGstNumber}</div>
//             </div>

//             <div style={{
//               position: "absolute",
//               left: "12cm",
//               width: "8cm",
//               fontSize:"12px",
//               padding: "0px"
//             }}>
//               <div style={{ 
//                 height: "0.7cm", 
//                 display: "flex", 
//                 justifyContent: "space-between",
//                 alignItems: "center"
//               }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//                   <span style={{ 
//                     fontWeight: "bold", 
//                     color: "#000"
//                   }}>
//                     {/* Date: */}
//                   </span>
//                   <span style={{ color: "#000",marginLeft:"30px" }}>
//                     {data.createdOn && new Date(data.createdOn).toLocaleDateString("en-GB")}
//                   </span>
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//                   <span style={{ 
//                     fontWeight: "bold", 
//                     color: "#000",
//                     marginLeft:"50px",
//                   }}>
//                     {/* Bill Type: */}
//                   </span>
//                   <b style={{ 
//                     color: "#000",
//                     marginLeft: "50px"
//                   }}>
//                     {data.voucherTypeGet}
//                   </b>
//                 </div>
//               </div>

//               <div style={{ 
//                 height: "0.7cm",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: "5px"
//               }}>
//                 <span style={{ 
//                   fontWeight: "bold", 
//                   color: "#000"
//                 }}>
//                   {/* Bill No: */}
//                 </span>
//                 <b style={{ color: "#000",marginLeft:"50px" }}>{data.voucherNumber}</b>
//               </div>

//               <div style={{ 
//                 height: "1cm", 
//                 display: "flex", 
//                 justifyContent: "space-between",
//                 alignItems: "center"
//               }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//                   <span style={{ 
//                     fontWeight: "bold", 
//                     color: "#000"
//                   }}>
//                     {/* Broker: */}
//                   </span>
//                   <span style={{ color: "#000",marginLeft:"50px" }}>{broker?.empName || "-"}</span>
//                 </div>
//                 <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
//                   <span style={{ 
//                     fontWeight: "bold", 
//                     color: "#000"
//                   }}>
//                     {/* Transport: */}
//                   </span>
//                   <span style={{ color: "#000" }}>{transport?.empName || "-"}</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* PRODUCTS TABLE AREA - Fixed position */}
//           <div style={{
//             position: "absolute",
//             top: "5.2cm",
//             left: "0",
//             width: "20cm",
//             fontSize: "10px"
//           }}>
//             {/* COLUMN HEADERS */}
//             <div
//               style={{
//                 display: "flex",
//                 height: "0.5cm",
//                 lineHeight: "0.5cm",
//                 alignItems: "left",
//                 fontWeight: "bold",
//                 marginBottom: "0.3cm"
//               }}
//             >
//               <div style={{ width: "1cm", textAlign: "right", marginLeft: "0.4cm" }}>
//                 {/* No */}
//               </div>
//               <div style={{ marginLeft: "0.2cm", width: "8.2cm", color: "#000" }}>
//                 {/* ITEMS */}
//               </div>
//               <div style={{ width: "2cm", color: "#000" }}>
//                 {/* HSN */}
//               </div>
//               <div style={{ width: "1.5cm", color: "#000" }}>
//                 {/* GST */}
//               </div>
//               <div style={{ width: "1.2cm", color: "#000" }}>
//                 {/* BAGS */}
//               </div>
//               <div style={{ width: "3cm", color: "#000" }}>
//                 {/* Rate */}
//               </div>
//               <div style={{ width: "1cm", color: "#000" }}>
//                 {/* Qty */}
//               </div>
//               <div style={{ width: "3.5cm", textAlign: "right", color: "#000" }}>
//                 {/* Amount */}
//               </div>
//             </div>

//             {/* PRODUCT ROWS */}
//             {products.filter(p => p.itemName).map((p, i) => (
//               <div
//                 key={i}
//                 style={{
//                   display: "flex",
//                   height: "0.5cm",          
//                   lineHeight: "0.5cm",      
//                   alignItems: "center",
//                 }}
//               >
//                 <div style={{ 
//                   width: "1cm", 
//                   textAlign: "right",
//                   marginLeft: "1.4cm",
//                   fontWeight: "bold",
//                   color: "#000",
//                   flexShrink: 0 
//                 }}>
//                   {i + 1}
//                 </div>

//                 <div style={{ 
//                   marginLeft: "0.5cm",
//                   width: "6.8cm",
//                   color: "#000",
//                   fontWeight: "bold",
//                   whiteSpace: "nowrap",
//                   overflow: "hidden",
//                   textOverflow: "ellipsis",
//                   flexShrink: 0
//                 }}>
//                   {p.itemName}
//                 </div>

//                 <div style={{ 
//                   width: "1cm", 
//                   color: "#000",
//                   marginLeft: "0.3cm",
//                   textAlign: "center",
//                   fontWeight: "bold",
//                   flexShrink: 0
//                 }}>
//                   {p.hsnCode}
//                 </div>
                
//                 <div style={{ 
//                   width: "1cm",  
//                   color: "#000",
//                   textAlign: "right",
//                   fontWeight: "bold",
//                   flexShrink: 0,
//                   marginRight:"0.2cm"
//                 }}>
//                   {p.gstPercentage}
//                 </div>
                
//                 <div style={{ 
//                   width: "5cm", 
//                   color: "#000",
//                   textAlign: "center",
//                   fontWeight: "bold",
//                 }}>{p.quantity}</div>
                
//                 <div style={{ 
//                   width: "4.7cm", 
//                   color: "#000",
//                   textAlign: "center",
//                   fontWeight: "bold",
//                   marginRight:"0.5cm"
//                 }}>{p.itemRate}</div>

//                 <div style={{ 
//                   width: "1.2cm",
//                   color: "#000",
//                   fontWeight: "bold",
//                   marginLeft: "1cm",
//                   textAlign: "left",
//                   marginRight:"0.9cm"
//                 }}>{p.billQuantity}</div>
                
//                 <div style={{ 
//                   width: "3.5cm", 
//                   textAlign: "right", 
//                   fontWeight: "bold",
//                   color: "#000",
//                   marginRight: "0.5cm"
//                 }}>
//                   {NumberFormat(p.amount)}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* AMOUNT IN WORDS - Fixed position relative to product count */}
//           <div
//             style={{
//               fontWeight: "bold",
//               position: "absolute",
//               top: `${amountInWordsTop}cm`,
//               left: "2.3cm",
//               color: "#000",
//               width: "15cm",
//               fontSize: "11px"
//             }}
//           >
//             {numberToWords(parseInt(netAmount))}
//           </div>

//           {/* EXPENSES SECTION - Dynamic position based on product count */}
//           <div style={{ 
//             position: "absolute",
//             top: `${expensesStart}cm`,
//             left: "0cm",
//             width: "20cm"
//           }}>
//             {/* EXPENSES ROWS */}
//             {expenses.map((e, i) => (
//               <div
//                 key={i}
//                 style={{
//                   display: "flex",
//                   height: "0.5cm",
//                   lineHeight: "0.5cm",
//                   alignItems: "center",
//                   justifyContent: "flex-end"
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
//                     marginLeft: "4.5cm",
//                     lineHeight: "normal",
//                     color: "#000",
//                     fontSize:'10px',
//                     textAlign: "right"
//                   }}
//                 >
//                   {e.expenseName}
//                 </div>

//                 <div style={{ width: "0cm" }}></div>

//                 <div
//                   style={{
//                     width: "1.5cm",
//                     textAlign: "right",
//                     color: "#000",
//                     fontSize: '12px',
//                     marginRight: "1.5cm"
//                   }}
//                 >
//                   {NumberFormat(e.expenseValue)}
//                 </div>
//               </div>
//             ))}

//             {/* ROUND OFF - Always at same relative position */}
//             {data?.roundOffValue ? (
//               <div style={{ 
//                 display: "flex", 
//                 height: "0.5cm", 
//                 fontWeight: "bold",
//                 alignItems: "center",
//                 justifyContent: "flex-end",
//                 marginTop: expenses.length > 0 ? "0" : "0"
//               }}>
//                 <div style={{ width: "5.0cm" }}></div>
//                 <div style={{ width: "0.3cm" }}></div>
//                 <div style={{ width: "1.9cm" }}></div>
//                 <div style={{ width: "0.9cm" }}></div>
//                 <div style={{ width: "1.3cm" }}></div>

//                 <div
//                   style={{
//                     width: "4.2cm",
//                     marginLeft: "8.5cm",
//                     lineHeight: "normal",
//                     color: "#000",
//                     fontSize: '10px',
//                     fontWeight: "bold",
//                     textAlign: "right"
//                   }}
//                 >
//                   Round Off:
//                 </div>

//                 <div style={{ width: "0cm" }}></div>

//                 <div
//                   style={{
//                     width: "1.5cm",
//                     textAlign: "right",
//                     color: "#000",
//                     fontSize: '12px',
//                     marginRight: "1.5cm",
//                     marginTop: "0px"
//                   }}
//                 >
//                   {NumberFormat(data.roundOffValue)}
//                 </div>
//               </div>
//             ) : null}

//             {/* NET AMOUNT - Always at same relative position */}
//             <div
//               style={{
//                 fontWeight: "bold",
//                 position: "absolute",
//                 top: `${data?.roundOffValue ? 0.5 : 0}cm`,
//                 left: "14cm",
//                 color: "#000",
//                 fontSize: "18px",
//                 display: "flex",
//                 justifyContent: "center",
//                 alignItems: "center",
//                 gap: "140px"
//               }}
//             >
//               <span></span>
//               <span>{NumberFormat(netAmount)}</span>
//             </div>
//           </div>

//           {/* HSN SUMMARY - Fixed at bottom */}
//           <div style={{ 
//             position: "absolute",
//             top: `${hsnSummaryTop}cm`,
//             left: "2cm", 
//             width: "10cm"
//           }}>
//             {hsnSummary.map((h, i) => (
//               <div
//                 key={i}
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-around",
//                   marginLeft:"0cm",
//                   marginTop: i === 0 ? "0cm" : "-0.8cm"
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