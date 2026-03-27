import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../../../shared/useAuthStore";

// ─── Mock data ────────────────────────────────────────────────────────────────
const FEATURED_BOOKS = [
  {
    id: "1", title: "Мастер и Маргарита", author: "Михаил Булгаков",
    price: 490, category: "Классика",
    color: "#2C1810", accent: "#C4A882",
    desc: "Роман о добре и зле, о любви и предательстве в Москве 1930-х.",
  },
  {
    id: "2", title: "Преступление и наказание", author: "Фёдор Достоевский",
    price: 420, category: "Классика",
    color: "#0F1A2A", accent: "#7A9BC4",
    desc: "История молодого петербуржца, переступившего черту дозволенного.",
  },
  {
    id: "3", title: "Анна Каренина", author: "Лев Толстой",
    price: 550, category: "Роман",
    color: "#1A1A0F", accent: "#B4C47A",
    desc: "Судьба женщины, осмелившейся пойти против общества.",
  },
  {
    id: "4", title: "Война и мир", author: "Лев Толстой",
    price: 890, category: "Эпос",
    color: "#1C0F1A", accent: "#C47AB4",
    desc: "Эпопея об эпохе наполеоновских войн и судьбах трёх семей.",
  },
  {
    id: "5", title: "Идиот", author: "Фёдор Достоевский",
    price: 380, category: "Классика",
    color: "#0F1C18", accent: "#7AC4A8",
    desc: "Жизнь «положительно прекрасного человека» в несовершенном мире.",
  },
];

const GENRES = [
  { name: "Классика", count: 234, emoji: "📖", bg: "#1C1410", border: "#3D2B1F" },
  { name: "Фантастика", count: 412, emoji: "🚀", bg: "#0F1520", border: "#1E2D40" },
  { name: "Детективы", count: 189, emoji: "🔍", bg: "#150F1C", border: "#2A1F35" },
  { name: "История", count: 156, emoji: "🏛️", bg: "#0F1A10", border: "#1F3520" },
  { name: "Поэзия", count: 98, emoji: "✍️", bg: "#1A0F10", border: "#351F20" },
  { name: "Философия", count: 143, emoji: "🌀", bg: "#141410", border: "#2A2A1F" },
];

const QUOTES = [
  { text: "Книга — это зеркало. Если в неё смотрит осёл, из неё не выглянет апостол.", author: "Г.К. Лихтенберг" },
  { text: "Читатель живёт тысячью жизней, прежде чем умрёт. Тот, кто не читает, живёт лишь одной.", author: "Джордж Р.Р. Мартин" },
  { text: "Книги — корабли мысли, странствующие по волнам времени.", author: "Фрэнсис Бэкон" },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ─── Book Card ────────────────────────────────────────────────────────────────
function BookCard({ book, index }: { book: typeof FEATURED_BOOKS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const { token, openModal } = useAuthStore();

  const handleCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!token) {
      openModal("login", () => {
        console.log("Adding to cart:", book.id);
      });
    } else {
      console.log("Adding to cart:", book.id);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flexShrink: 0,
        width: "220px",
        cursor: "pointer",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        animationDelay: `${index * 80}ms`,
      }}
    >
      {/* Book spine / cover */}
      <div style={{
        width: "220px", height: "300px",
        background: `linear-gradient(135deg, ${book.color} 0%, color-mix(in srgb, ${book.color} 70%, #333) 100%)`,
        borderRadius: "4px 8px 8px 4px",
        position: "relative",
        overflow: "hidden",
        boxShadow: hovered
          ? `8px 16px 40px rgba(0,0,0,0.5), 2px 4px 12px rgba(0,0,0,0.3), -2px 0 0 rgba(255,255,255,0.05)`
          : `4px 8px 20px rgba(0,0,0,0.35), 1px 2px 6px rgba(0,0,0,0.2), -1px 0 0 rgba(255,255,255,0.05)`,
        transition: "box-shadow 0.3s ease",
        border: `1px solid ${book.accent}22`,
      }}>
        {/* Spine decoration */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "12px",
          background: `linear-gradient(to right, rgba(0,0,0,0.4), transparent)`,
          borderRight: `1px solid ${book.accent}33`,
        }} />

        {/* Corner ornament */}
        <div style={{
          position: "absolute", top: "16px", right: "16px",
          width: "32px", height: "32px",
          border: `1px solid ${book.accent}44`,
          borderRadius: "2px",
          transform: "rotate(45deg)",
        }} />
        <div style={{
          position: "absolute", top: "20px", right: "20px",
          width: "24px", height: "24px",
          border: `1px solid ${book.accent}33`,
          borderRadius: "2px",
          transform: "rotate(45deg)",
        }} />

        {/* Category badge */}
        <div style={{
          position: "absolute", top: "16px", left: "20px",
          fontFamily: "system-ui", fontSize: "9px", letterSpacing: "2px",
          textTransform: "uppercase", color: book.accent,
          opacity: 0.8,
        }}>
          {book.category}
        </div>

        {/* Title */}
        <div style={{
          position: "absolute", bottom: "20px", left: "20px", right: "20px",
        }}>
          <p style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "16px", fontWeight: 700,
            color: "#FAF7F2", lineHeight: 1.3,
            marginBottom: "6px",
            textShadow: "0 1px 4px rgba(0,0,0,0.5)",
          }}>
            {book.title}
          </p>
          <p style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "12px", color: book.accent, opacity: 0.9,
          }}>
            {book.author}
          </p>
        </div>

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)`,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
          display: "flex", alignItems: "flex-end",
          padding: "16px",
        }}>
          <button
            onClick={handleCart}
            style={{
              width: "100%",
              padding: "10px",
              background: book.accent,
              color: "#1C1410",
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "13px", fontWeight: 600,
              border: "none", borderRadius: "2px",
              cursor: "pointer",
              letterSpacing: "0.5px",
              marginBottom: "36px",
            }}
          >
            В корзину — {book.price} ₽
          </button>
        </div>
      </div>

      {/* Info below card */}
      <div style={{ paddingTop: "14px" }}>
        <p style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "14px", fontWeight: 600, color: "#1C1410",
          marginBottom: "3px", lineHeight: 1.3,
        }}>
          {book.title}
        </p>
        <p style={{
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontSize: "13px", color: "#8B6F47",
        }}>
          {book.author}
        </p>
        <p style={{
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontSize: "15px", fontWeight: 600, color: "#1C1410",
          marginTop: "6px",
        }}>
          {book.price} ₽
        </p>
      </div>
    </div>
  );
}

// ─── Section: Hero ────────────────────────────────────────────────────────────
function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  const { token, openModal } = useAuthStore();

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <section style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0F0A07 0%, #1C1005 40%, #2A1808 70%, #1A0E05 100%)",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
    }}>
      {/* Grain texture overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        opacity: 0.6,
      }} />

      {/* Radial glow */}
      <div style={{
        position: "absolute", right: "-200px", top: "50%",
        transform: "translateY(-50%)",
        width: "800px", height: "800px",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,111,71,0.12) 0%, transparent 65%)",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* Decorative rings */}
      {[700, 520, 360, 220].map((size, i) => (
        <div key={i} style={{
          position: "absolute",
          right: `-${size / 2 - 100}px`,
          top: "50%",
          transform: "translateY(-50%)",
          width: `${size}px`, height: `${size}px`,
          borderRadius: "50%",
          border: `1px solid rgba(196,168,130,${0.06 - i * 0.01})`,
          pointerEvents: "none", zIndex: 1,
        }} />
      ))}

      {/* Vertical rule */}
      <div style={{
        position: "absolute", left: "calc(50% - 1px)", top: "10%", bottom: "10%",
        width: "1px",
        background: "linear-gradient(to bottom, transparent, rgba(196,168,130,0.08) 30%, rgba(196,168,130,0.08) 70%, transparent)",
        pointerEvents: "none", zIndex: 1,
      }} />

      <div style={{
        maxWidth: "1280px", margin: "0 auto",
        padding: "0 32px",
        width: "100%",
        position: "relative", zIndex: 2,
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "80px",
        alignItems: "center",
      }}>
        {/* Left — text */}
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            marginBottom: "32px",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.1s",
          }}>
            <div style={{ width: "32px", height: "1px", background: "#8B6F47" }} />
            <span style={{
              fontFamily: "system-ui", fontSize: "11px", letterSpacing: "3px",
              textTransform: "uppercase", color: "#8B6F47",
            }}>
              Книжный магазин
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(48px, 6vw, 82px)",
            fontWeight: 700,
            color: "#FAF7F2",
            lineHeight: 1.05,
            letterSpacing: "-2px",
            marginBottom: "28px",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
          }}>
            Мир, где<br />
            <span style={{ color: "#8B6F47", fontStyle: "italic", fontWeight: 400 }}>слова</span>{" "}
            живут<br />
            вечно
          </h1>

          <p style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "19px",
            color: "rgba(250,247,242,0.6)",
            lineHeight: "1.7",
            maxWidth: "420px",
            marginBottom: "48px",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.35s",
          }}>
            Тысячи книг, которые изменят ваш взгляд на мир. Каждая история ждёт своего читателя.
          </p>

          <div style={{
            display: "flex", gap: "16px",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(20px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.45s",
          }}>
            <a href="/catalog" style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              padding: "16px 36px",
              background: "linear-gradient(135deg, #8B6F47, #6B5030)",
              color: "#FAF7F2",
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "16px", letterSpacing: "0.5px",
              textDecoration: "none", borderRadius: "2px",
              border: "1px solid rgba(196,168,130,0.3)",
              transition: "opacity 0.2s, transform 0.15s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; }}
            >
              Смотреть каталог
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>

            {!token && (
              <button onClick={() => openModal("register")} style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "16px 28px",
                background: "transparent",
                color: "rgba(250,247,242,0.7)",
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "16px", letterSpacing: "0.3px",
                border: "1px solid rgba(196,168,130,0.2)",
                borderRadius: "2px", cursor: "pointer",
                transition: "all 0.2s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,168,130,0.5)"; (e.currentTarget as HTMLButtonElement).style.color = "#FAF7F2"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,168,130,0.2)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(250,247,242,0.7)"; }}
              >
                Присоединиться
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: "40px", marginTop: "64px",
            paddingTop: "40px",
            borderTop: "1px solid rgba(196,168,130,0.12)",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.6s",
          }}>
            {[
              { val: "12 000+", label: "Книг в каталоге" },
              { val: "340+", label: "Авторов" },
              { val: "98%", label: "Довольных читателей" },
            ].map(({ val, label }) => (
              <div key={label}>
                <p style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "28px", fontWeight: 700,
                  color: "#FAF7F2", marginBottom: "4px",
                }}>
                  {val}
                </p>
                <p style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "13px", color: "rgba(196,168,130,0.6)",
                  letterSpacing: "0.5px",
                }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — floating book stack */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateX(0)" : "translateX(40px)",
          transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
        }}>
          <div style={{ position: "relative", width: "320px", height: "420px" }}>
            {/* Stack of books — decorative */}
            {[
              { left: "60px", top: "40px", rotate: "-8deg", bg: "#0F1520", accent: "#7A9BC4", w: 180, h: 260 },
              { left: "100px", top: "20px", rotate: "3deg", bg: "#1A1A0F", accent: "#B4C47A", w: 160, h: 240 },
              { left: "40px", top: "60px", rotate: "-3deg", bg: "#1C1410", accent: "#C4A882", w: 200, h: 280 },
            ].map((book, i) => (
              <div key={i} style={{
                position: "absolute",
                left: book.left, top: book.top,
                width: `${book.w}px`, height: `${book.h}px`,
                background: `linear-gradient(135deg, ${book.bg}, color-mix(in srgb, ${book.bg} 60%, #444))`,
                borderRadius: "3px 8px 8px 3px",
                transform: `rotate(${book.rotate})`,
                boxShadow: `6px 12px 30px rgba(0,0,0,0.6), -2px 0 0 rgba(255,255,255,0.04)`,
                border: `1px solid ${book.accent}22`,
                animation: `float${i} ${3 + i * 0.5}s ease-in-out infinite`,
              }}>
                {/* Book spine */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0, width: "10px",
                  background: "linear-gradient(to right, rgba(0,0,0,0.5), transparent)",
                  borderRight: `1px solid ${book.accent}22`,
                }} />
                {/* Corner ornament */}
                <div style={{
                  position: "absolute", bottom: "16px", right: "16px",
                  width: "24px", height: "24px",
                  border: `1px solid ${book.accent}33`,
                  borderRadius: "2px", transform: "rotate(45deg)",
                }} />
              </div>
            ))}
            {/* Glow under books */}
            <div style={{
              position: "absolute", bottom: "-20px", left: "50%",
              transform: "translateX(-50%)",
              width: "200px", height: "40px",
              background: "radial-gradient(ellipse, rgba(139,111,71,0.3) 0%, transparent 70%)",
              filter: "blur(10px)",
              pointerEvents: "none",
            }} />
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: "32px", left: "50%",
        transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
        opacity: loaded ? 0.5 : 0,
        transition: "opacity 0.8s 1.2s",
        animation: "bounce 2s ease-in-out infinite 1.5s",
        zIndex: 2,
      }}>
        <span style={{ fontFamily: "system-ui", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B6F47" }}>
          Прокрутить
        </span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B6F47" strokeWidth="1.5">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
    </section>
  );
}

// ─── Section: New releases ─────────────────────────────────────────────────────
function NewReleasesSection() {
  const { ref, inView } = useInView();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -280, behavior: "smooth" });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 280, behavior: "smooth" });

  return (
    <section ref={ref} style={{
      padding: "100px 0",
      background: "#FAF7F2",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-between",
          marginBottom: "48px",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{ width: "24px", height: "1px", background: "#8B6F47" }} />
              <span style={{ fontFamily: "system-ui", fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", color: "#8B6F47" }}>
                Книжная полка
              </span>
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 700, color: "#1C1410",
              letterSpacing: "-1px", lineHeight: 1.1,
            }}>
              Новинки сезона
            </h2>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={scrollLeft} style={{
                width: "44px", height: "44px",
                background: "none", border: "1px solid #E8E0D5",
                borderRadius: "50%", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#3D2B1F", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1C1410"; (e.currentTarget as HTMLButtonElement).style.color = "#FAF7F2"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#1C1410"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "#3D2B1F"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8E0D5"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
            </button>
            <button onClick={scrollRight} style={{
                width: "44px", height: "44px",
                background: "none", border: "1px solid #E8E0D5",
                borderRadius: "50%", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#3D2B1F", transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1C1410"; (e.currentTarget as HTMLButtonElement).style.color = "#FAF7F2"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#1C1410"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "#3D2B1F"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E8E0D5"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Horizontal scroll */}
        <div
          ref={scrollRef}
          style={{
            display: "flex", gap: "32px",
            overflowX: "auto",
            scrollbarWidth: "none",
            paddingBottom: "8px",
            opacity: inView ? 1 : 0,
            transform: inView ? "translateX(0)" : "translateX(32px)",
            transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s",
          }}
        >
          {FEATURED_BOOKS.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} />
          ))}
        </div>

        <div style={{
          textAlign: "center", marginTop: "48px",
          opacity: inView ? 1 : 0,
          transition: "opacity 0.6s 0.4s",
        }}>
          <a href="/catalog" style={{
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "16px", color: "#8B6F47",
            textDecoration: "none",
            borderBottom: "1px solid #C4A882",
            paddingBottom: "2px",
            transition: "color 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#6B5030")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8B6F47")}
          >
            Смотреть весь каталог →
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Genres ──────────────────────────────────────────────────────────
function GenresSection() {
  const { ref, inView } = useInView(0.1);

  return (
    <section ref={ref} style={{
      padding: "100px 0",
      background: "#F5F0EA",
    }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
        <div style={{
          textAlign: "center", marginBottom: "56px",
          opacity: inView ? 1 : 0,
          transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginBottom: "16px" }}>
            <div style={{ flex: 1, maxWidth: "80px", height: "1px", background: "linear-gradient(to right, transparent, #C4A882)" }} />
            <span style={{ fontFamily: "system-ui", fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", color: "#8B6F47" }}>
              Разделы
            </span>
            <div style={{ flex: 1, maxWidth: "80px", height: "1px", background: "linear-gradient(to left, transparent, #C4A882)" }} />
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 700, color: "#1C1410", letterSpacing: "-1px",
          }}>
            Найдите свой жанр
          </h2>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}>
          {GENRES.map((genre, i) => (
            <GenreCard key={genre.name} genre={genre} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function GenreCard({ genre, index, inView }: { genre: typeof GENRES[0]; index: number; inView: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={`/catalog?genre=${genre.name}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column",
        padding: "28px 24px",
        background: hovered ? genre.bg : "#FAF7F2",
        border: `1px solid ${hovered ? genre.border : "#E8E0D5"}`,
        borderRadius: "6px",
        textDecoration: "none",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: inView ? (hovered ? "translateY(-4px)" : "translateY(0)") : "translateY(24px)",
        opacity: inView ? 1 : 0,
        transitionDelay: `${index * 60}ms`,
        boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.15)" : "none",
      }}
    >
      <span style={{ fontSize: "28px", marginBottom: "16px", display: "block" }}>{genre.emoji}</span>
      <span style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "18px", fontWeight: 600,
        color: hovered ? "#FAF7F2" : "#1C1410",
        marginBottom: "6px",
        transition: "color 0.3s",
      }}>
        {genre.name}
      </span>
      <span style={{
        fontFamily: "'Crimson Pro', Georgia, serif",
        fontSize: "13px",
        color: hovered ? "rgba(250,247,242,0.5)" : "#9A8A7A",
        transition: "color 0.3s",
      }}>
        {genre.count} книг
      </span>
    </a>
  );
}

// ─── Section: Quote ───────────────────────────────────────────────────────────
function QuoteSection() {
  const { ref, inView } = useInView(0.2);
  const [quoteIdx, setQuoteIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((v) => (v + 1) % QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const q = QUOTES[quoteIdx];

  return (
    <section ref={ref} style={{
      padding: "120px 32px",
      background: "linear-gradient(160deg, #1C1410 0%, #2A1808 50%, #1A0E05 100%)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative */}
      <div style={{
        position: "absolute", top: "-100px", left: "-100px",
        width: "500px", height: "500px", borderRadius: "50%",
        border: "1px solid rgba(196,168,130,0.06)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-80px", right: "-80px",
        width: "400px", height: "400px", borderRadius: "50%",
        border: "1px solid rgba(196,168,130,0.05)",
        pointerEvents: "none",
      }} />

      {/* Big quote mark */}
      <div style={{
        position: "absolute", top: "40px", left: "50%",
        transform: "translateX(-50%)",
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: "200px", lineHeight: 1,
        color: "rgba(139,111,71,0.07)",
        fontWeight: 700, pointerEvents: "none",
        userSelect: "none",
      }}>
        "
      </div>

      <div style={{
        maxWidth: "720px", margin: "0 auto",
        textAlign: "center",
        position: "relative", zIndex: 1,
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <p
          key={quoteIdx}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(22px, 3vw, 32px)",
            fontStyle: "italic",
            color: "#FAF7F2",
            lineHeight: 1.55,
            marginBottom: "32px",
            animation: "fadeIn 0.6s ease",
          }}
        >
          "{q.text}"
        </p>
        <p style={{
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontSize: "15px", color: "#8B6F47",
          letterSpacing: "1px",
        }}>
          — {q.author}
        </p>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "32px" }}>
          {QUOTES.map((_, i) => (
            <button key={i} onClick={() => setQuoteIdx(i)} style={{
              width: i === quoteIdx ? "24px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: i === quoteIdx ? "#8B6F47" : "rgba(139,111,71,0.3)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.3s",
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: Features ────────────────────────────────────────────────────────
function FeaturesSection() {
  const { ref, inView } = useInView(0.1);

  const features = [
    {
      icon: "🚚",
      title: "Быстрая доставка",
      desc: "Доставим книгу в течение 1–3 рабочих дней по всей стране. Бесплатно при заказе от 1500 ₽.",
    },
    {
      icon: "🔖",
      title: "Личный кабинет",
      desc: "Отслеживайте заказы, сохраняйте избранное и получайте персональные рекомендации.",
    },
    {
      icon: "↩️",
      title: "Лёгкий возврат",
      desc: "Если книга не подошла — вернём деньги без лишних вопросов в течение 14 дней.",
    },
    {
      icon: "🎁",
      title: "Подарочная упаковка",
      desc: "Красиво упакуем книгу и добавим открытку с вашим текстом. Идеальный подарок.",
    },
  ];

  return (
    <section ref={ref} style={{ padding: "100px 0", background: "#FAF7F2" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 32px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "2px",
          border: "1px solid #E8E0D5",
          borderRadius: "8px",
          overflow: "hidden",
        }}>
          {features.map((f, i) => (
            <div key={f.title} style={{
              padding: "40px 32px",
              background: "#FAF7F2",
              borderRight: i < features.length - 1 ? "1px solid #E8E0D5" : "none",
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(24px)",
              transition: `all 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`,
            }}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "20px" }}>{f.icon}</span>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "18px", fontWeight: 600, color: "#1C1410",
                marginBottom: "12px",
              }}>
                {f.title}
              </h3>
              <p style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "15px", color: "#7A6A5A", lineHeight: 1.65,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section: CTA ─────────────────────────────────────────────────────────────
function CTASection() {
  const { ref, inView } = useInView(0.2);
  const { token, openModal } = useAuthStore();

  return (
    <section ref={ref} style={{
      padding: "100px 32px",
      background: "#F5F0EA",
    }}>
      <div style={{
        maxWidth: "800px", margin: "0 auto",
        textAlign: "center",
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{
          display: "inline-block",
          padding: "6px 18px",
          background: "rgba(139,111,71,0.1)",
          border: "1px solid rgba(139,111,71,0.2)",
          borderRadius: "20px",
          fontFamily: "system-ui", fontSize: "11px",
          letterSpacing: "2px", textTransform: "uppercase",
          color: "#8B6F47", marginBottom: "28px",
        }}>
          Для читателей
        </div>

        <h2 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "clamp(36px, 5vw, 56px)",
          fontWeight: 700, color: "#1C1410",
          lineHeight: 1.1, letterSpacing: "-1.5px",
          marginBottom: "24px",
        }}>
          Начните своё<br />
          <span style={{ color: "#8B6F47", fontStyle: "italic", fontWeight: 400 }}>книжное путешествие</span>
        </h2>

        <p style={{
          fontFamily: "'Crimson Pro', Georgia, serif",
          fontSize: "19px", color: "#7A6A5A",
          lineHeight: 1.65, maxWidth: "520px",
          margin: "0 auto 40px",
        }}>
          Создайте аккаунт — это бесплатно. Сохраняйте избранное, отслеживайте заказы и получайте рекомендации.
        </p>

        {!token ? (
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => openModal("register")} style={{
              padding: "16px 40px",
              background: "#1C1410", color: "#FAF7F2",
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "17px", letterSpacing: "0.5px",
              border: "none", borderRadius: "2px",
              cursor: "pointer",
              transition: "background 0.2s, transform 0.15s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3D2B1F"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1C1410"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
            >
              Зарегистрироваться бесплатно
            </button>
            <button onClick={() => openModal("login")} style={{
              padding: "16px 32px",
              background: "transparent", color: "#1C1410",
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "17px", letterSpacing: "0.3px",
              border: "1px solid #C4A882",
              borderRadius: "2px", cursor: "pointer",
              transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#8B6F47"; (e.currentTarget as HTMLButtonElement).style.color = "#8B6F47"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#C4A882"; (e.currentTarget as HTMLButtonElement).style.color = "#1C1410"; }}
            >
              Уже есть аккаунт
            </button>
          </div>
        ) : (
          <a href="/catalog" style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "16px 40px",
            background: "#1C1410", color: "#FAF7F2",
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontSize: "17px", letterSpacing: "0.5px",
            textDecoration: "none", borderRadius: "2px",
            transition: "background 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#3D2B1F")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#1C1410")}
          >
            Перейти в каталог
          </a>
        )}
      </div>
    </section>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap');

        @keyframes float0 {
          0%, 100% { transform: rotate(-8deg) translateY(0px); }
          50% { transform: rotate(-8deg) translateY(-10px); }
        }
        @keyframes float1 {
          0%, 100% { transform: rotate(3deg) translateY(0px); }
          50% { transform: rotate(3deg) translateY(-14px); }
        }
        @keyframes float2 {
          0%, 100% { transform: rotate(-3deg) translateY(0px); }
          50% { transform: rotate(-3deg) translateY(-8px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Hide scrollbar for book carousel */
        div::-webkit-scrollbar { display: none; }
      `}</style>

      <HeroSection />
      <NewReleasesSection />
      <GenresSection />
      <QuoteSection />
      <FeaturesSection />
      <CTASection />
    </>
  );
}