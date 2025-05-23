// import { Injectable } from '@angular/core';
// import { Observable, of, delay } from 'rxjs';
// // import { ConversationScenario } from '../../chat/models/scenario.model';


// @Injectable({
//   providedIn: 'root'
// })
// export class MockScenarioService {
//   getAvailableScenarios(): Observable<ConversationScenario[]> {
//     return of([
//       {
//         id: 'neighbor-dog',
//         title: 'Pasear al perro',
//         description: 'Estás paseando a tu perro cuando te encuentras con tu vecino. Inicia una conversación casual.',
//         language: 'en',
//         level: 'beginner',
//         tags: ['casual', 'neighbors', 'pets'],
//         examplePrompt: 'Oh, hi there! I see you got a new dog. Whats its name?'
//       },
//       {
//         id: 'football-coach',
//         title: 'Después del partido',
//         description: 'El partido ha terminado y quieres hablar con el entrenador sobre tu desempeño.',
//         language: 'en',
//         level: 'intermediate',
//         tags: ['sports', 'feedback', 'performance'],
//         examplePrompt: 'So, what did you think about my performance today?'
//       },
//       {
//         id: 'restaurant-order',
//         title: 'Ordenar en un restaurante',
//         description: 'Estás en un restaurante y necesitas hacer un pedido especial al camarero.',
//         language: 'en',
//         level: 'beginner',
//         tags: ['food', 'service', 'orders'],
//         examplePrompt: 'Excuse me, Id like to order but I have some dietary restrictions.'
//       }
//     ]).pipe(delay(300)); // Simular latencia
//   }
// }