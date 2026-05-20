import { useState } from 'react';

export const useColumnGrouping = () => {
    const [grouping, setGrouping] = useState([
        { column: '', aggregation: '' },
        { column: '', aggregation: '' },
        { column: '', aggregation: '' },
    ]);

    const updateGrouping = (level, key, value) => {
        setGrouping(prev =>
            prev.map((g, i) =>
                i === level ? { ...g, [key]: value } : g
            )
        );
    };

    const activeGrouping = grouping.filter(g => g.column);

    return {
        grouping,
        activeGrouping,
        updateGrouping,
        setGrouping,
    };
};
