// src/app/core/services/user.service.ts

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface TrialStatus {
  trial_end: string;
  trial_active: boolean;
  is_subscribed: boolean;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  getTrialInfo(): Observable<TrialStatus> {
    return this.http.get<TrialStatus>(`${this.apiUrl}/trial-status`);
  }
}
