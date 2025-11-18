import { useState, useEffect } from "react";
import {
    Button,
    Dialog,
    Tooltip,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogActions,
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
    };

    const navigate = useNavigate();
    const [returnSales, setReturnSales] = useState([]);
    const [filters, setFilters] = useState(defaultFilters);
    const [dialog, setDialog] = useState({ filters: false });

    const fetchReturnSales = () => {
        fetchLink({
            address: `reports/returnReports?Fromdate=${filters.Fromdate}&Todate=${filters.Todate}`,
            loadingOn,
            loadingOff,
        })
            .then((data) => {
                console.log("API Response:", data); // Debug log
                if (data && data.success) {
                    setReturnSales(Array.isArray(data.data) ? data.data : []);
                } else {
                    setReturnSales([]);
                }
            })
            .catch((e) => {
                console.error("Fetch error:", e);
                setReturnSales([]);
            });
    };

    useEffect(() => {
        fetchReturnSales();
    }, []);

    useEffect(() => {
        console.log("Return Sales State:", returnSales); 
    }, [returnSales]);

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
                    // createCol("Re_St_Id", "string", "Return Stock ID"),
                    createCol("Godown_Name", "string", "Godown"),
                    createCol("Product_Name", "string", "Prod.Name"),
                    createCol("Bill_Qty", "number", "Bill.Qty"),
                    createCol("Act_Qty", "number", "Act.Qty"),
                    createCol("Free_Qty", "number", "Free.Qty"),
                    createCol("Total_Qty", "number", "Total.Qty"),
                    createCol("Unit_Name", "string", "Unit"),
                    createCol("Taxable_Rate", "number", "Tax.Rate"),
                    createCol("Item_Rate", "number", "Item.Rate"),
                    createCol("Amount", "number", "Amount"),
                    createCol("Taxable_Amount", "number", "Taxable.Amo"),
                    createCol("Tax_Rate", "number", "Tax.Rate%"),
                    createCol("Cgst_Amo", "number", "CGST "),
                    createCol("Sgst_Amo", "number", "SGST "),
                    createCol("Igst_Amo", "number", "IGST "),
                    createCol("Final_Amo", "number", "Final"),
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
                                    <td style={{ verticalAlign: "middle" }}>From Date</td>
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