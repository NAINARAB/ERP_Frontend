import { useEffect, useMemo, useState } from "react";
import { getSessionUser, isEqualNumber, ISOString, isValidDate, isValidObject } from '../../Components/functions';
import FilterableTable from '../../Components/filterableTable2';
import { fetchLink } from "../../Components/fetchComponent";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { FilterAlt, Search, ToggleOff, ToggleOn } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { dayBookColumn } from "./dayBookColumns";


const DayBookDetails = ({ loadingOn, loadingOff }) => {
    const location = useLocation();
    const stateDetails = location.state;
    const user = getSessionUser().user;
    const [dayBookDetails, setDayBookDetails] = useState([]);

    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        ModuleName: 'Sales',
        Voucher_Type: null,
        filterDialog: false,
        refresh: false,
        disablePagination: false
    });

    useEffect(() => {
        if (filters?.ModuleName) {
            if (loadingOn) loadingOn();
            setDayBookDetails([]);
            fetchLink({
                address: `dashboard/dayBook/${String(filters?.ModuleName).toLowerCase()}?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`,
                headers: { Db: user?.Company_id }
            }).then(data => {
                if (data.success) {
                    setDayBookDetails(data.data);
                }
            }).catch(e => console.error(e)).finally(() => {
                if (loadingOff) loadingOff();
            })
        }
    }, [filters?.refresh])

    useEffect(() => {
        if (isValidObject(stateDetails)) {
            const Fromdate = isValidDate(stateDetails?.Fromdate) ? ISOString(stateDetails.Fromdate) : ISOString();
            const Todate = isValidDate(stateDetails?.Todate) ? ISOString(stateDetails.Todate) : ISOString();
            const ModuleName = stateDetails?.ModuleName ? stateDetails?.ModuleName : null;
            const Voucher_Type = stateDetails?.Voucher_Type ? stateDetails?.Voucher_Type : null;
            setFilters(pre => ({
                ...pre,
                Fromdate, Todate, ModuleName, Voucher_Type, refresh: !pre.refresh
            }))
        }
    }, [stateDetails])

    const FilteredVoucherData = filters?.Voucher_Type ?
        dayBookDetails.filter(fil => String(fil.VoucherName).localeCompare(filters.Voucher_Type) === 0)
        : dayBookDetails;

    const uniqueVoucherType = useMemo(() => {
        return [...new Set(dayBookDetails?.map(item => item?.VoucherName))].map(items => ({
            value: items,
            label: items,
        }));
    }, [dayBookDetails]);

    return (
        <>
            <FilterableTable
                title={filters?.ModuleName + ' - ' + (filters?.Voucher_Type ? filters?.Voucher_Type : 'All Vouchers')}
                dataArray={FilteredVoucherData}
                columns={filters?.ModuleName ? dayBookColumn(filters.ModuleName) : []}
                EnableSerialNumber
                maxHeightOption
                disablePagination={filters.disablePagination}
                MenuButtons={[
                    {
                        name: 'Pagination',
                        icon: filters.disablePagination
                            ? <ToggleOff fontSize="small" />
                            : <ToggleOn fontSize="small" color='primary' />,
                        onclick: () => setFilters(pre => ({ ...pre, disablePagination: !pre.disablePagination })),
                        disabled: isEqualNumber(FilteredVoucherData?.length, 0)
                    },
                    {
                        name: 'Filters',
                        icon: <FilterAlt fontSize="small" color='primary' />,
                        onclick: () => setFilters(pre => ({ ...pre, filterDialog: true })),
                    }
                ]}
            />

            <Dialog
                open={filters.filterDialog}
                onClose={() => setFilters(pre => ({ ...pre, filterDialog: false }))}
                maxWidth='sm' fullWidth
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive">
                        <table className="table fa-14 table-borderless">
                            <tbody>
                                <tr>
                                    <td>From Date</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                                            className="cus-inpt p-1"
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
                                            className="cus-inpt p-1"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td>Module</td>
                                    <td>
                                        <select
                                            className="cus-inpt p-1"
                                            value={filters.ModuleName ? filters.ModuleName : ''}
                                            onChange={e => setFilters(pre => ({ 
                                                ...pre, 
                                                ModuleName: e.target.value, 
                                                refresh: !pre.refresh, 
                                                Voucher_Type: null,
                                                filterDialog: false
                                            }))}
                                        >
                                            {['Sales', 'Payment', 'Receipt', 'Journal', 'Contra'].map((item, key) => (
                                                <option value={item} key={key}>{item}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td>Voucher</td>
                                    <td>
                                        <select
                                            className="cus-inpt p-1"
                                            value={filters?.Voucher_Type ? filters.Voucher_Type : ''}
                                            onChange={e => setFilters(pre => ({ ...pre, Voucher_Type: e.target.value, filterDialog: false }))}
                                        >
                                            <option value={''}>All Vouchers</option>
                                            {uniqueVoucherType.map((item, key) => (
                                                <option value={item.value} key={key}>{item.label}</option>
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
                            setFilters(pre => ({ ...pre, refresh: !pre.refresh, filterDialog: false }));
                        }}
                        variant="outlined" size="small"
                        startIcon={<Search />}
                    >Search</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default DayBookDetails;