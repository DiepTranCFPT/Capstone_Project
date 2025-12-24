import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { websocketService } from '~/services/websocketService';
import { notificationService } from '~/services/notificationService';
import type { NotificationResponse, GetNotificationsParams } from '~/types/notification';
import { toast } from '~/components/common/Toast';
import { useAuth } from '~/hooks/useAuth';

interface NotificationContextType {
    notifications: NotificationResponse[];
    loading: boolean;
    error: string | null;
    unreadCount: number;
    markingAsRead: boolean;
    markingAllAsRead: boolean;
    fetchNotifications: (params?: GetNotificationsParams) => Promise<void>;
    fetchUnreadNotifications: () => Promise<void>;
    fetchAllNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    getUnreadNotifications: () => NotificationResponse[];
    getReadNotifications: () => NotificationResponse[];
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Debug mount

    const { isAuthenticated, user } = useAuth();

    // Debug auth state

    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [markingAsRead, setMarkingAsRead] = useState(false);
    const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
    const wsUnsubscribeRef = useRef<(() => void) | null>(null);

    const handleError = (err: unknown, defaultMessage: string) => {
        const e = err as Error;
        setError(e.message || defaultMessage);
        toast.error(e.message || defaultMessage);
    };

    // Fetch notifications
    const fetchNotifications = useCallback(async (params?: GetNotificationsParams) => {
        setLoading(true);
        setError(null);
        try {
            const data = await notificationService.getNotifications(params);
            setNotifications(data);
        } catch (err) {
            handleError(err, 'Failed to load notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUnreadNotifications = useCallback(async () => {
        await fetchNotifications({ unreadOnly: true });
    }, [fetchNotifications]);

    const fetchAllNotifications = useCallback(async () => {
        await fetchNotifications({ unreadOnly: false });
    }, [fetchNotifications]);

    // Mark as read
    const markAsRead = useCallback(async (notificationId: string) => {
        setMarkingAsRead(true);
        try {
            const updatedNotification = await notificationService.markAsRead(notificationId);
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? updatedNotification : n)
            );
            toast.success('Marked as read');
        } catch (err) {
            handleError(err, 'Failed to update notification');
        } finally {
            setMarkingAsRead(false);
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        setMarkingAllAsRead(true);
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            toast.success('All marked as read');
        } catch (err) {
            handleError(err, 'Failed to update notifications');
        } finally {
            setMarkingAllAsRead(false);
        }
    }, []);

    // Helpers
    const getUnreadNotifications = useCallback(() => {
        return notifications.filter(n => !n.read);
    }, [notifications]);

    const getReadNotifications = useCallback(() => {
        return notifications.filter(n => n.read);
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Ref to always have latest callback
    const handleNewNotificationRef = useRef<((notification: NotificationResponse) => void) | undefined>(undefined);

    // Handle new notification from WebSocket
    handleNewNotificationRef.current = (notification: NotificationResponse) => {

        // Add to beginning of list
        setNotifications(prev => {
            // Avoid duplicates
            const exists = prev.some(n => n.id === notification.id);
            if (exists) {
                return prev;
            }
            return [notification, ...prev];
        });

        // Show toast notification
        toast.info(`📬 ${notification.message}`);
    };

    // Connect WebSocket when authenticated
    useEffect(() => {

        if (isAuthenticated && user) {

            // Connect WebSocket with user email
            websocketService.connect(user.email);

            // Subscribe to notifications using ref callback
            const unsubscribe = websocketService.onNotification((notification) => {
                handleNewNotificationRef.current?.(notification);
            });
            wsUnsubscribeRef.current = unsubscribe;

            // Fetch initial unread notifications
            fetchUnreadNotifications();
        }

        return () => {
            if (wsUnsubscribeRef.current) {
                wsUnsubscribeRef.current();
                wsUnsubscribeRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, user]);

    // Disconnect WebSocket on logout
    useEffect(() => {
        if (!isAuthenticated) {
            websocketService.disconnect();
            setNotifications([]);
        }
    }, [isAuthenticated]);

    const value: NotificationContextType = {
        notifications,
        loading,
        error,
        unreadCount,
        markingAsRead,
        markingAllAsRead,
        fetchNotifications,
        fetchUnreadNotifications,
        fetchAllNotifications,
        markAsRead,
        markAllAsRead,
        getUnreadNotifications,
        getReadNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within NotificationProvider');
    }
    return context;
};
