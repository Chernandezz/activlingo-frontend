export interface Chat {
  id: string;
  title: string;
  scenario: string; // Descripción del escenario
  language: string; // Idioma practicado (en, es, fr, etc.)
  level: string; // Nivel (beginner, intermediate, advanced)
  createdAt: Date;
  updatedAt: Date;
  stats?: {
    // Estadísticas de este chat
    totalMessages: number;
    improvementPoints: number;
    grammarPoints: number;
    vocabularyPoints: number;
    phrasalVerbPoints: number;
    idiomPoints: number;
  };
}
