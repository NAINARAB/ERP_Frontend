import { useState, useEffect, useMemo } from "react";
import { 
  Button, Box,
  Dialog, 
  Tooltip, 
  IconButton, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  ToggleButtonGroup, 
  ToggleButton,
  Card,
  Switch,
  Typography,
  Grid,
  Paper
} from "@mui/material";
import Select from "react-select";
import { 
  Addition, 
  getSessionFiltersByPageId, 
  isEqualNumber, 
  ISOString, 
  NumberFormat, 
  setSessionFilters, 
  toNumber 
} from "../../Components/functions";
import { Add, Edit, FilterAlt, Search, Visibility, LocalShipping, ShoppingCart } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { useNavigate } from "react-router-dom";
import { salesOrderDataSet } from "../Sales/SaleOrder/filters";

const PendingDetails = ({ loadingOn, loadingOff, AddRights, EditRights, pageID }) => {
    const sessionValue = sessionStorage.getItem('filterValues');
    const defaultFilters = {
        Fromdate: ISOString(),
        Todate: ISOString(),
        Retailer: { value: '', label: 'ALL' },
        CreatedBy: { value: '', label: 'ALL' },
        SalesPerson: { value: '', label: 'ALL' },
        VoucherType: { value: '', label: 'ALL' },
        DeliveryPerson: { value: '', label: 'ALL' },
        Cancel_status: 1
    };

    const storage = JSON.parse(localStorage.getItem('user'));
    const navigate = useNavigate();
    const [saleOrders, setSaleOrders] = useState([]);
    const [deliveryOrders, setDeliveryOrders] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [salesPerson, setSalePerson] = useState([]);
    const [users, setUsers] = useState([]);
    const [voucher, setVoucher] = useState([]);
    const [deliveryPerson, setDeliveryPerson] = useState([]);
    const [viewOrder, setViewOrder] = useState({});
    const [viewType, setViewType] = useState('sales');
    const [deliveryStatusFilter, setDeliveryStatusFilter] = useState("All");
    const [salesStatusFilter, setSalesStatusFilter] = useState("All");
    
    const [overallCounts, setOverallCounts] = useState({
        totalPendingOrders: 0,
        totalFilteredOrders: 0,
        totalOrders: 0,
        pendingOrders: 0,
        fulfilledOrders: 0
    });

    const [deliveryOverallCounts, setDeliveryOverallCounts] = useState({
        totalDeliveries: 0,
        deliveredCount: 0,
        pendingCount: 0,
        returnedCount:0,
        cancelledCount: 0,
        totalAmount: 0
    });

    const [statusCounts, setStatusCounts] = useState({
        all: 0,
        delivered: 0,
        pending: 0,
        previousDaySalesCount: 0
    });

    const [salesStatusCount, setSalesStatusCount] = useState({
        all: 0,
        converted: 0,
        nonConvert: 0
    });

    const [filters, setFilters] = useState(defaultFilters);
    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
    });

    useEffect(() => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            Retailer = defaultFilters.Retailer,
            CreatedBy = defaultFilters.CreatedBy,
            SalesPerson = defaultFilters.SalesPerson,
            VoucherType = defaultFilters.VoucherType,
            DeliveryPerson = defaultFilters.DeliveryPerson,
            Cancel_status = defaultFilters.Cancel_status
        } = otherSessionFiler;

        setFilters(pre => ({
            ...pre,
            Fromdate, Todate,
            Retailer, CreatedBy, SalesPerson,
            VoucherType, DeliveryPerson, Cancel_status
        }));
    }, [sessionValue, pageID, viewType]); 

    useEffect(() => {
        fetchLink({
            address: `sales/saleOrder/retailers`
        }).then(data => {
            if (data.success) setRetailers(data.data);
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) setSalePerson(data.data);
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/user/dropDown?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) setUsers(data.data);
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/voucher`
        }).then(data => {
            if (data.success) setVoucher(data.data);
        }).catch(e => console.error(e));

        fetchLink({
            address: `dataEntry/costCenter`
        }).then(data => {
            if (data.success) setDeliveryPerson(data.data);
        }).catch(e => console.error(e));
    }, []);

    useEffect(() => {
        const otherSessionFiler = getSessionFiltersByPageId(pageID);
        const {
            Fromdate, Todate,
            Retailer = defaultFilters.Retailer,
            CreatedBy = defaultFilters.CreatedBy,
            SalesPerson = defaultFilters.SalesPerson,
            VoucherType = defaultFilters.VoucherType,
            DeliveryPerson = defaultFilters.DeliveryPerson,
            Cancel_status = defaultFilters.Cancel_status
        } = otherSessionFiler;

        if (viewType === 'sales') {
            fetchLink({
                address: `reports/reportsNonconvert/sales?Fromdate=${Fromdate}&Todate=${Todate}&Retailer_Id=${Retailer?.value}&Sales_Person_Id=${SalesPerson?.value}&Created_by=${CreatedBy?.value}&VoucherType=${VoucherType?.value}&Cancel_status=${Cancel_status}`,
                loadingOn, loadingOff
            }).then(data => {
                if (data.success) {
                    const responseData = data?.data || {};
                    const salesData = responseData.orders || [];
                    
                    setOverallCounts({
                        totalPendingOrders: responseData.totalPendingOrders || 0,
                        totalFilteredOrders: responseData.totalFilteredOrders || 0,
                        totalOrders: responseData.summary?.totalOrders || 0,
                        pendingOrders: responseData.summary?.pendingOrders || 0,
                        fulfilledOrders: responseData.summary?.fulfilledOrders || 0
                    });
                    
                    setSaleOrders(salesData);
                    
                    const converted = salesData.filter(row => row.isConverted == 2).length;
                    const nonConvert = salesData.filter(row => row.isConverted != 2).length;
                    const all = salesData.length;
                    
                    setSalesStatusCount({
                        all: all,
                        converted: converted,
                        nonConvert: nonConvert
                    });
                }
            }).catch(e => console.error(e));
        } else {
            fetchLink({
                address: `delivery/deliveryOrderListData?Fromdate=${Fromdate}&Todate=${Todate}&Retailer_Id=${Retailer?.value}&Sales_Person_Id=${SalesPerson?.value}&Delivery_Person_Id=${DeliveryPerson?.value}&Created_by=${CreatedBy?.value}&Cancel_status=${Cancel_status}`,
                loadingOn, loadingOff
            }).then(data => {
                if (data.success) {
                    const deliveryData = data?.data || [];
                    setDeliveryOrders(deliveryData);
                    
                    const delivered = deliveryData.filter(row => row.DeliveryStatusName === "Delivered").length;
                    const pending = deliveryData.filter(row => row.Delivery_Status === 1).length;
                    const returned =deliveryData.filter(row=>row.Delivery_Status === 6).length;
                    const all = deliveryData.length;
                    const previousDaySalesCount = deliveryData.length > 0 ? deliveryData[0].PreviousDaySalesOrderCount || 0 : 0;
                    
                    setStatusCounts({ 
                        all, 
                        delivered, 
                        returned,
                        pending, 
                        previousDaySalesCount 
                    });

                    // Calculate delivery summary
                    const cancelled = deliveryData.filter(row =>  row.Delivery_Status === 0).length;
                    const totalAmount = deliveryData.reduce((sum, order) => sum + toNumber(order.Total_Invoice_value || 0), 0);
                    
                    setDeliveryOverallCounts({
                        totalDeliveries: all,
                        deliveredCount: delivered,
                        pendingCount: pending,
                           returnedCount: returned,
                        cancelledCount: cancelled,
                        totalAmount: totalAmount
                    });
                }
            }).catch(e => console.error(e));
        }
    }, [sessionValue, pageID, viewType]);

    const ExpendableComponent = ({ row }) => {
        return (
            <table className="table">
                <tbody>
                    <tr>
                        <td className="border p-2 bg-light">Branch</td>
                        <td className="border p-2">{row.Branch_Name}</td>
                        <td className="border p-2 bg-light">
                            {viewType === 'sales' ? 'Sales Person' : 'Delivery Person'}
                        </td>
                        <td className="border p-2">
                            {viewType === 'sales' ? row.Sales_Person_Name : row.Delivery_Person_Name}
                        </td>
                        <td className="border p-2 bg-light">Round off</td>
                        <td className="border p-2">{row.Round_off}</td>
                    </tr>
                    <tr>
                        <td className="border p-2 bg-light">Invoice Type</td>
                        <td className="border p-2">
                            {isEqualNumber(row.GST_Inclusive, 1) && 'Inclusive'}
                            {isEqualNumber(row.GST_Inclusive, 0) && 'Exclusive'}
                        </td>
                        <td className="border p-2 bg-light">Tax Type</td>
                        <td className="border p-2">
                            {isEqualNumber(row.IS_IGST, 1) && 'IGST'}
                            {isEqualNumber(row.IS_IGST, 0) && 'GST'}
                        </td>
                        <td className="border p-2 bg-light">Sales Person</td>
                        <td className="border p-2">{row.Sales_Person_Name}</td>
                    </tr>
                    <tr>
                        <td className="border p-2 bg-light">Narration</td>
                        <td className="border p-2" colSpan={5}>{row.Narration}</td>
                    </tr>
                </tbody>
            </table>
        );
    };

    const closeDialog = () => {
        setDialog(prev => ({ ...prev, filters: false, orderDetails: false }));
    };

    const Total_Invoice_value = useMemo(() => {
        const data = viewType === 'sales' ? saleOrders : deliveryOrders;
        return data.reduce((acc, orders) => Addition(acc, orders?.Total_Invoice_value), 0);
    }, [saleOrders, deliveryOrders, viewType]);

    const filteredDeliveryData = useMemo(() => {
        if (viewType !== 'delivery') return deliveryOrders;
        
        switch(deliveryStatusFilter) {
            case "Delivered":
                return deliveryOrders.filter(row => row.Delivery_Status === 7);
            case "Pending":
                return deliveryOrders.filter(row => row.Delivery_Status === 1);
            case "All":
            default:
                return deliveryOrders;
        }
    }, [deliveryOrders, deliveryStatusFilter, viewType]);

    const filteredSalesData = useMemo(() => {
        if (viewType !== 'sales') return saleOrders;
        
        switch(salesStatusFilter) {
            case "Converted":
                return saleOrders.filter(row => row.isConverted === 2);
            case "Non-Converted":
                return saleOrders.filter(row => row.isConverted !== 2);
            case "All":
            default:
                return saleOrders;
        }
    }, [saleOrders, salesStatusFilter, viewType]);

    const resetFilters = () => {
        setFilters(defaultFilters);
        setSessionFilters({
            ...defaultFilters,
            pageID
        });
      
        if (viewType === 'sales') {
            setSalesStatusFilter("All");
        } else {
            setDeliveryStatusFilter("All");
        }
    };

    const SaleOrderSummary = () => {
        if (viewType !== 'sales') return null;
        
        return (
            <Paper 
                elevation={2} 
                sx={{ 
                    p: 2, 
                    mb: 2, 
                    backgroundColor: '#f8f9fa',
                    borderLeft: '4px solid #1976d2'
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <ShoppingCart sx={{ color: '#1976d2' }} />
                            <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                                📊 Sale Order Summary
                            </Typography>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper 
                            elevation={1} 
                            sx={{ 
                                p: 2, 
                                textAlign: 'center',
                                backgroundColor: '#e3f2fd',
                                border: '1px solid #bbdefb'
                            }}
                        >
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                                {overallCounts.totalFilteredOrders || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Total Orders
                            </Typography>
                        </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper 
                            elevation={1} 
                            sx={{ 
                                p: 2, 
                                textAlign: 'center',
                                backgroundColor: '#fff3e0',
                                border: '1px solid #ffe0b2'
                            }}
                        >
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                                {overallCounts.totalPendingOrders || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Pending Orders
                            </Typography>
                        </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper 
                            elevation={1} 
                            sx={{ 
                                p: 2, 
                                textAlign: 'center',
                                backgroundColor: '#e8f5e9',
                                border: '1px solid #c8e6c9'
                            }}
                        >
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                                {overallCounts.fulfilledOrders || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Fulfilled Orders
                            </Typography>
                        </Paper>
                    </Grid>
                    
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper 
                            elevation={1} 
                            sx={{ 
                                p: 2, 
                                textAlign: 'center',
                                backgroundColor: '#fce4ec',
                                border: '1px solid #f8bbd9'
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#c2185b' }}>
                                {overallCounts.totalOrders ? 
                                    `${Math.round((overallCounts.fulfilledOrders / overallCounts.totalOrders) * 100)}%` : 
                                    '0%'
                                }
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Fulfillment Rate
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    const DeliverySummary = () => {
        if (viewType !== 'delivery') return null;
        
        return (
      <Paper 
    elevation={2} 
    sx={{ 
        p: 2, 
        mb: 2, 
        backgroundColor: '#f8f9fa',
        borderLeft: '4px solid #9c27b0'
    }}
>
    <Grid container spacing={2} alignItems="center">
        <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocalShipping sx={{ color: '#9c27b0' }} />
                <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 'bold' }}>
                    🚚 Delivery Summary
                </Typography>
            </Box>
        </Grid>
        
       
        <Grid item xs={6} sm={4} md={3} lg={2}>
            <Paper 
                elevation={1} 
                sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    backgroundColor: '#f3e5f5',
                    border: '1px solid #e1bee7'
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#9c27b0' }}>
                    {deliveryOverallCounts.totalDeliveries || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Total Deliveries
                </Typography>
            </Paper>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3} lg={2}>
            <Paper 
                elevation={1} 
                sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    backgroundColor: '#e8f5e9',
                    border: '1px solid #c8e6c9'
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                    {deliveryOverallCounts.deliveredCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Delivered
                </Typography>
            </Paper>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3} lg={2}>
            <Paper 
                elevation={1} 
                sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    backgroundColor: '#fff3e0',
                    border: '1px solid #ffe0b2'
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                    {deliveryOverallCounts.pendingCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Pending
                </Typography>
            </Paper>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3} lg={2}>
            <Paper 
                elevation={1} 
                sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    backgroundColor: '#ffebee',
                    border: '1px solid #ffcdd2'
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {deliveryOverallCounts.cancelledCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Cancelled
                </Typography>
            </Paper>
        </Grid>
         
        <Grid item xs={6} sm={4} md={3} lg={2}>
            <Paper 
                elevation={1} 
                sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    backgroundColor: '#ffebee',
                    border: '1px solid #ffcdd2'
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                    {deliveryOverallCounts.returnedCount || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Return
                </Typography>
            </Paper>
        </Grid>
        
        <Grid item xs={6} sm={4} md={3} lg={2}>
            <Paper 
                elevation={1} 
                sx={{ 
                    p: 2, 
                    textAlign: 'center',
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #bbdefb'
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    {deliveryOverallCounts.totalDeliveries > 0 ? 
                        `${Math.round((deliveryOverallCounts.deliveredCount / deliveryOverallCounts.totalDeliveries) * 100)}%` : 
                        '0%'
                    }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Delivery Rate
                </Typography>
            </Paper>
        </Grid>
    </Grid>
</Paper>
        );
    };

    const columns = useMemo(() => {
        if (viewType === 'sales') {
            return [
                createCol('So_Date', 'date', 'SoDate'),
                createCol('So_Inv_No', 'string', 'SO ID'),
                createCol('Retailer_Name', 'string', 'Customer'),
                createCol('VoucherTypeGet', 'string', 'Voucher'),
                createCol('Total_Before_Tax', 'number', 'Before Tax'),
                createCol('Total_Tax', 'number', 'Tax'),
                createCol('Total_Invoice_value', 'number', 'Invoice Value'),
                {
                    Field_Name: 'Action',
                    isVisible: 1,
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <>
                            <Tooltip title='View Order'>
                                <IconButton
                                    onClick={() => setViewOrder({
                                        orderDetails: row,
                                        orderProducts: row?.Products_List || []
                                    })}
                                    color='primary' 
                                    size="small"
                                >
                                    <Visibility className="fa-16" />
                                </IconButton>
                            </Tooltip>
                            {EditRights && (
                                <Tooltip title='Edit'>
                                    <IconButton
                                        onClick={() => navigate('create', {
                                            state: { ...row, isEdit: true }
                                        })}
                                        size="small"
                                    >
                                        <Edit className="fa-16" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </>
                    ),
                },
            ];
        } else {
            return [
                createCol('Do_Id', 'string', 'Delivery ID'),
                createCol('So_No', 'string', 'Sale Order ID'),
                createCol('Do_Inv_No', 'string', 'DO Inv No'),
                createCol('Retailer_Name', 'string', 'Customer'),
                createCol('SalesDate', 'date', 'Sale Order Date'),
                createCol('Do_Date', 'date', 'Delivery Date'),
                createCol('Total_Before_Tax', 'number', 'Before Tax'),
                createCol('Total_Tax', 'number', 'Tax'),
                createCol('Total_Invoice_value', 'number', 'Invoice Value'),
                createCol('DeliveryStatusName', 'string', 'Delivery Status'),
                {
                    Field_Name: 'Action',
                    isVisible: 1,
                    isCustomCell: true,
                    Cell: ({ row }) => (
                        <>
                            <Tooltip title='View Order'>
                                <IconButton
                                    onClick={() => setViewOrder({
                                        orderDetails: row,
                                        orderProducts: row?.Products_List || []
                                    })}
                                    color='primary' 
                                    size="small"
                                >
                                    <Visibility className="fa-16" />
                                </IconButton>
                            </Tooltip>
                            {EditRights && (
                                <Tooltip title='Edit'>
                                    <IconButton
                                        onClick={() => navigate('create', {
                                            state: { ...row, isEdit: true }
                                        })}
                                        size="small"
                                    >
                                        <Edit className="fa-16" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </>
                    ),
                },
            ];
        }
    }, [viewType, EditRights, navigate]);

    return (
        <>
            <SaleOrderSummary />
            <DeliverySummary />

            <FilterableTable
                title={`${viewType === 'sales' ? 'Sale' : 'Delivery'} Orders`}
                dataArray={viewType === 'sales' ? filteredSalesData : filteredDeliveryData}
                EnableSerialNumber
                columns={columns}
                ButtonArea={
                    <>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
                        
                            <ToggleButtonGroup
                                value={viewType}
                                exclusive
                                onChange={(e, newView) => {
                                    if (newView) {
                                        resetFilters();
                                        setViewType(newView);
                                       
                                        setSalesStatusFilter("All");
                                        setDeliveryStatusFilter("All");
                                    }
                                }}
                                aria-label="view type"
                                sx={{ 
                                    '& .MuiToggleButton-root': {
                                        px: 3,  
                                        py: 1,  
                                        m: 0.5, 
                                    }
                                }}
                            >
                                <ToggleButton 
                                    value="sales" 
                                    aria-label="sales view"
                                    sx={{
                                        backgroundColor: viewType === 'sales' ? '#1976d2' : 'inherit',
                                        color: viewType === 'sales' ? 'white' : 'inherit',
                                        fontWeight: viewType === 'sales' ? 'bold' : 'normal',
                                        '&:hover': {
                                            backgroundColor: viewType === 'sales' ? '#1565c0' : 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    Sale Order
                                </ToggleButton>
                                <ToggleButton 
                                    value="delivery" 
                                    aria-label="delivery view"
                                    sx={{
                                        backgroundColor: viewType === 'delivery' ? '#9c27b0' : 'inherit',
                                        color: viewType === 'delivery' ? 'white' : 'inherit',
                                        fontWeight: viewType === 'delivery' ? 'bold' : 'normal',
                                        '&:hover': {
                                            backgroundColor: viewType === 'delivery' ? '#7b1fa2' : 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                >
                                    Invoice
                                </ToggleButton>
                            </ToggleButtonGroup>

                          
                            {viewType === 'sales' && (
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Button
                                        variant={salesStatusFilter === "All" ? "contained" : "outlined"}
                                        color="primary"
                                        onClick={() => setSalesStatusFilter("All")}
                                        sx={{ 
                                            px: 3,
                                            py: 1,
                                            fontWeight: salesStatusFilter === "All" ? 'bold' : 'normal',
                                            m: 0.5
                                        }}
                                    >
                                        Overall - {salesStatusCount.all}
                                    </Button>
                                    <Button
                                        variant={salesStatusFilter === "Converted" ? "contained" : "outlined"}
                                        color="success"
                                        onClick={() => setSalesStatusFilter("Converted")}
                                        sx={{ 
                                            px: 3,
                                            py: 1,
                                            fontWeight: salesStatusFilter === "Converted" ? 'bold' : 'normal',
                                            m: 0.5
                                        }}
                                    >
                                        Converted - {salesStatusCount.converted}
                                    </Button>
                                    <Button
                                        variant={salesStatusFilter === "Non-Converted" ? "contained" : "outlined"}
                                        color="warning"
                                        onClick={() => setSalesStatusFilter("Non-Converted")}
                                        sx={{ 
                                            px: 3,
                                            py: 1,
                                            fontWeight: salesStatusFilter === "Non-Converted" ? 'bold' : 'normal',
                                            m: 0.5
                                        }}
                                    >
                                        Non-Converted - {salesStatusCount.nonConvert}
                                    </Button>
                                </Box>
                            )}

                           
                            {viewType === 'delivery' && (
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                    <Button
                                        variant={deliveryStatusFilter === "All" ? "contained" : "outlined"}
                                        color="primary"
                                        onClick={() => setDeliveryStatusFilter("All")}
                                        sx={{ 
                                            px: 3,
                                            py: 1,
                                            fontWeight: deliveryStatusFilter === "All" ? 'bold' : 'normal',
                                            m: 0.5
                                        }}
                                    >
                                        Overall - {statusCounts.all}
                                    </Button>
                                    <Button
                                        variant={deliveryStatusFilter === "Delivered" ? "contained" : "outlined"}
                                        color="success"
                                        onClick={() => setDeliveryStatusFilter("Delivered")}
                                        sx={{ 
                                            px: 3,
                                            py: 1,
                                            fontWeight: deliveryStatusFilter === "Delivered" ? 'bold' : 'normal',
                                            m: 0.5
                                        }}
                                    >
                                        Delivered - {statusCounts.delivered}
                                    </Button>
                                    <Button
                                        variant={deliveryStatusFilter === "Pending" ? "contained" : "outlined"}
                                        color="warning"
                                        onClick={() => setDeliveryStatusFilter("Pending")}
                                        sx={{ 
                                            px: 3,
                                            py: 1,
                                            fontWeight: deliveryStatusFilter === "Pending" ? 'bold' : 'normal',
                                            m: 0.5
                                        }}
                                    >
                                        Pending - {statusCounts.pending}
                                    </Button>
                                </Box>
                            )}

                  
                            <Tooltip title='Filters'>
                                <IconButton
                                    size="medium"
                                    onClick={() => setDialog(prev => ({ ...prev, filters: true }))}
                                    sx={{ ml: 1 }}
                                >
                                    <FilterAlt />
                                </IconButton>
                            </Tooltip>

                       
                            <Box sx={{ 
                                bgcolor: 'background.paper', 
                                px: 2, 
                                py: 1, 
                                borderRadius: 1,
                                ml: 'auto'
                            }}>
                                {toNumber(Total_Invoice_value) > 0 && (
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Total Amount: {NumberFormat(Total_Invoice_value)}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </>
                }
                isExpendable={true}
                tableMaxHeight={550}
                expandableComp={ExpendableComponent}
            />

            <Dialog
                open={dialog.filters}
                onClose={closeDialog}
                fullWidth 
                maxWidth='sm'
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={e => setFilters(prev => ({ ...prev, Fromdate: e.target.value }))}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={e => setFilters(prev => ({ ...prev, Todate: e.target.value }))}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Retailer</td>
                                    <td>
                                        <Select
                                            value={filters.Retailer}
                                            onChange={e => setFilters(prev => ({ ...prev, Retailer: e }))}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...retailers.map(obj => ({
                                                    value: obj?.Retailer_Id,
                                                    label: `${obj?.Retailer_Name} - ₹${NumberFormat(toNumber(obj?.TotalSales))} (${toNumber(obj?.OrderCount)})`
                                                }))
                                            ]}
                                            isSearchable={true}
                                            placeholder="Retailer Name"
                                        />
                                    </td>
                                </tr>
                                {viewType === 'delivery' && (
                                    <tr>
                                        <td style={{ verticalAlign: 'middle' }}>Delivery Person</td>
                                        <td>
                                            <Select
                                                value={filters.DeliveryPerson}
                                                onChange={e => setFilters(prev => ({ ...prev, DeliveryPerson: e }))}
                                                options={[
                                                    { value: '', label: 'ALL' },
                                                    ...deliveryPerson.map(obj => ({
                                                        value: obj?.Cost_Center_Id,
                                                        label: obj?.Cost_Center_Name
                                                    }))
                                                ]}
                                                isSearchable={true}
                                                placeholder="Delivery Person Name"
                                            />
                                        </td>
                                    </tr>
                                )}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Sales Person</td>
                                    <td>
                                        <Select
                                            value={filters.SalesPerson}
                                            onChange={e => setFilters(prev => ({ ...prev, SalesPerson: e }))}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...salesPerson.map(obj => ({ value: obj?.UserId, label: obj?.Name }))
                                            ]}
                                            isSearchable={true}
                                            placeholder="Sales Person Name"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Created By</td>
                                    <td>
                                        <Select
                                            value={filters.CreatedBy}
                                            onChange={e => setFilters(prev => ({ ...prev, CreatedBy: e }))}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...users.map(obj => ({ value: obj?.UserId, label: obj?.Name }))
                                            ]}
                                            isSearchable={true}
                                            placeholder="Created By"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Voucher</td>
                                    <td>
                                        <Select
                                            value={filters.VoucherType}
                                            onChange={e => setFilters(prev => ({ ...prev, VoucherType: e }))}
                                            options={[
                                                { value: '', label: 'ALL' },
                                                ...voucher.filter(obj => obj.Type === 'SALES')
                                                    .map(obj => ({ value: obj?.Vocher_Type_Id, label: obj?.Voucher_Type }))
                                            ]}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder="Voucher Name"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Canceled Order</td>
                                    <td>
                                        <select
                                            value={filters.Cancel_status}
                                            onChange={e => setFilters(prev => ({ ...prev, Cancel_status: Number(e.target.value) }))}
                                            className="cus-inpt"
                                        >
                                            <option value={1}>Show</option>
                                            <option value={0}>Hide</option>
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Close</Button>
                    <Button
                        onClick={() => {
                            closeDialog();
                            setSessionFilters({
                                Fromdate: filters.Fromdate,
                                Todate: filters.Todate,
                                pageID,
                                Retailer: filters.Retailer,
                                CreatedBy: filters.CreatedBy,
                                SalesPerson: filters.SalesPerson,
                                DeliveryPerson: filters.DeliveryPerson,
                                VoucherType: filters.VoucherType,
                                Cancel_status: filters.Cancel_status
                            });
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >
                        Search
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default PendingDetails;