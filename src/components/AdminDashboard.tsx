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
import type { User, Animal, AdoptionRequest, Conversation } from "../types";
import { translateSize, translateSpecies } from "@/utils/translate";

interface AdminDashboardProps {
  onBack: () => void;
  onLogout: () => void;
  onViewProfile: (userId: string) => void;
  onViewDetails: (animalId: string) => void; 
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

interface Report {
  id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  reporter: { id: string; name: string; email: string; };
  reported_user?: { id: string; name: string; email: string; };
  reported_animal?: { id: string; name: string; };
}

interface ActivityLog {
  id: string;
  type: string;
  description: string;
  actor_id: string;
  entity_id?: string;
  created_at: string;
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

export function AdminDashboard({ onBack, onLogout, onViewProfile, onViewDetails}: AdminDashboardProps) {
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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  useEffect(() => {
    fetchAdminData();
  }, []);
  
  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ALTERADO: Usando as novas funções de admin
      const [usersData, animalsData, requestsData, reportsData, conversationsData, activityLogsData] = await Promise.all([
        api.adminGetAllUsers(),
        api.adminGetAllAnimals(),
        api.adminGetAllAdoptionRequests(),
        api.adminGetPendingReports(),
        api.adminGetAllConversations(),
        api.adminGetActivityLogs(10) // Buscar os 10 logs mais recentes
      ]);

      
      setUsers(usersData);
      setAnimals(animalsData);
      setAdoptionRequests(requestsData);
      setReports(reportsData); 
      setConversations(conversationsData);
      setActivityLogs(activityLogsData);

    } catch (err: any) { // Adicionado 'any' para acessar a propriedade 'message'
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Erro ao carregar dados administrativos');
    } finally {
      setLoading(false);
    }
  };

  // Transform real API data for admin interface
  const adaptUsersForAdmin = (users: User[]) => {
  return users.map(user => {
    // Lógica para contar as solicitações de adoção que você já tem
    const userAdoptionRequests = adoptionRequests.filter(
      req => req.adopter_id === user.id
    ).length;

    // --- NOVA LÓGICA PARA CONTAR CONVERSAS ---
    const userConversations = conversations.filter(
      convo => convo.adopter_id === user.id || convo.advertiser_id === user.id
    ).length;
    // ------------------------------------------

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      type: user.type as 'adopter' | 'advertiser',
      status: user.status, 
      registeredAt: user.created_at || new Date().toISOString(),
      lastActivity: user.updated_at || new Date().toISOString(),
      reports: 0, 
      interactions: {
        conversations: userConversations, // <--- VALOR CALCULADO AQUI
        adoptionRequests: userAdoptionRequests,
        animalsPosted: user.type === 'advertiser' ? animals.filter(a => a.advertiser_id === user.id).length : undefined
      }
    };
  });
};
  
  const adaptAnimalsForAdmin = (animals: Animal[]) => {
  return animals.map(animal => {
    
    // 1. Contar as solicitações de adoção para este animal
    const adoptionRequestsCount = adoptionRequests.filter(
      req => req.animal_id === animal.id
    ).length;
      
    // 2. Contar as conversas para este animal
    const conversationsCount = conversations.filter(
      convo => convo.animal_id === animal.id
    ).length;

    // 3. Somar tudo para ter o total de interações
    const totalInteractions = adoptionRequestsCount + conversationsCount;
    // ----------------------------------------------------
      
    return {
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
      reports: 0, 
      views: animal.view_count || 0, 
      interactions: totalInteractions, // <--- VALOR CALCULADO AQUI
      image: animal.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'
    };
  });
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
    totalReports: reports.length
  };

  const reportedAdIds = new Set(
  reports
    .filter(report => report.reported_animal) 
    .map(report => report.reported_animal!.id)
);
  const reportedAdsCount = reportedAdIds.size;

// Calcula o número de USUÁRIOS únicos que têm denúncias pendentes
  const reportedUserIds = new Set(
    reports
      .filter(report => report.reported_user)
      .map(report => report.reported_user!.id)
  );
  const reportedUsersCount = reportedUserIds.size;

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

  const handleUserAction = async (action: 'block' | 'unblock' |'delete', userId: string) => {
    try {
      if (action === 'block') {
        await api.adminBlockUser(userId);
        // Atualiza a UI
        setUsers(users => users.map(u => u.id === userId ? { ...u, status: 'blocked' } : u));
      } else if (action === 'unblock') {
        await api.adminUnblockUser(userId);
        // Atualiza a UI
        setUsers(users => users.map(u => u.id === userId ? { ...u, status: 'active' } : u));
        } else if(action==='delete'){
          await api.adminDeleteUser(userId);
          // Remove o usuário da lista na tela para uma atualização instantânea
          setUsers(currentUsers => currentUsers.filter(u => u.id !== userId));
          alert('Usuário excluído com sucesso!');
        }
      }catch (err: any) {
        console.error(`Falha ao excluir usuário:`, err);
        // Mostra a mensagem de erro para o admin
        alert(`Erro ao excluir usuário: ${err.message}`);
    }
  };

  const handleAdAction = async (action: 'remove', adId: string) => {
    if (action === 'remove') {
      try {
        await api.adminDeleteAnimal(adId);
        // Remove o animal da lista local para a UI atualizar instantaneamente
        setAnimals(currentAnimals => currentAnimals.filter(a => a.id !== adId));
        alert('Anúncio removido com sucesso!');
      } catch (err: any) {
        console.error(`Falha ao remover anúncio:`, err);
        alert(`Erro ao remover anúncio: ${err.message}`);
      }
    }
  };

  // denuncias

  const handleReportAction = async (reportId: string, status: 'resolved' | 'dismissed') => {
    try {
      await api.adminUpdateReportStatus(reportId, status);
      // Remove a denúncia da lista local para a UI atualizar instantaneamente
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
    } catch (err) {
      console.error(`Failed to update report ${reportId}`, err);
      // Você pode mostrar um toast/alert de erro aqui
    }
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

  const renderActivityDetails = (type: string) => {
  switch (type) {
    case 'new_animal':
    case 'animal_created':
      return {
        icon: <PawPrint className="h-5 w-5 text-orange-500" />,
        title: 'Novo Animal'
      };
    case 'new_user':
    case 'user_created':
      return {
        icon: <Users className="h-5 w-5 text-blue-500" />,
        title: 'Novo Usuário'
      };
    case 'adoption_request':
    case 'adoption_request_created':
      return {
        icon: <MessageSquare className="h-5 w-5 text-green-500" />,
        title: 'Solicitação de Adoção'
      };
    case 'conversation_created':
    case 'new_conversation':
      return {
        icon: <MessageSquare className="h-5 w-5 text-purple-500" />,
        title: 'Nova Conversa'
      };
    case 'report_created':
    case 'new_report':
      return {
        icon: <Flag className="h-5 w-5 text-red-500" />,
        title: 'Nova Denúncia'
      };
    case 'user_login':
      return {
        icon: <UserCheck className="h-5 w-5 text-green-600" />,
        title: 'Login de Usuário'
      };
    case 'animal_updated':
      return {
        icon: <Edit className="h-5 w-5 text-yellow-500" />,
        title: 'Animal Atualizado'
      };
    case 'adoption_approved':
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-600" />,
        title: 'Adoção Aprovada'
      };
    case 'adoption_rejected':
      return {
        icon: <XCircle className="h-5 w-5 text-red-500" />,
        title: 'Adoção Rejeitada'
      };
    case 'user_blocked':
      return {
        icon: <Ban className="h-5 w-5 text-red-600" />,
        title: 'Usuário Bloqueado'
      };
    default:
      return {
        icon: <Activity className="h-5 w-5 text-gray-500" />,
        title: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      };
  }
};

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
                onClick={fetchAdminData}
                disabled={loading}
            >
                <Activity className="h-4 w-4 mr-2" />
                {loading ? 'Atualizando...' : 'Atualizar Dados'}
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
                  {activityLogs.length > 0 ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {activityLogs.map((log) => {
                        const activityDetails = renderActivityDetails(log.type);
                        return (
                          <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg bg-gray-50">
                            <div className="flex-shrink-0 mt-1">
                              {activityDetails.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">
                                {activityDetails.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {log.description}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDate(log.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                      <p className="text-sm font-medium mb-2">Nenhuma atividade recente</p>
                      <p className="text-xs">
                        Os logs de atividade aparecerão aqui quando houver movimentação no sistema.
                      </p>
                    </div>
                  )}
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
                    {reports.length > 0 ? (
                      <div className="space-y-3">
                        {/* Mostra este item apenas se houver anúncios denunciados */}
                        {reportedAdsCount > 0 && (
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                            <div className="flex items-center space-x-3">
                              <PawPrint className="h-4 w-4 text-yellow-500" />
                              <div>
                                <p className="text-sm font-medium">Anúncios denunciados</p>
                                <p className="text-xs text-gray-500">
                                  {reportedAdsCount} anúncio(s) para revisar
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setActiveTab("reports")}>
                              Revisar
                            </Button>
                          </div>
                        )}

                        {/* Mostra este item apenas se houver usuários denunciados */}
                        {reportedUsersCount > 0 && (
                          <div className="flex items-center justify-between p-3 border rounded-lg bg-red-50">
                            <div className="flex items-center space-x-3">
                              <Users className="h-4 w-4 text-red-500" />
                              <div>
                                <p className="text-sm font-medium">Usuários com denúncias</p>
                                <p className="text-xs text-gray-500">
                                  {reportedUsersCount} usuário(s) para revisar
                                </p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => setActiveTab("reports")}>
                              Revisar
                            </Button>
                          </div>
                        )}
                      </div>
                  ) : (
                    // Mensagem para quando não há denúncias
                    <div className="text-center py-4 text-gray-500">
                      <CheckCircle className="mx-auto h-10 w-10 text-green-400" />
                      <p className="mt-2 text-sm font-medium">Tudo em ordem!</p>
                      <p className="text-xs">Nenhum item requer atenção no momento.</p>
                    </div>
                  )}
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
                        <Button size="sm" variant="outline" onClick={() => onViewProfile(user.id)}
                          >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Perfil
                        </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              {user.status === "blocked" ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Desbloquear
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Ban className="h-4 w-4 mr-1" />
                                  Bloquear
                                </Button>
                              )}
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {user.status === "blocked"
                                    ? "Confirmar desbloqueio"
                                    : "Confirmar bloqueio"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {user.status === "blocked"
                                    ? "Tem certeza que deseja desbloquear este usuário? Ele poderá acessar novamente sua conta."
                                    : "Tem certeza que deseja bloquear este usuário? Ele não poderá acessar sua conta até ser desbloqueado."}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleUserAction(
                                      user.status === "blocked" ? "unblock" : "block",
                                      user.id
                                    )
                                  }
                                  className={
                                    user.status === "blocked"
                                      ? "bg-green-600 hover:bg-green-700"
                                      : "bg-red-600 hover:bg-red-700"
                                  }
                                >
                                  {user.status === "blocked" ? "Desbloquear" : "Bloquear"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

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
                          {translateSpecies(ad.species)} • {ad.breed} • {ad.age}
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
                        <Button size="sm" variant="outline" onClick={() => onViewDetails(ad.id)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes 
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
          
          {/* Contéudo das denuncias */}
          <TabsContent value="reports" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="h-5 w-5 mr-2 text-red-600" />
                  Gerenciar Denúncias Pendentes ({reports.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Verifica se existem denúncias para mostrar */}
                {reports.length > 0 ? (
                  <div className="space-y-4">
                    {/* Cria um card para cada denúncia encontrada */}
                    {reports.map((report) => (
                      <div key={report.id} className="p-4 border rounded-lg bg-white shadow-sm">
                        <div className="flex justify-between items-start">
                          {/* Lado esquerdo: Informações da denúncia */}
                          <div>
                            <p className="text-xs text-gray-500">
                              Denúncia de <span className="font-semibold text-gray-700">{report.reporter.name}</span> em {formatDate(report.created_at)}
                            </p>
                            <p className="my-2 text-gray-800">{report.reason}</p>
                            <div className="text-xs">
                              {report.reported_animal && (
                                <Badge variant="outline">
                                  Animal: {report.reported_animal.name}
                                </Badge>
                              )}
                              {report.reported_user && (
                                <Badge variant="outline" className="ml-1">
                                  Usuário: {report.reported_user.name}
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Lado direito: Botões de Ação */}
                          <div className="flex space-x-2 flex-shrink-0 ml-4">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Dispensar
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Dispensar denúncia?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação marcará a denúncia como dispensada, sem aplicar penalidades.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleReportAction(report.id, 'dismissed')}>
                                    Confirmar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Resolver
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Resolver denúncia?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Isso marcará a denúncia como resolvida. Lembre-se de tomar as ações necessárias (como bloquear o usuário ou remover o anúncio) separadamente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleReportAction(report.id, 'resolved')}>
                                    Confirmar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Mensagem exibida se não houver denúncias */
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400" />
                    <p className="mt-2 font-medium">Nenhuma denúncia pendente!</p>
                    <p className="text-sm">Ótimo trabalho mantendo a plataforma segura.</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}