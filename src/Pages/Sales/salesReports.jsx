import React, { useEffect, useState, Fragment } from "react";
import { Card, CardContent, IconButton, Tooltip } from "@mui/material";
import { DaysBetween, getPreviousDate, ISOString } from "../../Components/functions";
// import LedgerBasedSalesReport from './SalesReportComponent/LedgerBasedTable';
import DisplayArrayData from './SalesReportComponent/DataSetDisplay'
import ProductBasedSalesReport from "./SalesReportComponent/ProductBasedTable";
import ProductDayBasedSalesReport from "./SalesReportComponent/ProductDayBasedTable";
import { FilterAlt, Refresh } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import LedgerBasedSalesReport from "./SalesReportComponent/LedgerBasedTable";

const SalesReport = ({ loadingOn, loadingOff }) => {
    const storage = JSON.parse(localStorage.getItem("user"));
    const [salesData, setSalesData] = useState(null);
    const [dataTypes, setDataTypes] = useState({
        salesInfo: [],
        salesItemInfo: [],
    })
    const [salesDataOFProduct, setSalesDataOfProduct] = useState(null);
    const [filters, setFilters] = useState({
        Fromdate: getPreviousDate(1),
        Todate: ISOString(),
        // ReportType: 'LedgerBased',
        ReportType: 'ProductBased',
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
        }).catch(e => console.error(e))
    }

    useEffect(() => {
        setSalesData(null);
        setSalesDataOfProduct(null);
        setDataTypes({
            salesInfo: [],
            salesItemInfo: [],
        })
        fetchData();
    }, [filters.reload])

    const closeDialog = () => {
        setFilters(pre => ({ ...pre, filterDialog: false }))
    }

    const daysDifferent = DaysBetween(new Date(filters.Fromdate), new Date(filters.Todate));

    return (
        <Fragment>
            <Card className="mt-3">
                <div className="px-3 py-2 d-flex justify-content-between align-items-center fw-bold text-dark" style={{ backgroundColor: '#eae0cc' }}>
                    <span>
                        {storage?.Company_Name}
                    </span>
                    <span>
                        <select
                            value={filters.ReportType}
                            className="cus-inpt ps-3 w-100 rounded-5 border-0"
                            onChange={e => setFilters(pre => ({ ...pre, ReportType: e.target.value }))}
                        >
                            <option value={'LedgerBased'}>Ledger Based</option>
                            <option value={'ProductBased'}>Product Based</option>
                            <option value={'ProductDayAverage'}>Product/Day Based</option>
                        </select>
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

                        {/* <Tooltip title="Filters">
                            <IconButton
                                onClick={() => setFilters(pre => ({ ...pre, filterDialog: true }))}
                                size="small"
                                className="d-md-none d-inline"
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip> */}
                    </div>

                    {salesData === null && filters.ReportType === "LedgerBased" && (
                        <h6 className="blue-text text-center">Fetching Ledger Based data...</h6>
                    )}

                    {(salesDataOFProduct === null && (filters.ReportType === "ProductBased" || filters.ReportType === 'ProductDayAverage')) && (
                        <h6 className="blue-text text-center">Fetching Product Based data...</h6>
                    )}

                    {(filters.ReportType === "LedgerBased" && Array.isArray(salesData)) && (
                        <LedgerBasedSalesReport
                            filterDialog={filters.filterDialog}
                            closeDialog={closeDialog}
                            dataArray={salesData}
                            colTypes={dataTypes.salesInfo}
                            DB={storage?.Company_id}
                            Fromdate={filters?.Fromdate}
                            Todate={filters?.Todate}
                            loadingOn={loadingOn} 
                            loadingOff={loadingOff}
                        />
                    )}

                    {(filters.ReportType === "ProductBased" && Array.isArray(salesDataOFProduct)) && (
                        <ProductBasedSalesReport filterDialog={filters.filterDialog} closeDialog={closeDialog} dataArray={salesDataOFProduct} />
                    )}

                    {(filters.ReportType === "ProductDayAverage" && Array.isArray(salesDataOFProduct)) && (
                        <ProductDayBasedSalesReport filterDialog={filters.filterDialog} closeDialog={closeDialog} dataArray={salesDataOFProduct} days={daysDifferent} />
                    )}
                </CardContent>
            </Card>
        </Fragment>
    )

}

export default SalesReport;