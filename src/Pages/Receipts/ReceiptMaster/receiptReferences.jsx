import { useState, useEffect } from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { Close, Delete } from "@mui/icons-material";
import { Addition, checkIsNumber, isEqualNumber, LocalDate, NumberFormat, onlynum, stringCompare, Subraction, toArray, toNumber } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import { toast } from 'react-toastify';

const ReceiptReferences = ({
    receiptValue,
    setReceiptValue,
    receiptBillDetails,
    setReceiptBillDetails,
    loadingOn,
    loadingOff
}) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [selectedInvoice, setSelectedInvoice] = useState([]);

    const fetchPendingInvoices = () => {
        if (!checkIsNumber(receiptValue.credit_ledger)) {
            toast.warn('Please select Credit Account first');
            return;
        }
        loadingOn && loadingOn();
        fetchLink({
            address: `journal/accountPendingReference?Acc_Id=${receiptValue.credit_ledger}`,
        }).then(data => {
            if (data.success) {
                const mappedData = toArray(data.data)
                    .filter(item => item.accountSide === 'Dr')
                    .map(item => ({
                        ...item,
                        Do_Inv_No: item.voucherNumber,
                        Do_Id: item.voucherId,
                        Do_Date: item.eventDate,
                        Total_Invoice_value: item.totalValue,
                        dataSource: item.actualSource,
                        totalReference: Addition(item.againstAmount, item.journalAdjustment),
                        receiptPendingAmount: item.BalanceAmount
                    }));
                setReportData(mappedData);
                
                // Initialize selectedInvoice with existing receiptBillDetails
                const initialSelected = mappedData.filter(reportRow => 
                    receiptBillDetails.some(bill => stringCompare(bill.bill_name, reportRow.Do_Inv_No))
                ).map(reportRow => {
                    const existingBill = receiptBillDetails.find(bill => stringCompare(bill.bill_name, reportRow.Do_Inv_No));
                    return {
                        ...reportRow,
                        newReceiptBillAmount: existingBill ? toNumber(existingBill.Credit_Amo) : toNumber(reportRow.receiptPendingAmount)
                    }
                });
                
                // Keep the bills that are not in the reportData (already closed bills partially paid in this receipt, etc)
                const missingBills = receiptBillDetails.filter(bill => 
                    !mappedData.some(reportRow => stringCompare(bill.bill_name, reportRow.Do_Inv_No))
                ).map(bill => ({
                    Do_Inv_No: bill.bill_name,
                    Do_Id: bill.bill_id,
                    Do_Date: bill.SalesInvoiceDate || '',
                    Total_Invoice_value: bill.bill_amount,
                    dataSource: 'Existing',
                    totalReference: bill.TotalPaidAmount || 0,
                    receiptPendingAmount: bill.PendingAmount || 0,
                    newReceiptBillAmount: toNumber(bill.Credit_Amo)
                }));
                
                setSelectedInvoice([...initialSelected, ...missingBills]);
                setIsDialogOpen(true);
            } else {
                toast.error(data.message || 'Failed to fetch pending bills');
            }
        }).catch(e => console.error(e)).finally(() => {
            loadingOff && loadingOff();
        })
    }

    const onSelect = (row, deleteOption) => {
        setSelectedInvoice(pre => {
            const previousValue = toArray(pre);
            const excludeCurrentValue = previousValue.filter(o => !stringCompare(o?.Do_Inv_No, row.Do_Inv_No));

            let updateBillInfo;
            if (deleteOption) {
                updateBillInfo = excludeCurrentValue;
            } else {
                updateBillInfo = [...excludeCurrentValue, { ...row, newReceiptBillAmount: toNumber(row?.receiptPendingAmount) }];
            }
            return updateBillInfo;
        })
    }

    const onChangeAmount = (billId, value) => {
        setSelectedInvoice(pre => pre.map(
            bill => ({
                ...bill,
                newReceiptBillAmount: stringCompare(
                    billId, bill.Do_Inv_No
                ) ? value : bill.newReceiptBillAmount
            })
        ))
    }
    
    const onRemoveReference = (bill_name) => {
        setReceiptBillDetails(pre => {
            const newList = pre.filter(b => !stringCompare(b.bill_name, bill_name));
            recalculateCreditAmount(newList);
            return newList;
        });
    }

    const handleConfirm = () => {
        const newBillsDetails = selectedInvoice.map(bill => ({
            bill_id: bill.Do_Id,
            bill_name: bill.Do_Inv_No,
            bill_amount: bill.Total_Invoice_value,
            Debit_Amo: 0,
            Credit_Amo: toNumber(bill.newReceiptBillAmount),
            SalesInvoiceDate: bill.Do_Date,
            TotalPaidAmount: bill.totalReference,
            PendingAmount: bill.receiptPendingAmount
        }));
        
        setReceiptBillDetails(newBillsDetails);
        recalculateCreditAmount(newBillsDetails);
        setIsDialogOpen(false);
    }
    
    const recalculateCreditAmount = (bills) => {
        const sumCredit = bills.reduce((acc, bill) => Addition(acc, bill.Credit_Amo), 0);
        const currentCredit = toNumber(receiptValue.credit_amount);
        if (currentCredit === 0 || !currentCredit) {
            setReceiptValue(pre => ({
                ...pre,
                credit_amount: sumCredit
            }));
        }
    }
    
    const showAddReferenceBtn = isEqualNumber(receiptValue.receipt_bill_type, 1) || isEqualNumber(receiptValue.receipt_bill_type, 2);

    return (
        <div className="p-2">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="border-start border-primary border-3 p-2 m-0">References</h5>
                {showAddReferenceBtn && (
                    <Button variant="outlined" onClick={fetchPendingInvoices}>
                        Add Reference
                    </Button>
                )}
            </div>

            {receiptBillDetails.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-bordered fa-13">
                        <thead>
                            <tr>
                                {['Sno', 'Bill Name', 'Date', 'Invoice Value', 'Paid Amount', 'Payment Amount', 'Action'].map(
                                    (col, colInd) => <th key={colInd} className="bg-light text-muted">{col}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {receiptBillDetails.map((invoice, invoiceInd) => (
                                <tr key={invoiceInd}>
                                    <td>{invoiceInd + 1}</td>
                                    <td>{invoice?.bill_name}</td>
                                    <td>{LocalDate(invoice?.SalesInvoiceDate)}</td>
                                    <td>{NumberFormat(invoice?.bill_amount)}</td>
                                    <td>{NumberFormat(invoice?.TotalPaidAmount || 0)}</td>
                                    <td className="text-primary fw-bold">{NumberFormat(invoice?.Credit_Amo)}</td>
                                    <td className="p-0 vctr cntr" style={{ verticalAlign: 'middle' }}>
                                        <IconButton size="small" onClick={() => onRemoveReference(invoice.bill_name)}>
                                            <Delete className="fa-20" color="error" />
                                        </IconButton>
                                    </td>
                                </tr>
                            ))}
                            <tr>
                                <td colSpan={5} className="text-end fw-bold">Total</td>
                                <td className="fw-bold text-primary">
                                    {NumberFormat(receiptBillDetails.reduce(
                                        (acc, invoice) => Addition(acc, invoice.Credit_Amo), 0
                                    ))}
                                </td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            <Dialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                fullScreen
            >
                <DialogTitle className="d-flex justify-content-between align-items-center">
                    <span>Select Outstanding Bills</span>
                    <IconButton onClick={() => setIsDialogOpen(false)}><Close color="error" /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <div className="table-responsive mt-3">
                        <table className="table table-bordered fa-13">
                            <thead>
                                <tr>
                                    {['Sno', 'Sales Invoice No', 'Source', 'Date', 'Inv-Value', 'Closed Value', 'Outstanding', 'Make a Receipt'].map(
                                        (o, i) => <th key={i} className="fa-13 bg-light">{o}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {/* total value details */}
                                <tr>
                                    <td colSpan={4} className="fw-bold bg-light text-center">Total</td>
                                    <td className="bg-light fw-bold">
                                        {NumberFormat(reportData.reduce((acc, bill) => Addition(acc, bill.Total_Invoice_value), 0))}
                                    </td>
                                    <td className="bg-light fw-bold">
                                        {NumberFormat(reportData.reduce((acc, bill) => Addition(acc, bill.totalReference), 0))}
                                    </td>
                                    <td className="bg-light fw-bold text-danger">
                                        {NumberFormat(reportData.reduce((acc, bill) => Addition(acc, Subraction(bill.Total_Invoice_value, bill.totalReference)), 0))}
                                    </td>
                                    <td className="text-primary fw-bold text-end fa-17 bg-light">
                                        {NumberFormat(selectedInvoice.reduce((acc, bill) => Addition(acc, bill?.newReceiptBillAmount), 0))}
                                    </td>
                                </tr>

                                {/* pending receipts */}
                                {reportData.map((row, rowIndex) => {
                                    const invIndex = selectedInvoice.findIndex(
                                        bill => stringCompare(bill?.Do_Inv_No, row?.Do_Inv_No)
                                    );
                                    const amount = selectedInvoice[invIndex] ? selectedInvoice[invIndex]?.newReceiptBillAmount : 0;
                                    const isChecked = invIndex !== -1;

                                    return (
                                        <tr key={rowIndex}>
                                            <td>{rowIndex + 1}</td>
                                            <td>{row?.Do_Inv_No}</td>
                                            <td>{row?.dataSource}</td>
                                            <td>{LocalDate(row?.Do_Date)}</td>
                                            <td>{NumberFormat(row?.Total_Invoice_value)}</td>
                                            <td>{NumberFormat(row?.totalReference)}</td>
                                            <td className="text-danger fw-bold">{NumberFormat(row?.receiptPendingAmount)}</td>
                                            <td className="p-0 vctr text-center" style={{ verticalAlign: 'middle' }}>
                                                <div className="d-flex align-items-center justify-content-center h-100 mt-1">
                                                    <input
                                                        className="form-check-input shadow-none pointer mx-2"
                                                        style={{ padding: '0.7em', marginTop: 0 }}
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
                                                            max={toNumber(row?.receiptPendingAmount)}
                                                            className="cus-inpt flex-grow-1 p-2 border-0 me-1 text-primary fw-bold"
                                                            onChange={e => onChangeAmount(row?.Do_Inv_No, e.target.value)}
                                                            placeholder={isChecked ? "Enter amount" : ''}
                                                            style={{ maxWidth: '150px' }}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions className="p-3">
                    <Button variant="outlined" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleConfirm}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default ReceiptReferences;
