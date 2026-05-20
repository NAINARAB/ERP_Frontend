import { useState } from "react"
import { isEqualNumber, LocalDate } from "../../../Components/functions";
import { IconButton } from "@mui/material";
import { Done, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";



const DisplayStockJournal = ({
    arrayData = [],
    cellHeadStype = { width: '150px' },
    cellStyle = { minWidth: '130px' },
    initialSelectValue = { value: '', label: '' },
    paymentBillInfo = [],
    onSelect
}) => {

    const TableRows = ({ row = {}, sno }) => {
        const [open, setOpen] = useState(false);
        const isProcessing = row?.BillType === 'PROCESSING';

        return (
            <>
                <tr>
                    <td>{sno}</td>
                    <td>{row?.journalVoucherNo || '-'}</td>
                    <td>{row?.journalDate ? LocalDate(row?.journalDate) : '-'}</td>
                    <td>{row?.BillType || '-'}</td>
                    <td>{row?.voucherTypeGet || '-'}</td>
                    <td>{row?.narration || '-'}</td>
                    <td>{row?.paidAmount}</td>
                    <td>
                        <div className="d-flex align-items-center">
                            {(() => {
                                const isChecked = paymentBillInfo.findIndex(o =>
                                    isEqualNumber(o?.pay_bill_id, row.journalId)
                                ) !== -1;

                                return (
                                    <div>
                                        <input
                                            className="form-check-input shadow-none pointer"
                                            style={{ padding: '0.7em' }}
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                                if (isChecked) onSelect(row, true)
                                                else onSelect(row)
                                            }}
                                        />
                                    </div>
                                )
                            })()}

                            <IconButton
                                size="small"
                                className="mx-1"
                                onClick={() => setOpen(pre => !pre)}
                            >
                                {open ? <KeyboardArrowUp className="fa-20" /> : <KeyboardArrowDown className="fa-20" />}
                            </IconButton>
                        </div>
                    </td>
                </tr>

                {open && (
                    <tr>
                        <td colSpan={8} className="p-4">

                            <div className="row ">

                                {isProcessing && (
                                    <div className={"col-md-6 p-1"}>
                                        <FilterableTable
                                            title="Source"
                                            headerFontSizePx={11}
                                            bodyFontSizePx={11}
                                            EnableSerialNumber
                                            dataArray={row?.SourceDetails}
                                            columns={[
                                                createCol('Product_Name', 'string', 'Item'),
                                                createCol('Godown_Name', 'string', 'From'),
                                                createCol('Sour_Qty', 'number', 'QTY'),
                                            ]}
                                            disablePagination
                                        />
                                    </div>
                                )}

                                <div className={isProcessing ? "col-md-6 p-1" : 'col-12 p-1'}>
                                    <FilterableTable
                                        title={isProcessing ? "Destination" : 'Items'}
                                        headerFontSizePx={11}
                                        bodyFontSizePx={11}
                                        EnableSerialNumber
                                        dataArray={row?.Products_List}
                                        columns={[
                                            createCol('productNameGet', 'string', 'Item'),
                                            ...(!isProcessing ? [
                                                createCol('fromLocationGet', 'string', 'From'),
                                            ] : []),
                                            createCol('toLocationGet', 'string', 'To'),
                                            createCol('quantity', 'number', 'QTY'),
                                            createCol('expence_value', 'number', 'Expence'),
                                        ]}
                                        disablePagination
                                    />
                                </div>
                            </div>
                        </td>
                    </tr>
                )}
            </>
        )
    }

    return (
        <>
            <div className="table-responsive">
                <table className="table table-bordered fa-12">
                    <thead>
                        <tr>
                            <th className="text-primary fa-15 vctr" colSpan={3} >Stock Journal</th>
                            <th colSpan={5} className="text-end"></th>
                        </tr>
                        <tr>
                            {['Sno', 'Journal-No', 'Date', 'Journal Type', 'Voucher', 'Narration', 'Paid Amount', '#'].map(
                                (col, colInd) => <td key={colInd}>{col}</td>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {arrayData.map((journal, jouInd) => <TableRows row={journal} sno={jouInd + 1} key={jouInd} />)}
                    </tbody>
                </table>
            </div>
        </>
    )
}

export default DisplayStockJournal