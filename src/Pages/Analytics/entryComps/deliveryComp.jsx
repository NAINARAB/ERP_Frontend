import React, { useEffect, useState } from 'react';
import { UTCTime } from '../../../Components/functions';
import CardComp from './numCardComp';
import { fetchLink } from '../../../Components/fetchComponent';

const ContCard = ({ Value, Label }) => <CardComp Value={Value} Label={Label} />

const DeliveryInfo = ({reqDate, reqLocation}) => {
    const [activityData, setActivityData] = useState([]);

    useEffect(() => {
        fetchLink({
            address: `dataEntry/deliveryActivities/abstract?reqDate=${reqDate}&reqLocation=${reqLocation}`
        }).then(data => {
            if (data.success) {
                setActivityData(data.data)
            }
        })
        .catch(e => console.error(e))
    }, [reqDate, reqLocation])

    return (
        <>
            <div className="my-2">
                <div className='cus-grid text-dark'>
                    <ContCard Value={activityData[0]?.EntryTime ? UTCTime(activityData[0]?.EntryTime) : '-'} Label={'Time'} />
                    <ContCard Value={activityData[0]?.OverAllSales || 0} Label={'Sales'} />
                    <ContCard Value={activityData[0]?.NotTaken || 0} Label={'NotTaken'} />
                    <ContCard Value={activityData[0]?.NotVerified || 0} Label={'NotVerified'} />
                    <ContCard Value={activityData[0]?.NotDelivery || 0} Label={'Not Delivery'} />
                </div>
            </div>
        </>
    )
}

export default DeliveryInfo;