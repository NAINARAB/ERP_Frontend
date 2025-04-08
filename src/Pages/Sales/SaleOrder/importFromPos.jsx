import { useEffect, useState } from "react";
import { checkIsNumber, Division, isEqualNumber, ISOString, LocalDate, Multiplication, toNumber } from "../../../Components/functions";
import { Button, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { fetchLink } from "../../../Components/fetchComponent";
import { Done } from "@mui/icons-material";
import { saleOrderStockInfo } from "./column";
import { calculateGSTDetails } from "../../../Components/taxCalculator";



const ImportFromPOS = ({
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
    IS_IGST
}) => {

    const isInclusive = isEqualNumber(GST_Inclusive, 1);
    const isNotTaxableBill = isEqualNumber(GST_Inclusive, 2);

    const findProductDetails = (productid) => products?.find(obj => isEqualNumber(obj?.Product_Id, productid)) ?? {};

    const [saleOrders, setSaleOrders] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        search: false
    })

    useEffect(() => {
        if (checkIsNumber(retailer) && open) {
            const { Fromdate, Todate } = filters;
            if (loadingOn) loadingOn();
            fetchLink({
                address: `sales/saleOrder/importPosOrders?Fromdate=${Fromdate}&Todate=${Todate}&Retailer_Id=${retailer}`
            }).then(data => {
                if (data.success) setSaleOrders(data.data);
                else setSaleOrders([]);
            }).catch(e => console.error(e)).finally(() => {
                if (loadingOff) loadingOff();
            })
        }
    }, [filters.search])

    const changeSelectedItems = (itemDetail, deleteRow = false) => {
        setSelectedItems(prev => {
            const preItems = prev.filter(o => !isEqualNumber(o?.Pre_Id, itemDetail.Pre_Id));

            let tempArray;
            if (deleteRow) {
                tempArray = preItems;
            } else {
                const currentOrder = saleOrders.filter(sale => isEqualNumber(sale.Pre_Id, itemDetail.Pre_Id))
                const reStruc = currentOrder.map(cur => (
                    Object.fromEntries(
                        Object.entries(saleOrderStockInfo).map(([key, value]) => {

                            const productMaster = findProductDetails(cur.Item_Id);
                            const gstPercentage = IS_IGST ? productMaster.Igst_P : productMaster.Gst_P;
                            const isTaxable = gstPercentage > 0;

                            const { Item_Rate, Amount, Tonnage } = cur;

                            const taxType = isNotTaxableBill ? 'zerotax' : isInclusive ? 'remove' : 'add';
                            const itemRateGst = calculateGSTDetails(Item_Rate, gstPercentage, taxType);
                            const gstInfo = calculateGSTDetails(Amount, gstPercentage, taxType);

                            const cgstPer = !IS_IGST ? gstInfo.cgst_per : 0;
                            const igstPer = IS_IGST ? gstInfo.igst_per : 0;
                            const Cgst_Amo = !IS_IGST ? gstInfo.cgst_amount : 0;
                            const Igst_Amo = IS_IGST ? gstInfo.igst_amount : 0;

                            switch (key) {
                                case 'Pre_Id': return [key, cur['Pre_Id'] ?? value];
                                case 'Item_Id': return [key, cur['Item_Id'] ?? value];
                                case 'Item_Rate': return [key, toNumber(Item_Rate)];
                                case 'Bill_Qty': return [key, toNumber(Tonnage)];
                                case 'Amount': return [key, toNumber(Amount)];
                                case 'Unit_Id': return [key, cur['Unit_Id'] ?? value];
                                case 'Unit_Name': return [key, cur['Units'] ?? value];
                                case 'HSN_Code': return [key, productMaster.HSN_Code ?? value];

                                case 'Taxable_Rate': return [key, itemRateGst.base_amount]
                                case 'Total_Qty': return [key, toNumber(Tonnage)]
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
                tempArray = [...preItems, ...reStruc];
            }
            return tempArray;
        });
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
                        <span className="flex-grow-1">Import from POS</span>
                        <IconButton
                            onClick={closeDialog}
                            color='success'
                        >
                            <Done className="fa-20" />
                        </IconButton>
                    </div>
                </DialogTitle>
                <DialogContent>

                    <form onSubmit={e => {
                        e.preventDefault();
                        setFilters(pre => ({ ...pre, search: !pre.search }))
                    }}>
                        <div className="d-flex flex-wrap align-items-end">
                            <div>
                                <label className='d-block ms-2'>From Date</label>
                                <input
                                    className="cus-inpt p-2 w-auto"
                                    type="date"
                                    value={filters?.Fromdate}
                                    onChange={e => setFilters(pre => ({ ...pre, Fromdate: e.target.value }))}
                                    required
                                />
                            </div>
                            <div>
                                <label className='d-block ms-2'>To Date</label>
                                <input
                                    className="cus-inpt p-2 w-auto ms-2"
                                    type="date"
                                    min={filters.Fromdate}
                                    value={filters?.Todate}
                                    onChange={e => setFilters(pre => ({ ...pre, Todate: e.target.value }))}
                                    required
                                />
                            </div>
                            <Button
                                variant="outlined"
                                className="ms-2"
                                type="submit"
                            >search</Button>
                        </div>
                    </form>

                    <div className="table-responsive mt-3">
                        <table className="table table-bordered fa-13">
                            <thead>
                                <tr>
                                    {['Sno', '#', 'Item', 'Qty', 'Pack', 'Rate', 'Amount', 'Order ID', 'Date', 'Invoice Value'].map((col, ind) => (
                                        <th key={ind} >{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {saleOrders.filter(
                                    sale => isEqualNumber(sale.Custome_Id, retailer)
                                ).map((sale, saleInd) => (
                                    <tr key={saleInd}>
                                        <td>{saleInd + 1}</td>
                                        <td>
                                            {(() => {
                                                const isChecked = selectedItems.findIndex(o =>
                                                    isEqualNumber(o?.Pre_Id, sale.Pre_Id)
                                                ) !== -1;

                                                return (
                                                    <div>
                                                        <input
                                                            className="form-check-input shadow-none pointer"
                                                            style={{ padding: '0.7em' }}
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => {
                                                                if (isChecked) changeSelectedItems(sale, true)
                                                                else changeSelectedItems(sale)
                                                            }}
                                                        />
                                                    </div>
                                                )
                                            })()}
                                        </td>
                                        <td>{sale?.Product_Name}</td>
                                        <td>{sale?.Bill_Qty}</td>
                                        <td>{sale?.Tonnage}</td>
                                        <td>{sale?.Item_Rate}</td>
                                        <td>{sale?.Amount}</td>
                                        <td>{sale?.Pre_Id}</td>
                                        <td>{LocalDate(sale?.Pre_Date)}</td>
                                        <td>{sale?.Total_Invoice_value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default ImportFromPOS;