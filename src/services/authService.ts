import { api } from "../lib/api";
import { ApiResponse } from "../types/api";
import { AuthResponse, LoginPayload, RefreshTokenResponse, RegisterPayload } from "../types/auth";

export class AuthService {
  static async register(
    payload: RegisterPayload
  ): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>('/auth/register', payload);
  }
  static async login(
    payload: LoginPayload
  ): Promise<ApiResponse<AuthResponse>> {
    return api.post<AuthResponse>('/auth/login', payload);
  }

  static async getMe(): Promise<ApiResponse<AuthResponse>> {
    return api.get<AuthResponse>('/auth/me');
  }

  static async logout(): Promise<ApiResponse<null>> {
    return api.post<null>('/auth/logout');
  }
  static async refreshToken() {
    return api.post('/auth/refresh-token');
  }
}