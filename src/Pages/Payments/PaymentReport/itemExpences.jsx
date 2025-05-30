import { useEffect, useMemo, useState } from "react";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, groupData, ISOString, isValidDate, Subraction, toArray } from "../../../Components/functions";
import { useLocation, useNavigate } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { ClearAll, FilterAlt, Search } from "@mui/icons-material";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const ItemPaymentExpences = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        refresh: false,
        filterDialog: false,
    });

    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const query = useQuery();

    useEffect(() => {
        const queryFilters = {
            Fromdate: query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                ? query.get("Fromdate")
                : defaultFilters.Fromdate,
            Todate: query.get("Todate") && isValidDate(query.get("Todate"))
                ? query.get("Todate")
                : defaultFilters.Todate,
        };
        setFilters(pre => ({ ...pre, Fromdate: queryFilters.Fromdate, Todate: queryFilters.Todate }));
    }, [location.search]);

    useEffect(() => {
        const Fromdate = (stateDetails?.Fromdate && isValidDate(stateDetails?.Fromdate)) ? ISOString(stateDetails?.Fromdate) : null;
        const Todate = (stateDetails?.Todate && isValidDate(stateDetails?.Todate)) ? ISOString(stateDetails?.Todate) : null;
        if (Fromdate && Todate) {
            updateQueryString({ Fromdate, Todate });
            setFilters(pre => ({
                ...pre,
                Fromdate: ISOString(stateDetails.Fromdate),
                Todate: stateDetails.Todate
            }));
        }
    }, [stateDetails])

    useEffect(() => {
        fetchLink({
            address: `payment/reports/itemExpences?Fromdate=${filters.Fromdate}&Todate=${filters.Todate}`,
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                setReportData(data.data);
            }
        }).catch(e => console.log(e))
    }, [filters.refresh])

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const closeDialog = () => {
        setFilters(pre => ({
            ...pre,
            filterDialog: false,
        }));
    }

    const refreshData = () => {
        setFilters(pre => ({
            ...pre,
            refresh: !pre.refresh,
        }));
    }

    const groupedReportData = useMemo(() => {
        const Stock_Group = groupData(reportData, 'Stock_Group');

        const aggregatedStockGroup = Stock_Group.sort(
            (a, b) => String(a?.Stock_Group).localeCompare(String(b?.Stock_Group))
        ).map(sg => ({
            ...sg,
            total_expense_value: toArray(sg?.groupedData).reduce((acc, item) => Addition(acc, item?.total_expense_value), 0),
            payment_count: toArray(sg?.groupedData).reduce((acc, item) => Addition(acc, item?.payment_count), 0)
        }));

        console.log({ aggregatedStockGroup })

        const Grade_Item_Group = aggregatedStockGroup.map(sg => ({
            ...sg,
            groupedData: groupData(sg.groupedData, 'Grade_Item_Group')
        }));

        console.log({ Grade_Item_Group });

        const aggregatedGradeItemGroup = Grade_Item_Group.map(sg => ({
            ...sg,
            groupedData: toArray(sg.groupedData).sort(
                (a, b) => String(a?.Grade_Item_Group).localeCompare(String(b?.Grade_Item_Group))
            ).map(gig => ({
                ...gig,
                total_expense_value: toArray(gig?.groupedData).reduce((acc, item) => Addition(acc, item?.total_expense_value), 0),
                payment_count: toArray(gig?.groupedData).reduce((acc, item) => Addition(acc, item?.payment_count), 0)
            }))
        }));

        return aggregatedGradeItemGroup

    }, [reportData]);

    console.log(groupedReportData)


    return (
        <>
            <FilterableTable
                title="Item Expences"
                headerFontSizePx={13}
                bodyFontSizePx={12}
                dataArray={groupedReportData}
                EnableSerialNumber
                ButtonArea={
                    <>
                        <IconButton
                            onClick={() => setFilters(pre => ({ ...pre, filterDialog: true }))}
                        ><FilterAlt /></IconButton>
                    </>
                }
                columns={[
                    createCol('Stock_Group', 'string',),
                    createCol('payment_count', 'number', 'payments'),
                    createCol('total_expense_value', 'number', 'Total Enpence')
                ]}
                isExpendable={true}
                expandableComp={({ row }) => (
                    <FilterableTable
                        headerFontSizePx={13}
                        bodyFontSizePx={12}
                        dataArray={toArray(row?.groupedData)}
                        EnableSerialNumber
                        columns={[
                            createCol('Grade_Item_Group', 'string'),
                            createCol('payment_count', 'number', 'payments'),
                            createCol('total_expense_value', 'number', 'Total Enpence')
                        ]}
                        isExpendable={true}
                        expandableComp={({ row }) => (
                            <FilterableTable
                                EnableSerialNumber
                                dataArray={toArray(row?.groupedData)}
                                columns={[
                                    createCol('Product_Name', 'string', 'Item'),
                                    createCol('payment_count', 'number', 'payments'),
                                    createCol('total_expense_value', 'number', 'Total Enpence')
                                ]}
                                disablePagination
                            />
                        )}
                        disablePagination
                    />
                )}
            />

            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>

                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>

                                {/* from date */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                {/* to date */}
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={e => setFilters({ ...filters, Todate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions className="d-flex align-items-center justify-content-between">
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setFilters(pre => ({
                                ...pre,
                                ...defaultFilters
                            }))
                        }}
                        startIcon={<ClearAll />}
                    >clear</Button>
                    <span>
                        <Button onClick={closeDialog}>close</Button>
                        <Button
                            onClick={() => {
                                closeDialog();
                                const updatedFilters = {
                                    Fromdate: filters?.Fromdate,
                                    Todate: filters?.Todate
                                };
                                updateQueryString(updatedFilters);
                                refreshData();
                            }}
                            startIcon={<Search />}
                            variant="contained"
                        >Search</Button>
                    </span>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default ItemPaymentExpences;