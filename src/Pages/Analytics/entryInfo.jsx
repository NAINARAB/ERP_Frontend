import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, IconButton, Collapse } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { ISOString } from '../../Components/functions';

import DriverInfoComp from './entryComps/driverComp';
import GodownInfo from './entryComps/godownComp';
import DeliveryInfo from './entryComps/deliveryComp';
import StaffInfo from './entryComps/staffComp';
import WeightCheckingComp from './entryComps/weightCheckingComp';

import { CiDeliveryTruck } from "react-icons/ci";
import { BsBox } from "react-icons/bs";
import { HiOutlineHomeModern } from "react-icons/hi2"
// import { GrUserWorker } from "react-icons/gr";
import { HiUsers } from "react-icons/hi";
import { SlSpeedometer } from "react-icons/sl";

const DataEntryAbstract = () => {
    const [filter, setFilter] = useState({
        reqDate: ISOString(),
        reqLocation: 'MILL',
    });

    const [displayContent, setDisplayContent] = useState([
        {
            name: 'Driver Activities',
            isOpen: false,
            icon: <CiDeliveryTruck style={{ fontSize: '40px' }} />
        },
        {
            name: 'Godown Activities',
            isOpen: false,
            icon: <HiOutlineHomeModern style={{ fontSize: '40px' }} />
        },
        {
            name: 'Delivery Activities',
            isOpen: false,
            icon: <BsBox style={{ fontSize: '40px' }} />
        },
        {
            name: 'Staff Activities',
            isOpen: false,
            icon: <HiUsers style={{ fontSize: '40px' }} />
        },
        {
            name: 'Weight Checking Activities',
            isOpen: false,
            icon: <SlSpeedometer style={{ fontSize: '40px' }} />
        },
    ]);

    const memoizedComponents = useMemo(() => [
        <DriverInfoComp reqDate={filter.reqDate} reqLocation={filter.reqLocation} />,
        <GodownInfo reqDate={filter.reqDate} reqLocation={filter.reqLocation} />,
        <DeliveryInfo reqDate={filter.reqDate} reqLocation={filter.reqLocation} />,
        <StaffInfo reqDate={filter.reqDate} reqLocation={filter.reqLocation} />,
        <WeightCheckingComp reqDate={filter.reqDate} reqLocation={filter.reqLocation} />,
    ], [filter.reqDate, filter.reqLocation]);

    useEffect(() => {
        setDisplayContent(pre => pre.map((item, index) => ({
            ...item,
            comp: memoizedComponents[index],
        })));
    }, [memoizedComponents]);

    const handleToggle = index => {
        setDisplayContent(prevDisplayContent =>
            prevDisplayContent.map((item, i) =>
                i === index ? { ...item, isOpen: !item.isOpen } : item
            )
        );
    };

    return (
        <>
            <div className="d-flex flex-wrap">
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

            {displayContent.map((item, index) => (
                <Card key={index} className='mt-2'>
                    <div
                        className="fa-17 fw-bold border-bottom p-0 d-flex justify-content-between align-items-center"
                        onClick={() => handleToggle(index)}
                        style={{ cursor: 'pointer' }}
                    >
                        <div className='d-flex justify-content-between align-items-center p-0'>
                            <span className='p-4 bg-primary text-white'>{item.icon}</span>
                            <span className='ps-3 fa-20'>{item.name}</span>
                        </div>
                        <IconButton size='small' className='p-2'>
                            {item.isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                        </IconButton>
                    </div>
                    <Collapse in={item.isOpen} unmountOnExit>
                        <CardContent>{item.comp}</CardContent>
                    </Collapse>
                </Card>
            ))}
        </>
    );
};

export default DataEntryAbstract;
