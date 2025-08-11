import React, { useState, useEffect } from "react";
import {
    Paper, Typography, Box, Collapse, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
    CircularProgress, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Autocomplete
} from "@mui/material";
import {
    ExpandMore, ExpandLess, AccountTree, AccountBalance, AttachMoney, FilterList, ClearAll
} from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";

const calculateTotals = (node) => {
    let debit = 0;
    let credit = 0;

    if (node.accounts?.length) {
        node.accounts.forEach((acc) => {
            debit += Number(acc.Debit_Amount || 0);
            credit += Number(acc.Credit_Amount || 0);
        });
    }
    if (node.children?.length) {
        node.children.forEach((child) => {
            const childTotals = calculateTotals(child);
            debit += childTotals.debit;
            credit += childTotals.credit;
        });
    }
    return { debit, credit, balance: debit - credit };
};

const ExpenseNode = ({ node, depth = 0 }) => {
    const [expanded, setExpanded] = useState(depth === 0);
    const totals = calculateTotals(node);
    const hasChildren = node.children?.length > 0;
    const hasAccounts = node.accounts?.length > 0;

    return (
        <Box sx={{ ml: depth * 2 }}>
            <Paper sx={{ mb: 1, p: 1, backgroundColor: depth === 0 ? "#f5f5f5" : "white" }}>
                <Box display="flex" alignItems="center" justifyContent="space-between"
                    sx={{ cursor: (hasChildren || hasAccounts) ? "pointer" : "default" }}
                    onClick={() => (hasChildren || hasAccounts) && setExpanded(!expanded)}>
                    <Box display="flex" alignItems="center">
                        {(hasChildren || hasAccounts) && (
                            <IconButton size="small" sx={{ mr: 1 }}>
                                {expanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        )}
                        {hasChildren ? <AccountTree color="primary" sx={{ mr: 1 }} /> : <AccountBalance color="secondary" sx={{ mr: 1 }} />}
                        <Typography fontWeight="medium">{node.group_name}</Typography>
                    </Box>
                    <Box display="flex" gap={3} sx={{ mr: 2 }}>
                        <Typography variant="body2">Debit: {totals.debit.toFixed(2)}</Typography>
                        <Typography variant="body2">Credit: {totals.credit.toFixed(2)}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: "bold", color: totals.balance >= 0 ? "green" : "red" }}>
                            Balance: {totals.balance.toFixed(2)}
                        </Typography>
                    </Box>
                </Box>

                <Collapse in={expanded}>
                    {hasAccounts && (
                        <TableContainer sx={{ mt: 1, mb: 1 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                                        <TableCell>Account</TableCell>
                                        <TableCell align="right">Debit</TableCell>
                                        <TableCell align="right">Credit</TableCell>
                                        <TableCell align="right">Balance</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {node.accounts.map(acc => (
                                        <TableRow key={acc.Acc_Id}>
                                            <TableCell>
                                                <Box display="flex" alignItems="center">
                                                    <AttachMoney fontSize="small" sx={{ mr: 1 }} />
                                                    {acc.Account_Name}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">{acc.Debit_Amount?.toFixed(2) || '0.00'}</TableCell>
                                            <TableCell align="right">{acc.Credit_Amount?.toFixed(2) || '0.00'}</TableCell>
                                            <TableCell align="right">
                                                {((acc.Debit_Amount || 0) - (acc.Credit_Amount || 0)).toFixed(2)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {hasChildren && (
                        <Box>
                            {node.children.map(child => (
                                <ExpenseNode key={child.group_id} node={child} depth={depth + 1} />
                            ))}
                        </Box>
                    )}
                </Collapse>
            </Paper>
        </Box>
    );
};

const ExpenseHierarchy = () => {
    const today = new Date().toISOString().split("T")[0];

    const [hierarchy, setHierarchy] = useState([]);
    const [fullHierarchy, setFullHierarchy] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);
    const [filterOptions, setFilterOptions] = useState({

        accountNames: [],

    });
    const [filters, setFilters] = useState({
        fromDate: today,
        toDate: today,
        accountName: null,

    });

    useEffect(() => {
        if (fullHierarchy.length > 0) {
            const groupNames = new Set();
            const accountNames = new Set();
            const ledgerNames = new Set();

            const extractData = (nodes) => {
                nodes.forEach(node => {
                    if (node.group_name) groupNames.add(node.group_name);

                    if (node.accounts?.length) {
                        node.accounts.forEach(acc => {
                            if (acc.Account_Name) accountNames.add(acc.Account_Name);

                        });
                    }

                    if (node.children?.length) {
                        extractData(node.children);
                    }
                });
            };

            extractData(fullHierarchy);

            setFilterOptions({
                accountNames: Array.from(accountNames),
            });
        }
    }, [fullHierarchy]);

    const filterHierarchy = (nodes) => {
        if (!nodes) return [];

        return nodes.reduce((acc, node) => {

            const newNode = { ...node };

            if (newNode.accounts?.length) {
                newNode.accounts = newNode.accounts.filter(acc => {

                    if (filters.accountName && !acc.Account_Name?.toLowerCase().includes(filters.accountName.toLowerCase())) {
                        return false;
                    }
                    if (filters.ledgerName &&
                        !acc.Debit_Ledger_Name?.toLowerCase().includes(filters.ledgerName.toLowerCase()) &&
                        !acc.Credit_Ledger_Name?.toLowerCase().includes(filters.ledgerName.toLowerCase())) {
                        return false;
                    }
                    return true;
                });
            }

            if (newNode.children?.length) {
                newNode.children = filterHierarchy(newNode.children);
            }

            const groupNameMatch = !filters.groupName ||
                newNode.group_name?.toLowerCase().includes(filters.groupName.toLowerCase());

            const hasMatchingAccounts = newNode.accounts?.length > 0;
            const hasMatchingChildren = newNode.children?.length > 0;
            const hasMatchingData = hasMatchingAccounts || hasMatchingChildren;


            if (groupNameMatch && hasMatchingData) {
                acc.push(newNode);
            }

            return acc;
        }, []);
    };

    const fetchExpenseHierarchy = async () => {
        try {
            setLoading(true);
            const query = new URLSearchParams({
                fromDate: filters.fromDate,
                toDate: filters.toDate
            }).toString();

            const response = await fetchLink({ address: `/reports/expenseReport?${query}` });
            const data = response.data || [];

            setFullHierarchy(data);
            setHierarchy(data);
            setFilterDialogOpen(false);
        } catch (err) {
            console.error("Error fetching expenses:", err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        if (!filters.groupName && !filters.accountName && !filters.ledgerName) {
            setHierarchy(fullHierarchy);
        } else {
            const filteredData = filterHierarchy(JSON.parse(JSON.stringify(fullHierarchy)));
            setHierarchy(filteredData);
        }
        setFilterDialogOpen(false);
    };

    const resetFilters = () => {
        setFilters({
            fromDate: today,
            toDate: today,
            groupName: null,
            accountName: null,
            ledgerName: null
        });
        setHierarchy(fullHierarchy);
    };

    useEffect(() => {
        fetchExpenseHierarchy();
    }, [filters.fromDate, filters.toDate]);

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Expense Hierarchy</Typography>
                <Box>
                    <Tooltip title="Reset filters">
                        <IconButton onClick={resetFilters} sx={{ mr: 1 }}>
                            <ClearAll />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Filter options">
                        <IconButton
                            color="primary"
                            onClick={() => setFilterDialogOpen(true)}
                            sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)' }}
                        >
                            <FilterList />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Filter Options</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} sx={{ pt: 2 }}>
                        <TextField
                            type="date"
                            label="From Date"
                            value={filters.fromDate}
                            onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />
                        <TextField
                            type="date"
                            label="To Date"
                            value={filters.toDate}
                            onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                        />


                        <Autocomplete
                            options={filterOptions.accountNames}
                            value={filters.accountName}
                            onChange={(e, newValue) => setFilters({ ...filters, accountName: newValue })}
                            renderInput={(params) => (
                                <TextField {...params} label="Account Name" fullWidth />
                            )}
                            freeSolo
                        />


                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilterDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={applyFilters}
                        disabled={loading}
                    >
                        Apply Filters
                    </Button>
                </DialogActions>
            </Dialog>

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
            ) : hierarchy.length === 0 ? (
                <Paper sx={{ p: 2, textAlign: "center" }}>
                    <Typography>No expense data available</Typography>
                </Paper>
            ) : (
                hierarchy.map(group => (
                    <ExpenseNode key={group.group_id} node={group} />
                ))
            )}
        </Box>
    );
};

export default ExpenseHierarchy;