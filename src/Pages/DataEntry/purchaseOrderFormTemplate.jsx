import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Card, CardContent } from '@mui/material';
import { useEffect, useState } from 'react';
import Select from 'react-select';
import { customSelectStyles } from '../../Components/tablecolumn';
import RequiredStar from '../../Components/requiredStar';
import { fetchLink } from '../../Components/fetchComponent';
import { Addition, checkIsNumber, Division, isEqualNumber, ISOString, isValidObject, LocalDate, onlynum } from '../../Components/functions';
import { Delete, Add, Save, ClearAll, Edit, Launch, Search, Close, Download } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify'
const storage = JSON.parse(localStorage.getItem('user'));

const initialOrderDetailsValue = {
    Sno: '',
    Id: '',
    BranchId: 1,
    PoYear: '',
    PO_ID: '',
    LoadingDate: '',
    TradeConfirmDate: '',
    OwnerName: '',
    OwnerId: '',
    BrokerName: '',
    BrokerId: '',
    PartyId: 'select',
    PartyName: '',
    PartyAddress: '',
    PaymentCondition: '',
    Remarks: '',
    OrderStatus: 'New Order',
    CreatedBy: storage?.UserId,
}

const initialItemDetailsValue = {
    Id: '',
    Sno: '',
    OrderId: '',
    ItemId: '',
    ItemName: '',
    Weight: '',
    Units: '',
    Rate: '',
    DeliveryLocation: '',
    Discount: '',
    QualityCondition: ''
}

const initialDeliveryDetailsValue = {
    indexValue: null,
    Id: '',
    Sno: '',
    OrderId: '',
    Trip_Id: '',
    Trip_Item_SNo: '',
    LocationId: '',
    Location: '',
    TransporterIndex: '',
    ArrivalDate: '',
    ItemId: '',
    ItemName: '',
    Concern: '',
    BillNo: '',
    BillDate: '',
    BilledRate: 0,
    Quantity: '',
    Weight: '',
    Units: '',
    BatchLocation: '',
    PendingQuantity: '',
    CreatedBy: storage?.UserId
}

const initialTranspoterDetailsValue = {
    indexValue: null,
    Id: '',
    OrderId: '',
    Loading_Load: '',
    Loading_Empty: '',
    Unloading_Load: '',
    Unloading_Empty: '',
    EX_SH: '',
    DriverName: '',
    VehicleNo: '',
    PhoneNumber: '',
    CreatedBy: storage?.UserId,
}

const initialStaffDetailsValue = {
    Id: '',
    OrderId: '',
    EmployeeId: '',
    CostType: '',
}

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const PurchaseOrderFormTemplate = ({ loadingOn, loadingOff }) => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const nav = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const tdStyle = 'border fa-14 vctr';
    const inputStyle = 'cus-inpt p-2';

    const [products, setProducts] = useState([]);
    const [costCenterData, setCostCenterData] = useState([]);
    const [costCenterCategoryData, setCostCenterCategoryData] = useState([]);
    const [godownLocations, setGodownLocations] = useState([]);
    const [retailers, setRetailers] = useState([]);

    const [OrderItemsArray, setOrderItemArray] = useState([])
    const [DeliveryArray, setDeliveryArray] = useState([]);
    const [TranspoterArray, setTranspoterArray] = useState([]);
    const [StaffArray, setStaffArray] = useState([]);
    const [tripData, setTripData] = useState([]);

    const [filters, setFilters] = useState({
        FromGodown: '',
        FromGodownName: 'Select From Location',
        ToGodown: '',
        ToGodownName: 'Select To Location',
        Fromdate: ISOString(),
        Todate: ISOString(),
        search: false,
        tripSheetDialog: false,
    })

    const [OrderDetails, setOrderDetails] = useState(initialOrderDetailsValue);
    const [orderItemsInput, setOrderItemsInput] = useState(initialItemDetailsValue);
    const [deliveryInput, setDeliveryInput] = useState(initialDeliveryDetailsValue);
    const [transpoterInput, setTransportInput] = useState(initialTranspoterDetailsValue);
    const isEdit = OrderDetails?.Id ? true : false;

    const [dialogs, setDialogs] = useState({
        itemsDialog: false,
        deliveryDialog: false,
        transporterDialog: false,
    })

    const [options, setOptions] = useState({
        PurchaseOrderOnly: true,
        PurchaseOderWithDelivery: false,
        DeliveryEntry: false,
    })

    useEffect(() => {
        fetchLink({
            address: `masters/products?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setProducts(data.data);
            } else {
                setProducts([]);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `dataEntry/costCenter`
        }).then(data => {
            if (data.success) {
                setCostCenterData(data.data);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `dataEntry/costCenter/category`
        }).then(data => {
            if (data.success) {
                setCostCenterCategoryData(data.data);
            }
        }).catch(e => console.log(e))

        fetchLink({
            address: `dataEntry/godownLocationMaster`
        }).then(data => {
            if (data.success) {
                setGodownLocations(data.data);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/retailers`
        }).then(data => {
            if (data.success) {
                setRetailers(data.data);
            }
        }).catch(e => console.error(e));
    }, [])

    useEffect(() => {

        if (!isValidObject(stateDetails) || !isValidObject(stateDetails.OrderDetails)) return;

        const LoadingDate = stateDetails.OrderDetails?.LoadingDate ? ISOString(stateDetails.OrderDetails?.LoadingDate) : '';
        const TradeConfirmDate = stateDetails.OrderDetails?.TradeConfirmDate ? ISOString(stateDetails.OrderDetails?.TradeConfirmDate) : '';
        const editPage = stateDetails?.editPage;

        setOrderDetails({
            ...stateDetails.OrderDetails,
            PartyId: stateDetails?.OrderDetails?.PartyId ?? '',
            OwnerId: stateDetails?.OrderDetails?.OwnerId ?? '',
            BrokerId: stateDetails?.OrderDetails?.BrokerId ?? '',
            OrderStatus: stateDetails.OrderDetails?.OrderStatus ?? 'New Order',
            LoadingDate,
            TradeConfirmDate,
            CreatedBy: storage?.UserId
        });

        setOrderItemArray(stateDetails?.OrderItemsArray ?? []);
        setDeliveryArray(
            stateDetails?.DeliveryArray?.map((o, i) => ({
                ...o,
                indexValue: o?.indexValue === null ? i : o?.indexValue
            })) ?? []
        );
        setTranspoterArray(
            stateDetails?.TranspoterArray?.map((o, i) => ({
                ...o,
                indexValue: o?.indexValue === null ? i : o?.indexValue
            })) ?? []
        );
        setStaffArray(stateDetails?.StaffArray ?? []);

        const isFound = Object.keys(options).findIndex(key => key === editPage);

        if (isFound !== -1) {
            setOptions(pre => Object.fromEntries(
                Object.entries(pre).map(([key, value]) => [key, key === editPage ? true : false])
            ));
        } else {
            setOptions({
                PurchaseOrderOnly: false,
                PurchaseOderWithDelivery: true,
                DeliveryEntry: false,
            })
        }

    }, [stateDetails]);

    const handleRadioChange = (event) => {
        const { id } = event.target;

        setOptions({
            PurchaseOrderOnly: id === 'PurchaseOrderOnly',
            PurchaseOderWithDelivery: id === 'PurchaseOderWithDelivery',
            DeliveryEntry: id === 'DeliveryEntry',
        });
    };

    const changeItems = (itemDetail) => {
        const productIndex = OrderItemsArray.findIndex(item => isEqualNumber(item.ItemId, itemDetail.ItemId));
        if (productIndex !== -1) {
            const updatedValues = [...OrderItemsArray];
            Object.entries(itemDetail).forEach(([key, value]) => {
                updatedValues[productIndex][key] = value;
            });
            setOrderItemArray(updatedValues);
        } else {
            setOrderItemArray(prevValues => [...prevValues, { ...itemDetail }]);
        }
        setOrderItemsInput(initialItemDetailsValue);
        setDialogs(pre => ({ ...pre, itemsDialog: false }));
    }

    const changeDeliveryInfo = (details) => {
        if (checkIsNumber(details.indexValue)) {
            setDeliveryArray(pre => {
                const deliveryData = [...pre];
                deliveryData[details.indexValue] = { ...details };
                return deliveryData;
            })
        } else {
            setDeliveryArray(pre => [...pre, { ...details, indexValue: pre.length }]);
        }
        setDeliveryInput(initialDeliveryDetailsValue);
        setDialogs(pre => ({ ...pre, deliveryDialog: false }));
    }

    const changeTransporterInfo = (details) => {
        if (checkIsNumber(details.indexValue)) {
            setTranspoterArray(pre => {
                const transporterData = [...pre];
                transporterData[details.indexValue] = { ...details };
                return transporterData;
            });
        } else {
            setTranspoterArray(pre => [...pre, { ...details, indexValue: pre.length }]);
        }
        setTransportInput(initialTranspoterDetailsValue);
        setDialogs(pre => ({ ...pre, transporterDialog: false }));
    };

    const postOrder = () => {
        if (loadingOn) {
            loadingOn();
        }
        fetchLink({
            address: `dataEntry/purchaseOrderEntry`,
            method: isEdit ? 'PUT' : 'POST',
            bodyData: {
                OrderDetails: OrderDetails,
                OrderItems: options.DeliveryEntry ? [] : OrderItemsArray,
                DelivdryDetails: options.PurchaseOrderOnly ? [] : DeliveryArray,
                TranspoterDetails: options.PurchaseOrderOnly ? [] : TranspoterArray,
                StaffDetails: StaffArray
            }
        }).then(data => {
            if (data?.success) {
                setOrderDetails(initialOrderDetailsValue);
                setOrderItemArray([]);
                setDeliveryArray([]);
                setTranspoterArray([]);
                setStaffArray([]);
                toast.success(data?.message)
            } else {
                toast.error(data?.message)
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) {
                loadingOff();
            }
        });
    }

    const closeDialog = () => {
        setDialogs(pre => ({
            ...pre,
            itemsDialog: false,
            deliveryDialog: false,
            transporterDialog: false,
        }));
        setOrderItemsInput(initialItemDetailsValue);
        setDeliveryInput(initialDeliveryDetailsValue);
        setTransportInput(initialTranspoterDetailsValue);
    }

    const searchTripData = () => {
        if (loadingOn) loadingOn()
        fetchLink({
            address: `inventory/tripSheet?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`,
        }).then(data => {
            if (data.success) {
                setTripData(data.data);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        })
    }

    const changeTripItems = (itemDetail, deleteRow = false) => {
        setDeliveryArray((prev) => {
            const preItems = prev.filter(o => !(
                isEqualNumber(o.Trip_Id, itemDetail.Trip_Id) &&
                isEqualNumber(o.Trip_Item_SNo, itemDetail.S_No)
            ));

            if (deleteRow) {
                return preItems;
            } else {
                const currentProduct = tripData
                    .flatMap(t => t.Products_List)
                    .filter(o => (
                        isEqualNumber(o.Trip_Id, itemDetail.Trip_Id) &&
                        isEqualNumber(o.S_No, itemDetail.S_No)
                    ));

                const trip = tripData.find((trp) =>
                    isEqualNumber(trp.Trip_Id, itemDetail.Trip_Id)
                );

                const notInStaffList = trip?.Employees_Involved?.filter(staff =>
                    !StaffArray.some(arrObj => isEqualNumber(arrObj.EmployeeId, staff.Involved_Emp_Id))
                ) || [];

                if (notInStaffList.length > 0) {
                    setStaffArray(prevStaffArray => [
                        ...prevStaffArray,
                        ...notInStaffList.map(staff => Object.fromEntries(
                            Object.entries(initialStaffDetailsValue).map(([key, value]) => {
                                switch (key) {
                                    case 'EmployeeId': return [key, staff?.Involved_Emp_Id];
                                    case 'CostType': return [key, staff?.Cost_Center_Type_Id];
                                    default: return [key, value];
                                }
                            })
                        ))
                    ]);
                }

                // const notInStaffList = trip?.Employees_Involved?.filter(staff => (
                //     StaffArray.findIndex(arrObj => (
                //         isEqualNumber(arrObj.EmployeeId, staff.Involved_Emp_Id)
                //     ) === -1 ? true : false)
                // ));

                // notInStaffList.forEach(staff => (
                //     StaffArray.concat(Object.fromEntries(
                //         Object.entries(initialStaffDetailsValue).map(([key, value]) => {
                //             switch (key) {
                //                 case 'EmployeeId': return [key, staff?.Involved_Emp_Id]
                //                 case 'CostType': return [key, staff?.Cost_Center_Type_Id]
                //                 default: return [key, value]
                //             }
                //         })
                //     ))
                // ))

                const reStruc = currentProduct.map((item, curProIndex) => {

                    const getTripDate = trip?.Trip_Date;
                    const tripDate = getTripDate ? ISOString(getTripDate) : ISOString();
                    const productDetails = findProductDetails(products, item?.Product_Id);
                    const pack = parseFloat(productDetails?.PackGet ?? 0);
                    const Quantity = Division(item.QTY, pack);

                    return Object.fromEntries(
                        Object.entries(initialDeliveryDetailsValue).map(([key, value]) => {
                            switch (key) {
                                case "indexValue":
                                    return [key, Addition(DeliveryArray.length, curProIndex)];
                                case "Sno":
                                    return [key, Addition(DeliveryArray.length, Addition(curProIndex, 1)),];
                                case 'LocationId':
                                    return [key, Number(item?.To_Location) ?? value]
                                case 'Location':
                                    return [key, item?.ToLocation ?? value]
                                case "Trip_Id":
                                    return [key, item?.Trip_Id ?? null];
                                case "Trip_Item_SNo":
                                    return [key, item?.S_No ?? null];
                                case "TransporterIndex":
                                    return [key, 0];
                                case "ArrivalDate":
                                    return [key, tripDate];
                                case "ItemId":
                                    return [key, Number(item?.Product_Id)];
                                case "ItemName":
                                    return [key, item?.Product_Name];
                                case "BillDate":
                                    return [key, tripDate];
                                case "BilledRate":
                                    return [key, Number(item.Gst_Rate)];
                                case "Quantity":
                                    return [key, Quantity]
                                case "Weight":
                                    return [key, Number(item.QTY) ?? 0];
                                case "BatchLocation":
                                    return [key, item?.Batch_No ?? ""];
                                default:
                                    return [key, value];
                            }
                        })
                    );
                });

                return preItems.concat(reStruc);
            }
        });
    };

    return (
        <Card>
            <CardContent>

                <div className="d-flex flex-wrap">
                    <h5 className='flex-grow-1'>Purchase Order</h5>
                    <Button
                        variant='outlined'
                        onClick={() => nav(window.history.length > 1 ? -1 : '/dataEntry/purchaseOrder')}
                    >back</Button>
                </div>

                {!checkIsNumber(OrderDetails.Id) && (
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="d-flex justify-content-center flex-wrap p-2 mb-2">
                            <div className="form-check">
                                <input
                                    className="form-check-input shadow-none"
                                    style={{ padding: '0.7em' }}
                                    type="radio"
                                    name="radioType"
                                    id="PurchaseOrderOnly"
                                    checked={options.PurchaseOrderOnly}
                                    disabled={OrderDetails.Id ? true : false}
                                    onChange={handleRadioChange}
                                />
                                <label
                                    className="form-check-label p-1 me-3"
                                    htmlFor="PurchaseOrderOnly"
                                >
                                    Purchase Order
                                </label>
                            </div>

                            {/* <div className="form-check">
                                <input
                                    className="form-check-input shadow-none"
                                    style={{ padding: '0.7em' }}
                                    type="radio"
                                    name="radioType"
                                    id="DeliveryEntry"
                                    checked={options.DeliveryEntry}
                                    disabled={OrderDetails.Id ? true : false}
                                    onChange={handleRadioChange}
                                />
                                <label
                                    className="form-check-label p-1 me-3"
                                    htmlFor="DeliveryEntry"
                                >
                                    Arrival Details
                                </label>
                            </div> */}

                            <div className="form-check">
                                <input
                                    className="form-check-input shadow-none"
                                    style={{ padding: '0.7em' }}
                                    type="radio"
                                    name="radioType"
                                    id="PurchaseOderWithDelivery"
                                    checked={options.PurchaseOderWithDelivery}
                                    disabled={OrderDetails.Id ? true : false}
                                    onChange={handleRadioChange}
                                />
                                <label
                                    className="form-check-label p-1 me-3"
                                    htmlFor="PurchaseOderWithDelivery"
                                >
                                    Order With Arrival
                                </label>
                            </div>
                        </div>
                    </form>
                )}

                {/* display order id for edit only */}
                {(options.PurchaseOderWithDelivery && OrderDetails.Id) && (
                    <>
                        <label>Order ID</label>:
                        <input
                            value={OrderDetails.Id}
                            disabled
                            className={inputStyle + ' w-auto ms-2 mb-2'}
                            onChange={e => setOrderDetails(pre => ({ ...pre, Id: e.target.value }))}
                            placeholder='Ex: 233'
                        />
                    </>
                )}

                <div className="row">
                    {/* staff details */}
                    <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                        <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                            <div className="d-flex align-items-center flex-wrap mb-2 border-bottom pb-2">
                                <h6 className="flex-grow-1 m-0">Staff Involved</h6>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    type="button"
                                    onClick={() => setStaffArray([...StaffArray, { ...initialStaffDetailsValue }])}
                                >Add</Button>
                            </div>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th className="fa-13">Sno</th>
                                        <th className="fa-13">Staff Name</th>
                                        <th className="fa-13">Category</th>
                                        <th className="fa-13">#</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {StaffArray.map((row, index) => (
                                        <tr key={index}>
                                            <td className='fa-13 vctr text-center'>{index + 1}</td>
                                            <td className='fa-13 w-100 p-0'>
                                                <Select
                                                    value={{
                                                        value: row?.EmployeeId,
                                                        label: costCenterData.find(c => isEqualNumber(c?.Cost_Center_Id, row?.EmployeeId))?.Cost_Center_Name
                                                    }}
                                                    onChange={e => setStaffArray((prev) => {
                                                        return prev.map((item, ind) => {
                                                            if (isEqualNumber(ind, index)) {
                                                                const staff = costCenterData.find(c => isEqualNumber(c.Cost_Center_Id, e.value))
                                                                return {
                                                                    ...item,
                                                                    CostType:
                                                                        checkIsNumber(item.CostType)
                                                                            ? Number(item.CostType)
                                                                            : checkIsNumber(staff.User_Type)
                                                                                ? Number(staff.User_Type)
                                                                                : 0,
                                                                    EmployeeId: Number(e.value),
                                                                }
                                                            }
                                                            return item;
                                                        });
                                                    })}
                                                    options={
                                                        [...costCenterData.filter(fil => (
                                                            StaffArray.findIndex(st => (
                                                                isEqualNumber(st.EmployeeId, fil.Cost_Center_Id)
                                                            )) === -1 ? true : false
                                                        ))].map(st => ({
                                                            value: st.Cost_Center_Id,
                                                            label: st.Cost_Center_Name
                                                        }))
                                                    }
                                                    styles={customSelectStyles}
                                                    isSearchable={true}
                                                    placeholder={"Select Staff"}
                                                />
                                            </td>
                                            <td className='fa-13 vctr p-0' style={{ maxWidth: '130px', minWidth: '100px' }}>
                                                <select
                                                    value={row?.CostType}
                                                    onChange={e => setStaffArray((prev) => {
                                                        return prev.map((item, ind) => {
                                                            if (isEqualNumber(ind, index)) {
                                                                return {
                                                                    ...item,
                                                                    CostType: e.target.value
                                                                }
                                                            }
                                                            return item;
                                                        });
                                                    })}
                                                    className="cus-inpt p-2 border-0"
                                                >
                                                    <option value="">Select</option>
                                                    {costCenterCategoryData.map((st, sti) =>
                                                        <option value={st?.Cost_Category_Id} key={sti}>{st?.Cost_Category}</option>
                                                    )}
                                                </select>
                                            </td>
                                            <td className='fa-13 vctr p-0'>
                                                <IconButton
                                                    onClick={() => {
                                                        setStaffArray(prev => {
                                                            return prev.filter((_, filIndex) => index !== filIndex);
                                                        });
                                                    }}
                                                    size='small'
                                                >
                                                    <Delete color='error' />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* po general details */}
                    <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                        <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                            <div className="row py-2 px-3">

                                <div className="col-md-4 col-sm-6 p-2">
                                    <label>Loading Date</label>
                                    <input
                                        type="date"
                                        className={inputStyle + ' bg-light'}
                                        value={OrderDetails.LoadingDate}
                                        onChange={e => setOrderDetails(pre => ({ ...pre, LoadingDate: e.target.value }))}
                                    />
                                </div>

                                <div className="col-md-4 col-sm-6 p-2">
                                    <label>Trade Date</label>
                                    <input
                                        type="date"
                                        className={inputStyle + ' bg-light'}
                                        value={OrderDetails.TradeConfirmDate}
                                        onChange={e => setOrderDetails(pre => ({ ...pre, TradeConfirmDate: e.target.value }))}
                                    />
                                </div>

                                <div className="col-md-4 col-sm-6 p-2">
                                    <label>Order Status</label>
                                    <select
                                        className={inputStyle + ' bg-light'}
                                        value={OrderDetails?.OrderStatus}
                                        onChange={e => setOrderDetails(pre => ({ ...pre, OrderStatus: e.target.value }))}
                                    >
                                        <option value="New Order">New Order</option>
                                        <option value="On Process">On Process</option>
                                        <option value="Completed">Completed</option>
                                        <option value="Canceled">Canceled</option>
                                    </select>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap bg-white">
                                <span className='flex-grow-1 p-2'>
                                    <h6>Party Name</h6>
                                    <Select
                                        value={{ value: OrderDetails.PartyId, label: OrderDetails.PartyName }}
                                        onChange={e => {
                                            const selectedOption = retailers.find(
                                                ret => isEqualNumber(ret.Retailer_Id, e.value)
                                            ) ?? {}

                                            setOrderDetails(pre => ({
                                                ...pre,
                                                PartyId: selectedOption?.Retailer_Id,
                                                PartyName: selectedOption?.Retailer_Name,
                                                PartyAddress: selectedOption?.Reatailer_Address
                                            }))
                                        }}
                                        options={[
                                            { value: '', label: 'select', isDisabled: true },
                                            ...retailers.map(obj => ({
                                                value: obj?.Retailer_Id,
                                                label: obj?.Retailer_Name
                                            }))
                                        ]}
                                        styles={customSelectStyles}
                                        isSearchable={true}
                                        placeholder={"Select Party"}
                                        maxMenuHeight={200}
                                    />

                                    <br />

                                    <h6>Party Address</h6>
                                    <textarea
                                        className={inputStyle + ' mb-2'}
                                        rows={3}
                                        value={OrderDetails.PartyAddress}
                                        onChange={e => setOrderDetails(pre => ({ ...pre, PartyAddress: e.target.value }))}
                                    />
                                </span>

                                <span className='p-2'>
                                    <h6>Payment Condition</h6>
                                    <textarea
                                        className={inputStyle}
                                        rows={2}
                                        value={OrderDetails.PaymentCondition}
                                        onChange={e => setOrderDetails(pre => ({ ...pre, PaymentCondition: e.target.value }))}
                                    />
                                    <h6>Remarks</h6>
                                    <textarea
                                        className={inputStyle}
                                        rows={2}
                                        value={OrderDetails.Remarks}
                                        onChange={e => setOrderDetails(pre => ({ ...pre, Remarks: e.target.value }))}
                                    />
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="table-responsive">

                    {/* Item Details */}
                    {(options.PurchaseOrderOnly || options.PurchaseOderWithDelivery) && (!options.DeliveryEntry) && (
                        <table className="table m-0">
                            <thead>
                                <tr>
                                    <td className={tdStyle + ' text-primary fw-bold bg-light'} colSpan={6}>
                                        ORDER ITEMS
                                    </td>
                                    <td className={tdStyle + ' text-end bg-light p-0'}>
                                        <Button
                                            startIcon={<Add />}
                                            varient='outlined'
                                            onClick={() => setDialogs(pre => ({ ...pre, itemsDialog: true }))}
                                        >Add Product</Button>
                                    </td>
                                </tr>
                                <tr>
                                    <th className={tdStyle + ' text-center'}>SNo</th>
                                    <th className={tdStyle + ' text-center'}>Item Name</th>
                                    <th className={tdStyle + ' text-center'}>Tonnage</th>
                                    <th className={tdStyle + ' text-center'}>
                                        Rate <br />
                                        Deliver/Spot
                                    </th>
                                    <th className={tdStyle + ' text-center'}>Discount</th>
                                    <th className={tdStyle + ' text-center'}>Quality Condition</th>
                                    <th className={tdStyle + ' text-center'}>Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {OrderItemsArray.map((o, i) => (
                                    <tr key={i}>
                                        <td className={tdStyle}>{i + 1}</td>
                                        <td className={tdStyle}>{o?.ItemName}</td>
                                        <td className={tdStyle}>{o?.Weight + ' ' + o?.Units}</td>
                                        <td className={tdStyle}>{o?.Rate}</td>
                                        <td className={tdStyle}>{o?.Discount}</td>
                                        <td className={tdStyle}>{o?.QualityCondition}</td>
                                        <td className={tdStyle + ' p-0 text-center'}>
                                            <IconButton
                                                onClick={() => {
                                                    setOrderItemsInput(pre => Object.fromEntries(
                                                        Object.entries(pre).map(([key, value]) => [key, o[key] ?? value])
                                                    ));
                                                    setDialogs(pre => ({ ...pre, itemsDialog: true }));
                                                }}
                                                size='small'
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    setOrderItemArray(prev => {
                                                        return prev.filter((_, index) => index !== i);
                                                    });
                                                }}
                                                size='small'
                                            >
                                                <Delete color='error' />
                                            </IconButton>
                                        </td>
                                    </tr>
                                ))}

                                <tr>
                                    <td className={'p-3'} colSpan={7}></td>
                                </tr>
                            </tbody>
                        </table>
                    )}

                    {(options.PurchaseOderWithDelivery || options.DeliveryEntry) && (
                        <>
                            {/* TRANSPOTER DETAILS */}
                            <table className="table m-0">
                                <thead>
                                    <tr>
                                        <td className={tdStyle + ' text-primary fw-bold bg-light'} colSpan={9}>
                                            OTHER DETAILS
                                        </td>
                                        <td className={tdStyle + ' text-end bg-light p-0'}>
                                            <Button
                                                startIcon={<Add />}
                                                varient='outlined'
                                                onClick={() => setDialogs(pre => ({ ...pre, transporterDialog: true }))}
                                            >Add Transporter</Button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className={tdStyle + ' text-center'} rowSpan={2}>SNo</th>
                                        <th className={tdStyle + ' text-center'} colSpan={2}>Loading Wt</th>
                                        <th className={tdStyle + ' text-center'} colSpan={2}>Unloading Wt</th>
                                        <th className={tdStyle + ' text-center'}>Weight</th>
                                        <th className={tdStyle + ' text-center'} colSpan={3}>Transport Details</th>
                                        <th className={tdStyle + ' text-center'} rowSpan={2}>Action</th>
                                    </tr>
                                    <tr>
                                        <th className={tdStyle + ' text-center'}>Load</th>
                                        <th className={tdStyle + ' text-center'}>Empty</th>
                                        <th className={tdStyle + ' text-center'}>Load</th>
                                        <th className={tdStyle + ' text-center'}>Empty</th>
                                        <th className={tdStyle + ' text-center'}>EX / SH</th>
                                        <th className={tdStyle + ' text-center'}>Name</th>
                                        <th className={tdStyle + ' text-center'}>Vehicle No</th>
                                        <th className={tdStyle + ' text-center'}>Phone Number</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {TranspoterArray.map((o, i) => (
                                        <tr key={i}>
                                            <td className={tdStyle}>{i + 1}</td>
                                            <td className={tdStyle}>{o?.Loading_Load}</td>
                                            <td className={tdStyle}>{o?.Loading_Empty}</td>
                                            <td className={tdStyle}>{o?.Unloading_Load}</td>
                                            <td className={tdStyle}>{o?.Unloading_Empty}</td>
                                            <td className={tdStyle}>{o?.EX_SH}</td>
                                            <td className={tdStyle}>{o?.DriverName}</td>
                                            <td className={tdStyle}>{o?.VehicleNo}</td>
                                            <td className={tdStyle}>{o?.PhoneNumber}</td>
                                            <td className={tdStyle + ' p-0 text-center'}>
                                                <IconButton
                                                    onClick={() => {
                                                        setTransportInput(pre => Object.fromEntries(
                                                            Object.entries(pre).map(([key, value]) => [key, o[key] ?? value])
                                                        ));
                                                        setDialogs(pre => ({ ...pre, transporterDialog: true }));
                                                    }}
                                                    size='small'
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        setTranspoterArray(prev => {
                                                            return prev.filter((_, index) => index !== i);
                                                        });
                                                    }}
                                                    size='small'
                                                    disabled={DeliveryArray.some(d => isEqualNumber(d.TransporterIndex, i))}
                                                    color='error'
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr>
                                        <td className={tdStyle + ' p-3'} colSpan={10}></td>
                                    </tr>
                                </tbody>
                            </table>

                            {/* Delivery Details */}
                            <table className="table m-0">
                                <thead>
                                    <tr>
                                        <td className={tdStyle + ' text-primary fw-bold bg-light'} colSpan={10}>DELIVERY DETAILS</td>
                                        <td className={tdStyle + ' text-end bg-light p-0'} colSpan={2}>
                                            <Button
                                                startIcon={<Add />}
                                                varient='outlined'
                                                disabled={TranspoterArray.length === 0}
                                                onClick={() => setDialogs(pre => ({ ...pre, deliveryDialog: true }))}
                                            >Add Delivery</Button>
                                            <Button
                                                startIcon={<Download />}
                                                varient='outlined'
                                                disabled={TranspoterArray.length === 0}
                                                onClick={() => setFilters(pre => ({ ...pre, tripSheetDialog: true }))}
                                            >From Trips</Button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th className={tdStyle + ' text-center'}>SNo</th>
                                        <th className={tdStyle + ' text-center'}>Location</th>
                                        <th className={tdStyle + ' text-center'}>Arrival Date</th>
                                        <th className={tdStyle + ' text-center'}>Item Name</th>
                                        <th className={tdStyle + ' text-center'}>Concern</th>

                                        <th className={tdStyle + ' text-center'}>Bill No</th>
                                        <th className={tdStyle + ' text-center'}>Bill Date</th>
                                        <th className={tdStyle + ' text-center'}>Quantity</th>
                                        <th className={tdStyle + ' text-center'}>Billed Rate</th>
                                        <th className={tdStyle + ' text-center'}>Tonnage / KGs</th>
                                        <th className={tdStyle + ' text-center'}>Batch / Location</th>

                                        <th className={tdStyle + ' text-center'}>Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {DeliveryArray.map((o, i) => (
                                        <tr key={i}>
                                            <td className={tdStyle}>{i + 1}</td>
                                            <td className={tdStyle}>{o?.Location}</td>
                                            <td className={tdStyle}>{o?.ArrivalDate}</td>
                                            <td className={tdStyle}>{o?.ItemName}</td>
                                            <td className={tdStyle}>{o?.Concern}</td>

                                            <td className={tdStyle}>{o?.BillNo}</td>
                                            <td className={tdStyle}>{o?.BillDate}</td>
                                            <td className={tdStyle}>{o?.Quantity}</td>
                                            <td className={tdStyle}>{o?.BilledRate ?? 0}</td>
                                            <td className={tdStyle}>{o?.Weight + ' ' + o?.Units}</td>
                                            <td className={tdStyle}>{o?.BatchLocation}</td>

                                            <td className={tdStyle + ' p-0 text-center'}>
                                                <IconButton
                                                    onClick={() => {
                                                        setDeliveryInput(pre => Object.fromEntries(
                                                            Object.entries(pre).map(([key, value]) => [key, o[key] ?? value])
                                                        ));
                                                        setDialogs(pre => ({ ...pre, deliveryDialog: true }));
                                                    }}
                                                    size='small'
                                                >
                                                    <Edit />
                                                </IconButton>
                                                <IconButton
                                                    onClick={() => {
                                                        setDeliveryArray(prev => {
                                                            return prev.filter((_, index) => index !== i);
                                                        });
                                                    }}
                                                    size='small'
                                                >
                                                    <Delete color='error' />
                                                </IconButton>
                                            </td>
                                        </tr>
                                    ))}

                                    <tr>
                                        <td className={'p-3'} colSpan={12}></td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    )}

                    <div className="d-flex justify-content-end flex-wrap my-3">
                        <Button
                            onClick={() => {
                                setOrderDetails(initialOrderDetailsValue);
                                setOrderItemArray([]);
                                setDeliveryArray([]);
                                setTranspoterArray([]);
                            }}
                            className='me-2'
                            variant='outlined'
                            startIcon={<ClearAll />}
                        >Clear Values</Button>
                        <Button
                            onClick={postOrder}
                            variant='contained'
                            startIcon={<Save />}
                            disabled={
                                (() => {
                                    const noOrderItems = isEqualNumber(OrderItemsArray.length, 0);
                                    const noPartyName = !OrderDetails.PartyName;
                                    const noDeliveryDetails =
                                        isEqualNumber(DeliveryArray.length, 0) &&
                                        isEqualNumber(TranspoterArray.length, 0);
                                    const noOrderId = !OrderDetails.Id;

                                    return (
                                        (options.PurchaseOrderOnly && (noOrderItems || noPartyName)) ||
                                        (options.PurchaseOderWithDelivery && ((noDeliveryDetails && noOrderItems) || noPartyName)) ||
                                        (options.DeliveryEntry && (noOrderId || noDeliveryDetails))
                                    );
                                })()
                            }
                        >Save</Button>
                    </div>

                </div>

                {/* add items dialog */}
                <Dialog
                    open={dialogs.itemsDialog}
                    onClose={closeDialog}
                    maxWidth='sm' fullWidth
                >
                    <DialogTitle>Add Items</DialogTitle>
                    <form onSubmit={e => {
                        e.preventDefault();
                        changeItems(orderItemsInput)
                    }}>
                        <DialogContent>
                            <table className="table m-0">
                                <tbody>
                                    <tr>
                                        <td className={tdStyle}>Item Name <RequiredStar /></td>
                                        <td className={tdStyle}>
                                            <Select
                                                value={{ value: orderItemsInput.ItemId, label: orderItemsInput.ItemName }}
                                                onChange={(e) => setOrderItemsInput(pre => ({ ...pre, ItemId: e.value, ItemName: e.label }))}
                                                options={[
                                                    { value: '', label: 'select', isDisabled: true },
                                                    ...products.map(obj => ({
                                                        value: obj?.Product_Id,
                                                        label: obj?.Product_Name,
                                                        isDisabled: (OrderItemsArray.findIndex(o => isEqualNumber(
                                                            o?.ItemId, obj?.Product_Id
                                                        ))) === -1 ? false : true
                                                    }))
                                                ]}
                                                styles={customSelectStyles}
                                                required
                                                isSearchable={true}
                                                placeholder={"Select Product"}
                                                maxMenuHeight={200}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Brand</td>
                                        <td className={tdStyle}>
                                            <input
                                                className='cus-inpt p-2'
                                                value={
                                                    checkIsNumber(orderItemsInput.ItemId)
                                                        ? (products.find(pro => isEqualNumber(pro.Product_Id, orderItemsInput.ItemId)).Brand_Name ?? 'Not found')
                                                        : ''
                                                }
                                                placeholder='Product Brand'
                                                disabled
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Weight <RequiredStar /></td>
                                        <td className={tdStyle}>
                                            <input
                                                type="number"
                                                className='cus-inpt p-2 w-auto'
                                                value={orderItemsInput.Weight}
                                                required
                                                placeholder='Weight'
                                                onChange={e => setOrderItemsInput(pre => ({ ...pre, Weight: e.target.value }))}
                                            />
                                            <input
                                                className='cus-inpt p-2 w-auto'
                                                value={orderItemsInput.Units}
                                                placeholder='Units ex: kg, l, ml...'
                                                onChange={e => setOrderItemsInput(pre => ({ ...pre, Units: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Rate <RequiredStar /></td>
                                        <td className={tdStyle}>
                                            <input
                                                type="number"
                                                required
                                                className='cus-inpt p-2'
                                                value={orderItemsInput.Rate}
                                                placeholder='Rate'
                                                onChange={e => setOrderItemsInput(pre => ({ ...pre, Rate: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Delivery Location <RequiredStar /></td>
                                        <td className={tdStyle}>
                                            <input
                                                className='cus-inpt p-2'
                                                required
                                                value={orderItemsInput.DeliveryLocation}
                                                placeholder='Location '
                                                onChange={e => setOrderItemsInput(pre => ({ ...pre, DeliveryLocation: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Discount</td>
                                        <td className={tdStyle}>
                                            <input
                                                type="number"
                                                className='cus-inpt p-2'
                                                placeholder='Discount Amount'
                                                value={orderItemsInput.Discount}
                                                onChange={e => setOrderItemsInput(pre => ({ ...pre, Discount: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Quality Condition</td>
                                        <td className={tdStyle}>
                                            <input
                                                className='cus-inpt p-2'
                                                value={orderItemsInput.QualityCondition}
                                                placeholder='Pencentage or condition'
                                                onChange={e => setOrderItemsInput(pre => ({ ...pre, QualityCondition: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </DialogContent>
                        <DialogActions className='d-flex justify-content-between'>
                            <span>
                                <Button variant='outlined' type='button' onClick={() => setOrderItemsInput(initialItemDetailsValue)}>clear</Button>
                            </span>
                            <span>
                                <Button
                                    variant='outlined'
                                    className='me-2'
                                    type='button'
                                    onClick={closeDialog}
                                >cancel</Button>
                                <Button variant='contained' type='submit'>submit</Button>
                            </span>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* Delivery Details */}
                <Dialog
                    open={dialogs.deliveryDialog}
                    onClose={closeDialog}
                    maxWidth='md' fullWidth
                >
                    <DialogTitle>Add Delivery Details</DialogTitle>
                    <form onSubmit={e => {
                        e.preventDefault();
                        changeDeliveryInfo(deliveryInput);
                    }}>
                        <DialogContent>
                            <table className="table mb-2">
                                <tbody>
                                    <tr>
                                        <td className={tdStyle}>Location</td>
                                        <td className={tdStyle}>
                                            {/* <input
                                                className={'cus-inpt p-2'}
                                                value={deliveryInput?.Location}
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, Location: e.target.value }))}
                                                placeholder='Location'
                                            /> */}
                                            <select
                                                value={deliveryInput?.LocationId}
                                                className='cus-inpt p-2'
                                                onChange={e => {
                                                    const selectedIndex = e.target.selectedIndex;
                                                    const selectedLabel = e.target.options[selectedIndex].text;

                                                    setDeliveryInput(pre => ({
                                                        ...pre,
                                                        LocationId: e.target.value,
                                                        Location: selectedLabel
                                                    }));
                                                }}
                                            >
                                                <option value="">select</option>
                                                {godownLocations.map((o, i) => (
                                                    <option value={o?.Godown_Id} key={i}>{o?.Godown_Name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className={'border-0'}></td>
                                        <td className={tdStyle}>Arrival Date <RequiredStar /></td>
                                        <td className={tdStyle}>
                                            <input
                                                type="date"
                                                value={deliveryInput?.ArrivalDate}
                                                required
                                                className='cus-inpt p-2'
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, ArrivalDate: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Item Name <RequiredStar /></td>
                                        <td className={tdStyle}>
                                            <Select
                                                value={{ value: deliveryInput?.ItemId, label: deliveryInput?.ItemName }}
                                                onChange={(e) => setDeliveryInput(pre => ({ ...pre, ItemId: e.value, ItemName: e.label }))}
                                                options={[
                                                    { value: '', label: 'select', isDisabled: true },
                                                    ...OrderItemsArray.map(obj => ({
                                                        value: obj?.ItemId,
                                                        label: obj?.ItemName
                                                    }))
                                                ]}
                                                styles={customSelectStyles}
                                                required={true}
                                                isSearchable={true}
                                                placeholder={"Select Product"}
                                                maxMenuHeight={200}
                                            />
                                        </td>
                                        <td className={'border-0'}></td>
                                        <td className={tdStyle}>Concern</td>
                                        <td className={tdStyle}>
                                            <input
                                                className={'cus-inpt p-2'}
                                                value={deliveryInput?.Concern}
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, Concern: e.target.value }))}
                                                placeholder=''
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Bill No</td>
                                        <td className={tdStyle}>
                                            <input
                                                className={'cus-inpt p-2'}
                                                value={deliveryInput?.BillNo}
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, BillNo: e.target.value }))}
                                                placeholder=''
                                            />
                                        </td>
                                        <td className={'border-0'}></td>
                                        <td className={tdStyle}>Bill Date</td>
                                        <td className={tdStyle}>
                                            <input
                                                type="date"
                                                value={deliveryInput?.BillDate}
                                                className='cus-inpt p-2'
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, BillDate: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Quantity</td>
                                        <td className={tdStyle}>
                                            <input
                                                type="number"
                                                value={deliveryInput?.Quantity}
                                                className='cus-inpt p-2'
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, Quantity: e.target.value }))}
                                            />
                                        </td>
                                        <td className={'border-0'}></td>
                                        <td className={tdStyle}>Tonnage <RequiredStar /></td>
                                        <td className={tdStyle}>
                                            <input
                                                type="number"
                                                value={deliveryInput?.Weight}
                                                className='cus-inpt p-2 w-50'
                                                placeholder='Weight'
                                                required
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, Weight: e.target.value }))}
                                            />
                                            <input
                                                value={deliveryInput?.Units}
                                                className='cus-inpt p-2 w-50'
                                                placeholder='Units ex: kg, L, ml'
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, Units: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Billed Rate</td>
                                        <td className={tdStyle}>
                                            <input
                                                type="number"
                                                value={deliveryInput?.BilledRate}
                                                className='cus-inpt p-2'
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, BilledRate: e.target.value }))}
                                            />

                                        </td>
                                        <td className={'border-0'}></td>
                                        <td className={tdStyle}>Batch / Location </td>
                                        <td className={tdStyle}>
                                            <input
                                                className={'cus-inpt p-2 w-auto'}
                                                value={deliveryInput?.BatchLocation}
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, BatchLocation: e.target.value }))}
                                                placeholder='location or batch'
                                            />
                                            <select
                                                value={deliveryInput?.TransporterIndex}
                                                className='cus-inpt w-auto'
                                                required
                                                onChange={e => setDeliveryInput(pre => ({ ...pre, TransporterIndex: e.target.value }))}
                                            >
                                                <option value={''} disabled>Select Trip</option>
                                                {TranspoterArray.map((o, i) => (
                                                    <option value={o?.indexValue} key={i}>Trip - {Addition(o?.indexValue, 1)}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>

                        </DialogContent>
                        <DialogActions className='d-flex justify-content-between'>
                            <span>
                                <Button variant='outlined' type='button' onClick={() => setOrderItemsInput(initialItemDetailsValue)}>clear</Button>
                            </span>
                            <span>
                                <Button
                                    variant='outlined'
                                    className='me-2'
                                    type='button'
                                    onClick={closeDialog}
                                >cancel</Button>
                                <Button variant='contained' type='submit'>submit</Button>
                            </span>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* Transporter Details */}
                <Dialog
                    open={dialogs.transporterDialog}
                    onClose={closeDialog}
                    maxWidth='sm' fullWidth
                >
                    <DialogTitle>Add Transporter Details</DialogTitle>
                    <form onSubmit={e => {
                        e.preventDefault();
                        changeTransporterInfo(transpoterInput);
                    }}>
                        <DialogContent>
                            <table className="table m-0">
                                <tbody>

                                    <tr>
                                        <td className={tdStyle + ' text-center bg-light'} colSpan={4}>
                                            Loading Details
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Load</td>
                                        <td className={tdStyle + ' p-0'}>
                                            <input
                                                type="number"
                                                value={transpoterInput?.Loading_Load}
                                                className={inputStyle + ' border-0'}
                                                onChange={e => setTransportInput(pre => ({ ...pre, Loading_Load: e.target.value }))}
                                            />
                                        </td>
                                        <td className={tdStyle}>Empty</td>
                                        <td className={tdStyle + ' p-0'}>
                                            <input
                                                type="number"
                                                value={transpoterInput?.Loading_Empty}
                                                className={inputStyle + ' border-0'}
                                                onChange={e => setTransportInput(pre => ({ ...pre, Loading_Empty: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle + ' text-center bg-light'} colSpan={4}>
                                            Unloading Details
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle}>Load</td>
                                        <td className={tdStyle + ' p-0'}>
                                            <input
                                                type="number"
                                                value={transpoterInput?.Unloading_Load}
                                                className={inputStyle + ' border-0'}
                                                onChange={e => setTransportInput(pre => ({ ...pre, Unloading_Load: e.target.value }))}
                                            />
                                        </td>
                                        <td className={tdStyle}>Empty</td>
                                        <td className={tdStyle + ' p-0'}>
                                            <input
                                                type="number"
                                                value={transpoterInput?.Unloading_Empty}
                                                className={inputStyle + ' border-0'}
                                                onChange={e => setTransportInput(pre => ({ ...pre, Unloading_Empty: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle} colSpan={2}>EX SH</td>
                                        <td className={tdStyle + ' p-0'} colSpan={2}>
                                            <input
                                                value={transpoterInput?.EX_SH}
                                                onChange={e => setTransportInput(pre => ({ ...pre, EX_SH: e.target.value }))}
                                                className={inputStyle + ' border-0'}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle} colSpan={2}>Driver Name</td>
                                        <td className={tdStyle + ' p-0'} colSpan={2}>
                                            <input
                                                value={transpoterInput?.DriverName}
                                                onChange={e => setTransportInput(pre => ({ ...pre, DriverName: e.target.value }))}
                                                className={inputStyle + ' border-0'}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle} colSpan={2}>Vehicle No</td>
                                        <td className={tdStyle + ' p-0'} colSpan={2}>
                                            <input
                                                value={transpoterInput?.VehicleNo}
                                                onChange={e => setTransportInput(pre => ({ ...pre, VehicleNo: e.target.value }))}
                                                className={inputStyle + ' border-0'}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={tdStyle} colSpan={2}>Phone Number</td>
                                        <td className={tdStyle + ' p-0'} colSpan={2}>
                                            <input
                                                value={transpoterInput?.PhoneNumber}
                                                onChange={(e) => {
                                                    const sanitizedValue = onlynum(e);
                                                    setTransportInput((pre) => ({
                                                        ...pre,
                                                        PhoneNumber: sanitizedValue,
                                                    }));
                                                }}
                                                className={inputStyle + ' border-0'}
                                                maxLength={10}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </DialogContent>
                        <DialogActions className='d-flex justify-content-between'>
                            <span>
                                <Button variant='outlined' type='button' onClick={() => setTransportInput(initialTranspoterDetailsValue)}>clear</Button>
                            </span>
                            <span>
                                <Button
                                    variant='outlined'
                                    className='me-2'
                                    type='button'
                                    onClick={closeDialog}
                                >cancel</Button>
                                <Button variant='contained' type='submit'>submit</Button>
                            </span>
                        </DialogActions>
                    </form>
                </Dialog>

                {/* import from Tripsheet */}
                <Dialog
                    open={filters.tripSheetDialog}
                    onClose={() => setFilters(pre => ({ ...pre, tripSheetDialog: false }))}
                    fullScreen
                >
                    <DialogTitle
                        className="d-flex align-items-center"
                    >
                        <span className="flex-grow-1">Import From Trip Sheet</span>
                        <IconButton
                            size="small" color="error"
                            onClick={() => setFilters(pre => ({ ...pre, tripSheetDialog: false }))}
                        ><Close /></IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <form onSubmit={e => {
                            e.preventDefault();
                            searchTripData();
                        }}>
                            <div className="row">
                                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                    <input
                                        type="date"
                                        value={filters.Fromdate}
                                        className="cus-inpt p-2"
                                        required
                                        max={filters.Todate}
                                        onChange={e => setFilters(pre => ({ ...pre, Fromdate: e.target.value }))}
                                    />
                                </div>
                                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                    <input
                                        type="date"
                                        value={filters.Todate}
                                        className="cus-inpt p-2"
                                        min={filters.Fromdate}
                                        required
                                        onChange={e => setFilters(pre => ({ ...pre, Todate: e.target.value }))}
                                    />
                                </div>
                                <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                    <Button
                                        variant="outlined"
                                        type="submit"
                                        startIcon={<Search />}
                                    >Search</Button>
                                </div>
                            </div>

                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            {['#', 'SNo', 'Date', 'Item', 'Rate', 'Quantity', 'From', 'To', 'Trip No', 'Challan No', 'Vehicle No', 'Branch'].map((o, i) => (
                                                <th className="fa-13" key={i}>{o}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tripData.flatMap(trip =>
                                            trip?.Products_List.map(product => ({
                                                ...trip,
                                                ...product,
                                            }))
                                        ).filter(fil =>
                                            !checkIsNumber(fil.arrivalOrderId)
                                            && OrderItemsArray.some(odrItem => isEqualNumber(odrItem.ItemId, fil.Product_Id))
                                        ).map((trip, tripIndex) => (
                                            <tr key={tripIndex}>
                                                <td className='fa-12'>
                                                    {(() => {
                                                        const isChecked = DeliveryArray.findIndex(o =>
                                                            isEqualNumber(o?.Trip_Id, trip.Trip_Id) &&
                                                            isEqualNumber(o?.Trip_Item_SNo, trip.S_No)
                                                        ) !== -1;

                                                        return (
                                                            <div>
                                                                <input
                                                                    className="form-check-input shadow-none pointer"
                                                                    style={{ padding: '0.7em' }}
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => {
                                                                        if (isChecked) changeTripItems(trip, true)
                                                                        else changeTripItems(trip)
                                                                    }}
                                                                />
                                                            </div>
                                                        )
                                                    })()}
                                                </td>
                                                <td className='fa-12'>{tripIndex + 1}</td>
                                                <td className='fa-12'>{trip?.Trip_Date ? LocalDate(trip.Trip_Date) : ''}</td>
                                                <td className='fa-12'>{trip?.Product_Name}</td>
                                                <td className='fa-12'>{trip?.Gst_Rate}</td>
                                                <td className='fa-12'>{trip?.QTY}</td>
                                                <td className='fa-12'>{trip?.FromLocation}</td>
                                                <td className='fa-12'>{trip?.ToLocation}</td>
                                                <td className='fa-12'>{trip?.Trip_No}</td>
                                                <td className='fa-12'>{trip?.Challan_No}</td>
                                                <td className='fa-12'>{trip?.Vehicle_No}</td>
                                                <td className='fa-12'>{trip?.Branch_Name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            size="small" color="error"
                            onClick={() => setFilters(pre => ({ ...pre, tripSheetDialog: false }))}
                        >close</Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    )
}

export default PurchaseOrderFormTemplate;