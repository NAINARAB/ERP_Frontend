import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, Button, DialogActions } from '@mui/material';
import { Close, Download, Save } from '@mui/icons-material';
import { isEqualNumber, isGraterNumber, LocalDate, NumberFormat, numberToWords } from '../../Components/functions';
import { useReactToPrint } from 'react-to-print';
import { fetchLink } from '../../Components/fetchComponent';

const InvoiceBillTemplate = (props) => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const { orderDetails, orderProducts, postFun, download } = props;
    const [open, setOpen] = useState(false);
    const [products, setProducts] = useState([]);
    const [retailerInfo, setRetailerInfo] = useState({});
    const [companyInfo, setCompanyInfo] = useState({});
    const printRef = useRef(null)

    useEffect(() => {
        fetchLink({
            address: `masters/products?Company_Id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setProducts(data.data)
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/company?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setCompanyInfo(data?.data[0] ? data?.data[0] : {})
            }
        }).catch(e => console.error(e))
            
    }, [storage?.Company_id])

    useEffect(() => {
        if (orderDetails?.Retailer_Id) {
            fetchLink({
                address: `masters/retailers/info?Retailer_Id=${orderDetails?.Retailer_Id}`
            }).then(data => {
                if (data.success) {
                    setRetailerInfo(data?.data[0] ? data?.data[0] : {})
                }
            }).catch(e => console.error(e))
        }
    }, [orderDetails?.Retailer_Id])

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const includedProducts = products.filter(product => {
        return orderProducts?.some(orderProduct => isEqualNumber(orderProduct?.Item_Id, product?.Product_Id) && isGraterNumber(orderProduct?.Bill_Qty, 0));
    });

    const total = includedProducts.reduce((total, o) => {
        const quantity = orderProducts?.find(oo => isEqualNumber(oo?.Item_Id, o?.Product_Id))?.Bill_Qty || 0;
        return total + (quantity * o?.Item_Rate);
    }, 0)

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    return (
        <>
            <span onClick={handleOpen}>{props.children}</span>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth='lg'>

                <DialogTitle>Order Preview</DialogTitle>

                <DialogContent ref={printRef}>
                    <h3 className='text-center mb-2'>Sale Order</h3>
                    <div className="table-responsive">
                        <table className="table mb-0">
                            <tbody>
                                <tr>
                                    <td className='border border-bottom-0 border-end-0'>
                                        <p className='fa-14'>
                                            <span className='fw-bold'>{companyInfo?.Company_Name}</span> <br />
                                            {companyInfo?.Region} - {companyInfo?.State} - {companyInfo?.Pincode} <br />
                                            {companyInfo?.Company_Address}
                                        </p>
                                    </td>
                                    <td className='border border-bottom-0 border-start-0 fa-14 p-1'>
                                        <table className='table mb-0'>
                                            <tbody>
                                                <tr>
                                                    <td className='border-0 p-1'>GST</td>
                                                    <td className='border-0 p-1'>{companyInfo?.Gst_Number ? companyInfo?.Gst_Number : ' - '}</td>
                                                </tr>
                                                <tr>
                                                    <td className='border-0 p-1'>Account No</td>
                                                    <td className='border-0 p-1'>{companyInfo?.Account_Number ? companyInfo?.Account_Number : ' - '}</td>
                                                </tr>
                                                <tr>
                                                    <td className='border-0 p-1'>IFSC</td>
                                                    <td className='border-0 p-1'>{companyInfo?.IFC_Code ? companyInfo?.IFC_Code : ' - '}</td>
                                                </tr>
                                                <tr>
                                                    <td className='border-0 p-1'>Bank</td>
                                                    <td className='border-0 p-1'>{companyInfo?.Bank_Name ? companyInfo?.Bank_Name : ' - '}</td>
                                                </tr>
                                            </tbody>
                                        </table>

                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="table-responsive">
                        <table className="table mb-0">
                            <tbody>
                                <tr>
                                    <td className='border'>
                                        <p className='fa-14'>
                                            <span className='fw-bold'>{retailerInfo?.Retailer_Name}</span> <br />
                                            {retailerInfo?.Mobile_No} <br />
                                            {retailerInfo?.Reatailer_Address}
                                        </p>
                                    </td>
                                    <td className='border fa-14'>
                                        Date: {LocalDate(orderDetails?.So_Date)} <br />
                                        {orderDetails?.Order_Id && <><span>Order ID: {orderDetails?.Order_Id}</span><br /></>}
                                        Order taken by: {orderDetails?.Sales_Person_Name}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="table-responsive">
                        <table className="table">

                            <thead>
                                <tr>
                                    <td className='border text-white theme-bg fa-14'>Sno</td>
                                    <td className='border text-white theme-bg fa-14'>Product</td>
                                    <td className='border text-white theme-bg fa-14 text-end'>Quantity</td>
                                    <td className='border text-white theme-bg fa-14 text-end'>Rate</td>
                                    <td className='border text-white theme-bg fa-14 text-end'>Amount</td>
                                </tr>
                            </thead>
                            <tbody>

                                {includedProducts.map((o, i) => {
                                    const quantity = orderProducts?.find(oo => isEqualNumber(oo?.Item_Id, o?.Product_Id))?.Bill_Qty || 0;
                                    const amount = quantity * o?.Item_Rate;
                                    return (
                                        <tr key={i}>
                                            <td className='border fa-13'>{i + 1}</td>
                                            <td className='border fa-13'>{o?.Product_Name}</td>
                                            <td className='border fa-13 text-end'>{NumberFormat(quantity)}</td>
                                            <td className='border fa-13 text-end'>{NumberFormat(o?.Item_Rate)}</td>
                                            <td className='border fa-13 text-end'>{NumberFormat(amount)}</td>
                                        </tr>
                                    );
                                })}

                                <tr>
                                    <td className='border' rowSpan={2} colSpan={3}>
                                        {numberToWords(total)} Only.
                                    </td>
                                    <td className='text-end fa-14'>Total</td>
                                    <td className='border text-end fw-bold'>
                                        {NumberFormat(total)}
                                    </td>
                                </tr>

                                {/* <tr>
                                    <td className='text-end fa-14'>SGST @ 6%</td>
                                    <td className='border text-end fa-14'>
                                        {NumberFormat((subTotal / 100) * 6)}
                                    </td>
                                </tr>

                                <tr>
                                    <td className='text-end fa-14'>CGST @ 6%</td>
                                    <td className='border text-end fa-14'>
                                        {NumberFormat((subTotal / 100) * 6)}
                                    </td>
                                </tr> */}

                                {/* <tr>
                                    <td className='border text-end'>Total</td>
                                    <td className='border text-end fw-bold' >{NumberFormat(((subTotal / 100) * 12) + subTotal)}</td>
                                </tr> */}

                            </tbody>
                        </table>
                    </div>

                </DialogContent>

                <DialogActions>
                    <Button startIcon={<Close />} variant='outlined' color='error' onClick={handleClose}>
                        Close
                    </Button>
                    {download && (
                        <Button
                            startIcon={<Download />}
                            variant='outlined'
                            onClick={handlePrint}
                        >
                            Download
                        </Button>
                    )}
                    {postFun && (
                        <Button
                            startIcon={<Save />}
                            variant='contained'
                            color='success'
                            onClick={() => {
                                postFun();
                                handleClose();
                            }}
                        >
                            Submit
                        </Button>
                    )}
                </DialogActions>

            </Dialog>
        </>
    )
}

export default InvoiceBillTemplate;