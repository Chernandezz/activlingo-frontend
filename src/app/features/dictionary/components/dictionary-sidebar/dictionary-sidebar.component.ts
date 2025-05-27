import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDictionaryEntry } from '../../../../core/models/user-dictionary.model';
import { DictionaryService } from '../../services/dictionary.service';
import { AuthService } from '../../../../core/services/auth.service';
import { WordDefinition } from '../../../../core/models/user-dictionary.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dictionary-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dictionary-sidebar.component.html',
})
export class DictionarySidebarComponent implements OnInit {
  @Output() startSearch = new EventEmitter<void>();
  private subscription = new Subscription();

  searchMode = false;
  searchResults: WordDefinition[] = [];

  words: UserDictionaryEntry[] = [];
  searchTerm: string = '';
  @Output() selectWord = new EventEmitter<UserDictionaryEntry>();
  
  constructor(
    private dictionaryService: DictionaryService,
    private authService: AuthService
  ) {}

  startSearchMode(): void {
    this.searchMode = true;
    this.searchTerm = '';
    this.searchResults = [];
  }

  ngOnInit(): void {
    const userId = this.authService.getCurrentUser;
    if (!userId) return;

    const loadWords = () => {
      this.dictionaryService.getUserWords(userId).subscribe((entries) => {
        this.words = entries.map((entry) => ({
          ...(entry as Omit<UserDictionaryEntry, 'user_id'>),
          user_id: userId,
        }));
      });
    };

    loadWords();

    this.subscription.add(
      this.dictionaryService.refreshWords$.subscribe(() => loadWords())
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSelect(word: UserDictionaryEntry): void {
    this.selectWord.emit(word);
  }

  get filteredWords(): UserDictionaryEntry[] {
    return this.words.filter((w) =>
      w.word.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
