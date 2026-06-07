export interface DocumentResponse {
  id: string;
  filename: string;
  file_type: string;
  chroma_collection: string;
  created_at: string;
}

export interface CollectionItem {
  value: string;
  label: string;
}

export interface RiceVariety {
  id: string;
  name: string;
  collection_name: string;
  harvest_age_days: number;
  is_photoperiod_sensitive: boolean;
  supported_methods: string[];
  description: string | null;
  reference_url: string | null;
  tillering_day: number | null;
  panicle_initiation_day: number | null;
  heading_day: number | null;
  fert1_rate: number | null;
  fert2_rate: number | null;
  fert2_formula: string | null;
  fert1_note: string | null;
  fert2_note: string | null;
}

export interface PromptTemplate {
  id: string;
  title: string;
  content: string;
  created_at?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  role: string;
}

export interface FaqItem {
  question: string;
  count: number;
}

export interface GapItem {
  question: string;
  count: number;
  last_asked_at: string | null;
}

export type { ChatMessage, ChatResponse } from "../components/chat/types";
