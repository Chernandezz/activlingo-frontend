export interface ConversationScenario {
  id: string;
  title: string;
  description: string;
  language: string;
  level: string;
  tags: string[];
  examplePrompt?: string; // Ejemplo para iniciar la conversación
}
