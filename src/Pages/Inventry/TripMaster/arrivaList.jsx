import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { checkIsNumber, isEqualNumber, ISOString, getSessionFiltersByPageId, setSessionFilters, toArray } from "../../../Components/functions";
import { Edit, FilterAlt, ClearAll, Search } from "@mui/icons-material";
import { fetchLink } from "../../../Components/fetchComponent";
import Select from 'react-select';
import { customSelectStyles } from "../../../Components/tablecolumn";
import CreateArrival from "./createArrival";

const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
    FromGodown: { label: 'Select Godown', value: '' },
    ToGodown: { label: 'Select Godown', value: '' },
    Items: { label: 'Select Product', value: '' },
    TripConvertion: { label: 'ALL', value: '' },
};

const ArrivalList = ({ loadingOn, loadingOff, switchDisplay }) => {
    const location = useLocation();
    const pageID = 'arrival_master_list';
    const [tripData, setTripData] = useState([]);

    const [filters, setFilters] = useState({
        ...defaultFilters,
        filterDialog: false,
        refresh: false,
        addDialog: false
    });

    const [filterDropDown, setFilterDropDown] = useState({
        products: [],
        fromLocations: [],
        toLocations: []
    });

    useEffect(() => {
        fetchLink({
            address: `inventory/tripSheet/arrivalEntry/filters`
        }).then(data => {
            if (data.success) {
                setFilterDropDown(pre => ({
                    ...pre,
                    products: toArray(data?.others?.products),
                    fromLocations: toArray(data?.others?.fromLocations),
                    toLocations: toArray(data?.others?.toLocations),
                }));
            }
        }).catch(e => console.error(e));
    }, []);

    useEffect(() => {
        const sessionFilters = getSessionFiltersByPageId(pageID);
        setFilters(pre => ({ ...pre, ...sessionFilters }));
    }, []);

    useEffect(() => {
        const { Fromdate, Todate, FromGodown, ToGodown, Items, TripConvertion } = filters;

        if (loadingOn) loadingOn();

        const convertedStatus = TripConvertion?.value === 'Converted' ? 1
            : TripConvertion?.value === 'Not Converted' ? 0
                : 'ALL';

        fetchLink({
            address: `inventory/tripSheet/arrivalEntry?
            Fromdate=${Fromdate}&
            Todate=${Todate}&
            FromGodown=${FromGodown?.value || ''}&
            ToGodown=${ToGodown?.value || ''}&
            ProductId=${Items?.value || ''}&
            convertedStatus=${convertedStatus}`,
        }).then(data => {
            if (data.success) {
                setTripData(data.data);
            } else {
                setTripData([]);
            }
        }).finally(() => {
            if (loadingOff) loadingOff();
        }).catch(e => console.error(e))

        setSessionFilters(pageID, { Fromdate, Todate, FromGodown, ToGodown, Items, TripConvertion });
    }, [filters.refresh]);

    const closeDialog = () => {
        setFilters(pre => ({ ...pre, filterDialog: false }));
    }

    const EditComp = ({ row }) => {
        const [open, setOpen] = useState(false);

        return !checkIsNumber(row?.Trip_Id) && (
            <>
                <IconButton onClick={() => setOpen(true)}>
                    <Edit className="fa-20" />
                </IconButton>

                {open && (
                    <CreateArrival
                        productValue={{ ...row, dialog: open }}
                        open={open}
                        close={() => setOpen(false)}
                        onSubmit={() => {
                            setOpen(false);
                            setFilters(pre => ({ ...pre, refresh: !pre.refresh }));
                        }}
                        loadingOff={loadingOff} loadingOn={loadingOn}
                    >
                        {/* H */}
                    </CreateArrival>
                )}
            </>
        );
    };

    return (
        <>

            <FilterableTable
                dataArray={tripData}
                title="Arrival List"
                maxHeightOption
                ExcelPrintOption
                EnableSerialNumber
                initialPageCount={10}
                headerFontSizePx={13}
                bodyFontSizePx={11}
                ButtonArea={
                    <>
                        <IconButton
                            size="small"
                            onClick={() => setFilters(pre => ({ ...pre, filterDialog: true }))}
                        ><FilterAlt /></IconButton>
                        <CreateArrival
                            onSubmit={() => setFilters(pre => ({ ...pre, refresh: !pre.refresh }))}
                            open={filters.addDialog}
                            close={() => setFilters(pre => ({ ...pre, addDialog: false }))}
                            loadingOff={loadingOff} loadingOn={loadingOn}
                        >
                            <Button onClick={switchDisplay}>
                                Add
                            </Button>
                        </CreateArrival>
                    </>
                }
                columns={[
                    createCol('Arrival_Date', 'date', 'Date'),
                    createCol('Product_Name', 'string', 'Item'),
                    createCol('QTY', 'string', 'Weight'),
                    createCol('Gst_Rate', 'string', 'Rate'),
                    createCol('Batch_No', 'string', 'Batch'),
                    createCol('FromLocation', 'string', 'From'),
                    createCol('ToLocation', 'string', 'To'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Trip-?',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const Trip_Id = checkIsNumber(row?.Arrival_Id)
                            return (
                                <span className={`cus-badge text-white fa-10 fw-bold ${Trip_Id ? 'bg-success' : 'bg-warning'}`}>
                                    {Trip_Id ? 'Converted' : 'Not'}
                                </span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'P-Orders',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            // const convertedWeight = row?.ConvertedAsOrders?.reduce((acc, order) => Addition(acc, order?.Weight), 0);
                            // const { cls, str } = bgColor(row?.QTY, convertedWeight)
                            const order = isEqualNumber(row?.ConvertedAsOrder, 1);
                            return (
                                <span className={`cus-badge text-white fa-10 fw-bold ${order ? ' bg-success ' : ' bg-warning '}`}>
                                    {order ? 'Converted' : 'Not'}
                                </span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'P-Invoices',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            // const convertedWeight = row?.ConvertedAsInvoices?.reduce((acc, order) => Addition(acc, order?.Bill_Qty), 0);
                            // const { cls, str } = bgColor(row?.QTY, convertedWeight)
                            const invoice = isEqualNumber(row?.ConvertedAsInvoice, 1);
                            return (
                                <span className={`cus-badge text-white fa-10 fw-bold ${invoice ? ' bg-success ' : ' bg-warning '}`}>
                                    {invoice ? 'Converted' : 'Not'}
                                </span>
                            )
                        }
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Action',
                        isCustomCell: true,
                        Cell: ({ row }) => <EditComp row={row} />
                    }
                ]}
            />

            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog}
                fullWidth maxWidth='md'
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

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Items</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.Items}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, Items: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={filterDropDown.products}

                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Items"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From Godown</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.FromGodown}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, FromGodown: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={filterDropDown.fromLocations}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select From Godown"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To Godown</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.ToGodown}
                                            onChange={(selectedOptions) => {
                                                setFilters((prev) => ({ ...prev, ToGodown: selectedOptions }))
                                            }}
                                            menuPortalTarget={document.body}
                                            options={filterDropDown.toLocations}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select To Godown"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Trip Convertion</td>
                                    <td colSpan={3}>
                                        <select
                                            value={filters.TripConvertion}
                                            onChange={e => setFilters(pre => ({ ...pre, TripConvertion: e.target.value }))}
                                            className="cus-inpt p-2"
                                        >
                                            <option value="">ALL</option>
                                            <option value="Converted">Converted</option>
                                            <option value="Not Converted">Not Converted</option>
                                        </select>
                                    </td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilters(
                        pre => ({
                            ...defaultFilters,
                            filterDialog: true,
                            refresh: !pre.refresh
                        }))}
                        startIcon={<ClearAll />}
                        color="error"
                    >Reset</Button>
                    <Button onClick={closeDialog}>close</Button>
                    <Button
                        onClick={() => setFilters(pre => ({
                            ...pre,
                            filterDialog: false,
                            refresh: !pre.refresh
                        }))}
                        startIcon={<Search />}
                    >Search</Button>
                </DialogActions>
            </Dialog >
        </>
    )
}


export default ArrivalList;