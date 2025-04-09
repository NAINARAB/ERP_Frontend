import { Button, Card, CardContent, CardHeader } from "@mui/material"
import { HideSource, List } from '@mui/icons-material'
import { Addition, isEqualNumber, isValidObject, LocalDate, NumberFormat, onlynum, toNumber } from "../../../Components/functions";
import { receiptDetailsInfo } from "./variable";
import { useMemo, useState } from "react";


const DeliveryBillCard = ({ loadingOn, loadingOff, row = {}, receiptsPaymentInfo = [], setReceiptsPaymentInfo, collection_type }) => {

    const [previousReceipts, setPreviousReceipts] = useState(false);
    const [showBill, setShowBill] = useState(true);

    const billDetails = useMemo(() => {
        const obj = receiptsPaymentInfo.find(
            bills => isEqualNumber(bills?.bill_id, row?.Do_Id)
        );

        return isValidObject(obj) ? obj : {};
    }, [receiptsPaymentInfo]);

    const billIndex = useMemo(() => {
        return receiptsPaymentInfo.findIndex(
            bills => isEqualNumber(bills?.bill_id, row?.Do_Id)
        )
    }, [receiptsPaymentInfo]);

    const onChangeValues = (key, value) => {
        setReceiptsPaymentInfo(pre => {
            const newValue = [...pre];

            if (billIndex === -1) {
                const billDetails = { ...receiptDetailsInfo };
                billDetails.bill_id = row?.Do_Id;
                billDetails.bill_amount = toNumber(row?.Total_Invoice_value);
                billDetails[key] = value;

                return [...newValue, billDetails];
            } else {
                newValue[billIndex][key] = value;
                return newValue;
            }
        })
    }

    return (
        <>
            <Card className="my-2">
                <div className="px-3 py-2 d-flex align-items-center flex-wrap border-bottom">

                    <div className="flex-grow-1">
                        <h5 className="m-0 fa-16 w-100">{row?.Do_Inv_No}</h5>
                        <span className="fa-12 text-muted">{LocalDate(row?.Do_Date)}</span>
                    </div>
                    <div>
                        <h5 className="fa-15 w-100">Pending ₹{NumberFormat(toNumber(row?.PayableValue))}</h5>
                        <h5 className="m-0 fa-13 text-muted text-end w-100">Total ₹{NumberFormat(toNumber(row?.Total_Invoice_value))}</h5>
                        <h5 className="m-0 fa-13 text-muted text-end w-100">Tax ₹{NumberFormat(toNumber(row?.Total_Tax))}</h5>
                    </div>
                </div>

                <CardContent className="pb-2">
                    <div className="pb-2">
                        <div className="d-flex align-items-end justify-content-end ">
                            <div>
                                {/* <Button
                                    startIcon={showBill ? <HideSource /> : <List />}
                                    onClick={() => setShowBill(pre => !pre)}
                                >Show Invoice</Button> */}
                                <label className="fa-14 w-100">Receipt Amount (₹)</label>
                                <input
                                    onInput={onlynum}
                                    value={billDetails?.collected_amount ? toNumber(billDetails?.collected_amount) : ''}
                                    onChange={e => onChangeValues('collected_amount', e.target.value)}
                                    className="cus-inpt border p-2"
                                    placeholder="Enter Receipt Amount"
                                />
                            </div>
                        </div>

                        {showBill && (
                            <div className="table-responsive table-bordered fa-13 m-0 mt-2">
                                <table className="table m-0">
                                    <thead>
                                        <tr>
                                            {['SNo', 'Item', 'Quantity', 'Rate', 'Pack', 'Tax', 'Amount'].map((col, colInd) => (
                                                <th key={colInd} className="bg-light">{col}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(row?.Products_List) && (
                                            row.Products_List.map((item, ind) => (
                                                <tr key={ind}>
                                                    <td>{ind + 1}</td>
                                                    <td>{item?.Product_Name}</td>
                                                    <td>{item?.Bill_Qty}</td>
                                                    <td>{item?.Item_Rate}</td>
                                                    <td>{item?.UOM}</td>
                                                    <td>{Addition(item?.Cgst_Amo, item?.Sgst_Amo) || toNumber(item?.Igst_Amo)}</td>
                                                    <td>{item?.Amount}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <Button
                        startIcon={previousReceipts ? <HideSource /> : <List />}
                        onClick={() => setPreviousReceipts(pre => !pre)}
                        disabled={!Array.isArray(row?.Payments) || toNumber(row?.Payments?.length) === 0}
                    >Previous Receipts</Button>

                    {previousReceipts && (
                        <div className="table-responsive table-bordered fa-13 mt-2">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {['SNo', 'Collected By', 'Amount', 'Date', 'Receipt Type', 'payment_status', 'Verify Status'].map(
                                            (col, colInd) => <th key={colInd} className="bg-light border">{col}</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {(Array.isArray(row?.Payments) ? row?.Payments : [])?.map((pay, payInd) => (
                                        <tr key={payInd}>
                                            <td className="border">{payInd + 1}</td>
                                            <td className="border">{pay?.CreatedByGet}</td>
                                            <td className="border">{pay?.collected_amount}</td>
                                            <td className="border">{pay?.collection_date}</td>
                                            <td className="border">{pay?.collection_type}</td>
                                            <td className="border">{pay?.collection_type}</td>
                                            <td className="border">{pay?.verify_status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>

            </Card>
        </>
    )
}

export default DeliveryBillCard;