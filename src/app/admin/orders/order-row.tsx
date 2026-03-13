"use client";

import { useState } from "react";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  new:        { label: "جديد",         color: "#2563eb", bg: "#EFF6FF", dot: "#3b82f6" },
  confirmed:  { label: "تم التأكيد",   color: "#7c3aed", bg: "#F5F3FF", dot: "#8b5cf6" },
  processing: { label: "قيد المعالجة", color: "#d97706", bg: "#FFFBEB", dot: "#f59e0b" },
  shipped:    { label: "تم الشحن",     color: "#059669", bg: "#ECFDF5", dot: "#10b981" },
  delivered:  { label: "تم التسليم",   color: "#16a34a", bg: "#DCFCE7", dot: "#22c55e" },
  cancelled:  { label: "ملغي",         color: "#dc2626", bg: "#FEF2F2", dot: "#ef4444" },
  returned:   { label: "مُعاد",         color: "#9f1239", bg: "#FFF1F2", dot: "#e11d48" },
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
      if (!res.ok) throw new Error();
      setStatus(newStatus);
      toast.success("تم تحديث حالة الطلب");
    } catch {
      toast.error("خطأ في تحديث الحالة");
    } finally {
      setUpdating(false);
    }
  };

  const date = new Date(order.created_at);
  const dateStr = date.toLocaleDateString("ar-DZ", { day: "2-digit", month: "short" });
  const timeStr = date.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" });

  const borderStyle = isNew ? "3px solid var(--gold)" : "3px solid transparent";

  // ── Status Select ──────────────────────────────────────────
  const StatusSelect = (
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
          border: `1.5px solid ${cfg.color}33`,
          borderRadius: "10px",
          padding: "7px 30px 7px 10px",
          fontSize: "0.78rem",
          fontWeight: 800,
          cursor: updating ? "wait" : "pointer",
          outline: "none",
          fontFamily: "var(--font-arabic)",
        }}
      >
        {Object.entries(STATUS_CONFIG).map(([key, item]) => (
          <option key={key} value={key} style={{ color: "black", background: "white" }}>
            {item.label}
          </option>
        ))}
      </select>
      {/* Status dot */}
      <div style={{
        position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)",
        width: "7px", height: "7px", borderRadius: "50%",
        background: updating ? "transparent" : cfg.dot,
        border: updating ? `1.5px solid ${cfg.dot}` : "none",
        animation: updating ? "spin 0.6s linear infinite" : "none",
        pointerEvents: "none",
      }} />
    </div>
  );

  // ── Desktop Table Row ──────────────────────────────────────
  const DesktopRow = (
    <div
      className="admin-order-desktop"
      style={{
        padding: "0.875rem 1.25rem",
        borderBottom: idx < length - 1 ? "1px solid #F2F2EF" : "none",
        alignItems: "center",
        background: isNew ? "rgba(245,197,24,0.025)" : "white",
        borderRight: borderStyle,
        transition: "background 0.15s",
      }}
    >
      {/* # */}
      <div>
        <span style={{ fontFamily: "var(--font-latin)", fontSize: "0.7rem", color: "#ccc", fontWeight: 700 }}>
          #{(idx + 1).toString().padStart(3, "0")}
        </span>
      </div>

      {/* Customer + Product */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#111", marginBottom: "2px" }}>
          {order.full_name || order.phone}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#aaa", marginBottom: "8px" }}>{order.phone}</div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          background: "#F5F5F2", padding: "5px 9px", borderRadius: "8px",
        }}>
          <span style={{ fontSize: "0.82rem", color: "#333", fontWeight: 700 }}>
            {order.product_name}
          </span>
          <span style={{
            fontSize: "0.65rem", background: "#111", color: "white",
            padding: "1px 5px", borderRadius: "4px", fontWeight: 800,
            fontFamily: "var(--font-latin)",
          }}>
            ×{order.quantity || 1}
          </span>
          {order.variant_details && (
            <span style={{ fontSize: "0.68rem", color: "#888" }}>· {order.variant_details}</span>
          )}
        </div>
      </div>

      {/* Wilaya */}
      <div>
        <div style={{ fontSize: "0.8rem", color: "#333", fontWeight: 700 }}>{order.wilaya_name}</div>
        <div style={{ fontSize: "0.68rem", color: "#aaa", marginTop: "2px" }}>{order.commune_name || "—"}</div>
      </div>

      {/* Delivery */}
      <div>
        <span style={{
          fontSize: "0.7rem",
          background: order.delivery_type === "home" ? "#EFF6FF" : "#F0FDF4",
          color:      order.delivery_type === "home" ? "#2563eb" : "#16a34a",
          padding: "3px 9px", borderRadius: "99px", fontWeight: 800,
        }}>
          {order.delivery_type === "home" ? "منزل" : "مكتب"}
        </span>
      </div>

      {/* Total */}
      <div>
        <div style={{ fontFamily: "var(--font-latin)", fontWeight: 900, fontSize: "0.88rem", color: "#111" }}>
          {Number(order.total_price || 0).toLocaleString()}
        </div>
        <div style={{ fontSize: "0.6rem", color: "#bbb" }}>DZD</div>
      </div>

      {/* Status */}
      {StatusSelect}

      {/* Date */}
      <div style={{ textAlign: "left" }}>
        <div style={{ fontWeight: 700, fontSize: "0.75rem", color: "#555" }}>{dateStr}</div>
        <div style={{ fontSize: "0.65rem", color: "#bbb", fontFamily: "var(--font-latin)", marginTop: "2px" }}>{timeStr}</div>
      </div>
    </div>
  );

  // ── Mobile Card ────────────────────────────────────────────
  const MobileCard = (
    <div
      className="admin-order-mobile"
      style={{
        borderBottom: idx < length - 1 ? "1px solid #F0F0EB" : "none",
        borderRight: borderStyle,
        background: isNew ? "rgba(245,197,24,0.025)" : "white",
        padding: "1rem",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      {/* Top row: name + status badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111" }}>
            {order.full_name || order.phone}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#aaa", marginTop: "2px" }}>{order.phone}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
          <span style={{
            fontSize: "0.68rem", fontWeight: 800,
            background: cfg.bg, color: cfg.color,
            padding: "2px 9px", borderRadius: "99px",
            border: `1px solid ${cfg.color}22`,
          }}>
            {cfg.label}
          </span>
          <span style={{ fontSize: "0.65rem", color: "#ccc", fontFamily: "var(--font-latin)" }}>
            #{(idx + 1).toString().padStart(3, "0")}
          </span>
        </div>
      </div>

      {/* Product info */}
      <div style={{
        background: "#F8F8F5", borderRadius: "10px", padding: "9px 11px",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px",
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#222", marginBottom: "3px" }}>
            {order.product_name}
          </div>
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{
              fontSize: "0.65rem", background: "#111", color: "white",
              padding: "1px 5px", borderRadius: "4px", fontWeight: 800,
              fontFamily: "var(--font-latin)",
            }}>×{order.quantity || 1}</span>
            {order.variant_details && (
              <span style={{ fontSize: "0.68rem", color: "#888" }}>{order.variant_details}</span>
            )}
          </div>
        </div>
        <div style={{ textAlign: "left", flexShrink: 0 }}>
          <div style={{ fontFamily: "var(--font-latin)", fontWeight: 900, fontSize: "1rem", color: "#111" }}>
            {Number(order.total_price || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: "0.6rem", color: "#aaa" }}>DZD</div>
        </div>
      </div>

      {/* Location row */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "#555", fontWeight: 600 }}>
          {order.wilaya_name}
          {order.commune_name ? ` · ${order.commune_name}` : ""}
        </span>
        <span style={{
          fontSize: "0.68rem",
          background: order.delivery_type === "home" ? "#EFF6FF" : "#F0FDF4",
          color:      order.delivery_type === "home" ? "#2563eb" : "#16a34a",
          padding: "2px 8px", borderRadius: "99px", fontWeight: 800,
        }}>
          {order.delivery_type === "home" ? "منزل" : "مكتب"}
        </span>
        <span style={{ marginRight: "auto", fontSize: "0.68rem", color: "#bbb", fontFamily: "var(--font-latin)" }}>
          {dateStr} {timeStr}
        </span>
      </div>

      {/* Status select */}
      {StatusSelect}
    </div>
  );

  return (
    <>
      {DesktopRow}
      {MobileCard}
    </>
  );
}
