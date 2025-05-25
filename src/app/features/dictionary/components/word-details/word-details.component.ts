import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserDictionaryEntry } from '../../../../core/models/user-dictionary.model';

@Component({
  selector: 'app-word-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './word-details.component.html',
})
export class WordDetailsComponent {
  @Input() word!: UserDictionaryEntry;
}
