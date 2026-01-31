import { useEffect, useState } from "react";
import FilterableTable from "../../../Components/filterableTable2";
import { fetchLink } from "../../../Components/fetchComponent";
import { checkIsNumber, isEqualNumber, ISOString, isValidDate, reactSelectFilterLogic, toArray } from "../../../Components/functions";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';
import { FilterAlt, Search } from '@mui/icons-material';
import { purchaseOrderDataSet, displayColumns } from "./filters";
import { toast } from 'react-toastify';
import PurchaseOrderPreviewTemplate from "../../DataEntry/purchaseOrderPreviewTemplate";
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";

const useQuery = () => new URLSearchParams(useLocation().search);

const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
    OrderStatus: "ITEMS PENDING",
    vendorId: '',
    vendor: '',
};

const PurchaseOrderDataEntry = ({ loadingOn, loadingOff, AddRights, EditRights, DeleteRights }) => {
    const [purchaseOrderData, setPurchaseOrderData] = useState([]);
    const [orderPreview, setOrderPreview] = useState({
        OrderDetails: {},
        OrderItemsArray: [],
        DeliveryArray: [],
        TranspoterArray: [],
        StaffArray: [],
        display: false,
    });
    const [vendorList, setVendorList] = useState([]);
    const [products, setProducts] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const query = useQuery();

    const [filters, setFilters] = useState({
        ...defaultFilters,
        FilterDialog: false,
        deleteOrderDialog: false,
        deleteOrderId: '',
        refresh: false,
        view: 'PURCHASE ORDERS'
    });

    useEffect(() => {
        fetchLink({
            address: `masters/retailers/dropDown`
        }).then(data => {
            if (data.success) {
                const retailerData = toArray(data?.data).sort(
                    (a, b) => String(a?.Retailer_Name).localeCompare(b?.Retailer_Name)
                );
                setVendorList(retailerData);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/products`
        }).then(data => {
            if (data.success) {
                setProducts(data.data);
            } else {
                setProducts([]);
            }
        }).catch(e => console.error(e));
    }, []);

    useEffect(() => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `dataEntry/purchaseOrderEntry?Fromdate=${filters.Fromdate}&Todate=${filters.Todate}`,
        }).then(data => {
            if (data.success) {
                setPurchaseOrderData(data.data);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        });
    }, [filters.refresh]);

    useEffect(() => {
        const queryFilters = {
            Fromdate: query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                ? query.get("Fromdate")
                : defaultFilters.Fromdate,
            Todate: query.get("Todate") && isValidDate(query.get("Todate"))
                ? query.get("Todate")
                : defaultFilters.Todate,
            OrderStatus: query.get("OrderStatus") || defaultFilters.OrderStatus,
            vendorId: query.get("vendorId") || defaultFilters.vendorId,
            vendor: query.get("vendor") || defaultFilters.vendor,
        };
        setFilters(prev => ({ ...prev, ...queryFilters }));
    }, [location.search]);

    useEffect(() => {
        const Fromdate = (stateDetails?.Fromdate && isValidDate(stateDetails?.Fromdate)) ? ISOString(stateDetails?.Fromdate) : null;
        const Todate = (stateDetails?.Todate && isValidDate(stateDetails?.Todate)) ? ISOString(stateDetails?.Todate) : null;
        if (Fromdate && Todate) {
            updateQueryString({ Fromdate, Todate });
        }
    }, [stateDetails]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams();
        Object.keys(newFilters).forEach(key => {
            if (newFilters[key]) {
                params.set(key, newFilters[key]);
            }
        });
        navigate(`?${params.toString()}`, { replace: true });
    };

    const handleFilterChange = (valObj) => {
        const updatedFilters = {
            ...filters,
            ...valObj
        };
        setFilters(updatedFilters);
        updateQueryString(updatedFilters);
    };

    const deleteOrder = (OrderId) => {
        if (!checkIsNumber(OrderId)) return;

        fetchLink({
            address: 'dataEntry/purchaseOrderEntry',
            method: 'DELETE',
            bodyData: { OrderId }
        }).then(data => {
            if (data.success) {
                setFilters(prev => ({ ...prev, deleteOrderDialog: false, deleteOrderId: '', refresh: !prev.refresh }));
                toast.success(data.message);
            } else {
                setFilters(prev => ({ ...prev, deleteOrderDialog: false, deleteOrderId: '' }));
                toast.error(data.message);
            }
        }).catch(e => console.error(e));
    };

    const onCloseDialog = () => {
        setOrderPreview({
            OrderDetails: {},
            OrderItemsArray: [],
            DeliveryArray: [],
            TranspoterArray: [],
            display: false,
        });
    };

    const navigateToPageWithState = ({ page = '', stateToTransfer = {} }) => {
        navigate(page, { state: stateToTransfer });
    };

    return (
        <>
            <FilterableTable
                dataArray={purchaseOrderDataSet({
                    data: checkIsNumber(filters.vendorId)
                        ? purchaseOrderData.filter(obj => isEqualNumber(obj.PartyId, filters.vendorId))
                        : purchaseOrderData,
                    status: filters.OrderStatus
                })}
                columns={displayColumns({
                    OrderStatus: filters.OrderStatus,
                    dialogs: setFilters,
                    setOrderPreview,
                    navigation: navigateToPageWithState,
                    products: products,
                    EditRights,
                    DeleteRights,
                    AddRights
                })}
                tableMaxHeight={650}
                EnableSerialNumber
                title={'Purchase Order - ' + filters.OrderStatus}
                maxHeightOption
                ExcelPrintOption
                PDFPrintOption
                ButtonArea={
                    <>
                        {AddRights && (
                            <Button
                                variant="outlined"
                                onClick={() => navigate('create')}
                            >Add</Button>
                        )}
                        <IconButton
                            size="small"
                            className="me-2"
                            onClick={() => setFilters(prev => ({ ...prev, FilterDialog: true }))}
                        ><FilterAlt /></IconButton>
                    </>
                }
            />

            {orderPreview.display && (
                <PurchaseOrderPreviewTemplate
                    OrderDetails={orderPreview.OrderDetails}
                    OrderItemsArray={orderPreview.OrderItemsArray}
                    DeliveryArray={orderPreview.DeliveryArray}
                    TranspoterArray={orderPreview.TranspoterArray}
                    StaffArray={orderPreview.StaffArray}
                    display={orderPreview.display}
                    onCloseDialog={onCloseDialog}
                />
            )}

            <Dialog
                open={filters.FilterDialog}
                onClose={() => setFilters(prev => ({ ...prev, FilterDialog: false }))}
                maxWidth='sm'
                fullWidth
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <table className="table m-0 border-0">
                        <tbody>
                            <tr>
                                <td className="border-0 vctr">Vendor</td>
                                <td className="border-0 vctr">
                                    <Select
                                        value={{ value: filters.vendorId, label: filters.vendor }}
                                        onChange={e => handleFilterChange({
                                            vendorId: e.value,
                                            vendor: e.label
                                        })}
                                        options={[
                                            { value: '', label: 'Search', isDisabled: true },
                                            ...vendorList.map(obj => ({
                                                value: obj?.Retailer_Id,
                                                label: obj?.Retailer_Name
                                            }))
                                        ]}
                                        styles={customSelectStyles} 
                                        isSearchable={true}
                                        placeholder={"Select Vendor"}
                                        maxMenuHeight={300}
                                        filterOption={reactSelectFilterLogic}
                                        menuPortalTarget={document.body}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-0 vctr">Fromdate</td>
                                <td className="border-0 vctr">
                                    <input
                                        type="date"
                                        onChange={e => handleFilterChange({ Fromdate: e.target.value })}
                                        value={filters.Fromdate}
                                        className="cus-inpt p-2"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-0 vctr">Todate</td>
                                <td className="border-0 vctr">
                                    <input
                                        type="date"
                                        onChange={e => handleFilterChange({ Todate: e.target.value })}
                                        value={filters.Todate}
                                        className="cus-inpt p-2"
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-0 vctr">Order Status</td>
                                <td className="border-0 vctr">
                                    <select
                                        className="cus-inpt p-2"
                                        value={filters.OrderStatus}
                                        onChange={e => handleFilterChange({ OrderStatus: e.target.value })}
                                    >
                                        <optgroup label="ITEM BASED">
                                            <option value={'ITEMS'}>ITEMS</option>
                                            <option value={'ITEMS PENDING'}>ITEMS - PENDING</option>
                                            <option value={'ITEMS ARRIVED'}>ITEMS - ARRIVED</option>
                                        </optgroup>
                                        <optgroup label="ORDER BASED">
                                            <option value={'ORDERS'}>ORDERS</option>
                                            <option value={'COMPLETED ORDERS'}>COMPLETED ORDERS</option>
                                            <option value={'IN-COMPLETED ORDERS'}>IN-COMPLETED ORDERS</option>
                                        </optgroup>
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setFilters(prev => ({ ...prev, FilterDialog: false }))}
                        variant="outlined"
                    >Close</Button>
                    <Button
                        onClick={() => setFilters(prev => ({ ...prev, refresh: !prev.refresh }))}
                        variant="outlined"
                        startIcon={<Search />}
                    >Search</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={filters.deleteOrderDialog}
                onClose={() => setFilters(prev => ({ ...prev, deleteOrderDialog: false, deleteOrderId: '' }))}
                maxWidth='sm'
            >
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <h6>Do you want to delete the order permanently?</h6>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setFilters(prev => ({ ...prev, deleteOrderDialog: false, deleteOrderId: '' }))}
                    >Cancel</Button>
                    <Button color='error' variant='outlined' onClick={() => deleteOrder(filters.deleteOrderId)}>Delete</Button>
                </DialogActions>
            </Dialog>

        </>
    );
};

export default PurchaseOrderDataEntry;