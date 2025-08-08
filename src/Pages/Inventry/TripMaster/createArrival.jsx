import { useEffect, useState } from "react";
import { fetchLink } from '../../../Components/fetchComponent';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import {
    checkIsNumber, isEqualNumber, ISOString, Multiplication, onlynum,
} from "../../../Components/functions";
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Close } from "@mui/icons-material";
import { initialArrivalValue } from './tableColumns'
import { toast } from 'react-toastify'
import RequiredStar from "../../../Components/requiredStar";

const CreateArrival = ({ loadingOn, loadingOff, children, productValue = {}, onSubmit, open = false, close = () => { } }) => {
    const tdStyle = 'border fa-14 vctr';
    const [godown, setGodown] = useState([]);
    const [products, setProducts] = useState([]);
    const [uom, setUom] = useState([]);
    const [productInput, setProductInput] = useState(initialArrivalValue);

    useEffect(() => {
        if (open) {
            const fetchData = async () => {
                try {
                    if (loadingOn) loadingOn();
                    const [
                        productsResponse,
                        godownLocationsResponse,
                        uomResponse
                    ] = await Promise.all([
                        fetchLink({ address: `masters/products/allProducts` }),
                        fetchLink({ address: `dataEntry/godownLocationMaster` }),
                        fetchLink({ address: `masters/uom` }),
                    ]);

                    const productsData = (productsResponse.success ? productsResponse.data : []).sort(
                        (a, b) => String(a?.Product_Name).localeCompare(b?.Product_Name)
                    );
                    const godownLocations = (godownLocationsResponse.success ? godownLocationsResponse.data : []).sort(
                        (a, b) => String(a?.Godown_Name).localeCompare(b?.Godown_Name)
                    );
                    const uomOrdered = (uomResponse.success ? uomResponse.data : []).sort(
                        (a, b) => String(a?.Units).localeCompare(b?.Units)
                    );

                    setProducts(productsData);
                    setGodown(godownLocations);
                    setUom(uomOrdered);

                } catch (e) {
                    console.error("Error fetching data:", e);
                } finally {
                    if (loadingOff) loadingOff();
                }
            };

            fetchData();
        }
    }, [open])

    useEffect(() => {
        if (checkIsNumber(productValue?.Arr_Id)) {
            setProductInput(pre => Object.fromEntries(
                Object.entries(pre).map(([key, value]) => {
                    if (key === 'Arrival_Date') return [key, productValue[key] ? ISOString(productValue[key]) : value]
                    return [key, productValue[key] ? productValue[key] : value]
                })
            ))
        }
    }, [productValue])

    const closeDialog = () => {
        if (close) close();
        setProductInput(initialArrivalValue)
    }

    const saveArrival = () => {
        if (loadingOn) loadingOn();
        const method = checkIsNumber(productInput?.Arr_Id) ? 'PUT' : 'POST';
        fetchLink({
            address: `inventory/tripSheet/arrivalEntry`,
            method: method,
            bodyData: productInput
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                closeDialog();
                if (onSubmit) onSubmit();
            } else {
                toast.error(data.message)
            }
        }).catch(
            e => console.log(e)
        ).finally(() => {
            if (loadingOff) loadingOff();
        })
    }

    return (
        <>
            <span className="p-0 m-0">
                {children}
            </span>

            <Dialog
                open={open}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <form onSubmit={(e) => {
                    e.preventDefault();

                    if (!checkIsNumber(productInput.Product_Id)) {
                        return toast.error('Select Item');
                    } else {
                        saveArrival();
                    }
                }}>
                    <DialogTitle className="d-flex align-items-center">
                        <span className="flex-grow-1">Add Arrival Details</span>
                        <IconButton
                            size="small" type="button" color="error"
                            onClick={closeDialog}
                        ><Close /></IconButton>
                    </DialogTitle>

                    <DialogContent>
                        <table className="table m-0">
                            <tbody>
                                <tr>
                                    <td className={tdStyle}>Date <RequiredStar /></td>
                                    <td className={tdStyle}>
                                        <input
                                            type="date"
                                            value={productInput.Arrival_Date}
                                            onChange={e => setProductInput(pre => ({ ...pre, Arrival_Date: e.target.value }))}
                                            className="cus-inpt p-2 "
                                            required
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>Item Name <RequiredStar /></td>
                                    <td className={tdStyle}>
                                        <Select
                                            value={{
                                                value: productInput.Product_Id, label: products.find(pro => isEqualNumber(
                                                    pro.Product_Id, productInput.Product_Id
                                                ))?.Product_Name
                                            }}
                                            onChange={e => {
                                                const productId = Number(e.value || 0);
                                                const product = products.find(pro => isEqualNumber(
                                                    pro.Product_Id, productId
                                                ))
                                                setProductInput(pre => ({
                                                    ...pre,
                                                    Product_Id: e.value,
                                                    HSN_Code: product?.HSN_Code,
                                                    Gst_P: product?.Gst_P,
                                                    Cgst_P: product?.Cgst_P,
                                                    Sgst_P: product?.Sgst_P,
                                                    Igst_P: product?.Igst_P,
                                                    Unit_Id: product?.UOM_Id,
                                                    Units: product?.Units,
                                                }))
                                            }}
                                            options={[
                                                { value: '', label: 'select product', isDisabled: true },
                                                ...products.map(obj => ({
                                                    value: obj?.Product_Id,
                                                    label: obj?.Product_Name,
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
                                    <td className={tdStyle}>From Godown <RequiredStar /></td>
                                    <td className={tdStyle}>
                                        <select
                                            value={productInput.From_Location}
                                            onChange={e => setProductInput({
                                                ...productInput,
                                                From_Location: e.target.value,
                                                BatchLocation: godown.find(g => isEqualNumber(g.Godown_Id, e.target.value)).Godown_Name || ''
                                            })}
                                            className="cus-inpt p-2"
                                            required
                                        >
                                            <option value={''} disabled>select godown</option>
                                            {godown.filter(
                                                fil => !isEqualNumber(fil.Godown_Id, productInput.To_Location)
                                            ).map((god, godInd) => (
                                                <option
                                                    value={god.Godown_Id}
                                                    key={godInd}
                                                >{god.Godown_Name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>To Godown <RequiredStar /></td>
                                    <td className={tdStyle}>
                                        <select
                                            value={productInput.To_Location}
                                            onChange={e => setProductInput({
                                                ...productInput,
                                                To_Location: e.target.value,
                                            })}
                                            className="cus-inpt p-2"
                                            required
                                        >
                                            <option value={''} disabled>select godown</option>
                                            {godown.filter(
                                                fil => !isEqualNumber(fil.Godown_Id, productInput.From_Location)
                                            ).map((god, godInd) => (
                                                <option
                                                    value={god.Godown_Id}
                                                    key={godInd}
                                                >{god.Godown_Name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>Weight <RequiredStar /></td>
                                    <td className={tdStyle}>
                                        <input
                                            className='cus-inpt p-2 w-50'
                                            value={productInput.QTY ? productInput.QTY : ''}
                                            required
                                            placeholder='Weight'
                                            onInput={onlynum}
                                            onChange={e => {
                                                const amount = checkIsNumber(productInput.Gst_Rate) ?
                                                    Multiplication(e.target.value, productInput.Gst_Rate) :
                                                    productInput.Taxable_Value;
                                                setProductInput(
                                                    pre => ({
                                                        ...pre,
                                                        QTY: e.target.value,
                                                        Taxable_Value: amount,
                                                        Total_Value: amount
                                                    })
                                                )
                                            }}
                                        />
                                        <select
                                            className='cus-inpt p-2 w-50'
                                            value={productInput.Unit_Id}
                                            placeholder='Units ex: kg, l, ml...'
                                            onChange={e => setProductInput(
                                                pre => ({
                                                    ...pre,
                                                    Unit_Id: e.target.value,
                                                    Units: uom.find(u => isEqualNumber(u.Unit_Id, e.target.value)).Units
                                                }))}
                                        >
                                            <option value="" disabled>select uom</option>
                                            {uom.map((uomObj, ind) => (
                                                <option value={uomObj.Unit_Id} key={ind}>{uomObj.Units}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>Rate</td>
                                    <td className={tdStyle}>
                                        <input
                                            className='cus-inpt p-2'
                                            value={productInput.Gst_Rate ? productInput.Gst_Rate : ''}
                                            placeholder='Rate'
                                            onInput={onlynum}
                                            onChange={e => {
                                                const amount = checkIsNumber(productInput.QTY) ?
                                                    Multiplication(e.target.value, productInput.QTY) :
                                                    productInput.Taxable_Value;
                                                setProductInput(
                                                    pre => ({
                                                        ...pre,
                                                        Gst_Rate: e.target.value,
                                                        Taxable_Value: amount,
                                                        Total_Value: amount
                                                    })
                                                )
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>Batch / Lot Number</td>
                                    <td className={tdStyle}>
                                        <input
                                            value={productInput.Batch_No}
                                            onChange={e => setProductInput({ ...productInput, Batch_No: e.target.value })}
                                            className="cus-inpt p-2"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>BillNo</td>
                                    <td className={tdStyle}>
                                        <input
                                            value={productInput.BillNo}
                                            onChange={e => setProductInput({ ...productInput, BillNo: e.target.value })}
                                            className="cus-inpt p-2"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle}>Concern</td>
                                    <td className={tdStyle}>
                                        <input
                                            value={productInput.Concern}
                                            onChange={e => setProductInput({ ...productInput, Concern: e.target.value })}
                                            className="cus-inpt p-2"
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </DialogContent>

                    <DialogActions>
                        <Button type="button" onClick={closeDialog}>close</Button>
                        <Button type="submit" variant="outlined">{checkIsNumber(productInput.Id) ? 'Update' : 'Add'}</Button>
                    </DialogActions>
                </form>
            </Dialog>

        </>
    )
}

export default CreateArrival;