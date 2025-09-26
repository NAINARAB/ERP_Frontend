import { useEffect, useMemo, useState } from 'react';
import FilterableTable, { createCol } from '../../../Components/filterableTable2';
import { Addition, checkIsNumber, NumberFormat, reactSelectFilterLogic, Subraction, toNumber } from '../../../Components/functions';
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { fetchLink } from '../../../Components/fetchComponent';

const AccountBalance = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const [accountOptions, setAccountOptions] = useState([]);
    const [filters, setFilters] = useState({
        account: { value: '', label: 'Select Account' },
        DrCr: 'Dr & Cr'
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
            address: `journal/accountPendingReference?Acc_Id=${filters.account.value}`,
            loadingOn, loadingOff
        }).then(
            (data) => setReportData(data?.success ? data.data : [])
        ).catch(e => { console.error(e); setReportData([]); });

    }, [filters.account.value]);

    const DebitTotal = reportData.filter(
        item => item.accountSide === 'Dr'
    ).reduce(
        (acc, orders) => Addition(acc, orders?.totalValue), 0
    );

    const CreditTotal = reportData.filter(
        item => item.accountSide === 'Cr'
    ).reduce(
        (acc, orders) => Addition(acc, orders?.totalValue), 0
    );

    const dataArray = useMemo(() => {
        if (filters.DrCr === 'Dr & Cr') return reportData;
        return reportData.filter(item => item.accountSide === filters.DrCr);
    }, [reportData, filters.DrCr])

    return (
        <>
            <FilterableTable
                title='Account Balance'
                headerFontSizePx={12}
                bodyFontSizePx={12}
                EnableSerialNumber
                ExcelPrintOption
                PDFPrintOption
                ButtonArea={
                    <>
                        <select
                            value={filters.DrCr}
                            onChange={e => setFilters(pre => ({ ...pre, DrCr: e.target.value }))}
                            className='cus-inpt p-2 w-auto ms-2'
                        >
                            <option value="Dr & Cr">Dr & Cr</option>
                            <option value="Dr">Dr</option>
                            <option value="Cr">Cr</option>
                        </select>
                        <div style={{ minWidth: '350px' }}>
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
                        </div>

                        {/* credit */}
                        <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
                            {toNumber(CreditTotal) > 0 && <h6 className="m-0 text-end text-muted px-3">Credit: {NumberFormat(CreditTotal)}</h6>}
                        </span>

                        {/* debit */}
                        <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
                            {toNumber(DebitTotal) > 0 && <h6 className="m-0 text-end text-muted px-3">Debit: {NumberFormat(DebitTotal)}</h6>}
                        </span>
                    </>
                }
                dataArray={dataArray}
                columns={[
                    createCol('voucherNumber', 'string', 'Voucher-Number'),
                    createCol('eventDate', 'date', 'Date'),
                    createCol('actualSource', 'string', 'Source'),
                    createCol('accountSide', 'string', 'Dr/Cr'),
                    createCol('totalValue', 'string', 'Total'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Pending',
                        isCustomCell: true,
                        Cell: ({ row }) => Subraction(row?.totalValue, (Addition(row?.againstAmount, row?.journalAdjustment)))
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Total Ref',
                        isCustomCell: true,
                        Cell: ({ row }) => Addition(row?.againstAmount, row?.journalAdjustment)
                    },
                    createCol('againstAmount', 'string', 'Pay/Rec'),
                    createCol('journalAdjustment', 'string', 'Journal'),
                ]}
            />
        </>
    )
}

export default AccountBalance;