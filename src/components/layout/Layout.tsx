import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import BottomMenu from '../common/BottomMenu';
import Navbar from '../common/Navbar';
// import { useAuth } from '../../hooks/useAuth';

const Layout: React.FC = () => {
  // const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        closeSidebar={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:pb-4">
          <Outlet />
        </main>

        {/* Mobile Bottom Menu */}
        <div className="md:hidden">
          <BottomMenu />
        </div>
      </div>
    </div>
  );
};

export default Layout; 