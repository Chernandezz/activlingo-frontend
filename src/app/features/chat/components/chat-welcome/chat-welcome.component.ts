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
  role: string;
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
        'Estás en un restaurante elegante celebrando una ocasión especial.',
      context:
        'Soy un cliente (usuario) en un restaurante elegante celebrando mi aniversario. Tú eres el mesero experto (IA) que quiere hacer esta noche perfecta y memorable.',
      role: 'Mesero experto y entusiasta',
      icon: 'fas fa-utensils',
      category: 'daily',
      difficulty: 'beginner',
      tags: ['comida', 'restaurante', 'celebración'],
    },
    {
      id: 'grocery-shopping',
      title: 'Compras en el Supermercado',
      description: 'Estás haciendo compras y no encuentras varios productos.',
      context:
        'Soy un cliente (usuario) haciendo compras. Tú eres el empleado del supermercado (IA) que conoce cada pasillo y puede ayudarme a encontrar lo que necesito.',
      role: 'Empleado del supermercado',
      icon: 'fas fa-store',
      category: 'daily',
      difficulty: 'beginner',
      tags: ['compras', 'supermercado', 'productos'],
    },
    {
      id: 'coffee-shop',
      title: 'Cafetería de Especialidad',
      description:
        'Entras a una cafetería nueva buscando el café perfecto para impresionar a alguien.',
      context:
        'Soy un cliente (usuario) que necesita encontrar el café perfecto para una reunión importante. Tú eres el barista apasionado (IA) que está orgulloso de sus creaciones y quiere ayudarme.',
      role: 'Barista apasionado y orgulloso',
      icon: 'fas fa-coffee',
      category: 'daily',
      difficulty: 'intermediate',
      tags: ['café', 'barista', 'especialidad'],
    },
    {
      id: 'gym-session',
      title: 'Primera Sesión en el Gimnasio',
      description:
        'Es tu primer día y estás nervioso porque quieres cambiar tu vida.',
      context:
        'Soy nuevo en el gimnasio (usuario) y quiero transformar mi vida pero me siento intimidado. Tú eres mi entrenador motivador (IA) que me inspirará y me dará confianza.',
      role: 'Entrenador motivador e inspirador',
      icon: 'fas fa-dumbbell',
      category: 'daily',
      difficulty: 'beginner',
      tags: ['ejercicio', 'gimnasio', 'transformación'],
    },
    {
      id: 'roommate-interview',
      title: 'Entrevista Urgente para Compañero',
      description:
        'Necesitas urgentemente un compañero porque tu anterior roommate se fue.',
      context:
        'Soy alguien (usuario) que necesita urgentemente un compañero porque mi anterior roommate se fue sin aviso. Tú eres el candidato entusiasta (IA) que realmente necesita este lugar.',
      role: 'Candidato entusiasta que necesita el lugar',
      icon: 'fas fa-home',
      category: 'daily',
      difficulty: 'beginner',
      tags: ['vivienda', 'urgencia', 'convivencia'],
    },
    {
      id: 'dating-conversation',
      title: 'Primera Cita Después de Mucho Tiempo',
      description:
        'Es tu primera cita en años y ambos están nerviosos pero emocionados.',
      context:
        'Estoy en mi primera cita en años (usuario) y me siento nervioso pero emocionado. Tú eres mi cita (IA) que también está nerviosa pero con muchas ganas de conectar.',
      role: 'Tu cita nerviosa pero encantadora',
      icon: 'fas fa-heart',
      category: 'daily',
      difficulty: 'intermediate',
      tags: ['cita', 'nervios', 'conexión'],
    },

    // REAL-LIFE - Vida real
    {
      id: 'taxi-nyc',
      title: 'Taxi en Nueva York',
      description:
        'Te subes a un taxi en Manhattan y necesitas llegar a tu destino.',
      context:
        'Soy un pasajero (usuario) que se acaba de subir a un taxi amarillo en Nueva York. Tú eres el conductor amigable (IA) que quiere charlar mientras me lleva a mi destino.',
      role: 'Taxista de NYC',
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
        'Soy un pasajero (usuario) en el mostrador del aeropuerto para hacer check-in. Tú eres el agente de la aerolínea (IA) que me ayudará con mi vuelo internacional.',
      role: 'Agente de aerolínea',
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
        'Soy un paciente (usuario) que no se siente bien. Tú eres el médico profesional (IA) que necesita entender mis síntomas para ayudarme.',
      role: 'Médico general',
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
        'Soy un cliente (usuario) que quiere abrir su primera cuenta en este país. Tú eres el asesor bancario (IA) que me explicará los requisitos y opciones.',
      role: 'Asesor bancario',
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
        'Soy un huésped (usuario) que acaba de llegar al hotel después de un largo viaje. Tú eres el recepcionista (IA) que debe resolver el problema con mi reservación.',
      role: 'Recepcionista de hotel',
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
        'Soy un cliente (usuario) en la farmacia con una receta médica pero con dudas. Tú eres el farmacéutico experto (IA) que me explicará las instrucciones.',
      role: 'Farmacéutico',
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
        'Soy un candidato (usuario) en una entrevista para el trabajo que realmente quiero. Tú eres el entrevistador experimentado (IA) que evaluará mi perfil.',
      role: 'Entrevistador de RRHH',
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
        'Soy un ejecutivo (usuario) en una reunión de negocios importante. Tú eres mi colega internacional (IA) con experiencia global que lidera la discusión.',
      role: 'Ejecutivo internacional',
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
        'Soy un emprendedor (usuario) con una startup prometedora. Tú eres un inversionista experimentado (IA) que quiere entender mi propuesta de negocio.',
      role: 'Inversionista venture capital',
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
        'Soy un estudiante prospecto (usuario) visitando una universidad. Tú eres el consejero académico (IA) que me ayudará a entender los programas de maestría.',
      role: 'Consejero académico',
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
        'Soy un profesional (usuario) en una conferencia de mi industria. Tú eres otro profesional exitoso (IA) que quiere hacer networking y compartir experiencias.',
      role: 'Profesional senior de la industria',
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
        'Soy un consultor (usuario) con una propuesta importante. Tú eres el cliente potencial (IA) interesado pero exigente que evaluará mi presentación.',
      role: 'Cliente corporativo exigente',
      icon: 'fas fa-chart-line',
      category: 'professional',
      difficulty: 'advanced',
      tags: ['cliente', 'presentación', 'ventas'],
    },

    // FICTION - Ficción (¡AQUÍ ESTÁ LA EMOCIÓN!)
    {
      id: 'dragon-negotiation',
      title: 'Negociando con un Dragón Furioso',
      description:
        'Un dragón ancestral está furioso porque robaste de su tesoro.',
      context:
        'Soy un aventurero (usuario) que accidentalmente tomó algo del tesoro. Tú eres el dragón milenario (IA) que está FURIOSO pero dispuesto a escuchar antes de carbonizarme.',
      role: 'Dragón ancestral furioso pero justo',
      icon: 'fas fa-dragon',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['dragón', 'furia', 'negociación', 'peligro'],
    },
    {
      id: 'space-emergency',
      title: 'Emergencia Espacial Crítica',
      description:
        'Tu nave está fallando y el oxígeno se agota. El control de misión está desesperado.',
      context:
        'Soy un astronauta (usuario) en una nave con falla crítica y oxígeno limitado. Tú eres el comandante desesperado (IA) que hará todo lo posible para salvarme.',
      role: 'Comandante espacial desesperado',
      icon: 'fas fa-rocket',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['espacio', 'emergencia', 'vida o muerte'],
    },
    {
      id: 'pirate-betrayal',
      title: 'Capitán Pirata Traicionado',
      description:
        'Eres un pirata joven y el capitán acaba de ser traicionado por su tripulación.',
      context:
        'Soy un pirata joven (usuario) con información sobre un tesoro. Tú eres el capitán veterano (IA) que acaba de ser traicionado por su tripulación y necesita aliados.',
      role: 'Capitán pirata traicionado y vengativo',
      icon: 'fas fa-skull-crossbones',
      category: 'fiction',
      difficulty: 'intermediate',
      tags: ['pirata', 'traición', 'venganza', 'alianza'],
    },
    {
      id: 'zombie-leader-desperate',
      title: 'Líder Desesperado en el Apocalipsis',
      description:
        'El líder del grupo ha perdido gente y está desesperado por supervivientes confiables.',
      context:
        'Soy un superviviente solitario (usuario) bien equipado. Tú eres el líder desesperado (IA) que acaba de perder la mitad de su grupo y necesita decidir si confiar en mí.',
      role: 'Líder desesperado y desconfiado',
      icon: 'fas fa-running',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['zombies', 'desesperación', 'confianza', 'supervivencia'],
    },
    {
      id: 'wizard-mentor-urgent',
      title: 'Mentor Mágico en Crisis',
      description:
        'Tu mentor está preocupado porque una amenaza se acerca a la escuela.',
      context:
        'Soy un estudiante nuevo (usuario) con potencial mágico único. Tú eres mi mentor urgente (IA) que debe entrenarme rápidamente porque una antigua amenaza ha despertado.',
      role: 'Mago mentor urgente y preocupado',
      icon: 'fas fa-hat-wizard',
      category: 'fiction',
      difficulty: 'intermediate',
      tags: ['magia', 'urgencia', 'amenaza', 'entrenamiento'],
    },
    {
      id: 'superhero-crisis',
      title: 'Entrenamiento de Emergencia',
      description:
        'Un superhéroe veterano debe entrenarte rápidamente porque la ciudad está en peligro.',
      context:
        'Soy alguien (usuario) con nuevos superpoderes incontrolables. Tú eres un superhéroe veterano (IA) que debe entrenarme urgentemente porque un villano amenaza la ciudad.',
      role: 'Superhéroe veterano bajo presión',
      icon: 'fas fa-bolt',
      category: 'fiction',
      difficulty: 'intermediate',
      tags: ['superhéroe', 'urgencia', 'ciudad en peligro'],
    },
    {
      id: 'time-guardian-angry',
      title: 'Guardián del Tiempo Molesto',
      description:
        'El Guardián está molesto porque tu viaje accidental está alterando la historia.',
      context:
        'Soy un viajero accidental (usuario) que llegó al 1920 y ya cambié cosas. Tú eres el Guardián molesto (IA) que debe arreglar el daño temporal antes de que sea irreversible.',
      role: 'Guardián temporal molesto pero responsable',
      icon: 'fas fa-clock',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['tiempo', 'alteración', 'responsabilidad', 'urgencia'],
    },
    {
      id: 'alien-ambassador-furious',
      title: 'Embajador Alienígena Ofendido',
      description:
        'El embajador alienígena está furioso por las acciones violentas de otros humanos.',
      context:
        'Soy el primer humano pacífico (usuario) en hacer contacto. Tú eres el embajador alienígena (IA) que está FURIOSO por los ataques militares previos, pero dispuesto a escuchar.',
      role: 'Embajador alienígena furioso pero diplomático',
      icon: 'fas fa-user-astronaut',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['alienígenas', 'furia', 'diplomacia', 'redención'],
    },
    {
      id: 'crime-witness-scared',
      title: 'Testigo Aterrorizado',
      description:
        'El testigo está aterrorizado porque los criminales amenazaron a su familia.',
      context:
        'Soy un detective privado (usuario) investigando un caso peligroso. Tú eres un testigo aterrorizado (IA) que viste todo pero los criminales amenazaron a tu familia.',
      role: 'Testigo aterrorizado pero valiente',
      icon: 'fas fa-search',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['misterio', 'miedo', 'amenazas', 'valentía'],
    },
    {
      id: 'royal-advisor-urgent',
      title: 'Consejero Real en Crisis',
      description:
        'El reino está en peligro y el consejero necesita tu informe urgentemente.',
      context:
        'Soy un caballero (usuario) que regresa con noticias cruciales sobre una invasión. Tú eres el consejero real desesperado (IA) que debe actuar rápido para salvar el reino.',
      role: 'Consejero real desesperado y estratega',
      icon: 'fas fa-chess-knight',
      category: 'fiction',
      difficulty: 'intermediate',
      tags: ['medieval', 'invasión', 'estrategia', 'reino en peligro'],
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
      role: scenario.role,
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
