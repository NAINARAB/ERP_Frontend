import { useEffect, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { getSessionUser, isEqualNumber, LocalDate, Subraction } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { Card, IconButton, Tooltip } from "@mui/material";
import { toast } from 'react-toastify';
import { GroupAdd, Sync, Visibility } from "@mui/icons-material";


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
        searchTallyLol: ''
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
            if (data.success) toast.success(data.message);
            else toast.error(data.message);
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        })
    }

    const notSyncedList = tallyLOL.filter(talFil => 
        !ERPLOL.some(erpFil => 
            isEqualNumber(talFil.Ledger_Tally_Id, erpFil.Ledger_Tally_Id)
        )
    );

    // const ERPLOL

    return (
        <>
            <Card>
                <div
                    className="px-3 py-2 fa-14"
                >
                    <div className="d-flex flex-wrap align-items-center">
                        <h5 className="flex-grow-1">LOL SYNC (Differents: {notSyncedList.length})</h5>
                        <Tooltip title='Sync Tally LOL'>
                            <IconButton size='small' onClick={syncLOL}><Sync /></IconButton>
                        </Tooltip>
                        <Tooltip title='View Difference'>
                            <IconButton size='small' 
                                onClick={() => setFilters(pre => ({...pre, viewNotSynced: !pre.viewNotSynced}))}
                            ><Visibility /></IconButton>
                        </Tooltip>
                    </div>
                    <div className="d-flex flex-wrap align-items-center">

                    </div>
                </div>

                {filters.viewNotSynced ? (
                    <FilterableTable
                        title={"Not synced list "}
                        bodyFontSizePx={11}
                        headerFontSizePx={11}
                        dataArray={notSyncedList}
                        columns={[
                            createCol('Ledger_Tally_Id', 'string', 'Tally ID'),
                            createCol('Ledger_Name', 'string'),
                            createCol('Party_Mobile_1', 'string', 'MobileNo'),
                            {
                                isVisible: 1,
                                ColumnHeader: 'Staffs',
                                isCustomCell: true,
                                Cell: ({ row }) => row?.Date_Added ? createDateObject(row?.Date_Added) : ''
                            },
                            createCol('Party_District', 'string'),
                            createCol('Party_Group', 'string'),
                        ]}
                    />
                ) : (
                    <>
                        <div className="row">
                            <div className="col-lg-6 p-1">
                                <FilterableTable
                                    title={"ERP - " + ERPLOL.length}
                                    bodyFontSizePx={11}
                                    headerFontSizePx={11}
                                    dataArray={ERPLOL}
                                    columns={[
                                        createCol('Ledger_Tally_Id', 'string', 'Tally ID'),
                                        createCol('Ledger_Name', 'string'),
                                        createCol('Party_Mobile_1', 'string', 'MobileNo'),
                                        {
                                            isVisible: 1,
                                            ColumnHeader: 'Staffs',
                                            isCustomCell: true,
                                            Cell: ({ row }) => row?.Date_Added ? createDateObject(row?.Date_Added) : ''
                                        },
                                        createCol('Party_District', 'string'),
                                        createCol('Party_Group', 'string'),
                                    ]}
                                />
                            </div>
                            <div className="col-lg-6 p-1">
                                <FilterableTable
                                    title={"Tally - " + tallyLOL.length}
                                    bodyFontSizePx={11}
                                    headerFontSizePx={11}
                                    dataArray={tallyLOL}
                                    columns={[
                                        createCol('Ledger_Tally_Id', 'string', 'Tally ID'),
                                        createCol('Ledger_Name', 'string'),
                                        createCol('Party_Mobile_1', 'string', 'MobileNo'),
                                        {
                                            isVisible: 1,
                                            ColumnHeader: 'Staffs',
                                            isCustomCell: true,
                                            Cell: ({ row }) => row?.Date_Added ? createDateObject(row?.Date_Added) : ''
                                        },
                                        createCol('Party_District', 'string'),
                                        createCol('Party_Group', 'string'),
                                    ]}
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