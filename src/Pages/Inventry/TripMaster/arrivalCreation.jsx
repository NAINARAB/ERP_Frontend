import { Button, Card, CardContent, IconButton } from "@mui/material";
import { useEffect, useState } from "react";
import { isEqualNumber, ISOString, isValidNumber, reactSelectFilterLogic, toNumber } from "../../../Components/functions";
import { Delete } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import { initialArrivalValue } from './tableColumns';
import { tripTypes } from './tableColumns';
import { toast } from "react-toastify";
import AppDialog from "../../../Components/appDialogComponent";

const initialPayload = {
    fromGodown: { value: '', label: 'Select Godown' },
    toGodown: { value: '', label: 'Select Godown' },
    items: [],
    tripType: tripTypes[0],
    activityDate: ISOString()
}

const ArrivalCreation = ({ loadingOn, loadingOff, switchDisplay }) => {
    const [godownActivityData, setGodownActivityData] = useState(initialPayload)
    const [godownStock, setGodownStock] = useState([]);

    //dependency 
    const [godown, setGodown] = useState([]);
    const [products, setProducts] = useState([]);
    const [postDialog, setPostDialog] = useState(false);

    useEffect(() => {
        if (isValidNumber(godownActivityData.fromGodown.value) && godownActivityData.tripType.value === 'OTHER_GODOWN') {
            fetchLink({
                address: `reports/storageStock/godownWise?Godown_Id=${godownActivityData.fromGodown.value}`,
                loadingOn, loadingOff
            }).then(data => {
                if (data.success) {
                    setGodownStock(data.data);
                }
            }).catch(console.error)
        } else {
            setGodownStock([]);
        }
    }, [godownActivityData.fromGodown.value, godownActivityData.tripType.value])

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (loadingOn) loadingOn();
                const [
                    productsResponse,
                    godownLocationsResponse,
                ] = await Promise.all([
                    fetchLink({ address: `masters/products/allProducts` }),
                    fetchLink({ address: `dataEntry/godownLocationMaster` }),
                ]);

                const productsData = (productsResponse.success ? productsResponse.data : []).sort(
                    (a, b) => String(a?.Product_Name).localeCompare(b?.Product_Name)
                );

                const godownLocations = (godownLocationsResponse.success ? godownLocationsResponse.data : []).sort(
                    (a, b) => String(a?.Godown_Name).localeCompare(b?.Godown_Name)
                ).map(item => ({ label: item?.Godown_Name, value: item?.Godown_Id }));

                setProducts(productsData);
                setGodown(godownLocations);

            } catch (e) {
                console.error("Error fetching data:", e);
            } finally {
                if (loadingOff) loadingOff();
            }
        };

        fetchData();
    }, [])

    const getRowValue = (row) => godownActivityData.items.find(
        item => isEqualNumber(item.Product_Id, row.Product_Id)
    ) || {};

    const getProductDetails = (productId) => products.find(pro => isEqualNumber(pro.Product_Id, productId)) || {};

    const quantityChange = (Product_Id, value) => {
        const numValue = toNumber(value);
        const productInfo = getProductDetails(Product_Id);

        setGodownActivityData(pre => {
            const itemIndex = pre.items.findIndex(item => isEqualNumber(item.Product_Id, Product_Id));
            if (itemIndex !== -1) {
                const newItems = [...pre.items];
                newItems[itemIndex] = {
                    ...newItems[itemIndex],
                    QTY: numValue,
                };
                return { ...pre, items: newItems };
            } else {
                const newItem = {
                    ...initialArrivalValue,
                    Product_Id: Product_Id,
                    QTY: numValue,
                    Unit_Id: productInfo?.UOM_Id,
                    Units: productInfo?.Units,
                    Gst_Rate: productInfo?.Item_Rate,
                    HSN_Code: productInfo?.HSN_Code,
                };
                return { ...pre, items: [...pre.items, newItem] };
            }
        });
    }

    const closeDialog = () => {
        setPostDialog(false);
        // setGodownActivityData(initialPayload);
    }

    const handleCreate = () => {
        if (!isValidNumber(godownActivityData.fromGodown.value)) return toast.warn('Select From Godown');
        if (!isValidNumber(godownActivityData.toGodown.value)) return toast.warn('Select To Godown');
        fetchLink({
            address: `inventory/tripSheet/arrivalEntry/bulk`,
            method: 'POST',
            bodyData: godownActivityData.items.map(item => ({
                ...item,
                From_Location: godownActivityData.fromGodown.value,
                To_Location: godownActivityData.toGodown.value,
                Arrival_Date: godownActivityData.activityDate,
            })),
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                closeDialog()
                setGodownActivityData(initialPayload);
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e))
    }

    const handleRemoveItem = (index) => {
        setGodownActivityData(pre => ({
            ...pre,
            items: pre.items.filter((_, i) => i !== index)
        }));
    }

    const renderListPayloadData = () => {
        return (
            <div className="table-responsive">
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            {['Sno', 'Item', 'Quantity', 'HSN', 'Units', 'Action'].map((item, index) => (
                                <th key={index} className="fa-13 bg-light">{item}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {godownActivityData.items.map((row, index) => {
                            const productInfo = getProductDetails(row?.Product_Id);
                            return (
                                <tr key={index}>
                                    <td className="fa-12">{index + 1}</td>
                                    <td className="fa-12">{productInfo?.Product_Name}</td>
                                    <td className="fa-12">
                                        {godownActivityData.tripType.value === 'MATERIAL_INWARD' ? (
                                            <input
                                                type="number"
                                                className="cus-inpt p-2"
                                                value={row.QTY}
                                                onChange={(e) => setGodownActivityData(pre => ({
                                                    ...pre,
                                                    items: pre.items.map((item, i) => i === index ? { ...item, QTY: e.target.value } : item)
                                                }))}
                                            />
                                        ) : row.QTY}
                                    </td>
                                    <td className="fa-12">{row.HSN_Code}</td>
                                    {/* <td className="fa-12">{row.Gst_Rate}</td> */}
                                    <td className="fa-12">{row.Units}</td>
                                    <td className="fa-12">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleRemoveItem(index)}
                                        ><Delete color='error' className="fa-20" /></IconButton>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        )
    }

    return (
        <>
            <Card>
                <CardContent>
                    <div className="d-flex align-items-center">
                        <h5 className="fa-16 flex-grow-1">Godown Activity</h5>
                        <Button onClick={switchDisplay} variant="outlined" className="me-2">Cancel</Button>
                        <Button onClick={() => {
                            if (godownActivityData.tripType.value === 'MATERIAL_INWARD') {
                                handleCreate();
                            } else {
                                setPostDialog(true);
                            }
                        }} variant="outlined" disabled={godownActivityData.items.length === 0}>Save</Button>
                    </div>
                    <hr />

                    <div className="row">
                        <div className="col-xxl-3 col-lg-4 col-md-6 p-2">
                            <label>Activity Type</label>
                            <select
                                className="cus-inpt p-2"
                                value={godownActivityData.tripType.value}
                                onChange={(e) => {
                                    setGodownActivityData(pre => ({
                                        ...pre,
                                        tripType: { value: e.target.value, label: e.target.value }
                                    }))
                                    setGodownActivityData(pre => ({ ...pre, items: [] }))
                                }}
                            >
                                {tripTypes.map((item, index) => <option key={index} value={item.value}>{item.label}</option>)}
                            </select>
                        </div>

                        <div className="col-xxl-3 col-lg-4 col-md-6 p-2">
                            <label>Select From Godown</label>
                            <Select
                                options={godown.filter(item => !isEqualNumber(item.value, godownActivityData.toGodown.value))}
                                styles={customSelectStyles}
                                value={godownActivityData.fromGodown}
                                onChange={(e) => setGodownActivityData(pre => ({ ...pre, fromGodown: e }))}
                                isSearchable={true}
                                maxMenuHeight={300}
                                filterOption={reactSelectFilterLogic}
                                menuPortalTarget={document.body}
                            />
                        </div>

                        <div className="col-xxl-3 col-lg-4 col-md-6 p-2">
                            <label>Select To Godown</label>
                            <Select
                                options={godown.filter(item => !isEqualNumber(item.value, godownActivityData.fromGodown.value))}
                                styles={customSelectStyles}
                                value={godownActivityData.toGodown}
                                onChange={(e) => setGodownActivityData(pre => ({ ...pre, toGodown: e }))}
                                isSearchable={true}
                                maxMenuHeight={300}
                                filterOption={reactSelectFilterLogic}
                                menuPortalTarget={document.body}
                            />
                        </div>

                        <div className="col-xxl-3 col-lg-4 col-md-6 p-2">
                            <label>Date</label>
                            <input
                                type="date"
                                value={godownActivityData.activityDate}
                                onChange={(e) => setGodownActivityData(pre => ({ ...pre, activityDate: e.target.value }))}
                                className="cus-inpt p-2"
                            />
                        </div>
                    </div>

                    {godownActivityData.tripType.value === 'MATERIAL_INWARD' && (
                        <div>
                            <label>Add Products</label>
                            <Select
                                value={{ value: '', label: 'Search Product' }}
                                onChange={e => quantityChange(e.value, 0)}
                                options={
                                    products.filter(
                                        item => !godownActivityData.items.some(i => isEqualNumber(i.Product_Id, item.Product_Id))
                                    ).map(item => ({ value: item.Product_Id, label: item.Product_Name }))}
                                menuPortalTarget={document.body}
                                styles={customSelectStyles}
                                isSearchable={true}
                                filterOption={reactSelectFilterLogic}
                            // closeMenuOnSelect={false}
                            />
                            <br />
                            {godownActivityData.items.length > 0 && renderListPayloadData()}
                        </div>
                    )}

                    {(godownActivityData.tripType.value === 'OTHER_GODOWN' && godownStock.length > 0) && (
                        <div className="table-responsive">
                            <h6 className="mt-2">Available Stock in {godownActivityData.fromGodown.label}</h6>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        {['Sno', 'Item', 'Available Qty', 'Enter Transfer Qty'].map((item, index) => (
                                            <th key={index} style={{ fontSize: '13px' }}>{item}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {godownStock.filter(item => toNumber(item.Bal_Qty) > 0).map((row, index) => (
                                        <tr key={index}>
                                            <td className="fa-12 vctr text-center">{index + 1}</td>
                                            <td className="fa-12 vctr">{row.stock_item_name}</td>
                                            <td className="fa-12 vctr">{row.Bal_Qty}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={row.Bal_Qty}
                                                    value={getRowValue(row)?.QTY || ''}
                                                    onChange={(e) => quantityChange(row?.Product_Id, e.target.value)}
                                                    className="cus-inpt"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </CardContent>
            </Card>

            <AppDialog
                title={'Confermation'}
                open={postDialog}
                onClose={closeDialog}
                onSubmit={handleCreate}
                maxWidth="lg"
            >{renderListPayloadData()}</AppDialog>
        </>
    )
}


export default ArrivalCreation;