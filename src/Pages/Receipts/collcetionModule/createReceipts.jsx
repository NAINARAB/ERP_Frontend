import { Button, Card, CardContent } from "@mui/material";
import {
    Addition,
    checkIsNumber,
    ISOString,
    RoundNumber,
    stringCompare,
    toNumber,
} from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import Select from "react-select";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { receiptGeneralInfo } from "./variable";
import { toast } from 'react-toastify'
import RequiredStar from "../../../Components/requiredStar";
import DeliveryBillTableRow from "./billDeliveryTableRow";

export const payTypeAndStatus = [
    {
        type: 'CASH',
        default: 'CREATED-CASH',
        statusOptions: ['CREATED-CASH', 'CASH-PROCESSING', 'CASH-MISSING']
    },
    {
        type: 'UPI',
        default: 'CREATED-UPI',
        statusOptions: ['CREATED-UPI', 'UPI-PROCESSING', 'UPI-NOT-RECEIVED']
    },
    {
        type: 'CHEQUE',
        default: 'CREATED-CHEQUE',
        statusOptions: ['CREATED-CHEQUE', 'CHEQUE-PROCESSING', 'CHEQUE-BOUNCE']
    },
    {
        type: 'BANK',
        default: 'CREATED-BANK-TRANSFER',
        statusOptions: ['CREATED-BANK-TRANSFER', 'BANK-PROCESSING', 'BANK-NOT-RECEIVED']
    },
];

const CreateReceipts = ({ loadingOn, loadingOff }) => {
    const navigate = useNavigate();

    const [salesPayments, setSalesPayments] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [baseData, setBaseData] = useState({
        salesPerson: [],
        voucherData: [],
        creditAccount: []
    });
    const [receiptInfo, setReceiptInfo] = useState(receiptGeneralInfo);
    const [receiptsPaymentInfo, setReceiptsPaymentInfo] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        Retailer: { value: "", label: "Search by Retailer..." },
    });

    const paymentStatus = payTypeAndStatus.find(val => val.type === receiptInfo?.collection_type)?.statusOptions || {};

    useEffect(() => {

        fetchLink({
            address: "receipt/getRetailersWhoHasBills"
        }).then(data => {
            if (data.success) setRetailers(data.data);
            else setRetailers([]);
        }).catch(e => console.error(e));

        fetchLink({
            address: `masters/users/salesPerson/dropDown`
        }).then(data => {
            if (data.success) setBaseData(pre => ({ ...pre, salesPerson: data.data }));
            else setBaseData(pre => ({ ...pre, salesPerson: [] }))
        }).catch(e => console.error(e))

        fetchLink({
            address: `masters/voucher`
        }).then(data => {
            if (data.success) setBaseData(pre => ({ ...pre, voucherData: data.data }));
            else setBaseData(pre => ({ ...pre, voucherData: [] }))
        }).catch(e => console.error(e))

        fetchLink({
            address: `receipt/creditAccounts`
        }).then(data => {
            if (data.success) setBaseData(pre => ({ ...pre, creditAccount: data.data }));
            else setBaseData(pre => ({ ...pre, creditAccount: [] }))
        }).catch(e => console.error(e))

    }, []);

    useEffect(() => {
        if (checkIsNumber(receiptInfo.retailer_id)) {
            if (loadingOn) loadingOn();
            fetchLink({
                address: `receipt/retailerBills?retailer_id=${receiptInfo.retailer_id}`,
            }).then(data => {
                if (data.success) setSalesPayments(data.data);
                else setSalesPayments([]);
            }).catch(e => console.error(e)).finally(() => {
                if (loadingOff) loadingOff();
            });
        }
    }, [receiptInfo.retailer_id])

    const totalReceiptValue = useMemo(() => {
        return receiptsPaymentInfo.reduce((acc, rec) => {
            return Addition(acc, rec?.collected_amount)
        }, 0)
    }, [receiptsPaymentInfo])

    const resetValue = () => {
        setFilters(pre => ({ ...pre, Retailer: { value: '', label: 'Search by Retailer...' } }))
        setReceiptInfo(receiptGeneralInfo);
        setReceiptsPaymentInfo([]);
        setSalesPayments([]);
    }

    const saveReceipt = () => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `receipt/collectionReceipts`,
            method: (checkIsNumber(receiptInfo.collection_id) && receiptInfo.collection_id > 0) ? 'PUT' : 'POST',
            bodyData: {
                ...receiptInfo,
                Collections: receiptsPaymentInfo
            }
        }).then(data => {
            if (data.success) {
                toast.success(data?.message || 'Receipt Created');
                resetValue();
            } else {
                toast.error(data?.message || 'Failed to create Receipt')
            }
        }).catch(e => console.error(e)).finally(() => {
            if (loadingOff) loadingOff();
        })
    }

    return (
        <>
            <Card>

                <form onSubmit={e => {
                    e.preventDefault();
                    saveReceipt();
                }}>
                    <div className="px-3 py-2 d-flex align-items-center">
                        <h5 className="m-0 flex-grow-1">Receipt Creation</h5>
                        <Button
                            variant="outlined"
                            type="button"
                            className="me-1"
                            onClick={() => navigate('/erp/crm/paymentCollection')}
                        >Back</Button>
                        <Button
                            variant="outlined"
                            type="submit"
                            disabled={
                                receiptsPaymentInfo.length === 0
                                || receiptsPaymentInfo.every(bill => toNumber(bill.collected_amount) <= 0)
                            }
                        >save receipt</Button>
                    </div>

                    <CardContent>

                        <label>Retailer</label>
                        <div className="d-flex">
                            <div style={{ width: "100%", maxWidth: "400px" }}>
                                <Select
                                    menuPortalTarget={document.body}
                                    options={[
                                        { value: "", label: "select", isDisabled: true },
                                        ...retailers.map(obj => ({
                                            value: obj?.Retailer_Id,
                                            label: obj?.Retailer_Name,
                                        })),
                                    ]}
                                    value={filters.Retailer}
                                    menu
                                    onChange={value => {
                                        setFilters(pre => ({ ...pre, Retailer: value }));
                                        setReceiptInfo(pre => ({ ...pre, retailer_id: value.value }))
                                    }}
                                    placeholder="Search by Retailer"
                                />
                            </div>
                        </div>

                        {/* row 1 */}
                        <div className="row fa-13 pb-3 mt-2">

                            {/* Date */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Date<RequiredStar /></label>
                                <input
                                    type="date"
                                    className="cus-inpt border p-2"
                                    value={receiptInfo.collection_date}
                                    onChange={e => setReceiptInfo(pre => ({ ...pre, collection_date: e.target.value }))}
                                    required
                                />
                            </div>

                            {/* voucher */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Voucher<RequiredStar /></label>
                                <select
                                    className="cus-inpt border p-2"
                                    value={receiptInfo.voucher_id}
                                    required
                                    onChange={e => setReceiptInfo(pre => ({ ...pre, voucher_id: e.target.value }))}
                                >
                                    <option value="" disabled>Select</option>
                                    {baseData.voucherData.filter(
                                        fil => stringCompare(fil.Type, 'Receipt')
                                    ).map((vou, vouInd) => (
                                        <option value={vou.Vocher_Type_Id} key={vouInd}>{vou.Voucher_Type}</option>
                                    ))}
                                </select>
                            </div>

                        </div>

                        {/* row 2 */}
                        <div className="row fa-13 pb-3">

                            {/* payment type  */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Payment Type<RequiredStar /></label>
                                <select
                                    className="cus-inpt border p-2"
                                    value={receiptInfo.collection_type}
                                    required
                                    onChange={e => setReceiptInfo(pre => ({
                                        ...pre,
                                        collection_type: e.target.value,
                                        payment_status: payTypeAndStatus.find(typ => typ.type === e.target.value)?.default
                                    }))}
                                >
                                    <option value="" disabled>Select</option>
                                    <option value="CASH">CASH</option>
                                    <option value="UPI">UPI</option>
                                    <option value="CHEQUE">CHEQUE</option>
                                    <option value="BANK">BANK</option>
                                </select>
                            </div>

                            {/* cash accounts  */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Payment Account <RequiredStar /></label>
                                <select
                                    className="cus-inpt border p-2"
                                    value={receiptInfo.collection_account}
                                    required
                                    disabled={!receiptInfo.collection_type}
                                    onChange={e => setReceiptInfo(pre => ({
                                        ...pre,
                                        collection_account: e.target.value,
                                    }))}
                                >
                                    <option value="" disabled>Select</option>
                                    {baseData.creditAccount.filter(
                                        fil => stringCompare(receiptInfo.collection_type, 'CASH')
                                            ? stringCompare(fil.Type, 'CASH')
                                            : !stringCompare(fil.Type, 'CASH')
                                    ).map(
                                        (o, i) => <option value={o?.Id} key={i}>{o?.Bank_Name}</option>
                                    )}
                                </select>
                            </div>

                            {/* payment status */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Payment Status<RequiredStar /></label>
                                <select
                                    className="cus-inpt border p-2"
                                    value={receiptInfo.payment_status}
                                    required
                                    disabled={!receiptInfo.collection_type}
                                    onChange={e => setReceiptInfo(pre => ({ ...pre, payment_status: e.target.value }))}
                                >
                                    <option value="" disabled>Select</option>
                                    {paymentStatus.map((status, ind) => (
                                        <option value={status} key={ind}>{status}</option>
                                    ))}
                                    <option value="Canceled">Canceled</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>

                        </div>

                        {/* row 3 */}
                        <div className="row fa-13 pb-3">

                            {/* payed by */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Payed By</label>
                                <input
                                    className="cus-inpt border p-2"
                                    value={receiptInfo.payed_by}
                                    placeholder="Owner, Shop Keeper.."
                                    onChange={e => setReceiptInfo(pre => ({ ...pre, payed_by: e.target.value }))}
                                />
                            </div>

                            {/* amount received by */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Amount Received By<RequiredStar /></label>
                                <select
                                    className="cus-inpt border p-2"
                                    value={receiptInfo.collected_by}
                                    onChange={e => setReceiptInfo(pre => ({ ...pre, collected_by: e.target.value }))}
                                    required
                                >
                                    <option value="" disabled>Select</option>
                                    {baseData.salesPerson.map((sp, spInd) => (
                                        <option value={sp.UserId} key={spInd}>{sp.Name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* verify date */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-1">
                                <label className="fa-14">Verify Date</label>
                                <input
                                    type="date"
                                    value={receiptInfo?.bank_date ? receiptInfo?.bank_date : ''}
                                    onChange={e => setReceiptInfo(pre => ({ ...pre, bank_date: e.target.value }))}
                                    className="cus-inpt border border p-2"
                                />
                            </div>

                            {/* verify status */}
                            <div className="col-lg-3 col-md-4 col-sm-6 p-1">
                                <label className="fa-14">Verify Status</label>
                                <select
                                    value={receiptInfo?.verify_status}
                                    onChange={e => setReceiptInfo(pre => ({ ...pre, verify_status: e.target.value }))}
                                    className="cus-inpt border border p-2"
                                >
                                    <option value={0}>Not-verified</option>
                                    <option value={1}>verified</option>
                                </select>
                            </div>

                            {/* Narration */}
                            <div className="col-lg-6 col-sm-8 p-1">
                                <label className="fa-14 w-100">Narration</label>
                                <textarea
                                    style={{ width: '100%', maxWidth: '450px' }}
                                    className="cus-inpt border p-2"
                                    value={receiptInfo?.narration}
                                    onChange={e => setReceiptInfo(pre => ({ ...pre, narration: e.target.value }))}
                                    placeholder="Narration..."
                                />
                            </div>

                            <div className="col-lg-6 col-sm-4 p-1 text-end">
                                <label className="fa-14 w-100">Total Receipt Amount</label>
                                <input
                                    className="cus-inpt bg-white p-2 w-auto border border-primary text-primary"
                                    value={RoundNumber(totalReceiptValue)}
                                    disabled
                                />
                            </div>

                        </div>

                        <div className="table-responsive">
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        {['Sno', '#', 'Invoice No', 'Date', 'Invoice Value', 'Paid', 'Pending', 'Receipts'].map(
                                            (col, colInd) => <th className="bg-light fa-13 border" key={colInd}>{col}</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesPayments.map((row, rowIndex) => (
                                        <DeliveryBillTableRow
                                            row={row}
                                            Sno={rowIndex + 1}
                                            key={rowIndex}
                                            receiptsPaymentInfo={receiptsPaymentInfo}
                                            setReceiptsPaymentInfo={setReceiptsPaymentInfo}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                    </CardContent>
                </form>
            </Card>
        </>
    );
};

export default CreateReceipts;
