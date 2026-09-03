import { normalizeBusinessName } from "@/lib/text";

export interface OsmTagFilter {
  key: string;
  value: string;
}

/**
 * Mapa determinístico de categorias em PT-BR/PT-PT para tags OSM.
 * Sem IA: se a categoria não estiver aqui, a busca cai no fallback por
 * palavra-chave (regex sobre o campo `name`). Ampliar esta tabela é a
 * forma correta de suportar mais categorias.
 */
const CATEGORY_TAG_MAP: Record<string, OsmTagFilter[]> = {
  barbearia: [{ key: "shop", value: "hairdresser" }],
  barbearias: [{ key: "shop", value: "hairdresser" }],
  cabeleireiro: [{ key: "shop", value: "hairdresser" }],
  cabeleireiros: [{ key: "shop", value: "hairdresser" }],
  "salao de beleza": [{ key: "shop", value: "beauty" }],
  "saloes de beleza": [{ key: "shop", value: "beauty" }],
  restaurante: [{ key: "amenity", value: "restaurant" }],
  restaurantes: [{ key: "amenity", value: "restaurant" }],
  cafe: [{ key: "amenity", value: "cafe" }],
  cafes: [{ key: "amenity", value: "cafe" }],
  padaria: [{ key: "shop", value: "bakery" }],
  padarias: [{ key: "shop", value: "bakery" }],
  pastelaria: [{ key: "shop", value: "pastry" }],
  oficina: [{ key: "shop", value: "car_repair" }],
  "oficina mecanica": [{ key: "shop", value: "car_repair" }],
  oficinas: [{ key: "shop", value: "car_repair" }],
  farmacia: [{ key: "amenity", value: "pharmacy" }],
  farmacias: [{ key: "amenity", value: "pharmacy" }],
  academia: [{ key: "leisure", value: "fitness_centre" }],
  academias: [{ key: "leisure", value: "fitness_centre" }],
  ginasio: [{ key: "leisure", value: "fitness_centre" }],
  "pet shop": [{ key: "shop", value: "pet" }],
  petshop: [{ key: "shop", value: "pet" }],
  advogado: [{ key: "office", value: "lawyer" }],
  advogados: [{ key: "office", value: "lawyer" }],
  contabilidade: [{ key: "office", value: "accountant" }],
  contabilista: [{ key: "office", value: "accountant" }],
  clinica: [{ key: "amenity", value: "clinic" }],
  clinicas: [{ key: "amenity", value: "clinic" }],
  dentista: [{ key: "amenity", value: "dentist" }],
  dentistas: [{ key: "amenity", value: "dentist" }],
  "loja de roupas": [{ key: "shop", value: "clothes" }],
  roupas: [{ key: "shop", value: "clothes" }],
  supermercado: [{ key: "shop", value: "supermarket" }],
  supermercados: [{ key: "shop", value: "supermarket" }],
  mercearia: [{ key: "shop", value: "convenience" }],
  florista: [{ key: "shop", value: "florist" }],
  imobiliaria: [{ key: "office", value: "estate_agent" }],
  imobiliarias: [{ key: "office", value: "estate_agent" }],
  pizzaria: [
    { key: "amenity", value: "restaurant" },
    { key: "amenity", value: "fast_food" },
  ],
  pizzarias: [
    { key: "amenity", value: "restaurant" },
    { key: "amenity", value: "fast_food" },
  ],
  hamburgueria: [{ key: "amenity", value: "fast_food" }],
  hamburguerias: [{ key: "amenity", value: "fast_food" }],
  "fast food": [{ key: "amenity", value: "fast_food" }],
  lanchonete: [{ key: "amenity", value: "fast_food" }],
  bar: [{ key: "amenity", value: "bar" }],
  bares: [{ key: "amenity", value: "bar" }],
  pub: [{ key: "amenity", value: "pub" }],
  pubs: [{ key: "amenity", value: "pub" }],
  sorveteria: [{ key: "amenity", value: "ice_cream" }],
  gelataria: [{ key: "amenity", value: "ice_cream" }],
  hotel: [{ key: "tourism", value: "hotel" }],
  hoteis: [{ key: "tourism", value: "hotel" }],
  pousada: [{ key: "tourism", value: "guest_house" }],
  banco: [{ key: "amenity", value: "bank" }],
  bancos: [{ key: "amenity", value: "bank" }],
  posto: [{ key: "amenity", value: "fuel" }],
  "posto de combustivel": [{ key: "amenity", value: "fuel" }],
  "posto de gasolina": [{ key: "amenity", value: "fuel" }],
  livraria: [{ key: "shop", value: "books" }],
  livrarias: [{ key: "shop", value: "books" }],
  papelaria: [{ key: "shop", value: "stationery" }],
  joalheria: [{ key: "shop", value: "jewelry" }],
  joalharia: [{ key: "shop", value: "jewelry" }],
  otica: [{ key: "shop", value: "optician" }],
  oticas: [{ key: "shop", value: "optician" }],
  óptica: [{ key: "shop", value: "optician" }],
  moveis: [{ key: "shop", value: "furniture" }],
  "loja de moveis": [{ key: "shop", value: "furniture" }],
  eletronica: [{ key: "shop", value: "electronics" }],
  "loja de eletronicos": [{ key: "shop", value: "electronics" }],
  materiais_de_construcao: [{ key: "shop", value: "hardware" }],
  "material de construcao": [{ key: "shop", value: "hardware" }],
  ferragens: [{ key: "shop", value: "hardware" }],
  fisioterapia: [{ key: "amenity", value: "clinic" }],
  veterinario: [{ key: "amenity", value: "veterinary" }],
  veterinaria: [{ key: "amenity", value: "veterinary" }],
  veterinarios: [{ key: "amenity", value: "veterinary" }],
  lavanderia: [{ key: "shop", value: "laundry" }],
  "lava rapido": [{ key: "shop", value: "car_wash" }],
  lavajato: [{ key: "shop", value: "car_wash" }],
  estacionamento: [{ key: "amenity", value: "parking" }],
  escola: [{ key: "amenity", value: "school" }],
  escolas: [{ key: "amenity", value: "school" }],
  autoescola: [{ key: "amenity", value: "driving_school" }],
  "auto escola": [{ key: "amenity", value: "driving_school" }],
};

/** Resolve uma categoria em texto livre para filtros de tag OSM, ou `null` se desconhecida. */
export function resolveOsmTagFilters(category: string | null | undefined): OsmTagFilter[] | null {
  if (!category) return null;
  const normalized = normalizeBusinessName(category);
  return CATEGORY_TAG_MAP[normalized] ?? null;
}
