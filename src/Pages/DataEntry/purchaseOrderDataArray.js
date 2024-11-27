import { isEqualNumber, isGraterNumber, LocalDate } from "../../Components/functions";
import { IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';

export const purchaseOrderDataSet = ({ data = [], status = 'ITEMS' }) => {

    switch (status) {
        case 'ITEMS':
            return (
                data?.reduce((acc, item) => {
                    if (!Array.isArray(item?.ItemDetails)) return acc;

                    const itemDetails = item.ItemDetails.map(o => ({
                        ...o,
                        OrderDetails: {
                            BrokerName: item.BrokerName,
                            CreatedBy: item.CreatedBy,
                            CreatedAt: item.CreatedAt,
                            DeliveryDetails: item.DeliveryDetails ?? [],
                            LoadingDate: item.LoadingDate,
                            OwnerName: item.OwnerName,
                            PartyAddress: item.PartyAddress,
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
                    if (!Array.isArray(item?.ItemDetails) || isGraterNumber(item?.DeliveryDetails?.length, 0)) return acc;

                    const itemDetails = item.ItemDetails.map(o => ({
                        ...o,
                        OrderDetails: {
                            BrokerName: item.BrokerName,
                            CreatedBy: item.CreatedBy,
                            CreatedAt: item.CreatedAt,
                            DeliveryDetails: item.DeliveryDetails ?? [],
                            LoadingDate: item.LoadingDate,
                            OwnerName: item.OwnerName,
                            PartyAddress: item.PartyAddress,
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
                    if (!Array.isArray(item?.ItemDetails) || isEqualNumber(item?.DeliveryDetails?.length, 0)) return acc;

                    const itemDetails = item.ItemDetails.map(o => ({
                        ...o,
                        OrderDetails: {
                            BrokerName: item.BrokerName,
                            CreatedBy: item.CreatedBy,
                            CreatedAt: item.CreatedAt,
                            DeliveryDetails: item.DeliveryDetails ?? [],
                            LoadingDate: item.LoadingDate,
                            OwnerName: item.OwnerName,
                            PartyAddress: item.PartyAddress,
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
    Pending: ' bg-warning fw-bold fa-11 px-2 py-1 rounded-3 ',
    Completed: ' bg-success text-light fa-11 px-2 py-1 rounded-3 ',
    Canceled: ' bg-danger text-light fw-bold fa-11 px-2 py-1 rounded-3 '
}

const chooseColor = (orderStatus) => {
    const DeliveryDetails = Number(orderStatus) > 0 ? 'Arrived' : 'Pending';
    switch (DeliveryDetails) {
        case 'Pending': return { class: statusColor.Pending, label: DeliveryDetails };
        case 'Arrived': return { class: statusColor.Completed, label: DeliveryDetails };
        case 'Canceled': return { class: statusColor.Canceled, label: DeliveryDetails };
        default: return { class: '', label: '' }
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


export const displayColumns = (orderStatus = 'ITEMS', dialogs) => {

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
        Cell: ({ row }) => (row?.Weight ?? 0) + ' ' + row?.Units
    }, 
    ItemTradeConfirmDate = {
        isVisible: 1,
        isCustomCell: true,
        ColumnHeader: 'Date',
        Cell: ({ row }) => LocalDate(row?.ItemDetails?.TradeConfirmDate)
    }, OrderPartyName = {
        isVisible: 1,
        ColumnHeader: 'Party',
        isCustomCell: true,
        Cell: ({ row }) => row?.OrderDetails?.PartyName
    }, OrderStatus = {
        isVisible: 1,
        ColumnHeader: 'Status',
        isCustomCell: true,
        Cell: ({ row }) => {
            const orderDetailsDeliveryCount = row?.OrderDetails?.DeliveryDetails?.length;
            const deliveryCount = row?.DeliveryDetails?.length;
            return (
                <span className={chooseColor(orderDetailsDeliveryCount ?? deliveryCount).class}>
                    {chooseColor(orderDetailsDeliveryCount ?? deliveryCount).label}
                </span>
            )
        }
    }, OrderActions = {
        isVisible: 1,
        ColumnHeader: 'Action',
        isCustomCell: true,
        Cell: ({ row }) => {

            return(
                <>
                    <IconButton
                        size='small'
                        onClick={() => dialogs(pre => ({...pre, deleteOrderDialog: true, deleteOrderId: row?.Id}))}
                        color='error'
                    ><Delete /></IconButton>
                </>
            )
        }
    }


    switch (orderStatus) {
        case 'ITEMS':
            return [
                OrderId, ItemName, ItemTradeConfirmDate, WeightWithUOM, Rate, Condition, OrderPartyName, OrderStatus,
            ];
        case 'ITEMS PENDING':
        case 'ITEMS ARRIVED':
            return [
                OrderId, ItemName, ItemTradeConfirmDate, WeightWithUOM, Rate, Condition, OrderPartyName,
            ];
        case 'ORDERS':
            return [
                createCol('Id', 'string', 'Order Id'), TradeConfirmDate, PartyName, Remarks, BrokerName, OwnerName, OrderStatus, OrderActions, 
            ]
        case 'ORDERS PENDING':
        case 'ORDERS ARRIVED':
            return [
                createCol('Id', 'string', 'Order Id'), TradeConfirmDate, PartyName, Remarks, BrokerName, OwnerName, OrderActions,
            ]

        default:
            return [];
    }
}