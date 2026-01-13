import { aggregations } from './aggregations';

export const groupData = (data, grouping) => {
    if (!grouping.length) return data;

    const groupRecursive = (rows, level) => {
        const group = grouping[level];
        if (!group) return rows;

        const map = {};
        rows.forEach(row => {
            const key = row[group.column] ?? 'N/A';
            map[key] = map[key] || [];
            map[key].push(row);
        });

        return Object.entries(map).map(([key, rows]) => {
            const result = { [group.column]: key };

            if (group.aggregation) {
                const values = rows.map(r => r[group.column]);
                result[`${group.column}_${group.aggregation}`] =
                    aggregations[group.aggregation](values);
            }

            result.children = groupRecursive(rows, level + 1);
            return result;
        });
    };

    return groupRecursive(data, 0);
};
