import { useState, useEffect } from 'react';
import FilterableTable, { createCol, ButtonActions } from "../../Components/filterableTable2";
import {
    Box, Chip, Typography, Skeleton
} from '@mui/material';
import { Addition, getSessionFiltersByPageId, getSessionUser, isEqualNumber, ISOString, LocalDateWithTime, NumberFormat, reactSelectFilterLogic, setSessionFilters, toArray, toNumber } from "../../Components/functions";
import { fetchLink } from '../../Components/fetchComponent';
import { Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Add, Edit, FilterAlt, Print, Search, Sync, Visibility } from "@mui/icons-material";
import {  Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
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

const DetailsTable = ({ details = [] }) => {
    const columns = [
        createCol('Product_Name', 'string', 'Product Name', 'left'),
        createCol('bill_qty', 'number', 'Bill Qty', 'right'),
        createCol('act_qty', 'number', 'Actual Qty', 'right'),
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
            ...createCol('Adj_Payment', 'number', 'Adj Payment', 'right'),
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ textAlign: 'right' }}>
                    {fmtINR(row.Adj_Payment)}
                </Typography>
            ),
        },
    ];

    if (!details.length) {
        return (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary', bgcolor: '#f5f5f5' }}>
                No details found for this adjustment
            </Box>
        );
    }

    return (
        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
            <FilterableTable
                dataArray={details}
                columns={columns}
                disablePagination
                EnableSerialNumber
                bodyFontSizePx={12}
                headerFontSizePx={12}
                CellSize="small"
                title="Adjustment Details"
            />
        </Box>
    );
};

const canEditNow = (invoiceDate) => {
    const storage = getSessionUser().user;
    const allowedUserTypesForPreviousDateSalesEdit = [0, 1];
    const isAllowedUser = allowedUserTypesForPreviousDateSalesEdit.includes(toNumber(storage.UserTypeId));
    if (isAllowedUser) {
        return true;
    }
    const invoiceDateObj = new Date(invoiceDate);
    const today = new Date();
    const diffInDays = Math.floor((today - invoiceDateObj) / (1000 * 60 * 60 * 24));
    return diffInDays <= 3;
};

const StockAdjustmentPage = ({ EditRights }) => {
    const [adjustments, setAdjustments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [dialog, setDialog] = useState({
        viewDetails: false,
        printInvoice: false,
        deliverySlip: false
    });
    
    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const storage = getSessionUser().user;

    useEffect(() => {
        const fetchAdjustments = async () => {
            setLoading(true);
            try {
                const data = await fetchLink({
                    address: `inventory/getStockAdjustments`,
                });
                
                if (data && data.success) {
                    setAdjustments(data.adjustments || []);
                }
            } catch (error) {
                console.error('Error fetching adjustments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAdjustments();
    }, []);

    const columns = [
        {
            ColumnHeader: 'Invoice No',
            Field_Name: 'invoice_no',
            isVisible: 1,
            align: 'left',
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#4f46e5' }}>
                    {row.invoice_no}
                </Typography>
            ),
        },
        {
            ColumnHeader: 'Date',
            Field_Name: 'Adj_date',
            isVisible: 1,
            align: 'left',
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2">
                    {row.Adj_date ? (row.Adj_date).split('T')[0]: '—'}
                </Typography>
            ),
        },
        // {
        //     ColumnHeader: 'Godown',
        //     Field_Name: 'godown_name',
        //     isVisible: 1,
        //     align: 'left',
        //     isCustomCell: true,
        //     Cell: ({ row }) => (
        //         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        //             <Typography variant="body2">
        //                 {row.godown_name || 'Main Godown'}
        //             </Typography>
        //         </Box>
        //     ),
        // },
        {
            ColumnHeader: 'Type',
            Field_Name: 'Adjust_Type',
            isVisible: 1,
            align: 'center',
            isCustomCell: true,
            Cell: ({ row }) => <TypeBadge type={row.Adjust_Type} />,
        },
        {
            ColumnHeader: 'Total Value',
            Field_Name: 'total_value',
            isVisible: 1,
            align: 'right',
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {fmtINR(row.total_value)}
                </Typography>
            ),
        },
        {
            ColumnHeader: 'Items',
            Field_Name: 'details',
            isVisible: 1,
            align: 'center',
            isCustomCell: true,
            Cell: ({ row }) => (
                <Chip 
                    label={`${row.details?.length || 0} items`}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: 11 }}
                />
            ),
        },
        {
            ColumnHeader: 'Narration',
            Field_Name: 'narration',
            isVisible: 1,
            align: 'left',
            isCustomCell: true,
            Cell: ({ row }) => (
                <Typography variant="body2">
                    {row.narration || '—'}
                </Typography>
            ),
        },
        {
            ColumnHeader: 'Action',
            Field_Name: 'action',
            isVisible: 1,
            align: 'center',
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
        Products_List: row?.details || [], 
        Aj_id:row?.Aj_id,
        invoice_no:row?.invoice_no,
        isEdit: true,
    },
});
                                },
                                icon: <Edit fontSize="small" color="primary" />,
                                // disabled: !EditRights || !canEditNow(row.Adj_date),
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
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mb: 0.25 }}>
                        Stock Adjustments
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => navigate('/erp/inventory/StockJournalAdjustment/Create')}
                >
                    Add Adjustment
                </Button>
            </Box>

            <FilterableTable
                dataArray={adjustments}
                columns={columns}
                isExpendable={true}
                expandableComp={({ row }) => (
                    <DetailsTable details={row?.details || []} />
                )}
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
            />

            {/* View Details Dialog */}
            <Dialog
                open={dialog.viewDetails}
                onClose={() => setDialog(prev => ({ ...prev, viewDetails: false }))}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Adjustment Details - {selectedInvoice?.invoice_no}</DialogTitle>
                <DialogContent>
                    {selectedInvoice && (
                        <DetailsTable details={selectedInvoice.details || []} />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(prev => ({ ...prev, viewDetails: false }))}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Print Dialog */}
            <Dialog
                open={dialog.printInvoice}
                onClose={() => setDialog(prev => ({ ...prev, printInvoice: false }))}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Print Invoice - {selectedInvoice?.invoice_no}</DialogTitle>
                <DialogContent>
                    {/* Add your print component here */}
                    <Typography>Print functionality to be implemented</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialog(prev => ({ ...prev, printInvoice: false }))}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StockAdjustmentPage;