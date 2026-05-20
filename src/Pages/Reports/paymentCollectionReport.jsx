import React, { useState, useEffect, useMemo } from "react";
import {
    Button,
    Dialog,
    Tooltip,
    IconButton,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import Select from "react-select";
import { customSelectStyles } from "../../Components/tablecolumn";
import {
    Addition,
    ISOString,
    isValidDate,
    toNumber,
} from "../../Components/functions";

import InvoiceBillTemplate from "../Sales/SalesReportComponent/newInvoiceTemplate";
import { FilterAlt, Search } from "@mui/icons-material";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { useNavigate, useLocation } from "react-router-dom";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const SaleOrderList = ({ loadingOn, loadingOff }) => {
    const storage = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const query = useQuery();
    const [saleOrders, setSaleOrders] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [voucher, setVoucher] = useState([]);
    const [viewOrder, setViewOrder] = useState({});
    const [reload, setReload] = useState(false);

    const [collectionType, setCollectionType] = useState([]);
    const [collectedBy, setCollectedBy] = useState([]);

    const [cummulative, setCummulative] = useState([]);
    const [cummulativeLoad, setCummulativeLoad] = useState(false);
    const [loadCummulativeNow, setLoadCummulativeNow] = useState(false);

    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        Retailer: { value: "", label: "ALL" },
        CollectionType: { value: "", label: "ALL" },
        CollectedBy: { value: "", label: "ALL" },
        VoucherType: { value: "", label: "ALL" },
        Cancel_status: 0,
    });

    const [dialog, setDialog] = useState({
        filters: false,
        orderDetails: false,
    });

    useEffect(() => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `reports/collectionReport?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}&retailer_id=${filters?.Retailer?.value}&collected_by=${filters?.CollectedBy?.value}&collection_type=${filters?.CollectionType?.value}&voucher_id=${filters?.VoucherType?.value}&Cancel_status=${filters?.Cancel_status}`,
        })
            .then((data) => {
                if (data.success) {
                    setSaleOrders(data?.data);
                }
            })
            .catch((e) => console.error(e))
            .finally(() => {
                if (loadingOff) loadingOff();
            });
    }, [reload]);

    useEffect(() => {
        if (!loadCummulativeNow) return;

        if (loadingOn) loadingOn();

        fetchLink({
            address: `reports/cummulativeReport?Fromdate=${filters?.Fromdate}&Todate=${filters?.Todate}&retailer_id=${filters?.Retailer?.value}&collected_by=${filters?.CollectedBy?.value}&collection_type=${filters?.CollectionType?.value}&voucher_id=${filters?.VoucherType?.value}&Cancel_status=${filters?.Cancel_status}`,
        })
            .then((data) => {
                if (data.success) {
                    setCummulative(data.data);
                }
            })
            .catch((e) => {
                console.error(e);
            })
            .finally(() => {
                if (loadingOff) loadingOff();
                setLoadCummulativeNow(false);
            });
    }, [loadCummulativeNow]);

    useEffect(() => {
        fetchLink({ address: "receipt/filterValues" })
            .then((data) => {
                if (data.success && data.others) {
                    setVoucher(data.others.voucherType || []);
                    setRetailers(data.others.retailers || []);
                    setCollectionType(data.others.collectionType || []);

                    setCollectedBy(data.others.collectedBy || []);
                }
            })
            .catch((error) => {
                console.error("Failed to fetch filter values", error);
            });
    }, []);

    useEffect(() => {
        const queryFilters = {
            Fromdate:
                query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                    ? query.get("Fromdate")
                    : defaultFilters.Fromdate,
            Todate:
                query.get("Todate") && isValidDate(query.get("Todate"))
                    ? query.get("Todate")
                    : defaultFilters.Todate,
        };
        setFilters((pre) => ({
            ...pre,
            Fromdate: queryFilters.Fromdate,
            Todate: queryFilters.Todate,
        }));
    }, [location.search]);

    useEffect(() => {
        const Fromdate =
            stateDetails?.Fromdate && isValidDate(stateDetails?.Fromdate)
                ? ISOString(stateDetails?.Fromdate)
                : null;
        const Todate =
            stateDetails?.Todate && isValidDate(stateDetails?.Todate)
                ? ISOString(stateDetails?.Todate)
                : null;
        if (Fromdate && Todate) {
            updateQueryString({ Fromdate, Todate });
            setFilters((pre) => ({
                ...pre,
                Fromdate: ISOString(stateDetails.Fromdate),
                Todate: stateDetails.Todate,
            }));
            setReload((pre) => !pre);
        }
    }, [stateDetails]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const ExpendableComponent = ({ row }) => {
        const receipts = row.Receipts || [];

        return (
            <>
                {receipts.length === 0 ? (
                    <div className="p-2 text-muted">No receipts available.</div>
                ) : (
                    receipts.map((receipt, index) => (
                        <table key={index} className="table mb-3">
                            <tbody>
                                <tr>
                                    <td className="border p-2 bg-light">Do_Inv_No</td>
                                    <td className="border p-2">{receipt.Do_Inv_No}</td>
                                    <td className="border p-2 bg-light">Do_Date</td>
                                    <td className="border p-2">{receipt.Do_Date}</td>
                                    <td className="border p-2 bg-light">Total Invoice Value</td>
                                    <td className="border p-2">{receipt.Total_Invoice_value}</td>
                                </tr>
                                <tr>
                                    <td className="border p-2 bg-light">Collected Amount</td>
                                    <td className="border p-2">{receipt.collected_amount}</td>
                                    <td className="border p-2 bg-light">Bill Amount</td>
                                    <td className="border p-2">{receipt.bill_amount}</td>
                                    <td className="border p-2 bg-light">Total Receipt Amount</td>
                                    <td className="border p-2">{receipt.total_receipt_amount}</td>
                                </tr>
                            </tbody>
                        </table>
                    ))
                )}
            </>
        );
    };

    const ExpendableComponent2 = ({ row }) => {
        const retailers = row.retailers || [];

        return (
            <>
                {retailers.length === 0 ? (
                    <div className="p-2 text-muted">No receipts available.</div>
                ) : (
                    retailers.map((retail, index) => (
                        <table key={index} className="table mb-3">
                            <tbody>
                                <tr>
                                    <td
                                        className="border p-2 bg-light"
                                        style={{ width: "150px" }}
                                    >
                                        collection_inv_no
                                    </td>
                                    <td className="border p-2" style={{ width: "200px" }}>
                                        {retail.collection_inv_no}
                                    </td>
                                    <td
                                        className="border p-2 bg-light"
                                        style={{ width: "150px" }}
                                    >
                                        RetailerGet
                                    </td>
                                    <td className="border p-2" style={{ width: "250px" }}>
                                        {retail.RetailerGet}
                                    </td>

                                    <td
                                        className="border p-2 bg-light"
                                        style={{ width: "180px" }}
                                    >
                                        CollectedByGet
                                    </td>
                                    <td className="border p-2" style={{ width: "200px" }}>
                                        {retail.CollectedByGet}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    ))
                )}
            </>
        );
    };

    const closeDialog = () => {
        setDialog({
            ...dialog,
            filters: false,
            orderDetails: false,
        });
    };
    const Total_Invoice_value = useMemo(
        () =>
            saleOrders.reduce((acc, order) => {
                const receipts = order.Receipts || [];
                const totalForOrder = receipts.reduce(
                    (sum, r) => sum + (r.collected_amount || 0),
                    0
                );
                return Addition(acc, totalForOrder);
            }, 0),
        [saleOrders]
    );

    return (
        <>
            {!cummulativeLoad ? (
                <FilterableTable
                    title="Cummulative Report"
                    dataArray={cummulative}
                    EnableSerialNumber
                    columns={[
                        createCol("collection_type", "string", "collection_type"),
                        createCol("total_collected", "string", "total_collected"),
                    ]}
                    ButtonArea={
                        <>
                            <Tooltip title="Filters">
                                <IconButton
                                    size="small"
                                    onClick={() => setDialog({ ...dialog, filters: true })}
                                >
                                    <FilterAlt />
                                </IconButton>
                            </Tooltip>
                            {Number(Total_Invoice_value) > 0 && (
                                <h6 className="m-0 text-end text-muted px-3">
                                    Total: {Total_Invoice_value}
                                </h6>
                            )}
                            <Button
                                onClick={() => {
                                    setCummulativeLoad(true);
                                    setLoadCummulativeNow(true);
                                }}
                            >
                                Collection Report
                            </Button>
                        </>
                    }
                    isExpendable={true}
                    tableMaxHeight={550}
                    expandableComp={ExpendableComponent2}
                />
            ) : (
                <FilterableTable
                    title="Collection Report"
                    dataArray={saleOrders}
                    EnableSerialNumber
                    columns={[
                        createCol("RetailerGet", "string", "Retailer"),
                        createCol("collection_inv_no", "string", "collection_inv_no"),
                        {
                            ColumnHeader: "CollectionDate",
                            isVisible: 1,
                            align: "center",
                            isCustomCell: true,
                            Cell: ({ row }) => {
                                const rawDate = row.collection_date;
                                let formattedDate = "Undefined";
                                if (rawDate) {
                                    const date = new Date(rawDate);
                                    if (!isNaN(date)) {
                                        formattedDate = `${date
                                            .getDate()
                                            .toString()
                                            .padStart(2, "0")}-${(date.getMonth() + 1)
                                                .toString()
                                                .padStart(2, "0")}-${date.getFullYear()}`;
                                    }
                                }

                                return (
                                    <span
                                        className={`py-0 fw-bold px-2 rounded-4 fa-12 ${rawDate
                                                ? "bg-success text-white"
                                                : "bg-secondary text-white"
                                            }`}
                                    >
                                        {formattedDate}
                                    </span>
                                );
                            },
                        },
                        {
                            ColumnHeader: "Receipts",
                            isVisible: 1,
                            align: "center",
                            isCustomCell: true,
                            Cell: ({ row }) => {
                                const receipts = row.Receipts || [];
                                const totalCollected = receipts.reduce(
                                    (sum, r) => sum + (r.collected_amount || 0),
                                    0
                                );

                                return (
                                    <span
                                        className={`py-0 fw-bold px-2 rounded-4 fa-12 ${totalCollected
                                                ? "bg-success text-white"
                                                : "bg-secondary text-white"
                                            }`}
                                    >
                                        {totalCollected || "Undefined"}
                                    </span>
                                );
                            },
                        },
                        createCol("CollectedByGet", "string", "Collected_By"),
                        createCol("collection_type", "string", "Collection_Type"),
                    ]}
                    ButtonArea={
                        <>
                            <Tooltip title="Filters">
                                <IconButton
                                    size="small"
                                    onClick={() => setDialog({ ...dialog, filters: true })}
                                >
                                    <FilterAlt />
                                </IconButton>
                            </Tooltip>
                            {Number(Total_Invoice_value) > 0 && (
                                <h6 className="m-0 text-end text-muted px-3">
                                    Total: {Total_Invoice_value}
                                </h6>
                            )}
                            <Button
                                onClick={() => {
                                    setCummulativeLoad(false);
                                    setLoadCummulativeNow(false);
                                }}
                            >
                                Cummulative Report
                            </Button>
                        </>
                    }
                    isExpendable={true}
                    tableMaxHeight={550}
                    expandableComp={ExpendableComponent}
                />
            )}

            {Object.keys(viewOrder).length > 0 && (
                <InvoiceBillTemplate
                    orderDetails={viewOrder?.orderDetails}
                    orderProducts={viewOrder?.orderProducts}
                    download={true}
                    actionOpen={true}
                    clearDetails={() => setViewOrder({})}
                    TitleText={"Sale Order"}
                />
            )}

            <Dialog
                open={dialog.filters}
                onClose={closeDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Filters</DialogTitle>
                <DialogContent>
                    <div className="table-responsive pb-4">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>From</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Fromdate}
                                            onChange={(e) =>
                                                setFilters({ ...filters, Fromdate: e.target.value })
                                            }
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>To</td>
                                    <td>
                                        <input
                                            type="date"
                                            value={filters.Todate}
                                            onChange={(e) =>
                                                setFilters({ ...filters, Todate: e.target.value })
                                            }
                                            className="cus-inpt"
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Retailer</td>
                                    <td>
                                        <Select
                                            value={filters?.Retailer}
                                            onChange={(e) => setFilters({ ...filters, Retailer: e })}
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...retailers.map((obj) => ({
                                                    value: obj?.value,
                                                    label: obj?.label,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Retailer Name"}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Collected By</td>
                                    <td>
                                        <Select
                                            value={filters?.CollectedBy}
                                            onChange={(e) =>
                                                setFilters((pre) => ({ ...filters, CollectedBy: e }))
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...collectedBy.map((obj) => ({
                                                    value: obj?.value,
                                                    label: obj?.label,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Sales Person Name"}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Collected Type</td>
                                    <td>
                                        <Select
                                            value={filters?.CollectionType}
                                            onChange={(e) =>
                                                setFilters((pre) => ({ ...filters, CollectionType: e }))
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...collectionType.map((obj) => ({
                                                    value: obj?.value,
                                                    label: obj?.label,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Sales Person Name"}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Voucher </td>
                                    <td>
                                        <Select
                                            value={filters?.VoucherType}
                                            onChange={(e) =>
                                                setFilters({ ...filters, VoucherType: e })
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...voucher.filter((obj) => ({
                                                    value: obj?.value,
                                                    label: obj?.label,
                                                })),
                                            ]}
                                            styles={customSelectStyles}
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder={"Voucher Name"}
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
                            closeDialog();
                            const updatedFilters = {
                                Fromdate: filters?.Fromdate,
                                Todate: filters?.Todate,
                            };
                            updateQueryString(updatedFilters);
                            setReload((pre) => !pre);
                            setLoadCummulativeNow(true); // Trigger cummulative report API call
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >
                        Search
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default SaleOrderList;