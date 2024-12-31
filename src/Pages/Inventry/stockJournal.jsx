import { useEffect, useState } from "react";
import { ISOString, NumberFormat, Subraction, timeDuration, trimText } from '../../Components/functions';
import FilterableTable, { createCol, ButtonActions } from '../../Components/filterableTable2';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Edit, FilterAlt, Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { fetchLink } from "../../Components/fetchComponent";

const StockJournal = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const [stockJournalData, setStockJournalData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        filterDialog: false,
    });

    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `inventory/stockJournal?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}`,
        }).then(data => {
            if (data.success) {
                setStockJournalData(data.data);
            }
        }).finally(() => {
            if (loadingOff) loadingOff();
        }).catch(e => console.error(e))
    }, [filters.Fromdate, filters.Todate])

    const closeDialog = () => {
        setFilters({
            ...filters,
            filterDialog: false,
        });
    }

    return (
        <>
            <FilterableTable
                dataArray={stockJournalData}
                title="Stock Journal"
                maxHeightOption
                ButtonArea={
                    <>
                        <IconButton
                            size="small"
                            onClick={() => setFilters({ ...filters, filterDialog: true })}
                        ><FilterAlt /></IconButton>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/erp/inventory/stockJournal/create')}
                        >Add</Button>
                    </>
                }
                EnableSerialNumber
                initialPageCount={10}
                columns={[
                    createCol('Stock_Journal_date', 'date', 'Date'),
                    createCol('Journal_no', 'string', 'Journal number'),
                    createCol('Stock_Journal_Bill_type', 'string', 'Type'),
                    createCol('Stock_Journal_Voucher_type', 'string', 'Voucher'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Time Taken',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const startTime = row?.Start_Time ? new Date(row.Start_Time) : '';
                            const endTime = row.End_Time ? new Date(row.End_Time) : '';
                            const timeTaken = (startTime && endTime) ? timeDuration(startTime, endTime) : '00:00';
                            return (
                                <span className="cus-badge bg-light">{timeTaken}</span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Distance',
                        isCustomCell: true,
                        Cell: ({ row }) => NumberFormat(Subraction(row?.Vehicle_End_KM, row?.Vehicle_Start_KM))
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Staffs',
                        isCustomCell: true,
                        Cell: ({ row }) => row?.StaffsDetails?.map((staff, index) => (
                            <div className="py-1" key={index}>
                                <span className="cus-badge bg-light border">
                                    {(index + 1) + '.' + trimText(staff.Cost_Center_Name)}
                                </span>
                            </div>
                        ))
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Source',
                        isCustomCell: true,
                        Cell: ({ row }) => row?.SourceDetails?.map((source, index) => (
                            <div className="py-1" key={index}>
                                <span className="cus-badge bg-light border">
                                    {(index + 1) + '.' + trimText(source.Product_Name)}
                                </span>
                            </div>
                        ))
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Destination',
                        isCustomCell: true,
                        Cell: ({ row }) => row?.DestinationDetails?.map((destination, index) => (
                            <div className="py-1" key={index}>
                                <span className="cus-badge bg-light border">
                                    {(index + 1) + '.' + trimText(destination.Product_Name)}
                                </span>
                            </div>
                        ))
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Action',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <ButtonActions 
                                buttonsData={[
                                    {
                                        name: 'Edit',
                                        icon: <Edit className="fa-14" />,
                                        onclick: () => navigate('/erp/inventory/stockJournal/create', {
                                            state: {
                                                ...row,
                                                isEditable: false,
                                            },
                                        }),
                                    },
                                    {
                                        name: 'Open',
                                        icon: <Visibility className="fa-14" />,
                                        onclick: () => navigate('/erp/inventory/stockJournal/create', {
                                            state: {
                                                ...row,
                                                isEditable: true,
                                            },
                                        }),
                                    },
                                ]}
                            />
                        )
                    }
                ]}
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
                </DialogActions>
            </Dialog>
        </>
    )
}

export default StockJournal;