import { useEffect } from 'react';
import { LocalNotifications } from '@capacitor/local-notifications';

interface Convenio {
  id_convenio: number;
  nombre_convenio: string;
  descripcion: string;
}

const ConveniosNotifier = () => {

  const API_BASE = window.location.hostname === 'localhost'
    ? '/api'
    : 'https://ecopoints.hvd.lat/api';

  const token = localStorage.getItem("token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  const fetchConveniosDisponibles = async (): Promise<Convenio[]> => {
    if (!token) {
      console.log('No hay token, no se pueden buscar convenios.');
      return [];
    }
    try {
      const response = await fetch(`${API_BASE}/obtenerConveniosDisponibles`, {
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        throw new Error(`Error de red: ${response.status}`);
      }
      const data = await response.json();
      return data.convenios || [];
    } catch (error) {
      console.error('Error al obtener convenios de la API:', error);
      return [];
    }
  };

  useEffect(() => {
    const setupNotifications = async () => {
      const permStatus = await LocalNotifications.requestPermissions();
      if (permStatus.display !== 'granted') {
        console.error('Permiso de notificaciones no concedido.');
        return;
      }

      const convenios = await fetchConveniosDisponibles();
      if (convenios.length === 0) {
        console.log('No hay convenios disponibles para notificar.');
        return;
      }

      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        // FIX: Use the correct property 'notifications' instead of 'ids'
        await LocalNotifications.cancel({ notifications: pending.notifications });
        console.log('Canceladas notificaciones pendientes para reprogramar.');
      }

      // --- INICIO DE LA NUEVA LÓGICA ---
      const notificationsToSchedule = [];
      const now = Date.now();
      const minutesBetweenNotifications = 5;
      // Programar para las próximas 2 horas (24 notificaciones * 5 min = 120 min)
      const numberOfRepeats = 24; 

      console.log(`Preparando notificaciones para los próximos ${numberOfRepeats * minutesBetweenNotifications} minutos.`);

      for (let i = 0; i < numberOfRepeats; i++) {
        const scheduleTime = new Date(now + (i + 1) * minutesBetweenNotifications * 60 * 1000);

        for (const convenio of convenios) {
          notificationsToSchedule.push({
            // Crear un ID único para cada notificación programada para evitar colisiones
            id: parseInt(`${convenio.id_convenio}${i}`), 
            title: `¡Convenio disponible! ${convenio.nombre_convenio}`,
            body: convenio.descripcion,
            schedule: {
              at: scheduleTime
            },
            sound: 'default',
            channelId: 'convenios'
          });
        }
      }
      // --- FIN DE LA NUEVA LÓGICA ---

      try {
        await LocalNotifications.schedule({ notifications: notificationsToSchedule });
        console.log(`Programadas ${notificationsToSchedule.length} notificaciones en total.`);
      } catch (e) {
        console.error('Error al programar notificaciones:', e);
      }
    };

    LocalNotifications.createChannel({
      id: 'convenios',
      name: 'Convenios Disponibles',
      description: 'Notificaciones sobre convenios y promociones',
      importance: 4, // Aumentar importancia para que aparezcan
      visibility: 1,
    }).then(() => {
      if (localStorage.getItem("usuario_id")) {
        setupNotifications();
      }
    });

  }, []);

  return null;
};

export default ConveniosNotifier;
