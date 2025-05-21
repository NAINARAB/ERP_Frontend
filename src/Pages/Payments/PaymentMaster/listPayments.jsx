import React, { useState, useEffect } from "react";
import { Button } from '@mui/material';
import FilterableTable, { ButtonActions, createCol } from '../../../Components/filterableTable2';
import { useNavigate, useLocation } from "react-router-dom";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, isEqualNumber, ISOString, isValidDate, NumberFormat, toNumber } from "../../../Components/functions";
import { Edit, Timeline } from "@mui/icons-material";
import { useMemo } from "react";
import { paymentTypes } from "./variable";

const useQuery = () => new URLSearchParams(useLocation().search);
const defaultFilters = {
    Fromdate: ISOString(),
    Todate: ISOString(),
};

const PaymentsMasterList = ({ loadingOn, loadingOff, AddRights, EditRights, DeleteRights }) => {
    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        DebitAccount: { value: '', label: 'ALL' },
        CreditAccount: { value: '', label: 'ALL' },
        refresh: false
    });
    const [reload, setReload] = useState(false)
    const [paymentData, setPaymentData] = useState([]);

    const navigate = useNavigate();
    const location = useLocation();
    const stateDetails = location.state;
    const query = useQuery();

    useEffect(() => {
        const queryFilters = {
            Fromdate: query.get("Fromdate") && isValidDate(query.get("Fromdate"))
                ? query.get("Fromdate")
                : defaultFilters.Fromdate,
            Todate: query.get("Todate") && isValidDate(query.get("Todate"))
                ? query.get("Todate")
                : defaultFilters.Todate,
        };
        setFilters(pre => ({ ...pre, Fromdate: queryFilters.Fromdate, Todate: queryFilters.Todate }));
    }, [location.search]);

    useEffect(() => {
        const Fromdate = (stateDetails?.Fromdate && isValidDate(stateDetails?.Fromdate)) ? ISOString(stateDetails?.Fromdate) : null;
        const Todate = (stateDetails?.Todate && isValidDate(stateDetails?.Todate)) ? ISOString(stateDetails?.Todate) : null;
        if (Fromdate && Todate) {
            updateQueryString({ Fromdate, Todate });
            setFilters(pre => ({ ...pre, Fromdate: ISOString(stateDetails.Fromdate), Todate: stateDetails.Todate }));
            setReload(pre => !pre);
        }
    }, [stateDetails])

    useEffect(() => {
        const From = filters.Fromdate, To = filters.Todate;

        fetchLink({
            address: `payment/paymentMaster?Fromdate=${From}&Todate=${To}`,
            loadingOff, loadingOn
        }).then(data => {
            if (data.success) {
                setPaymentData(data.data)
            }
        }).catch(e => console.error(e))
    }, [reload]);

    const updateQueryString = (newFilters) => {
        const params = new URLSearchParams(newFilters);
        navigate(`?${params.toString()}`, { replace: true });
    };

    const TotalPayment = useMemo(() => paymentData.reduce(
        (acc, orders) => Addition(acc, orders?.debit_amount), 0
    ), [paymentData]);

    return (
        <>
            <FilterableTable
                title='Payments'
                headerFontSizePx={12}
                bodyFontSizePx={12}
                ButtonArea={
                    <>
                        {AddRights && (
                            <Button
                                onClick={() => navigate('create')}
                                variant="outlined"
                            >Add</Button>
                        )}
                        {AddRights && (
                            <Button
                                onClick={() => navigate('addReference')}
                                variant="outlined"
                                className="me-2"
                            >Add Reference</Button>
                        )}
                        {toNumber(TotalPayment) > 0 && <h6 className="m-0 text-end text-muted px-3">Total: {NumberFormat(TotalPayment)}</h6>}
                    </>
                }
                dataArray={paymentData}
                columns={[
                    createCol('payment_date', 'date', 'Date'),
                    createCol('payment_invoice_no', 'string', 'Payment ID'),
                    createCol('debit_amount', 'number', 'Amount'),
                    createCol('debit_ledger_name', 'string', 'Debit-Acc'),
                    createCol('credit_ledger_name', 'string', 'Credit-Acc'),
                    createCol('Voucher_Type', 'string', 'Voucher'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Bill Type',
                        isCustomCell: true,
                        Cell: ({ row }) => paymentTypes.find(type => isEqualNumber(type.value, row.pay_bill_type))?.label
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Action',
                        isCustomCell: true,
                        Cell: ({ row }) => (
                            <ButtonActions
                                buttonsData={[
                                    {
                                        name: 'Edit',
                                        icon: <Edit />,
                                        onclick: () => navigate('create', { state: row }),
                                        disabled: !EditRights
                                    },
                                    {
                                        name: 'Add Reference',
                                        icon: <Timeline />,
                                        onclick: () => navigate('addReference', { state: row }),
                                        disabled: (
                                            !EditRights 
                                            || isEqualNumber(row.pay_bill_type, 2) 
                                            || isEqualNumber(row.pay_bill_type, 4) 
                                        )
                                    },
                                    // {

                                    // }
                                ]}
                            />
                        )
                    }
                ]}
                EnableSerialNumber
            />
        </>
    )
}

export default PaymentsMasterList;