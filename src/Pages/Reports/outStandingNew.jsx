import React, { useState, useEffect } from "react";
import { Button } from "@mui/material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";

function OutStandingNew({ loadingOn, loadingOff }) {
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

    const [filters, setFilters] = useState({ Fromdate: getTodayDate() });

    const [tillBillingData, setTillBillingData] = useState([]);
    const [noBillingData, setNoBillingData] = useState([]);

    const [salesReceipts, setSalesReceipts] = useState([]);
    const [Total_Invoice_value, setTotal_Invoice_value] = useState(0);
    const [activeButton, setActiveButton] = useState("tillBilling");

    const calculateTotal = (arr) =>
        arr.reduce((sum, item) => sum + Number(item.Total_Invoice_value || 0), 0);

    // Initial load: fetch both APIs with loading spinner
    useEffect(() => {
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
                const noBillArr = Array.isArray(noBillRes)
                    ? noBillRes
                    : noBillRes?.data || [];

                setTillBillingData(tillArr);
                setNoBillingData(noBillArr);

                // Default view → Till Billing
                setSalesReceipts(tillArr);
                setTotal_Invoice_value(calculateTotal(tillArr));
            } catch (error) {
                console.error("Error fetching outstanding data:", error);
                setTillBillingData([]);
                setNoBillingData([]);
            } finally {
                if (loadingOff) loadingOff();
            }
        };

        fetchData();
    }, []); // run only once at mount

    const switchToTillBilling = () => {
        setActiveButton("tillBilling");
        setSalesReceipts(tillBillingData);
        setTotal_Invoice_value(calculateTotal(tillBillingData));
    };

    const switchToNoBilling = () => {
        setActiveButton("noBilling");
        setSalesReceipts(noBillingData);
        setTotal_Invoice_value(calculateTotal(noBillingData));
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
                            onChange={(e) =>
                                setFilters({ ...filters, Fromdate: e.target.value })
                            }
                            className="cus-inpt"
                            style={{ padding: "4px" }}
                        />

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
                columns={[
                    createCol("Retailer_Name", "string", "Retailer Name"),
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
        </div>
    );
}

export default OutStandingNew;