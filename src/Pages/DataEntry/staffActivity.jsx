import React, { useEffect, useState, useContext } from 'react';
import { isEqualNumber, ISOString, NumberFormat, onlynum, UTCTime } from '../../Components/functions';
import { toast } from 'react-toastify'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Box } from '@mui/material';
import { TabPanel, TabList, TabContext } from '@mui/lab';
import { MyContext } from '../../Components/context/contextProvider';
import { fetchLink } from '../../Components/fetchComponent';


const StaffActivity = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const { contextObj } = useContext(MyContext);
    const initialValue = {
        Id: '',
        EntryDate: ISOString(),
        EntryTime: '10:00',
        LocationDetails: 'MILL',
        Category: 'OTHERS 1 - PRINT',
        StaffName: '',
        Tonnage: '',
        EntryBy: storage.UserId,
    }
    const [activityData, setActivityData] = useState([]);
    const [staffBasedData, setStaffBasedData] = useState([]);
    const [staffs, setStaffs] = useState([]);
    const [inputValues, setInputValues] = useState(initialValue);
    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState({
        reqDate: ISOString(),
        reqLocation: 'MILL',
        dialog: false,
        view: 'DATA ENTRY',
    })

    useEffect(() => {
        fetchLink({
            address: `dataEntry/staffActivities/staffs`
        }).then(data => setStaffs(data.data)).catch(e => console.error(e))
    }, [reload])

    useEffect(() => {
        if (filter.view === 'DATA ENTRY') {
            setActivityData([])
            fetchLink({
                address: `dataEntry/staffActivities?reqDate=${filter.reqDate}&reqLocation=${filter.reqLocation}`
            }).then(data => {
                if (data.success) {
                    setActivityData(data.data)
                }
            }).catch(e => console.error(e))
        }

        if (filter.view === 'STAFF BASED') {
            setStaffBasedData([]);
            fetchLink({
                address: `dataEntry/staffActivities/staffBased?reqDate=${filter.reqDate}&reqLocation=${filter.reqLocation}`,
            }).then(data => {
                if (data.success) {
                    setStaffBasedData(data.data)
                }
            }).catch(e => console.error(e))
        }

    }, [reload, filter.reqDate, filter.reqLocation, filter.view])

    const closeDialog = () => {
        setFilter(pre => ({ ...pre, dialog: false }));
        setInputValues(initialValue)
    }

    const saveActivity = () => {
        fetchLink({
            address: `dataEntry/staffActivities`,
            method: inputValues.Id ? "PUT" : "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            bodyData: inputValues
        }).then(data => {
            if (data.success) {
                toast.success(data.message);
                setReload(!reload)
            } else {
                toast.error(data.message)
            }
        }).catch(e => console.error(e))
    }

    const dispView = (scr) => {
        switch (scr) {
            case 'DATA ENTRY':
                return (
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th className='fa-14 border text-center py-2 tble-hed-stick' >TIME</th>
                                    {activityData[0] && activityData[0]?.Categories?.map((o, i) => (
                                        <th className='fa-14 border text-center py-2 tble-hed-stick' key={i}>{o?.Category}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {activityData?.map((o, i) => (
                                    <React.Fragment key={i}>
                                        <tr>
                                            <td className='fa-14 fw-bold border text-center text-primary' style={{ verticalAlign: 'middle' }}>
                                                {UTCTime(o?.EntryTime)}
                                            </td>
                                            {o?.Categories?.map((oo, ii) => (
                                                <td key={ii} className='fa-13 fw-bold text-muted border'>
                                                    {oo?.StaffDetails?.map((ooo, iii) => (
                                                        <p
                                                            className='d-flex justify-content-between mb-0 p-1 cellHover'
                                                            onClick={
                                                                isEqualNumber(contextObj?.Edit_Rights, 1)
                                                                    ? () => {
                                                                        setInputValues(ooo);
                                                                        setFilter(pre => ({ ...pre, dialog: true }))
                                                                    }
                                                                    : () => { }
                                                            }
                                                            key={iii}
                                                        >
                                                            <span>{ooo?.StaffName}</span>
                                                            <span className='text-primary ps-2'>{ooo?.Tonnage}</span>
                                                        </p>
                                                    ))}
                                                </td>
                                            ))}
                                        </tr>
                                        <tr>
                                            <td className='border fa-14 text-muted' style={{ verticalAlign: 'middle' }}>Total</td>
                                            {o?.Categories?.map((oo, ii) => (
                                                <td key={ii} className='border text-end text-primary fw-bold'>
                                                    {NumberFormat(oo?.StaffDetails?.reduce((sum, obj) => {
                                                        let total = obj?.Tonnage ? (obj?.Tonnage + sum) : 0;
                                                        return total
                                                    }, 0))}
                                                </td>
                                            ))}
                                        </tr>
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            case 'STAFF BASED':
                return (
                    <>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className='fa-14 text-center border'>Sno</th>
                                        <th className='fa-14 text-center border'>Staff Name</th>
                                        {staffBasedData[0]?.Categories?.map((obj, ind) => (
                                            <th className='fa-14 text-center border' key={ind}>{obj?.Category}</th>
                                        ))}
                                        <th className='fa-14 text-center border'>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staffBasedData?.map((o, i) => (
                                        <tr key={i}>
                                            <td className='fa-13 text-center border'>{i + 1}</td>
                                            <td className='fa-13 text-center border'>{o?.StaffName}</td>
                                            {o?.Categories?.map((obj, ind) => (
                                                <td className='fa-13 text-center border' key={ind}>
                                                    {obj?.StaffDetails?.Tonnage ? NumberFormat(obj?.StaffDetails?.Tonnage) : ''}
                                                </td>
                                            ))}
                                            <td className='fa-14 text-center border blue-text'>
                                                {NumberFormat(o?.Categories?.reduce((sum, obj) => {
                                                    let total = 0;
                                                    total += obj?.Category !== 'OTHERS 1 - PRINT' ? obj?.StaffDetails?.Tonnage ?? 0 : 0
                                                    return total + sum
                                                }, 0))}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )
            default: return <></>
        }
    }

    return (
        <>
            <Card>
                <div className="p-3 fa-16 fw-bold border-bottom d-flex justify-content-between">
                    <span>Staff Activities</span>
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
                    <TabContext value={filter.view}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList
                                indicatorColor='transparant'
                                onChange={(e, n) => setFilter(pre => ({ ...pre, view: n }))}
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                            >
                                <Tab sx={filter.view === 'DATA ENTRY' ? { backgroundColor: '#c6d7eb' } : {}} label={'DATA ENTRY'} value='DATA ENTRY' />
                                <Tab sx={filter.view === 'STAFF BASED' ? { backgroundColor: '#c6d7eb' } : {}} label="STAFF BASED" value='STAFF BASED' />
                            </TabList>
                        </Box>
                        {['DATA ENTRY', 'STAFF BASED'].map(o => (
                            <TabPanel value={o} sx={{ px: 0, py: 2 }} key={o}>
                                {(activityData.length || staffBasedData.length) ? dispView(o) : <></>}
                            </TabPanel>
                        ))}
                    </TabContext>
                </CardContent>
            </Card>


            <Dialog
                open={filter.dialog}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle>{inputValues?.Id ? 'Modify Activity' : 'Add Staff Activity'}</DialogTitle>
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        saveActivity()
                    }}
                >
                    <DialogContent>
                        <div className="table-responsive">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Location</td>
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
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Date</td>
                                        <td className='border-0' >
                                            <input
                                                type="date"
                                                value={inputValues?.EntryDate}
                                                className='cus-inpt'
                                                onChange={e => setInputValues(pre => ({ ...pre, EntryDate: e.target.value }))}
                                                required
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Time</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.EntryTime}
                                                type='time'
                                                required
                                                className='cus-inpt'
                                                onChange={e => setInputValues(pre => ({ ...pre, EntryTime: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Category</td>
                                        <td className='border-0' >
                                            <select
                                                value={inputValues?.Category}
                                                onChange={e => setInputValues(pre => ({ ...pre, Category: e.target.value }))}
                                                className='cus-inpt'
                                                required
                                            >
                                                <option value={'OTHERS 1 - PRINT'}>OTHERS 1 - PRINT</option>
                                                <option value={'OTHERS 2 - TAKEN'}>OTHERS 2 - TAKEN</option>
                                                <option value={'OTHERS 3 - CHECK/ADDRESS'}>OTHERS 3 - CHECK/ADDRESS</option>
                                                <option value={'OTHERS 4 - DISPATCH'}>OTHERS 4 - DISPATCH</option>
                                            </select>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Staff Name</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.StaffName}
                                                type='search'
                                                list='staffList'
                                                required
                                                className='cus-inpt'
                                                placeholder='Type or Search Staff name'
                                                onChange={e => setInputValues(pre => ({ ...pre, StaffName: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Tonnage Value</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.Tonnage}
                                                className='cus-inpt'
                                                onInput={onlynum}
                                                required
                                                onChange={e => setInputValues(pre => ({ ...pre, Tonnage: e.target.value }))}
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
                {staffs.map((o, i) => <option key={i} value={o.StaffName} />)}
            </datalist>
        </>
    )
}

export default StaffActivity;