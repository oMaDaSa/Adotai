import { messaging } from './messaging';
import { api } from './api';

/**
 * Iniciar uma conversa entre um adotante e um anunciante sobre um animal
 */
export async function startConversation(animalId: string, advertiserId: string): Promise<string> {
  console.log('🚀 Iniciando conversa...', { animalId, advertiserId });

  // Buscar usuário atual (adotante)
  const currentUser = await api.getCurrentUser();
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  console.log('👤 Usuário atual:', currentUser.name, currentUser.id);

  // Verificar se o usuário não está tentando conversar consigo mesmo
  if (currentUser.id === advertiserId) {
    throw new Error('Você não pode iniciar uma conversa com você mesmo');
  }

  // Buscar ou criar conversa
  const conversation = await messaging.getOrCreateConversation({
    animal_id: animalId,
    adopter_id: currentUser.id,
    advertiser_id: advertiserId
  });

  console.log('✅ Conversa criada/encontrada:', conversation.id);
  
  return conversation.id;
}

/**
 * Buscar dados de uma conversa específica
 */
export async function getConversationData(conversationId: string) {
  return await messaging.getConversation(conversationId);
}

/**
 * Buscar todas as conversas do usuário atual
 */
export async function getUserConversations() {
  const currentUser = await api.getCurrentUser();
  if (!currentUser) {
    throw new Error('Usuário não autenticado');
  }

  return await messaging.getConversations(currentUser.id);
}
