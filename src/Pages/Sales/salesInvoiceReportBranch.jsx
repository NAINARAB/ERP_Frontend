
import { useState, useEffect } from "react";
import {
  Card,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Tooltip,
} from "@mui/material";
import { Search, FilterAlt, FilterAltOff } from "@mui/icons-material";
import { ISOString, toArray } from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";
import { toast } from "react-toastify";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

// 🔹 Product-level Expandable Component
const ProductTable = ({ row }) => {
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    Product_Id: "",
    Product_Name: "",
    Stock_Group: "",
    S_Sub_Group_1: "",
    Grade_Item_Group: "",
    Sales_Quantity: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({ ...columnFilters });

  const handleSearch = () => {
    setAppliedFilters({ ...columnFilters });
    setFilterDialogOpen(false);
  };

  const handleClear = () => {
    const cleared = {
      Product_Id: "",
      Product_Name: "",
      Stock_Group: "",
      S_Sub_Group_1: "",
      Grade_Item_Group: "",
      Sales_Quantity: "",
    };
    setColumnFilters(cleared);
    setAppliedFilters(cleared);
    setFilterDialogOpen(false);
  };

  // 🔹 Apply Filters
  const filteredProducts = (row?.Products || []).filter((p) => {
    return (
      (appliedFilters.Product_Name === "" ||
        p.Product_Name?.toLowerCase().includes(
          appliedFilters.Product_Name.toLowerCase()
        )) &&
      (appliedFilters.Stock_Group === "" ||
        p.Stock_Group?.toLowerCase().includes(
          appliedFilters.Stock_Group.toLowerCase()
        )) &&
      (appliedFilters.S_Sub_Group_1 === "" ||
        p.S_Sub_Group_1?.toLowerCase().includes(
          appliedFilters.S_Sub_Group_1.toLowerCase()
        )) &&
      (appliedFilters.Grade_Item_Group === "" ||
        p.Grade_Item_Group?.toLowerCase().includes(
          appliedFilters.Grade_Item_Group.toLowerCase()
        )) &&
      (appliedFilters.Sales_Quantity === "" ||
        p.Sales_Quantity?.toString().includes(appliedFilters.Sales_Quantity))
    );
  });

  const productColumns = [
    createCol("Product_Id", "string", "Product Id", "center"),
    createCol("Product_Name", "string", "Product Name", "left"),
    createCol("Stock_Group", "string", "Stock Group", "left"),
    createCol("S_Sub_Group_1", "string", "Sub Group", "left"),
    createCol("Grade_Item_Group", "string", "Grade Item Group", "left"),
    createCol("Sales_Quantity", "number", "Sales Qty", "right"),
  ];

  return (
    <div className="p-2">
      {/* 🔹 Filter Icons */}
      <div className="d-flex justify-content-end mb-2">
        <Tooltip title="Clear Filters">
          <IconButton size="small" onClick={handleClear}>
            <FilterAltOff />
          </IconButton>
        </Tooltip>

        <Tooltip title="Filter Products">
          <IconButton
            color="primary"
            size="small"
            onClick={() => setFilterDialogOpen(true)}
          >
            <FilterAlt />
          </IconButton>
        </Tooltip>
      </div>

      {/* 🔹 Filter Dialog */}
      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Filter Products in {row.Godown_Name}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {Object.keys(columnFilters)
              .filter((key) => key !== "Product_Id") // exclude Product_Id
              .map((key) => (
                <Grid item xs={12} sm={6} md={4} key={key}>
                  <TextField
                    fullWidth
                    label={key.replaceAll("_", " ")}
                    size="small"
                    value={columnFilters[key]}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) =>
                      setColumnFilters((prev) => ({
                        ...prev,
                        [key]: e.target.value,
                      }))
                    }
                  />
                </Grid>
              ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClear}>Clear</Button>
          <Button variant="contained" onClick={handleSearch}>
            Search
          </Button>
        </DialogActions>
      </Dialog>

      {/* 🔹 Product Table */}
      <FilterableTable
        dataArray={filteredProducts}
        columns={productColumns}
        EnableSerialNumber
        disablePagination={false}
        CellSize="small"
        title={`Products in ${row.Godown_Name}`}
      />
    </div>
  );
};

// ✅ Wrapper for ProductTable so hooks remain consistent
const ProductTableWrapper = (props) => <ProductTable {...props} />;

// 🔹 Godown-level Expandable Component
const GodownComp = ({ row }) => {
  const godownColumns = [
    createCol("Godown_Name", "string", "Godown Name", "left"),
  ];

  return (
    <FilterableTable
      dataArray={row.Godowns}
      columns={godownColumns}
      isExpendable
      expandableComp={ProductTableWrapper}
      EnableSerialNumber
      title={`Godowns in ${row.BranchName}`}
    />
  );
};

// 🔹 Branch-level Report
const BranchwiseSalesReport = ({ loadingOn, loadingOff, Fromdate, Todate }) => {
  const storage = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        loadingOn();
        const response = await fetchLink({
          address: `sales/salesInvoiceReport?Fromdate=${Fromdate}&Todate=${Todate}`,
          headers: { Db: storage?.Company_id },
        });

        if (response.success) {
          const rawData = toArray(response.data);

          const daysDiff = Math.max(
            1,
            Math.floor(
              (new Date(Todate) - new Date(Fromdate)) / (1000 * 60 * 60 * 24)
            ) + 1
          );

          // Calculate avg sales inside products
          const mergedData = rawData.map((branch) => ({
            ...branch,
            Godowns: branch.Godowns.map((godown) => {
              const products = godown.Products.map((p) => ({
                ...p
              }));
              return { ...godown, Products: products };
            }),
          }));

          setData(mergedData);
        } else {
          setData([]);
          toast.error("Failed to fetch branchwise data");
        }
      } catch (error) {
        console.error("Error fetching branchwise report:", error);
        toast.error("Error fetching branchwise report");
        setData([]);
      } finally {
        loadingOff();
      }
    };

    if (Fromdate && Todate) fetchData();
  }, [Fromdate, Todate, loadingOn, loadingOff, storage?.Company_id]);

  const branchColumns = [
    createCol("BranchName", "string", "Branch Name", "left"),
  ];

  return (
    <FilterableTable
      dataArray={data}
      columns={branchColumns}
      isExpendable
      expandableComp={GodownComp} // ✅ Godowns inside Branch
      EnableSerialNumber
      filterOption
      initialPageCount={10}
      title="Branchwise Sales Report"
    />
  );
};

// 🔹 Wrapper with Date Filters
const SalesReportBranch = ({ loadingOn, loadingOff }) => {
  const [filters, setFilters] = useState({
    Fromdate: ISOString(),
    Todate: ISOString(),
  });
  const [appliedFilters, setAppliedFilters] = useState({ ...filters });

  return (
    <Card className="p-3">
      <div className="d-flex align-items-center flex-wrap mb-3">
        <TextField
          label="From Date"
          type="date"
          size="small"
          value={filters.Fromdate.slice(0, 10)}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, Fromdate: e.target.value }))
          }
          InputLabelProps={{ shrink: true }}
          className="me-2"
        />
        <TextField
          label="To Date"
          type="date"
          size="small"
          value={filters.Todate.slice(0, 10)}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, Todate: e.target.value }))
          }
          InputLabelProps={{ shrink: true }}
          className="me-2"
        />
        <IconButton
          size="small"
          onClick={() => setAppliedFilters({ ...filters })}
        >
          <Search />
        </IconButton>
      </div>

      <BranchwiseSalesReport
        loadingOn={loadingOn}
        loadingOff={loadingOff}
        Fromdate={appliedFilters.Fromdate}
        Todate={appliedFilters.Todate}
      />
    </Card>
  );
};

export default SalesReportBranch;
