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

const StockArrivalRate = () => {
  const [fromDate, setFromDate] = useState(format(new Date().setDate(1), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [stockGroups, setStockGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [originalData, setOriginalData] = useState([]);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [showZeroEntries, setShowZeroEntries] = useState(false);
  const [commonRate, setCommonRate] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingCell, setEditingCell] = useState({ index: null, field: null, originalId: null });
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    loadStockGroups();
  }, [reload]);

  useEffect(() => {
    if (selectedGroup) {
      loadItemsByGroup(selectedGroup.Item_Group_Id);
      setSelectedItems([]);
      setSelectAll(false);
      setOriginalData([]);
      setReportData([]);
      setCommonRate("");
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
    if (originalData.length > 0) {
      applyZeroRateFilter();
    }
  }, [showZeroEntries]);

  const applyZeroRateFilter = () => {
    let data = [...originalData];
    
    if (!showZeroEntries) {
      data = data.filter(item => (item.Rate || 0) !== 0);
    }
    
    setReportData(data);
  };


  const getOriginalIndex = (filteredIndex) => {
    if (filteredIndex >= reportData.length) return -1;
    
    const filteredRow = reportData[filteredIndex];
    const uniqueId = filteredRow.Arr_Id || filteredRow.arrival_id || filteredRow.id;
    
    return originalData.findIndex(row => 
      (row.Arr_Id || row.arrival_id || row.id) === uniqueId
    );
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
      
      // Add "All" option at the beginning with id 0
      const allOption = {
        Item_Group_Id: 0,
        Group_Name: "All",
        GST_P: null,
        Group_HSN: null,
        Grp: null
      };
      
      setStockGroups([allOption, ...formattedGroups]);
      
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
      
      // Send stockGroupId as 0 for "All" option
      const bodyData = { stockGroupId: groupId };
      
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
    if (!originalData.length) {
      toast.warning("No data to sync rates");
      return;
    }

    if (!commonRate) {
      toast.warning("Please enter a rate to sync");
      return;
    }

    setIsSyncing(true);
    try {
      const rate = parseFloat(commonRate);
      
      if (isNaN(rate) || rate <= 0) {
        toast.error("Please enter a valid rate greater than 0");
        setIsSyncing(false);
        return;
      }

      const updateData = {
        type: 'bulk',
        gstRate: rate,
        FromDate: fromDate,
        ToDate: toDate,
        StockGroupId: selectedGroup?.Item_Group_Id === 0 ? null : selectedGroup?.Item_Group_Id,
        ItemId: null
      };

      const response = await fetchLink({
        address: `inventory/updateArrivalList`,
        method: "PUT",
        bodyData: updateData
      });

      if (response && response.success) {
        let updatedData = originalData.map(item => ({
          ...item,
          Rate: rate,
          Taxable_Value: (item.Arr_qty || 0) * rate
        }));

        setOriginalData(updatedData);

        let displayData = [...updatedData];
        
        if (!showZeroEntries) {
          displayData = displayData.filter(item => (item.Rate || 0) !== 0);
        }
        
        setReportData(displayData);

        toast.success(`Rates synced successfully! Affected rows: ${response.data?.rowsAffected || updatedData.length}`);
        setCommonRate("");
      } else {
        toast.error(response?.message || "Failed to sync rates");
      }
    } catch (err) {
      console.error("Error syncing rates:", err);
      toast.error("Failed to sync rates: " + (err.message || "Unknown error"));
    } finally {
      setIsSyncing(false);
    }
  };


  const handleEditRate = (filteredIndex, currentValue) => {
    const currentRow = reportData[filteredIndex];
    if (!currentRow) {
      toast.error("Row not found");
      return;
    }
    
    setEditingCell({ 
      filteredIndex, 
      field: 'Rate',
      originalId: currentRow.Arr_Id || currentRow.arrival_id || currentRow.id
    });
    setEditValue(currentValue.toString());
  };

  const handleSaveRate = async () => {
    const { filteredIndex, originalId } = editingCell;
    const newRate = parseFloat(editValue);
    
    if (isNaN(newRate)) {
      toast.error("Please enter a valid number");
      return;
    }

    try {
      const originalIndex = originalData.findIndex(row => 
        (row.Arr_Id || row.arrival_id || row.id) === originalId
      );

      if (originalIndex === -1) {
        toast.error("Original record not found");
        return;
      }

      const currentRow = originalData[originalIndex];
      
      const updateData = {
        type: 'individual',
        gstRate: newRate,
        arrival_id: currentRow.Arr_Id || currentRow.arrival_id || currentRow.id
      };

      const response = await fetchLink({
        address: `inventory/updateArrivalList`,
        method: "PUT",
        bodyData: updateData
      });

      if (response && response.success) {
        let updatedData = [...originalData];
        updatedData[originalIndex] = {
          ...updatedData[originalIndex],
          Rate: newRate,
          Taxable_Value: (updatedData[originalIndex].Arr_qty || 0) * newRate
        };

        setOriginalData(updatedData);

        let displayData = [...updatedData];
        
        if (!showZeroEntries) {
          displayData = displayData.filter(item => (item.Rate || 0) !== 0);
        }
        
        setReportData(displayData);
        
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
      setEditingCell({ filteredIndex: null, field: null, originalId: null });
      setEditValue("");
    }
  };

  const handleCancelEdit = () => {
    setEditingCell({ filteredIndex: null, field: null, originalId: null });
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
        address: `inventory/arrivalList`,
        method: "POST",
        bodyData: {
          fromDate,
          toDate,
          stockGroupId: selectedGroup.Item_Group_Id === 0 ? null : selectedGroup.Item_Group_Id,
          itemIds
        }
      });
      
      if (response && response.success) {
        let arrivalData = response.data || [];
        
        arrivalData = arrivalData.map(item => ({
          ...item,
          Arr_Id: item.Arr_Id || item.arrival_id || item.id
        }));
        
        const originalArrival = [...arrivalData];
        
        setOriginalData(originalArrival);
        
        let displayData = [...arrivalData];
        
        if (!showZeroEntries) {
          displayData = displayData.filter(item => (item.Rate || 0) !== 0);
        }
        
        setReportData(displayData);
        
        toast.success(`Report loaded successfully. Found ${displayData.length} arrival records`);
      } else {
        toast.error(response?.message || "Failed to fetch arrival data");
        setOriginalData([]);
        setReportData([]);
      }
    } catch (err) {
      console.error("Error fetching arrival report:", err);
      toast.error("Failed to fetch arrival data");
      setOriginalData([]);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedGroup(null);
    setSelectedItems([]);
    setSelectAll(false);
    setOriginalData([]);
    setReportData([]);
    setFromDate(format(new Date().setDate(1), 'yyyy-MM-dd'));
    setToDate(format(new Date(), 'yyyy-MM-dd'));
    setShowZeroEntries(false);
    setCommonRate("");
    setReload(prev => !prev);
    toast.info("Filters reset");
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Arrival Report</title>
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
            <h2>Arrival Report</h2>
            <p><strong>Period:</strong> ${format(new Date(fromDate), 'dd/MM/yyyy')} to ${format(new Date(toDate), 'dd/MM/yyyy')}</p>
            <p><strong>Stock Group:</strong> ${selectedGroup?.Group_Name || 'N/A'}</p>
            <p><strong>Selected Items:</strong> ${selectedItems.length} item(s)</p>
            <p><strong>Show Zero Rate Entries:</strong> ${showZeroEntries ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <h3>Arrival Details</h3>
            <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">
              <thead>
                <tr style="background-color: #4a2c1a; color: white;">
                  <th>#</th>
                  <th>Date</th>
                  <th>Arrival ID</th>
                  <th>Item Name</th>
                  <th>Godown</th>
                  <th class="text-end">Quantity</th>
                  <th>Unit</th>
                  <th class="text-end">Rate (₹)</th>
                  <th class="text-end">Taxable Value (₹)</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.map((row, idx) => `
                  <tr>
                    <td class="text-center">${idx + 1}</td>
                    <td>${row.Arrival_Date ? format(new Date(row.Arrival_Date), 'dd/MM/yyyy') : '-'}</td>
                    <td>${row.Arr_Id || '-'}</td>
                    <td>${row.stock_item_name || '-'}</td>
                    <td>${row.godown_name || '-'}</td>
                    <td class="text-end">${(row.Arr_qty || 0).toFixed(2)}</td>
                    <td>${row.Units || '-'}</td>
                    <td class="text-end">${(row.Rate || 0).toFixed(2)}</td>
                    <td class="text-end">${(row.Taxable_Value || 0).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr style="background-color: #f2f2f2;">
                  <th colspan="5">Total</th>
                  <th class="text-end">${reportData.reduce((sum, row) => sum + (row.Arr_qty || 0), 0).toFixed(2)}</th>
                  <th></th>
                  <th></th>
                  <th class="text-end">${reportData.reduce((sum, row) => sum + (row.Taxable_Value || 0), 0).toFixed(2)}</th>
                </tr>
              </tfoot>
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
    if (reportData.length === 0) {
      toast.warning("No data to export");
      return;
    }
    
    const headers = ['Date', 'Arrival ID', 'Item Name', 'Godown', 'Quantity', 'Unit', 'Rate', 'Taxable Value'];
    const csvRows = [
      headers.join(','),
      ...reportData.map(row => [
        row.Arrival_Date ? format(new Date(row.Arrival_Date), 'dd/MM/yyyy') : '',
        row.Arr_Id || '',
        row.stock_item_name || '',
        row.godown_name || '',
        (row.Arr_qty || 0).toFixed(2),
        row.Units || '',
        (row.Rate || 0).toFixed(2),
        (row.Taxable_Value || 0).toFixed(2)
      ].map(cell => `"${cell}"`).join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arrival_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported successfully");
  };

  const renderEditableRateCell = (value, filteredIndex) => {
    const isEditing = editingCell.filteredIndex === filteredIndex && editingCell.field === 'Rate';
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
          onClick={() => handleEditRate(filteredIndex, value)}
          sx={{ padding: '2px' }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </div>
    );
  };

  const renderTransactionTable = () => {
    const totalQty = reportData.reduce((sum, row) => sum + (row.Arr_qty || 0), 0);
    const totalAmount = reportData.reduce((sum, row) => sum + (row.Taxable_Value || 0), 0);
    
    return (
      <div className="table-responsive">
        <table className="table table-sm table-bordered mb-0">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Arrival ID</th>
              <th>Item Name</th>
              <th>Godown</th>
              <th className="text-end">Quantity</th>
              <th>Unit</th>
              <th className="text-end">Rate (₹)</th>
              <th className="text-end">Taxable Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            {reportData.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center">No data available</td>
              </tr>
            ) : (
              reportData.map((row, idx) => (
                <tr key={row.Arr_Id || idx}>
                  <td>{idx + 1}</td>
                  <td>{row.Arrival_Date ? format(new Date(row.Arrival_Date), 'dd/MM/yyyy') : '-'}</td>
                  <td>{row.Arr_Id || '-'}</td>
                  <td>{row.stock_item_name || '-'}</td>
                  <td>{row.godown_name || '-'}</td>
                  <td className="text-end">{(row.Arr_qty || 0).toFixed(2)}</td>
                  <td>{row.Units || '-'}</td>
                  <td className="text-end">{renderEditableRateCell(row.Rate || 0, idx)}</td>
                  <td className="text-end">{(row.Taxable_Value || 0).toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
          {reportData.length > 0 && (
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
          <span>ARRIVAL REPORT</span>
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
                value={selectedGroup?.Item_Group_Id?.toString() || ''}
                onChange={(e) => {
                  const groupId = e.target.value;
                  if (!groupId) {
                    setSelectedGroup(null);
                  } else {
                    const group = stockGroups.find(g => g.Item_Group_Id.toString() === groupId);
                    console.log("Selected group:", group); // Debug log
                    setSelectedGroup(group || null);
                  }
                }}
              >
                <option value="">-- Select Stock Group --</option>
                {stockGroups.map((group) => (
                  <option key={group.Item_Group_Id} value={group.Item_Group_Id.toString()}>
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
              <div className="d-flex justify-content-between align-items-center">
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
                
                {originalData.length > 0 && !loading && (
                  <div className="d-flex align-items-center gap-2">
                    <label className="fw-bold mb-0">Common Rate:</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: '120px' }}
                      placeholder="Enter rate"
                      value={commonRate}
                      onChange={(e) => setCommonRate(e.target.value)}
                    />
                    <Tooltip title="Apply Common Rate to All Rows">
                      <IconButton 
                        onClick={handleSyncRates} 
                        size="small" 
                        color="primary"
                        disabled={isSyncing || !commonRate}
                      >
                        {isSyncing ? <span className="spinner-border spinner-border-sm" /> : <SyncIcon />}
                      </IconButton>
                    </Tooltip>
                  </div>
                )}
              </div>
              
              <div className="d-flex justify-content-end gap-2 mt-3">
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
            </div>
          </div>

          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2 text-muted">Fetching arrival data...</div>
            </div>
          )}

          {reportData.length > 0 && !loading && (
            <div className="card mt-3">
              <div className="card-header bg-white fw-bold">
                Arrival Details ({reportData.length} records)
              </div>
              <div className="card-body p-0">
                {renderTransactionTable()}
              </div>
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default StockArrivalRate;