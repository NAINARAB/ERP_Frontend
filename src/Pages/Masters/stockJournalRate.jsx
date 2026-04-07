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






import React, { useState, useEffect, Fragment } from "react";
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
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
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
        address: `masters/stockGroupGet`,
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
      
      const formattedGroups = groups.map((group, index) => {
        if (typeof group === 'string') {
          return { Item_Group_Id: index + 1, Group_Name: group };
        }
        if (group.Stock_Group) {
          return { Item_Group_Id: group.Item_Group_Id || index + 1, Group_Name: group.Stock_Group };
        }
        return {
          Item_Group_Id: group.Item_Group_Id || group.id || index + 1,
          Group_Name: group.Group_Name || group.name || group.Stock_Group || 'Unknown',
        };
      });
      
      setStockGroups(formattedGroups);
      
      if (formattedGroups.length === 0) {
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
      const response = await fetchLink({
        address: `masters/stockItemGroup`,
        method: "POST",
        bodyData: { stockGroupId: groupId }
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
        toast.info("No items found for this stock group");
      } else {
        toast.success(`Found ${itemsList.length} items in this group`);
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

    setIsSyncing(true);
    try {
      let updatedSource = [...originalData.source];
      let updatedDestination = [...originalData.destination];

      if (commonSourceRate && updatedSource.length) {
        const rate = parseFloat(commonSourceRate);
        updatedSource = updatedSource.map(item => ({
          ...item,
          source_consumt_rate: rate,
          Source_consumt_amt: (item.source_consumt_qty || 0) * rate
        }));
      }

      if (commonDestinationRate && updatedDestination.length) {
        const rate = parseFloat(commonDestinationRate);
        updatedDestination = updatedDestination.map(item => ({
          ...item,
          destina_consumt_rate: rate,
          destina_consumt_amt: (item.destina_consumt_qty || 0) * rate
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

      toast.success("Rates synced successfully!");
      setCommonSourceRate("");
      setCommonDestinationRate("");
    } catch (err) {
      console.error("Error syncing rates:", err);
      toast.error("Failed to sync rates");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditRate = (tab, index, field, currentValue) => {
    setEditingCell({ tab, index, field });
    setEditValue(currentValue.toString());
  };

  const handleSaveRate = () => {
    const { tab, index, field } = editingCell;
    const newRate = parseFloat(editValue);
    
    if (isNaN(newRate)) {
      toast.error("Please enter a valid number");
      return;
    }

    let updatedOriginalSource = [...originalData.source];
    let updatedOriginalDestination = [...originalData.destination];
    
    if (tab === 'source') {
      const updatedItem = {
        ...updatedOriginalSource[index],
        [field]: newRate,
        Source_consumt_amt: (updatedOriginalSource[index].source_consumt_qty || 0) * newRate
      };
      updatedOriginalSource[index] = updatedItem;
    } else if (tab === 'destination') {
      const updatedItem = {
        ...updatedOriginalDestination[index],
        [field]: newRate,
        destina_consumt_amt: (updatedOriginalDestination[index].destina_consumt_qty || 0) * newRate
      };
      updatedOriginalDestination[index] = updatedItem;
    }

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
    
    setEditingCell({ tab: null, index: null, field: null });
    setEditValue("");
    toast.success("Rate updated successfully");
  };

  const handleCancelEdit = () => {
    setEditingCell({ tab: null, index: null, field: null });
    setEditValue("");
  };

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
      
      const response = await fetchLink({
        address: `masters/stockItemGroupList`,
        method: "POST",
        bodyData: {
          fromDate,
          toDate,
          stockGroupId: selectedGroup.Item_Group_Id,
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
        
        toast.success(`Report loaded successfully. Found ${displayAll.length} transactions`);
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
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Journal No</th>
                  <th>Item Name</th>
                  <th>Godown</th>
                  <th class="text-end">Quantity</th>
                  <th>Unit</th>
                  <th class="text-end">Rate (₹)</th>
                  <th class="text-end">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${dataToPrint.map(row => `
                  <tr>
                    <td>${row.stock_journal_date ? format(new Date(row.stock_journal_date), 'dd/MM/yyyy') : '-'}</td>
                    <td>${row.journal_no || '-'}</td>
                    <td>${row.stock_item_name || '-'}</td>
                    <td>${row.godown_name || '-'}</td>
                    <td class="text-end">${(row.destina_consumt_qty || row.source_consumt_qty || 0).toFixed(2)}</td>
                    <td>${row.destina_consumt_unit || row.source_consumt_unit || '-'}</td>
                    <td class="text-end">${(row.destina_consumt_rate || row.source_consumt_rate || 0).toFixed(2)}</td>
                    <td class="text-end">${(row.destina_consumt_amt || row.Source_consumt_amt || 0).toFixed(2)}</td>
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
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSaveRate();
              if (e.key === 'Escape') handleCancelEdit();
            }}
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
      <div className="d-flex align-items-center justify-content-between gap-2">
        <span style={{ color: isZeroRate ? '#dc3545' : 'inherit', fontWeight: isZeroRate ? 'bold' : 'normal' }}>
          ₹{value.toFixed(2)}
        </span>
        <IconButton 
          size="small" 
          onClick={() => handleEditRate(tab, index, field, value)}
          sx={{ padding: '2px' }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </div>
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
                  const groupId = parseInt(e.target.value);
                  const group = stockGroups.find(g => g.Item_Group_Id === groupId);
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
              {!showZeroEntries && originalData.allTransactions.length > 0 && (
                <span className="text-muted ms-2" style={{ fontSize: '12px' }}></span>
              )}
              {showZeroEntries && originalData.allTransactions.length > 0 && (
                <span className="text-muted ms-2" style={{ fontSize: '12px' }}></span>
              )}
            </div>
          </div>

          {originalData.allTransactions?.length > 0 && !loading && (
            <div className="row mb-3">
              <div className="col-12">
                <div className="card bg-light">
                  <div className="card-body py-2">
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
                    <div className="mt-2">
                      {/* <small className="text-muted">
                        Click on any rate value to edit it individually, or use common rates above to update all rows at once.
                      </small> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="d-flex justify-content-end gap-2 mb-3">
            <button
              className="btn btn-primary"
              onClick={handleSearch}
              disabled={loading || !selectedGroup || selectedItems.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Loading...
                </>
              ) : (
                <>
                  <SearchIcon sx={{ fontSize: '18px', mr: 1 }} />
                  Search
                </>
              )}
            </button>
            <button className="btn btn-secondary" onClick={handleReset} disabled={loading}>
              <RefreshIcon sx={{ fontSize: '18px', mr: 1 }} />
              Reset
            </button>
          </div>

          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2 text-muted">Fetching report data...</div>
            </div>
          )}

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

          {/* {!loading && reportData.allTransactions?.length === 0 && selectedGroup && selectedItems.length > 0 && (
            <div className="alert alert-info text-center mt-3">
              No transactions found for the selected criteria. Please try different dates or items.
            </div>
          )} */}
        </div>
      </div>
    </Fragment>
  );
};

export default StockReport;