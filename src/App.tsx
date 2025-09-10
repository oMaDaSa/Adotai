import { useEffect, useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { AccountTypeDialog } from "./components/AccountTypeDialog";
import { api } from "./lib/api";
import { supabase } from "./lib/supabase";
import { HomePage } from "./pages/HomePage";
import { 
  AnimalDetailsPage,
  LoginPage,
  CreateAccountPage,
  ForgotPasswordPage,
  SearchPage,
  ResponsibleAdoptionPage,
  AdoptionRequestPage,
  AdopterDashboard,
  AdvertiserProfilePage,
  RegisterAnimalPage,
  AnimalRequestsPage,
  AdvertiserRequestsPanel,
  RequestDetailsPage,
  ChatPage,
  ConversationsList,
  AdminLoginPage,
  AdminDashboard,
  UserProfilePage
} from "./pages";
import { SimpleConversationsList } from "./components/SimpleConversationsList";
import { SimpleChatPage } from "./components/SimpleChatPage";
import { ChatDiagnostic } from "./components/ChatDiagnostic";
import { startConversation } from "./lib/chat-helper";
import type { PageType, AccountType, User } from "./types";

export default function App() {
  // Navigation state
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>(null);
  const [showAccountTypeDialog, setShowAccountTypeDialog] = useState(false);
  
  // User state
  const [user, setUser] = useState<User | null>(null);
  
  // App initialization state
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [dbSetupNeeded, setDbSetupNeeded] = useState(false);
  
  // Page-specific navigation state
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [chatParams, setChatParams] = useState<{
    adopterId: string;
    animalId: string;
  } | null>(null);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Implementacao pra salvar id pra usuario visualizar o perfil de outro
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setLoading(true);
      setInitError(null);
      setDbSetupNeeded(false);
      
      console.log("Initializing Adotaí application...");

      // Initialize sample data
      try {
        await api.initializeData();
        console.log("Sample data initialized successfully");
      } catch (initDataError: any) {
        console.error("Error initializing sample data:", initDataError);
        
        if (initDataError.message.includes("table") || 
            initDataError.message.includes("schema") ||
            initDataError.message.includes("PGRST205")) {
          setDbSetupNeeded(true);
        }
      }

      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const userData = await api.getUser(session.user.id);
          setUser(userData);
        } catch (error) {
          console.error("Error fetching user data:", error);
          await supabase.auth.signOut();
        }
      }

      console.log("Application initialized successfully");
    } catch (error) {
      console.error("Error initializing app:", error);
      setInitError("Erro ao inicializar aplicação. Verifique se o banco de dados está configurado.");
    } finally {
      setLoading(false);
    }
  };

  // Navigation functions
  const navigateTo = (page: PageType) => setCurrentPage(page);
  
  const resetNavigation = () => {
    setCurrentPage('home');
    setSelectedAccountType(null);
    setSelectedAnimalId(null);
    setSelectedRequestId(null);
    setChatParams(null);
  };

  // Auth functions
  const handleLogin = async (email: string, password: string) => {
    try {
      const { user: userData, isAdmin } = await api.signin(email, password);
      setUser(userData);
      
      if (isAdmin || userData.type === 'admin') {
        navigateTo('admin-dashboard');
      } else if (selectedAnimalId && userData.type === 'adopter') {
        // Redireciona para a página de solicitação de adoção se há um animal selecionado
        navigateTo('adoption-request');
      } else {
        navigateTo('home');
      }
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const handleAdminLogin = async (email: string, password: string) => {
    return handleLogin(email, password);
  };

  const handleSignup = async (userData: {
    email: string;
    password: string;
    name: string;
    type: 'adopter' | 'advertiser';
    phone: string;
    address: string;
  }) => {
    try {
      const { user: newUser } = await api.signup(userData);
      setUser(newUser);
      navigateTo('home');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      resetNavigation();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Account creation flow
  const handleCreateAccount = () => setShowAccountTypeDialog(true);
  
  const handleSelectAccountType = (type: 'adopter' | 'advertiser') => {
    setSelectedAccountType(type);
    navigateTo('create-account');
    setShowAccountTypeDialog(false);
  };

  // Chat functions
  const handleStartConversation = async (animalId: string, advertiserId: string) => {
    if (!user) {
      // Salvar dados para após login
      setSelectedAnimalId(animalId);
      navigateTo('login');
      return;
    }

    if (user.type !== 'adopter') {
      alert('Apenas adotantes podem iniciar conversas.');
      return;
    }

    try {
      const conversationId = await startConversation(animalId, advertiserId);
      setSelectedConversationId(conversationId);
      navigateTo('simple-chat');
    } catch (error: any) {
      console.error('Erro ao iniciar conversa:', error);
      alert(error.message || 'Erro ao iniciar conversa');
    }
  };

  // Perfil
  const handleViewProfile = (userId: string) => {
    setViewingProfileId(userId);
    navigateTo('user-profile');
  };

  const handleViewAnimalDetails = (animalId: string) => {
    setSelectedAnimalId(animalId);
    navigateTo(user ? 'animal-details' : 'login');
  };


  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onViewDetails={handleViewAnimalDetails} 
            onViewAnimals={() => navigateTo('search')}
            onViewProfile={handleViewProfile}
            onAdoptAnimal={(animalId) => {
              console.log('onAdoptAnimal called with animalId:', animalId, 'user:', user);
              if (user?.type === 'adopter') {
                setSelectedAnimalId(animalId);
                navigateTo('adoption-request');
              } else if (user?.type === 'advertiser') {
                // Anunciantes não podem adotar seus próprios animais
                alert('Anunciantes não podem solicitar adoção. Crie uma conta de adotante.');
              } else if (!user) {
                // Salva o ID do animal para redirecionamento após login
                setSelectedAnimalId(animalId);
                navigateTo('login');
              }
            }}
            onStartConversation={handleStartConversation}
            user={user}
          />
        );
      
      case 'search':
        return (
          <SearchPage 
            onViewDetails={handleViewAnimalDetails} 
            onViewProfile={handleViewProfile}
            onAdoptAnimal={(animalId) => {
              if (user?.type === 'adopter') {
                setSelectedAnimalId(animalId);
                navigateTo('adoption-request');
              } else if (!user) {
                navigateTo('login');
              }
            }}
            user={user}
          />
        );
      
      case 'adoption':
        return <ResponsibleAdoptionPage />;
      
      case 'animal-details':
        return selectedAnimalId ? (
          <AnimalDetailsPage
            animalId={selectedAnimalId}
            user={user}
            onBack={() => navigateTo('search')}
            // Conectando as funções que a página precisa:
            onNavigateToProfile={handleViewProfile}
            onStartConversation={handleStartConversation}
            onAdopt={(animalId) => { // Lógica para o botão "Quero Adotar"
              setSelectedAnimalId(animalId);
              navigateTo('adoption-request');
            }}
          />
        ) : null;
      
      case 'login':
        return (
          <LoginPage
            onBack={() => navigateTo('home')}
            onForgotPassword={() => navigateTo('forgot-password')}
            onCreateAccount={handleCreateAccount}
            onLogin={handleLogin}
          />
        );
      
      case 'create-account':
         return (selectedAccountType && (selectedAccountType === 'adopter' || selectedAccountType === 'advertiser')) ? (
          <CreateAccountPage 
          accountType={selectedAccountType} 
          onBack={() => {
            navigateTo('home');
            setSelectedAccountType(null);
          }}
          onSignup={handleSignup}
          />
          ) : null;
      
      case 'forgot-password':
        return (
          <ForgotPasswordPage
            onBack={() => navigateTo('login')}
            onBackToLogin={() => navigateTo('login')}
          />
        );
      
      case 'admin-login':
        return (
          <AdminLoginPage
            onBack={() => navigateTo('home')}
            
            onLogin={handleAdminLogin} 
          />
        );

      case 'dashboard':
        if (!user) return null;
        
        if (user.type === 'advertiser') {
          return (
            <AdvertiserProfilePage 
              onBack={() => navigateTo('home')}
              onRegisterAnimal={() => navigateTo('register-animal')}
              onViewRequests={(animalId) => {
                setSelectedAnimalId(animalId);
                navigateTo('animal-requests');
              }}
              onViewAllRequests={() => navigateTo('requests-panel')}
              user={user}
            />
          );
        } else if (user.type === 'adopter') {
          return (
            <AdopterDashboard
              onBack={() => navigateTo('home')}
              onStartChat={(adopterId, animalId) => {
                setChatParams({ adopterId, animalId });
                navigateTo('chat');
              }}
              user={user}
            />
          );
        }
        return null;
      
      case 'register-animal':
        return user?.type === 'advertiser' ? (
          <RegisterAnimalPage 
            onBack={() => navigateTo('dashboard')}
            onRegisterSuccess={() => {
              // Recarregar dados do anunciante se a função estiver disponível
              if (window.__refreshAdvertiserData) {
                window.__refreshAdvertiserData();
              }
              navigateTo('dashboard');
            }}
            user={user}
          />
        ) : null;
      
      
      case 'admin-dashboard':
        return user?.type === 'admin' ? (
          <AdminDashboard
            onBack={() => navigateTo('home')}
            onLogout={handleLogout}
          />
        ) : null;

      case 'adoption-request':
        return selectedAnimalId && user?.type === 'adopter' ? (
          <AdoptionRequestPage
            onBack={() => navigateTo('search')}
            animalId={selectedAnimalId}
            onStartChat={(adopterId, animalId) => {
              setChatParams({ adopterId, animalId });
              navigateTo('chat');
            }}
          />
        ) : null;
      
      case 'animal-requests':
        return selectedAnimalId && user?.type === 'advertiser' ? (
          <AnimalRequestsPage
            onBack={() => navigateTo('dashboard')}
            animalId={selectedAnimalId}
            onStartChat={(adopterId, animalId) => {
              setChatParams({ adopterId, animalId });
              navigateTo('chat');
            }}
          />
        ) : null;
      
      case 'requests-panel':
        return user?.type === 'advertiser' ? (
          <AdvertiserRequestsPanel
            onBack={() => navigateTo('dashboard')}
            onViewRequest={(requestId) => {
              setSelectedRequestId(requestId);
              navigateTo('request-details');
            }}
            onStartChat={(adopterId, animalId) => {
              setChatParams({ adopterId, animalId });
              navigateTo('chat');
            }}
          />
        ) : null;
      
      case 'request-details':
        return selectedRequestId ? (
          <RequestDetailsPage
            onBack={() => navigateTo('requests-panel')}
            requestId={selectedRequestId}
            onStartChat={(adopterId, animalId) => {
              setChatParams({ adopterId, animalId });
              navigateTo('chat');
            }}
          />
        ) : null;
      
      case 'conversations':
        return user ? (
          <ConversationsList
            onBack={() => navigateTo('dashboard')}
            onStartChat={(adopterId, animalId) => {
              setChatParams({ adopterId, animalId });
              navigateTo('chat');
            }}
          />
        ) : null;
      
      case 'chat':
        return chatParams && user ? (
          <ChatPage
            onBack={() => navigateTo('dashboard')}
            adopterId={chatParams.adopterId}
            animalId={chatParams.animalId}
            currentUserId={user.id}
            currentUserType={user.type as 'adopter' | 'advertiser'}
          />
        ) : null;
      
      case 'simple-conversations':
        return user ? (
          <SimpleConversationsList
            onBack={() => navigateTo('dashboard')}
            onSelectConversation={(conversationId) => {
              setSelectedConversationId(conversationId);
              navigateTo('simple-chat');
            }}
          />
        ) : null;
      
      case 'simple-chat':
        return selectedConversationId && user ? (
          <SimpleChatPage
            conversationId={selectedConversationId}
            onBack={() => navigateTo('simple-conversations')}
          />
        ) : null;
      
      case 'user-profile':
        console.log(`[App.tsx] Renderizando a página 'user-profile' para o ID: ${viewingProfileId}`);

        return viewingProfileId ? (
          <UserProfilePage
            userId={viewingProfileId}
            currentUser={user} // Passa o usuário logado para comparações
            onBack={() => window.history.back()} // Uma forma simples de voltar
            onViewAnimalDetails={handleViewAnimalDetails} 
          />
        ) : null;


      default:
        return null;
      
      
    }
  };

  const shouldShowFooter = ![
    'create-account', 'login', 'forgot-password', 'register-animal', 
    'dashboard', 'animal-requests', 'chat', 'adoption-request', 
    'requests-panel', 'request-details', 'conversations', 'simple-conversations', 'simple-chat', 'admin-login', 'admin-dashboard', 'user-profile',
  ].includes(currentPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando Adotaí...</p>
          <p className="mt-2 text-sm text-gray-500">Preparando dados do sistema...</p>
        </div>
      </div>
    );
  }

  if (initError || dbSetupNeeded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
            </svg>
          </div>
          
          {dbSetupNeeded ? (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-4">Configuração do Banco de Dados Necessária</h1>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-yellow-800 mb-3">
                  As tabelas do banco de dados precisam ser criadas. Siga os passos abaixo:
                </p>
                <ol className="text-left text-sm text-yellow-700 space-y-2">
                  <li>1. Acesse o Supabase Dashboard do seu projeto</li>
                  <li>2. Vá para "SQL Editor"</li>
                  <li>3. Execute o script SQL disponível no arquivo:</li>
                  <li className="pl-4 font-mono text-xs bg-yellow-100 p-2 rounded">
                    /supabase/functions/server/create_tables.sql
                  </li>
                  <li>4. Recarregue esta página após executar o script</li>
                </ol>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Recarregar após Configuração
              </button>
            </>
          ) : (
            <>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Erro de Inicialização</h1>
              <p className="text-red-600 mb-4">{initError}</p>
              <div className="space-x-3">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Recarregar Página
                </button>
                <button
                  onClick={() => {
                    setInitError(null);
                    setDbSetupNeeded(false);
                    setLoading(false);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Continuar Sem Dados
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header 
        currentPage={currentPage} 
        onNavigate={navigateTo}
        onCreateAccount={handleCreateAccount}
        onLogin={() => navigateTo('login')}
        onAdminLogin={() => navigateTo('admin-login')}
        onViewProfile={handleViewProfile}
        user={user}
        onLogout={handleLogout}
      />
      
      {renderCurrentPage()}
      
      {shouldShowFooter && <Footer />}

      <AccountTypeDialog
        isOpen={showAccountTypeDialog}
        onClose={() => setShowAccountTypeDialog(false)}
        onSelectType={handleSelectAccountType}
      />

      {/* Quick access for adopter dashboard */}
      {user?.type === 'adopter' && currentPage === 'home' && (
        <div className="fixed bottom-4 left-4 z-50">
          <button
            onClick={() => navigateTo('dashboard')}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <span className="text-sm">Meu Painel</span>
          </button>
        </div>
        
        
      )}
      
      {/* Componente de diagnóstico para debug */}
      <ChatDiagnostic />
    </div>
  );
}
