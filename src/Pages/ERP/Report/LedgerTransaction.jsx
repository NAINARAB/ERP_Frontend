import React, { useEffect, useState, useContext, Fragment } from "react";
import api from "../../../API";
import { CurretntCompany } from "../../../Components/context/currentCompnayProvider";
import { Card, CardContent, IconButton, Tooltip } from "@mui/material";
import { calcAvg, calcTotal, DaysBetween, getPreviousDate, isEqualNumber, ISOString } from "../../../Components/functions";
import LedgerBasedSalesReport from "./LedgerBasedTable";
import ProductBasedSalesReport from "./ProductBasedTable";
import ProductDayBasedSalesReport from "./ProductDayBasedTable";
import { FilterAlt, Refresh } from "@mui/icons-material";


const SalesReport = () => {
    const [salesData, setSalesData] = useState(null);
    const [salesDataOFProduct, setSalesDataOfProduct] = useState(null);
    const { currentCompany, setCurrentCompany } = useContext(CurretntCompany);
    const [filters, setFilters] = useState({
        Fromdate: getPreviousDate(1),
        Todate: ISOString(),
        ReportType: 'LedgerBased',
        filterDialog: false,
        reload: true
    });

    const fetchData = () => {
        fetch(`${api}combinedSalesReport?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`, {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                'Db': currentCompany?.id
            }
        })
            .then(res => res.json())
            .then(({ success, data, others }) => {
                if (success) {
                    const { ledgerDetails } = others;
                    const combinedData = data.map(o => {
                        const ledgerSales = ledgerDetails.filter(oo => isEqualNumber(o.Ledger_Tally_Id, oo.Ledger_Id));
                        const billedQty = calcTotal(ledgerSales, 'bill_qty');
                        return {
                            ...o,
                            LedgerSales: ledgerSales,
                            Transaction: ledgerSales.length,
                            Billed_Qty: billedQty,
                            BilledQtyAvg: calcAvg(ledgerSales, 'bill_qty'),
                            Ledger_Name: o.Ledger_Name,
                            M2_Avg: o.ALL_Avg_M2,
                            M3_Avg: o.ALL_Avg_M3,
                            M6_Avg: o.ALL_Avg_M6,
                            M9_Avg: o.ALL_Avg_M9,
                            M12_Avg: o.ALL_Avg_One_Year,
                            Q_Pay_Days: o.Q_Pay_Days,
                            Freq_Days: o.Freq_Days,
                            Ledger_Alias: o.Ledger_Alias,
                            Actual_Party_Name_with_Brokers: o.Actual_Party_Name_with_Brokers,
                            Party_Name: o.Party_Name,
                            Party_Location: o.Party_Location,
                            Party_Nature: o.Party_Nature,
                            Party_Group: o.Party_Group,
                            Ref_Brokers: o.Ref_Brokers,
                            Ref_Owners: o.Ref_Owners,
                            Party_Mobile_1: o.Party_Mobile_1,
                            Party_Mobile_2: o.Party_Mobile_2,
                            Party_District: o.Party_District,
                            File_No: o.File_No,
                            Ledger_Tally_Id: o.Ledger_Tally_Id
                        };
                    });

                    setSalesData(combinedData);
                } else {
                    setSalesData([]);
                }
            })
            .catch(console.error);

        fetch(`${api}combinedSalesReport/products?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`, {
            method: 'GET',
            headers: {
                "Content-type": "application/json; charset=UTF-8",
                'Db': currentCompany?.id
            }
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const combinedData = Array.isArray(data?.others?.LOSAbstract) ? data.others.LOSAbstract.map(los => ({
                        ...los,
                        StockTransaction: Array.isArray(data.data) ? [...data.data].filter(losDetails => losDetails.Stock_Group === los.Stock_Group) : []
                    })) : [];
                    setSalesDataOfProduct(combinedData);
                } else {
                    setSalesDataOfProduct([])
                }
            })
            .catch(e => console.error(e))
    }

    useEffect(() => {
        setSalesData(null);
        setSalesDataOfProduct(null);
        setCurrentCompany(pre => ({ ...pre, CompanySettings: true }));
        fetchData();
    }, [filters.reload, currentCompany?.id])

    const closeDialog = () => {
        setFilters(pre => ({ ...pre, filterDialog: false }))
    }

    const daysDifferent = DaysBetween(new Date(filters.Fromdate), new Date(filters.Todate));

    return (
        <Fragment>
            <Card className="mt-3">
                <div className="px-3 py-2 d-flex justify-content-between align-items-center fw-bold text-dark" style={{ backgroundColor: '#eae0cc' }}>
                    <span>
                        {currentCompany?.CompName}
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

                    {salesData === null && filters.ReportType === "LedgerBased" && (
                        <h6 className="blue-text text-center">Fetching Ledger Based data...</h6>
                    )}

                    {(salesDataOFProduct === null && (filters.ReportType === "ProductBased" || filters.ReportType === 'ProductDayAverage')) && (
                        <h6 className="blue-text text-center">Fetching Product Based data...</h6>
                    )}

                    {(filters.ReportType === "LedgerBased" && Array.isArray(salesData)) && (
                        <LedgerBasedSalesReport filterDialog={filters.filterDialog} closeDialog={closeDialog} dataArray={salesData} />
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