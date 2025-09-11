// Em src/pages/AnimalDetailsPage.tsx

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { Animal, User } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { ArrowLeft, Heart, MessageCircle, User as UserIcon, PawPrint, Info, FileText } from 'lucide-react';
import { 
  translateSpecies,
  translateSize,
  translateGender,
} from "../utils/translate";

interface AnimalDetailsPageProps {
  animalId: string;
  user: User | null;
  onBack: () => void;
  onNavigateToProfile: (userId: string) => void;
  onStartConversation: (animalId: string, advertiserId: string) => void;
  onAdopt: (animalId: string) => void;
}

export function AnimalDetailsPage({ animalId, user, onBack, onNavigateToProfile, onStartConversation, onAdopt }: AnimalDetailsPageProps) {
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  

  useEffect(() => {
    const fetchAnimalDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getAnimal(animalId);
        console.log('DADOS DO ANIMAL RECEBIDOS DA API:', data); 
        setAnimal(data);
        setSelectedImage(data.image_url || null); // Define a imagem principal
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar detalhes do animal.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnimalDetails();
  }, [animalId]);

  useEffect(() => {
    // Registra a visualização assim que o componente for montado com um animalId válido.
    // A verificação 'user?.id !== animal?.advertiser_id' impede que o próprio dono
    // infle a contagem de views do seu anúncio.
    if (animalId && animal && user?.id !== animal.advertiser_id) {
      api.recordAnimalView(animalId);
    }
  }, [animalId, animal, user]);

  if (loading) {
    return <div className="p-8 text-center">Carregando informações do pet...</div>;
  }

  if (error || !animal) {
    return <div className="p-8 text-center text-red-600">{error || 'Animal não encontrado.'}</div>;
  }

  const isAdopter = user?.type === 'adopter';
  const isOwner = user?.id === animal.advertiser_id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para a busca
        </Button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Coluna da Esquerda: Galeria de Imagens */}
          <div>
            <div className="aspect-square w-full rounded-lg overflow-hidden mb-4 shadow-lg">
              <ImageWithFallback
                src={selectedImage || '/default-pet.svg'}
                alt={animal.name}
                className="w-full h-full object-cover"
              />
            </div>
            {animal.additional_images && animal.additional_images.length > 0 && (
              <div className="flex gap-2">
                {/* Imagem principal como thumbnail */}
                <button onClick={() => setSelectedImage(animal.image_url ?? null)} className={`w-20 h-20 rounded-md overflow-hidden border-2 ${selectedImage === animal.image_url ? 'border-red-500' : 'border-transparent'}`}>
                  <ImageWithFallback src={animal.image_url} alt="Principal" className="w-full h-full object-cover" />
                </button>
                {/* Imagens adicionais */}
                {animal.additional_images.map((imgUrl, index) => (
                  <button key={index} onClick={() => setSelectedImage(imgUrl)} className={`w-20 h-20 rounded-md overflow-hidden border-2 ${selectedImage === imgUrl ? 'border-red-500' : 'border-transparent'}`}>
                    <ImageWithFallback src={imgUrl} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Coluna da Direita: Informações e Ações */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">{animal.name}</h1>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">{translateSpecies(animal.species)}</Badge>
                <Badge variant="secondary">{animal.breed}</Badge>
                <Badge variant="secondary">{animal.age} {animal.age === 1 ? 'ano' : 'anos'}</Badge>
                <Badge variant="secondary">{translateSize(animal.size)}</Badge>
                <Badge variant="secondary">{translateGender(animal.gender ?? "") }</Badge>
              </div>
            </div>

            {/* Bloco do Anunciante */}
            <Card className="bg-white">
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Anunciado por:</p>
                  <p className="font-semibold text-gray-800">{animal.advertiser_name}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => onNavigateToProfile(animal.advertiser_id)}>
                  <UserIcon className="h-4 w-4 mr-2" />
                  Ver Perfil do Anunciante
                </Button>
              </CardContent>
            </Card>

            {/* Bloco de Ações */}
            <div className="space-y-3">
              {(isAdopter || !user) && !isOwner && (
                <>
                  <Button size="lg" className="w-full bg-red-500 hover:bg-red-600 text-white" onClick={() => onAdopt(animal.id)}>
                    <Heart className="h-5 w-5 mr-2" />
                    Quero Adotar
                  </Button>
                  <Button size="lg" className="w-full" variant="outline" onClick={() => onStartConversation(animal.id, animal.advertiser_id)}>
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Conversar com Anunciante
                  </Button>
                </>
              )}
              {isOwner && (
                 <div className="text-center p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
                  Este é um dos seus animais.
                </div>
              )}
            </div>

            {/* Abas de Detalhes */}
            <Tabs defaultValue="description">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description"><Info className="h-4 w-4 mr-1"/> Descrição</TabsTrigger>
                <TabsTrigger value="temperament"><PawPrint className="h-4 w-4 mr-1"/> Características</TabsTrigger>
                <TabsTrigger value="requirements"><FileText className="h-4 w-4 mr-1"/> Requisitos</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4 text-gray-700 text-sm">
                {animal.description}
              </TabsContent>
              <TabsContent value="temperament" className="mt-4 text-gray-700 text-sm">
                <p><strong>Temperamento:</strong> {animal.temperament || 'Não informado'}</p>
                <p><strong>Necessidades Especiais:</strong> {animal.special_needs || 'Nenhuma'}</p>
                <p><strong>Castrado:</strong> {animal.is_neutered ? 'Sim' : 'Não'}</p>
                <p><strong>Vacinado:</strong> {animal.is_vaccinated ? 'Sim' : 'Não'}</p>
                <p><strong>Vermifugado:</strong> {animal.is_dewormed ? 'Sim' : 'Não'}</p>
              </TabsContent>
              <TabsContent value="requirements" className="mt-4 text-gray-700 text-sm">
                {animal.adoption_requirements || 'Nenhum requisito específico informado.'}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}