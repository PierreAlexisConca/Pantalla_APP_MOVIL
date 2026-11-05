import { createContext, useContext } from 'react';

// ── Contexto de autenticación (separado para evitar ciclos de importación) ─
export type AuthContextType = {
  isLoggedIn: boolean;
  usuario: string;
  login: (user: string) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  usuario: '',
  login: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
