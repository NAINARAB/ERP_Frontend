import { TextField, Autocomplete, Checkbox } from '@mui/material';

const FilterRow = ({ column, showData, filters, onChange }) => {
    const { Field_Name, Fied_Data } = column;

    const handleRangeChange = (key, value) => {
        const currentFilter = filters[Field_Name] || { type: 'range' };
        onChange(Field_Name, {
            ...currentFilter,
            type: 'range',
            [key]: value === '' ? undefined : Number(value)
        });
    };

    const handleDateChange = (key, value) => {
        const currentFilter = filters[Field_Name] || { type: 'date', value: {} };
        onChange(Field_Name, {
            ...currentFilter,
            type: 'date',
            value: {
                ...currentFilter.value,
                [key]: value || undefined
            }
        });
    };

    if (Fied_Data === 'number') {
        const current = filters[Field_Name] || {};
        return (
            <div className="d-flex gap-1">
                <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Min"
                    value={current.min ?? ''}
                    onChange={e => handleRangeChange('min', e.target.value)}
                    style={{ minWidth: '60px' }}
                />
                <input
                    type="number"
                    className="form-control form-control-sm"
                    placeholder="Max"
                    value={current.max ?? ''}
                    onChange={e => handleRangeChange('max', e.target.value)}
                    style={{ minWidth: '60px' }}
                />
            </div>
        );
    }

    if (['date', 'time'].includes(Fied_Data)) {
        const current = filters[Field_Name]?.value || {};
        const inputType = Fied_Data === 'time' ? 'time' : 'date';

        return (
            <div className="d-flex flex-column gap-1">
                <input
                    type={inputType}
                    className="form-control form-control-sm"
                    placeholder="Start"
                    value={current.start ?? ''}
                    onChange={e => handleDateChange('start', e.target.value)}
                />
                <input
                    type={inputType}
                    className="form-control form-control-sm"
                    placeholder="End"
                    value={current.end ?? ''}
                    onChange={e => handleDateChange('end', e.target.value)}
                />
            </div>
        );
    }

    // Default to String (Autocomplete)
    const options = [
        ...new Set(showData.map(d =>
            d[Field_Name]?.toString().toLowerCase().trim()
        ).filter(Boolean)),
    ];

    return (
        <Autocomplete
            multiple
            options={options}
            value={filters[Field_Name] || []}
            onChange={(e, v) => onChange(Field_Name, v)}
            disableCloseOnSelect
            getOptionLabel={(option) => option}
            isOptionEqualToValue={(option, value) => option === value}
            renderOption={(props, option, { selected }) => (
                <li {...props}>
                    <Checkbox checked={selected} style={{ marginRight: 8 }} />
                    {option}
                </li>
            )}
            renderInput={params => (
                <TextField
                    {...params}
                    size="small"
                    placeholder="Select..."
                    variant="standard"
                />
            )}
        />
    );
};

export default FilterRow;
