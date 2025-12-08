import { Button, Card, CardContent } from '@mui/material';
import { useEffect, useState } from 'react';
import { fetchLink } from '../../../Components/fetchComponent';
import { checkIsNumber, isEqualNumber, ISOString, isValidObject, toArray } from '../../../Components/functions';
import { Save, ClearAll } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify'
import { initialDeliveryDetailsValue, initialItemDetailsValue, initialOrderDetailsValue, initialTranspoterDetailsValue } from './variable';
import PurchseOrderStaffInvolved from './createComponents/staffInvolved';
import PurchaseOrderOrderedProducts from './createComponents/orderedProducts';
import PurchaseOrderGeneralInfo from './createComponents/generalInfo';
import PurchaseOrderDeliveryDetails from './createComponents/deliveryAndTransporter';


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
    const [branch, setBranch] = useState([]);

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
            address: `masters/products`
        }).then(data => {
            const productsData = (data.success ? data.data : []).sort(
                (a, b) => String(a?.Product_Name).localeCompare(b?.Product_Name)
            );
            setProducts(productsData);
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
            address: `masters/retailers/dropdown`
        }).then(data => {
            if (data.success) {
                const retailerData = toArray(data?.data).sort(
                    (a, b) => String(a?.Retailer_Name).localeCompare(b?.Retailer_Name)
                );
                setRetailers(retailerData);
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/branch/dropDown`
        }).then(data => {
            if (data.success) {
                setBranch(data.data);
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

    const clearValues = () => {
        setOrderDetails(initialOrderDetailsValue);
        setOrderItemArray([]);
        setDeliveryArray([]);
        setTranspoterArray([]);
    }

    return (
        <>
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
                        <PurchseOrderStaffInvolved
                            StaffArray={StaffArray}
                            costCenterData={costCenterData}
                            costCenterCategoryData={costCenterCategoryData}
                            setStaffArray={setStaffArray}
                        />

                        {/* po general details */}
                        <PurchaseOrderGeneralInfo
                            OrderDetails={OrderDetails}
                            retailers={retailers}
                            branch={branch}
                            setOrderDetails={setOrderDetails}
                            inputStyle={inputStyle}
                        />

                    </div>

                    <div className="table-responsive">

                        {/* Item Details */}
                        {(options.PurchaseOrderOnly || options.PurchaseOderWithDelivery) && (!options.DeliveryEntry) && (
                            <PurchaseOrderOrderedProducts
                                OrderItemsArray={OrderItemsArray}
                                setOrderItemArray={setOrderItemArray}
                                setOrderItemsInput={setOrderItemsInput}
                                setDialogs={setDialogs}
                                tdStyle={tdStyle}
                                dialogs={dialogs}
                                closeDialog={closeDialog}
                                orderItemsInput={orderItemsInput}
                                products={products}
                            />
                        )}

                        {(options.PurchaseOderWithDelivery || options.DeliveryEntry) && (
                            <>
                                <PurchaseOrderDeliveryDetails
                                    tdStyle={tdStyle}
                                    DeliveryArray={DeliveryArray}
                                    setDeliveryInput={setDeliveryInput}
                                    setDialogs={setDialogs}
                                    TranspoterArray={TranspoterArray}
                                    setTransportInput={setTransportInput}
                                    OrderItemsArray={OrderItemsArray}
                                    setFilters={setFilters}
                                    setDeliveryArray={setDeliveryArray}
                                    deliveryInput={deliveryInput}
                                    dialogs={dialogs}
                                    transpoterInput={transpoterInput}
                                    closeDialog={closeDialog}
                                    tripData={tripData}
                                    setTripData={setTripData}
                                    filters={filters}
                                    loadingOn={loadingOn}
                                    loadingOff={loadingOff}
                                    StaffArray={StaffArray}
                                    setStaffArray={setStaffArray}
                                    products={products}
                                    setTranspoterArray={setTranspoterArray}
                                    setOrderItemsInput={setOrderItemsInput}
                                    inputStyle={inputStyle}
                                />
                            </>
                        )}

                        <div className="d-flex justify-content-end flex-wrap my-3">
                            <Button
                                onClick={clearValues}
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
                </CardContent>
            </Card>
        </>
    )
}

export default PurchaseOrderFormTemplate;