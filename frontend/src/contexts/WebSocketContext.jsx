import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children, userId }) => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [notifications, setNotifications] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);  // <-- NEW state for active users
  const [messageQueue, setMessageQueue] = useState([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const listenersRef = useRef(new Set());

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;

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
          if (notification.type === 'active_users_update') {
            console.log('🟢 Active users updated:', notification.active_users);
            setActiveUsers(notification.active_users);
            return; 
          }
          if (notification.type === 'chat_message') {
            console.log('💬 New chat message received:', notification);
            setMessageQueue((prev) => [...prev, notification]);
            return;
          }

          if (notification.id === 'welcome') {
            console.log('Welcome message received');
            return;
          }

          listenersRef.current.forEach(listener => {
            listener(notification);
          });

          setNotifications((prev) => {
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

  const reconnect = useCallback(() => {
    setReconnectAttempts(0);
    connectWebSocket();
  }, [connectWebSocket]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket is not connected');
    return false;
  }, []);

  const subscribe = useCallback((callback) => {
    listenersRef.current.add(callback);
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);

  const updateNotificationStatus = useCallback((id, status) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status } : n))
    );
  }, []);

  // Delete notification
  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Add notification manually (for initial fetch)
  const addNotifications = useCallback((newNotifications) => {
    setNotifications(newNotifications);
  }, []);

  // Log activeUsers whenever it changes
  useEffect(() => {
    console.log('Active users list updated:', activeUsers);
  }, [activeUsers]);

  const value = {
    connectionStatus,
    notifications,
    activeUsers,  // expose activeUsers in context
    messageQueue,
    setMessageQueue,
    reconnect,
    sendMessage,
    subscribe,
    updateNotificationStatus,
    deleteNotification,
    clearAllNotifications,
    addNotifications,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
