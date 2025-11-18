import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { useEffect, useState } from "react";
import {
  User,
  Settings,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Award,
  Leaf,
  TrendingUp,
  QrCode,
  ArrowLeft
} from 'lucide-react';

import {
  Configuracion,
  Notificaciones,
  PrivacidadSeguridad,
  AyudaSoporte
} from './ProfileSections';

type Transaction = {
  id: string;
  type: "scan" | "redeem";
  description: string;
  location: string;
  points: number;
  date: string;
};

interface ProfileProps {
  onViewStation?: () => void;
  onLogout?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export function Profile({ onViewStation, onLogout, theme = 'light', onToggleTheme }: ProfileProps) {
  const API_BASE = window.location.hostname === 'localhost' 
    ? '/api' 
    : 'https://ecopoints.hvd.lat/api';
  
  const idusuario = localStorage.getItem("usuario_id");
  const token = localStorage.getItem("token");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const [botellas, setBotellas] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  const obtenerPuntos = async () => {
    if (!idusuario || !token) return;
    
    try {
      const response = await fetch(`${API_BASE}/obtenerPuntos?usuario_id=${idusuario}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setBotellas(Number(data.puntos) || 0);
    } catch (error) {
      setBotellas(0);
    }
  };

  const obtenerHistorial = async () => {
    if (!idusuario || !token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/obtenerHistorial?usuario_id=${idusuario}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const transaccionesAdaptadas: Transaction[] = data
        .filter((item: any) => item.type === "scan")
        .map((item: any) => ({
          id: item.id?.toString() || Math.random().toString(),
          type: "scan",
          description: item.descripcion || "Escaneo QR",
          location: item.ubicacion || "EcoPoints",
          points: item.puntos || 0,
          date: item.fecha || new Date().toISOString()
        }));
      
      setTransactions(transaccionesAdaptadas);
    } catch (error) {
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const obtenerHistorialCanjes = async () => {
    if (!idusuario || !token) return;
    
    try {
      const response = await fetch(`${API_BASE}/obtenerHistorialCanjes?usuario_id=${idusuario}`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          const canjesAdaptados: Transaction[] = data.map((canje: any) => ({
            id: `canje-${canje.id}`,
            type: "redeem",
            description: `Canje: ${canje.nombre_convenio || "Recompensa"}`,
            location: canje.ubicacion || "EcoPoints",
            points: canje.puntos_utilizados || 0,
            date: canje.fecha_canje || new Date().toISOString()
          }));
          
          setTransactions(prev => [...prev, ...canjesAdaptados]);
        }
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      if (idusuario && token) {
        await Promise.all([
          obtenerPuntos(),
          obtenerHistorial(),
          obtenerHistorialCanjes()
        ]);
      } else {
        setIsLoading(false);
        setBotellas(0);
      }
    };

    cargarDatos();
  }, [idusuario, token]);

  const escaneos = transactions.filter(t => t.type === 'scan');
  const totalScans = escaneos.length;

  const niveles = [
    { nivel: 1, escaneosRequeridos: 0, nombre: "Eco Novice" },
    { nivel: 2, escaneosRequeridos: 10, nombre: "Eco Warrior" },
    { nivel: 3, escaneosRequeridos: 50, nombre: "Eco Hero" },
    { nivel: 4, escaneosRequeridos: 100, nombre: "Eco Champion" },
    { nivel: 5, escaneosRequeridos: 500, nombre: "Eco Master" },
    { nivel: 6, escaneosRequeridos: 1000, nombre: "Eco Legend" },
    { nivel: 7, escaneosRequeridos: 5000, nombre: "Eco Guardian" }
  ];

  const calcularNivel = (escaneos: number) => {
    for (let i = niveles.length - 1; i >= 0; i--) {
      if (escaneos >= niveles[i].escaneosRequeridos) {
        return niveles[i];
      }
    }
    return niveles[0];
  };

  const nivelActual = calcularNivel(totalScans);
  const level = nivelActual.nivel;

  const siguienteNivel = niveles.find(n => n.nivel === level + 1);
  const escaneosFaltantes = siguienteNivel
    ? siguienteNivel.escaneosRequeridos - totalScans
    : 0;

  const calcularProgreso = () => {
    if (!siguienteNivel) return 100;

    const nivelAnterior = niveles.find(n => n.nivel === level);
    const escaneosEnEsteNivel = totalScans - (nivelAnterior?.escaneosRequeridos || 0);
    const escaneosNecesariosParaSubir = siguienteNivel.escaneosRequeridos - (nivelAnterior?.escaneosRequeridos || 0);

    return (escaneosEnEsteNivel / escaneosNecesariosParaSubir) * 100;
  };

  const progreso = calcularProgreso();

  const getLevelBadge = () => {
    return `Nivel ${level} - ${nivelActual.nombre}`;
  };

  if (activeSection === "configuracion") {
    return (
      <Configuracion
        onClose={() => setActiveSection(null)}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
    );
  }

  if (activeSection === "notificaciones") {
    return (
      <Notificaciones
        onClose={() => setActiveSection(null)}
      />
    );
  }

  if (activeSection === "privacidad") {
    return (
      <PrivacidadSeguridad
        onClose={() => setActiveSection(null)}
      />
    );
  }

  if (activeSection === "ayuda") {
    return (
      <AyudaSoporte
        onClose={() => setActiveSection(null)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
            <Award className="w-4 h-4 text-yellow-800" />
          </div>
        </div>
        <h1 className="text-gray-900 dark:text-white mb-1">{localStorage.getItem("usuario_nombre")}</h1>
        <p className="text-gray-500 dark:text-gray-400">{localStorage.getItem("usuario_correo")}</p>
        <Badge className="mt-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900 dark:text-emerald-300">
          {getLevelBadge()}
        </Badge>
      </div>

      <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center dark:bg-gray-800">
          <Stat 
            icon={<Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />} 
            label="Puntos" 
            value={botellas !== null ? botellas.toLocaleString() : '...'} 
            type="puntos" 
          />
          <Stat 
            icon={<TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />} 
            label="Escaneos" 
            value={isLoading ? '...' : totalScans.toLocaleString()} 
            type="escaneos"  
          />
          <Stat 
            icon={<Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />} 
            label="Nivel" 
            value={level} 
            type="nivel"  
          />
        </div>
      </Card>

      <Card className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-950 dark:to-blue-950 dark:border-gray-700">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 dark:text-gray-300">Próximo nivel</p>
            <p className="text-gray-900 dark:text-white">
              {isLoading ? '...' :
                siguienteNivel
                  ? `${escaneosFaltantes} escaneo${escaneosFaltantes !== 1 ? 's' : ''} más`
                  : '¡Nivel máximo alcanzado!'}
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>
          {siguienteNivel && (
            <p className="text-sm text-gray-700 dark:text-gray-300 text-center">
              Hacia {siguienteNivel.nombre}
            </p>
          )}
        </div>
      </Card>

      <div className="space-y-2">
        <Separator className="my-2" />

        <MenuButton 
          icon={<QrCode className="w-5 h-5" />} 
          label="Puntos de recolección" 
          onClick={() => setActiveSection("")} 
        />
        <MenuButton 
          icon={<Settings className="w-5 h-5" />} 
          label="Configuración" 
          onClick={() => setActiveSection("configuracion")} 
        />
        <MenuButton 
          icon={<Bell className="w-5 h-5" />} 
          label="Notificaciones" 
          onClick={() => setActiveSection("notificaciones")} 
        />
        <MenuButton 
          icon={<Shield className="w-5 h-5" />} 
          label="Privacidad y seguridad" 
          onClick={() => setActiveSection("privacidad")} 
        />
        <Separator className="my-4" />
        <MenuButton 
          icon={<HelpCircle className="w-5 h-5" />} 
          label="Ayuda y soporte" 
          onClick={() => setActiveSection("ayuda")} 
        />
        <MenuButton 
          icon={<LogOut className="w-5 h-5" />} 
          label="Cerrar sesión" 
          className="text-red-600" 
          onClick={onLogout} 
        />
      </div>

      <div className="text-center pt-4">
        <p className="text-gray-400">EcoPoints v1.0.0</p>
        <p className="text-gray-400">© 2025 EcoPoints. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, type }: { icon: React.ReactNode; label: string; value: any; type: string }) {
  
  const typeColorMap: { [key: string]: string } = {
    'puntos': 'bg-emerald-100 dark:bg-emerald-900',
    'escaneos': 'bg-blue-100 dark:bg-blue-900',
    'nivel': 'bg-purple-100 dark:bg-purple-900',
    'info': 'bg-blue-100 dark:bg-blue-900', 
  };

  const colorClasses = typeColorMap[type] || typeColorMap['info'];
  
  const iconClasses = `w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${colorClasses}`;

  return (
    <div>
      <div className={iconClasses}> 
        {icon}
      </div>
      <p className="text-gray-900 dark:text-white font-semibold">{value}</p>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{label}</p>
    </div>
  );
}

function MenuButton({ icon, label, className = '', onClick }: { icon: React.ReactNode; label: string; className?: string; onClick?: () => void }) {
  return (
    <Button variant="ghost" className={`w-full justify-between hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-white ${className}`} onClick={onClick}>
      <div className="flex items-center gap-3">{icon}<span>{label}</span></div>
      <ChevronRight className="w-5 h-5" />
    </Button>
  );
}