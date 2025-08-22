import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Heart, Mail, ArrowLeft, CheckCircle, Info } from "lucide-react";

interface ForgotPasswordPageProps {
  onBack: () => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordPage({ onBack, onBackToLogin }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular envio de email
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              E-mail Enviado!
            </h1>
            <p className="text-gray-600">
              Verifique sua caixa de entrada
            </p>
          </div>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-6">
                Enviamos um link de recuperação para <strong>{email}</strong>. 
                Verifique sua caixa de entrada e spam.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={onBackToLogin}
                  className="w-full bg-red-500 hover:bg-red-600 text-white"
                >
                  Voltar para Login
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full"
                >
                  Enviar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Não recebeu o e-mail?{" "}
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-red-500 hover:text-red-600"
              >
                Tentar outro e-mail
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Recuperar Senha
            </h1>
            <p className="text-gray-600">
              Digite seu e-mail para receber as instruções
            </p>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Esqueceu sua senha?</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Enviaremos um link de recuperação para o e-mail cadastrado em sua conta.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  E-mail cadastrado
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
              </div>

              {/* Botão Submit */}
              <Button 
                type="submit" 
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar Link de Recuperação'}
              </Button>
            </form>

            {/* Link para voltar ao login */}
            <div className="mt-6 text-center">
              <button
                onClick={onBackToLogin}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Lembrou sua senha? Fazer login
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Informação de segurança */}
        <div className="mt-8 bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Dicas de Segurança:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• O link expira em 24 horas</li>
            <li>• Verifique a pasta de spam</li>
            <li>• Use uma senha forte ao redefinir</li>
            <li>• Nunca compartilhe suas credenciais</li>
          </ul>
        </div>
      </div>
    </div>
  );
}