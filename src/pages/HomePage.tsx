import { HeroSection } from '../components/HeroSection';
import { FeaturedAnimals } from '../components/FeaturedAnimals';
import { ContactSection } from '../components/ContactSection';
import type { User } from '../types';

interface HomePageProps {
  onViewAnimals: () => void;
  onAdoptAnimal: (animalId: string) => void;
  onStartConversation?: (animalId: string, advertiserId: string) => void;
  onViewProfile: (userId: string) => void;
  onViewDetails: (animalId: string) => void; 
  user: User | null;
}

export function HomePage({ onViewAnimals, onAdoptAnimal, onStartConversation, onViewProfile, onViewDetails, user }: HomePageProps) {
  return (
    <main>
      <HeroSection onViewAnimals={onViewAnimals} />
      <FeaturedAnimals 
        onViewDetails = {onViewDetails}
        onViewMore={onViewAnimals}
        onAdoptAnimal={onAdoptAnimal}
        onStartConversation={onStartConversation}
        onViewProfile={onViewProfile}
        user={user}
      />
      <ContactSection />
    </main>
  );
}
