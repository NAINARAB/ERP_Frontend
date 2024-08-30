import React, { useEffect, useState } from 'react';
import { PieChart } from '@mui/x-charts';

const MuiPieChart = ({ TasksArray }) => {
    const [totalTime, setTotalTime] = useState(null);
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        if (TasksArray.length > 0) {
            const totalDuration = TasksArray.reduce((acc, task) => {
                const start = new Date(new Date().toISOString().split('T')[0] + 'T' + task.Start_Time);
                const end = new Date(new Date().toISOString().split('T')[0] + 'T' + task.End_Time);
                return acc + (end - start);
            }, 0);

            const firstTaskStart = new Date(new Date().toISOString().split('T')[0] + 'T' + TasksArray[0].Start_Time);
            const lastTaskEnd = new Date(new Date().toISOString().split('T')[0] + 'T' + TasksArray[TasksArray.length - 1].End_Time);
            const totalTime = lastTaskEnd - firstTaskStart;
            const freeTime = totalTime - totalDuration;

            const totalSeconds = Math.floor(totalTime / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            setTotalTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

            const taskData = TasksArray.map(task => {
                const start = new Date(new Date().toISOString().split('T')[0] + 'T' + task.Start_Time);
                const end = new Date(new Date().toISOString().split('T')[0] + 'T' + task.End_Time);
                const duration = end - start;
                return {
                    label: `${task.Task_Name} (${task.Start_Time} - ${task.End_Time})`,
                    duration,
                    backgroundColor: getRandomColor()
                };
            });

            const chartData = {
                labels: taskData.map(task => task.label),
                datasets: [{
                    data: taskData.map(task => task.duration),
                    backgroundColor: taskData.map(task => task.backgroundColor),
                    borderColor: 'rgba(255, 255, 255, 1)',
                    borderWidth: 1
                }]
            };

            chartData.labels.push('Free Time');
            chartData.datasets[0].data.push(freeTime);
            chartData.datasets[0].backgroundColor.push('#ADD8E6');

            setChartData(chartData);
        }
    }, [TasksArray]);

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    useEffect(() => {
        if (TasksArray.length > 0) {
            const firstTaskStart = new Date(new Date().toISOString().split('T')[0] + 'T' + TasksArray[0]?.Start_Time);
            const lastTaskEnd = new Date(new Date().toISOString().split('T')[0] + 'T' + TasksArray[TasksArray.length - 1]?.End_Time);
            const totalTime = lastTaskEnd - firstTaskStart;

            const totalSeconds = Math.floor(totalTime / 1000);
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            setTotalTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
        }
    }, [TasksArray]);

    return TasksArray.length > 0 ? (
        <div className='d-flex flex-column align-items-center my-3' style={{ maxHeight: '500px' }}>
            {totalTime && <p className='my-2'>Total Time: {totalTime}</p>}
            <PieChart
                data={chartData?.map(task => ({
                    name: `${task?.Task_Name} (${task.Start_Time} - ${task?.End_Time})`,
                    value: new Date(task?.End_Time) - new Date(task?.Start_Time),
                    color: getRandomColor()
                }))}
            />
        </div>
    ) : (
        <h5 className="text-center my-5">No Data For PieChart!</h5>
    );
};

export default MuiPieChart;
