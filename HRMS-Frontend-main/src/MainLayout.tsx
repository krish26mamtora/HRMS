import React, { useState } from 'react'
import useAuth from './features/auth/hooks/useAuth';
import { NavLink, Outlet } from 'react-router-dom';
import useThemeStore from '../src/store/useThemeStore';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from './features/auth/api/axios';

export default function MainLayout() {

    const { isDarkMode, toggleTheme } = useThemeStore();

    const role = localStorage.getItem('role');
    const {accessToken , logout }  = useAuth();

      const queryClient = useQueryClient();
    const [showNotif, setShowNotif] = useState(false);

    
    const { data: notifications } = useQuery({
        queryKey: ['inAppNotifications'],
        queryFn: async () => {
            const response = await api.get('/EmployeePlan/unread');
            return response.data;
        },
        enabled: !!accessToken && role === 'Employee',
    });

    const unreadCount = notifications?.length || 0;

    const handleMarkAsRead = async (id: number) => {
      try {
        await api.post('/EmployeePlan/mark-as-read', { ids: [id] });
        queryClient.invalidateQueries({ queryKey: ['inAppNotifications'] });
      } catch (error) {
        console.error("Error marking as read", error);
      }
    };

    const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? "text-yellow-400" : "hover:text-yellow-300 transition";

  return (
    <div className="min-h-screen bg-gray-50">
        <nav className="p-4 shadow-md" style={{ background: isDarkMode ? '#333' : '#eee', color: isDarkMode ? '#fff' : '#000' }}>
            <div className="container mx-auto flex justify-end items-center">
               <div className="flex gap-6 items-center mr-4">
        
            {accessToken && role === 'HR' && (
              <div className="flex gap-4 border-l pl-4 border-gray-200">
                <NavLink to="/hr/travel" className={navLinkClass}>Travel</NavLink>
                <NavLink to="/hr/social" className={navLinkClass}>Social</NavLink>
                <NavLink to="/hr/games" className={navLinkClass}>Games</NavLink>
                <NavLink to="/hr/organization" className={navLinkClass}>Organization</NavLink>
                <NavLink to="/hr/jobs" className={navLinkClass}>Jobs</NavLink>
                <NavLink to="/hr/profile" className={navLinkClass}>Profile</NavLink>
              </div>
            )}

            {accessToken && role === 'Employee' && (
              <div className="flex gap-4 border-l pl-4 border-gray-200">
                <NavLink to="/employee/travel" className={navLinkClass}>Travel</NavLink>
                <NavLink to="/employee/social" className={navLinkClass}>Social</NavLink>
                <NavLink to="/employee/games" className={navLinkClass}>Games</NavLink>
                <NavLink to="/employee/organization" className={navLinkClass}>Organization</NavLink>
                <NavLink to="/employee/jobs" className={navLinkClass}>Jobs</NavLink>
                <div className="relative group cursor-pointer px-2" onClick={() => setShowNotif(!showNotif)}>
                    <span className="text-gray-600 hover:text-blue-600 transition-colors">🔔</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">
                        {unreadCount}
                      </span>
                    )}

                    {showNotif && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded shadow-lg z-50">
                        <div className="p-2 border-b font-bold text-xs bg-gray-50">Notifications</div>
                        <div className="max-h-48 overflow-y-auto">
                          {unreadCount === 0 ? (
                            <div className="p-3 text-xs text-gray-400 text-center">No new plans</div>
                          ) : (
                            notifications.map((n) => (
                              <div 
                                key={n.id} 
                                onClick={() => handleMarkAsRead(n.id)}
                                className="p-2 border-b hover:bg-blue-50 text-[11px] cursor-pointer"
                              >
                                {n.message}
                                {n.createdAt ? new Date(n.createdAt).toLocaleString() : "Loading..."}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                <NavLink to="/employee/profile" className={navLinkClass}>Profile</NavLink>

              </div>
            )}

            
            {accessToken && role === 'Manager' && (
              <div className="flex gap-4 border-l pl-4 border-gray-200">
                <NavLink to="/manager/team-members" className={navLinkClass}>Team</NavLink>
                   <NavLink to="/manager/social" className={navLinkClass}>Social</NavLink>
                        <NavLink to="/manager/profile" className={navLinkClass}>Profile</NavLink>
                <NavLink to="/manager/organization" className={navLinkClass}>Organization</NavLink>
              </div>
            )}

          </div>

                <div className="flex gap-2 items-center">
                {
                    !accessToken && 
                    <>
                        <NavLink to="/login" className={navLinkClass}>Login</NavLink>
                        <NavLink to="register" className={navLinkClass}>Register</NavLink>
                    </>
                }

                {accessToken && (
                    <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
>
                        Logout
                    </button>
                )}
                </div>
            </div>
        </nav>
        <hr />
        <main  className="container mx-auto p-4">

        <Outlet/>
        </main>
    </div>
  )
}