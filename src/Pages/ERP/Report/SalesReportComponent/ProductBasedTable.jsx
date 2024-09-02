import { Fragment, useEffect, useState } from "react";
import FilterableTable from "../../../../Components/filterableTable2";
import { calcTotal } from "../../../../Components/functions";

const ProductBasedSalesReport = ({ dataArray }) => {
    const [showData, setShowData] = useState([]);

    useEffect(() => {
        let temp = Array.isArray(dataArray) ? [...dataArray] : [];

        const modifyCol = temp.map(o => ({
            ...o,
            M2_Avg: o.ALL_Avg_M2 ?? 0,
            M3_Avg: o.ALL_Avg_M3 ?? 0,
            M6_Avg: o.ALL_Avg_M6 ?? 0,
            M9_Avg: o.ALL_Avg_M9 ?? 0,
            M12_Avg: o.ALL_Avg_One_Year ?? 0,
            Billed_Qty: calcTotal(o.StockTransaction, 'bill_qty'),
            StockTransaction: o.StockTransaction.map(st => ({
                ...st,
                M2_Avg: st.M2_AVG_Qty ?? 0,
                M3_Avg: st.M3_AVG_Qty ?? 0,
                M6_Avg: st.M6_AVG_Qty ?? 0,
                M9_Avg: st.M9_AVG_Qty ?? 0,
                M12_Avg: st.One_Year_AVG_Qty ?? 0,
            }))
        }));

        const withQtySum = modifyCol.map(o => ({
            ...o,
            Billed_Qty: calcTotal(o.StockTransaction, 'bill_qty')
        }));

        setShowData(withQtySum)

    }, [dataArray])

    return (
        <Fragment>
            <FilterableTable
                dataArray={showData}
                isExpendable={true}
                columns={[
                    {
                        Field_Name: 'Stock_Group',
                        isVisible: 1,
                        Fied_Data: 'string',
                    },
                    {
                        Field_Name: 'Billed_Qty',
                        isVisible: 1,
                        Fied_Data: 'number',
                    },
                    {
                        Field_Name: 'M2_Avg',
                        isVisible: 1,
                        Fied_Data: 'number',
                    },
                    {
                        Field_Name: 'M3_Avg',
                        isVisible: 1,
                        Fied_Data: 'number',
                    },
                    {
                        Field_Name: 'M6_Avg',
                        isVisible: 1,
                        Fied_Data: 'number',
                    },
                    {
                        Field_Name: 'M9_Avg',
                        isVisible: 1,
                        Fied_Data: 'number',
                    },
                    {
                        Field_Name: 'M12_Avg',
                        isVisible: 1,
                        Fied_Data: 'number',
                    },
                ]}
                expandableComp={({ row }) => {
                    return (
                        <FilterableTable
                            initialPageCount={10}
                            dataArray={Array.isArray(row.StockTransaction) ? row.StockTransaction : []}
                            columns={[
                                {
                                    Field_Name: 'Item_Name_Modified',
                                    isVisible: 1,
                                    Fied_Data: 'string',
                                },
                                {
                                    Field_Name: 'bill_qty',
                                    isVisible: 1,
                                    Fied_Data: 'number',
                                },
                                {
                                    Field_Name: 'M2_Avg',
                                    isVisible: 1,
                                    Fied_Data: 'number',
                                },
                                {
                                    Field_Name: 'M3_Avg',
                                    isVisible: 1,
                                    Fied_Data: 'number',
                                },
                                {
                                    Field_Name: 'M6_Avg',
                                    isVisible: 1,
                                    Fied_Data: 'number',
                                },
                                {
                                    Field_Name: 'M9_Avg',
                                    isVisible: 1,
                                    Fied_Data: 'number',
                                },
                                {
                                    Field_Name: 'M12_Avg',
                                    isVisible: 1,
                                    Fied_Data: 'number',
                                },
                            ]}

                        />
                    )
                }}
                tableMaxHeight={540}
            />
        </Fragment>
    )

}

export default ProductBasedSalesReport;