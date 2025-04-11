import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import {
    isEqualNumber,
    ISOString,
    isValidDate,
    Subraction,
    toArray,
} from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import Select from "react-select";
import { useEffect, useState } from "react";
import { FilterAlt, Search } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { customSelectStyles } from "../../Components/tablecolumn";


const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const defaultFilterDropDown = {
    voucherType: [],
    retailers: [],
    collectionType: [],
    paymentStatus: [],
    collectedBy: []
}

const ReceiptsListing = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();

    const [salesReceipts, setSalesReceipts] = useState([]);
    const [drowDownValues, setDropDownValues] = useState(defaultFilterDropDown);
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        retailer_id: { value: "", label: "Search by Retailer" },
        voucher_id: { value: "", label: "Select by voucher" },
        collection_type: { value: "", label: "Search by collection type" },
        verify_status: { value: "", label: "Search by verify status" },
        payment_status: { value: "", label: "Search by payment status" },
        collected_by: { value: "", label: "Search by collection person" },
        filterDialog: false, 
        refresh: false,
    });

    useEffect(() => {
        fetchLink({
            address: `receipt/filterValues`
        }).then(data => {
            if (data.success) {
                setDropDownValues({
                    voucherType: toArray(data?.others?.voucherType),
                    retailers: toArray(data?.others?.retailers),
                    collectionType: toArray(data?.others?.collectionType),
                    paymentStatus: toArray(data?.others?.paymentStatus),
                    collectedBy: toArray(data?.others?.collectedBy),
                })
            }
        }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `receipt/collectionReceipts?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}&retailer_id=${filters.retailer_id.value}&voucher_id=${filters.voucher_id.value}&collection_type=${filters.collection_type.value}&verify_status=${filters.verify_status.value}&payment_status=${filters.payment_status.value}&collected_by=${filters.collected_by.value}`,
        }).then(data => {
            if (data.success) {
                setSalesReceipts(data.data);
            }
        }).finally(() => {
            if (loadingOff) loadingOff();
        }).catch(e => console.error(e))
    }, [filters?.fetchFrom, filters?.fetchTo, filters?.refresh]);

    useEffect(() => {
        const queryFilters = {
            Fromdate: query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                ? query.get("Fromdate")
                : defaultFilters.Fromdate,
            Todate: query.get("Todate") && isValidDate(query.get("Todate"))
                ? query.get("Todate")
                : defaultFilters.Todate,
        };
        setFilters(pre => ({ ...pre, fetchFrom: queryFilters.Fromdate, fetchTo: queryFilters.Todate}));
    }, [location.search]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const closeDialog = () => {
        setFilters(pre => ({ ...pre, filterDialog: false }));
    }

    return (
        <>
            <FilterableTable
                title="Receipts"
                ButtonArea={
                    <>
                        <Button
                            variant="outlined"
                            className="ms-2"
                            onClick={() => navigate('create')}>
                            Create Receipt
                        </Button>
                        <Tooltip title='Filters'>
                            <IconButton
                                size="small"
                                onClick={() => setFilters({ ...filters, filterDialog: true })}
                            ><FilterAlt /></IconButton>
                        </Tooltip>
                    </>
                }
                EnableSerialNumber
                dataArray={salesReceipts}
                headerFontSizePx={13}
                bodyFontSizePx={12}
                columns={[
                    createCol('collection_inv_no', 'string', 'Invoice'),
                    createCol('collection_date', 'date', 'Date'),
                    createCol('RetailerGet', 'string', 'Retailer'),
                    createCol('CollectedByGet', 'string', 'Received By'),
                    createCol('total_amount', 'number', 'Amount'),
                    createCol('collection_type', 'string', 'Type'),
                    createCol('VoucherGet', 'string', 'Voucher'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Verifyed-?',
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const verified = isEqualNumber(row?.verify_status);
                            return (
                                <span
                                    className={
                                        verified
                                            ? 'bg-success' : 'bg-warning'
                                            + " text-light fa-11 px-2 py-1 rounded-3"
                                    }
                                >
                                    {verified ? 'Verified' : 'Pending'}
                                </span>
                            )
                        }
                    },
                    // {
                    //     isVisible: 1,
                    //     ColumnHeader: 'Action',
                    //     isCustomCell: true,
                    //     Cell: ({ row }) => (
                    //         <span className="">{isEqualNumber(row?.verify_status) ? 'Verified' : 'Pending'}</span>
                    //     )
                    // },
                ]}
                isExpendable={true}
                expandableComp={({ row }) => (
                    <div className="py-2">
                        <FilterableTable
                            // title="Receipts"
                            disablePagination
                            headerFontSizePx={13}
                            bodyFontSizePx={12}
                            dataArray={Array.isArray(row?.Receipts) ? row?.Receipts : []}
                            columns={[
                                createCol('Do_Inv_No', 'string', 'Delivery Invoice Number'),
                                createCol('Do_Date', 'date', 'Delivery Date'),
                                createCol('collected_amount', 'number', 'Receipt Amount'),
                                createCol('total_receipt_amount', 'number', 'Total Receipt'),
                                createCol('Total_Invoice_value', 'number', 'Invoice Value'),
                                {
                                    isVisible: 1,
                                    ColumnHeader: 'Pending Amount',
                                    isCustomCell: true,
                                    Cell: ({ row }) => Subraction(row?.bill_amount, row?.total_receipt_amount)
                                },
                            ]}
                        />
                    </div>
                )}
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
                                    <td style={{ verticalAlign: 'middle' }}>Voucher</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.voucher_id}
                                            onChange={selectedOptions =>
                                                setFilters(prev => ({ ...prev, voucher_id: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={drowDownValues.voucherType}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Voucher"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Retailer</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.retailer_id}
                                            onChange={selectedOptions =>
                                                setFilters(prev => ({ ...prev, retailer_id: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={drowDownValues.retailers}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Retailer"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Receipt Type</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.collection_type}
                                            onChange={selectedOptions =>
                                                setFilters(prev => ({ ...prev, collection_type: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={drowDownValues.collectionType}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Receipt Type"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Collected By</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.collected_by}
                                            onChange={selectedOptions =>
                                                setFilters(prev => ({ ...prev, collected_by: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={drowDownValues.collectedBy}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Collection Person"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Payment Status</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.payment_status}
                                            onChange={selectedOptions =>
                                                setFilters(prev => ({ ...prev, payment_status: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={drowDownValues.paymentStatus}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Payment Status"}
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
                            setFilters(pre => ({ ...pre, refresh: !pre.refresh }));
                            closeDialog();
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >Search</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ReceiptsListing;
