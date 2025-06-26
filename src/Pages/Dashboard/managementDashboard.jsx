import { useEffect, useState } from "react"
import { Addition, checkIsNumber, groupData, ISOString, NumberFormat, stringCompare, toArray } from "../../Components/functions";
import { Assignment, AssignmentTurnedIn, AttachMoney, CompareArrows, Inventory2, MenuBook, Paid, ReceiptLong, RequestQuote, ShoppingCart } from "@mui/icons-material";
import { LuArrowUpWideNarrow } from "react-icons/lu";
import { HiOutlineCurrencyRupee } from "react-icons/hi";
import { IoReceiptOutline } from "react-icons/io5";
import { BsCartPlus } from "react-icons/bs";
import { PiHandCoinsFill } from "react-icons/pi";
import { FaCubesStacked } from "react-icons/fa6";
import { fetchLink } from "../../Components/fetchComponent";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import FilterableTable, { createCol } from '../../Components/filterableTable2';

const getIcons = (str) => {
    const iconArr = [
        {
            str: 'PURCHASE ORDER',
            actualName: 'PurchaseOrder',
            icon: <AssignmentTurnedIn style={{ fontSize: '80px' }} />,
        },
        {
            str: 'PURCHASE INVOICE',
            actualName: 'PurchaseInvoice',
            icon: <RequestQuote style={{ fontSize: '80px' }} />,
        },
        {
            str: 'SALE ORDER',
            actualName: 'SaleOrder',
            icon: <Assignment style={{ fontSize: '80px' }} />,
        },
        {
            str: 'SALES INVOICE',
            actualName: 'SalesInvoice',
            icon: <ReceiptLong style={{ fontSize: '80px' }} />,
        },
        {
            str: 'PAYMENT',
            actualName: 'Payment',
            icon: <Paid style={{ fontSize: '80px' }} />,
        },
        {
            str: 'RECEIPT',
            actualName: 'Receipt',
            icon: <AttachMoney style={{ fontSize: '80px' }} />,
        },
        {
            str: 'JOURNAL',
            actualName: 'Journal',
            icon: <MenuBook style={{ fontSize: '80px' }} />,
        },
        {
            str: 'STOCK JOURNAL',
            actualName: 'StockJournal',
            icon: <Inventory2 style={{ fontSize: '80px' }} />,
        },
        {
            str: 'CONTRA',
            actualName: 'Contra',
            icon: <CompareArrows style={{ fontSize: '80px' }} />,
        },
        {
            str: 'EXPENCES',
            actualName: 'FASDF',
            icon: <PiHandCoinsFill style={{ fontSize: '80px' }} />
        },
        {
            str: 'STOCK VALUE',
            actualName: 'ASDFASG',
            icon: <FaCubesStacked style={{ fontSize: '70px' }} />,
        },
    ]

    return iconArr.find(o => str === o.actualName)
}

const ManagementDashboard = ({ loadingOn, loadingOff }) => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const UserAccess = Number(storage?.UserTypeId) === 2 || Number(storage?.UserTypeId) === 0 || Number(storage?.UserTypeId) === 1;
    const [dayBookData, setDayBookData] = useState([]);

    const cls = 'vctr text-white bg-transparent p-0';

    const [popUpDetails, setPopUpDetails] = useState({
        salesDetails: [],
        erpPurchaseCount: 0,
        erpPurchaseAmount: 0,
        tallyPurchaseCount: 0,
        tallyPurchaseAmount: 0,
        morePurchaseInfo: [],
    });

    const [popUpDialogs, setPopUpDialogs] = useState({
        salesDetails: false,
        purchaseDetails: false,
        purchaseMoreDetails: false,
    })

    const [filter, setFilter] = useState({
        date: ISOString(),
    });

    useEffect(() => {
        if (UserAccess && storage.Company_id) {
            if (loadingOn) loadingOn();
            setDayBookData([]);

            fetchLink({
                address: `dashboard/dayBook?Fromdate=${filter.date}&Todate=${filter.date}`,
                headers: {
                    "Db": storage.Company_id
                }
            }).then(data => {
                if (data.success) {
                    setDayBookData(data.data);
                }
            }).finally(() => {
                if (loadingOff) loadingOff();
            }).catch(e => console.error(e));

        }
    }, [filter.date])

    const closeDialog = () => {
        setPopUpDialogs(pre => Object.fromEntries(
            Object.entries(pre).map(([key, value]) => [key, false])
        ));
        setPopUpDetails(pre => ({ ...pre, morePurchaseInfo: [] }))
    }

    const fetchMorePurchaseDetails = () => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `dashboard/purchaseInfo/moreInfo?Fromdate=${filter?.date}&Todate=${filter?.date}`,
        }).then(data => {
            if (data.success) {
                setPopUpDetails(pre => ({
                    ...pre,
                    morePurchaseInfo: data.data ?? []
                }));
                setPopUpDialogs(pre => ({ ...pre, purchaseMoreDetails: true }));
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        })
    }

    const salesDetailsGrouped = groupData(popUpDetails?.salesDetails, 'Party_Group');

    return (
        <>
            <div className="d-flex align-items-center flex-wrap justify-content-between">
                <input
                    type="date"
                    className="cus-inpt w-auto m-1"
                    value={filter.date}
                    onChange={e => setFilter(pre => ({ ...pre, date: e.target.value }))}
                />
            </div>

            <div className="p-1 row">
                {dayBookData?.map((o, i) => (
                    <div className={`col-xxl-3 col-lg-4 col-md-6 col-sm-12 p-2`} key={i}>
                        <div className={"coloredDiv d-flex align-items-center text-light cus-shadow coloredDiv" + (i + 7)}>
                            <div className="flex-grow-1 p-3 table-responsive">
                                <h5 style={{ fontSize: '18px' }}>{o?.ModuleName ? getIcons(o?.ModuleName).str : undefined}</h5>

                                <table className="table table-borderless text-white">
                                    <tbody>
                                        <tr>
                                            <td className={`${cls} fa-13`}>ERP</td>
                                            <td className={`${cls} text-end`}>
                                                <span className="fa-19 me-1">
                                                    {NumberFormat(toArray(o?.groupedData).filter(
                                                        mod => stringCompare(mod.dataSource, 'ERP')
                                                    ).reduce(
                                                        (acc, item) => Addition(acc, item?.Amount), 0
                                                    ))}
                                                </span>
                                                <span className="fa-11">
                                                    / {NumberFormat(toArray(o?.groupedData).filter(
                                                        mod => stringCompare(mod.dataSource, 'ERP')
                                                    ).reduce(
                                                        (acc, item) => Addition(acc, item?.VoucherBreakUpCount), 0
                                                    ))}
                                                </span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className={`${cls} fa-13`}>TALLY</td>
                                            <td className={`${cls} text-end`}>
                                                <span className="fa-19 me-1">
                                                    {NumberFormat(toArray(o?.groupedData).filter(
                                                        mod => stringCompare(mod.dataSource, 'TALLY')
                                                    ).reduce(
                                                        (acc, item) => Addition(acc, item?.Amount), 0
                                                    ))}
                                                </span>
                                                <span className="fa-11">
                                                    / {NumberFormat(toArray(o?.groupedData).filter(
                                                        mod => stringCompare(mod.dataSource, 'TALLY')
                                                    ).reduce(
                                                        (acc, item) => Addition(acc, item?.VoucherBreakUpCount), 0
                                                    ))}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            {o?.ModuleName ? getIcons(o?.ModuleName).icon : ''}
                        </div>
                    </div>
                ))}
            </div>

            <Dialog
                open={popUpDialogs.salesDetails}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>
                    <span>
                        <h4 className='d-flex justify-content-between flex-wrap'>
                            <span>Sales Details</span>
                            <span>
                                {NumberFormat(
                                    popUpDetails?.salesDetails?.reduce((sum, item) => sum += Number(item?.Amount), 0)
                                )}
                            </span>
                        </h4>
                    </span>
                </DialogTitle>
                <DialogContent>
                    <FilterableTable
                        dataArray={salesDetailsGrouped}
                        columns={[
                            {
                                Field_Name: 'Party_Group',
                                Fied_Data: 'string',
                                isVisible: 1,
                            },
                            {
                                isCustomCell: true,
                                ColumnHeader: 'Total Amount',
                                Cell: ({ row }) => NumberFormat(row?.groupedData?.reduce((acc, item) => acc + Number(item?.Amount), 0)),
                                isVisible: 1,
                            },
                        ]}
                        disablePagination={true}
                        EnableSerialNumber
                        isExpendable={true}
                        expandableComp={({ row }) => (
                            <FilterableTable
                                dataArray={row?.groupedData ?? []}
                                columns={[
                                    {
                                        Field_Name: 'Payment_Mode',
                                        Fied_Data: 'string',
                                        isVisible: 1,
                                    },
                                    {
                                        Field_Name: 'Amount',
                                        Fied_Data: 'number',
                                        isVisible: 1,
                                    },
                                ]}
                                disablePagination={true}
                            />
                        )}
                    />

                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPopUpDialogs(pre => ({ ...pre, salesDetails: false }))}></Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={popUpDialogs.purchaseDetails}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>
                    <span>
                        <h4 className='d-flex flex-wrap'>
                            <span className="flex-grow-1">Purchase Details</span>
                        </h4>
                    </span>
                </DialogTitle>
                <DialogContent>
                    <table className="table">
                        <tbody>
                            <tr>
                                <td className="fa-14 border p-2 text-center fw-bold" colSpan={2}>ERP</td>
                            </tr>
                            <tr>
                                <td className="fa-14 border p-2 ">Count</td>
                                <td className="fa-14 border p-2 ">{NumberFormat(popUpDetails.erpPurchaseCount)}</td>
                            </tr>
                            <tr>
                                <td className="fa-14 border p-2 ">Amount</td>
                                <td className="fa-14 border p-2 ">{NumberFormat(popUpDetails.erpPurchaseAmount)}</td>
                            </tr>
                            <tr>
                                <td className="fa-14 border p-2 text-center fw-bold" colSpan={2}>Tally</td>
                            </tr>
                            <tr>
                                <td className="fa-14 border p-2 ">Count</td>
                                <td className="fa-14 border p-2 ">{NumberFormat(popUpDetails.tallyPurchaseCount)}</td>
                            </tr>
                            <tr>
                                <td className="fa-14 border p-2 ">Amount</td>
                                <td className="fa-14 border p-2 ">{NumberFormat(popUpDetails.tallyPurchaseAmount)}</td>
                            </tr>
                        </tbody>
                    </table>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>close</Button>
                    <Button
                        variant="outlined"
                        onClick={fetchMorePurchaseDetails}
                    >View More</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={popUpDialogs.purchaseMoreDetails}
                onClose={closeDialog}
                fullWidth maxWidth='lg'
            >
                <DialogContent>
                    <FilterableTable
                        dataArray={popUpDetails?.morePurchaseInfo || []}
                        title="Purchase Details"
                        columns={[
                            createCol('invoice_no', 'string', 'Invoice No'),
                            createCol('reference_no', 'string', 'Ref No'),
                            createCol('invoice_date', 'date', 'Date'),
                            createCol('ledger_name', 'string', 'Ledger Name'),
                            createCol('voucher_name', 'string', 'Voucher Name'),
                            createCol('total_invoice_value', 'number', 'Invoice Value'),
                        ]}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ManagementDashboard;