import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { checkIsNumber, isEqualNumber, ISOString, RoundNumber, stringCompare, toArray, toNumber } from "../../../Components/functions";
import { Close, Search } from "@mui/icons-material";
import { receiptBillInfoInitialValue, receiptCostingInfoInitialValue, stockJournalTypes } from "./variable";
import { useEffect, useState } from "react";
import RequiredStar from "../../../Components/requiredStar";
import Select from "react-select";
import { customSelectStyles } from "../../../Components/tablecolumn";
import { fetchLink } from "../../../Components/fetchComponent";
import DisplayStockJournal from "./displayStockJournal";
import ListCostingDetails from "./listCostingDetail";

const ExpenceReceipt = ({
    cellHeadStype = { width: '150px' },
    cellStyle = { minWidth: '130px' },
    initialSelectValue = { value: '', label: '' },
    filters,
    baseData,
    receiptValue = {},
    receiptBillInfo = [],
    receiptCostingInfo = [],
    setreceiptValue,
    setReceiptBillInfo,
    setReceiptCostingInfo,
    updateFilterData,
    updateBaseData,
    closeDialog,
    loadingOn,
    loadingOff
}) => {

    const [searchFilter, setSearchFilter] = useState({
        reqDate: ISOString(),
        stockJournalType: stockJournalTypes[0].value,
        itemFilter: [],
        journalVoucher: { label: 'ALL', value: '' }
    });

    useEffect(() => {
        fetchLink({
            address: `masters/products/dropDown`,
        }).then(data => {
            if (data.success) return updateBaseData('itemDropDownData', toArray(data.data));
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/voucher`,
        }).then(data => {
            if (data.success) return updateBaseData('journalVoucherData', toArray(data.data));
        }).catch(e => console.error(e))
    }, [])

    const searchStockJournal = (date, journalType, items, voucher) => {
        fetchLink({
            address: `payment/paymentMaster/searchStockJournal`,
            method: 'POST',
            bodyData: { reqDate: date, stockJournalType: journalType, filterItems: items, voucher: voucher },
            loadingOn, loadingOff
        }).then(data => {
            if (data.data) {
                updateBaseData('stockJournalSearchResult', toArray(data.data))
            } else {
                updateBaseData('stockJournalSearchResult', [])
            }
        }).catch(e => console.error(e))
    }

    const onSelectStockJournal = (invoiceDetails, deleteOption) => {

        setReceiptBillInfo(pre => {
            const previousValue = toArray(pre);

            const excludeCurrentValue = previousValue.filter(o => !isEqualNumber(o?.bill_id, invoiceDetails.journalId));

            let updateBillInfo;
            if (deleteOption) {
                updateBillInfo = excludeCurrentValue;
            } else {
                const reStruc = Object.fromEntries(
                    Object.entries(receiptBillInfoInitialValue).map(([key, value]) => {
                        switch (key) {
                            case 'bill_id': return [key, invoiceDetails?.journalId];
                            case 'bill_name': return [key, invoiceDetails?.journalVoucherNo];
                            case 'JournalBillType': return [key, invoiceDetails?.BillType];
                            case 'Credit_Amo': return [key, 0];

                            case 'StockJournalDate': return [key, invoiceDetails.journalDate];
                            case 'TotalPaidAmount': return [key, invoiceDetails.Paid_Amount];
                            default: return [key, value];
                        }
                    })
                )
                updateBillInfo = [...excludeCurrentValue, reStruc];
            }
            return updateBillInfo;
        });

        setReceiptCostingInfo(pre => {
            const previousValue = toArray(pre);

            const excludeCurrentValue = previousValue.filter(o => !isEqualNumber(o?.bill_id, invoiceDetails.journalId));

            let updateCostinInfo;
            if (deleteOption) {
                updateCostinInfo = excludeCurrentValue;
            } else {
                const reStruc = invoiceDetails.Products_List.map(journalProduct => Object.fromEntries(
                    Object.entries(receiptCostingInfoInitialValue).map(([key, value]) => {
                        switch (key) {
                            case 'bill_id': return [key, invoiceDetails?.journalId];
                            case 'pur_date': return [key, invoiceDetails?.journalDate];
                            case 'JournalBillType': return [key, invoiceDetails?.BillType];

                            case 'arr_id': return [key, journalProduct?.Arr_Id];
                            case 'item_id': return [key, journalProduct?.productId];
                            case 'item_name': return [key, journalProduct?.productNameGet];
                            case 'itemQuantity': return [key, journalProduct?.quantity];
                            case 'PaidAmount': return [key, journalProduct.Paid_Amount];
                            default: return [key, value];
                        }
                    })
                ))
                updateCostinInfo = [...excludeCurrentValue, ...reStruc];
            }
            return updateCostinInfo;
        })

    }

    const onChangeAmount = (invoice, amount) => {
        setReceiptBillInfo(pre => {
            const selectedInvoices = [...pre];

            const indexOfInvoice = selectedInvoices.findIndex(
                inv => isEqualNumber(invoice.bill_id, inv.bill_id)
            );

            if (indexOfInvoice !== -1) {
                selectedInvoices[indexOfInvoice].Credit_Amo = toNumber(amount);
            }
            return selectedInvoices;
        })
    }

    const onInputValidate = (input, max) => {
        const inputValue = checkIsNumber(input) ? RoundNumber(input) : 0;
        return inputValue < max ? inputValue : max;
    };

    const getJournalType = (typeId) => {
        return [
            {
                label: 'MATERIAL INWARD',
                value: 1
            },
            {
                label: 'OTHER GODOWN',
                value: 2
            },
            {
                label: 'PROCESSING',
                value: 3
            },
        ].find(journal => isEqualNumber(journal.value, typeId)).label
    }

    return (
        <>
            <div className="table-responsive">

                <div className="border d-flex align-items-center fw-bold text-primary justify-content-between p-2">
                    <span>Against Reference ({receiptBillInfo.length})</span>
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={() => updateFilterData('selectStockJournal', true)}
                    >Add reference</Button>
                </div>

                <ListCostingDetails
                    receiptBillInfo={receiptBillInfo}
                    setReceiptBillInfo={setReceiptBillInfo}
                    receiptCostingInfo={receiptCostingInfo}
                    setReceiptCostingInfo={setReceiptCostingInfo}
                    onInputValidate={onInputValidate}
                    onChangeAmount={onChangeAmount}
                    onSelectStockJournal={onSelectStockJournal}
                />
            </div>

            <Dialog
                open={filters.selectStockJournal}
                onClose={closeDialog} fullScreen
            >
                <DialogTitle className="d-flex justify-content-between align-items-center">
                    <span>Add Ref - Stock Journal Expences</span>
                    <IconButton onClick={closeDialog}><Close color="error" /></IconButton>
                </DialogTitle>

                <DialogContent>
                    <form onSubmit={e => {
                        e.preventDefault();
                        searchStockJournal(
                            searchFilter.reqDate,
                            searchFilter.stockJournalType,
                            searchFilter.itemFilter.map((item) => item.value),
                            searchFilter.journalVoucher.value
                        );
                    }}>
                        <div className="row">
                            {/* Date filter */}
                            <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12 p-2">
                                <label>Date<RequiredStar /></label>
                                <input
                                    value={searchFilter.reqDate}
                                    type="date"
                                    className="cus-inpt p-2 "
                                    onChange={e => setSearchFilter(pre => ({ ...pre, reqDate: e.target.value }))}
                                    required
                                />
                            </div>

                            {/* stock jounal type filter */}
                            <div className="col-xl-2 col-lg-3 col-md-4 col-sm-6 col-12 p-2">
                                <label>Stock Journal Type <RequiredStar /></label>
                                <select
                                    value={searchFilter.stockJournalType}
                                    className="cus-inpt p-2 "
                                    onChange={e => setSearchFilter(pre => ({
                                        ...pre,
                                        stockJournalType: e.target.value,
                                        journalVoucher: { label: 'ALL ', value: '' }
                                    }))}
                                    required
                                >
                                    {stockJournalTypes.map((type, typeIndex) => (
                                        <option value={type.value} key={typeIndex}>{type.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* item filter */}
                            <div className="col-lg-3 col-md-4 col-sm-6 col-12 p-2">
                                <label>Item Filter <RequiredStar /></label>
                                <Select
                                    value={searchFilter.itemFilter}
                                    onChange={e => setSearchFilter(pre => ({ ...pre, itemFilter: e }))}
                                    menuPortalTarget={document.body}
                                    options={[
                                        initialSelectValue,
                                        ...toArray(baseData.itemDropDownData).map(
                                            (item) => ({ value: item.Product_Id, label: item.Product_Name })
                                        )
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    isMulti={true}
                                    closeMenuOnSelect={false}
                                />
                            </div>

                            {/* voucher filter */}
                            <div className="col-lg-3 col-md-4 col-sm-6 col-12 p-2">
                                <label>Journal Voucher <RequiredStar /></label>
                                <Select
                                    value={searchFilter.journalVoucher}
                                    onChange={e => setSearchFilter(pre => ({ ...pre, journalVoucher: e }))}
                                    menuPortalTarget={document.body}
                                    options={[
                                        { value: '', label: 'ALL' },
                                        ...toArray(baseData.journalVoucherData).filter(
                                            fil => stringCompare(
                                                fil.Type,
                                                getJournalType(searchFilter.stockJournalType)
                                            )
                                        ).map(
                                            (voucher) => ({ value: voucher.Vocher_Type_Id, label: voucher.Voucher_Type })
                                        )
                                    ]}
                                    styles={customSelectStyles}
                                    isSearchable={true}
                                    closeMenuOnSelect={false}
                                />
                            </div>
                        </div>

                        {/* submit search */}
                        <div className="col-lg-3 col-md-4 col-sm-6 col-12 p-2 d-flex flex-column">
                            <div className="mt-auto">
                                <Button
                                    type="submit"
                                    variant="outlined"
                                    startIcon={<Search />}
                                >Search</Button>
                            </div>
                        </div>

                    </form>

                    <DisplayStockJournal
                        arrayData={toArray(baseData.stockJournalSearchResult)}
                        receiptBillInfo={receiptBillInfo}
                        onSelect={onSelectStockJournal}
                    />

                </DialogContent>
                <DialogActions>
                    <Button type="button" onClick={closeDialog}>close</Button>
                </DialogActions>
            </Dialog >
        </>
    )
}

export default ExpenceReceipt;