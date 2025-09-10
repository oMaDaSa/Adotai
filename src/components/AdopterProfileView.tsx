// Em src/components/AdopterProfileView.tsx

import { useState } from 'react';
import { api } from '../lib/api';
import type { User } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ProfileHeader } from './ProfileHeader';

interface AdopterProfileViewProps {
  profile: User;
  currentUser: User | null;
}

export function AdopterProfileView({ profile: initialProfile, currentUser }: AdopterProfileViewProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(profile.bio || '');

  const handleSave = async () => {
    try {
      const updatedProfile = await api.updateMyProfile({ bio });
      setProfile(updatedProfile); // Atualiza o perfil localmente com os dados do banco
      setBio(updatedProfile.bio || ''); // Garante que a bio local esteja sincronizada
      setIsEditing(false);
      alert('Perfil salvo com sucesso!');
    } catch (error) {
      alert('Erro ao salvar o perfil.');
    }
  };

  const handleCancel = () => {
    setBio(profile.bio || ''); // Restaura a bio original
    setIsEditing(false);
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <ProfileHeader 
        profile={profile} 
        currentUser={currentUser}
        onEdit={() => setIsEditing(true)} // A função que ativa o modo de edição
        isEditable={true} // Diz ao header que esta página PODE ser editada
      />

      <Card>
        <CardHeader>
          <CardTitle>Sobre Mim</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={8}
                placeholder="Conte um pouco sobre você, sua casa, sua experiência com animais e por que você quer adotar..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSave}>Salvar Alterações</Button>
                <Button variant="ghost" onClick={handleCancel}>Cancelar</Button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">
              {profile.bio || "Este usuário ainda não escreveu sobre si mesmo."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}