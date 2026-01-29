// import { useEffect, useRef, useState } from "react";
// import { fetchLink } from "../../../../Components/fetchComponent";
// import { useReactToPrint } from 'react-to-print';
// import { checkIsNumber, LocalDateWithTime, toArray } from "../../../../Components/functions";
// import { Print } from "@mui/icons-material";
// import { Button } from "@mui/material";

// const findStaffName = (arr, involvedType) => {
//     if (!Array.isArray(arr)) return "";
//     const row = arr.find(
//         (x) => String(x?.empType || "").toLowerCase() === String(involvedType).toLowerCase()
//     );
//     return row?.empName || "";
// };

// const KatchathCopy = ({ Do_Id, Do_Ids=[],loadingOn, loadingOff,isCombinedPrint=false }) => {
//     // const [data, setData] = useState({});
//     const [data, setData] = useState([]); // Changed to array for multiple invoices

//     const printRef = useRef(null);
//    const isMultiple = Array.isArray(Do_Ids) && Do_Ids.length > 0;
//     const idsToFetch = isMultiple ? Do_Ids : (Do_Id ? [Do_Id] : []);



//         useEffect(() => {
//         if (idsToFetch.length === 0) return;
        
//         loadingOn?.();
        
//         const fetchAllData = async () => {
//             try {
//                 const promises = idsToFetch.map(id => 
//                     fetchLink({
//                         address: `sales/salesInvoice/printOuts/katchath?Do_Id=${id}`,
//                         loadingOn: () => {}, // Prevent multiple loading indicators
//                         loadingOff: () => {},
//                     })
//                 );
                
//                 const results = await Promise.all(promises);
//                 const allData = results
//                     .filter(result => result.success && result.data?.[0])
//                     .map(result => result.data[0]);
                
//                 setData(allData);
//             } catch (error) {
//                 console.error('Error fetching katchath data:', error);
//             } finally {
//                 loadingOff?.();
//             }
//         };

//         fetchAllData();
//     }, [JSON.stringify(idsToFetch)]); // Use JSON.stringify for array dependency

//     useEffect(() => {
//         if (!checkIsNumber(Do_Id)) return;
//         fetchLink({
//             address: `sales/salesInvoice/printOuts/katchath?Do_Id=${Do_Id}`,
//             loadingOn, loadingOff
//         }).then(data => {
//             if (data.success) {
//                 setData(data?.data[0] || {})
//             }
//         }).catch(e => console.error(e));
//     }, [Do_Id]);

//     const handlePrint = useReactToPrint({
//         content: () => printRef.current,
//     });


//      if (isCombinedPrint) {
//         return (
//             <div ref={printRef} className="katchath-combined-print">
//                 {data.map((invoice, index) => (
//                     <div key={invoice.Do_Id || index} className="katchath-page">
//                         <div
//                             style={{ 
//                                 width: 'calc(15cm)',
//                                 height: 'calc(10.5cm)',
//                                 marginBottom: index < data.length - 1 ? '20px' : '0'
//                             }}
//                             className="border py-1 px-4"
//                         >
//                             <div className="row">
//                                 <div className="col-5 p-2">
//                                     <h5 className="m-0">{invoice.voucherTypeGet}</h5>
//                                     <p className="m-0">{invoice.createdByGet}</p>
//                                     <p className="m-0">{LocalDateWithTime(invoice.createdOn)}</p>
//                                     <br />
//                                     <p className="m-0">{invoice.mailingName ? `${invoice.mailingName},` : " "}</p>
//                                     <p className="m-0">{invoice.mailingAddress ? `${invoice.mailingAddress},` : " "}</p>
//                                     <p className="m-0">{invoice.mailingCity ? `${invoice.mailingCity},` : " "}</p>
//                                     <p className="m-0">{invoice.mailingNumber ? invoice.mailingNumber : " "}</p>
//                                 </div>

//                                 <div className="col-7 p-2">
//                                     <div className="table-responsive">
//                                         <table className="table table-borderless">
//                                             <tbody>
//                                                 {toArray(invoice.productDetails).map((item, idx) => (
//                                                     <tr key={idx}>
//                                                         <td>{item.itemName}</td>
//                                                         <td>{item.quantity}</td>
//                                                     </tr>
//                                                 ))}
//                                                 <tr>
//                                                     <td className="border">Total</td>
//                                                     <td className="border">
//                                                         {toArray(invoice.productDetails).reduce((acc, item) => acc + item.quantity, 0)}
//                                                     </td>
//                                                 </tr>
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 </div>
//                             </div>

//                             <br />

//                             <div>
//                                 <p className="m-0">Lorry: {findStaffName(invoice.staffDetails, "Transport")}</p>
//                                 <p className="m-0">LoadMan: {findStaffName(invoice.staffDetails, "Load Man")}</p>
//                             </div>
//                         </div>
                        
//                         {/* Page break for printing except for last invoice */}
//                         {index < data.length - 1 && (
//                             <div className="page-break" style={{ 
//                                 pageBreakAfter: 'always',
//                                 breakAfter: 'page'
//                             }} />
//                         )}
//                     </div>
//                 ))}
//             </div>
//         );
//     }

//     return (
//         <div className="d-flex flex-column align-items-center justify-content-center">
//             <Button onClick={handlePrint} startIcon={<Print />}>Print</Button>
//             <div
//                 style={{ 
                  
//                     width: 'calc(15cm )',
//     height: 'calc(10.5cm)',
//     transform: 'scale(1.1)',  
//     top:'260px',
//     marginLeft:'4px'
//     // transformOrigin: 'top left',
//     // marginRight:'100px'

//                  }}
//                 ref={printRef}
//                 className="border py-1 px-4"
//             >
//                 <div className="row">

//                     <div className="col-5 p-2">
//                         <h5 className="m-0">{data.voucherTypeGet}</h5>
//                         <p className="m-0">{data.createdByGet}</p>
//                         <p className="m-0">{LocalDateWithTime(data.createdOn)}</p>
//                         <br />
//                         <p className="m-0">{data.mailingName ? `${data.mailingName},` : " "}</p>
//                         <p className="m-0">{data.mailingAddress ? `${data.mailingAddress},` : " "}</p>
//                         <p className="m-0">{data.mailingCity ? `${data.mailingCity},` : " "}</p>
//                         <p className="m-0">{data.mailingNumber ? data.mailingNumber : " "}</p>
//                     </div>

//                     <div className="col-7 p-2">
//                         <div className="table-responsive">
//                             <table className="table table-borderless">
//                                 <tbody>
//                                     {toArray(data.productDetails).map((item, index) => (
//                                         <tr key={index}>
//                                             <td>{item.itemName}</td>
//                                             <td>{item.quantity}</td>
//                                         </tr>
//                                     ))}
//                                     <tr>
//                                         <td className="border">Total</td>
//                                         <td className="border">{toArray(data.productDetails).reduce((acc, item) => acc + item.quantity, 0)}</td>
//                                     </tr>
//                                 </tbody>
//                             </table>
//                         </div>
//                     </div>

//                 </div>

//                 <br />

//                 <div>
//                     <p className="m-0">Lorry: {findStaffName(data.staffDetails, "Transport")}</p>
//                     <p className="m-0">LoadMan: {findStaffName(data.staffDetails, "Load Man")}</p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default KatchathCopy;










import { useEffect, useRef, useState } from "react";
import { fetchLink } from "../../../../Components/fetchComponent";
import { useReactToPrint } from 'react-to-print';
import { checkIsNumber, LocalDateWithTime, toArray } from "../../../../Components/functions";
import { Print } from "@mui/icons-material";
import { Button } from "@mui/material";
import  './katchathCopy.css';
const findStaffName = (arr, involvedType) => {
    if (!Array.isArray(arr)) return "";
    const row = arr.find(
        (x) => String(x?.empType || "").toLowerCase() === String(involvedType).toLowerCase()
    );
    return row?.empName || "";
};

const KatchathCopy = ({ Do_Id, Do_Ids = [], loadingOn, loadingOff, isCombinedPrint = false }) => {
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
                        address: `sales/salesInvoice/printOuts/katchath?Do_Id=${id}`,
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
                console.error('Error fetching katchath data:', error);
            } finally {
                loadingOff?.();
            }
        };

        fetchAllData();
    }, [JSON.stringify(idsToFetch)]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

 
    if (isCombinedPrint) {
        return (
            <div ref={printRef} className="katchath-combined-print">
                {data.map((invoice, index) => (
                    <div key={invoice.Do_Id || index} className="katchath-page">
                        <div
                            // style={{ 
                            //     width: 'calc(14cm)',
                            //     height: 'calc(10.5cm)',
                            //     marginBottom: index < data.length - 1 ? '20px' : '0'
                            // }
                               style={{ 
                             width: 'calc(13.8cm)',
                                height: 'calc(10.5cm)',
   transform: 'scale(1.0)',  
  margin: '0 auto',
  position: 'relative',
  boxSizing: 'border-box',
  fontWeight:'bold'
                            // pageBreakAfter: index < data.length - 1 ? "always" : "auto",
                            // breakAfter: index < data.length - 1 ? "page" : "auto"
                        }}
                            className="border py-1 px-2"
                        >
                            <div className="row">
                                <div className="col-5 p-2">
                                    <h5 className="m-0">{invoice.voucherTypeGet}</h5>
                                    <p className="m-0">{invoice.createdByGet}</p>
                                    <p className="m-0">{LocalDateWithTime(invoice.createdOn)}</p>
                                    <br />
                                    <p className="m-0">{invoice.mailingName ? `${invoice.mailingName},` : " "}</p>
                                    <p className="m-0">{invoice.mailingAddress ? `${invoice.mailingAddress},` : " "}</p>
                                    <p className="m-0">{invoice.mailingCity ? `${invoice.mailingCity},` : " "}</p>
                                    <p className="m-0">{invoice.mailingNumber ? invoice.mailingNumber : " "}</p>
                                </div>

                                <div className="col-7 p-2">
                                    <div className="table-responsive">
                                        <table className="table table-borderless" style={{lineHeight:'0.37cm'}}>
                                            <tbody>
                                                {toArray(invoice.productDetails).map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td >{item.itemName}</td>
                                                        <td>{item.quantity}</td>
                                                    </tr>
                                                ))}
                                                <tr>
                                                    <td className="border">Total</td>
                                                    <td className="border">
                                                        {toArray(invoice.productDetails).reduce((acc, item) => acc + item.quantity, 0)}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <br />

                            <div>
                                <p className="m-0">Lorry: {findStaffName(invoice.staffDetails, "Transport")}</p>
                                <p className="m-0">LoadMan: {findStaffName(invoice.staffDetails, "Load Man")}</p>
                            </div>
                        </div>
                        
               
                        {index < data.length - 1 && (
                            <div className="page-break" style={{ 
                                pageBreakAfter: 'always',
                                breakAfter: 'page'
                            }} />
                        )}
                    </div>
                ))}
            </div>
        );
    }

    // Single print mode (original behavior)
    return (
        <div className="d-flex flex-column align-items-center justify-content-center">
            {/* <Button onClick={handlePrint} startIcon={<Print />}>
                Print {data.length > 1 ? `(${data.length} invoices)` : ''}
            </Button> */}
              <div className="print-button-area">
                <Button onClick={handlePrint} startIcon={<Print />}>Print</Button>
            </div>
            <div ref={printRef} className="katchath-multiple-print" >
                {data.map((invoice, index) => (
                    <div style={{fontWeight:'bold'}} key={invoice.Do_Id || index} className="mb-4">
                        <div
                         
                            style={{
     width: 'calc(14cm)',
                                height: 'calc(10.5cm)',
   transform: 'scale(1.0)',  
  margin: '0 auto',
  position: 'relative',
  boxSizing: 'border-box',
  fontWeight:'bold'
}}
className="border py-4 px-4"

                        >
                            <div className="row">
                                <div className="col-5 p-2">
                                    <h5 className="m-0">{invoice.voucherTypeGet}</h5>
                                    <p className="m-0">{invoice.createdByGet}</p>
                                    <p className="m-0">{LocalDateWithTime(invoice.createdOn)}</p>
                                    <br />
                                    <p className="m-0">{invoice.mailingName ? `${invoice.mailingName},` : " "}</p>
                                    <p className="m-0">{invoice.mailingAddress ? `${invoice.mailingAddress},` : " "}</p>
                                    <p className="m-0">{invoice.mailingCity ? `${invoice.mailingCity},` : " "}</p>
                                    <p className="m-0">{invoice.mailingNumber ? invoice.mailingNumber : " "}</p>
                                </div>

                                <div className="col-7 p-2">
                                    <div className="table-responsive">
                                        <table className="table table-borderless"  style={{lineHeight:'0.35cm'}}>
                                            <tbody>
                                                {toArray(invoice.productDetails).map((item, idx) => (
                                                    <tr key={idx}>
                                                        <td>{item.itemName}</td>
                                                        <td>{item.quantity}</td>
                                                    </tr>
                                                ))}
                                         <tr>
                                         <td className="border text-right pr-4" style={{textAlign: "right", fontSize: "18px", fontWeight: "bold"}}>
                                             Total
                                         </td>
                                         <td className="border text-right" style={{textAlign: "right", fontSize: "18px", fontWeight: "bold"}}>
                                             {toArray(invoice.productDetails).reduce((acc, item) => acc + item.quantity, 0)}
                                         </td>
                                     </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <br />

                            <div>
                                <p className="m-0">Lorry: {findStaffName(invoice.staffDetails, "Transport")}</p>
                                <p className="m-0">LoadMan: {findStaffName(invoice.staffDetails, "Load Man")}</p>
                            </div>
                        </div>
                        
                        {/* Add some spacing between invoices in preview */}
                        {index < data.length - 1 && <hr className="my-4" />}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default KatchathCopy;