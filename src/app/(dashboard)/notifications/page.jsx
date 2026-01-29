'use client';

import { useState, useEffect } from 'react';
import {
  Bell, AlertTriangle, Mail, CheckCircle, Clock, Users,
  FileText, TrendingUp, RefreshCw, Filter, Search, Eye,
  Calendar, Building, Loader2, X, Info, Settings, Package
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import toast, { Toaster } from 'react-hot-toast';

export default function NotificationsDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/notifications');
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
      } else {
        toast.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'threshold-exceeded':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'attendance-report':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'document-reminder':
        return <Mail className="h-5 w-5 text-orange-500" />;
      case 'system':
        return <Info className="h-5 w-5 text-slate-500" />;
      default:
        return <Bell className="h-5 w-5 text-slate-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'threshold-exceeded':
        return 'border-red-200 bg-red-50';
      case 'attendance-report':
        return 'border-blue-200 bg-blue-50';
      case 'document-reminder':
        return 'border-orange-200 bg-orange-50';
      case 'system':
        return 'border-slate-200 bg-slate-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter;
    const matchesSearch = searchTerm === '' ||
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, read: true }
              : notif
          )
        );
        toast.success('Notification marked as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const getStats = () => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.read).length;
    const highPriority = notifications.filter(n => n.priority === 'high' && !n.read).length;
    const thresholdAlerts = notifications.filter(n => n.type === 'threshold-exceeded').length;

    return { total, unread, highPriority, thresholdAlerts };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div>
                  <Skeleton className="h-8 w-64 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
              <div className="flex gap-2">
                 <Skeleton className="h-10 w-24 rounded-lg" />
                 <Skeleton className="w-10 h-10 rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
             {/* Stats Skeleton */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[1,2,3,4].map(i => (
                     <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <div className="flex justify-between">
                             <div>
                                 <Skeleton className="h-3 w-24 mb-2" />
                                 <Skeleton className="h-8 w-12 mb-1" />
                                 <Skeleton className="h-3 w-16" />
                             </div>
                             <Skeleton className="w-12 h-12 rounded-xl" />
                         </div>
                     </div>
                 ))}
             </div>

             {/* Filters Skeleton */}
             <div className="bg-white rounded-xl border border-slate-200 p-5">
                 <div className="flex gap-4">
                     <Skeleton className="h-10 w-full" />
                     <Skeleton className="h-10 w-48" />
                 </div>
             </div>

             {/* List Skeleton */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                 <div className="p-6 border-b border-slate-200 flex justify-between">
                     <Skeleton className="h-6 w-48" />
                     <Skeleton className="h-6 w-16 rounded-full" />
                 </div>
                 <div className="divide-y divide-slate-200">
                     {[1,2,3,4,5].map(i => (
                         <div key={i} className="p-5">
                             <div className="flex items-start gap-4">
                                 <Skeleton className="w-10 h-10 rounded-lg" />
                                 <div className="flex-1 space-y-2">
                                     <div className="flex justify-between">
                                         <Skeleton className="h-4 w-48" />
                                         <Skeleton className="h-5 w-20 rounded-md" />
                                     </div>
                                     <Skeleton className="h-4 w-3/4" />
                                     <div className="flex gap-4">
                                         <Skeleton className="h-3 w-24" />
                                         <Skeleton className="h-3 w-24" />
                                     </div>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-11 h-11 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Notifications Dashboard</h1>
                <p className="text-slate-600 text-sm mt-0.5">Monitor system notifications and alerts</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={fetchNotifications}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border-2 border-slate-200 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Notifications</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
                <p className="text-xs text-slate-500 mt-1">All time</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Unread</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stats.unread}</p>
                <p className="text-xs text-slate-500 mt-1">Pending review</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">High Priority</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stats.highPriority}</p>
                <p className="text-xs text-slate-500 mt-1">Needs attention</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center border border-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border-2 border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Threshold Alerts</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stats.thresholdAlerts}</p>
                <p className="text-xs text-slate-500 mt-1">Limit warnings</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center border border-purple-100">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm p-5">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2.5 border-2 border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors bg-white font-medium"
              >
                <option value="all">All Types</option>
                <option value="threshold-exceeded">Threshold Alerts</option>
                <option value="attendance-report">Attendance Reports</option>
                <option value="document-reminder">Document Reminders</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm">
          <div className="p-6 border-b-2 border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Recent Notifications
              </h2>
              {filteredNotifications.length > 0 && (
                <span className="inline-flex items-center px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                  {filteredNotifications.length} Total
                </span>
              )}
            </div>
          </div>

          <div className="divide-y-2 divide-slate-200">
            {filteredNotifications.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 border-2 border-yellow-200">
                  <Bell className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No notifications found</h3>
                <p className="text-slate-500 text-sm max-w-md mx-auto">
                  {searchTerm || filter !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Notifications will appear here when system events occur.'
                  }
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-5 hover:bg-slate-50 cursor-pointer transition-all ${
                    !notification.read ? 'bg-blue-50/50 border-l-4 border-l-yellow-500' : ''
                  }`}
                  onClick={() => setSelectedNotification(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        notification.type === 'threshold-exceeded' ? 'bg-red-100' :
                        notification.type === 'attendance-report' ? 'bg-blue-100' :
                        notification.type === 'document-reminder' ? 'bg-orange-100' :
                        'bg-slate-100'
                      }`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className={`text-sm font-semibold ${
                          !notification.read ? 'text-slate-900' : 'text-slate-700'
                        }`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-md border-2 ${getPriorityBadge(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mt-1.5 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </span>
                        {notification.organization && (
                          <span className="flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5" />
                            {notification.organization}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNotification(notification);
                        }}
                        className="p-2 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-5 border-b-2 border-orange-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
                    {getNotificationIcon(selectedNotification.type)}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {selectedNotification.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-md bg-white/20 text-white border border-white/30`}>
                        {selectedNotification.priority} priority
                      </span>
                      <span className="text-sm text-white/90">
                        {new Date(selectedNotification.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg border-2 border-slate-200">
                  <p className="text-slate-700 text-sm leading-relaxed">{selectedNotification.message}</p>
                </div>

                {selectedNotification.details && (
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600" />
                      Additional Details
                    </h4>
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-blue-100 overflow-x-auto">
                      {typeof selectedNotification.details === 'string'
                        ? selectedNotification.details
                        : JSON.stringify(selectedNotification.details, null, 2)
                      }
                    </pre>
                  </div>
                )}

                {selectedNotification.organization && (
                  <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border-2 border-purple-200">
                    <Building className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-slate-900">Organization:</span>
                    <span className="text-sm text-slate-700">{selectedNotification.organization}</span>
                  </div>
                )}

                {selectedNotification.actions && selectedNotification.actions.length > 0 && (
                  <div className="pt-4 border-t-2 border-slate-200">
                    <h4 className="font-semibold text-slate-900 mb-3">Quick Actions</h4>
                    <div className="flex gap-2 flex-wrap">
                      {selectedNotification.actions.map((action, index) => (
                        <button
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-sm rounded-lg font-semibold transition-all shadow-md"
                          onClick={() => {
                            console.log('Action clicked:', action);
                            toast.success(`Action: ${action.label}`);
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!selectedNotification.read && (
                <div className="mt-6 pt-4 border-t-2 border-slate-200">
                  <button
                    onClick={() => {
                      markAsRead(selectedNotification._id);
                      setSelectedNotification(null);
                    }}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg font-semibold transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Mark as Read
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}