import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol, ButtonActions } from '../../Components/filterableTable2';
import { Addition, checkIsNumber, filterableText, groupData, ISOString, isValidDate } from "../../Components/functions";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { FilterAlt, Search, ToggleOff, ToggleOn } from "@mui/icons-material";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};


const CostCenterReports = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const [reportData, setReportData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        filterDialog: false,
        refresh: false,
        disablePagination: false,
        searchString: '',
        searchCategory: '',
    });

    useEffect(() => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `dataEntry/costCenter/report?Fromdate=${filters.fetchFrom}&Todate=${filters.fetchTo}`
        }).then(data => {
            if (data.success) {

                setReportData(data.data);
            } else {
                setReportData([]);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        })
    }, [filters.fetchFrom, filters.fetchTo]);

    useEffect(() => {
        const queryFilters = {
            Fromdate: query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                ? query.get("Fromdate")
                : defaultFilters.Fromdate,
            Todate: query.get("Todate") && isValidDate(query.get("Todate"))
                ? query.get("Todate")
                : defaultFilters.Todate,
        };
        setFilters(pre => ({ ...pre, fetchFrom: queryFilters.Fromdate, fetchTo: queryFilters.Todate }));
    }, [location.search]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const showData = useMemo(() => {
        const data = [...reportData];
        const filteredData = data.filter(staff => {
            if (filters.searchString) {
                return filterableText(Object.values(staff).join(' ')).includes(filterableText(filters.searchString));
            } else if (filters.searchCategory) {
                return filterableText(staff.CostType || "").includes(filterableText(filters.searchCategory || ""));
            } else {
                return true;
            }
        });
        const reStructured = groupData(filteredData, 'UserId');
        const staffAbstract = reStructured.map(staff => ({
            ...staff,
            Name: staff?.groupedData[0] ? staff?.groupedData[0]?.Name : ' - ',
            Tonnage: staff?.groupedData?.reduce((acc, staff) => Addition(acc, staff?.TotalTonnage), 0),
            Invoices: staff?.groupedData?.length ?? 0,
            DayTransactions: Array.isArray(staff?.groupedData) ?
                groupData(staff?.groupedData, 'EventDate').sort((a, b) => new Date(a.EventDate) - new Date(b.EventDate)) :
                [],
            StaffInvoices: checkIsNumber(staff?.groupedData?.length) ? staff?.groupedData?.length : 0
        }));
        const dayAbstract = staffAbstract.map(staff => ({
            ...staff,
            DayTransactions: staff?.DayTransactions?.map(day => ({
                ...day,
                TotalTonnage: day?.groupedData?.reduce((acc, day) => Addition(acc, day?.TotalTonnage), 0),
                DayInvoices: checkIsNumber(day?.groupedData?.length) ? day?.groupedData?.length : 0
            }))
        }));

        return dayAbstract;
    }, [reportData?.length, filters.searchString, filters.searchCategory]);

    const uniqueCategory = useMemo(() => {
        return [...new Set(reportData.map(sj => sj.CostType))];
    }, [reportData]);

    return (
        <>

            <FilterableTable
                title="Cost Center Report"
                dataArray={showData}
                columns={[
                    createCol('Name', 'string', 'Name'),
                    createCol('Tonnage', 'number', 'Tonnage'),
                    createCol('Invoices', 'number', 'Invoices'),
                ]}
                MenuButtons={[
                    {
                        name: 'Pagination',
                        icon: filters.disablePagination
                            ? <ToggleOff fontSize="small" />
                            : <ToggleOn fontSize="small" color='primary' />,
                        onclick: () => setFilters(pre => ({ ...pre, disablePagination: !pre.disablePagination })),
                        // disabled: isEqualNumber(FilteredVoucherData?.length, 0)
                    },
                    {
                        name: 'Filters',
                        icon: <FilterAlt fontSize="small" color='primary' />,
                        onclick: () => setFilters(pre => ({ ...pre, filterDialog: true })),
                    }
                ]}
                isExpendable={true}
                expandableComp={({ row }) => (
                    <FilterableTable
                        title={row?.Name + "'s Activity"}
                        dataArray={Array.isArray(row?.DayTransactions) ? row?.DayTransactions : []}
                        columns={[
                            createCol('EventDate', 'date', 'Date'),
                            createCol('TotalTonnage', 'number', 'Tonnage'),
                            {
                                isVisible: 1,
                                ColumnHeader: 'Invoices',
                                isCustomCell: true,
                                Cell: ({ row }) => row?.DayInvoices
                            }
                        ]}
                        EnableSerialNumber
                    />
                )}
                ButtonArea={
                    <input 
                        className="cus-inpt p-2 fa-13 w-auto"
                        type="search"
                        value={filters.searchString}
                        onChange={e => setFilters(pre => ({...pre, searchString: e.target.value}))}
                        placeholder="Search..."
                    />
                }
                EnableSerialNumber
                headerFontSizePx={13}
                bodyFontSizePx={13}
            />

            <Dialog
                open={filters.filterDialog}
                onClose={() => setFilters(pre => ({ ...pre, filterDialog: !pre.filterDialog }))}
                maxWidth='sm' fullWidth
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive">
                        <table className="table fa-16 table-borderless">
                            <tbody>
                                <tr>
                                    <td>From Date</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>To Date</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={e => setFilters({ ...filters, Todate: e.target.value })}
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Cost Category</td>
                                    <td>
                                        <select
                                            className="cus-inpt"
                                            value={filters.searchCategory}
                                            onChange={e => {
                                                setFilters(pre => ({
                                                    ...pre,
                                                    searchCategory: e.target.value,
                                                }));
                                            }}
                                        >
                                            <option value={''}>All Category</option>
                                            {uniqueCategory.map((CostType, key) => (
                                                <option value={CostType} key={key}>{CostType}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        size="small"
                        onClick={() => setFilters(pre => ({ ...pre, filterDialog: false }))}
                    >Close</Button>
                    <Button
                        onClick={() => {
                            const updatedFilters = {
                                Fromdate: filters?.Fromdate,
                                Todate: filters?.Todate,
                                filterDialog: false
                            };
                            setFilters(pre => ({ ...pre, ...updatedFilters }))
                            updateQueryString(updatedFilters);
                        }}
                        variant="outlined" size="small"
                        startIcon={<Search />}
                    >Search</Button>
                </DialogActions>
            </Dialog>

        </>
    )
}

export default CostCenterReports;