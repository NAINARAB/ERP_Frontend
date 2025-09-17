import { useEffect, useMemo, useState, useCallback } from "react";
import { Button, Card, CardContent } from "@mui/material";
import { fetchLink } from "../../../Components/fetchComponent";
import { ISOString, checkIsNumber, isEqualNumber, rid, Addition, isValidObject } from "../../../Components/functions";
import { journalGeneralInfoIV, journalEntriesInfoIV, journalBillReferenceIV } from "./variable";

import JournalGeneralInfo from "./journalGeneralInfo";
import JournalEntriesPanel from "./JournalEntries";
import BillRefDialog from "./addBillReference";
import { useLocation } from "react-router-dom";
import { toast } from 'react-toastify'

// const toNum = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
const money = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };

const JournalCreateContainer = ({ loadingOn, loadingOff }) => {

    const location = useLocation();
    const stateDetails = location.state;

    const [journalGeneralInfo, setJournalGeneralInfo] = useState({
        ...journalGeneralInfoIV,
        JournalDate: ISOString(),
    });

    const [journalEntriesInfo, setJournalEntriesInfo] = useState([
        { ...journalEntriesInfoIV, LineId: rid(), DrCr: "Dr" },
        { ...journalEntriesInfoIV, LineId: rid(), DrCr: "Cr" },
    ]);

    const [journalBillReference, setJournalBillReference] = useState([]);

    const [baseData, setBaseData] = useState({
        accountsList: [],
        voucherType: [],
        branch: [],
    });

    const [refModal, setRefModal] = useState({ open: false, line: null });
    const openRef = useCallback((line) => setRefModal({ open: true, line }), []);
    const closeRef = useCallback(() => setRefModal((s) => ({ ...s, open: false })), []);

    useEffect(() => {
        (async () => {
            try {
                const [accountsRes, voucherRes, branchRes] = await Promise.all([
                    fetchLink({ address: `journal/accounts` }),
                    fetchLink({ address: `masters/voucher?module=JOURNAL` }),
                    fetchLink({ address: `masters/branch/dropDown` }),
                ]);

                const accountsList = (accountsRes.success ? accountsRes.data : [])
                    .sort((a, b) => String(a?.Account_name).localeCompare(b?.Account_name));
                const voucherType = (voucherRes.success ? voucherRes.data : [])
                    .sort((a, b) => String(a?.Voucher_Type).localeCompare(b?.Voucher_Type));
                const branch = (branchRes.success ? branchRes.data : [])
                    .sort((a, b) => String(a?.BranchName).localeCompare(b?.BranchName));

                setBaseData({ accountsList, voucherType, branch });
            } catch (e) {
                console.error("Base data fetch error", e);
            }
        })();
    }, []);

    useEffect(() => {
        const Entries = stateDetails?.Entries;
        const billReferenceInfoData = stateDetails?.billReferenceInfo;
        if (
            isValidObject(stateDetails)
            && Array.isArray(Entries)
        ) {

            setJournalGeneralInfo(
                Object.fromEntries(
                    Object.entries(journalGeneralInfoIV).map(([key, value]) => {
                        if (key === 'JournalDate') return [key, stateDetails[key] ? ISOString(stateDetails[key]) : value]
                        return [key, stateDetails[key] ?? value]
                    })
                )
            );

            setJournalEntriesInfo(
                Entries.map(journalEntries => Object.fromEntries(
                    Object.entries(journalEntriesInfoIV).map(([key, value]) => {
                        return [key, journalEntries[key] ?? value]
                    })
                ))
            );

            setJournalBillReference(
                billReferenceInfoData.map(journalBillRef => Object.fromEntries(
                    Object.entries(journalBillReferenceIV).map(([key, value]) => {
                        return [key, journalBillRef[key] ?? value]
                    })
                ))
            );
        }
    }, [stateDetails])

    const sumOfDebit = useMemo(
        () => journalEntriesInfo.filter(r => r.DrCr === "Dr").reduce((acc, r) => Addition(acc, money(r.Amount)), 0),
        [journalEntriesInfo]
    );
    const sumOfCredit = useMemo(
        () => journalEntriesInfo.filter(r => r.DrCr === "Cr").reduce((acc, r) => Addition(acc, money(r.Amount)), 0),
        [journalEntriesInfo]
    );
    const diff = useMemo(() => sumOfDebit - sumOfCredit, [sumOfDebit, sumOfCredit]);

    // const saveStatus = useMemo(() => {
    //     const hasDr = journalEntriesInfo.some(e => (
    //         e.DrCr === "Dr"
    //         && e.Amount > 0
    //         && checkIsNumber(e.Acc_Id)
    //         && !isEqualNumber(e.Acc_Id, 0)
    //     ));

    //     const hasCr = journalEntriesInfo.some(e => (
    //         e.DrCr === "Cr"
    //         && e.Amount > 0
    //         && checkIsNumber(e.Acc_Id)
    //         && !isEqualNumber(e.Acc_Id, 0)
    //     ));

    //     const journalEntriesInfoBalance = journalEntriesInfo.filter(
    //         bill => bill?.Entries?.length > 0
    //     ).every(entry => isEqualNumber(
    //         entry?.Entries?.reduce(
    //             (acc, bill) => Addition(bill.Amount, acc), 0
    //         ), 
    //         entry.Amount
    //     ))

    //     return hasDr && hasCr && isEqualNumber(sumOfDebit, sumOfCredit) && journalEntriesInfoBalance;
    // }, [journalEntriesInfo, sumOfDebit, sumOfCredit, journalBillReference]);

    const saveStatus = useMemo(() => {
        const num = (v) => (v == null || v === "" ? 0 : Number(v) || 0);
        const nearlyEqual = (a, b, eps = 0.005) => Math.abs(num(a) - num(b)) < eps;

        if (!checkIsNumber(journalGeneralInfo.VoucherType)) return false;
        if (!checkIsNumber(journalGeneralInfo.BranchId)) return false;

        const hasDr = journalEntriesInfo.some(
            (e) => e.DrCr === "Dr" && num(e.Amount) > 0 && checkIsNumber(e.Acc_Id) && !isEqualNumber(e.Acc_Id, 0)
        );
        const hasCr = journalEntriesInfo.some(
            (e) => e.DrCr === "Cr" && num(e.Amount) > 0 && checkIsNumber(e.Acc_Id) && !isEqualNumber(e.Acc_Id, 0)
        );

        return hasDr && hasCr && nearlyEqual(sumOfDebit, sumOfCredit);

        // const refsByLine = journalBillReference.reduce((m, r) => {
        //     if (!r?.LineId) return m;
        //     m[r.LineId] = (m[r.LineId] || 0) + num(r.Amount);
        //     return m;
        // }, {});

        // const allRefdLinesBalanced = journalEntriesInfo
        //     .filter((e) => refsByLine[e.LineId] != null)
        //     .every((e) => nearlyEqual(refsByLine[e.LineId], e.Amount));

        // return allRefdLinesBalanced;
    }, [journalGeneralInfo, journalEntriesInfo, journalBillReference, sumOfDebit, sumOfCredit]);

    const resetValues = () => {
        setJournalGeneralInfo({ ...journalGeneralInfoIV, JournalDate: ISOString() });
        setJournalEntriesInfo([
            { ...journalEntriesInfoIV, LineId: rid(), DrCr: "Dr" },
            { ...journalEntriesInfoIV, LineId: rid(), DrCr: "Cr" },
        ]);
        setJournalBillReference([]);
    }

    const saveJournal = useCallback(async () => {
        if (!saveStatus) return;
        const method =
            journalGeneralInfo?.JournalAutoId && checkIsNumber(journalGeneralInfo?.JournalId) ? "PUT" : "POST";
        const bodyData = {
            ...journalGeneralInfo,
            Entries: journalEntriesInfo,
            BillReferences: journalBillReference
        };

        fetchLink({
            address: `journal/journalMaster`,
            method,
            bodyData,
            loadingOn,
            loadingOff
        }).then(res => {
            if (res.success) {
                resetValues();
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        }).catch(e => {
            console.error("Save journal error", e);
        });
    }, [saveStatus, journalGeneralInfo, journalEntriesInfo, journalBillReference, loadingOn, loadingOff]);

    console.log(journalEntriesInfo)

    return (
        <Card>

            <h5 className="p-3 m-0 d-flex align-items-center">
                <span className="flex-grow-1">
                    Journal Voucher
                    {journalGeneralInfo.JournalVoucherNo ? `- ${journalGeneralInfo.JournalVoucherNo}` : ''}
                </span>
                <span>
                    <Button
                        disabled={!saveStatus}
                        variant="outlined"
                        // color="success"
                        onClick={saveStatus ? saveJournal : undefined}
                    >Save</Button>
                </span>
            </h5>

            <CardContent>

                <JournalGeneralInfo
                    {...baseData}
                    journalGeneralInfo={journalGeneralInfo}
                    setJournalGeneralInfo={setJournalGeneralInfo}
                    journalEntriesInfo={journalEntriesInfo}
                    setJournalEntriesInfo={setJournalEntriesInfo}
                    journalBillReference={journalBillReference}
                    setJournalBillReference={setJournalBillReference}
                    saveStatus={saveStatus}
                    saveFun={saveJournal}
                />

                <div className="my-2" />

                <JournalEntriesPanel
                    {...baseData}
                    journalEntriesInfo={journalEntriesInfo}
                    setJournalEntriesInfo={setJournalEntriesInfo}
                    journalBillReference={journalBillReference}
                    setJournalBillReference={setJournalBillReference}
                    onOpenRef={openRef}
                    totals={{ sumOfDebit, sumOfCredit, diff }}
                />

                <BillRefDialog
                    open={refModal.open}
                    onClose={closeRef}
                    line={refModal.line}
                    journalBillReference={journalBillReference}
                    setJournalBillReference={setJournalBillReference}
                />
            </CardContent>
        </Card>
    );
};

export default JournalCreateContainer;
