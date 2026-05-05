import { useState, useEffect } from 'react';
import FilterableTable, { createCol, ButtonActions } from "../../Components/filterableTable2";
import {
    Box, Chip, Typography, Skeleton, TextField, InputAdornment,
    Tab, Tabs, Paper, Autocomplete, CircularProgress, Button as MuiButton, FormControlLabel, Checkbox
} from '@mui/material';
import { getSessionUser, toNumber } from "../../Components/functions";
import { fetchLink } from '../../Components/fetchComponent';
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Add, Edit, Search, FilterAlt, Refresh } from "@mui/icons-material";
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Delete } from '@mui/icons-material';


const fmtINR = (n) =>
    n == null ? '—' : '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TYPE_CONFIG = {
    0: { label: 'Wastage Adjustment', color: 'warning' },
    1: { label: 'Value Adjustment', color: 'info' },
};

const TypeBadge = ({ type }) => {
    const cfg = TYPE_CONFIG[type] || { label: type, color: 'default' };
    return <Chip label={cfg.label} color={cfg.color} size="small" sx={{ fontWeight: 600, fontSize: 11 }} />;
};


const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ paddingTop: 16 }}>
        {value === index && children}
    </div>
);


const PendingDetailsTab = () => {
    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString().split('T')[0];

    const [fromDate, setFromDate] = useState(firstOfMonth);
    const [toDate, setToDate] = useState(today);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [pendingList, setPendingList] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingData, setLoadingData] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const [showZero, setShowZero] = useState(false);
    const [selectedAdjustmentType, setSelectedAdjustmentType] = useState(null);
    const [selectedGodown, setSelectedGodown] = useState(null); // New state for godown filter
    const [godownOptions, setGodownOptions] = useState([]); // New state for godown dropdown options

    // Adjustment type options
    const adjustmentTypes = [
        { value: 'Value Adjustment', label: 'Value Adjustment' },
        { value: 'Wastage Adjustment', label: 'Wastage Adjustment' }
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            setLoadingProducts(true);
            try {
                const data = await fetchLink({ address: `masters/products/dropdown` });
                if (data && data.success) {
                    setProducts(data.data || []);
                }
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoadingProducts(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        fetchPendingData(firstOfMonth, today);
    }, []);

    const fetchPendingData = async () => {
        if (!fromDate || !toDate) return;
      
        setLoadingData(true);
        setHasFetched(true);
        try {
            const data = await fetchLink({
                address: `inventory/getStockAdjustment?Fromdate=${fromDate}&Todate=${toDate}`,
                method: "GET",
            });
            if (data && data.success) {
                setPendingList(data.data || []);
                
                // Extract unique godown names from the fetched data
                const uniqueGodowns = [...new Map(
                    data.data
                        .filter(item => item.Godown_Name) // Filter out null/undefined
                        .map(item => [item.Godown_Name, { value: item.Godown_Name, label: item.Godown_Name }])
                ).values()];
                
                setGodownOptions(uniqueGodowns);
            }
        } catch (err) {
            console.error('Error fetching pending data:', err);
        } finally {
            setLoadingData(false);
        }
    };

    const displayedList = (() => {
        let result = pendingList;

        // Filter by product
        if (selectedProduct) {
            result = result.filter(
                (row) => String(row.name_item_id) === String(selectedProduct.Product_Id)
            );
        }

        // Filter by adjustment type
        if (selectedAdjustmentType) {
            result = result.filter(
                (row) => row.Adjustment_Type === selectedAdjustmentType
            );
        }

        // Filter by godown
        if (selectedGodown) {
            result = result.filter(
                (row) => row.Godown_Name === selectedGodown
            );
        }

        // Filter out zero values if showZero is false
        if (!showZero) {
            result = result.filter(
                (row) =>
                    (row.bill_qty != null && Number(row.bill_qty) !== 0) &&
                    (row.amount != null && Number(row.amount) !== 0)
            );
        }

        return result;
    })();

    const zeroCount = pendingList.filter(
        (row) =>
            (row.bill_qty == null || Number(row.bill_qty) === 0) ||
            (row.amount == null || Number(row.amount) === 0)
    ).length;

    const pendingColumns = [
        {
            ...createCol('Item_Name', 'string', 'Product Name', 'left'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2">{row.Item_Name || '—'}</Typography>
            ),
        },
        {
            ...createCol('Godown_Name', 'string', 'Godown', 'left'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2">{row.Godown_Name || '—'}</Typography>
            ),
        },
        {
            ...createCol('bill_qty', 'number', 'Bill Qty', 'right'),
            isCustomCell: true,
            Cell: ({ row }) => {
                const isZero = row.bill_qty == null || Number(row.bill_qty) === 0;
                return (
                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: 'right',
                            color: isZero ? '#ef4444' : 'inherit',
                            fontWeight: isZero ? 700 : 400,
                        }}
                    >
                        {row.bill_qty?.toFixed(2) ?? '0.00'}
                    </Typography>
                );
            },
        },
        {
            ...createCol('amount', 'number', 'Rate (₹)', 'right'),
            isCustomCell: true,
            Cell: ({ row }) => {
                const isZero = row.amount == null || Number(row.amount) === 0;
                return (
                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: 'right',
                            color: isZero ? '#ef4444' : 'inherit',
                            fontWeight: isZero ? 700 : 400,
                        }}
                    >
                        {fmtINR(row.amount)}
                    </Typography>
                );
            },
        },
        {
            ...createCol('Adjustment_Type', 'number', 'Adjustment Type', 'right'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                    {row.Adjustment_Type}
                </Typography>
            ),
        },
    ];

    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    border: '1px solid #e5e7eb',
                    borderRadius: 2,
                    bgcolor: '#fff',
                }}
            >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                    <TextField
                        label="From Date"
                        type="date"
                        size="small"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 160 }}
                    />

                    <TextField
                        label="To Date"
                        type="date"
                        size="small"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 160 }}
                    />

                    <Autocomplete
                        options={products}
                        getOptionLabel={(opt) => opt.Product_Name || ''}
                        value={selectedProduct}
                        onChange={(_, val) => setSelectedProduct(val)}
                        loading={loadingProducts}
                        size="small"
                        sx={{ minWidth: 280 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Filter by Product"
                                placeholder="Select a product…"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingProducts ? (
                                                <CircularProgress color="inherit" size={16} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                        isOptionEqualToValue={(opt, val) =>
                            opt.Product_Id === val?.Product_Id
                        }
                    />

                    {/* Godown Filter */}
                    <Autocomplete
                        options={godownOptions}
                        getOptionLabel={(opt) => opt.label}
                        value={godownOptions.find(opt => opt.value === selectedGodown) || null}
                        onChange={(_, val) => setSelectedGodown(val ? val.value : null)}
                        size="small"
                        sx={{ minWidth: 220 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Filter by Godown"
                                placeholder="All Godowns"
                            />
                        )}
                        isOptionEqualToValue={(opt, val) => opt.value === val?.value}
                        disabled={!hasFetched || godownOptions.length === 0}
                    />

                    {/* Adjustment Type Filter */}
                    <Autocomplete
                        options={adjustmentTypes}
                        getOptionLabel={(opt) => opt.label}
                        value={adjustmentTypes.find(opt => opt.value === selectedAdjustmentType) || null}
                        onChange={(_, val) => setSelectedAdjustmentType(val ? val.value : null)}
                        size="small"
                        sx={{ minWidth: 220 }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Adjustment Type"
                                placeholder="All Types"
                            />
                        )}
                        isOptionEqualToValue={(opt, val) => opt.value === val?.value}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showZero}
                                onChange={(e) => setShowZero(e.target.checked)}
                                size="small"
                                sx={{
                                    color: '#ef4444',
                                    '&.Mui-checked': { color: '#ef4444' },
                                }}
                            />
                        }
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#374151' }}>
                                    Show Zero
                                </Typography>
                            </Box>
                        }
                        sx={{ m: 0 }}
                    />

                    <Button
                        variant="contained"
                        startIcon={loadingData ? <CircularProgress size={16} color="inherit" /> : <FilterAlt />}
                        onClick={fetchPendingData}
                        disabled={loadingData}
                        sx={{ height: 40 }}
                    >
                        {loadingData ? 'Loading…' : 'Fetch'}
                    </Button>

                    {selectedProduct && (
                        <MuiButton
                            variant="outlined"
                            size="small"
                            startIcon={<Refresh />}
                            onClick={() => setSelectedProduct(null)}
                            sx={{ height: 40 }}
                        >
                            Clear Filter
                        </MuiButton>
                    )}

                    {selectedAdjustmentType && (
                        <MuiButton
                            variant="outlined"
                            size="small"
                            startIcon={<Refresh />}
                            onClick={() => setSelectedAdjustmentType(null)}
                            sx={{ height: 40 }}
                        >
                            Clear Type Filter
                        </MuiButton>
                    )}

                    {selectedGodown && (
                        <MuiButton
                            variant="outlined"
                            size="small"
                            startIcon={<Refresh />}
                            onClick={() => setSelectedGodown(null)}
                            sx={{ height: 40 }}
                        >
                            Clear Godown Filter
                        </MuiButton>
                    )}
                </Box>
            </Paper>

            {loadingData ? (
                <Box sx={{ p: 2 }}>
                    {[...Array(5)].map((_, i) => (
                        <Skeleton
                            key={i}
                            variant="rectangular"
                            height={44}
                            sx={{ mb: 1, borderRadius: 1 }}
                        />
                    ))}
                </Box>
            ) : !hasFetched ? (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        color: 'text.secondary',
                        border: '1px dashed #d1d5db',
                        borderRadius: 2,
                        bgcolor: '#fff',
                    }}
                >
                    <FilterAlt sx={{ fontSize: 48, mb: 1, opacity: 0.3 }} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        Select date range and click <strong>Fetch</strong> to load pending details
                    </Typography>
                </Box>
            ) : displayedList.length === 0 ? (
                <Box
                    sx={{
                        textAlign: 'center',
                        py: 6,
                        color: 'text.secondary',
                        border: '1px dashed #d1d5db',
                        borderRadius: 2,
                        bgcolor: '#fff',
                    }}
                >
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        No records found for the selected filters
                    </Typography>
                </Box>
            ) : (
                <FilterableTable
                    dataArray={displayedList}
                    columns={pendingColumns}
                    EnableSerialNumber={true}
                    CellSize="medium"
                    bodyFontSizePx={13}
                    headerFontSizePx={13}
                    initialPageCount={20}
                    title={
                        selectedProduct
                            ? `Pending Details — ${selectedProduct.Product_Name}`
                            : selectedAdjustmentType
                            ? `Pending Details — ${selectedAdjustmentType} (${fromDate} to ${toDate})`
                            : selectedGodown
                            ? `Pending Details — ${selectedGodown} (${fromDate} to ${toDate})`
                            : `Pending Details (${fromDate} to ${toDate})`
                    }
                    ExcelPrintOption={true}
                    PDFPrintOption={true}
                    maxHeightOption={true}
                    tableMaxHeight={600}
                />
            )}
        </Box>
    );
};

const StockAdjustmentPage = ({ EditRights }) => {
    const [adjustments, setAdjustments] = useState([]);
    const [filteredAdjustments, setFilteredAdjustments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    const today = new Date().toISOString().split('T')[0];
    const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const [fromDate, setFromDate] = useState(firstOfMonth);
    const [toDate, setToDate] = useState(today);

    const navigate = useNavigate();
    const storage = getSessionUser().user;
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalAdjPayment, setTotalAdjPayment] = useState(0);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, row: null });
    const [deleting, setDeleting] = useState(false);
    const [search,setSearch]=useState(false)

    const handleDelete = async () => {
        if (!deleteDialog.row) return;
        setDeleting(true);
        try {
            const data = await fetchLink({
                address: `inventory/getStockAdjustment?Aj_id=${deleteDialog.row.Aj_id}`,
                method: 'DELETE'
            });
            if (data && data.success) {
                setDeleteDialog({ open: false, row: null });
                fetchAdjustments(); 
            }
        } catch (err) {
            console.error('Delete error:', err);
        } finally {
            setDeleting(false);
        }
    };


    const fetchAdjustments = async () => {
        setLoading(true);
        try {
            let address = `inventory/getStockAdjustments`;

            const queryParams = [];
            if (fromDate) queryParams.push(`fromdate=${fromDate}`);
            if (toDate) queryParams.push(`todate=${toDate}`);

            if (queryParams.length > 0) {
                address += `?${queryParams.join('&')}`;
            }

            const data = await fetchLink({ address: address });

            if (data && data.success) {
                const list = data.data || [];
                setAdjustments(list);
                setFilteredAdjustments(list);

         
                const amount = list.reduce((acc, row) => acc + (parseFloat(row.amount) || 0), 0);
                const adjPayment = list.reduce((acc, row) => acc + (parseFloat(row.Adj_Payment) || 0), 0);
                setTotalAmount(amount);
                setTotalAdjPayment(adjPayment);
            }
        } catch (error) {
            console.error('Error fetching adjustments:', error);
        } finally {
            setLoading(false);
        }
    };

    // useEffect(() => {
    //     fetchAdjustments();
    // }, [fromDate, toDate]);

          useEffect(() => {
              fetchAdjustments();
          }, []);


    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredAdjustments(adjustments);
            return;
        }
        const lower = searchTerm.toLowerCase().trim();
        setFilteredAdjustments(
            adjustments.filter((item) => {
                if (item.invoice_no?.toLowerCase().includes(lower)) return true;
                if (item.Product_Name?.toLowerCase().includes(lower)) return true;
                if (item.narration?.toLowerCase().includes(lower)) return true;
                if (item.godown_name?.toLowerCase().includes(lower)) return true;
                const typeLabel = TYPE_CONFIG[item.Adjust_Type]?.label || '';
                if (typeLabel.toLowerCase().includes(lower)) return true;
                if (item.Adj_date?.split('T')[0].includes(lower)) return true;
                return false;
            })
        );
    }, [searchTerm, adjustments]);

    const columns = [
        {
            ...createCol('invoice_no', 'string', 'Invoice No', 'left'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                    {row.invoice_no}
                </Typography>
            ),
        },
        {
            ...createCol('Adj_date', 'date', 'Date', 'left'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2">
                    {row.Adj_date ? row.Adj_date.split('T')[0] : '—'}
                </Typography>
            ),
        },
        {
            ...createCol('godown_name', 'string', 'Godown', 'left'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2">{row.godown_name || '—'}</Typography>
            ),
        },
        {
            ...createCol('Adjust_Type', 'string', 'Type', 'center'),
            isCustomCell: true,
            Cell: ({ row }) => <TypeBadge type={row.Adjust_Type} />,
        },
        {
            ...createCol('Product_Name', 'string', 'Product Name', 'left'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2">{row.Product_Name || '—'}</Typography>
            ),
        },
        {
            ...createCol('bill_qty', 'number', 'Bill Qty', 'right'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ textAlign: 'right' }}>
                    {row.bill_qty?.toFixed(2) || '0.00'}
                </Typography>
            ),
        },
        {
            ...createCol('act_qty', 'number', 'Actual Qty', 'right'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ textAlign: 'right' }}>
                    {row.act_qty?.toFixed(2) || '0.00'}
                </Typography>
            ),
        },
        {
            ...createCol('rate', 'number', 'Rate (₹)', 'right'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ textAlign: 'right' }}>
                    {fmtINR(row.rate)}
                </Typography>
            ),
        },
        {
            ...createCol('amount', 'number', 'Amount (₹)', 'right'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                    {fmtINR(row.amount)}
                </Typography>
            ),
        },
        {
            ...createCol('Adj_Payment', 'number', 'Adj Payment (₹)', 'right'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ textAlign: 'right' }}>
                    {fmtINR(row.Adj_Payment)}
                </Typography>
            ),
        },
       
        {
            ...createCol('narration', 'string', 'Narration', 'left'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ maxWidth: 200 }}>
                    {row.narration || '—'}
                </Typography>
            ),
        },
        {
            ...createCol('action', 'string', 'Action', 'center'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <ButtonActions
                    buttonsData={[
                        {
                            name: 'Edit',
                            onclick: () => {
                                navigate('Create', {
                                    state: {
                                        ...row,
                                        Aj_id: row.Aj_id,
                                        invoice_no: row.invoice_no,
                                        isEdit: true,
                                    },
                                });
                            },
                            icon: <Edit fontSize="small" color="primary" />,
                        },
                        {
                            name: 'Delete',
                            onclick: () => setDeleteDialog({ open: true, row }),
                            icon: <Delete fontSize="small" color="error" />,
                        },
                    ]}
                />
            ),
        },
    ];

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={50} sx={{ mb: 1 }} />
                <Skeleton variant="rectangular" height={50} />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: '#f9fafb', minHeight: '100vh' }}>
            {/* Page Header */}
            <Box
                sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
                    Stock Adjustments
                </Typography>

                {/* Date filters and actions */}
                {activeTab === 0 && (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            label="From Date"
                            type="date"
                            size="small"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 160 }}
                        />
                        <TextField
                            label="To Date"
                            type="date"
                            size="small"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            sx={{ minWidth: 160 }}
                        />
                        <TextField
                            placeholder="Search by invoice, product, godown..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            size="small"
                            sx={{ minWidth: 250 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search sx={{ color: 'text.secondary', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        
                        <Button
                            variant="contained"
                            // startIcon={<Refresh />}
                            onClick={fetchAdjustments}
                            sx={{ height: 40 }}
                        >
                            Search
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() =>
                                navigate('/erp/inventory/StockJournalAdjustment/Create')
                            }
                            sx={{ height: 40 }}
                        >
                            Add Adjustment
                        </Button>
                        <Typography variant="body2" sx={{ ml: 'auto', fontWeight: 'bold', color: 'text.primary' }}>
                              Total Amount: ₹ {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Typography>
                    </Box>
                )}  
            </Box>

            {/* Tabs */}
            <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #e5e7eb', bgcolor: '#fff' }}>
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    sx={{
                        px: 2,
                        borderBottom: '1px solid #e5e7eb',
                        '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: 14 },
                        '& .Mui-selected': { color: '#4f46e5' },
                        '& .MuiTabs-indicator': { backgroundColor: '#4f46e5' },
                    }}
                >
                    <Tab label="Stock Adjustments" />
                    <Tab label="Pending Details" />
                </Tabs>

                <Box sx={{ p: 2 }}>
                    <TabPanel value={activeTab} index={0}>
                        <FilterableTable
                            dataArray={filteredAdjustments}
                            columns={columns}
                            EnableSerialNumber={true}
                            CellSize="medium"
                            bodyFontSizePx={13}
                            headerFontSizePx={13}
                            initialPageCount={20}
                            title={`Stock Adjustment Records (${fromDate} to ${toDate})`}
                            ExcelPrintOption={true}
                            PDFPrintOption={true}
                            maxHeightOption={true}
                            tableMaxHeight={600}
                        />
                    </TabPanel>

                    <TabPanel value={activeTab} index={1}>
                        <PendingDetailsTab />
                    </TabPanel>
                </Box>
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => !deleting && setDeleteDialog({ open: false, row: null })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#dc2626', fontWeight: 700 }}>
                    <Delete fontSize="small" color="error" />
                    Confirm Delete
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body2" sx={{ color: '#374151', mb: 1 }}>
                        Are you sure you want to delete this adjustment?
                    </Typography>
                    {deleteDialog.row && (
                        <Paper
                            elevation={0}
                            sx={{ p: 1.5, bgcolor: '#fef2f2', border: '1px solid #fecaca', borderRadius: 2 }}
                        >
                            <Typography variant="body2">
                                <strong>Invoice No:</strong> {deleteDialog.row.invoice_no}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Product:</strong> {deleteDialog.row.Product_Name || '—'}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Amount:</strong> {fmtINR(deleteDialog.row.amount)}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Date:</strong> {deleteDialog.row.Adj_date?.split('T')[0] || '—'}
                            </Typography>
                        </Paper>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <MuiButton
                        variant="outlined"
                        onClick={() => setDeleteDialog({ open: false, row: null })}
                        disabled={deleting}
                    >
                        Cancel
                    </MuiButton>
                    <MuiButton
                        variant="contained"
                        color="error"
                        onClick={handleDelete}
                        disabled={deleting}
                        startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <Delete />}
                    >
                        {deleting ? 'Deleting…' : 'Delete'}
                    </MuiButton>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StockAdjustmentPage;