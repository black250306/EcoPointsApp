// import { useState, useEffect } from 'react';
// import { Card } from '../ui/card';
// import { Button } from '../ui/button';
// import { Input } from '../ui/input';
// import { Label } from '../ui/label';
// import { Separator } from '../ui/separator';
// import { Badge } from '../ui/badge';
// import {
//     Building2,
//     MapPin,
//     Plus,
//     Users,
//     Leaf,
//     X,
//     Eye,
//     Loader2,
//     CheckCircle,
//     AlertCircle
// } from 'lucide-react';
// import { toast } from 'sonner';
// import { projectId, publicAnonKey } from '../utils/supabase/info';

// interface AdminDashboardProps {
//     accessToken: string;
//     onLogout: () => void;
// }

// export function AdminDashboard({ accessToken, onLogout }: AdminDashboardProps) {
//     const [activeView, setActiveView] = useState<'dashboard' | 'create-company' | 'create-ecopoint' | 'companies' | 'ecopoints'>('dashboard');
//     const [companies, setCompanies] = useState<any[]>([]);
//     const [ecopoints, setEcopoints] = useState<any[]>([]);
//     const [isLoading, setIsLoading] = useState(false);

//     // Form states
//     const [companyForm, setCompanyForm] = useState({
//         email: '',
//         password: '',
//         companyName: '',
//         ruc: '',
//         address: ''
//     });

//     const [ecopointForm, setEcopointForm] = useState({
//         name: '',
//         address: '',
//         latitude: '',
//         longitude: ''
//     });

//     useEffect(() => {
//         if (activeView === 'companies') {
//             loadCompanies();
//         } else if (activeView === 'ecopoints') {
//             loadEcopoints();
//         }
//     }, [activeView]);

//     const loadCompanies = async () => {
//         try {
//             const response = await fetch(
//                 `https://${projectId}.supabase.co/functions/v1/make-server-2f1c9f85/admin/companies`,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${accessToken}`
//                     }
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 toast.error('Error al cargar empresas', { description: data.error });
//                 return;
//             }

//             setCompanies(data.companies || []);
//         } catch (error) {
//             console.error('Error al cargar empresas:', error);
//             toast.error('Error al cargar empresas');
//         }
//     };

//     const loadEcopoints = async () => {
//         try {
//             const response = await fetch(
//                 `https://${projectId}.supabase.co/functions/v1/make-server-2f1c9f85/admin/ecopoints`,
//                 {
//                     headers: {
//                         'Authorization': `Bearer ${accessToken}`
//                     }
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 toast.error('Error al cargar EcoPoints', { description: data.error });
//                 return;
//             }

//             setEcopoints(data.ecopoints || []);
//         } catch (error) {
//             console.error('Error al cargar EcoPoints:', error);
//             toast.error('Error al cargar EcoPoints');
//         }
//     };

//     const handleCreateCompany = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsLoading(true);

//         try {
//             const response = await fetch(
//                 `https://${projectId}.supabase.co/functions/v1/make-server-2f1c9f85/admin/create-company`,
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${accessToken}`
//                     },
//                     body: JSON.stringify(companyForm)
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 toast.error('Error al crear empresa', { description: data.error });
//                 setIsLoading(false);
//                 return;
//             }

//             toast.success('¡Empresa creada exitosamente! 🎉', {
//                 description: `${companyForm.companyName} ha sido registrada`
//             });

//             setCompanyForm({
//                 email: '',
//                 password: '',
//                 companyName: '',
//                 ruc: '',
//                 address: ''
//             });
//             setActiveView('companies');
//         } catch (error) {
//             console.error('Error:', error);
//             toast.error('Error al crear empresa');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleCreateEcopoint = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsLoading(true);

//         try {
//             const response = await fetch(
//                 `https://${projectId}.supabase.co/functions/v1/make-server-2f1c9f85/admin/create-ecopoint`,
//                 {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         'Authorization': `Bearer ${accessToken}`
//                     },
//                     body: JSON.stringify({
//                         name: ecopointForm.name,
//                         address: ecopointForm.address,
//                         latitude: ecopointForm.latitude ? parseFloat(ecopointForm.latitude) : undefined,
//                         longitude: ecopointForm.longitude ? parseFloat(ecopointForm.longitude) : undefined
//                     })
//                 }
//             );

//             const data = await response.json();

//             if (!response.ok) {
//                 toast.error('Error al crear EcoPoint', { description: data.error });
//                 setIsLoading(false);
//                 return;
//             }

//             toast.success('¡EcoPoint creado exitosamente! 🎉', {
//                 description: `${ecopointForm.name} ha sido registrado`
//             });

//             setEcopointForm({
//                 name: '',
//                 address: '',
//                 latitude: '',
//                 longitude: ''
//             });
//             setActiveView('ecopoints');
//         } catch (error) {
//             console.error('Error:', error);
//             toast.error('Error al crear EcoPoint');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // Dashboard view
//     if (activeView === 'dashboard') {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-4">
//                 <div className="max-w-6xl mx-auto space-y-6">
//                     {/* Header */}
//                     <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-3">
//                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
//                                 <Leaf className="w-6 h-6 text-blue-600" />
//                             </div>
//                             <div>
//                                 <h1 className="text-white">Panel de Administrador</h1>
//                                 <p className="text-blue-100">EcoPoints Intranet</p>
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
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <Card className="p-6 bg-white/95">
//                             <div className="flex items-center gap-4">
//                                 <div className="w-16 h-16 bg-emerald-100 rounded-lg flex items-center justify-center">
//                                     <Building2 className="w-8 h-8 text-emerald-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500">Total Empresas</p>
//                                     <h2 className="text-gray-900">{companies.length}</h2>
//                                 </div>
//                             </div>
//                         </Card>

//                         <Card className="p-6 bg-white/95">
//                             <div className="flex items-center gap-4">
//                                 <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
//                                     <MapPin className="w-8 h-8 text-blue-600" />
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500">Total EcoPoints</p>
//                                     <h2 className="text-gray-900">{ecopoints.length}</h2>
//                                 </div>
//                             </div>
//                         </Card>
//                     </div>

//                     {/* Actions */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <Card className="p-6 bg-white/95">
//                             <div className="space-y-4">
//                                 <div className="flex items-center gap-3">
//                                     <Building2 className="w-6 h-6 text-emerald-600" />
//                                     <h3 className="text-gray-900">Gestionar Empresas</h3>
//                                 </div>
//                                 <p className="text-gray-600">
//                                     Crea nuevas empresas y administra sus convenios.
//                                 </p>
//                                 <div className="flex gap-2">
//                                     <Button
//                                         onClick={() => setActiveView('create-company')}
//                                         className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
//                                     >
//                                         <Plus className="w-4 h-4 mr-2" />
//                                         Nueva Empresa
//                                     </Button>
//                                     <Button
//                                         variant="outline"
//                                         onClick={() => setActiveView('companies')}
//                                     >
//                                         <Eye className="w-4 h-4 mr-2" />
//                                         Ver Todas
//                                     </Button>
//                                 </div>
//                             </div>
//                         </Card>

//                         <Card className="p-6 bg-white/95">
//                             <div className="space-y-4">
//                                 <div className="flex items-center gap-3">
//                                     <MapPin className="w-6 h-6 text-blue-600" />
//                                     <h3 className="text-gray-900">Gestionar EcoPoints</h3>
//                                 </div>
//                                 <p className="text-gray-600">
//                                     Crea y administra puntos de reciclaje.
//                                 </p>
//                                 <div className="flex gap-2">
//                                     <Button
//                                         onClick={() => setActiveView('create-ecopoint')}
//                                         className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
//                                     >
//                                         <Plus className="w-4 h-4 mr-2" />
//                                         Nuevo EcoPoint
//                                     </Button>
//                                     <Button
//                                         variant="outline"
//                                         onClick={() => setActiveView('ecopoints')}
//                                     >
//                                         <Eye className="w-4 h-4 mr-2" />
//                                         Ver Todos
//                                     </Button>
//                                 </div>
//                             </div>
//                         </Card>
//                     </div>

//                     {/* Info */}
//                     <Card className="p-6 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
//                         <div className="flex items-start gap-3">
//                             <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
//                             <div>
//                                 <p className="text-blue-700">
//                                     <strong>Nota:</strong> Las empresas no pueden auto-registrarse. Deben enviar una solicitud por correo con sus requisitos para ser evaluadas por el equipo de administración.
//                                 </p>
//                             </div>
//                         </div>
//                     </Card>
//                 </div>
//             </div>
//         );
//     }

//     // Create Company view
//     if (activeView === 'create-company') {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-4">
//                 <div className="max-w-2xl mx-auto space-y-6">
//                     <div className="flex items-center justify-between">
//                         <h1 className="text-white">Crear Nueva Empresa</h1>
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
//                         <form onSubmit={handleCreateCompany} className="space-y-4">
//                             <div className="space-y-2">
//                                 <Label htmlFor="companyName">Nombre de la Empresa</Label>
//                                 <Input
//                                     id="companyName"
//                                     value={companyForm.companyName}
//                                     onChange={(e) => setCompanyForm({ ...companyForm, companyName: e.target.value })}
//                                     placeholder="Ej: Restaurante Bembos"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="ruc">RUC</Label>
//                                 <Input
//                                     id="ruc"
//                                     value={companyForm.ruc}
//                                     onChange={(e) => setCompanyForm({ ...companyForm, ruc: e.target.value })}
//                                     placeholder="20123456789"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="email">Email de la Empresa</Label>
//                                 <Input
//                                     id="email"
//                                     type="email"
//                                     value={companyForm.email}
//                                     onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
//                                     placeholder="empresa@example.com"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="password">Contraseña Inicial</Label>
//                                 <Input
//                                     id="password"
//                                     type="password"
//                                     value={companyForm.password}
//                                     onChange={(e) => setCompanyForm({ ...companyForm, password: e.target.value })}
//                                     placeholder="Mínimo 6 caracteres"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="address">Dirección</Label>
//                                 <Input
//                                     id="address"
//                                     value={companyForm.address}
//                                     onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
//                                     placeholder="Av. Principal 123, Lima"
//                                 />
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
//                                             Crear Empresa
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

//     // Create EcoPoint view
//     if (activeView === 'create-ecopoint') {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-4">
//                 <div className="max-w-2xl mx-auto space-y-6">
//                     <div className="flex items-center justify-between">
//                         <h1 className="text-white">Crear Nuevo EcoPoint</h1>
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
//                         <form onSubmit={handleCreateEcopoint} className="space-y-4">
//                             <div className="space-y-2">
//                                 <Label htmlFor="ecopoint-name">Nombre del EcoPoint</Label>
//                                 <Input
//                                     id="ecopoint-name"
//                                     value={ecopointForm.name}
//                                     onChange={(e) => setEcopointForm({ ...ecopointForm, name: e.target.value })}
//                                     placeholder="Ej: EcoPoint Miraflores Centro"
//                                     required
//                                 />
//                             </div>

//                             <div className="space-y-2">
//                                 <Label htmlFor="ecopoint-address">Dirección</Label>
//                                 <Input
//                                     id="ecopoint-address"
//                                     value={ecopointForm.address}
//                                     onChange={(e) => setEcopointForm({ ...ecopointForm, address: e.target.value })}
//                                     placeholder="Av. Larco 123, Miraflores"
//                                     required
//                                 />
//                             </div>

//                             <div className="grid grid-cols-2 gap-4">
//                                 <div className="space-y-2">
//                                     <Label htmlFor="latitude">Latitud (Opcional)</Label>
//                                     <Input
//                                         id="latitude"
//                                         type="number"
//                                         step="any"
//                                         value={ecopointForm.latitude}
//                                         onChange={(e) => setEcopointForm({ ...ecopointForm, latitude: e.target.value })}
//                                         placeholder="-12.1234"
//                                     />
//                                 </div>

//                                 <div className="space-y-2">
//                                     <Label htmlFor="longitude">Longitud (Opcional)</Label>
//                                     <Input
//                                         id="longitude"
//                                         type="number"
//                                         step="any"
//                                         value={ecopointForm.longitude}
//                                         onChange={(e) => setEcopointForm({ ...ecopointForm, longitude: e.target.value })}
//                                         placeholder="-77.5678"
//                                     />
//                                 </div>
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
//                                     className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
//                                             Crear EcoPoint
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

//     // Companies list view
//     if (activeView === 'companies') {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-4">
//                 <div className="max-w-4xl mx-auto space-y-6">
//                     <div className="flex items-center justify-between">
//                         <h1 className="text-white">Empresas Registradas</h1>
//                         <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => setActiveView('dashboard')}
//                             className="text-white hover:bg-white/10"
//                         >
//                             <X className="w-5 h-5" />
//                         </Button>
//                     </div>

//                     <div className="space-y-3">
//                         {companies.map((company) => (
//                             <Card key={company.id} className="p-4 bg-white/95">
//                                 <div className="flex items-start justify-between">
//                                     <div className="flex items-start gap-3">
//                                         <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
//                                             <Building2 className="w-6 h-6 text-emerald-600" />
//                                         </div>
//                                         <div>
//                                             <h3 className="text-gray-900">{company.name}</h3>
//                                             <p className="text-gray-600">{company.email}</p>
//                                             <div className="flex gap-2 mt-2">
//                                                 <Badge variant="outline">RUC: {company.ruc}</Badge>
//                                                 {company.address && <Badge variant="outline">{company.address}</Badge>}
//                                             </div>
//                                         </div>
//                                     </div>
//                                     <Badge className="bg-emerald-100 text-emerald-700">Activa</Badge>
//                                 </div>
//                             </Card>
//                         ))}

//                         {companies.length === 0 && (
//                             <Card className="p-8 bg-white/95 text-center">
//                                 <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                                 <p className="text-gray-600">No hay empresas registradas aún</p>
//                             </Card>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // EcoPoints list view
//     if (activeView === 'ecopoints') {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 p-4">
//                 <div className="max-w-4xl mx-auto space-y-6">
//                     <div className="flex items-center justify-between">
//                         <h1 className="text-white">EcoPoints Registrados</h1>
//                         <Button
//                             variant="ghost"
//                             size="icon"
//                             onClick={() => setActiveView('dashboard')}
//                             className="text-white hover:bg-white/10"
//                         >
//                             <X className="w-5 h-5" />
//                         </Button>
//                     </div>

//                     <div className="space-y-3">
//                         {ecopoints.map((ecopoint) => (
//                             <Card key={ecopoint.id} className="p-4 bg-white/95">
//                                 <div className="flex items-start justify-between">
//                                     <div className="flex items-start gap-3">
//                                         <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                                             <MapPin className="w-6 h-6 text-blue-600" />
//                                         </div>
//                                         <div>
//                                             <h3 className="text-gray-900">{ecopoint.name}</h3>
//                                             <p className="text-gray-600">{ecopoint.address}</p>
//                                             {(ecopoint.latitude || ecopoint.longitude) && (
//                                                 <p className="text-gray-500 mt-1">
//                                                     📍 {ecopoint.latitude}, {ecopoint.longitude}
//                                                 </p>
//                                             )}
//                                         </div>
//                                     </div>
//                                     <Badge className="bg-blue-100 text-blue-700">Activo</Badge>
//                                 </div>
//                             </Card>
//                         ))}

//                         {ecopoints.length === 0 && (
//                             <Card className="p-8 bg-white/95 text-center">
//                                 <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//                                 <p className="text-gray-600">No hay EcoPoints registrados aún</p>
//                             </Card>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return null;
// }
