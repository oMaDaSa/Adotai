import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Heart, Building2, User } from "lucide-react";

interface AccountTypeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: 'adopter' | 'advertiser') => void;
}

export function AccountTypeDialog({ isOpen, onClose, onSelectType }: AccountTypeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            Qual tipo de conta você deseja criar?
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 mt-6">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-red-200"
            onClick={() => onSelectType('adopter')}
          >
            <CardHeader className="text-center pb-3">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <User className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-lg">Adotante</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <p className="text-sm text-gray-600 mb-4">
                Quero encontrar um animal para adotar e dar muito amor
              </p>
              <Button className="w-full bg-red-500 hover:bg-red-600">
                Criar conta como Adotante
              </Button>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
            onClick={() => onSelectType('advertiser')}
          >
            <CardHeader className="text-center pb-3">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Anunciante</CardTitle>
            </CardHeader>
            <CardContent className="text-center pt-0">
              <p className="text-sm text-gray-600 mb-4">
                Sou um abrigo ou protetor e quero anunciar animais para adoção
              </p>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                Criar conta como Anunciante
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}