import React, { useState, useEffect, Fragment, useCallback, memo, useRef } from "react";
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
} from "@mui/icons-material";
import { format } from "date-fns";
import { fetchLink } from "../../Components/fetchComponent";
import { toast } from "react-toastify";

// ✅ Memoized Row Component with inline textbox
const ArrivalRow = memo(({ row, index, onRateChange, onSaveRate, savingRow }) => {
  const isSaving = savingRow.index === index;
  const isZeroRate = (row.Rate || 0) === 0;
  
  const handleRateChange = (e) => {
    const newRate = e.target.value;
    onRateChange(index, newRate);
  };
  
  const handleBlur = (e) => {
    const newRate = parseFloat(e.target.value);
    if (!isNaN(newRate)) {
      onSaveRate(index, newRate);
    }
  };
  
  return (
    <tr>
      <td>{index + 1}</td>
      <td>{row.Arrival_Date ? format(new Date(row.Arrival_Date), 'dd/MM/yyyy') : '-'}</td>
      <td>{row.Arr_Id || '-'}</td>
      <td>{row.stock_item_name || '-'}</td>
      <td>{row.godown_name || '-'}</td>
      <td className="text-end">{(row.Arr_qty || 0).toFixed(2)}</td>
      <td>{row.Units || '-'}</td>
      <td className="text-end">
        <div className="d-flex align-items-center gap-1 justify-content-end">
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ 
              width: '110px',
              backgroundColor: isZeroRate ? '#fff3cd' : 'white',
              borderColor: isZeroRate ? '#ffc107' : '#ced4da',
              textAlign: 'right'
            }}
            value={row.Rate || 0}
            onChange={handleRateChange}
            onBlur={handleBlur}
            disabled={isSaving}
            step="0.01"
            min="0"
          />
          {isSaving && (
            <span className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Saving...</span>
            </span>
          )}
        </div>
      </td>
      <td className="text-end">{(row.Taxable_Value || 0).toFixed(2)}</td>
    </tr>
  );
});

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
  const [savingRow, setSavingRow] = useState({ index: null });
  const [pendingUpdates, setPendingUpdates] = useState(new Map());
  
  // ✅ New state for dropdown item selection
  const [isItemDropdownOpen, setIsItemDropdownOpen] = useState(false);
  const itemDropdownRef = useRef(null);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target)) {
        setIsItemDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Process pending updates in background
  useEffect(() => {
    const processPendingUpdates = async () => {
      for (const [key, update] of pendingUpdates) {
        if (!update.processing) {
          setPendingUpdates(prev => {
            const newMap = new Map(prev);
            newMap.set(key, { ...update, processing: true });
            return newMap;
          });

          try {
            const response = await fetchLink({
              address: `inventory/updateArrivalList`,
              method: "PUT",
              bodyData: update.updateData
            });

            if (!response || !response.success) {
              revertOptimisticUpdate(update);
              toast.error(response?.message || "Failed to update rate");
            }
            
            setPendingUpdates(prev => {
              const newMap = new Map(prev);
              newMap.delete(key);
              return newMap;
            });
          } catch (err) {
            console.error("Error saving rate:", err);
            revertOptimisticUpdate(update);
            toast.error("Failed to update rate: " + (err.message || "Unknown error"));
            setPendingUpdates(prev => {
              const newMap = new Map(prev);
              newMap.delete(key);
              return newMap;
            });
          }
        }
      }
    };

    if (pendingUpdates.size > 0) {
      processPendingUpdates();
    }
  }, [pendingUpdates]);

  const applyZeroRateFilter = useCallback(() => {
    let data = [...originalData];
    
    if (!showZeroEntries) {
      data = data.filter(item => (item.Rate || 0) !== 0);
    }
    
    setReportData(data);
  }, [originalData, showZeroEntries]);

  const revertOptimisticUpdate = useCallback((update) => {
    setOriginalData(prev => {
      const updatedData = [...prev];
      const index = updatedData.findIndex(item => 
        (item.Arr_Id || item.arrival_id || item.id) === update.arrivalId
      );
      if (index !== -1) {
        updatedData[index] = update.oldRow;
      }
      return updatedData;
    });
  }, []);

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
      
      const formattedGroups = groups.map((group) => ({
        Item_Group_Id: group.Item_Group_Id,
        Group_Name: group.Group_Name,
        GST_P: group.GST_P,
        Group_HSN: group.Group_HSN,
        Grp: group.Grp
      }));
      
      const allOption = {
        Item_Group_Id: 0,
        Group_Name: "All Stock Groups",
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
 
  // ✅ Toggle item selection
  const toggleItemSelection = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.Product_Id === item.Product_Id);
      if (isSelected) {
        const newSelected = prev.filter(i => i.Product_Id !== item.Product_Id);
        setSelectAll(false);
        return newSelected;
      } else {
        return [...prev, item];
      }
    });
  };

  // ✅ Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      setSelectAll(false);
    } else {
      setSelectedItems([...items]);
      setSelectAll(true);
    }
  };

  // ✅ Remove selected item
  const removeSelectedItem = (itemId) => {
    setSelectedItems(prev => prev.filter(item => item.Product_Id !== itemId));
    setSelectAll(false);
  };

  // ✅ Handle real-time rate change (immediate UI update)
  const handleRateChange = useCallback((filteredIndex, newRateValue) => {
    const currentRow = reportData[filteredIndex];
    if (!currentRow) return;
    
    const arrivalId = currentRow.Arr_Id || currentRow.arrival_id || currentRow.id;
    const originalIndex = originalData.findIndex(row => 
      (row.Arr_Id || row.arrival_id || row.id) === arrivalId
    );
    
    if (originalIndex === -1) return;
    
    const newRate = parseFloat(newRateValue) || 0;
    
    // Update both originalData and reportData instantly
    setOriginalData(prev => {
      const updatedData = [...prev];
      updatedData[originalIndex] = {
        ...updatedData[originalIndex],
        Rate: newRate,
        Taxable_Value: (updatedData[originalIndex].Arr_qty || 0) * newRate
      };
      return updatedData;
    });
    
    setReportData(prev => {
      const updatedData = [...prev];
      updatedData[filteredIndex] = {
        ...updatedData[filteredIndex],
        Rate: newRate,
        Taxable_Value: (updatedData[filteredIndex].Arr_qty || 0) * newRate
      };
      return updatedData;
    });
  }, [reportData, originalData]);

  // ✅ Save rate to backend on blur
  const handleSaveRate = useCallback(async (filteredIndex, newRate) => {
    const currentRow = reportData[filteredIndex];
    
    if (!currentRow) {
      toast.error("Row not found");
      return;
    }

    if (isNaN(newRate)) {
      toast.error("Please enter a valid number");
      return;
    }

    const arrivalId = currentRow.Arr_Id || currentRow.arrival_id || currentRow.id;
    
    // Find original index
    const originalIndex = originalData.findIndex(row => 
      (row.Arr_Id || row.arrival_id || row.id) === arrivalId
    );

    if (originalIndex === -1) {
      toast.error("Original record not found");
      return;
    }

    // Store old row for potential rollback
    const oldRow = originalData[originalIndex];
    
    // Set saving state for this row
    setSavingRow({ index: filteredIndex });

    // Prepare API update data
    const updateData = {
      type: 'individual',
      gstRate: newRate,
      arrival_id: arrivalId
    };

    try {
      const response = await fetchLink({
        address: `inventory/updateArrivalList`,
        method: "PUT",
        bodyData: updateData
      });

      if (response && response.success) {
        toast.success("Rate updated successfully");
        
        if (newRate === 0 && !showZeroEntries) {
          toast.info("Row with zero rate is now hidden. Check 'Show Zero Rate Entries' to view it.");
        }
      } else {
        // Revert on failure
        revertOptimisticUpdate({ arrivalId, oldRow });
        toast.error(response?.message || "Failed to update rate");
      }
    } catch (err) {
      console.error("Error saving rate:", err);
      // Revert on error
      revertOptimisticUpdate({ arrivalId, oldRow });
      toast.error("Failed to update rate: " + (err.message || "Unknown error"));
    } finally {
      setSavingRow({ index: null });
    }
  }, [reportData, originalData, showZeroEntries, revertOptimisticUpdate]);

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
      
      if (isNaN(rate)) {
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

  // ✅ Optimized table renderer with inline textboxes
  const renderTransactionTable = useCallback(() => {
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
                <ArrivalRow
                  key={row.Arr_Id || row.arrival_id || row.id || idx}
                  row={row}
                  index={idx}
                  onRateChange={handleRateChange}
                  onSaveRate={handleSaveRate}
                  savingRow={savingRow}
                />
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
  }, [reportData, handleRateChange, handleSaveRate, savingRow]);

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
          {/* ✅ ALL FILTERS IN ONE LINE */}
          <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
            {/* From Date */}
            <div style={{ minWidth: '150px' }}>
              <label className="form-label fw-bold mb-0 small">From Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div style={{ minWidth: '150px' }}>
              <label className="form-label fw-bold mb-0 small">To Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* Stock Group */}
            <div style={{ minWidth: '180px' }}>
              <label className="form-label fw-bold mb-0 small">Stock Group</label>
              <select
                className="form-select form-select-sm"
                value={selectedGroup?.Item_Group_Id?.toString() || ''}
                onChange={(e) => {
                  const groupId = e.target.value;
                  if (!groupId) {
                    setSelectedGroup(null);
                  } else {
                    const group = stockGroups.find(g => g.Item_Group_Id.toString() === groupId);
                    setSelectedGroup(group || null);
                    setIsItemDropdownOpen(false);
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

            {/* Item Selection Dropdown */}
            <div ref={itemDropdownRef} style={{ minWidth: '500px' }}>
              <label className="form-label fw-bold mb-0 small">Select Items</label>
              <div className="dropdown w-100">
                <button
                  className="form-select form-select-sm text-start d-flex justify-content-between align-items-center"
                  type="button"
                  onClick={() => setIsItemDropdownOpen(!isItemDropdownOpen)}
                  disabled={!selectedGroup || items.length === 0}
                
                >
                  <span className="small">
                    {selectedItems.length === 0 
                      ? "-- Select Items --" 
                      : `${selectedItems.length} item(s) selected`}
                  </span>
                
                </button>
                
                {isItemDropdownOpen && selectedGroup && items.length > 0 && (
                  <div className="dropdown-menu show w-100 p-2" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <div className="dropdown-item p-0 mb-2">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectAll}
                            onChange={toggleSelectAll}
                            size="small"
                          />
                        }
                        label={`Select All (${items.length} items)`}
                        style={{ margin: 0, width: '100%' }}
                      />
                    </div>
                    <hr className="my-1" />
                    {items.map((item) => (
                      <div key={item.Product_Id} className="dropdown-item p-0">
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedItems.some(i => i.Product_Id === item.Product_Id)}
                              onChange={() => toggleItemSelection(item)}
                              size="small"
                            />
                          }
                          label={item.stock_item_name}
                          style={{ margin: 0, width: '100%' }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Search and Reset Buttons */}
            <div style={{ marginTop: '20px' }}>
              <button
                className="btn btn-primary btn-sm me-2"
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
                    <SearchIcon sx={{ fontSize: '16px', mr: 0.5 }} />
                    Search
                  </>
                )}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={handleReset} disabled={loading}>
                <RefreshIcon sx={{ fontSize: '16px', mr: 0.5 }} />
                Reset
              </button>
            </div>
          </div>

     
          {/* Show Zero Rate Entries and Common Rate Sync */}
          <div className="d-flex justify-content-between align-items-center mb-3">
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
                <label className="fw-bold mb-0 small">Common Rate:</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  style={{ width: '100px' }}
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
                    {isSyncing ? <span className="spinner-border spinner-border-sm" /> : <SyncIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </div>
            )}
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