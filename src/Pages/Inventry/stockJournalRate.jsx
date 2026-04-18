// import React, { useState, useEffect, Fragment } from "react";
// import {
//   IconButton,
//   Tooltip,
//   FormControlLabel,
//   Checkbox,
// } from "@mui/material";
// import {
//   Search as SearchIcon,
//   Download as DownloadIcon,
//   Refresh as RefreshIcon,
//   Print as PrintIcon,
// } from "@mui/icons-material";
// import { format } from "date-fns";
// import { fetchLink } from "../../Components/fetchComponent";
// import { toast } from "react-toastify";

// const StockReport = () => {
//   // State variables
//   const [fromDate, setFromDate] = useState(format(new Date().setDate(1), 'yyyy-MM-dd'));
//   const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
//   const [stockGroups, setStockGroups] = useState([]);
//   const [selectedGroup, setSelectedGroup] = useState(null);
//   const [items, setItems] = useState([]);
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
//   const [reportData, setReportData] = useState({ 
//     source: [], 
//     destination: [], 
//     allTransactions: [] 
//   });
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState(0);
//   const [reload, setReload] = useState(false);

//   // Load stock groups on mount
//   useEffect(() => {
//     loadStockGroups();
//   }, [reload]);

//   // Load items when group is selected
//   useEffect(() => {
//     if (selectedGroup) {
//       loadItemsByGroup(selectedGroup.Item_Group_Id);
//       // Reset selected items when group changes
//       setSelectedItems([]);
//       setSelectAll(false);
//       // Clear previous report data
//       setReportData({ source: [], destination: [], allTransactions: [] });
//     } else {
//       setItems([]);
//       setSelectedItems([]);
//       setSelectAll(false);
//     }
//   }, [selectedGroup]);

//   // Handle select all items
//   useEffect(() => {
//     if (selectAll) {
//       setSelectedItems([...items]);
//     } else {
//       setSelectedItems([]);
//     }
//   }, [selectAll, items]);

//   const loadStockGroups = async () => {
//     try {
//       setLoading(true);
//       const response = await fetchLink({
//         address: `masters/stockGroupGet`,
//         method: "GET",
//       });
      
//       console.log("Stock Groups Response:", response);
      
//       // Handle different response formats
//       let groups = [];
//       if (response && response.success && response.data) {
//         groups = response.data;
//       } else if (response && Array.isArray(response)) {
//         groups = response;
//       } else if (response && response.data && Array.isArray(response.data)) {
//         groups = response.data;
//       }
      
//       console.log("Processed groups:", groups);
      
//       // Format the groups - handle both string and object responses
//       const formattedGroups = groups.map((group, index) => {
//         // If group is a string, convert to object
//         if (typeof group === 'string') {
//           return {
//             Item_Group_Id: index + 1,
//             Group_Name: group,
//           };
//         }
//         // If group is an object with Stock_Group property
//         if (group.Stock_Group) {
//           return {
//             Item_Group_Id: group.Item_Group_Id || index + 1,
//             Group_Name: group.Stock_Group,
//           };
//         }
//         // If group already has proper structure
//         return {
//           Item_Group_Id: group.Item_Group_Id || group.id || index + 1,
//           Group_Name: group.Group_Name || group.name || group.Stock_Group || 'Unknown',
//         };
//       });
      
//       setStockGroups(formattedGroups);
      
//       if (formattedGroups.length === 0) {
//         toast.info("No stock groups found");
//       } else {
//         console.log("Formatted groups for dropdown:", formattedGroups);
//       }
//     } catch (err) {
//       console.error("Error loading stock groups:", err);
//       toast.error("Failed to load stock groups");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadItemsByGroup = async (groupId) => {
//     try {
//       setLoading(true);
//       const response = await fetchLink({
//         address: `masters/stockItemGroup`,
//         method: "POST",
//         bodyData: { stockGroupId: groupId }
//       });
      
//       console.log("Items Response:", response);
      
//       // Handle different response formats
//       let itemsList = [];
//       if (response && response.success && response.data) {
//         itemsList = response.data;
//       } else if (response && Array.isArray(response)) {
//         itemsList = response;
//       } else if (response && response.data && Array.isArray(response.data)) {
//         itemsList = response.data;
//       }
      
//       setItems(itemsList);
      
//       if (itemsList.length === 0) {
//         toast.info("No items found for this stock group");
//       } else {
//         toast.success(`Found ${itemsList.length} items in this group`);
//       }
//     } catch (err) {
//       console.error("Error loading items:", err);
//       toast.error("Failed to load items");
//       setItems([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = async () => {
//     if (!fromDate || !toDate) {
//       toast.error("Please select both from and to dates");
//       return;
//     }

//     if (!selectedGroup) {
//       toast.error("Please select a stock group");
//       return;
//     }

//     if (selectedItems.length === 0) {
//       toast.error("Please select at least one item");
//       return;
//     }

//     try {
//       setLoading(true);
      
//       const itemIds = selectedItems.map(item => item.Product_Id);
      
//       // Fetch stock journal report
//       const response = await fetchLink({
//         address: `masters/stockItemGroupList`,
//         method: "POST",
//         bodyData: {
//           fromDate,
//           toDate,
//           stockGroupId: selectedGroup.Item_Group_Id,
//           itemIds
//         }
//       });
      
//       console.log("Report Response:", response);
      
//       if (response && response.success) {
//         const reportDataResponse = response.data;
//         setReportData({
//           source: reportDataResponse?.source || [],
//           destination: reportDataResponse?.destination || [],
//           allTransactions: reportDataResponse?.allTransactions || []
//         });
        
//         const transactionCount = reportDataResponse?.allTransactions?.length || 0;
//         toast.success(`Report loaded successfully. Found ${transactionCount} transactions`);
//       } else {
//         toast.error(response?.message || "Failed to fetch report data");
//         setReportData({ source: [], destination: [], allTransactions: [] });
//       }
//     } catch (err) {
//       console.error("Error fetching report:", err);
//       toast.error("Failed to fetch report data");
//       setReportData({ source: [], destination: [], allTransactions: [] });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReset = () => {
//     setSelectedGroup(null);
//     setSelectedItems([]);
//     setSelectAll(false);
//     setReportData({ source: [], destination: [], allTransactions: [] });
//     setFromDate(format(new Date().setDate(1), 'yyyy-MM-dd'));
//     setToDate(format(new Date(), 'yyyy-MM-dd'));
//     setReload(prev => !prev);
//     toast.info("Filters reset");
//   };

//   const handlePrint = () => {
//     const printWindow = window.open('', '_blank');
//     const dataToPrint = activeTab === 0 ? reportData.allTransactions : 
//                         activeTab === 1 ? reportData.source : 
//                         reportData.destination;
//     const tabTitle = activeTab === 0 ? 'All Transactions' : 
//                      activeTab === 1 ? 'Source Consumption' : 
//                      'Destination Production';
    
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Stock Journal Report - ${tabTitle}</title>
//           <style>
//             body { font-family: Arial, sans-serif; margin: 20px; }
//             h2 { color: #4a2c1a; }
//             table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
//             th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
//             th { background-color: #4a2c1a; color: white; }
//             .text-end { text-align: right; }
//             .header { text-align: center; margin-bottom: 20px; }
//             .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h2>Stock Journal Report</h2>
//             <p><strong>Period:</strong> ${format(new Date(fromDate), 'dd/MM/yyyy')} to ${format(new Date(toDate), 'dd/MM/yyyy')}</p>
//             <p><strong>Stock Group:</strong> ${selectedGroup?.Group_Name || 'N/A'}</p>
//             <p><strong>Selected Items:</strong> ${selectedItems.length} item(s)</p>
//             <p><strong>Report Type:</strong> ${tabTitle}</p>
//           </div>
//           <div>
//             <h3>Transaction Details</h3>
//             <table>
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Journal No</th>
//                   <th>Item Name</th>
//                   <th>Godown</th>
//                   <th class="text-end">Quantity</th>
//                   <th>Unit</th>
//                   <th class="text-end">Rate (₹)</th>
//                   <th class="text-end">Amount (₹)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${dataToPrint.map(row => `
//                   <tr>
//                     <td>${row.stock_journal_date ? format(new Date(row.stock_journal_date), 'dd/MM/yyyy') : '-'}</td>
//                     <td>${row.journal_no || '-'}</td>
//                     <td>${row.stock_item_name || '-'}</td>
//                     <td>${row.godown_name || '-'}</td>
//                     <td class="text-end">${(row.destina_consumt_qty || row.source_consumt_qty || 0).toFixed(2)}</td>
//                     <td>${row.destina_consumt_unit || row.source_consumt_unit || '-'}</td>
//                     <td class="text-end">${(row.destina_consumt_rate || row.source_consumt_rate || 0).toFixed(2)}</td>
//                     <td class="text-end">${(row.destina_consumt_amt || row.Source_consumt_amt || 0).toFixed(2)}</td>
//                   </tr>
//                 `).join('')}
//               </tbody>
//             </table>
//           </div>
//           <div class="footer">
//             <p>Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
//           </div>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.print();
//   };

//   const handleExportCSV = () => {
//     const dataToExport = activeTab === 0 ? reportData.allTransactions : 
//                          activeTab === 1 ? reportData.source : 
//                          reportData.destination;
//     const tabTitle = activeTab === 0 ? 'All_Transactions' : 
//                      activeTab === 1 ? 'Source_Consumption' : 
//                      'Destination_Production';
    
//     if (dataToExport.length === 0) {
//       toast.warning("No data to export");
//       return;
//     }
    
//     const headers = ['Date', 'Journal No', 'Item Name', 'Godown', 'Quantity', 'Unit', 'Rate', 'Amount'];
//     const csvRows = [
//       headers.join(','),
//       ...dataToExport.map(row => [
//         row.stock_journal_date ? format(new Date(row.stock_journal_date), 'dd/MM/yyyy') : '',
//         row.journal_no || '',
//         row.stock_item_name || '',
//         row.godown_name || '',
//         (row.destina_consumt_qty || row.source_consumt_qty || 0).toFixed(2),
//         row.destina_consumt_unit || row.source_consumt_unit || '',
//         (row.destina_consumt_rate || row.source_consumt_rate || 0).toFixed(2),
//         (row.destina_consumt_amt || row.Source_consumt_amt || 0).toFixed(2)
//       ].map(cell => `"${cell}"`).join(','))
//     ];
    
//     const csvContent = csvRows.join('\n');
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `stock_report_${tabTitle}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//     toast.success("Report exported successfully");
//   };

//   const renderTransactionTable = (data, title) => {
//     const totalQty = data.reduce((sum, row) => sum + (row.destina_consumt_qty || row.source_consumt_qty || 0), 0);
//     const totalAmount = data.reduce((sum, row) => sum + (row.destina_consumt_amt || row.Source_consumt_amt || 0), 0);
    
//     return (
//       <div>
//         <div className="table-responsive">
//           <table className="table table-sm table-bordered mb-0">
//             <thead className="table-dark">
//               <tr>
//                 <th>#</th>
//                 <th>Date</th>
//                 <th>Journal No</th>
//                 <th>Item Name</th>
//                 <th>Godown</th>
//                 <th className="text-end">Quantity</th>
//                 <th>Unit</th>
//                 <th className="text-end">Rate (₹)</th>
//                 <th className="text-end">Amount (₹)</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.length === 0 ? (
//                 <tr>
//                   <td colSpan="9" className="text-center">No data available</td>
//                 </tr>
//               ) : (
//                 data.map((row, idx) => (
//                   <tr key={idx}>
//                     <td>{idx + 1}</td>
//                     <td>{row.stock_journal_date ? format(new Date(row.stock_journal_date), 'dd/MM/yyyy') : '-'}</td>
//                     <td>{row.journal_no || '-'}</td>
//                     <td>{row.stock_item_name || '-'}</td>
//                     <td>{row.godown_name || '-'}</td>
//                     <td className="text-end">
//                       {Number(row.destina_consumt_qty || row.source_consumt_qty || 0).toFixed(2)}
//                     </td>
//                     <td>{row.destina_consumt_unit || row.source_consumt_unit || '-'}</td>
//                     <td className="text-end">
//                       {Number(row.destina_consumt_rate || row.source_consumt_rate || 0).toFixed(2)}
//                     </td>
//                     <td className="text-end">
//                       {Number(row.destina_consumt_amt || row.Source_consumt_amt || 0).toFixed(2)}
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//             {data.length > 0 && (
//               <tfoot className="table-secondary">
//                 <tr>
//                   <th colSpan="5">Total</th>
//                   <th className="text-end">{totalQty.toFixed(2)}</th>
//                   <th></th>
//                   <th></th>
//                   <th className="text-end">{totalAmount.toFixed(2)}</th>
//                 </tr>
//               </tfoot>
//             )}
//           </table>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <Fragment>
//       <div className="card">
//         <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
//           <span>STOCK JOURNAL REPORT</span>
//           <div className="d-flex align-items-center gap-2">
//             <Tooltip title="Export to CSV">
//               <IconButton onClick={handleExportCSV} size="small" sx={{ color: '#4a2c1a' }}>
//                 <DownloadIcon />
//               </IconButton>
//             </Tooltip>
//             <Tooltip title="Print">
//               <IconButton onClick={handlePrint} size="small" sx={{ color: '#4a2c1a' }}>
//                 <PrintIcon />
//               </IconButton>
//             </Tooltip>
//           </div>
//         </div>

//         <div className="card-body">
//           {/* Filters */}
//           <div className="row mb-3">
//             <div className="col-md-3 mb-2">
//               <label className="form-label fw-bold">From Date</label>
//               <input
//                 type="date"
//                 className="form-control"
//                 value={fromDate}
//                 onChange={(e) => setFromDate(e.target.value)}
//               />
//             </div>
//             <div className="col-md-3 mb-2">
//               <label className="form-label fw-bold">To Date</label>
//               <input
//                 type="date"
//                 className="form-control"
//                 value={toDate}
//                 onChange={(e) => setToDate(e.target.value)}
//               />
//             </div>
//             <div className="col-md-6 mb-2">
//               <label className="form-label fw-bold">Stock Group</label>
//               <select
//                 className="form-select"
//                 value={selectedGroup?.Item_Group_Id || ''}
//                 onChange={(e) => {
//                   const groupId = parseInt(e.target.value);
//                   const group = stockGroups.find(g => g.Item_Group_Id === groupId);
//                   setSelectedGroup(group);
//                 }}
//               >
//                 <option value="">-- Select Stock Group --</option>
//                 {stockGroups.map((group) => (
//                   <option key={group.Item_Group_Id} value={group.Item_Group_Id}>
//                     {group.Group_Name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Items Selection - Only show when group is selected */}
//           {selectedGroup && (
//             <div className="row mb-3">
//               <div className="col-12">
//                 <label className="form-label fw-bold">Select Items</label>
//                 <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
//                   {items.length === 0 ? (
//                     <div className="text-center text-muted py-2">
//                       No items found for this group
//                     </div>
//                   ) : (
//                     <>
//                       <div className="mb-2 pb-2 border-bottom">
//                         <FormControlLabel
//                           control={
//                             <Checkbox
//                               checked={selectAll}
//                               onChange={(e) => setSelectAll(e.target.checked)}
//                               size="small"
//                             />
//                           }
//                           label={`Select All (${items.length} items)`}
//                         />
//                       </div>
//                       <div className="row">
//                         {items.map((item) => (
//                           <div key={item.Product_Id} className="col-md-4 col-sm-6 mb-1">
//                             <FormControlLabel
//                               control={
//                                 <Checkbox
//                                   checked={selectedItems.some(i => i.Product_Id === item.Product_Id)}
//                                   onChange={(e) => {
//                                     if (e.target.checked) {
//                                       setSelectedItems([...selectedItems, item]);
//                                     } else {
//                                       setSelectedItems(selectedItems.filter(i => i.Product_Id !== item.Product_Id));
//                                       setSelectAll(false);
//                                     }
//                                   }}
//                                   size="small"
//                                 />
//                               }
//                               label={item.stock_item_name}
//                             />
//                           </div>
//                         ))}
//                       </div>
//                     </>
//                   )}
//                 </div>
//                 {selectedItems.length > 0 && (
//                   <div className="mt-2">
//                     <small className="text-muted">
//                       Selected: {selectedItems.length} item(s)
//                     </small>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           <div className="d-flex justify-content-end gap-2 mb-3">
//             <button
//               className="btn btn-primary"
//               onClick={handleSearch}
//               disabled={loading || !selectedGroup || selectedItems.length === 0}
//             >
//               {loading ? (
//                 <>
//                   <span className="spinner-border spinner-border-sm me-1"></span>
//                   Loading...
//                 </>
//               ) : (
//                 <>
//                   <SearchIcon sx={{ fontSize: '18px', mr: 1 }} />
//                   Search
//                 </>
//               )}
//             </button>
//             <button
//               className="btn btn-secondary"
//               onClick={handleReset}
//               disabled={loading}
//             >
//               <RefreshIcon sx={{ fontSize: '18px', mr: 1 }} />
//               Reset
//             </button>
//           </div>

//           {/* Loading Indicator */}
//           {loading && (
//             <div className="text-center my-4">
//               <div className="spinner-border text-primary" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//               <div className="mt-2 text-muted">Fetching report data...</div>
//             </div>
//           )}

//           {/* Tabs for different views */}
//           {reportData.allTransactions?.length > 0 && !loading && (
//             <div className="card mt-3">
//               <div className="card-header bg-white p-0">
//                 <ul className="nav nav-tabs" role="tablist">
//                   <li className="nav-item">
//                     <button
//                       className={`nav-link ${activeTab === 0 ? 'active' : ''}`}
//                       onClick={() => setActiveTab(0)}
//                       type="button"
//                     >
//                       All Transactions ({reportData.allTransactions.length})
//                     </button>
//                   </li>
//                   <li className="nav-item">
//                     <button
//                       className={`nav-link ${activeTab === 1 ? 'active' : ''}`}
//                       onClick={() => setActiveTab(1)}
//                       type="button"
//                     >
//                       Source Consumption ({reportData.source.length})
//                     </button>
//                   </li>
//                   <li className="nav-item">
//                     <button
//                       className={`nav-link ${activeTab === 2 ? 'active' : ''}`}
//                       onClick={() => setActiveTab(2)}
//                       type="button"
//                     >
//                       Destination Production ({reportData.destination.length})
//                     </button>
//                   </li>
//                 </ul>
//               </div>
//               <div className="card-body p-0">
//                 {activeTab === 0 && renderTransactionTable(reportData.allTransactions, 'All Transactions')}
//                 {activeTab === 1 && renderTransactionTable(reportData.source, 'Source Consumption')}
//                 {activeTab === 2 && renderTransactionTable(reportData.destination, 'Destination Production')}
//               </div>
//             </div>
//           )}

//           {/* No Data Message */}
//           {!loading && reportData.allTransactions?.length === 0 && selectedGroup && selectedItems.length > 0 && (
//             <div className="alert alert-info text-center mt-3">
//               <i className="fas fa-info-circle me-2"></i>
//               No transactions found for the selected criteria. Please try different dates or items.
//             </div>
//           )}
//         </div>
//       </div>
//     </Fragment>
//   );
// };

// export default StockReport;












import React, { useState, useEffect, Fragment, useCallback } from "react";
import {
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Sync as SyncIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  SyncAlt as SyncAltIcon
} from "@mui/icons-material";
import { format } from "date-fns";
import { fetchLink } from "../../Components/fetchComponent";
import { toast } from "react-toastify";

const StockReport = () => {
  const [fromDate, setFromDate] = useState(format(new Date().setDate(1), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [stockGroups, setStockGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [originalData, setOriginalData] = useState({ source: [], destination: [], allTransactions: [] });
  const [reportData, setReportData] = useState({ source: [], destination: [], allTransactions: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(1);
  const [reload, setReload] = useState(false);
  const [showZeroEntries, setShowZeroEntries] = useState(false);
  const [commonSourceRate, setCommonSourceRate] = useState("");
  const [commonDestinationRate, setCommonDestinationRate] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingCell, setEditingCell] = useState({ tab: null, index: null, field: null });
  const [editValue, setEditValue] = useState("");
  // ✅ NEW: Temp value for instant UI feedback
  const [tempEditValue, setTempEditValue] = useState("");

  useEffect(() => {
    loadStockGroups();
  }, [reload]);

  useEffect(() => {
    if (selectedGroup) {
      loadItemsByGroup(selectedGroup.Item_Group_Id);
      setSelectedItems([]);
      setSelectAll(false);
      setOriginalData({ source: [], destination: [], allTransactions: [] });
      setReportData({ source: [], destination: [], allTransactions: [] });
      setCommonSourceRate("");
      setCommonDestinationRate("");
    } else {
      setItems([]);
      setSelectedItems([]);
      setSelectAll(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectAll) {
      setSelectedItems([...items]);
    } else {
      setSelectedItems([]);
    }
  }, [selectAll, items]);

  useEffect(() => {
    if (originalData.allTransactions.length > 0) {
      applyZeroRateFilter();
    }
  }, [showZeroEntries]);

  const applyZeroRateFilter = () => {
    let sourceData = [...originalData.source];
    let destinationData = [...originalData.destination];
    
    if (!showZeroEntries) {
      sourceData = sourceData.filter(item => (item.source_consumt_rate || 0) !== 0);
      destinationData = destinationData.filter(item => (item.destina_consumt_rate || 0) !== 0);
    }
    
    const allTransactions = [...sourceData, ...destinationData];
    allTransactions.sort((a, b) => new Date(a.stock_journal_date) - new Date(b.stock_journal_date));
    
    setReportData({
      source: sourceData,
      destination: destinationData,
      allTransactions: allTransactions
    });
  };

 
  const loadStockGroups = async () => {
    try {
      setLoading(true);
      const response = await fetchLink({
        address: `inventory/stockGroupGet`,
        method: "GET",
      });
      
      let groups = [];

      if (response && response.success && response.data) {
        groups = response.data;
      } else if (response && Array.isArray(response)) {
        groups = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        groups = response.data;
      }
      
      const formattedGroups = groups.map((group) => {
        return {
          Item_Group_Id: group.Item_Group_Id,
          Group_Name: group.Group_Name,
          GST_P: group.GST_P,
          Group_HSN: group.Group_HSN,
          Grp: group.Grp
        };
      });
      
    
      const groupsWithAll = [
        {
          Item_Group_Id: 0,
          Group_Name: "All Stock Groups",
          GST_P: 0,
          Group_HSN: "0",
          Grp: "ALL"
        },
        ...formattedGroups
      ];
      
      setStockGroups(groupsWithAll);
      
      if (groupsWithAll.length <= 1) {
        toast.info("No stock groups found");
      }
    } catch (err) {
      console.error("Error loading stock groups:", err);
      toast.error("Failed to load stock groups");
    } finally {
      setLoading(false);
    }
  };


  const loadItemsByGroup = async (groupId) => {
    try {
      setLoading(true);
      
      
      const bodyData = groupId === 0 
        ? { stockGroupId: 0 }  
        : { stockGroupId: groupId };
      
      const response = await fetchLink({
        address: `inventory/stockItemGroup`,
        method: "POST",
        bodyData: bodyData
      });
      
      let itemsList = [];
      if (response && response.success && response.data) {
        itemsList = response.data;
      } else if (response && Array.isArray(response)) {
        itemsList = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        itemsList = response.data;
      }
      
      setItems(itemsList);
      
      if (itemsList.length === 0) {
        toast.info(groupId === 0 ? "No items found for all stock groups" : "No items found for this stock group");
      } else {
        toast.success(`Found ${itemsList.length} items ${groupId === 0 ? 'across all groups' : 'in this group'}`);
      }
    } catch (err) {
      console.error("Error loading items:", err);
      toast.error("Failed to load items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncRates = async () => {
    if (!originalData.allTransactions.length) {
      toast.warning("No data to sync rates");
      return;
    }

    if (!commonSourceRate && !commonDestinationRate) {
      toast.warning("Please enter at least one rate (Source or Destination) to sync");
      return;
    }

    setIsSyncing(true);
    try {
      let sourceRateValue = null;
      let destinationRateValue = null;
      let updateType = null;

      if (commonSourceRate && commonDestinationRate) {
        updateType = 'both';
        sourceRateValue = parseFloat(commonSourceRate);
        destinationRateValue = parseFloat(commonDestinationRate);
      } else if (commonSourceRate) {
        updateType = 'source';
        sourceRateValue = parseFloat(commonSourceRate);
      } else if (commonDestinationRate) {
        updateType = 'destination';
        destinationRateValue = parseFloat(commonDestinationRate);
      }

      if (updateType === 'source' && (isNaN(sourceRateValue))) {
        toast.error("Please enter a valid source rate greater than 0");
        setIsSyncing(false);
        return;
      }

      if (updateType === 'destination' && (isNaN(destinationRateValue))) {
        toast.error("Please enter a valid destination rate greater than 0");
        setIsSyncing(false);
        return;
      }

      if (updateType === 'both') {
        if (isNaN(sourceRateValue)) {
          toast.error("Please enter a valid source rate greater than 0");
          setIsSyncing(false);
          return;
        }
        if (isNaN(destinationRateValue)) {
          toast.error("Please enter a valid destination rate greater than 0");
          setIsSyncing(false);
          return;
        }
      }

    
      const requestBody = {
        type: updateType,
        FromDate: fromDate,
        ToDate: toDate,
        StockGroupId: selectedGroup?.Item_Group_Id?.toString() || null,  
        ItemId: null
      };

      if (updateType === 'source') {
        requestBody.sourceRate = sourceRateValue;
      } else if (updateType === 'destination') {
        requestBody.destinationRate = destinationRateValue;
      } else if (updateType === 'both') {
        requestBody.sourceRate = sourceRateValue;
        requestBody.destinationRate = destinationRateValue;
      }

      const response = await fetchLink({
        address: `inventory/updateProcessingRates`,
        method: "PUT",
        bodyData: requestBody
      });

      if (response && response.success) {
        let updatedSource = [...originalData.source];
        let updatedDestination = [...originalData.destination];

        if (updateType === 'source' || updateType === 'both') {
          updatedSource = updatedSource.map(item => ({
            ...item,
            source_consumt_rate: sourceRateValue,
            Source_consumt_amt: (item.source_consumt_qty || 0) * sourceRateValue
          }));
        }

        if (updateType === 'destination' || updateType === 'both') {
          updatedDestination = updatedDestination.map(item => ({
            ...item,
            destina_consumt_rate: destinationRateValue,
            destina_consumt_amt: (item.destina_consumt_qty || 0) * destinationRateValue
          }));
        }

        setOriginalData({
          source: updatedSource,
          destination: updatedDestination,
          allTransactions: [...updatedSource, ...updatedDestination]
        });

        let displaySource = [...updatedSource];
        let displayDestination = [...updatedDestination];
        
        if (!showZeroEntries) {
          displaySource = displaySource.filter(item => (item.source_consumt_rate || 0) !== 0);
          displayDestination = displayDestination.filter(item => (item.destina_consumt_rate || 0) !== 0);
        }
        
        const allTransactions = [...displaySource, ...displayDestination];
        allTransactions.sort((a, b) => new Date(a.stock_journal_date) - new Date(b.stock_journal_date));
        
        setReportData({
          source: displaySource,
          destination: displayDestination,
          allTransactions: allTransactions
        });

        if (updateType === 'both') {
          toast.success(`Source and Destination rates updated successfully!`);
        } else if (updateType === 'source') {
          toast.success(`Source rates updated successfully!`);
          setCommonSourceRate("");
        } else if (updateType === 'destination') {
          toast.success(`Destination rates updated successfully!`);
          setCommonDestinationRate("");
        }
      } else {
        toast.error(response?.message || "Failed to update rates");
      }
    } catch (err) {
      console.error("Error syncing rates:", err);
      toast.error("Failed to sync rates: " + (err.message || "Unknown error"));
    } finally {
      setIsSyncing(false);
    }
  };

  // ✅ OPTIMIZED: Start editing without API call, just set local state
  const handleStartEdit = useCallback((tab, index, field, currentValue) => {
    setEditingCell({ tab, index, field });
    setEditValue(currentValue.toString());
    setTempEditValue(currentValue.toString());
  }, []);

  // ✅ OPTIMIZED: Use temp value for instant feedback
  const handleEditInputChange = useCallback((e) => {
    setTempEditValue(e.target.value);
    setEditValue(e.target.value);
  }, []);

  const handleOverAllSync = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    if (!selectedGroup) {
      toast.error("Please select a stock group");
      return;
    }

    setIsSyncing(true);
    try {
      const requestBody = {
        FromDate: fromDate,
        ToDate: toDate,
        Item_Group: selectedGroup?.Item_Group_Id || 0  // ✅ Will be 0 for "All"
      };

      const response = await fetchLink({
        address: `inventory/updateOverAllGroupUpdate`,
        method: "PUT",
        bodyData: requestBody
      });

      if (response && response.success) {
        toast.success(response.message || "Stock journal rates updated successfully using daily closing logic");
        await handleSearch();
      } else {
        toast.error(response?.message || "Failed to update stock journal rates");
      }
    } catch (err) {
      console.error("Error in overall sync:", err);
      toast.error("Failed to sync rates: " + (err.message || "Unknown error"));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveRate = async () => {
    const { tab, index, field } = editingCell;
    const newRate = parseFloat(editValue);
    
    if (isNaN(newRate)) {
      toast.error("Please enter a valid number");
      return;
    }

    try {
      const currentRow = tab === 'source' 
        ? reportData.source[index] 
        : reportData.destination[index];
      
      if (!currentRow) {
        toast.error("Row not found");
        return;
      }

      let originalIndex = -1;
      let stockJournId = null;
      
      if (tab === 'source') {
        stockJournId = currentRow.stock_journ_sour_id;
        originalIndex = originalData.source.findIndex(
          item => item.stock_journ_sour_id === stockJournId
        );
      } else {
        stockJournId = currentRow.stock_journ_dest_id;
        originalIndex = originalData.destination.findIndex(
          item => item.stock_journ_dest_id === stockJournId
        );
      }

      if (originalIndex === -1) {
        toast.error("Original record not found");
        return;
      }

      let updatedOriginalSource = [...originalData.source];
      let updatedOriginalDestination = [...originalData.destination];
      
      if (tab === 'source') {
        updatedOriginalSource[originalIndex] = {
          ...updatedOriginalSource[originalIndex],
          [field]: newRate,
          Source_consumt_amt: (updatedOriginalSource[originalIndex].source_consumt_qty || 0) * newRate
        };
      } else {
        updatedOriginalDestination[originalIndex] = {
          ...updatedOriginalDestination[originalIndex],
          [field]: newRate,
          destina_consumt_amt: (updatedOriginalDestination[originalIndex].destina_consumt_qty || 0) * newRate
        };
      }

      const updateData = {
        type: tab,
        [tab === 'source' ? 'stock_journ_sour_id' : 'stock_journ_dest_id']: stockJournId,
        [tab === 'source' ? 'sourceRate' : 'destinationRate']: newRate
      };

      const response = await fetchLink({
        address: `inventory/updateProcessingRates`,
        method: "PUT",
        bodyData: updateData
      });

      if (response && response.success) {
        setOriginalData({
          source: updatedOriginalSource,
          destination: updatedOriginalDestination,
          allTransactions: [...updatedOriginalSource, ...updatedOriginalDestination]
        });

        let displaySource = [...updatedOriginalSource];
        let displayDestination = [...updatedOriginalDestination];
        
        if (!showZeroEntries) {
          displaySource = displaySource.filter(item => (item.source_consumt_rate || 0) !== 0);
          displayDestination = displayDestination.filter(item => (item.destina_consumt_rate || 0) !== 0);
        }
        
        const allTransactions = [...displaySource, ...displayDestination];
        allTransactions.sort((a, b) => new Date(a.stock_journal_date) - new Date(b.stock_journal_date));
        
        setReportData({
          source: displaySource,
          destination: displayDestination,
          allTransactions: allTransactions
        });
        
        toast.success("Rate updated successfully");
        
        if (newRate === 0 && !showZeroEntries) {
          toast.info("Row with zero rate is now hidden. Check 'Show Zero Rate Entries' to view it.");
        }
      } else {
        toast.error(response?.message || "Failed to update rate");
      }
    } catch (err) {
      console.error("Error saving rate:", err);
      toast.error("Failed to update rate: " + (err.message || "Unknown error"));
    } finally {
      setEditingCell({ tab: null, index: null, field: null });
      setEditValue("");
      setTempEditValue("");
    }
  };

  const handleCancelEdit = useCallback(() => {
    setEditingCell({ tab: null, index: null, field: null });
    setEditValue("");
    setTempEditValue("");
  }, []);

  // ✅ MODIFIED: Pass Item_Group_Id to API (0 for all groups)
  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    if (!selectedGroup) {
      toast.error("Please select a stock group");
      return;
    }

    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    try {
      setLoading(true);
      
      const itemIds = selectedItems.map(item => item.Product_Id);
      
      // ✅ Pass Item_Group_Id as is (0 for all, or specific ID)
      const response = await fetchLink({
        address: `inventory/stockItemGroupList`,
        method: "POST",
        bodyData: {
          fromDate,
          toDate,
          stockGroupId: selectedGroup.Item_Group_Id,  // Will be 0 for "All"
          itemIds
        }
      });
      
      if (response && response.success) {
        const reportDataResponse = response.data;
        
        let sourceData = reportDataResponse?.source || [];
        let destinationData = reportDataResponse?.destination || [];
        
        const originalSource = [...sourceData];
        const originalDestination = [...destinationData];
        const originalAll = [...sourceData, ...destinationData];
        originalAll.sort((a, b) => new Date(a.stock_journal_date) - new Date(b.stock_journal_date));
        
        setOriginalData({
          source: originalSource,
          destination: originalDestination,
          allTransactions: originalAll
        });
        
        let displaySource = [...sourceData];
        let displayDestination = [...destinationData];
        
        if (!showZeroEntries) {
          displaySource = displaySource.filter(item => (item.source_consumt_rate || 0) !== 0);
          displayDestination = displayDestination.filter(item => (item.destina_consumt_rate || 0) !== 0);
        }
        
        const displayAll = [...displaySource, ...displayDestination];
        displayAll.sort((a, b) => new Date(a.stock_journal_date) - new Date(b.stock_journal_date));
        
        setReportData({
          source: displaySource,
          destination: displayDestination,
          allTransactions: displayAll
        });
        
        toast.success(`Report loaded successfully`);
      } else {
        toast.error(response?.message || "Failed to fetch report data");
        setOriginalData({ source: [], destination: [], allTransactions: [] });
        setReportData({ source: [], destination: [], allTransactions: [] });
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      toast.error("Failed to fetch report data");
      setOriginalData({ source: [], destination: [], allTransactions: [] });
      setReportData({ source: [], destination: [], allTransactions: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedGroup(null);
    setSelectedItems([]);
    setSelectAll(false);
    setOriginalData({ source: [], destination: [], allTransactions: [] });
    setReportData({ source: [], destination: [], allTransactions: [] });
    setFromDate(format(new Date().setDate(1), 'yyyy-MM-dd'));
    setToDate(format(new Date(), 'yyyy-MM-dd'));
    setShowZeroEntries(false);
    setCommonSourceRate("");
    setCommonDestinationRate("");
    setReload(prev => !prev);
    toast.info("Filters reset");
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const dataToPrint = activeTab === 1 ? reportData.source : reportData.destination;
    const tabTitle = activeTab === 1 ? 'Source Consumption' : 'Destination Production';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Stock Journal Report - ${tabTitle}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { color: #4a2c1a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4a2c1a; color: white; }
            .text-end { text-align: right; }
            .header { text-align: center; margin-bottom: 20px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Stock Journal Report</h2>
            <p><strong>Period:</strong> ${format(new Date(fromDate), 'dd/MM/yyyy')} to ${format(new Date(toDate), 'dd/MM/yyyy')}</p>
            <p><strong>Stock Group:</strong> ${selectedGroup?.Group_Name || 'N/A'}</p>
            <p><strong>Selected Items:</strong> ${selectedItems.length} item(s)</p>
            <p><strong>Report Type:</strong> ${tabTitle}</p>
            <p><strong>Show Zero Rate Entries:</strong> ${showZeroEntries ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <h3>Transaction Details</h3>
            <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #4a2c1a; color: white;">
                  <th>Date</th>
                  <th>Journal No</th>
                  <th>Item Name</th>
                  <th>Godown</th>
                  <th style="text-align: right">Quantity</th>
                  <th>Unit</th>
                  <th style="text-align: right">Rate (₹)</th>
                  <th style="text-align: right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${dataToPrint.map(row => `
                  <tr>
                    <td>${row.stock_journal_date ? format(new Date(row.stock_journal_date), 'dd/MM/yyyy') : '-'}</td>
                    <td>${row.journal_no || '-'}</td>
                    <td>${row.stock_item_name || '-'}</td>
                    <td>${row.godown_name || '-'}</td>
                    <td style="text-align: right">${(row.destina_consumt_qty || row.source_consumt_qty || 0).toFixed(2)}</td>
                    <td>${row.destina_consumt_unit || row.source_consumt_unit || '-'}</td>
                    <td style="text-align: right">${(row.destina_consumt_rate || row.source_consumt_rate || 0).toFixed(2)}</td>
                    <td style="text-align: right">${(row.destina_consumt_amt || row.Source_consumt_amt || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="footer">
            <p>Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    const dataToExport = activeTab === 1 ? reportData.source : reportData.destination;
    const tabTitle = activeTab === 1 ? 'Source_Consumption' : 'Destination_Production';
    
    if (dataToExport.length === 0) {
      toast.warning("No data to export");
      return;
    }
    
    const headers = ['Date', 'Journal No', 'Item Name', 'Godown', 'Quantity', 'Unit', 'Rate', 'Amount'];
    const csvRows = [
      headers.join(','),
      ...dataToExport.map(row => [
        row.stock_journal_date ? format(new Date(row.stock_journal_date), 'dd/MM/yyyy') : '',
        row.journal_no || '',
        row.stock_item_name || '',
        row.godown_name || '',
        (row.destina_consumt_qty || row.source_consumt_qty || 0).toFixed(2),
        row.destina_consumt_unit || row.source_consumt_unit || '',
        (row.destina_consumt_rate || row.source_consumt_rate || 0).toFixed(2),
        (row.destina_consumt_amt || row.Source_consumt_amt || 0).toFixed(2)
      ].map(cell => `"${cell}"`).join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_report_${tabTitle}_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };


  const renderEditableRateCell = (value, tab, index, field) => {
    const isEditing = editingCell.tab === tab && editingCell.index === index && editingCell.field === field;
    const isZeroRate = value === 0;
    
    if (isEditing) {
      return (
        <div className="d-flex align-items-center gap-1">
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: '100px' }}
            value={tempEditValue}
            onChange={handleEditInputChange}
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveRate();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            step="0.01"
            min="0"
          />
          <IconButton size="small" onClick={handleSaveRate} color="primary">
            <SaveIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleCancelEdit} color="secondary">
            <CancelIcon fontSize="small" />
          </IconButton>
        </div>
      );
    }
    
    return (
      <span 
        onClick={() => handleStartEdit(tab, index, field, value)}
        style={{ 
          color: isZeroRate ? '#dc3545' : 'inherit', 
          fontWeight: isZeroRate ? 'bold' : 'normal',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '4px',
          display: 'inline-block',
          transition: 'background-color 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d4edda'} // Light green
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        ₹{value.toFixed(2)}
      </span>
    );
  };

  const renderTransactionTable = (data, tabType) => {
    const totalQty = data.reduce((sum, row) => sum + (row.destina_consumt_qty || row.source_consumt_qty || 0), 0);
    const totalAmount = data.reduce((sum, row) => sum + (row.destina_consumt_amt || row.Source_consumt_amt || 0), 0);
    
    return (
      <div className="table-responsive">
        <table className="table table-sm table-bordered mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Journal No</th>
              <th>Item Name</th>
              <th>Godown</th>
              <th className="text-end">Quantity</th>
              <th>Unit</th>
              <th className="text-end">Rate (₹)</th>
              <th className="text-end">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">No data available</td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>{row.stock_journal_date ? format(new Date(row.stock_journal_date), 'dd/MM/yyyy') : '-'}</td>
                  <td>{row.journal_no || '-'}</td>
                  <td>{row.stock_item_name || '-'}</td>
                  <td>{row.godown_name || '-'}</td>
                  <td className="text-end">{Number(row.destina_consumt_qty || row.source_consumt_qty || 0).toFixed(2)}</td>
                  <td>{row.destina_consumt_unit || row.source_consumt_unit || '-'}</td>
                  <td className="text-end">
                    {tabType === 'source' 
                      ? renderEditableRateCell(row.source_consumt_rate || 0, 'source', idx, 'source_consumt_rate')
                      : renderEditableRateCell(row.destina_consumt_rate || 0, 'destination', idx, 'destina_consumt_rate')
                    }
                  </td>
                  <td className="text-end">{Number(row.destina_consumt_amt || row.Source_consumt_amt || 0).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
          {data.length > 0 && (
            <tfoot className="table-secondary">
              <tr>
                <th colSpan="5">Total</th>
                <th className="text-end">{totalQty.toFixed(2)}</th>
                <th></th>
                <th></th>
                <th className="text-end">{totalAmount.toFixed(2)}</th>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    );
  };

  return (
    <Fragment>
      <div className="card">
        <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
          <span>STOCK JOURNAL REPORT</span>
          <div className="d-flex align-items-center gap-2">
            <Tooltip title="Export to CSV">
              <IconButton onClick={handleExportCSV} size="small" sx={{ color: '#4a2c1a' }}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton onClick={handlePrint} size="small" sx={{ color: '#4a2c1a' }}>
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="card-body">
          <div className="row mb-3">
            <div className="col-md-3 mb-2">
              <label className="form-label fw-bold">From Date</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="col-md-3 mb-2">
              <label className="form-label fw-bold">To Date</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <div className="col-md-6 mb-2">
              <label className="form-label fw-bold">Stock Group</label>
              <select
                className="form-select"
                value={selectedGroup?.Item_Group_Id || ''}
                onChange={(e) => {
                  const groupId = e.target.value;
                  const group = stockGroups.find(g => g.Item_Group_Id.toString() === groupId);
                  setSelectedGroup(group);
                }}
              >
                <option value="">-- Select Stock Group --</option>
                {stockGroups.map((group) => (
                  <option key={group.Item_Group_Id} value={group.Item_Group_Id}>
                    {group.Group_Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedGroup && (
            <div className="row mb-3">
              <div className="col-12">
                <label className="form-label fw-bold">Select Items</label>
                <div className="border rounded p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {items.length === 0 ? (
                    <div className="text-center text-muted py-2">No items found for this group</div>
                  ) : (
                    <>
                      <div className="mb-2 pb-2 border-bottom">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectAll}
                              onChange={(e) => setSelectAll(e.target.checked)}
                              size="small"
                            />
                          }
                          label={`Select All (${items.length} items)`}
                        />
                      </div>
                      <div className="row">
                        {items.map((item) => (
                          <div key={item.Product_Id} className="col-md-4 col-sm-6 mb-1">
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedItems.some(i => i.Product_Id === item.Product_Id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedItems([...selectedItems, item]);
                                    } else {
                                      setSelectedItems(selectedItems.filter(i => i.Product_Id !== item.Product_Id));
                                      setSelectAll(false);
                                    }
                                  }}
                                  size="small"
                                />
                              }
                              label={item.stock_item_name}
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="row mb-3">
            <div className="col-12">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showZeroEntries}
                    onChange={(e) => setShowZeroEntries(e.target.checked)}
                    size="small"
                  />
                }
                label="Show Zero Rate Entries"
              />
            </div>
            {originalData.allTransactions?.length > 0 && !loading && (
              <div className="col-12 py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex gap-3">
                    <div className="d-flex align-items-center gap-2">
                      <label className="fw-bold mb-0">Source Rate:</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        style={{ width: '120px' }}
                        placeholder="Enter rate"
                        value={commonSourceRate}
                        onChange={(e) => setCommonSourceRate(e.target.value)}
                      />
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <label className="fw-bold mb-0">Destination Rate:</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        style={{ width: '120px' }}
                        placeholder="Enter rate"
                        value={commonDestinationRate}
                        onChange={(e) => setCommonDestinationRate(e.target.value)}
                      />
                    </div>
                    <Tooltip title="Apply Common Rates to All Rows">
                      <IconButton 
                        onClick={handleSyncRates} 
                        size="small" 
                        color="primary"
                        disabled={isSyncing || (!commonSourceRate && !commonDestinationRate)}
                      >
                        {isSyncing ? <span className="spinner-border spinner-border-sm" /> : <SyncIcon />}
                      </IconButton>
                    </Tooltip>
                  </div>
                  <Tooltip title="Overall Rate Sync (Daily Closing Logic)">
                    <IconButton 
                      onClick={handleOverAllSync} 
                      size="small" 
                      color="secondary"
                      disabled={isSyncing}
                    >
                      {isSyncing ? <span className="spinner-border spinner-border-sm" /> : <SyncAltIcon />}
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={loading || !selectedGroup || selectedItems.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm"></span>
                  Loading...
                </>
              ) : (
                <>
                  <SearchIcon sx={{ fontSize: '18px' }} />
                  Search
                </>
              )}
            </button>
            <button className="btn btn-secondary" onClick={handleReset} disabled={loading}>
              <RefreshIcon sx={{ fontSize: '18px' }} />
              Reset
            </button>
          </div>

          {reportData.allTransactions?.length > 0 && !loading && (
            <div className="card mt-3">
              <div className="card-header bg-white p-0">
                <ul className="nav nav-tabs" role="tablist">
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 1 ? 'active' : ''}`}
                      onClick={() => setActiveTab(1)}
                      type="button"
                    >
                      Source Consumption ({reportData.source.length})
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 2 ? 'active' : ''}`}
                      onClick={() => setActiveTab(2)}
                      type="button"
                    >
                      Destination Production ({reportData.destination.length})
                    </button>
                  </li>
                </ul>
              </div>
              <div className="card-body p-0">
                {activeTab === 1 && renderTransactionTable(reportData.source, 'source')}
                {activeTab === 2 && renderTransactionTable(reportData.destination, 'destination')}
              </div>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default StockReport;