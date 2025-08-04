import { useEffect } from "react";
import { useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { ISOString } from "../../../Components/functions";
import FilterableTable, { createCol } from '../../../Components/filterableTable2';
import { Dialog } from "@mui/material";
import { FilterAlt } from "@mui/icons-material";
import TableWrapper from "../../../Components/tableComp/TableWrapper";


const BatchListing = ({ loadingOn, loadingOff }) => {
    const [batchData, setBatchData] = useState([]);
    const [dateFilter, setDateFilter] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        FilterFromDate: ISOString(),
        FilterTodate: ISOString(),
        dateBased: false,
        filterDialog: false,
    })

    useEffect(() => {

        fetchLink({
            address: `inventory/batchMaster/stockBalance?
            Fromdate=${dateFilter.Fromdate}&
            Todate=${dateFilter.Todate}&
            dateBased=${dateFilter.dateBased}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) setBatchData(data.data);
            else setBatchData([]);
        }).catch(e => console.error(e))

    }, [dateFilter.Fromdate, dateFilter.Todate, dateFilter.dateBased]);

    return (
        <>

            <TableWrapper
                title="Batch Listing"
                EnableSerialNumber
                MenuButtons={[
                    {
                        name: 'Filters',
                        icon: <FilterAlt />,
                        onclick: () => setDateFilter(pre => ({ ...pre, filterDialog: true }))
                    },
                ]}
                maxHeightOption
                ExcelPrintOption
                dataArray={batchData}
                columns={[
                    createCol('trans_date', 'date', 'Date'),
                    createCol('batch', 'string', 'Batch'),
                    createCol('productNameGet', 'string', 'Product'),
                    createCol('godownName', 'string', 'Godown'),
                    createCol('stockDays', 'number', 'Stock Days'),
                    createCol('pendingQuantity', 'number', 'Available Qty'),
                    createCol('consumedQuantity', 'number', 'Consumed Qty'),
                    createCol('totalQuantity', 'number', 'Max Qty'),
                    // createCol('createdByGet', 'string', 'Created By'),
                    // createCol('trans_date', 'date', 'Date'),
                ]}
                enableFilters
                // isExpendable={true}
                // expandableComp={({ row }) => console.log(row)}
            />

            <Dialog>

            </Dialog>

        </>
    )
}

export default BatchListing