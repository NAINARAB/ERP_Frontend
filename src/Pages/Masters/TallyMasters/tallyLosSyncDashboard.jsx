import { useEffect, useMemo, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { filterableText, getSessionUser, isEqualNumber } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { Button, Card } from "@mui/material";
import { toast } from 'react-toastify';
import { Sync, Visibility } from "@mui/icons-material";

const TallyLosSyncDashboard = ({ loadingOn, loadingOff }) => {
    const [ERPLOS, setERPLOS] = useState([]);
    const [tallyLOS, setTallyLOS] = useState([]);
    const user = getSessionUser().user;
    const [filters, setFilters] = useState({
        refresh: false,
        viewNotSynced: false,
        searchERPLos: '',
        searchTallyLos: '',
        searchNotSynced: '',
    })

    useEffect(() => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `masters/tallyMaster/items`,
            headers: {
                "Db": user?.Company_id
            }
        }).then(data => {
            if (data.success) {
                const tallyLOS = Array.isArray(data?.others?.tallyResult) ? data?.others?.tallyResult : [];
                setERPLOS(data.data);
                setTallyLOS(tallyLOS);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff()
        })
    }, [filters.refresh])

    const syncLOS = () => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `masters/products/losSync`,
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
        return tallyLOS.filter(talFil =>
            !ERPLOS.some(erpFil =>
                isEqualNumber(talFil.Stock_Tally_Id, erpFil.Stock_Tally_Id)
            )
        );
    }, [ERPLOS.length, tallyLOS.length])

    const ERPLOSList = useMemo(() => {
        return filters.searchERPLos ? ERPLOS.filter(obj =>
            filterableText(Object.values(obj).join(" ")).includes(filterableText(filters.searchERPLos))
        ) : ERPLOS
    }, [filters.searchERPLos, ERPLOS.length]);

    const TallyLOLList = useMemo(() => {
        return filters.searchTallyLos ? tallyLOS.filter(obj =>
            filterableText(Object.values(obj).join(" ")).includes(filterableText(filters.searchTallyLos))
        ) : tallyLOS;
    }, [filters.searchTallyLos, tallyLOS.length])

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
                        <h5 className="flex-grow-1">LOS SYNC (Differents: {notSyncedList.length})</h5>
                        <Button size='small' onClick={syncLOS} startIcon={<Sync />}>Sync now</Button>
                        <Button size='small'
                            onClick={() => setFilters(pre => ({ ...pre, viewNotSynced: !pre.viewNotSynced }))}
                            startIcon={<Visibility />}
                        >View Not Synced</Button>
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
                            createCol('Stock_Tally_Id', 'string', 'Tally ID'),
                            createCol('Stock_Item', 'string'),
                            createCol('Brand', 'string', 'MobileNo'),
                            createCol('Group_ST', 'string'),
                            createCol('Bag', 'string'),
                            createCol('Stock_Group', 'string'),
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
                                    title={"ERP - " + ERPLOS.length}
                                    bodyFontSizePx={11}
                                    headerFontSizePx={11}
                                    dataArray={ERPLOSList}
                                    columns={[
                                        createCol('Stock_Tally_Id', 'string', 'Tally ID'),
                                        createCol('Stock_Item', 'string'),
                                        createCol('Brand', 'string', 'MobileNo'),
                                        createCol('Group_ST', 'string'),
                                        createCol('Bag', 'string'),
                                        createCol('Stock_Group', 'string'),
                                    ]}
                                    ButtonArea={
                                        <>
                                            <input
                                                type='search'
                                                className="cus-inpt p-1 w-auto"
                                                value={filters.searchERPLos}
                                                onChange={e => setFilters(pre => ({ ...pre, searchERPLos: e.target.value }))}
                                                placeholder="Search.."
                                            />
                                        </>
                                    }
                                />
                            </div>
                            <div className="col-lg-6 p-1">
                                <FilterableTable
                                    title={"Tally - " + tallyLOS.length}
                                    bodyFontSizePx={11}
                                    headerFontSizePx={11}
                                    dataArray={TallyLOLList}
                                    columns={[
                                        createCol('Stock_Tally_Id', 'string', 'Tally ID'),
                                        createCol('Stock_Item', 'string'),
                                        createCol('Brand', 'string', 'MobileNo'),
                                        createCol('Group_ST', 'string'),
                                        createCol('Bag', 'string'),
                                        createCol('Stock_Group', 'string'),
                                    ]}
                                    ButtonArea={
                                        <>
                                            <input
                                                type='search'
                                                className="cus-inpt p-1 w-auto"
                                                value={filters.searchTallyLos}
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

export default TallyLosSyncDashboard;