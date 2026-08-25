import React, { useEffect, useState, useMemo } from 'react';
import { fetchLink } from '../../../Components/fetchComponent';
import { ISOString, isEqualNumber } from '../../../Components/functions';
import AppTableComponent from '../../../Components/appTable/appTableComponent';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { FilterAlt } from '@mui/icons-material';

const BatchDetailsList = ({ loadingOn, loadingOff }) => {
    const [dataArray, setDataArray] = useState([]);
    
    const [filterDialog, setFilterDialog] = useState(false);
    const [dateFilter, setDateFilter] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        stockStatus: 'all' // 'all', 'available', 'negative', 'zero'
    });

    const [appliedFilter, setAppliedFilter] = useState({
        Fromdate: '',
        Todate: '',
        stockStatus: 'all'
    });

    useEffect(() => {
        let queryParams = `?stockStatus=${appliedFilter.stockStatus}`;
        if (appliedFilter.Fromdate && appliedFilter.Todate) {
            queryParams += `&Fromdate=${appliedFilter.Fromdate}&Todate=${appliedFilter.Todate}`;
        }

        fetchLink({
            address: `inventory/batchProcess/getBatchWithDetails${queryParams}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setDataArray(data.data);
            } else {
                setDataArray([]);
            }
        }).catch(e => {
            console.error(e);
            setDataArray([]);
        });
    }, [appliedFilter]);

    const handleApplyFilter = () => {
        setAppliedFilter({
            Fromdate: dateFilter.Fromdate,
            Todate: dateFilter.Todate,
            stockStatus: dateFilter.stockStatus
        });
        setFilterDialog(false);
    };

    const handleClearDateFilter = () => {
        setAppliedFilter(prev => ({
            ...prev,
            Fromdate: '',
            Todate: ''
        }));
        setDateFilter(prev => ({
            ...prev,
            Fromdate: ISOString(),
            Todate: ISOString()
        }));
        setFilterDialog(false);
    };

    const columns = useMemo(() => {
        return [
            { Field_Name: 'transDate', Fied_Data: 'date', ColumnHeader: 'Trans Date', isVisible: 1 },
            { Field_Name: 'batchNo', Fied_Data: 'string', ColumnHeader: 'Batch', isVisible: 1 },
            { Field_Name: 'batchAlias', Fied_Data: 'string', ColumnHeader: 'System Alias', isVisible: 0 },
            { Field_Name: 'productName', Fied_Data: 'string', ColumnHeader: 'Product', isVisible: 1 },
            { Field_Name: 'godownName', Fied_Data: 'string', ColumnHeader: 'Godown', isVisible: 1 },
            { Field_Name: 'inwardQty', Fied_Data: 'number', ColumnHeader: 'Inward Qty', isVisible: 0 },
            { Field_Name: 'consumedQty', Fied_Data: 'number', ColumnHeader: 'Consumed Qty', isVisible: 1 },
            { 
                Field_Name: 'availableQty', 
                Fied_Data: 'number', 
                ColumnHeader: 'Available Qty', 
                isVisible: 1,
                isCustomCell: true,
                Cell: ({ row }) => {
                    const val = Number(row.availableQty) || 0;
                    let color = 'inherit';
                    if (val < 0) color = '#d32f2f'; // red
                    else if (val > 0) color = '#2e7d32'; // green
                    return (
                        <span style={{ color, fontWeight: 'bold' }}>
                            {val.toLocaleString()}
                        </span>
                    );
                }
            },
        ];
    }, []);

    return (
        <>
            <AppTableComponent
                title="Detailed Batch Listing"
                dataArray={dataArray}
                columns={columns}
                EnableSerialNumber
                tableMaxHeight={700}
                ButtonArea={
                    <Tooltip title="Filters (Date & Stock)">
                        <IconButton onClick={() => setFilterDialog(true)} size="small">
                            <FilterAlt />
                        </IconButton>
                    </Tooltip>
                }
            />

            <Dialog open={filterDialog} onClose={() => setFilterDialog(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Filter Batches</DialogTitle>
                <DialogContent>
                    <div className="d-flex flex-column gap-3 mt-3">
                        <FormControl size="small" fullWidth>
                            <InputLabel>Stock Status</InputLabel>
                            <Select
                                value={dateFilter.stockStatus}
                                onChange={(e) => setDateFilter({ ...dateFilter, stockStatus: e.target.value })}
                                label="Stock Status"
                            >
                                <MenuItem value="all">All Batches</MenuItem>
                                <MenuItem value="available">Positive Stock (\u003e0)</MenuItem>
                                <MenuItem value="negative">Negative Stock (\u003c0)</MenuItem>
                                <MenuItem value="zero">Zero Stock (=0)</MenuItem>
                            </Select>
                        </FormControl>

                        <div className="d-flex flex-column gap-2">
                            <label className="text-muted" style={{ fontSize: '0.85rem' }}>Transaction Date (Optional)</label>
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={dateFilter.Fromdate}
                                onChange={(e) => setDateFilter({ ...dateFilter, Fromdate: e.target.value })}
                            />
                            <input
                                type="date"
                                className="form-control form-control-sm"
                                value={dateFilter.Todate}
                                onChange={(e) => setDateFilter({ ...dateFilter, Todate: e.target.value })}
                            />
                        </div>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClearDateFilter} color="secondary">
                        Clear Dates
                    </Button>
                    <Button onClick={() => setFilterDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleApplyFilter} variant="contained" color="primary">
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default BatchDetailsList;
