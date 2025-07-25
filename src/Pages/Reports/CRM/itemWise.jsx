import { useEffect, useMemo, useState } from "react"
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, checkIsNumber, getDaysBetween, ISOString, LocalDate, Multiplication, NumberFormat, toNumber } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";


const ClosingStockItemBasedReport = ({ loadingOn, loadingOff, Fromdate, Todate }) => {
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        searchItem: { value: '', label: 'Select Item' }
    })
    const [baseData, setBaseData] = useState({
        itemDropDown: []
    });

    useEffect(() => {
        fetchLink({
            address: `reports/customerClosingStock/soldItems`,
            loadingOn, loadingOff
        }).then(data => {
            setBaseData(pre => ({
                ...pre,
                itemDropDown: data.data
            }))
        }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        if (checkIsNumber(filters.searchItem.value)) {
            fetchLink({
                address: `reports/customerClosingStock/itemSearch?Item_Id=${filters.searchItem.value}&Fromdate=${Fromdate}&Todate=${Todate}`
            }).then(data => {
                if (data.success) {
                    setReportData(data.data)
                }
            }).catch(e => console.error(e))
        }
    }, [filters.searchItem.value, Fromdate, Todate]);

    const sumValue = useMemo(() => {
        return reportData.reduce(
            (acc, item) => Addition(acc, item?.stockValueOfItem), 0
        )
    }, [reportData])

    return (
        <FilterableTable
            title={`Item Wise ${sumValue ? '( Total: ' + NumberFormat(sumValue) + ' )'  : ''}`}
            EnableSerialNumber
            dataArray={reportData}
            ButtonArea={
                <>
                    <div style={{ minWidth: '360px' }}>
                        <Select
                            value={filters.searchItem}
                            menuPortalTarget={document.body}
                            onChange={e => setFilters(pre => ({ ...pre, searchItem: e }))}
                            options={[
                                { value: '', label: 'select', isDisabled: true },
                                ...baseData.itemDropDown.map(item => ({
                                    value: item.Item_Id,
                                    label: item.Item_Name
                                }))
                            ]}
                            styles={customSelectStyles}
                            isSearchable={true}
                            required
                            placeholder={"Select Product"}
                        />
                    </div>
                </>
            }
            columns={[
                createCol('Retailer_Name', 'string', 'Customer'),
                {
                    isVisible: 1,
                    ColumnHeader: 'Entry Date',
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <>
                            {row?.Do_Date ? LocalDate(row?.Do_Date) : ''}
                        </>
                    )
                },
                {
                    isVisible: 1,
                    ColumnHeader: 'Update Date',
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <>
                            {row?.closingDate ? LocalDate(row?.closingDate) : ''}
                        </>
                    )
                },
                {
                    isVisible: 1,
                    ColumnHeader: 'Entry Days',
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <>
                            {row?.Do_Date ? getDaysBetween(row?.Do_Date, ISOString()) : ''}
                        </>
                    )
                },
                {
                    isVisible: 1,
                    ColumnHeader: 'Update Days',
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <>
                            {row?.closingDate ? getDaysBetween(row?.closingDate, ISOString()) : ''}
                        </>
                    )
                },
                {
                    isVisible: 1,
                    ColumnHeader: 'Quantity',
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <>
                            {row?.stockQuantityOfItem}
                        </>
                    )
                },
                {
                    isVisible: 1,
                    ColumnHeader: 'Rate',
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <>
                            {row?.stockRateOfItem}
                        </>
                    )
                },
                {
                    isVisible: 1,
                    ColumnHeader: 'Value',
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <>
                            {row?.stockValueOfItem}
                        </>
                    )
                },
            ]}
        />
    )
}

export default ClosingStockItemBasedReport