import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HeroSectionProps {
  onViewAnimals: () => void;
}

export function HeroSection({ onViewAnimals }: HeroSectionProps) {
  return (
    <section className="bg-gradient-to-br from-red-50 to-orange-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Adote um amigo,
                <span className="text-red-500"> mude uma vida</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md">
                No Adotaí, conectamos corações. Encontre seu novo melhor amigo 
                e dê uma segunda chance para quem mais precisa de amor.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-4"
                onClick={onViewAnimals}
              >
                Encontrar Meu Amigo
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-4">
                Como Funciona
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-red-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">500+</div>
                <div className="text-sm text-gray-600">Animais Salvos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">200+</div>
                <div className="text-sm text-gray-600">Famílias Felizes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">98%</div>
                <div className="text-sm text-gray-600">Adaptação</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square relative rounded-3xl overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=600&fit=crop"
                alt="Cão e gato juntos"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-white rounded-xl p-4 shadow-xl max-w-48">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">5 novos animais esta semana!</span>
              </div>
            </div>
            
            <div className="absolute -top-6 -left-6 bg-red-500 text-white rounded-xl p-3 shadow-xl">
              <div className="text-center">
                <div className="font-bold">100%</div>
                <div className="text-xs">Gratuito</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}