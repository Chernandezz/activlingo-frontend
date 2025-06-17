import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Scenario {
  id: string;
  title: string;
  description: string;
  context: string;
  icon: string;
  category: 'real-life' | 'fiction' | 'daily' | 'professional';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

@Component({
  selector: 'app-chat-welcome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-welcome.component.html',
})
export class ChatWelcomeComponent {
  @Output() startChat = new EventEmitter<{ role: string; context: string }>();
  @Output() openChatsPanel = new EventEmitter<void>();

  searchTerm = '';
  selectedCategory: string | null = null;
  filteredScenarios: Scenario[] = [];

  categories = [
    { key: 'daily', name: 'Día a día', icon: 'fas fa-utensils' },
    { key: 'real-life', name: 'Vida real', icon: 'fas fa-globe' },
    { key: 'professional', name: 'Profesional', icon: 'fas fa-building' },
    { key: 'fiction', name: 'Ficción', icon: 'fas fa-gamepad' },
  ];

  scenarios: Scenario[] = [
    // DAILY - Día a día
    {
      id: 'restaurant-order',
      title: 'Ordenar en un Restaurante',
      description:
        'Estás en un restaurante elegante y necesitas hacer tu pedido.',
      context:
        'Estoy en un restaurante elegante para cenar. El mesero está atento y listo para tomar mi pedido.',
      icon: 'fas fa-utensils',
      category: 'daily',
      difficulty: 'beginner',
      tags: ['comida', 'restaurante', 'pedido'],
    },
    {
      id: 'grocery-shopping',
      title: 'Compras en el Supermercado',
      description: 'Estás haciendo compras y no encuentras varios productos.',
      context:
        'Estoy haciendo compras en el supermercado y necesito ayuda para encontrar productos específicos.',
      icon: 'fas fa-store',
      category: 'daily',
      difficulty: 'beginner',
      tags: ['compras', 'supermercado', 'productos'],
    },
    {
      id: 'coffee-shop',
      title: 'Cafetería de Especialidad',
      description:
        'Entras a una cafetería nueva y el barista te explica los diferentes cafés.',
      context:
        'Estoy en una cafetería especializada y el barista quiere enseñarme sobre diferentes tipos de café.',
      icon: 'fas fa-coffee',
      category: 'daily',
      difficulty: 'intermediate',
      tags: ['café', 'barista', 'especialidad'],
    },
    {
      id: 'gym-session',
      title: 'Primera Sesión en el Gimnasio',
      description:
        'Es tu primer día en un gimnasio nuevo y necesitas orientación.',
      context:
        'Es mi primer día en el gimnasio y necesito que me expliquen cómo usar las máquinas y el horario.',
      icon: 'fas fa-dumbbell',
      category: 'daily',
      difficulty: 'beginner',
      tags: ['ejercicio', 'gimnasio', 'salud'],
    },
    {
      id: 'roommate-interview',
      title: 'Entrevista para Compañero de Cuarto',
      description: 'Estás entrevistando a un posible compañero de cuarto.',
      context:
        'Tengo una cita para conocer a un posible compañero de cuarto y discutir hábitos de convivencia.',
      icon: 'fas fa-home',
      category: 'daily',
      difficulty: 'beginner',
      tags: ['vivienda', 'entrevista', 'convivencia'],
    },
    {
      id: 'dating-conversation',
      title: 'Primera Cita',
      description:
        'Estás en una primera cita y quieres causar buena impresión.',
      context:
        'Estoy en una primera cita en un café y quiero conocer mejor a la persona.',
      icon: 'fas fa-heart',
      category: 'daily',
      difficulty: 'intermediate',
      tags: ['cita', 'romance', 'conversación'],
    },

    // REAL-LIFE - Vida real
    {
      id: 'taxi-nyc',
      title: 'Taxi en Nueva York',
      description:
        'Te subes a un taxi en Manhattan y necesitas llegar a tu destino.',
      context:
        'Me acabo de subir a un taxi amarillo en Nueva York. El conductor es amigable y quiere charlar mientras me lleva a mi destino.',
      icon: 'fas fa-taxi',
      category: 'real-life',
      difficulty: 'beginner',
      tags: ['transporte', 'direcciones', 'ciudad'],
    },
    {
      id: 'airport-checkin',
      title: 'Check-in en el Aeropuerto',
      description:
        'Llegas al aeropuerto y necesitas hacer check-in para tu vuelo.',
      context:
        'Estoy en el mostrador del aeropuerto haciendo check-in para mi vuelo internacional.',
      icon: 'fas fa-plane',
      category: 'real-life',
      difficulty: 'intermediate',
      tags: ['viaje', 'aeropuerto', 'vuelo'],
    },
    {
      id: 'doctor-visit',
      title: 'Consulta Médica',
      description: 'No te sientes bien y vas al médico.',
      context:
        'No me siento bien y vengo a ver al médico. Necesito describir mis síntomas.',
      icon: 'fas fa-stethoscope',
      category: 'real-life',
      difficulty: 'intermediate',
      tags: ['salud', 'médico', 'síntomas'],
    },
    {
      id: 'bank-account',
      title: 'Abrir Cuenta Bancaria',
      description: 'Visitas el banco para abrir una cuenta nueva.',
      context:
        'Estoy en el banco para abrir mi primera cuenta en este país y necesito entender los requisitos.',
      icon: 'fas fa-university',
      category: 'real-life',
      difficulty: 'intermediate',
      tags: ['banco', 'finanzas', 'documentos'],
    },
    {
      id: 'hotel-checkin',
      title: 'Check-in en Hotel',
      description: 'Llegas al hotel pero hay un problema con tu reservación.',
      context:
        'Acabo de llegar al hotel después de un largo viaje, pero hay un problema con mi reservación.',
      icon: 'fas fa-bed',
      category: 'real-life',
      difficulty: 'intermediate',
      tags: ['hotel', 'viaje', 'reservación'],
    },
    {
      id: 'pharmacy-visit',
      title: 'Comprar Medicamentos',
      description: 'Necesitas medicamentos pero tienes dudas sobre la receta.',
      context:
        'Estoy en la farmacia con una receta médica pero tengo dudas sobre las instrucciones.',
      icon: 'fas fa-pills',
      category: 'real-life',
      difficulty: 'beginner',
      tags: ['farmacia', 'medicamentos', 'salud'],
    },

    // PROFESSIONAL - Profesional
    {
      id: 'job-interview',
      title: 'Entrevista de Trabajo',
      description: 'Tienes una entrevista para el trabajo de tus sueños.',
      context:
        'Tengo una entrevista de trabajo para una posición que realmente quiero.',
      icon: 'fas fa-briefcase',
      category: 'professional',
      difficulty: 'advanced',
      tags: ['trabajo', 'entrevista', 'carrera'],
    },
    {
      id: 'business-meeting',
      title: 'Reunión Internacional',
      description:
        'Participas en una reunión importante con colegas de otros países.',
      context:
        'Estoy en una reunión de negocios importante con colegas internacionales.',
      icon: 'fas fa-users',
      category: 'professional',
      difficulty: 'advanced',
      tags: ['negocios', 'reunión', 'internacional'],
    },
    {
      id: 'startup-pitch',
      title: 'Presentar tu Startup',
      description: 'Tienes 5 minutos para convencer a inversionistas.',
      context:
        'Tengo una reunión con inversionistas y debo presentar mi startup de manera convincente.',
      icon: 'fas fa-rocket',
      category: 'professional',
      difficulty: 'advanced',
      tags: ['startup', 'inversionista', 'pitch'],
    },
    {
      id: 'university-inquiry',
      title: 'Consulta Universitaria',
      description: 'Visitas una universidad para preguntar sobre programas.',
      context:
        'Estoy visitando una universidad para aprender sobre programas de maestría.',
      icon: 'fas fa-graduation-cap',
      category: 'professional',
      difficulty: 'intermediate',
      tags: ['educación', 'universidad', 'programa'],
    },
    {
      id: 'conference-networking',
      title: 'Networking en Conferencia',
      description: 'Estás en una conferencia profesional haciendo contactos.',
      context:
        'Estoy en una conferencia de mi industria y quiero hacer networking con otros profesionales.',
      icon: 'fas fa-handshake',
      category: 'professional',
      difficulty: 'advanced',
      tags: ['networking', 'conferencia', 'contactos'],
    },
    {
      id: 'client-presentation',
      title: 'Presentación a Cliente',
      description: 'Debes presentar una propuesta importante a un cliente.',
      context:
        'Tengo una presentación crucial con un cliente potencial para cerrar un gran contrato.',
      icon: 'fas fa-chart-line',
      category: 'professional',
      difficulty: 'advanced',
      tags: ['cliente', 'presentación', 'ventas'],
    },

    // FICTION - Ficción
    {
      id: 'space-mission',
      title: 'Perdido en el Espacio',
      description:
        'Eres un astronauta y tu nave espacial tiene problemas técnicos.',
      context:
        'Soy un astronauta y mi nave espacial tiene una falla crítica. Necesito contactar con el control de misión.',
      icon: 'fas fa-rocket',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['espacio', 'astronauta', 'emergencia'],
    },
    {
      id: 'pirate-treasure',
      title: 'Búsqueda del Tesoro Pirata',
      description: 'Eres un pirata en busca del tesoro perdido.',
      context:
        'Soy un pirata en una aventura épica buscando un tesoro perdido. Tengo un mapa misterioso.',
      icon: 'fas fa-skull-crossbones',
      category: 'fiction',
      difficulty: 'intermediate',
      tags: ['pirata', 'tesoro', 'aventura'],
    },
    {
      id: 'zombie-survival',
      title: 'Supervivencia Zombie',
      description:
        'Estás en un apocalipsis zombie y necesitas encontrar supervivientes.',
      context:
        'Estoy en medio de un apocalipsis zombie y acabo de encontrar otros supervivientes.',
      icon: 'fas fa-running',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['zombies', 'supervivencia', 'estrategia'],
    },
    {
      id: 'dragon-negotiation',
      title: 'Negociando con un Dragón',
      description: 'Te encuentras con un dragón antiguo que protege un tesoro.',
      context:
        'Me he encontrado con un dragón milenario que guarda un tesoro ancestral.',
      icon: 'fas fa-dragon',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['dragón', 'negociación', 'fantasía'],
    },
    {
      id: 'wizard-school',
      title: 'Primer Día en Escuela de Magia',
      description:
        'Es tu primer día en una escuela de magia y necesitas hacer amigos.',
      context:
        'Es mi primer día en la escuela de magia y estoy conociendo a otros estudiantes.',
      icon: 'fas fa-hat-wizard',
      category: 'fiction',
      difficulty: 'intermediate',
      tags: ['magia', 'escuela', 'amistad'],
    },
    {
      id: 'superhero-training',
      title: 'Entrenamiento de Superhéroe',
      description:
        'Acabas de descubrir tus superpoderes y necesitas entrenamiento.',
      context:
        'Acabo de descubrir que tengo superpoderes y necesito entrenar con un mentor.',
      icon: 'fas fa-bolt',
      category: 'fiction',
      difficulty: 'intermediate',
      tags: ['superhéroe', 'poderes', 'entrenamiento'],
    },
    {
      id: 'time-traveler',
      title: 'Viajero del Tiempo',
      description:
        'Has viajado accidentalmente al pasado y necesitas regresar.',
      context:
        'He viajado accidentalmente al año 1920 y necesito encontrar una manera de regresar.',
      icon: 'fas fa-clock',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['tiempo', 'historia', 'aventura'],
    },
    {
      id: 'alien-contact',
      title: 'Primer Contacto Alienígena',
      description:
        'Eres el primer humano en contactar con una civilización alienígena.',
      context:
        'Soy la primera persona en hacer contacto con una civilización alienígena pacífica.',
      icon: 'fas fa-user-astronaut',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['alienígenas', 'comunicación', 'diplomacia'],
    },
    {
      id: 'detective-case',
      title: 'Detective Investigando',
      description: 'Eres un detective privado resolviendo un caso misterioso.',
      context:
        'Soy un detective privado investigando un caso misterioso y necesito interrogar testigos.',
      icon: 'fas fa-search',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['misterio', 'detective', 'investigación'],
    },
    {
      id: 'medieval-knight',
      title: 'Caballero Medieval',
      description: 'Eres un caballero en una misión del rey.',
      context:
        'Soy un caballero medieval en una misión especial del rey para salvar el reino.',
      icon: 'fas fa-chess-knight',
      category: 'fiction',
      difficulty: 'intermediate',
      tags: ['medieval', 'caballero', 'misión'],
    },
  ];

  constructor() {
    this.filteredScenarios = [...this.scenarios];
  }

  filterScenarios(): void {
    let filtered = [...this.scenarios];

    // Filtrar por categoría si hay una seleccionada
    if (this.selectedCategory) {
      filtered = filtered.filter(
        (scenario) => scenario.category === this.selectedCategory
      );
    }

    // Filtrar por término de búsqueda si hay uno
    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
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

  openChats(): void {
    this.openChatsPanel.emit();
  }

  getScenariosByCategory(category: string): Scenario[] {
    // Si hay filtros aplicados, usar los escenarios filtrados
    if (this.searchTerm.trim() || this.selectedCategory) {
      return this.filteredScenarios.filter(
        (scenario) => scenario.category === category
      );
    }
    // Si no hay filtros, mostrar todos los escenarios de la categoría
    return this.scenarios.filter((scenario) => scenario.category === category);
  }

  getRecommendedScenarios(): Scenario[] {
    const recommendedIds = [
      'restaurant-order',
      'taxi-nyc',
      'pirate-treasure',
      'zombie-survival',
      'superhero-training',
      'job-interview',
    ];

    // Si hay filtros aplicados, usar los escenarios filtrados
    if (this.searchTerm.trim() || this.selectedCategory) {
      return this.filteredScenarios.filter((s) =>
        recommendedIds.includes(s.id)
      );
    }

    // Si no hay filtros, mostrar los recomendados originales
    return recommendedIds
      .map((id) => this.scenarios.find((s) => s.id === id)!)
      .filter(Boolean);
  }

  // Métodos para el carousel - Modificado para mover de a 2 elementos
  scrollCarousel(direction: 'left' | 'right', categoryKey: string): void {
    const container = document.querySelector(
      `[data-category="${categoryKey}"]`
    ) as HTMLElement;
    if (!container) return;

    const scrollAmount = 640; // Card width (320) + gap (24) = 344, multiplicado por 2 = 688, ajustado a 640 para mejor comportamiento
    const currentScroll = container.scrollLeft;
    const newScroll =
      direction === 'left'
        ? currentScroll - scrollAmount
        : currentScroll + scrollAmount;

    container.scrollTo({
      left: newScroll,
      behavior: 'smooth',
    });
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      daily: 'bg-gradient-to-r from-green-500 to-emerald-500',
      'real-life': 'bg-gradient-to-r from-blue-500 to-indigo-500',
      professional: 'bg-gradient-to-r from-purple-500 to-violet-500',
      fiction: 'bg-gradient-to-r from-pink-500 to-rose-500',
    };
    return colors[category] || 'bg-gray-500';
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

  getCategoryDescription(category: string): string {
    const descriptions: { [key: string]: string } = {
      daily: 'Situaciones cotidianas para dominar el día a día',
      'real-life': 'Escenarios realistas del mundo real',
      professional: 'Impulsa tu carrera profesional',
      fiction: 'Aventuras épicas y divertidas',
    };
    return descriptions[category] || '';
  }
}
