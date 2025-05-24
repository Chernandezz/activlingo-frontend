export interface LanguageAnalysisPoint {
  id: number;
  message_id: number;
  category:
    | 'grammar'
    | 'vocabulary'
    | 'phrasal_verb'
    | 'idiom'
    | 'collocation'
    | 'expression';
  mistake: string;
  issue: string;
  suggestion: string;
  explanation: string;
  created_at: string;
}
