import { useEffect, useState } from "react";
import { fetchLink } from '../../Components/fetchComponent';
import { getSessionUser, ISOString } from "../../Components/functions";
import FilterableTable from '../../Components/filterableTable';

const TallyStockJournalList = ({ loadingOn, loadingOff }) => {
    const user = getSessionUser().user;
    const [sJournalData, setSJournalData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        refresh: false,
    })

    useEffect(() => {
        fetchLink({
            address: `inventory/getTallyStockJournal?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`,
            headers: {
                "Db": user?.Company_id
            }
        }).then(data => {
            if (data.success) {
                setSJournalData(data.data);
            }
        }).catch(e => console.error(e))
    }, [filters])

    return (
        <>
            <FilterableTable 
                dataArray={[]}
            />
        </>
    )
}

export default TallyStockJournalList;