import { useEffect, useMemo, useState } from 'react';
import FilterableTable, { createCol } from '../../../Components/filterableTable2';
import { fetchLink } from '../../../Components/fetchComponent';
import { NumberFormat } from '../../../Components/functions';
import AppDialog from '../../../Components/appDialogComponent';
import AccountBalance from './accountBalance';

const OverallPartyOutstandings = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const [selectedParty, setSelectedParty] = useState(null);

    useEffect(() => {
        setReportData([]);
        fetchLink({
            address: `journal/overallPartyOutstandings`,
            loadingOn, loadingOff
        }).then(
            (data) => setReportData(data?.success ? data.data : [])
        ).catch(e => { console.error(e); setReportData([]); });

    }, []);

    const columns = [
        createCol('Account_name', 'string', 'Party Name'),
        createCol('totalDebit', 'number', 'Total Debit'),
        createCol('totalCredit', 'number', 'Total Credit'),
        createCol('overallBalance', 'number', 'Balance Amount'),
        createCol('balanceSide', 'string', 'Dr/Cr'),
        {
            isVisible: 1,
            ColumnHeader: 'Action',
            isCustomCell: true,
            Cell: ({ row }) => (
                <button
                    className="btn btn-sm btn-outline-info"
                    onClick={() => setSelectedParty(row)}
                    title="View Details"
                >
                    <i className="fa fa-info-circle"></i>
                </button>
            )
        }
    ];

    return (
        <>
            <FilterableTable
                title='Overall Party Outstandings'
                headerFontSizePx={12}
                bodyFontSizePx={12}
                EnableSerialNumber
                ExcelPrintOption
                PDFPrintOption
                dataArray={reportData}
                columns={columns}
            />

            <AppDialog
                open={selectedParty !== null}
                closeDialog={() => setSelectedParty(null)}
                title={`Bill-wise List - ${selectedParty?.Account_name}`}
                maxWidth="xl"
                fullScreen={true}
            >
                {selectedParty && (
                    <AccountBalance
                        loadingOn={loadingOn}
                        loadingOff={loadingOff}
                        propValue={selectedParty.Acc_Id}
                        propLabel={selectedParty.Account_name}
                    />
                )}
            </AppDialog>
        </>
    )
}

export default OverallPartyOutstandings;
