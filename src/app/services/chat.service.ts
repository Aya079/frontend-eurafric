import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AppConfig} from '../app.config';
import {Observable} from 'rxjs';
import {ChatMessage} from './chat-socket.service';

@Injectable({providedIn: 'root'})
export class ChatService {
  private baseUrl = `${AppConfig.apiBaseUrl}/chat`;

  constructor(private http: HttpClient) {
  }

  // Récupérer l’historique par “room”
  getHistory(room: string): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(`${this.baseUrl}/history/${encodeURIComponent(room)}`);
  }

  // (optionnel) Envoyer via REST au lieu du WebSocket
  postMessage(msg: ChatMessage): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(this.baseUrl, msg);
  }
}
