import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, User, Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft, Key, CheckCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface LoginProps {
  onLoginSuccess: (usuarioId: string, token: string, usuarioNombre: string) => void;
}

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
}

interface LoginResponse {
  usuario: Usuario;
  token: string;
  mensaje: string;
}

interface RegisterResponse {
  mensaje: string;
}

interface ErrorResponse {
  error?: string;
  mensaje?: string;
}

interface ResetResponse {
  mensaje: string;
}

interface VerifyCodeResponse {
  mensaje: string;
  token_temporal: string;
  usuario_id: string;
}

type ForgotPasswordStep = 'login' | 'request' | 'verify' | 'reset';

// Type guards para verificar el tipo de respuesta
function isErrorResponse(response: any): response is ErrorResponse {
  return 'error' in response || (response && typeof response.mensaje === 'string' && !response.token && !response.usuario);
}

function isLoginResponse(response: any): response is LoginResponse {
  return 'token' in response && 'usuario' in response;
}

function isRegisterResponse(response: any): response is RegisterResponse {
  return 'mensaje' in response && !('token' in response) && !('usuario' in response);
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>('login');
  const [resetData, setResetData] = useState({
    email: "",
    codigo: "",
    nuevaContrasena: "",
    confirmarContrasena: "",
    tokenTemporal: "",
    usuarioId: ""
  });
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_BASE = (import.meta as any).env?.PROD 
    ? 'https://ecopoints.hvd.lat/api' 
    : '/api';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setLoginError("");
  };

  const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResetData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      toast.error("El email y la contraseña son obligatorios");
      return false;
    }

    if (!isLogin && !formData.nombre) {
      toast.error("El nombre completo es obligatorio");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Por favor, ingresa un email válido");
      return false;
    }

    return true;
  };

  const validateResetForm = (step: ForgotPasswordStep): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    switch (step) {
      case 'request':
        if (!resetData.email) {
          toast.error("El email es obligatorio");
          return false;
        }
        if (!emailRegex.test(resetData.email)) {
          toast.error("Por favor, ingresa un email válido");
          return false;
        }
        return true;

      case 'verify':
        if (!resetData.codigo || resetData.codigo.length !== 6) {
          toast.error("El código debe tener 6 dígitos");
          return false;
        }
        return true;

      case 'reset':
        if (!resetData.nuevaContrasena || !resetData.confirmarContrasena) {
          toast.error("Ambas contraseñas son obligatorias");
          return false;
        }
        if (resetData.nuevaContrasena.length < 6) {
          toast.error("La contraseña debe tener al menos 6 caracteres");
          return false;
        }
        if (resetData.nuevaContrasena !== resetData.confirmarContrasena) {
          toast.error("Las contraseñas no coinciden");
          return false;
        }
        return true;

      default:
        return false;
    }
  };

  const handleRequestReset = async () => {
    if (!validateResetForm('request')) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/solicitarReset`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetData.email
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data: ResetResponse = await response.json();
      toast.success(data.mensaje || "Código enviado a tu email");
      setResetEmailSent(true);
    } catch (error: any) {
      toast.error(error.message || "Error al enviar el código de verificación");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!validateResetForm('verify')) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/verificarCodigo`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetData.email,
          codigo: resetData.codigo
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data: VerifyCodeResponse = await response.json();
      toast.success(data.mensaje || "Código verificado correctamente");
      
      setResetData(prev => ({
        ...prev,
        tokenTemporal: data.token_temporal,
        usuarioId: data.usuario_id
      }));
      
      setForgotPasswordStep('reset');
    } catch (error: any) {
      toast.error(error.message || "Error al verificar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!validateResetForm('reset')) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/actualizarContrasena`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token_temporal: resetData.tokenTemporal,
          nueva_contrasena: resetData.nuevaContrasena
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data: ResetResponse = await response.json();
      toast.success(data.mensaje || "Contraseña actualizada exitosamente");
      
      setForgotPasswordStep('login');
      setResetEmailSent(false);
      setResetData({
        email: "",
        codigo: "",
        nuevaContrasena: "",
        confirmarContrasena: "",
        tokenTemporal: "",
        usuarioId: ""
      });
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setLoginError("");

    const endpoint = isLogin ? "logeoUsuario" : "registrarUsuario";

    try {
      const response = await fetch(`${API_BASE}/${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isLogin
            ? { 
                email: formData.email, 
                password: formData.password 
              }
            : { 
                nombre: formData.nombre, 
                email: formData.email, 
                password: formData.password 
              }
        ),
      });

      const data: LoginResponse | RegisterResponse | ErrorResponse = await response.json();

      if (!response.ok) {
        // CORRECCIÓN: Usar type guard para verificar si es ErrorResponse
        let errorMessage = "Error desconocido";
        
        if (isErrorResponse(data)) {
          errorMessage = data.error || data.mensaje || "Error desconocido";
        } else if (typeof data === 'object' && data !== null) {
          // Intentar extraer mensaje de error de otras formas
          const anyData = data as any;
          errorMessage = anyData.mensaje || anyData.message || "Error desconocido";
        }
        
        if (errorMessage.toLowerCase().includes("incorrect") || 
            errorMessage.toLowerCase().includes("invalid") ||
            errorMessage.toLowerCase().includes("credenciales") ||
            response.status === 401) {
          setLoginError("Correo electrónico o contraseña incorrectos");
        } else {
          throw new Error(errorMessage);
        }
        return;
      }

      if (isLogin) {
        const loginData = data as LoginResponse;
        toast.success(loginData.mensaje || "Inicio de sesión exitoso");
        
        localStorage.setItem("usuario_id", loginData.usuario.id);
        localStorage.setItem("usuario_nombre", loginData.usuario.nombre);
        localStorage.setItem("usuario_correo", loginData.usuario.correo);
        localStorage.setItem("token", loginData.token);
        
        onLoginSuccess(loginData.usuario.id, loginData.token, loginData.usuario.nombre);
      } else {
        const registerData = data as RegisterResponse;
        toast.success(registerData.mensaje || "Registro exitoso. Ahora inicia sesión.");
        
        setIsLogin(true);
        setFormData(prev => ({ nombre: "", email: prev.email, password: "" }));
      }
    } catch (error: any) {
      if (error.message.includes("Failed to fetch") || error.message.includes("CORS")) {
        toast.error("Error de conexión CORS. Contacta al administrador.");
      } else if (!loginError) {
        toast.error(error.message || "Error de conexión con el servidor");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleTabChange = (login: boolean) => {
    if (loading) return;
    setIsLogin(login);
    setLoginError("");
    if (login) {
      setFormData(prev => ({ ...prev, nombre: "" }));
    }
  };

  const startForgotPassword = () => {
    setForgotPasswordStep('request');
    setResetData(prev => ({ ...prev, email: formData.email }));
    setResetEmailSent(false);
  };

  const backToLogin = () => {
    setForgotPasswordStep('login');
    setResetEmailSent(false);
    setResetData({
      email: "",
      codigo: "",
      nuevaContrasena: "",
      confirmarContrasena: "",
      tokenTemporal: "",
      usuarioId: ""
    });
  };

  const renderForgotPassword = () => {
    switch (forgotPasswordStep) {
      case 'request':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={backToLogin}
                disabled={loading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                type="button"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recuperar contraseña
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Te enviaremos un código de verificación a tu email
                </p>
              </div>
            </div>

            {!resetEmailSent ? (
              <>
                <div className="mb-6">
                  <p className="text-gray-600 dark:text-gray-400 text-center">
                    Ingresa tu correo electrónico y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="text-sm font-medium">
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      placeholder="tu@email.com"
                      value={resetData.email}
                      onChange={handleResetChange}
                      className="pl-10"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleRequestReset}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                  type="button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando código...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Enviar código de verificación
                    </>
                  )}
                </Button>

                <div className="mt-4">
                  <Button
                    variant="ghost"
                    className="w-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                    onClick={backToLogin}
                    disabled={loading}
                    type="button"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al inicio de sesión
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900 rounded-full">
                  <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                </div>

                <div>
                  <h2 className="text-gray-900 dark:text-white mb-2 text-xl font-semibold">
                    ¡Código enviado!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Hemos enviado un código de 6 dígitos a:
                  </p>
                  <p className="text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    {resetData.email}
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    📧 Revisa tu bandeja de entrada y busca el código de verificación.
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    ¿Ya recibiste el código?
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                    onClick={() => setForgotPasswordStep('verify')}
                    type="button"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    Ingresar código de verificación
                  </Button>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    ¿No recibiste el email?
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setResetEmailSent(false)}
                    disabled={loading}
                    type="button"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Reenviar código
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  className="w-full text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                  onClick={backToLogin}
                  disabled={loading}
                  type="button"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio de sesión
                </Button>
              </div>
            )}
          </div>
        );

      case 'verify':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setForgotPasswordStep('request')}
                disabled={loading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                type="button"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Verificar código
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Ingresa el código de 6 dígitos que enviamos a {resetData.email}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="codigo" className="text-sm font-medium">
                Código de verificación
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="codigo"
                  name="codigo"
                  type="text"
                  placeholder="123456"
                  value={resetData.codigo}
                  onChange={handleResetChange}
                  className="pl-10 text-center text-lg font-mono tracking-widest"
                  required
                  disabled={loading}
                  maxLength={6}
                  pattern="[0-9]{6}"
                />
              </div>
            </div>

            <Button
              onClick={handleVerifyCode}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              type="button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar código"
              )}
            </Button>
          </div>
        );

      case 'reset':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setForgotPasswordStep('verify')}
                disabled={loading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                type="button"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Nueva contraseña
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Crea una nueva contraseña para tu cuenta
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nuevaContrasena" className="text-sm font-medium">
                Nueva contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="nuevaContrasena"
                  name="nuevaContrasena"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={resetData.nuevaContrasena}
                  onChange={handleResetChange}
                  className="pl-10 pr-10"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarContrasena" className="text-sm font-medium">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={resetData.confirmarContrasena}
                  onChange={handleResetChange}
                  className="pl-10 pr-10"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
              type="button"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar contraseña"
              )}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-32 h-32 bg-white rounded-full shadow-lg mb-4">
            <Leaf className="w-24 h-24 text-emerald-600" />
          </div>
          <h1 className="text-white mb-2 text-4xl font-medium">EcoPoints</h1>
          <p className="text-emerald-100 font-medium mb-4">
            Recicla, gana puntos y cambia el mundo
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card className="p-8 shadow-2xl">
            {forgotPasswordStep === 'login' ? (
              <>
                <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  <button
                    onClick={() => handleTabChange(true)}
                    disabled={loading}
                    className={`flex-1 py-2 rounded-md transition-all ${
                      isLogin 
                        ? 'bg-emerald-300 text-emerald-400 dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    type="button"
                  >
                    Iniciar sesión
                  </button>
                  <button
                    onClick={() => handleTabChange(false)}
                    disabled={loading}
                    className={`flex-1 py-2 rounded-md transition-all ${
                      !isLogin
                        ? 'bg-emerald-300 text-emerald-400 dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow font-medium' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    type="button"
                  >
                    Registrarse
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        key="name-field"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2 overflow-hidden"
                      >
                        <Label htmlFor="nombre" className="text-sm font-medium">
                          Nombre completo
                        </Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="nombre"
                            name="nombre"
                            type="text"
                            placeholder="María Rodriguez"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="pl-10"
                            required={!isLogin}
                            disabled={loading}
                            minLength={2}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Correo electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        className="pl-10"
                        required
                        disabled={loading}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10"
                        required
                        disabled={loading}
                        autoComplete={isLogin ? "current-password" : "new-password"}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 rounded-lg dark:bg-red-700 dark:border-red-600"
                    >
                      <p className="text-red-700 text-sm text-center">
                        {loginError}
                      </p>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {isLogin ? "Iniciando sesión..." : "Registrando..."}
                      </>
                    ) : isLogin ? (
                      "Iniciar sesión"
                    ) : (
                      "Crear cuenta"
                    )}
                  </Button>
                </form>

                {isLogin && (
                  <div className="mt-4 text-center">
                    <button 
                      type="button"
                      onClick={startForgotPassword}
                      className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors text-sm"
                      disabled={loading}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-emerald-700 dark:text-emerald-300 text-center text-sm">
                    ♻️ Únete a nuestra comunidad de{" "}
                    <span className="font-semibold">
                      {isLogin ? "recicladores" : "más de 1,000 usuarios"}
                    </span>{" "}
                    comprometidos con el planeta
                  </p>
                </div>
              </>
            ) : (
              renderForgotPassword()
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-6 text-emerald-100"
        >
          <p className="text-sm">Al continuar, aceptas nuestros términos y condiciones</p>
        </motion.div>
      </div>
    </div>
  );
}