import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  Heart, 
  ArrowLeft,
  Eye,
  MessageSquare,
  Calendar,
  MapPin,
  Plus,
  Settings
} from "lucide-react";
import { api } from "../lib/api";
import type { Animal, User, AdoptionRequest } from "../types";

// Declarar tipo para a função global
declare global {
  interface Window {
    __refreshAdvertiserData?: () => void;
  }
}

interface AdvertiserProfilePageProps {
  onBack: () => void;
  onRegisterAnimal: () => void;
  onViewRequests: (animalId: string) => void;
  onViewAllRequests?: () => void;
  user: User;
}

interface AnimalWithRequests extends Animal {
  requestsCount: number;
}

export function AdvertiserProfilePage({ onBack, onRegisterAnimal, onViewRequests, onViewAllRequests, user }: AdvertiserProfilePageProps) {
  const [animals, setAnimals] = useState<AnimalWithRequests[]>([]);
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdvertiserData();
  }, []);
  

  // Função pública para recarregar dados
  const refreshData = () => {
    fetchAdvertiserData();
  };

  // Exposer função para o componente pai
  useEffect(() => {
    // Definir a função global para recarregar dados após cadastro
    window.__refreshAdvertiserData = refreshData;
    
    // Limpar a função quando o componente for desmontado
    return () => {
      window.__refreshAdvertiserData = undefined;
    };
  }, []);

  const fetchAdvertiserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar todos os animais do banco
      const allAnimals = await api.getAnimals();
      // Filtrar apenas os animais do usuário atual
      const userAnimals = allAnimals.filter(animal => animal.advertiser_id === user.id);
      
      // Buscar solicitações para calcular contadores
      const allRequests = await api.getAdvertiserAdoptionRequests();
      setAdoptionRequests(allRequests);
      
      // Contar solicitações por animal
      const animalsWithRequests: AnimalWithRequests[] = userAnimals.map(animal => {
        const requestsForAnimal = allRequests.filter(request => request.animal_id === animal.id);
        return {
          ...animal,
          requestsCount: requestsForAnimal.length
        };
      });
      
      setAnimals(animalsWithRequests);
      
    } catch (err) {
      console.error('Error fetching advertiser data:', err);
      setError('Erro ao carregar seus dados');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'adopted':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponível';
      case 'pending':
        return 'Em processo';
      case 'adopted':
        return 'Adotado';
      default:
        return 'Desconhecido';
    }
  };

  const totalAnimals = animals.length;
  const totalRequests = adoptionRequests.length;
  const availableAnimals = animals.filter(a => a.status === 'available').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando seus animais...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAdvertiserData} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Olá, {user.name}!
              </h1>
              <p className="text-gray-600">
                Gerencie seus animais e solicitações de adoção
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                onClick={onRegisterAnimal}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Animal
              </Button>
              {onViewAllRequests && (
                <Button
                  onClick={onViewAllRequests}
                  variant="outline"
                  className="text-blue-600 border-blue-600 hover:bg-blue-50"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Painel de Solicitações
                </Button>
              )}
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Animais</p>
                  <p className="text-2xl font-bold text-gray-900">{totalAnimals}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Disponíveis</p>
                  <p className="text-2xl font-bold text-green-600">{availableAnimals}</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Solicitações</p>
                  <p className="text-2xl font-bold text-blue-600">{totalRequests}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        {onViewAllRequests && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Button
                  onClick={onViewAllRequests}
                  variant="outline"
                  className="h-16 text-left p-4 hover:bg-blue-50 border-blue-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Painel de Solicitações</p>
                      <p className="text-sm text-gray-600">Veja todas as solicitações em um só lugar</p>
                    </div>
                  </div>
                </Button>
                
                <Button
                  onClick={onRegisterAnimal}
                  variant="outline"
                  className="h-16 text-left p-4 hover:bg-green-50 border-green-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Plus className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Cadastrar Animal</p>
                      <p className="text-sm text-gray-600">Adicione um novo animal para adoção</p>
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Animais */}
        <Card>
          <CardHeader>
            <CardTitle>Meus Animais Cadastrados</CardTitle>
          </CardHeader>
          <CardContent>
            {animals.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum animal cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Comece cadastrando seu primeiro animal para adoção
                </p>
                <Button
                  onClick={onRegisterAnimal}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Animal
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {animals.map((animal) => (
                  <div
                    key={animal.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Foto do Animal */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={animal.image_url || '/default-pet.jpg'}
                        alt={animal.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Informações do Animal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{animal.name}</h3>
                        <Badge className={getStatusColor(animal.status)}>
                          {getStatusText(animal.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {animal.species === 'dog' ? 'Cachorro' : animal.species === 'cat' ? 'Gato' : animal.species} • 
                        {animal.age ? `${animal.age} anos` : 'Idade não informada'} • 
                        {animal.size === 'small' ? 'Pequeno' : animal.size === 'medium' ? 'Médio' : animal.size === 'large' ? 'Grande' : animal.size || 'Porte não informado'}
                      </p>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {animal.advertiser_address || user.address || 'Localização não informada'}
                        <Calendar className="h-3 w-3 ml-4 mr-1" />
                        {new Date(animal.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>

                    {/* Solicitações */}
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <MessageSquare className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="font-semibold text-blue-600">
                          {animal.requestsCount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">solicitações</p>
                    </div>

                    {/* Ações */}
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => onViewRequests(animal.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Solicitações
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}