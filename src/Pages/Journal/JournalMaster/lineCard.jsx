import { memo, useEffect } from "react";
import { IconButton, Tooltip } from "@mui/material";
import { Delete, PlaylistAdd } from "@mui/icons-material";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { isEqualNumber, checkIsNumber, toArray, reactSelectFilterLogic } from "../../../Components/functions";
import InlineBillRefTable from "./journalBillReference";

const toNum = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
const money = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

const LineCard = memo(function LineCard({
    entry,
    accountOptions,
    isOptionDisabled,
    updateLine,
    removeLine,
    openRef,
    journalBillReference,
    setJournalBillReference,
    fetchPendingReferences,
}) {

    useEffect(() => {
        if (
            checkIsNumber(entry?.Acc_Id) &&
            !entry?.isPendingRefFetched &&
            !entry?.isPendingRefLoading &&
            fetchPendingReferences
        ) {
            fetchPendingReferences(entry.Acc_Id, entry.LineId);
        }
    }, [entry?.Acc_Id, entry?.isPendingRefFetched, entry?.isPendingRefLoading, entry?.LineId, fetchPendingReferences]);

    const selected =
        entry?.Acc_Id != null ? accountOptions.find((o) => isEqualNumber(o.value, entry.Acc_Id)) || null : null;

    return (
        <div className="border rounded-3 p-3 mb-2">
            <div className="row p-0 m-0">
                <div className="col-sm-8 p-0 m-0">
                    <label>Account</label>
                    <Select
                        placeholder="Select account"
                        value={selected}
                        options={accountOptions}
                        isOptionDisabled={(opt) => isOptionDisabled(opt, entry)}
                        onChange={(opt) => {
                            const isSundryParty = (accountOptions.find(
                                ac => isEqualNumber(ac?.value, opt?.value)) || {}
                            )?.isSundryParty;

                            const newAccId = !opt ? null : toNum(opt.value);

                            if (setJournalBillReference) {
                                setJournalBillReference((prev) =>
                                    prev.filter((b) => b.LineId !== entry.LineId)
                                );
                            }

                            updateLine(
                                entry.LineId,
                                {
                                    Acc_Id: newAccId,
                                    AccountGet: !opt ? "" : opt.label,
                                    isSundryParty: isSundryParty ? 1 : 0,
                                    pendingRefDetails: [],
                                    isPendingRefFetched: false,
                                    isPendingRefLoading: checkIsNumber(newAccId)
                                }
                            );

                            if (checkIsNumber(newAccId) && fetchPendingReferences) {
                                fetchPendingReferences(newAccId, entry.LineId);
                            }
                        }}
                        isClearable
                        isSearchable
                        styles={customSelectStyles}
                        menuPortalTarget={document.body}
                        filterOption={reactSelectFilterLogic}
                    />
                </div>

                <div className="col-sm-4 p-0 ps-2 m-0">
                    <label>Amount</label>
                    <input
                        type="number"
                        value={entry?.Amount || ""}
                        className="cus-inpt p-2"
                        onChange={(e) => updateLine(entry.LineId, { Amount: money(e.target.value) })}
                    />
                </div>

                <div className="col-8 p-0 m-0 mt-2">
                    <label style={{ minWidth: "100%" }}>Remarks</label>
                    <input
                        type="text"
                        value={entry?.Remarks ?? ""}
                        className="cus-inpt p-2"
                        onChange={(e) => updateLine(entry.LineId, { Remarks: e.target.value })}
                    />
                </div>

                <div className="col-sm-4 p-0 m-0 d-flex align-items-end justify-content-end">
                    <Tooltip title={entry?.isPendingRefLoading ? "Loading references..." : "Add Ref"}>
                        <span>
                            <IconButton
                                size="small"
                                onClick={() => openRef(entry)}
                                disabled={!checkIsNumber(entry.Acc_Id)}
                            >
                                {entry?.isPendingRefLoading ? (
                                    <span
                                        className="spinner-border spinner-border-sm text-primary"
                                        style={{ width: "18px", height: "18px", borderWidth: "2px" }}
                                        role="status"
                                    />
                                ) : (
                                    <PlaylistAdd className="fa-20" />
                                )}
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => removeLine(entry.LineId)}>
                            <Delete color="error" className="fa-20" />
                        </IconButton>
                    </Tooltip>
                </div>

                {toArray(entry.BillEntries).length > 0 && (
                    <div className="col-12 p-0 m-0 mt-2">
                        <InlineBillRefTable
                            billRef={toArray(entry.BillEntries)}
                            refAmount={entry?.Amount}
                            setJournalBillReference={setJournalBillReference}
                        />
                    </div>
                )}
            </div>
        </div>
    );
});

export default LineCard;
