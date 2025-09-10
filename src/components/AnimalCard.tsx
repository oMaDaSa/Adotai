import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MapPin, Eye } from "lucide-react"; // Trocamos Heart e MessageCircle por Eye
import type { Animal, User } from "../types"; // Importe o tipo User

interface AnimalCardProps {
  animal: Animal;
  currentUser: User | null; 
  onViewDetails: (animalId: string) => void; 
}

export function AnimalCard({ 
  animal,
  currentUser,
  onViewDetails
}: AnimalCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      {/* Container da imagem com proporção fixa para evitar cortes */}
      <div className="aspect-square w-full">
        <ImageWithFallback
          src={animal.image_url || animal.image || '/default-pet.svg'}
          alt={animal.name}
          className="w-full h-full object-cover"
        />
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold">{animal.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{animal.breed || 'SRD'}</p>
        
        {/* Usando o status do animal se ele existir */}
        {animal.status && (
          <Badge variant={animal.status === 'available' ? 'default' : 'secondary'}>
            {animal.status === 'available' ? 'Disponível' : 'Adotado'}
          </Badge>
        )}
        
        {/* Div do botão empurrada para o final do card */}
        <div className="mt-auto pt-4">
          {/* LÓGICA DO BOTÃO ATUALIZADA */}
          {/* O botão aparece se o usuário for um adotante OU se não estiver logado */}
          {(currentUser?.type === 'adopter' || !currentUser) && (
            <Button 
              onClick={() => onViewDetails(animal.id)}
              className="w-full"
              variant="outline"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}