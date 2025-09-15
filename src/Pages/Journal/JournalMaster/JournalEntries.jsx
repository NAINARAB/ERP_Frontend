import { useMemo, useCallback } from "react";
import { Button } from "@mui/material";
import { rid, isEqualNumber } from "../../../Components/functions";
import { journalEntriesInfoIV } from "./variable";
import LineCard from "./lineCard";

const JournalEntriesPanel = ({
    accountsList = [],
    journalEntriesInfo = [],
    setJournalEntriesInfo,
    journalBillReference = [],
    setJournalBillReference,
    onOpenRef,
    totals = { sumOfDebit: 0, sumOfCredit: 0, diff: 0 },
}) => {

    const accountOptions = useMemo(
        () => accountsList.map(a => ({ value: Number(a.Acc_Id), label: a.Account_name })),
        [accountsList]
    );

    const debitLines = useMemo(
        () =>
            journalEntriesInfo
                .filter((e) => e.DrCr === "Dr")
                .map((line) => {

                    return {
                        ...line,
                        Entries: journalBillReference.filter(
                            (bill) => bill.LineId === line.LineId && isEqualNumber(bill.Acc_Id, line.Acc_Id) && bill.DrCr === "Dr"
                        ),
                    }
                }),
        [journalEntriesInfo, journalBillReference]
    );

    const creditLines = useMemo(
        () =>
            journalEntriesInfo
                .filter((e) => e.DrCr === "Cr")
                .map((line) => ({
                    ...line,
                    Entries: journalBillReference.filter(
                        (bill) => bill.LineId === line.LineId && isEqualNumber(bill.Acc_Id, line.Acc_Id) && bill.DrCr === "Cr"
                    ),
                })),
        [journalEntriesInfo, journalBillReference]
    );

    const usedDr = useMemo(
        () => new Set(debitLines.filter((r) => r.Acc_Id != null).map((r) => Number(r.Acc_Id))),
        [debitLines]
    );

    const usedCr = useMemo(
        () => new Set(creditLines.filter((r) => r.Acc_Id != null).map((r) => Number(r.Acc_Id))),
        [creditLines]
    );

    const isOptionDisabledDr = useCallback(
        (opt, entry) => usedDr.has(opt.value) && Number(entry.Acc_Id) !== opt.value,
        [usedDr]
    );

    const isOptionDisabledCr = useCallback(
        (opt, entry) => usedCr.has(opt.value) && Number(entry.Acc_Id) !== opt.value,
        [usedCr]
    );

    const updateLine = useCallback(
        (LineId, patch) => setJournalEntriesInfo(prev => prev.map(r => (r.LineId === LineId ? { ...r, ...patch } : r))),
        [setJournalEntriesInfo]
    );

    const addLine = useCallback(
        (side) =>
            setJournalEntriesInfo(prev => [
                ...prev,
                { ...journalEntriesInfoIV, LineId: rid(), DrCr: side, Amount: 0, Acc_Id: null, AccountGet: "" },
            ]),
        [setJournalEntriesInfo]
    );

    const removeLine = useCallback(
        (LineId) => setJournalEntriesInfo(prev => prev.filter(r => r.LineId !== LineId)),
        [setJournalEntriesInfo]
    );

    const { sumOfDebit, sumOfCredit, diff } = totals;

    return (
        <>
            <div className="p-3 d-flex align-items-center">
                <h5 className="flex-grow-1 m-0">Entries</h5>
            </div>

            <div className="row p-0 m-0">
                {/* Debit */}
                <div className="col-md-6 p-2">
                    <h6 className="mb-2 text-center">Debit</h6>
                    {debitLines.map((entry) => (
                        <LineCard
                            key={entry.LineId}
                            entry={entry}
                            accountOptions={accountOptions}
                            isOptionDisabled={(opt) => isOptionDisabledDr(opt, entry)}
                            updateLine={updateLine}
                            removeLine={removeLine}
                            openRef={onOpenRef}
                            journalBillReference={journalBillReference}
                            setJournalBillReference={setJournalBillReference}
                        />
                    ))}
                    <div className="text-end">
                        <Button variant="outlined" onClick={() => addLine("Dr")}>Add Debit</Button>
                    </div>
                </div>

                {/* Credit */}
                <div className="col-md-6 p-2">
                    <h6 className="mb-2 text-center">Credit</h6>
                    {creditLines.map((entry) => (
                        <LineCard
                            key={entry.LineId}
                            entry={entry}
                            accountOptions={accountOptions}
                            isOptionDisabled={(opt) => isOptionDisabledCr(opt, entry)}
                            updateLine={updateLine}
                            removeLine={removeLine}
                            openRef={onOpenRef}
                            journalBillReference={journalBillReference}
                            setJournalBillReference={setJournalBillReference}
                        />
                    ))}
                    <div className="text-end">
                        <Button variant="outlined" onClick={() => addLine("Cr")}>Add Credit</Button>
                    </div>
                </div>
            </div>

            {/* Totals */}
            <div className="row g-4 w-100 p-2 m-0">
                <div className="col-3 d-flex align-items-center justify-content-between rounded-3 border px-3 py-2">
                    <span className="small text-secondary">Dr Total</span>
                    <span className="fw-semibold">{sumOfDebit.toLocaleString()}</span>
                </div>
                <div className="col-3 d-flex align-items-center justify-content-between rounded-3 border px-3 py-2">
                    <span className="small text-secondary">Cr Total</span>
                    <span className="fw-semibold">{sumOfCredit.toLocaleString()}</span>
                </div>
                <div className={`col-3 d-flex align-items-center justify-content-between rounded-3 border px-3 py-2 ${diff === 0 ? "" : "border-warning"}`}>
                    <span className="small text-secondary">Difference</span>
                    <span className={`fw-semibold ${diff === 0 ? "text-dark" : "text-warning"}`}>{diff.toLocaleString()}</span>
                </div>
            </div>
        </>
    );
};

export default JournalEntriesPanel;
