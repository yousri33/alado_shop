import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  if (!id) notFound();

  const supabase = createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, product:products(name_ar, name_fr, slug)")
    .eq("id", id)
    .single();

  const phone = order?.phone || "—";
  const productName = (order?.product as { name_ar: string } | null)?.name_ar || "المنتج";
  const subtotal = (order?.unit_price || 0) * (order?.quantity || 1);
  const totalPrice = order?.total_price || (subtotal + (order?.delivery_price || 0));
  const wilaya = order?.wilaya_name || order?.wilaya_id || "—";
  const deliveryType = order?.delivery_type === "home" ? "توصيل للمنزل 🏠" : "نقطة استلام 🏢";
  const orderId = order?.id?.slice(0, 8).toUpperCase() || id?.slice(0, 8).toUpperCase();

  return (
    <main style={{ minHeight: "100vh", background: "var(--offwhite)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>

      {/* Confetti-style top decoration */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "6px", background: "linear-gradient(135deg, var(--gold) 0%, #FFD84D 50%, var(--gold) 100%)" }} />

      <div style={{ maxWidth: "560px", width: "100%", textAlign: "center" }}>

        {/* Success Icon */}
        <div style={{ position: "relative", display: "inline-block", marginBottom: "2rem" }}>
          <div style={{
            width: "120px", height: "120px", borderRadius: "50%",
            background: "linear-gradient(135deg, #22c55e, #16a34a)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "3.5rem", margin: "0 auto",
            boxShadow: "0 8px 32px rgba(34,197,94,0.35)",
            animation: "fadeInUp 0.5s ease both",
          }}>
            ✅
          </div>
          {/* Gold ring */}
          <div style={{
            position: "absolute", inset: "-8px", borderRadius: "50%",
            border: "3px solid rgba(245,197,24,0.4)",
            animation: "pulse-gold 2s ease infinite",
          }} />
        </div>

        {/* Heading */}
        <h1 className="animate-fade-up delay-100" style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--black)", marginBottom: "0.75rem" }}>
          تم استلام طلبك! 🎉
        </h1>
        <p className="animate-fade-up delay-200 font-latin" style={{ color: "var(--text-muted)", marginBottom: "2.5rem", fontSize: "1.05rem" }}>
          Votre commande a été reçue avec succès.<br />
          Nous vous contacterons bientôt pour confirmation.
        </p>

        {/* Order Info Card */}
        <div className="animate-fade-up delay-300" style={{
          background: "white", borderRadius: "24px", border: "1px solid var(--border)",
          padding: "2rem", textAlign: "right", marginBottom: "2rem",
          boxShadow: "var(--shadow-md)",
        }}>
          {/* Order ID badge */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid var(--border)" }}>
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>ملخص الطلب</span>
            <span style={{
              background: "var(--black)", color: "var(--gold)",
              fontFamily: "var(--font-latin)", fontWeight: 900, fontSize: "0.85rem",
              padding: "4px 14px", borderRadius: "99px", letterSpacing: "0.1em",
            }}>
              #{orderId}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            {[
              ["📦 المنتج", productName],
              ["🔢 الكمية", order?.quantity || 1],
              ["📞 الهاتف", phone],
              ["📍 الولاية والبلدية", `${typeof wilaya === "number" ? `الولاية ${wilaya}` : wilaya}${order?.commune_name ? `، ${order.commune_name}` : ''}`],
              ["🚚 التوصيل", deliveryType],
              ["💰 سعر المنتج", `${subtotal.toLocaleString()} DZD`],
              ["🚚 رسوم التوصيل", `+${(order?.delivery_price || 0).toLocaleString()} DZD`],
            ].map(([label, value]) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.95rem" }}>
                <span style={{ fontWeight: 700, color: "var(--black)" }}>{label}</span>
                <span className={label.includes("الهاتف") || typeof value === 'number' ? "font-latin" : ""} style={{ color: "var(--text-muted)" }}>{value}</span>
              </div>
            ))}
            <div style={{ paddingTop: "1rem", borderTop: "2px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 900, fontSize: "1.15rem" }}>💳 المجموع الكلي</span>
              <span className="font-latin" style={{ fontWeight: 900, fontSize: "1.3rem", color: "var(--black)" }}>
                {totalPrice.toLocaleString()} DZD
              </span>
            </div>
          </div>

        </div>

        {/* Info box */}
        <div className="animate-fade-up delay-400" style={{
          background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.4)",
          borderRadius: "14px", padding: "1.25rem 1.5rem",
          marginBottom: "2.5rem", fontSize: "0.95rem", lineHeight: "1.75",
        }}>
          <strong>⏳ ما يحدث الآن:</strong><br />
          سيتصل بك فريقنا على الرقم <strong className="font-latin">{phone}</strong> في أقرب وقت لتأكيد طلبك وتحديد موعد التوصيل.
          <br />الدفع يكون عند الاستلام فقط 💵
        </div>

        {/* Actions */}
        <div className="animate-fade-up delay-500" style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" className="btn-primary" style={{ textDecoration: "none", fontSize: "1rem" }}>
            ← العودة للرئيسية
          </Link>
          <Link href="/products" style={{
            textDecoration: "none", height: "54px", padding: "0 1.5rem",
            borderRadius: "var(--radius)", border: "2px solid var(--border)",
            display: "inline-flex", alignItems: "center", fontFamily: "var(--font-arabic)",
            fontWeight: 700, color: "var(--black)", fontSize: "1rem", background: "white",
            transition: "all 0.2s",
          }}>
            تسوق أكثر 🛍️
          </Link>
        </div>

      </div>
    </main>
  );
}
