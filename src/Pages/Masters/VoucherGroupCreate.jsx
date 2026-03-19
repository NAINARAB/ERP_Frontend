import { useState, useEffect, useMemo } from "react";
import { Button, IconButton, CardContent, Card, CardActions } from "@mui/material";
import { toast } from 'react-toastify';
import {
    isEqualNumber, isValidObject, isValidNumber, rid
} from "../../Components/functions";
import { Add, Delete, Edit } from "@mui/icons-material";
import { fetchLink } from '../../Components/fetchComponent';
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import RequiredStar from '../../Components/requiredStar';

const VoucherGroupCreate = ({ loadingOn, loadingOff, isLoading }) => {

    const navigate   = useNavigate();
    const location   = useLocation();
    const editValues = location.state;

    const isEdit = useMemo(() =>
        isValidNumber(editValues?.Voucher_Group_Id) && editValues?.isEdit,
        [editValues]
    );

    // ── Form state ───────────────────────────────────────────────────────────
    const [groupName, setGroupName]             = useState('');
    const [voucherGroupType, setVoucherGroupType] = useState('');
    const [selectedVoucher, setSelectedVoucher]   = useState(null);
    const [addedVouchers, setAddedVouchers]       = useState([]);

    // ── Track which row is being edited (null = adding new) ──────────────────
    const [editingRowId, setEditingRowId] = useState(null);

    // ── Dropdown ─────────────────────────────────────────────────────────────
    const [voucherTypeOptions, setVoucherTypeOptions] = useState([]);

    useEffect(() => {
        const fetchDropdown = async () => {
            try {
                if (loadingOn) loadingOn();
                const data = await fetchLink({ address: `masters/voucherGroups/dropdown` });
                if (data?.success) {
                    setVoucherTypeOptions(
                        (data.data || []).map(v => ({ value: v.value, label: v.label }))
                    );
                }
            } catch (e) {
                console.error(e);
                toast.error('Failed to load voucher types');
            } finally {
                if (loadingOff) loadingOff();
            }
        };
        fetchDropdown();
    }, []);

    // ── Pre-fill on edit ─────────────────────────────────────────────────────
    useEffect(() => {
        if (isEdit && isValidObject(editValues)) {
              setVoucherGroupType(editValues.Group_Type)
            setGroupName(editValues.Group_Name || '');
            if (Array.isArray(editValues.details)) {
                setAddedVouchers(
                    editValues.details.map(d => ({
                        rowId:        rid(),
                        Voucher_Id:   d.Voucher_Id,
                        Voucher_Type: d.Voucher_Type,
                        Group_Type:   d.Group_Type || '',
                    }))
                );
            }
        }
    }, [editValues, isEdit]);

    // ── Edit a row — populate inputs and remove from list ────────────────────
    const handleEditRow = (row) => {
        setEditingRowId(row.rowId);
        setVoucherGroupType(row.Group_Type || '');
        setSelectedVoucher(
            voucherTypeOptions.find(o => isEqualNumber(o.value, row.Voucher_Id)) || {
                value: row.Voucher_Id,
                label: row.Voucher_Type,
            }
        );
        // Remove from list so it can be re-added after editing
        setAddedVouchers(prev => prev.filter(v => v.rowId !== row.rowId));
    };

    // ── Add / update voucher ─────────────────────────────────────────────────
    const handleAddVoucher = () => {
        if (!voucherGroupType.trim()) return toast.warn('Please enter group type');
        if (!selectedVoucher)         return toast.warn('Please select a voucher type');

        // Only check duplicate if adding a NEW row (not editing an existing one)
        if (!editingRowId) {
            const alreadyAdded = addedVouchers.some(v =>
                isEqualNumber(v.Voucher_Id, selectedVoucher.value)
            );
            if (alreadyAdded) return toast.warn(`"${selectedVoucher.label}" is already added`);
        }

        setAddedVouchers(prev => [
            ...prev,
            {
                rowId:        editingRowId || rid(),   // reuse rowId if editing
                Voucher_Id:   selectedVoucher.value,
                Voucher_Type: selectedVoucher.label,
                Group_Type:   voucherGroupType.trim(),
            }
        ]);

        setSelectedVoucher(null);
        setVoucherGroupType('');
        setEditingRowId(null);
    };

    // ── Cancel row edit ───────────────────────────────────────────────────────
    const handleCancelEdit = () => {
        // If we were editing a row, restore it back to the list
        if (editingRowId && selectedVoucher) {
            setAddedVouchers(prev => [
                ...prev,
                {
                    rowId:        editingRowId,
                    Voucher_Id:   selectedVoucher.value,
                    Voucher_Type: selectedVoucher.label,
                    Group_Type:   voucherGroupType.trim(),
                }
            ]);
        }
        setSelectedVoucher(null);
        setVoucherGroupType('');
        setEditingRowId(null);
    };

    // ── Clear all ────────────────────────────────────────────────────────────
    const clearValues = () => {
        setGroupName('');
        setVoucherGroupType('');
        setSelectedVoucher(null);
        setAddedVouchers([]);
        setEditingRowId(null);
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (isLoading) return;
        if (!groupName.trim())          return toast.warn('Please enter group name');
        if (addedVouchers.length === 0) return toast.warn('Please add at least one voucher');

        fetchLink({
            address:  `masters/voucherGroups`,
            method:   isEdit ? 'PUT' : 'POST',
            loadingOn,
            loadingOff,
            bodyData: {
                Group_Name: groupName.trim(),
                details: addedVouchers.map(v => ({
                    Voucher_Id: v.Voucher_Id,
                    Group_Type: v.Group_Type,
                })),
                ...(isEdit && { Voucher_Group_Id: editValues?.Voucher_Group_Id }),
            },
        }).then(data => {
            if (data?.success) {
                toast.success(data.message);
                clearValues();
                navigate('/erp/master/VoucherGroup');
            } else {
                toast.warn(data?.message || 'Operation failed');
            }
        }).catch(e => {
            console.error(e);
            toast.error('Failed to save voucher group');
        });
    };

    const isEditing = !!editingRowId;

    return (
        <>
            <Card>
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="d-flex flex-wrap align-items-center border-bottom py-2 px-3">
                    <span className="flex-grow-1 fa-16 fw-bold">
                        {isEdit ? 'EDIT VOUCHER GROUP' : 'CREATE VOUCHER GROUP'}
                    </span>
                    <span className="d-flex gap-2">
                        <Button onClick={() => navigate(-1)}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Submit'}
                        </Button>
                    </span>
                </div>

                <CardContent>
                    <div className="border px-3 py-3 mb-3">
                        <div className="row">

                            {/* Group Name */}
                            <div className="col-xl-12 col-md-12 col-sm-12 p-2">
                                <label className="fa-13">Group Name <RequiredStar /></label>
                                <input
                                    type="text"
                                    className="cus-inpt fa-14"
                                    placeholder="Enter Voucher Group Name"
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* ── Add / Edit voucher row ── */}
                        <div className="row mt-3 border-top pt-3">
                            <div className="col-12 mb-2">
                                <h6 className="fw-bold" style={{ color: isEditing ? '#f59e0b' : undefined }}>
                                    {isEditing ? '✏️ Editing Voucher' : 'Add Voucher to Group'}
                                </h6>
                            </div>

                            {/* Group Type */}
                            <div className="col-xl-5 col-md-5 col-sm-12 p-2">
                                <label className="fa-13">Group Type <RequiredStar /></label>
                                <input
                                    type="text"
                                    className="cus-inpt fa-14"
                                    placeholder="e.g. STOCK JOURNAL, SALES..."
                                    value={voucherGroupType}
                                    onChange={e => setVoucherGroupType(e.target.value)}
                                />
                            </div>

                            {/* Voucher Type select */}
                            <div className="col-xl-5 col-md-5 col-sm-12 p-2">
                                <label className="fa-13">
                                    Voucher Type <RequiredStar />
                                    {voucherTypeOptions.length > 0 && (
                                        <span className="text-muted ms-1 fa-12">
                                            ({voucherTypeOptions.length} types)
                                        </span>
                                    )}
                                </label>
                                <Select
                                    options={voucherTypeOptions}
                                    value={selectedVoucher}
                                    onChange={setSelectedVoucher}
                                    placeholder="Search and select voucher type..."
                                    isClearable
                                    isSearchable
                                    styles={customSelectStyles}
                                    noOptionsMessage={() => 'No voucher types found'}
                                />
                            </div>

                            {/* Add / Update + Cancel buttons */}
                            <div className="col-xl-2 col-md-2 col-sm-12 p-2 d-flex align-items-end gap-1">
                                <Button
                                    variant="contained"
                                    color={isEditing ? 'warning' : 'primary'}
                                    startIcon={isEditing ? <Edit /> : <Add />}
                                    onClick={handleAddVoucher}
                                    disabled={!selectedVoucher || !voucherGroupType.trim()}
                                    sx={{ whiteSpace: 'nowrap', flex: 1 }}
                                >
                                    {isEditing ? 'Update' : 'Add'}
                                </Button>
                                {isEditing && (
                                    <Button
                                        variant="outlined"
                                        color="inherit"
                                        onClick={handleCancelEdit}
                                        sx={{ whiteSpace: 'nowrap' }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Added vouchers table */}
                    <FilterableTable
                        title={`Added Vouchers (${addedVouchers.length})`}
                        headerFontSizePx={13}
                        bodyFontSizePx={13}
                        EnableSerialNumber
                        disablePagination
                        dataArray={addedVouchers}
                        columns={[
                            createCol('Group_Type',   'string', 'Group Type'),
                            createCol('Voucher_Type', 'string', 'Voucher Type'),
                            {
                                isCustomCell: true,
                                ColumnHeader: 'Action',
                                isVisible:    1,
                                align:        'center',
                                Cell: ({ row }) => (
                                    <span className="d-flex gap-1 justify-content-center">
                                        {/* Edit row — populates inputs */}
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleEditRow(row)}
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        {/* Delete row */}
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() =>
                                                setAddedVouchers(prev =>
                                                    prev.filter(v => v.rowId !== row.rowId)
                                                )
                                            }
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </span>
                                ),
                            },
                        ]}
                    />
                </CardContent>

                {/* ── Footer ─────────────────────────────────────────────── */}
                <CardActions className="d-flex justify-content-end gap-2">
                    <Button onClick={() => navigate(-1)}>Cancel</Button>
                    <Button onClick={clearValues} variant="outlined" color="warning">Reset</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Submit'}
                    </Button>
                </CardActions>
            </Card>
        </>
    );
};

export default VoucherGroupCreate;