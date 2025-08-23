import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationsService, Notification } from '../../services/notifications.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent {
  filter: 'all' | 'unread' = 'all';

  constructor(public notificationsService: NotificationsService) {}

  markAsRead(notification: Notification) {
    this.notificationsService.markAsRead(notification.id);
  }

  setFilter(f: 'all' | 'unread') {
    this.filter = f;
  }

  filteredNotifications(notifications: Notification[]): Notification[] {
    return notifications.filter(n => this.filter === 'unread' ? !n.read : true);
  }

  total(notifications: Notification[]): number {
    return notifications.length;
  }

  unread(notifications: Notification[]): number {
    return notifications.filter(n => !n.read).length;
  }
}
