import React, { useState, useEffect } from "react";
import { Card, CardContent, IconButton, Collapse } from "@mui/material";
import { NumberFormat, LocalDate } from "../../../Components/functions";
import { Add, Remove } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";



const StockReportAreaBased = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const [stockValue, setStockValaue] = useState([]);

    useEffect(() => {

        fetchLink({
            address: `masters/retailers/closingStock/areaBased?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setStockValaue(data.data)
            }
        }).catch(e => console.error(e))

    }, [storage?.Company_id])

    const AreaList = ({ o, sno }) => {
        const [open, setOpen] = useState(false);
        const [reportType, setReportType] = useState('RETAILER')

        const dispContent = (val) => {
            switch (val) {
                case 'RETAILER':
                    return (
                        <table className="table mb-0">
                            <thead>
                                <tr>
                                    {['', 'SNo', 'Retailer', 'Products', 'Value'].map((ret, ind) => (
                                        <th key={ind} className="fa-14 border">{ret}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {o?.Retailer?.map((ret, ind) => <RetailerList o={ret} key={ind} sno={ind + 1} />)}
                            </tbody>
                        </table>
                    )
                case 'PRODUCT':
                    return (
                        <table className="table">
                            <thead>
                                <tr>
                                    {['SNo', 'Product', 'Quantity', 'Value'].map((ret, ind) => (
                                        <th key={ind} className="fa-14 border text-center">{ret}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {uniqueProductsWorth?.map((up, upi) => (
                                    <tr key={upi}>
                                        <td className="fa-13 border text-center">{upi + 1}</td>
                                        <td className="fa-13 border">{up?.Product_Name}</td>
                                        <td className="fa-13 border text-end">{NumberFormat(up?.totalQuantity)}</td>
                                        <td className="fa-13 border text-end text-primary">{NumberFormat(up?.totalWorth)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                default: <></>
            }
        }

        const areaValue = () => {
            let totalClosingStockValue = 0;

            o?.Retailer?.forEach(retailer => {
                retailer?.Closing_Stock?.forEach(stock => {
                    totalClosingStockValue += stock.Previous_Balance * stock.Item_Rate;
                });
            });

            return totalClosingStockValue;
        };

        const calculateUniqueProductsWorth = (retailers) => {
            const productMap = new Map();

            retailers?.forEach(retailer => {
                retailer?.Closing_Stock?.forEach(stock => {
                    const productId = stock?.Item_Id;
                    const productWorth = stock?.Previous_Balance * stock?.Item_Rate;
                    const productQuantity = stock?.Previous_Balance;

                    if (productMap.has(productId)) {
                        const existingProduct = productMap.get(productId);
                        existingProduct.totalWorth += productWorth;
                        existingProduct.totalQuantity += productQuantity;
                    } else {
                        productMap.set(productId, {
                            Item_Id: productId,
                            Product_Name: stock?.Product_Name,
                            totalWorth: productWorth,
                            totalQuantity: productQuantity
                        });
                    }
                });
            });

            return Array.from(productMap.values());
        };

        const uniqueProductsWorth = calculateUniqueProductsWorth(o?.Retailer);

        return (
            <>
                <tr>
                    <td className="fa-13 border">
                        <IconButton size="small" onClick={() => setOpen(!open)}>
                            {open ? <Remove sx={{ fontSize: '16px', color: 'red' }} /> : <Add sx={{ fontSize: '16px' }} />}
                        </IconButton>
                    </td>
                    <td className="fa-13 border">{sno}</td>
                    <td className="fa-13 border fw-bold text-muted">{o?.Area_Name ? o?.Area_Name : 'unknown'}</td>
                    <td className="fa-13 border text-end">{uniqueProductsWorth?.length}</td>
                    <td className="fa-13 border text-end text-primary fw-bold">{NumberFormat(areaValue())}</td>
                </tr>
                <tr>
                    <td colSpan={5} className="p-0 border-0">
                        <Collapse in={open} timeout="auto" unmountOnExit>

                            <div className="my-3">
                                <label className="w-100 mb-2 text-muted fw-bold">Report Type</label>
                                <select
                                    value={reportType}
                                    onChange={e => setReportType(e.target.value)}
                                    className="cus-inpt w-auto"
                                >
                                    <option value="RETAILER">RETAILER BASED</option>
                                    <option value="PRODUCT">PRODUCT BASED</option>
                                </select>
                            </div>

                            <div className="table-responsive my-2">
                                {dispContent(reportType)}
                            </div>
                        </Collapse>
                    </td>
                </tr>
            </>
        )
    }

    const RetailerList = ({ o, sno }) => {
        const [open, setOpen] = useState(false);

        const overAllValue = () => {
            let totalClosingStockValue = 0;

            o?.Closing_Stock?.forEach(stock => {
                totalClosingStockValue += stock?.Previous_Balance * stock?.Item_Rate;
            })

            return totalClosingStockValue;
        };

        return (
            <>
                <tr>
                    <td>
                        <IconButton size="small" onClick={() => setOpen(!open)}>
                            {open ? <Remove sx={{ fontSize: '16px', color: 'red' }} /> : <Add sx={{ fontSize: '16px' }} />}
                        </IconButton>
                    </td>
                    <td className="fa-13 border">{sno}</td>
                    <td className="fa-13 border">
                        <span className="fw-bold text-muted">{o?.Retailer_Name}</span> <br />
                        <span className="fa-12 text-muted">{o?.Reatailer_Address}</span>
                    </td>
                    <td className="fa-13 border">{o?.Closing_Stock?.length}</td>
                    <td className="fa-13 border">
                        {NumberFormat(overAllValue())}
                    </td>
                </tr>

                <tr>
                    <td colSpan={5} className="p-0 border-0">
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <div className="table-responsive my-2">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            {['Sno', 'Product Name', 'Date', 'Quantity', 'Rate', 'Value'].map(o => (
                                                <th className="fa-14 border text-center" key={o}>{o}</th>

                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {o?.Closing_Stock?.map((pro, i) => (
                                            <tr key={i}>
                                                <td className="fa-14 border">{i + 1}</td>
                                                <td className="fa-14 border">{pro?.Product_Name}</td>
                                                <td className="fa-14 border text-center">{LocalDate(pro?.Cl_Date)}</td>
                                                <td className="fa-14 border text-end">{NumberFormat(pro?.Previous_Balance)}</td>
                                                <td className="fa-14 border text-end">{pro?.Item_Rate}</td>
                                                <td className="fa-14 border text-end">
                                                    {(pro?.Previous_Balance && pro?.Item_Rate) ? NumberFormat(pro?.Item_Rate * pro?.Previous_Balance) : 0}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Collapse>
                    </td>
                </tr>
            </>
        )
    }

    const overAllValue = (data) => {
        let totalClosingStockValue = 0;

        data?.forEach(area => {
            area?.Retailer?.forEach(retailer => {
                retailer?.Closing_Stock?.forEach(stock => {
                    totalClosingStockValue += stock?.Previous_Balance * stock?.Item_Rate;
                });
            });
        });

        return totalClosingStockValue;
    };

    return (
        <>
            <Card>
                <div className="p-3 pb-2 d-flex align-items-center justify-content-between border-bottom">
                    <h6 className="fa-18">Closing Stock Reports</h6>
                    <span className="fw-bold ">₹ {NumberFormat(overAllValue(stockValue))}</span>
                </div>
                <CardContent>
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    {['', 'SNo', 'Area', 'Products', 'Value'].map((o, i) => (
                                        <th key={i} className="border text-center fa-14">{o}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {stockValue?.map((o, i) => <AreaList key={i} sno={i + 1} o={o} />)}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}


export default StockReportAreaBased;