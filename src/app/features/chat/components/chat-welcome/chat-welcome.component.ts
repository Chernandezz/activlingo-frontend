import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faTaxi,
  faUniversity,
  faRocket,
  faStore,
  faPlane,
  faHospital,
  faUtensils,
  faBuilding,
  faUsers,
  faGraduationCap,
  faHeart,
  faGamepad,
  faGlobe,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';

interface Scenario {
  id: string;
  title: string;
  description: string;
  context: string;
  icon: any;
  category: 'real-life' | 'fiction' | 'daily' | 'professional';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

@Component({
  selector: 'app-chat-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  template: `
    <div
      class="h-full bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6 overflow-y-auto"
    >
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl mb-4 shadow-lg"
        >
          <fa-icon [icon]="faSearch" class="text-white text-2xl"></fa-icon>
        </div>
        <h1
          class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent mb-2"
        >
          ¡Comencemos a Practicar!
        </h1>
        <p class="text-gray-600 text-lg max-w-2xl mx-auto">
          Elige un escenario y sumérgete en conversaciones reales en inglés
        </p>
      </div>

      <!-- Search Bar -->
      <div class="max-w-md mx-auto mb-8">
        <div class="relative">
          <fa-icon
            [icon]="faSearch"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          ></fa-icon>
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (input)="filterScenarios()"
            placeholder="Buscar escenarios..."
            class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      <!-- Category Filters -->
      <div class="flex flex-wrap justify-center gap-3 mb-8">
        <button
          *ngFor="let category of categories"
          (click)="
            selectedCategory =
              selectedCategory === category.key ? null : category.key;
            filterScenarios()
          "
          class="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 shadow-sm"
          [class]="
            selectedCategory === category.key
              ? 'bg-gradient-to-r from-emerald-500 to-blue-500 text-white shadow-md transform scale-105'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-md'
          "
        >
          <fa-icon [icon]="category.icon" class="mr-2"></fa-icon>
          {{ category.name }}
        </button>
      </div>

      <!-- Scenarios Grid -->
      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
      >
        <div
          *ngFor="let scenario of filteredScenarios"
          (click)="selectScenario(scenario)"
          class="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-emerald-200 hover:-translate-y-1"
        >
          <!-- Icon and Category -->
          <div class="flex items-start justify-between mb-4">
            <div
              class="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-sm group-hover:shadow-md transition-shadow"
              [class]="getCategoryColor(scenario.category)"
            >
              <fa-icon
                [icon]="scenario.icon"
                class="text-white text-xl"
              ></fa-icon>
            </div>
            <div class="flex flex-col items-end">
              <span
                class="text-xs font-semibold px-2 py-1 rounded-full"
                [class]="getCategoryBadgeColor(scenario.category)"
              >
                {{ getCategoryName(scenario.category) }}
              </span>
              <span
                class="text-xs mt-1 px-2 py-1 rounded-full"
                [class]="getDifficultyColor(scenario.difficulty)"
              >
                {{ getDifficultyName(scenario.difficulty) }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="mb-4">
            <h3
              class="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors"
            >
              {{ scenario.title }}
            </h3>
            <p class="text-gray-600 text-sm leading-relaxed line-clamp-3">
              {{ scenario.description }}
            </p>
          </div>

          <!-- Tags -->
          <div class="flex flex-wrap gap-1 mb-4">
            <span
              *ngFor="let tag of scenario.tags.slice(0, 3)"
              class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
            >
              {{ tag }}
            </span>
            <span
              *ngIf="scenario.tags.length > 3"
              class="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-md"
            >
              +{{ scenario.tags.length - 3 }}
            </span>
          </div>

          <!-- Action -->
          <div class="pt-4 border-t border-gray-100">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">Haz clic para comenzar</span>
              <div
                class="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors"
              >
                <svg
                  class="w-4 h-4 text-emerald-600 transform group-hover:translate-x-0.5 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="filteredScenarios.length === 0" class="text-center py-16">
        <div
          class="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center"
        >
          <fa-icon [icon]="faSearch" class="text-gray-400 text-2xl"></fa-icon>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">
          No se encontraron escenarios
        </h3>
        <p class="text-gray-500 max-w-sm mx-auto">
          Intenta con otros términos de búsqueda o crea tu propio escenario.
        </p>
      </div>
    </div>
  `,
})
export class ChatWelcomeComponent {
  @Output() startChat = new EventEmitter<{ role: string; context: string }>();

  faSearch = faSearch;

  searchTerm = '';
  selectedCategory: string | null = null;
  filteredScenarios: Scenario[] = [];

  categories = [
    { key: 'daily', name: 'Día a día', icon: faUtensils },
    { key: 'real-life', name: 'Vida real', icon: faGlobe },
    { key: 'professional', name: 'Profesional', icon: faBuilding },
    { key: 'fiction', name: 'Ficción', icon: faGamepad },
  ];

  scenarios: Scenario[] = [
    // Vida Real - Día a día
    {
      id: 'taxi-nyc',
      title: 'Taxi en Nueva York',
      description:
        'Te subes a un taxi en Manhattan y necesitas llegar a tu destino. Practica dando direcciones y conversando con el conductor.',
      context:
        'You just got into a yellow taxi in New York City. The driver is friendly and wants to chat while taking you to your destination. Practice giving directions and making small talk.',
      icon: faTaxi,
      category: 'real-life',
      difficulty: 'beginner',
      tags: ['transporte', 'direcciones', 'ciudad', 'conversación'],
    },
    {
      id: 'restaurant-order',
      title: 'Ordenar en un Restaurante',
      description:
        'Estás en un restaurante elegante y necesitas hacer tu pedido. Practica hablando con el mesero y haciendo preguntas sobre el menú.',
      context:
        'You are at a nice restaurant for dinner. The waiter is attentive and ready to take your order. Ask questions about the menu and make your selection.',
      icon: faUtensils,
      category: 'daily',
      difficulty: 'beginner',
      tags: ['comida', 'restaurante', 'pedido', 'mesero'],
    },
    {
      id: 'airport-checkin',
      title: 'Check-in en el Aeropuerto',
      description:
        'Llegas al aeropuerto y necesitas hacer check-in para tu vuelo. Habla con el agente de la aerolínea sobre tu equipaje y asiento.',
      context:
        'You are at the airport counter checking in for your international flight. The airline agent needs to verify your information and help with seat selection.',
      icon: faPlane,
      category: 'real-life',
      difficulty: 'intermediate',
      tags: ['viaje', 'aeropuerto', 'vuelo', 'equipaje'],
    },
    {
      id: 'grocery-shopping',
      title: 'Compras en el Supermercado',
      description:
        'Estás haciendo compras y necesitas encontrar productos específicos. Pregunta a los empleados y habla con otros compradores.',
      context:
        'You are grocery shopping and need help finding specific items. Ask store employees for assistance and make friendly conversation with other shoppers.',
      icon: faStore,
      category: 'daily',
      difficulty: 'beginner',
      tags: ['compras', 'supermercado', 'productos', 'ayuda'],
    },

    // Profesional
    {
      id: 'university-inquiry',
      title: 'Consulta en la Universidad',
      description:
        'Visitas una universidad y necesitas información sobre programas de estudio. Habla con el consejero académico sobre requisitos y fechas.',
      context:
        'You are visiting a university and meeting with an academic advisor. You want to learn about degree programs, requirements, and application deadlines.',
      icon: faUniversity,
      category: 'professional',
      difficulty: 'intermediate',
      tags: ['educación', 'universidad', 'programa', 'requisitos'],
    },
    {
      id: 'job-interview',
      title: 'Entrevista de Trabajo',
      description:
        'Tienes una entrevista para el trabajo de tus sueños. Responde preguntas sobre tu experiencia y haz preguntas inteligentes sobre la compañía.',
      context:
        'You are in a job interview for a position you really want. Answer questions about your background and ask thoughtful questions about the company.',
      icon: faBuilding,
      category: 'professional',
      difficulty: 'advanced',
      tags: ['trabajo', 'entrevista', 'carrera', 'profesional'],
    },
    {
      id: 'business-meeting',
      title: 'Reunión de Negocios',
      description:
        'Participas en una reunión importante con colegas internacionales. Presenta tus ideas y contribuye a la discusión del proyecto.',
      context:
        'You are in an important business meeting with international colleagues. Present your ideas and contribute to the project discussion.',
      icon: faUsers,
      category: 'professional',
      difficulty: 'advanced',
      tags: ['negocios', 'reunión', 'presentación', 'equipo'],
    },

    // Salud y Emergencias
    {
      id: 'doctor-visit',
      title: 'Visita al Doctor',
      description:
        'No te sientes bien y vas al médico. Describe tus síntomas y entiende las recomendaciones del doctor.',
      context:
        "You are not feeling well and have come to see the doctor. Describe your symptoms and understand the doctor's recommendations.",
      icon: faHospital,
      category: 'real-life',
      difficulty: 'intermediate',
      tags: ['salud', 'médico', 'síntomas', 'tratamiento'],
    },

    // Ficción y Aventura
    {
      id: 'space-mission',
      title: 'Perdido en el Espacio',
      description:
        'Eres un astronauta perdido en el espacio y necesitas contactar con la Tierra. Solicita instrucciones urgentes para regresar a salvo.',
      context:
        'You are an astronaut lost in space and need to contact Earth urgently. Request emergency instructions to return safely to your space station.',
      icon: faRocket,
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['espacio', 'astronauta', 'emergencia', 'rescate'],
    },
    {
      id: 'detective-case',
      title: 'Detective Investigando',
      description:
        'Eres un detective investigando un misterioso caso. Interroga testigos y reúne pistas para resolver el crimen.',
      context:
        'You are a detective investigating a mysterious case. Interview witnesses and gather clues to solve the crime.',
      icon: faSearch,
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['misterio', 'detective', 'investigación', 'crimen'],
    },
    {
      id: 'time-traveler',
      title: 'Viajero del Tiempo',
      description:
        'Has viajado accidentalmente al pasado y necesitas encontrar la manera de regresar a tu época sin alterar la historia.',
      context:
        'You have accidentally traveled back in time and need to find a way back to your era without altering history.',
      icon: faSearch,
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['tiempo', 'historia', 'aventura', 'futuro'],
    },

    // Situaciones Sociales
    {
      id: 'dating-conversation',
      title: 'Primera Cita',
      description:
        'Estás en una primera cita y quieres causar una buena impresión. Mantén una conversación interesante y conoce mejor a tu cita.',
      context:
        'You are on a first date and want to make a good impression. Keep an interesting conversation going and get to know your date better.',
      icon: faHeart,
      category: 'daily',
      difficulty: 'intermediate',
      tags: ['cita', 'romance', 'conversación', 'social'],
    },
    {
      id: 'graduation-party',
      title: 'Fiesta de Graduación',
      description:
        'Estás en una fiesta de graduación conociendo a los padres de tu mejor amigo. Mantén conversaciones corteses y comparte anécdotas.',
      context:
        "You are at a graduation party meeting your best friend's parents. Make polite conversation and share appropriate stories.",
      icon: faGraduationCap,
      category: 'daily',
      difficulty: 'intermediate',
      tags: ['fiesta', 'graduación', 'familia', 'social'],
    },
  ];

  constructor() {
    this.filteredScenarios = [...this.scenarios];
  }

  filterScenarios(): void {
    let filtered = [...this.scenarios];

    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(
        (scenario) => scenario.category === this.selectedCategory
      );
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (scenario) =>
          scenario.title.toLowerCase().includes(term) ||
          scenario.description.toLowerCase().includes(term) ||
          scenario.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    this.filteredScenarios = filtered;
  }

  selectScenario(scenario: Scenario): void {
    this.startChat.emit({
      role: scenario.title,
      context: scenario.context,
    });
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      daily: 'bg-gradient-to-r from-green-500 to-emerald-500',
      'real-life': 'bg-gradient-to-r from-blue-500 to-indigo-500',
      professional: 'bg-gradient-to-r from-purple-500 to-violet-500',
      fiction: 'bg-gradient-to-r from-pink-500 to-rose-500',
    };
    return colors[category] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  }

  getCategoryBadgeColor(category: string): string {
    const colors: { [key: string]: string } = {
      daily: 'bg-green-100 text-green-800',
      'real-life': 'bg-blue-100 text-blue-800',
      professional: 'bg-purple-100 text-purple-800',
      fiction: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  }

  getDifficultyColor(difficulty: string): string {
    const colors: { [key: string]: string } = {
      beginner: 'bg-emerald-100 text-emerald-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  }

  getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
      daily: 'Día a día',
      'real-life': 'Vida real',
      professional: 'Profesional',
      fiction: 'Ficción',
    };
    return names[category] || category;
  }

  getDifficultyName(difficulty: string): string {
    const names: { [key: string]: string } = {
      beginner: 'Principiante',
      intermediate: 'Intermedio',
      advanced: 'Avanzado',
    };
    return names[difficulty] || difficulty;
  }
}
