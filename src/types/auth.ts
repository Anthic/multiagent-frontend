
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  
}

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  user: AuthUser;

}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}