import { Heart, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "./ui/button";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-xl font-bold">Adotaí</span>
            </div>
            <p className="text-gray-300 max-w-md">
              Conectando animais resgatados com famílias amorosas desde 2020. 
              Acreditamos que todo animal merece uma segunda chance e muito amor.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-gray-800">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#home" className="hover:text-white transition-colors">Início</a></li>
              <li><a href="#animals" className="hover:text-white transition-colors">Buscar Animais</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contato</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Como Adotar</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Dicas de Cuidados</a></li>
            </ul>
          </div>

          {/* Apoie Nossa Causa */}
          <div>
            <h3 className="font-semibold mb-4">Apoie Nossa Causa</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Fazer Doação</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Seja Voluntário</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Lar Temporário</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Produtos Solidários</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Eventos</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Adotaí. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}