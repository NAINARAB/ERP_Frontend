import { useEffect, useState } from "react";
import { Addition, filterableText, getSessionUser, ISOString, isValidDate, NumberFormat } from '../../Components/functions'
import { fetchLink } from "../../Components/fetchComponent";
import { Card, CardContent, IconButton, Tooltip } from "@mui/material";
import { ArrowRight, KeyboardArrowDown, KeyboardArrowUp, OpenInNew, Search } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import LastSynedTime from "../Dashboard/tallyLastSyncedTime";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const DayBookOfERP = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const user = getSessionUser().user;
    const [dayBookData, setDayBookData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        filterDialog: false,
        refresh: false,
    })

    useEffect(() => {
        if (loadingOn) loadingOn();
        setDayBookData([])
        fetchLink({
            address: `dashboard/dayBook?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}`,
            headers: {
                "Db": user?.Company_id
            }
        }).then(data => {
            if (data.success) {
                setDayBookData(data.data);
            }
        }).finally(() => {
            if (loadingOff) loadingOff();
        }).catch(e => console.error(e))
    }, [filters?.fetchFrom, filters?.fetchTo])

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

    const closeDialog = () => {
        setFilters({
            ...filters,
            filterDialog: false,
        });
    }

    const RowComp = ({ row, Sno }) => {
        const [open, setOpen] = useState(false);

        return (
            <>
                <tr>
                    <td>{Sno}</td>
                    <td>{row?.ModuleName}</td>
                    <td>
                        {row?.groupedData?.length
                            + ' ( ' +
                            row?.groupedData?.reduce((acc, item) => Addition(acc, item?.VoucherBreakUpCount), 0)
                            + ' - Entry )'}
                    </td>
                    <td>{NumberFormat(row?.groupedData?.reduce((acc, item) => Addition(acc, item.Amount), 0))}</td>
                    <td className="p-0 text-center vctr">
                        <IconButton onClick={() => setOpen(!open)} size="small">
                            {open ? <KeyboardArrowUp sx={{ fontSize: 'inherit' }} /> : <KeyboardArrowDown sx={{ fontSize: 'inherit' }} />}
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => {
                                navigate(row?.groupedData[0]?.navLink, {
                                    state: {
                                        ModuleName: row.ModuleName,
                                        Fromdate: filters?.fetchFrom,
                                        Todate: filters?.fetchTo
                                    }
                                })
                            }} className="ms-2"
                        >
                            {<OpenInNew sx={{ fontSize: 'inherit' }} />}
                        </IconButton>
                    </td>
                </tr>

                {open && (
                    row?.groupedData?.map((item, index) => (
                        <tr key={index}>
                            <td>{Sno + '.' + (index + 1)}</td>
                            <td>{item?.Voucher_Type}</td>
                            <td>{item?.VoucherBreakUpCount}</td>
                            <td>{NumberFormat(item?.Amount)}</td>
                            <td className="p-0 text-center vctr">
                                <Tooltip title={'Open ' + item?.Voucher_Type + ' Details'}>
                                    <button
                                        onClick={() => {
                                            navigate(item?.navLink, {
                                                state: {
                                                    ...item,
                                                    Fromdate: filters?.fetchFrom,
                                                    Todate: filters?.fetchTo
                                                }
                                            })
                                        }}
                                        className="icon-btn"
                                    >
                                        <ArrowRight sx={{ fontSize: 'inherit' }} />
                                    </button>
                                </Tooltip>
                            </td>
                        </tr>
                    ))
                )}
            </>
        )
    }

    return (
        <>

            <Card>
                <div className="p-2 d-flex align-items-center flex-wrap border-bottom">
                    <h5 className="m-0 flex-grow-1">Day Book <LastSynedTime /></h5>
                    <div>
                        <input
                            type="date"
                            value={filters.Fromdate}
                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                            className="cus-inpt w-auto p-1"
                        />
                    </div>
                    <span className="px-2">To</span>
                    <input
                        type="date"
                        value={filters.Todate}
                        onChange={e => setFilters({ ...filters, Todate: e.target.value })}
                        className="cus-inpt me-2 w-auto p-1"
                    />
                    <IconButton
                        onClick={() => {
                            const updatedFilters = {
                                Fromdate: filters?.Fromdate,
                                Todate: filters?.Todate
                            };
                            updateQueryString(updatedFilters);
                            closeDialog();
                        }}
                        variant="outlined" size="small"
                    ><Search /></IconButton>
                </div>
                <CardContent>
                    <div className="table-responsive">
                        <table className="table table-bordered fa-13">
                            <thead>
                                <tr>
                                    <th>Sno</th>
                                    <th>Voucher</th>
                                    <th>Voucher Count</th>
                                    <th>Total Amount</th>
                                    <th>Detilas</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dayBookData.map((item, index) => (
                                    <RowComp key={index} row={item} Sno={index + 1} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default DayBookOfERP;