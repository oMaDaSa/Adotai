import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  ArrowLeft,
  MessageCircle,
  Heart,
  Clock,
  User
} from "lucide-react";
import { messaging, type SimpleConversation } from "../lib/messaging";
import { api } from "../lib/api";

interface SimpleConversationsListProps {
  onBack: () => void;
  onSelectConversation: (conversationId: string) => void;
}

export function SimpleConversationsList({ onBack, onSelectConversation }: SimpleConversationsListProps) {
  const [conversations, setConversations] = useState<SimpleConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando conversas...');
      
      // Buscar usuário atual
      const user = await api.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      setCurrentUser(user);
      console.log('👤 Usuário atual:', user.name, user.id);
      
      // Buscar conversas usando o novo serviço
      const data = await messaging.getConversations(user.id);
      
      console.log('💬 Conversas carregadas:', data.length);
      setConversations(data);
      
    } catch (error: any) {
      console.error('❌ Erro ao carregar conversas:', error);
      setError(error.message || 'Erro ao carregar conversas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Hoje';
    } else if (diffDays === 2) {
      return 'Ontem';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} dias atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  const getOtherUserName = (conversation: SimpleConversation): string => {
    if (!currentUser) return 'Usuário';
    
    if (currentUser.id === conversation.adopter_id) {
      // Se eu sou o adotante, mostrar nome do anunciante
      return conversation.advertiser_name;
    } else {
      // Se eu sou o anunciante, mostrar nome do adotante
      return conversation.adopter_name;
    }
  };

  const getUserRole = (conversation: SimpleConversation): string => {
    if (!currentUser) return '';
    
    if (currentUser.id === conversation.adopter_id) {
      return 'Você está interessado em adotar';
    } else {
      return 'Interessado no seu animal';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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
              <Card key={conversation.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent 
                  className="p-6"
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-center space-x-4">
                    {/* Imagem do Animal */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <ImageWithFallback
                        src={conversation.animal_image || '/default-pet.jpg'}
                        alt={conversation.animal_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Informações da Conversa */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.animal_name}
                        </h3>
                        {conversation.last_message_date && (
                          <span className="text-xs text-gray-500">
                            {formatDate(conversation.last_message_date)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {getOtherUserName(conversation)}
                        </span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">
                          {getUserRole(conversation)}
                        </span>
                      </div>
                      
                      {conversation.last_message && (
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.last_message}
                        </p>
                      )}
                      
                      {!conversation.last_message && (
                        <p className="text-sm text-gray-400 italic">
                          Nenhuma mensagem ainda
                        </p>
                      )}
                    </div>
                    
                    {/* Indicadores */}
                    <div className="flex flex-col items-end space-y-1">
                      {conversation.unread_count > 0 && (
                        <div className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {conversation.unread_count}
                        </div>
                      )}
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Clock className="h-3 w-3" />
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
