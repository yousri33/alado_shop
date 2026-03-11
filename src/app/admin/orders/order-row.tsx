"use client";

import { useState } from "react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  new:        { label: "جديد",          color: "#2563eb", bg: "#eff6ff", dot: "#3b82f6" },
  confirmed:  { label: "تم التأكيد",    color: "#7c3aed", bg: "#f5f3ff", dot: "#8b5cf6" },
  processing: { label: "قيد المعالجة",  color: "#d97706", bg: "#fffbeb", dot: "#f59e0b" },
  shipped:    { label: "تم الشحن",      color: "#059669", bg: "#ecfdf5", dot: "#10b981" },
  delivered:  { label: "تم التسليم",    color: "#16a34a", bg: "#dcfce7", dot: "#22c55e" },
  cancelled:  { label: "ملغي",          color: "#dc2626", bg: "#fef2f2", dot: "#ef4444" },
  returned:   { label: "مُعاد",          color: "#9f1239", bg: "#fff1f2", dot: "#e11d48" },
};

export default function OrderRow({ order, idx, length }: any) {
  const [status, setStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);
  
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  const isNew = status === "new";

  const updateStatus = async (newStatus: string) => {
    if (newStatus === status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setStatus(newStatus);
      toast.success("تم تحديث حالة الطلب");
    } catch (err) {
      toast.error("خطأ في تحديث الحالة");
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const date = new Date(order.created_at);
  const dateStr = date.toLocaleDateString("ar-DZ", { day: "2-digit", month: "short" });
  const timeStr = date.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "48px 1fr 140px 100px 100px 150px 130px",
        padding: "0.9rem 1.5rem",
        borderBottom: idx < length - 1 ? "1px solid #f0f0eb" : "none",
        alignItems: "center",
        background: isNew ? "rgba(245,197,24,0.03)" : "white",
        transition: "background 0.15s",
        borderRight: isNew ? "3px solid var(--gold)" : "3px solid transparent",
      }}
    >
      {/* # */}
      <div>
        <span style={{ fontFamily: "var(--font-latin)", fontSize: "0.72rem", color: "#bbb", fontWeight: 700 }}>
          #{(idx + 1).toString().padStart(3, "0")}
        </span>
      </div>

      {/* Customer + Product + Variant */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "#111", marginBottom: "2px", display: "flex", alignItems: "center", gap: "5px" }}>
          {order.full_name || order.phone}
          <span style={{ fontSize: "0.7rem", color: "#888", fontWeight: 400 }}>({order.phone})</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.75rem", color: "#F5C518", fontWeight: 700 }}>{order.product_name}</span>
          <span style={{ fontSize: "0.75rem", background: "rgba(0,0,0,0.05)", padding: "1px 6px", borderRadius: "4px", color: "var(--black)", fontWeight: 800 }}>
            ×{order.quantity || 1}
          </span>
          {order.variant_details && (
            <>
              <span style={{ color: "#ddd", fontSize: "0.7rem" }}>•</span>
              <span style={{ 
                fontSize: "0.7rem", 
                background: "#f1f1ec", 
                padding: "1px 6px", 
                borderRadius: "4px", 
                color: "#666",
                fontWeight: 600
              }}>
                🎨 {order.variant_details}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Wilaya / Commune */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: "0.8rem", color: "#444", fontWeight: 700 }}>
          {order.wilaya_name}
        </div>
        <div style={{ fontSize: "0.7rem", color: "#999" }}>
          {order.commune_name || "—"}
        </div>
      </div>

      {/* Delivery type */}
      <div>
        <span style={{
          fontSize: "0.7rem",
          background: order.delivery_type === "home" ? "#eff6ff" : "#f0fdf4",
          color: order.delivery_type === "home" ? "#2563eb" : "#16a34a",
          padding: "2px 8px", borderRadius: "99px", fontWeight: 800,
        }}>
          {order.delivery_type === "home" ? "🏠 منزل" : "🏢 مكتب"}
        </span>
      </div>

      {/* Total */}
      <div>
        <div style={{ fontFamily: "var(--font-latin)", fontWeight: 900, fontSize: "0.9rem", color: "#111" }}>
          {Number(order.total_price || 0).toLocaleString()}
        </div>
        <div style={{ fontSize: "0.6rem", color: "#aaa" }}>DZD</div>
      </div>

      {/* Status Select */}
      <div style={{ position: "relative" }}>
        <select
          value={status}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={updating}
          style={{
            width: "100%",
            appearance: "none",
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.color}33`,
            borderRadius: "99px",
            padding: "4px 28px 4px 12px",
            fontSize: "0.75rem",
            fontWeight: 800,
            cursor: updating ? "wait" : "pointer",
            outline: "none",
          }}
        >
          {Object.entries(STATUS_CONFIG).map(([key, item]) => (
            <option key={key} value={key} style={{ color: "black", background: "white" }}>
              {item.label}
            </option>
          ))}
        </select>
        <div style={{ 
          position: "absolute", 
          left: "10px", 
          top: "50%", 
          transform: "translateY(-50%)", 
          fontSize: "0.6rem",
          pointerEvents: "none",
          opacity: 0.5
        }}>
          ▼
        </div>
        <div style={{
          position: "absolute",
          right: "10px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: updating ? "transparent" : cfg.dot,
          border: updating ? "1px solid" : "none",
          animation: updating ? "spin 0.5s linear infinite" : "none"
        }} />
      </div>

      {/* Date */}
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: "0.8rem", color: "#555", fontWeight: 700 }}>{dateStr}</div>
        <div className="font-latin" style={{ fontSize: "0.65rem", color: "#aaa" }}>{timeStr}</div>
      </div>
    </div>
  );
}
