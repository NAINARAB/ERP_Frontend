import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Addition, checkIsNumber, isEqualNumber, LocalDate, NumberFormat, onlynum, RoundNumber, Subraction, toArray, toNumber } from "../../../Components/functions";
import { Close, Delete } from "@mui/icons-material";
import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
import { paymentBillInfoInitialValue } from "./variable";


const ExpencePayment = ({
    cellHeadStype = { width: '150px' },
    cellStyle = { minWidth: '130px' },
    initialSelectValue = { value: '', label: '' },
    filters,
    baseData,
    paymentGeneralInfo = {},
    paymentBillInfo = [],
    paymentCostingInfo = [],
    setPaymentGeneralInfo,
    setPaymentBillInfo,
    setPaymentCostingInfo,
    updateFilterData,
    updateBaseData,
    closeDialog,
}) => {

    const onClickPurchaseInvoice = (invoiceDetails, deleteOption) => {
        setPaymentBillInfo(pre => {
            const previousValue = toArray(pre);

            const excludeCurrentValue = previousValue.filter(o => !isEqualNumber(o?.pay_bill_id, invoiceDetails.PIN_Id));

            let updateBillInfo;
            if (deleteOption) {
                updateBillInfo = excludeCurrentValue;
            } else {
                const reStruc = Object.fromEntries(
                    Object.entries(paymentBillInfoInitialValue).map(([key, value]) => {
                        switch (key) {
                            case 'pay_bill_id': return [key, invoiceDetails?.PIN_Id];
                            case 'bill_name': return [key, invoiceDetails?.Po_Inv_No];
                            case 'bill_amount': return [key, toNumber(invoiceDetails?.Total_Invoice_value)];
                            case 'Debit_Amo': return [key, 0];
                            case 'Credit_Amo': return [key, 0];

                            case 'PurchaseInvoiceDate': return [key, invoiceDetails.Po_Inv_Date];
                            case 'TotalPaidAmount': return [key, invoiceDetails.Paid_Amount];
                            case 'PendingAmount': return [key, Subraction(
                                invoiceDetails?.Total_Invoice_value,
                                invoiceDetails.Paid_Amount
                            )];
                            default: return [key, value];
                        }
                    })
                )
                updateBillInfo = [...excludeCurrentValue, reStruc];
            }
            return updateBillInfo;
        })
    }

    const onChangeAmount = (invoice, amount) => {
        setPaymentBillInfo(pre => {
            const selectedInvoices = [...pre];

            const indexOfInvoice = selectedInvoices.findIndex(
                inv => isEqualNumber(invoice.pay_bill_id, inv.pay_bill_id)
            );

            if (indexOfInvoice !== -1) {
                selectedInvoices[indexOfInvoice].Debit_Amo = toNumber(amount);
            }
            return selectedInvoices;
        })
    }

    const onInputValidate = (input, max) => {
        const inputValue = checkIsNumber(input) ? RoundNumber(input) : 0;
        return inputValue < max ? inputValue : max;
    };

    return (
        <>
            <div className="table-responsive">
                <table className="table table-bordered fa-13">
                    <thead>
                        <tr>
                            <th className="text-primary fa-15 vctr" style={cellHeadStype}>Against Reference</th>
                            <th colSpan={5} className="text-end">
                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => updateFilterData('selectStockJournal', true)}
                                >Add reference</Button>
                            </th>
                        </tr>
                        <tr>
                            {['Sno', 'Journal-No', 'Date', 'Journal Type', 'Paid Amount', 'Action'].map(
                                (col, colInd) => <th key={colInd} className="bg-light text-muted">{col}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {/* {toArray(baseData.stockJournalSearchResult).map(
                            (journal, journalIndex) => (
                                <tr key={journalIndex}>
                                    <td>{journalIndex + 1}</td>
                                    <td>{journal.bill_name}</td>
                                    <td>{journal.StockJournalDate}</td>
                                    <td>{journal.bill_amount}</td>
                                    <td>{journal.TotalPaidAmount}</td>
                                    <td>
                                        <input
                                            value={journal.Debit_Amo || ''}
                                            className="cus-inpt p-2 border-0 text-primary"
                                            placeholder="Enter Amount"
                                            type="number"
                                            onChange={e => {
                                                const maxAmount = Subraction(journal?.bill_amount, journal?.TotalPaidAmount);
                                                const validated = onInputValidate(e.target.value, maxAmount);
                                                onChangeAmount(journal, validated);
                                            }}
                                        />
                                    </td>
                                    <td className="p-0 vctr cntr">
                                        <IconButton
                                            size="small"
                                            onClick={() => onClickPurchaseInvoice({
                                                ...journal,
                                                PIN_Id: journal.pay_bill_id
                                            }, true)}
                                        ><Delete className="fa-20" color="error" /></IconButton>
                                    </td>
                                </tr>
                            )
                        )} */}
                    </tbody>
                </table>
            </div>

            <Dialog
                open={filters.selectStockJournal}
                onClose={closeDialog} fullScreen
            >
                <DialogTitle className="d-flex justify-content-between align-items-center">
                    <span>Add Ref - Stock Journal Expences</span>
                    <IconButton onClick={closeDialog}><Close color="error" /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <div className="table-responsive">
                        <table className="table table-bordered fa-13">
                            <thead>
                                <tr>
                                    <th className="text-primary fa-15 vctr" style={cellHeadStype}>Stock Journal</th>
                                    <th colSpan={5} className="text-end"></th>
                                </tr>
                                <tr>
                                    {['Sno', 'Journal-No', 'Date', 'Journal Type', 'Paid Amount', '#'].map(
                                        (col, colInd) => <td key={colInd}>{col}</td>
                                    )}
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ExpencePayment;