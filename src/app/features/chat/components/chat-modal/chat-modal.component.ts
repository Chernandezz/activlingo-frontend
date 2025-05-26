import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-modal.component.html',
  styleUrls: ['./chat-modal.component.css'],
})
export class ChatModalComponent {
  role = '';
  context = '';

  @Output() start = new EventEmitter<{ role: string; context: string }>();
  @Output() cancel = new EventEmitter<void>();

  generateRandomRole() {
    const roles = [
      'Un taxista',
      'Un jugador de fútbol',
      'Un cajero de supermercado',
      'Un astronauta',
      'Un chef',
      'Un profesor',
      'Un médico',
      'Un ingeniero de software',
      'Un artista',
      'Un escritor',
      'Un músico',
      'Un científico',
      'Un fotógrafo',
      'Un viajero',
      'Mi madre',
      'Mi padre',
      'Cristiano Ronaldo',
      'Lionel Messi',
      'El presidente de los Estados Unidos',
      'Un influencer de redes sociales',
      'Un chef famoso',
    ];
    this.role = roles[Math.floor(Math.random() * roles.length)];
  }

  generateRandomContext() {
    const contexts = [
      'Me acabe de subir a un taxi en nueva york',
      'Vamos a ver un partido de fútbol',
      'Me tienes malas noticias',
      'Me debes dar la noticia de que he ganado la lotería',
      'Me debes dar la noticia que me despidieron del trabajo',
      'Estamos en un restaurante y no hay comida',
      'Estamos perdidos en el espacio',
      'Salimos a pasear al perro',
      
    ];
    this.context = contexts[Math.floor(Math.random() * contexts.length)];
  }

  submit() {
    if (this.role.trim() && this.context.trim()) {
      this.start.emit({ role: this.role.trim(), context: this.context.trim() });
    }
  }

  close() {
    this.cancel.emit();
  }
}
