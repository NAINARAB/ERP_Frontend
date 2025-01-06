import { useEffect, useState } from "react";
import { fetchLink } from '../../Components/fetchComponent';
import { checkIsNumber, getSessionUser, ISOString, isValidDate, LocalDate, NumberFormat, trimText } from "../../Components/functions";
import FilterableTable, { createCol, ButtonActions } from '../../Components/filterableTable2'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import { FilterAlt, ReadMore, Search, Today, Visibility } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const TallyStockJournalList = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const user = getSessionUser().user;
    const [sJournalData, setSJournalData] = useState([]);
    const [stockDetails, setStockDetails] = useState({
        soruceDetails: [],
        destinationDetails: [],
        rowDetails: {},
    });
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        refresh: false,
        filterDialog: false,
        showDetailsDialog: false,
    })

    useEffect(() => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `inventory/getTallyStockJournal?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}`,
            headers: {
                "Db": user?.Company_id
            }
        }).then(data => {
            if (data.success) {
                setSJournalData(data.data);
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        });
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
        setFilters(pre => ({ ...pre, filterDialog: false, showDetailsDialog: false }));
        setStockDetails({
            soruceDetails: [],
            destinationDetails: [],
            rowDetails: {},
        })
    }

    // const getDetails = (rowData) => {
    //     if (!checkIsNumber(rowData?.tally_id)) return;

    //     if (loadingOn) loadingOn();
    //     fetchLink({
    //         address: `inventory/getTallyStockJournal/sourceAndDestination?tally_id=${rowData?.tally_id}`,
    //         headers: {
    //             "Db": user?.Company_id
    //         }
    //     }).then(data => {
    //         if (data.success) {
    //             setStockDetails({
    //                 rowDetails: { ...rowData, stock_journal_date: LocalDate(rowData.stock_journal_date) },
    //                 soruceDetails: data.data[0].SourceDetails,
    //                 destinationDetails: data.data[0].DestinationDetails
    //             });
    //             // setFilters(pre => ({ ...pre, showDetailsDialog: true }));
    //         }
    //     }).catch(e => console.error(e)).finally(() => {
    //         if (loadingOff) loadingOff();
    //     })
    // }

    return (
        <>
            <FilterableTable
                title={
                    "Stock Journal ("
                    + (filters.fetchFrom ? ` From ${LocalDate(filters.fetchFrom)}` : '')
                    + (filters.fetchTo ? ` To ${LocalDate(filters.fetchTo)}` : '') + ' )'
                }
                dataArray={sJournalData}
                onClickFun={data => {
                    setFilters(pre => ({ ...pre, showDetailsDialog: true }));
                    setStockDetails({
                        rowDetails: { ...data, stock_journal_date: data.stock_journal_date ? LocalDate(data.stock_journal_date) : '' },
                        soruceDetails: data.SourceDetails,
                        destinationDetails: data.DestinationDetails
                    });
                }}
                columns={[
                    // {
                    //     isVisible: 1,
                    //     ColumnHeader: 'Action',
                    //     isCustomCell: true,
                    //     Cell: ({ row }) => (
                    //         <ButtonActions
                    //             buttonsData={[
                    //                 {
                    //                     name: 'Convert',
                    //                     icon: <ReadMore />,
                    //                     onclick: () => { }
                    //                 },
                    //                 // {
                    //                 //     name: 'Open',
                    //                 //     icon: <Visibility />,
                    //                 //     onclick: () => getDetails(row)
                    //                 // },
                    //             ]}
                    //         />
                    //     )
                    // },
                    createCol("stock_journal_date", "date", 'Date'),
                    createCol("voucher_name", "string", 'Type'),
                    createCol("journal_no", "string", 'Journal No'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Source',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <table className="table table-bordered m-0">
                                <tbody>
                                    {row?.SourceDetails?.map((source, index) => (
                                        <tr className="py-1" key={index}>
                                            {/* <td className="fa-12">{index + 1}</td> */}
                                            <td className="fa-12">{trimText(source?.stock_item_name)}</td>
                                            <td className="fa-12 text-primary">{NumberFormat(source?.source_consumt_qty)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Destination',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <table className="table table-bordered m-0">
                                <tbody>
                                    {row?.DestinationDetails?.map((destinaiton, index) => (
                                        <tr className="py-1" key={index}>
                                            {/* <td className="fa-12">{index + 1}</td> */}
                                            <td className="fa-12">{trimText(destinaiton?.stock_item_name)}</td>
                                            <td className="fa-12 text-primary">{NumberFormat(destinaiton?.destina_consumt_qty)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) 
                    },
                    createCol("broker_name", 'string', "Broker"),
                    createCol("transporter_name", 'string', "Transporter"),
                    createCol("loadman_name", 'string', "Loadman"),
                    createCol("othersone_name", 'string', "Others 1"),
                    createCol("otherstwo_name", 'string', "Others 2"),
                    createCol("othersthree_name", 'string', "Others 3"),
                    // createCol("othersfour_name", 'string', "Others 4"),
                    // createCol("othersfive_name", 'string', "Others 5"),
                    // createCol("otherssix_name", 'string', "Others 6"),

                ]}
                ButtonArea={
                    <>
                        <Tooltip title='Filters'>
                            <IconButton
                                size="small"
                                className="ms-2"
                                onClick={() => setFilters(pre => ({ ...pre, filterDialog: true }))}
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                    </>
                }
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
                <DialogActions>
                    <Button onClick={closeDialog}>close</Button>
                    <Button
                        onClick={() => {
                            const updatedFilters = {
                                Fromdate: filters?.Fromdate,
                                Todate: filters?.Todate
                            };
                            updateQueryString(updatedFilters);
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={filters.showDetailsDialog}
                onClose={closeDialog}
                fullScreen
            >
                <DialogTitle>Details</DialogTitle>
                <div className="d-flex p-2 flex-wrap">
                    {[
                        { key: 'stock_journal_date', title: 'Date' },
                        { key: 'broker_name', title: 'Broker' },
                        { key: 'transporter_name', title: 'Transporter' },
                        { key: 'loadman_name', title: 'Loadman' },
                        { key: 'othersone_name', title: 'Others 1' },
                        { key: 'otherstwo_name', title: 'Others 2' },
                        { key: 'othersthree_name', title: 'Others 3' },
                        { key: 'othersfour_name', title: 'Others 4' },
                        { key: 'othersfive_name', title: 'Others 5' },
                        { key: 'otherssix_name', title: 'Others 6' }
                    ].map((o, i) => (
                        <div key={i} className="d-flex justify-content-between p-2 border rounded-3 m-1">
                            <span className="px-2">{o.title}</span>
                            <span className="px-2">{stockDetails.rowDetails[o.key] ?? '-'}</span>
                        </div>
                    ))}
                </div>
                <DialogContent>
                    <FilterableTable
                        dataArray={stockDetails.soruceDetails}
                        columns={[
                            createCol("journal_no", "string", "Journal No"),
                            createCol("stock_item_name", "string", "Item Name"),
                            createCol("journal_date", "date", "Date"),
                            createCol("godown_name", "string", "Godown"),
                            createCol("source_batch_Lot_No", "string", "Batch/Lot No"),
                            createCol("source_consumt_qty", "number", "Quantity"),
                            createCol("source_consumt_rate", "number", "Rate"),
                            createCol("source_consumt_amt", "number", "Amount"),
                        ]}
                        title="Source Details"
                        disablePagination
                    />
                    <br />
                    <FilterableTable
                        dataArray={stockDetails.destinationDetails}
                        title="Destination Details"
                        columns={[
                            createCol("journal_no", "string", "Journal No"),
                            createCol("stock_item_name", "string", "Item Name"),
                            createCol("godown_name", "string", "Godown"),
                            createCol("journal_date", "date", "Date"),
                            createCol("destina_batch_Lot_No", "string", "Batch/Lot No"),
                            createCol("destina_consumt_qty", "number", "Quantity"),
                            createCol("destina_consumt_rate", "number", "Rate"),
                            createCol("destina_consumt_amt", "number", "Amount"),
                        ]}
                        disablePagination
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} variant="outlined">close</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default TallyStockJournalList;