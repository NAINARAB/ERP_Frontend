import { useEffect, useState } from 'react';
import { applyFilters } from '../utils/applyFilters';

export const useColumnFilters = (dataArray, dispColumns) => {
    const [filters, setFilters] = useState({});
    const [filteredData, setFilteredData] = useState(dataArray);

    useEffect(() => {
        setFilteredData(applyFilters(dataArray, dispColumns, filters));
    }, [filters, dataArray, dispColumns]);

    const handleFilterChange = (column, value) => {
        setFilters(prev => ({ ...prev, [column]: value }));
    };

    return {
        filters,
        filteredData,
        updateFilter: handleFilterChange,
        setFilters,
    };
};
