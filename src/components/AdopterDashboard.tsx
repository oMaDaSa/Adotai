import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  ArrowLeft,
  Heart,
  MessageCircle,
  Clock,
  CheckCircle,
  Calendar,
  User as UserIcon,
  HeartHandshake,
  Activity
} from "lucide-react";
import { api } from "../lib/api";
import type { User, AdoptionRequest, Conversation } from "../types";

interface AdopterDashboardProps {
  onBack: () => void;
  onStartChat: (adopterId: string, animalId: string) => void;
  user: User;
}

export function AdopterDashboard({ onBack, onStartChat, user }: AdopterDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [conversationsData, requestsData] = await Promise.all([
        api.getConversations(),
        api.getAdoptionRequests()
      ]);

      setConversations(conversationsData);
      setAdoptionRequests(requestsData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Erro ao carregar dados do painel');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ontem';
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRequestStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-700">Aprovado</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-700">Negado</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-700">Concluído</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const stats = {
    activeConversations: conversations.filter(c => c.status === 'active').length,
    pendingRequests: adoptionRequests.filter(r => r.status === 'pending').length,
    totalRequests: adoptionRequests.length
  };

  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent adoption requests
    adoptionRequests.slice(0, 3).forEach(request => {
      let icon = Clock;
      let color = 'text-yellow-500';
      let message = 'Pedido enviado';
      
      if (request.status === 'approved') {
        icon = CheckCircle;
        color = 'text-green-500';
        message = 'Pedido aprovado!';
      }
      
      activities.push({
        icon,
        color,
        title: message,
        description: `${request.status === 'pending' ? 'Você enviou um pedido de adoção para' : 'Pedido para adotar'} ${request.animal_name}`,
        time: formatDate(request.updated_at || request.created_at),
        date: request.updated_at || request.created_at
      });
    });

    // Sort by most recent
    return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  };

  const getNextSteps = () => {
    const steps = [];
    
    // Approved requests with scheduled visits
    const approvedWithVisit = adoptionRequests.filter(r => r.status === 'approved' && r.scheduled_visit);
    approvedWithVisit.forEach(request => {
      steps.push({
        type: 'visit',
        title: 'Visita agendada',
        description: `Encontro com ${request.animal_name} - ${request.advertiser_name}`,
        time: request.scheduled_visit ? formatFullDate(request.scheduled_visit) : '',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        timeColor: 'text-green-500'
      });
    });

    // Pending requests
    const pendingRequests = adoptionRequests.filter(r => r.status === 'pending');
    pendingRequests.slice(0, 2).forEach(request => {
      const daysSinceRequest = Math.floor((new Date().getTime() - new Date(request.created_at).getTime()) / (1000 * 60 * 60 * 24));
      steps.push({
        type: 'pending',
        title: 'Aguardando resposta',
        description: `${request.advertiser_name} está analisando seu pedido para ${request.animal_name}`,
        time: `Enviado há ${daysSinceRequest} ${daysSinceRequest === 1 ? 'dia' : 'dias'}`,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        timeColor: 'text-yellow-500'
      });
    });

    return steps.slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando seu painel...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData} variant="outline">
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
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Olá, {user.name}!
              </h1>
              <p className="text-gray-600">
                Acompanhe suas adoções e conecte-se com animais especiais
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conversas Ativas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeConversations}</p>
                </div>
                <MessageCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pedidos Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Pedidos</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
                </div>
                <UserIcon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="conversations">Conversas</TabsTrigger>
            <TabsTrigger value="requests">Pedidos</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getRecentActivity().length > 0 ? (
                      getRecentActivity().map((activity, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                          <activity.icon className={`h-5 w-5 ${activity.color} mt-0.5`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <p className="text-xs text-gray-500">{activity.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">Nenhuma atividade recente</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Próximos Passos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getNextSteps().length > 0 ? (
                      getNextSteps().map((step, index) => (
                        <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${step.bgColor} border ${step.borderColor}`}>
                          <Calendar className={`h-4 w-4 ${step.timeColor} mt-0.5`} />
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${step.textColor}`}>{step.title}</p>
                            <p className={`text-xs ${step.textColor.replace('800', '600')}`}>{step.description}</p>
                            <p className={`text-xs ${step.timeColor} mt-1`}>{step.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">Nenhuma ação pendente</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Conversas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversations.length > 0 ? (
                    conversations.map((conversation) => (
                      <div key={conversation.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                          <Heart className="h-8 w-8 text-red-400" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-medium">{conversation.animal_name}</h3>
                            <Badge variant={conversation.status === 'completed' ? 'default' : 'outline'}>
                              {conversation.status === 'active' ? 'Ativa' : 
                               conversation.status === 'completed' ? 'Concluída' : 'Fechada'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            com {conversation.advertiser_name}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Criada em {formatDate(conversation.created_at)}
                          </p>
                        </div>
                        
                        <Button 
                          size="sm"
                          onClick={() => onStartChat(conversation.advertiser_id, conversation.animal_id)}
                          disabled={conversation.status === 'closed'}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {conversation.status === 'completed' ? 'Ver Conversa' : 'Conversar'}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Você ainda não iniciou nenhuma conversa</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Meus Pedidos de Adoção</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {adoptionRequests.length > 0 ? (
                    adoptionRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                            <Heart className="h-8 w-8 text-red-400" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-medium">{request.animal_name}</h3>
                              {getRequestStatusBadge(request.status)}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              Anunciante: {request.advertiser_name}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">
                              Pedido enviado em: {formatFullDate(request.created_at)}
                            </p>
                            
                            {request.status_message && (
                              <div className={`p-3 rounded-lg mt-3 ${
                                request.status === 'approved' ? 'bg-green-50 border border-green-200' :
                                request.status === 'rejected' ? 'bg-red-50 border border-red-200' :
                                'bg-yellow-50 border border-yellow-200'
                              }`}>
                                <p className="text-sm">{request.status_message}</p>
                              </div>
                            )}
                            
                            {request.scheduled_visit && request.status === 'approved' && (
                              <div className="flex items-center space-x-2 mt-3 p-3 bg-blue-50 rounded-lg">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                <span className="text-sm text-blue-700">
                                  Visita agendada: {formatFullDate(request.scheduled_visit)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col space-y-2">
                            {request.status === 'approved' && (
                              <Button 
                                size="sm"
                                onClick={() => onStartChat(request.advertiser_id, request.animal_id)}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Conversar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">Você ainda não fez nenhum pedido de adoção</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}