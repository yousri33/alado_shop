import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { OrderForm } from "./order-form";
import { ProductGallery } from "./product-gallery";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: product, error } = await supabase
    .from("products")
    .select(`*, product_images(image_url, is_primary, sort_order), product_variants(id, color_name_ar, color_name_fr, color_hex, size, stock_quantity), category:categories(name_ar, name_fr)`)
    .eq("slug", slug)
    .eq("is_visible", true)
    .single();

  if (error || !product) notFound();

  const images = (product.product_images || []) as { image_url: string; is_primary: boolean; sort_order: number }[];
  const sorted = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order);
  const primary = sorted[0]?.image_url;

  return (
    <main style={{ minHeight: "100vh", background: "var(--offwhite)" }}>

      {/* ── MOBILE ENHANCED NAVIGATION ── */}
      <div style={{ 
        background: "white", 
        borderBottom: "1px solid var(--border)", 
        position: "sticky", 
        top: 0, 
        zIndex: 100,
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)"
      }}>
        <div style={{ 
          maxWidth: "1280px", 
          margin: "0 auto", 
          padding: "0.75rem 1rem", 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center" 
        }}>
          {/* Back Action - Clickable Button Style */}
          <Link href="/" style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            textDecoration: "none",
            color: "var(--black)",
            fontSize: "0.95rem",
            fontWeight: 800,
            background: "rgba(0,0,0,0.03)",
            padding: "6px 14px",
            borderRadius: "99px",
            border: "1px solid rgba(0,0,0,0.05)",
            transition: "all 0.2s ease"
          }}>
            <span style={{ fontSize: "1.1rem" }}>🏠</span>
            <span>الرئيسية</span>
          </Link>

          {/* Current Page Label (Truncated for Mobile) */}
          <div style={{ 
            fontSize: "0.85rem", 
            color: "var(--text-muted)", 
            fontFamily: "var(--font-latin)",
            direction: "ltr",
            maxWidth: "60%",
            textAlign: "right",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            <span style={{ opacity: 0.3, fontSize: "1.2rem" }}>›</span>
            <span style={{ 
              display: "inline-block",
              maxWidth: "140px",
              textOverflow: "ellipsis", 
              overflow: "hidden", 
              whiteSpace: "nowrap",
              verticalAlign: "bottom",
              fontWeight: 500
            }}>
              {product.name_fr || product.slug}
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.5rem 1rem 5rem" }}>

        <style>{`
          @media (min-width: 900px) {
            .product-layout { display: grid !important; grid-template-columns: 1fr 400px; gap: 3rem; align-items: start; }
            .form-sticky { position: sticky !important; top: 80px; }
            .mobile-order-btn { display: none !important; }
            .mobile-form-container { display: none !important; }
          }
          @media (max-width: 899px) {
            .form-col { order: 2; }
            .image-col { order: 1; }
            .desktop-form-container { display: none !important; }
          }
        `}</style>

        <div className="product-layout">

          {/* ─ IMAGE + DETAILS (left on desktop) ─ */}
          <div className="image-col">
            {/* Product title (Mobile first) */}
            <div style={{ marginBottom: "1.25rem" }}>
              {product.category && (
                <span className="badge badge-muted" style={{ marginBottom: "0.5rem", display: "inline-flex", fontSize: "0.78rem" }}>
                  {(product.category as { name_ar: string }).name_ar}
                </span>
              )}
              <h1 style={{ fontSize: "clamp(1.6rem, 5vw, 2.4rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: "0.4rem" }}>
                {product.name_ar}
              </h1>
              {product.name_fr && (
                <p className="font-latin" style={{ color: "var(--text-muted)", fontSize: "0.95rem", marginBottom: "0.75rem" }}>{product.name_fr}</p>
              )}
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "0.5rem" }}>
                <span className="font-latin" style={{ fontSize: "1.2rem", fontWeight: 700, opacity: 0.6 }}>DZD</span>
                <span className="font-latin" style={{ fontSize: "2.4rem", fontWeight: 900, color: "var(--black)" }}>{product.price.toLocaleString()}</span>
              </div>
            </div>

            {/* Client-side Gallery component */}
            <ProductGallery images={images} productName={product.name_ar} />

            {/* ── MOBILE ONLY: Form inline ── */}
            <div className="mobile-form-container" style={{ marginTop: "1.5rem", marginBottom: "2rem" }}>
              <OrderForm product={product} />
            </div>

            {/* Features grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {[["💧","مقاوم للصدأ","Inox résistant"],["🌡️","عازل 24h","Isotherme 24h"],["🔒","إغلاق محكم","Hermetique"],["🎨","4 ألوان","4 couleurs"]].map(([i,ar,fr]) => (
                <div key={ar} style={{ background: "white", borderRadius: "14px", padding: "0.875rem 1rem", border: "1px solid var(--border)", display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "1.3rem" }}>{i}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.85rem" }}>{ar}</div>
                    <div className="font-latin" style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>{fr}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ background: "white", borderRadius: "20px", border: "1px solid var(--border)", padding: "1.5rem" }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>وصف المنتج</h2>
              <p style={{ lineHeight: 2, color: "#444", fontSize: "0.95rem" }}>{product.description_ar}</p>
              {product.description_fr && (
                <p className="font-latin" style={{ marginTop: "0.75rem", color: "var(--text-muted)", lineHeight: 1.7, fontSize: "0.9rem" }}>{product.description_fr}</p>
              )}
            </div>
          </div>

          {/* ─ DESKTOP ONLY: Sidebar Form ─ */}
          <div className="desktop-form-container form-col">
            <div className="form-sticky">
              <OrderForm product={product} />
              {/* Trust signals */}
              <div style={{ marginTop: "1rem", background: "white", borderRadius: "16px", border: "1px solid var(--border)", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                {[["✅","دفع آمن عند الاستلام"],["🔄","ضمان الاستبدال"],["🚚","توصيل لجميع الولايات (58)"],["📞","دعم على مدار الساعة"]].map(([icon, text]) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.88rem", fontWeight: 600 }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── MOBILE STICKY ORDER BUTTON (shows at bottom when scrolled past form) ── */}
      <div className="mobile-order-btn" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        background: "white", borderTop: "2px solid var(--border)",
        padding: "0.875rem 1rem", display: "flex", gap: "0.75rem", alignItems: "center",
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>السعر الكلي مع التوصيل</div>
          <div className="font-latin" style={{ fontWeight: 900, fontSize: "1.2rem" }}>{(product.price).toLocaleString()}+ DZD</div>
        </div>
        <a href="#order-form" className="btn-gold" style={{ textDecoration: "none", fontSize: "1rem", borderRadius: "12px", padding: "0 1.5rem", height: "50px", flexShrink: 0 }}>
          اطلب الآن 🛒
        </a>
      </div>

    </main>
  );
}
