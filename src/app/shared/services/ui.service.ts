import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UiService {
  private _sidebarOpen = new BehaviorSubject<boolean>(false);
  sidebarOpen$ = this._sidebarOpen.asObservable();

  toggleSidebar(): void {
    this._sidebarOpen.next(!this._sidebarOpen.value);
  }

  closeSidebar(): void {
    this._sidebarOpen.next(false);
  }
}
