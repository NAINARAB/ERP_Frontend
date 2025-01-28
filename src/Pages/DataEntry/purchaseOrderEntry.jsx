import { useEffect, useState } from "react";
import FilterableTable from "../../Components/filterableTable2";
import { fetchLink } from "../../Components/fetchComponent";
import { checkIsNumber, getPreviousDate, isEqualNumber, isValidDate } from "../../Components/functions";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useNavigate, useLocation } from 'react-router-dom';
import { FilterAlt } from '@mui/icons-material';
import { purchaseOrderDataSet, displayColumns } from "./purchaseOrderDataArray";
import { toast } from 'react-toastify';
import PurchaseOrderPreviewTemplate from "./purchaseOrderPreviewTemplate";
import Select from 'react-select';
import { customSelectStyles } from "../../Components/tablecolumn";

const useQuery = () => new URLSearchParams(useLocation().search);

const defaultFilters = {
    Fromdate: getPreviousDate(10),
    Todate: new Date().toISOString().split('T')[0],
    OrderStatus: "ITEMS",
    vendorId: '',
    vendor: '',
};

const PurchaseOrderDataEntry = ({ loadingOn, loadingOff }) => {

    const [purchaseOrderData, setPurchaseOrderData] = useState([]);
    const [orderPreview, setOrderPreview] = useState({
        OrderDetails: {},
        OrderItemsArray: [],
        DeliveryArray: [],
        TranspoterArray: [],
        display: false,
    });
    const [vendorList, setVendorList] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();

    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        FilterDialog: false,
        OrderStatus: defaultFilters.OrderStatus,
        vendorId: defaultFilters.vendorId,
        vendor: defaultFilters.vendor,
        deleteOrderDialog: false,
        deleteOrderId: '',
        refresh: false,
        view: 'PURCHASE ORDERS'
    })

    useEffect(() => {
        fetchLink({
            address: `masters/retailers/dropDown`
        }).then(data => {
            if (data.success) {
                setVendorList(data.data);
            }
        }).catch(e => console.error(e));
    }, [])

    useEffect(() => {
        fetchLink({
            address: `dataEntry/purchaseOrderEntry?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`,
        }).then(data => {
            if (data.success) {
                setPurchaseOrderData(data.data);
            }
        }).catch(e => console.error(e))
    }, [filters.Fromdate, filters.Todate, filters.refresh]);

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
        setFilters(pre => ({ ...pre, ...queryFilters }));
    }, [location.search]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const handleFilterChange = (key, value) => {
        const updatedFilters = {
            Fromdate: filters?.Fromdate,
            Todate: filters?.Todate,
            OrderStatus: filters?.OrderStatus,
            vendorId: filters?.vendorId,
            vendor: filters?.vendor,
            [key]: value
        };
        setFilters(pre => ({ ...pre, ...updatedFilters }));
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
                setFilters(pre => ({ ...pre, deleteOrderDialog: false, deleteOrderId: '', refresh: !pre.refresh }));
                toast.success(data.message);
            } else {
                setFilters(pre => ({ ...pre, deleteOrderDialog: false, deleteOrderId: '' }));
                toast.error(data.message);
            }
        }).catch(e => console.error(e))
    }

    const onCloseDialog = () => {
        setOrderPreview({
            OrderDetails: {},
            OrderItemsArray: [],
            DeliveryArray: [],
            TranspoterArray: [],
            display: false,
        })
    }

    const navigateToPageWithState = ({ page = '', stateToTransfer = {} }) => {
        navigate(page, { state: stateToTransfer });
    }

    return (
        <>
            {/* <Card>
                <div className="p-2 d-flex flex-wrap align-items-center">
                    <h5 className="m-0 flex-grow-1">Purchase Order</h5>
                    
                </div>

                <CardContent>


                </CardContent>
            </Card> */}

            <FilterableTable
                dataArray={purchaseOrderDataSet({
                    data:
                        checkIsNumber(filters.vendorId) ? (
                            purchaseOrderData.filter(obj => isEqualNumber(obj.PartyId, filters.vendorId))
                        ) : purchaseOrderData,
                    status: filters.OrderStatus
                })}
                columns={displayColumns({
                    OrderStatus: filters.OrderStatus,
                    dialogs: setFilters,
                    setOrderPreview,
                    navigation: navigateToPageWithState
                })}
                tableMaxHeight={650}
                EnableSerialNumber
                title={'Purchase Order - ' + filters.OrderStatus}
                maxHeightOption
                ButtonArea={
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('create')}
                        >Add</Button>
                        <IconButton
                            size="small"
                            className="me-2"
                            onClick={() => setFilters(pre => ({ ...pre, FilterDialog: true }))}
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
                    display={orderPreview.display}
                    onCloseDialog={() => onCloseDialog()}
                />
            )}

            <Dialog
                open={filters.FilterDialog}
                onClose={() => setFilters(pre => ({ ...pre, FilterDialog: false }))}
                maxWidth='sm' fullWidth
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
                                        onChange={e => setFilters(pre => ({
                                            ...pre,
                                            vendorId: e.value,
                                            vendor: e.label
                                        }))}
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
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border-0 vctr">Fromdate</td>
                                <td className="border-0 vctr">
                                    <input
                                        type="date"
                                        onChange={e => handleFilterChange('Fromdate', e.target.value)}
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
                                        onChange={e => handleFilterChange('Todate', e.target.value)}
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
                                        onChange={e => handleFilterChange('OrderStatus', e.target.value)}
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
                                            {/* <option value={'ORDERS PENDING'}>ORDERS - PENDING</option>
                                            <option value={'ORDERS ARRIVED'}>ORDERS - ARRIVED</option> */}

                                        </optgroup>
                                        {/* <optgroup label="REPORTS">
                                            <option value="REPORT 1">REPORT 1</option>
                                            <option value="REPORT 2">REPORT 2</option>
                                            <option value="REPORT 2A">REPORT 2A</option>
                                            <option value="REPORT 3">REPORT 3</option>
                                            <option value="REPORT 4">REPORT 4</option>
                                        </optgroup> */}
                                    </select>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setFilters(pre => ({ ...pre, FilterDialog: false }))}
                        variant="outlined"
                    >Close</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={filters.deleteOrderDialog}
                onClose={() => setFilters(pre => ({ ...pre, deleteOrderDialog: false, deleteOrderId: '' }))}
                maxWidth='sm'
            >
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <h6>Do you want to delete the order permanently?</h6>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setFilters(pre => ({ ...pre, deleteOrderDialog: false, deleteOrderId: '' }))}
                    >Cancel</Button>
                    <Button color='error' variant='outlined' onClick={() => deleteOrder(filters.deleteOrderId)}>Delete</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default PurchaseOrderDataEntry;