import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiService {
  private _sidebarOpen = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this._sidebarOpen.asObservable();
  // ui.service.ts
  private conversationStatusSubject = new BehaviorSubject<
    'idle' | 'thinking' | 'responding' | 'user-turn'
  >('idle');
  conversationStatus$ = this.conversationStatusSubject.asObservable();

  setConversationStatus(
    status: 'idle' | 'thinking' | 'responding' | 'user-turn'
  ) {
    this.conversationStatusSubject.next(status);
  }

  private hideAIResponsesSubject = new BehaviorSubject<boolean>(false);
  hideAIResponses$ = this.hideAIResponsesSubject.asObservable();

  private conversationModeSubject = new BehaviorSubject<boolean>(false);
  conversationMode$ = this.conversationModeSubject.asObservable();

  setConversationMode(active: boolean): void {
    this.conversationModeSubject.next(active);
  }

  get hideAIResponses(): boolean {
    return this.hideAIResponsesSubject.value;
  }
  private overlayMessageSubject = new BehaviorSubject<string>(
    'Tu turno. Estamos escuchando...'
  );
  overlayMessage$ = this.overlayMessageSubject.asObservable();

  setOverlayMessage(msg: string): void {
    this.overlayMessageSubject.next(msg);
  }

  toggleHideAIResponses(): void {
    this.hideAIResponsesSubject.next(!this.hideAIResponsesSubject.value);
  }

  toggleSidebar(): void {
    this._sidebarOpen.next(!this._sidebarOpen.value);
  }

  closeSidebar(): void {
    this._sidebarOpen.next(false);
  }
  private _conversationOverlay = new BehaviorSubject<boolean>(false);
  conversationOverlay$ = this._conversationOverlay.asObservable();

  showOverlay() {
    this._conversationOverlay.next(true);
  }

  hideOverlay() {
    this._conversationOverlay.next(false);
  }
}
