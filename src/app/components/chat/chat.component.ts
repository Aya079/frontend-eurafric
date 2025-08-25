import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatSocketService, ChatMessage } from '../../services/chat-socket.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  currentUser = '';
  newMessage = '';
  messages: ChatMessage[] = [];

  conversations = [
    { id: 1, name: 'Support EURAFRIC' },
    { id: 2, name: 'Marketing' },
    { id: 3, name: 'Développement' }
  ];
  activeConversation = this.conversations[0];

  private subs: Subscription[] = [];

  constructor(
    private socketChat: ChatSocketService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser()?.username ?? 'anonymous';
    this.connectToRoom(this.activeConversation.name);
  }

  ngOnDestroy(): void {
    this.disconnectRoom();
  }

  private connectToRoom(roomName: string): void {
    // Déconnecte l'ancien WebSocket si existant
    this.disconnectRoom();

    // Connexion à la nouvelle room
    this.socketChat.connect(roomName);

    // Souscription aux messages reçus
    this.subs.push(
      this.socketChat.messages$.subscribe(msgs => {
        // filtre les messages de la room active
        this.messages = msgs.filter(m => m.room === this.activeConversation.name);
        setTimeout(() => this.scrollToBottom(), 0);
      })
    );
  }

  private disconnectRoom(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.subs = [];
    this.socketChat.clearMessages();
    this.socketChat.disconnect?.(); // méthode à ajouter dans le service
  }

  selectConversation(conv: { id: number; name: string }): void {
    this.activeConversation = conv;
    this.connectToRoom(conv.name);
  }

  sendMessage(): void {
    const trimmed = this.newMessage.trim();
    if (!trimmed) return;

    const msg: ChatMessage = {
      sender: this.currentUser,
      content: trimmed,
      room: this.activeConversation.name
    };

    // Envoi via WebSocket
    this.socketChat.send(msg);

    // Ne pas ajouter localement : le WebSocket va émettre et remplir messages$
    this.newMessage = '';
  }

  addEmoji(emoji: string): void {
    this.newMessage += emoji;
  }

  addAttachment(): void {
    alert('Fonction pièce jointe à implémenter');
  }

  private scrollToBottom(): void {
    const container = document.querySelector('.messages');
    if (container) container.scrollTop = container.scrollHeight;
  }
}
