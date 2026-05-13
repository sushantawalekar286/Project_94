import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ message = 'Loading...', fullscreen = false }) => {
  return (
    <div className={fullscreen ? 'fixed inset-0 flex-center bg-black/50 z-50' : 'flex-center py-12'}>
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-dark-700 border-t-primary-500 rounded-full"
        />
        <p className="text-dark-300 text-sm font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Loader;
