import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

const TaskActivityChart = ({ startDate, endDate, taskActivity }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');

      const labels = taskActivity.map(task => new Date(task.Work_Dt));
      const data = taskActivity.map(task => task.Worked_Minutes);

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Worked Minutes',
            data: data,
            borderColor: 'blue',
            backgroundColor: 'transparent',
            pointBackgroundColor: 'blue',
            pointRadius: 5,
            pointHoverRadius: 7,
          }]
        },
        options: {
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
                min: startDate,
                max: endDate,
              },
              title: {
                display: true,
                text: 'Date'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Worked Minutes'
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    label += context.parsed.y + ' minutes';
                  }
                  const task = taskActivity[context.dataIndex];
                  if (task) {
                    label += ` (${task.Employee_Name}, Time: ${task.Start_Time}-${task.End_Time})`;
                  }
                  return label;
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [startDate, endDate, taskActivity]);

  return <canvas ref={chartRef} />;
};

export default TaskActivityChart;
