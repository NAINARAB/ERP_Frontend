import { useState, useEffect } from "react";
import { Card, CardContent } from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from 'react-toastify';
import { ISOString, getPreviousDate, toArray, checkIsNumber, } from '../../../Components/functions';
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
            address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setRetailers(data.data);
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/products/grouped?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setProducts(data.data)
            }
        }).catch(e => console.error(e))

    }, [storage?.Company_id])

    useEffect(() => {
        if (stockInputValue?.Retailer_Id) {
            fetchLink({
                address: `masters/retailers/soldProducts?Retailer_Id=${stockInputValue?.Retailer_Id}&reqDate=${stockInputValue?.ST_Date}`
            }).then(data => {
                if (data.success) {
                    setProductClosingStock(toArray(data?.others?.productBased))
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

                    {/* <div className="col-lg-3 col-md-4 col-sm-6">
                        <label>From Date</label>
                        <input
                            type="date"
                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                            className="cus-inpt"
                            value={filters.Fromdate ? new Date(filters.Fromdate).toISOString().split('T')[0] : ''}
                        />
                    </div>

                    <div className="col-lg-3 col-md-4 col-sm-6">
                        <label>To Date</label>
                        <input
                            type="date"
                            onChange={e => setFilters({ ...filters, Todate: e.target.value })}
                            className="cus-inpt"
                            value={filters.Todate ? new Date(filters.Todate).toISOString().split('T')[0] : ''}
                        />
                    </div> */}

                </div>

                <CardContent>
                    {/* retailer details */}
                    {checkIsNumber(filters.customer.value) && <RetailerDetailsCard Retailer_Id={filters?.customer.value} />}

                    <br />

                    {/* stock abstract */}
                    {productClosingStock.length > 0 && (
                        <ListClosingStock productClosingStock={productClosingStock} />
                    )}

                    {/* closing Stock Entry */}
                    {/* {checkIsNumber(filters.customer.value) && (
                        <>
                            <Card component={Paper} variant='outlined' sx={{ mt: 2 }}>

                                <div className="p-3 d-flex align-items-center border-bottom">
                                    <span className="fa-18 fw-bold flex-grow-1">Closing Stock</span>
                                    <span>
                                        <Button
                                            startIcon={<Queue />}
                                            variant='outlined'
                                            onClick={() => setDialog({ ...dialog, closingStock: true })}
                                        > Add
                                        </Button>
                                    </span>
                                </div>

                            </Card>
                        </>
                    )} */}
                </CardContent>

            </Card>

            {/* <Dialog
                open={dialog?.closingStock}
                onClose={closeStockDialog}
                fullScreen
            >
                <DialogTitle>
                    <IconButton size="small" onClick={closeStockDialog} className="me-2">
                        <ArrowBack />
                    </IconButton>
                    {isEdit ? 'Modify' : 'Add'} Closing Stock For
                    <span className="ps-1 text-primary">{stockInputValue?.Retailer_Name}</span>
                </DialogTitle>
                <DialogContent className="bg-light">

                    <div className="col-xl-3 col-sm-4 mb-4">
                        <label>Date</label>
                        <input
                            type="date"
                            value={stockInputValue?.ST_Date ? new Date(stockInputValue?.ST_Date).toISOString().split('T')[0] : ''}
                            onChange={e => setStockInputValue({ ...stockInputValue, ST_Date: e.target.value })}
                            className="cus-inpt" required
                        />
                    </div>

                    <TabContext value={tabValue}>

                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList
                                indicatorColor='transparant'
                                onChange={(e, n) => setTabValue(n)}
                                variant='scrollable'
                                scrollButtons="auto"
                            >
                                {products?.map((o, i) => (
                                    <Tab
                                        key={i}
                                        sx={String(tabValue) === String(o?.Pro_Group_Id) ? { backgroundColor: '#c6d7eb' } : {}}
                                        label={o?.Pro_Group}
                                        value={String(o?.Pro_Group_Id)}
                                    />
                                ))}
                            </TabList>
                        </Box>

                        {products?.map((o, i) => (
                            <TabPanel key={i} value={String(o?.Pro_Group_Id)} sx={{ p: 0 }}>
                                <div className="row">
                                    {o?.GroupedProductArray?.map((oo, ii) => (
                                        <div className="col-xl-4 col-lg-6 p-2" key={ii}>
                                            <Card sx={{ display: 'flex' }}>

                                                <CardMedia
                                                    component="img"
                                                    sx={{ width: 151 }}
                                                    image={oo?.productImageUrl}
                                                    alt="Pic"
                                                />

                                                <CardContent sx={{ flexGrow: '1' }}>
                                                    <h6 className={isGraterNumber(getClosingStockCountNumber(oo?.Product_Id) || 0, 0) && 'text-primary'}>
                                                        {oo?.Product_Name}
                                                    </h6>
                                                    <p>{oo?.Product_Description + " - " + oo?.UOM}</p>

                                                    <div className="py-2">
                                                        <label className="mb-2 w-100">Closing Stock</label>
                                                        <input
                                                            style={{ maxWidth: 350 }}
                                                            type="number"
                                                            className="cus-inpt"
                                                            onChange={e =>
                                                                handleStockInputChange(
                                                                    oo?.Product_Id,
                                                                    e.target.value,
                                                                    getClosingStockDate(oo?.Product_Id),
                                                                    getClosingStockCountNumber(oo?.Product_Id)
                                                                )
                                                            }
                                                            value={(
                                                                closingStockValues.find(ooo =>
                                                                    Number(ooo?.Product_Id) === Number(oo?.Product_Id))?.ST_Qty
                                                                || ''
                                                            )}
                                                        />
                                                        <label className=" text-muted fa-13">
                                                            {
                                                                getClosingStockCountNumber(oo?.Product_Id)
                                                                    ? (
                                                                        <>
                                                                            Previous:&nbsp;
                                                                            <span className="me-2">
                                                                                {LocalDate(getClosingStockDate(oo?.Product_Id))}
                                                                            </span>
                                                                            <span className="text-primary ">
                                                                                ( {getClosingStockCountNumber(oo?.Product_Id)} )
                                                                            </span>
                                                                        </>
                                                                    )
                                                                    : ''
                                                            }
                                                        </label>
                                                    </div>
                                                </CardContent>

                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </TabPanel>
                        ))}
                    </TabContext>

                    <div className="col-lg-6 col-md-6 col-sm-8 mb-4">
                        <label>Narration</label>
                        <textarea
                            className="cus-inpt"
                            onChange={e => setStockInputValue({ ...stockInputValue, Narration: e.target.value })}
                            value={stockInputValue?.Narration}
                            rows={4}
                        />
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button onClick={closeStockDialog}>cancel</Button>
                    <Button variant='contained' color='success' onClick={postClosingStock}>confirm</Button>
                </DialogActions>
            </Dialog> */}
        </>
    )
}

export default RetailerClosingStock;