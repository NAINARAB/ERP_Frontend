import React, { useState, useEffect } from "react";
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from "@mui/material";
import { toast } from 'react-toastify';
import { fetchLink } from '../../../Components/fetchComponent';
import { isValidObject, onlynum } from "../../../Components/functions";
import RequiredStar from "../../../Components/requiredStar";

const initialInputValue = {
    Product_Id: '',
    Product_Name: '',
    Short_Name: '',
    Product_Description: '',
    Brand: '',
    Product_Group: '',
    Pack_Id: '',
    UOM_Id: '',
    IS_Sold: '',
    Display_Order_By: '',
    HSN_Code: '',
    Gst_P: '',
    Cgst_P: '',
    Sgst_P: '',
    Igst_P: '',
    ERP_Id: '',
    Pos_Brand_Id:'',
    IsActive:'',
    Product_Rate:'',
    Max_Rate:'',
    Coolie:'',
    Packing_CH:'',
    Other_Expen:''

}

const ProductAddEditComp = ({ row, children, openAction, reload, onCloseFun, loadingOn, loadingOff }) => {
    const [uom, setUom] = useState([]);
    const [brand, setBrand] = useState([]);
    const [pack, setPack] = useState([]);
    const [productGroups, setProductGroups] = useState([]);
    const [productInputValue, setProductInputValue] = useState(initialInputValue);
    const [dialog, setDialog] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [posbrand, setPosBrand] = useState([]);
    useEffect(() => setDialog(openAction ? true : false), [openAction]);

    useEffect(() => {
        if (isValidObject(row)) {
            setProductInputValue(pre => {
                let inputVAL = { ...pre }
                Object.entries(row).forEach(([key, value]) => {
                    inputVAL[key] = value ?? ''
                })
                return inputVAL
            });
            setIsEdit(true);
            setDialog(true);
        } else {
            setProductInputValue(initialInputValue);
            setIsEdit(false);
        }
    }, [row])

    useEffect(() => {

        fetchLink({
            address: `masters/uom`
        }).then(data => {
            if (data.success) {
                setUom(data.data)
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/brand`
        }).then(data => {
            if (data.success) {
                setBrand(data.data)
            }
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/products/packs`
        }).then(data => {
            if (data.success) {
                setPack(data.data)
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/products/productGroups`
        }).then(data => {
            if (data.success) {
                setProductGroups(data.data)
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/posbranch/dropdown`
        }).then(data => {
            if (data.success) {
                setPosBrand(data.data)
            }
        }).catch(e => console.error(e))

    }, [])

    const inputFields = [
        {
            label: 'Product Name',
            elem: 'input',
            placeholder: "Enter Product Name",
            event: e => setProductInputValue(value => ({ ...value, Product_Name: e.target.value })),
            required: true,
            value: productInputValue.Product_Name,
            max: 100,
        },
        {
            label: 'Short Name',
            elem: 'input',
            placeholder: "Enter Short Name",
            event: e => setProductInputValue(value => ({ ...value, Short_Name: e.target.value })),
            value: productInputValue.Short_Name,
            max: 100,
        },
        {
            label: 'Is Saleable',
            elem: 'select',
            options: [
                { value: '', label: ' - Select - ', disabled: true, selected: true },
                { value: 0, label: 'Not Salable' },
                { value: 1, label: 'Salable' },
            ],
            event: e => setProductInputValue(value => ({ ...value, IS_Sold: e.target.value })),
            value: productInputValue.IS_Sold,
        },
        {
            label: 'Brand',
            elem: 'select',
            options: [
                { value: '', label: ' - Select - ', disabled: true, selected: true },
                ...brand.map(obj => ({
                    value: Number(obj.Brand_Id),
                    label: obj.Brand_Name
                }))
            ],
            event: e => setProductInputValue(value => ({ ...value, Brand: e.target.value })),
            value: productInputValue.Brand,
        },
        {
            label: 'Product Group',
            elem: 'select',
            options: [
                { value: '', label: ' - Select - ', disabled: true, selected: true },
                ...productGroups.map(obj => ({
                    value: Number(obj.Pro_Group_Id),
                    label: obj.Pro_Group
                }))
            ],
            event: e => setProductInputValue(value => ({ ...value, Product_Group: e.target.value })),
            value: productInputValue.Product_Group,
        },
        {
            label: 'Pack',
            elem: 'select',
            options: [
                { value: '', label: ' - Select - ', disabled: true, selected: true },
                ...pack.map(obj => ({
                    value: Number(obj.Pack_Id),
                    label: obj.Pack
                }))
            ],
            event: e => setProductInputValue(value => ({ ...value, Pack_Id: e.target.value })),
            value: productInputValue.Pack_Id,
        },
        {
            label: 'Unit Of Measurement',
            elem: 'select',
            options: [
                { value: '', label: ' - Select - ', disabled: true, selected: true },
                ...uom.map(obj => ({
                    value: Number(obj.Unit_Id),
                    label: obj.Units
                }))
            ],
            event: e => setProductInputValue(value => ({ ...value, UOM_Id: e.target.value })),
            value: productInputValue.UOM_Id,
        },
        {
            label: 'HSN / SAC Code',
            elem: 'input',
            placeholder: "Enter HSN / SAC",
            event: e => setProductInputValue(value => ({ ...value, HSN_Code: e.target.value })),
            required: true,
            value: productInputValue.HSN_Code,
        },
        {
            label: 'GST Percentage (%)',
            elem: 'input',
            oninput: e => onlynum(e),
            placeholder: "Enter GST Percentage",
            event: e => setProductInputValue(value => ({ ...value, Gst_P: e.target.value })),
            required: true,
            value: productInputValue.Gst_P,
        },
        {
            label: 'Order By',
            elem: 'input',
            oninput: e => onlynum(e),
            placeholder: "Enter list order number",
            event: e => setProductInputValue(value => ({ ...value, Display_Order_By: e.target.value })),
            value: productInputValue.Display_Order_By,
        },
        {
            label: 'ERP ID',
            elem: 'input',
            placeholder: "Enter ERP ID",
            event: e => setProductInputValue(value => ({ ...value, ERP_Id: e.target.value })),
            value: productInputValue.ERP_Id,
        },
        {
            label: 'POS BRAND',
            elem: 'select',
            options: [
                { value: '', label: ' - Select - ', disabled: true, selected: true },
                ...posbrand.map(obj => ({
                    value: Number(obj.value),
                    label: obj.label
                }))
            ],
            event: e => setProductInputValue(value => ({ ...value, Pos_Brand_Id: e.target.value })),
            value: productInputValue.Pos_Brand_Id,
        },
        {
            label: 'Status',
            elem: 'select',
            options: [
                { value: '', label: ' - Select - ', disabled: true },
                { value: '1', label: 'Active' },
                { value: '0', label: 'Inactive' }
            ],
            event: e => setProductInputValue(value => ({ ...value, IsActive: e.target.value })),
            value: productInputValue.IsActive , 
        },
        
        
    
        {
            label: 'Product Rate',
            elem: 'input',
            // oninput: e => onlynum(e),
            placeholder: "Enter Price",
            event: e => setProductInputValue(value => ({ ...value, Product_Rate: e.target.value })),
         
            value: productInputValue.Product_Rate,
        },
        {
            label: 'Max Rate',
            elem: 'input',
            // oninput: e => onlynum(e),
            placeholder: "Enter Max_Rate",
            event: e => setProductInputValue(value => ({ ...value, Max_Rate: e.target.value })),
         
            value: productInputValue.Max_Rate,
        },
          {
            label: 'Coolie',
            elem: 'input',
            oninput: e => onlynum(e),
            placeholder: "Enter Coolie",
            event: e => setProductInputValue(value => ({ ...value, Coolie: e.target.value })),
         
            value: productInputValue.Coolie,
        },
          {
            label: 'Packing',
            elem: 'input',
            oninput: e => onlynum(e),
            placeholder: "Enter Packing Ch",
            event: e => setProductInputValue(value => ({ ...value, Packing_CH: e.target.value })),
         
            value: productInputValue.Packing_CH,
        },
          {
            label: 'Other Exp',
            elem: 'input',
            oninput: e => onlynum(e),
            placeholder: "Enter Other Expen",
            event: e => setProductInputValue(value => ({ ...value, Other_Expen: e.target.value })),
         
            value: productInputValue.Other_Expen,
        },

        {
            label: 'Product Description',
            elem: 'textarea',
            event: e => setProductInputValue(value => ({ ...value, Product_Description: e.target.value })),
            value: productInputValue.Product_Description,
        },
    ]

    const closeDialog = () => {
        setProductInputValue(initialInputValue);
        setDialog(false);
        setIsEdit(false);
        if (onCloseFun) {
            onCloseFun();
        }
    }

    const postProduct = () => {
        if (loadingOn) {
            loadingOn();
        }

        fetchLink({
            address: `masters/products`,
            method: isEdit ? 'PUT' : 'POST',
            bodyData: productInputValue
        }).then(data => {
            if (data.success) {
                if (reload) {
                    reload();
                }
                closeDialog();
                toast.success(data.message);
            } else {
                toast.error(data.message)
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) {
                loadingOff();
            }
        })
    }

    return (
        <>
            <span onClick={() => setDialog(true)} style={{ cursor: 'pointer' }}>{children}</span>

            <Dialog
                open={dialog}
                onClose={closeDialog}
                fullScreen
            >
                <DialogTitle>
                    {isEdit ? 'Update Product Details' : 'Create New Product'}
                </DialogTitle>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        postProduct();
                    }}
                >
                    <DialogContent>
                        <div className="row">
                            {inputFields.map((field, index) => (
                                <div key={index} className="col-lg-4 col-md-6 p-2 px-3">
                                    <label>{field.label} {field.required && <RequiredStar />}</label>
                                    {field.elem === 'input' ? (
                                        <input
                                            type={field.type || 'text'}
                                            className='cus-inpt b-0'
                                            onChange={field.event}
                                            onInput={field.oninput}
                                            disabled={field.disabled}
                                            value={field.value}
                                            maxLength={field.max}
                                            required={field.required ? true : false}
                                        />
                                    ) : field.elem === 'select' ? (
                                        <select
                                            className={'cus-inpt b-0'}
                                            onChange={field.event}
                                            value={field.value}
                                            required={field.required ? true : false}
                                        >
                                            {field.options.map((option, optionIndex) => (
                                                <option
                                                    key={optionIndex}
                                                    value={option.value}
                                                    disabled={option.disabled}
                                                    defaultValue={option.selected} 
                                                >
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.elem === 'textarea' ? (
                                        <textarea
                                            className='cus-inpt b-0'
                                            onChange={field.event}
                                            rows={4} value={field.value} 
                                        />
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button type="button" onClick={closeDialog}>cancel</Button>
                        <Button type="submit">save</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </>
    )
}


export default ProductAddEditComp;