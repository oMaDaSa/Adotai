import { HeroSection } from '../components/HeroSection';
import { FeaturedAnimals } from '../components/FeaturedAnimals';
import { ContactSection } from '../components/ContactSection';
import type { User } from '../types';

interface HomePageProps {
  onViewAnimals: () => void;
  onAdoptAnimal: (animalId: string) => void;
  onStartConversation?: (animalId: string, advertiserId: string) => void;
  user: User | null;
}

export function HomePage({ onViewAnimals, onAdoptAnimal, onStartConversation, user }: HomePageProps) {
  return (
    <main>
      <HeroSection onViewAnimals={onViewAnimals} />
      <FeaturedAnimals 
        onViewMore={onViewAnimals}
        onAdoptAnimal={onAdoptAnimal}
        onStartConversation={onStartConversation}
        user={user}
      />
      <ContactSection />
    </main>
  );
}
