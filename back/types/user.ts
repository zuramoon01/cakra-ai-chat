export interface User {
  id: string;
  username: string;
}

export interface Message {
  id: number;
  senderId: string;
  message: string;
  createdAt: Date;
}
