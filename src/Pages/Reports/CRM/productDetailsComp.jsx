import { useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, NumberFormat, toArray } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { useEffect } from "react";


const ClosingStockLedgerProductDetails = ({ Retailer_Id, Fromdate, Todate }) => {
    const [productClosingStock, setProductClosingStock] = useState([]);

    useEffect(() => {
        if (Retailer_Id) {
            fetchLink({
                address: `
                reports/customerClosingStock/retailerBased/detailedInfo?
                Retailer_Id=${Retailer_Id}&
                Fromdate=${Fromdate}&
                Todate=${Todate}`,
            }).then(data => {
                if (data.success) {
                    setProductClosingStock(toArray(data?.data));
                }
            }).catch(e => console.error(e))
        }
    }, [Retailer_Id, Fromdate, Todate]);

    const productBasedColumn = [
        createCol('Product_Name', 'string'),
        createCol('deliveryDisplayDate', 'string', 'Entry Date'),
        createCol('closingDisplayDate', 'string', 'Update Date'),
        createCol('entryDays', 'number', 'Entry Days'),
        createCol('updateDays', 'number', 'Update Days'),
        createCol('stockQuantityOfItem', 'number', ' Quantity'),
        createCol('stockRateOfItem', 'number', 'Rate'),
        createCol('stockValueOfItem', 'number', 'Stock-Value'),
    ];

    return (
        <>
            <FilterableTable
                title={" Stock value: ₹" + NumberFormat(
                    productClosingStock.reduce(
                        (sum, product) => Addition(sum, product.stockValueOfItem),
                        0
                    )
                )}
                headerFontSizePx={12}
                bodyFontSizePx={12}
                EnableSerialNumber
                dataArray={productClosingStock}
                columns={productBasedColumn}
                disablePagination
            />
        </>
    )
}

export default ClosingStockLedgerProductDetails;