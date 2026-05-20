import {
    Dialog,
    DialogContent,
    DialogActions,
    IconButton,
    Tooltip,
    Button,
    Checkbox,
    TextField,
} from '@mui/material';
import { FilterAltOff, Settings } from '@mui/icons-material';
import Autocomplete from '@mui/material/Autocomplete';

const FilterDialog = ({
    open,
    onClose,
    columns,
    filters,
    setFilters,
    dataArray,
    setColumnDialog,
}) => {
    const handleFilterChange = (column, value) => {
        setFilters(prev => ({
            ...prev,
            [column]: value,
        }));
    };

    const renderFilter = (column) => {
        const { Field_Name, Fied_Data } = column;
        if (Fied_Data === 'number') {
            return (
                <div className="d-flex justify-content-between px-2">
                    <input
                        placeholder="Min"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Field_Name]?.min ?? ''}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: 'range',
                                ...filters[Field_Name],
                                min: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                        }
                    />
                    <input
                        placeholder="Max"
                        type="number"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Field_Name]?.max ?? ''}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: 'range',
                                ...filters[Field_Name],
                                max: e.target.value ? parseFloat(e.target.value) : undefined,
                            })
                        }
                    />
                </div>
            );
        } else if (Fied_Data === 'date') {
            return (
                <div className="d-flex justify-content-between px-2">
                    <input
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Field_Name]?.value?.start ?? ''}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: 'date',
                                value: {
                                    ...filters[Field_Name]?.value,
                                    start: e.target.value || undefined,
                                },
                            })
                        }
                    />
                    <input
                        type="date"
                        className="bg-light border-0 m-1 p-1 w-50"
                        value={filters[Field_Name]?.value?.end ?? ''}
                        onChange={(e) =>
                            handleFilterChange(Field_Name, {
                                type: 'date',
                                value: {
                                    ...filters[Field_Name]?.value,
                                    end: e.target.value || undefined,
                                },
                            })
                        }
                    />
                </div>
            );
        } else if (Fied_Data === 'string') {
            const distinctValues = [...new Set(dataArray.map(item => item[Field_Name]?.toLowerCase()?.trim()))];
            return (
                <Autocomplete
                    multiple
                    options={distinctValues}
                    disableCloseOnSelect
                    value={filters[Field_Name] || []}
                    onChange={(event, newValue) => handleFilterChange(Field_Name, newValue)}
                    renderOption={(props, option, { selected }) => (
                        <li {...props}>
                            <Checkbox checked={selected} style={{ marginRight: 8 }} />
                            {option}
                        </li>
                    )}
                    isOptionEqualToValue={(opt, val) => opt === val}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={Field_Name}
                            placeholder={`Select ${Field_Name?.replace(/_/g, ' ')}`}
                        />
                    )}
                />
            );
        }
        return null;
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogContent>
                <h5 className="d-flex justify-content-between px-2">
                    <span>Filters</span>
                    <span>
                        <Tooltip title="Column Visibility">
                            <IconButton size="small" onClick={() => setColumnDialog(true)}>
                                <Settings />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Clear Filters">
                            <IconButton size="small" onClick={() => setFilters({})}>
                                <FilterAltOff />
                            </IconButton>
                        </Tooltip>
                    </span>
                </h5>
                <div className="border rounded-3">
                    {columns.map((column, i) => (
                        <div key={i} className="py-3 px-3 hov-bg border-bottom">
                            <label className="mt-2 mb-1">
                                {column.Field_Name?.replace(/_/g, ' ')}
                            </label>
                            {renderFilter(column)}
                        </div>
                    ))}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="error">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FilterDialog;
