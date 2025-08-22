import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, Shield, Eye, EyeOff } from "lucide-react";
import { api } from "../lib/api";

interface AdminLoginPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

export function AdminLoginPage({ onBack, onLoginSuccess }: AdminLoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { user, isAdmin } = await api.signin(email, password);
      
      if (user && isAdmin) {
        onLoginSuccess();
      } else {
        setError("Credenciais inválidas. Apenas administradores autorizados podem acessar.");
      }
    } catch (error: any) {
      setError(error.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-8 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full">
            <Shield className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Acesso Administrativo
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sistema restrito para administradores do Adotaí
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center">
              <Shield className="h-5 w-5 mr-2 text-purple-600" />
              Login Administrativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div>
                <Label htmlFor="email">Email Administrativo</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@adotai.com"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Verificando..." : "Acessar Sistema"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                ℹ️ Informação:
              </h4>
              <div className="text-xs text-blue-700">
                <p>Use suas credenciais de administrador cadastradas no sistema.</p>
                <p className="mt-1">Para criar um admin, contate o desenvolvedor.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Área Restrita:</strong> Este acesso é exclusivo para administradores 
              autorizados do sistema Adotaí. Todas as ações são registradas e monitoradas.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}