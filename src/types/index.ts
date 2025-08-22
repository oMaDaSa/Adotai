export interface User {
  id: string;
  name: string;
  email: string;
  type: 'adopter' | 'advertiser' | 'admin';
  phone?: string;
  address?: string;
  avatar_url?: string; // URL da foto de perfil
  created_at?: string;
  updated_at?: string;
}

export interface Animal {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number; // Changed from string to number to match DB schema
  size?: string;
  color?: string;
  description?: string;
  image?: string; // Legacy field for compatibility
  image_url?: string; // Foto principal do animal
  additional_images?: string[]; // Fotos adicionais (array de URLs)
  advertiser_id: string;
  advertiser_name?: string; // From view/join
  advertiser_email?: string; // From view/join
  advertiser_phone?: string; // From view/join
  advertiser_address?: string; // From view/join
  characteristics?: string[]; // This may need to be handled differently
  special_needs?: string;
  status: 'available' | 'adopted' | 'pending';
  created_at: string;
  updated_at: string;
  // Legacy fields for compatibility
  gender?: string;
  location?: string;
}

export interface AdoptionRequest {
  id: string;
  animal_id: string;
  animal_name?: string; // From view/join
  animal_species?: string; // From view/join
  animal_breed?: string; // From view/join
  animal_image?: string;
  adopter_id: string;
  adopter_name?: string; // From view/join
  adopter_email?: string; // From view/join
  advertiser_id?: string; // From join through animal
  advertiser_name?: string; // From view/join
  advertiser_email?: string; // From view/join
  status: 'pending' | 'approved' | 'rejected'; // 'rejected' matches DB schema
  message?: string; // Matches DB field name
  // Extended fields for detailed forms
  reason?: string;
  housing_type?: string;
  has_yard?: boolean;
  has_children?: boolean;
  has_other_pets?: boolean;
  time_at_home?: string;
  monthly_budget?: string;
  status_message?: string;
  scheduled_visit?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  animal_id: string;
  animal_name: string;
  adopter_id: string;
  adopter_name: string;
  advertiser_id: string;
  advertiser_name: string;
  status: 'active' | 'completed' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

export type PageType = 'home' | 'search' | 'adoption' | 'create-account' | 'login' | 'forgot-password' | 'register-animal' | 'profile' | 'animal-requests' | 'chat' | 'adoption-request' | 'requests-panel' | 'request-details' | 'conversations' | 'simple-conversations' | 'simple-chat' | 'admin-login' | 'admin-dashboard';

export type AccountType = 'adopter' | 'advertiser' | 'admin' | null;

export interface LoginResult {
  success: boolean;
  error?: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  type: 'adopter' | 'advertiser';
  phone: string;
  address: string;
}
