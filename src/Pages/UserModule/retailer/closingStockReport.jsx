import StockReportAreaBased from "./closingStockAreaBasedReport";
import RetailerClosingStock from "./closingStockRetailerBasedReport";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, Tab } from "@mui/material";
import { useState } from "react";


const ClosingStockReports = () => {
    const [tabValue, setTabValue] = useState(1);


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
                        <Tab
                            sx={tabValue === 1 ? { backgroundColor: '#c6d7eb' } : {}}
                            label={'Retailer Based'}
                            value={1}
                        />
                        <Tab
                            sx={tabValue === 2 ? { backgroundColor: '#c6d7eb' } : {}}
                            label={'Area Based'}
                            value={2}
                        />
                    </TabList>
                </Box>

                <TabPanel value={1} sx={{ p: 0, pt: 2 }}>
                    <RetailerClosingStock />
                </TabPanel>
                <TabPanel value={2} sx={{ p: 0, pt: 2 }}>
                    <StockReportAreaBased />
                </TabPanel>
            </TabContext>

        </>
    )
}


export default ClosingStockReports;