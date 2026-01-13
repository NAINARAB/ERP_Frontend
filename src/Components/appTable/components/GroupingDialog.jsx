import React from "react";
import PropTypes from "prop-types";
import { MenuItem, Select, Stack } from "@mui/material";
import AppDialog from "../../appDialogComponent";

const GroupingDialog = ({
    open,
    onClose,
    columns,
    grouping,
    onChange,
    onApply
}) => {
    return (
        <AppDialog
            open={open}
            onClose={onClose}
            title="Group By Columns"
            onSubmit={onApply}
            submitText="Apply"
            maxWidth="sm"
        >
            <Stack spacing={2}>
                {[0, 1, 2].map(level => {
                    const disabled =
                        (level === 1 && !grouping[0]) ||
                        (level === 2 && !grouping[1]);

                    return (
                        <Select
                            key={level}
                            size="small"
                            displayEmpty
                            disabled={disabled}
                            value={grouping[level] || ""}
                            onChange={e => {
                                const val = e.target.value || "";
                                let next = [...grouping];
                                next[level] = val;

                                // Cascade clear
                                if (!val) {
                                    for (let i = level + 1; i < 3; i++) {
                                        next[i] = "";
                                    }
                                }
                                onChange(undefined, undefined, next);
                            }}
                        >
                            <MenuItem value="">
                                No Grouping (Level {level + 1})
                            </MenuItem>

                            {columns.map(col => (
                                <MenuItem
                                    key={col.Field_Name}
                                    value={col.Field_Name}
                                >
                                    {col.ColumnHeader || col.Field_Name}
                                </MenuItem>
                            ))}
                        </Select>
                    );
                })}
            </Stack>
        </AppDialog>
    );
};

export default GroupingDialog;

GroupingDialog.propTypes = {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    columns: PropTypes.array,
    grouping: PropTypes.array,
    onChange: PropTypes.func,
    onApply: PropTypes.func
};
