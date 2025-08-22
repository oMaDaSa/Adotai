import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  ArrowLeft,
  Users,
  PawPrint,
  Search,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  UserCheck,
  UserX,
  Flag,
  Activity,
  Calendar,
  Mail,
  Phone,
  MessageSquare
} from "lucide-react";
import { api } from "../lib/api";
import type { User, Animal, AdoptionRequest } from "../types";

interface AdminDashboardProps {
  onBack: () => void;
  onLogout: () => void;
}

interface SystemUser {
  id: string;
  name: string;
  email: string;
  type: 'adopter' | 'advertiser';
  status: 'active' | 'blocked' | 'inactive';
  registeredAt: string;
  lastActivity: string;
  reports: number;
  interactions: {
    conversations: number;
    adoptionRequests: number;
    animalsPosted?: number;
  };
}

interface AnimalAd {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  status: 'available' | 'adopted' | 'pending' | 'removed';
  advertiser: string;
  advertiserId: string;
  postedAt: string;
  lastUpdated: string;
  reports: number;
  views: number;
  interactions: number;
  image: string;
}

export function AdminDashboard({ onBack, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [userFilterType, setUserFilterType] = useState("all");
  const [userFilterStatus, setUserFilterStatus] = useState("all");
  const [adSearchTerm, setAdSearchTerm] = useState("");
  const [adFilterStatus, setAdFilterStatus] = useState("all");
  
  // State for data
  const [users, setUsers] = useState<User[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchAdminData();
  }, []);
  
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [usersData, animalsData, requestsData] = await Promise.all([
        api.getUsers(),
        api.getAnimals(),
        api.getAdoptionRequests()
      ]);
      
      setUsers(usersData);
      setAnimals(animalsData);
      setAdoptionRequests(requestsData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Erro ao carregar dados administrativos');
    } finally {
      setLoading(false);
    }
  };

  // Transform real API data for admin interface
  const adaptUsersForAdmin = (users: User[]) => {
    return users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type as 'adopter' | 'advertiser',
      status: 'active' as const, // We don't have status field in our DB yet
      registeredAt: user.created_at || new Date().toISOString(),
      lastActivity: user.updated_at || new Date().toISOString(),
      reports: 0, // We don't have reports system implemented yet
      interactions: {
        conversations: 0, // Could be calculated from conversations
        adoptionRequests: 0, // Could be calculated from adoption requests
        animalsPosted: user.type === 'advertiser' ? animals.filter(a => a.advertiser_id === user.id).length : undefined
      }
    }));
  };
  
  const adaptAnimalsForAdmin = (animals: Animal[]) => {
    return animals.map(animal => ({
      id: animal.id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed || 'SRD',
      age: animal.age ? `${animal.age} ${animal.age === 1 ? 'ano' : 'anos'}` : 'Não informado',
      status: animal.status,
      advertiser: animal.advertiser_name || 'Anunciante',
      advertiserId: animal.advertiser_id,
      postedAt: animal.created_at,
      lastUpdated: animal.updated_at,
      reports: 0, // We don't have reports system implemented yet
      views: 0, // We don't have views tracking yet
      interactions: 0, // We don't have interactions tracking yet
      image: animal.image || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'
    }));
  };
  
  const adminUsers = adaptUsersForAdmin(users);
  const adminAnimals = adaptAnimalsForAdmin(animals);

  const stats = {
    totalUsers: adminUsers.length,
    activeUsers: adminUsers.filter(u => u.status === 'active').length,
    blockedUsers: adminUsers.filter(u => u.status === 'blocked').length,
    totalAds: adminAnimals.length,
    availableAds: adminAnimals.filter(a => a.status === 'available').length,
    reportedAds: adminAnimals.filter(a => a.reports > 0).length,
    totalReports: adminUsers.reduce((sum, u) => sum + u.reports, 0) + adminAnimals.reduce((sum, a) => sum + a.reports, 0)
  };

  const getStatusBadge = (status: string, type: 'user' | 'ad' = 'user') => {
    if (type === 'user') {
      switch (status) {
        case 'active':
          return <Badge className="bg-green-100 text-green-700">Ativo</Badge>;
        case 'blocked':
          return <Badge className="bg-red-100 text-red-700">Bloqueado</Badge>;
        case 'inactive':
          return <Badge className="bg-gray-100 text-gray-700">Inativo</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'available':
          return <Badge className="bg-green-100 text-green-700">Disponível</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>;
        case 'adopted':
          return <Badge className="bg-blue-100 text-blue-700">Adotado</Badge>;
        case 'removed':
          return <Badge className="bg-red-100 text-red-700">Removido</Badge>;
        default:
          return <Badge variant="outline">{status}</Badge>;
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = adminUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesType = userFilterType === 'all' || user.type === userFilterType;
    const matchesStatus = userFilterStatus === 'all' || user.status === userFilterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredAds = adminAnimals.filter(ad => {
    const matchesSearch = ad.name.toLowerCase().includes(adSearchTerm.toLowerCase()) ||
                         ad.advertiser.toLowerCase().includes(adSearchTerm.toLowerCase()) ||
                         ad.species.toLowerCase().includes(adSearchTerm.toLowerCase());
    const matchesStatus = adFilterStatus === 'all' || ad.status === adFilterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleUserAction = (action: string, userId: string) => {
    console.log(`Ação ${action} para usuário ${userId}`);
    // Implementar lógica real aqui
  };

  const handleAdAction = (action: string, adId: string) => {
    console.log(`Ação ${action} para anúncio ${adId}`);
    // Implementar lógica real aqui
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-6 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados administrativos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-6 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAdminData} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            
            <Button 
              variant="outline"
              onClick={onLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Sair do Admin
            </Button>
          </div>
          
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Painel Administrativo
            </h1>
          </div>
          <p className="text-gray-600">
            Gerencie usuários, anúncios e monitore a plataforma Adotaí
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Usuários</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Usuários Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{stats.activeUsers}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Anúncios</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAds}</p>
                </div>
                <PawPrint className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Denúncias</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalReports}</p>
                </div>
                <Flag className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
            <TabsTrigger value="ads">Gerenciar Anúncios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <UserCheck className="h-4 w-4 text-green-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nova conta criada</p>
                        <p className="text-xs text-gray-500">Maria Silva se cadastrou como adotante</p>
                      </div>
                      <span className="text-xs text-gray-400">2h atrás</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <PawPrint className="h-4 w-4 text-orange-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Novo anúncio publicado</p>
                        <p className="text-xs text-gray-500">Buddy foi cadastrado pelo Abrigo Esperança</p>
                      </div>
                      <span className="text-xs text-gray-400">4h atrás</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Flag className="h-4 w-4 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Nova denúncia</p>
                        <p className="text-xs text-gray-500">Anúncio do Simba foi denunciado</p>
                      </div>
                      <span className="text-xs text-gray-400">6h atrás</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Itens que Requerem Atenção
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                      <div className="flex items-center space-x-3">
                        <Flag className="h-4 w-4 text-red-500" />
                        <div>
                          <p className="text-sm font-medium">Usuários com denúncias</p>
                          <p className="text-xs text-gray-500">1 usuário bloqueado</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Revisar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                      <div className="flex items-center space-x-3">
                        <PawPrint className="h-4 w-4 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium">Anúncios denunciados</p>
                          <p className="text-xs text-gray-500">2 anúncios para revisar</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Revisar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Management Tab */}
          <TabsContent value="users" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gerenciar Usuários</CardTitle>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por nome ou email..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={userFilterType} onValueChange={setUserFilterType}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os tipos</SelectItem>
                        <SelectItem value="adopter">Adotantes</SelectItem>
                        <SelectItem value="advertiser">Anunciantes</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={userFilterStatus} onValueChange={setUserFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativos</SelectItem>
                        <SelectItem value="blocked">Bloqueados</SelectItem>
                        <SelectItem value="inactive">Inativos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {user.type === 'advertiser' ? (
                            <PawPrint className="h-5 w-5 text-gray-600" />
                          ) : (
                            <Users className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{user.name}</h3>
                            {getStatusBadge(user.status)}
                            <Badge variant="outline" className="text-xs">
                              {user.type === 'advertiser' ? 'Anunciante' : 'Adotante'}
                            </Badge>
                            {user.reports > 0 && (
                              <Badge className="bg-red-100 text-red-700 text-xs">
                                {user.reports} denúncia(s)
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Cadastrado: {formatDate(user.registeredAt)}</span>
                            <span>Última atividade: {formatDate(user.lastActivity)}</span>
                            <span>
                              {user.interactions.conversations} conversas, {user.interactions.adoptionRequests} solicitações
                              {user.interactions.animalsPosted && `, ${user.interactions.animalsPosted} anúncios`}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Perfil
                        </Button>
                        
                        {user.status === 'active' ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                <Ban className="h-4 w-4 mr-1" />
                                Bloquear
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Bloquear usuário</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja bloquear {user.name}? O usuário não poderá mais acessar a plataforma.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleUserAction('block', user.id)}>
                                  Bloquear
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : user.status === 'blocked' ? (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleUserAction('unblock', user.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Reativar
                          </Button>
                        ) : null}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir usuário</AlertDialogTitle>
                              <AlertDialogDescription>
                                {user.interactions.conversations > 0 || user.interactions.adoptionRequests > 0 ? (
                                  <>
                                    Este usuário possui interações ativas ({user.interactions.conversations} conversas, {user.interactions.adoptionRequests} solicitações). 
                                    Confirma a exclusão? Isso apagará permanentemente todos os dados.
                                  </>
                                ) : (
                                  <>
                                    Tem certeza que deseja excluir permanentemente o usuário {user.name}? Esta ação não pode ser desfeita.
                                  </>
                                )}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleUserAction('delete', user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Excluir Permanentemente
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ads Management Tab */}
          <TabsContent value="ads" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Gerenciar Anúncios</CardTitle>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por animal ou anunciante..."
                        value={adSearchTerm}
                        onChange={(e) => setAdSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={adFilterStatus} onValueChange={setAdFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="available">Disponível</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="adopted">Adotado</SelectItem>
                        <SelectItem value="removed">Removido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAds.map((ad) => (
                    <div key={ad.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <ImageWithFallback
                          src={ad.image}
                          alt={ad.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium">{ad.name}</h3>
                          {getStatusBadge(ad.status, 'ad')}
                          {ad.reports > 0 && (
                            <Badge className="bg-red-100 text-red-700 text-xs">
                              {ad.reports} denúncia(s)
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {ad.species} • {ad.breed} • {ad.age}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          Anunciante: {ad.advertiser}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Publicado: {formatDate(ad.postedAt)}</span>
                          <span>{ad.views} visualizações</span>
                          <span>{ad.interactions} interações</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remover
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remover anúncio</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja remover o anúncio de {ad.name}? O anúncio será ocultado da plataforma.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleAdAction('remove', ad.id)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}