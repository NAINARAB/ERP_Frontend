import React from 'react';
import AppDialog from './appDialogComponent';
import { Button } from '@mui/material';
import { Search, ClearAll } from '@mui/icons-material';

const FilterDialog = ({
    open,
    onClose,
    onSearch,
    onReset,
    children,
    title = "Filters",
    maxWidth = "sm"
}) => {
    return (
        <AppDialog
            open={open}
            onClose={onClose}
            title={title}
            maxWidth={maxWidth}
            onSubmit={onSearch} // "Search" button acts as Submit
            submitText="Search"
            startAction={
                onReset && (
                    <Button
                        variant="outlined"
                        onClick={onReset}
                        startIcon={<ClearAll />}
                        color="error"
                    >
                        Reset
                    </Button>
                )
            }
        >
            <div className="table-responsive pb-4">
                <table className="table">
                    <tbody>
                        {children}
                    </tbody>
                </table>
            </div>
        </AppDialog>
    );
};

export default FilterDialog;
