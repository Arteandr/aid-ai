import { Injectable, signal } from '@angular/core';
import { Chat } from '../models/chat.model';
import { HttpClient } from '@angular/common/http';
import { finalize, Observable, tap } from 'rxjs';
import { Message } from '../../models/message.model';
import { LoadingService } from '../../loading/services/loading.service';

@Injectable({
  providedIn: 'root',
})
export class ChatsService {
  public chats = signal<Chat[]>([]);

  constructor(
    private readonly http: HttpClient,
    private readonly loadingService: LoadingService
  ) {}

  addMessage(chatId: number, message: Message) {
    this.chats.update((chats) =>
      chats.map((chat) =>
        chat.id === chatId
          ? { ...chat, messages: [...(chat.messages || []), message] }
          : chat
      )
    );
  }

  getMany() {
    this.loadingService.start();
    return this.http.get<Chat[]>('/chats').pipe(
      tap((chats) => this.chats.set(chats)),
      finalize(() => this.loadingService.stop())
    );
  }

  getOne(chatId: number): Observable<Chat> {
    this.loadingService.start();
    return this.http
      .get<Chat>('/chats/' + chatId)
      .pipe(finalize(() => this.loadingService.stop()));
  }

  getHistory(chatId: number) {
    this.loadingService.start();
    return this.http
      .get<{ messages: Message[] }>(`/chats/${chatId}/history`)
      .pipe(finalize(() => this.loadingService.stop()));
  }
}
