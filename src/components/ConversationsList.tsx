import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  ArrowLeft,
  MessageCircle,
  User,
  Heart,
  Clock
} from "lucide-react";
import { api } from "../lib/api";
import type { Conversation } from "../types";

interface ConversationsListProps {
  onBack: () => void;
  onStartChat: (adopterId: string, animalId: string) => void;
}

export function ConversationsList({ onBack, onStartChat }: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      console.log('=== CONVERSATIONS LIST DEBUG ===');
      
      // Buscar o usuário atual para identificar o tipo
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      console.log('Current user in conversations list:', {
        id: user?.id,
        name: user?.name,
        type: user?.type,
        email: user?.email
      });
      
      const data = await api.getConversations();
      console.log('Conversations loaded in list:', data.length);
      data.forEach((conv, index) => {
        console.log(`Conversation ${index + 1} in list:`, {
          id: conv.id,
          animal_id: conv.animal_id,
          animal_name: conv.animal_name,
          adopter_id: conv.adopter_id,
          adopter_name: conv.adopter_name,
          advertiser_id: conv.advertiser_id,
          advertiser_name: conv.advertiser_name,
          isCurrentUserAdvertiser: user?.id === conv.advertiser_id,
          isCurrentUserAdopter: user?.id === conv.adopter_id,
          created_at: conv.created_at
        });
      });
      console.log('=== END CONVERSATIONS LIST DEBUG ===');
      
      setConversations(data);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      setError('Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando conversas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-6 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={loadConversations}>
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Minhas Conversas</h1>
              <p className="text-gray-600">Conversas sobre adoções de animais</p>
            </div>
          </div>
        </div>

        {/* Conversas */}
        {conversations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma conversa encontrada
              </h3>
              <p className="text-gray-600 mb-6">
                Você ainda não iniciou nenhuma conversa sobre adoção.
              </p>
              <Button onClick={onBack}>
                Buscar Animais
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Heart className="h-6 w-6 text-red-500" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Conversa sobre {conversation.animal_name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            Conversa com {currentUser?.id === conversation.advertiser_id 
                              ? conversation.adopter_name   // Se eu sou o anunciante, mostrar nome do adotante
                              : conversation.advertiser_name // Se eu sou o adotante, mostrar nome do anunciante
                            }
                          </span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(conversation.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={conversation.status === 'active' ? 'default' : 'outline'}
                          className={
                            conversation.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }
                        >
                          {conversation.status === 'active' ? 'Ativa' : 'Finalizada'}
                        </Badge>
                        
                        <Button
                          onClick={() => {
                            // Determinar o ID correto com base no tipo do usuário atual
                            const adopterId = currentUser?.id === conversation.advertiser_id 
                              ? conversation.adopter_id  // Se o usuário atual é o anunciante, usar o ID do adotante
                              : currentUser?.id;         // Se o usuário atual é o adotante, usar o próprio ID
                            
                            console.log('Opening chat:', {
                              currentUserId: currentUser?.id,
                              advertiserId: conversation.advertiser_id,
                              adopterId,
                              animalId: conversation.animal_id
                            });
                            
                            onStartChat(adopterId, conversation.animal_id);
                          }}
                          size="sm"
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Abrir Chat
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
