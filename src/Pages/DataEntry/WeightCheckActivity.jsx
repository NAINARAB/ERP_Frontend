import React, { useEffect, useState, useContext } from 'react';
import { customTimeDifference, extractHHMM, isEqualNumber, ISOString, NumberFormat, Subraction, timeToDate, UTCTime } from '../../Components/functions';
import api from '../../API';
import { toast } from 'react-toastify'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { MyContext } from '../../Components/context/contextProvider';



const WeightCheckActivity = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const { contextObj } = useContext(MyContext);
    const initialValue = {
        Id: 0,
        EntryDate: ISOString(),
        LocationDetails: 'MILL',
        StockItem: '',
        StartTime: '10:00',
        EndTime: '12:00',
        InputKG: 0,
        OutputKG: 0,
        WeingtCheckedBy: '',
        ApproximateOutput: 0,
        EntryBy: storage.UserId,
    }
    const [activityData, setActivityData] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [stockItems, setStockItems] = useState([]);
    const [inputValues, setInputValues] = useState(initialValue);
    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState({
        reqDate: ISOString(),
        reqLocation: 'MILL',
        dialog: false
    })

    useEffect(() => {
        fetch(`${api}weightCheckActivity/getStaffs`)
            .then(res => res.json())
            .then(data => setStaffs(data.data))
            .catch(e => console.error(e))
        fetch(`${api}weightCheckActivity/getItems`)
            .then(res => res.json())
            .then(data => setStockItems(data.data))
            .catch(e => console.error(e))
    }, [reload])

    useEffect(() => {
        fetch(`${api}weightCheckActivity?reqDate=${filter.reqDate}&reqLocation=${filter.reqLocation}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const timeformat = data.data?.map(o => ({
                        ...o,
                        StartTime: extractHHMM(o?.StartTime),
                        EndTime: extractHHMM(o?.EndTime),
                    }))
                    setActivityData(timeformat)
                    
                }
            })
            .catch(e => console.error(e))
    }, [reload, filter.reqDate, filter.reqLocation])

    const closeDialog = () => {
        setFilter(pre => ({ ...pre, dialog: false }));
        setInputValues(initialValue)
    }

    const saveActivity = () => {
        fetch(`${api}weightCheckActivity`, {
            method: inputValues.Id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(inputValues)
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    toast.success(data.message);
                    setReload(!reload);
                    closeDialog()
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
    }

    return (
        <>
            <Card>
                <div className="p-2 border-bottom fa-16 fw-bold d-flex justify-content-between align-items-center">
                    <span className="text-primary text-uppercase ps-3">WeiGht Checking</span>
                    {isEqualNumber(contextObj?.Add_Rights, 1) && (
                        <Button variant='outlined' onClick={() => setFilter(pre => ({ ...pre, dialog: true }))}>Add Activity</Button>
                    )}
                </div>

                <div className="d-flex p-2 px-3">
                    <div>
                        <label className='mb-1 w-100'>DATE</label>
                        <input
                            type="date"
                            className='cus-inpt w-auto'
                            value={filter.reqDate}
                            onChange={e => setFilter(pre => ({ ...pre, reqDate: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className='mb-1 w-100'>LOCATION</label>
                        <select
                            className='cus-inpt w-auto'
                            value={filter.reqLocation}
                            onChange={e => setFilter(pre => ({ ...pre, reqLocation: e.target.value }))}
                        >
                            <option value="MILL">MILL</option>
                            <option value="GODOWN">GODOWN</option>
                        </select>
                    </div>
                </div>

                <CardContent>
                    <div className="table-responsive">
                        <table className="table">

                            <thead>
                                <tr>
                                    {[
                                        'SNo', 'Stock Item', 'Start', 'End', 'Duration',
                                        'Input', 'Output', 'Difference', 'Expected', 'Actual', 'Weingt Checked By'
                                    ].map((o, i) => (
                                        <th key={i} className='border fa-14 text-muted text-uppercase text-center'>{o}</th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {activityData?.length > 0 && (
                                    activityData?.map((o, i) => (
                                        <tr key={i}>
                                            <td className='border text-center fa-13'>{i + 1}</td>
                                            <td
                                                className='border fa-13 cellHoverColor'
                                                onClick={() => {
                                                    setInputValues(o);
                                                    setFilter(pre => ({ ...pre, dialog: true }));
                                                }}
                                            >{o?.StockItem}</td>
                                            <td className='border text-center fa-13'>
                                                {o?.StartTime ? UTCTime(timeToDate(o?.StartTime)) : '-'}
                                            </td>
                                            <td className='border text-center fa-13'>
                                                {o?.EndTime ? UTCTime(timeToDate(o?.EndTime)) : '-'}
                                            </td>
                                            <td className='border text-center fa-13 text-primary fw-bold'>
                                                {(o?.StartTime && o?.EndTime) ? customTimeDifference(o?.StartTime, o?.EndTime) : '-'}
                                            </td>
                                            <td className='border text-center fa-13'>
                                                {o?.InputKG ? NumberFormat(o?.InputKG) : '-'}
                                            </td>
                                            <td className='border text-center fa-13'>
                                                {o?.OutputKG ? NumberFormat(o?.OutputKG) : '-'}
                                            </td>
                                            <td className='border text-center fa-13 text-primary fw-bold'>
                                                {(o?.InputKG && o?.OutputKG) ? Subraction(o?.OutputKG, o?.InputKG) : '-'}
                                            </td>
                                            <td className='border text-center fa-13'>{o?.ApproximateOutput ? o?.ApproximateOutput + '%' : '-'}</td>
                                            <td className='border text-center fa-13'>
                                                {(o?.InputKG && o?.OutputKG) ? (((o.OutputKG / o.InputKG) * 100).toFixed(2)) + '%' : '-'}
                                            </td>
                                            <td className='border text-center fa-13'>{o?.WeingtCheckedBy}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Dialog
                open={filter.dialog}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>
                    {inputValues?.Id ? 'Modify Activity' : 'Add Activity'}
                </DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();
                    saveActivity();
                }}>
                    <DialogContent>
                        <div className="table-responsive">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className='border-0 fa-15' style={{ verticalAlign: 'middle' }}>Date</td>
                                        <td className='border-0' >
                                            <input
                                                type="date"
                                                value={inputValues?.EntryDate ? ISOString(inputValues?.EntryDate) : ''}
                                                className='cus-inpt'
                                                onChange={e => setInputValues(pre => ({ ...pre, EntryDate: e.target.value }))}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0 fa-15' style={{ verticalAlign: 'middle' }}>Location</td>
                                        <td className='border-0' >
                                            <select
                                                value={inputValues?.LocationDetails}
                                                onChange={e => setInputValues(pre => ({ ...pre, LocationDetails: e.target.value }))}
                                                className='cus-inpt'
                                                required
                                            >
                                                <option value={'MILL'}>MILL</option>
                                                <option value={'GODOWN'}>GODOWN</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0 fa-15' style={{ verticalAlign: 'middle' }}>Stock Item</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.StockItem}
                                                type='search'
                                                list='StockItem'
                                                required
                                                className='cus-inpt'
                                                placeholder='Type or Search Stock Item'
                                                onChange={e => setInputValues(pre => ({ ...pre, StockItem: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0 fa-15' style={{ verticalAlign: 'middle' }}>Start Time</td>
                                        <td className='border-0'>
                                            <input
                                                value={inputValues?.StartTime ? inputValues?.StartTime : ''}
                                                className='cus-inpt'
                                                type='time'
                                                required
                                                onChange={e => setInputValues(pre => ({ ...pre, StartTime: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0 fa-15' style={{ verticalAlign: 'middle' }}>End Time</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.EndTime ? inputValues?.EndTime : ''}
                                                className='cus-inpt'
                                                type='time'
                                                min={inputValues.StartTime ? extractHHMM(inputValues?.StartTime) : ''}
                                                required
                                                onChange={e => setInputValues(pre => ({ ...pre, EndTime: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0 fa-15' style={{ verticalAlign: 'middle' }}>Input KGs</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.InputKG ? inputValues?.InputKG : ''}
                                                className='cus-inpt'
                                                type='number'
                                                required
                                                min={1}
                                                placeholder='Weight in kgs'
                                                onChange={e => setInputValues(pre => ({ ...pre, InputKG: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0 fa-15' style={{ verticalAlign: 'middle' }}>Output KGs</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.OutputKG ? inputValues?.OutputKG : ''}
                                                className='cus-inpt'
                                                type='number'
                                                required
                                                min={1}
                                                placeholder='Weight in kgs'
                                                onChange={e => setInputValues(pre => ({ ...pre, OutputKG: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0 fa-15' style={{ verticalAlign: 'middle' }}>Expected Output ( % )</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.ApproximateOutput ? inputValues?.ApproximateOutput : ''}
                                                className='cus-inpt'
                                                type='number'
                                                required
                                                min={1}
                                                placeholder='in Percentage (%)'
                                                onChange={e => setInputValues(pre => ({ ...pre, ApproximateOutput: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0 fa-15' style={{ verticalAlign: 'middle' }}>Weight Checked By</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.WeingtCheckedBy}
                                                type='search'
                                                list='staffList'
                                                required
                                                className='cus-inpt'
                                                placeholder='Type or Search Name'
                                                onChange={e => setInputValues(pre => ({ ...pre, WeingtCheckedBy: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={closeDialog} type='button'>Cancel</Button>
                        <Button type='submit'>SUBMIT</Button>
                    </DialogActions>
                </form>
            </Dialog>

            <datalist id='staffList'>
                {staffs.map((o, i) => <option key={i} value={o.WeingtCheckedBy} />)}
            </datalist>

            <datalist id='StockItem'>
                {stockItems.map((o, i) => <option key={i} value={o.StockItem} />)}
            </datalist>
        </>
    )
}

export default WeightCheckActivity;