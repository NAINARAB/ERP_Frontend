import { useEffect, useState } from "react";
import { paymentGeneralInfoInitialValue, paymentTypes } from "./variable";
import { Button, Card, CardContent } from '@mui/material';
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { checkIsNumber, isEqualNumber, ISOString, isValidObject, stringCompare, toArray, toNumber, storageValue } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import RequiredStar from '../../../Components/requiredStar';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from "react-router-dom";


const initialSelectValue = { value: '', label: '' };

const AddPaymentMaster = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const editValues = location.state;

    const [paymentValue, setPaymentValue] = useState(paymentGeneralInfoInitialValue);
    const [baseData, setBaseData] = useState({
        accountsList: [],
        accountGroupData: [],
        voucherType: [],
        debit_ledger: [],
        creditLedgers: [
            { value: 1, label: 'CashBox 1' },
            { value: 2, label: 'CashBox 2' },
            { value: 3, label: 'CashBox 3' }
        ],
    });

    // to filter group, account

    const [selectedDebitGroup, setSelectedDebitGroup] = useState(initialSelectValue);
    const [selectedCreditGroup, setSelectedCreditGroup] = useState(initialSelectValue);
    const [filteredDebitAccounts, setFilteredDebitAccounts] = useState([]);
    const [filteredCreditAccounts, setFilteredCreditAccounts] = useState([]);

    useEffect(() => {
        if (
            isValidObject(editValues)
        ) {
            setPaymentValue(
                Object.fromEntries(
                    Object.entries(paymentGeneralInfoInitialValue).map(([key, value]) => {
                        if (key === 'payment_date') return [key, editValues[key] ? ISOString(editValues[key]) : value]
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

    const onChangePaymentValue = (key, value) => {
        setPaymentValue(pre => ({ ...pre, [key]: value }));
    }

    // recursive function to get all child group ids
    function getAllChildGroupIds(groupId, groupList, visited = new Set()) {
        // Prevent circular recursion
        if (visited.has(groupId)) return [];

        visited.add(groupId);
        let result = [groupId]; // include current group

        const children = groupList.filter(group => group.Parent_AC_id === groupId);

        for (const child of children) {
            result = result.concat(getAllChildGroupIds(child.Group_Id, groupList, visited));
        }

        return result;
    }

    function filterAccountsByGroupIds(selectedGroupId, accountGroups, accountsList) {
        const validGroupIds = getAllChildGroupIds(selectedGroupId, accountGroups);
        return accountsList.filter(account => validGroupIds.includes(account.Group_Id));
    }

    const handleGroupSelect = (groupId, groupValue, type) => {
        const filtered = filterAccountsByGroupIds(groupId, baseData.accountGroupData, baseData.accountsList);

        if (type === 'debit') {
            setSelectedDebitGroup({ value: groupId, label: groupValue });
            setFilteredDebitAccounts(filtered);
        } else {
            setSelectedCreditGroup({ value: groupId, label: groupValue });
            setFilteredCreditAccounts(filtered);
        }
    };

    const clearValues = () => setPaymentValue(paymentGeneralInfoInitialValue);

    const savePayment = (postValues = {}) => {
        fetchLink({
            address: `payment/paymentMaster`,
            method: checkIsNumber(postValues?.pay_id) ? 'PUT' : 'POST',
            bodyData: {
                ...postValues,
                created_by: checkIsNumber(storageValue?.UserId) ? storageValue?.UserId : '',
                altered_by: checkIsNumber(storageValue?.UserId) ? storageValue?.UserId : '',
            },
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                clearValues();
                toast.success(data?.message || 'post successfully');

                if (
                    data.data[0]
                    && isValidObject(data.data[0])
                    && (
                        isEqualNumber(data?.data[0]?.pay_bill_type, 1)
                        || isEqualNumber(data?.data[0]?.pay_bill_type, 3)
                    )
                ) {
                    navigate('/erp/payments/paymentList/addReference', {
                        state: data.data[0]
                    })
                } else {
                    navigate('/erp/payments/paymentList')
                }

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
                    if (!checkIsNumber(paymentValue.debit_ledger) || !checkIsNumber(paymentValue.credit_ledger)) {
                        toast.warn('Select Debit-Acc / Credit-Acc!')
                    } else if (paymentValue.debit_amount < 1 || !paymentValue.debit_amount) {
                        toast.warn('Enter valid amount!')
                    } else {
                        savePayment(paymentValue)
                    }
                }}>

                    <div className="p-2 px-3 d-flex align-items-center">
                        <h5 className="m-0 flex-grow-1">Payment Creation</h5>

                        <Button
                            type="button"
                            variant="outlined"
                            className="mx-1"
                            onClick={() => navigate('/erp/payments/paymentList')}
                        >back</Button>
                        <Button
                            type="submit"
                            variant="contained"
                            className="mx-1"
                        >Save</Button>
                    </div>

                    <hr className="my-2" />


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
                                <label>Bill Type<RequiredStar /></label>
                                <select
                                    className="cus-inpt p-2"
                                    value={paymentValue.pay_bill_type}
                                    onChange={e => onChangePaymentValue('pay_bill_type', toNumber(e.target.value))}
                                    required
                                    disabled={checkIsNumber(paymentValue.pay_id)}
                                >
                                    <option value="" disabled>Select</option>
                                    {paymentTypes.map(
                                        (type, ind) => <option value={type.value} key={ind}>{type.label}</option>
                                    )}
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

                            {/* amount */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Amount<RequiredStar /></label>
                                <input
                                    type="number"
                                    required
                                    className="cus-inpt p-2"
                                    value={paymentValue.debit_amount || ''}
                                    onChange={e => onChangePaymentValue('debit_amount', e.target.value)}
                                />
                            </div>

                            {/* Narration */}
                            <div className="col-sm-6 p-2">
                                <label>Narration </label>
                                <textarea
                                    className="cus-inpt p-2"
                                    value={paymentValue.remarks}
                                    onChange={e => onChangePaymentValue('remarks', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="col-12">
                                <hr className=" text-dark" />
                            </div>

                            {/* credit group */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Credit Group</label>
                                <Select
                                    value={selectedCreditGroup}
                                    options={[
                                        { value: '', label: 'select' },
                                        ...baseData.accountGroupData.map(group => ({
                                            value: group.Group_Id,
                                            label: group.Group_Name
                                        }))
                                    ]}
                                    onChange={e => handleGroupSelect(e.value, e.label, 'credit')}
                                    menuPortalTarget={document.body}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                />
                            </div>

                            {/* credit account */}
                            <div className="col-lg-5 col-md-6 col-sm-6 p-2">
                                <label>Credit Account<RequiredStar /></label>
                                <Select
                                    value={{
                                        value: paymentValue.credit_ledger,
                                        label: paymentValue.credit_ledger_name
                                    }}
                                    menuPortalTarget={document.body}
                                    // onChange={e => {
                                    //     onChangePaymentValue('credit_ledger', e.value);
                                    //     onChangePaymentValue('credit_ledger_name', e.label);
                                    // }}
                                    // options={[
                                    //     { value: '', label: 'select', isDisabled: true },
                                    //     ...toArray(baseData.accountsList).map(
                                    //         account => ({
                                    //             value: account.Acc_Id,
                                    //             label: account.Account_name
                                    //         })
                                    //     )
                                    // ]}
                                    onChange={e => {
                                        onChangePaymentValue('credit_ledger', e.value);
                                        onChangePaymentValue('credit_ledger_name', e.label);
                                    }}
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...(!checkIsNumber(selectedCreditGroup.value)
                                            ? toArray(baseData.accountsList).map(
                                                account => ({
                                                    value: account.Acc_Id,
                                                    label: account.Account_name
                                                })
                                            )
                                            : filteredCreditAccounts.map(account => ({
                                                value: account.Acc_Id,
                                                label: account.Account_name
                                            }))
                                        )
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    required
                                    placeholder={"Select Product"}
                                />
                            </div>

                            <div className="col-12"></div>

                            {/* debit group */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Debit Group</label>
                                <Select
                                    value={selectedDebitGroup}
                                    options={[
                                        { value: '', label: 'select' },
                                        ...baseData.accountGroupData.map(group => ({
                                            value: group.Group_Id,
                                            label: group.Group_Name
                                        }))
                                    ]}
                                    menuPortalTarget={document.body}
                                    onChange={e => handleGroupSelect(e.value, e.label, 'debit')}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                />
                            </div>

                            {/* debit account */}
                            <div className="col-lg-5 col-md-6 col-sm-6 p-2">
                                <label>Debit Account<RequiredStar /></label>
                                <Select
                                    value={{
                                        value: paymentValue.debit_ledger,
                                        label: paymentValue.debit_ledger_name
                                    }}
                                    menuPortalTarget={document.body}
                                    // onChange={e => {
                                    //     onChangePaymentValue('debit_ledger', e.value);
                                    //     onChangePaymentValue('debit_ledger_name', e.label);
                                    // }}
                                    // options={[
                                    //     { value: '', label: 'select', isDisabled: true },
                                    //     ...toArray(baseData.accountsList).map(
                                    //         account => ({
                                    //             value: account.Acc_Id,
                                    //             label: account.Account_name
                                    //         })
                                    //     )
                                    // ]}
                                    onChange={e => {
                                        onChangePaymentValue('debit_ledger', e.value);
                                        onChangePaymentValue('debit_ledger_name', e.label);
                                    }}
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...(!checkIsNumber(selectedDebitGroup.value)
                                            ? toArray(baseData.accountsList).map(
                                                account => ({
                                                    value: account.Acc_Id,
                                                    label: account.Account_name
                                                })
                                            )
                                            : filteredDebitAccounts.map(account => ({
                                                value: account.Acc_Id,
                                                label: account.Account_name
                                            }))
                                        )
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    required
                                    placeholder={"Select Product"}
                                />
                            </div>

                            <div className="col-12">
                                <hr className=" text-dark" />
                            </div>

                            {/* bank name */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Bank Name</label>
                                <input
                                    value={paymentValue.bank_name}
                                    className="cus-inpt p-2"
                                    onChange={e => onChangePaymentValue('bank_name', e.target.value)}
                                />
                            </div>

                            {/* bank date */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Bank Date</label>
                                <input
                                    value={paymentValue.bank_date}
                                    type="date"
                                    className="cus-inpt p-2"
                                    onChange={e => onChangePaymentValue('bank_date', e.target.value)}
                                />
                            </div>

                            <div className="col-12"></div>

                            {/* check no */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Check No</label>
                                <input
                                    value={paymentValue.check_no}
                                    className="cus-inpt p-2"
                                    onChange={e => onChangePaymentValue('check_no', e.target.value)}
                                />
                            </div>

                            {/* Check date */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Check Date</label>
                                <input
                                    value={paymentValue.check_date}
                                    type="date"
                                    className="cus-inpt p-2"
                                    onChange={e => onChangePaymentValue('check_date', e.target.value)}
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