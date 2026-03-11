"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { createBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface UploadedImage {
  url: string;
  name: string;
  isUploading: boolean;
}

export default function UploadImagesPage() {
  const [productId, setProductId] = useState("bbbbbbbb-0000-0000-0000-000000000001");
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const supabase = createBrowserClient();

  const uploadFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop();
    const fileName = `product_${productId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    // Add as uploading placeholder
    const placeholder: UploadedImage = { url: URL.createObjectURL(file), name: file.name, isUploading: true };
    setImages(prev => [...prev, placeholder]);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { cacheControl: "3600", upsert: false, contentType: file.type });

    if (error) {
      toast.error(`فشل الرفع: ${error.message}`);
      setImages(prev => prev.filter(img => img !== placeholder));
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(data.path);

    // Save to product_images table
    const { error: dbError } = await supabase
      .from("product_images")
      .insert({ product_id: productId, image_url: publicUrl, is_primary: false, sort_order: 99 });

    if (dbError) {
      toast.error(`خطأ في قاعدة البيانات: ${dbError.message}`);
    } else {
      toast.success("تم رفع الصورة بنجاح ✅");
      setImages(prev => prev.map(img => img === placeholder ? { ...img, url: publicUrl, isUploading: false } : img));
    }
  }, [productId, supabase]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(f => {
      if (f.type.startsWith("image/")) uploadFile(f);
    });
  };

  return (
    <main style={{ minHeight: "100vh", background: "var(--offwhite)", padding: "2rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.5rem" }}>📤 رفع صور المنتجات</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>ارفع الصور مباشرة إلى Supabase Storage وسيتم ربطها بالمنتج</p>

        <div style={{ background: "white", borderRadius: "20px", padding: "1.5rem", border: "1px solid var(--border)", marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: 700, marginBottom: "6px" }}>معرّف المنتج (Product ID)</label>
          <input
            className="input-field font-latin"
            dir="ltr"
            value={productId}
            onChange={e => setProductId(e.target.value)}
            placeholder="UUID of product"
          />
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "6px" }}>
            ترمس حراري: bbbbbbbb-0000-0000-0000-000000000001
          </p>
        </div>

        {/* Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => document.getElementById("fileInput")?.click()}
          style={{
            border: `2px dashed ${dragging ? "var(--gold)" : "var(--border)"}`,
            borderRadius: "20px",
            padding: "4rem 2rem",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "rgba(245,197,24,0.05)" : "white",
            transition: "all 0.2s",
            marginBottom: "2rem",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🖼️</div>
          <h3 style={{ fontWeight: 700, fontSize: "1.2rem", marginBottom: "0.5rem" }}>اسحب وأفلت الصور هنا</h3>
          <p style={{ color: "var(--text-muted)" }}>أو انقر للاختيار من جهازك</p>
          <input id="fileInput" type="file" accept="image/*" multiple hidden onChange={e => handleFiles(e.target.files)} />
        </div>

        {/* Uploaded Images Grid */}
        {images.length > 0 && (
          <div>
            <h3 style={{ fontWeight: 800, marginBottom: "1rem", fontSize: "1.1rem" }}>الصور المرفوعة ({images.length})</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
              {images.map((img, i) => (
                <div key={i} style={{ position: "relative", borderRadius: "14px", overflow: "hidden", border: "2px solid var(--border)", aspectRatio: "1/1", background: "var(--gray-soft)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {img.isUploading && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.5rem" }}>
                      ⏳
                    </div>
                  )}
                  {!img.isUploading && (
                    <div style={{ position: "absolute", top: "8px", right: "8px", background: "var(--gold)", borderRadius: "99px", padding: "2px 8px", fontSize: "0.75rem", fontWeight: 700 }}>
                      ✅
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: "2rem", background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.4)", borderRadius: "12px", padding: "1rem 1.25rem", fontSize: "0.9rem" }}>
          <strong>💡 تعليمات:</strong> بعد الرفع، الصور تُحفظ تلقائياً في Supabase Storage وتُضاف للجدول product_images. 
          لجعل صورة رئيسية، انتقل إلى Supabase Dashboard وغيّر <code>is_primary</code> إلى <code>true</code>.
        </div>
      </div>
    </main>
  );
}
