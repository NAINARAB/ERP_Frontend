import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, Tab } from "@mui/material";
import { useState } from "react";
import ClosingStockItemBasedReport from './itemWise';
import ClosingStockRetailerBasedReport from './liveStock';
// import RetailerClosingStock from '../../UserModule/retailer/closingStockRetailerBasedReport';
import LedgerBasedClosingStock from './ledgerWise';
import SalesPersonWiseGroupedLedgerClosingStock from './salesPersonWise';
import RetailerClosingWithLOL from './lolBased';
import LosBasedClosingReport from './losBased';

const CustomerClosingStockReport = ({ loadingOn, loadingOff }) => {
    const [tabValue, setTabValue] = useState(1);

    const tabData = [
        {
            name: 'Item Wise',
            component: <ClosingStockItemBasedReport loadingOn={loadingOn} loadingOff={loadingOff} />
        },
        {
            name: 'Ledger Wise',
            component: <LedgerBasedClosingStock loadingOn={loadingOn} loadingOff={loadingOff} />
        },
        {
            name: 'LOL Based',
            component: <RetailerClosingWithLOL loadingOn={loadingOn} loadingOff={loadingOff} />
        },
        {
            name: 'LOS Based',
            component: <LosBasedClosingReport loadingOn={loadingOn} loadingOff={loadingOff} />
        },
        {
            name: 'Live Stock',
            component: <ClosingStockRetailerBasedReport loadingOn={loadingOn} loadingOff={loadingOff} />
        },
        {
            name: 'Sales Person Based',
            component: <SalesPersonWiseGroupedLedgerClosingStock loadingOn={loadingOn} loadingOff={loadingOff} />
        },
    ]

    return (
        <>
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