// Em src/components/AdvertiserProfileView.tsx

import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { User, Animal } from '../types';
import { ProfileHeader } from './ProfileHeader';
import { AnimalCard } from './AnimalCard';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface AdvertiserProfileViewProps {
  profile: User;
  currentUser: User | null;
  onViewAnimalDetails: (animalId: string) => void; 
}

export function AdvertiserProfileView({ profile: initialProfile, currentUser, onViewAnimalDetails }: AdvertiserProfileViewProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [animals, setAnimals] = useState<Animal[]>([]);
  
  // LÓGICA DE EDIÇÃO DA BIO (igual à do AdopterProfileView)
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio || '');

  useEffect(() => {
    api.getAnimalsByAdvertiser(profile.id).then(setAnimals);
  }, [profile.id]);

  const handleSave = async () => {
    try {
      const updatedProfile = await api.updateMyProfile({ bio });
      setProfile(updatedProfile);
      setBio(updatedProfile.bio || '');
      setIsEditing(false);
      alert('Perfil salvo com sucesso!');
    } catch (error) {
      alert('Erro ao salvar o perfil.');
    }
  };

  const handleCancel = () => {
    setBio(profile.bio || '');
    setIsEditing(false);
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <ProfileHeader 
        profile={profile} 
        currentUser={currentUser}
        onEdit={() => setIsEditing(true)} // Ativa o modo de edição
        isEditable={true} // Diz ao header que esta página pode ser editada
      />

      {/* SEÇÃO DA BIO (NOVA PARA ESTE COMPONENTE) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Sobre a Organização</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={8}
                placeholder="Conte um pouco sobre sua organização, sua missão e como você cuida dos animais..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSave}>Salvar Alterações</Button>
                <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {profile.bio || "Este anunciante ainda não escreveu sobre si mesmo."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Seção dos Animais (continua igual) */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4">Animais para Adoção ({animals.length})</h2>
          {animals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {animals.map(animal => (
                <AnimalCard 
                  key={animal.id}
                  animal={animal}
                  currentUser={currentUser}
                  onViewDetails={onViewAnimalDetails}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Este anunciante não tem nenhum animal cadastrado no momento.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}