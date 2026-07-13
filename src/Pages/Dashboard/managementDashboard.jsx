import { useEffect, useState } from "react"
import { Addition, ISOString, NumberFormat, stringCompare, toArray } from "../../Components/functions";
import {
    Assignment, AssignmentTurnedIn, AttachMoney, CompareArrows,
    Inventory2, MenuBook, Paid, ReceiptLong, RequestQuote,
    Sync
} from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import { IconButton } from "@mui/material";


const moduleIcons = [
    { actualName: 'SaleOrder', str: 'SALE ORDER', icon: <Assignment style={{ fontSize: '80px' }} />, orderBy: 2 },
    { actualName: 'SalesInvoice', str: 'SALES INVOICE', icon: <ReceiptLong style={{ fontSize: '80px' }} />, orderBy: 3 },
    { actualName: 'PurchaseOrder', str: 'PURCHASE ORDER', icon: <AssignmentTurnedIn style={{ fontSize: '80px' }} />, orderBy: 4 },
    { actualName: 'PurchaseInvoice', str: 'PURCHASE INVOICE', icon: <RequestQuote style={{ fontSize: '80px' }} />, orderBy: 5 },
    { actualName: 'Payment', str: 'PAYMENT', icon: <Paid style={{ fontSize: '80px' }} />, orderBy: 7 },
    { actualName: 'Receipt', str: 'RECEIPT', icon: <AttachMoney style={{ fontSize: '80px' }} />, orderBy: 8 },
    { actualName: 'Journal', str: 'JOURNAL', icon: <MenuBook style={{ fontSize: '80px' }} />, orderBy: 9 },
    { actualName: 'StockJournal', str: 'STOCK JOURNAL', icon: <Inventory2 style={{ fontSize: '80px' }} />, orderBy: 10 },
    { actualName: 'Contra', str: 'CONTRA', icon: <CompareArrows style={{ fontSize: '80px' }} />, orderBy: 11 },
];

const ManagementDashboard = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const UserAccess = Number(storage?.UserTypeId) === 2 || Number(storage?.UserTypeId) === 0 || Number(storage?.UserTypeId) === 1;
    const [dayBookData, setDayBookData] = useState([]);

    const cls = 'vctr text-white bg-transparent p-0';

    const [filter, setFilter] = useState({
        date: ISOString(),
        reload: false,
    });

    useEffect(() => {
        if (UserAccess && storage.Company_id) {
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
            }).catch(e => console.error(e));
        }
    }, [filter.reload])

    return UserAccess && (
        <>
            <div className="d-flex align-items-center flex-wrap ">
                <input
                    type="date"
                    className="cus-inpt w-auto m-1"
                    value={filter.date}
                    onChange={e => setFilter(pre => ({ ...pre, date: e.target.value }))}
                />
                <IconButton
                    size="small"
                    onClick={() => setFilter(pre => ({ ...pre, reload: !pre.reload }))}
                ><Sync /></IconButton>
            </div>

            <div className="p-1 row">
                {moduleIcons.map((iconData, i) => {
                    const o = dayBookData.find(entry => entry.ModuleName === iconData.actualName) || {
                        ModuleName: iconData.actualName,
                        groupedData: []
                    };

                    const grouped = toArray(o.groupedData);
                    const erpData = grouped.filter(mod => stringCompare(mod.dataSource, 'ERP'));

                    const erpTotal = erpData.reduce((acc, item) => Addition(acc, item?.Amount || 0), 0);
                    const erpCount = erpData.reduce((acc, item) => Addition(acc, item?.VoucherBreakUpCount || 0), 0);

                    return (
                        <div className="col-xxl-3 col-lg-4 col-md-6 col-sm-12 p-2" key={iconData.actualName}>
                            <div className={"coloredDiv d-flex align-items-center text-light cus-shadow coloredDiv" + (i + 7)}>
                                <div className="flex-grow-1 p-3 table-responsive">
                                    <h5 style={{ fontSize: '18px' }}>{iconData.str}</h5>
                                    <table className="table table-borderless text-white">
                                        <tbody>
                                            <tr>
                                                <td className={`${cls} text-end`}>
                                                    <span className="fa-19 me-1">{NumberFormat(parseInt(erpTotal))}</span>
                                                    <span className="fa-11">/ {NumberFormat(parseInt(erpCount))}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                {iconData.icon}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    )
}

export default ManagementDashboard;