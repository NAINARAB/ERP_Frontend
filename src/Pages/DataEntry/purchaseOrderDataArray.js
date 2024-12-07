import { Addition, isEqualNumber, isGraterNumber, LocalDate, Subraction } from "../../Components/functions";
import { IconButton, Tooltip } from '@mui/material';
import { Delete, Edit, Preview } from '@mui/icons-material';

export const purchaseOrderDataSet = ({ data = [], status = 'ITEMS' }) => {

    switch (status) {
        case 'ITEMS':
            return (
                data?.reduce((acc, item) => {
                    if (!Array.isArray(item?.ItemDetails)) return acc;

                    const itemDetails = item.ItemDetails.map(o => ({
                        ...o,
                        OrderDetails: {
                            Id: item?.Id,
                            Sno: item?.Sno,
                            PoYear: item?.PoYear,
                            PO_ID: item?.PO_ID,
                            BranchId: item?.BranchId,
                            BrokerId: item.BrokerId ?? '',
                            BrokerName: item.BrokerName,
                            CreatedBy: item.CreatedBy,
                            CreatedAt: item.CreatedAt,
                            ItemDetails: item?.ItemDetails,
                            OrderStatus: item?.OrderStatus,
                            DeliveryDetails: item.DeliveryDetails ?? [],
                            LoadingDate: item.LoadingDate,
                            OwnerId: item.OwnerId ?? '',
                            OwnerName: item.OwnerName,
                            PartyAddress: item.PartyAddress,
                            PartyId: item.PartyId ?? '',
                            PartyName: item.PartyName,
                            PaymentCondition: item.PaymentCondition,
                            Remarks: item.Remarks,
                            TradeConfirmDate: item.TradeConfirmDate,
                            TranspoterDetails: item.TranspoterDetails ?? []
                        }
                    }));

                    return acc.concat(itemDetails);
                }, [])
            )

        case 'ITEMS PENDING':
            return (
                data?.reduce((acc, item) => {
                    if (!Array.isArray(item?.ItemDetails)) return acc;

                    const itemDetails = item?.ItemDetails?.filter(fil => {
                        const itemsInDelivery = item?.DeliveryDetails?.filter(del => isEqualNumber(del.ItemId, fil?.ItemId));
                        const WeightTotal = itemsInDelivery.reduce((sum, delivery) => Addition(sum, delivery?.Weight), 0);
                        return Number(WeightTotal) < Number(fil?.Weight);
                    }).map(o => ({
                        ...o,
                        OrderDetails: {
                            Id: item?.Id,
                            Sno: item?.Sno,
                            PoYear: item?.PoYear,
                            PO_ID: item?.PO_ID,
                            BranchId: item?.BranchId,
                            BrokerId: item.BrokerId ?? '',
                            BrokerName: item.BrokerName,
                            CreatedBy: item.CreatedBy,
                            CreatedAt: item.CreatedAt,
                            ItemDetails: item?.ItemDetails,
                            OrderStatus: item?.OrderStatus,
                            DeliveryDetails: item.DeliveryDetails ?? [],
                            LoadingDate: item.LoadingDate,
                            OwnerId: item.OwnerId ?? '',
                            OwnerName: item.OwnerName,
                            PartyAddress: item.PartyAddress,
                            PartyId: item.PartyId ?? '',
                            PartyName: item.PartyName,
                            PaymentCondition: item.PaymentCondition,
                            Remarks: item.Remarks,
                            TradeConfirmDate: item.TradeConfirmDate,
                            TranspoterDetails: item.TranspoterDetails ?? []
                        }
                    }));

                    return acc.concat(itemDetails);
                }, [])
            )

        case 'ITEMS ARRIVED':
            return (
                data?.reduce((acc, item) => {
                    if (!Array.isArray(item?.ItemDetails)) return acc;

                    const itemDetails = item?.ItemDetails?.filter(fil => {
                        const itemsInDelivery = item?.DeliveryDetails?.filter(del => isEqualNumber(del.ItemId, fil?.ItemId));
                        const WeightTotal = itemsInDelivery.reduce((sum, delivery) => Addition(sum, delivery?.Weight), 0);
                        return Number(WeightTotal) >= Number(fil?.Weight);
                    }).map(o => ({
                        ...o,
                        OrderDetails: {
                            Id: item?.Id,
                            Sno: item?.Sno,
                            PoYear: item?.PoYear,
                            PO_ID: item?.PO_ID,
                            BranchId: item?.BranchId,
                            BrokerId: item.BrokerId ?? '',
                            BrokerName: item.BrokerName,
                            CreatedBy: item.CreatedBy,
                            CreatedAt: item.CreatedAt,
                            ItemDetails: item?.ItemDetails,
                            OrderStatus: item?.OrderStatus,
                            DeliveryDetails: item.DeliveryDetails ?? [],
                            LoadingDate: item.LoadingDate,
                            OwnerId: item.OwnerId ?? '',
                            OwnerName: item.OwnerName,
                            PartyAddress: item.PartyAddress,
                            PartyId: item.PartyId ?? '',
                            PartyName: item.PartyName,
                            PaymentCondition: item.PaymentCondition,
                            Remarks: item.Remarks,
                            TradeConfirmDate: item.TradeConfirmDate,
                            TranspoterDetails: item.TranspoterDetails ?? []
                        }
                    }));

                    return acc.concat(itemDetails);
                }, [])
            )
            
        case 'ORDERS':
            return data
        case 'ORDERS PENDING':
            return data.reduce((acc, item) => {

                if (!Array.isArray(item?.DeliveryDetails) || isGraterNumber(item?.DeliveryDetails?.length, 0)) return acc;

                return acc.concat(item);

            }, [])
        case 'ORDERS ARRIVED':
            return data.reduce((acc, item) => {

                if (!Array.isArray(item?.DeliveryDetails) || isEqualNumber(item?.DeliveryDetails?.length, 0)) return acc;

                return acc.concat(item);

            }, [])
        default:
            return []
    }
}

const statusColor = {
    NewOrder: ' bg-info fw-bold fa-11 px-2 py-1 rounded-3 ',
    OnProcess: ' bg-warning fw-bold fa-11 px-2 py-1 rounded-3 ',
    Completed: ' bg-success text-light fa-11 px-2 py-1 rounded-3 ',
    Canceled: ' bg-danger text-light fw-bold fa-11 px-2 py-1 rounded-3 '
}

const chooseColor = (orderStatus) => {
    // const DeliveryDetails = Number(orderStatus) > 0 ? 'Arrived' : 'Pending';
    switch (orderStatus) {
        case 'New Order': return statusColor.NewOrder;
        case 'On Process': return statusColor.OnProcess;
        case 'Completed': return statusColor.Completed;
        case 'Canceled': return statusColor.Canceled;
        default: return ''
    }
}

const createCol = (field, type, ColumnHeader) => {
    return {
        isVisible: 1,
        Field_Name: field,
        Fied_Data: type,
        ...(ColumnHeader && { ColumnHeader })
    }
}


export const displayColumns = ({ OrderStatus = 'ITEMS', dialogs, setOrderPreview, navigation }) => {

    const OrderId = createCol('OrderId', 'string', 'Order Id'),
        ItemName = createCol('ItemName', 'string', 'Item'),
        Rate = createCol('Rate', 'number'),
        LoadingDate = createCol('LoadingDate', 'date', 'Loading Date'),
        OwnerName = createCol('OwnerName', 'string', 'Owner Name'),
        BrokerName = createCol('BrokerName', 'string', 'Broker Name'),
        PartyName = createCol('PartyName', 'string', 'Party'),
        PaymentCondition = createCol('PaymentCondition', 'string', 'Payment Condition'),
        Remarks = createCol('Remarks', 'string'),
        TradeConfirmDate = createCol('TradeConfirmDate', 'date', 'Trade Confirm Date'),
        Condition = createCol('QualityCondition', 'string', 'Condition'),
        WeightWithUOM = {
            isVisible: 1,
            ColumnHeader: 'Weight',
            isCustomCell: true,
            Cell: ({ row }) => (
                row?.Weight ?? 0
            ) + ' ' + row?.Units
        },
        ItemArrivedQuantity = {
            isVisible: 1,
            ColumnHeader: 'Arrived Quantity',
            isCustomCell: true,
            Cell: ({ row }) => {
                const itemsInDelivery = row?.OrderDetails?.DeliveryDetails?.filter(del => isEqualNumber(del.ItemId, row?.ItemId));
                const WeightTotal = itemsInDelivery.reduce((acc, item) => Addition(acc, item?.Weight), 0);
                return WeightTotal
            }
        },
        PendingItemQuantity = {
            isVisible: 1,
            ColumnHeader: 'Pending-Quantity',
            isCustomCell: true,
            Cell: ({ row }) => {
                const itemsInDelivery = row?.OrderDetails?.DeliveryDetails?.filter(del => isEqualNumber(del.ItemId, row?.ItemId));
                const WeightTotal = itemsInDelivery.reduce((acc, item) => Addition(acc, item?.Weight), 0);
                return Subraction(row?.Weight, WeightTotal);
            }
        },
        ItemTradeConfirmDate = {
            isVisible: 1,
            isCustomCell: true,
            ColumnHeader: 'Date',
            Cell: ({ row }) => LocalDate(row?.OrderDetails?.TradeConfirmDate)
        }, OrderPartyName = {
            isVisible: 1,
            ColumnHeader: 'Party',
            isCustomCell: true,
            Cell: ({ row }) => row?.OrderDetails?.PartyName
        }, ItemOrderStatus = {
            isVisible: 1,
            ColumnHeader: 'Status',
            isCustomCell: true,
            Cell: ({ row }) => {
                const OrderStatus = row?.OrderDetails?.OrderStatus;
                return (
                    <span className={chooseColor(OrderStatus)}>
                        {String(OrderStatus).replace(' ', '')}
                    </span>
                )
            }
        }, OrderActions = {
            isVisible: 1,
            ColumnHeader: 'Action',
            isCustomCell: true,
            Cell: ({ row }) => {
                const OrderDetails = row ?? {};
                const OrderItemsArray = row?.ItemDetails ?? [];
                const DeliveryArray = row?.DeliveryDetails ?? [];
                const TranspoterArray = row?.TranspoterDetails ?? [];

                return (
                    <>
                        <Tooltip title='Preview Order'>
                            <span>
                                <IconButton
                                    size='small'
                                    color='primary'
                                    onClick={() => setOrderPreview(pre => ({
                                        ...pre,
                                        OrderDetails,
                                        OrderItemsArray,
                                        DeliveryArray,
                                        TranspoterArray,
                                        display: true,
                                    }))}
                                ><Preview /></IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title='Edit'>
                            <span>
                                <IconButton
                                    size='small'
                                    onClick={() => navigation({
                                        page: 'create',
                                        stateToTransfer: {
                                            OrderDetails,
                                            OrderItemsArray,
                                            DeliveryArray,
                                            TranspoterArray,
                                            editPage: 'PurchaseOderWithDelivery'
                                        }
                                    })}
                                ><Edit /></IconButton>
                            </span>
                        </Tooltip >

                        <Tooltip title='Delete Order'>
                            <span>
                                <IconButton
                                    size='small'
                                    onClick={() => dialogs(pre => ({ ...pre, deleteOrderDialog: true, deleteOrderId: row?.Id }))}
                                    color='error'
                                ><Delete /></IconButton>
                            </span>
                        </Tooltip>
                    </>
                )
            }
        }, ItemActions = {
            isVisible: 1,
            ColumnHeader: 'Action',
            isCustomCell: true,
            Cell: ({ row }) => {

                const OrderDetails = row?.OrderDetails;
                const { ItemDetails, DeliveryDetails, TranspoterDetails } = OrderDetails;

                return (
                    <>
                        <Tooltip title='Preview Order'>
                            <span>
                                <IconButton
                                    size='small'
                                    color='primary'
                                    onClick={() => setOrderPreview(pre => ({
                                        ...pre,
                                        OrderDetails,
                                        OrderItemsArray: ItemDetails,
                                        DeliveryArray: DeliveryDetails,
                                        TranspoterArray: TranspoterDetails,
                                        display: true,
                                    }))}
                                ><Preview /></IconButton>
                            </span>
                        </Tooltip>

                        <Tooltip title='Edit'>
                            <span>
                                <IconButton
                                    size='small'
                                    onClick={() => navigation({
                                        page: 'create',
                                        stateToTransfer: {
                                            OrderDetails,
                                            OrderItemsArray: ItemDetails,
                                            DeliveryArray: DeliveryDetails,
                                            TranspoterArray: TranspoterDetails,
                                            editPage: 'PurchaseOderWithDelivery'
                                        }
                                    })}
                                ><Edit /></IconButton>
                            </span>
                        </Tooltip >
                    </>
                )
            }
        }, GeneralStatus = {
            isVisible: 1,
            ColumnHeader: 'Status',
            isCustomCell: true,
            Cell: ({ row }) => {
                const OrderStatus = row?.OrderStatus;
                return (
                    <span className={chooseColor(OrderStatus)}>
                        {String(OrderStatus).replace(' ', '')}
                    </span>
                )
            }
        }


    switch (OrderStatus) {
        case 'ITEMS':
        case 'ITEMS PENDING':
        case 'ITEMS ARRIVED':
            return [
                OrderId, OrderPartyName, ItemTradeConfirmDate, ItemName, WeightWithUOM, ItemArrivedQuantity, PendingItemQuantity, Rate,  ItemActions
            ];
        case 'ORDERS':
            return [
                createCol('Id', 'string', 'Order Id'), TradeConfirmDate, PartyName, BrokerName, OwnerName, Remarks, GeneralStatus, OrderActions,
            ]
        case 'ORDERS PENDING':
        case 'ORDERS ARRIVED':
            return [
                createCol('Id', 'string', 'Order Id'), TradeConfirmDate, PartyName, BrokerName, OwnerName, Remarks, OrderActions,
            ]

        default:
            return [];
    }
}