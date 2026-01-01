import { apiClient } from "./client";
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  ApiResponse,
} from "./types";

export class AuthApi {
  /* ---------------- LOGIN ---------------- */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      data
    );

    if (response.success && response.data) {
      apiClient.setAccessToken(response.data.accessToken);

      // 🔥 Persist tokens (session restore)
      if (typeof window !== "undefined") {
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      return response.data; // contains user + permissions
    }

    throw new Error(response.error || "Login failed");
  }

  /* ---------------- REFRESH TOKEN ---------------- */
  async refreshToken(
    data: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
      "/auth/refresh",
      data
    );

    if (response.success && response.data) {
      apiClient.setAccessToken(response.data.accessToken);
      return response.data;
    }

    throw new Error(response.error || "Token refresh failed");
  }

  /* ---------------- LOGOUT ---------------- */
  async logout(data: LogoutRequest): Promise<void> {
    await apiClient.post<ApiResponse>("/auth/logout", data);

    // 🔥 Clear tokens
    apiClient.setAccessToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  /* ---------------- ME ---------------- */
  async getMe(): Promise<{
    user: any;
    permissions: string[];
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        user: any;
        permissions: string[];
      }>
    >("/auth/me");

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.error || "Failed to get user info");
  }
}

export const authApi = new AuthApi();
