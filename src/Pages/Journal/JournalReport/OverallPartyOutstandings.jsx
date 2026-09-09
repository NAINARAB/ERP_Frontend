import { useEffect, useState } from 'react';
import { createCol } from '../../../Components/filterableTable2';
import { fetchLink } from '../../../Components/fetchComponent';
import AppTableComponent from '../../../Components/appTable/appTableComponent';

const OverallPartyOutstandings = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);

    useEffect(() => {
        setReportData([]);
        fetchLink({
            address: `journal/overallPartyOutstandings`,
            loadingOn, loadingOff
        }).then(data => {
            if (data?.success) {
                const formattedData = data.data.map(row => ({
                    ...row,
                    Dr: row.accountSide === 'Dr' ? Number(row.BalanceAmount) : 0,
                    Cr: row.accountSide === 'Cr' ? Number(row.BalanceAmount) : 0,
                }));
                setReportData(formattedData);
            } else {
                setReportData([]);
            }
        }).catch(e => { console.error(e); setReportData([]); });

    }, []);

    const columns = [
        createCol('Account_name', 'string', 'Party'),
        createCol('voucherNumber', 'string', 'Bill No'),
        createCol('eventDate', 'date', 'Date'),
        createCol('actualSource', 'string', 'Voucher'),
        createCol('Dr', 'number', 'Dr'),
        createCol('Cr', 'number', 'Cr'),
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
                dataArray={reportData}
                columns={columns}
                enableGlobalSearch={true}
                stateUrl='/erp/journal/overallPartyOutstandings'
                stateGroup='overallPartyOutstanding'
            />
        </>
    )
}

export default OverallPartyOutstandings;
