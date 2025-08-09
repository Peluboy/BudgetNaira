import { useLocation, NavLink } from "react-router-dom";
import {
  House,
  Wallet,
  ChartPieSlice,
  Vault,
  ChartLine,
  Gear,
  Bank,
  Lightbulb,
  UsersThree,
} from "phosphor-react";

const BottomMenu = () => {
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
    <div className="fixed bottom-0 left-0 right-0 bg-[#121212] text-white z-50 px-2 py-2">
      <div className="flex justify-between items-center w-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center justify-center px-2 py-1 transition-all duration-200 ${
                isActive ? "text-white" : "text-white/50"
              }`}
            >
              {isActive ? (
                <div className="flex items-center gap-2 bg-white/5 px-3.5 py-2.5 rounded-md">
                  <Icon className="w-6 h-6" weight="fill" />
                  <span className="text-sm">{item.label}</span>
                </div>
              ) : (
                <Icon className="w-6 h-6" weight="regular" />
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default BottomMenu;
