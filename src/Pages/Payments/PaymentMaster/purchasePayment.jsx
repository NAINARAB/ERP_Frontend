import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { isEqualNumber, LocalDate, Subraction, toArray } from "../../../Components/functions";
import { Close } from "@mui/icons-material";
import FilterableTable, { ButtonActions, createCol } from "../../../Components/filterableTable2";



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

    }

    return (
        <>
            <FilterableTable
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
                    createCol('TotalPaidAmount', 'number', 'Total Payment'),
                    createCol('PendingAmount', 'number', 'Pending Payment'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Action',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <>
                                <IconButton
                                    onClick={() => {

                                    }}
                                ></IconButton>
                            </>
                        )
                    }
                ]}
            />


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