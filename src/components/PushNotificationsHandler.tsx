import { useEffect } from 'react';
import {
    PushNotifications,
    Token,
    PushNotificationSchema,
    ActionPerformed,
} from '@capacitor/push-notifications';

const PushNotificationsHandler = () => {

    useEffect(() => {
        const registerAndListen = async () => {
            // Comprueba si el plugin está disponible
            const isPushNotificationsAvailable = true; // Capacitor.isPluginAvailable('PushNotifications');

            if (!isPushNotificationsAvailable) {
                console.log('Push notifications not available');
                return;
            }

            // 1. Pide permiso al usuario para recibir notificaciones
            let permStatus = await PushNotifications.checkPermissions();

            if (permStatus.receive === 'prompt') {
                permStatus = await PushNotifications.requestPermissions();
            }

            if (permStatus.receive !== 'granted') {
                alert('El permiso para notificaciones no fue concedido.');
                return;
            }

            // 2. Si el permiso es concedido, registra el dispositivo
            await PushNotifications.register();

            // --- LISTOS PARA RECIBIR NOTIFICACIONES ---

            // Se dispara al registrarse exitosamente.
            // Aquí es donde obtienes el "token" del dispositivo.
            PushNotifications.addListener('registration', (token: Token) => {
                console.info('Dispositivo registrado para notificaciones. TOKEN:', token.value);
                // **IMPORTANTE:** En una aplicación real, enviarías este `token.value`
                // a tu servidor (backend) para que sepa a qué dispositivo enviar las notificaciones.
            });

            // Se dispara si hay un error en el registro.
            PushNotifications.addListener('registrationError', (err: any) => {
                console.error('Error en el registro de notificaciones:', err);
            });

            // Se dispara cuando se recibe una notificación y la app está en PRIMER PLANO.
            PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
                console.log('Notificación recibida en primer plano:', notification);
                // Aquí podrías mostrar una alerta o un "toast" dentro de la app.
                alert(`Nuevo Convenio: ${notification.title}\n${notification.body}`);
            });

            // Se dispara cuando el usuario TOCA una notificación (abriendo la app).
            PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
                console.log('Acción de notificación realizada:', notification);
                // Aquí puedes redirigir al usuario a una pantalla específica.
                // Por ejemplo, a la pantalla de "Convenios".
                const data = notification.notification.data;
                if (data.detailsId) {
                    // window.location.href = `/convenios/${data.detailsId}`
                    console.log(`Redirigir a la página del convenio: ${data.detailsId}`);
                }
            });
        }

        registerAndListen();

        // Función de limpieza para remover los listeners cuando el componente se desmonte
        return () => {
            PushNotifications.removeAllListeners();
        };

    }, []);

    return null; // Este componente no renderiza ninguna UI.
};

export default PushNotificationsHandler;
