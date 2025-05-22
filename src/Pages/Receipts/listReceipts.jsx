import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
} from "@mui/material";
import {
    getSessionUser,
    isEqualNumber,
    ISOString,
    isValidDate,
    Subraction,
    toArray,
} from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, {
    ButtonActions,
    createCol,
} from "../../Components/filterableTable2";
import Select from "react-select";
import { useEffect, useState } from "react";
import { Delete, Edit, FilterAlt, Search } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { customSelectStyles } from "../../Components/tablecolumn";
import { toast } from "react-toastify";
import UpdateGeneralInfoDialog from "./updateGeneralInfo";
import { receiptGeneralInfo } from "./variable";

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
    collectedBy: [],
};

const ReceiptsListing = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const storage = getSessionUser().user;

    const [selectedRows, setSelectedRows] = useState([]);

    const [salesReceipts, setSalesReceipts] = useState([]);
    const [drowDownValues, setDropDownValues] = useState(defaultFilterDropDown);
    const [baseData, setBaseData] = useState({
        creditAccount: [],
    });

    // const [transactionData, setTransactionData] = useState([]);
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
        verify_status: { value: "", label: "Search by Verify Status" },
        filterDialog: false,
        deleteDialog: false,
        updateDialog: false,
        refresh: false,
    });
    const [totalCollectionAmount, setTotalCollectionAmount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [deleteId, setDeleteId] = useState(null);
    const [updateValues, setUpdateValues] = useState(receiptGeneralInfo);
    const [confirmDialog, setConfirmDatalog] = useState(false);

    const closeDialogData = () => setConfirmDatalog(false);

    useEffect(() => {
        fetchLink({
            address: `receipt/filterValues`,
        })
            .then((data) => {
                if (data.success) {
                    setDropDownValues({
                        voucherType: toArray(data?.others?.voucherType),
                        retailers: toArray(data?.others?.retailers),
                        collectionType: toArray(data?.others?.collectionType),
                        paymentStatus: toArray(data?.others?.paymentStatus),
                        collectedBy: toArray(data?.others?.collectedBy),
                        verifyStatus: toArray(data?.others?.verifyStatus)
                    });
                }
            })
            .catch((e) => console.error(e));

        fetchLink({
            address: `receipt/creditAccounts`,
        })
            .then((data) => {
                if (data.success)
                    setBaseData((pre) => ({ ...pre, creditAccount: data.data }));
                else setBaseData((pre) => ({ ...pre, creditAccount: [] }));
            })
            .catch((e) => console.error(e));
    }, []);

    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `receipt/collectionReceipts?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}&retailer_id=${filters.retailer_id.value}&voucher_id=${filters.voucher_id.value}&collection_type=${filters.collection_type.value}&verify_status=${filters.verify_status.value}&payment_status=${filters.payment_status.value}&collected_by=${filters.collected_by.value}`,
        })
            .then((data) => {
                if (data.success) {
                    setSalesReceipts(data.data);
                    const totalCount = data.data.length;
                    setTotalCount(totalCount);

                    const totalCollection = data.data.reduce((sum, receipt) => {
                        const amount = parseFloat(receipt.total_amount) || 0;
                        return sum + amount;
                    }, 0);

                    setTotalCollectionAmount(totalCollection);
                }
            })
            .finally(() => {
                if (loadingOff) loadingOff();
            })
            .catch((e) => console.error(e));
    }, [filters?.fetchFrom, filters?.fetchTo, filters?.refresh]);

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
            fetchFrom: queryFilters.Fromdate,
            fetchTo: queryFilters.Todate,
        }));
    }, [location.search]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const closeDialog = () => {
        setFilters((pre) => ({
            ...pre,
            filterDialog: false,
            deleteDialog: false,
            updateDialog: false,
        }));
        setDeleteId(null);
        setUpdateValues(receiptGeneralInfo);
    };

    const deleteReceipt = (id) => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `receipt/collectionReceipts`,
            method: "DELETE",
            bodyData: { collection_id: id },
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data?.message || "Receipt deleted successfully");
                    setFilters((pre) => ({ ...pre, refresh: !pre.refresh }));
                    closeDialog();
                } else {
                    toast.error(data?.message || "Failed to delete Receipt");
                }
            })
            .catch((e) => console.error(e))
            .finally(() => {
                if (loadingOff) loadingOff();
            });
    };

    const updateReceipt = (receiptInfo) => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `receipt/collectionReceipts`,
            method: "PUT",
            bodyData: receiptInfo,
        })
            .then((data) => {
                if (data.success) {
                    toast.success(data?.message || "Changes saved");
                    closeDialog();
                    setFilters((pre) => ({ ...pre, refresh: !pre.refresh }));
                } else {
                    toast.error(data?.message || "Failed to save changes");
                }
            })
            .catch((e) => console.error(e))
            .finally(() => {
                if (loadingOff) loadingOff();
            });
    };

    const handleCheckboxChange = (row) => {
        const isSelected = selectedRows.some(
            (selectedRow) => selectedRow.collection_id === row.collection_id
        );

        if (isSelected) {
            setSelectedRows(
                selectedRows.filter(
                    (selectedRow) => selectedRow.collection_id !== row.collection_id
                )
            );
        } else {
            setSelectedRows([...selectedRows, row]);
        }
    };

    const handleVerify = async () => {
        if (!selectedRows || selectedRows.length === 0) {
            toast.warning("Please select at least one record to verify.");
            return;
        }

        const collectionIds = selectedRows.map((item) => item.collection_id);

        if (loadingOn) loadingOn();

        try {
            const data = await fetchLink({
                address: `receipt/verifyStatus`,
                method: "PUT",
                bodyData: { collectionIdToUpdate: collectionIds },
                headers: { "Content-Type": "application/json" },
            });

            if (data.success) {
                toast.success(data?.message || "Collections verified successfully");
                closeDialog();
                setFilters((prev) => ({ ...prev, refresh: !prev.refresh }));
            } else {
                toast.error(data?.message || "Failed to verify collections");
            }
        } catch (error) {

            toast.error("Something went wrong while verifying");
        } finally {
            if (loadingOff) loadingOff();
        }
    };

    return (
        <>
            <FilterableTable
                title="Receipts"

                ButtonArea={
                    <>
                        <Tooltip title="Filters">
                            <IconButton
                                size="small"
                                onClick={() => setFilters({ ...filters, filterDialog: true })}
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="outlined"
                            className="ms-2"
                            onClick={() => navigate("create")}
                        >
                            Create Receipt
                        </Button>

                        <div className="d-flex justify-content-between align-items-center mx-2">
                            {salesReceipts.length > 0 && (
                                <Button
                                    variant="outlined"
                                    onClick={() => {

                                        if (selectedRows.length === salesReceipts.length) {
                                            setSelectedRows([]);
                                        } else {
                                            setSelectedRows(salesReceipts);
                                        }
                                    }}
                                >
                                    {selectedRows.length === salesReceipts.length
                                        ? "Unselect All"
                                        : "Select All"}
                                </Button>
                            )}


                        </div>
                        <Button
                            variant="outlined"
                            className="ms-2 mx-2"
                            onClick={() => setConfirmDatalog(true)}
                            disabled={selectedRows.length === 0}
                        >
                            Verify
                        </Button>
                        <div className="summary-block">
                            <div>Total Count: {totalCount}</div>
                            <div>
                                Total Collection Amount: ₹ {totalCollectionAmount.toFixed(2)}
                            </div>
                        </div>

                    </>
                }
                EnableSerialNumber
                dataArray={salesReceipts}
                headerFontSizePx={13}
                bodyFontSizePx={12}
                columns={[
                    {
                        isVisible: 1,
                        ColumnHeader: "CheckBox",
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const isSelected = selectedRows.some(
                                (selectedRow) => selectedRow.collection_id === row.collection_id
                            );

                            return (
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleCheckboxChange(row)}
                                    disabled={row?.verify_status !== 0}
                                    onFocus={(e) => {
                                        e.target.blur();
                                    }}
                                    style={{
                                        cursor: "pointer",
                                        transform: "scale(1.5)",
                                        width: "14px",
                                        height: "20px",
                                    }}
                                />
                            );
                        },
                    },
                    createCol("collection_inv_no", "string", "Invoice"),
                    createCol("collection_date", "date", "Date"),
                    createCol("RetailerGet", "string", "Retailer"),
                    createCol("CollectedByGet", "string", "Received By"),
                    createCol("total_amount", "number", "Amount"),
                    createCol("collection_type", "string", "Type"),
                    createCol("VoucherGet", "string", "Voucher"),
                    {
                        isVisible: 1,
                        ColumnHeader: "Verifyed-?",
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const verified = isEqualNumber(row?.verify_status, 1);
                            return (
                                <span
                                    className={
                                        (verified ? "bg-success" : "bg-warning") +
                                        " text-light fa-11 px-2 py-1 rounded-3"
                                    }
                                >
                                    {verified ? "Verified" : "Pending"}
                                </span>
                            );
                        },
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: "Action",
                        isCustomCell: true,
                        Cell: ({ row }) => {
                            const collection_id = row?.collection_id;
                            return (
                                <>
                                    <ButtonActions
                                        buttonsData={[
                                            {
                                                name: "Edit",
                                                icon: <Edit className="fa-20" />,
                                                onclick: () => {
                                                    setUpdateValues({
                                                        collection_id: Number(row?.collection_id),
                                                        collection_date: ISOString(row?.collection_date),
                                                        bank_date: row?.bank_date
                                                            ? ISOString(row?.bank_date)
                                                            : "",
                                                        collection_type: row?.collection_type || "CASH",
                                                        collection_account: row?.collection_account || 0,
                                                        verify_status: row?.verify_status,
                                                        payment_status: row?.payment_status,
                                                        narration: row?.narration,
                                                        verified_by: storage.UserId,
                                                        Receipts: toArray(row?.Receipts),
                                                    });
                                                    setFilters((pre) => ({ ...pre, updateDialog: true }));
                                                },
                                            },
                                            {
                                                name: "Delete",
                                                icon: <Delete className="fa-20 text-danger" />,
                                                onclick: () => {
                                                    setDeleteId(collection_id);
                                                    setFilters((pre) => ({ ...pre, deleteDialog: true }));
                                                },
                                            },
                                        ]}
                                    />
                                </>
                            );
                        },
                    },
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
                                createCol("Do_Inv_No", "string", "Delivery Invoice Number"),
                                createCol("Do_Date", "date", "Delivery Date"),
                                createCol("collected_amount", "number", "Receipt Amount"),
                                createCol("total_receipt_amount", "number", "Total Receipt"),
                                createCol("Total_Invoice_value", "number", "Invoice Value"),
                                {
                                    isVisible: 1,
                                    ColumnHeader: "Pending Amount",
                                    isCustomCell: true,
                                    Cell: ({ row }) =>
                                        Subraction(row?.bill_amount, row?.total_receipt_amount),
                                },
                            ]}
                        />
                    </div>
                )}
            />

            <UpdateGeneralInfoDialog
                update={updateReceipt}
                updateValues={updateValues}
                setUpdateValues={setUpdateValues}
                open={filters.updateDialog}
                onClose={closeDialog}
                creditAccount={baseData.creditAccount}
            />

            <Dialog
                open={filters.filterDialog}
                onClose={closeDialog}
                fullWidth
                maxWidth="md"
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
                                    <td style={{ verticalAlign: "middle" }}>Voucher</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.voucher_id}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    voucher_id: selectedOptions,
                                                }))
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
                                    <td style={{ verticalAlign: "middle" }}>Retailer</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.retailer_id}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    retailer_id: selectedOptions,
                                                }))
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
                                    <td style={{ verticalAlign: "middle" }}>Receipt Type</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.collection_type}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    collection_type: selectedOptions,
                                                }))
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
                                    <td style={{ verticalAlign: "middle" }}>Collected By</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.collected_by}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    collected_by: selectedOptions,
                                                }))
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
                                    <td style={{ verticalAlign: "middle" }}>Payment Status</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.payment_status}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    payment_status: selectedOptions,
                                                }))
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
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Verify Status</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={filters.verify_status}
                                            onChange={(selectedOptions) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    verify_status: selectedOptions,
                                                }))
                                            }
                                            menuPortalTarget={document.body}
                                            options={drowDownValues.verifyStatus}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder={"Select Verify Status"}
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
                                Todate: filters?.Todate,
                            };
                            updateQueryString(updatedFilters);
                            setFilters((pre) => ({ ...pre, refresh: !pre.refresh }));
                            closeDialog();
                        }}
                        startIcon={<Search />}
                        variant="outlined"
                    >
                        Search
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={filters.deleteDialog}
                onClose={closeDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    Do you want to delete the receipt permanently?
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>cancel</Button>
                    <Button
                        onClick={() => deleteReceipt(deleteId)}
                        variant="outlined"
                        color="error"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={confirmDialog} fullWidth maxWidth="sm">
                <DialogTitle>Confirm Action</DialogTitle>
                <DialogContent>
                    <div>Are you sure you want to verify this status?</div>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialogData}>Cancel</Button>
                    <Button onClick={handleVerify} color="primary" variant="contained">
                        Verify
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ReceiptsListing;