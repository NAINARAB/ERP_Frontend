// import { useState, useEffect } from "react";
// import { Card, FormControlLabel, Switch, Tab, Box, Checkbox, TextField, Autocomplete, IconButton, Dialog, DialogContent, DialogActions, Button, Tooltip } from "@mui/material";
// import { CheckBoxOutlineBlank, CheckBox, FilterAlt, FilterAltOff } from '@mui/icons-material'
// import { TabPanel, TabList, TabContext } from '@mui/lab';
// import QPaySalesBasedComp from "./QPayComps/salesBased";
// import QPayBasedComp from "./QPayComps/qPayBased";
// import FilterableTable from "../../Components/filterableTable";
// import QPayColumnVisiblitySettings from "./QPayComps/settings";
// import { isEqualNumber, isObject, checkIsNumber } from "../../Components/functions";
// import QPayGroupingList from './QPayComps/qpayGroupingList'
// import { toast } from "react-toastify";
// import { useNavigate } from 'react-router-dom';
// import { GrTransaction } from "react-icons/gr";
// import { fetchLink } from "../../Components/fetchComponent";


// const icon = <CheckBoxOutlineBlank fontSize="small" />;
// const checkedIcon = <CheckBox fontSize="small" />;


// const QPayReports = () => {
//     const nav = useNavigate();

//     const tabList = ['LIST', 'Q-PAY BASED', 'SALES VALUE BASED'];
//     const filterInitialValue = {
//         zeros: false,
//         company: 2,
//         consolidate: 1,
//         view: 'LIST',
//         filterDialog: false,
//         displayGrouping: false,
//     }

//     const [repData, setRepData] = useState([]);
//     const [showData, setShowData] = useState([]);
//     const [reload, setReload] = useState(false);

//     const [cusFilter, setCusFilter] = useState(filterInitialValue);
//     const [columns, setColumns] = useState([]);
//     const [sortedColumns, setSortedColumns] = useState([])

//     const [filters, setFilters] = useState({});
//     const [filteredData, setFilteredData] = useState(showData);

//     const [ledgerId, setLedgerId] = useState([]);

//     useEffect(() => {
//         setSortedColumns(columns?.sort((a, b) => (a?.OrderBy && b?.OrderBy) ? a?.OrderBy - b?.OrderBy : b?.OrderBy - a?.OrderBy))
//     }, [columns])

//     useEffect(() => {
//         setRepData([])
//         fetchLink({
//             address: `reports/tallyReports/qPay?Company_Id=${cusFilter?.company}&Consolidate=${cusFilter?.consolidate}`
//         }).then(data => {
//             if (data.success) {
//                 setRepData(data.data)
//             }
//         }).catch(e => console.error(e))
//     }, [cusFilter?.company, cusFilter?.consolidate, reload])

//     useEffect(() => {
//         const temp = [...repData];
//         const zerosIncluded = !cusFilter.zeros ? temp.filter(o => o?.Q_Pay_Days) : temp;

//         setShowData(zerosIncluded);
//     }, [repData, cusFilter.zeros]);

//     useEffect(() => {
//         fetchLink({
//             address: `reports/tallyReports/qpay/columnVisiblity?CompanyId=${cusFilter.company}&Report_Type_Id=${Boolean(cusFilter?.consolidate) ? 1 : 2}`
//         }).then(data => {
//             if (data.success) {
//                 data?.data?.sort((a, b) => a?.Field_Name?.localeCompare(b?.Field_Name));
//                 setColumns(data.data)
//             }
//         })
//         .catch(e => console.error(e))   
//     }, [cusFilter.company, cusFilter?.consolidate, reload])

//     useEffect(() => {
//         applyFilters();
//     }, [filters]);

//     useEffect(() => {
//         const filterCount = Object.keys(filters).length;
//         const dataArray = (filterCount > 0) ? filteredData : showData;

//         const str = dataArray?.reduce((idStr, obj) => {
//             return obj?.Ledger_Tally_Id ? [...idStr, obj?.Ledger_Tally_Id] : idStr
//         }, [])
//         setLedgerId(str)
//     }, [filters, showData, filteredData])

//     const openSalesTransaction = (obj) => {

//         if (Array.isArray(obj) && obj?.length) {
//             const Ledger_Tally_Id = obj?.reduce((idStr, item) => {
//                 if (item) {
//                     return idStr ? `${idStr},${item}` : `${item}`;
//                 }
//                 return idStr;
//             }, '');
//             nav('transaction', {
//                 state: {
//                     Ledger_Tally_Id: Ledger_Tally_Id,
//                     isObj: false,
//                     rowDetails: obj,
//                     company: cusFilter.company,
//                     preFilters: filters
//                 }
//             })

//         } else if (isObject(obj) && checkIsNumber(obj.Ledger_Tally_Id)) {

//             nav('transaction', {
//                 state: {
//                     Ledger_Tally_Id: obj.Ledger_Tally_Id,
//                     isObj: true,
//                     rowDetails: obj,
//                     company: cusFilter.company,
//                     preFilters: filters
//                 }
//             })

//         } else {
//             toast.error('Ledger Id not available')
//         }
//     }

//     const dispTab = (val) => {
//         const filterCount = Object.keys(filters).length;
//         const dataArray = (filterCount > 0) ? filteredData : showData;
//         switch (val) {
//             // case 'LIST': return <QPayListComp dataArray={filteredData} />
//             case 'LIST': return <FilterableTable dataArray={dataArray} columns={sortedColumns} onClickFun={openSalesTransaction} />
//             case 'Q-PAY BASED': return <QPayBasedComp dataArray={dataArray} columns={sortedColumns} filters={filters} />
//             case 'SALES VALUE BASED': return <QPaySalesBasedComp dataArray={dataArray} />
//             default: <></>
//         }
//     }

//     const reloadData = () => {
//         setReload(pre => !pre)
//     }

//     const handleFilterChange = (column, value) => {
//         setFilters(prevFilters => ({
//             ...prevFilters,
//             [column]: value,
//         }));
//     };

//     const applyFilters = () => {
//         let filtered = [...showData];
//         for (const column of sortedColumns) {
//             if (filters[column.Field_Name]) {
//                 if (filters[column.Field_Name].type === 'range') {
//                     const { min, max } = filters[column.Field_Name];
//                     filtered = filtered.filter(item => {
//                         const value = item[column.Field_Name];
//                         return (min === undefined || value >= min) && (max === undefined || value <= max);
//                     });
//                 } else if (filters[column.Field_Name].type === 'date') {
//                     const { start, end } = filters[column.Field_Name].value;
//                     filtered = filtered.filter(item => {
//                         const dateValue = new Date(item[column.Field_Name]);
//                         return (start === undefined || dateValue >= new Date(start)) && (end === undefined || dateValue <= new Date(end));
//                     });
//                 } else if (Array.isArray(filters[column.Field_Name])) {
//                     filtered = filters[column.Field_Name]?.length > 0 ? filtered.filter(item => filters[column.Field_Name].includes(item[column.Field_Name].toLowerCase().trim())) : filtered
//                 }
//             }
//         }
//         setFilteredData(filtered);
//     };

//     const renderFilter = (column) => {
//         const { Field_Name, Fied_Data } = column;
//         if (Fied_Data === 'number') {
//             return (
//                 <div className='d-flex justify-content-between px-2'>
//                     <input
//                         placeholder="Min"
//                         type="number"
//                         className="bg-light border-0 m-1 p-1 w-50"
//                         value={filters[Field_Name]?.min ?? ''}
//                         onChange={(e) => handleFilterChange(Field_Name, { type: 'range', ...filters[Field_Name], min: e.target.value ? parseFloat(e.target.value) : undefined })}
//                     />
//                     <input
//                         placeholder="Max"
//                         type="number"
//                         className="bg-light border-0 m-1 p-1 w-50"
//                         value={filters[Field_Name]?.max ?? ''}
//                         onChange={(e) => handleFilterChange(Field_Name, { type: 'range', ...filters[Field_Name], max: e.target.value ? parseFloat(e.target.value) : undefined })}
//                     />
//                 </div>
//             );
//         } else if (Fied_Data === 'date') {
//             return (
//                 <div className='d-flex justify-content-between px-2'>
//                     <input
//                         placeholder="Start Date"
//                         type="date"
//                         className="bg-light border-0 m-1 p-1 w-50"
//                         value={filters[Field_Name]?.value?.start ?? ''}
//                         onChange={(e) => handleFilterChange(Field_Name, { type: 'date', value: { ...filters[Field_Name]?.value, start: e.target.value || undefined } })}
//                     />
//                     <input
//                         placeholder="End Date"
//                         type="date"
//                         className="bg-light border-0 m-1 p-1 w-50"
//                         value={filters[Field_Name]?.value?.end ?? ''}
//                         onChange={(e) => handleFilterChange(Field_Name, { type: 'date', value: { ...filters[Field_Name]?.value, end: e.target.value || undefined } })}
//                     />
//                 </div>
//             );
//         } else if (Fied_Data === 'string') {
//             const distinctValues = [...new Set(showData.map(item => item[Field_Name]?.toLowerCase()?.trim()))];
//             return (
//                 <Autocomplete
//                     multiple
//                     id={`${Field_Name}-filter`}
//                     options={distinctValues}
//                     disableCloseOnSelect
//                     getOptionLabel={option => option}
//                     value={filters[Field_Name] || []}
//                     onChange={(event, newValue) => handleFilterChange(Field_Name, newValue)}
//                     renderOption={(props, option, { selected }) => (
//                         <li {...props}>
//                             <Checkbox
//                                 icon={icon}
//                                 checkedIcon={checkedIcon}
//                                 style={{ marginRight: 8 }}
//                                 checked={selected}
//                             />
//                             {option}
//                         </li>
//                     )}
//                     isOptionEqualToValue={(opt, val) => opt === val}
//                     renderInput={(params) => (
//                         <TextField
//                             {...params}
//                             label={Field_Name}
//                             placeholder={`Select ${Field_Name?.replace(/_/g, ' ')}`}
//                         />
//                     )}
//                 />
//             );
//         }
//     };

//     return (
//         <>
//             <Card>

//                 <div className="p-2 border-bottom fa-16 fw-bold">
//                     <span className="text-uppercase ps-3">Q-Pay Report</span>
//                 </div>

//                 <div className="d-flex flex-wrap justify-content-between p-2">
//                     <span>
//                         <FormControlLabel
//                             control={
//                                 <Switch
//                                     checked={!cusFilter.zeros}
//                                     onChange={e => setCusFilter(pre => ({ ...pre, zeros: !(e.target.checked) }))}
//                                 />
//                             }
//                             label="Remove Zeros"
//                             labelPlacement="start"
//                             className=" fw-bold text-primary"
//                         />
//                         <FormControlLabel
//                             control={
//                                 <Switch
//                                     checked={cusFilter.consolidate === 1 ? true : false}
//                                     onChange={e => setCusFilter(pre => ({ ...pre, consolidate: e.target.checked ? 1 : 0 }))}
//                                 />
//                             }
//                             label="Consolidate"
//                             labelPlacement="start"
//                             className=" fw-bold text-primary"
//                         />
//                         <FormControlLabel
//                             control={
//                                 <Switch
//                                     checked={cusFilter.displayGrouping}
//                                     onChange={e => setCusFilter(pre => ({ ...pre, displayGrouping: e.target.checked }))}
//                                 />
//                             }
//                             label="Grouping"
//                             labelPlacement="start"
//                             className=" fw-bold text-primary"
//                         />
//                     </span>

//                     <span>
//                         <QPayColumnVisiblitySettings
//                             CompanyId={cusFilter.company}
//                             columns={sortedColumns}
//                             refresh={reloadData}
//                             ReportId={Boolean(cusFilter?.consolidate) ? 1 : 2}
//                         />
//                         <Tooltip title='Open Sales List'>
//                             <IconButton
//                                 onClick={() => openSalesTransaction(ledgerId)}
//                                 size="small"
//                             >
//                                 <GrTransaction />
//                             </IconButton>
//                         </Tooltip>
//                         <Tooltip title="Filters">
//                             <IconButton
//                                 onClick={() => setCusFilter(pre => ({ ...pre, filterDialog: true }))}
//                                 size="small"
//                                 className="d-md-none d-inline"
//                             >
//                                 <FilterAlt />
//                             </IconButton>
//                         </Tooltip>
//                     </span>
//                 </div>

//                 {cusFilter.displayGrouping ? <QPayGroupingList dataArray={showData} columns={sortedColumns} /> : (
//                     <div className="row ">

//                         <div className="col-xxl-10 col-lg-9 col-md-8">
//                             <div className="p-2">
//                                 <TabContext value={cusFilter.view}>
//                                     <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
//                                         <TabList
//                                             indicatorColor='transparant'
//                                             onChange={(e, n) => setCusFilter(pre => ({ ...pre, view: n }))}
//                                             variant="scrollable"
//                                             scrollButtons="auto"
//                                             allowScrollButtonsMobile
//                                         >
//                                             {tabList.map(o => (
//                                                 <Tab sx={cusFilter.view === o ? { backgroundColor: '#c6d7eb' } : {}} label={o} value={o} key={o} />
//                                             ))}
//                                         </TabList>
//                                     </Box>
//                                     {tabList.map(o => (
//                                         <TabPanel value={o} sx={{ px: 0, py: 2 }} key={o}>
//                                             {dispTab(cusFilter.view)}
//                                         </TabPanel>
//                                     ))}
//                                 </TabContext>
//                             </div>
//                         </div>

//                         <div className="col-xxl-2 col-lg-3 col-md-4 d-none d-md-block">
//                             <h5 className="d-flex justify-content-between px-2">
//                                 Filters
//                                 <Tooltip title='Clear Filters'>
//                                     <IconButton
//                                         size="small"
//                                         onClick={() => setFilters({})}
//                                     >
//                                         <FilterAltOff />
//                                     </IconButton>
//                                 </Tooltip>
//                             </h5>
//                             <div className="border rounded-3 " style={{ maxHeight: '70vh', overflow: 'auto' }}>
//                                 {columns.map((column, ke) => (isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1)) && (
//                                     <div key={ke} className="py-3 px-3 hov-bg border-bottom">
//                                         <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
//                                         {renderFilter(column)}
//                                     </div>
//                                 ))}
//                                 <br />
//                             </div>
//                         </div>

//                     </div>
//                 )}

//             </Card>

//             <Dialog
//                 open={cusFilter?.filterDialog}
//                 onClose={() => setCusFilter(pre => ({ ...pre, filterDialog: false }))}
//                 fullWidth
//                 maxWidth='sm'
//             >
//                 {/* <DialogTitle></DialogTitle> */}
//                 <DialogContent>
//                     <h5 className="d-flex justify-content-between px-2">
//                         Filters
//                         <Tooltip title='Clear Filters'>
//                             <IconButton
//                                 size="small"
//                                 onClick={() => setFilters({})}
//                             >
//                                 <FilterAltOff />
//                             </IconButton>
//                         </Tooltip>
//                     </h5>
//                     <div className="border rounded-3 " style={{ maxHeight: '70vh', overflow: 'auto' }}>
//                         {columns.map((column, ke) => (isEqualNumber(column?.Defult_Display, 1) || isEqualNumber(column?.isVisible, 1)) && (
//                             <div key={ke} className="py-3 px-3 hov-bg border-bottom">
//                                 <label className='mt-2 mb-1'>{column?.Field_Name?.replace(/_/g, ' ')}</label>
//                                 {renderFilter(column)}
//                             </div>
//                         ))}
//                         <br />
//                     </div>
//                 </DialogContent>
//                 <DialogActions>
//                     <Button onClick={() => setCusFilter(pre => ({ ...pre, filterDialog: false }))} color='error'>close</Button>
//                 </DialogActions>
//             </Dialog>
//         </>
//     )
// }

// export default QPayReports







import React, { useState, useEffect, useCallback } from 'react'
import { 
  Card, FormControlLabel, Switch, Tab, Box, Checkbox, TextField, 
  Autocomplete, IconButton, Dialog, DialogContent, DialogActions, 
  Button, Tooltip, Select, MenuItem, FormControl, InputLabel,
  CircularProgress, InputAdornment, Grid
} from '@mui/material'
import { 
  Refresh, Sync, Search, Close 
} from '@mui/icons-material'
import { TabPanel, TabList, TabContext } from '@mui/lab'
import { fetchLink } from '../../Components/fetchComponent'
import FilterableTable, { createCol } from '../../Components/filterableTable2'

function QPayReports2() {

  const [activeMainTab, setActiveMainTab] = useState('list')
  const [selectedMonth, setSelectedMonth] = useState('ALL')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedLedger, setSelectedLedger] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('COMPLETED') 
  const [ledgers, setLedgers] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingLedgers, setLoadingLedgers] = useState(false)
  

  const [repData, setRepData] = useState([])
  const [showData, setShowData] = useState([])
  const [reload, setReload] = useState(false)
  

  const [cusFilter, setCusFilter] = useState({
    zeros: false,
    company: 2,
    consolidate: 0,
    salesInvoice: false 
  })

  const [syncLoading, setSyncLoading] = useState(false)

  
  const tabList = ['LIST', 'Sync']

 
  const statusOptions = [
    { value: 'COMPLETED', label: 'Completed', pendingList: 0 },
    { value: 'PENDING', label: 'Pending', pendingList: 1 }
  ]


  const months = [
    { value: 'ALL', label: 'ALL' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ]

 
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i)
  }


  const fetchLedgers = useCallback(async () => {
    try {
      setLoadingLedgers(true);
      const response = await fetchLink({
        address: 'masters/retailers',
        method: 'GET'
      });

      if (response?.success) {
        let retailers = [];
        
        if (response.data && Array.isArray(response.data)) {
          retailers = response.data;
        } else if (Array.isArray(response)) {
          retailers = response;
        } else if (response.data && typeof response.data === 'object') {
          retailers = Object.values(response.data).filter(item => typeof item === 'object');
        }
        
        const ledgerOptions = [
          { id: 'ALL', name: 'ALL' },
          ...retailers.map(retailer => ({
            id: retailer.Retailer_Id || retailer.AC_Id || retailer.id,
            name: retailer.Retailer_Name || retailer.name || 'Unknown',
            code: retailer.Retailer_Code || retailer.code || '',
            acId: retailer.AC_Id || retailer.acId
          }))
        ];
        
        setLedgers(ledgerOptions);
      } else {
        setLedgers([{ id: 'ALL', name: 'ALL' }]);
      }
    } catch (error) {
      console.error('Error fetching ledgers:', error);
      setLedgers([{ id: 'ALL', name: 'ALL' }]);
    } finally {
      setLoadingLedgers(false);
    }
  }, []);

  useEffect(() => {
    fetchLedgers();
  }, [fetchLedgers]);


  const fetchReportData = useCallback(async () => {
    if (activeMainTab !== 'list') return;
    
    setLoading(true)
    try {
      const ledgerParam = selectedLedger === 'ALL' ? 0 : selectedLedger
      const monthParam = selectedMonth === 'ALL' ? 0 : parseInt(selectedMonth)
      const yearParam = selectedYear
      
     
      const selectedStatusObj = statusOptions.find(s => s.value === selectedStatus)
      const pendingListParam = selectedStatusObj?.pendingList ?? 0
      
      let response;
      
      if (cusFilter.consolidate === 1) {
      
        response = await fetchLink({
          address: `reports/tallyReports/qPay/consolidate?Month_No=${monthParam}&Year=${yearParam}&Customer_Id=${ledgerParam}&Pending_List=${pendingListParam}`
        })
      } else if (cusFilter.salesInvoice === true) {
        
        response = await fetchLink({
          address: `reports/tallyReports/qPay/search?Month_No=${monthParam}&Year=${yearParam}&Customer_Id=${ledgerParam}&Consoidate=${pendingListParam}`
        })
      } else {
  
        response = await fetchLink({
          address: `reports/tallyReports/qPay/search?Month_No=${monthParam}&Year=${yearParam}&Customer_Id=${ledgerParam}&Consoidate=${pendingListParam}`
        })
      }
      
      if (response && response.success) {
      
        setRepData(response.data || [])
      } else {
        console.error('API returned error:', response)
        setRepData([])
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
      setRepData([])
    } finally {
      setLoading(false)
    }
  }, [activeMainTab, selectedLedger, selectedMonth, selectedYear, selectedStatus, cusFilter.consolidate, cusFilter.salesInvoice, cusFilter.company]);

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData, reload])

  
  useEffect(() => {
    let filteredData = [...repData]
    

    if (cusFilter.consolidate === 0 && !cusFilter.salesInvoice) {
      if (!cusFilter.zeros) {
        filteredData = filteredData.filter(o => o && o.Bal_Amount !== 0 && o.Bal_Amount !== '0')
      }
    }
    

    if (cusFilter.consolidate === 0 && !cusFilter.salesInvoice) {
      const pendingListValue = selectedStatus === 'COMPLETED' ? 0 : 1
      filteredData = filteredData.filter(o => {
        if (pendingListValue === 0) {
          return o && (o.Bal_Amount === 0 || o.Bal_Amount === '0')
        } else {
          return o && o.Bal_Amount !== 0 && o.Bal_Amount !== '0'
        }
      })
    }
    
    setShowData(filteredData)
  }, [repData, cusFilter.zeros, cusFilter.consolidate, cusFilter.salesInvoice, selectedStatus])

  const handleSearch = () => {
    setReload(prev => !prev)
  }

  const reloadData = () => {
    setReload(prev => !prev)
  }

  const handleSync = async () => {
    setSyncLoading(true)
    try {
      const monthParam = selectedMonth === 'ALL' ? 0 : parseInt(selectedMonth)
      const yearParam = selectedYear
      const ledgerParam = selectedLedger === 'ALL' ? 0 : selectedLedger
      
      const selectedStatusObj = statusOptions.find(s => s.value === selectedStatus)
      const pendingList = selectedStatusObj?.pendingList ?? 0
      
      const response = await fetchLink({
        address: `reports/tallyReports/qPay/syncConsolidate`,
        method: 'POST',
        body: JSON.stringify({
          Month_No: monthParam,
          Year: yearParam,
          Customer_Id: ledgerParam,
          Pending_List: pendingList
        })
      })
      
      if (response && response.success) {
        alert('Data synced successfully!')
        handleSearch()
      } else {
        alert('Sync failed: ' + (response?.message || 'Unknown error'))
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Error during sync: ' + error.message)
    } finally {
      setSyncLoading(false)
    }
  }


  const getDynamicColumns = () => {
    if (showData.length === 0) return []
    
    const firstRow = showData[0]
    const columns = Object.keys(firstRow).filter(key => key !== '__v' && key !== '_id')
    
    return columns.map(column => {
      let dataType = 'string'
      const sampleValue = firstRow[column]
      
      if (typeof sampleValue === 'number') {
        dataType = 'number'
      } else if (column.toLowerCase().includes('date')) {
        dataType = 'date'
      } else if (column.toLowerCase().includes('amount') || column.toLowerCase().includes('balance')) {
        dataType = 'number'
      }
      
      return createCol(column, dataType, column.replace(/_/g, ' '))
    })
  }

  const columns = getDynamicColumns()

  
  const displayReportContent = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <CircularProgress />
          <p className="mt-2">Loading data...</p>
        </div>
      )
    }

    if (showData.length === 0) {
      return (
        <div className="text-center py-5">
          <h6 className="text-muted">No data available</h6>
          <p className="text-muted small">Please adjust your filters and try again</p>
        </div>
      )
    }

    return (
      <FilterableTable
        dataArray={showData}
        EnableSerialNumber={true}
        isExpendable={false}
        maxHeightOption={true}
        columns={columns}
      />
    )
  }

  return (
    <Card sx={{ m: 2 }}>
      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
        <span className="text-uppercase fw-bold fs-6">Q-Pay Report</span>
        <div className="d-flex gap-2">
          <Button
            variant="outlined"
            size="small"
            onClick={reloadData}
            startIcon={<Refresh />}
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="p-3 border-bottom">
        <Grid container spacing={1.5} alignItems="center">
          <Grid item xs={12} sm={6} md={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                label="Month"
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map(month => (
                  <MenuItem key={month.value} value={month.value}>
                    {month.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2.5}>
            <Autocomplete
              fullWidth
              size="small"
              options={ledgers}
              loading={loadingLedgers}
              value={ledgers.find(ledger => ledger.id === selectedLedger) || null}
              onChange={(event, newValue) => {
                setSelectedLedger(newValue ? newValue.id : 'ALL');
              }}
              getOptionLabel={(option) => option.name}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Ledger"
                  placeholder="Search ledger..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingLedgers ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              noOptionsText="No ledgers found"
            />
          </Grid>

          <Grid item xs={6} sm={6} md={1.5}>
            <FormControl size="small" fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={1.5}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSearch}
              disabled={loading}
              size="medium"
            >
              Search
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={1.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={cusFilter.salesInvoice === true}
                  onChange={e => setCusFilter(prev => ({ ...prev, salesInvoice: e.target.checked }))}
                  size="small"
                />
              }
              label="Sales Invoice"
              labelPlacement="start"
              sx={{ mr: 0 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={1.5}>
            <FormControlLabel
              control={
                <Switch
                  checked={cusFilter.consolidate === 1}
                  onChange={e => setCusFilter(prev => ({ ...prev, consolidate: e.target.checked ? 1 : 0 }))}
                  size="small"
                />
              }
              label="Consolidate"
              labelPlacement="start"
              sx={{ mr: 0 }}
            />
          </Grid>
        </Grid>
      </div>

      <div className="p-3">
        <TabContext value={activeMainTab}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <TabList
              onChange={(e, n) => setActiveMainTab(n)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {tabList.map(o => (
                <Tab 
                  key={o}
                  label={o} 
                  value={o.toLowerCase()}
                  sx={activeMainTab === o.toLowerCase() ? { backgroundColor: '#c6d7eb' } : {}}
                />
              ))}
            </TabList>
          </Box>
          
          <TabPanel value="list" sx={{ px: 0, py: 2 }}>
           
            {cusFilter.consolidate === 0 && !cusFilter.salesInvoice && (
              <div className="mb-3">
                {/* <FormControlLabel
                  control={
                    <Switch
                      checked={!cusFilter.zeros}
                      onChange={e => setCusFilter(prev => ({ ...prev, zeros: !(e.target.checked) }))}
                      size="small"
                    />
                  }
                  label="Remove Zeros"
                  labelPlacement="start"
                /> */}
              </div>
            )}
            
            {displayReportContent()}
          </TabPanel>
          
          <TabPanel value="sync" sx={{ px: 0, py: 2 }}>
            <div className="text-center py-5">
              <Sync sx={{ fontSize: 60, color: '#1976d2', mb: 2 }} />
              <h4>Sync Data</h4>
              <p className="text-muted mb-4">
                Sync your Q-Pay report data with the server
              </p>
              <Button
                variant="contained"
                size="large"
                onClick={handleSync}
                startIcon={<Sync />}
                disabled={syncLoading}
              >
                {syncLoading ? <CircularProgress size={24} /> : 'Start Sync'}
              </Button>
              
              <div className="mt-4">
                <Card variant="outlined" sx={{ p: 2, maxWidth: 400, mx: 'auto' }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Month:</span>
                    <strong>{months.find(m => m.value === selectedMonth)?.label || selectedMonth}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Year:</span>
                    <strong>{selectedYear}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Ledger:</span>
                    <strong>{ledgers.find(l => l.id === selectedLedger)?.name || 'ALL'}</strong>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Status:</span>
                    <strong>{selectedStatus}</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Pending List Value:</span>
                    <strong>
                      {selectedStatus === 'COMPLETED' ? '0 (Completed)' : '1 (Pending)'}
                    </strong>
                  </div>
                </Card>
              </div>
            </div>
          </TabPanel>
        </TabContext>
      </div>
    </Card>
  )
}

export default QPayReports2