import React, { useState, useEffect, Fragment } from "react";
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
  const [stockGroups, setStockGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [commonRate, setCommonRate] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

 
  const stockGroupsWithAll = [{ Item_Group_Id: "0", Group_Name: "All" }, ...stockGroups];

  // Define table columns
  const columns = [
    createCol('Group_Name', 'string', 'Item Group', 'left', 'center', 1),
    createCol('Trans_Date', 'date', 'Date', 'center', 'center', 1),
    createCol('OB_Bal_Qty', 'number', 'Opening Qty', 'right', 'center', 1),
    createCol('OB_Rate', 'number', 'Opening Rate', 'right', 'center', 1),
    createCol('OB_Value', 'number', 'Opening Value', 'right', 'center', 1),
    createCol('Pur_Qty', 'number', 'Purchase Qty', 'right', 'center', 1),
    createCol('Pur_Rate', 'number', 'Purchase Rate', 'right', 'center', 1),
    createCol('Pur_value', 'number', 'Purchase Value', 'right', 'center', 1),
    createCol('Sal_Qty', 'number', 'Sales Qty', 'right', 'center', 1),
    createCol('Sal_Rate', 'number', 'Sales Rate', 'right', 'center', 1),
    createCol('Sal_value', 'number', 'Sales Value', 'right', 'center', 1),
    createCol('Bal_Qty', 'number', 'Closing Qty', 'right', 'center', 1),
    createCol('CL_Rate', 'number', 'Closing Rate', 'right', 'center', 1),
    createCol('CL_Value', 'number', 'Closing Value', 'right', 'center', 1),
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

  const handleSearch = async () => {
    if (!fromDate) {
      toast.error("Please select a date");
      return;
    }

    if (!selectedGroup) {
      toast.error("Please select a stock group");
      return;
    }

    try {
      setLoading(true);
      
      // If "All Stock Groups" is selected, pass 0 as stock_group_id
      const stockGroupId = selectedGroup.Item_Group_Id === "0" ? 0 : parseInt(selectedGroup.Item_Group_Id);
      
      const response = await fetchLink({
        address: `inventory/getStockValueSummaryAlt`, 
        method: "POST",
        bodyData: {
          Pre_date: fromDate,
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
    setCommonRate("");
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
          <div className="d-flex align-items-center gap-2">
           
          
           
          </div>
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
          {/* Single row with date, stock group, and buttons */}
          <div className="row mb-3 align-items-end">
            <div className="col-md-3 mb-2">
              <label className="form-label fw-bold">Select Date</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="col-md-4 mb-2">
              <label className="form-label fw-bold">Stock Group</label>
              <select
                className="form-select"
                value={selectedGroup?.Item_Group_Id || ''}
                onChange={(e) => {
                  const groupId = e.target.value;
                  const group = stockGroupsWithAll.find(g => g.Item_Group_Id.toString() === groupId);
                  setSelectedGroup(group);
                  setReportData([]);
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
            <div className="col-md-5 mb-2">
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-primary"
                  onClick={handleSearch}
                  disabled={loading || !selectedGroup}
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
              <div className="mt-2 text-muted">Fetching stock data...</div>
            </div>
          )}

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