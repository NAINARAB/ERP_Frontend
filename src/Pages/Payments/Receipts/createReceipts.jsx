import { Button, Card, CardContent } from "@mui/material";
import {
    checkIsNumber,
    getSessionUser,
    isEqualNumber,
    ISOString,
    toNumber,
} from "../../../Components/functions";
import { fetchLink } from "../../../Components/fetchComponent";
import Select from "react-select";
import { useEffect, useState } from "react";
import { Search } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import DeliveryBillCard from "./billDeliveryCard";
import { receiptGeneralInfo, receiptDetailsInfo } from "./variable";
import { toast } from 'react-toastify'
import RequiredStar from "../../../Components/requiredStar";

const useQuery = () => new URLSearchParams(useLocation().search);
const CreateReceipts = ({ loadingOn, loadingOff }) => {
    const storage = getSessionUser().user;
    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const query = useQuery();

    const [salesPayments, setSalesPayments] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [baseData, setBaseData] = useState({
        salesPerson: [],
        voucherData: [],
    });
    const [receiptInfo, setReceiptInfo] = useState(receiptGeneralInfo);
    const [receiptsPaymentInfo, setReceiptsPaymentInfo] = useState([]);
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        Retailer: { value: "", label: "Search by Retailer..." },
    });

    useEffect(() => {

        fetchLink({
            address: "delivery/getRetailersWhoHasBills"
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

    }, []);

    useEffect(() => {
        if (checkIsNumber(receiptInfo.retailer_id)) {
            if (loadingOn) loadingOn();
            fetchLink({
                address: `delivery/retailerPendingBills?retailer_id=${receiptInfo.retailer_id}`,
            }).then(data => {
                if (data.success) setSalesPayments(data.data);
                else setSalesPayments([]);
            }).catch(e => console.error(e)).finally(() => {
                if (loadingOff) loadingOff();
            });
        }
    }, [receiptInfo.retailer_id])

    const resetValue = () => {
        setReceiptInfo(receiptGeneralInfo);
        setReceiptsPaymentInfo([]);
    }

    const saveReceipt = () => {
        if (loadingOn) loadingOn();
        fetchLink({
            address: `delivery/paymentCollection`,
            method: (checkIsNumber(receiptInfo.collection_id) &&  receiptInfo.collection_id > 0) ? 'PUT': 'POST',
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
                <div className="px-3 py-2">
                    <h5 className="m-0">Receipt Creation</h5>
                </div>
                <form onSubmit={e => {
                    e.preventDefault();
                    saveReceipt();
                }}>
                    <CardContent className="pb-2">
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

                        <div className="row fa-13 border-bottom pb-3">
                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Payed By</label>
                                <input
                                    className="cus-inpt p-2"
                                    value={receiptInfo.payed_by}
                                    placeholder="Owner, Shop Keeper.."
                                    onChange={e => setReceiptInfo(pre => ({ ...pre, payed_by: e.target.value }))}
                                />
                            </div>

                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Date</label>
                                <input
                                    type="date"
                                    className="cus-inpt p-2"
                                    value={receiptInfo.collection_date}
                                    onChange={e => setReceiptInfo(pre => ({ ...pre, collection_date: e.target.value }))}
                                    required
                                />
                            </div>

                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Type</label>
                                <select
                                    className="cus-inpt p-2"
                                    value={receiptInfo.collection_type}
                                    required
                                    onChange={e => setReceiptInfo(pre => ({ ...pre, collection_type: e.target.value }))}
                                >
                                    <option value="" disabled>Select</option>
                                    <option value="CASH">CASH</option>
                                    <option value="UPI">UPI</option>
                                    <option value="CHECK">CHECK</option>
                                    <option value="BANK ACCOUNT">BANK ACCOUNT</option>
                                </select>
                            </div>

                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Voucher</label>
                                <select
                                    className="cus-inpt p-2"
                                    value={receiptInfo.voucher_id}
                                    required
                                    onChange={e => setReceiptInfo(pre => ({ ...pre, voucher_id: e.target.value }))}
                                >
                                    <option value="" disabled>Select</option>
                                    {baseData.voucherData.map((vou, vouInd) => (
                                        <option value={vou.Vocher_Type_Id} key={vouInd}>{vou.Voucher_Type}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-lg-3 col-md-4 col-sm-6 p-2">
                                <label>Amount Received By</label>
                                <select
                                    className="cus-inpt p-2"
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

                        </div>

                        <div className="d-flex justify-content-end mt-2">
                            <Button
                                variant="outlined"
                                type="submit"
                                disabled={
                                    receiptsPaymentInfo.length === 0
                                    || receiptsPaymentInfo.every(bill => toNumber(bill.collected_amount) <= 0)
                                }
                            >save receipt</Button>
                        </div>
                    </CardContent>
                </form>
            </Card>

            {salesPayments.map((row, rowIndex) => (
                <DeliveryBillCard
                    loadingOff={loadingOff}
                    loadingOn={loadingOn}
                    row={row}
                    key={rowIndex}
                    collection_type={receiptInfo?.collection_type}
                    receiptsPaymentInfo={receiptsPaymentInfo}
                    setReceiptsPaymentInfo={setReceiptsPaymentInfo}
                />
            ))}
        </>
    );
};

export default CreateReceipts;
