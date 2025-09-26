import { useState, useEffect } from "react";
import { Button, Card } from '@mui/material';
import { useNavigate } from "react-router-dom";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, checkIsNumber, ISOString, LocalDate, NumberFormat, onlynum, reactSelectFilterLogic, stringCompare, Subraction, toArray, toNumber } from "../../../Components/functions";
import { paymentGeneralInfoInitialValue } from "../PaymentMaster/variable";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";


const PaymentOutstanding = ({ loadingOn, loadingOff, AddRights }) => {

    const [reportData, setReportData] = useState([]);
    const [ledgers, setLedgers] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState([]);
    const navigation = useNavigate();

    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        ledger: { value: '', label: 'Select Ledger' },
        refresh: false,
        filterDialog: false,
    });

    useEffect(() => {
        fetchLink({
            address: `payment/getRetailersWhoHasBills`
        }).then(data => {
            if (data.success) {
                setLedgers(data.data)
            }
        }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        if (!checkIsNumber(filters.ledger.value)) return;
        setSelectedInvoice([]);

        fetchLink({
            address: `payment/paymentPendingInvoices?Acc_Id=${filters.ledger.value}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                const repDat = toArray(data.data).map(o => ({
                    ...o,
                    paymentPendingAmount: Subraction(o.Total_Invoice_value, o.totalReference)
                }))
                setReportData(repDat);
            }
        }).catch(e => console.error(e))
    }, [filters.ledger.value]);

    const onSelect = (row, deleteOption) => {
        setSelectedInvoice(pre => {
            const previousValue = toArray(pre);

            const excludeCurrentValue = previousValue.filter(o => !stringCompare(o?.Po_Inv_No, row.Po_Inv_No));

            let updateBillInfo;
            if (deleteOption) {
                updateBillInfo = excludeCurrentValue;
            } else {
                updateBillInfo = [...excludeCurrentValue, { ...row, newPaymentBillAmount: toNumber(row?.paymentPendingAmount) }];
            }
            return updateBillInfo;
        })
    }

    const onChangeAmount = (billId, value) => {
        setSelectedInvoice(pre => pre.map(
            bill => ({
                ...bill,
                newPaymentBillAmount: stringCompare(
                    billId, bill.Po_Inv_No
                ) ? value : bill.newPaymentBillAmount
            })
        ))
    }

    return (
        <>

            <Card>

                <div className="p-2 d-flex justify-content-between align-items-center">
                    <h5>Payments Outstaing</h5>
                    <div style={{ minWidth: '360px' }}>
                        <Select
                            value={filters?.ledger}
                            onChange={(e) => setFilters(pre => ({ ...pre, ledger: e }))}
                            options={[
                                { value: '', label: 'ALL' },
                                ...ledgers
                            ]}
                            styles={customSelectStyles}
                            isSearchable={true}
                            placeholder={"Select Leder Name"}
                            menuPortalTarget={document.body}
                            filterOption={reactSelectFilterLogic}
                        />
                    </div>
                </div>

                <form onSubmit={e => {
                    e.preventDefault();
                    navigation('/erp/payments/paymentList/create', {
                        state: {
                            ...paymentGeneralInfoInitialValue,
                            debit_ledger: filters.ledger.value,
                            debit_ledger_name: filters.ledger.label,
                            debit_amount: selectedInvoice.reduce((acc, bill) => Addition(
                                acc, bill?.newPaymentBillAmount
                            ), 0),
                            BillsDetails: selectedInvoice.map(bill => ({
                                bill_id: bill.PIN_Id,
                                bill_name: bill.Po_Inv_No,
                                bill_ref_number: bill.bill_ref_number,
                                bill_amount: bill.Total_Invoice_value,
                                Debit_Amo: bill.newPaymentBillAmount,
                                Credit_Amo: 0
                            }))
                        }
                    })
                }}>
                    <div className="table-responsive">
                        <table className="table table-bordered fa-12">
                            <thead>
                                <tr>
                                    {['Sno', 'Voucher-No', 'Source', 'Date', 'Total-Value', 'Closed Value', 'Outstanding', 'Make a Payment'].map(
                                        (o, i) => <th key={i} className="fa-13">{o}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>

                                {/* total value details */}
                                <tr>
                                    <td colSpan={4} className="fw-bold bg-light text-center">Total</td>
                                    <td className="bg-light">
                                        {NumberFormat(reportData.reduce((acc, bill) => Addition(
                                            acc,
                                            bill.Total_Invoice_value
                                        ), 0))}
                                    </td>
                                    <td className="bg-light">
                                        {NumberFormat(reportData.reduce((acc, bill) => Addition(
                                            acc,
                                            bill.totalReference
                                        ), 0))}
                                    </td>
                                    <td className="bg-light">
                                        {NumberFormat(reportData.reduce((acc, bill) => Addition(
                                            acc,
                                            Subraction(bill.Total_Invoice_value, bill.totalReference)
                                        ), 0))}
                                    </td>
                                    <td className="text-primary fw-bold text-end fa-17 bg-light">
                                        {NumberFormat(selectedInvoice.reduce((acc, bill) => Addition(
                                            acc, bill?.newPaymentBillAmount
                                        ), 0))}
                                    </td>
                                </tr>

                                {/* pending payments */}
                                {reportData.map((row, rowIndex) => {
                                    const invIndex = selectedInvoice.findIndex(
                                        bill => stringCompare(bill?.Po_Inv_No, row?.Po_Inv_No)
                                    );
                                    const amount = selectedInvoice[invIndex] ? selectedInvoice[invIndex]?.newPaymentBillAmount : 0;
                                    const isChecked = invIndex !== -1;

                                    return (
                                        <tr key={rowIndex}>
                                            <td>{rowIndex + 1}</td>
                                            <td>{row?.Po_Inv_No}</td>
                                            <td>{row?.dataSource}</td>
                                            <td>{LocalDate(row?.Po_Inv_Date)}</td>
                                            <td>{NumberFormat(row?.Total_Invoice_value)}</td>
                                            <td>{NumberFormat(row?.totalReference)}</td>
                                            <td>{NumberFormat(row?.paymentPendingAmount)}</td>
                                            <td className="p-0 vctr text-center" style={{ verticalAlign: 'middle' }}>
                                                <div className="d-flex align-items-center">

                                                    <input
                                                        className="form-check-input shadow-none pointer mx-2"
                                                        style={{ padding: '0.7em' }}
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        onChange={() => {
                                                            if (isChecked) onSelect(row, true)
                                                            else onSelect(row)
                                                        }}
                                                    />

                                                    {isChecked && (
                                                        <input
                                                            value={amount ? amount : ''}
                                                            onInput={onlynum}
                                                            required={isChecked}
                                                            type="number"
                                                            max={toNumber(row?.paymentPendingAmount)}
                                                            className="cus-inpt flex-grow-1 p-2 border-0 me-1"
                                                            onChange={e => onChangeAmount(row?.Po_Inv_No, e.target.value)}
                                                            placeholder={isChecked ? "Enter amount" : ''}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}

                                {/* nave to payment */}
                                <tr>
                                    <td colSpan={8} className="text-end">
                                        <Button
                                            variant="outlined"
                                            disabled={selectedInvoice.length === 0}
                                            type="submit"
                                        >Create Payment</Button>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </form>

            </Card>
        </>
    )
}

export default PaymentOutstanding;