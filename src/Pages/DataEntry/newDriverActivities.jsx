import React, { useEffect, useState, useContext } from 'react';
import { convertToTimeObject, createAbbreviation, isEqualNumber, ISOString, NumberFormat, onlynum, UTCTime } from '../../Components/functions';
import api from '../../API';
import { toast } from 'react-toastify'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Tab, Box } from '@mui/material';
import { TabPanel, TabList, TabContext } from '@mui/lab';
import { MyContext } from '../../Components/context/contextProvider';
import { fetchLink } from '../../Components/fetchComponent';


const ContCard = ({ Value, Label }) => (
    <div className="grid-card d-flex align-items-center justify-content-center flex-column cus-shadow">
        <h1 style={{ fontSize: '45px', color: 'blue', margin: '0 0.5em' }}>{NumberFormat(Value)}</h1>
        <h2 className='fa-20'>{Label}</h2>
    </div>
)

const DriverActivities = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const { contextObj } = useContext(MyContext);

    const initialValue = {
        Id: '',
        ActivityDate: ISOString(),
        LocationDetails: 'MILL',
        DriverName: '',
        TripCategory: 'LRY SHED & LOCAL',
        TonnageValue: '',
        TripNumber: 1,
        EventTime: '10:00',
        EndTime: '12:00',
        VehicleNumber: '',
        CreatedBy: storage.UserId,
    }
    const [activityData, setActivityData] = useState([]);
    const [driverBased, setDriverBased] = useState([]);
    const [listBased, setListBased] = useState([]);
    const [timeBased, setTimeBased] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [inputValues, setInputValues] = useState(initialValue);
    const [reload, setReload] = useState(false);
    const [filter, setFilter] = useState({
        reqDate: ISOString(),
        reqLocation: 'MILL',
        dialog: false,
        view: 'LIST',
    })


    useEffect(() => {
        fetchLink({
            address: `dataEntry/driverActivities/drivers`
        }).then(data => setDrivers(data.success ? data.data : [])).catch(e => console.error(e))
    }, [reload])

    useEffect(() => {
        fetchLink({
            address: `dataEntry/driverActivities?reqDate=${filter.reqDate}&reqLocation=${filter.reqLocation}`
        }).then(data => {
            if (data.success) {
                setActivityData(data.success ? data.data : [])
            }
        }).catch(e => console.error(e))

        fetchLink({
            address: `dataEntry/driverActivities/tripBased?reqDate=${filter.reqDate}&reqLocation=${filter.reqLocation}`
        }).then(data => setDriverBased(data.success ? data.data : [])).catch(e => console.error(e))

        fetchLink({
            address: `dataEntry/driverActivities/timeBased?reqDate=${filter.reqDate}&reqLocation=${filter.reqLocation}`
        }).then(data => setTimeBased(data.success ? data.data : [])).catch(e => console.error(e))

        fetchLink({
            address: `dataEntry/driverActivities/view2?reqDate=${filter.reqDate}&reqLocation=${filter.reqLocation}`
        }).then(data => setListBased(data.success ? data.data : [])).catch(e => console.error(e))
    }, [reload, filter.reqDate, filter.reqLocation])

    const closeDialog = () => {
        setFilter(pre => ({ ...pre, dialog: false }));
        setInputValues(initialValue)
    }

    const saveActivity = () => {
        fetchLink({
            address: `dataEntry/driverActivities`,
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

    const DriverDispComp = ({ obj }) => {

        const newRowTotal = obj?.LocationGroup?.reduce((total, group) => {
            const groupTonnage = group?.TripDetails?.reduce((grpSum, trip) => {
                const tripTotal = trip?.Trips?.reduce((sum, trip) => sum + (trip?.TonnageValue || 0), 0);
                return tripTotal + grpSum;
            }, 0);
            return total + groupTonnage;
        }, 0);

        return (
            <tr>
                <td
                    style={{ verticalAlign: 'middle' }}
                    className='fa-13 fw-bold text-primary border rounded-4 text-center'
                >
                    {obj.DriverName}
                </td>
                {obj?.LocationGroup?.map(o => o?.TripDetails?.map((oo, ii) => (
                    <td key={ii} className='border rounded-4 p-0' >

                        {oo?.Trips.map((ooo, iii) => (
                            <div
                                className='d-flex justify-content-between p-1 cellHover'
                                key={iii}
                                onClick={
                                    isEqualNumber(contextObj?.Edit_Rights, 1)
                                        ? () => {
                                            setInputValues(ooo);
                                            setFilter(pre => ({ ...pre, dialog: true }))
                                        }
                                        : () => { }
                                }
                            >
                                <span className='p-1 fa-14 fw-bold text-primary'>{NumberFormat(ooo?.TonnageValue)}</span>
                                <span className='p-1 fa-13'>{ooo?.EventTime ? convertToTimeObject(ooo?.EventTime) : '-'}</span>
                            </div>
                        ))}

                    </td>
                )))}
                <td className='border' style={{ verticalAlign: 'middle' }}>
                    <h6 className=' my-auto text-center'>{NumberFormat(newRowTotal)}</h6>
                </td>
            </tr>
        )
    }

    const calculateCategoryTotals = (data) => {
        const categoryTotals = {};

        data.forEach(driver => {
            driver.LocationGroup.forEach(group => {
                if (!categoryTotals[group.TripCategory]) {
                    categoryTotals[group.TripCategory] = 0;
                }
                group.TripDetails.forEach(detail => {
                    categoryTotals[group.TripCategory] += detail?.Trips?.reduce((sum, obj) => sum + (obj?.TonnageValue || 0), 0);
                });
            });
        });

        return categoryTotals;
    };

    const categoryTotals = calculateCategoryTotals(activityData);

    const totalTonnageValue = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    const dispView = (val) => {

        switch (val) {
            case 'DATA ENTRY':
                return (
                    <div className="table-responsive">
                        <table className='table'>

                            <thead>
                                <tr>
                                    <th className='fa-14 border' style={{ backgroundColor: '#EDF0F7' }}>Driver Name</th>
                                    {activityData[0] && activityData[0]?.LocationGroup?.map((o, i) => (
                                        <th
                                            className='fa-14 border text-center'
                                            key={i}
                                            colSpan={o?.TripDetails?.length}
                                            style={{ backgroundColor: '#EDF0F7' }}
                                        >
                                            {o?.TripCategory}
                                        </th>
                                    ))}
                                    <th className='border' style={{ backgroundColor: '#EDF0F7' }}></th>
                                </tr>
                                <tr>
                                    <th className='border'></th>
                                    {activityData[0] && activityData[0]?.LocationGroup?.map(o => o?.TripDetails?.map((oo, ii) => (
                                        <th className='fa-14 border text-center' key={ii}>
                                            {createAbbreviation(o?.TripCategory)}-{oo.TripNumber}
                                        </th>
                                    )))}
                                    <th className='fa-14 border text-center'>Total</th>
                                </tr>
                            </thead>

                            <tbody>

                                {activityData?.map((o, i) => <DriverDispComp key={i} obj={o} />)}

                                <tr>
                                    <td className='border'></td>
                                    {activityData[0] && activityData[0]?.LocationGroup?.map((o, i) => (
                                        <td
                                            className='fa-13 border text-center fw-bold'
                                            key={i}
                                            colSpan={o?.TripDetails?.length}
                                        >
                                            {categoryTotals[o.TripCategory] ? NumberFormat(categoryTotals[o.TripCategory]) : '-'}
                                        </td>
                                    ))}
                                    <td className='fa-14 fw-bold border text-primary text-center'>{NumberFormat(totalTonnageValue)}</td>
                                </tr>

                            </tbody>
                        </table>
                    </div>
                )
            case 'ABSTRACT':
                return (
                    <>
                        <div className="my-2">
                            <div className='cus-grid text-dark'>
                                <ContCard Value={activityData?.length} Label={'DRIVERS'} />
                                <ContCard
                                    Value={driverBased?.reduce((sum, obj) => {
                                        let total = 0;
                                        total += obj?.Trips?.length || 0
                                        return total + sum;
                                    }, 0)}
                                    Label={'TRIPS'}
                                />
                                <ContCard Value={totalTonnageValue} Label={'TOTAL'} />
                                {Object.entries(categoryTotals).map(([objKey, objValue]) => <ContCard key={objKey} Value={objValue} Label={objKey} />)}
                            </div>
                        </div>
                    </>
                )
            case 'CATEGORY BASED':
                return (
                    <div className="d-flex justify-content-around flex-wrap my-3">
                        {Object.entries(categoryTotals).map(([objKey, objValue]) => (
                            <div className="grid-card w-100 my-2 cus-shadow" style={{ backgroundColor: '#EDF0F7' }} key={objKey}>
                                <h6 className=' fw-bold fa-18 d-flex justify-content-between'>
                                    <span>{objKey}</span>
                                    <span>{NumberFormat(objValue)}</span>
                                </h6>
                                {activityData?.map(oo => (
                                    oo?.LocationGroup?.map(loc => (objKey === loc?.TripCategory) && (
                                        loc.TripDetails?.map(trip => trip?.Trips?.map((tr, ti) => (
                                            <div className="p-2 my-2 border grid-card bg-white d-flex justify-content-between" key={ti}>
                                                <span>{tr?.DriverName}</span>
                                                <span>
                                                    <span className='pe-2 text-primary fw-bold'>{NumberFormat(tr?.TonnageValue)}</span>
                                                    {tr?.EventTime ? convertToTimeObject(tr?.EventTime) : '-'}
                                                </span>
                                            </div>
                                        )))
                                    ))
                                ))}
                            </div>
                        ))}
                    </div>
                )
            case 'DRIVER BASED':
                return (
                    driverBased?.map((o, i) => (
                        <Card
                            component={Paper}
                            variant='outlined'
                            className="p-3 my-3 "
                            key={i}
                        >
                            <div>
                                <h6 className='blue-text mb-2 pb-2 d-flex justify-content-between border-bottom fa-20'>
                                    <span>{o?.DriverName}</span>
                                    <span>
                                        {NumberFormat(o?.Trips?.reduce((sum, obj) => {
                                            let total = 0;
                                            obj?.Categories?.forEach(cat => total += cat?.TonnageValue || 0)
                                            return total + sum
                                        }, 0))}
                                        <span className='text-muted fa-14 ps-2 fw-light'>/ {o?.Trips?.length}</span>
                                    </span>
                                </h6>

                                <div className="d-flex justify-content-around flex-wrap">
                                    {Object.keys(categoryTotals).map((objKey, ind) => (
                                        <div
                                            className="d-flex justify-content-between align-items-center m-2 border rounded-3 p-3"
                                            style={{ minWidth: '250px', backgroundColor: '#EAFEFF' }}
                                            key={ind}
                                        >
                                            <h6 className='fw-bold mb-0 text-muted'>{objKey}</h6>
                                            <h6 className='blue-text mb-0'>
                                                {NumberFormat(o?.Trips?.reduce((totalSum, oo) => {
                                                    let ovTotal = 0;
                                                    ovTotal += oo?.Categories?.reduce((sum, cat) => {
                                                        let total = 0;
                                                        total += (cat?.TripCategory === objKey) ? cat?.TonnageValue : 0
                                                        return total + sum
                                                    }, 0)
                                                    return ovTotal + totalSum
                                                }, 0))}
                                            </h6>
                                        </div>
                                    ))}
                                </div>

                                <div className="table-responsive rounded-3 overflow-hidden border p-0">
                                    <table className="table m-0">
                                        <thead>
                                            <tr>
                                                <th className='fa-14 text-center border-bottom'>Trip No</th>
                                                <th className='fa-14 text-center '>Category</th>
                                                <th className='fa-14 text-center '>Tonnage</th>
                                                <th className='fa-14 text-center '>Time</th>
                                                <th className='fa-14 text-center '>Trip-Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {o?.Trips?.map((trip, tripInd) => {
                                                const categoryCount = trip?.Categories?.length || 1;
                                                const totalTonnage = trip?.Categories?.reduce((sum, obj) => sum + (obj?.TonnageValue || 0), 0);

                                                return (
                                                    trip?.Categories?.map((cat, catInd) => (
                                                        <tr key={`${tripInd}-${catInd}`}>
                                                            {catInd === 0 && (
                                                                <td className='fa-14 border-end border-bottom text-center fw-bold' rowSpan={categoryCount} style={{ verticalAlign: 'middle' }}>
                                                                    {trip?.TripNumber}
                                                                </td>
                                                            )}
                                                            <td className='fa-13 border-end border-bottom text-center'>
                                                                {cat?.TripCategory}
                                                            </td>
                                                            <td className='fa-13 border-end border-bottom text-center'>
                                                                {cat?.TonnageValue}
                                                            </td>
                                                            <td className='fa-13 border-end border-bottom text-center'>
                                                                {cat?.EventTime ? convertToTimeObject(cat?.EventTime) : '-'}
                                                            </td>
                                                            {catInd === 0 && (
                                                                <td className='fa-16 border-end border-bottom text-center blue-text' rowSpan={categoryCount} style={{ verticalAlign: 'middle' }}>
                                                                    {NumberFormat(totalTonnage)}
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                            </div>
                        </Card>
                    ))
                )
            case 'TIME BASED':
                return (
                    <>
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        {['Sno', 'Time', 'Driver', 'Tonnage', 'Category', 'Trip-No'].map((o, i) => (
                                            <th className="fa-14 border text-center" key={i} style={{ backgroundColor: '#EDF0F7' }}>{o}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeBased?.map((o, i) => {
                                        const rows = o?.Trips?.length || 1;
                                        console.log(o?.EventTime)

                                        return o?.Trips?.map((trip, tripInd) => (
                                            <tr key={`${trip + '-' + tripInd}`}>
                                                {tripInd === 0 && (
                                                    <td
                                                        className='fa-13 border text-center'
                                                        rowSpan={rows}
                                                        style={{ verticalAlign: 'middle' }}
                                                    >
                                                        {i + 1}
                                                    </td>
                                                )}
                                                {tripInd === 0 && (
                                                    <td
                                                        className='fa-13 border text-center'
                                                        rowSpan={rows}
                                                        style={{ verticalAlign: 'middle' }}
                                                    >
                                                        {o?.EventTime ? UTCTime(o?.EventTime) : '-'}
                                                    </td>
                                                )}
                                                <td className='fa-13 border text-center'>{trip?.DriverName}</td>
                                                <td className='fa-13 border text-center blue-text'>{trip?.TonnageValue}</td>
                                                <td className='fa-13 border text-center'>{trip?.TripCategory}</td>
                                                <td className='fa-13 border text-center'>{trip?.TripNumber}</td>
                                            </tr>
                                        ))
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )
            case 'LIST':
                return (
                    <>
                        <div className="table-responsive">
                            <table className="table">
                                <tbody>
                                    <tr>
                                        {Object.entries(categoryTotals).map(([objKey, objValue]) => (
                                            <td className='fa-14 border text-center' key={objKey}>
                                                {objKey} : <span className='blue-text'>{NumberFormat(objValue)}</span>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                            <table className="table">
                                <thead>
                                    <tr>
                                        {['SNo', 'DRIVER NAME', 'TRIP NO', 'VEHICLE NO', 'TONNAGE', 'START TIME', 'END TIME', 'CATEGORY'
                                            // ...Object.entries(categoryTotals).map(([objKey, objValue]) => createAbbreviation(objKey) + ' (' + NumberFormat(objValue) + ')')
                                        ].map((o, i) => (
                                            <th key={i} className='fa-14 border text-center' style={{ backgroundColor: '#EDF0F7' }}>{o}</th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {listBased?.map((o, i) => {
                                        const TripCount = o?.DriverTrips?.reduce((acc, trip) => acc + (trip?.Trips?.length || 1), 0) || 1;

                                        return (
                                            o?.DriverTrips?.map((oo, ii) => (
                                                oo?.Trips?.map((ooo, iii) => {
                                                    const isFirstRow = ii === 0 && iii === 0;
                                                    const onClick = () => {
                                                        if (isEqualNumber(contextObj?.Edit_Rights, 1)) {
                                                            setInputValues(ooo);
                                                            setFilter(pre => ({ ...pre, dialog: true }))
                                                        }
                                                    }

                                                    return (
                                                        <tr key={`${i}_${ii}_${iii}`}>
                                                            {isFirstRow && (
                                                                <>
                                                                    <td
                                                                        className='fa-13 border text-center'
                                                                        rowSpan={TripCount}
                                                                        style={{ verticalAlign: 'middle' }}
                                                                    >
                                                                        {i + 1}
                                                                    </td>
                                                                    <td
                                                                        className='fa-13 border text-center blue-text'
                                                                        rowSpan={TripCount}
                                                                        style={{ verticalAlign: 'middle' }}
                                                                    >
                                                                        {o?.DriverName}
                                                                    </td>
                                                                </>
                                                            )}
                                                            <td className='fa-13 border text-center p-0' onClick={onClick}>
                                                                <div className="cellHover p-2">
                                                                    {ooo?.TripNumber}
                                                                </div>
                                                            </td>
                                                            <td className='fa-13 border text-center p-0' onClick={onClick}>
                                                                <div className="cellHover p-2">
                                                                    {ooo?.VehicleNumber || ''}
                                                                </div>
                                                            </td>
                                                            <td className='fa-13 border text-center p-0' onClick={onClick}>
                                                                <div className="cellHover p-2">
                                                                    {ooo?.TonnageValue}
                                                                </div>
                                                            </td>
                                                            <td className='fa-13 border text-center p-0' onClick={onClick}>
                                                                <div className="cellHover p-2">
                                                                    {ooo?.EventTime ? convertToTimeObject(ooo?.EventTime) : '-'}
                                                                </div>
                                                            </td>
                                                            <td className='fa-13 border text-center p-0' onClick={onClick}>
                                                                <div className="cellHover p-2">
                                                                    {ooo?.EndTime ? convertToTimeObject(ooo?.EndTime) : '-'}
                                                                </div>
                                                            </td>
                                                            <td className='fa-13 border text-center p-0' onClick={onClick}>
                                                                <div className="cellHover p-2">
                                                                    {ooo?.TripCategory || '-'}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            ))
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )

            default:
                return <></>
        }
    }

    return (
        <>
            <Card>
                <div className="p-3 fa-16 fw-bold border-bottom d-flex justify-content-between">
                    <span>Driver Activities</span>
                    {isEqualNumber(contextObj?.Add_Rights, 1) && (
                        <Button variant='outlined' onClick={() => setFilter(pre => ({ ...pre, dialog: true }))}>Add Activity</Button>
                    )}
                </div>

                <div className="d-flex flex-wrap p-2 px-3">
                    <div className='d-flex flex-column p-1'>
                        <label className='mb-1'>DATE</label>
                        <input
                            type="date"
                            className='cus-inpt w-auto'
                            value={filter.reqDate}
                            onChange={e => setFilter(pre => ({ ...pre, reqDate: e.target.value }))}
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

                <CardContent >
                    <TabContext value={filter.view}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <TabList
                                indicatorColor='transparant'
                                onChange={(e, n) => setFilter(pre => ({ ...pre, view: n }))}
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                            >
                                <Tab sx={filter.view === 'LIST' ? { backgroundColor: '#c6d7eb' } : {}} label="LIST" value='LIST' />
                                <Tab sx={filter.view === 'DATA ENTRY' ? { backgroundColor: '#c6d7eb' } : {}} label={'DATA ENTRY'} value='DATA ENTRY' />
                                <Tab sx={filter.view === 'ABSTRACT' ? { backgroundColor: '#c6d7eb' } : {}} label="ABSTRACT" value='ABSTRACT' />
                                <Tab sx={filter.view === 'CATEGORY BASED' ? { backgroundColor: '#c6d7eb' } : {}} label="CATEGORY BASED" value='CATEGORY BASED' />
                                <Tab sx={filter.view === 'DRIVER BASED' ? { backgroundColor: '#c6d7eb' } : {}} label="DRIVER BASED" value='DRIVER BASED' />
                                <Tab sx={filter.view === 'TIME BASED' ? { backgroundColor: '#c6d7eb' } : {}} label="TIME BASED" value='TIME BASED' />
                            </TabList>
                        </Box>
                        {['LIST', 'DATA ENTRY', 'ABSTRACT', 'CATEGORY BASED', 'DRIVER BASED', 'TIME BASED'].map(o => (
                            <TabPanel value={o} sx={{ px: 0, py: 2 }} key={o}>
                                {(activityData.length || driverBased.length) ? dispView(o) : <></>}
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
                <DialogTitle>
                    {inputValues?.Id ? 'Modify Activity' : 'Add Driver Activity'}
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
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Date</td>
                                        <td className='border-0' >
                                            <input
                                                type="date"
                                                value={inputValues?.ActivityDate}
                                                className='cus-inpt'
                                                onChange={e => setInputValues(pre => ({ ...pre, ActivityDate: e.target.value }))}
                                                required
                                            />
                                        </td>
                                    </tr>
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
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Driver Name</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.DriverName}
                                                type='search'
                                                list='driverList'
                                                required
                                                className='cus-inpt'
                                                placeholder='Type or Search Driver name'
                                                onChange={e => setInputValues(pre => ({ ...pre, DriverName: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Vehicle Number</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.VehicleNumber}
                                                type='text'
                                                // list='driverList'
                                                // required
                                                placeholder='Vehicle Number'
                                                className='cus-inpt'
                                                onChange={e => setInputValues(pre => ({ ...pre, VehicleNumber: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Trip Number</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.TripNumber}
                                                className='cus-inpt'
                                                type='number'
                                                required
                                                min={1}
                                                placeholder='Trip Count Number'
                                                onChange={e => setInputValues(pre => ({ ...pre, TripNumber: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Tonnage Value</td>
                                        <td className='border-0' >
                                            <input
                                                value={inputValues?.TonnageValue}
                                                className='cus-inpt'
                                                onInput={onlynum}
                                                required
                                                onChange={e => setInputValues(pre => ({ ...pre, TonnageValue: e.target.value }))}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>Time</td>
                                        <td className='border-0' >
                                            <div className='d-flex'>
                                                <div className='w-50 pe-1'>
                                                    <input
                                                        type='time'
                                                        value={inputValues?.EventTime}
                                                        required
                                                        className='cus-inpt'
                                                        onChange={e => setInputValues(pre => ({ ...pre, EventTime: e.target.value }))}
                                                    />
                                                </div>
                                                <div className='w-50 ps-1'>
                                                    <input
                                                        type='time'
                                                        value={inputValues?.EndTime}
                                                        // required
                                                        className='cus-inpt'
                                                        onChange={e => setInputValues(pre => ({ ...pre, EndTime: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className='border-0' style={{ verticalAlign: 'middle' }}>TYPE</td>
                                        <td className='border-0' >
                                            <select
                                                value={inputValues?.TripCategory}
                                                onChange={e => setInputValues(pre => ({ ...pre, TripCategory: e.target.value }))}
                                                className='cus-inpt'
                                                required
                                            >
                                                <option value={'LRY SHED & LOCAL'}>LRY SHED & LOCAL</option>
                                                <option value={'OTHER GODOWNS'}>OTHER GODOWNS</option>
                                                <option value={'TRANSFER'}>TRANSFER</option>
                                            </select>
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

            <datalist id='driverList'>
                {drivers.map((o, i) => <option key={i} value={o.DriverName} />)}
            </datalist>
        </>
    )
}


export default DriverActivities;