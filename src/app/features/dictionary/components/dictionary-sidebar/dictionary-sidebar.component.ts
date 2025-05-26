import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserDictionaryEntry } from '../../../../core/models/user-dictionary.model';
import { DictionaryService } from '../../services/dictionary.service';

@Component({
  selector: 'app-dictionary-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dictionary-sidebar.component.html',
})
export class DictionarySidebarComponent implements OnInit {
  words: UserDictionaryEntry[] = [];
  searchTerm: string = '';
  @Output() selectWord = new EventEmitter<UserDictionaryEntry>();

  constructor(private dictionaryService: DictionaryService) {}

  ngOnInit(): void {
    const userId = '1238c9cd-a894-4e00-a8aa-d0d0cf388488';
    this.dictionaryService.getUserWords(userId).subscribe((entries) => {
      this.words = entries.map((entry) => ({
        ...(entry as Omit<UserDictionaryEntry, 'user_id'>),
        user_id: userId,
      }));
      
    });
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
