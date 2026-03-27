import { create } from "zustand";

export type AuthModalTab = "login" | "register";

interface AuthState {
  token: string | null;
  isModalOpen: boolean;
  modalTab: AuthModalTab;
  pendingAction: (() => void) | null;

  // Actions
  setToken: (token: string) => void;
  logout: () => void;
  openModal: (tab?: AuthModalTab, pendingAction?: () => void) => void;
  closeModal: () => void;
  switchTab: (tab: AuthModalTab) => void;
  runPendingAction: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("token"),
  isModalOpen: false,
  modalTab: "login",
  pendingAction: null,

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ token: null });
  },

  openModal: (tab = "login", pendingAction) => {
    set({ isModalOpen: true, modalTab: tab, pendingAction: pendingAction ?? null });
  },

  closeModal: () => {
    set({ isModalOpen: false, pendingAction: null });
  },

  switchTab: (tab) => {
    set({ modalTab: tab });
  },

  runPendingAction: () => {
    const { pendingAction } = get();
    if (pendingAction) {
      pendingAction();
      set({ pendingAction: null });
    }
  },
}));

/** Helper: require auth before running an action */
export function requireAuth(action: () => void) {
  const { token, openModal, runPendingAction } = useAuthStore.getState();
  if (token) {
    action();
  } else {
    openModal("login", () => {
      action();
      void runPendingAction;
    });
  }
}