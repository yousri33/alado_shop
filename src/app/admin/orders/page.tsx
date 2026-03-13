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

  const kpiCards = [
    { label: "إجمالي الطلبات", value: stats.total,                        icon: "📦", accent: "#6366f1", sub: "كل الطلبات" },
    { label: "طلبات جديدة",    value: stats.new,                           icon: "🔔", accent: "#f59e0b", sub: "بانتظار التأكيد" },
    { label: "تم التأكيد",     value: stats.confirmed,                     icon: "✓",  accent: "#8b5cf6", sub: "قيد المعالجة", latin: true },
    { label: "تم التسليم",     value: stats.delivered,                     icon: "✓",  accent: "#22c55e", sub: "مكتملة", latin: true },
    { label: "الإيرادات",      value: stats.revenue.toLocaleString(),      icon: "＄", accent: "#F5C518", sub: "DZD • مُسلَّمة", latin: true },
  ];

  return (
    <div style={{ padding: "clamp(1rem, 4vw, 1.75rem)", minHeight: "100vh", background: "#F6F6F3" }}>

      {/* ── KPI Cards ── */}
      <div className="admin-kpi-grid" style={{ marginBottom: "1.75rem" }}>
        {kpiCards.map((card, i) => (
          <div
            key={card.label}
            className={i === kpiCards.length - 1 ? "admin-kpi-last-full" : ""}
            style={{
              background: "white", borderRadius: "14px",
              padding: "1.125rem 1.25rem",
              border: "1px solid #EAEAE5",
              boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
              position: "relative", overflow: "hidden",
            }}
          >
            {/* Accent top bar */}
            <div style={{
              position: "absolute", top: 0, right: 0, left: 0,
              height: "3px", background: card.accent, opacity: 0.75,
            }} />
            <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#999", marginBottom: "0.6rem", letterSpacing: "0.02em" }}>
              {card.label}
            </div>
            <div style={{
              fontFamily: "var(--font-latin)", fontWeight: 900,
              fontSize: "1.85rem", color: card.accent, lineHeight: 1,
            }}>
              {card.value}
            </div>
            <div style={{ fontSize: "0.7rem", color: "#bbb", marginTop: "5px", fontWeight: 500 }}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* ── Section Header ── */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: "1rem", gap: "10px", flexWrap: "wrap",
      }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: "1.05rem", color: "#111", marginBottom: "2px" }}>
            قائمة الطلبات
          </h1>
          <p style={{ color: "#999", fontSize: "0.8rem" }}>
            {stats.total} طلب —{" "}
            <span style={{ color: "#f59e0b", fontWeight: 700 }}>{stats.new} بانتظار المتابعة</span>
          </p>
        </div>

        {/* Status pills */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { label: "جديدة",    count: stats.new,       color: "#3b82f6", bg: "#EFF6FF" },
            { label: "مُسلَّمة", count: stats.delivered, color: "#22c55e", bg: "#F0FDF4" },
          ].map(f => (
            <span key={f.label} style={{
              display: "inline-flex", alignItems: "center", gap: "5px",
              background: f.bg, border: `1px solid ${f.color}22`,
              borderRadius: "99px", padding: "4px 12px",
              fontSize: "0.76rem", fontWeight: 700, color: f.color,
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: f.color, display: "inline-block" }} />
              {f.label}
              <span style={{ fontFamily: "var(--font-latin)", fontWeight: 900 }}>({f.count})</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div style={{
        background: "white", borderRadius: "16px",
        border: "1px solid #EAEAE5", overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
      }}>

        {/* Table Head (desktop only) */}
        <div
          className="admin-order-desktop admin-table-head"
          style={{
            padding: "0.65rem 1.25rem",
            background: "#FAFAF8",
            borderBottom: "1px solid #EAEAE5",
            fontSize: "0.68rem", color: "#aaa",
            fontWeight: 800, letterSpacing: "0.08em",
            textTransform: "uppercase", fontFamily: "var(--font-latin)",
            alignItems: "center",
          }}
        >
          <div>#</div>
          <div>العميل / المنتج</div>
          <div>الولاية</div>
          <div>التوصيل</div>
          <div>المجموع</div>
          <div>الحالة</div>
          <div style={{ textAlign: "left" }}>التاريخ</div>
        </div>

        {/* Body */}
        {!orders || orders.length === 0 ? (
          <div style={{ padding: "5rem 2rem", textAlign: "center", color: "#bbb" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem", opacity: 0.4 }}>📭</div>
            <p style={{ fontWeight: 700, fontSize: "1rem", color: "#888" }}>لا توجد طلبات بعد</p>
            <p style={{ fontSize: "0.82rem", marginTop: "0.5rem", color: "#bbb" }}>
              ستظهر الطلبات هنا بمجرد أن يبدأ العملاء بالشراء
            </p>
          </div>
        ) : (
          orders.map((order, idx) => (
            <OrderRow key={order.id} order={order} idx={idx} length={orders.length} />
          ))
        )}
      </div>

      <p style={{
        textAlign: "center", color: "#ccc", fontSize: "0.72rem",
        marginTop: "1.5rem", fontFamily: "var(--font-latin)",
      }}>
        Alado Admin · {Math.min(200, stats.total)} orders shown
      </p>
    </div>
  );
}
