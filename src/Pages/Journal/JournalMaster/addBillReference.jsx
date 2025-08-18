import { Dialog, DialogContent, DialogTitle } from "@mui/material"
import { useEffect } from "react";
import { useState } from "react"
import { Addition, checkIsNumber, isEqualNumber, rid, stringCompare, Subraction, toArray } from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";


const AddJournalBillReference = ({
    children,
    open = false,
    onClose = undefined,
    LineId,
    LineNum,
    Acc_Id,
    DrCr,
    Amount,
    billRef = [],
    journalBillReference = [],
    setJournalBillReference,
}) => {

    const [pendingRefDetails, setPendingRefDetails] = useState([]);

    useEffect(() => {
        if (checkIsNumber(Acc_Id)) {
            fetchLink({
                address: `journal/accountPendingReference?Acc_Id=${Acc_Id}`
            }).then(data => {
                if (data.success) setPendingRefDetails(data.data);
                else setPendingRefDetails([]);
            }).catch(e => console.error(e));
        }
    }, [Acc_Id]);

    const onSelect = (row, deleteOption = false) => {
        setJournalBillReference(pre => {
            const previousValue = toArray(pre);

            const excludeCurrentValue = previousValue.filter(bill => !(
                isEqualNumber(Acc_Id, bill.Acc_Id) &&
                stringCompare(DrCr, bill.DrCr) &&
                stringCompare(bill.RefNo, row.voucherNumber)
            ));

            let updateBillInfo;
            if (deleteOption) {
                updateBillInfo = excludeCurrentValue;
            } else {
                updateBillInfo = [...excludeCurrentValue, {
                    autoGenId: rid(),
                    LineId: LineId,
                    LineNum: '',
                    JournalAutoId: '',
                    JournalId: '',
                    JournalVoucherNo: '',
                    JournalDate: '',
                    Acc_Id: Acc_Id,
                    DrCr: DrCr,
                    RefId: row?.voucherId,
                    RefNo: row?.voucherNumber,
                    RefType: row?.actualSource,
                    Amount: 0,
                }];
            }
            return updateBillInfo;
        })
    }

    return (
        <>
            {children}

            <Dialog
                open={open}
                onClose={onClose}
                fullScreen
            >
                <DialogTitle>Add Bill-Reference</DialogTitle>
                <DialogContent>
                    <div className="table-responsive table-bordered">
                        <table className="table m-0">
                            <thead>
                                <tr>
                                    {[
                                        'Sno', 'Voucher-Number', 'Date', 'Source',
                                        'Dr/Cr', 'Total', 'Pending', 'Journal',
                                        'Pay/Rec', 'Total Ref', '#'
                                    ].map(col => (
                                        <th className="fa-13" key={col}>{col}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>

                                {pendingRefDetails.map((pendingRef, billInd) => {

                                    const totalRef = Addition(pendingRef?.againstAmount, pendingRef?.journalAdjustment);
                                    const pending = Subraction(pendingRef?.totalValue, totalRef);
                                    const isChecked = journalBillReference.find(bill => (
                                        isEqualNumber(Acc_Id, bill.Acc_Id) &&
                                        isEqualNumber(Acc_Id, pendingRef.Acc_Id) &&
                                        stringCompare(DrCr, bill.DrCr) &&
                                        stringCompare(bill.RefNo, pendingRef.voucherNumber)
                                    ))

                                    return (
                                        <tr key={`bill-ref-${billInd}`}>
                                            <td className="fa-12">{billInd + 1}</td>
                                            <td className="fa-12">{pendingRef?.voucherNumber}</td>
                                            <td className="fa-12">{pendingRef?.eventDate}</td>
                                            <td className="fa-12">{pendingRef?.actualSource}</td>
                                            <td className="fa-12">{pendingRef?.accountSide}</td>
                                            <td className="fa-12">{pendingRef?.totalValue}</td>
                                            <td className="fa-12">{pending}</td>
                                            <td className="fa-12">{pendingRef?.journalAdjustment}</td>
                                            <td className="fa-12">{pendingRef?.againstAmount}</td>
                                            <td className="fa-12">{totalRef}</td>
                                            <td>
                                                <input
                                                    className="form-check-input shadow-none pointer mx-2"
                                                    style={{ padding: '0.7em' }}
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        if (isChecked) onSelect(pendingRef, true)
                                                        else onSelect(pendingRef)
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default AddJournalBillReference;