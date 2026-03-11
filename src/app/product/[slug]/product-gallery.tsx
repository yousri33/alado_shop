"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: { image_url: string; is_primary: boolean; sort_order: number }[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const sorted = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.sort_order - b.sort_order);
  const [activeImage, setActiveImage] = useState(sorted[0]?.image_url);

  if (!sorted.length) return (
    <div style={{ position: "relative", aspectRatio: "4/3", borderRadius: "20px", overflow: "hidden", background: "white", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "5rem" }}>
      📦
    </div>
  );

  return (
    <div className="product-gallery">
      {/* Main Image */}
      <div style={{ 
        position: "relative", 
        aspectRatio: "1/1", 
        borderRadius: "20px", 
        overflow: "hidden", 
        background: "white", 
        border: "1px solid var(--border)", 
        boxShadow: "var(--shadow-md)", 
        marginBottom: "1rem" 
      }}>
        <Image 
          src={activeImage} 
          alt={productName} 
          fill 
          style={{ objectFit: "contain", padding: "1.5rem" }} 
          priority 
        />
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div style={{ 
          display: "flex", 
          gap: "10px", 
          overflowX: "auto", 
          paddingBottom: "8px",
          scrollbarWidth: "none"
        }}>
          {sorted.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(img.image_url)}
              style={{
                position: "relative",
                width: "72px",
                height: "72px",
                flexShrink: 0,
                borderRadius: "12px",
                overflow: "hidden",
                border: `3px solid ${activeImage === img.image_url ? "var(--gold)" : "transparent"}`,
                boxShadow: activeImage === img.image_url ? "var(--shadow-gold)" : "none",
                transition: "all 0.2s ease",
                padding: 0,
                cursor: "pointer",
                background: "white"
              }}
            >
              <Image src={img.image_url} alt="" fill style={{ objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}

      <style>{`
        .product-gallery div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
