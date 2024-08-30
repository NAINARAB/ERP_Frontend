import { Button, Card, CardContent, Dialog, DialogContent, DialogTitle, DialogActions } from "@mui/material"
import { useEffect, useState } from "react";
import api from "../../API";
import { LocalDate, LocalTime } from "../../Components/functions";
import { toast } from "react-toastify";

const AttendanceComp = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const initialValue = {
        Latitude: null,
        Longitude: null,
        error: null,
        UserId: storage.UserId,
        Description: '',
        dialog: false
    }
    const [lastAttendance, setLastAttendance] = useState({});
    const [reload, setReload] = useState(false);
    const [inputValue, setInputValue] = useState(initialValue);

    useEffect(() => {
        setLastAttendance({})
        fetch(`${api}getMyLastAttendance?UserId=${storage?.UserId}`)
            .then(res => res.json())
            .then(data => {
                if (data?.success && data?.data?.length > 0) {
                    setLastAttendance(data?.data[0])
                }
            })
            .catch(e => console.error(e))
    }, [storage?.UserId, reload])

    const getLocation = async () => {

        try {

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            const { latitude, longitude } = position.coords;

            setInputValue(pre => ({
                ...pre,
                Latitude: latitude,
                Longitude: longitude,
                error: null
            }));

            return true;

        } catch (error) {
            if (error.code === error.PERMISSION_DENIED) {
                setInputValue(pre => ({
                    ...pre,
                    Latitude: null,
                    Longitude: null,
                    error: 'Location access denied'
                }));

                toast.warn('Allow Location Access');
            } else {
                setInputValue(pre => ({
                    ...pre,
                    Latitude: null,
                    Longitude: null,
                    error: error.message
                }));
            }

            return false;
        }
    };

    const StartDay = () => {
        getLocation().then(hasLocationAccess => {
            if (hasLocationAccess) {
                if (inputValue?.Latitude && inputValue?.Longitude) {
                    fetch(`${api}attendance`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            UserId: inputValue?.UserId,
                            Latitude: inputValue?.Latitude,
                            Longitude: inputValue?.Longitude
                        })
                    })
                        .then(res => res.json())
                        .then(data => {
                            setReload(!reload)
                            if (data.success) {
                                toast.success(data.message)
                            } else {
                                toast.error(data.message)
                            }
                        })
                        .catch(e => console.error(e))
                } else {
                    toast.warn('Please Retry')
                }
            } else {
                toast.error('There is a problem in get location')
            }
        });
    };

    const EndDay = () => {
        fetch(`${api}attendance`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Id: lastAttendance?.Id,
                Description: inputValue?.Description
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setReload(!reload)
                    toast.success(data.message);
                    resetValues()
                } else {
                    toast.error(data.message)
                }
            })
            .catch(e => console.error(e))
    }

    const resetValues = () => {
        setInputValue(initialValue)
    }

    return (
        <>
            <Card className="col-xl-4    col-lg-6 col-md-6">
                <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <h5 className="mb-0">Attendance</h5>
                    <Button
                        variant='outlined'
                        onClick={StartDay}
                        disabled={Boolean(lastAttendance?.Active_Status)}
                    >
                        START Day
                    </Button>
                </div>
                {Boolean(lastAttendance?.Active_Status) && (
                    <>
                        <CardContent >
                            <div className="fw-bold text-muted">
                                <div className="d-flex justify-content-between">
                                    <span>Start Date</span><br />
                                    <span>{lastAttendance?.Start_Date ? LocalDate(lastAttendance?.Start_Date) : ' --:--:-- '}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span>In Time</span>
                                    <span>{lastAttendance?.Start_Date ? LocalTime(lastAttendance?.Start_Date) : ' --:--:-- '}</span>
                                </div>
                            </div>
                        </CardContent>
                        <div className="border-top p-3 d-flex justify-content-end">
                            <Button variant='outlined' onClick={() => setInputValue(pre => ({ ...pre, dialog: true }))}>End Day</Button>
                        </div>
                    </>
                )}
            </Card>

            <Dialog
                open={inputValue?.dialog}
                onClose={resetValues}
                fullWidth maxWidth='md'
            >
                <DialogTitle>Cloase Attendance</DialogTitle>
                <DialogContent>
                    <label className="mb-3">Work Summary</label>
                    <textarea 
                        value={inputValue?.Description}
                        className="cus-inpt"
                        rows={5}
                        onChange={e => setInputValue(pre => ({ ...pre, Description: e.target.value}))}
                        placeholder="Narrate the today's work summary"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={resetValues}>Cancel</Button>
                    <Button variant='outlined' onClick={EndDay}>Confirm</Button>
                </DialogActions>
            </Dialog>
        </>
    )
}


export default AttendanceComp;