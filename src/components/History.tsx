import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Gift, Leaf } from "lucide-react";
import { motion } from "framer-motion";

type Transaction = {
  id: string;
  type: "scan" | "redeem";
  description: string;
  location: string;
  points: number;
  date: string;
};

export function History() {
  const API_URL = "https://ecopoints.hvd.lat/api";
  const usuarioId = localStorage.getItem("usuario_id");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuarioId) return;

    const obtenerHistorial = async () => {
      try {
        const response = await fetch(`${API_URL}/obtenerHistorial?usuario_id=${usuarioId}`);
        if (!response.ok) throw new Error("Error al obtener historial");
        const data: Transaction[] = await response.json();
        setTransactions(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    obtenerHistorial();
  }, [usuarioId]);

  if (loading) {
    return <div className="text-center text-gray-500 mt-10">Cargando historial...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Historial de actividad</h1>
      {transactions.length === 0 ? (
        <p className="text-gray-500">No hay actividades registradas aún.</p>
      ) : (
        transactions.map((transaction) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === "scan" ? "bg-emerald-100" : "bg-orange-100"
                  }`}
                >
                  {transaction.type === "scan" ? (
                    <Leaf className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Gift className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <p className="text-gray-900">{transaction.description}</p>
                  <p className="text-gray-500 text-sm">{transaction.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p
                  className={`${
                    transaction.type === "scan" ? "text-emerald-600" : "text-orange-600"
                  }`}
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
            </Card>
          </motion.div>
        ))
      )}
    </div>
  );
}