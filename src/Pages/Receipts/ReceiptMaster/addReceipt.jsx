import { useEffect, useState } from "react";
import { receiptGeneralInfoInitialValue } from "./variable";
import { Button, Card, CardContent } from '@mui/material';
import { checkIsNumber, ISOString, isValidObject } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from "react-router-dom";
import ReceiptGeneralInfo from "./receiptGeneralInfo";


const AddPaymentMaster = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const editValues = location.state;

    const [receiptValue, setReceiptValue] = useState(receiptGeneralInfoInitialValue);

    const [baseData, setBaseData] = useState({
        accountsList: [],
        accountGroupData: [],
        voucherType: [],
    });

    useEffect(() => {
        if (
            isValidObject(editValues)
        ) {
            setReceiptValue(
                Object.fromEntries(
                    Object.entries(receiptGeneralInfoInitialValue).map(([key, value]) => {
                        if (key === 'receipt_date') return [key, editValues[key] ? ISOString(editValues[key]) : value]
                        if (key === 'check_date') return [key, editValues[key] ? ISOString(editValues[key]) : value]
                        if (key === 'bank_date') return [key, editValues[key] ? ISOString(editValues[key]) : value]
                        return [key, editValues[key] ?? value]
                    })
                )
            );
        }
    }, [editValues])

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [
                    accountsResponse,
                    accountsGroupResponse,
                    voucherTypeResponse,
                ] = await Promise.all([
                    fetchLink({ address: `payment/accounts` }),
                    fetchLink({ address: `payment/accountGroup` }),
                    fetchLink({ address: `purchase/voucherType` }),
                ]);

                const accountsList = (accountsResponse.success ? accountsResponse.data : []).sort(
                    (a, b) => String(a?.Account_name).localeCompare(b?.Account_name)
                );
                const accountGroupData = (accountsGroupResponse.success ? accountsGroupResponse.data : []).sort(
                    (a, b) => String(a?.Group_Name).localeCompare(b?.Group_Name)
                );
                const voucherType = (voucherTypeResponse.success ? voucherTypeResponse.data : []).sort(
                    (a, b) => String(a?.Voucher_Type).localeCompare(b?.Voucher_Type)
                );

                setBaseData((pre) => ({
                    ...pre,
                    accountsList: accountsList,
                    accountGroupData: accountGroupData,
                    voucherType: voucherType,
                }));

            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();

    }, [])

    const clearValues = () => {
        setReceiptValue(receiptGeneralInfoInitialValue);
    };

    const saveReceipt = (postValues = {}) => {
        fetchLink({
            address: `receipt/receiptMaster`,
            method: checkIsNumber(postValues?.receipt_id) ? 'PUT' : 'POST',
            bodyData: postValues,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                clearValues();
                toast.success(data?.message || 'post successfully');

                // if (
                //     data.data[0]
                //     && isValidObject(data.data[0])
                //     && (
                //         isEqualNumber(data?.data[0]?.receipt_bill_type, 1)
                //         || isEqualNumber(data?.data[0]?.receipt_bill_type, 3)
                //     )
                // ) {
                //     navigate('/erp/payments/paymentList/addReference', {
                //         state: data.data[0]
                //     })
                // } else {
                //     navigate('/erp/payments/paymentList')
                // }

            } else {
                toast.error(data?.message || 'post failed')
            }
        }).catch(e => console.error(e))
    }

    return (
        <>
            <Card>

                <form onSubmit={e => {
                    e.preventDefault();
                    if (!checkIsNumber(receiptValue.debit_ledger) || !checkIsNumber(receiptValue.credit_ledger)) {
                        toast.warn('Select Debit-Acc / Credit-Acc!')
                    } else if (receiptValue.credit_amount < 1 || !receiptValue.credit_amount) {
                        toast.warn('Enter valid amount!')
                    } else {
                        saveReceipt(receiptValue)
                    }
                }}>

                    <div className="p-2 px-3 d-flex align-items-center">
                        <h5 className="m-0 flex-grow-1">Receipt Creation</h5>

                        <Button
                            type="button"
                            variant="outlined"
                            className="mx-1"
                            onClick={() => navigate('/erp/receipts/listReceipts')}
                        >back</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            className="mx-1"
                        >Save</Button>
                    </div>

                    <hr className="my-2" />


                    <CardContent className="pb-0">

                        <ReceiptGeneralInfo
                            receiptValue={receiptValue}
                            setReceiptValue={setReceiptValue}
                            accountGroupData={baseData.accountGroupData}
                            accountsList={baseData.accountsList}
                            voucherType={baseData.voucherType}
                        />

                    </CardContent>

                    <hr className="my-2" />

                    <div className="d-flex justify-content-end p-2">
                        <Button
                            type="button"
                            variant="outlined"
                            onClick={clearValues}
                            className="mx-1"
                        >Clear</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            className="mx-1"
                        >Save</Button>
                    </div>

                </form>
            </Card>

        </>
    )
}

export default AddPaymentMaster;