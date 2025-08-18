import { Button, Card, CardContent, IconButton, Tooltip } from "@mui/material";
import Select from "react-select";
import { useMemo, useCallback, useEffect, useState } from "react";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { journalEntriesInfoIV } from "./variable";
import { Addition, isEqualNumber, NumberFormat, toArray, toNumber, rid, checkIsNumber } from "../../../Components/functions";
import { Delete, PlaylistAdd } from "@mui/icons-material";
import JournalBillReference from "./journalBillReference";
import AddJournalBillReference from "./addBillReference";

const toNum = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
const money = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
};

const JournalEntriesInfo = ({
    journalEntriesInfo = [],
    setJournalEntriesInfo,
    journalBillReference = [],
    setJournalBillReference,
    accountsList = [],
}) => {

    useEffect(() => {
        if (!journalEntriesInfo.some((r) => !r.LineId)) return;
        setJournalEntriesInfo((prev) => prev.map((r) => (r.LineId ? r : { ...r, LineId: rid() })));
    }, [journalEntriesInfo]);

    const accountOptions = useMemo(
        () =>
            accountsList.map((a) => ({
                value: Number(a.Acc_Id),
                label: a.Account_name,
            })),
        [accountsList]
    );

    const debitLines = useMemo(
        () => journalEntriesInfo.filter((e) => e.DrCr === "Dr").map(debit => ({
            ...debit,
            Entries: journalBillReference.filter(bill => (
                bill.LineId === debit.LineId,
                isEqualNumber(bill.Acc_Id, debit.Acc_Id),
                bill.DrCr === 'Dr'
            ))
        })),
        [journalEntriesInfo]
    );

    const creditLines = useMemo(
        () => journalEntriesInfo.filter((e) => e.DrCr === "Cr").map(credit => ({
            ...credit,
            Entries: journalBillReference.filter(bill => (
                bill.LineId === credit.LineId,
                isEqualNumber(bill.Acc_Id, credit.Acc_Id),
                bill.DrCr === 'Cr'
            ))
        })),
        [journalEntriesInfo]
    );

    const usedDr = useMemo(
        () => new Set(debitLines.filter((r) => r.Acc_Id != null).map((r) => Number(r.Acc_Id))),
        [debitLines]
    );
    
    const usedCr = useMemo(
        () => new Set(creditLines.filter((r) => r.Acc_Id != null).map((r) => Number(r.Acc_Id))),
        [creditLines]
    );

    const updateById = useCallback(
        (rowId, patch) => {
            setJournalEntriesInfo((prev) => prev.map((r) => (r.LineId === rowId ? { ...r, ...patch } : r)));
        },
        [setJournalEntriesInfo]
    );

    const addLine = useCallback(
        (side) => {
            setJournalEntriesInfo((prev) => [
                ...prev,
                { ...journalEntriesInfoIV, LineId: rid(), DrCr: side, Amount: 0, Acc_Id: null, AccountGet: "" },
            ]);
        },
        [setJournalEntriesInfo]
    );

    const removeLine = useCallback(
        (rowId) => {
            setJournalEntriesInfo((prev) => prev.filter((r) => r.LineId !== rowId));
        },
        [setJournalEntriesInfo]
    );

    const sumOfDebit = useMemo(() => {
        return debitLines.reduce((acc, entry) => Addition(acc, money(entry.Amount)), 0)
    }, [debitLines]);

    const sumOfCredit = useMemo(() => {
        return creditLines.reduce((acc, entry) => Addition(acc, money(entry.Amount)), 0)
    }, [creditLines]);

    const diff = useMemo(() => {
        return sumOfDebit - sumOfCredit;
    }, [sumOfDebit, sumOfCredit]);

    const CardComponent = ({
        entry,
        usedDrCr,
        DrCr,
    }) => {
        const selected =
            entry?.Acc_Id != null
                ? accountOptions.find((o) => isEqualNumber(o.value, entry.Acc_Id)) || null
                : null;

        const [addRefDialog, setAddRefDialog] = useState(false);

        return (
            <div className="border rounded-3 p-3 mb-2">
                <div className="row p-0 m-0">

                    <div className="col-sm-8 p-0 m-0">
                        <label>Account</label>
                        <Select
                            placeholder="Select account"
                            value={selected}
                            options={accountOptions}
                            isOptionDisabled={(opt) =>
                                usedDrCr.has(opt.value) && Number(entry.Acc_Id) !== opt.value
                            }
                            onChange={(opt) =>
                                updateById(entry.LineId, {
                                    Acc_Id: !opt ? null : toNum(opt.value),
                                    AccountGet: !opt ? "" : opt.label,
                                })
                            }
                            isClearable
                            isSearchable
                            menuPortalTarget={document.body}
                            styles={{
                                ...customSelectStyles,
                                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            }}
                        />
                    </div>

                    <div className="col-sm-4 p-0 ps-2 m-0">
                        <label>Amount</label>
                        <input
                            type="number"
                            value={entry?.Amount || ""}
                            className="cus-inpt p-2"
                            onChange={(e) => updateById(entry.LineId, { Amount: money(e.target.value) })}
                        />
                    </div>

                    <div className="col-8 p-0 m-0 mt-2">
                        <label style={{ minWidth: '100%' }}>Remarks</label>
                        <input
                            type="text"
                            value={entry?.Remarks ?? ""}
                            className="cus-inpt p-2"
                            onChange={(e) => updateById(entry.LineId, { Remarks: e.target.value })}
                        />
                    </div>

                    <div className="col-sm-4 p-0 m-0 d-flex align-items-end justify-content-end">

                        <Tooltip title='Add Ref'>
                            <AddJournalBillReference
                                open={addRefDialog}
                                onClose={() => {
                                    setAddRefDialog(false);
                                }}
                                {...entry}
                                journalBillReference={journalBillReference}
                                setJournalBillReference={setJournalBillReference}
                            >
                                <IconButton
                                    size="small"
                                    onClick={() => setAddRefDialog(true)}
                                    disabled={!checkIsNumber(entry.Acc_Id)}
                                ><PlaylistAdd className="fa-20" /></IconButton>
                            </AddJournalBillReference>
                        </Tooltip>

                        <Tooltip title='Delete'>
                            <IconButton
                                size="small"
                                onClick={() => removeLine(entry.LineId)}
                            ><Delete color="error" className="fa-20" /></IconButton>
                        </Tooltip>

                    </div>

                    {toNumber(entry?.Entries?.length) > 0 && (
                        <div className="col-12 p-0 m-0 mt-2">
                            <JournalBillReference
                                {...entry}
                                billRef={toArray(entry?.Entries)}
                                journalBillReference={journalBillReference}
                                setJournalBillReference={setJournalBillReference}

                            />
                        </div>
                    )}

                </div>
            </div>
        )
    }

    return (
        <Card>
            <div className="p-3 d-flex align-items-center">
                <h5 className="flex-grow-1 m-0">Entries</h5>
                <span>
                    <Button
                        variant="outlined"
                        className="me-2"
                        onClick={() => addLine("Dr")}
                    >
                        Add Debit
                    </Button>
                    <Button
                        variant="outlined"
                        className="me-2"
                        onClick={() => addLine("Cr")}
                    >
                        Add Credit
                    </Button>
                </span>
            </div>

            <CardContent>
                <div className="row p-0 m-0">
                    {/* Debit */}
                    <div className="col-md-6 p-2">
                        <h6 className="mb-2 text-center">
                            Debit
                        </h6>
                        {debitLines.map((entry, idx) => (
                            <CardComponent entry={entry} DrCr={'Dr'} key={`Dr-${idx}`} usedDrCr={usedDr} />
                        ))}

                    </div>

                    {/* Credit */}
                    <div className="col-md-6 p-2">
                        <h6 className="mb-2 text-center">
                            Credit
                        </h6>
                        {creditLines.map((entry, idx) => (
                            <CardComponent entry={entry} DrCr={'Dr'} key={`Cr-${idx}`} usedDrCr={usedCr} />
                        ))}
                    </div>
                </div>
            </CardContent>

            <div className="p-4">
                <div className="d-flex flex-column gap-3 p-0 m-0">
                    <div className="row g-4 w-100">
                        <div className="col-3 d-flex align-items-center justify-content-between rounded-3 border px-3 py-2">
                            <span className="small text-secondary">Dr Total</span>
                            <span className="fw-semibold">{NumberFormat(sumOfDebit)}</span>
                        </div>
                        <div className="col-3 d-flex align-items-center justify-content-between rounded-3 border px-3 py-2">
                            <span className="small text-secondary">Cr Total</span>
                            <span className="fw-semibold">{NumberFormat(sumOfCredit)}</span>
                        </div>
                        <div
                            className={`col-3 d-flex align-items-center justify-content-between rounded-3 border px-3 py-2 
                                ${diff === 0 ? "" : "border-warning"}`
                            }
                        >
                            <span className="small text-secondary">Difference</span>
                            <span
                                className={`fw-semibold ${diff === 0 ? "text-dark" : "text-warning"}`}
                            >
                                {NumberFormat(diff)}
                            </span>
                        </div>
                        {/* <div className="col-3 d-flex align-items-center justify-content-end gap-2">
                            <Button variant="primary">Save</Button>
                            <Button variant="secondary">Cancel</Button>
                        </div> */}
                    </div>


                </div>
            </div>

        </Card>
    );
};

export default JournalEntriesInfo;
