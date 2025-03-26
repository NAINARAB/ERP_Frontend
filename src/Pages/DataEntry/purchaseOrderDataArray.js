import { Addition, isEqualNumber, isGraterNumber, ISOString, LocalDate, Multiplication, Subraction, Division, checkIsNumber, NumberFormat, filterableText, toNumber } from "../../Components/functions";
import { IconButton, Tooltip } from '@mui/material';
import { Delete, Edit, ShoppingCartCheckout, Visibility } from '@mui/icons-material';

const isArr = (arr) => Array.isArray(arr)

export const purchaseOrderDataSet = ({ data = [], status = 'ITEMS' }) => {

    switch (status) {
        case 'ITEMS':
        case 'PO-Vendor-Wise':
        case 'PO-Item-Wise':
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
                            StaffDetails: isArr(item.StaffDetails) ? item.StaffDetails : [],
                            TranspoterDetails: isArr(item.TranspoterDetails) ? item.TranspoterDetails : [],
                            DeliveryDetails: isArr(item.DeliveryDetails) ? item.DeliveryDetails : [],
                            ConvertedAsInvoices: isArr(item.ConvertedAsInvoices) ? item.ConvertedAsInvoices : [],
                            LoadingDate: item.LoadingDate,
                            IsConvertedAsInvoice: item?.IsConvertedAsInvoice,
                            OwnerId: item.OwnerId ?? '',
                            OwnerName: item.OwnerName,
                            PartyAddress: item.PartyAddress,
                            PartyId: item.PartyId ?? '',
                            PartyName: item.PartyName,
                            PaymentCondition: item.PaymentCondition,
                            Remarks: item.Remarks,
                            TradeConfirmDate: item.TradeConfirmDate,
                            Ledger_Name: item.Ledger_Name,
                            Party_District: item.Party_District,
                            isConvertableArrivalExist: toNumber(item?.isConvertableArrivalExist),
                            IsConvertedAsInvoice: toNumber(item?.IsConvertedAsInvoice)
                        }
                    }));

                    return acc.concat(itemDetails);
                }, [])
            )

        case 'ITEMS PENDING':
        case 'PO-Pending-Only':
            return (
                data?.reduce((acc, item) => {
                    if (!Array.isArray(item?.ItemDetails)) return acc;

                    const itemDetails = item?.ItemDetails?.filter(fil => {
                        const itemsInDelivery = item?.DeliveryDetails?.filter(del => isEqualNumber(del.ItemId, fil?.ItemId));
                        const WeightTotal = itemsInDelivery.reduce((sum, delivery) => Addition(sum, delivery?.Weight), 0);
                        return (
                            Number(WeightTotal) < Number(fil?.Weight)
                            && filterableText(item.OrderStatus) !== filterableText('Canceled')
                        );
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
                            StaffDetails: isArr(item.StaffDetails) ? item.StaffDetails : [],
                            TranspoterDetails: isArr(item.TranspoterDetails) ? item.TranspoterDetails : [],
                            DeliveryDetails: isArr(item.DeliveryDetails) ? item.DeliveryDetails : [],
                            ConvertedAsInvoices: isArr(item.ConvertedAsInvoices) ? item.ConvertedAsInvoices : [],
                            LoadingDate: item.LoadingDate,
                            IsConvertedAsInvoice: item?.IsConvertedAsInvoice,
                            OwnerId: item.OwnerId ?? '',
                            OwnerName: item.OwnerName,
                            PartyAddress: item.PartyAddress,
                            PartyId: item.PartyId ?? '',
                            PartyName: item.PartyName,
                            PaymentCondition: item.PaymentCondition,
                            Remarks: item.Remarks,
                            TradeConfirmDate: item.TradeConfirmDate,
                            Ledger_Name: item.Ledger_Name,
                            Party_District: item.Party_District,
                            isConvertableArrivalExist: toNumber(item?.isConvertableArrivalExist),
                            IsConvertedAsInvoice: toNumber(item?.IsConvertedAsInvoice)
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
                            StaffDetails: isArr(item.StaffDetails) ? item.StaffDetails : [],
                            TranspoterDetails: isArr(item.TranspoterDetails) ? item.TranspoterDetails : [],
                            DeliveryDetails: isArr(item.DeliveryDetails) ? item.DeliveryDetails : [],
                            ConvertedAsInvoices: isArr(item.ConvertedAsInvoices) ? item.ConvertedAsInvoices : [],
                            LoadingDate: item.LoadingDate,
                            IsConvertedAsInvoice: item?.IsConvertedAsInvoice,
                            OwnerId: item.OwnerId ?? '',
                            OwnerName: item.OwnerName,
                            PartyAddress: item.PartyAddress,
                            PartyId: item.PartyId ?? '',
                            PartyName: item.PartyName,
                            PaymentCondition: item.PaymentCondition,
                            Remarks: item.Remarks,
                            TradeConfirmDate: item.TradeConfirmDate,
                            Ledger_Name: item.Ledger_Name,
                            Party_District: item.Party_District,
                            isConvertableArrivalExist: toNumber(item?.isConvertableArrivalExist),
                            IsConvertedAsInvoice: toNumber(item?.IsConvertedAsInvoice)
                        }
                    }));

                    return acc.concat(itemDetails);
                }, [])
            )

        case 'AR-Item-Based':
        case 'AR-Vendor-Wise':
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
                            ItemDetails: isArr(item.ItemDetails) ? item.ItemDetails : [],
                            StaffDetails: isArr(item.StaffDetails) ? item.StaffDetails : [],
                            TranspoterDetails: isArr(item.TranspoterDetails) ? item.TranspoterDetails : [],
                            DeliveryDetails: isArr(item.DeliveryDetails) ? item.DeliveryDetails : [],
                            ConvertedAsInvoices: isArr(item.ConvertedAsInvoices) ? item.ConvertedAsInvoices : [],
                            OrderStatus: item?.OrderStatus,
                            LoadingDate: item.LoadingDate,
                            IsConvertedAsInvoice: item?.IsConvertedAsInvoice,
                            OwnerId: item.OwnerId ?? '',
                            OwnerName: item.OwnerName,
                            PartyAddress: item.PartyAddress,
                            PartyId: item.PartyId ?? '',
                            PartyName: item.PartyName,
                            PaymentCondition: item.PaymentCondition,
                            Remarks: item.Remarks,
                            TradeConfirmDate: item.TradeConfirmDate,
                            Ledger_Name: item.Ledger_Name,
                            Party_District: item.Party_District,
                            isConvertableArrivalExist: toNumber(item?.isConvertableArrivalExist),
                            IsConvertedAsInvoice: toNumber(item?.IsConvertedAsInvoice)
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
        case 'COMPLETED ORDERS':
            return data.reduce((acc, item) => {

                if (item?.OrderStatus !== 'Completed') return acc;

                return acc.concat(item);

            }, [])
        case 'IN-COMPLETED ORDERS':
            return data.reduce((acc, item) => {

                if (item?.OrderStatus === 'Completed') return acc;

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

// const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

// const getActQty = (item, products) => {
//     console.log(item)
//     const productDetails = findProductDetails(products, item?.ItemId);
//     const pack = parseFloat(productDetails?.PackGet ?? 0);
//     const Quantity = Division(item.Weight, pack);
//     console.log({pack, Quantity})
//     return Quantity;
// }

export const displayColumns = ({ OrderStatus = 'ITEMS', dialogs, setOrderPreview, navigation, products }) => {

    // Order Based Cells
    const OrderId = createCol('OrderId', 'string', 'Order Id'),
        // OwnerName = createCol('OwnerName', 'string', 'Owner Name'),
        OwnerName = {
            isVisible: 1,
            ColumnHeader: 'Owners',
            isCustomCell: true,
            Cell: ({ row }) => {
                return row?.StaffDetails?.filter(staff => staff.Cost_Category === 'Owners').map(staff => (
                    staff.Emp_Name
                )).join(', ')
            }
        },
        BrokerName = {
            isVisible: 1,
            ColumnHeader: 'Brokers',
            isCustomCell: true,
            Cell: ({ row }) => {
                return row?.StaffDetails?.filter(staff => staff.Cost_Category === 'Broker').map(staff => (
                    staff.Emp_Name
                )).join(', ')
            }
        },
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
                const OrderDetails = row;
                const {
                    ItemDetails = [],
                    DeliveryDetails = [],
                    StaffDetails = [],
                    TranspoterDetails = [],
                    ConvertedAsInvoices = []
                } = OrderDetails;

                const isConvertableArrivalExist = isEqualNumber(row?.isConvertableArrivalExist, 1);
                const IsConvertedAsInvoice = isEqualNumber(row?.IsConvertedAsInvoice, 1);

                return (
                    <>
                        <Tooltip title='Preview Order'>
                            <span>
                                <IconButton
                                    size='small'
                                    color='primary'
                                    onClick={() => setOrderPreview(pre => ({
                                        ...pre,
                                        OrderDetails: OrderDetails,
                                        OrderItemsArray: ItemDetails,
                                        DeliveryArray: DeliveryDetails,
                                        TranspoterArray: TranspoterDetails,
                                        StaffArray: StaffDetails,
                                        // ConvertedAsInvoices: ConvertedAsInvoices,
                                        display: true,
                                    }))}
                                ><Visibility className="fa-16" /></IconButton>
                            </span>
                        </Tooltip>

                        {(
                            navigation
                            && isConvertableArrivalExist
                            && OrderDetails?.OrderStatus === 'Completed'
                        ) && (
                                <Tooltip title='Convert to invoice'>
                                    <IconButton
                                        size="small"
                                        onClick={() => {
                                            navigation({
                                                page: '/erp/purchase/invoice/create',
                                                stateToTransfer: {
                                                    invoiceInfo: {
                                                        Branch_Id: OrderDetails?.BranchId,
                                                        Po_Inv_Date: ISOString(),
                                                        Po_Entry_Date: OrderDetails?.LoadingDate ? ISOString(OrderDetails?.LoadingDate) : ISOString(),
                                                        Retailer_Id: OrderDetails?.PartyId,
                                                        Retailer_Name: OrderDetails?.PartyName
                                                    },
                                                    orderInfo: DeliveryDetails.filter(
                                                        fil => toNumber(fil.pendingInvoiceWeight) > 0
                                                    ).map(item => ({
                                                        POI_St_Id: '',
                                                        DeliveryId: item?.Trip_Item_SNo,
                                                        OrderId: item?.OrderId,
                                                        Location_Id: item?.LocationId,
                                                        Item_Id: item?.ItemId,
                                                        Bill_Qty: item?.pendingInvoiceWeight,
                                                        Act_Qty: item?.Weight,
                                                        Bill_Alt_Qty: item?.Quantity,
                                                        Item_Rate: item?.BilledRate,
                                                        Amount: Multiplication(item?.BilledRate, item?.Weight),
                                                        Free_Qty: 0,
                                                        Batch_No: item?.BatchLocation,
                                                    })),
                                                    staffInfo: StaffDetails.map(staff => ({
                                                        Involved_Emp_Id: Number(staff.EmployeeId),
                                                        Involved_Emp_Name: staff.Emp_Name,
                                                        Cost_Center_Type_Id: Number(staff.CostType),
                                                    }))
                                                }
                                            })
                                        }}
                                    ><ShoppingCartCheckout /></IconButton>
                                </Tooltip>
                            )}

                        {(navigation && !IsConvertedAsInvoice) && (
                            <Tooltip title='Edit'>
                                <span>
                                    <IconButton
                                        size='small'
                                        onClick={() => {
                                            navigation({
                                                page: 'create',
                                                stateToTransfer: {
                                                    OrderDetails: OrderDetails,
                                                    OrderItemsArray: ItemDetails,
                                                    DeliveryArray: DeliveryDetails,
                                                    TranspoterArray: TranspoterDetails,
                                                    StaffArray: StaffDetails,
                                                    editPage: 'PurchaseOderWithDelivery'
                                                }
                                            })
                                        }}
                                    ><Edit className="fa-16" /></IconButton>
                                </span>
                            </Tooltip >
                        )}

                        {isConvertableArrivalExist && (
                            <Tooltip title='Delete Order'>
                                <span>
                                    <IconButton
                                        size='small'
                                        onClick={() => dialogs(pre => ({ ...pre, deleteOrderDialog: true, deleteOrderId: row?.Id }))}
                                        color='error'
                                    ><Delete className="fa-16" /></IconButton>
                                </span>
                            </Tooltip>
                        )}
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
            Cell: ({ row }) => checkIsNumber(row?.Weight) ? NumberFormat(row?.Weight) : 0
            // + ' ' + row?.Units
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
        }, ItemOwnerName = {
            isVisible: 1,
            ColumnHeader: 'Owners',
            isCustomCell: true,
            Cell: ({ row }) => {
                const OrderDetails = row?.OrderDetails;
                const { StaffDetails } = OrderDetails;
                return StaffDetails?.filter(staff => staff.Cost_Category === 'Owners').map(staff => (
                    staff.Emp_Name
                )).join(', ')
            }
        }, ItemBrokerName = {
            isVisible: 1,
            ColumnHeader: 'Brokers',
            isCustomCell: true,
            Cell: ({ row }) => {
                const OrderDetails = row?.OrderDetails;
                const { StaffDetails } = OrderDetails;
                return StaffDetails?.filter(staff => staff.Cost_Category === 'Broker').map(staff => (
                    staff.Emp_Name
                )).join(', ')
            }
        }, ItemActions = {
            isVisible: 1,
            ColumnHeader: 'Action',
            isCustomCell: true,
            Cell: ({ row }) => {

                const OrderDetails = row?.OrderDetails;
                const { ItemDetails, DeliveryDetails, TranspoterDetails, StaffDetails } = OrderDetails;
                // const isConvertableArrivalExist = isEqualNumber(row?.isConvertableArrivalExist, 1);
                const IsConvertedAsInvoice = isEqualNumber(row?.IsConvertedAsInvoice, 1);


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
                                        StaffArray: StaffDetails,
                                        display: true,
                                    }))}
                                ><Visibility className="fa-16" /></IconButton>
                            </span>
                        </Tooltip>

                        {(navigation && !IsConvertedAsInvoice) && (
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
                                                StaffArray: StaffDetails,
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
                const OrderedRate = OrderedItems.find(o => isEqualNumber(o?.ItemId, row?.ItemId))?.Rate ?? 0
                const BilledRate = Number(row?.BilledRate);
                return `${BilledRate} (${isGraterNumber(BilledRate, OrderedRate) ? ('+' + (BilledRate - OrderedRate)) : ('-' + (OrderedRate - BilledRate))})`
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
                ItemPO_ID, OrderPartyName, ItemTradeConfirmDate, ItemName, WeightWithUOM,
                ItemArrivedQuantity, PendingItemQuantity, Rate, ItemOwnerName, ItemBrokerName, ItemActions
            ];
        case 'ORDERS':
        case 'COMPLETED ORDERS':
        case 'IN-COMPLETED ORDERS':
            return [
                OrderPO_ID, TradeConfirmDate, PartyName, BrokerName, OwnerName, Remarks, GeneralStatus, OrderActions,
            ]
        case 'ORDERS PENDING':
        case 'ORDERS ARRIVED':
            return [
                OrderPO_ID, TradeConfirmDate, PartyName, BrokerName, OwnerName, Remarks, OrderActions,
            ]

        case 'PO-Vendor-Wise':
            return [
                ItemPO_ID, ItemTradeConfirmDate, ItemLOLLedgerName, ItemLOLPartyDistrict, StockGroup, WeightWithUOM, Rate, PendingItemQuantity, ItemActions
            ]
        case 'PO-Item-Wise':
            return [
                ItemPO_ID, ItemTradeConfirmDate, StockGroup, StockItem, WeightWithUOM, Rate, PendingItemQuantity, ItemLOLLedgerName, ItemLOLPartyDistrict, ItemActions
            ]
        case 'PO-Pending-Only':
            return [
                ItemPO_ID, ItemTradeConfirmDate, StockGroup, StockItem, WeightWithUOM, Rate, PendingItemQuantity, ItemLOLLedgerName, ItemLOLPartyDistrict, ItemActions
            ]
        case 'AR-Item-Based':
            return [
                ItemPO_ID, ArrivedDate, ArrivedLocation, StockGroup, StockItem, WeightWithUOM, ArrivalRate, ItemLOLLedgerName, ItemLOLPartyDistrict, ItemActions
            ]
        case 'AR-Vendor-Wise':
            return [
                ItemPO_ID, ArrivedDate, ArrivedLocation, ItemLOLLedgerName, ItemLOLPartyDistrict, StockGroup, ArrivalRate, WeightWithUOM, PendingItemQuantity, ItemActions
            ]
        default:
            return [];
    }
}