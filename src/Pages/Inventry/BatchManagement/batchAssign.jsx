import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, IconButton, Tab } from "@mui/material";
import { useState } from "react";
import { ISOString } from '../../../Components/functions';
import { Search } from '@mui/icons-material';
import UnAssignedJournals from './unAssignedJournal';
import ChooseBatch from './chooseBatch';

const BatchAssign = ({ loadingOn, loadingOff }) => {
    const [tabValue, setTabValue] = useState(1);
    const [dateFilter, setDateFilter] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        FilterFromDate: ISOString(),
        FilterTodate: ISOString(),
    })

    const tabData = [
        {
            name: 'Material Inward',
            component: (
                <UnAssignedJournals
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                    Fromdate={dateFilter.Fromdate}
                    Todate={dateFilter.Todate}
                    api={`inventory/batchMaster/materialInward`}
                    postApi='inventory/batchMaster/materialInward'
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                />
            )
        },
        {
            name: 'Consumption',
            component: (
                <ChooseBatch
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                    Fromdate={dateFilter.Fromdate}
                    Todate={dateFilter.Todate}
                    api={`inventory/batchMaster/consumption`}
                    postApi='inventory/batchMaster/consumption'
                    compareGodown={'godownId'}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                />
            )
        },
        {
            name: 'Production',
            component: (
                <UnAssignedJournals
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                    Fromdate={dateFilter.Fromdate}
                    Todate={dateFilter.Todate}
                    api={`inventory/batchMaster/production`}
                    postApi='inventory/batchMaster/production'
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                />
            )
        },
        {
            name: 'Godown Transfer',
            component: (
                <ChooseBatch
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                    Fromdate={dateFilter.Fromdate}
                    Todate={dateFilter.Todate}
                    api={`inventory/batchMaster/godownTransfer`}
                    postApi='inventory/batchMaster/godownTransfer'
                    compareGodown={'fromGodownId'}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                />
            )
        },
        {
            name: 'Sales Invoice',
            component: (
                <ChooseBatch
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                    Fromdate={dateFilter.Fromdate}
                    Todate={dateFilter.Todate}
                    api={`inventory/batchMaster/sales`}
                    postApi='inventory/batchMaster/sales'
                    compareGodown={'godownId'}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                />
            )
        },
        {
            name: 'Purchase Invoice',
            component: (
                <UnAssignedJournals
                    loadingOn={loadingOn}
                    loadingOff={loadingOff}
                    Fromdate={dateFilter.Fromdate}
                    Todate={dateFilter.Todate}
                    api={`inventory/batchMaster/purchase`}
                    postApi='inventory/batchMaster/purchase'
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                />
            )
        },
    ]

    return (
        <>

            {/* <div className="d-flex align-items-center flex-wrap mb-3">
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
                    className='cus-inpt p-2 w-auto'
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
            </div> */}

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

export default BatchAssign;