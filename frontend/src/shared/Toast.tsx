import { useState, useEffect } from "react";
import type { ToastItem, ToastType } from "./ToastTypes";

// ─── Config ────────────────────────────────────────────────────────────────────
const TOAST_ICONS: Record<ToastType, string> = {
  error:   "✕",
  success: "✓",
  info:    "i",
  warning: "!",
};

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; text: string; icon: string }> = {
  error:   { bg: "#2D1A1A", border: "#7A2E2E", text: "#F5C6C6", icon: "#E57373" },
  success: { bg: "#1A2D1A", border: "#2E7A2E", text: "#C6F5C6", icon: "#66BB6A" },
  info:    { bg: "#1A1E2D", border: "#2E407A", text: "#C6D0F5", icon: "#5C85E8" },
  warning: { bg: "#2D261A", border: "#7A5E2E", text: "#F5E6C6", icon: "#E5B84A" },
};

// ─── SingleToast ───────────────────────────────────────────────────────────────
interface SingleToastProps {
  item: ToastItem;
  onClose: (id: string) => void;
}

function SingleToast({ item, onClose }: SingleToastProps) {
  const [visible, setVisible] = useState(false);
  const colors = TOAST_COLORS[item.type];

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), 10);
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose(item.id), 300);
    }, 4000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [item.id, onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose(item.id), 300);
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      padding: "14px 18px",
      background: colors.bg,
      border: `1px solid ${colors.border}`,
      borderRadius: "4px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
      maxWidth: "380px",
      width: "100%",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateX(0)" : "translateX(24px)",
      transition: "opacity 0.3s ease, transform 0.3s ease",
      pointerEvents: "all",
    }}>
      <div style={{
        width: "22px", height: "22px", borderRadius: "50%",
        background: `${colors.icon}22`,
        border: `1px solid ${colors.icon}66`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
        fontFamily: "system-ui", fontSize: "11px", fontWeight: 700,
        color: colors.icon,
        marginTop: "1px",
      }}>
        {TOAST_ICONS[item.type]}
      </div>

      <p style={{
        flex: 1,
        fontFamily: "'Crimson Pro', Georgia, serif",
        fontSize: "15px",
        color: colors.text,
        lineHeight: 1.5,
        margin: 0,
      }}>
        {item.message}
      </p>

      <button
        onClick={handleClose}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: colors.text, fontSize: "18px", lineHeight: 1,
          padding: "2px 0", opacity: 0.5, transition: "opacity 0.15s",
          flexShrink: 0, marginTop: "1px",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.5")}
      >
        ×
      </button>
    </div>
  );
}

// ─── ToastContainer ────────────────────────────────────────────────────────────
interface ToastContainerProps {
  toasts: ToastItem[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600&display=swap');
      `}</style>
      <div style={{
        position: "fixed",
        top: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        pointerEvents: "none",
      }}>
        {toasts.map((t) => (
          <SingleToast key={t.id} item={t} onClose={onClose} />
        ))}
      </div>
    </>
  );
}