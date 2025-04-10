import { Button, Card, CardContent, CardHeader } from "@mui/material"
import { HideSource, List } from '@mui/icons-material'
import { Addition, checkIsNumber, isEqualNumber, isValidObject, LocalDate, NumberFormat, onlynum, toNumber } from "../../../Components/functions";
import { receiptDetailsInfo } from "./variable";
import { useMemo, useState } from "react";
import RequiredStar from "../../../Components/requiredStar";


const DeliveryBillTableRow = ({ row = {}, receiptsPaymentInfo = [], setReceiptsPaymentInfo, Sno }) => {

    const [previousReceipts, setPreviousReceipts] = useState(false);
    const [showBill, setShowBill] = useState(false);

    const billDetails = useMemo(() => {
        const obj = receiptsPaymentInfo.find(
            bills => isEqualNumber(bills?.bill_id, row?.Do_Id)
        );

        return isValidObject(obj) ? obj : {};
    }, [receiptsPaymentInfo, row]);

    const billIndex = useMemo(() => {
        return receiptsPaymentInfo.findIndex(
            bills => isEqualNumber(bills?.bill_id, row?.Do_Id)
        )
    }, [receiptsPaymentInfo, row]);

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

    const total_collected_amount = useMemo(() => {
        return Array.isArray(row?.Payments) ? row?.Payments?.reduce(
            (acc, receipt) => Addition(acc, receipt.collected_amount)
            , 0) : 0
    }, [row])

    const isChecked = checkIsNumber(billDetails?.bill_id);

    return (
        <>
            <tr>
                <td className="border">{Sno}</td>
                <td className="border">
                    {(() => {

                        return (
                            <div>
                                <input
                                    className="form-check-input shadow-none pointer"
                                    style={{ padding: '0.7em' }}
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                        if (isChecked) setReceiptsPaymentInfo(
                                            pre => pre.filter(rec => !isEqualNumber(rec.bill_id, row?.Do_Id))
                                        );
                                        else onChangeValues('bill_amount', toNumber(row?.Total_Invoice_value));
                                    }}
                                />
                            </div>
                        )
                    })()}
                </td>
                <td className="border">{row?.Do_Inv_No}</td>
                <td className="border">{LocalDate(row?.Do_Date)}</td>
                <td className="border">{toNumber(row?.Total_Invoice_value)}</td>
                <td className="border">{total_collected_amount}</td>
                <td className="border">{row?.pendingAmount}</td>
                <td className="border">{toNumber(row?.Payments?.length)}</td>
            </tr>

            <tr>
                <td colSpan={8}>
                    <div className="d-flex align-items-end flex-wrap">
                        <div className="flex-grow-1">
                            <label className="fa-14 w-100">Receipt Amount (₹){isChecked && <RequiredStar />}</label>
                            <input
                                onInput={onlynum}
                                disabled={!isChecked}
                                value={billDetails?.collected_amount ? toNumber(billDetails?.collected_amount) : ''}
                                onChange={e => onChangeValues('collected_amount', e.target.value)}
                                style={{ width: '100%', maxWidth: '350px' }}
                                className="cus-inpt border p-2"
                                placeholder="Enter Receipt Amount"
                                max={toNumber(row?.pendingAmount)}
                                required={isChecked}
                            />
                        </div>

                        <Button
                            startIcon={showBill ? <HideSource /> : <List />}
                            onClick={() => setShowBill(pre => !pre)}
                        >{showBill ? 'Hide' : 'Show'} Invoice</Button>
                        <Button
                            startIcon={previousReceipts ? <HideSource /> : <List />}
                            onClick={() => setPreviousReceipts(pre => !pre)}
                            disabled={!Array.isArray(row?.Payments) || toNumber(row?.Payments?.length) === 0}
                        >{previousReceipts ? 'Hide' : 'Previous'} Receipts</Button>
                    </div>
                </td>
            </tr>

            {showBill && (
                <>
                    <tr>
                        <td colSpan={8}>Bill Details of - {row?.Do_Inv_No}</td>
                    </tr>
                    <tr>
                        <td colSpan={8} className="p-0">
                            <div className="table-responsive fa-13 m-0">
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
                        </td>
                    </tr>
                </>
            )}

            {previousReceipts && (
                <>
                    <tr>
                        <td colSpan={8}>Previous Receipts of - {row?.Do_Inv_No}</td>
                    </tr>
                    <tr>
                        <td colSpan={8} className="p-0 border-0">
                            <div className="table-responsive fa-13">
                                <table className="table m-0">
                                    <thead>
                                        <tr>
                                            {['SNo', 'Collected By', 'Amount', 'Date', 'Receipt Type', 'payment_status', 'Verify Status'].map(
                                                (col, colInd) => <th key={colInd} className="bg-light border">{col}</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(Array.isArray(row?.Payments) ? row?.Payments : [])?.filter(
                                            fil => !isEqualNumber(fil.auto_id, row?.auto_id)
                                        ).map((pay, payInd) => (
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
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={8} className="border-0"></td>
                    </tr>
                </>
            )}

        </>
    )
}

export default DeliveryBillTableRow;