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

  const total      = products?.length || 0;
  const visible    = products?.filter(p => p.is_visible).length || 0;
  const totalStock = products?.reduce(
    (s, p) => s + (p.product_variants?.reduce((vs: number, v: any) => vs + (v.stock_quantity || 0), 0) || 0),
    0
  ) || 0;

  return (
    <div style={{ padding: "clamp(1rem, 4vw, 1.75rem)", minHeight: "100vh", background: "#F6F6F3" }}>

      {/* ── KPI Cards ── */}
      <div className="admin-kpi-grid" style={{ marginBottom: "1.75rem" }}>
        {[
          { label: "إجمالي المنتجات", value: total,      accent: "#6366f1", sub: "مضافة للمتجر" },
          { label: "المنتجات المرئية", value: visible,   accent: "#22c55e", sub: "ظاهرة للعملاء" },
          { label: "إجمالي المخزون",   value: totalStock, accent: "#f59e0b", sub: "وحدة متاحة" },
        ].map(card => (
          <div key={card.label} style={{
            background: "white", borderRadius: "14px",
            padding: "1.125rem 1.25rem",
            border: "1px solid #EAEAE5",
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, right: 0, left: 0,
              height: "3px", background: card.accent, opacity: 0.75,
            }} />
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#999", marginBottom: "0.6rem" }}>
              {card.label}
            </div>
            <div style={{
              fontFamily: "var(--font-latin)", fontWeight: 900,
              fontSize: "1.85rem", color: card.accent, lineHeight: 1,
            }}>
              {card.value}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#bbb", marginTop: "5px" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Header ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "1.25rem", gap: "10px",
      }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "1.05rem", color: "#111", marginBottom: "2px" }}>المنتجات</h1>
          <p style={{ color: "#999", fontSize: "0.8rem" }}>{total} منتج مضاف للمتجر</p>
        </div>
        <Link href="/admin/products/new" style={{
          display: "inline-flex", alignItems: "center", gap: "7px",
          background: "#111", color: "white",
          borderRadius: "10px", padding: "0 1.125rem", height: "38px",
          textDecoration: "none", fontWeight: 700, fontSize: "0.8rem",
          boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
          whiteSpace: "nowrap",
        }}>
          + <span className="admin-topbar-label">إضافة منتج جديد</span>
          <span style={{ display: "none" }} className="mobile-show-plus">إضافة</span>
        </Link>
      </div>

      {/* ── Products Grid ── */}
      {!products || products.length === 0 ? (
        <div style={{
          background: "white", padding: "5rem 2rem", textAlign: "center",
          borderRadius: "16px", border: "2px dashed #E0E0DA",
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.35 }}>🛍️</div>
          <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.5rem", color: "#333" }}>
            لا توجد منتجات حالياً
          </h3>
          <p style={{ color: "#aaa", marginBottom: "1.5rem", fontSize: "0.88rem" }}>
            ابدأ بإضافة أول منتج لمتجرك لتبدأ في تلقي الطلبات.
          </p>
          <Link href="/admin/products/new" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "#111", color: "white",
            padding: "10px 24px", borderRadius: "10px",
            textDecoration: "none", fontWeight: 800, fontSize: "0.88rem",
          }}>
            إضافة منتج الآن
          </Link>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(clamp(150px, 44vw, 260px), 1fr))",
          gap: "clamp(0.75rem, 3vw, 1.125rem)",
        }}>
          {products.map(product => {
            const mainImage =
              product.product_images?.find((img: any) => img.is_primary)?.image_url
              || product.product_images?.[0]?.image_url
              || null;

            const stock = product.product_variants?.reduce(
              (s: number, v: any) => s + (v.stock_quantity || 0), 0
            ) || 0;

            const isLow     = stock > 0 && stock < 10;
            const isOut     = stock === 0;
            const stockColor = isOut ? "#ef4444" : isLow ? "#f59e0b" : "#22c55e";

            return (
              <div key={product.id} style={{
                background: "white", borderRadius: "14px", overflow: "hidden",
                border: "1px solid #EAEAE5",
                boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
                display: "flex", flexDirection: "column",
                transition: "box-shadow 0.2s, transform 0.2s",
              }}>
                {/* Image */}
                <div style={{ aspectRatio: "4/3", background: "#F5F5F0", position: "relative", overflow: "hidden" }}>
                  {mainImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={mainImage} alt={product.name_ar}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: "100%", height: "100%", display: "flex",
                      alignItems: "center", justifyContent: "center",
                      color: "#ddd", fontSize: "2rem",
                    }}>
                      📷
                    </div>
                  )}

                  {/* Badges */}
                  <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                    {!product.is_visible && (
                      <span style={{
                        background: "rgba(15,15,15,0.7)", color: "white",
                        padding: "2px 9px", borderRadius: "99px",
                        fontSize: "0.68rem", fontWeight: 700, backdropFilter: "blur(4px)",
                      }}>
                        مخفي
                      </span>
                    )}
                    {isOut && (
                      <span style={{
                        background: "rgba(220,38,38,0.85)", color: "white",
                        padding: "2px 9px", borderRadius: "99px",
                        fontSize: "0.68rem", fontWeight: 700, backdropFilter: "blur(4px)",
                      }}>
                        نفد المخزون
                      </span>
                    )}
                    {isLow && (
                      <span style={{
                        background: "rgba(245,158,11,0.88)", color: "white",
                        padding: "2px 9px", borderRadius: "99px",
                        fontSize: "0.68rem", fontWeight: 700, backdropFilter: "blur(4px)",
                      }}>
                        مخزون منخفض
                      </span>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding: "1rem", display: "flex", flexDirection: "column", flex: 1, gap: "0.4rem" }}>
                  <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111", lineHeight: 1.3 }}>
                    {product.name_ar}
                  </h3>
                  {product.name_fr && (
                    <p className="font-latin" style={{ fontSize: "0.76rem", color: "#bbb" }}>
                      {product.name_fr}
                    </p>
                  )}

                  <div style={{
                    fontFamily: "var(--font-latin)", fontWeight: 900,
                    color: "var(--gold)", fontSize: "0.95rem", marginTop: "2px",
                  }}>
                    {product.price.toLocaleString()} DZD
                  </div>

                  {/* Stock row */}
                  <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    marginTop: "auto", paddingTop: "0.75rem",
                    borderTop: "1px solid #F0F0EB", fontSize: "0.76rem",
                  }}>
                    <span style={{ color: "#888" }}>
                      المخزون:{" "}
                      <strong style={{ color: stockColor }}>{stock}</strong>
                    </span>
                    <span style={{ color: "#888" }}>
                      الأنواع: <strong style={{ color: "#333" }}>{product.product_variants?.length || 0}</strong>
                    </span>
                  </div>

                  {/* Stock bar */}
                  <div style={{ height: "3px", background: "#F0F0EB", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "99px",
                      width: `${Math.min((stock / 100) * 100, 100)}%`,
                      background: stockColor,
                      transition: "width 0.3s",
                    }} />
                  </div>

                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    style={{
                      marginTop: "0.625rem", display: "flex", alignItems: "center",
                      justifyContent: "center", gap: "6px",
                      background: "#111", color: "white",
                      borderRadius: "9px", padding: "8px",
                      textDecoration: "none", fontWeight: 700, fontSize: "0.82rem",
                      transition: "opacity 0.15s",
                    }}
                  >
                    تعديل المنتج
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
