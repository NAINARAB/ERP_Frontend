import { useEffect, useState } from "react";
import { paymentGeneralInfoInitialValue } from "./variable";
import { Button, Card, CardContent } from '@mui/material';
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { checkIsNumber, isEqualNumber, ISOString, isValidObject, stringCompare, toArray } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import RequiredStar from '../../../Components/requiredStar';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from "react-router-dom";

const AddPaymentMaster = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const editValues = location.state;

    const [paymentValue, setPaymentValue] = useState(paymentGeneralInfoInitialValue);
    const [baseData, setBaseData] = useState({
        retailers: [],
        voucherType: [],
        debit_ledger: [],
        creditLedgers: [
            { value: 1, label: 'CashBox 1' },
            { value: 2, label: 'CashBox 2' },
            { value: 3, label: 'CashBox 3' }
        ],
    });

    useEffect(() => {
        if (
            isValidObject(editValues)
        ) {
            setPaymentValue(
                Object.fromEntries(
                    Object.entries(paymentGeneralInfoInitialValue).map(([key, value]) => {
                        if (key === 'payment_date') return [key, editValues[key] ? ISOString(editValues[key]) : value]
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
                    retailerResponse,
                    voucherTypeResponse,
                ] = await Promise.all([
                    fetchLink({ address: `masters/retailers/dropDown` }),
                    fetchLink({ address: `purchase/voucherType` }),
                ]);

                const retailersData = (retailerResponse.success ? retailerResponse.data : []).sort(
                    (a, b) => String(a?.Retailer_Name).localeCompare(b?.Retailer_Name)
                );
                const voucherType = (voucherTypeResponse.success ? voucherTypeResponse.data : []).sort(
                    (a, b) => String(a?.Voucher_Type).localeCompare(b?.Voucher_Type)
                );

                setBaseData((pre) => ({
                    ...pre,
                    retailers: retailersData,
                    voucherType: voucherType,
                }));

            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();

    }, [])

    const onChangePaymentValue = (key, value) => {
        if (key, value) {
            setPaymentValue(pre => ({ ...pre, [key]: value }))
        }
    }

    const clearValues = () => setPaymentValue(paymentGeneralInfoInitialValue);

    const savePayment = (postValues = {}) => {
        fetchLink({
            address: `payment/paymentMaster`,
            method: checkIsNumber(postValues?.pay_id) ? 'PUT' : 'POST',
            bodyData: postValues,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                clearValues();
                toast.success(data?.message || 'post successfully')
            } else {
                toast.error(data?.message || 'post failed')
            }
        }).catch(e => console.error(e))
    }

    return (
        <>
            <Card>

                <div className="p-2 px-3 d-flex align-items-center">
                    <h5 className="m-0 flex-grow-1">Payment Creation</h5>

                    <Button
                        type="button"
                        variant="outlined"
                        className="mx-1"
                        onClick={() => navigate('/erp/payments/paymentList')}
                    >back</Button>
                </div>

                <hr className="my-2" />

                <form onSubmit={e => {
                    e.preventDefault();
                    if (!checkIsNumber(paymentValue.debit_ledger) || !checkIsNumber(paymentValue.credit_ledger)) {
                        toast.warn('Select Debit-Acc / Credit-Acc!')
                    } else {
                        savePayment(paymentValue)
                    }
                }}>
                    <CardContent className="pb-0">
                        <div className="row p-2 pb-0">

                            {/* date */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Date<RequiredStar /></label>
                                <input
                                    type="date"
                                    required
                                    className="cus-inpt p-2"
                                    value={paymentValue.payment_date}
                                    onChange={e => onChangePaymentValue('payment_date', e.target.value)}
                                />
                            </div>

                            {/* bill type */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Bill Type</label>
                                <select
                                    className="cus-inpt p-2"
                                    value={paymentValue.pay_bill_type}
                                    onChange={e => onChangePaymentValue('pay_bill_type', e.target.value)}
                                    required
                                >
                                    <option value="" disabled>Select</option>
                                    <option value={'1'}>VENDOR - PURCHASE INVOICE</option>
                                    <option value={'2'}>EXPENCES / OTHERS</option>
                                    <option value={'3'}>EXPENCES - STOCK JOURNAL</option>
                                    <option value={'4'}>ON ACCOUNT</option>
                                </select>
                            </div>

                            {/* voucher type */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Voucher<RequiredStar /></label>
                                <select
                                    className="cus-inpt p-2"
                                    value={paymentValue.payment_voucher_type_id}
                                    onChange={e => onChangePaymentValue('payment_voucher_type_id', e.target.value)}
                                    required
                                    disabled={checkIsNumber(paymentValue.pay_id)}
                                >
                                    <option value="" disabled>Select</option>
                                    {toArray(baseData.voucherType).filter(
                                        fil => stringCompare(fil.Type, 'PAYMENT')
                                    ).map(
                                        (voucher, vouInd) => (
                                            <option value={voucher.Vocher_Type_Id} key={vouInd}>{voucher.Voucher_Type}</option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* Status */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Status</label>
                                <select
                                    className="cus-inpt p-2"
                                    value={paymentValue.status}
                                    onChange={e => onChangePaymentValue('status', e.target.value)}
                                >
                                    <option value="" disabled>Select</option>
                                    <option value="1">New</option>
                                    <option value="2">Progess</option>
                                    <option value="3">Completed</option>
                                    <option value="0">Canceled</option>
                                </select>
                            </div>

                            {/* debit account */}
                            <div className="col-md-4 col-sm-6 p-2">
                                <label>Debit Account<RequiredStar /></label>
                                <Select
                                    value={{
                                        value: paymentValue.debit_ledger,
                                        label: paymentValue.debit_ledger_name
                                    }}
                                    menuPortalTarget={document.body}
                                    onChange={e => {
                                        onChangePaymentValue('debit_ledger', e.value);
                                        onChangePaymentValue('debit_ledger_name', e.label);
                                    }}
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...toArray(baseData.retailers).map(
                                            retailer => ({
                                                value: retailer.Retailer_Id,
                                                label: retailer.Retailer_Name
                                            })
                                        )
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    required
                                    placeholder={"Select Product"}
                                />
                            </div>

                            {/* credit account */}
                            <div className="col-md-4 col-sm-6 p-2">
                                <label>Credit Account<RequiredStar /></label>
                                <Select
                                    value={{
                                        value: paymentValue.credit_ledger,
                                        label: paymentValue.credit_ledger_name
                                    }}
                                    menuPortalTarget={document.body}
                                    onChange={e => {
                                        onChangePaymentValue('credit_ledger', e.value);
                                        onChangePaymentValue('credit_ledger_name', e.label);
                                    }}
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...toArray(baseData.creditLedgers).map(
                                            creditAcc => ({ value: creditAcc.value, label: creditAcc.label })
                                        )
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    required
                                    placeholder={"Select Product"}
                                    maxMenuHeight={200}
                                />
                            </div>

                            {/* amount */}
                            <div className="col-md-4 col-sm-6 p-2">
                                <label>Amount<RequiredStar /></label>
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    className="cus-inpt p-2"
                                    value={paymentValue.debit_amount}
                                    onChange={e => onChangePaymentValue('debit_amount', e.target.value)}
                                />
                            </div>

                            {/* Narration */}
                            <div className="col-lg-8 col-md-10 col-12 p-2">
                                <label>Narration </label>
                                <textarea
                                    className="cus-inpt p-2"
                                    value={paymentValue.remarks}
                                    onChange={e => onChangePaymentValue('remarks', e.target.value)}
                                    rows={3}
                                />
                            </div>

                        </div>
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