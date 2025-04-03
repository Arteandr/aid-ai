export enum UserRole {
  USER = 'user',
  SUPPORT_AGENT = 'support_agent',
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
}
