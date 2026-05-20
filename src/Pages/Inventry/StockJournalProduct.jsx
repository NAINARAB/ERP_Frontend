import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { checkIsNumber, Division, isEqualNumber, isValidNumber, isValidObject, Multiplication, toArray, toNumber } from "../../Components/functions";
import { ClearAll } from "@mui/icons-material";
import RequiredStar from "../../Components/requiredStar";
import { calculateGSTDetails } from "../../Components/taxCalculator";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import { toast } from "react-toastify";
import { fetchLink } from "../../Components/fetchComponent";

const validStockValue = (Item_Id, Godown_Id, stockInGodown) => {
    const godownStockValue = toArray(stockInGodown).find(
        godownItem => (
            isEqualNumber(godownItem?.Product_Id, Item_Id) &&
            isEqualNumber(godownItem?.Godown_Id, Godown_Id)
        )
    )?.Act_Bal_Qty;

    return toNumber(godownStockValue);
};

const StockJournalProduct = ({
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
}) => {

    const [productDetails, setProductDetails] = useState(initialValue);

    const isInclusive = isEqualNumber(GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(GST_Inclusive, 2);

    const [stockInGodowns, setStockInGodowns] = useState([]);

    const lastEditedRef = useRef(null);

    const findProductDetails = (productid) => products?.find(obj => isEqualNumber(obj?.Product_Id, productid)) ?? {};

    useEffect(() => {
        if (isValidObject(editValues) && open) {
            setProductDetails(prev => {
                const updatedDetails = { ...prev };
                
                const fieldMappings = {
                    Item_Id: ['Item_Id', 'itemId', 'productId', 'Product_Id', 'name_item_id'],
                    Item_Name: ['Item_Name', 'itemName', 'Product_Name', 'productName'],
                    Act_Qty: ['Act_Qty', 'act_qty', 'actQty', 'actualQuantity'],
                    Bill_Qty: ['Bill_Qty', 'bill_qty', 'billQty', 'quantity'],
                    Alt_Act_Qty: ['Alt_Act_Qty', 'alt_act_qty', 'altActQty'],
                    Alt_Bill_Qty: ['Alt_Bill_Qty', 'alt_bill_qty', 'altBillQty'],
                    Item_Rate: ['Item_Rate', 'itemRate', 'rate'],
                    Amount: ['Amount', 'amount'],
                    Adj_Payment: ['Adj_Payment', 'adjPayment', 'adjustmentPayment'],
                    GoDown_Id: ['GoDown_Id', 'godownId', 'Godown_Id', 'godown_id'],
                    BrandID: ['BrandID', 'brandId'],
                    Brand: ['Brand', 'brand'],
                    GroupID: ['GroupID', 'groupId'],
                    Group: ['Group', 'group'],
                    Unit_Id: ['Unit_Id', 'unitId'],
                    Unit_Name: ['Unit_Name', 'unitName'],
                    rowId: ['rowId', 'row_id', 'id'],
                };
                
                Object.entries(fieldMappings).forEach(([targetField, sourceFields]) => {
                    for (const sourceField of sourceFields) {
                        if (editValues[sourceField] !== undefined && editValues[sourceField] !== null) {
                            updatedDetails[targetField] = editValues[sourceField];
                            break;
                        }
                    }
                });
                
                Object.keys(editValues).forEach(key => {
                    if (!updatedDetails.hasOwnProperty(key) && 
                        !Object.values(fieldMappings).flat().includes(key)) {
                        updatedDetails[key] = editValues[key];
                    }
                });
                
                if (updatedDetails.Act_Qty !== undefined) updatedDetails.Act_Qty = Number(updatedDetails.Act_Qty);
                if (updatedDetails.Bill_Qty !== undefined) updatedDetails.Bill_Qty = Number(updatedDetails.Bill_Qty);
                if (updatedDetails.Item_Rate !== undefined) updatedDetails.Item_Rate = Number(updatedDetails.Item_Rate);
                if (updatedDetails.Amount !== undefined) updatedDetails.Amount = Number(updatedDetails.Amount);
                if (updatedDetails.Adj_Payment !== undefined) updatedDetails.Adj_Payment = Number(updatedDetails.Adj_Payment);
                
                const productInfo = findProductDetails(updatedDetails.Item_Id);
                const pack = productInfo?.PackGet || 1;
                
                if (updatedDetails.Act_Qty !== undefined && updatedDetails.Act_Qty !== null) {
                    updatedDetails.Alt_Act_Qty = Division(updatedDetails.Act_Qty, pack);
                }
                if (updatedDetails.Bill_Qty !== undefined && updatedDetails.Bill_Qty !== null) {
                    updatedDetails.Alt_Bill_Qty = Division(updatedDetails.Bill_Qty, pack);
                }
                
                return updatedDetails;
            });
        }
    }, [editValues, open, products]);

    const closeDialog = () => {
        setProductDetails(initialValue);
        onClose();
    }

    const handleProductInputChange = (shouldClose = true) => {
        setOrderProducts(pre => {
            // Check if this is an edit operation (product has a rowId that exists in the current list)
            const isEdit = isValidNumber(productDetails.rowId) && 
                          pre.some(p => p.rowId === productDetails.rowId);
            
            const currentProductDetails = Object.fromEntries(
                Object.entries(productDetails).map(([key, value]) => {
                    const productMaster = findProductDetails(productDetails.Item_Id);
                    const gstPercentage = IS_IGST ? productMaster.Igst_P : productMaster.Gst_P;
                    const isTaxable = gstPercentage > 0;

                    const godownStock = validStockValue(productDetails.Item_Id, productDetails.GoDown_Id, stockInGodowns);

                    const { Bill_Qty, Item_Rate, Amount } = productDetails;

                    const taxType = isNotTaxableBill ? 'zerotax' : isInclusive ? 'remove' : 'add';
                    const itemRateGst = calculateGSTDetails(Item_Rate, gstPercentage, taxType);
                    const gstInfo = calculateGSTDetails(Amount, gstPercentage, taxType);

                    const cgstPer = !IS_IGST ? gstInfo.cgst_per : 0;
                    const igstPer = IS_IGST ? gstInfo.igst_per : 0;
                    const Cgst_Amo = !IS_IGST ? gstInfo.cgst_amount : 0;
                    const Igst_Amo = IS_IGST ? gstInfo.igst_amount : 0;

                    switch (key) {
                        case 'Item_Name':      return [key, productMaster.Product_Name];
                        case 'Taxable_Rate':   return [key, itemRateGst.base_amount];
                        case 'Total_Qty':      return [key, Bill_Qty];
                        case 'Taxble':         return [key, isTaxable ? 1 : 0];
                        case 'Taxable_Amount': return [key, gstInfo.base_amount];
                        case 'Tax_Rate':       return [key, gstPercentage];
                        case 'Cgst':
                        case 'Sgst':           return [key, cgstPer ?? 0];
                        case 'Cgst_Amo':
                        case 'Sgst_Amo':       return [key, isNotTaxableBill ? 0 : Cgst_Amo];
                        case 'Igst':           return [key, igstPer ?? 0];
                        case 'Igst_Amo':       return [key, isNotTaxableBill ? 0 : Igst_Amo];
                        case 'Final_Amo':      return [key, gstInfo.with_tax];
                        case 'Godown_Stock':   return [key, godownStock];
                        case 'GoDown_Id':      return [key, productDetails.GoDown_Id ?? 0];
                        case 'Adj_Payment':    return [key, productDetails.Adj_Payment || 0];
                        default:               return [key, productDetails[key] ?? value];
                    }
                })
            );

            if (isEdit) {
                // Update existing product
                return pre.map(item => 
                    item.rowId === productDetails.rowId ? currentProductDetails : item
                );
            } else {
                // Add new product (ensure it doesn't already exist)
                const existingIndex = pre.findIndex(p => 
                    isEqualNumber(p.Item_Id, currentProductDetails.Item_Id) && 
                    !isValidNumber(p.rowId) // Only check for non-edited items
                );
                
                if (existingIndex !== -1 && !isValidNumber(pre[existingIndex].rowId)) {
                    // Replace the existing placeholder or duplicate
                    const updated = [...pre];
                    updated[existingIndex] = currentProductDetails;
                    return updated;
                }
                
                return [...pre, currentProductDetails];
            }
        });

        if (shouldClose) {
            closeDialog();
        } else {
            setProductDetails(initialValue);
        }
    };

    const handleFormSubmit = (e, shouldClose) => {
        e.preventDefault();

        if (!isValidNumber(productDetails.Item_Id)) {
            toast.warn('Select Product');
            return;
        }

        if (Object.hasOwn(productDetails, 'GoDown_Id') && !isValidNumber(productDetails.GoDown_Id)) {
            setProductDetails(prev => ({ ...prev, GoDown_Id: 0 }));
        }

        handleProductInputChange(shouldClose);
    };

    useEffect(() => {
        setStockInGodowns([]);
        if (checkIsNumber(productDetails.Item_Id) && !isEqualNumber(productDetails.Item_Id, 0)) {
            fetchLink({ address: `sales/stockInGodown?Item_Id=${productDetails.Item_Id}` })
                .then(data => {
                    const stockInGodowns = (data.success ? data.data : []).sort(
                        (a, b) => toNumber(b?.Act_Bal_Qty) - toNumber(a?.Act_Bal_Qty)
                    );
                    setStockInGodowns(stockInGodowns);
                })
        }
    }, [productDetails.Item_Id])

    const productInfo = useMemo(() => {
        const currentProduct = findProductDetails(productDetails.Item_Id);
        return productDetails.Item_Id ? currentProduct : {};
    }, [products, productDetails.Item_Id]);

    const onRateChange = (value) => {
        lastEditedRef.current = 'RATE';
        setProductDetails(prev => ({ ...prev, Item_Rate: value }));
    };

    const onAmountChange = (value) => {
        lastEditedRef.current = 'AMOUNT';
        setProductDetails(prev => ({ ...prev, Amount: value }));
    };

    useEffect(() => {
        const { Item_Rate, Amount, Bill_Qty } = productDetails;

        if (!isValidNumber(Bill_Qty) || Bill_Qty === 0) return;

        if ((lastEditedRef.current === 'RATE' || lastEditedRef.current === 'QTY') && isValidNumber(Item_Rate)) {
            const amount = Multiplication(Item_Rate, Bill_Qty);
            setProductDetails(prev =>
                prev.Amount === amount
                    ? prev
                    : { ...prev, Amount: amount }
            );
        }

        if (lastEditedRef.current === 'AMOUNT' && isValidNumber(Amount)) {
            const rate = Division(Amount, Bill_Qty);
            setProductDetails(prev =>
                prev.Item_Rate === rate
                    ? prev
                    : { ...prev, Item_Rate: rate }
            );
        }
    }, [productDetails.Item_Rate, productDetails.Amount, productDetails.Bill_Qty]);

    const godownOptions = useMemo(() => {
        if (!checkIsNumber(productDetails.Item_Id)) return [];

        const productMaster = findProductDetails(productDetails.Item_Id);
        const pack = productMaster?.PackGet || 1;

        return toArray(godowns)
            .map(obj => {
                const stock = checkIsNumber(obj?.Godown_Id)
                    ? toNumber(
                        validStockValue(
                            productDetails.Item_Id,
                            obj?.Godown_Id,
                            stockInGodowns
                        )
                    )
                    : 0;

                const packQty = Division(stock, pack);

                return {
                    value: obj?.Godown_Id,
                    label: `${obj?.Godown_Name} (Q: ${stock}, P: ${packQty})`,
                    stock
                };
            })
            .sort((a, b) => {
                return b.stock - a.stock;
            })
            .map(({ stock, ...rest }) => rest);
    }, [godowns, productDetails.Item_Id, stockInGodowns, products]);

    return (
        <>
            {children}

            <Dialog
                open={open}
                onClose={closeDialog}
                maxWidth='md' fullWidth
            >
                <DialogTitle className="border-bottom">
                    <span>{editValues ? "Edit" : "Add"} Products Details</span>
                </DialogTitle>
                <form onSubmit={e => handleFormSubmit(e, true)}>
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
                                    isDisabled={checkIsNumber(productDetails.Pre_Id) || isValidNumber(productDetails.rowId)}
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
                                            Alt_Bill_Qty: 0,
                                            Act_Qty: 0,
                                            Alt_Act_Qty: 0,
                                            Amount: 0,
                                            Adj_Payment: 0, 
                                            Unit_Id: productInfo.UOM_Id ?? pre.Unit_Id,
                                            Unit_Name: productInfo.Units ?? pre.Unit_Name,
                                            HSN_Code: productInfo?.HSN_Code,
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
                                            isDisabled: isValidNumber(productDetails.rowId) 
                                                ? false // Allow same product when editing
                                                : orderProducts.findIndex(ind => isEqualNumber(
                                                    ind?.Item_Id, obj?.Product_Id
                                                )) === -1 ? false : true
                                        }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Product"}
                                    maxMenuHeight={200}
                                />
                            </div>

                            {/* act qty - Allow negative values */}
                            <div className="col-md-6 p-2">
                                <label>Actual Quantity </label>
                                <input
                                    value={productDetails.Act_Qty !== undefined && productDetails.Act_Qty !== null ? productDetails.Act_Qty : ''}
                                    disabled={!checkIsNumber(productDetails.Item_Id)}
                                    onChange={e => {
                                        lastEditedRef.current = 'QTY';
                                        const pack = productInfo?.PackGet;
                                        const alterQuantity = Division(e.target.value, pack);
                                        setProductDetails(pre => ({
                                            ...pre,
                                            Act_Qty: e.target.value,
                                            Bill_Qty: e.target.value,
                                            Alt_Act_Qty: alterQuantity,
                                            Alt_Bill_Qty: alterQuantity
                                        }))
                                    }}
                                    required
                                    className="cus-inpt"
                                    type="number"
                                    step="any"
                                />
                            </div>

                            {/* alter actual quantity - Allow negative values */}
                            <div className="col-md-6 p-2">
                                <label>Alt Act Quantity</label>
                                <input
                                    value={productDetails.Alt_Act_Qty !== undefined && productDetails.Alt_Act_Qty !== null ? productDetails.Alt_Act_Qty : ''}
                                    className="cus-inpt"
                                    type="number"
                                    step="any"
                                    onChange={e => {
                                        lastEditedRef.current = 'QTY';
                                        const pack = productInfo?.PackGet;
                                        const qty = Multiplication(e.target.value, pack)
                                        setProductDetails(pre => ({
                                            ...pre,
                                            Alt_Act_Qty: e.target.value,
                                            Alt_Bill_Qty: e.target.value,
                                            Act_Qty: qty,
                                            Bill_Qty: qty,
                                        }));
                                    }}
                                />
                            </div>

                            {/* bill quantity - Allow negative values */}
                            <div className="col-md-6 p-2">
                                <label>Bill Quantity <RequiredStar /></label>
                                <input
                                    required
                                    value={productDetails.Bill_Qty !== undefined && productDetails.Bill_Qty !== null ? productDetails.Bill_Qty : ''}
                                    disabled={!checkIsNumber(productDetails.Item_Id)}
                                    onChange={e => {
                                        lastEditedRef.current = 'QTY';
                                        const pack = productInfo?.PackGet;
                                        const alterQuantity = Division(e.target.value, pack);
                                        setProductDetails(pre => ({
                                            ...pre,
                                            Bill_Qty: e.target.value,
                                            Alt_Bill_Qty: alterQuantity,
                                        }));
                                    }}
                                    className="cus-inpt"
                                    type="number"
                                    step="any"
                                />
                            </div>

                            {/* alt bill qty - Allow negative values */}
                            <div className="col-md-6 p-2">
                                <label>Alt Bill Quantity</label>
                                <input
                                    value={productDetails.Alt_Bill_Qty !== undefined && productDetails.Alt_Bill_Qty !== null ? productDetails.Alt_Bill_Qty : ''}
                                    className="cus-inpt"
                                    type="number"
                                    step="any"
                                    onChange={e => {
                                        lastEditedRef.current = 'QTY';
                                        const pack = productInfo?.PackGet;
                                        setProductDetails(pre => ({
                                            ...pre,
                                            Alt_Bill_Qty: e.target.value,
                                            Bill_Qty: Multiplication(e.target.value, pack),
                                        }));
                                    }}
                                />
                            </div>

                            {/* Rate - Allow negative values */}
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Rate </label>
                                <input
                                    value={productDetails.Item_Rate !== undefined && productDetails.Item_Rate !== null ? productDetails.Item_Rate : ''}
                                    disabled={!checkIsNumber(productDetails.Item_Id)}
                                    onChange={e => onRateChange(e.target.value)}
                                    required
                                    className="cus-inpt"
                                    type="number"
                                    step="any"
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

                            {/* Amount - Allow negative values */}
                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Amount</label>
                                <input
                                    required
                                    value={productDetails.Amount !== undefined && productDetails.Amount !== null ? productDetails.Amount : ''}
                                    disabled={!checkIsNumber(productDetails.Item_Id)}
                                    onChange={e => onAmountChange(e.target.value)}
                                    className="cus-inpt"
                                    type="number"
                                    step="any"
                                />
                            </div>

                            {/* Adj Payment - Allow negative values */}
                            <div className="col-md-6 p-2">
                                <label>Adj Payment</label>
                                <input
                                    value={productDetails.Adj_Payment !== undefined && productDetails.Adj_Payment !== null ? productDetails.Adj_Payment : ''}
                                    disabled={!checkIsNumber(productDetails.Item_Id)} 
                                    onChange={e => {
                                        setProductDetails(pre => ({
                                            ...pre,
                                            Adj_Payment: e.target.value,
                                        }));
                                    }}
                                    className="cus-inpt"
                                    type="number"
                                    step="any"
                                />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions className="d-flex justify-content-between align-items-center">
                        <Button onClick={() => setProductDetails(initialValue)} type='button' startIcon={<ClearAll />}>Clear</Button>
                        <span>
                            <Button type="button" onClick={closeDialog}>Cancel</Button>
                            <Button type='button' onClick={e => handleFormSubmit(e, false)} variant="outlined" className="me-2">Next</Button>
                            <Button type='submit' variant="contained">{editValues ? "Update" : "Add"}</Button>
                        </span>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}

export default StockJournalProduct;