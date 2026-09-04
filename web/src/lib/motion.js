// Shared Framer Motion variants for the aurora design system.
// Reduced-motion is handled globally via CSS + useReducedMotion in consumers.

export const EASE = [0.22, 1, 0.36, 1];
export const EASE_SPRING = [0.34, 1.56, 0.64, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: EASE },
  },
};

export const staggerContainer = (stagger = 0.07, delayChildren = 0.05) => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18, ease: 'easeIn' } },
};

// Wraps children in a motion element with the standard page transition.
export const pageTransitionProps = {
  initial: 'initial',
  animate: 'enter',
  exit: 'exit',
  variants: pageVariants,
};
