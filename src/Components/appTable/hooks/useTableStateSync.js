import { useEffect, useState } from 'react';
import { fetchLink } from "../../fetchComponent";
import { toArray } from '../../functions';

export const useTableStateSync = ({
    stateName,
    stateUrl,
    stateGroup,
    dispColumns,
    grouping,
    loadingOn,
    loadingOff
}) => {
    const [savedVisibility, setSavedVisibility] = useState([]);
    const [savedGrouping, setSavedGrouping] = useState([]);
    const [fetchTrigger, setFetchTrigger] = useState(1);
    const [availableViews, setAvailableViews] = useState([]);

    const enabled = stateName && stateUrl && stateGroup;

    useEffect(() => {
        if (!enabled) return;
        setSavedGrouping([]);
        setSavedVisibility([]);

        Promise.all([
            fetchLink({
                address: `reports/reportState/columnVisiblity?reportGroup=${stateGroup}`,
            }).then(res => toArray(res.data)),
            fetchLink({
                address: `reports/reportState/columnGrouping?reportGroup=${stateGroup}`,
            }).then(res => toArray(res.data))
        ]).then(([visData, groupData]) => {
            setSavedVisibility(visData);
            setSavedGrouping(groupData);

            // Extract Unique Views
            const views = [];
            const seen = new Set();

            [...visData, ...groupData].forEach(item => {
                if (item.reportName && !seen.has(item.reportName)) {
                    seen.add(item.reportName);
                    views.push({
                        reportName: item.reportName,
                        displayName: item.displayName || item.reportName // Fallback
                    });
                }
            });
            setAvailableViews(views);
        });
    }, [enabled, stateGroup, fetchTrigger]);

    const checkIfNameExists = (name) => {
        return availableViews.some(v => v.reportName === name || v.displayName === name);
    };

    const saveState = ({ name, displayName, reportUrl, reportGroup }) => {
        if (checkIfNameExists(name)) {
            return Promise.reject(new Error("State name already exists!"));
        }

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
        ]).then(() => {
            setFetchTrigger(prev => prev + 1);
        });
    };

    return {
        enabled,
        savedVisibility,
        savedGrouping,
        availableViews,
        checkIfNameExists,
        saveState
    };
};
