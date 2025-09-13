import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  translateSpecies,
  translateSize,
  translateGender,
} from "../utils/translate";
import { 
  ArrowLeft,
  Send,
  User,
  Heart,
  Calendar,
  CheckCheck,
  Info,
  MessageCircle
} from "lucide-react";
import { api } from "../lib/api";
import type { Message as MessageType, Animal, User as UserType } from "../types";

interface ChatPageProps {
  adopterId: string;
  animalId: string;
  currentUserId: string;
  currentUserType: 'adopter' | 'advertiser';
  onViewProfile: (userId: string) => void;
  onBack: () => void;
}

export function ChatPage({ adopterId, animalId, currentUserId, currentUserType, onBack, onViewProfile }: ChatPageProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [adopter, setAdopter] = useState<UserType | null>(null);
  const [advertiser, setAdvertiser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserProfileId, setCurrentUserProfileId] = useState<string | null>(null);
  const [actualCurrentUserType, setActualCurrentUserType] = useState<'adopter' | 'advertiser' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatData();
  }, [adopterId, animalId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar o perfil do usuário atual para obter o ID correto
      const currentUser = await api.getCurrentUser();
      if (currentUser) {
        setCurrentUserProfileId(currentUser.id);
        console.log('Current user profile ID:', currentUser.id);
      }

      // Carregar animal
      const animalData = await api.getAnimal(animalId);
      setAnimal(animalData);

      // Carregar dados do anunciante
      const advertiserData = await api.getUser(animalData.advertiser_id);
      setAdvertiser(advertiserData);

      // Determinar o tipo real do usuário atual e o ID correto do adotante
      let actualAdopterId = adopterId;
      let userType: 'adopter' | 'advertiser' = 'adopter';
      
      // Se o usuário atual é o anunciante do animal
      if (currentUser && currentUser.id === animalData.advertiser_id) {
        userType = 'advertiser';
        // O adopterId vem do parâmetro (correto)
        actualAdopterId = adopterId;
        console.log('Current user is the advertiser');
      } else {
        // O usuário atual é o adotante
        userType = 'adopter';
        actualAdopterId = currentUser?.id || adopterId;
        console.log('Current user is the adopter');
      }
      
      setActualCurrentUserType(userType);
      console.log('Determined user type:', userType);
      console.log('Using adopter ID:', actualAdopterId);
      
      // Carregar dados do adotante
      const adopterData = await api.getUser(actualAdopterId);
      setAdopter(adopterData);

      // Criar ou buscar conversa
      console.log('Creating conversation with:', {
        animalId,
        advertiserId: animalData.advertiser_id,
        adopterId: actualAdopterId
      });
      
      const newConversation = await api.createConversation(animalId, animalData.advertiser_id);
      setConversation(newConversation);

      // Carregar mensagens
      const messagesData = await api.getMessages(newConversation.id);
      console.log('Messages loaded:', messagesData);
      setMessages(messagesData);

    } catch (error: any) {
      console.error('Error loading chat data:', error);
      setError(`Erro ao carregar conversa: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation) return;

    try {
      const message = await api.sendMessage(conversation.id, newMessage);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError('Erro ao enviar mensagem');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR');
  };

  const isCurrentUser = (senderId: string) => {
    // Usar o ID do perfil para comparar com o sender_id das mensagens
    const profileIdToCompare = currentUserProfileId || currentUserId;
    const isMyMessage = senderId === profileIdToCompare;
    
    console.log('Message comparison:', {
      senderId,
      currentUserProfileId,
      currentUserId,
      profileIdToCompare,
      isMyMessage,
      actualCurrentUserType,
      adopterName: adopter?.name,
      advertiserName: advertiser?.name
    });
    
    return isMyMessage;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando conversa...</p>
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
              <Button onClick={loadChatData}>
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!animal || !adopter || !advertiser || !conversation) {
    return null;
  }

  const otherUser = actualCurrentUserType === 'adopter' ? advertiser : adopter;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
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
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-sm border h-[calc(100vh-200px)] flex flex-col">
          {/* Chat Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 
                    className="font-semibold text-gray-900 cursor-pointer hover:underline"
                    onClick={() => onViewProfile(otherUser.id)}
                  >
                    {otherUser.name}
                  </h3>
                  <p className="text-sm text-gray-500">Conversa sobre {animal.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <ImageWithFallback
                    src={animal.image_url || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400'}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Badge variant="outline" className="text-blue-600">
                  <Heart className="h-3 w-3 mr-1" />
                  {animal.name}
                </Badge>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <Info className="h-4 w-4" />
              <span>
                Conversa iniciada em {formatDate(conversation.created_at)} sobre a adoção de {animal.name}
              </span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!</p>
              </div>
            ) : (
              <>
                <div className="text-center text-xs text-gray-500 mb-4">
                  Total de mensagens: {messages.length}
                </div>
                {messages.map((message) => {
                  const isMine = isCurrentUser(message.sender_id);
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-xs lg:max-w-md">
                        {/* Debug info - pode ser removido depois */}
                        <div className="text-xs text-gray-400 mb-1">
                          {isMine ? 'Você' : (actualCurrentUserType === 'adopter' ? advertiser?.name : adopter?.name)} - ID: {message.sender_id}
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isMine
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end mt-1 space-x-1 ${
                            isMine ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <span className="text-xs">{formatTime(message.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Pressione Enter para enviar • Shift + Enter para quebrar linha
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Informações do Animal</h4>
              <div className="space-y-1 text-sm">
                <p><strong>Nome:</strong> {animal.name}</p>
                <p><strong>Espécie:</strong> {translateSpecies(animal.species)}</p>
                <p><strong>Raça:</strong> {animal.breed || 'Não informado'}</p>
                <p><strong>Idade:</strong> {animal.age} anos</p>
                <p><strong>Porte:</strong> {translateSize(animal.size)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                {actualCurrentUserType === 'adopter' ? 'Anunciante' : 'Adotante'}
              </h4>
              <div className="space-y-1 text-sm">
                <p><strong>Nome:</strong> {actualCurrentUserType === 'adopter' ? advertiser.name : adopter.name}</p>
                <p><strong>Email:</strong> {actualCurrentUserType === 'adopter' ? advertiser.email : adopter.email}</p>
                {(actualCurrentUserType === 'adopter' ? advertiser.phone : adopter.phone) && (
                  <p><strong>Telefone:</strong> {actualCurrentUserType === 'adopter' ? advertiser.phone : adopter.phone}</p>
                )}
                <p><strong>Conversa desde:</strong> {formatDate(conversation.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
