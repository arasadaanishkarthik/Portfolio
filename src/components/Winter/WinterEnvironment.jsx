import React, { useEffect, useState } from 'react';
import WinterAtmosphere from './WinterAtmosphere';
import SnowCanvas from './SnowCanvas';

export default function WinterEnvironment({ active }) {
  // transitionStage: 0=Off, 1=Light, 2=Snow/Silhouettes, 3=Fog, 4=Frost
  const [transitionStage, setTransitionStage] = useState(0);

  useEffect(() => {
    let timers = [];
    if (active) {
      // Sequenced entrance
      timers.push(setTimeout(() => setTransitionStage(1), 200));  // Cool light
      timers.push(setTimeout(() => setTransitionStage(2), 500));  // Snow begins
      timers.push(setTimeout(() => setTransitionStage(3), 1000)); // Fog appears
      timers.push(setTimeout(() => setTransitionStage(4), 1500)); // Frost edges
    } else {
      // Exit gracefully
      setTransitionStage(0);
    }
    return () => timers.forEach(clearTimeout);
  }, [active]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      <WinterAtmosphere active={active} transitionStage={transitionStage} />
      <SnowCanvas active={active} transitionStage={transitionStage} />
    </div>
  );
}