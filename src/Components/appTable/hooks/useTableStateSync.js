import { useEffect, useState } from 'react';
import { fetchLink } from "../../fetchComponent";

export const useTableStateSync = ({
    stateName,
    stateUrl,
    stateGroup,
    dispColumns,
    grouping,
    loadingOn,
    loadingOff
}) => {
    const [savedStates, setSavedStates] = useState([]);

    const enabled = stateName && stateUrl && stateGroup;

    // useEffect(() => {
    //     if (!enabled) return;

    //     fetchLink({
    //         address: `reports/reportState?reportGroup=${stateGroup}`,
    //         // bodyData: 
    //     }).then(res => setSavedStates(res.data || []));
    // }, [enabled, stateGroup]);

    const saveState = ({ name, displayName, reportUrl, reportGroup }) => {
        const visibilityPayload = {
            visibleColumns: dispColumns.map(c => ({
                ColumnName: c.Field_Name,
                ColumnOrder: c.OrderBy,
            })),
            reportName: name,
            displayName,
            reportUrl,
            reportGroup,
        };

        const groupingPayload = {
            groupingColumns: grouping.filter(Boolean).map((g, i) => ({
                ColumnName: g,
                ColumnOrder: i + 1,
            })),
            reportName: name,
            reportUrl,
            reportGroup,
        };

        return Promise.all([
            fetchLink({
                address: 'reports/reportState/columnVisiblity',
                method: 'POST',
                bodyData: visibilityPayload
            }),
            fetchLink({
                address: 'reports/reportState/columnGrouping',
                method: 'POST',
                bodyData: groupingPayload
            }),
        ]);
    };

    return { enabled, savedStates, saveState };
};
