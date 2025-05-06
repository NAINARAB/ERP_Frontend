import { useEffect, useMemo, useState } from "react";
import { Addition, filterableText, getSessionUser, ISOString, isValidDate, NumberFormat, stringCompare, toArray } from '../../Components/functions'
import { fetchLink } from "../../Components/fetchComponent";
import { Card, CardContent, IconButton, Tooltip } from "@mui/material";
import { ArrowRight, KeyboardArrowDown, KeyboardArrowUp, OpenInNew, Search } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import LastSynedTime from "../Dashboard/tallyLastSyncedTime";
import { ButtonActions } from "../../Components/filterableTable2";

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

        const ERP_Rows = useMemo(() => toArray(row?.groupedData).filter(
            item => stringCompare(item?.dataSource, 'ERP')
        ), [row]);

        const Tally_Rows = useMemo(() => toArray(row?.groupedData).filter(
            item => stringCompare(item?.dataSource, 'TALLY')
        ), [row]);

        return (
            <>
                <tr>
                    <td>{Sno}</td>
                    <td>{row?.ModuleName}</td>
                    <td>
                        {ERP_Rows.reduce((acc, item) => Addition(acc, item?.VoucherBreakUpCount), 0)}
                    </td>
                    <td>{NumberFormat(ERP_Rows.reduce((acc, item) => Addition(acc, item.Amount), 0))}</td>
                    <td>
                        {Tally_Rows.reduce((acc, item) => Addition(acc, item?.VoucherBreakUpCount), 0)}
                    </td>
                    <td>{NumberFormat(Tally_Rows.reduce((acc, item) => Addition(acc, item.Amount), 0))}</td>
                    <td className="p-0 text-center vctr">

                        <ButtonActions 
                            buttonsData={[
                                {
                                    name: 'Expand',
                                    onclick: () => setOpen(pre => !pre),
                                    icon: open 
                                        ? <KeyboardArrowUp sx={{ fontSize: 'inherit' }} /> 
                                        : <KeyboardArrowDown sx={{ fontSize: 'inherit' }} />
                                },
                                {
                                    name: 'Open Detail (T)',
                                    icon: <OpenInNew sx={{ fontSize: 'inherit' }} />,
                                    onclick: () => {
                                        navigate(Tally_Rows[0]?.navLink, {
                                            state: {
                                                ModuleName: row.ModuleName,
                                                Fromdate: filters?.fetchFrom,
                                                Todate: filters?.fetchTo
                                            }
                                        })
                                    }
                                },
                                {
                                    name: 'Open Detail (ERP)',
                                    icon: <OpenInNew sx={{ fontSize: 'inherit' }} />,
                                    onclick: () => {
                                        navigate(ERP_Rows[0]?.navLink, {
                                            state: {
                                                ModuleName: row.ModuleName,
                                                Fromdate: filters?.fetchFrom,
                                                Todate: filters?.fetchTo
                                            }
                                        })
                                    }
                                }
                            ]}
                        />

                    </td>
                </tr>

                {open && (
                    <>
                        <tr>
                            <td colSpan={7} className="bg-light fw-bold">
                                ERP {`(${ERP_Rows.length})`}
                            </td>
                        </tr>

                        {ERP_Rows.map((item, index) => (
                            <tr key={index}>
                                <td>{Sno + '.1.' + (index + 1)}</td>
                                <td>{item?.Voucher_Type}</td>
                                <td>{item?.VoucherBreakUpCount}</td>
                                <td>{NumberFormat(item?.Amount)}</td>
                                <td></td>
                                <td></td>
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
                        ))}

                        <tr>
                            <td colSpan={7} className="bg-light fw-bold">
                                TALLY {`(${Tally_Rows.length})`}
                            </td>
                        </tr>

                        {Tally_Rows?.map((item, index) => (
                            <tr key={index}>
                                <td>{Sno + '.2.' + (index + 1)}</td>
                                <td>{item?.Voucher_Type}</td>
                                <td></td>
                                <td></td>
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
                        ))}
                    </>
                )}

            </>
        )
    }

    return (
        <>

            <Card>
                <div className="p-2 d-flex align-items-center flex-wrap border-bottom">
                    <h5 className="m-0 my-1 flex-grow-1 d-flex align-items-center flex-wrap">
                        <span className="mx-2">Day Book</span>
                        <LastSynedTime />
                    </h5>
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
                                    {/* <th>Voucher Count</th> */}
                                    {/* <th>Total Amount</th> */}
                                    <th>ERP Entries</th>
                                    <th>ERP Amount</th>
                                    <th>Tally Entries</th>
                                    <th>Tally Amount</th>
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