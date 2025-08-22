import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MapPin, Heart, MessageCircle } from "lucide-react";

interface Animal {
  id: string;
  name: string;
  age: string;
  size: string;
  location: string;
  image: string;
  description: string;
  advertiser_id?: string;
}

interface AnimalCardProps {
  animal: Animal;
  onAdopt?: () => void;
  showAdoptButton?: boolean;
  onStartConversation?: (animalId: string, advertiserId: string) => void;
  showConversationButton?: boolean;
}

export function AnimalCard({ 
  animal, 
  onAdopt, 
  showAdoptButton,
  onStartConversation,
  showConversationButton
}: AnimalCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-video relative overflow-hidden">
        <ImageWithFallback
          src={animal.image}
          alt={animal.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/90 text-gray-700">
            {animal.size}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {animal.name}
            </h3>
            <p className="text-gray-600">{animal.age}</p>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">
          {animal.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            {animal.location}
          </div>
          
          <div className="flex gap-2">
            {showConversationButton && onStartConversation && animal.advertiser_id && (
              <Button 
                onClick={() => onStartConversation(animal.id, animal.advertiser_id!)}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                size="sm"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                Conversar
              </Button>
            )}
            
            {showAdoptButton && onAdopt && (
              <Button 
                onClick={onAdopt}
                className="bg-red-500 hover:bg-red-600 text-white"
                size="sm"
              >
                <Heart className="h-4 w-4 mr-1" />
                Quero adotar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}