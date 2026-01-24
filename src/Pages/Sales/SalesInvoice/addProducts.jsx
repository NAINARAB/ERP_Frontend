import { useEffect, useMemo, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { checkIsNumber, Division, isEqualNumber, isValidNumber, isValidObject, Multiplication, onlynum, reactSelectFilterLogic, rid, toArray, toNumber } from "../../../Components/functions";
import { ClearAll } from "@mui/icons-material";
import RequiredStar from "../../../Components/requiredStar";
import { calculateGSTDetails } from "../../../Components/taxCalculator";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from "react-toastify";
import { fetchLink } from "../../../Components/fetchComponent";

const validStockValue = (Item_Id, Godown_Id, stockInGodown) => {
    const godownStockValue = toArray(stockInGodown).find(
        godownItem => (
            isEqualNumber(godownItem?.Product_Id, Item_Id) &&
            isEqualNumber(godownItem?.Godown_Id, Godown_Id)
        )
    )?.Act_Bal_Qty;

    return toNumber(godownStockValue);
};

const AddProductForm = ({
    children,
    orderProducts = [],
    setOrderProducts,
    open = false,
    onClose,
    products = [],
    brands = [],
    uom = [],
    godowns = [],
    GST_Inclusive,
    IS_IGST,
    editValues = null,
    initialValue = {},
    batchDetails = [],
    saleOrderNumber
}) => {

    const [productDetails, setProductDetails] = useState(initialValue);

    const isInclusive = isEqualNumber(GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(GST_Inclusive, 2);

    const [stockInGodowns, setStockInGodowns] = useState([]);

    useEffect(() => {
        if (isValidObject(editValues) && open) {
            setProductDetails(pre => (
                Object.fromEntries(
                    Object.entries(pre).map(([key, value]) => [key, editValues[key] ? editValues[key] : value])
                )
            ))
        }
    }, [editValues])

    const findProductDetails = (productid) => products?.find(obj => isEqualNumber(obj?.Product_Id, productid)) ?? {};

    const closeDialog = () => {
        setProductDetails(initialValue);
        onClose();
    }

    const handleProductInputChange = () => {

        setOrderProducts(pre => {
            const existingProducts = pre.filter(ordered => ordered.rowId !== productDetails.rowId);

            const currentProductDetails = Object.fromEntries(
                Object.entries(productDetails).map(([key, value]) => {
                    const productMaster = findProductDetails(productDetails.Item_Id);
                    const gstPercentage = IS_IGST ? productMaster.Igst_P : productMaster.Gst_P;
                    const isTaxable = gstPercentage > 0;

                    const { Bill_Qty, Item_Rate, Amount } = productDetails;

                    const taxType = isNotTaxableBill ? 'zerotax' : isInclusive ? 'remove' : 'add';
                    const itemRateGst = calculateGSTDetails(Item_Rate, gstPercentage, taxType);
                    const gstInfo = calculateGSTDetails(Amount, gstPercentage, taxType);

                    const cgstPer = !IS_IGST ? gstInfo.cgst_per : 0;
                    const igstPer = IS_IGST ? gstInfo.igst_per : 0;
                    const Cgst_Amo = !IS_IGST ? gstInfo.cgst_amount : 0;
                    const Igst_Amo = IS_IGST ? gstInfo.igst_amount : 0;

                    switch (key) {
                        case 'Item_Name': return [key, productMaster.Product_Name]
                        case 'Taxable_Rate': return [key, itemRateGst.base_amount]
                        case 'Total_Qty': return [key, Bill_Qty]
                        case 'Taxble': return [key, isTaxable ? 1 : 0]
                        case 'Taxable_Amount': return [key, gstInfo.base_amount]
                        case 'Tax_Rate': return [key, gstPercentage]
                        case 'Cgst':
                        case 'Sgst': return [key, cgstPer ?? 0]
                        case 'Cgst_Amo':
                        case 'Sgst_Amo': return [key, isNotTaxableBill ? 0 : Cgst_Amo]
                        case 'Igst': return [key, igstPer ?? 0]
                        case 'Igst_Amo': return [key, isNotTaxableBill ? 0 : Igst_Amo]
                        case 'Final_Amo': return [key, gstInfo.with_tax]

                        default: return [key, productDetails[key] || value]
                    }
                })
            );

            return [...existingProducts, currentProductDetails];
        });

        closeDialog();
    };

    useEffect(() => {
        setStockInGodowns([]);
        if (checkIsNumber(productDetails.Item_Id) && !isEqualNumber(productDetails.Item_Id, 0)) {
            fetchLink({ address: `sales/stockInGodown?Item_Id=${productDetails.Item_Id}` })
                .then(data => {
                    const stockInGodowns = (data.success ? data.data : []).sort(
                        (a, b) => String(a?.stock_item_name).localeCompare(b?.stock_item_name)
                    );
                    setStockInGodowns(stockInGodowns);
                })
        }
    }, [productDetails.Item_Id])

    const altActQty = useMemo(() => {
        const quantity = toNumber(productDetails?.Bill_Qty);
        const productMaster = findProductDetails(productDetails?.Item_Id) || {};
        const pack = toNumber(productMaster?.PackGet);

        return Division(quantity, pack);
    }, [productDetails.Item_Id, productDetails.Bill_Qty])

    return (
        <>
            {children}

            <Dialog
                open={open}
                onClose={closeDialog}
                maxWidth='md' fullWidth
            >
                <DialogTitle className="border-bottom">
                    <span>Add Products Details</span>
                </DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();
                    if (
                        isValidNumber(productDetails.Item_Id) && (
                            Object.hasOwn(productDetails, 'GoDown_Id')
                                ? isValidNumber(productDetails.GoDown_Id)
                                : true
                        )
                    ) {
                        handleProductInputChange();
                    } else {
                        productDetails.Item_Id ? toast.warn('Select Godown') : toast.warn('Select Product');
                    }
                }}>
                    <DialogContent>
                        <div className="row pb-5">

                            {/* brand */}
                            <div className="col-6 p-2">
                                <label>Brand</label>
                                <Select
                                    value={{ value: productDetails.BrandID, label: productDetails.Brand }}
                                    onChange={(e) => setProductDetails(pre => ({ ...pre, BrandID: e.value, Brand: e.label }))}
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...brands.map(obj => ({ value: obj?.Brand, label: obj?.Brand_Name }))
                                    ]}
                                    styles={customSelectStyles}
                                    menuPortalTarget={document.body}
                                    isSearchable={true}
                                    placeholder={"Select Brand"}
                                    maxMenuHeight={200}
                                    filterOption={reactSelectFilterLogic}
                                />
                            </div>

                            {/* group */}
                            <div className="col-6 p-2">
                                <label>Group</label>
                                <Select
                                    value={{ value: productDetails.GroupID, label: productDetails.Group }}
                                    onChange={(e) =>
                                        setProductDetails((pre) => ({ ...pre, GroupID: e.value, Group: e.label }))
                                    }
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...products
                                            .filter(
                                                (pro) =>
                                                    productDetails.BrandID
                                                        ? isEqualNumber(pro.Brand, productDetails.BrandID)
                                                        : true
                                            )
                                            .reduce((acc, pro) => {
                                                if (
                                                    !acc.some((grp) => grp.value === pro.Product_Group)
                                                ) {
                                                    acc.push({
                                                        value: pro.Product_Group,
                                                        label: pro.Pro_Group,
                                                    });
                                                }
                                                return acc;
                                            }, []),
                                    ]}
                                    styles={customSelectStyles}
                                    menuPortalTarget={document.body}
                                    isSearchable={true}
                                    placeholder={"Select Group"}
                                    maxMenuHeight={200}
                                    filterOption={reactSelectFilterLogic}
                                />
                            </div>

                            {/* item name */}
                            <div className={
                                Object.hasOwn(productDetails, 'GoDown_Id') ? 'col-md-8 p-2' : "col-12 p-2"
                            }>
                                <label>Item Name <RequiredStar /></label>
                                <Select
                                    value={{
                                        value: productDetails.Item_Id,
                                        label: (
                                            findProductDetails(productDetails.Item_Id)?.Product_Name
                                        )
                                    }}
                                    isDisabled={checkIsNumber(productDetails.Pre_Id)}
                                    menuPortalTarget={document.body}
                                    onChange={e => {
                                        const productInfo = findProductDetails(e.value);
                                        setProductDetails(pre => ({
                                            ...pre,

                                            Group: productInfo.Pro_Group ?? pre.Group,
                                            GroupID: productInfo.Product_Group ?? pre.GroupID,
                                            Brand: productInfo.Brand_Name ?? pre.Brand,
                                            BrandID: productInfo.Brand ?? pre.BrandID,

                                            Item_Id: e.value,
                                            Item_Rate: productInfo.Item_Rate ?? 0,
                                            GoDown_Id: '',
                                            Bill_Qty: 0,
                                            Amount: 0,
                                            Unit_Id: productInfo.UOM_Id ?? pre.Unit_Id,
                                            Unit_Name: productInfo.Units ?? pre.Unit_Name,
                                            HSN_Code: productInfo?.HSN_Code
                                        }));
                                    }}
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        ...[
                                            ...products
                                                .filter(pro => productDetails.BrandID ? isEqualNumber(pro.Brand, productDetails.BrandID) : true)
                                                .filter(pro => productDetails.GroupID ? isEqualNumber(pro.Product_Group, productDetails.GroupID) : true)
                                        ].map(obj => ({
                                            value: obj?.Product_Id,
                                            label: obj?.Product_Name,
                                            isDisabled: (
                                                orderProducts.findIndex(ind => isEqualNumber(
                                                    ind?.Item_Id, obj?.Product_Id
                                                ))
                                            ) === -1 ? false : true
                                        }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Product"}
                                    maxMenuHeight={200}
                                    filterOption={reactSelectFilterLogic}
                                />
                            </div>

                            {/* godown  */}
                            {Object.hasOwn(productDetails, 'GoDown_Id') && (
                                <div className="col-md-4 p-2">
                                    <label>Godown</label>
                                    <Select
                                        value={{
                                            value: productDetails?.GoDown_Id,
                                            label: godowns.find(g => isEqualNumber(g.Godown_Id, productDetails?.GoDown_Id))?.Godown_Name || ''
                                        }}
                                        onChange={(e) => setProductDetails(pre => ({ ...pre, GoDown_Id: e.value }))}
                                        options={[
                                            { value: '', label: 'select', isDisabled: true },
                                            ...toArray(godowns).map(obj => ({
                                                value: obj?.Godown_Id,
                                                label: `${obj?.Godown_Name}${checkIsNumber(obj?.Godown_Id)
                                                    ? ` (Bal: ${validStockValue(
                                                        productDetails.Item_Id,
                                                        obj?.Godown_Id,
                                                        stockInGodowns
                                                    )})`
                                                    : ''
                                                    }`

                                            }))
                                        ]}
                                        styles={customSelectStyles}
                                        isDisabled={!checkIsNumber(productDetails?.Item_Id)}
                                        menuPortalTarget={document.body}
                                        isSearchable={true}
                                        placeholder={"Select Godown"}
                                        filterOption={reactSelectFilterLogic}
                                    // maxMenuHeight={200}  
                                    />
                                </div>
                            )}

                            {/* quantity */}
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Quantity <RequiredStar /></label>
                                <input
                                    required
                                    value={productDetails.Bill_Qty ? productDetails.Bill_Qty : ''}
                                    onInput={onlynum}
                                    disabled={!checkIsNumber(productDetails.Item_Id)}
                                    onChange={e => {
                                        if (productDetails.Item_Rate) {
                                            setProductDetails(pre => ({
                                                ...pre,
                                                Amount: Multiplication(productDetails.Item_Rate, e.target.value),
                                                Bill_Qty: e.target.value,
                                            }))
                                        } else if (productDetails.Amount) {
                                            setProductDetails(pre => ({
                                                ...pre,
                                                Item_Rate: Division(pre.Amount, e.target.value),
                                                Bill_Qty: e.target.value,
                                            }))
                                        } else {
                                            setProductDetails(pre => ({
                                                ...pre,
                                                Bill_Qty: e.target.value,
                                            }));
                                        }
                                    }}
                                    className="cus-inpt"
                                    min={1}
                                />
                            </div>

                            {Object.hasOwn(productDetails, 'Act_Qty') && (
                                <div className="col-lg-4 col-md-6 p-2">
                                    <label>Actual Quantity </label>
                                    <input
                                        value={productDetails.Act_Qty ? productDetails.Act_Qty : ''}
                                        onInput={onlynum}
                                        disabled={!checkIsNumber(productDetails.Item_Id)}
                                        onChange={e => setProductDetails(pre => ({
                                            ...pre,
                                            Act_Qty: e.target.value,
                                        }))}
                                        required
                                        className="cus-inpt"
                                    />
                                </div>
                            )}

                            {/* display only alter actual quantity */}
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Alt Act Quantity</label>
                                <input
                                    value={altActQty}
                                    className="cus-inpt"
                                    readOnly={true}
                                />
                            </div>

                            {/* Rate */}
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Rate </label>
                                <input
                                    value={productDetails.Item_Rate ? productDetails.Item_Rate : ''}
                                    onInput={onlynum}
                                    disabled={!checkIsNumber(productDetails.Item_Id)}
                                    onChange={e => setProductDetails(pre => ({
                                        ...pre,
                                        Item_Rate: e.target.value,
                                        Amount: pre.Bill_Qty ? Multiplication(e.target.value, pre.Bill_Qty) : pre.Amount
                                    }))}
                                    required
                                    className="cus-inpt"
                                />
                            </div>

                            {/* UOM */}
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>UOM</label>
                                <select
                                    value={
                                        Object.hasOwn(productDetails, 'UOM') ? productDetails.UOM :
                                            Object.hasOwn(productDetails, 'Unit_Id') ? productDetails.Unit_Id : ''
                                    }
                                    onChange={e => {
                                        const selectedIndex = e.target.selectedIndex;
                                        const label = e.target.options[selectedIndex].text;
                                        const value = e.target.value;
                                        setProductDetails(pre => ({
                                            ...pre,
                                            UOM: value,
                                            Unit_Id: value,
                                            Units: label,
                                            Unit_Name: label,
                                        }));
                                    }}
                                    className="cus-inpt"
                                    disabled={!checkIsNumber(productDetails.Item_Id)}
                                >
                                    <option value="" disabled>select</option>
                                    {uom.map((o, i) => (
                                        <option value={o.Unit_Id} key={i} >{o.Units}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Amount</label>
                                <input
                                    required
                                    value={productDetails.Amount ? productDetails.Amount : ''}
                                    onInput={onlynum}
                                    disabled={!checkIsNumber(productDetails.Item_Id)}
                                    onChange={e => setProductDetails(pre => ({
                                        ...pre,
                                        Amount: e.target.value,
                                        Item_Rate: pre.Bill_Qty ? Division(e.target.value, pre.Bill_Qty) : pre.Item_Rate
                                    }))}
                                    className="cus-inpt"
                                    min={1}
                                />
                            </div>

                            {/* Batch */}
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Batch</label>
                                <Select
                                    value={{
                                        value: productDetails?.Batch_Name || '',
                                        label: productDetails?.Batch_Name || ''
                                    }}
                                    onChange={e => setProductDetails(pre => ({ ...pre, Batch_Name: e.value }))}
                                    options={
                                        batchDetails.filter(
                                            bat => (
                                                isEqualNumber(bat.item_id, productDetails?.Item_Id)
                                                && isEqualNumber(bat?.godown_id, productDetails?.GoDown_Id)
                                                && toNumber(bat.pendingQuantity) >= toNumber(productDetails?.Bill_Qty)
                                            )
                                        ).map(
                                            bat => ({ value: bat.batch, label: bat.batch })
                                        )
                                    }
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Batch"}
                                    menuPortalTarget={document.body}
                                    isDisabled={true}
                                // isDisabled={
                                //     !checkIsNumber(productDetails?.Item_Id)
                                //     || !checkIsNumber(productDetails?.GoDown_Id)
                                //     || isEqualNumber(productDetails?.Bill_Qty, 0)
                                // }
                                />
                            </div>

                        </div>

                    </DialogContent>
                    <DialogActions className="d-flex justify-content-between align-items-center">
                        <Button onClick={() => setProductDetails(initialValue)} type='button' startIcon={<ClearAll />}>Clear</Button>
                        <span>
                            <Button type="button" onClick={closeDialog}>cancel</Button>
                            <Button type='submit' variant="outlined">Add</Button>
                        </span>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}

export default AddProductForm;