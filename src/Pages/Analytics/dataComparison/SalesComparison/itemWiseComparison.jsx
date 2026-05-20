import { useEffect, useState } from "react";
import { fetchLink } from "../../../../Components/fetchComponent";
import { toArray } from "../../../../Components/functions";
import FilterableTable, { createCol } from "../../../../Components/filterableTable2";

const ItemWiseSalesComparison = ({ 
    loadingOn, 
    loadingOff, 
    Fromdate, 
    Todate,
    module = 'Sales',
    api = 'salesInvoice'  
}) => {
    const [ERPData, setERPData] = useState([]);
    const [filters, setFilters] = useState({
        comparisonDialog: false,
        excluedeSyced: 1
    })

    useEffect(() => {

        fetchLink({
            address: `
                analytics/dataComparison/${api}/itemWise?
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
                title={module + " unsynced list"}
                headerFontSizePx={12}
                bodyFontSizePx={12}
                EnableSerialNumber
                ExcelPrintOption
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
                    createCol('transactionDate', 'date', 'Date'),
                    createCol('invoiceNo', 'string', 'Voucher Number'),
                    createCol('VoucherTypeGet', 'string', 'Voucher'),
                    createCol('LedgerName', 'string', 'Ledger'),
                    createCol('ItemName', 'string', 'Item'),
                    createCol('GodownName', 'string', 'Godown'),
                    createCol('erpQty', 'number', 'E-Qty'),
                    createCol('tallyQty', 'number', 'T-Qty'),
                    createCol('erpRate', 'number', 'E-Rate'),
                    createCol('tallyRate', 'number', 'T-Rate'),
                    createCol('erpAmount', 'number', 'E-Amount'),
                    createCol('tallyAmount', 'number', 'T-Amount'),
                    createCol('Status', 'string', 'Reason'),
                ]}
            />
        </>
    )
}

export default ItemWiseSalesComparison;