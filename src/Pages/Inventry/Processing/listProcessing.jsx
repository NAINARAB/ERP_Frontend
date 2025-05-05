import { useEffect, useMemo, useState } from "react";
import { checkIsNumber, isEqualNumber, ISOString, isValidDate, Subraction } from '../../../Components/functions';
import FilterableTable, { formatString } from '../../../Components/filterableTable2';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import { Edit, FilterAlt, Search } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchLink } from "../../../Components/fetchComponent";
import { customSelectStyles } from "../../../Components/tablecolumn";
import Select from 'react-select';
import ProcessingView from "./normalView";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const transformStockJournalData = (data) => {
    let transformedData = [];

    data.forEach((entry, entryIndex) => {
        const maxRows = Math.max(entry?.SourceDetails?.length, entry?.DestinationDetails?.length, entry?.StaffsDetails?.length);

        const totalSourceQty = entry.SourceDetails.reduce((sum, item) => sum + (item.Sour_Qty || 0), 0);
        const totalDestinationQty = entry.DestinationDetails.reduce((sum, item) => sum + (item.Dest_Qty || 0), 0);

        const diffPercentage = totalSourceQty !== 0
            ? ((totalDestinationQty - totalSourceQty) / totalSourceQty) * 100
            : 0;

        transformedData.push({
            SNo: entryIndex + 1,
            Date: ISOString(entry.Process_date),
            VoucherType: entry.VoucherTypeGet,
            VoucherNo: entry.PR_Inv_Id,
            SourceItem: "",
            SourceGodown: "",
            SourceQty: totalSourceQty,
            DestinationItem: "",
            DestinationGodown: "",
            DestinationQty: totalDestinationQty,
            DifferentQTY: Subraction(totalDestinationQty, totalSourceQty),
            DifferentPercentage: diffPercentage,
            Staffs: "",
            processObjecet: entry
        });

        for (let i = 0; i < maxRows; i++) {
            transformedData.push({
                SNo: '',
                Date: '',
                VoucherType: '',
                VoucherNo: '',
                SourceItem: entry.SourceDetails[i]?.Product_Name || "",
                SourceGodown: entry.SourceDetails[i]?.Godown_Name || "",
                SourceQty: entry.SourceDetails[i]?.Sour_Qty || "",
                DestinationItem: entry.DestinationDetails[i]?.Product_Name || "",
                DestinationGodown: entry.DestinationDetails[i]?.Godown_Name || "",
                DestinationQty: entry.DestinationDetails[i]?.Dest_Qty || "",
                DifferentQTY: "",
                DifferentPercentage: "",
                Staffs: entry.StaffsDetails[i]?.EmpNameGet || "",
            });
        }
    });

    return transformedData;
};

const StockMangement = ({ loadingOn, loadingOff, EditRights, AddRights, DeleteRights }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const [responseData, setResponseData] = useState([]);
    const [godowns, setGodowns] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        sourceGodown: "",
        destinationGodown: "",
        VoucherType: { label: 'Select', value: '' },
        Branch: { label: 'Select', value: '' },
        filterDialog: false,
        refresh: false,
        view: 'report'
    })

    useEffect(() => {
        fetchLink({
            address: `dataEntry/godownLocationMaster`
        }).then(data => {
            const godownLocations = (data.success ? data.data : []).sort(
                (a, b) => String(a?.Godown_Name).localeCompare(b?.Godown_Name)
            );
            setGodowns(godownLocations);
        })
    }, [])

    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `inventory/stockProcessing?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}&billType=PROCESSING`,
        }).then(data => {
            if (data.success) {
                // const filterForEmptyArrays = Array.isArray(data.data)
                //     ? data.data.filter(stj => !(
                //         stj?.SourceDetails?.length === 0
                //         && stj?.DestinationDetails?.length === 0
                //         && stj?.StaffsDetails?.length === 0
                //     ))
                //     : []
                setResponseData(data.data)
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

    const uniqueVoucher = useMemo(() => {
        const allVoucher = responseData.map(pro => pro?.VoucherTypeGet);
        return [...new Set(allVoucher)].map((name) => ({
            value: name,
            label: name,
        }));
    }, [responseData]);

    const uniqueBranch = useMemo(() => {
        return [...new Set(responseData.map(sj => sj.BranchName))].map(branch => ({ value: branch, label: branch }));
    }, [responseData]);

    const filteredData = useMemo(() => {
        return responseData.filter((stj) => {
            const hasFromGodownMatch = filters.sourceGodown
                ? stj.SourceDetails.some((product) =>
                    isEqualNumber(filters.sourceGodown, product.Sour_Goodown_Id)
                )
                : true;

            const hasToGodownMatch = filters.destinationGodown
                ? stj.DestinationDetails.some((product) =>
                    isEqualNumber(filters.destinationGodown, product.Dest_Goodown_Id)
                )
                : true;

            const hasVoucherMatch = filters.VoucherType?.value
                ? filters.VoucherType.value === stj.VoucherTypeGet
                : true;

            const hasBranchMatch = filters.Branch?.value
                ? filters.Branch.value === stj.BranchName
                : true;

            return (
                hasFromGodownMatch &&
                hasToGodownMatch &&
                hasVoucherMatch &&
                hasBranchMatch
            );
        });
    }, [
        filters.sourceGodown,
        filters.destinationGodown,
        filters.VoucherType,
        filters.Branch,
        responseData
    ]);

    const displayData = useMemo(() => {
        return (filters.sourceGodown || filters.destinationGodown || filters.VoucherType.value || filters.Branch.value)
            ? transformStockJournalData(filteredData)
            : transformStockJournalData(responseData)
    }, [filters.sourceGodown, filters.destinationGodown, filters.VoucherType, filters.Branch, filteredData, responseData]);

    const ButtonArea = () => (
        <>
            <Tooltip title='Filters'>
                <IconButton
                    size="small"
                    onClick={() => setFilters({ ...filters, filterDialog: true })}
                ><FilterAlt /></IconButton>
            </Tooltip>

            {AddRights && (
                <Button
                    variant="outlined"
                    onClick={() => navigate('create')}
                >Add</Button>
            )}

            <select
                value={filters.view} className="cus-inpt p-1 py-2 mx-1 w-auto"
                onChange={e => setFilters(pre => ({ ...pre, view: e.target.value }))}
            >
                <option value="report">Report</option>
                <option value="listing">Listing</option>
            </select>
        </>
    )

    return (
        <>
            {filters.view === 'report' && (
                <FilterableTable
                    headerFontSizePx={11}
                    bodyFontSizePx={11}
                    dataArray={displayData}
                    title="PRODUCTIONS"
                    maxHeightOption
                    ButtonArea={<ButtonArea />}
                    ExcelPrintOption
                    PDFPrintOption
                    columns={[...[
                        { col: 'SNo', type: 'string', title: 'Sno' },
                        { col: 'Date', type: 'date', title: 'Date' },
                        { col: 'VoucherNo', type: 'string', title: 'Vch.No' },
                        { col: 'VoucherType', type: 'string', title: 'Voucher' },
                        { col: 'SourceItem', type: 'string', title: 'Consumption' },
                        { col: 'SourceGodown', type: 'string', title: 'From' },
                        { col: 'SourceQty', type: 'number', title: 'C.Tonnage' },
                        { col: 'DestinationItem', type: 'string', title: 'Productions' },
                        { col: 'DestinationGodown', type: 'string', title: 'To' },
                        { col: 'DestinationQty', type: 'number', title: 'P.Tonnage' },
                        { col: 'DifferentQTY', type: 'number', title: 'Diff' },
                        { col: 'DifferentPercentage', type: 'number', title: 'Diff (%)' },
                        { col: 'Staffs', type: 'string', title: 'Staffs' },
                    ].map(cel => ({
                        isVisible: 1,
                        ColumnHeader: cel.title,
                        isCustomCell: true,
                        Cell: ({ row }) => formatString(row[cel.col], cel.type),
                        tdClass: ({ row }) => checkIsNumber(row?.SNo) ? 'fw-bold bg-light' : ''
                    })), {
                        isVisible: 1,
                        ColumnHeader: 'Action',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            return (row?.processObjecet && EditRights) && (
                                <>
                                    <IconButton size="small" onClick={() => {
                                        navigate('create', {
                                            state: {
                                                ...row.processObjecet,
                                                SourceDetails: Array.isArray(row?.processObjecet?.SourceDetails) ? row?.processObjecet?.SourceDetails : [],
                                                DestinationDetails: Array.isArray(row?.processObjecet?.DestinationDetails) ? row?.processObjecet?.DestinationDetails : [],
                                                StaffsDetails: Array.isArray(row?.processObjecet?.StaffsDetails) ? row?.processObjecet?.StaffsDetails : [],
                                                isEditable: true
                                            }
                                        })
                                    }}>
                                        <Edit className="fa-20" />
                                    </IconButton>
                                </>
                            )
                        }
                    }
                    ]}
                />
            )}

            {filters.view === 'listing' && (
                <ProcessingView dataArray={filteredData} ButtonArea={<ButtonArea />} />
            )}

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
                                    <td className="py-1">
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={e => setFilters({ ...filters, Fromdate: e.target.value })}
                                            className="cus-inpt p-2"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>To</td>
                                    <td className="py-1">
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={e => setFilters({ ...filters, Todate: e.target.value })}
                                            className="cus-inpt p-2"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Source Godown</td>
                                    <td className="py-1">
                                        <select
                                            value={filters.sourceGodown}
                                            onChange={e => setFilters(pre => ({ ...pre, sourceGodown: e.target.value }))}
                                            className="cus-inpt p-2"
                                        >
                                            <option value="">All Godown</option>
                                            {godowns.map((g, gi) => (
                                                <option value={g.Godown_Id} key={gi}>{g.Godown_Name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Destination Godown</td>
                                    <td className="py-1">
                                        <select
                                            value={filters.destinationGodown}
                                            onChange={e => setFilters(pre => ({ ...pre, destinationGodown: e.target.value }))}
                                            className="cus-inpt p-2"
                                        >
                                            <option value="">All Godown</option>
                                            {godowns.map((g, gi) => (
                                                <option value={g.Godown_Id} key={gi}>{g.Godown_Name}</option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Voucher</td>
                                    <td className="py-1">
                                        <Select
                                            value={filters.VoucherType}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, VoucherType: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueVoucher}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Voucher"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Branch</td>
                                    <td className="py-1">
                                        <Select
                                            value={filters.Branch}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, Branch: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueBranch}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Branch"}
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

export default StockMangement;