import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  translateSpecies,
  translateSize,
  translateGender,
} from "../utils/translate";
import { 
  ArrowLeft, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  Home,
  Briefcase,
  DollarSign,
  Clock,
  PawPrint
} from "lucide-react";
import { api } from "../lib/api";
import type { Animal } from "../types";

interface AdoptionRequestPageProps {
  animalId: string;
  onBack: () => void;
  onStartChat: (adopterId: string, animalId: string) => void;
}

export function AdoptionRequestPage({ animalId, onBack, onStartChat }: AdoptionRequestPageProps) {
  const [formData, setFormData] = useState({
    reason: "",
    experience: "",
    housing: "",
    lifestyle: "",
    veterinaryCare: "",
    emergencyContact: "",
    hasOtherPets: false,
    hasChildren: false,
    workSchedule: "",
    monthlyBudget: "",
    previousPets: "",
    housingType: "",
    hasYard: false,
    timeAtHome: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnimal();
  }, [animalId]);

  const fetchAnimal = async () => {
    try {
      setLoading(true);
      setError(null);
      const animalData = await api.getAnimal(animalId);
      setAnimal(animalData);
    } catch (err) {
      console.error('Error fetching animal:', err);
      setError('Erro ao carregar informações do animal.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal) return;
    
    setIsSubmitting(true);
    setError(null); // Clear any previous errors

    try {
      console.log('Submitting adoption request for animal:', animal.id);
      console.log('Form data:', formData);
      
      // Compor mensagem detalhada com informações adicionais
      const additionalInfo = [];
      if (formData.experience) additionalInfo.push(`Experiência: ${formData.experience}`);
      if (formData.veterinaryCare) additionalInfo.push(`Cuidados veterinários: ${formData.veterinaryCare}`);
      if (formData.emergencyContact) additionalInfo.push(`Contato emergência: ${formData.emergencyContact}`);
      if (formData.lifestyle) additionalInfo.push(`Estilo de vida: ${formData.lifestyle}`);
      
      const fullMessage = `${formData.reason}${additionalInfo.length > 0 ? '\n\nInformações adicionais:\n' + additionalInfo.join('\n') : ''}`;
      
      await api.createAdoptionRequest({
        animal_id: animal.id,
        message: fullMessage,
        status: 'pending'
      });
      
      console.log('Adoption request submitted successfully!');
      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting adoption request:', err);
      setError(err.message || 'Erro ao enviar pedido de adoção. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-6 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <Card>
            <CardContent className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Pedido Enviado com Sucesso!
              </h2>
              <p className="text-gray-600 mb-6">
                Seu pedido de adoção para {animal?.name} foi enviado para {animal?.advertiser_name}. 
                Você receberá uma resposta em breve.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => onStartChat(animal?.advertiser_id || "1", animalId)}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Conversar com {animal?.advertiser_name}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onBack}
                  className="w-full"
                >
                  Voltar para Busca
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-6 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando informações do animal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-6 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error || 'Animal não encontrado'}</p>
              {error && (
                <details className="text-left text-sm text-gray-600 mb-4">
                  <summary className="cursor-pointer hover:text-gray-800">Detalhes do erro</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">{error}</pre>
                </details>
              )}
            </div>
            <Button onClick={fetchAnimal} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Animal Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-0">
                <div className="aspect-square relative">
                  <ImageWithFallback
                    src={animal.image_url || animal.image || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop'}
                    alt={animal.name}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                </div>
                
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">{animal.name}</h2>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p>{translateSpecies(animal.species)} • {animal.breed || 'Não informado'}</p>
                    <p>{animal.age ? `${animal.age} ${animal.age === 1 ? 'ano' : 'anos'}` : 'Idade não informada'} • {translateSize(animal.size)|| 'Porte não informado'}</p>
                    <p className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {animal.advertiser_name}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Características:</p>
                    <div className="flex flex-wrap gap-1">
                      {animal.characteristics?.map((char, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {char}
                        </Badge>
                      )) || (
                        <Badge variant="outline" className="text-xs">
                          Informações disponíveis no contato
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">{animal.description}</p>
                  
                  {animal.special_needs && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Necessidades especiais:</strong> {animal.special_needs}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Adoption Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PawPrint className="h-5 w-5 mr-2" />
                  Pedido de Adoção - {animal.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Motivação */}
                  <div>
                    <Label htmlFor="reason" className="text-base font-medium">
                      Por que você quer adotar {animal.name}? *
                    </Label>
                    <Textarea
                      id="reason"
                      placeholder="Conte sobre sua motivação para adotar este animal..."
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      className="mt-2"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Experiência */}
                  <div>
                    <Label htmlFor="experience">
                      Qual sua experiência com animais de estimação?
                    </Label>
                    <Textarea
                      id="experience"
                      placeholder="Descreva sua experiência anterior com pets..."
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  {/* Informações de Moradia */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="housingType">Tipo de moradia *</Label>
                      <Select value={formData.housingType} onValueChange={(value) => handleInputChange('housingType', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="casa">Casa</SelectItem>
                          <SelectItem value="apartamento">Apartamento</SelectItem>
                          <SelectItem value="sitio">Sítio/Chácara</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="timeAtHome">Tempo em casa por dia *</Label>
                      <Select value={formData.timeAtHome} onValueChange={(value) => handleInputChange('timeAtHome', value)}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="integral">Período integral</SelectItem>
                          <SelectItem value="meio">Meio período</SelectItem>
                          <SelectItem value="poucas-horas">Poucas horas</SelectItem>
                          <SelectItem value="final-semana">Apenas finais de semana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasYard"
                      checked={formData.hasYard}
                      onCheckedChange={(checked) => handleInputChange('hasYard', checked as boolean)}
                    />
                    <Label htmlFor="hasYard">Possui quintal ou área externa?</Label>
                  </div>

                  {/* Informações Familiares */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasChildren"
                        checked={formData.hasChildren}
                        onCheckedChange={(checked) => handleInputChange('hasChildren', checked as boolean)}
                      />
                      <Label htmlFor="hasChildren">Há crianças na casa?</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasOtherPets"
                        checked={formData.hasOtherPets}
                        onCheckedChange={(checked) => handleInputChange('hasOtherPets', checked as boolean)}
                      />
                      <Label htmlFor="hasOtherPets">Possui outros pets?</Label>
                    </div>
                  </div>

                  {/* Cuidados Veterinários */}
                  <div>
                    <Label htmlFor="veterinaryCare">
                      Como pretende cuidar da saúde do animal?
                    </Label>
                    <Textarea
                      id="veterinaryCare"
                      placeholder="Descreva como planeja cuidar da saúde veterinária..."
                      value={formData.veterinaryCare}
                      onChange={(e) => handleInputChange('veterinaryCare', e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  {/* Orçamento */}
                  <div>
                    <Label htmlFor="monthlyBudget">
                      Qual seu orçamento mensal estimado para o pet?
                    </Label>
                    <Select value={formData.monthlyBudget} onValueChange={(value) => handleInputChange('monthlyBudget', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecione uma faixa..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ate-200">Até R$ 200</SelectItem>
                        <SelectItem value="200-500">R$ 200 - R$ 500</SelectItem>
                        <SelectItem value="500-1000">R$ 500 - R$ 1.000</SelectItem>
                        <SelectItem value="acima-1000">Acima de R$ 1.000</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contato de Emergência */}
                  <div>
                    <Label htmlFor="emergencyContact">
                      Contato de emergência (nome e telefone)
                    </Label>
                    <Input
                      id="emergencyContact"
                      placeholder="Ex: João Silva - (11) 99999-9999"
                      value={formData.emergencyContact}
                      onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  {/* Informações Adicionais */}
                  <div>
                    <Label htmlFor="lifestyle">
                      Conte mais sobre seu estilo de vida e rotina
                    </Label>
                    <Textarea
                      id="lifestyle"
                      placeholder="Descreva sua rotina, hobbies, tempo disponível para o pet..."
                      value={formData.lifestyle}
                      onChange={(e) => handleInputChange('lifestyle', e.target.value)}
                      className="mt-2"
                      rows={3}
                    />
                  </div>

                  <div className="border-t pt-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Ao enviar este pedido, você concorda que suas informações sejam compartilhadas 
                      com o anunciante e que está ciente da responsabilidade da adoção.
                    </p>
                    
                    <div className="flex space-x-3">
                      <Button
                        type="submit"
                        disabled={isSubmitting || !formData.reason || !formData.housingType || !formData.timeAtHome}
                        className="flex-1"
                      >
                        {isSubmitting ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Heart className="h-4 w-4 mr-2" />
                            Enviar Pedido de Adoção
                          </>
                        )}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onStartChat(animal.advertiser_id, animalId)}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Conversar Primeiro
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}