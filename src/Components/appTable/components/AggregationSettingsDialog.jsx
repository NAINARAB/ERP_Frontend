import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Table, TableHead, TableBody, TableRow, TableCell,
    Select, MenuItem, FormControl
} from '@mui/material';
import { randomNumber } from '../../functions';

const AGGREGTION_OPTIONS = [
    { value: '', label: 'Default' },
    { value: 'sum', label: 'Sum' },
    // { value: 'avg', label: 'Average (Mean)' },
    { value: 'mean', label: 'Average' },
    { value: 'median', label: 'Median' },
    { value: 'min', label: 'Min' },
    { value: 'max', label: 'Max' },
    { value: 'count', label: 'Count' },
];

const AggregationSettingsDialog = ({
    open,
    onClose,
    columns,
    onUpdateAggregation
}) => {

    const getDefaultAggregation = (type) => {
        switch (type) {
            case 'number': return 'Sum';
            case 'date':
            case 'time': return 'Max'; // Latest
            default: return 'Count';
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Column Aggregations</DialogTitle>
            <DialogContent dividers>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Column</TableCell>
                            <TableCell>Data Type</TableCell>
                            <TableCell>Default Aggregation</TableCell>
                            <TableCell>Custom Aggregation</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {columns.filter(c => !c.isCustomCell && c.isVisible == 1).map((col) => (
                            <TableRow key={randomNumber()}>
                                <TableCell>{col.ColumnHeader || col.Field_Name}</TableCell>
                                <TableCell>{col.Fied_Data || 'string'}</TableCell>
                                <TableCell className="text-muted">
                                    {getDefaultAggregation(col.Fied_Data)}
                                </TableCell>
                                <TableCell>
                                    <FormControl size="small" fullWidth>
                                        <Select
                                            value={col.Aggregation || ''}
                                            onChange={(e) => onUpdateAggregation(col.Field_Name, e.target.value)}
                                            displayEmpty
                                        >
                                            {AGGREGTION_OPTIONS.map(opt => (
                                                <MenuItem key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained" color="primary">Done</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AggregationSettingsDialog;
