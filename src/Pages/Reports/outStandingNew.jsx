import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { toast } from "react-toastify";

function OutStandingNew({ loadingOn, loadingOff }) {
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    const [salesReceipts, setSalesReceipts] = useState([]);
    const [filters, setFilters] = useState({ Fromdate: getTodayDate() });
    const [Total_Invoice_value, setTotal_Invoice_value] = useState(0);
    const [activeButton, setActiveButton] = useState("tillBilling");

    const handleApiResponse = (data) => {
        const arr = Array.isArray(data) ? data : data?.data || [];
        setSalesReceipts(arr);
        setTotal_Invoice_value(
            arr.reduce((sum, item) => sum + Number(item.Total_Invoice_value || 0), 0)
        );
    };

    const fetchTillBilling = async () => {
        if (!filters.Fromdate) {
            alert("Please select a date first");
            return;
        }
        try {
            setActiveButton("tillBilling");
            const formattedDate = encodeURIComponent(filters.Fromdate);
            const data = await fetchLink({
                address: `receipt/outStandingAbove?reqDate=${formattedDate}`,
                loadingOn, loadingOff
            });
            handleApiResponse(data);
        } catch (e) {
            setSalesReceipts([]);
        }
    };

    const fetchOutstandingNoBilling = async () => {
        if (!filters.Fromdate) {

            toast.error('Please select a date first')
            return;
        }
        try {
            setActiveButton("noBilling");
            const formattedDate = encodeURIComponent(filters.Fromdate);
            const data = await fetchLink({
                address: `receipt/outstandingOver?reqDate=${formattedDate}`,
                loadingOn, loadingOff
            });
            handleApiResponse(data);
        } catch (error) {
            setSalesReceipts([]);
        }
    };

    useEffect(() => {
        fetchTillBilling();
    }, []);

    return (
        <div>

            <FilterableTable
                title={activeButton === 'tillBilling' ? "Till Billing" : "OutStanding No Bill"}
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
                            variant={activeButton === "tillBilling" ? "contained" : "outlined"}
                            color="primary"
                            onClick={fetchTillBilling}
                            sx={{ minWidth: 150, height: 40 }}
                        >
                            Till Billing
                        </Button>

                        <Button
                            variant={activeButton === "noBilling" ? "contained" : "outlined"}
                            color="primary"
                            onClick={fetchOutstandingNoBilling}
                            sx={{ minWidth: 150, height: 40 }}
                        >
                            No Billing
                        </Button>

                        {Number(Total_Invoice_value) > 0 && (
                            <h6 className="m-0 text-end text-muted px-3">
                                Total: {Total_Invoice_value}
                            </h6>
                        )}
                    </div>
                }
                EnableSerialNumber
                dataArray={Array.isArray(salesReceipts) ? salesReceipts : []}
                headerFontSizePx={14}
                bodyFontSizePx={13}
                columns={[
                    createCol("Retailer_Name", "string", "Retailer_Name"),
                    createCol("Above 30 Pending Amt", "number", "Above 30 Pending Amt"),
                    createCol("Sum of Nos", "number", "Sum of Nos"),
                    createCol("Max of Overdue", "number", "Max of Overdue"),
                    createCol("Overall Outstanding Amt", "number", "Overall Outstanding Amt"),

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
        </div>
    );
}

export default OutStandingNew;