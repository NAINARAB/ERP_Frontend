import React, { useEffect, useState, useMemo } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { toArray, Addition } from "../../../Components/functions";
import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    DialogContentText,
    DialogContent,
    DialogTitle,
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
    Cancel,
    Edit,
} from "@mui/icons-material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from "react-toastify";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PdfPreviewModal from "./PdfPreviewModal";
import XlPreviewModal from "./XlPreviewModal";
import { Delete } from "@mui/icons-material";

const NakalReports = ({ loadingOn, loadingOff }) => {
    const [transactionType, setTransactionType] = useState("salesNagal");
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
    const [salesNewData, setSalesNewData] = useState({
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
    const [editingItem, setEditingItem] = useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteItemDialogOpen, setDeleteItemDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [brokerToDelete, setBrokerToDelete] = useState(null);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);

    const currentData =
        transactionType === "salesNagal" ? salesData :
            transactionType === "sales" ? salesNewData :
                purchaseData;

    const setCurrentData =
        transactionType === "salesNagal" ? setSalesData :
            transactionType === "sales" ? setSalesNewData :
                setPurchaseData;

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
                    transactionType === "salesNagal"
                        ? "brokerageNakalReport/sales"
                        : transactionType === "sales" ? "brokerageNakalReport/salesEntry" : "brokerageNakalReport/purchase";

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
        salesNagal: {
            dataEntryColumns: [
                {
                    label: "Date",
                    key: "Date",
                    align: "left",
                    render: (row) => row.Date?.split("T")[0] || "N/A",
                },
                { label: "Do No", key: "Do_Inv_No" },
                { label: "Product", key: "Product_Name" },
                { label: "Ledger_Name", key: "Retailer_Name" },
                { label: "Broker", key: "CostCenterGet" },
                { label: "Act_Qty", key: "Act_Qty", align: "right" },
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
                        (+calcVilaiAmt(vilaivasiValue, row.Act_Qty)).toFixed(2),
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
        sales: {
            dataEntryColumns: [
                {
                    label: "Date",
                    key: "Date",
                    align: "left",
                    render: (row) => row.Date?.split("T")[0] || "N/A",
                },
                { label: "Do No", key: "Do_Inv_No" },
                { label: "Product", key: "Product_Name" },
                { label: "Ledger_Name", key: "Retailer_Name" },
                { label: "Broker", key: "CostCenterGet" },
                { label: "Act_Qty", key: "Act_Qty", align: "right" },
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
                    label: "Brokerage",
                    key: "Brokerage",
                    align: "right",
                    render: (row, idx, handleChange, brokerageValue, handleBrokerageChange) => (
                        <TextField
                            size="small"
                            type="number"
                            value={brokerageValue}
                            onChange={handleBrokerageChange(row.Do_Id, row.Product_Id)}
                            sx={{ width: "120px" }}
                            inputProps={{ step: "0.01" }}
                        />
                    ),
                },
                {
                    label: "Brokerage Amt",
                    key: "BrokerageAmount",
                    align: "right",
                    render: (row, idx, _, brokerageValue) =>
                        ((parseFloat(brokerageValue) || 0) * (parseFloat(row.Act_Qty) || 0) / 100).toFixed(2),
                }
            ],
            listingColumns: [
                { label: "Broker", key: "Broker_Name" },
                { label: "Total KGS", key: "Total_KGS", align: "right" },
                { label: "Total Bill Qty", key: "Total_Qty", align: "right" },
                { label: "Total_Amount", key: "Total_Amount", align: "right" },
                { label: "Total_Broker_Exp", key: "Broker_Exp", align: "right" },
                { label: "Total_Bags", key: "Total_Bags", align: "right" },
            ]
        },
        purchase: {
            dataEntryColumns: [
                {
                    label: "Date",
                    key: "Date",
                    align: "left",
                    render: (row) => row.Po_Entry_Date?.split("T")[0] || "N/A",
                },
                { label: "Invoice No", key: "Po_Inv_No" },
                { label: "Retailer", key: "Retailer_Name" },
                { label: "Broker", key: "CostCenterGet", align: "right" },
                { label: "Product", key: "Product_Name" },
                { label: "Act_Qty", key: "Act_Qty", align: "right" },
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
                            onChange={handleVilaiChange(row.Do_Id, row.Product_Id, row.PIN_Id)}
                            sx={{ width: "120px" }}
                            inputProps={{ step: "0.01" }}
                        />
                    ),
                },
                {
                    label: "Brokerage Amt",
                    key: "BrokerageAmount",
                    align: "right",
                    render: (row, idx, _, brokerageValue) =>
                        ((parseFloat(brokerageValue) || 0) * (parseFloat(row.Act_Qty) || 0) / 100).toFixed(2),
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

    useEffect(() => {
        const fetchDatasetAndDropdowns = async () => {
            try {
                loadingOn();

                let baseUrl = "";
                if (transactionType === "salesNagal") {
                    baseUrl = `reports/brokerageNagal/list?FromDate=${filtersListing.FromDate}&ToDate=${filtersListing.ToDate}`;
                } else if (transactionType === "purchase") {
                    baseUrl = `reports/brokerageNagalDelivery/list?FromDate=${filtersListing.FromDate}&ToDate=${filtersListing.ToDate}`;
                }
                else if (transactionType === "sales") {
                    baseUrl = `reports//brokerageNagalSales/list?FromDate=${filtersListing.FromDate}&ToDate=${filtersListing.ToDate}`;
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

    const handleDelete = async () => {
        try {
            loadingOn();

            const response = await fetchLink({
                address: `reports/brokerageNagalPurchase/list`,
                method: "DELETE",
                bodyData: {
                    TransactionType: transactionType,
                    Broker: brokerToDelete.Broker_Id || brokerToDelete.Supplier_Id,
                    FromDate: filtersListing.FromDate,
                    ToDate: filtersListing.ToDate
                },
                headers: { "Content-Type": "application/json" }
            });

            if (response.success) {
                toast.success(response.message || "Deleted successfully!");
                setFiltersListing(prev => ({ ...prev, refresh: !prev.refresh }));
            }
        } catch (error) {
            toast.error("Delete failed due to an error");
        } finally {
            loadingOff();
            setDeleteDialogOpen(false);
        }
    };

    const handleDeleteItem = async () => {
        try {
            loadingOn();

            const response = await fetchLink({
                address: `reports/brokerageNagalPurchase/list`,
                method: "DELETE",
                bodyData: {
                    Id: itemToDelete.Id,
                    Do_Id: itemToDelete.Do_Id,
                    Product_Id: itemToDelete.Product_Id,
                    PIN_Id: itemToDelete.PIN_Id,
                    FromDate: filtersListing.FromDate,
                    ToDate: filtersListing.ToDate,
                    TransactionType: transactionType
                },
                headers: { "Content-Type": "application/json" }
            });

            if (response.success) {
                toast.success(response.message || "Item deleted successfully!");
                setFiltersListing(prev => ({ ...prev, refresh: !prev.refresh }));
            }
        } catch (error) {

            toast.error("Item delete failed due to an error");
        } finally {
            loadingOff();
            setDeleteItemDialogOpen(false);
        }
    };

    const handleBulkDelete = async () => {
        try {
            loadingOn();
            const response = await fetchLink({
                address: `reports/brokerageNagalPurchase/list`,
                method: 'DELETE',
                bodyData: {
                    FromDate: filtersListing.FromDate,
                    ToDate: filtersListing.ToDate,
                    Broker: filtersListing.Broker.value,
                    Ledger: filtersListing.Ledger.value,
                    Item: filtersListing.Item.value,
                    TransactionType: transactionType
                },
            });

            if (response.success) {
                toast.success(response.message || "All records deleted successfully!");
                setFiltersListing(prev => ({ ...prev, refresh: !prev.refresh }));
            }
        } catch (error) {
            toast.error("Bulk delete failed due to an error");
        } finally {
            loadingOff();
            setBulkDeleteDialogOpen(false);
        }
    };

    const handleEditItem = (item) => {
        const commonFields = {
            ...item,
            Created_By: storage?.UserId,
            Updated_By: storage?.UserId
        };

        if (transactionType === "salesNagal") {
            setEditingItem({
                ...item,
                Brok_Rate: item.Brok_Rate ?? item.Brokerage_Rate ?? item.Brokerage ?? "",
                Brok_Amt: item.Brok_Amt ?? ((item.Brok_Rate ?? 0) * (item.QTY ?? 0)).toFixed(2),
                Coolie_Rate: item.Coolie_Rate ?? item.Coolie ?? "",
                Coolie_Amt: item.Coolie_Amt ?? ((item.Coolie_Rate ?? 0) * (item.QTY ?? 0)).toFixed(2),
                Vilai_Vasi: item.Vilai_Vasi ?? "",
                Vilaivasi_Rate: item.Vilaivasi_Rate ?? ((item.Vilai_Vasi ?? 0) * (item.Act_Qty ?? 0) / 100).toFixed(2),
                Id: item.Id
            });
        } else if (transactionType === "sales" || transactionType === "purchase") {
            setEditingItem(item);

        }
    };

    const handleSaveEdit = async () => {
        try {
            loadingOn();
            const payload = {
                ...editingItem,
                TransactionType: transactionType,
                Updated_By: storage?.UserId
            };
            console.log("w", editingItem)

            if (transactionType === "salesNagal") {
                payload.Brok_Amt = (parseFloat(editingItem.Brok_Rate) || 0) * (parseFloat(editingItem.QTY) || 0);
                payload.Coolie_Amt = (parseFloat(editingItem.Coolie_Rate) || 0) * (parseFloat(editingItem.QTY) || 0);
                payload.Vilai_Vasi = parseFloat(editingItem.Vilai_Vasi) || 0;
                payload.Vilaivasi_Rate = ((parseFloat(editingItem.Vilai_Vasi) || 0) * (parseFloat(editingItem.QTY) || 0) / 100);

            }
            else if (transactionType === "sales" || transactionType === "purchase") {
                payload.Brokerage_Amt = ((parseFloat(editingItem.Brokerage) || 0) * (parseFloat(editingItem.Act_Qty) || 0) / 100);
                payload.Brokerage = ((parseFloat(editingItem?.Act_Qty) / 100) * editingItem.Brokerage_Amt)

            }

            const response = await fetchLink({
                address: `reports/brokerageNagalPurchase/list`,
                method: "PUT",
                bodyData: payload,
                headers: { "Content-Type": "application/json" }
            });

            if (response.success) {
                toast.success("Item updated successfully!");
                setFiltersListing(prev => ({ ...prev, refresh: !prev.refresh }));
                setEditingItem(null);
            } else {
                toast.error(response.message || "Update failed");
            }
        } catch (error) {
            toast.error("Update failed due to an error");
        } finally {
            loadingOff();
        }
    };

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

    const handleBrokerageChange = (doId, productId, pinId) => (e) => {
        const value = e.target.value;
        const key = transactionType === "salesNagal" || transactionType === "sales"
            ? `${doId}-${productId}`
            : `${pinId}-${productId}`;
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
                const key = transactionType === "salesNagal" || transactionType === "sales"
                    ? `${item.Do_Id}-${item.Product_Id}`
                    : `${item.PIN_Id}-${item.Product_Id}`;

                const brokerageValue = currentData.brokerageValues[key] || item.Brokerage || 0;

                if (transactionType === "salesNagal") {
                    return {
                        ...item,
                        brokerage: parseFloat(brokerageValue) || 0,
                        Vilai_Vasi: parseFloat(brokerageValue) || 0,
                        Vilaivasi_Rate: ((parseFloat(brokerageValue) || 0) / 100) * (parseFloat(item.Act_Qty) || 0),
                        Brok_Rate: item?.Brokerage || 0,
                        Brok_Amt: (item?.Brokerage || 0) * (item?.displayQuantity || 0),
                        Coolie_Rate: item?.Coolie || 0,
                        Coolie_Amt: (item?.Coolie || 0) * (item?.displayQuantity || 0),
                        Amount: item?.Amount || 0,
                        Created_By: storage?.UserId,
                    };
                } else if (transactionType === "sales") {
                    return {
                        ...item,
                        brokerage: (parseFloat(brokerageValue) || 0) *
                            (parseFloat(item.Act_Qty) || 0) / 100,
                        Created_By: storage?.UserId,
                    };
                } else {
                    return {
                        ...item,
                        brokerage: (parseFloat(brokerageValue) || 0) *
                            (parseFloat(item.Act_Qty) || 0) / 100,
                        Created_By: storage?.UserId,
                    };
                }
            });

            let apiAddress;
            if (transactionType === "salesNagal") {
                apiAddress = "reports/brokerageNagal/create";
            } else if (transactionType === "sales") {
                apiAddress = "reports/brokerageNagal/createSales";
            } else {
                apiAddress = "reports/brokerageNakal/deliveryCreate";
            }

            const response = await fetchLink({
                address: apiAddress,
                method: "POST",
                bodyData: recordsToSave,
                headers: { "Content-Type": "application/json" },
            });

            if (response.success) {
                let successMessage;
                if (transactionType === "salesNagal") {
                    successMessage = "Sales Nagal created successfully!";
                } else if (transactionType === "sales") {
                    successMessage = "Sales brokerage created successfully!";
                } else {
                    successMessage = "Purchase nakal created successfully!";
                }
                toast.success(successMessage);
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
                const key = transactionType === "salesNagal" || transactionType === "sales"
                    ? `${item.Do_Id}-${item.Product_Id}`
                    : `${item.PIN_Id}-${item.Product_Id}`;
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
                const key = transactionType === "salesNagal"
                    ? `${item.Do_Id}-${item.Product_Id}`
                    : transactionType === "sales" ? `${item.Do_Id}-${item.Product_Id}` : `${item.PIN_Id}-${item.Product_Id}`;
                updatedBrokerageValues[key] = "";
            });
            return {
                ...prev,
                headerVilaiVasi: "",
                brokerageValues: updatedBrokerageValues,
            };
        });
    };

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

    const isEditingRow = (editingItem, item) => {
        if (!editingItem) return false;
        return (
            editingItem.Product_Id === item.Product_Id &&
            editingItem.Do_Inv_No === item.Do_Inv_No &&
            (editingItem.Ledger_Tally_Id
                ? editingItem.Ledger_Tally_Id === item.Ledger_Tally_Id
                : editingItem.Ledger_Name === item.Ledger_Name)
        );
    };

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" component="h2">
                        Brokerage Nagal Report
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                        <Box display="flex" gap={1}>
                            <Button
                                variant={transactionType === "salesNagal" ? "contained" : "outlined"}
                                onClick={() => handleTransactionTypeChange("salesNagal")}
                            >
                                SalesNagal
                            </Button>
                            <Button
                                variant={transactionType === "purchase" ? "contained" : "outlined"}
                                onClick={() => handleTransactionTypeChange("purchase")}
                            >
                                Purchase
                            </Button>
                            <Button
                                variant={transactionType === "sales" ? "contained" : "outlined"}
                                onClick={() => handleTransactionTypeChange("sales")}
                            >
                                Sales
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
                                {transactionType === "salesNagal"
                                    ? "VilaiVasi (All):"
                                    : "Brokerage (All):"}
                            </Typography>
                            <TextField
                                type="number"
                                size="small"
                                value={currentData.headerVilaiVasi}
                                inputProps={{ step: "1" }}
                                onChange={handleHeaderVilaiVasiChange}
                                placeholder={`Set ${transactionType === "salesNagal" ? "VilaiVasi" : "Brokerage"
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
                                                    transactionType === "salesNagal"
                                                        ? `${row.Do_Id}-${row.Product_Id}`
                                                        :
                                                        transactionType === "sales" ? `${row.Do_Id}-${row.Product_Id}` :
                                                            `${row.PIN_Id}-${row.Product_Id}`
                                                    ] || "";
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
                                    : `Save ${transactionType === "salesNagal" ? transactionType === "sales" ? "Sales" : "Purchase" : "Sales Nagal"
                                    } Brokerage`}
                            </Button>
                        </Box>
                    </>
                )}

                {activeTab === 1 && (
                    <>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<Delete />}
                                onClick={() => setBulkDeleteDialogOpen(true)}
                                disabled={dataset.length === 0}
                            >
                                Delete All
                            </Button>
                        </Box>
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
                                                                <Box display="flex" gap={1} justifyContent="flex-end">
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

                                                                    <Tooltip title="Delete">
                                                                        <IconButton
                                                                            color="error"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setBrokerToDelete(brokerData);
                                                                                setDeleteDialogOpen(true);
                                                                            }}
                                                                        >
                                                                            <Delete />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
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
                                                                                    <TableCell>Do/Inv No</TableCell>
                                                                                    <TableCell>
                                                                                        {transactionType === "salesNagal" || transactionType === "sales"
                                                                                            ? "Retailer"
                                                                                            : "Supplier"}
                                                                                    </TableCell>
                                                                                    <TableCell>Product</TableCell>
                                                                                    <TableCell>Short Name</TableCell>
                                                                                    <TableCell align="right">QTY</TableCell>
                                                                                    <TableCell align="right">KGS</TableCell>
                                                                                    <TableCell align="right">Amount</TableCell>
                                                                                    <TableCell align="right">Act Qty</TableCell>
                                                                                    <TableCell align="right">
                                                                                        {transactionType === "salesNagal" ? "Broker Amt" : "Brok.Amt"}
                                                                                    </TableCell>
                                                                                    {transactionType === "salesNagal" && (
                                                                                        <>
                                                                                            <TableCell align="right">Brok.Rate</TableCell>
                                                                                            <TableCell align="right">Coolie.Amt</TableCell>
                                                                                            <TableCell align="right">Coolie.Rate</TableCell>
                                                                                            <TableCell align="right">Vilai_Vasi</TableCell>
                                                                                            <TableCell align="right">Vilaiva.Rat</TableCell>
                                                                                        </>
                                                                                    )}

                                                                                    {
                                                                                        editingItem && (transactionType === "sales" || transactionType === "purchase") && (
                                                                                            <TableCell align="right">Brokerage</TableCell>
                                                                                        )
                                                                                    }

                                                                                    <TableCell align="right">Actions</TableCell>
                                                                                </TableRow>
                                                                            </TableHead>
                                                                            <TableBody>
                                                                                {groupedByBroker[brokerName].flatMap((broker) =>
                                                                                    broker.Items?.map((item, itemIdx) => (
                                                                                        <TableRow key={itemIdx}>
                                                                                            {/* Common fields for all transaction types */}
                                                                                            <TableCell>{item.Date}</TableCell>
                                                                                            <TableCell>{item.Do_Inv_No || item.Po_Inv_No}</TableCell>
                                                                                            <TableCell>{item.Retailer_Name || item.Supplier_Name}</TableCell>
                                                                                            <TableCell>{item.Product_Name}</TableCell>
                                                                                            <TableCell>{item.Short_Name}</TableCell>
                                                                                            <TableCell align="right">{item.QTY}</TableCell>
                                                                                            <TableCell align="right">{item.KGS}</TableCell>
                                                                                            <TableCell align="right">
                                                                                                {transactionType === "salesNagal" || transactionType === "sales"
                                                                                                    ? item.Amount
                                                                                                    : item.Total_Invoice_value}
                                                                                            </TableCell>
                                                                                            <TableCell align="right">
                                                                                                {transactionType === "salesNagal"
                                                                                                    ? item.QTY
                                                                                                    : item.Act_Qty}
                                                                                            </TableCell>

                                                                                            {isEditingRow(editingItem, item) ? (
                                                                                                <>
                                                                                                    {transactionType === "salesNagal" ? (

                                                                                                        <>
                                                                                                            <TableCell align="right">
                                                                                                                {((editingItem.Brok_Rate || 0) * (editingItem.QTY || 0)).toFixed(2)}
                                                                                                            </TableCell>

                                                                                                            <TableCell align="right" sx={{ minWidth: 120 }}>
                                                                                                                <TextField
                                                                                                                    size="small"
                                                                                                                    type="number"
                                                                                                                    value={editingItem.Brok_Rate || ''}
                                                                                                                    onChange={(e) => {
                                                                                                                        const rate = parseFloat(e.target.value) || 0;
                                                                                                                        setEditingItem({
                                                                                                                            ...editingItem,
                                                                                                                            Brok_Rate: rate,
                                                                                                                            Brok_Amt: (rate * (editingItem.QTY || 0)).toFixed(2)
                                                                                                                        });
                                                                                                                    }}
                                                                                                                    inputProps={{ step: "0.01", style: { textAlign: 'right' } }}
                                                                                                                />
                                                                                                            </TableCell>

                                                                                                            <TableCell align="right">
                                                                                                                {((editingItem.Coolie_Rate || 0) * (editingItem.QTY || 0)).toFixed(2)}
                                                                                                            </TableCell>

                                                                                                            <TableCell align="right" sx={{ minWidth: 120 }}>
                                                                                                                <TextField
                                                                                                                    size="small"
                                                                                                                    type="number"
                                                                                                                    value={editingItem.Coolie_Rate || ''}
                                                                                                                    onChange={(e) => {
                                                                                                                        const rate = parseFloat(e.target.value) || 0;
                                                                                                                        setEditingItem({
                                                                                                                            ...editingItem,
                                                                                                                            Coolie_Rate: rate,
                                                                                                                            Coolie_Amt: (rate * (editingItem.QTY || 0)).toFixed(2)
                                                                                                                        });
                                                                                                                    }}
                                                                                                                    inputProps={{ step: "0.01", style: { textAlign: 'right' } }}
                                                                                                                />
                                                                                                            </TableCell>

                                                                                                            <TableCell align="right" sx={{ minWidth: 120 }}>
                                                                                                                <TextField
                                                                                                                    size="small"
                                                                                                                    type="number"
                                                                                                                    value={editingItem.Vilai_Vasi || ''}
                                                                                                                    onChange={(e) => {
                                                                                                                        const vv = parseFloat(e.target.value) || 0;
                                                                                                                        setEditingItem({
                                                                                                                            ...editingItem,
                                                                                                                            Vilai_Vasi: vv,
                                                                                                                            Vilaivasi_Rate: ((vv / 100) * (editingItem.QTY || 0)).toFixed(2)
                                                                                                                        });
                                                                                                                    }}
                                                                                                                    inputProps={{ step: "1", style: { textAlign: 'right' } }}
                                                                                                                />
                                                                                                            </TableCell>

                                                                                                            <TableCell align="right">
                                                                                                                {((editingItem.Vilai_Vasi || 0) * (editingItem.QTY || 0) / 100).toFixed(2)}
                                                                                                            </TableCell>
                                                                                                        </>
                                                                                                    ) : transactionType === "sales" ? (
                                                                                                        <>
                                                                                                            <TableCell align="right">
                                                                                                                {editingItem.Brokerage_Amt && editingItem.Act_Qty
                                                                                                                    ? (((editingItem.Brokerage_Amt) * editingItem.Act_Qty) / 100).toFixed(2)
                                                                                                                    : '0.00'
                                                                                                                }
                                                                                                            </TableCell>

                                                                                                            <TableCell align="right" sx={{ minWidth: 120 }}>

                                                                                                                <TextField
                                                                                                                    size="small"
                                                                                                                    type="number"
                                                                                                                    value={editingItem.Brokerage_Amt || ''}
                                                                                                                    onChange={(e) => {
                                                                                                                        const amount = parseFloat(e.target.value) || 0;
                                                                                                                        const rate = editingItem.Act_Qty
                                                                                                                            ? (amount * 100) / editingItem.Act_Qty
                                                                                                                            : 0;

                                                                                                                        setEditingItem({
                                                                                                                            ...editingItem,
                                                                                                                            Brokerage_Amt: amount,
                                                                                                                            Brokerage: rate.toFixed(2)
                                                                                                                        });
                                                                                                                    }}
                                                                                                                    inputProps={{
                                                                                                                        step: "0.01",
                                                                                                                        style: { textAlign: 'right' }
                                                                                                                    }}

                                                                                                                />

                                                                                                            </TableCell>


                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            <TableCell align="right">
                                                                                                                {editingItem.Brokerage_Amt && editingItem.Act_Qty
                                                                                                                    ? (((editingItem.Brokerage_Amt) * editingItem.Act_Qty) / 100).toFixed(2)
                                                                                                                    : '0.00'
                                                                                                                }
                                                                                                            </TableCell>

                                                                                                            <TableCell align="right" sx={{ minWidth: 120 }}>

                                                                                                                <TextField
                                                                                                                    size="small"
                                                                                                                    type="number"
                                                                                                                    value={editingItem.Brokerage_Amt || ''}
                                                                                                                    onChange={(e) => {
                                                                                                                        const amount = parseFloat(e.target.value) || 0;
                                                                                                                        const rate = editingItem.Act_Qty
                                                                                                                            ? (amount * 100) / editingItem.Act_Qty
                                                                                                                            : 0;

                                                                                                                        setEditingItem({
                                                                                                                            ...editingItem,
                                                                                                                            Brokerage_Amt: amount,
                                                                                                                            Brokerage: rate.toFixed(2)
                                                                                                                        });
                                                                                                                    }}
                                                                                                                    inputProps={{
                                                                                                                        step: "0.01",
                                                                                                                        style: { textAlign: 'right' }
                                                                                                                    }}

                                                                                                                />

                                                                                                            </TableCell>


                                                                                                        </>
                                                                                                    )}

                                                                                                    <TableCell align="right">
                                                                                                        <Box display="flex" gap={1} justifyContent="flex-end">
                                                                                                            <Tooltip title="Save changes">
                                                                                                                <IconButton color="primary" size="small" onClick={handleSaveEdit}>
                                                                                                                    <Save fontSize="small" />
                                                                                                                </IconButton>
                                                                                                            </Tooltip>
                                                                                                            <Tooltip title="Cancel editing">
                                                                                                                <IconButton color="secondary" size="small" onClick={() => setEditingItem(null)}>
                                                                                                                    <Cancel fontSize="small" />
                                                                                                                </IconButton>
                                                                                                            </Tooltip>
                                                                                                        </Box>
                                                                                                    </TableCell>
                                                                                                </>
                                                                                            ) : (
                                                                                                <>
                                                                                                    {transactionType === "salesNagal" ? (
                                                                                                        <>
                                                                                                            <TableCell align="right">{item.Brok_Amt || '0.00'}</TableCell>
                                                                                                            <TableCell align="right">{item.Brok_Rate || '0.00'}</TableCell>
                                                                                                            <TableCell align="right">{item.Coolie_Amt || '0.00'}</TableCell>
                                                                                                            <TableCell align="right">{item.Coolie_Rate || '0.00'}</TableCell>
                                                                                                            <TableCell align="right">{item.Vilai_Vasi || '0.00'}</TableCell>
                                                                                                            <TableCell align="right">{item.Vilaivasi_Rate || '0.00'}</TableCell>
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        <>
                                                                                                            <TableCell align="right">{item.Brokerage || '0.00'}</TableCell>
                                                                                                            {/* <TableCell align="right">
                {((parseFloat(item.Act_Qty) / 100 ) / (parseFloat(item.Brokerage)) * 100 || 0).toFixed(2)}
              </TableCell> */}

                                                                                                        </>
                                                                                                    )}
                                                                                                    <TableCell align="right">
                                                                                                        <Box display="flex" gap={1} justifyContent="flex-end">
                                                                                                            <Tooltip title="Delete this item">
                                                                                                                <IconButton
                                                                                                                    color="error"
                                                                                                                    size="small"
                                                                                                                    onClick={(e) => {
                                                                                                                        e.stopPropagation();
                                                                                                                        setItemToDelete(item);
                                                                                                                        setDeleteItemDialogOpen(true);
                                                                                                                    }}
                                                                                                                >
                                                                                                                    <Delete fontSize="small" />
                                                                                                                </IconButton>
                                                                                                            </Tooltip>
                                                                                                            <Tooltip title="Edit this item">
                                                                                                                <IconButton
                                                                                                                    color="primary"
                                                                                                                    size="small"
                                                                                                                    onClick={() => handleEditItem(item)}
                                                                                                                >
                                                                                                                    <Edit fontSize="small" />
                                                                                                                </IconButton>
                                                                                                            </Tooltip>
                                                                                                        </Box>
                                                                                                    </TableCell>
                                                                                                </>
                                                                                            )}
                                                                                        </TableRow>
                                                                                    ))
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
                                                    tableConfigs[transactionType].listingColumns.length + 1
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

            {/* Filter dialogs and other components remain the same */}
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
                            {transactionType === "sales" ? "Sales" : transactionType === "salesNagal" ? "SalesNagal" : "Purchase"} Data Entry
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
                            transactionType === 'salesNagal' ? (
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

            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContent id="alert-dialog-description">
                        Are you sure you want to delete {brokerToDelete?.Broker_Name || brokerToDelete?.Supplier_Name}'s records?
                    </DialogContent>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteItemDialogOpen}
                onClose={() => setDeleteItemDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirm Item Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this {itemToDelete?.Product_Name} item?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteItemDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteItem} color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={bulkDeleteDialogOpen}
                onClose={() => setBulkDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    Confirm Bulk Deletion
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete ALL filtered records? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setBulkDeleteDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleBulkDelete} color="error" autoFocus>
                        Delete All
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NakalReports;