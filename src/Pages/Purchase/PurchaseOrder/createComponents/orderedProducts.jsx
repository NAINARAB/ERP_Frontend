import { checkIsNumber, isEqualNumber, reactSelectFilterLogic } from "../../../../Components/functions";
import { initialItemDetailsValue, initialStaffDetailsValue } from "../variable";
import Select from 'react-select';
import { customSelectStyles } from '../../../../Components/tablecolumn';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Add, Delete, Edit } from "@mui/icons-material";
import RequiredStar from "../../../../Components/requiredStar";

const PurchaseOrderOrderedProducts = ({
    OrderItemsArray = [],
    setOrderItemArray,
    setOrderItemsInput,
    setDialogs,
    tdStyle,
    dialogs = {},
    closeDialog,
    orderItemsInput,
    products = [],
}) => {

    const changeItems = (itemDetail) => {
        setOrderItemArray(prev => {
            const preItems = prev.filter(o => !isEqualNumber(o?.ItemId, itemDetail?.ItemId));

            const reStruc = Object.fromEntries(
                Object.entries(initialItemDetailsValue).map(([key, value]) => {
                    return [key, itemDetail[key] ?? value]
                })
            )
            return [...preItems, reStruc];
        });
        setOrderItemsInput(initialItemDetailsValue);
        setDialogs(pre => ({ ...pre, itemsDialog: false }));
    }
    
    return (
        <>
            <table className="table m-0">
                <thead>
                    <tr>
                        <td className={tdStyle + ' text-primary fw-bold bg-light'} colSpan={4}>
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
                        {/* <th className={tdStyle + ' text-center'}>Discount</th>
                            <th className={tdStyle + ' text-center'}>Quality Condition</th> */}
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
                            {/* <td className={tdStyle}>{o?.Discount}</td>
                                <td className={tdStyle}>{o?.QualityCondition}</td> */}
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
                                            menuPortalTarget={document.body}
                                            filterOption={reactSelectFilterLogic}
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
                                {/* <tr>
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
                                            </tr> */}
                            </tbody>
                        </table>
                    </DialogContent>
                    <DialogActions className='d-flex justify-content-between'>
                        <span>
                            <Button
                                variant='outlined'
                                type='button'
                                onClick={() => setOrderItemsInput(initialItemDetailsValue)}
                            >clear</Button>
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
        </>
    )
}

export default PurchaseOrderOrderedProducts;