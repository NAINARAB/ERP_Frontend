import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { Addition, isEqualNumber, LocalDate, NumberFormat, stringCompare, Subraction, } from "../../../Components/functions";
import { Close, Delete } from "@mui/icons-material";

const AdjesmentsList = ({
    cellHeadStype = { width: '150px' },
    cellStyle = { minWidth: '130px' },
    initialSelectValue = { value: '', label: '' },
    adjesmentData = [],
}) => {

    return (
        <>
            <div className="table-responsive">
                <table className="table table-bordered fa-13">
                    <thead>
                        <tr>
                            <th className="text-primary fa-15 vctr" style={cellHeadStype}>Adjesments</th>
                            <th colSpan={6} className="text-end"></th>
                        </tr>
                        <tr>
                            {['Sno', 'VoucherNo', 'Date', 'Amount', 'Type'].map(
                                (col, colInd) => <th key={colInd} className="bg-light text-muted">{col}</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {adjesmentData.map(
                            (invoice, invoiceInd) => (
                                <tr key={invoiceInd}>
                                    <td>{invoiceInd + 1}</td>
                                    <td>{invoice?.voucherNo}</td>
                                    <td>{LocalDate(invoice?.transDate)}</td>
                                    <td>{NumberFormat(invoice?.adjesmentValue)}</td>
                                    <td>{invoice?.transType}</td>
                                </tr>
                            )
                        )}
                        <tr>
                            <td colSpan={3} className="text-end fw-bold">Total</td>
                            <td className="fw-bold text-muted">
                                {adjesmentData.reduce(
                                    (acc, invoice) => Addition(acc, invoice?.adjesmentValue), 0
                                )}
                            </td>
                            <td colSpan={3}></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default AdjesmentsList;