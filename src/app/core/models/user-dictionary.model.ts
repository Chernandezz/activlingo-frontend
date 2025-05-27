export interface WordDefinition {
  word: string;
  meaning: string;
  part_of_speech?: string;
  source?: string;
  example?: string;
  created_at?: string;
  added: boolean;
  id?: string;
  usage_count?: number;
  chat_count?: number;
  frequency_level?: 'very common' | 'common' | 'rare';
  formality?: 'formal' | 'informal' | 'neutral';
  type?:
    | 'phrasal verb'
    | 'verb'
    | 'noun'
    | 'idiom'
    | 'collocation'
    | 'expression';
}


export interface UserDictionaryEntry {
  id: string;
  user_id: string;
  word: string;
  meaning: string;
  part_of_speech?: string;
  source?: string;
  example?: string;
  created_at: string;

  // Campos adicionales útiles para la vista extendida
  usage_count?: number; // e.g. 27
  chat_count?: number; // e.g. 7
  register?: 'formal' | 'informal' | 'neutral'; // Nivel de formalidad
  frequency?: 'rare' | 'common' | 'very_common';
  category?:
    | 'phrasal_verb'
    | 'idiom'
    | 'collocation'
    | 'expression'
    | 'vocabulary'
    | 'grammar';
}
