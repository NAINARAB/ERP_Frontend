import React, { useState, useEffect, Fragment, useRef } from "react";
import {
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Sync as SyncIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { fetchLink } from "../../Components/fetchComponent";
import { toast } from "react-toastify";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const StockSummaryReportErp = () => {
  const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [stockGroups, setStockGroups] = useState([]);
  const [filteredStockGroups, setFilteredStockGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [commonRate, setCommonRate] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  
 
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const groupDropdownRef = useRef(null);

 
  const calculateSummaries = () => {
    const totalAdjPurQty = reportData.reduce((sum, item) => sum + (parseFloat(item.Adj_Pur_Qty) || 0), 0);
    const totalAdjSalQty = reportData.reduce((sum, item) => sum + (parseFloat(item.Adj_Sal_Qty) || 0), 0);
    const totalCLValue = reportData.reduce((sum, item) => sum + (parseFloat(item.CL_Value) || 0), 0);
    const totalExpenseValue = reportData.reduce((sum, item) => sum + (parseFloat(item.Expense_value) || 0), 0);
    
    return {
      adjPurQty: totalAdjPurQty,
      adjSalQty: totalAdjSalQty,
      clValue: totalCLValue,
      expenseValue: totalExpenseValue
    };
  };

  const summaries = calculateSummaries();
 

  const areDatesSame = fromDate === toDate;
  

  const stockGroupsWithAll = areDatesSame 
    ? [{ Item_Group_Id: "0", Group_Name: "-- All Groups --" }, ...stockGroups]
    : stockGroups;


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (groupDropdownRef.current && !groupDropdownRef.current.contains(event.target)) {
        setIsGroupDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    if (groupSearchTerm.trim() === "") {
      setFilteredStockGroups(stockGroupsWithAll);
    } else {
      const searchLower = groupSearchTerm.toLowerCase();
      const filtered = stockGroupsWithAll.filter(group => 
        group.Group_Name.toLowerCase().includes(searchLower)
      );
      setFilteredStockGroups(filtered);
    }
  }, [groupSearchTerm, stockGroupsWithAll]);


  useEffect(() => {
    if (!areDatesSame && selectedGroup?.Item_Group_Id === "0") {
      setSelectedGroup(null);
    }
  }, [areDatesSame, selectedGroup]);

  // Define table columns
  const columns = [
    createCol('Group_Name', 'string', 'Item Group', 'left', 'center', 1),
    createCol('Trans_Date', 'date', 'Date', 'center', 'center', 1),
    createCol('OB_Bal_Qty', 'number', 'OB Bal Qty', 'right', 'center', 1),
    createCol('OB_Rate', 'number', 'OB Rate', 'right', 'center', 1),
    createCol('OB_Value', 'number', 'OB Value', 'right', 'center', 1),
    createCol('Pur_Qty', 'number', 'Pur Qty', 'right', 'center', 1),
    createCol('Pur_Rate', 'number', 'Pur Rate', 'right', 'center', 1),
    createCol('Pur_value', 'number', 'Pur Value', 'right', 'center', 1),
    createCol('Adj_Pur_Qty', 'number', 'Adj Pur Qty', 'right', 'center', 1),
    createCol('Adj_Pur_Rate', 'number', 'Adj Pur Rate', 'right', 'center', 1),
    createCol('Adj_Pur_value', 'number', 'Adj Pur Value', 'right', 'center', 1),
    createCol('IN_Qty', 'number', 'IN Qty', 'right', 'center', 1),
    createCol('IN_Rate', 'number', 'IN Rate', 'right', 'center', 1),
    createCol('IN_Value', 'number', 'IN Value', 'right', 'center', 1),
    createCol('Sal_Qty', 'number', 'Sal Qty', 'right', 'center', 1),
    createCol('Sal_Rate', 'number', 'Sal Rate', 'right', 'center', 1),
    createCol('Sal_value', 'number', 'Sal Value', 'right', 'center', 1),
    createCol('Adj_Sal_Qty', 'number', 'Adj Sal Qty', 'right', 'center', 1),
    createCol('Adj_Sal_Rate', 'number', 'Adj Sal Rate', 'right', 'center', 1),
    createCol('Adj_Sal_value', 'number', 'Adj Sal Value', 'right', 'center', 1),
    createCol('OUT_Qty', 'number', 'OUT Qty', 'right', 'center', 1),
    createCol('Out_Rate', 'number', 'Out Rate', 'right', 'center', 1),
    createCol('Out_Value', 'number', 'Out Value', 'right', 'center', 1),
    createCol('Expense_value', 'number', 'Expense Value', 'right', 'center', 1),
    createCol('Act_Expense', 'number', 'Act Expense', 'right', 'center', 1),
    createCol('Bal_Qty', 'number', 'Bal Qty', 'right', 'center', 1),
    createCol('CL_Rate', 'number', 'CL Rate', 'right', 'center', 1),
    createCol('CL_Value', 'number', 'CL Value', 'right', 'center', 1),
    createCol('CR_CL_Rate', 'number', 'CR CL Rate', 'right', 'center', 1),
    createCol('Pre_Qty', 'number', 'Pre Qty', 'right', 'center', 1),
    createCol('Pre_Rate', 'number', 'Pre Rate', 'right', 'center', 1),
    createCol('Pre_CL_Value', 'number', 'Pre CL Value', 'right', 'center', 1),
  ];

  useEffect(() => {
    loadStockGroups();
  }, [reload]);

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
      
      setStockGroups(formattedGroups);
      
    
      const initialGroupsWithAll = areDatesSame 
        ? [{ Item_Group_Id: "0", Group_Name: "-- All Groups --" }, ...formattedGroups]
        : formattedGroups;
      setFilteredStockGroups(initialGroupsWithAll);
      
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

  // Update filtered groups when dates change
  useEffect(() => {
    const updatedGroupsWithAll = areDatesSame 
      ? [{ Item_Group_Id: "0", Group_Name: "-- All Groups --" }, ...stockGroups]
      : stockGroups;
    setFilteredStockGroups(updatedGroupsWithAll);
  }, [fromDate, toDate, stockGroups]);

  const handleSearch = async () => {
    if (!fromDate) {
      toast.error("Please select from date");
      return;
    }
    if (!toDate) {
      toast.error("Please select to date");
      return;
    }
    if (!selectedGroup) {
      toast.error("Please select a stock group");
      return;
    }

    try {
      setLoading(true);
      const stockGroupId = selectedGroup.Item_Group_Id === "0" ? 0 : parseInt(selectedGroup.Item_Group_Id);
      
      const response = await fetchLink({
        address: `inventory/getStockValueSummaryAlt`, 
        method: "POST",
        bodyData: {
          Pre_date: fromDate,
          Todate: toDate,
          stock_group_id: stockGroupId
        }
      });
      
      if (response && response.success) {
        let stockData = response.data || [];
        setReportData(stockData);
        toast.success(`Report loaded successfully. Found ${stockData.length} records`);
      } else {
        toast.error(response?.message || "Failed to fetch stock data");
        setReportData([]);
      }
    } catch (err) {
      console.error("Error fetching stock report:", err);
      toast.error("Failed to fetch stock data");
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedGroup(null);
    setReportData([]);
    setFromDate(format(new Date(), 'yyyy-MM-dd'));
    setToDate(format(new Date(), 'yyyy-MM-dd'));
    setCommonRate("");
    setGroupSearchTerm("");
    setReload(prev => !prev);
    toast.info("Filters reset");
  };

  const handleSyncRates = async () => {
    if (!reportData.length) {
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

      const updatedData = reportData.map(item => ({
        ...item,
        CL_Rate: rate,
        CL_Value: (item.Bal_Qty || 0) * rate,
        Pre_Rate: rate,
        Pre_CL_Value: (item.Pre_Qty || 0) * rate
      }));

      setReportData(updatedData);
      toast.success(`Rates synced successfully! Updated ${updatedData.length} records`);
      setCommonRate("");
    } catch (err) {
      console.error("Error syncing rates:", err);
      toast.error("Failed to sync rates: " + (err.message || "Unknown error"));
    } finally {
      setIsSyncing(false);
    }
  };

  const TableButtonArea = () => {
    return (
      <div className="d-flex align-items-center gap-2">
        {reportData.length > 0 && !loading && (
          <>
            <div className="d-flex w-100 mb-3 gap-3" style={{ marginTop: '10px' }}>
              <div className="border rounded p-2 bg-light" style={{ width: '100px', flexShrink: 0 }}>
                <div className="text-muted small fw-bold" style={{ whiteSpace: 'nowrap', fontSize: '11px' }}>ADJ PUR QTY</div>
                <div className="fw-bold text-primary" style={{ fontSize: '12px' }}>
                  {summaries.adjPurQty.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}
                </div>
              </div>
              <div className="border rounded p-2 bg-light" style={{ width: '100px', flexShrink: 0 }}>
                <div className="text-muted small fw-bold" style={{ whiteSpace: 'nowrap', fontSize: '11px' }}>ADJ SAL QTY</div>
                <div className="fw-bold text-warning" style={{ fontSize: '12px' }}>
                  {summaries.adjSalQty.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}
                </div>
              </div>
              <div className="border rounded p-2 bg-light" style={{ width: '100px', flexShrink: 0 }}>
                <div className="text-muted small fw-bold" style={{ whiteSpace: 'nowrap', fontSize: '11px' }}>CURRENT VALUE</div>
                <div className="fw-bold text-success" style={{ fontSize: '12px' }}>
                  {summaries.clValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}
                </div>
              </div>
              <div className="border rounded p-2 bg-light" style={{ width: '100px', flexShrink: 0 }}>
                <div className="text-muted small fw-bold" style={{ whiteSpace: 'nowrap', fontSize: '11px' }}>EXPENSE</div>
                <div className="fw-bold text-danger" style={{ fontSize: '12px' }}>
                  {summaries.expenseValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}
                </div>
              </div>
              
              {/* Rate Sync Section */}
              <div className="d-flex gap-2 align-items-center ms-auto">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="Enter Rate"
                  value={commonRate}
                  onChange={(e) => setCommonRate(e.target.value)}
                  style={{ width: '120px' }}
                />
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleSyncRates}
                  disabled={isSyncing || !commonRate}
                >
                  <SyncIcon sx={{ fontSize: '16px', mr: 0.5 }} />
                  {isSyncing ? 'Syncing...' : 'Sync Rates'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Fragment>
      <div className="card">
        <div className="card-header bg-white fw-bold">
          STOCK VALUE SUMMARY REPORT
        </div>

        <div className="card-body">
          <div className="d-flex align-items-end gap-2 flex-wrap mb-3">
            {/* From Date */}
            <div style={{ minWidth: '140px' }}>
              <label className="form-label fw-bold mb-0 small">From Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            {/* To Date */}
            <div style={{ minWidth: '140px' }}>
              <label className="form-label fw-bold mb-0 small">To Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            {/* Stock Group with Search Dropdown */}
            <div ref={groupDropdownRef} style={{ minWidth: '250px', position: 'relative' }}>
              <label className="form-label fw-bold mb-0 small">Stock Group</label>
              <div
                className="form-select form-select-sm"
                style={{ 
                  cursor: 'pointer', 
                  backgroundColor: 'white',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
              >
                <span style={{ color: selectedGroup ? 'inherit' : '#6c757d' }}>
                  {selectedGroup ? selectedGroup.Group_Name : '-- Select Stock Group --'}
                </span>
                {/* <span>{isGroupDropdownOpen ? '▲' : '▼'}</span> */}
              </div>

              {isGroupDropdownOpen && (
                <div style={{
                  position: 'absolute', 
                  zIndex: 1000,
                  background: 'white', 
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem', 
                  marginTop: '2px',
                  maxHeight: '300px', 
                  overflowY: 'auto',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  width: '100%'
                }}>
                  {/* Search Input */}
                  <div className="p-2 border-bottom">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search stock group..."
                      value={groupSearchTerm}
                      onChange={(e) => setGroupSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                  
                  {/* Group List */}
                  {filteredStockGroups.length === 0 ? (
                    <div className="px-3 py-2 text-muted" style={{ fontSize: '12px' }}>
                      No matching stock groups found
                    </div>
                  ) : (
                    filteredStockGroups.map((group) => (
                      <div
                        key={group.Item_Group_Id}
                        className="px-3 py-2 d-flex align-items-center"
                        style={{ 
                          cursor: 'pointer', 
                          fontSize: '13px',
                          backgroundColor: selectedGroup?.Item_Group_Id === group.Item_Group_Id ? '#e3f2fd' : 'transparent',
                          fontWeight: selectedGroup?.Item_Group_Id === group.Item_Group_Id ? 'bold' : 'normal'
                        }}
                        onClick={() => {
                          setSelectedGroup(group);
                          setIsGroupDropdownOpen(false);
                          setGroupSearchTerm("");
                          setReportData([]);
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => {
                          if (selectedGroup?.Item_Group_Id !== group.Item_Group_Id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {group.Group_Name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Search Button */}
            <div>
              <label className="form-label fw-bold mb-0 small" style={{ visibility: 'hidden' }}>.</label>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSearch}
                disabled={loading || !selectedGroup}
                style={{ whiteSpace: 'nowrap' }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <SearchIcon sx={{ fontSize: '16px', mr: 0.5 }} />
                    Search
                  </>
                )}
              </button>
            </div>

            {/* Reset Button */}
            <div>
              <label className="form-label fw-bold mb-0 small" style={{ visibility: 'hidden' }}>.</label>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleReset}
                disabled={loading}
                style={{ whiteSpace: 'nowrap' }}
              >
                <RefreshIcon sx={{ fontSize: '16px', mr: 0.5 }} />
                Reset
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center my-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2 text-muted">Fetching stock data...</div>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <FilterableTable
              dataArray={reportData}
              columns={columns}
              title="Stock Value Summary"
              PDFPrintOption={true}
              ExcelPrintOption={true}
              maxHeightOption={true}
              EnableSerialNumber={true}
              initialPageCount={20}
              tableMaxHeight={500}
              ButtonArea={<TableButtonArea />}
            />
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default StockSummaryReportErp;