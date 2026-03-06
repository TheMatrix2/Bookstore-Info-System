import { useState, type JSX } from "react";
import { Outlet } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavItem {
  label: string;
  href: string;
  icon: () => JSX.Element;
  badge?: number;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
  </svg>
);

const ShoppingBagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87"/>
    <path d="M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const TruckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const TagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const CollapseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 01-3.46 0"/>
  </svg>
);

// ─── Nav Config ───────────────────────────────────────────────────────────────
const NAV_SECTIONS: NavSection[] = [
  {
    label: "Основное",
    items: [
      { label: "Аналитика", href: "/admin", icon: ChartIcon },
      { label: "Заказы", href: "/admin/orders", icon: ShoppingBagIcon, badge: 12 },
      { label: "Доставки", href: "/admin/deliveries", icon: TruckIcon, badge: 5 },
    ],
  },
  {
    label: "Каталог",
    items: [
      { label: "Книги", href: "/admin/books", icon: BookIcon },
      { label: "Категории", href: "/admin/categories", icon: TagIcon },
    ],
  },
  {
    label: "Управление",
    items: [
      { label: "Покупатели", href: "/admin/users", icon: UsersIcon },
      { label: "Настройки", href: "/admin/settings", icon: SettingsIcon },
    ],
  },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const currentPath = "/admin/orders"; // placeholder

  return (
    <aside
      style={{
        width: collapsed ? "64px" : "240px",
        minHeight: "100vh",
        background: "#0F0A07",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        flexShrink: 0,
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        borderRight: "1px solid #1A1208",
      }}
    >
      {/* Logo + collapse */}
      <div
        style={{
          height: "64px",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #1A1208",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "baseline", gap: "2px", opacity: collapsed ? 0 : 1, transition: "opacity 0.2s", whiteSpace: "nowrap" }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#FAF7F2" }}>Book</span>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 400, color: "#8B6F47", fontStyle: "italic" }}>store</span>
            <span style={{ fontFamily: "system-ui", fontSize: "10px", color: "#5A4535", letterSpacing: "1px", textTransform: "uppercase", marginLeft: "6px", alignSelf: "center" }}>Admin</span>
          </div>
        )}
        {collapsed && (
          <div style={{ margin: "0 auto", fontFamily: "'Playfair Display', Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#8B6F47" }}>B</div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#5A4535",
              display: "flex",
              padding: "4px",
              borderRadius: "4px",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#C4A882")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#5A4535")}
          >
            <CollapseIcon />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 8px", overflow: "auto" }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: "24px" }}>
            {!collapsed && (
              <p style={{
                fontFamily: "system-ui",
                fontSize: "10px",
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#3D2B1F",
                padding: "0 8px",
                marginBottom: "6px",
              }}>
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const isActive = currentPath === item.href;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: collapsed ? "10px" : "10px 12px",
                    borderRadius: "6px",
                    marginBottom: "2px",
                    textDecoration: "none",
                    color: isActive ? "#E8C9A0" : "#7A6458",
                    background: isActive ? "rgba(139,111,71,0.15)" : "transparent",
                    transition: "all 0.15s",
                    justifyContent: collapsed ? "center" : "flex-start",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.color = "#C4A882";
                      (e.currentTarget as HTMLAnchorElement).style.background = "rgba(139,111,71,0.08)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLAnchorElement).style.color = "#7A6458";
                      (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                    }
                  }}
                >
                  <span style={{ flexShrink: 0 }}><item.icon /></span>
                  {!collapsed && (
                    <span style={{ fontFamily: "system-ui", fontSize: "14px", fontWeight: isActive ? 500 : 400, whiteSpace: "nowrap" }}>
                      {item.label}
                    </span>
                  )}
                  {!collapsed && item.badge !== undefined && (
                    <span style={{
                      marginLeft: "auto",
                      background: "#8B6F47",
                      color: "#FAF7F2",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "1px 7px",
                      borderRadius: "10px",
                      fontFamily: "system-ui",
                    }}>
                      {item.badge}
                    </span>
                  )}
                  {collapsed && item.badge !== undefined && (
                    <span style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      width: "8px",
                      height: "8px",
                      background: "#8B6F47",
                      borderRadius: "50%",
                    }} />
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: "1px solid #1A1208", padding: "12px 8px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: collapsed ? "8px" : "8px 12px",
          borderRadius: "6px",
          justifyContent: collapsed ? "center" : "flex-start",
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #8B6F47, #5A3A1A)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontFamily: "'Playfair Display', serif",
            fontSize: "14px",
            fontWeight: 700,
            color: "#FAF7F2",
          }}>
            А
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "system-ui", fontSize: "13px", fontWeight: 500, color: "#C4A882", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Администратор
              </p>
              <p style={{ fontFamily: "system-ui", fontSize: "11px", color: "#4A3A30", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                admin@bookstore.ru
              </p>
            </div>
          )}
          {!collapsed && (
            <button style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#4A3A30",
              display: "flex",
              padding: "4px",
              flexShrink: 0,
              transition: "color 0.2s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C4A882")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#4A3A30")}
              title="Выйти"
            >
              <LogoutIcon />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────
function Topbar({ sidebarCollapsed, onSidebarToggle }: { sidebarCollapsed: boolean; onSidebarToggle: () => void }) {
  return (
    <header style={{
      height: "64px",
      background: "#FAF7F2",
      borderBottom: "1px solid #E8E0D5",
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
      gap: "16px",
      position: "sticky",
      top: 0,
      zIndex: 40,
    }}>
      {sidebarCollapsed && (
        <button
          onClick={onSidebarToggle}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#6B5A4E",
            display: "flex",
            padding: "8px",
            borderRadius: "6px",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F0E9DF")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
      )}

      {/* Breadcrumb placeholder */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontFamily: "system-ui", fontSize: "13px", color: "#9A8A7E" }}>Панель управления</span>
        <span style={{ color: "#C4B4A8", fontSize: "13px" }}>/</span>
        <span style={{ fontFamily: "system-ui", fontSize: "13px", color: "#1C1410", fontWeight: 500 }}>Заказы</span>
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
        {/* Notifications */}
        <button style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "8px",
          color: "#6B5A4E",
          display: "flex",
          borderRadius: "8px",
          transition: "background 0.2s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#F0E9DF")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <BellIcon />
          <span style={{
            position: "absolute", top: "6px", right: "6px",
            width: "8px", height: "8px",
            background: "#C0632B", borderRadius: "50%",
            border: "2px solid #FAF7F2",
          }} />
        </button>
      </div>
    </header>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F5F0EA; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

        {/* Main content area */}
        <div style={{
          flex: 1,
          marginLeft: collapsed ? "64px" : "240px",
          transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}>
          <Topbar sidebarCollapsed={collapsed} onSidebarToggle={() => setCollapsed(false)} />
          <main style={{
            flex: 1,
            padding: "32px",
            background: "#F5F0EA",
          }}>
            <Outlet />
          </main>
        </div>
      </div>
    </>
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────
function DemoStats() {
  const stats = [
    { label: "Заказов сегодня", value: "47", delta: "+12%", positive: true },
    { label: "Выручка", value: "₽84 200", delta: "+8.3%", positive: true },
    { label: "Новых клиентов", value: "23", delta: "+5.1%", positive: true },
    { label: "Возвраты", value: "3", delta: "-2", positive: false },
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "28px", fontWeight: 700, color: "#1C1410", marginBottom: "4px" }}>
          Добрый день, Администратор
        </h1>
        <p style={{ fontFamily: "system-ui", fontSize: "14px", color: "#9A8A7E" }}>
          Понедельник, 2 марта 2026
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            background: "#FAF7F2",
            borderRadius: "8px",
            padding: "24px",
            border: "1px solid #E8E0D5",
          }}>
            <p style={{ fontFamily: "system-ui", fontSize: "12px", color: "#9A8A7E", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "8px" }}>
              {stat.label}
            </p>
            <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "32px", fontWeight: 700, color: "#1C1410", marginBottom: "8px" }}>
              {stat.value}
            </p>
            <span style={{
              fontFamily: "system-ui",
              fontSize: "12px",
              color: stat.positive ? "#2D6A4F" : "#C0632B",
              background: stat.positive ? "rgba(45,106,79,0.08)" : "rgba(192,99,43,0.08)",
              padding: "2px 8px",
              borderRadius: "4px",
            }}>
              {stat.delta} vs вчера
            </span>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}

export { AdminLayout, DemoStats };