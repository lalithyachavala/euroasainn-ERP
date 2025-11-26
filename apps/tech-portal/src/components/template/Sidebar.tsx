/**
 * Sidebar with Dropdown + Icons + Arrow Toggle
 * Final Version
 */

import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdPeople,
  MdBusinessCenter,
  MdVpnKey,
  MdAdminPanelSettings,
  MdSettings,
  MdChevronLeft,
  MdChevronRight,
  MdRocketLaunch,
  MdLogout,
  MdBarChart,
  MdAssignment,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdSecurity,
  MdPersonAdd
} from 'react-icons/md';

import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: MdDashboard },
  { path: '/users', label: 'Users', icon: MdPeople },
  { path: '/organizations', label: 'Organizations', icon: MdBusinessCenter },
  { path: '/onboarding-data', label: 'Onboarding', icon: MdAssignment },
  { path: '/licenses', label: 'Licenses', icon: MdVpnKey },

  // ---- DROPDOWN UPDATED WITH ICONS ----
  {
    label: 'Role Management',
    icon: MdAdminPanelSettings,
    children: [
      { path: '/roles', label: 'Roles & Permissions', icon: MdSecurity },
      { path: '/assign-roles', label: 'Assign Roles', icon: MdPersonAdd }
    ]
  },

  { path: '/analytics', label: 'Analytics', icon: MdBarChart },
  { path: '/settings', label: 'Settings', icon: MdSettings },
];


export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [openMenu, setOpenMenu] = useState<string | null>('Role Management');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className={cn('flex items-center gap-3 flex-1', collapsed && 'justify-center')}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
            <MdRocketLaunch className="w-6 h-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Euroasiann ERP</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tech Portal</p>
            </div>
          )}
        </div>

        <button
          onClick={() => onToggle(!collapsed)}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
        </button>
      </div>


      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {

          if (item.children) {
            const isOpen = openMenu === item.label;
            return (
              <div key={item.label}>
                {/* Parent Button */}
                <button
                  onClick={() => setOpenMenu(isOpen ? null : item.label)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800',
                    collapsed && 'justify-center'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </div>

                  {/* Arrow Icon */}
                  {!collapsed && (
                    isOpen ? (
                      <MdKeyboardArrowDown className="text-gray-500" />
                    ) : (
                      <MdKeyboardArrowRight className="text-gray-500" />
                    )
                  )}
                </button>

                {/* Dropdown Submenu */}
                {!collapsed && isOpen && (
                  <div className="ml-10 mt-2 space-y-1">
                    {item.children.map((child) => {
                      const isActive = location.pathname === child.path;
                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={cn(
                            'flex items-center gap-3 px-2 py-2 text-sm rounded-md transition',
                            isActive
                              ? 'text-blue-600 font-semibold'
                              : 'text-gray-500 hover:text-gray-900'
                          )}
                        >
                          <child.icon className="w-4 h-4 opacity-80" />
                          {child.label}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // Single menu
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition',
                  collapsed && 'justify-center',
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-semibold'
                    : 'text-gray-700 hover:bg-gray-100'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>


      {/* Footer User Info */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </div>
            <div>
              <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100',
            collapsed && 'justify-center'
          )}
        >
          <MdLogout className="w-5 h-5" />
          {!collapsed && 'Logout'}
        </button>
      </div>

    </aside>
  );
}
