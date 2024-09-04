import { useState, useEffect } from 'react';
import api from '../../../API';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Switch, Card, Paper } from "@mui/material";
import { RotateLeft, Settings } from '@mui/icons-material';
import { toast } from "react-toastify";
import { fetchLink } from '../../../Components/fetchComponent'


const QPayColumnVisiblitySettings = ({ CompanyId, refresh, columns, ReportId }) => {
    const [modifiedColumns, setModifiedColumns] = useState([]);
    const [reset, setReset] = useState(false);
    const [dialog, setDialog] = useState(false);

    useEffect(() => {
        setModifiedColumns([...columns])
    }, [columns, reset])

    const saveColumnVisiblity = () => {
        setDialog(false);
        fetchLink({
            address: `reports/tallyReports/qpay/columnVisiblity`,
            method: 'POST',
            bodyData: {
                dataArray: modifiedColumns,
                CompanyId: CompanyId,
                ReportId: ReportId ? ReportId : 1
            }
        }).then(data => {
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        }).catch(e => console.error(e)).finally(() => {
            if (refresh) {
                refresh()
            }
        })
            
    }


    return (
        <>
            <IconButton size='small' onClick={() => setDialog(pre => !pre)}>
                <Settings />
            </IconButton>

            <Dialog
                open={dialog}
                onClose={() => setDialog(false)}
                fullWidth maxWidth='lg'
            >
                <DialogTitle>Column Visiblity Settings</DialogTitle>

                <DialogContent>
                    <div className="row">
                        {modifiedColumns?.map((o, i) => (
                            <div className="col-lg-4 col-md-6 p-2" key={i}>
                                <Card
                                    component={Paper}
                                    className={`p-2 d-flex justify-content-between align-items-center flex-wrap ${i % 2 !== 0 ? 'bg-light' : ''}`}
                                >
                                    {/* <FormControlLabel
                                        control={
                                            <Switch
                                                checked={Boolean(o?.Defult_Display) || Boolean(o?.isVisible)}
                                                disabled={Boolean(o?.Defult_Display)}
                                                onChange={e =>
                                                    setModifiedColumns(prevColumns =>
                                                        prevColumns.map(oo =>
                                                            oo.Field_Id === o?.Field_Id
                                                                ? { ...oo, isVisible: e.target.checked ? 1 : 0 }
                                                                : oo
                                                        )
                                                    )}
                                            />
                                        }
                                        label={o?.Field_Name}
                                        sx={{ fontSize: '14px'}}
                                        labelPlacement="end"
                                        className="fw-bold text-primary"
                                    /> */}
                                    <div className='d-flex justify-content-between align-items-center flex-wrap'>
                                        <Switch
                                            checked={Boolean(o?.Defult_Display) || Boolean(o?.isVisible)}
                                            disabled={Boolean(o?.Defult_Display)}
                                            onChange={e =>
                                                setModifiedColumns(prevColumns =>
                                                    prevColumns.map(oo =>
                                                        oo.Field_Id === o?.Field_Id
                                                            ? { ...oo, isVisible: e.target.checked ? 1 : 0 }
                                                            : oo
                                                    )
                                                )}
                                        />

                                        <h6 className='fa-13 mb-0 fw-bold '>{o?.Field_Name}</h6>
                                    </div>
                                    <input
                                        type='number'
                                        value={Number(o?.OrderBy) ? o?.OrderBy : ''}
                                        onChange={e =>
                                            setModifiedColumns(prevColumns =>
                                                prevColumns.map(oo =>
                                                    oo.Field_Id === o?.Field_Id
                                                        ? { ...oo, OrderBy: e.target.value }
                                                        : oo
                                                )
                                            )
                                        }
                                        label={'Order Value'}
                                        className='mt-2 p-1 border-0 cus-inpt'
                                        style={{ width: '80px' }}
                                        placeholder='Order'
                                    />
                                </Card>
                            </div>
                        ))}

                    </div>
                </DialogContent>

                <DialogActions className='d-flex justify-content-between'>
                    <Button onClick={() => setReset(pre => !pre)} variant='outlined' startIcon={<RotateLeft />}>reset</Button>

                    <span>
                        <Button onClick={() => setDialog(false)} color='error'>Cancel</Button>
                        <Button onClick={saveColumnVisiblity} variant='outlined'>Save</Button>
                    </span>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default QPayColumnVisiblitySettings;