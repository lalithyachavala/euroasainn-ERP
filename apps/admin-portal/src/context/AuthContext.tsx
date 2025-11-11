import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  portalType: string;
  role: string;
  organizationId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use env var if set, otherwise use empty string in dev (Vite proxy) or localhost:3000 in production
// In dev mode, empty string means use Vite proxy which forwards /api/* to http://localhost:3000
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:3000');

// Debug: Log API URL in development
if (import.meta.env.DEV) {
  console.log('API_URL:', API_URL || '(empty - using Vite proxy)');
  console.log('import.meta.env.DEV:', import.meta.env.DEV);
  console.log('import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth on mount
    checkAuth();
  }, []);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) {
        return false;
      }

      // In dev mode with Vite proxy, use relative path (starts with /)
      // In production or when VITE_API_URL is set, use full URL
      let url: string;
      if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
        url = '/api/v1/auth/refresh';
      } else {
        url = API_URL ? `${API_URL}/api/v1/auth/refresh` : 'http://localhost:3000/api/v1/auth/refresh';
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          localStorage.setItem('accessToken', data.data.accessToken);
          if (data.data.refreshToken) {
            localStorage.setItem('refreshToken', data.data.refreshToken);
          }
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // In dev mode with Vite proxy, use relative path (starts with /)
      // In production or when VITE_API_URL is set, use full URL
      let url: string;
      if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
        url = '/api/v1/auth/me';
      } else {
        url = API_URL ? `${API_URL}/api/v1/auth/me` : 'http://localhost:3000/api/v1/auth/me';
      }
      
      let response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // If token expired (401), try to refresh it
      if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
          const newToken = localStorage.getItem('accessToken');
          if (newToken) {
            response = await fetch(url, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setLoading(false);
            return;
          }
        } else {
          // Refresh failed, clear tokens
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setLoading(false);
          return;
        }
      }

      if (response.ok) {
        const data = await response.json();
        // Handle both response formats: { success: true, data: {...} } or { data: {...} }
        if (data.success && data.data) {
          setUser(data.data);
        } else if (data.data) {
          // If no success field, assume data is the user object
          setUser(data.data);
        } else if (data.user) {
          // Alternative format where user is directly in response
          setUser(data.user);
        } else {
          console.warn('Unexpected auth response format:', data);
          // Don't clear tokens on unexpected format, might be a temporary API issue
        }
      } else {
        // Only clear tokens if it's a definitive auth error (not 500, etc.)
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      // Don't clear tokens on network errors - might be temporary
      // Only clear if it's a specific auth error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error - keep tokens, user might be offline
        console.warn('Network error during auth check, keeping tokens');
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // In dev mode with Vite proxy, use relative path (starts with /)
      // In production or when VITE_API_URL is set, use full URL
      let url: string;
      if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
        // Dev mode: use relative path for Vite proxy
        url = '/api/v1/auth/login';
      } else {
        // Production or explicit API URL: use full URL
        url = API_URL ? `${API_URL}/api/v1/auth/login` : 'http://localhost:3000/api/v1/auth/login';
      }
      console.log('Login URL:', url);
      console.log('API_URL:', API_URL);
      console.log('import.meta.env.DEV:', import.meta.env.DEV);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          portalType: 'admin',
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || errorMessage;
        } catch (parseError) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || `HTTP ${response.status}: Login failed`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.success || !data.data) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      setUser(data.data.user);
    } catch (error: any) {
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please check if the API is running.');
      }
      // Re-throw other errors as-is
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (token && refreshToken) {
        // In dev mode with Vite proxy, use relative path (starts with /)
        // In production or when VITE_API_URL is set, use full URL
        let url: string;
        if (import.meta.env.DEV && !import.meta.env.VITE_API_URL) {
          url = '/api/v1/auth/logout';
        } else {
          url = API_URL ? `${API_URL}/api/v1/auth/logout` : 'http://localhost:3000/api/v1/auth/logout';
        }
        try {
          await fetch(url, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });
        } catch (fetchError) {
          // Continue with logout even if API call fails
          console.error('Logout API error:', fetchError);
        }
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state and storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}



