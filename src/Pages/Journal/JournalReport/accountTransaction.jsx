import { useEffect, useMemo, useState } from 'react';
import { createCol } from '../../../Components/filterableTable2';
import { Addition, checkIsNumber, ISOString, isValidNumber, NumberFormat, reactSelectFilterLogic, Subraction, toNumber } from '../../../Components/functions';
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { fetchLink } from '../../../Components/fetchComponent';
import AppTableComponent from '../../../Components/appTable/appTableComponent';
import AppDialog from '../../../Components/appDialogComponent';
import { IconButton } from '@mui/material';
import { FilterAlt } from '@mui/icons-material';

const AccountTransaction = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        status: { value: 'ALL', label: 'All Bills' },
        account: { value: '', label: 'Select Account' },
        refreshCount: 0,
        filterDailog: false
    });

    useEffect(() => {
        fetchLink({ address: `journal/accounts` })
            .then((data) => setAccountOptions(data?.success ? data.data : []))
            .catch(() => setAccountOptions([]));
    }, [])

    useEffect(() => {
        if (!checkIsNumber(filters.account.value)) return setReportData([]);

        setReportData([]);
        fetchLink({
            address: `journal/accountTransaction?Acc_Id=${filters.account.value}&Fromdate=${filters.Fromdate}&Todate=${filters.Todate}`,
            loadingOn, loadingOff
        }).then(
            (data) => setReportData(data?.success ? data.data : [])
        ).catch(e => { console.error(e); setReportData([]); });

    }, [filters.refreshCount]);

    const filteredReportData = useMemo(() => {
        if (!reportData || !reportData.length) return [];
        const status = filters.status?.value || 'ALL';
        if (status === 'ALL') return reportData;
        if (status === 'COMPLETED') return reportData.filter(row => row.isCompleted);
        if (status === 'PENDING') return reportData.filter(row => !row.isCompleted);
        return reportData;
    }, [reportData, filters.status]);

    const debitTotal = useMemo(() => filteredReportData.reduce((acc, obj) => Addition(acc, obj.Debit_Amt), 0), [filteredReportData])
    const creditTotal = useMemo(() => filteredReportData.reduce((acc, obj) => Addition(acc, obj.Credit_Amt), 0), [filteredReportData])

    const difference = useMemo(() => {
        if (debitTotal > creditTotal) return { amount: Subraction(debitTotal, creditTotal), side: 'Dr' }
        return { amount: Subraction(creditTotal, debitTotal), side: 'Cr' }
    }, [debitTotal, creditTotal])

    const closeDialog = () => setFilters(pre => ({ ...pre, filterDailog: false }));

    const refresh = () => setFilters(pre => ({ ...pre, refreshCount: pre.refreshCount + 1 }));

    return (
        <>
            <AppTableComponent
                title='Account Balance'
                stateUrl="/erp/journal/accountTransaction"
                stateGroup="accountTransaction"
                headerFontSizePx={12}
                bodyFontSizePx={12}
                EnableSerialNumber
                ExcelPrintOption
                PDFPrintOption
                ButtonArea={
                    <>

                        {/* debit total */}
                        {toNumber(debitTotal) > 0 &&
                            <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
                                <h6 className="m-0 text-end text-muted px-3">Debit: {NumberFormat(debitTotal)}</h6>
                            </span>
                        }

                        {/* credit total */}
                        {toNumber(creditTotal) > 0 &&
                            <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
                                <h6 className="m-0 text-end text-muted px-3">Credit: {NumberFormat(creditTotal)}</h6>
                            </span>
                        }

                        {/* difference */}
                        {toNumber(difference?.amount) > 0 &&
                            <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
                                <h6 className="m-0 text-end text-muted px-3">Balance {difference?.side}: {NumberFormat(difference?.amount)}</h6>
                            </span>
                        }

                        <IconButton
                            onClick={() => setFilters(pre => ({ ...pre, filterDailog: true }))}
                        ><FilterAlt /></IconButton>
                    </>
                }
                dataArray={filteredReportData}
                isExpendable={true}
                expandableComp={({ row }) => <ReferencesExpandedComp row={row} />}
                columns={[
                    createCol('invoice_no', 'string', 'Voucher-Number'),
                    createCol('Ledger_Date', 'date', 'Date'),
                    createCol('Ledger_Desc', 'string', 'Description'),
                    createCol('Particulars', 'string'),
                    createCol('Credit_Amt', 'number', 'Credit'),
                    createCol('Debit_Amt', 'number', 'Debit'),
                    createCol('Invoice_Month', 'string', 'Month'),
                    createCol('Invoice_Year', 'string', 'Month-Year'),
                    createCol('Account_name', 'string', 'Account'),
                    createCol('Narration', 'string', 'Narration 1'),
                    createCol('Line_Naration', 'string', 'Narration 2'),
                ]}
            />

            <AppDialog
                open={filters.filterDailog}
                onClose={closeDialog}
                title="Filters"
                maxWidth="md"
                fullWidth
                onSubmit={() => {
                    closeDialog();
                    refresh();
                }}
                disableSubmit={!isValidNumber(filters.account.value)}
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
                                <td style={{ verticalAlign: "middle" }}>Status</td>
                                <td>
                                    <Select
                                        placeholder="Select status"
                                        value={filters.status}
                                        options={[
                                            { value: 'ALL', label: 'All Bills' },
                                            { value: 'COMPLETED', label: 'Completed Bills' },
                                            { value: 'PENDING', label: 'Pending Bills' },
                                        ]}
                                        onChange={(e) => setFilters({ ...filters, status: e })}
                                        isSearchable={false}
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td style={{ verticalAlign: "middle" }}>Debit Account</td>
                                <td>
                                    <Select
                                        placeholder="Select account"
                                        value={filters.account}
                                        options={accountOptions}
                                        onChange={(e) => setFilters({ ...filters, account: e })}
                                        isSearchable
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                        filterOption={reactSelectFilterLogic}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </AppDialog>
        </>
    )
}

const ReferencesExpandedComp = ({ row }) => {
    if (!row?.references || row.references.length === 0) {
        return <div className="p-3 text-muted">No against references found.</div>;
    }

    return (
        <div className="">
            <h6 className="mb-2">Against References</h6>
            <table className="table table-sm table-bordered bg-white">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Voucher No</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {row.references.map((ref, idx) => (
                        <tr key={idx}>
                            <td>{new Date(ref.eventDate).toLocaleDateString()}</td>
                            <td>{ref.type}</td>
                            <td>{ref.sourceVoucher}</td>
                            <td className="text-end">{NumberFormat(ref.amount)}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr>
                        <td colSpan={3} className="text-end fw-bold">Balance Amount</td>
                        <td className="text-end fw-bold text-danger">{NumberFormat(row.BalanceAmount)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    );
};

export default AccountTransaction;