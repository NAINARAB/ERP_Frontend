import React, { useState, useEffect } from 'react';
import api from '../../API';

const ElapsedTime = ({ trigger, view, endTime }) => {

  const localData = localStorage.getItem("user");
  const parseData = JSON.parse(localData);

  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [reload, setReload] = useState(false);


  useEffect(() => {
    fetch(`${api}startTask?Emp_Id=${parseData?.UserId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStartTime(data?.data);
        } else {
          setStartTime(null)
        }
      }).catch(e => console.error(e))
  }, [reload])

  useEffect(() => {
    const interval = setInterval(() => {
      if (startTime) {
        const currentTime = new Date().getTime();
        const elapsed = currentTime - parseInt(startTime);
        setElapsedTime(elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, reload]);

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    const formatNumber = (number) => {
      return number < 10 ? `0${number}` : number;
    };

    return `${formatNumber(hours)}:${formatNumber(minutes % 60)}:${formatNumber(seconds % 60)}`;
  };

  const progressFun = () => {
    const currentTime = new Date().getTime();
    const elapsed = currentTime - parseInt(startTime);
    const totalDuration = parseInt(endTime) - parseInt(startTime);

    if (elapsed && totalDuration && (elapsed < totalDuration)) {
      return (elapsed / totalDuration) * 100;
    } else if (elapsed && totalDuration && (elapsed >= totalDuration)) {
      return 100;
    } else {
      return 0;
    }
  }

  return (
    <>
      {Number(view) === 1 ? (
        <>
          {formatTime(elapsedTime)}
          <div style={{ width: '100%', backgroundColor: '#ddd' }} className="rounded-4 overflow-hidden">
            <div
              style={{
                width: `${progressFun()}%`,
                backgroundColor: '#007bff',
                height: '20px'
              }} />
          </div>
        </>
      ) : (
        <>
          {formatTime(elapsedTime)}
        </>
      )}
    </>
  );
};

export default ElapsedTime;
