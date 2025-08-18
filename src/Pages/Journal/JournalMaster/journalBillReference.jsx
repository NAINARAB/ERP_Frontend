import { Button, Card, CardContent, IconButton } from "@mui/material";
import Select from "react-select";
import { useMemo, useCallback, useEffect } from "react";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { journalEntriesInfoIV } from "./variable";
import { Addition, checkIsNumber, isEqualNumber, NumberFormat, onlynum } from "../../../Components/functions";
import { Delete } from "@mui/icons-material";


const JournalBillReference = ({
    LineId,
    Acc_Id,
    DrCr,
    Amount,
    billRef = [],
    journalBillReference = [],
    setJournalBillReference,
}) => {

    return (
        <div className="table-responsive">
            <table className="table table-bordered m-0">
                <thead>
                    <tr>
                        {['Sno', 'Voucher', 'Type', 'Amount', '#'].map(bill => (
                            <th key={bill}>{bill}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {billRef.map((bill, bilInd) => {
                        <tr key={bilInd}>
                            <td>{bilInd + 1}</td>
                            <td>{bill?.RefNo}</td>
                            <td>{bill?.RefType}</td>
                            <td>
                                <input
                                    onInput={onlynum}
                                    className="cus-inpt p-2 border-0"
                                    value={bill?.Amount || ''}
                                    disabled={!checkIsNumber(bill?.RefId)}
                                />
                            </td>
                            <td>
                                <IconButton
                                    size="small"
                                    onClick={() => {
                                        setJournalBillReference((prev) => prev.filter((r) => r.autoGenId !== bill.autoGenId));
                                    }}
                                ><Delete color="error" className="fa-20" /></IconButton>
                            </td>
                        </tr>
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default JournalBillReference;
