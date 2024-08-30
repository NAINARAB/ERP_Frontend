import React, { useEffect, useState } from 'react';
import api from '../../../API';
import CardComp from './numCardComp';
import { BarChart } from '@mui/x-charts/BarChart';
import { getMonth } from '../../../Components/functions';

const ContCard = ({ Value, Label }) => <CardComp Value={Value} Label={Label} />

const DriverInfoComp = ({ reqDate, reqLocation }) => {
    const [activityData, setActivityData] = useState([]);
    const [driverBased, setDriverBased] = useState([]);
    const [filter, setFilter] = useState({
        currentMonth: getMonth(),
    });

    useEffect(() => {
        fetch(`${api}driverActivities?reqDate=${reqDate}&reqLocation=${reqLocation}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setActivityData(data.data)
                }
            })
            .catch(e => console.error(e))
        fetch(`${api}driverActivities/tripBased?reqDate=${reqDate}&reqLocation=${reqLocation}`)
            .then(res => res.json())
            .then(data => setDriverBased(data.data))
            .catch(e => console.error(e))
    }, [reqDate, reqLocation])

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

            <input 
                type='month'
                className='cus-inpt w-auto mt-3' 
                value={filter.currentMonth} 
                onChange={e => setFilter(pre => ({ ...pre, currentMonth: e.target.value}))} 
            />

            <div className="my-3 d-flex justify-content-center flex-wrap">
                <BarChart
                    xAxis={[{ scaleType: 'band', data: driverBased?.map(o => o?.DriverName) }]}
                    series={[
                        { data: driverBased?.map(o => o?.Trips?.length), label: 'TRIPS',  },
                        {
                            data: driverBased?.map(o => Number(o?.Trips?.reduce((sum, obj) => {
                                let total = 0;
                                total += obj?.Categories?.reduce((catSum, catObj) => {
                                    let catTotal = 0;
                                    catTotal += catObj?.TonnageValue || 0
                                    return catTotal + catSum
                                }, 0)
                                return sum + total
                            }, 0)).toFixed(2)),
                            label: 'TONNAGE', 
                        }
                    ]}
                    width={900}
                    height={400}
                    barLabel="value"
                    borderRadius={6}
                />
            </div>
        </>
    )
}

export default DriverInfoComp;