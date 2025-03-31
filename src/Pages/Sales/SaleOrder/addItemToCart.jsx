import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Division, isEqualNumber, isValidObject, Multiplication, onlynum, RoundNumber } from "../../../Components/functions";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { saleOrderStockInfo } from "./column";
import { ClearAll } from "@mui/icons-material";
import RequiredStar from "../../../Components/requiredStar";
import { calculateGSTDetails } from "../../../Components/taxCalculator";
import { toast } from "react-toastify";
import Select from "react-select";

const AddItemToSaleOrderCart = ({
    children,
    orderProducts = [],
    setOrderProducts,
    open = false,
    onClose,
    products = [],
    brands = [],
    uom = [],
    GST_Inclusive,
    IS_IGST,
    editValues = null
}) => {

    const [productDetails, setProductDetails] = useState(saleOrderStockInfo);

    const isInclusive = isEqualNumber(GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(GST_Inclusive, 2);

    const findProductDetails = (productid) => products?.find(obj => isEqualNumber(obj?.Product_Id, productid)) ?? {};

    const handleProductInputChange = () => {

        setOrderProducts(pre => {
            const existingProducts = pre.filter(ordered => !isEqualNumber(ordered.Item_Id, productDetails.Item_Id));

            const currentProductDetails = Object.fromEntries(
                Object.entries(saleOrderStockInfo).map(([key, value]) => {
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

        setProductDetails(saleOrderStockInfo);
        onClose();
    };

    useEffect(() => {
        if (isValidObject(editValues) && open) {
            setProductDetails(pre => (
                Object.fromEntries(
                    Object.entries(pre).map(([key, value]) => [key, editValues[key] ? editValues[key] : value])
                )
            ))
        }
    }, [editValues])

    return (
        <>
            {children}

            <Dialog
                open={open}
                onClose={onClose}
                maxWidth='sm' fullWidth
            >
                <DialogTitle className="border-bottom">
                    <span>Add Products Details</span>
                </DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();
                    if (productDetails.Item_Id) {
                        handleProductInputChange();
                    } else {
                        toast.warn('Select Product');
                    }
                }}>
                    <DialogContent>
                        <div className="row pb-5">

                            <div className="col-6 p-2">
                                <label>Brand</label>
                                <Select
                                    value={{ value: productDetails.BrandID, label: productDetails.Brand }}
                                    onChange={(e) => setProductDetails(pre => ({ ...pre, BrandID: e.value, Brand: e.label }))}
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        brands.map(obj => ({ value: obj?.Brand, label: obj?.Brand_Name }))
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    placeholder={"Select Brand"}
                                    maxMenuHeight={200}
                                />
                            </div>

                            <div className="col-6 p-2">
                                <label>Group</label>
                                <Select
                                    value={{ value: productDetails.GroupID, label: productDetails.Group }}
                                    onChange={(e) =>
                                        setProductDetails((pre) => ({ ...pre, GroupID: e.value, Group: e.label }))
                                    }
                                    options={[
                                        { value: '', label: 'select', isDisabled: true },
                                        products
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
                                    isSearchable={true}
                                    placeholder={"Select Group"}
                                    maxMenuHeight={200}
                                />
                            </div>

                            <div className="col-12 p-2">
                                <label>Item Name <RequiredStar /></label>
                                <Select
                                    value={{
                                        value: productDetails.Item_Id,
                                        label: findProductDetails(productDetails.Item_Id)?.Product_Name
                                    }}
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
                                    required
                                    placeholder={"Select Product"}
                                    maxMenuHeight={200}
                                />
                            </div>

                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Quantity <RequiredStar /></label>
                                <input
                                    required
                                    value={productDetails.Bill_Qty ? productDetails.Bill_Qty : ''}
                                    onInput={onlynum}
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

                            <div className="col-lg-4 col-md-6 p-2">
                                <label>Rate </label>
                                <input
                                    value={productDetails.Item_Rate ? productDetails.Item_Rate : ''}
                                    onInput={onlynum}
                                    onChange={e => setProductDetails(pre => ({
                                        ...pre,
                                        Item_Rate: e.target.value,
                                        Amount: pre.Bill_Qty ? Multiplication(e.target.value, pre.Bill_Qty) : pre.Amount
                                    }))}
                                    required
                                    className="cus-inpt"
                                />
                            </div>

                            <div className="col-lg-4 col-md-6 p-2">
                                <label>UOM</label>
                                <select
                                    value={productDetails.UOM}
                                    onChange={e => {
                                        const selectedIndex = e.target.selectedIndex;
                                        const label = e.target.options[selectedIndex].text;
                                        const value = e.target.value;
                                        setProductDetails(pre => ({ ...pre, UOM: value, Units: label }));
                                    }}
                                    className="cus-inpt"
                                >
                                    <option value="" disabled>select</option>
                                    {uom.map((o, i) => (
                                        <option value={o.Unit_Id} key={i} >{o.Units}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-md-6 p-2">
                                <label>Amount</label>
                                <input
                                    required
                                    value={productDetails.Amount ? productDetails.Amount : ''}
                                    onInput={onlynum}
                                    onChange={e => setProductDetails(pre => ({
                                        ...pre,
                                        Amount: e.target.value,
                                        Item_Rate: pre.Bill_Qty ? Division(e.target.value, pre.Bill_Qty) : pre.Item_Rate
                                    }))}
                                    className="cus-inpt"
                                    min={1}
                                />
                            </div>

                        </div>

                    </DialogContent>
                    <DialogActions className="d-flex justify-content-between align-items-center">
                        <Button onClick={() => setProductDetails(saleOrderStockInfo)} type='button' startIcon={<ClearAll />}>Clear</Button>
                        <span>
                            <Button type="button" onClick={onClose}>cancel</Button>
                            <Button type='submit' variant="outlined">Add</Button>
                        </span>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}

export default AddItemToSaleOrderCart;