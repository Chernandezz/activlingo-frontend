export interface LanguageAnalysisPoint {
  id: string;
  message_id: string;
  category:
    | 'grammar'
    | 'vocabulary'
    | 'phrasal_verb'
    | 'idiom'
    | 'collocation'
    | 'context_appropriateness'
    | 'expression';
  mistake: string;
  issue: string;
  suggestion: string;
  explanation: string;
  learning_tip?: string;
  created_at: string;
}
