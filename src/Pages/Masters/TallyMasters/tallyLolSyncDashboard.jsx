import { useEffect, useMemo, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { filterableText, getSessionUser, isEqualNumber, LocalDate } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { Card, IconButton } from "@mui/material";
import { toast } from 'react-toastify';
import { Sync, Visibility } from "@mui/icons-material";


const createDateObject = (dateValue) => {
    try {
        const [datePart] = dateValue.split(' ');
        const [day, month, year] = datePart ? datePart?.split('-') : [];
        const dateObject = new Date(year, month - 1, day);
        return dateObject ? LocalDate(dateObject) : '';
    } catch (e) {
        console.error('Failed when parse date: ', e);
        return ''
    }
}

const TallyLolSyncDashboard = ({ loadingOn, loadingOff }) => {
    const [ERPLOL, setERPLOL] = useState([]);
    const [tallyLOL, setTallyLOL] = useState([]);
    const user = getSessionUser().user;
    const [filters, setFilters] = useState({
        refresh: false,
        viewNotSynced: false,
        searchERPLol: '',
        searchTallyLol: '',
        searchNotSynced: '',
    })

    useEffect(() => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `masters/tallyMaster/ledger`,
            headers: {
                "Db": user?.Company_id
            }
        }).then(data => {
            if (data.success) {
                const tallyLOL = Array.isArray(data?.others?.tallyResult) ? data?.others?.tallyResult : [];
                setERPLOL(data.data);
                setTallyLOL(tallyLOL);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff()
        })
    }, [filters.refresh])

    const syncLOL = () => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `masters/retailers/lolSync`,
            method: 'POST'
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                setFilters(pre => ({ ...pre, refresh: !pre.refresh }))
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        })
    }

    const notSyncedList = useMemo(() => {
        return tallyLOL.filter(talFil =>
            !ERPLOL.some(erpFil =>
                isEqualNumber(talFil.Ledger_Tally_Id, erpFil.Ledger_Tally_Id)
            )
        );
    }, [ERPLOL.length, tallyLOL.length])

    const ERPLOLList = useMemo(() => {
        return filters.searchERPLol ? ERPLOL.filter(obj =>
            filterableText(Object.values(obj).join(" ")).includes(filterableText(filters.searchERPLol))
        ) : ERPLOL
    }, [filters.searchERPLol, ERPLOL.length]);

    const TallyLOLList = useMemo(() => {
        return filters.searchTallyLol ? tallyLOL.filter(obj =>
            filterableText(Object.values(obj).join(" ")).includes(filterableText(filters.searchTallyLol))
        ) : tallyLOL;
    }, [filters.searchTallyLol, tallyLOL.length])

    const filteredNotSyncedList = useMemo(() => {
        return filters.searchNotSynced ? notSyncedList.filter(obj =>
            filterableText(Object.values(obj).join(" ")).includes(filterableText(filters.searchNotSynced))
        ) : notSyncedList;
    }, [notSyncedList.length, filters.searchNotSynced])

    return (
        <>
            <Card>
                <div
                    className="px-3 py-2 fa-14"
                >
                    <div className="d-flex flex-wrap align-items-center">
                        <h5 className="flex-grow-1">LOL SYNC (Differents: {notSyncedList.length})</h5>
                        <IconButton size='small' onClick={syncLOL}><Sync /></IconButton>
                        <IconButton size='small'
                            onClick={() => setFilters(pre => ({ ...pre, viewNotSynced: !pre.viewNotSynced }))}
                        ><Visibility /></IconButton>
                    </div>
                    <div className="d-flex flex-wrap align-items-center">

                    </div>
                </div>

                {filters.viewNotSynced ? (
                    <FilterableTable
                        title={"Not synced list "}
                        bodyFontSizePx={11}
                        headerFontSizePx={11}
                        dataArray={filteredNotSyncedList}
                        columns={[
                            createCol('Ledger_Tally_Id', 'string', 'Tally ID'),
                            createCol('Ledger_Name', 'string'),
                            createCol('Party_Mobile_1', 'string', 'MobileNo'),
                            {
                                isVisible: 1,
                                ColumnHeader: 'Created Date',
                                isCustomCell: true,
                                Cell: ({ row }) => row?.Date_Added ? createDateObject(row?.Date_Added) : ''
                            },
                            createCol('Party_District', 'string'),
                            createCol('Party_Group', 'string'),
                        ]}
                        ButtonArea={
                            <>
                                <input
                                    type='search'
                                    className="cus-inpt p-1 w-auto"
                                    value={filters.searchNotSynced}
                                    onChange={e => setFilters(pre => ({ ...pre, searchNotSynced: e.target.value }))}
                                    placeholder="Search.."
                                />
                            </>
                        }
                    />
                ) : (
                    <>
                        <div className="row">
                            <div className="col-lg-6 p-1">
                                <FilterableTable
                                    title={"ERP - " + ERPLOL.length}
                                    bodyFontSizePx={11}
                                    headerFontSizePx={11}
                                    dataArray={ERPLOLList}
                                    columns={[
                                        createCol('Ledger_Tally_Id', 'string', 'Tally ID'),
                                        createCol('Ledger_Name', 'string'),
                                        createCol('Party_Mobile_1', 'string', 'MobileNo'),
                                        {
                                            isVisible: 1,
                                            ColumnHeader: 'Created Date',
                                            isCustomCell: true,
                                            Cell: ({ row }) => row?.Date_Added ? createDateObject(row?.Date_Added) : ''
                                        },
                                        createCol('Party_District', 'string'),
                                        createCol('Party_Group', 'string'),
                                    ]}
                                    ButtonArea={
                                        <>
                                            <input
                                                type='search'
                                                className="cus-inpt p-1 w-auto"
                                                value={filters.searchERPLol}
                                                onChange={e => setFilters(pre => ({ ...pre, searchERPLol: e.target.value }))}
                                                placeholder="Search.."
                                            />
                                        </>
                                    }
                                />
                            </div>
                            <div className="col-lg-6 p-1">
                                <FilterableTable
                                    title={"Tally - " + tallyLOL.length}
                                    bodyFontSizePx={11}
                                    headerFontSizePx={11}
                                    dataArray={TallyLOLList}
                                    columns={[
                                        createCol('Ledger_Tally_Id', 'string', 'Tally ID'),
                                        createCol('Ledger_Name', 'string'),
                                        createCol('Party_Mobile_1', 'string', 'MobileNo'),
                                        {
                                            isVisible: 1,
                                            ColumnHeader: 'Created Date',
                                            isCustomCell: true,
                                            Cell: ({ row }) => row?.Date_Added ? createDateObject(row?.Date_Added) : ''
                                        },
                                        createCol('Party_District', 'string'),
                                        createCol('Party_Group', 'string'),
                                    ]}
                                    ButtonArea={
                                        <>
                                            <input
                                                type='search'
                                                className="cus-inpt p-1 w-auto"
                                                value={filters.searchTallyLol}
                                                onChange={e => setFilters(pre => ({ ...pre, searchTallyLol: e.target.value }))}
                                                placeholder="Search.."
                                            />
                                        </>
                                    }
                                />
                            </div>
                        </div>
                    </>
                )}
            </Card>

        </>
    )
}

export default TallyLolSyncDashboard;