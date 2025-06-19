import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-conversation-creator-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './conversation-creator-modal.component.html',
  styleUrls: ['./conversation-creator-modal.component.css'],
})
export class ConversationCreatorModalComponent {
  // Form data
  role = '';
  context = '';

  // Input para recibir el estado de loading
  @Input() isCreatingChat = false;

  // Sugerencias rápidas
  roleSuggestions = ['Un taxista', 'Un chef', 'Un astronauta', 'Mi madre'];
  contextSuggestions = [
    'Me acabo de subir a un taxi en Nueva York y el conductor no habla inglés muy bien',
    'Estoy en un restaurante elegante y el mesero me está recomendando platos especiales',
    'Estoy perdido en el espacio y tengo que trabajar con mi compañero para volver a la Tierra',
  ];

  // Outputs
  @Output() start = new EventEmitter<{ role: string; context: string }>();
  @Output() cancel = new EventEmitter<void>();

  // Roles expandidos para generación aleatoria
  private allRoles = [
    'Un taxista experimentado',
    'Un jugador de fútbol profesional',
    'Un cajero de supermercado amigable',
    'Un astronauta veterano',
    'Un chef de restaurante gourmet',
    'Un profesor de universidad',
    'Un médico de emergencias',
    'Un ingeniero de software senior',
    'Un artista bohemio',
    'Un escritor bestseller',
    'Un músico de jazz',
    'Un científico loco',
    'Un fotógrafo de naturaleza',
    'Un viajero aventurero',
    'Mi madre preocupada',
    'Mi padre orgulloso',
    'Cristiano Ronaldo',
    'Lionel Messi',
    'El presidente de los Estados Unidos',
    'Un influencer de TikTok',
    'Gordon Ramsay',
    'Un detective privado',
    'Un piloto de avión',
    'Un guía turístico local',
    'Un barista de café especializado',
  ];

  // Contextos expandidos para generación aleatoria - TODOS EN PRIMERA PERSONA
  private allContexts = [
    'Me acabo de subir a un taxi en Nueva York y el tráfico está terrible',
    'Estoy viendo el partido final de la Copa del Mundo en un bar lleno',
    'Estoy en el supermercado y se me olvidó la tarjeta de crédito',
    'Estoy perdido en el espacio y mi nave tiene una falla técnica',
    'Estoy en un restaurante elegante para una cita importante',
    'Es mi primer día de clases y no sé dónde está mi aula',
    'Llego al hospital con una emergencia médica',
    'Tengo una entrevista de trabajo muy importante',
    'Estoy en una galería de arte y no entiendo el arte moderno',
    'Necesito ayuda para escribir mi primera novela',
    'Estoy en un concierto de jazz y quiero aprender sobre la música',
    'Mi experimento científico salió mal y necesito ayuda',
    'Estoy en un safari fotográfico y veo animales increíbles',
    'Acabo de llegar a un país nuevo y necesito direcciones',
    'Mi madre está preocupada porque no la he llamado en semanas',
    'Mi padre quiere darme consejos sobre la vida',
    'Me encuentro con Cristiano Ronaldo en el gimnasio',
    'Messi me está enseñando a jugar fútbol',
    'Tengo una reunión privada con el presidente',
    'Un influencer me quiere entrevistar para su canal',
    'Gordon Ramsay está revisando mi cocina',
    'Contrato a un detective para resolver un misterio',
    'Mi vuelo está retrasado y el piloto me explica por qué',
    'Necesito un guía turístico para explorar una ciudad antigua',
    'Estoy aprendiendo sobre café en una cafetería especializada',
  ];

  generateRandomRole() {
    const randomIndex = Math.floor(Math.random() * this.allRoles.length);
    this.role = this.allRoles[randomIndex];
  }

  generateRandomContext() {
    const randomIndex = Math.floor(Math.random() * this.allContexts.length);
    this.context = this.allContexts[randomIndex];
  }

  canSubmit(): boolean {
    return (
      this.role.trim().length > 0 &&
      this.context.trim().length > 0 &&
      !this.isCreatingChat
    );
  }

  submit() {
    if (this.canSubmit()) {
      this.start.emit({
        role: this.role.trim(),
        context: this.context.trim(),
      });
    }
  }

  close() {
    if (!this.isCreatingChat) {
      this.cancel.emit();
    }
  }
}
