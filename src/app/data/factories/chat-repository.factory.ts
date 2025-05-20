import { Injectable } from '@angular/core';
import { IChatRepository } from '../../core/interfaces/chat-repository.interface';
import { LocalChatRepository } from '../repositories/local-chat.repository';
import { ApiChatRepository } from '../repositories/api-chat.repository';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ChatRepositoryFactory {
  private repository: IChatRepository;

  constructor(
    private localRepository: LocalChatRepository,
    private apiService: ApiService
  ) {
    // Usar el repositorio local o API según la configuración
    if (environment.useLocalStorage) {
      this.repository = localRepository;
      console.log('Using LocalStorage repository');
    } else {
      this.repository = new ApiChatRepository(apiService);
      console.log('Using API repository');
    }
  }

  getRepository(): IChatRepository {
    return this.repository;
  }

  // Método para cambiar el repositorio en tiempo de ejecución
  setUseLocalStorage(useLocal: boolean): void {
    if (useLocal) {
      this.repository = this.localRepository;
      console.log('Switched to LocalStorage repository');
    } else {
      this.repository = new ApiChatRepository(this.apiService);
      console.log('Switched to API repository');
    }
  }
}
