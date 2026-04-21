import { useState, useEffect } from 'react';
import FilterableTable, { createCol, ButtonActions } from "../../Components/filterableTable2";
import {
    Box, Chip, Typography, Skeleton, TextField, InputAdornment
} from '@mui/material';
import { getSessionUser, toNumber } from "../../Components/functions";
import { fetchLink } from '../../Components/fetchComponent';
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Add, Edit, Search } from "@mui/icons-material";

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

const StockAdjustmentPage = ({ EditRights }) => {
    const [adjustments, setAdjustments] = useState([]);
    const [filteredAdjustments, setFilteredAdjustments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    const navigate = useNavigate();
    const storage = getSessionUser().user;

    useEffect(() => {
        const fetchAdjustments = async () => {
            setLoading(true);
            try {
                const data = await fetchLink({
                    address: `inventory/getStockAdjustments`,
                });
                
                if (data && data.success) {
                    // API now returns flat data array instead of grouped adjustments
                    setAdjustments(data.data || []);
                    setFilteredAdjustments(data.data || []);
                }
            } catch (error) {
                console.error('Error fetching adjustments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdjustments();
    }, []);

    // Search functionality
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredAdjustments(adjustments);
            return;
        }

        const searchTermLower = searchTerm.toLowerCase().trim();
        const filtered = adjustments.filter(item => {
            // Search in invoice number
            if (item.invoice_no?.toLowerCase().includes(searchTermLower)) {
                return true;
            }
            // Search in product name
            if (item.Product_Name?.toLowerCase().includes(searchTermLower)) {
                return true;
            }
            // Search in narration
            if (item.narration?.toLowerCase().includes(searchTermLower)) {
                return true;
            }
            // Search in godown name
            if (item.godown_name?.toLowerCase().includes(searchTermLower)) {
                return true;
            }
            // Search in type
            const typeLabel = TYPE_CONFIG[item.Adjust_Type]?.label || '';
            if (typeLabel.toLowerCase().includes(searchTermLower)) {
                return true;
            }
            // Search in date
            if (item.Adj_date) {
                const formattedDate = item.Adj_date.split('T')[0];
                if (formattedDate.includes(searchTermLower)) {
                    return true;
                }
            }
            return false;
        });
        
        setFilteredAdjustments(filtered);
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
                <Typography variant="body2">
                    {row.godown_name || '—'}
                </Typography>
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
                <Typography variant="body2">
                    {row.Product_Name || '—'}
                </Typography>
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
            ...createCol('total_value', 'number', 'Total Value (₹)', 'right'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>
                    {fmtINR(row.total_value)}
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
            Cell: ({ row }) => {
                return (
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
                        ]}
                    />
                );
            },
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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.25 }}>
                        Stock Adjustments
                    </Typography>
              
                </Box>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        placeholder="Search by invoice, product, godown..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{ minWidth: 300 }}
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
                        startIcon={<Add />}
                        onClick={() => navigate('/erp/inventory/StockJournalAdjustment/Create')}
                    >
                        Add Adjustment
                    </Button>
                </Box>
            </Box>

            <FilterableTable
                dataArray={filteredAdjustments}
                columns={columns}
                EnableSerialNumber={true}
                CellSize="medium"
                bodyFontSizePx={13}
                headerFontSizePx={13}
                initialPageCount={20}
                title="Stock Adjustment Records"
                ExcelPrintOption={true}
                PDFPrintOption={true}
                maxHeightOption={true}
                tableMaxHeight={600}
                // Removed isExpendable since data is now flat
            />
        </Box>
    );
};

export default StockAdjustmentPage;