import {
    Dialog, DialogTitle, DialogContent,
    DialogActions, Switch, Button, Card
} from '@mui/material';

const ColumnSettingsDialog = ({
    open,
    columns,
    dispColumns,
    onToggle,
    onOrderChange,
    onClose
}) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Column Settings</DialogTitle>

            <DialogContent>
                <div className="row">
                    {columns.map((col, i) => {
                        const dc = dispColumns.find(
                            d => d.Field_Name === col.Field_Name
                        );

                        return (
                            <div className="col-md-6 col-lg-4 p-2" key={i}>
                                <Card className="p-2 d-flex justify-content-between">
                                    <Switch
                                        checked={!!dc?.isVisible}
                                        onChange={e =>
                                            onToggle(
                                                col.Field_Name,
                                                e.target.checked
                                            )
                                        }
                                    />
                                    <h6 className="mb-0 mx-2 flex-grow-1" style={{ fontSize: '0.9rem' }}>
                                        {col.ColumnHeader || col.Field_Name}
                                    </h6>
                                    <input
                                        type="number"
                                        className="border-0"
                                        value={dc?.OrderBy || ''}
                                        onChange={e =>
                                            onOrderChange(
                                                col.Field_Name,
                                                e.target.value
                                            )
                                        }
                                        placeholder="Order"
                                        style={{ width: 60 }}
                                    />
                                </Card>
                            </div>
                        );
                    })}
                </div>
            </DialogContent>

            <DialogActions>
                <Button color="error" onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ColumnSettingsDialog;
