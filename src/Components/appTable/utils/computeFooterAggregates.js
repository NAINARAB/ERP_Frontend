import { aggregations } from './aggregations';

/**
 * Computes a footer aggregate value for every visible, non-custom column
 * using each column's `Aggregation` setting or its data-type default.
 *
 * @param {Array<Object>} rows   - The complete filtered dataset (all pages).
 * @param {Array<Object>} columns - dispColumns from useColumnVisibility.
 * @returns {Object} Map of { Field_Name: aggregatedValue }
 */
export const computeFooterAggregates = (rows, columns) => {
    const result = {};

    columns
        .filter(col => col.isVisible === 1 && !col.isCustomCell)
        .forEach(col => {
            const field = col.Field_Name;
            const values = rows
                .map(r => r[field])
                .filter(v => v !== undefined && v !== null && v !== '');

            if (!values.length) {
                result[field] = null;
                return;
            }

            // Use explicit custom aggregation if set
            const aggType = col.Aggregation;
            if (aggType && aggregations[aggType]) {
                result[field] = aggregations[aggType](values);
                return;
            }

            // Fallback to data-type default
            switch (col.Fied_Data) {
                case 'number':
                    result[field] = aggregations.sum(values);
                    break;
                case 'date':
                case 'time':
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
