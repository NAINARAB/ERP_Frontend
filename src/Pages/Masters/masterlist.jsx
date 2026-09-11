import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchLink } from "../../Components/fetchComponent";
import { toast } from "react-toastify";
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import * as XLSX from "xlsx";



const MASTER_TYPES = [
    { key: "accountingGroup", label: "Accounting Group", kind: "simple",
        postProcess: (rows) => {
            const byId = new Map(rows.map((r) => [String(r.Group_Id), r]));
            return rows.map((r) => ({
                ...r,
                Parent_Group_Name: r.Parent_AC_id && byId.has(String(r.Parent_AC_id))
                    ? byId.get(String(r.Parent_AC_id)).Group_Name
                    : "",
            }));
        } },
    { key: "accountMaster", label: "Account Master", kind: "accountMaster" },
    { key: "stockGroup", label: "Stock Group", kind: "simple",
    postProcess: (rows) => {
        const byId = new Map(rows.map((r) => [String(r.St_Group_Id), r]));
        return rows.map((r) => ({
            ...r,
            Parent_Group_Name:
                r.Parent_Id !== null && r.Parent_Id !== undefined && byId.has(String(r.Parent_Id))
                    ? byId.get(String(r.Parent_Id)).St_Group
                    : "",
        }));
    } },
    { key: "stockItem", label: "Stock Item", kind: "stockItem" },
    { key: "voucher", label: "Voucher", kind: "simple" },
    { key: "godown", label: "Godown", kind: "simple" },
    { key: "unit", label: "Unit", kind: "simple" },
    { key: "costcenter", label: "Cost Center", kind: "simple" },
    { key: "costcategory", label: "Cost Category", kind: "simple" },
];

const ACCOUNT_MASTER_TABS = [
    { key: "accounting", label: "Accounting", hasSub: true, disabled: false },
    { key: "retailers", label: "Retailers", hasSub: true, disabled: false },
    { key: "lol", label: "LOL", hasSub: true, disabled: false },
    { key: "loe", label: "LOE", hasSub: false, disabled: false },
];


const COLUMN_EXCLUDES = {
    retailers: ["Profile_Pic", "ImageName", "ImagePath", "ImageType", "ImageSize"],
};

const COUNTS_ADDRESS = "masters/summary/getMasterCounts";
const SIMPLE_DETAILS_ADDRESS = (typeKey) => `masters/summary/getMasterDetails?type=${typeKey}`;
const ACCOUNT_MASTER_DETAILS_ADDRESS = ({ section, mapped }) =>
    `masters/summary/getAccountMasterDetails?section=${section}&mapped=${mapped}`;
const STOCK_ITEM_SUMMARY_ADDRESS = "masters/summary/getStockItemSummary";
const STOCK_ITEM_DETAILS_ADDRESS = ({ mapped }) =>
    `masters/summary/getStockItemDetails?mapped=${mapped}`;

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function useDebouncedValue(value, delay) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}



const ACRONYMS = new Set(["ID", "ERP", "GST", "AC", "LOL", "LOE", "PDKT"]);

function humanizeKey(key) {
    const words = key
        .replace(/_/g, " ")
        .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
    return words
        .map((w) => {
            const upper = w.toUpperCase();
            if (ACRONYMS.has(upper)) return upper;
            return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        })
        .join(" ");
}


function deriveColumns(rows, excludeKeys = []) {
    if (!rows || !rows.length) return [];
    const excluded = new Set(excludeKeys);
    return Object.keys(rows[0])
        .filter((k) => !excluded.has(k))
        .map((k) => [k, humanizeKey(k)]);
}


function useColumnVisibility(allColumns) {
    const [hiddenKeys, setHiddenKeys] = useState(() => new Set());
    const allKeysSignature = allColumns.map(([key]) => key).join("|");

    useEffect(() => {
        setHiddenKeys(new Set());
    }, [allKeysSignature]);

    const visibleColumns = useMemo(
        () => allColumns.filter(([key]) => !hiddenKeys.has(key)),
        [allColumns, hiddenKeys]
    );

    const toggleColumn = (key) => {
        setHiddenKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    return { visibleColumns, hiddenKeys, toggleColumn };
}

function exportToExcel(filename, columns, rows) {
    if (!columns.length) {
        toast.error("Enable at least one column before downloading.");
        return;
    }
    if (!rows.length) {
        toast.error("No records to download.");
        return;
    }
    const data = rows.map((row) => {
        const obj = {};
        columns.forEach(([key, label]) => {
            obj[label] = row[key] ?? "";
        });
        return obj;
    });
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const safeName = filename.replace(/[^a-z0-9_\-]+/gi, "_");
    XLSX.writeFile(workbook, `${safeName}.xlsx`);
}



function StatRow({ items }) {
    return (
        <div className="me-stat-row">
            {items.map((it) => (
                <div className="me-stat-box" key={it.label}>
                    <div className="me-stat-num">{it.value}</div>
                    <div className="me-stat-lbl">{it.label}</div>
                </div>
            ))}
        </div>
    );
}

function ColumnPicker({ allColumns, hiddenKeys, toggleColumn }) {
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onClickOutside = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, [open]);

    const visibleCount = allColumns.length - hiddenKeys.size;

    return (
        <div className="me-colpicker" ref={wrapRef}>
            <button type="button" className="me-colpicker-btn" onClick={() => setOpen((o) => !o)}>
                <ViewColumnIcon fontSize="small" />
                <span>Columns ({visibleCount}/{allColumns.length})</span>
            </button>
            {open && (
                <div className="me-colpicker-menu">
                    {allColumns.map(([key, label]) => (
                        <label className="me-colpicker-item" key={key}>
                            <input
                                type="checkbox"
                                checked={!hiddenKeys.has(key)}
                                onChange={() => toggleColumn(key)}
                            />
                            <span>{label}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

function Toolbar({ search, onSearch, pageSize, onPageSize, allColumns, hiddenKeys, toggleColumn, onDownload }) {
    return (
        <div className="me-toolbar">
            <div className="me-search-wrap">
                <SearchIcon fontSize="small" className="me-search-icon" />
                <input
                    type="text"
                    placeholder="Search..."
                    value={search}
                    onChange={(e) => onSearch(e.target.value)}
                />
            </div>
            <div className="me-toolbar-right">
                {allColumns && allColumns.length > 0 && (
                    <ColumnPicker allColumns={allColumns} hiddenKeys={hiddenKeys} toggleColumn={toggleColumn} />
                )}
                {onDownload && (
                    <button type="button" className="me-download-btn" onClick={onDownload} title="Download visible columns as Excel">
                        <FileDownloadIcon fontSize="small" />
                        <span>Download</span>
                    </button>
                )}
                <div className="me-page-size">
                    <select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))}>
                        {PAGE_SIZE_OPTIONS.map((n) => (
                            <option key={n} value={n}>{n} / page</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

function DataTable({ columns, rows, loading, noData }) {
    if (loading) {
        return <div className="me-empty-state">Loading…</div>;
    }
    if (noData) {
        return <div className="me-empty-state">No records found.</div>;
    }
    if (!columns.length) {
        return <div className="me-empty-state">All columns are hidden. Enable at least one from the Columns menu.</div>;
    }
    if (!rows.length) {
        return <div className="me-empty-state">No records found.</div>;
    }
    return (
        <div className="me-table-scroll">
            <table className="me-table">
                <thead>
                    <tr>{columns.map(([key, label]) => <th key={key}>{label}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={row.id ?? i}>
                            {columns.map(([key]) => <td key={key}>{row[key] ?? ""}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function Pagination({ page, pageSize, total, onPage }) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);
    return (
        <div className="me-pagination">
            <span>{from}-{to} of {total}</span>
            <div className="me-pagination-controls">
                <button disabled={page <= 1} onClick={() => onPage(page - 1)}>Prev</button>
                <span>Page {page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</button>
            </div>
        </div>
    );
}

function LiveCount({ loading, count }) {
    return (
        <div className="me-live-count">
            {loading ? (
                "Loading…"
            ) : (
                <>
                    <strong>{count}</strong> record{count === 1 ? "" : "s"}
                </>
            )}
        </div>
    );
}



function SimpleMasterView({ type, loadingOn, loadingOff }) {
    const [allRows, setAllRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebouncedValue(search, 300);

    const columns = useMemo(
        () => deriveColumns(allRows, COLUMN_EXCLUDES[type.key]),
        [allRows, type.key]
    );
    const { visibleColumns, hiddenKeys, toggleColumn } = useColumnVisibility(columns);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                loadingOn && loadingOn();
                const res = await fetchLink({ address: SIMPLE_DETAILS_ADDRESS(type.key) });
                if (cancelled) return;
                if (res.success) {
                    const raw = Array.isArray(res.data) ? res.data : (res.data?.rows || []);
                    setAllRows(type.postProcess ? type.postProcess(raw) : raw);
                } else {
                    toast.error(res.message || `Failed to load ${type.label}`);
                }
            } catch (err) {
                console.error(`Error fetching ${type.label}:`, err);
                if (!cancelled) toast.error(`Failed to load ${type.label}`);
            } finally {
                if (!cancelled) { setLoading(false); loadingOff && loadingOff(); }
            }
        };
        load();
        return () => { cancelled = true; };
    }, [type.key]);

    useEffect(() => { setPage(1); }, [debouncedSearch, pageSize]);

    const filteredRows = useMemo(() => {
        if (!debouncedSearch) return allRows;
        const term = debouncedSearch.toLowerCase();
        const fields = columns.map(([key]) => key);
        return allRows.filter((row) => fields.some((f) => String(row[f] ?? "").toLowerCase().includes(term)));
    }, [allRows, debouncedSearch, columns]);

    const total = filteredRows.length;
    const pageRows = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, page, pageSize]);

    return (
        <>
 <LiveCount loading={loading} count={allRows.length} />
            <Toolbar
                search={search} onSearch={setSearch} pageSize={pageSize} onPageSize={setPageSize}
                allColumns={columns} hiddenKeys={hiddenKeys} toggleColumn={toggleColumn}
                onDownload={() => exportToExcel(type.label, visibleColumns, filteredRows)}
                
            />
            
            <div className="me-table-card">
                
                <DataTable
                    columns={visibleColumns}
                    rows={pageRows}
                    loading={loading}
                    noData={!loading && allRows.length === 0}
                />
                <Pagination page={page} pageSize={pageSize} total={total} onPage={setPage} />
            </div>
        </>
    );
}



function AccountMasterView({ loadingOn, loadingOff }) {
    const [activeTab, setActiveTab] = useState("accounting");
    const [subFilter, setSubFilter] = useState("mapped");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");
    const [allRows, setAllRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tabCounts, setTabCounts] = useState({ mapped: null, unmapped: null });
    const [countsLoading, setCountsLoading] = useState(false);
    const debouncedSearch = useDebouncedValue(search, 300);

    const tabDef = ACCOUNT_MASTER_TABS.find((t) => t.key === activeTab);

    const columns = useMemo(
        () => deriveColumns(allRows, COLUMN_EXCLUDES[activeTab]),
        [allRows, activeTab]
    );
    const { visibleColumns, hiddenKeys, toggleColumn } = useColumnVisibility(columns);

    useEffect(() => {
        if (tabDef.disabled) { setTabCounts({ mapped: null, unmapped: null }); return; }
        let cancelled = false;
        const loadCounts = async () => {
            try {
                setCountsLoading(true);
                if (tabDef.hasSub) {
                    const [mappedRes, unmappedRes] = await Promise.all([
                        fetchLink({ address: ACCOUNT_MASTER_DETAILS_ADDRESS({ section: activeTab, mapped: true }) }),
                        fetchLink({ address: ACCOUNT_MASTER_DETAILS_ADDRESS({ section: activeTab, mapped: false }) }),
                    ]);
                    if (cancelled) return;
                    setTabCounts({
                        mapped: mappedRes.success && Array.isArray(mappedRes.data) ? mappedRes.data.length : 0,
                        unmapped: unmappedRes.success && Array.isArray(unmappedRes.data) ? unmappedRes.data.length : 0,
                    });
                } else {
                    const res = await fetchLink({ address: ACCOUNT_MASTER_DETAILS_ADDRESS({ section: activeTab, mapped: true }) });
                    if (cancelled) return;
                    setTabCounts({
                        mapped: null,
                        unmapped: res.success && Array.isArray(res.data) ? res.data.length : 0,
                    });
                }
            } catch (err) {
                console.error("Error fetching tab counts:", err);
                if (!cancelled) setTabCounts({ mapped: null, unmapped: null });
            } finally {
                if (!cancelled) setCountsLoading(false);
            }
        };
        loadCounts();
        return () => { cancelled = true; };
    }, [activeTab]);

    useEffect(() => {
        if (tabDef.disabled) { setAllRows([]); return; }
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                loadingOn && loadingOn();
                const res = await fetchLink({
                    address: ACCOUNT_MASTER_DETAILS_ADDRESS({
                        section: activeTab,
                        mapped: tabDef.hasSub ? subFilter === "mapped" : true,
                    }),
                });
                if (cancelled) return;
                if (res.success) {
                    setAllRows(Array.isArray(res.data) ? res.data : []);
                } else {
                    setAllRows([]);
                    if (res.message && res.message !== "No data found") {
                        toast.error(res.message || "Failed to load Account Master details");
                    }
                }
            } catch (err) {
                console.error("Error fetching Account Master details:", err);
                if (!cancelled) toast.error("Failed to load Account Master details");
            } finally {
                if (!cancelled) { setLoading(false); loadingOff && loadingOff(); }
            }
        };
        load();
        return () => { cancelled = true; };
    }, [activeTab, subFilter]);

    useEffect(() => { setPage(1); }, [activeTab, subFilter, debouncedSearch, pageSize]);

    const filteredRows = useMemo(() => {
        if (!debouncedSearch) return allRows;
        const term = debouncedSearch.toLowerCase();
        const fields = columns.map(([key]) => key);
        return allRows.filter((row) => fields.some((f) => String(row[f] ?? "").toLowerCase().includes(term)));
    }, [allRows, debouncedSearch, columns]);

    const total = filteredRows.length;
    const pageRows = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, page, pageSize]);

    const statItems = tabDef.hasSub
        ? [
            { label: `${tabDef.label} — Mapped`, value: countsLoading ? "…" : (tabCounts.mapped ?? 0) },
            { label: `${tabDef.label} — Not Mapped`, value: countsLoading ? "…" : (tabCounts.unmapped ?? 0) },
        ]
        : [
            { label: `${tabDef.label} — Total`, value: countsLoading ? "…" : (tabCounts.unmapped ?? 0) },
        ];

    return (
        <>
            <StatRow items={statItems} />
            <div className="me-tabs">
                {ACCOUNT_MASTER_TABS.map((t) => (
                    <button
                        key={t.key}
                        className={`me-tab-btn ${t.key === activeTab ? "active" : ""} ${t.disabled ? "me-tab-disabled" : ""}`}
                        disabled={t.disabled}
                        title={t.disabled ? "Coming soon" : undefined}
                        onClick={() => { setActiveTab(t.key); setSubFilter("mapped"); }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            {tabDef.disabled ? (
                <div className="me-empty-state">This section isn't available yet.</div>
            ) : (
                <>
                    {tabDef.hasSub && (
                        <div className="me-subtoggle">
                            <button className={`mapped ${subFilter === "mapped" ? "active" : ""}`} onClick={() => setSubFilter("mapped")}>Mapped</button>
                            <button className={`unmapped ${subFilter === "unmapped" ? "active" : ""}`} onClick={() => setSubFilter("unmapped")}>Not Mapped</button>
                        </div>
                    )}
                    <Toolbar
                        search={search} onSearch={setSearch} pageSize={pageSize} onPageSize={setPageSize}
                        allColumns={columns} hiddenKeys={hiddenKeys} toggleColumn={toggleColumn}
                        onDownload={() => exportToExcel(`${tabDef.label}_${tabDef.hasSub ? subFilter : "all"}`, visibleColumns, filteredRows)}
                    />
                    <div className="me-table-card">
                        <DataTable
                            columns={visibleColumns}
                            rows={pageRows}
                            loading={loading}
                            noData={!loading && allRows.length === 0}
                        />
                        <Pagination page={page} pageSize={pageSize} total={total} onPage={setPage} />
                    </div>
                </>
            )}
        </>
    );
}



function StockItemView({ loadingOn, loadingOff }) {
    const [stats, setStats] = useState(null);
    const [subFilter, setSubFilter] = useState("mapped");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const debouncedSearch = useDebouncedValue(search, 300);

    const columns = useMemo(() => deriveColumns(rows, COLUMN_EXCLUDES.stockItem), [rows]);
    const { visibleColumns, hiddenKeys, toggleColumn } = useColumnVisibility(columns);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await fetchLink({ address: STOCK_ITEM_SUMMARY_ADDRESS });
                if (res.success) setStats(res.data);
                else toast.error(res.message || "Failed to load Stock Item summary");
            } catch (err) {
                console.error("Error fetching Stock Item summary:", err);
                toast.error("Failed to load Stock Item summary");
            }
        };
        loadStats();
    }, []);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                setLoading(true);
                loadingOn && loadingOn();
                const res = await fetchLink({
                    address: STOCK_ITEM_DETAILS_ADDRESS({ mapped: subFilter === "mapped" }),
                });
                if (cancelled) return;
                if (res.success) {
                    const raw = Array.isArray(res.data) ? res.data : (res.data?.rows || []);
                    setRows(raw);
                } else {
                    setRows([]);
                    toast.error(res.message || "Failed to load Stock Item details");
                }
            } catch (err) {
                console.error("Error fetching Stock Item details:", err);
                if (!cancelled) toast.error("Failed to load Stock Item details");
            } finally {
                if (!cancelled) { setLoading(false); loadingOff && loadingOff(); }
            }
        };
        load();
        return () => { cancelled = true; };
    }, [subFilter]);

    useEffect(() => { setPage(1); }, [subFilter, debouncedSearch, pageSize]);

    const filteredRows = useMemo(() => {
        if (!debouncedSearch) return rows;
        const term = debouncedSearch.toLowerCase();
        const fields = columns.map(([key]) => key);
        return rows.filter((row) => fields.some((f) => String(row[f] ?? "").toLowerCase().includes(term)));
    }, [rows, debouncedSearch, columns]);

    const pageRows = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filteredRows.slice(start, start + pageSize);
    }, [filteredRows, page, pageSize]);

    return (
        <>
            <StatRow
                items={stats ? [
                    { label: "Total Stock Item", value: stats.total },
                    { label: "Mapped w/ Product Master", value: stats.mapped },
                    { label: "Not Mapped", value: stats.unmapped },
                ] : []}
            />
            <div className="me-subtoggle-row">
                <div className="me-subtoggle">
                    <button className={`mapped ${subFilter === "mapped" ? "active" : ""}`} onClick={() => setSubFilter("mapped")}>Mapped</button>
                    <button className={`unmapped ${subFilter === "unmapped" ? "active" : ""}`} onClick={() => setSubFilter("unmapped")}>Not Mapped</button>
                </div>
               
            </div>
            <Toolbar
                search={search} onSearch={setSearch} pageSize={pageSize} onPageSize={setPageSize}
                allColumns={columns} hiddenKeys={hiddenKeys} toggleColumn={toggleColumn}
                onDownload={() => exportToExcel(`StockItem_${subFilter}`, visibleColumns, filteredRows)}
            />
             <LiveCount loading={loading} count={rows.length} />
            <div className="me-table-card">
                <DataTable
                    columns={visibleColumns}
                    rows={pageRows}
                    loading={loading}
                    noData={!loading && rows.length === 0}
                />
                <Pagination page={page} pageSize={pageSize} total={filteredRows.length} onPage={setPage} />
            </div>
        </>
    );
}

/* ---------------- Grid (landing) view ---------------- */

function GridView({ counts, loading, onOpen }) {
    if (loading || !counts) {
        return <div className="me-empty-state">Loading…</div>;
    }
    return (
        <div className="me-grid-card">
            {MASTER_TYPES.map((m) => (
                <div className="me-grid-row" key={m.key} onClick={() => onOpen(m)}>
                    <div className="me-grid-name">{m.label} <span className="me-count-pill">{counts[m.key] ?? 0}</span></div>
                 
                        
                        <ArrowForwardIosIcon className="me-chev" fontSize="small" />
                    
                </div>
            ))}
        </div>
    );
}



function MasterSummaryList({ loadingOn, loadingOff }) {
    const [counts, setCounts] = useState(null);
    const [countsLoading, setCountsLoading] = useState(false);
    const [selectedType, setSelectedType] = useState(null);

    const fetchCounts = async () => {
        try {
            setCountsLoading(true);
            loadingOn && loadingOn();
            const res = await fetchLink({ address: COUNTS_ADDRESS });
            if (res.success && res.data) {
                setCounts(res.data);
            } else {
                toast.error(res.message || "Failed to load counts");
            }
        } catch (error) {
            console.error("Error fetching master counts:", error);
            toast.error("Failed to load counts");
        } finally {
            setCountsLoading(false);
            loadingOff && loadingOff();
        }
    };

    useEffect(() => { fetchCounts(); }, []);

    const renderDetail = () => {
        if (!selectedType) return null;
        if (selectedType.kind === "simple") return <SimpleMasterView type={selectedType} loadingOn={loadingOn} loadingOff={loadingOff} />;
        if (selectedType.kind === "accountMaster") return <AccountMasterView loadingOn={loadingOn} loadingOff={loadingOff} />;
        if (selectedType.kind === "stockItem") return <StockItemView loadingOn={loadingOn} loadingOff={loadingOff} />;
        return null;
    };

    return (
        <div className="me-shell">
            <style>{MASTERS_EXPLORER_CSS}</style>
            

            {selectedType && (
                <div className="me-crumb">
                    <button className="me-back-btn" onClick={() => setSelectedType(null)} title="Back">
                        <ArrowBackIcon fontSize="small" />
                    </button>
                    <div>
                        <div className="me-crumb-label">{selectedType.label}</div>
                        <div className="me-crumb-sub">
                            {selectedType.kind === "accountMaster"
                                ? "Mapping status across Retailers and Ledger LOL"
                                : selectedType.kind === "stockItem"
                                    ? "Mapping status with Product Master and Stock LOS"
                                    : "Master list"}
                        </div>
                    </div>
                </div>
            )}

            {!selectedType ? (
                <GridView counts={counts} loading={countsLoading} onOpen={setSelectedType} />
            ) : (
                renderDetail()
            )}
        </div>
    );
}



const MASTERS_EXPLORER_CSS = `
.me-shell {
  --me-ink: #1b2430; --me-ink-soft: #5b6472; --me-line: #dde2e8; --me-line-soft: #edf0f4;
  --me-surface: #ffffff; --me-accent: #2a5cdb; --me-accent-soft: #e8eefc;
  --me-ok: #1f8a53; --me-ok-soft: #e6f4ec; --me-warn: #b3541e; --me-warn-soft: #fbeee3;
  --me-radius: 10px;
  color: var(--me-ink);
  font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
.me-shell * { box-sizing: border-box; }

.me-crumb { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.me-back-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 34px; height: 34px; border-radius: 999px; border: 1px solid var(--me-line);
  background: var(--me-surface); cursor: pointer; color: var(--me-ink); flex: none;
}
.me-back-btn:hover { background: var(--me-line-soft); }
.me-crumb-label { font-size: 15px; font-weight: 600; }
.me-crumb-sub { font-size: 13px; color: var(--me-ink-soft); }

.me-grid-card { background: var(--me-surface); border: 1px solid var(--me-line); border-radius: var(--me-radius); overflow: hidden; }
.me-grid-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; cursor: pointer; border-bottom: 1px solid var(--me-line-soft);
}
.me-grid-row:last-child { border-bottom: none; }
.me-grid-row:hover { background: #fafbfd; }
.me-grid-name { font-size: 15px; font-weight: 550; }
.me-grid-right { display: flex; align-items: center; gap: 14px; }
.me-count-pill {
  font-variant-numeric: tabular-nums; font-size: 13.5px; font-weight: 650;
  background: var(--me-accent-soft); color: var(--me-accent); padding: 4px 12px;
  border-radius: 999px; min-width: 44px; text-align: center;
}
.me-chev { color: #97a2b0; }

.me-stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 20px; }
.me-stat-box { background: var(--me-surface); border: 1px solid var(--me-line); border-radius: var(--me-radius); padding: 14px 16px; }
.me-stat-num { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; }
.me-stat-lbl { font-size: 12px; color: var(--me-ink-soft); margin-top: 2px; }

.me-tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--me-line); margin-bottom: 4px; }
.me-tab-btn {
  appearance: none; border: none; background: none; cursor: pointer;
  padding: 10px 16px; font-size: 13.5px; font-weight: 550; color: var(--me-ink-soft);
  border-bottom: 2px solid transparent; margin-bottom: -1px;
}
.me-tab-btn.active { color: var(--me-accent); border-bottom-color: var(--me-accent); }
.me-tab-btn.me-tab-disabled { color: #c2c8d1; cursor: not-allowed; }
.me-tab-btn.me-tab-disabled:hover { background: none; }

.me-subtoggle-row { display: flex; align-items: center; justify-content: space-between; margin: 16px 0 12px; gap: 12px; }
.me-subtoggle { display: flex; gap: 8px; }
.me-subtoggle button {
  appearance: none; border: 1px solid var(--me-line); background: var(--me-surface); cursor: pointer;
  padding: 6px 14px; border-radius: 999px; font-size: 12.5px; font-weight: 600; color: var(--me-ink-soft);
}
.me-subtoggle button.active.mapped { background: var(--me-ok-soft); border-color: #bfe3cd; color: var(--me-ok); }
.me-subtoggle button.active.unmapped { background: var(--me-warn-soft); border-color: #f0cdae; color: var(--me-warn); }
.me-live-count { font-size: 1.1rem; font-weight: 600; color: var(--me-ink-soft); white-space: nowrap; }
.me-live-count strong {
    font-size: 1.3rem;
}
.me-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 14px 0; flex-wrap: wrap; }
.me-toolbar-right { display: flex; align-items: center; gap: 10px; }
.me-search-wrap { position: relative; flex: 1; max-width: 320px; }
.me-search-wrap input {
  width: 100%; padding: 8px 12px 8px 32px; border: 1px solid var(--me-line); border-radius: 8px;
  font-size: 13.5px; background: var(--me-surface); color: var(--me-ink);
}
.me-search-wrap input:focus { outline: none; border-color: var(--me-accent); }
.me-search-icon { position: absolute !important; left: 8px; top: 50%; transform: translateY(-50%); color: #97a2b0; }

.me-page-size select {
  border: 1px solid var(--me-line); border-radius: 8px; padding: 7px 10px; font-size: 13px;
  background: var(--me-surface); color: var(--me-ink);
}

.me-colpicker { position: relative; }
.me-colpicker-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid var(--me-line); background: var(--me-surface); cursor: pointer;
  padding: 7px 12px; border-radius: 8px; font-size: 13px; color: var(--me-ink);
}
.me-colpicker-btn:hover { background: var(--me-line-soft); }
.me-colpicker-menu {
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 20;
  background: var(--me-surface); border: 1px solid var(--me-line); border-radius: 10px;
  box-shadow: 0 8px 24px rgba(20,25,35,0.12); padding: 8px; min-width: 200px; max-height: 280px; overflow-y: auto;
}
.me-colpicker-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px;
  font-size: 13px; color: var(--me-ink); cursor: pointer; white-space: nowrap;
}
.me-colpicker-item:hover { background: var(--me-line-soft); }
.me-colpicker-item input { cursor: pointer; }

.me-download-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid var(--me-line); background: var(--me-surface); cursor: pointer;
  padding: 7px 12px; border-radius: 8px; font-size: 13px; color: var(--me-ink);
}
.me-download-btn:hover { background: var(--me-line-soft); }

.me-table-card { background: var(--me-surface); border: 1px solid var(--me-line); border-radius: var(--me-radius); overflow: hidden; }
.me-table-scroll { overflow-x: auto; }
.me-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.me-table thead th {
  text-align: left; padding: 10px 16px; background: #f8f9fb; color: var(--me-ink-soft);
  font-weight: 600; font-size: 12px; border-bottom: 1px solid var(--me-line); white-space: nowrap;
}
.me-table tbody td { padding: 10px 16px; border-bottom: 1px solid var(--me-line-soft); white-space: nowrap; }
.me-table tbody tr:last-child td { border-bottom: none; }
.me-table tbody tr:hover { background: #fafbfd; }

.me-empty-state { padding: 48px 20px; text-align: center; color: var(--me-ink-soft); font-size: 14px; }

.me-pagination { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-top: 1px solid var(--me-line-soft); font-size: 13px; color: var(--me-ink-soft); }
.me-pagination-controls { display: flex; align-items: center; gap: 6px; }
.me-pagination button {
  appearance: none; border: 1px solid var(--me-line); background: var(--me-surface); cursor: pointer;
  padding: 5px 12px; border-radius: 7px; font-size: 13px; color: var(--me-ink);
}
.me-pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
.me-pagination button:not(:disabled):hover { background: var(--me-line-soft); }

@media (max-width: 640px) {
  .me-table { font-size: 12.5px; }
  .me-table thead th, .me-table tbody td { padding: 8px 10px; }
}
`;

export default MasterSummaryList;