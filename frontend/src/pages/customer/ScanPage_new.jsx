import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronRight, FiSmartphone } from 'react-icons/fi';
import { Button } from '../../components/common/Button';
import Navbar from '../../components/common/Navbar';
import toast from 'react-hot-toast';

const ScanPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const tableNumber = searchParams.get('table');

  useEffect(() => {
    if (!tableNumber) {
      toast.error('Please scan a valid QR code');
      setTimeout(() => navigate('/'), 2000);
    }
  }, [tableNumber, navigate]);

  const handleViewMenu = async () => {
    setLoading(true);
    try {
      navigate(`/menu?table=${tableNumber || 1}`);
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Navbar />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex items-center justify-center px-4"
      >
        <div className="max-w-md w-full">
          {/* Welcome Image */}
          <motion.div
            variants={itemVariants}
            className="mb-8 text-center"
          >
            <div className="inline-block p-8 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-3xl border border-primary-500/30 mb-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <FiSmartphone className="w-20 h-20 text-primary-500 mx-auto" />
              </motion.div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-gold-500">Digital Waiter</span>
            </h1>
            <p className="text-dark-300 text-lg mb-6">
              We've detected your table. Start ordering delicious food!
            </p>
          </motion.div>

          {/* Table Info */}
          {tableNumber && (
            <motion.div
              variants={itemVariants}
              className="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-8 text-center"
            >
              <p className="text-dark-400 text-sm mb-2">Table Number</p>
              <p className="text-4xl font-bold text-primary-500">#{tableNumber}</p>
            </motion.div>
          )}

          {/* Features */}
          <motion.div variants={itemVariants} className="space-y-3 mb-8">
            <div className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">1</span>
              <span className="text-dark-300">Browse our delicious menu</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">2</span>
              <span className="text-dark-300">Select your favorite items</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-dark-800/50 rounded-lg border border-dark-700">
              <span className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">3</span>
              <span className="text-dark-300">Place your order instantly</span>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div variants={itemVariants}>
            <Button
              variant="primary"
              size="lg"
              onClick={handleViewMenu}
              loading={loading}
              className="w-full"
            >
              View Menu
              <FiChevronRight size={20} />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ScanPage;
