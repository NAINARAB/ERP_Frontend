import { Card, CardContent, CardHeader } from "@mui/material"
import { Addition, isEqualNumber, isValidObject, LocalDate, NumberFormat, onlynum, toNumber } from "../../../Components/functions";
import { receiptDetailsInfo } from "./variable";
import { useMemo } from "react";


const payTypeAndStatus = [
    {
        type: 'CASH',
        typeStatus: 'CREATED-CASH'
    },
    {
        type: 'UPI',
        typeStatus: 'CREATED-UPI'
    },
    {
        type: 'CHECK',
        typeStatus: 'CREATED-CHECK'
    },
    {
        type: 'BANK ACCOUNT',
        typeStatus: 'CREATED-BANK-TRANSFER'
    },
];

const DeliveryBillCard = ({ loadingOn, loadingOff, row = {}, receiptsPaymentInfo = [], setReceiptsPaymentInfo, collection_type }) => {

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
        const paymentStatus = collection_type ? payTypeAndStatus.find(val => val.type === collection_type)?.typeStatus : '';
        setReceiptsPaymentInfo(pre => {
            const newValue = [...pre];

            if (billIndex === -1) {
                const billDetails = { ...receiptDetailsInfo };
                billDetails.bill_id = row?.Do_Id;
                billDetails.bill_amount = toNumber(row?.Total_Invoice_value);
                billDetails.payment_status = paymentStatus; 
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

                <CardContent>

                    <div className="table-responsive table-bordered fa-13 m-0">
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

                    <div className="row p-2">

                        <div className="col-lg-3 col-md-4 col-sm-6 p-1">
                            <label className="fa-14">Payment Status</label>
                            <select
                                value={billDetails?.payment_status ? billDetails?.payment_status : ''}
                                onChange={e => onChangeValues('payment_status', e.target.value)}
                                className="cus-inpt border p-2"
                            >
                                <option value={''}>select</option>
                                <optgroup label="CASH">
                                    <option value={'CREATED-CASH'}>CREATED-CASH</option>
                                    <option value={'CASH-PROCESSING'}>CASH-PROCESSING</option>
                                    <option value={'CASH-MISSING'}>CASH-MISSING</option>
                                </optgroup>
                                <optgroup label="CHECK">
                                    <option value={'CREATED-CHECK'}>CREATED-CHECK</option>
                                    <option value={'CHECK-PROCESSING'}>CHECK-PROCESSING</option>
                                    <option value={'CHECK-BOUNCE'}>CHECK-BOUNCE</option>
                                </optgroup>
                                <optgroup label="UPI">
                                    <option value={'CREATED-UPI'}>CREATED-UPI</option>
                                    <option value={'UPI-PROCESSING'}>UPI-PROCESSING</option>
                                    <option value={'UPI-NOT-RECEIVED'}>UPI-NOT-RECEIVED</option>
                                </optgroup>
                                <optgroup label="BANK-TRANSFER">
                                    <option value={'CREATED-BANK-TRANSFER'}>CREATED-BANK-TRANSFER</option>
                                    <option value={'BANK-PROCESSING'}>BANK-PROCESSING</option>
                                    <option value={'BANK-NOT-RECEIVED'}>BANK-NOT-RECEIVED</option>
                                </optgroup>
                                <option value={'COMPLETED'}>COMPLETED</option>
                            </select>
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-6 p-1">
                            <label className="fa-14">Bank Date</label>
                            <input
                                type="date"
                                value={billDetails?.bank_date ? billDetails?.bank_date : ''}
                                onChange={e => onChangeValues('bank_date', e.target.value)}
                                className="cus-inpt border p-2"
                            />
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-6 p-1">
                            <label className="fa-14">Verify Status</label>
                            <select
                                value={billDetails?.verify_status}
                                onChange={e => onChangeValues('verify_status', e.target.value)}
                                className="cus-inpt border p-2"
                            >
                                <option value={0}>Not-verified</option>
                                <option value={1}>verified</option>
                            </select>
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-6 p-1">
                            <label className="fa-14">Receipt Amount (₹)</label>
                            <input
                                onInput={onlynum}
                                value={billDetails?.collected_amount ? toNumber(billDetails?.collected_amount) : ''}
                                onChange={e => onChangeValues('collected_amount', e.target.value)}
                                className="cus-inpt border p-2"
                                placeholder="Enter Receipt Amount"
                            />
                        </div>

                        <div className="col-12 p-1">
                            <label className="fa-14 w-100">Narration</label>
                            <textarea
                                style={{ width: '100%', maxWidth: '450px' }}
                                className="cus-inpt border p-2"
                                value={billDetails?.narration}
                                onChange={e => onChangeValues('narration', e.target.value)}
                                placeholder="Narration..."
                            />
                        </div>
                    </div>
                </CardContent>

            </Card>
        </>
    )
}

export default DeliveryBillCard;