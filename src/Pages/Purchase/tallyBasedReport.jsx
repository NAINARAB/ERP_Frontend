import { useEffect, useState } from "react";
import FilterableTable from "../../Components/filterableTable2";
import { fetchLink } from "../../Components/fetchComponent";
import { checkIsNumber, getPreviousDate, ISOString } from "../../Components/functions";
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { FilterAlt } from '@mui/icons-material';
import { purchaseOrderDataSet, displayColumns } from "../DataEntry/purchaseOrderDataArray";
import { toast } from 'react-toastify';
import PurchaseOrderPreviewTemplate from "../DataEntry/purchaseOrderPreviewTemplate";


const TallyBasedReport = ({ loadingOn, loadingOff }) => {

    const [purchaseOrderData, setPurchaseOrderData] = useState([]);
    const [orderPreview, setOrderPreview] = useState({
        OrderDetails: {},
        OrderItemsArray: [],
        DeliveryArray: [],
        TranspoterArray: [],
        display: false,
    });

    const nav = useNavigate();

    const [filters, setFilters] = useState({
        Fromdate: getPreviousDate(10),
        Todate: ISOString(),
        FilterDialog: false,
        OrderStatus: 'ITEMS',
        deleteOrderDialog: false,
        deleteOrderId: '',
        refresh: false,
        view: 'PURCHASE ORDERS'
    })

    useEffect(() => {
        fetchLink({
            address: `dataEntry/purchaseOrderEntry?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`,
        }).then(data => {
            if (data.success) {
                setPurchaseOrderData(data.data);
            }
        }).catch(e => console.error(e))
    }, [filters.Fromdate, filters.Todate, filters.refresh]);

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
        nav(page, { state: stateToTransfer });
    }

    return (
        <>
            <Card>
                <div className="p-2 d-flex flex-wrap align-items-center border-bottom">
                    <h5 className="m-0 flex-grow-1 ps-2">Purchase Order Report</h5>
                    <IconButton
                        size="small"
                        className="me-2"
                        onClick={() => setFilters(pre => ({ ...pre, FilterDialog: true }))}
                    ><FilterAlt /></IconButton>
                </div>

                <CardContent>
                    <FilterableTable
                        dataArray={purchaseOrderDataSet({
                            data: purchaseOrderData,
                            status: filters.OrderStatus
                        })}
                        columns={displayColumns({
                            OrderStatus: filters.OrderStatus,
                            dialogs: setFilters,
                            setOrderPreview,
                            navigation: navigateToPageWithState
                        })}
                        tableMaxHeight={750}
                        EnableSerialNumber
                        title={filters.OrderStatus}
                    />

                </CardContent>
            </Card>

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
                                <td className="border-0 vctr">Fromdate</td>
                                <td className="border-0 vctr">
                                    <input
                                        type="date"
                                        onChange={e => setFilters(pre => ({ ...pre, Fromdate: e.target.value }))}
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
                                        onChange={e => setFilters(pre => ({ ...pre, Todate: e.target.value }))}
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
                                        onChange={e => setFilters(pre => ({ ...pre, OrderStatus: e.target.value }))}
                                    >

                                        <option value="PO-Vendor-Wise">PO-Vendor-Wise</option>
                                        <option value="PO-Item-Wise">PO-Item-Wise</option>
                                        <option value="PO-Pending-Only">PO-Pending-Only</option>
                                        <option value="AR-Item-Based">AR-Item-Based</option>
                                        <option value="AR-Vendor-Wise">AR-Vendor-Wise</option>
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

export default TallyBasedReport;