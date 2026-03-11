"use client";

import Link from "next/link";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBrowserClient } from "@/lib/supabase/client";

interface UploadedImage {
  id?: string;
  url: string;
  name?: string;
  isUploading: boolean;
  isDeleted?: boolean;
}

interface VariantProps {
  id: string;
  db_id?: string;
  color_name_ar: string;
  color_hex: string;
  stock_quantity: number;
  isDeleted?: boolean;
}

const sectionStyle: React.CSSProperties = {
  background: "white", borderRadius: "16px",
  border: "1px solid #e8e8e3",
  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
  overflow: "hidden",
};

const sectionHeadStyle: React.CSSProperties = {
  padding: "1rem 1.5rem",
  borderBottom: "1px solid #f0f0eb",
  background: "#fafaf7",
  display: "flex", alignItems: "center", gap: "10px",
};

const sectionBodyStyle: React.CSSProperties = {
  padding: "1.5rem",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontWeight: 700, fontSize: "0.85rem",
  color: "#333", marginBottom: "7px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", height: "46px", padding: "0 12px",
  border: "2px solid #e8e8e3", borderRadius: "10px",
  outline: "none", fontSize: "0.95rem",
  fontFamily: "var(--font-arabic)",
  background: "white", transition: "border-color 0.2s",
  color: "#111",
};

export default function EditProductForm({ initialProduct }: { initialProduct: any }) {
  const router = useRouter();
  const supabase = createBrowserClient();
  const tempProductId = useRef(initialProduct.id);

  const [form, setForm] = useState({
    name_ar: initialProduct.name_ar || "",
    name_fr: initialProduct.name_fr || "",
    slug: initialProduct.slug || "",
    price: initialProduct.price?.toString() || "",
    description_ar: initialProduct.description_ar || "",
    is_visible: initialProduct.is_visible ?? true,
  });

  const [images, setImages] = useState<UploadedImage[]>(
    (initialProduct.product_images || []).map((img: any) => ({
      id: img.id, url: img.image_url, isUploading: false,
    }))
  );

  const [variants, setVariants] = useState<VariantProps[]>(
    (initialProduct.product_variants || []).map((v: any) => ({
      id: v.id, db_id: v.id,
      color_name_ar: v.color_name_ar || "",
      color_hex: v.color_hex || "#000000",
      stock_quantity: v.stock_quantity || 0,
    }))
  );

  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNameFrChange = (val: string) => {
    setForm(f => ({
      ...f, name_fr: val,
      slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    }));
  };

  const uploadFile = useCallback(async (file: File) => {
    const ext = file.name.split(".").pop();
    const fileName = `product_${tempProductId.current}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const placeholder: UploadedImage = { url: URL.createObjectURL(file), name: file.name, isUploading: true };
    setImages(prev => [...prev, placeholder]);

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false, contentType: file.type });

    if (error) {
      toast.error(`فشل رفع الصورة: ${error.message}`);
      setImages(prev => prev.filter(img => img !== placeholder));
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(data.path);
    setImages(prev => prev.map(img => img === placeholder ? { ...img, url: publicUrl, isUploading: false } : img));
  }, [supabase]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(f => { if (f.type.startsWith("image/")) uploadFile(f); });
  };

  const addVariant = () => {
    setVariants(prev => [...prev, { id: crypto.randomUUID(), color_name_ar: "أسود", color_hex: "#000000", stock_quantity: 100 }]);
  };

  const updateVariant = (id: string, key: keyof VariantProps, val: any) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [key]: val } : v));
  };

  const removeVariant = (id: string) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, isDeleted: true } : v));
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.map((img, i) => i === index ? { ...img, isDeleted: true } : img));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (images.some(img => img.isUploading)) return toast.error("يرجى الانتظار حتى يكتمل رفع الصور");
    if (!form.name_ar || !form.price || !form.slug) return toast.error("يرجى ملء الحقول الأساسية");

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${initialProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          images: images.filter(img => !img.isDeleted).map(img => ({ id: img.id, url: img.url })),
          variants: variants.filter(v => !v.isDeleted || v.db_id),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ غير معروف");

      toast.success("تم تحديث المنتج بنجاح ✅");
      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${initialProduct.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل الحذف");
      toast.success("تم حذف المنتج بنجاح");
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const activeImages = images.filter(img => !img.isDeleted);
  const activeVariants = variants.filter(v => !v.isDeleted);

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", background: "#f5f5f0" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.75rem" }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: "1.4rem", color: "#111", marginBottom: "4px" }}>
              ✏️ تعديل المنتج
            </h1>
            <p style={{ color: "#888", fontSize: "0.85rem" }}>
              {initialProduct.name_ar}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link
              href={`/product/${initialProduct.slug}`}
              target="_blank"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "10px",
                border: "1px solid #e8e8e3", background: "white",
                color: "#666", textDecoration: "none",
                fontSize: "0.82rem", fontWeight: 600,
              }}
            >
              🔗 عرض المنتج
            </Link>
            <Link
              href="/admin/products"
              style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "8px 14px", borderRadius: "10px",
                border: "1px solid #e8e8e3", background: "white",
                color: "#666", textDecoration: "none",
                fontSize: "0.82rem", fontWeight: 600,
              }}
            >
              ← العودة
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* ── 1. Basic Info ── */}
          <div style={sectionStyle}>
            <div style={sectionHeadStyle}>
              <span style={{ fontSize: "1.1rem" }}>📝</span>
              <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111" }}>المعلومات الأساسية</h3>
            </div>
            <div style={sectionBodyStyle}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>الاسم بالعربية <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    required style={inputStyle}
                    value={form.name_ar}
                    onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))}
                    placeholder="مثال: ترمس حراري"
                  />
                </div>
                <div>
                  <label style={labelStyle}>الاسم بالفرنسية</label>
                  <input
                    style={{ ...inputStyle, fontFamily: "var(--font-latin)", direction: "ltr" }}
                    value={form.name_fr}
                    onChange={e => handleNameFrChange(e.target.value)}
                    placeholder="Ex: Thermos Isotherme"
                  />
                </div>
                <div>
                  <label style={labelStyle}>السعر (DZD) <span style={{ color: "#ef4444" }}>*</span></label>
                  <input
                    required type="number"
                    style={{ ...inputStyle, fontFamily: "var(--font-latin)", direction: "ltr" }}
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="4500"
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <label style={labelStyle}>
                    رابط المنتج (Slug) <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    required
                    style={{ ...inputStyle, fontFamily: "var(--font-latin)", direction: "ltr", background: "#f8f8f5", color: "#666" }}
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="thermos-isotherme"
                  />
                </div>
              </div>
              <div style={{ marginTop: "1rem" }}>
                <label style={labelStyle}>الوصف بالعربية</label>
                <textarea
                  style={{ ...inputStyle, height: "auto", minHeight: "104px", padding: "12px", resize: "vertical", lineHeight: 1.6 }}
                  value={form.description_ar}
                  onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))}
                  placeholder="أدخل تفاصيل ومواصفات المنتج..."
                />
              </div>
            </div>
          </div>

          {/* ── 2. Images ── */}
          <div style={sectionStyle}>
            <div style={sectionHeadStyle}>
              <span style={{ fontSize: "1.1rem" }}>🖼️</span>
              <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111" }}>صور المنتج</h3>
              <span style={{ fontSize: "0.75rem", color: "#aaa", marginRight: "auto" }}>
                {activeImages.length} صورة — الأولى هي الرئيسية
              </span>
            </div>
            <div style={sectionBodyStyle}>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => document.getElementById("fileInput")?.click()}
                style={{
                  padding: "2rem", textAlign: "center",
                  border: `2px dashed ${dragging ? "#F5C518" : "#ddd"}`,
                  borderRadius: "12px",
                  background: dragging ? "rgba(245,197,24,0.06)" : "#fafaf7",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📸</div>
                <p style={{ fontWeight: 700, color: "#888", fontSize: "0.88rem" }}>
                  اسحب صوراً جديدة هنا، أو <span style={{ color: "#F5C518" }}>انقر للاختيار</span>
                </p>
                <input id="fileInput" type="file" accept="image/*" multiple hidden onChange={e => handleFiles(e.target.files)} />
              </div>

              {/* Image grid */}
              {activeImages.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px", marginTop: "1.25rem" }}>
                  {images.map((img, i) => {
                    if (img.isDeleted) return null;
                    const isFirst = i === images.findIndex(im => !im.isDeleted);
                    return (
                      <div key={i} style={{
                        aspectRatio: "1/1", borderRadius: "12px",
                        border: `2px solid ${isFirst ? "var(--gold)" : "#e8e8e3"}`,
                        overflow: "hidden", position: "relative",
                      }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt="Product" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        {img.isUploading && (
                          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.25rem" }}>
                            ⏳
                          </div>
                        )}
                        {isFirst && (
                          <span style={{
                            position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)",
                            background: "var(--gold)", fontSize: "0.6rem", fontWeight: 800,
                            padding: "2px 8px", borderRadius: "99px", whiteSpace: "nowrap",
                          }}>
                            رئيسية
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={{
                            position: "absolute", top: "5px", right: "5px",
                            background: "rgba(220,38,38,0.85)", color: "white",
                            border: "none", width: "22px", height: "22px",
                            borderRadius: "50%", display: "flex", alignItems: "center",
                            justifyContent: "center", cursor: "pointer",
                            fontSize: "13px", fontWeight: "bold",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── 3. Variants ── */}
          <div style={sectionStyle}>
            <div style={sectionHeadStyle}>
              <span style={{ fontSize: "1.1rem" }}>🎨</span>
              <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111" }}>الألوان والمتغيرات</h3>
              <span style={{ fontSize: "0.75rem", color: "#aaa", marginRight: "auto" }}>{activeVariants.length} لون</span>
              <button
                type="button"
                onClick={addVariant}
                style={{
                  background: "#111", color: "white", border: "none",
                  padding: "6px 14px", borderRadius: "8px",
                  fontWeight: 700, cursor: "pointer",
                  fontFamily: "var(--font-arabic)", fontSize: "0.82rem",
                }}
              >
                + إضافة لون
              </button>
            </div>
            <div style={sectionBodyStyle}>
              {activeVariants.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "2rem", color: "#bbb",
                  border: "1px dashed #e8e8e3", borderRadius: "10px", fontSize: "0.88rem",
                }}>
                  لا توجد متغيرات مضافة حالياً
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 56px 120px 46px", gap: "8px", paddingBottom: "4px" }}>
                    {["اسم اللون", "اللون", "الكمية", ""].map(h => (
                      <div key={h} style={{ fontSize: "0.72rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.04em" }}>{h}</div>
                    ))}
                  </div>
                  {variants.map(v => {
                    if (v.isDeleted) return null;
                    return (
                      <div key={v.id} style={{
                        display: "grid", gridTemplateColumns: "1fr 56px 120px 46px",
                        gap: "8px", alignItems: "center",
                        background: "#fafaf7", padding: "10px 12px",
                        borderRadius: "12px", border: "1px solid #e8e8e3",
                      }}>
                        <input
                          style={{ ...inputStyle, height: "40px" }}
                          value={v.color_name_ar}
                          onChange={e => updateVariant(v.id, "color_name_ar", e.target.value)}
                          placeholder="مثال: أسود"
                        />
                        <div style={{ position: "relative", height: "40px", borderRadius: "8px", overflow: "hidden", border: "2px solid #e8e8e3" }}>
                          <input
                            type="color"
                            style={{ position: "absolute", inset: "-4px", width: "calc(100% + 8px)", height: "calc(100% + 8px)", border: "none", cursor: "pointer", background: "none", padding: 0 }}
                            value={v.color_hex}
                            onChange={e => updateVariant(v.id, "color_hex", e.target.value)}
                          />
                        </div>
                        <input
                          type="number"
                          style={{ ...inputStyle, height: "40px", fontFamily: "var(--font-latin)", direction: "ltr" }}
                          value={v.stock_quantity}
                          onChange={e => updateVariant(v.id, "stock_quantity", Number(e.target.value))}
                          placeholder="الكمية"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariant(v.id)}
                          style={{
                            width: "40px", height: "40px", borderRadius: "10px",
                            background: "#fef2f2", color: "#dc2626",
                            border: "1px solid #fee2e2", cursor: "pointer", fontSize: "1.25rem",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── 4. Visibility ── */}
          <div style={{
            ...sectionStyle,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "1.2rem" }}>{form.is_visible ? "👁️" : "🙈"}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#111" }}>
                  {form.is_visible ? "المنتج مرئي للعملاء" : "المنتج مخفي عن العملاء"}
                </div>
                <div style={{ fontSize: "0.77rem", color: "#999", marginTop: "2px" }}>
                  {form.is_visible ? "يظهر في المتجر ويمكن طلبه" : "لن يظهر في المتجر حتى تعيد تفعيله"}
                </div>
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input
                type="checkbox"
                id="isVisible"
                checked={form.is_visible}
                onChange={e => setForm(f => ({ ...f, is_visible: e.target.checked }))}
                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#F5C518" }}
              />
              <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#555" }}>
                {form.is_visible ? "إخفاء" : "إظهار"}
              </span>
            </label>
          </div>

          {/* ── Action buttons (sticky) ── */}
          <div style={{
            position: "sticky", bottom: "1.5rem", zIndex: 10,
            display: "flex", gap: "10px",
          }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, height: "54px", borderRadius: "14px",
                background: loading ? "#ddd" : "var(--gold)",
                color: loading ? "#999" : "var(--black)",
                fontSize: "1rem", fontWeight: 900, border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s", fontFamily: "var(--font-arabic)",
                boxShadow: loading ? "none" : "0 4px 16px rgba(245,197,24,0.35)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              }}
            >
              {loading ? "⏳ جاري الحفظ..." : "💾 حفظ التغييرات"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              style={{
                width: "54px", height: "54px", borderRadius: "14px",
                background: "white", color: "#dc2626",
                border: "2px solid #fee2e2", cursor: loading ? "not-allowed" : "pointer",
                fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
              title="حذف المنتج"
            >
              🗑️
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
