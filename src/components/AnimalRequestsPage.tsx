import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  ArrowLeft,
  MessageSquare,
  MapPin,
  Calendar,
  Check,
  X,
  Info,
  User,
  Clock
} from "lucide-react";
import { api } from "../lib/api";
import type { Animal, AdoptionRequest } from "../types";


interface AnimalRequestsPageProps {
  animalId: string;
  onBack: () => void;
  onStartChat: (adopterId: string, animalId: string) => void;
}

export function AnimalRequestsPage({ animalId, onBack, onStartChat }: AnimalRequestsPageProps) {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnimalAndRequests();
  }, [animalId]);

  const fetchAnimalAndRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar dados do animal
      console.log('Fetching animal data for ID:', animalId);
      const animalData = await api.getAnimal(animalId);
      setAnimal(animalData);
      console.log('Animal data retrieved:', animalData);
      
      // Buscar solicitações de adoção para este animal específico
      console.log('Fetching adoption requests for animal:', animalId);
      const animalRequests = await api.getAnimalAdoptionRequests(animalId);
      setRequests(animalRequests);
      console.log('Adoption requests retrieved:', animalRequests);
      
    } catch (err: any) {
      console.error('Error fetching animal and requests:', err);
      console.error('Error details:', err.message);
      setError(`Erro ao carregar dados: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await api.updateAdoptionRequest(requestId, { status: 'approved' });
      // Atualizar estado local
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved' as const }
          : req
      ));
    } catch (err: any) {
      console.error('Error accepting request:', err);
      alert('Erro ao aceitar solicitação. Tente novamente.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await api.updateAdoptionRequest(requestId, { status: 'rejected' });
      // Atualizar estado local
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected' as const }
          : req
      ));
    } catch (err: any) {
      console.error('Error rejecting request:', err);
      alert('Erro ao recusar solicitação. Tente novamente.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
      case 'accepted':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
      case 'accepted':
        return 'Aceita';
      case 'rejected':
        return 'Recusada';
      default:
        return 'Desconhecido';
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const processedRequests = requests.filter(r => r.status !== 'pending');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="mb-4 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Painel
            </Button>
          </div>
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando solicitações...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="mb-4 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Painel
            </Button>
          </div>
          <Card>
            <CardContent className="p-12 text-center">
              <X className="h-16 w-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Erro ao carregar dados
              </h3>
              <p className="text-gray-600 mb-4">
                {error || 'Animal não encontrado'}
              </p>
              <Button onClick={fetchAnimalAndRequests} variant="outline">
                Tentar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
        </div>

        {/* Informações do Animal */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <ImageWithFallback
                  src={animal.image_url || animal.image || '/default-pet.svg'}
                  alt={animal.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Solicitações para {animal.name}
                </h1>
                <p className="text-gray-600">
                  {animal.species === 'dog' ? '🐕 Cachorro' : 
                   animal.species === 'cat' ? '🐱 Gato' : 
                   animal.species === 'bird' ? '🐦 Pássaro' : 
                   animal.species === 'rabbit' ? '🐰 Coelho' : 
                   '🐾 ' + animal.species} • {animal.age} {animal.age === 1 ? 'ano' : 'anos'} • {
                   animal.size === 'small' ? 'Pequeno' : 
                   animal.size === 'medium' ? 'Médio' : 
                   animal.size === 'large' ? 'Grande' : 
                   animal.size
                  }
                </p>
                <div className="flex items-center mt-2">
                  <Badge className="bg-blue-100 text-blue-700">
                    {requests.length} solicitações total
                  </Badge>
                  {pendingRequests.length > 0 && (
                    <Badge className="ml-2 bg-yellow-100 text-yellow-700">
                      {pendingRequests.length} pendentes
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solicitações Pendentes */}
        {pendingRequests.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                Solicitações Pendentes ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-6 bg-white">
                    {/* Header da Solicitação */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.adopter_name || 'Adotante'}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            Localização não informada
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                        {request.hasChat && (
                          <Badge variant="outline" className="text-blue-600">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Chat ativo
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Email:</p>
                        <p className="text-sm text-gray-600">{request.adopter_email || 'Não informado'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Telefone:</p>
                        <p className="text-sm text-gray-600">{request.adopter_phone || 'Não informado'}</p>
                      </div>
                    </div>

                    {/* Mensagem */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Mensagem:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {request.message}
                      </p>
                    </div>

                    {/* Data da Solicitação */}
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <Calendar className="h-3 w-3 mr-1" />
                      Solicitação enviada em {new Date(request.created_at).toLocaleDateString('pt-BR')}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center space-x-3">
                      <Button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="bg-green-500 hover:bg-green-600 text-white"
                        size="sm"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Aceitar
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(request.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Recusar
                      </Button>
                      <Button
                        onClick={() => onStartChat(request.adopter_id, animalId)}
                        variant="outline"
                        size="sm"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Iniciar Chat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Solicitações Processadas */}
        {processedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitações Processadas ({processedRequests.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processedRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{request.adopter_name || 'Adotante'}</h4>
                          <p className="text-sm text-gray-500">{request.adopter_email || 'Email não informado'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                        <Button
                          onClick={() => onStartChat(request.adopter_id, animalId)}
                          variant="outline"
                          size="sm"
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Iniciar Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estado vazio */}
        {requests.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma solicitação ainda
              </h3>
              <p className="text-gray-600">
                Quando alguém demonstrar interesse no {animal.name}, as solicitações aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Informação */}
        <Alert className="mt-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Dica:</strong> Mantenha uma comunicação ativa com os interessados. 
            Use o chat para esclarecer dúvidas e conhecer melhor os candidatos antes de tomar uma decisão.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}