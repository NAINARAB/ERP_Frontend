import { useState } from "react";
import { checkIsNumber, stringCompare, toArray, toNumber } from "../../../Components/functions";
import RequiredStar from "../../../Components/requiredStar";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { receiptTypes } from "./variable";
import Select from "react-select";

const ReceiptGeneralInfo = ({
    receiptValue = {},
    setReceiptValue,
    initialSelectValue = { value: '', label: '' },
    accountGroupData = [],
    accountsList = [],
    voucherType = []
}) => {

    const [selectedDebitGroup, setSelectedDebitGroup] = useState(initialSelectValue);
    const [selectedCreditGroup, setSelectedCreditGroup] = useState(initialSelectValue);
    const [filteredDebitAccounts, setFilteredDebitAccounts] = useState([]);
    const [filteredCreditAccounts, setFilteredCreditAccounts] = useState([]);

    const onChangePaymentValue = (key, value) => {
        setReceiptValue(pre => ({ ...pre, [key]: value }));
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
        const filtered = filterAccountsByGroupIds(groupId, accountGroupData, accountsList);

        if (type === 'debit') {
            setSelectedDebitGroup({ value: groupId, label: groupValue });
            setFilteredDebitAccounts(filtered);
        } else {
            setSelectedCreditGroup({ value: groupId, label: groupValue });
            setFilteredCreditAccounts(filtered);
        }
    };

    return (
        <>

            <div className="row p-2 pb-0">

                <div className="col-12 p-2">
                    <h5 className=" border-start border-primary border-3 p-2 m-0">Receipt Info</h5>
                </div>

                {/* date */}
                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                    <label>Date<RequiredStar /></label>
                    <input
                        type="date"
                        required
                        className="cus-inpt p-2"
                        value={receiptValue.receipt_date}
                        onChange={e => onChangePaymentValue('receipt_date', e.target.value)}
                    />
                </div>

                {/* bill type */}
                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                    <label>Bill Type<RequiredStar /></label>
                    <select
                        className="cus-inpt p-2"
                        value={receiptValue.receipt_bill_type}
                        onChange={e => onChangePaymentValue('receipt_bill_type', toNumber(e.target.value))}
                        required
                        disabled={checkIsNumber(receiptValue.receipt_id)}
                    >
                        <option value="" disabled>Select</option>
                        {receiptTypes.map(
                            (type, ind) => <option value={type.value} key={ind}>{type.label}</option>
                        )}
                    </select>
                </div>

                {/* voucher type */}
                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                    <label>Voucher<RequiredStar /></label>
                    <select
                        className="cus-inpt p-2"
                        value={receiptValue.receipt_voucher_type_id}
                        onChange={e => onChangePaymentValue('receipt_voucher_type_id', e.target.value)}
                        required
                        disabled={checkIsNumber(receiptValue.receipt_id)}
                    >
                        <option value="" disabled>Select</option>
                        {toArray(voucherType).filter(
                            fil => stringCompare(fil.Type, 'RECEIPT')
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
                        value={receiptValue.status}
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
                        value={receiptValue.debit_amount || ''}
                        onChange={e => onChangePaymentValue('debit_amount', e.target.value)}
                    />
                </div>

                <div className="col-12">
                    <hr className=" text-dark" />
                </div>

                <div className="col-12 p-2">
                    <h5 className=" border-start border-primary border-3 p-2 m-0">Ledger Info</h5>
                </div>

                {/* debit group */}
                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                    <label>Debit Group</label>
                    <Select
                        value={selectedDebitGroup}
                        options={[
                            { value: '', label: 'select' },
                            ...accountGroupData.map(group => ({
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
                            value: receiptValue.debit_ledger,
                            label: receiptValue.debit_ledger_name
                        }}
                        menuPortalTarget={document.body}
                        onChange={e => {
                            onChangePaymentValue('debit_ledger', e.value);
                            onChangePaymentValue('debit_ledger_name', e.label);
                        }}
                        options={[
                            { value: '', label: 'select', isDisabled: true },
                            ...(!checkIsNumber(selectedDebitGroup.value)
                                ? toArray(accountsList).map(
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

                <div className="col-12"></div>

                {/* credit group */}
                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                    <label>Credit Group</label>
                    <Select
                        value={selectedCreditGroup}
                        options={[
                            { value: '', label: 'select' },
                            ...accountGroupData.map(group => ({
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
                            value: receiptValue.credit_ledger,
                            label: receiptValue.credit_ledger_name
                        }}
                        menuPortalTarget={document.body}
                        onChange={e => {
                            onChangePaymentValue('credit_ledger', e.value);
                            onChangePaymentValue('credit_ledger_name', e.label);
                        }}
                        options={[
                            { value: '', label: 'select', isDisabled: true },
                            ...(!checkIsNumber(selectedCreditGroup.value)
                                ? toArray(accountsList).map(
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

                <div className="col-12">
                    <hr className=" text-dark" />
                </div>

                <div className="col-12 p-2">
                    <h5 className=" border-start border-primary border-3 p-2 m-0">Others Details</h5>
                </div>

            </div>

            <div className="row p-2 pb-0">

                <div className="col-md-6 p-2">
                    <div className="row">

                        {/* bank name */}
                        <div className="col-sm-6 p-2">
                            <label>Bank Name</label>
                            <input
                                value={receiptValue.bank_name}
                                className="cus-inpt p-2"
                                onChange={e => onChangePaymentValue('bank_name', e.target.value)}
                            />
                        </div>

                        {/* bank date */}
                        <div className="col-sm-6 p-2">
                            <label>Bank Date</label>
                            <input
                                value={receiptValue.bank_date}
                                type="date"
                                className="cus-inpt p-2"
                                onChange={e => onChangePaymentValue('bank_date', e.target.value)}
                            />
                        </div>

                        {/* cheque no */}
                        <div className="col-sm-6 p-2">
                            <label>Cheque No</label>
                            <input
                                value={receiptValue.check_no}
                                className="cus-inpt p-2"
                                onChange={e => onChangePaymentValue('check_no', e.target.value)}
                            />
                        </div>

                        {/* Cheque date */}
                        <div className="col-sm-6 p-2">
                            <label>Cheque Date</label>
                            <input
                                value={receiptValue.check_date}
                                type="date"
                                className="cus-inpt p-2"
                                onChange={e => onChangePaymentValue('check_date', e.target.value)}
                            />
                        </div>

                    </div>
                </div>

                {/* Narration */}
                <div className="col-md-6 p-3">
                    <label>Narration </label>
                    <textarea
                        className="cus-inpt p-2"
                        value={receiptValue.remarks}
                        onChange={e => onChangePaymentValue('remarks', e.target.value)}
                        rows={5}
                    />
                </div>

            </div>

        </>
    )
}

export default ReceiptGeneralInfo;