import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

export function ContactSection() {
  return (
    <section id="contact" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Entre em Contato
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Precisa de mais informações? Entre em contato conosco pelos canais abaixo.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          {/* Informações de Contato */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">(11) 3456-7890</p>
                  <p className="text-sm text-gray-600">Segunda a Sexta, 8h às 18h</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">contato@adotai.com.br</p>
                  <p className="text-sm text-gray-600">Respondemos em até 24h</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Rua das Flores, 123</p>
                  <p className="text-sm text-gray-600">Vila Madalena, São Paulo - SP</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium">Horário de Visitas</p>
                  <p className="text-sm text-gray-600">Sábado e Domingo, 9h às 17h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Como Funciona */}
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-red-800 mb-4">Como Funciona a Adoção?</h3>
              <div className="space-y-3 text-sm text-red-700">
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium">1</span>
                  <p>Clique em "Veja Mais"</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium">2</span>
                  <p>Escolha um animal a qual você tem interesse</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium">3</span>
                  <p>Clique em "Quero adotar"</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-medium">4</span>
                  <p>Converse com o anunciante! Você pode tirar dúvidas, pedir mais fotos, marcar visitas para conhecer o animal</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}