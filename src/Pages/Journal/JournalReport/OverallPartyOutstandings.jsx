import { useEffect, useState } from 'react';
import { createCol } from '../../../Components/filterableTable2';
import { fetchLink } from '../../../Components/fetchComponent';
import AppTableComponent from '../../../Components/appTable/appTableComponent';
import { ISOString, stringCompare } from '../../../Components/functions';

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
            address: `journal/overallPartyOutstandingsSP`,
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

    return (
        <>
            <AppTableComponent
                title='Overall Party Outstandings'
                headerFontSizePx={12}
                bodyFontSizePx={12}
                EnableSerialNumber
                ExcelPrintOption
                PDFPrintOption
                dataArray={config.view === 'Debtors' ? receivables : payables}
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
                    </>
                }
            />
        </>
    )
}

export default OverallPartyOutstandings;
