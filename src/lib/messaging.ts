import { supabase } from './supabase';

// Tipos para o sistema de mensagens
export interface SimpleConversation {
  id: string;
  animal_id: string;
  animal_name: string;
  animal_image: string;
  adopter_id: string;
  adopter_name: string;
  advertiser_id: string;
  advertiser_name: string;
  last_message?: string;
  last_message_date?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface SimpleMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

export interface CreateConversationData {
  animal_id: string;
  adopter_id: string;
  advertiser_id: string;
}

class MessagingService {
  /**
   * Buscar ou criar uma conversa entre adotante e anunciante para um animal
   */
  async getOrCreateConversation(data: CreateConversationData): Promise<SimpleConversation> {
    console.log('🔍 Buscando/criando conversa:', data);

    // Primeiro verificar se já existe uma conversa
    const { data: existing, error: existingError } = await supabase
      .from('conversations')
      .select(`
        id,
        animal_id,
        adopter_id,
        advertiser_id,
        created_at,
        updated_at,
        animal:animals(name, image_url),
        adopter:profiles!adopter_id(name),
        advertiser:profiles!advertiser_id(name)
      `)
      .eq('animal_id', data.animal_id)
      .eq('adopter_id', data.adopter_id)
      .eq('advertiser_id', data.advertiser_id)
      .single();

    if (!existingError && existing) {
      console.log('✅ Conversa existente encontrada:', existing.id);
      
      // Buscar última mensagem
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('conversation_id', existing.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        id: existing.id,
        animal_id: existing.animal_id,
        animal_name: existing.animal?.name || 'Animal',
        animal_image: existing.animal?.image_url || '',
        adopter_id: existing.adopter_id,
        adopter_name: existing.adopter?.name || 'Adotante',
        advertiser_id: existing.advertiser_id,
        advertiser_name: existing.advertiser?.name || 'Anunciante',
        last_message: lastMessage?.content,
        last_message_date: lastMessage?.created_at,
        unread_count: 0, // Por enquanto
        created_at: existing.created_at,
        updated_at: existing.updated_at
      };
    }

    console.log('➕ Criando nova conversa...');
    
    // Criar nova conversa
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        animal_id: data.animal_id,
        adopter_id: data.adopter_id,
        advertiser_id: data.advertiser_id
      })
      .select(`
        id,
        animal_id,
        adopter_id,
        advertiser_id,
        created_at,
        updated_at,
        animal:animals(name, image_url),
        adopter:profiles!adopter_id(name),
        advertiser:profiles!advertiser_id(name)
      `)
      .single();

    if (createError) {
      console.error('❌ Erro ao criar conversa:', createError);
      throw new Error(`Erro ao criar conversa: ${createError.message}`);
    }

    console.log('✅ Nova conversa criada:', newConversation.id);

    return {
      id: newConversation.id,
      animal_id: newConversation.animal_id,
      animal_name: newConversation.animal?.name || 'Animal',
      animal_image: newConversation.animal?.image_url || '',
      adopter_id: newConversation.adopter_id,
      adopter_name: newConversation.adopter?.name || 'Adotante',
      advertiser_id: newConversation.advertiser_id,
      advertiser_name: newConversation.advertiser?.name || 'Anunciante',
      last_message: undefined,
      last_message_date: undefined,
      unread_count: 0,
      created_at: newConversation.created_at,
      updated_at: newConversation.updated_at
    };
  }

  /**
   * Buscar todas as conversas de um usuário
   */
  async getConversations(userId: string): Promise<SimpleConversation[]> {
    console.log('🔍 Buscando conversas para usuário:', userId);

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        animal_id,
        adopter_id,
        advertiser_id,
        created_at,
        updated_at,
        animal:animals(name, image_url),
        adopter:profiles!adopter_id(name),
        advertiser:profiles!advertiser_id(name)
      `)
      .or(`adopter_id.eq.${userId},advertiser_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar conversas:', error);
      throw new Error(`Erro ao buscar conversas: ${error.message}`);
    }

    console.log(`✅ ${data?.length || 0} conversas encontradas`);

    // Para cada conversa, buscar a última mensagem
    const conversations: SimpleConversation[] = [];
    
    for (const conv of data || []) {
      const { data: lastMessage } = await supabase
        .from('messages')
        .select('content, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      conversations.push({
        id: conv.id,
        animal_id: conv.animal_id,
        animal_name: conv.animal?.name || 'Animal',
        animal_image: conv.animal?.image_url || '',
        adopter_id: conv.adopter_id,
        adopter_name: conv.adopter?.name || 'Adotante',
        advertiser_id: conv.advertiser_id,
        advertiser_name: conv.advertiser?.name || 'Anunciante',
        last_message: lastMessage?.content,
        last_message_date: lastMessage?.created_at,
        unread_count: 0, // Por enquanto
        created_at: conv.created_at,
        updated_at: conv.updated_at
      });
    }

    return conversations;
  }

  /**
   * Buscar mensagens de uma conversa
   */
  async getMessages(conversationId: string): Promise<SimpleMessage[]> {
    console.log('🔍 Buscando mensagens para conversa:', conversationId);

    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        sender:profiles(name)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar mensagens:', error);
      throw new Error(`Erro ao buscar mensagens: ${error.message}`);
    }

    console.log(`✅ ${data?.length || 0} mensagens encontradas`);

    return (data || []).map(msg => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      sender_id: msg.sender_id,
      sender_name: msg.sender?.name || 'Usuário',
      content: msg.content,
      created_at: msg.created_at
    }));
  }

  /**
   * Enviar uma mensagem
   */
  async sendMessage(conversationId: string, senderId: string, content: string): Promise<SimpleMessage> {
    console.log('📤 Enviando mensagem:', { conversationId, senderId, content: content.substring(0, 50) + '...' });

    // Inserir mensagem
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: content.trim()
      })
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        created_at,
        sender:profiles(name)
      `)
      .single();

    if (messageError) {
      console.error('❌ Erro ao enviar mensagem:', messageError);
      throw new Error(`Erro ao enviar mensagem: ${messageError.message}`);
    }

    // Atualizar timestamp da conversa
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    console.log('✅ Mensagem enviada:', message.id);

    return {
      id: message.id,
      conversation_id: message.conversation_id,
      sender_id: message.sender_id,
      sender_name: message.sender?.name || 'Usuário',
      content: message.content,
      created_at: message.created_at
    };
  }

  /**
   * Buscar dados de uma conversa específica
   */
  async getConversation(conversationId: string): Promise<SimpleConversation | null> {
    console.log('🔍 Buscando dados da conversa:', conversationId);

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        animal_id,
        adopter_id,
        advertiser_id,
        created_at,
        updated_at,
        animal:animals(name, image_url),
        adopter:profiles!adopter_id(name),
        advertiser:profiles!advertiser_id(name)
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      console.error('❌ Erro ao buscar conversa:', error);
      return null;
    }

    // Buscar última mensagem
    const { data: lastMessage } = await supabase
      .from('messages')
      .select('content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      id: data.id,
      animal_id: data.animal_id,
      animal_name: data.animal?.name || 'Animal',
      animal_image: data.animal?.image_url || '',
      adopter_id: data.adopter_id,
      adopter_name: data.adopter?.name || 'Adotante',
      advertiser_id: data.advertiser_id,
      advertiser_name: data.advertiser?.name || 'Anunciante',
      last_message: lastMessage?.content,
      last_message_date: lastMessage?.created_at,
      unread_count: 0, // Por enquanto
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
}

export const messaging = new MessagingService();
