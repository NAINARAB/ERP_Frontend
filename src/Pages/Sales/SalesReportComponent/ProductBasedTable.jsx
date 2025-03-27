import { Fragment, useEffect, useMemo, useState } from "react";
import FilterableTable from "../../../Components/filterableTable2";
import { calcTotal, checkIsNumber } from "../../../Components/functions";

const ProductBasedSalesReport = ({ dataArray }) => {

    const showData = useMemo(() => {
        return dataArray.map(o => {
            return Object.fromEntries(
                Object.entries(o).map(([key, value]) =>  {
                    const productColumns = ['LM', 'M2', 'M6', 'Stock_Group', 'Total_Qty', 'Y1']
                    const isProductKey = productColumns.findIndex(pro => pro === key) !== -1
                    
                    if (isProductKey) {
                        return [key, value]
                    } else {
                        return [key, calcTotal(o?.StockTransaction, key)]
                    }
                })
            )
        });

    }, [dataArray])

    return (
        <Fragment>
            <FilterableTable
                dataArray={dataArray}
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