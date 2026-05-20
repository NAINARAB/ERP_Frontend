// hooks/useFilteredData.js

import { useEffect, useState } from 'react';

const useFilteredData = (originalData, columns) => {
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState(originalData || []);

    useEffect(() => {
        applyFilters();
    }, [filters, originalData, columns]);

    const applyFilters = () => {
        let data = [...originalData];

        for (const column of columns) {
            const field = column.Field_Name;
            const filter = filters[field];

            if (!filter) continue;

            if (filter.type === 'range') {
                const { min, max } = filter;
                data = data.filter(item => {
                    const val = Number(item[field]);
                    return (min === undefined || val >= min) && (max === undefined || val <= max);
                });
            } else if (filter.type === 'date') {
                const { start, end } = filter.value || {};
                data = data.filter(item => {
                    const val = new Date(item[field]);
                    return (!start || val >= new Date(start)) && (!end || val <= new Date(end));
                });
            } else if (Array.isArray(filter)) {
                data = filter.length
                    ? data.filter(item => filter.includes(item[field]?.toLowerCase()?.trim()))
                    : data;
            }
        }

        setFilteredData(data);
    };

    return {
        filters,
        setFilters,
        filteredData
    };
};

export default useFilteredData;
