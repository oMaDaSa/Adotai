import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { 
  Heart, 
  Upload, 
  X, 
  ArrowLeft,
  MapPin,
  Camera,
  Save,
  CheckCircle
} from "lucide-react";
import { api } from "../lib/api";
import type { User } from "../types";

interface RegisterAnimalPageProps {
  onBack: () => void;
  onRegisterSuccess?: () => void;
  user: User;
}

interface AnimalPhoto {
  id: string;
  file: File;
  preview: string;
}

export function RegisterAnimalPage({ onBack, onRegisterSuccess, user }: RegisterAnimalPageProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<AnimalPhoto[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    size: '',
    gender: '',
    weight: '',
    description: '',
    specialNeeds: '',
    vaccinated: '',
    neutered: '',
    temperament: '',
    adoptionRequirements: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto: AnimalPhoto = {
          id: Date.now().toString() + Math.random().toString(),
          file,
          preview: event.target?.result as string
        };
        setPhotos(prev => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (photoId: string) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Validar campos obrigatórios
      if (!formData.name || !formData.species || !formData.age || !formData.size || !formData.gender) {
        throw new Error('Por favor, preencha todos os campos obrigatórios');
      }

      // Validar se pelo menos uma foto foi adicionada
      if (photos.length === 0) {
        throw new Error('É obrigatório adicionar pelo menos uma foto do animal');
      }

      console.log('User object:', user);
      console.log('Form data:', formData);
      
      // Upload das fotos (agora obrigatório)
      let imageUrl = null;
      console.log('Fazendo upload de', photos.length, 'foto(s)...');
      try {
        const photoFiles = photos.map(photo => photo.file);
        const uploadedUrls = await api.uploadAnimalPhotos(user.id, photoFiles);
        imageUrl = uploadedUrls[0]; // Usar a primeira foto como principal
        console.log('Upload concluído. URL principal:', imageUrl);
      } catch (uploadError) {
        console.error('Erro no upload das fotos:', uploadError);
        throw new Error('Erro ao fazer upload das fotos. Tente novamente.');
      }
      
      // Preparar dados para envio
      const animalData = {
        name: formData.name,
        species: formData.species,
        breed: formData.breed || null,
        age: parseInt(formData.age) || null,
        size: formData.size,
        gender: formData.gender,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        description: formData.description || null,
        is_neutered: formData.neutered === 'yes',
        is_vaccinated: formData.vaccinated === 'complete' || formData.vaccinated === 'partial',
        special_needs: formData.specialNeeds || null,
        temperament: formData.temperament || null,
        adoption_requirements: formData.adoptionRequirements || null,
        image_url: imageUrl,
        status: 'available' as const
        // advertiser_id será definido automaticamente pela API
      };
      
      console.log('Animal data to be sent:', animalData);

      await api.createAnimal(animalData);
      
      setIsSubmitted(true);
      
      // Chamar callback se fornecido
      if (onRegisterSuccess) {
        onRegisterSuccess();
      }
    } catch (err: any) {
      console.error('Error creating animal:', err);
      setError(err.message || 'Erro ao cadastrar animal');
    } finally {
      setIsLoading(false);
    }
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
              Animal Cadastrado!
            </h1>
            <p className="text-gray-600">
              Seu anúncio foi publicado com sucesso
            </p>
          </div>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-6">
                O <strong>{formData.name}</strong> já está disponível para adoção! 
                Interessados poderão entrar em contato através da plataforma.
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={onBack}
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                >
                  Voltar ao Painel
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setIsSubmitted(false)}
                  className="w-full"
                >
                  Cadastrar Outro Animal
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Painel
          </Button>
          
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Cadastrar Animal
            </h1>
            <p className="text-gray-600">
              Preencha as informações do animal disponível para adoção
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Exibir erro se houver */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Animal *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Ex: Buddy, Luna, Thor..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="species">Espécie *</Label>
                  <Select onValueChange={(value) => handleInputChange('species', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a espécie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Cachorro</SelectItem>
                      <SelectItem value="cat">Gato</SelectItem>
                      <SelectItem value="bird">Pássaro</SelectItem>
                      <SelectItem value="rabbit">Coelho</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="breed">Raça</Label>
                  <Input
                    id="breed"
                    value={formData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    placeholder="Ex: Labrador, Persa, SRD..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="Ex: 15.5"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age">Idade (anos) *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="0"
                    max="30"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    placeholder="Ex: 2"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="size">Porte *</Label>
                  <Select onValueChange={(value) => handleInputChange('size', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Porte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Pequeno (até 10kg)</SelectItem>
                      <SelectItem value="medium">Médio (10-25kg)</SelectItem>
                      <SelectItem value="large">Grande (25-45kg)</SelectItem>
                      <SelectItem value="giant">Gigante (45kg+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Sexo *</Label>
                  <Select onValueChange={(value) => handleInputChange('gender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sexo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Macho</SelectItem>
                      <SelectItem value="female">Fêmea</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adoptionRequirements">Requisitos para Adoção</Label>
                <Textarea
                  id="adoptionRequirements"
                  value={formData.adoptionRequirements}
                  onChange={(e) => handleInputChange('adoptionRequirements', e.target.value)}
                  placeholder="Ex: Casa com quintal, experiência com animais..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Fotos */}
          <Card>
            <CardHeader>
              <CardTitle>Fotos do Animal *</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                É obrigatório adicionar pelo menos uma foto do animal
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Clique para adicionar fotos</p>
                    <p className="text-sm text-gray-500">PNG, JPG até 10MB cada</p>
                  </label>
                </div>

                {photos.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <ImageWithFallback
                            src={photo.preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhoto(photo.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Saúde e Comportamento */}
          <Card>
            <CardHeader>
              <CardTitle>Saúde e Comportamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="vaccinated">Situação Vacinal</Label>
                  <Select onValueChange={(value) => handleInputChange('vaccinated', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete">Vacinação completa</SelectItem>
                      <SelectItem value="partial">Vacinação parcial</SelectItem>
                      <SelectItem value="none">Não vacinado</SelectItem>
                      <SelectItem value="unknown">Desconhecido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="neutered">Castração</Label>
                  <Select onValueChange={(value) => handleInputChange('neutered', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Castrado</SelectItem>
                      <SelectItem value="no">Não castrado</SelectItem>
                      <SelectItem value="unknown">Desconhecido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperament">Temperamento</Label>
                <Input
                  id="temperament"
                  value={formData.temperament}
                  onChange={(e) => handleInputChange('temperament', e.target.value)}
                  placeholder="Ex: Dócil, brincalhão, calmo, energético..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialNeeds">Necessidades Especiais</Label>
                <Textarea
                  id="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={(e) => handleInputChange('specialNeeds', e.target.value)}
                  placeholder="Descreva qualquer cuidado especial que o animal precise..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Descrição */}
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="description">Conte mais sobre o animal</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva a personalidade, história, hábitos e qualquer informação importante sobre o animal..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Botão de Submit */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                'Cadastrando...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Cadastrar Animal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}