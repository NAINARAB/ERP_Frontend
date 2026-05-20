import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Card,
    Paper,
    Switch,
    Button
} from '@mui/material';

const checkIsNumber = (val) => !isNaN(val) && val !== null && val !== '';

const ColumnSettingsDialog = ({
    open,
    onClose,
    columns,
    setColumns,
    originalColumns = []
}) => {
    const handleToggle = (fieldName, checked) => {
        setColumns(prev =>
            prev.map(col =>
                col.Field_Name === fieldName
                    ? { ...col, isVisible: checked ? 1 : 0 }
                    : col
            )
        );
    };

    const handleOrderChange = (fieldName, value) => {
        setColumns(prev =>
            prev.map(col =>
                col.Field_Name === fieldName
                    ? { ...col, OrderBy: value }
                    : col
            )
        );
    };

    const handleReset = () => {
        setColumns(originalColumns);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Column Settings</DialogTitle>
            <DialogContent>
                <div className="row">
                    {columns.map((col, i) => (
                        <div className="col-lg-4 col-md-6 p-2" key={i}>
                            <Card
                                component={Paper}
                                className={`p-2 d-flex justify-content-between align-items-center flex-wrap ${i % 2 !== 0 ? 'bg-light' : ''}`}
                            >
                                <div className="d-flex justify-content-between align-items-center flex-wrap">
                                    <Switch
                                        checked={Boolean(col?.isDefault) || Boolean(col?.isVisible)}
                                        disabled={Boolean(col?.isDefault)}
                                        onChange={(e) =>
                                            handleToggle(col?.Field_Name, e.target.checked)
                                        }
                                    />
                                    <h6 className="fa-13 mb-0 fw-bold">
                                        {col?.Field_Name}
                                    </h6>
                                </div>
                                <input
                                    type="number"
                                    value={checkIsNumber(col?.OrderBy) ? col?.OrderBy : ''}
                                    onChange={(e) =>
                                        handleOrderChange(col?.Field_Name, e.target.value)
                                    }
                                    className="mt-2 p-1 border-0 cus-inpt"
                                    style={{ width: '80px' }}
                                    placeholder="Order"
                                />
                            </Card>
                        </div>
                    ))}
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleReset} variant="outlined">Reset</Button>
                <Button onClick={onClose} color="error">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ColumnSettingsDialog;
