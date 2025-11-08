/**
 * Ultra-Modern Sidebar Component
 * World-Class SaaS ERP Platform Design
 */

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdBusinessCenter,
  MdVpnKey,
  MdTrendingUp,
  MdRocketLaunch,
  MdLogout,
  MdPeople,
  MdPerson,
  MdHistory,
  MdDescription,
  MdNotifications,
  MdSupport,
  MdPayment,
  MdSettings,
  MdPalette,
  MdTranslate,
  MdEmail,
  MdSms,
  MdKeyboardArrowDown,
} from 'react-icons/md';
import { IconType } from 'react-icons';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SidebarToggleIcon } from '../SidebarToggleIcon';

interface NavItem {
  path: string;
  label: string;
  icon: IconType;
  badge?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: MdDashboard },
  { path: '/organizations', label: 'Organizations', icon: MdBusinessCenter },
  { path: '/licenses', label: 'Licenses', icon: MdVpnKey },
  { path: '/onboarding-data', label: 'Onboarding Data', icon: MdPeople },
  { path: '/analytics', label: 'Analytics', icon: MdTrendingUp },
  { path: '/users', label: 'Users', icon: MdPerson },
  { path: '/activity-log', label: 'Activity/Audit Log', icon: MdHistory },
  { path: '/reports', label: 'Reports', icon: MdDescription },
  { path: '/notifications', label: 'Notifications', icon: MdNotifications },
  { path: '/support', label: 'Support Management', icon: MdSupport },
  { path: '/subscription', label: 'Subscription & Billing', icon: MdPayment },
  {
    path: '/settings',
    label: 'Settings',
    icon: MdSettings,
    children: [
      { path: '/settings/branding', label: 'Branding', icon: MdPalette },
      { path: '/settings/regional', label: 'Regional Settings', icon: MdTranslate },
      { path: '/settings/email-templates', label: 'Email Templates', icon: MdEmail },
      { path: '/settings/sms-templates', label: 'SMS Templates', icon: MdSms },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState<{ label: string; x: number; y: number } | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [collapseTooltip, setCollapseTooltip] = useState<{ x: number; y: number } | null>(null);
  const [showCollapseTooltip, setShowCollapseTooltip] = useState(false);
  const tooltipTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const collapseTooltipTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(location.pathname.startsWith('/settings') ? ['/settings'] : [])
  );
  const [isLogoHovered, setIsLogoHovered] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await logout();
      // Navigate to login page after logout
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local storage and navigate
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login', { replace: true });
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, label: string) => {
    if (collapsed) {
      // Clear any existing timeout
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
        tooltipTimeoutRef.current = null;
      }
      
      // Set tooltip data immediately but delay showing it
      setTooltip({ label, x: e.clientX, y: e.clientY });
      setShowTooltip(false);
      
      // Show tooltip after a short delay for smoother experience
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(true);
      }, 150);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (collapsed && tooltip) {
      // Update tooltip position and keep it visible
      setTooltip({ ...tooltip, x: e.clientX, y: e.clientY });
      // Ensure tooltip stays visible while mouse is moving over button
      if (showTooltip) {
        // Tooltip is already visible, just update position
      } else if (tooltipTimeoutRef.current) {
        // Tooltip is scheduled to appear, keep it that way
      } else {
        // Tooltip should be visible but isn't, show it immediately
        setShowTooltip(true);
      }
    }
  };

  const handleMouseLeave = () => {
    // Clear timeout if mouse leaves before tooltip appears
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    // Hide tooltip immediately when mouse leaves
    setShowTooltip(false);
    setTooltip(null);
  };

  const handleCollapseMouseEnter = (e: React.MouseEvent) => {
    if (collapseTooltipTimeoutRef.current) {
      clearTimeout(collapseTooltipTimeoutRef.current);
      collapseTooltipTimeoutRef.current = null;
    }
    setCollapseTooltip({ x: e.clientX, y: e.clientY });
    setShowCollapseTooltip(false);
    collapseTooltipTimeoutRef.current = setTimeout(() => {
      setShowCollapseTooltip(true);
    }, 150);
  };

  const handleCollapseMouseMove = (e: React.MouseEvent) => {
    if (collapseTooltip) {
      setCollapseTooltip({ ...collapseTooltip, x: e.clientX, y: e.clientY });
      if (!showCollapseTooltip && collapseTooltipTimeoutRef.current) {
        setShowCollapseTooltip(true);
      }
    }
  };

  const handleCollapseMouseLeave = () => {
    if (collapseTooltipTimeoutRef.current) {
      clearTimeout(collapseTooltipTimeoutRef.current);
      collapseTooltipTimeoutRef.current = null;
    }
    setShowCollapseTooltip(false);
    setCollapseTooltip(null);
  };

  const handleLogoMouseEnter = (e: React.MouseEvent) => {
    if (collapsed) {
      handleCollapseMouseEnter(e);
      setIsLogoHovered(true);
    }
  };

  const handleLogoMouseMove = (e: React.MouseEvent) => {
    if (collapsed) {
      handleCollapseMouseMove(e);
    }
  };

  const handleLogoMouseLeave = () => {
    if (collapsed) {
      handleCollapseMouseLeave();
      setIsLogoHovered(false);
    }
  };

  useEffect(() => {
    if (!collapsed) {
      setIsLogoHovered(false);
    }
  }, [collapsed]);

  // Cleanup timeout on unmount or when collapsed changes
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (collapseTooltipTimeoutRef.current) {
        clearTimeout(collapseTooltipTimeoutRef.current);
      }
    };
  }, [collapsed]);

  // Update expanded items when location changes
  useEffect(() => {
    if (location.pathname.startsWith('/settings')) {
      setExpandedItems((prev) => new Set(prev).add('/settings'));
    }
  }, [location.pathname]);

  const toggleExpanded = (path: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const isItemActive = (item: NavItem): boolean => {
    if (location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some((child) => location.pathname === child.path);
    }
    return false;
  };

  const checkChildActive = (childPath: string): boolean => {
    return location.pathname === childPath;
  };

  return (
    <aside
        className={cn(
        'fixed left-0 top-0 z-50 h-screen bg-white border-r border-gray-200 transition-all duration-300 flex flex-col overflow-x-hidden overflow-y-auto',
        collapsed ? 'w-20' : 'w-72'
      )}
    >
      {/* Logo Section */}
      <div className={cn('flex items-center justify-between border-b border-gray-200 bg-white overflow-hidden', collapsed ? 'px-2 py-4' : 'px-6 py-5')}>
        {collapsed ? (
          // Collapsed state: Only logo, clickable to expand
          <button
            onClick={() => onToggle(false)}
            onMouseEnter={handleLogoMouseEnter}
            onMouseMove={handleLogoMouseMove}
            onMouseLeave={handleLogoMouseLeave}
            className="flex items-center justify-center w-full hover:bg-gray-50 rounded-lg transition-colors p-1"
            aria-label="Expand sidebar"
          >
            <div
              className={cn(
                'flex-shrink-0 rounded-lg flex items-center justify-center w-10 h-10 transition-all duration-200',
                isLogoHovered
                  ? 'bg-gray-100 border border-gray-200 shadow-sm text-gray-600'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg text-white'
              )}
            >
              {isLogoHovered ? (
                <SidebarToggleIcon className="w-5 h-5 text-gray-500" collapsed={true} />
              ) : (
                <MdRocketLaunch className="w-5 h-5" />
              )}
            </div>
          </button>
        ) : (
          // Expanded state: Logo with text and toggle button
          <>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg w-10 h-10">
                <MdRocketLaunch className="text-white w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-gray-900 truncate">
                  Euroasiann ERP
                </h1>
                <p className="text-xs text-gray-500">Admin Portal</p>
              </div>
            </div>
            <button
              onClick={() => onToggle(true)}
              onMouseEnter={handleCollapseMouseEnter}
              onMouseMove={handleCollapseMouseMove}
              onMouseLeave={handleCollapseMouseLeave}
              className="rounded-lg hover:bg-gray-100 transition-colors text-gray-500 flex-shrink-0 relative p-1.5"
              aria-label="Collapse sidebar"
            >
              <SidebarToggleIcon className="w-5 h-5" collapsed={false} />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn('flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1', collapsed ? 'px-2' : 'px-3')}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isActive = isItemActive(item);
          const isExpanded = expandedItems.has(item.path);

          if (hasChildren) {
            return (
              <div key={item.path} className="space-y-1">
                {/* Parent Item */}
                <button
                  onClick={() => !collapsed && toggleExpanded(item.path)}
                  onMouseEnter={(e) => handleMouseEnter(e, item.label)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className={cn(
                    'group relative flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200 w-full text-left',
                    collapsed ? 'justify-center px-2' : 'px-3',
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  )}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-blue-600')} />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium text-left">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">
                          {item.badge}
                        </span>
                      )}
                      <MdKeyboardArrowDown
                        className={cn(
                          'w-4 h-4 transition-transform duration-200',
                          isExpanded && 'transform rotate-180'
                        )}
                      />
                    </>
                  )}
                </button>

                {/* Children Items */}
                {!collapsed && isExpanded && item.children && (
                  <div className="ml-8 space-y-1 border-l-2 border-gray-200 pl-2">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const childIsActive = checkChildActive(child.path);
                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onMouseEnter={(e) => handleMouseEnter(e, child.label)}
                          onMouseMove={handleMouseMove}
                          onMouseLeave={handleMouseLeave}
                          className={cn(
                            'group relative flex items-center gap-3 py-2 rounded-lg transition-all duration-200 px-3',
                            childIsActive
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                          )}
                        >
                          <ChildIcon className={cn('w-4 h-4 flex-shrink-0', childIsActive && 'text-blue-600')} />
                          <span className="flex-1 text-sm font-medium">{child.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onMouseEnter={(e) => handleMouseEnter(e, item.label)}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className={cn(
                'group relative flex items-center gap-3 py-2.5 rounded-lg transition-all duration-200',
                collapsed ? 'justify-center px-2' : 'px-3',
                isActive
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-blue-600')} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-600">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Section */}
      <div className={cn('border-t border-gray-200 bg-white overflow-hidden', collapsed ? 'px-2 py-3' : 'p-4')}>
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.[0] || user?.email?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.role || 'Admin'}</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.firstName?.[0] || user?.email?.[0] || 'A'}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          onMouseEnter={(e) => collapsed && handleMouseEnter(e, 'Logout')}
          onMouseMove={(e) => collapsed && handleMouseMove(e)}
          onMouseLeave={() => collapsed && handleMouseLeave()}
          type="button"
          className={cn(
            'group relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors',
            collapsed && 'justify-center'
          )}
        >
          <MdLogout className="w-4 h-4" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Tooltip that follows mouse for navigation items */}
      {collapsed && tooltip && (
        <div
          className={cn(
            "fixed px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg z-[100] pointer-events-none transition-all duration-150 ease-in-out",
            showTooltip ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y + 10}px`,
            transform: showTooltip ? 'translate(0, 0) scale(1)' : 'translate(0, 0) scale(0.95)',
          }}
        >
          {tooltip.label}
        </div>
      )}

      {/* Tooltip for collapse/expand button or logo (when collapsed) */}
      {collapseTooltip && (
        <div
          className={cn(
            "fixed px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap shadow-lg z-[100] pointer-events-none transition-all duration-150 ease-in-out",
            showCollapseTooltip ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          style={{
            left: `${collapseTooltip.x + 10}px`,
            top: `${collapseTooltip.y + 10}px`,
            transform: showCollapseTooltip ? 'translate(0, 0) scale(1)' : 'translate(0, 0) scale(0.95)',
          }}
        >
          {collapsed ? 'Open sidebar' : 'Close sidebar'}
        </div>
      )}
    </aside>
  );
}



