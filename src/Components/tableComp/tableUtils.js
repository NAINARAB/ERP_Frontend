// utils/tableUtils.js

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const isEqualNumber = (a, b) => Number(a) === Number(b);

export const formatString = (val, dataType) => {
    switch (dataType) {
        case 'number':
            return val ? new Intl.NumberFormat().format(val) : val;
        case 'date':
            return val ? new Date(val).toLocaleDateString() : val;
        case 'time':
            return val ? new Date(val).toLocaleTimeString() : val;
        case 'string':
            return val;
        default:
            return '';
    }
};

export const preprocessDataForExport = (data, columns) => {
    return data.map(row => {
        const flatRow = {};
        columns.forEach((col, index) => {
            if (col.isVisible || col.Defult_Display) {
                const safeHeader = col.ColumnHeader
                    ? String(col.ColumnHeader).replace(/\s+/g, '_').toLowerCase()
                    : `field_${index + 1}`;
                if (col.isCustomCell && col.Cell) {
                    const content = col.Cell({ row });
                    if (typeof content === 'string' || typeof content === 'number') {
                        flatRow[safeHeader] = content;
                    }
                } else {
                    flatRow[safeHeader] = row[col.Field_Name] || '';
                }
            }
        });
        return flatRow;
    });
};

export const generatePDF = (dataArray, columns) => {
    try {
        const doc = new jsPDF();
        const processed = preprocessDataForExport(dataArray, columns);

        const headers = columns
            .filter(col => col.isVisible || col.Defult_Display)
            .map(col => col.Field_Name || col.ColumnHeader || '');

        const rows = processed.map(row =>
            headers.map(h => row[h])
        );

        doc.autoTable({
            head: [headers],
            body: rows
        });

        doc.save('table.pdf');
    } catch (e) {
        console.error('PDF Export Error:', e);
    }
};

export const exportToExcel = (dataArray, columns) => {
    try {
        const processed = preprocessDataForExport(dataArray, columns);
        const sheet = XLSX.utils.json_to_sheet(processed);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, sheet, 'Data');
        XLSX.writeFile(workbook, 'table.xlsx');
    } catch (e) {
        console.error('Excel Export Error:', e);
    }
};
