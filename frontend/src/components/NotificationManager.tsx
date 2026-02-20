import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { useAuth } from '../contexts/AuthContext';

interface Notification {
    id: string;
    title: string;
    body: string;
    type?: string;
}

const NotificationManager: React.FC = () => {
    const { user } = useAuth();
    const { socket } = useSocket();
    const { subscribeToPush, isSubscribed, subscription } = usePushNotifications();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (data: any) => {
            console.log('Real-time notification received:', data);
            const newNotification = {
                id: Date.now().toString(),
                title: data.title || 'New Notification',
                body: data.body || '',
                type: data.type
            };
            setNotifications(prev => [...prev, newNotification]);

            // Auto dismiss after 5 seconds
            setTimeout(() => {
                removeNotification(newNotification.id);
            }, 5000);
        };

        socket.on('notification', handleNotification);
        socket.on('event', handleNotification); // Listen to generic events too

        return () => {
            socket.off('notification', handleNotification);
            socket.off('event', handleNotification);
        };
    }, [socket]);

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Auto-subscribe or prompt if user is logged in
    useEffect(() => {
        if (user && !isSubscribed && 'Notification' in window) {
            if (Notification.permission === 'default') {
                // We could prompt here, but it's better to let user click a button
                // But for "WOW" factor, maybe show a custom prompt?
            }
        }
    }, [user, isSubscribed]);

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {notifications.map(notification => (
                    <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: 50, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.9 }}
                        className="bg-white/90 backdrop-blur-md dark:bg-gray-800/90 shadow-lg rounded-lg p-4 w-80 border-l-4 border-indigo-500 pointer-events-auto flex items-start gap-3"
                    >
                        <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded-full shrink-0">
                            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{notification.title}</h4>
                            <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">{notification.body}</p>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default NotificationManager;
