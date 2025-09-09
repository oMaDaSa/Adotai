import { supabase, supabaseAdmin } from './supabase';
import type { 
  User, 
  Animal, 
  AdoptionRequest, 
  Conversation, 
  Message 
} from '../types';

class ApiService {
  // Authentication
  async signup(userData: {
    email: string;
    password: string;
    name: string;
    type: 'adopter' | 'advertiser';
    phone: string;
    address: string;
  }): Promise<{ user: User }> {
    try {
      console.log('Iniciando cadastro para:', userData.email);
      
      // 1. Registrar usuário no Supabase Auth (isso dispara o gatilho)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) {
        console.error('Erro de autenticação:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Falha ao criar usuário no sistema de autenticação');
      }

      console.log('Usuário criado no auth:', authData.user.id);
      
      // Opcional mas recomendado: auto-confirmar o email via admin
      // Isso evita que o usuário precise clicar em um link de confirmação
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        authData.user.id,
        { email_confirm: true }
      );
      if (confirmError) {
        console.warn('Falha ao auto-confirmar email, pode ser necessário confirmar manualmente:', confirmError.message);
      } else {
        console.log('Email do usuário auto-confirmado com sucesso!');
      }

      // 2. ATUALIZAR o perfil que o gatilho acabou de criar com os dados do formulário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          type: userData.type,
          phone: userData.phone,
          address: userData.address,
          updated_at: new Date()
        })
        .eq('id', authData.user.id)
        .select()
        .single();

      if (profileError) {
        console.error('Erro ao ATUALIZAR o perfil:', profileError);
        // Se a atualização falhar, é uma boa prática deletar o usuário criado na auth
        // para não deixar um usuário "órfão" no sistema.
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw new Error(`Falha ao salvar os dados do perfil: ${profileError.message}`);
      }

      console.log('Perfil atualizado com sucesso:', profile);
      return { user: profile as User };

    } catch (error: any) {
      console.error('Erro geral no processo de cadastro:', error);
      throw error;
    }
  }

  async signin(email: string, password: string): Promise<{ user: User; session?: any; isAdmin?: boolean }> {
    try {
      console.log('Tentando fazer login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro de autenticação:', error);
        
        // Se o erro for de email não verificado, tentar confirmar automaticamente
        if (error.message.includes('email') && error.message.includes('not') && error.message.includes('confirm')) {
          console.log('Tentando confirmar email automaticamente durante login...');
          
          // Tentar fazer login novamente ignorando verificação
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (retryError && !retryError.message.includes('password')) {
            throw new Error('Email ou senha incorretos.');
          }
          
          if (retryData.user) {
            // Confirmar email usando admin se necessário
            try {
              await supabaseAdmin.auth.admin.updateUserById(
                retryData.user.id,
                { email_confirm: true }
              );
              console.log('Email confirmado automaticamente durante login!');
            } catch (confirmErr) {
              console.warn('Falha ao confirmar email, mas continuando...');
            }
            
            // Continuar com o login
            return this.signin(email, password);
          }
        }
        
        // Para outros tipos de erro, lançar mensagem mais amigável
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha incorretos.');
        }
        
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed');
      }

      console.log('Usuário autenticado com sucesso:', data.user.id);

      // Tentar buscar perfil com diferentes abordagens
      let profile = null;
      let profileError = null;

      // Primeiro: tentar buscar por ID
      const { data: profileById, error: errorById } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (!errorById && profileById) {
        profile = profileById;
      } else {
        console.log('Perfil não encontrado por ID, tentando por email...', errorById);
        
        // Segundo: tentar buscar por email
        const { data: profileByEmail, error: errorByEmail } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .single();

        if (!errorByEmail && profileByEmail) {
          profile = profileByEmail;
        } else {
          console.log('Perfil não encontrado por email também:', errorByEmail);
          profileError = errorByEmail || errorById;
        }
      }

      // Se ainda não encontrou, tentar com admin client
      if (!profile) {
        console.log('Tentando com cliente admin...');
        const { data: adminProfile, error: adminError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (!adminError && adminProfile) {
          profile = adminProfile;
        } else {
          profileError = adminError;
        }
      }

      if (!profile) {
        console.error('Profile fetch failed para usuário:', data.user.id, 'Erro:', profileError);
        throw new Error('Perfil não encontrado. Entre em contato com o suporte.');
      }

      console.log('Perfil encontrado:', profile);

      return { 
        user: profile as User, 
        session: data.session, 
        isAdmin: profile.type === 'admin' 
      };
    } catch (error: any) {
      console.error('Erro completo no signin:', error);
      throw error;
    }
  }

  async signout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  // Users/Profiles
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return data as User[];
  }

  async getUser(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data as User;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    // Tentar buscar perfil com diferentes abordagens (similar ao signin)
    let profile = null;
    let profileError = null;

    // Primeiro: tentar buscar por ID
    const { data: profileById, error: errorById } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!errorById && profileById) {
      profile = profileById;
    } else {
      console.log('Perfil não encontrado por ID no getCurrentUser, tentando por email...', errorById);
      
      // Segundo: tentar buscar por email
      const { data: profileByEmail, error: errorByEmail } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single();

      if (!errorByEmail && profileByEmail) {
        profile = profileByEmail;
      } else {
        console.log('Perfil não encontrado por email também no getCurrentUser:', errorByEmail);
        profileError = errorByEmail || errorById;
      }
    }

    // Se ainda não encontrou, tentar com admin client
    if (!profile) {
      console.log('Tentando com cliente admin no getCurrentUser...');
      const { data: adminProfile, error: adminError } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!adminError && adminProfile) {
        profile = adminProfile;
      } else {
        profileError = adminError;
      }
    }

    if (!profile) {
      console.error('getCurrentUser: Profile fetch failed para usuário:', user.id, 'Erro:', profileError);
      throw new Error(`Failed to fetch current user: ${profileError?.message || 'Profile not found'}`);
    }

    console.log('getCurrentUser: Perfil encontrado:', profile);
    return profile as User;
  }

  // Animals
  async getAnimals(): Promise<Animal[]> {
    // Primeiro tentar com a view
    let { data, error } = await supabase
      .from('animals_with_advertiser')
      .select('*')
      .order('created_at', { ascending: false });

    // Se a view não existir, usar a tabela diretamente
    if (error && error.code === '42P01') {
      const { data: animalsData, error: animalsError } = await supabase
        .from('animals')
        .select(`
          *,
          advertiser:profiles!advertiser_id(name, email, phone, address)
        `)
        .order('created_at', { ascending: false });

      if (animalsError) {
        throw new Error(`Failed to fetch animals: ${animalsError.message}`);
      }

      // Transformar dados para o formato esperado
      data = animalsData?.map(animal => ({
        ...animal,
        advertiser_name: animal.advertiser?.name || 'Anunciante',
        advertiser_email: animal.advertiser?.email || '',
        advertiser_phone: animal.advertiser?.phone || '',
        advertiser_address: animal.advertiser?.address || ''
      }));
    } else if (error) {
      throw new Error(`Failed to fetch animals: ${error.message}`);
    }

    return data as Animal[];
  }

  // Animals for search page (only available)
  async getAvailableAnimals(): Promise<Animal[]> {
    const allAnimals = await this.getAnimals();
    return allAnimals.filter(animal => animal.status === 'available');
  }

  async getAnimal(id: string): Promise<Animal> {
    // Primeiro tentar com a view
    let { data, error } = await supabase
      .from('animals_with_advertiser')
      .select('*')
      .eq('id', id)
      .single();

    // Se a view não existir, usar a tabela diretamente
    if (error && error.code === '42P01') {
      const { data: animalData, error: animalError } = await supabase
        .from('animals')
        .select(`
          *,
          advertiser:profiles!advertiser_id(name, email, phone, address)
        `)
        .eq('id', id)
        .single();

      if (animalError) {
        throw new Error(`Failed to fetch animal: ${animalError.message}`);
      }

      // Transformar dados para o formato esperado
      data = {
        ...animalData,
        advertiser_name: animalData.advertiser?.name || 'Anunciante',
        advertiser_email: animalData.advertiser?.email || '',
        advertiser_phone: animalData.advertiser?.phone || '',
        advertiser_address: animalData.advertiser?.address || ''
      };
    } else if (error) {
      throw new Error(`Failed to fetch animal: ${error.message}`);
    }

    return data as Animal;
  }

  // Dentro da sua classe ApiService em lib/api.js

  // Função para o admin buscar TODOS os usuários
  async adminGetAllUsers(): Promise<User[]> {
    console.log("ADMIN: Buscando todos os usuários...");
    // Usamos o supabaseAdmin para ignorar o RLS
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("ADMIN: Erro ao buscar usuários", error);
      throw new Error(`Falha ao buscar usuários: ${error.message}`);
    }
    return data as User[];
  }

  // Função para o admin buscar TODOS os animais
  async adminGetAllAnimals(): Promise<Animal[]> {
    console.log("ADMIN: Buscando todos os animais...");
    const { data, error } = await supabaseAdmin
      .from('animals')
      .select('*, advertiser:profiles(name)') // Exemplo de join
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("ADMIN: Erro ao buscar animais", error);
      throw new Error(`Falha ao buscar animais: ${error.message}`);
    }
    // Adaptação para o formato esperado, se necessário
    return data.map(animal => ({
        ...animal,
        advertiser_name: animal.advertiser?.name || 'N/A'
    })) as Animal[];
  }

  // Função para o admin buscar TODAS as solicitações de adoção
  async adminGetAllAdoptionRequests(): Promise<AdoptionRequest[]> {
      console.log("ADMIN: Buscando todas as solicitações...");
      const { data, error } = await supabaseAdmin
        .from('adoption_requests')
        .select(`*, animal:animals(name), adopter:profiles(name)`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("ADMIN: Erro ao buscar solicitações", error);
        throw new Error(`Falha ao buscar solicitações: ${error.message}`);
      }
      return data as AdoptionRequest[];
  }

  async createAnimal(animalData: Partial<Animal>): Promise<Animal> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verificar se o perfil existe na tabela profiles (com lógica robusta)
    let profile = null;
    let profileError = null;

    // Primeiro: tentar buscar por ID
    const { data: profileById, error: errorById } = await supabase
      .from('profiles')
      .select('id, type')
      .eq('id', user.id)
      .single();

    if (!errorById && profileById) {
      profile = profileById;
    } else {
      console.log('createAnimal: Perfil não encontrado por ID, tentando por email...', errorById);
      
      // Segundo: tentar buscar por email
      const { data: profileByEmail, error: errorByEmail } = await supabase
        .from('profiles')
        .select('id, type')
        .eq('email', user.email)
        .single();

      if (!errorByEmail && profileByEmail) {
        profile = profileByEmail;
      } else {
        console.log('createAnimal: Perfil não encontrado por email também:', errorByEmail);
        profileError = errorByEmail || errorById;
      }
    }

    // Se ainda não encontrou, tentar com admin client
    if (!profile) {
      console.log('createAnimal: Tentando com cliente admin...');
      const { data: adminProfile, error: adminError } = await supabaseAdmin
        .from('profiles')
        .select('id, type')
        .eq('id', user.id)
        .single();

      if (!adminError && adminProfile) {
        profile = adminProfile;
      } else {
        profileError = adminError;
      }
    }

    if (!profile) {
      console.error('createAnimal: Profile not found for user:', user.id, profileError);
      throw new Error('Perfil do usuário não encontrado. Faça login novamente.');
    }

    if (profile.type !== 'advertiser') {
      throw new Error('Apenas anunciantes podem cadastrar animais.');
    }

    console.log('Creating animal with advertiser_id:', profile.id);

    const { data, error } = await supabase
      .from('animals')
      .insert({
        ...animalData,
        advertiser_id: profile.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating animal:', error);
      throw new Error(`Failed to create animal: ${error.message}`);
    }

    return data as Animal;
  }

  async updateAnimal(id: string, animalData: Partial<Animal>): Promise<Animal> {
    const { data, error } = await supabase
      .from('animals')
      .update(animalData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update animal: ${error.message}`);
    }

    return data as Animal;
  }

  async deleteAnimal(id: string): Promise<void> {
    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete animal: ${error.message}`);
    }
  }

  // Adoption Requests
  async getAdoptionRequests(): Promise<AdoptionRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Try to use the detailed view first
    let { data, error } = await supabase
      .from('adoption_requests_detailed')
      .select('*')
      .eq('adopter_id', user.id) // Filter by current user
      .order('created_at', { ascending: false });

    // If view doesn't exist, fall back to basic table with joins
    if (error && error.code === '42P01') {
      const { data: basicData, error: basicError } = await supabase
        .from('adoption_requests')
        .select(`
          *,
          animal:animals(name, species, breed, image_url),
          adopter:profiles!adopter_id(name, email, phone),
          advertiser:profiles!advertiser_id(name, email)
        `)
        .eq('adopter_id', user.id)
        .order('created_at', { ascending: false });

      if (basicError) {
        throw new Error(`Failed to fetch adoption requests: ${basicError.message}`);
      }

      // Transform data to match expected format
      data = basicData?.map(request => ({
        ...request,
        animal_name: request.animal?.name,
        animal_species: request.animal?.species,
        animal_breed: request.animal?.breed,
        animal_image_url: request.animal?.image_url,
        adopter_name: request.adopter?.name,
        adopter_email: request.adopter?.email,
        adopter_phone: request.adopter?.phone,
        advertiser_name: request.advertiser?.name,
        advertiser_email: request.advertiser?.email
      }));
    } else if (error) {
      throw new Error(`Failed to fetch adoption requests: ${error.message}`);
    }

    return data as AdoptionRequest[];
  }

  // Get adoption requests for advertiser (requests for their animals)
  async getAdvertiserAdoptionRequests(): Promise<AdoptionRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Fetching advertiser adoption requests for user:', user.id);

    // First get all animals owned by the current user
    const { data: userAnimals, error: animalsError } = await supabase
      .from('animals')
      .select('id')
      .eq('advertiser_id', user.id);

    if (animalsError) {
      console.error('Error fetching user animals:', animalsError);
      throw new Error(`Failed to fetch user animals: ${animalsError.message}`);
    }

    console.log('User animals found:', userAnimals?.length || 0);

    if (!userAnimals || userAnimals.length === 0) {
      return []; // No animals, no requests
    }

    const animalIds = userAnimals.map(animal => animal.id);
    console.log('Looking for requests for animal IDs:', animalIds);

    // Buscar diretamente na tabela adoption_requests com joins simples
    const { data: basicData, error: basicError } = await supabase
      .from('adoption_requests')
      .select(`
        *,
        animal:animals!inner(id, name, species, breed, image_url),
        adopter:profiles!inner(id, name, email, phone)
      `)
      .in('animal_id', animalIds)
      .order('created_at', { ascending: false });

    if (basicError) {
      console.error('Error fetching adoption requests:', basicError);
      throw new Error(`Failed to fetch advertiser adoption requests: ${basicError.message}`);
    }

    console.log('Raw adoption requests data:', basicData);

    // Transform data to match expected format
    const transformedData = basicData?.map(request => ({
      ...request,
      animal_name: request.animal?.name,
      animal_species: request.animal?.species,
      animal_breed: request.animal?.breed,
      animal_image_url: request.animal?.image_url,
      adopter_name: request.adopter?.name,
      adopter_email: request.adopter?.email,
      adopter_phone: request.adopter?.phone
    })) || [];

    console.log('Transformed adoption requests:', transformedData);
    return transformedData as AdoptionRequest[];
  }

  async adminGetRecentActivity(): Promise<any[]> {
  const { data, error } = await supabaseAdmin
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5); // Pega as 5 atividades mais recentes

  if (error) throw error;
  return data;
}

  // Get adoption requests for a specific animal
  async getAnimalAdoptionRequests(animalId: string): Promise<AdoptionRequest[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Fetching adoption requests for animal:', animalId, 'by user:', user.id);

    // Verify that the user owns this animal - using a more robust approach
    let { data: animal, error: animalError } = await supabase
      .from('animals')
      .select('id, advertiser_id')
      .eq('id', animalId)
      .single();

    if (animalError) {
      console.error('Error fetching animal:', animalError);
      throw new Error(`Animal not found: ${animalError.message}`);
    }

    console.log('Animal found:');
    console.log('- Animal ID:', animal.id);
    console.log('- Advertiser ID:', animal.advertiser_id);
    console.log('- Current User ID:', user.id);
    console.log('- IDs match:', animal.advertiser_id === user.id);
    console.log('- Advertiser ID type:', typeof animal.advertiser_id);
    console.log('- User ID type:', typeof user.id);

    // Convert both IDs to strings for comparison to handle any type mismatches
    const animalAdvertiserId = String(animal.advertiser_id || '').trim();
    const currentUserId = String(user.id || '').trim();
    
    // Verificação robusta de propriedade
    let isOwner = false;
    
    // Primeiro: verificação direta
    if (animalAdvertiserId === currentUserId) {
      isOwner = true;
    }
    
    // Segundo: se não deu certo, tentar buscar o perfil do usuário para confirmar
    if (!isOwner) {
      console.log('Direct ID match failed, trying profile verification...');
      
      // Tentar buscar perfil por ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (!profileError && profile) {
        const profileId = String(profile.id || '').trim();
        if (animalAdvertiserId === profileId) {
          isOwner = true;
          console.log('Ownership verified through profile lookup');
        }
      }
    }
    
    // Terceiro: se ainda não deu certo, tentar verificação pelo email
    if (!isOwner && user.email) {
      console.log('Trying email-based verification...');
      
      const { data: profileByEmail, error: emailError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', user.email)
        .single();
      
      if (!emailError && profileByEmail) {
        const profileId = String(profileByEmail.id || '').trim();
        if (animalAdvertiserId === profileId) {
          isOwner = true;
          console.log('Ownership verified through email lookup');
        }
      }
    }
    
    if (!isOwner) {
      console.error('Ownership verification failed after all attempts:');
      console.error('- Animal advertiser_id (as string):', animalAdvertiserId);
      console.error('- Current user_id (as string):', currentUserId);
      console.error('- User email:', user.email);
      throw new Error('Unauthorized: You can only view requests for your own animals');
    }

    console.log('Ownership verified successfully');

    // Buscar diretamente na tabela adoption_requests com joins simples
    const { data: basicData, error: basicError } = await supabase
      .from('adoption_requests')
      .select(`
        *,
        animal:animals!inner(id, name, species, breed, image_url),
        adopter:profiles!inner(id, name, email, phone)
      `)
      .eq('animal_id', animalId)
      .order('created_at', { ascending: false });

    if (basicError) {
      console.error('Error fetching adoption requests for animal:', basicError);
      throw new Error(`Failed to fetch animal adoption requests: ${basicError.message}`);
    }

    console.log('Raw requests data for animal:', basicData);

    // Transform data to match expected format
    const transformedData = basicData?.map(request => ({
      ...request,
      animal_name: request.animal?.name,
      animal_species: request.animal?.species,
      animal_breed: request.animal?.breed,
      animal_image_url: request.animal?.image_url,
      adopter_name: request.adopter?.name,
      adopter_email: request.adopter?.email,
      adopter_phone: request.adopter?.phone
    })) || [];

    console.log('Transformed requests for animal:', transformedData);
    return transformedData as AdoptionRequest[];
  }

  async createAdoptionRequest(requestData: Partial<AdoptionRequest>): Promise<AdoptionRequest> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Creating adoption request with data:', requestData);

    // Verificar se o animal existe
    const { data: animal, error: animalError } = await supabase
      .from('animals')
      .select('id, advertiser_id')
      .eq('id', requestData.animal_id)
      .single();

    if (animalError) {
      console.error('Error fetching animal for adoption request:', animalError);
      throw new Error(`Animal not found: ${animalError.message}`);
    }

    // Preparar dados para inserção (apenas campos que existem na tabela)
    const insertData = {
      animal_id: requestData.animal_id,
      adopter_id: user.id,
      status: requestData.status || 'pending',
      message: requestData.message || requestData.reason || 'Solicitação de adoção'
    };

    console.log('Inserting adoption request data:', insertData);

    const { data, error } = await supabase
      .from('adoption_requests')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating adoption request:', error);
      throw new Error(`Failed to create adoption request: ${error.message}`);
    }

    console.log('Adoption request created successfully:', data);
    return data as AdoptionRequest;
  }

  async updateAdoptionRequest(id: string, updateData: Partial<AdoptionRequest>): Promise<AdoptionRequest> {
    const { data, error } = await supabase
      .from('adoption_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update adoption request: ${error.message}`);
    }

    return data as AdoptionRequest;
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('=== GETCONVERSATIONS DEBUG ===');
    console.log('Fetching conversations for auth user:', user.id);
    console.log('User email:', user.email);

    // Buscar o perfil do usuário atual para usar o ID correto
    let userProfile = null;
    
    // Primeiro: tentar buscar perfil por ID
    const { data: profileById, error: errorById } = await supabase
      .from('profiles')
      .select('id, name, type')
      .eq('id', user.id)
      .single();
    
    if (!errorById && profileById) {
      userProfile = profileById;
      console.log('User profile found by ID:', {
        id: userProfile.id,
        name: userProfile.name,
        type: userProfile.type
      });
    } else {
      console.log('User profile não encontrado por ID, tentando por email...', errorById);
      
      // Segundo: tentar buscar por email
      if (user.email) {
        const { data: profileByEmail, error: errorByEmail } = await supabase
          .from('profiles')
          .select('id, name, type')
          .eq('email', user.email)
          .single();
        
        if (!errorByEmail && profileByEmail) {
          userProfile = profileByEmail;
          console.log('User profile found by email:', {
            id: userProfile.id,
            name: userProfile.name,
            type: userProfile.type
          });
        } else {
          console.log('User profile não encontrado por email também:', errorByEmail);
        }
      }
    }
    
    if (!userProfile) {
      console.error('User profile not found for user:', user.id, 'email:', user.email);
      throw new Error('Seu perfil não foi encontrado. Faça login novamente.');
    }

    console.log('Searching conversations for profile ID:', userProfile.id);
    console.log('Query: adopter_id.eq.' + userProfile.id + ' OR advertiser_id.eq.' + userProfile.id);

    // Primeiro, vamos verificar todas as conversas na tabela para debug
    const { data: allConversations, error: allError } = await supabase
      .from('conversations')
      .select('*')
      .limit(10);
    
    console.log('Total conversations in database:', allConversations?.length || 0);
    console.log('Sample conversations:', allConversations?.slice(0, 3));

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        animal:animals(name),
        adopter:profiles!adopter_id(name),
        advertiser:profiles!advertiser_id(name)
      `)
      .or(`adopter_id.eq.${userProfile.id},advertiser_id.eq.${userProfile.id}`)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    console.log('Filtered conversations found:', data?.length || 0);
    console.log('Raw conversations data:', data);

    // Para debug: mostrar detalhes de cada conversa
    data?.forEach((conv, index) => {
      console.log(`Conversation ${index + 1}:`, {
        id: conv.id,
        animal_id: conv.animal_id,
        adopter_id: conv.adopter_id,
        advertiser_id: conv.advertiser_id,
        animal_name: conv.animal?.name,
        adopter_name: conv.adopter?.name,
        advertiser_name: conv.advertiser?.name,
        created_at: conv.created_at,
        updated_at: conv.updated_at
      });
    });

    // Transform data to include names properly
    const transformedData = data?.map(conv => ({
      ...conv,
      animal_name: conv.animal?.name || 'Animal',
      adopter_name: conv.adopter?.name || 'Adotante',
      advertiser_name: conv.advertiser?.name || 'Anunciante',
      status: conv.status || 'active'
    })) || [];

    console.log('Final transformed conversations:', transformedData.length);
    console.log('=== END GETCONVERSATIONS DEBUG ===');
    return transformedData as Conversation[];
  }

  async createConversation(animalId: string, advertiserId: string): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Creating conversation for animal:', animalId, 'between adopter:', user.id, 'and advertiser:', advertiserId);

    // Verificar se o perfil do usuário existe na tabela profiles
    let adopterProfile = null;
    
    // Primeiro: tentar buscar perfil por ID
    const { data: profileById, error: errorById } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (!errorById && profileById) {
      adopterProfile = profileById;
    } else {
      console.log('Perfil não encontrado por ID, tentando por email...', errorById);
      
      // Segundo: tentar buscar por email
      if (user.email) {
        const { data: profileByEmail, error: errorByEmail } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (!errorByEmail && profileByEmail) {
          adopterProfile = profileByEmail;
        } else {
          console.log('Perfil não encontrado por email também:', errorByEmail);
        }
      }
    }
    
    if (!adopterProfile) {
      console.error('Profile not found for user:', user.id, 'email:', user.email);
      throw new Error('Seu perfil não foi encontrado. Faça login novamente.');
    }
    
    console.log('Using adopter profile ID:', adopterProfile.id);

    // Verificar se o perfil do anunciante existe
    const { data: advertiserProfile, error: advertiserError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', advertiserId)
      .single();
    
    if (advertiserError || !advertiserProfile) {
      console.error('Advertiser profile not found:', advertiserId, advertiserError);
      throw new Error('Perfil do anunciante não encontrado.');
    }

    // First check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('animal_id', animalId)
      .eq('adopter_id', adopterProfile.id)
      .eq('advertiser_id', advertiserId)
      .single();

    if (existing) {
      console.log('Conversation already exists:', existing.id);
      // Return existing conversation with additional data
      const { data: fullData, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          animal:animals(name),
          adopter:profiles!adopter_id(name),
          advertiser:profiles!advertiser_id(name)
        `)
        .eq('id', existing.id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch existing conversation: ${fetchError.message}`);
      }

      return {
        ...fullData,
        animal_name: fullData.animal?.name || 'Animal',
        adopter_name: fullData.adopter?.name || 'Adotante',
        advertiser_name: fullData.advertiser?.name || 'Anunciante',
        status: fullData.status || 'active'
      } as Conversation;
    }

    console.log('Creating new conversation...');
    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        animal_id: animalId,
        adopter_id: adopterProfile.id,
        advertiser_id: advertiserId
      })
      .select(`
        *,
        animal:animals(name),
        adopter:profiles!adopter_id(name),
        advertiser:profiles!advertiser_id(name)
      `)
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      console.error('Attempted to create with:', {
        animal_id: animalId,
        adopter_id: adopterProfile.id,
        advertiser_id: advertiserId
      });
      throw new Error(`Failed to create conversation: ${error.message}`);
    }

    console.log('Conversation created successfully:', data.id);
    return {
      ...data,
      animal_name: data.animal?.name || 'Animal',
      adopter_name: data.adopter?.name || 'Adotante',
      advertiser_name: data.advertiser?.name || 'Anunciante',
      status: data.status || 'active'
    } as Conversation;
  }

  // Messages
  async getMessages(conversationId: string): Promise<Message[]> {
    console.log('Fetching messages for conversation:', conversationId);
    
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles(name)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }

    console.log(`Found ${data?.length || 0} messages:`);
    data?.forEach((msg, index) => {
      console.log(`Message ${index + 1}:`, {
        id: msg.id,
        sender_id: msg.sender_id,
        sender_name: msg.sender?.name,
        content: msg.content.substring(0, 50) + '...',
        created_at: msg.created_at
      });
    });

    return data as Message[];
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    console.log('Sending message by user:', user.id, 'to conversation:', conversationId);

    // Verificar se o perfil do usuário existe na tabela profiles (mesmo padrão usado em createConversation)
    let senderProfile = null;
    
    // Primeiro: tentar buscar perfil por ID
    const { data: profileById, error: errorById } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (!errorById && profileById) {
      senderProfile = profileById;
      console.log('Sender profile found by ID:', senderProfile.id);
    } else {
      console.log('Sender profile não encontrado por ID, tentando por email...', errorById);
      
      // Segundo: tentar buscar por email
      if (user.email) {
        const { data: profileByEmail, error: errorByEmail } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', user.email)
          .single();
        
        if (!errorByEmail && profileByEmail) {
          senderProfile = profileByEmail;
          console.log('Sender profile found by email:', senderProfile.id);
        } else {
          console.log('Sender profile não encontrado por email também:', errorByEmail);
        }
      }
    }
    
    if (!senderProfile) {
      console.error('Sender profile not found for user:', user.id, 'email:', user.email);
      throw new Error('Seu perfil não foi encontrado. Faça login novamente.');
    }

    console.log('Sending message with sender profile ID:', senderProfile.id);
    
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderProfile.id,
        content
      })
      .select(`
        *,
        sender:profiles(name)
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      console.error('Attempted to send with:', {
        conversation_id: conversationId,
        sender_id: senderProfile.id,
        content: content.substring(0, 50) + '...'
      });
      throw new Error(`Failed to send message: ${error.message}`);
    }

    console.log('Message sent successfully:', data.id);
    return data as Message;
  }

  // Upload functions
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }
  }

  async uploadAnimalPhotos(userId: string, files: File[]): Promise<string[]> {
    try {
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('animal-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('animal-photos')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      return uploadedUrls;
    } catch (error: any) {
      throw new Error(`Failed to upload animal photos: ${error.message}`);
    }
  }

  async updateUserAvatar(userId: string, avatarUrl: string): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update avatar: ${error.message}`);
    }

    return data as User;
  }

  // Debug functions
  async debugAdoptionRequests(): Promise<void> {
    console.log('=== DEBUG ADOPTION REQUESTS ===');
    
    // Check all adoption requests in the table
    const { data: allRequests, error: allError } = await supabase
      .from('adoption_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    console.log('All adoption requests:', allRequests);
    if (allError) console.error('Error fetching all requests:', allError);
    
    // Check current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.id);
    
    // Check user's animals
    if (user) {
      const { data: userAnimals, error: animalsError } = await supabase
        .from('animals')
        .select('id, name, advertiser_id')
        .eq('advertiser_id', user.id);
      
      console.log('User animals:', userAnimals);
      if (animalsError) console.error('Error fetching user animals:', animalsError);
    }
    
    // Test simple join
    const { data: joinTest, error: joinError } = await supabase
      .from('adoption_requests')
      .select(`
        *,
        animal:animals(id, name),
        adopter:profiles(id, name)
      `)
      .limit(5);
    
    console.log('Join test result:', joinTest);
    if (joinError) console.error('Join test error:', joinError);
  }

  // Initialize sample data
  async initializeData(): Promise<void> {
    try {
      // Check if database is properly configured by trying to fetch profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      if (error) {
        throw new Error(`Database not configured: ${error.message}`);
      }

      // If we reach here, the database is configured
      console.log('Database is properly configured');
    } catch (error: any) {
      console.error('Database configuration check failed:', error);
      throw error;
    }
  }
}

export const api = new ApiService();
