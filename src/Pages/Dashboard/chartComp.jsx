import React, { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';

const PieChartComp = ({ TasksArray }) => {
    const [chartData, setChartData] = useState(null);
    const [chartInstance, setChartInstance] = useState(null);
    const [totalTime, setTotalTime] = useState(null);

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

    useEffect(() => {
        if (chartData) {
            if (chartInstance) {
                chartInstance.destroy();
            }

            const ctx = document.getElementById('empWokHours');
            const newChartInstance = new Chart(ctx, {
                type: 'pie',
                data: chartData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const minutes = Math.round(value / (1000 * 60));
                                    return `${label}: ${minutes} minutes`;
                                }
                            }
                        }
                    }
                }
            });

            setChartInstance(newChartInstance);
        }
    }, [chartData]);

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    return TasksArray.length > 0 ? (
        <div className='d-flex flex-column align-items-center my-3' style={{ maxHeight: '500px' }}>
            {totalTime && <p className='my-2'>Total Time: {totalTime}</p>}
            <canvas id="empWokHours" width="400" height="100"></canvas>
        </div>
    ) : (
        <h5 className="text-center my-5">No Data For PieChart!</h5>
    )
};

export default PieChartComp;
