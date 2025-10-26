import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const removeNotificationRef = useRef();

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  removeNotificationRef.current = removeNotification;

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();

    const notification = {
      id,
      message,
      type, // 'success', 'error', 'info', 'warning'
      duration
    };

    setNotifications(prev => [...prev, notification]);

    // Auto remove notification after duration
    if (duration > 0) {
      setTimeout(() => {
        if (removeNotificationRef.current) {
          removeNotificationRef.current(id);
        }
      }, duration);
    }

    return id;
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
