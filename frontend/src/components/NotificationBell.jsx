import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, Info } from 'lucide-react';
import notificationService from '../services/notificationService';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getMyNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Poll every 60s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-gray-400 hover:bg-gray-50 hover:text-indigo-600 rounded-full transition-all group"
      >
        <Bell size={22} className={unreadCount > 0 ? 'text-indigo-600 animate-pulse' : ''} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] font-black text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="p-4 bg-slate-50 border-b border-gray-100 flex items-center justify-between">
            <h4 className="font-black text-slate-800">Notifications</h4>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkRead}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                <Check size={12} className="mr-1" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-gray-400">
                <Bell size={32} className="mb-3 opacity-20" />
                <p className="font-bold text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.slice(0, 10).map((notif) => (
                  <div key={notif.id} className={`p-4 transition-colors ${notif.is_read ? 'bg-white' : 'bg-indigo-50/30'}`}>
                    <div className="flex space-x-3">
                      <div className="mt-0.5"><Info size={16} className={notif.is_read ? 'text-gray-400' : 'text-indigo-500'} /></div>
                      <div className="flex-1">
                        <p className={`text-sm ${notif.is_read ? 'text-gray-600 font-medium' : 'text-slate-800 font-bold'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs font-bold text-gray-400 mt-1 flex items-center">
                          <Clock size={10} className="mr-1" /> {getTimeAgo(notif.created_at)}
                        </p>
                      </div>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {notifications.length > 10 && (
            <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
              <span className="text-xs font-bold text-gray-500">Showing last 10 activities</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
