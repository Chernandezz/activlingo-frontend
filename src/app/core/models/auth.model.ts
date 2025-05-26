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

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}
