import { useState, useEffect } from 'react';
import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const usePushNotifications = () => {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            // Register SW
            navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                    console.log('Service Worker Registered');
                    setRegistration(reg);
                    reg.pushManager.getSubscription().then(sub => {
                        if (sub) {
                            setSubscription(sub);
                            setIsSubscribed(true);
                        }
                    });
                })
                .catch(err => console.error('Service Worker Error', err));
        }
    }, []);

    const subscribeToPush = async () => {
        if (!registration) return;
        try {
            const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedVapidKey
            });

            // Send to backend
            const token = localStorage.getItem('token');
            await axios.post(`${apiBaseUrl}/api/push/subscribe`, sub, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSubscription(sub);
            setIsSubscribed(true);
            console.log('Subscribed to push notifications');
        } catch (error) {
            console.error('Failed to subscribe to push', error);
        }
    };

    const unsubscribeFromPush = async () => {
        if (!subscription) return;
        try {
            await subscription.unsubscribe();
            // Notify backend
            const token = localStorage.getItem('token');
            await axios.post(`${apiBaseUrl}/api/push/unsubscribe`, { endpoint: subscription.endpoint }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setIsSubscribed(false);
            setSubscription(null);
            console.log('Unsubscribed from push notifications');
        } catch (error) {
            console.error('Error unsubscribing', error);
        }
    };

    return { isSubscribed, subscribeToPush, unsubscribeFromPush, subscription };
};
