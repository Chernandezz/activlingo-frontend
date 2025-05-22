import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-analysis-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-analysis-summary.component.html',
  styleUrls: ['./chat-analysis-summary.component.css'],
})
export class ChatAnalysisSummaryComponent {
  @Input() grammar = 0;
  @Input() vocabulary = 0;
  @Input() phrasalVerbs = 0;
  @Input() expressions = 0;
}
