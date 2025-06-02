import { Delete, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useState, useEffect } from "react";

// Local utility functions
const toNumber = (val) => Number(val) || 0;

const add = (a, b) => toNumber(a) + toNumber(b);
const subtract = (a, b) => toNumber(a) - toNumber(b);
const multiply = (a, b) => toNumber(a) * toNumber(b);
const divide = (a, b) => b !== 0 ? toNumber(a) / toNumber(b) : 0;
const roundNumber = (num, precision = 2) => Number(toNumber(num).toFixed(precision));
const isEqualNumber = (a, b) => toNumber(a) === toNumber(b);
const numberFormat = (num) => new Intl.NumberFormat().format(toNumber(num));
const localDate = (dateStr) => new Date(dateStr).toLocaleDateString();

const ListCostingDetails = ({
    paymentBillInfo = [],
    paymentCostingInfo = [],
    setPaymentBillInfo,
    setPaymentCostingInfo,
    onInputValidate,
    onSelectStockJournal,
    journalAmountOnChange,
}) => {
    const [open, setOpen] = useState(true);

    const onChangeAmount = (itemDetails, amount) => {
        setPaymentCostingInfo((pre) => {
            const selectedItem = [...pre];
            const indexOfInvoice = selectedItem.findIndex(
                (inv) =>
                    isEqualNumber(itemDetails.pay_bill_id, inv.pay_bill_id) &&
                    isEqualNumber(itemDetails.item_id, inv.item_id)
            );

            if (indexOfInvoice !== -1) {
                selectedItem[indexOfInvoice].expence_value = toNumber(amount);
            }
            return selectedItem;
        });
    };

    // Weighted average distribution when user enters journal amount
    const onChangeJournalAmount = (journal, amount = 0) => {
        const totalAmount = toNumber(amount);

        setPaymentBillInfo((pre) => {
            const updated = [...pre];
            const index = updated.findIndex((b) => isEqualNumber(b.pay_bill_id, journal.pay_bill_id));
            if (index !== -1) updated[index].Debit_Amo = totalAmount;
            return updated;
        });

        setPaymentCostingInfo((prev) => {
            const items = prev.filter((item) => isEqualNumber(item.pay_bill_id, journal.pay_bill_id));

            // const shouldDistribute = items.every((item) => !item.expence_value || Number(item.expence_value) === 0);

            // if (!shouldDistribute || items.length === 0) return prev;

            const totalQty = items.reduce((sum, item) => add(sum, item.itemQuantity), 0);
            const unitCost = divide(totalAmount, totalQty);

            let distributed = 0;

            const updatedItems = items.map((item, index) => {
                const weighted = roundNumber(multiply(item.itemQuantity, unitCost));
                if (index < items.length - 1) {
                    distributed = add(distributed, weighted);
                    return {
                        ...item,
                        expence_value: weighted,
                    };
                } else {
                    return {
                        ...item,
                        expence_value: roundNumber(subtract(totalAmount, distributed)),
                    };
                }
            });

            return prev.map((item) => {
                if (isEqualNumber(item.pay_bill_id, journal.pay_bill_id)) {
                    const updated = updatedItems.find((i) => i.item_id === item.item_id);
                    return updated || item;
                }
                return item;
            });
        });
    };

    return (
        <>
            <div className="table-responsive">
                {paymentBillInfo.map((journal, journalIndex) => (
                    <table className="table table-bordered fa-12 my-3" key={journalIndex}>
                        <thead>
                            <tr>
                                <th className="bg-light">{journalIndex + 1}</th>
                                <th className="bg-light text-primary vctr">{journal.bill_name}</th>
                                <th className="bg-light">
                                    Date: {journal.StockJournalDate ? localDate(journal.StockJournalDate) : "-"}
                                </th>
                                <th className="bg-light">{journal.JournalBillType}</th>
                                <th className="bg-light">Paid: {journal.TotalPaidAmount}</th>
                                <th className="bg-light vctr p-0 text-end">
                                    <input
                                        value={journal.Debit_Amo || ""}
                                        className="cus-inpt p-2 border-dark text-primary bg-light"
                                        placeholder="Enter Amount"
                                        type="number"
                                        onChange={(e) => onChangeJournalAmount(journal, e.target.value)}
                                    />
                                </th>
                                <th className="bg-light vctr p-0 text-end">
                                    <IconButton
                                        size="small"
                                        onClick={() =>
                                            onSelectStockJournal(
                                                {
                                                    ...journal,
                                                    journalId: journal.pay_bill_id,
                                                },
                                                true
                                            )
                                        }
                                    >
                                        <Delete className="fa-20" color="error" />
                                    </IconButton>
                                    {/* 
                                    <IconButton
                                        size="small"
                                        className="mx-1"
                                        onClick={() => setOpen((pre) => !pre)}
                                    >
                                        {open ? (
                                            <KeyboardArrowUp className="fa-20" />
                                        ) : (
                                            <KeyboardArrowDown className="fa-20" />
                                        )}
                                    </IconButton> 
                                    */}
                                </th>
                            </tr>

                            {open && (
                                <tr>
                                    <td className="vctr">Sno</td>
                                    <td className="vctr" colSpan={2}>
                                        Item
                                    </td>
                                    <td className="vctr">Quantity</td>
                                    <td className="vctr">Paid Amount</td>
                                    <td className="vctr" colSpan={2}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span>Payment Amount</span>
                                            <span className="fa-17 text-primary">
                                                {numberFormat(toNumber(journal.Debit_Amo))}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </thead>
                        {open && (
                            <tbody>
                                {paymentCostingInfo
                                    .filter((itemDetails) => isEqualNumber(itemDetails.pay_bill_id, journal.pay_bill_id))
                                    .map((item, itemIndex) => (
                                        <tr key={itemIndex}>
                                            <td>{`${journalIndex + 1}.${itemIndex + 1}`}</td>
                                            <td colSpan={2}>{item.item_name}</td>
                                            <td>{item?.itemQuantity}</td>
                                            <td>{item?.PaidAmount}</td>
                                            <td colSpan={2} className="p-0">
                                                <input
                                                    value={item.expence_value || ""}
                                                    className="cus-inpt p-2 border-0 text-primary"
                                                    placeholder="Enter Amount"
                                                    type="number"
                                                    onChange={(e) => onChangeAmount(item, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        )}
                    </table>
                ))}
            </div>
        </>
    );
};

export default ListCostingDetails;
