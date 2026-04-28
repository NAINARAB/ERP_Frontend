import { useEffect, useMemo, useState, useCallback } from "react";
import { Button, Card, CardContent } from "@mui/material";
import { fetchLink } from "../../../Components/fetchComponent";
import { ISOString, checkIsNumber, isEqualNumber, rid, Addition, isValidObject, stringCompare, toNumber } from "../../../Components/functions";
import { journalGeneralInfoIV, journalEntriesInfoIV, journalBillReferenceIV, journalStaffInvolvedInfo } from "./variable";

import JournalGeneralInfo from "./journalGeneralInfo";
import JournalEntriesPanel from "./JournalEntries";
import BillRefDialog from "./addBillReference";
import InvolvedStaffs from "./staffInvolved";
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
    const [journalStaffInvolved, setJournalStaffInvolved] = useState([]);

    const [baseData, setBaseData] = useState({
        accountsList: [],
        voucherType: [],
        branch: [],
        costCategory: [],
        costCenter: [],
        owners: [],
    });

    const [refModal, setRefModal] = useState({ open: false, line: null });
    const openRef = useCallback((line) => setRefModal({ open: true, line }), []);
    const closeRef = useCallback(() => setRefModal((s) => ({ ...s, open: false })), []);

    useEffect(() => {
        (async () => {
            try {
                const [accountsRes, voucherRes, branchRes, ownersRes, costCenterRes, costCategoryRes] = await Promise.all([
                    fetchLink({ address: `journal/accounts` }),
                    fetchLink({ address: `masters/voucher?module=JOURNAL` }),
                    fetchLink({ address: `masters/branch/dropDown` }),
                    fetchLink({ address: `masters/user/dropDown` }),
                    fetchLink({ address: `dataEntry/costCenter` }),
                    fetchLink({ address: `dataEntry/costCenter/category` }),
                ]);

                const accountsList = (accountsRes.success ? accountsRes.data : [])
                    .sort((a, b) => String(a?.Account_name).localeCompare(b?.Account_name));
                const voucherType = (voucherRes.success ? voucherRes.data : [])
                    .sort((a, b) => String(a?.Voucher_Type).localeCompare(b?.Voucher_Type));
                const branch = (branchRes.success ? branchRes.data : [])
                    .sort((a, b) => String(a?.BranchName).localeCompare(b?.BranchName));
                const owners = (ownersRes.success ? ownersRes.data : []).map(owner => ({
                    ...owner, value: owner.UserId, label: owner.Name
                }));

                const costCategory = (costCategoryRes.success ? costCategoryRes.data : [])
                    .sort((a, b) => String(a?.Cost_Center_Name).localeCompare(b?.Cost_Center_Name));
                const costCenter = (costCenterRes.success ? costCenterRes.data : [])
                    .sort((a, b) => String(a?.Cost_Category).localeCompare(b?.Cost_Category));

                setBaseData({ accountsList, voucherType, branch, owners, costCategory, costCenter });
            } catch (e) {
                console.error("Base data fetch error", e);
            }
        })();
    }, []);

    useEffect(() => {
        const Entries = stateDetails?.Entries;
        const billReferenceInfoData = stateDetails?.billReferenceInfo;
        const staffInvolvedData = stateDetails?.staffDetails;
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

            setJournalStaffInvolved(
                staffInvolvedData.map(jsi => Object.fromEntries(
                    Object.entries(journalStaffInvolvedInfo).map(([key, value]) => {
                        return [key, jsi[key] ?? value]
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

    const debitLines = useMemo(
        () =>
            journalEntriesInfo
                .filter((e) => e.DrCr === "Dr")
                .map((line) => {

                    return {
                        ...line,
                        BillEntries: journalBillReference.filter(
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
                    BillEntries: journalBillReference.filter(
                        (bill) => bill.LineId === line.LineId && isEqualNumber(bill.Acc_Id, line.Acc_Id) && bill.DrCr === "Cr"
                    ),
                })),
        [journalEntriesInfo, journalBillReference]
    );

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
        setJournalStaffInvolved([]);
    }

    const saveJournal = useCallback(async () => {
        if (!saveStatus) return;
        if (!stringCompare(journalGeneralInfo.JournalAutoId, '') && stringCompare(journalGeneralInfo?.Alter_Reason, '')) return toast.error('Enter Alter Reason');
        const method =
            journalGeneralInfo?.JournalAutoId && checkIsNumber(journalGeneralInfo?.JournalId) ? "PUT" : "POST";
        // const entryLineNums = new Set(
        //     journalEntriesInfo.map(e => e.LineNum)
        // );

        const bodyData = {
            ...journalGeneralInfo,
            approved_by: Number(journalGeneralInfo?.approved_by) || null,
            cost_center_mapping: Number(journalGeneralInfo?.cost_center_mapping) || 0,
            Entries: [...debitLines, ...creditLines],
            journalStaffInvolved: journalStaffInvolved
            // BillReferences: journalBillReference.filter(ref =>
            //     entryLineNums.has(ref.LineNum)
            // )
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
    }, [saveStatus, journalGeneralInfo, journalEntriesInfo, journalBillReference, journalStaffInvolved, loadingOn, loadingOff]);

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

            <CardContent >

                <div className="row p-0">
                    <div className="col-xxl-3 col-lg-4 col-md-5 p-2">
                        <div className="border p-2" style={{ minHeight: '30vh', height: '100%' }}>
                            <InvolvedStaffs
                                StaffArray={journalStaffInvolved}
                                setStaffArray={setJournalStaffInvolved}
                                costCenter={baseData.costCenter}
                                costCategory={baseData.costCategory}
                            />
                        </div>
                    </div>
                    <div className="col-xxl-9 col-lg-8 col-md-7 py-2 px-0">
                        <div className="border px-3 py-1" style={{ minHeight: '30vh', height: '100%' }}>
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
                                owners={baseData.owners}
                            />
                        </div>
                    </div>
                </div>

                <div className="my-2" />

                <JournalEntriesPanel
                    {...baseData}
                    journalEntriesInfo={journalEntriesInfo}
                    setJournalEntriesInfo={setJournalEntriesInfo}
                    journalBillReference={journalBillReference}
                    setJournalBillReference={setJournalBillReference}
                    onOpenRef={openRef}
                    totals={{ sumOfDebit, sumOfCredit, diff }}
                    debitLines={debitLines}
                    creditLines={creditLines}
                />

                <BillRefDialog
                    open={refModal.open}
                    onClose={closeRef}
                    line={refModal.line}
                    journalBillReference={journalBillReference}
                    setJournalBillReference={setJournalBillReference}
                    JournalAutoId={journalGeneralInfo?.JournalAutoId || ''}
                />
            </CardContent>
        </Card>
    );
};

export default JournalCreateContainer;
