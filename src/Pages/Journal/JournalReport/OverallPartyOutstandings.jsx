import { useEffect, useState } from 'react';
import { createCol } from '../../../Components/filterableTable2';
import { fetchLink } from '../../../Components/fetchComponent';
import AppTableComponent from '../../../Components/appTable/appTableComponent';
import { ISOString, stringCompare } from '../../../Components/functions';
import { useMemo } from 'react';

const OverallPartyOutstandings = ({ loadingOn, loadingOff }) => {

    const [receivables, setReceivables] = useState([]);
    const [payables, setPayables] = useState([]);

    const [config, setConfig] = useState({
        view: 'Debtors', // Debtors, Creditors
        reqDate: ISOString()
    })

    useEffect(() => {
        setReceivables([]);
        setPayables([]);
        fetchLink({
            address: `journal/overallPartyOutstandingsSP?reqDate=${config.reqDate}`,
            loadingOn, loadingOff
        }).then(({ others, success }) => {
            if (success) {
                setReceivables(others.receivables);
                setPayables(others.payables);
            } else {
                setReceivables([]);
                setPayables([]);
            }
        }).catch(e => { console.error(e); setReceivables([]); setPayables([]); });
    }, []);

    const columns = [
        createCol('Account_name', 'string', 'Party'),
        createCol('invoice_no', 'string', 'Voucher'),
        createCol('invoice_date', 'date', 'Date'),
        createCol('drAmount', 'number', 'Receivable'),
        createCol('crAmount', 'number', 'Payable'),
        // {
        //     isCustomCell: true,
        //     ColumnHeader: 'Receivable',
        //     isVisible: 1,
        //     Cell: ({ row }) => stringCompare(row?.CR_DR, 'DR') ? row?.Bal_Amount : '-'
        // },
        // {
        //     isCustomCell: true,
        //     ColumnHeader: 'Payable',
        //     isVisible: 1,
        //     Cell: ({ row }) => stringCompare(row?.CR_DR, 'CR') ? row?.Bal_Amount : '-'
        // }
    ];

    const filteredReceivables = useMemo(() => {
        return receivables.filter(
            r => r.invoice_date <= config.reqDate
        ).sort((a, b) => {
            const accountCompare = String(a.Account_name).localeCompare(
                String(b.Account_name)
            );

            if (accountCompare !== 0) {
                return accountCompare;
            }

            return (
                new Date(a.invoice_date).getTime() -
                new Date(b.invoice_date).getTime()
            );
        })
    }, [receivables, config.reqDate])

    const filteredPayables = useMemo(() => {
        return payables.filter(
            r => r.invoice_date <= config.reqDate
        ).sort((a, b) => {
            const accountCompare = String(a.Account_name).localeCompare(
                String(b.Account_name)
            );

            if (accountCompare !== 0) {
                return accountCompare;
            }

            return (
                new Date(a.invoice_date).getTime() -
                new Date(b.invoice_date).getTime()
            );
        })
    }, [payables, config.reqDate])

    return (
        <>
            <AppTableComponent
                title='Overall Party Outstandings'
                headerFontSizePx={12}
                bodyFontSizePx={12}
                EnableSerialNumber
                ExcelPrintOption
                PDFPrintOption
                dataArray={config.view === 'Debtors' ? filteredReceivables : filteredPayables}
                columns={columns}
                enableGlobalSearch={true}
                stateUrl='/erp/journal/overallPartyOutstandings'
                stateGroup='overallPartyOutstanding'
                ButtonArea={
                    <>
                        <select onChange={(e) => setConfig(prev => ({ ...prev, view: e.target.value }))} value={config.view}>
                            <option value="Debtors">Debtors</option>
                            <option value="Creditors">Creditors</option>
                        </select>
                        <input
                            type="date"
                            value={config.reqDate}
                            onChange={e => setConfig(ex => ({ ...ex, reqDate: e.target.value }))}
                        />
                    </>
                }
            />
        </>
    )
}

export default OverallPartyOutstandings;
