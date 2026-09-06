import { motion } from 'framer-motion';
import clsx from 'clsx';
import { EASE } from '../lib/motion';

// Route-level transition wrapper. Used by every page for the
// AnimatePresence fade/slide on navigation.
export default function Page({ children, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.32, ease: EASE }}
      className={clsx('flex flex-col gap-4 tablet:gap-5', className)}
    >
      {children}
    </motion.div>
  );
}
