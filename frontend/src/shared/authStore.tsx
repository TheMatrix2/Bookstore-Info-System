import { create } from "zustand";
import { parseRole, parseID } from "./auth";
 
interface AuthState {
  token: string | null;
  role: string | null;
  id: string | null;
  setToken: (token: string) => void;
  logout: () => void;
}
 
const getParsedAuth = (token: string | null) => {
  if (!token) return { role: null, id: null };
  return { role: parseRole(token), id: parseID(token) };
};
 
export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem("token");
  const parsed = getParsedAuth(token);
  return {
    token,
    role: parsed.role,
    id: parsed.id,
    setToken: (token) => {
      localStorage.setItem("token", token);
      const parsed = getParsedAuth(token);
      set({ token, role: parsed.role, id: parsed.id });
    },
    logout: () => {
      localStorage.removeItem("token");
      set({ token: null, role: null, id: null });
    },
  };
});