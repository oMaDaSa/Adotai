// src/components/ReportDialog.tsx

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { api } from "../lib/api";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  animalId: string;
  
}

export function ReportDialog({ isOpen, onClose, animalId }: ReportDialogProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Por favor, descreva o motivo da denúncia.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      
      await api.createReport({
        reported_animal_id: animalId, 
        reason: reason,
      });

      alert("Denúncia enviada com sucesso! Agradecemos sua colaboração.");
      onClose();
    } catch (err) {
      console.error("Erro ao enviar denúncia:", err);
      setError("Não foi possível enviar a denúncia. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Denunciar Anúncio</DialogTitle>
          <DialogDescription>
            Sua denúncia é anônima para o anunciante. Por favor, descreva o motivo com clareza para que nossa equipe possa analisar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="reason">Motivo da Denúncia</Label>
            <Textarea
              id="reason"
              placeholder="Ex: Suspeita de maus-tratos, informações falsas, anunciante suspeito, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Denúncia"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}