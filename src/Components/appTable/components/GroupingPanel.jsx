import { Card, MenuItem, Select, Typography } from '@mui/material';

const AGGREGATIONS = ['count', 'sum', 'min', 'max', 'mean', 'median'];

const GroupingPanel = ({ columns, grouping, onChange }) => {
    return (
        <Card className="p-2 mb-2">
            <Typography variant="subtitle2" className="mb-2">
                Group By (Max 3 Levels)
            </Typography>

            {grouping.map((g, i) => (
                <div key={i} className="d-flex gap-2 mb-2">
                    <Select
                        size="small"
                        value={g.column}
                        displayEmpty
                        onChange={e =>
                            onChange(i, 'column', e.target.value)
                        }
                        fullWidth
                    >
                        <MenuItem value="">None</MenuItem>
                        {columns.map(col => (
                            <MenuItem
                                key={col.Field_Name}
                                value={col.Field_Name}
                            >
                                {col.ColumnHeader || col.Field_Name}
                            </MenuItem>
                        ))}
                    </Select>

                    <Select
                        size="small"
                        value={g.aggregation || ''}
                        displayEmpty
                        onChange={e =>
                            onChange(i, 'aggregation', e.target.value)
                        }
                        disabled={!g.column}
                        fullWidth
                    >
                        <MenuItem value="">No Aggregation</MenuItem>
                        {AGGREGATIONS.map(a => (
                            <MenuItem key={a} value={a}>
                                {a}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
            ))}
        </Card>
    );
};

export default GroupingPanel;
