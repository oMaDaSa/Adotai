import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { MessageCircle, TestTube } from 'lucide-react';
import { useStartConversation } from '../hooks/useStartConversation';

export function ChatTestButton() {
  const { initiateConversation, loading, error } = useStartConversation();
  const [showCard, setShowCard] = useState(false);

  // IDs de teste (você precisa ajustar estes para animais e usuários reais do seu banco)
  const testAnimalId = 'test-animal-1';
  const testAdvertiserId = 'test-advertiser-1';

  const handleTest = () => {
    console.log('🧪 Iniciando teste do sistema de chat...');
    initiateConversation(testAnimalId, testAdvertiserId);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setShowCard(!showCard)}
        className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg"
        size="sm"
      >
        <TestTube className="h-4 w-4 mr-2" />
        Teste Chat
      </Button>

      {showCard && (
        <Card className="absolute bottom-12 right-0 w-80 shadow-xl">
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <MessageCircle className="h-4 w-4 mr-2 text-purple-600" />
              Teste do Sistema de Chat
            </h3>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Clique para testar o sistema de conversas:
              </p>

              {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="flex space-x-2">
                <Button
                  onClick={handleTest}
                  disabled={loading}
                  size="sm"
                  className="flex-1"
                >
                  {loading ? 'Testando...' : 'Testar Chat'}
                </Button>
                <Button
                  onClick={() => setShowCard(false)}
                  variant="outline"
                  size="sm"
                >
                  Fechar
                </Button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>✅ Testa criação de conversa</p>
                <p>✅ Testa navegação para chat</p>
                <p>✅ Testa autenticação</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
