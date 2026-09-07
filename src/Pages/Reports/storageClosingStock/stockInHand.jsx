import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { Box, IconButton, Tab, Autocomplete, TextField, Chip } from "@mui/material";
import { useState, useEffect } from "react";
import { ISOString } from '../../../Components/functions';
import { Search } from '@mui/icons-material';
import ItemWiseStockReport from './itemWise';
import { storageStockColumnsForItemWise, storageStockColumnsForGodownWise } from './variable';
import { fetchLink } from "../../../Components/fetchComponent";
import {
     toArray
} from "../../../Components/functions";



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
    // State for dropdown options
    const [filterOptions, setFilterOptions] = useState({
        stockItemNames: [],
        gradeItemGroups: [],
        itemNameModifieds: [],
    });
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    // Fetch data to populate dropdown options
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch item wise data
                const response = await fetchLink({
                    address: `reports/storageStock/itemWise?Fromdate=${dateFilter.Fromdate}&Todate=${dateFilter.Todate}`,
                });
                
                if (response.success) {
                    const data = toArray(response.data);
                    
                    // Extract distinct values for each filter
                    const stockItems = new Set();
                    const gradeGroups = new Set();
                    const itemModifieds = new Set();
                    
                    data.forEach(item => {
                        // Stock Item Name
                        const stockName = item?.stock_item_name || item?.Item_Name_Modified || item?.Stock_Item;
                        if (stockName) stockItems.add(stockName);
                        
                        // Grade Item Group
                        const grade = item?.Grade_Item_Group || item?.Grade_Item_Group_Name || item?.Grade_Group;
                        if (grade) gradeGroups.add(grade);
                        
                        // Item Name Modified
                        const modified = item?.Item_Name_Modified || item?.Item_Name || item?.stock_item_name;
                        if (modified) itemModifieds.add(modified);
                    });
                    
                    setFilterOptions({
                        stockItemNames: Array.from(stockItems).sort(),
                        gradeItemGroups: Array.from(gradeGroups).sort(),
                        itemNameModifieds: Array.from(itemModifieds).sort(),
                    });
                    setIsDataLoaded(true);
                }
            } catch (error) {
                console.error("Error fetching filter options:", error);
            }
        };
        
        fetchData();
    }, [dateFilter.Fromdate, dateFilter.Todate]);

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

                {/* Stock Item Name - Autocomplete */}
                <label htmlFor="stock-item-name" className='me-1 fw-bold '>Stock Item Name: </label>
                <Autocomplete
                    id='stock-item-name'
                    options={filterOptions.stockItemNames}
                    value={commonFilters.stockItemName || ''}
                    onChange={(event, newValue) => {
                        updateCommonFilter('stockItemName', newValue || '');
                    }}
                    onInputChange={(event, newInputValue) => {
                        // Allow typing to search
                        if (event && event.type === 'change') {
                            // Don't update on every keystroke, only on selection
                        }
                    }}
                    freeSolo
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Search stock item"
                            size="small"
                            sx={{ minWidth: 200 }}
                        />
                    )}
                    filterOptions={(options, state) => {
                        const inputValue = state.inputValue.toLowerCase().trim();
                        if (!inputValue) return options;
                        return options.filter(option =>
                            option?.toLowerCase()?.includes(inputValue)
                        );
                    }}
                    renderOption={(props, option) => (
                        <li {...props}>
                            {option}
                        </li>
                    )}
                    isOptionEqualToValue={(option, value) => option === value}
                    ListboxProps={{
                        style: { maxHeight: 200 }
                    }}
                />

                {/* Grade Item Group - Autocomplete */}
                <label htmlFor="grade-item-group" className='me-1 fw-bold '>Grade Item Group: </label>
                <Autocomplete
                    id='grade-item-group'
                    options={filterOptions.gradeItemGroups}
                    value={commonFilters.gradeItemGroup || ''}
                    onChange={(event, newValue) => {
                        updateCommonFilter('gradeItemGroup', newValue || '');
                    }}
                    freeSolo
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Search grade group"
                            size="small"
                            sx={{ minWidth: 200 }}
                        />
                    )}
                    filterOptions={(options, state) => {
                        const inputValue = state.inputValue.toLowerCase().trim();
                        if (!inputValue) return options;
                        return options.filter(option =>
                            option?.toLowerCase()?.includes(inputValue)
                        );
                    }}
                    renderOption={(props, option) => (
                        <li {...props}>
                            {option}
                        </li>
                    )}
                    isOptionEqualToValue={(option, value) => option === value}
                    ListboxProps={{
                        style: { maxHeight: 200 }
                    }}
                />

                {/* Item Name Modified - Autocomplete */}
                <label htmlFor="item-name-modified" className='me-1 fw-bold '>Item Name Modified: </label>
                <Autocomplete
                    id='item-name-modified'
                    options={filterOptions.itemNameModifieds}
                    value={commonFilters.itemNameModified || ''}
                    onChange={(event, newValue) => {
                        updateCommonFilter('itemNameModified', newValue || '');
                    }}
                    freeSolo
                    selectOnFocus
                    clearOnBlur
                    handleHomeEndKeys
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            placeholder="Search item modified"
                            size="small"
                            sx={{ minWidth: 200 }}
                        />
                    )}
                    filterOptions={(options, state) => {
                        const inputValue = state.inputValue.toLowerCase().trim();
                        if (!inputValue) return options;
                        return options.filter(option =>
                            option?.toLowerCase()?.includes(inputValue)
                        );
                    }}
                    renderOption={(props, option) => (
                        <li {...props}>
                            {option}
                        </li>
                    )}
                    isOptionEqualToValue={(option, value) => option === value}
                    ListboxProps={{
                        style: { maxHeight: 200 }
                    }}
                />
            </div>

            <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList
                        indicatorColor='transparent'
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