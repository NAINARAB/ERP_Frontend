import { useEffect, useState } from "react";
import { ISOString, LocalDate, UTCDateWithTime, UTCTime } from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";

const LastSynedTime = () => {
    const parseData = JSON.parse(localStorage.getItem("user"));
    const isAdmin = Number(parseData?.UserTypeId) === 0 || Number(parseData?.UserTypeId) === 1;
    const [lastSyncedTime, setLastSynedTime] = useState({
        Last_Sync_Date_Time: null,
        lastSalesSync: null
    })

    useEffect(() => {
        if (isAdmin) {
            fetchLink({
                address: `dashboard/lastSyncedTime`,
                headers: {
                    'Db': parseData?.Company_id
                }
            }).then(data => {
                if (data.success) {
                    const tally = data?.data[0]?.Last_Sync_Date_Time ? new Date(data?.data[0]?.Last_Sync_Date_Time) : null;
                    const sales = data?.data[0]?.lastSalesSync ? new Date(data?.data[0]?.lastSalesSync) : null;
                    setLastSynedTime({
                        Last_Sync_Date_Time: tally,
                        lastSalesSync: sales
                    })
                }
            })
        }
    }, [isAdmin, parseData?.Company_id])

    return (
        <>
            {/* <span className="fa-14 px-2 py-1 bg-white rounded border"> Sync: </span> */}
            <div className="d-flex">
                <div className="rounded-3 overflow-hidden border p-0">
                    <table className="table table-borderless w-auto m-0 fa-14 ">
                        <tbody>
                            <tr>
                                <td className="px-2 py-1 border-bottom">Tally Sync</td>
                                <td className="px-2 py-1 border-bottom">{
                                    lastSyncedTime.Last_Sync_Date_Time
                                        ? LocalDate(UTCDateWithTime(lastSyncedTime.Last_Sync_Date_Time))
                                        + ', '
                                        + UTCTime(lastSyncedTime.Last_Sync_Date_Time)
                                        : '-'}
                                </td>
                            </tr>
                            <tr>
                                <td className="px-2 py-1">Sales Sync</td>
                                <td className="px-2 py-1">{
                                    lastSyncedTime.lastSalesSync
                                        ? LocalDate(UTCDateWithTime(lastSyncedTime.lastSalesSync))
                                        + ', '
                                        + UTCTime(lastSyncedTime.lastSalesSync)
                                        : '-'}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default LastSynedTime;