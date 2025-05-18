import { User, UserRole } from '../auth/models/user.model';

export interface Message {
  id: number;
  text: string;
  sendedBy: number;
  senderRole: UserRole;
  sender: User;

  createdAt: Date;
}
