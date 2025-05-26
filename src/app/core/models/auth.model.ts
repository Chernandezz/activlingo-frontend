export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: any; // puedes definir una interfaz de usuario si quieres
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}
