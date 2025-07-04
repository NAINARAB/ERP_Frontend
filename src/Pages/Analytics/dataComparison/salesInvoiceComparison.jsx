import { useEffect, useMemo, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { checkIsNumber, getPreviousDate, isEqualNumber, ISOString, stringCompare, toArray } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { comparisonColorCode, fieldMap } from "./variable";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Close, Search, Visibility } from "@mui/icons-material";


const ErpAndTallySalesComparison = ({ loadingOn, loadingOff, Fromdate, Todate }) => {
    const [ERPData, setERPData] = useState([]);
    const [TallyData, setTallyData] = useState([]);
    const [filters, setFilters] = useState({
        erpStatus: '',
        tallyStatus: '',
        comparisonDialog: false,
        erpRow: {},
        tallyRow: {},
        reload: false
    })

    useEffect(() => {

        fetchLink({
            address: `reports/dataComparison/salesInvoice/alterBased?Fromdate=${Fromdate}&Todate=${Todate}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                const erpData = toArray(data?.others?.ERPDifference);
                const tallyData = toArray(data?.others?.TallyDifference);

                setERPData(erpData.map(row => {
                    const isAvailableInTally = tallyData.find(comRow => isEqualNumber(
                        comRow?.tally_id, row?.Tally_Id
                    ));

                    return {
                        ...row,
                        RowStatus: isAvailableInTally ? 'Modified' : 'ONLY IN ERP',
                        statusCode: isAvailableInTally ? 3 : 1
                    }
                }));

                setTallyData(tallyData.map(row => {
                    const isAvailableInERP = erpData.find(comRow => isEqualNumber(
                        comRow?.Tally_Id, row?.tally_id
                    ));

                    return {
                        ...row,
                        RowStatus: isAvailableInERP ? 'Modified' : 'ONLY IN Tally',
                        statusCode: isAvailableInERP ? 3 : 2
                    }
                }));
            } else {
                setERPData([]);
                setTallyData([]);
            }
        }).catch(e => console.error(e));

    }, [Fromdate, Todate])

    function compareWithFieldMap(tallyObj, erpObj, fieldMap) {
        const result = [];

        for (const [label, [tallyKey, erpKey]] of Object.entries(fieldMap)) {
            const tallyVal = tallyObj[tallyKey] ?? '';
            const erpVal = erpObj[erpKey] ?? '';
            const status = String(tallyVal) === String(erpVal) ? 'Match' : 'Different';

            result.push({
                label,
                tallyValue: String(tallyVal),
                erpValue: String(erpVal),
                status,
            });
        }

        return result;
    }

    const closeDialg = () => {
        setFilters(pre => ({
            ...pre,
            comparisonDialog: false,
            erpRow: {},
            tallyRow: {}
        }))
    }

    const rows = useMemo(() => {
        return compareWithFieldMap(filters.tallyRow, filters.erpRow, fieldMap)
    }, [filters.erpRow, filters.tallyRow, fieldMap]);

    console.log(ERPData, TallyData)

    return (
        <>
            <div className="row p-2">

                <div className="col-lg-6 p-2">
                    <FilterableTable
                        title="ERP Miss-Matched"
                        headerFontSizePx={12}
                        bodyFontSizePx={12}
                        EnableSerialNumber
                        ButtonArea={
                            <>
                                <select
                                    className="cus-inpt p-2 w-auto"
                                    value={filters.erpStatus}
                                    onChange={e => setFilters(pre => ({ ...pre, erpStatus: e.target.value }))}
                                >
                                    <option value="">All Type</option>
                                    <option value="1">ERP only</option>
                                    <option value="3">Modified</option>
                                    <option value="4">Child</option>
                                </select>
                                <label className="me-1">Error Type:</label>
                            </>
                        }
                        dataArray={
                            (checkIsNumber(filters.erpStatus)
                                ? ERPData.filter(row => isEqualNumber(row.statusCode, filters.erpStatus))
                                : ERPData).sort(
                                    (a, b) => String(a?.Do_Inv_No || '').localeCompare(String(b?.Do_Inv_No || ''))
                                )
                        }
                        columns={[
                            createCol('Do_Inv_No', 'string', 'Voucher Number'),
                            createCol('Do_Date', 'date', 'Date'),
                            createCol('Total_Invoice_value', 'number', 'Invoice Value'),
                            createCol('RowStatus', 'string', 'Reason'),
                            // {
                            //     isVisible: 1,
                            //     ColumnHeader: 'Code',
                            //     isCustomCell: true,
                            //     Cell: ({ row }) => {
                            //         const statusColor = comparisonColorCode.find(
                            //             statusList => stringCompare(statusList.code, row.statusCode)
                            //         ).color;

                            //         return (
                            //             <div
                            //                 style={{
                            //                     height: '25px',
                            //                     width: '25px',
                            //                     borderRadius: '100%',
                            //                     backgroundColor: statusColor
                            //                 }}
                            //                 className="rounded-5"
                            //             ></div>
                            //         )
                            //     }
                            // },
                            {
                                isVisible: 1,
                                ColumnHeader: 'Preview Invoice',
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    const tallyRow = TallyData.find(comRow => isEqualNumber(
                                        comRow?.tally_id, row?.Tally_Id
                                    ));

                                    return (
                                        <IconButton
                                            size="small"
                                            onClick={() => setFilters(pre => ({
                                                ...pre,
                                                comparisonDialog: true,
                                                erpRow: row,
                                                tallyRow: tallyRow || {}
                                            }))}
                                        ><Visibility /></IconButton>
                                    )
                                }
                            }
                        ]}
                    />
                </div>

                <div className="col-lg-6 p-2">
                    <FilterableTable
                        title="Tally Miss-Matched"
                        headerFontSizePx={12}
                        bodyFontSizePx={12}
                        EnableSerialNumber
                        ButtonArea={
                            <>
                                <select
                                    className="cus-inpt p-2 w-auto"
                                    value={filters.tallyStatus}
                                    onChange={e => setFilters(pre => ({ ...pre, tallyStatus: e.target.value }))}
                                >
                                    <option value="">All Type</option>
                                    <option value="2">Tally only</option>
                                    <option value="3">Modified</option>
                                    <option value="4">Child</option>
                                </select>
                                <label className="me-1">Error Type:</label>
                            </>
                        }
                        dataArray={(
                            checkIsNumber(filters.tallyStatus)
                                ? TallyData.filter(row => isEqualNumber(row.statusCode, filters.tallyStatus))
                                : TallyData
                        ).sort(
                            (a, b) => String(a?.invoice_no || '').localeCompare(String(b?.invoice_no || ''))
                        )}
                        columns={[
                            createCol('invoice_no', 'string', 'Voucher Number'),
                            createCol('invoice_date', 'date', 'Date'),
                            createCol('total_invoice_value', 'number', 'Invoice Value'),
                            createCol('RowStatus', 'string', 'Reason'),
                            // {
                            //     isVisible: 1,
                            //     ColumnHeader: 'Code',
                            //     isCustomCell: true,
                            //     Cell: ({ row }) => {
                            //         const statusColor = comparisonColorCode.find(
                            //             statusList => stringCompare(statusList.code, row.statusCode)
                            //         ).color;

                            //         return (
                            //             <div
                            //                 style={{
                            //                     height: '25px',
                            //                     width: '25px',
                            //                     borderRadius: '100%',
                            //                     backgroundColor: statusColor
                            //                 }}
                            //                 className="rounded-5"
                            //             ></div>
                            //         )
                            //     }
                            // },
                            {
                                isVisible: 1,
                                ColumnHeader: 'Preview Invoice',
                                isCustomCell: true,
                                Cell: ({ row }) => {
                                    const erpRow = ERPData.find(comRow => isEqualNumber(
                                        comRow?.Tally_Id, row?.tally_id
                                    ));

                                    return (
                                        <IconButton
                                            size="small"
                                            onClick={() => setFilters(pre => ({
                                                ...pre,
                                                comparisonDialog: true,
                                                tallyRow: row,
                                                erpRow: erpRow,
                                            }))}
                                        ><Visibility /></IconButton>
                                    )
                                }
                            }
                        ]}
                    />
                </div>

            </div>

            <Dialog
                open={filters.comparisonDialog}
                onClose={closeDialg} fullWidth maxWidth='md'
            >
                <DialogTitle className="d-flex justify-content-between align-items-center">
                    <span>Invoice Difference</span>
                    <IconButton
                        size="small"
                        onClick={closeDialg}
                    ><Close color='error' /></IconButton>
                </DialogTitle>
                <DialogContent>
                    <div className="table-responsive ">
                        <h2 className="text-xl font-bold mb-4">ERP vs Tally Comparison</h2>
                        <table className="table table-bordered border-gray-300">
                            <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th>Field</th>
                                    <th>Tally DB</th>
                                    <th>ERP DB</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map(({ label, tallyValue, erpValue, status }, idx) => (
                                    <tr key={idx} className={status === 'Different' ? 'bg-red-100' : 'bg-white'}>
                                        <td className=" font-medium">{label}</td>
                                        <td>{tallyValue}</td>
                                        <td>{erpValue}</td>
                                        <td className={`p-2 border font-semibold ${status === 'Different' ? 'text-red-600' : 'text-green-600'}`}>
                                            {status}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions></DialogActions>
            </Dialog>
        </>
    )
}

export default ErpAndTallySalesComparison;