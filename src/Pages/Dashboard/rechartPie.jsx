import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const PieChartEmpData = ({ TasksArray }) => {
    const [chartData, setChartData] = useState(null);
    const [totalTime, setTotalTime] = useState(null);

    useEffect(() => {
        if (TasksArray && TasksArray?.length > 0) {
            const totalDuration = TasksArray?.reduce((acc, task) => {
                const start = new Date(new Date().toISOString().split('T')[0] + 'T' + task?.Start_Time);
                const end = new Date(new Date().toISOString().split('T')[0] + 'T' + task?.End_Time);
                return acc + (end - start);
            }, 0);

            const firstTaskStart = new Date(new Date().toISOString().split('T')[0] + 'T' + TasksArray[0]?.Start_Time);
            const lastTaskEnd = new Date(new Date().toISOString().split('T')[0] + 'T' + TasksArray[TasksArray?.length - 1]?.End_Time);
            const totalTime = lastTaskEnd - firstTaskStart;
            const freeTime = totalTime - totalDuration;

            const totalSeconds = Math.floor(totalTime / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            setTotalTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

            const chartData = TasksArray.map((task, index) => ({
                label: `${task?.Task_Name} (${task?.Start_Time} - ${task?.End_Time})`,
                duration: task?.duration,
                backgroundColor: getRandomColor(index)
            }));

            chartData.push({
                label: 'Free Time',
                duration: freeTime,
                backgroundColor: getRandomColor(chartData?.length)
            });

            setChartData(chartData);
        } else {
            setChartData([]);
        }
    }, [TasksArray]);

    const getRandomColor = (index) => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[(index + i) % 16];
        }
        return color;
    };

    const renderCustomizedLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
        index
    }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return chartData?.length > 0 ? (
        <div className='d-flex flex-column align-items-center my-3' style={{ maxHeight: '500px' }}>
            {totalTime && <p className='my-2'>Total Time: {totalTime}</p>}
            <PieChart width={400} height={400}>
                <Pie
                    data={chartData}
                    dataKey="duration"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={renderCustomizedLabel}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry?.backgroundColor} />
                    ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => {
                    const total = chartData?.reduce((acc, curr) => acc + curr?.duration, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${props?.payload?.label}: ${value} (${percentage}%)`;
                }} />
                <Legend formatter={(value) => {
                    const task = chartData?.find(entry => entry?.label === value);
                    return `${task?.label}: ${task?.duration}`;
                }} />
            </PieChart>
        </div>
    ) : (
        <h5 className="text-center my-5">No Data For PieChart!</h5>
    );
};

export default PieChartEmpData;
