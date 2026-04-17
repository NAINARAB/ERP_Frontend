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
} from "@mui/icons-material";
import { format, subDays } from "date-fns";
import { fetchLink } from "../../Components/fetchComponent";
import { toast } from "react-toastify";

const StockValueSync = () => {
const [fromDate, setFromDate] = useState(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [stockGroups, setStockGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [closingBalances, setClosingBalances] = useState([]);
  const [historyList, setHistoryList] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });

  const stockGroupsWithAll = [{ Item_Group_Id: "0", Group_Name: "-- All Stock Groups --" }, ...stockGroups];

  useEffect(() => {
    loadStockGroups();
  }, [reload]);

  useEffect(() => {
    if (selectedGroup && selectedGroup.Item_Group_Id !== "0") {
      loadItemsByGroup(selectedGroup.Item_Group_Id);
      setSelectedItems([]);
      setSelectAll(false);
   
    } else if (selectedGroup && selectedGroup.Item_Group_Id === "0") {
      setItems([]);
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setItems([]);
      setSelectedItems([]);
      setSelectAll(false);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectAll && items.length > 0) {
      setSelectedItems([...items]);
    } else {
      setSelectedItems([]);
    }
  }, [selectAll, items]);

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
      
      const formattedGroups = groups.map((group, index) => {
        if (typeof group === 'string') {
          return { Item_Group_Id: (index + 1).toString(), Group_Name: group };
        }
        if (group.Stock_Group) {
          return { 
            Item_Group_Id: group.Item_Group_Id?.toString() || (index + 1).toString(), 
            Group_Name: group.Stock_Group 
          };
        }
        return {
          Item_Group_Id: group.Item_Group_Id?.toString() || group.id?.toString() || (index + 1).toString(),
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
        address: `inventory/stockItemGroup`,
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

 
  const fetchClosingBalanceForGroup = async (groupId, groupName, preDate) => {
    try {
      const requestBody = {
        Pre_date: preDate,
        FromDate: fromDate,
        ToDate: toDate,
        stock_group_id: parseInt(groupId)
      };

     

      const response = await fetchLink({
        address: `inventory/stockValueSync`,
        method: "POST",
        bodyData: requestBody
      });
      
      if (response && response.success && response.data) {
        const data = response.data;
        
        let closingBalance = null;
        if (data.closingBalance) {
          closingBalance = {
            id: Date.now() + Math.random(), // Unique ID for history
            itemGroupId: data.closingBalance.Item_Group_Id || groupId,
            groupName: data.closingBalance.Group_Name || groupName,
            transDate: data.closingBalance.Trans_Date,
            closingRate: data.closingBalance.CL_Rate || 0,
            closingValue: data.closingBalance.CL_Value || 0,
            stockValue: data.closingBalance.Stock_Value || 0,
            fromDate: fromDate,
            toDate: toDate,
            fetchDate: new Date().toISOString(),
            fetchStatus: 'Success',
            searchCriteria: {
              fromDate: fromDate,
              toDate: toDate,
              groupId: groupId,
              groupName: groupName
            }
          };
        } else {
          closingBalance = {
            id: Date.now() + Math.random(),
            itemGroupId: groupId,
            groupName: groupName,
            transDate: toDate,
            closingRate: 0,
            closingValue: 0,
            stockValue: 0,
            fromDate: fromDate,
            toDate: toDate,
            fetchDate: new Date().toISOString(),
            fetchStatus: 'No Data',
            searchCriteria: {
              fromDate: fromDate,
              toDate: toDate,
              groupId: groupId,
              groupName: groupName
            }
          };
        }
        
        return {
          success: true,
          closingBalance: closingBalance,
          groupName: groupName,
          groupId: groupId
        };
      } else {
        return {
          success: false,
          error: response?.message || `Failed to fetch data for ${groupName}`,
          groupName: groupName,
          groupId: groupId,
          closingBalance: {
            id: Date.now() + Math.random(),
            itemGroupId: groupId,
            groupName: groupName,
            transDate: toDate,
            closingRate: 0,
            closingValue: 0,
            stockValue: 0,
            fromDate: fromDate,
            toDate: toDate,
            fetchDate: new Date().toISOString(),
            fetchStatus: 'Failed',
            error: response?.message,
            searchCriteria: {
              fromDate: fromDate,
              toDate: toDate,
              groupId: groupId,
              groupName: groupName
            }
          }
        };
      }
    } catch (err) {
      console.error(`Error fetching data for group ${groupName}:`, err);
      return {
        success: false,
        error: err.message || `Error fetching data for ${groupName}`,
        groupName: groupName,
        groupId: groupId,
        closingBalance: {
          id: Date.now() + Math.random(),
          itemGroupId: groupId,
          groupName: groupName,
          transDate: toDate,
          closingRate: 0,
          closingValue: 0,
          stockValue: 0,
          fromDate: fromDate,
          toDate: toDate,
          fetchDate: new Date().toISOString(),
          fetchStatus: 'Failed',
          error: err.message,
          searchCriteria: {
            fromDate: fromDate,
            toDate: toDate,
            groupId: groupId,
            groupName: groupName
          }
        }
      };
    }
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

    // For specific group, need items selection
    if (selectedGroup.Item_Group_Id !== "0" && selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    try {
      setLoading(true);
      
      // Calculate Pre_date as fromDate - 1 day
      const preDate = format(subDays(new Date(fromDate), 1), 'yyyy-MM-dd');
      
      // If "All" is selected, fetch data for all groups one by one
      if (selectedGroup.Item_Group_Id === "0") {
        const allGroups = stockGroups;
        const totalGroups = allGroups.length;
        
        if (totalGroups === 0) {
          toast.warning("No stock groups found to process");
          setLoading(false);
          return;
        }
        
        setProgress({ current: 0, total: totalGroups, status: 'Starting to fetch closing balances for all groups...' });
        let closingBalancesList = [];
        let failedGroups = [];
        let totalClosingValue = 0;
        
        for (let i = 0; i < totalGroups; i++) {
          const group = allGroups[i];
          setProgress({ 
            current: i + 1, 
            total: totalGroups, 
            status: `Fetching closing balance for ${group.Group_Name} (${i + 1}/${totalGroups})...` 
          });
          
          const result = await fetchClosingBalanceForGroup(group.Item_Group_Id, group.Group_Name, preDate);
          
          if (result.success && result.closingBalance) {
            closingBalancesList.push(result.closingBalance);
            totalClosingValue += result.closingBalance.stockValue || 0;
        
          } else {
            failedGroups.push(group.Group_Name);
            if (result.closingBalance) {
              closingBalancesList.push(result.closingBalance);
            }
            console.error(`✗ Failed: ${group.Group_Name} - ${result.error}`);
          }
          
        
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        setProgress({ current: totalGroups, total: totalGroups, status: 'Complete!' });
        

        closingBalancesList.sort((a, b) => a.groupName.localeCompare(b.groupName));
        
      
        const searchRecord = {
          id: Date.now(),
          searchDate: new Date().toISOString(),
          fromDate: fromDate,
          toDate: toDate,
          searchType: 'All Groups',
          results: closingBalancesList,
          totalGroups: totalGroups,
          totalStockValue: totalClosingValue,
          successCount: closingBalancesList.filter(b => b.fetchStatus === 'Success').length,
          noDataCount: closingBalancesList.filter(b => b.fetchStatus === 'No Data').length,
          failedCount: closingBalancesList.filter(b => b.fetchStatus === 'Failed').length
        };
        
        setHistoryList(prev => [searchRecord, ...prev]);
        setClosingBalances(closingBalancesList);
        

        const successCount = closingBalancesList.filter(b => b.fetchStatus === 'Success').length;
        const noDataCount = closingBalancesList.filter(b => b.fetchStatus === 'No Data').length;
        const failCount = closingBalancesList.filter(b => b.fetchStatus === 'Failed').length;
        
        if (failedGroups.length > 0) {
          toast.warning(`Processed ${totalGroups} groups. Success: ${successCount}, No Data: ${noDataCount}, Failed: ${failCount}. Total Stock Value: ₹${totalClosingValue.toFixed(2)}`);
        } else {
          toast.success(`Successfully fetched closing balances for ${totalGroups} groups. Total Stock Value: ₹${totalClosingValue.toFixed(2)}`);
        }
        
      } else {
   
        const result = await fetchClosingBalanceForGroup(selectedGroup.Item_Group_Id, selectedGroup.Group_Name, preDate);
        
        if (result.success && result.closingBalance) {
          // Add to history for single group search
          const searchRecord = {
            id: Date.now(),
            searchDate: new Date().toISOString(),
            fromDate: fromDate,
            toDate: toDate,
            searchType: 'Single Group',
            groupName: selectedGroup.Group_Name,
            groupId: selectedGroup.Item_Group_Id,
            result: result.closingBalance,
            stockValue: result.closingBalance.stockValue
          };
          
          setHistoryList(prev => [searchRecord, ...prev]);
          setClosingBalances([result.closingBalance]);
          toast.success(`${selectedGroup.Group_Name} - Stock Value: ₹${result.closingBalance.stockValue.toFixed(2)}`);
        } else {
          toast.error(result.error || "Failed to fetch closing balance");
          setClosingBalances([]);
        }
      }
    } catch (err) {
      console.error("Error fetching stock value report:", err);
      toast.error("Failed to fetch stock value data: " + (err.message || "Unknown error"));
      setClosingBalances([]);
    } finally {
      setLoading(false);
      setProgress({ current: 0, total: 0, status: '' });
    }
  };

const handleReset = () => {
  setSelectedGroup(null);
  setSelectedItems([]);
  setSelectAll(false);
  setClosingBalances([]); 
  setHistoryList([]);      
  setFromDate(format(subDays(new Date(), 1), 'yyyy-MM-dd'));
  setToDate(format(new Date(), 'yyyy-MM-dd'));
  setReload(prev => !prev);
  toast.info("Filters reset");
};

  const handleClearHistory = () => {
    setHistoryList([]);
    toast.info("History cleared");
  };

  const handleLoadHistory = (historyItem) => {
    // Load a previous search result
    if (historyItem.searchType === 'All Groups') {
      setClosingBalances(historyItem.results);
      setFromDate(historyItem.fromDate);
      setToDate(historyItem.toDate);
      toast.info(`Loaded search from ${format(new Date(historyItem.searchDate), 'dd/MM/yyyy HH:mm:ss')}`);
    } else {
      setClosingBalances([historyItem.result]);
      setFromDate(historyItem.fromDate);
      setToDate(historyItem.toDate);
      toast.info(`Loaded ${historyItem.groupName} data from ${format(new Date(historyItem.searchDate), 'dd/MM/yyyy HH:mm:ss')}`);
    }
  };

  const handleDeleteHistory = (id) => {
    setHistoryList(prev => prev.filter(item => item.id !== id));
    toast.info("History item removed");
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const groupName = selectedGroup?.Item_Group_Id === "0" ? "All Stock Groups" : selectedGroup?.Group_Name;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Stock Value Report - Closing Balance</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h2 { color: #4a2c1a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #4a2c1a; color: white; }
            .text-end { text-align: right; }
            .header { text-align: center; margin-bottom: 20px; }
            .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
            .success { color: green; }
            .warning { color: orange; }
            .danger { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>Stock Value Report - Closing Balance</h2>
            <p><strong>Period:</strong> ${format(new Date(fromDate), 'dd/MM/yyyy')} to ${format(new Date(toDate), 'dd/MM/yyyy')}</p>
            <p><strong>Stock Group:</strong> ${groupName || 'N/A'}</p>
            <p><strong>Generated on:</strong> ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}</p>
          </div>
          <div>
            <h3>Closing Balance Summary</h3>
            <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #4a2c1a; color: white;">
                  <th>#</th>
                  <th>Group ID</th>
                  <th>Group Name</th>
                  <th>Transaction Date</th>
                  <th class="text-end">Closing Rate (₹)</th>
                  <th class="text-end">Closing Value (₹)</th>
                  <th class="text-end">Stock Value (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${closingBalances.map((balance, idx) => `
                  <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td>${balance.itemGroupId}</td>
                    <td>${balance.groupName}</td>
                    <td>${balance.transDate ? format(new Date(balance.transDate), 'dd/MM/yyyy') : '-'}</td>
                    <td class="text-end">${(balance.closingRate || 0).toFixed(2)}</td>
                    <td class="text-end">${(balance.closingValue || 0).toFixed(2)}</td>
                    <td class="text-end"><strong>${(balance.stockValue || 0).toFixed(2)}</strong></td>
                    <td>
                      ${balance.fetchStatus === 'Success' ? '<span class="success">Success</span>' : 
                        balance.fetchStatus === 'No Data' ? '<span class="warning">No Data</span>' : 
                        '<span class="danger">Failed</span>'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background-color: #f2f2f2;">
                  <th colspan="6" class="text-end">Total Stock Value:</th>
                  <th class="text-end"><strong>₹${closingBalances.reduce((sum, b) => sum + (b.stockValue || 0), 0).toFixed(2)}</strong></th>
                  <th></th>
                </tr>
              </tfoot>
            </table>
          </div>
          <div class="footer">
            <p>End of Report</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleExportCSV = () => {
    if (closingBalances.length === 0) {
      toast.warning("No data to export");
      return;
    }
    
    const headers = ['Group ID', 'Group Name', 'Transaction Date', 'Closing Rate', 'Closing Value', 'Stock Value', 'Status'];
    const csvRows = [
      headers.join(','),
      ...closingBalances.map(row => [
        row.itemGroupId,
        `"${row.groupName}"`,
        row.transDate ? format(new Date(row.transDate), 'dd/MM/yyyy') : '',
        (row.closingRate || 0).toFixed(2),
        (row.closingValue || 0).toFixed(2),
        (row.stockValue || 0).toFixed(2),
        row.fetchStatus
      ].map(cell => `"${cell}"`).join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_value_closing_balance_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Closing balance report exported successfully");
  };


  const renderClosingBalanceTable = () => {
    const totalClosingValue = closingBalances.reduce((sum, row) => sum + (row.stockValue || 0), 0);
    const successCount = closingBalances.filter(b => b.fetchStatus === 'Success').length;
    const noDataCount = closingBalances.filter(b => b.fetchStatus === 'No Data').length;
    const failedCount = closingBalances.filter(b => b.fetchStatus === 'Failed').length;
    
    return (
      <div className="table-responsive">
        <table className="table table-sm table-bordered mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Group ID</th>
              <th>Group Name</th>
              <th>Transaction Date</th>
              <th className="text-end">Closing Rate (₹)</th>
              <th className="text-end">Closing Value (₹)</th>
              <th className="text-end">Stock Value (₹)</th>
            
            </tr>
          </thead>
          <tbody>
            {closingBalances.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center">No closing balance data available</td>
              </tr>
            ) : (
              closingBalances.map((balance, idx) => (
                <tr key={idx} className={
                  balance.fetchStatus === 'Failed' ? 'table-danger' : 
                  balance.fetchStatus === 'No Data' ? 'table-warning' : ''
                }>
                  <td>{idx + 1}</td>
                  <td>{balance.itemGroupId}</td>
                  <td><strong>{balance.groupName}</strong></td>
                  <td>{balance.transDate ? format(new Date(balance.transDate), 'dd/MM/yyyy') : '-'}</td>
                  <td className="text-end">
                    <span style={{ 
                      color: (balance.closingRate || 0) === 0 ? '#dc3545' : 'inherit',
                      fontWeight: (balance.closingRate || 0) === 0 ? 'bold' : 'normal'
                    }}>
                      ₹{(balance.closingRate || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="text-end">₹{(balance.closingValue || 0).toFixed(2)}</td>
                  <td className="text-end">
                    <strong>₹{(balance.stockValue || 0).toFixed(2)}</strong>
                  </td>
                 
                </tr>
              ))
            )}
          </tbody>
        
        </table>
      </div>
    );
  };


  return (
    <Fragment>
      <div className="card">
        <div className="card-header bg-white fw-bold d-flex align-items-center justify-content-between">
          <span>STOCK VALUE REPORT - CLOSING BALANCE</span>
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
                  const group = stockGroupsWithAll.find(g => g.Item_Group_Id.toString() === groupId);
                  setSelectedGroup(group);
                }}
              >
                <option value="">-- Select Stock Group --</option>
                {stockGroupsWithAll.map((group) => (
                  <option key={group.Item_Group_Id} value={group.Item_Group_Id}>
                    {group.Group_Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedGroup && selectedGroup.Item_Group_Id !== "0" && (
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

          {selectedGroup && selectedGroup.Item_Group_Id === "0" && (
            <div className="row mb-3">
              <div className="col-12">
                <div className="alert alert-info">
                  <strong>All Groups Selected:</strong> This will fetch closing balance for all {stockGroups.length} stock groups one by one. This may take a few moments.
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar for All Groups */}
          {progress.total > 0 && (
            <div className="row mb-3">
              <div className="col-12">
                <div className="card bg-light">
                  <div className="card-body py-2">
                    <div className="d-flex align-items-center gap-3">
                      <div className="flex-grow-1">
                        <div className="progress" style={{ height: '20px' }}>
                          <div 
                            className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                            role="progressbar" 
                            style={{ width: `${(progress.current / progress.total) * 100}%` }}
                          >
                            {Math.round((progress.current / progress.total) * 100)}%
                          </div>
                        </div>
                      </div>
                      <div>
                        <small className="text-muted">
                          {progress.current} / {progress.total} groups
                        </small>
                      </div>
                    </div>
                  
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="row mb-3">
            <div className="col-12">
              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  className="btn btn-primary"
                  onClick={handleSearch}
                  disabled={loading || !selectedGroup || (selectedGroup.Item_Group_Id !== "0" && selectedItems.length === 0)}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      {progress.total > 0 ? 'Processing...' : 'Loading...'}
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
            </div>
          </div>

          {loading && progress.total === 0 && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2 text-muted">Fetching closing balance data...</div>
            </div>
          )}

          {closingBalances.length > 0 && !loading && (
            <div className="card mt-3">
              <div className="card-header bg-white fw-bold">
                Current Search Results ({closingBalances.length} groups)
              </div>
              <div className="card-body p-0">
                {renderClosingBalanceTable()}
              </div>
            </div>
          )}

  
      

          {!loading && closingBalances.length === 0 && selectedGroup && (
            <div className="alert alert-info text-center mt-3">
              No closing balance data available. Please select a stock group and click Search.
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default StockValueSync;