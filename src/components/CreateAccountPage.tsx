import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  User, 
  Building2, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Camera,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react";

interface CreateAccountPageProps {
  onLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  accountType: 'adopter' | 'advertiser';
  onBack: () => void;
  onSignup: (userData: {
    email: string;
    password: string;
    name: string;
    type: 'adopter' | 'advertiser';
    phone: string;
    address: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function CreateAccountPage({ accountType, onBack, onSignup,onLogin }: CreateAccountPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    cep: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',

    shelterName: '',
    cnpj: '',
    profilePhoto: null as File | null
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePhoto: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError(null);

    const fullAddress = `${formData.street}, ${formData.number}, ${formData.neighborhood} - ${formData.city}, ${formData.state}`;

    const nameToSend = accountType === 'advertiser' ? formData.shelterName : formData.fullName;

    // Adicionado um console.log para você ver o que está sendo enviado
    const userDataToSend = {
      email: formData.email,
      password: formData.password,
      name: nameToSend, // <-- Usando a variável com o nome correto
      type: accountType,
      phone: formData.phone,
      address: fullAddress,
    };
    console.log("Enviando para a API:", userDataToSend);
    // --- FIM DA LÓGICA CORRIGIDA ---

    try {
      const result = await onSignup({
        email: formData.email,
        password: formData.password,
        name: nameToSend,
        type: accountType,
        phone: formData.phone,
        address: fullAddress,
      });
      
      if (!result.success) {
        setError(result.error || 'Erro ao criar conta');
      }

      const { error: signInError } = await onLogin(formData.email, formData.password);

      if (signInError) {
        setError(`Conta criada, mas houve um erro ao fazer login: ${signInError}`);
        // Neste caso, você pode querer redirecionar para a página de login
      } else {
        // Sucesso! O usuário está cadastrado E logado.
        // A navegação para o dashboard (geralmente tratada pelo componente pai
        // ao detectar a mudança de estado de autenticação) agora vai funcionar.
      }
      // If successful, the parent component will handle navigation
    } catch (err) {
      setError('Erro inesperado ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const isAdopter = accountType === 'adopter';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Pega o valor atual do input
    const rawValue = e.target.value;

    // 2. Remove tudo que não for número usando uma expressão regular
    const digitsOnly = rawValue.replace(/\D/g, '');

    // 3. Limita a quantidade de dígitos a 11 (DDD + 9 dígitos)
    const limitedDigits = digitsOnly.slice(0, 11);

    // 4. Aplica a máscara
    let maskedValue = limitedDigits;
    if (limitedDigits.length > 2) {
      maskedValue = `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2)}`;
    }
    if (limitedDigits.length > 7) {
      maskedValue = `(${limitedDigits.slice(0, 2)}) ${limitedDigits.slice(2, 7)}-${limitedDigits.slice(7)}`;
    }
    
    // 5. Atualiza o estado
    setFormData(prev => ({
      ...prev,
      phone: maskedValue
    }));
  };

  // coloca o tracinho conforme o cep é digitado
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digitsOnly = rawValue.replace(/\D/g, '');
    const limitedDigits = digitsOnly.slice(0, 8); // CEP tem 8 dígitos

    let maskedValue = limitedDigits;
    if (limitedDigits.length > 5) {
      maskedValue = `${limitedDigits.slice(0, 5)}-${limitedDigits.slice(5)}`;
    }

    setFormData(prev => ({
      ...prev,
      cep: maskedValue
    }));
  };

  // vamos achar o endereço pelo cep fornecido
  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, ''); // Remove caracteres não numéricos

    if (cep.length !== 8) {
      return; // Se o CEP não tiver 8 dígitos, não faz nada
    }

    setLoading(true); // Ativa o estado de carregamento
    setError(null);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (data.erro) {
        setError('CEP não encontrado. Verifique o número digitado.');
        return;
      }

      // Preenche o formulário com os dados retornados
      setFormData(prev => ({
        ...prev,
        street: data.logradouro,
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
      }));

    } catch (err) {
      setError('Não foi possível buscar o CEP. Tente novamente.');
    } finally {
      setLoading(false); // Desativa o estado de carregamento
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
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
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isAdopter ? 'bg-red-100' : 'bg-blue-100'
              }`}>
                {isAdopter ? (
                  <User className="h-8 w-8 text-red-600" />
                ) : (
                  <Building2 className="h-8 w-8 text-blue-600" />
                )}
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Criar Conta
            </h1>
            <Badge variant={isAdopter ? "destructive" : "default"} className="text-sm">
              {isAdopter ? 'Adotante' : 'Anunciante (Abrigo/Protetor)'}
            </Badge>
          </div>
        </div>

        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
              {/* Foto de Perfil */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                    {formData.profilePhoto ? (
                      <ImageWithFallback
                        src={URL.createObjectURL(formData.profilePhoto)}
                        alt="Preview da foto"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
                <p className="text-sm text-gray-600">Clique para adicionar uma foto</p>
              </div>

              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  <User className="h-4 w-4 inline mr-2" />
                  Nome Completo *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Digite seu nome completo"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="h-4 w-4 inline mr-2" />
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              {/* Telefone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      <Phone className="h-4 w-4 inline mr-2" />
                      Telefone *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      // ALTERADO AQUI: usamos o novo manipulador
                      onChange={handlePhoneChange} 
                      placeholder="(99) 99999-9999"
                      // NOVO: Limita o tamanho máximo do campo
                      maxLength={15}
                    />
                  </div>

              {/* CEP */}
                  <div className="space-y-2">
                    <Label htmlFor="cep">
                      <MapPin className="h-4 w-4 inline mr-2" />
                      CEP *
                    </Label>
                    <Input
                      id="cep"
                      type="text"
                      required
                      value={formData.cep}
                      
                      onChange={handleCepChange} 
                      onBlur={handleCepBlur} 
                      placeholder="00000-000"
                      maxLength={9} // 8 números + 1 tracinho
                    />
                  </div>

                  {/* Endereço com 2 colunas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Rua */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street">Rua / Logradouro *</Label>
                      <Input
                        id="street"
                        type="text"
                        required
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        placeholder="Nome da rua"
                        disabled={loading} // Desabilita enquanto busca o CEP
                      />
                    </div>
                    {/* Número */}
                    <div className="space-y-2">
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        type="text"
                        required
                        value={formData.number}
                        onChange={(e) => handleInputChange('number', e.target.value)}
                        placeholder="Ex: 123"
                      />
                    </div>
                  </div>

                  {/* Bairro, Cidade e Estado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        type="text"
                        required
                        value={formData.neighborhood}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                        placeholder="Nome do bairro"
                        disabled={loading}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="city">Cidade *</Label>
                        <Input
                          id="city"
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          placeholder="Sua cidade"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">UF *</Label>
                        <Input
                          id="state"
                          type="text"
                          required
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          placeholder="MG"
                          disabled={loading}
                          maxLength={2}
                        />
                      </div>
                    </div>
                  </div>

              {/* Campos específicos para Anunciantes */}
              {!isAdopter && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">
                      Informações da Organização
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shelterName">
                      <Building2 className="h-4 w-4 inline mr-2" />
                      Nome do Abrigo/Organização *
                    </Label>
                    <Input
                      id="shelterName"
                      type="text"
                      required
                      value={formData.shelterName}
                      onChange={(e) => handleInputChange('shelterName', e.target.value)}
                      placeholder="Nome da sua organização"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">
                      CNPJ (Opcional)
                    </Label>
                    <Input
                      id="cnpj"
                      type="text"
                      value={formData.cnpj}
                      onChange={(e) => handleInputChange('cnpj', e.target.value)}
                      placeholder="00.000.000/0000-00"
                    />
                    <p className="text-xs text-gray-500">
                      Apenas para organizações formalizadas
                    </p>
                  </div>
                </>
              )}

              {/* Senha */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Definir Senha
                </h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Senha *
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  <Lock className="h-4 w-4 inline mr-2" />
                  Confirmar Senha *
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Digite a senha novamente"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Botão Submit */}
              <div className="pt-6">
                <Button 
                  type="submit" 
                  className={`w-full ${
                    isAdopter 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  } text-white`}
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Criando conta...' : `Criar Conta ${isAdopter ? 'de Adotante' : 'de Anunciante'}`}
                </Button>
              </div>

              <div className="text-center text-sm text-gray-600">
                Já tem uma conta?{" "}
                <button type="button" className="text-red-500 hover:text-red-600">
                  Faça login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}