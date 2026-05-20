import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="cube">
        <div className="face face1">1</div>
        <div className="face face2">2</div>
        <div className="face face3">3</div>
        <div className="face face4">4</div>
        <div className="face face5">5</div>
        <div className="face face6">6</div>
      </div>
    </div>
  );
};

export default LoadingScreen;
