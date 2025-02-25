import { useEffect, useState } from "react";
import { UTCDateWithTime } from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";

const LastSynedTime = () => {
    const parseData = JSON.parse(localStorage.getItem("user"));
    const isAdmin = Number(parseData?.UserTypeId) === 0 || Number(parseData?.UserTypeId) === 1;
    const [lastSyncedTime, setLastSynedTime] = useState(null)

    useEffect(() => {
        if (isAdmin) {
            fetchLink({
                address: `dashboard/lastSyncedTime`,
                headers: {
                    'Db': parseData?.Company_id
                }
            }).then(data => {
                if (data.success) {
                    const dateTime = data?.data[0]?.Last_Sync_Date_Time ? new Date(data?.data[0]?.Last_Sync_Date_Time) : null;
                    setLastSynedTime(dateTime)
                }
            })
        }
    }, [isAdmin, parseData?.Company_id])

    return (
        <>
            <span className="fa-14 px-2 py-1 bg-white rounded border"> Sync: {lastSyncedTime ? UTCDateWithTime(lastSyncedTime) : '-'}</span>
        </>
    )
}

export default LastSynedTime;