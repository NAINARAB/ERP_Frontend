import { Button, Dialog, DialogContent, DialogTitle, DialogActions, IconButton } from "@mui/material";
import { Addition, checkIsNumber, isEqualNumber, NumberFormat, Subraction, toArray } from "../../../Components/functions";
import { receiptTypes } from "./variable";
import { Close, Search, Done } from "@mui/icons-material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import RequiredStar from "../../../Components/requiredStar";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { fetchLink } from "../../../Components/fetchComponent";
import { toast } from 'react-toastify';
import { useMemo } from "react";

const ChooseReceiptComponent = ({
    cellHeadStype = { width: '150px' },
    cellStyle = { minWidth: '130px' },
    initialSelectValue = { value: '', label: '' },
    receiptValue = {},
    receiptBillInfo = [],
    filters,
    baseData,
    setReceiptValue,
    updateFilterData,
    updateBaseData,
    closeDialog,
    loadingOn,
    loadingOff
}) => {

    const searchPayments = (debitAccount, creditAccount, receiptType) => {

        if (!checkIsNumber(receiptType)) return toast.warn('Select Bill Type')

        fetchLink({
            address: `payment/paymentMaster/search?debit_ledger=${debitAccount}&credit_ledger=${creditAccount}&receipt_bill_type=${receiptType}`,
            loadingOn,
            loadingOff
        }).then(data => {
            if (data.success) {
                updateBaseData('receiptInvoiceSearchResult', toArray(data.data))
            }
        })
    }

    const onSelectPayment = (invoiceDetails) => {
        setReceiptValue(pre => {
            return Object.fromEntries(
                Object.entries(pre).map(([key, value]) => [key, invoiceDetails[key] || value])
            )
        })
    }

    const TotalAgainstRef = useMemo(() => {
        return receiptBillInfo.reduce(
            (acc, invoice) => Addition(acc, invoice.Credit_Amo), 0
        )
    }, [receiptBillInfo]);

    const PendingAgainstRef = useMemo(() => {
        return Subraction(receiptValue.credit_amount, TotalAgainstRef)
    }, [TotalAgainstRef, receiptValue.credit_amount])

    return (
        <>
            {/* choose Payment */}
            <table className="table table-bordered fa-13">
                <tbody>
                    <tr>
                        <th className="text-primary fa-15 vctr" style={cellHeadStype}>Payment Details</th>
                        <th colSpan={5} className="text-end">
                            <Button
                                variant="outlined"
                                type="button"
                                onClick={() => updateFilterData('selectReceiptDialog', true)}
                            >Choose Payment</Button>
                        </th>
                    </tr>
                    <tr>
                        <th className="text-muted">Payment Type</th>
                        <td style={cellStyle}>
                            {receiptTypes.find(
                                type => isEqualNumber(type.value, receiptValue.receipt_bill_type)
                            ).label}
                        </td>

                        <th className="text-muted">Debit Account</th>
                        <td style={cellStyle}>{receiptValue.debit_ledger_name}</td>

                        <th className="text-muted">Payment Value</th>
                        <td style={cellStyle} className="text-primary fw-bold">{NumberFormat(receiptValue.credit_amount)}</td>
                    </tr>
                    <tr>
                        <th className="text-muted">Payment Invoice</th>
                        <td style={cellStyle}>{receiptValue.receipt_invoice_no}</td>

                        <th className="text-muted">Credit Account</th>
                        <td style={cellStyle}>{receiptValue.credit_ledger_name}</td>

                        <th className="text-muted">Pending Against Amount</th>
                        <td style={cellStyle} className="text-danger fw-bold">{NumberFormat(PendingAgainstRef)}</td>
                    </tr>
                </tbody>
            </table>

            <Dialog
                open={filters.selectReceiptDialog}
                onClose={closeDialog} fullScreen
            >
                <DialogTitle className="d-flex justify-content-between align-items-center">
                    <span>Choose Receipt </span>
                    <IconButton onClick={closeDialog}><Close color="error" /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <div className="row">

                        {/* Receipt type */}
                        <div className="col-lg-3 col-md-4 col-sm-6 col-12 p-2">
                            <label>Receipt Type<RequiredStar /></label>
                            <Select
                                value={filters.receiptType}
                                menuPortalTarget={document.body}
                                onChange={e => updateFilterData('receiptType', e)}
                                options={[
                                    { value: '', label: 'select', isDisabled: true },
                                    ...receiptTypes
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                required
                                placeholder={"Select payment type"}
                            />
                        </div>

                        {/* debit account */}
                        <div className="col-lg-3 col-md-4 col-sm-6 col-12 p-2">
                            <label>Debit Account</label>
                            <Select
                                value={filters.debitAccount}
                                menuPortalTarget={document.body}
                                onChange={e => updateFilterData('debitAccount', e)}
                                options={[
                                    { value: '', label: 'select', isDisabled: true },
                                    ...toArray(baseData.accounts).map(
                                        acc => ({
                                            value: acc.Acc_Id,
                                            label: acc.Account_name
                                        })
                                    )
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                required
                                placeholder={"Select Debit Account"}
                            />
                        </div>

                        {/* credit account */}
                        <div className="col-lg-3 col-md-4 col-sm-6 col-12 p-2">
                            <label>Credit Account</label>
                            <Select
                                value={filters.creditAccount}
                                menuPortalTarget={document.body}
                                onChange={e => updateFilterData('creditAccount', e)}
                                options={[
                                    { value: '', label: 'select', isDisabled: true },
                                    ...toArray(baseData.accounts).map(
                                        acc => ({
                                            value: acc.Acc_Id,
                                            label: acc.Account_name
                                        })
                                    )
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                required
                                placeholder={"Select Credit Account"}
                            />
                        </div>

                        <div className="col-lg-3 col-md-4 col-sm-6 col-12 p-2 d-flex flex-column">
                            <div className="mt-auto">
                                <Button
                                    variant="contained"
                                    startIcon={<Search />}
                                    onClick={() => searchPayments(
                                        filters.debitAccount.value,
                                        filters.creditAccount.value,
                                        filters.receiptType.value,
                                    )}
                                >
                                    Search
                                </Button>
                            </div>
                        </div>

                    </div>

                    <FilterableTable
                        title="Payments List"
                        EnableSerialNumber
                        headerFontSizePx={13}
                        bodyFontSizePx={12}
                        tableMaxHeight={450}
                        dataArray={baseData.receiptInvoiceSearchResult}
                        columns={[
                            createCol('receipt_invoice_no', 'string', 'InvoiceNo'),
                            createCol('receipt_date', 'date', 'Date'),
                            {
                                isVisible: 1,
                                ColumnHeader: 'Bill Type',
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    receiptTypes.find(type => isEqualNumber(type.value, row?.receipt_bill_type)).label
                                )
                            },
                            createCol('debit_ledger_name', 'string', 'Debit Acc'),
                            createCol('credit_ledger_name', 'string', 'Credit Acc'),
                            createCol('credit_amount', 'number', 'Amount'),
                            {
                                isVisible: 1,
                                ColumnHeader: 'Pending Ref Amount',
                                isCustomCell: true,
                                Cell: ({ row }) => Subraction(row?.credit_amount, row?.TotalReferenceAdded)
                            },
                            createCol('credit_amount', 'number', ''),
                            {
                                isVisible: 1,
                                ColumnHeader: 'Action',
                                isCustomCell: true,
                                Cell: ({ row }) => (
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            onSelectPayment(row);
                                            closeDialog();
                                            updateFilterData('receiptType', initialSelectValue);
                                            updateFilterData('debitAccount', initialSelectValue);
                                            updateFilterData('creditAccount', initialSelectValue);
                                        }}
                                    ><Done className="fa-20" /></IconButton>
                                )
                            }
                        ]}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ChooseReceiptComponent;