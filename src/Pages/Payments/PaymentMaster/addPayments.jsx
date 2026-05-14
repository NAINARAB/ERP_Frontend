import { useEffect, useMemo, useState } from "react";
import { paymentGeneralInfoInitialValue, paymentStaffInvolvedStaffInitialValue, paymentTypes } from "./variable";
import { Button, Card, CardContent } from '@mui/material';
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { checkIsNumber, isEqualNumber, ISOString, isValidObject, stringCompare, toArray, toNumber, storageValue, getSessionUser, isArray, reactSelectFilterLogic } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import RequiredStar from '../../../Components/requiredStar';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from "react-router-dom";
import { transactionTypes } from "../../Receipts/ReceiptMaster/variable";
import InvolvedStaffs from "./staffInvolved";


const initialSelectValue = { value: '', label: '' };

const AddPaymentMaster = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const editValues = location.state;
    const storage = getSessionUser().user;

    const [paymentValue, setPaymentValue] = useState(paymentGeneralInfoInitialValue);
    const [paymentBillDetails, setPaymentBillDetails] = useState([]);
    const [paymentStaffInvolved, setPaymentStaffInvolved] = useState([]);

    const [baseData, setBaseData] = useState({
        accountsList: [],
        accountGroupData: [],
        voucherType: [],
        debit_ledger: [],
        defaultBankMaster: [],
        creditLedgers: [],
        costCategory: [],
        costCenter: [],
        users: []
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

            setPaymentStaffInvolved(
                editValues.staffDetails.map(staffDetails => ({
                    ...paymentStaffInvolvedStaffInitialValue,
                    ...staffDetails,
                }))
            )

            if (isArray(editValues?.BillsDetails) && editValues?.BillsDetails?.length > 0) {
                setPaymentBillDetails(editValues?.BillsDetails);
            }
        }
    }, [editValues])

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [
                    accountsResponse,
                    accountsGroupResponse,
                    voucherTypeResponse,
                    defaultBankMaster,
                    costCenterRes,
                    costCategoryRes,
                    usersRes
                ] = await Promise.all([
                    fetchLink({ address: `payment/accounts` }),
                    fetchLink({ address: `payment/accountGroup` }),
                    fetchLink({ address: `masters/voucher?module=PAYMENT` }),
                    fetchLink({ address: `masters/defaultBanks` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                    fetchLink({ address: `masters/user/dropDown` }),
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
                const bankDetails = (defaultBankMaster.success ? defaultBankMaster.data : []);
                const userDetails = (usersRes.success ? usersRes.data : []).map(userDet => ({
                    ...userDet, value: userDet.UserId, label: userDet.Name
                }));

                const costCategory = (costCategoryRes.success ? costCategoryRes.data : [])
                    .sort((a, b) => String(a?.Cost_Center_Name).localeCompare(b?.Cost_Center_Name));
                const costCenter = (costCenterRes.success ? costCenterRes.data : [])
                    .sort((a, b) => String(a?.Cost_Category).localeCompare(b?.Cost_Category));

                setBaseData((pre) => ({
                    ...pre,
                    accountsList: accountsList,
                    accountGroupData: accountGroupData,
                    voucherType: voucherType,
                    defaultBankMaster: bankDetails,
                    costCategory: costCategory,
                    costCenter: costCenter,
                    users: userDetails
                }));

            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();

    }, [])

    const createrOrModifier = useMemo(() => toNumber(storage?.UserId) || '', [storage]);

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

    const clearValues = () => {
        setPaymentValue(paymentGeneralInfoInitialValue);
        setPaymentStaffInvolved([]);
    };

    const savePayment = (postValues = {}) => {
        fetchLink({
            address: `payment/paymentMaster`,
            method: checkIsNumber(postValues?.pay_id) ? 'PUT' : 'POST',
            bodyData: {
                ...postValues,
                approved_by: Number(paymentValue?.approved_by) || null,
                cost_center_mapping: Number(paymentValue?.cost_center_mapping) || 0,
                created_by: createrOrModifier,
                altered_by: createrOrModifier,
                BillsDetails: paymentBillDetails,
                staffDetails: paymentStaffInvolved
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
                    } else if (checkIsNumber(paymentValue.pay_id) && stringCompare(paymentValue.Alter_Reason, '')) {
                        toast.error('Enter Alter Reason')
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

                        <>
                            <div className="row p-0">

                                <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                                    <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                                        <InvolvedStaffs
                                            staffArray={paymentStaffInvolved}
                                            setStaffArray={setPaymentStaffInvolved}
                                            costCenter={baseData.costCenter}
                                            costCategory={baseData.costCategory}
                                            initialValue={paymentStaffInvolvedStaffInitialValue}
                                        />
                                    </div>
                                </div>

                                <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                                    <div className="border px-3 py-1" style={{ minHeight: '30vh', height: '100%' }}>
                                        <div className="row">
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
                                                    // required
                                                    disabled={checkIsNumber(paymentValue.pay_id)}
                                                >
                                                    <option value={null}>Select</option>
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

                                            {checkIsNumber(paymentValue.pay_id) && (
                                                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                                    <label className='fa-13'>Alter Reason <RequiredStar /></label>
                                                    <input
                                                        value={paymentValue.Alter_Reason}
                                                        className="cus-inpt p-2"
                                                        onChange={e => onChangePaymentValue('Alter_Reason', e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            )}

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

                                            {/* transaction type */}
                                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                                <label>Transaction Type</label>
                                                <select
                                                    value={paymentValue.transaction_type || ''}
                                                    onChange={e => onChangePaymentValue('transaction_type', e.target.value)}
                                                    className="cus-inpt p-2"
                                                    required
                                                >
                                                    {transactionTypes.map((type, ind) => (
                                                        <option value={type.value} key={ind}>{type.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* approved by */}
                                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                                <label>Approved By</label>
                                                <Select
                                                    value={{ label: paymentValue?.approved_by_get, value: paymentValue?.approved_by }}
                                                    options={[{ value: null, label: 'Select' }, ...baseData.users]}
                                                    menuPortalTarget={document.body}
                                                    onChange={e => {
                                                        onChangePaymentValue('approved_by_get', e.label);
                                                        onChangePaymentValue('approved_by', e.value);
                                                    }}
                                                    styles={customSelectStyles}
                                                    isSearchable={true}
                                                    filterOption={reactSelectFilterLogic}
                                                >
                                                    <option value={null}>Select</option>
                                                    {baseData.users.map((s, i) => (
                                                        <option value={s.value} key={i}>{s.label}</option>
                                                    ))}
                                                </Select>
                                            </div>

                                            {/* cost center mapping */}
                                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                                <label>Cost Center Mapping</label>
                                                <select
                                                    className="cus-inpt p-2"
                                                    value={paymentValue.cost_center_mapping || 0}
                                                    onChange={e => onChangePaymentValue('cost_center_mapping', e.target.value)}
                                                >
                                                    <option value={1}>Yes</option>
                                                    <option value={0}>No</option>
                                                </select>
                                            </div>

                                            <div className="col-lg-3 col-md-4 col-sm-6 p-2 d-flex align-items-end">
                                                <input
                                                    className="form-check-input shadow-none pointer mx-2"
                                                    style={{ padding: '0.7em' }}
                                                    type="checkbox"
                                                    id="isNewRef"
                                                    checked={isEqualNumber(paymentValue?.is_new_ref, 1)}
                                                    onChange={() => {
                                                        if (isEqualNumber(paymentValue?.is_new_ref, 1))
                                                            onChangePaymentValue('is_new_ref', 0)
                                                        else
                                                            onChangePaymentValue('is_new_ref', 1)
                                                    }}
                                                />
                                                <label htmlFor="isNewRef" className="fw-bold">is New-Ref?</label>
                                            </div>

                                            <div className="col-12"></div>

                                            {/* Narration */}
                                            <div className="col-sm-8 p-2">
                                                <label>Narration </label>
                                                <textarea
                                                    className="cus-inpt p-2"
                                                    value={paymentValue.remarks}
                                                    onChange={e => onChangePaymentValue('remarks', e.target.value)}
                                                    rows={3}
                                                />
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>

                        <div className="row p-2 pb-0">

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
                                    filterOption={reactSelectFilterLogic}
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
                                    filterOption={reactSelectFilterLogic}
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
                                    filterOption={reactSelectFilterLogic}
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
                                    filterOption={reactSelectFilterLogic}
                                />
                            </div>

                            <div className="col-12">
                                <hr className=" text-dark" />
                            </div>

                            {/* bank name */}
                            <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Bank Name</label>
                                <Select
                                    value={{ value: paymentValue.bank_name, label: paymentValue.bank_name }}
                                    menuPortalTarget={document.body}
                                    onChange={e => onChangePaymentValue('bank_name', e.value)}
                                    options={[
                                        { value: '', label: 'Select' },
                                        ...toArray(baseData.defaultBankMaster).map(bank => ({
                                            value: bank.label,
                                            label: bank.label
                                        }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    filterOption={reactSelectFilterLogic}
                                />
                            </div>

                            {/* bank date */}
                            <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Bank Date</label>
                                <input
                                    value={paymentValue.bank_date}
                                    type="date"
                                    className="cus-inpt p-2"
                                    onChange={e => onChangePaymentValue('bank_date', e.target.value)}
                                />
                            </div>

                            {/* <div className="col-12"></div> */}

                            {/* Cheque no */}
                            <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Cheque No</label>
                                <input
                                    value={paymentValue.check_no}
                                    className="cus-inpt p-2"
                                    onChange={e => onChangePaymentValue('check_no', e.target.value)}
                                />
                            </div>

                            {/* Cheque date */}
                            <div className="col-xxl-2 col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Cheque Date</label>
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
            </Card >

        </>
    )
}

export default AddPaymentMaster;