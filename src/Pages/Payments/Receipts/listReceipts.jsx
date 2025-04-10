import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip } from "@mui/material";
import {
    checkIsNumber,
    getSessionUser,
    isEqualNumber,
    ISOString,
    isValidDate,
    Subraction,
} from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import Select from "react-select";
import { useEffect, useState } from "react";
import { FilterAlt, Search } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const ReceiptsListing = ({ loadingOn, loadingOff }) => {
    const storage = getSessionUser().user;
    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const query = useQuery();

    const [salesReceipts, setSalesReceipts] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        Retailer: { value: "", label: "Search by Retailer..." },
        filterDialog: false
    });

    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `delivery/paymentCollection?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}`,
        }).then(data => {
            if (data.success) {
                setSalesReceipts(data.data);
            }
        }).finally(() => {
            if (loadingOff) loadingOff();
        }).catch(e => console.error(e))
    }, [filters?.fetchFrom, filters?.fetchTo]);

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

                                {/* <tr>
                                    <td style={{ verticalAlign: 'middle' }}>Voucher</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.VoucherType}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({ ...prev, VoucherType: selectedOptions }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={uniqueVoucher}
                                            styles={customSelectStyles}
                                            isMulti
                                            isSearchable={true}
                                            placeholder={"Select Voucher"}
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr> */}

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
    );
};

export default ReceiptsListing;
