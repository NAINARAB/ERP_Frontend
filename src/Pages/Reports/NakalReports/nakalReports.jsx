import React, { useEffect, useState, useMemo } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { toArray, Addition } from "../../../Components/functions";
import {
    TextField, Button, Dialog, DialogActions, DialogContent, IconButton, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, Typography, Box, Grid,
    TablePagination,
    Tabs,
    Tab,
    Collapse,
    Tooltip
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
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import PdfPreviewModal from "./PdfPreviewModal";

const NakalReports = ({ loadingOn, loadingOff }) => {

    const [dataEntryPagination, setDataEntryPagination] = useState({ page: 0, rowsPerPage: 10 });
    const [listingPagination, setListingPagination] = useState({ page: 0, rowsPerPage: 10 });


    const [activeTab, setActiveTab] = useState(0);


    const [dropDown, setDropDown] = useState({ broker: [] });


    const [filtersDataEntry, setFiltersDataEntry] = useState({
        FromDate: new Date().toISOString().split("T")[0],
        ToDate: new Date().toISOString().split("T")[0],
        Broker: { value: "", label: "ALL Brokers" },
        Ledger: { value: "", label: "All Ledger" },
        Item: { value: "", label: "All Item" },
        refresh: false,
        filterDialog: false,
    });
    const [deliveryReport, setDeliveryReport] = useState([]);
    const [brokerageValues, setBrokerageValues] = useState({});


    const [filtersListing, setFiltersListing] = useState({
        FromDate: new Date().toISOString().split("T")[0],
        ToDate: new Date().toISOString().split("T")[0],
        Broker: { value: "", label: "ALL Brokers" },
        Ledger: { value: "", label: "All Ledger" },
        Item: { value: "", label: "All Item" },
        VilaiVasiZero: { value: "", label: "All" }, // <-- ADD THIS
        refresh: false,
        filterDialog: false,
    });
    const [dataset, setDataset] = useState([]);
    const [dropdownOptionsListing, setDropdownOptionsListing] = useState({ ledgers: [], items: [] });
    const [expandedBrokers, setExpandedBrokers] = useState({});

    const [saving, setSaving] = useState(false);
    const storage = JSON.parse(localStorage.getItem("user"));
    const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
    const [pdfPreviewData, setPdfPreviewData] = useState(null);
    const [headerVilaiVasi, setHeaderVilaiVasi] = useState(""); // global VilaiVasi value

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
                const res = await fetchLink({
                    address: `reports/brokerageNakalReport/sales?FromDate=${filtersDataEntry.FromDate}&ToDate=${filtersDataEntry.ToDate}&broker=${filtersDataEntry.Broker.value}`,
                });
                if (res.success) {
                    const data = toArray(res.data);
                    setDeliveryReport(data);
                    const initialBrokerage = {};
                    data.forEach((item) => {
                        const key = `${item.Do_Id}-${item.Product_Id}`;
                        initialBrokerage[key] = item.brokerage || "";
                    });
                    setBrokerageValues(initialBrokerage);
                } else {
                    setDeliveryReport([]);
                    setBrokerageValues({});
                }
            } catch (err) {
                setDeliveryReport([]);
                setBrokerageValues({});
            } finally {
                loadingOff();
            }
        };
        fetchData();
    }, [filtersDataEntry.refresh]);


    useEffect(() => {
        const fetchDatasetAndDropdowns = async () => {
            try {
                loadingOn();
                let url = `reports/brokerageNagal/list?FromDate=${filtersListing.FromDate}&ToDate=${filtersListing.ToDate}`;
                if (filtersListing.Broker.value) url += `&broker=${filtersListing.Broker.value}`;
                if (filtersListing.Ledger.value) url += `&ledger=${filtersListing.Ledger.value}`;
                if (filtersListing.Item.value) url += `&item=${filtersListing.Item.value}`;
                if (filtersListing.VilaiVasiZero.value) url += `&vilaivasiFilter=${filtersListing.VilaiVasiZero.value}`;
                const res = await fetchLink({ address: url });
                if (res.success) {
                    const data = toArray(res.data);
                    setDataset(data);
                    const allItems = data.flatMap((item) => item.Items || []);
                    const uniqueLedgers = Array.from(new Map(
                        allItems.map((item) => [item.Ledger_Tally_Id, { value: item.Ledger_Tally_Id, label: item.Ledger_Name }])
                    ).values());
                    const uniqueItems = Array.from(new Map(
                        allItems.map((item) => [item.Product_Id, { value: item.Product_Id, label: item.Product_Name }])
                    ).values());
                    setDropdownOptionsListing({ ledgers: uniqueLedgers, items: uniqueItems });
                }
            } catch (e) { }
            finally { loadingOff(); }
        };
        fetchDatasetAndDropdowns();
    }, [filtersListing.refresh]);


    const handleTabChange = (event, newValue) => setActiveTab(newValue);
    const handleDataEntryPageChange = (event, newPage) => setDataEntryPagination({ ...dataEntryPagination, page: newPage });
    const handleDataEntryRowsPerPageChange = (event) => setDataEntryPagination({ page: 0, rowsPerPage: parseInt(event.target.value, 10) });
    const handleListingPageChange = (event, newPage) => setListingPagination({ ...listingPagination, page: newPage });
    const handleListingRowsPerPageChange = (event) => setListingPagination({ page: 0, rowsPerPage: parseInt(event.target.value, 10) });
    const handleBrokerageChange = (doId, productId) => (e) => {
        const value = e.target.value;
        const key = `${doId}-${productId}`;
        setBrokerageValues((prev) => ({ ...prev, [key]: value }));
    };
    const handleExpandBroker = (brokerName) => setExpandedBrokers((prev) => ({ ...prev, [brokerName]: !prev[brokerName] }));
    const closeDialogDataEntry = () => setFiltersDataEntry((prev) => ({ ...prev, filterDialog: false }));
    const closeDialogListing = () => setFiltersListing((prev) => ({ ...prev, filterDialog: false }));


    const handleSave = async () => {
        loadingOn();
        try {
            setSaving(true);
            const recordsToSave = deliveryReport.map((item) => {
                const brokerageValue = brokerageValues[`${item.Do_Id}-${item.Product_Id}`];
                return {
                    ...item,
                    brokerage: parseFloat(brokerageValue) || 0,
                    Vilai_Vasi: parseFloat(brokerageValue) || 0,
                    Vilaivasi_Rate: ((parseFloat(brokerageValue) || 0) / 100) * (parseFloat(item.Bill_Qty) || 0),
                    Brok_Rate: item?.Brokerage,
                    Brok_Amt: item?.Brokerage * item?.displayQuantity,
                    Coolie_Rate: item?.Coolie,
                    Coolie_Amt: item?.Coolie * item?.displayQuantity,
                    Amount: item?.Amount,
                    Created_By: storage?.UserId,
                };
            });
            const response = await fetchLink({
                address: "reports/brokerageNagal/create",
                method: "POST",
                bodyData: recordsToSave,
                headers: { "Content-Type": "application/json" },
            });
            if (response.success) {
                toast.success("Nakal Created successfully!");
                setFiltersDataEntry((prev) => ({ ...prev, refresh: !prev.refresh }));

            } else {
                toast.error(response.message);
            }
        } catch (error) {
            toast.error("Save failed");
        } finally {
            setSaving(false);
            loadingOff();
        }
    };

    const totalBagsDataEntry = useMemo(() =>
        deliveryReport.reduce((acc, item) => Addition(acc, item.displayQuantity || item.Qty || 0), 0),
        [deliveryReport]
    );

    const totalBagsListing = useMemo(() =>
        dataset.reduce((acc, item) => Addition(acc, item.Total_Bags || 0), 0),
        [dataset]
    );

    const calculateVilaivasiAmt = (vilaivasi, billQty) => ((parseFloat(vilaivasi) || 0) / 100) * (parseFloat(billQty) || 0);

    const handleFieldChange = (idx, fieldName, value) => {
        const updatedDeliveryReport = [...deliveryReport];
        updatedDeliveryReport[idx][fieldName] = parseFloat(value) || 0;
        setDeliveryReport(updatedDeliveryReport);
    };

    const groupedByBroker = useMemo(() => {
        if (!dataset || dataset.length === 0) return {};
        return dataset.reduce((acc, item) => {
            const broker = item.Broker_Name || "Unknown Broker";
            if (!acc[broker]) acc[broker] = [];
            acc[broker].push(item);
            return acc;
        }, {});
    }, [dataset]);
    const brokerNames = useMemo(() => Object.keys(groupedByBroker), [groupedByBroker]);

    return (
        <Box>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5" component="h2">Brokerage Nagal Report</Typography>
                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<FilterAlt />}
                            onClick={() =>
                                activeTab === 0
                                    ? setFiltersDataEntry((prev) => ({ ...prev, filterDialog: true }))
                                    : setFiltersListing((prev) => ({ ...prev, filterDialog: true }))
                            }
                            sx={{ mr: 2 }}
                        >Filters</Button>
                        <Typography component="span" variant="body1">
                            Total Bags: <strong>{activeTab === 0 ? totalBagsDataEntry : totalBagsListing}</strong>
                        </Typography>
                    </Box>
                </Grid>

                <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                    <Tab label="Data Entry" />
                    <Tab label="Listing" />
                </Tabs>
                {activeTab === 0 && (
                    <Box mb={1} sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        gap: 2
                    }}>
                        <Typography sx={{ fontWeight: "bold" }}>VilaiVasi (All):</Typography>
                        <TextField
                            type="number"
                            size="small"
                            value={headerVilaiVasi}
                            inputProps={{ step: "1" }}
                            onChange={e => {
                                setHeaderVilaiVasi(e.target.value);
                                setBrokerageValues(prev => {
                                    const updated = { ...prev };
                                    deliveryReport.forEach(item => {
                                        const key = `${item.Do_Id}-${item.Product_Id}`;
                                        updated[key] = e.target.value;
                                    });
                                    return updated;
                                });
                            }}
                            placeholder="Set VilaiVasi for all"
                            sx={{

                                '& .MuiInputBase-input': {
                                    height: 40,
                                    boxSizing: 'border-box'
                                }
                            }}
                        />
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                setHeaderVilaiVasi("");
                                setBrokerageValues(prev => {
                                    const updated = { ...prev };
                                    deliveryReport.forEach(item => {
                                        const key = `${item.Do_Id}-${item.Product_Id}`;
                                        updated[key] = "";
                                    });
                                    return updated;
                                });
                            }}
                        >
                            Clear All
                        </Button>

                    </Box>
                )}


                {activeTab === 0 ? (
                    <>
                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "primary.main" }}>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Date</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Do No</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Product</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ledger_Name</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }}>Broker</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Bill_Qty</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Qty</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Rate</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Pack</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Amount</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Brok.Rate</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Brokerage</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Coolie.Rate</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Coolie.Amt</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Vilaivasi</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Narration</TableCell>
                                        <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Vilaivasi Amt</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {deliveryReport
                                        .slice(dataEntryPagination.page * dataEntryPagination.rowsPerPage, dataEntryPagination.page * dataEntryPagination.rowsPerPage + dataEntryPagination.rowsPerPage)
                                        .map((row, idx) => {
                                            const vilaivasiValue = brokerageValues[`${row.Do_Id}-${row.Product_Id}`] || "";
                                            const vilaivasiAmt = calculateVilaivasiAmt(vilaivasiValue, row.Bill_Qty);
                                            return (
                                                <TableRow key={idx} hover>
                                                    <TableCell align="left">{row.Date.split("T")[0]}</TableCell>
                                                    <TableCell>{row.Do_No || row.Do_Inv_No}</TableCell>
                                                    <TableCell>{row.Product_Name}</TableCell>
                                                    <TableCell>{row.Retailer_Name}</TableCell>
                                                    <TableCell>{row.CostCenterGet}</TableCell>
                                                    <TableCell align="right">{row.Bill_Qty}</TableCell>
                                                    <TableCell align="right">{row?.displayQuantity}</TableCell>
                                                    <TableCell align="right">{row.Rate || row.Item_Rate}</TableCell>
                                                    <TableCell align="right">{row.Pack}</TableCell>
                                                    <TableCell align="right">{row.Amount}</TableCell>
                                                    <TableCell align="right">
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={row.Brokerage}
                                                            onChange={(e) => handleFieldChange(idx, 'Brokerage', e.target.value)}
                                                            sx={{ width: "80px" }}
                                                            inputProps={{ step: "0.01" }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">{row.Brokerage * row.displayQuantity}</TableCell>
                                                    <TableCell align="right">
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={row.Coolie}
                                                            onChange={(e) => handleFieldChange(idx, 'Coolie', e.target.value)}
                                                            sx={{ width: "80px" }}
                                                            inputProps={{ step: "0.01" }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">{row.Coolie * row.displayQuantity}</TableCell>
                                                    <TableCell align="right">

                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            value={vilaivasiValue}
                                                            onChange={handleBrokerageChange(row.Do_Id, row.Product_Id)}
                                                            sx={{ width: "120px" }}
                                                            inputProps={{ step: "0.01" }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">{row.Narration}</TableCell>
                                                    <TableCell align="right">{vilaivasiAmt.toFixed(2)}</TableCell>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                            <TablePagination
                                rowsPerPageOptions={[10, 25, 50, 100]}
                                component="div"
                                count={deliveryReport.length}
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
                            >{saving ? "Saving..." : "Save Brokerage"}</Button>
                        </Box>
                    </>)
                    : (
                        <>
                            <TableContainer component={Paper}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ backgroundColor: "primary.main" }}>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }}>Broker</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Total KGS</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Total Bill Qty</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Total_Amount</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Total_Broker_Exp</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Total_VilaiVasi</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Total_Bags</TableCell>
                                            <TableCell sx={{ color: "white", fontWeight: "bold" }} align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {brokerNames.length > 0 ? (
                                            brokerNames
                                                .slice(
                                                    listingPagination.page * listingPagination.rowsPerPage,
                                                    listingPagination.page * listingPagination.rowsPerPage + listingPagination.rowsPerPage
                                                )
                                                .map((brokerName, idx) => {
                                                    const brokerData = dataset.find(item => item.Broker_Name === brokerName);
                                                    return (
                                                        <React.Fragment key={idx}>
                                                            <TableRow hover>
                                                                <TableCell>
                                                                    <IconButton size="small" onClick={() => handleExpandBroker(brokerName)}>
                                                                        {expandedBrokers[brokerName] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                                                    </IconButton>
                                                                    {brokerName}
                                                                </TableCell>
                                                                <TableCell align="right">{brokerData?.Total_Qty || "0.00"}</TableCell>
                                                                <TableCell align="right">{brokerData?.Total_KGS || "0.00"}</TableCell>
                                                                <TableCell align="right">{brokerData?.Total_Amount || "0.00"}</TableCell>
                                                                <TableCell align="right">{brokerData?.Broker_Exp || "0.00"}</TableCell>
                                                                <TableCell align="right">{brokerData?.VilaiVasi || "0.00"}</TableCell>
                                                                <TableCell align="right">{brokerData?.Total_Bags || 0}</TableCell>
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
                                                                </TableCell>
                                                                <PdfPreviewModal
                                                                    open={pdfPreviewOpen}
                                                                    onClose={() => setPdfPreviewOpen(false)}
                                                                    brokerData={pdfPreviewData}
                                                                />

                                                            </TableRow>
                                                            <TableRow>
                                                                <TableCell style={{ padding: 0 }} colSpan={7}>
                                                                    <Collapse in={expandedBrokers[brokerName]} timeout="auto" unmountOnExit>
                                                                        <Box margin={1}>
                                                                            <Typography variant="h6" gutterBottom component="div">
                                                                                Details for {brokerName}
                                                                            </Typography>
                                                                            <Table size="small">
                                                                                <TableHead>
                                                                                    <TableRow>
                                                                                        <TableCell>Date</TableCell>
                                                                                        <TableCell>Invoice No</TableCell>
                                                                                        <TableCell>Retailer</TableCell>
                                                                                        <TableCell>Alias</TableCell>
                                                                                        <TableCell>Product</TableCell>
                                                                                        <TableCell>Short Name</TableCell>
                                                                                        <TableCell align="right">QTY</TableCell>
                                                                                        <TableCell align="right">KGS</TableCell>
                                                                                        <TableCell align="right">Amount</TableCell>
                                                                                        <TableCell align="right">Vilai Vasi</TableCell>
                                                                                        <TableCell align="right">Vilai Amt</TableCell>
                                                                                    </TableRow>
                                                                                </TableHead>
                                                                                <TableBody>
                                                                                    {brokerData?.Items?.map((item, itemIdx) => (
                                                                                        <TableRow key={itemIdx}>
                                                                                            <TableCell>{item.Date}</TableCell>
                                                                                            <TableCell>{item.Do_Inv_No}</TableCell>
                                                                                            <TableCell>{item.Retailer_Name}</TableCell>
                                                                                            <TableCell>{item.Ledger_Alias}</TableCell>
                                                                                            <TableCell>{item.Product_Name}</TableCell>
                                                                                            <TableCell>{item.Short_Name}</TableCell>
                                                                                            <TableCell align="right">{item.QTY}</TableCell>
                                                                                            <TableCell align="right">{item.KGS}</TableCell>
                                                                                            <TableCell align="right">{item.Amount?.toFixed(2)}</TableCell>
                                                                                            <TableCell align="right">{item.Vilai_Vasi}</TableCell>
                                                                                            <TableCell align="right">{item.Vilai_Vasi}</TableCell>
                                                                                        </TableRow>
                                                                                    ))}
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
                                                <TableCell colSpan={7} align="center">No data found</TableCell>
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
                        </>)
                }
            </Paper>

            <Dialog
                open={filtersDataEntry.filterDialog && activeTab === 0}
                onClose={closeDialogDataEntry}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Data Entry Filters</Typography>
                        <IconButton onClick={closeDialogDataEntry}>
                            <FilterAltOff />
                        </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth type="date" label="From Date" value={filtersDataEntry.FromDate}
                                onChange={e => setFiltersDataEntry(prev => ({ ...prev, FromDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth type="date" label="To Date" value={filtersDataEntry.ToDate}
                                onChange={e => setFiltersDataEntry(prev => ({ ...prev, ToDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={2} style={{ display: 'flex', alignItems: 'flex-end' }}>

                        </Grid>
                        <Grid item xs={12}>
                            <Select
                                fullWidth label="Brokers" value={filtersDataEntry.Broker}
                                onChange={selected => setFiltersDataEntry(prev => ({ ...prev, Broker: selected }))}
                                options={[{ value: "", label: "ALL Brokers" }, ...dropDown.broker]}
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
                    <Button variant="contained" onClick={() => {
                        setHeaderVilaiVasi("");

                        setBrokerageValues(prev => {
                            const updated = { ...prev };
                            deliveryReport.forEach(item => {
                                const key = `${item.Do_Id}-${item.Product_Id}`;
                                updated[key] = "";
                            });
                            return updated;
                        });
                        setFiltersDataEntry(prev => ({ ...prev, refresh: !prev.refresh, filterDialog: false }));
                    }}>Apply Filters</Button>
                </DialogActions>
            </Dialog>


            <Dialog
                open={filtersListing.filterDialog && activeTab === 1}
                onClose={closeDialogListing}
                maxWidth="sm"
                fullWidth
            >
                <DialogContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
                                onChange={e => setFiltersListing(prev => ({ ...prev, FromDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={5}>
                            <TextField
                                fullWidth
                                type="date"
                                label="To Date"
                                value={filtersListing.ToDate}
                                onChange={e => setFiltersListing(prev => ({ ...prev, ToDate: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={2} style={{ display: 'flex', alignItems: 'flex-end' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {

                                    setFiltersListing(prev => ({ ...prev, refresh: !prev.refresh }));
                                }}
                                style={{ height: '30px', width: '100%' }}
                            >
                                Search
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Select
                                fullWidth
                                value={filtersListing.VilaiVasiZero}
                                onChange={selected => setFiltersListing(prev => ({ ...prev, VilaiVasiZero: selected }))}
                                options={[
                                    { value: "", label: "All" },
                                    { value: "zero", label: "VilaiVasi Zero" },
                                    { value: "nonzero", label: "VilaiVasi Non-Zero" }
                                ]}
                                styles={customSelectStyles}
                                menuPortalTarget={document.body}
                                placeholder="VilaiVasi Zero/Non-Zero"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Select
                                fullWidth
                                label="Brokers"
                                value={filtersListing.Broker}
                                onChange={selected => setFiltersListing(prev => ({ ...prev, Broker: selected }))}
                                options={[{ value: "", label: "ALL Brokers" }, ...dropDown.broker]}
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
                                onChange={selected => setFiltersListing(prev => ({ ...prev, Ledger: selected }))}
                                options={[{ value: "", label: "ALL Ledger" }, ...dropdownOptionsListing.ledgers]}
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
                                onChange={selected => setFiltersListing(prev => ({ ...prev, Item: selected }))}
                                options={[{ value: "", label: "ALL Item" }, ...dropdownOptionsListing.items]}
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
                    <Button variant="contained" onClick={() => {
                        setFiltersListing(prev => ({ ...prev, refresh: !prev.refresh, filterDialog: false }));
                    }}>Apply Filters</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default NakalReports;
