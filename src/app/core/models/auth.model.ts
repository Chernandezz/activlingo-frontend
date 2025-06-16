// core/models/auth.model.ts - MODELOS ACTUALIZADOS

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  name?: string;
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  email_confirmed?: boolean;
  created_at?: string;
  provider?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: AuthUser;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
  session?: AuthSession;
  profile?: any;
}

export interface AuthError {
  error: string;
  success: false;
}
