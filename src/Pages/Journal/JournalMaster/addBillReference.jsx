import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, Subraction, isEqualNumber, checkIsNumber, rid, LocalDate, onlynum, toArray, stringCompare } from "../../../Components/functions";
import { journalBillReferenceIV } from "./variable";

const BillRefDialog = ({
    open,
    onClose,
    line,
    journalBillReference,
    setJournalBillReference,
    JournalAutoId
}) => {

    const LineId = line?.LineId;
    const Acc_Id = line?.Acc_Id;
    const DrCr = line?.DrCr;

    const [pendingRefDetails, setPendingRefDetails] = useState([]);

    useEffect(() => {
        if (!open || !checkIsNumber(Acc_Id)) return;
        setPendingRefDetails([]);
        fetchLink({ address: `journal/accountPendingReference?Acc_Id=${Acc_Id}&JournalAutoId=${JournalAutoId}` })
            .then((data) => setPendingRefDetails(data?.success ? data.data : []))
            .catch(() => setPendingRefDetails([]));
    }, [open, Acc_Id, JournalAutoId]);

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

    return (
        <Dialog open={open} onClose={onClose} fullScreen keepMounted>
            <DialogTitle>Add Bill-Reference</DialogTitle>
            <DialogContent>
                {!line ? (
                    <div className="text-muted">Select a line…</div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-bordered m-0">
                            <thead>
                                <tr>
                                    {[
                                        "Sno", "Voucher-Number", 'Voucher-Ref', "Date",
                                        "Source", "Dr/Cr", "Total", "Total Ref",
                                        "Journal", "Pay/Rec", "Pending", "#"
                                    ].map((c) => (
                                        <th key={c} className="fa-13">{c}</th>
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
                                        <td colSpan={12} className="text-center text-muted">
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
