// models/user.model.ts
export interface User {
  id?: string;
  username: string;
  email: string;
  password: string; // Will be hashed
  createdAt?: Date;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
}
