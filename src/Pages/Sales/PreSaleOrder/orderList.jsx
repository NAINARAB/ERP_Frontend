import { useEffect, useMemo, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { isGraterNumber } from "../../../Components/functions";
import FilterableTable, {
    createCol,
} from "../../../Components/filterableTable2";
import { Card, IconButton, Button } from "@mui/material";
import { toast } from "react-toastify";
import { AddBox, Edit } from "@mui/icons-material";
import { convertedStatus } from "../convertedStatus";

const OrderList = ({ loadingOn, loadingOff }) => {
    const [filters, setFilters] = useState({
        FromDate: new Date().toISOString().split("T")[0],
        ToDate: new Date().toISOString().split("T")[0],
        refresh: false,
        search: '',
    });
    const [searchInput, setSearchInput] = useState('');
    const [data, setData] = useState([]);
    const [tallyLOL, setTallyLOL] = useState([]);
    const [load, setLoad] = useState(false)

    useEffect(() => {
        if (loadingOn) loadingOn();
        setLoad(true);
        fetchLink({
            address: `sales/presaleOrder/getList?FromDate=${filters.FromDate}&ToDate=${filters.ToDate}`,
        })
            .then((data) => {
                if (data.success) {
                    setData(data.data);
                    setTallyLOL(tallyLOL);
                }
            })
            .catch((e) => {
                console.error(e);
            })
            .finally(() => {
                setLoad(false)
                if (loadingOff) loadingOff();
            });
    }, [filters.refresh, filters.FromDate, filters.ToDate]);

    const filterableText = (text) =>
        String(text)
            .toLowerCase()
            .replace(/\s+/g, " ")
            .replace(/[^a-z0-9]/gi, '')
            .trim();

    const FilteredData = useMemo(() => {
        const search = filterableText(filters.search || "");

        return data.filter((obj) => {

            let values = [];

            for (let key in obj) {
                if (key !== "ProductList") {
                    values.push(obj[key]);
                }
            }

            if (Array.isArray(obj.ProductList)) {
                obj.ProductList.forEach(item => {
                    values.push(...Object.values(item));
                });
            }


            const combined = filterableText(values.join(" "));
            return combined.includes(search);
        });
    }, [filters.search, data]);





    const ExpendableComponent = ({ row }) => {
        return (
            <>
                {row?.ProductList?.length > 0 && (
                    <table className="table">
                        <thead>
                            <tr>
                                <th className="border p-2 bg-light">S_No</th>
                                <th className="border p-2 bg-light">Item_Id</th>
                                <th className="border p-2 bg-light">Product_Name</th>
                                <th className="border p-2 bg-light">Bill_Qty</th>
                                <th className="border p-2 bg-light">Item_Rate</th>
                                <th className="border p-2 bg-light">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {row?.ProductList?.map((data, index) => (
                                <tr key={index}>
                                    <td className="border p-2">{data?.S_No}</td>
                                    <td className="border p-2">{data?.Item_Id}</td>
                                    <td className="border p-2">{data?.Product_Name}</td>
                                    <td className="border p-2">{data?.Bill_Qty}</td>
                                    <td className="border p-2">{data?.Item_Rate}</td>
                                    <td className="border p-2">{data?.Amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </>
        );
    };


    const postSaleOrder = (data) => {
        loadingOn();

        const extractWeightFromName = (name) => {
            const match = name?.match(/(\d+)\s?kg/i);
            return match ? parseInt(match[1]) : 1;
        };

        const validProducts = Array.isArray(data.ProductList)
            ? data.ProductList
                .filter(p => isGraterNumber(p?.Bill_Qty, 0))
                .map(p => {
                    const weight = extractWeightFromName(p?.Product_Name);
                    return {
                        ...p,
                        Pre_Id: data?.Pre_Id,
                        Bill_Qty: weight * p?.Bill_Qty,
                        Total_Qty: p?.Bill_Qty
                    };
                })
            : [];

        const payload = {
            ...data,
            Product_Array: validProducts,
            Retailer_Id: data?.Custome_Id
        };

        fetchLink({
            address: `sales/presaleOrder/saleOrderCreationWithPso`,
            method: data?.isConverted !== 0 ? 'PUT' : 'POST',
            bodyData: payload
        })
            .then((response) => {
                if (response.success) {
                    toast.success(response?.message);
                    setLoad(true);
                } else {
                    toast.error(response?.message);
                }
            })
            .catch(() => {
                toast.error("Something went wrong!");
            })
            .finally(() => loadingOff());
    };

    // const postSaleOrder = (data) => {
    //     loadingOn();

    //     const validProducts = Array.isArray(data.ProductList)
    //         ? data.ProductList.filter(p => isGraterNumber(p?.Bill_Qty, 0)).map(p => ({
    //             ...p,
    //             Pre_Id: data?.Pre_Id
    //         }))
    //         : [];

    //     const payload = {
    //         ...data,
    //         Product_Array: validProducts,

    //         Retailer_Id: data?.Custome_Id
    //     };


    //     fetchLink({
    //         address: `sales/presaleOrder/saleOrderCreationWithPso`,
    //         method: data?.isConverted !== 0 ? 'PUT' : 'POST',
    //         bodyData: payload
    //     })
    //         .then((response) => {
    //             if (response.success) {
    //                 toast.success(response?.message);
    //                 setLoad(true)
    //             } else {
    //                 toast.error(response?.message);
    //             }
    //         })
    //         .catch((e) => {
    //             toast.error("Something went wrong!");
    //         })
    //         .finally(() => loadingOff());
    // };

    useEffect(() => {
        if (load) {
            fetchLink({
                address: `sales/presaleOrder/getList?FromDate=${filters.FromDate}&ToDate=${filters.ToDate}`,
            })
                .then((data) => {
                    if (data.success) {
                        setData(data.data);
                        setTallyLOL(data.data);
                    }
                })
                .catch((e) => console.error(e))
                .finally(() => setLoad(false));
        }
    }, [load, filters.FromDate, filters.ToDate]);

    return (
        <>
            <Card>

                <div className="px-3 py-2 fa-14">
                    <div className="d-flex flex-wrap align-items-center">
                        <td style={{ verticalAlign: "middle" }}>From</td>
                        <td>
                            <input
                                type="date"
                                value={filters.FromDate}
                                onChange={(e) =>
                                    setFilters({ ...filters, FromDate: e.target.value })
                                }
                                className="cus-inpt"
                            />
                        </td>
                        <td style={{ verticalAlign: "middle" }}>To</td>
                        <td>
                            <input
                                type="date"
                                value={filters.ToDate}
                                onChange={(e) =>
                                    setFilters({ ...filters, ToDate: e.target.value })
                                }
                                className="cus-inpt"
                            />
                        </td>

                        <IconButton
                            size="small"
                            onClick={() => {
                                setFilters((prev) => {
                                    const updatedFilters = {
                                        ...prev,
                                        viewNotSynced: !prev.viewNotSynced,
                                    };

                                    return updatedFilters;
                                });
                            }}
                        >

                        </IconButton>
                    </div>
                </div>

                {
                    filters.search ? (
                        <FilterableTable
                            title={"Not synced list "}
                            bodyFontSizePx={11}
                            headerFontSizePx={11}
                            dataArray={FilteredData}
                            columns={[
                                createCol("Pre_Id", "string", "Pre_Id"),
                                {
                                    Field_Name: "Pre_Date",
                                    ColumnHeader: "Pre_Date",
                                    isVisible: 1,
                                    isCustomCell: true,
                                    Cell: ({ row }) => (
                                        <td className="fa-12" style={{ minWidth: "80px" }}>
                                            {row?.Pre_Date.split("T")[0]}
                                        </td>
                                    ),
                                },
                                createCol("Retailer_Name", "string", "Retailer_Name"),
                                createCol("Total_Invoice_value", "string", "Total_Invoice_value"),
                                {
                                    ColumnHeader: "Status",
                                    isVisible: 1,
                                    align: "center",
                                    isCustomCell: true,
                                    Cell: ({ row }) => {
                                        const convert = convertedStatus.find(
                                            (status) => status.id === Number(row?.isConverted)
                                        );
                                        return (
                                            <span
                                                className={
                                                    "py-0 fw-bold px-2 rounded-4 fa-12 " + convert?.color ??
                                                    "bg-secondary text-white"
                                                }
                                            >
                                                {convert?.label ?? "Undefined"}
                                            </span>
                                        );
                                    },
                                },
                                {
                                    Field_Name: "Actions",
                                    ColumnHeader: "Actions",
                                    isVisible: 1,
                                    isCustomCell: true,
                                    Cell: ({ row }) => (
                                        <td className="fa-12" style={{ minWidth: "80px" }}>
                                            <IconButton size="small" onClick={() => postSaleOrder(row)}>
                                                {row?.isConverted === 0 ? <AddBox /> : <Edit />}
                                            </IconButton>
                                        </td>
                                    ),
                                }

                            ]}
                            isExpendable={true}
                            tableMaxHeight={550}
                            expandableComp={ExpendableComponent}
                            ButtonArea={
                                <>

                                    <Button
                                        sx={{ ml: 1 }}
                                        variant="outlined"
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                search: searchInput,
                                            }))
                                        }
                                    >
                                        Search
                                    </Button>
                                    <input
                                        type="search"
                                        className="cus-inpt p-1 w-auto"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Search.."
                                    />
                                </>
                            }
                        />
                    ) : (
                        <FilterableTable
                            title={"Not synced list "}
                            bodyFontSizePx={11}
                            headerFontSizePx={11}
                            dataArray={data}
                            columns={[
                                createCol("Pre_Id", "string", "Pre_Id"),
                                {
                                    Field_Name: "Pre_Date",
                                    ColumnHeader: "Pre_Date",
                                    isVisible: 1,
                                    isCustomCell: true,
                                    Cell: ({ row }) => (
                                        <td className="fa-12" style={{ minWidth: "80px" }}>
                                            {row?.Pre_Date.split("T")[0]}
                                        </td>
                                    ),
                                },
                                createCol("Retailer_Name", "string", "Retailer_Name"),
                                createCol("Total_Invoice_value", "string", "Total_Invoice_value"),
                                {
                                    ColumnHeader: "Status",
                                    isVisible: 1,
                                    align: "center",
                                    isCustomCell: true,
                                    Cell: ({ row }) => {
                                        const convert = convertedStatus.find(
                                            (status) => status.id === Number(row?.isConverted)
                                        );
                                        return (
                                            <span
                                                className={
                                                    "py-0 fw-bold px-2 rounded-4 fa-12 " + convert?.color ??
                                                    "bg-secondary text-white"
                                                }
                                            >
                                                {convert?.label ?? "Undefined"}
                                            </span>
                                        );
                                    },
                                },
                                {
                                    Field_Name: "Actions",
                                    ColumnHeader: "Actions",
                                    isVisible: 1,
                                    isCustomCell: true,
                                    Cell: ({ row }) => (
                                        <td className="fa-12" style={{ minWidth: "80px" }}>
                                            <IconButton size="small" onClick={() => postSaleOrder(row)}>
                                                {row?.isConverted === 0 ? <AddBox /> : <Edit />}
                                            </IconButton>
                                        </td>
                                    ),
                                }

                            ]}
                            isExpendable={true}
                            tableMaxHeight={550}
                            expandableComp={ExpendableComponent}

                            ButtonArea={
                                <>

                                    <Button
                                        sx={{ ml: 1 }}
                                        variant="outlined"
                                        onClick={() =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                search: searchInput,
                                            }))
                                        }
                                    >
                                        Search
                                    </Button>
                                    <input
                                        type="search"
                                        className="cus-inpt p-1 w-auto"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Search.."
                                    />
                                </>
                            }
                        />
                    )
                }
            </Card>
        </>
    );
};

export default OrderList;