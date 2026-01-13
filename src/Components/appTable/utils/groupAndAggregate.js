import { aggregateGroupedRows } from './aggregateGroupedRows';

export const groupAndAggregate = (data, columns, groupColumns) => {
    if (!groupColumns.length) return data;

    const build = (rows, level) => {
        const field = groupColumns[level];
        if (!field) return rows;

        const map = {};
        rows.forEach(r => {
            const key = r[field] ?? 'N/A';
            map[key] = map[key] || [];
            map[key].push(r);
        });

        return Object.entries(map).map(([key, groupRows]) => {
            const aggregated = aggregateGroupedRows(
                groupRows,
                columns,
                groupColumns
            );

            return {
                __isGroup: true,
                __level: level,
                __groupField: field,
                __groupValue: key,
                __aggregates: aggregated,
                __rows: build(groupRows, level + 1)
            };
        });
    };

    return build(data, 0);
};
