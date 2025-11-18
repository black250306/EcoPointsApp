import { useEffect, useState } from "react";
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowUpRight, Gift, Leaf } from 'lucide-react';
import { motion } from 'framer-motion';

interface HomeProps {
  onNavigateToRewards: () => void;
}

interface Transaction {
  id: number;
  type: "scan" | "redeem";
  description: string;
  location: string;
  points: number;
  date: string;
  extra?: {
    codigo_qr: string;
  };
}

interface PuntosResponse {
  puntos: number;
}

export function Home({ onNavigateToRewards }: HomeProps) {
  const API_BASE = window.location.hostname === 'localhost' 
    ? '/api' 
    : 'https://ecopoints.hvd.lat/api';
  
  const idusuario = localStorage.getItem("usuario_id");
  const token = localStorage.getItem("token");
  const [botellas, setBotellas] = useState(0);
  const [mostrarTodo, setMostrarTodo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

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
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data: PuntosResponse = await response.json();
      setBotellas(data.puntos || 0);
    } catch (error) {
      console.error("Error al obtener puntos:", error);
    }
  };

  const obtenerHistorial = async () => {
    if (!idusuario || !token) return;

    try {
      const response = await fetch(`${API_BASE}/obtenerHistorial?usuario_id=${idusuario}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data: Transaction[] = await response.json();
      // Ordenar por fecha (más reciente primero)
      const transaccionesOrdenadas = data.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setRecentTransactions(transaccionesOrdenadas);
    } catch (error) {
      console.error("Error al obtener historial:", error);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        await Promise.all([
          obtenerPuntos(),
          obtenerHistorial()
        ]);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (idusuario && token) {
      cargarDatos();
    } else {
      setLoading(false);
    }
  }, [idusuario, token]);

  // Mostrar solo las primeras 4 si no se ha activado "ver todo"
  const transaccionesAMostrar = mostrarTodo
    ? recentTransactions
    : recentTransactions.slice(0, 4);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Hola,</p>
          <h1 className="text-gray-900 dark:text-white">
            {localStorage.getItem("usuario_nombre")}
          </h1>
        </div>
        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
          <Leaf className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Balance */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-6 border-0">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              <span className="text-emerald-100">Balance disponible</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-baseline gap-1">
                {botellas
                  ? (
                    <>
                      <span className="text-4xl font-semibold">{botellas.toLocaleString()}</span>
                      <span className="text-xl text-emerald-100">ecopoints</span>
                    </>
                  )
                  : (
                    <span className="text-sm text-emerald-100 italic">Cargando...</span>
                  )
                }
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                className="flex-1 bg-white text-emerald-600 hover:bg-emerald-50"
                onClick={onNavigateToRewards}
              >
                <Gift className="w-4 h-4 mr-2" />
                Canjear
              </Button>
              <Button
                className="flex-1 bg-emerald-600 border border-white/30 text-white hover:bg-emerald-800"
                onClick={onNavigateToRewards}
              >
                Ver premios
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 dark:text-white">Actividad reciente</h2>
          <button
            onClick={() => setMostrarTodo(!mostrarTodo)}
            className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1"
          >
            {mostrarTodo ? "Ver menos" : "Ver todo"}
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Lista con scroll si muestra todas */}
        <div className={`space-y-3 ${mostrarTodo ? 'max-h-[400px] overflow-y-auto pr-2' : ''}`}>
          {transaccionesAMostrar.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900 ${transaction.type === "scan" ? "bg-emerald-100" : "bg-orange-100"
                        }`}
                    >
                      {transaction.type === "scan" ? (
                        <Leaf className="lucide lucide-leaf w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Gift className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white">{transaction.description}</p>
                      <p className="text-gray-500 text-sm dark:text-gray-400">{transaction.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`${transaction.type === "scan"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-orange-600"
                        } font-semibold`}
                    >
                      {transaction.type === "scan" ? "+" : "-"}
                      {transaction.points}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {new Date(transaction.date.replace(" ", "T")).toLocaleDateString("es-PE", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
} 