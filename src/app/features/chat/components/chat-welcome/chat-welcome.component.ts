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
    // Vida Real - Día a día
    {
      id: 'taxi-nyc',
      title: 'Taxi en Nueva York',
      description:
        'Te subes a un taxi en Manhattan y necesitas llegar a tu destino. Practica dando direcciones y conversando con el conductor.',
      context:
        'Me acabo de subir a un taxi amarillo en Nueva York. El conductor es amigable y quiere charlar mientras me lleva a mi destino.',
      icon: 'fas fa-taxi',
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
        'Estoy en un restaurante elegante para cenar. El mesero está atento y listo para tomar mi pedido.',
      icon: 'fas fa-utensils',
      category: 'daily',
      difficulty: 'beginner',
      tags: ['comida', 'restaurante', 'pedido', 'mesero'],
    },
    {
      id: 'airport-checkin',
      title: 'Check-in en el Aeropuerto',
      description:
        'Llegas al aeropuerto y necesitas hacer check-in para tu vuelo. Habla con el agente sobre tu equipaje y preferencias de asiento.',
      context:
        'Estoy en el mostrador del aeropuerto haciendo check-in para mi vuelo internacional. El agente necesita verificar mi información y ayudarme con la selección de asiento.',
      icon: 'fas fa-plane',
      category: 'real-life',
      difficulty: 'intermediate',
      tags: ['viaje', 'aeropuerto', 'vuelo', 'equipaje'],
    },
    {
      id: 'grocery-shopping',
      title: 'Compras en el Supermercado',
      description:
        'Estás haciendo compras y no encuentras varios productos. Pregunta a los empleados y conversa con otros compradores.',
      context:
        'Estoy haciendo compras en el supermercado y necesito ayuda para encontrar varios productos específicos en mi lista.',
      icon: 'fas fa-store',
      category: 'daily',
      difficulty: 'beginner',
      tags: ['compras', 'supermercado', 'productos', 'ayuda'],
    },
    {
      id: 'coffee-shop',
      title: 'Cafetería de Especialidad',
      description:
        'Entras a una cafetería nueva y el barista te quiere explicar sus diferentes tipos de café. Aprende sobre los granos y métodos.',
      context:
        'Estoy en una cafetería especializada y el barista experto quiere enseñarme sobre los diferentes tipos de café y métodos de preparación.',
      icon: 'fas fa-coffee',
      category: 'daily',
      difficulty: 'intermediate',
      tags: ['café', 'barista', 'especialidad', 'cultura'],
    },
    {
      id: 'hotel-checkin',
      title: 'Hotel Check-in',
      description:
        'Llegas a tu hotel después de un largo viaje y hay un problema con tu reservación. Resuelve la situación con el recepcionista.',
      context:
        'Acabo de llegar al hotel después de un largo vuelo, pero parece que hay un problema con mi reservación.',
      icon: 'fas fa-bed',
      category: 'real-life',
      difficulty: 'intermediate',
      tags: ['hotel', 'reservación', 'viaje', 'problema'],
    },
    {
      id: 'gym-trainer',
      title: 'Entrenador Personal',
      description:
        'Es tu primera sesión con un entrenador personal. Discute tus objetivos de fitness y aprende sobre ejercicios.',
      context:
        'Es mi primera sesión con un entrenador personal en el gimnasio. Quiero discutir mis objetivos de fitness y crear un plan de entrenamiento.',
      icon: 'fas fa-dumbbell',
      category: 'daily',
      difficulty: 'beginner',
      tags: ['ejercicio', 'fitness', 'entrenador', 'salud'],
    },
    {
      id: 'bank-account',
      title: 'Abrir Cuenta Bancaria',
      description:
        'Visitas el banco para abrir tu primera cuenta en el extranjero. Entiende los requisitos y tipos de cuenta disponibles.',
      context:
        'Estoy en el banco para abrir mi primera cuenta corriente en este país. Necesito entender los requisitos y opciones disponibles.',
      icon: 'fas fa-university',
      category: 'real-life',
      difficulty: 'intermediate',
      tags: ['banco', 'cuenta', 'finanzas', 'documentos'],
    },

    // Profesional
    {
      id: 'university-inquiry',
      title: 'Consulta Universitaria',
      description:
        'Visitas una universidad y necesitas información sobre programas de estudio. Habla con el consejero académico.',
      context:
        'Estoy visitando una universidad y tengo una cita con un consejero académico para aprender sobre programas de maestría.',
      icon: 'fas fa-graduation-cap',
      category: 'professional',
      difficulty: 'intermediate',
      tags: ['educación', 'universidad', 'programa', 'requisitos'],
    },
    {
      id: 'job-interview',
      title: 'Entrevista de Trabajo',
      description:
        'Tienes una entrevista para el trabajo de tus sueños. Responde preguntas sobre tu experiencia y demuestra tu valor.',
      context:
        'Tengo una entrevista de trabajo para una posición que realmente quiero. Necesito responder preguntas sobre mi experiencia y hacer preguntas inteligentes.',
      icon: 'fas fa-briefcase',
      category: 'professional',
      difficulty: 'advanced',
      tags: ['trabajo', 'entrevista', 'carrera', 'profesional'],
    },
    {
      id: 'business-meeting',
      title: 'Reunión Internacional',
      description:
        'Participas en una reunión importante con colegas de otros países. Presenta tus ideas y colabora en el proyecto.',
      context:
        'Estoy en una reunión de negocios importante con colegas internacionales. Debo presentar mis ideas para el nuevo proyecto.',
      icon: 'fas fa-users',
      category: 'professional',
      difficulty: 'advanced',
      tags: ['negocios', 'reunión', 'presentación', 'internacional'],
    },
    {
      id: 'conference-networking',
      title: 'Networking en Conferencia',
      description:
        'Estás en una conferencia profesional y quieres hacer contactos. Presenta tu trabajo e intercambia información.',
      context:
        'Estoy en una conferencia profesional de mi industria y quiero hacer networking con otros profesionales.',
      icon: 'fas fa-handshake',
      category: 'professional',
      difficulty: 'advanced',
      tags: ['networking', 'conferencia', 'contactos', 'profesional'],
    },
    {
      id: 'startup-pitch',
      title: 'Presentar Startup',
      description:
        'Tienes 5 minutos para convencer a un inversionista de que tu startup es la próxima gran cosa. ¡Hazlo convincente!',
      context:
        'Tengo una reunión con un inversionista potencial y debo presentar mi startup de manera convincente en pocos minutos.',
      icon: 'fas fa-rocket',
      category: 'professional',
      difficulty: 'advanced',
      tags: ['startup', 'inversionista', 'pitch', 'emprendimiento'],
    },

    // Salud y Emergencias
    {
      id: 'doctor-visit',
      title: 'Consulta Médica',
      description:
        'No te sientes bien y vas al médico. Describe tus síntomas claramente y entiende las recomendaciones.',
      context:
        'No me siento bien y vengo a ver al médico. Necesito describir mis síntomas y entender las recomendaciones.',
      icon: 'fas fa-stethoscope',
      category: 'real-life',
      difficulty: 'intermediate',
      tags: ['salud', 'médico', 'síntomas', 'consulta'],
    },
    {
      id: 'pharmacy-visit',
      title: 'Farmacia',
      description:
        'Necesitas medicamentos pero no entiendes algunas instrucciones. El farmacéutico te ayuda a entender la receta.',
      context:
        'Estoy en la farmacia con una receta médica, pero tengo dudas sobre las instrucciones y efectos secundarios.',
      icon: 'fas fa-pills',
      category: 'real-life',
      difficulty: 'beginner',
      tags: ['farmacia', 'medicamentos', 'receta', 'salud'],
    },

    // Ficción y Aventura - ¡Más divertidos!
    {
      id: 'space-mission',
      title: 'Perdido en el Espacio',
      description:
        'Eres un astronauta y tu nave espacial tiene problemas técnicos. Contacta con la estación base para obtener ayuda urgente.',
      context:
        'Soy un astronauta y mi nave espacial tiene una falla crítica. Necesito contactar urgentemente con el control de misión para obtener instrucciones.',
      icon: 'fas fa-rocket',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['espacio', 'astronauta', 'emergencia', 'ciencia ficción'],
    },
    {
      id: 'detective-case',
      title: 'Detective Privado',
      description:
        'Eres un detective investigando un caso misterioso. Interroga testigos y reúne pistas para resolver el crimen.',
      context:
        'Soy un detective privado investigando un caso misterioso. Debo interrogar testigos y reunir pistas para resolver este crimen.',
      icon: 'fas fa-search',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['misterio', 'detective', 'investigación', 'crimen'],
    },
    {
      id: 'time-traveler',
      title: 'Viajero del Tiempo',
      description:
        'Has viajado accidentalmente al año 1920. Necesitas encontrar la manera de regresar sin alterar la historia.',
      context:
        'He viajado accidentalmente en el tiempo al año 1920. Necesito encontrar una manera de regresar a mi época sin alterar la historia.',
      icon: 'fas fa-clock',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['tiempo', 'historia', 'aventura', 'viaje'],
    },
    {
      id: 'superhero-training',
      title: 'Entrenamiento de Superhéroe',
      description:
        'Acabas de descubrir que tienes superpoderes. Un mentor experimentado te enseña a controlar tus nuevas habilidades.',
      context:
        'Acabo de descubrir que tengo superpoderes y estoy entrenando con un mentor experimentado para aprender a controlarlos.',
      icon: 'fas fa-bolt',
      category: 'fiction',
      difficulty: 'intermediate',
      tags: ['superhéroe', 'poderes', 'entrenamiento', 'mentor'],
    },
    {
      id: 'pirate-treasure',
      title: 'Búsqueda del Tesoro Pirata',
      description:
        'Eres un pirata en busca del tesoro perdido. Necesitas descifrar el mapa y negociar con otros piratas.',
      context:
        'Soy un pirata en una aventura épica buscando un tesoro perdido. Tengo un mapa misterioso que necesito descifrar.',
      icon: 'fas fa-skull-crossbones',
      category: 'fiction',
      difficulty: 'intermediate',
      tags: ['pirata', 'tesoro', 'aventura', 'mapa'],
    },
    {
      id: 'wizard-school',
      title: 'Escuela de Magia',
      description:
        'Es tu primer día en la escuela de magia. Conoce a otros estudiantes y aprende sobre pociones y hechizos.',
      context:
        'Es mi primer día en la escuela de magia. Estoy conociendo a otros estudiantes y aprendiendo sobre pociones y hechizos básicos.',
      icon: 'fas fa-hat-wizard',
      category: 'fiction',
      difficulty: 'intermediate',
      tags: ['magia', 'escuela', 'hechizos', 'fantasía'],
    },
    {
      id: 'alien-contact',
      title: 'Primer Contacto Alienígena',
      description:
        'Eres el primer humano en hacer contacto con una civilización alienígena. Establece comunicación pacífica.',
      context:
        'Soy la primera persona en hacer contacto con una civilización alienígena. Debo establecer comunicación pacífica y representar a la humanidad.',
      icon: 'fas fa-rocket',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['alienígenas', 'comunicación', 'espacio', 'diplomacia'],
    },
    {
      id: 'zombie-survival',
      title: 'Supervivencia Zombie',
      description:
        'Estás en un apocalipsis zombie y necesitas encontrar supervivientes. Coordina un plan de escape seguro.',
      context:
        'Estoy en medio de un apocalipsis zombie y acabo de encontrar otros supervivientes. Necesitamos coordinar un plan de escape.',
      icon: 'fas fa-running',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['zombies', 'supervivencia', 'estrategia', 'equipo'],
    },
    {
      id: 'dragon-negotiation',
      title: 'Negociando con un Dragón',
      description:
        'Te encuentras con un dragón antiguo que protege un tesoro. Necesitas persuadirlo para que te deje pasar.',
      context:
        'Me he encontrado con un dragón milenario que guarda un tesoro ancestral. Debo persuadirlo para que me permita pasar sin luchar.',
      icon: 'fas fa-dragon',
      category: 'fiction',
      difficulty: 'advanced',
      tags: ['dragón', 'negociación', 'fantasía', 'persuasión'],
    },

    // Situaciones Sociales
    {
      id: 'dating-conversation',
      title: 'Primera Cita',
      description:
        'Estás en una primera cita y quieres causar una buena impresión. Mantén una conversación interesante y natural.',
      context:
        'Estoy en una primera cita y quiero causar una buena impresión. Necesito mantener una conversación interesante y conocer mejor a mi cita.',
      icon: 'fas fa-heart',
      category: 'daily',
      difficulty: 'intermediate',
      tags: ['cita', 'romance', 'conversación', 'social'],
    },
    {
      id: 'graduation-party',
      title: 'Fiesta de Graduación',
      description:
        'Estás en una fiesta de graduación conociendo a la familia de tu mejor amigo. Mantén conversaciones corteses.',
      context:
        'Estoy en una fiesta de graduación conociendo a los padres de mi mejor amigo. Quiero hacer buena impresión y mantener conversaciones apropiadas.',
      icon: 'fas fa-graduation-cap',
      category: 'daily',
      difficulty: 'intermediate',
      tags: ['fiesta', 'graduación', 'familia', 'social'],
    },
    {
      id: 'roommate-search',
      title: 'Buscando Compañero de Cuarto',
      description:
        'Estás buscando un compañero de cuarto y tienes una entrevista. Presenta tus hábitos y expectativas.',
      context:
        'Estoy buscando un compañero de cuarto y tengo una entrevista con un candidato potencial. Necesito conocer sus hábitos y compartir los míos.',
      icon: 'fas fa-home',
      category: 'daily',
      difficulty: 'beginner',
      tags: ['vivienda', 'compañero', 'entrevista', 'hábitos'],
    },
    {
      id: 'wedding-planning',
      title: 'Planeando una Boda',
      description:
        'Estás planeando tu boda con el organizador de eventos. Discute tus ideas, presupuesto y preferencias.',
      context:
        'Estoy planeando mi boda y me reúno con un organizador de eventos para discutir mis ideas, presupuesto y preferencias para el gran día.',
      icon: 'fas fa-ring',
      category: 'daily',
      difficulty: 'intermediate',
      tags: ['boda', 'planificación', 'eventos', 'celebración'],
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

  openChats(): void {
    this.openChatsPanel.emit();
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
