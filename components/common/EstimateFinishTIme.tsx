'use client'
import React, { useEffect, useState } from 'react';
const MovieEstimateFinishTime = ({ runtime }:{runtime:any}) => {
  const [estimatedFinishTime, setEstimatedFinishTime] = useState(calculateEndTime(runtime));

  useEffect(() => {
    const interval = setInterval(() => {
      setEstimatedFinishTime(calculateEndTime(runtime));
    }, 1000);

    return () => clearInterval(interval);
  }, [runtime]);

  return (
    <div className="font-bold">
      Estimated Finish Time:{' '}
      <span className="font-normal">
        {estimatedFinishTime}
      </span>
    </div>
  );
};

const calculateEndTime = (runtime:any) => {
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + (runtime * 60000)); 
  return endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
};

export default MovieEstimateFinishTime;
