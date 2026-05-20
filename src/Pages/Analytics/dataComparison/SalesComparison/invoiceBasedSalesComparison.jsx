import { useEffect, useMemo, useState } from "react";
import { fetchLink } from "../../../../Components/fetchComponent";
import { checkIsNumber, getPreviousDate, isEqualNumber, ISOString, stringCompare, toArray } from "../../../../Components/functions";
import FilterableTable, { createCol } from "../../../../Components/filterableTable2";
import { comparisonColorCode, fieldMap } from "../variable";
import { Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Close, Search, Visibility } from "@mui/icons-material";


const InvoiceBasedSalesComparison = ({ loadingOn, loadingOff, Fromdate, Todate }) => {
    const [ERPData, setERPData] = useState([]);
    const [filters, setFilters] = useState({
        comparisonDialog: false,
        excluedeSyced: 1
    })

    useEffect(() => {

        fetchLink({
            address: `
                analytics/dataComparison/salesInvoice/invoiceBased?
                Fromdate=${Fromdate}&
                Todate=${Todate}&
                excluedeSyced=${filters.excluedeSyced}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                const erpData = toArray(data?.data);
                setERPData(erpData)
            } else {
                setERPData([]);
            }
        }).catch(e => console.error(e));

    }, [Fromdate, Todate, filters.excluedeSyced])

    return (
        <>
            <FilterableTable
                title="Sales unsynced list"
                headerFontSizePx={12}
                bodyFontSizePx={12}
                EnableSerialNumber
                ButtonArea={
                    <>
                        <select
                            className="cus-inpt p-2 w-auto"
                            value={filters.excluedeSyced}
                            onChange={e => setFilters(pre => ({ ...pre, excluedeSyced: e.target.value }))}
                        >
                            <option value="0">Show Synced</option>
                            <option value="1">Exclude Synced</option>
                        </select>
                        {/* <label className="me-1">Error Type:</label> */}
                    </>
                }
                dataArray={ERPData}
                columns={[
                    createCol('Do_Date', 'date', 'Date'),
                    createCol('Do_Inv_No', 'string', 'Voucher Number'),
                    createCol('Retailer_Name', 'string', 'Ledger'),
                    createCol('Total_Invoice_value', 'number', 'Invoice Value'),
                    createCol('erpChildCount', 'number', 'ERP-Products'),
                    createCol('erpChildQuantity', 'number', 'ERP Bill Quantity'),
                    createCol('tallyChildCount', 'number', 'Tally-Products'),
                    createCol('tallyChildQuantity', 'number', 'Tally Bill Quantity'),
                    createCol('RowStatus', 'string', 'Reason'),
                ]}
            />
        </>
    )
}

export default InvoiceBasedSalesComparison;