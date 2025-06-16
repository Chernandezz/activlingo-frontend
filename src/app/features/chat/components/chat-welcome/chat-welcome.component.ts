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
  templateUrl: './chat-welcome.component.html',
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
