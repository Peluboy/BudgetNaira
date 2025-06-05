import React from 'react';
import { FaBars } from '@react-icons/all-files/fa/FaBars';
import { FaBell } from '@react-icons/all-files/fa/FaBell';
import { FaUserCircle } from '@react-icons/all-files/fa/FaUserCircle';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  return (
    <nav className="bg-primary-600 text-white shadow-md w-full">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center ml-0 lg:ml-0">
              <span className="text-xl font-bold">BudgetNaira</span>
            </div>
          <div className="flex items-center">
            <button className="p-2 rounded-full hover:bg-primary-700 mr-2" title="notification">
              <FaBell className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-primary-700" title="user">
              <FaUserCircle className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;