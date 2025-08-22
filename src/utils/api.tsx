import { supabase } from './supabase/client';
import { projectId, publicAnonKey } from './supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-74d68824`;

interface User {
  id: string;
  name: string;
  email: string;
  type: 'adopter' | 'advertiser' | 'admin';
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  description: string;
  location: string;
  advertiser_id: string;
  advertiser_name: string;
  image: string;
  characteristics: string[];
  special_needs?: string;
  status: 'available' | 'adopted' | 'pending';
  created_at: string;
  updated_at: string;
}

interface AdoptionRequest {
  id: string;
  animal_id: string;
  animal_name: string;
  animal_image?: string;
  adopter_id: string;
  adopter_name: string;
  advertiser_id: string;
  advertiser_name: string;
  status: 'pending' | 'approved' | 'denied' | 'completed';
  reason: string;
  housing_type: string;
  has_yard: boolean;
  has_children: boolean;
  has_other_pets: boolean;
  time_at_home: string;
  monthly_budget: string;
  status_message?: string;
  scheduled_visit?: string;
  created_at: string;
  updated_at: string;
}

interface Conversation {
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

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    };
  }

  private async getSessionHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': session?.access_token ? `Bearer ${session.access_token}` : `Bearer ${publicAnonKey}`
    };
  }

  async initializeData(): Promise<void> {
    const response = await fetch(`${API_BASE}/init`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to initialize data');
    }

    return response.json();
  }

  // Auth methods
  async signup(userData: {
    email: string;
    password: string;
    name: string;
    type: 'adopter' | 'advertiser';
    phone: string;
    address: string;
  }): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    return response.json();
  }

  async signin(email: string, password: string): Promise<{ user: User; session?: any; isAdmin?: boolean }> {
    const response = await fetch(`${API_BASE}/auth/signin`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signin failed');
    }

    return response.json();
  }

  // Users methods
  async getUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE}/users`, {
      headers: await this.getSessionHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch users');
    }

    const data = await response.json();
    return data.users;
  }

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      headers: await this.getSessionHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch user');
    }

    const data = await response.json();
    return data.user;
  }

  // Animals methods
  async getAnimals(): Promise<Animal[]> {
    const response = await fetch(`${API_BASE}/animals`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch animals');
    }

    const data = await response.json();
    return data.animals;
  }

  async getAnimal(id: string): Promise<Animal> {
    const response = await fetch(`${API_BASE}/animals/${id}`, {
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch animal');
    }

    const data = await response.json();
    return data.animal;
  }

  async createAnimal(animalData: Partial<Animal>): Promise<Animal> {
    const response = await fetch(`${API_BASE}/animals`, {
      method: 'POST',
      headers: await this.getSessionHeaders(),
      body: JSON.stringify(animalData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create animal');
    }

    const data = await response.json();
    return data.animal;
  }

  // Adoption requests methods
  async getAdoptionRequests(): Promise<AdoptionRequest[]> {
    const response = await fetch(`${API_BASE}/adoption-requests`, {
      headers: await this.getSessionHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch adoption requests');
    }

    const data = await response.json();
    return data.requests;
  }

  async createAdoptionRequest(requestData: Partial<AdoptionRequest>): Promise<AdoptionRequest> {
    const response = await fetch(`${API_BASE}/adoption-requests`, {
      method: 'POST',
      headers: await this.getSessionHeaders(),
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create adoption request');
    }

    const data = await response.json();
    return data.request;
  }

  async updateAdoptionRequest(id: string, updateData: Partial<AdoptionRequest>): Promise<AdoptionRequest> {
    const response = await fetch(`${API_BASE}/adoption-requests/${id}`, {
      method: 'PUT',
      headers: await this.getSessionHeaders(),
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update adoption request');
    }

    const data = await response.json();
    return data.request;
  }

  // Conversations methods
  async getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${API_BASE}/conversations`, {
      headers: await this.getSessionHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch conversations');
    }

    const data = await response.json();
    return data.conversations;
  }

  async createConversation(animalId: string, advertiserId: string): Promise<Conversation> {
    const response = await fetch(`${API_BASE}/conversations`, {
      method: 'POST',
      headers: await this.getSessionHeaders(),
      body: JSON.stringify({ animal_id: animalId, advertiser_id: advertiserId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create conversation');
    }

    const data = await response.json();
    return data.conversation;
  }

  // Messages methods
  async getMessages(conversationId: string): Promise<Message[]> {
    const response = await fetch(`${API_BASE}/messages/${conversationId}`, {
      headers: await this.getSessionHeaders()
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch messages');
    }

    const data = await response.json();
    return data.messages;
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    const response = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: await this.getSessionHeaders(),
      body: JSON.stringify({ conversation_id: conversationId, content })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send message');
    }

    const data = await response.json();
    return data.message;
  }
}

export const api = new ApiService();
export type { User, Animal, AdoptionRequest, Conversation, Message };