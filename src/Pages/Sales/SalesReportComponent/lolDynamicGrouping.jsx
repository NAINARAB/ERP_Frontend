import React, { useEffect, useState, Fragment } from "react";
import { Card, CardContent, IconButton, Tooltip } from "@mui/material";
import { DaysBetween, getPreviousDate, ISOString } from "../../Components/functions";
import DisplayArrayData from './SalesReportComponent/DataSetDisplay'
import ProductBasedSalesReport from "./SalesReportComponent/ProductBasedTable";
import ProductDayBasedSalesReport from "./SalesReportComponent//ProductDayBasedTable";
import { FilterAlt, Refresh } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable from "../../../Components/filterableTable2";


const LedgerDetails = ({ row, Fromdate, Todate, DB }) => {
    const [salesData, setSalesData] = useState([]);
    const [dataTypes, setDataTypes] = useState([]);

    useEffect(() => {
        fetchLink({
            address: `reports/salesReport/ledger/itemDetails?Fromdate=${Fromdate}&Todate=${Todate}&Ledger_Id=${row?.Ledger_Tally_Id}`,
            headers: {
                'Db': DB
            }
        }).then(({ success, data, others }) => {
            if (success) {
                const { dataTypeInfo } = others;
                setSalesData(data);
                setDataTypes(pre => ({ ...pre, salesInfo: Array.isArray(dataTypeInfo) ? dataTypeInfo : [] }))
            } else {
                setSalesData([]);
            }
        })
            .catch(console.error);
    }, [row?.Ledger_Tally_Id, Fromdate, Todate])

    return (
        <DisplayArrayData dataArray={salesData} columns={dataTypes.salesInfo} />
    )
}


const LolDynamicGroupingSalesReport = ({ loadingOn, loadingOff }) => {

    const storage = JSON.parse(localStorage.getItem("user"));
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: getPreviousDate(1),
        Todate: ISOString(),
        ReportType: 'LedgerBased',
        filterDialog: false,
        reload: true
    });

    const fetchData = () => {
        fetchLink({
            address: `reports/salesReport/ledger?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`,
            headers: {
                'Db': storage?.Company_id
            }
        }).then(({ success, data, others }) => {
            if (success) {
                const { dataTypeInfo } = others;
                setSalesData(data);
                setDataTypes(pre => ({ ...pre, salesInfo: Array.isArray(dataTypeInfo) ? dataTypeInfo : [] }))
            } else {
                setSalesData([]);
            }
        })
            .catch(console.error);

        fetchLink({
            address: `reports/salesReport/products?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`,
            headers: {
                'Db': storage?.Company_id
            }
        }).then(data => {
            if (data.success) {
                const { dataTypeInfo } = data?.others;

                const combinedData = Array.isArray(data?.others?.LOSAbstract) ? data.others.LOSAbstract.map(los => ({
                    ...los,
                    StockTransaction: Array.isArray(data.data) ? [...data.data].filter(losDetails => losDetails.Stock_Group === los.Stock_Group) : []
                })) : [];

                setDataTypes(pre => ({ ...pre, salesItemInfo: Array.isArray(dataTypeInfo) ? dataTypeInfo : [] }))
                setSalesDataOfProduct(combinedData);
            } else {
                setSalesDataOfProduct([])
            }
        })
            .catch(e => console.error(e))
    }

    return (
        <>
            <FilterableTable />
        </>
    )
}

export default LolDynamicGroupingSalesReport;