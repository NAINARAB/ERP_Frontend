import { Addition, isEqualNumber, isGraterNumber, LocalDate, NumberFormat, Subraction } from "../../Components/functions";
import { IconButton, Tooltip } from '@mui/material';
import { Delete, Edit, Visibility } from '@mui/icons-material';

export const purchaseOrderDataSet = ({ data = [], status = 'ITEMS' }) => {

    switch (status) {
        case 'ITEMS':
        case 'REPORT 1':
        case 'REPORT 2':
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
                            TranspoterDetails: item.TranspoterDetails ?? [],
                            Ledger_Name: item.Ledger_Name,
                            Party_District: item.Party_District,
                        }
                    }));

                    return acc.concat(itemDetails);
                }, [])
            )

        case 'ITEMS PENDING':
        case 'REPORT 2A':
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
                            TranspoterDetails: item.TranspoterDetails ?? [],
                            Ledger_Name: item.Ledger_Name,
                            Party_District: item.Party_District,
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
                            TranspoterDetails: item.TranspoterDetails ?? [],
                            Ledger_Name: item.Ledger_Name,
                            Party_District: item.Party_District,
                        }
                    }));

                    return acc.concat(itemDetails);
                }, [])
            )

        case 'REPORT 3':
        case 'REPORT 4':
            return (
                data?.reduce((acc, item) => {
                    if (!Array.isArray(item?.DeliveryDetails)) return acc;

                    const DeliveryDetails = item.DeliveryDetails.map(o => ({
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
                            DeliveryDetails: item?.DeliveryDetails ?? [],
                            OrderStatus: item?.OrderStatus,
                            ItemDetails: item.ItemDetails ?? [],
                            LoadingDate: item.LoadingDate,
                            OwnerId: item.OwnerId ?? '',
                            OwnerName: item.OwnerName,
                            PartyAddress: item.PartyAddress,
                            PartyId: item.PartyId ?? '',
                            PartyName: item.PartyName,
                            PaymentCondition: item.PaymentCondition,
                            Remarks: item.Remarks,
                            TradeConfirmDate: item.TradeConfirmDate,
                            TranspoterDetails: item.TranspoterDetails ?? [],
                            Ledger_Name: item.Ledger_Name,
                            Party_District: item.Party_District,
                        }
                    }));

                    return acc.concat(DeliveryDetails);
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

    // Order Based Cells
    const OrderId = createCol('OrderId', 'string', 'Order Id'),
        OwnerName = createCol('OwnerName', 'string', 'Owner Name'),
        BrokerName = createCol('BrokerName', 'string', 'Broker Name'),
        PartyName = createCol('PartyName', 'string', 'Party'),
        PaymentCondition = createCol('PaymentCondition', 'string', 'Payment Condition'),
        Remarks = createCol('Remarks', 'string'),
        TradeConfirmDate = createCol('TradeConfirmDate', 'date', 'Trade Confirm Date'),
        LoadingDate = createCol('LoadingDate', 'date', 'Loading Date'),
        Condition = createCol('QualityCondition', 'string', 'Condition'),
        OrderPartyName = {
            isVisible: 1,
            ColumnHeader: 'Party',
            isCustomCell: true,
            Cell: ({ row }) => row?.OrderDetails?.PartyName
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
                                ><Visibility className="fa-16" /></IconButton>
                            </span>
                        </Tooltip>

                        {navigation && (
                            <Tooltip title='Edit'>
                                <span>
                                    <IconButton
                                        size='small'
                                        onClick={() => {
                                            navigation({
                                                page: '/dataEntry/purchaseOrder/create',
                                                stateToTransfer: {
                                                    OrderDetails,
                                                    OrderItemsArray,
                                                    DeliveryArray,
                                                    TranspoterArray,
                                                    editPage: 'PurchaseOderWithDelivery'
                                                }
                                            })
                                        }}
                                    ><Edit className="fa-16" /></IconButton>
                                </span>
                            </Tooltip >
                        )}

                        <Tooltip title='Delete Order'>
                            <span>
                                <IconButton
                                    size='small'
                                    onClick={() => dialogs(pre => ({ ...pre, deleteOrderDialog: true, deleteOrderId: row?.Id }))}
                                    color='error'
                                ><Delete className="fa-16" /></IconButton>
                            </span>
                        </Tooltip>
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
        }, OrderPO_ID = createCol('PO_ID', 'string', 'Order ID')

    // Item Based Cells
    const
        ItemPO_ID = {
            isVisible: 1,
            ColumnHeader: 'Order ID',
            isCustomCell: true,
            Cell: ({ row }) => row?.OrderDetails?.PO_ID ?? ''
        },
        ItemName = createCol('ItemName', 'string', 'Item'),
        Rate = createCol('Rate', 'number'),
        WeightWithUOM = {
            isVisible: 1,
            ColumnHeader: 'Weight',
            isCustomCell: true,
            Cell: ({ row }) => (
                row?.Weight ?? 0
            ) + ' ' + row?.Units
        }, ItemArrivedQuantity = {
            isVisible: 1,
            ColumnHeader: 'Arrived Quantity',
            isCustomCell: true,
            Cell: ({ row }) => {
                const itemsInDelivery = row?.OrderDetails?.DeliveryDetails?.filter(del => isEqualNumber(del.ItemId, row?.ItemId));
                const WeightTotal = itemsInDelivery.reduce((acc, item) => Addition(acc, item?.Weight), 0);
                return WeightTotal
            }
        }, PendingItemQuantity = {
            isVisible: 1,
            ColumnHeader: 'Pending-Quantity',
            isCustomCell: true,
            Cell: ({ row }) => {
                const itemsInDelivery = row?.OrderDetails?.DeliveryDetails?.filter(del => isEqualNumber(del.ItemId, row?.ItemId));
                const WeightTotal = itemsInDelivery.reduce((acc, item) => Addition(acc, item?.Weight), 0);
                return Subraction(row?.Weight, WeightTotal);
            }
        }, ItemTradeConfirmDate = {
            isVisible: 1,
            isCustomCell: true,
            ColumnHeader: 'Date',
            Cell: ({ row }) => LocalDate(row?.OrderDetails?.TradeConfirmDate)
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
                                ><Visibility className="fa-16" /></IconButton>
                            </span>
                        </Tooltip>

                        {navigation && (
                            <Tooltip title='Edit'>
                                <span>
                                    <IconButton
                                        size='small'
                                        onClick={() => navigation({
                                            page: '/dataEntry/purchaseOrder/create',
                                            stateToTransfer: {
                                                OrderDetails,
                                                OrderItemsArray: ItemDetails,
                                                DeliveryArray: DeliveryDetails,
                                                TranspoterArray: TranspoterDetails,
                                                editPage: 'PurchaseOderWithDelivery'
                                            }
                                        })}
                                    ><Edit className="fa-16" /></IconButton>
                                </span>
                            </Tooltip >
                        )}
                    </>
                )
            }
        };

    // Delivery Based Columns 
    const ArrivedDate = {
        isVisible: 1,
        isCustomCell: true,
        ColumnHeader: 'Arrived Date',
        Cell: ({ row }) => row?.ArrivalDate ? LocalDate(row?.ArrivalDate) : ''
    }, ArrivedLocation = createCol('Location', 'string'),
        ArrivalRate = {
            isVisible: 1,
            ColumnHeader: 'Rate',
            isCustomCell: true,
            Cell: ({ row }) => {
                const OrderedItems = Array.isArray(row?.OrderDetails?.ItemDetails) ? row?.OrderDetails?.ItemDetails : [];
                const rate = OrderedItems.find(o => isEqualNumber(o?.ItemId, row?.ItemId))?.Rate ?? 0
                return NumberFormat(rate);
            }
        }


    // Tally Column
    const OrderLOLLedgerName = createCol('Ledger_Name', 'string', 'LOL Ledger Name'),
        OrderLOLPartyDistrict = createCol('Party_District', 'string', 'LOL Party District'),
        ItemLOLLedgerName = {
            isVisible: 1,
            ColumnHeader: 'LOL Ledger Name',
            isCustomCell: true,
            Cell: ({ row }) => row?.OrderDetails?.Ledger_Name
        }, ItemLOLPartyDistrict = {
            isVisible: 1,
            ColumnHeader: 'LOL Party District',
            isCustomCell: true,
            Cell: ({ row }) => row?.OrderDetails?.Party_District
        }, StockItem = createCol('Stock_Item', 'string', 'Stock Item'),
        StockGroup = createCol('Stock_Group', 'string', 'Stock Group');


    switch (OrderStatus) {
        case 'ITEMS':
        case 'ITEMS PENDING':
        case 'ITEMS ARRIVED':
            return [
                ItemPO_ID, OrderPartyName, ItemTradeConfirmDate, ItemName, WeightWithUOM, ItemArrivedQuantity, PendingItemQuantity, Rate, ItemActions
            ];
        case 'ORDERS':
            return [
                OrderPO_ID, TradeConfirmDate, PartyName, BrokerName, OwnerName, Remarks, GeneralStatus, OrderActions,
            ]
        case 'ORDERS PENDING':
        case 'ORDERS ARRIVED':
            return [
                OrderPO_ID, TradeConfirmDate, PartyName, BrokerName, OwnerName, Remarks, OrderActions,
            ]

        case 'REPORT 1':
            return [
                ItemPO_ID, ItemTradeConfirmDate, ItemLOLLedgerName, ItemLOLPartyDistrict, StockGroup, WeightWithUOM, Rate, PendingItemQuantity, ItemActions
            ]
        case 'REPORT 2':
            return [
                ItemPO_ID, ItemTradeConfirmDate, StockGroup, StockItem, WeightWithUOM, Rate, PendingItemQuantity, ItemLOLLedgerName, ItemLOLPartyDistrict, ItemActions
            ]
        case 'REPORT 2A':
            return [
                ItemPO_ID, ItemTradeConfirmDate, StockGroup, StockItem, WeightWithUOM, Rate, PendingItemQuantity, ItemLOLLedgerName, ItemLOLPartyDistrict, ItemActions
            ]
        case 'REPORT 3':
            return [
                ItemPO_ID, ArrivedDate, ArrivedLocation, StockGroup, StockItem, WeightWithUOM, ArrivalRate, ItemLOLLedgerName, ItemLOLPartyDistrict, ItemActions
            ]
        case 'REPORT 4':
            return [
                ItemPO_ID, ArrivedDate, ArrivedLocation, ItemLOLLedgerName, ItemLOLPartyDistrict, StockGroup, ArrivalRate, WeightWithUOM, PendingItemQuantity, ItemActions
            ]

        default:
            return [];
    }
}