"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    group: "الرئيسية",
    links: [
      { label: "الطلبات", href: "/admin/orders", icon: "📦", badge: null },
      { label: "المنتجات", href: "/admin/products", icon: "🛍️", badge: null },
    ],
  },
  {
    group: "الإجراءات",
    links: [
      { label: "منتج جديد", href: "/admin/products/new", icon: "➕", badge: null },
    ],
  },
  {
    group: "الذكاء الاصطناعي",
    links: [
      { label: "أدوات AI", href: "/admin/ai", icon: "✨", badge: "NEW" },
    ],
  },
];

function getPageMeta(path: string) {
  if (path.includes("/products/new")) return { title: "إضافة منتج جديد", icon: "➕" };
  if (path.includes("/edit")) return { title: "تعديل المنتج", icon: "✏️" };
  if (path.includes("/products")) return { title: "إدارة المنتجات", icon: "🛍️" };
  if (path.includes("/orders")) return { title: "الطلبات", icon: "📦" };
  if (path.includes("/ai")) return { title: "أدوات AI", icon: "✨" };
  return { title: "لوحة التحكم", icon: "⚙️" };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { title, icon } = getPageMeta(pathname);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f0" }}>

      {/* ══ SIDEBAR ══ */}
      <aside style={{
        width: "240px", background: "#111", color: "white",
        display: "flex", flexDirection: "column", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh", zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{
          padding: "1.5rem 1.25rem",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          display: "flex", alignItems: "center", gap: "10px",
        }}>
          <Image
            src="/alado logo.png" alt="Alado" width={100} height={40}
            style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }}
          />
          <span style={{
            fontSize: "0.65rem", fontWeight: 700, color: "var(--gold)",
            background: "rgba(245,197,24,0.12)", padding: "2px 8px",
            borderRadius: "99px", border: "1px solid rgba(245,197,24,0.2)",
            whiteSpace: "nowrap",
          }}>
            ADMIN
          </span>
        </div>

        {/* Nav */}
        <nav style={{ padding: "1rem 0.75rem", flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem", overflowY: "auto" }}>
          {NAV_ITEMS.map(({ group, links }) => (
            <div key={group}>
              <div style={{
                fontSize: "0.67rem", fontWeight: 800, color: "rgba(255,255,255,0.28)",
                letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "0 0.75rem", marginBottom: "0.4rem",
              }}>
                {group}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {links.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href) && !pathname.includes("/new") && !link.href.includes("/new"));
                  const isNewActive = link.href === "/admin/products/new" && pathname === "/admin/products/new";
                  const active = link.href === "/admin/products/new" ? isNewActive : isActive;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 12px", borderRadius: "10px",
                        background: active ? "var(--gold)" : "transparent",
                        color: active ? "var(--black)" : "rgba(255,255,255,0.58)",
                        fontWeight: active ? 800 : 500,
                        textDecoration: "none",
                        fontSize: "0.88rem",
                        transition: "all 0.2s",
                      }}
                    >
                      <span style={{ fontSize: "1rem", flexShrink: 0 }}>{link.icon}</span>
                      <span style={{ flex: 1 }}>{link.label}</span>
                      {link.badge && (
                        <span style={{ 
                          fontSize: "0.6rem", fontWeight: 900, 
                          background: active ? "rgba(0,0,0,0.1)" : "rgba(245,197,24,0.15)",
                          color: active ? "var(--black)" : "var(--gold)",
                          padding: "2px 6px", borderRadius: "4px",
                          marginLeft: "auto"
                        }}>
                          {link.badge}
                        </span>
                      )}
                      {active && !link.badge && (
                        <div style={{
                          marginRight: "auto", width: "6px", height: "6px", borderRadius: "50%",
                          background: "var(--black)", opacity: 0.4,
                        }} />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "1rem 0.75rem", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: "4px" }}>
          <Link href="/" style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "9px 12px", borderRadius: "10px",
            color: "rgba(255,255,255,0.45)", textDecoration: "none",
            fontSize: "0.85rem", fontWeight: 600, transition: "all 0.2s",
          }}>
            <span>🌐</span> عرض الموقع
          </Link>
        </div>
      </aside>

      {/* ══ MAIN CONTENT ══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: "60px", background: "white",
          borderBottom: "1px solid #e8e8e3",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 2rem", position: "sticky", top: 0, zIndex: 40,
          boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
        }}>
          {/* Page title */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "1.1rem" }}>{icon}</span>
            <span style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111" }}>{title}</span>
          </div>

          {/* Actions + status */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/admin/products/new" style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "#111", color: "white",
              borderRadius: "8px", padding: "0 12px", height: "34px",
              textDecoration: "none", fontWeight: 700, fontSize: "0.8rem",
            }}>
              ➕ منتج جديد
            </Link>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "#dcfce7", color: "#16a34a",
              padding: "5px 12px", borderRadius: "99px", fontSize: "0.78rem", fontWeight: 800,
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
              متصل
            </span>
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
