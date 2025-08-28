import { useState, useEffect } from 'react';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, Tab } from "@mui/material";
import { ISOString } from '../../Components/functions';
import { Search, TrendingUp } from '@mui/icons-material';
import { fetchLink } from "../../Components/fetchComponent";
import { toArray, groupData, stringCompare, filterableText } from "../../Components/functions";
import FilterableTable from "../../Components/filterableTable2";
import { IconButton, Tooltip } from "@mui/material";
import { FilterAltOff } from "@mui/icons-material";
import { toast } from "react-toastify";


const calculateTurnoverRatio = (monthlySales, weekSales, yesterday, liveStock) => {
    if (monthlySales === undefined || liveStock === undefined || Math.abs(liveStock) === 0) {
        return 0;
    }

    const ratio = (monthlySales + weekSales + yesterday) / Math.abs(liveStock);
    return Math.round(ratio * 100) / 100;
};

const TrunoverRatio = ({ loadingOn, loadingOff }) => {
    const [tabValue, setTabValue] = useState('1');
    const [dateFilter, setDateFilter] = useState({
        Fromdate: ISOString().split('T')[0],
        Todate: ISOString().split('T')[0],
        FilterFromDate: ISOString().split('T')[0],
        FilterTodate: ISOString().split('T')[0],
    });

    const tabData = [
        {
            name: 'Stock Turnover',
            component: (
                <StockPerformanceReport
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                    Fromdate={dateFilter.Fromdate}
                    Todate={dateFilter.Todate}
                />
            )
        }
    ];

    return (
        <>
            <div className="d-flex align-items-center flex-wrap mb-3">
                <label htmlFor="from" className='me-1 fw-bold '>From: </label>
                <input
                    type="date"
                    id='from'
                    className='cus-inpt p-2 w-auto me-2'
                    value={dateFilter.FilterFromDate}
                    onChange={e => setDateFilter(pre => ({ ...pre, FilterFromDate: e.target.value }))}
                />

                <IconButton
                    size='small'
                    onClick={() => setDateFilter(pre => ({
                        ...pre,
                        Fromdate: pre.FilterFromDate,
                        Todate: pre.FilterTodate
                    }))}
                >
                    <Search />
                </IconButton>
            </div>

            <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                        onChange={(e, n) => setTabValue(n)}
                        variant='scrollable'
                        scrollButtons="auto"
                    >
                        {tabData.map((tab, tabInd) => (
                            <Tab
                                key={tabInd}
                                sx={tabValue === `${tabInd + 1}` ? { backgroundColor: '#c6d7eb' } : {}}
                                label={
                                    <div className="d-flex align-items-center">
                                        {tab.name}
                                        <TrendingUp className="ms-1" fontSize="small" />
                                    </div>
                                }
                                value={`${tabInd + 1}`}
                            />
                        ))}
                    </TabList>
                </Box>

                {tabData.map((tab, tabInd) => (
                    <TabPanel value={`${tabInd + 1}`} sx={{ p: 0, pt: 2 }} key={tabInd}>
                        {tab.component}
                    </TabPanel>
                ))}
            </TabContext>
        </>
    );
};

const StockPerformanceReport = ({ loadingOn, loadingOff, Fromdate, Todate }) => {
    const [stockData, setStockData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupBy, setGroupBy] = useState('Stock_Group');
    const [stockGroupFilter, setStockGroupFilter] = useState('');

    const [DisplayColumn, setDisplayColumn] = useState([
        { Field_Name: 'Group_Name', Fied_Data: 'string', isEnabled: true, isVisible: 1 },
        { Field_Name: 'Stock_Group', Fied_Data: 'string', isEnabled: true, isVisible: 1 },
        { Field_Name: 'stock_item_name', Fied_Data: 'string', isEnabled: true, isVisible: 1 },
        { Field_Name: 'OneMonth_Act_Qty', Fied_Data: 'number', isEnabled: true, isVisible: 1 },
        { Field_Name: 'OneWeek_Act_Qty', Fied_Data: 'number', isEnabled: true, isVisible: 1 },
        { Field_Name: 'Yesterday_Act_Qty', Fied_Data: 'number', isEnabled: true, isVisible: 1 },
        { Field_Name: 'Bal_Qty', Fied_Data: 'number', isEnabled: true, isVisible: 1 },
        { Field_Name: 'Turnover_Ratio', Fied_Data: 'number', isEnabled: true, isVisible: 1 },

    ]);

    useEffect(() => {
        const fetchStockData = async () => {
            try {
                const currentResponse = await fetchLink({
                    address: `inventory/trunoverRatio?Fromdate=${Todate}&Todate=${Todate}`,
                });

                if (currentResponse.success) {
                    const currentData = toArray(currentResponse.data);


                    const dataWithTurnover = currentData.map(item => ({
                        ...item,
                        Turnover_Ratio: calculateTurnoverRatio((item.OneMonth_Act_Qty), (item.OneWeek_Act_Qty), item.Yesterday_Act_Qty, item.Bal_Qty)
                    }));

                    setStockData(dataWithTurnover);
                } else {
                    toast.error("Failed to fetch stock data");
                }
            } catch (error) {
                console.error("Error fetching stock performance:", error);
                toast.error("Error fetching stock performance data");
            } finally {
                setLoading(false);
                loadingOff();
            }
        };

        loadingOn();
        fetchStockData();
    }, [Fromdate, Todate, loadingOn, loadingOff]);


    const stockGroups = [...new Set(stockData.map(item => item.Stock_Group).filter(Boolean))];

    const filteredData = stockGroupFilter
        ? stockData.filter(item => item.Stock_Group === stockGroupFilter)
        : stockData;


    const groupedData = groupBy ? groupData(filteredData, groupBy) : [];

    const showData = groupBy ? groupedData.map(group => {
        const totalMonthlySales = group.groupedData.reduce((sum, item) => sum + (item.OneMonth_Act_Qty || 0), 0);
        const totalWeeklySales = group.groupedData.reduce((sum, item) => sum + (item.OneWeek_Act_Qty || 0), 0);
        const totalYesterdaySales = group.groupedData.reduce((sum, item) => sum + (item.Yesterday_Act_Qty || 0), 0);
        const totalCurrentStock = group.groupedData.reduce((sum, item) => sum + (Math.abs(item.Bal_Qty) || 0), 0);

        const groupTurnoverRatio = totalCurrentStock !== 0 ? ((totalMonthlySales + totalWeeklySales + totalYesterdaySales) / totalCurrentStock) : 0;

        return {
            ...group,
            OneMonth_Act_Qty: totalMonthlySales,
            OneWeek_Act_Qty: totalWeeklySales,
            Yesterday_Act_Qty: totalYesterdaySales,
            Bal_Qty: totalCurrentStock,
            Turnover_Ratio: Math.round(groupTurnoverRatio * 100) / 100
        };
    }) : filteredData;

    const getDisplayName = (columnName) => {
        const displayNames = {

            'Group_Name': 'Group Name',
            'Stock_Group': 'Stock Group',
            'OneMonth_Act_Qty': 'Last Month Sales',
            'OneWeek_Act_Qty': 'Last Week Sales',
            'Yesterday_Act_Qty': 'Yesterday Sales',
            'Bal_Qty': 'Current Stock',
            'Turnover_Ratio': 'Turnover Ratio',
            'stock_item_name': 'Item Name',

        };
        return displayNames[columnName] || columnName?.replace(/_/g, " ");
    };

    return (
        <div>
            <FilterableTable
                title="Stock Turnover Report"
                EnableSerialNumber
                headerFontSizePx={12}
                bodyFontSizePx={12}
                maxHeightOption
                ButtonArea={
                    <>

                        <Tooltip title="Clear Filters">
                            <IconButton size="small" onClick={() => {
                                setStockGroupFilter('');
                                setGroupBy('Group_Name');
                            }}>
                                <FilterAltOff />
                            </IconButton>
                        </Tooltip>


                        <div className="d-flex align-items-center flex-wrap ms-2">
                            <span>Stock Group: </span>
                            <select
                                className="cus-inpt p-2 w-auto m-1"
                                value={stockGroupFilter}
                                onChange={(e) => setStockGroupFilter(e.target.value)}
                            >
                                <option value="">All Groups</option>
                                {stockGroups.map((group, index) => (
                                    <option value={group} key={index}>
                                        {group}
                                    </option>
                                ))}
                            </select>
                        </div>


                        <div className="d-flex align-items-center flex-wrap">
                            <span>Group By: </span>
                            <select
                                className="cus-inpt p-2 w-auto m-1"
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value)}
                            >
                                <option value="">No Grouping</option>
                                {DisplayColumn.filter(
                                    (fil) =>
                                        filterableText(fil.Fied_Data) === "string" &&
                                        fil.isEnabled
                                ).map((col, colInd) => (
                                    <option value={col?.Field_Name} key={colInd}>
                                        {getDisplayName(col?.Field_Name)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                }
                ExcelPrintOption
                dataArray={showData}
                columns={
                    groupBy
                        ? DisplayColumn.filter(
                            (fil) =>
                                showData.length > 0 &&
                                Object.keys(showData[0]).includes(fil.Field_Name) &&
                                fil.isEnabled
                        ).map((col) => ({
                            ...col,
                            ColumnHeader: getDisplayName(col.Field_Name),
                        }))
                        : DisplayColumn.filter((col) => col.isEnabled).map((col) => ({
                            ...col,
                            ColumnHeader: getDisplayName(col.Field_Name),
                        }))
                }
                isExpendable={groupBy ? true : false}
                expandableComp={({ row }) => (
                    <div>
                        <FilterableTable
                            EnableSerialNumber
                            headerFontSizePx={12}
                            bodyFontSizePx={12}
                            dataArray={toArray(row?.groupedData)}
                            columns={DisplayColumn.filter(
                                (clm) => !stringCompare(clm.Field_Name, groupBy) && clm.isEnabled
                            ).map((col) => ({
                                ...col,
                                ColumnHeader: getDisplayName(col.Field_Name),
                            }))}
                        />
                    </div>
                )}
            />
        </div>
    );
};

export default TrunoverRatio;