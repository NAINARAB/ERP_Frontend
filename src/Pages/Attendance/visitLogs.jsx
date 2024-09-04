import React, { useState, useEffect } from "react";
import { IconButton, Card, CardContent, Tooltip } from "@mui/material";
import { LocationOn, PersonAdd } from "@mui/icons-material";
import Select from "react-select";
import { customSelectStyles, customTableStyles } from "../../Components/tablecolumn"; 
// import { toast } from 'react-toastify';
import { ISOString, LocalTime } from "../../Components/functions";
import DataTable from "react-data-table-component";
import ImagePreviewDialog from "../../Components/imagePreview";
import { fetchLink } from "../../Components/fetchComponent";
import { useNavigate } from "react-router-dom";

const VisitedLogs = () => {
    const storage = JSON.parse(localStorage.getItem('user'));
    const nav = useNavigate()

    const [logData, setLogData] = useState([]);
    const [salesPerson, setSalePerson] = useState([]);

    const [filter, setFilter] = useState({
        UserId: '',
        UserGet: 'All Sales Person',
        reqDate: ISOString(),
    })

    useEffect(() => {
        fetchLink({
            address: `empAttendance/visitLogs?UserId=${filter?.UserId}&reqDate=${filter?.reqDate}`,
        }).then(data => {
            if (data.success) {
                setLogData(data.data)
            }
        }).catch(e => console.error(e))
        
    }, [filter?.UserId, filter?.reqDate])

    useEffect(() => {
        fetchLink({
            address: `masters/users/salesPerson/dropDown?Company_id=${storage?.Company_id}`
        }).then(data => {
            if (data.success) {
                setSalePerson(data.data)
            }
        }).catch(e => console.error(e))
            
    }, [storage?.Company_id])

    const logColumns = [
        {
            name: 'Picture',
            cell: row => (
                <span className="py-1">
                    <ImagePreviewDialog url={row?.imageUrl}>
                        <img
                            src={row?.imageUrl}
                            alt={'Picture'}
                            style={{ height: 150, width: 150 }}
                        />
                    </ImagePreviewDialog>
                </span>
            ),
            sortable: false,
            maxWidth: '170px'
        },
        {
            name: 'Retailer Info',
            cell: row => (
                <div className="py-2 w-100">
                    <h6>
                        {row?.EntryByGet}, {LocalTime(row?.EntryAt)}
                    </h6>
                    <p className="mb-2">{row?.Narration && ('Narration: ' + row?.Narration)}</p>

                    <div className="table-responisve rounded-3 border p-2">
                        <table className="mb-0">
                            <tbody >
                                <tr>
                                    <td className="border-0">Reatailer </td>
                                    <td className="border-0">
                                        {row?.Reatailer_Name}
                                        <span className="ps-2">
                                            {!Boolean(row?.IsExistingRetailer) && <span className="p-2 py-0 fa-10 rounded-4 bg-success text-white fw-bold">New</span>}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="pe-4 border-0">Contact_Person </td>
                                    <td className="border-0"> {row?.Contact_Person}</td>
                                </tr>
                                <tr>
                                    <td className="border-0">Mobile </td>
                                    <td className="border-0">{row?.Contact_Mobile}</td>
                                </tr>
                                <tr>
                                    <td className="border-0">Address </td>
                                    <td className="border-0">{row?.Location_Address}</td>
                                </tr>
                                <tr>
                                    <td className="border-0">Location </td>
                                    <td className="border-0">
                                        {row?.Latitude + ', ' + row?.Longitude}

                                    </td>
                                </tr>
                                <tr>
                                    <td>Actions</td>
                                    <td className="border-0" >
                                        {(row?.Latitude && row.Longitude) && (
                                            <Tooltip title='Open in Google Map'>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${row?.Latitude},${row?.Longitude}`, '_blank')}
                                                    color='primary'>
                                                    <LocationOn className="fa-18" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {!Boolean(row?.IsExistingRetailer) && (
                                            <Tooltip title='Convert as a Retailer'>
                                                <IconButton
                                                    color='primary'
                                                    size="small"
                                                    onClick={() => nav('/masters/retailers', {
                                                        state: {
                                                            retailer: row
                                                        }
                                                    })}
                                                >
                                                    <PersonAdd />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ),
            minWidth: '500px'
        },
        // {
        //     name: 'Entry By',
        //     selector: row => row?.EntryByGet,
        //     sortable: true,
        // },
        // {
        //     name: 'Retailer',
        //     selector: row => row?.Reatailer_Name,
        //     sortable: true,
        // },
        // {
        //     name: 'Contact Person',
        //     selector: row => row?.Contact_Person,
        //     sortable: true,
        // },
        // {
        //     name: 'Mobile',
        //     selector: row => row?.Contact_Mobile,
        //     sortable: true,
        // },
        // {
        //     name: 'Address',
        //     selector: row => row?.Location_Address,
        //     sortable: true,
        // },

    ]

    return (
        <>
            <Card>
                <CardContent sx={{ minHeight: '300px' }}>

                    <div className="px-3 pt-2 mb-3 d-flex align-items-center justify-content-between">
                        <h6 className="fa-18">Visit Logs</h6>
                    </div>

                    <div className="row mb-3">

                        <div className="col-xl-3 col-md-4 col-sm-6">
                            <label>Sales Person</label>
                            <Select
                                value={{ value: filter?.UserId, label: filter?.UserGet }}
                                onChange={(e) => setFilter({ ...filter, UserId: e.value, UserGet: e.label })}
                                options={[
                                    { value: '', label: 'All SalesPerson' },
                                    ...salesPerson.map(obj => ({ value: obj?.UserId, label: obj?.Name }))
                                ]}
                                styles={customSelectStyles}
                                isSearchable={true}
                                placeholder={"Sales Person Name"}
                            />
                        </div>

                        <div className="col-xl-3 col-md-4 col-sm-6">
                            <label>Date</label>
                            <input
                                type="date"
                                value={filter?.reqDate}
                                onChange={e => setFilter({ ...filter, reqDate: e.target.value })}
                                className="cus-inpt"
                            />
                        </div>

                    </div>

                    <div className="rounded-4 overflow-hidden" >
                        <DataTable
                            columns={logColumns}
                            data={logData}
                            pagination
                            highlightOnHover={false}
                            fixedHeader={true}
                            fixedHeaderScrollHeight={'60vh'}
                            customStyles={customTableStyles}
                        />
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default VisitedLogs;