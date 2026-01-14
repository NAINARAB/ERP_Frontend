import {
    Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Button
} from '@mui/material';
import { useState, useEffect } from 'react';

const StateSaveDialog = ({ open, onSave, onClose, defaults = {} }) => {
    const [form, setForm] = useState({
        name: '',
        displayName: '',
        reportUrl: '',
        reportGroup: ''
    });

    useEffect(() => {
        if (open) {
            setForm({
                name: '',
                displayName: '',
                reportUrl: defaults.reportUrl || '',
                reportGroup: defaults.reportGroup || ''
            });
        }
    }, [open, defaults]);

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Save Table State</DialogTitle>

            <DialogContent>
                <div className="d-flex flex-column gap-3 mt-1">
                    <label htmlFor="">State Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value, displayName: e.target.value })}
                        className='cus-inpt'
                        style={{ minWidth: '310px'}}
                    />
                    {/* <TextField
                        label="Display Name"
                        fullWidth
                        size="small"
                        value={form.displayName}
                        onChange={e => setForm({ ...form, displayName: e.target.value })}
                        helperText="Name shown in dropdown"
                    /> */}
                    {/* <TextField
                        label="Report URL"
                        fullWidth
                        size="small"
                        value={form.reportUrl}
                        onChange={e => setForm({ ...form, reportUrl: e.target.value })}
                        disabled // Typically this shouldn't change, but requirements said 4 inputs
                    />
                    <TextField
                        label="Report Group"
                        fullWidth
                        size="small"
                        value={form.reportGroup}
                        onChange={e => setForm({ ...form, reportGroup: e.target.value })}
                        disabled
                    /> */}
                </div>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={() => onSave(form)}
                    disabled={!form.name || !form.displayName}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default StateSaveDialog;
