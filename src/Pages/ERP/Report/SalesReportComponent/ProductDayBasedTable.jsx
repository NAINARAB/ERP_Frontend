import { Fragment, useEffect, useState } from "react";
import FilterableTable from "../../../../Components/filterableTable2";
import { calcTotal, getDaysInPreviousMonths, Division } from "../../../../Components/functions";

const ProductDayBasedSalesReport = ({ dataArray, days }) => {
    const [showData, setShowData] = useState([]);

    useEffect(() => {
        let temp = Array.isArray(dataArray) ? [...dataArray] : [];

        const modifyCol = temp.map(o => ({
            ...o,
            M2_Avg: Division(o.ALL_Avg_M2, (getDaysInPreviousMonths(2) / 2)) ?? 0,
            M3_Avg: Division(o.ALL_Avg_M3, (getDaysInPreviousMonths(3) / 3)) ?? 0,
            M6_Avg: Division(o.ALL_Avg_M6, (getDaysInPreviousMonths(6) / 6)) ?? 0,
            M9_Avg: Division(o.ALL_Avg_M9, (getDaysInPreviousMonths(9) / 9)) ?? 0,
            M12_Avg: Division(o.ALL_Avg_One_Year, (getDaysInPreviousMonths(12) / 12)) ?? 0,
            Billed_Qty: calcTotal(o.StockTransaction, 'bill_qty'),
            Billed_Avg: calcTotal(o.StockTransaction, 'bill_qty') / days,
            StockTransaction: o.StockTransaction.map(st => ({
                ...st,
                Grade_Item_Group: st.Item_Name_Modified,
                M2_Avg: Division(st.M2_AVG_Qty, (getDaysInPreviousMonths(2) / 2)) ?? 0,
                M3_Avg: Division(st.M3_AVG_Qty, (getDaysInPreviousMonths(3) / 3)) ?? 0,
                M6_Avg: Division(st.M6_AVG_Qty, (getDaysInPreviousMonths(6) / 6)) ?? 0,
                M9_Avg: Division(st.M9_AVG_Qty, (getDaysInPreviousMonths(9) / 9)) ?? 0,
                M12_Avg: Division(st.One_Year_AVG_Qty, (getDaysInPreviousMonths(12) / 12)) ?? 0,
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
                        Field_Name: 'Billed_Avg',
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
                                    Field_Name: 'Grade_Item_Group',
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

export default ProductDayBasedSalesReport;