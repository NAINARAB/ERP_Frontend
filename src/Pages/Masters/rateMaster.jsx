import { useEffect, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import {
    IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Tooltip
} from "@mui/material";
import { Search, Edit, Delete, Sync } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import FilterableTable, { createCol } from "../../Components/filterableTable2";
import { Button } from "react-bootstrap";
import { ISOString, isValidDate } from "../../Components/functions";
// import * as XLSX from 'xlsx'; // Import xlsx library
import moment from "moment/moment";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    NewDate: "",
};

const formatDateToYMD = date => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
function RateMaster({ loadingOn, loadingOff }) {
    const [filters, setFilters] = useState({
        Fromdate: defaultFilters.Fromdate,

        fetchFrom: defaultFilters.Fromdate,
        NewDate: defaultFilters.NewDate,
        fetchNew: defaultFilters.NewDate,
    });
    const [addDialog, setAddDialog] = useState(false);
    const [inputValue, setInputValue] = useState({
        Rate_Date: new Date().toISOString().split("T")[0],
        Pos_Brand_Id: "",
        Item_Id: "",
        Rate: "",
        Is_Active_Decative: "0",
        POS_Brand_Name: "",
        Product_Name: "",
    });
    const [open, setOpen] = useState(false);
    const [posBrand, setPosBrand] = useState([]);
    const [product, setProduct] = useState([]);
    const [posData, setPosData] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const query = useQuery();
    const [selectedPosBrand, setSelectedPosBrand] = useState("");
    const [bulkData, setBulkData] = useState([]);
    const [reload, setReload] = useState(false);

    const [exportDialog, setExportDialog] = useState(false);
    useEffect(() => {
        const queryFilters = {
            Fromdate:
                query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                    ? query.get("Fromdate")
                    : defaultFilters.Fromdate,
            NewDate:
                query.get("NewDate") && isValidDate(query.get("NewDate"))
                    ? query.get("NewDate")
                    : defaultFilters.NewDate,
        };
        setFilters(prev => ({
            ...prev,
            fetchFrom: queryFilters.Fromdate,
            fetchNew: queryFilters.NewDate,
        }));
    }, [location.search]);

    useEffect(() => {
        fetchLink({
            address: `masters/posRateMaster?FromDate=${filters?.Fromdate}`,
        })
            .then(data => {
                if (data.success) {
                    setBulkData(data);
                    setPosData(data.data);
                }
            })
            .catch(e => console.error(e));

        fetchLink({
            address: `masters/posbranch/dropdown`,
        })
            .then(data => {
                if (data.success) {
                    setPosBrand(data.data);
                }
            })
            .catch(e => console.error(e));
    }, [filters.Fromdate, reload]);

    const fetchProducts = async posBrandId => {
        fetchLink({
            address: `masters/posbrand/productList?Pos_Brand_Id=${posBrandId}`,
        })
            .then(data => {
                if (data.success) {
                    setProduct(data.data);
                }
            })
            .catch(e => console.error(e));
    };

    useEffect(() => {
        if (selectedPosBrand) {
            fetchProducts(selectedPosBrand);
        }
    }, [selectedPosBrand]);

    const handleRateMasterAdd = () => {
        fetchLink({
            address: `masters/posRateMaster`,
            method: "POST",
            bodyData: {
                ...inputValue,
                Pos_Brand_Id: selectedPosBrand,
                Item_Id: inputValue.Item_Id,
                Rate_Date: formatDateToYMD(inputValue.Rate_Date),
            },
        })
            .then(data => {
                if (data.success) {
                    setAddDialog(false);
                    toast.success(data.message);
                    setInputValue({
                        Rate_Date: new Date().toISOString().split("T")[0],
                        Pos_Brand_Id: "",
                        Item_Id: "",
                        Rate: "",
                        Is_Active_Decative: "0",
                        POS_Brand_Name: "",
                        Product_Name: "",
                    });
                    setSelectedPosBrand("");
                    setReload(!reload);
                } else {
                    toast.error(data.message);
                }
            })
            .catch(e => console.error(e));
    };

    const handleUpdate = () => {
        fetchLink({
            address: `masters/posRateMaster`,
            method: "PUT",
            bodyData: {
                ...inputValue,
                Rate_Date: formatDateToYMD(inputValue.Rate_Date),
            },
        })
            .then(data => {
                if (data.success) {
                    toast.success("Rate Master updated successfully!");
                    setAddDialog(false);
                    setReload(!reload);
                    setInputValue({
                        Rate_Date: new Date().toISOString().split("T")[0],
                        Pos_Brand_Id: "",
                        Item_Id: "",
                        Rate: "",
                        Is_Active_Decative: "0",
                        POS_Brand_Name: "",
                        Product_Name: "",
                    });
                    setSelectedPosBrand("");
                } else {
                    toast.error("Failed to update Rate Master:", data.message);
                }
            })
            .catch(e => {
                throw e;
            });
    };

    const updateQueryString = newFilters => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const editRow = data => {
        setAddDialog(true);
        setInputValue({
            Id: data?.Id,
            Rate_Date: formatDateToYMD(data.Rate_Date),
            Pos_Brand_Id: data.Pos_Brand_Id,
            Item_Id: data.Item_Id,
            Rate: data.Rate,
            Is_Active_Decative: data.Is_Active_Decative,
            POS_Brand_Name: data.POS_Brand_Name,
            Product_Name: data.Product_Name,
        });
        setSelectedPosBrand(data.Pos_Brand_Id);
    };

    const handleDelete = () => {
        fetchLink({
            address: `masters/posRateMaster`,
            method: "DELETE",
            bodyData: { Id: inputValue.Id },
        })
            .then(data => {
                if (data.success) {
                    setReload(!reload);
                    setOpen(false);
                    setAddDialog(false);
                    setInputValue({
                        Rate_Date: new Date().toISOString().split("T")[0],
                        Pos_Brand_Id: "",
                        Item_Id: "",
                        Rate: "",
                        Is_Active_Decative: "1",
                        POS_Brand_Name: "",
                        Product_Name: "",
                    });
                    setSelectedPosBrand("");

                    toast.success("Rate Master deleted successfully!");
                } else {
                    toast.error("Failed to delete area:", data.message);
                }
            })
            .catch(e => console.error(e));
    };

    const handleExportData = async () => {
        if (loadingOn) loadingOn();
        if (!filters?.Fromdate || !filters?.NewDate) {
            throw new Error("Both 'From Date' and 'New Date' are required.");
        }

        fetchLink({
            address: `masters/exportRateMaster?FromDate=${filters?.Fromdate}&NewDate=${filters?.NewDate}`,
            method: "POST",
            bodyData: { bulkData },
        })
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setExportDialog(false);
                    setFilters({ ...filters, NewDate: "" });
                } else {
                    toast.error(data.message);
                }
            })
            .catch(e => console.error(e))
            .finally(() => {
                if (loadingOff) loadingOff();
            });
    };

    const groupByPosBrandId = data => {
        return data.reduce((result, item) => {
            const { Pos_Brand_Id } = item;
            if (!result[Pos_Brand_Id]) {
                result[Pos_Brand_Id] = [];
            }
            result[Pos_Brand_Id].push(item);
            return result;
        }, {});
    };

    const handleDownload = async () => {
        const activePosData = posData.filter(
            item => item.Is_Active_Decative === 1,
        );
        if (activePosData.length === 0) {
            alert("No active data available for download.");
            return;
        }

        const groupedData = groupByPosBrandId(activePosData);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("PriceList_Data");

        const uniqueDate =
            activePosData.length > 0
                ? activePosData[0].Rate_Date.split("T")[0]
                      .split("-")
                      .reverse()
                      .join("-")
                : "";

        worksheet.addRow([uniqueDate, "PriceList"]).font = {
            bold: true,
            size: 14,
        };

        Object.entries(groupedData).forEach(([brandId, products]) => {
            const brandRow = worksheet.addRow([products[0].POS_Brand_Name]);
            const brandCell = brandRow.getCell(1);

            brandCell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFF00" },
            };
            brandCell.font = { bold: true, size: 12 };

            products.forEach(item => {
                worksheet.addRow([item.Short_Name, item.Rate]);
            });
        });

        worksheet.columns = [{ width: 40 }, { width: 15 }];

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "PriceList_Data.xlsx");
    };

    const syncLOS = () => {
        fetchLink({
            address: `masters/posproductSync`,
        })
            .then(data => {
                if (data) {
                    toast.success(data?.message);
                }
            })
            .catch(e => console.error(e));
    };

    return (
        <div>
            <div className="date-inputs">
                <div className="p-2 d-flex align-items-center flex-wrap border-bottom">
                    <h5 className="m-0 my-1 flex-grow-1 d-flex align-items-center flex-wrap">
                        <span className="mx-2">Rate Master</span>
                        <Button onClick={() => setExportDialog(true)}>
                            Export To
                        </Button>
                        <Button
                            className="mx-2 btn btn-dark"
                            style={{ outline: "none", boxShadow: "none" }}
                            onClick={handleDownload}>
                            Download Excel
                        </Button>
                    </h5>
                    <Tooltip title="Sync Data">
                        <IconButton onClick={syncLOS}>
                            <Sync />
                        </IconButton>
                    </Tooltip>
                    <div>
                        <input
                            type="date"
                            value={filters.Fromdate}
                            onChange={e => {
                                const newFromDate = e.target.value;
                                setFilters({
                                    ...filters,
                                    Fromdate: newFromDate,
                                    fetchFrom: newFromDate,
                                });
                            }}
                            className="cus-inpt w-auto p-1"
                        />
                    </div>
                    {/* <span className="px-2">To</span>
                    <input
                        type="date"
                        value={filters.Todate}
                        onChange={(e) => {
                            const newToDate = e.target.value;
                            setFilters({
                                ...filters,
                                Todate: newToDate,
                                fetchTo: newToDate,
                            });
                        }}
                        className="cus-inpt me-2 w-auto p-1"
                    /> */}

                    <IconButton
                        onClick={() => {
                            const updatedFilters = {
                                Fromdate: filters?.Fromdate,
                            };
                            updateQueryString(updatedFilters);
                        }}
                        variant="outlined"
                        size="small">
                        <Search />
                    </IconButton>
                    {filters?.Fromdate === moment().format("YYYY-MM-DD") ? (
                        <Button onClick={() => setAddDialog(true)}>Add</Button>
                    ) : null}
                </div>
            </div>

            <FilterableTable
                dataArray={posData}
                EnableSerialNumber={true}
                isExpendable={true}
                maxHeightOption={true}
                columns={[
                    createCol("Rate_Date", "date", "Rate Date"),
                    createCol("POS_Brand_Name", "string", "Brand"),
                    createCol("Short_Name", "string", "Product"),
                    createCol("Rate", "string", "Rate"),
                    {
                        Field_Name: "Is_Active_Decative",
                        ColumnHeader: "Status",
                        isVisible: 1,
                        isCustomCell: true,

                        Cell: ({ row }) => {
                            const values =
                                row.Is_Active_Decative === 1
                                    ? "Active"
                                    : "Inactive";

                            return (
                                <span
                                    className="py-0 fw-bold px-2 rounded-4 fa-12 text-white"
                                    style={{
                                        backgroundColor:
                                            values === "Active"
                                                ? "green"
                                                : "red",
                                    }}>
                                    {values}
                                </span>
                            );
                        },
                    },

                    filters?.Fromdate === moment().format("YYYY-MM-DD")
                        ? {
                              Field_Name: "Actions",
                              ColumnHeader: "Actions",
                              isVisible: 1,
                              isCustomCell: true,
                              Cell: ({ row }) => (
                                  <td style={{ minWidth: "80px" }}>
                                      <IconButton
                                          onClick={() => editRow(row)}
                                          size="small">
                                          <Edit className="fa-in" />
                                      </IconButton>
                                      <IconButton
                                          onClick={() => {
                                              setOpen(true);
                                              setInputValue({ Id: row.Id });
                                          }}
                                          size="small"
                                          color="error">
                                          <Delete className="fa-in " />
                                      </IconButton>
                                  </td>
                              ),
                          }
                        : {
                              Field_Name: "Actions",
                              ColumnHeader: "Actions",
                              isVisible: 1,
                              isCustomCell: true,
                              Cell: ({ row }) => <td>-</td>,
                          },
                ]}
            />

            <Dialog
                open={addDialog}
                onClose={() => setAddDialog(false)}
                fullWidth
                maxWidth="sm">
                <DialogTitle>
                    {inputValue.Id ? "UPDATE" : "CREATE"} RATE MASTER
                </DialogTitle>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        inputValue.Id ? handleUpdate() : handleRateMasterAdd();
                    }}>
                    <DialogContent>
                        <label>Rate Date</label>
                        <input
                            type="date"
                            value={inputValue.Rate_Date}
                            onChange={e =>
                                setInputValue({
                                    ...inputValue,
                                    Rate_Date: e.target.value,
                                })
                            }
                            className="cus-inpt"
                        />

                        <label>POS Brand</label>
                        <select
                            value={selectedPosBrand}
                            onChange={e => {
                                const selectedBrand = e.target.value;
                                setSelectedPosBrand(selectedBrand);
                                setInputValue({
                                    ...inputValue,
                                    Pos_Brand_Id: selectedBrand,
                                });
                            }}
                            className="cus-inpt">
                            <option value="" disabled>
                                Select POS Brand
                            </option>

                            {posBrand.map((o, i) => (
                                <option key={i} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>

                        <label>Product</label>
                        <select
                            className="cus-inpt"
                            disabled={!selectedPosBrand}
                            value={inputValue.Item_Id}
                            onChange={e => {
                                setInputValue({
                                    ...inputValue,
                                    Item_Id: e.target.value,
                                });
                            }}>
                            <option value="" disabled>
                                Select Product
                            </option>
                            {product.length > 0 ? (
                                product.map((p, i) => (
                                    <option key={i} value={p.value}>
                                        {p.label}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>
                                    No products available
                                </option>
                            )}
                        </select>

                        <label>Rate</label>
                        <TextField
                            label=""
                            value={inputValue.Rate ?? ""}
                            onChange={e =>
                                setInputValue({
                                    ...inputValue,
                                    Rate: e.target.value,
                                })
                            }
                            fullWidth
                            margin="dense"
                            variant="outlined"
                        />

                        <label>Status</label>
                        <select
                            value={inputValue.Is_Active_Decative}
                            onChange={e =>
                                setInputValue({
                                    ...inputValue,
                                    Is_Active_Decative: e.target.value,
                                })
                            }>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </DialogContent>
                    <DialogActions>
                        <Button
                            onClick={() => {
                                setInputValue({});
                                setAddDialog(false);
                            }}>
                            Cancel
                        </Button>

                        <Button type="submit" variant="contained">
                            Save
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description">
                <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
                <DialogContent>
                    <b>Do you want to delete the RateMaster?</b>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={() => handleDelete(inputValue.Id)}
                        autoFocus
                        color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={exportDialog}
                onClose={() => setExportDialog(false)}
                fullWidth
                maxWidth="sm">
                <DialogTitle id="alert-dialog-title">Confirmation</DialogTitle>
                <DialogContent>
                    <b>
                        Do you want to export data from:
                        <div>
                            <label>From Date</label>
                            <input
                                type="date"
                                disabled
                                value={filters.Fromdate}
                                onChange={e => {
                                    const newFromDate = e.target.value;
                                    setFilters({
                                        ...filters,
                                        Fromdate: newFromDate,
                                        fetchFrom: newFromDate,
                                    });
                                }}
                                className="cus-inpt w-auto p-1"
                            />
                        </div>
                        <br />
                        <div>
                            <label>New Date</label>
                            <input
                                type="date"
                                value={filters.NewDate}
                                onChange={e => {
                                    const newDate = e.target.value;
                                    setFilters({
                                        ...filters,
                                        NewDate: newDate,
                                    });
                                }}
                                className="cus-inpt w-auto p-1"
                            />
                        </div>
                    </b>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExportDialog(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={() => handleExportData()}
                        autoFocus
                        color="primary">
                        Export
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default RateMaster;
