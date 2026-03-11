import Image from "next/image";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/server";

export const revalidate = 60;

export default async function Home() {
  const supabase = createAdminClient();

  const { data: products } = await supabase
    .from("products")
    .select(`id, name_ar, name_fr, slug, price, description_ar, product_images(image_url, is_primary)`)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  const displayProducts = products || [];

  return (
    <main style={{ minHeight: "100vh", background: "var(--offwhite)" }}>

      {/* ═══ ANNOUNCEMENT BAR ═══ */}
      <div className="announcement-bar">
        <div className="loop-container">
          {[1,2,3,4,5,6,7,8,9,10].map(i => (
            <div key={i} className="loop-item">
              <span>🚚 توصيل سريع لـ 58 ولاية</span>
              <span style={{ opacity: 0.3 }}>•</span>
              <span>💵 الدفع عند الاستلام</span>
              <span style={{ opacity: 0.3 }}>•</span>
              <span>⭐ جودة مضمونة 100%</span>
              <span style={{ opacity: 0.3 }}>•</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ HEADER ═══ */}
      <header className="site-header">
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", gap: "10px" }}>
          <div style={{ position: "relative", width: "95px", height: "36px" }}>
            <Image 
              src="/alado logo.png" 
              alt="Alado Shop" 
              fill
              style={{ objectFit: "contain" }} 
              priority 
            />
          </div>
          <span className="hide-on-mobile" style={{ fontSize: "0.68rem", fontWeight: 900, color: "var(--gold-dark)", background: "rgba(245,197,24,0.1)", padding: "2px 8px", borderRadius: "6px" }}>OFFICIEL</span>
        </Link>

        {/* Desktop Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "px" }}>
          <Link href="/" className="nav-link active">الرئيسية</Link>
          <Link href="/products" className="nav-link">المنتجات</Link>
          <Link href="/track" className="nav-link hide-on-mobile">تتبع طلبك</Link>
        </nav>

        {/* Action Button */}
        <a 
          href="tel:+213550000000" 
          className="btn-gold" 
          style={{ 
            height: "40px", 
            padding: "0 1.25rem", 
            fontSize: "0.85rem", 
            borderRadius: "12px", 
            textDecoration: "none", 
            display: "inline-flex", 
            alignItems: "center", 
            gap: "8px",
            boxShadow: "0 3px 10px rgba(245,197,24,0.2)"
          }}
        >
          <span style={{ fontSize: "1rem" }}>📞</span>
          <span className="hide-on-mobile" style={{ fontWeight: 800 }}>اتصل بنا</span>
        </a>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="hero-bg-pattern" style={{ position: "relative", overflow: "hidden", padding: "4rem 1.5rem 5rem" }}>
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: "-180px", left: "-180px", width: "640px", height: "640px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,197,24,0.11) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ position: "absolute", bottom: "-120px", right: "-100px", width: "480px", height: "480px", borderRadius: "50%", background: "radial-gradient(circle, rgba(245,197,24,0.06) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

        <div className="hero-content-wrapper" style={{ maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 400px", gap: "4rem", alignItems: "center", position: "relative", zIndex: 1 }}>

          {/* ── Text column ── */}
          <div>
            {/* Live badge */}
            <div className="animate-fade-up" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: "rgba(245,197,24,0.12)", border: "1px solid rgba(245,197,24,0.3)",
              borderRadius: "99px", padding: "6px 16px", marginBottom: "1.75rem",
              fontSize: "0.88rem", fontWeight: 700, color: "var(--black)",
            }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }} className="animate-pulse-gold" />
              توصيل لـ 58 ولاية جزائرية 🇩🇿
            </div>

            <h1 className="animate-fade-up delay-100" style={{
              fontSize: "clamp(2.6rem, 5vw, 3.75rem)", fontWeight: 900, lineHeight: 1.12,
              color: "var(--black)", marginBottom: "1.5rem",
            }}>
              جودة تستحق<br />
              <span style={{
                background: "linear-gradient(120deg, var(--gold-dark) 0%, var(--gold) 45%, var(--gold-light) 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                الثقة والاختيار
              </span>
            </h1>

            <p className="font-latin animate-fade-up delay-200" style={{
              fontSize: "1.05rem", color: "var(--text-muted)", marginBottom: "2.5rem", lineHeight: 1.8,
            }}>
              Commandez en toute confiance depuis chez vous.<br />
              Livraison rapide partout en Algérie — Paiement à la livraison 🚀
            </p>

            <div className="animate-fade-up delay-300" style={{ display: "flex", gap: "0.875rem", flexWrap: "wrap", marginBottom: "3rem" }}>
              <Link href="/products" className="btn-primary" style={{ textDecoration: "none", height: "52px", padding: "0 2rem", fontSize: "1rem", gap: "8px", display: "inline-flex", alignItems: "center" }}>
                تسوق الآن ←
              </Link>
              <Link href="#products" style={{
                textDecoration: "none", height: "52px", padding: "0 1.75rem",
                display: "inline-flex", alignItems: "center",
                border: "2px solid var(--border)", borderRadius: "var(--radius)",
                fontFamily: "var(--font-arabic)", fontWeight: 700, color: "var(--black)",
                fontSize: "1rem", background: "white", transition: "all 0.2s",
              }}>
                اكتشف المنتجات
              </Link>
            </div>

            {/* Stats row */}
            <div className="animate-fade-up delay-400" style={{
              display: "inline-flex", background: "white", borderRadius: "var(--radius)",
              border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden",
            }}>
              {[["+500", "طلب ناجح"], ["+58", "ولاية"], ["100%", "دفع آمن"]].map(([val, label], i) => (
                <div key={label} style={{
                  padding: "1rem 1.75rem", textAlign: "center",
                  borderLeft: i > 0 ? "1px solid var(--border)" : "none",
                }}>
                  <div className="font-latin" style={{ fontSize: "1.65rem", fontWeight: 900, color: "var(--black)", lineHeight: 1 }}>{val}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, marginTop: "5px" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Hero image ── */}
          <div className="animate-slide-in delay-200" style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <div className="animate-spin-slow" style={{ position: "absolute", inset: "-32px", borderRadius: "50%", border: "2px dashed rgba(245,197,24,0.28)" }} />
              <div style={{ position: "absolute", inset: "-12px", borderRadius: "50%", border: "4px solid rgba(245,197,24,0.1)" }} />
              <div className="animate-float" style={{
                width: "360px", height: "360px", borderRadius: "50%", overflow: "hidden",
                background: "white", position: "relative",
                boxShadow: "0 28px 80px rgba(0,0,0,0.14), 0 0 0 10px rgba(245,197,24,0.08)",
              }}>
                {displayProducts[0] ? (
                  <Image
                    src={
                      (displayProducts[0].product_images as { image_url: string; is_primary: boolean }[])?.find(img => img.is_primary)?.image_url
                      || (displayProducts[0].product_images as { image_url: string }[])?.[0]?.image_url
                      || "/alado logo.png"
                    }
                    alt={displayProducts[0].name_ar}
                    fill style={{ objectFit: "cover" }} priority
                  />
                ) : (
                  <Image src="/alado logo.png" alt="Alado" fill style={{ objectFit: "contain", padding: "2.5rem" }} priority />
                )}
              </div>

              {/* Floating trust badge */}
              <div style={{
                position: "absolute", bottom: "20px", left: "-24px",
                background: "white", borderRadius: "14px", padding: "10px 16px",
                boxShadow: "0 8px 28px rgba(0,0,0,0.12)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: "8px",
              }}>
                <span style={{ fontSize: "1.25rem" }}>💵</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "0.78rem", color: "var(--black)" }}>الدفع عند الاستلام</div>
                  <div className="font-latin" style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Cash on delivery</div>
                </div>
              </div>

              {/* Floating rating badge */}
              <div style={{
                position: "absolute", top: "24px", left: "-20px",
                background: "var(--gold)", borderRadius: "12px", padding: "8px 14px",
                boxShadow: "var(--shadow-gold)",
                display: "flex", alignItems: "center", gap: "6px",
              }}>
                <span style={{ fontSize: "1rem" }}>⭐</span>
                <span style={{ fontWeight: 900, fontSize: "0.82rem", color: "var(--black)" }}>4.9 / 5</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ GUARANTEE STRIP ═══ */}
      <div style={{ background: "var(--black)", borderTop: "3px solid var(--gold)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {[
            ["🚚", "توصيل سريع", "Livraison rapide 3–7 jours"],
            ["💵", "الدفع عند الاستلام", "Paiement à la livraison"],
            ["🔄", "ضمان الاستبدال", "Garantie échange"],
          ].map(([icon, ar, fr], i) => (
            <div key={ar} style={{
              display: "flex", alignItems: "center", gap: "1rem",
              padding: "1.5rem 2rem",
              borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
            }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: "rgba(245,197,24,0.14)", display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "1.25rem", flexShrink: 0,
              }}>
                {icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "white" }}>{ar}</div>
                <div className="font-latin" style={{ fontSize: "0.77rem", color: "rgba(255,255,255,0.38)", marginTop: "3px" }}>{fr}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ CATEGORIES ═══ */}
      {categories && categories.length > 0 && (
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "4rem 1.5rem 0" }}>
          <div style={{ display: "flex", gap: "0.75rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
            <button style={{
              flexShrink: 0, padding: "0.55rem 1.4rem", borderRadius: "99px",
              background: "var(--black)", color: "white", border: "none",
              fontFamily: "var(--font-arabic)", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem",
            }}>
              الكل
            </button>
            {categories.map(cat => (
              <button key={cat.id} style={{
                flexShrink: 0, padding: "0.55rem 1.4rem", borderRadius: "99px",
                background: "white", color: "var(--black)", border: "2px solid var(--border)",
                fontFamily: "var(--font-arabic)", fontWeight: 600, cursor: "pointer",
                fontSize: "0.9rem", transition: "all 0.2s",
              }}>
                {cat.name_ar}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ═══ PRODUCTS GRID ═══ */}
      <section id="products" style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem 1.5rem 6rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem" }}>
          <div>
            <h2 className="section-title">أحدث المنتجات</h2>
            <p style={{ color: "var(--text-muted)", marginTop: "0.75rem", fontSize: "0.92rem" }}>
              اختر ما يناسبك وأكمل طلبك في خطوات بسيطة
            </p>
          </div>
          <Link href="/products" style={{ fontWeight: 700, color: "var(--black)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px", fontSize: "0.92rem" }}>
            عرض الكل ←
          </Link>
        </div>

        {displayProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem", background: "white", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "3.5rem", marginBottom: "1.25rem" }}>📦</div>
            <h3 style={{ color: "var(--text-muted)", fontSize: "1.15rem", fontWeight: 700 }}>لا توجد منتجات حالياً</h3>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.75rem" }}>
            {displayProducts.map((product, idx) => {
              const images = product.product_images as { image_url: string; is_primary: boolean }[];
              const primaryImage = images?.find(img => img.is_primary)?.image_url || images?.[0]?.image_url;
              return (
                <Link
                  href={`/product/${product.slug}`}
                  key={product.id}
                  style={{ textDecoration: "none", color: "inherit" }}
                  className={`animate-fade-up delay-${(idx % 4) * 100}`}
                >
                  <div 
                    className="product-card" 
                    style={{ 
                      padding: "1.5rem", 
                      textAlign: "center",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Image Container */}
                    <div style={{ flexShrink: 0 }}>
                      <div
                        className="product-img-circle"
                        style={{
                          position: "relative", width: "170px", height: "170px",
                          borderRadius: "50%", overflow: "hidden", background: "var(--gray-soft)",
                          margin: "0 auto 1.25rem",
                          border: "3px solid var(--border)", transition: "border-color 0.3s, box-shadow 0.3s",
                        }}
                      >
                        {primaryImage ? (
                          <Image src={primaryImage} alt={product.name_ar} fill className="product-img" style={{ objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.75rem" }}>📦</div>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span className="badge badge-gold" style={{ fontSize: "0.7rem", marginBottom: "0.4rem" }}>جديد ✨</span>
                      
                      {/* Name & Desc area with min-height to keep cards aligned */}
                      <div style={{ flex: 1, minHeight: "100px", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem" }}>
                        <h3 style={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.35 }}>{product.name_ar}</h3>
                        {product.name_fr && (
                          <p className="font-latin" style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{product.name_fr}</p>
                        )}
                        <p style={{
                          fontSize: "0.84rem", color: "var(--text-muted)", lineHeight: 1.55,
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {product.description_ar || "منتج عالي الجودة من ألادو ستور"}
                        </p>
                      </div>

                      {/* Price row - stays at bottom */}
                      <div style={{
                        marginTop: "1.25rem", paddingTop: "0.75rem",
                        borderTop: "1px solid var(--border)", width: "100%",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <div style={{ textAlign: "right" }}>
                          <span className="font-latin" style={{ fontWeight: 900, fontSize: "1.25rem", color: "var(--black)" }}>
                            {product.price.toLocaleString()}
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginRight: "3px" }}> DZD</span>
                        </div>
                        <div style={{
                          width: "38px", height: "38px", borderRadius: "50%",
                          background: "var(--gold)", display: "flex", alignItems: "center",
                          justifyContent: "center", flexShrink: 0, boxShadow: "var(--shadow-gold)",
                          transition: "transform 0.2s",
                        }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                            <path d="M3 6h18" />
                            <path d="M16 10a4 4 0 0 1-8 0" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section style={{ background: "var(--black)", color: "white", padding: "5.5rem 1.5rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(245,197,24,0.1) 0%, transparent 65%)" }} />
        {/* Top decorative line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "600px", margin: "0 auto" }}>
          <div className="badge badge-gold" style={{ marginBottom: "1.5rem", fontSize: "0.92rem", letterSpacing: "0.02em" }}>عرض محدود ⚡</div>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 900, marginBottom: "1.25rem", lineHeight: 1.2 }}>
            اطلب الآن واستفد من<br />
            <span style={{ color: "var(--gold)" }}>أسعار الإطلاق</span>
          </h2>
          <p className="font-latin" style={{ color: "rgba(255,255,255,0.48)", marginBottom: "2.5rem", fontSize: "1rem", lineHeight: 1.75 }}>
            Limited stock available. Order before they run out!
          </p>
          <Link
            href={displayProducts[0] ? `/product/${displayProducts[0].slug}` : "/products"}
            className="btn-gold"
            style={{ textDecoration: "none", fontSize: "1.05rem", padding: "0 2.5rem", height: "56px", borderRadius: "14px", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            اطلب الآن 🛒
          </Link>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "6rem 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 className="section-title" style={{ margin: "0 auto" }}>كيف يعمل المتجر؟</h2>
          <p style={{ color: "var(--text-muted)", marginTop: "0.75rem", fontSize: "0.92rem" }}>خطوات بسيطة للحصول على طلبك</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {[
            ["1", "🔍", "اختر المنتج", "تصفح مجموعتنا وابحث عن ما يناسبك"],
            ["2", "📝", "أكمل الطلب", "أدخل معلوماتك وحدد ولايتك للتوصيل"],
            ["3", "✅", "تأكيد الطلب", "سيتواصل معك فريقنا لتأكيد الطلب هاتفياً"],
            ["4", "📦", "استلم طلبك", "الدفع عند الاستلام فقط — بأمان تام"],
          ].map(([step, icon, title, desc], i) => (
            <div
              key={step}
              className={`animate-fade-up delay-${i * 100}`}
              style={{
                background: "white", borderRadius: "var(--radius-lg)",
                padding: "2.25rem 1.75rem",
                border: "1px solid var(--border)", textAlign: "center",
                position: "relative", transition: "all 0.3s ease",
              }}
            >
              {/* Step number */}
              <div style={{
                position: "absolute", top: "-18px", right: "50%", transform: "translateX(50%)",
                width: "36px", height: "36px", borderRadius: "50%",
                background: "var(--gold)", color: "var(--black)",
                fontWeight: 900, fontSize: "0.95rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-latin)", boxShadow: "var(--shadow-gold)",
              }}>
                {step}
              </div>
              <div style={{ fontSize: "2.75rem", marginTop: "0.5rem", marginBottom: "1.25rem" }}>{icon}</div>
              <h3 style={{ fontWeight: 800, fontSize: "1.05rem", marginBottom: "0.75rem" }}>{title}</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.87rem", lineHeight: 1.7 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: "#111", color: "white", paddingTop: "4rem", borderTop: "4px solid var(--gold)" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem 3rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "3rem" }}>
          <div>
            <Image src="/alado logo.png" alt="Alado" width={130} height={52} style={{ objectFit: "contain", filter: "brightness(0) invert(1)", marginBottom: "1.25rem" }} />
            <p style={{ color: "rgba(255,255,255,0.42)", lineHeight: 1.8, fontSize: "0.87rem" }}>
              متجر ألادو ستور – أفضل المنتجات بأسعار منافسة مع توصيل سريع لجميع ولايات الجزائر.
            </p>
          </div>
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: "1.25rem", color: "var(--gold)", fontSize: "0.9rem", letterSpacing: "0.02em" }}>روابط سريعة</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[["/", "الرئيسية"], ["/products", "المنتجات"], ["/track", "تتبع طلبي"], ["/admin", "لوحة التحكم"]].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} style={{ color: "rgba(255,255,255,0.42)", textDecoration: "none", fontSize: "0.9rem", transition: "color 0.2s" }}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ fontWeight: 800, marginBottom: "1.25rem", color: "var(--gold)", fontSize: "0.9rem", letterSpacing: "0.02em" }}>تواصل معنا</h4>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.88rem" }}>
              <li>
                <a href="mailto:support@aladoshop.dz" className="font-latin" style={{ color: "rgba(255,255,255,0.42)", textDecoration: "none" }}>
                  ✉️ support@aladoshop.dz
                </a>
              </li>
              <li>
                <a href="tel:+213550000000" className="font-latin" style={{ color: "rgba(255,255,255,0.42)", textDecoration: "none" }}>
                  📞 +213 550 00 00 00
                </a>
              </li>
              <li style={{ color: "rgba(255,255,255,0.42)" }}>📍 الجزائر العاصمة 🇩🇿</li>
            </ul>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "1.5rem", textAlign: "center", color: "rgba(255,255,255,0.28)", fontSize: "0.82rem" }}>
          <span className="font-latin">© 2026 Alado Shop. All rights reserved. Made with ❤️ in Algeria</span>
        </div>
      </footer>

    </main>
  );
}
