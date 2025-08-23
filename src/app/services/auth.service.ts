import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../app.config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(credentials: { username: string, password: string }): Observable<any> {
    return new Observable(observer => {
      this.http.post(`${AppConfig.apiBaseUrl}/auth/login`, credentials).subscribe({
        next: (res) => {
          localStorage.setItem('currentUser', JSON.stringify(res)); // stocke le user connecté
          observer.next(res);
          observer.complete();
        },
        error: (err) => observer.error(err)
      });
    });
  }

  getCurrentUser() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem('currentUser');
  }
}
