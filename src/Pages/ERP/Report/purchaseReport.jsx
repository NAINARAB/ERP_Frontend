import React, { useEffect, useState } from "react";
import { Add, Remove } from '@mui/icons-material';
import { Card, CardContent } from "@mui/material";
import { firstDayOfMonth, ISOString } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";


const calcTotal = (arr, column) => {
    let total = 0;
    if (Array.isArray(arr)) {
        arr.forEach(ob => {
            total += Number(ob[column])
        })
    }
    return total
}

const PurchaseReport = () => {
    const storage = JSON.parse(localStorage.getItem("user"));
    const [PurchaseData, setPurchaseData] = useState([]);

    const [selectedValue, setSelectedValue] = useState({
        Report_Type: 2,
        Fromdate: firstDayOfMonth(),
        Todate: ISOString(),
        Report: 'PENDING PURCHASE ORDER'
    });

    useEffect(() => {
        setPurchaseData([]);
        if (storage?.Company_id) {
            fetchLink({
                address: `reports/PurchaseOrderReportCard?Report_Type=${selectedValue.Report_Type}&Fromdate=${selectedValue.Fromdate}&Todate=${selectedValue.Todate}`,
                headers: {
                    'Db': storage?.Company_id
                },
            }).then(data => {
                if (data.success) {
                    data.data.sort((a, b) => new Date(b.po_date) - new Date(a.po_date));
                    setPurchaseData(data.data)
                }
            }).catch(e => console.error(e))
        }

    }, [selectedValue.Report_Type, selectedValue.Fromdate, selectedValue.Todate])

    const DispRows = ({ rowData }) => {
        const [open, setOpen] = useState(false);

        const totalTonnage = rowData?.product_details?.reduce(
            (acc, item) => acc + item?.product_details_1?.reduce((subAcc, subItem) => subAcc + subItem?.bill_qty, 0),
            0
        );

        const totalValue = rowData?.product_details?.reduce(
            (acc, item) => acc + item?.product_details_1?.reduce((subAcc, subItem) => subAcc + subItem?.amount, 0),
            0
        );

        return rowData?.product_details?.length > 0 && (
            <>
                <tr>
                    <td className="fa-12">
                        <button onClick={() => setOpen(!open)} className="icon-btn">
                            {open ? <Remove sx={{ fontSize: 'inherit' }} /> : <Add sx={{ fontSize: 'inherit' }} />}
                        </button>
                    </td>
                    <td className="text-success fa-12 fw-bold bg-light">{rowData?.Stock_Group}</td>
                    <td className="text-success fa-12">-</td>
                    <td className="text-success fa-12 bg-light fw-bold">
                        {(totalTonnage / 1000)?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-success fa-12 fw-bold">
                        {(totalValue / totalTonnage).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-success fa-12 bg-light fw-bold">
                        {totalValue?.toLocaleString('en-IN')}
                    </td>
                </tr>
                {open && rowData.product_details.map((o, i) => <SubRows subRowData={o} key={i} />)}
            </>
        )
    }

    const SubRows = ({ subRowData }) => {
        const [open, setOpen] = useState(false);
        const tonnage = calcTotal(subRowData?.product_details_1, 'bill_qty');
        const amount = calcTotal(subRowData?.product_details_1, 'amount')

        return subRowData?.product_details_1?.length > 0 && (
            <>
                <tr>
                    <td style={{ fontSize: '12px' }} className="text-primary"></td>
                    <td style={{ fontSize: '12px' }} className="text-primary bg-light">
                        <button onClick={() => setOpen(!open)} className="icon-btn">
                            {open ? <Remove sx={{ fontSize: 'inherit' }} /> : <Add sx={{ fontSize: 'inherit' }} />}
                        </button>
                    </td>
                    <td style={{ fontSize: '12px' }} className="text-primary">{subRowData?.Item_Name_Modified} (Sum)</td>
                    <td style={{ fontSize: '12px' }} className="text-primary bg-light fw-bold">
                        {(tonnage / 1000).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '12px' }} className="text-primary fw-bold">
                        {(Number(amount) / Number(tonnage)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ fontSize: '12px' }} className="text-primary bg-light fw-bold">{amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                </tr>
                {open && subRowData?.product_details_1?.map((o, i) => (
                    <tr key={i}>
                        <td style={{ fontSize: '12px' }}>{o?.po_no}</td>
                        <td style={{ fontSize: '12px' }} className="bg-light">{new Date(o?.po_date).toLocaleDateString('en-IN')}</td>
                        <td style={{ fontSize: '12px' }}>{o?.ledger_name}</td>
                        <td style={{ fontSize: '12px' }} className="bg-light fw-bold">{o?.bill_qty.toLocaleString('en-IN') + " " + o?.bill_unit}</td>
                        <td style={{ fontSize: '12px' }} className=" fw-bold">{o?.item_rate.toLocaleString('en-IN')}</td>
                        <td style={{ fontSize: '12px' }} className="bg-light fw-bold">{o?.amount.toLocaleString('en-IN')}</td>
                    </tr>
                ))}
            </>
        )
    }

    const OrderValue = ({ row }) => {
        const [open, setOpen] = useState(false);

        return (
            <>
                <tr>
                    <td>
                        <button onClick={() => setOpen(!open)} className="icon-btn">
                            {open ? <Remove sx={{ fontSize: 'inherit' }} /> : <Add sx={{ fontSize: 'inherit' }} />}
                        </button>
                    </td>
                    <td style={{ fontSize: '12px' }}>{row?.ledger_name}</td>
                    <td style={{ fontSize: '12px' }}>{row?.Order_details?.length}</td>
                    <td style={{ fontSize: '12px' }} className="text-primary fw-bold">{calcTotal(row?.Order_details, 'total_invoice_value').toLocaleString('en-IN')}</td>
                </tr>
                {open &&
                    <tr>
                        <td colSpan={4} className="overflow-scroll">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{ fontSize: '14px' }}>PO No</th>
                                        <th style={{ fontSize: '14px' }}>Date</th>
                                        <th style={{ fontSize: '14px' }}>Order Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {row?.Order_details?.map((o, i) => (
                                        <tr key={i}>
                                            <td style={{ fontSize: '12px' }}>{o?.po_no}</td>
                                            <td style={{ fontSize: '12px' }}>{o?.po_date && new Date(o.po_date).toLocaleDateString('en-IN')}</td>
                                            <td style={{ fontSize: '12px' }}>{o?.total_invoice_value?.toLocaleString('en-IN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </td>
                    </tr>
                }
            </>
        )
    }

    const overAllTotal = () => {
        let tonnageTotal = 0;
        let total = 0;
        PurchaseData.forEach(o => {
            o?.product_details?.forEach(ob => {
                ob?.product_details_1.forEach(obj => {
                    tonnageTotal += Number(obj.bill_qty)
                    total += Number(obj.amount)
                })
            })
        })
        return {
            amount: parseInt(total).toLocaleString('en-IN'),
            tonage: parseInt(tonnageTotal).toLocaleString('en-IN')
        };
    }

    const OrderValueTotal = () => {
        let amountTotal = 0;
        PurchaseData.forEach(o => {
            o?.Order_details?.forEach(ob => {
                amountTotal += Number(ob?.total_invoice_value)
            })
        })
        return parseInt(amountTotal).toLocaleString('en-IN')
    }

    return (
        <>
            <Card>

                <div className="d-flex justify-content-between align-items-center px-3 py-2" style={{ backgroundColor: '#eae0cc' }}>

                    <div className="d-flex flex-column justify-content-center fw-bold text-dark">
                        {storage.Company_Name}
                        <span style={{ fontSize: '11px' }}>( {selectedValue.Report} )</span>
                    </div>

                    {/* <IconButton
                        aria-label="more"
                        id="long-button"
                        aria-controls={open ? 'long-menu' : undefined}
                        aria-expanded={open ? 'true' : undefined}
                        aria-haspopup="true"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                        <FilterAlt />
                    </IconButton> */}

                    <select
                        className="cus-inpt w-auto rounded-5 border-0"
                        onChange={(e) => {
                            const selectedIndex = e.target.selectedIndex;
                            const selectedText = e.target.options[selectedIndex].text;
                            setSelectedValue({
                                ...selectedValue,
                                Report_Type: Number(e.target.value),
                                Report: selectedText
                            });
                        }}
                        value={selectedValue.Report_Type}>
                        <option value={2}>PENDING PURCHASE ORDER</option>
                        <option value={0}>PURCHASE ORDER</option>
                        <option value={1}>PURCHASE</option>
                        <option value={3}>ORDER VALUE</option>
                    </select>

                </div>

                <div className="px-3 py-2 d-flex justify-content-between align-items-center">
                    {/* <p className="fa-14 fw-bold" >
                        <span className="text-primary fw-bold">{LocalDate(selectedValue.Fromdate)} </span>
                        -
                        <span className="text-primary fw-bold"> {LocalDate(selectedValue.Todate)}</span>
                    </p> */}
                    <div>
                        <input type={'date'} className='cus-inpt py-1 w-auto rounded-5'
                            value={selectedValue.Fromdate}
                            onChange={(e) => {
                                setSelectedValue({ ...selectedValue, Fromdate: e.target.value });
                            }} />
                        <input type={'date'} className='cus-inpt py-1 w-auto rounded-5'
                            value={selectedValue.Todate}
                            onChange={(e) => {
                                setSelectedValue({ ...selectedValue, Todate: e.target.value });
                            }} />
                    </div>
                    <p className="text-primary fw-bold fa-14 mb-0">
                        {Number(selectedValue.Report_Type) !== 3
                            ? " ( " + overAllTotal().tonage + " ) - ( " + overAllTotal().amount + " )"
                            : " " + OrderValueTotal()}
                    </p>
                </div>


                <CardContent style={{ maxHeight: '75vh' }} className="overflow-auto pt-0">
                    {Number(selectedValue.Report_Type) !== 3 ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    {['-', 'Stock Group', 'Item', 'Tonnage', 'Rate', 'Value (₹)'].map((o, i) => (
                                        <th className="tble-hed-stick fa-13 border" key={i}>{o}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PurchaseData.map((o, i) => <DispRows key={i} rowData={o} />)}
                            </tbody>
                        </table>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    {['SNo', 'Ledger', 'Order(s)', 'Amount'].map((o, i) => (
                                        <th className="tble-hed-stick fa-14 border" key={i}>{o}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {PurchaseData.map((o, i) => <OrderValue row={o} key={i} />)}
                            </tbody>
                        </table>
                    )}
                </CardContent>

            </Card>

{/* 
            <Menu
                id="long-menu"
                MenuListProps={{
                    'aria-labelledby': 'long-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={() => setAnchorEl(null)}
                PaperProps={{
                    style: {
                        maxHeight: ITEM_HEIGHT * 4.5,
                        width: '30ch',
                    },
                }}
            >
                <div className="p-2" style={{ outline: 'none', }}>
                    <label>Report Type</label>
                    <select
                        className="cus-inpt mb-2"
                        onChange={(e) => {
                            const selectedIndex = e.target.selectedIndex;
                            const selectedText = e.target.options[selectedIndex].text;
                            setSelectedValue({
                                ...selectedValue,
                                Report_Type: Number(e.target.value),
                                Report: selectedText
                            });
                        }}
                        value={selectedValue.Report_Type}>
                        <option value={2}>PENDING PURCHASE ORDER</option>
                        <option value={0}>PURCHASE ORDER</option>
                        <option value={1}>PURCHASE</option>
                        <option value={3}>ORDER VALUE</option>
                    </select>
                    <label>From Date</label>
                    <input type={'date'} className='cus-inpt mb-2'
                        value={selectedValue.Fromdate}
                        onChange={(e) => {
                            setSelectedValue({ ...selectedValue, Fromdate: e.target.value });
                        }} />
                    <label>To Date</label>
                    <input type={'date'} className='cus-inpt mb-2'
                        value={selectedValue.Todate}
                        onChange={(e) => {
                            setSelectedValue({ ...selectedValue, Todate: e.target.value });
                        }} />
                </div>
            </Menu> */}
        </>
    )
}

export default PurchaseReport;