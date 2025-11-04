import { apiClient } from './client';
import { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse, LogoutRequest, ApiResponse } from './types';

export class AuthApi {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    if (response.success && response.data) {
      apiClient.setAccessToken(response.data.accessToken);
      // Also store in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      return response.data;
    }
    throw new Error(response.error || 'Login failed');
  }

  async refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', data);
    if (response.success && response.data) {
      apiClient.setAccessToken(response.data.accessToken);
      return response.data;
    }
    throw new Error(response.error || 'Token refresh failed');
  }

  async logout(data: LogoutRequest): Promise<void> {
    await apiClient.post<ApiResponse>('/auth/logout', data);
    apiClient.setAccessToken(null);
  }

  async getMe(): Promise<any> {
    const response = await apiClient.get<ApiResponse>('/auth/me');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.error || 'Failed to get user info');
  }
}

export const authApi = new AuthApi();

