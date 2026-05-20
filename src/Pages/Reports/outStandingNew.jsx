

import React, { useState, useEffect } from "react";
import {
  Button,
  IconButton,
  Tooltip,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputLabel,
  Checkbox,
  Chip,
  ListItemText,
  Sync
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { toast } from 'react-toastify';

function OutStandingNew({ loadingOn, loadingOff }) {
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [filters, setFilters] = useState({
    Fromdate: getTodayDate(),
    File_No: [],
    filterMode: "include",
  });
  const [fileNoOptions, setFileNoOptions] = useState([]);
  const [allOutstandingData, setAllOutstandingData] = useState([]);
  const [salesReceipts, setSalesReceipts] = useState([]);
  const [Total_Invoice_value, setTotal_Invoice_value] = useState(0);
  const [activeButton, setActiveButton] = useState("tillBilling");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const convertToPositive = (value) => {
    const numValue = Number(value || 0);
    return Math.abs(numValue);
  };


  const processData = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      ...item,
      "Above 30 Pending Amt": convertToPositive(item["Above 30 Pending Amt"]),
      "Overall Outstanding Amt": convertToPositive(item["Overall Outstanding Amt"]),
      Total_Invoice_value: convertToPositive(item.Total_Invoice_value || 0),
    }));
  };

  const calculateTotal = (arr) => {
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((sum, item) => sum + (item.Total_Invoice_value || 0), 0);
  };


  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (loadingOn) loadingOn();

      const formattedDate = encodeURIComponent(filters.Fromdate);

      
      const outstandingRes = await fetchLink({ 
        address: `receipt/outStandingAbove?reqDate=${formattedDate}` 
      });
      
  
      
      const outstandingData = Array.isArray(outstandingRes) 
        ? outstandingRes 
        : outstandingRes?.data || [];


      const processedData = processData(outstandingData);
      setAllOutstandingData(processedData);

    
      const uniqueFileNos = [...new Set(processedData.map((item) => item.File_No).filter(Boolean))];
      setFileNoOptions(uniqueFileNos);

  
      const tillBillingData = processedData.filter(item => 
        item.Billing === 'Till_Billing'
      );
      
      setSalesReceipts(tillBillingData);
      setTotal_Invoice_value(calculateTotal(tillBillingData));
      setActiveButton("tillBilling");
      
    } catch (error) {
     
      setAllOutstandingData([]);
      setSalesReceipts([]);
      setTotal_Invoice_value(0);
      setFileNoOptions([]);
    } finally {
      setIsLoading(false);
      if (loadingOff) loadingOff();
    }
  };


  useEffect(() => {
    if (allOutstandingData.length === 0) return;

    let sourceData = [];
    

    if (activeButton === "tillBilling") {
      sourceData = allOutstandingData.filter(item => item.Billing === 'Till_Billing');
    } else if (activeButton === "noBilling") {
      sourceData = allOutstandingData.filter(item => item.Billing === 'No_Billing');
    }


    let filtered = sourceData;
    if (filters.File_No.length > 0) {
      if (filters.filterMode === "include") {
        filtered = sourceData.filter((row) => filters.File_No.includes(row.File_No));
      } else {
        filtered = sourceData.filter((row) => !filters.File_No.includes(row.File_No));
      }
    }

    setSalesReceipts(filtered);
    setTotal_Invoice_value(calculateTotal(filtered));
  }, [filters, activeButton, allOutstandingData]);


  useEffect(() => {
    fetchData();
  }, []);


  const handleButtonClick = (buttonType) => {
    setActiveButton(buttonType);

  };


  const applyFilters = () => {
    setFilterDialogOpen(false);
  };

      const syncLOS = () => {
          if (loadingOn) loadingOn();
         
          fetchLink({
              address: `reports/syncPosPending`,
              method: 'POST',
              bodyData:allOutstandingData
          }).then(data => {
              if (data.success) toast.success(data.message);
              else toast.error(data.message);
          }).catch(e => console.error(e)).finally(() => {
              if (loadingOff) loadingOff();
          })
      }

  return (
    <div>
      <FilterableTable
        title={
          activeButton === "tillBilling" ? "Till Billing" : "OutStanding No Bill"
        }
        ButtonArea={
          <div style={{ display: "flex",gap: "8px" }}>
            <input
              type="date"
              value={filters.Fromdate || ""}
              onChange={(e) => setFilters({ ...filters, Fromdate: e.target.value })}
              className="cus-inpt"
              style={{ padding: "4px", minWidth: '150px' }}
            />

            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setFilterDialogOpen(true)}
              sx={{ height: 40 }}
              disabled={isLoading}
            >
              Filter
            </Button>
 <Button
      variant="contained"
      color="success"
      onClick={syncLOS}
      sx={{ height: 40, minWidth: 100 }}
      disabled={isLoading}
    >
      Sync
    </Button>

            <Tooltip title="Search">
              <IconButton
                color="primary"
                size="medium"
                onClick={fetchData}
                sx={{ height: 40 }}
                disabled={isLoading}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant={activeButton === "tillBilling" ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleButtonClick("tillBilling")}
              sx={{ minWidth: 120, height: 40 }}
              disabled={isLoading}
            >
              Till Billing
            </Button>

            <Button
              variant={activeButton === "noBilling" ? "contained" : "outlined"}
              color="primary"
              onClick={() => handleButtonClick("noBilling")}
              sx={{ minWidth: 120, height: 40 }}
              disabled={isLoading}
            >
              No Billing
            </Button>

            {Number(Total_Invoice_value) > 0 && (
              <h6 className="m-0 text-end text-muted px-3">
                Total: {Math.round(Total_Invoice_value).toLocaleString()}
              </h6>
            )}

          </div>
        }
        EnableSerialNumber
        dataArray={salesReceipts}
        headerFontSizePx={14}
        bodyFontSizePx={13}
        ExcelPrintOption={true}
        columns={[
          createCol("Retailer_Name", "string", "Retailer Name"),
          createCol("Ref_Owners", "string", "Ref Owners"),
          createCol("Ref_Brokers", "string", "Ref Brokers"),
          createCol("QPay", "number", "QPay"),
          createCol("Above_30_Days_Pending_Amt", "number", "Above 30 Pending Amt"),
          createCol("Total_Pending_Bills", "number", "No of Bills"),
          createCol("Overall_Outstanding_Amt", "number", "Overall Outstanding Amt"),
          createCol("Billing", "string", "Billing Type"),
        ]}
        isExpendable={false}
        expandableComp={({ row }) => (
          <div className="py-2">
            <FilterableTable
              disablePagination
              headerFontSizePx={13}
              bodyFontSizePx={12}
              dataArray={Array.isArray(row?.Receipts) ? row.Receipts : []}
              columns={[
                createCol("Do_Inv_No", "string", "Delivery Invoice"),
                createCol("Do_Date", "date", "Delivery Date"),
                createCol("collected_amount", "number", "Receipt Amount"),
                createCol("total_receipt_amount", "number", "Total Receipt"),
                createCol("Total_Invoice_value", "number", "Invoice Value"),
                {
                  isVisible: 1,
                  ColumnHeader: "Pending Amount",
                  isCustomCell: true,
                  Cell: ({ row }) => convertToPositive(
                    Number(row?.bill_amount || 0) - Number(row?.total_receipt_amount || 0)
                  ),
                },
              ]}
            />
          </div>
        )}
      />

      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
        <DialogTitle>File Name Filter</DialogTitle>
        <DialogContent dividers sx={{ minWidth: 400 }}>
          <div style={{ marginBottom: "20px" }}>
            <InputLabel>File Nos</InputLabel>
            <Select
              multiple
              fullWidth
              value={filters.File_No}
              onChange={(e) => setFilters({
                ...filters,
                File_No: typeof e.target.value === "string" ? e.target.value.split(",") : e.target.value,
              })}
              renderValue={(selected) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      size="small"
                      onDelete={() => setFilters({
                        ...filters,
                        File_No: filters.File_No.filter((f) => f !== value),
                      })}
                      onMouseDown={(e) => e.stopPropagation()}
                    />
                  ))}
                </div>
              )}
            >
              {fileNoOptions.map((file, idx) => (
                <MenuItem key={idx} value={file}>
                  <Checkbox checked={filters.File_No.includes(file)} />
                  <ListItemText primary={file} />
                </MenuItem>
              ))}
            </Select>
          </div>

          <div>
            <InputLabel>Filter Mode</InputLabel>
            <Select
              fullWidth
              value={filters.filterMode}
              onChange={(e) => setFilters({ ...filters, filterMode: e.target.value })}
            >
              <MenuItem value="include">Include Selected</MenuItem>
              <MenuItem value="exclude">Exclude Selected</MenuItem>
            </Select>
          </div>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          <Button
            onClick={() => setFilters({ ...filters, File_No: [] })}
            color="secondary"
            variant="outlined"
          >
            Clear All
          </Button>
          <Button onClick={applyFilters} variant="contained" color="primary">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default OutStandingNew;