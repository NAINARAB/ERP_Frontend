import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { useEffect, useState, useMemo } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, Subraction, isEqualNumber, checkIsNumber, rid, LocalDate, onlynum, toArray, stringCompare, NumberFormat } from "../../../Components/functions";
import { journalBillReferenceIV } from "./variable";

const BillRefDialog = ({
    open,
    onClose,
    line,
    pendingRefData,
    journalBillReference,
    setJournalBillReference,
    JournalAutoId,
    loadingOn,
    loadingOff
}) => {

    const LineId = line?.LineId;
    const Acc_Id = line?.Acc_Id;
    const DrCr = line?.DrCr;

    const [fallbackRefDetails, setFallbackRefDetails] = useState([]);

    const pendingRefDetails = useMemo(() => {
        if (Array.isArray(pendingRefData)) {
            return pendingRefData;
        }
        if (Array.isArray(line?.pendingRefDetails)) {
            return line.pendingRefDetails;
        }
        return fallbackRefDetails;
    }, [pendingRefData, line?.pendingRefDetails, fallbackRefDetails]);

    useEffect(() => {
        if (!open || !checkIsNumber(Acc_Id)) {
            setFallbackRefDetails([]);
            return;
        }

        // If data is already provided via props or line, or line is currently fetching, skip fallback fetch
        if (Array.isArray(pendingRefData) || Array.isArray(line?.pendingRefDetails) || line?.isPendingRefLoading) {
            return;
        }

        setFallbackRefDetails([]);
        fetchLink({
            address: `journal/accountPendingReference?Acc_Id=${Acc_Id}&JournalAutoId=${JournalAutoId || ''}`,
            loadingOn,
            loadingOff
        }).then(
            (data) => setFallbackRefDetails(data?.success ? data.data : [])
        ).catch(() => setFallbackRefDetails([]));
    }, [open, Acc_Id, JournalAutoId, pendingRefData, line?.pendingRefDetails, line?.isPendingRefLoading, loadingOn, loadingOff]);

    const keyMatch = (b, row) =>
        b.LineId === LineId &&
        isEqualNumber(b.Acc_Id, Acc_Id) &&
        b.DrCr === DrCr &&
        b.RefNo === row.voucherNumber;

    const findExisting = (arr, row) => arr.find((b) => keyMatch(b, row));

    const toggleRef = (row, isChecked) => {
        setJournalBillReference((prev) => {
            if (isChecked) {
                return prev.filter((b) => !keyMatch(b, row));
            }
            return [
                ...prev.filter((b) => !keyMatch(b, row)),
                {
                    ...journalBillReferenceIV,
                    autoGenId: rid(),
                    LineId,
                    Acc_Id,
                    DrCr,
                    RefId: row?.voucherId,
                    RefNo: row?.voucherNumber,
                    RefType: row?.actualSource,
                    Amount: row?.pending || 0,
                    BillRefNo: row?.BillRefNo || ''
                }
            ];
        });
    };

    const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

    const changeAmount = (row, raw) => {
        setJournalBillReference((prev) => {
            const next = prev.map((b) => {
                if (!keyMatch(b, row)) return b;
                const n = parseFloat(raw);
                const safe = Number.isFinite(n) ? n : 0;
                // compute pending for this row
                const totalRef = Addition(row?.againstAmount, row?.journalAdjustment);
                const pending = Subraction(row?.totalValue, totalRef);
                const clamped = clamp(safe, 0, Number(pending) || 0);
                return { ...b, Amount: clamped };
            });
            return next;
        });
    };

    const { selectedCount, totalAmount } = useMemo(() => {
        let count = 0;
        let total = 0;
        const refList = toArray(journalBillReference);
        pendingRefDetails.forEach((row) => {
            const checked = refList.some(
                (b) => b.RefNo === row.voucherNumber && b.DrCr !== row?.accountSide
            );
            if (checked) {
                count += 1;
                const existing = findExisting(refList, row);
                const amt = Number(existing?.Amount) || 0;
                total = Addition(total, amt);
            }
        });
        return { selectedCount: count, totalAmount: total };
    }, [pendingRefDetails, journalBillReference, LineId, Acc_Id, DrCr]);

    return (
        <Dialog open={open} onClose={onClose} fullScreen keepMounted>
            <DialogTitle className="d-flex justify-content-between align-items-center flex-wrap gap-2 py-2 px-3 border-bottom">
                <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold fa-16">Add Bill-Reference</span>
                    {line?.AccountGet && (
                        <span className="text-secondary fa-14">({line?.AccountGet})</span>
                    )}
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <div className="badge bg-light text-dark border px-3 py-2 fa-13 fw-normal">
                        <span className="text-secondary me-1">Selected Bills:</span>
                        <span className="fw-bold text-primary">{selectedCount}</span>
                    </div>
                    <div className="badge bg-light text-dark border px-3 py-2 fa-13 fw-normal">
                        <span className="text-secondary me-1">Reference Amount:</span>
                        <span className="fw-bold text-success">{NumberFormat(totalAmount)}</span>
                    </div>
                    {checkIsNumber(line?.Amount) && Number(line?.Amount) > 0 && (
                        <div className="badge bg-light text-dark border px-3 py-2 fa-13 fw-normal">
                            <span className="text-secondary me-1">Journal Amount:</span>
                            <span className="fw-bold text-dark">{NumberFormat(line?.Amount)}</span>
                        </div>
                    )}
                    <IconButton size="small" onClick={onClose} aria-label="close">
                        <Close className="fa-18" />
                    </IconButton>
                </div>
            </DialogTitle>
            <DialogContent>
                {!line ? (
                    <div className="text-muted">Select a line…</div>
                ) : line?.isPendingRefLoading ? (
                    <div className="d-flex justify-content-center align-items-center py-5 text-secondary">
                        <div className="spinner-border spinner-border-sm me-2 text-primary" role="status"></div>
                        <span className="fa-14">Loading pending references...</span>
                    </div>
                ) : (
                    <div className="table-container table-responsive" style={{ maxHeight: "calc(100vh - 160px)", overflowY: "auto" }}>
                        <table className="table table-bordered m-0">
                            <thead className="table-light">
                                <tr>
                                    {[
                                        "Sno", "Voucher-Number", 'Voucher-Ref', "Date",
                                        "Source", "Dr/Cr", "Total", "Total Ref",
                                        "Journal", "Pay/Rec", "Pending", 'Narration', "#"
                                    ].map((c) => (
                                        <th
                                            key={c}
                                            className="fa-13"
                                            style={{
                                                position: "sticky",
                                                top: 0,
                                                backgroundColor: "#f8f9fa",
                                                zIndex: 1
                                            }}
                                        >
                                            {c}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRefDetails.map((row, i) => {
                                    const totalRef = Addition(row?.againstAmount, row?.journalAdjustment);
                                    const pending = Subraction(row?.totalValue, totalRef);
                                    const existing = findExisting(toArray(journalBillReference), row);
                                    // const checked = !!existing;
                                    const checked = journalBillReference.some(
                                        (b) => (
                                            b.RefNo === row.voucherNumber
                                            && b.DrCr !== row?.accountSide
                                        )
                                    );
                                    const amountVal = checked ? (existing?.Amount ?? 0) : "";
                                    const canSelect = !stringCompare(DrCr, row?.accountSide);

                                    return (
                                        <tr key={row.voucherNumber + "-" + i}>
                                            <td className="fa-12">{i + 1}</td>
                                            <td className="fa-12">{row?.voucherNumber}</td>
                                            <td className="fa-12">{row?.BillRefNo}</td>
                                            <td className="fa-12">{row?.eventDate ? LocalDate(row?.eventDate) : "-"}</td>
                                            <td className="fa-12">{row?.actualSource}</td>
                                            <td className="fa-12">{row?.accountSide}</td>
                                            <td className="fa-12">{row?.totalValue}</td>
                                            <td className="fa-12">{totalRef}</td>
                                            <td className="fa-12">{row?.journalAdjustment}</td>
                                            <td className="fa-12">{row?.againstAmount}</td>
                                            <td className="fa-12">{pending}</td>
                                            <td className="fa-12">{row?.narration}</td>
                                            <td className="p-0">
                                                <div className="d-flex align-items-center">
                                                    <input
                                                        className={`form-check-input shadow-none pointer mx-2 ${canSelect && ' border-primary '}`}
                                                        style={{ padding: "0.7em" }}
                                                        type="checkbox"
                                                        checked={checked}
                                                        onChange={() => toggleRef({ ...row, pending }, checked)}
                                                        disabled={!canSelect}
                                                    />
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        max={pending}
                                                        value={amountVal ? amountVal : ''}
                                                        onInput={onlynum}
                                                        onChange={(e) => changeAmount(row, e.target.value)}
                                                        className="cus-inpt p-2"
                                                        disabled={!checked || !canSelect}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {pendingRefDetails.length === 0 && (
                                    <tr>
                                        <td colSpan={13} className="text-center text-muted">
                                            No pending references.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default BillRefDialog;
