import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface ChatMessage {
  id?: number;
  sender: string;
  content: string;
  room: string;
  timeSent?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private baseUrl = 'http://localhost:8080/api/chat';
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Charger l'historique
  loadHistory(room: string) {
    this.http.get<ChatMessage[]>(`${this.baseUrl}/history/${room}`)
      .subscribe(msgs => this.messagesSubject.next(msgs));
  }

  // Envoyer un message et l’ajouter à l’historique
  sendMessage(msg: ChatMessage) {
    this.http.post<ChatMessage>(this.baseUrl, msg)
      .subscribe(saved => {
        const current = this.messagesSubject.value;
        this.messagesSubject.next([...current, saved]);
      });
  }
}
