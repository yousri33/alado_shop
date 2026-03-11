import { createAdminClient } from "@/lib/supabase/server";
import OrderRow from "./order-row";

export const revalidate = 0;

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, product:products(name_ar, slug)")
    .order("created_at", { ascending: false })
    .limit(200);

  const stats = {
    total:     orders?.length || 0,
    new:       orders?.filter((o: any) => o.status === "new").length || 0,
    confirmed: orders?.filter((o: any) => o.status === "confirmed").length || 0,
    delivered: orders?.filter((o: any) => o.status === "delivered").length || 0,
    revenue:   orders?.filter((o: any) => o.status === "delivered").reduce((s: number, o: any) => s + Number(o.total_price || 0), 0) || 0,
  };

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", background: "#f5f5f0" }}>

      {/* ── KPI CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "إجمالي الطلبات", value: stats.total,                         icon: "📦", accent: "#6366f1", sub: "كل الطلبات" },
          { label: "طلبات جديدة",    value: stats.new,                            icon: "🆕", accent: "#f59e0b", sub: "بانتظار التأكيد" },
          { label: "تم التأكيد",     value: stats.confirmed,                      icon: "✅", accent: "#8b5cf6", sub: "قيد المعالجة" },
          { label: "تم التسليم",     value: stats.delivered,                      icon: "🎉", accent: "#22c55e", sub: "مكتملة بنجاح" },
          { label: "الإيرادات",      value: `${stats.revenue.toLocaleString()}`,  icon: "💰", accent: "#F5C518", sub: "DZD • طلبات مُسلَّمة" },
        ].map(card => (
          <div key={card.label} style={{
            background: "white", borderRadius: "16px", padding: "1.25rem 1.5rem",
            border: "1px solid #e8e8e3", position: "relative", overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          }}>
            {/* Accent left border */}
            <div style={{ position: "absolute", top: 0, right: 0, width: "4px", height: "100%", background: card.accent, borderRadius: "0 16px 16px 0" }} />
            <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>{card.icon}</div>
            <div style={{ fontFamily: "var(--font-latin)", fontWeight: 900, fontSize: "1.7rem", color: card.accent, lineHeight: 1 }}>
              {card.value}
            </div>
            <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#111", marginTop: "6px" }}>{card.label}</div>
            <div style={{ fontSize: "0.73rem", color: "#999", marginTop: "2px" }}>{card.sub}</div>
          </div>
        ))}
      </div>

      {/* ── TABLE HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "1.2rem", color: "#111", marginBottom: "2px" }}>قائمة الطلبات</h1>
          <p style={{ color: "#888", fontSize: "0.82rem" }}>
            {stats.total} طلب إجمالاً — {stats.new} بانتظار المتابعة
          </p>
        </div>

        {/* Status filter pills */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { key: "new", label: "جديدة", count: stats.new, color: "#3b82f6" },
            { key: "delivered", label: "مُسلَّمة", count: stats.delivered, color: "#22c55e" },
          ].map(f => (
            <span key={f.key} style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              background: "white", border: "1px solid #e8e8e3",
              borderRadius: "99px", padding: "4px 12px",
              fontSize: "0.78rem", fontWeight: 700, color: "#444",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: f.color, display: "inline-block" }} />
              {f.label}
              <span style={{ fontFamily: "var(--font-latin)", fontWeight: 900, color: f.color }}>({f.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── TABLE ── */}
      <div style={{ background: "white", borderRadius: "18px", border: "1px solid #e8e8e3", overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>

        {/* Head */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr 140px 100px 100px 150px 130px",
          padding: "0.75rem 1.5rem",
          background: "#f8f8f5",
          borderBottom: "1px solid #e8e8e3",
          fontSize: "0.72rem", color: "#888",
          fontWeight: 800, letterSpacing: "0.06em",
          textTransform: "uppercase", fontFamily: "var(--font-latin)",
        }}>
          <div>#</div>
          <div>العميل / المنتج</div>
          <div>الولاية</div>
          <div>التوصيل</div>
          <div>المجموع</div>
          <div>تحديث الحالة</div>
          <div style={{ textAlign: "left" }}>التاريخ</div>
        </div>

        {/* Body */}
        {!orders || orders.length === 0 ? (
          <div style={{ padding: "5rem 2rem", textAlign: "center", color: "#aaa" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
            <p style={{ fontWeight: 700, fontSize: "1rem" }}>لا توجد طلبات بعد</p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>ستظهر الطلبات هنا بمجرد أن يبدأ العملاء بالشراء</p>
          </div>
        ) : (
          orders.map((order, idx) => (
            <OrderRow key={order.id} order={order} idx={idx} length={orders.length} />
          ))
        )}
      </div>

      <p style={{ textAlign: "center", color: "#bbb", fontSize: "0.75rem", marginTop: "1.5rem", fontFamily: "var(--font-latin)" }}>
        Alado Shop Admin · Showing latest {Math.min(200, stats.total)} orders
      </p>
    </div>
  );
}
