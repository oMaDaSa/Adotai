import { useState } from 'react';
import { useRouter } from 'next/router';
import { startConversation } from '../lib/chat-helper';

export function useStartConversation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const initiateConversation = async (animalId: string, advertiserId: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Iniciando conversa via hook...', { animalId, advertiserId });
      
      const conversationId = await startConversation(animalId, advertiserId);
      
      console.log('✅ Conversa iniciada, redirecionando para chat:', conversationId);
      
      // Redirecionar para a página de chat
      router.push(`/chat/${conversationId}`);
      
    } catch (err: any) {
      console.error('❌ Erro ao iniciar conversa:', err);
      setError(err.message || 'Erro ao iniciar conversa');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    initiateConversation,
    loading,
    error,
    clearError
  };
}
