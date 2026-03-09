import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem {
  label: string;
  href: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { label: "Каталог", href: "/catalog" },
  { label: "Авторы", href: "/authors" },
  { label: "Новинки", href: "/new" },
  { label: "О нас", href: "/about" },
];

// ─── Icons ────────────────────────────────────────────────────────────────────
const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6"/>
    <line x1="3" y1="12" x2="21" y2="12"/>
    <line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cartCount = 3; // placeholder

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          transition: "all 0.4s ease",
          background: scrolled
            ? "rgba(250, 247, 242, 0.95)"
            : "rgba(250, 247, 242, 0.0)",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid #E8E0D5" : "1px solid transparent",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 32px",
            height: "72px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "2px" }}>
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "26px",
                fontWeight: 700,
                color: "#1C1410",
                letterSpacing: "-0.5px",
              }}
            >
              Book
            </span>
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "26px",
                fontWeight: 400,
                color: "#8B6F47",
                fontStyle: "italic",
              }}
            >
              store
            </span>
          </a>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", gap: "40px" }} className="desktop-nav">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "16px",
                  color: "#3D2B1F",
                  textDecoration: "none",
                  letterSpacing: "0.3px",
                  transition: "color 0.2s",
                  position: "relative",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#8B6F47")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#3D2B1F")}
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                color: "#3D2B1F",
                display: "flex",
                alignItems: "center",
                borderRadius: "8px",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#F0E9DF";
                (e.currentTarget as HTMLButtonElement).style.color = "#8B6F47";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "none";
                (e.currentTarget as HTMLButtonElement).style.color = "#3D2B1F";
              }}
            >
              <SearchIcon />
            </button>

            <a
              href="/profile"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                color: "#3D2B1F",
                display: "flex",
                alignItems: "center",
                borderRadius: "8px",
                transition: "background 0.2s, color 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#F0E9DF";
                (e.currentTarget as HTMLAnchorElement).style.color = "#8B6F47";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "none";
                (e.currentTarget as HTMLAnchorElement).style.color = "#3D2B1F";
              }}
            >
              <UserIcon />
            </a>

            <a
              href="/cart"
              style={{
                position: "relative",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                color: "#3D2B1F",
                display: "flex",
                alignItems: "center",
                borderRadius: "8px",
                transition: "background 0.2s, color 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#F0E9DF";
                (e.currentTarget as HTMLAnchorElement).style.color = "#8B6F47";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "none";
                (e.currentTarget as HTMLAnchorElement).style.color = "#3D2B1F";
              }}
            >
              <CartIcon />
              {cartCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "#8B6F47",
                    color: "white",
                    fontSize: "10px",
                    fontWeight: 700,
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "system-ui",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </a>

            {/* Mobile burger */}
            <button
              className="mobile-burger"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                color: "#3D2B1F",
                display: "none",
                alignItems: "center",
                borderRadius: "8px",
              }}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        style={{
          position: "fixed",
          top: "72px",
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(250, 247, 242, 0.98)",
          backdropFilter: "blur(16px)",
          zIndex: 99,
          display: "flex",
          flexDirection: "column",
          padding: "40px 32px",
          gap: "24px",
          transform: mobileOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        className="mobile-menu"
      >
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "28px",
              color: "#1C1410",
              textDecoration: "none",
              fontWeight: 600,
            }}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </div>
    </>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer
      style={{
        background: "#1C1410",
        color: "#B8A898",
        padding: "64px 32px 40px",
      }}
    >
      <div
        style={{
          // maxWidth: "1280px",
          // margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 2fr 2fr",
          gap: "48px",
          paddingBottom: "48px",
          borderBottom: "1px solid #2D2018",
        }}
      >
        {/* Brand */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "2px", marginBottom: "16px" }}>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "24px", fontWeight: 700, color: "#FAF7F2" }}>Book</span>
            <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "24px", fontWeight: 400, color: "#8B6F47", fontStyle: "italic" }}>store</span>
          </div>
          <p style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "16px", lineHeight: "1.7", color: "#8A7B6E", maxWidth: "320px" }}>
            Место, где живут книги. Находим для каждого читателя его историю.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "13px", fontWeight: 700, color: "#FAF7F2", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px" }}>
            Магазин
          </h4>
          {["Каталог", "Новинки", "Авторы", "Издательства"].map((l) => (
            <a key={l} href="#" style={{ display: "block", fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "15px", color: "#8A7B6E", textDecoration: "none", marginBottom: "10px", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C4A882")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8A7B6E")}
            >{l}</a>
          ))}
        </div>

        {/* Info */}
        <div>
          <h4 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "13px", fontWeight: 700, color: "#FAF7F2", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "20px" }}>
            Информация
          </h4>
          {["О нас", "Доставка и оплата", "Возврат", "Контакты"].map((l) => (
            <a key={l} href="#" style={{ display: "block", fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "15px", color: "#8A7B6E", textDecoration: "none", marginBottom: "10px", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#C4A882")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8A7B6E")}
            >{l}</a>
          ))}
        </div>
      </div>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          paddingTop: "32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <p style={{ fontFamily: "system-ui", fontSize: "13px", color: "#4A3A30" }}>
          © 2026 Bookstore. Все права защищены.
        </p>
        <p style={{ fontFamily: "system-ui", fontSize: "13px", color: "#4A3A30" }}>
          Сделано с любовью к книгам
        </p>
      </div>
    </footer>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function ClientLayout() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }
        
        body {
          background: #FAF7F2;
          min-height: 100vh;
        }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-burger { display: flex !important; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header />
        <main style={{ flex: 1, paddingTop: "72px" }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}

// ─── Demo / Preview ───────────────────────────────────────────────────────────
function DemoPage() {
  return (
    <>
      {/* Hero section for preview */}
      <section
        style={{
          minHeight: "90vh",
          display: "flex",
          alignItems: "center",
          padding: "80px 32px",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(160deg, #FAF7F2 0%, #F0E9DF 60%, #E8DDD0 100%)",
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: "absolute", right: "-100px", top: "50%", transform: "translateY(-50%)",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,111,71,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", right: "80px", top: "20%",
          width: "300px", height: "300px", borderRadius: "50%",
          border: "1px solid rgba(139,111,71,0.15)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%" }}>
          <p style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "15px",
            color: "#8B6F47",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: "24px",
          }}>
            Добро пожаловать
          </p>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(52px, 8vw, 96px)",
            fontWeight: 700,
            color: "#1C1410",
            lineHeight: "1.05",
            letterSpacing: "-2px",
            marginBottom: "32px",
            maxWidth: "720px",
          }}>
            Книги,<br />
            <span style={{ color: "#8B6F47", fontStyle: "italic", fontWeight: 400 }}>которые меняют</span><br />
            мировоззрение
          </h1>
          <p style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "20px",
            color: "#6B5A4E",
            lineHeight: "1.7",
            maxWidth: "480px",
            marginBottom: "48px",
          }}>
            Тысячи книг в нашем каталоге. Быстрая доставка, удобный поиск и персональные рекомендации.
          </p>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <a href="/catalog" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "16px 36px",
              background: "#1C1410",
              color: "#FAF7F2",
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "17px",
              textDecoration: "none",
              borderRadius: "2px",
              transition: "background 0.2s",
              letterSpacing: "0.3px",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#3D2B1F")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1410")}
            >
              Смотреть каталог
            </a>
            <a href="/new" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "16px 36px",
              background: "transparent",
              color: "#1C1410",
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "17px",
              textDecoration: "none",
              borderRadius: "2px",
              border: "1px solid #C4A882",
              transition: "border-color 0.2s, color 0.2s",
              letterSpacing: "0.3px",
            }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#8B6F47";
                (e.currentTarget as HTMLAnchorElement).style.color = "#8B6F47";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C4A882";
                (e.currentTarget as HTMLAnchorElement).style.color = "#1C1410";
              }}
            >
              Новинки
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

// Export both for use
export { ClientLayout, DemoPage };