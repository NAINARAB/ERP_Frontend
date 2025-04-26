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
    ISOString,
    isValidDate,
    Subraction,
    toArray,
    toNumber,
    Addition
} from "../../Components/functions";
import { fetchLink } from "../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import Select from "react-select";
import { useEffect, useState } from "react";
import { FilterAlt, Search } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { customSelectStyles } from "../../Components/tablecolumn";
import { useMemo } from "react";
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

const Outstanding = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const storage = JSON.parse(localStorage.getItem("user"));
    const [salesReceipts, setSalesReceipts] = useState([]);
    const [drowDownValues, setDropDownValues] = useState(defaultFilterDropDown);
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,
        Todate: defaultFilters.Todate,
        fetchFrom: defaultFilters.Fromdate,
        fetchTo: defaultFilters.Todate,
        Retailer_Id: "",
        Retailer_Name: "ALL",
        Area_Id: "",
        Area_Name: "ALL",
        Route_Id: "",
        RoutesGet: "ALL",
        // verify_status: { value: "", label: "Search by verify status" },
        // payment_status: { value: "", label: "Search by payment status" },
        // collected_by: { value: "", label: "Search by collection person" },
        filterDialog: false,
        refresh: false,
    });
    const [retailers, setRetailers] = useState([]);
    const [area, setArea] = useState([]);
    const [routes, setRoutes] = useState([]);
    useEffect(() => {
        fetchLink({
            address: `receipt/filterValues`,
        })
            .then((data) => {
                if (data.success) {
                    setDropDownValues({
                        voucherType: toArray(data?.others?.voucherType),
                    });
                }
            })
            .catch((e) => console.error(e));
    }, []);
    useEffect(() => {
        fetchLink({
            address: `masters/retailers/dropDown?Company_Id=${storage?.Company_id}`,
        })
            .then((data) => {
                if (data.success) {
                    setRetailers(data.data);
                }
            })
            .catch((e) => console.error(e));

        fetchLink({
            address: `masters/areas/dropdown?Company_Id=${storage?.Company_id}`,
        })
            .then((data) => {
                if (data.success) {
                    setArea(data.data);
                }
            })
            .catch((e) => console.error(e));

        fetchLink({
            address: `masters/routes/dropdown?Company_id=${storage?.Company_id}`,
        })
            .then((data) => {
                if (data.success) {
                    setRoutes(data.data);
                }
            })
            .catch((e) => console.error(e));



    }, [storage?.Company_id]);





    useEffect(() => {
        if (loadingOn) loadingOn();

        fetchLink({
            address: `receipt/outstanding?Fromdate=${filters?.fetchFrom}&Todate=${filters?.fetchTo}&Retailer_Id=${filters.Retailer_Id}&Area_Id=${filters.Area_Id}&Route_Id=${filters.Route_Id}`,
        })
            .then((data) => {
                if (data.success) {
                    setSalesReceipts(data.data);
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
        setFilters((pre) => ({ ...pre, filterDialog: false }));
    };
    const Total_Invoice_value = useMemo(() => salesReceipts.reduce(
        (acc, orders) => Addition(acc, orders?.Closing_Balance), 0
    ), [salesReceipts])
    return (
        <>
            <FilterableTable
                title="Receipts"
                ButtonArea={
                    <>
                        {/* <Button
                              variant="outlined"
                              className="ms-2"
                              onClick={() => navigate('create')}>
                              Create Receipt
                          </Button> */}
                        <Tooltip title="Filters">

                            <IconButton
                                size="small"
                                onClick={() => setFilters({ ...filters, filterDialog: true })}
                            >
                                <FilterAlt />
                            </IconButton>
                        </Tooltip>
                        {toNumber(Total_Invoice_value) > 0 && <h6 className="m-0 text-end text-muted px-3">Total: {Total_Invoice_value}</h6>}
                    </>
                }
                EnableSerialNumber
                dataArray={salesReceipts}
                headerFontSizePx={14}
                bodyFontSizePx={13}
                columns={[
                    createCol("Retailer_Name", "string", "Retailer_Name"),
                    createCol("Opening_Pending_Amount", "string", "Opening_Pending_Amount"),
                    createCol("Current_Invoice_Value", "string", "Current_Invoice_Value"),
                    createCol(
                        "Current_Collected_Amount",
                        "string",
                        "Current_Collected_Amount"
                    ),
                    createCol("Closing_Balance", "number", "Closing_Balance"),
                    // {
                    //     isVisible: 1,
                    //     ColumnHeader: 'Action',
                    //     isCustomCell: true,
                    //     Cell: ({ row }) => (
                    //         <span className="">{isEqualNumber(row?.verify_status) ? 'Verified' : 'Pending'}</span>
                    //     )
                    // },
                ]}
                isExpendable={false}
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

                                {/* <tr>
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
                                  </tr> */}
                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Retailer</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={
                                                {
                                                    value: filters.Retailer_Id,
                                                    label: filters.Retailer_Name,
                                                }

                                            }
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    Retailer_Id: e?.value || "",
                                                    Retailer_Name: e?.label || "",
                                                }))
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...retailers.map((obj) => ({
                                                    value: obj?.Retailer_Id,
                                                    label: obj?.Retailer_Name,
                                                })),
                                            ]}
                                            menuPortalTarget={document.body}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder="Select Retailer"
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Area</td>
                                    <td colSpan={3}>
                                        <Select
                                            value={
                                                {
                                                    value: filters.Area_Id,
                                                    label: filters.Area_Name,
                                                }

                                            }
                                            onChange={(e) =>
                                                setFilters((prev) => ({
                                                    ...prev,
                                                    Area_Id: e?.value || "",
                                                    Area_Name: e?.label || "",
                                                }))
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...area.map((obj) => ({
                                                    value: obj?.Area_Id,
                                                    label: obj?.Area_Name,
                                                })),
                                            ]}
                                            menuPortalTarget={document.body}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder="Select Area"
                                            maxMenuHeight={300}
                                        />
                                    </td>
                                </tr>

                                <tr>
                                    <td style={{ verticalAlign: "middle" }}>Routes</td>
                                    <td colSpan={3}>

                                        <Select
                                            value={{
                                                value: filters?.Route_Id,
                                                label: filters?.RoutesGet,
                                            }}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    Route_Id: e.value,
                                                    RoutesGet: e.label,
                                                })
                                            }
                                            options={[
                                                { value: "", label: "ALL" },
                                                ...routes.map((obj) => ({
                                                    value: obj?.Route_Id,
                                                    label: obj?.Route_Name,
                                                })),
                                            ]}
                                            menuPortalTarget={document.body}
                                            styles={customSelectStyles}
                                            isSearchable={true}
                                            placeholder="Route"
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
        </>
    );
};

export default Outstanding;
