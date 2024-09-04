import React, { useEffect, useState } from 'react';
import api from '../../../API';
import { UTCTime } from '../../../Components/functions';
import CardComp from './numCardComp';
import { fetchLink } from '../../../Components/fetchComponent';

const ContCard = ({ Value, Label }) => <CardComp Value={Value} Label={Label} />

const GodownInfo = ({reqDate, reqLocation}) => {
    const [activityData, setActivityData] = useState([]);

    useEffect(() => {
        fetchLink({
            address: `dataEntry/godownActivities/abstract?reqDate=${reqDate}&reqLocation=${reqLocation}`
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
                    <ContCard Value={activityData[0]?.PurchaseTotal || 0} Label={'Purchase'} />
                    <ContCard Value={activityData[0]?.SalesTotal || 0} Label={'Sales'} />
                    <ContCard Value={activityData[0]?.ManagementTotal || 0} Label={'Handling'} />
                    <ContCard Value={activityData[0]?.EntryAt ? UTCTime(activityData[0]?.EntryAt) : '-'} Label={'Updated'} />
                </div>
            </div>
        </>
    )
}

export default GodownInfo;