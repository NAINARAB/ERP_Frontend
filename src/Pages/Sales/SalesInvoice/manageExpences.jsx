import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { Addition, checkIsNumber, Division, isEqualNumber, NumberFormat, onlynum, onlynumAndNegative, RoundNumber, toArray, toNumber } from "../../../Components/functions";
import { salesInvoiceExpencesInfo } from "./variable";
import { useState } from "react";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { Delete } from "@mui/icons-material";
import Select from "react-select";
import { calculateGSTDetails } from "../../../Components/taxCalculator";

const ExpencesOfSalesInvoice = ({
    invoiceExpences = [],
    setInvoiceExpences,
    expenceMaster = [],
    IS_IGST,
    taxType,
}) => {

    const handleInputChange = (index, field, value) => {

        setInvoiceExpences(prev =>
            prev.map((item, i) => {
                if (i !== index) return item;

                const updated = { ...item, [field]: value };

                if (field === 'Expence_Value') {
                    const
                        Cgst = item.Cgst ? toNumber(item.Cgst) : 0,
                        Sgst = item.Sgst ? toNumber(item.Sgst) : 0,
                        Igst = item.Igst ? toNumber(item.Igst) : 0,
                        expVal = toNumber(value),
                        taxPercentage = IS_IGST ? Igst : Addition(Cgst, Sgst);

                    const taxAmount = calculateGSTDetails(expVal, taxPercentage, taxType);

                    updated.Cgst_Amo = (Cgst > 0 && !IS_IGST)
                        ? taxAmount.cgst_amount
                        : 0;
                    updated.Sgst_Amo = (Sgst > 0 && !IS_IGST)
                        ? taxAmount.sgst_amount
                        : 0;
                    updated.Igst_Amo = (Igst > 0 && IS_IGST)
                        ? taxAmount.igst_amount
                        : 0;
                }

                if (field === 'Igst') {
                    const 
                        Igst = IS_IGST ? toNumber(value) : 0, 
                        Cgst = !IS_IGST ? Division(toNumber(value), 2) : 0, 
                        Sgst = !IS_IGST ? Division(toNumber(value), 2) : 0;

                    const expVal = toNumber(item.Expence_Value), taxPercentage = IS_IGST ? Igst : Addition(Cgst, Sgst);
                    const taxAmount = calculateGSTDetails(expVal, taxPercentage, taxType);

                    updated.Cgst = Cgst;
                    updated.Sgst = Sgst;
                    updated.Cgst_Amo = Cgst > 0 ? taxAmount.cgst_amount : 0;
                    updated.Sgst_Amo = Sgst > 0 ? taxAmount.sgst_amount : 0;
                    updated.Igst_Amo = Igst > 0 ? taxAmount.igst_amount : 0;
                }

                return updated;
            })
        );
    };

    const handleSelectChange = (index, selectedOption) => {
        const selected = expenceMaster.find(exp => isEqualNumber(exp.Id, selectedOption.value)) || {};
        setInvoiceExpences(prev =>
            prev.map((item, i) => {
                if (i !== index) return item;
                return {
                    ...item,
                    Expense_Id: selected.Id,
                    Expence_Value: 0
                };
            })
        );
    };

    const addNewRow = () => {
        setInvoiceExpences(prev => [...prev, { ...salesInvoiceExpencesInfo, Sno: prev.length }]);
    };

    const removeRow = index => {
        setInvoiceExpences(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <>
            <Card >
                <div className="d-flex align-items-center justify-content-between flex-wrap px-3 py-2">
                    <h5 className="m-0">Expenses</h5>
                    <Button variant="outlined" type="button" onClick={addNewRow}>Add</Button>
                </div>
                <div className="table-responsive">

                    <table className="table table-bordered m-0">
                        <thead className="table-light">
                            <tr>
                                {[
                                    'S.No', 'Expense', 
                                    // 'GST %', 'Tax', 
                                    'Expense Value', 'Action'].map(
                                    (o, i) => <th className="fa-13 bg-light" key={i}>{o}</th>
                                )}
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '13px' }}>
                            {invoiceExpences.map((row, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td className="p-0 vctr" style={{ minWidth: '180px' }}>
                                        <Select
                                            value={{
                                                value: row?.Expense_Id,
                                                label: expenceMaster.find(
                                                    exp => isEqualNumber(exp.Id, row?.Expense_Id)
                                                )?.Expence_Name || '',
                                            }}
                                            onChange={e => handleSelectChange(index, e)}
                                            options={expenceMaster
                                                .filter(exp => !invoiceExpences.some(inv => inv.Expense_Id === exp.Id))
                                                .map(exp => ({ value: exp.Id, label: exp.Expence_Name }))
                                            }
                                            menuPortalTarget={document.body}
                                            isSearchable={true}
                                            placeholder="Select Expense"
                                        />
                                    </td>
                                    {/* <td className="p-0 vctr">
                                        <input
                                            onInput={onlynum}
                                            className="cus-inpt p-2 border-0"
                                            value={(IS_IGST ? toNumber(row.Igst) : Addition(row?.Cgst, row?.Sgst)) || ''}
                                            disabled={!checkIsNumber(row.Expense_Id)}
                                            onChange={e => handleInputChange(index, 'Igst', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-0 vctr text-center" >
                                        {NumberFormat(IS_IGST ? toNumber(row?.Igst_Amo) : Addition(row?.Cgst_Amo, row?.Sgst_Amo))}
                                    </td> */}
                                    <td className="p-0 vctr">
                                        <input
                                            onInput={onlynumAndNegative}
                                            className="cus-inpt p-2 border-0"
                                            value={toNumber(row.Expence_Value) || ''}
                                            disabled={!checkIsNumber(row.Expense_Id)}
                                            onChange={e => handleInputChange(index, 'Expence_Value', e.target.value)}
                                        />
                                    </td>
                                    <td className="p-0 vctr  text-center ">
                                        <IconButton onClick={() => removeRow(index)} size="small">
                                            <Delete color="error" fontSize="small" />
                                        </IconButton>
                                    </td>
                                </tr>
                            ))}
                            {invoiceExpences.length === 0 && (
                                <tr><td className="text-center" colSpan={6}>No rows</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </>
    )
}

export default ExpencesOfSalesInvoice;