export interface LanguageAnalysisPoint {
  id: string;
  chatId: string;
  messageId: string;
  type: 'grammar' | 'vocabulary' | 'phrasal_verb' | 'idiom' | 'pronunciation';
  originalText: string;
  suggestion: string;
  explanation: string;
  timestamp: Date;
  reviewed: boolean;
}
