import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  currentUser: string = ''; // ne plus mettre 'Ayoub' en dur
  newMessage = '';

  conversations = [
    { id: 1, name: 'Support EURAFRIC' },
    { id: 2, name: 'Marketing' },
    { id: 3, name: 'Développement' }
  ];
  activeConversation = this.conversations[0];
  messages: ChatMessage[] = [];

  constructor(private chatService: ChatService, private authService: AuthService) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user.username; // récupérer le vrai utilisateur
    }

    this.loadMessages();
    this.chatService.messages$.subscribe(msgs => this.messages = msgs);
  }

  selectConversation(conv: any) {
    this.activeConversation = conv;
    this.loadMessages();
  }

  loadMessages() {
    this.chatService.loadHistory(this.activeConversation.name);
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const message: ChatMessage = {
      sender: this.currentUser, // maintenant le vrai utilisateur
      content: this.newMessage,
      room: this.activeConversation.name
    };
    this.chatService.sendMessage(message);
    this.newMessage = '';
  }

  addEmoji(emoji: string) {
    this.newMessage += emoji;
  }

  addAttachment() {
    alert('Fonction pièces jointes à intégrer');
  }
}
