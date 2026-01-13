export const aggregations = {
    count: values => values.length,
    sum: values => values.reduce((a, b) => a + (+b || 0), 0),
    min: values => Math.min(...values),
    max: values => Math.max(...values),
    mean: values =>
        values.reduce((a, b) => a + (+b || 0), 0) / values.length,
    median: values => {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2
            ? sorted[mid]
            : (sorted[mid - 1] + sorted[mid]) / 2;
    }
};
