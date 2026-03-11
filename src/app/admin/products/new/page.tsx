"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createBrowserClient } from "@/lib/supabase/client";

interface UploadedImage {
  url: string;
  name: string;
  isUploading: boolean;
}

interface VariantProps {
  id: string;
  color_name_ar: string;
  color_hex: string;
  stock_quantity: number;
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

export default function AddProductPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const tempProductId = useRef("");

  useEffect(() => {
    tempProductId.current = crypto.randomUUID();
  }, []);

  const [form, setForm] = useState({
    name_ar: "",
    name_fr: "",
    slug: "",
    price: "",
    description_ar: "",
  });

  const [images, setImages] = useState<UploadedImage[]>([]);
  const [variants, setVariants] = useState<VariantProps[]>([]);
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
    setVariants(prev => prev.filter(v => v.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.some(img => img.isUploading)) return toast.error("يرجى الانتظار حتى يكتمل رفع الصور");
    if (!form.name_ar || !form.price || !form.slug) return toast.error("يرجى ملء الحقول الأساسية");

    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, price: Number(form.price),
          images: images.map(img => img.url),
          variants,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "حدث خطأ غير معروف");

      toast.success("تمت إضافة المنتج بنجاح ✅");
      router.push("/admin/products");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", minHeight: "100vh", background: "#f5f5f0" }}>
      <div style={{ maxWidth: "820px", margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontWeight: 900, fontSize: "1.4rem", color: "#111", marginBottom: "4px" }}>
            ✨ إضافة منتج جديد
          </h1>
          <p style={{ color: "#888", fontSize: "0.85rem" }}>أضف منتجاً جديداً لمتجرك — سيظهر فوراً بعد الحفظ</p>
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
                <div>
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
                <div>
                  <label style={labelStyle}>
                    رابط المنتج (Slug) <span style={{ color: "#ef4444" }}>*</span>
                    <span style={{ fontWeight: 400, color: "#aaa", marginRight: "4px", fontFamily: "var(--font-latin)", fontSize: "0.75rem" }}>
                      — يُولَّد تلقائياً
                    </span>
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
                  style={{ ...inputStyle, height: "auto", minHeight: "96px", padding: "12px", resize: "vertical", lineHeight: 1.6 }}
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
              <span style={{ fontSize: "0.75rem", color: "#aaa", marginRight: "auto" }}>الصورة الأولى ستكون الرئيسية</span>
            </div>
            <div style={sectionBodyStyle}>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => document.getElementById("fileInput")?.click()}
                style={{
                  padding: "2.5rem 2rem", textAlign: "center",
                  border: `2px dashed ${dragging ? "#F5C518" : "#ddd"}`,
                  borderRadius: "12px",
                  background: dragging ? "rgba(245,197,24,0.06)" : "#fafaf7",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: "2.25rem", marginBottom: "0.75rem" }}>📸</div>
                <p style={{ fontWeight: 700, color: "#666", fontSize: "0.9rem" }}>
                  اسحب وأفلت الصور هنا، أو <span style={{ color: "#F5C518" }}>انقر للاختيار</span>
                </p>
                <p style={{ fontSize: "0.78rem", color: "#bbb", marginTop: "4px" }}>PNG, JPG, WEBP — حجم أقصى 10MB</p>
                <input id="fileInput" type="file" accept="image/*" multiple hidden onChange={e => handleFiles(e.target.files)} />
              </div>

              {/* Uploaded previews */}
              {images.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px", marginTop: "1.25rem" }}>
                  {images.map((img, i) => (
                    <div key={i} style={{
                      aspectRatio: "1/1", borderRadius: "12px",
                      border: `2px solid ${i === 0 ? "var(--gold)" : "#e8e8e3"}`,
                      overflow: "hidden", position: "relative",
                    }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt="Uploaded" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {img.isUploading && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.25rem" }}>
                          ⏳
                        </div>
                      )}
                      {i === 0 && (
                        <span style={{
                          position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)",
                          background: "var(--gold)", fontSize: "0.6rem", fontWeight: 800,
                          padding: "2px 8px", borderRadius: "99px", whiteSpace: "nowrap",
                        }}>
                          رئيسية
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── 3. Variants ── */}
          <div style={sectionStyle}>
            <div style={sectionHeadStyle}>
              <span style={{ fontSize: "1.1rem" }}>🎨</span>
              <h3 style={{ fontWeight: 800, fontSize: "0.95rem", color: "#111" }}>الألوان والمتغيرات</h3>
              <span style={{ fontSize: "0.75rem", color: "#aaa", marginRight: "auto" }}>{variants.length} لون مضاف</span>
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
              {variants.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "2rem", color: "#bbb",
                  border: "1px dashed #e8e8e3", borderRadius: "10px", fontSize: "0.88rem",
                }}>
                  لا توجد متغيرات — المنتج سيُباع بدون خيارات للألوان
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {/* Header labels */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 56px 120px 46px", gap: "8px", paddingBottom: "4px" }}>
                    {["اسم اللون", "اللون", "الكمية", ""].map(h => (
                      <div key={h} style={{ fontSize: "0.72rem", fontWeight: 700, color: "#aaa", letterSpacing: "0.04em" }}>{h}</div>
                    ))}
                  </div>
                  {variants.map(v => (
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
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Submit ── */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", height: "56px", borderRadius: "14px",
              background: loading ? "#ccc" : "var(--gold)",
              color: loading ? "#999" : "var(--black)",
              fontSize: "1.05rem", fontWeight: 900, border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s", fontFamily: "var(--font-arabic)",
              boxShadow: loading ? "none" : "0 4px 16px rgba(245,197,24,0.35)",
            }}
          >
            {loading ? "⏳ جاري الحفظ..." : "🚀 حفظ المنتج ونشره"}
          </button>

        </form>
      </div>
    </div>
  );
}
