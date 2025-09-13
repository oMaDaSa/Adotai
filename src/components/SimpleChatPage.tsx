import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  ArrowLeft,
  Send,
  User,
  Heart,
  MessageCircle,
  Info
} from "lucide-react";
import { messaging, type SimpleMessage, type SimpleConversation } from "../lib/messaging";
import { api } from "../lib/api";

interface SimpleChatPageProps {
  conversationId: string;
  onBack: () => void; 
  onViewProfile: (userId: string) => void;
}

export function SimpleChatPage({ conversationId, onBack, onViewProfile }: SimpleChatPageProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<SimpleMessage[]>([]);
  const [conversation, setConversation] = useState<SimpleConversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatData();
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Carregando dados do chat...');

      // Buscar usuário atual
      const user = await api.getCurrentUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      setCurrentUser(user);
      console.log('👤 Usuário atual:', user.name, user.id);

      // Buscar dados da conversa
      const conversationData = await messaging.getConversation(conversationId);
      if (!conversationData) {
        throw new Error('Conversa não encontrada');
      }
      
      setConversation(conversationData);
      console.log('💬 Conversa carregada:', conversationData.animal_name);

      // Buscar mensagens
      const messagesData = await messaging.getMessages(conversationId);
      setMessages(messagesData);
      console.log('📨 Mensagens carregadas:', messagesData.length);
      console.log('📨 Dados das mensagens:', messagesData);

    } catch (error: any) {
      console.error('❌ Erro ao carregar chat:', error);
      setError(error.message || 'Erro ao carregar conversa');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !conversation || sending) return;

    try {
      setSending(true);
      console.log('📤 Enviando mensagem...');

      const message = await messaging.sendMessage(
        conversationId, 
        currentUser.id, 
        newMessage.trim()
      );

      console.log('✅ Mensagem enviada:', message.id);
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
    } catch (error: any) {
      console.error('❌ Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem: ' + error.message);
    } finally {
      setSending(false);
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

  const isMyMessage = (message: SimpleMessage): boolean => {
    return currentUser && message.sender_id === currentUser.id;
  };

  const getOtherUserName = (): string => {
    if (!currentUser || !conversation) return 'Usuário';
    
    if (currentUser.id === conversation.adopter_id) {
      return conversation.advertiser_name;
    } else {
      return conversation.adopter_name;
    }
  };

  const getOtherUserId = (): string | null => {
    if (!currentUser || !conversation) return null;
    
    // Se o usuário atual é o adotante, retorne o ID do anunciante.
    if (currentUser.id === conversation.adopter_id) {
      return conversation.advertiser_id;
    } 
    // Senão, retorne o ID do adotante.
    else {
      return conversation.adopter_id;
    }
  };

  const getMyRole = (): string => {
    if (!currentUser || !conversation) return '';
    
    if (currentUser.id === conversation.adopter_id) {
      return 'Interessado em adotar';
    } else {
      return 'Anunciante';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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

  if (!conversation) {
    return null;
  }

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
                    onClick={() => {
                      const otherUserId = getOtherUserId();
                      if (otherUserId) {
                        onViewProfile(otherUserId);
                      }
                    }}
                  >
                    {getOtherUserName()}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Conversa sobre {conversation.animal_name}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <ImageWithFallback
                    src={conversation.animal_image || '/default-pet.jpg'}
                    alt={conversation.animal_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Badge variant="outline" className="text-blue-600">
                  <Heart className="h-3 w-3 mr-1" />
                  {conversation.animal_name}
                </Badge>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="p-4 bg-blue-50 border-b">
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <Info className="h-4 w-4" />
              <span>
                Conversa iniciada em {formatDate(conversation.created_at)} • {getMyRole()}
              </span>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
                </p>
              </div>
            ) : (
              <>
                {messages.map((message) => {
                  const isMine = isMyMessage(message);
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="max-w-xs lg:max-w-md">
                        <div className="text-xs text-gray-500 mb-1">
                          {isMine ? 'Você' : message.sender_name} • {formatTime(message.created_at)}
                        </div>
                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isMine
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
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
                disabled={sending}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
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

        {/* Animal Info Card */}
        <div className="mt-6">
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 mb-2">
                Informações do {conversation.animal_name}
              </h4>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                  <ImageWithFallback
                    src={conversation.animal_image || '/default-pet.jpg'}
                    alt={conversation.animal_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{conversation.animal_name}</p>
                  <p className="text-sm text-gray-600">
                    Conversa entre {conversation.adopter_name} e {conversation.advertiser_name}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
