import React, { useEffect, useState } from "react";
import { Edit, LocalMallOutlined } from '@mui/icons-material';
import { IconButton, Box, Tooltip, Button } from "@mui/material";
import CustomerAddScreen from "./customerCreation";
import { fetchLink } from '../../Components/fetchComponent';
import FilterableTable, { createCol } from '../../Components/filterableTable2';

const CustomerList = ({ loadingOn, loadingOff, AddRights, EditRights }) => {
    const [customers, setCustomers] = useState([])
    const [refresh, setRefresh] = useState(false);
    const [rowValue, setRowValue] = useState({})
    const [screen, setScreen] = useState(true);

    useEffect(() => {
        // if (loadingOn) loadingOn();
        fetchLink({
            address: `userModule/customer`,
            loadingOn, loadingOff
        }).then(data => {
            setCustomers(data.data ? data.data : [])
        }).catch(e => console.error(e))

    }, [refresh])

    useEffect(() => {
        if (screen === true) {
            setRowValue({});
        }
    }, [screen])

    const doRefresh = () => {
        setRefresh(!refresh)
    }

    return (
        <>
            {screen ?
                <FilterableTable
                    title="Customers"
                    dataArray={customers}
                    headerFontSizePx={13}
                    bodyFontSizePx={12}
                    columns={[
                        createCol('Cust_No', 'string', 'CusID'),
                        createCol('Customer_name', 'string', 'Name'),
                        createCol('UserTypeGet', 'string', 'Type'),
                        createCol('Mobile_no', 'string', 'Phone'),
                        createCol('Contact_Person', 'string', 'Contact Person'),
                        createCol('Email_Id', 'string', 'Email'),
                        createCol('State', 'string', 'State'),
                        createCol('Gstin', 'string', 'Gstin'),
                        {
                            isVisible: 1,
                            ColumnHeader: 'Action',
                            isCustomCell: true,
                            Cell: ({ row }) => (
                                <>
                                    <Tooltip title="Edit">
                                        <span>
                                            <IconButton size="small" onClick={() => {
                                                setRowValue(row);
                                                setScreen(!screen);
                                            }}>
                                                <Edit className="fa-20" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    {/* <Tooltip title="Outstanding">
                                        <span>
                                            <IconButton 
                                                size="small" 
                                                onClick={() => {}}
                                            >
                                                <LocalMallOutlined className="fa-20" />
                                            </IconButton>
                                        </span>
                                    </Tooltip> */}
                                </>
                            )
                        },
                    ]}
                    ButtonArea={
                        <>
                            <Button variant='outlined' onClick={() => setScreen(!screen)} >Add</Button>
                        </>
                    }
                />
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