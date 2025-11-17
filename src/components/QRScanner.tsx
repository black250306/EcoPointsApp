import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { Camera } from '@capacitor/camera';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { QrCode, X, CheckCircle2, Camera as CameraIcon, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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

  .zoom-slider::-webkit-slider-track {
    background: #4b5563;
    height: 8px;
    border-radius: 4px;
  }

  .zoom-slider::-moz-range-track {
    background: #4b5563;
    height: 8px;
    border-radius: 4px;
    border: none;
  }
`;

interface QRScannerProps {
  onScanSuccess?: (transaction: { type: 'scan'; points: number; description: string; location?: string }) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [supportsZoom, setSupportsZoom] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [cameraInfo, setCameraInfo] = useState<string>('');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScannerRunning = useRef(false);
  const videoTrackRef = useRef<MediaStreamTrack | null>(null);

  const token = localStorage.getItem("token");
  const API_BASE = window.location.hostname === 'localhost' ? '/api' : 'https://ecopoints.hvd.lat/api';

  const MIN_ZOOM = 1;
  const MAX_ZOOM = 4;
  const ZOOM_STEP = 0.5;

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  });

  const setTransparentBackground = (isTransparent: boolean) => {
    if (Capacitor.isNativePlatform()) {
      document.body.style.backgroundColor = isTransparent ? 'transparent' : '';
      document.getElementById('root')!.style.backgroundColor = isTransparent ? 'transparent' : '';
    }
  };

  // FUNCIÓN MEJORADA: Zoom digital que se mantiene centrado
  const applyDigitalZoom = (level: number) => {
    const videoContainer = document.querySelector('#qr-reader') as HTMLElement;
    const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;

    if (videoContainer && videoElement) {
      // Aplicar transformación al contenedor para mantener el centrado
      videoContainer.style.transform = `scale(${level})`;
      videoContainer.style.transformOrigin = 'center center';
      videoContainer.style.overflow = 'hidden';

      // El video mantiene su tamaño original
      videoElement.style.transform = 'none';
      videoElement.style.width = '100%';
      videoElement.style.height = '100%';
      videoElement.style.objectFit = 'cover';
    }
    setZoomLevel(level);
  };

  const checkZoomSupport = (track: MediaStreamTrack): boolean => {
    try {
      const capabilities = track.getCapabilities();
      const hasZoom = (capabilities as any).zoom !== undefined;
      console.log("Capacidades de zoom nativo:", capabilities);
      return hasZoom;
    } catch (error) {
      console.log("Zoom nativo no disponible");
      return false;
    }
  };

  const applyZoom = async (zoomValue: number) => {
    if (!scannerRef.current || !isScannerRunning.current) {
      console.log("No se puede aplicar zoom - scanner no activo");
      return;
    }

    try {
      console.log("Aplicando zoom a:", zoomValue);

      // Primero intentar zoom nativo si está disponible
      if (videoTrackRef.current) {
        const nativeZoomSupported = checkZoomSupport(videoTrackRef.current);
        if (nativeZoomSupported) {
          await scannerRef.current.applyVideoConstraints({
            advanced: [{ zoom: zoomValue }]
          } as any);
          console.log("Zoom nativo aplicado:", zoomValue);
        } else {
          // Si no hay zoom nativo, usar zoom digital
          applyDigitalZoom(zoomValue);
          console.log("Zoom digital aplicado:", zoomValue);
        }
      } else {
        // Fallback a zoom digital
        applyDigitalZoom(zoomValue);
        console.log("Zoom digital aplicado (fallback):", zoomValue);
      }

      setZoomLevel(zoomValue);

    } catch (error) {
      console.warn("No se pudo aplicar zoom nativo, usando zoom digital:", error);
      // Fallback a zoom digital
      applyDigitalZoom(zoomValue);
    }
  };

  // MANTENIENDO TU LÓGICA ORIGINAL DE CÁMARA TRASERA
  const startScanning = async () => {
    if (showSuccess) return;
    setPermissionError(false);
    setCameraInfo('');

    try {
      if (Capacitor.isNativePlatform()) {
        const permission = await Camera.requestPermissions({ permissions: ['camera'] });
        if (permission.camera !== 'granted') {
          toast.error("Permiso de cámara denegado.");
          setPermissionError(true);
          return;
        }
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) throw new Error("No se encontraron cámaras.");

      console.log("Todas las cámaras disponibles:", cameras);

      // MANTENIENDO TU LÓGICA ORIGINAL para cámara trasera
      let selectedCamera = cameras.find(c => {
        const label = c.label.toLowerCase();
        return label.includes('facing back') ||
          label.includes('back') ||
          label.includes('rear') ||
          label.includes('trasera') ||
          label.includes('0') ||
          label.includes('1');
      }) || cameras[0];

      const cameraId = selectedCamera.id;
      const cameraLabel = selectedCamera.label;

      setCameraInfo(`Cámara: ${cameraLabel}`);
      console.log("Cámara seleccionada:", cameraLabel);

      setTransparentBackground(true);
      setIsScanning(true);

      const scanner = new Html5Qrcode("qr-reader", {
        verbose: false,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
      });
      scannerRef.current = scanner;

      const qrboxFunction = (viewfinderWidth: number, viewfinderHeight: number) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const qrboxSize = Math.floor(minEdge * 0.7);
        return { width: qrboxSize, height: qrboxSize };
      };

      const config: any = {
        fps: 10,
        qrbox: qrboxFunction,
        supportedFormats: [Html5QrcodeSupportedFormats.QR_CODE],
        aspectRatio: 1.0,
      };

      if (Capacitor.isNativePlatform()) {
        config.videoConstraints = {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          advanced: [{ zoom: MIN_ZOOM }]
        };
      }

      console.log("Iniciando scanner con configuración:", config);

      await scanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          console.log("QR escaneado exitosamente:", decodedText);
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          if (!errorMessage.includes("No MultiFormat Readers") &&
            !errorMessage.includes("NotFoundException")) {
            console.log("Scanner message:", errorMessage);
          }
        }
      );

      isScannerRunning.current = true;
      console.log("Scanner iniciado correctamente");

      // Configurar zoom después de iniciar el scanner
      setTimeout(() => {
        setupZoom(scanner);
      }, 1000);

    } catch (err: any) {
      console.error("Error al iniciar scanner:", err);
      setIsScanning(false);
      setTransparentBackground(false);

      if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
        toast.error("Permiso de cámara denegado. Actívalo en los ajustes.");
        setPermissionError(true);
      } else {
        toast.error(`Error al iniciar cámara: ${err.message || 'Desconocido'}`);
      }
    }
  };

  const setupZoom = async (scanner: Html5Qrcode) => {
    try {
      // Obtener el track de video para verificar capacidades
      const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        const videoTrack = stream.getVideoTracks()[0];
        videoTrackRef.current = videoTrack;

        const nativeZoomSupported = checkZoomSupport(videoTrack);
        console.log("Zoom nativo soportado:", nativeZoomSupported);

        if (nativeZoomSupported) {
          const settings = scanner.getRunningTrackSettings() as any;
          const currentZoom = settings?.zoom || MIN_ZOOM;
          setZoomLevel(currentZoom);
          console.log("Zoom nativo configurado. Nivel actual:", currentZoom);
        } else {
          console.log("Usando zoom digital");
          applyDigitalZoom(MIN_ZOOM);
        }
      }
    } catch (error) {
      console.warn("Error al configurar zoom, usando zoom digital por defecto:", error);
      applyDigitalZoom(MIN_ZOOM);
    }
  };

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(event.target.value);
    applyZoom(newZoom);
  };

  const increaseZoom = () => {
    const newZoom = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
    applyZoom(newZoom);
  };

  const decreaseZoom = () => {
    const newZoom = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
    applyZoom(newZoom);
  };

  const stopScanning = async () => {
    console.log("Deteniendo scanner...");
    setTransparentBackground(false);

    // Resetear zoom digital
    const videoContainer = document.querySelector('#qr-reader') as HTMLElement;
    if (videoContainer) {
      videoContainer.style.transform = 'none';
      videoContainer.style.overflow = 'visible';
    }

    if (videoTrackRef.current) {
      videoTrackRef.current = null;
    }

    if (scannerRef.current && isScannerRunning.current) {
      try {
        await scannerRef.current.stop();
        console.log("Scanner detenido correctamente");
      }
      catch (error) {
        console.warn("Error al detener scanner:", error);
      }
      finally {
        isScannerRunning.current = false;
        scannerRef.current = null;
      }
    }
    setIsScanning(false);
    setZoomLevel(MIN_ZOOM);
  };

  const handleScanSuccess = async (qrData: string) => {
    console.log("Procesando QR escaneado:", qrData);
    await stopScanning();

    if (!token) {
      toast.error("No estás autenticado.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/validarQR`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ codigo_qr: qrData })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const puntosGanados = data.puntos_obtenidos || 0;
      setEarnedPoints(puntosGanados);
      setShowSuccess(true);

      onScanSuccess?.({
        type: 'scan',
        points: puntosGanados,
        description: data.mensaje || 'QR',
        location: data.ubicacion
      });

      toast.success(`¡${data.mensaje || "Éxito"}! Ganaste ${puntosGanados} ecopoints 🎉`);

    } catch (error) {
      console.error("Error procesando QR:", error);
      toast.error("Error al procesar el QR. Intenta nuevamente.");
    } finally {
      setTimeout(() => setShowSuccess(false), 3000);
    }
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
        <p className="text-gray-500">Escanea el código QR del punto de reciclaje para ganar ecopoints</p>

        {cameraInfo && (
          <div className="mt-2 p-2 bg-blue-100 border border-blue-300 rounded-lg">
            <p className="text-blue-700 text-xs font-medium">{cameraInfo}</p>
            <p className="text-blue-600 text-xs mt-1">✓ Cámara trasera detectada</p>
          </div>
        )}

        {permissionError && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-700 text-sm">
              Permiso de cámara denegado. Habilítalo en los ajustes de la app y reiníciala.
            </p>
          </div>
        )}
      </div>

      {/* DISEÑO MEJORADO - Similar al segundo código pero manteniendo tu estructura */}
      <Card className="overflow-hidden border-2 border-gray-200">
        <div className="relative aspect-square bg-gray-900">
          {!isScanning && !showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <CameraIcon className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="text-gray-400">Toca el botón para iniciar el escaneo</p>
                {permissionError && (
                  <p className="text-yellow-400 text-sm">Permisos de cámara requeridos</p>
                )}
              </div>
            </div>
          )}

          <div id="qr-reader" className={`w-full h-full ${isScanning ? '' : 'hidden'}`}></div>

          {isScanning && (
            <div className="absolute inset-0 pointer-events-none">
              {/* Marco de escaneo del segundo código */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-emerald-400 rounded-lg">
                <motion.div
                  className="absolute top-0 left-0 right-0 h-1 bg-emerald-400 rounded-full"
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />
              </div>

              {/* Overlay de escaneo del segundo código */}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <QrCode className="w-16 h-16 text-emerald-400 mx-auto" />
                  </motion.div>
                  <p className="text-white font-medium">Escaneando código QR...</p>
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

      {/* CONTROLES DE ZOOM CON DISEÑO MEJORADO */}
      {isScanning && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700">
                Control de Zoom
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
              <span className="font-medium">Zoom digital</span>
              <span>{MAX_ZOOM}x</span>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {!isScanning ? (
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-lg font-semibold transition-colors duration-200"
            onClick={startScanning}
            disabled={showSuccess || permissionError}
          >
            <CameraIcon className="w-6 h-6 mr-3" />
            {permissionError ? "Permiso denegado" : "Iniciar escaneo con cámara"}
          </Button>
        ) : (
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold transition-colors duration-200"
            onClick={stopScanning}
          >
            <X className="w-6 h-6 mr-3" />
            Detener escaneo
          </Button>
        )}
      </div>

      {/* CARD DE CONSEJOS MEJORADO */}
      <Card className="p-4 bg-emerald-50 border-emerald-200">
        <div className="space-y-2">
          <p className="text-emerald-900 font-semibold text-sm">Consejos para mejor escaneo:</p>
          <ul className="text-emerald-700 text-xs space-y-1 ml-4">
            <li>• Usa la barra de zoom para acercar o alejar la imagen</li>
            <li>• Mantén el QR dentro del cuadro verde</li>
            <li>• Asegúrate de tener buena iluminación</li>
            <li>• El zoom digital funciona en todos los dispositivos</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}