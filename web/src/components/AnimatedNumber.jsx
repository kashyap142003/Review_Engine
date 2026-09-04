import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';
import { EASE } from '../lib/motion';

// Counts from 0 to `value` on mount / change. Respects prefers-reduced-motion.
export default function AnimatedNumber({ value, duration = 0.8, className, format, decimals = 0 }) {
  const reduce = useReducedMotion();
  const target = Number(value) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduce) {
      setDisplay(target);
      return;
    }
    const controls = animate(0, target, {
      duration,
      ease: EASE,
      onUpdate: (v) => setDisplay(v),
      onComplete: () => setDisplay(target),
    });
    return () => controls.stop();
  }, [target, duration, reduce]);

  const rounded = decimals > 0 
    ? Number(display.toFixed(decimals))
    : Math.round(display);

  const shown = format ? format(rounded) : rounded.toLocaleString();
  return <span className={className}>{shown}</span>;
}

