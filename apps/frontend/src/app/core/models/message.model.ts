import { User } from '../auth/models/user.model';
import { Chat } from '../chats/models/chat.model';

export interface Message {
  id: number;
  text: string;
  sender: User;
  chat: Chat;

  createdAt: Date;
  updatedAt: Date;
}
