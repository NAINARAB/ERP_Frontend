import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Box,
    Stack,
    Paper,
    Typography,
    TextField,
    Button,
    LinearProgress,
    CircularProgress,
    Alert,
    InputAdornment,
    IconButton,
    Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import TagOutlinedIcon from "@mui/icons-material/TagOutlined";
import SpeedOutlinedIcon from "@mui/icons-material/SpeedOutlined";
import CurrencyRupeeOutlinedIcon from "@mui/icons-material/CurrencyRupeeOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { reactSelectFilterLogic } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";

/**
 * BatchTraceFlow – Multi-level vertical column layout
 * ---------------------------------------------------
 * Visualizes a batch's lineage as a horizontal timeline of vertical columns:
 *
 *   [ ...prev L2 ] ← [ prev L1 ] ← [ CURRENT ] → [ next L1 ] → [ next L2... ]
 *
 * Each level (column) displays its items stacked vertically.
 * Each card has a button to fetch the next deeper level for that specific item.
 */

/* ------------------------------ theme tokens ------------------------------ */

const T = {
    paper: "#faf7f0",
    ink: "#1f2421",
    inkSoft: "#5b635c",
    line: "#d8d0c2",
    gold: "#b08433",
    goldSoft: "#e9dcbf",
    consumed: "#b08433",
    pending: "#cfc7b8",
    currentBg: "linear-gradient(180deg, #232825 0%, #1b201d 100%)",
    currentEdge: "#b08433",
    shadow: "0 1px 2px rgba(31,36,33,.06), 0 8px 24px rgba(31,36,33,.07)",
    shadowCurrent: "0 10px 30px rgba(31,36,33,.28)",
};

/* ------------------------------ helpers ------------------------------ */

function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function fmtMoney(n) {
    if (n == null) return null;
    return `₹${Number(n).toLocaleString("en-IN")}`;
}

/* -------------------------------- Field -------------------------------- */

function Field({ icon: Icon, label, value, accent, current }) {
    if (value == null || value === "") return null;
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "18px 56px 1fr",
                alignItems: "center",
                gap: 0.75,
            }}
        >
            <Icon sx={{ fontSize: 15, color: current ? T.goldSoft : T.gold }} />
            <Typography
                component="span"
                sx={{ fontSize: 12.5, fontWeight: 600, color: current ? "#b9b2a2" : T.inkSoft }}
            >
                {label}
            </Typography>
            <Typography
                component="span"
                noWrap
                sx={{
                    fontSize: 12.5,
                    fontWeight: accent ? 800 : 600,
                    color: accent ? (current ? "#f0d490" : T.gold) : current ? "#efeade" : T.ink,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

/* -------------------------------- Tab -------------------------------- */

function CardTab({ kind, level }) {
    const isCurrent = kind === "current";
    let content;
    if (isCurrent) {
        content = (
            <>
                <LayersOutlinedIcon sx={{ fontSize: 13 }} />
                <span>CURRENT BATCH</span>
            </>
        );
    } else if (kind === "prev") {
        content = (
            <>
                <ChevronLeftIcon sx={{ fontSize: 14 }} />
                <span>SOURCE L{level}</span>
            </>
        );
    } else {
        content = (
            <>
                <span>CONVERTED L{level}</span>
                <ChevronRightIcon sx={{ fontSize: 14 }} />
            </>
        );
    }

    return (
        <Box
            sx={{
                position: "absolute",
                top: -11,
                left: 14,
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: ".08em",
                px: 1.1,
                py: 0.5,
                borderRadius: 999,
                bgcolor: isCurrent ? T.gold : T.goldSoft,
                color: isCurrent ? "#2b2412" : "#6b4f14",
                border: `1px solid ${isCurrent ? "#d8b25e" : T.gold}`,
            }}
        >
            {content}
        </Box>
    );
}

/* -------------------------------- Stage Card -------------------------------- */

function StageCard({ id, item, kind, level, onFetchDeeper, loadingDeeper }) {
    const isCurrent = kind === "current";

    const pctConsumed = isCurrent && item.quantity
        ? Math.min(100, ((item.consumedQuantity || 0) / item.quantity) * 100)
        : 0;

    return (
        <Paper
            id={id}
            elevation={0}
            sx={{
                position: "relative",
                width: 260,
                flex: "0 0 auto",
                px: 2,
                pt: 3.25,
                pb: 2,
                borderRadius: 3.5,
                border: `1px solid ${isCurrent ? T.currentEdge : T.line}`,
                background: isCurrent ? T.currentBg : kind === "prev" ? "#fffdf8" : "#fff",
                color: isCurrent ? "#f4efe3" : T.ink,
                boxShadow: isCurrent ? T.shadowCurrent : T.shadow,
                transition: "transform .14s, box-shadow .14s",
                "&:hover": { transform: "translateY(-2px)" },
            }}
        >
            <CardTab kind={kind} level={level} />

            <Typography
                sx={{
                    fontSize: 15,
                    fontWeight: 800,
                    letterSpacing: "-0.01em",
                    lineHeight: 1.25,
                    color: isCurrent ? "#fff" : T.ink,
                }}
            >
                {isCurrent ? item.item_Name : item.itemName}
            </Typography>

            {isCurrent && (
                <Typography
                    sx={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        letterSpacing: ".04em",
                        color: T.goldSoft,
                        mt: 0.25,
                        textTransform: "uppercase",
                    }}
                >
                    {item.batch}
                </Typography>
            )}

            {!isCurrent && item.batchName && (
                <Typography
                    sx={{
                        fontSize: 11.5,
                        fontWeight: 700,
                        letterSpacing: ".04em",
                        color: T.gold,
                        mt: 0.25,
                        textTransform: "uppercase",
                    }}
                >
                    {item.batchName}
                </Typography>
            )}

            <Stack spacing={0.875} sx={{ mt: 1.5 }}>
                <Field
                    icon={TagOutlinedIcon}
                    label="Voucher"
                    value={isCurrent ? null : item.voucherNumber}
                    current={isCurrent}
                />
                <Field
                    icon={CalendarTodayOutlinedIcon}
                    label="Date"
                    value={fmtDate(isCurrent ? item.created_at : item.entryDate)}
                    current={isCurrent}
                />
                <Field
                    icon={SpeedOutlinedIcon}
                    label="Qty"
                    value={item.quantity}
                    accent
                    current={isCurrent}
                />
                <Field
                    icon={CurrencyRupeeOutlinedIcon}
                    label="Rate"
                    value={fmtMoney(isCurrent ? item.rate : null)}
                    current={isCurrent}
                />
                <Field
                    icon={WarehouseOutlinedIcon}
                    label="Godown"
                    value={isCurrent ? item.godown_name : item.godownName}
                    current={isCurrent}
                />
                <Field
                    icon={PersonOutlineOutlinedIcon}
                    label="By"
                    value={isCurrent ? item.creater_name : null}
                    current={isCurrent}
                />
            </Stack>

            {/* Consumed / Pending bar for current batch */}
            {isCurrent && (item.consumedQuantity != null || item.pendingQuantity != null) && (
                <Box sx={{ mt: 1.75, pt: 1.5, borderTop: "1px solid rgba(255,255,255,.12)" }}>
                    <LinearProgress
                        variant="determinate"
                        value={pctConsumed}
                        sx={{
                            height: 8,
                            borderRadius: 999,
                            bgcolor: T.pending,
                            "& .MuiLinearProgress-bar": { bgcolor: T.consumed, borderRadius: 999 },
                        }}
                    />
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{ mt: 1, fontSize: 11, color: "#cbc4b4" }}
                    >
                        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.625 }}>
                            <Box component="i" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: T.consumed }} />
                            Consumed {item.consumedQuantity}
                        </Box>
                        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.625 }}>
                            <Box component="i" sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: T.pending }} />
                            Pending {item.pendingQuantity}
                        </Box>
                    </Stack>
                </Box>
            )}

            {/* Fetch deeper button */}
            {!isCurrent && onFetchDeeper && (
                <Box sx={{ mt: 1.5, display: "flex", justifyContent: kind === "prev" ? "flex-start" : "flex-end" }}>
                    <Tooltip title={kind === "prev" ? "Fetch previous batch" : "Fetch next batch"}>
                        <span>
                            <Button
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onFetchDeeper(item);
                                }}
                                disabled={loadingDeeper}
                                startIcon={
                                    loadingDeeper
                                        ? <CircularProgress size={14} color="inherit" />
                                        : kind === "prev"
                                            ? <ArrowBackIcon sx={{ fontSize: 14 }} />
                                            : <ArrowForwardIcon sx={{ fontSize: 14 }} />
                                }
                                sx={{
                                    textTransform: "none",
                                    fontSize: 11,
                                    fontWeight: 700,
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 2,
                                    color: T.gold,
                                    border: `1px solid ${T.goldSoft}`,
                                    bgcolor: "rgba(176,132,51,.06)",
                                    "&:hover": {
                                        bgcolor: "rgba(176,132,51,.12)",
                                        borderColor: T.gold,
                                    },
                                }}
                            >
                                {loadingDeeper ? "Loading…" : kind === "prev" ? "Previous" : "Next"}
                            </Button>
                        </span>
                    </Tooltip>
                </Box>
            )}
        </Paper>
    );
}

/* ------------------------------ Column Connector ------------------------------ */

function ColumnConnector() {
    return (
        <Box
            aria-hidden
            sx={{
                flex: "0 0 60px",
            }}
        />
    );
}

/* ------------------------------ Level Column ------------------------------ */

function LevelColumn({ items, kind, level, onFetchDeeper, loadingItemKey }) {
    return (
        <Stack
            spacing={2.5}
            sx={{
                flex: "0 0 auto",
                pt: 1.5,
            }}
        >
            {/* Level header */}
            <Typography
                sx={{
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: T.inkSoft,
                    textAlign: "center",
                    px: 1,
                }}
            >
                {kind === "prev" ? `← Source Level ${level}` : `Converted Level ${level} →`}
            </Typography>
            {items.map((item, idx) => {
                const uniqueKey = `${kind}-L${level}-${item.itemId || item.item_id}-${item.godownId || item.godown_id}-${idx}`;
                return (
                    <StageCard
                        key={uniqueKey}
                        id={`card-${kind}-${item.selfKey}`}
                        item={item}
                        kind={kind}
                        level={level}
                        onFetchDeeper={onFetchDeeper}
                        loadingDeeper={loadingItemKey === uniqueKey}
                    />
                );
            })}
        </Stack>
    );
}

/* ------------------------------ Svg Connector Canvas ------------------------------ */

function SvgConnectorCanvas({ containerRef, prevLevels, nextLevels, currentBatch }) {
    const [lines, setLines] = useState([]);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    const updateLines = () => {
        if (!containerRef.current) return;

        const container = containerRef.current;
        
        // Update SVG canvas size to cover the entire scrollable area
        setDimensions({
            width: container.scrollWidth,
            height: container.scrollHeight,
        });

        const newLines = [];

        // Helper to get coordinates of a card relative to the container scroll content
        const getCardPorts = (cardId) => {
            const cardEl = document.getElementById(cardId);
            if (!cardEl) return null;

            const offsetLeft = cardEl.offsetLeft;
            const offsetTop = cardEl.offsetTop;
            const width = cardEl.offsetWidth;
            const height = cardEl.offsetHeight;

            return {
                left: { x: offsetLeft, y: offsetTop + height / 2 },
                right: { x: offsetLeft + width, y: offsetTop + height / 2 },
            };
        };

        const currentPorts = getCardPorts("card-current");

        if (currentPorts) {
            // 1. Lines from prevLevels[0] to current
            if (prevLevels.length > 0) {
                prevLevels[0].forEach(item => {
                    const childId = `card-prev-${item.selfKey}`;
                    const childPorts = getCardPorts(childId);
                    if (childPorts) {
                        newLines.push({
                            x1: childPorts.right.x,
                            y1: childPorts.right.y,
                            x2: currentPorts.left.x,
                            y2: currentPorts.left.y,
                        });
                    }
                });
            }

            // 2. Lines from nextLevels[0] to current
            if (nextLevels.length > 0) {
                nextLevels[0].forEach(item => {
                    const childId = `card-next-${item.selfKey}`;
                    const childPorts = getCardPorts(childId);
                    if (childPorts) {
                        newLines.push({
                            x1: currentPorts.right.x,
                            y1: currentPorts.right.y,
                            x2: childPorts.left.x,
                            y2: childPorts.left.y,
                        });
                    }
                });
            }
        }

        // 3. Lines for deeper prevLevels
        for (let l = 1; l < prevLevels.length; l++) {
            prevLevels[l].forEach(item => {
                const childId = `card-prev-${item.selfKey}`;
                const parentId = `card-prev-${item.parentKey}`;
                const childPorts = getCardPorts(childId);
                const parentPorts = getCardPorts(parentId);
                if (childPorts && parentPorts) {
                    newLines.push({
                        x1: childPorts.right.x,
                        y1: childPorts.right.y,
                        x2: parentPorts.left.x,
                        y2: parentPorts.left.y,
                    });
                }
            });
        }

        // 4. Lines for deeper nextLevels
        for (let l = 1; l < nextLevels.length; l++) {
            nextLevels[l].forEach(item => {
                const childId = `card-next-${item.selfKey}`;
                const parentId = `card-next-${item.parentKey}`;
                const childPorts = getCardPorts(childId);
                const parentPorts = getCardPorts(parentId);
                if (childPorts && parentPorts) {
                    newLines.push({
                        x1: parentPorts.right.x,
                        y1: parentPorts.right.y,
                        x2: childPorts.left.x,
                        y2: childPorts.left.y,
                    });
                }
            });
        }

        setLines(newLines);
    };

    useEffect(() => {
        updateLines();
        const timer = setTimeout(updateLines, 200);
        window.addEventListener('resize', updateLines);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateLines);
        };
    }, [prevLevels, nextLevels, currentBatch]);

    return (
        <svg
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: dimensions.width,
                height: dimensions.height,
                pointerEvents: "none",
                zIndex: 0,
            }}
        >
            {lines.map((line, idx) => {
                const { x1, y1, x2, y2 } = line;
                const cp1x = x1 + (x2 - x1) / 2;
                const cp1y = y1;
                const cp2x = x1 + (x2 - x1) / 2;
                const cp2y = y2;
                const pathData = `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;

                return (
                    <g key={idx}>
                        <path
                            d={pathData}
                            fill="none"
                            stroke="#fff"
                            strokeWidth={4}
                            opacity={0.15}
                        />
                        <path
                            d={pathData}
                            fill="none"
                            stroke={T.gold}
                            strokeWidth={1.5}
                            strokeDasharray="4 3"
                            opacity={0.8}
                        />
                        <circle cx={x1} cy={y1} r={3} fill={T.gold} />
                        <circle cx={x2} cy={y2} r={3} fill={T.gold} />
                    </g>
                );
            })}
        </svg>
    );
}

/* ------------------------------ Search ------------------------------ */

function SearchPanel({ onSearch, loading, initialForm }) {
    const [form, setForm] = useState(initialForm || { batch: "", item: null, godown: null });
    const canSearch = form.batch && form.item;

    const [products, setProducts] = useState([]);
    const [godowns, setGodowns] = useState([]);

    useEffect(() => {
        fetchLink({ address: `masters/products` }).then(res => res && res.success && setProducts(res.data));
        fetchLink({ address: `dataEntry/godownLocationMaster` }).then(res => res && res.success && setGodowns(res.data));
    }, []);

    return (
        <Paper
            elevation={0}
            className="d-flex flex-wrap align-items-end gap-3 p-3"
            sx={{ border: `1px solid ${T.line}`, borderRadius: 3.5, boxShadow: T.shadow, bgcolor: "#fff" }}
        >
            <Box
                sx={{
                    display: "grid",
                    gap: 1.5,
                    flex: "1 1 460px",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(140px, 1fr))" },
                }}
            >
                <input
                    value={form.batch}
                    onChange={(e) => setForm({ ...form, batch: e.target.value })}
                    className="cus-inpt"
                    placeholder="Batch"
                />

                <Select
                    value={form.item}
                    onChange={(e) => setForm({ ...form, item: e })}
                    options={products.map(p => ({ value: p.Product_Id, label: p.Product_Name }))}
                    styles={customSelectStyles}
                    isSearchable={true}
                    placeholder="Select Item"
                    filterOption={reactSelectFilterLogic}
                />

                <Select
                    value={form.godown}
                    onChange={(e) => setForm({ ...form, godown: e })}
                    options={godowns.sort(
                        (a, b) => a.Godown_Name.localeCompare(b.Godown_Name)
                    ).map(g => ({ value: g.Godown_Id, label: g.Godown_Name }))}
                    styles={customSelectStyles}
                    isSearchable={true}
                    placeholder="Select Godown"
                    filterOption={reactSelectFilterLogic}
                />
            </Box>
            <Button
                onClick={() => onSearch({ batch_name: form.batch, item_id: form.item.value, godown_id: form.godown?.value })}
                disabled={!canSearch || loading}
                variant="contained"
                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
                sx={{
                    textTransform: "none",
                    fontWeight: 700,
                    px: 2.25,
                    py: 1.25,
                    borderRadius: 2.5,
                    bgcolor: T.ink,
                    border: `1px solid ${T.currentEdge}`,
                    boxShadow: "0 6px 16px rgba(31,36,33,.18)",
                    "&:hover": { bgcolor: "#2b312d" },
                    "&.Mui-disabled": { opacity: 0.45, color: "#fff", bgcolor: T.ink },
                }}
            >
                {loading ? "Searching…" : "Trace batch"}
            </Button>
        </Paper>
    );
}

/* ------------------------------ Empty state ------------------------------ */

function EmptyState({ icon: Icon, children }) {
    return (
        <Stack
            alignItems="center"
            spacing={1.5}
            sx={{
                mt: 4.5,
                px: 2.5,
                py: 6,
                textAlign: "center",
                color: T.inkSoft,
                border: `1.5px dashed ${T.line}`,
                borderRadius: 3.5,
            }}
        >
            {Icon && <Icon sx={{ fontSize: 28 }} />}
            <Typography sx={{ fontSize: 14.5 }}>{children}</Typography>
        </Stack>
    );
}

/* ------------------------------ Main ------------------------------ */

export default function BatchTraceFlow() {
    const location = useLocation();
    const navigate = useNavigate();
    const initialFormRef = useRef(location.state);
    const containerRef = useRef(null);

    // currentBatch holds the raw API response data[0] for the searched batch
    const [currentBatch, setCurrentBatch] = useState(null);

    // prevLevels: array of arrays, each inner array is a level of previous stage items
    // prevLevels[0] = level 1 (closest to current), prevLevels[1] = level 2, etc.
    const [prevLevels, setPrevLevels] = useState([]);

    // nextLevels: same structure for next stages
    const [nextLevels, setNextLevels] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingItemKey, setLoadingItemKey] = useState(null);
    const [error, setError] = useState(null);
    const [searched, setSearched] = useState(false);

    useEffect(() => {
        if (initialFormRef.current && initialFormRef.current.batch && initialFormRef.current.item) {
            const { batch, item, godown } = initialFormRef.current;
            handleSearch({
                batch_name: batch,
                item_id: item.value,
                godown_id: godown?.value || ""
            });
            navigate(location.pathname, { replace: true, state: null });
        }
    }, []);

    /* --- Initial search --- */
    async function handleSearch(form) {
        setLoading(true);
        setError(null);
        setSearched(true);
        setPrevLevels([]);
        setNextLevels([]);
        setCurrentBatch(null);

        try {
            const resp = await fetchLink({
                address: `inventory/batchMaster/previousAndNextStages?item_id=${form.item_id}&batch_name=${encodeURIComponent(form.batch_name)}&godown_id=${form.godown_id}`,
            });

            const node = resp?.data?.[0] ?? null;
            if (!node) {
                setError("No batch found for that combination.");
                return;
            }

            setCurrentBatch(node);

            // Set Level 1 prev/next from the initial response
            if (node.prevStg && node.prevStg.length > 0) {
                const mappedPrev = node.prevStg.map(it => {
                    const itemId = it.itemId || it.item_id;
                    const godownId = it.godownId || it.godown_id;
                    const voucher = it.voucherNumber || it.batch || it.batchName || '';
                    return {
                        ...it,
                        parentKey: "current",
                        selfKey: `${itemId}_${godownId}_${voucher}`
                    };
                });
                setPrevLevels([mappedPrev]);
            }
            if (node.nextStg && node.nextStg.length > 0) {
                const mappedNext = node.nextStg.map(it => {
                    const itemId = it.itemId || it.item_id;
                    const godownId = it.godownId || it.godown_id;
                    const voucher = it.voucherNumber || it.batch || it.batchName || '';
                    return {
                        ...it,
                        parentKey: "current",
                        selfKey: `${itemId}_${godownId}_${voucher}`
                    };
                });
                setNextLevels([mappedNext]);
            }
        } catch (e) {
            setError("Something went wrong while fetching. Try again.");
        } finally {
            setLoading(false);
        }
    }

    /* --- Fetch deeper previous level for a specific item --- */
    const fetchPrevDeeper = useCallback(async (stageItem, currentLevelIndex) => {
        const item_id = stageItem.itemId || stageItem.item_id;
        const godown_id = stageItem.godownId || stageItem.godown_id;
        const batch_name = stageItem.batch || stageItem.batchName || "";
        const parentKey = stageItem.selfKey;

        if (!item_id || !batch_name) return;

        const keyForLoading = `prev-L${currentLevelIndex + 1}-${item_id}-${godown_id}-0`;
        setLoadingItemKey(keyForLoading);
        setError(null);

        try {
            const resp = await fetchLink({
                address: `inventory/batchMaster/batchPreviousStage?item_id=${item_id}&batch_name=${encodeURIComponent(batch_name)}&godown_id=${godown_id}`,
            });

            const newItems = (resp?.data ?? []).map(it => {
                const itemId = it.itemId || it.item_id;
                const godownId = it.godownId || it.godown_id;
                const voucher = it.voucherNumber || it.batch || it.batchName || '';
                return {
                    ...it,
                    parentKey: parentKey,
                    selfKey: `${itemId}_${godownId}_${voucher}`
                };
            });
            if (newItems.length === 0) return;

            setPrevLevels(prev => {
                const newLevels = [...prev];
                const targetLevel = currentLevelIndex + 1; // next deeper level
                if (targetLevel < newLevels.length) {
                    // Merge items into existing level, avoiding duplicates
                    const existingKeys = new Set(newLevels[targetLevel].map(it => it.selfKey));
                    const uniqueNew = newItems.filter(it => !existingKeys.has(it.selfKey));
                    newLevels[targetLevel] = [...newLevels[targetLevel], ...uniqueNew];
                } else {
                    // Add new level
                    newLevels.push(newItems);
                }
                return newLevels;
            });
        } catch (e) {
            setError("Couldn't load previous batch details. Try again.");
        } finally {
            setLoadingItemKey(null);
        }
    }, []);

    /* --- Fetch deeper next level for a specific item --- */
    const fetchNextDeeper = useCallback(async (stageItem, currentLevelIndex) => {
        const item_id = stageItem.itemId || stageItem.item_id;
        const godown_id = stageItem.godownId || stageItem.godown_id;
        const batch_name = stageItem.batch || stageItem.batchName || "";
        const parentKey = stageItem.selfKey;

        if (!item_id || !batch_name) return;

        const keyForLoading = `next-L${currentLevelIndex + 1}-${item_id}-${godown_id}-0`;
        setLoadingItemKey(keyForLoading);
        setError(null);

        try {
            const resp = await fetchLink({
                address: `inventory/batchMaster/batchNextStage?item_id=${item_id}&batch_name=${encodeURIComponent(batch_name)}&godown_id=${godown_id}`,
            });

            const newItems = (resp?.data ?? []).map(it => {
                const itemId = it.itemId || it.item_id;
                const godownId = it.godownId || it.godown_id;
                const voucher = it.voucherNumber || it.batch || it.batchName || '';
                return {
                    ...it,
                    parentKey: parentKey,
                    selfKey: `${itemId}_${godownId}_${voucher}`
                };
            });
            if (newItems.length === 0) return;

            setNextLevels(prev => {
                const newLevels = [...prev];
                const targetLevel = currentLevelIndex + 1;
                if (targetLevel < newLevels.length) {
                    const existingKeys = new Set(newLevels[targetLevel].map(it => it.selfKey));
                    const uniqueNew = newItems.filter(it => !existingKeys.has(it.selfKey));
                    newLevels[targetLevel] = [...newLevels[targetLevel], ...uniqueNew];
                } else {
                    newLevels.push(newItems);
                }
                return newLevels;
            });
        } catch (e) {
            setError("Couldn't load next batch details. Try again.");
        } finally {
            setLoadingItemKey(null);
        }
    }, []);

    return (
        <Box>

            <SearchPanel onSearch={handleSearch} loading={loading} initialForm={initialFormRef.current} />

            {error && (
                <Alert severity="error" sx={{ mt: 1.75, borderRadius: 2.5 }}>
                    {error}
                </Alert>
            )}

            {searched && !currentBatch && !loading && !error && (
                <EmptyState>No results. Adjust your search and try again.</EmptyState>
            )}

            {loading && <EmptyState>Tracing batch…</EmptyState>}

            {currentBatch && (
                <Box
                    ref={containerRef}
                    sx={{
                        position: "relative",
                        mt: 3.25,
                        display: "flex",
                        alignItems: "center",
                        overflowX: "auto",
                        pb: 3,
                        pt: 1,
                        scrollBehavior: "smooth",
                    }}
                >
                    {/* Svg Connector Canvas */}
                    <SvgConnectorCanvas
                        containerRef={containerRef}
                        prevLevels={prevLevels}
                        nextLevels={nextLevels}
                        currentBatch={currentBatch}
                    />

                    {/* Previous levels — rendered in reverse order (deepest first, closest to current last) */}
                    {[...prevLevels].reverse().map((levelItems, reverseIdx) => {
                        const actualLevel = prevLevels.length - reverseIdx; // e.g., L3, L2, L1
                        const levelIndex = actualLevel - 1; // 0-based index into prevLevels
                        return (
                            <React.Fragment key={`prev-level-${actualLevel}`}>
                                <LevelColumn
                                    items={levelItems}
                                    kind="prev"
                                    level={actualLevel}
                                    loadingItemKey={loadingItemKey}
                                    onFetchDeeper={(item) => fetchPrevDeeper(item, levelIndex)}
                                />
                                <ColumnConnector />
                            </React.Fragment>
                        );
                    })}

                    {/* Current batch */}
                    <Stack
                        spacing={2.5}
                        sx={{ flex: "0 0 auto", pt: 1.5 }}
                    >
                        <Typography
                            sx={{
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: ".08em",
                                textTransform: "uppercase",
                                color: T.inkSoft,
                                textAlign: "center",
                                px: 1,
                            }}
                        >
                            Current Batch
                        </Typography>
                        <StageCard
                            id="card-current"
                            item={currentBatch}
                            kind="current"
                            level={0}
                        />
                    </Stack>

                    {/* Next levels */}
                    {nextLevels.map((levelItems, levelIndex) => {
                        const actualLevel = levelIndex + 1;
                        return (
                            <React.Fragment key={`next-level-${actualLevel}`}>
                                <ColumnConnector />
                                <LevelColumn
                                    items={levelItems}
                                    kind="next"
                                    level={actualLevel}
                                    loadingItemKey={loadingItemKey}
                                    onFetchDeeper={(item) => fetchNextDeeper(item, levelIndex)}
                                />
                            </React.Fragment>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
}
