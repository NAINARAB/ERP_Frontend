// import React, { useState, useEffect } from "react";
// import { Button, IconButton, Tooltip } from "@mui/material";
// import SearchIcon from "@mui/icons-material/Search";
// import { fetchLink } from "../../Components/fetchComponent";
// import FilterableTable, { createCol } from "../../Components/filterableTable2";


// function OutStandingNew({ loadingOn, loadingOff }) {
//     const getTodayDate = () => {
//         const today = new Date();
//         return today.toISOString().split("T")[0];
//     };

//     const [filters, setFilters] = useState({ Fromdate: getTodayDate(),File_No: "" });
//     const [tillBillingData, setTillBillingData] = useState([]);
//     const [noBillingData, setNoBillingData] = useState([]);
//     const [salesReceipts, setSalesReceipts] = useState([]);
//     const [Total_Invoice_value, setTotal_Invoice_value] = useState(0);
//     const [activeButton, setActiveButton] = useState("tillBilling");

//     const calculateTotal = (arr) =>
//         arr.reduce((sum, item) => sum + Number(item.Total_Invoice_value || 0), 0);

//     // FetchData function, also used for initial load
//     const fetchData = async () => {
//         try {
//             if (loadingOn) loadingOn();
//             const formattedDate = encodeURIComponent(filters.Fromdate);
// const fileNo = encodeURIComponent(filters.File_No || "");
//             const [tillRes, noBillRes] = await Promise.all([
//                 fetchLink({ address: `receipt/outStandingAbove?reqDate=${formattedDate}` }),
//                 fetchLink({ address: `receipt/outstandingOver?reqDate=${formattedDate}` }),
//             ]);

//             const tillArr = Array.isArray(tillRes) ? tillRes : tillRes?.data || [];
//             const noBillArr = Array.isArray(noBillRes)
//                 ? noBillRes
//                 : noBillRes?.data || [];

//             setTillBillingData(tillArr);
//             setNoBillingData(noBillArr);

//             // Show Till Billing by default after fetch
//             setActiveButton("tillBilling");
//             setSalesReceipts(tillArr);
//             setTotal_Invoice_value(calculateTotal(tillArr));
//         } catch (error) {
//             console.error("Error fetching outstanding data:", error);
//             setTillBillingData([]);
//             setNoBillingData([]);
//             setSalesReceipts([]);
//             setTotal_Invoice_value(0);
//         } finally {
//             if (loadingOff) loadingOff();
//         }
//     };

//     // Initial data load for today
//     useEffect(() => {
//         fetchData();
//         // eslint-disable-next-line
//     }, []);

//     const switchToTillBilling = () => {
//         setActiveButton("tillBilling");
//         setSalesReceipts(tillBillingData);
//         setTotal_Invoice_value(calculateTotal(tillBillingData));
//     };

//     const switchToNoBilling = () => {
//         setActiveButton("noBilling");
//         setSalesReceipts(noBillingData);
//         setTotal_Invoice_value(calculateTotal(noBillingData));
//     };

//     return (
//         <div>
//             <FilterableTable
//                 title={
//                     activeButton === "tillBilling"
//                         ? "Till Billing"
//                         : activeButton === "noBilling"
//                             ? "OutStanding No Bill"
//                             : "Outstanding"
//                 }
//                 ButtonArea={
//                     <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
//                         <input
//                             type="date"
//                             value={filters.Fromdate || ""}
//                             onChange={(e) =>
//                                 setFilters({ ...filters, Fromdate: e.target.value })
//                             }
//                             className="cus-inpt"
//                             style={{ padding: "4px" }}
//                         />

//                         <Tooltip title="Search">
//                             <IconButton
//                                 color="primary"
//                                 size="medium"
//                                 onClick={fetchData}
//                                 sx={{ height: 40 }}
//                             >
//                                 <SearchIcon />
//                             </IconButton>
//                         </Tooltip>

//                         <Button
//                             variant={activeButton === "tillBilling" ? "contained" : "outlined"}
//                             color="primary"
//                             onClick={switchToTillBilling}
//                             sx={{ minWidth: 150, height: 40 }}
//                         >
//                             Till Billing
//                         </Button>

//                         <Button
//                             variant={activeButton === "noBilling" ? "contained" : "outlined"}
//                             color="primary"
//                             onClick={switchToNoBilling}
//                             sx={{ minWidth: 150, height: 40 }}
//                         >
//                             No Billing
//                         </Button>

//                         {Number(Total_Invoice_value) > 0 && (
//                             <h6 className="m-0 text-end text-muted px-3">
//                                 Total: {Math.abs(Total_Invoice_value)}
//                             </h6>
//                         )}
//                     </div>
//                 }
//                 EnableSerialNumber
//                 dataArray={Array.isArray(salesReceipts) ? salesReceipts : []}
//                 headerFontSizePx={14}
//                 bodyFontSizePx={13}
//                 ExcelPrintOption={true}
//                 columns={[
//                     createCol("Retailer_Name", "string", "Retailer Name"),
//                     createCol("Ref_Owners","string","Ref_Owners"),
//                     createCol("Ref_Brokers","string","Ref_Brokers"),
//                     createCol("QPay","number","QPay"),
//                     createCol("Above 30 Pending Amt", "number", "Above 30 Pending Amt"),
//                     createCol("Sum of Nos", "number", "Sum of Nos"),
//                     createCol("Max of Overdue", "number", "Max of Overdue"),
//                     createCol(
//                         "Overall Outstanding Amt",
//                         "number",
//                         "Overall Outstanding Amt"
//                     ),
//                 ]}
//                 isExpendable={false}
//                 expandableComp={({ row }) => (
//                     <div className="py-2">
//                         <FilterableTable
//                             disablePagination
//                             headerFontSizePx={13}
//                             bodyFontSizePx={12}
//                             dataArray={Array.isArray(row?.Receipts) ? row?.Receipts : []}
//                             columns={[
//                                 createCol("Do_Inv_No", "string", "Delivery Invoice Number"),
//                                 createCol("Do_Date", "date", "Delivery Date"),
//                                 createCol("collected_amount", "number", "Receipt Amount"),
//                                 createCol("total_receipt_amount", "number", "Total Receipt"),
//                                 createCol("Total_Invoice_value", "number", "Invoice Value"),
//                                 {
//                                     isVisible: 1,
//                                     ColumnHeader: "Pending Amount",
//                                     isCustomCell: true,
//                                     Cell: ({ row }) =>
//                                         Number(row?.bill_amount || 0) -
//                                         Number(row?.total_receipt_amount || 0),
//                                 },
//                             ]}
//                         />
//                     </div>
//                 )}
//             />
//         </div>
//     );
// }

// export default OutStandingNew;




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
  FormControl,
  InputLabel,
  Checkbox,
  Chip,
  ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import CloseIcon from "@mui/icons-material/Close";
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

  const calculateTotal = (arr) =>
    arr.reduce((sum, item) => sum + Number(item.Total_Invoice_value || 0), 0);

 
  const fetchFileNoOptions = async () => {
    try {
      const res = await fetchLink({
        address: `receipt/outStandingAbove?reqDate=${encodeURIComponent(
          getTodayDate()
        )}`,
      });
      const data = Array.isArray(res) ? res : res?.data || [];
      const uniqueFileNos = [
        ...new Set(data.map((item) => item.File_No).filter(Boolean)),
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

      const [tillRes, noBillRes] = await Promise.all([
        fetchLink({
          address: `receipt/outStandingAbove?reqDate=${formattedDate}`,
        }),
        fetchLink({
          address: `receipt/outstandingOver?reqDate=${formattedDate}`,
        }),
      ]);

      const tillArr = Array.isArray(tillRes) ? tillRes : tillRes?.data || [];
      const noBillArr = Array.isArray(noBillRes) ? noBillRes : noBillRes?.data || [];

      
      setOriginalTillBilling(tillArr);
      setOriginalNoBilling(noBillArr);

      
      setActiveButton("tillBilling");
      setSalesReceipts(tillArr);
      setTotal_Invoice_value(calculateTotal(tillArr));
    } catch (error) {
      console.error("Error fetching outstanding data:", error);
      setOriginalTillBilling([]);
      setOriginalNoBilling([]);
      setSalesReceipts([]);
      setTotal_Invoice_value(0);
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
      activeButton === "tillBilling" ? originalTillBilling : originalNoBilling;

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

  const switchToTillBilling = () => {
    setActiveButton("tillBilling");
  };

  const switchToNoBilling = () => {
    setActiveButton("noBilling");
  };

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
              onChange={(e) => setFilters({ ...filters, Fromdate: e.target.value })}
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
              onClick={switchToTillBilling}
              sx={{ minWidth: 150, height: 40 }}
            >
              Till Billing
            </Button>

            <Button
              variant={activeButton === "noBilling" ? "contained" : "outlined"}
              color="primary"
              onClick={switchToNoBilling}
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
                    Number(row?.bill_amount || 0) -
                    Number(row?.total_receipt_amount || 0),
                },
              ]}
            />
          </div>
        )}
      />
<Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
  <DialogTitle>File Name Filter</DialogTitle>
  <DialogContent dividers sx={{ minWidth: 500 }}>
    {/* File No Multi Select */}
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
