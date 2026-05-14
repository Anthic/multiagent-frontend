import { api } from "../lib/api";
import { AuthResponse, LoginPayload, RefreshTokenResponse, RegisterPayload } from "../types/auth";

export class AuthService {
    static async register(data : RegisterPayload) : Promise<AuthResponse>{
        const res = await api.post<AuthResponse>('/auth/register', data)
        return res.data
    }
    static async login (data: LoginPayload): Promise<AuthResponse>{
        const res = await api.post<AuthResponse>('/auth/login', data)
        return res.data
    }
    static async refreshToken(): Promise<RefreshTokenResponse>{
        const res = await api.post<RefreshTokenResponse>('/auth/refresh-token')
        return res.data
    }

    static async getMe(): Promise<AuthResponse> {
        const res = await api.get<AuthResponse>('/auth/me')
        return res.data
    }
    static async logout (): Promise<void> {
        await api.post('/auth/logout')
    }
}