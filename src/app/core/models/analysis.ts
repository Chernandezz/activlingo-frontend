// models/language-analysis.model.ts
export interface LanguageAnalysisPoint {
  id: string;
  chat_id: string;
  category:
    | 'grammar'
    | 'vocabulary'
    | 'phrasal_verb'
    | 'expression'
    | 'collocation';
  mistake: string;
  suggestion: string;
  explanation: string;
  issue?: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
}
