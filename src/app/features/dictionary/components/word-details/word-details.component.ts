import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDictionaryEntry } from '../../../../core/models/user-dictionary.model';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-word-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './word-details.component.html',
})
export class WordDetailsComponent {
  @Output() back = new EventEmitter<void>();
  @Input() word!: UserDictionaryEntry;
}
