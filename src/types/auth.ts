export interface LoginActionState {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
}
