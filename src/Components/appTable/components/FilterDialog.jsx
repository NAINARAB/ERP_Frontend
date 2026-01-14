import {
    Dialog, DialogTitle, DialogContent,
    DialogActions, Button, Card
} from '@mui/material';
import FilterRow from './FilterRow';
import { randomNumber } from '../../functions';

const FilterDialog = ({
    open,
    onClose,
    columns,
    showData,
    filters,
    onChange,
    onClear
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <div className="d-flex justify-content-between align-items-center">
                    <span>Filters</span>
                    <Button onClick={onClear} size="small" color="error">
                        Clear All
                    </Button>
                </div>
            </DialogTitle>

            <DialogContent dividers>
                <div className="row">
                    {columns.filter(c => c.isVisible === 1 && !c.isCustomCell).map((col, i) => (
                        <div className="col-md-6 p-2" key={randomNumber()}>
                            <Card variant="outlined" className="p-3">
                                <h6 className="mb-2 fw-bold text-secondary" style={{ fontSize: '0.9rem' }}>
                                    {col.ColumnHeader || col.Field_Name}
                                </h6>
                                <FilterRow
                                    column={col}
                                    showData={showData}
                                    filters={filters}
                                    onChange={onChange}
                                />
                            </Card>
                        </div>
                    ))}
                </div>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FilterDialog;
