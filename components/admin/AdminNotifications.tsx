// components/admin/AdminNotifications.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, 
  FiHeart, 
  FiMessageCircle, 
  FiMail, 
  FiClock, 
  FiCheck, 
  FiX,
  FiChevronRight,
  FiUser
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { postService } from '@/services/postService';
import toast from 'react-hot-toast';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'reply';
  post_id: number;
  comment_id?: number;
  user_id: string;
  user_email: string;
  user_name: string;
  message: string;
  read: boolean;
  created_at: string;
}


export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
    
    // Set up polling for new notifications (every 30 seconds)
    const interval = setInterval(loadNotifications, 30000);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // components/admin/AdminNotifications.tsx
const loadNotifications = async () => {
  try {
    setLoading(true);
    console.log('Fetching admin notifications...');
    const data = await postService.getAdminNotifications();
    console.log('Received data:', data);
    
    if (data && data.notifications) {
      console.log('Number of notifications:', data.notifications.length);
      console.log('Notification types:', data.notifications.map((n: Notification) => n.type));
      setNotifications(data.notifications);
      setUnreadCount(data.notifications.filter((n: Notification) => !n.read).length);
    } else {
      console.log('No notifications array in response:', data);
    }
  } catch (error) {
    console.error('Error loading notifications:', error);
  } finally {
    setLoading(false);
  }
};

  const markAsRead = async (id: number) => {
    try {
      await postService.markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await postService.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };
  

  // components/admin/AdminNotifications.tsx
// Update the handleNotificationClick function

// components/admin/AdminNotifications.tsx
// Update the handleNotificationClick function

const handleNotificationClick = async (notification: Notification) => {
  try {
    markAsRead(notification.id);
    setShowDropdown(false);
    
    // Navigate to the post page - the page will handle if post is missing
    router.push(`/admin/posts/${notification.post_id}?comment=${notification.comment_id || ''}`);
    
  } catch (error) {
    console.error('Error handling notification click:', error);
  }
};
  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <FiHeart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <FiMessageCircle className="w-4 h-4 text-emerald-500" />;
      case 'reply':
        return <FiMail className="w-4 h-4 text-blue-500" />;
      default:
        return <FiBell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50';
    switch (type) {
      case 'like':
        return 'bg-red-50';
      case 'comment':
        return 'bg-emerald-50';
      case 'reply':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2.5 bg-gradient-to-r from-green-700 to-green-900 rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        <FiBell className="w-5 h-5 text-white" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FiBell className="text-green-600" />
                  Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 hover:bg-green-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <FiCheck className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                    <FiBell className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-gray-500 font-medium">No notifications</p>
                  <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${getBgColor(notification.type, notification.read)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 mb-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FiUser className="w-3 h-3" />
                          <span className="truncate">{notification.user_name}</span>
                          <span>•</span>
                          <FiClock className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                      <FiChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};