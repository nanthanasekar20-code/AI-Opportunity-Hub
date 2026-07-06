import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, Notification } from '../lib/supabase';
import {
  Bell,
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Check,
  Trash2,
  ExternalLink,
} from 'lucide-react';

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function markAllAsRead() {
    await supabase.from('notifications').update({ read: true }).eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function getIcon(type: Notification['type']) {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-warning-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-error-500" />;
      default:
        return <Info className="w-5 h-5 text-primary-500" />;
    }
  }

  function getBgColor(type: Notification['type']) {
    switch (type) {
      case 'success':
        return 'bg-success-50';
      case 'warning':
        return 'bg-warning-50';
      case 'error':
        return 'bg-error-50';
      default:
        return 'bg-primary-50';
    }
  }

  function formatTime(date: string) {
    const now = new Date();
    const notificationDate = new Date(date);
    const diff = now.getTime() - notificationDate.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return notificationDate.toLocaleDateString();
  }

  const filteredNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Notifications</h1>
          <p className="text-secondary-500">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-white text-secondary-600 hover:bg-secondary-50 border border-secondary-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
            filter === 'unread'
              ? 'bg-primary-100 text-primary-700'
              : 'bg-white text-secondary-600 hover:bg-secondary-50 border border-secondary-200'
          }`}
        >
          Unread
          {unreadCount > 0 && (
            <span className="w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications list */}
      {filteredNotifications.length === 0 ? (
        <div className="bg-white rounded-xl border border-secondary-200 p-12 text-center">
          <Bell className="w-12 h-12 mx-auto text-secondary-300 mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-1">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </h3>
          <p className="text-secondary-500">
            {filter === 'unread'
              ? 'You have read all your notifications'
              : "We'll notify you when something important happens"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-secondary-200 divide-y divide-secondary-100 overflow-hidden">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-secondary-50 transition-colors ${
                !notification.read ? 'bg-primary-50/50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getBgColor(
                    notification.type
                  )}`}
                >
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        className={`font-medium ${
                          notification.read ? 'text-secondary-700' : 'text-secondary-900'
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <p className="text-sm text-secondary-600 mt-0.5">{notification.message}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1.5 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1.5 text-secondary-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-secondary-500">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(notification.created_at)}
                    </span>
                    {notification.link && (
                      <Link
                        to={notification.link}
                        className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
                      >
                        View details
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
