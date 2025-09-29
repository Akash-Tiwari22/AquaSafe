const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface AuthUserProfile {
  id: string;
  name: string;
  email: string;
  organization?: string;
  role: string;
  isEmailVerified: boolean;
  lastLogin?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  organization?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: { user: AuthUserProfile };
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    user: AuthUserProfile;
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
}

async function parseMaybeJson(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return { message: text };
}

export const authService = {
  async register(payload: RegisterRequest): Promise<RegisterResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await parseMaybeJson(res);
      throw new Error((err as any)?.message || `Register failed: ${res.status}`);
    }
    return parseMaybeJson(res);
  },

  async login(payload: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await parseMaybeJson(res);
      throw new Error((err as any)?.message || `Login failed: ${res.status}`);
    }
    return parseMaybeJson(res);
  }
};

export default authService;


