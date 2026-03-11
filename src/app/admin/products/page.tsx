import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = createAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      product_images ( image_url, is_primary ),
      product_variants ( id, stock_quantity )
    `)
    .order("created_at", { ascending: false });

  const total = products?.length || 0;
  const visible = products?.filter(p => p.is_visible).length || 0;
  const totalStock = products?.reduce((s, p) => s + (p.product_variants?.reduce((vs: number, v: any) => vs + (v.stock_quantity || 0), 0) || 0), 0) || 0;

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", background: "#f5f5f0" }}>

      {/* ── Summary stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "إجمالي المنتجات", value: total, icon: "🛍️", accent: "#6366f1" },
          { label: "المنتجات المرئية", value: visible, icon: "👁️", accent: "#22c55e" },
          { label: "إجمالي المخزون", value: totalStock, icon: "📦", accent: "#f59e0b" },
        ].map(card => (
          <div key={card.label} style={{
            background: "white", borderRadius: "14px", padding: "1.25rem 1.5rem",
            border: "1px solid #e8e8e3", position: "relative", overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
            display: "flex", alignItems: "center", gap: "1rem",
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px", flexShrink: 0,
              background: `${card.accent}18`, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "1.4rem",
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-latin)", fontWeight: 900, fontSize: "1.6rem", color: card.accent, lineHeight: 1 }}>
                {card.value}
              </div>
              <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#666", marginTop: "4px" }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Header row ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "1.2rem", color: "#111", marginBottom: "2px" }}>المنتجات</h1>
          <p style={{ color: "#888", fontSize: "0.82rem" }}>{total} منتج مضاف للمتجر</p>
        </div>
        <Link href="/admin/products/new" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "#111", color: "white",
          borderRadius: "12px", padding: "0 1.25rem", height: "44px",
          textDecoration: "none", fontWeight: 800, fontSize: "0.88rem",
          boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
          transition: "all 0.2s",
        }}>
          ➕ إضافة منتج جديد
        </Link>
      </div>

      {/* ── Products grid ── */}
      {!products || products.length === 0 ? (
        <div style={{
          background: "white", padding: "5rem 2rem", textAlign: "center",
          borderRadius: "20px", border: "2px dashed #ddd",
        }}>
          <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🛍️</div>
          <h3 style={{ fontWeight: 800, fontSize: "1.15rem", marginBottom: "0.5rem" }}>لا توجد منتجات حالياً</h3>
          <p style={{ color: "#888", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
            ابدأ بإضافة أول منتج لمتجرك لتبدأ في تلقي الطلبات.
          </p>
          <Link href="/admin/products/new" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "var(--gold)", color: "var(--black)",
            padding: "10px 24px", borderRadius: "10px",
            textDecoration: "none", fontWeight: 800, fontSize: "0.9rem",
          }}>
            إضافة منتج الآن
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: "1.25rem" }}>
          {products.map(product => {
            const mainImage =
              product.product_images?.find((img: any) => img.is_primary)?.image_url
              || product.product_images?.[0]?.image_url
              || null;

            const totalStock = product.product_variants?.reduce(
              (s: number, v: any) => s + (v.stock_quantity || 0), 0
            ) || 0;

            const isLowStock = totalStock > 0 && totalStock < 10;
            const isOutOfStock = totalStock === 0;

            return (
              <div key={product.id} style={{
                background: "white", borderRadius: "16px", overflow: "hidden",
                border: "1px solid #e8e8e3",
                boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                display: "flex", flexDirection: "column",
                transition: "all 0.25s ease",
              }}>
                {/* Image */}
                <div style={{ aspectRatio: "4/3", background: "#f5f5f0", position: "relative", overflow: "hidden" }}>
                  {mainImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={mainImage} alt={product.name_ar} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#ccc", fontSize: "2.5rem" }}>
                      📷
                    </div>
                  )}

                  {/* Visibility badge */}
                  <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", gap: "6px" }}>
                    {!product.is_visible && (
                      <span style={{
                        background: "rgba(0,0,0,0.65)", color: "white",
                        padding: "3px 10px", borderRadius: "99px",
                        fontSize: "0.7rem", fontWeight: 700, backdropFilter: "blur(4px)",
                      }}>
                        مخفي 👁️
                      </span>
                    )}
                    {isOutOfStock && (
                      <span style={{
                        background: "rgba(220,38,38,0.85)", color: "white",
                        padding: "3px 10px", borderRadius: "99px",
                        fontSize: "0.7rem", fontWeight: 700, backdropFilter: "blur(4px)",
                      }}>
                        نفد المخزون
                      </span>
                    )}
                    {isLowStock && (
                      <span style={{
                        background: "rgba(245,158,11,0.9)", color: "white",
                        padding: "3px 10px", borderRadius: "99px",
                        fontSize: "0.7rem", fontWeight: 700, backdropFilter: "blur(4px)",
                      }}>
                        مخزون منخفض
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", flex: 1, gap: "0.5rem" }}>
                  <h3 style={{ fontWeight: 800, fontSize: "1rem", color: "#111", lineHeight: 1.3 }}>{product.name_ar}</h3>
                  {product.name_fr && (
                    <p className="font-latin" style={{ fontSize: "0.78rem", color: "#999" }}>{product.name_fr}</p>
                  )}

                  <div style={{ fontFamily: "var(--font-latin)", fontWeight: 900, color: "#F5C518", fontSize: "1.1rem" }}>
                    {product.price.toLocaleString()} DZD
                  </div>

                  {/* Stock + variants */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginTop: "auto", paddingTop: "0.875rem",
                    borderTop: "1px solid #f0f0eb", fontSize: "0.8rem",
                  }}>
                    <span style={{ color: "#666" }}>
                      المخزون:{" "}
                      <strong style={{
                        color: isOutOfStock ? "#ef4444" : isLowStock ? "#f59e0b" : "#22c55e",
                      }}>
                        {totalStock}
                      </strong>
                    </span>
                    <span style={{ color: "#666" }}>
                      الأنواع: <strong style={{ color: "#111" }}>{product.product_variants?.length || 0}</strong>
                    </span>
                  </div>

                  {/* Stock bar */}
                  <div style={{ height: "3px", background: "#f0f0eb", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "99px",
                      width: `${Math.min((totalStock / 100) * 100, 100)}%`,
                      background: isOutOfStock ? "#ef4444" : isLowStock ? "#f59e0b" : "#22c55e",
                      transition: "width 0.3s",
                    }} />
                  </div>

                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    style={{
                      marginTop: "0.75rem", display: "flex", alignItems: "center",
                      justifyContent: "center", gap: "6px",
                      background: "#111", color: "white",
                      border: "none", borderRadius: "10px",
                      padding: "9px", textDecoration: "none",
                      fontWeight: 700, fontSize: "0.84rem",
                      transition: "all 0.2s",
                    }}
                  >
                    ✏️ تعديل المنتج
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
