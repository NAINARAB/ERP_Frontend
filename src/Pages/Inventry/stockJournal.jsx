import { useEffect, useMemo, useState } from "react";
import { Addition, ISOString, isValidDate, trimText } from '../../Components/functions';
import FilterableTable, { createCol, ButtonActions } from '../../Components/filterableTable2';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import { Edit, FilterAlt, Search, Sync, Visibility } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchLink } from "../../Components/fetchComponent";
import { toast } from 'react-toastify'
import { customSelectStyles } from "../../Components/tablecolumn";
import Select from 'react-select';

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const StockJournal = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const query = useQuery();
    const [stockJournalData, setStockJournalData] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        filterDialog: false,
        refresh: false,
        BillType: '',
        BranchName: '',
        VoucherType: '',
        FromGodown: [],
        ToGodown: [],
        Staffs: [],
        SourceItems: [],
        DestinationItems: [],
    });

    const [activeFilter, setActiveFilter] = useState({
        BillType: false,
        VoucherType: false,
        BranchName: false,
        FromGodown: false,
        ToGodown: false,
        Staffs: false,
        SourceItems: false,
        DestinationItems: false
    })

    useEffect(() => {
        setActiveFilter({
            BillType: filters.BillType ? true : false,
            VoucherType: filters.VoucherType ? true : false,
            BranchName: filters.BranchName ? true : false,
            FromGodown: filters.FromGodown.length > 0 ? true : false,
            ToGodown: filters.ToGodown.length > 0 ? true : false,
            Staffs: filters.Staffs.length > 0 ? true : false,
            SourceItems: filters.SourceItems.length > 0 ? true : false,
            DestinationItems: filters.DestinationItems.length > 0 ? true : false
        })
    }, [filters])

    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `inventory/stockJournal?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}`,
        }).then(data => {
            if (data.success) {
                setStockJournalData(data.data);
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

    useEffect(() => {
        const Fromdate = (stateDetails?.Fromdate && isValidDate(stateDetails?.Fromdate)) ? ISOString(stateDetails?.Fromdate) : null;
        const Todate = (stateDetails?.Todate && isValidDate(stateDetails?.Todate)) ? ISOString(stateDetails?.Todate) : null;
        const VoucherType = stateDetails?.Voucher_Type;
        if (VoucherType) setFilters(pre => ({ ...pre, VoucherType: VoucherType }));
        if (Fromdate && Todate) {
            setFilters(pre => ({ ...pre, Fromdate: Fromdate, Todate: Todate }))
            updateQueryString({ Fromdate, Todate });
        }

    }, [stateDetails])

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

    const syncTallyStockJournalData = () => {
        fetchLink({
            address: `inventory/stockJournal/tallySync`,
        }).then(data => {
            if (data.success) toast.success(data.message)
            else toast.error(data.message)
        }).catch(e => console.error(e))
    }

    const uniqueBillType = useMemo(() => {
        return [...new Set(stockJournalData.map(sj => sj.Stock_Journal_Bill_type))].map(bType => ({ value: bType, label: bType }));
    }, [stockJournalData]);

    const uniqueVoucherType = useMemo(() => {
        return [...new Set(stockJournalData.map(sj => sj.Stock_Journal_Voucher_type))].map(vType => ({ value: vType, label: vType }));
    }, [stockJournalData])

    const uniqueBranch = useMemo(() => {
        return [...new Set(stockJournalData.map(sj => sj.BranchName))].map(branch => ({ value: branch, label: branch }));
    }, [stockJournalData]);

    const uniqueFromLocations = useMemo(() => {
        const allLocations = stockJournalData.flatMap(sj =>
            sj.SourceDetails.map(product => product.Godown_Name)
        );
        return [...new Set(allLocations)].map((location) => ({
            value: location,
            label: location,
        }));
    }, [stockJournalData]);

    const uniqueToLocations = useMemo(() => {
        const allLocations = stockJournalData.flatMap(sj =>
            sj.DestinationDetails.map(product => product.Godown_Name)
        );
        return [...new Set(allLocations)].map((location) => ({
            value: location,
            label: location,
        }));
    }, [stockJournalData]);

    const uniqueSourceItems = useMemo(() => {
        const allItems = stockJournalData.flatMap(sj =>
            sj.SourceDetails.map((product) => product.Product_Name)
        );
        return [...new Set(allItems)].map(items => ({
            value: items,
            label: items,
        }));
    }, [stockJournalData]);

    const uniqueDestinationItems = useMemo(() => {
        const allItems = stockJournalData.flatMap(sj =>
            sj.DestinationDetails.map((product) => product.Product_Name)
        );
        return [...new Set(allItems)].map(items => ({
            value: items,
            label: items,
        }));
    }, [stockJournalData]);

    const uniqueStaffs = useMemo(() => {
        const allStaffs = stockJournalData.flatMap((trip) =>
            trip.StaffsDetails.map((staff) => staff.Cost_Center_Name)
        );
        return [...new Set(allStaffs)].map((name) => ({
            value: name,
            label: name,
        }));
    }, [stockJournalData]);

    const filteredData = useMemo(() => {
        return stockJournalData.filter((stj) => {
            const hasFromGodownMatch = activeFilter.FromGodown
                ? stj.SourceDetails.some((product) =>
                    filters.FromGodown.some((selected) => selected.value === product.Godown_Name)
                )
                : true;

            const hasToGodownMatch = activeFilter.ToGodown
                ? stj.DestinationDetails.some((product) =>
                    filters.ToGodown.some((selected) => selected.value === product.Godown_Name)
                )
                : true;

            const hasSourceItemMatch = activeFilter.SourceItems
                ? stj.SourceDetails.some((product) =>
                    filters.SourceItems.some((selected) => selected.value === product.Product_Name)
                )
                : true;

            const hasDestinationItemMatch = activeFilter.DestinationItems
                ? stj.DestinationDetails.some((product) =>
                    filters.DestinationItems.some((selected) => selected.value === product.Product_Name)
                )
                : true;

            const hasEmployeeMatch = activeFilter.Staffs
                ? stj.Employees_Involved.some((staff) =>
                    filters.Staffs.some((selected) => selected.value === staff.Emp_Name)
                )
                : true;

            const hasBranchMatch = activeFilter.BranchName
                ? stj.BranchName === filters.BranchName
                : true;

            const hasBillTypeMatch = activeFilter.BillType
                ? stj.Stock_Journal_Bill_type === filters.BillType
                : true;

            const hasVoucherTypeMatch = activeFilter.VoucherType
                ? stj.Stock_Journal_Voucher_type === filters.VoucherType
                : true;

            return (
                hasFromGodownMatch &&
                hasToGodownMatch &&
                hasSourceItemMatch &&
                hasDestinationItemMatch &&
                hasEmployeeMatch &&
                hasBranchMatch &&
                hasBillTypeMatch &&
                hasVoucherTypeMatch
            );
        });
    }, [
        stockJournalData,
        activeFilter,
        // filters.BillType,
        // filters.BranchName,
        // filters.VoucherType,
        // filters.FromGodown,
        // filters.ToGodown,
        // filters.Staffs,
        // filters.SourceItems,
        // filters.DestinationItems,
    ]);

    const calculateDifference = (sourceQty, destQty) => {
        if (sourceQty === 0) return 0;
    
        return ((sourceQty - destQty) / sourceQty) * 100;
    };


    return (
        <>
            <FilterableTable
                headerFontSizePx={11}
                bodyFontSizePx={11}
                dataArray={(
                    filters.BillType || filters.BranchName || filters.VoucherType ||
                    filters.SourceItems.length > 0 || filters.DestinationItems.length > 0 ||
                    filters.FromGodown.length > 0 || filters.ToGodown.length > 0
                ) ? filteredData : stockJournalData}
                title="Stock Journal"
                maxHeightOption
                ButtonArea={
                    <>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/erp/inventory/stockJournal/create')}
                        >Add</Button>
                        <Tooltip title='Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setFilters({ ...filters, filterDialog: true })}
                            ><FilterAlt /></IconButton>
                        </Tooltip>
                        <Tooltip title='Sync Tally Stock Journal'>
                            <IconButton
                                size="small"
                                onClick={syncTallyStockJournalData}
                            ><Sync /></IconButton>
                        </Tooltip>
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
                        ColumnHeader: 'Staffs',
                        isCustomCell: true,
                        Cell: ({ row }) => row?.StaffsDetails?.length
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Source',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <table className="table table-borderless fa-12 m-0">
                                <tbody>
                                    <tr>
                                        <td>Products</td>
                                        <td>{row?.SourceDetails?.length}</td>
                                        <td>QTY</td>
                                        <td>{row?.SourceDetails?.reduce((acc, source) => Addition(acc, source.Sour_Qty), 0)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        )
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Destination',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <table className="table table-borderless fa-12 m-0">
                                <tbody>
                                    <tr>
                                        <td>Products</td>
                                        <td>{row?.DestinationDetails?.length}</td>
                                        <td>QTY</td>
                                        <td>{row?.DestinationDetails?.reduce((acc, destination) => Addition(acc, destination.Dest_Qty), 0)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        )
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Difference (%)',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const sourceQtySum = row?.SourceDetails?.reduce((acc, source) => Addition(acc, source.Sour_Qty), 0);
                            const destinationQtySum = row?.DestinationDetails?.reduce((acc, destination) => Addition(acc, destination.Dest_Qty), 0);
                            return calculateDifference(sourceQtySum, destinationQtySum);
                        }
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
                isExpendable={true}
                expandableComp={({ row }) => (
                    <div className="row">
                        <div className="col-md-6 p-1">
                            <FilterableTable
                                title="Source"
                                headerFontSizePx={11}
                                bodyFontSizePx={11}
                                EnableSerialNumber
                                dataArray={row?.SourceDetails}
                                columns={[
                                    createCol('Product_Name', 'string', 'Item'),
                                    createCol('Godown_Name', 'string', 'Godown'),
                                    createCol('Sour_Qty', 'number', 'QTY'),
                                    // createCol('Sour_Unit', 'string', 'Unit'),
                                    // createCol('Sour_Rate', 'number', 'Rate'),
                                    // createCol('Sour_Amt', 'number', 'Amount'),
                                ]}
                                disablePagination
                            />
                        </div>
                        <div className="col-md-6 p-1">
                            <FilterableTable
                                title="Destination"
                                headerFontSizePx={11}
                                bodyFontSizePx={11}
                                EnableSerialNumber
                                dataArray={row?.DestinationDetails}
                                columns={[
                                    createCol('Product_Name', 'string', 'Item'),
                                    createCol('Godown_Name', 'string', 'Godown'),
                                    createCol('Dest_Qty', 'number', 'QTY'),
                                    // createCol('Dest_Unit', 'string', 'Unit'),
                                    // createCol('Dest_Rate', 'number', 'Rate'),
                                    // createCol('Dest_Amt', 'number', 'Amount'),
                                ]}
                                disablePagination
                            />
                        </div>
                    </div>
                )}
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
                                    <td style={{ verticalAlign: 'middle' }}>Journal Type</td>
                                    <td>
                                        <select
                                            value={filters.BillType}
                                            className="cus-inpt p-2 "
                                            onChange={e => setFilters(pre => ({ ...pre, BillType: e.target.value }))}
                                        >
                                            <option value="">All Type</option>
                                            {uniqueBillType.map((type, index) => (
                                                <option value={type.value} key={index}>{type.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ verticalAlign: 'middle' }}>Branch</td>
                                    <td>
                                        <select
                                            value={filters.BranchName}
                                            className="cus-inpt p-2 "
                                            onChange={e => setFilters(pre => ({ ...pre, BranchName: e.target.value }))}
                                        >
                                            <option value="">All Branch</option>
                                            {uniqueBranch.map((branch, index) => (
                                                <option value={branch.value} key={index}>{branch.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Voucher Type</td>
                                    <td colSpan={3}>
                                        <select
                                            value={filters.VoucherType}
                                            className="cus-inpt p-2 "
                                            onChange={e => setFilters(pre => ({ ...pre, VoucherType: e.target.value }))}
                                        >
                                            <option value="">All Voucher Type</option>
                                            {uniqueVoucherType.map((voucher, index) => (
                                                <option value={voucher.value} key={index}>{voucher.label}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>From Godown</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.FromGodown}
                                            onChange={selectedOptions =>
                                                setFilters(prev => ({ ...prev, FromGodown: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueFromLocations}
                                            isMulti
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
                                            onChange={selectedOptions =>
                                                setFilters(prev => ({ ...prev, ToGodown: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueToLocations}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select To Godown"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Staffs</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.Staffs}
                                            onChange={selectedOptions =>
                                                setFilters((prev) => ({ ...prev, Staffs: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueStaffs}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Staff"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Source Items</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.SourceItems}
                                            onChange={selectedOptions =>
                                                setFilters(prev => ({ ...prev, SourceItems: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueSourceItems}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Source Items"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Destination Items</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.DestinationItems}
                                            onChange={selectedOptions =>
                                                setFilters(prev => ({ ...prev, DestinationItems: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueDestinationItems}
                                            isMulti
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Destination Items"}
                                            maxMenuHeight={300}
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
                            closeDialog();
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default StockJournal;