import { Heart, Menu, X, Plus, User as UserIcon, LogOut, Shield, MessageCircle, UserRoundPen } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import type { User, PageType } from "../types";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: PageType) => void;
  onCreateAccount: () => void;
  onLogin: () => void;
  onViewProfile: (userId: string) => void; 
  onAdminLogin: () => void;
  user: User | null;
  onLogout: () => void;
}

export function Header({ currentPage, onNavigate, onCreateAccount, onLogin, onAdminLogin, user, onLogout, onViewProfile }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleRegisterAnimal = () => {
    onNavigate('register-animal');
    setIsMenuOpen(false);
  };

  const handleProfile = () => {
    if (user?.type === 'admin') {
      onNavigate('admin-dashboard');
    } else {
      onNavigate('dashboard');
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <Heart className="h-8 w-8 text-red-500" />
            <span className="text-xl font-bold text-gray-900">Adotaí</span>
          </div>

          {/* Desktop Navigation */}
          {user?.type !== 'admin' && (
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => onNavigate('home')}
                className={`transition-colors ${
                  currentPage === 'home' 
                    ? 'text-red-500' 
                    : 'text-gray-700 hover:text-red-500'
                }`}
              >
                Início
              </button>
              <button
                onClick={() => onNavigate('search')}
                className={`transition-colors ${
                  currentPage === 'search' 
                    ? 'text-red-500' 
                    : 'text-gray-700 hover:text-red-500'
                }`}
              >
                Buscar Animais
              </button>
              <button
                onClick={() => onNavigate('adoption')}
                className={`transition-colors ${
                  currentPage === 'adoption' 
                    ? 'text-red-500' 
                    : 'text-gray-700 hover:text-red-500'
                }`}
              >
                Adoção Responsável
              </button>
            </nav>
          )}

          {/* Auth Section - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Botão de Cadastrar Animal - apenas para anunciantes */}
                {user.type === 'advertiser' && (
                  <Button 
                    onClick={handleRegisterAnimal}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Animal
                  </Button>
                )}
                
                {/* Menu do usuário - Dropdown customizado */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  >
                    {user.type === 'admin' ? (
                      <Shield className="h-4 w-4 text-purple-600" />
                    ) : (
                      <UserIcon className="h-4 w-4" />
                    )}
                    <span>{user.name}</span>
                  </Button>
                  
                  {isUserMenuOpen && (
                    <>
                      {/* Backdrop para fechar o menu */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      
                      {/* Menu dropdown */}
                      <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                        <div className="py-1">
                          {user.type === 'admin' ? (
                            <button
                              onClick={() => {
                                handleProfile();
                                setIsUserMenuOpen(false);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Painel Admin
                            </button>
                          ) : user.type === 'adopter' ? (
                            <>
                              <button
                                onClick={() => {
                                  handleProfile();
                                  setIsUserMenuOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <UserRoundPen className="h-4 w-4 mr-2" />
                                Meu Painel
                              </button>
                              <button
                                onClick={() => {
                                  onViewProfile(user.id);
                                  setIsUserMenuOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <UserIcon className="h-4 w-4 mr-2" />
                                <span className="text-sm">Meu Perfil</span>
                              </button>
                              <button
                                onClick={() => {
                                  onNavigate('simple-conversations');
                                  setIsUserMenuOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Minhas Conversas
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  handleProfile();
                                  setIsUserMenuOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <UserRoundPen className="h-4 w-4 mr-2" />
                                Meu Painel
                              </button>
                              <button
                                onClick={() => {onViewProfile(user.id);
                                  setIsUserMenuOpen(false);}
                                }
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <UserIcon className="h-4 w-4 mr-2" />
                                <span className="text-sm">Meu Perfil</span>
                              </button>
                              <button
                                onClick={() => {
                                  onNavigate('simple-conversations');
                                  setIsUserMenuOpen(false);
                                }}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Minhas Conversas
                              </button>
                            </>
                          )}
                          
                          <hr className="my-1 border-gray-200" />
                          
                          <button
                            onClick={() => {
                              onLogout();
                              setIsUserMenuOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sair
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Button 
                  variant="outline"
                  onClick={onLogin}
                >
                  Entrar
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={onAdminLogin}
                  className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Button>
                <Button 
                  className="bg-red-500 hover:bg-red-600 text-white"
                  onClick={onCreateAccount}
                >
                  Criar Conta
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {user?.type !== 'admin' && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('home');
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 transition-colors ${
                      currentPage === 'home' 
                        ? 'text-red-500' 
                        : 'text-gray-700 hover:text-red-500'
                    }`}
                  >
                    Início
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('search');
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 transition-colors ${
                      currentPage === 'search' 
                        ? 'text-red-500' 
                        : 'text-gray-700 hover:text-red-500'
                    }`}
                  >
                    Buscar Animais
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('adoption');
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-3 py-2 transition-colors ${
                      currentPage === 'adoption' 
                        ? 'text-red-500' 
                        : 'text-gray-700 hover:text-red-500'
                    }`}
                  >
                    Adoção Responsável
                  </button>
                </>
              )}
              
              {user ? (
                <div className="px-3 py-2 space-y-2 border-t mt-2">
                  <div className="text-sm text-gray-600 flex items-center">
                    {user.type === 'admin' ? (
                      <Shield className="h-4 w-4 mr-2 text-purple-600" />
                    ) : (
                      <UserIcon className="h-4 w-4 mr-2" />
                    )}
                    Olá, {user.name}
                  </div>
                  <Button 
                    onClick={handleProfile}
                    variant="outline" 
                    className="w-full"
                    size="sm"
                  >
                    {user.type === 'admin' ? (
                      <>
                        <Shield className="h-4 w-4 mr-2" />
                        Painel Admin
                      </>
                    ) : user.type === 'adopter' ? (
                      <>
                        <UserIcon className="h-4 w-4 mr-2" />
                        Meu Painel
                      </>
                    ) : (
                      <>
                        <UserIcon className="h-4 w-4 mr-2" />
                        Meu Perfil
                      </>
                    )}
                  </Button>
                  {user.type === 'advertiser' && (
                    <Button 
                      onClick={handleRegisterAnimal}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Animal
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => {
                      onLogout();
                      setIsMenuOpen(false);
                    }}
                    size="sm"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </div>
              ) : (
                <div className="px-3 py-2 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      onLogin();
                      setIsMenuOpen(false);
                    }}
                  >
                    Entrar
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full text-purple-600"
                    onClick={() => {
                      onAdminLogin();
                      setIsMenuOpen(false);
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                  <Button 
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                    onClick={() => {
                      onCreateAccount();
                      setIsMenuOpen(false);
                    }}
                  >
                    Criar Conta
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}