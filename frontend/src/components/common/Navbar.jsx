import React from 'react';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ showCart = true, tableNumber = null }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cartCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-dark-900 border-b border-dark-700 backdrop-blur-lg"
    >
      <div className="container-max">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-gold-500 bg-clip-text text-transparent">
              🍽️ DigitalWaiter
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {tableNumber && (
              <div className="badge badge-info">
                Table #{tableNumber}
              </div>
            )}
            
            {showCart && !user && (
              <Link to="/menu" className="btn-primary text-sm">
                View Menu
              </Link>
            )}

            {user && (
              <div className="flex items-center gap-4">
                <span className="text-dark-400 text-sm">
                  {user.role === 'admin' ? '👨‍💼' : '👨‍🍳'} {user.name}
                </span>
                {user.role === 'chef' && (
                  <Link to="/chef" className="btn-secondary text-sm">
                    Dashboard
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="btn-secondary text-sm">
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn-icon text-dark-400 hover:text-primary-500"
                >
                  <FiLogOut size={20} />
                </button>
              </div>
            )}

            {showCart && user?.role !== 'admin' && user?.role !== 'chef' && (
              <Link to="/cart" className="relative btn-icon text-primary-500">
                <FiShoppingCart size={24} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden btn-icon text-white"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4 border-t border-dark-700"
          >
            <div className="flex flex-col gap-3 pt-4">
              {tableNumber && (
                <div className="badge badge-info">
                  Table #{tableNumber}
                </div>
              )}
              
              {!user && (
                <Link to="/menu" className="btn-primary text-center w-full">
                  View Menu
                </Link>
              )}

              {user && (
                <>
                  <div className="text-dark-400 text-sm px-3">
                    {user.role === 'admin' ? '👨‍💼' : '👨‍🍳'} {user.name}
                  </div>
                  {user.role === 'chef' && (
                    <Link to="/chef" className="btn-secondary text-center">
                      Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="btn-secondary text-center">
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-center"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
