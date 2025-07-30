import React, { useEffect, useState, useMemo } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { toArray, Addition } from "../../../Components/functions";
import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Box,
    Grid,
    TablePagination,
    Tabs,
    Tab,
    Collapse,
    Tooltip,
} from "@mui/material";
import {
    FilterAltOff,
    FilterAlt,
    Save,
    KeyboardArrowDown,
    KeyboardArrowUp,
} from "@mui/icons-material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from "react-toastify";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PdfPreviewModal from "./PdfPreviewModal";
import XlPreviewModal from "./XlPreviewModal";

const NakalReports = ({ loadingOn, loadingOff }) => {
    const [transactionType, setTransactionType] = useState("sales");

    const [dataEntryPagination, setDataEntryPagination] = useState({
        page: 0,
        rowsPerPage: 10,
    });
    const [listingPagination, setListingPagination] = useState({
        page: 0,
        rowsPerPage: 10,
    });

    const [activeTab, setActiveTab] = useState(0);
    const [dropDown, setDropDown] = useState({ broker: [] });

    const [salesData, setSalesData] = useState({
        deliveryReport: [],
        brokerageValues: {},
        filters: {
            FromDate: new Date().toISOString().split("T")[0],
            ToDate: new Date().toISOString().split("T")[0],
            Broker: { value: "", label: "ALL Brokers" },
            refresh: false,
            filterDialog: false,
        },
        headerVilaiVasi: "",
    });

    const [purchaseData, setPurchaseData] = useState({
        deliveryReport: [],
        brokerageValues: {},
        filters: {
            FromDate: new Date().toISOString().split("T")[0],
            ToDate: new Date().toISOString().split("T")[0],
            Broker: { value: "", label: "ALL Brokers" },
            refresh: false,
            filterDialog: false,
        },
        headerBrokerage: "",
    });

    const [filtersListing, setFiltersListing] = useState({
        FromDate: new Date().toISOString().split("T")[0],
        ToDate: new Date().toISOString().split("T")[0],
        Broker: { value: "", label: "ALL Brokers" },
        Ledger: { value: "", label: "All Ledger" },
        Item: { value: "", label: "All Item" },
        VilaiVasiZero: { value: "", label: "All" },
        refresh: false,
        filterDialog: false,
    });
    const [dataset, setDataset] = useState([]);
    const [dropdownOptionsListing, setDropdownOptionsListing] = useState({
        ledgers: [],
        items: [],
    });
    const [expandedBrokers, setExpandedBrokers] = useState({});
    const [saving, setSaving] = useState(false);
    const storage = JSON.parse(localStorage.getItem("user"));
    const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
    const [xlPreviewOpen, setXlPreViewOpen] = useState(false);
    const [pdfPreviewData, setPdfPreviewData] = useState(null);
    const [xlPreviewData, setXlPreviewData] = useState(null);

    const currentData = transactionType === "sales" ? salesData : purchaseData;
    const setCurrentData =
        transactionType === "sales" ? setSalesData : setPurchaseData;

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
                const endpoint =
                    transactionType === "sales"
                        ? "brokerageNakalReport/sales"
                        : "brokerageNakalReport/purchase";

                const res = await fetchLink({
                    address: `reports/${endpoint}?FromDate=${currentData.filters.FromDate}&ToDate=${currentData.filters.ToDate}&broker=${currentData.filters.Broker.value}`,
                });

                if (res.success) {
                    const data = toArray(res.data);
                    const initialBrokerage = {};
                    data.forEach((item) => {
                        const key = `${item.Do_Id}-${item.Product_Id}`;
                        initialBrokerage[key] = item.brokerage || "";
                    });

                    setCurrentData((prev) => ({
                        ...prev,
                        deliveryReport: data,
                        brokerageValues: initialBrokerage,
                    }));
                } else {
                    setCurrentData((prev) => ({
                        ...prev,
                        deliveryReport: [],
                        brokerageValues: {},
                    }));
                }
            } catch (err) {
                console.error(err);
                setCurrentData((prev) => ({
                    ...prev,
                    deliveryReport: [],
                    brokerageValues: {},
                }));
            } finally {
                loadingOff();
            }
        };
        fetchData();
    }, [transactionType, currentData.filters.refresh]);

    const tableConfigs = {
        sales: {
            dataEntryColumns: [
                {
                    label: "Date",
                    key: "Date",
                    align: "left",
                    render: (row) => row.Date?.split("T")[0] || "N/A",
                },
                { label: "Do No", key: "Do_No" },
                { label: "Product", key: "Product_Name" },
                { label: "Ledger_Name", key: "Retailer_Name" },
                { label: "Broker", key: "CostCenterGet" },
                { label: "Bill_Qty", key: "Bill_Qty", align: "right" },
                { label: "Qty", key: "displayQuantity", align: "right" },
                {
                    label: "Rate",
                    key: "Rate",
                    align: "right",
                    render: (row) => row.Rate || row.Item_Rate,
                },
                { label: "Pack", key: "Pack", align: "right" },
                { label: "Amount", key: "Amount", align: "right" },
                {
                    label: "Brok.Rate",
                    key: "Brokerage",
                    align: "right",
                    render: (row, idx, handleChange) => (
                        <TextField
                            size="small"
                            type="number"
                            value={row.Brokerage}
                            onChange={(e) => handleChange(idx, "Brokerage", e.target.value)}
                            sx={{ width: "80px" }}
                            inputProps={{ step: "0.01" }}
                        />
                    ),
                },
                {
                    label: "Brokerage",
                    key: "BrokerageAmount",
                    align: "right",
                    render: (row) => (row.Brokerage * row.displayQuantity).toFixed(2),
                },
                {
                    label: "Coolie.Rate",
                    key: "Coolie",
                    align: "right",
                    render: (row, idx, handleChange) => (
                        <TextField
                            size="small"
                            type="number"
                            value={row.Coolie}
                            onChange={(e) => handleChange(idx, "Coolie", e.target.value)}
                            sx={{ width: "80px" }}
                            inputProps={{ step: "0.01" }}
                        />
                    ),
                },
                {
                    label: "Coolie.Amt",
                    key: "CoolieAmount",
                    align: "right",
                    render: (row) => (row.Coolie * row.displayQuantity).toFixed(2),
                },
                {
                    label: "VilaiVasi",
                    key: "VilaiVasi",
                    align: "right",
                    render: (
                        row,
                        idx,
                        handleChange,
                        vilaivasiValue,
                        handleVilaiChange
                    ) => (
                        <TextField
                            size="small"
                            type="number"
                            value={vilaivasiValue}
                            onChange={handleVilaiChange(row.Do_Id, row.Product_Id)}
                            sx={{ width: "120px" }}
                            inputProps={{ step: "0.01" }}
                        />
                    ),
                },
                { label: "Narration", key: "Narration", align: "right" },
                {
                    label: "Vilai Amt",
                    key: "VilaiAmt",
                    align: "right",
                    render: (row, idx, _, vilaivasiValue, __, calcVilaiAmt) =>
                        (+calcVilaiAmt(vilaivasiValue, row.Bill_Qty)).toFixed(2),
                },
            ],
            listingColumns: [
                { label: "Broker", key: "Broker_Name" },
                { label: "Total KGS", key: "Total_KGS", align: "right" },
                { label: "Total Bill Qty", key: "Total_Qty", align: "right" },
                { label: "Total_Amount", key: "Total_Amount", align: "right" },
                { label: "Total_Broker_Exp", key: "Broker_Exp", align: "right" },
                { label: "Total_VilaiVasi", key: "VilaiVasi", align: "right" },
                { label: "Total_Bags", key: "Total_Bags", align: "right" },
            ],
        },
        purchase: {
            dataEntryColumns: [
                {
                    label: "Date",
                    key: "Date",
                    align: "left",
                    render: (row) => row.Po_Entry_Date?.split("T")[0] || "N/A",
                },
                { label: "Invoice No", key: "Invoice" },
                { label: "Retailer", key: "Retailer_Name" },
                { label: "Product", key: "Product_Name" },
                { label: "Bill_Qty", key: "Bill_Qty", align: "right" },
                { label: "Pack", key: "Pack", align: "right" },
                {
                    label: "Qty",
                    key: "displayQuantity",
                    align: "right",
                    render: (row) => Number(row.displayQuantity).toFixed(2),
                },
                { label: "Rate", key: "Item_Rate", align: "right" },
                { label: "Amount", key: "Total_Invoice_value", align: "right" },
                {
                    label: "Brokerage",
                    key: "Brokerage",
                    align: "right",
                    render: (
                        row,
                        idx,
                        handleChange,
                        vilaivasiValue,
                        handleVilaiChange
                    ) => (
                        <TextField
                            size="small"
                            type="number"
                            value={vilaivasiValue}
                            onChange={handleVilaiChange(row.Do_Id, row.Product_Id)}
                            sx={{ width: "120px" }}
                            inputProps={{ step: "0.01" }}
                        />
                    ),
                },
            ],
            listingColumns: [
                { label: "Supplier", key: "Supplier_Name" },
                { label: "Total KGS", key: "Total_KGS", align: "right" },
                { label: "Total Bill Qty", key: "Total_Qty", align: "right" },
                { label: "Total_Amount", key: "Total_Amount", align: "right" },
                { label: "Total_Broker_Exp", key: "Broker_Exp", align: "right" },
                { label: "Total_Bags", key: "Total_Bags", align: "right" },
            ],
        },
    };

    // useEffect(() => {
    //     const fetchDatasetAndDropdowns = async () => {
    //         try {
    //             loadingOn();
    //             let url = `reports/brokerageNagal/list?FromDate=${filtersListing.FromDate}&ToDate=${filtersListing.ToDate}`;
    //             if (filtersListing.Broker.value)
    //                 url += `&broker=${filtersListing.Broker.value}`;
    //             if (filtersListing.Ledger.value)
    //                 url += `&ledger=${filtersListing.Ledger.value}`;
    //             if (filtersListing.Item.value)
    //                 url += `&item=${filtersListing.Item.value}`;
    //             if (filtersListing.VilaiVasiZero.value)
    //                 url += `&vilaivasiFilter=${filtersListing.VilaiVasiZero.value}`;

    //             const res = await fetchLink({ address: url });
    //             if (res.success) {
    //                 const data = toArray(res.data);
    //                 setDataset(data);
    //                 const allItems = data.flatMap((item) => item.Items || []);
    //                 const uniqueLedgers = Array.from(
    //                     new Map(
    //                         allItems.map((item) => [
    //                             item.Ledger_Tally_Id,
    //                             { value: item.Ledger_Tally_Id, label: item.Ledger_Name },
    //                         ])
    //                     ).values()
    //                 );
    //                 const uniqueItems = Array.from(
    //                     new Map(
    //                         allItems.map((item) => [
    //                             item.Product_Id,
    //                             { value: item.Product_Id, label: item.Product_Name },
    //                         ])
    //                     ).values()
    //                 );
    //                 setDropdownOptionsListing({
    //                     ledgers: uniqueLedgers,
    //                     items: uniqueItems,
    //                 });
    //             }
    //         } catch (e) {
    //             console.error(e);
    //         } finally {
    //             loadingOff();
    //         }
    //     };
    //     fetchDatasetAndDropdowns();
    // }, [filtersListing.refresh]);

    // Event handlers

    useEffect(() => {
        const fetchDatasetAndDropdowns = async () => {
            try {
                loadingOn();

                let baseUrl = "";
                if (transactionType === "sales") {
                    baseUrl = `reports/brokerageNagal/list?FromDate=${filtersListing.FromDate}&ToDate=${filtersListing.ToDate}`;
                } else if (transactionType === "purchase") {
                    baseUrl = `reports/brokerageNagalDelivery/list?FromDate=${filtersListing.FromDate}&ToDate=${filtersListing.ToDate}`;
                }

                if (filtersListing.Broker.value)
                    baseUrl += `&broker=${filtersListing.Broker.value}`;
                if (filtersListing.Ledger.value)
                    baseUrl += `&ledger=${filtersListing.Ledger.value}`;
                if (filtersListing.Item.value)
                    baseUrl += `&item=${filtersListing.Item.value}`;
                if (filtersListing.VilaiVasiZero.value)
                    baseUrl += `&vilaivasiFilter=${filtersListing.VilaiVasiZero.value}`;

                const res = await fetchLink({ address: baseUrl });

                if (res.success) {
                    const data = toArray(res.data);
                    setDataset(data);

                    const allItems = data.flatMap((item) => item.Items || []);

                    const uniqueLedgers = Array.from(
                        new Map(
                            allItems.map((item) => [
                                item.Ledger_Tally_Id,
                                { value: item.Ledger_Tally_Id, label: item.Ledger_Name },
                            ])
                        ).values()
                    );

                    const uniqueItems = Array.from(
                        new Map(
                            allItems.map((item) => [
                                item.Product_Id,
                                { value: item.Product_Id, label: item.Product_Name },
                            ])
                        ).values()
                    );

                    setDropdownOptionsListing({
                        ledgers: uniqueLedgers,
                        items: uniqueItems,
                    });
                }
            } catch (e) {
                console.error(e);
            } finally {
                loadingOff();
            }
        };

        fetchDatasetAndDropdowns();
    }, [filtersListing.refresh, transactionType]);

    const handleTabChange = (event, newValue) => setActiveTab(newValue);
    const handleDataEntryPageChange = (event, newPage) =>
        setDataEntryPagination({ ...dataEntryPagination, page: newPage });
    const handleDataEntryRowsPerPageChange = (event) =>
        setDataEntryPagination({
            page: 0,
            rowsPerPage: parseInt(event.target.value, 10),
        });
    const handleListingPageChange = (event, newPage) =>
        setListingPagination({ ...listingPagination, page: newPage });
    const handleListingRowsPerPageChange = (event) =>
        setListingPagination({
            page: 0,
            rowsPerPage: parseInt(event.target.value, 10),
        });

    const handleBrokerageChange = (doId, productId) => (e) => {
        const value = e.target.value;
        const key = `${doId}-${productId}`;
        setCurrentData((prev) => ({
            ...prev,
            brokerageValues: { ...prev.brokerageValues, [key]: value },
        }));
    };

    const handleExpandBroker = (brokerName) =>
        setExpandedBrokers((prev) => ({
            ...prev,
            [brokerName]: !prev[brokerName],
        }));

    const closeDialogDataEntry = () =>
        setCurrentData((prev) => ({
            ...prev,
            filters: { ...prev.filters, filterDialog: false },
        }));

    const closeDialogListing = () =>
        setFiltersListing((prev) => ({ ...prev, filterDialog: false }));

    const handleSave = async () => {
        loadingOn();
        try {
            setSaving(true);

            const recordsToSave = currentData.deliveryReport.map((item) => {
                const brokerageValue =
                    currentData.brokerageValues[`${item.Do_Id}-${item.Product_Id}`] || 0;
                return {
                    ...item,
                    brokerage: parseFloat(brokerageValue) || 0,
                    Vilai_Vasi: parseFloat(brokerageValue) || 0,
                    Vilaivasi_Rate:
                        ((parseFloat(brokerageValue) || 0) / 100) *
                        (parseFloat(item.Bill_Qty) || 0),
                    Brok_Rate: item?.Brokerage || 0,
                    Brok_Amt: (item?.Brokerage || 0) * (item?.displayQuantity || 0),
                    Coolie_Rate: item?.Coolie || 0,
                    Coolie_Amt: (item?.Coolie || 0) * (item?.displayQuantity || 0),
                    Amount: item?.Amount || 0,
                    Created_By: storage?.UserId,
                    Transaction_Type: transactionType.toUpperCase(),
                };
            });

            const apiAddress =
                transactionType === "sales"
                    ? "reports/brokerageNagal/create"
                    : "reports/brokerageNakal/deliveryCreate";

            const response = await fetchLink({
                address: apiAddress,
                method: "POST",
                bodyData: recordsToSave,
                headers: { "Content-Type": "application/json" },
            });

            if (response.success) {
                toast.success(
                    `${transactionType === "sales" ? "Sales" : "Purchase"
                    } Nakal Created successfully!`
                );
                setCurrentData((prev) => ({
                    ...prev,
                    filters: { ...prev.filters, refresh: !prev.filters.refresh },
                }));
            } else {
                toast.error(response.message || "Save operation failed");
            }
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Save failed due to an error");
        } finally {
            setSaving(false);
            loadingOff();
        }
    };

    const handleFieldChange = (idx, fieldName, value) => {
        const updatedDeliveryReport = [...currentData.deliveryReport];
        updatedDeliveryReport[idx][fieldName] = parseFloat(value) || 0;
        setCurrentData((prev) => ({
            ...prev,
            deliveryReport: updatedDeliveryReport,
        }));
    };

    const handleTransactionTypeChange = (type) => {
        setTransactionType(type);
        setDataEntryPagination({ page: 0, rowsPerPage: 10 });
    };

    const handleHeaderVilaiVasiChange = (e) => {
        const value = e.target.value;
        setCurrentData((prev) => {
            const updatedBrokerageValues = { ...prev.brokerageValues };
            prev.deliveryReport.forEach((item) => {
                const key = `${item.Do_Id}-${item.Product_Id}`;
                updatedBrokerageValues[key] = value;
            });
            return {
                ...prev,
                headerVilaiVasi: value,
                brokerageValues: updatedBrokerageValues,
            };
        });
    };

    const handleClearAllVilaiVasi = () => {
        setCurrentData((prev) => {
            const updatedBrokerageValues = { ...prev.brokerageValues };
            prev.deliveryReport.forEach((item) => {
                const key = `${item.Do_Id}-${item.Product_Id}`;
                updatedBrokerageValues[key] = "";
            });
            return {
                ...prev,
                headerVilaiVasi: "",
                brokerageValues: updatedBrokerageValues,
            };
        });
    };

    // const handleBrokergeChangePurchase = (e) => {
    //     const value = e.target.value;
    //     setCurrentData(prev => {
    //         const updatedBrokerageValue = { ...prev.brokerageValues };
    //         prev.deliveryReport.forEach((item) => {
    //             const key = `${item.Do_Id}-${item.Product_Id}`;
    //             updatedBrokerageValue[key] = value;
    //         });
    //         return {
    //             ...prev,
    //             headerBrokerage: value,
    //             brokerageValues: updatedBrokerageValue
    //         };
    //     });
    // };

    //     const hanldeClearAllBrokerage = () => {
    //     setCurrentData(prev => {
    //         const updatedBrokerageValues = { ...prev.brokerageValues };
    //         prev.deliveryReport.forEach((item) => {
    //             const key = `${item.PIN_Id}-${item.Product_Id}`;
    //             updatedBrokerageValues[key] = "";
    //         });
    //         return {
    //             ...prev,
    //             headerBrokerage: "",
    //             brokerageValues: updatedBrokerageValues
    //         };
    //     });
    // };

    const totalBagsDataEntry = useMemo(
        () =>
            currentData.deliveryReport.reduce(
                (acc, item) => Addition(acc, item.displayQuantity || item.Qty || 0),
                0
            ),
        [currentData.deliveryReport]
    );

    const totalBagsListing = useMemo(
        () => dataset.reduce((acc, item) => Addition(acc, item.Total_Bags || 0), 0),
        [dataset]
    );

    const calculateVilaivasiAmt = (vilaivasi, billQty) =>
        ((parseFloat(vilaivasi) || 0) / 100) * (parseFloat(billQty) || 0);

    const groupedByBroker = useMemo(() => {
        if (!dataset || dataset.length === 0) return {};
        return dataset.reduce((acc, item) => {
            const broker = item.Broker_Name || item.Supplier_Name || "Unknown";
            if (!acc[broker]) acc[broker] = [];
            acc[broker].push(item);
            return acc;
        }, {});
    }, [dataset]);

    const brokerNames = useMemo(
        () => Object.keys(groupedByBroker),
        [groupedByBroker]
    );

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid
                    container
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                >
                    <Typography variant="h5" component="h2">
                        Brokerage Nagal Report
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box display="flex" gap={1}>
                            <Button
                                variant={transactionType === "sales" ? "contained" : "outlined"}
                                onClick={() => handleTransactionTypeChange("sales")}
                            >
                                Sales
                            </Button>
                            <Button
                                variant={
                                    transactionType === "purchase" ? "contained" : "outlined"
                                }
                                onClick={() => handleTransactionTypeChange("purchase")}
                            >
                                Purchase
                            </Button>
                        </Box>
                        <Button
                            variant="outlined"
                            startIcon={<FilterAlt />}
                            onClick={() => {
                                if (activeTab === 0) {
                                    setCurrentData((prev) => ({
                                        ...prev,
                                        filters: { ...prev.filters, filterDialog: true },
                                    }));
                                } else {
                                    setFiltersListing((prev) => ({
                                        ...prev,
                                        filterDialog: true,
                                    }));
                                }
                            }}
                        >
                            Filters
                        </Button>
                        <Typography component="span" variant="body1">
                            Total Bags:{" "}
                            <strong>
                                {activeTab === 0 ? totalBagsDataEntry : totalBagsListing}
                            </strong>
                        </Typography>
                    </Box>
                </Grid>

                <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label="Data Entry" />
                    <Tab label="Listing" />
                </Tabs>

                {activeTab === 0 && (
                    <>
                        <Box
                            mb={1}
                            sx={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <Typography sx={{ fontWeight: "bold" }}>
                                {transactionType === "sales"
                                    ? "VilaiVasi (All):"
                                    : "Brokerage (All):"}
                            </Typography>
                            <TextField
                                type="number"
                                size="small"
                                value={currentData.headerVilaiVasi}
                                inputProps={{ step: "1" }}
                                onChange={handleHeaderVilaiVasiChange}
                                placeholder={`Set ${transactionType === "sales" ? "VilaiVasi" : "Brokerage"
                                    } for all`}
                                sx={{
                                    "& .MuiInputBase-input": {
                                        height: 40,
                                        boxSizing: "border-box",
                                    },
                                }}
                            />
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={handleClearAllVilaiVasi}
                            >
                                Clear All
                            </Button>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "primary.main" }}>
                                        {tableConfigs[transactionType].dataEntryColumns.map(
                                            (column) => (
                                                <TableCell
                                                    key={column.key}
                                                    sx={{ color: "white", fontWeight: "bold" }}
                                                    align={column.align || "left"}
                                                >
                                                    {column.label}
                                                </TableCell>
                                            )
                                        )}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {currentData.deliveryReport.length > 0 ? (
                                        currentData.deliveryReport
                                            .slice(
                                                dataEntryPagination.page *
                                                dataEntryPagination.rowsPerPage,
                                                dataEntryPagination.page *
                                                dataEntryPagination.rowsPerPage +
                                                dataEntryPagination.rowsPerPage
                                            )
                                            .map((row, idx) => {
                                                const vilaivasiValue =
                                                    currentData.brokerageValues[
                                                    `${row.Do_Id}-${row.Product_Id}`
                                                    ] || "";
                                                // const vilaivasiAmt = calculateVilaivasiAmt(
                                                //   vilaivasiValue,
                                                //   row.Bill_Qty
                                                // );
                                                return (
                                                    <TableRow key={idx} hover>
                                                        {tableConfigs[transactionType].dataEntryColumns.map(
                                                            (column) => (
                                                                <TableCell
                                                                    key={column.key}
                                                                    align={column.align || "left"}
                                                                >
                                                                    {column.render
                                                                        ? column.render(
                                                                            row,
                                                                            idx,
                                                                            handleFieldChange,
                                                                            vilaivasiValue,
                                                                            handleBrokerageChange,
                                                                            calculateVilaivasiAmt
                                                                        )
                                                                        : row[column.key]}
                                                                </TableCell>
                                                            )
                                                        )}
                                                    </TableRow>
                                                );
                                            })
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={
                                                    tableConfigs[transactionType].dataEntryColumns.length
                                                }
                                                align="center"
                                            >
                                                No data found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                component="div"
                                count={currentData.deliveryReport.length}
                                rowsPerPage={dataEntryPagination.rowsPerPage}
                                page={dataEntryPagination.page}
                                onPageChange={handleDataEntryPageChange}
                                onRowsPerPageChange={handleDataEntryRowsPerPageChange}
                            />
                        </TableContainer>

                        <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Save />}
                                onClick={handleSave}
                                disabled={saving}
                                size="large"
                            >
                                {saving
                                    ? "Saving..."
                                    : `Save ${transactionType === "sales" ? "Sales" : "Purchase"
                                    } Brokerage`}
                            </Button>
                        </Box>
                    </>
                )}

                {activeTab === 1 && (
                    <>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "primary.main" }}>
                                        {tableConfigs[transactionType].listingColumns.map(
                                            (column) => (
                                                <TableCell
                                                    key={column.key}
                                                    sx={{ color: "white", fontWeight: "bold" }}
                                                    align={column.align || "left"}
                                                >
                                                    {column.label}
                                                </TableCell>
                                            )
                                        )}
                                        <TableCell
                                            sx={{ color: "white", fontWeight: "bold" }}
                                            align="right"
                                        >
                                            Actions
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {brokerNames.length > 0 ? (
                                        brokerNames
                                            .slice(
                                                listingPagination.page * listingPagination.rowsPerPage,
                                                listingPagination.page * listingPagination.rowsPerPage +
                                                listingPagination.rowsPerPage
                                            )
                                            .map((brokerName, idx) => {
                                                const brokerData = groupedByBroker[brokerName][0];
                                                return (
                                                    <React.Fragment key={idx}>
                                                        <TableRow hover>
                                                            <TableCell>
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleExpandBroker(brokerName)}
                                                                >
                                                                    {expandedBrokers[brokerName] ? (
                                                                        <KeyboardArrowUp />
                                                                    ) : (
                                                                        <KeyboardArrowDown />
                                                                    )}
                                                                </IconButton>
                                                                {brokerName}
                                                            </TableCell>
                                                            {tableConfigs[transactionType].listingColumns
                                                                .slice(1)
                                                                .map((column) => (
                                                                    <TableCell
                                                                        key={column.key}
                                                                        align={column.align || "left"}
                                                                    >
                                                                        {brokerData[column.key] || "0.00"}
                                                                    </TableCell>
                                                                ))}
                                                            <TableCell align="right">
                                                                <Tooltip title="Preview PDF">
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={() => {
                                                                            setPdfPreviewData(brokerData);
                                                                            setPdfPreviewOpen(true);
                                                                        }}
                                                                    >
                                                                        <PictureAsPdfIcon />
                                                                    </IconButton>
                                                                </Tooltip>

                                                                <Tooltip title="Preview Excel">
                                                                    <IconButton
                                                                        color="primary"
                                                                        onClick={() => {
                                                                            setXlPreviewData(brokerData);
                                                                            setXlPreViewOpen(true);
                                                                        }}
                                                                    >
                                                                        <FileDownloadIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell
                                                                style={{ padding: 0 }}
                                                                colSpan={
                                                                    tableConfigs[transactionType].listingColumns
                                                                        .length + 1
                                                                }
                                                            >
                                                                <Collapse
                                                                    in={expandedBrokers[brokerName]}
                                                                    timeout="auto"
                                                                    unmountOnExit
                                                                >
                                                                    <Box margin={1}>
                                                                        <Typography
                                                                            variant="h6"
                                                                            gutterBottom
                                                                            component="div"
                                                                        >
                                                                            Details for {brokerName}
                                                                        </Typography>
                                                                        <Table size="small">
                                                                            <TableHead>
                                                                                <TableRow>
                                                                                    <TableCell>Date</TableCell>
                                                                                    <TableCell>Do_Inv_No </TableCell>
                                                                                    <TableCell>
                                                                                        {transactionType === "sales"
                                                                                            ? "Retailer"
                                                                                            : "Supplier"}
                                                                                    </TableCell>

                                                                                    <TableCell>Product</TableCell>
                                                                                    <TableCell>Short Name</TableCell>
                                                                                    <TableCell align="right">
                                                                                        QTY
                                                                                    </TableCell>
                                                                                    <TableCell align="right">
                                                                                        KGS
                                                                                    </TableCell>
                                                                                    <TableCell align="right">
                                                                                        Amount
                                                                                    </TableCell>
                                                                                    <TableCell align="right">
                                                                                        Bill_Qty
                                                                                    </TableCell>
                                                                                    <TableCell align="right">
                                                                                        Brokerage
                                                                                    </TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {groupedByBroker[brokerName].flatMap(
                                                                                    (broker) =>
                                                                                        broker.Items?.map(
                                                                                            (item, itemIdx) => (
                                                                                                <TableRow key={itemIdx}>
                                                                                                    <TableCell>
                                                                                                        {item.Date}
                                                                                                    </TableCell>
                                                                                                    {transactionType ===
                                                                                                        "sales" ? (
                                                                                                        <td>{item.Do_Inv_No}</td>
                                                                                                    ) : (
                                                                                                        <td>{item.Do_Inv_No}</td>
                                                                                                    )}

                                                                                                    <TableCell>
                                                                                                        {item.Retailer_Name ||
                                                                                                            item.Supplier_Name}
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                        {item.Product_Name}
                                                                                                    </TableCell>
                                                                                                    <TableCell>
                                                                                                        {item.Short_Name}
                                                                                                    </TableCell>
                                                                                                    <TableCell align="right">
                                                                                                        {item.QTY}
                                                                                                    </TableCell>

                                                                                                    <TableCell align="right">
                                                                                                        {item.KGS}
                                                                                                    </TableCell>
                                                                                                    {transactionType ===
                                                                                                        "sales" ? (
                                                                                                        <TableCell align="right">
                                                                                                            {item.Amount}
                                                                                                        </TableCell>
                                                                                                    ) : (
                                                                                                        <TableCell align="right">
                                                                                                            {item.Total_Invoice_value}
                                                                                                        </TableCell>
                                                                                                    )}
                                                                                                    {transactionType ===
                                                                                                        "sales" ? (
                                                                                                        <TableCell align="right">
                                                                                                            {item.QTY}
                                                                                                        </TableCell>
                                                                                                    ) : (
                                                                                                        <TableCell align="right">
                                                                                                            {item.Bill_Qty}
                                                                                                        </TableCell>
                                                                                                    )}

                                                                                                    {transactionType ===
                                                                                                        "sales" ? (
                                                                                                        <TableCell align="right">
                                                                                                            {item.Brok_Amt}
                                                                                                        </TableCell>
                                                                                                    ) : (
                                                                                                        <TableCell align="right">
                                                                                                            {item.Brokerage}
                                                                                                        </TableCell>
                                                                                                    )}
                                                                                                </TableRow>
                                                                                            )
                                                                                        ) || []
                                                                                )}
                                                                            </TableBody>
                                                                        </Table>
                                                                    </Box>
                                                                </Collapse>
                                                            </TableCell>
                                                        </TableRow>
                                                    </React.Fragment>
                                                );
                                            })
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={
                                                    tableConfigs[transactionType].listingColumns.length +
                                                    1
                                                }
                                                align="center"
                                            >
                                                No data found
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                component="div"
                                count={brokerNames.length}
                                rowsPerPage={listingPagination.rowsPerPage}
                                page={listingPagination.page}
                                onPageChange={handleListingPageChange}
                                onRowsPerPageChange={handleListingRowsPerPageChange}
                            />
                        </TableContainer>
                    </>
                )}

                <PdfPreviewModal
                    open={pdfPreviewOpen}
                    onClose={() => setPdfPreviewOpen(false)}
                    brokerData={pdfPreviewData}
                    transactionType={transactionType}
                    fromDate={filtersListing.FromDate}
                    toDate={filtersListing.ToDate}
                />
                <XlPreviewModal
                    open={xlPreviewOpen}
                    onClose={() => setXlPreViewOpen(false)}
                    brokerData={xlPreviewData}
                    transactionType={transactionType}
                    fromDate={filtersListing.FromDate}
                    toDate={filtersListing.ToDate}
                />
            </Paper>

            <Dialog
                open={currentData.filters.filterDialog && activeTab === 0}
                onClose={closeDialogDataEntry}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                    >
                        <Typography variant="h6">
                            {transactionType === "sales" ? "Sales" : "Purchase"} Data Entry
                            Filters
                        </Typography>
                        <IconButton onClick={closeDialogDataEntry}>
                            <FilterAltOff />
                        </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="date"
                                label="From Date"
                                value={currentData.filters.FromDate}
                                onChange={(e) =>
                                    setCurrentData((prev) => ({
                                        ...prev,
                                        filters: { ...prev.filters, FromDate: e.target.value },
                                    }))
                                }
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="date"
                                label="To Date"
                                value={currentData.filters.ToDate}
                                onChange={(e) =>
                                    setCurrentData((prev) => ({
                                        ...prev,
                                        filters: { ...prev.filters, ToDate: e.target.value },
                                    }))
                                }
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Select
                                fullWidth
                                label="Brokers"
                                value={currentData.filters.Broker}
                                onChange={(selected) =>
                                    setCurrentData((prev) => ({
                                        ...prev,
                                        filters: { ...prev.filters, Broker: selected },
                                    }))
                                }
                                options={[
                                    { value: "", label: "ALL Brokers" },
                                    ...dropDown.broker,
                                ]}
                                styles={customSelectStyles}
                                menuPortalTarget={document.body}
                                isSearchable={true}
                                placeholder="Select Broker"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialogDataEntry}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setCurrentData((prev) => ({
                                ...prev,
                                headerVilaiVasi: "",
                                brokerageValues: {},
                                filters: {
                                    ...prev.filters,
                                    refresh: !prev.filters.refresh,
                                    filterDialog: false,
                                },
                            }));
                        }}
                    >
                        Apply Filters
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Listing Filter Dialog */}
            <Dialog
                open={filtersListing.filterDialog && activeTab === 1}
                onClose={closeDialogListing}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                    >
                        <Typography variant="h6">Listing Filters</Typography>
                        <IconButton onClick={closeDialogListing}>
                            <FilterAltOff />
                        </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={5}>
                            <TextField
                                fullWidth
                                type="date"
                                label="From Date"
                                value={filtersListing.FromDate}
                                onChange={(e) =>
                                    setFiltersListing((prev) => ({
                                        ...prev,
                                        FromDate: e.target.value,
                                    }))
                                }
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <TextField
                                fullWidth
                                type="date"
                                label="To Date"
                                value={filtersListing.ToDate}
                                onChange={(e) =>
                                    setFiltersListing((prev) => ({
                                        ...prev,
                                        ToDate: e.target.value,
                                    }))
                                }
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid
                            item
                            xs={2}
                            style={{ display: "flex", alignItems: "flex-end" }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    setFiltersListing((prev) => ({
                                        ...prev,
                                        refresh: !prev.refresh,
                                    }));
                                }}
                                style={{ height: "30px", width: "100%" }}
                            >
                                Search
                            </Button>
                        </Grid>
                        {
                            transactionType === 'sales' ? (
                                <>
                                    <Grid item xs={12}>
                                        <Select
                                            fullWidth
                                            value={filtersListing.VilaiVasiZero}
                                            onChange={(selected) =>
                                                setFiltersListing((prev) => ({
                                                    ...prev,
                                                    VilaiVasiZero: selected,
                                                }))
                                            }
                                            options={[
                                                { value: "", label: "All" },
                                                { value: "zero", label: "VilaiVasi Zero" },
                                                { value: "nonzero", label: "VilaiVasi Non-Zero" },
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            placeholder="VilaiVasi Zero/Non-Zero"
                                        />
                                    </Grid>

                                </>
                            ) : (
                                <>

                                </>
                            )}

                        <Grid item xs={12}>
                            <Select
                                fullWidth
                                label="Brokers"
                                value={filtersListing.Broker}
                                onChange={(selected) =>
                                    setFiltersListing((prev) => ({ ...prev, Broker: selected }))
                                }
                                options={[
                                    { value: "", label: "ALL Brokers" },
                                    ...dropDown.broker,
                                ]}
                                styles={customSelectStyles}
                                menuPortalTarget={document.body}
                                isSearchable
                                placeholder="Select Broker"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Select
                                fullWidth
                                label="Ledger"
                                value={filtersListing.Ledger}
                                onChange={(selected) =>
                                    setFiltersListing((prev) => ({ ...prev, Ledger: selected }))
                                }
                                options={[
                                    { value: "", label: "ALL Ledger" },
                                    ...dropdownOptionsListing.ledgers,
                                ]}
                                styles={customSelectStyles}
                                menuPortalTarget={document.body}
                                isSearchable
                                placeholder="Select Ledger"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Select
                                fullWidth
                                label="Item"
                                value={filtersListing.Item}
                                onChange={(selected) =>
                                    setFiltersListing((prev) => ({ ...prev, Item: selected }))
                                }
                                options={[
                                    { value: "", label: "ALL Item" },
                                    ...dropdownOptionsListing.items,
                                ]}
                                styles={customSelectStyles}
                                menuPortalTarget={document.body}
                                isSearchable
                                placeholder="Select Item"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialogListing}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            setFiltersListing((prev) => ({
                                ...prev,
                                refresh: !prev.refresh,
                                filterDialog: false,
                            }));
                        }}
                    >
                        Apply Filters
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NakalReports;