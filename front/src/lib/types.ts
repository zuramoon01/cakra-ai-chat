export interface User {
  id: string;
  username: string;
}

export interface Room {
  id: number;
  name: string;
  isGroup: boolean;
  members: User[];
}
