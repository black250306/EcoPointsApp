import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Gift, Leaf, Sparkles, Tag, CheckCircle2, Package } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export interface Reward {
  id: string;
  name: string;
  brand: string;
  description: string;
  points: number;
  category: 'restaurant' | 'cafe' | 'retail' | 'entertainment' | string;
  image: string;
  validity?: string;
  codigo_entrega?: string;
  stock: number;
}

interface RewardsProps {
  balance: number;
  onRedeem: (reward: Reward) => void;
}

interface CanjeResponse {
  mensaje: string;
  codigo_entrega: string;
  puntos_restantes: number;
  error?: string;
}

export function Rewards({ onRedeem }: RewardsProps) {
  const API_BASE = window.location.hostname === 'localhost'
    ? '/api'
    : 'https://ecopoints.hvd.lat/api';

  const idusuario = localStorage.getItem("usuario_id");
  const token = localStorage.getItem("token");

  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loadingRewards, setLoadingRewards] = useState(true);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [redeemedReward, setRedeemedReward] = useState<Reward | null>(null);
  const [botellas, setBotellas] = useState(0);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  const mapCategory = (empresa: string): string => {
    if (!empresa) return 'other';

    const empresaLower = empresa.toLowerCase();

    if (empresaLower.includes('bembos') ||
      empresaLower.includes('mcdonald') ||
      empresaLower.includes('burger') ||
      empresaLower.includes('kfc') ||
      empresaLower.includes('pizza') ||
      empresaLower.includes('restaurant') ||
      empresaLower.includes('comida') ||
      empresaLower.includes('hamburguesa') ||
      empresaLower.includes('combo')) {
      return 'restaurant';
    }

    if (empresaLower.includes('café') ||
      empresaLower.includes('cafe') ||
      empresaLower.includes('starbucks') ||
      empresaLower.includes('coffee') ||
      empresaLower.includes('barista') ||
      empresaLower.includes('tostado')) {
      return 'cafe';
    }

    if (empresaLower.includes('retail') ||
      empresaLower.includes('tienda') ||
      empresaLower.includes('super') ||
      empresaLower.includes('market') ||
      empresaLower.includes('ropa') ||
      empresaLower.includes('zara') ||
      empresaLower.includes('h&m') ||
      empresaLower.includes('moda') ||
      empresaLower.includes('store')) {
      return 'retail';
    }

    if (empresaLower.includes('cine') ||
      empresaLower.includes('movie') ||
      empresaLower.includes('teatro') ||
      empresaLower.includes('entertainment') ||
      empresaLower.includes('diversion') ||
      empresaLower.includes('pelicula')) {
      return 'entertainment';
    }

    return 'other';
  };

  const listarConvenios = async () => {
    setLoadingRewards(true);
    try {
      const response = await fetch(`${API_BASE}/listarConvenios`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesión expirada. Inicia sesión nuevamente.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const mappedRewards: Reward[] = data.map((item: any) => ({
        id: item.id.toString(),
        name: item.titulo || item.nombre || 'Convenio sin título',
        brand: item.empresa || 'Empresa no especificada',
        description: item.descripcion || 'Sin descripción',
        points: parseInt(item.puntos_requeridos) || 0,
        category: mapCategory(item.empresa),
        image: item.imagen_url || item.logo_url || 'https://images.unsplash.com/photo-1542831371-29b0f74f9d13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdG9jayUyMG1lYWx8ZW58MXx8fHwxNzYzMTk2NzU5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        validity: item.vigencia || "30 días",
        stock: parseInt(item.stock) || 0,
      }));

      setRewards(mappedRewards);
    } catch (error) {
      toast.error('No se pudieron cargar los premios.');
      setRewards([]);
    } finally {
      setLoadingRewards(false);
    }
  };

  const obtenerPuntos = async () => {
    if (!idusuario || !token) return;

    try {
      const response = await fetch(`${API_BASE}/obtenerPuntos?usuario_id=${idusuario}`, {
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesión expirada. Inicia sesión nuevamente.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBotellas(data.puntos || 0);
    } catch (error) {
      setBotellas(0);
    }
  };

  const canjearPuntos = async (reward: Reward) => {
    if (!idusuario || !token) {
      toast.error("Error: Sesión de usuario no encontrada.");
      return;
    }

    setSelectedReward(null);

    try {
      const response = await fetch(`${API_BASE}/canjearPuntos`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          usuario_id: parseInt(idusuario),
          convenio_id: parseInt(reward.id)
        }),
      });

      const data: CanjeResponse = await response.json();

      if (!response.ok || data.error) {
        if (data.error && data.error.includes('puntos insuficientes')) {
          throw new Error('No tienes suficientes puntos para este canje.');
        } else if (data.error && data.error.includes('stock')) {
          throw new Error('Este premio ya no está disponible.');
        } else {
          throw new Error(data.error || 'Error al procesar el canje.');
        }
      }

      if (data.mensaje && (data.mensaje.includes('éxito') || data.mensaje.includes('exito'))) {
        onRedeem(reward);

        setRedeemedReward({
          ...reward,
          codigo_entrega: data.codigo_entrega,
        });

        setShowSuccess(true);

        if (data.puntos_restantes !== undefined) {
          setBotellas(data.puntos_restantes);
        } else {
          await obtenerPuntos();
        }

        await listarConvenios();

        toast.success(data.mensaje || '¡Canje realizado exitosamente!');

        setTimeout(() => {
          setShowSuccess(false);
          setRedeemedReward(null);
        }, 15000);

      } else {
        throw new Error(data.mensaje || 'Error desconocido al procesar el canje.');
      }

    } catch (error: any) {
      toast.error(error.message || 'Error de conexión. Inténtalo más tarde.');
    }
  };

  useEffect(() => {
    listarConvenios();
    if (idusuario && token) {
      obtenerPuntos();
    }
  }, [idusuario, token]);

  const handleRedeemClick = (reward: Reward) => {
    const currentPoints = botellas || 0;
    const hasStock = reward.stock > 0;

    if (currentPoints >= reward.points && hasStock) {
      setSelectedReward(reward);
    } else if (!hasStock) {
      toast.error('Este premio ya no está disponible.');
    } else {
      toast.error('No tienes suficientes ecopoints');
    }
  };

  const confirmRedeem = () => {
    if (selectedReward) {
      canjearPuntos(selectedReward);
    }
  };

  const filterRewardsByCategory = (category?: string) => {
    if (!category || category === 'all') return rewards;
    return rewards.filter(r => r.category.toLowerCase() === category.toLowerCase());
  };

  const RewardCard = ({ reward }: { reward: Reward }) => {
    const currentPoints = botellas || 0;
    const canAfford = currentPoints >= reward.points;
    const hasStock = reward.stock > 0;
    const canRedeem = canAfford && hasStock;

    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <div className="aspect-video bg-gray-200 overflow-hidden">
            <ImageWithFallback
              src={reward.image}
              alt={reward.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="absolute top-2 left-2">
            {hasStock ? (
              <Badge className="bg-green-500 text-white flex items-center gap-1">
                <Package className="w-3 h-3" />
                Stock: {reward.stock}
              </Badge>
            ) : (
              <Badge className="bg-red-500 text-white flex items-center gap-1">
                <Package className="w-3 h-3" />
                Sin stock
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-500 dark:text-white">{reward.brand}</span>
            </div>
            <h3 className="text-gray-900 dark:text-blue-700">{reward.name}</h3>
            <p className="text-gray-500 line-clamp-2">{reward.description}</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <Leaf className="w-4 h-4 text-emerald-600" />
              <span className="text-gray-900 dark:text-white">{reward.points}</span>
              <span className="text-gray-500 dark:text-gray-400">pts</span>
            </div>

            <Button
              size="sm"
              onClick={() => handleRedeemClick(reward)}
              disabled={!canRedeem}
              className={
                canRedeem ? 'bg-emerald-600 hover:bg-emerald-700' :
                  !hasStock ? 'bg-gray-400 cursor-not-allowed' :
                    'bg-amber-500 hover:bg-amber-600'
              }
            >
              {canRedeem ? 'Canjear' :
                !hasStock ? 'Sin stock' :
                  'Insuficiente'}
            </Button>
          </div>

          {reward.validity && (
            <p className="text-gray-400">Válido por {reward.validity}</p>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6 pb-24">
      <div>
        <h1 className="text-gray-900 mb-2 dark:text-white">Premios</h1>
        <p className="text-black dark:text-white/80">
          Canjea tus ecopoints por premios increíbles
        </p>
      </div>

      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 mb-1">Tus ecopoints</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold">{botellas.toLocaleString()}</span>
              <span className="text-emerald-100">puntos</span>
            </div>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <Gift className="w-8 h-8" />
          </div>
        </div>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="restaurant">Comida</TabsTrigger>
          <TabsTrigger value="cafe">Café</TabsTrigger>
          <TabsTrigger value="retail">Retail</TabsTrigger>
        </TabsList>

        {loadingRewards ? (
          <div className="text-center p-8 text-gray-500 italic">Cargando premios...</div>
        ) : rewards.length === 0 ? (
          <div className="text-center p-8 text-gray-500 italic">No se encontraron premios disponibles.</div>
        ) : (
          <>
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {filterRewardsByCategory('all').map(reward => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="restaurant" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {filterRewardsByCategory('restaurant').map(reward => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="cafe" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {filterRewardsByCategory('cafe').map(reward => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="retail" className="mt-6">
              <div className="grid grid-cols-1 gap-4">
                {filterRewardsByCategory('retail').map(reward => (
                  <RewardCard key={reward.id} reward={reward} />
                ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      <Dialog open={!!selectedReward} onOpenChange={(open: boolean) => !open && setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar canje</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de canjear tus ecopoints por este premio?
            </DialogDescription>
          </DialogHeader>

          {selectedReward && (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <ImageWithFallback
                  src={selectedReward.image}
                  alt={selectedReward.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-gray-500">{selectedReward.brand}</p>
                <h3 className="text-gray-900">{selectedReward.name}</h3>
                <p className="text-gray-600 mt-2">{selectedReward.description}</p>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Stock disponible:
                </span>
                <Badge className={selectedReward.stock > 0 ? 'bg-green-500' : 'bg-red-500'}>
                  {selectedReward.stock > 0 ? `${selectedReward.stock} unidades` : 'Sin stock'}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Costo:</span>
                <div className="flex items-center gap-1">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <span className="text-gray-900">{selectedReward.points} puntos</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
                <span className="text-gray-700">Tu saldo después:</span>
                <span className="text-gray-900">{(botellas || 0) - selectedReward.points} puntos</span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReward(null)}>
              Cancelar
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={confirmRedeem}
              disabled={selectedReward?.stock === 0}
            >
              {selectedReward?.stock === 0 ? 'Sin stock' : 'Confirmar canje'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Canje Exitoso</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mx-auto"
            >
              <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            </motion.div>
            <div>
              <h2 className="text-gray-900 mb-2">¡Canje exitoso!</h2>
              <p className="text-gray-600">
                Has canjeado {redeemedReward?.points} ecopoints
              </p>
            </div>
            {redeemedReward && (
              <Card className="p-4 bg-emerald-50 border border-emerald-200">
                <p className="text-emerald-900 font-semibold mb-1">
                  {redeemedReward.brand} - {redeemedReward.name}
                </p>

                {redeemedReward.codigo_entrega && (
                  <div className="bg-white p-3 rounded-lg mt-2 shadow-inner border border-gray-100">
                    <p className="text-sm text-gray-500 mb-2">Tu código de canje:</p>
                    <p className="text-xl font-mono text-emerald-700 break-words font-bold bg-gray-50 p-2 rounded border">
                      {redeemedReward.codigo_entrega}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                      onClick={() => {
                        navigator.clipboard.writeText(redeemedReward.codigo_entrega || '');
                        toast.success('Código copiado al portapapeles');
                      }}
                    >
                      📋 Copiar código
                    </Button>
                  </div>
                )}

                <p className="text-emerald-700 mt-3 text-sm">
                  ✅ Presenta este código en el establecimiento para reclamar tu premio
                </p>
              </Card>
            )}
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setShowSuccess(false)}
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}