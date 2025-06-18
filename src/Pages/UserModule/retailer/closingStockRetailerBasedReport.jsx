import { useState, useEffect } from "react";
import { Card, CardContent } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from 'react-toastify';
import { ISOString, getPreviousDate, toArray, checkIsNumber, LocalDate, getDaysBetween, } from '../../../Components/functions';
import { fetchLink } from "../../../Components/fetchComponent";
import ListClosingStock from "./listClosingStock";
import RetailerDetailsCard from "./retailerDetails";

const RetailerClosingStock = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const initialStockValue = {
        Company_Id: storage?.Company_id,
        ST_Date: ISOString(),
        Retailer_Id: '',
        Retailer_Name: '',
        Narration: '',
        Created_by: storage?.UserId,
        Product_Stock_List: [],
        ST_Id: ''
    }

    const [retailers, setRetailers] = useState([]);
    const [products, setProducts] = useState([]);
    const [productClosingStock, setProductClosingStock] = useState([]);
    const [tabValue, setTabValue] = useState(1);
    const [reload, setReload] = useState(false);

    const [stockInputValue, setStockInputValue] = useState(initialStockValue)
    const [closingStockValues, setClosingStockValues] = useState([]);
    const [isEdit, setIsEdit] = useState(false);

    const [dialog, setDialog] = useState({
        closingStock: false
    });

    const [filters, setFilters] = useState({
        customer: { value: '', label: 'Select Retailer' },
        Fromdate: getPreviousDate(10),
        Todate: ISOString(),
        closingStockDialog: false,
    });

    useEffect(() => {
        fetchLink({
            address: `masters/retailers/whoHasClosingStock`
        }).then(data => {
            if (data.success) {
                setRetailers(data.data);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/products/grouped`
        }).then(data => {
            if (data.success) {
                setProducts(data.data)
            }
        }).catch(e => console.error(e))

    }, [])

    useEffect(() => {
        if (stockInputValue?.Retailer_Id) {
            fetchLink({
                address: `masters/retailers/soldProducts?Retailer_Id=${stockInputValue?.Retailer_Id}&reqDate=${stockInputValue?.ST_Date}`
            }).then(data => {
                if (data.success) {
                    const processed = toArray(data?.others?.productBased).map(row => ({
                        ...row,
                        entryDate: row?.lastDeliveryDate ? LocalDate(row?.lastDeliveryDate) : '',
                        updateDate: row?.lastclosingDate ? LocalDate(row?.lastclosingDate) : '',
                        entryDays: row?.lastDeliveryDate ? getDaysBetween(row?.lastDeliveryDate, ISOString()) : '',
                        updateDays: row?.lastclosingDate ? getDaysBetween(row?.lastclosingDate, ISOString()) : ''
                    }))
                    setProductClosingStock(processed)
                }
            }).catch(e => console.error(e))
        }
    }, [stockInputValue?.ST_Date, stockInputValue?.Retailer_Id, reload])

    const handleStockInputChange = (productId, value, date, previousStock) => {
        const productIndex = closingStockValues.findIndex(item => item.Product_Id === productId);

        if (productIndex !== -1) {
            const updatedValues = [...closingStockValues];
            updatedValues[productIndex].ST_Qty = value;
            updatedValues[productIndex].PR_Qty = previousStock;
            updatedValues[productIndex].LT_CL_Date = date;

            setClosingStockValues(updatedValues);
        } else {
            setClosingStockValues(prevValues => [...prevValues, { Product_Id: productId, ST_Qty: value, PR_Qty: previousStock, LT_CL_Date: date }]);
        }
    };

    const closeStockDialog = () => {
        setDialog({ ...dialog, closingStock: false });
        setClosingStockValues([]);
        setStockInputValue({
            ...initialStockValue,
            Retailer_Id: filters?.customer.value,
            Retailer_Name: filters?.customer.label
        });
        setIsEdit(false)
    }

    const postClosingStock = () => {
        if (closingStockValues?.length > 0 && stockInputValue?.Retailer_Id) {
            fetchLink({
                address: `masters/retailers/closingStock`,
                method: isEdit ? 'PUT' : 'POST',
                bodyData: {
                    ...stockInputValue,
                    Product_Stock_List: closingStockValues
                }
            }).then(data => {
                if (data.success) {
                    toast.success(data?.message);
                    closeStockDialog();
                    setReload(!reload)
                } else {
                    toast.error(data?.message)
                }
            }).catch(e => console.error(e))
        } else {
            toast.error('Enter any one valid stock value')
        }
    }


    return (
        <>

            <Card>

                <div className="p-2 border-bottom">
                    <span className="fa-18">Customer Closing Stock</span>
                </div>

                <div className="row p-3">

                    <div className="col-lg-3 col-md-4 col-sm-6">
                        <label>Retailer</label>
                        <Select
                            value={filters.customer}
                            onChange={(e) => {
                                setFilters({ ...filters, customer: e });
                                setStockInputValue({ ...stockInputValue, Retailer_Id: e.value, Retailer_Name: e.label })
                            }}
                            options={[
                                { value: '', label: 'All Retailer' },
                                ...retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                            ]}
                            menuPortalTarget={document.body}
                            styles={customSelectStyles}
                            isSearchable={true}
                            placeholder={"Retailer Name"}
                        />
                    </div>

                </div>

                <CardContent>
                    {/* retailer details */}
                    {/* {checkIsNumber(filters.customer.value) && <RetailerDetailsCard Retailer_Id={filters?.customer.value} />} */}

                    <br />

                    {/* stock abstract */}
                    {productClosingStock.length > 0 && (
                        <ListClosingStock productClosingStock={productClosingStock} />
                    )}

                </CardContent>

            </Card>


        </>
    )
}

export default RetailerClosingStock;