export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: UserRole;
  profileImage?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
  username?: string;
  isActive?: boolean;
}

export enum UserRole {
  USER = 'USER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN'
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    success?: boolean;
    message?: string;
    user: User;
    cookie?: any;
    accessToken?: string;
  };
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  listings?: any;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role?: UserRole;
} 