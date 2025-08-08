import { useEffect } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const XlPreviewModal = ({ open, onClose, brokerData, transactionType, fromDate, toDate }) => {
    const items = brokerData?.Items || [];

    let totalBrokerage;
    if (transactionType === 'salesNagal') {
        totalBrokerage = items.reduce((sum, item) => sum + parseFloat(item.Brok_Amt || 0), 0);
    }
    else {
        totalBrokerage = items.reduce((bro, item) => bro + parseInt(item.Brokerage || 0), 0);
    }

    const totalCoolie = items.reduce((sum, item) => sum + parseFloat(item.Coolie_Amt || 0), 0);
    const totalAmount = parseFloat(brokerData?.Total_Amount || 0);
    const vilaivasi = parseFloat(brokerData?.VilaiVasi || 0);
    const netTotalRaw = totalAmount - totalBrokerage + totalCoolie - vilaivasi;
    const netTotalRounded = Math.round(netTotalRaw);
    const roundOff = netTotalRounded - netTotalRaw;

    const formatSignedNumber = (num) => {
        const n = Number(num) || 0;
        return (n >= 0 ? "+" : "") + n.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const getPackSizeSummary = () => {
        const packQuantities = items.reduce((acc, item) => {
            const packSize = Math.round(parseFloat(item.KGS) / parseFloat(item.QTY));
            if (!isNaN(packSize)) acc[packSize] = (acc[packSize] || 0) + parseFloat(item.QTY);
            return acc;
        }, {});
        return Object.entries(packQuantities)
            .sort(([a], [b]) => a - b)
            .map(([size, qty]) => `${size}kg - ${qty}`).join(' & ');
    };

    const handleExportExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Broker Report');

        const thickBlackBorder = {
            style: 'thick',
            color: { argb: 'FF000000' }
        };

        const cellStyle = {
            border: {
                top: thickBlackBorder,
                bottom: thickBlackBorder,
                left: thickBlackBorder,
                right: thickBlackBorder
            }
        };

        const titleRow = worksheet.addRow([
            `Broker Report: ${brokerData?.Broker_Name || ''} - Date: ${brokerData?.Items?.[0]?.Date}`
        ]);
        worksheet.mergeCells(`A${titleRow.number}:H${titleRow.number}`);
        titleRow.eachCell((cell) => {
            cell.style = {
                ...cellStyle,
                font: { bold: true, size: 14 },
                alignment: { horizontal: 'center' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }
            };
        });

        worksheet.addRow([]);

        const headerRow = worksheet.addRow([
            'PARTY NAME', 'ALIAS NAME', 'BILL RATE', 'BROKER EXP',
            'QTY', 'KGS', 'AMOUNT', 'VILAIVAASI'
        ]);

        worksheet.columns = [
            { width: 50 }, { width: 30 }, { width: 15 }, { width: 15 },
            { width: 10 }, { width: 10 }, { width: 15 }, { width: 15 }
        ];

        headerRow.eachCell((cell) => {
            cell.style = {
                ...cellStyle,
                font: { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2F5496' } },
                alignment: { horizontal: 'center', vertical: 'middle' }
            };
        });

        items.forEach((item, index) => {
            const row = worksheet.addRow([
                item.Retailer_Name || item.Ledger_Name || '',
                item.Short_Name || '',
                item.Item_Rate || '',
                item.Brok_Amt || '',
                item.QTY || '',
                item.KGS || '',
                Number(item.Amount || 0),
                Number(item.Vilaivasi_Rate || 0)
            ]);

            row.eachCell((cell) => {
                cell.style = {
                    ...cellStyle,
                    font: { size: 11 },
                    alignment: { vertical: 'middle' },
                    fill: index % 2 === 1 ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } } : undefined
                };
            });

            row.getCell(7).numFmt = '#,##0.00';
            row.getCell(8).numFmt = '#,##0.00';
        });

        const totalRow = worksheet.addRow([
            '', '', '', 'TOTAL',
            Number(brokerData?.Total_Qty || 0),
            Number(brokerData?.Total_KGS || 0),
            Number(brokerData?.Total_Amount || 0),
            Number(brokerData?.VilaiVasi || 0)
        ]);

        totalRow.eachCell((cell, colNumber) => {
            if (colNumber >= 4) {
                cell.style = {
                    ...cellStyle,
                    font: { bold: true, color: { argb: 'FFFFFFFF' } },
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } }
                };
                if (colNumber >= 5) {
                    cell.numFmt = colNumber === 5 || colNumber === 6 ? '0.00' : '#,##0.00';
                }
            } else {
                cell.style = cellStyle;
            }
        });

        worksheet.addRow([]);

        const packSizesRow = worksheet.addRow([`Pack Sizes: ${getPackSizeSummary()}`]);
        worksheet.mergeCells(`A${packSizesRow.number}:H${packSizesRow.number}`);
        packSizesRow.eachCell((cell) => {
            cell.style = {
                ...cellStyle,
                font: { italic: true },
                alignment: { horizontal: 'left' }
            };
        });

        worksheet.addRow([]);

        const summaryRows = [
            { label: 'COOLIE', value: Number(totalCoolie) },
            { label: 'BROKERAGE', value: Number(-totalBrokerage) },
            { label: 'VILAIVAASI', value: Number(-vilaivasi) },
            { label: 'ROUNDOFF', value: formatSignedNumber(roundOff) },
            { label: 'NET TOTAL', value: Number(netTotalRounded) }
        ];

        summaryRows.forEach((rowData) => {
            const row = worksheet.addRow(['', '', '', '', '', rowData.label, rowData.value, '']);
            row.getCell(6).style = {
                ...cellStyle,
                font: { bold: true, color: { argb: 'FFFFFFFF' } },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } },
                alignment: { horizontal: 'right' }
            };
            row.getCell(7).style = {
                ...cellStyle,
                font: { bold: true, color: { argb: 'FF000000' } },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC000' } },
                alignment: { horizontal: 'right' },
                numFmt: '#,##0.00'
            };
        });

        worksheet.addRow([]);
        worksheet.addRow([]);

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), `Broker_Report_${brokerData?.Broker_Name || 'Export'}_${brokerData?.Items?.[0]?.Date}.xlsx`);
    };


    const handleExportPurchase = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Brokerage Report');

            workbook.created = new Date();
            workbook.modified = new Date();

            const titleRow = worksheet.addRow([brokerData?.Broker_Name || '']);
            titleRow.font = { bold: true, size: 14 };
            titleRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells('A1:F1');

            const dateRangeRow = worksheet.addRow([
                brokerData?.Items?.length > 0 ? `${fromDate} TO ${toDate}` : 'No date range available'
            ]);
            dateRangeRow.font = { bold: true };
            dateRangeRow.alignment = { horizontal: 'center' };
            worksheet.mergeCells('A2:F2');


            worksheet.addRow([]);


            const headers = [
                { header: 'NAME', width: 50 },
                { header: 'DATE', width: 10 },
                { header: 'ALIAS NAME', width: 40 },
                { header: 'BAGS', width: 10 },
                { header: 'QTY', width: 10 },
                { header: 'BROKERAGE EXP', width: 15 }
            ];


            const headerRow = worksheet.addRow(headers.map(h => h.header));
            headerRow.eachCell((cell) => {
                cell.font = { bold: true };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            });


            headers.forEach((header, index) => {
                worksheet.getColumn(index + 1).width = header.width;
            });

            items.forEach((item) => {
                const row = worksheet.addRow([
                    item.Retailer_Name || item.Ledger_Name,
                    item.Date?.split('T')[0] || '',
                    item.Short_Name,
                    item.QTY,
                    item.KGS,
                    Number(item.Brokerage || 0)
                ]);


                row.eachCell((cell) => {
                    cell.font = { bold: true };
                    cell.border = {
                        top: { style: 'thin', color: { argb: 'FF000000' } },
                        left: { style: 'thin', color: { argb: 'FF000000' } },
                        bottom: { style: 'thin', color: { argb: 'FF000000' } },
                        right: { style: 'thin', color: { argb: 'FF000000' } }
                    };
                });


                row.getCell(4).alignment = { horizontal: 'right' };
                row.getCell(5).alignment = { horizontal: 'right' };
                row.getCell(6).alignment = { horizontal: 'right' };
            });


            const totalRow = worksheet.addRow([
                '', '', 'TOTAL',
                Number(brokerData?.Total_Qty) || 0,
                Number(brokerData?.Total_KGS) || 0,
                totalBrokerage
            ]);


            totalRow.eachCell((cell) => {
                cell.font = { bold: true };
                cell.border = {
                    top: { style: 'medium', color: { argb: 'FF000000' } },
                    left: { style: 'thin', color: { argb: 'FF000000' } },
                    bottom: { style: 'thin', color: { argb: 'FF000000' } },
                    right: { style: 'thin', color: { argb: 'FF000000' } }
                };
            });


            totalRow.getCell(4).alignment = { horizontal: 'right' };
            totalRow.getCell(5).alignment = { horizontal: 'right' };
            totalRow.getCell(6).alignment = { horizontal: 'right' };


            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${brokerData?.Broker_Name}_${fromDate}_to_${toDate}.xlsx`;
            link.click();


            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 100);

        } catch (error) {
            console.error('Error exporting to Excel:', error);

        }
    };

    useEffect(() => {
        if (open) {
            if (transactionType === 'salesNagal') {
                handleExportExcel().then(() => {
                    if (typeof onClose === 'function') onClose();
                });
            } else if (transactionType === 'purchase') {
                handleExportPurchase().then(() => {
                    if (typeof onClose === 'function') onClose();
                });
            }
            else if (transactionType === 'sales') {
                handleExportPurchase().then(() => {
                    if (typeof onClose === 'function') onClose();
                });
            }
        }
    }, [open, transactionType]);

    return null;
};
export default XlPreviewModal;