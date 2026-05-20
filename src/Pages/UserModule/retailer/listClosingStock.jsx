import { NumberFormat, Addition, LocalDate } from '../../../Components/functions';
import FilterableTable, { createCol } from '../../../Components/filterableTable2';


const ListClosingStock = ({ productClosingStock = [] }) => {
    return (
        <>

            <FilterableTable
                title={" Current Stock ( Products: " + productClosingStock?.length + " )"}
                headerFontSizePx={12}
                bodyFontSizePx={12}
                ButtonArea={
                    <>
                        ₹ {NumberFormat(
                            productClosingStock.reduce(
                                (sum, product) => Addition(sum, product.totalValue),
                                0
                            )
                        )}
                    </>
                }
                EnableSerialNumber
                dataArray={productClosingStock}
                columns={[
                    createCol('Product_Name', 'string'),
                    createCol('entryDate', 'string', 'Entry Date'),
                    createCol('updateDate', 'string', 'Update Date'),
                    createCol('entryDays', 'number', 'Entry Days'),
                    createCol('updateDays', 'number', 'Update Days'),
                    createCol('estimatedQuantity', 'number', ' Quantity'),
                    createCol('Product_Rate', 'number', 'Rate'),
                    createCol('totalValue', 'number', 'Stock-Value'),
                ]}
            />

        </>
    )
}

export default ListClosingStock;