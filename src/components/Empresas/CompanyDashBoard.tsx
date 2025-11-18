// import { useState, useEffect } from 'react';
// import { Card } from '../ui/card';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Label } from '../ui/label';
// import { Separator } from '../ui/separator';
// import { Badge } from '../ui/badge';
// import {
//     Building2,
//     Plus,
//     Ticket,
//     X,
//     Loader2,
//     CheckCircle,
//     Calendar,
//     Users,
//     BarChart3,
//     Search,
//     AlertCircle,
//     Trash2
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { projectId, publicAnonKey } from '../utils/supabase/info';

// interface CompanyDashboardProps {
//     accessToken: string;
//     companyName: string;
//     onLogout: () => void;
// }

// export function CompanyDashboard({ accessToken, companyName, onLogout }: CompanyDashboardProps) {
//     const [activeView, setActiveView] = useState<'dashboard' | 'create-code' | 'codes' | 'verify'>('dashboard');
//     const [codes, setCodes] = useState<any[]>([]);
//     const [isLoading, setIsLoading] = useState(false);

//     // Form states
//     const [codeForm, setCodeForm] = useState({
//         code: '',
//         discount: '',
//         description: '',
//         expiresAt: '',
//         maxUses: ''
//     });

//     const [verifyForm, setVerifyForm] = useState({
//         code: '',
//         userId: ''
//     });

//     const [verifyResult, setVerifyResult] = useState<any>(null);

//     useEffect(() => {
//         if (activeView === 'codes') {
//             loadCodes();
//         }
//     }, [activeView]);

//     const loadCodes = async () => {
//         try {
//             const response = await fetch(
//                 `https://${projectId}.supabase.co/functions/v1/make-server-2f1c9f85/company/codes`,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${accessToken}`
//                     }
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 toast.error('Error al cargar códigos', { description: data.error });
//                 return;
//             }

//             setCodes(data.codes || []);
//         } catch (error) {
//             console.error('Error al cargar códigos:', error);
//             toast.error('Error al cargar códigos');
//         }
//     };

//     const handleCreateCode = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsLoading(true);

//         try {
//             const response = await fetch(
//                 `https://${projectId}.supabase.co/functions/v1/make-server-2f1c9f85/company/create-code`,
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${accessToken}`
//                     },
//                     body: JSON.stringify({
//                         code: codeForm.code,
//                         discount: parseFloat(codeForm.discount),
//                         description: codeForm.description,
//                         expiresAt: codeForm.expiresAt,
//                         maxUses: codeForm.maxUses ? parseInt(codeForm.maxUses) : undefined
//                     })
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 toast.error('Error al crear código', { description: data.error });
//                 setIsLoading(false);
//                 return;
//             }

//             toast.success('¡Código creado exitosamente! 🎉', {
//                 description: `Código ${codeForm.code} registrado`
//             });

//             setCodeForm({
//                 code: '',
//                 discount: '',
//                 description: '',
//                 expiresAt: '',
//                 maxUses: ''
//             });
//             setActiveView('codes');
//         } catch (error) {
//             console.error('Error:', error);
//             toast.error('Error al crear código');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleVerifyCode = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsLoading(true);
//         setVerifyResult(null);

//         try {
//             const response = await fetch(
//                 `https://${projectId}.supabase.co/functions/v1/make-server-2f1c9f85/company/verify-code`,
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${accessToken}`
//                     },
//                     body: JSON.stringify(verifyForm)
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 toast.error('Error al verificar código', { description: data.error });
//                 setIsLoading(false);
//                 return;
//             }

//             setVerifyResult(data);

//             if (data.valid) {
//                 toast.success('✅ Código válido', {
//                     description: data.message
//                 });
//             } else {
//                 toast.error('❌ Código inválido', {
//                     description: data.message
//                 });
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             toast.error('Error al verificar código');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleDeleteCode = async (code: string) => {
//         if (!confirm('¿Estás seguro de desactivar este código?')) return;

//         try {
//             const response = await fetch(
//                 `https://${projectId}.supabase.co/functions/v1/make-server-2f1c9f85/company/code/${code}`,
//                 {
//                     method: 'DELETE',
//                     headers: {
//                         'Authorization': `Bearer ${accessToken}`
//                     }
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 toast.error('Error al desactivar código', { description: data.error });
//                 return;
//             }

//             toast.success('Código desactivado exitosamente');
//             loadCodes();
//         } catch (error) {
//             console.error('Error:', error);
//             toast.error('Error al desactivar código');
//         }
//     };

//     const activeCodes = codes.filter(c => c.active);
//     const inactiveCodes = codes.filter(c => !c.active);

//     // Dashboard view
//     if (activeView === 'dashboard') {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-4">
//                 <div className="max-w-6xl mx-auto space-y-6">
//                     {/* Header */}
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
//                                 <Building2 className="w-6 h-6 text-purple-600" />
//                             </div>
//                             <div>
//                                 <h1 className="text-white">{companyName}</h1>
//                                 <p className="text-purple-100">Panel de Empresa</p>
//                             </div>
//                         </div>
//                         <Button
//                             variant="outline"
//                             onClick={onLogout}
//                             className="bg-white/10 text-white border-white/20 hover:bg-white/20"
//                         >
//                             Cerrar sesión
//                         </Button>
//                     </div>

//                     {/* Stats Cards */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <Card className="p-6 bg-white/95">
//                             <div className="flex items-center gap-4">
//                                 <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
//                                     <Ticket className="w-8 h-8 text-emerald-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500">Códigos Activos</p>
//                                     <h2 className="text-gray-900">{activeCodes.length}</h2>
//                                 </div>
//                             </div>
//                         </Card>

//                         <Card className="p-6 bg-white/95">
//                             <div className="flex items-center gap-4">
//                                 <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
//                                     <Users className="w-8 h-8 text-blue-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500">Total Usos</p>
//                                     <h2 className="text-gray-900">
//                                         {codes.reduce((sum, code) => sum + (code.currentUses || 0), 0)}
//                                     </h2>
//                                 </div>
//                             </div>
//                         </Card>

//                         <Card className="p-6 bg-white/95">
//                             <div className="flex items-center gap-4">
//                                 <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
//                                     <BarChart3 className="w-8 h-8 text-purple-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500">Total Códigos</p>
//                                     <h2 className="text-gray-900">{codes.length}</h2>
//                                 </div>
//                             </div>
//                         </Card>
//                     </div>

//                     {/* Actions */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <Card className="p-6 bg-white/95">
//                             <div className="space-y-4">
//                                 <div className="flex items-center gap-3">
//                                     <Plus className="w-6 h-6 text-emerald-600" />
//                                     <h3 className="text-gray-900">Nuevo Código</h3>
//                                 </div>
//                                 <p className="text-gray-600">
//                                     Crea códigos de descuento para tus clientes.
//                                 </p>
//                                 <Button
//                                     onClick={() => setActiveView('create-code')}
//                                     className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
//                                 >
//                                     <Plus className="w-4 h-4 mr-2" />
//                                     Crear Código
//                                 </Button>
//                             </div>
//                         </Card>

//                         <Card className="p-6 bg-white/95">
//                             <div className="space-y-4">
//                                 <div className="flex items-center gap-3">
//                                     <Ticket className="w-6 h-6 text-blue-600" />
//                                     <h3 className="text-gray-900">Mis Códigos</h3>
//                                 </div>
//                                 <p className="text-gray-600">
//                                     Administra todos tus códigos de convenio.
//                                 </p>
//                                 <Button
//                                     onClick={() => setActiveView('codes')}
//                                     variant="outline"
//                                     className="w-full"
//                                 >
//                                     <Ticket className="w-4 h-4 mr-2" />
//                                     Ver Códigos
//                                 </Button>
//                             </div>
//                         </Card>

//                         <Card className="p-6 bg-white/95">
//                             <div className="space-y-4">
//                                 <div className="flex items-center gap-3">
//                                     <Search className="w-6 h-6 text-purple-600" />
//                                     <h3 className="text-gray-900">Verificar Código</h3>
//                                 </div>
//                                 <p className="text-gray-600">
//                                     Valida códigos de usuarios en tiempo real.
//                                 </p>
//                                 <Button
//                                     onClick={() => setActiveView('verify')}
//                                     variant="outline"
//                                     className="w-full"
//                                 >
//                                     <Search className="w-4 h-4 mr-2" />
//                                     Verificar
//                                 </Button>
//                             </div>
//                         </Card>
//                     </div>

//                     {/* Info */}
//                     <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
//                         <div className="flex items-start gap-3">
//                             <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
//                             <div>
//                                 <p className="text-purple-700">
//                                     <strong>Bienvenido a tu panel de empresa.</strong> Aquí puedes gestionar tus convenios con EcoPoints, crear códigos de descuento para usuarios ecológicos y verificar códigos en tiempo real.
//                                 </p>
//                             </div>
//                         </div>
//                     </Card>
//                 </div>
//             </div>
//         );
//     }

//     // Create Code view
//     if (activeView === 'create-code') {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-4">
//                 <div className="max-w-2xl mx-auto space-y-6">
//                     <div className="flex items-center justify-between">
//                         <h1 className="text-white">Crear Nuevo Código</h1>
//                         <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => setActiveView('dashboard')}
//                             className="text-white hover:bg-white/10"
//                         >
//                             <X className="w-5 h-5" />
//                         </Button>
//                     </div>

//                     <Card className="p-6 bg-white/95">
//                         <form onSubmit={handleCreateCode} className="space-y-4">
//                             <div className="space-y-2">
//                                 <Label htmlFor="code">Código del Convenio</Label>
//                                 <Input
//                                     id="code"
//                                     value={codeForm.code}
//                                     onChange={(e) => setCodeForm({ ...codeForm, code: e.target.value.toUpperCase() })}
//                                     placeholder="ECOPOINTS2025"
//                                     required
//                                 />
//                                 <p className="text-gray-500">Este es el código que usarán los usuarios</p>
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="discount">Descuento (%)</Label>
//                                 <Input
//                                     id="discount"
//                                     type="number"
//                                     min="1"
//                                     max="100"
//                                     value={codeForm.discount}
//                                     onChange={(e) => setCodeForm({ ...codeForm, discount: e.target.value })}
//                                     placeholder="20"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="description">Descripción</Label>
//                                 <Input
//                                     id="description"
//                                     value={codeForm.description}
//                                     onChange={(e) => setCodeForm({ ...codeForm, description: e.target.value })}
//                                     placeholder="20% de descuento en hamburguesas"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="expiresAt">Fecha de Vencimiento</Label>
//                                 <Input
//                                     id="expiresAt"
//                                     type="date"
//                                     value={codeForm.expiresAt}
//                                     onChange={(e) => setCodeForm({ ...codeForm, expiresAt: e.target.value })}
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="maxUses">Límite de Usos (Opcional)</Label>
//                                 <Input
//                                     id="maxUses"
//                                     type="number"
//                                     min="1"
//                                     value={codeForm.maxUses}
//                                     onChange={(e) => setCodeForm({ ...codeForm, maxUses: e.target.value })}
//                                     placeholder="100"
//                                 />
//                                 <p className="text-gray-500">Dejar en blanco para usos ilimitados</p>
//                             </div>

//                             <Separator />

//                             <div className="flex gap-3">
//                                 <Button
//                                     type="button"
//                                     variant="outline"
//                                     onClick={() => setActiveView('dashboard')}
//                                     className="flex-1"
//                                 >
//                                     Cancelar
//                                 </Button>
//                                 <Button
//                                     type="submit"
//                                     className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
//                                     disabled={isLoading}
//                                 >
//                                     {isLoading ? (
//                                         <>
//                                             <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                                             Creando...
//                                         </>
//                                     ) : (
//                                         <>
//                                             <CheckCircle className="w-4 h-4 mr-2" />
//                                             Crear Código
//                                         </>
//                                     )}
//                                 </Button>
//                             </div>
//                         </form>
//                     </Card>
//                 </div>
//             </div>
//         );
//     }

//     // Codes list view
//     if (activeView === 'codes') {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-4">
//                 <div className="max-w-4xl mx-auto space-y-6">
//                     <div className="flex items-center justify-between">
//                         <h1 className="text-white">Mis Códigos de Convenio</h1>
//                         <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => setActiveView('dashboard')}
//                             className="text-white hover:bg-white/10"
//                         >
//                             <X className="w-5 h-5" />
//                         </Button>
//                     </div>

//                     {/* Active Codes */}
//                     {activeCodes.length > 0 && (
//                         <div className="space-y-3">
//                             <h2 className="text-white">Códigos Activos ({activeCodes.length})</h2>
//                             {activeCodes.map((code) => (
//                                 <Card key={code.code} className="p-4 bg-white/95">
//                                     <div className="flex items-start justify-between">
//                                         <div className="flex-1">
//                                             <div className="flex items-center gap-3 mb-2">
//                                                 <h3 className="text-gray-900">{code.code}</h3>
//                                                 <Badge className="bg-emerald-100 text-emerald-700">
//                                                     {code.discount}% OFF
//                                                 </Badge>
//                                             </div>
//                                             <p className="text-gray-600 mb-2">{code.description}</p>
//                                             <div className="flex gap-3 flex-wrap text-gray-500">
//                                                 <span className="flex items-center gap-1">
//                                                     <Calendar className="w-4 h-4" />
//                                                     Vence: {new Date(code.expiresAt).toLocaleDateString()}
//                                                 </span>
//                                                 <span className="flex items-center gap-1">
//                                                     <Users className="w-4 h-4" />
//                                                     Usos: {code.currentUses || 0}
//                                                     {code.maxUses && ` / ${code.maxUses}`}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                         <Button
//                                             variant="ghost"
//                                             size="icon"
//                                             onClick={() => handleDeleteCode(code.code)}
//                                             className="text-red-500 hover:text-red-700 hover:bg-red-50"
//                                         >
//                                             <Trash2 className="w-4 h-4" />
//                                         </Button>
//                                     </div>
//                                 </Card>
//                             ))}
//                         </div>
//                     )}

//                     {/* Inactive Codes */}
//                     {inactiveCodes.length > 0 && (
//                         <div className="space-y-3">
//                             <h2 className="text-white">Códigos Inactivos ({inactiveCodes.length})</h2>
//                             {inactiveCodes.map((code) => (
//                                 <Card key={code.code} className="p-4 bg-white/95 opacity-60">
//                                     <div className="flex items-start justify-between">
//                                         <div className="flex-1">
//                                             <div className="flex items-center gap-3 mb-2">
//                                                 <h3 className="text-gray-900">{code.code}</h3>
//                                                 <Badge variant="outline">Desactivado</Badge>
//                                             </div>
//                                             <p className="text-gray-600">{code.description}</p>
//                                         </div>
//                                     </div>
//                                 </Card>
//                             ))}
//                         </div>
//                     )}

//                     {codes.length === 0 && (
//                         <Card className="p-8 bg-white/95 text-center">
//                             <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                             <p className="text-gray-600">No tienes códigos creados aún</p>
//                             <Button
//                                 onClick={() => setActiveView('create-code')}
//                                 className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
//                             >
//                                 <Plus className="w-4 h-4 mr-2" />
//                                 Crear Mi Primer Código
//                             </Button>
//                         </Card>
//                     )}
//                 </div>
//             </div>
//         );
//     }

//     // Verify code view
//     if (activeView === 'verify') {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 p-4">
//                 <div className="max-w-2xl mx-auto space-y-6">
//                     <div className="flex items-center justify-between">
//                         <h1 className="text-white">Verificar Código de Usuario</h1>
//                         <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => setActiveView('dashboard')}
//                             className="text-white hover:bg-white/10"
//                         >
//                             <X className="w-5 h-5" />
//                         </Button>
//                     </div>

//                     <Card className="p-6 bg-white/95">
//                         <form onSubmit={handleVerifyCode} className="space-y-4">
//                             <div className="space-y-2">
//                                 <Label htmlFor="verify-code">Código del Usuario</Label>
//                                 <Input
//                                     id="verify-code"
//                                     value={verifyForm.code}
//                                     onChange={(e) => setVerifyForm({ ...verifyForm, code: e.target.value.toUpperCase() })}
//                                     placeholder="ECOPOINTS2025"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="userId">ID del Usuario (Email o ID)</Label>
//                                 <Input
//                                     id="userId"
//                                     value={verifyForm.userId}
//                                     onChange={(e) => setVerifyForm({ ...verifyForm, userId: e.target.value })}
//                                     placeholder="usuario@email.com"
//                                     required
//                                 />
//                             </div>

//                             <Button
//                                 type="submit"
//                                 className="w-full bg-purple-600 hover:bg-purple-700 text-white"
//                                 disabled={isLoading}
//                             >
//                                 {isLoading ? (
//                                     <>
//                                         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                                         Verificando...
//                                     </>
//                                 ) : (
//                                     <>
//                                         <Search className="w-4 h-4 mr-2" />
//                                         Verificar Código
//                                     </>
//                                 )}
//                             </Button>
//                         </form>

//                         {verifyResult && (
//                             <div className="mt-6">
//                                 <Separator className="my-4" />
//                                 {verifyResult.valid ? (
//                                     <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
//                                         <div className="flex items-start gap-3">
//                                             <CheckCircle className="w-6 h-6 text-emerald-600 mt-0.5" />
//                                             <div>
//                                                 <h3 className="text-emerald-900 mb-2">✅ Código Válido</h3>
//                                                 <p className="text-emerald-700 mb-3">{verifyResult.message}</p>
//                                                 <div className="space-y-1 text-emerald-700">
//                                                     <p><strong>Código:</strong> {verifyResult.code.code}</p>
//                                                     <p><strong>Descuento:</strong> {verifyResult.code.discount}%</p>
//                                                     <p><strong>Descripción:</strong> {verifyResult.code.description}</p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ) : (
//                                     <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
//                                         <div className="flex items-start gap-3">
//                                             <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
//                                             <div>
//                                                 <h3 className="text-red-900 mb-2">❌ Código Inválido</h3>
//                                                 <p className="text-red-700">{verifyResult.message}</p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </Card>
//                 </div>
//             </div>
//         );
//     }

//     return null;
// }
