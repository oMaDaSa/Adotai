import { useState } from 'react';
import type { PageType, AccountType } from '../types';

interface UseNavigationReturn {
  currentPage: PageType;
  selectedAccountType: AccountType;
  selectedAnimalId: string | null;
  selectedRequestId: string | null;
  chatParams: { adopterId: string; animalId: string } | null;
  showAccountTypeDialog: boolean;
  navigateTo: (page: PageType) => void;
  setSelectedAccountType: (type: AccountType) => void;
  setSelectedAnimalId: (id: string | null) => void;
  setSelectedRequestId: (id: string | null) => void;
  setChatParams: (params: { adopterId: string; animalId: string } | null) => void;
  setShowAccountTypeDialog: (show: boolean) => void;
  resetNavigation: () => void;
}

export function useNavigation(): UseNavigationReturn {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [selectedAccountType, setSelectedAccountType] = useState<AccountType>(null);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [chatParams, setChatParams] = useState<{ adopterId: string; animalId: string } | null>(null);
  const [showAccountTypeDialog, setShowAccountTypeDialog] = useState(false);

  const navigateTo = (page: PageType) => {
    setCurrentPage(page);
  };

  const resetNavigation = () => {
    setCurrentPage('home');
    setSelectedAccountType(null);
    setSelectedAnimalId(null);
    setSelectedRequestId(null);
    setChatParams(null);
    setShowAccountTypeDialog(false);
  };

  return {
    currentPage,
    selectedAccountType,
    selectedAnimalId,
    selectedRequestId,
    chatParams,
    showAccountTypeDialog,
    navigateTo,
    setSelectedAccountType,
    setSelectedAnimalId,
    setSelectedRequestId,
    setChatParams,
    setShowAccountTypeDialog,
    resetNavigation
  };
}
