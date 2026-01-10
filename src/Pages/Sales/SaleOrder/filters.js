import { 
  Addition, 
  isEqualNumber, 
  ISOString, 
  LocalDate, 
  Multiplication, 
  Subraction, 
  checkIsNumber, 
  NumberFormat, 
  filterableText, 
  toNumber 
} from "../../../Components/functions";
import { IconButton, Tooltip } from '@mui/material';
import { Delete, Edit, ShoppingCartCheckout, Visibility } from '@mui/icons-material';

const isArr = (arr) => Array.isArray(arr)


const SALES_VIEW_CONFIGS = {
  'ITEMS': {
    dataTransformer: (data) => transformSalesItemBasedData(data, 'all'),
    columns: ['OrderId', 'Party', 'Date', 'Item', 'Quantity', 'ArrivedQuantity', 'PendingQuantity', 'Rate', 'Amount', 'Actions']
  },
  'ITEMS PENDING': {
    dataTransformer: (data) => transformSalesItemBasedData(data, 'pending'),
    columns: ['OrderId', 'Party', 'Date', 'Item', 'Quantity', 'ArrivedQuantity', 'PendingQuantity', 'Rate', 'Amount', 'Actions']
  },
  'ITEMS DELIVERED': {
    dataTransformer: (data) => transformSalesItemBasedData(data, 'arrived'),
    columns: ['OrderId', 'Party', 'Date', 'Item', 'Quantity', 'ArrivedQuantity', 'PendingQuantity', 'Rate', 'Amount', 'Actions']
  },
  'ORDERS': {
    dataTransformer: (data) => data,
    columns: ['OrderId', 'Date', 'Party', 'InvoiceValue', 'DeliveryStatus', 'Status', 'Actions']
  },
  'COMPLETED ORDERS': {
    dataTransformer: (data) => filterSalesOrdersByStatus(data, 'completed'),
    columns: ['OrderId', 'Date', 'Party', 'InvoiceValue', 'DeliveryStatus', 'Status', 'Actions']
  },
  'IN-COMPLETED ORDERS': {
    dataTransformer: (data) => filterSalesOrdersByStatus(data, 'incomplete'),
    columns: ['OrderId', 'Date', 'Party', 'InvoiceValue', 'DeliveryStatus', 'Status', 'Actions']
  },
  'ORDERS PENDING': {
    dataTransformer: (data) => filterSalesOrdersByDelivery(data, 'noDelivery'),
    columns: ['OrderId', 'Date', 'Party', 'InvoiceValue', 'Actions']
  },
  'ORDERS ARRIVED': {
    dataTransformer: (data) => filterSalesOrdersByDelivery(data, 'hasDelivery'),
    columns: ['OrderId', 'Date', 'Party', 'InvoiceValue', 'DeliveryCount', 'Actions']
  }
};


const transformSalesItemBasedData = (data, filterType = 'all') => {
  return data?.reduce((acc, order) => {
    if (!Array.isArray(order?.OrderStockDetails)) return acc;

    let filteredItems = order.OrderStockDetails;
    
    if (filterType === 'pending') {
      filteredItems = order.OrderStockDetails?.filter(item => {
        const deliveries = order?.DeliveryDetails || [];
        const itemsInDelivery = deliveries.filter(del => 
          del.StockDetails?.some(stock => isEqualNumber(stock.Item_Id, item?.Item_Id))
        );
        const deliveredQty = itemsInDelivery.reduce((sum, delivery) => {
          const stockItem = delivery.StockDetails?.find(stock => 
            isEqualNumber(stock.Item_Id, item?.Item_Id)
          );
          return Addition(sum, stockItem?.Bill_Qty || 0);
        }, 0);
        return Number(deliveredQty) < Number(item?.Bill_Qty);
      });
    } else if (filterType === 'arrived') {
      filteredItems = order.OrderStockDetails?.filter(item => {
        const deliveries = order?.DeliveryDetails || [];
        const itemsInDelivery = deliveries.filter(del => 
          del.StockDetails?.some(stock => isEqualNumber(stock.Item_Id, item?.Item_Id))
        );
        const deliveredQty = itemsInDelivery.reduce((sum, delivery) => {
          const stockItem = delivery.StockDetails?.find(stock => 
            isEqualNumber(stock.Item_Id, item?.Item_Id)
          );
          return Addition(sum, stockItem?.Bill_Qty || 0);
        }, 0);
        return Number(deliveredQty) >= Number(item?.Bill_Qty);
      });
    }

    const itemDetails = filteredItems.map(item => ({
      ...item,
      OrderDetails: getSalesOrderDetails(order)
    }));

    return acc.concat(itemDetails);
  }, []);
};

const transformSalesDeliveryBasedData = (data) => {
  return data?.reduce((acc, order) => {
    if (!Array.isArray(order?.DeliveryDetails)) return acc;

    const deliveryDetails = order.DeliveryDetails.map(delivery => ({
      ...delivery,
      OrderDetails: getSalesOrderDetails(order),
      // Flatten StockDetails if needed
      StockDetails: isArr(delivery.StockDetails) ? delivery.StockDetails : []
    }));

    return acc.concat(deliveryDetails);
  }, []);
};

const filterSalesOrdersByStatus = (data, status) => {
  return data.reduce((acc, order) => {
    const isCanceled = order?.Cancel_status !== "0";
    const isCompleted = order?.DeliveryDetails?.length > 0;
    
    if (status === 'completed' && (!isCompleted || isCanceled)) return acc;
    if (status === 'incomplete' && (isCompleted && !isCanceled)) return acc;
    return acc.concat(order);
  }, []);
};

const filterSalesOrdersByDelivery = (data, type) => {
  return data.reduce((acc, order) => {
    const hasDelivery = Array.isArray(order?.DeliveryDetails) && order.DeliveryDetails.length > 0;
    if (type === 'noDelivery' && hasDelivery) return acc;
    if (type === 'hasDelivery' && !hasDelivery) return acc;
    return acc.concat(order);
  }, []);
};

const getSalesOrderDetails = (order) => ({
  // Sales Order Details
  S_Id: order?.S_Id,
  So_Id: order?.So_Id,
  So_Inv_No: order?.So_Inv_No,
  So_Date: order?.So_Date,
  Retailer_Id: order?.Retailer_Id,
  Sales_Person_Id: order?.Sales_Person_Id,
  Branch_Id: order?.Branch_Id,
  
  // Retailer/Party Details
  Ledger_Name: order?.Ledger_Name || 
    (order?.DeliveryDetails?.[0]?.Ledger_Name) || 
    (order?.OrderStockDetails?.[0]?.Ledger_Name),
  Party_District: order?.Party_District || 
    (order?.DeliveryDetails?.[0]?.Party_District) || 
    (order?.OrderStockDetails?.[0]?.Party_District),
  
  // Financial Details
  Total_Invoice_value: order?.Total_Invoice_value,
  Total_Before_Tax: order?.Total_Before_Tax,
  Round_off: order?.Round_off,
  
  // Status Details
  Cancel_status: order?.Cancel_status,
  isConverted: order?.isConverted,
  IsConvertedAsInvoice: toNumber(order?.IsConvertedAsInvoice),
  isConvertableArrivalExist: toNumber(order?.isConvertableArrivalExist),
  
  // Arrays
  OrderStockDetails: isArr(order.OrderStockDetails) ? order.OrderStockDetails : [],
  DeliveryDetails: isArr(order.DeliveryDetails) ? order.DeliveryDetails : [],
  StaffDetails: isArr(order.StaffDetails) ? order.StaffDetails : [],
  
  // Dates
  Created_on: order?.Created_on,
  Alterd_on: order?.Alterd_on,
  
  // Additional fields
  Narration: order?.Narration,
  VoucherType: order?.VoucherType,
  GST_Inclusive: order?.GST_Inclusive
});

export const salesOrderDataSet = ({ data = [], status = 'ITEMS' }) => {
  const config = SALES_VIEW_CONFIGS[status];
  return config ? config.dataTransformer(data) : [];
};

// Status styling for Sales Orders
const salesStatusColor = {
  Active: 'bg-info fw-bold fa-11 px-2 py-1 rounded-3',
  Delivered: 'bg-success text-light fa-11 px-2 py-1 rounded-3',
  Canceled: 'bg-danger text-light fw-bold fa-11 px-2 py-1 rounded-3',
  Pending: 'bg-warning fw-bold fa-11 px-2 py-1 rounded-3'
};

const getSalesStatusColor = (order) => {
  const isCanceled = order?.Cancel_status !== "0";
  const hasDelivery = Array.isArray(order?.DeliveryDetails) && order.DeliveryDetails.length > 0;
  
  if (isCanceled) return salesStatusColor.Canceled;
  if (hasDelivery) return salesStatusColor.Delivered;
  return salesStatusColor.Pending;
};

const getSalesStatusText = (order) => {
  const isCanceled = order?.Cancel_status !== "0";
  const hasDelivery = Array.isArray(order?.DeliveryDetails) && order.DeliveryDetails.length > 0;
  
  if (isCanceled) return 'Canceled';
  if (hasDelivery) return 'Delivered';
  return 'Pending';
};

// Column definitions for SALES ORDERS
const SALES_COLUMN_DEFINITIONS = {
  // Common columns
  OrderId: {
    type: 'string',
    header: 'Order ID',
    getValue: (row) => row?.So_Inv_No || row?.OrderDetails?.So_Inv_No || ''
  },
  
  Date: {
    type: 'custom',
    header: 'Order Date',
    getValue: (row) => LocalDate(row?.So_Date || row?.OrderDetails?.So_Date)
  },
  
  Party: {
    type: 'custom',
    header: 'Party',
    getValue: (row) => {
      const orderDetails = row?.OrderDetails || row;
      return orderDetails?.Ledger_Name || 'N/A';
    }
  },
  
  InvoiceValue: {
    type: 'custom',
    header: 'Invoice Value',
    getValue: (row) => {
      const value = row?.Total_Invoice_value || row?.OrderDetails?.Total_Invoice_value;
      return checkIsNumber(value) ? NumberFormat(value) : '0';
    }
  },
  
//   DeliveryStatus: {
//     type: 'custom',
//     header: 'Delivery Status',
//     getValue: (row) => {
//       const order = row?.OrderDetails || row;
//       const deliveryCount = order?.DeliveryDetails?.length || 0;
//       return deliveryCount > 0 ? `${deliveryCount} Delivery(s)` : 'No Delivery';
//     }
//   }
//   ,
  
  Status: {
    type: 'custom',
    header: 'Status',
    getValue: (row) => {
      const order = row?.OrderDetails || row;
      const statusText = getSalesStatusText(order);
      const statusClass = getSalesStatusColor(order);
      
      return (
        <span className={statusClass}>
          {statusText}
        </span>
      );
    }
  },
  
//   Actions: {
//     type: 'custom',
//     header: 'Action',
//     getValue: (row, props) => renderSalesActions(row, props)
//   },
  
  // Item-based columns
  Item: {
    type: 'string',
    header: 'Item',
    getValue: (row) => row?.Stock_Item || 'N/A'
  },
  
  Quantity: {
    type: 'custom',
    header: 'Quantity',
    getValue: (row) => {
      const qty = row?.Bill_Qty || row?.Total_Qty;
      return checkIsNumber(qty) ? NumberFormat(qty) : '0';
    }
  },
  
  ArrivedQuantity: {
    type: 'custom',
    header: 'Delivered Qty',
    getValue: (row) => {
      const orderDetails = row?.OrderDetails;
      const itemId = row?.Item_Id;
      const deliveries = orderDetails?.DeliveryDetails || [];
      
      const deliveredQty = deliveries.reduce((sum, delivery) => {
        const stockItem = delivery.StockDetails?.find(stock => 
          isEqualNumber(stock.Item_Id, itemId)
        );
        return Addition(sum, stockItem?.Bill_Qty || 0);
      }, 0);
      
      return deliveredQty;
    }
  },
  
  PendingQuantity: {
    type: 'custom',
    header: 'Pending Qty',
    getValue: (row) => {
      const orderDetails = row?.OrderDetails;
      const itemId = row?.Item_Id;
      const orderedQty = Number(row?.Bill_Qty || 0);
      const deliveries = orderDetails?.DeliveryDetails || [];
      
      const deliveredQty = deliveries.reduce((sum, delivery) => {
        const stockItem = delivery.StockDetails?.find(stock => 
          isEqualNumber(stock.Item_Id, itemId)
        );
        return Addition(sum, stockItem?.Bill_Qty || 0);
      }, 0);
      
      return Subraction(orderedQty, deliveredQty);
    }
  },
  
  Rate: {
    type: 'custom',
    header: 'Rate',
    getValue: (row) => {
      const rate = row?.Item_Rate || row?.Taxable_Rate;
      return checkIsNumber(rate) ? NumberFormat(rate) : '0';
    }
  },
  
  Amount: {
    type: 'custom',
    header: 'Amount',
    getValue: (row) => {
      const amount = row?.Amount || row?.Final_Amo;
      return checkIsNumber(amount) ? NumberFormat(amount) : '0';
    }
  },
  
  DeliveryCount: {
    type: 'custom',
    header: 'Deliveries',
    getValue: (row) => {
      const deliveries = row?.DeliveryDetails || row?.OrderDetails?.DeliveryDetails || [];
      return deliveries.length;
    }
  },
  
  // Tally columns
  Stock_Item: {
    type: 'string',
    header: 'Stock Item',
    getValue: (row) => row?.Stock_Item
  },
  
  Stock_Group: {
    type: 'string',
    header: 'Stock Group',
    getValue: (row) => row?.Stock_Group
  }
};

// Sales Order Action renderer
const renderSalesActions = (row, { setOrderPreview, navigation, EditRights, DeleteRights, AddRights, dialogs }) => {
  const orderDetails = row?.OrderDetails || row;
  const {
    OrderStockDetails = [],
    DeliveryDetails = [],
    StaffDetails = []
  } = orderDetails;

  const isCanceled = orderDetails?.Cancel_status !== "0";
  const hasDelivery = DeliveryDetails?.length > 0;

  return (
    <>
      <Tooltip title='Preview Order'>
        <span>
          <IconButton
            size='small'
            color='primary'
            onClick={() => setOrderPreview && setOrderPreview(pre => ({
              ...pre,
              OrderDetails: orderDetails,
              OrderItemsArray: OrderStockDetails,
              DeliveryArray: DeliveryDetails,
              StaffArray: StaffDetails,
              display: true,
            }))}
          >
            <Visibility className="fa-16" />
          </IconButton>
        </span>
      </Tooltip>

      {navigation && !isCanceled && !hasDelivery && EditRights && (
        <Tooltip title='Edit'>
          <span>
            <IconButton
              size='small'
              onClick={() => {
                navigation({
                  page: 'create', // Adjust this to your sales order create page
                  stateToTransfer: {
                    OrderDetails: orderDetails,
                    OrderItemsArray: OrderStockDetails,
                    DeliveryArray: DeliveryDetails,
                    StaffArray: StaffDetails,
                    editPage: 'SalesOrder'
                  }
                });
              }}
            >
              <Edit className="fa-16" />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {!isCanceled && !hasDelivery && DeleteRights && (
        <Tooltip title='Cancel Order'>
          <span>
            <IconButton
              size='small'
              onClick={() => dialogs && dialogs(pre => ({ 
                ...pre, 
                cancelOrderDialog: true, 
                cancelOrderId: row?.So_Id || row?.OrderDetails?.So_Id 
              }))}
              color='error'
            >
              <Delete className="fa-16" />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </>
  );
};

export const salesOrderDisplayColumns = ({
  OrderStatus = 'ITEMS',
  dialogs,
  setOrderPreview,
  navigation,
  EditRights,
  DeleteRights,
  AddRights,
}) => {
  const config = SALES_VIEW_CONFIGS[OrderStatus];
  if (!config) return [];

  return config.columns.map(columnKey => {
    const columnDef = SALES_COLUMN_DEFINITIONS[columnKey];
    if (!columnDef) {
      console.warn(`Sales column definition not found for key: ${columnKey}`);
      return null;
    }

    const baseColumn = {
      isVisible: 1,
      ColumnHeader: columnDef.header,
      isCustomCell: columnDef.type === 'custom',
    };

    if (columnDef.type === 'custom') {
      return {
        ...baseColumn,
        Cell: ({ row }) => columnDef.getValue(row, { 
          setOrderPreview, 
          navigation, 
          EditRights, 
          DeleteRights, 
          AddRights, 
          dialogs 
        })
      };
    } else {
      return {
        ...baseColumn,
        Field_Name: columnKey,
        Fied_Data: columnDef.type,
        // For non-custom cells
        ...(columnDef.getValue && {
          isCustomCell: true,
          Cell: ({ row }) => columnDef.getValue(row)
        })
      };
    }
  }).filter(Boolean);
};

// Main export - you can use this to determine which dataset to use
export const orderDataSet = ({ data = [], status = 'ITEMS', orderType = 'SALES' }) => {
  if (orderType === 'SALES') {
    return salesOrderDataSet({ data, status });
  }
};

export const orderDisplayColumns = (props) => {
  const { orderType = 'SALES', ...otherProps } = props;
  
  if (orderType === 'SALES') {
    return salesOrderDisplayColumns(otherProps);
  }
};