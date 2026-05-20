import { useEffect, useMemo, useState } from "react";
import { ISOString, NumberFormat, LocalDate, reactSelectFilterLogic, isEqualNumber, toNumber, Addition, isValidNumber } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import AppTableComponent from "../../../Components/appTable/appTableComponent";
import { Tooltip, IconButton } from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import AppDialog from "../../../Components/appDialogComponent";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from "react-toastify";


const createCol = (field = '', type = 'string', ColumnHeader = '', align = 'left', verticalAlign = 'center', isVisible = 1) => ({
    isVisible: isVisible,
    Field_Name: field,
    Fied_Data: type,
    align,
    verticalAlign,
    ...(ColumnHeader && { ColumnHeader })
});

const ExpendableComponent = ({ row }) => {
    return (
        <>
            <h6 className="fw-bold mb-2">Sales Against Reference</h6>
            <table className="table table-bordered table-sm mt-2 fa-12">
                <thead className="bg-light">
                    <tr>
                        {['Sno', 'Date', 'Sales InvoiceNo', 'Invoice Value', 'Payment Amount'].map(
                            col => <th className="p-2 fa-12">{col}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {row.billRef?.map((bill, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{LocalDate(bill.billDate)}</td>
                            <td>{bill.invoiceVoucherNumber}</td>
                            <td>{NumberFormat(bill.invoiceValue)}</td>
                            <td>{NumberFormat(bill.paidAmount)}</td>
                        </tr>
                    ))}
                    <tr>
                        <td colSpan="5" className="text-end">Total</td>
                        <td>{NumberFormat(row.billRef?.reduce((acc, bill) => Addition(acc, bill.paidAmount), 0))}</td>
                    </tr>
                </tbody>
            </table>

            <br />
            <h6 className="fw-bold mb-2">Contra Reference</h6>
            <table className="table table-bordered table-sm mt-2 fa-12">
                <thead>
                    <tr>
                        {['Voucher No', 'Date', 'Amount', 'Cheque Date', 'Bank Date', 'Narration'].map(
                            col => <th>{col}</th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {row.contraRef?.map((contra, index) => (
                        <tr key={index}>
                            <td>{contra.contraVoucherNumber}</td>
                            <td>{LocalDate(contra.contraDate)}</td>
                            <td>{NumberFormat(contra.contraAmount)}</td>
                            <td>{contra.chequeDate ? LocalDate(contra.chequeDate) : ''}</td>
                            <td>{contra.bankDate ? LocalDate(contra.bankDate) : ''}</td>
                            <td>{contra.narration}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

const ReceiptChequeTransaction = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);

    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        debitAccount: { value: "", label: "ALL" },
        creditAccount: { value: "", label: "ALL" },
        voucherType: { value: '', label: 'ALL' },
        partyType: 'ALL',
        filterDailog: false,
        chequeAccounts: []
    })

    useEffect(() => {
        fetchLink({
            address: `contra/receiptReference/chequeAccounts`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setFilters(pre => ({ ...pre, chequeAccounts: data.data }));
            }
        }).catch(e => console.error(e));
    }, []);

    const fetchData = () => {
        const { Fromdate, Todate, debitAccount } = filters;
        if (!isValidNumber(debitAccount.value)) return toast.error("Please Select Debit Account");

        fetchLink({
            address: `receipt/chequeTransaction?
            Fromdate=${Fromdate}&
            Todate=${Todate}&
            debitAccount=${debitAccount.value}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setReportData(data.data)
            }
        }).catch(e => console.error(e))
    }

    const closeDialog = () => {
        setFilters(pre => ({ ...pre, filterDailog: false }));
    }

    const uniqueDropDown = useMemo(() => {

        const creditAccount = Array.from(
            new Map(
                reportData.map(item => [
                    item.credit_ledger,
                    { value: item.credit_ledger, label: item.creditAccountGet }
                ])
            ).values()
        );

        const voucherType = Array.from(
            new Map(
                reportData.map(item => [
                    item.receipt_voucher_type_id,
                    { value: item.receipt_voucher_type_id, label: item.voucherTypeGet }
                ])
            ).values()
        );

        return {
            creditAccount,
            voucherType
        }
    }, [reportData])

    const filteredData = useMemo(() => {
        return reportData.filter(item => {
            const matchesCredit = filters.creditAccount.value === '' || isEqualNumber(item.credit_ledger, filters.creditAccount.value);
            const matchesVoucher = filters.voucherType.value === '' || isEqualNumber(item.receipt_voucher_type_id, filters.voucherType.value);
            const matchesPartyType =
                filters.partyType === 'ALL'
                || (
                    filters.partyType === 'Pending Party'
                    && toNumber(item?.contraRef?.length) === 0
                ) || (
                    filters.partyType === 'Payed Party'
                    && toNumber(item?.contraRef?.length) > 0
                )

            return matchesCredit && matchesVoucher && matchesPartyType;
        });
    }, [reportData, filters])

    return (
        <>
            <AppTableComponent
                title="Cheque Transaction Details"
                dataArray={filteredData}
                EnableSerialNumber
                ExcelPrintOption={true}
                PDFPrintOption={true}
                columns={[
                    createCol("receipt_date", "date", "Rec.Date"),
                    createCol("receipt_invoice_no", "string", "Rec.No"),
                    createCol("voucherTypeGet", "string", "VchType"),
                    createCol("creditAccountGet", "string", "Party Name"),
                    createCol("check_no", "string", "Chq.No"),
                    createCol("check_date", "date", "Chq.Date"),
                    createCol("bank_date", "date", "Bank.Date"),
                    createCol("debit_amount", "number", "Debit"),
                    createCol("credit_amount", "number", "Credit"),
                ]}
                ButtonArea={
                    <>
                        <Tooltip title="Filters">
                            <IconButton
                                size="small"
                                onClick={() => setFilters({ ...filters, filterDailog: true })}
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                    </>
                }
                isExpendable={true}
                tableMaxHeight={550}
                expandableComp={(props) => (
                    <ExpendableComponent {...props} />
                )}
            />

            <AppDialog
                open={filters.filterDailog}
                onClose={closeDialog}
                title="Filters"
                maxWidth="md"
                fullWidth
                onSubmit={() => {
                    closeDialog();
                    fetchData();
                }}
                disableSubmit={!isValidNumber(filters.debitAccount.value)}
            >
                <div className="table-responsive pb-4">
                    <table className="table">
                        <tbody>
                            <tr>
                                <td style={{ verticalAlign: "middle" }}>From</td>
                                <td>
                                    <input
                                        type="date"
                                        value={filters.Fromdate}
                                        onChange={(e) =>
                                            setFilters({ ...filters, Fromdate: e.target.value })
                                        }
                                        className="cus-inpt"
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{ verticalAlign: "middle" }}>To</td>
                                <td>
                                    <input
                                        type="date"
                                        value={filters.Todate}
                                        onChange={(e) =>
                                            setFilters({ ...filters, Todate: e.target.value })
                                        }
                                        className="cus-inpt"
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{ verticalAlign: "middle" }}>Debit Account</td>
                                <td>
                                    <Select
                                        value={filters?.debitAccount}
                                        onChange={(e) => setFilters({ ...filters, debitAccount: e })}
                                        options={[
                                            { value: "", label: "ALL" },
                                            ...filters.chequeAccounts,
                                        ]}
                                        styles={customSelectStyles}
                                        isSearchable={true}
                                        placeholder={"Debit Account"}
                                        filterOption={reactSelectFilterLogic}
                                        menuPortalTarget={document.body}
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{ verticalAlign: "middle" }}>Credit Account</td>
                                <td>
                                    <Select
                                        value={filters?.creditAccount}
                                        onChange={(e) =>
                                            setFilters((pre) => ({ ...pre, creditAccount: e }))
                                        }
                                        options={[
                                            { value: "", label: "ALL" },
                                            ...uniqueDropDown.creditAccount,
                                        ]}
                                        styles={customSelectStyles}
                                        isSearchable={true}
                                        placeholder={"Credit Account"}
                                        filterOption={reactSelectFilterLogic}
                                        menuPortalTarget={document.body}
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td style={{ verticalAlign: "middle" }}>Voucher Type</td>
                                <td>
                                    <Select
                                        value={filters?.voucherType}
                                        onChange={(e) => setFilters({ ...filters, VoucherType: e })}
                                        options={[
                                            { value: "", label: "ALL" },
                                            ...uniqueDropDown.voucherType,
                                        ]}
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                        isSearchable={true}
                                        placeholder={"Voucher Name"}
                                        filterOption={reactSelectFilterLogic}
                                    />
                                </td>
                            </tr>

                            <tr>
                                <td>Party Type</td>
                                <td>
                                    <select
                                        value={filters.partyType}
                                        onChange={e => setFilters(pre => ({ ...pre, partyType: e.target.value }))}
                                        className="cus-inpt p-2"
                                    >
                                        <option value="ALL">ALL</option>
                                        <option value="Pending Party">Pending Party</option>
                                        <option value="Payed Party">Payed Party</option>
                                    </select>
                                </td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </AppDialog>
        </>
    )
}

export default ReceiptChequeTransaction;