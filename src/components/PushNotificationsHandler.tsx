import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import {
    PushNotifications,
    Token,
    PushNotificationSchema,
    ActionPerformed,
} from '@capacitor/push-notifications';

const PushNotificationsHandler = () => {

    useEffect(() => {
        const registerAndListen = async () => {
            // --- FIX: Only run on native platforms ---
            if (!Capacitor.isNativePlatform()) {
                console.log("Push Notifications not available on web.");
                return;
            }

            // 1. Pide permiso al usuario para recibir notificaciones
            try {
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === 'prompt') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== 'granted') {
                    // It's better not to alert here, as it can be intrusive.
                    // Console logging is a safer alternative.
                    console.warn('Push notification permission was not granted.');
                    return;
                }

                // 2. Si el permiso es concedido, registra el dispositivo
                await PushNotifications.register();

                // --- LISTOS PARA RECIBIR NOTIFICACIONES ---

                PushNotifications.addListener('registration', (token: Token) => {
                    console.info('Device registered for notifications. TOKEN:', token.value);
                    // Here you would send this token to your backend server.
                });

                PushNotifications.addListener('registrationError', (err: any) => {
                    console.error('Error in notification registration:', err);
                });

                PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
                    console.log('Push notification received in foreground:', notification);
                    // Optionally, display a toast or an in-app message.
                    // alert(`Nuevo Convenio: ${notification.title}\n${notification.body}`);
                });

                PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
                    console.log('Notification action performed:', notification);
                    // Here you can redirect the user to a specific screen.
                    const data = notification.notification.data;
                    if (data.detailsId) {
                        console.log(`Redirecting to details page: ${data.detailsId}`);
                        // Example: window.location.href = `/convenios/${data.detailsId}`
                    }
                });
            } catch (error) {
                console.error("Failed to register for push notifications", error);
            }
        }

        registerAndListen();

        // Cleanup function to remove listeners
        return () => {
            if (Capacitor.isNativePlatform()) {
                PushNotifications.removeAllListeners();
            }
        };

    }, []);

    return null; // This component does not render any UI.
};

export default PushNotificationsHandler;
