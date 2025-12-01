import { useEffect, useMemo, useState } from 'react';
import { fetchLink } from "../../../Components/fetchComponent";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { toArray } from '../../../Components/functions';

const PaymentDue = ({ loadingOn, loadingOff }) => {
    const [duePayments, setDuePayments] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [reportType, setReportType] = useState('withProduct');

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

    const columns = useMemo(() => {
        if (reportType === 'withoutProduct') {
            return [
                createCol('voucherTypeGet', 'string', 'VoucherType'),
                createCol('voucherNumber', 'string', 'V-Number'),
                createCol('billDate', 'date', 'Bill-D'),
                createCol('entryDate', 'date', 'Entry-D'),
                createCol('retailerName', 'string', 'Vendor'),
                createCol('paymentDays', 'string', 'Payment Days'),
                createCol('dueDate', 'date', 'Due Date'),
                createCol('discount', 'number', 'Discount %'),
                createCol('discountAmount', 'number', 'Discount Amount'),
                createCol('invoiceValue', 'number', 'Invoice Value'),
                createCol('amount', 'number', 'Amount'),
                createCol('totalReference', 'number', 'Paid'),
                createCol('dueAmount', 'number', 'Pending')
            ]
        }
        if (reportType === 'withProduct') {
            return [
                createCol('voucherTypeGet', 'string', 'VoucherType'),
                createCol('voucherNumber', 'string', 'V-Number'),
                createCol('billDate', 'date', 'Bill-D'),
                createCol('entryDate', 'date', 'Entry-D'),
                createCol('retailerName', 'string', 'Vendor'),
                createCol('itemName', 'string', 'Item Name'),
                createCol('billQuantity', 'number', 'Bill Qty'),
                createCol('rate', 'number', 'Rate'),
                createCol('amount', 'number', 'Amount'),
                createCol('paymentDays', 'string', 'Payment Days'),
                createCol('dueDate', 'date', 'Due Date'),
                createCol('discount', 'number', 'Discount %'),
                createCol('discountAmount', 'number', 'Discount Amount'),
                createCol('invoiceValue', 'number', 'Invoice Value'),
                createCol('amount', 'number', 'Amount'),
                createCol('totalReference', 'number', 'Paid'),
                createCol('dueAmount', 'number', 'Pending')
            ]
        }
        if (reportType === 'printFormat') {
            return [
                createCol('dueDate', 'date', 'Due Date'),
                createCol('retailerName', 'string', 'Vendor'),
                createCol('itemName', 'string', 'Item Name'),
                createCol('billQuantity', 'number', 'Bill Qty'),
                createCol('rate', 'number', 'Rate'),
                createCol('invoiceValue', 'number', 'Invoice Value'),
                createCol('discount', 'number', 'Discount %'),
                createCol('totalReference', 'number', 'Paid'),
                createCol('dueAmount', 'number', 'Pending'),
                createCol('qualityCondition', 'string', 'Remarks')
            ]
        }
    }, [reportType, filteredData]);

    const displayData = useMemo(() => {
        if (reportType === 'withoutProduct') return filteredData;

        if (reportType === 'withProduct' || reportType === 'printFormat') {
            const withoutProduct = [];

            filteredData.forEach(row => {
                withoutProduct.push({
                    itemName: '',
                    billQuantity: '',
                    rate: '',
                    amount: '',
                    ...row,
                });

                row.itemData.forEach(item => {
                    withoutProduct.push({
                        retailerName: '',
                        voucherTypeGet: '',
                        id: '',
                        voucherType: '',
                        voucherNumber: '',
                        refNumber: '',
                        billDate: '',
                        entryDate: '',
                        vendorAccId: '',
                        qualityCondition: '',
                        paymentDays: '',
                        discount: '',
                        invoiceValue: '',
                        dataSource: '',
                        paymentReference: '',
                        journalReference: '',
                        totalReference: '',
                        dueAmount: '',
                        discountAmount: '',
                        amount: '',
                        dueDate: '',
                        daysRemaining: '',
                        itemName: item.itemName,
                        billQuantity: item.billQuantity,
                        rate: item.rate,
                        amount: item.amount
                    });
                });

            })
            return withoutProduct;
        }
    }, [reportType, filteredData]);

    return (
        <>
            <FilterableTable
                title="Payment Due"
                headerFontSizePx={13}
                bodyFontSizePx={12}
                EnableSerialNumber={reportType !== 'printFormat'}
                ExcelPrintOption
                dataArray={displayData}
                columns={columns}
                ButtonArea={
                    <>
                        <select
                            value={reportType}
                            onChange={e => setReportType(e.target.value)}
                            // style={{ marginRight: '10px',  padding: '5px' }}
                            className='cus-inpt w-auto'
                        >
                            <option value="withoutProduct">Report 1</option>
                            <option value="withProduct">Report 2</option>
                            <option value="printFormat">Report 3</option>
                        </select>
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