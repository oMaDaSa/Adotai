import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Heart, MapPin, Clock, Eye, MessageCircle, Flag } from "lucide-react";
import { api } from "../lib/api";
import type { Animal, User } from "../types";
import { ReportDialog } from "./ReportDialog";
import { translateSize } from "@/utils/translate";

interface FeaturedAnimalsProps {
  onViewMore: () => void;
  onViewProfile: (userId: string) => void;
  onViewDetails: (animalId: string) => void; 
  user: User | null;
}

export function FeaturedAnimals({ onViewMore,onViewProfile, onViewDetails, user }: FeaturedAnimalsProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportingAnimalId, setReportingAnimalId] = useState<string | null>(null);


  useEffect(() => {
    fetchFeaturedAnimals();
  }, []);

  const fetchFeaturedAnimals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allAnimals = await api.getAnimals();
      // Show only available animals and limit to 6 for featured section
      const availableAnimals = allAnimals
        .filter(animal => animal.status === 'available')
        .slice(0, 6);
      
      setAnimals(availableAnimals);
    } catch (err) {
      console.error('Error fetching featured animals:', err);
      setError('Erro ao carregar animais em destaque');
    } finally {
      setLoading(false);
    }
  };

  // denuncia de anuncio

  const handleReportClick = (animalId: string) => {
    setReportingAnimalId(animalId);
    setIsReportDialogOpen(true);
  };

  const handleAdoptClick = (animalId: string) => {
    if (!user) {
      // User will be redirected to login
      onViewDetails(animalId);
    } else if (user.type === 'adopter') {
      onViewDetails(animalId);
    } else {
      // Advertiser or admin cannot adopt
      return;
    }
  };

  if (loading) {
    return (

      
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Animais em Destaque</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Conheça alguns dos nossos amigos que estão esperando por um lar cheio de amor
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Animais em Destaque</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchFeaturedAnimals} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Animais em Destaque</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Conheça alguns dos nossos amigos que estão esperando por um lar cheio de amor
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {animals.map((animal) => (
            <Card key={animal.id} className="relative overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
              { user &&
                <button
                  onClick={() => handleReportClick(animal.id)}
                  className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/70 hover:bg-white text-gray-600 hover:text-red-600 transition-colors"
                  aria-label="Denunciar anúncio"
                  title="Denunciar anúncio"
                >
                  <Flag className="h-4 w-4" />
                </button>
              }
              
              <div className="aspect-square w-full relative">
                <ImageWithFallback
                  src={animal.image_url || animal.image || '/default-pet.svg'}
                  alt={animal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex space-x-2">
                  <Badge className="bg-white text-gray-800 font-medium">
                    {animal.species === 'dog' ? '🐕 Cachorro' : 
                     animal.species === 'cat' ? '🐱 Gato' : 
                     '🐾 ' + animal.species}
                  </Badge>
                  {animal.size && (
                    <Badge variant="outline" className="bg-white text-gray-600">
                      {translateSize(animal.size)}
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{animal.name}</h3>
                  <div className="text-right text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {animal.age} {animal.age === 1 ? 'ano' : 'anos'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  {animal.advertiser_address || animal.location || 'Localização não informada'}
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {animal.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {animal.characteristics?.slice(0, 3).map((char, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {char}
                    </Badge>
                  ))}
                  {animal.characteristics?.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{animal.characteristics?.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <Button 
                    onClick={() => onViewDetails(animal.id)}
                    className="w-full bg-red-500 hover:bg-red-600 text-white"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </div>

                <div className="mt-2 text-xs text-gray-500 text-left">
                  <span>Por: </span>
                  <button 
                    onClick={() => onViewProfile(animal.advertiser_id)}
                    className="font-medium text-blue-600 hover:underline"
                    disabled={!animal.advertiser_id}
                  >
                    {animal.advertiser_name}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            onClick={onViewMore} 
            size="lg"
            className="bg-red-500 hover:bg-red-600 text-white px-8"
          >
            Ver Todos os Animais
          </Button>
        </div>
      </div>
    </section>
  );
}