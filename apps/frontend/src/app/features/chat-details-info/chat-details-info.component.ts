import { Component, Input, OnInit } from '@angular/core';
import { ChatsService } from '../../core/chats/services/chats.service';
import { Chat } from '../../core/chats/models/chat.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat-details-info',
  standalone: true,
  templateUrl: './chat-details-info.component.html',
  styleUrl: './chat-details-info.component.scss',
  imports: [DatePipe],
})
export class ChatDetailsInfoComponent implements OnInit {
  @Input({ required: true }) chatId!: number;

  currentChat?: Chat;

  constructor(private chatService: ChatsService) {}

  ngOnInit(): void {
    this.chatService.getOne(this.chatId).subscribe({
      next: (chat) => {
        this.currentChat = chat;
      },
    });
  }
}
