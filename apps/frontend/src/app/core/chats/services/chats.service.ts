import { Injectable, signal } from '@angular/core';
import { Chat } from '../models/chat.model';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

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
}
