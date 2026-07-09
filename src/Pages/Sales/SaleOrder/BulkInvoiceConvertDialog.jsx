import { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, FormControl, InputLabel, Select, MenuItem, TextField, Grid
} from '@mui/material';
import { fetchLink } from '../../../Components/fetchComponent';
import { toast } from 'react-toastify';
import { checkIsNumber } from '../../../Components/functions';

const BulkInvoiceConvertDialog = ({
    open,
    onClose,
    selectedOrders = [],
    voucherTypes = [],
    godowns = [],
    stockLedgers = [],
    onSuccess,
    userInfo
}) => {
    const [formData, setFormData] = useState({
        Voucher_Type: '',
        Do_Date: new Date().toISOString().split('T')[0],
        Stock_Item_Ledger_Name: '',
        backupGodownId: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (!checkIsNumber(formData.Voucher_Type) || !formData.Do_Date || !formData.Stock_Item_Ledger_Name || !checkIsNumber(formData.backupGodownId)) {
            toast.warning('Please fill all required fields');
            return;
        }

        if (selectedOrders.length === 0) {
            toast.warning('No orders selected for conversion');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                Created_by: userInfo?.UserId,
                SaleOrders: selectedOrders
            };

            const response = await fetchLink({
                address: 'sales/salesInvoice/bulkConvert',
                method: 'POST',
                bodyData: payload,
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.success) {
                toast.success(response.message || 'Invoices created successfully');
                onSuccess && onSuccess();
                onClose();
            } else {
                toast.error(response.message || 'Failed to convert invoices');
            }
        } catch (error) {
            console.error(error);
            toast.error('An error occurred during conversion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Bulk Convert to Sales Invoice</DialogTitle>
            <DialogContent dividers>
                <div className="mb-3 text-muted fa-13">
                    Selected Orders: <strong>{selectedOrders.length}</strong>
                </div>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Voucher Type</InputLabel>
                            <Select
                                name="Voucher_Type"
                                value={formData.Voucher_Type}
                                label="Voucher Type"
                                onChange={handleChange}
                            >
                                {voucherTypes.map((v) => (
                                    <MenuItem key={v.Vocher_Type_Id} value={v.Vocher_Type_Id}>
                                        {v.Voucher_Type}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <input
                            className='cus-inpt p-2'
                            type="date"
                            value={formData.Do_Date}
                            onChange={e => setFormData({ ...formData, Do_Date: e.target.value })}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Stock Ledger</InputLabel>
                            <Select
                                name="Stock_Item_Ledger_Name"
                                value={formData.Stock_Item_Ledger_Name}
                                label="Stock Ledger"
                                onChange={handleChange}
                            >
                                {stockLedgers.map((l, i) => (
                                    <MenuItem key={i} value={l.Stock_Item_Ledger_Name}>
                                        {l.Stock_Item_Ledger_Name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="small" required>
                            <InputLabel>Backup Godown</InputLabel>
                            <Select
                                name="backupGodownId"
                                value={formData.backupGodownId}
                                label="Backup Godown"
                                onChange={handleChange}
                            >
                                {godowns.map((g) => (
                                    <MenuItem key={g.Godown_Id} value={g.Godown_Id}>
                                        {g.Godown_Name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading} color="inherit">Cancel</Button>
                <Button onClick={handleSubmit} disabled={loading} variant="contained" color="primary">
                    {loading ? 'Converting...' : 'Convert Now'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BulkInvoiceConvertDialog;
