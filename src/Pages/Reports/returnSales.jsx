import { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    Tooltip,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import { FilterAlt, Search } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { useNavigate } from "react-router-dom";
import { NumberFormat, toNumber } from "../../Components/functions";

const ReturnSales = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
    const sessionValue = sessionStorage.getItem("filterValues");
    const defaultFilters = {
        Fromdate: new Date().toISOString().split('T')[0],
        Todate: new Date().toISOString().split('T')[0],
        Retailer_Id: ""
    };

    const navigate = useNavigate();
    const [returnSales, setReturnSales] = useState([]);
    const [retailers, setRetailers] = useState([]); // State for retailer dropdown
    const [filters, setFilters] = useState(defaultFilters);
    const [dialog, setDialog] = useState({ filters: false });

    // Extract unique retailers from return sales data
    const extractRetailers = (data) => {
        if (!Array.isArray(data)) return [];

        const retailerMap = new Map();
        data.forEach(item => {
            if (item.Retailer_Id && item.Retailer_Name) {
                retailerMap.set(item.Retailer_Id, {
                    id: item.Retailer_Id,
                    name: item.Retailer_Name
                });
            }
        });

        return Array.from(retailerMap.values());
    };

    const fetchReturnSales = () => {
        fetchLink({
            address: `reports/returnReports?Fromdate=${filters.Fromdate}&Todate=${filters.Todate}&Retailer_Id=${filters.Retailer_Id}`,
            loadingOn,
            loadingOff,
        })
            .then((data) => {
                if (data && data.success) {
                    const salesData = Array.isArray(data.data) ? data.data : [];
                    setReturnSales(salesData);
                    // Extract retailers from the fetched data
                    setRetailers(extractRetailers(salesData));
                } else {
                    setReturnSales([]);
                    setRetailers([]);
                }
            })
            .catch((e) => {
                console.error("Fetch error:", e);
                setReturnSales([]);
                setRetailers([]);
            });
    };

    useEffect(() => {
        fetchReturnSales();
    }, []);

    const closeDialog = () => {
        setDialog({ ...dialog, filters: false });
    };

    const totals = returnSales.reduce((acc, item) => {
        return {
            totalAmount: acc.totalAmount + (toNumber(item.Amount) || 0),
            totalTaxable: acc.totalTaxable + (toNumber(item.Taxable_Amount) || 0),
            totalFinal: acc.totalFinal + (toNumber(item.Final_Amo) || 0),
        };
    }, { totalAmount: 0, totalTaxable: 0, totalFinal: 0 });

    return (
        <>
            <FilterableTable
                title="Return Sales"
                dataArray={returnSales}
                EnableSerialNumber
                columns={[
                    createCol("Ret_Date", "date", "Ret.Date"),
                    createCol("Delivery_Order_Id", "string", "DelOrd.ID"),
                    createCol("Retailer_Name", "string", "Retailer"),
                    createCol("Do_Inv_No", "string", "Do_Inv_No"),
                    createCol("Product_Name", "string", "Prod.Name"),
                    createCol("Bill_Qty", "number", "Bill Qty"),
                    createCol("Act_Qty", "number", "Actual Qty"),
                    createCol("Free_Qty", "number", "Free Qty"),
                    createCol("Total_Qty", "number", "Total Qty"),
                    createCol("Unit_Name", "string", "Unit"),
                    createCol("Taxable_Rate", "number", "Taxable Rate"),
                    createCol("Item_Rate", "number", "Item Rate"),
                    createCol("Amount", "number", "Amount"),
                    createCol("Taxable_Amount", "number", "Taxable Amount"),
                    createCol("Tax_Rate", "number", "Tax Rate %"),
                    createCol("Cgst_Amo", "number", "CGST Amount"),
                    createCol("Sgst_Amo", "number", "SGST Amount"),
                    createCol("Igst_Amo", "number", "IGST Amount"),
                    createCol("Final_Amo", "number", "Final Amount"),
                    createCol("HSN_Code", "string", "HSN Code"),
                ]}
                ButtonArea={
                    <>
                        <Tooltip title="Filters">
                            <IconButton
                                size="small"
                                onClick={() => setDialog({ ...dialog, filters: true })}
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                        <span className="bg-light text-light fa-11 px-1 shadow-sm py-1 rounded-3 mx-1">
                            {returnSales.length > 0 && (
                                <div className="d-flex gap-3">
                                    <h6 className="m-0 text-muted">
                                        Total Amount: {NumberFormat(totals.totalAmount)}
                                    </h6>
                                </div>
                            )}
                        </span>
                    </>
                }
                tableMaxHeight={550}
            />

            <Dialog open={dialog.filters} onClose={closeDialog} fullWidth maxWidth="sm">
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: "middle", width: "30%" }}>From Date</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={(e) =>
                                                setFilters({ ...filters, Fromdate: e.target.value })
                                            }
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>To Date</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={(e) =>
                                                setFilters({ ...filters, Todate: e.target.value })
                                            }
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Retailer</td>
                                    <td>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Select Retailer</InputLabel>
                                            <Select
                                                value={filters.Retailer_Id}
                                                onChange={(e) =>
                                                    setFilters({ ...filters, Retailer_Id: e.target.value })
                                                }
                                                label="Select Retailer"
                                            >
                                                <MenuItem value="">All Retailers</MenuItem>
                                                {retailers.map((retailer) => (
                                                    <MenuItem key={retailer.id} value={retailer.id}>
                                                        {retailer.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Close</Button>
                    <Button
                        onClick={() => {
                            closeDialog();
                            fetchReturnSales();
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >
                        Search
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ReturnSales;