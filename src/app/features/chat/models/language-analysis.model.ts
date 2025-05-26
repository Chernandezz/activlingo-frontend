export interface LanguageAnalysisPoint {
  id: string;
  message_id: string;
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
