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

            if (!Capacitor.isNativePlatform()) {
                console.log("Push Notifications not available on web.");
                return;
            }


            try {
                let permStatus = await PushNotifications.checkPermissions();

                if (permStatus.receive === 'prompt') {
                    permStatus = await PushNotifications.requestPermissions();
                }

                if (permStatus.receive !== 'granted') {

                    console.warn('Push notification permission was not granted.');
                    return;
                }

                await PushNotifications.register();

                PushNotifications.addListener('registration', (token: Token) => {
                    console.info('Device registered for notifications. TOKEN:', token.value);
    
                });

                PushNotifications.addListener('registrationError', (err: any) => {
                    console.error('Error in notification registration:', err);
                });

                PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
                    console.log('Push notification received in foreground:', notification);

                });

                PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
                    console.log('Notification action performed:', notification);
                    const data = notification.notification.data;
                    if (data.detailsId) {
                        console.log(`Redirecting to details page: ${data.detailsId}`);
                    }
                });
            } catch (error) {
                console.error("Failed to register for push notifications", error);
            }
        }

        registerAndListen();

        return () => {
            if (Capacitor.isNativePlatform()) {
                PushNotifications.removeAllListeners();
            }
        };

    }, []);

    return null;
};

export default PushNotificationsHandler;
