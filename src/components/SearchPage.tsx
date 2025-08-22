import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Filter, MapPin, Heart, Eye } from "lucide-react";
import { api } from "../lib/api";
import type { Animal, User } from "../types";

interface SearchPageProps {
  onAdoptAnimal: (animalId: string) => void;
  user: User | null;
}

interface Filters {
  species: string;
  size: string;
  location: string;
}

export function SearchPage({ onAdoptAnimal, user }: SearchPageProps) {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<Filters>({
    species: "all",
    size: "all",
    location: "all",
  });

  const locations = [
    "São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG",
    "Brasília, DF", "Salvador, BA", "Curitiba, PR"
  ];

  useEffect(() => {
    fetchAnimals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [animals, filters]);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const availableAnimals = await api.getAvailableAnimals();
      
      setAnimals(availableAnimals);
    } catch (err) {
      console.error('Error fetching animals:', err);
      setError('Erro ao carregar animais');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...animals];

    if (filters.species && filters.species !== "all") {
      filtered = filtered.filter(animal => 
        animal.species?.toLowerCase() === filters.species.toLowerCase()
      );
    }

    if (filters.size && filters.size !== "all") {
      filtered = filtered.filter(animal => 
        animal.size?.toLowerCase() === filters.size.toLowerCase()
      );
    }

    if (filters.location && filters.location !== "all") {
      filtered = filtered.filter(animal => 
        animal.advertiser_address?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredAnimals(filtered);
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      species: "all",
      size: "all",  
      location: "all",
    });
  };

  const handleAdoptClick = (animalId: string) => {
    if (!user) {
      onAdoptAnimal(animalId);
    } else if (user.type === 'adopter') {
      onAdoptAnimal(animalId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Encontre Seu Novo Amigo</h1>
            <p className="text-gray-600">Carregando animais disponíveis...</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden animate-pulse">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Encontre Seu Novo Amigo</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAnimals} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Encontre Seu Novo Amigo</h1>
          <p className="text-gray-600">
            {filteredAnimals.length} {filteredAnimals.length === 1 ? 'animal disponível' : 'animais disponíveis'} para adoção
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="mb-4"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </Button>

          {showFilters && (
            <Card className="p-6 bg-white shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Species Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Espécie</label>
                  <Select value={filters.species} onValueChange={(value) => handleFilterChange('species', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as espécies" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as espécies</SelectItem>
                      <SelectItem value="dog">🐕 Cachorro</SelectItem>
                      <SelectItem value="cat">🐱 Gato</SelectItem>
                      <SelectItem value="bird">🐦 Pássaro</SelectItem>
                      <SelectItem value="rabbit">🐰 Coelho</SelectItem>
                      <SelectItem value="other">🐾 Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Porte</label>
                  <Select value={filters.size} onValueChange={(value) => handleFilterChange('size', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os portes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os portes</SelectItem>
                      <SelectItem value="small">Pequeno</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="large">Grande</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium mb-2">Localização</label>
                  <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as cidades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as cidades</SelectItem>
                      {locations.map(location => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Limpar Filtros
                </Button>
                <div className="text-sm text-gray-500">
                  {filteredAnimals.length} resultado{filteredAnimals.length !== 1 ? 's' : ''} encontrado{filteredAnimals.length !== 1 ? 's' : ''}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Animals Grid */}
        {filteredAnimals.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-500 mb-4">Nenhum animal encontrado com os filtros selecionados.</p>
            <Button onClick={clearFilters} variant="outline">
              Limpar Filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimals.map((animal) => (
              <Card key={animal.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
                <div className="relative h-48">
                  <ImageWithFallback
                    src={animal.image_url || animal.image || '/default-pet.svg'}
                    alt={animal.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex space-x-2">
                    <Badge className="bg-white text-gray-800 font-medium">
                      {animal.species === 'dog' ? '🐕 Cachorro' : 
                       animal.species === 'cat' ? '🐱 Gato' : 
                       animal.species === 'bird' ? '🐦 Pássaro' : 
                       animal.species === 'rabbit' ? '🐰 Coelho' : 
                       '🐾 ' + animal.species}
                    </Badge>
                    {animal.size && (
                      <Badge variant="outline" className="bg-white text-gray-600">
                        {animal.size === 'small' ? 'Pequeno' : 
                         animal.size === 'medium' ? 'Médio' : 
                         animal.size === 'large' ? 'Grande' : 
                         animal.size}
                      </Badge>
                    )}
                  </div>
                  {animal.age && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-green-100 text-green-700">
                        {animal.age} {animal.age === 1 ? 'ano' : 'anos'}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{animal.name}</h3>
                    {animal.breed && (
                      <div className="text-right text-sm text-gray-500">
                        <span>{animal.breed}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {animal.advertiser_address || 'Localização não informada'}
                  </div>

                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {animal.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {animal.color && (
                      <Badge variant="secondary" className="text-xs">
                        {animal.color}
                      </Badge>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {user && user.type === 'adopter' ? (
                      <Button 
                        onClick={() => handleAdoptClick(animal.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Quero Adotar
                      </Button>
                    ) : !user ? (
                      <Button 
                        onClick={() => handleAdoptClick(animal.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Quero Adotar
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        className="flex-1"
                        disabled
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    )}
                  </div>

                  <div className="mt-2 text-xs text-gray-500">
                    Por: {animal.advertiser_name || 'Anunciante'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
