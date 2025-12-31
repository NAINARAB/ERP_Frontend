import { useEffect, useRef, useState } from "react";
import { fetchLink } from "../../../../Components/fetchComponent";
import { useReactToPrint } from 'react-to-print';
import { checkIsNumber, LocalDateWithTime, toArray } from "../../../../Components/functions";
import { Print } from "@mui/icons-material";
import { Button } from "@mui/material";

const findStaffName = (arr, involvedType) => {
    if (!Array.isArray(arr)) return "";
    const row = arr.find(
        (x) => String(x?.empType || "").toLowerCase() === String(involvedType).toLowerCase()
    );
    return row?.empName || "";
};

const KatchathCopy = ({ Do_Id, loadingOn, loadingOff }) => {
    const [data, setData] = useState({});
    const printRef = useRef(null);


    useEffect(() => {
        if (!checkIsNumber(Do_Id)) return;
        fetchLink({
            address: `sales/salesInvoice/printOuts/katchath?Do_Id=${Do_Id}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setData(data?.data[0] || {})
            }
        }).catch(e => console.error(e));
    }, [Do_Id]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    return (
        <div className="d-flex flex-column align-items-center justify-content-center">
            <Button onClick={handlePrint} startIcon={<Print />}>Print</Button>
            <div
                style={{ height: '10.5cm', width: '16cm' }}
                ref={printRef}
                className="border py-2 px-4"
            >
                <div className="row">

                    <div className="col-5 p-2">
                        <h5 className="m-0">{data.voucherTypeGet}</h5>
                        <p className="m-0">{data.createdByGet}</p>
                        <p className="m-0">{LocalDateWithTime(data.createdOn)}</p>
                        <br />
                        <p className="m-0">{data.mailingName ? `${data.mailingName},` : " "}</p>
                        <p className="m-0">{data.mailingAddress ? `${data.mailingAddress},` : " "}</p>
                        <p className="m-0">{data.mailingCity ? `${data.mailingCity},` : " "}</p>
                        <p className="m-0">{data.mailingNumber ? data.mailingNumber : " "}</p>
                    </div>

                    <div className="col-7 p-2">
                        <div className="table-responsive">
                            <table className="table table-borderless">
                                <tbody>
                                    {toArray(data.productDetails).map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.itemName}</td>
                                            <td>{item.quantity}</td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td className="border">Total</td>
                                        <td className="border">{toArray(data.productDetails).reduce((acc, item) => acc + item.quantity, 0)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                <br />

                <div>
                    <p className="m-0">Lorry: {findStaffName(data.staffDetails, "Transport")}</p>
                    <p className="m-0">LoadMan: {findStaffName(data.staffDetails, "Load Man")}</p>
                </div>
            </div>
        </div>
    );
};

export default KatchathCopy;