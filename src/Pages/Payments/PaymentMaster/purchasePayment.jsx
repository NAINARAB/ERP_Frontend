import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Addition, checkIsNumber, isEqualNumber, LocalDate, NumberFormat, onlynum, RoundNumber, Subraction, toArray, toNumber } from "../../../Components/functions";
import { Close, Delete } from "@mui/icons-material";
import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";
import { paymentBillInfoInitialValue } from "./variable";



const PurchaseInvoicePayment = ({
    cellHeadStype = { width: '150px' },
    cellStyle = { minWidth: '130px' },
    initialSelectValue = { value: '', label: '' },
    paymentGeneralInfo = {},
    paymentBillInfo = [],
    setPaymentBillInfo,
    filters,
    baseData,
    setPaymentGeneralInfo,
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
            {/* <FilterableTable
                title="Against Reference"
                disablePagination
                EnableSerialNumber
                ButtonArea={
                    <>
                        <Button
                            type="button"
                            variant="outlined"
                            disabled={toArray(baseData.purchaseInvoiceSearchResult).length === 0}
                            onClick={() => updateFilterData('selectPurchaseInvoice', true)}
                        >Add reference</Button>
                    </>
                }
                dataArray={paymentBillInfo}
                columns={[
                    createCol('bill_name', 'string', 'P.Invoice No'),
                    createCol('PurchaseInvoiceDate', 'date', 'Date'),
                    createCol('bill_amount', 'number', 'Invoice Value'),
                    createCol('TotalPaidAmount', 'number', 'Total Paid Amount'),
                    createCol('PendingAmount', 'number', 'Pending Payment'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Action',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            // const isChecked = paymentBillInfo.findIndex(o =>
                            //     isEqualNumber(o?.pay_bill_id, row.PIN_Id)
                            // ) !== -1;
                            <>
                                <IconButton
                                    onClick={() => {

                                    }}
                                ></IconButton>
                            </>
                        }
                    }
                ]}
            /> */}

            <div className="table-responsive">
                <table className="table table-bordered fa-13">
                    <thead>
                        <tr>
                            <th className="text-primary fa-15 vctr" style={cellHeadStype}>Against Reference</th>
                            <th colSpan={5} className="text-end">
                                <Button
                                    type="button"
                                    variant="outlined"
                                    disabled={toArray(baseData.purchaseInvoiceSearchResult).length === 0}
                                    onClick={() => updateFilterData('selectPurchaseInvoice', true)}
                                >Add reference</Button>
                            </th>
                        </tr>
                        <tr>
                            {['Sno', 'Purchase InvoiceNo', 'Date', 'Invoice Value',
                                // 'Paid Amount', 'Pending Amount',
                                'Payment Amount', 'Action'].map(
                                    (col, colInd) => <th key={colInd} className="bg-light text-muted">{col}</th>
                                )}
                        </tr>
                    </thead>
                    <tbody>
                        {paymentBillInfo.map(
                            (invoice, invoiceInd) => (
                                <tr key={invoiceInd}>
                                    <td>{invoiceInd + 1}</td>
                                    <td>{invoice?.bill_name}</td>
                                    <td>{LocalDate(invoice?.PurchaseInvoiceDate)}</td>
                                    <td>{NumberFormat(invoice?.bill_amount)}</td>
                                    {/* <td>{invoice?.TotalPaidAmount}</td> */}
                                    {/* <td>{Subraction(invoice?.bill_amount, invoice?.TotalPaidAmount)}</td> */}
                                    <td className="p-0">
                                        <input
                                            value={invoice.Debit_Amo || ''}
                                            className="cus-inpt p-2 border-0"
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
                                            onClick={() => onClickPurchaseInvoice({
                                                ...invoice,
                                                PIN_Id: invoice.pay_bill_id
                                            }, true)}
                                        ><Delete className="fa-20" color="error" /></IconButton>
                                    </td>
                                </tr>
                            )
                        )}
                        <tr>
                            <td colSpan={3} className="text-end fw-bold">Total</td>
                            <td className="fw-bold text-muted">
                                {paymentBillInfo.reduce(
                                    (acc, invoice) => Addition(acc, invoice.bill_amount), 0
                                )}
                            </td>
                            <td className="fw-bold text-muted">
                                {paymentBillInfo.reduce(
                                    (acc, invoice) => Addition(acc, invoice.Debit_Amo), 0
                                )}
                            </td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>


            <Dialog
                open={filters.selectPurchaseInvoice}
                onClose={closeDialog} fullScreen
            >
                <DialogTitle className="d-flex justify-content-between align-items-center">
                    <span>Add Ref - Purchase Invoice</span>
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
                                {['Sno', 'Payment InvoiceNo', 'Date', 'Invoice Value', 'Paid Amount', 'Pending Amount', '#'].map(
                                    (col, colInd) => <td key={colInd}>{col}</td>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {baseData.purchaseInvoiceSearchResult.map(
                                (invoice, invoiceInd) => (
                                    <tr key={invoiceInd}>
                                        <td>{invoiceInd + 1}</td>
                                        <td>{invoice?.Po_Inv_No}</td>
                                        <td>{LocalDate(invoice?.Po_Inv_Date)}</td>
                                        <td>{invoice?.Total_Invoice_value}</td>
                                        <td>{invoice?.Paid_Amount}</td>
                                        <td>{Subraction(invoice?.Total_Invoice_value, invoice?.Paid_Amount)}</td>
                                        <td>
                                            {(() => {
                                                const isChecked = paymentBillInfo.findIndex(o =>
                                                    isEqualNumber(o?.pay_bill_id, invoice.PIN_Id)
                                                ) !== -1;

                                                return (
                                                    <div>
                                                        <input
                                                            className="form-check-input shadow-none pointer"
                                                            style={{ padding: '0.7em' }}
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {
                                                                if (isChecked) onClickPurchaseInvoice(invoice, true)
                                                                else onClickPurchaseInvoice(invoice)
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
                                    {baseData.purchaseInvoiceSearchResult.reduce(
                                        (acc, invoice) => Addition(acc, invoice?.Total_Invoice_value), 0
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td>Selected Bill Amount: </td>
                                <td colSpan={2} className="text-primary fw-bold">
                                    {baseData.purchaseInvoiceSearchResult.reduce(
                                        (acc, invoice) => {
                                            const isChecked = paymentBillInfo.findIndex(o =>
                                                isEqualNumber(o?.pay_bill_id, invoice.PIN_Id)
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
                                    {baseData.purchaseInvoiceSearchResult.reduce(
                                        (acc, invoice) => {
                                            const isNotChecked = paymentBillInfo.findIndex(o =>
                                                isEqualNumber(o?.pay_bill_id, invoice.PIN_Id)
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

export default PurchaseInvoicePayment;