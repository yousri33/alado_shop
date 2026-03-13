"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// ─── SVG Icons ───────────────────────────────────────────────
function IconOrders({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="2" />
      <path d="M9 12h6M9 16h4" />
    </svg>
  );
}

function IconProducts({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconPlus({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconAI({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
    </svg>
  );
}

function IconGlobe({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconLogout({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconMenu({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="3" y1="7" x2="21" y2="7" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="17" x2="21" y2="17" />
    </svg>
  );
}

function IconX({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Nav Config ──────────────────────────────────────────────
const NAV_ITEMS = [
  {
    group: "الرئيسية",
    links: [
      { label: "الطلبات",  href: "/admin/orders",        icon: "orders"   },
      { label: "المنتجات", href: "/admin/products",       icon: "products" },
    ],
  },
  {
    group: "الإجراءات",
    links: [
      { label: "منتج جديد", href: "/admin/products/new", icon: "plus" },
    ],
  },
  {
    group: "الذكاء الاصطناعي",
    links: [
      { label: "أدوات AI", href: "/admin/ai", icon: "ai", badge: "NEW" },
    ],
  },
];

function NavIcon({ name, size = 17 }: { name: string; size?: number }) {
  if (name === "orders")   return <IconOrders size={size} />;
  if (name === "products") return <IconProducts size={size} />;
  if (name === "plus")     return <IconPlus size={size} />;
  if (name === "ai")       return <IconAI size={size} />;
  return null;
}

function getPageMeta(path: string) {
  if (path.includes("/products/new")) return { title: "إضافة منتج جديد", icon: "plus" };
  if (path.includes("/edit"))         return { title: "تعديل المنتج",      icon: "products" };
  if (path.includes("/products"))     return { title: "إدارة المنتجات",    icon: "products" };
  if (path.includes("/orders"))       return { title: "الطلبات",            icon: "orders" };
  if (path.includes("/ai"))           return { title: "أدوات AI",           icon: "ai" };
  return { title: "لوحة التحكم", icon: "products" };
}

type NavLink = { label: string; href: string; icon: string; badge?: string };
type NavGroup = { group: string; links: NavLink[] };

// ─── Sidebar Nav Links ────────────────────────────────────────
function SidebarNav({
  items,
  isActive,
  onLinkClick,
}: {
  items: NavGroup[];
  isActive: (href: string) => boolean;
  onLinkClick?: () => void;
}) {
  return (
    <nav style={{ padding: "0.875rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto" }}>
      {items.map(({ group, links }) => (
        <div key={group}>
          <div style={{
            fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.12em", textTransform: "uppercase",
            padding: "0 0.625rem", marginBottom: "0.3rem",
            fontFamily: "var(--font-latin)",
          }}>
            {group}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onLinkClick}
                  className={active ? "" : "admin-nav-link"}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "9px 10px", borderRadius: "9px",
                    background: active ? "var(--gold)" : "transparent",
                    color: active ? "#0F0F0F" : "rgba(255,255,255,0.52)",
                    fontWeight: active ? 800 : 500,
                    textDecoration: "none",
                    fontSize: "0.875rem",
                    transition: "background 0.15s, color 0.15s",
                  }}
                >
                  <span style={{ display: "flex", flexShrink: 0 }}>
                    <NavIcon name={link.icon} size={16} />
                  </span>
                  <span style={{ flex: 1 }}>{link.label}</span>
                  {link.badge && (
                    <span style={{
                      fontSize: "0.58rem", fontWeight: 900,
                      background: active ? "rgba(0,0,0,0.14)" : "rgba(245,197,24,0.18)",
                      color: active ? "#0F0F0F" : "var(--gold)",
                      padding: "1px 6px", borderRadius: "4px",
                      letterSpacing: "0.04em", fontFamily: "var(--font-latin)",
                    }}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

// ─── Sidebar Bottom ───────────────────────────────────────────
function SidebarBottom({ onLogout }: { onLogout: () => void }) {
  return (
    <div style={{ padding: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "1px" }}>
      <Link href="/" style={{
        display: "flex", alignItems: "center", gap: "9px",
        padding: "9px 10px", borderRadius: "9px",
        color: "rgba(255,255,255,0.35)", textDecoration: "none",
        fontSize: "0.84rem", fontWeight: 500, transition: "color 0.15s",
      }}>
        <IconGlobe size={14} /> عرض الموقع
      </Link>
      <button
        onClick={onLogout}
        style={{
          display: "flex", alignItems: "center", gap: "9px",
          padding: "9px 10px", borderRadius: "9px",
          color: "rgba(239,68,68,0.65)", background: "none", border: "none",
          fontSize: "0.84rem", fontWeight: 600, cursor: "pointer",
          textAlign: "right", width: "100%", transition: "color 0.15s",
        }}
      >
        <IconLogout size={14} /> تسجيل الخروج
      </button>
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { title, icon } = getPageMeta(pathname);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [pathname, isMobile]);

  if (pathname === "/admin/login") return <>{children}</>;

  const isActive = (href: string) => {
    if (href === "/admin/products/new") return pathname === href;
    return pathname === href || (href !== "/admin" && pathname.startsWith(href) && !pathname.includes("/new"));
  };

  const handleLogout = async () => {
    if (confirm("هل تريد تسجيل الخروج؟")) {
      await fetch("/api/admin/logout", { method: "POST" });
      window.location.href = "/admin/login";
    }
  };

  // ── Sidebar logo section ──
  const SidebarLogo = (
    <div style={{
      padding: "1.125rem 1.125rem 1rem",
      borderBottom: "1px solid rgba(255,255,255,0.065)",
      display: "flex", alignItems: "center", gap: "10px",
    }}>
      <Image src="/alado logo.png" alt="Alado" width={88} height={34}
        style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
      />
      <span style={{
        fontSize: "0.58rem", fontWeight: 800,
        color: "rgba(245,197,24,0.9)",
        background: "rgba(245,197,24,0.1)",
        padding: "2px 7px", borderRadius: "5px",
        border: "1px solid rgba(245,197,24,0.18)",
        letterSpacing: "0.05em", fontFamily: "var(--font-latin)",
      }}>
        ADMIN
      </span>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F6F3", position: "relative" }}>

      {/* ── Mobile Overlay ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.58)",
            zIndex: 45, backdropFilter: "blur(3px)",
          }}
        />
      )}

      {/* ── Desktop Sidebar ── */}
      <aside
        className="admin-sidebar"
        style={{
          width: "244px", background: "#0F0F0F", color: "white",
          display: "flex", flexDirection: "column", flexShrink: 0,
          position: "sticky", top: 0, height: "100vh", zIndex: 50,
        }}
      >
        {SidebarLogo}
        <SidebarNav items={NAV_ITEMS} isActive={isActive} />
        <SidebarBottom onLogout={handleLogout} />
      </aside>

      {/* ── Mobile Sidebar (slide-in) ── */}
      {isMobile && (
        <div style={{
          position: "fixed", top: 0, right: sidebarOpen ? 0 : "-268px",
          width: "260px", height: "100vh",
          background: "#0F0F0F", color: "white",
          display: "flex", flexDirection: "column",
          zIndex: 50, transition: "right 0.3s ease",
          boxShadow: sidebarOpen ? "-8px 0 40px rgba(0,0,0,0.3)" : "none",
        }}>
          <div style={{
            padding: "1rem 1rem 0.875rem",
            borderBottom: "1px solid rgba(255,255,255,0.065)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Image src="/alado logo.png" alt="Alado" width={78} height={30}
                style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
              />
              <span style={{
                fontSize: "0.58rem", fontWeight: 800,
                color: "rgba(245,197,24,0.9)",
                background: "rgba(245,197,24,0.1)",
                padding: "2px 6px", borderRadius: "5px",
                border: "1px solid rgba(245,197,24,0.18)",
                letterSpacing: "0.05em", fontFamily: "var(--font-latin)",
              }}>ADMIN</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.45)", display: "flex", padding: "4px" }}
            >
              <IconX size={18} />
            </button>
          </div>
          <SidebarNav
            items={NAV_ITEMS}
            isActive={isActive}
            onLinkClick={() => setSidebarOpen(false)}
          />
          <SidebarBottom onLogout={handleLogout} />
        </div>
      )}

      {/* ── Main Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: "56px", background: "white",
          borderBottom: "1px solid #EAEAE5",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.25rem",
          position: "sticky", top: 0, zIndex: 40,
          boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
        }}>
          {/* Left: toggle + title */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="admin-menu-btn"
              style={{
                background: "none", border: "1px solid #E8E8E3",
                cursor: "pointer", padding: "6px 8px", color: "#555",
                display: "flex", alignItems: "center", borderRadius: "8px",
                transition: "background 0.15s",
              }}
            >
              {sidebarOpen ? <IconX size={18} /> : <IconMenu size={18} />}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span style={{ color: "#888", display: "flex" }}>
                <NavIcon name={icon} size={15} />
              </span>
              <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#111" }}>{title}</span>
            </div>
          </div>

          {/* Right: actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Link href="/admin/products/new" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "#111", color: "white",
              borderRadius: "8px", padding: "0 13px", height: "34px",
              textDecoration: "none", fontWeight: 700, fontSize: "0.78rem",
              transition: "opacity 0.15s",
            }}>
              <IconPlus size={13} />
              <span className="admin-topbar-label">منتج جديد</span>
            </Link>
            <div
              className="admin-status-pill"
              style={{
                alignItems: "center", gap: "5px",
                background: "#F0FDF4", color: "#16a34a",
                padding: "5px 11px", borderRadius: "99px",
                fontSize: "0.74rem", fontWeight: 700,
              }}
            >
              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a" }} />
              متصل
            </div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
