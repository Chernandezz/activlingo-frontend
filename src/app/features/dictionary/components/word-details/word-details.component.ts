// word-details.component.ts - VERSIÓN MEJORADA
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDictionaryEntry } from '../../../../core/models/user-dictionary.model';

@Component({
  selector: 'app-word-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './word-details.component.html',
  styleUrls: ['./word-details.component.css'],
})
export class WordDetailsComponent {
  @Output() back = new EventEmitter<void>();
  @Input() word!: UserDictionaryEntry;

  /**
   * Obtiene el tipo de palabra (simplificado para mostrar)
   */
  getWordType(): string {
    // En una implementación real, esto podría venir de un servicio de análisis de palabras
    // Por ahora, usamos lógica simple basada en terminaciones comunes
    const wordLower = this.word.word.toLowerCase();

    if (wordLower.endsWith('ing')) return 'gerundio/participio';
    if (wordLower.endsWith('ed')) return 'pasado/participio';
    if (wordLower.endsWith('ly')) return 'adverbio';
    if (wordLower.endsWith('tion') || wordLower.endsWith('sion'))
      return 'sustantivo';
    if (wordLower.endsWith('able') || wordLower.endsWith('ible'))
      return 'adjetivo';

    // Palabras comunes
    const articles = ['the', 'a', 'an'];
    const prepositions = [
      'in',
      'on',
      'at',
      'by',
      'for',
      'with',
      'to',
      'from',
      'of',
      'about',
    ];
    const pronouns = [
      'i',
      'you',
      'he',
      'she',
      'it',
      'we',
      'they',
      'me',
      'him',
      'her',
      'us',
      'them',
    ];
    const conjunctions = [
      'and',
      'or',
      'but',
      'because',
      'if',
      'when',
      'while',
      'although',
    ];

    if (articles.includes(wordLower)) return 'artículo';
    if (prepositions.includes(wordLower)) return 'preposición';
    if (pronouns.includes(wordLower)) return 'pronombre';
    if (conjunctions.includes(wordLower)) return 'conjunción';

    return 'sustantivo'; // Por defecto
  }

  /**
   * Obtiene el tipo de palabra abreviado para mostrar en las estadísticas
   */
  getWordTypeShort(): string {
    const fullType = this.getWordType();

    const abbreviations: { [key: string]: string } = {
      sustantivo: 'noun',
      adjetivo: 'adj',
      verbo: 'verb',
      adverbio: 'adv',
      artículo: 'art',
      preposición: 'prep',
      pronombre: 'pron',
      conjunción: 'conj',
      'gerundio/participio': 'ger',
      'pasado/participio': 'past',
    };

    return abbreviations[fullType] || 'word';
  }

  /**
   * Genera una oración de ejemplo usando la palabra
   */
  getExampleSentence(): string {
    // En una implementación real, esto vendría de una API o base de datos
    // Por ahora, generamos ejemplos simples basados en el tipo de palabra
    const word = this.word.word;
    const type = this.getWordType();

    const examples: { [key: string]: string[] } = {
      sustantivo: [
        `The ${word} is very important in our daily life.`,
        `I need to buy a new ${word} for the project.`,
        `This ${word} has changed everything.`,
      ],
      adjetivo: [
        `The weather is very ${word} today.`,
        `She looks ${word} in that dress.`,
        `The movie was ${word} and entertaining.`,
      ],
      verbo: [
        `I ${word} every morning before work.`,
        `They will ${word} tomorrow.`,
        `We should ${word} more often.`,
      ],
      adverbio: [
        `She speaks ${word} and clearly.`,
        `The task was completed ${word}.`,
        `He works ${word} on important projects.`,
      ],
    };

    const typeExamples = examples[type] || [
      `The word "${word}" is commonly used in English.`,
      `Learning "${word}" will improve your vocabulary.`,
      `"${word}" is an essential word to know.`,
    ];

    return typeExamples[Math.floor(Math.random() * typeExamples.length)];
  }

  /**
   * Calcula el nivel de dominio basado en el uso de la palabra
   */
  getMasteryLevel(): string {
    const usageCount = this.word.usage_count || 0;
    const daysSinceCreated = this.getDaysSinceCreated();

    const masteryScore = this.calculateMasteryScore(
      usageCount,
      daysSinceCreated
    );

    if (masteryScore >= 80) return 'Dominada';
    if (masteryScore >= 60) return 'Avanzado';
    if (masteryScore >= 40) return 'Intermedio';
    if (masteryScore >= 20) return 'Básico';
    return 'Nuevo';
  }

  /**
   * Obtiene la clase CSS para el nivel de dominio
   */
  getMasteryLevelClass(): string {
    const level = this.getMasteryLevel();

    switch (level) {
      case 'Dominada':
        return 'text-emerald-600';
      case 'Avanzado':
        return 'text-blue-600';
      case 'Intermedio':
        return 'text-purple-600';
      case 'Básico':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  }

  /**
   * Obtiene la clase CSS para la barra de progreso de dominio
   */
  getMasteryBarClass(): string {
    const level = this.getMasteryLevel();

    switch (level) {
      case 'Dominada':
        return 'bg-gradient-to-r from-emerald-500 to-emerald-600';
      case 'Avanzado':
        return 'bg-gradient-to-r from-blue-500 to-blue-600';
      case 'Intermedio':
        return 'bg-gradient-to-r from-purple-500 to-purple-600';
      case 'Básico':
        return 'bg-gradient-to-r from-amber-500 to-amber-600';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  }

  /**
   * Calcula el porcentaje de dominio
   */
  getMasteryPercentage(): number {
    const usageCount = this.word.usage_count || 0;
    const daysSinceCreated = this.getDaysSinceCreated();

    return this.calculateMasteryScore(usageCount, daysSinceCreated);
  }

  /**
   * Obtiene una descripción del nivel de dominio
   */
  getMasteryDescription(): string {
    const level = this.getMasteryLevel();

    const descriptions: { [key: string]: string } = {
      Dominada: 'Excelente conocimiento y uso frecuente',
      Avanzado: 'Buen dominio, úsala más para dominarla',
      Intermedio: 'Conocimiento moderado, sigue practicando',
      Básico: 'Conocimiento inicial, necesita más práctica',
      Nuevo: 'Recién agregada, comienza a usarla',
    };

    return descriptions[level] || 'Evaluando progreso...';
  }

  /**
   * Calcula los días transcurridos desde que se creó la palabra
   */
  private getDaysSinceCreated(): number {
    const created = new Date(this.word.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calcula un score de dominio basado en uso y tiempo
   */
  private calculateMasteryScore(
    usageCount: number,
    daysSinceCreated: number
  ): number {
    // Factores de peso
    const usageWeight = 0.7;
    const timeWeight = 0.3;

    // Score basado en uso (logarítmico)
    const usageScore = Math.min(Math.log(usageCount + 1) * 25, 100);

    // Score basado en tiempo
    const timeScore = Math.min(daysSinceCreated * 2, 100);

    // Score combinado
    const combinedScore = usageScore * usageWeight + timeScore * timeWeight;

    return Math.round(Math.min(combinedScore, 100));
  }

  /**
   * Obtiene texto descriptivo de cuándo fue la última vez que se usó
   */
  getLastUsedText(): string {
    const lastUsed = new Date(this.word.updated_at || this.word.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastUsed.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.ceil(diffDays / 30)} meses`;

    return `Hace ${Math.ceil(diffDays / 365)} años`;
  }

  /**
   * Obtiene la frecuencia de uso de la palabra
   */
  getUsageFrequency(): string {
    const usageCount = this.word.usage_count || 0;
    const daysSinceCreated = this.getDaysSinceCreated();

    if (daysSinceCreated === 0) return 'Nueva';

    const frequency = usageCount / daysSinceCreated;

    if (frequency >= 1) return 'Diaria';
    if (frequency >= 0.5) return 'Muy frecuente';
    if (frequency >= 0.2) return 'Frecuente';
    if (frequency >= 0.1) return 'Ocasional';
    if (frequency > 0) return 'Rara vez';

    return 'Sin usar';
  }

  /**
   * Formatea una fecha para mostrar de manera amigable
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Maneja la acción de practicar la palabra
   */
  onPractice(): void {
    // Implementar lógica de práctica
    console.log('Practicing word:', this.word.word);
  }

  /**
   * Maneja la acción de editar la palabra
   */
  onEdit(): void {
    // Implementar lógica de edición
    console.log('Editing word:', this.word.word);
  }

  /**
   * Maneja la acción de eliminar la palabra
   */
  onDelete(): void {
    // Implementar lógica de eliminación con confirmación
    if (
      confirm(
        `¿Estás seguro de que quieres eliminar la palabra "${this.word.word}"?`
      )
    ) {
      console.log('Deleting word:', this.word.word);
      // Emitir evento de eliminación al componente padre
    }
  }

  /**
   * Obtiene recomendaciones personalizadas para la palabra
   */
  getPersonalizedRecommendation(): string {
    const usageCount = this.word.usage_count || 0;
    const level = this.getMasteryLevel();
    const daysSinceUpdated = this.getDaysSinceUpdated();

    if (usageCount === 0) {
      return '💡 Intenta usar esta palabra en tu próxima conversación';
    }

    if (daysSinceUpdated > 30) {
      return '⏰ Hace tiempo que no usas esta palabra, ¡es buen momento para repasarla!';
    }

    if (level === 'Dominada') {
      return '🎉 ¡Excelente dominio! Ayuda a otros a aprender esta palabra';
    }

    if (level === 'Nuevo' || level === 'Básico') {
      return '🚀 Practica usando esta palabra en diferentes contextos';
    }

    return '✨ Sigue practicando para dominar completamente esta palabra';
  }

  /**
   * Obtiene los días transcurridos desde la última actualización
   */
  private getDaysSinceUpdated(): number {
    const updated = new Date(this.word.updated_at || this.word.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - updated.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
