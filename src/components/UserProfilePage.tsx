// Crie um novo arquivo: src/pages/UserProfilePage.tsx

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { User } from '../types';
import { AdopterProfileView } from './AdopterProfileView';
import { AdvertiserProfileView } from './AdvertiserProfileView';

interface UserProfilePageProps {
  userId: string;
  currentUser: User | null;
  onViewAnimalDetails: (animalId: string) => void;
  onBack: () => void;
}

export function UserProfilePage({ userId, currentUser, onBack, onViewAnimalDetails }: UserProfilePageProps) {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileData = await api.getUserProfile(userId);
        setProfile(profileData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <div>Carregando perfil...</div>;
  if (error) return <div>{error}</div>;
  if (!profile) return <div>Perfil não encontrado.</div>;

  // Decide qual componente de visualização renderizar
  return (
    <div>
      {profile.type === 'adopter' ? (
        <AdopterProfileView profile={profile} currentUser={currentUser} />
      ) : (
        <AdvertiserProfileView 
          profile={profile} 
          currentUser={currentUser}
          onViewAnimalDetails={onViewAnimalDetails} // <-- Passando a prop
        />
      )}
    </div>
  );
}