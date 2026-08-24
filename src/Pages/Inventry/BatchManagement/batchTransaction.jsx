import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Box,
    Paper,
    Typography,
    Button,
    CircularProgress,
    Stack,
    Grid,
    Tooltip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import Select from "react-select";

import { fetchLink } from "../../../Components/fetchComponent";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { reactSelectFilterLogic } from "../../../Components/functions";
import AppTableComponent from "../../../Components/appTable/appTableComponent";

/* ------------------------------ theme tokens ------------------------------ */
const T = {
    paper: "#faf7f0",
    ink: "#1f2421",
    inkSoft: "#5b635c",
    line: "#d8d0c2",
    gold: "#b08433",
    goldSoft: "#e9dcbf",
    currentEdge: "#b08433",
    shadow: "0 1px 2px rgba(31,36,33,.06), 0 8px 24px rgba(31,36,33,.07)",
    inBg: "#e8f5e9",
    inText: "#2e7d32",
    outBg: "#ffebee",
    outText: "#c62828",
};

const IN_MODULES = ["PURCHASE", "PRODUCTION", "CREDIT_NOTE", "MATERIAL_INWARD"];

/* ------------------------------ Search Panel ------------------------------ */
function SearchPanel({ onSearch, loading, initialForm }) {
    const [form, setForm] = useState(() => {
        if (initialForm) {
            return {
                item: initialForm.item || null,
                godown: initialForm.godown || null,
                batch: initialForm.batch ? { value: initialForm.batch, label: initialForm.batch } : null,
                batch_id: initialForm.batch_id || null
            }
        }
        return { item: null, godown: null, batch: null, batch_id: null };
    });

    const [dropDownData, setDropDownData] = useState([]);

    useEffect(() => {
        fetchLink({ address: `inventory/batchMaster/dropDown` })
            .then(res => {
                if (res && res.success && res.data && res.data.length > 0) {
                    setDropDownData(res.data[0] || []);
                }
            });
    }, []);

    const getFilteredData = (excludeField) => {
        return dropDownData.filter(row => {
            let match = true;
            if (excludeField !== 'item' && form.item && row.item_id !== form.item.value) match = false;
            if (excludeField !== 'godown' && form.godown && row.godown_id !== form.godown.value) match = false;
            if (excludeField !== 'batch' && form.batch && row.batch !== form.batch.value) match = false;
            return match;
        });
    };

    const itemOptions = Array.from(
        new Map(getFilteredData('item').map(r => [r.item_id, { value: r.item_id, label: r.item_name }])).values()
    ).sort((a, b) => a.label.localeCompare(b.label));

    const godownOptions = Array.from(
        new Map(getFilteredData('godown').map(r => [r.godown_id, { value: r.godown_id, label: r.godown_name }])).values()
    ).sort((a, b) => a.label.localeCompare(b.label));

    const batchOptions = Array.from(
        new Map(getFilteredData('batch').map(r => [r.batch, { value: r.batch, label: r.batch }])).values()
    ).sort((a, b) => a.label.localeCompare(b.label));

    const canSearch = form.batch && form.item;

    return (
        <Paper
            elevation={0}
            className="d-flex flex-wrap align-items-end gap-3 p-3 mb-4"
            sx={{ border: `1px solid ${T.line}`, borderRadius: 3.5, boxShadow: T.shadow, bgcolor: "#fff" }}
        >
            <Box
                sx={{
                    display: "grid",
                    gap: 1.5,
                    flex: "1 1 460px",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(140px, 1fr))" },
                }}
            >
                <Select
                    value={form.item}
                    onChange={(e) => setForm({ ...form, item: e })}
                    options={itemOptions}
                    styles={customSelectStyles}
                    isSearchable={true}
                    placeholder="Select Item"
                    filterOption={reactSelectFilterLogic}
                    isClearable
                />

                <Select
                    value={form.godown}
                    onChange={(e) => setForm({ ...form, godown: e })}
                    options={godownOptions}
                    styles={customSelectStyles}
                    isSearchable={true}
                    placeholder="Select Godown (Optional)"
                    filterOption={reactSelectFilterLogic}
                    isClearable
                />

                <Select
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e })}
                    options={batchOptions}
                    styles={customSelectStyles}
                    isSearchable={true}
                    placeholder="Select Batch"
                    filterOption={reactSelectFilterLogic}
                    isClearable
                />
            </Box>
            <Button
                onClick={() => onSearch({ batch_name: form.batch?.value, item_id: form.item?.value, godown_id: form.godown?.value, batch_id: form.batch_id })}
                disabled={!canSearch || loading}
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    px: 3,
                    py: 1.1,
                    borderRadius: 2.5,
                    bgcolor: T.ink,
                    boxShadow: "0 4px 12px rgba(31,36,33,.15)",
                    "&:hover": { bgcolor: "#2b312d" },
                    "&.Mui-disabled": { opacity: 0.5, color: "#fff", bgcolor: T.ink },
                }}
            >
                {loading ? "Searching..." : "Search"}
            </Button>
        </Paper>
    );
}

/* ------------------------------ Stat Card ------------------------------ */
function StatCard({ title, value, icon, color, bgColor }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 3.5,
                border: `1px solid ${T.line}`,
                boxShadow: T.shadow,
                bgcolor: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 2,
                height: "100%",
            }}
        >
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: bgColor,
                    color: color,
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600} mb={0.5}>
                    {title}
                </Typography>
                <Typography variant="h5" fontWeight={700} color={T.ink}>
                    {value.toLocaleString()}
                </Typography>
            </Box>
        </Paper>
    );
}

/* ------------------------------ Main ------------------------------ */
const BatchTransactionView = () => {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [batchData, setBatchData] = useState(null);

    const initialFormState = location.state || null;

    useEffect(() => {
        if (initialFormState) {
            handleSearch({
                batch_id: initialFormState.batch_id,
                batch_name: initialFormState.batch,
                item_id: initialFormState.item?.value,
                godown_id: initialFormState.godown?.value
            });
        }
    }, []);

    const handleSearch = (searchParams) => {
        setLoading(true);
        let url = `inventory/batchMaster/batchTransactions?batch_name=${searchParams.batch_name}&item_id=${searchParams.item_id}`;
        if (searchParams.batch_id) url += `&batch_id=${searchParams.batch_id}`;

        fetchLink({ address: url })
            .then(data => {
                if (data.success && data.data.length > 0) {
                    setBatchData(data.data[0]);
                } else {
                    setBatchData(null);
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    // Calculate metrics
    let totalIn = 0;
    let totalOut = 0;

    if (batchData && batchData.transaction) {
        batchData.transaction.forEach(tx => {
            if (IN_MODULES.includes(tx.transType)) {
                totalIn += Number(tx.batchQuantity) || 0;
            } else {
                totalOut += Number(tx.batchQuantity) || 0;
            }
        });
    }

    const currentBalance = totalIn - totalOut;

    // Table columns definition
    const columns = [
        { Field_Name: 'voucherDate', Fied_Data: 'date', ColumnHeader: 'Date', isVisible: 1 },
        { Field_Name: 'voucherNumber', Fied_Data: 'string', ColumnHeader: 'Voucher No', isVisible: 1 },
        { Field_Name: 'partyName', Fied_Data: 'string', ColumnHeader: 'Party/Concern', isVisible: 1 },
        {
            Field_Name: 'transType', Fied_Data: 'string', ColumnHeader: 'Type', isVisible: 1, isCustomCell: true,
            Cell: ({ row }) => {
                const isIn = IN_MODULES.includes(row.transType);
                return (
                    <Box
                        sx={{
                            display: 'inline-block',
                            px: 1, py: 0.5, borderRadius: 1.5,
                            bgcolor: isIn ? T.inBg : T.outBg,
                            color: isIn ? T.inText : T.outText,
                            fontSize: '0.75rem', fontWeight: 700,
                            letterSpacing: '0.03em'
                        }}
                    >
                        {row.transType}
                    </Box>
                );
            }
        },
        { Field_Name: 'voucherQuantity', Fied_Data: 'number', ColumnHeader: 'Voucher Qty', isVisible: 1 },
        {
            Field_Name: 'batchQuantity', Fied_Data: 'number', ColumnHeader: 'Batch Qty', isVisible: 1, isCustomCell: true,
            Cell: ({ row }) => {
                const isIn = IN_MODULES.includes(row.transType);
                return (
                    <Typography
                        variant="body2"
                        fontWeight={700}
                        color={isIn ? T.inText : T.outText}
                    >
                        {isIn ? '+' : '-'}{Number(row.batchQuantity).toLocaleString()}
                    </Typography>
                );
            }
        }
    ];

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, minHeight: '100vh' }}>

            <SearchPanel onSearch={handleSearch} loading={loading} initialForm={initialFormState} />

            {batchData && (
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} md={4}>
                        <StatCard
                            title="Total Received (IN)"
                            value={totalIn}
                            icon={<TrendingUpIcon />}
                            color={T.inText}
                            bgColor={T.inBg}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatCard
                            title="Total Issued (OUT)"
                            value={totalOut}
                            icon={<TrendingDownIcon />}
                            color={T.outText}
                            bgColor={T.outBg}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StatCard
                            title="Current Balance"
                            value={currentBalance}
                            icon={<AccountBalanceWalletIcon />}
                            color={currentBalance >= 0 ? T.ink : T.outText}
                            bgColor={currentBalance >= 0 ? '#e0f2f1' : T.outBg}
                        />
                    </Grid>
                </Grid>
            )}

            {batchData && batchData.transaction && (
                <Paper sx={{ border: `1px solid ${T.line}`, borderRadius: 3.5, boxShadow: T.shadow, overflow: 'hidden' }}>
                    <Box sx={{ p: 2, borderBottom: `1px solid ${T.line}`, bgcolor: '#fff' }}>
                        <Typography variant="h6" fontWeight={700} color={T.ink}>
                            Transaction Ledger
                        </Typography>
                    </Box>
                    <AppTableComponent
                        dataArray={batchData.transaction}
                        columns={columns}
                        EnableSerialNumber
                    />
                </Paper>
            )}
        </Box>
    );
};

export default BatchTransactionView;