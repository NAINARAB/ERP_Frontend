import { IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { checkIsNumber, NumberFormat, onlynum, Subraction } from "../../../Components/functions";

const InlineBillRefTable = ({ 
    billRef = [], 
    refAmount = 0, 
    setJournalBillReference 
}) => {

    const updateAmount = (autoGenId, val) => {
        setJournalBillReference((prev) => prev.map((r) => (r.autoGenId === autoGenId ? { ...r, Amount: val } : r)));
    };

    const removeRow = (autoGenId) =>  {
        setJournalBillReference((prev) => prev.filter((r) => r.autoGenId !== autoGenId));
    }

    const totalReferedAmount = billRef.reduce((acc, r) => acc + Number(r.Amount), 0)

    return (
        <div className="table-responsive">
            <table className="table table-bordered m-0">
                <thead>
                    <tr>{["Sno", "Voucher", "Type", "Amount", "#"].map((b) => (
                        <th key={b} className="fa-12">{b}</th>
                    ))}</tr>
                </thead>
                <tbody>
                    {billRef.map((bill, i) => (
                        <tr key={bill.autoGenId}>
                            <td className="fa-12">{i + 1}</td>
                            <td className="fa-12">{bill?.RefNo}</td>
                            <td className="fa-12">{bill?.RefType}</td>
                            <td className="fa-12 p-0">
                                <input
                                    onInput={onlynum}
                                    className="cus-inpt p-2 border-0"
                                    value={bill?.Amount || ""}
                                    disabled={!checkIsNumber(bill?.RefId)}
                                    onChange={(e) => updateAmount(bill.autoGenId, e.target.value)}
                                />
                            </td>
                            <td className="fa-12 p-0">
                                <IconButton size="small" onClick={() => removeRow(bill.autoGenId)}>
                                    <Delete color="error" className="fa-20" />
                                </IconButton>
                            </td>
                        </tr>
                    ))}

                    {billRef.length > 1 && (
                        <tr>
                            <td className="fa-12">balance Ref: </td>
                            <td className="fa-12">
                                {NumberFormat(Subraction(refAmount, totalReferedAmount))}
                            </td>
                            <td className="fa-12">total Ref: </td>
                            <td className="fa-12">
                                {NumberFormat(totalReferedAmount)}
                            </td>
                            <td></td>
                        </tr>
                    )}

                    {billRef.length === 0 && (
                        <tr>
                            <td colSpan={5} className="text-center text-muted">No references added.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default InlineBillRefTable;
