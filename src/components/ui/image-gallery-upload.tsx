import { useState, useRef } from 'react';
import { Button } from './button';
import { Plus, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ImageGalleryUploadProps {
  currentImages?: string[];
  onImagesChange: (images: string[]) => void;
  userId: string;
  maxImages?: number;
  className?: string;
}

export function ImageGalleryUpload({ 
  currentImages = [], 
  onImagesChange, 
  userId, 
  maxImages = 6,
  className = ''
}: ImageGalleryUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Verificar limite de imagens
    if (currentImages.length + files.length > maxImages) {
      setUploadError(`Máximo de ${maxImages} imagens permitido.`);
      return;
    }

    // Validar arquivos
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setUploadError('Todos os arquivos devem ser imagens válidas.');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setUploadError('Cada imagem deve ter no máximo 10MB.');
        return;
      }
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const uploadedUrls: string[] = [];

      // Upload de cada arquivo
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('animal-photos')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw error;
        }

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('animal-photos')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      // Atualizar lista de imagens
      const newImages = [...currentImages, ...uploadedUrls];
      onImagesChange(newImages);

    } catch (error: any) {
      console.error('Erro no upload:', error);
      setUploadError(error.message || 'Erro ao fazer upload das imagens.');
    } finally {
      setIsUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const canAddMore = currentImages.length < maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Grid de imagens */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {currentImages.map((imageUrl, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
              <img 
                src={imageUrl} 
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            
            {/* Botão de remoção */}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => handleRemoveImage(index)}
            >
              <X className="h-3 w-3" />
            </Button>
            
            {/* Indicador de imagem principal */}
            {index === 0 && (
              <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                Principal
              </div>
            )}
          </div>
        ))}

        {/* Botão de adicionar nova imagem */}
        {canAddMore && (
          <div 
            onClick={handleFileSelect}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-purple-400 flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
            ) : (
              <>
                <Plus className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500 text-center px-2">
                  Adicionar foto
                </span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Info e controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleFileSelect}
            disabled={isUploading || !canAddMore}
            className="flex items-center space-x-2"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
            <span>Adicionar Fotos</span>
          </Button>

          <span className="text-sm text-gray-500">
            {currentImages.length}/{maxImages} fotos
          </span>
        </div>

        {currentImages.length > 0 && (
          <p className="text-xs text-gray-500">
            A primeira foto será a principal. Arraste para reordenar.
          </p>
        )}
      </div>

      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Mensagem de erro */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{uploadError}</p>
        </div>
      )}

      {/* Dicas */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-blue-700 text-sm">
          💡 <strong>Dicas:</strong> Use fotos claras e bem iluminadas. 
          A primeira imagem será exibida como foto principal nos resultados de busca.
        </p>
      </div>
    </div>
  );
}
