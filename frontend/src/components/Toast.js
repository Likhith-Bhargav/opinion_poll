import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import './Toast.css';

const Toast = ({ notification }) => {
  const { removeNotification } = useNotification();

  const handleClose = () => {
    removeNotification(notification.id);
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getTypeClass = () => {
    return `toast-${notification.type}`;
  };

  return (
    <div className={`toast ${getTypeClass()}`}>
      <div className="toast-content">
        <span className="toast-icon">{getIcon()}</span>
        <span className="toast-message">{notification.message}</span>
      </div>
      <button className="toast-close" onClick={handleClose}>
        ✕
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const { notifications } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="toast-container">
      {notifications.map((notification) => (
        <Toast key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default ToastContainer;
