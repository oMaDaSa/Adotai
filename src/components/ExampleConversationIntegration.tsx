import React from 'react';
import { AnimalCard } from './AnimalCard';
import { useStartConversation } from '../hooks/useStartConversation';

// Exemplo de como usar o sistema de conversas
export function ExampleConversationIntegration() {
  const { initiateConversation, loading, error } = useStartConversation();

  // Exemplo de animal
  const exampleAnimal = {
    id: 'animal-1',
    name: 'Thor',
    age: '2 anos',
    size: 'Grande',
    location: 'São Paulo, SP',
    image: '/placeholder-dog.jpg',
    description: 'Um cão muito carinhoso e brincalhão, perfeito para famílias.',
    advertiser_id: 'advertiser-123'
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Exemplo - Sistema de Conversas</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="max-w-sm">
        <AnimalCard
          animal={exampleAnimal}
          showConversationButton={true}
          onStartConversation={(animalId, advertiserId) => {
            console.log('Iniciando conversa:', { animalId, advertiserId });
            initiateConversation(animalId, advertiserId);
          }}
          showAdoptButton={true}
          onAdopt={() => {
            console.log('Processo de adoção tradicional');
            alert('Redirecionando para processo de adoção...');
          }}
        />
      </div>
      
      {loading && (
        <div className="mt-4 text-blue-600">
          Iniciando conversa...
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Como usar:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>O usuário clica no botão "Conversar"</li>
          <li>O sistema verifica se o usuário está logado</li>
          <li>Se não estiver, redireciona para login</li>
          <li>Cria ou encontra uma conversa existente</li>
          <li>Redireciona para a página de chat</li>
        </ol>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Próximos passos:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Integrar nos componentes existentes (FeaturedAnimals, SearchPage)</li>
          <li>Adicionar botão "Conversas" no Header para acesso rápido</li>
          <li>Testar com dois usuários diferentes</li>
        </ul>
      </div>
    </div>
  );
}
