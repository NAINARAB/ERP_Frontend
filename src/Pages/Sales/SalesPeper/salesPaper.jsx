import { useEffect, useMemo, useState } from "react";
import { fetchLink } from "../../../Components/fetchComponent";
import { Addition, ISOString, RoundNumber, stringCompare, toNumber } from "../../../Components/functions";
import FilterableTable, { createCol } from "../../../Components/filterableTable2";
import { IconButton } from "@mui/material";
import { Search } from "@mui/icons-material";
import DownloadIcon from "@mui/icons-material/Download";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
const getStaff = (staffs, type) =>
    staffs
        .filter(s => s.empType === type)
        .map(s => s.empName)
        .join(", ");

// const transformSalesVoucherData = (data) => {
//     let transformedData = [];
//     let voucherGroup = [];

//     data.forEach((entry, entryIndex) => {

//         const totalBilledQty = entry.productDetails.reduce(
//             (sum, item) => Addition(sum, item.billedQuantity),
//             0
//         );

//         const totalUnitQty = entry.productDetails.reduce(
//             (sum, item) => Addition(sum, item.actUnitQuantity),
//             0
//         );

//         if (voucherGroup.findIndex(voucher => stringCompare(voucher, entry.voucheGet)) === -1) {
//             voucherGroup.push(entry.voucheGet);
//             transformedData.push({
//                 SNo: '',
//                 unitDifference: '',
//                 quantityDifference: '',
//                 particular: entry.voucheGet,
//                 voucherNoOrRate: '',
//                 unitQuantity: '',
//                 billedQuantity: '',
//                 broker: '',
//                 transporter: '',
//                 loadMan: '',
//                 rowType: "VOUCHER-HEADER"
//             });
//         }

//         // ---------- HEADER ROW (Voucher + Retailer) ----------
//         transformedData.push({
//             SNo: entryIndex + 1,
//             unitDifference: '',
//             quantityDifference: '',
//             particular: entry.retailerGet,
//             voucherNoOrRate: entry.voucherNumber,
//             unitQuantity: totalUnitQty,
//             billedQuantity: totalBilledQty,
//             broker: getStaff(entry.staffDetails || [], "Broker"),
//             transporter: getStaff(entry.staffDetails || [], "Transport"),
//             loadMan: getStaff(entry.staffDetails || [], "Load Man"),
//             rowType: "HEADER"
//         });

//         // ---------- ITEM ROWS ----------
//         entry.productDetails.forEach((item) => {
//             const unitDifference = Math.round(Number(item.actUnitQuantity)) - Number(item.actUnitQuantity);

//             transformedData.push({
//                 SNo: "",
//                 unitDifference: unitDifference !== 0 ? RoundNumber(unitDifference) : '',
//                 quantityDifference: item.quantityDifference || "",
//                 particular: item.itemNameGet,
//                 voucherNoOrRate: item.billedRate || "",
//                 unitQuantity: item.actUnitQuantity || "",
//                 billedQuantity: item.billedQuantity || "",
//                 broker: "",
//                 transporter: "",
//                 loadMan: "",
//                 rowType: "ITEM"
//             });
//         });
//     });

//     return transformedData;
// };

const transformSalesVoucherData = (data = []) => {
    const transformedData = [];

    let currentVoucherType = null;

    let totalUnitQuantity = 0;
    let totalBilledQuantity = 0;
    let totalUnitDifference = 0;

    const pushCumulativeRow = (voucherType) => {
        transformedData.push({
            SNo: '',
            unitDifference: RoundNumber(totalUnitDifference),
            quantityDifference: '',
            particular: `${voucherType} TOTAL`,
            voucherNoOrRate: '',
            unitQuantity: RoundNumber(totalUnitQuantity),
            billedQuantity: RoundNumber(totalBilledQuantity),
            tripNUmber:'',
            broker: '',
            transporter: '',
            loadMan: '',
            rowType: "VOUCHER-TOTAL"
        });
    };

    data.forEach((entry, entryIndex) => {

        const tripNumber=entry.tripNumber || ''

        if (currentVoucherType && currentVoucherType !== entry.voucheGet) {
            pushCumulativeRow(currentVoucherType);

            totalUnitQuantity = 0;
            totalBilledQuantity = 0;
            totalUnitDifference = 0;
        }

        if (currentVoucherType !== entry.voucheGet) {
            currentVoucherType = entry.voucheGet;

            transformedData.push({
                SNo: '',
                unitDifference: '',
                quantityDifference: '',
                particular: entry.voucheGet,
                voucherNoOrRate: '',
                unitQuantity: '',
                billedQuantity: '',
                broker: '',
                // tripNumber:tripNumber,
                transporter: '',
                loadMan: '',
                rowType: "VOUCHER-HEADER"
            });
        }

        const invoiceBilledQty = entry.productDetails.reduce(
            (sum, item) => Addition(sum, item.billedQuantity),
            0
        );

        const invoiceUnitQty = entry.productDetails.reduce(
            (sum, item) => Addition(sum, item.actUnitQuantity),
            0
        );

        totalUnitQuantity += invoiceUnitQty;
        totalBilledQuantity += invoiceBilledQty;

        // ---------- HEADER ROW ----------
        transformedData.push({
            SNo: entryIndex + 1,
            unitDifference: '',
            quantityDifference: '',
            particular: entry.retailerGet,
            voucherNoOrRate: entry.voucherNumber,
            unitQuantity: invoiceUnitQty,
            billedQuantity: invoiceBilledQty,
            broker: getStaff(entry.staffDetails || [], "Broker"),
            transporter: getStaff(entry.staffDetails || [], "Transport"),
            loadMan: getStaff(entry.staffDetails || [], "Load Man"),
              tripNumber: tripNumber,
            rowType: "HEADER"
        });

        entry.productDetails.forEach((item) => {
            const unitDiff =
                Math.round(Number(item.actUnitQuantity)) -
                Number(item.actUnitQuantity);

            if (unitDiff !== 0) {
                totalUnitDifference += unitDiff;
            }

            transformedData.push({
                SNo: '',
                unitDifference: unitDiff !== 0 ? RoundNumber(unitDiff) : '',
                quantityDifference: item.quantityDifference || '',
                particular: item.itemNameGet,
                voucherNoOrRate: item.billedRate || '',
                unitQuantity: item.actUnitQuantity || '',
                billedQuantity: item.billedQuantity || '',
                tripNumber: tripNumber,
                broker: '',
                transporter: '',
                loadMan: '',
                rowType: "ITEM"
            });
        });
    });

    if (currentVoucherType) {
        pushCumulativeRow(currentVoucherType);
    }

    return transformedData;
};

const SalesInvoicePaper = ({ loadingOn, loadingOff }) => {
    const [reortData, setReportData] = useState([]);
    const [filter, setFilter] = useState({
        reqDate: ISOString(),
        fetchTrigger: 0,
        // reqDate: '2025-12-29',
    })


const downloadExcel = async (rows) => {
    if (!rows || rows.length === 0) {
        alert("No data to export");
        return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Invoice Paper");

    // 🔹 HEADER ROW
    const header = [
        "SNo",
        "Unit Diff",
        "Diff",
        "Particular",
        "Vou.No / Rate",
        "Act Qty",
        "Bill Qty",
        "Broker",
        "Transporter",
        "Load Man"
    ];

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


    let overallActQty = 0;
    let overallBillQty = 0;

    rows.forEach(rowData => {
   if (rowData.rowType === "HEADER") {
        overallActQty += Number(rowData.unitQuantity || 0);
        overallBillQty += Number(rowData.billedQuantity || 0);
    }


        const row = worksheet.addRow([
            rowData.SNo || "",
            rowData.unitDifference || "",
            rowData.quantityDifference || "",
            rowData.particular || "",
            rowData.voucherNoOrRate || "",
            rowData.unitQuantity || "",
            rowData.billedQuantity || "",
            rowData.broker || "",
            rowData.transporter || "",
            rowData.loadMan || ""
        ]);

        row.eachCell((cell, colNumber) => {
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" },
                bottom: { style: "thin" }
            };

            cell.alignment = {
                vertical: "middle",
                horizontal: colNumber === 4 ? "left" : "center"
            };

     
            if (rowData.rowType === "VOUCHER-HEADER") {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "4472C4" } 
                };
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
            }

    
            if (rowData.rowType === "HEADER") {
                cell.font = { bold: true, color: { argb: "1F4E79" } };
            }

          
            if (rowData.rowType === "ITEM") {
                cell.font = { color: { argb: "000000" } };
            }

       
            if (rowData.rowType === "VOUCHER-TOTAL") {
                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "D9D9D9" }
                };
                cell.font = { bold: true };
            }
        });
    });

    const totalRow = worksheet.addRow([
        "",
        "",
        "",
        "OVERALL TOTAL",
        "",
        overallActQty,
        overallBillQty,
        "",
        "",
        ""
    ]);

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
    worksheet.columns = [
        { width: 6 },
        { width: 10 },
        { width: 10 },
        { width: 45 },
        { width: 18 },
        { width: 10 },
        { width: 10 },
        { width: 20 },
        { width: 20 },
        { width: 20 }
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Sales_Invoice_Paper.xlsx");
};
//     worksheet.columns = [
//         { width: 6 },
//         { width: 10 },
//         { width: 10 },
//         { width: 45 },
//         { width: 18 },
//         { width: 10 },
//         { width: 10 },
//         { width: 20 },
//         { width: 20 },
//         { width: 20 }
//     ];

//     const buffer = await workbook.xlsx.writeBuffer();
//     saveAs(new Blob([buffer]), "Sales_Invoice_Paper.xlsx");
// };




    useEffect(() => {
        fetchLink({
            address: `sales/salesInvoice/salesInvoicePaper?reqDate=${filter.reqDate}`,
            loadingOn,
            loadingOff,
        }).then((data) => {
            setReportData(data.data)
        }).catch(console.error);
    }, [filter.fetchTrigger]);

    const displayData = useMemo(() => transformSalesVoucherData(reortData), [reortData]);

    const fetchSalesInvoices = () => setFilter((pre) => ({ ...pre, fetchTrigger: pre.fetchTrigger + 1 }));

    const headerColor = (type) => {
        if ('HEADER' === type) return ' text-primary fw-bold ';
        if ('ITEM' === type) return '';
        if ('VOUCHER-HEADER' === type) return ' text-success fw-bold ';
        if ('VOUCHER-TOTAL' === type) return ' fw-bold ';
    }

    return (
        <div>
            <FilterableTable
                headerFontSizePx={11}
                bodyFontSizePx={11}
                title="Sales Invoice Paper"
                dataArray={displayData}
                maxHeightOption
                ExcelPrintOption
                PDFPrintOption
                columns={[
                    createCol('SNo', 'number', 'S.No'),
                    createCol('unitDifference', 'number', 'Unit Diff'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Diff',
                        Field_Name: 'quantityDifference',
                        Fied_Data: 'number',
                        tdClass: ({ row }) => headerColor(row.rowType)
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Particulars',
                        Field_Name: 'particular',
                        Fied_Data: 'string',
                        tdClass: ({ row }) => headerColor(row.rowType)
                    },
                      createCol('tripNumber', 'string', 'Trip_No'),
                    {
                        isVisible: 1,
                        ColumnHeader: 'Vou.No / Rate',
                        Field_Name: 'voucherNoOrRate',
                        Fied_Data: 'string',
                        tdClass: ({ row }) => headerColor(row.rowType)
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Act Qty',
                        Field_Name: 'unitQuantity',
                        Fied_Data: 'number',
                        tdClass: ({ row }) => headerColor(row.rowType)
                    },
                    {
                        isVisible: 1,
                        ColumnHeader: 'Bill Qty',
                        Field_Name: 'billedQuantity',
                        Fied_Data: 'number',
                        tdClass: ({ row }) => headerColor(row.rowType)
                    },
                    createCol('broker', 'string', 'Broker Name'),
                    createCol('transporter', 'string', 'Transporter'),
                    createCol('loadMan', 'string', 'Load Man'),
                ]}
                ButtonArea={
                    <>
                        <IconButton size="small" onClick={fetchSalesInvoices}>
                            <Search />
                        </IconButton>
                        
        <IconButton
            size="small"
            color="success"
            onClick={() => downloadExcel(displayData)}
            title="Download Excel"
        >
            <DownloadIcon />
        </IconButton>

                        <input
                            className="cus-inpt w-auto"
                            type="date"
                            value={filter.reqDate}
                            onChange={(e) => setFilter({ ...filter, reqDate: e.target.value })}
                        />
                    </>
                }
            />
        </div>
    );
};

export default SalesInvoicePaper;