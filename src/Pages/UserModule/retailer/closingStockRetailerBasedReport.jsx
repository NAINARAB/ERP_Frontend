import React, { useState, useEffect } from "react";
import { IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Card, Box, CardContent, CardMedia, Button, Tab, Paper, Collapse } from "@mui/material";
import { Person, Call, LocationOn, ArrowBack, Queue, Edit, ExpandLess, ExpandMore } from "@mui/icons-material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { toast } from 'react-toastify';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { isGraterNumber, LocalDate, NumberFormat, ISOString, getPreviousDate,  } from '../../../Components/functions';
import ImagePreviewDialog from "../../../Components/imagePreview";
import { fetchLink } from "../../../Components/fetchComponent";


const RetailerClosingStock = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [retailers, setRetailers] = useState([]);
    const [products, setProducts] = useState([]);
    const [retailerInfo, setRetailerInfo] = useState({});
    const [productClosingStock, setProductClosingStock] = useState([]);
    const [filteredProductClosingStock, setFilteredProductClosingStock] = useState([])
    const [tabValue, setTabValue] = useState('1');
    const [reload, setReload] = useState(false);

    const [dialog, setDialog] = useState({
        closingStock: false
    });
    const [filters, setFilters] = useState({
        cust: '',
        custGet: 'Select Retailer',
        Fromdate: getPreviousDate(10),
        Todate: ISOString(),
    });

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

    const [stockInputValue, setStockInputValue] = useState(initialStockValue)
    const [closingStockValues, setClosingStockValues] = useState([]);
    const [isEdit, setIsEdit] = useState(false);


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
                address: `masters/retailers/closingStock/productBased?Retailer_Id=${stockInputValue?.Retailer_Id}&reqDate=${stockInputValue?.ST_Date}`
            }).then(data => {
                if (data.success) {
                    setProductClosingStock(data.data)
                }
            }).catch(e => console.error(e))
        }
    }, [stockInputValue?.ST_Date, stockInputValue?.Retailer_Id, reload])

    useEffect(() => {
        setRetailerInfo({})
        if (filters?.cust) {
            fetchLink({
                address: `masters/retailers/info?Retailer_Id=${filters?.cust}&Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`
            }).then(data => {
                if (data?.success && data?.data?.length > 0) {
                    setRetailerInfo(data.data[0])
                }
            }).catch(e => console.error(e))
        }
    }, [filters?.cust, filters?.Fromdate, filters?.Todate, reload])

    const RetailerDetails = ({ data }) => {

        return (
            <Card component={Paper} variant='outlined' sx={{ mt: 2 }}>
                <div className="row">
                    <div className="col-xl-2 col-md-3 d-flex align-items-center">
                        <ImagePreviewDialog url={data?.imageUrl} >
                            <CardMedia
                                component="img"
                                sx={{ width: 200, height: 200 }}
                                image={data?.imageUrl}
                                alt="retailer_picture"
                            />
                        </ImagePreviewDialog>
                    </div>

                    <div className="col-xl-10 col-md-9 d-flex flex-column justify-content-center p-2" >
                        <CardContent>

                            <h6
                                className="mb-2 fa-18 fw-bold text-primary text-decoration-underline"
                                onClick={() => {
                                    if (data?.VERIFIED_LOCATION?.latitude && data?.VERIFIED_LOCATION?.longitude) {
                                        window.open(`https://www.google.com/maps/search/?api=1&query=${data?.VERIFIED_LOCATION?.latitude},${data?.VERIFIED_LOCATION?.longitude}`, '_blank');
                                    } else {
                                        if (data?.Latitude && data?.Longitude) {
                                            window.open(`https://www.google.com/maps/search/?api=1&query=${data?.Latitude},${data?.Longitude}`, '_blank');
                                        }
                                    }
                                }}
                            >
                                {data?.Retailer_Name}
                            </h6>
                            <p><LocationOn className="fa-14 text-primary" /> {data?.Reatailer_Address}</p>
                            <p className="fa-14 "> {data?.RouteGet}</p>
                            <p className="fa-14 ">Class: {data?.Retailer_Class}</p>
                            <p className="text-primary "><Person className="fa-14 text-primary" /> {data?.Contact_Person}</p>
                            <a href={`tel:${data?.Mobile_No}`}><Call className="fa-14 text-primary" />
                                <span className="ps-1">{data?.Mobile_No}</span>
                            </a>

                            <p className="fw-bold fa-14 text-muted">
                                Created: {data?.Created_Date ? new Date(data?.Created_Date).toLocaleDateString('en-IN') : '--:--:--'}
                                &nbsp; - &nbsp;
                                {data?.createdBy}
                            </p>

                        </CardContent>
                    </div>
                </div>
            </Card>
        )
    }

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
            Retailer_Id: filters?.cust,
            Retailer_Name: filters?.custGet
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

    // const getClosingStockCount = (productID) => {
    //     const obj = productClosingStock?.filter(o => Number(o?.Item_Id) === Number(productID));
    //     return obj[0]?.Previous_Balance ? 'Previous: ( ' + obj[0]?.Previous_Balance + ' )' : ''
    // }

    const getClosingStockCountNumber = (productID) => {
        const obj = productClosingStock?.filter(o => Number(o?.Item_Id) === Number(productID));
        return obj[0]?.Previous_Balance || 0
    }

    const getClosingStockDate = (productID) => {
        const obj = productClosingStock?.filter(o => Number(o?.Item_Id) === Number(productID));
        return obj[0]?.Cl_Date || new Date()
    }

    const GroupByDate = ({ o }) => {
        const [open, setOpen] = useState(false);

        return (
            <div className=" pt-3 ">
                <div className="fa-14 fw-bold text-muted d-flex align-items-center">

                    <IconButton size="small" className="me-2" onClick={() => setOpen(!open)} >
                        {open ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>

                    <span className="flex-grow-1">
                        Date:&emsp;
                        <span className="ps-1 text-primary">
                            {
                                o?.ST_Date
                                    ? new Date(o?.ST_Date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })
                                    : null
                            }
                        </span>
                        <br />
                        By:&emsp;&emsp;
                        <span className="ps-1 text-primary">{o?.CreatedByGet} </span>
                        ( {o?.ProductCount?.length} )
                    </span>

                    <span className="ps-1">
                        <IconButton size="small" onClick={() => {
                            setIsEdit(true);
                            setStockInputValue({
                                ...stockInputValue,
                                Company_Id: retailerInfo?.Company_Id,
                                ST_Date: new Date(o?.ST_Date).toISOString().split('T')[0],
                                Retailer_Id: retailerInfo?.Retailer_Id,
                                Retailer_Name: retailerInfo?.Retailer_Name,
                                Narration: o?.Narration,
                                Created_by: storage?.UserId,
                                ST_Id: o?.ST_Id,
                            })
                            setClosingStockValues([...o?.ProductCount?.map(eo => ({
                                Product_Id: eo?.Item_Id,
                                ST_Qty: eo?.ST_Qty
                            }))]);
                            setDialog({ ...dialog, closingStock: true })
                        }}>
                            <Edit className="fa-16 text-dark" />
                        </IconButton>
                    </span>

                </div>


                <Collapse in={open} unmountOnExit>
                    <div className="table-responsive mt-2">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className="border fa-14">SNo</th>
                                    <th className="border fa-14">Product</th>
                                    <th className="border fa-14">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {o?.ProductCount?.map((oo, ii) => (
                                    <tr key={ii}>
                                        <td className="border fa-14">{ii + 1}</td>
                                        <td className="border fa-14 fw-bold text-muted">{oo?.ProductName}</td>
                                        <td className="border fa-14">{oo?.ST_Qty}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Collapse>
            </div>
        )
    }

    useEffect(() => {
        const filt = productClosingStock?.filter(o => Number(o?.Previous_Balance) > 0)
        setFilteredProductClosingStock(filt)
    }, [productClosingStock])

    // useEffect(() => console.log(closingStockValues), [closingStockValues])

    return (
        <>

            <div className="row mb-2">

                <div className="col-lg-3 col-md-4 col-sm-6">
                    <label>Retailer</label>
                    <Select
                        value={{ value: filters?.cust, label: filters?.custGet }}
                        onChange={(e) => {
                            setFilters({ ...filters, cust: e.value, custGet: e.label });
                            setStockInputValue({ ...stockInputValue, Retailer_Id: e.value, Retailer_Name: e.label })
                        }}
                        options={[
                            { value: '', label: 'All Retailer' },
                            ...retailers.map(obj => ({ value: obj?.Retailer_Id, label: obj?.Retailer_Name }))
                        ]}
                        styles={customSelectStyles}
                        isSearchable={true}
                        placeholder={"Retailer Name"}
                    />
                </div>

                <div className="col-lg-3 col-md-4 col-sm-6">
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
                </div>

            </div>

            {/* retailer details */}
            {filters.cust && <RetailerDetails data={retailerInfo} />}

            {/* closing Stock Entry */}
            {filters.cust && (
                <>
                    <Card component={Paper} variant='outlined' sx={{ mt: 2 }}>

                        <div className="p-3 d-flex align-items-center border-bottom">
                            <span className="fa-18 fw-bold flex-grow-1">Closing Stock</span>
                            <span>
                                <Button startIcon={<Queue />} variant='outlined' onClick={() => setDialog({ ...dialog, closingStock: true })} >
                                    Add
                                </Button>
                            </span>
                        </div>

                        {retailerInfo?.ClosingStocks?.length > 0 && (
                            <CardContent className="pt-0" sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
                                {retailerInfo?.ClosingStocks?.map((o, i) => (
                                    <GroupByDate o={o} key={i} />
                                ))}
                            </CardContent>
                        )}

                    </Card>
                </>
            )}

            {/* stock abstract */}
            {filters?.cust && (
                <Card component={Paper} variant='outlined' sx={{ mt: 2 }}>
                    <div className="p-3 d-flex justify-content-between fa-18 fw-bold">
                        <span>
                            Current Stock
                            <span style={{ fontWeight: 'normal', fontSize: '16px' }}> ( Products {filteredProductClosingStock?.length} )</span>
                        </span>
                        <span>
                            ₹ {NumberFormat(filteredProductClosingStock.reduce((sum, product) => sum + (product.Previous_Balance * product.Item_Rate), 0))}
                        </span>
                    </div>

                    {filteredProductClosingStock?.length > 0 && (
                        <CardContent sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
                            <div className="table-responsive">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {['Sno', 'Product Name', 'Date', 'Quantity', 'Rate', 'Value'].map(o => (
                                                <th className="fa-14 border text-center" key={o}>{o}</th>

                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProductClosingStock?.map((o, i) => (
                                            <tr key={i}>
                                                <td className="fa-14 border">{i + 1}</td>
                                                <td className="fa-14 border">{o?.Product_Name}</td>
                                                <td className="fa-14 border text-center">{LocalDate(o?.Cl_Date)}</td>
                                                <td className="fa-14 border text-end">{NumberFormat(o?.Previous_Balance)}</td>
                                                <td className="fa-14 border text-end">{o?.Item_Rate}</td>
                                                <td className="fa-14 border text-end">
                                                    {(o?.Previous_Balance && o?.Item_Rate) ? NumberFormat(o?.Item_Rate * o?.Previous_Balance) : 0}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    )}
                </Card>
            )}

            <Dialog
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
            </Dialog>
        </>
    )
}

export default RetailerClosingStock;