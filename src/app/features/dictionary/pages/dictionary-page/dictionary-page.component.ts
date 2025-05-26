import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DictionarySidebarComponent } from '../../components/dictionary-sidebar/dictionary-sidebar.component';
import { WordDetailsComponent } from '../../components/word-details/word-details.component';

@Component({
  selector: 'app-dictionary-page',
  standalone: true,
  imports: [CommonModule, DictionarySidebarComponent, WordDetailsComponent],
  templateUrl: './dictionary-page.component.html',
})
export class DictionaryPageComponent {
  selectedWord: any = null;

  onSelectWord(word: any) {
    this.selectedWord = word;
  }
}
