import { useState } from 'react';
import { Switch } from "./ui/switch";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
    Bell,
    Mail,
    X,
    AlertCircle,
    User,
    Settings,
    Shield,
    HelpCircle,
    LogOut,
    ChevronRight,
    Award,
    Leaf,
    TrendingUp,
    QrCode,
    Moon,
    Sun,
    MessageSquare,
    Phone,
    Lock,
    Eye,
    EyeOff,
    Key,
    Smartphone,
    FileText,
    ExternalLink,
    Send
} from "lucide-react";
import { toast } from "sonner";

interface ConfiguracionProps {
    theme?: 'light' | 'dark';
    onToggleTheme?: () => void;
    onClose?: () => void;
}

interface NotificacionesProps {
    onClose?: () => void;
}

interface PrivacidadSeguridadProps {
    onClose?: () => void;
}

interface AyudaSoporteProps {
    onClose?: () => void;
}

export function Configuracion({ theme = 'light', onToggleTheme, onClose }: ConfiguracionProps) {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-gray-900 dark:text-white">Configuración</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="dark:text-white dark:hover:bg-gray-800"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div>
                <h2 className="text-gray-900 dark:text-white mb-4">Apariencia</h2>
                <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {theme === 'dark' ? (
                                <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                            )}
                            <div>
                                <p className="text-gray-900 dark:text-white">Modo oscuro</p>
                                <p className="text-gray-500 dark:text-gray-400">Ahorra batería y reduce el brillo</p>
                            </div>
                        </div>
                        <Switch
                            checked={theme === 'dark'}
                            onCheckedChange={onToggleTheme}
                        />
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-gray-900 dark:text-white mb-4">Acerca de</h2>
                <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 mb-2">Versión 1.0.0</p>
                    <p className="text-gray-500 dark:text-gray-400">© 2025 EcoPoints</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-4">
                        Una aplicación para incentivar el reciclaje y cuidar nuestro planeta.
                    </p>
                </Card>
            </div>
        </div>
    );
}

export function Notificaciones({ onClose }: NotificacionesProps) {
    const [notificationSettings, setNotificationSettings] = useState({
        newRewards: true,
        recyclingReminders: true,
        achievements: true,
        promotions: false,
        weeklyReport: true,
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-gray-900 dark:text-white">Notificaciones</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="dark:text-white dark:hover:bg-gray-800"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div>
                <h2 className="text-gray-900 dark:text-white mb-4">Notificaciones Push</h2>
                <Card className="p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="text-gray-900 dark:text-white">Activar notificaciones</p>
                                <p className="text-gray-500 dark:text-gray-400">Recibe alertas en tu dispositivo</p>
                            </div>
                        </div>
                        <Switch
                            checked={notificationSettings.pushNotifications}
                            onCheckedChange={(checked) => {
                                setNotificationSettings({ ...notificationSettings, pushNotifications: checked });
                                toast.success(checked ? 'Notificaciones activadas' : 'Notificaciones desactivadas');
                            }}
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white">Sonido</p>
                            <p className="text-gray-500 dark:text-gray-400">Reproducir sonido al recibir notificaciones</p>
                        </div>
                        <Switch
                            checked={notificationSettings.soundEnabled}
                            onCheckedChange={(checked) =>
                                setNotificationSettings({ ...notificationSettings, soundEnabled: checked })
                            }
                        />
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-gray-900 dark:text-white mb-4">Tipos de notificaciones</h2>
                <Card className="p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white">Nuevas recompensas</p>
                            <p className="text-gray-500 dark:text-gray-400">Cuando hay nuevos premios disponibles</p>
                        </div>
                        <Switch
                            checked={notificationSettings.newRewards}
                            onCheckedChange={(checked) =>
                                setNotificationSettings({ ...notificationSettings, newRewards: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white">Recordatorios de reciclaje</p>
                            <p className="text-gray-500 dark:text-gray-400">Notificaciones semanales para reciclar</p>
                        </div>
                        <Switch
                            checked={notificationSettings.recyclingReminders}
                            onCheckedChange={(checked) =>
                                setNotificationSettings({ ...notificationSettings, recyclingReminders: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white">Logros desbloqueados</p>
                            <p className="text-gray-500 dark:text-gray-400">Celebra tus nuevos logros</p>
                        </div>
                        <Switch
                            checked={notificationSettings.achievements}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, achievements: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white">Promociones</p>
                            <p className="text-gray-500 dark:text-gray-400">Ofertas especiales y descuentos</p>
                        </div>
                        <Switch
                            checked={notificationSettings.promotions}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, promotions: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white">Reporte semanal</p>
                            <p className="text-gray-500 dark:text-gray-400">Resumen de tu actividad ecológica</p>
                        </div>
                        <Switch
                            checked={notificationSettings.weeklyReport}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyReport: checked })
                            }
                        />
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-gray-900 dark:text-white mb-4">Correo electrónico</h2>
                <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="text-gray-900 dark:text-white">Notificaciones por email</p>
                                <p className="text-gray-500 dark:text-gray-400">Recibe resúmenes por correo</p>
                            </div>
                        </div>
                        <Switch
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                            }
                        />
                    </div>
                </Card>
            </div>

            <Card className="p-4 bg-card-notas border-card-notas dark:bg-card-notas  dark:border-card-notas">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-card-notas dark:text-card-notas mt-0.5" />
                    <div>
                        <p className="text-emerald-700 dark:text-emerald-300">
                            Las notificaciones te ayudan a mantener tus hábitos de reciclaje y no perderte ninguna recompensa.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export function PrivacidadSeguridad({ onClose }: PrivacidadSeguridadProps) {
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [privacySettings, setPrivacySettings] = useState({
        twoFactorAuth: false,
        profilePublic: true,
        shareStats: true,
        showInLeaderboard: true,
        location: true,
        dataCollection: true
    });

    const handlePasswordChange = async () => {
        if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
            toast.error('Todos los campos son obligatorios');
            return;
        }

        if (passwordData.new !== passwordData.confirm) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (passwordData.new.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (passwordData.new === passwordData.current) {
            toast.error('La nueva contraseña debe ser diferente a la actual');
            return;
        }

        setIsLoading(true);

        try {
            const usuario_id = localStorage.getItem('usuario_id') || '2';

            const requestBody = {
                usuario_id: parseInt(usuario_id),
                contrasena_actual: passwordData.current,
                nueva_contrasena: passwordData.new
            };

            const response = await fetch('https://ecopoints.hvd.lat/api/actualizarContrasena', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.mensaje || 'Contraseña actualizada exitosamente');
                setShowChangePassword(false);
                setPasswordData({ current: '', new: '', confirm: '' });
            } else {
                if (data.error && data.error.includes('incorrecta')) {
                    toast.error('La contraseña actual es incorrecta');
                } else {
                    toast.error(data.error || 'Error al cambiar la contraseña');
                }
            }
        } catch (error) {
            toast.error('Error de conexión. Intenta nuevamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-gray-900 dark:text-white">Privacidad y Seguridad</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="dark:text-white dark:hover:bg-gray-800"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <div>
                <h2 className="text-gray-900 dark:text-white mb-4">Seguridad de cuenta</h2>
                <Card className="p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
                    <Button
                        variant="outline"
                        className="w-full justify-between dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => setShowChangePassword(!showChangePassword)}
                    >
                        <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span>Cambiar contraseña</span>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </Button>

                    {showChangePassword && (
                        <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Contraseña actual</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="current-password"
                                        type={showPassword ? "text" : "password"}
                                        className="pl-10 pr-10"
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                        placeholder="Ingresa tu contraseña actual"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-password">Nueva contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                        placeholder="Mínimo 6 caracteres"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        disabled={isLoading}
                                    >
                                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                        placeholder="Repite tu nueva contraseña"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        disabled={isLoading}
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowChangePassword(false);
                                        setPasswordData({ current: '', new: '', confirm: '' });
                                    }}
                                    className="flex-1"
                                    disabled={isLoading}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handlePasswordChange}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Actualizando...
                                        </div>
                                    ) : (
                                        'Actualizar contraseña'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}

                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div>
                                <p className="text-gray-900 dark:text-white">Autenticación de dos factores</p>
                                <p className="text-gray-500 dark:text-gray-400">Mayor seguridad para tu cuenta</p>
                            </div>
                        </div>
                        <Switch
                            checked={privacySettings.twoFactorAuth}
                            onCheckedChange={(checked) => {
                                setPrivacySettings({ ...privacySettings, twoFactorAuth: checked });
                                toast.success(checked ? '2FA activado' : '2FA desactivado');
                            }}
                        />
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-gray-900 dark:text-white mb-4">Privacidad de datos</h2>
                <Card className="p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white">Perfil público</p>
                            <p className="text-gray-500 dark:text-gray-400">Otros usuarios pueden ver tu perfil</p>
                        </div>
                        <Switch
                            checked={privacySettings.profilePublic}
                            onCheckedChange={(checked) =>
                                setPrivacySettings({ ...privacySettings, profilePublic: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white">Compartir estadísticas</p>
                            <p className="text-gray-500 dark:text-gray-400">Visible en el ranking global</p>
                        </div>
                        <Switch
                            checked={privacySettings.shareStats}
                            onCheckedChange={(checked) =>
                                setPrivacySettings({ ...privacySettings, shareStats: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white">Mostrar en leaderboard</p>
                            <p className="text-gray-500 dark:text-gray-400">Aparecer en tablas de posiciones</p>
                        </div>
                        <Switch
                            checked={privacySettings.showInLeaderboard}
                            onCheckedChange={(checked) =>
                                setPrivacySettings({ ...privacySettings, showInLeaderboard: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white">Ubicación</p>
                            <p className="text-gray-500 dark:text-gray-400">Para encontrar estaciones cercanas</p>
                        </div>
                        <Switch
                            checked={privacySettings.location}
                            onCheckedChange={(checked) =>
                                setPrivacySettings({ ...privacySettings, location: checked })
                            }
                        />
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-900 dark:text-white">Recopilación de datos</p>
                            <p className="text-gray-500 dark:text-gray-400">Para mejorar la experiencia</p>
                        </div>
                        <Switch
                            checked={privacySettings.dataCollection}
                            onCheckedChange={(checked) =>
                                setPrivacySettings({ ...privacySettings, dataCollection: checked })
                            }
                        />
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-gray-900 dark:text-white mb-4">Gestión de datos</h2>
                <Card className="p-4 space-y-3 dark:bg-gray-800 dark:border-gray-700">
                    <Button
                        variant="outline"
                        className="w-full justify-between dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => toast.success('Descargando tus datos...')}
                    >
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <span>Descargar mis datos</span>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-between text-red-600 dark:text-red-600 dark:bg-gray-700 dark:border-gray-600"
                        onClick={() => toast.error('Para eliminar tu cuenta, contacta a soporte')}
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            <span>Eliminar mi cuenta</span>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </Card>
            </div>

            <Card className="p-4 bg-card-notas border-card-notas dark:bg-card-notas  dark:border-card-notas">
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-card-notas dark:text-card-notas mt-0.5" />
                    <div>
                        <p className="text-emerald-700 dark:text-emerald-300">
                            Tu privacidad es importante. Protegemos tus datos con encriptación de grado bancario.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
}

export function AyudaSoporte({ onClose }: AyudaSoporteProps) {
    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-gray-900 dark:text-white">Ayuda y Soporte</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="dark:text-white dark:hover:bg-gray-800"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>

            <Card className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center gap-3 mb-3">
                    <HelpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    <h2 className="text-gray-900 dark:text-white">¿Necesitas ayuda?</h2>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Estamos aquí para ayudarte. Contáctanos por cualquiera de estos medios.
                </p>
            </Card>

            <div>
                <h2 className="text-gray-900 dark:text-white mb-4">Contacto</h2>
                <Card className="p-4 space-y-3 dark:bg-gray-800 dark:border-gray-700">
                    <Button
                        variant="outline"
                        className="w-full justify-between dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => toast.success('Abriendo chat...')}
                    >
                        <div className="flex items-center gap-3">
                            <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div className="text-left">
                                <p className="text-gray-900 dark:text-white">Chat en vivo</p>
                                <p className="text-gray-500 dark:text-gray-400">Disponible 24/7</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5" />
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-between dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => {
                            window.location.href = 'mailto:soporte@ecopoints.com';
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div className="text-left">
                                <p className="text-gray-900 dark:text-white">Email</p>
                                <p className="text-gray-500 dark:text-gray-400">soporte@ecopoints.com</p>
                            </div>
                        </div>
                        <ExternalLink className="w-5 h-5" />
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-between dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => {
                            window.location.href = 'tel:+51987654321';
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                            <div className="text-left">
                                <p className="text-gray-900 dark:text-white">Teléfono</p>
                                <p className="text-gray-500 dark:text-gray-400">+51 987 654 321</p>
                            </div>
                        </div>
                        <ExternalLink className="w-5 h-5" />
                    </Button>
                </Card>
            </div>

            <div>
                <h2 className="text-gray-900 dark:text-white mb-4">Preguntas frecuentes</h2>
                <Card className="p-4 space-y-4 dark:bg-gray-800 dark:border-gray-700">
                    <div className="space-y-2">
                        <h3 className="text-gray-900 dark:text-white">¿Cómo gano puntos?</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Escanea códigos QR en nuestras estaciones de reciclaje. Cada escaneo te otorga entre 10 y 100 puntos según el material reciclado.
                        </p>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="space-y-2">
                        <h3 className="text-gray-900 dark:text-white">¿Cómo canjeo mis puntos?</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Ve a la sección de Recompensas, elige el premio que desees y presiona "Canjear". Los códigos se envían a tu email.
                        </p>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="space-y-2">
                        <h3 className="text-gray-900 dark:text-white">¿Dónde encuentro estaciones de reciclaje?</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            Actualmente tenemos estaciones en Miraflores, San Isidro, Surco y Barranco. Próximamente en más distritos.
                        </p>
                    </div>
                    <Separator className="dark:bg-gray-700" />
                    <div className="space-y-2">
                        <h3 className="text-gray-900 dark:text-white">¿Los puntos expiran?</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            No, tus EcoPoints nunca expiran. Acumúlalos todo el tiempo que quieras.
                        </p>
                    </div>
                </Card>
            </div>

            <div>
                <h2 className="text-gray-900 dark:text-white mb-4">Tutoriales</h2>
                <Card className="p-4 space-y-3 dark:bg-gray-800 dark:border-gray-700">
                    <Button
                        variant="outline"
                        className="w-full justify-between dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => toast.success('Abriendo tutorial...')}
                    >
                        <span>Cómo escanear códigos QR</span>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-between dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => toast.success('Abriendo tutorial...')}
                    >
                        <span>Guía de reciclaje correcto</span>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full justify-between dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => toast.success('Abriendo tutorial...')}
                    >
                        <span>Cómo subir de nivel</span>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </Card>
            </div>

            <div>
                <h2 className="text-gray-900 dark:text-white mb-4">Reportar un problema</h2>
                <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        ¿Encontraste un error? Ayúdanos a mejorar reportándolo.
                    </p>
                    <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => toast.success('Gracias por tu reporte. Nos pondremos en contacto pronto.')}
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar reporte
                    </Button>
                </Card>
            </div>

            <Card className="p-4 dark:bg-gray-800 dark:border-gray-700">
                <h3 className="text-gray-900 dark:text-white mb-3">Síguenos</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => window.open('https://instagram.com', '_blank')}
                    >
                        Instagram
                    </Button>
                    <Button
                        variant="outline"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => window.open('https://facebook.com', '_blank')}
                    >
                        Facebook
                    </Button>
                    <Button
                        variant="outline"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => window.open('https://twitter.com', '_blank')}
                    >
                        Twitter
                    </Button>
                    <Button
                        variant="outline"
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        onClick={() => window.open('https://tiktok.com', '_blank')}
                    >
                        TikTok
                    </Button>
                </div>
            </Card>
        </div>
    );
}