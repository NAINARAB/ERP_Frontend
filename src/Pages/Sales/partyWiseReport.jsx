import React, { useEffect, useState, Fragment } from "react";
import { Card, CardContent, IconButton, Tooltip } from "@mui/material";
import { getPreviousDate, ISOString } from "../../Components/functions";
import DisplayArrayData from './SalesReportComponent/DataSetDisplay'
import { FilterAlt, Refresh } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";


const PartyDetails = ({ row, Fromdate, Todate, DB }) => {
    const [salesData, setSalesData] = useState([]);
    const [dataTypes, setDataTypes] = useState([]);

    useEffect(() => {
        fetchLink({
            address: `sales/partyWiseReport/details?Fromdate=${Fromdate}&Todate=${Todate}&Party_Name=${row?.Actual_Party_Name}`,
            headers: {
                'Db': DB
            }
        }).then(({ success, data, others }) => {
            if (success) {
                const { dataTypeInfo } = others;
                setSalesData(data);
                setDataTypes(pre => ({...pre, salesInfo: Array.isArray(dataTypeInfo) ? dataTypeInfo : []}))
            } else {
                setSalesData([]);
            }
        })
        .catch(console.error);
    }, [row?.Party_Name, Fromdate, Todate])

    return (
        <DisplayArrayData dataArray={salesData} columns={dataTypes.salesInfo} />
    )
}


const PartySalesReport = () => {
    const storage = JSON.parse(localStorage.getItem("user"));
    const [salesData, setSalesData] = useState(null);
    const [dataTypes, setDataTypes] = useState([])
    const [filters, setFilters] = useState({
        Fromdate: getPreviousDate(1),
        Todate: ISOString(),
        filterDialog: false,
        reload: true
    });

    const fetchData = () => {
        fetchLink({
            address: `sales/partyWiseReport?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`,
            headers: {
                'Db': storage?.Company_id
            }
        }).then(({ success, data, others }) => {
            if (success) {
                const { dataTypeInfo } = others;
                setSalesData(data);
                setDataTypes(Array.isArray(dataTypeInfo) ? dataTypeInfo : [])
            } else {
                setSalesData([]);
            }
        })
        .catch(console.error);
    }

    useEffect(() => {
        setSalesData(null);
        setDataTypes([])
        fetchData();
    }, [filters.reload])

    return (
        <Fragment>
            <Card className="mt-3">
                <div className="px-3 py-2 d-flex justify-content-between align-items-center fw-bold text-dark" style={{ backgroundColor: '#eae0cc' }}>
                    <span>
                        PARTY BASED SALES
                    </span>
                </div>

                <CardContent>

                    <div className="mb-3">
                        <input
                            type={'date'}
                            className='cus-inpt w-auto ps-3 border rounded-5 me-1'
                            value={filters.Fromdate}
                            onChange={e => setFilters(pre => ({ ...pre, Fromdate: e.target.value }))}
                        />

                        <input
                            type={'date'}
                            className='cus-inpt w-auto ps-3 border rounded-5'
                            value={filters.Todate}
                            onChange={e => setFilters(pre => ({ ...pre, Todate: e.target.value }))}
                        />

                        <Tooltip title='Reload Data'>
                            <IconButton
                                onClick={() => setFilters(pre => ({ ...pre, reload: !pre.reload }))}
                                size="small"
                                className="ms-2"
                            >
                                <Refresh />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Filters">
                            <IconButton
                                onClick={() => setFilters(pre => ({ ...pre, filterDialog: true }))}
                                size="small"
                                className="d-md-none d-inline"
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                    </div>

                    {salesData === null && (
                        <h6 className="blue-text text-center">Fetching data...</h6>
                    )}

                    {Array.isArray(salesData) && (
                        <DisplayArrayData 
                            dataArray={salesData} 
                            columns={dataTypes} 
                            ExpandableComp={({ row }) => (
                                <PartyDetails 
                                    row={row} 
                                    DB={storage?.Company_id} 
                                    Fromdate={filters?.Fromdate} 
                                    Todate={filters?.Todate} 
                                />
                            )}
                            enableFilters={true} 
                        />
                    )}

                </CardContent>
            </Card>
        </Fragment>
    )

}

export default PartySalesReport;