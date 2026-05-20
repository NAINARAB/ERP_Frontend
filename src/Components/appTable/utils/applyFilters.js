import { reactSelectFilterLogic } from '../../functions';

export const applyFilters = (dataArray, dispColumns, filters, globalFilter) => {
    let filtered = [...dataArray];

    dispColumns.forEach(col => {
        const filter = filters[col.Field_Name];
        if (!filter) return;

        if (filter.type === 'range') {
            filtered = filtered.filter(row => {
                const v = row[col.Field_Name];
                return (
                    (filter.min === undefined || v >= filter.min) &&
                    (filter.max === undefined || v <= filter.max)
                );
            });
        }

        if (filter.type === 'date') {
            filtered = filtered.filter(row => {
                const d = new Date(row[col.Field_Name]);
                return (
                    (!filter.value?.start || d >= new Date(filter.value.start)) &&
                    (!filter.value?.end || d <= new Date(filter.value.end))
                );
            });
        }

        if (Array.isArray(filter)) {
            filtered = filter.length
                ? filtered.filter(row => {
                    const rowVal = row[col.Field_Name];
                    return filter.some(selectedVal =>
                        // Check if row matches any selected value using fuzzy logic
                        reactSelectFilterLogic({ label: String(rowVal) }, String(selectedVal))
                    );
                })
                : filtered;
        }
    });

    if (globalFilter) {
        filtered = filtered.filter(row =>
            dispColumns.some(col => {
                const val = row[col.Field_Name];
                // Use reactSelectFilterLogic which expects { label: string } and search string
                return val && reactSelectFilterLogic({ label: String(val) }, globalFilter);
            })
        );
    }

    return filtered;
};
