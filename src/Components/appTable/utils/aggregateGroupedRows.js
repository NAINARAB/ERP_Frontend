import { aggregations } from './aggregations';

const isDate = v => !isNaN(new Date(v).getTime());

export const aggregateGroupedRows = (rows, columns, groupColumns) => {
    const result = {};

    columns.forEach(col => {
        const field = col.Field_Name;

        // skip grouping columns
        if (groupColumns.includes(field)) return;

        const values = rows
            .map(r => r[field])
            .filter(v => v !== undefined && v !== null);

        if (!values.length) return;

        // Check for custom aggregation
        if (col.Aggregation && aggregations[col.Aggregation]) {
            result[field] = aggregations[col.Aggregation](values);
            return;
        }

        switch (col.Fied_Data) {
            case 'number':
                result[field] = aggregations.sum(values);
                break;

            case 'date':
            case 'time':
                // For dates/times, max (latest) is often a reasonable default
                result[field] = values.reduce((a, b) =>
                    new Date(a) > new Date(b) ? a : b
                );
                break;

            case 'string':
            default:
                result[field] = aggregations.count(values);
        }
    });

    return result;
};
