import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: number;
  title: string;
  content: string;
  date: Date;
  read: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([
    { id: 1, title: 'Message 1', content: 'Nouveau message reçu', date: new Date(), read: false },
    { id: 2, title: 'Rapport', content: 'Rapport mensuel disponible', date: new Date(), read: true },
    { id: 3, title: 'Message 2', content: 'Conversation avec Ayoub', date: new Date(), read: false }
  ]);

  notifications$ = this.notificationsSubject.asObservable();

  markAsRead(id: number) {
    const current = this.notificationsSubject.value.map(n => n.id === id ? { ...n, read: true } : n);
    this.notificationsSubject.next(current);
  }

  addNotification(notification: Notification) {
    this.notificationsSubject.next([...this.notificationsSubject.value, notification]);
  }
}
