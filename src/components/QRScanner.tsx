import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
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

  useEffect(() => {
    const checkCompatibility = async () => {
      try {
          const supported = typeof Html5Qrcode !== 'undefined' && 
                           typeof Html5Qrcode.getCameras === 'function';
          setIsSupported(supported);
          
          if (!supported) {
            toast.error("Tu dispositivo no soporta el escáner de QR");
            return;
          }
          
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
              video: { facingMode: "environment" } 
            });
            stream.getTracks().forEach(track => track.stop());
            setHasPermission(true);
          } catch (err) {
            setHasPermission(false);
          }
      } catch (error) {
        console.error("Error checking compatibility:", error);
        setIsSupported(false);
      }
    };

    checkCompatibility();
  }, []);

  const setTransparentBackground = (isTransparent: boolean) => {
    document.body.style.backgroundColor = isTransparent ? 'transparent' : '';
    const root = document.getElementById('root');
    if (root) {
        root.style.backgroundColor = isTransparent ? 'transparent' : '';
    }
  };

  const scanWithHtml5Qr = async () => {
    try {
      // First, ensure we have camera permission. This will prompt the user if needed.
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      // Stop the stream immediately, we just used it to get permission.
      // html5-qrcode will start its own stream.
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);

      setTransparentBackground(true);
      setIsScanning(true);
      
      if (scannerRef.current && isScannerRunning.current) {
        await stopScanning();
      }

      // Initialize the scanner
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      // Configuration for the scanner
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedFormats: [Html5QrcodeSupportedFormats.QR_CODE],
      };
      
      // *** THIS IS THE FIX ***
      // We directly call scanner.start with a simple, valid constraints object.
      // The complex object with multiple keys was causing the error.
      await scanner.start(
        { facingMode: "environment" }, // Request the rear camera
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // This callback is for non-fatal scan errors, can be ignored.
        }
      );

      // After a short delay, try to get the video track to enable zoom
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
      setTransparentBackground(false);
      
      if (scannerRef.current) {
        try {
          if (isScannerRunning.current) {
            await scannerRef.current.stop();
          }
        } catch (stopError) {
          console.warn("Error stopping scanner in catch block:", stopError);
        }
      }
      scannerRef.current = null;
      isScannerRunning.current = false;
      videoTrackRef.current = null;
      
      if (err.name === 'NotAllowedError' || err.message?.includes('permission')) {
        toast.error("Permiso de cámara denegado. Por favor, permite el acceso a la cámara.");
      } else {
        toast.error("Error al iniciar la cámara: " + err.message);
      }
    }
  };

  const checkZoomSupport = (track: MediaStreamTrack): boolean => {
    try {
      const capabilities = track.getCapabilities();
      return (capabilities as any).zoom !== undefined;
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
    }
    setZoomLevel(level);
  };
  
  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(event.target.value);
    setZoomLevel(newZoom);
    if(supportsZoom && videoTrackRef.current) {
      try {
        const constraints = { advanced: [{ zoom: newZoom }] };
        videoTrackRef.current.applyConstraints(constraints as any);
      } catch (error) {
        console.warn("Optical zoom failed, falling back to digital", error);
        simulateDigitalZoom(newZoom);
      }
    } else {
      simulateDigitalZoom(newZoom);
    }
  };

  const increaseZoom = () => {
    const newZoom = Math.min(zoomLevel + ZOOM_STEP, MAX_ZOOM);
    handleZoomChange({ target: { value: String(newZoom) } } as any);
  };

  const decreaseZoom = () => {
    const newZoom = Math.max(zoomLevel - ZOOM_STEP, MIN_ZOOM);
    handleZoomChange({ target: { value: String(newZoom) } } as any);
  };

  const startScanning = async () => {
    if (isSupported === false) {
      toast.error("Tu dispositivo no es compatible con el escáner de QR");
      return;
    }
    await scanWithHtml5Qr();
  };

  const stopScanning = async () => {
    setTransparentBackground(false);
    
    const videoElement = document.querySelector('#qr-reader video') as HTMLVideoElement;
    if (videoElement) {
      videoElement.style.transform = 'none';
    }

    if (scannerRef.current && isScannerRunning.current) {
      try {
        await scannerRef.current.stop();
        isScannerRunning.current = false;
        videoTrackRef.current = null;
      } catch (error) {
        console.warn("Error stopping scanner:", error);
      }
    }
    
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
        body: JSON.stringify({ codigo_qr: qrData }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      const puntosGanados = data.puntos_obtenidos || 0;
      setEarnedPoints(puntosGanados);
      setShowSuccess(true);
      
      onScanSuccess?.({
        type: 'scan',
        points: puntosGanados,
        description: data.mensaje || 'Escaneo QR',
        location: data.ubicacion || undefined,
      });
      
      toast.success(`¡${data.mensaje || "Escaneo exitoso"}! Ganaste ${puntosGanados} ecopoints 🎉`);

    } catch (error) {
      console.error("Error processing QR:", error);
      toast.error("Error al procesar el código QR. Intenta nuevamente.");
    } finally {
        setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  useEffect(() => {
    return () => {
      if(isScannerRunning.current) {
        stopScanning();
      }
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
          Escanea el código QR del punto de reciclaje para ganar ecopoints
        </p>
        
        {isSupported === false && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700 text-sm">
              Tu dispositivo no es compatible con el escáner de QR. 
              Prueba con Chrome, Firefox o Safari en dispositivos móviles.
            </p>
          </div>
        )}

        {hasPermission === false && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-700 text-sm">
              Permiso de cámara denegado. Por favor, permite el acceso a la cámara en los ajustes de tu dispositivo.
            </p>
          </div>
        )}
      </div>

      <Card className="overflow-hidden border-2 border-gray-200">
        <div className="relative aspect-square bg-gray-900">
          {!isScanning && !showSuccess && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4">
                <CameraIcon className="w-16 h-16 text-gray-400 mx-auto" />
                <p className="text-gray-400">Toca el botón para iniciar el escaneo</p>
              </div>
            </div>
          )}

          <div id="qr-reader" className={`w-full h-full ${isScanning ? '' : 'hidden'}`}></div>

          {isScanning && (
            <div className="absolute inset-0 pointer-events-none border-8 border-transparent" style={{ borderColor: 'rgba(0,0,0,0.4)'}}>
                <div className="absolute top-1/2 left-1/2 w-[65vw] h-[65vw] max-w-[250px] max-h-[250px] transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative w-full h-full">
                        <div className="absolute -top-1 -left-1 w-12 h-12 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
                        <div className="absolute -top-1 -right-1 w-12 h-12 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
                        <div className="absolute -bottom-1 -left-1 w-12 h-12 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
                        <div className="absolute -bottom-1 -right-1 w-12 h-12 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>
                        <motion.div
                            className="absolute left-0 right-0 h-1 bg-emerald-400/80 rounded-full shadow-[0_0_15px_2px_#34d399]"
                            style={{ top: '5%' }}
                            animate={{ top: ['5%', '95%'] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" }}
                        />
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

      {isScanning && (
        <Card className="p-4 bg-gray-800 border-gray-700">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">
                Control de Zoom
              </span>
              <span className="text-sm font-bold text-white bg-gray-600 px-2 py-1 rounded">
                {zoomLevel.toFixed(1)}x
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button size="icon" onClick={decreaseZoom} disabled={zoomLevel <= MIN_ZOOM} variant="outline" className="bg-gray-700 border-gray-600 text-white h-10 w-10">
                <Minus className="w-5 h-5" />
              </Button>
              
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={0.1}
                value={zoomLevel}
                onChange={handleZoomChange}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer zoom-slider"
              />
              
              <Button size="icon" onClick={increaseZoom} disabled={zoomLevel >= MAX_ZOOM} variant="outline" className="bg-gray-700 border-gray-600 text-white h-10 w-10">
                <Plus className="w-5 h-5" />
              </Button>
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
              ? "Dispositivo no compatible" 
              : hasPermission === false
              ? "Permiso de cámara denegado"
              : "Iniciar escaneo con cámara"
            }
          </Button>
        ) : (
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
            onClick={stopScanning}
          >
            <X className="w-6 h-6 mr-3" />
            Detener escaneo
          </Button>
        )}
      </div>
    </div>
  );
}
