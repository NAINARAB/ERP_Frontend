import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useEffect, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, Subraction, isEqualNumber, checkIsNumber, rid, LocalDate } from "../../../Components/functions";
import { journalBillReferenceIV } from "./variable";

const BillRefDialog = ({ open, onClose, line, journalBillReference, setJournalBillReference }) => {
    const LineId = line?.LineId;
    const Acc_Id = line?.Acc_Id;
    const DrCr = line?.DrCr;

    const [pendingRefDetails, setPendingRefDetails] = useState([]);

    useEffect(() => {
        if (!open || !checkIsNumber(Acc_Id)) return;
        setPendingRefDetails([]);
        
        fetchLink({ 
            address: `journal/accountPendingReference?Acc_Id=${Acc_Id}` 
        }).then(
            (data) => setPendingRefDetails(data?.success ? data.data : [])
        ).catch(() => setPendingRefDetails([]));
    }, [open, Acc_Id]);

    const toggleRef = (row, deleteOption = false) => {
        setJournalBillReference((prev) => {
            const keep = prev.filter(
                (b) =>
                    !(
                        b.LineId === LineId &&
                        isEqualNumber(b.Acc_Id, Acc_Id) &&
                        b.DrCr === DrCr &&
                        b.RefNo === row.voucherNumber
                    )
            );
            if (deleteOption) return keep;

            return [
                ...keep,
                {
                    ...journalBillReferenceIV,
                    autoGenId: rid(),
                    LineId,
                    Acc_Id,
                    DrCr,
                    RefId: row.voucherId,
                    RefNo: row.voucherNumber,
                    RefType: row.actualSource,
                    Amount: 0,
                },
            ];
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
                                        "Sno", "Voucher-Number", "Date", 
                                        "Source", "Dr/Cr", "Total", "Pending", 
                                        "Journal", "Pay/Rec", "Total Ref", "#"
                                    ].map((c) => (
                                        <th key={c} className="fa-13">{c}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRefDetails.map((row, i) => {
                                    const totalRef = Addition(row?.againstAmount, row?.journalAdjustment);
                                    const pending = Subraction(row?.totalValue, totalRef);
                                    const checked = journalBillReference.some(
                                        (b) => b.LineId === LineId && isEqualNumber(b.Acc_Id, Acc_Id) && b.DrCr === DrCr && b.RefNo === row.voucherNumber
                                    );
                                    return (
                                        <tr key={row.voucherNumber + "-" + i}>
                                            <td className="fa-12">{i + 1}</td>
                                            <td className="fa-12">{row?.voucherNumber}</td>
                                            <td className="fa-12">{row?.eventDate ? LocalDate(row?.eventDate) : '-'}</td>
                                            <td className="fa-12">{row?.actualSource}</td>
                                            <td className="fa-12">{row?.accountSide}</td>
                                            <td className="fa-12">{row?.totalValue}</td>
                                            <td className="fa-12">{pending}</td>
                                            <td className="fa-12">{row?.journalAdjustment}</td>
                                            <td className="fa-12">{row?.againstAmount}</td>
                                            <td className="fa-12">{totalRef}</td>
                                            <td>
                                                <input
                                                    className="form-check-input shadow-none pointer mx-2"
                                                    style={{ padding: "0.7em" }}
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleRef(row, checked)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                                {pendingRefDetails.length === 0 && (
                                    <tr>
                                        <td colSpan={11} className="text-center text-muted">No pending references.</td>
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
