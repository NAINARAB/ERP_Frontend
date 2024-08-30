import React, { useEffect, useState } from 'react';
import api from '../../../API';
import CardComp from './numCardComp';

const ContCard = ({ Value, Label }) => <CardComp Value={Value} Label={Label} />

const WeightCheckingComp = ({ reqDate, reqLocation }) => {
    const [activityData, setActivityData] = useState([]);

    useEffect(() => {
        fetch(`${api}weightCheckActivity?reqDate=${reqDate}&reqLocation=${reqLocation}`)
            .then(res => res.json())
            .then(data => {
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
                    <ContCard Value={activityData?.length || 0} Label={'Items'} />
                    {Object.entries(activityData?.reduce((avg, obj) => {
                        let Average_Input = avg.Average_Input += obj.InputKG || 0;
                        let Average_Output = avg.Average_Output += obj.OutputKG || 0;
                        return {
                            Average_Input,
                            Average_Output
                        }
                    }, {
                        Average_Input: 0,
                        Average_Output: 0
                    })).map(([key, value]) => (
                        <ContCard Value={parseInt(value / activityData.length)} Label={key?.replace('_', ' ')} key={key} />
                    ))}
                    {/* <ContCard Value={''} Label={'Total'} /> */}


                </div>
            </div>
        </>
    )
}

export default WeightCheckingComp;