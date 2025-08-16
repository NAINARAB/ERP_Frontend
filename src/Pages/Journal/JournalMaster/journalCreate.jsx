import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"
import { journalGeneralInfoIV, journalEntriesInfoIV, journalBillReferenceIV } from "./variable";
import { Button } from "@mui/material"
import { fetchLink } from "../../../Components/fetchComponent";
import JournalGeneralInfo from "./journalGeneralInfo";
import JournalEntriesInfo from "./JournalEntries";
import { Addition, checkIsNumber, isEqualNumber, ISOString, isValidObject } from "../../../Components/functions";
import { toast } from 'react-toastify';

const JournalCreate = ({ loadingOn, loadingOff }) => {
    const nav = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;

    const [journalGeneralInfo, setJournalGeneralInfo] = useState(journalGeneralInfoIV);
    const [journalEntriesInfo, setJournalEntriesInfo] = useState([
        { ...journalEntriesInfoIV, DrCr: 'Dr' },
        { ...journalEntriesInfoIV, DrCr: 'Cr' }
    ]);
    const [journalBillReference, setJournalBillReference] = useState([]);
    const [baseData, setBaseData] = useState({
        accountsList: [],
        accountGroupData: [],
        voucherType: [],
        defaultBankMaster: [],
        branch: []
    })

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [
                    accountsResponse,
                    accountsGroupResponse,
                    voucherTypeResponse,
                    defaultBankMaster,
                    branchResponse
                ] = await Promise.all([
                    fetchLink({ address: `payment/accounts` }),
                    fetchLink({ address: `payment/accountGroup` }),
                    fetchLink({ address: `masters/voucher?module=JOURNAL` }),
                    fetchLink({ address: `masters/defaultBanks` }),
                    fetchLink({ address: `masters/branch/dropDown` }),
                ]);

                const accountsList = (accountsResponse.success ? accountsResponse.data : []).sort(
                    (a, b) => String(a?.Account_name).localeCompare(b?.Account_name)
                );
                const accountGroupData = (accountsGroupResponse.success ? accountsGroupResponse.data : []).sort(
                    (a, b) => String(a?.Group_Name).localeCompare(b?.Group_Name)
                );
                const voucherType = (voucherTypeResponse.success ? voucherTypeResponse.data : []).sort(
                    (a, b) => String(a?.Voucher_Type).localeCompare(b?.Voucher_Type)
                );
                const bankDetails = (defaultBankMaster.success ? defaultBankMaster.data : []);
                const branchData = (branchResponse.success ? branchResponse.data : []).sort(
                    (a, b) => String(a?.BranchName).localeCompare(b?.BranchName)
                );

                setBaseData((pre) => ({
                    ...pre,
                    accountsList: accountsList,
                    accountGroupData: accountGroupData,
                    voucherType: voucherType,
                    defaultBankMaster: bankDetails,
                    branch: branchData
                }));

            } catch (e) {
                console.error("Error fetching data:", e);
            }
        };

        fetchData();

    }, []);

    console.log(stateDetails)

    useEffect(() => {
        const Entries = stateDetails?.Entries;
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
            )
        }
    }, [stateDetails])

    const saveStatus = useMemo(() => {
        const checkIfDebitExist = journalEntriesInfo.some(entry => (
            entry.DrCr === 'Dr'
            && entry.Amount > 0
            && checkIsNumber(entry.Acc_Id)
            && !isEqualNumber(entry.Acc_Id, 0)
        ));

        const checkIfCreditExist = journalEntriesInfo.some(entry => (
            entry.DrCr === 'Cr'
            && entry.Amount > 0
            && checkIsNumber(entry.Acc_Id)
            && !isEqualNumber(entry.Acc_Id, 0)
        ));

        const debitAmount = journalEntriesInfo.reduce((acc, entry) => {
            return entry.DrCr === 'Dr' ? Addition(acc, entry.Amount) : acc;
        }, 0);

        const creditAmount = journalEntriesInfo.reduce((acc, entry) => {
            return entry.DrCr === 'Cr' ? Addition(acc, entry.Amount) : acc;
        }, 0);

        return checkIfDebitExist && checkIfCreditExist && isEqualNumber(debitAmount, creditAmount);

    }, [journalEntriesInfo]);

    const clearValues = () => {
        setJournalGeneralInfo(journalGeneralInfoIV);
        setJournalEntriesInfo([
            { ...journalEntriesInfoIV, DrCr: 'Dr' },
            { ...journalEntriesInfoIV, DrCr: 'Cr' }
        ]);
        setJournalBillReference([]);
    }

    const saveJournal = () => {
        if (!saveStatus) return;

        fetchLink({
            address: `journal/journalMaster`,
            method: (
                journalGeneralInfo?.JournalAutoId
                && checkIsNumber(journalGeneralInfo?.JournalId)
            ) ? 'PUT' : 'POST',
            bodyData: {
                ...journalGeneralInfo,
                Entries: journalEntriesInfo,
                // BillReference: journalBillReference,
            },
            loadingOn, loadingOff
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                clearValues();
            } else {
                toast.error(data.message);
            }
        }).catch(e => console.error(e))
    }

    return (
        <>
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

            <p className="my-2" />

            <JournalEntriesInfo
                {...baseData}
                journalGeneralInfo={journalGeneralInfo}
                setJournalGeneralInfo={setJournalGeneralInfo}
                journalEntriesInfo={journalEntriesInfo}
                setJournalEntriesInfo={setJournalEntriesInfo}
                journalBillReference={journalBillReference}
                setJournalBillReference={setJournalBillReference}
                saveFun={saveJournal}
                saveStatus={saveStatus}
            />


        </>
    )
}


export default JournalCreate;