export interface User {
  id: string;
  email: string;
  username: string;
  tornPlayerId: number | null;
  tornPlayerName: string | null;
  tornLinkedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LinkTornRequest {
  apiKey: string;
}

export interface LinkTornResponse {
  success: boolean;
  tornPlayerName: string;
  user: User;
}
