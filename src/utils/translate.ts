// src/utils/translate.ts

const speciesMap: Record<string, string> = {
  dog: "Cachorro",
  cat: "Gato",
};

const sizeMap: Record<string, string> = {
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
  giant: "Gigante",
};

const genderMap: Record<string, string> = {
  male: "Macho",
  female: "Fêmea",
};

const statusMap: Record<string, string> = {
  available: "Disponível",
  adopted: "Adotado",
  pending: "Pendente",
};

const profileMap: Record<string, string> = {  // arrumei o nome aqui (proile → profile 😉)
  adopter: "Adotante",
  advertiser: "Anunciante",
};

export function translateSpecies(species: string): string {
  return species ? (speciesMap[species.toLowerCase()] || species) : "";
}

export function translateSize(size?: string): string {
  return size ? (sizeMap[size.toLowerCase()] || size) : "";
}

export function translateGender(gender: string): string {
  return gender ? (genderMap[gender.toLowerCase()] || gender) : "";
}

export function translateStatus(status: string): string {
  return status ? (statusMap[status.toLowerCase()] || status) : "";
}

export function translateProfile(profile: string): string {
  return profile ? (profileMap[profile.toLowerCase()] || profile) : "";
}
