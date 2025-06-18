import { useEffect, useState } from "react"
import { fetchLink } from "../../../Components/fetchComponent";
import { checkIsNumber, isEqualNumber, toArray } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";


const ClosingStockRetailerBasedReport = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        retailer: { value: '', label: 'Search Retailer' }
    })

    useEffect(() => {

        fetchLink({
            address: `reports/customerClosingStock/retailerBased`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                const dataValue = toArray(data.data);
                setReportData(dataValue)
            }
        }).catch(e => console.error(e))
    }, [])

    return (
        <FilterableTable
            title="Item Wise"
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
                createCol('finalClosingStock', 'number', 'Stock Value'),
            ]}
        />
    )
}

export default ClosingStockRetailerBasedReport