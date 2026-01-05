import { useEffect, useRef, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { useReactToPrint } from "react-to-print";
import { checkIsNumber, LocalDateWithTime, toArray } from "../../../Components/functions";
import { Button } from "@mui/material";
import { Print } from "@mui/icons-material";

const DeliverySlipprint = ({ Do_Id, Do_Ids = [], loadingOn, loadingOff, isCombinedPrint = false, printScale = 1  }) => {

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
  documentTitle: `Delivery Slip${data.length > 1 ? ` (${data.length})` : ''}`,
  pageStyle: `
    @page {
      size: auto;
      margin: 0.5cm;
    }

    html, body {
      margin: 0;
      padding: 0;
    }

    /* Hide non-print content */
    .print-button-area {
      display: none !important;
    }

    /* MAIN PRINT CONTAINER */
    #delivery-slip-print-content {
      width: 10.2cm;
      margin: 0 auto !important;  
    }

    /* EACH PAGE */
    .delivery-page {
      width: 10.2cm;
      height: 14.5cm;
      margin: 0 auto !important; 
      page-break-after: always;
      break-after: page;
      position: relative;
      box-sizing: border-box;
    }

    .delivery-page:last-child {
      page-break-after: auto;
    }

    * {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  `
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
                                  
                                    margin: '0 auto'
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
                                        top: "3.45cm",
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
                                        top: "4.26cm",
                                        left: "2cm",
                                        right: "0.25cm",
                                        overflow: "hidden"
                                    }}
                                >
                                    <div style={{ fontWeight: "bold", fontSize: "15px" }}>
                                        <p style={{ margin: "0 0 0.1cm 0", lineHeight: "1.2" }}>
                                            {invoice.mailingName ? `${invoice.mailingName},` : ""}
                                        </p>
                                        <p style={{ margin: 0, lineHeight: "1.5", fontSize: "13px" }}>
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
                                    top:"0.22cm",
                                    padding: "0.25cm",
                                     transform: `scale(${isCombinedPrint ? 1 : printScale})`,
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
                                        left: "0.3cm",
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
                                        left: "2.1cm",
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
                                        bottom: "2.55cm",
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