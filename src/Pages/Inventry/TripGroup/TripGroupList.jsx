import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import AppTableComponent from '../../../Components/appTable/appTableComponent';
import { fetchLink } from '../../../Components/fetchComponent';
import Select from 'react-select';
import { customSelectStyles } from '../../../Components/tablecolumn';
import { reactSelectFilterLogic, ISOString, toArray, isEqualNumber } from '../../../Components/functions';

const TripGroupList = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [branches, setBranches] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        Branch_Id: ''
    });

    const fetchBranches = async () => {
        try {
            const res = await fetchLink({ address: 'masters/branch/dropDown' });
            if (res.success) setBranches(toArray(res.data));
        } catch (e) {
            console.error(e);
        }
    };

    const fetchData = async () => {
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetchLink({ address: `inventory/tripGroup?${query}` });
            if (res.success) {
                setData(toArray(res.data));
            } else {
                setData([]);
            }
        } catch (e) {
            console.error(e);
            toast.error('Failed to load trip groups');
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this trip group?')) {
            try {
                const res = await fetchLink({ address: 'inventory/tripGroup', method: 'DELETE', bodyData: { id } });
                if (res.success) {
                    toast.success('Trip Group deleted successfully');
                    fetchData();
                } else {
                    toast.error(res.message || 'Deletion failed');
                }
            } catch (e) {
                toast.error('Deletion failed');
                console.error(e);
            }
        }
    };

    const columns = [
        { Field_Name: 'entry_date', ColumnHeader: 'Entry Date', Fied_Data: 'date', isVisible: 1 },
        { Field_Name: 'BranchName', ColumnHeader: 'Branch', isVisible: 1 },
        { Field_Name: 'vehicle_number', ColumnHeader: 'Vehicle No', isVisible: 1 },
        { Field_Name: 'Challan_Nos', ColumnHeader: 'Challan No(s)', isVisible: 1 },
        { Field_Name: 'Trip_Nos', ColumnHeader: 'Trip No(s)', isVisible: 1 },
        { Field_Name: 'Total_Bags', ColumnHeader: 'Total Bags', Fied_Data: 'number', isVisible: 1 },
        { Field_Name: 'Total_Tonnage', ColumnHeader: 'Total Tonnage', Fied_Data: 'number', isVisible: 1 },
        { 
            Field_Name: 'Staffs_Array', 
            ColumnHeader: 'Staff Involved', 
            isVisible: 1,
            isCustomCell: true,
            Cell: ({ row }) => {
                const staffs = row.Staffs_Array || [];
                return staffs.map(s => s.Emp_Name).join(', ') || 'None';
            }
        },
        { 
            Field_Name: 'Action', 
            ColumnHeader: 'Action', 
            isVisible: 1, 
            isCustomCell: true,
            Cell: ({ row }) => (
                <div className="d-flex gap-2">
                    <IconButton size="small" color="primary" onClick={() => navigate('/erp/inventory/tripGroup/create', { state: { editData: row } })}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                        <Delete fontSize="small" />
                    </IconButton>
                </div>
            )
        }
    ];

    const ExpandedTripsTable = ({ row }) => {
        const trips = row.Trips_List || [];
        return (
            <TableContainer component={Paper} elevation={0} style={{ margin: '10px 0', backgroundColor: '#f9f9f9', border: '1px solid #ddd' }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell style={{ fontWeight: 'bold' }}>Trip Date</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>TR_INV_ID</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>Challan No</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>Trip No</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>Voucher Type</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>Bags Qty</TableCell>
                            <TableCell style={{ fontWeight: 'bold' }}>Tonnage Qty</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {trips.length > 0 ? trips.map((trip, i) => (
                            <TableRow key={i}>
                                <TableCell>{new Date(trip.Trip_Date).toLocaleDateString()}</TableCell>
                                <TableCell>{trip.TR_INV_ID}</TableCell>
                                <TableCell>{trip.Challan_No || '-'}</TableCell>
                                <TableCell>{trip.Trip_No || '-'}</TableCell>
                                <TableCell>{trip.VoucherTypeGet || '-'}</TableCell>
                                <TableCell>{trip.Bags_Qty}</TableCell>
                                <TableCell>{trip.Tonnage_Qty}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} align="center">No trips found</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    };

    return (
        <div className="container-fluid p-3">
            <div className="card shadow-sm mb-3">
                <div className="card-body p-2 d-flex align-items-center gap-3 flex-wrap">
                    <div className="d-flex align-items-center gap-2">
                        <label className="fa-12 mb-0">From:</label>
                        <input
                            type="date"
                            className="cus-inpt p-2"
                            value={filters.Fromdate}
                            onChange={e => setFilters(prev => ({ ...prev, Fromdate: e.target.value }))}
                        />
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <label className="fa-12 mb-0">To:</label>
                        <input
                            type="date"
                            className="cus-inpt p-2"
                            value={filters.Todate}
                            onChange={e => setFilters(prev => ({ ...prev, Todate: e.target.value }))}
                        />
                    </div>
                    <div style={{ width: 220, zIndex: 100 }}>
                        <Select 
                            options={[{ label: 'ALL BRANCHES', value: '' }, ...branches.map(b => ({ label: b.BranchName, value: b.BranchId }))]}
                            value={{
                                label: branches.find(b => isEqualNumber(b.BranchId, filters.Branch_Id))?.BranchName || 'ALL BRANCHES',
                                value: filters.Branch_Id
                            }}
                            onChange={e => setFilters(prev => ({ ...prev, Branch_Id: e ? e.value : '' }))}
                            styles={customSelectStyles}
                            filterOption={reactSelectFilterLogic}
                        />
                    </div>
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={<Add />}
                        onClick={() => navigate('/erp/inventory/tripGroup/create')}
                        className="ms-auto"
                    >
                        Create Trip Group
                    </Button>
                </div>
            </div>

            <AppTableComponent
                title="Trip Group List"
                dataArray={data}
                columns={columns}
                isExpendable={true}
                expandableComp={ExpandedTripsTable}
                EnableSerialNumber={true}
                enableGlobalSearch={true}
            />
        </div>
    );
};

export default TripGroupList;
