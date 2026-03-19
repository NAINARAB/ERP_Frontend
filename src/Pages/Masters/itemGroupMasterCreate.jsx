import { useState, useEffect, useMemo } from "react";
import { Button, IconButton, CardContent, Card, CardActions } from "@mui/material";
import { toast } from 'react-toastify';
import {
    isEqualNumber, isValidObject, checkIsNumber,
    toArray, isValidNumber, rid
} from "../../Components/functions";
import { Add, Delete } from "@mui/icons-material";
import { fetchLink } from '../../Components/fetchComponent';
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { useLocation, useNavigate } from "react-router-dom";
import { salesInvoiceDetailsInfo } from '../Sales/SalesInvoice/variable';
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import RequiredStar from '../../Components/requiredStar';

const ItemGroupMasterCreate = ({ loadingOn, loadingOff, isLoading }) => {

    const navigate   = useNavigate();
    const location   = useLocation();
    const editValues = location.state;

    const user       = JSON.parse(localStorage.getItem("user"));
    const userId     = user?.UserId;
    const company_Id = user?.Company_id;

    const isEdit = useMemo(() => isValidNumber(editValues?.Item_Group_Id), [editValues?.Item_Group_Id]);

    // ── Form state ───────────────────────────────────────────────────────────
    const [groupName, setGroupName]         = useState('');
    const [hsnCode, setHsnCode]             = useState('');
    const [gstPercentage, setGstPercentage] = useState('');
    const [selectedItem, setSelectedItem]   = useState(null);
    const [invoiceProducts, setInvoiceProduct] = useState([]);

    // ── All products (no stock group filter) ─────────────────────────────────
    const [allProducts, setAllProducts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (loadingOn) loadingOn();
                const response = await fetchLink({
                    address: `masters/products/allProducts`
                });
                if (response.success) {
                    setAllProducts(
                        toArray(response.data).map(p => ({
                            value: p.Product_Id ?? p.id,
                            label: p.Product_Name ?? p.name,
                        }))
                    );
                } else {
                    setAllProducts([]);
                    toast.error('Failed to load products');
                }
            } catch (e) {
                console.error(e);
                toast.error('Failed to load products');
                setAllProducts([]);
            } finally {
                if (loadingOff) loadingOff();
            }
        };
        fetchData();
    }, []);

    // ── Pre-fill on edit ─────────────────────────────────────────────────────
    useEffect(() => {
        if (isValidObject(editValues)) {
            setGroupName(editValues.Group_Name ?? '');
            setHsnCode(editValues.Group_HSN ?? '');
            setGstPercentage(editValues.GST_P != null ? String(editValues.GST_P) : '');

            if (Array.isArray(editValues.Products_List)) {
                setInvoiceProduct(
                    editValues.Products_List.map(item => ({
                        ...salesInvoiceDetailsInfo,
                        rowId:     rid(),
                        Item_Id:   item.Materail_Id ?? item.Product_Id ?? 0,
                        Item_Name: item.Product_Name ?? '',
                    }))
                );
            }
        }
    }, [editValues]);

    // ── Add item ─────────────────────────────────────────────────────────────
    const handleAddItem = () => {
        if (!selectedItem) return toast.warn('Please select an item first');

        const alreadyAdded = invoiceProducts.some(p =>
            isEqualNumber(p.Item_Id, selectedItem.value)
        );
        if (alreadyAdded) return toast.warn(`"${selectedItem.label}" is already added`);

        setInvoiceProduct(prev => [
            ...prev,
            {
                ...salesInvoiceDetailsInfo,
                rowId:     rid(),
                Item_Id:   selectedItem.value,
                Item_Name: selectedItem.label,
            }
        ]);
        setSelectedItem(null);
    };

    // ── Clear ────────────────────────────────────────────────────────────────
    const clearValues = () => {
        setGroupName('');
        setHsnCode('');
        setGstPercentage('');
        setSelectedItem(null);
        setInvoiceProduct([]);
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        if (isLoading) return;
        if (!groupName.trim())                return toast.warn('Please enter group name');
        if (!hsnCode.trim())                  return toast.warn('Please enter HSN code');
        if (!gstPercentage.toString().trim()) return toast.warn('Please enter GST percentage');
        if (invoiceProducts.length === 0)     return toast.warn('Please add at least one item');

        const requestId = crypto.randomUUID();

        fetchLink({
            address: `masters/itemGroup`,
            method:  isEdit ? 'PUT' : 'POST',
            loadingOff,
            loadingOn,
            headers: { 'Idempotency-Key': requestId },
            bodyData: {
                Group_Name: groupName.trim(),
                Group_HSN:  hsnCode.trim(),
                GST_P:      parseFloat(gstPercentage),
                Created_By: userId,
                items:      invoiceProducts.map(p => p.Item_Id),
                ...(isEdit && { Item_Group_Id: editValues?.Item_Group_Id }),
            }
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                clearValues();
                navigate('/erp/master/itemGroupMaster');
            } else {
                toast.warn(data.message);
            }
        }).catch(e => {
            console.error(e);
            toast.error('Failed to save item group');
        });
    };

    return (
        <>
            <Card>
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="d-flex flex-wrap align-items-center border-bottom py-2 px-3">
                    <span className="flex-grow-1 fa-16 fw-bold">ITEM GROUP</span>
                    <span className="d-flex gap-2">
                        <Button type="button" onClick={() => navigate(-1)}>Cancel</Button>
                        <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Submit'}
                        </Button>
                    </span>
                </div>

                <CardContent>
                    <div className="border px-3 py-3 mb-3">
                        <div className="row">

                            {/* Group Name */}
                            <div className="col-xl-4 col-md-4 col-sm-6 p-2">
                                <label className="fa-13">Group Name <RequiredStar /></label>
                                <input
                                    type="text"
                                    className="cus-inpt fa-14"
                                    placeholder="Enter Group Name"
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                />
                            </div>

                            {/* HSN Code */}
                            <div className="col-xl-4 col-md-4 col-sm-6 p-2">
                                <label className="fa-13">HSN Code <RequiredStar /></label>
                                <input
                                    type="text"
                                    className="cus-inpt fa-14"
                                    placeholder="Enter HSN Code"
                                    value={hsnCode}
                                    onChange={e => setHsnCode(e.target.value)}
                                />
                            </div>

                            {/* GST % */}
                            <div className="col-xl-4 col-md-4 col-sm-6 p-2">
                                <label className="fa-13">GST % <RequiredStar /></label>
                                <input
                                    type="number"
                                    className="cus-inpt fa-14"
                                    placeholder="Enter GST Percentage"
                                    value={gstPercentage}
                                    onChange={e => setGstPercentage(e.target.value)}
                                    min={0}
                                    max={100}
                                />
                            </div>

                            {/* Select Item — all products, no stock group filter */}
                            <div className="col-xl-12 col-md-12 col-sm-12 p-2">
                                <label className="fa-13">
                                    Select Item
                                    {allProducts.length > 0 && (
                                        <span className="text-muted ms-1 fa-12">
                                            ({allProducts.length} products)
                                        </span>
                                    )}
                                </label>
                                <div className="d-flex gap-2 align-items-center">
                                    <div style={{ flex: 1 }}>
                                        <Select
                                            options={allProducts}
                                            value={selectedItem}
                                            onChange={setSelectedItem}
                                            placeholder={
                                                allProducts.length === 0
                                                    ? 'Loading products...'
                                                    : 'Search and select item...'
                                            }
                                            isDisabled={allProducts.length === 0}
                                            isClearable
                                            isSearchable
                                            styles={customSelectStyles}
                                            noOptionsMessage={() => 'No items found'}
                                        />
                                    </div>
                                    <Button
                                        variant="contained"
                                        startIcon={<Add />}
                                        onClick={handleAddItem}
                                        disabled={!selectedItem}
                                        sx={{ whiteSpace: 'nowrap' }}
                                    >
                                        Add Item
                                    </Button>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Added items table */}
                    <FilterableTable
                        title={`Added Items (${invoiceProducts.length})`}
                        headerFontSizePx={13}
                        bodyFontSizePx={13}
                        EnableSerialNumber
                        disablePagination
                        dataArray={invoiceProducts}
                        columns={[
                            createCol('Item_Name', 'string', 'Item Name'),
                            {
                                isCustomCell: true,
                                ColumnHeader: 'Action',
                                isVisible:    1,
                                Cell: ({ row }) => (
                                    <IconButton
                                        size="small"
                                        color="error"
                                        disabled={!checkIsNumber(row?.Item_Id)}
                                        onClick={() =>
                                            setInvoiceProduct(prev =>
                                                prev.filter(o => o.rowId !== row.rowId)
                                            )
                                        }
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                ),
                            },
                        ]}
                    />
                </CardContent>

                {/* ── Footer ─────────────────────────────────────────────── */}
                <CardActions className="d-flex justify-content-end gap-2">
                    <Button type="button" onClick={() => navigate(-1)}>Cancel</Button>
                    <Button onClick={clearValues} variant="outlined" color="warning">Reset</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Submit'}
                    </Button>
                </CardActions>
            </Card>
        </>
    );
};

export default ItemGroupMasterCreate;