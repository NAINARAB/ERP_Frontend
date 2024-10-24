import React, { useState, useEffect } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { getPreviousDate, groupData, calcTotal, calcAvg } from "../../Components/functions";
import FilterableTable from '../../Components/filterableTable2'
import { Card, CardContent } from "@mui/material";


const LiveStockReport = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdata: getPreviousDate(30),
        Todate: getPreviousDate(24)
    })

    useEffect(() => {
        if (loadingOn) {
            loadingOn();
        }
        fetchLink({
            address: `reports/liveStockReport?Fromdata=${filters.Fromdata}&Todate=${filters.Todate}`
        }).then(data => {
            if (data.success) {
                setReportData(data.data);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) {
                loadingOff();
            }
        })
    }, [filters.Fromdata, filters.Todate])

    useEffect(() => {
        const grouped_Stock_Group = groupData(reportData, 'Stock_Group');
        const aggregatedStockGroup = grouped_Stock_Group?.map(stockGroup => ({
            ...stockGroup,
            BagsTotal: calcTotal(stockGroup.groupedData, 'Act_Bags'),
            BalQtyTotal: calcTotal(stockGroup.groupedData, 'Bal_Act_Qty'),
        }));

        const Grade_Item_Group = aggregatedStockGroup?.map(stockGroup => ({
            ...stockGroup,
            groupedData: groupData(stockGroup?.groupedData, 'Grade_Item_Group')
        }));
        const aggregatedGradeItemGroup = Grade_Item_Group.map(stockGroup => ({
            ...stockGroup,
            groupedData: stockGroup.groupedData?.map(gradeItemGroup => ({
                ...gradeItemGroup,
                BagsTotal: calcTotal(gradeItemGroup.groupedData, 'Act_Bags'),
                BalQtyTotal: calcTotal(gradeItemGroup.groupedData, 'Bal_Act_Qty'),
            }))
        }));

        const GroupName = aggregatedGradeItemGroup.map(stockGroup => ({
            ...stockGroup,
            groupedData: stockGroup.groupedData?.map(gradeItemGroup => ({
                ...gradeItemGroup,
                groupedData: groupData(gradeItemGroup?.groupedData, 'Group_Name')
            }))
        }));
        const aggregatedGroupName = GroupName.map(stockGroup => ({
            ...stockGroup,
            groupedData: stockGroup.groupedData?.map(gradeItemGroup => ({
                ...gradeItemGroup,
                groupedData: gradeItemGroup?.groupedData?.map(grouopName => ({
                    ...grouopName,
                    BagsTotal: calcTotal(grouopName.groupedData, 'Act_Bags'),
                    BalQtyTotal: calcTotal(grouopName.groupedData, 'Bal_Act_Qty'),
                }))
            }))
        }));

        setGroupedData(aggregatedGroupName);
    }, [reportData])

    const columnCells = (mainKey) => [
        {
            Field_Name: mainKey,
            isVisible: 1,
            Fied_Data: 'string',
        },
        {
            Field_Name: 'BagsTotal',
            ColumnHeader: 'Bags',
            isVisible: 1,
            Fied_Data: 'number',
        },
        {
            Field_Name: 'BalQtyTotal',
            ColumnHeader: 'Balance Quantity',
            isVisible: 1,
            Fied_Data: 'number',
        },
    ]

    return (
        <>
            <Card>

                <div className="p-1 d-flex justify-content-between align-items-center flex-wrap border-bottom">
                    <h5 className="ps-2 pt-2">Live Stock Report</h5>
                    <span>
                        <input
                            type="date"
                            value={filters.Fromdata}
                            className="cus-inpt w-auto p-1"
                            onChange={e => setFilters(pre => ({ ...pre, Fromdata: e.target.value }))}
                        /> - TO -
                        <input
                            type="date"
                            value={filters.Todate}
                            className="cus-inpt w-auto p-1"
                            onChange={e => setFilters(pre => ({ ...pre, Todate: e.target.value }))}
                        />
                    </span>
                </div>

                <CardContent>
                    <FilterableTable
                        dataArray={groupedData}
                        title="Stock Group"
                        columns={columnCells('Stock_Group')}
                        isExpendable={true}
                        expandableComp={({ row }) => (
                            <FilterableTable
                                dataArray={row.groupedData}
                                title="Grade Item Group"
                                columns={columnCells('Grade_Item_Group')}
                                isExpendable={true}
                                expandableComp={({ row }) => (
                                    <FilterableTable
                                        dataArray={row.groupedData}
                                        title="Group Name"
                                        columns={columnCells('Group_Name')}
                                        isExpendable={true}
                                        expandableComp={({ row }) => (
                                            <FilterableTable
                                                dataArray={row.groupedData}
                                                title="Stock Item Name"
                                                columns={[
                                                    {
                                                        Field_Name: 'stock_item_name',
                                                        ColumnHeader: 'Stock Item Name',
                                                        Fied_Data: 'string',
                                                        isVisible: 1,
                                                    },
                                                    {
                                                        Field_Name: 'Bags',
                                                        Fied_Data: 'number',
                                                        isVisible: 1,
                                                    },
                                                    {
                                                        Field_Name: 'Bal_Act_Qty',
                                                        ColumnHeader: 'Balance Quantity',
                                                        Fied_Data: 'number',
                                                        isVisible: 1,
                                                    },
                                                    {
                                                        Field_Name: 'godown_name',
                                                        ColumnHeader: 'Godown',
                                                        Fied_Data: 'string',
                                                        isVisible: 1,
                                                    },
                                                ]}
                                                tableMaxHeight={2000}
                                                disablePagination={true}
                                            />
                                        )}
                                        tableMaxHeight={3000}
                                        disablePagination={true}

                                    />
                                )}
                                tableMaxHeight={4000}
                                disablePagination={true}
                            />
                        )}
                        tableMaxHeight={5000}
                        disablePagination={true}
                    />
                </CardContent>

            </Card>

        </>
    )
}

export default LiveStockReport;