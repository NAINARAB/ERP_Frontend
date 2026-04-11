import React, { useState, useEffect, Fragment } from "react";
import {
  IconButton,
  Tooltip,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { fetchLink } from "../../Components/fetchComponent";
import { toast } from "react-toastify";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

const StockValueDetails = () => {
  const [fromDate, setFromDate] = useState(format(new Date().setDate(1), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [stockGroups, setStockGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [showZeroEntries, setShowZeroEntries] = useState(false);

  
  const stockGroupsWithAll = [{ Item_Group_Id: "0", Group_Name: "All" }, ...stockGroups];

 
  const itemsWithAll = [{ Product_Id: "0", stock_item_name: "-- All Items --" }, ...items];

 
  const columns = [
    createCol('Trans_Date', 'date', 'Date', 'left', 'center', 1),
    createCol('Item_Group_Id', 'number', 'Item_ID', 'center', 'center', 1),
    createCol('Group_Name', 'string', 'Group Name', 'left', 'center', 1),
    createCol('OB_Bal_Qty', 'number', 'OB_Bal_Qty', 'right', 'center', 1),
    createCol('OB_Rate', 'number', 'OB_Rate', 'right', 'center', 1),
    createCol('OB_Value', 'number', 'OB_Val', 'right', 'center', 1),
    createCol('Pur_Qty', 'number', 'Pur_Qty', 'right', 'center', 1),
    createCol('Pur_Rate', 'number', 'Pur_Rate', 'right', 'center', 1),
    createCol('Pur_value', 'number', 'Pur_Val', 'right', 'center', 1),
    createCol('Adj_Pur_Qty', 'number', 'Adj_Pur_Qty', 'right', 'center', 1),
    createCol('Adj_Pur_value', 'number', 'Adj_Pur_value', 'right', 'center', 1),
    createCol('IN_Qty', 'number', 'IN_Qty', 'right', 'center', 1),
    createCol('IN_Rate', 'number', 'IN_Rate', 'right', 'center', 1),
    createCol('IN_Value', 'number', 'IN_Value', 'right', 'center', 1),
    createCol('Sal_Qty', 'number', 'Sal_Qty', 'right', 'center', 1),
    createCol('Sal_Rate', 'number', 'Sal_Rate', 'right', 'center', 1),
    createCol('Sal_value', 'number', 'Sal_value', 'right', 'center', 1),
    createCol('Adj_Sal_Qty', 'number', 'Adj_Sal_Qty', 'right', 'center', 1),
    createCol('Adj_Sal_Rate', 'number', 'Adj_Sal_Rate', 'right', 'center', 1),
    createCol('Adj_Sal_value', 'number', 'Adj_Sal_value', 'right', 'center', 1),
    createCol('OUT_Qty', 'number', 'OUT_Qty', 'right', 'center', 1),
    createCol('Out_Rate', 'number', 'Out_Rate', 'right', 'center', 1),
    createCol('Out_Value', 'number', 'Out_Value', 'right', 'center', 1),
    createCol('Expense_value', 'number', 'Expense_value', 'right', 'center', 1),
    createCol('Act_Expense', 'number', 'Act_Expense', 'right', 'center', 1),
    createCol('Bal_Qty', 'number', 'Bal_Qty', 'right', 'center', 1),
    createCol('CL_Rate', 'number', 'CL_Rate', 'right', 'center', 1),
    createCol('CL_Value', 'number', 'CL_Val', 'right', 'center', 1),
    createCol('CR_CL_Rate', 'number', 'CR_CL_Rate', 'right', 'center', 1),
    createCol('Pre_Qty', 'number', 'Pre_Qty', 'right', 'center', 1),
    createCol('Pre_Rate', 'number', 'Pre_Rate', 'right', 'center', 1),
    createCol('Pre_CL_Value', 'number', 'Pre_CL_Value', 'right', 'center', 1),
  ];

  useEffect(() => {
    loadStockGroups();
  }, [reload]);

  useEffect(() => {
    if (selectedGroup && selectedGroup.Item_Group_Id !== "0") {
      loadItemsByGroup(selectedGroup.Item_Group_Id);
    } else {
      setItems([]);
      setSelectedItem(null);
    }
  }, [selectedGroup]);

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
      setSelectedItem(null);
      
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

  const handleSearch = async () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both from and to dates");
      return;
    }

    if (!selectedGroup) {
      toast.error("Please select a stock group");
      return;
    }

    try {
      setLoading(true);
      
      const requestBody = {
        FromDate: fromDate,
        ToDate: toDate,
        StockGroupId: selectedGroup.Item_Group_Id === "0" ? null : selectedGroup.Item_Group_Id,
        ItemId: selectedItem && selectedItem.Product_Id !== "0" ? selectedItem.Product_Id : null
      };



      const response = await fetchLink({
        address: `inventory/stockValueErp`,
        method: "POST",
        bodyData: requestBody
      });
      
      if (response && response.success) {
        let data = response.data?.records || [];
        
        // Apply zero rate filter
        let displayData = [...data];
        if (!showZeroEntries) {
          displayData = displayData.filter(item => (item.CL_Rate || 0) !== 0);
        }
        
        setReportData(displayData);
        
        toast.success(`Report loaded successfully. Found ${displayData.length} records`);
      } else {
        toast.error(response?.message || "Failed to fetch stock value data");
        setReportData([]);
      }
    } catch (err) {
      console.error("Error fetching stock value details:", err);
      toast.error("Failed to fetch stock value data: " + (err.message || "Unknown error"));
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedGroup(null);
    setSelectedItem(null);
    setReportData([]);
    setFromDate(format(new Date().setDate(1), 'yyyy-MM-dd'));
    setToDate(format(new Date(), 'yyyy-MM-dd'));
    setShowZeroEntries(false);
    setReload(prev => !prev);
    toast.info("Filters reset");
  };


  const TableButtonArea = () => {
    return (
      <div className="d-flex align-items-center gap-2">
       
      </div>
    );
  };

  return (
    <Fragment>
      <div className="card">
        <div className="card-header bg-white fw-bold">
          STOCK VALUE DETAILS REPORT
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

    

        
          <div className="row mb-3">
            <div className="col-12">
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
              <div className="mt-2 text-muted">Fetching stock value details...</div>
            </div>
          )}

          {!loading && (
            <FilterableTable
              dataArray={reportData}
              columns={columns}
              title="Stock Value Details"
              PDFPrintOption={true}
              ExcelPrintOption={true}
              maxHeightOption={true}
              EnableSerialNumber={true}
              initialPageCount={20}
              tableMaxHeight={500}
              ButtonArea={<TableButtonArea />}
            />
          )}

          {!loading && reportData.length === 0 && selectedGroup && (
            <div className="alert alert-info text-center mt-3">
              No stock value details found for the selected criteria.
            </div>
          )}
        </div>
      </div>
    </Fragment>
  );
};

export default StockValueDetails;