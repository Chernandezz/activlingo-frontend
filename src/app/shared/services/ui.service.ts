import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiService {
  private _sidebarOpen = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this._sidebarOpen.asObservable();

  private hideAIResponsesSubject = new BehaviorSubject<boolean>(false);
  hideAIResponses$ = this.hideAIResponsesSubject.asObservable();

  get hideAIResponses(): boolean {
    return this.hideAIResponsesSubject.value;
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
