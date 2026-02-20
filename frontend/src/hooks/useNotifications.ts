import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
    id: string;
    title: string;
    body: string;
    type: 'info' | 'warning' | 'success' | 'error' | 'promotion';
    is_read: boolean;
    created_at: string;
    data?: any;
}

export const useNotifications = () => {
    const { token } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const fetchNotifications = useCallback(async (limit = 50, offset = 0) => {
        if (!token) return;
        setLoading(true);
        try {
            const response = await api.get(`/notifications?limit=${limit}&offset=${offset}`);
            setNotifications(response.data.notifications);
            setUnreadCount(response.data.unreadCount);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching notifications:', err);
            setError(err.message || 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, [token]);

    const markAsRead = async (id: string) => {
        if (!token) return;
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        if (!token) return;
        try {
            await api.put(`/notifications/read-all`);
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
        }
    };

    // Initial fetch
    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token, fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    };
};
