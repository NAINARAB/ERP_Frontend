import { useState, useMemo } from 'react';

export const useColumnVisibility = (initialColumns = []) => {
    const [dispColumns, setDispColumns] = useState(initialColumns);

    const toggleColumn = (fieldName, visible) => {
        setDispColumns(cols =>
            cols.map(col =>
                col.Field_Name === fieldName
                    ? { ...col, isVisible: visible ? 1 : 0 }
                    : col
            )
        );
    };

    const reorderColumn = (fieldName, order) => {
        setDispColumns(cols =>
            cols.map(col =>
                col.Field_Name === fieldName
                    ? { ...col, OrderBy: Number(order) }
                    : col
            )
        );
    };

    const orderedColumns = useMemo(() => [...dispColumns].sort(
        (a, b) => (a.OrderBy ?? 999) - (b.OrderBy ?? 999)
    ), [dispColumns]);

    return {
        dispColumns: orderedColumns,
        rawColumns: dispColumns,
        setDispColumns,
        toggleVisibility: toggleColumn,
        updateOrder: reorderColumn,
    };
};
