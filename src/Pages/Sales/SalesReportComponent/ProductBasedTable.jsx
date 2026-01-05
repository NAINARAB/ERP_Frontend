import { Fragment, useMemo, useState } from "react";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";

const ProductBasedSalesReport = ({ dataArray }) => {
    const productColumns = ['Stock_Group', 'Item_Name_Modified', 'Y1', 'M6', 'M2', 'LM', 'Total_Qty'];
    const [daysCol, setDaysCol] = useState([])

    const showData = useMemo(() => {
        return dataArray.map(o => {
            const transaction = Array.isArray(o?.StockTransaction) ? o?.StockTransaction : [];
            const stkObj = transaction[0] || {}; 
            const DaySum = Object.fromEntries(
                Object.entries(stkObj).filter(([key]) => 
                    !productColumns.includes(key) && !isNaN(Number(key)) 
                ).map(([key]) => {
                    setDaysCol(pre => pre.includes(key) ? pre : [...pre, key])
                    const total = transaction.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
                    return [key, total];
                })
            );

            return {
                ...o,
                ...DaySum
            };
        });
    }, [dataArray]);

    return (
        <Fragment>
            <FilterableTable
                // title="Product Based Sales Report"
                dataArray={showData}
                isExpendable={true}
                columns={[
                    createCol('Stock_Group', 'string'),
                    createCol('Y1', 'number'),
                    createCol('M6', 'number'),
                    createCol('M2', 'number'),
                    createCol('LM', 'number'),
                    createCol('Total_Qty', 'number'),
                    ...daysCol.map(day => createCol(day, 'number', `Day ${day}`))
                ]}
                expandableComp={({ row }) => {
                    const transaction = Array.isArray(row?.StockTransaction) ? row?.StockTransaction : [];
                    const preDefinedCol = [
                        createCol('Item_Name_Modified', 'string', 'Item'),
                        createCol('Y1', 'number'),
                        createCol('M6', 'number'),
                        createCol('M2', 'number'),
                        createCol('LM', 'number'),
                        createCol('Total_Qty', 'number')
                    ];
                    
                    const columns = Object.keys(transaction[0] || {}).filter(
                        key => !productColumns.includes(key) && key !== 'Stock_Group'
                    ).map(key => createCol(key, 'number'));

                    return (
                        <FilterableTable
                            initialPageCount={10}
                            dataArray={transaction}
                            columns={[...preDefinedCol, ...columns]}
                        />
                    );
                }}
                tableMaxHeight={540}
            />
        </Fragment>
    );
};

export default ProductBasedSalesReport;
