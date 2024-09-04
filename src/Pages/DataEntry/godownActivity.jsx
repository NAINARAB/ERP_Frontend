import React, { useEffect, useState, useContext } from 'react';
import { firstDayOfMonth, isEqualNumber, ISOString, LocalDate, LocalDateWithTime, validValue, onlynum, Addition, NumberFormat } from '../../Components/functions';
import { toast } from 'react-toastify'
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tab, Box } from '@mui/material';
import { TabPanel, TabList, TabContext } from '@mui/lab';
import { Edit } from '@mui/icons-material'
import { MyContext } from '../../Components/context/contextProvider';
import { fetchLink } from '../../Components/fetchComponent';


const GodownActivity = () => {
    const storage = JSON.parse(localStorage.getItem('user'))
    const [godownData, setGodownData] = useState([]);
    const [reload, setReload] = useState(false);
    const initialValue = {
        Id: '',
        EntryDate: ISOString(),
        LocationDetails: 'MILL',
        Purchase: 0,
        OtherGodown: 0,
        PurchaseTransfer: 0,
        Handle: 0,
        WGChecking: 0,
        LorryShed: 0,
        VandiVarum: 0,
        DDSales: 0,
        SalesOtherGodown: 0,
        SalesTransfer: 0,
        EntryBy: storage.UserId
    }
    const [inputValues, setInputValues] = useState(initialValue);
    const { contextObj } = useContext(MyContext);
    const [filter, setFilter] = useState({
        Fromdate: firstDayOfMonth(),
        Todate: ISOString(),
        LocationDetails: 'MILL',
        dialog: false,
        view: 'DATA ENTRY'
    })


    useEffect(() => {
        fetchLink({
            address: `dataEntry/godownActivities?Fromdate=${filter.Fromdate}&Todate=${filter.Todate}&LocationDetails=${filter.LocationDetails}`
        }).then(data => setGodownData(data?.data)).catch(e => console.error(e))
    }, [reload, filter.Fromdate, filter.Todate, filter.LocationDetails])

    const closeDialog = () => {
        setFilter(pre => ({ ...pre, dialog: false }));
        setInputValues(initialValue)
    }

    const saveActivity = () => {
        fetchLink({
            address: `dataEntry/godownActivities`,
            method: inputValues.Id ? "PUT" : "POST",
            headers: {
                'Content-Type': 'application/json'
            },
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

    const RowComp = ({ o, sno }) => {
        const [open, setOpen] = useState(false);
        const [subRows, setSubRows] = useState(false);

        return (
            <>
                <tr>
                    <td className='fa-13 border text-center'>{sno}</td>
                    <td
                        className={o?.DayEntries?.length > 1 ? 'fa-13 border text-center text-primary' : 'fa-13 border text-center'}
                        onClick={() => setOpen(!open)}
                    >
                        {!open
                            ? <p className='m-0'>{o?.EntryDate ? LocalDate(o?.EntryDate) : '-'}</p>
                            : (
                                <>
                                    <p className='m-0'>{o?.EntryDate ? LocalDate(o?.EntryDate) : '-'}</p>
                                    <p className='m-0 text-dark'>
                                        {o?.DayEntries[0]?.EntryAt ? LocalDateWithTime(o?.DayEntries[0]?.EntryAt) : '-'}
                                    </p>
                                </>
                            )
                        }
                    </td>

                    <td className='fa-15 border text-center fw-bold text-primary'>
                        {validValue(o?.DayEntries[0]?.PurchaseTotal)}
                    </td>

                    {['Purchase', 'OtherGodown', 'PurchaseTransfer', 'Handle', 'WGChecking'].map((oo, ii) => (
                        <td className='fa-13 border text-center' key={ii}>
                            {validValue(o?.DayEntries[0][oo])}
                        </td>
                    ))}

                    <td className='fa-15 border text-center fw-bold text-primary'>
                        {validValue(o?.DayEntries[0]?.SalesTotal)}
                    </td>

                    <td className='fa-14 border text-center fw-bold text-primary'>
                        {validValue(o?.DayEntries[0]?.SalesOnlyTotal)}

                    </td>

                    {['LorryShed', 'VandiVarum', 'DDSales', 'SalesTransfer'].map((oo, ii) => (
                        <td className='fa-13 border text-center' key={ii}>
                            {validValue(o?.DayEntries[0][oo])}
                        </td>
                    ))}

                    <td className='fa-14 border text-center fw-bold text-primary'>
                        {validValue(o?.DayEntries[0]?.SalesOtherGodown)}
                    </td>


                    <td className='fa-13 border text-center'>
                        {isEqualNumber(contextObj?.Edit_Rights, 1) && (
                            <IconButton
                                onClick={() => {
                                    setInputValues(o?.DayEntries[0])
                                    setFilter(pre => ({ ...pre, dialog: true }));
                                }}
                                size='small'
                            >
                                <Edit className='fa-18' />
                            </IconButton>
                        )}
                    </td>
                </tr>

                {(open && o?.DayEntries?.length > 1) && (
                    o?.DayEntries?.map((oo, ii) => ii > 0 && (
                        <tr key={ii}>
                            <td className='fa-13 border text-center'>{sno + '.' + (ii)}</td>
                            <td className='fa-13 border text-center' onClick={() => setSubRows(pre => !pre)}>
                                {/* {oo?.EntryDate ? LocalDate(oo?.EntryDate) : '-'} */}
                                {!subRows
                                    ? <p className='m-0'>{oo?.EntryAt ? LocalDate(oo?.EntryAt) : '-'}</p>
                                    : (
                                        <>
                                            <p className='m-0'>{oo?.EntryAt ? LocalDate(oo?.EntryAt) : '-'}</p>
                                            <p className='m-0 text-dark'>
                                                {oo?.EntryAt ? LocalDateWithTime(oo?.EntryAt) : '-'}
                                            </p>
                                        </>
                                    )
                                }
                            </td>

                            <td className='fa-15 border text-center fw-bold text-primary'>{validValue(oo?.PurchaseTotal)}</td>

                            {['Purchase', 'OtherGodown', 'PurchaseTransfer', 'Handle', 'WGChecking'].map((ooo, iii) => (
                                <td className='fa-13 border text-center' key={iii}>{validValue(oo[ooo])}</td>
                            ))}

                            <td className='fa-15 border text-center fw-bold text-primary'>{validValue(oo?.SalesTotal)}</td>
                            <td className='fa-14 border text-center fw-bold text-primary'>{validValue(oo?.SalesOnlyTotal)}</td>


                            {['LorryShed', 'VandiVarum', 'DDSales', 'SalesTransfer'].map((ooo, iii) => (
                                <td className='fa-13 border text-center' key={iii}>{validValue(oo[ooo])}</td>
                            ))}

                            <td className='fa-14 border text-center fw-bold text-primary'>{validValue(oo?.SalesOtherGodown)}</td>

                            <td className='fa-13 border text-center'>
                                {isEqualNumber(contextObj?.Edit_Rights, 1) && (
                                    <IconButton
                                        onClick={() => {
                                            setInputValues(oo)
                                            setFilter(pre => ({ ...pre, dialog: true }));
                                        }}
                                        size='small'
                                    >
                                        <Edit className='fa-18' />
                                    </IconButton>
                                )}
                            </td>
                        </tr>
                    ))
                )}
            </>
        )
    }

    const dispView = (val) => {
        switch (val) {
            case 'DATA ENTRY':
                return (
                    <div className="table-responsive" style={{ maxHeight: '60dvh' }}>
                        <table className="table">

                            <thead>
                                <tr>
                                    <th className='border' colSpan={2} ></th>
                                    <th className='fw-bold fa-13 border text-center text-muted' colSpan={4}>INWARD</th>
                                    <th className='fw-bold fa-13 border text-center text-muted' colSpan={2}>MANAGEMENT</th>
                                    <th className='fw-bold fa-13 border text-center text-muted' colSpan={7}>OUTWARD</th>
                                    <th className='border'></th>
                                </tr>
                                <tr>
                                    {[
                                        'SNo', 'DATE', 'TOTAL', 'PURCHASE', 'OTHER GODOWN', 'TRANSFER', 'HANDLE',
                                        'WG CHECKING', 'TOTAL', 'SALES TOTAL', 'LORRY SHED', 'VANDI VARUM', 'DD SALES', 'TRANSFER', 'OTHER GODOWN', 'ACTION'
                                    ].map((o, i) => (
                                        <td className='border fa-12 text-center tble-hed-stick' key={i}>{o}</td>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {godownData?.map((o, i) => <RowComp o={o} sno={i + 1} key={i} />)}
                            </tbody>

                        </table>
                    </div>
                )
            case 'ABSTRACT':
                return (
                    <>
                        <div className="table-responsive">
                            <table className="table mb-0">
                                <thead>
                                    <tr>
                                        {['Sno', 'Date', 'Entries', 'INWARD', 'MANAGEMENT', 'OUTWARD'].map(o => (
                                            <th className='fa-14 border text-center text-muted' key={o}>{o}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {godownData?.map((o, i) => (
                                        <tr key={i}>
                                            <td className='fa-13 border text-center'>{i + 1}</td>
                                            <td className='fa-13 border text-center'>{o?.EntryDate ? LocalDate(o?.EntryDate) : '-'}</td>
                                            <td className='fa-13 border text-center'>{o?.DayEntries?.length}</td>
                                            <td className='fa-13 border text-center'>{validValue(o?.DayEntries[0]?.PurchaseTotal)}</td>
                                            {/* 'Handle', 'WGChecking' */}
                                            <td className='fa-13 border text-center'>
                                                {validValue(NumberFormat(Addition(o?.DayEntries[0]?.Handle, o?.DayEntries[0]?.WGChecking)))}
                                            </td>
                                            <td className='fa-13 border text-center'>{validValue(o?.DayEntries[0]?.SalesTotal)}</td>
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

                <div className="px-3 py-2 fa-16 fw-bold border-bottom d-flex justify-content-between align-items-center">
                    <span>Godown Activities</span>
                    {isEqualNumber(contextObj?.Add_Rights, 1) && (
                        <Button variant='outlined' onClick={() => setFilter(pre => ({ ...pre, dialog: true }))}>Add Activity</Button>
                    )}
                </div>

                <CardContent className='pt-0'>

                    <div className="d-flex flex-wrap">
                        <div className='p-2'>
                            <label>FROM</label><br />
                            <input
                                value={filter.Fromdate}
                                type='date'
                                className='cus-inpt w-auto'
                                onChange={e => setFilter(pre => ({ ...pre, Fromdate: e.target.value }))}
                            />
                        </div>
                        <div className='p-2'>
                            <label>TO</label><br />
                            <input
                                value={filter.Todate}
                                type='date'
                                className='cus-inpt w-auto'
                                onChange={e => setFilter(pre => ({ ...pre, Todate: e.target.value }))}
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
                                <Tab sx={filter.view === 'ABSTRACT' ? { backgroundColor: '#c6d7eb' } : {}} label="ABSTRACT" value='ABSTRACT' />
                            </TabList>
                        </Box>
                        {['DATA ENTRY', 'ABSTRACT'].map(o => (
                            <TabPanel value={o} sx={{ px: 0, py: 2 }} key={o}>
                                {godownData?.length ? dispView(o) : <></>}
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
                <DialogTitle className=' bg-light'>{inputValues?.Id ? 'Modify Activity' : 'Add Godown Activity'}</DialogTitle>
                <DialogContent>


                    <h6 className='border-bottom fw-bold text-muted py-2 m-0 mt-2'>DATE & LOCATION</h6>
                    <div className="d-flex my-2">
                        <div className='p-2' style={{ width: '150px' }}>
                            <label>DATE</label>
                            <input
                                value={inputValues.EntryDate}
                                type='date'
                                className='cus-inpt'
                                onChange={e => setInputValues(pre => ({ ...pre, EntryDate: e.target.value }))}
                            />
                        </div>
                        <div className='py-2' style={{ width: '150px' }}>
                            <label>LOCATION</label>
                            <select
                                value={inputValues?.LocationDetails}
                                onChange={e => setInputValues(pre => ({ ...pre, LocationDetails: e.target.value }))}
                                className='cus-inpt'
                                required
                            >
                                <option value={'MILL'}>MILL</option>
                                <option value={'GODOWN'}>GODOWN</option>
                            </select>
                        </div>
                    </div>


                    <div className="table-responsive">
                        <teble className="table">
                            <tbody>

                                {/* inward inputs */}
                                <tr>
                                    <td colSpan={3} className='fw-bold text-muted'> INWARD</td>
                                </tr>
                                <tr>
                                    <td className='border-0'>
                                        <label className='fa-14'>PURCHASE</label>
                                        <input
                                            value={inputValues?.Purchase ? inputValues?.Purchase : ''}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, Purchase: e.target.value }))}
                                        />
                                    </td>
                                    <td className='border-0'>
                                        <label className='fa-14'>OTHER GODOWN</label>
                                        <input
                                            value={inputValues?.OtherGodown ? inputValues?.OtherGodown : ''}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, OtherGodown: e.target.value }))}
                                        />
                                    </td>
                                    <td className='border-0'>
                                        <label className='fa-14'>TRANSFER</label>
                                        <input
                                            value={inputValues?.PurchaseTransfer ? inputValues?.PurchaseTransfer : ''}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, PurchaseTransfer: e.target.value }))}
                                        />
                                    </td>
                                    <td className='border-0'></td>
                                </tr>

                                <tr><td className='border-0' colSpan={3}></td></tr>
                                <tr><td className='border-0' colSpan={3}></td></tr>

                                {/* stock handling inputs */}

                                <tr>
                                    <td colSpan={3} className='fw-bold text-muted'>STOCK HANDLING</td>
                                </tr>
                                <tr>
                                    <td className='border-0'>
                                        <label className='fa-14'>HANDLE</label>
                                        <input
                                            value={inputValues?.Handle ? inputValues?.Handle : ''}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, Handle: e.target.value }))}
                                        />
                                    </td>
                                    <td className='border-0'>
                                        <label className='fa-14'>WG CHECKING</label>
                                        <input
                                            value={inputValues?.WGChecking ? inputValues?.WGChecking : ''}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, WGChecking: e.target.value }))}
                                        />
                                    </td>
                                    <td className='border-0'>
                                    </td>
                                </tr>

                                <tr><td className='border-0' colSpan={3}></td></tr>
                                <tr><td className='border-0' colSpan={3}></td></tr>

                                {/* outward inputs */}

                                <tr>
                                    <td colSpan={3} className='fw-bold text-muted'> OUTWARD</td>
                                </tr>
                                <tr>
                                    <td className='border-0'>
                                        <label className='fa-14'>Lorry Shed</label>
                                        <input
                                            value={inputValues?.LorryShed ? inputValues?.LorryShed : ''}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, LorryShed: e.target.value }))}
                                        />
                                    </td>
                                    <td className='border-0'>
                                        <label className='fa-14'>Vandi Varum</label>
                                        <input
                                            value={inputValues?.VandiVarum ? inputValues?.VandiVarum : ''}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, VandiVarum: e.target.value }))}
                                        />
                                    </td>
                                    <td className='border-0'>
                                        <label className='fa-14'>DD Sales</label>
                                        <input
                                            value={inputValues?.DDSales ? inputValues?.DDSales : ''}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, DDSales: e.target.value }))}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className='border-0'>
                                        <label className='fa-14'>TRANSFER</label>
                                        <input
                                            value={inputValues?.SalesTransfer ? inputValues?.SalesTransfer : ''}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, SalesTransfer: e.target.value }))}
                                        />
                                    </td>
                                    <td className='border-0'>
                                        <label className='fa-14'>OTHER GODOWN</label>
                                        <input
                                            value={inputValues?.SalesOtherGodown ? inputValues?.SalesOtherGodown : ''}
                                            className='cus-inpt'
                                            onInput={onlynum}
                                            onChange={e => setInputValues(pre => ({ ...pre, SalesOtherGodown: e.target.value }))}
                                        />
                                    </td>
                                    <td className='border-0'></td>
                                </tr>


                            </tbody>
                        </teble>
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

export default GodownActivity;