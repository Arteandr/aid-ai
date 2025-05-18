import { Injectable, signal } from '@angular/core';
import { Chat } from '../models/chat.model';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Message } from '../../models/message.model';

@Injectable({
  providedIn: 'root',
})
export class ChatsService {
  public chats = signal<Chat[]>([]);

  constructor(private readonly http: HttpClient) {}

  getMany() {
    return this.http
      .get<Chat[]>('/chats')
      .pipe(tap((chats) => this.chats.set(chats)));
  }

  getOne(chatId: number): Observable<Chat> {
    return this.http.get<Chat>('/chats/' + chatId);
  }

  getHistory(chatId: number) {
    return this.http.get<{ messages: Message[] }>(`/chats/${chatId}/history`);
  }
}
