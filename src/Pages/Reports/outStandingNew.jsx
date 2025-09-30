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
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

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
  const [originalTillBilling, setOriginalTillBilling] = useState([]);
  const [originalNoBilling, setOriginalNoBilling] = useState([]);
  const [salesReceipts, setSalesReceipts] = useState([]);
  const [Total_Invoice_value, setTotal_Invoice_value] = useState(0);
  const [activeButton, setActiveButton] = useState("tillBilling");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [debtors, setDebtors] = useState([]);

  const convertToPositive = (value) => {
    const numValue = Number(value || 0);
    return Math.abs(numValue);
  };

  const processData = (data) => {
    return data.map((item) => ({
      ...item,
      "Above 30 Pending Amt": convertToPositive(
        item["Above 30 Pending Amt"]
      ),
      "Overall Outstanding Amt": convertToPositive(
        item["Overall Outstanding Amt"]
      ),
      Total_Invoice_value: convertToPositive(item.Total_Invoice_value),
    }));
  };

  const calculateTotal = (arr) =>
    arr.reduce(
      (sum, item) =>
        sum + convertToPositive(item.Total_Invoice_value || 0),
      0
    );

  const fetchFileNoOptions = async () => {
    try {
      const res = await fetchLink({
        address: `receipt/outStandingAbove?reqDate=${encodeURIComponent(
          getTodayDate()
        )}`,
      });
      const data = Array.isArray(res) ? res : res?.data || [];
      const processedData = processData(data);
      const uniqueFileNos = [
        ...new Set(
          processedData.map((item) => item.File_No).filter(Boolean)
        ),
      ];
      setFileNoOptions(uniqueFileNos);
    } catch (err) {
      console.error("Error fetching File_No options:", err);
    }
  };

const fetchData = async () => {
  try {
    if (loadingOn) loadingOn();

    const formattedDate = encodeURIComponent(filters.Fromdate);

    const debtorsRes = await fetchLink({ address: `payment/getDebtors` });
    const debtorsArr = debtorsRes?.success ? debtorsRes.data : [];

    if (debtorsArr.length === 0) {
      setOriginalTillBilling([]);
      setOriginalNoBilling([]);
      setSalesReceipts([]);
      setTotal_Invoice_value(0);
      setDebtors([]);
      return;
    }

    setDebtors(debtorsArr);

    const validRetailerIds = new Set(
      debtorsArr.map((d) => String(d.Acc_Id))
    );

    const [tillRes, noBillRes] = await Promise.all([
      fetchLink({ address: `receipt/outStandingAbove?reqDate=${formattedDate}` }),
      fetchLink({ address: `receipt/outstandingOver?reqDate=${formattedDate}` }),
    ]);

    const tillArr = Array.isArray(tillRes) ? tillRes : tillRes?.data || [];
    const noBillArr = Array.isArray(noBillRes) ? noBillRes : noBillRes?.data || [];

    const filteredTillArr = tillArr.filter((item) =>
      validRetailerIds.has(String(item.Retailer_Id))
    );
    
    const filteredNoBillArr = noBillArr.filter((item) =>
      validRetailerIds.has(String(item.Retailer_Id))
    );


    const processedTillArr = processData(filteredTillArr);
    const processedNoBillArr = processData(filteredNoBillArr);



    setOriginalTillBilling(processedTillArr);
    setOriginalNoBilling(processedNoBillArr);
    setActiveButton("tillBilling");
    setSalesReceipts(processedTillArr);
    setTotal_Invoice_value(calculateTotal(processedTillArr));
    
  } catch (error) {
    console.error("Error fetching outstanding data:", error);
    setOriginalTillBilling([]);
    setOriginalNoBilling([]);
    setSalesReceipts([]);
    setTotal_Invoice_value(0);
    setDebtors([]);
  } finally {
    if (loadingOff) loadingOff();
  }
};
  useEffect(() => {
    fetchFileNoOptions();
    fetchData();
  }, []);

  useEffect(() => {
    const sourceData =
      activeButton === "tillBilling"
        ? originalTillBilling
        : originalNoBilling;

    let filtered = [...sourceData];

    if (filters.File_No.length > 0) {
      if (filters.filterMode === "include") {
        filtered = sourceData.filter((row) =>
          filters.File_No.includes(row.File_No)
        );
      } else if (filters.filterMode === "exclude") {
        filtered = sourceData.filter(
          (row) => !filters.File_No.includes(row.File_No)
        );
      }
    }

    setSalesReceipts(filtered);
    setTotal_Invoice_value(calculateTotal(filtered));
  }, [filters, activeButton, originalTillBilling, originalNoBilling]);

  return (
    <div>
      <FilterableTable
        title={
          activeButton === "tillBilling"
            ? "Till Billing"
            : activeButton === "noBilling"
            ? "OutStanding No Bill"
            : "Outstanding"
        }
        ButtonArea={
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="date"
              value={filters.Fromdate || ""}
              onChange={(e) =>
                setFilters({ ...filters, Fromdate: e.target.value })
              }
              className="cus-inpt"
              style={{ padding: "4px" }}
            />

            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setFilterDialogOpen(true)}
              sx={{ height: 50 }}
            >
              Filter
            </Button>

            <Tooltip title="Search">
              <IconButton
                color="primary"
                size="medium"
                onClick={fetchData}
                sx={{ height: 50 }}
              >
                <SearchIcon />
              </IconButton>
            </Tooltip>

            <Button
              variant={activeButton === "tillBilling" ? "contained" : "outlined"}
              color="primary"
              onClick={() => setActiveButton("tillBilling")}
              sx={{ minWidth: 150, height: 40 }}
            >
              Till Billing
            </Button>

            <Button
              variant={activeButton === "noBilling" ? "contained" : "outlined"}
              color="primary"
              onClick={() => setActiveButton("noBilling")}
              sx={{ minWidth: 150, height: 40 }}
            >
              No Billing
            </Button>

            {Number(Total_Invoice_value) > 0 && (
              <h6 className="m-0 text-end text-muted px-3">
                Total: {Math.abs(Total_Invoice_value)}
              </h6>
            )}
          </div>
        }
        EnableSerialNumber
        dataArray={Array.isArray(salesReceipts) ? salesReceipts : []}
        headerFontSizePx={14}
        bodyFontSizePx={13}
        ExcelPrintOption={true}
        columns={[
          createCol("Retailer_Name", "string", "Retailer Name"),
          createCol("Ref_Owners", "string", "Ref_Owners"),
          createCol("Ref_Brokers", "string", "Ref_Brokers"),
          createCol("QPay", "number", "QPay"),
          createCol("Above 30 Pending Amt", "number", "Above 30 Pending Amt"),
          createCol("Sum of Nos", "number", "Sum of Nos"),
          createCol("Max of Overdue", "number", "Max of Overdue"),
          createCol(
            "Overall Outstanding Amt",
            "number",
            "Overall Outstanding Amt"
          ),
        ]}
        isExpendable={false}
        expandableComp={({ row }) => (
          <div className="py-2">
            <FilterableTable
              disablePagination
              headerFontSizePx={13}
              bodyFontSizePx={12}
              dataArray={Array.isArray(row?.Receipts) ? row?.Receipts : []}
              columns={[
                createCol("Do_Inv_No", "string", "Delivery Invoice Number"),
                createCol("Do_Date", "date", "Delivery Date"),
                createCol("collected_amount", "number", "Receipt Amount"),
                createCol("total_receipt_amount", "number", "Total Receipt"),
                createCol("Total_Invoice_value", "number", "Invoice Value"),
                {
                  isVisible: 1,
                  ColumnHeader: "Pending Amount",
                  isCustomCell: true,
                  Cell: ({ row }) =>
                    convertToPositive(
                      Number(row?.bill_amount || 0) -
                        Number(row?.total_receipt_amount || 0)
                    ),
                },
              ]}
            />
          </div>
        )}
      />

      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
      >
        <DialogTitle>File Name Filter</DialogTitle>
        <DialogContent dividers sx={{ minWidth: 500 }}>
          <div style={{ marginBottom: "20px" }}>
            <InputLabel id="file-no-label">File Nos</InputLabel>
            <Select
              labelId="file-no-label"
              multiple
              fullWidth
              value={filters.File_No}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  File_No:
                    typeof e.target.value === "string"
                      ? e.target.value.split(",")
                      : e.target.value,
                })
              }
              renderValue={(selected) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={value}
                      onDelete={() =>
                        setFilters({
                          ...filters,
                          File_No: filters.File_No.filter((f) => f !== value),
                        })
                      }
                      deleteIcon={<CloseIcon />}
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

          <div style={{ marginBottom: "10px" }}>
            <InputLabel id="filter-mode-label">Filter Mode</InputLabel>
            <Select
              labelId="filter-mode-label"
              fullWidth
              value={filters.filterMode}
              onChange={(e) =>
                setFilters({ ...filters, filterMode: e.target.value })
              }
            >
              <MenuItem value="include">Include</MenuItem>
              <MenuItem value="exclude">Exclude</MenuItem>
            </Select>
          </div>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between" }}>
          <Button
            onClick={() => setFilters({ ...filters, File_No: [] })}
            color="secondary"
            variant="outlined"
          >
            Clear Filter
          </Button>

          <Button
            onClick={() => setFilterDialogOpen(false)}
            variant="contained"
            color="primary"
          >
            Apply Filter
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default OutStandingNew;
