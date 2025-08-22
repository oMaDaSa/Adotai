import { useState, useEffect } from "react";
import { AnimalCard } from "./AnimalCard";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { api } from "../lib/api";
import type { Animal } from "../types";

interface AnimalsSectionProps {
  onAdoptAnimal?: (animalId: string) => void;
}

export function AnimalsSection({ onAdoptAnimal }: AnimalsSectionProps) {
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [sizeFilter, setSizeFilter] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchAnimals();
  }, []);

  const fetchAnimals = async () => {
    try {
      setLoading(true);
      setError(null);
      const animalsData = await api.getAnimals();
      setAnimals(animalsData);
      setHasMore(animalsData.length >= 6); // Assume que se veio menos de 6, não há mais
    } catch (err) {
      console.error('Error fetching animals:', err);
      setError('Erro ao carregar animais. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Mapear dados do banco para o formato esperado pelo AnimalCard
  const adaptedAnimals = animals.map(animal => ({
    id: animal.id,
    name: animal.name,
    age: `${animal.age || 0} ${animal.age === 1 ? 'ano' : 'anos'}`,
    size: animal.size === 'small' ? 'Pequeno' : 
          animal.size === 'medium' ? 'Médio' : 'Grande',
    location: animal.advertiser_name || 'Localização não informada',
    image: animal.image || 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=400&fit=crop',
    description: animal.description || 'Descrição não informada.',
    species: animal.species
  }));

  const filteredAnimals = adaptedAnimals.filter((animal) => {
    const matchesType = typeFilter === "todos" || 
                       (typeFilter === "cão" && animal.species === 'dog') ||
                       (typeFilter === "gato" && animal.species === 'cat');
    const matchesSize = sizeFilter === "todos" || 
                       animal.size.toLowerCase() === sizeFilter;
    const matchesSearch = animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         animal.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesSize && matchesSearch;
  });

  return (
    <section id="animals" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Animais Esperando por uma Família
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Conheça nossos amiguinhos que estão prontos para encontrar um lar cheio de amor e carinho.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-6 rounded-lg shadow-sm">
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Tipo de animal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os tipos</SelectItem>
              <SelectItem value="cão">Cães</SelectItem>
              <SelectItem value="gato">Gatos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sizeFilter} onValueChange={setSizeFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Porte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os portes</SelectItem>
              <SelectItem value="pequeno">Pequeno</SelectItem>
              <SelectItem value="médio">Médio</SelectItem>
              <SelectItem value="grande">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando animais...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchAnimals} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        )}

        {/* Grade de Animais */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {filteredAnimals.map((animal) => (
              <AnimalCard 
                key={animal.id}
                animal={animal}
                onAdopt={onAdoptAnimal ? () => onAdoptAnimal(animal.id) : undefined}
                showAdoptButton={!!onAdoptAnimal}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredAnimals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum animal encontrado com os filtros selecionados.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setTypeFilter("todos");
                setSizeFilter("todos");
                setSearchTerm("");
              }}
              className="mt-4"
            >
              Limpar Filtros
            </Button>
          </div>
        )}

        {!loading && !error && hasMore && filteredAnimals.length > 0 && (
          <div className="text-center">
            <Button variant="outline" size="lg" onClick={fetchAnimals}>
              Carregar Mais Animais
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}