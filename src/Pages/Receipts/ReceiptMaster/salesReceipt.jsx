import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Addition, checkIsNumber, isEqualNumber, LocalDate, NumberFormat, onlynum, RoundNumber, stringCompare, Subraction, toArray, toNumber } from "../../../Components/functions";
import { Close, Delete } from "@mui/icons-material";
import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
import { receiptBillInfoInitialValue } from "./variable";



const SalesInvoiceReceipt = ({
    cellHeadStype = { width: '150px' },
    cellStyle = { minWidth: '130px' },
    initialSelectValue = { value: '', label: '' },
    receiptValue = {},
    receiptBillInfo = [],
    setReceiptBillInfo,
    filters,
    baseData,
    setreceiptValue,
    updateFilterData,
    updateBaseData,
    closeDialog,
}) => {

    const onClickSalesInvoice = (invoiceDetails, deleteOption) => {
        setReceiptBillInfo(pre => {
            const previousValue = toArray(pre);

            const excludeCurrentValue = previousValue.filter(o => !(
                stringCompare(o?.bill_name, invoiceDetails.bill_name) &&
                isEqualNumber(o?.bill_id, invoiceDetails?.bill_id)
            ));

            let updateBillInfo;
            if (deleteOption) {
                updateBillInfo = excludeCurrentValue;
            } else {
                const reStruc = Object.fromEntries(
                    Object.entries(receiptBillInfoInitialValue).map(([key, value]) => {
                        switch (key) {
                            case 'bill_id': return [key, invoiceDetails?.Do_Id];
                            case 'bill_name': return [key, invoiceDetails?.Do_Inv_No];
                            case 'bill_amount': return [key, toNumber(invoiceDetails?.Total_Invoice_value)];
                            case 'Debit_Amo': return [key, 0];
                            case 'Credit_Amo': return [key, 0];
                            case 'JournalBillType': return [key, 'SALES INVOICE'];

                            case 'SalesInvoiceDate': return [key, invoiceDetails.Do_Date];
                            case 'TotalPaidAmount': return [key, invoiceDetails.totalReference];
                            case 'PendingAmount': return [key, Subraction(
                                invoiceDetails?.Total_Invoice_value,
                                invoiceDetails.totalReference
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
        setReceiptBillInfo(pre => {
            const selectedInvoices = [...pre];

            const indexOfInvoice = selectedInvoices.findIndex(
                inv => (
                    stringCompare(invoice.bill_name, inv.bill_name) &&
                    isEqualNumber(invoice.bill_id, inv.bill_id)
                )
            );

            if (indexOfInvoice !== -1) {
                selectedInvoices[indexOfInvoice].Credit_Amo = toNumber(amount);
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
                            <th colSpan={6} className="text-end">
                                <Button
                                    type="button"
                                    variant="outlined"
                                    disabled={toArray(baseData.salesInvoiceSearchResult).length === 0}
                                    onClick={() => updateFilterData('selectSalesInvoice', true)}
                                >Add reference</Button>
                            </th>
                        </tr>
                        <tr>
                            {['Sno', 'Sales InvoiceNo', 'Date', 'Invoice Value',
                                'Paid Amount',
                                // 'Pending Amount',
                                'Payment Amount', 'Action'].map(
                                    (col, colInd) => <th key={colInd} className="bg-light text-muted">{col}</th>
                                )}
                        </tr>
                    </thead>
                    <tbody>
                        {receiptBillInfo.map(
                            (invoice, invoiceInd) => (
                                <tr key={invoiceInd}>
                                    <td>{invoiceInd + 1}</td>
                                    <td>{invoice?.bill_name}</td>
                                    <td>{LocalDate(invoice?.SalesInvoiceDate)}</td>
                                    <td>{NumberFormat(invoice?.bill_amount)}</td>
                                    <td>{invoice?.TotalPaidAmount}</td>
                                    {/* <td>{Subraction(invoice?.bill_amount, invoice?.TotalPaidAmount)}</td> */}
                                    <td className="p-0">
                                        <input
                                            value={invoice.Credit_Amo || ''}
                                            className="cus-inpt p-2 border-0 text-primary"
                                            placeholder="Enter Amount"
                                            type="number"
                                            onChange={e => {
                                                const maxAmount = Subraction(invoice?.bill_amount, invoice?.TotalPaidAmount);
                                                const validated = onInputValidate(e.target.value, maxAmount);
                                                onChangeAmount(invoice, validated);
                                            }}
                                        />

                                    </td>
                                    <td className="p-0 vctr cntr">
                                        <IconButton
                                            size="small"
                                            onClick={() => onClickSalesInvoice(invoice, true)}
                                        ><Delete className="fa-20" color="error" /></IconButton>
                                    </td>
                                </tr>
                            )
                        )}
                        <tr>
                            <td colSpan={3} className="text-end fw-bold">Total</td>
                            <td className="fw-bold text-muted">
                                {receiptBillInfo.reduce(
                                    (acc, invoice) => Addition(acc, invoice.bill_amount), 0
                                )}
                            </td>
                            <td></td>
                            <td className="fw-bold text-muted">
                                {receiptBillInfo.reduce(
                                    (acc, invoice) => Addition(acc, invoice.Credit_Amo), 0
                                )}
                            </td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>


            <Dialog
                open={filters.selectSalesInvoice}
                onClose={closeDialog} fullScreen
            >
                <DialogTitle className="d-flex justify-content-between align-items-center">
                    <span>Add Ref - Sales Invoice</span>
                    <IconButton onClick={closeDialog}><Close color="error" /></IconButton>
                </DialogTitle>

                <DialogContent>
                    <table className="table table-bordered fa-13">
                        <thead>
                            <tr>
                                <th className="text-primary fa-15 vctr" style={cellHeadStype}>Pending Invoices</th>
                                <th colSpan={6} className="text-end">

                                </th>
                            </tr>
                            <tr>
                                {['Sno', 'Sales InvoiceNo', 'Source', 'Date', 'Invoice Value', 'Paid Amount', 'Pending Amount', '#'].map(
                                    (col, colInd) => <td key={colInd}>{col}</td>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {baseData.salesInvoiceSearchResult.map(
                                (invoice, invoiceInd) => (
                                    <tr key={invoiceInd}>
                                        <td>{invoiceInd + 1}</td>
                                        <td>{invoice?.Do_Inv_No}</td>
                                        <td>{invoice?.dataSource}</td>
                                        <td>{LocalDate(invoice?.Do_Date)}</td>
                                        <td>{invoice?.Total_Invoice_value}</td>
                                        <td>{invoice?.Paid_Amount}</td>
                                        <td>{Subraction(invoice?.Total_Invoice_value, invoice?.totalReference)}</td>
                                        <td>
                                            {(() => {
                                                const isChecked = receiptBillInfo.findIndex(o =>
                                                    stringCompare(o?.bill_name, invoice.Do_Inv_No)
                                                ) !== -1;

                                                return (
                                                    <div>
                                                        <input
                                                            className="form-check-input shadow-none pointer"
                                                            style={{ padding: '0.7em' }}
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {
                                                                if (isChecked) onClickSalesInvoice({
                                                                    ...invoice, 
                                                                    bill_name: invoice.Do_Inv_No,
                                                                    bill_id: invoice.Do_Id
                                                                }, true)
                                                                else onClickSalesInvoice({
                                                                    ...invoice, 
                                                                    bill_name: invoice.Do_Inv_No,
                                                                    bill_id: invoice.Do_Id
                                                                })
                                                            }}
                                                        />
                                                    </div>
                                                )
                                            })()}
                                        </td>
                                    </tr>
                                )
                            )}
                            <tr>
                                <td colSpan={4} rowSpan={3}></td>
                                <td>Total Amount: </td>
                                <td colSpan={2} className="fw-bold fa-15">
                                    {baseData.salesInvoiceSearchResult.reduce(
                                        (acc, invoice) => Addition(acc, invoice?.Total_Invoice_value), 0
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>Selected Bill Amount: </td>
                                <td colSpan={2} className="text-primary fw-bold">
                                    {baseData.salesInvoiceSearchResult.reduce(
                                        (acc, invoice) => {
                                            const isChecked = receiptBillInfo.findIndex(o =>
                                                isEqualNumber(o?.bill_id, invoice.Do_Id)
                                            ) !== -1;

                                            if (isChecked) return Addition(acc, invoice?.Total_Invoice_value);

                                            return acc
                                        }, 0
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>Pending Bill Amount: </td>
                                <td colSpan={2} className="text-danger">
                                    {baseData.salesInvoiceSearchResult.reduce(
                                        (acc, invoice) => {
                                            const isNotChecked = receiptBillInfo.findIndex(o =>
                                                isEqualNumber(o?.bill_id, invoice.Do_Id)
                                            ) === -1;

                                            if (isNotChecked) return Addition(acc, invoice?.Total_Invoice_value);

                                            return acc
                                        }, 0
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default SalesInvoiceReceipt;