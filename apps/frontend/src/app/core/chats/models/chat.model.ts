import { User } from '../../auth/models/user.model';
import { Message } from '../../models/message.model';

export enum ChatStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

export interface Chat {
  id: number;
  name: string;
  creator: User;
  messages: Message[];
  status: ChatStatus;

  createdAt: Date;
  updatedAt: Date;
}
