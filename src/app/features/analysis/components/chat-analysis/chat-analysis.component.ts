// // src/app/features/analysis/components/chat-analysis.component.ts
// import { Component, Input, OnChanges } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Observable, BehaviorSubject } from 'rxjs';
// import { LanguageAnalysisPoint } from '../../../chat/models/language-analysis.model';
// import { LocalAnalysisRepository } from '../../../../data/repositories/local-analysis.repository';

// @Component({
//   selector: 'app-chat-analysis',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './chat-analysis.component.html',
// })
// export class ChatAnalysisComponent implements OnChanges {
//   @Input() chatId: number | undefined;

//   private analysisPointsSubject = new BehaviorSubject<LanguageAnalysisPoint[]>(
//     []
//   );
//   analysisPoints$ = this.analysisPointsSubject.asObservable();

//   constructor(private analysisRepository: LocalAnalysisRepository) {}

//   ngOnChanges(): void {
//     if (this.chatId) {
//       this.loadAnalysisPoints();
//     } else {
//       this.analysisPointsSubject.next([]);
//     }
//   }

//   loadAnalysisPoints(): void {
//     // if (this.chatId) {
//     //   this.analysisRepository
//     //     .getAnalysisPointsForChat(this.chatId)
//     //     .subscribe((points) => {
//     //       this.analysisPointsSubject.next(points);
//     //     });
//     // }
//   }

//   getCategoryCount(type: string): number {
//     return this.analysisPointsSubject.value.filter((p) => p.type === type)
//       .length;
//   }

//   getTypeClass(type: string): string {
//     const classes = {
//       grammar: 'bg-blue-900',
//       vocabulary: 'bg-purple-900',
//       phrasal_verb: 'bg-green-900',
//       idiom: 'bg-yellow-900',
//       pronunciation: 'bg-red-900',
//     };
//     return classes[type as keyof typeof classes] || 'bg-gray-900';
//   }

//   getTypeLabel(type: string): string {
//     const labels = {
//       grammar: 'Gramática',
//       vocabulary: 'Vocabulario',
//       phrasal_verb: 'Phrasal Verb',
//       idiom: 'Expresión',
//       pronunciation: 'Pronunciación',
//     };
//     return labels[type as keyof typeof labels] || type;
//   }

//   showPointDetail(point: LanguageAnalysisPoint): void {
//     // Aquí implementarías un modal o panel para mostrar detalles
//     alert(`${point.explanation}`);

//     // Marcar como revisado
//     this.analysisRepository.markAsReviewed(point.id).subscribe(() => {
//       // Opcionalmente, recargar los puntos o actualizar la UI
//       this.loadAnalysisPoints();
//     });
//   }
// }
