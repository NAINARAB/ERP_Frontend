import { useEffect, useMemo, useState } from 'react';
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { toArray } from '../../../Components/functions';

const PaymentDue = ({ loadingOn, loadingOff }) => {
    const [duePayments, setDuePayments] = useState([]);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        fetchLink({
            address: 'payment/reports/paymentDue',
            loadingOff, loadingOn
        }).then(data => {
            setDuePayments(toArray(data?.data));
        }).catch(e => console.log(e))
    }, [])

    const filteredData = useMemo(() => {
        if (!searchText) return duePayments;
        return duePayments.filter(item => 
            Object.values(item).some(value => 
                String(value).toLowerCase().includes(searchText.toLowerCase())
            )
        );
    }, [duePayments, searchText]);

    return (
        <>
            <FilterableTable 
                title="Payment Due"
                headerFontSizePx={13}
                bodyFontSizePx={12}
                EnableSerialNumber={true}
                ExcelPrintOption
                dataArray={filteredData}
                columns={[
                    createCol('voucherTypeGet', 'string', 'VoucherType'),
                    createCol('voucherNumber', 'string', 'V-Number'),
                    createCol('billDate', 'date', 'Bill-D'),
                    createCol('entryDate', 'date', 'Entry-D'),
                    createCol('qualityCondition', 'string', 'Quality'),
                    createCol('paymentDays', 'string', 'Payment Days'),
                    createCol('dueDate', 'string', 'Due Date'),
                    createCol('discount', 'number', 'Discount %'),
                    createCol('discountAmount', 'number', 'Discount Amount'),
                    createCol('daysRemaining', 'string', 'Days Remaining'),
                    createCol('retailerName', 'string', 'Vendor'),
                    createCol('invoiceValue', 'number', 'Invoice Value'),
                    createCol('amount', 'number', 'Amount'),
                    createCol('totalReference', 'number', 'Paid'),
                    createCol('dueAmount', 'number', 'Pending'),

                ]}
                ButtonArea={
                    <>
                        <input
                            type="text"
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            placeholder="Search..."
                            style={{ marginRight: '10px', padding: '5px' }}
                        />
                    </>
                }
            />
        </>
    )
}

export default PaymentDue;