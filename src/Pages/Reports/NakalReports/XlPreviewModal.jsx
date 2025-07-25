import { useEffect } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

const XlPreviewModal = ({ open, onClose, brokerData }) => {
    const items = brokerData?.Items || [];
    const totalBrokerage = items.reduce((sum, item) => sum + parseFloat(item.Brok_Amt || 0), 0);
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
            `Broker Report: ${brokerData?.Broker_Name || ''} - Date: ${new Date().toLocaleDateString('en-IN')}`
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
        saveAs(new Blob([buffer]), `Broker_Report_${brokerData?.Broker_Name || 'Export'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    useEffect(() => {
        if (open) {
            handleExportExcel().then(() => {
                if (typeof onClose === 'function') {
                    onClose();
                }
            });
        }

    }, [open]);

    return null;
};

export default XlPreviewModal;
