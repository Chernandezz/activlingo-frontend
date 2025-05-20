import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Chat } from '../../core/models/chat.model';
import { Message } from '../../core/models/message.model';
import { IChatRepository } from '../../core/interfaces/chat-repository.interface';

@Injectable()
export class LocalChatRepository implements IChatRepository {
  private CHATS_KEY = 'chat_app_chats';
  private MESSAGES_KEY = 'chat_app_messages';

  constructor() {
    // Inicializar localStorage si no existe
    if (!localStorage.getItem(this.CHATS_KEY)) {
      localStorage.setItem(this.CHATS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(this.MESSAGES_KEY)) {
      localStorage.setItem(this.MESSAGES_KEY, JSON.stringify([]));
    }
  }

  getChats(): Observable<Chat[]> {
    const chats = JSON.parse(localStorage.getItem(this.CHATS_KEY) || '[]');
    return of(chats).pipe(delay(300)); // Simular delay de red
  }

  getChatById(id: string): Observable<Chat> {
    const chats = JSON.parse(localStorage.getItem(this.CHATS_KEY) || '[]');
    const chat = chats.find((c: Chat) => c.id === id);
    return of(chat).pipe(delay(300));
  }

  createChat(chatData: Partial<Chat>): Observable<Chat> {
    const chats = JSON.parse(localStorage.getItem(this.CHATS_KEY) || '[]');

    const newChat: Chat = {
      id: Date.now().toString(),
      title: chatData.title || 'Nuevo chat',
      scenario: chatData.scenario || 'Conversación casual',
      language: chatData.language || 'en',
      level: chatData.level || 'beginner',
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalMessages: 0,
        improvementPoints: 0,
        grammarPoints: 0,
        vocabularyPoints: 0,
        phrasalVerbPoints: 0,
        idiomPoints: 0,
      },
    };

    chats.push(newChat);
    localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats));

    return of(newChat).pipe(delay(300));
  }

  deleteChat(id: string): Observable<void> {
    // Eliminar chat
    const chats = JSON.parse(localStorage.getItem(this.CHATS_KEY) || '[]');
    const filteredChats = chats.filter((chat: Chat) => chat.id !== id);
    localStorage.setItem(this.CHATS_KEY, JSON.stringify(filteredChats));

    // Eliminar mensajes asociados
    const messages = JSON.parse(
      localStorage.getItem(this.MESSAGES_KEY) || '[]'
    );
    const filteredMessages = messages.filter(
      (message: Message) => message.chatId !== id
    );
    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(filteredMessages));

    return of(undefined).pipe(delay(300));
  }

  getMessages(chatId: string): Observable<Message[]> {
    const messages = JSON.parse(
      localStorage.getItem(this.MESSAGES_KEY) || '[]'
    );
    const chatMessages = messages.filter(
      (message: Message) => message.chatId === chatId
    );
    return of(chatMessages).pipe(delay(300));
  }

  sendMessage(
    chatId: string,
    content: string,
    isVoice: boolean = false
  ): Observable<Message> {
    const messages = JSON.parse(
      localStorage.getItem(this.MESSAGES_KEY) || '[]'
    );

    // Actualizar la fecha del chat
    const chats = JSON.parse(localStorage.getItem(this.CHATS_KEY) || '[]');
    const chatIndex = chats.findIndex((chat: Chat) => chat.id === chatId);
    if (chatIndex !== -1) {
      chats[chatIndex].updatedAt = new Date();
      localStorage.setItem(this.CHATS_KEY, JSON.stringify(chats));
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      chatId,
      content,
      timestamp: new Date(),
      isUser: true,
      isVoice,
    };

    messages.push(newMessage);
    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));

    // Simular respuesta del bot
    setTimeout(() => {
      this.simulateBotResponse(chatId, content);
    }, 1000);

    return of(newMessage).pipe(delay(300));
  }

  // Método para simular respuesta del bot (solo para la versión local)
  private simulateBotResponse(chatId: string, userMessage: string): void {
    const messages = JSON.parse(
      localStorage.getItem(this.MESSAGES_KEY) || '[]'
    );

    const botResponses = [
      'Entiendo lo que dices, ¿puedes contarme más?',
      'Eso es interesante. ¿Cómo te sientes al respecto?',
      'Gracias por compartir esa información.',
      'Estoy procesando tu mensaje...',
      '¿Hay algo más en lo que pueda ayudarte?',
      `Recibí tu mensaje: "${userMessage.substring(0, 20)}${
        userMessage.length > 20 ? '...' : ''
      }". Estoy aquí para ayudarte.`,
      'Lo siento, no puedo procesar esa solicitud en este momento.',
      '¡Excelente! Sigamos adelante con eso.',
      'Estoy aprendiendo mucho de nuestra conversación.',
      'Esa es una buena pregunta. Déjame pensar...',
    ];

    const randomResponse =
      botResponses[Math.floor(Math.random() * botResponses.length)];

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      chatId,
      content: randomResponse,
      timestamp: new Date(),
      isUser: false,
    };

    messages.push(botMessage);
    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));

    // Disparar un evento para notificar que hay un nuevo mensaje
    const event = new CustomEvent('botMessageAdded', { detail: botMessage });
    window.dispatchEvent(event);
  }
}
