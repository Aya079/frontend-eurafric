import { Injectable, OnDestroy } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { AppConfig } from '../app.config';
import { AuthService } from './auth.service';

export interface ChatMessage {
  id?: number;
  sender: string;
  content: string;
  room: string;
  timeSent?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatSocketService implements OnDestroy {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;

  private messagesSubject = new BehaviorSubject<ChatMessage[]>(this.loadMessages());
  messages$ = this.messagesSubject.asObservable();

  private connectedSubject = new Subject<boolean>();
  connected$ = this.connectedSubject.asObservable();

  constructor(private auth: AuthService) {}

  /** 🔹 Sauvegarde messages dans localStorage */
  private saveMessages(messages: ChatMessage[]): void {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }

  /** 🔹 Charge messages depuis localStorage */
  private loadMessages(): ChatMessage[] {
    const data = localStorage.getItem('chatHistory');
    return data ? JSON.parse(data) : [];
  }

  /** 🔹 Déconnecte proprement l’ancien client */
  disconnect(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
    if (this.client?.active) {
      this.client.deactivate();
      this.client = null;
    }
    this.connectedSubject.next(false);
  }

  /** 🔹 Connexion WebSocket */
  connect(roomToSubscribe: string): void {
    this.disconnect(); // ← évite les messages dupliqués

    const username = this.auth.getCurrentUser()?.username ?? 'anonymous';
    const wsUrl = `${AppConfig.wsBaseUrl}?username=${encodeURIComponent(username)}`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 3000,
      debug: () => {}
    });

    this.client.onConnect = () => {
      this.connectedSubject.next(true);

      const destination = `/topic/messages`;
      this.subscription = this.client?.subscribe(destination, (message: IMessage) => {
        try {
          const body = JSON.parse(message.body) as ChatMessage;
          const current = this.messagesSubject.value;
          const updated = [...current, body];
          this.messagesSubject.next(updated);
          this.saveMessages(updated); // sauvegarde l’historique
        } catch (err) {
          console.error('Erreur JSON:', err);
        }
      }) ?? null;
    };

    this.client.onStompError = () => this.connectedSubject.next(false);
    this.client.onWebSocketClose = () => this.connectedSubject.next(false);

    this.client.activate();
  }

  /** 🔹 Envoi d’un message */
  send(message: ChatMessage): void {
    if (!this.client || !this.client.active) {
      console.warn('WebSocket pas actif, message non envoyé');
      return;
    }

    this.client.publish({
      destination: '/app/sendMessage',
      body: JSON.stringify(message)
    });

    // ajout immédiat local pour affichage rapide
    const current = this.messagesSubject.value;
    const updated = [...current, { ...message, timeSent: new Date().toISOString() }];
    this.messagesSubject.next(updated);
    this.saveMessages(updated);
  }

  /** 🔹 Vide l’historique */
  clearMessages(): void {
    this.messagesSubject.next([]);
    localStorage.removeItem('chatHistory');
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
