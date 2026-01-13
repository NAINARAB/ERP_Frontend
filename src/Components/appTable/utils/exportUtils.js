import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const preprocessDataForExport = (data, columns) => {
    return data.map((row) => {
        const flattenedRow = {};

        columns.forEach((column, index) => {
            if (column.isVisible || column.Defult_Display) {
                if (column.isCustomCell && column.Cell) {
                    const cellContent = column.Cell({ row });

                    const safeColumnHeader = column.ColumnHeader
                        ? String(column.ColumnHeader).replace(/\s+/g, '_').toLowerCase()
                        : `field_${index + 1}`;

                    if (typeof cellContent === 'string' || typeof cellContent === 'number' || typeof cellContent === 'bigint') {
                        flattenedRow[safeColumnHeader] = cellContent;
                    }
                } else {
                    // Handle regular fields
                    let key = column.Field_Name;
                    flattenedRow[key] = row[key] || '';
                }
            }
        });

        return flattenedRow;
    });
};

export const generatePDF = (dataArray, columns) => {
    try {
        const doc = new jsPDF();
        const processedData = preprocessDataForExport(dataArray, columns);

        const headers = columns
            .filter((column) => column.isVisible || column.Defult_Display)
            .map((column) => column.Field_Name || String(column.ColumnHeader).replace(/\s+/g, '_').toLowerCase());

        const rows = processedData.map((row) =>
            headers.map((header) => row[header])
        ).map((o, i) => ({ ...o, Sno: i + 1 }))

        doc.autoTable({
            head: [headers],
            body: rows,
        });

        doc.save('table.pdf');
    } catch (e) {
        console.error(e);
    }
};

export const exportToExcel = (dataArray, columns) => {
    try {
        const processedData = preprocessDataForExport(dataArray, columns);

        const worksheet = XLSX.utils.json_to_sheet(processedData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
        XLSX.writeFile(workbook, 'table.xlsx');
    } catch (e) {
        console.error(e);
    }
};
