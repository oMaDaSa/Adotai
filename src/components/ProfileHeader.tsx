// Em src/components/ProfileHeader.tsx

import type { User } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { MapPin, Mail, Phone } from 'lucide-react';
import { Button } from "./ui/button";
import { Edit } from 'lucide-react';

interface ProfileHeaderProps {
  profile: User;
  onBack: () => void;
  currentUser: User | null; // Para saber quem está logado
  onEdit?: () => void; // Função para iniciar a edição
  isEditable?: boolean; // Para controlar se o botão deve aparecer
}

export function ProfileHeader({ profile, currentUser, isEditable, onEdit, onBack }: ProfileHeaderProps) {
  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
       <button onClick={onBack} style={{ marginBottom: '16px' }}>
        &larr; Voltar
      </button>
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <ImageWithFallback
          src={profile.avatar_url || '/default-avatar.svg'}
          alt={`Foto de ${profile.name}`}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
        />
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
          <div className="mt-2 space-y-1 text-gray-500">
            <div className="flex items-center justify-center sm:justify-start">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{profile.address}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <Mail className="h-4 w-4 mr-2" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start">
              <Phone className="h-4 w-4 mr-2" />
              <span>{profile.phone}</span>
            </div>
            {isOwnProfile && isEditable && (
                <Button onClick={onEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              )}
          </div>
          
        </div>
      </div>
    </div>
  );
}