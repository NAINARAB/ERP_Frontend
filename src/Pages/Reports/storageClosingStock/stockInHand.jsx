import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, IconButton, Tab } from "@mui/material";
import { useState } from "react";
import { ISOString } from '../../../Components/functions';
import { Search } from '@mui/icons-material';
import ItemWiseStockReport from './itemWise';
import { storageStockColumnsForItemWise, storageStockColumnsForGodownWise } from './variable';

const CustomerClosingStockReport = ({ loadingOn, loadingOff }) => {
    const [tabValue, setTabValue] = useState(1);
    const [dateFilter, setDateFilter] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        FilterFromDate: ISOString(),
        FilterTodate: ISOString(),
    });
    const [commonFilters, setCommonFilters] = useState({
        stockItemName: '',
        gradeItemGroup: '',
        itemNameModified: '',
    });

    const updateCommonFilter = (key, value) => {
        setCommonFilters((pre) => ({ ...pre, [key]: value }));
    };

    const tabData = [
        {
            name: 'Item Wise',
            component: (
                <ItemWiseStockReport
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                    Fromdate={dateFilter.Fromdate}
                    Todate={dateFilter.Todate}
                    api='itemWise'
                    defaultGrouping=''
                    storageStockColumns={storageStockColumnsForItemWise}
                    reportName='stockInHand_itemWise'
                    url='/erp/reports/stockInHand'
                    commonFilters={commonFilters}
                />
            )
        },
        {
            name: 'Godown Wise',
            component: (
                <ItemWiseStockReport
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                    Fromdate={dateFilter.Fromdate}
                    Todate={dateFilter.Todate}
                    api='godownWise'
                    defaultGrouping=''
                    storageStockColumns={storageStockColumnsForGodownWise}
                    groupingOption={true}
                    reportName='stockInHand_GodownWise'
                    url='/erp/reports/stockInHand'
                    commonFilters={commonFilters}
                />
            )
        },
    ];

    return (
        <>

            <div className="d-flex align-items-center flex-wrap gap-2 mb-3">
                <label htmlFor="from" className='me-1 fw-bold '>Fromdate: </label>
                <input
                    type="date"
                    id='from'
                    className='cus-inpt p-2 w-auto me-2'
                    value={dateFilter.FilterFromDate}
                    onChange={e => setDateFilter(pre => ({ ...pre, FilterFromDate: e.target.value }))}
                />
                <label htmlFor="to" className='me-1 fw-bold '>Todate: </label>
                <input
                    type="date"
                    id='to'
                    className='cus-inpt p-2 w-auto me-2'
                    value={dateFilter.FilterTodate}
                    onChange={e => setDateFilter(pre => ({ ...pre, FilterTodate: e.target.value }))}
                />
                <IconButton
                    size='small'
                    onClick={() => setDateFilter(pre => ({
                        ...pre,
                        Fromdate: pre.FilterFromDate ? pre.FilterFromDate : pre.Fromdate,
                        Todate: pre.FilterTodate ? pre.FilterTodate : pre.Todate
                    }))}
                ><Search /></IconButton>

                <label htmlFor="stock-item-name" className='me-1 fw-bold '>Stock Item Name: </label>
                <input
                    id='stock-item-name'
                    className='cus-inpt p-2 w-auto'
                    value={commonFilters.stockItemName}
                    onChange={(e) => updateCommonFilter('stockItemName', e.target.value)}
                    placeholder='Search stock item'
                />

                <label htmlFor="grade-item-group" className='me-1 fw-bold '>Grade Item Group: </label>
                <input
                    id='grade-item-group'
                    className='cus-inpt p-2 w-auto'
                    value={commonFilters.gradeItemGroup}
                    onChange={(e) => updateCommonFilter('gradeItemGroup', e.target.value)}
                    placeholder='Search grade group'
                />

                <label htmlFor="item-name-modified" className='me-1 fw-bold '>Item Name Modified: </label>
                <input
                    id='item-name-modified'
                    className='cus-inpt p-2 w-auto'
                    value={commonFilters.itemNameModified}
                    onChange={(e) => updateCommonFilter('itemNameModified', e.target.value)}
                    placeholder='Search item modified'
                />
            </div>

            <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                        indicatorColor='transparant'
                        onChange={(e, n) => setTabValue(n)}
                        variant='scrollable'
                        scrollButtons="auto"
                    >
                        {tabData.map(
                            (tab, tabInd) => (
                                <Tab
                                    key={tabInd}
                                    sx={tabValue === (tabInd + 1) ? { backgroundColor: '#c6d7eb' } : {}}
                                    label={tab.name}
                                    value={tabInd + 1}
                                />
                            )
                        )}
                    </TabList>
                </Box>

                {tabData.map((tab, tabInd) => (
                    <TabPanel value={tabInd + 1} sx={{ p: 0, pt: 2 }} key={tabInd}>
                        {tab.component}
                    </TabPanel>
                ))}

            </TabContext>
        </>
    )
}

export default CustomerClosingStockReport;