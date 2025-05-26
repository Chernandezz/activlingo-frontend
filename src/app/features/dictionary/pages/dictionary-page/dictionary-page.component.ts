import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DictionarySidebarComponent } from '../../components/dictionary-sidebar/dictionary-sidebar.component';
import { WordDetailsComponent } from '../../components/word-details/word-details.component';
import { WordDefinition } from '../../../../core/models/user-dictionary.model';
import { DictionaryService } from '../../services/dictionary.service';
import { AuthService } from '../../../../core/services/auth.service';
import { DictionarySearchPanelComponent } from '../../components/dictionary-search-panel/dictionary-search-panel.component';

@Component({
  selector: 'app-dictionary-page',
  standalone: true,
  imports: [
    CommonModule,
    DictionarySidebarComponent,
    WordDetailsComponent,
    DictionarySearchPanelComponent,
  ],
  templateUrl: './dictionary-page.component.html',
})
export class DictionaryPageComponent {
  searchMode = false;
  searchResults: WordDefinition[] = [];
  searchTerm: string = '';

  constructor(
    private dictionaryService: DictionaryService,
    private authService: AuthService
  ) {}

  onSearchResults(results: WordDefinition[]) {
    this.searchResults = results;
  }

  selectedWord: any = null;

  onSelectWord(word: any) {
    this.selectedWord = word;
  }

  addToDictionary(definition: WordDefinition): void {
    const userId = this.authService.getCurrentUser;
    if (!userId) return;

    const payload = {
      word: this.searchTerm,
      meaning: definition.meaning,
      example: definition.example,
      part_of_speech: definition.part_of_speech,
      source: definition.source,
    };

    this.dictionaryService.addWord(userId, payload).subscribe(() => {
      this.searchMode = false;
    });
  }
}
