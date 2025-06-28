import { useEffect, useState } from "react";
import { fetchLink } from '../../../Components/fetchComponent';
import { toArray } from "../../../../../ERP_Backend-main/helper_functions.mjs";


const ItemWiseStockReport = ({ loadingOn, loadingOff, Fromdate, Todate }) => {
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState();

    useEffect(() => {
        fetchLink({
            address: `reports/storageStock/itemWise?Fromdate=${Fromdate}&Todate=${Todate}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setReportData(toArray(data.data))
            }
        })
    }, [])

    return (
        <>

        </>
    )
}

export default ItemWiseStockReport;