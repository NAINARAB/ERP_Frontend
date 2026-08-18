import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions,
    Checkbox, Table, TableBody, TableCell, TableContainer, TableHead,
    TableRow, Paper, IconButton
} from '@mui/material';
import { Delete, Close } from '@mui/icons-material';
import { fetchLink } from '../../../Components/fetchComponent';
import Select from 'react-select';
import { customSelectStyles } from '../../../Components/tablecolumn';
import {
    reactSelectFilterLogic, formatDateTimeLocal, ISOString,
    toArray, isEqualNumber
} from '../../../Components/functions';
import RequiredStar from '../../../Components/requiredStar';

const TripGroupCreation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const editData = location.state?.editData || null;

    const [branches, setBranches] = useState([]);
    const [costCenters, setCostCenters] = useState([]);

    const [formData, setFormData] = useState({
        entry_date: ISOString(),
        branch_id: '',
        vehicle_number: '',
        start_km: '',
        end_km: '',
        start_time: '',
        end_time: '',
        prepared_by: '',
        checked_by: '',
        approved_by: ''
    });

    const [selectedTrips, setSelectedTrips] = useState([]);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [availableTrips, setAvailableTrips] = useState([]);
    const [dialogFilters, setDialogFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        BillType: 'MATERIAL INWARD'
    });
    const [tempSelectedTrips, setTempSelectedTrips] = useState([]);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [branchRes, costCenterRes] = await Promise.all([
                    fetchLink({ address: 'masters/branch/dropDown' }),
                    fetchLink({ address: 'dataEntry/costCenter' })
                ]);
                if (branchRes.success) setBranches(toArray(branchRes.data));
                if (costCenterRes.success) setCostCenters(toArray(costCenterRes.data));
            } catch (e) {
                console.error(e);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (editData) {
            setFormData({
                id: editData.id,
                entry_date: editData.entry_date ? editData.entry_date.split('T')[0] : '',
                branch_id: editData.branch_id || '',
                vehicle_number: editData.vehicle_number || '',
                start_km: editData.start_km ?? '',
                end_km: editData.end_km ?? '',
                start_time: editData.start_time ? formatDateTimeLocal(editData.start_time) : '',
                end_time: editData.end_time ? formatDateTimeLocal(editData.end_time) : '',
                prepared_by: editData.prepared_by || '',
                checked_by: editData.checked_by || '',
                approved_by: editData.approved_by || ''
            });
            setSelectedTrips(editData.Trips_List || []);
        }
    }, [editData]);

    const fetchAvailableTrips = async () => {
        try {
            const query = new URLSearchParams({
                ...dialogFilters,
                Branch_Id: formData.branch_id
            }).toString();
            const res = await fetchLink({ address: `inventory/tripGroup/notGrouped?${query}` });
            if (res.success) {
                setAvailableTrips(toArray(res.data));
            } else {
                setAvailableTrips([]);
                toast.info('No available trips found for this criteria');
            }
        } catch (e) {
            toast.error('Failed to load trips');
            console.error(e);
        }
    };

    const openDialog = () => {
        if (!formData.branch_id) {
            toast.warning('Please select a branch first');
            return;
        }
        setTempSelectedTrips([...selectedTrips]);
        setDialogOpen(true);
        fetchAvailableTrips();
    };

    const toggleTripSelection = (trip) => {
        setTempSelectedTrips(prev => {
            const tripId = trip.Trip_Id || trip.trip_id;
            const exists = prev.find(t => isEqualNumber(t.Trip_Id || t.trip_id, tripId));
            if (exists) {
                return prev.filter(t => !isEqualNumber(t.Trip_Id || t.trip_id, tripId));
            } else {
                return [...prev, trip];
            }
        });
    };

    const confirmSelection = () => {
        setSelectedTrips(tempSelectedTrips);
        setDialogOpen(false);
    };

    const removeSelectedTrip = (indexToRemove) => {
        setSelectedTrips(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const handleSave = async () => {
        if (!formData.entry_date) return toast.error('Entry Date is required');
        if (!formData.branch_id) return toast.error('Branch is required');
        if (selectedTrips.length === 0) return toast.error('At least one trip must be selected');

        const payload = {
            ...formData,
            Trips_List: selectedTrips
        };

        try {
            const res = editData?.id
                ? await fetchLink({ address: 'inventory/tripGroup', method: 'PUT', bodyData: payload })
                : await fetchLink({ address: 'inventory/tripGroup', method: 'POST', bodyData: payload });

            if (res.success) {
                toast.success(res.message || 'Trip Group saved successfully');
                navigate('/erp/inventory/tripGroup');
            } else {
                toast.error(res.message || 'Failed to save Trip Group');
            }
        } catch (e) {
            toast.error('An error occurred while saving');
            console.error(e);
        }
    };

    const totalBags = selectedTrips.reduce((acc, t) => acc + (Number(t.Bags_Qty) || 0), 0);
    const totalTonnage = selectedTrips.reduce((acc, t) => acc + (Number(t.Tonnage_Qty) || 0), 0);

    return (
        <div className="container-fluid p-3">
            <div className="card shadow-sm mb-3">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">{editData ? 'Edit Trip Group' : 'Create Trip Group'}</h5>
                    <Button variant="outlined" onClick={() => navigate('/erp/inventory/tripGroup')}>Back</Button>
                </div>
                <div className="card-body">
                    <div className="row px-2">
                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Entry Date <RequiredStar /></label>
                            <input
                                type="date"
                                value={formData.entry_date}
                                onChange={e => setFormData({ ...formData, entry_date: e.target.value })}
                                className="cus-inpt p-2"
                                required
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Branch <RequiredStar /></label>
                            <Select
                                value={{
                                    value: formData.branch_id,
                                    label: branches.find(b => isEqualNumber(b.BranchId, formData.branch_id))?.BranchName || 'Select Branch'
                                }}
                                onChange={e => setFormData({ ...formData, branch_id: e ? e.value : '' })}
                                options={branches.map(b => ({ value: b.BranchId, label: b.BranchName }))}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder="Select Branch"
                                filterOption={reactSelectFilterLogic}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Vehicle Number</label>
                            <input
                                type="text"
                                value={formData.vehicle_number}
                                onChange={e => setFormData({ ...formData, vehicle_number: e.target.value })}
                                className="cus-inpt p-2"
                                placeholder="ex: TN XX YYYY"
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Start KM</label>
                            <input
                                type="number"
                                value={formData.start_km}
                                onChange={e => setFormData({ ...formData, start_km: e.target.value })}
                                className="cus-inpt p-2"
                                placeholder="Kilometers"
                                min={0}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>End KM</label>
                            <input
                                type="number"
                                value={formData.end_km}
                                onChange={e => setFormData({ ...formData, end_km: e.target.value })}
                                className="cus-inpt p-2"
                                placeholder="Kilometers"
                                min={0}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Start Time</label>
                            <input
                                type="datetime-local"
                                value={formData.start_time}
                                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                className="cus-inpt p-2"
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>End Time</label>
                            <input
                                type="datetime-local"
                                value={formData.end_time}
                                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                className="cus-inpt p-2"
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Prepared By</label>
                            <Select
                                value={{
                                    value: formData.prepared_by,
                                    label: costCenters.find(c => isEqualNumber(c.Cost_Center_Id, formData.prepared_by))?.Cost_Center_Name || 'Select Staff'
                                }}
                                onChange={e => setFormData({ ...formData, prepared_by: e ? e.value : '' })}
                                options={costCenters.map(c => ({ value: c.Cost_Center_Id, label: c.Cost_Center_Name }))}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder="Select Staff"
                                filterOption={reactSelectFilterLogic}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Checked By</label>
                            <Select
                                value={{
                                    value: formData.checked_by,
                                    label: costCenters.find(c => isEqualNumber(c.Cost_Center_Id, formData.checked_by))?.Cost_Center_Name || 'Select Staff'
                                }}
                                onChange={e => setFormData({ ...formData, checked_by: e ? e.value : '' })}
                                options={costCenters.map(c => ({ value: c.Cost_Center_Id, label: c.Cost_Center_Name }))}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder="Select Staff"
                                filterOption={reactSelectFilterLogic}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6 px-2 py-1">
                            <label>Approved By</label>
                            <Select
                                value={{
                                    value: formData.approved_by,
                                    label: costCenters.find(c => isEqualNumber(c.Cost_Center_Id, formData.approved_by))?.Cost_Center_Name || 'Select Staff'
                                }}
                                onChange={e => setFormData({ ...formData, approved_by: e ? e.value : '' })}
                                options={costCenters.map(c => ({ value: c.Cost_Center_Id, label: c.Cost_Center_Name }))}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder="Select Staff"
                                filterOption={reactSelectFilterLogic}
                            />
                        </div>
                    </div>

                    <div className="mt-4 border-top pt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">Grouped Trips</h6>
                            <Button variant="contained" color="primary" onClick={openDialog} disabled={!formData.branch_id}>
                                Choose Trip Sheet
                            </Button>
                        </div>

                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead className="bg-light">
                                    <TableRow>
                                        <TableCell style={{ fontWeight: 'bold' }}>Trip Date</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Challan No</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Trip No</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Voucher Type</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Bags Qty</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }}>Tonnage Qty</TableCell>
                                        <TableCell style={{ fontWeight: 'bold' }} align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {selectedTrips.length > 0 ? selectedTrips.map((trip, idx) => (
                                        <TableRow key={idx}>
                                            <TableCell>{new Date(trip.Trip_Date).toLocaleDateString()}</TableCell>
                                            <TableCell>{trip.Challan_No || trip.TR_INV_ID || '-'}</TableCell>
                                            <TableCell>{trip.Trip_No || '-'}</TableCell>
                                            <TableCell>{trip.VoucherTypeGet || '-'}</TableCell>
                                            <TableCell>{trip.Bags_Qty}</TableCell>
                                            <TableCell>{trip.Tonnage_Qty}</TableCell>
                                            <TableCell align="center">
                                                <IconButton size="small" color="error" onClick={() => removeSelectedTrip(idx)}>
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={7} align="center">No trips selected</TableCell>
                                        </TableRow>
                                    )}
                                    {selectedTrips.length > 0 && (
                                        <TableRow className="bg-light fw-bold">
                                            <TableCell colSpan={4} align="right">Total:</TableCell>
                                            <TableCell>{totalBags}</TableCell>
                                            <TableCell>{totalTonnage}</TableCell>
                                            <TableCell />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <div className="mt-3 text-end">
                            <Button variant="contained" color="success" onClick={handleSave}>
                                {editData ? 'Update Group' : 'Save Group'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog for selecting trips */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
                <DialogTitle className="d-flex justify-content-between align-items-center">
                    <span>Select Trips to Group</span>
                    <IconButton size="small" onClick={() => setDialogOpen(false)}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <div className="row g-2 mb-3 align-items-end">
                        <div className="col-md-3">
                            <label className="fa-13">From Date</label>
                            <input
                                type="date"
                                className="cus-inpt p-2"
                                value={dialogFilters.Fromdate}
                                onChange={e => setDialogFilters(prev => ({ ...prev, Fromdate: e.target.value }))}
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="fa-13">To Date</label>
                            <input
                                type="date"
                                className="cus-inpt p-2"
                                value={dialogFilters.Todate}
                                onChange={e => setDialogFilters(prev => ({ ...prev, Todate: e.target.value }))}
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="fa-13">Bill Type</label>
                            <Select
                                options={[
                                    { label: 'ALL', value: '' },
                                    { label: 'MATERIAL INWARD', value: 'MATERIAL INWARD' },
                                    { label: 'OTHER GODOWN', value: 'OTHER GODOWN' },
                                    { label: 'SALES', value: 'SALES' },
                                    { label: 'DEBIT_NOTE', value: 'DEBIT_NOTE' },
                                    { label: 'CREDIT_NOTE', value: 'CREDIT_NOTE' },
                                ]}
                                value={{
                                    label: dialogFilters.BillType,
                                    value: dialogFilters.BillType
                                }}
                                onChange={e => setDialogFilters(prev => ({ ...prev, BillType: e ? e.value : '' }))}
                                styles={customSelectStyles}
                                filterOption={reactSelectFilterLogic}
                            />
                        </div>
                        <div className="col-md-2">
                            <Button variant="contained" color="primary" onClick={fetchAvailableTrips} fullWidth>
                                Search
                            </Button>
                        </div>
                    </div>

                    <TableContainer component={Paper} variant="outlined" style={{ maxHeight: 400 }}>
                        <Table size="small" stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell padding="checkbox" style={{ backgroundColor: '#EDF0F7', fontWeight: 'bold' }}></TableCell>
                                    <TableCell style={{ backgroundColor: '#EDF0F7', fontWeight: 'bold' }}>Trip Date</TableCell>
                                    <TableCell style={{ backgroundColor: '#EDF0F7', fontWeight: 'bold' }}>TR_INV_ID</TableCell>
                                    <TableCell style={{ backgroundColor: '#EDF0F7', fontWeight: 'bold' }}>Challan No</TableCell>
                                    <TableCell style={{ backgroundColor: '#EDF0F7', fontWeight: 'bold' }}>Trip No</TableCell>
                                    <TableCell style={{ backgroundColor: '#EDF0F7', fontWeight: 'bold' }}>Bill Type</TableCell>
                                    <TableCell style={{ backgroundColor: '#EDF0F7', fontWeight: 'bold' }}>Voucher Type</TableCell>
                                    <TableCell style={{ backgroundColor: '#EDF0F7', fontWeight: 'bold' }}>Bags Qty</TableCell>
                                    <TableCell style={{ backgroundColor: '#EDF0F7', fontWeight: 'bold' }}>Tonnage Qty</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {availableTrips.map((trip, idx) => {
                                    const isSelected = tempSelectedTrips.some(t => isEqualNumber(t.Trip_Id || t.trip_id, trip.Trip_Id || trip.trip_id));
                                    return (
                                        <TableRow key={idx} hover onClick={() => toggleTripSelection(trip)} style={{ cursor: 'pointer' }}>
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={isSelected} />
                                            </TableCell>
                                            <TableCell>{new Date(trip.Trip_Date).toLocaleDateString()}</TableCell>
                                            <TableCell>{trip.TR_INV_ID}</TableCell>
                                            <TableCell>{trip.Challan_No || '-'}</TableCell>
                                            <TableCell>{trip.Trip_No || '-'}</TableCell>
                                            <TableCell>{trip.BillType}</TableCell>
                                            <TableCell>{trip.VoucherTypeGet || '-'}</TableCell>
                                            <TableCell>{trip.Bags_Qty}</TableCell>
                                            <TableCell>{trip.Tonnage_Qty}</TableCell>
                                        </TableRow>
                                    );
                                })}
                                {availableTrips.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center">No available trips found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={confirmSelection}>
                        Confirm Selection ({tempSelectedTrips.length})
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default TripGroupCreation;
