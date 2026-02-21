import { useEffect, useState } from "react"
import { fetchLink } from "../../../Components/fetchComponent";
import { ISOString } from "../../../Components/functions";
import AppTableComponent from "../../../Components/appTable/appTableComponent";
import { IconButton } from "@mui/material";
import AppDialog from "../../../Components/appDialogComponent";
import { FilterAlt } from "@mui/icons-material";

const transformPaymentDueData = (data) => {
    let rows = [];

    data.forEach((entry, index) => {
        const products = entry.product || [];
        const pending = (entry.invoiceValue || 0) - (entry.totalReference || 0);

        // Header row for the invoice
        rows.push({
            SNo: index + 1,
            Con: entry.branchNameGet || '',
            DueDate: entry.paymentDueDate,
            RetailerName: entry.retailerNameGet || '',
            KGS: '',
            Rate: '',
            DIS: entry.paymentDueDays || '',
            BillAmt: entry.invoiceValue || 0,
            Paid: entry.totalReference || 0,
            Pending: pending,
            Remarks: '',
            _isHeader: true,
        });

        // Sub-rows for each product
        products.forEach((prod) => {
            rows.push({
                SNo: '',
                Con: '',
                DueDate: '',
                RetailerName: prod.productNameGet || '',
                KGS: prod.kgsValue || '',
                Rate: prod.rateValue || '',
                DIS: '',
                BillAmt: '',
                Paid: '',
                Pending: '',
                Remarks: '',
                _isHeader: false,
            });
        });
    });

    return rows;
};

const PurchasePaymentDue = ({ loadingOn, loadingOff }) => {
    const [reportData, setReportData] = useState([]);

    const [filters, setFilters] = useState({
        Fromdate: ISOString(),
        Todate: ISOString(),
        Retailer: { value: '', label: 'ALL' },
        VoucherType: { value: '', label: 'ALL' },
        filterItems: { value: '', label: 'ALL' },
        Cancel_status: '',
        refreshCount: 0,
        filterDialog: false
    })

    useEffect(() => {
        fetchLink({
            address: `purchase/invoice/paymentDue?Fromdate=${filters.Fromdate}&Todate=${filters.Todate}`,
            loadingOff, loadingOn
        }).then(data => {
            if (data.success) {
                setReportData(transformPaymentDueData(data.data));
            }
        }).catch(e => console.error(e))
    }, [filters.refreshCount]);

    return (
        <>
            <AppTableComponent
                dataArray={reportData}
                columns={[
                    { Field_Name: 'SNo', ColumnHeader: 'No', Fied_Data: 'string', isVisible: 1 },
                    { Field_Name: 'Con', ColumnHeader: 'Con', Fied_Data: 'string', isVisible: 1 },
                    { Field_Name: 'DueDate', ColumnHeader: 'Due Date', Fied_Data: 'date', isVisible: 1 },
                    { Field_Name: 'RetailerName', ColumnHeader: 'Retailer Name', Fied_Data: 'string', isVisible: 1 },
                    { Field_Name: 'KGS', ColumnHeader: 'KGS', Fied_Data: 'number', isVisible: 1 },
                    { Field_Name: 'Rate', ColumnHeader: 'Rate', Fied_Data: 'number', isVisible: 1 },
                    { Field_Name: 'DIS', ColumnHeader: 'DIS', Fied_Data: 'string', isVisible: 1 },
                    { Field_Name: 'BillAmt', ColumnHeader: 'Bill Amt', Fied_Data: 'number', isVisible: 1 },
                    { Field_Name: 'Paid', ColumnHeader: 'Paid', Fied_Data: 'number', isVisible: 1 },
                    { Field_Name: 'Pending', ColumnHeader: 'Pending', Fied_Data: 'number', isVisible: 1 },
                    { Field_Name: 'Remarks', ColumnHeader: 'Remarks', Fied_Data: 'string', isVisible: 1 },
                ]}
                title="Payment Due"
                // stateName="paymentDue"
                stateUrl="purchase/invoice/paymentDue"
                stateGroup="paymentDue"
                PDFPrintOption={true}
                ExcelPrintOption={true}
                MenuButtons={[]}
                initialPageCount={20}
                CellSize="small"
                maxHeightOption={true}
                bodyFontSizePx={12}
                headerFontSizePx={12}
                enableGlobalSearch={true}
                loadingOn={loadingOn}
                loadingOff={loadingOff}
                ButtonArea={
                    <>
                        <IconButton
                            onClick={() => setFilters({ ...filters, filterDialog: true })}
                        >
                            <FilterAlt />
                        </IconButton>
                    </>
                }
            />

            <AppDialog
                open={filters.filterDialog}
                onClose={() => setFilters({ ...filters, filterDialog: false })}
                title="Filter"
                maxWidth="sm"
                fullWidth
                onSubmit={() => setFilters(pre => ({ ...pre, refreshCount: ++pre.refreshCount }))}
            >
                <div className="table-responsive">
                    <table className="table">
                        <tbody>
                            <tr>
                                <td>From Date</td>
                                <td>
                                    <input
                                        type="date"
                                        className="cus-inpt"
                                        value={filters.Fromdate}
                                        onChange={(e) => setFilters({ ...filters, Fromdate: e.target.value })}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td>To Date</td>
                                <td>
                                    <input
                                        type="date"
                                        className="cus-inpt"
                                        value={filters.Todate}
                                        onChange={(e) => setFilters({ ...filters, Todate: e.target.value })}
                                    />
                                </td>
                            </tr>
                            {/* <tr>
                                <td>Branch</td>
                                <td>
                                    <select value={filters.Branch} onChange={(e) => setFilters({ ...filters, Branch: e.target.value })}>
                                        <option value="">All</option>
                                        <option value="Branch1">Branch1</option>
                                        <option value="Branch2">Branch2</option>
                                    </select>
                                </td>
                            </tr> */}
                        </tbody>
                    </table>
                </div>
            </AppDialog>
        </>
    )
}

export default PurchasePaymentDue