import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { api } from "../lib/api";

import { 
  ArrowLeft,
  Eye,
  MessageSquare,
  Check,
  X,
  Clock,
  Heart,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Filter
} from "lucide-react";

interface AdoptionRequest {
  id: string;
  adopterId: string;
  adopterName: string;
  adopterEmail: string;
  adopterPhone: string;
  animalId: string;
  animalName: string;
  animalPhoto: string;
  status: 'pending' | 'approved' | 'rejected';
  requestType: 'chat' | 'direct';
  message: string;
  submittedAt: string;
  adopterInfo?: {
    experience: string;
    livingSpace: string;
    familyComposition: string;
    workSchedule: string;
    hasOtherPets: string;
    availability: string;
  };
}

interface AdvertiserRequestsPanelProps {
  onBack: () => void;
  onViewRequest: (requestId: string) => void;
  onStartChat: (adopterId: string, animalId: string) => void;
}

export function AdvertiserRequestsPanel({ onBack, onViewRequest, onStartChat }: AdvertiserRequestsPanelProps) {
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [allRequests, setAllRequests] = useState<AdoptionRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar solicitações de adoção do banco
  useEffect(() => {
    async function fetchRequests() {
      try {
        setIsLoading(true);
        setError(null);
        const requests = await api.getAdvertiserAdoptionRequests();
        
        // Transformar dados da API para o formato esperado pelo componente
        const transformedRequests: AdoptionRequest[] = requests.map(request => ({
          id: request.id,
          adopterId: request.adopter_id,
          adopterName: request.adopter_name || 'Adotante',
          adopterEmail: request.adopter_email || '',
          adopterPhone: request.adopter_phone || '',
          animalId: request.animal_id,
          animalName: request.animal_name || 'Animal',
          animalPhoto: request.animal_image_url || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400',
          status: request.status,
          requestType: 'direct' as const, // Por enquanto, assumir todas como diretas
          message: request.message || 'Sem mensagem',
          submittedAt: request.created_at,
          // Por enquanto, não temos essas informações no banco
          adopterInfo: {
            experience: 'Não informado',
            livingSpace: 'Não informado',
            familyComposition: 'Não informado',
            workSchedule: 'Não informado',
            hasOtherPets: 'Não informado',
            availability: 'Não informado'
          }
        }));
        
        setAllRequests(transformedRequests);
      } catch (err: any) {
        console.error('Erro ao carregar solicitações:', err);
        setError(err.message || 'Erro ao carregar solicitações');
        setAllRequests([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequests();
  }, []);

  // Dados mock das solicitações (manter como fallback)
  const mockRequests: AdoptionRequest[] = [
    {
      id: "req1",
      adopterId: "adopter1",
      adopterName: "Maria Silva",
      adopterEmail: "maria@email.com",
      adopterPhone: "(11) 99999-1111",
      animalId: "1",
      animalName: "Buddy",
      animalPhoto: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
      status: "pending",
      requestType: "direct",
      message: "Olá! Tenho muito interesse em adotar o Buddy. Tenho experiência com cães e uma casa com quintal.",
      submittedAt: "2024-01-15T10:30:00",
      adopterInfo: {
        experience: "Já cuidei de 2 cães por 8 anos",
        livingSpace: "Casa com quintal grande",
        familyComposition: "Casal com 2 filhos (10 e 15 anos)",
        workSchedule: "Home office",
        hasOtherPets: "1 gato",
        availability: "Finais de semana e após 18h"
      }
    },
    {
      id: "req2",
      adopterId: "adopter2",
      adopterName: "João Santos",
      adopterEmail: "joao@email.com",
      adopterPhone: "(11) 88888-2222",
      animalId: "1",
      animalName: "Buddy",
      animalPhoto: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
      status: "pending",
      requestType: "chat",
      message: "Gostaria de saber mais sobre o temperamento do Buddy antes de fazer uma solicitação formal.",
      submittedAt: "2024-01-14T15:45:00"
    },
    {
      id: "req3",
      adopterId: "adopter3",
      adopterName: "Ana Costa",
      adopterEmail: "ana@email.com",
      adopterPhone: "(11) 77777-3333",
      animalId: "2",
      animalName: "Luna",
      animalPhoto: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop",
      status: "approved",
      requestType: "direct",
      message: "Sou apaixonada por gatos e gostaria muito de adotar a Luna.",
      submittedAt: "2024-01-13T09:15:00",
      adopterInfo: {
        experience: "Tenho gatos há 15 anos",
        livingSpace: "Apartamento grande com sacada telada",
        familyComposition: "Moro sozinha",
        workSchedule: "Meio período",
        hasOtherPets: "2 gatos",
        availability: "Qualquer dia da semana"
      }
    },
    {
      id: "req4",
      adopterId: "adopter4",
      adopterName: "Carlos Oliveira",
      adopterEmail: "carlos@email.com",
      adopterPhone: "(11) 66666-4444",
      animalId: "3",
      animalName: "Thor",
      animalPhoto: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop",
      status: "rejected",
      requestType: "direct",
      message: "Quero adotar o Thor para guarda da minha propriedade rural.",
      submittedAt: "2024-01-12T14:20:00",
      adopterInfo: {
        experience: "Não tenho experiência com cães grandes",
        livingSpace: "Fazenda",
        familyComposition: "Família com 4 pessoas",
        workSchedule: "Trabalho no campo",
        hasOtherPets: "Nenhum",
        availability: "Qualquer horário"
      }
    },
    {
      id: "req5",
      adopterId: "adopter5",
      adopterName: "Lucia Fernandes",
      adopterEmail: "lucia@email.com",
      adopterPhone: "(11) 55555-5555",
      animalId: "4",
      animalName: "Mimi",
      animalPhoto: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop",
      status: "pending",
      requestType: "direct",
      message: "Sou aposentada e gostaria de ter a companhia da Mimi.",
      submittedAt: "2024-01-11T11:00:00",
      adopterInfo: {
        experience: "Sempre tive gatos",
        livingSpace: "Apartamento pequeno",
        familyComposition: "Moro sozinha, aposentada",
        workSchedule: "Aposentada",
        hasOtherPets: "Nenhum",
        availability: "Sempre disponível"
      }
    }
  ];

  // Filtrar solicitações baseado na aba e filtro selecionados
  const filteredRequests = allRequests.filter(request => {
    let matchesTab = true;
    let matchesFilter = true;

    // Filtro por aba
    if (selectedTab !== "all") {
      matchesTab = request.status === selectedTab;
    }

    // Filtro adicional
    if (selectedFilter !== "all") {
      if (selectedFilter === "recent") {
        const requestDate = new Date(request.submittedAt);
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        matchesFilter = requestDate >= threeDaysAgo;
      } else if (selectedFilter === "direct") {
        matchesFilter = request.requestType === "direct";
      } else if (selectedFilter === "chat") {
        matchesFilter = request.requestType === "chat";
      }
    }

    return matchesTab && matchesFilter;
  });

  // Estatísticas
  const stats = {
    total: allRequests.length,
    pending: allRequests.filter(r => r.status === 'pending').length,
    approved: allRequests.filter(r => r.status === 'approved').length,
    rejected: allRequests.filter(r => r.status === 'rejected').length
  };

  // Agrupar por animal
  const requestsByAnimal = allRequests.reduce((acc, request) => {
    if (!acc[request.animalId]) {
      acc[request.animalId] = {
        animalName: request.animalName,
        animalPhoto: request.animalPhoto,
        requests: []
      };
    }
    acc[request.animalId].requests.push(request);
    return acc;
  }, {} as Record<string, { animalName: string; animalPhoto: string; requests: AdoptionRequest[] }>);

  const handleApproveRequest = async (approvedRequest: AdoptionRequest) => {
    const { id: approvedRequestId, animalId } = approvedRequest;

    const otherPendingRequests = allRequests.filter(req =>
      req.animalId === animalId &&
      req.status === 'pending' &&
      req.id !== approvedRequestId
    );

    try {
      console.log('entrou aqui')
      const updatePromises = [
        // 1. ATUALIZA O ANIMAL PARA 'ADOTADO' USANDO A SUA FUNÇÃO
        api.updateAnimal(animalId, { status: 'adopted' }),

        // 2. Aprova a solicitação escolhida
        api.updateAdoptionRequest(approvedRequestId, { status: 'approved' }),

        // 3. Rejeita as outras solicitações pendentes
        ...otherPendingRequests.map(req =>
          api.updateAdoptionRequest(req.id, { status: 'rejected' })
        ),
      ];

      await Promise.all(updatePromises);

      // Atualiza o estado local para refletir as mudanças na UI
      setAllRequests(prevRequests =>
        prevRequests.map(req => {
          if (req.id === approvedRequestId) {
            return { ...req, status: 'approved' as const };
          }
          if (req.animalId === animalId && req.id !== approvedRequestId) {
            return { ...req, status: 'rejected' as const };
          }
          return req;
        })
      );

      console.log('Adoção concluída com sucesso!');
      // TODO: Adicionar notificação de sucesso para o usuário

    } catch (err: any) {
      console.error('Erro ao processar a adoção:', err);
      // TODO: Adicionar notificação de erro para o usuário
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.updateAdoptionRequest(requestId, { status: 'rejected' });
      
      // Atualizar o estado local
      setAllRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status: 'rejected' as const }
          : request
      ));
      
      // Aqui você poderia mostrar uma notificação de sucesso
      console.log('Solicitação rejeitada!');
    } catch (err: any) {
      console.error('Erro ao rejeitar solicitação:', err);
      // Aqui você poderia mostrar uma notificação de erro
    }
  };

  const handleStartChat = async (adopterId: string, animalId: string) => {
    try {
      const conversation = await api.createConversation(animalId, adopterId);
      onStartChat(adopterId, animalId);
    } catch (err: any) {
      console.error('Erro ao iniciar chat:', err);
      // Aqui você poderia mostrar uma notificação de erro
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600">Aprovada</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rejeitada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getRequestTypeBadge = (type: string) => {
    return type === 'direct' ? 
      <Badge variant="secondary">Solicitação Direta</Badge> : 
      <Badge variant="secondary">Conversa</Badge>;
  };

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
            Voltar ao Painel
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Painel de Solicitações
              </h1>
              <p className="text-gray-600">
                Gerencie todas as solicitações de adoção dos seus animais
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="recent">Últimos 3 dias</SelectItem>
                  <SelectItem value="direct">Solicitações Diretas</SelectItem>
                  <SelectItem value="chat">Conversas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
              <div className="text-sm text-gray-600">Total de Solicitações</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.approved}</div>
              <div className="text-sm text-gray-600">Aprovadas</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">{stats.rejected}</div>
              <div className="text-sm text-gray-600">Rejeitadas</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Pendentes ({stats.pending})</TabsTrigger>
            <TabsTrigger value="approved">Aprovadas ({stats.approved})</TabsTrigger>
            <TabsTrigger value="rejected">Rejeitadas ({stats.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="space-y-6 mt-6">
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Heart className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Nenhuma solicitação encontrada
                  </h3>
                  <p className="text-gray-600">
                    {selectedTab === "all" 
                      ? "Você ainda não recebeu solicitações de adoção."
                      : `Não há solicitações ${selectedTab === "pending" ? "pendentes" : selectedTab === "approved" ? "aprovadas" : "rejeitadas"}.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Foto do Animal */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <ImageWithFallback
                            src={request.animalPhoto}
                            alt={request.animalName}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Informações Principais */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900 mb-1">
                                Solicitação para {request.animalName}
                              </h3>
                              <div className="flex items-center space-x-2 mb-2">
                                {getStatusBadge(request.status)}
                                {getRequestTypeBadge(request.requestType)}
                              </div>
                            </div>
                            
                            <div className="text-right text-sm text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(request.submittedAt)}
                              </div>
                            </div>
                          </div>

                          {/* Informações do Adotante */}
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>
                                  {request.adopterName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{request.adopterName}</p>
                                <p className="text-sm text-gray-500">{request.adopterEmail}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center text-sm text-gray-500">
                              <Phone className="h-4 w-4 mr-1" />
                              {request.adopterPhone}
                            </div>
                          </div>

                          {/* Mensagem */}
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {request.message}
                            </p>
                          </div>

                          {/* Ações */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              {request.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                    onClick={() => handleApproveRequest(request)}
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() => handleRejectRequest(request.id)}
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Rejeitar
                                  </Button>
                                </>
                              )}
                              
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleStartChat(request.adopterId, request.animalId)}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {request.requestType === 'chat' ? 'Conversar' : 'Iniciar Chat'}
                              </Button>
                            </div>
                            
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => onViewRequest(request.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Resumo por Animal */}
        {Object.keys(requestsByAnimal).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Animal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(requestsByAnimal).map(([animalId, data]) => (
                  <div key={animalId} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <ImageWithFallback
                        src={data.animalPhoto}
                        alt={data.animalName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{data.animalName}</p>
                      <p className="text-sm text-gray-500">
                        {data.requests.length} {data.requests.length === 1 ? 'solicitação' : 'solicitações'}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {data.requests.filter(r => r.status === 'pending').length} pendentes
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}