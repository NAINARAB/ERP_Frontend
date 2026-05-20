import { checkIsNumber, Division, isEqualNumber, ISOString, LocalDate, onlynum, toNumber } from "../../../../Components/functions";
import { initialDeliveryDetailsValue, initialItemDetailsValue, initialStaffDetailsValue, initialTranspoterDetailsValue } from "../variable";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Close, Delete, Download, Edit, Search } from "@mui/icons-material";
import RequiredStar from "../../../../Components/requiredStar";
import { fetchLink } from "../../../../Components/fetchComponent";

const findProductDetails = (arr = [], productid) => arr.find(obj => isEqualNumber(obj.Product_Id, productid)) ?? {};

const PurchaseOrderDeliveryDetails = ({
    tdStyle,
    DeliveryArray,
    setDeliveryInput,
    setDialogs,
    TranspoterArray,
    setTransportInput,
    OrderItemsArray,
    setFilters,
    setDeliveryArray,
    deliveryInput,
    dialogs,
    transpoterInput,
    closeDialog,
    tripData,
    setTripData,
    filters,
    loadingOn,
    loadingOff,
    StaffArray,
    setStaffArray,
    products,
    setTranspoterArray,
    setOrderItemsInput,
    inputStyle,
}) => {

    const changeDeliveryInfo = (details) => {
        setDeliveryArray(prev => {
            const preItems = prev.filter(o => !isEqualNumber(o?.Trip_Item_SNo, details?.Trip_Item_SNo));

            const reStruc = Object.fromEntries(
                Object.entries(initialDeliveryDetailsValue).map(([key, value]) => {
                    return [key, details[key] ?? value]
                })
            )
            return [...preItems, reStruc];
        });

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

    const searchTripData = () => {
        fetchLink({
            address: `inventory/tripSheet?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`,
            loadingOn: loadingOn,
            loadingOff: loadingOff,
        }).then(data => {
            if (data.success) {
                setTripData(data.data);
            }
        }).catch(e => console.error(e))
    }

    const updateTranspoterArray = (deliveryArray, deleteRow, itemDetail, trip) => {
        setTranspoterArray(prev => {
            const existingTrip = prev.find(o => isEqualNumber(o.indexValue, itemDetail.Trip_Id));

            const hasOtherDeliveries = deliveryArray.some(o => isEqualNumber(o.Trip_Id, itemDetail.Trip_Id));

            if (deleteRow) {
                return hasOtherDeliveries ? prev : prev.filter(o => !isEqualNumber(o.indexValue, itemDetail.Trip_Id));
            } else {
                const newTripObj = Object.fromEntries(
                    Object.entries(initialTranspoterDetailsValue).map(([key, value]) => {
                        switch (key) {
                            case "indexValue": return [key, trip?.Trip_Id];
                            case "Loading_Load": return [key, toNumber(trip?.LoadingLoad)];
                            case "Loading_Empty": return [key, toNumber(trip?.LoadingEmpty)];
                            case "Unloading_Load": return [key, toNumber(trip?.UnloadingLoad)];
                            case "Unloading_Empty": return [key, toNumber(trip?.UnloadingEmpty)];
                            case "EX_SH": return [key, existingTrip ? existingTrip.EX_SH : 0];
                            case "VehicleNo": return [key, trip?.Vehicle_No];
                            case "PhoneNumber": return [key, trip?.PhoneNumber];
                            default: return [key, value];
                        }
                    })
                );

                if (existingTrip) {
                    return prev.map(o => isEqualNumber(o.indexValue, itemDetail.Trip_Id) ? newTripObj : o);
                } else {
                    return [...prev, newTripObj].sort((a, b) => a.indexValue - b.indexValue);
                }
            }
        });
    };

    const changeTripItems = (itemDetail, deleteRow = false) => {
        const trip = tripData.find((trp) =>
            isEqualNumber(trp.Trip_Id, itemDetail.Trip_Id)
        );
        const getTripDate = trip?.Trip_Date;
        const tripDate = getTripDate ? ISOString(getTripDate) : ISOString();

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

        setDeliveryArray(prev => {
            const preItems = prev.filter(o => !(
                isEqualNumber(o?.Trip_Id, itemDetail?.Trip_Id)
                && isEqualNumber(o.Trip_Item_SNo, itemDetail.Arrival_Id)
            ));

            let updatedDeliveryArray;
            if (deleteRow) {
                updatedDeliveryArray = preItems;
            } else {
                const currentProduct = trip?.Products_List?.find(o => (
                    isEqualNumber(o?.Trip_Id, itemDetail?.Trip_Id)
                    && isEqualNumber(o.Arrival_Id, itemDetail.Arrival_Id)
                )) || {};

                const productDetails = findProductDetails(products, currentProduct?.Product_Id);
                const pack = parseFloat(productDetails?.PackGet ?? 0);
                const Quantity = Division(currentProduct?.QTY ?? 0, pack || 1);

                const reStruc = Object.fromEntries(
                    Object.entries(initialDeliveryDetailsValue).map(([key, value]) => {
                        switch (key) {
                            case 'LocationId': return [key, Number(currentProduct?.To_Location) ?? value];
                            case 'Location': return [key, currentProduct?.ToLocation ?? value];
                            case "Trip_Id": return [key, currentProduct?.Trip_Id ?? null];
                            case "Trip_Item_SNo": return [key, currentProduct?.Arrival_Id ?? null];
                            case "TransporterIndex": return [key, toNumber(trip?.Trip_Id)];
                            case "ArrivalDate": return [key, tripDate];
                            case "ItemId": return [key, Number(currentProduct?.Product_Id)];
                            case "ItemName": return [key, currentProduct?.Product_Name];
                            case "Concern": return [key, currentProduct?.Concern ?? value];
                            case "BillNo": return [key, currentProduct?.BillNo ?? value];
                            case "BillDate": return [key, tripDate];
                            case "BilledRate": return [key, Number(currentProduct?.Gst_Rate)];
                            case "Quantity": return [key, Quantity];
                            case "Weight": return [key, Number(currentProduct?.QTY) ?? 0];
                            case "BatchLocation": return [key, currentProduct?.Batch_No ?? ""];
                            default: return [key, value];
                        }
                    })
                );

                updatedDeliveryArray = [...preItems, reStruc];
            }

            updateTranspoterArray(updatedDeliveryArray, deleteRow, itemDetail, trip);
            return updatedDeliveryArray;
        });
    };

    const deleteDeliveryItem = (row, currentDeliveryArray = []) => {
        const filterdDeliveryArray = currentDeliveryArray.filter(o => !(
            isEqualNumber(o?.Trip_Id, row?.Trip_Id)
            && isEqualNumber(o.Trip_Item_SNo, row?.Trip_Item_SNo)
        ))

        setDeliveryArray(filterdDeliveryArray);
        setTranspoterArray(pre => {
            return pre.filter(fil => (
                filterdDeliveryArray.some(sme => isEqualNumber(sme.Trip_Id, fil.indexValue))
            ))
        });
    }

    return (
        <>
            {/* Delivery Details */}
            <table className="table m-0">
                <thead>
                    <tr>
                        <td className={tdStyle + ' text-primary fw-bold bg-light'} colSpan={10}>DELIVERY DETAILS</td>
                        <td className={tdStyle + ' text-end bg-light p-0'} colSpan={2}>
                            {/* <Button
                                startIcon={<Add />}
                                varient='outlined'
                                disabled={TranspoterArray.length === 0}
                                onClick={() => setDialogs(pre => ({ ...pre, deliveryDialog: true }))}
                            >Add Delivery</Button> */}
                            <Button
                                startIcon={<Download />}
                                varient='outlined'
                                disabled={OrderItemsArray.length === 0}
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
                                        // setDeliveryArray(prev => {
                                        //     return prev.filter((_, index) => index !== i);
                                        // });
                                        deleteDeliveryItem(o, DeliveryArray);
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

            {/* TRANSPOTER DETAILS */}
            <table className="table m-0">
                <thead>
                    <tr>
                        <td className={tdStyle + ' text-primary fw-bold bg-light'} colSpan={10}>
                            OTHER DETAILS
                        </td>
                        {/* <td className={tdStyle + ' text-end bg-light p-0'}>
                                                        <Button
                                                            startIcon={<Add />}
                                                            varient='outlined'
                                                            onClick={() => setDialogs(pre => ({ ...pre, transporterDialog: true }))}
                                                        >Add Transporter</Button>
                                                    </td> */}
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
                            </td>
                        </tr>
                    ))}
                    <tr>
                        <td className={tdStyle + ' p-3'} colSpan={10}></td>
                    </tr>
                </tbody>
            </table>

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
                                        {deliveryInput?.Location}
                                    </td>
                                    <td className={'border-0'}></td>
                                    <td className={tdStyle}>Arrival Date</td>
                                    <td className={tdStyle}>
                                        {LocalDate(deliveryInput?.ArrivalDate)}
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>Item Name</td>
                                    <td className={tdStyle}>
                                        {deliveryInput?.ItemName}
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
                                        {deliveryInput?.Quantity}
                                    </td>
                                    <td className={'border-0'}></td>
                                    <td className={tdStyle}>Tonnage <RequiredStar /></td>
                                    <td className={tdStyle}>
                                        {deliveryInput?.Weight + ' ' + deliveryInput?.Units}
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
                                        {deliveryInput?.BatchLocation}
                                        {/* <input
                                            className={'cus-inpt p-2 '}
                                            value={deliveryInput?.BatchLocation}
                                            disabled
                                            onChange={e => setDeliveryInput(pre => ({ ...pre, BatchLocation: e.target.value }))}
                                            placeholder='location or batch'
                                        /> */}
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
                                            disabled
                                            value={transpoterInput?.Loading_Load}
                                            className={inputStyle + ' border-0 bg-white'}
                                            onChange={e => setTransportInput(pre => ({ ...pre, Loading_Load: e.target.value }))}
                                        />
                                    </td>
                                    <td className={tdStyle}>Empty</td>
                                    <td className={tdStyle + ' p-0'}>
                                        <input
                                            type="number"
                                            disabled
                                            value={transpoterInput?.Loading_Empty}
                                            className={inputStyle + ' border-0 bg-white'}
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
                                            disabled
                                            value={transpoterInput?.Unloading_Load}
                                            className={inputStyle + ' border-0 bg-white'}
                                            onChange={e => setTransportInput(pre => ({ ...pre, Unloading_Load: e.target.value }))}
                                        />
                                    </td>
                                    <td className={tdStyle}>Empty</td>
                                    <td className={tdStyle + ' p-0'}>
                                        <input
                                            type="number"
                                            disabled
                                            value={transpoterInput?.Unloading_Empty}
                                            className={inputStyle + ' border-0 bg-white'}
                                            onChange={e => setTransportInput(pre => ({ ...pre, Unloading_Empty: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle} colSpan={2}>EX SH</td>
                                    <td className={tdStyle + ' p-0'} colSpan={2}>
                                        <input
                                            disabled
                                            value={transpoterInput?.EX_SH}
                                            onChange={e => setTransportInput(pre => ({ ...pre, EX_SH: e.target.value }))}
                                            className={inputStyle + ' border-0 bg-white'}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle} colSpan={2}>Driver Name</td>
                                    <td className={tdStyle + ' p-0'} colSpan={2}>
                                        <input
                                            value={transpoterInput?.DriverName}
                                            onChange={e => setTransportInput(pre => ({ ...pre, DriverName: e.target.value }))}
                                            className={inputStyle + ' border-0 bg-white'}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle} colSpan={2}>Vehicle No</td>
                                    <td className={tdStyle + ' p-0'} colSpan={2}>
                                        <input
                                            value={transpoterInput?.VehicleNo}
                                            disabled
                                            onChange={e => setTransportInput(pre => ({ ...pre, VehicleNo: e.target.value }))}
                                            className={inputStyle + ' border-0 bg-white'}
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
                                            className={inputStyle + ' border-0 bg-white'}
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
                    </form>

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
                                ).filter(fil => {
                                    return OrderItemsArray.some(odrItem => (
                                        isEqualNumber(odrItem.ItemId, fil.Product_Id)
                                    )) && !checkIsNumber(fil.arrivalOrderId)
                                    // !fil?.ConvertedPurchaseOrders?.some(co => (
                                    //     isEqualNumber(co.Trip_Id, fil.Trip_Id)
                                    //     && isEqualNumber(co.Trip_Item_SNo, fil.Arrival_Id)
                                    // ))
                                }).map((trip, tripIndex) => (
                                    <tr key={tripIndex}>
                                        <td className='fa-12'>
                                            {(() => {
                                                const isChecked = DeliveryArray.findIndex(o =>
                                                    isEqualNumber(o?.Trip_Id, trip.Trip_Id) &&
                                                    isEqualNumber(o?.Trip_Item_SNo, trip.Arrival_Id)
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
                </DialogContent>
                <DialogActions>
                    <Button
                        size="small" color="error"
                        onClick={() => setFilters(pre => ({ ...pre, tripSheetDialog: false }))}
                    >close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default PurchaseOrderDeliveryDetails;