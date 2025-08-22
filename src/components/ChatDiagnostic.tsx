import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  MessageCircle, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  User,
  Users,
  Database
} from 'lucide-react';
import { messaging } from '../lib/messaging';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  data?: any;
}

export function ChatDiagnostic() {
  const [showCard, setShowCard] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runDiagnostic = async () => {
    setTesting(true);
    const newResults: DiagnosticResult[] = [];

    // Test 1: Check user authentication
    try {
      newResults.push({ name: 'Autenticação', status: 'loading', message: 'Verificando...' });
      const user = await api.getCurrentUser();
      if (user) {
        newResults[newResults.length - 1] = {
          name: 'Autenticação',
          status: 'success',
          message: `Logado como: ${user.name} (${user.type})`,
          data: { userId: user.id, userType: user.type }
        };
      } else {
        newResults[newResults.length - 1] = {
          name: 'Autenticação',
          status: 'error',
          message: 'Usuário não autenticado'
        };
      }
    } catch (error: any) {
      newResults[newResults.length - 1] = {
        name: 'Autenticação',
        status: 'error',
        message: `Erro: ${error.message}`
      };
    }

    setResults([...newResults]);

    // Test 2: Check database connection
    try {
      newResults.push({ name: 'Conexão DB', status: 'loading', message: 'Testando conexão...' });
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      
      newResults[newResults.length - 1] = {
        name: 'Conexão DB',
        status: 'success',
        message: 'Conexão com Supabase OK'
      };
    } catch (error: any) {
      newResults[newResults.length - 1] = {
        name: 'Conexão DB',
        status: 'error',
        message: `Erro DB: ${error.message}`
      };
    }

    setResults([...newResults]);

    // Test 3: Check conversations table
    try {
      newResults.push({ name: 'Tabela Conversations', status: 'loading', message: 'Verificando...' });
      const { data, error } = await supabase.from('conversations').select('id').limit(1);
      if (error) throw error;
      
      newResults[newResults.length - 1] = {
        name: 'Tabela Conversations',
        status: 'success',
        message: 'Tabela existe e acessível'
      };
    } catch (error: any) {
      newResults[newResults.length - 1] = {
        name: 'Tabela Conversations',
        status: 'error',
        message: `Erro: ${error.message}`
      };
    }

    setResults([...newResults]);

    // Test 4: Check messages table
    try {
      newResults.push({ name: 'Tabela Messages', status: 'loading', message: 'Verificando...' });
      const { data, error } = await supabase.from('messages').select('id').limit(1);
      if (error) throw error;
      
      newResults[newResults.length - 1] = {
        name: 'Tabela Messages',
        status: 'success',
        message: 'Tabela existe e acessível'
      };
    } catch (error: any) {
      newResults[newResults.length - 1] = {
        name: 'Tabela Messages',
        status: 'error',
        message: `Erro: ${error.message}`
      };
    }

    setResults([...newResults]);

    // Test 5: Check user conversations
    if (newResults.find(r => r.name === 'Autenticação')?.status === 'success') {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          newResults.push({ name: 'Minhas Conversas', status: 'loading', message: 'Carregando...' });
          const conversations = await messaging.getConversations(user.id);
          
          newResults[newResults.length - 1] = {
            name: 'Minhas Conversas',
            status: 'success',
            message: `${conversations.length} conversa(s) encontrada(s)`,
            data: { count: conversations.length, conversations }
          };
        }
      } catch (error: any) {
        newResults[newResults.length - 1] = {
          name: 'Minhas Conversas',
          status: 'error',
          message: `Erro: ${error.message}`
        };
      }

      setResults([...newResults]);
    }

    // Test 6: Check animals data
    try {
      newResults.push({ name: 'Animais Disponíveis', status: 'loading', message: 'Verificando...' });
      const animals = await api.getAnimals();
      const availableAnimals = animals.filter(a => a.status === 'available');
      
      newResults[newResults.length - 1] = {
        name: 'Animais Disponíveis',
        status: 'success',
        message: `${availableAnimals.length} animais disponíveis para conversa`,
        data: { count: availableAnimals.length, animals: availableAnimals.slice(0, 3) }
      };
    } catch (error: any) {
      newResults[newResults.length - 1] = {
        name: 'Animais Disponíveis',
        status: 'error',
        message: `Erro: ${error.message}`
      };
    }

    setResults([...newResults]);
    setTesting(false);
  };

  useEffect(() => {
    if (showCard && results.length === 0) {
      runDiagnostic();
    }
  }, [showCard]);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-700">OK</Badge>;
      case 'error': return <Badge className="bg-red-100 text-red-700">ERRO</Badge>;
      case 'loading': return <Badge className="bg-blue-100 text-blue-700">...</Badge>;
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button
        onClick={() => setShowCard(!showCard)}
        className="bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg"
        size="sm"
      >
        <Database className="h-4 w-4 mr-2" />
        Diagnóstico
      </Button>

      {showCard && (
        <Card className="absolute bottom-12 right-0 w-96 max-h-[80vh] overflow-auto shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-indigo-600" />
                Diagnóstico do Chat
              </div>
              <Button
                onClick={() => {
                  setResults([]);
                  runDiagnostic();
                }}
                variant="outline"
                size="sm"
                disabled={testing}
              >
                <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900">{result.name}</p>
                      <p className="text-xs text-gray-600 truncate">{result.message}</p>
                      {result.data && (
                        <div className="text-xs text-gray-500 mt-1">
                          {JSON.stringify(result.data, null, 2).substring(0, 100)}...
                        </div>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              ))}

              {results.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Clique em diagnóstico para testar</p>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-4 pt-3 border-t">
              <Button
                onClick={() => setShowCard(false)}
                variant="outline"
                size="sm"
              >
                Fechar
              </Button>
              
              {results.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  ✅ {results.filter(r => r.status === 'success').length} / 
                  ❌ {results.filter(r => r.status === 'error').length} / 
                  ⏳ {results.filter(r => r.status === 'loading').length}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
