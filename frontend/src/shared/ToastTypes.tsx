export type ToastType = "error" | "success" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}