// dictionary.model.ts

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'phrasal_verb'
  | 'idiom'
  | 'expression'
  | 'collocation';

export type WordFrequency = 'very_common' | 'common' | 'uncommon' | 'rare';

export type WordRegister = 'formal' | 'informal' | 'neutral' | 'slang';

export interface WordDefinition {
  id?: string;
  word: string;
  meaning: string;
  part_of_speech?: PartOfSpeech;
  source?: string;
  example?: string;
  synonyms?: string[];
  antonyms?: string[];
  usage_context?: string; // e.g. "business", "travel"
  is_idiomatic?: boolean;
  frequency?: WordFrequency;
  register?: WordRegister;
  added?: boolean; // Solo para UI
}

export interface UserDictionaryEntry extends WordDefinition {
  user_id: string;
  created_at: string;
  updated_at?: string;
  status: 'active' | 'passive';
  usage_count: number;
  last_used_at?: string;
  last_used_context?: string;
  difficulty?: number; // 1-5 scale
  tags?: string[];
}

export interface WordCreateDto {
  word: string;
  meaning: string;
  part_of_speech?: PartOfSpeech;
  example?: string;
  source?: string;
  usage_context?: string;
  is_idiomatic?: boolean;
}

export interface WordUpdateDto {
  meaning?: string;
  example?: string;
  status?: 'active' | 'passive';
  difficulty?: number;
  tags?: string[];
}
