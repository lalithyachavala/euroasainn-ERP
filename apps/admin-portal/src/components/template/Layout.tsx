/**
 * Ultra-Modern Layout Component
 * World-Class SaaS ERP Platform Design
 */

import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function TemplateLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full bg-gray-50 text-gray-900 overflow-hidden">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={(collapsed) => setSidebarCollapsed(collapsed)} 
      />
      <div
        className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out bg-gray-50 ${
          sidebarCollapsed ? 'ml-20' : 'ml-72'
        }`}
      >
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 text-gray-900 pt-16">
          <div className="w-full min-h-full p-6 lg:p-8 bg-gray-50">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}






