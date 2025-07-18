import { useEffect, useMemo, useState } from "react";
import FilterableTable, {
    createCol,
} from "../../../Components/filterableTable2";
import {
    Addition,
    ISOString,
    NumberFormat,
    toArray,
} from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
} from "@mui/material";
import { FilterAlt, FilterAltOff } from "@mui/icons-material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";

const PurchaseBrokerageReport = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const [deliveryReport, setDeliveryReport] = useState([]);
    const [reportType, setReportType] = useState("purchase");
    const [dropDown, setDropDown] = useState({ broker: [] });

    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        Broker: { value: "", label: "ALL Brokers" },
        refresh: false,
        filterDialog: false,
    });

    useEffect(() => {
        fetchLink({
            address: `reports/brokerageReport/getInvolvedBroker`,
        })
            .then((data) => {
                if (data.success) {
                    setDropDown((prev) => ({
                        ...prev,
                        broker: toArray(data.data),
                    }));
                }
            })
            .catch(console.error);
    }, []);



    useEffect(() => {
        const fetchData = async () => {
            try {
                loadingOn();

                const [purchaseRes, salesRes] = await Promise.all([
                    fetchLink({
                        address: `reports/brokerageReport/purchaseInvoice?Fromdate=${filters.Fromdate}&Todate=${filters.Todate}&broker=${filters.Broker.value}`,
                    }),
                    fetchLink({
                        address: `reports/brokerageReport/salesInvoice?Fromdate=${filters.Fromdate}&Todate=${filters.Todate}&broker=${filters.Broker.value}`,
                    }),
                ]);

                if (purchaseRes.success) setReportData(toArray(purchaseRes.data));
                else setReportData([]);

                if (salesRes.success) setDeliveryReport(toArray(salesRes.data));
                else setDeliveryReport([]);

            } catch (err) {
                setReportData([]);
                setDeliveryReport([]);
            } finally {
                loadingOff();
            }
        };

        fetchData();
    }, [filters.refresh]);




    const closeDialog = () => {
        setFilters((prev) => ({ ...prev, filterDialog: false }));
    };

    const currentData = reportType === "purchase" ? reportData : deliveryReport;

    const totalBags = useMemo(() => {
        return currentData.reduce(
            (acc, item) => Addition(acc, item.displayQuantity),
            0
        );
    }, [currentData]);

    const showBrokerColumn = filters.Broker.value === "";

    const purchaseColumns = [
        ...(showBrokerColumn
            ? [createCol("CostCenterGet", "string", "Broker")]
            : []),
        createCol("Retailer_Name", "string", "Party"),
        createCol("Po_Entry_Date", "date", "Date"),
        createCol("Po_Inv_No", "string", "Inv_No"),
        createCol("Product_Name", "string", "Item"),
        createCol("displayQuantity", "number", "Bag"),
        createCol("Item_Rate", "number", "Rate"),
        createCol("Act_Qty", "number"),
        createCol("Total_Invoice_value", "string", "Total_Invo_value"),
        createCol("VoucherGet", "string", "Voucher"),
    ];

    const salesColumns = [
        ...(showBrokerColumn
            ? [createCol("CostCenterGet", "string", "Broker")]
            : []),
        createCol("Retailer_Name", "string", "Party"),
        createCol("Do_Inv_No", "string", "Inv_No"),
        createCol("Date", "date", "Date"),
        createCol("Product_Name", "string", "Item"),
        createCol("displayQuantity", "number", "Bag"),
        createCol("Item_Rate", "number", "Rate"),
        createCol("Act_Qty", "string", "Act_Qty"),
        createCol("Total_Invoice_value", "string", "Total_Invo_value"),
        createCol("VoucherGet", "string", "Voucher"),
    ];

    const currentColumns =
        reportType === "purchase" ? purchaseColumns : salesColumns;

    const brokerLabel =
        filters.Broker.value === "" ? "ALL Brokers" : filters.Broker.label;
    const titleText = `${reportType === "purchase" ? "Purchase Broker" : "Sales Broker"
        } : ${brokerLabel}`;

    return (
        <>
            <FilterableTable
                title={titleText}
                EnableSerialNumber
                headerFontSizePx={12}
                bodyFontSizePx={12}
                maxHeightOption
                ExcelPrintOption
                dataArray={currentData}
                columns={currentColumns}
                ButtonArea={
                    <>
                        <IconButton
                            size="small"
                            onClick={() =>
                                setFilters((prev) => ({ ...prev, filterDialog: true }))
                            }
                        >
                            <FilterAlt />
                        </IconButton>
                        <span className="p-2">Total Bags: {NumberFormat(totalBags)}</span>
                        <div className="d-flex align-items-center mb-2">
                            <Button
                                variant={reportType === "purchase" ? "contained" : "outlined"}
                                onClick={() => setReportType("purchase")}
                                size="small"
                                style={{ minWidth: "100px" }}
                            >
                                Purchase
                            </Button>
                            <Button
                                variant={reportType === "sales" ? "contained" : "outlined"}
                                onClick={() => setReportType("sales")}
                                size="small"
                                style={{ marginLeft: "10px", minWidth: "100px" }}
                            >
                                Sales
                            </Button>
                        </div>
                    </>
                }
            />

            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    <h5 className="d-flex justify-content-between px-2">
                        <span>Filters</span>
                        <span>
                            <IconButton size="small" onClick={closeDialog}>
                                <FilterAltOff />
                            </IconButton>
                        </span>
                    </h5>
                    <div className="table-responsive">
                        <table className="table m-0">
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>From</td>
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
                                    <td style={{ verticalAlign: "middle" }}>To</td>
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
                                    <td style={{ verticalAlign: "middle" }}>Broker</td>
                                    <td>
                                        <Select
                                            value={filters.Broker}
                                            onChange={(e) => setFilters({ ...filters, Broker: e })}
                                            options={[
                                                { value: "", label: "ALL Brokers" },
                                                ...dropDown.broker,
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Broker Name"}
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
                        variant="outlined"
                        onClick={() => {
                            setFilters((prev) => ({ ...prev, refresh: !prev.refresh }));
                            closeDialog();
                        }}
                    >
                        Search
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PurchaseBrokerageReport;
