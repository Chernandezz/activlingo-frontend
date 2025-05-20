// src/app/features/analysis/services/mock-language-analysis.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { LanguageAnalysisPoint } from '../../chat/models/language-analysis.model';

@Injectable({
  providedIn: 'root',
})
export class MockLanguageAnalysisService {
  // Simula el análisis que haría LangChain en el backend
  analyzeText(
    text: string,
    language: string
  ): Observable<LanguageAnalysisPoint[]> {
    const points: LanguageAnalysisPoint[] = [];
    const lowerText = text.toLowerCase();

    // Simulación simple de análisis de errores gramaticales comunes en inglés
    if (language === 'en') {
      // Errores gramaticales
      if (lowerText.includes('i am') && !text.includes('I am')) {
        points.push(
          this.createAnalysisPoint(
            'grammar',
            'i am',
            'I am',
            'En inglés, el pronombre "I" siempre va en mayúscula.'
          )
        );
      }

      // Vocabulario mejorable
      if (lowerText.includes('very good')) {
        points.push(
          this.createAnalysisPoint(
            'vocabulary',
            'very good',
            'excellent/outstanding',
            '"Excellent" o "outstanding" son alternativas más expresivas a "very good".'
          )
        );
      }

      // Phrasal verbs
      if (lowerText.includes('look for')) {
        points.push(
          this.createAnalysisPoint(
            'phrasal_verb',
            'look for',
            'search for',
            '"Search for" es más formal en este contexto.'
          )
        );
      }

      // Expresiones idiomáticas
      if (lowerText.includes('i think')) {
        points.push(
          this.createAnalysisPoint(
            'idiom',
            'I think',
            'In my opinion/From my perspective',
            'Alternativas más expresivas para "I think" que enriquecen tu vocabulario.'
          )
        );
      }
    }

    return of(points).pipe(delay(500)); // Simular análisis asíncrono
  }

  private createAnalysisPoint(
    type: 'grammar' | 'vocabulary' | 'phrasal_verb' | 'idiom' | 'pronunciation',
    originalText: string,
    suggestion: string,
    explanation: string
  ): LanguageAnalysisPoint {
    return {
      id: Date.now().toString() + Math.random().toString().substring(2, 8),
      chatId: '',
      messageId: '',
      type,
      originalText,
      suggestion,
      explanation,
      timestamp: new Date(),
      reviewed: false,
    };
  }

  // Simular respuestas de un bot basadas en el escenario
  generateBotResponse(
    scenario: string,
    userMessage: string
  ): Observable<string> {
    // Respuestas predefinidas basadas en escenarios
    const responses: Record<string, string[]> = {
      'neighbor-dog': [
        "Oh, nice to meet you! Yes, this is my new dog, Rex. He's very friendly!",
        "That's interesting! We've had him for about two months now. Do you have any pets?",
        "That's right! They require a lot of attention. What kind of hobbies do you enjoy?",
      ],
      'football-coach': [
        'You did well today, but I noticed you could improve your passing technique.',
        'I think you should focus more on your positioning. Want to discuss this further at practice?',
        "That's a good attitude! Improvement comes with consistent practice.",
      ],
      'restaurant-order': [
        "Of course! I'd be happy to help with your dietary restrictions. What specifically should we avoid?",
        'We can definitely make that adjustment to the dish. Would you like any substitutions?',
        "Perfect, I've noted that down. Would you like to order any drinks with your meal?",
      ],
    };

    // Escoger una respuesta aleatoria del escenario apropiado
    const scenarioResponses = responses[scenario] || responses['neighbor-dog'];
    const randomResponse =
      scenarioResponses[Math.floor(Math.random() * scenarioResponses.length)];

    return of(randomResponse).pipe(delay(1000)); // Simular respuesta con retraso
  }
}
