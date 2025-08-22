import { useState, useRef } from 'react';
import { Button } from './button';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onUploadComplete: (url: string) => void;
  onRemove?: () => void;
  userId: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  name?: string; // Nome do usuário para fallback
}

export function AvatarUpload({ 
  currentAvatarUrl, 
  onUploadComplete, 
  onRemove, 
  userId, 
  className = '',
  size = 'lg',
  name = ''
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24', 
    lg: 'h-32 w-32'
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setUploadError('Por favor, selecione uma imagem válida.');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Fazer upload para o Supabase Storage
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
    } catch (error: any) {
      console.error('Erro no upload:', error);
      setUploadError(error.message || 'Erro ao fazer upload da imagem.');
    } finally {
      setIsUploading(false);
      // Limpar input para permitir novo upload do mesmo arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative">
        <Avatar className={`${sizeClasses[size]} border-4 border-gray-200`}>
          <AvatarImage src={currentAvatarUrl} alt="Foto de perfil" />
          <AvatarFallback className="bg-purple-100 text-purple-600 text-lg font-semibold">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>

        {/* Overlay para upload */}
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
             onClick={handleFileSelect}>
          {isUploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFileSelect}
          disabled={isUploading}
          className="flex items-center space-x-2"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>{currentAvatarUrl ? 'Alterar' : 'Upload'}</span>
        </Button>

        {currentAvatarUrl && onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Mensagem de erro */}
      {uploadError && (
        <p className="text-red-600 text-sm text-center">{uploadError}</p>
      )}

      {/* Dica */}
      <p className="text-gray-500 text-xs text-center">
        JPG, PNG ou WebP. Máximo 5MB.
      </p>
    </div>
  );
}
