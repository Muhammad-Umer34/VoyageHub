import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, X, Clock, UserPlus, Trash2, WifiOff, Wifi } from "lucide-react";

import { Get_Invitations } from "../api/auth";

export default function Notifications({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting'); 
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;

  // Fetch existing invitations on mount
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const response = await Get_Invitations();
        console.log('Fetched existing invitations:', response.data);
        setNotifications(response.data.invitations || []);
      } catch (error) {
        console.error("Failed to fetch invitations:", error);
      }
    };

    if (userId) {
      fetchInvitations();
    }
  }, [userId]);

  // Clean up function
  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  // Connect to WebSocket
  const connectWebSocket = useCallback(() => {
    if (!userId || !mountedRef.current) {
      console.log('Cannot connect: userId missing or component unmounted');
      return;
    }

    cleanup();

    try {
      console.log(`Connecting to WebSocket for user ${userId}...`);
      setConnectionStatus('connecting');

      const ws = new WebSocket(`ws://localhost:8000/ws/notifications/${userId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log('✅ WebSocket connected successfully');
        setConnectionStatus('connected');
        setReconnectAttempts(0);
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        
        try {
          const notification = JSON.parse(event.data);
          console.log('📨 Received notification:', notification);
          
          // Skip welcome messages
          if (notification.id === 'welcome') {
            console.log('Welcome message received');
            return;
          }
          
          // Add new notification to the list
          setNotifications((prev) => {
            // Check if notification already exists
            const exists = prev.some(n => n.id === notification.id);
            if (exists) {
              console.log('Notification already exists, skipping');
              return prev;
            }
            console.log('Adding new notification to list');
            return [notification, ...prev];
          });
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;
        
        console.log('WebSocket closed:', event.code, event.reason);
        setConnectionStatus('disconnected');
        wsRef.current = null;

        if (event.code !== 1000 && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          const nextAttempt = reconnectAttempts + 1;
          console.log(`Reconnecting... Attempt ${nextAttempt}/${MAX_RECONNECT_ATTEMPTS}`);
          setReconnectAttempts(nextAttempt);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
              connectWebSocket();
            }
          }, RECONNECT_INTERVAL);
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.error('Max reconnection attempts reached');
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setConnectionStatus('disconnected');
    }
  }, [userId, reconnectAttempts, cleanup]);

  // Initialize WebSocket connection
  useEffect(() => {
    mountedRef.current = true;
    
    if (userId) {
      connectWebSocket();
    }

    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [userId, connectWebSocket, cleanup]);

  // Manual reconnect function
  const handleReconnect = () => {
    setReconnectAttempts(0);
    connectWebSocket();
  };

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
        throw new Error(`Failed to ${action} invite: ${res.statusText}`);
      }

      const data = await res.json();
      console.log(`✅ Invite ${action}ed:`, data);
      
      // Update notification status locally
      setNotifications((prev) =>
        prev.map((n) => 
          n.id === id 
            ? { ...n, status: action === "accept" ? "accepted" : "rejected" } 
            : n
        )
      );
      
      // Show success message
      alert(`Invitation ${action === "accept" ? "accepted" : "declined"} successfully!`);
      
    } catch (err) {
      console.error(`❌ Failed to respond to invite:`, err);
      alert(`Failed to ${action} invitation. Please try again.`);
    }
  };

  // Delete notification
  const deleteNotification = (id) => {
    console.log('Deleting notification:', id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    console.log('Clearing all notifications');
    setNotifications([]);
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

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
                        onClick={handleReconnect}
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
                                    {notification.status === "accepted" ? "Accepted" : "Declined"}
                                  </span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => deleteNotification(notification.id)}
                                  className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
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