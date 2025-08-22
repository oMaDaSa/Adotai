import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Heart, Home, Stethoscope, DollarSign, Clock, Users, AlertTriangle, CheckCircle } from "lucide-react";

export function ResponsibleAdoptionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Heart className="h-16 w-16 text-red-500" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Adoção Responsável
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Adotar um animal é um ato de amor que requer preparação, dedicação e responsabilidade. 
            Aqui você encontra todas as informações necessárias para se tornar um tutor consciente.
          </p>
        </div>

        {/* O que é Adoção Responsável */}
        <section className="mb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                O que é Adoção Responsável?
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  A adoção responsável vai muito além de simplesmente levar um animal para casa. 
                  É um compromisso de longo prazo que envolve cuidados veterinários, alimentação adequada, 
                  exercícios, carinho e dedicação.
                </p>
                <p>
                  Significa estar preparado para oferecer um lar seguro e amoroso por toda a vida do animal, 
                  que pode chegar a 15 anos ou mais. É também compreender que cada animal tem sua personalidade 
                  e necessidades específicas.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <Clock className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="font-semibold">Compromisso</div>
                  <div className="text-sm text-gray-600">10-15+ anos</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="font-semibold">Amor</div>
                  <div className="text-sm text-gray-600">Incondicional</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-lg">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=600&fit=crop"
                  alt="Pessoa cuidando de um cachorro"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Preparação */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Preparação para Receber seu Novo Amigo
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardHeader>
                <Home className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-lg">Ambiente Seguro</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Remover objetos perigosos</li>
                  <li>• Proteger fios elétricos</li>
                  <li>• Verificar plantas tóxicas</li>
                  <li>• Delimitar espaços</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Stethoscope className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-lg">Cuidados Veterinários</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Escolher veterinário</li>
                  <li>• Vacinas em dia</li>
                  <li>• Vermifugação</li>
                  <li>• Check-up inicial</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-lg">Planejamento Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Ração de qualidade</li>
                  <li>• Consultas veterinárias</li>
                  <li>• Medicamentos</li>
                  <li>• Emergências</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <CardTitle className="text-lg">Família Preparada</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Consenso familiar</li>
                  <li>• Tempo disponível</li>
                  <li>• Responsabilidades</li>
                  <li>• Rotina adaptada</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Cuidados Essenciais */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Cuidados Essenciais
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">CÃES</Badge>
                  Cuidados Específicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Alimentação</h4>
                  <p className="text-sm text-gray-600">
                    Ração de qualidade adequada à idade e porte. Água fresca sempre disponível.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Exercício</h4>
                  <p className="text-sm text-gray-600">
                    Passeios diários, brincadeiras e socialização com outros cães.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Higiene</h4>
                  <p className="text-sm text-gray-600">
                    Banhos regulares, escovação, corte de unhas e limpeza dos dentes.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Treinamento</h4>
                  <p className="text-sm text-gray-600">
                    Comandos básicos, socialização e educação com reforço positivo.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge className="bg-orange-100 text-orange-800">GATOS</Badge>
                  Cuidados Específicos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Alimentação</h4>
                  <p className="text-sm text-gray-600">
                    Ração específica para gatos, rica em proteína. Petiscos com moderação.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Caixa de Areia</h4>
                  <p className="text-sm text-gray-600">
                    Local limpo e reservado, areia apropriada, limpeza diária.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Ambiente</h4>
                  <p className="text-sm text-gray-600">
                    Arranhadores, brinquedos, locais altos para descanso e observação.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Saúde</h4>
                  <p className="text-sm text-gray-600">
                    Escovação regular, cuidado com bolas de pelo, check-ups veterinários.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Responsabilidades */}
        <section className="mb-16">
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-6 w-6" />
                Responsabilidades do Tutor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-red-800 mb-3">Compromissos Legais</h4>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li>• Manter vacinação em dia</li>
                    <li>• Registrar o animal</li>
                    <li>• Usar coleira com identificação</li>
                    <li>• Cumprir leis municipais</li>
                    <li>• Não abandonar o animal</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-800 mb-3">Compromissos Éticos</h4>
                  <ul className="space-y-2 text-sm text-red-700">
                    <li>• Castração responsável</li>
                    <li>• Não reprodução indiscriminada</li>
                    <li>• Cuidar até o fim da vida</li>
                    <li>• Buscar ajuda se necessário</li>
                    <li>• Educar sobre posse responsável</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Dicas Importantes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Dicas Importantes
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <CheckCircle className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="font-semibold text-green-800 mb-2">Adaptação</h3>
                <p className="text-sm text-green-700">
                  Dê tempo para o animal se adaptar. Os primeiros dias podem ser estressantes. 
                  Seja paciente e ofereça muito carinho.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <Heart className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="font-semibold text-blue-800 mb-2">Vínculo</h3>
                <p className="text-sm text-blue-700">
                  O vínculo se constrói com tempo, consistência e carinho. 
                  Respeite o ritmo do animal e celebre pequenos progressos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="p-6">
                <Users className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="font-semibold text-purple-800 mb-2">Socialização</h3>
                <p className="text-sm text-purple-700">
                  Apresente gradualmente novas pessoas, animais e ambientes. 
                  A socialização adequada previne problemas comportamentais.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <CardContent className="p-12">
              <h2 className="text-2xl font-bold mb-4">
                Pronto para Adotar com Responsabilidade?
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Agora que você conhece os cuidados necessários, que tal encontrar seu novo companheiro?
              </p>
              <div className="flex justify-center">
                <div className="bg-white text-red-500 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
                  Ver Animais Disponíveis
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}