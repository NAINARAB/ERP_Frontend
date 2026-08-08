import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import {
    IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField,
    FormControl, RadioGroup, FormControlLabel, Radio, Switch
} from "@mui/material";
import { Search, Edit } from "@mui/icons-material";
import { toast } from "react-toastify";
import { Button } from "react-bootstrap";

// Field names below match the actual /api/masters/products response:
// Product_Id, Product_Code, Product_Name, Short_Name, Pos_Brand_Id, Brand_Name, IsActive
const emptyProduct = {
    Product_Id: "",
    Product_Name: "",
    Short_Name: "",
    Pos_Brand_Id: "",
    Brand_Name: "",
    IsActive: "1",
};

function ActiveProductMaster({ loadingOn, loadingOff }) {
    const [products, setProducts] = useState([]);
    const [posBrand, setPosBrand] = useState([]);
    const [reload, setReload] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Switch: checked = show Active only, unchecked = show Inactive only
    const [showActiveOnly, setShowActiveOnly] = useState(true);

    // Add dialog (POST)
    const [addDialog, setAddDialog] = useState(false);
    const [inputValue, setInputValue] = useState(emptyProduct);

    // Status-only popup (PUT) triggered from the Edit icon
    const [statusDialog, setStatusDialog] = useState(false);
    const [statusRow, setStatusRow] = useState(null);
    const [statusValue, setStatusValue] = useState("1");
    const [savingStatus, setSavingStatus] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));

    // Dynamic list height: fills the remaining viewport below the filter bar,
    // and recalculates on window resize so it always matches the actual screen size.
    const filterBarRef = useRef(null);
    const [listHeight, setListHeight] = useState(400);

    useEffect(() => {
        const BOTTOM_PADDING = 16; // small gap below the list

        const recalcHeight = () => {
            const filterBarBottom = filterBarRef.current
                ? filterBarRef.current.getBoundingClientRect().bottom
                : 0;
            const available = window.innerHeight - filterBarBottom - BOTTOM_PADDING;
            setListHeight(Math.max(available, 200)); // never collapse below 200px
        };

        recalcHeight();
        window.addEventListener("resize", recalcHeight);
        return () => window.removeEventListener("resize", recalcHeight);
    }, []);

    // Keep latest loadingOn/loadingOff in refs so unstable parent-passed
    // function identities never cause the fetch effect to re-run.
    const loadingOnRef = useRef(loadingOn);
    const loadingOffRef = useRef(loadingOff);
    useEffect(() => { loadingOnRef.current = loadingOn; }, [loadingOn]);
    useEffect(() => { loadingOffRef.current = loadingOff; }, [loadingOff]);

    // ---------------- Fetch product list ----------------
    const fetchProducts = useCallback(() => {
        if (loadingOnRef.current) loadingOnRef.current();
        fetchLink({ address: `masters/products` })
            .then(response => {
                if (response && response.success) {
                    let records = [];
                    if (Array.isArray(response.data)) {
                        records = response.data;
                    } else if (response.data && Array.isArray(response.data.data)) {
                        records = response.data.data;
                    } else if (response.data && typeof response.data === "object") {
                        const arrayProp = Object.values(response.data).find(val => Array.isArray(val));
                        records = arrayProp || [];
                    }
                    setProducts(records);
                } else {
                    setProducts([]);
                }
            })
            .catch(e => {
                console.error("Error fetching products:", e);
                setProducts([]);
            })
            .finally(() => { if (loadingOffRef.current) loadingOffRef.current(); });
    }, []); 

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts, reload]);

    useEffect(() => {
        fetchLink({ address: `masters/posbranch/dropdown` })
            .then(data => { if (data.success) setPosBrand(data.data); })
            .catch(e => console.error(e));
    }, []);

    // ---------------- Create product (POST) ----------------
    const handleAddProduct = () => {
        if (!inputValue.Product_Name?.trim()) {
            toast.error("Product Name is required.");
            return;
        }
        const requestData = {
            Product_Name: inputValue.Product_Name,
            Short_Name: inputValue.Short_Name || "",
            Pos_Brand_Id: inputValue.Pos_Brand_Id ? parseInt(inputValue.Pos_Brand_Id) : null,
            IsActive: inputValue.IsActive === "1" ? 1 : 0,
            Created_By: user?.UserId || localStorage.getItem("username") || "System",
        };

        fetchLink({ address: `masters/products`, method: "POST", bodyData: requestData })
            .then(data => {
                if (data.success) {
                    toast.success(data.message || "Product created successfully!");
                    setAddDialog(false);
                    setInputValue(emptyProduct);
                    setReload(prev => !prev);
                } else {
                    toast.error(data.message || "Failed to create product");
                }
            })
            .catch(e => {
                console.error(e);
                toast.error("Failed to create product");
            });
    };

    // ---------------- Update status only (PUT) ----------------
    const openStatusDialog = (row) => {
        setStatusRow(row);
        setStatusValue(row.IsActive === 1 || row.IsActive === "1" ? "1" : "0");
        setStatusDialog(true);
    };

    const closeStatusDialog = () => {
        setStatusDialog(false);
        setStatusRow(null);
        setStatusValue("1");
    };

    const handleSaveStatus = () => {
        if (!statusRow) return;
        const newStatus = statusValue === "1" ? 1 : 0;

        if (newStatus === statusRow.IsActive) {
            closeStatusDialog();
            return;
        }

        setSavingStatus(true);
        fetchLink({
            address: `masters/products`,
            method: "PUT",
            bodyData: {
                ...statusRow,
                IsActive: newStatus,
                Old_IsActive: statusRow.IsActive,
                Updated_By: user?.UserId || null,
            },
        })
            .then(data => {
                if (data.success) {
                    toast.success("Status updated successfully!");
                    setProducts(prev => prev.map(p =>
                        p.Product_Id === statusRow.Product_Id ? { ...p, IsActive: newStatus } : p
                    ));
                    closeStatusDialog();
                } else {
                    toast.error(data.message || "Failed to update status");
                }
            })
            .catch(e => {
                console.error(e);
                toast.error("Failed to update status");
            })
            .finally(() => setSavingStatus(false));
    };

    // ---------------- Filtering ----------------
    const filteredProducts = useMemo(() => {
        if (!Array.isArray(products)) return [];

        // IsActive can arrive as a number (1/0) or a numeric string ("1"/"0") depending
        // on the API/DB driver, so normalize before comparing.
        const isActiveRow = (item) => Number(item.IsActive) === 1;

        let data = products.filter(item =>
            showActiveOnly ? isActiveRow(item) : !isActiveRow(item)
        );

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase().trim();
            data = data.filter(item => {
                const shortName = item.Short_Name;
                const hasValidShortName = shortName && shortName !== "0" && shortName.trim() !== "";
                return (
                    (item.Brand_Name || "").toLowerCase().includes(term) ||
                    (hasValidShortName && shortName.toLowerCase().includes(term)) ||
                    (item.Product_Name && item.Product_Name.toLowerCase().includes(term)) ||
                    (item.Product_Code && item.Product_Code.toLowerCase().includes(term))
                );
            });
        }

        return data;
    }, [products, searchTerm, showActiveOnly]);

    const getProductName = (row) => {
        const shortName = row.Short_Name;
        if (shortName && shortName !== "0" && shortName.trim() !== "") return shortName;
        return row.Product_Name || "-";
    };

    return (
        <div>
            <div ref={filterBarRef} className="p-2 d-flex align-items-center flex-wrap border-bottom gap-2">
                <h5 className="m-0 my-1 flex-grow-1">Product Master</h5>

                <div
                    className="d-flex align-items-center rounded px-2"
                    style={{ height: 36, backgroundColor: "#ffffff", border: "1.5px solid #000000" }}
                >
                    <Search style={{ fontSize: 18, color: "#6b7280", marginRight: 4 }} />
                    <input
                        type="text"
                        placeholder={`Search ${showActiveOnly ? "active" : "inactive"} products...`}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{ border: "none", outline: "none", fontSize: 13, width: 220, background: "transparent" }}
                    />
                    {searchTerm && (
                        <span
                            onClick={() => setSearchTerm("")}
                            style={{ cursor: "pointer", fontSize: 13, color: "#9ca3af", marginLeft: 4 }}
                        >
                            ✕
                        </span>
                    )}
                </div>

                {/* Active / Inactive switch */}
                <FormControlLabel
                    control={
                        <Switch
                            checked={showActiveOnly}
                            onChange={(e) => {
                                setShowActiveOnly(e.target.checked);
                                setSearchTerm("");
                            }}
                            color="primary"
                        />
                    }
                    label={
                        <span style={{ fontSize: 13, fontWeight: 500 }}>
                            {showActiveOnly ? "Active" : "Inactive"}
                        </span>
                    }
                    labelPlacement="start"
                    style={{ marginRight: 0 }}
                />

                <Button onClick={() => { setInputValue(emptyProduct); setAddDialog(true); }}>
                    Add
                </Button>
            </div>

            {/* Inline-scrollable list: fixed height, sticky header, body scrolls */}
            <div
                className="table-responsive"
                style={{ height: listHeight, overflowY: "auto", border: "1px solid #dee2e6", borderTop: "none" }}
            >
                <table className="table table-sm table-bordered mb-0">
                    <thead
                        className="table-light"
                        style={{ position: "sticky", top: 0, zIndex: 1 }}
                    >
                        <tr>
                            <th style={{ textAlign: "center" }}>#</th>
                            <th>Code</th>
                            <th>Brand</th>
                            <th>Product</th>
                            <th style={{ textAlign: "center" }}>Status</th>
                            <th style={{ textAlign: "center", minWidth: "80px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center">No data available</td>
                            </tr>
                        ) : (
                            filteredProducts.map((row, idx) => (
                                <tr key={row.Product_Id}>
                                    <td style={{ textAlign: "center" }}>{idx + 1}</td>
                                    <td>{row.Product_Code || "-"}</td>
                                    <td>{row.Brand_Name || "-"}</td>
                                    <td style={{ minWidth: "200px" }}>{getProductName(row)}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <span
                                            className="badge"
                                            style={{
                                                backgroundColor: Number(row.IsActive) === 1 ? "green" : "red",
                                                color: "white",
                                                padding: "5px 10px",
                                            }}
                                        >
                                            {Number(row.IsActive) === 1 ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "center" }}>
                                        <IconButton onClick={() => openStatusDialog(row)} size="small">
                                            <Edit fontSize="small" />
                                        </IconButton>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Product Dialog (POST) */}
            <Dialog open={addDialog} onClose={() => setAddDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>CREATE PRODUCT</DialogTitle>
                <form onSubmit={e => { e.preventDefault(); handleAddProduct(); }}>
                    <DialogContent>
                        <label>POS Brand</label>
                        <select
                            value={inputValue.Pos_Brand_Id}
                            onChange={e => setInputValue({ ...inputValue, Pos_Brand_Id: e.target.value })}
                            className="cus-inpt"
                            required
                        >
                            <option value="" disabled>Select POS Brand</option>
                            {posBrand.map((o, i) => (
                                <option key={i} value={o.value}>{o.label}</option>
                            ))}
                        </select>

                        <label>Product Name</label>
                        <TextField
                            value={inputValue.Product_Name}
                            onChange={e => setInputValue({ ...inputValue, Product_Name: e.target.value })}
                            fullWidth
                            margin="dense"
                            variant="outlined"
                            required
                        />

                        <label>Short Name</label>
                        <TextField
                            value={inputValue.Short_Name}
                            onChange={e => setInputValue({ ...inputValue, Short_Name: e.target.value })}
                            fullWidth
                            margin="dense"
                            variant="outlined"
                        />

                        <label>Status</label>
                        <select
                            className="cus-inpt"
                            value={inputValue.IsActive}
                            onChange={e => setInputValue({ ...inputValue, IsActive: e.target.value })}
                            required
                        >
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => { setInputValue(emptyProduct); setAddDialog(false); }}>Cancel</Button>
                        <Button type="submit" variant="contained">Save</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Status-only popup opened from the Edit icon (PUT) */}
            <Dialog open={statusDialog} onClose={closeStatusDialog} maxWidth="xs" fullWidth>
                <DialogTitle>Update Status</DialogTitle>
                <DialogContent>
                    <div style={{ marginBottom: 8, fontWeight: 500 }}>
                        {statusRow ? getProductName(statusRow) : ""}
                    </div>
                    <FormControl>
                        <RadioGroup
                            row
                            value={statusValue}
                            onChange={e => setStatusValue(e.target.value)}
                        >
                            <FormControlLabel value="1" control={<Radio />} label="Active" />
                            <FormControlLabel value="0" control={<Radio />} label="Inactive" />
                        </RadioGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeStatusDialog}>Cancel</Button>
                    <Button onClick={handleSaveStatus} variant="contained" disabled={savingStatus}>
                        {savingStatus ? "Saving..." : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default ActiveProductMaster;