import React, { useEffect, useState, useContext } from 'react';
import { isEqualNumber, ISOString, validValue, onlynum, firstDayOfMonth, LocalDate } from '../../Components/functions';
import api from '../../API';
import { toast } from 'react-toastify'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { MyContext } from '../../Components/context/contextProvider';
import { fetchLink } from '../../Components/fetchComponent';


const DataEntryAttendance = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const initialValue = {
        Id: '',
        EntryDate: ISOString(),
        LocationDetails: 'MILL',
        WorkDetails: '',
        StaffType: '',
        StaffCount: '',
        EntryBy: storage?.UserId
    }
    const [attendanceData, setAttendanceData] = useState([]);
    const [distinctWorkDetails, setDistinctWorkDetails] = useState([]);
    const [distinctStaffType, setDistinctStaffType] = useState([]);
    const [reload, setReload] = useState(false);
    const [inputValues, setInputValues] = useState(initialValue);
    const { contextObj } = useContext(MyContext);
    const [filter, setFilter] = useState({
        Fromdate: firstDayOfMonth(),
        Todate: ISOString(),
        reqLocation: 'MILL',
        dialog: false,
    })

    useEffect(() => {

        setAttendanceData([]);
        setDistinctStaffType([]);
        setDistinctWorkDetails([]);

        fetchLink({
            address: `dataEntry/dataEntryAttendance?Fromdate=${filter.Fromdate}&Todate=${filter.Todate}&reqLocation=${filter.reqLocation}`
        }).then(data => {
            if (data?.success) {
                setAttendanceData(data?.data)
                setDistinctStaffType(data?.others?.StaffType ?? [])
                setDistinctWorkDetails(data?.others?.WorkDetails ?? [])
            }
        })
        .catch(e => console.error(e))

    }, [filter.Fromdate, filter.Todate, filter.reqLocation, reload])


    const closeDialog = () => {
        setFilter(pre => ({ ...pre, dialog: false }));
        setInputValues(initialValue)
    }

    const saveActivity = () => {
        fetchLink({
            address: `dataEntry/dataEntryAttendance`,
            method: inputValues.Id ? 'PUT' : 'POST',
            bodyData: inputValues
        }).then(data => {
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
                    <span className='p-3'>Staff Attendance</span>
                    {isEqualNumber(contextObj?.Add_Rights, 1) && (
                        <Button
                            variant='outlined'
                            onClick={() => setFilter(pre => ({ ...pre, dialog: true }))}
                            className='me-2'
                        >
                            Add Attendance
                        </Button>
                    )}
                </div>

                <div className="d-flex flex-wrap p-2 px-3">
                    <div className='d-flex flex-column p-1'>
                        <label className='mb-1'>From</label>
                        <input
                            type="date"
                            className='cus-inpt w-auto'
                            value={filter.Fromdate}
                            onChange={e => setFilter(pre => ({ ...pre, Fromdate: e.target.value }))}
                        />
                    </div>
                    <div className='d-flex flex-column p-1'>
                        <label className='mb-1'>To</label>
                        <input
                            type="date"
                            className='cus-inpt w-auto'
                            value={filter.Todate}
                            onChange={e => setFilter(pre => ({ ...pre, Todate: e.target.value }))}
                        />
                    </div>
                    <div className='d-flex flex-column p-1'>
                        <label className='mb-1'>LOCATION</label>
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

                    {attendanceData?.length > 0 && (
                        <div className="table-responsive" style={{ maxHeight: '65dvh', overflow: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className='fa-14 border text-center'></th>
                                        {attendanceData[0]?.Categories?.map((workDetail, index) => (
                                            <th
                                                key={index}
                                                className='fa-14 border text-center'
                                                colSpan={workDetail?.StaffTypes?.length}
                                            >
                                                {workDetail?.WorkDetails}
                                            </th>
                                        ))}
                                        <th className='fa-14 border text-center'></th>
                                    </tr>
                                    <tr>
                                        <th className='fa-14 border text-center tble-hed-stick'>DATE</th>
                                        {attendanceData[0]?.Categories?.map(workDetail =>
                                            workDetail?.StaffTypes?.map((staffType, index) => (
                                                <th key={index} className='fa-14 border text-center'>{staffType?.StaffType}</th>
                                            ))
                                        )}
                                        <th className='fa-14 border text-center'>TOTAL</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData?.map((o, i) => (
                                        <tr key={i}>
                                            <td className='fa-13 border text-center'>{LocalDate(o?.EntryDate)}</td>
                                            {o?.Categories?.map(oo => (
                                                oo?.StaffTypes?.map((staff, staffInd) => (
                                                    <td
                                                        key={staffInd}
                                                        className='fa-13 border text-center p-0'
                                                        onClick={
                                                            staff?.StaffAttendance?.Id
                                                                ? () => {
                                                                    setInputValues({
                                                                        ...staff?.StaffAttendance,
                                                                        EntryDate: staff?.StaffAttendance?.EntryDate ? ISOString(staff?.StaffAttendance?.EntryDate) : ''
                                                                    })
                                                                    setFilter(pre => ({ ...pre, dialog: true }))
                                                                }
                                                                : undefined
                                                        }
                                                    >
                                                        <div className={`${staff?.StaffAttendance?.Id ? 'cellHover p-2' : ''}`}>
                                                            {staff?.StaffAttendance?.StaffCount}
                                                        </div>
                                                    </td>
                                                ))
                                            ))}
                                            <td className='fa-13 border text-center blue-text'>
                                                {o?.Categories?.reduce((catSum, catObj) => (
                                                    catSum += Number(
                                                        catObj?.StaffTypes?.reduce((staffSum, staffObj) => (
                                                            staffSum += Number(
                                                                staffObj?.StaffAttendance?.StaffCount
                                                            ) || 0
                                                        ), 0)
                                                    ) || 0
                                                ), 0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </CardContent>

            </Card>

            <Dialog
                open={filter.dialog}
                onClose={closeDialog}
                fullWidth maxWidth='sm'
            >
                <DialogTitle className=' bg-light'>{inputValues?.Id ? 'Modify Attendance' : 'Add Attendance'}</DialogTitle>
                <form onSubmit={e => {
                    e.preventDefault();
                    saveActivity();
                }} >
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
                                                required
                                                className='cus-inpt'
                                                onChange={e => setInputValues(pre => ({ ...pre, EntryDate: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Work Type</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.WorkDetails}
                                                type='search'
                                                list='workDetails'
                                                required
                                                className='cus-inpt'
                                                placeholder='Type or Search Work Details'
                                                onChange={e => setInputValues(pre => ({ ...pre, WorkDetails: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Staff Type</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.StaffType}
                                                type='search'
                                                list='staffDetails'
                                                required
                                                className='cus-inpt'
                                                placeholder='Type or Search Staff Type'
                                                onChange={e => setInputValues(pre => ({ ...pre, StaffType: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Staff's Count</td>
                                        <td className='border-0'>
                                            <input
                                                value={validValue(inputValues?.StaffCount)}
                                                className='cus-inpt'
                                                onInput={onlynum}
                                                required
                                                onChange={e => setInputValues(pre => ({ ...pre, StaffCount: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={closeDialog} type='button'>Cancel</Button>
                        <Button type='submit' variant='contained'>SUBMIT</Button>
                    </DialogActions>
                </form>
            </Dialog>


            <datalist id='staffDetails'>
                {distinctStaffType?.map((o, i) => <option key={i} value={o.StaffType} />)}
            </datalist>

            <datalist id='workDetails'>
                {distinctWorkDetails?.map((o, i) => <option key={i} value={o.WorkDetails} />)}
            </datalist>
        </>
    )
}

export default DataEntryAttendance;