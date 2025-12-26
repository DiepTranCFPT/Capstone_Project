import React, { useEffect, useState } from 'react';
import { Modal } from 'antd';
import { notificationService } from '~/services/notificationService';
import type { NotificationResponse } from '~/types/notification';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const STORAGE_KEY = 'notification_modal_shown';

/**
 * Modal component that shows public notifications to users on login
 */
const NotificationModal: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndShow = async () => {
      try {
        // Check if already shown in this session
        const alreadyShown = sessionStorage.getItem(STORAGE_KEY);
        if (alreadyShown === 'true') {
          setLoading(false);
          return;
        }

        const data = await notificationService.getPublicNotification();
        
        if (data && data.length > 0) {
          // Sort by createdAt descending to get the latest
          const sorted = data.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          setNotifications(sorted);
          setVisible(true);
          // Mark as shown in this session
          sessionStorage.setItem(STORAGE_KEY, 'true');
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndShow();
  }, []);

  const handleClose = () => {
    setVisible(false);
  };

  // Helper to extract message content if it's stored as JSON string
  const getDisplayMessage = (message: string): string => {
    if (!message) return '';
    try {
      if (message.startsWith('{') && message.includes('"message"')) {
        const parsed = JSON.parse(message);
        return parsed.message || message;
      }
    } catch {
      // Not JSON, return as-is
    }
    return message;
  };

  if (loading || notifications.length === 0) {
    return null;
  }

  const latestNotification = notifications[0];

  return (
    <Modal
      open={visible}
      onCancel={handleClose}
      footer={null}
      centered
      width={450}
      className="notification-welcome-modal"
      closable={false}
      styles={{
        body: { padding: 0 }
      }}
    >
      <div className="p-8 text-center">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
            <img 
              src="/logo-ap.png" 
              alt="AP Logo" 
              className="w-10 h-10 object-contain filter brightness-0 invert"
            />
          </div>
        </div>

        {/* Notification Content */}
        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          {getDisplayMessage(latestNotification.message)}
        </p>

        {/* Action Button */}
        <button
          onClick={handleClose}
          className="w-full py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <span>Continue to System</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </Modal>
  );
};

export default NotificationModal;
