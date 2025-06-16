// word-details.component.ts - VERSIÓN COMPACTA
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDictionaryEntry } from '../../../../core/models/user-dictionary.model';
import { DictionaryService } from '../../services/dictionary.service';

@Component({
  selector: 'app-word-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './word-details.component.html',
  styleUrls: ['./word-details.component.css'],
})
export class WordDetailsComponent implements OnInit {
  private dictionaryService = inject(DictionaryService);

  @Output() back = new EventEmitter<void>();
  @Output() wordUpdated = new EventEmitter<UserDictionaryEntry>();
  @Input() word!: UserDictionaryEntry;

  // Estados simples
  isEditingNotes = false;
  editingNotes = '';
  isUpdating = false;

  ngOnInit() {
    this.editingNotes = this.word.personal_notes || '';
  }

  /**
   * Tipo de palabra
   */
  getWordType(): string {
    if (this.word.part_of_speech) {
      const translations: { [key: string]: string } = {
        noun: 'sustantivo',
        verb: 'verbo',
        adjective: 'adjetivo',
        adverb: 'adverbio',
        phrasal_verb: 'verbo frasal',
        idiom: 'expresión',
        expression: 'expresión',
      };
      return translations[this.word.part_of_speech] || this.word.part_of_speech;
    }
    return 'palabra';
  }

  /**
   * Sinónimos (máximo 4 para no ocupar mucho espacio)
   */
  getSynonyms(): string[] {
    if (this.word.synonyms && Array.isArray(this.word.synonyms)) {
      return this.word.synonyms.slice(0, 4);
    }
    return [];
  }

  /**
   * Etiqueta de contexto
   */
  getContextLabel(): string {
    const contexts: { [key: string]: string } = {
      business: 'Negocios',
      academic: 'Académico',
      travel: 'Viajes',
      slang: 'Jerga',
      technical: 'Técnico',
    };
    return (
      contexts[this.word.usage_context || ''] ||
      this.word.usage_context ||
      'General'
    );
  }

  /**
   * Recomendación simple pero útil
   */
  getSmartRecommendation(): string {
    const usage = this.word.usage_count || 0;
    const isIdiom = this.word.is_idiomatic;

    // Sin usar
    if (usage === 0) {
      return isIdiom
        ? 'Expresión idiomática: aprende el contexto de uso.'
        : 'Intenta usarla en una conversación para empezar a dominarla.';
    }

    // Poco usada
    if (usage < 3) {
      return 'Úsala 2-3 veces más en diferentes contextos para fijarla.';
    }

    // Bien usada
    if (usage >= 8) {
      return 'Excelente dominio. Enfócate en palabras nuevas.';
    }

    return 'Buen progreso. Sigue practicando para dominarla.';
  }

  /**
   * Editar notas
   */
  toggleEditNotes(): void {
    if (this.isEditingNotes) {
      this.saveNotes();
    } else {
      this.isEditingNotes = true;
      this.editingNotes = this.word.personal_notes || '';
    }
  }

  private saveNotes(): void {
    if (this.isUpdating) return;

    this.isUpdating = true;

    this.dictionaryService
      .updateWord(this.word.id, {
        personal_notes: this.editingNotes.trim(),
      })
      .subscribe({
        next: (updatedWord) => {
          this.word = updatedWord;
          this.wordUpdated.emit(updatedWord);
          this.isEditingNotes = false;
          this.isUpdating = false;
        },
        error: (err) => {
          console.error('Error saving notes:', err);
          this.isUpdating = false;
        },
      });
  }

  /**
   * Eliminar palabra
   */
  onDelete(): void {
    if (confirm(`¿Eliminar "${this.word.word}"?`)) {
      this.isUpdating = true;

      this.dictionaryService.deleteWord(this.word.id).subscribe({
        next: () => {
          this.back.emit();
        },
        error: (err) => {
          console.error('Error deleting word:', err);
          this.isUpdating = false;
          alert('Error al eliminar la palabra.');
        },
      });
    }
  }
}
