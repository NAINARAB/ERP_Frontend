import React, { useEffect, useState, useContext } from 'react';
import { isEqualNumber, ISOString, validValue, onlynum, convertToTimeObject, getCurrentTime } from '../../Components/functions';
import api from '../../API';
import { toast } from 'react-toastify'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material'
import { MyContext } from '../../Components/context/contextProvider';



const DeliveryActivity = () => {
    const storage = JSON.parse(localStorage.getItem('user'))
    const [deliveryData, setDeliveryData] = useState([]);
    const [reload, setReload] = useState(false);
    const initialValue = {
        Id: '',
        EntryDate: ISOString(),
        EntryTime: getCurrentTime(),
        LocationDetails: 'MILL',
        NotTaken: 0,
        NotVerified: 0,
        NotDelivery: 0,
        OverAllSales: 0,
        EntryBy: storage.UserId
    }
    const [inputValues, setInputValues] = useState(initialValue);
    const { contextObj } = useContext(MyContext);
    const [filter, setFilter] = useState({
        reqDate: ISOString(),
        LocationDetails: 'MILL',
        dialog: false,
    })

    useEffect(() => {
        setDeliveryData([])
        fetch(`${api}deliveryActivities?reqDate=${filter.reqDate}&reqLocation=${filter.LocationDetails}`)
            .then(res => res.json())
            .then(data => setDeliveryData(data?.data))
            .catch(e => console.error(e))
    }, [reload, filter.reqDate, filter.LocationDetails])

    const closeDialog = () => {
        setFilter(pre => ({ ...pre, dialog: false }));
        setInputValues(initialValue)
    }

    const saveActivity = () => {
        fetch(`${api}deliveryActivities`, {
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
                    closeDialog()
                    setReload(!reload)
                } else {
                    toast.error(data.message)
                }
            }).catch(e => console.error(e))
    }


    return (
        <>
            <Card>
                <div className="fa-16 fw-bold border-bottom d-flex justify-content-between align-items-center">
                    <span className='p-3'>Delivery Activities</span>
                    {isEqualNumber(contextObj?.Add_Rights, 1) && (
                        <Button 
                            variant='outlined' 
                            onClick={() => setFilter(pre => ({ ...pre, dialog: true }))}
                            className='me-2'
                        >
                            Add Activity
                        </Button>
                    )}
                </div>

                <CardContent>
                    <div className="d-flex flex-wrap">
                        <div className='p-2'>
                            <label>Date</label><br />
                            <input
                                value={filter.reqDate}
                                type='date'
                                className='cus-inpt w-auto'
                                onChange={e => setFilter(pre => ({ ...pre, reqDate: e.target.value }))}
                            />
                        </div>
                        <div className='p-2'>
                            <label>LOCATION</label><br />
                            <select
                                className='cus-inpt'
                                value={filter.LocationDetails}
                                onChange={e => setFilter(pre => ({ ...pre, LocationDetails: e.target.value }))}
                            >
                                <option value="MILL">MILL</option>
                                <option value="GODOWN">GODOWN</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    {['sno', 'time', 'NOT TAKEN - 30 MINS', 'Not verified - Before 45 mins',
                                        'Not Delivery - Before 105 mins', 'OVERALL SALES'
                                    ].map((o, i) => (
                                        <th className='border text-center fa-13 text-uppercase' key={i}>{o}</th>
                                    ))}
                                    {isEqualNumber(contextObj?.Edit_Rights, 1) && (
                                        <th className='border text-center fa-13'>ACTION</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {deliveryData?.map(o => (
                                    o?.DeliveryList?.map((oo, ii) => (
                                        <tr key={ii}>
                                            <td className='fa-13 border text-center'>{ii + 1}</td>
                                            <td className='fa-16 border text-center fw-bold text-primary'>
                                                {convertToTimeObject(oo?.EntryTime)}
                                            </td>
                                            {['NotTaken', 'NotVerified', 'NotDelivery', 'OverAllSales'].map((ooo, iii) => (
                                                <td className='fa-13 border text-center' key={iii}>{validValue(oo[ooo])}</td>
                                            ))}

                                            {isEqualNumber(contextObj?.Edit_Rights, 1) && (
                                                <td className='fa-13 border text-center'>
                                                    <IconButton
                                                        onClick={() => {
                                                            setInputValues(oo)
                                                            setFilter(pre => ({ ...pre, dialog: true }));
                                                        }}
                                                        size='small'
                                                    >
                                                        <Edit className='fa-18' />
                                                    </IconButton>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                ))}
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
                <DialogTitle className=' bg-light'>{inputValues?.Id ? 'Modify Activity' : 'Add Delivery Activity'}</DialogTitle>
                <DialogContent>

                    <div className="table-responsive">
                        <table className="table">
                            <tbody>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>Location</td>
                                    <td className='border-0'>
                                        <select
                                            value={inputValues?.LocationDetails}
                                            onChange={e => setInputValues(pre => ({ ...pre, LocationDetails: e.target.value }))}
                                            className='cus-inpt'
                                        >
                                            <option value={'MILL'}>MILL</option>
                                            <option value={'GODOWN'}>GODOWN</option>
                                        </select>
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>Date</td>
                                    <td className='border-0'>
                                        <input
                                            type="date"
                                            value={inputValues?.EntryDate}
                                            className='cus-inpt'
                                            onChange={e => setInputValues(pre => ({ ...pre, EntryDate: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>Time</td>
                                    <td className='border-0'>
                                        <input
                                            type='time'
                                            value={inputValues?.EntryTime}
                                            className='cus-inpt'
                                            onChange={e => setInputValues(pre => ({ ...pre, EntryTime: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>Not Taken</td>
                                    <td className='border-0'>
                                        <input
                                            value={validValue(inputValues?.NotTaken)}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, NotTaken: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>Not Verified</td>
                                    <td className='border-0'>
                                        <input
                                            value={validValue(inputValues?.NotVerified)}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, NotVerified: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>Not Delivery</td>
                                    <td className='border-0'>
                                        <input
                                            value={validValue(inputValues?.NotDelivery)}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, NotDelivery: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border-0' style={{ verticalAlign: 'middle' }}>Overall Sales</td>
                                    <td className='border-0'>
                                        <input
                                            value={validValue(inputValues?.OverAllSales)}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, OverAllSales: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </DialogContent>
                <DialogActions>
                    <Button>CANCEL</Button>
                    <Button variant='outlined' onClick={saveActivity}>save</Button>
                </DialogActions>
            </Dialog>
        </>
    )


}


export default DeliveryActivity;