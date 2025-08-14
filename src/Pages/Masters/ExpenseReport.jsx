import React, { useState, useEffect, useCallback } from "react";
import {
    Paper, Typography, Box, Collapse, IconButton, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, CircularProgress, TextField, Button,
    Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Autocomplete
} from "@mui/material";
import {
    ExpandMore, ExpandLess, AccountTreeOutlined, AccountBalanceOutlined,
    AttachMoneyOutlined, FilterListOutlined, ClearAllOutlined, Add, Remove
} from "@mui/icons-material";
import { NumberFormat } from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";
import { toast } from "react-toastify";

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

const ExpenseNode = ({ node, depth = 0, filters }) => {
    const [expanded, setExpanded] = useState(depth === 0);
    const [childData, setChildData] = useState([]);
    const [loadingChildren, setLoadingChildren] = useState(false);

    const [accountDetails, setAccountDetails] = useState([]);
    const [loadingAccountDetails, setLoadingAccountDetails] = useState(false);
    const [expandedAccountId, setExpandedAccountId] = useState(null);

    const totals = calculateTotals(node);
    const hasChildren = node.children?.length > 0;
    const hasAccounts = node.accounts?.length > 0;
    const isAccountLeaf = !hasChildren && node.Acc_Id;
    const canFetchMore = (!hasChildren && !hasAccounts && node.group_id) || isAccountLeaf;

    const fetchChildData = useCallback(async () => {
        try {
            setLoadingChildren(true);
            const response = await fetchLink({
                address: '/reports/expenseByAccId',
                params: {
                    group_id: node.group_id,
                    fromDate: filters.fromDate,
                    toDate: filters.toDate
                }
            });
            setChildData(response.data || []);
        } catch (err) {
            console.error("Error fetching child data:", err);
            setChildData([]);
        } finally {
            setLoadingChildren(false);
        }
    }, [node.group_id, filters.fromDate, filters.toDate]);



    const fetchAccountDetails = useCallback((accId) => {
        setLoadingAccountDetails(true);
        fetchLink({
            address: 'reports/expenseByAccId',
            method: 'POST',
            bodyData: {
                acc_id: accId,
                fromDate: filters.fromDate,
                toDate: filters.toDate
            },
            headers: { "Content-Type": "application/json" }
        })
            .then((response) => {
                if (response.success) {
                    setAccountDetails((prev) => {

                        const filtered = prev.filter((d) => !d.Acc_Id?.includes(accId.toString()));

                        return [...filtered, ...(response.data || [])];
                    });
                } else {
                    toast.error(response?.message || "Failed to load account details");
                }
            })
            .catch((err) => {
                console.error("Error fetching account details:", err);
                toast.error("Something went wrong while fetching account details");
            })
            .finally(() => {
                setLoadingAccountDetails(false);
            });
    }, [filters.fromDate, filters.toDate]);

    const handleExpandClick = () => {
        if (canFetchMore && !expanded && !childData.length) {
            fetchChildData();
        }
        setExpanded(!expanded);
    };



    const handleAccountExpand = (e, accId) => {
        e.stopPropagation();
        if (expandedAccountId === accId) {
            setExpandedAccountId(null);
        } else {

            setExpandedAccountId(accId);
            if (!accountDetails.some(detail => detail.Acc_Id?.includes(accId.toString()))) {
                fetchAccountDetails(accId);
            }
        }
    };


    return (
        <Box sx={{ ml: depth * 2 }}>
            <Paper sx={{
                mb: 1,
                p: 1,
                backgroundColor: depth === 0 ? "#f5f5f5" : "white",
                overflow: 'hidden'
            }}>
                <Box
                    display="flex"
                    alignItems="center"
                    sx={{
                        cursor: (hasChildren || hasAccounts || canFetchMore) ? "pointer" : "default",
                        minHeight: '48px'
                    }}
                    onClick={handleExpandClick}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flex: '1 1 50%',
                        minWidth: 0
                    }}>
                        {(hasChildren || hasAccounts || canFetchMore) && (
                            <IconButton size="small" sx={{ mr: 1 }}>
                                {expanded ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                        )}
                        {hasChildren
                            ? <AccountTreeOutlined color="primary" sx={{ mr: 1 }} />
                            : <AccountBalanceOutlined color="secondary" sx={{ mr: 1 }} />
                        }
                        <Typography fontWeight="medium" noWrap sx={{ flex: 1 }}>
                            {node.group_name || node.Account_Name || 'Expense'}
                        </Typography>
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        flex: '1 1 50%',
                        justifyContent: 'flex-end',
                        gap: 3,
                        pr: 2
                    }}>
                        <Typography variant="body2" sx={{ minWidth: 120, textAlign: 'right' }}>
                            Debit: ₹{NumberFormat(Number(totals.debit.toFixed(2)))}
                        </Typography>
                        <Typography variant="body2" sx={{ minWidth: 120, textAlign: 'right' }}>
                            Credit: ₹{NumberFormat(Number(totals.credit.toFixed(2)))}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                minWidth: 140,
                                textAlign: 'right',
                                fontWeight: "bold",
                                color: totals.balance >= 0 ? "green" : "red"
                            }}
                        >
                            Balance: ₹{NumberFormat(Math.abs(totals.balance).toFixed(2))}
                            {totals.balance >= 0 ? 'Dr' : 'Cr'}
                        </Typography>
                    </Box>
                </Box>

                <Collapse in={expanded}>
                    {hasAccounts && (
                        <TableContainer sx={{ mt: 1, mb: 1 }}>
                            <Table size="small" sx={{ tableLayout: 'fixed' }}>
                                <colgroup>
                                    <col style={{ width: '50%' }} />
                                    <col style={{ width: '10%' }} />
                                    <col style={{ width: '10%' }} />
                                    <col style={{ width: '10%' }} />
                                </colgroup>
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: "#eeeeee" }}>
                                        <TableCell>Account</TableCell>
                                        <TableCell align="right">Debit</TableCell>
                                        <TableCell align="right">Credit</TableCell>
                                        <TableCell align="right">Balance</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {node.accounts.map(acc => {
                                        const isLeafAccount = !acc.children?.length;
                                        return (
                                            <React.Fragment key={acc.Acc_Id}>
                                                <TableRow hover>
                                                    <TableCell sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        <Box display="flex" alignItems="center">
                                                            <AttachMoneyOutlined fontSize="small" sx={{ mr: 1 }} />
                                                            {acc.Account_Name}
                                                            {isLeafAccount && (
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={(e) => handleAccountExpand(e, acc.Acc_Id)}
                                                                    sx={{ ml: 1 }}
                                                                >
                                                                    {expandedAccountId === acc.Acc_Id
                                                                        ? <Remove fontSize="small" />
                                                                        : <Add fontSize="small" />}
                                                                </IconButton>
                                                            )}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right">₹{NumberFormat(Number(acc.Debit_Amount || 0).toFixed(2))}</TableCell>
                                                    <TableCell align="right">₹{NumberFormat(Number(acc.Credit_Amount || 0).toFixed(2))}</TableCell>
                                                    <TableCell align="right">₹{NumberFormat(Number(acc.Debit_Amount || 0 - acc.Credit_Amount || 0).toFixed(2))}</TableCell>
                                                </TableRow>

                                                {expandedAccountId === acc.Acc_Id && (
                                                    <TableRow>
                                                        <TableCell colSpan={4} sx={{ p: 0, backgroundColor: "#fafafa" }}>
                                                            {loadingAccountDetails ? (
                                                                <Box display="flex" justifyContent="center" p={2}>
                                                                    <CircularProgress size={24} />
                                                                </Box>
                                                            ) : accountDetails.some(detail => detail.Acc_Id?.includes(acc.Acc_Id.toString())) ? (
                                                                <Table size="small" sx={{ tableLayout: "fixed" }}>
                                                                    <colgroup>
                                                                        <col style={{ width: "10%" }} />
                                                                        <col style={{ width: "10%" }} />
                                                                        <col style={{ width: "20%" }} />
                                                                        <col style={{ width: "18%" }} />
                                                                        <col style={{ width: "10%" }} />
                                                                        <col style={{ width: "10%" }} />
                                                                    </colgroup>
                                                                    <TableHead>
                                                                        <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
                                                                            <TableCell>Date</TableCell>
                                                                            <TableCell>Invoice No</TableCell>
                                                                            <TableCell align="left">Particular</TableCell>
                                                                            <TableCell align="right">Debit</TableCell>
                                                                            <TableCell align="right">Credit</TableCell>
                                                                            <TableCell align="right">Balance</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {accountDetails
                                                                            .filter(detail => detail.Acc_Id?.includes(acc.Acc_Id.toString()))
                                                                            .map((detail, idx) => (
                                                                                <TableRow key={`detail-${idx}`}>
                                                                                    <TableCell>
                                                                                        {new Date(detail.Ledger_Date).toLocaleDateString('en-GB', {
                                                                                            day: '2-digit',
                                                                                            month: '2-digit',
                                                                                            year: 'numeric'
                                                                                        }).replace(/\//g, '-')}
                                                                                    </TableCell>
                                                                                    <TableCell>{detail.invoice_no}</TableCell>
                                                                                    <TableCell>{detail.Particulars}</TableCell>
                                                                                    <TableCell align="right">₹{NumberFormat(Number(detail.Debit_Amt || 0).toFixed(2))}</TableCell>
                                                                                    <TableCell align="right">₹{NumberFormat(Number(detail.Credit_Amt || 0).toFixed(2))}</TableCell>
                                                                                    <TableCell align="right">₹{NumberFormat((Number(detail.Debit_Amt || 0) - Number(detail.Credit_Amt || 0)).toFixed(2))}</TableCell>    </TableRow>
                                                                            ))}
                                                                    </TableBody>
                                                                </Table>
                                                            ) : (
                                                                <Typography sx={{ p: 2, color: "text.secondary" }}>
                                                                    No transactions available
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {hasChildren && (
                        <Box sx={{ mt: 1 }}>
                            {node.children.map(child => (
                                <ExpenseNode
                                    key={child.group_id}
                                    node={child}
                                    depth={depth + 1}
                                    filters={filters}
                                />
                            ))}
                        </Box>
                    )}

                    {canFetchMore && expanded && (
                        <Box sx={{ mt: 1 }}>
                            {loadingChildren ? (
                                <Box display="flex" justifyContent="center" p={2}>
                                    <CircularProgress size={24} />
                                </Box>
                            ) : childData.length > 0 ? (
                                childData.map((item) => (
                                    <ExpenseNode
                                        key={item.group_id || item.Acc_Id}
                                        node={item}
                                        depth={depth + 1}
                                        filters={filters}
                                    />
                                ))
                            ) : (
                                <Typography variant="body2" sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
                                    No additional data available
                                </Typography>
                            )}
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
    const [filterOptions, setFilterOptions] = useState({ accountNames: [] });
    const [filters, setFilters] = useState({
        fromDate: today,
        toDate: today,
        accountName: null,
    });

    const extractAccountNames = useCallback((nodes, accountNames = new Set()) => {
        nodes.forEach(node => {
            if (node.accounts?.length) {
                node.accounts.forEach(acc => {
                    if (acc.Account_Name) accountNames.add(acc.Account_Name);
                });
            }
            if (node.children?.length) {
                extractAccountNames(node.children, accountNames);
            }
        });
        return accountNames;
    }, []);

    useEffect(() => {
        if (fullHierarchy.length > 0) {
            const accountNames = extractAccountNames(fullHierarchy);
            setFilterOptions(prev => ({
                ...prev,
                accountNames: Array.from(accountNames).sort(),
            }));
        }
    }, [fullHierarchy, extractAccountNames]);

    const filterHierarchy = useCallback((nodes) => {
        if (!nodes) return [];
        return nodes.reduce((acc, node) => {
            const newNode = { ...node };
            if (newNode.accounts?.length) {
                newNode.accounts = newNode.accounts.filter(acc => {
                    if (filters.accountName && !acc.Account_Name?.toLowerCase().includes(filters.accountName.toLowerCase())) {
                        return false;
                    }
                    return true;
                });
            }
            if (newNode.children?.length) {
                newNode.children = filterHierarchy(newNode.children);
            }
            const hasMatchingAccounts = newNode.accounts?.length > 0;
            const hasMatchingChildren = newNode.children?.length > 0;
            if (hasMatchingAccounts || hasMatchingChildren) {
                acc.push(newNode);
            }
            return acc;
        }, []);
    }, [filters.accountName]);

    const fetchExpenseHierarchy = useCallback(async () => {
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
        } catch (err) {
            console.error("Error fetching expenses:", err);
        } finally {
            setLoading(false);
        }
    }, [filters.fromDate, filters.toDate]);

    const applyFilters = useCallback(() => {
        if (!filters.accountName) {
            setHierarchy(fullHierarchy);
        } else {
            const filteredData = filterHierarchy(JSON.parse(JSON.stringify(fullHierarchy)));
            setHierarchy(filteredData);
        }
        setFilterDialogOpen(false);
    }, [filters.accountName, fullHierarchy, filterHierarchy]);

    const resetFilters = useCallback(() => {
        setFilters({
            fromDate: today,
            toDate: today,
            accountName: null,
        });
        setHierarchy(fullHierarchy);
    }, [fullHierarchy, today]);

    useEffect(() => {
        fetchExpenseHierarchy();
    }, [fetchExpenseHierarchy]);

    return (
        <Box sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Expense Hierarchy</Typography>
                <Box>
                    <Tooltip title="Reset filters">
                        <IconButton onClick={resetFilters} sx={{ mr: 1 }}>
                            <ClearAllOutlined />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Filter options">
                        <IconButton
                            color="primary"
                            onClick={() => setFilterDialogOpen(true)}
                            sx={{ backgroundColor: 'rgba(25, 118, 210, 0.04)' }}
                        >
                            <FilterListOutlined />
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
                    <ExpenseNode
                        key={group.group_id}
                        node={group}
                        filters={filters}
                    />
                ))
            )}
        </Box>
    );
};

export default ExpenseHierarchy;