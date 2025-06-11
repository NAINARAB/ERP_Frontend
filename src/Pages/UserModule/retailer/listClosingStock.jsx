import { NumberFormat, Addition } from '../../../Components/functions';
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
                    // {
                    //     isVisible: 1,
                    //     ColumnHeader: 'Update Date',
                    //     isCustomCell: true,
                    //     Cell: ({ row }) => (
                    //         row?.lastClosingQuanity > 0 ?
                    //             <>
                    //                 {/* <span className="me-2 fw-bold text-primary">{NumberFormat(row?.lastClosingQuanity)}</span> */}
                    //                 {row?.lastclosingDate ? LocalDate(row?.lastclosingDate) : ''}
                    //             </>
                    //             : <></>
                    //     )
                    // },
                    // createCol('lastClosingQuanity', 'number', 'Closing Qty'),
                    // {
                    //     isVisible: 1,
                    //     ColumnHeader: 'Entry Date',
                    //     isCustomCell: true,
                    //     Cell: ({ row }) => (
                    //         <>
                    //             {/* <span className="me-2 fw-bold text-primary">{NumberFormat(row?.lastDeliveryQuantity)}</span> */}
                    //             {row?.lastDeliveryDate ? LocalDate(row?.lastDeliveryDate) : ''}
                    //         </>
                    //     )
                    // },
                    // createCol('lastDeliveryQuantity', 'number', 'Delivery Qty'),
                    createCol('lastVisitDate', 'date', 'Entry Date'),
                    createCol('estimatedQuantity', 'number', ' Quantity'),
                    createCol('Product_Rate', 'number', 'Rate'),
                    createCol('totalValue', 'number', 'Stock-Value'),
                ]}
            />

        </>
    )
}

export default ListClosingStock;