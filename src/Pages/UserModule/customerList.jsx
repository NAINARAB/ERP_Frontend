import React, { useEffect, useState, useMemo } from "react";
import api from "../../API";
import { Edit } from '@mui/icons-material';
import { IconButton, Box, Tooltip, Button } from "@mui/material";
import 'react-toastify/dist/ReactToastify.css';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import CustomerAddScreen from "./customerCreation";
// import '../../com.css';

const CustomerList = () => {
    const [customers, setCustomers] = useState([])
    const [refresh, setRefresh] = useState(false);
    const [rowValue, setRowValue] = useState({})
    const [screen, setScreen] = useState(true);

    useEffect(() => {
        fetch(`${api}customer`)
            .then(res => res.json())
            .then(data => {
                setCustomers(data.data ? data.data : [])
            }).catch(e => console.error(e))
    }, [refresh])

    useEffect(() => {
        if (screen === true) {
            setRowValue({});
        }
    }, [screen])

    const CustomerColumn = useMemo(() => [
        {
            header: 'Action',
            size: 130,
            Cell: ({ renderedCellValue, row }) => (
                <Box >
                    <Tooltip title="Edit">
                        <IconButton onClick={() => {
                            setRowValue(row.original);
                            setScreen(!screen);
                        }}>
                            <Edit />
                        </IconButton>
                    </Tooltip>
                    {/* <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => console.log(row.original)}>
                            <Delete />
                        </IconButton>
                    </Tooltip> */}
                </Box>
            )
        },
        {
            header: 'No',
            accessorKey: 'Cust_No',
            size: 110,

        },
        {
            header: 'Name',
            accessorKey: 'Customer_name',
            size: 250
        },
        {
            header: 'Phone',
            accessorKey: 'Mobile_no',
            size: 140
        },
        {
            header: 'Type',
            accessorKey: 'UserTypeGet',
        },
        {
            header: 'Contact Person',
            accessorKey: 'Contact_Person',
        },
        {
            header: 'Email',
            accessorKey: 'Email_Id',
        },
        {
            header: 'Under',
            accessorKey: 'underGet',
        },
        {
            header: 'State',
            accessorKey: 'State',
        },
        {
            header: 'Pincode',
            accessorKey: 'Pincode',
        },
        {
            header: 'Gstin',
            accessorKey: 'Gstin',
        },
        {
            header: 'Created By',
            accessorKey: 'EnteyByGet',
        }
    ], [])

    const table = useMaterialReactTable({
        columns: CustomerColumn,
        data: customers,
        enableColumnResizing: true,
        enableGrouping: true,
        enableStickyHeader: true,
        enableStickyFooter: true,
        enableRowVirtualization: true,
        enableColumnOrdering: true,
        enableColumnPinning: true,
        enableRowNumbers: true,
        initialState: {
            density: 'compact',
            expanded: true,
            grouping: [],
            pagination: { pageIndex: 0, pageSize: 100 },
            sorting: [{ id: 'Customer_name', desc: false }],
            columnVisibility: { EnteyByGet: false, Gstin: false, Pincode: false, State: false },
        },
        muiToolbarAlertBannerChipProps: { color: 'primary' },
        muiTableContainerProps: { sx: { maxHeight: '60vh' } },
    })

    const doRefresh = () => {
        setRefresh(!refresh)
    }

    // useEffect(() => { console.error = function () { } })

    return (
        <>
            {screen ?
                <>
                    <div className="card">
                        <div className="card-header d-flex justify-content-between">
                            <h5 className="mb-0">Customers</h5>
                            <span>
                                <Button variant='outlined' onClick={() => setScreen(!screen)} >Add</Button>
                            </span>
                        </div>
                        <div className="card-body">
                            <div className="box shadow-none bg-light">
                                <MaterialReactTable table={table} />
                            </div>
                        </div>
                    </div>
                </>
                : <CustomerAddScreen
                    screen={screen}
                    setScreen={setScreen}
                    underArray={customers}
                    row={rowValue}
                    refresh={doRefresh}
                />
            }

        </>
    )
}

export default CustomerList;