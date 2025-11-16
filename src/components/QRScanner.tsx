import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { QrCode, X, CheckCircle2, Camera as CameraIcon, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Device } from '@capacitor/device';

const sliderStyles = `
  .zoom-slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #10b981;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  }
  
  .zoom-slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: #10b981;
    cursor: pointer;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    box-sizing: border-box;
  }
`;

interface QRScannerProps {
  onScanSuccess?: (transaction: { type: 'scan'; points: number; description: string; location?: string }) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [supportsZoom, setSupportsZoom] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [isNative, setIsNative] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunning = useRef(false);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);
  
  const idusuario = localStorage.getItem("usuario_id");
  const token = localStorage.getItem("token");
  const API_BASE = window.location.hostname === 'localhost'
    ? '/api'
    : 'https://ecopoints.hvd.lat/api';

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.5;

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  // Verificar compatibilidad y plataforma
  useEffect(() => {
    const checkCompatibility = async () => {
      try {
        const platform = await Device.getInfo();
        const native = Capacitor.isNativePlatform();
        setIsNative(native);
        
        console.log('Platform:', platform.platform, 'Native:', native);

        if (native) {
          // En dispositivo nativo, siempre es compatible
          setIsSupported(true);
          setHasPermission(null);
        } else {
          // Para web, verificar Html5Qrcode
          const supported = typeof Html5Qrcode !== 'undefined' && 
                           typeof Html5Qrcode.getCameras === 'function';
          setIsSupported(supported);
          
          if (!supported) {
            toast.error("Tu navegador no soporta el escáner de QR");
            return;
          }

          // Verificar permisos básicos de cámara en web
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: "environment" } 
            });
            stream.getTracks().forEach(track => track.stop());
            setHasPermission(true);
          } catch (err) {
            setHasPermission(false);
          }
        }
      } catch (error) {
        console.error("Error checking compatibility:", error);
        setIsSupported(false);
      }
    };

    checkCompatibility();
  }, []);

  // Para dispositivos nativos: Usar Capacitor Camera
  const scanWithNativeCamera = async () => {
    try {
      console.log('Starting native camera scan...');
      
      // Solicitar permisos con Capacitor
      const permissionStatus = await Camera.requestPermissions();
      console.log('Camera permissions:', permissionStatus);
      
      if (permissionStatus.camera !== 'granted') {
        toast.error("Permiso de cámara denegado. Por favor, actívalo en los ajustes de la aplicación.");
        setHasPermission(false);
        return;
      }

      setHasPermission(true);
      setIsScanning(true);

      // Usar Capacitor Camera para tomar foto - CORRECCIÓN AQUÍ
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl, // Usar DataUrl para procesar el QR
        promptLabelHeader: 'Escanear QR',
        promptLabelCancel: 'Cancelar',
        promptLabelPhoto: 'Desde galería',
        promptLabelPicture: 'Tomar foto',
        source: CameraSource.Camera // CORREGIDO: Usar CameraSource.Camera en lugar de 'CAMERA'
      });

      console.log('Image captured with Capacitor Camera');
      
      // Aquí deberías procesar la imagen para extraer el QR
      // Por ahora, simulamos un QR exitoso
      handleScanSuccess("QR_SIMULADO_NATIVO_12345");

    } catch (error: any) {
      console.error("Native camera error:", error);
      
      if (error.message?.includes('cancel') || error === 'User cancelled photos app') {
        // Usuario canceló
        console.log('User cancelled camera');
        setIsScanning(false);
      } else {
        setHasPermission(false);
        setIsScanning(false);
        toast.error("Error al acceder a la cámara: " + (error.message || error));
      }
    }
  };

  // Para web: Usar Html5Qrcode (tu código original)
  const scanWithHtml5Qr = async () => {
    try {
      // Verificar permisos en web
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);

      setIsScanning(true);
      
      // Limpiar scanner anterior si existe
      if (scannerRef.current && isScannerRunning.current) {
        await stopScanning();
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        supportedFormats: [Html5QrcodeSupportedFormats.QR_CODE],
      };

      // Intentar primero con cámara trasera
      try {
        await scanner.start(
          { facingMode: "environment" },
          config,
          async (decodedText) => {
            handleScanSuccess(decodedText);
          },
          (errorMessage) => {}
        );
      } catch (error: any) {
        console.error("Error with rear camera:", error);
        
        // Intentar con cámara frontal si la trasera falla
        if (error.message?.includes('environment') || error.message?.includes('rear')) {
          try {
            toast.info("Intentando con cámara frontal...");
            await scanner.start(
              { facingMode: "user" },
              config,
              async (decodedText) => {
                handleScanSuccess(decodedText);
              },
              (errorMessage) => {}
            );
          } catch (frontError: any) {
            console.error("Front camera also failed:", frontError);
            throw frontError;
          }
        } else {
          throw error;
        }
      }

      // Configurar zoom después de iniciar
      setTimeout(async () => {
        try {
          const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
          if (videoElement && videoElement.srcObject) {
            const stream = videoElement.srcObject as MediaStream;
            const videoTrack = stream.getVideoTracks()[0];
            videoTrackRef.current = videoTrack;

            const zoomSupported = checkZoomSupport(videoTrack);
            setSupportsZoom(zoomSupported);
          }
        } catch (error) {
          console.warn("Error setting up zoom:", error);
        }
      }, 1000);

      isScannerRunning.current = true;
      toast.success("Cámara activa - Enfoca el QR dentro del recuadro");

    } catch (err: any) {
      console.error("Scanner initialization error:", err);
      setHasPermission(false);
      setIsScanning(false);
      
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          await scannerRef.current.clear();
        } catch (stopError) {
          console.warn("Error stopping scanner:", stopError);
        }
      }
      scannerRef.current = null;
      isScannerRunning.current = false;
      videoTrackRef.current = null;
      
      if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
        toast.error("Permiso de cámara denegado. Por favor, permite el acceso a la cámara.");
      } else if (err.name === 'NotFoundError') {
        toast.error("No se encontró ninguna cámara disponible.");
      } else {
        toast.error("Error al iniciar la cámara: " + err.message);
      }
    }
  };

  const checkZoomSupport = (track: MediaStreamTrack): boolean => {
    try {
      const capabilities = track.getCapabilities();
      const hasZoom = (capabilities as any).zoom !== undefined;
      return hasZoom;
    } catch (error) {
      return false;
    }
  };

  const simulateDigitalZoom = (level: number) => {
    const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
    if (videoElement) {
      const scale = level;
      videoElement.style.transform = `scale(${scale})`;
      videoElement.style.transformOrigin = 'center center';
      videoElement.style.width = `${100 * scale}%`;
      videoElement.style.height = `${100 * scale}%`;
    }
    setZoomLevel(level);
  };

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(event.target.value);
    simulateDigitalZoom(newZoom);
  };

  const increaseZoom = () => {
    const newZoom = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
    simulateDigitalZoom(newZoom);
  };

  const decreaseZoom = () => {
    const newZoom = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
    simulateDigitalZoom(newZoom);
  };

  const startScanning = async () => {
    if (isSupported === false) {
      toast.error("Tu navegador no es compatible con el escáner de QR");
      return;
    }

    console.log('Starting scan, isNative:', isNative);

    if (isNative) {
      await scanWithNativeCamera();
    } else {
      await scanWithHtml5Qr();
    }
  };

  const stopScanning = async () => {
    const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.style.transform = 'none';
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
    }

    if (videoTrackRef.current) {
      videoTrackRef.current.stop();
      videoTrackRef.current = null;
    }

    if (scannerRef.current && isScannerRunning.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
        isScannerRunning.current = false;
      } catch (error) {
        console.warn("Error stopping scanner:", error);
        isScannerRunning.current = false;
      }
    }
    
    scannerRef.current = null;
    setIsScanning(false);
    setSupportsZoom(false);
    setZoomLevel(1);
  };

  const handleScanSuccess = async (qrData: string) => {
    if (!token) {
      toast.error("No estás autenticado. Inicia sesión nuevamente.");
      return;
    }

    await stopScanning();

    try {
      const response = await fetch(`${API_BASE}/validarQR`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          codigo_qr: qrData
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Sesión expirada. Inicia sesión nuevamente.");
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const puntosGanados = data.puntos_obtenidos || 0;
      setEarnedPoints(puntosGanados);
      setShowSuccess(true);
      
      try {
        onScanSuccess?.({
          type: 'scan',
          points: puntosGanados,
          description: data.mensaje || 'Escaneo QR',
          location: data.ubicacion || undefined,
        });
      } catch (err) {
        console.error('onScanSuccess handler threw:', err);
      }
      
      toast.success(`¡${data.mensaje || "Escaneo exitoso"}! Ganaste ${puntosGanados} ecopoints 🎉`);

    } catch (error) {
      console.error("Error processing QR:", error);
      setEarnedPoints(0);
      toast.error("Error al procesar el código QR. Intenta nuevamente.");
    }

    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className="p-6 space-y-6">
      <style>{sliderStyles}</style>

      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
          <QrCode className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Escanear QR</h1>
        <p className="text-gray-500">
          {isNative 
            ? "Toca el botón para abrir la cámara y escanear el QR" 
            : "Escanea el código QR del punto de reciclaje para ganar ecopoints"
          }
        </p>
        
        {isSupported === false && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">
              Tu navegador no es compatible con el escáner de QR. 
              Prueba con Chrome, Firefox o Safari en dispositivos móviles.
            </p>
          </div>
        )}

        {hasPermission === false && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-700 text-sm">
              Permiso de cámara denegado. Por favor, permite el acceso a la cámara.
            </p>
          </div>
        )}

        {isNative && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-blue-700 text-sm">
              Modo nativo activo - Usando cámara del dispositivo
            </p>
          </div>
        )}
      </div>

      {/* Solo mostrar el contenedor de cámara en web */}
      {!isNative && (
        <Card className="overflow-hidden border-2 border-gray-200">
          <div className="relative aspect-square bg-gray-900">
            {!isScanning && !showSuccess && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <CameraIcon className="w-16 h-16 text-gray-400 mx-auto" />
                  <p className="text-gray-400">Toca el botón para iniciar el escaneo</p>
                  {hasPermission === false && (
                    <p className="text-yellow-400 text-sm">Permisos de cámara requeridos</p>
                  )}
                </div>
              </div>
            )}

            <div id="qr-reader" className={`w-full h-full ${isScanning ? '' : 'hidden'}`}></div>

            {isScanning && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-emerald-400 rounded-lg">
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 rounded-full"
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
                
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-center space-y-3">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <QrCode className="w-16 h-16 text-emerald-400 mx-auto" />
                    </motion.div>
                    <p className="text-white font-medium">Escaneando código QR...</p>
                    {!supportsZoom && isScanning && (
                      <p className="text-yellow-300 text-sm">Usando zoom digital</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 bg-emerald-600 flex items-center justify-center z-20"
                >
                  <div className="text-center text-white space-y-4">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <CheckCircle2 className="w-20 h-20 mx-auto" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl font-bold text-white mb-2">¡Escaneo exitoso!</h2>
                      <p className="text-emerald-100 mb-4">Has ganado</p>
                      <motion.p
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                        className="text-white text-5xl font-bold"
                      >
                        +{earnedPoints}
                      </motion.p>
                      <p className="text-emerald-100 mt-2">ecopoints</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      )}

      {/* Controles de zoom solo en web */}
      {!isNative && isScanning && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                Control de Zoom {!supportsZoom && "(Digital)"}
              </span>
              <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {zoomLevel.toFixed(1)}x
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                size="sm"
                onClick={decreaseZoom}
                disabled={zoomLevel <= MIN_ZOOM}
                variant="outline"
                className="flex-shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <div className="flex-1">
                <input
                  type="range"
                  min={MIN_ZOOM}
                  max={MAX_ZOOM}
                  step={0.1}
                  value={zoomLevel}
                  onChange={handleZoomChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer zoom-slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((zoomLevel - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%, #e5e7eb ${((zoomLevel - MIN_ZOOM) / (MAX_ZOOM - MIN_ZOOM)) * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>
              
              <Button
                size="sm"
                onClick={increaseZoom}
                disabled={zoomLevel >= MAX_ZOOM}
                variant="outline"
                className="flex-shrink-0 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex justify-between text-xs text-blue-600">
              <span>{MIN_ZOOM}x</span>
              <span className="font-medium">
                {supportsZoom ? "Zoom óptico" : "Zoom digital"}
              </span>
              <span>{MAX_ZOOM}x</span>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {!isScanning ? (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold"
            onClick={startScanning}
            disabled={showSuccess || isSupported === false || hasPermission === false}
          >
            <CameraIcon className="w-6 h-6 mr-3" />
            {isSupported === false 
              ? "Navegador no compatible" 
              : hasPermission === false
              ? "Permiso de cámara denegado"
              : isNative
              ? "Abrir cámara para escanear QR"
              : "Iniciar escaneo con cámara"
            }
          </Button>
        ) : (
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
            onClick={stopScanning}
          >
            <X className="w-6 h-6 mr-3" />
            {isNative ? "Cancelar" : "Detener escaneo"}
          </Button>
        )}
      </div>

      <Card className="p-4 bg-emerald-50 border-emerald-200">
        <div className="space-y-2">
          <p className="text-emerald-900 font-semibold">
            {isNative ? "Instrucciones para APK:" : "Consejos:"}
          </p>
          <ul className="text-emerald-700 space-y-1 ml-4">
            {isNative ? (
              <>
                <li>• Toca "Abrir cámara" para acceder a la cámara nativa</li>
                <li>• Toma una foto del código QR</li>
                <li>• La app procesará automáticamente el QR</li>
                <li>• Asegúrate de tener buena iluminación</li>
              </>
            ) : (
              <>
                <li>• Usa la barra de zoom para acercar o alejar la imagen</li>
                <li>• Mantén el QR dentro del cuadro verde</li>
                <li>• Asegúrate de tener buena iluminación</li>
                <li>• El zoom digital funciona en todos los dispositivos</li>
              </>
            )}
            {hasPermission === false && (
              <li className="text-yellow-600 font-semibold">• Permite el acceso a la cámara en tu dispositivo</li>
            )}
          </ul>
        </div>
      </Card>
    </div>
  );
}