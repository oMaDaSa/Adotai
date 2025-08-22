import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  ArrowLeft,
  Check,
  X,
  MessageSquare,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Home,
  Users,
  Clock,
  Heart,
  PawPrint
} from "lucide-react";

interface RequestDetailsPageProps {
  requestId: string;
  onBack: () => void;
  onStartChat: (adopterId: string, animalId: string) => void;
}

export function RequestDetailsPage({ requestId, onBack, onStartChat }: RequestDetailsPageProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Dados mock da solicitação específica
  const request = {
    id: requestId,
    adopterId: "adopter1",
    adopterName: "Maria Silva",
    adopterEmail: "maria@email.com",
    adopterPhone: "(11) 99999-1111",
    animalId: "1",
    animalName: "Buddy",
    animalPhoto: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop",
    animalSpecies: "Cachorro",
    animalAge: "2 anos",
    animalSize: "Médio",
    status: "pending" as const,
    requestType: "direct" as const,
    message: "Olá! Tenho muito interesse em adotar o Buddy. Tenho experiência com cães e uma casa com quintal grande. Sempre quis ter um companheiro fiel e acredito que posso oferecer muito amor e cuidado para ele. Minha família está muito animada com a possibilidade de ter o Buddy conosco.",
    submittedAt: "2024-01-15T10:30:00",
    adopterInfo: {
      experience: "Já cuidei de 2 cães por 8 anos. Meu último cão viveu 12 anos e foi muito bem cuidado. Tenho conhecimento sobre cuidados básicos, alimentação adequada e a importância de exercícios regulares.",
      livingSpace: "Casa própria com quintal grande (300m²), murado e seguro. Há bastante espaço para o animal correr e brincar.",
      familyComposition: "Casal com 2 filhos (10 e 15 anos). Todos da família adoram animais e estão ansiosos para receber o Buddy.",
      workSchedule: "Trabalho em home office 4 dias por semana, então posso dedicar bastante tempo ao animal. Nos outros dias, trabalho meio período.",
      hasOtherPets: "Tenho 1 gato de 5 anos, muito dócil e que já conviveu bem com cães anteriormente.",
      availability: "Disponível nos finais de semana para visitas e durante a semana após 18h. Posso ser flexível conforme necessário."
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    // Simular processamento
    setTimeout(() => {
      setIsProcessing(false);
      alert("Solicitação aprovada com sucesso!");
    }, 2000);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    // Simular processamento
    setTimeout(() => {
      setIsProcessing(false);
      alert("Solicitação rejeitada.");
    }, 2000);
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
            Voltar às Solicitações
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Detalhes da Solicitação
              </h1>
              <div className="flex items-center space-x-2">
                {getStatusBadge(request.status)}
                <Badge variant="secondary">
                  {request.requestType === 'direct' ? 'Solicitação Direta' : 'Conversa'}
                </Badge>
              </div>
            </div>
            
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(request.submittedAt)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informações do Animal */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PawPrint className="h-5 w-5 mr-2" />
                  Animal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="w-32 h-32 rounded-lg overflow-hidden mx-auto mb-3">
                    <ImageWithFallback
                      src={request.animalPhoto}
                      alt={request.animalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{request.animalName}</h3>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Espécie:</span>
                    <span className="font-medium">{request.animalSpecies}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Idade:</span>
                    <span className="font-medium">{request.animalAge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Porte:</span>
                    <span className="font-medium">{request.animalSize}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes da Solicitação */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Adotante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Informações do Adotante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {request.adopterName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{request.adopterName}</h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <Mail className="h-4 w-4 mr-1" />
                      {request.adopterEmail}
                    </div>
                    <div className="flex items-center text-gray-600 mt-1">
                      <Phone className="h-4 w-4 mr-1" />
                      {request.adopterPhone}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mensagem Inicial */}
            <Card>
              <CardHeader>
                <CardTitle>Mensagem do Adotante</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">{request.message}</p>
                </div>
              </CardContent>
            </Card>

            {/* Informações Detalhadas */}
            {request.requestType === 'direct' && request.adopterInfo && (
              <Card>
                <CardHeader>
                  <CardTitle>Informações Detalhadas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <Heart className="h-4 w-4 mr-2 text-red-500" />
                      <h4 className="font-semibold text-gray-900">Experiência com Animais</h4>
                    </div>
                    <p className="text-gray-700 ml-6">{request.adopterInfo.experience}</p>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center mb-2">
                      <Home className="h-4 w-4 mr-2 text-blue-500" />
                      <h4 className="font-semibold text-gray-900">Tipo de Moradia</h4>
                    </div>
                    <p className="text-gray-700 ml-6">{request.adopterInfo.livingSpace}</p>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center mb-2">
                      <Users className="h-4 w-4 mr-2 text-green-500" />
                      <h4 className="font-semibold text-gray-900">Composição Familiar</h4>
                    </div>
                    <p className="text-gray-700 ml-6">{request.adopterInfo.familyComposition}</p>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-purple-500" />
                      <h4 className="font-semibold text-gray-900">Rotina de Trabalho</h4>
                    </div>
                    <p className="text-gray-700 ml-6">{request.adopterInfo.workSchedule}</p>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center mb-2">
                      <PawPrint className="h-4 w-4 mr-2 text-orange-500" />
                      <h4 className="font-semibold text-gray-900">Outros Animais</h4>
                    </div>
                    <p className="text-gray-700 ml-6">{request.adopterInfo.hasOtherPets}</p>
                  </div>

                  <Separator />

                  <div>
                    <div className="flex items-center mb-2">
                      <Calendar className="h-4 w-4 mr-2 text-indigo-500" />
                      <h4 className="font-semibold text-gray-900">Disponibilidade para Visita</h4>
                    </div>
                    <p className="text-gray-700 ml-6">{request.adopterInfo.availability}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ações */}
            {request.status === 'pending' && (
              <Card>
                <CardHeader>
                  <CardTitle>Ações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      className="bg-green-500 hover:bg-green-600 text-white flex-1"
                      onClick={handleApprove}
                      disabled={isProcessing}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {isProcessing ? 'Processando...' : 'Aprovar Solicitação'}
                    </Button>
                    
                    <Button 
                      variant="outline"
                      className="text-red-600 border-red-600 hover:bg-red-50 flex-1"
                      onClick={handleReject}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejeitar Solicitação
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => onStartChat(request.adopterId, request.animalId)}
                      className="flex-1"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Iniciar Conversa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {request.status === 'approved' && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center text-green-700">
                    <Check className="h-6 w-6 mr-2" />
                    <span className="font-semibold">Solicitação Aprovada</span>
                  </div>
                  <p className="text-center text-green-600 mt-2">
                    Esta solicitação foi aprovada. Entre em contato com o adotante para prosseguir com o processo.
                  </p>
                  <div className="flex justify-center mt-4">
                    <Button 
                      variant="outline"
                      onClick={() => onStartChat(request.adopterId, request.animalId)}
                      className="border-green-600 text-green-600 hover:bg-green-50"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Conversar com Adotante
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {request.status === 'rejected' && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center text-red-700">
                    <X className="h-6 w-6 mr-2" />
                    <span className="font-semibold">Solicitação Rejeitada</span>
                  </div>
                  <p className="text-center text-red-600 mt-2">
                    Esta solicitação foi rejeitada.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}