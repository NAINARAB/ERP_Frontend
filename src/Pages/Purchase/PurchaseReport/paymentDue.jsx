import { useEffect, useState } from "react"
import { fetchLink } from "../../../Components/fetchComponent";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { getSessionFiltersByPageId, ISOString, NumberFormat, reactSelectFilterLogic, setSessionFilters } from "../../../Components/functions";
import AppTableComponent from "../../../Components/appTable/appTableComponent";
import { IconButton } from "@mui/material";
import AppDialog from "../../../Components/appDialogComponent";
import { FilterAlt, FormatListNumbered, Delete } from "@mui/icons-material";
import { defineColumns } from "../../../Components/appTable";
import { useLocation } from "react-router-dom";
import Select from 'react-select'
import { customSelectStyles } from "../../../Components/tablecolumn";

const transformPaymentDueData = (data) => {
    let rows = [];

    data.forEach((entry, index) => {
        const products = entry.product || [];
        const pending = (entry.invoiceValue || 0) - (entry.totalReference || 0);

        // Header row for the invoice
        rows.push({
            SNo: index + 1,
            invoiceDate: entry.invoiceDate || '',
            invoiceNumber: entry.invoiceNumber || '',
            voucherType: entry.voucherTypeGet || '',
            Con: entry.branchNameGet || '',
            DueDate: entry.paymentDueDate,
            RetailerName: entry.retailerNameGet || '',
            KGS: '',
            Bags: '',
            Rate: '',
            DIS: entry.discountValue || '',
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
                invoiceDate: '',
                invoiceNumber: '',
                voucherType: '',
                DueDate: '',
                RetailerName: prod.productNameGet || '',
                KGS: prod.kgsValue || '',
                Bags: prod.bagsValue || '',
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

const defaultFilterValues = {
    Fromdate: ISOString(),
    Todate: ISOString(),
    Retailer: { value: '', label: 'ALL' },
    VoucherType: { value: '', label: 'ALL' },
    filterItems: { value: '', label: 'ALL' }
}

const PurchasePaymentDue = ({ loadingOn, loadingOff, pageID }) => {
    const [reportData, setReportData] = useState([]);
    const [rawReportData, setRawReportData] = useState([]);
    const [customOrderDialog, setCustomOrderDialog] = useState(false);
    const location = useLocation()
    const sessionValue = sessionStorage.getItem('filterValues');
    const [filterValues, setFilterValues] = useState({
        voucherType: [],
        created_by: []
    })
    const [filters, setFilters] = useState({
        ...defaultFilterValues,
        refreshCount: 0,
        filterDialog: false
    })

    const [tableDataState, setTableDataState] = useState([])
    const [tableColumnsState, setTableColumnsState] = useState([])

    const downloadExcel = async (rows, columns) => {
        if (!rows || rows.length === 0) {
            alert("No data to export");
            return;
        }

        const visibleCols = [...(columns || [])]
            .filter(col => col.isVisible === 1 || col.isVisible === true)
            .sort((a, b) => (a.OrderBy || 0) - (b.OrderBy || 0));

        if (visibleCols.length === 0) {
            alert("No columns visible to export");
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Payment Due");

        // 🔹 HEADER ROW
        const header = visibleCols.map(col => col.ColumnHeader || col.Field_Name);

        worksheet.addRow(header);

        worksheet.getRow(1).eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFF00" }
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
                bottom: { style: "thin" }
            };
        });

        let totalBillAmt = 0;
        let totalPaid = 0;
        let totalPending = 0;
        let totalKgs = 0;
        let totalBags = 0;

        rows.forEach(rowData => {
            if (rowData._isHeader) {
                totalBillAmt += Number(rowData.BillAmt || 0);
                totalPaid += Number(rowData.Paid || 0);
                totalPending += Number(rowData.Pending || 0);
            } else {
                totalKgs += Number(rowData.KGS || 0);
                totalBags += Number(rowData.Bags || 0);
            }

            const rowValues = visibleCols.map(col => {
                const val = rowData[col.Field_Name];
                if (col.Fied_Data === 'date' && val) {
                    return new Date(val).toLocaleDateString('en-GB');
                }
                return val !== undefined && val !== null ? val : "";
            });

            const row = worksheet.addRow(rowValues);

            row.eachCell((cell, colNumber) => {
                let cellData = rowValues[colNumber - 1]; // To align cell behavior, check type of data

                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    right: { style: "thin" },
                    bottom: { style: "thin" }
                };

                cell.alignment = {
                    vertical: "middle",
                    horizontal: typeof cellData === 'number' || (visibleCols[colNumber - 1].Fied_Data === "number" && !isNaN(Number(cellData))) ? "right" : "left"
                };

                if (rowData._isHeader) {
                    cell.font = { bold: true, color: { argb: "1F4E79" } };
                } else {
                    cell.font = { color: { argb: "000000" } };
                }
            });
        });

        const totalRowValues = visibleCols.map(col => {
            if (col.Field_Name === 'KGS') return totalKgs;
            if (col.Field_Name === 'Bags') return totalBags;
            if (col.Field_Name === 'BillAmt') return totalBillAmt;
            if (col.Field_Name === 'Paid') return totalPaid;
            if (col.Field_Name === 'Pending') return totalPending;
            return "";
        });

        const totalIndex = visibleCols.findIndex(c => c.Field_Name === 'RetailerName');
        if (totalIndex !== -1) {
            totalRowValues[totalIndex] = "OVERALL TOTAL";
        } else {
            const firstNumIdx = visibleCols.findIndex(c => ['KGS', 'Bags', 'BillAmt'].includes(c.Field_Name));
            if (firstNumIdx > 0) totalRowValues[firstNumIdx - 1] = "OVERALL TOTAL";
            else totalRowValues[0] = "OVERALL TOTAL";
        }

        const totalRow = worksheet.addRow(totalRowValues);

        totalRow.eachCell(cell => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: "center", vertical: "middle" };
            cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "C6E0B4" }
            };
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
                bottom: { style: "thin" }
            };
        });

        // 🔹 COLUMN WIDTHS
        worksheet.columns = visibleCols.map(col => {
            let width = 15;
            if (col.Field_Name === 'SNo') width = 6;
            if (col.Field_Name === 'Con') width = 15;
            if (col.Field_Name === 'DueDate' || col.Field_Name === 'invoiceDate') width = 12;
            if (col.Field_Name === 'RetailerName') width = 45;
            if (col.Field_Name === 'KGS' || col.Field_Name === 'Bags' || col.Field_Name === 'Rate' || col.Field_Name === 'DIS') width = 10;
            if (col.Field_Name === 'invoiceNumber' || col.Field_Name === 'voucherType') width = 18;
            if (col.Field_Name === 'Remarks') width = 20;
            return { width };
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Payment_Due.xlsx");
    };

    useEffect(() => {
        fetchLink({
            address: `purchase/invoice/filterValues`
        }).then(data => {
            if (data.success) {
                setFilterValues({
                    voucherType: data.others?.voucherType,
                    created_by: data.others?.created_by
                });
            }
        }).catch(e => console.error(e))
    }, [])

    useEffect(() => {
        const { Fromdate, Todate, VoucherType } = filters
        fetchLink({
            address: `purchase/invoice/paymentDue?Fromdate=${Fromdate}&Todate=${Todate}&VoucherType=${VoucherType.value}`,
            loadingOff, loadingOn
        }).then(data => {
            if (data.success) {
                const dataWithOrder = data.data.map((item) => ({ ...item, customOrder: '' }));
                setRawReportData(dataWithOrder);
                setReportData(transformPaymentDueData(dataWithOrder));
            }
        }).catch(e => console.error(e))
    }, [filters.refreshCount, location]);

    useEffect(() => {
        const { Fromdate, Todate, VoucherType = defaultFilterValues.VoucherType } = getSessionFiltersByPageId(pageID);
        setFilters(pre => ({ ...pre, Fromdate, Todate, VoucherType, refreshCount: pre.refreshCount + 1 }));
    }, [sessionValue, pageID, location]);

    const getClass = (row) => {
        if (row?._isHeader) return ' fw-bold  ';
        else return '';
    }

    const handleFilteredDataChange = (newData, newColumns) => {
        setTableDataState(newData);
        if (newColumns) setTableColumnsState(newColumns);
    };

    return (
        <>
            <AppTableComponent
                dataArray={reportData}
                columns={defineColumns([
                    { Field_Name: 'SNo', ColumnHeader: 'No', Fied_Data: 'string', isVisible: 1, tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'Con', ColumnHeader: 'Con', Fied_Data: 'string', isVisible: 1, tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'invoiceDate', ColumnHeader: 'Entry Date', Fied_Data: 'date', isVisible: 0, tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'DueDate', ColumnHeader: 'Due Date', Fied_Data: 'date', isVisible: 1, tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'invoiceNumber', ColumnHeader: 'Voucher No', Fied_Data: 'string', isVisible: 0, tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'voucherType', ColumnHeader: 'Voucher Type', Fied_Data: 'string', isVisible: 0, tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'RetailerName', ColumnHeader: 'Vendor', Fied_Data: 'string', isVisible: 1, tdClass: ({ row }) => getClass(row), FooterCell: () => '' },
                    { Field_Name: 'KGS', ColumnHeader: 'KGS', Fied_Data: 'number', isVisible: 1, tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'Bags', ColumnHeader: 'Bags', Fied_Data: 'number', isVisible: 1, tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'Rate', ColumnHeader: 'Rate', Fied_Data: 'number', isVisible: 1, Aggregation: 'mean', tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'DIS', ColumnHeader: 'DIS', Fied_Data: 'string', isVisible: 1, Aggregation: 'mean', tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'BillAmt', ColumnHeader: 'Bill Amt', Fied_Data: 'number', isVisible: 1, tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'Paid', ColumnHeader: 'Paid', Fied_Data: 'number', isVisible: 1, tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'Pending', ColumnHeader: 'Pending', Fied_Data: 'number', isVisible: 1, tdClass: ({ row }) => getClass(row) },
                    { Field_Name: 'Remarks', ColumnHeader: 'Remarks', Fied_Data: 'string', isVisible: 1, tdClass: ({ row }) => getClass(row) },
                ])}
                title="Payment Due"
                stateUrl="purchase/invoice/paymentDue"
                stateGroup="paymentDue"
                PDFPrintOption={true}
                ExcelPrintOption={() => downloadExcel(tableDataState, tableColumnsState)}
                MenuButtons={[]}
                initialPageCount={20}
                CellSize="small"
                maxHeightOption={true}
                bodyFontSizePx={12}
                headerFontSizePx={12}
                enableGlobalSearch={true}
                loadingOn={loadingOn}
                loadingOff={loadingOff}
                onFilteredDataChange={handleFilteredDataChange}
                ButtonArea={
                    <>
                        <IconButton
                            onClick={() => setCustomOrderDialog(true)}
                            title="Custom Order"
                        >
                            <FormatListNumbered />
                        </IconButton>
                        <IconButton
                            onClick={() => setFilters({ ...filters, filterDialog: true })}
                        >
                            <FilterAlt />
                        </IconButton>
                    </>
                }
            />

            <AppDialog
                open={customOrderDialog}
                onClose={() => setCustomOrderDialog(false)}
                title="Custom Order Invoices"
                maxWidth="lg"
                fullWidth
                onSubmit={() => {
                    const sortedData = [...rawReportData].sort((a, b) => {
                        const orderA = parseInt(a.customOrder) || Number.MAX_SAFE_INTEGER;
                        const orderB = parseInt(b.customOrder) || Number.MAX_SAFE_INTEGER;
                        return orderA - orderB;
                    });
                    setRawReportData(sortedData);
                    setReportData(transformPaymentDueData(sortedData));
                    setCustomOrderDialog(false);
                }}
            >
                <div className="table-responsive" style={{ maxHeight: '60vh' }}>
                    <table className="table table-bordered table-sm text-center align-middle">
                        <thead className="table-light sticky-top">
                            <tr>
                                <th className="fa-12">Invoice Number</th>
                                <th className="fa-12">Date</th>
                                <th className="fa-12">Retailer</th>
                                <th className="fa-12">Value</th>
                                <th className="fa-12" style={{ width: '100px' }}>Order</th>
                                <th className="fa-12" style={{ width: '50px' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rawReportData.map((inv, index) => (
                                <tr key={inv.invoiceId || index}>
                                    <td className="fa-12">{inv.invoiceNumber}</td>
                                    <td className="fa-12">{new Date(inv.invoiceDate).toLocaleDateString('en-GB')}</td>
                                    <td className="fa-12">{inv.retailerNameGet}</td>
                                    <td className="fa-12">{NumberFormat(inv.invoiceValue)}</td>
                                    <td className="fa-12">
                                        <input
                                            type="number"
                                            className="cus-inpt text-center p-2"
                                            value={inv.customOrder}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setRawReportData(prev => {
                                                    const newData = [...prev];
                                                    newData[index].customOrder = val;
                                                    return newData;
                                                });
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <IconButton
                                            color="error"
                                            size="small"
                                            onClick={() => {
                                                setRawReportData(prev => prev.filter((_, i) => i !== index));
                                            }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </td>
                                </tr>
                            ))}
                            {rawReportData.length === 0 && (
                                <tr>
                                    <td colSpan="6">No invoices found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </AppDialog>

            <AppDialog
                open={filters.filterDialog}
                onClose={() => setFilters({ ...filters, filterDialog: false })}
                title="Filter"
                maxWidth="sm"
                fullWidth
                onSubmit={() => {
                    setSessionFilters({
                        Fromdate: filters?.Fromdate,
                        Todate: filters.Todate,
                        VoucherType: filters.VoucherType,
                        pageID,
                    });
                    setFilters(pre => ({ ...pre, filterDialog: false }));
                }}
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
                            <tr>
                                <td>Voucher Type</td>
                                <td>
                                    <Select
                                        value={filters.VoucherType}
                                        onChange={(e) => setFilters({ ...filters, VoucherType: e })}
                                        options={[
                                            { value: '', label: 'ALL' },
                                            ...filterValues.voucherType
                                        ]}
                                        styles={customSelectStyles}
                                        menuPortalTarget={document.body}
                                        isSearchable={true}
                                        filterOption={reactSelectFilterLogic}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </AppDialog>
        </>
    )
}

export default PurchasePaymentDue