import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  role: string; // ex: ROLE_USER
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'currentUser';

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }): Observable<UserDTO> {
    const url = `${AppConfig.apiBaseUrl}/auth/login`;
    console.log('POST login URL:', url, credentials);

    return this.http.post<UserDTO>(url, credentials).pipe(
      tap(user => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
      }),
      catchError(err => {
        console.error('Erreur AuthService login:', err);
        return throwError(() => err);
      })
    );
  }

  getCurrentUser(): UserDTO | null {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UserDTO) : null;
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
