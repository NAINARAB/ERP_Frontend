import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { LocalDate } from '../../Components/functions';
import { useReactToPrint } from 'react-to-print';
import { Download } from '@mui/icons-material';

const PurchaseOrderPreviewTemplate = ({
    OrderDetails = {},
    OrderItemsArray = [],
    DeliveryArray = [],
    TranspoterArray = [],
    display = false,
    onCloseDialog
}) => {

    const [dialog, setDialog] = useState(false);
    const tdStyle = 'border fa-14 vctr';
    const printRef = useRef(null);

    useEffect(() => {
        setDialog(display ? true : false);
    }, [display])

    const closeDialog = () => {
        if (onCloseDialog) onCloseDialog();
        setDialog(false);
    }

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });

    return (
        <>
            <Dialog
                open={dialog}
                onClose={closeDialog} maxWidth='lg' fullWidth
            >
                <DialogTitle className='d-flex justify-content-between align-items-center flex-wrap'>
                    <span>Order Preview</span>
                    <span>
                        <Button
                            startIcon={<Download />}
                            variant='outlined'
                            onClick={handlePrint}
                        >
                            Download
                        </Button>
                    </span>
                </DialogTitle>
                <DialogContent ref={printRef}>
                    <div className="table-responsive">

                        <table className="table m-0">
                            <tbody>
                                <tr>
                                    <td className={tdStyle + ' text-primary fw-bold bg-light border-bottom-0'} >
                                        ORDER DETAILS
                                    </td>
                                    <td className={tdStyle + ' text-primary fw-bold bg-light '} >
                                        PARTY DETAILS
                                    </td>
                                </tr>
                                <tr>
                                    <td className={tdStyle + ' p-0 border-0'}>
                                        <table className="table m-0 ">
                                            <tbody>
                                                <tr>
                                                    <td className={tdStyle}>Loading Date</td>
                                                    <td className={tdStyle}>
                                                        {OrderDetails?.LoadingDate ? LocalDate(OrderDetails?.LoadingDate) : ''}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className={tdStyle}>Trade Confirm Date</td>
                                                    <td className={tdStyle}>
                                                        {OrderDetails?.TradeConfirmDate ? LocalDate(OrderDetails?.TradeConfirmDate) : ''}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className={tdStyle}>Owner Name</td>
                                                    <td className={tdStyle}>
                                                        {OrderDetails?.OwnerName}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className={tdStyle}>Broker Name</td>
                                                    <td className={tdStyle}>
                                                        {OrderDetails?.BrokerName}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </td>
                                    <td className={tdStyle + ' p-0 border-0 '}>

                                        <table className="table m-0 p-0">
                                            <tbody>
                                                <tr>
                                                    <td className={tdStyle}>
                                                        <h6 className='m-0'>Party Name: <br /> &emsp; {OrderDetails?.PartyName ?? '-'}</h6>
                                                    </td>
                                                    <td className={tdStyle}>
                                                        <h6 className='m-0'>Party Address: <br /> &emsp; {OrderDetails?.PartyAddress ?? '-'}</h6>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className={tdStyle}>
                                                        <h6 className='m-0'>Payment Condition: <br /> &emsp; {OrderDetails?.PaymentCondition ?? '-'}</h6>
                                                    </td>
                                                    <td className={tdStyle}>
                                                        <h6 className='m-0'>Remarks: <br /> &emsp; {OrderDetails?.Remarks ?? '-'}</h6>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        {/* <div className="d-flex flex-wrap bg-white">
                                            <span className='flex-grow-1 p-2'>
                                                <h6>Party Name: {OrderDetails?.PartyName}</h6>
                                                <h6>Party Address: {OrderDetails?.PartyAddress}</h6>
                                            </span>

                                            <span className='p-2'>
                                                <h6>Payment Condition: {OrderDetails?.PaymentCondition}</h6>
                                                <h6>Remarks: {OrderDetails?.Remarks}</h6>
                                            </span>
                                        </div> */}
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <table className="table m-0">
                            <thead>
                                <tr>
                                    <td className={tdStyle + ' text-primary fw-bold bg-light border-top-0'} colSpan={7}>
                                        ORDER ITEMS
                                    </td>
                                </tr>
                                <tr>
                                    <th className={tdStyle + ' text-center'}>SNo</th>
                                    <th className={tdStyle + ' text-center'}>Item Name</th>
                                    <th className={tdStyle + ' text-center'}>Tonnage</th>
                                    <th className={tdStyle + ' text-center'}>
                                        Rate <br />
                                        Deliver/Spot
                                    </th>
                                    <th className={tdStyle + ' text-center'}>Discount</th>
                                    <th className={tdStyle + ' text-center'}>Quality Condition</th>
                                </tr>
                            </thead>

                            <tbody>
                                {OrderItemsArray.map((o, i) => (
                                    <tr key={i}>
                                        <td className={tdStyle}>{i + 1}</td>
                                        <td className={tdStyle}>{o?.ItemName}</td>
                                        <td className={tdStyle}>{o?.Weight + ' ' + o?.Units}</td>
                                        <td className={tdStyle}>{o?.Rate}</td>
                                        <td className={tdStyle}>{o?.Discount}</td>
                                        <td className={tdStyle}>{o?.QualityCondition}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <table className="table m-0">
                            <thead>
                                <tr>
                                    <td className={tdStyle + ' text-primary fw-bold bg-light border-top-0'} colSpan={11}>DELIVERY DETAILS</td>
                                </tr>
                                <tr>
                                    <th className={tdStyle + ' text-center'}>SNo</th>
                                    <th className={tdStyle + ' text-center'}>Location</th>
                                    <th className={tdStyle + ' text-center'}>Arrival Date</th>
                                    <th className={tdStyle + ' text-center'}>Item Name</th>
                                    <th className={tdStyle + ' text-center'}>Concern</th>

                                    <th className={tdStyle + ' text-center'}>Bill No</th>
                                    <th className={tdStyle + ' text-center'}>Bill Date</th>
                                    <th className={tdStyle + ' text-center'}>Quantity</th>
                                    <th className={tdStyle + ' text-center'}>Tonnage / KGs</th>
                                    <th className={tdStyle + ' text-center'}>Batch / Location</th>

                                    <th className={tdStyle + ' text-center'}>Pending Quantity</th>
                                </tr>
                            </thead>

                            <tbody>
                                {DeliveryArray.map((o, i) => (
                                    <tr key={i}>
                                        <td className={tdStyle}>{i + 1}</td>
                                        <td className={tdStyle}>{o?.Location}</td>
                                        <td className={tdStyle}>{o?.ArrivalDate ? LocalDate(o?.ArrivalDate) : ''}</td>
                                        <td className={tdStyle}>{o?.ItemName}</td>
                                        <td className={tdStyle}>{o?.Concern}</td>

                                        <td className={tdStyle}>{o?.BillNo}</td>
                                        <td className={tdStyle}>{o?.BillDate ? LocalDate(o?.BillDate) : ''}</td>
                                        <td className={tdStyle}>{o?.Quantity}</td>
                                        <td className={tdStyle}>{o?.Weight + ' ' + o?.Units}</td>
                                        <td className={tdStyle}>{o?.BatchLocation}</td>

                                        <td className={tdStyle}>{o?.PendingQuantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <table className="table m-0">
                            <thead>
                                <tr>
                                    <td className={tdStyle + ' text-primary fw-bold bg-light border-top-0'} colSpan={9}>
                                        OTHER DETAILS
                                    </td>
                                </tr>
                                <tr>
                                    <th className={tdStyle + ' text-center'} rowSpan={2}>SNo</th>
                                    <th className={tdStyle + ' text-center'} colSpan={2}>Loading Wt</th>
                                    <th className={tdStyle + ' text-center'} colSpan={2}>Unloading Wt</th>
                                    <th className={tdStyle + ' text-center'}>Weight</th>
                                    <th className={tdStyle + ' text-center'} colSpan={3}>Transport Details</th>
                                </tr>
                                <tr>
                                    <th className={tdStyle + ' text-center'}>Load</th>
                                    <th className={tdStyle + ' text-center'}>Empty</th>
                                    <th className={tdStyle + ' text-center'}>Load</th>
                                    <th className={tdStyle + ' text-center'}>Empty</th>
                                    <th className={tdStyle + ' text-center'}>EX / SH</th>
                                    <th className={tdStyle + ' text-center'}>Name</th>
                                    <th className={tdStyle + ' text-center'}>Vehicle No</th>
                                    <th className={tdStyle + ' text-center'}>Phone Number</th>
                                </tr>
                            </thead>

                            <tbody>
                                {TranspoterArray.map((o, i) => (
                                    <tr key={i}>
                                        <td className={tdStyle}>{i + 1}</td>
                                        <td className={tdStyle}>{o?.Loading_Load}</td>
                                        <td className={tdStyle}>{o?.Loading_Empty}</td>
                                        <td className={tdStyle}>{o?.Unloading_Load}</td>
                                        <td className={tdStyle}>{o?.Unloading_Empty}</td>
                                        <td className={tdStyle}>{o?.EX_SH}</td>
                                        <td className={tdStyle}>{o?.DriverName}</td>
                                        <td className={tdStyle}>{o?.VehicleNo}</td>
                                        <td className={tdStyle}>{o?.PhoneNumber}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default PurchaseOrderPreviewTemplate;