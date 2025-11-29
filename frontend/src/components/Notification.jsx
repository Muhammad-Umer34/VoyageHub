import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, X, Clock, UserPlus, Trash2, WifiOff, Wifi } from "lucide-react";

import { Get_Invitations } from "../api/auth";
import { useWebSocket } from "../contexts/WebSocketContext";

export default function Notifications() {
  const {
    connectionStatus,
    notifications,
    reconnect,
    updateNotificationStatus,
    deleteNotification,
    clearAllNotifications,
    addNotifications,
  } = useWebSocket();

  const [isOpen, setIsOpen] = useState(false);

  // Fetch existing invitations on mount
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await Get_Invitations();
        console.log('Fetched existing invitations:', response.data);
        
        // Handle different response structures
        const invitationsList = Array.isArray(response.data) 
          ? response.data 
          : response.data.invitations || [];
          
        addNotifications(invitationsList);
      } catch (error) {
        console.error("Failed to fetch invitations:", error);
      }
    };

    fetchInvitations();
  }, [addNotifications]);

  // Respond to invite
  const respondToInvite = async (id, action) => {
    try {
      console.log(`Responding to notification ${id} with action: ${action}`);
      
      const res = await fetch(`http://localhost:8000/itineraries/invite/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification_id: id }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to ${action} invite`);
      }

      const data = await res.json();
      console.log(`✅ Invite ${action}ed:`, data);
      
      // Update notification status
      updateNotificationStatus(id, action === "accept" ? "accepted" : "rejected");
      
      // Show success message
      const successMessage = action === "accept" 
        ? "Invitation accepted successfully! The trip has been added to your dashboard." 
        : "Invitation declined successfully.";
      alert(successMessage);
      
    } catch (err) {
      console.error(`❌ Failed to respond to invite:`, err);
      alert(err.message || `Failed to ${action} invitation. Please try again.`);
    }
  };

  const unreadCount = notifications.filter((n) => n.status === "pending").length;

  const getStatusIcon = (status) => {
    if (status === "accepted") return <Check className="w-4 h-4 text-green-500" />;
    if (status === "rejected") return <X className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusColor = (status) => {
    if (status === "accepted") return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
    if (status === "rejected") return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
  };

  const getStatusText = (status) => {
    if (status === "accepted") return "Accepted";
    if (status === "rejected") return "Declined";
    return "Pending";
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}

        {/* Connection Status Indicator */}
        <span 
          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            'bg-red-500'
          }`}
          title={connectionStatus}
          aria-label={`Connection status: ${connectionStatus}`}
        />
      </motion.button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-96 max-h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Bell className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    Notifications
                  </h3>
                  <div className="flex items-center gap-2">
                    {/* Connection Status */}
                    {connectionStatus === 'connected' ? (
                      <Wifi className="w-4 h-4 text-green-500" title="Connected" />
                    ) : connectionStatus === 'connecting' ? (
                      <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" title="Connecting..." />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-500" title="Disconnected" />
                    )}
                    
                    {notifications.length > 0 && (
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                </div>

                {/* Disconnection Warning */}
                {connectionStatus === 'disconnected' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Connection lost
                      </p>
                      <button
                        onClick={reconnect}
                        className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                      >
                        Reconnect
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-[500px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                      No notifications yet
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      You'll be notified when someone invites you to a trip
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {notifications.map((notification, index) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                          getStatusColor(notification.status)
                        } border-l-4`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-white" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white font-medium mb-2">
                              {notification.message}
                            </p>

                            {/* Status or Actions */}
                            {notification.status === "pending" ? (
                              <div className="flex items-center gap-2 mt-3">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => respondToInvite(notification.id, "accept")}
                                  className="flex-1 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-1"
                                >
                                  <Check className="w-4 h-4" />
                                  Accept
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => respondToInvite(notification.id, "reject")}
                                  className="flex-1 px-3 py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                                >
                                  <X className="w-4 h-4" />
                                  Decline
                                </motion.button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-1.5 text-sm font-medium">
                                  {getStatusIcon(notification.status)}
                                  <span className={
                                    notification.status === "accepted"
                                      ? "text-green-700 dark:text-green-400"
                                      : "text-red-700 dark:text-red-400"
                                  }>
                                    {getStatusText(notification.status)}
                                  </span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                  aria-label="Delete notification"
                                >
                                  <Trash2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <button
                    onClick={clearAllNotifications}
                    className="w-full text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
                  >
                    Clear all notifications
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}