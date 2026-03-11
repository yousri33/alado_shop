"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface AIImage {
  id: string;
  image_url: string;
  analysis: string;
  original_prompt: string;
  created_at: string;
}

interface Product {
  id: string;
  name_ar: string;
}

export default function AIPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const presets = {
    website: {
      id: "website",
      name: "Website Clean White",
      icon: "⚪",
      prompt: "You are a professional e-commerce photo editor. Take this product photo and enhance it: apply realistic studio lighting, remove the background and replace it with a pure white (#FFFFFF) background, upscale to 4K quality with sharp detail, add professional product shadows. Output a stunning website-ready product image."
    },
    pro: {
      id: "pro",
      name: "Pro Photo Shoot",
      icon: "💎",
      prompt: "You are a world-class luxury product photographer. Enhance this photo to look like a high-end magazine editorial: apply cinematic studio lighting, create a subtle depth of field with a premium neutral gradient background, enhance color vibrance and texture details, add realistic premium reflections and soft shadows. Output a professional 4K photo shoot version."
    },
    custom: {
      id: "custom",
      name: "Custom Edit",
      icon: "✍️",
      prompt: ""
    }
  };

  const [selectedPreset, setSelectedPreset] = useState("website");
  const [prompt, setPrompt] = useState(presets.website.prompt);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [history, setHistory] = useState<AIImage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductSelect, setShowProductSelect] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    "جارِ تحليل الألوان والتكوين...",
    "جارِ تطبيق الفلتر الخاص بـ Nano Bana...",
    "رفع الجودة إلى 4K...",
    "جارِ معالجة الإضاءة السينمائية...",
    "اللمسات النهائية للمنتج..."
  ];

  useEffect(() => {
    fetchHistory();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products/list");
      const data = await response.json();
      if (!data.error) setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const handleLinkToProduct = async (productId: string) => {
    if (!resultImage) return;
    setIsLinking(true);
    try {
      const response = await fetch("/api/ai/link-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, imageUrl: resultImage })
      });
      const data = await response.json();
      if (data.success) {
        alert("تم ربط الصورة بالمنتج بنجاح! 🎉");
        setShowProductSelect(false);
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Link failed:", err);
      alert("فشل في ربط الصورة بالمنتج.");
    } finally {
      setIsLinking(false);
    }
  };

  useEffect(() => {
    let interval: any;
    if (isProcessing) {
      let currentStep = 0;
      setProcessingStep(steps[0]);
      interval = setInterval(() => {
        currentStep = (currentStep + 1) % steps.length;
        setProcessingStep(steps[currentStep]);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/ai/images");
      const data = await response.json();
      if (!data.error) setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/ai/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: selectedImage, prompt })
      });

      const data = await response.json();

      if (data.error) {
        alert("Error: " + data.error);
      } else {
        setResultImage(data.image);
        setAiAnalysis(data.analysis);
        
        // Optimistic history update instead of full refetch
        if (data.id) {
          const newItem: AIImage = {
            id: data.id,
            image_url: data.image,
            analysis: data.analysis,
            original_prompt: prompt,
            created_at: new Date().toISOString()
          };
          setHistory(prev => [newItem, ...prev]);
        }
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error("AI Error:", error);
      alert("Failed to process image with Nano Bana AI.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    
    try {
      const response = await fetch("/api/ai/images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      if (data.success) {
        setHistory(prev => prev.filter(img => img.id !== id));
        if (resultImage && history.find(h => h.id === id)?.image_url === resultImage) {
          setResultImage(null);
          setAiAnalysis(null);
        }
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ 
        background: "white", 
        borderRadius: "20px", 
        padding: "2rem", 
        boxShadow: "0 10px 40px rgba(0,0,0,0.05)",
        border: "1px solid #e8e8e3"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "2rem" }}>
          <div style={{ 
            width: "50px", height: "50px", borderRadius: "14px", 
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", boxShadow: "0 5px 15px rgba(255,165,0,0.3)"
          }}>
            ✨
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "4px" }}>Nano Bana AI - Photographic Upscaler</h1>
            <p style={{ color: "rgba(0,0,0,0.4)", fontSize: "0.9rem", fontWeight: 600 }}>Convert simple photos to professional 4K e-commerce assets</p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: resultImage ? "1fr 1fr" : "1fr", gap: "2rem" }}>
          {/* Upload Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: "100%",
                aspectRatio: "1.5/1",
                border: "2px dashed #ddd",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
                background: "#fafafa",
                transition: "all 0.2s"
              }}
              onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
              onMouseOut={(e) => (e.currentTarget.style.borderColor = "#ddd")}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                style={{ display: "none" }} 
              />
              
              {selectedImage ? (
                <Image src={selectedImage} alt="Preview" fill style={{ objectFit: "contain" }} />
              ) : (
                <>
                  <span style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📸</span>
                  <span style={{ fontWeight: 800, color: "#666" }}>اسحب الصورة هنا أو اضغط للرفع</span>
                  <span style={{ fontSize: "0.8rem", color: "#999", marginTop: "5px" }}>Supports PNG, JPG (Max 5MB)</span>
                </>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <label style={{ fontWeight: 800, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>✍️</span> Choose Style Mode
              </label>
              
              <div style={{ display: "flex", gap: "8px", marginBottom: "5px" }}>
                {Object.values(presets).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPreset(p.id);
                      if (p.id !== "custom") setPrompt(p.prompt);
                    }}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: selectedPreset === p.id ? "var(--black)" : "#eee",
                      background: selectedPreset === p.id ? "var(--black)" : "white",
                      color: selectedPreset === p.id ? "white" : "#666",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      transition: "all 0.2s"
                    }}
                  >
                    <span>{p.icon}</span> {p.name}
                  </button>
                ))}
              </div>

              <textarea 
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  setSelectedPreset("custom");
                }}
                placeholder="Enter custom prompt here..."
                style={{
                  width: "100%",
                  height: "80px",
                  borderRadius: "12px",
                  border: "1px solid #ddd",
                  padding: "1rem",
                  fontSize: "0.9rem",
                  fontFamily: "inherit",
                  resize: "none",
                  outline: "none",
                }}
              />
            </div>

            <button
              onClick={handleProcess}
              disabled={!selectedImage || isProcessing}
              style={{
                width: "100%",
                height: "54px",
                borderRadius: "14px",
                background: isProcessing ? "#eee" : "var(--black)",
                color: isProcessing ? "#999" : "white",
                border: "none",
                fontWeight: 900,
                fontSize: "1rem",
                cursor: selectedImage && !isProcessing ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                transition: "all 0.2s"
              }}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin" style={{ width: "20px", height: "20px", border: "3px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ fontSize: "0.9rem" }}>{processingStep}</span>
                  </div>
                </>
              ) : (
                <>
                  <span>✨</span> معالجة وتحسين الصورة (4K Upscale)
                </>
              )}
            </button>
          </div>

          {/* Result Area */}
          {resultImage && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div style={{
                width: "100%",
                aspectRatio: "1.5/1",
                borderRadius: "16px",
                position: "relative",
                overflow: "hidden",
                background: "var(--black)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.15)"
              }}>
                <Image src={resultImage} alt="Result" fill style={{ objectFit: "contain" }} />
                <div style={{ 
                  position: "absolute", top: "12px", right: "12px", 
                  background: "var(--gold)", color: "var(--black)", 
                  padding: "4px 10px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 900
                }}>
                   WEBSITE READY 4K
                </div>
              </div>

              {aiAnalysis && (
                <div style={{ 
                  padding: "1rem", 
                  background: "#f8f9fa", 
                  borderRadius: "12px", 
                  fontSize: "0.85rem", 
                  lineHeight: 1.5,
                  border: "1px solid #eee"
                }}>
                  <div style={{ fontWeight: 800, marginBottom: "5px", color: "var(--black)" }}>✨ AI Enhancement Log:</div>
                  {aiAnalysis}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <a 
                  href={resultImage} 
                  download={`alado_ai_${Date.now()}.jpg`}
                  target="_blank"
                  style={{
                    height: "48px", borderRadius: "10px", border: "1px solid #ddd", background: "white",
                    fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", textDecoration: "none", color: "var(--black)"
                  }}
                >
                  ⬇️ تحميل الصورة
                </a>
                <button 
                  onClick={() => setShowProductSelect(true)}
                  style={{
                    height: "48px", borderRadius: "10px", border: "none", background: "var(--gold)", color: "var(--black)",
                    fontWeight: 800, fontSize: "0.85rem", cursor: "pointer"
                  }}
                >
                  ✅ حفظ للمنتجات
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{ 
          marginTop: "3rem", padding: "1.5rem", borderRadius: "14px", 
          background: "rgba(245,197,24,0.05)", border: "1px solid rgba(245,197,24,0.1)" 
        }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 800, marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>💡</span> Pro Tip
          </h3>
          <p style={{ fontSize: "0.85rem", color: "#666", lineHeight: 1.6 }}>
            Nano Bana works best with direct sunlight photos. Use the prompt to specify details like "realistic shadows" or "wooden background" to match your website's aesthetic perfectly.
          </p>
        </div>
      </div>

      {/* Product Linker Modal */}
      {showProductSelect && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(5px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "2rem"
        }}>
          <div style={{
            background: "white", borderRadius: "20px", width: "100%", maxWidth: "500px",
            maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column",
            boxShadow: "0 25px 50px rgba(0,0,0,0.2)"
          }}>
            <div style={{ padding: "1.5rem", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontWeight: 900, fontSize: "1.1rem" }}>اختر المنتج للربط</h3>
              <button onClick={() => setShowProductSelect(false)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ padding: "1rem", overflowY: "auto", flex: 1 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {products.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleLinkToProduct(p.id)}
                    disabled={isLinking}
                    style={{
                      padding: "12px 15px", borderRadius: "10px", border: "1px solid #eee",
                      background: "white", textAlign: "right", cursor: "pointer",
                      fontSize: "0.9rem", fontWeight: 700, transition: "all 0.2s",
                      display: "flex", justifyContent: "space-between", alignItems: "center"
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.borderColor = "var(--black)")}
                    onMouseOut={(e) => (e.currentTarget.style.borderColor = "#eee")}
                  >
                    <span>{p.name_ar}</span>
                    <span style={{ color: "#999", fontSize: "0.7rem" }}>#{p.id.slice(0, 6)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Gallery */}
      {history.length > 0 && (
        <div style={{ marginTop: "4rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 900, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>📂</span> أرشيف صور Nano Bana
          </h2>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
            gap: "1.5rem" 
          }}>
            {history.map((img) => (
              <div key={img.id} style={{
                background: "white",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #f0f0f0",
                boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
                position: "relative",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
              }} className="history-card">
                <div style={{ position: "relative", width: "100%", aspectRatio: "1/1" }}>
                  <Image src={img.image_url} alt="Archived" fill style={{ objectFit: "cover" }} />
                  <div style={{
                    position: "absolute", inset: 0, background: "rgba(0,0,0,0.03)", transition: "opacity 0.2s"
                  }} className="card-overlay" />
                  <button 
                    onClick={() => handleDelete(img.id)}
                    style={{
                      position: "absolute", top: "10px", right: "10px",
                      width: "32px", height: "32px", borderRadius: "50%",
                      background: "rgba(255,255,255,0.9)", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      zIndex: 10
                    }}
                    title="حذف"
                  >
                    🗑️
                  </button>
                </div>
                <div style={{ padding: "15px" }}>
                  <div style={{ 
                    display: "flex", justifyContent: "space-between", alignItems: "center", 
                    marginBottom: "12px", borderBottom: "1px solid #f5f5f5", paddingBottom: "8px" 
                  }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#999" }}>
                      {new Date(img.created_at).toLocaleDateString('ar-DZ')}
                    </span>
                    <span style={{ background: "#f5f5f5", padding: "2px 8px", borderRadius: "4px", fontSize: "0.65rem", fontWeight: 900 }}>
                      4K READY
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <button 
                      onClick={() => {
                        setResultImage(img.image_url);
                        setAiAnalysis(img.analysis);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        height: "36px", borderRadius: "8px",
                        background: "var(--black)", color: "white", border: "none", fontWeight: 700,
                        fontSize: "0.75rem", cursor: "pointer"
                      }}
                    >
                      عرض
                    </button>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(img.image_url);
                        alert("تم نسخ رابط الصورة");
                      }}
                      style={{
                        height: "36px", borderRadius: "8px",
                        background: "#f0f2f5", color: "#666", border: "none", fontWeight: 700,
                        fontSize: "0.75rem", cursor: "pointer"
                      }}
                    >
                      نسخ الرابط
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        .history-card:hover {
          transform: translateY(-5px);
        }
      `}</style>
    </div>
  );
}
