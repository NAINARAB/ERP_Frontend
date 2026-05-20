import { useEffect, useMemo, useState } from "react"
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, checkIsNumber, getDaysBetween, groupData, isEqualNumber, ISOString, isValidDate, NumberFormat, toArray } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import ClosingStockLedgerProductDetails from "./productDetailsComp";


const SalesPersonWiseGroupedLedgerClosingStock = ({ loadingOn, loadingOff, Fromdate, Todate }) => {
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        retailer: { value: '', label: 'Search Retailer' },
        reload: false
    })

    useEffect(() => {
        fetchLink({
            address: `reports/customerClosingStock/retailerBased/salesPersonGrouped?Fromdate=${Fromdate}&Todate=${Todate}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                const dataValue = toArray(data.data);
                setReportData(dataValue)
            }
        }).catch(e => console.error(e))
    }, [Fromdate, Todate])

    const groupedSalesPersonData = useMemo(() => {
        const data = checkIsNumber(filters.retailer.value)
            ? reportData.filter(
                row => isEqualNumber(row.Retailer_Id, filters.retailer.value)
            ) : reportData;

        const groupSalesPersonWise = groupData(data, 'salesPerson');

        return groupSalesPersonWise.map(salesPerson => {

            const groupedData = toArray(salesPerson?.groupedData);

            const deliveryDates = groupedData
                .map(party => party?.Latest_Delivery_Date ? ISOString(party?.Latest_Delivery_Date) : '')
                .filter(d => isValidDate(d));
            const closingDates = groupedData
                .map(party => party?.Latest_Closing_Date ? ISOString(party?.Latest_Closing_Date) : '')
                .filter(d => isValidDate(d));

            const entryDate = deliveryDates.length
                ? new Date(Math.max(...deliveryDates.map(d => new Date(d))))
                : '';
            const updateDate = closingDates.length
                ? new Date(Math.max(...closingDates.map(d => new Date(d))))
                : '';

            return {
                ...salesPerson,
                entryDate: entryDate ? ISOString(entryDate) : '',
                updateDate: updateDate ? ISOString(updateDate) : '',
                entryDays: entryDate ? getDaysBetween(entryDate, ISOString()) : '',
                updateDays: updateDate ? getDaysBetween(updateDate, ISOString()) : '',
                liveStockValue: groupedData.reduce((acc, item) => Addition(acc, item.liveStockValue), 0),
                entries: groupedData.length
            }
        })
    }, [filters.retailer.value, reportData]);

    const sumValue = useMemo(() => {
        return reportData.reduce(
            (acc, item) => Addition(acc, item?.liveStockValue), 0
        )
    }, [reportData])

    return (
        <FilterableTable
            title={`Sales Person Based Total: ${NumberFormat(sumValue)}`}
            EnableSerialNumber
            headerFontSizePx={12}
            bodyFontSizePx={12}
            dataArray={groupedSalesPersonData}
            columns={[
                createCol('salesPerson', 'string', 'Sales/Delivery Person'),
                createCol('entries', 'number', 'Party   '),
                createCol('entryDate', 'date', 'Entry Date'),
                createCol('updateDate', 'date', 'Update Date'),
                createCol('entryDays', 'number', 'Entry Days'),
                createCol('updateDays', 'number', 'Update Days'),
                createCol('liveStockValue', 'number', 'Stock Value'),
            ]}
            isExpendable={true}
            expandableComp={({ row }) => (
                <FilterableTable
                    headerFontSizePx={12}
                    bodyFontSizePx={12}
                    dataArray={row.groupedData}
                    EnableSerialNumber
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
            )}
        />
    )
}

export default SalesPersonWiseGroupedLedgerClosingStock