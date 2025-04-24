import { useEffect, useState } from "react";
import { checkIsNumber, isEqualNumber, ISOString, LocalDate, toArray, toNumber } from "../../../Components/functions";
import { Button, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { fetchLink } from "../../../Components/fetchComponent";
import { Done } from "@mui/icons-material";
import { salesInvoiceDetailsInfo } from "./variable";
import { calculateGSTDetails } from "../../../Components/taxCalculator";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";

const validStockValue = (Item_Id, Godown_Id, stockInGodown) => {
    const godownStockValue = toArray(stockInGodown).find(
        godownItem => (
            isEqualNumber(godownItem?.Product_Id, Item_Id) &&
            isEqualNumber(godownItem?.Godown_Id, Godown_Id)
        )
    )?.Act_Bal_Qty;

    if (
        godownStockValue === null ||
        godownStockValue === undefined ||
        Number.isNaN(godownStockValue) ||
        godownStockValue == 0
    ) {
        return 0;
    }

    return godownStockValue;
};

const AddProductsInSalesInvoice = ({
    loadingOn,
    loadingOff,
    open,
    onClose,
    retailer,
    children,
    selectedItems,
    setSelectedItems,
    products = [],
    GST_Inclusive,
    IS_IGST,
    invoiceInfo = {},
    setInvoiceInfo,
    godowns = [],
    stockInGodown = [],
}) => {

    const isInclusive = isEqualNumber(GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(GST_Inclusive, 2);

    const findProductDetails = (productid) => products?.find(obj => isEqualNumber(obj?.Product_Id, productid)) ?? {};

    const [saleOrders, setSaleOrders] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        search: false,
        Godown: { value: '', label: 'Select Godown For Stock Details' }
    });

    useEffect(() => {
        if (checkIsNumber(retailer) && open) {
            const { Fromdate, Todate } = filters;
            if (loadingOn) loadingOn();
            fetchLink({
                address: `sales/saleOrder?Fromdate=${Fromdate}&Todate=${Todate}&Retailer_Id=${retailer}`
            }).then(data => {
                if (data.success) setSaleOrders(data.data);
                else setSaleOrders([]);
            }).catch(e => console.error(e)).finally(() => {
                if (loadingOff) loadingOff();
            })
        }
    }, [filters.search])

    const changeSelectedItems = (itemDetail, godownDetails = {}, deleteRow) => {

        if (deleteRow) {
            setInvoiceInfo(pre => ({ ...pre, So_No: '' }));
            setSelectedItems([])
            return;
        }

        setInvoiceInfo(pre => ({ ...pre, So_No: Number(itemDetail?.So_Id) }));

        setSelectedItems(pre => {
            const oldData = [...pre];
            return toArray(itemDetail?.Products_List).map((cur, curIndex) => (
                Object.fromEntries(
                    Object.entries(salesInvoiceDetailsInfo).map(([key, value]) => {

                        const productMaster = findProductDetails(cur.Item_Id);
                        const gstPercentage = IS_IGST ? productMaster.Igst_P : productMaster.Gst_P;
                        const isTaxable = gstPercentage > 0;

                        const { Item_Rate, Bill_Qty, Amount } = cur;

                        const taxType = isNotTaxableBill ? 'zerotax' : isInclusive ? 'remove' : 'add';
                        const itemRateGst = calculateGSTDetails(Item_Rate, gstPercentage, taxType);
                        const gstInfo = calculateGSTDetails(Amount, gstPercentage, taxType);

                        const cgstPer = !IS_IGST ? gstInfo.cgst_per : 0;
                        const igstPer = IS_IGST ? gstInfo.igst_per : 0;
                        const Cgst_Amo = !IS_IGST ? gstInfo.cgst_amount : 0;
                        const Igst_Amo = IS_IGST ? gstInfo.igst_amount : 0;

                        switch (key) {
                            case 'S_No': return [key, curIndex + 1 ?? value];
                            case 'Item_Id': return [key, cur['Item_Id'] ?? value];
                            case 'Item_Name': return [key, productMaster?.Product_Name ?? value];
                            case 'Item_Rate': return [key, toNumber(Item_Rate)];

                            case 'Bill_Qty': return [key, toNumber(Bill_Qty)];
                            case 'Act_Qty': return [key, toNumber(Bill_Qty)];
                            case 'Alt_Act_Qty': return [key, toNumber(Bill_Qty)];

                            case 'Amount': return [key, Amount];
                            case 'HSN_Code': return [key, productMaster.HSN_Code ?? value];

                            case 'Unit_Id': return [key, cur['Unit_Id'] ?? value];
                            case 'Act_unit_Id': return [key, cur['Unit_Id'] ?? value];
                            case 'Alt_Act_Unit_Id': return [key, cur['Unit_Id'] ?? value];
                            case 'Unit_Name': return [key, cur['Units'] ?? value];
                            case 'GoDown_Id': {
                                const isValidGodown = checkIsNumber(godownDetails?.Godown_Id);
                                const isValidItem = checkIsNumber(godownDetails?.Item_Id);
                                const isSameItem = isEqualNumber(cur?.Item_Id, godownDetails?.Item_Id);
                                const oldGodown = oldData.find(
                                    fndOld => isEqualNumber(fndOld.Item_Id, cur?.Item_Id)
                                )?.GoDown_Id

                                const newValue = (isValidGodown && isValidItem && isSameItem)
                                    ? godownDetails.Godown_Id 
                                    : checkIsNumber(oldGodown) ? oldGodown : value;

                                return [key, newValue];
                            }

                            case 'Taxable_Rate': return [key, itemRateGst.base_amount]
                            case 'Total_Qty': return [key, toNumber(Bill_Qty)]
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

                            default: return [key, value]
                        }
                    })
                )
            ))
        });

        // closeDialog();
    }

    const closeDialog = () => {
        if (onClose) onClose();
        setSaleOrders([]);
    }

    return (
        <>
            {children}

            <Dialog
                open={open}
                onClose={closeDialog}
                fullScreen
            >
                <DialogTitle>
                    <div className="d-flex flex-wrap align-items-center ">
                        <span className="flex-grow-1">Select Sale Order</span>
                        <IconButton
                            onClick={closeDialog}
                            color='success'
                        >
                            <Done className="fa-20" />
                        </IconButton>
                    </div>
                </DialogTitle>
                <DialogContent>

                    <div className="d-flex flex-wrap align-items-end">
                        <div className="p-2">
                            <label className='d-block ms-2'>From Date</label>
                            <input
                                className="cus-inpt p-2 w-auto"
                                type="date"
                                value={filters?.Fromdate}
                                onChange={e => setFilters(pre => ({ ...pre, Fromdate: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="p-2">
                            <label className='d-block ms-2'>To Date</label>
                            <input
                                className="cus-inpt p-2 w-auto"
                                type="date"
                                min={filters.Fromdate}
                                value={filters?.Todate}
                                onChange={e => setFilters(pre => ({ ...pre, Todate: e.target.value }))}
                                required
                            />
                        </div>
                        {/* <div style={{ minWidth: '170px', maxWidth: '100%' }} className="p-2">
                            <label className='d-block ms-2'>Godown</label>
                            <Select
                                value={filters.Godown}
                                onChange={e => setFilters(pre => ({ ...pre, Godown: e }))}
                                options={[
                                    { value: '', label: 'select', isDisabled: true },
                                    ...toArray(godowns).map(obj => ({ value: obj?.Godown_Id, label: obj?.Godown_Name }))
                                ]}
                                styles={customSelectStyles}
                                menuPortalTarget={document.body}
                                isSearchable={true}
                                placeholder={"Select Godown"}
                                maxMenuHeight={200}
                            />
                        </div> */}
                        <div className="p-2">
                            <Button
                                variant="outlined"
                                type="button"
                                onClick={() => setFilters(pre => ({ ...pre, search: !pre.search }))}
                            >search</Button>
                        </div>
                    </div>

                    <br />

                    {saleOrders.map((invoice, ind) => {
                        const {
                            So_Inv_No, So_Date, VoucherTypeGet, Branch_Name,
                            Sales_Person_Name, Total_Tax, Total_Invoice_value, Products_List
                        } = invoice;

                        const isChecked = isEqualNumber(invoiceInfo?.So_No, invoice.So_Id)

                        return (
                            <div className="container-fluid" key={ind} >
                                <div
                                    className={`
                                        invoice-card bg-white p-4 shadow-sm mb-4 border rounded  
                                        ${isChecked ? ' border-primary ' : ''}
                                        `
                                    }
                                >
                                    {/* Header */}
                                    <h5 className="d-flex align-items-center flex-wrap">
                                        <span className="me-2">
                                            <input
                                                className="form-check-input shadow-none pointer"
                                                style={{ padding: '0.7em' }}
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => {
                                                    if (isChecked) changeSelectedItems(invoice, null, true)
                                                    else changeSelectedItems(invoice, null, false)
                                                }}
                                            />
                                        </span>
                                        <span>Invoice No: <span className="text-primary">{So_Inv_No}</span></span>
                                    </h5>
                                    <div className="invoice-header d-flex justify-content-between flex-wrap border-bottom pb-3 mb-3">
                                        <div>
                                            <div><strong>Invoice Date:</strong> {LocalDate(So_Date)}</div>
                                            <div><strong>Voucher Type:</strong> {VoucherTypeGet}</div>
                                            <div><strong>Branch:</strong> {Branch_Name}</div>
                                        </div>
                                        <div className="text-end">
                                            <h5 className="mt-2"><strong>Total Invoice:</strong> ₹{Total_Invoice_value}</h5>
                                            {/* <div><strong>Subtotal:</strong> ₹{Total_Before_Tax}</div> */}
                                            <div><strong>Tax:</strong> ₹{Total_Tax}</div>
                                            {/* <div><strong>Round Off:</strong> ₹{Round_off}</div> */}
                                            <div><strong>Salesperson:</strong> {Sales_Person_Name}</div>
                                        </div>
                                    </div>

                                    {/* Product Table */}
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-striped product-table">
                                            <thead className="table-light">
                                                <tr>
                                                    {['#', 'Product', 'Qty', 'Rate', 'Amount', 'Tax %', 'Final Amount', 'Godown'].map(
                                                        (o, i) => (
                                                            <th
                                                                key={i}
                                                                style={{
                                                                    minWidth: '150px',
                                                                    maxWidth: '160px'
                                                                }}
                                                            >{o}</th>
                                                        )
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Products_List.map((item, index) => (
                                                    <tr key={item.SO_St_Id}>
                                                        <td>{index + 1}</td>
                                                        <td>{item.Product_Name}</td>
                                                        <td>
                                                            {item.Bill_Qty}
                                                            {checkIsNumber(filters.Godown.value) && (
                                                                ' (Bal: ' + validStockValue(item.Item_Id, filters.Godown.value, stockInGodown) + ') '
                                                            )}
                                                        </td>
                                                        <td>₹{item.Item_Rate}</td>
                                                        <td>₹{item.Amount}</td>
                                                        <td>{item.Tax_Rate}%</td>
                                                        <td>₹{item.Final_Amo}</td>
                                                        <td>
                                                            <select
                                                                disabled={!isChecked}
                                                                className="cus-inpt p-2"
                                                                value={
                                                                    toArray(godowns).find(
                                                                        godFnd => toArray(selectedItems).find(
                                                                            fnd => (
                                                                                isEqualNumber(fnd.Item_Id, item?.Item_Id)
                                                                                && isChecked
                                                                                && isEqualNumber(godFnd?.Godown_Id, fnd?.GoDown_Id)
                                                                            )
                                                                        )
                                                                    )?.Godown_Id
                                                                }
                                                                onChange={e => changeSelectedItems(
                                                                    invoice,
                                                                    {
                                                                        Godown_Id: e.target.value,
                                                                        Item_Id: item?.Item_Id
                                                                    },
                                                                    false
                                                                )}
                                                            >
                                                                <option value="" disabled>Select</option>
                                                                <optgroup label="Stock-Available-Godown">
                                                                    {
                                                                        toArray(godowns).filter(
                                                                            fil => (
                                                                                toArray(stockInGodown).some(
                                                                                    fnd => (
                                                                                        isEqualNumber(fnd?.Godown_Id, fil?.Godown_Id)
                                                                                        && isEqualNumber(item?.Item_Id, fnd?.Product_Id)
                                                                                    )
                                                                                )
                                                                            )
                                                                        ).map((obj, objInd) => (
                                                                            <option
                                                                                value={obj?.Godown_Id}
                                                                                key={objInd}
                                                                            >
                                                                                {obj?.Godown_Name
                                                                                    + ' (Bal: '
                                                                                    + validStockValue(item?.Item_Id, obj?.Godown_Id, stockInGodown)
                                                                                    + ')'
                                                                                }
                                                                            </option>
                                                                        ))
                                                                    }
                                                                </optgroup>
                                                                <optgroup label="Other-Godown">
                                                                    {
                                                                        toArray(godowns).filter(
                                                                            fil => !(
                                                                                toArray(stockInGodown).some(
                                                                                    fnd => (
                                                                                        isEqualNumber(fnd?.Godown_Id, fil?.Godown_Id)
                                                                                        && isEqualNumber(item?.Item_Id, fnd?.Product_Id)
                                                                                    )
                                                                                )
                                                                            )
                                                                        ).map((obj, objInd) => (
                                                                            <option value={obj?.Godown_Id} key={objInd}>{obj?.Godown_Name}</option>
                                                                        ))
                                                                    }
                                                                </optgroup>
                                                            </select>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Summary */}
                                    <div className="invoice-summary border-top pt-3 mt-3 text-end">

                                    </div>
                                </div>
                            </div>
                        );
                    })}

                </DialogContent>
            </Dialog>
        </>
    )
}

export default AddProductsInSalesInvoice;
export {
    validStockValue,
}