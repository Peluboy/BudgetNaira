import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  House,
  Wallet,
  ChartPieSlice,
  Vault,
  ChartLine,
  Gear,
  Bank,
  Lightbulb,
  List,
  UsersThree
} from "phosphor-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, closeSidebar }) => {
  const location = useLocation();

  const navItems = [
    { to: "/", label: "Dashboard", icon: House },
    { to: "/expenses", label: "Expenses", icon: Wallet },
    { to: "/budget", label: "Budget", icon: ChartPieSlice },
    { to: "/savings", label: "Savings", icon: Vault },
    { to: "/analytics", label: "Analytics", icon: ChartLine },
    { to: "/financial-dashboard", label: "Finance", icon: Bank },
    { to: "/financial-advice", label: "Advisor", icon: Lightbulb },
    { to: "/settings", label: "Settings", icon: Gear },
    { to: "/community-savings", label: "Ajo/Esusu", icon: UsersThree },
  ];  

  return (
    <aside className={`h-full flex flex-col py-4 bg-white dark:bg-gray-800 ${isOpen ? 'w-64' : 'w-20'} transition-all duration-300 hidden md:flex`}>
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between">
          {isOpen && (
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="BudgetNaira" className="w-8 h-8" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">BudgetNaira</span>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Toggle sidebar width"
          >
            <List className="w-6 h-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      <nav className="mt-3 flex-1 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => closeSidebar()}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-6 h-6" weight={isActive ? "fill" : "regular"} />
                {isOpen && <span className="text-sm">{item.label}</span>}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {isOpen && (
        <div className="mt-auto px-4 pb-1">
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Free Plan</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Upgrade for more features</p>
            <button className="w-full mt-2 btn btn-primary text-sm py-1.5">
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
