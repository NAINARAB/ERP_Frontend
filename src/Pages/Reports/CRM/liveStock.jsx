import { useEffect, useMemo, useState } from "react"
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, checkIsNumber, isEqualNumber, NumberFormat, reactSelectFilterLogic, toArray } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import ClosingStockLedgerProductDetails from "./productDetailsComp";


const ClosingStockRetailerBasedReport = ({ loadingOn, loadingOff, Fromdate, Todate }) => {
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        retailer: { value: '', label: 'Search Retailer' }
    })

    useEffect(() => {

        fetchLink({
            address: `reports/customerClosingStock/retailerBased?Fromdate=${Fromdate}&Todate=${Todate}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                const dataValue = toArray(data.data);
                setReportData(dataValue)
            }
        }).catch(e => console.error(e))
    }, [Fromdate, Todate]);

    const sumValue = useMemo(() => {
        return reportData.reduce(
            (acc, item) => Addition(acc, item?.liveStockValue), 0
        )
    }, [reportData])

    return (
        <FilterableTable
            title={`Live Stock: ${NumberFormat(sumValue)}`}
            EnableSerialNumber
            dataArray={
                checkIsNumber(filters.retailer.value)
                    ? reportData.filter(
                        row => isEqualNumber(row.Retailer_Id, filters.retailer.value)
                    )
                    : reportData
            }
            ButtonArea={
                <>
                    <div style={{ minWidth: '360px' }}>
                        <Select
                            value={filters.retailer}
                            menuPortalTarget={document.body}
                            onChange={e => setFilters(pre => ({ ...pre, retailer: e }))}
                            options={[
                                { value: '', label: 'ALL' },
                                ...reportData.sort(
                                    (a, b) => String(a?.Retailer_Name).localeCompare(String(b?.Retailer_Name))
                                ).map(item => ({
                                    value: item.Retailer_Id,
                                    label: item.Retailer_Name
                                }))
                            ]}
                            styles={customSelectStyles}
                            isSearchable={true}
                            required
                            placeholder={"Select Retailer"}
                            filterOption={reactSelectFilterLogic}
                        />
                    </div>
                </>
            }
            columns={[
                createCol('Retailer_Name', 'string', 'Customer'),
                createCol('deliveryDisplayDate', 'string', 'Entry Date'),
                createCol('closingDisplayDate', 'string', 'Update Date'),
                createCol('entryDays', 'number', 'Entry Days'),
                createCol('updateDays', 'number', 'Update Days'),
                createCol('liveStockValue', 'number', 'Stock Value'),
            ]}
            isExpendable={true}
            expandableComp={({ row }) => (
                <ClosingStockLedgerProductDetails
                    Retailer_Id={row?.Retailer_Id}
                    Fromdate={Fromdate || ''}
                    Todate={Todate || ''}
                />
            )}
        />
    )
}

export default ClosingStockRetailerBasedReport